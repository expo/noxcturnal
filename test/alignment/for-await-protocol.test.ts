import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('for await acquisition', () => {
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
});

describe('for await close order', () => {
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
      expected: [
        0,
        'next',
        'body',
        'return',
        'closed',
        1,
        'next',
        'body',
        'return',
        'closed',
        'end',
      ],
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
});

describe('for await label', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    { name: 'continue outer label', exit: 'continue outer;', expected: [1, 2], broken: true },
    { name: 'continue inner label', exit: 'continue inner;', expected: [1, 2], broken: false },
    { name: 'break outer label', exit: 'break outer;', expected: [1], broken: false },
  ];
  async function run(fn: Function): Promise<unknown> {
    const context: Record<string, unknown> = {};
    fn(require, context);
    return await context.result;
  }
  function parse(code: string): { fn?: Function; error?: SyntaxError } {
    try {
      return { fn: new Function('require', 'globalThis', code) };
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      return { error };
    }
  }
  for (const mode of ['inline', 'runtime'] as const) {
    for (const entry of cases) {
      describe(`${entry.name}, ${mode}`, () => {
        let parseError: unknown;
        let actual: unknown;
        beforeAll(async () => {
          const source = `globalThis.result=(async()=>{const out=[];outer:inner:for await(const x of [1,2]){out.push(x);${entry.exit}}return out;})();`;
          expect(await run(new Function('require', 'globalThis', source))).toEqual(entry.expected);
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
          const babel = parse(reference);
          if (entry.exit.includes('outer')) expect(babel.error).toBeInstanceOf(SyntaxError);
          else {
            expect(babel.error).toBeUndefined();
            expect(await run(babel.fn!)).toEqual(entry.expected);
          }
          const code = compile(source, {
            transforms: { asyncGeneratorFunctions: true },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(code).not.toMatch(/for\s+await/);
          const parsed = parse(code);
          parseError = parsed.error;
          if (parsed.fn) actual = await run(parsed.fn);
        });
        test('preserves the label target', () => {
          expect(parseError).toBeUndefined();
          expect(actual).toEqual(entry.expected);
        });
      });
    }
  }
});

describe('for await scope', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'single if body',
      body: 'if (true) for await (const x of [1,2]) out.push(() => x);',
      expected: [1, 2],
    },
    {
      name: 'single while body',
      body: 'let pass=0; while(pass++<1) for await (const x of [1,2]) out.push(() => x);',
      expected: [1, 2],
    },
    {
      name: 'switch consequent',
      body: 'switch(1){case 1: for await(const x of [1,2]) out.push(()=>x);break;}',
      expected: [1, 2],
    },
    {
      name: 'assignment target setter',
      body: 'const box={set value(x){out.push(()=>x)}};for await(box.value of [1,2]) {}',
      expected: [1, 2],
    },
    {
      name: 'destructured loop binding',
      body: 'for await(const [x] of [[1],[2]]) out.push(()=>x);',
      expected: [1, 2],
    },
    {
      name: 'body binding shadows head',
      body: 'for await(const x of [1,2]) {let x=3;out.push(()=>x);}',
      expected: [3, 3],
    },
    {
      name: 'empty body exhausts iterator',
      body: 'const source={async *[Symbol.asyncIterator](){out.push(()=>1);yield 1;out.push(()=>2);yield 2;out.push(()=>3);}};for await(const x of source) {}',
      expected: [1, 2, 3],
    },
  ];
  async function run(code: string): Promise<unknown> {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return await context.result;
  }
  for (const mode of ['inline', 'runtime'] as const) {
    for (const entry of cases) {
      test(`${entry.name}, ${mode}`, async () => {
        const source = `globalThis.result=(async()=>{const out=[];${entry.body}return out.map(read=>read());})();`;
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
        expect(code).not.toMatch(/for\s+await|async\s*\*/);
        expect(await run(code)).toEqual(entry.expected);
      });
    }
  }
});
