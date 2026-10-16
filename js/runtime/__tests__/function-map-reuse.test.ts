import { afterEach, expect, test, vi } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { native } from '../../native/binding';

afterEach(() => vi.restoreAllMocks());

const observe = (indexed: boolean, skipped = false) =>
  defineNativePlugin({
    name: 'observe',
    contract: skipped ? { syntax: { anyOf: ['AsyncFunction'] } } : undefined,
    visitors: [defineVisitor('Identifier', { fields: ['name'], scope: indexed }, () => {})],
  });
const nativePhase = { name: 'lower', native: { transforms: { parameters: true } } };
const source =
  '#!/usr/bin/env node\nvoid "😀"; function original(value = () => 1) { return value; }';

test.each([
  ['empty', []],
  ['routed visitor', [{ name: 'observe', plugins: [observe(false)] }]],
  ['indexed visitor', [{ name: 'observe', plugins: [observe(true)] }]],
  ['syntax rejected visitor', [{ name: 'observe', plugins: [observe(false, true)] }]],
  ['native', [nativePhase]],
  ['identity native', [{ name: 'identity', native: {} }]],
  ['native then visitor', [nativePhase, { name: 'observe', plugins: [observe(true)] }]],
  ['visitor then native', [{ name: 'observe', plugins: [observe(false)] }, nativePhase]],
] as const)('%s collects from the existing input parse', (_name, phases) => {
  const expected = native.generateFunctionMap(source, 'input.js');
  const standalone = vi.spyOn(native, 'generateFunctionMap').mockImplementation(() => {
    throw new Error('unexpected standalone function-map parse');
  });
  const result = transform(source, 'input.js', defineNativePipeline({ phases }), {
    functionMap: true,
  });
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.functionMap).toEqual(expected);
  expect(standalone).not.toHaveBeenCalled();
});

test('collects before TypeScript language lowering and preserves the map across native phases', () => {
  const input =
    'void "😀"; enum E { Value = 1 } class Original { method(value: number = E.Value) { return value; } }';
  const expected = native.generateFunctionMap(input, 'input.ts');
  const standalone = vi.spyOn(native, 'generateFunctionMap');
  const result = transform(
    input,
    'input.ts',
    defineNativePipeline({
      phases: [
        { name: 'lower', native: { typescript: 'strip', transforms: { parameters: true } } },
        { name: 'compact', native: { compact: true } },
      ],
    }),
    { functionMap: true },
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.functionMap).toEqual(expected);
  expect(result.code).not.toContain('enum E');
  expect(standalone).not.toHaveBeenCalled();
});

test('visitors consume the same parsed owner after collecting a function map exactly once', () => {
  const collect = vi.spyOn(native.NativeParsedSource.prototype, 'functionMap');
  const materialize = vi.spyOn(native.NativeParsedSource.prototype, 'materialize');
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [
        { name: 'one', plugins: [observe(true)] },
        { name: 'two', plugins: [observe(true)] },
      ],
    }),
    { functionMap: true },
  );
  expect(result.status).toBe('complete');
  expect(collect).toHaveBeenCalledTimes(1);
  expect(materialize).toHaveBeenCalledTimes(1);
});

test('does not collect function maps when disabled', () => {
  const collect = vi.spyOn(native.NativeParsedSource.prototype, 'functionMap');
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'observe', plugins: [observe(true, true)] }, nativePhase],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.functionMap).toBeNull();
  expect(collect).not.toHaveBeenCalled();
  expect(
    native.nativePreflightTransform(source, 'input.js', { parameters: true }).functionMap,
  ).toBeUndefined();
});
