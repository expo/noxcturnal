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
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-decorator-private-access-'));
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
  { name: 'field read', member: '#value=3;', expression: 'value.#value', expected: [3, 3] },
  {
    name: 'method call',
    member: '#value(){return 3}',
    expression: 'value.#value()',
    expected: [3, 3],
  },
  { name: 'field assignment', member: '#value=3;', expression: 'value.#value=4', expected: [4, 4] },
  { name: 'field update', member: '#value=3;', expression: 'value.#value++', expected: [3, 4] },
];
for (const brandGuard of [false, true])
  for (const entry of cases)
    describe(`${entry.name}, brand guard=${brandGuard}`, () => {
      const source = `let check:(value:any)=>number;function capture(read:(value:any)=>number){check=read;return function(target:any,key:string,descriptor:PropertyDescriptor):any{}}class C{${entry.member}@capture((value:C)=>${brandGuard ? `(#value in value,${entry.expression})` : entry.expression})read(){return ${entry.name === 'method call' ? 'this.#value()' : 'this.#value'}}}const c=new C();globalThis.result=[check(c),c.read()];`;
      beforeAll(() => expect(observe(reference(source))).toEqual(entry.expected));
      for (const classes of [false, true])
        for (const mode of ['inline', 'runtime'] as const)
          describe(`classes=${classes}, ${mode}`, () => {
            let actual: unknown;
            beforeAll(() => {
              const code = compile(
                source,
                {
                  typescript: 'strip',
                  transforms: {
                    legacyDecorators: true,
                    classes,
                    ...(classes
                      ? {
                          classProperties: { loose: false },
                          privateMethods: true,
                          privatePropertyInObject: true,
                        }
                      : {}),
                  },
                  helpers: { mode, version: '7.29.7' },
                },
                'input.ts',
              );
              expect(code).not.toContain('@capture');
              if (classes) expect(code).not.toMatch(/class\s+C\b/);
              if (brandGuard) {
                actual = observe(code);
                expect(actual).toEqual(entry.expected);
              } else {
                expect(() => new Function(code)).toThrow(SyntaxError);
                expect(() => new Function(code)).toThrow(
                  "Private field '#value' must be declared in an enclosing class",
                );
                actual = 'SyntaxError';
              }
            });
            (brandGuard ? test : test.fails)(
              'keeps private accesses in their declaring environment',
              () => expect(actual).toEqual(entry.expected),
            );
          });
    });
