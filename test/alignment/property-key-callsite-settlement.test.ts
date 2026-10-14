import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'callable conversion result',
    setup: `const key = {[Symbol.toPrimitive]() { return function invalid() {}; }};
      const source = {keep: 2};`,
    helper: 'accepted',
    babel: 'TypeError',
    result: `'accepted'`,
  },
  {
    name: 'callable key conversion hint',
    setup: `const hints = []; function key() {}
      key[Symbol.toPrimitive] = hint => { hints.push(hint); return hint; };
      const source = {string: 1, default: 2};`,
    helper: [2, { string: 1 }, ['default']],
    babel: [1, { string: 1 }, ['string', 'default']],
    result: '[value, rest, hints]',
  },
  {
    name: 'absent conversion hook lookup',
    setup: `const events = []; const key = {
      get [Symbol.toPrimitive]() { events.push('hook'); return undefined; },
      toString() { events.push('string'); return 'value'; }
    }; const source = {value: 1, other: 2};`,
    helper: [1, { other: 2 }, ['hook', 'hook', 'string']],
    babel: [1, { other: 2 }, ['hook', 'string', 'hook', 'hook', 'string']],
    result: '[value, rest, events]',
  },
];
function execute(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(
    `${entry.name}: single conversion uses the pinned helper ABI (%s)`,
    mode => {
      const source = `${entry.setup}
        try { const {[key]: value, ...rest} = source;
          globalThis.result = ${entry.result};
        } catch (error) { globalThis.result = error.name; }`;
      const code = compile(source, {
        transforms: { destructuring: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [
          require('@babel/plugin-transform-destructuring'),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ],
      })!.code!;
      // Compare the actual ABI composition separately: Babel's transform performs
      // an additional native access before converting its exclusion key.
      const direct = `${entry.setup}
        try { const converted = require('@babel/runtime/helpers/toPropertyKey')(key);
          const value = source[converted];
          const rest = require('@babel/runtime/helpers/objectWithoutProperties')(source, [converted]);
          globalThis.result = ${entry.result};
        } catch (error) { globalThis.result = error.name; }`;
      expect(code).not.toMatch(/const\s*\{/);
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
      expect(execute(direct)).toEqual(entry.helper);
      expect(execute(code)).toEqual(entry.helper);
      expect(execute(reference)).toEqual(entry.babel);
    },
  );
}
