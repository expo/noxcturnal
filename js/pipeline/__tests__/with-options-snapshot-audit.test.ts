import { beforeAll, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  transform,
  type PluginContext,
} from '../../index';
function original(this: { options?: { tag: string } }, context: PluginContext) {
  context.editor.update(0, context.source.length, JSON.stringify(`original:${this.options!.tag}`));
}
function replacement(this: { options?: { tag: string } }, context: PluginContext) {
  context.editor.update(
    0,
    context.source.length,
    JSON.stringify(`replacement:${this.options!.tag}`),
  );
}
let actual: string;
beforeAll(() => {
  const input = { name: 'snapshot-options-audit', options: { tag: 'base' }, pre: original };
  const defined = defineNativePlugin(input);
  expect(Object.isFrozen(defined)).toBe(true);
  input.pre = replacement;
  expect(defined.pre).toBe(original);
  const rebound = defined.withOptions({ tag: 'bound' });
  function run(plugin: typeof defined) {
    const pipeline = defineNativePipeline({ phases: [{ name: 'emit', plugins: [plugin] }] });
    const result = transform('0', 'input.js', pipeline);
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    return result.code;
  }
  expect(run(defined)).toBe('"original:base"');
  expect(rebound.pre).toBe(replacement);
  actual = run(rebound);
  expect(actual).toBe('"replacement:bound"');
});
test.fails('withOptions preserves the frozen definition callbacks', () => {
  expect(actual).toBe('"original:bound"');
});
