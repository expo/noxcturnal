import { transformSync } from '@babel/core';
import typescript from '@babel/plugin-transform-typescript';
import blockScoping from '@babel/plugin-transform-block-scoping';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('_E', 'globalThis', `(function(){${code}})();`)('external', context);
  return context.result;
}
describe.each([false, true])('TypeScript enum residual pass, declared collision=%s', declared => {
  let actual: unknown;
  beforeAll(() => {
    const prefix = declared ? 'const _E="external";' : '';
    const source =
      prefix +
      'const values=[]; { enum E { A=1 } values.push(E.A); } { enum E { A=2 } values.push(E.A); } globalThis.result=[values,_E];';
    const oracle =
      prefix +
      'const values=[]; { const E={A:1}; values.push(E.A); } { const E={A:2}; values.push(E.A); } globalThis.result=[values,_E];';
    expect(observe(oracle)).toEqual([[1, 2], 'external']);
    const reference = transformSync(source, {
      filename: 'input.ts',
      configFile: false,
      babelrc: false,
      plugins: [typescript, blockScoping],
    })!.code!;
    expect(observe(reference)).toEqual([[1, 2], 'external']);
    const stripped = compile(source, { typescript: 'strip' }, 'input.ts');
    expect(stripped).not.toMatch(/\benum\b/);
    expect(stripped).toMatch(/\blet E\b/);
    expect(observe(stripped)).toEqual([[1, 2], 'external']);
    const code = compile(
      source,
      { typescript: 'strip', transforms: { blockScoping: true } },
      'input.ts',
    );
    expect(code).not.toMatch(/\b(?:let|const|enum)\b/);
    expect(code).not.toContain('@babel/runtime');
    actual = observe(code);
  });
  test('preserves the external replacement-name binding', () => {
    expect(actual).toEqual([[1, 2], 'external']);
  });
});
