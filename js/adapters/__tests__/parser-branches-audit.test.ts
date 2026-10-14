import { expect, test, vi } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  registerParserAdapter,
  transform,
} from '../../index';
import { native } from '../../native/binding';
import { classifyForTransform } from '../classification';

test.each([
  { parser: 'js', source: 'const value = 1;' },
  { parser: 'jsx', source: 'const value = <View />;' },
  { parser: 'ts', source: 'const value: number = 1;' },
  { parser: 'tsx', source: 'const value: unknown = <View />;' },
  { parser: 'dts', source: 'declare const value: number;' },
] as const)('explicit $parser parser overrides an unknown filename', ({ parser, source }) => {
  let classification: string | undefined;
  let visits = 0;
  const plugin = defineNativePlugin({
    name: 'parser-override-audit',
    createState(context) {
      classification = context.parser.syntax;
    },
    visitors: [
      defineVisitor('Program', {}, () => {
        visits++;
      }),
    ],
  });
  const result = transform(
    source,
    'input.custom',
    defineNativePipeline({ phases: [{ name: 'observe', plugins: [plugin] }] }),
    { parser },
  );
  expect(result.status).toBe('complete');
  expect(classification).toBe(parser);
  expect(visits).toBe(1);
});

test.each([undefined, 'auto'] as const)('parser=%s preserves an unsupported extension', parser => {
  const source = '1;';
  expect(
    transform(source, 'input.custom', defineNativePipeline({ phases: [] }), { parser }),
  ).toEqual({ status: 'bailout', source, reason: 'unknown-extension', diagnostics: [] });
});

test.each(['js', 'mjs', 'cjs'])(
  '%s Flow markers select the Flow classification branch',
  extension => {
    expect(
      classifyForTransform(`input.${extension}`, '// @flow\nconst value: number = 1;'),
    ).toEqual({ syntax: 'flow', supported: false, reason: 'flow-requires-parser-adapter' });
  },
);

test.each([false, true])('native Flow unavailable falls back with adapter=%s', registered => {
  const source = '// @flow\nconst value: number = 1;';
  const erasure = vi.spyOn(native, 'nativeFlowErase').mockReturnValue({
    status: 'unsupported',
    reason: 'flow-parser-not-built',
    erasedBytes: 0,
    spanCount: 0,
  });
  let compilations = 0;
  const unregister = registered
    ? registerParserAdapter({
        name: 'unavailable-flow-audit',
        version: '1',
        supports: route => route.syntax === 'flow',
        compile(input, filename) {
          expect(input).toBe(source);
          expect(filename).toBe('input.js');
          compilations++;
          return {
            status: 'complete',
            code: 'const value = 1;',
            syntax: 'js',
            map: { mappings: 'AAAA', names: [] },
          };
        },
      })
    : undefined;
  try {
    const result = transform(source, 'input.js', defineNativePipeline({ phases: [] }));
    expect(erasure).toHaveBeenCalledOnce();
    expect(compilations).toBe(registered ? 1 : 0);
    if (registered) {
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).toBe('const value = 1;');
    } else {
      expect(result).toEqual({
        status: 'bailout',
        reason: 'flow-requires-parser-adapter',
        source,
        diagnostics: [],
      });
    }
  } finally {
    unregister?.();
    erasure.mockRestore();
  }
});
