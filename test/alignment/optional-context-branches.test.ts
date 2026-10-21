import { transformSync } from '@babel/core';
import optional from '@babel/plugin-transform-optional-chaining';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'new.target optional call has no receiver and skips arguments when absent',
    source: `
      const events = [];
      function Target(value) { 'use strict'; return [this === undefined, value]; }
      function Probe() { return new.target?.(events.push('arg')) ?? ['absent']; }
      globalThis.result = [Probe(), Reflect.construct(Probe, [], Target), events];
    `,
    expected: [['absent'], [true, 1], ['arg']],
  },
  {
    name: 'optional deletion in parameter defaults skips null keys and preserves references',
    source: `
      const events = [];
      const object = { get value() { events.push('get'); return 3; } };
      function key() { events.push('key'); return 'value'; }
      function remove(input, result = delete input?.[key()]) { return result; }
      globalThis.result = [remove(null), remove(object), Object.hasOwn(object, 'value'), events];
    `,
    expected: [true, true, false, ['key']],
  },
  {
    name: 'optional deletion in strict parameter defaults preserves rejection before body',
    source: `
      'use strict';
      const events = [], object = {};
      Object.defineProperty(object, 'value', { value: 3, configurable: false });
      function remove(result = delete object?.value) { events.push('body'); }
      try { remove(); } catch (error) { events.push(error.name); }
      globalThis.result = [Object.hasOwn(object, 'value'), events];
    `,
    expected: [true, ['TypeError']],
  },
];
describe.each(cases)('$name', ({ source, expected }) => {
  test('matches native and Babel with optional-chain lowering alone', () => {
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    expect(observe(source)).toEqual(expected);
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [[optional, { loose: false }]],
    })!.code!;
    expect(observe(babel)).toEqual(expected);
    const code = compile(source, { transforms: { optionalChaining: { loose: false } } });
    expect(code).not.toContain('?.');
    expect(code).not.toContain('@babel/runtime');
    expect(observe(code)).toEqual(expected);
  });
});
