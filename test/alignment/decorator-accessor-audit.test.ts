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
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-accessor-decorator-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source);
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
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
    expect(output).not.toMatch(/@(getter|parameter)/);
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const isStatic of [false, true]) {
  for (const getterFirst of [false, true]) {
    describe(`accessor decorator grouping, static=${isStatic}, getter first=${getterFirst}`, () => {
      const prefix = isStatic ? 'static ' : '';
      const getter = `@getter ${prefix}get value(){return this.n}`;
      const setter = `${prefix}set value(@parameter next:number){this.n=next}`;
      const source = `const calls=[];
 function getter(target,key,descriptor){calls.push('get');const original=descriptor.get;const factor=target.factor??1;return {...descriptor,get(){return original.call(this)*factor}}}
 function parameter(target,key,index){calls.push('parameter:'+index);target.factor=2}
 class C{${prefix}n=3;${getterFirst ? getter + setter : setter + getter}}
 const c=${isStatic ? 'C' : 'new C()'};c.value=4;(globalThis as any).result=[calls,c.value];`;
      const expected = [['parameter:0', 'get'], 8];
      beforeAll(() => {
        expect(ts.version).toBe('5.9.3');
        expect(observe(reference(source))).toEqual(expected);
      });
      for (const mode of ['inline', 'runtime'] as const) {
        for (const classes of [false, true]) {
          describe(`${mode}, classes=${classes}`, () => {
            let actual: unknown;
            beforeAll(() => {
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
              expect(code).not.toMatch(/@(getter|parameter)/);
              expect(code).not.toContain(' as any');
              if (classes) expect(code).not.toMatch(/class\s+C\b/);
              actual = observe(code);
              expect(actual).toEqual(getterFirst ? [['get', 'parameter:0'], 4] : expected);
            });
            (getterFirst ? test.fails : test)(
              'applies setter-parameter metadata before replacing the accessor descriptor',
              () => expect(actual).toEqual(expected),
            );
          });
        }
      }
    });
  }
}
