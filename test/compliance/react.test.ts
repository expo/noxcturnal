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
  {
    name: 'var in a sloppy for-in initializer',
    source: `for (var App = function () { const [value] = useState(3); return value; } in {}) {}
      globalThis.result = App();`,
    expected: 3,
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

test.each(['App', '__proto__'])(
  'Refresh for-initializer signatures preserve inferred names and mutable self references: %s',
  name => {
    const source = `const out=[];
    for(var App=function(){useState(1);return [App.name,App===globalThis.saved]},i=0;i<1;i++) {
      globalThis.saved=App;out.push(App.name,App());const read=App;App=()=>0;out.push(read());
    }
    globalThis.result=out;`.replaceAll('App', name);
    expect(
      execute(
        source,
        { reactRefresh: {} },
        { useState: () => [], $RefreshReg$: () => {}, $RefreshSig$: () => (fn: unknown) => fn },
      ).result,
    ).toEqual([name, [name, true], [name, false]]);
  },
);

test.each([
  {
    name: 'initializer',
    header: `let signature = makeFactory(0), App = function () { useState(1); return 7; }, i = 0; i < 1; i++`,
    body: `out.push(App.name, App())`,
    expected: ['factory:0', 'attach:0', 'render:0', 'App', 7],
  },
  {
    name: 'test and update with retained components',
    header: `let signature = makeFactory(0), i = 0; i < 2 && (out[out.length] = function App() { useCustom(); return i; }); i++, signature = makeFactory(i), i < 2 && (out[out.length] = () => { useState(1); return i; })`,
    body: ``,
    expected: [
      'factory:0',
      'attach:0',
      'factory:1',
      'attach:1',
      'factory:1',
      'attach:1',
      'render:0',
      'render:1',
      'render:1',
    ],
  },
  {
    name: 'skipped header branch',
    header: `let signature = makeFactory(0), i = 0; false && (() => { useState(1); }); i++`,
    body: ``,
    expected: [],
  },
])(
  'Refresh evaluates header-local factories at component creation: $name',
  ({ header, body, expected, name }) => {
    const events: unknown[] = [];
    const source = `const out = []; function useCustom() {}
    for (${header}) { ${body}; }
    ${name === 'test and update with retained components' ? 'out.forEach(read => read());' : ''}
    globalThis.result = out;`;
    const result = execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        makeFactory: (id: number) => {
          return () => {
            events.push(`factory:${id}`);
            return (fn: unknown, _key: unknown, _reset: unknown, hooks?: () => unknown[]) => {
              events.push(`${fn ? 'attach' : 'render'}:${id}`);
              if (hooks) expect(hooks()).toHaveLength(1);
              return fn;
            };
          };
        },
        useState: () => [],
        $RefreshReg$: () => {},
      },
    );
    expect([...events, ...(name === 'initializer' ? (result.result as unknown[]) : [])]).toEqual(
      expected,
    );
  },
);

test('Refresh carries header-local signatures through HOCs without moving yield', () => {
  const events: string[] = [];
  const source = `function* build() {
    const out = [];
    for (let runtime = factoryRuntime, i = 0;
      i < 2 && (out[out.length] = runtime.hoc(runtime.hoc(function App() { useState(1); return i; }), yield i));
      i++) {}
    return out.map(read => read());
  }
  const it = build();
  globalThis.result = [it.next(), it.next('first'), it.next('second')];`;
  let nextId = 0;
  const runtime = {
    signature() {
      expect(this).toBe(runtime);
      const id = nextId++;
      events.push(`factory:${id}`);
      return (fn?: unknown) => {
        events.push(`${fn ? 'attach' : 'render'}:${id}`);
        return fn;
      };
    },
    hoc(fn: unknown) {
      expect(this).toBe(runtime);
      return fn;
    },
  };
  const result = execute(
    source,
    { reactRefresh: { refreshSig: 'runtime.signature' } },
    { factoryRuntime: runtime, useState: () => [], $RefreshReg$: () => {} },
    'input.js',
  );
  expect(result.result).toEqual([
    { value: 0, done: false },
    { value: 1, done: false },
    { value: [0, 1], done: true },
  ]);
  expect(events).toEqual([
    'factory:0',
    'attach:0',
    'attach:0',
    'attach:0',
    'factory:1',
    'attach:1',
    'attach:1',
    'attach:1',
    'render:0',
    'render:1',
  ]);
});

test.each([false, true])(
  'Refresh header signatures survive async interleaving (lowered=%s)',
  async lowered => {
    const source = `async function build(value) {
    let App;
    for (let signature = () => {
      const id = value;
      return fn => {
        if (fn) fn.signatureId = id;
        else renders.push(id);
        return fn;
      };
    }, i = 0; i < 1; i++) {
      // The next loop has an await outside the component's function boundary.
      for (let j = 0; j < 1 && (App = hoc(() => { useState(1); return value; }, await pause())); j++) {}
    }
    return [App.signatureId, App()];
  }
  globalThis.result = Promise.all([build(3), build(7)]);`;
    const renders: number[] = [];
    const result = execute<{ result: Promise<unknown> }>(
      source,
      {
        reactRefresh: { refreshSig: 'signature' },
        ...(lowered ? { transforms: { asyncFunctions: true, blockScoping: true } } : {}),
      },
      {
        renders,
        hoc: (fn: unknown) => fn,
        pause: async () => {},
        useState: () => [],
        $RefreshReg$: () => {},
      },
    );
    expect(await result.result).toEqual([
      [3, 3],
      [7, 7],
    ]);
    expect(renders).toEqual([3, 7]);
  },
);

test('Refresh header signature transport is local to recursive HOC activations', () => {
  const source = `function build(value) {
    const out = [];
    for (let signature = () => fn => {
      if (fn) fn.signatureId = value;
      else renders.push(value);
      return fn;
    }, i = 0; i < 1 && (out[i] = hoc(function App() { useState(1); return value; }, value)); i++) {}
    return out[0];
  }
  function hoc(fn, value) {
    if (value) { const nested = build(0); nested(); }
    return fn;
  }
  const App = build(1);
  globalThis.result = [App.signatureId, App()];`;
  const renders: number[] = [];
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        renders,
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toEqual([1, 1]);
  expect(renders).toEqual([0, 1]);
});

test.each([false, true])(
  'Refresh retains signatures from for-of binding defaults (lowered=%s)',
  lowered => {
    const source = `const out = [], renders = [];
  const factory = id => () => fn => {
    if (fn) fn.signatureId = id;
    else renders.push(id);
    return fn;
  };
  for (const [signature, App = function () { useState(1); return value; }, value]
    of [[factory(0), undefined, 3], [factory(1), undefined, 7]]) out.push(App);
  globalThis.result = [out.map(read => [read.signatureId, read()]), renders];`;
    expect(
      execute(
        source,
        {
          reactRefresh: { refreshSig: 'signature' },
          ...(lowered
            ? { transforms: { blockScoping: true, destructuring: true, forOf: true } }
            : {}),
        },
        { useState: () => [], $RefreshReg$: () => {} },
      ).result,
    ).toEqual([
      [
        [0, 3],
        [1, 7],
      ],
      [0, 1],
    ]);
  },
);

test.each([
  {
    name: 'separate const declarations',
    declaration: 'const signature = factory; const App = function () { useState(1); return 7; };',
  },
  {
    name: 'one let declaration',
    declaration: 'let signature = factory, App = () => { useState(1); return 7; };',
  },
  {
    name: 'a nested HOC',
    declaration:
      'const signature = factory; const App = hoc(hoc(function () { useState(1); return 7; }));',
  },
])('Refresh initializes a local factory after its binding: $name', ({ declaration, name }) => {
  const calls: string[] = [];
  const result = execute(
    `${declaration} globalThis.result = [App.name, App()];`,
    { reactRefresh: { refreshSig: 'signature' } },
    {
      factory: () => {
        calls.push('factory');
        return (fn?: unknown) => {
          calls.push(fn ? 'attach' : 'render');
          return fn;
        };
      },
      hoc: (fn: unknown) => fn,
      useState: () => [],
      $RefreshReg$: () => {},
    },
  );
  expect(result.result).toEqual([name === 'a nested HOC' ? '' : 'App', 7]);
  expect(calls).toEqual(
    name === 'a nested HOC'
      ? ['factory', 'attach', 'attach', 'attach', 'render']
      : ['factory', 'attach', 'render'],
  );
});

test.each(
  [
    {
      name: 'direct function',
      parameter: 'App = function App() { useState(1); return value; }',
      inferredName: 'App',
      attachments: 1,
    },
    {
      name: 'nested HOC',
      parameter: 'App = hoc(hoc(() => { useCustom(); return value; }))',
      inferredName: '',
      attachments: 3,
    },
    {
      name: 'binding default',
      parameter: '{ App = hoc(() => { useState(1); return value; }) } = {}',
      inferredName: '',
      attachments: 2,
    },
    {
      name: 'conditional default',
      parameter: 'App = enabled ? hoc(() => { useState(1); return value; }) : supplied',
      inferredName: '',
      attachments: 2,
    },
  ].flatMap(entry => [false, true].map(lowered => ({ ...entry, lowered }))),
)(
  'Refresh owns its signature temporaries inside a parameter $name (lowered=$lowered)',
  ({ parameter, inferredName, attachments, lowered }) => {
    const events: string[] = [];
    let nextId = 0;
    const factory = () => {
      const id = nextId++;
      events.push(`factory:${id}`);
      return (fn?: unknown, _key?: string, _reset?: boolean, hooks?: () => unknown[]) => {
        events.push(`${fn ? 'attach' : 'render'}:${id}`);
        if (hooks) expect(hooks()).toHaveLength(1);
        return fn;
      };
    };
    const source = `"use strict"; function useCustom() {}
    function build(value, signature, ${parameter}) { return App; }
    const first = build(3, factory), second = build(7, factory);
    globalThis.result = [first.name, first(), second.name, second()];`;
    expect(
      execute(
        source,
        {
          reactRefresh: { refreshSig: 'signature' },
          ...(lowered
            ? { transforms: { parameters: true, destructuring: true, blockScoping: true } }
            : {}),
        },
        {
          factory,
          hoc: (fn: unknown) => fn,
          enabled: true,
          supplied: () => 0,
          useState: () => [],
          $RefreshReg$: () => {},
        },
      ).result,
    ).toEqual([inferredName, 3, inferredName, 7]);
    expect(events).toEqual([
      'factory:0',
      ...Array(attachments).fill('attach:0'),
      'factory:1',
      ...Array(attachments).fill('attach:1'),
      'render:0',
      'render:1',
    ]);
  },
);

test('Refresh parameter-default signatures are isolated across recursive HOC calls', () => {
  const renders: number[] = [];
  const source = `"use strict";
    function build(value, signature = factory(value), App = hoc(hoc(function () {
      useState(1); return value;
    }), value ? build(0) : undefined)) { return App; }
    function hoc(fn, nested) { if (nested) nested(); return fn; }
    const App = build(1);
    globalThis.result = [App.signatureId, App()];`;
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        factory: (id: number) => () => (fn?: { signatureId: number }) => {
          if (fn) fn.signatureId = id;
          else renders.push(id);
          return fn;
        },
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toEqual([1, 1]);
  expect(renders).toEqual([0, 1]);
});

test('Refresh defaults own sibling transports and preserve parameter environments', () => {
  const renders: number[] = [];
  const source = `"use strict";
    function build(signature,
      [First = hoc(() => { useState(1); return 3; }),
       Second = hoc(() => { useState(1); return 7; })] = [],
      Third = hoc(() => { useState(1); return 9; })) {
      var signature = () => { throw new Error('body factory used'); };
      return [First, Second, Third];
    }
    const components = build(factory);
    globalThis.result = components.map(read => [read.signatureId, read()]);`;
  let nextId = 0;
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        factory: () => {
          const id = nextId++;
          return (fn?: { signatureId: number }) => {
            if (fn) fn.signatureId = id;
            else renders.push(id);
            return fn;
          };
        },
        hoc: (fn: unknown) => fn,
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toEqual([
    [0, 3],
    [1, 7],
    [2, 9],
  ]);
  expect(renders).toEqual([0, 1, 2]);
});

test('Refresh leaves supplied parameter defaults and skipped branches unevaluated', () => {
  let calls = 0;
  const source = `function build(signature, App = hoc(() => { useState(1); })) { return App; }
    const signature = factory;
    const App = false && hoc(() => { useState(1); });
    globalThis.result = build(signature, supplied) === supplied;`;
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        factory: () => {
          calls++;
          return (fn: unknown) => fn;
        },
        supplied: () => 7,
        hoc: (fn: unknown) => fn,
        $RefreshReg$: () => {},
      },
    ).result,
  ).toBe(true);
  expect(calls).toBe(0);
});

test.each(['App', '__proto__'])('Refresh preserves anonymous parameter-default names: %s', name => {
  const source = `function build(signature, App = () => { useState(1); return 7; }) { return App; }
    const read = build(factory);
    globalThis.result = [read.name, read()];`.replaceAll('App', name);
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        factory: () => (fn: unknown) => fn,
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toEqual([name, 7]);
});

test('Refresh parameter HOCs preserve lexical this, arguments, and new.target', () => {
  const source = `"use strict";
    function build(signature, App = hoc(() => {
      useState(1); return [this.value, arguments[0] === signature, new.target];
    })) { return App; }
    const read = build.call({ value: 7 }, factory);
    globalThis.result = read();`;
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        factory: () => (fn: unknown) => fn,
        hoc: (fn: unknown) => fn,
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toEqual([7, true, undefined]);
});

test('Refresh custom factory member calls retain their receiver after declaration', () => {
  const source = `const runtime = {
    value: 7,
    signature() {
      if (this !== runtime) throw new Error('factory receiver lost');
      return fn => fn;
    }
  };
  const App = () => { useState(1); return runtime.value; };
  globalThis.result = App();`;
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'runtime.signature' } },
      {
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toBe(7);
});

test('Refresh rest-parameter defaults retain their own signatures during recursion', () => {
  const source = `function make(id) {
    const factory = () => fn => { if (fn) fn.signatureId = id; return fn; };
    factory.id = id;
    return factory;
  }
  function hoc(fn, signature) { if (signature.id) build(make(0)); return fn; }
  function build(signature, ...[App = hoc(function App() {
    useState(1); return signature.id;
  }, signature)]) { return [App.signatureId, App()]; }
  globalThis.result = build(make(1));`;
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toEqual([1, 1]);
});

test.each([
  {
    name: 'ordinary default',
    parameter: "App = hoc(function () { useState(1); return 7; }, eval('var value = 7'))",
  },
  {
    name: 'binding default',
    parameter: "{ App = hoc(function () { useState(1); return 7; }, eval('var value = 7')) } = {}",
  },
  {
    name: 'rest default',
    parameter: "...[App = hoc(function () { useState(1); return 7; }, eval('var value = 7'))]",
  },
])('Refresh lowers a direct-eval $name without special exclusions', ({ parameter }) => {
  let signatures = 0;
  const source = `function build(signature, ${parameter}) { return App(); }
    globalThis.result = build(factory);`;
  expect(
    execute(
      source,
      { reactRefresh: { refreshSig: 'signature' } },
      {
        factory: () => {
          signatures++;
          return (fn: unknown) => fn;
        },
        hoc: (fn: unknown) => fn,
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toBe(7);
  expect(signatures).toBe(1);
});

test('Refresh also respects a lexical factory using the default identifier', () => {
  const source = `const $RefreshSig$ = factory;
    const App = () => { useState(1); return 7; };
    globalThis.result = [App.name, App()];`;
  expect(
    execute(
      source,
      { reactRefresh: {} },
      {
        factory: () => (fn: unknown) => fn,
        useState: () => [],
        $RefreshReg$: () => {},
      },
    ).result,
  ).toEqual(['App', 7]);
});
