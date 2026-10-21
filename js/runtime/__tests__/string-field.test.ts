import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';
const cases = [
  { name: 'high surrogate', literal: String.raw`"\uD800"`, expected: '\uD800' },
  { name: 'low surrogate', literal: String.raw`"\uDC00"`, expected: '\uDC00' },
  { name: 'valid pair', literal: String.raw`"\uD83D\uDE00"`, expected: '😀' },
  { name: 'replacement character', literal: '"�d800"', expected: '�d800' },
  { name: 'leading NUL', literal: String.raw`"\u0000"`, expected: '\0' },
  {
    name: 'replacement plus surrogate',
    literal: String.raw`"\uFFFD\uD800"`,
    expected: '\uFFFD\uD800',
  },
];
test.each(cases)('$name survives literal, call-field, and retained-query transport', entry => {
  let value: unknown, argument: unknown, query: unknown;
  const source = `read(${entry.literal});`;
  const plugin = defineNativePlugin({
    name: 'string-field-audit',
    visitors: [
      defineVisitor('StringLiteral', { fields: ['value'] }, path => {
        value = path.node.value;
      }),
      defineVisitor('CallExpression', { fields: ['staticArgument'] }, path => {
        argument = path.node.staticArgument;
      }),
    ],
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'observe', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  const session = new NativeTransformSession(
    source,
    'input.js',
    {},
    packRouteManifest([], false, false, (1 << 6) - 1),
  );
  try {
    const calls = session.query({ calls: [{ callee: 'read', staticArguments: true }] }).calls.read;
    expect(calls).toHaveLength(1);
    query = calls![0]!.staticArgument;
  } finally {
    session.close();
  }
  expect({ literal: value, callArgument: argument, retainedQuery: query }).toEqual({
    literal: entry.expected,
    callArgument: entry.expected,
    retainedQuery: entry.expected,
  });
});
