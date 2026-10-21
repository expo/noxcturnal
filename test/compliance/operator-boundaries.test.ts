import { expect, test } from 'vitest';
import { compile } from './runtime';

import type { PreflightPlan } from '../../js';

const cases = [
  {
    name: 'dynamic BigInt exponentiation uses Math.pow behavior',
    source: `function power(left, right) {
  return left ** right;
}
try {
  globalThis.__result = String(power(2n, 3n));
} catch (error) {
  globalThis.__result = error.name;
}`,
    plan: { transforms: { exponentiationOperator: true } },
    expected: 'TypeError',
  },
  {
    name: 'exponentiation uses lexical Math lookup',
    source: `function power(Math, left, right) {
  return left ** right;
}
try {
  globalThis.__result = power(null, 2, 3);
} catch (error) {
  globalThis.__result = error.name;
}`,
    plan: { transforms: { exponentiationOperator: true } },
    expected: 'TypeError',
  },
  {
    name: 'strict optional method call uses own call dispatch',
    source: `function method() {
  return 'method';
}
method.call = () => 'override';
const object = { method };
globalThis.__result = object.method?.();`,
    plan: { transforms: { optionalChaining: { loose: false } } },
    expected: 'override',
  },
  {
    name: 'strict optional call uses noncallable call-property behavior',
    source: `const object = {
  method: {
    call() {
      return 'accepted';
    },
  },
};
try {
  globalThis.__result = object.method?.();
} catch (error) {
  globalThis.__result = error.name;
}`,
    plan: { transforms: { optionalChaining: { loose: false } } },
    expected: 'accepted',
  },
  {
    name: 'boxed BigInt exponentiation throws during Math.pow coercion',
    source: `try {
  globalThis.__result = String(Object(2n) ** Object(3n));
} catch (error) {
  globalThis.__result = error.name;
}`,
    plan: { transforms: { exponentiationOperator: true } },
    expected: 'TypeError',
  },
  {
    name: 'BigInt-producing object exponentiation throws during Math.pow coercion',
    source: `const calls = [];
const left = {
  valueOf() {
    calls.push('left');
    return 2n;
  },
};
const right = {
  valueOf() {
    calls.push('right');
    return 3n;
  },
};
try {
  globalThis.__result = String(left ** right);
} catch (error) {
  globalThis.__result = [error.name, calls];
}`,
    plan: { transforms: { exponentiationOperator: true } },
    expected: ['TypeError', ['left']],
  },
] satisfies readonly { name: string; source: string; plan: PreflightPlan; expected: unknown }[];

test.each(cases)('$name', ({ source, plan, expected }) => {
  const code = compile(source, { ...plan, helpers: { mode: 'inline' } });
  expect(code).not.toMatch(/\*\*|\?\./);
  expect(code).not.toContain('@babel/runtime');
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  expect(context.__result).toEqual(expected);
});
