import { beforeAll, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  pipelineCacheKey,
  transform,
  transformClassificationCacheKey,
  type PluginContext,
} from '../../index';

const source = 'globalThis.result = "input";';
const filename = 'input.js';
function emit(this: { options?: { value: number } }, context: PluginContext) {
  const sign = Object.is(this.options!.value, -0) ? 'negative' : 'positive';
  context.editor.update(0, context.source.length, `globalThis.result = "${sign}";`);
}
const plugin = defineNativePlugin({
  name: 'signed-zero-option',
  options: { value: 0 },
  pre: emit,
});
const pipelines = [0, -0].map(value =>
  defineNativePipeline({
    phases: [{ name: 'emit', plugins: [plugin.withOptions({ value })] }],
  }),
);
let keys: string[];
let classificationKeys: string[];
beforeAll(() => {
  const results = pipelines.map(pipeline => {
    const result = transform(source, filename, pipeline);
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    return result.code;
  });
  expect(results).toEqual(['globalThis.result = "positive";', 'globalThis.result = "negative";']);
  expect(pipelines[0].phases[0].plugins![0].pre).toBe(pipelines[1].phases[0].plugins![0].pre);
  keys = pipelines.map(pipeline => pipelineCacheKey(pipeline, filename));
  classificationKeys = pipelines.map(pipeline =>
    transformClassificationCacheKey(pipeline, filename, source),
  );
});

test.fails('pipeline cache keys distinguish signed zero plugin options', () => {
  expect(keys[0]).not.toBe(keys[1]);
});

test.fails('classification cache keys distinguish signed zero plugin options', () => {
  expect(classificationKeys[0]).not.toBe(classificationKeys[1]);
});
