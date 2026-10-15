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
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-accessor-order-'));
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

for (const failure of ['none', 'key', 'initializer', 'factory', 'apply'])
  for (const isStatic of [false, true])
    describe(`auto-accessor order, failure=${failure}, static=${isStatic}`, () => {
      const source = `const log:string[]=[];const key=Symbol('key');const keys={get field():typeof key{log.push('key');${failure === 'key' ? "throw new Error('stop');" : 'return key;'}}};function initialize(){log.push('initializer');${failure === 'initializer' ? "throw new Error('stop');" : 'return 3;'}}function mark(){log.push('factory');${failure === 'factory' ? "throw new Error('stop');" : ''}return function(target:any,name:string|symbol,descriptor:PropertyDescriptor):any{log.push('apply');${failure === 'apply' ? "throw new Error('stop');" : ''}}}try{class C{static before=(log.push('static-before'),0);@mark() ${isStatic ? 'static ' : ''}accessor [keys.field]=initialize();static after=(log.push('static-after'),0)}log.push('construct');new C();log.push('done')}catch(error){log.push((error as Error).message)}globalThis.result=log;`;
      const expected: string[] = ['key'];
      if (failure === 'key') expected.push('stop');
      else {
        expected.push('static-before');
        if (isStatic) expected.push('initializer');
        if (isStatic && failure === 'initializer') expected.push('stop');
        else {
          expected.push('static-after', 'factory');
          if (failure === 'factory') expected.push('stop');
          else {
            expected.push('apply');
            if (failure === 'apply') expected.push('stop');
            else {
              expected.push('construct');
              if (!isStatic) expected.push('initializer');
              expected.push(!isStatic && failure === 'initializer' ? 'stop' : 'done');
            }
          }
        }
      }
      beforeAll(() => {
        expect(ts.version).toBe('5.9.3');
        expect(observe(reference(source))).toEqual(expected);
      });
      for (const classes of [false, true])
        for (const mode of ['inline', 'runtime'] as const)
          test(`preserves effects, classes=${classes}, ${mode}`, () => {
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
            expect(code).not.toMatch(/@mark|\baccessor\s/);
            if (classes) expect(code).not.toMatch(/class\s+C\b/);
            expect(observe(code)).toEqual(expected);
          });
    });
