import assert from 'node:assert/strict';
import { test } from 'vitest';

import { NativeTransformError } from '../../contracts/visitor';
import type { NativePreflightResultOutput } from '../../native/binding';
import type { Diagnostic } from '../../types';
import { assertNativePhaseCompleted } from '../transform';

const result = (
  status: NativePreflightResultOutput['status'],
  reason?: string,
): NativePreflightResultOutput => ({
  status,
  changed: false,
  normalizedJavascript: false,
  jsx: false,
  reason,
  diagnostics: ['native detail'],
  helpersUsed: [],
});

test('internal native results have exhaustive complete, unsupported, and error dispositions', () => {
  const completeDiagnostics: Diagnostic[] = [];
  assert.doesNotThrow(() =>
    assertNativePhaseCompleted(result('complete'), 'lowering', completeDiagnostics),
  );
  assert.equal(completeDiagnostics[0]?.code, 'native-transform');

  const unsupportedDiagnostics: Diagnostic[] = [];
  assert.throws(
    () =>
      assertNativePhaseCompleted(
        result('unsupported', 'proposal-syntax'),
        'lowering',
        unsupportedDiagnostics,
      ),
    /lowering:proposal-syntax/,
  );
  assert.equal(unsupportedDiagnostics[0]?.code, 'unsupported');

  const fatalDiagnostics: Diagnostic[] = [];
  let error: unknown;
  try {
    assertNativePhaseCompleted(result('error', 'ast-target-missing'), 'lowering', fatalDiagnostics);
  } catch (thrown) {
    error = thrown;
  }
  assert.ok(error instanceof NativeTransformError);
  assert.equal(error.code, 'NOXCTURNAL_TRANSFORM_ERROR');
  assert.equal(error.phase, 'lowering');
  assert.equal(error.reason, 'ast-target-missing');
  assert.equal(error.diagnostics[0]?.code, 'native-transform-error');
});
