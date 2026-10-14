import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';
import { compile } from '../compliance/runtime';
const cases = [
  {
    name: 'constructor',
    member: 'constructor(@dec ...values:any[]){}',
    expected: [['undefined', 0]],
  },
  {
    name: 'instance method',
    member: 'method(first:number,@dec ...values:any[]){}',
    expected: [['method', 1]],
  },
  {
    name: 'static method',
    member: 'static method(first:number,second:number,@dec ...values:any[]){}',
    expected: [['method', 2]],
  },
];
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-rest-decorator-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source);
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
    let output = '';
    program.emit(undefined, (name, text) => {
      if (name.endsWith('.js')) output = text;
    });
    expect(output).not.toContain('@dec');
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases) {
  describe(entry.name, () => {
    const source = `const calls=[];function dec(target,key,index){calls.push([String(key),index])}class C{${entry.member}}(globalThis as any).result=calls;`;
    beforeAll(() => {
      expect(ts.version).toBe('5.9.3');
      expect(observe(reference(source))).toEqual(entry.expected);
    });
    for (const mode of ['inline', 'runtime'] as const) {
      describe(mode, () => {
        let status: unknown;
        beforeAll(() => {
          const plan = {
            typescript: 'strip' as const,
            transforms: { legacyDecorators: true },
            helpers: { mode, version: '7.29.7' },
          };
          // An ordinary decorated parameter at the same index exercises the adapter.
          const control = compile(
            source.replace('...values:any[]', 'values:any'),
            plan,
            'input.ts',
          );
          expect(control).not.toContain('@dec');
          expect(observe(control)).toEqual(entry.expected);
          const result = transform(
            source,
            'input.ts',
            defineNativePipeline({ phases: [{ name: 'audit', native: plan }] }),
          );
          expect(result.status).toBe('bailout');
          if (result.status !== 'bailout')
            throw Error('expected the guarded residual-syntax bailout');
          expect(result.reason).toBe('audit:parse-error');
          expect(result.source).toBe(source);
          expect(result.diagnostics).toEqual([]);
          status = result.status;
        });
        test.fails('lowers the supported rest-parameter decorator', () =>
          expect(status).toBe('complete'));
      });
    }
  });
}
