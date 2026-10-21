import { transformSync } from '@babel/core';
import logical from '@babel/plugin-transform-logical-assignment-operators';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'wrong-brand receiver before RHS',
    operator: '||=',
    receiver: '{}',
    getter: 'return 0;',
    setter: '',
    expected: ['receiver', 'TypeError'],
  },
  {
    name: 'throwing getter before RHS',
    operator: '&&=',
    receiver: 'this',
    getter: "events.push('get'); throw marker;",
    setter: '',
    expected: ['receiver', 'get', 'sentinel'],
  },
  {
    name: 'throwing setter after RHS',
    operator: '??=',
    receiver: 'this',
    getter: "events.push('get'); return null;",
    setter: "events.push('set'); throw marker;",
    expected: ['receiver', 'get', 'rhs', 'set', 'sentinel'],
  },
];
describe.each(cases)(
  'private logical assignment: $name',
  ({ operator, receiver, getter, setter, expected }) => {
    test('preserves abrupt-completion order without class lowering', () => {
      const source = `
      const events = [], marker = {};
      class C {
        get #value() { ${getter} }
        set #value(value) { ${setter} }
        self() { events.push('receiver'); return ${receiver}; }
        update() { return this.self().#value ${operator} (events.push('rhs'), 3); }
      }
      try { new C().update(); }
      catch (error) { events.push(error === marker ? 'sentinel' : error.name); }
      globalThis.result = events;
    `;
      const observe = (code: string) => {
        const context: Record<string, unknown> = {};
        new Function('globalThis', code)(context);
        return context.result;
      };
      expect(observe(source)).toEqual(expected);
      const babel = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [logical],
      })!.code!;
      expect(observe(babel)).toEqual(expected);
      const code = compile(source, { transforms: { logicalAssignmentOperators: true } });
      expect(code).not.toMatch(/(?:\|\|=|&&=|\?\?=)/);
      expect(code).not.toContain('@babel/runtime');
      expect(observe(code)).toEqual(expected);
    });
  },
);
