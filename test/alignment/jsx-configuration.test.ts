import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import type { PreflightPlan } from '../../js';
import { defineNativePipeline, transform } from '../../js';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'comment pragma overrides option',
    source: '/** @jsx fromComment */ globalThis.result=<div/>;',
    options: { jsx: 'classic', jsxPragma: 'fromOption' },
    babel: { runtime: 'classic', pragma: 'fromOption' },
  },
  {
    name: 'comment fragment overrides option',
    source: '/** @jsxFrag CommentFragment */ globalThis.result=<>x</>;',
    options: { jsx: 'classic', jsxPragmaFrag: 'OptionFragment' },
    babel: { runtime: 'classic', pragmaFrag: 'OptionFragment' },
  },
  {
    name: 'comment import source overrides option',
    source: '/** @jsxImportSource comment-runtime */ globalThis.result=<div/>;',
    options: { jsx: 'automatic', jsxImportSource: 'option-runtime' },
    babel: { runtime: 'automatic', importSource: 'option-runtime' },
  },
  {
    name: 'automatic explicit pragma',
    source: 'globalThis.result=<div/>;',
    options: { jsx: 'automatic', jsxPragma: 'factory' },
    babel: { runtime: 'automatic', pragma: 'factory' },
  },
  {
    name: 'classic import-source comment',
    source: '/** @jsxImportSource custom-runtime */ globalThis.result=<div/>;',
    options: { jsx: 'classic' },
    babel: { runtime: 'classic' },
  },
  {
    name: 'namespace tag rejected',
    source: 'globalThis.result=<svg:path/>;',
    options: { jsx: 'classic' },
    babel: { runtime: 'classic' },
  },
  {
    name: 'namespace attribute rejected',
    source: 'globalThis.result=<div xml:lang="en"/>;',
    options: { jsx: 'automatic' },
    babel: { runtime: 'automatic' },
  },
] as const;

function execute(code: string): unknown {
  const context: { result?: unknown } = {};
  const factory = (tag: unknown) => tag;
  new Function(
    'fromComment',
    'fromOption',
    'CommentFragment',
    'OptionFragment',
    'React',
    'require',
    'globalThis',
    code,
  )(
    () => 'comment factory',
    () => 'option factory',
    'comment fragment',
    'option fragment',
    { createElement: factory },
    (name: string) => ({ jsx: () => name }),
    context,
  );
  return context.result;
}
for (const [index, entry] of cases.entries()) {
  describe(entry.name, () => {
    let actual: unknown;
    beforeAll(() => {
      const reference = () =>
        transformSync(entry.source, {
          configFile: false,
          babelrc: false,
          sourceType: 'script',
          plugins: [[require('@babel/plugin-transform-react-jsx'), entry.babel]],
        })!.code!;
      if (index < 3) {
        const babel = reference();
        expect(babel).not.toMatch(/<div|<>/);
        expect(execute(babel)).toBe(
          ['comment factory', 'comment fragment', 'comment-runtime/jsx-runtime'][index],
        );
      } else expect(reference).toThrow();
      try {
        const result = transform(
          entry.source,
          'input.jsx',
          defineNativePipeline({
            phases: [{ name: 'jsx', native: entry.options as PreflightPlan }],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error('Unexpected bailout');
        expect(result.code).not.toMatch(/<div|<>|<svg:path/);
        actual = index < 3 ? execute(result.code) : 'accepted';
      } catch (error) {
        if (index < 3) throw error;
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(
          /transform-error|pragma|importSource|import.source|namespace/i,
        );
        actual = 'rejected';
      }
    });
    test('honors the selected JSX configuration', () => {
      expect(actual).toBe(
        index < 3
          ? ['comment factory', 'comment fragment', 'comment-runtime/jsx-runtime'][index]
          : 'rejected',
      );
    });
  });
}

test('namespace attributes remain allowed when explicitly enabled', () => {
  const source = 'globalThis.result=<div xml:lang="en"/>;';
  const observe = (code: string) => {
    const context: { result?: unknown } = {};
    new Function('React', 'globalThis', code)(
      { createElement: (_tag: unknown, props: unknown) => props },
      context,
    );
    return context.result;
  };
  const babel = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [
      [
        require('@babel/plugin-transform-react-jsx'),
        { runtime: 'classic', throwIfNamespace: false },
      ],
    ],
  })!.code!;
  expect(observe(babel)).toEqual({ 'xml:lang': 'en' });
  const result = transform(
    source,
    'input.jsx',
    defineNativePipeline({
      phases: [{ name: 'jsx', native: { jsx: 'classic', jsxThrowIfNamespace: false } }],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).not.toContain('<div');
  expect(observe(result.code)).toEqual({ 'xml:lang': 'en' });
});
