import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';
const cases = [
  { name: 'high surrogate', literal: String.raw`"\uD800"`, expected: '\uD800', fails: true },
  { name: 'low surrogate', literal: String.raw`"\uDC00"`, expected: '\uDC00', fails: true },
  { name: 'valid pair', literal: String.raw`"\uD83D\uDE00"`, expected: '😀', fails: false },
  { name: 'replacement character', literal: '"�d800"', expected: '�d800', fails: false },
];
describe.each(cases)('$name', entry => {
  let value: unknown, argument: unknown, query: unknown;
  beforeAll(() => {
    const source = `read(${entry.literal});`;
    expect(new Function(`return ${entry.literal}`)()).toBe(entry.expected);
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
      const calls = session.query({ calls: [{ callee: 'read', staticArguments: true }] }).calls
        .read;
      expect(calls).toHaveLength(1);
      query = calls![0]!.staticArgument;
    } finally {
      session.close();
    }
    expect([value, argument, query].every(item => typeof item === 'string')).toBe(true);
  });
  const check = entry.fails ? test.fails : test;
  check('string literal field preserves JavaScript code units', () =>
    expect(value).toBe(entry.expected),
  );
  check('call argument field preserves JavaScript code units', () =>
    expect(argument).toBe(entry.expected),
  );
  check('retained call query preserves JavaScript code units', () =>
    expect(query).toBe(entry.expected),
  );
});
