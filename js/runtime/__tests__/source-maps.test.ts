import { decodedMappings, originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import assert from 'node:assert/strict';
import { test } from 'vitest';

import type { NativeEditor } from '../../contracts/visitor';
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
  const jsxCallOffset = result.code.lastIndexOf('jsx', result.code.indexOf('BigButton'));
  assert.notEqual(jsxCallOffset, -1);
  const generatedOffset = result.code.indexOf('new Error');
  assert.notEqual(generatedOffset, -1);
  const generatedBefore = result.code.slice(0, generatedOffset).split('\n');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.tsx'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  const generatedBeforeJsx = result.code.slice(0, jsxCallOffset).split('\n');
  assert.deepEqual(
    originalPositionFor(map, {
      line: generatedBeforeJsx.length,
      column: generatedBeforeJsx.at(-1)!.length,
    }),
    {
      source: 'fixture.tsx',
      line: 2,
      column: source.split('\n')[1]!.indexOf('<BigButton'),
      name: null,
    },
  );
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

test('maps an ordinary replacement to the start of the range it replaced', () => {
  // An omitted mapping policy means anchor-start: replacing source is an ordinary
  // replacement, and only text a caller calls generated goes unmapped.
  const source = 'const alpha = compute(alpha);\nconst beta = 2;\n';
  const cases = [
    {
      name: 'update',
      apply: (editor: NativeEditor, at: number) => editor.update(at, at + 5, 'ALPHA'),
    },
    {
      name: 'overwrite',
      apply: (editor: NativeEditor, at: number) => editor.overwrite(at, at + 5, 'ALPHA'),
    },
    { name: 'replace', apply: (editor: NativeEditor) => editor.replace('compute', 'CALL') },
    {
      name: 'multiline',
      apply: (editor: NativeEditor, at: number) => editor.overwrite(at, at + 5, 'ALPHA\n.first'),
    },
  ] as const;
  for (const { name, apply } of cases) {
    const at = source.indexOf('alpha');
    const result = transform(
      source,
      'fixture.js',
      defineNativePipeline({
        phases: [
          {
            name: 'edit',
            plugins: [
              defineNativePlugin({
                name: `edit-${name}`,
                pre(context) {
                  apply(context.editor, at);
                },
              }),
            ],
          },
        ],
      }),
      { sourceMapMode: 'boundary' },
    );
    assert.equal(result.status, 'complete', name);
    const map = new TraceMap({
      version: 3,
      sources: ['fixture.js'],
      names: result.map.names,
      mappings: result.map.mappings,
    });
    const replaced = name === 'replace' ? source.indexOf('compute') : at;
    const generated = result.code.indexOf(name === 'replace' ? 'CALL' : 'ALPHA');
    const before = result.code.slice(0, generated).split('\n');
    assert.deepEqual(
      originalPositionFor(map, { line: before.length, column: before.at(-1)!.length }),
      { source: 'fixture.js', line: 1, column: replaced, name: null },
      name,
    );
    // Mapping resumes after the replacement rather than interpolating through it.
    const resumed = result.code.indexOf('const beta');
    const beforeResumed = result.code.slice(0, resumed).split('\n');
    assert.deepEqual(
      originalPositionFor(map, {
        line: beforeResumed.length,
        column: beforeResumed.at(-1)!.length,
      }),
      { source: 'fixture.js', line: 2, column: 0, name: null },
      name,
    );
  }
});

test('leaves an explicitly sourceless replacement unmapped', () => {
  const source = 'const alpha = 1;\n';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'edit',
          plugins: [
            defineNativePlugin({
              name: 'generated-text',
              pre(context) {
                context.editor.overwrite(14, 15, '/* generated */', 'sourceless');
              },
            }),
          ],
        },
      ],
    }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: 14 }), {
    source: null,
    line: null,
    column: null,
    name: null,
  });
});

test('keeps a wholly generated module unmapped when it declares itself sourceless', () => {
  // Replacing a whole module with a synthesized proxy is the shape where the
  // anchor-start default is wrong: every generated line would claim the input's first
  // character. Such a replacement has to say it is generated.
  const source = 'export default function App() {\n  return null;\n}\n';
  const proxy = 'import React from "react";\nexport default 1;\n';
  const mappingsFor = (mapping?: 'sourceless') => {
    const result = transform(
      source,
      'fixture.js',
      defineNativePipeline({
        phases: [
          {
            name: 'proxy',
            plugins: [
              defineNativePlugin({
                name: 'proxy',
                pre(context) {
                  context.editor.overwrite(0, context.source.length, proxy, mapping);
                },
              }),
            ],
          },
        ],
      }),
      { sourceMapMode: 'boundary' },
    );
    assert.equal(result.status, 'complete');
    return result.map.mappings;
  };
  const declared = mappingsFor('sourceless');
  assert.ok(
    declared
      .split(';')
      .every(line => line.split(',').every((segment: string) => segment.length <= 1)),
    `a sourceless module must stay unmapped: ${declared}`,
  );
  // Omitting the policy anchors it instead, which is why the proxy plugins downstream
  // have to declare themselves.
  assert.notEqual(mappingsFor(), declared);
});

test('honors explicit mapping policies on editor overwrites', () => {
  const source = 'consume(value);';
  const plugin = defineNativePlugin({
    name: 'mapped-overwrite',
    pre(context) {
      context.editor.overwrite(8, 13, 'value.default', 'anchor-start');
    },
  });
  const result = transform(
    source,
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
  assert.deepEqual(originalPositionFor(map, { line: 1, column: 8 }), {
    source: 'fixture.js',
    line: 1,
    column: 8,
    name: null,
  });
});

test('keeps later-phase mappings inside anchor-start replacements anchored', () => {
  const source = 'value;';
  const expand = defineNativePlugin({
    name: 'expand-binding',
    pre(context) {
      context.editor.overwrite(0, 5, 'value.default', 'anchor-start');
    },
  });
  const rewriteGeneratedTail = defineNativePlugin({
    name: 'rewrite-generated-tail',
    pre(context) {
      context.editor.overwrite(6, 13, 'default', 'anchor-start');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'expand', plugins: [expand] },
        { name: 'rewrite-tail', plugins: [rewriteGeneratedTail] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'value.default;');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: 6 }), {
    source: 'fixture.js',
    line: 1,
    column: 0,
    name: null,
  });
});

test('does not interpolate inside bounded anchor-start replacements', () => {
  const source = 'value;';
  const anchorReplacement = defineNativePlugin({
    name: 'anchor-replacement',
    pre(context) {
      context.editor.overwrite(0, 5, 'other', 'anchor-start');
    },
  });
  const markInterior = defineNativePlugin({
    name: 'mark-interior',
    pre(context) {
      context.editor.overwrite(2, 3, 'h', 'anchor-start');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'anchor', plugins: [anchorReplacement] },
        { name: 'interior', plugins: [markInterior] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'other;');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: 2 }), {
    source: 'fixture.js',
    line: 1,
    column: 0,
    name: null,
  });
});

test('anchors every non-empty line of multiline anchor-start replacements', () => {
  const source = 'value;';
  const multilineReplacement = defineNativePlugin({
    name: 'multiline-replacement',
    pre(context) {
      context.editor.overwrite(0, 5, 'first\nsecond', 'anchor-start');
    },
  });
  const markSecondLine = defineNativePlugin({
    name: 'mark-second-line',
    pre(context) {
      context.editor.overwrite(6, 12, 'second', 'anchor-start');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'multiline', plugins: [multilineReplacement] },
        { name: 'second-line', plugins: [markSecondLine] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'first\nsecond;');
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
});

test('resumes original mappings after a trailing anchor-start newline', () => {
  const source = 'value;';
  const plugin = defineNativePlugin({
    name: 'trailing-newline',
    pre(context) {
      context.editor.overwrite(0, 5, 'generated\n', 'anchor-start');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'rewrite', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'generated\n;');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 2, column: 0 }), {
    source: 'fixture.js',
    line: 1,
    column: 5,
    name: null,
  });
});

test('interpolates shifted identity tails after sourceless prefixes', () => {
  const source = 'value;';
  const prefix = defineNativePlugin({
    name: 'prefix',
    pre(context) {
      context.editor.prepend('prefix');
    },
  });
  const markCopiedInterior = defineNativePlugin({
    name: 'mark-copied-interior',
    pre(context) {
      context.editor.overwrite(8, 9, 'l', 'anchor-start');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'prefix', plugins: [prefix] },
        { name: 'interior', plugins: [markCopiedInterior] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'prefixvalue;');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: 8 }), {
    source: 'fixture.js',
    line: 1,
    column: 2,
    name: null,
  });
});

test('resumes identity mapping after same-line anchor-start replacements', () => {
  const source = 'value + keep;';
  const rewriteBinding = defineNativePlugin({
    name: 'rewrite-binding',
    pre(context) {
      context.editor.overwrite(0, 5, '_ui.value', 'anchor-start');
    },
  });
  const markFollowingSource = defineNativePlugin({
    name: 'mark-following-source',
    pre(context) {
      context.editor.overwrite(12, 13, 'k', 'anchor-start');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'binding', plugins: [rewriteBinding] },
        { name: 'following', plugins: [markFollowingSource] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, '_ui.value + keep;');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: 12 }), {
    source: 'fixture.js',
    line: 1,
    column: 8,
    name: null,
  });
});

test('preserves anchor and shifted-identity spans through serialized input maps', () => {
  const cases = [
    {
      source: 'value;',
      edit: 'anchor',
      secondOffset: 2,
      originalColumn: 0,
    },
    {
      source: 'value;',
      edit: 'prefix',
      secondOffset: 8,
      originalColumn: 2,
    },
    {
      source: '"😀";value;',
      edit: 'unicode-prefix',
      secondOffset: 12,
      originalColumn: 7,
    },
  ];
  for (const [index, testCase] of cases.entries()) {
    const first = transform(
      testCase.source,
      'intermediate.js',
      defineNativePipeline({
        phases: [
          {
            name: 'first',
            plugins: [
              defineNativePlugin({
                name: 'first',
                pre(context) {
                  if (testCase.edit === 'anchor')
                    context.editor.overwrite(0, 5, 'other', 'anchor-start');
                  else context.editor.prepend(testCase.edit === 'prefix' ? 'prefix' : '/*x*/');
                },
              }),
            ],
          },
        ],
      }),
    );
    assert.equal(first.status, 'complete');
    const second = transform(
      first.code,
      'generated.js',
      defineNativePipeline({
        phases: [
          {
            name: 'second',
            plugins: [
              defineNativePlugin({
                name: 'second',
                pre(context) {
                  context.editor.overwrite(
                    testCase.secondOffset,
                    testCase.secondOffset + 1,
                    first.code.slice(testCase.secondOffset, testCase.secondOffset + 1),
                    'anchor-start',
                  );
                },
              }),
            ],
          },
        ],
      }),
      { inputSourceMap: first.map },
    );
    assert.equal(second.status, 'complete');
    const map = new TraceMap({
      version: 3,
      sources: [`fixture-${index}.js`],
      names: second.map.names,
      mappings: second.map.mappings,
    });
    assert.deepEqual(originalPositionFor(map, { line: 1, column: testCase.secondOffset }), {
      source: `fixture-${index}.js`,
      line: 1,
      column: testCase.originalColumn,
      name: null,
    });
  }
});

test('preserves multiline CRLF anchors through serialized input maps', () => {
  const first = transform(
    'value;\r\nnext;',
    'intermediate.js',
    defineNativePipeline({
      phases: [
        {
          name: 'first',
          plugins: [
            defineNativePlugin({
              name: 'first',
              pre(context) {
                context.editor.overwrite(0, 5, 'first\r\nsecond', 'anchor-start');
              },
            }),
          ],
        },
      ],
    }),
  );
  assert.equal(first.status, 'complete');
  const second = transform(
    first.code,
    'generated.js',
    defineNativePipeline({
      phases: [
        {
          name: 'second',
          plugins: [
            defineNativePlugin({
              name: 'second',
              pre(context) {
                context.editor.overwrite(7, 13, 'second', 'anchor-start');
              },
            }),
          ],
        },
      ],
    }),
    { inputSourceMap: first.map },
  );
  assert.equal(second.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: second.map.names,
    mappings: second.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 2, column: 0 }), {
    source: 'fixture.js',
    line: 1,
    column: 0,
    name: null,
  });
});

test('preserves JSX callback locations after a mapped binding overwrite', () => {
  const source = [
    "import { BigButton } from 'ui';",
    'export default function App() {',
    '  return <BigButton',
    '    title="throw"',
    '    onPress={() => {',
    "      throw new Error('failure');",
    '    }}',
    '  />;',
    '}',
  ].join('\n');
  const plugin = defineNativePlugin({
    name: 'rewrite-imported-binding',
    pre(context) {
      const reference = source.indexOf('BigButton', source.indexOf('BigButton') + 1);
      context.editor.overwrite(
        reference,
        reference + 'BigButton'.length,
        '_ui.BigButton',
        'anchor-start',
      );
    },
  });
  const result = transform(
    source,
    'fixture.tsx',
    defineNativePipeline({
      phases: [
        { name: 'rewrite', plugins: [plugin] },
        { name: 'jsx', native: { typescript: 'strip', jsx: 'automatic' } },
      ],
    }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
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
      line: 6,
      column: source.split('\n')[5]!.indexOf('new Error'),
      name: null,
    },
  );
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

test('projects earlier boundaries through a later sparse phase', () => {
  const source = 'const alpha = one + two + three;';
  const boundaries = [source.indexOf('one'), source.indexOf('two'), source.indexOf('three')];
  const markTokens = defineNativePlugin({
    name: 'mark-tokens',
    pre(context) {
      for (const offset of boundaries) context.editor.addSourceMapLocation(offset);
    },
  });
  const sparseRewrite = defineNativePlugin({
    name: 'sparse-rewrite',
    pre(context) {
      const start = source.indexOf('three');
      // The default mapping is anchor-start, so this regression must not depend on
      // passing it explicitly.
      context.editor.overwrite(start, start + 'three'.length, 'final');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'mark', plugins: [markTokens] },
        { name: 'rewrite', plugins: [sparseRewrite] },
      ],
    }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  const generatedColumns = decodedMappings(map)[0]!.map(segment => segment[0]);
  for (const offset of boundaries.slice(0, 2)) {
    assert.ok(generatedColumns.includes(offset), `missing explicit boundary at column ${offset}`);
    assert.deepEqual(originalPositionFor(map, { line: 1, column: offset }), {
      source: 'fixture.js',
      line: 1,
      column: offset,
      name: null,
    });
  }
});

test('keeps a removed range out of the columns a later phase still has', () => {
  // Projection carries earlier boundaries through copied ranges, so a removal has to
  // close the span it interrupts. Otherwise the removed range's boundaries land on
  // generated columns the line no longer has.
  const source = 'const kept = 1; const dropped = 2; const gone = 3;\nconst next = 4;\n';
  const markTokens = defineNativePlugin({
    name: 'mark-tokens',
    pre(context) {
      for (const needle of ['kept', 'dropped', 'gone', 'next'])
        context.editor.addSourceMapLocation(source.indexOf(needle));
    },
  });
  const truncate = defineNativePlugin({
    name: 'truncate',
    pre(context) {
      context.editor.remove(source.indexOf(' const dropped'), source.indexOf('\n'));
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'mark', plugins: [markTokens] },
        { name: 'truncate', plugins: [truncate] },
      ],
    }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  const firstLineLength = result.code.split('\n')[0]!.length;
  const generatedColumns = decodedMappings(map)[0]!.map(segment => segment[0]);
  assert.ok(
    generatedColumns.every(column => column <= firstLineLength),
    `mapped columns ${generatedColumns} exceed the ${firstLineLength}-column line`,
  );
  // The boundary the line kept is still traced through the removal.
  assert.deepEqual(originalPositionFor(map, { line: 1, column: source.indexOf('kept') }), {
    source: 'fixture.js',
    line: 1,
    column: source.indexOf('kept'),
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
