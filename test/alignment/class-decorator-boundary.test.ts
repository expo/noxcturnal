import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'deferred named-class heritage closure follows the shared environment limitation',
    source: `let read; const Value = 'outer'; const C = class Value extends (read = () => Value, Object) {}; globalThis.result = read() === C;`,
    decorator: false,
    native: true,
    baseline: false,
  },
  {
    name: 'heritage closure assignment follows the shared inner-binding limitation',
    source: `let write; let Value = 'outer'; const C = class Value extends (write = () => { Value = 3; }, Object) {}; let error; try { write(); } catch (caught) { error = caught.name; } globalThis.result = [error, Value];`,
    decorator: false,
    native: ['TypeError', 'outer'],
    baseline: [undefined, 3],
  },
  {
    name: 'deferred named-class key closure follows the shared environment limitation',
    source: `let read; const Value = 'outer'; const C = class Value { [(read = () => Value, 'x')]() {} }; globalThis.result = read() === C;`,
    decorator: false,
    native: true,
    baseline: false,
  },
  {
    name: 'computed literal decorator-helper properties remain user references',
    source: `const babelHelpers = { decorate() { return 'user'; }, decorateParam() { return 'parameter'; } }; function dec(C) { return C; } @dec class Value {} globalThis.result = [babelHelpers['decorate'](), babelHelpers['decorateParam']()];`,
    decorator: true,
    native: ['user', 'parameter'],
    baseline: ['user', 'parameter'],
  },
  {
    name: 'dynamic decorator-helper property remains a user reference',
    source: `const babelHelpers = { decorate() { return 'user'; } }; const key = 'decorate'; function dec(C) { return C; } @dec class Value {} globalThis.result = babelHelpers[key]();`,
    decorator: true,
    native: 'user',
    baseline: 'user',
  },
];
function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each(cases)('$name', entry => {
  test('native control (identity decorator removed where applicable)', () => {
    expect(run(entry.source.replace('@dec ', ''))).toEqual(entry.native);
  });
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let reference: string;
    let output: string;
    beforeAll(() => {
      reference = transformSync(entry.source, {
        babelrc: false,
        configFile: false,
        sourceType: 'script',
        plugins: [
          ...(entry.decorator
            ? [[require('@babel/plugin-proposal-decorators'), { legacy: true }]]
            : [require('@babel/plugin-transform-classes')]),
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
      output = compile(entry.source, {
        transforms: entry.decorator ? { legacyDecorators: true } : { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      const syntax = entry.decorator ? /@dec\b/ : /\bclass\s+Value\b/;
      expect(entry.source).toMatch(syntax);
      expect(reference).not.toMatch(syntax);
      expect(output).not.toMatch(syntax);
    });
    test('Babel reference', () => {
      expect(run(reference)).toEqual(entry.baseline);
    });
    test('Noxcturnal preserves the reference boundary', () => {
      expect(run(output)).toEqual(entry.baseline);
    });
  });
});
