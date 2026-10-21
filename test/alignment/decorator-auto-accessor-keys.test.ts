import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';
const require = createRequire(import.meta.url);
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', code)(context, require);
  return context.result;
}
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-accessor-keys-'));
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

const cases = [
  {
    name: 'backing name collision',
    body: `#_value_accessor_storage=7;@mark accessor value=3;read(){return [this.value,this.#_value_accessor_storage]}`,
    result: `new C().read()`,
    expected: [3, 7],
  },
  {
    name: 'quoted non-identifier key',
    body: `@mark accessor 'a-b'=3;`,
    result: `new C()['a-b']`,
    expected: 3,
  },
  {
    name: 'computed key getter',
    prefix: `const key=Symbol('key');let count=0;const keys={get field():typeof key{count++;return key}};`,
    body: `@mark accessor [keys.field]=3;`,
    result: `[new C()[key],count]`,
    expected: [3, 1],
  },
];
for (const entry of cases)
  describe(entry.name, () => {
    const source = `${entry.prefix ?? ''}function mark(target:any,key:string|symbol,descriptor:PropertyDescriptor):any{}class C{${entry.body}}globalThis.result=${entry.result};`;
    beforeAll(() => {
      expect(observe(reference(source))).toEqual(entry.expected);
    });
    for (const mode of ['inline', 'runtime'] as const)
      describe(mode, () => {
        let actual: unknown;
        beforeAll(() => {
          const result = transform(
            source,
            'input.ts',
            defineNativePipeline({
              phases: [
                {
                  name: 'audit',
                  native: {
                    typescript: 'strip',
                    transforms: { legacyDecorators: true },
                    helpers: { mode, version: '7.29.7' },
                  },
                },
              ],
            }),
          );
          expect(result.status).toBe('complete');
          if (result.status !== 'complete') throw new Error(result.reason);
          expect(result.code).not.toMatch(/@mark|\baccessor\s/);
          expect(result.code).not.toContain('@babel/runtime');
          actual = observe(result.code);
        });
        test('preserves valid accessor names and private storage', () =>
          expect(actual).toEqual(entry.expected));
      });
  });
