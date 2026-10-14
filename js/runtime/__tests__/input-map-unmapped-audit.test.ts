import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { beforeAll, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';

const source = 'first(); second(); third();';
const unmapped = { source: null, line: null, column: null, name: null };
function pipeline(replace: boolean) {
  return defineNativePipeline({
    phases: [
      {
        name: 'edit',
        plugins: [
          defineNativePlugin({
            name: 'edit',
            pre(context) {
              if (replace) context.editor.overwrite(9, 18, 'second();', 'sourceless');
              else context.editor.append('/* end */');
            },
          }),
        ],
      },
    ],
  });
}
function trace(map: { names: string[]; mappings: string }, column: number) {
  return originalPositionFor(new TraceMap({ version: 3, sources: ['input.js'], ...map }), {
    line: 1,
    column,
  });
}
let initial: ReturnType<typeof trace>;
let inner: ReturnType<typeof trace>;
let outer: ReturnType<typeof trace>;
beforeAll(() => {
  const first = transform(source, 'input.js', pipeline(true), { sourceMapMode: 'character' });
  expect(first.status).toBe('complete');
  if (first.status !== 'complete') throw Error('first transform failed');
  expect(first.code).toBe(source);
  initial = trace(first.map, 9);
  const composed = transform(first.code, 'next.js', pipeline(false), {
    sourceMapMode: 'character',
    inputSourceMap: first.map,
  });
  expect(composed.status).toBe('complete');
  if (composed.status !== 'complete') throw Error('inner composition failed');
  inner = trace(composed.map, 9);
  const identity = transform(source, 'input.js', pipeline(false), { sourceMapMode: 'character' });
  expect(identity.status).toBe('complete');
  if (identity.status !== 'complete') throw Error('identity transform failed');
  expect(trace(identity.map, 9)).toMatchObject({ line: 1, column: 9 });
  const replaced = transform(source, 'next.js', pipeline(true), {
    sourceMapMode: 'character',
    inputSourceMap: identity.map,
  });
  expect(replaced.status).toBe('complete');
  if (replaced.status !== 'complete') throw Error('outer composition failed');
  outer = trace(replaced.map, 9);
});
test('sourceless edit initially has no original location', () => expect(initial).toEqual(unmapped));
test.fails('input-map unmapped segment remains unmapped after composition', () =>
  expect(inner).toEqual(unmapped));
test.fails('outer-map unmapped segment remains unmapped after composition', () =>
  expect(outer).toEqual(unmapped));
