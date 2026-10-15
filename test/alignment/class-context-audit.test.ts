import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'derived constructor body arrow observes final receiver',
    expected: true,
    source: `class Base{constructor(){return {value:3}}}class Value extends Base{constructor(){const read=()=>this;super();this.same=read()===this}}globalThis.result=new Value().same;`,
  },
  {
    name: 'nested class owns field and static receivers before outer super',
    expected: true,
    source: `class Base{}class Value extends Base{constructor(){class Inner{static owner=this;owner=this}super();this.same=Inner.owner===Inner&&new Inner().owner instanceof Inner}}globalThis.result=new Value().same;`,
  },
  {
    name: 'nested computed keys retain the deferred outer receiver',
    expected: true,
    source: `class Base{}class Value extends Base{constructor(){let read;class Inner{[(read=()=>this,'key')](){}}super();this.same=read()===this}}globalThis.result=new Value().same;`,
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

// Compile before test.fails so transformation errors cannot satisfy a regression.
describe.each(cases)('$name', entry => {
  test('native control', () => {
    expect(run(entry.source)).toEqual(entry.expected);
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
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    });
    test('Babel strict class reference', () => {
      expect(run(referenceCode)).toEqual(entry.expected);
    });
    test('Noxcturnal preserves the initialized receiver', () => {
      expect(run(code)).toEqual(entry.expected);
    });
  });
});
