import { expect, test } from 'vitest';
import { compile, execute, executeModule, importCode } from './runtime';

test('TypeScript erasure preserves enums, namespaces, parameter properties, and optional chaining', () => {
  const result = execute<{ result: unknown[] }>(
    `
      enum Direction { Up = 1, Down }
      namespace Values { export const answer: number = 42; }
      class Point {
        constructor(public x: number, readonly y: number) {}
      }
      const point = new Point(2, 3);
      globalThis.result = [Direction.Down, Direction[1], Values.answer, point.x, point?.y];
    `,
    { typescript: 'strip' },
    {},
    'input.ts',
  );
  expect(result.result).toEqual([2, 'Up', 42, 2, 3]);
});

test('Flow erasure preserves runtime declarations and values', () => {
  const result = execute<{ result: unknown[] }>(
    `
      // @flow
      type Pair<T> = [T, T];
      function pair<T>(value: T): Pair<T> { return [value, value]; }
      enum Status { Ready, Done }
      globalThis.result = [pair(3), Status.Ready, Status.Done];
    `,
    {},
    {
      require(specifier: string) {
        if (specifier !== 'flow-enums-runtime') throw new Error(`Unexpected module: ${specifier}`);
        return {
          Mirrored(values: string[]) {
            return Object.fromEntries(values.map(value => [value, value]));
          },
        };
      },
    },
  );
  expect(result.result).toEqual([[3, 3], 'Ready', 'Done']);
});

test('classic JSX preserves prop, spread, child, and fragment semantics', () => {
  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type: unknown, props: unknown, ...children: unknown[]) {
      return { type, props, children };
    },
  };
  const result = execute<{ result: Record<string, unknown> }>(
    `
      const props = { first: 1 };
      globalThis.result = <><View {...props} second={2}>text{3}</View></>;
    `,
    { jsx: 'classic' },
    { React, View: 'View' },
    'input.jsx',
  );
  expect(result.result).toEqual({
    type: React.Fragment,
    props: null,
    children: [
      {
        type: 'View',
        props: { first: 1, second: 2 },
        children: ['text', 3],
      },
    ],
  });
});

test('export-namespace-from preserves a live namespace object', async () => {
  const dependency = `data:text/javascript,export%20let%20value=1;export%20const%20set=next=>value=next`;
  const module = await executeModule(`export * as dependency from ${JSON.stringify(dependency)};`, {
    transforms: { exportNamespaceFrom: true },
  });
  const namespace = module.dependency as { value: number; set(value: number): void };
  expect(namespace.value).toBe(1);
  namespace.set(2);
  expect(namespace.value).toBe(2);
});

test('TypeScript numeric and string enums preserve mappings and computed members', () => {
  const result = execute<{ result: unknown[] }>(
    `
      enum Numeric { First, Computed = First + 4 }
      enum Text { First = 'first', Second = 'second' }
      globalThis.result = [Numeric.First, Numeric.Computed, Numeric[4], Text.First, Text.Second];
    `,
    { typescript: 'strip' },
    {},
    'input.ts',
  );
  expect(result.result).toEqual([0, 4, 'Computed', 'first', 'second']);
});

test('TypeScript namespace declarations merge at runtime', () => {
  const result = execute<{ result: unknown[] }>(
    `
      namespace Values { export const first = 1; }
      namespace Values { export const second = Values.first + 1; }
      globalThis.result = [Values.first, Values.second];
    `,
    { typescript: 'strip' },
    {},
    'input.ts',
  );
  expect(result.result).toEqual([1, 2]);
});

test('TypeScript-only class and function syntax erases without changing behavior', () => {
  const result = execute<{ result: unknown[] }>(
    `
      interface Reader<T> { read(value: T): T }
      abstract class Base<T> { abstract read(value: T): T; }
      class ReaderImpl extends Base<number> implements Reader<number> {
        override read(value: number): number { return value; }
      }
      const identity = <T,>(value: T): T => value;
      globalThis.result = [new ReaderImpl().read(3), identity('value')];
    `,
    { typescript: 'strip' },
    {},
    'input.ts',
  );
  expect(result.result).toEqual([3, 'value']);
});

test('custom classic JSX pragmas preserve fragment and child behavior', () => {
  const h = (type: unknown, props: unknown, ...children: unknown[]) => ({ type, props, children });
  const Fragment = Symbol('Fragment');
  const result = execute<{ result: unknown }>(
    `globalThis.result = <><Item value={1} />text</>;`,
    { jsx: 'classic', jsxPragma: 'h', jsxPragmaFrag: 'Fragment' },
    { h, Fragment, Item: 'Item' },
    'input.jsx',
  );
  expect(result.result).toEqual({
    type: Fragment,
    props: null,
    children: [{ type: 'Item', props: { value: 1 }, children: [] }, 'text'],
  });
});

test('classic development JSX provides source and self metadata without changing children', () => {
  const React = {
    createElement(type: unknown, props: Record<string, unknown>, ...children: unknown[]) {
      return { type, props, children };
    },
  };
  const result = execute<{ result: { props: Record<string, unknown>; children: unknown[] } }>(
    `globalThis.result = <Item>value</Item>;`,
    { jsx: 'classic-development' },
    { React, Item: 'Item' },
    'fixture.jsx',
  );
  expect(result.result.children).toEqual(['value']);
  expect(result.result.props.__source).toMatchObject({ fileName: 'fixture.jsx', lineNumber: 1 });
  expect(result.result.props).toHaveProperty('__self');
});

test('automatic JSX preserves key, props, and child semantics', async () => {
  const runtimeUrl =
    'data:text/javascript,export%20const%20Fragment=Symbol.for(%22fragment%22);export%20function%20jsx(type,props,key)%7Breturn%20%7Btype,props,key%7D%7D;export%20const%20jsxs=jsx';
  const code = compile(
    `const Item = 'Item'; export const result = <><Item key="item" value={1}>text</Item><Item value={2} /></>;`,
    { jsx: 'automatic', jsxImportSource: 'react' },
    'input.jsx',
  ).replace(/(['"])react\/jsx-runtime\1/, JSON.stringify(runtimeUrl));
  const module = await importCode(code);
  expect(module.result).toMatchObject({
    props: {
      children: [
        { type: 'Item', key: 'item', props: { value: 1, children: 'text' } },
        { type: 'Item', props: { value: 2 } },
      ],
    },
  });
});

test('automatic development JSX preserves source metadata and children', async () => {
  const runtimeUrl =
    'data:text/javascript,export%20const%20Fragment=Symbol.for(%22fragment%22);export%20function%20jsxDEV(type,props,key,isStaticChildren,source,self)%7Breturn%20%7Btype,props,key,isStaticChildren,source,self%7D%7D';
  const code = compile(
    `const Item = 'Item'; export const result = <Item value={1}>text</Item>;`,
    { jsx: 'automatic-development', jsxImportSource: 'react' },
    'fixture.jsx',
  ).replace(/(['"])react\/jsx-dev-runtime\1/, JSON.stringify(runtimeUrl));
  const module = await importCode(code);
  expect(module.result).toMatchObject({
    type: 'Item',
    props: { value: 1, children: 'text' },
    source: { fileName: 'fixture.jsx', lineNumber: 1 },
  });
});

test('TypeScript erasure executes .mts and .cts inputs', () => {
  for (const filename of ['input.mts', 'input.cts']) {
    const result = execute<{ result: number }>(
      `const value: number = 3; globalThis.result = value;`,
      { typescript: 'strip' },
      {},
      filename,
    );
    expect(result.result).toBe(3);
  }
});

test('top-level await remains executable module syntax', async () => {
  const module = await executeModule(`export const value = await Promise.resolve(42);`, {});
  expect(module.value).toBe(42);
});

test('automatic-if-present transforms JSX and leaves JSX-free programs runnable', async () => {
  const runtimeUrl =
    'data:text/javascript,export%20function%20jsx(type,props,key)%7Breturn%20%7Btype,props,key%7D%7D;export%20const%20jsxs=jsx';
  const withJsx = compile(
    `const Item = 'Item'; export const result = <Item value={1} />;`,
    { jsx: 'automatic-if-present', jsxImportSource: 'react' },
    'input.jsx',
  ).replace(/(['"])react\/jsx-runtime\1/, JSON.stringify(runtimeUrl));
  expect((await importCode(withJsx)).result).toMatchObject({ type: 'Item', props: { value: 1 } });

  const withoutJsx = execute<{ result: number }>(`globalThis.result = 42;`, {
    jsx: 'automatic-if-present',
    jsxImportSource: 'react',
  });
  expect(withoutJsx.result).toBe(42);
});
