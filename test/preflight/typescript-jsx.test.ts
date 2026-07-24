import assert from 'node:assert/strict';

import { test } from 'vitest';

import {
  classify,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
} from '../../dist/index.js';
import type { PreflightJsxProfile } from '../../dist/index.js';

const nativePipeline = (
  filename: string,
  options: {
    typescript?: 'strip';
    jsx?: PreflightJsxProfile;
    jsxImportSource?: string;
  },
) => ({
  filename,
  pipeline: defineNativePipeline({
    phases: [{ name: 'preflight', native: options }],
  }),
});

test('erases TypeScript syntax and preserves runtime constructs', () => {
  const source = [
    'enum Direction { Up, Down = 4 }',
    'namespace Values { export const answer: number = 42; }',
    'class Point { constructor(public x: number, readonly y: number) {} }',
    'const asserted = Values.answer as number satisfies number;',
    'const point = new Point(Direction.Down, asserted)!;',
  ].join('\n');
  const { filename, pipeline } = nativePipeline('fixture.ts', { typescript: 'strip' });
  const result = transform(source, filename, pipeline);

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\b(?:namespace|public|readonly|satisfies)\b|:\s*number/);
  const runtime = new Function(
    `${result.code}; return { Direction, Values, Point, asserted, point };`,
  )() as {
    Direction: { Down: number };
    Values: { answer: number };
    asserted: number;
    point: { x: number; y: number };
  };
  assert.equal(runtime.Direction.Down, 4);
  assert.equal(runtime.Values.answer, 42);
  assert.equal(runtime.asserted, 42);
  assert.deepEqual([runtime.point.x, runtime.point.y], [4, 42]);
});

test('supports TypeScript import-equals/export-assignment and preserves d.ts classification', () => {
  const result = transform(
    'import runtime = require("runtime-edge"); export = runtime;',
    'fixture.cts',
    nativePipeline('fixture.cts', { typescript: 'strip' }).pipeline,
  );
  assert.equal(result.status, 'complete');
  assert.match(result.code, /const runtime = require\("runtime-edge"\)/);
  assert.match(result.code, /module\.exports = runtime/);

  assert.equal(classify('types.d.ts', 'export interface Value {}').syntax, 'dts');
});

test('removes type-only module edges before following visitor phases', () => {
  const dependencies = defineNativePlugin({
    name: 'dependencies',
    contract: {
      metadata: { writes: ['dependencies'] },
      queries: [{ calls: [{ callee: 'require', staticArguments: true }] }],
    },
    pre(context) {
      const calls = context.query({ calls: [{ callee: 'require', staticArguments: true }] });
      context.metadata.set(
        'dependencies',
        calls.calls.require?.map(call => call.staticArgument) ?? [],
      );
    },
  });
  const result = transform(
    [
      'import type { Removed } from "types-only";',
      'import { type AlsoRemoved, kept } from "runtime-edge";',
      'const value: Removed | AlsoRemoved = kept;',
    ].join('\n'),
    'fixture.ts',
    defineNativePipeline({
      phases: [
        { name: 'preflight', native: { typescript: 'strip' } },
        { name: 'dependencies', plugins: [dependencies] },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /types-only|AlsoRemoved/);
  assert.match(result.code, /runtime-edge/);
});

test('routes legacy and modern decorators to explicit fallback', () => {
  for (const source of ['@sealed class Example {}', 'class Example { @logged value = 1 }']) {
    const result = transform(
      source,
      'fixture.ts',
      nativePipeline('fixture.ts', { typescript: 'strip' }).pipeline,
    );
    assert.equal(result.status, 'bailout');
    assert.equal(result.reason, 'preflight:decorators-not-supported');
    assert.equal(result.source, source);
  }
});

test.each([
  ['classic', false],
  ['classic-development', true],
  ['automatic', false],
  ['automatic-development', true],
] as const)('lowers JSX with the %s runtime mode', (jsx, development) => {
  const source = 'const view = <><Widget label="value" {...props} /></>;';
  const { filename, pipeline } = nativePipeline('fixture.jsx', { jsx });
  const result = transform(source, filename, pipeline);

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /<Widget|<\/>/);
  if (jsx.startsWith('automatic')) {
    assert.match(result.code, new RegExp(development ? 'jsxDEV' : '\\.jsx\\('));
    assert.match(result.code, new RegExp(development ? 'jsx-dev-runtime' : 'jsx-runtime'));
    assert.equal(result.code.includes('@__PURE__'), !development);
  } else {
    assert.match(result.code, /React\.createElement/);
    assert.equal(result.code.includes('fileName'), development);
  }
});

test('honors JSX import-source and classic pragma comments', () => {
  const automatic = transform(
    '/** @jsxImportSource preact */ const view = <Widget />;',
    'fixture.jsx',
    nativePipeline('fixture.jsx', { jsx: 'automatic' }).pipeline,
  );
  assert.equal(automatic.status, 'complete');
  assert.match(automatic.code, /preact\/jsx-runtime/);

  const classic = transform(
    '/** @jsx h */ /** @jsxFrag F */ const view = <><Widget /></>;',
    'fixture.jsx',
    nativePipeline('fixture.jsx', { jsx: 'classic' }).pipeline,
  );
  assert.equal(classic.status, 'complete');
  assert.match(classic.code, /h\(F, null/);
});

test('generated JSX runtime edges are visible to the normal dependency collector', () => {
  const dependencies: string[] = [];
  const collector = defineNativePlugin({
    name: 'dependency-collector',
    visitors: [
      defineVisitor(
        'CallExpression',
        { fields: ['staticArgument'], where: { calleeName: { equals: 'require' } } },
        path => {
          if (typeof path.node.staticArgument === 'string')
            dependencies.push(path.node.staticArgument);
        },
      ),
    ],
  });
  const result = transform(
    'const view = <Widget />;',
    'fixture.jsx',
    defineNativePipeline({
      phases: [
        { name: 'preflight', native: { jsx: 'automatic' } },
        { name: 'dependencies', plugins: [collector] },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.deepEqual(dependencies, ['react/jsx-runtime']);
});
