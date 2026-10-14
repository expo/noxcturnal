import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const source = `const events: string[] = []; class Base {} class Value extends Base { constructor(public value = 3) { try { super(); } finally { events.push('finally'); } } } const value = new Value(); globalThis.result = [value.value, events];`;
// Explicit erasure places the parameter-property assignment after successful super.
const control = `const events = []; class Base {} class Value extends Base { value; constructor(value = 3) { try { super(); this.value = value; } finally { events.push('finally'); } } } const value = new Value(); globalThis.result = [value.value, events];`;
const expected = [3, ['finally']];
function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
test('explicit erased JavaScript control', () => {
  expect(run(control)).toEqual(expected);
});
test('TypeScript ES2022 reference accepts and executes the source', () => {
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    useDefineForClassFields: true,
    types: [],
    noEmit: true,
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (file, ...args) =>
    file === '/probe.ts'
      ? ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true)
      : getSourceFile(file, ...args);
  const program = ts.createProgram(['/probe.ts'], options, host);
  expect(ts.getPreEmitDiagnostics(program).map(item => item.code)).toEqual([]);
  const output = ts.transpileModule(source, { compilerOptions: options }).outputText;
  expect(run(output)).toEqual(expected);
});
describe.each(['inline', 'runtime'] as const)('%s', mode => {
  test('Babel TypeScript reference', () => {
    const output = transformSync(source, {
      configFile: false,
      babelrc: false,
      filename: 'input.ts',
      sourceType: 'script',
      plugins: [
        [require('@babel/plugin-transform-typescript'), { allowDeclareFields: true }],
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
    expect(output).not.toMatch(/\bpublic\b|: string\[\]/);
    expect(run(output)).toEqual(expected);
  });
  describe.each([false, true])('class lowering: %s', classes => {
    let output: string;
    let actual: unknown;
    beforeAll(() => {
      output = compile(
        source,
        {
          typescript: 'strip',
          transforms: { classes },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        },
        'input.ts',
      );
      expect(output).not.toMatch(/\bpublic\b|: string\[\]/);
      if (classes) expect(output).not.toMatch(/\bclass\s+(?:Value|Base)\b/);
      else expect(output).toMatch(/\bclass\s+Value\b/);
      try {
        actual = run(output);
      } catch (error) {
        expect((error as Error).name).toBe(classes ? 'TypeError' : 'ReferenceError');
        actual = { error: (error as Error).name };
      }
    });
    test.fails('parameter property initializes after successful nested super', () => {
      expect(actual).toEqual(expected);
    });
  });
});
