import assert from 'node:assert/strict';
import { bench, describe } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../index';

for (const count of [250, 500, 1000]) {
  for (const matches of ['none', 'sparse', 'dense'] as const) {
    const source = Array.from({ length: count }, (_, index) => {
      const modifier = matches === 'dense' || (matches === 'sparse' && index === 0) ? 'async ' : '';
      return `${modifier}function f${index}(value){return value + "async class super";}`;
    }).join('\n');
    const pipeline = (early: boolean) =>
      defineNativePipeline({
        phases: [
          {
            name: 'repair',
            plugins: [
              defineNativePlugin({
                name: 'repair',
                contract: early ? { syntax: { anyOf: ['AsyncFunction'] } } : undefined,
                analyze: () =>
                  matches === 'none'
                    ? { status: 'irrelevant' }
                    : { status: 'supported', analysis: undefined },
                visitors: [
                  defineVisitor(
                    'Identifier',
                    { fields: ['name', 'global'], scope: true },
                    () => {},
                  ),
                  defineVisitor(
                    'Function',
                    { children: { params: { route: 'FormalParameter' } } },
                    () => {},
                  ),
                ],
              }),
            ],
          },
        ],
      });
    const late = pipeline(false);
    const early = pipeline(true);
    assert.deepEqual(transform(source, 'bench.js', early), transform(source, 'bench.js', late));
    describe(`${count} functions, ${matches} async matches`, () => {
      bench('late analysis', () => transform(source, 'bench.js', late));
      bench('syntax requirement', () => transform(source, 'bench.js', early));
    });
  }
}
