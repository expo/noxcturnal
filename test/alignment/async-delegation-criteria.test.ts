import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// These retain the Babel helper baseline; native controls remain in compliance.
const cases = [
  {
    name: 'async delegation defers throw and return lookup',
    source: `
 const events=[];
 const source={ [Symbol.asyncIterator](){return{
   next(){return Promise.resolve({value:1,done:true});},
   get throw(){events.push('throw');return undefined;},
   get return(){events.push('return');return undefined;}
 };} };
 async function* values(){yield* source;}
 globalThis.result=values().next().then(()=>events);
    `,
    generator: true,
    expected: ['throw', 'return'],
  },
  {
    name: 'async delegation reads done once for yielded result',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({get done(){events.push('done');return false;},get value(){events.push('value');return 3;}});}};}};
 async function* values(){yield* source;}
 globalThis.result=values().next().then(result=>[result.value,result.done,events]);
    `,
    generator: true,
    expected: [3, false, ['done', 'done', 'value']],
  },
  {
    name: 'async delegation reads done once for completed result',
    source: `
 const events=[];const source={[Symbol.asyncIterator](){return{next(){return Promise.resolve({get done(){events.push('done');return true;},get value(){events.push('value');return 3;}});}};}};
 async function* values(){return yield* source;}
 globalThis.result=values().next().then(result=>[result.value,result.done,events]);
    `,
    generator: true,
    expected: [3, true, ['done', 'done', 'value']],
  },
  {
    name: 'async delegation closes when throw method missing',
    source: `
 const events=[];
 const source={ [Symbol.asyncIterator](){return{next(){return Promise.resolve({value:1,done:false});},return(){events.push('return');return Promise.resolve({done:true});}};} };
 async function* values(){yield* source;}
 globalThis.result=(async()=>{const iterator=values();await iterator.next();try{await iterator.throw(new Error('injected'));}catch(error){events.push(error.name);}return events;})();
    `,
    generator: true,
    expected: ['return', 'TypeError'],
  },
];
describe.each(cases)('$name', entry => {
  test.each(['inline', 'runtime'] as const)('%s helper compatibility', async mode => {
    const code = compile(entry.source, {
      transforms: entry.generator ? { asyncGeneratorFunctions: true } : { asyncFunctions: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    const plugin = entry.generator ? 'async-generator-functions' : 'async-to-generator';
    const reference = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        [require('@babel/plugin-transform-' + plugin), {}],
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
    expect(code).not.toMatch(entry.generator ? /async\s+function\s*\*/ : /async\s+function/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    else expect(code).not.toContain('require(');
    for (const output of [reference!.code!, code]) {
      const context: Record<string, unknown> = {};
      new Function('require', 'globalThis', output)(require, context);
      expect(await context.result).toEqual(entry.expected);
    }
  });
});
