import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// Legacy parameter decorators follow TypeScript, not native ECMAScript syntax.
const cases = [
  {
    external: '_decorate',
    source: `function identity(C){return C}@identity class Value{} globalThis.result=_decorate;`,
  },
  {
    external: '_decorateParam',
    source: `function parameter(target,key,index){} class Value{method(@parameter value){}}globalThis.result=_decorateParam;`,
  },
];
function run(code: string, external: string) {
  const context: Record<string, unknown> = {};
  new Function(external, 'globalThis', code)('external', context);
  return context.result;
}
describe.each(cases)('$external external reference', entry => {
  test('TypeScript legacy reference preserves the external value', () => {
    const output = ts.transpileModule(entry.source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
    }).outputText;
    expect(output).not.toMatch(/@(?:identity|parameter)/);
    expect(run(output, entry.external)).toBe('external');
  });
  if (entry.external === '_decorate')
    test('Babel legacy class reference', () => {
      const output = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        plugins: [[require('@babel/plugin-proposal-decorators'), { legacy: true }]],
      })!.code!;
      expect(output).not.toContain('@identity');
      expect(run(output, entry.external)).toBe('external');
    });
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let output: string;
    beforeAll(() => {
      output = compile(
        entry.source,
        {
          transforms: { legacyDecorators: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        },
        'input.ts',
      );
      expect(output).not.toMatch(/@(?:identity|parameter)/);
      // Legacy helpers are the documented custom ABI exception in either mode.
      expect(output).not.toContain('@babel/runtime');
    });
    test.fails('generated helpers preserve the external value', () => {
      expect(run(output, entry.external)).toBe('external');
    });
  });
});
