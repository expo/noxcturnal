import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  compilePhasePlan,
  composeNativePipeline,
  defineNativePipeline,
  defineNativePlugin,
  definePipelinePhase,
  defineVisitor,
  pipelineCacheKey,
  transform,
  transformClassificationCacheKey,
} from '../../index';
import { ArtifactDemand, closeArtifactDemand, planArtifacts } from '../../pipeline/artifacts';
test('keys scheduler classification and phase planning', () => {
  const pipeline = defineNativePipeline({ phases: [{ name: 'transform', plugins: [] }] });
  const js = transformClassificationCacheKey(pipeline, 'fixture.js', 'const value = 1');
  const flow = transformClassificationCacheKey(
    pipeline,
    'fixture.js',
    '// @flow\nconst value: number = 1',
  );
  assert.notEqual(js, flow);
  assert.equal(js, transformClassificationCacheKey(pipeline, 'fixture.js', 'const other = 2'));
});

test('compiles conservative phase boundaries and edit effects', () => {
  const text = defineNativePlugin({ name: 'text', editEffect: 'text-only' });
  const unknown = defineNativePlugin({ name: 'unknown' });
  const plans = compilePhasePlan(
    defineNativePipeline({
      phases: [
        { name: 'text', plugins: [text] },
        { name: 'printed', plugins: [text], requiresPrintedInput: true },
        { name: 'compiler', plugins: [unknown] },
      ],
    }),
  );
  assert.equal(plans[0].editEffect, 'text-only');
  assert.equal(plans[1].requiresPrintedInput, true);
  assert.equal(plans[2].editEffect, 'whole-program');
  assert.ok(Object.isFrozen(plans));
  assert.throws(
    () =>
      compilePhasePlan(
        defineNativePipeline({
          phases: [
            {
              name: 'invalid',
              plugins: [],
              editEffect: 'sometimes' as never,
            },
          ],
        }),
      ),
    /invalid edit effect/,
  );
});

test('closes artifact implications and chooses the minimal construction path', () => {
  assert.equal(
    closeArtifactDemand(ArtifactDemand.BindingsReferences),
    ArtifactDemand.BindingsReferences | ArtifactDemand.SyntaxRoute | ArtifactDemand.RenderedText,
  );
  assert.equal(planArtifacts(ArtifactDemand.RenderedText), 'render-only');
  assert.equal(planArtifacts(ArtifactDemand.RealizedMap), 'render-and-map');
  assert.equal(planArtifacts(ArtifactDemand.StructuralParents), 'stateless-syntax');
  assert.equal(
    planArtifacts(ArtifactDemand.StructuralParents, ArtifactDemand.None, true),
    'retained-syntax',
  );
  assert.equal(planArtifacts(ArtifactDemand.LexicalScopes), 'retained-semantic');
  assert.equal(
    planArtifacts(
      ArtifactDemand.StructuralParents,
      ArtifactDemand.SyntaxRoute | ArtifactDemand.RenderedText | ArtifactDemand.StructuralParents,
    ),
    'cached',
  );
});

test('rejects edits that violate a none effect contract', () => {
  const plugin = defineNativePlugin({
    name: 'false-none-contract',
    editEffect: 'none',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith('changed');
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        'const value = 1',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
      ),
    /declared edit effect none but emitted edits/,
  );
});

test('plugins in one phase observe one immutable input and commit together', () => {
  let observed = '';
  const edit = defineNativePlugin({
    name: 'edit-text',
    editEffect: 'text-only',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith('renamed');
      }),
    ],
  });
  const observe = defineNativePlugin({
    name: 'observe-original-ast',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        observed = path.sourceText();
      }),
    ],
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'shared-input', plugins: [edit, observe] }],
    }),
    {},
  );
  assert.equal(result.status, 'complete');
  assert.equal(observed, 'value');
  assert.equal(result.code, 'const renamed = 1');
});

test('reparses a changed version for the next current-source phase regardless of edit effect', () => {
  let observed = '';
  const edit = defineNativePlugin({
    name: 'text-effect-edit',
    editEffect: 'text-only',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith('renamed');
      }),
    ],
  });
  const observe = defineNativePlugin({
    name: 'current-version-observer',
    editEffect: 'none',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        observed = path.sourceText();
      }),
    ],
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'edit', plugins: [edit] },
        { name: 'observe', plugins: [observe] },
      ],
    }),
    {},
  );
  assert.equal(result.status, 'complete');
  assert.equal(observed, 'renamed');
});

test('structural static-plan caching rebinds callbacks from recreated plugins', () => {
  const run = (replacement: string) => {
    const plugin = defineNativePlugin({
      name: 'recreated-static-plugin',
      editEffect: 'text-only',
      visitors: [
        defineVisitor('Identifier', {}, path => {
          path.replaceWith(replacement);
        }),
      ],
    });
    return transform(
      'value;',
      'fixture.js',
      defineNativePipeline({ phases: [{ name: 'replace', plugins: [plugin] }] }),
    );
  };

  const first = run('first');
  const second = run('second');
  assert.equal(first.status, 'complete');
  assert.equal(second.status, 'complete');
  if (first.status !== 'complete' || second.status !== 'complete') return;
  assert.equal(first.code, 'first;');
  assert.equal(second.code, 'second;');
});

test('stable plugin definitions receive current per-transform plugin data', () => {
  const plugin = defineNativePlugin<{ replacement: string }>({
    name: 'stable-plugin-data',
    editEffect: 'text-only',
    createState: context => ({
      replacement: (context.pluginData as { replacement: string }).replacement,
    }),
    visitors: [
      defineVisitor('Identifier', {}, (path, state: { replacement: string }) => {
        assert.equal(
          (path.context.pluginData as { replacement: string }).replacement,
          state.replacement,
        );
        path.replaceWith(state.replacement);
      }),
    ],
  });
  const pipeline = defineNativePipeline({
    phases: [{ name: 'replace', plugins: [plugin] }],
  });
  const run = (replacement: string) =>
    transform('value;', 'fixture.js', pipeline, { pluginData: { replacement } });

  const first = run('first');
  const second = run('second');
  assert.equal(first.status, 'complete');
  assert.equal(second.status, 'complete');
  if (first.status !== 'complete' || second.status !== 'complete') return;
  assert.equal(first.code, 'first;');
  assert.equal(second.code, 'second;');
  assert.equal(
    pipelineCacheKey(pipeline, 'fixture.js', { pluginData: { replacement: 'first' } }),
    pipelineCacheKey(pipeline, 'fixture.js', { pluginData: { replacement: 'second' } }),
  );
});

test('pipeline cache keys include normalized ancestry requirements', () => {
  const pipeline = (fields: readonly ('bindingName' | 'kind')[]) =>
    defineNativePipeline({
      phases: [
        {
          name: 'visit',
          plugins: [
            defineNativePlugin({
              name: 'same-plugin-name',
              visitors: [
                defineVisitor(
                  'CallExpression',
                  {
                    ancestry: {
                      mode: 'findParent',
                      routes: { VariableDeclarator: { fields } },
                    },
                  },
                  () => {},
                ),
              ],
            }),
          ],
        },
      ],
    });
  assert.notEqual(
    pipelineCacheKey(pipeline(['bindingName']), 'fixture.js'),
    pipelineCacheKey(pipeline(['kind']), 'fixture.js'),
  );
});

test('reusable phases preserve identity across dynamic pipeline composition', () => {
  const plugin = defineNativePlugin({
    name: 'stable-composed-plugin',
    visitors: [defineVisitor('Identifier', {}, () => {})],
  });
  const phase = definePipelinePhase({ name: 'stable', plugins: [plugin] });
  const first = defineNativePipeline({ phases: [phase] });
  const second = defineNativePipeline({ phases: [phase] });

  assert.equal(first.phases[0], phase);
  assert.equal(second.phases[0], phase);
  assert.equal(composeNativePipeline([phase]), composeNativePipeline([phase]));
});

test('phases intern structurally whether they are named or written inline', () => {
  const plugin = defineNativePlugin({
    name: 'interned-plugin',
    visitors: [defineVisitor('Identifier', {}, () => {})],
  });
  // Structural identity: the same name, flags, and ordered plugins are the same
  // phase, so plan and route compilation are memoised on it either way.
  const inline = () => defineNativePipeline({ phases: [{ name: 'inline', plugins: [plugin] }] });
  assert.equal(inline().phases[0], inline().phases[0]);
  assert.equal(inline(), inline());
  const native = () =>
    defineNativePipeline({ phases: [{ name: 'native', native: { transforms: { forOf: true } } }] });
  assert.equal(native().phases[0], native().phases[0]);
  // A different shape is a different phase.
  assert.notEqual(
    inline().phases[0],
    defineNativePipeline({ phases: [{ name: 'inline', plugins: [] }] }).phases[0],
  );
});

test('phases defined after transforming still intern', () => {
  // The first transform closes the definition scope, which only changes whether
  // interning is budgeted — never whether it happens.
  const plugin = defineNativePlugin({
    name: 'post-transform-plugin',
    visitors: [defineVisitor('Identifier', {}, () => {})],
  });
  transform('const value = 1;', 'fixture.js', defineNativePipeline({ phases: [] }));
  const build = () =>
    defineNativePipeline({ phases: [{ name: 'post-transform', plugins: [plugin] }] });
  assert.equal(build().phases[0], build().phases[0]);
  assert.equal(transform('const value = 1;', 'fixture.js', build()).status, 'complete');
});

test('realizes an explicitly required map once and reuses it at final composition', () => {
  const edit = defineNativePlugin({
    name: 'mapped-edit',
    editEffect: 'text-only',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith({
          code: 'renamed',
          mapping: 'anchor-boundaries',
          names: ['value'],
        });
      }),
    ],
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'mapped',
          plugins: [edit],
          requiresRealizedMap: true,
        },
        {
          name: 'observe-rendered',
          plugins: [],
          requiresPrintedInput: true,
        },
      ],
    }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const renamed = 1');
  assert.deepEqual(result.map.names, ['value']);
});

test('coalesces structural mutators by composing them in one phase', () => {
  const rename = (name: string, from: string, to: string) =>
    defineNativePlugin({
      name,
      editEffect: 'whole-program',
      visitors: [
        defineVisitor('Identifier', {}, path => {
          if (path.sourceText() === from) path.replaceWith(to);
        }),
      ],
    });
  const result = transform(
    'const first = second;',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'renames',
          plugins: [
            rename('first-owner', 'first', 'renamedFirst'),
            rename('second-owner', 'second', 'renamedSecond'),
          ],
        },
      ],
    }),
    {},
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const renamedFirst = renamedSecond;');
});

test('keeps the source version for an identity-equivalent transaction', () => {
  const identity = defineNativePlugin({
    name: 'identity-edit',
    editEffect: 'whole-program',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.replaceWith({ code: path.sourceText(), mapping: 'identity' });
      }),
    ],
  });
  const emptyInsertion = defineNativePlugin({
    name: 'empty-insertion',
    editEffect: 'whole-program',
    pre(context) {
      context.editor.appendLeft(0, '');
    },
  });
  const result = transform(
    'const value = 1;',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'identity', plugins: [identity, emptyInsertion] }],
    }),
    {},
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 1;');
});

test('does not reuse a no-op phase session without the next phase fields', () => {
  const conservativeNoop = defineNativePlugin({
    name: 'conservative-noop',
    editEffect: 'whole-program',
    visitors: [defineVisitor('Identifier', { fields: ['name'] }, () => {})],
  });
  let importedSource: string | undefined;
  const readImport = defineNativePlugin({
    name: 'read-import',
    editEffect: 'none',
    visitors: [
      defineVisitor('ImportDeclaration', { fields: ['source'] }, path => {
        importedSource = path.node.source;
      }),
    ],
  });
  const result = transform(
    'import value from "./dependency"; value;',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'conservative-noop', plugins: [conservativeNoop] },
        { name: 'read-import', plugins: [readImport] },
      ],
    }),
    {},
  );
  assert.equal(result.status, 'complete');
  assert.equal(importedSource, './dependency');
});

test('creates a map-only version without reparsing unchanged code', () => {
  const mark = defineNativePlugin({
    name: 'map-only-edit',
    editEffect: 'text-only',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        path.context.editor.addSourceMapLocation(path.node.start);
      }),
    ],
  });
  const result = transform(
    'const value = 1;',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'mark', plugins: [mark] },
        { name: 'observe', plugins: [] },
      ],
    }),
    {},
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 1;');
});

test('keeps bytes and maps correct across structural render/reparse boundaries', () => {
  const rename = (name: string, from: string, to: string) =>
    defineNativePlugin({
      name,
      editEffect: 'whole-program',
      visitors: [
        defineVisitor('Identifier', {}, path => {
          if (path.sourceText() === from)
            path.replaceWith({ code: to, mapping: 'anchor-boundaries', names: [from] });
        }),
      ],
    });
  const pipeline = defineNativePipeline({
    phases: [
      { name: 'first', plugins: [rename('first-map', 'first', 'one')] },
      { name: 'second', plugins: [rename('second-map', 'second', 'two')] },
      {
        name: 'parents',
        plugins: [
          defineNativePlugin({
            name: 'parent-observer',
            editEffect: 'none',
            visitors: [defineVisitor('Identifier', { ancestry: { mode: 'parent' } }, () => {})],
          }),
        ],
      },
    ],
  });
  const result = transform('const first = second;', 'fixture.js', pipeline, {
    sourceMapMode: 'boundary',
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const one = two;');
  assert.ok(result.map);
});
