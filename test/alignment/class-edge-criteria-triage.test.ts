import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'heritage expression strictness',
    native: 'TypeError',
    babel: 'accepted',
    localFailure: false,
    source: `const target=Object.freeze({value:1});try{class Value extends ((target.value=2),Object){}globalThis.result='accepted'}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'named class heritage inner TDZ',
    native: 'ReferenceError',
    babel: 'success',
    localFailure: false,
    source: `let Base=class {};try{const C=class Base extends Base {};globalThis.result='success'}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'static field calls later private method',
    native: 3,
    babel: 3,
    localFailure: true,
    source: `class Value{static result=this.#read();static #read(){return 3}}globalThis.result=Value.result;`,
  },
  {
    name: 'static field reads later private accessor',
    native: 3,
    babel: 3,
    localFailure: true,
    source: `class Value{static result=this.#read;static get #read(){return 3}}globalThis.result=Value.result;`,
  },
  {
    name: 'static private brands isolate class evaluations',
    native: [true, false],
    babel: [true, false],
    localFailure: true,
    source: `function make(){return class {static #value=3;static has(object){return #value in object}}}const First=make(),Second=make();globalThis.result=[First.has(First),First.has(Second)];`,
  },
  {
    name: 'instance field reads later private accessor',
    native: 3,
    babel: 3,
    localFailure: true,
    source: `class Value{result=this.#read;get #read(){return 3}}globalThis.result=new Value().result;`,
  },
];

function run(code: string) {
  const context: Record<string, unknown> = {};
  try {
    new Function('require', 'globalThis', code)(require, context);
  } catch (error) {
    return { error: (error as Error).name };
  }
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
    const check = entry.localFailure ? test.fails : test;
    check('Noxcturnal follows the Babel loose-private baseline', () => {
      expect(run(code)).toEqual(entry.babel);
    });
  });
});
