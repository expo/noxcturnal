import { beforeAll, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  NativeTransformError,
  transform,
} from '../../index';

function cleanupPipeline(firstError: unknown, peerError?: Error) {
  const events: string[] = [];
  const first = defineNativePlugin({
    name: 'first-cleanup',
    pre() {},
    cleanup(reason) {
      events.push(`first:${reason}`);
      throw firstError;
    },
  });
  const peer = defineNativePlugin({
    name: 'peer-cleanup',
    pre() {},
    cleanup(reason) {
      events.push(`peer:${reason}`);
      if (peerError) throw peerError;
    },
  });
  const pipeline = defineNativePipeline({ phases: [{ name: 'cleanup', plugins: [first, peer] }] });
  return { events, pipeline };
}

let undefinedObservation: { events: string[]; failure: unknown };
let nullObservation: { events: string[]; failure: unknown };

function observeCleanup(firstError: unknown, peerError?: Error) {
  const { events, pipeline } = cleanupPipeline(firstError, peerError);
  let failure: unknown;
  try {
    transform('value;', 'fixture.js', pipeline);
  } catch (error) {
    failure = error;
  }
  return { events, failure };
}

beforeAll(() => {
  undefinedObservation = observeCleanup(undefined);
  nullObservation = observeCleanup(null, new Error('later cleanup failure'));
  // Setup and lifecycle assertions cannot satisfy the expected failures below.
  for (const observation of [undefinedObservation, nullObservation]) {
    expect(observation.events).toEqual(['first:complete', 'peer:complete']);
  }
});

test.fails('cleanup throwing undefined remains a fatal transform error', () => {
  expect(undefinedObservation.failure).toBeInstanceOf(NativeTransformError);
  expect((undefinedObservation.failure as NativeTransformError).cause).toBeUndefined();
});

test.fails('cleanup retains a first null exception when a peer also throws', () => {
  expect(nullObservation.failure).toBeInstanceOf(NativeTransformError);
  expect((nullObservation.failure as NativeTransformError).cause).toBeNull();
});

test('cleanup retains an ordinary first exception and still cleans peers', () => {
  const firstError = new Error('first cleanup failure');
  const { events, pipeline } = cleanupPipeline(firstError, new Error('later cleanup failure'));
  let failure: unknown;
  try {
    transform('value;', 'fixture.js', pipeline);
  } catch (error) {
    failure = error;
  }
  expect(events).toEqual(['first:complete', 'peer:complete']);
  expect(failure).toBeInstanceOf(NativeTransformError);
  expect((failure as NativeTransformError).cause).toBe(firstError);
});
