import { parseSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  { name: 'LF', separator: '\n', fails: false },
  { name: 'CRLF', separator: '\r\n', fails: false },
  { name: 'CR', separator: '\r', fails: true },
  { name: 'line separator', separator: '\u2028', fails: true },
  { name: 'paragraph separator', separator: '\u2029', fails: true },
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
  test('Babel parser location control', () => {
    const statement = parseSync(source, { configFile: false, babelrc: false })!.program.body[1]!;
    expect(statement.type).toBe('ExpressionStatement');
    if (statement.type !== 'ExpressionStatement') throw new Error('unexpected statement');
    const loc = statement.expression.loc!;
    expect({
      start: { line: loc.start.line, column: loc.start.column },
      end: { line: loc.end.line, column: loc.end.column },
    }).toEqual(expected);
  });
  (entry.fails ? test.fails : test)('public visitor reports line and UTF-16 column', () => {
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
  (entry.fails ? test.fails : test)('line and column map to the requested source range', () => {
    const start = source.indexOf('3');
    expect(offsets).toEqual([start, start + 1]);
  });
});
