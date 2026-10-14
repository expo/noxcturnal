import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import logical from '@babel/plugin-transform-logical-assignment-operators';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const expected = [3, ['get', [true, 3]]];
describe.each([false, true])('logical assignment regexp receiver, named=%s', named => {
  let actual: unknown;
  beforeAll(() => {
    const source = `
      let receiver;
      const events = [];
      Object.defineProperty(RegExp.prototype, 'auditValue', {
        get() { receiver = this; events.push('get'); return 0; },
        set(value) { events.push([this === receiver, value]); },
      });
      ${named ? 'const expression = /x/;' : ''}
      const value = ${named ? 'expression' : '/x/'}.auditValue ||= 3;
      globalThis.result = [value, events];
    `;
    const nox = compile(source, { transforms: { logicalAssignmentOperators: true } });
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [logical],
    })!.code!;
    const observe = (code: string) => runInNewContext(code, {}, { timeout: 1000 });
    expect(observe(source)).toEqual(expected);
    expect(observe(babel)).toEqual(expected);
    expect(nox).not.toContain('||=');
    expect(nox).not.toContain('@babel/runtime');
    actual = observe(nox);
  });
  (named ? test : test.fails)('reads and writes the same regexp instance', () => {
    expect(actual).toEqual(expected);
  });
});
