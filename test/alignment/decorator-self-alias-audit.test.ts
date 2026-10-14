import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', code)(context, require);
  return context.result;
}
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-decorator-alias-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source.replaceAll('globalThis.result', '(globalThis as any).result'));
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      experimentalDecorators: true,
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
      if (name.endsWith('.js')) code = text;
    });
    return code;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const source = `function replace(C:any):any{return class extends C{}}function make(){@replace class C{arrow=()=>C;static arrow=()=>C;shorthand(){return {C}}nested(){return class{read(){return C}}}shadow(C:unknown){return C}static captured=(()=>C)}return C}const First=make();const Second=make();const first=new First();const second=new Second();globalThis.result=[first.arrow()===First,First.arrow()===First,first.shorthand().C===First,new (first.nested())().read()===First,first.shadow(3),First.captured()===First,second.arrow()===Second,first.arrow()!==Second];`;
beforeAll(() => {
  expect(ts.version).toBe('5.9.3');
  expect(observe(reference(source))).toEqual([true, true, false, true, 3, true, true, true]);
  expect(observe(reference(source.replace('return {C}', 'return {C:C}')))).toEqual([
    true,
    true,
    true,
    true,
    3,
    true,
    true,
    true,
  ]);
});
for (const classes of [false, true])
  for (const mode of ['inline', 'runtime'] as const)
    test(`decorated class self aliases, classes=${classes}, ${mode}`, () => {
      const code = compile(
        source,
        {
          typescript: 'strip',
          transforms: {
            legacyDecorators: true,
            classes,
            ...(classes ? { classProperties: { loose: false } } : {}),
          },
          helpers: { mode, version: '7.29.7' },
        },
        'input.ts',
      );
      expect(code).not.toContain('@replace');
      if (classes) expect(code).not.toMatch(/class\s+C\b/);
      expect(observe(code)).toEqual([true, true, true, true, 3, true, true, true]);
    });
