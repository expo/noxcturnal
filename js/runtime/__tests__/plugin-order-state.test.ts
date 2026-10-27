import { expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
  type SyntaxFeature,
} from '../../index';

test('compiled plugin positions preserve lifecycle state after syntax filtering and route coalescing', () => {
  const events: string[] = [];
  const plugin = (label: string, syntax?: SyntaxFeature) =>
    defineNativePlugin<string>({
      name: 'shared-name',
      contract: syntax ? { syntax: { anyOf: [syntax] } } : undefined,
      createState: context => `${label}:${context.filename}`,
      pre(context, state) {
        expect(state).toBe(`${label}:${context.filename}`);
        events.push(`pre:${label}`);
      },
      apply(context, analysis, state) {
        expect(analysis).toBeUndefined();
        expect(state).toBe(`${label}:${context.filename}`);
        events.push(`apply:${label}`);
      },
      visitors: [
        defineVisitor(
          'Program',
          {},
          {
            enter(path, state: string) {
              expect(state).toBe(`${label}:${path.context.filename}`);
              events.push(`enter:${label}`);
            },
            exit(path, state: string) {
              expect(state).toBe(`${label}:${path.context.filename}`);
              events.push(`exit:${label}`);
            },
          },
        ),
      ],
      post(context, state) {
        expect(state).toBe(`${label}:${context.filename}`);
        events.push(`post:${label}`);
      },
      cleanup(reason, state) {
        expect(reason).toBe('complete');
        expect(state.startsWith(`${label}:`)).toBe(true);
        events.push(`cleanup:${label}`);
      },
    });
  const pipeline = defineNativePipeline({
    phases: [
      { name: 'scan', plugins: [plugin('first'), plugin('middle', 'Class'), plugin('last')] },
    ],
  });
  for (const [source, filename, labels] of [
    ['0;', 'first.js', ['first', 'last']],
    ['class C {}', 'second.js', ['first', 'middle', 'last']],
    ['1;', 'third.js', ['first', 'last']],
  ] as const) {
    events.length = 0;
    const result = transform(source, filename, pipeline);
    expect(result.status).toBe('complete');
    if (result.status === 'complete') expect(result.code).toBe(source);
    expect(events).toEqual([
      ...labels.map(label => `pre:${label}`),
      ...labels.map(label => `apply:${label}`),
      ...labels.map(label => `enter:${label}`),
      ...[...labels].reverse().map(label => `exit:${label}`),
      ...labels.map(label => `post:${label}`),
      ...labels.map(label => `cleanup:${label}`),
    ]);
  }
});
