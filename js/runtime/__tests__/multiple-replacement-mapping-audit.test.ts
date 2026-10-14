import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

describe.each(['boundary', 'character'] as const)('%s maps', sourceMapMode => {
  describe.each([false, true])('replacement list: %s', multiple => {
    let original: ReturnType<typeof originalPositionFor>;
    beforeAll(() => {
      const plugin = defineNativePlugin({
        name: 'multiple-mapping',
        visitors: [
          defineVisitor('ExpressionStatement', {}, path => {
            const fragment = { code: 'next();', mapping: 'sourceless' as const };
            if (multiple) path.replaceWithMultiple([fragment]);
            else path.replaceWith(fragment);
          }),
        ],
      });
      const result = transform(
        'old();',
        'input.js',
        defineNativePipeline({
          phases: [{ name: 'replace', plugins: [plugin] }],
        }),
        { sourceMapMode },
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      expect(result.code).toBe('next();');
      original = originalPositionFor(
        new TraceMap({ version: 3, sources: ['input.js'], ...result.map }),
        { line: 1, column: 0 },
      );
    });
    test('preserves explicit sourceless fragment mapping', () => {
      expect(original).toEqual({ source: null, line: null, column: null, name: null });
    });
  });
});

test.each(['boundary', 'character'] as const)(
  'mixed replacement policies and labels remain distinct in %s maps',
  sourceMapMode => {
    const result = transform(
      'old();',
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'mixed',
            plugins: [
              defineNativePlugin({
                name: 'mixed',
                visitors: [
                  defineVisitor('ExpressionStatement', {}, path =>
                    path.replaceWithMultiple([
                      { code: 'first();', mapping: 'anchor-start', names: ['first'] },
                      { code: 'generated();', mapping: 'sourceless' },
                      { code: 'last();', mapping: 'anchor-start', names: ['last'] },
                    ]),
                  ),
                ],
              }),
            ],
          },
        ],
      }),
      { sourceMapMode },
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toBe('first();\ngenerated();\nlast();');
    const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
    expect(originalPositionFor(map, { line: 1, column: 0 })).toEqual({
      source: 'input.js',
      line: 1,
      column: 0,
      name: 'first',
    });
    expect(originalPositionFor(map, { line: 2, column: 0 })).toEqual({
      source: null,
      line: null,
      column: null,
      name: null,
    });
    expect(originalPositionFor(map, { line: 3, column: 0 })).toEqual({
      source: 'input.js',
      line: 1,
      column: 0,
      name: 'last',
    });
  },
);
