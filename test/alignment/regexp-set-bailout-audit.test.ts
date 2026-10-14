import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';

const require = createRequire(import.meta.url);
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
for (const mode of ['inline', 'runtime'] as const) {
  for (const spelling of [String.raw`\uD800`, String.raw`a\uD800`]) {
    for (const position of ['before', 'after'] as const) {
      test(`${mode}: ${spelling} string bailout ${position} another rewritten literal`, () => {
        const candidate = `const candidate = /^[\\q{${spelling}|b}]$/v;`;
        const other = String.raw`const other = /(?<letter>.)/s;`;
        const source = `/* preserve this spacing */\n${position === 'before' ? candidate + other : other + candidate}\nglobalThis.result = candidate.test(${JSON.stringify(spelling.startsWith('a') ? 'a\uD800' : '\uD800')});`;
        expect(run(source)).toBe(true);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: ['unicode-sets-regex', 'named-capturing-groups-regex', 'dotall-regex'].map(
            name => require('@babel/plugin-transform-' + name),
          ),
        })!.code!;
        expect(run(reference)).toBe(true);
        const result = transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'audit',
                native: {
                  transforms: {
                    regexpUnicodeSets: true,
                    regexpNamedCaptureGroups: true,
                    regexpDotAll: true,
                  },
                  helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
                },
              },
            ],
          }),
        );
        expect(result.status).toBe('bailout');
        if (result.status !== 'bailout') throw new Error('expected compatibility boundary');
        expect(result.reason).toBe('audit:regexp-unicode-code-point-out-of-range');
        expect(result.source).toBe(source);
      });
    }
  }
  test(`${mode}: lone surrogate character range lowers successfully`, () => {
    const source = String.raw`globalThis.result = /^[\uD800]$/v.test('\uD800');`;
    expect(run(source)).toBe(true);
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'audit',
            native: {
              transforms: { regexpUnicodeSets: true },
              helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
            },
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).not.toMatch(/\/v\b/);
    expect(run(result.code)).toBe(true);
  });
}
