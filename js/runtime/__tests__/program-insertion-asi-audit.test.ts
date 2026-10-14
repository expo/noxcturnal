import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePlugin, defineNativePipeline, transform } from '../../index';
const first = 'globalThis.result=1';
const second = '[2].forEach(x=>globalThis.result+=x);';
function run(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const method of ['prependToProgram', 'appendToProgram', 'ensureHelper'] as const) {
  describe.each([false, true])(`${method}, terminated=%s`, terminated => {
    let actual: unknown;
    beforeAll(() => {
      const initial = first + (terminated ? ';' : '');
      const source = method === 'appendToProgram' ? initial : second;
      const insertion = method === 'appendToProgram' ? second : initial;
      const plugin = defineNativePlugin({
        name: 'program-insertion',
        pre(context) {
          const code = context.code.parseStatements(insertion);
          if (method === 'ensureHelper') context.ensureHelper('initialization', code);
          else context[method](code);
        },
      });
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'insert', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      try {
        actual = run(result.code);
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        actual = 'TypeError';
      }
    });
    (terminated ? test : test.fails)('preserves the inserted statement boundary', () =>
      expect(actual).toBe(3),
    );
  });
}

test('separate statement control', () => expect(run(`${first};\n${second}`)).toBe(3));

for (const method of ['prependToProgram', 'appendToProgram', 'ensureHelper'] as const) {
  describe.each([false, true])(`${method}, directive terminated=%s`, terminated => {
    let actual: unknown;
    beforeAll(() => {
      const source = '"use strict"' + (terminated ? ';' : '');
      const plugin = defineNativePlugin({
        name: 'directive-boundary',
        pre(context) {
          const code = context.code.parseStatements(
            '(globalThis.result=(function(){return this===undefined})());',
          );
          if (method === 'ensureHelper') context.ensureHelper('strict-check', code);
          else context[method](code);
        },
      });
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'insert', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      try {
        actual = run(result.code);
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        actual = 'TypeError';
      }
    });
    (terminated ? test : test.fails)(
      'keeps the directive separate from an inserted parenthesized expression',
      () => expect(actual).toBe(true),
    );
  });
}
