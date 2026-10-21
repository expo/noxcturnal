import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import ts from 'typescript';

describe('resource module order', () => {
  const require = createRequire(import.meta.url);
  const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
  const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
  const cases = [
    {
      name: 'exported function reads live binding after disposal',
      source: `export function read(){return value;} using resource={[Symbol.dispose](){value=9;}};export let value=3;export const before=read();`,
      select: '[m.before,m.value,m.read()]',
      expected: [3, 9, 9],
    },
    {
      name: 'default expression remains a snapshot',
      source: `export let value=3;export default value;using resource={[Symbol.dispose](){value=9;}};`,
      select: '[m.default,m.value]',
      expected: [3, 9],
    },
    {
      name: 'imports and re-exports precede body and cleanup',
      source: `import {log} from './dep.mjs';export {value as forwarded} from './dep.mjs';export * from './dep.mjs';using resource={[Symbol.dispose](){log.push('dispose');}};log.push('body');`,
      select: '[m.forwarded,m.value,m.log]',
      expected: [7, 7, ['dependency', 'body', 'dispose']],
    },
  ];
  function execute(code: string, select: string, executable: string) {
    const directory = mkdtempSync(path.join(process.cwd(), 'node_modules/.resource-module-audit-'));
    try {
      const file = path.join(directory, 'input.mjs');
      writeFileSync(file, code);
      writeFileSync(
        path.join(directory, 'dep.mjs'),
        `export const log=['dependency'];export const value=7;`,
      );
      const runner = `const m=await import(${JSON.stringify(pathToFileURL(file).href)});console.log(JSON.stringify(${select}));`;
      return JSON.parse(
        execFileSync(executable, ['--input-type=module', '--eval', runner], { encoding: 'utf8' }),
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
  for (const entry of cases) {
    test.skipIf(!nativeSupported)(`${entry.name}, native`, () => {
      expect(execute(entry.source, entry.select, nativeNode)).toEqual(entry.expected);
    });
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, mode => {
      const reference = transformSync(entry.source, {
        sourceType: 'module',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-explicit-resource-management'),
          ...(mode === 'runtime'
            ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
            : []),
        ],
      })!.code!;
      const code = compile(
        entry.source,
        { transforms: { explicitResourceManagement: true }, helpers: { mode, version: '7.29.7' } },
        'input.mjs',
      );
      expect(code).not.toMatch(/\busing\s+resource\b/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      for (const output of [reference, code])
        expect(execute(output, entry.select, process.execPath)).toEqual(entry.expected);
    });
  }
});

describe('resource module baseline', () => {
  const require = createRequire(import.meta.url);
  // Native differentials remain in compliance/resources.test.ts. These preserve
  // the scoped Babel baseline without deleting or changing those observations.
  const cases = [
    {
      name: 'using assignment',
      body: `let result;try{resource=undefined;result='accepted';}catch(error){result=error.name;}`,
      expected: 'accepted',
    },
    {
      name: 'exported const assignment',
      body: `export const value=1;let result;try{value=2;result=value;}catch(error){result=error.name;}`,
      expected: 2,
    },
    {
      name: 'let TDZ',
      body: `let result;try{result=typeof value;}catch(error){result=error.name;}let value=1;`,
      expected: 'undefined',
    },
    {
      name: 'class TDZ',
      body: `let result;try{result=typeof Value;}catch(error){result=error.name;}class Value{}`,
      expected: 'undefined',
    },
  ];
  async function run(code: string) {
    const directory = mkdtempSync(
      path.join(process.cwd(), 'node_modules/.resource-module-baseline-'),
    );
    try {
      const file = path.join(directory, 'input.mjs');
      writeFileSync(file, code);
      return (await import(pathToFileURL(file).href)).result;
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
  for (const entry of cases)
    test.each(['inline', 'runtime'] as const)(
      `${entry.name}, %s adopted module baseline`,
      async mode => {
        const source = `using resource=null;${entry.body}export {result};`;
        const reference = transformSync(source, {
          sourceType: 'module',
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-explicit-resource-management'),
            ...(mode === 'runtime'
              ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
              : []),
          ],
        })!.code!;
        const code = compile(
          source,
          {
            transforms: { explicitResourceManagement: true },
            helpers: { mode, version: '7.29.7' },
          },
          'input.mjs',
        );
        expect(code).not.toMatch(/\busing\s+resource\b/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        expect(await run(reference)).toEqual(entry.expected);
        expect(await run(code)).toEqual(entry.expected);
      },
    );
});

describe('resource async module', () => {
  const require = createRequire(import.meta.url);
  const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
  const nativeSupported =
    spawnSync(nativeNode, ['--input-type=module', '--eval', 'await using x=null;']).status === 0;
  const cases = [
    {
      name: 'import waits for disposal',
      body: `await using resource={async [Symbol.asyncDispose](){log.push('dispose:start');await 0;log.push('dispose:end');}};log.push('body');`,
      expected: ['fulfilled', ['body', 'dispose:start', 'dispose:end']],
    },
    {
      name: 'async disposal errors nest around the body error',
      body: `await using first={async [Symbol.asyncDispose](){await 0;log.push('first');throw new Error('first');}};await using second={async [Symbol.asyncDispose](){await 0;log.push('second');throw new Error('second');}};log.push('body');throw new Error('body');`,
      expected: [
        'rejected',
        [
          'SuppressedError',
          ['Error', 'first'],
          ['SuppressedError', ['Error', 'second'], ['Error', 'body']],
        ],
        ['body', 'second', 'first'],
      ],
    },
    {
      name: 'initializer rejection still awaits prior cleanup',
      body: `await using first={async [Symbol.asyncDispose](){await 0;log.push('first');throw new Error('first');}};await using second=await Promise.reject(new Error('initialize'));`,
      expected: [
        'rejected',
        ['SuppressedError', ['Error', 'first'], ['Error', 'initialize']],
        ['first'],
      ],
    },
  ];
  function run(code: string, executable: string) {
    const directory = mkdtempSync(
      path.join(process.cwd(), 'node_modules/.resource-async-module-audit-'),
    );
    try {
      const entry = path.join(directory, 'input.mjs'),
        dependency = path.join(directory, 'dep.mjs');
      writeFileSync(entry, code);
      writeFileSync(dependency, 'export const log=[];');
      const runner = `const {log}=await import(${JSON.stringify(pathToFileURL(dependency).href)});function summarize(error){return error.name==='SuppressedError'?[error.name,summarize(error.error),summarize(error.suppressed)]:[error.name,error.message];}let result;try{await import(${JSON.stringify(pathToFileURL(entry).href)});result=['fulfilled',log];}catch(error){result=['rejected',summarize(error),log];}console.log(JSON.stringify(result));`;
      return JSON.parse(
        execFileSync(executable, ['--input-type=module', '--eval', runner], {
          encoding: 'utf8',
          timeout: 5000,
        }),
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
  for (const entry of cases) {
    const source = `import {log} from './dep.mjs';${entry.body}`;
    test.skipIf(!nativeSupported)(`${entry.name}, native`, () => {
      expect(run(source, nativeNode)).toEqual(entry.expected);
    });
    test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, mode => {
      const reference = transformSync(source, {
        sourceType: 'module',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-explicit-resource-management'),
          ...(mode === 'runtime'
            ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
            : []),
        ],
      })!.code!;
      const code = compile(
        source,
        { transforms: { explicitResourceManagement: true }, helpers: { mode, version: '7.29.7' } },
        'input.mjs',
      );
      expect(code).not.toMatch(/\busing\s+(?:resource|first|second)\b/);
      expect(code).toMatch(/\bawait\b/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      for (const output of [reference, code])
        expect(run(output, process.execPath)).toEqual(entry.expected);
    });
  }
});

describe('resource typescript order', () => {
  const require = createRequire(import.meta.url);
  const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
  const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
  async function run(code: string): Promise<unknown> {
    const dir = mkdtempSync(path.join(process.cwd(), 'node_modules/.resource-ts-audit-'));
    try {
      const file = path.join(dir, 'input.mjs');
      writeFileSync(file, code);
      try {
        const module = await import(pathToFileURL(file).href);
        return ['ok', module.log];
      } catch (error) {
        return ['error', (error as Error).name];
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  for (const kind of ['enum', 'namespace'])
    describe(kind, () => {
      const source = `export const log=[];using resource={[Symbol.dispose](){log.push('dispose');}};log.push('before');${kind === 'enum' ? `export enum E{X=(log.push('enum'),1)}` : `export namespace N{export const x=(log.push('namespace'),1);}`}log.push('after');`;
      const expected = ['before', kind, 'after', 'dispose'];
      const outcomes = new Map<string, unknown>();
      const erased = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
        reportDiagnostics: true,
      });
      beforeAll(async () => {
        expect(erased.diagnostics).toEqual([]);
        for (const mode of ['inline', 'runtime'] as const) {
          const helperPlugin =
            mode === 'runtime'
              ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
              : [];
          const reference = transformSync(source, {
            filename: 'input.ts',
            sourceType: 'module',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-typescript'),
              require('@babel/plugin-transform-explicit-resource-management'),
              ...helperPlugin,
            ],
          })!.code!;
          expect(await run(reference)).toEqual(['error', 'SyntaxError']);
          const babelErased = transformSync(source, {
            filename: 'input.ts',
            sourceType: 'module',
            babelrc: false,
            configFile: false,
            plugins: [require('@babel/plugin-transform-typescript')],
          })!.code!;
          const separated = transformSync(babelErased, {
            sourceType: 'module',
            babelrc: false,
            configFile: false,
            plugins: [
              require('@babel/plugin-transform-explicit-resource-management'),
              ...helperPlugin,
            ],
          })!.code!;
          expect(await run(separated)).toEqual(['ok', expected]);
          for (const parameters of [false, true]) {
            const code = compile(
              source,
              {
                typescript: 'strip',
                transforms: { explicitResourceManagement: true, parameters },
                helpers: { mode, version: '7.29.7' },
              },
              'input.ts',
            );
            expect(code).not.toMatch(/\busing\s+resource\b/);
            expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
            const outcome = await run(code);
            outcomes.set(`${mode}:${parameters}`, outcome);
          }
        }
      });
      test.skipIf(!nativeSupported)('TypeScript erasure preserves native resource order', () => {
        const directory = mkdtempSync(
          path.join(process.cwd(), 'node_modules/.resource-ts-native-'),
        );
        try {
          const file = path.join(directory, 'input.mjs');
          writeFileSync(file, erased.outputText);
          const script = `const m=await import(${JSON.stringify(pathToFileURL(file).href)});console.log(JSON.stringify(m.log));`;
          expect(
            JSON.parse(
              execFileSync(nativeNode, ['--input-type=module', '--eval', script], {
                encoding: 'utf8',
              }),
            ),
          ).toEqual(expected);
        } finally {
          rmSync(directory, { recursive: true, force: true });
        }
      });
      for (const mode of ['inline', 'runtime'])
        for (const parameters of [false, true]) {
          test(`module order, ${mode}, prepass=${parameters}`, () => {
            expect(outcomes.get(`${mode}:${parameters}`)).toEqual(['ok', expected]);
          });
        }
    });
});

describe('resource enum order regressions', () => {
  const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
  const nativeSupported = spawnSync(nativeNode, ['--eval', '{using r=null;}']).status === 0;
  const cases = [
    [
      'numeric and string exports',
      `export enum A{X=(log.push('enum'),2),Y=3,S='text'}log.push(A.X,A.Y,A.S);`,
      ['enum', 2, 3, 'text'],
    ],
    [
      'separate named export',
      `enum A{X=(log.push('enum'),2)}export {A};log.push(A.X);`,
      ['enum', 2],
    ],
    [
      'merged enums',
      `export enum A{X=(log.push('first'),2)}log.push(A.X);export enum A{Y=(log.push('second'),3)}log.push(A.X,A.Y);`,
      ['first', 2, 'second', 2, 3],
    ],
    [
      'default and later resource',
      `export default (log.push('default'),3);export enum A{X=(log.push('enum'),2)}using later={[Symbol.dispose](){log.push('later-dispose')}};`,
      ['default', 'enum', 'later-dispose'],
    ],
    [
      'initializer throws',
      `export enum A{X=(()=>{log.push('enum');throw new RangeError('enum')})()}`,
      ['enum'],
    ],
  ] as const;
  for (const [name, body, effects] of cases) {
    for (const mode of ['native', 'inline', 'runtime'] as const) {
      test.skipIf(mode === 'native' && !nativeSupported)(`${name}, ${mode}`, () => {
        const source = `import {log} from './state.mjs';export {log};log.push('before');using resource={[Symbol.dispose](){log.push('dispose')}};${body}`;
        const reference = ts.transpileModule(source, {
          compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
        }).outputText;
        const code =
          mode === 'native'
            ? reference
            : compile(
                source,
                {
                  typescript: 'strip',
                  transforms: { explicitResourceManagement: true },
                  helpers: { mode, version: '7.29.7' },
                },
                'input.ts',
              );
        if (mode !== 'native') expect(code).not.toMatch(/\b(?:using|enum)\s+(?:resource|A)\b/);
        const dir = mkdtempSync(join(process.cwd(), '.resource-enum-'));
        try {
          writeFileSync(join(dir, 'state.mjs'), 'export const log=[];');
          const run = (code: string) => {
            const file = join(dir, 'input.mjs');
            writeFileSync(file, code);
            const script = `import {log} from ${JSON.stringify(pathToFileURL(join(dir, 'state.mjs')).href)};try{await import(${JSON.stringify(pathToFileURL(file).href)})}catch(e){log.push(e.name)}console.log(JSON.stringify(log));`;
            return JSON.parse(
              execFileSync(
                mode === 'native' ? nativeNode : process.execPath,
                ['--input-type=module', '--eval', script],
                {
                  encoding: 'utf8',
                },
              ),
            );
          };
          const expected = [
            'before',
            ...effects,
            'dispose',
            ...(name === 'initializer throws' ? ['RangeError'] : []),
          ];
          expect(run(code)).toEqual(expected);
        } finally {
          rmSync(dir, { recursive: true, force: true });
        }
      });
    }
  }
});

describe('resource helper emission', () => {
  const require = createRequire(import.meta.url);
  const policies = [
    { mode: 'inline' as const, version: '7.29.7', usingImport: false, asyncImport: false },
    { mode: 'runtime' as const, version: '7.20.0', usingImport: false, asyncImport: true },
    { mode: 'runtime' as const, version: '7.23.8', usingImport: false, asyncImport: true },
    { mode: 'runtime' as const, version: '7.23.9', usingImport: true, asyncImport: true },
    { mode: 'runtime' as const, version: '7.29.7', usingImport: true, asyncImport: true },
    { mode: 'runtime' as const, version: '8.0.0', usingImport: false, asyncImport: false },
  ];
  async function run(code: string) {
    const directory = mkdtempSync(path.join(process.cwd(), 'node_modules/.resource-helper-audit-'));
    try {
      const file = path.join(directory, 'input.mjs');
      writeFileSync(file, code);
      const m = await import(pathToFileURL(file).href);
      return [m.result, m.log];
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
  for (const policy of policies)
    for (const compact of [false, true])
      test(`${policy.mode} ${policy.version}, compact=${compact}`, async () => {
        const source = `const babelHelpers=11,babelHelpersFallback=13,_usingCtx=17;export const log=[];using first={[Symbol.dispose](){log.push('first');}},second={[Symbol.dispose](){log.push('second');}};async function read(){return await (babelHelpers+babelHelpersFallback+_usingCtx);}export const result=await read();`;
        const reference = transformSync(source, {
          sourceType: 'module',
          compact,
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-explicit-resource-management'),
            require('@babel/plugin-transform-async-to-generator'),
            ...(policy.mode === 'runtime'
              ? [[require('@babel/plugin-transform-runtime'), { version: policy.version }]]
              : []),
          ],
        })!.code!;
        const code = compile(
          source,
          {
            compact,
            transforms: { explicitResourceManagement: true, asyncFunctions: true },
            helpers: { mode: policy.mode, version: policy.version },
          },
          'input.mjs',
        );
        expect(code).not.toMatch(/\busing\s+first\b|async\s+function/);
        for (const output of [reference, code]) {
          expect(output.includes('@babel/runtime/helpers/usingCtx')).toBe(policy.usingImport);
          expect(output.includes('@babel/runtime/helpers/asyncToGenerator')).toBe(
            policy.asyncImport,
          );
          expect(await run(output)).toEqual([41, ['second', 'first']]);
        }
      });
});
