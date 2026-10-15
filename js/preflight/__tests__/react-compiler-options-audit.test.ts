import { expect, test } from 'vitest';
import { defineNativePipeline, type PreflightReactCompiler } from '../../index';
const valid = {
  compilationMode: 'infer',
  panicThreshold: 'none',
  target: '19',
  enableResetCacheOnSourceFileChanges: false,
} as const;
const invalid = [
  ['unknown option', { unknown: true }, 'unknown React Compiler option'],
  ['missing mode', { compilationMode: undefined }, 'invalid React Compiler compilationMode'],
  ['unknown mode', { compilationMode: 'automatic' }, 'invalid React Compiler compilationMode'],
  ['missing threshold', { panicThreshold: undefined }, 'invalid React Compiler panicThreshold'],
  ['unknown threshold', { panicThreshold: 'errors' }, 'invalid React Compiler panicThreshold'],
  ['missing target', { target: undefined }, 'invalid React Compiler target'],
  ['numeric target', { target: 19 }, 'invalid React Compiler target'],
  [
    'missing reset',
    { enableResetCacheOnSourceFileChanges: undefined },
    'invalid React Compiler enableResetCacheOnSourceFileChanges',
  ],
  [
    'nonboolean reset',
    { enableResetCacheOnSourceFileChanges: 0 },
    'invalid React Compiler enableResetCacheOnSourceFileChanges',
  ],
  [
    'directive string',
    { customOptOutDirectives: 'use skip' },
    'invalid React Compiler customOptOutDirectives',
  ],
  [
    'empty directive',
    { customOptOutDirectives: [''] },
    'invalid React Compiler customOptOutDirectives',
  ],
  [
    'nonstring directive',
    { customOptOutDirectives: [false] },
    'invalid React Compiler customOptOutDirectives',
  ],
] as const;
test.each(invalid)('rejects React Compiler %s before execution', (_name, overrides, message) => {
  expect(() =>
    defineNativePipeline({
      phases: [
        {
          name: 'compiler-options',
          native: {
            reactCompiler: { ...valid, ...overrides } as unknown as PreflightReactCompiler,
          },
        },
      ],
    }),
  ).toThrow(`compiler-options: ${message}`);
});
