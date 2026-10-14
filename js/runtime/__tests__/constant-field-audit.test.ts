import { beforeAll, describe, expect, test, vi } from 'vitest';
import { defineNativePlugin, defineNativePipeline, defineVisitor, transform } from '../../index';
import { NativeTransformSession } from '../session';
const cases = [
  { name: 'null', route: 'NullLiteral', source: 'null;', kind: 'null', value: null, fails: true },
  {
    name: 'numeric string',
    route: 'StringLiteral',
    source: '"3";',
    kind: 'string',
    value: '3',
    fails: true,
  },
  {
    name: 'boolean string',
    route: 'StringLiteral',
    source: '"true";',
    kind: 'string',
    value: 'true',
    fails: true,
  },
  {
    name: 'empty string',
    route: 'StringLiteral',
    source: '"";',
    kind: 'string',
    value: '',
    fails: false,
  },
  {
    name: 'ordinary string',
    route: 'StringLiteral',
    source: '"word";',
    kind: 'string',
    value: 'word',
    fails: false,
  },
  { name: 'number', route: 'NumericLiteral', source: '3;', kind: 'number', value: 3, fails: false },
  {
    name: 'boolean',
    route: 'BooleanLiteral',
    source: 'true;',
    kind: 'boolean',
    value: true,
    fails: false,
  },
  {
    name: 'conditional',
    route: 'ConditionalExpression',
    source: 'true ? 3 : 4;',
    kind: 'number',
    value: 3,
    fails: 'retained',
  },
  {
    name: 'sequence',
    route: 'SequenceExpression',
    source: '1, 3;',
    kind: 'number',
    value: 3,
    fails: 'retained',
  },
  {
    name: 'parenthesized',
    route: 'ParenthesizedExpression',
    source: '(3);',
    kind: 'number',
    value: 3,
    fails: 'retained',
  },
  {
    name: 'unary',
    route: 'UnaryExpression',
    source: '-3;',
    kind: 'number',
    value: -3,
    fails: false,
  },
  {
    name: 'binary',
    route: 'BinaryExpression',
    source: '1 + 2;',
    kind: 'number',
    value: 3,
    fails: false,
  },
  {
    name: 'logical',
    route: 'LogicalExpression',
    source: 'false || 3;',
    kind: 'number',
    value: 3,
    fails: false,
  },
  {
    name: 'overflow literal',
    route: 'NumericLiteral',
    source: '1e400;',
    kind: 'number',
    value: Infinity,
    fails: true,
  },
  {
    name: 'positive infinity',
    route: 'BinaryExpression',
    source: '1 / 0;',
    kind: 'number',
    value: Infinity,
    fails: true,
  },
  {
    name: 'negative infinity',
    route: 'UnaryExpression',
    source: '-1e400;',
    kind: 'number',
    value: -Infinity,
    fails: true,
  },
  {
    name: 'NaN',
    route: 'BinaryExpression',
    source: '0 / 0;',
    kind: 'number',
    value: NaN,
    fails: true,
  },
] as const;
for (const retained of [false, true])
  describe.each(cases)(`retained=${retained}: $name`, entry => {
    let actual: unknown[] = [];
    beforeAll(() => {
      const visitor = defineVisitor(
        entry.route,
        { scope: retained, fields: ['constantKind', 'constantValue'] },
        p => actual.push([p.node.constantKind, p.node.constantValue]),
      );
      const calls = vi.spyOn(NativeTransformSession.prototype, 'nextRoutedPacked');
      try {
        const result = transform(
          entry.source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'read',
                plugins: [defineNativePlugin({ name: 'reader', visitors: [visitor] })],
              },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        if (retained) expect(calls).toHaveBeenCalled();
        else expect(calls).not.toHaveBeenCalled();
        expect(actual).toHaveLength(1);
      } finally {
        calls.mockRestore();
      }
    });
    (entry.fails === true || (entry.fails === 'retained' && retained) ? test.fails : test)(
      'delivers the requested constant kind and typed value',
      () => {
        expect(actual).toEqual([[entry.kind, entry.value]]);
      },
    );
  });
