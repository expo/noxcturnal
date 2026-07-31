import { expect, test } from 'vitest';
import { execute } from './runtime';

test('async functions preserve await, rejection, this, and finally', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const receiver = {
        value: 4,
        async read(input) {
          const log = [];
          try {
            log.push(await input);
            throw new Error('expected');
          } catch (error) {
            log.push(error.message, this.value);
          } finally {
            log.push('finally');
          }
          return log;
        },
      };
      globalThis.result = receiver.read(Promise.resolve(2));
    `,
    { transforms: { asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([2, 'expected', 4, 'finally']);
});

test('async generators preserve await, yield, delegation, and return values', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      async function* nested() { yield await Promise.resolve(2); return 3; }
      async function* values() {
        yield 1;
        const returned = yield* nested();
        yield returned;
      }
      globalThis.result = (async () => {
        const output = [];
        for await (const value of values()) output.push(value);
        return output;
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([1, 2, 3]);
});

test('for-await awaits values and closes the iterator after break', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          let value = 0;
          return {
            next() { calls.push('next'); return { value: Promise.resolve(++value), done: false }; },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      globalThis.result = (async () => {
        for await (const value of iterable) { calls.push(value); break; }
        return calls;
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['next', 1, 'return']);
});

test('await-using disposes resources after completion and before rejection escapes', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      globalThis.result = (async () => {
        try {
          await using resource = {
            async [Symbol.asyncDispose]() { calls.push('dispose'); },
          };
          calls.push('body');
          throw new Error('failure');
        } catch (error) {
          calls.push(error.message);
        }
        return calls;
      })();
    `,
    { transforms: { explicitResourceManagement: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['body', 'dispose', 'failure']);
});

test('async arrows preserve lexical this and arguments across await', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      function make(prefix) {
        return async (value = this.value) => [prefix, await value, arguments[0], this.value];
      }
      const read = make.call({ value: Promise.resolve(4) }, 'prefix');
      globalThis.result = read.call({ value: 99 });
    `,
    { transforms: { parameters: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['prefix', 4, 'prefix', expect.any(Promise)]);
  expect(await (await result.result)[3]).toBe(4);
});

test('separate async invocations do not share arguments or generator state', async () => {
  const result = execute<{ result: Promise<number[]> }>(
    `
      async function read(value) {
        await Promise.resolve();
        return value;
      }
      globalThis.result = Promise.all([read(1), read(2), read(3)]);
    `,
    { transforms: { asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([1, 2, 3]);
});

test('async generators accept thrown errors and run finally blocks on return', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const log = [];
      async function* values() {
        try {
          try { yield 1; } catch (error) { log.push(error.message); yield 2; }
          yield 3;
        } finally {
          log.push('finally');
        }
      }
      globalThis.result = (async () => {
        const iterator = values();
        const first = await iterator.next();
        const second = await iterator.throw(new Error('injected'));
        const returned = await iterator.return(9);
        return [first.value, second.value, returned.value, returned.done, log];
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([1, 2, 9, true, ['injected', 'finally']]);
});

test('for-await closes a synchronous iterator when an awaited value rejects', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() { calls.push('next'); return { value: Promise.reject(new Error('failure')), done: false }; },
            return() { calls.push('return'); return { done: true }; },
          };
        },
      };
      globalThis.result = (async () => {
        try { for await (const value of iterable) void value; }
        catch (error) { calls.push(error.message); }
        return calls;
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual(['next', 'failure']);
});
