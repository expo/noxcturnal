import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  { action: 'insertBefore', mapping: 'anchor-start', fails: true },
  { action: 'insertAfter', mapping: 'anchor-start', fails: true },
  { action: 'insertBefore', mapping: 'sourceless', fails: false },
  { action: 'insertAfter', mapping: 'sourceless', fails: false },
  { action: 'replaceWith', mapping: 'anchor-start', fails: false },
] as const;
describe.each(cases)('$action with $mapping', entry => {
  let original: ReturnType<typeof originalPositionFor>;
  beforeAll(() => {
    const plugin = defineNativePlugin({
      name: 'insertion-mapping',
      visitors: [
        defineVisitor('ExpressionStatement', {}, path => {
          path[entry.action]({ code: 'next();', mapping: entry.mapping });
        }),
      ],
    });
    const result = transform(
      'old();',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'insert', plugins: [plugin] }] }),
      { sourceMapMode: 'character' },
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    const column = result.code.indexOf('next');
    expect(column).toBe(entry.action === 'insertAfter' ? 6 : 0);
    original = originalPositionFor(
      new TraceMap({ version: 3, sources: ['input.js'], ...result.map }),
      { line: 1, column },
    );
  });
  (entry.fails ? test.fails : test)('honors the fragment mapping policy', () => {
    expect(original).toMatchObject(
      entry.mapping === 'sourceless'
        ? { source: null, line: null, column: null }
        : { source: 'input.js', line: 1, column: entry.action === 'insertAfter' ? 6 : 0 },
    );
  });
});
