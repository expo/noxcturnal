import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'readonly private update coerces before rejecting the write',
    source: `const events=[];class C{#method(){}run(){this.#method.valueOf=()=>{events.push('convert');return 1n};try{this.#method++}catch(e){events.push(e.name)}}}new C().run();globalThis.result=events;`,
    expected: ['convert', 'TypeError'],
    // Node 22/24 omit conversion too; the spec and pinned Babel are the oracle here.
    native: ['TypeError'],
  },
  {
    name: 'private loop assignment uses the private setter',
    source: `const events=[];class C{set #value(v){events.push(v)}run(){for(this.#value of [1,2]){events.push('body')}}}new C().run();globalThis.result=events;`,
    expected: [1, 'body', 2, 'body'],
  },
  {
    name: 'private object-pattern assignment preserves receiver and default order',
    source: `const events=[];class C{set #value(v){events.push(v)}self(){events.push('receiver');return this}run(){({value:this.self().#value=(events.push('default'),3)}={get value(){events.push('get');return undefined}})}}new C().run();globalThis.result=events;`,
    expected: ['receiver', 'get', 'default', 3],
  },
  {
    name: 'parenthesized private call captures callee before arguments',
    source: `class C{#fn=()=>1;run(){return (this.#fn)(this.#fn=()=>2)}}globalThis.result=new C().run();`,
    expected: 1,
  },
  {
    name: 'tagged private getter captures receiver and callee before substitution',
    source:
      "const events=[];class C{#value=1;get #tag(){events.push('get');return function(){return this.#value}}run(){return this.#tag`${(events.push('sub'),0)}`}}globalThis.result=[new C().run(),events];",
    expected: [1, ['get', 'sub']],
  },
  {
    name: 'construction through private getter preserves lookup order',
    source: `const events=[];class C{get #ctor(){events.push('get');return class{constructor(v){events.push('new');this.value=v}}}run(){return new this.#ctor((events.push('arg'),3)).value}}globalThis.result=[new C().run(),events];`,
    expected: [3, ['get', 'arg', 'new']],
  },
  {
    name: 'destructured private setter closes iterator on abrupt completion',
    source: `const events=[];const values={[Symbol.iterator](){return{next(){events.push('next');return{value:3,done:false}},return(){events.push('close');return{done:true}}}}};class C{set #value(v){events.push(v);throw new Error('stop')}run(){try{[this.#value]=values}catch(e){events.push(e.message)}}}new C().run();globalThis.result=events;`,
    expected: ['next', 3, 'close', 'stop'],
  },
  {
    name: 'readonly private destructuring evaluates source before error',
    source: `const events=[];class C{#method(){}run(){try{[this.#method]=[(events.push('source'),1)]}catch(e){events.push(e.name)}}}new C().run();globalThis.result=events;`,
    expected: ['source', 'TypeError'],
  },
  {
    name: 'private BigInt prefix and postfix updates preserve values',
    source: `class C{#value=1n;run(){return [this.#value++,++this.#value,this.#value].map(String)}}globalThis.result=new C().run();`,
    expected: ['1', '3', '3'],
  },
];
function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
for (const classes of [false, true]) {
  for (const mode of ['inline', 'runtime'] as const) {
    describe.each(cases)(`$name: classes=${classes}, ${mode}`, entry => {
      let actual: unknown;
      beforeAll(() => {
        expect(run(entry.source)).toEqual(entry.native ?? entry.expected);
        const reference = transformSync(entry.source, {
          configFile: false,
          babelrc: false,
          sourceType: 'script',
          plugins: [
            [require('@babel/plugin-transform-private-methods'), { loose: true }],
            [require('@babel/plugin-transform-class-properties'), { loose: true }],
            ...(classes ? [[require('@babel/plugin-transform-classes'), {}]] : []),
            ...(mode === 'runtime'
              ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
              : []),
          ],
        })!.code!;
        expect(run(reference)).toEqual(entry.expected);
        const code = compile(entry.source, {
          transforms: classes
            ? { classes: true }
            : { privateMethods: true, classProperties: { loose: true } },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toMatch(/#(?:fn|value|tag|ctor|method)\b/);
        actual = run(code);
      });
      test('preserves native and loose Babel operation behavior', () =>
        expect(actual).toEqual(entry.expected));
    });
  }
}
