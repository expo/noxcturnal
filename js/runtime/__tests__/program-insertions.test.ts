import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const source = `/*${'x'.repeat(100_000)}*/ 3;`;

test.each([
  { method: 'prependToProgram', eager: false },
  { method: 'appendToProgram', eager: false },
  { method: 'ensureHelper', eager: false },
  { method: 'prependToProgram', eager: true },
] as const)('$method with eager=$eager', ({ method, eager }) => {
  const plugin = defineNativePlugin({
    name: 'program-insertion',
    visitors: eager ? [defineVisitor('NumericLiteral', { scope: true }, () => {})] : [],
    pre(context) {
      if (method === 'ensureHelper') context.ensureHelper('marker', '0;');
      else context[method]('0;');
    },
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'insert', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toContain('0;');
});

test.each([
  {
    name: 'hashbang and unterminated directive',
    body: '#!/usr/bin/env node\n"use generated"\nconst value = 1 // trailing',
  },
  { name: 'empty program', body: '' },
  { name: 'comment-only program', body: '// trailing' },
])('placements follow the generated $name', ({ body }) => {
  const plugin = defineNativePlugin({
    name: 'replace-and-place',
    editEffect: 'bindings',
    post(context) {
      context.appendToProgram('module.exports = count + 2;');
      context.prependToProgram('var count = 40;');
      context.editor.overwrite(0, context.source.length, body, 'sourceless');
    },
  });
  const result = transform(
    '"use client"; export {};',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'replace', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  if (body.startsWith('#!')) {
    expect(result.code).toMatch(/^#!\/usr\/bin\/env node\n"use generated"/);
    expect(result.code.indexOf('module.exports')).toBeLessThan(result.code.indexOf('// trailing'));
  }
  expect(result.code.indexOf('use strict')).toBeLessThan(result.code.indexOf('var count'));
  const module = { exports: 0 };
  Function('module', result.code.replace(/^#![^\n]*\n/, ''))(module);
  expect(module.exports).toBe(42);
});

test('convergent replacement retries assemble one shared helper', () => {
  const plugins = ['first', 'second'].map(name =>
    defineNativePlugin({
      name,
      editEffect: 'bindings',
      post(context) {
        context.ensureHelper('answer', 'var answer = 42;');
        context.editor.overwrite(
          0,
          context.source.length,
          'module.exports = answer;',
          'sourceless',
        );
      },
    }),
  );
  const result = transform(
    '"use client"; export {};',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'replace', plugins }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code.match(/var answer/g)).toHaveLength(1);
  const module = { exports: 0 };
  Function('module', result.code)(module);
  expect(module.exports).toBe(42);
});

test.each([false, true])(
  'source resets remove program placements only for the whole program (%s)',
  whole => {
    const source = 'const original = 1; const other = 2;';
    const plugin = defineNativePlugin({
      name: 'reset-program-placements',
      post(context) {
        context.prependToProgram('var count = 42;');
        context.appendToProgram('module.exports = count;');
        context.editor.reset(0, whole ? source.length : source.indexOf(';') + 1);
      },
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'reset', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    if (whole) expect(result.code).toBe(source);
    else {
      const module = { exports: 0 };
      Function('module', result.code)(module);
      expect(module.exports).toBe(42);
    }
  },
);

test('failed output assembly leaves resident source and mappings intact', async () => {
  const { native } = await import('../../native/binding');
  const { packEdits } = await import('../../protocol/edits');
  const source = 'const original = 1;';
  const session = new native.NativePipelineSession('input.js', source);
  expect(() =>
    session.commitDecoded(
      packEdits([
        { kind: 'Replace', start: 0, end: source.length, content: 'const = ;' },
        { kind: 'Prologue', start: 0, end: source.length, content: 'var helper = 42;' },
      ]),
    ),
  ).toThrow();
  expect(session.sourceText()).toBe(source);
  const finished = session.finish();
  expect(finished.code).toBe(source);
  expect(finished.map ?? null).toBeNull();
});

test('ambiguous payload copies report the placement and replacement owners', () => {
  const source = '"use client"; function probe(){} export {};';
  const helper = defineNativePlugin({
    name: 'helper-owner',
    pre(context) {
      context.ensureHelper(
        'probe',
        context.sourceSlice(source.indexOf('function'), source.indexOf(' export')),
      );
    },
  });
  const replace = defineNativePlugin({
    name: 'replace-owner',
    post(context) {
      context.editor.overwrite(0, context.source.length, 'module.exports = 1;', 'sourceless');
    },
  });
  expect(() =>
    transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'copy', plugins: [helper, replace] }] }),
    ),
  ).toThrow(expect.objectContaining({ owners: ['helper-owner', 'replace-owner'] }));
});

test('preambles precede whitespace left by removed body statements', () => {
  const source = '"use strict";\nimport "dep";\nconsume();';
  const plugin = defineNativePlugin({
    name: 'remove-import-and-prepend',
    post(context) {
      context.editor.remove(
        source.indexOf('import'),
        source.indexOf(';', source.indexOf('import')) + 1,
      );
      context.prependToProgram('var helper = 42;');
    },
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'preamble', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe('"use strict";\nvar helper = 42;\n\nconsume();');
});

test.each(['"use strict"; // trailing', '"use strict"; /* trailing */', '"use strict";\n'])(
  'empty statement bodies place preambles before epilogues: %s',
  source => {
    const plugin = defineNativePlugin({
      name: 'empty-body-order',
      post(context) {
        context.prependToProgram('var count = 42;');
        context.appendToProgram('module.exports = count;');
      },
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'place', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    const module = { exports: undefined as unknown };
    Function('module', result.code)(module);
    expect(module.exports).toBe(42);
    expect(result.code.indexOf('var count')).toBeLessThan(result.code.indexOf('module.exports'));
  },
);
