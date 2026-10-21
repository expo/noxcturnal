import { transformSync } from '@babel/core';
import logical from '@babel/plugin-transform-logical-assignment-operators';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'dynamically resolved receiver under with',
    fails: true,
    source: `
      const first = { value: 0 }, second = { value: 0 };
      var receiver = first;
      let reads = 0, result;
      const scope = { get receiver() { return ++reads === 1 ? first : second; } };
      with (scope) { result = receiver.value ||= 3; }
      globalThis.result = [result, first.value, second.value, reads];
    `,
    expected: [3, 3, 0, 1],
    babelExpected: [3, 0, 3, 2],
  },
  {
    name: 'computed key mutates a lexical receiver',
    fails: false,
    source: `
      const first = { value: 0 }, second = { value: 0 };
      let receiver = first;
      function key() { receiver = second; return 'value'; }
      const result = receiver[key()] ||= 3;
      globalThis.result = [result, first.value, second.value];
    `,
    expected: [3, 3, 0],
    babelExpected: [3, 3, 0],
  },
];
describe.each(cases)(
  'logical-assignment reference: $name',
  ({ source, expected, babelExpected, fails }) => {
    let actual: unknown;
    beforeAll(() => {
      const code = compile(
        source,
        { transforms: { logicalAssignmentOperators: true } },
        'input.cjs',
      );
      const babel = transformSync(source, {
        sourceType: 'script',
        configFile: false,
        babelrc: false,
        plugins: [logical],
      })!.code!;
      const observe = (output: string) => {
        const context: Record<string, unknown> = {};
        new Function('globalThis', output)(context);
        return context.result;
      };
      expect(observe(source)).toEqual(expected);
      expect(observe(babel)).toEqual(babelExpected);
      expect(code).not.toContain('||=');
      expect(code).not.toContain('@babel/runtime');
      actual = observe(code);
    });
    (fails ? test.fails : test)('preserves the original assignment receiver', () => {
      expect(actual).toEqual(expected);
    });
  },
);
