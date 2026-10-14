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
    (multiple ? test.fails : test)('preserves explicit sourceless fragment mapping', () => {
      expect(original).toEqual({ source: null, line: null, column: null, name: null });
    });
  });
});
