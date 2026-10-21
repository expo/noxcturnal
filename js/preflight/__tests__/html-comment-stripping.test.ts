import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../index';

describe.each([
  ['comment-only', {}],
  ['generic identity', { transforms: { parameters: true } }],
] as const)('%s path', (_path, native) => {
  describe.each([
    ['opening', '<!-- audit-marker\nglobalThis.result = 3;'],
    ['ordinary line', '// audit-marker\nglobalThis.result = 3;'],
    ['ordinary block', '/* audit-marker */ globalThis.result = 3;'],
    ['closing', 'globalThis.result = 3;\n--> audit-marker'],
  ] as const)('%s HTML-style comment', (_name, source) => {
    let output: string;
    let rendered: string;
    beforeAll(() => {
      const compile = (compact: boolean) => {
        const result = transform(
          source,
          'input.cjs',
          defineNativePipeline({
            phases: [{ name: 'strip-comments', native: { ...native, comments: false, compact } }],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error('Unexpected bailout');
        return result.code;
      };
      output = compile(false);
      rendered = compile(true);
      for (const code of [output, rendered]) {
        const context: Record<string, unknown> = {};
        new Function('globalThis', code)(context);
        expect(context.result).toBe(3);
      }
    });

    test('comments false removes HTML-style comments without compact rendering', () => {
      expect(output).not.toContain('audit-marker');
    });

    test('forced compact rendering removes HTML-style comments', () => {
      expect(rendered).not.toContain('audit-marker');
    });
  });
});

// A hashbang is executable metadata, and a directive is a statement, not a comment.
describe.each([{}, { transforms: { parameters: true } }] as const)(
  'comment controls %j',
  native => {
    test('retains the hashbang and strict directive while stripping comments', () => {
      const result = transform(
        '#!/usr/bin/env node\n"use strict";\n<!-- audit-marker\nglobalThis.result = 3;',
        'input.cjs',
        defineNativePipeline({
          phases: [{ name: 'strip', native: { ...native, comments: false } }],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).toMatch(/^#!\/usr\/bin\/env node\n/);
      expect(result.code).toContain('"use strict";');
      expect(result.code).not.toContain('audit-marker');
    });

    test.each([undefined, true])('preserves comments when comments is %s', comments => {
      const source = '<!-- audit-marker\nglobalThis.result = 3;\n--> closing-marker';
      const result = transform(
        source,
        'input.cjs',
        defineNativePipeline({
          phases: [{ name: 'preserve', native: { ...native, comments } }],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).toBe(source);
    });

    test('comment markers inside a string do not require rendering', () => {
      const source = 'globalThis.result = "<!-- --> // /*"';
      const result = transform(
        source,
        'input.cjs',
        defineNativePipeline({
          phases: [{ name: 'strip', native: { ...native, comments: false } }],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).toBe(source);
    });
  },
);
