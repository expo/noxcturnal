import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  { name: 'LF', separator: '\n' },
  { name: 'CRLF', separator: '\r\n' },
  { name: 'CR', separator: '\r' },
  { name: 'line separator', separator: '\u2028' },
  { name: 'paragraph separator', separator: '\u2029' },
];
describe.each(cases)('visitor location after $name', entry => {
  const source = `void '🙂';${entry.separator}3;`;
  const expected = { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } };
  let actual: unknown;
  beforeAll(() => {
    const plugin = defineNativePlugin({
      name: 'location-audit',
      visitors: [
        defineVisitor('NumericLiteral', {}, path => {
          actual = path.getLocation();
        }),
      ],
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'observe', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    expect(actual).toBeDefined();
  });
  test('public visitor reports line and UTF-16 column', () => {
    expect(actual).toEqual(expected);
  });
});

describe.each(cases)('unsupported diagnostic after $name', entry => {
  const source = `void '🙂';${entry.separator}3;`;
  let offsets: unknown;
  beforeAll(() => {
    const plugin = defineNativePlugin({
      name: 'diagnostic-location-audit',
      analyze: () => ({
        status: 'unsupported',
        reason: 'fixture',
        location: {
          start: { line: 2, column: 0 },
          end: { line: 2, column: 1 },
        },
      }),
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'observe', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('bailout');
    if (result.status !== 'bailout') throw new Error('expected bailout');
    expect(result.source).toBe(source);
    expect(result.diagnostics).toHaveLength(1);
    const diagnostic = result.diagnostics[0]!;
    offsets = [diagnostic.start, diagnostic.end];
  });
  test('line and column map to the requested source range', () => {
    const start = source.indexOf('3');
    expect(offsets).toEqual([start, start + 1]);
  });
});
