import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { transformSync } from '@babel/core';
import decorators from '@babel/plugin-proposal-decorators';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function observe(code: string, hook: string) {
  const context: { result?: unknown } = {};
  let calls = 0;
  const reflection = Object.create(Reflect);
  if (hook === 'noncallable') reflection.decorate = 3;
  if (hook === 'delegate' || hook === 'throw')
    reflection.decorate = (
      _decorators: unknown,
      target: unknown,
      _key: unknown,
      descriptor: unknown,
    ) => {
      calls++;
      if (hook === 'throw') throw new Error('reflect hook');
      return descriptor ?? target;
    };
  try {
    new Function('globalThis', 'Reflect', 'require', code)(context, reflection, require);
    return { result: context.result, calls };
  } catch (error) {
    return { error: (error as Error).message, calls };
  }
}
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-reflect-decorator-'));
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

for (const kind of ['class', 'method'])
  for (const hook of ['absent', 'noncallable', 'delegate', 'throw'])
    describe(`${kind}, Reflect.decorate=${hook}`, () => {
      const source = `const log=[];function mark(...args){log.push('decorator')}${kind === 'class' ? '@mark class C{}' : 'class C{@mark read(){return 3}}'}globalThis.result=log;`;
      const expected = { result: ['decorator'], calls: 0 };
      beforeAll(() => {
        expect(ts.version).toBe('5.9.3');
        expect(observe(reference(source), hook)).toEqual(
          hook === 'throw'
            ? { error: 'reflect hook', calls: 1 }
            : hook === 'delegate'
              ? { result: [], calls: 1 }
              : expected,
        );
        const babel = transformSync(source, {
          filename: 'input.js',
          configFile: false,
          babelrc: false,
          plugins: [[decorators, { legacy: true }]],
        })!.code!;
        expect(observe(babel, hook)).toEqual(expected);
      });
      for (const mode of ['inline', 'runtime'] as const)
        test(`retains the direct-application baseline, ${mode}`, () => {
          const code = compile(
            source,
            { transforms: { legacyDecorators: true }, helpers: { mode, version: '7.29.7' } },
            'input.js',
          );
          expect(code).not.toContain('@mark');
          expect(code).not.toContain('@babel/runtime');
          expect(observe(code, hook)).toEqual(expected);
        });
    });
