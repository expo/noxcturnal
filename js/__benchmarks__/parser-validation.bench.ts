import { bench, describe } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../index';

const source = Array.from(
  { length: 100 },
  (_, i) => `function f${i}(value) { const local = value + ${i}; return local; }`,
).join('\n');

const pipelines = {
  identity: defineNativePipeline({ phases: [] }),
  visitor: defineNativePipeline({
    phases: [
      {
        name: 'visit',
        plugins: [
          defineNativePlugin({
            name: 'visit',
            visitors: [defineVisitor('Program', {}, () => {})],
          }),
        ],
      },
    ],
  }),
  scope: defineNativePipeline({
    phases: [
      {
        name: 'scope',
        plugins: [
          defineNativePlugin({
            name: 'scope',
            visitors: [defineVisitor('Program', { scope: true }, () => {})],
          }),
        ],
      },
    ],
  }),
  optimize: defineNativePipeline({
    phases: [{ name: 'optimize', native: { optimize: { constantFolding: true } } }],
  }),
  parameters: defineNativePipeline({
    phases: [{ name: 'parameters', native: { transforms: { parameters: true } } }],
  }),
};

describe('100 functions: validation by execution route', () => {
  for (const [name, pipeline] of Object.entries(pipelines)) {
    bench(name, () => {
      transform(source, 'bench.js', pipeline);
    });
  }
});
