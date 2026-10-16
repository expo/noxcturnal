import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';

describe.each(['__proto__', 'constructor', 'ordinary'])('dictionary key %s', name => {
  let globals: Record<string, unknown>;
  let metadata: Record<string, unknown>;
  let readback: unknown;
  beforeAll(() => {
    const session = new NativeTransformSession(
      `${name};`,
      'input.js',
      {},
      packRouteManifest([], false, false, (1 << 6) - 1),
    );
    try {
      const result = session.query({ globals: [{ name, references: true }] });
      expect(result.globals[name]!.references).toHaveLength(1);
      globals = result.globals;
    } finally {
      session.close();
    }
    const plugin = defineNativePlugin({
      name: 'metadata-key-audit',
      contract: { metadata: { writes: [name] } },
      pre(context) {
        context.metadata.set(name, 3);
        readback = context.metadata.get(name);
      },
    });
    const result = transform(
      '0;',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'metadata', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    metadata = result.metadata;
  });
  const check = name === '__proto__' ? test.fails : test;
  check('global facts are enumerable own entries', () => {
    expect(Object.keys(globals)).toEqual([name]);
    expect(Object.hasOwn(globals, name)).toBe(true);
  });
  test('metadata preserves a declared numeric value', () => {
    expect(readback).toBe(3);
    expect(Object.hasOwn(metadata, name)).toBe(true);
    expect(JSON.parse(JSON.stringify(metadata))[name]).toBe(3);
  });
});
