import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { transformSync } from '@babel/core';
import transformTypeScript from '@babel/plugin-transform-typescript';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-alias-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source);
    writeFileSync(
      join(directory, 'dependency.ts'),
      `export namespace Y{export const value=3}throw new Error('dependency evaluated');`,
    );
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
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
      if (name.endsWith('input.js')) output = text;
    });
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
async function observe(code: string) {
  // Only redirect this fixture's dependency location; execute real Node ESM.
  const dependency =
    'data:text/javascript;base64,' +
    Buffer.from(`export const Y={value:3};throw new Error('dependency evaluated');`).toString(
      'base64',
    ) +
    '#' +
    crypto.randomUUID();
  return (await importCode(code.replaceAll('./dependency.js', dependency))).value;
}
for (const length of [2, 3]) {
  for (const forwardReference of [false, true]) {
    describe(`unused alias chain, length=${length}, forward references=${forwardReference}`, () => {
      const aliases =
        length === 2
          ? ['import A=B.Y;', 'import B=N;']
          : ['import A=B.Y;', 'import B=C;', 'import C=N;'];
      const source = `import * as N from './dependency.js';${(forwardReference ? aliases : [...aliases].reverse()).join('')}export const value=1;`;
      beforeAll(async () => {
        expect(ts.version).toBe('5.9.3');
        const output = reference(source);
        expect(output).not.toContain('dependency.js');
        expect(await observe(output)).toBe(1);
        const babel = transformSync(source, {
          filename: 'input.ts',
          configFile: false,
          babelrc: false,
          plugins: [transformTypeScript],
        })!.code!;
        expect(babel).not.toContain('dependency.js');
        await expect(observe(babel)).rejects.toThrow(ReferenceError);
        await expect(observe(babel)).rejects.toThrow(
          length === 2 ? 'N is not defined' : 'C is not defined',
        );
      });
      for (const mode of ['inline', 'runtime'] as const) {
        describe(mode, () => {
          let actual: unknown;
          beforeAll(async () => {
            const code = compile(
              source,
              { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
              'input.ts',
            );
            expect(code).not.toMatch(/import\s+[ABC]\s*=/);
            expect(code).not.toContain('@babel/runtime');
            if (forwardReference) {
              expect(code).toContain('dependency.js');
              await expect(observe(code)).rejects.toThrow('dependency evaluated');
              try {
                actual = await observe(code);
              } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('dependency evaluated');
                actual = 'dependency evaluated';
              }
            } else {
              expect(code).not.toContain('dependency.js');
              actual = await observe(code);
              expect(actual).toBe(1);
            }
          });
          (forwardReference ? test.fails : test)(
            'removes aliases and dependencies used only by removed aliases',
            () => expect(actual).toBe(1),
          );
        });
      }
    });
  }
}
