import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { nativePreflightOptions } from '../../js/native/binding';
import { compile, execute, importCode } from './runtime';

test('React Refresh instrumentation preserves component execution and registers it', () => {
  const registrations: unknown[][] = [];
  const result = execute<{ result: number }>(
    `
      function App() { return 42; }
      globalThis.result = App();
    `,
    { reactRefresh: {} },
    { $RefreshReg$: (...values: unknown[]) => registrations.push(values) },
  );
  expect(result.result).toBe(42);
  expect(registrations).toHaveLength(1);
  expect(registrations[0]?.[1]).toBe('App');
});

test('custom React Refresh identifiers preserve hook execution and signatures', () => {
  const registrations: unknown[][] = [];
  const signatures: unknown[][] = [];
  const createSignature = (...setup: unknown[]) => {
    signatures.push(setup);
    return (...call: unknown[]) => signatures.push(call);
  };
  const result = execute<{ result: number }>(
    `
      function App() { const [value] = useState(3); return value; }
      globalThis.result = App();
    `,
    { reactRefresh: { refreshReg: 'register', refreshSig: 'signature' } },
    {
      register: (...values: unknown[]) => registrations.push(values),
      signature: createSignature,
      useState: (value: unknown) => [value, () => {}],
    },
  );
  expect(result.result).toBe(3);
  expect(registrations).toHaveLength(1);
  expect(signatures.length).toBeGreaterThan(0);
});

test('React Compiler reuses and invalidates output with persistent memo slots', async () => {
  // A single component instance's cache across calls, not a React render harness.
  const runtimeUrl = `data:text/javascript,${encodeURIComponent(`
      let slots;
      export function c(size) {
        if (!slots) slots = new Array(size).fill(Symbol.for('react.memo_cache_sentinel'));
        if (slots.length !== size) throw new Error('memo slot count changed');
        return slots;
      }
    `)}`;
  const code = compile(
    `export function calculate({ value }) { return { doubled: value * 2 }; }`,
    {
      reactCompiler: {
        compilationMode: 'all',
        panicThreshold: 'all_errors',
        target: '19',
        enableResetCacheOnSourceFileChanges: false,
      },
    },
    'input.js',
  ).replace('react/compiler-runtime', runtimeUrl);
  const module = await importCode(code);
  const calculate = module.calculate as (input: { value: number }) => { doubled: number };
  const first = calculate({ value: 2 });
  const second = calculate({ value: 2 });
  expect(first).toEqual({ doubled: 4 });
  expect(second).toBe(first);
  const third = calculate({ value: 3 });
  expect(third).toEqual({ doubled: 6 });
  expect(third).not.toBe(first);
  expect(calculate({ value: 3 })).toBe(third);
});

for (const expression of ['() => later', 'async () => later', '(() => later)']) {
  test(`React Compiler hoists the capture in a standalone ${expression}`, async () => {
    const runtimeUrl = `data:text/javascript,${encodeURIComponent(`
      export function c(size) {
        return new Array(size).fill(Symbol.for('react.memo_cache_sentinel'));
      }
    `)}`;
    const code = compile(
      `export function calculate(input) {
        "use memo";
        ${expression};
        const later = input;
        return later;
      }`,
      {
        reactCompiler: {
          compilationMode: 'annotation',
          panicThreshold: 'all_errors',
          target: '19',
          enableResetCacheOnSourceFileChanges: false,
        },
      },
    );
    expect(code).toContain('react/compiler-runtime');
    const module = await importCode(code.replace('react/compiler-runtime', runtimeUrl));
    const calculate = module.calculate as (input: number) => number;
    expect(calculate(7)).toBe(7);
    expect(calculate(9)).toBe(9);
  });
}

test.each([
  {
    name: 'function in an if body',
    source: `if (true)
      function App() { const [value] = useState(3); return value; }
      globalThis.result = App();`,
    expected: 3,
    signatures: 1,
  },
  {
    name: 'function in a skipped if body',
    source: `if (false)
      function App() { const [value] = useState(3); return value; }
      globalThis.result = typeof App;`,
    expected: 'undefined',
    signatures: 0,
  },
  {
    name: 'var in an if body',
    source: `if (true)
      var App = function () { const [value] = useState(3); return value; };
      globalThis.result = App();`,
    expected: 3,
    signatures: 1,
  },
  {
    name: 'var in a for initializer',
    source: `const out = [];
      for (var App = function () { const [value] = useState(3); return value; }, i = 0; i < 2; i++)
        out.push(App());
      globalThis.result = out;`,
    expected: [3, 3],
    signatures: 1,
  },
])(
  'Refresh attaches a signature to a $name without aborting',
  ({ source, expected, signatures }) => {
    const bindings = { useState: (value: number) => [value, () => {}] };
    expect(execute(source, {}, bindings).result).toEqual(expected);
    const require = createRequire(import.meta.url);
    const binding = Object.keys(require.cache).find(filename =>
      /noxcturnal\.[^/]+\.node$/.test(filename),
    );
    expect(binding).toBeTypeOf('string');
    const options = nativePreflightOptions({ reactRefresh: {}, helpers: { mode: 'inline' } });
    // Each input can abort natively. A single batch would stop at the first input
    // and leave the other insertion positions untested.
    const child = spawnSync(process.execPath, [], {
      encoding: 'utf8',
      timeout: 10_000,
      input: `
      const output = require(${JSON.stringify(binding)}).nativePreflightTransform(
        ${JSON.stringify(source)}, 'input.js', ${JSON.stringify(options)});
      if (output.status !== 'complete') throw new Error(JSON.stringify(output));
      const context = {};
      let signatures = 0;
      const factory = () => (component) => {
        if (typeof component === 'function') signatures++;
        return component;
      };
      new Function('$RefreshSig$', '$RefreshReg$', 'useState', 'globalThis', output.code)(
        factory, () => {}, value => [value, () => {}], context);
      process.stdout.write(JSON.stringify({ value: context.result, signatures }));
    `,
    });
    expect(child.error, child.stderr).toBeUndefined();
    expect(child.signal, child.stderr).toBeNull();
    expect(child.status, child.stderr).toBe(0);
    // This also catches release builds dropping an unconsumed signature insertion.
    expect(JSON.parse(child.stdout)).toEqual({ value: expected, signatures });
  },
);

test.each([false, true])('Refresh retains a loop-local signature factory (braced=%s)', braced => {
  const expression = `out.push(function App() {
    const [value] = useState(1);
    return value;
  });`;
  const source = `const out = [];
    for (const signature of [() => fn => fn, () => fn => fn])
      ${braced ? `{ ${expression} }` : expression}
    globalThis.result = out.map(read => read());`;
  const result = execute(
    source,
    { reactRefresh: { refreshSig: 'signature' } },
    {
      useState: (value: number) => [value, () => {}],
      $RefreshReg$: () => {},
    },
  );
  expect(result.result).toEqual([1, 1]);
});

test('Refresh keeps skipped signature factories unevaluated', () => {
  const source = `let calls=0; const signature=()=>{calls++;return fn=>fn};
    if (false) var App=function(){useState(1);};
    for(let i=0;i<0;i++) (function Other(){useState(2);});
    globalThis.result=calls;`;
  expect(
    execute(source, { reactRefresh: { refreshSig: 'signature' } }, { $RefreshReg$: () => {} })
      .result,
  ).toBe(0);
});

test('Refresh for-initializer signatures preserve inferred names and mutable self references', () => {
  const source = `const out=[];
    for(var App=function(){useState(1);return [App.name,App===globalThis.saved]},i=0;i<1;i++) {
      globalThis.saved=App;out.push(App.name,App());const read=App;App=()=>0;out.push(read());
    }
    globalThis.result=out;`;
  expect(
    execute(
      source,
      { reactRefresh: {} },
      { useState: () => [], $RefreshReg$: () => {}, $RefreshSig$: () => fn => fn },
    ).result,
  ).toEqual(['App', ['App', true], ['App', false]]);
});
