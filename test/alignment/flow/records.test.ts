import { expect, test } from 'vitest';
import flowStripTypes from '@babel/plugin-transform-flow-strip-types';
import syntaxHermesParser from 'babel-plugin-syntax-hermes-parser';
import generate from '@babel/generator';
import { native } from '../../../js/native/binding';
import { alignBabelBehavior, alignHermesFlowTransform } from '../transform';

test.each([
  ['empty declaration', 'record Empty {}'],
  [
    'typed properties and defaults',
    'record Point<T> implements Readable<T> { x: T, y: number = 1, }',
  ],
  [
    'commented implements clause',
    'record Point<T> implements /* implements */ Readable<T> { x: T }',
  ],
  [
    'literal and reserved keys',
    'record Keys { default: number, "label": string = "x", 1: number = 2, 2n: number = 3, }',
  ],
  [
    'methods and static members',
    `record Point {
    x: number,
    read<T>(fallback: T): number | T { return this.x ?? fallback; }
    static origin: Point = Point {x: (0: number)},
    static create(x: number): Point { return Point {x}; }
  }`,
  ],
  ['named export', 'export record Point { x: number }'],
  ['default export', 'export default record Point { x: number }'],
  ['constructor calls', 'const value = NS.Point<number> {x: (1: number), ...rest};'],
  ['nested expressions', 'const value = Outer {child: Inner {value: (1: number)}};'],
  [
    'defaults with nested Flow',
    'record Box { value: number = ((x: number): number => (x: number))(1), }',
  ],
  ['sequence defaults', 'record Box { value: number = (1, 2), }'],
] as const)('aligns record %s with Hermes 0.36.0', (_name, source) => {
  alignHermesFlowTransform(`// @flow\n${source}`);
});

test('interleaved record methods and statics execute equivalently to Hermes lowering', async () => {
  await expect(
    alignBabelBehavior({
      source: `// @flow
      const calls = [];
      record R {
        value: number = (calls.push('default'), 2),
        static first: number = (calls.push('first'), 1),
        read(): number { return this.value; }
        static create() { return R {}; }
        static second: number = (calls.push('second'), 3),
      }
      const value = R.create();
      globalThis.__result = [calls, value.read(), value instanceof R,
        Object.keys(value), Object.getOwnPropertyNames(R),
        Object.getOwnPropertyDescriptor(value, 'value')];`,
      filename: 'input.js',
      plugins: [[syntaxHermesParser, { parseLangTypes: 'flow' }], flowStripTypes],
      noxcturnal: {},
      output: { mustNotMatch: [/\brecord\b/, /: number/] },
    }),
  ).resolves.toEqual([
    ['first', 'second', 'default'],
    2,
    true,
    ['value'],
    ['length', 'name', 'prototype', 'create', 'first', 'second'],
    { configurable: true, enumerable: true, value: 2, writable: true },
  ]);
});

test('records the Hermes numeric/bigint key-aliasing defect without copying it', () => {
  const source = 'record R { 1: number = 2, 1n: number = 3, }';
  const parser = require('hermes-parser');
  const reference = generate(parser.parse(source, { babel: true, flow: 'all' })).code;
  // The reference's key-name map aliases numeric 1 and bigint 1n and selects
  // the second local for both assignments. Native lowering keeps each local.
  expect(reference).toContain('this[1] = $$gen$r1;');
  const erased = native.nativeFlowErase(source, 'input.js');
  expect(erased.status).toBe('erased');
  expect(erased.code).toContain('this[1] = $$gen$r0;');
  expect(erased.code).toContain('this[1n] = $$gen$r1;');
});
