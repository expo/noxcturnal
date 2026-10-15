import { transformSync } from '@babel/core';
import { runInNewContext } from 'node:vm';
import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import { beforeAll, describe, expect, test } from 'vitest';

import { compile } from '../../compliance/runtime';

import { alignBabelBehavior } from '../transform';

test('aligns exponentiation assignment with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `let reads = 0; const object = { value: 2 }; const key = () => { reads++; return 'value'; };
object[key()] **= 3; globalThis.__result = [object.value, reads];`,
      filename: 'input.js',
      plugins: [exponentiation],
      noxcturnal: { transforms: { exponentiationOperator: true } },
      output: { mustNotMatch: [/\*\*/] },
    }),
  ).resolves.toEqual([8, 1]);
});

test('aligns computed super exponentiation assignment with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
class Base {
  get value() { calls.push(['get', this.current]); return this.current; }
  set value(value) { calls.push(['set', this.current, value]); this.current = value; }
}
class Child extends Base {
  current = 3;
  update() {
    const key = () => (calls.push('key'), 'value');
    return super[key()] **= 2;
  }
}
const child = new Child();
globalThis.__result = [child.update(), child.current, calls];`,
      filename: 'input.js',
      plugins: [exponentiation],
      noxcturnal: { transforms: { exponentiationOperator: true } },
      output: { mustNotMatch: [/\*\*=/] },
    }),
  ).resolves.toEqual([9, 9, ['key', ['get', 3], ['set', 3, 9]]]);
});

// Babel currently emits Math.pow for BigInts, making valid BigInt
// exponentiation throw. Noxcturnal intentionally retains the operator until
// Babel has a semantics-preserving lowering.
describe('Babel BigInt exponentiation divergence', () => {
  const expected = [18446744073709551616n, 81n];
  let babelOutcome: unknown;

  beforeAll(() => {
    const source = `let value = 3n;
value **= 4n;
globalThis.__result = [2n ** 64n, value];`;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      try {
        runInNewContext(code, context, { timeout: 1000 });
        return context.__result;
      } catch (error) {
        return { throws: (error as Error).name };
      }
    };
    const noxcturnal = compile(source, { transforms: { exponentiationOperator: true } });
    const reference = transformSync(source, {
      filename: 'input.js',
      babelrc: false,
      configFile: false,
      plugins: [exponentiation],
    });
    expect(reference?.code).toBeTypeOf('string');
    const babel = reference!.code!;
    expect(noxcturnal).toContain('**');
    expect(babel).not.toContain('**');
    expect(babel).toContain('Math.pow');
    expect(observe(source)).toEqual(expected);
    expect(observe(noxcturnal)).toEqual(expected);
    babelOutcome = observe(babel);
    expect(babelOutcome).toEqual({ throws: 'TypeError' });
  });

  test.fails('records Babel BigInt exponentiation divergence', () => {
    expect(babelOutcome).toEqual(expected);
  });
});
