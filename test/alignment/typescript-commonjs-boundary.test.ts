import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'direct namespace alias',
    source: `namespace N{export const value=7}import Alias=N;export = Alias.value;`,
    expected: 7,
  },
  {
    name: 'exported namespace alias',
    source: `namespace Outer{export namespace Inner{export const value=7}}namespace N{export import Alias=Outer.Inner}export = N.Alias.value;`,
    expected: 7,
  },
  {
    name: 'external import value',
    source: `import dep = require('./dependency.cjs');export = dep.value;`,
    expected: 3,
  },
  {
    name: 'unused external import',
    source: `import dep = require('./dependency.cjs');export = 5;`,
    expected: 5,
    unloaded: true,
  },
  {
    name: 'type-only external import',
    source: `import type dep = require('./dependency.cjs');const value:typeof dep.value=5;export = value;`,
    expected: 5,
    unloaded: true,
  },
  {
    name: 'external import used only in a type query',
    source: `import dep = require('./dependency.cjs');const value:typeof dep.value=5;export = value;`,
    expected: 5,
    unloaded: true,
  },
  {
    name: 'qualified namespace alias',
    source: `namespace N{export namespace Inner{export const value=7}}import Alias=N.Inner;export = Alias.value;`,
    expected: 7,
  },
  {
    name: 'export expression evaluates once',
    source: `let count=0;function read(){count++;return {value:count}}export = read();`,
    expected: { value: 1 },
  },
];
function observe(code: string, unloaded = false) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-ts-cjs-runtime-'));
  const filename = join(directory, 'input.cjs');
  const require = createRequire(filename);
  try {
    writeFileSync(filename, code);
    writeFileSync(
      join(directory, 'dependency.cjs'),
      unloaded ? `throw new Error('erased dependency loaded')` : `module.exports={value:3};`,
    );
    return require(filename);
  } finally {
    delete require.cache[filename];
    delete require.cache[join(directory, 'dependency.cjs')];
    rmSync(directory, { recursive: true, force: true });
  }
}
function reference(source: string, extension: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-ts-cjs-reference-'));
  try {
    const filename = join(directory, `input.${extension}`);
    writeFileSync(filename, source);
    writeFileSync(
      join(directory, 'dependency.d.cts'),
      `declare const dep:{value:number};export = dep;`,
    );
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.Node16,
      moduleResolution: ts.ModuleResolutionKind.Node16,
      types: [],
      skipLibCheck: true,
    });
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([]);
    let code = '';
    program.emit(undefined, (name, text) => {
      if (name.endsWith('.js') || name.endsWith('.cjs')) code = text;
    });
    return code;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases)
  for (const extension of ['ts', 'cts'])
    describe(`${entry.name}, .${extension}`, () => {
      beforeAll(() => {
        expect(ts.version).toBe('5.9.3');
        expect(observe(reference(entry.source, extension), entry.unloaded)).toEqual(entry.expected);
      });
      for (const mode of ['inline', 'runtime'] as const)
        test(`executes the CommonJS boundary, ${mode}`, () => {
          const code = compile(
            entry.source,
            { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
            `input.${extension}`,
          );
          expect(code).not.toMatch(/\bexport\s*=|\bimport\s+(?:type\s+)?\w+\s*=/);
          expect(code).not.toContain('@babel/runtime');
          expect(observe(code, entry.unloaded)).toEqual(entry.expected);
        });
    });
