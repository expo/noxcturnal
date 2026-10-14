import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'throwing then getter resumes catch',
    body: `try { await {get then(){log.push('get');throw new RangeError('getter');}}; } catch(error){log.push(error.name);return 7;}`,
    expected: ['fulfilled', 7, ['get', 'RangeError']],
  },
  {
    name: 'throwing then method resumes catch',
    body: `try { await {then(){log.push('then');throw new RangeError('method');}}; } catch(error){log.push(error.name);return 7;}`,
    expected: ['fulfilled', 7, ['then', 'RangeError']],
  },
  {
    name: 'first settlement wins despite subsequent rejection and throw',
    body: `const value=await {then(resolve,reject){log.push('then');resolve(7);reject(new Error('late'));resolve(9);throw new Error('later');}};log.push('resumed');return value;`,
    expected: ['fulfilled', 7, ['then', 'resumed']],
  },
  {
    name: 'nested thenable is assimilated before next',
    body: `return await {then(resolve){log.push('outer');resolve({then(inner){log.push('inner');inner(7);}});}};`,
    expected: ['fulfilled', 7, ['outer', 'inner']],
  },
  {
    name: 'rejected await in finally overrides return',
    body: `try{return 7;}finally{log.push('finally');await {then(resolve,reject){reject(new RangeError('override'));}}}`,
    expected: ['rejected', 'RangeError', ['finally']],
  },
  {
    name: 'finally return after suspension overrides throw',
    body: `try{throw new RangeError('original');}finally{log.push('before');await 0;log.push('after');return 7;}`,
    expected: ['fulfilled', 7, ['before', 'after']],
  },
  {
    name: 'returned rejection bypasses local catch',
    body: `try{return {then(resolve,reject){log.push('then');reject(new RangeError('returned'));}};}catch{log.push('caught');return 7;}`,
    expected: ['rejected', 'RangeError', ['then']],
  },
  {
    name: 'return-await rejection enters local catch',
    body: `try{return await {then(resolve,reject){log.push('then');reject(new RangeError('awaited'));}};}catch{log.push('caught');return 7;}`,
    expected: ['fulfilled', 7, ['then', 'caught']],
  },
];
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const entry of cases)
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    const source = `const log=[];async function read(){${entry.body}}globalThis.result=read().then(value=>['fulfilled',value,log],error=>['rejected',error.name,log]);`;
    expect(await run(source)).toEqual(entry.expected);
    const reference = transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [
        require('@babel/plugin-transform-async-to-generator'),
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
    expect(await run(reference)).toEqual(entry.expected);
    const code = compile(source, {
      transforms: { asyncFunctions: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/async\s+function/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    expect(await run(code)).toEqual(entry.expected);
  });
