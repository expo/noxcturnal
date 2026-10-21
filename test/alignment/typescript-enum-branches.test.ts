import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { transformSync } from '@babel/core';
import transformTypeScript from '@babel/plugin-transform-typescript';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const cases = [
  {
    name: 'qualified enum namespace merge',
    source: `enum E{A=1}namespace E{export const twice=E.A*2}globalThis.result=E.twice;`,
    expected: 2,
  },
  {
    name: 'nested shadowing and member capture',
    source: `enum E{A=1,B=A,C=(()=>{const A=4;return A})(),D=(()=>A)()}globalThis.result=[E.A,E.B,E.C,E.D];`,
    expected: [1, 1, 4, 1],
  },
  {
    name: 'merged enum reference',
    source: `enum E{A=1}enum E{B=A+2}globalThis.result=[E.A,E.B];`,
    expected: [1, 3],
  },
  {
    name: 'effectful initializer and dependent member',
    source: `const calls=[];function value(){calls.push('call');return 7}enum E{A=value(),B=A+1}globalThis.result=[E.A,E.B,calls];`,
    expected: [7, 8, ['call']],
  },
  {
    name: 'heterogeneous members and reverse mappings',
    source: `enum E{A='a',B=A+'b',C=2,D}globalThis.result=[E.A,E.B,E.C,E.D,E[2],E[3]];`,
    expected: ['a', 'ab', 2, 3, 'C', 'D'],
  },
  {
    name: 'numeric operators and auto increment',
    source: `enum E{A=1<<3,B=~A,C=-(2**3),D}globalThis.result=[E.A,E.B,E.C,E.D];`,
    expected: [8, -9, -8, -7],
  },
];
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
function reference(input: string) {
  const source = input.replaceAll('globalThis.result', '(globalThis as any).result');
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-enum-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source);
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      types: [],
      skipLibCheck: true,
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map(d => ({ code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') }));
    let output = '';
    program.emit(undefined, (name, text) => {
      if (name.endsWith('.js')) output = text;
    });
    return { output, diagnostics };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases) {
  describe(entry.name, () => {
    beforeAll(() => {
      expect(ts.version).toBe('5.9.3');
      const ref = reference(entry.source);
      expect(ref.diagnostics).toEqual([]);
      expect(ref.output).not.toMatch(/\benum\s+E\b/);
      expect(observe(ref.output)).toEqual(entry.expected);
      const babel = transformSync(entry.source, {
        filename: 'input.ts',
        configFile: false,
        babelrc: false,
        plugins: [transformTypeScript],
      })!.code!;
      expect(babel).not.toMatch(/\benum\s+E\b/);
      expect(observe(babel)).toEqual(entry.expected);
    });
    for (const mode of ['inline', 'runtime'] as const)
      test(`preserves enum behavior, ${mode}`, () => {
        const code = compile(
          entry.source,
          { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
          'input.ts',
        );
        expect(code).not.toMatch(/\b(?:enum|namespace)\s+E\b/);
        expect(observe(code)).toEqual(entry.expected);
      });
  });
}
test('excludes a forward enum initializer rejected by TypeScript', () => {
  const result = reference(
    `enum A{value=B.value}enum B{value=7}globalThis.result=[A.value,B.value];`,
  );
  expect(result.diagnostics.map(d => d.code)).toEqual([2450, 2651]);
});
test('checks unqualified enum member visibility in a merged namespace', () => {
  const result = reference(
    `enum E{A=1}namespace E{export const twice=A*2}globalThis.result=E.twice;`,
  );
  expect(result.diagnostics).toEqual([{ code: 2304, message: "Cannot find name 'A'." }]);
});
