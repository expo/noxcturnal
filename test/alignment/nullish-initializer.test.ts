import { transformSync } from '@babel/core';
import nullish from '@babel/plugin-transform-nullish-coalescing-operator';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  ['direct parameter', 'function initialize(value = object.value ?? fallback()) { return value; }'],
  [
    'nested parameter expression',
    'function initialize(value = [object.value ?? fallback()]) { return value[0]; }',
  ],
  [
    'destructured parameter',
    'function initialize({ value = object.value ?? fallback() } = {}) { return value; }',
  ],
  [
    'class field',
    'class C { value = object.value ?? fallback(); } function initialize() { return new C().value; }',
  ],
];

describe.each(cases)('recursive nullish %s', (_name, declaration) => {
  test('preserves the outer value and inner fallback effects', () => {
    const source = `
      const events = [], inner = [];
      let entered = false;
      const object = {
        get value() {
          events.push('get');
          if (!entered) { entered = true; inner.push(initialize()); return 1; }
          return null;
        },
      };
      function fallback() { events.push('fallback'); return 2; }
      ${declaration}
      globalThis.result = [initialize(), inner, events];
    `;
    const expected = [1, [2], ['get', 'get', 'fallback']];
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    expect(observe(source)).toEqual(expected);
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [[nullish, { loose: false }]],
    })!.code!;
    expect(observe(babel)).toEqual(expected);
    const code = compile(source, { transforms: { nullishCoalescingOperator: { loose: false } } });
    expect(code).not.toContain('??');
    expect(code).not.toContain('@babel/runtime');
    expect(observe(code)).toEqual(expected);
  });
});
