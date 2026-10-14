import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';

const source = 'function read(a=1) { throw new Error("x"); } read();';
const append = {
  name: 'append',
  plugins: [
    defineNativePlugin({
      name: 'append',
      pre(context) {
        context.editor.append('\n/* trailing */');
      },
    }),
  ],
};
function trace(code: string, map: { names: string[]; mappings: string }) {
  const index = code.indexOf('new Error');
  expect(index).toBeGreaterThanOrEqual(0);
  const lines = code.slice(0, index).split('\n');
  return originalPositionFor(new TraceMap({ version: 3, sources: ['input.js'], ...map }), {
    line: lines.length,
    column: lines.at(-1)!.length,
  });
}
const expected = { source: 'input.js', line: 1, column: 27, name: null };
describe.each([false, true])('serialized input-map anchors with compact=%s', compact => {
  let first: ReturnType<typeof trace>;
  let combined: ReturnType<typeof trace>;
  let boundary: ReturnType<typeof trace>;
  let character: ReturnType<typeof trace>;
  beforeAll(() => {
    const lower = { name: 'lower', native: { compact, transforms: { parameters: true } } };
    const initial = transform(source, 'input.js', defineNativePipeline({ phases: [lower] }));
    expect(initial.status).toBe('complete');
    if (initial.status !== 'complete') throw Error('lowering failed');
    expect(initial.code).not.toContain('a=1');
    first = trace(initial.code, initial.map);
    const resident = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [lower, append] }),
      { sourceMapMode: 'boundary' },
    );
    expect(resident.status).toBe('complete');
    if (resident.status !== 'complete') throw Error('resident pipeline failed');
    combined = trace(resident.code, resident.map);
    for (const mode of ['boundary', 'character'] as const) {
      const result = transform(
        initial.code,
        'intermediate.js',
        defineNativePipeline({ phases: [append] }),
        { sourceMapMode: mode, inputSourceMap: initial.map },
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw Error('composition failed');
      expect(result.code).toBe(resident.code);
      const position = trace(result.code, result.map);
      if (mode === 'boundary') boundary = position;
      else character = position;
    }
  });
  test('lowering retains the source anchor', () => expect(first).toEqual(expected));
  test('resident phases retain the source anchor', () => expect(combined).toEqual(expected));
  test('character composition retains the input anchor', () => expect(character).toEqual(expected));
  test.fails('boundary composition retains the input anchor', () =>
    expect(boundary).toEqual(expected));
});
