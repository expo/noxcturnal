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
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-nested-decorator-private-'));
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
    name: 'nested class owns private brand',
    expression: `()=>{class Inner{#value=3;read(){return #value in this}}return new Inner().read()}`,
    value: true,
    broken: true,
  },
  {
    name: 'nested class owns private read',
    expression: `()=>{class Inner{#value=3;read(){return this.#value}}return new Inner().read()}`,
    value: 3,
    broken: false,
  },
  {
    name: 'enclosing class owns private read',
    expression: `()=>outer.#value`,
    value: 3,
    broken: false,
  },
];
for (const entry of cases)
  describe(entry.name, () => {
    const source = `const log:any[]=[];function capture(read:()=>unknown){log.push(read());return function(target:any,key:string,descriptor:PropertyDescriptor):any{log.push('member')}}function mark(C:any):any{log.push('class');return C}class Outer{#value=3;build(){const outer=this;@mark class C{@capture(${entry.expression})read(){return 7}}return new C().read()}}const value=new Outer().build();globalThis.result=[value,log];`;
    const expected = [7, [entry.value, 'member', 'class']];
    beforeAll(() => expect(observe(reference(source))).toEqual(expected));
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
            expect(code).not.toMatch(/@capture|@mark/);
            if (classes) expect(code).not.toMatch(/class\s+(?:C|Outer|Inner)\b/);
            actual = observe(code);
            expect(actual).toEqual(expected);
          });
          test('respects ownership of nested private names', () =>
            expect(actual).toEqual(expected));
        });
  });
