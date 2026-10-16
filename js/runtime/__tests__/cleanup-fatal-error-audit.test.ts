import { beforeAll, expect, test, vi } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  NativeTransformError,
  transform,
} from '../../index';
import { native } from '../../native/binding';

const cleanupFailure = new Error('cleanup sentinel');
let observed: unknown;
let control: unknown;
beforeAll(() => {
  function observe(failNative: boolean) {
    const reasons: string[] = [];
    const observer = defineNativePlugin({
      name: 'fatal-cleanup-audit',
      pre() {},
      cleanup(reason) {
        reasons.push(`first:${reason}`);
        throw cleanupFailure;
      },
    });
    const peer = defineNativePlugin({
      name: 'cleanup-peer',
      cleanup(reason) {
        reasons.push(`peer:${reason}`);
      },
    });
    const pipeline = defineNativePipeline({
      phases: [
        { name: 'observe', plugins: [observer, peer] },
        { name: 'classes', native: { transforms: { classes: true } } },
      ],
    });
    const prototype = native.NativePipelineSession.prototype as unknown as {
      runNativePhases(options: unknown[]): unknown[];
    };
    const spy = failNative
      ? vi.spyOn(prototype, 'runNativePhases').mockReturnValue([
          {
            status: 'error',
            changed: false,
            normalizedJavascript: false,
            jsx: false,
            reason: 'classes-direct-plan-missing',
            diagnostics: ['planner and application disagreed'],
            helpersUsed: [],
          },
        ])
      : undefined;
    let caught: unknown;
    try {
      transform('const original = 1;', 'input.js', pipeline);
    } catch (error) {
      caught = error;
    } finally {
      spy?.mockRestore();
    }
    expect(reasons).toEqual(
      failNative ? ['first:error', 'peer:error'] : ['first:complete', 'peer:complete'],
    );
    return caught;
  }
  control = observe(false);
  expect(control).toBeInstanceOf(NativeTransformError);
  expect((control as NativeTransformError).cause).toBe(cleanupFailure);
  observed = observe(true);
  expect(observed).toBeInstanceOf(NativeTransformError);
  expect((observed as Error).message).toMatch(/classes-direct-plan-missing/);
  expect((observed as NativeTransformError).diagnostics).toContainEqual(
    expect.objectContaining({ message: 'planner and application disagreed' }),
  );
});

test('cleanup failure after successful native work uses the typed failure contract', () => {
  expect(control).toBeInstanceOf(NativeTransformError);
  expect((control as NativeTransformError).code).toBe('NOXCTURNAL_TRANSFORM_ERROR');
});

test('cleanup failure during fatal native error handling retains a typed transform failure', () => {
  expect(observed).toBeInstanceOf(NativeTransformError);
  expect((observed as NativeTransformError).code).toBe('NOXCTURNAL_TRANSFORM_ERROR');
});
