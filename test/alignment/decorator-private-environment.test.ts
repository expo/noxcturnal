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
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-decorator-private-'));
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

for (const constructorDecorator of [false, true])
  for (const classDecorator of [false, true])
    describe(`private environment decorator, class decorator=${classDecorator}, constructor decorator=${constructorDecorator}`, () => {
      const source = `let check:(value:any)=>boolean;let calls=0;function capture(predicate:(value:any)=>boolean){check=predicate;return function(target:any,key:string,descriptor:PropertyDescriptor):any{calls++}}function inject(target:any,key:undefined,index:number){calls++}function mark(C:any):any{calls++;return C}${classDecorator ? '@mark ' : ''}class C{${constructorDecorator ? 'constructor(@inject value=1){}' : ''}#value=3;@capture(value=>#value in value)read(){return this.#value}}const c=new C();globalThis.result=[check(c),check({}),c.read(),calls];`;
      const expected = [true, false, 3, 1 + Number(classDecorator) + Number(constructorDecorator)];
      beforeAll(() => {
        expect(observe(reference(source))).toEqual(expected);
      });
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
              expect(code).not.toMatch(/@capture|@mark|@inject/);
              if (classes) expect(code).not.toMatch(/class\s+C\b/);
              actual = observe(code);
              expect(actual).toEqual(expected);
            });
            test('preserves every decorator callback in private scope', () =>
              expect(actual).toEqual(expected));
          });
    });
