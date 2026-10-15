import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test('repeated scope pushes do not rematerialize earlier fragments', () => {
  const count = 1000;
  let reads = 0;
  const plugin = defineNativePlugin({
    name: 'push-many',
    visitors: [
      defineVisitor('Program', { scope: true }, path => {
        path.scope.push('globalThis.result=0');
        for (let i = 0; i < count; i++)
          path.scope.push({
            get code() {
              reads++;
              return 'globalThis.result++';
            },
            mapping: 'sourceless',
          });
      }),
    ],
  });
  const result = transform(
    'globalThis.result;',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'push', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  const context = { result: -1 };
  new Function('globalThis', result.code)(context);
  expect(context.result).toBe(count);
  // Bound materialization work without relying on wall-clock timing.
  expect(reads).toBeLessThanOrEqual(count * 4);
});

test('scope pushes from separate plugins preserve source-copy mappings and order', () => {
  const source = 'globalThis.result=41;';
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'push',
          plugins: [
            defineNativePlugin({
              name: 'copy',
              visitors: [
                defineVisitor('NumericLiteral', { scope: true }, path => {
                  path.scope.push({
                    kind: 'composite',
                    parts: ['var copied=', path.getSource()],
                  });
                }),
              ],
            }),
            defineNativePlugin({
              name: 'use-copy',
              visitors: [
                defineVisitor('NumericLiteral', { scope: true }, path => {
                  path.scope.push('globalThis.copy=copied // trailing comment');
                }),
              ],
            }),
          ],
        },
      ],
    }),
    { sourceMapMode: 'character' },
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  const context = { result: 0, copy: 0 };
  new Function('globalThis', result.code)(context);
  expect(context).toEqual({ result: 41, copy: 41 });
  const prefix = result.code.slice(0, result.code.indexOf('41')).split('\n');
  const position = originalPositionFor(
    new TraceMap({
      version: 3,
      sources: ['input.js'],
      names: result.map.names,
      mappings: result.map.mappings,
    }),
    { line: prefix.length, column: prefix.at(-1)!.length + 1 },
  );
  expect(position).toMatchObject({
    source: 'input.js',
    line: 1,
    column: source.indexOf('41') + 1,
  });
});
