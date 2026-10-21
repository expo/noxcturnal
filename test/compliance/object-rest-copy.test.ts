import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { execute } from './runtime';

const require = createRequire(import.meta.url);
for (const helpers of [
  { mode: 'inline' },
  { mode: 'runtime', version: '7.29.7' },
  { mode: 'runtime', version: '8.0.0' },
] as const) {
  for (const assignment of [false, true]) {
    test(`empty object rest copies one key snapshot: ${helpers.mode} ${'version' in helpers ? helpers.version : ''}, assignment=${assignment}`, () => {
      const source = `
        const events = [];
        const late = Symbol('late');
        const input = new Proxy({
          get a() {
            input[late] = 3;
            Object.defineProperty(input, 'b', { enumerable: false });
            return 1;
          },
          b: 2,
        }, {
          ownKeys(target) {
            events.push('keys');
            return Reflect.ownKeys(target);
          },
        });
        ${assignment ? 'let rest;({...rest}=input);' : 'const {...rest}=input;'}
        globalThis.result = {
          copiedValue: rest.a,
          copiedNonEnumerable: Object.hasOwn(rest, 'b'),
          copiedLateSymbol: Object.hasOwn(rest, late),
          events,
        };
      `;
      const result = execute(
        source,
        {
          transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
          helpers,
        },
        { require },
      );
      expect(result.result).toEqual({
        copiedValue: 1,
        copiedNonEnumerable: false,
        copiedLateSymbol: false,
        events: ['keys'],
      });
    });
  }
}
