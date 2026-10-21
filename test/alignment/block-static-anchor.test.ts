import { transformSync } from '@babel/core';
import blockScoping from '@babel/plugin-transform-block-scoping';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';

const cases = [
  { name: 'static block local', member: 'static value=3;', read: 'local', method: false },
  { name: 'static private name', member: 'static #value=3;', read: 'C.#value', method: false },
  { name: 'method receiver control', member: 'static value=3;', read: 'this.value', method: true },
];
describe.each(cases)('$name', ({ member, read, method }) => {
  let outcome: unknown;
  beforeAll(() => {
    const source = `class C{${member}${method ? 'static run()' : 'static'}{const local=this.value;const reads=[];for(let i=0;i<2;i++)reads.push(()=>[i,${read}]);this.result=reads.map(read=>read());}}${method ? 'C.run();' : ''}globalThis.result=C.result;`;
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      try {
        new Function('globalThis', code).call({ value: 9 }, context);
        return { value: context.result };
      } catch (error) {
        return { error: (error as Error).name, message: (error as Error).message };
      }
    };
    expect(observe(source)).toEqual({
      value: [
        [0, 3],
        [1, 3],
      ],
    });
    const babel = transformSync(source, {
      babelrc: false,
      configFile: false,
      plugins: [blockScoping],
    })!.code!;
    expect(observe(babel)).toEqual({
      value: [
        [0, 3],
        [1, 3],
      ],
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'block',
            native: { transforms: { blockScoping: true }, helpers: { mode: 'inline' } },
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).not.toMatch(/\b(?:let|const)\b/);
    expect(result.code).not.toContain('@babel/runtime');
    outcome = observe(result.code);
  });
  test('retains the lexical class environment', () => {
    expect(outcome).toEqual({
      value: [
        [0, 3],
        [1, 3],
      ],
    });
  });
});
