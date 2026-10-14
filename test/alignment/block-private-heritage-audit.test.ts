import { transformSync } from '@babel/core';
import blockScoping from '@babel/plugin-transform-block-scoping';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each([false, true])('private write in heritage, same-name inner method=%s', collision => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      class Outer {
        #value = 1;
        read() {
          let outcome;
          try {
            class Inner extends (this.#value = 3, Object) { ${collision ? '#value() {}' : '#other() {}'} }
            outcome = 'completed';
          } catch (error) { outcome = error.name; }
          return [this.#value, outcome];
        }
      }
      globalThis.result = new Outer().read();
    `;
    expect(observe(source)).toEqual([3, 'completed']);
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [blockScoping],
    })!.code!;
    expect(observe(reference)).toEqual([3, 'completed']);
    const code = compile(source, { transforms: { blockScoping: true } });
    expect(code).not.toMatch(/\blet\b/);
    expect(code).toContain('#value');
    actual = observe(code);
    if (collision) expect(actual).toEqual([1, 'TypeError']);
  });
  (collision ? test.fails : test)('resolves the heritage private name in the outer class', () => {
    expect(actual).toEqual([3, 'completed']);
  });
});
