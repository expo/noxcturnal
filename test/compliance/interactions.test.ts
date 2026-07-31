import { expect, test } from 'vitest';
import { execute } from './runtime';

test('legacy language transforms compose without changing observable behavior', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      class Reader {
        prefix = 'value';
        async read({ value = 1 } = {}) {
          const callbacks = [];
          for (let index = 0; index < value; index++) callbacks.push(() => index);
          return { [this.prefix]: callbacks.map(callback => callback()), ...{ done: true } };
        }
      }
      globalThis.result = new Reader().read({ value: 3 }).then(result => [result.value, result.done]);
    `,
    {
      transforms: {
        blockScoping: true,
        classes: true,
        classProperties: { loose: true },
        destructuring: { useBuiltIns: true },
        parameters: true,
        objectRestSpread: { loose: true, useBuiltIns: true },
        asyncFunctions: true,
      },
    },
  );
  await expect(result.result).resolves.toEqual([[0, 1, 2], true]);
});

test('TypeScript, class fields, optional chaining, and nullish coalescing compose', () => {
  const result = execute<{ result: number }>(
    `
      interface Input { value?: number }
      class Reader {
        fallback: number = 4;
        read(input?: Input): number { return input?.value ?? this.fallback; }
      }
      globalThis.result = new Reader().read({});
    `,
    {
      typescript: 'strip',
      transforms: {
        classProperties: { loose: true },
        optionalChaining: { loose: false },
        nullishCoalescingOperator: { loose: false },
      },
    },
    {},
    'input.ts',
  );
  expect(result.result).toBe(4);
});

test('Flow match, async lowering, and parameters compose', async () => {
  const result = execute<{ result: Promise<string[]> }>(
    `
      // @flow
      async function classify(values: Array<number> = []): Promise<Array<string>> {
        return Promise.all(values.map(async value => match (await value) {
          0 => 'zero',
          const count => String(count),
        }));
      }
      globalThis.result = classify([0, 2]);
    `,
    { transforms: { parameters: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['zero', '2']);
});

test('operator transforms preserve a combined computed assignment chain', () => {
  const result = execute<{ result: unknown[] }>(
    `
      let keys = 0;
      const key = () => (keys++, 'value');
      const target = { value: null };
      target[key()] ??= ({ nested: { value: 2 } })?.nested?.value ?? 3 ** 2;
      globalThis.result = [target.value, keys];
    `,
    {
      transforms: {
        logicalAssignmentOperators: true,
        optionalChaining: { loose: false },
        nullishCoalescingOperator: { loose: false },
        exponentiationOperator: true,
      },
    },
  );
  expect(result.result).toEqual([2, 1]);
});
