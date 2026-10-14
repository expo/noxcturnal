import { transformSync } from '@babel/core';
import typescript from '@babel/plugin-transform-typescript';
import ts from 'typescript';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const options: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  useDefineForClassFields: true,
  types: [],
  noEmit: true,
};
function diagnostics(source: string) {
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (file, ...args) =>
    file === '/probe.ts'
      ? ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true)
      : getSourceFile(file, ...args);
  return ts
    .getPreEmitDiagnostics(ts.createProgram(['/probe.ts'], options, host))
    .map(item => item.code)
    .sort();
}
function observe(code: string) {
  const context: Record<string, unknown> = {};
  try {
    new Function('globalThis', code)(context);
    return context.result;
  } catch (error) {
    return { error: (error as Error).name };
  }
}
let actual: unknown;
beforeAll(() => {
  const source = `
    class Base {}
    class Value extends Base {
      constructor(public value = 3) { if (value) super(); else super(); }
    }
    globalThis.result = [new Value().value, new Value(0).value];
  `;
  const erased = `
    class Base {}
    class Value extends Base {
      value;
      constructor(value = 3) {
        if (value) { super(); this.value = value; }
        else { super(); this.value = value; }
      }
    }
    globalThis.result = [new Value().value, new Value(0).value];
  `;
  expect(diagnostics(source)).toEqual([]);
  expect(observe(erased)).toEqual([3, 0]);
  const babel = transformSync(source, {
    filename: 'input.ts',
    configFile: false,
    babelrc: false,
    plugins: [[typescript, { allowDeclareFields: true }]],
  })!.code!;
  expect(observe(babel)).toEqual([3, 0]);
  const typed = ts.transpileModule(source, { compilerOptions: options }).outputText;
  expect(observe(typed)).toEqual({ error: 'ReferenceError' });
  const nox = compile(source, { typescript: 'strip' }, 'input.ts');
  expect(nox).not.toMatch(/\bpublic\b/);
  expect(nox).not.toContain('@babel/runtime');
  actual = observe(nox);
  expect(actual).toEqual({ error: 'ReferenceError' });
});
test.fails('initializes a parameter property after the selected super branch', () => {
  expect(actual).toEqual([3, 0]);
});
test('excludes the deferred-arrow candidate rejected by TypeScript checking', () => {
  expect(
    diagnostics(`class Base {} class Value extends Base {
    constructor(public value = 3) { const initialize = () => super(); initialize(); }
  }`),
  ).toEqual([2337, 2377]);
});
