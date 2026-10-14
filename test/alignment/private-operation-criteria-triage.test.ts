import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'private logical default receiver lifetime',
    native: [3, 3],
    babel: [0, 3],
    localFailure: false,
    source: `let recurse=true,second;class Value{constructor(){this.stored=0}self(){return this}get #value(){if(recurse){recurse=false;Value.write(second)}return 0}set #value(value){this.stored=value}static write(obj,value=(obj.self().#value ||= 3)){return value}}const first=new Value();second=new Value();Value.write(first);globalThis.result=[first.stored,second.stored];`,
  },
  {
    name: 'private method compound RHS coercion',
    native: ['rhs', 'convert', 'TypeError'],
    babel: ['rhs', 'convert', 'TypeError'],
    localFailure: true,
    source: `const events=[];class Value{#method(){}run(){this.#method.valueOf=()=>{events.push('convert');return 1};try{this.#method+=(events.push('rhs'),2)}catch(e){events.push(e.name)}}}new Value().run();globalThis.result=events;`,
  },
  {
    name: 'private method logical short circuit',
    native: true,
    babel: true,
    localFailure: true,
    source: `class Value{#method(){}run(){return (this.#method ||= 3)===this.#method}}try{globalThis.result=new Value().run()}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'private call own apply',
    native: 'method',
    babel: 'method',
    localFailure: true,
    source: `class Value{#method(){return 'method'}run(){this.#method.apply=()=> 'override';return this.#method()}}globalThis.result=new Value().run();`,
  },
  {
    name: 'private noncallable with apply',
    native: 'TypeError',
    babel: 'TypeError',
    localFailure: true,
    source: `class Value{#field={apply(){return 'called'}};run(){try{return this.#field()}catch(e){return e.name}}}globalThis.result=new Value().run();`,
  },
  {
    name: 'direct eval private environment',
    native: 3,
    babel: 'SyntaxError',
    localFailure: false,
    source: `class Value{#value=3;read(){try{return eval('this.#value')}catch(e){return e.name}}}globalThis.result=new Value().read();`,
  },
  {
    name: 'direct eval super environment',
    native: 3,
    babel: 'SyntaxError',
    localFailure: false,
    source: `class Base{get value(){return 3}}class Child extends Base{read(){try{return eval('super.value')}catch(e){return e.name}}}globalThis.result=new Child().read();`,
  },
  {
    name: 'private logical receiver mutation',
    native: ['first', 3],
    babel: ['first', 3],
    localFailure: true,
    source: `const events=[];let receiver;class Value{constructor(name){this.name=name}get #value(){receiver=second;return 0}set #value(value){events.push(this.name,value)}static write(){return receiver.#value ||= 3}}const first=new Value('first'),second=new Value('second');receiver=first;Value.write();globalThis.result=events;`,
  },
];

function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

// Loose private storage is the selected reference; classes remain strict.
// Compile before test.fails so transformation errors cannot satisfy a regression.
describe.each(cases)('$name', entry => {
  test('native control', () => {
    expect(run(entry.source)).toEqual(entry.native);
  });
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let referenceCode: string;
    let code: string;
    beforeAll(() => {
      const reference = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: entry.name.startsWith('private logical')
          ? [require('@babel/plugin-transform-logical-assignment-operators')]
          : [
              [require('@babel/plugin-transform-class-properties'), { loose: true }],
              [require('@babel/plugin-transform-private-methods'), { loose: true }],
              [require('@babel/plugin-transform-private-property-in-object'), { loose: true }],
              [require('@babel/plugin-transform-classes'), {}],
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
      referenceCode = reference!.code!;
      code = compile(entry.source, {
        transforms: entry.name.startsWith('private logical')
          ? { logicalAssignmentOperators: true }
          : { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      if (entry.name === 'private call own apply') {
        expect(run(entry.source)).toBe('method');
        expect(run(referenceCode)).toBe('method');
        expect(run(code)).toBe('method');
      }
      if (entry.name.startsWith('private logical')) {
        expect(referenceCode).not.toContain('||=');
        expect(code).not.toContain('||=');
      } else {
        const syntax = /\bclass\s+(?:Value|Base|Child)\b/;
        expect(entry.source).toMatch(syntax);
        expect(referenceCode).not.toMatch(syntax);
        expect(code).not.toMatch(syntax);
        if (mode === 'runtime' && entry.name !== 'direct eval private environment')
          expect(code).toContain('@babel/runtime/helpers/');
      }
    });
    test('Babel loose-private reference', () => {
      expect(run(referenceCode)).toEqual(entry.babel);
    });
    const check =
      entry.name === 'private logical receiver mutation' && entry.localFailure ? test.fails : test;
    check('Noxcturnal follows the Babel loose-private baseline', () => {
      expect(run(code)).toEqual(entry.babel);
    });
  });
});
