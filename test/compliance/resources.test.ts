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
