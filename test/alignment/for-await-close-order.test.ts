import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'head setter error wins over closing getter error',
    closing: `get return(){log.push('get:return');throw closeError;}`,
    body: `const box={set value(x){log.push('set');throw headError;}};for await(box.value of iterable){log.push('body');}`,
    expected: ['next', 'set', 'get:return', 'head'],
  },
  {
    name: 'break exposes closing getter error',
    closing: `get return(){log.push('get:return');throw closeError;}`,
    body: `for await(const x of iterable){log.push('body');break;}`,
    expected: ['next', 'body', 'get:return', 'close'],
  },
  {
    name: 'closing rejection overrides function return',
    closing: `async return(){log.push('return');await 0;log.push('reject');throw closeError;}`,
    body: `async function read(){for await(const x of iterable){log.push('body');return 'value';}}log.push(await read());`,
    expected: ['next', 'body', 'return', 'reject', 'close'],
  },
  {
    name: 'continue ancestor awaits each closing call',
    closing: `async return(){log.push('return');await 0;log.push('closed');return {done:true};}`,
    body: `outer:for(let i=0;i<2;i++){log.push(i);for await(const x of iterable){log.push('body');continue outer;}}log.push('end');`,
    expected: [0, 'next', 'body', 'return', 'closed', 1, 'next', 'body', 'return', 'closed', 'end'],
  },
];
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const mode of ['inline', 'runtime'] as const)
  for (const entry of cases) {
    test(`${entry.name}, ${mode}`, async () => {
      const source = `globalThis.result=(async()=>{const log=[];const headError={},closeError={};const iterable={ [Symbol.asyncIterator](){return {async next(){log.push('next');return {done:false,value:1};},${entry.closing}}}};try{${entry.body}}catch(error){log.push(error===headError?'head':error===closeError?'close':'unexpected');}return log;})();`;
      expect(await run(source)).toEqual(entry.expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-async-generator-functions'),
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
        transforms: { asyncGeneratorFunctions: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/for\s+await/);
      expect(await run(code)).toEqual(entry.expected);
    });
  }
