import { beforeAll, describe, expect, test } from 'vitest';
import { compile, execute, importCode } from './runtime';

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
    {},
    'input.js',
    code => {
      expect(code).not.toMatch(/\bawait\s+using\b/);
    },
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

const additionalComplianceCases: {
  name: string;
  source: string;
  expected: unknown;
  knownFailure: boolean;
  module?: boolean;
  selectExport?: (exports: Record<string, unknown>) => unknown;
}[] = [
  {
    name: 'module using preserves anonymous default class names during initialization',
    source: `
      using resource = null;
      export let result;
      export default class { static { result = this.name; } }
    `,
    expected: 'default',
    module: true,
    knownFailure: true,
  },
  {
    name: 'module using preserves anonymous default arrow names',
    source: `
      using resource = null;
      export default (() => {});
    `,
    selectExport: exports => (exports.default as Function).name,
    expected: 'default',
    module: true,
    knownFailure: true,
  },
  {
    name: 'module using preserves named class inner bindings after reassignment',
    source: `
      using resource = null;
      export class Named { static read() { return Named; } }
      const original = Named;
      Named = 2;
      export const result = original.read() === original;
    `,
    expected: true,
    module: true,
    knownFailure: false,
  },
  {
    name: 'for using disposal errors precede iterator close errors on break',
    source: `
      const calls = [];
      const iterable = {
        [Symbol.iterator]() {
          return {
            next() {
              return { done: false, value: {
                [Symbol.dispose]() { calls.push('dispose'); throw new Error('dispose'); },
              } };
            },
            return() { calls.push('close'); throw new Error('close'); },
          };
        },
      };
      try { for (using resource of iterable) { calls.push('body'); break; } }
      catch (error) { calls.push(error.message); }
      globalThis.result = calls;
    `,
    expected: ['body', 'dispose', 'close', 'dispose'],
    knownFailure: false,
  },
  {
    name: 'mixed null async and sync resources preserve suspension ordering',
    source: `
      globalThis.result = (async () => {
        const calls = [];
        const task = (async () => {
          {
            await using first = null;
            using second = { [Symbol.dispose]() { calls.push('sync'); } };
            calls.push('body');
          }
          calls.push('after');
        })();
        calls.push('called');
        await task;
        return calls;
      })();
    `,
    expected: ['body', 'sync', 'called', 'after'],
    knownFailure: false,
  },
  {
    name: 'using disposes before labelled continue advances an outer loop',
    source: `
      const calls = [];
      outer: for (let i = 0; i < 2; i++) {
        using resource = { [Symbol.dispose]() { calls.push('dispose:' + i); } };
        for (let j = 0; j < 2; j++) {
          calls.push('body:' + i);
          continue outer;
        }
      }
      globalThis.result = calls;
    `,
    expected: ['body:0', 'dispose:0', 'body:1', 'dispose:1'],
    knownFailure: false,
  },
  {
    name: 'async generator return runs inner finally before async disposal',
    source: `
      globalThis.result = (async () => {
        const calls = [];
        async function* values() {
          await using resource = { [Symbol.asyncDispose]() { calls.push('dispose'); } };
          try { yield 1; } finally { calls.push('finally'); }
        }
        const iterator = values();
        await iterator.next();
        await iterator.return(2);
        return calls;
      })();
    `,
    expected: ['finally', 'dispose'],
    knownFailure: false,
  },
  {
    name: 'for using preserves the loop binding TDZ in its iterable expression',
    source: `
      const resource = [{ [Symbol.dispose]() {} }];
      try {
        for (using resource of resource) {}
        globalThis.result = 'accepted';
      } catch (error) { globalThis.result = error.name; }
    `,
    expected: 'ReferenceError',
    knownFailure: true,
  },
  {
    name: 'using in function bodies preserves function parameter arguments aliasing',
    source: `
      globalThis.result = (function read(value) {
        using resource = null;
        function value() {}
        return [typeof value, typeof arguments[0]];
      })(1);
    `,
    expected: ['function', 'function'],
    knownFailure: true,
  },
  {
    name: 'using in function bodies preserves valid var function redeclarations',
    source: `
      globalThis.result = (function read() {
        using resource = null;
        var value = 1;
        function value() {}
        return value;
      })();
    `,
    expected: 1,
    knownFailure: false,
  },
  {
    name: 'module using bindings reject reassignment',
    source: `
      using resource = null;
      let result;
      try { resource = undefined; result = 'accepted'; }
      catch (error) { result = error.name; }
      export { result };
    `,
    expected: 'TypeError',
    knownFailure: true,
    module: true,
  },
  {
    name: 'module using preserves exported const immutability',
    source: `
      using resource = null;
      export const value = 1;
      let result;
      try { value = 2; result = value; }
      catch (error) { result = error.name; }
      export { result };
    `,
    expected: 'TypeError',
    knownFailure: true,
    module: true,
  },
  {
    name: 'module using preserves unrelated let TDZ',
    source: `
      using resource = null;
      let result;
      try { result = typeof value; }
      catch (error) { result = error.name; }
      let value = 1;
      export { result };
    `,
    expected: 'ReferenceError',
    knownFailure: true,
    module: true,
  },
  {
    name: 'module using preserves unrelated class TDZ',
    source: `
      using resource = null;
      let result;
      try { result = typeof Value; }
      catch (error) { result = error.name; }
      class Value {}
      export { result };
    `,
    expected: 'ReferenceError',
    knownFailure: true,
    module: true,
  },
  {
    name: 'await using falls back to sync disposal when the async hook is null',
    source: `
      globalThis.result = (async () => {
        const calls = [];
        const resource = {
          get [Symbol.asyncDispose]() { calls.push('get:async'); return null; },
          get [Symbol.dispose]() {
            calls.push('get:sync');
            return function () { calls.push(['dispose', this === resource]); };
          },
        };
        try { await using value = resource; calls.push('body'); }
        catch (error) { calls.push(error.name); }
        return calls;
      })();
    `,
    expected: ['get:async', 'get:sync', 'body', ['dispose', true]],
    knownFailure: true,
  },
  ...[
    { name: 'using', declaration: 'using', symbol: 'dispose' },
    { name: 'await using async disposal', declaration: 'await using', symbol: 'asyncDispose' },
    { name: 'await using sync fallback', declaration: 'await using', symbol: 'dispose' },
  ].map(({ name, declaration, symbol }) => ({
    name: name + ' ignores a disposer own call property',
    source: `
      globalThis.result = (async () => {
        const calls = [];
        function dispose() { calls.push(['dispose', this === resource, arguments.length]); }
        dispose.call = function () { calls.push('own:call'); };
        const resource = { [Symbol.${symbol}]: dispose };
        { ${declaration} value = resource; calls.push('body'); }
        return calls;
      })();
    `,
    expected: ['body', ['dispose', true, 0]],
    knownFailure: true,
  })),
  {
    name: 'await using ignores a native disposer promise own then property',
    source: `
      globalThis.result = (async () => {
        const calls = [];
        const promise = Promise.resolve();
        promise.then = () => { calls.push('own:then'); throw new Error('intercepted'); };
        try {
          await using value = {
            [Symbol.asyncDispose]() { calls.push('dispose'); return promise; },
          };
          calls.push('body');
        } catch (error) { calls.push(error.message); }
        return calls;
      })();
    `,
    expected: ['body', 'dispose'],
    knownFailure: true,
  },
  {
    name: 'using bindings reject reassignment',
    source: `
      let failure;
      {
        using value = null;
        try { value = null; } catch (error) { failure = error.name; }
      }
      globalThis.result = failure;
    `,
    expected: 'TypeError',
    knownFailure: false,
  },
  {
    name: 'using bindings preserve initializer TDZ',
    source: `
      let failure;
      try { using value = value; } catch (error) { failure = error.name; }
      globalThis.result = failure;
    `,
    expected: 'ReferenceError',
    knownFailure: false,
  },
  {
    name: 'await using sync fallback ignores the disposer returned thenable',
    source: `
      globalThis.result = (async () => {
        const calls = [];
        {
          await using value = {
            [Symbol.dispose]() {
              calls.push('dispose');
              return { get then() { calls.push('then'); throw new Error('unexpected'); } };
            },
          };
          calls.push('body');
        }
        calls.push('after');
        return calls;
      })();
    `,
    expected: ['body', 'dispose', 'after'],
    knownFailure: false,
  },
  {
    name: 'using accepts a function resource and preserves its receiver',
    source: `
      const calls = [];
      function resource() {}
      resource[Symbol.dispose] = function () { calls.push(this === resource); };
      { using value = resource; calls.push(value === resource); }
      globalThis.result = calls;
    `,
    expected: [true, true],
    knownFailure: false,
  },
];

describe.each(additionalComplianceCases)(
  '$name',
  ({ source, expected, knownFailure, module, selectExport }) => {
    let code: string;
    beforeAll(() => {
      code = compile(
        source,
        { transforms: { explicitResourceManagement: true } },
        module ? 'input.mjs' : 'input.js',
      );
    });
    const run = async (input: string) => {
      if (module) {
        const exports = await importCode(input);
        return selectExport ? selectExport(exports) : exports.result;
      }
      const context: Record<string, unknown> = {};
      new Function('globalThis', input)(context);
      return await context.result;
    };

    const transformedTest = knownFailure ? test.fails : test;
    transformedTest('transformed execution', async () => {
      expect(await run(code)).toEqual(expected);
    });
  },
);

test('resource declarations in catch and finally dispose at their own block exits', () => {
  const result = execute<{ result: string[] }>(
    `const log = [];
     const make = name => ({ [Symbol.dispose]() { log.push(name); } });
     try { throw new Error('original'); }
     catch (error) { using caught = make(error.message); log.push('catch'); }
     finally { using final = make('final'); log.push('finally'); }
     globalThis.result = log;`,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['catch', 'original', 'finally', 'final']);
});

test('classic for resources dispose once after labeled continuation and break', () => {
  const result = execute<{ result: string[] }>(
    `const log = [];
     const make = name => ({ [Symbol.dispose]() { log.push(name); } });
     let index = 0;
     outer: for (using resource = make('disposed'); index < 3; index++) {
       if (index === 0) continue outer;
       log.push('body:' + index);
       break outer;
     }
     log.push('after');
     globalThis.result = log;`,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['body:1', 'disposed', 'after']);
});

test('classic for resources dispose earlier acquisitions when a later initializer throws', () => {
  const result = execute<{ result: string[] }>(
    `const log = [];
     const make = () => ({ [Symbol.dispose]() { log.push('disposed'); } });
     const fail = () => { throw new Error('initializer'); };
     try { for (using first = make(), second = fail(); false;) {} }
     catch (error) { log.push(error.message); }
     globalThis.result = log;`,
    { transforms: { explicitResourceManagement: true } },
  );
  expect(result.result).toEqual(['disposed', 'initializer']);
});
