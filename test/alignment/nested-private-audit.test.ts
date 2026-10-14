import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'computed key closure retains private environment',
    expected: 3,
    source: `let read;class Value{#value=3;[(read=object=>object.#value,'key')](){}}globalThis.result=read(new Value());`,
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
          [require('@babel/plugin-transform-class-static-block'), {}],
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
        /\bclass\s+(?:Value|Example|Base|Child|Other|Stamp|Inner)\b|\bclass\s*\{|#(?:value|method|field)\b/;
      expect(entry.source).toMatch(classSyntax);
      expect(referenceCode).not.toMatch(classSyntax);
      expect(code).not.toMatch(classSyntax);
      if (mode === 'runtime') {
        expect(code).toContain('@babel/runtime/helpers/');
      }
    });
    test('Babel loose-private reference', () => {
      expect(run(referenceCode)).toEqual(entry.expected);
    });
    const check = test.fails;
    check('Noxcturnal follows the Babel loose-private baseline', () => {
      expect(run(code)).toEqual(entry.expected);
    });
  });
});
