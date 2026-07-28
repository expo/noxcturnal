import assert from 'node:assert/strict';
import { describe, test } from 'vitest';

import type { NativeTransformResult, TransformResult } from '../../dist/index.js';
import { defineNativePipeline, registerParserAdapter, transform } from '../../dist/index.js';
import { nativeFlowErasureBuilt } from '../../dist/native/binding.js';

/** Asserts success and narrows, so the assertions below can read `code`. */
function completed(result: TransformResult): NativeTransformResult {
  if (result.status !== 'complete') {
    assert.fail(`expected a complete transform, got ${result.status}: ${result.reason}`);
  }
  return result;
}

// The `flow_parser` feature is off in the default build, so these only mean
// anything against a binary that has it. Skipping rather than asserting the
// fallback keeps the default CI job honest about what it did and did not check.
const withErasure = nativeFlowErasureBuilt() ? describe : describe.skip;

withErasure('native Flow erasure', () => {
  const pipeline = defineNativePipeline({ phases: [] });

  test('erases a Flow file with no adapter registered', () => {
    const result = completed(
      transform(
        '// @flow\nimport type {A} from "./a";\nconst value: number = 1;\n',
        'fixture.js',
        pipeline,
      ),
    );
    assert.equal(result.code, '// @flow\n\nconst value = 1;\n');
  });

  test('keeps the default on a typed parameter', () => {
    // The defect the Expo adapter carries `restoreDefaultedParameters` to
    // repair. Erasure cannot reproduce it: the annotation span lies inside
    // `left` and the default lies outside it.
    const result = completed(
      transform(
        '// @flow\nfunction f(nodes: Array<number> = [], x?: string = "a") { return [nodes, x]; }\n',
        'fixture.js',
        pipeline,
      ),
    );
    assert.match(result.code, /function f\(nodes = \[\], x = "a"\)/);
  });

  test('preserves formatting the Babel printer would have reflowed', () => {
    const source = '// @flow\nconst   x   : number   =   1 ;   // trailing\n';
    const result = completed(transform(source, 'fixture.js', pipeline));
    assert.equal(result.code, '// @flow\nconst   x      =   1 ;   // trailing\n');
  });

  test('falls back to a registered adapter on proposal syntax', () => {
    const unregister = registerParserAdapter({
      name: 'flow-fallback-fixture',
      version: '1.0.0',
      supports: route => route.syntax === 'flow',
      compile: () => ({
        status: 'complete',
        code: '// @flow\nconst fallback = 1;\n',
        map: { mappings: 'AAAA', names: [] },
        syntax: 'js',
        metadata: { adapter: true },
      }),
    });
    try {
      const result = completed(
        transform(
          '// @flow\ncomponent Foo(bar: string) { return null; }\n',
          'fixture.js',
          pipeline,
        ),
      );
      assert.deepEqual(result.metadata.sourceAdapter, { adapter: true });
    } finally {
      unregister();
    }
  });

  test('reports the erase and bail split under debugPerformance', () => {
    const erased = completed(
      transform('// @flow\nconst x: number = 1;\n', 'fixture.js', pipeline, {
        debugPerformance: true,
      }),
    );
    assert.deepEqual(erased.metadata.flowErasure, {
      status: 'erased',
      reason: undefined,
      detail: undefined,
      erasedBytes: 8,
      spanCount: 1,
    });

    // No adapter registered here, so a bail ends as a bailout — which is the
    // case the coverage counter most needs to be able to see.
    const bailed = transform('// @flow\nenum E { A, B }\n', 'fixture.js', pipeline, {
      debugPerformance: true,
    });
    assert.equal(bailed.status, 'bailout');
    assert.equal(
      (bailed.metadata?.flowErasure as { reason?: string } | undefined)?.reason,
      'proposal-syntax',
    );
  });

  test('maps an erased position back to the original source', () => {
    const result = completed(
      transform('// @flow\ntype T = number;\nconst value: T = 1;\n', 'fixture.js', pipeline),
    );
    assert.equal(result.code, '// @flow\n\nconst value = 1;\n');
    assert.ok(result.map, 'an erased file still carries a map');
  });
});
