import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { execute } from './runtime';

const require = createRequire(import.meta.url);
for (const mode of ['inline', 'runtime'] as const) {
  test(`whole array rest reuses its fresh conversion with ${mode} helpers`, () => {
    const result = execute(
      `
      class Input extends Array {
        static get [Symbol.species]() { throw new Error('species'); }
        slice() { throw new Error('slice'); }
      }
      const input = new Input(1, 2, 3);
      const [...declared] = input;
      let assigned;
      ([...assigned] = input);
      const [...iterated] = new Set([4, 5]);
      declared.push(9);
      assigned[0] = 8;
      globalThis.result = [
        Array.from(input), declared, assigned, iterated,
        Object.getPrototypeOf(declared) === Array.prototype,
        declared !== assigned,
      ];
    `,
      {
        transforms: { destructuring: true },
        helpers: { mode, version: '7.29.7' },
      },
      { require },
    );
    expect(result.result).toEqual([[1, 2, 3], [1, 2, 3, 9], [8, 2, 3], [4, 5], true, true]);
  });
}
