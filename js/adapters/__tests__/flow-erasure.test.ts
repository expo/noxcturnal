import assert from 'node:assert/strict';
import { describe, expect, test, vi } from 'vitest';

import type { NativeTransformResult, TransformResult } from '../../index';
import { defineNativePipeline, registerParserAdapter, transform } from '../../index';
import { native, nativeFlowErasureBuilt } from '../../native/binding';

/** Asserts success and narrows, so the assertions below can read `code`. */
function completed(result: TransformResult): NativeTransformResult {
  if (result.status !== 'complete') {
    assert.fail(`expected a complete transform, got ${result.status}: ${result.reason}`);
  }
  return result;
}

// Keep the probe so an explicit `--no-default-features` build can still run the
// rest of the JavaScript suite without pretending it exercised Flow erasure.
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
    expect(result.diagnostics).toEqual([]);
    expect(result.code).toMatchInlineSnapshot(`
      "// @flow

      const value = 1;
      "
    `);
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
    expect(result.code).toMatchInlineSnapshot(`
      "// @flow
      const   x      =   1 ;   // trailing
      "
    `);
  });

  test('uses native record lowering ahead of an automatically selected adapter', () => {
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
        transform('// @flow\nconst value = R { field: 1 };\n', 'fixture.js', pipeline),
      );
      expect(result.metadata.sourceAdapter).toBeUndefined();
      expect(result.code).toContain('new R({ field: 1 })');
    } finally {
      unregister();
    }
  });

  test('retains adapter fallback when native erasure reports a compatibility boundary', () => {
    const erasure = vi.spyOn(native, 'nativeFlowErase').mockReturnValue({
      status: 'bailed',
      reason: 'proposal-syntax',
      detail: 'fixture compatibility boundary',
      erasedBytes: 0,
      spanCount: 0,
    });
    const unregister = registerParserAdapter({
      name: 'flow-compatibility-fixture',
      version: '1.0.0',
      supports: route => route.syntax === 'flow',
      compile: () => ({
        status: 'complete',
        code: 'const fallback = 1;',
        map: { mappings: 'AAAA', names: [] },
        syntax: 'js',
        metadata: { adapter: true },
      }),
    });
    try {
      const result = completed(
        transform('// @flow\nconst value = R { field: 1 };\n', 'fixture.js', pipeline),
      );
      expect(result.metadata.sourceAdapter).toEqual({ adapter: true });
      expect(result.diagnostics).toEqual([]);
    } finally {
      unregister();
      erasure.mockRestore();
    }
  });

  test('maps an erased position back to the original source', () => {
    const result = completed(
      transform('// @flow\ntype T = number;\nconst value: T = 1;\n', 'fixture.js', pipeline),
    );
    assert.equal(result.code, '// @flow\n\nconst value = 1;\n');
    assert.ok(result.map, 'an erased file still carries a map');
  });
});
