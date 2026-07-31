import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import assert from 'node:assert/strict';
import { test } from 'vitest';

import type { SourceFragment } from '../../index';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { packEdits } from '../../protocol/edits';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../../runtime/session';

const ALL_RETAINED_CAPABILITIES = (1 << 6) - 1;
const openRetained = (
  source: string,
  filename: string,
  options: ConstructorParameters<typeof NativeTransformSession>[2] = {},
) =>
  new NativeTransformSession(
    source,
    filename,
    options,
    packRouteManifest([], false, false, ALL_RETAINED_CAPABILITIES),
  );

test('handles deterministic randomized non-overlapping edit batches', () => {
  let seed = 0x12345678;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  for (let iteration = 0; iteration < 100; iteration++) {
    const source = 'abcdefghijklmnopqrstuvwxyz';
    const session = openRetained(source, 'fuzz.js');
    const edits = Array.from({ length: 5 }, (_, index) => ({
      kind: 'Replace' as const,
      start: index * 5,
      end: index * 5 + 1,
      content: String.fromCharCode(65 + Math.floor(random() * 26)),
    }));
    assert.equal(session.commit(edits).code.length, source.length);
    session.close();
  }
});

test('rejects untranslatable mixed edit coordinate spaces', () => {
  assert.throws(
    () =>
      packEdits([
        {
          kind: 'Replace',
          start: 0,
          end: 1,
          content: 'x',
          coordinateSpace: 'generated',
        },
      ]),
    /requires explicit translation/,
  );
});

test('composes an unwrap replacement with inner edits from another plugin', () => {
  // The log-box failure shape: one plugin strips an export wrapper by replacing the
  // declaration with its own source, another rewrites a call inside the body. The
  // provenance-carrying replacement keeps the body range live, so both apply.
  const source = `export function setup() {\n    const toast = require('./toast');\n}\n`;
  const unwrapExports = defineNativePlugin({
    name: 'unwrap-exports',
    visitors: [
      defineVisitor(
        'ExportNamedDeclaration',
        { children: { declaration: { route: 'Declaration' } } },
        path => {
          const declaration = path.getChild('declaration');
          assert.ok(declaration);
          path.replaceWith(declaration.getSource());
        },
      ),
    ],
  });
  const rewriteRequires = defineNativePlugin({
    name: 'rewrite-requires',
    visitors: [
      defineVisitor('CallExpression', { fields: ['calleeName', 'staticArgument'] }, path => {
        if (path.node.calleeName !== 'require') return;
        path.replaceWith(`_REQ(${JSON.stringify(path.node.staticArgument)})`);
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: [unwrapExports, rewriteRequires] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, `function setup() {\n    const toast = _REQ("./toast");\n}\n`);
});

test('composes template slots with glue text and inner edits', () => {
  const source = `export default function main() { return require('./impl'); }\n`;
  const lowerDefault = defineNativePlugin({
    name: 'lower-default-export',
    visitors: [
      defineVisitor(
        'ExportDefaultDeclaration',
        { children: { declaration: { route: 'Declaration' } } },
        path => {
          const declaration = path.getChild('declaration');
          assert.ok(declaration);
          path.replaceWith(path.context.code.template`var _default = ${declaration.getSource()};`);
        },
      ),
    ],
  });
  const rewriteRequires = defineNativePlugin({
    name: 'rewrite-requires',
    visitors: [
      defineVisitor('CallExpression', { fields: ['calleeName', 'staticArgument'] }, path => {
        if (path.node.calleeName !== 'require') return;
        path.replaceWith(`_REQ(${JSON.stringify(path.node.staticArgument)})`);
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: [lowerDefault, rewriteRequires] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, `var _default = function main() { return _REQ("./impl"); };\n`);
});

test('rejects string coercion of source fragments with guidance', () => {
  assert.throws(
    () =>
      transform(
        'const value = 1;',
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'transform',
              plugins: [
                defineNativePlugin({
                  name: 'coerce-fragment',
                  visitors: [
                    defineVisitor('VariableDeclaration', {}, path => {
                      path.replaceWith(`copied: ${path.getSource()}`);
                    }),
                  ],
                }),
              ],
            },
          ],
        }),
      ),
    /carries provenance/,
  );
});

test('degrades out-of-place source fragments to plain text copies', () => {
  // A fragment interpolated outside its own range (duplication) cannot keep
  // provenance for both copies; the replacement still renders correctly.
  const source = 'const value = compute();\n';
  const duplicate = defineNativePlugin({
    name: 'duplicate-initializer',
    visitors: [
      defineVisitor('VariableDeclarator', { children: { init: { route: 'Expression' } } }, path => {
        const init = path.getChild('init');
        assert.ok(init);
        const fragment = init.getSource();
        path.replaceWith(path.context.code.template`checked = ${fragment} ?? ${fragment}`);
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [duplicate] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const checked = compute() ?? compute();\n');
});

test('attributes overlapping edit conflicts to their owning plugins', () => {
  const source = 'const value = 1;\n';
  const wide = defineNativePlugin({
    name: 'wide-owner',
    visitors: [
      defineVisitor('VariableDeclaration', {}, path => {
        path.replaceWith('var value = 2;');
      }),
    ],
  });
  const inner = defineNativePlugin({
    name: 'inner-owner',
    visitors: [
      defineVisitor('Identifier', { fields: ['name'] }, path => {
        if (path.node.name === 'value') path.replaceWith('renamed');
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [wide, inner] }] }),
      ),
    /owners: wide-owner, inner-owner/,
  );
});

test('inserted copies reflect same-phase edits at commit time', () => {
  const source = `function helper() { return require('./impl'); }\n`;
  const duplicateHelper = defineNativePlugin({
    name: 'duplicate-helper',
    visitors: [
      defineVisitor('Function', {}, path => {
        path.insertAfter(path.getSource());
      }),
    ],
  });
  const rewriteRequires = defineNativePlugin({
    name: 'rewrite-requires',
    visitors: [
      defineVisitor('CallExpression', { fields: ['calleeName', 'staticArgument'] }, path => {
        if (path.node.calleeName === 'require') path.replaceWith(`_REQ("./impl")`);
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: [duplicateHelper, rewriteRequires] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code.match(/_REQ\("\.\/impl"\)/g)?.length, 2);
  assert.ok(!result.code.includes('require('));
});

test('duplicated template slots reflect same-phase edits', () => {
  const source = 'const value = compute();\n';
  const duplicate = defineNativePlugin({
    name: 'duplicate-initializer',
    visitors: [
      defineVisitor('VariableDeclarator', { children: { init: { route: 'Expression' } } }, path => {
        const init = path.getChild('init');
        assert.ok(init);
        const fragment = init.getSource();
        path.replaceWith(path.context.code.template`checked = ${fragment} ?? ${fragment}`);
      }),
    ],
  });
  const upgradeCalls = defineNativePlugin({
    name: 'upgrade-calls',
    visitors: [
      defineVisitor('CallExpression', { fields: ['calleeName'] }, path => {
        if (path.node.calleeName === 'compute') path.replaceWith('compute2()');
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: [duplicate, upgradeCalls] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const checked = compute2() ?? compute2();\n');
});

test('rejects circular source copies', () => {
  const source = 'function loop() { seed(); }\n';
  const selfCopy = defineNativePlugin({
    name: 'self-copy',
    visitors: [
      defineVisitor('Function', { fields: ['bodyStart', 'bodyEnd'] }, path => {
        path.prependToBody(path.getSource());
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [selfCopy] }] }),
      ),
    /circular source copy .*\(owner: self-copy\)/,
  );
});

test('rejects copies whose range is partially overlapped by another edit', () => {
  const source = 'const a = 1; const b = 2;\n';
  const secondDeclaration = source.indexOf('const b');
  const copySecond = defineNativePlugin({
    name: 'copy-second',
    visitors: [
      defineVisitor('VariableDeclaration', {}, path => {
        if (path.start === secondDeclaration) path.insertAfter(path.getSource());
      }),
    ],
  });
  const straddle = defineNativePlugin({
    name: 'straddler',
    visitors: [
      defineVisitor('Program', {}, path => {
        // Replace across the copied declaration's start boundary.
        path.context.editor.update(secondDeclaration - 2, secondDeclaration + 5, 'X');
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [copySecond, straddle] }] }),
      ),
    /partially overlaps .*\(owners: copy-second, straddler\)/,
  );
});

test('degrades cross-phase fragments to text', () => {
  const source = 'const first = 1;\nconst second = target();\n';
  const capture = defineNativePlugin({
    name: 'capture-fragment',
    contract: { metadata: { writes: ['captured'] } },
    visitors: [
      defineVisitor('CallExpression', { fields: ['calleeName'] }, (path, _state) => {
        if (path.node.calleeName === 'target') {
          path.context.metadata.set('captured', path.getSource());
          path.replaceWith('renamed()');
        }
      }),
    ],
  });
  const reuse = defineNativePlugin({
    name: 'reuse-fragment',
    visitors: [
      defineVisitor(
        'Identifier',
        { fields: ['name'], where: { name: { oneOf: ['first'] } } },
        path => {
          const captured = path.context.metadata.get('captured') as SourceFragment | undefined;
          if (captured) path.replaceWith(captured);
        },
      ),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'one', plugins: [capture] },
        { name: 'two', requiresPrintedInput: true, plugins: [reuse] },
      ],
    }),
    {},
  );
  assert.equal(result.status, 'complete');
  // The stale copy carries phase-one text; the live phase-one range was edited.
  assert.ok(result.code.includes('const target() = 1;'));
  assert.ok(result.code.includes('renamed()'));
});

test('ensureHelper inserts each key once at the end of the directive prologue', () => {
  const source = "#!/usr/bin/env node\n'use strict';\nconst value = compute();\n";
  const first = defineNativePlugin({
    name: 'first-ensurer',
    pre(context) {
      context.ensureHelper('shared/flag', 'var __flag = true;');
      context.ensureHelper('first/own', 'var __first = 1;');
    },
  });
  const second = defineNativePlugin({
    name: 'second-ensurer',
    pre(context) {
      context.ensureHelper('shared/flag', 'var __flag = true;');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'one', plugins: [first, second] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(
    result.code,
    "#!/usr/bin/env node\n'use strict';\nvar __flag = true;\nvar __first = 1;\nconst value = compute();\n",
  );
});

test('ensureHelper re-ensures are no-ops in later phases', () => {
  const source = 'const value = 1;\n';
  const ensurer = (name: string) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureHelper('shared/flag', 'var __flag = true;');
      },
    });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'one', plugins: [ensurer('one-ensurer')] },
        { name: 'two', requiresPrintedInput: true, plugins: [ensurer('two-ensurer')] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'var __flag = true;\nconst value = 1;\n');
});

test('ensureHelper conflicts loudly when one key realizes different content', () => {
  const source = 'const value = 1;\n';
  const ensurer = (name: string, content: string) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureHelper('shared/flag', content);
      },
    });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'one',
              plugins: [
                ensurer('owner-a', 'var __flag = 1;'),
                ensurer('owner-b', 'var __flag = 2;'),
              ],
            },
          ],
        }),
      ),
    /helper shared\/flag .*owner-b.*owner-a/,
  );
});

test('collapses byte-identical convergent edits to the first owner', () => {
  const source = 'const value = compute();\n';
  const upgrade = (name: string) =>
    defineNativePlugin({
      name,
      visitors: [
        defineVisitor('CallExpression', { fields: ['calleeName'] }, path => {
          if (path.node.calleeName === 'compute') path.replaceWith('compute2()');
        }),
      ],
    });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'transform', plugins: [upgrade('first-upgrade'), upgrade('second-upgrade')] },
      ],
    }),
    {},
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = compute2();\n');
});

test('still rejects convergent edits whose content differs', () => {
  const source = 'const value = compute();\n';
  const upgrade = (name: string, replacement: string) =>
    defineNativePlugin({
      name,
      visitors: [
        defineVisitor('CallExpression', { fields: ['calleeName'] }, path => {
          if (path.node.calleeName === 'compute') path.replaceWith(replacement);
        }),
      ],
    });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'transform',
              plugins: [
                upgrade('first-upgrade', 'compute2()'),
                upgrade('second-upgrade', 'compute3()'),
              ],
            },
          ],
        }),
      ),
    /owners: first-upgrade, second-upgrade/,
  );
});

test('sourceSlice returns a provenance-carrying fragment', () => {
  const source = 'const value = compute();\n';
  const guard = defineNativePlugin({
    name: 'guard-calls',
    visitors: [
      defineVisitor('CallExpression', { fields: ['calleeName'] }, path => {
        const slice = path.context.sourceSlice(path.start, path.end);
        assert.throws(() => `${slice}`, /carries provenance/);
        assert.throws(() => path.context.sourceSlice(path.start, source.length + 1));
        path.replaceWith(path.context.code.template`guard(${slice})`);
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [guard] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = guard(compute());\n');
});

test('repeated copies of one range share a render and reflect inner edits', () => {
  const source = 'function seed() { return compute(); }\nalpha();\nbeta();\n';
  const mirror = defineNativePlugin<{ fragment: SourceFragment | undefined }>({
    name: 'mirror',
    createState: () => ({ fragment: undefined as SourceFragment | undefined }),
    visitors: [
      defineVisitor('Function', {}, (path, state) => {
        state.fragment = path.getSource();
      }),
      defineVisitor('CallExpression', { fields: ['calleeName'] }, (path, state) => {
        if (path.node.calleeName !== 'compute' && state.fragment) {
          path.insertAfter(state.fragment);
        }
      }),
    ],
  });
  const rewrite = defineNativePlugin({
    name: 'rewrite',
    visitors: [
      defineVisitor('CallExpression', { fields: ['calleeName'] }, path => {
        if (path.node.calleeName === 'compute') path.replaceWith('compute2()');
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [mirror, rewrite] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code.match(/compute2\(\)/g)?.length, 3);
  assert.ok(!result.code.includes('compute()'));
});

test('maps copied content back to its original tokens', () => {
  const source = 'function helper() { return VALUE; }\nlater();\n';
  const duplicate = defineNativePlugin({
    name: 'duplicate-helper',
    visitors: [
      defineVisitor('Function', {}, path => {
        path.insertAfter(path.getSource());
      }),
    ],
  });
  const rename = defineNativePlugin({
    name: 'rename-value',
    visitors: [
      defineVisitor(
        'Identifier',
        { fields: ['name'], where: { name: { oneOf: ['VALUE'] } } },
        path => {
          if (path.node.name === 'VALUE')
            path.replaceWith({ code: 'WRAPPED', mapping: 'anchor-start', names: ['VALUE'] });
        },
      ),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [duplicate, rename] }] }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  const copyStart = result.code.indexOf('function helper', 1);
  const innerIdentifier = result.code.indexOf('WRAPPED', copyStart);
  assert.ok(copyStart > 0 && innerIdentifier > copyStart);
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  // The copy's interior maps to the same source tokens as the original.
  assert.deepEqual(originalPositionFor(map, { line: 1, column: copyStart }), {
    source: 'fixture.js',
    line: 1,
    column: 0,
    name: null,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: innerIdentifier }), {
    source: 'fixture.js',
    line: 1,
    column: source.indexOf('VALUE'),
    name: 'VALUE',
  });
});
