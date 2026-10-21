import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

interface State {
  id: number;
}

function observe(configuration: 'duplicate' | 'distinct' | 'phases') {
  const events: Record<string, number[]> = {
    create: [],
    pre: [],
    analyze: [],
    apply: [],
    visit: [],
    post: [],
    cleanup: [],
  };
  function plugin() {
    return defineNativePlugin<State, undefined, number>({
      name: 'same-name',
      createState() {
        const state = { id: events.create.length + 1 };
        events.create.push(state.id);
        return state;
      },
      pre(_context, state) {
        events.pre.push(state.id);
      },
      analyze(_context, state) {
        events.analyze.push(state.id);
        return { status: 'supported', analysis: state.id };
      },
      apply(_context, analysis, state) {
        expect(analysis).toBe(state.id);
        events.apply.push(state.id);
      },
      visitors: [
        defineVisitor('NumericLiteral', {}, (_path, state: State) => {
          events.visit.push(state.id);
        }),
      ],
      post(_context, state) {
        events.post.push(state.id);
      },
      cleanup(reason, state) {
        expect(reason).toBe('complete');
        events.cleanup.push(state.id);
      },
    });
  }
  const first = plugin();
  const phases =
    configuration === 'phases'
      ? [
          { name: 'first', plugins: [first] },
          { name: 'second', plugins: [first] },
        ]
      : [{ name: 'one', plugins: [first, configuration === 'distinct' ? plugin() : first] }];
  const result = transform('1;', 'input.js', defineNativePipeline({ phases }));
  expect(result.status).toBe('complete');
  return events;
}

test('duplicate plugin instances are rejected before any lifecycle effects', () => {
  expect(() => observe('duplicate')).toThrow(/plugin same-name occurs more than once/);
});

test.each(['distinct', 'phases'] as const)('%s keeps lifecycle states separate', configuration => {
  const events = observe(configuration);
  for (const states of Object.values(events)) expect(states).toEqual([1, 2]);
});
