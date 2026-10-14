import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'separate class evaluations isolate private brands',
    native: [true, false],
    babel: [true, false],
    localFailure: true,
    source: `function make(){return class {#value=3;static has(object){return #value in object}}}const First=make(),Second=make();globalThis.result=[First.has(new First()),First.has(new Second())];`,
  },
  {
    name: 'private methods share identity across instances',
    native: true,
    babel: true,
    localFailure: true,
    source: `class Value{#method(){} expose(){return this.#method}}globalThis.result=new Value().expose()===new Value().expose();`,
  },
  {
    name: 'private methods are installed before fields',
    native: 3,
    babel: 3,
    localFailure: true,
    source: `class Value{field=this.#method();#method(){return 3}}try{globalThis.result=new Value().field}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'invalid private write evaluates its RHS',
    native: ['rhs', 'TypeError'],
    babel: ['TypeError'],
    localFailure: false,
    source: `const events=[];class Value{#field;static write(object){try{object.#field=(events.push('rhs'),2)}catch(e){events.push(e.name)}}}Value.write({});globalThis.result=events;`,
  },
  {
    name: 'private stamping rejects repeated initialization',
    native: 'TypeError',
    babel: 'accepted',
    localFailure: false,
    source: `class Base{constructor(object){return object}}class Stamp extends Base{#value=1}const object={};new Stamp(object);try{new Stamp(object);globalThis.result='accepted'}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'setter-only private access rejects reads',
    native: 'TypeError',
    babel: undefined,
    localFailure: false,
    source: `class Value{set #value(value){}run(){try{return this.#value}catch(e){return e.name}}}globalThis.result=new Value().run();`,
  },
  {
    name: 'private callee is fetched before arguments',
    native: 1,
    babel: 1,
    localFailure: true,
    source: `class Value{#method=()=>1;run(){return this.#method(this.#method=()=>2)}}globalThis.result=new Value().run();`,
  },
  {
    name: 'read-only private method writes retain RHS effects',
    native: ['rhs', 'TypeError'],
    babel: ['rhs', 'TypeError'],
    localFailure: true,
    source: `const events=[];class Value{#method(){}run(){try{this.#method=(events.push('rhs'),1)}catch(e){events.push(e.name)}}}new Value().run();globalThis.result=events;`,
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
        plugins: [
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
        transforms: { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      const classSyntax =
        /\bclass\s+(?:Value|Example|Base|Child|Other|Stamp)\b|\bclass\s*\{|#(?:value|method|field)\b/;
      expect(entry.source).toMatch(classSyntax);
      expect(referenceCode).not.toMatch(classSyntax);
      expect(code).not.toMatch(classSyntax);
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
    });
    test('Babel loose-private reference', () => {
      expect(run(referenceCode)).toEqual(entry.babel);
    });
    const check = test;
    check('Noxcturnal follows the Babel loose-private baseline', () => {
      expect(run(code)).toEqual(entry.babel);
    });
  });
});
