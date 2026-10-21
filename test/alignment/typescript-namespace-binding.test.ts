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
    name: 'ambient namespace has no runtime object',
    source: `declare namespace N{const value:number}globalThis.result=typeof N;`,
    typescript: 'undefined',
    baseline: 'undefined',
  },
  {
    name: 'ambient dotted namespace has no runtime object',
    source: `declare namespace Outer.Inner{const value:number}globalThis.result=typeof Outer;`,
    typescript: 'undefined',
    baseline: 'undefined',
  },
  {
    name: 'ambient type namespace merges with runtime namespace',
    source: `declare namespace N{interface Input{value:number}}namespace N{export const input:Input={value:3}}globalThis.result=N.input.value;`,
    typescript: 3,
    baseline: 3,
  },
  {
    name: 'ambient external module has no runtime initialization',
    source: `declare module 'virtual-audit-module'{export const value:number}globalThis.result=3;`,
    typescript: 3,
    baseline: 3,
  },
  {
    name: 'mixed declaration publishes late',
    source: `namespace N{export const a=3,{b}={b:N.a}}globalThis.result=[N.a,N.b];`,
    typescript: [3, 3],
    baseline: [3, undefined],
  },
  {
    name: 'pattern default publishes late',
    source: `namespace N{export const {a=3,b=N.a}={}}globalThis.result=[N.a,N.b];`,
    typescript: [3, 3],
    baseline: [3, undefined],
  },
  {
    name: 'simple declarations publish eagerly',
    source: `namespace N{export const a=3,b=N.a}globalThis.result=[N.a,N.b];`,
    typescript: [3, 3],
    baseline: [3, 3],
  },
  {
    name: 'split declaration control',
    source: `namespace N{export const a=3;export const {b}={b:N.a}}globalThis.result=[N.a,N.b];`,
    typescript: [3, 3],
    baseline: [3, 3],
  },
  {
    name: 'type namespace before runtime merge',
    source: `namespace N{export interface Input{value:number}}namespace N{export const input:Input={value:3}}globalThis.result=N.input.value;`,
    typescript: 3,
    baseline: 3,
  },
  {
    name: 'type namespace after runtime merge',
    source: `namespace N{export const input={value:3}}namespace N{export interface Input{value:number}}globalThis.result=N.input.value;`,
    typescript: 3,
    baseline: 3,
  },
  {
    name: 'dotted namespace',
    source: `namespace Outer.Inner{export const value=3}globalThis.result=Outer.Inner.value;`,
    typescript: 3,
    baseline: 3,
  },
  {
    name: 'private nested namespace',
    source: `namespace Outer{namespace Hidden{export const value=3}export function read(){return Hidden.value}}globalThis.result=Outer.read();`,
    typescript: 3,
    baseline: 3,
  },
];
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-namespace-binding-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source.replaceAll('globalThis.result', '(globalThis as any).result'));
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
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
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases) {
  describe(entry.name, () => {
    beforeAll(() => {
      expect(ts.version).toBe('5.9.3');
      expect(observe(reference(entry.source))).toEqual(entry.typescript);
      const babel = transformSync(entry.source, {
        filename: 'input.ts',
        configFile: false,
        babelrc: false,
        plugins: [[transformTypeScript, { allowNamespaces: true }]],
      })!.code!;
      expect(observe(babel)).toEqual(entry.baseline);
    });
    for (const mode of ['inline', 'runtime'] as const)
      test(`preserves the selected namespace baseline, ${mode}`, () => {
        const code = compile(
          entry.source,
          { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
          'input.ts',
        );
        expect(code).not.toMatch(/\bnamespace\s+(?:N|Outer|Hidden)\b/);
        expect(code).not.toMatch(/\bdeclare\s+(?:namespace|module)\b/);
        expect(code).not.toContain('@babel/runtime');
        expect(observe(code)).toEqual(entry.baseline);
      });
  });
}
