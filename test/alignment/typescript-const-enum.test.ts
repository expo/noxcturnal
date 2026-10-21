import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { transformSync } from '@babel/core';
import transformTypeScript from '@babel/plugin-transform-typescript';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';
const cases = [
  {
    name: 'local const enum',
    source: `const enum E{A=2,B=A*3}export const value=E.B;`,
    value: 6,
    exposed: undefined,
  },
  {
    name: 'exported const enum',
    source: `export const enum E{A=2,B=A*3}export const value=E.B;`,
    value: 6,
    exposed: 6,
  },
  {
    name: 'namespace const enum',
    source: `export namespace N{export const enum E{A=3}export function read(){return E.A}}export const value=N.read();`,
    value: 3,
    exposed: 3,
  },
  {
    name: 'merged const enum',
    source: `const enum E{A=2}const enum E{B=3}export const value=[E.A,E.B];`,
    value: [2, 3],
    exposed: undefined,
  },
  {
    name: 'shadowed enum name',
    source: `const enum E{A=3}function read(E:{A:number}){return E.A}export const value=[E.A,read({A:7})];`,
    value: [3, 7],
    exposed: undefined,
  },
];
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-const-enum-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source);
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      preserveConstEnums: true,
      types: [],
      skipLibCheck: true,
    });
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([]);
    let output = '';
    program.emit(undefined, (name, text) => {
      if (name.endsWith('.js')) output = text;
    });
    expect(output).not.toMatch(/\b(?:const enum|namespace)\b/);
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
function babel(source: string) {
  return transformSync(source, {
    filename: 'input.ts',
    configFile: false,
    babelrc: false,
    plugins: [[transformTypeScript, { allowNamespaces: true, optimizeConstEnums: false }]],
  })!.code!;
}
async function observe(code: string) {
  const module = await importCode(code);
  return {
    value: module.value,
    exposed:
      (module.E as { B?: number } | undefined)?.B ??
      (module.N as { E: { A: number } } | undefined)?.E.A,
  };
}
for (const entry of cases) {
  describe(entry.name, () => {
    const expected = { value: entry.value, exposed: entry.exposed };
    beforeAll(async () => {
      expect(ts.version).toBe('5.9.3');
      expect(await observe(reference(entry.source))).toEqual(expected);
      expect(await observe(babel(entry.source))).toEqual(expected);
    });
    for (const mode of ['inline', 'runtime'] as const)
      test(`preserves values and exported enum objects, ${mode}`, async () => {
        const code = compile(
          entry.source,
          { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
          'input.ts',
        );
        expect(code).not.toMatch(/\b(?:const enum|namespace)\b/);
        expect(code).not.toContain('@babel/runtime');
        expect(await observe(code)).toEqual(expected);
      });
  });
}
describe('ambient const enum baseline', () => {
  const source = `declare const enum E{A=3}export const value=E.A;`;
  beforeAll(async () => {
    expect(await observe(reference(source))).toEqual({ value: 3, exposed: undefined });
    const code = babel(source);
    expect(code).not.toContain('declare');
    await expect(importCode(code)).rejects.toThrow(ReferenceError);
    expect(await observe('const E={A:3};' + code)).toEqual({ value: 3, exposed: undefined });
  });
  for (const mode of ['inline', 'runtime'] as const)
    test(`retains the shared ambient-value requirement, ${mode}`, async () => {
      const code = compile(
        source,
        { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
        'input.ts',
      );
      expect(code).not.toMatch(/\b(?:declare|enum)\b/);
      await expect(importCode(code)).rejects.toThrow(ReferenceError);
      expect(await observe('const E={A:3};' + code)).toEqual({ value: 3, exposed: undefined });
    });
});
