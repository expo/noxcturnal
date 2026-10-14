import { beforeAll, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  pipelineCacheKey,
  transform,
  transformClassificationCacheKey,
  type PluginContext,
  type PluginContract,
} from '../../index';

const source = 'first("one"); second("two");';
const filename = 'input.js';
function collect(this: { contract?: PluginContract }, context: PluginContext) {
  const request = this.contract!.queries![0];
  const name = request.calls![0].callee;
  const calls = context.query(request).calls[name];
  context.metadata.set(
    'values',
    calls.map(call => call.staticArgument),
  );
}
const pipelines = ['first', 'second'].map(callee =>
  defineNativePipeline({
    phases: [
      {
        name: 'scan',
        plugins: [
          defineNativePlugin({
            name: 'collect-declared-calls',
            contract: {
              metadata: { writes: ['values'] },
              queries: [{ calls: [{ callee, staticArguments: true }] }],
            },
            post: collect,
          }),
        ],
      },
    ],
  }),
);
let keys: string[];
let classificationKeys: string[];
beforeAll(() => {
  expect(pipelines[0].phases[0].plugins![0].post).toBe(pipelines[1].phases[0].plugins![0].post);
  const results = pipelines.map(pipeline => {
    const result = transform(source, filename, pipeline);
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    return result.metadata.values;
  });
  expect(results).toEqual([['one'], ['two']]);
  keys = pipelines.map(pipeline => pipelineCacheKey(pipeline, filename));
  classificationKeys = pipelines.map(pipeline =>
    transformClassificationCacheKey(pipeline, filename, source),
  );
});
test.fails('pipeline keys distinguish declared plugin queries', () => {
  expect(keys[0]).not.toBe(keys[1]);
});
test.fails('classification keys retain declared plugin query differences', () => {
  expect(classificationKeys[0]).not.toBe(classificationKeys[1]);
});
