import flowStripTypes from '@babel/plugin-transform-flow-strip-types';
import { expect, test } from 'vitest';

import { alignBabelTransform, alignHermesFlowTransform } from '../transform';

test('aligns ordinary Flow type stripping with Babel', () => {
  const result = alignBabelTransform({
    source: `// @flow
type User = { name: string };
export function greeting(user: User): string { return user.name; }`,
    filename: 'input.js',
    plugins: [flowStripTypes],
    noxcturnal: {},
  });
  expect(result.canonical).toMatchInlineSnapshot(`
    "export function greeting(user) {
      return user.name;
    }"
  `);
});

test('aligns optional and defaulted parameters with Babel', () => {
  alignBabelTransform({
    source: `// @flow
function values(nodes: Array<number> = [], label?: string = 'all') {
  return [nodes, label];
}`,
    filename: 'input.js',
    plugins: [flowStripTypes],
    noxcturnal: {},
  });
});

test('aligns type-only imports and exports with Babel', () => {
  alignBabelTransform({
    source: `// @flow
import type { Input } from './types';
export type { Output } from './types';
export const value: Input = read();`,
    filename: 'input.js',
    plugins: [flowStripTypes],
    noxcturnal: {},
  });
});

test('aligns Flow annotations while preserving JSX', () => {
  alignHermesFlowTransform(
    `// @flow
type Props = { value: number };
export function View(props: Props) { return <Widget value={props.value} />; }`,
    'input.js',
  );
});

test.each([
  [
    'opaque and exported types',
    `opaque type ID = string; export type Value = number; const value: Value = 1;`,
  ],
  [
    'interfaces and generics',
    `interface Box<T> { value: T } function read<T>(box: Box<T>): T { return box.value; }`,
  ],
  [
    'union and intersection aliases',
    `type Value = { kind: 'a' } | { kind: 'b' }; type Both = A & B; const value: Value = read();`,
  ],
  [
    'variance and exact objects',
    `type Box<+T> = {| +value: T, -write: (T) => void |}; const box: Box<number> = read();`,
  ],
  [
    'tuple and array annotations',
    `const tuple: [number, string] = [1, 'one']; const list: Array<number> = [1];`,
  ],
  ['casts', `const first = (read(): number); const second = (read(): string);`],
  [
    'typed class members',
    `class Example { value: number = 1; read(input: string): number { return this.value; } }`,
  ],
  [
    'typed async and generator functions',
    `async function read(input: Promise<number>): Promise<number> { return await input; } function* values(): Generator<number, void, void> { yield 1; }`,
  ],
  ['typeof and key types', `type Keys = $Keys<typeof source>; const key: Keys = 'value';`],
  [
    'nullable and optional members',
    `type Input = { value?: ?number }; function read(input?: Input): ?number { return input?.value; }`,
  ],
  [
    'declare module',
    `declare module 'fixture' { declare export function read(): number; } const value: number = 1;`,
  ],
  [
    'component utility types',
    `type Element = React.Node; type Props = React.ElementConfig<typeof View>; const value: Element = null;`,
  ],
] as const)('aligns the %s syntax family with Babel', (_name, body) => {
  alignBabelTransform({
    source: `// @flow\n${body}`,
    filename: 'input.js',
    plugins: [flowStripTypes],
    noxcturnal: {},
  });
});
