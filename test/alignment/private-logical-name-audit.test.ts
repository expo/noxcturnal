import { transformSync } from '@babel/core';
import logical from '@babel/plugin-transform-logical-assignment-operators';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe.each([false, true])('private logical temporary, declared binding=%s', declared => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      ${declared ? 'const _private = 99;' : ''}
      class C {
        #x = 0;
        self() { return this; }
        read() { return [this.self().#x ||= 3, _private === 99]; }
      }
      globalThis.result = new C().read();
    `;
    const nox = compile(source, { transforms: { logicalAssignmentOperators: true } });
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [logical],
    })!.code!;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      if (declared) new Function('globalThis', code)(context);
      else new Function('_private', 'globalThis', code)(99, context);
      return context.result;
    };
    expect(observe(source)).toEqual([3, true]);
    expect(observe(babel)).toEqual([3, true]);
    expect(nox).not.toContain('||=');
    expect(nox).not.toContain('@babel/runtime');
    actual = observe(nox);
  });
  (declared ? test : test.fails)(
    'does not capture an existing reference with a generated temporary',
    () => {
      expect(actual).toEqual([3, true]);
    },
  );
});
