import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { execute } from './runtime';

const require = createRequire(import.meta.url);

test('runtime async helpers execute through the declared helper package', async () => {
  const result = execute<{ result: Promise<number> }>(
    `async function read(value) { return await value; } globalThis.result = read(4);`,
    {
      helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
      transforms: { asyncFunctions: true },
    },
    { require },
  );
  await expect(result.result).resolves.toBe(4);
});

test('runtime class helpers preserve private field behavior', () => {
  const result = execute<{ result: number }>(
    `
      class Value {
        #value = 2;
        #read() { return this.#value; }
        read() { return this.#read(); }
      }
      globalThis.result = new Value().read();
    `,
    {
      helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
      transforms: {
        classProperties: { loose: true },
        privateMethods: true,
      },
    },
    { require },
  );
  expect(result.result).toBe(2);
});
