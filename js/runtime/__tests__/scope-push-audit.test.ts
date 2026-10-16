import { transformSync, type NodePath } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const cases = [
  {
    name: 'function with body field',
    source: 'function action(){return ++injected}globalThis.result=[action(),action()];',
    field: true,
  },
  {
    name: 'function without body field',
    source: 'function action(){return ++injected}globalThis.result=[action(),action()];',
    field: false,
  },
  {
    name: 'block arrow',
    source: 'const action=()=>{return ++injected};globalThis.result=[action(),action()];',
    field: true,
  },
  {
    name: 'concise arrow',
    source: 'const action=()=>++injected;globalThis.result=[action(),action()];',
    field: true,
  },
];
describe.each(cases)('$name', entry => {
  let code: string, babel: string;
  beforeAll(() => {
    babel = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      plugins: [
        () => ({
          visitor: {
            Function(path: NodePath) {
              path.scope.push({
                id: { type: 'Identifier', name: 'injected' },
                init: { type: 'NumericLiteral', value: 0 },
              });
            },
          },
        }),
      ],
    })!.code!;

    const plugin = defineNativePlugin({
      name: 'push-audit',
      visitors: [
        defineVisitor(
          'Function',
          entry.field ? { fields: ['bodyStart'], scope: true } : { scope: true },
          path => {
            path.scope.push('var injected=0;');
          },
        ),
      ],
    });
    const result = transform(
      entry.source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'push', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    code = result.code;
  });
  const run = (source: string) => {
    const context: Record<string, unknown> = {};
    new Function('globalThis', source)(context);
    return context.result;
  };
  test('Babel scope insertion control', () => expect(run(babel)).toEqual([1, 1]));
  const fails = !entry.field || entry.name === 'concise arrow';
  (fails ? test : test)('insertion creates per-call local state', () =>
    expect(run(code)).toEqual([1, 1]),
  );
});

describe.each(['', '#!/usr/bin/env node\n', '#!/usr/bin/env node\n"use strict";\n'])(
  'program prefix %j',
  prefix => {
    let code: string;
    beforeAll(() => {
      const plugin = defineNativePlugin({
        name: 'program-push-audit',
        visitors: [
          defineVisitor('Program', { scope: true }, path => path.scope.push('var injected=0;')),
        ],
      });
      const result = transform(
        `${prefix}export const result=injected;`,
        'input.mjs',
        defineNativePipeline({ phases: [{ name: 'push', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      code = result.code;
    });
    (prefix === '#!/usr/bin/env node\n' ? test : test)(
      'insertion preserves module parseability and value',
      async () => {
        const module = await import(
          `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${crypto.randomUUID()}`
        );
        expect(module.result).toBe(0);
      },
    );
  },
);
