import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
type Result = { value: unknown; done?: boolean };
type Fixture = {
  run: () => Generator<number, string> | AsyncGenerator<number, string>;
  reads: (() => number)[];
};
type Observation = { steps: Result[]; captures: number[] };

async function observe(code: string, externalReturn: boolean): Promise<Observation> {
  const context = {} as { result: Fixture };
  new Function('globalThis', code)(context);
  const iterator = context.result.run();
  const steps = [
    await iterator.next(),
    await (externalReturn ? iterator.return('stop') : iterator.next()),
    await iterator.next(),
  ];
  return { steps, captures: context.result.reads.map(read => read()) };
}

const expected: Observation = {
  steps: [
    { value: 0, done: false },
    { value: 2, done: false },
    { value: 'end', done: true },
  ],
  captures: [1, 3],
};

describe.each([false, true])('captured generator loop, async=%s', asyncGenerator => {
  const source = `
    const reads = [];
    ${asyncGenerator ? 'async ' : ''}function* run() {
      for (let i = 0; i < 4; i++) {
        reads.push(() => i);
        try { yield i; }
        finally {
          ${asyncGenerator ? 'await Promise.resolve();' : ''}
          i++;
          if (i < 3) continue;
        }
      }
      return 'end';
    }
    globalThis.result = { run, reads };
  `;
  let noxReturn: Observation;
  let noxNext: Observation;
  let babelNext: Observation;

  beforeAll(async () => {
    const nox = compile(source, { transforms: { blockScoping: true } });
    const babel = transformSync(source, {
      babelrc: false,
      configFile: false,
      plugins: [require('@babel/plugin-transform-block-scoping')],
    })!.code!;
    expect(nox).not.toMatch(/\b(?:let|const)\b/);
    expect(nox).toContain('yield*');
    if (asyncGenerator) expect(nox).toMatch(/= async function\*/);
    expect(nox).not.toContain('@babel/runtime');
    expect(await observe(source, true)).toEqual(expected);
    expect(await observe(source, false)).toEqual(expected);
    noxReturn = await observe(nox, true);
    noxNext = await observe(nox, false);
    babelNext = await observe(babel, false);
    // The shared early completion is established independently of Nox's failure.
    // Babel's scalar sentinel differs from Nox's internal exit record.
    const babelReturn = await observe(babel, true);
    expect(babelReturn.steps).toEqual([
      { value: 0, done: false },
      { value: 1, done: true },
      { value: undefined, done: true },
    ]);
    expect(babelReturn.captures).toEqual([1]);
  });

  test('ordinary next preserves yields, finalizer mutation and completion', () => {
    expect(noxNext).toEqual(expected);
    expect(babelNext).toEqual(expected);
  });

  test('accepted Babel boundary: external return bypasses finally-continue dispatch', () => {
    expect(noxReturn.steps).toEqual([
      { value: 0, done: false },
      { value: { type: 'continue', vars: expect.any(Function) }, done: true },
      { value: undefined, done: true },
    ]);
    expect(noxReturn.captures).toEqual([1]);
  });
});

// Returning while a finalizer yields resumes the extracted helper on a later
// next(). Its completion value is a user value, not an internal loop-exit record.
describe.each([false, true])('yielding cleanup after external return, async=%s', asyncGenerator => {
  let actual: unknown;
  const expected = {
    steps: [
      { value: 0, done: false },
      { value: 'cleanup', done: false },
      { value: undefined, done: true },
    ],
    captures: [1],
  };
  beforeAll(async () => {
    const source = `
      const reads = [];
      ${asyncGenerator ? 'async ' : ''}function* run() {
        for (let i = 0; i < 1; i++) {
          reads.push(() => i);
          try { yield i; }
          finally {
            ${asyncGenerator ? 'await Promise.resolve();' : ''}
            i++;
            yield 'cleanup';
          }
        }
      }
      globalThis.result = { run, reads };
    `;
    const observe = async (code: string) => {
      const context = {} as {
        result: {
          run: () =>
            | Generator<number | string, undefined>
            | AsyncGenerator<number | string, undefined>;
          reads: (() => number)[];
        };
      };
      new Function('globalThis', code)(context);
      const iterator = context.result.run();
      const steps: unknown[] = [await iterator.next(), await iterator.return(undefined)];
      try {
        steps.push(await iterator.next());
      } catch (error) {
        steps.push({ error: error instanceof Error ? error.name : String(error) });
      }
      return { steps, captures: context.result.reads.map(read => read()) };
    };
    const nox = compile(source, { transforms: { blockScoping: true } });
    expect(nox).not.toMatch(/\b(?:let|const)\b/);
    expect(nox).toContain('yield*');
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [require('@babel/plugin-transform-block-scoping')],
    })!.code!;
    expect(await observe(source)).toEqual(expected);
    expect(await observe(babel)).toEqual(expected);
    actual = await observe(nox);
  });

  test('finishes cleanup without decoding the user return value as an exit record', () => {
    expect(actual).toEqual(expected);
  });
});
