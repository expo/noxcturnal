import { expect, test } from 'vitest';

import { execute } from './runtime';

test('legacy class and method decorators preserve evaluation and replacement', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const calls = [];
      function replace(Class) {
        calls.push('class');
        return class extends Class { replaced = true; };
      }
      function double(target, key, descriptor) {
        calls.push(key);
        const original = descriptor.value;
        descriptor.value = function () { return original.call(this) * 2; };
      }
      @replace
      class Example {
        @double read() { return 21; }
      }
      const value = new Example();
      globalThis.result = [calls, value.read(), value.replaced, value instanceof Example];
    `,
    {
      transforms: {
        legacyDecorators: true,
        classes: true,
        classProperties: { loose: true },
      },
    },
  );
  expect(result.result).toEqual([['read', 'class'], 42, true, true]);
});
