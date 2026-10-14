import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePlugin, defineNativePipeline, transform } from '../../index';
const first = 'globalThis.result=1';
const second = '[2].forEach(x=>globalThis.result+=x);';
function run(code: string) {
  return execute(code).result;
}
function execute(code: string) {
  const context: { result?: unknown; strict?: unknown; seen?: unknown } = {};
  new Function('globalThis', code)(context);
  return context;
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
    test('preserves the inserted statement boundary', () => expect(actual).toBe(3));
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
    test('keeps the directive separate from an inserted parenthesized expression', () =>
      expect(actual).toBe(true));
  });
}

// The statement must not itself continue the string (`\n(` is a call). A parenthesized
// prologue would call an unterminated directive unless a real separator is inserted.
for (const source of [
  '"use strict"\nglobalThis.seen=1',
  '"use strict";\nglobalThis.seen=1',
  '"use strict" // keep\nglobalThis.seen=1',
  '"use strict"\r\nglobalThis.seen=1',
  '"use strict"\u2028globalThis.seen=1',
  '"use strict"\n"use client"\nglobalThis.seen=1',
  '#!/usr/bin/env node\n"use strict"\nglobalThis.seen=1',
]) {
  for (const prologue of ['prependToProgram', 'ensureHelper'] as const) {
    test(`${prologue} stays after the directive: ${JSON.stringify(source)}`, () => {
      const plugin = defineNativePlugin({
        name: 'directive-before-statement',
        pre(context) {
          const strict = context.code.parseStatements(
            '(globalThis.strict=(function(){return this===undefined})());',
          );
          if (prologue === 'ensureHelper') context.ensureHelper('strict-check', strict);
          else context.prependToProgram(strict);
          context.appendToProgram(
            context.code.parseStatements('[2].forEach(x=>globalThis.seen+=x)'),
          );
        },
      });
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'insert', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      const code = result.code;
      const directiveAt = code.indexOf('"use strict"');
      const strictAt = code.indexOf('globalThis.strict');
      const seenAt = code.indexOf('globalThis.seen');
      expect(directiveAt).toBeGreaterThanOrEqual(0);
      expect(directiveAt).toBeLessThan(strictAt);
      expect(strictAt).toBeLessThan(seenAt);
      const secondDirective = code.indexOf('"use client"');
      if (secondDirective >= 0) expect(secondDirective).toBeLessThan(strictAt);
      const executed = execute(code.replace(/^#![^\n]*\n/, ''));
      expect(executed.strict).toBe(true);
      expect(executed.seen).toBe(3);
    });
  }
}

for (const source of [
  'globalThis.result=1 // tail',
  '"use strict" // tail',
  '#!/usr/bin/env node\n"use strict"',
  '// comment only',
  '"use strict"\r\n',
  '"use strict"\u2028',
]) {
  test(`append preserves EOF comment/hashbang boundary: ${source}`, () => {
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'append',
            plugins: [
              defineNativePlugin({
                name: 'append',
                pre(context) {
                  context.appendToProgram(
                    context.code.parseStatements('(globalThis.result=3) // inserted tail'),
                  );
                  context.appendToProgram(
                    context.code.parseStatements('[4].forEach(x=>globalThis.result+=x)'),
                  );
                },
              }),
            ],
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(run(result.code.replace(/^#![^\n]*\n/, ''))).toBe(7);
  });
}
