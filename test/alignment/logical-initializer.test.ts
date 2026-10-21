import { transformSync } from '@babel/core';
import logical from '@babel/plugin-transform-logical-assignment-operators';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const expected = [3, 3, 3];
describe.each(['body', 'parameter', 'field'])('logical-assignment reentry in %s', kind => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      const first = { value: 0 }, second = { value: 0 };
      let receiver = first, entered = false;
      function get() { return receiver; }
      function key() {
        if (!entered) { entered = true; receiver = second; initialize(); }
        return 'value';
      }
      ${
        kind === 'field'
          ? 'class C { value = get()[key()] ||= 3; } function initialize() { return new C().value; }'
          : kind === 'parameter'
            ? 'function initialize(value = get()[key()] ||= 3) { return value; }'
            : 'function initialize() { return get()[key()] ||= 3; }'
      }
      globalThis.result = [initialize(), first.value, second.value];
    `;
    const nox = compile(source, { transforms: { logicalAssignmentOperators: true } });
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [logical],
    })!.code!;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    expect(observe(source)).toEqual(expected);
    expect(observe(babel)).toEqual(kind === 'body' ? expected : [3, 0, 3]);
    expect(nox).not.toContain('||=');
    expect(nox).not.toContain('@babel/runtime');
    actual = observe(nox);
  });
  (kind === 'body' ? test : test.fails)(
    'retains the outer assignment receiver across reentry',
    () => {
      expect(actual).toEqual(expected);
    },
  );
});
