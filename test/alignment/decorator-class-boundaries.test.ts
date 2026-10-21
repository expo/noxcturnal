import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', code)(context, require);
  return context.result;
}
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-decorator-boundaries-'));
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
    name: 'ambient class decorator',
    source: `let calls=0;function mark(...args:any[]):any{calls++}@mark declare class C{}globalThis.result=[calls,typeof C];`,
    expected: [0, 'undefined'],
  },
  {
    name: 'ambient property decorator',
    source: `let calls=0;function mark(...args:any[]):any{calls++}declare class C{@mark value:number}globalThis.result=[calls,typeof C];`,
    expected: [0, 'undefined'],
  },
  ...[false, true].flatMap(named =>
    [false, true].map(isStatic => ({
      name: `undecorated class expression, named=${named}, static=${isStatic}`,
      source: `let calls=0;function mark(C:any):any{calls++;return C}@mark class Anchor{}const C=class ${named ? 'Inner' : ''}{${isStatic ? 'static ' : ''}accessor value=3};const target=${isStatic ? 'C' : 'new C()'};const first=target.value;target.value=4;globalThis.result=[calls,first,target.value];`,
      expected: [1, 3, 4],
    })),
  ),
];
for (const entry of cases)
  describe(entry.name, () => {
    beforeAll(() => {
      expect(ts.version).toBe('5.9.3');
      if (entry.name === 'undecorated class expression, named=false, static=true') {
        expect(() => observe(reference(entry.source))).toThrow(
          "Cannot read properties of undefined (reading '#value_accessor_storage')",
        );
        expect(
          observe(reference(entry.source.replace('const C=class {', 'const C=class Reference {'))),
        ).toEqual(entry.expected);
      } else {
        expect(observe(reference(entry.source))).toEqual(entry.expected);
      }
    });
    for (const classes of [false, true])
      for (const mode of ['inline', 'runtime'] as const)
        test(`classes=${classes}, ${mode}`, () => {
          const code = compile(
            entry.source,
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
          expect(code).not.toMatch(/@mark|\bdeclare\s|\baccessor\s/);
          if (classes) expect(code).not.toMatch(/\bclass\s+(?:Anchor|Inner|_class)\b|=\s*class\b/);
          expect(observe(code)).toEqual(entry.expected);
        });
  });
