import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { transformSync } from '@babel/core';
import transformTypeScript from '@babel/plugin-transform-typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';
const cases = [
  {
    name: 'only type import module marker',
    source: `import type {Input} from './dependency.js';`,
    load: false,
    value: undefined,
    marker: true,
  },
  {
    name: 'only type specifier module marker',
    source: `import {type Input} from './dependency.js';`,
    load: false,
    value: undefined,
    marker: true,
  },
  {
    name: 'exported interface module marker',
    source: `export interface Input{value:number}`,
    load: false,
    value: undefined,
    marker: true,
  },
  {
    name: 'default interface module marker',
    source: `export default interface Input{value:number}`,
    load: false,
    value: undefined,
    marker: true,
  },
  {
    name: 'local type reexport module marker',
    source: `type Input={value:number};export {Input};`,
    load: false,
    value: undefined,
    marker: true,
  },
  {
    name: 'whole type import',
    source: `import type {Input} from './dependency.js';export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'specifier type import',
    source: `import {type Input} from './dependency.js';export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'default used as a type',
    source: `import Value from './dependency.js';type T=Value;export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'namespace used as a type',
    source: `import * as NS from './dependency.js';type T=NS.Input;export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'type query',
    source: `import {Value} from './dependency.js';type T=typeof Value;export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'runtime typeof',
    source: `import {Value} from './dependency.js';export const value=typeof Value;`,
    load: true,
    value: 'function',
  },
  {
    name: 'mixed import',
    source: `import {type Input,actual} from './dependency.js';export const value=actual;`,
    load: true,
    value: 7,
  },
  {
    name: 'bare import',
    source: `import './dependency.js';export const value=1;`,
    load: true,
    value: 1,
  },
  {
    name: 'empty import',
    source: `import {} from './dependency.js';export const value=1;`,
    load: true,
    value: 1,
  },
  {
    name: 'type reexport',
    source: `export type {Input} from './dependency.js';export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'type specifier reexport',
    source: `export {type Input} from './dependency.js';export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'type star reexport',
    source: `export type * from './dependency.js';export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'type namespace reexport',
    source: `export type * as Types from './dependency.js';export const value=1;`,
    load: false,
    value: 1,
  },
  {
    name: 'empty reexport',
    source: `export {} from './dependency.js';export const value=1;`,
    load: true,
    value: 1,
  },
  {
    name: 'value reexport',
    source: `export {actual as value} from './dependency.js';`,
    load: true,
    value: 7,
  },
];
beforeAll(() => {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-import-erasure-'));
  try {
    expect(ts.version).toBe('5.9.3');
    writeFileSync(
      join(directory, 'dependency.d.ts'),
      `export interface Input{}export declare class Value{}export default Value;export declare const actual:7;`,
    );
    const filenames = cases.map((entry, index) => {
      const filename = join(directory, `input${index}.ts`);
      writeFileSync(filename, entry.source);
      return filename;
    });
    const program = ts.createProgram(filenames, {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      types: [],
      skipLibCheck: true,
      noEmit: true,
    });
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
async function observe(code: string, tripwire: boolean) {
  const dependency =
    'data:text/javascript;base64,' +
    Buffer.from(
      `export class Value{};export default Value;export const actual=7;${tripwire ? "throw new Error('dependency evaluated');" : ''}`,
    ).toString('base64') +
    '#' +
    crypto.randomUUID();
  return (await importCode(code.replaceAll('./dependency.js', dependency))).value;
}
for (const entry of cases) {
  describe(entry.name, () => {
    beforeAll(async () => {
      const code = transformSync(entry.source, {
        filename: 'input.ts',
        configFile: false,
        babelrc: false,
        plugins: [[transformTypeScript, { onlyRemoveTypeImports: false }]],
      })!.code!;
      if (entry.marker && entry.name !== 'default interface module marker')
        expect(code).toMatch(/export\s*\{\s*\}/);
      if (entry.name === 'default interface module marker') expect(code).toBe('');
      expect(await observe(code, false)).toBe(entry.value);
      if (entry.load) await expect(observe(code, true)).rejects.toThrow('dependency evaluated');
      else expect(await observe(code, true)).toBe(entry.value);
    });
    for (const mode of ['inline', 'runtime'] as const)
      test(`preserves runtime loading, ${mode}`, async () => {
        const code = compile(
          entry.source,
          { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
          'input.ts',
        );
        expect(code).not.toMatch(/\b(?:import|export)\s+type\b|\btype T\s*=/);
        if (entry.marker) expect(code).toMatch(/export\s*\{\s*\}/);
        expect(code.includes('dependency.js')).toBe(entry.load);
        expect(await observe(code, false)).toBe(entry.value);
        if (entry.load) await expect(observe(code, true)).rejects.toThrow('dependency evaluated');
        else expect(await observe(code, true)).toBe(entry.value);
      });
  });
}
