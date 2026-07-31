import { expect } from 'vitest';
import { flowTest, transformSource } from '../transform';

flowTest('lowers Flow component syntax', async () => {
  const source = `/** @flow */
component Greeting(name: string) { return name; }`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "/** @flow */
    function Greeting({ name }) {
      return name;
    }"
  `);
});

flowTest('lowers renamed and defaulted component parameters', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example(a: T, external as local: U = 1) { return local; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    function Example({ a, external: local = 1 }) {
      return local;
    }"
  `);
});

flowTest('lowers optional component parameters while preserving defaults', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example(value?: string = 'default') { return value; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    function Example({ value = 'default' }) {
      return value;
    }"
  `);
});

flowTest('lowers destructured component parameters', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example(prop as { a, b }: Props) { return a + b; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    function Example({ prop: { a, b } }) {
      return a + b;
    }"
  `);
});

flowTest('lowers a sole component rest parameter', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example(...props: Props) { return props; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    function Example(props) {
      return props;
    }"
  `);
});

flowTest('lowers component parameters followed by rest', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example(value: T, ...rest: Props) { return [value, rest]; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    function Example({ value, ...rest }) {
      return [value, rest];
    }"
  `);
});

flowTest('lowers an empty component parameter list', async () => {
  expect(await transformSource(`// @flow\ncomponent Example() { return null; }`, 'input.js', {}))
    .toMatchInlineSnapshot(`
    "// @flow
    function Example() {
      return null;
    }"
  `);
});

flowTest('erases component type parameters and renders clauses', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example<T>(value: T) renders React.Node { return value; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    function Example({ value }) {
      return value;
    }"
  `);
});

flowTest('lowers ref parameters through React.forwardRef', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example(ref?: Ref, value: T) { return value; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    const Example = React.forwardRef(Example_withRef);
    function Example_withRef({ value }, ref) {
      return value;
    }"
  `);
});

flowTest('lowers a ref parameter with rest props', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example(ref?: Ref, ...props: Props) { return props; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    const Example = React.forwardRef(Example_withRef);
    function Example_withRef({ ...props }, ref) {
      return props;
    }"
  `);
});

flowTest('provides an empty props slot for a component with only a ref', async () => {
  expect(
    await transformSource(
      `// @flow\ncomponent Example(ref?: Ref) { return null; }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    const Example = React.forwardRef(Example_withRef);
    function Example_withRef(_$$empty_props_placeholder$$, ref) {
      return null;
    }"
  `);
});
