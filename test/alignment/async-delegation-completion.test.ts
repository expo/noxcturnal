import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const completed = { value: undefined, done: true };
const cases = [
  {
    name: 'delegated return with done false resumes delegation before finalization',
    methods: `
      next(value) {
        log.push(['next', this === delegate, value]);
        return Promise.resolve(++step === 1 ? { value: 1, done: false } : { value: 3, done: true });
      },
      return(value) {
        log.push(['return', this === delegate, value]);
        return Promise.resolve({ value: 2, done: false });
      },`,
    consume: `
      const first = await iterator.next();
      const second = await iterator.return(7);
      const intermediate = log.slice();
      const third = await iterator.next(9);
      return [first, second, intermediate, third, await iterator.next(), log];`,
    expected: [
      { value: 1, done: false },
      { value: 2, done: false },
      [
        ['next', true, undefined],
        ['return', true, 7],
      ],
      { value: 4, done: true },
      completed,
      [
        ['next', true, undefined],
        ['return', true, 7],
        ['next', true, 9],
        ['after', 3],
        ['finally'],
      ],
    ],
  },
  {
    name: 'delegated throw with done true completes yield star and runs finally',
    methods: `
      next(value) {
        log.push(['next', this === delegate, value]);
        return Promise.resolve({ value: 1, done: false });
      },
      throw(error) {
        log.push(['throw', this === delegate, error === failure]);
        return Promise.resolve({ value: 8, done: true });
      },`,
    consume: `
      const first = await iterator.next();
      const second = await iterator.throw(failure);
      return [first, second, await iterator.next(), log];`,
    expected: [
      { value: 1, done: false },
      { value: 9, done: true },
      completed,
      [['next', true, undefined], ['throw', true, true], ['after', 8], ['finally']],
    ],
  },
];
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const mode of ['inline', 'runtime'] as const)
  for (const entry of cases)
    test(`${entry.name}, ${mode}`, async () => {
      const source = `globalThis.result = (async () => {
        const log = [], failure = {};
        let step = 0;
        const delegate = { ${entry.methods} };
        const iterable = { [Symbol.asyncIterator]() { return delegate; } };
        async function* values() {
          try {
            const result = yield* iterable;
            log.push(['after', result]);
            return result + 1;
          } finally { log.push(['finally']); }
        }
        const iterator = values();
        ${entry.consume}
      })();`;
      expect(await run(source)).toEqual(entry.expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-async-generator-functions'),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ],
      })!.code!;
      expect(await run(reference)).toEqual(entry.expected);
      const code = compile(source, {
        transforms: { asyncGeneratorFunctions: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s+function\s*\*/);
      expect(code.includes('@babel/runtime/helpers/')).toBe(mode === 'runtime');
      expect(await run(code)).toEqual(entry.expected);
    });
