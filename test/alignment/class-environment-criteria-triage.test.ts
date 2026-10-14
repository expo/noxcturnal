import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'base field preserves outer parameter binding',
    native: 'outer',
    babel: 'outer',
    localFailure: true,
    source: `const value='outer';class Example{field=value;constructor(value){}}globalThis.result=new Example('parameter').field;`,
  },
  {
    name: 'class key expression preserves strictness',
    native: 'TypeError',
    babel: 'accepted',
    localFailure: false,
    source: `const target=Object.freeze({value:1});try{class Example{[(target.value=2)](){}}globalThis.result='accepted'}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'named class key retains inner TDZ',
    native: 'ReferenceError',
    babel: 'accepted',
    localFailure: false,
    source: `const Value='outer';try{const C=class Value{[Value](){}};globalThis.result='accepted'}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'method parameter default super property',
    native: 3,
    babel: 3,
    localFailure: true,
    source: `class Base{get value(){return 3}}class Value extends Base{run(value=super.value){return value}}globalThis.result=new Value().run();`,
  },
  {
    name: 'implicit base class super property',
    native: '[object Object]',
    babel: '[object Object]',
    localFailure: true,
    source: `class Value{run(){return super.toString()}}globalThis.result=new Value().run();`,
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

// The reference uses strict class lowering and strict public-field definitions.
// Shared deviations record compatibility limits; differing failures remain candidates.
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
          [require('@babel/plugin-transform-class-properties'), { loose: false }],
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
      if (
        mode === 'runtime' &&
        ![
          'base field preserves outer parameter binding',
          'class key expression preserves strictness',
          'named class key retains inner TDZ',
        ].includes(entry.name)
      )
        expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
    });
    test('Babel strict-class reference', () => {
      expect(run(referenceCode)).toEqual(entry.babel);
    });
    const check = entry.localFailure ? test.fails : test;
    check(
      entry.localFailure
        ? 'Noxcturnal native discrepancy'
        : 'Noxcturnal shares the Babel limitation',
      () => {
        expect(run(code)).toEqual(entry.localFailure ? entry.native : entry.babel);
      },
    );
  });
});
