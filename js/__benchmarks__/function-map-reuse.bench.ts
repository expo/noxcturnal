import assert from 'node:assert/strict';
import { bench, describe } from 'vitest';
import { native } from '../native/binding';
import { packRouteManifest } from '../protocol/manifest';

const manifest = packRouteManifest(
  [
    {
      id: 0,
      pluginId: 0,
      nodeType: 'Function',
      side: 'enter',
      order: 0,
      predicates: {},
      payloadFields: ['name'],
    },
  ],
  false,
  false,
);
const samples = { time: 0, iterations: 30, warmupTime: 0, warmupIterations: 5 };

for (const count of [1000, 2000, 4000]) {
  const source = Array.from(
    { length: count },
    (_, i) => `function f${i}(value = () => "😀") { return value; }`,
  ).join('\n');
  const standalone = () => native.generateFunctionMap(source, 'bench.js');
  const separateVisitor = () => ({
    tape: native.materializeRoutedBuffer(source, 'bench.js', manifest),
    map: standalone(),
  });
  const sharedVisitor = () => {
    const parsed = new native.NativeParsedSource(source, 'bench.js');
    try {
      const map = parsed.functionMap();
      return { map, tape: parsed.materializeRouted(manifest) };
    } finally {
      parsed.close();
    }
  };
  const separateNative = () => ({
    result: native.nativePreflightTransform(source, 'bench.js', { parameters: true }),
    map: standalone(),
  });
  const sharedNative = () =>
    native.nativePreflightTransform(source, 'bench.js', {
      parameters: true,
      functionMap: true,
    });
  assert.deepEqual(sharedVisitor(), separateVisitor());
  const before = separateNative();
  const after = sharedNative();
  assert.deepEqual(after.functionMap, before.map);
  const { functionMap: _map, ...result } = after;
  const { functionMap: _absent, ...expected } = before.result;
  assert.deepEqual(result, expected);
  console.log(
    JSON.stringify({
      count,
      sourceBytes: Buffer.byteLength(source),
      functionMapBytes: Buffer.byteLength(JSON.stringify(before.map)),
    }),
  );
  describe(`${count} functions (development addon)`, () => {
    bench('standalone function map', standalone, samples);
    bench('visitor with separate parse', separateVisitor, samples);
    bench('visitor with shared parse', sharedVisitor, samples);
    bench('native with separate parse', separateNative, samples);
    bench('native with shared parse', sharedNative, samples);
  });
}
