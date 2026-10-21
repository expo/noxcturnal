import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('resource body scope', () => {
  const require = createRequire(import.meta.url);
  const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
  const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
  const cases = [
    {
      name: 'static-block disposal precedes later static initialization',
      body: `class C{static{using resource=make(1);this.read=()=>resource.id;log.push('block');}static value=log.push('field');}log.push(C.read());`,
      expected: ['block', 'dispose:1', 'field', 1],
    },
    {
      name: 'nested try disposes before source catch and finally',
      body: `try{using resource=make(1);log.push('body');throw new RangeError();}catch(error){log.push(error.name);}finally{log.push('finally');}`,
      expected: ['body', 'dispose:1', 'RangeError', 'finally'],
    },
    {
      name: 'function-local strict directive survives disposal wrapping',
      body: `function read(){'use strict';using resource=make(1);log.push(this===undefined);return ()=>resource.id;}const readResource=read();log.push(readResource());`,
      expected: [true, 'dispose:1', 1],
      babel: [false, 'dispose:1', 1],
    },
  ];

  for (const entry of cases) {
    const source = `const log=[];const make=id=>({id,[Symbol.dispose](){log.push('dispose:'+id);}});${entry.body}globalThis.result=log;`;
    test.skipIf(!nativeSupported)(`${entry.name}, native`, () => {
      expect(
        JSON.parse(
          execFileSync(
            nativeNode,
            ['--eval', source + ';console.log(JSON.stringify(globalThis.result));'],
            { encoding: 'utf8' },
          ),
        ),
      ).toEqual(entry.expected);
    });
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, mode => {
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-explicit-resource-management'),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ],
      })!.code!;
      const code = compile(source, {
        transforms: { explicitResourceManagement: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/\busing\s+resource\b/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      for (const [output, expected] of [
        [reference, entry.babel ?? entry.expected],
        [code, entry.expected],
      ] as const) {
        const context: Record<string, unknown> = {};
        new Function('require', 'globalThis', output)(require, context);
        expect(context.result).toEqual(expected);
      }
    });
  }
});

describe('resource loop scope', () => {
  const require = createRequire(import.meta.url);
  const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
  const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
  const cases = [
    {
      name: 'body lexical binding shadows resource',
      body: `for(using x of values){const x=9;log.push(x);}`,
      expected: [9, 'dispose:1', 9, 'dispose:2'],
    },
    {
      name: 'non-block body retains each iteration binding',
      body: `const reads=[];for(using x of values)reads.push(()=>x.id);log.push(reads.map(read=>read()));`,
      expected: ['dispose:1', 'dispose:2', [1, 2]],
    },
    {
      name: 'body throw disposes before escaping',
      body: `try{for(using x of values){log.push(x.id);throw new RangeError();}}catch(error){log.push(error.name);}`,
      expected: [1, 'dispose:1', 'RangeError'],
    },
    {
      name: 'labelled continue disposes each inner iteration',
      body: `outer:for(let index=0;index<2;index++){for(using x of values){log.push(x.id);continue outer;}}`,
      expected: [1, 'dispose:1', 1, 'dispose:1'],
    },
  ];
  for (const entry of cases) {
    const source = `const log=[];const values=[1,2].map(id=>({id,[Symbol.dispose](){log.push('dispose:'+id);}}));${entry.body}globalThis.result=log;`;
    test.skipIf(!nativeSupported)(`${entry.name}, native`, () => {
      expect(
        JSON.parse(
          execFileSync(
            nativeNode,
            ['--eval', source + ';console.log(JSON.stringify(globalThis.result));'],
            { encoding: 'utf8' },
          ),
        ),
      ).toEqual(entry.expected);
    });
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, mode => {
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-explicit-resource-management'),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ],
      })!.code!;
      const code = compile(source, {
        transforms: { explicitResourceManagement: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/\busing\s+x\b/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      for (const output of [reference, code]) {
        const context: Record<string, unknown> = {};
        new Function('require', 'globalThis', output)(require, context);
        expect(context.result).toEqual(entry.expected);
      }
    });
  }
});

describe('resource iteration composition', () => {
  const require = createRequire(import.meta.url);
  const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
  const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
  async function run(code: string) {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const kind of ['break', 'errors', 'async disposal', 'for-await']) {
    const asynchronous = kind === 'async disposal' || kind === 'for-await';
    const source = `const log=[];const resource={${asynchronous ? 'async [Symbol.asyncDispose]()' : '[Symbol.dispose]()'}{${asynchronous ? 'await 0;' : ''}log.push('dispose');${kind === 'errors' ? `throw new Error('dispose');` : ''}}};const iterable={[Symbol.iterator](){return{next(){return{value:resource,done:false};},return(){log.push('close');${kind === 'errors' ? `throw new Error('close');` : 'return {done:true};'}}};}};globalThis.result=(async()=>{try{outer:for ${kind === 'for-await' ? 'await ' : ''}(${asynchronous ? 'await using' : 'using'} value of iterable){log.push('body');${kind === 'errors' ? `throw new Error('body');` : 'break outer;'}}}catch(error){log.push(error.name);${kind === 'errors' ? `log.push(error.error?.message,error.suppressed?.message);` : ''}}return log;})();`;
    const expected =
      kind === 'errors'
        ? ['body', 'dispose', 'close', 'SuppressedError', 'dispose', 'body']
        : ['body', 'dispose', 'close'];
    test.skipIf(!nativeSupported)(`${kind}, native`, () => {
      expect(
        JSON.parse(
          execFileSync(
            nativeNode,
            [
              '--eval',
              source +
                `;Promise.resolve(globalThis.result).then(result=>console.log(JSON.stringify(result)),error=>{console.error(error);process.exitCode=1;});`,
            ],
            { encoding: 'utf8', timeout: 5000 },
          ),
        ),
      ).toEqual(expected);
    });
    for (const lower of [false, true])
      test.each(['inline', 'runtime'] as const)(`${kind}, lower=${lower}, %s`, async mode => {
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-explicit-resource-management'),
            ...(lower
              ? [
                  require(
                    kind === 'for-await'
                      ? '@babel/plugin-transform-async-generator-functions'
                      : '@babel/plugin-transform-for-of',
                  ),
                ]
              : []),
            ...(mode === 'runtime'
              ? [
                  [
                    require('@babel/plugin-transform-runtime'),
                    { version: '7.29.7', useESModules: false },
                  ],
                ]
              : []),
          ],
        })!.code!;
        expect(await run(reference)).toEqual(
          asynchronous && !(kind === 'for-await' && lower) ? ['close', 'TypeError'] : expected,
        );
        const code = compile(source, {
          transforms: {
            explicitResourceManagement: true,
            forOf: lower && kind !== 'for-await',
            asyncGeneratorFunctions: lower && kind === 'for-await',
          },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/\busing\s+value\b/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        if (lower)
          expect(code).not.toMatch(
            kind === 'for-await' ? /for\s+await\s*\(/ : /for\s*\([^;]*\bof\b/,
          );
        expect(await run(code)).toEqual(expected);
        if (lower) {
          const iteration = {
            forOf: kind !== 'for-await',
            asyncGeneratorFunctions: kind === 'for-await',
          };
          for (const phases of [
            [{ explicitResourceManagement: true }, iteration],
            [iteration, { explicitResourceManagement: true }],
          ]) {
            let staged = source;
            for (const transforms of phases)
              staged = compile(staged, { transforms, helpers: { mode, version: '7.29.7' } });
            expect(staged).not.toMatch(/\busing\s+value\b/);
            expect(await run(staged)).toEqual(expected);
          }
        }
      });
  }
});

describe('resource suspension composition', () => {
  const require = createRequire(import.meta.url);
  const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
  const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
  const cases = [
    {
      name: 'sync generator return runs finally before disposal',
      kind: 'sync',
      source: `const log=[];function* values(){using resource={[Symbol.dispose](){log.push('dispose');}};try{yield 1;}finally{log.push('finally');}}const iterator=values();globalThis.result=[iterator.next(),iterator.return(9),log];`,
      expected: [{ value: 1, done: false }, { value: 9, done: true }, ['finally', 'dispose']],
    },
    {
      name: 'async disposal precedes yielding outer finally',
      kind: 'generator',
      source: `const log=[];async function* values(){try{await using resource={async [Symbol.asyncDispose](){await 0;log.push('dispose');}};yield 1;}finally{log.push('finally');yield 2;}}globalThis.result=(async()=>{const iterator=values();return [await iterator.next(),await iterator.return(9),await iterator.next(),log];})();`,
      expected: [
        { value: 1, done: false },
        { value: 2, done: false },
        { value: 9, done: true },
        ['dispose', 'finally'],
      ],
    },
    {
      name: 'async disposer failure replaces pending generator return',
      kind: 'generator',
      source: `const log=[];async function* values(){await using resource={async [Symbol.asyncDispose](){await 0;log.push('dispose');throw new Error('dispose');}};yield 1;}globalThis.result=(async()=>{const iterator=values();const first=await iterator.next();let completion;try{completion=await iterator.return(9);}catch(error){completion=[error.name,error.message];}return [first,completion,log];})();`,
      expected: [{ value: 1, done: false }, ['Error', 'dispose'], ['dispose']],
    },
    {
      name: 'async function waits for disposer before returning',
      kind: 'function',
      source: `const log=[];async function read(){await using resource={async [Symbol.asyncDispose](){log.push('dispose:start');await 0;log.push('dispose:end');}};log.push('body');return 3;}const promise=read();log.push('called');globalThis.result=promise.then(value=>[value,log]);`,
      expected: [3, ['body', 'dispose:start', 'called', 'dispose:end']],
    },
  ];
  async function run(code: string) {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const entry of cases) {
    test.skipIf(!nativeSupported)(`${entry.name}, native`, () => {
      const runner =
        entry.source +
        `;Promise.resolve(globalThis.result).then(result=>console.log(JSON.stringify(result)),error=>{console.error(error);process.exitCode=1;});`;
      expect(
        JSON.parse(
          execFileSync(nativeNode, ['--eval', runner], { encoding: 'utf8', timeout: 5000 }),
        ),
      ).toEqual(entry.expected);
    });
    for (const lower of entry.kind === 'sync' ? [false] : [false, true])
      test.each(['inline', 'runtime'] as const)(`${entry.name}, lower=${lower}, %s`, async mode => {
        const plugins = [
          require('@babel/plugin-transform-explicit-resource-management'),
          ...(lower
            ? [
                require(
                  entry.kind === 'generator'
                    ? '@babel/plugin-transform-async-generator-functions'
                    : '@babel/plugin-transform-async-to-generator',
                ),
              ]
            : []),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ];
        const reference = transformSync(entry.source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins,
        })!.code!;
        if (lower && entry.kind === 'generator') {
          expect(() => new Function(reference)).toThrow(SyntaxError);
          const helperPlugins =
            mode === 'runtime'
              ? [
                  [
                    require('@babel/plugin-transform-runtime'),
                    { version: '7.29.7', useESModules: false },
                  ],
                ]
              : [];
          const resources = transformSync(entry.source, {
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-explicit-resource-management'),
              ...helperPlugins,
            ],
          })!.code!;
          const separated = transformSync(resources, {
            sourceType: 'script',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-async-generator-functions'),
              ...helperPlugins,
            ],
          })!.code!;
          expect(separated.includes('@babel/runtime/helpers/usingCtx')).toBe(mode === 'runtime');
          expect(await run(separated)).toEqual(entry.expected);
        } else expect(await run(reference)).toEqual(entry.expected);
        const code = compile(entry.source, {
          transforms: {
            explicitResourceManagement: true,
            asyncFunctions: lower && entry.kind === 'function',
            asyncGeneratorFunctions: lower && entry.kind === 'generator',
          },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/\busing\s+resource\b/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        if (lower)
          expect(code).not.toMatch(
            entry.kind === 'generator' ? /async\s+function\s*\*/ : /async\s+function/,
          );
        expect(await run(code)).toEqual(entry.expected);
      });
  }
});
