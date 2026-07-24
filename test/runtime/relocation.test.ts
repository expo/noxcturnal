import assert from 'node:assert/strict';
import { test } from 'vitest';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { Worker } from 'node:worker_threads';

import type { SourceFragment } from '../../dist/index.js';
import {
  classify,
  compilePhasePlan,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  NativeTransformError,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
} from '../../dist/index.js';
import { NativeTransformSession } from '../../dist/runtime/session.js';
import { native } from '../../dist/native/binding.js';
import { packEdits } from '../../dist/protocol/edits.js';
import { decodeRoutedEnvelope } from '../../dist/protocol/events.js';
import { packRouteManifest } from '../../dist/protocol/manifest.js';

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

test('output sections wrap the body: prefix outermost, prologue and body inserts inside', () => {
  const source = "'use strict';\nconst value = compute();\n";
  const wrapper = defineNativePlugin({
    name: 'wrapper',
    pre(context) {
      context.editor.prepend('(function () {\n');
      context.editor.append('})();\n');
    },
  });
  const helper = defineNativePlugin({
    name: 'helper',
    pre(context) {
      context.ensureHelper('helper/flag', 'var __flag = true;');
      context.editor.appendLeft(0, '/* head */');
      context.editor.appendRight(source.length, '/* tail */');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'wrap', plugins: [wrapper, helper] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(
    result.code,
    "(function () {\n/* head */'use strict';\nvar __flag = true;\nconst value = compute();\n/* tail */})();\n",
  );
});

test('relocates a range as piece reordering with contained edits composing', () => {
  const source = 'function util() { return value; }\nconst keep = 1;\n';
  const rangeEnd = source.indexOf('\n') + 1;
  const mover = defineNativePlugin({
    name: 'mover',
    pre(context) {
      context.editor.move(0, rangeEnd, source.length);
    },
  });
  const rename = defineNativePlugin({
    name: 'rename-value',
    visitors: [
      defineVisitor(
        'Identifier',
        { fields: ['name'], where: { name: { oneOf: ['value'] } } },
        path => {
          if (path.node.name === 'value') path.replaceWith('value_');
        },
      ),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, rename] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const keep = 1;\nfunction util() { return value_; }\n');
});

test('path.moveTo relocates a node and endpoint insertions stay behind', () => {
  const source = 'const hoisted = 1;\nconst rest = 2;\n';
  const mover = defineNativePlugin({
    name: 'hoister',
    visitors: [
      defineVisitor('VariableDeclaration', { controlFlow: ['skip'] }, path => {
        if (path.start === 0) {
          path.moveTo(source.length);
          path.skip();
        }
      }),
    ],
  });
  const inserter = defineNativePlugin({
    name: 'inserter',
    pre(context) {
      // Strictly inside the moved range: moves with it.
      context.editor.appendLeft(source.indexOf('= 1'), '/* in */ ');
      // Exactly at the moved range's start boundary: stays behind.
      context.editor.appendLeft(0, '/* behind */');
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, inserter] }] }),
  );
  assert.equal(result.status, 'complete');
  // The node range excludes its trailing newline, which stays behind with the
  // boundary insertion.
  assert.equal(result.code, '/* behind */\nconst rest = 2;\nconst hoisted /* in */ = 1;');
});

test('overlapping relocations fail loudly with both owners', () => {
  const source = 'const a = 1;\nconst b = 2;\nconst c = 3;\n';
  const makeMover = (name: string, start: number, end: number) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.editor.move(start, end, source.length);
      },
    });
  const result = () =>
    transform(
      source,
      'fixture.js',
      defineNativePipeline({
        phases: [
          {
            name: 'transform',
            plugins: [makeMover('first-mover', 0, 26), makeMover('second-mover', 13, 39)],
          },
        ],
      }),
    );
  assert.throws(result, /overlapping moved ranges .*\(owners: first-mover, second-mover\)/);
});

test('relocation into a moved-away range fails loudly', () => {
  const source = 'const a = 1;\nconst b = 2;\nconst c = 3;\n';
  const away = defineNativePlugin({
    name: 'away',
    pre(context) {
      context.editor.move(0, 13, source.length);
    },
  });
  const into = defineNativePlugin({
    name: 'into',
    pre(context) {
      context.editor.move(13, 26, 6);
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [away, into] }] }),
      ),
    /lands inside moved range .*\(owners: into, away\)/,
  );
});

test('replacement covering the moved range and straddling edits fail loudly', () => {
  const source = 'const a = 1;\nconst b = 2;\n';
  const mover = defineNativePlugin({
    name: 'mover',
    pre(context) {
      context.editor.move(0, 13, source.length);
    },
  });
  const coverer = defineNativePlugin({
    name: 'coverer',
    pre(context) {
      context.editor.update(0, 13, 'replaced\n');
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, coverer] }] }),
      ),
    /(conflicts with covering edit|overlapping edits) .*\(owners: mover, coverer\)/,
  );
  const straddler = defineNativePlugin({
    name: 'straddler',
    pre(context) {
      context.editor.update(6, 20, 'straddle');
    },
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, straddler] }] }),
      ),
    /moved range at 0\.\.13 is partially overlapped by edit at 6\.\.20 \(owners: mover, straddler\)/,
  );
});

test('removing and copying the same range is rejected toward move', () => {
  const source = 'function util() { return 1; }\nlater();\n';
  const oldSpelling = defineNativePlugin({
    name: 'old-spelling',
    visitors: [
      defineVisitor('Function', {}, path => {
        path.insertAfter(path.getSource());
        path.remove();
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [oldSpelling] }] }),
      ),
    /copies removed range .*use editor\.move to relocate.*\(owners: old-spelling, old-spelling\)/,
  );
});

test('moved content keeps identity mappings and names to original tokens', () => {
  const source = 'function helper() { return VALUE; }\nlater();\n';
  const rangeEnd = source.indexOf('\n') + 1;
  const mover = defineNativePlugin({
    name: 'mover',
    pre(context) {
      context.editor.move(0, rangeEnd, source.length);
    },
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
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [mover, rename] }] }),
    { sourceMapMode: 'boundary' },
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'later();\nfunction helper() { return WRAPPED; }\n');
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
  assert.deepEqual(
    originalPositionFor(map, { line: 2, column: result.code.split('\n')[1]!.indexOf('WRAPPED') }),
    {
      source: 'fixture.js',
      line: 1,
      column: source.indexOf('VALUE'),
      name: 'VALUE',
    },
  );
});

test('conflict errors carry structured owners for telemetry', () => {
  const first = defineNativePlugin({
    name: 'first-writer',
    pre(context) {
      context.editor.update(0, 5, 'one');
    },
  });
  const second = defineNativePlugin({
    name: 'second-writer',
    pre(context) {
      context.editor.update(3, 8, 'two');
    },
  });
  try {
    transform(
      'const value = 1;',
      'fixture.js',
      defineNativePipeline({ phases: [{ name: 'edit', plugins: [first, second] }] }),
    );
    assert.fail('expected a conflict');
  } catch (error) {
    assert.ok(error instanceof NativeTransformError);
    assert.deepEqual(error.owners, ['first-writer', 'second-writer']);
  }
});

test('ensureReplace claims a range once under a shared intent key', () => {
  const source = "import { polyfill } from 'module';\nuse(polyfill);\n";
  const statementEnd = source.indexOf('\n');
  const makeClaimer = (name: string) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureReplace(
          'shared/module-import',
          0,
          statementEnd,
          "const { polyfill } = require('module');",
        );
      },
    });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'edit', plugins: [makeClaimer('claimer-a'), makeClaimer('claimer-b')] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, "const { polyfill } = require('module');\nuse(polyfill);\n");
});

test('ensureReplace re-ensures are no-ops in later phases', () => {
  const source = 'const value = compute();\n';
  const makePhase = (name: string) => ({
    name,
    ...(name === 'two' ? { observes: 'rendered-source' as const } : {}),
    plugins: [
      defineNativePlugin({
        name: `${name}-claimer`,
        pre(context) {
          context.ensureReplace('shared/value', 6, 11, 'renamed');
        },
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [makePhase('one'), makePhase('two')] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const renamed = compute();\n');
});

test('ensureReplace rejects divergent content and divergent ranges loudly', () => {
  const source = 'const value = compute();\n';
  const claim = (name: string, start: number, end: number, code: string) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureReplace('shared/value', start, end, code);
      },
    });
  try {
    transform(
      source,
      'fixture.js',
      defineNativePipeline({
        phases: [
          {
            name: 'edit',
            plugins: [claim('int-a', 6, 11, 'renamed'), claim('int-b', 6, 11, 'other')],
          },
        ],
      }),
    );
    assert.fail('expected divergent content to conflict');
  } catch (error) {
    assert.ok(error instanceof NativeTransformError);
    assert.match(error.message, /replacement intent shared\/value realized different content/);
    assert.deepEqual(error.owners, ['int-b', 'int-a']);
  }
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'edit',
              plugins: [claim('int-a', 6, 11, 'renamed'), claim('int-b', 6, 12, 'renamed')],
            },
          ],
        }),
      ),
    /replacement intent shared\/value targets 6\.\.12 for int-b but 6\.\.11 for its first registrant int-a/,
  );
});

test('distinct ensureReplace keys on overlapping ranges stay ordinary conflicts', () => {
  const source = 'const value = compute();\n';
  const claim = (name: string, key: string, start: number, end: number) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.ensureReplace(key, start, end, 'x');
      },
    });
  try {
    transform(
      source,
      'fixture.js',
      defineNativePipeline({
        phases: [
          { name: 'edit', plugins: [claim('key-a', 'a', 0, 11), claim('key-b', 'b', 6, 16)] },
        ],
      }),
    );
    assert.fail('expected an overlap conflict');
  } catch (error) {
    assert.ok(error instanceof NativeTransformError);
    assert.match(error.message, /overlapping edits/);
    assert.deepEqual(error.owners, ['key-a', 'key-b']);
  }
});
