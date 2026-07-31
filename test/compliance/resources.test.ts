import { expect, test } from 'vitest';
import { execute } from './runtime';

test('using disposes resources in reverse declaration order', () => {
  const result = execute<{ result: string[] }>(
    `
      const calls = [];
      {
        using first = { [Symbol.dispose]() { calls.push('first'); } };
        using second = { [Symbol.dispose]() { calls.push('second'); } };
        calls.push('body');
      }
      globalThis.result = calls;
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['body', 'second', 'first']);
});

test('using permits nullish resources without registering disposal', () => {
  const result = execute<{ result: string[] }>(
    `
      const calls = [];
      { using first = null; using second = undefined; calls.push('body'); }
      globalThis.result = calls;
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['body']);
});

test('using rejects non-disposable resources', () => {
  const result = execute<{ result: boolean }>(
    `
      try { { using value = {}; void value; } }
      catch (error) { globalThis.result = error instanceof TypeError; }
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toBe(true);
});

test('disposal errors suppress an error thrown by the body', () => {
  const result = execute<{ result: unknown[] }>(
    `
      try {
        using value = { [Symbol.dispose]() { throw new Error('dispose'); } };
        throw new Error('body');
      } catch (error) {
        globalThis.result = [error.name, error.error.message, error.suppressed.message];
      }
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['SuppressedError', 'dispose', 'body']);
});

test('using reads the disposer once and calls it with the resource as receiver', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      const resource = {
        value: 42,
        get [Symbol.dispose]() {
          calls.push('get');
          return function () { calls.push(['call', this === resource, this.value]); };
        },
      };
      { using value = resource; calls.push(value === resource); }
      globalThis.result = calls;
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['get', true, ['call', true, 42]]);
});

test('failed resource registration still disposes earlier resources', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      try {
        using first = { [Symbol.dispose]() { calls.push('dispose:first'); } };
        using invalid = {};
        calls.push('unreachable');
      } catch (error) {
        calls.push(error instanceof TypeError);
      }
      globalThis.result = calls;
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['dispose:first', true]);
});

test('a failing disposer suppresses a later resource initializer failure', () => {
  const result = execute<{ result: unknown[] }>(
    `
      try {
        using first = { [Symbol.dispose]() { throw new Error('dispose'); } };
        using second = (() => { throw new Error('initialize'); })();
        void second;
      } catch (error) {
        globalThis.result = [error.name, error.error.message, error.suppressed.message];
      }
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['SuppressedError', 'dispose', 'initialize']);
});

test('multiple disposal errors form the specified suppression chain', () => {
  const result = execute<{ result: unknown[] }>(
    `
      try {
        using first = { [Symbol.dispose]() { throw new Error('first'); } };
        using second = { [Symbol.dispose]() { throw new Error('second'); } };
        throw new Error('body');
      } catch (error) {
        globalThis.result = [
          error.name,
          error.error.message,
          error.suppressed.name,
          error.suppressed.error.message,
          error.suppressed.suppressed.message,
        ];
      }
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['SuppressedError', 'first', 'SuppressedError', 'second', 'body']);
});

test('using disposes before an abrupt return completes', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      function read() {
        using value = { [Symbol.dispose]() { calls.push('dispose'); } };
        calls.push('body');
        return calls.slice();
      }
      const returned = read();
      globalThis.result = [returned, calls];
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual([['body'], ['body', 'dispose']]);
});

test('await using awaits async disposal and falls back to synchronous disposal', async () => {
  const context = execute<{ result: Promise<string[]> }>(
    `
      globalThis.result = (async () => {
        const calls = [];
        {
          await using asyncValue = {
            [Symbol.asyncDispose]() {
              calls.push('async:start');
              return Promise.resolve().then(() => calls.push('async:end'));
            },
          };
          await using syncFallback = {
            [Symbol.dispose]() { calls.push('sync'); }
          };
          calls.push('body');
        }
        calls.push('after');
        return calls;
      })();
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  await expect(context.result).resolves.toEqual([
    'body',
    'sync',
    'async:start',
    'async:end',
    'after',
  ]);
});

test('await using follows async lookup fallback and nullish suspension semantics', async () => {
  const context = execute<{ result: Promise<unknown[]> }>(
    `
      globalThis.result = (async () => {
        const calls = [];
        const fallback = {
          get [Symbol.asyncDispose]() { calls.push('get:async'); return undefined; },
          get [Symbol.dispose]() {
            calls.push('get:sync');
            return function () { calls.push(['dispose:sync', this === fallback]); };
          },
        };
        { await using value = fallback; calls.push(value === fallback); }
        const invalid = {
          get [Symbol.asyncDispose]() { calls.push('get:bad-async'); return 1; },
          get [Symbol.dispose]() { calls.push('get:bad-sync'); return () => {}; },
        };
        try { await using value = invalid; void value; }
        catch (error) { calls.push(error instanceof TypeError); }
        const nullish = (async () => {
          await using value = null;
          calls.push('nullish:body');
        })();
        calls.push('after:nullish-call');
        await nullish;
        calls.push('after:nullish-await');
        return calls;
      })();
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  await expect(context.result).resolves.toEqual([
    'get:async',
    'get:sync',
    true,
    ['dispose:sync', true],
    'get:bad-async',
    true,
    'nullish:body',
    'after:nullish-call',
    'after:nullish-await',
  ]);
});

test('an async disposal rejection suppresses a body throw', async () => {
  const context = execute<{ result: Promise<unknown[]> }>(
    `
      globalThis.result = (async () => {
        try {
          await using value = {
            [Symbol.asyncDispose]() { return Promise.reject(new Error('dispose')); },
          };
          void value;
          throw new Error('body');
        } catch (error) {
          return [error.name, error.error.message, error.suppressed.message];
        }
      })();
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  await expect(context.result).resolves.toEqual(['SuppressedError', 'dispose', 'body']);
});

test('for-using-of disposes each iteration before continuing or breaking', () => {
  const result = execute<{ result: string[] }>(
    `
      const calls = [];
      const values = [1, 2, 3].map(value => ({
        value,
        [Symbol.dispose]() { calls.push('dispose:' + value); },
      }));
      for (using resource of values) {
        calls.push('body:' + resource.value);
        if (resource.value === 2) break;
      }
      globalThis.result = calls;
    `,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['body:1', 'dispose:1', 'body:2', 'dispose:2']);
});
