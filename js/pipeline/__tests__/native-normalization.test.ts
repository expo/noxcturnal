import { expect, test } from 'vitest';
import {
  composeNativePipeline,
  defineNativePipeline,
  definePipelinePhase,
  pipelineCacheKey,
  transform,
  type PreflightPlan,
} from '../../index';
import { NATIVE_TRANSFORM_NAMES } from '../../preflight/schema';

const builders = {
  inline: (native: PreflightPlan) =>
    defineNativePipeline({ phases: [{ name: 'normalize-audit', native }] }),
  composed: (native: PreflightPlan) =>
    composeNativePipeline([definePipelinePhase({ name: 'normalize-audit', native })]),
};

for (const [name, build] of Object.entries(builders)) {
  test(`${name}: disabled native toggles normalize to the empty pipeline`, () => {
    const empty = defineNativePipeline({ phases: [] });
    for (const disabled of [false, undefined]) {
      const pipeline = build({
        transforms: Object.fromEntries(NATIVE_TRANSFORM_NAMES.map(key => [key, disabled])),
        optimize: { constantFolding: disabled, deadCodeElimination: disabled },
        compact: false,
        comments: true,
      });
      expect(pipeline).toBe(empty);
      expect(pipelineCacheKey(pipeline, 'input.js')).toBe(pipelineCacheKey(empty, 'input.js'));
      const result = transform('const value = 1;', 'input.js', pipeline);
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).toBe('const value = 1;');
    }
  });

  test(`${name}: an active transform survives normalization without disabled neighbors`, () => {
    const active = build({ transforms: { exponentiationOperator: true } });
    for (const disabled of [false, undefined]) {
      const pipeline = build({
        transforms: { exponentiationOperator: true, parameters: disabled },
        optimize: { constantFolding: disabled },
      });
      expect(pipeline).toBe(active);
      expect(pipeline.phases).toHaveLength(1);
      const result = transform('globalThis.result = 2 ** 3;', 'input.js', pipeline);
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).not.toContain('**');
      const context: { result?: number } = {};
      new Function('globalThis', result.code)(context);
      expect(context.result).toBe(8);
    }
  });
}

test('module context distinguishes optimizer cache keys', () => {
  const pipeline = (moduleContext: boolean) =>
    defineNativePipeline({
      phases: [
        {
          name: 'dce',
          native: {
            optimize: { deadCodeElimination: true, moduleContext },
          },
        },
      ],
    });
  expect(pipelineCacheKey(pipeline(true), 'input.js')).not.toBe(
    pipelineCacheKey(pipeline(false), 'input.js'),
  );
});
