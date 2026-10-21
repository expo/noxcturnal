import { transformSync } from '@babel/core';
import logical from '@babel/plugin-transform-logical-assignment-operators';
import nullish from '@babel/plugin-transform-nullish-coalescing-operator';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';
import { compile } from '../compliance/runtime';

describe.each([false, true])('private nullish completion, separate phases=%s', separated => {
  let code: string;
  beforeAll(() => {
    const source = `
      class C { #x = null; read() { return this.#x ??= 3; } }
      const instance = new C();
      globalThis.result = [instance.read(), instance.read()];
    `;
    if (separated) {
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({
          phases: [
            { name: 'logical', native: { transforms: { logicalAssignmentOperators: true } } },
            {
              name: 'nullish',
              native: { transforms: { nullishCoalescingOperator: { loose: false } } },
            },
          ],
        }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      code = result.code;
    } else {
      code = compile(source, {
        transforms: {
          logicalAssignmentOperators: true,
          nullishCoalescingOperator: { loose: false },
        },
      });
    }
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [logical, [nullish, { loose: false }]],
    })!.code!;
    const observe = (output: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', output)(context);
      return context.result;
    };
    expect(observe(source)).toEqual([3, 3]);
    expect(observe(babel)).toEqual([3, 3]);
    expect(observe(code)).toEqual([3, 3]);
    expect(babel).not.toContain('??');
    expect(code).not.toContain('??=');
    expect(code).not.toContain('@babel/runtime');
  });
  test('removes nullish syntax created by private assignment completion', () => {
    expect(code).not.toContain('??');
  });
});
