import { afterEach, expect, test, vi } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  registerParserAdapter,
  transform,
  TransformSyntaxError,
} from '../../index';
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

test('keeps the input map through visitor edits and a later native batch', () => {
  const expected = native.generateFunctionMap(source, 'input.js');
  const rename = defineNativePlugin({
    name: 'rename',
    visitors: [
      defineVisitor('Identifier', { fields: ['name'] }, path => {
        if (path.node.name === 'original') path.replaceWith('renamed');
      }),
    ],
  });
  const pipeline = defineNativePipeline({
    phases: [
      { name: 'edit', plugins: [rename] },
      nativePhase,
      { name: 'observe', plugins: [observe(true)] },
    ],
  });
  const withoutMap = transform(source, 'input.js', pipeline);
  const collect = vi.spyOn(native.NativeParsedSource.prototype, 'functionMap');
  const nativeBatch = vi.spyOn(native.NativePipelineSession.prototype, 'runNativePhases');
  const result = transform(source, 'input.js', pipeline, { functionMap: true });
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toContain('function renamed(');
  expect(result.functionMap).toEqual(expected);
  expect({ ...result, functionMap: null }).toEqual(withoutMap);
  expect(collect).toHaveBeenCalledTimes(1);
  expect(nativeBatch).toHaveBeenCalledTimes(1);
  expect(nativeBatch.mock.calls[0][0]).toEqual([expect.objectContaining({ functionMap: false })]);
});

test.each([
  ['visitor', [{ name: 'observe', plugins: [observe(false)] }]],
  ['native', [{ name: 'jsx', native: { jsx: 'automatic' } }]],
] as const)('%s collects from the adapter output with its declared grammar', (_name, phases) => {
  const adapted = '// @flow\nvoid "😀"; const view = <View>{() => 1}</View>;';
  const expected = native.generateFunctionMap(adapted, 'input.jsx');
  const unregister = registerParserAdapter({
    name: 'function-map-adapter',
    version: '1',
    supports: () => true,
    compile: () => ({
      status: 'complete',
      syntax: 'jsx',
      code: adapted,
      map: { mappings: 'AAAA', names: [] },
    }),
  });
  try {
    const standalone = vi.spyOn(native, 'generateFunctionMap');
    const result = transform('adapter input', 'input.custom', defineNativePipeline({ phases }), {
      parserAdapter: 'function-map-adapter',
      functionMap: true,
    });
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(result.functionMap).toEqual(expected);
    expect(standalone).not.toHaveBeenCalled();
  } finally {
    unregister();
  }
});

test.each([
  ['empty', []],
  ['syntax rejected visitor', [{ name: 'observe', plugins: [observe(false, true)] }]],
  ['native', [nativePhase]],
] as const)('%s still throws for invalid input when collecting maps', (_name, phases) => {
  const pipeline = defineNativePipeline({ phases });
  for (const input of ['function broken(', 'let duplicate; let duplicate;']) {
    expect(() => transform(input, 'input.js', pipeline, { functionMap: true })).toThrow(
      TransformSyntaxError,
    );
  }
});

test('a native compatibility bailout discards collected maps and returns pristine input', () => {
  const input = 'namespace N { export let value = 1; }';
  const result = transform(
    input,
    'input.ts',
    defineNativePipeline({ phases: [{ name: 'ts', native: { typescript: 'strip' } }] }),
    { functionMap: true },
  );
  expect(result).toMatchObject({
    status: 'bailout',
    source: input,
    reason: 'ts:mutable-namespace-export',
  });
  expect(result).not.toHaveProperty('functionMap');
  expect(
    native.nativePreflightTransform(input, 'input.ts', { typescript: 'strip', functionMap: true })
      .functionMap,
  ).toBeUndefined();
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
