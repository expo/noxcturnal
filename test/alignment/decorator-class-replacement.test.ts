import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { transformSync as transport } from 'esbuild';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const body = `static initial=C;static self(){return C}self(){return C}`;
const cases = [
  {
    name: 'local declaration',
    declaration: `@outer @inner class C{${body}}export {C as Selected};`,
    select: 'Selected',
  },
  { name: 'named export', declaration: `@outer @inner export class C{${body}}`, select: 'C' },
  {
    name: 'named default export',
    declaration: `@outer @inner export default class C{${body}}`,
    select: 'default',
  },
  {
    name: 'anonymous default export',
    declaration: `@outer @inner export default class {static initial=1;static self(){return this}self(){return this.constructor}}`,
    select: 'default',
  },
  {
    name: 'namespace export',
    declaration: `export namespace N{@outer @inner export class C{${body}}}`,
    select: 'N',
  },
];
function observe(code: string, select: string, anonymous = false) {
  const module = { exports: {} as Record<string, any> };
  new Function('module', 'exports', 'require', transport(code, { format: 'cjs' }).code)(
    module,
    module.exports,
    require,
  );
  const C = select === 'N' ? module.exports.N.C : module.exports[select];
  const value = new C();
  return [
    module.exports.calls,
    value.tag,
    C.initial === (anonymous ? 1 : module.exports.Original),
    C.self() === C,
    value.self() === C,
    value instanceof module.exports.Original,
  ];
}
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-decorator-replacement-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source);
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true,
      useDefineForClassFields: false,
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
    expect(output).not.toMatch(/@(outer|inner)/);
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases) {
  for (const replaceOuter of [false, true]) {
    describe(`${entry.name}, replace outer=${replaceOuter}`, () => {
      const source = `export let Original:any;export const calls=[];function inner(value:any):any{calls.push('inner');Original=value;return class extends value{tag='inner'}}function outer(value:any):any{calls.push('outer');${replaceOuter ? "return class extends value{tag='outer'}" : ''}}${entry.declaration}`;
      const expected = [
        ['inner', 'outer'],
        replaceOuter ? 'outer' : 'inner',
        true,
        true,
        true,
        true,
      ];
      beforeAll(() => {
        expect(ts.version).toBe('5.9.3');
        expect(
          observe(reference(source), entry.select, entry.name === 'anonymous default export'),
        ).toEqual(expected);
      });
      for (const mode of ['inline', 'runtime'] as const) {
        for (const classes of [false, true]) {
          test(`preserves replacement identity, ${mode}, classes=${classes}`, () => {
            const code = compile(
              source,
              {
                typescript: 'strip',
                transforms: {
                  legacyDecorators: true,
                  ...(classes ? { classes: true, classProperties: { loose: true } } : {}),
                },
                helpers: { mode, version: '7.29.7' },
              },
              'input.ts',
            );
            expect(code).not.toMatch(/@(outer|inner)/);
            expect(code).not.toContain(': any');
            if (classes) expect(code).not.toMatch(/\bclass\s+(?:C|extends)\b/);
            expect(observe(code, entry.select, entry.name === 'anonymous default export')).toEqual(
              expected,
            );
          });
        }
      }
    });
  }
}
