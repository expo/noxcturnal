import { runInNewContext } from 'node:vm';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const cases = [
  {
    name: 'unbound identifier reads its global accessor once',
    source: `
      const events = []; let stored = 3;
      Object.defineProperty(globalThis, 'value', {
        get() { events.push('get'); return stored; },
        set(value) { events.push(['set', value]); stored = value; },
      });
      const result = value **= (events.push('rhs'), 2);
      globalThis.result = [result, stored, events];
    `,
    expected: [9, 9, ['get', 'rhs', ['set', 9]]],
  },
  {
    name: 'unbound receiver is cached before the key and RHS',
    source: `
      const events = []; const object = { x: 3 };
      Object.defineProperty(globalThis, 'receiver', {
        get() { events.push('receiver'); return object; },
      });
      const result = receiver[(events.push('key'), 'x')] **= (events.push('rhs'), 2);
      globalThis.result = [result, object.x, events];
    `,
    expected: [9, 9, ['receiver', 'key', 'rhs']],
  },
  {
    name: 'effectful private receiver and accessor preserve evaluation order',
    source: `
      const events = [];
      class C {
        stored = 3;
        get #value() { events.push('get'); return this.stored; }
        set #value(value) { events.push(['set', value]); this.stored = value; }
        update() {
          const receiver = () => (events.push('receiver'), this);
          return receiver().#value **= (events.push('rhs'), 2);
        }
      }
      const instance = new C();
      globalThis.result = [instance.update(), instance.stored, events];
    `,
    expected: [9, 9, ['receiver', 'get', 'rhs', ['set', 9]]],
  },
  {
    name: 'private brand failure precedes RHS evaluation',
    source: `
      const events = [];
      class C {
        #value = 3;
        update(receiver) { return receiver.#value **= (events.push('rhs'), 2); }
      }
      try { new C().update({}); } catch (error) { events.push(error.name); }
      globalThis.result = events;
    `,
    expected: ['TypeError'],
  },
];

describe.each(cases)('$name', ({ source, expected }) => {
  test('preserves native observations with exponentiation lowering alone', () => {
    expect(runInNewContext(source, {}, { timeout: 1000 })).toEqual(expected);
    const code = compile(source, { transforms: { exponentiationOperator: true } });
    expect(code).not.toContain('**=');
    expect(code).toContain('Math.pow');
    expect(code).not.toContain('@babel/runtime');
    expect(runInNewContext(code, {}, { timeout: 1000 })).toEqual(expected);
  });
});
