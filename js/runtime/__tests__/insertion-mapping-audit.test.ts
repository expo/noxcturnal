import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  { action: 'insertBefore', mapping: 'anchor-start' },
  { action: 'insertAfter', mapping: 'anchor-start' },
  { action: 'insertBefore', mapping: 'sourceless' },
  { action: 'insertAfter', mapping: 'sourceless' },
  { action: 'replaceWith', mapping: 'anchor-start' },
] as const;
describe.each(cases)('$action with $mapping', entry => {
  let original: ReturnType<typeof originalPositionFor>;
  beforeAll(() => {
    const plugin = defineNativePlugin({
      name: 'insertion-mapping',
      visitors: [
        defineVisitor('ExpressionStatement', {}, path => {
          path[entry.action]({ code: 'next();', mapping: entry.mapping });
        }),
      ],
    });
    const result = transform(
      'old();',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'insert', plugins: [plugin] }] }),
      { sourceMapMode: 'character' },
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    const column = result.code.indexOf('next');
    expect(column).toBe(entry.action === 'insertAfter' ? 6 : 0);
    original = originalPositionFor(
      new TraceMap({ version: 3, sources: ['input.js'], ...result.map }),
      { line: 1, column },
    );
  });
  test('honors the fragment mapping policy', () => {
    expect(original).toMatchObject(
      entry.mapping === 'sourceless'
        ? { source: null, line: null, column: null }
        : { source: 'input.js', line: 1, column: entry.action === 'insertAfter' ? 6 : 0 },
    );
  });
});

test.each(['unshiftContainer', 'pushContainer'] as const)(
  '%s preserves each insertion fragment policy and name',
  action => {
    const result = transform(
      'old();',
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'mixed',
            plugins: [
              defineNativePlugin({
                name: 'mixed',
                visitors: [
                  defineVisitor('Program', {}, path =>
                    path[action]('body', [
                      { code: 'first();', mapping: 'anchor-start', names: ['first'] },
                      { code: 'generated();', mapping: 'sourceless' },
                      { code: 'last();', mapping: 'anchor-start', names: ['last'] },
                    ]),
                  ),
                ],
              }),
            ],
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toBe(
      action === 'unshiftContainer'
        ? 'first();\ngenerated();\nlast();old();'
        : 'old();first();\ngenerated();\nlast();',
    );
    const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
    const anchor = action === 'unshiftContainer' ? 0 : 6;
    expect(originalPositionFor(map, { line: 1, column: anchor })).toEqual({
      source: 'input.js',
      line: 1,
      column: anchor,
      name: 'first',
    });
    expect(originalPositionFor(map, { line: 2, column: 0 })).toEqual({
      source: null,
      line: null,
      column: null,
      name: null,
    });
    expect(originalPositionFor(map, { line: 3, column: 0 })).toEqual({
      source: 'input.js',
      line: 1,
      column: anchor,
      name: 'last',
    });
  },
);

test('composite insertion preserves deferred source provenance and same-phase named edits', () => {
  const result = transform(
    'old();',
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'copy',
          plugins: [
            defineNativePlugin({
              name: 'copy',
              visitors: [
                defineVisitor('ExpressionStatement', {}, path =>
                  path.insertAfter(path.context.code.template`\n${path.getSource()}`),
                ),
                defineVisitor('CallExpression', {}, path =>
                  path.replaceWith({ code: 'updated()', mapping: 'anchor-start', names: ['call'] }),
                ),
              ],
            }),
          ],
        },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).toBe('updated();\nupdated();');
  const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
  for (const line of [1, 2])
    expect(originalPositionFor(map, { line, column: 0 })).toEqual({
      source: 'input.js',
      line: 1,
      column: 0,
      name: 'call',
    });
});
