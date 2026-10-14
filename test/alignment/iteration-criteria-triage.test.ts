import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// Native differences remain in compliance; these compare adopted Babel behavior.
const cases = [
  {
    name: 'for-of does not close the iterator when the step value getter throws',
    source: `
      const events = [];
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() {
              return {
                done: false,
                get value() {
                  events.push('value');
                  throw new Error('fail');
                },
              };
            },
            return() {
              events.push('return');
              return {};
            },
          };
        },
      };
      try {
        for (const value of iterable) {
        }
      } catch (e) {
        events.push(e.message);
      }
      globalThis.result = events;
    `,
    async: false,
    expected: ['value', 'return', 'fail'],
  },
  {
    name: 'for-await captures the next method once',
    source: `
      globalThis.result = (async () => {
        const events = [];
        let i = 0;
        const iterable = {
          [Symbol.asyncIterator]() {
            return {
              get next() {
                events.push('get');
                return async () => ({ value: ++i, done: i > 2 });
              },
            };
          },
        };
        const values = [];
        for await (const value of iterable) values.push(value);
        return [events, values];
      })();
    `,
    async: true,
    expected: [
      ['get', 'get', 'get'],
      [1, 2],
    ],
  },
  {
    name: 'for-await reads the return method once when closing',
    source: `
      globalThis.result = (async () => {
        const events = [];
        const iterable = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return Promise.resolve({ value: 1, done: false });
              },
              get return() {
                events.push('get');
                return async function () {
                  events.push('call');
                  return {};
                };
              },
            };
          },
        };
        for await (const value of iterable) break;
        return events;
      })();
    `,
    async: true,
    expected: ['get', 'get', 'call'],
  },
  {
    name: 'for-await treats null synchronous return as absent',
    source: `
 const source={[Symbol.iterator](){return{next(){return{value:1,done:false};},return:null};}};
 globalThis.result=(async()=>{try{for await(const value of source)break;return 'complete';}catch(error){return error.name;}})();
    `,
    async: true,
    expected: 'TypeError',
  },
  {
    name: 'for-await does not close after async value getter throws',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({done:false,get value(){events.push('get:value');throw new Error('value');}});},return(){events.push('return');return Promise.resolve({done:true});}};}};
 globalThis.result=(async()=>{try{for await(const value of source)void value;}catch(error){events.push(error.message);}return events;})();
    `,
    async: true,
    expected: ['get:value', 'return', 'value'],
  },
];
describe.each(cases)('$name', entry => {
  test.each(['inline', 'runtime'] as const)('%s helper compatibility', async mode => {
    const code = compile(entry.source, {
      transforms: entry.async
        ? { asyncGeneratorFunctions: true, asyncFunctions: true }
        : { forOf: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    const plugins = entry.async ? ['async-generator-functions', 'async-to-generator'] : ['for-of'];
    const reference = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        ...plugins.map(plugin => [require('@babel/plugin-transform-' + plugin), {}]),
        ...(mode === 'runtime'
          ? [
              [
                require('@babel/plugin-transform-runtime'),
                { version: '7.29.7', useESModules: false },
              ],
            ]
          : []),
      ],
    });
    expect(reference?.code).toBeTypeOf('string');
    expect(code).not.toMatch(/for\s*(?:await\s*)?\([^;]*\bof\b/);
    if (entry.async && mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    if (mode === 'inline') expect(code).not.toContain('require(');
    for (const output of [reference!.code!, code]) {
      const context: Record<string, unknown> = {};
      new Function('require', 'globalThis', output)(require, context);
      expect(await context.result).toEqual(entry.expected);
    }
  });
});
