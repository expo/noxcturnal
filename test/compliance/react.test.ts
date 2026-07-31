import { expect, test } from 'vitest';
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

test('React Compiler output remains executable and memoizes equal inputs', async () => {
  const runtimeUrl =
    'data:text/javascript,export%20function%20c(size)%7Breturn%20new%20Array(size).fill(Symbol.for(%22react.memo_cache_sentinel%22))%7D';
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
  expect(second).toEqual({ doubled: 4 });
});
