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
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-auto-accessor-'));
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
for (const replacement of [false, true])
  for (const isStatic of [false, true])
    for (const computed of [false, true])
      describe(`legacy auto-accessor, replacement=${replacement}, static=${isStatic}, computed=${computed}`, () => {
        const key = computed ? '[key]' : 'value';
        const access = computed ? '[key]' : '.value';
        const source = `let Original:any;function replace(C:any):any{Original=C;return class extends C{}}const key=Symbol('value');const calls=[];function wrap(target:any,name:string|symbol,descriptor:PropertyDescriptor):any{calls.push([typeof name,typeof descriptor.get,typeof descriptor.set]);const get=descriptor.get!;const set=descriptor.set!;return {...descriptor,get(){return get.call(this)*2},set(value:number){set.call(this,value+1)}}}${replacement ? '@replace ' : ''}class C{@wrap ${isStatic ? 'static ' : ''}accessor ${key}=3}class D extends C{}const target=${isStatic ? 'D' : 'new D()'};const first=target${access};target${access}=4;const descriptor=Object.getOwnPropertyDescriptor(${replacement ? (isStatic ? 'Original' : 'Original.prototype') : isStatic ? 'C' : 'C.prototype'},${computed ? 'key' : "'value'"})!;globalThis.result=[first,target${access},descriptor.enumerable,descriptor.configurable,calls];`;
        const expected = [
          6,
          10,
          false,
          true,
          [[computed ? 'symbol' : 'string', 'function', 'function']],
        ];
        beforeAll(() => {
          expect(ts.version).toBe('5.9.3');
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
                      ...(classes ? { classProperties: { loose: false } } : {}),
                    },
                    helpers: { mode, version: '7.29.7' },
                  },
                  'input.ts',
                );
                expect(code).not.toMatch(/@wrap|@replace|\baccessor\s/);
                if (classes) expect(code).not.toMatch(/class\s+[CD]\b/);
                if (replacement && isStatic) {
                  try {
                    actual = observe(code);
                  } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect((error as Error).message).toMatch(
                      classes
                        ? /attempted to use private field on non-instance/
                        : /Cannot read private member .* from an object whose class did not declare it/,
                    );
                    actual = 'TypeError';
                  }
                  expect(actual).toBe('TypeError');
                } else {
                  actual = observe(code);
                  expect(actual).toEqual(expected);
                }
              });
              (replacement && isStatic ? test.fails : test)('preserves decorated accessors', () =>
                expect(actual).toEqual(expected),
              );
            });
      });
