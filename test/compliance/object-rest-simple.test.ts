import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { execute } from './runtime';

const require = createRequire(import.meta.url);
for (const mode of ['inline', 'runtime'] as const) {
  test(`flat object rest snapshots its source with ${mode} helpers`, () => {
    const result = execute(
      `
      const events = [];
      const symbol = Symbol('key');
      let input = {
        get a() {
          events.push('a');
          input = { b: 99 };
          return 1;
        },
        b: 2,
        [symbol]: 3,
      };
      const { a, ...rest } = input;

      function read({ x, ...tail }) { return [x, tail.y]; }
      function collide({ x, ...tail }) { var x = 8; return [x, tail.y]; }
      function ordered({ getFirst, ...first }, { getSecond, ...second }) {
        return [getFirst, getSecond, first, second];
      }

      let nullSourceError;
      try { const { value, ...tail } = null; }
      catch (error) { nullSourceError = error.name; }

      let nullTargetCalls = 0;
      function target() { nullTargetCalls++; return {}; }
      try { ({ ...target().rest } = null); } catch (error) {}

      const order = [];
      ordered(
        { get getFirst() { order.push('first'); return 1; } },
        { get getSecond() { order.push('second'); return 2; } },
      );
      globalThis.result = {
        selected: a,
        restValue: rest.b,
        symbolValue: rest[symbol],
        sourceReads: events,
        parameter: read({ x: 4, y: 5 }),
        nullSourceError,
        redeclaredParameter: collide({ x: 4, y: 5 }),
        parameterOrder: order,
        functionLength: read.length,
        nullTargetCalls,
      };
    `,
      {
        transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
        helpers: { mode, version: '7.29.7' },
      },
      { require },
    );
    expect(result.result).toEqual({
      selected: 1,
      restValue: 2,
      symbolValue: 3,
      sourceReads: ['a'],
      parameter: [4, 5],
      nullSourceError: 'TypeError',
      redeclaredParameter: [8, 5],
      parameterOrder: ['first', 'second'],
      functionLength: 1,
      nullTargetCalls: 0,
    });
  });
}

for (const mode of ['inline', 'runtime'] as const) {
  test(`flat object rest assignments keep static-block activations with ${mode} helpers`, () => {
    const result = execute(
      `
      let binding, rest, source;
      const make = () => class {
        static {
          this.original = ({ a: binding, ...rest } = source);
          this.tail = rest.b;
        }
      };
      const inner = { a: 10, b: 20 };
      const outer = {
        get a() {
          source = inner;
          make();
          return 1;
        },
        b: 2,
      };
      source = outer;
      const Value = make();
      globalThis.result = {
        originalSource: Value.original === outer,
        staticTail: Value.tail,
        binding,
        restValue: rest.b,
      };
    `,
      {
        transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
        helpers: { mode, version: '7.29.7' },
      },
      { require },
    );
    expect(result.result).toEqual({
      originalSource: true,
      staticTail: 2,
      binding: 1,
      restValue: 2,
    });
  });
}
