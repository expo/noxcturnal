import { transformSync } from '@babel/core';
import nullish from '@babel/plugin-transform-nullish-coalescing-operator';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const expected = [3, ['get']];
describe.each([false, true])('nullish identifier under with, static write=%s', written => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      var value = 1;
      ${written ? 'value = 2;' : ''}
      const events = [];
      let result;
      const object = {
        get value() { events.push('get'); return events.length === 1 ? 3 : undefined; },
      };
      with (object) { result = value ?? 9; }
      globalThis.result = [result, events];
    `;
    const nox = compile(
      source,
      {
        transforms: { nullishCoalescingOperator: { loose: false } },
      },
      'input.cjs',
    );
    const babel = transformSync(source, {
      sourceType: 'script',
      configFile: false,
      babelrc: false,
      plugins: [[nullish, { loose: false }]],
    })!.code!;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    expect(observe(source)).toEqual(expected);
    expect(observe(babel)).toEqual([9, ['get', 'get']]);
    expect(nox).not.toContain('??');
    expect(nox).not.toContain('@babel/runtime');
    actual = observe(nox);
  });
  (written ? test : test.fails)('reads the dynamically resolved getter only once', () => {
    expect(actual).toEqual(expected);
  });
});
