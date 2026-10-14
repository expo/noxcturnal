import { expect, test } from 'vitest';
import {
  compilePhasePlan,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  pipelineCacheKey,
  transformClassificationCacheKey,
  type NativePipeline,
  type PipelinePhase,
} from '../../index';

function distinct(left: NativePipeline, right: NativePipeline) {
  expect(left).not.toBe(right);
  expect(pipelineCacheKey(left, 'input.js')).not.toBe(pipelineCacheKey(right, 'input.js'));
  expect(transformClassificationCacheKey(left, 'input.js', 'let value = 1;')).not.toBe(
    transformClassificationCacheKey(right, 'input.js', 'let value = 1;'),
  );
}
const pipeline = (...phases: PipelinePhase[]) => defineNativePipeline({ phases });

test('ordered phase descriptors distinguish pipeline and classification cache keys', () => {
  const first = { name: 'first', plugins: [] };
  const second = { name: 'second', plugins: [] };
  distinct(pipeline(first, second), pipeline(second, first));
});

test('ordered plugin descriptors distinguish pipeline and classification cache keys', () => {
  const first = defineNativePlugin({ name: 'first' });
  const second = defineNativePlugin({ name: 'second' });
  const left = pipeline({ name: 'plugins', plugins: [first, second] });
  const right = pipeline({ name: 'plugins', plugins: [second, first] });
  expect(left.phases[0]).not.toBe(right.phases[0]);
  distinct(left, right);
});

test.each(['requiresPrintedInput', 'requiresFreshSemantics', 'requiresRealizedMap'] as const)(
  '%s changes compiled plans and both cache keys',
  flag => {
    const left = pipeline({ name: 'boundary', plugins: [], [flag]: false });
    const right = pipeline({ name: 'boundary', plugins: [], [flag]: true });
    expect(left.phases[0]).not.toBe(right.phases[0]);
    expect(compilePhasePlan(left)[0][flag]).toBe(false);
    expect(compilePhasePlan(right)[0][flag]).toBe(true);
    distinct(left, right);
  },
);

test('active native plan differences remain in both cache keys', () => {
  const left = pipeline({
    name: 'native',
    native: { transforms: { exponentiationOperator: true } },
  });
  const right = pipeline({ name: 'native', native: { transforms: { parameters: true } } });
  expect(left.phases[0]).not.toBe(right.phases[0]);
  distinct(left, right);
});

test.each([false, true])('visitor lifecycle presence distinguishes keys, nested=%s', nested => {
  const make = (exit: boolean) => {
    const visitor = defineVisitor('Identifier', {}, exit ? { exit() {} } : { enter() {} });
    const root = nested ? defineVisitor('Program', { nested: [visitor] }, () => {}) : visitor;
    return pipeline({
      name: 'visitors',
      plugins: [defineNativePlugin({ name: 'same-plugin', visitors: [root] })],
    });
  };
  distinct(make(false), make(true));
});

test('object property insertion order alone preserves both cache keys', () => {
  const make = (options: { alpha: number; beta: number }) =>
    pipeline({ name: 'options', plugins: [defineNativePlugin({ name: 'same-options', options })] });
  const left = make({ alpha: 1, beta: 2 });
  const right = make({ beta: 2, alpha: 1 });
  expect(pipelineCacheKey(left, 'input.js')).toBe(pipelineCacheKey(right, 'input.js'));
  expect(transformClassificationCacheKey(left, 'input.js', '0')).toBe(
    transformClassificationCacheKey(right, 'input.js', '0'),
  );
});
