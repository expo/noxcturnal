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

test('await using reads asyncDispose once, preserves its receiver, and awaits completion', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      const resource = {
        value: 42,
        get [Symbol.asyncDispose]() {
          calls.push('get');
          return async function () {
            calls.push(['start', this === resource, this.value]);
            await Promise.resolve();
            calls.push('finish');
          };
        },
      };
      globalThis.result = (async () => {
        { await using value = resource; calls.push(value === resource); }
        calls.push('after');
        return calls;
      })();
    `,
    { transforms: { explicitResourceManagement: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([
    'get',
    true,
    ['start', true, 42],
    'finish',
    'after',
  ]);
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

test('async functions assimilate thenables with specified suspension ordering', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const log = [];
      const thenable = {
        get then() {
          log.push('get:then');
          return resolve => { log.push('call:then'); resolve(42); };
        },
      };
      async function read() {
        log.push('start');
        const value = await thenable;
        log.push('after:await');
        return value;
      }
      const promise = read();
      log.push('after:call');
      globalThis.result = promise.then(value => [value, log]);
    `,
    { transforms: { asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([
    42,
    ['start', 'get:then', 'after:call', 'call:then', 'after:await'],
  ]);
});

test('async functions convert synchronous throws to rejection and adopt without reusing promises', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const original = Promise.resolve(42);
      async function adopt() { return original; }
      async function fail() { throw new Error('failure'); }
      let synchronousThrow = false;
      let failed;
      try { failed = fail(); } catch { synchronousThrow = true; }
      const adopted = adopt();
      globalThis.result = Promise.all([
        adopted,
        failed.catch(error => error.message),
      ]).then(([value, message]) => [value, message, synchronousThrow, adopted !== original]);
    `,
    { transforms: { asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([42, 'failure', false, true]);
});

test('async function forms preserve Babel names, lengths, and constructability', () => {
  const result = execute<{ result: unknown[] }>(
    `
      async function declared(a, b = 1, c) {}
      const inferred = async function (a, b) {};
      const object = { async read(a) {} };
      const arrow = async (a, b = 1) => a;
      const functions = [declared, inferred, object.read, arrow];
      const constructErrors = functions.map(value => {
        try { Reflect.construct(value, []); return false; }
        catch (error) { return error instanceof TypeError; }
      });
      globalThis.result = [
        functions.map(value => [value.name, value.length]),
        constructErrors,
      ];
    `,
    { transforms: { asyncFunctions: true } },
  );
  expect(result.result).toEqual([
    [
      ['declared', 1],
      ['inferred', 2],
      ['read', 1],
      ['arrow', 1],
    ],
    [false, false, true, false],
  ]);
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

test('async generators serialize queued requests and await yielded values', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const calls = [];
      async function* values() {
        try {
          calls.push('start');
          const sent = yield Promise.resolve(1);
          calls.push(['sent', sent]);
          yield await Promise.resolve(sent * 2);
          return 9;
        } finally {
          calls.push('finally');
        }
      }
      globalThis.result = (async () => {
        const iterator = values();
        const first = iterator.next();
        const second = iterator.next(3);
        const returned = iterator.return(7);
        const results = await Promise.all([first, second, returned]);
        return [results.map(result => [result.value, result.done]), calls];
      })();
    `,
    { transforms: { asyncGeneratorFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([
    [
      [1, false],
      [6, false],
      [7, true],
    ],
    ['start', ['sent', 3], 'finally'],
  ]);
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

test('for-await validates async iterator next and return results', async () => {
  const result = execute<{ result: Promise<unknown[]> }>(
    `
      const inspect = async kind => {
        const calls = [];
        const iterable = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                calls.push('next');
                return Promise.resolve(kind === 'next' ? 1 : { value: 1, done: false });
              },
              return() { calls.push('return'); return Promise.resolve(1); },
            };
          },
        };
        let errorName;
        try { for await (const value of iterable) { calls.push(value); break; } }
        catch (error) { errorName = error.name; }
        return [errorName, calls];
      };
      globalThis.result = Promise.all([inspect('next'), inspect('return')]);
    `,
    { transforms: { asyncGeneratorFunctions: true, asyncFunctions: true } },
  );
  await expect(result.result).resolves.toEqual([
    ['TypeError', ['next']],
    ['TypeError', ['next', 1, 'return']],
  ]);
});
