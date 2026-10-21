import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import blockScoping from '@babel/plugin-transform-block-scoping';
import { defineNativePipeline, transform } from '../../js';
import typescript from '@babel/plugin-transform-typescript';

describe('block generator return', () => {
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
  describe.each([false, true])(
    'yielding cleanup after external return, async=%s',
    asyncGenerator => {
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
    },
  );
});

describe('block static anchor', () => {
  const cases = [
    { name: 'static block local', member: 'static value=3;', read: 'local', method: false },
    { name: 'static private name', member: 'static #value=3;', read: 'C.#value', method: false },
    {
      name: 'method receiver control',
      member: 'static value=3;',
      read: 'this.value',
      method: true,
    },
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
});

describe('block generated name', () => {
  const cases = [
    {
      name: 'ordinary lexical replacement',
      external: '_value',
      source: `let value=1; { let value=2; globalThis.inner=value; } globalThis.result=[value,globalThis.inner,_value===99];`,
      expected: [1, 2, true],
    },
    {
      name: 'read-only value temporary',
      external: '_readOnlyValue',
      source: `const value=1;let rejected=false;try{value+=2;}catch(error){rejected=error instanceof TypeError;}globalThis.result=[value,rejected,_readOnlyValue===99];`,
      expected: [1, true, true],
    },
    {
      name: 'read-only helper name',
      external: '_readOnlyError',
      source: `const value=1;let rejected=false;try{value=2;}catch(error){rejected=error instanceof TypeError;}globalThis.result=[value,rejected,_readOnlyError===99];`,
      expected: [1, true, true],
    },
  ];

  describe.each(cases)('$name', ({ external, source: body, expected }) => {
    describe.each([false, true])('declared name=%s', declared => {
      let actual: unknown;
      beforeAll(() => {
        const source = (declared ? `const ${external}=99;` : '') + body;
        const observe = (code: string) => {
          const context: Record<string, unknown> = {};
          if (declared) new Function('globalThis', code)(context);
          else new Function(external, 'globalThis', code)(99, context);
          return context.result;
        };
        expect(observe(source)).toEqual(expected);
        const babel = transformSync(source, {
          babelrc: false,
          configFile: false,
          plugins: [blockScoping],
        })!.code!;
        expect(observe(babel)).toEqual(expected);
        const code = compile(source, { transforms: { blockScoping: true } });
        expect(code).not.toMatch(/\b(?:let|const)\b/);
        actual = observe(code);
      });
      test('preserves the supplied external value', () => {
        expect(actual).toEqual(expected);
      });
    });
  });
});

describe('block private heritage', () => {
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('globalThis', code)(context);
    return context.result;
  }
  describe.each([false, true])(
    'private write in heritage, same-name inner method=%s',
    collision => {
      let actual: unknown;
      beforeAll(() => {
        const source = `
      class Outer {
        #value = 1;
        read() {
          let outcome;
          try {
            class Inner extends (this.#value = 3, Object) { ${collision ? '#value() {}' : '#other() {}'} }
            outcome = 'completed';
          } catch (error) { outcome = error.name; }
          return [this.#value, outcome];
        }
      }
      globalThis.result = new Outer().read();
    `;
        expect(observe(source)).toEqual([3, 'completed']);
        const reference = transformSync(source, {
          configFile: false,
          babelrc: false,
          plugins: [blockScoping],
        })!.code!;
        expect(observe(reference)).toEqual([3, 'completed']);
        const code = compile(source, { transforms: { blockScoping: true } });
        expect(code).not.toMatch(/\blet\b/);
        expect(code).toContain('#value');
        actual = observe(code);
      });
      test('resolves the heritage private name in the outer class', () => {
        expect(actual).toEqual([3, 'completed']);
      });
    },
  );
});

describe('block typescript residual', () => {
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('_E', 'globalThis', `(function(){${code}})();`)('external', context);
    return context.result;
  }
  describe.each([false, true])('TypeScript enum residual pass, declared collision=%s', declared => {
    let actual: unknown;
    beforeAll(() => {
      const prefix = declared ? 'const _E="external";' : '';
      const source =
        prefix +
        'const values=[]; { enum E { A=1 } values.push(E.A); } { enum E { A=2 } values.push(E.A); } globalThis.result=[values,_E];';
      const oracle =
        prefix +
        'const values=[]; { const E={A:1}; values.push(E.A); } { const E={A:2}; values.push(E.A); } globalThis.result=[values,_E];';
      expect(observe(oracle)).toEqual([[1, 2], 'external']);
      const reference = transformSync(source, {
        filename: 'input.ts',
        configFile: false,
        babelrc: false,
        plugins: [typescript, blockScoping],
      })!.code!;
      expect(observe(reference)).toEqual([[1, 2], 'external']);
      const stripped = compile(source, { typescript: 'strip' }, 'input.ts');
      expect(stripped).not.toMatch(/\benum\b/);
      expect(stripped).toMatch(/\blet E\b/);
      expect(observe(stripped)).toEqual([[1, 2], 'external']);
      const code = compile(
        source,
        { typescript: 'strip', transforms: { blockScoping: true } },
        'input.ts',
      );
      expect(code).not.toMatch(/\b(?:let|const|enum)\b/);
      expect(code).not.toContain('@babel/runtime');
      actual = observe(code);
    });
    test('preserves the external replacement-name binding', () => {
      expect(actual).toEqual([[1, 2], 'external']);
    });
  });
});

describe('block scoping labeled exits', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'captured loop continues to an outer label in its label chain',
      source: `const out = [];
outer: inner: for (let index = 0; index < 2; index++) {
  out.push(() => index);
  continue outer;
}
globalThis.result = out.map(read => read());`,
      expected: [0, 1],
    },
    {
      name: 'captured inner loop continues to an ancestor loop label',
      source: `const out = [];
outer: for (var pass = 0; pass < 2; pass++) {
  for (let index = 0; index < 2; index++) {
    out.push(() => index);
    continue outer;
  }
}
globalThis.result = out.map(read => read());`,
      expected: [0, 0],
    },
    {
      name: 'captured loop breaks to an ancestor block label',
      source: `const out = [];
outer: {
  for (let index = 0; index < 2; index++) {
    out.push(() => index);
    break outer;
  }
}
globalThis.result = out.map(read => read());`,
      expected: [0],
    },
  ];

  function run(code: string): unknown {
    const context: Record<string, unknown> = {};
    new Function('globalThis', code)(context);
    return context.result;
  }

  describe.each(cases)('$name', ({ source, expected }) => {
    let code: string;
    let babel: string;
    beforeAll(() => {
      // These block-scoping paths are helper-free in either helper mode.
      code = compile(source, { transforms: { blockScoping: true }, helpers: { mode: 'inline' } });
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [require('@babel/plugin-transform-block-scoping')],
      });
      expect(reference?.code).toBeTypeOf('string');
      babel = reference!.code!;
      expect(code).not.toMatch(/\b(?:let|const)\b/);
    });
    test('native control', () => {
      expect(run(source)).toEqual(expected);
    });
    test('Babel control', () => {
      expect(run(babel)).toEqual(expected);
    });
    test('transformed execution', () => {
      expect(run(code)).toEqual(expected);
    });
  });
});
