import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import assert from 'node:assert/strict';
import { test } from 'vitest';

import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test.each([
  ['deep member chains', 'a.b.c.d.e.f.g = () => 1;', ['<global>', 'a.b...f.g']],
  [
    'anonymous class methods',
    'const Foo = class { method() {} };',
    ['<global>', 'Foo', 'Foo#method'],
  ],
  [
    'anonymous static class methods',
    'const Foo = class { static method() {} };',
    ['<global>', 'Foo', 'Foo.method'],
  ],
  [
    'anonymous class fields',
    'const Foo = class { field = () => 1 };',
    ['<global>', 'Foo', 'Foo#field'],
  ],
  ['destructured containers', 'const {x} = {x: () => 1};', ['<global>', 'x']],
  ['numeric keys', 'const obj = { 1: () => 1 };', ['<global>', 'obj._']],
  ['non-identifier keys', 'const obj = { "not valid": () => 1 };', ['<global>', 'obj.notValid']],
  ['string member assignments', 'obj["foo"] = () => 1;', ['<global>', 'obj.foo']],
  ['computed member assignments', 'obj[a + b] = () => 1;', ['<global>', '<anonymous>']],
  ['private methods', 'class Foo { #method() {} }', ['Foo', '<anonymous>']],
  ['parenthesized functions', 'const x = (((() => 1)));', ['<global>', 'x']],
] as const)('matches Metro names for %s', (_description, source, names) => {
  const result = transform(source, 'fixture.js', defineNativePipeline({ phases: [] }), {
    functionMap: true,
  });
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.functionMap?.names, names);
});

test('maps expressions inside JSX attribute callbacks to their original tokens', () => {
  const source = [
    'function App(props: { title: string }) {',
    '  return <BigButton',
    '    title="throw"',
    '    onPress={() => {',
    "      throw new Error('failure');",
    '    }}',
    '  />;',
    '}',
  ].join('\n');
  const result = transform(
    source,
    'fixture.tsx',
    defineNativePipeline({
      phases: [
        { name: 'jsx', native: { typescript: 'strip', jsx: 'automatic' } },
        {
          name: 'wrap',
          plugins: [
            defineNativePlugin({
              name: 'wrap',
              pre(context) {
                context.editor.prepend('__d(function () {\n');
                context.editor.append('\n});');
              },
            }),
          ],
        },
      ],
    }),
    { sourceMapMode: 'boundary', functionMap: true },
  );
  assert.equal(result.status, 'complete');
  assert.ok(result.functionMap?.names.includes('BigButton.props.onPress'));
  const generatedOffset = result.code.indexOf('new Error');
  assert.notEqual(generatedOffset, -1);
  const generatedBefore = result.code.slice(0, generatedOffset).split('\n');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.tsx'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(
    originalPositionFor(map, {
      line: generatedBefore.length,
      column: generatedBefore.at(-1)!.length,
    }),
    {
      source: 'fixture.tsx',
      line: 5,
      column: source.split('\n')[4]!.indexOf('new Error'),
      name: null,
    },
  );
});

test('produces traceable Unicode-aware VLQ mappings', () => {
  const plugin = defineNativePlugin({
    name: 'map',
    visitors: [
      defineVisitor('NumericLiteral', {}, path =>
        path.replaceWith({ code: '200', mapping: 'anchor-start', names: ['generatedValue'] }),
      ),
    ],
  });
  const result = transform(
    "const emoji = '😀';\nconst value = 1;",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 2, column: 14 }), {
    source: 'fixture.js',
    line: 2,
    column: 14,
    name: 'generatedValue',
  });
});

test('keeps both declaration source slices mapped and the inserted name sourceless', () => {
  const source = 'export default function() { return 1; }';
  const plugin = defineNativePlugin({
    name: 'declaration-name-map',
    visitors: [
      defineVisitor(
        'FunctionDeclaration',
        { fields: ['declarationNameAnchor', 'declarationNamePrefix'] },
        path => path.replaceWith(path.withDeclarationName('_ref')),
      ),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
    { sourceMapMode: 'character' },
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  const functionColumn = result.code.indexOf('function');
  const nameColumn = result.code.indexOf('_ref');
  const bodyColumn = result.code.indexOf('{');
  assert.deepEqual(originalPositionFor(map, { line: 1, column: functionColumn }), {
    source: 'fixture.js',
    line: 1,
    column: source.indexOf('function'),
    name: null,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: nameColumn }), {
    source: null,
    line: null,
    column: null,
    name: null,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: bodyColumn }), {
    source: 'fixture.js',
    line: 1,
    column: source.indexOf('{'),
    name: null,
  });
});

test('traces CRLF, directive, wrapper, and explicit-location mappings', () => {
  const plugin = defineNativePlugin({
    name: 'map-boundaries',
    pre(context) {
      context.editor.prepend('/* wrapper */\n');
      context.editor.append('\n/* end */');
      context.editor.addSourceMapLocation(14);
    },
  });
  const source = "'use strict';\r\nconst value = 1;\r\n";
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
    { sourceMapMode: 'character' },
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 2, column: 0 }), {
    source: 'fixture.js',
    line: 1,
    column: 0,
    name: null,
  });
  assert.deepEqual(originalPositionFor(map, { line: 3, column: 0 }), {
    source: 'fixture.js',
    line: 2,
    column: 0,
    name: null,
  });
});

test('traces a position back through the language prepass and a source rewrite', () => {
  // The prepass prints an intermediate and contributes a layer of its own, so a
  // TypeScript file that also runs a source-level rewrite composes one more
  // layer than a plain JavaScript one does.
  const source = [
    'export function widen(input: string, factor: number = 2): string {',
    '  const repeated = input.repeat(factor);',
    '  return repeated;',
    '}',
  ].join('\n');
  const result = transform(
    source,
    'fixture.ts',
    defineNativePipeline({
      phases: [
        {
          name: 'language',
          native: {
            typescript: 'strip',
            transforms: { blockScoping: true, parameters: true },
            helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
            comments: false,
          },
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.ts'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  const lines = result.code.split('\n');
  const generatedLine = lines.findIndex(line => line.includes('input.repeat(factor)')) + 1;
  assert.notEqual(generatedLine, 0);
  const generatedColumn = lines[generatedLine - 1].indexOf('input.repeat(factor)');
  const traced = originalPositionFor(map, {
    line: generatedLine,
    column: generatedColumn,
  });
  assert.equal(traced.source, 'fixture.ts');
  // `const repeated = input.repeat(factor);` is the second line of the input.
  assert.equal(traced.line, 2);
  // The column can drift by the difference between the input's indentation and
  // the intermediate's, because the prepass reprints the file and the layers
  // compose through that reprint. Without a prepass in the chain it is exact.
  const expectedColumn = source.split('\n')[1].indexOf('input.repeat(factor)');
  assert.ok(
    Math.abs(traced.column - expectedColumn) <= 2,
    `expected column near ${expectedColumn}, got ${traced.column}`,
  );
});
