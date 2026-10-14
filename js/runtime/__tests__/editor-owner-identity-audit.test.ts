import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';

const cases = [
  { name: 'different names', sharedName: false, configured: false, separate: false, fails: false },
  { name: 'shared name', sharedName: true, configured: false, separate: false, fails: true },
  {
    name: 'configured definitions',
    sharedName: true,
    configured: true,
    separate: false,
    fails: true,
  },
  { name: 'separate phases', sharedName: true, configured: true, separate: true, fails: false },
];
describe.each(cases)('$name', entry => {
  let actual: unknown;
  beforeAll(() => {
    let changed: boolean | undefined;
    const visits: string[] = [];
    const definition = defineNativePlugin<undefined, { action: 'edit' | 'reset' }>({
      name: 'editor',
      pre(context) {
        visits.push(this.options!.action);
        if (this.options!.action === 'edit') context.editor.update(0, 1, '4');
        else {
          changed = context.editor.hasChanged();
          context.editor.reset(0, 1);
        }
      },
    });
    const first = entry.configured
      ? definition.withOptions({ action: 'edit' })
      : defineNativePlugin({
          name: 'editor',
          pre(context) {
            visits.push('edit');
            context.editor.update(0, 1, '4');
          },
        });
    const second = entry.configured
      ? definition.withOptions({ action: 'reset' })
      : defineNativePlugin({
          name: entry.sharedName ? 'editor' : 'peer',
          pre(context) {
            visits.push('reset');
            changed = context.editor.hasChanged();
            context.editor.reset(0, 1);
          },
        });
    expect(first).not.toBe(second);
    const result = transform(
      '3;',
      'input.js',
      defineNativePipeline({
        phases: entry.separate
          ? [
              { name: 'first', plugins: [first] },
              { name: 'second', plugins: [second] },
            ]
          : [{ name: 'edit', plugins: [first, second] }],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(visits).toEqual(['edit', 'reset']);
    actual = [changed, result.code];
  });
  (entry.fails ? test.fails : test)(
    'reset and hasChanged use the current plugin definition',
    () => {
      expect(actual).toEqual([false, '4;']);
    },
  );
});
