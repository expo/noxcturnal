import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'async method precedes sync method',
    object: `get [Symbol.asyncIterator](){events.push('async');return function(){events.push(this===iterable?'receiver':'wrong');return iterator(1);};},get [Symbol.iterator](){throw sentinel;}`,
    native: [[1], ['async', 'receiver'], null],
  },
  {
    name: 'null async method falls back to sync',
    object: `get [Symbol.asyncIterator](){events.push('async');return null;},get [Symbol.iterator](){events.push('sync');return function(){events.push(this===iterable?'receiver':'wrong');return iterator(Promise.resolve(2));};}`,
    native: [[2], ['async', 'sync', 'receiver'], null],
  },
  {
    name: 'throwing async getter prevents fallback',
    object: `get [Symbol.asyncIterator](){events.push('async');throw sentinel;},get [Symbol.iterator](){events.push('sync');return ()=>iterator(2);}`,
    native: [[], ['async'], 'sentinel'],
  },
  {
    name: 'noncallable async method prevents fallback',
    object: `get [Symbol.asyncIterator](){events.push('async');return 1;},get [Symbol.iterator](){events.push('sync');return ()=>iterator(2);}`,
    native: [[], ['async'], 'TypeError'],
  },
  {
    name: 'legacy async string-key extension',
    object: `'@@asyncIterator'(){events.push('legacy');return iterator(3);}`,
    native: [[], [], 'TypeError'],
    adopted: [[3], ['legacy'], null],
  },
  {
    name: 'legacy sync string-key extension',
    object: `'@@iterator'(){events.push('legacy');return iterator(Promise.resolve(4));}`,
    native: [[], [], 'TypeError'],
    adopted: [[4], ['legacy'], null],
  },
];
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const mode of ['inline', 'runtime'] as const)
  for (const entry of cases)
    test(`${entry.name}, ${mode}`, async () => {
      const source = `globalThis.result=(async()=>{const events=[],values=[],sentinel={};function iterator(value){let done=false;return{next(){if(done)return{done:true};done=true;return{done:false,value};}};}const iterable={${entry.object}};let error=null;try{for await(const value of iterable)values.push(value);}catch(caught){error=caught===sentinel?'sentinel':caught.name;}return[values,events,error];})();`;
      expect(await run(source)).toEqual(entry.native);
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
      expect(await run(reference)).toEqual(entry.adopted ?? entry.native);
      const code = compile(source, {
        transforms: { asyncGeneratorFunctions: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/for\s+await/);
      expect(await run(code)).toEqual(entry.adopted ?? entry.native);
    });
