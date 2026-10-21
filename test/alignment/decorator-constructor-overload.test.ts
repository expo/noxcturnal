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
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-decorator-overload-'));
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

for (const classDecorator of [false, true])
  describe(`constructor overload, class decorator=${classDecorator}`, () => {
    const source = `const log:any[]=[];function inject(target:any,key:undefined,index:number){log.push(['parameter',key,index])}function mark(C:any):any{log.push(['class']);return C}${classDecorator ? '@mark ' : ''}class C{value:number;constructor(value:number);constructor(@inject value=3){this.value=value}}globalThis.result=[new C(7).value,log];`;
    const expected = [7, [['parameter', undefined, 0], ...(classDecorator ? [['class']] : [])]];
    beforeAll(() => expect(observe(reference(source))).toEqual(expected));
    for (const classes of [false, true])
      for (const mode of ['inline', 'runtime'] as const)
        test(`classes=${classes}, ${mode}`, () => {
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
          expect(code).not.toMatch(/@inject|@mark/);
          if (classes) expect(code).not.toMatch(/class\s+C\b/);
          expect(observe(code)).toEqual(expected);
        });
  });
