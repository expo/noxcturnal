import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// These retain the Babel helper baseline; native controls remain in compliance.
const cases = [
  {
    name: 'async function constructability matches Babel',
    source: `
 async function read() { return 1; }
 let result;
 try { new read(); result='constructed'; } catch(error) { result=error.name; }
 globalThis.result=[result,Object.hasOwn(read,'prototype')];
    `,
    generator: false,
    expected: ['constructed', true],
  },
  {
    name: 'async own-then invocation and catch bypass match Babel helpers',
    source: `
 const events=[];
 const promise=Promise.resolve(3);
 promise.then=()=>{events.push('then');throw new Error('override');};
 async function read(){try{return [await promise,events];}catch(error){return [error.message,events];}}
 globalThis.result=read().then(value=>value,error=>['outer:'+error.message,events]);
    `,
    generator: false,
    expected: ['outer:override', ['then']],
  },
  {
    name: 'async generator invalid receiver errors match Babel',
    source: `
 async function* values(){yield 1;}
 globalThis.result=(async()=>{const events=[];const iterator=values();for(const method of ['next','return','throw']){try{const promise=iterator[method].call({});events.push(method+':returned');try{await promise;}catch(error){events.push(error.name);}}catch(error){events.push(method+':sync:'+error.name);}}return events;})();
    `,
    generator: true,
    expected: ['next:sync:TypeError', 'return:sync:TypeError', 'throw:sync:TypeError'],
  },
  {
    name: 'async generator public dispatch matches Babel',
    source: `
 async function* values(){yield 1;}
 globalThis.result=(async()=>{const events=[];const fake={_invoke(){events.push('fake');return Promise.resolve({done:true,value:9});}};try{await values().next.call(fake);events.push('accepted');}catch(error){events.push(error.name);}return events;})();
    `,
    generator: true,
    expected: ['fake', 'accepted'],
  },
  {
    name: 'async generator prototype representation matches Babel',
    source: `
 async function* values(){yield 1;}globalThis.result=Object.getPrototypeOf(values())===values.prototype;
    `,
    generator: true,
    expected: false,
  },
  {
    name: 'async delegation repeated next lookup matches Babel',
    source: `
 const events=[];let index=0;
 const source={ [Symbol.asyncIterator](){return{ get next(){events.push('get');return async()=>({value:++index,done:index>1});} };} };
 async function* values(){yield* source;}
 globalThis.result=(async()=>{const iterator=values();const first=await iterator.next();const last=await iterator.next();return[first.value,last.done,events];})();
    `,
    generator: true,
    expected: [1, true, ['get', 'get']],
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
