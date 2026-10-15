import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
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
      JSON.parse(execFileSync(nativeNode, ['--eval', runner], { encoding: 'utf8', timeout: 5000 })),
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
          plugins: [require('@babel/plugin-transform-async-generator-functions'), ...helperPlugins],
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
