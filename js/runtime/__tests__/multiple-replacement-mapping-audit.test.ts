import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

describe.each(['boundary', 'character'] as const)('%s maps', sourceMapMode => {
  describe.each([false, true])('replacement list: %s', multiple => {
    let original: ReturnType<typeof originalPositionFor>;
    beforeAll(() => {
      const plugin = defineNativePlugin({
        name: 'multiple-mapping',
        visitors: [
          defineVisitor('ExpressionStatement', {}, path => {
            const fragment = { code: 'next();', mapping: 'sourceless' as const };
            if (multiple) path.replaceWithMultiple([fragment]);
            else path.replaceWith(fragment);
          }),
        ],
      });
      const result = transform(
        'old();',
        'input.js',
        defineNativePipeline({
          phases: [{ name: 'replace', plugins: [plugin] }],
        }),
        { sourceMapMode },
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      expect(result.code).toBe('next();');
      original = originalPositionFor(
        new TraceMap({ version: 3, sources: ['input.js'], ...result.map }),
        { line: 1, column: 0 },
      );
    });
    test('preserves explicit sourceless fragment mapping', () => {
      expect(original).toEqual({ source: null, line: null, column: null, name: null });
    });
  });
});

test.each(['boundary', 'character'] as const)(
  'mixed replacement policies and labels remain distinct in %s maps',
  sourceMapMode => {
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
                  defineVisitor('ExpressionStatement', {}, path =>
                    path.replaceWithMultiple([
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
      { sourceMapMode },
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toBe('first();\ngenerated();\nlast();');
    const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
    expect(originalPositionFor(map, { line: 1, column: 0 })).toEqual({
      source: 'input.js',
      line: 1,
      column: 0,
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
      column: 0,
      name: 'last',
    });
  },
);

const mixedReplacement = (name: string, first = 'first();') =>
  defineNativePlugin({
    name,
    visitors: [
      defineVisitor('ExpressionStatement', {}, path =>
        path.replaceWithMultiple([
          { code: first, mapping: 'sourceless' },
          { code: 'last();', mapping: 'anchor-start' },
        ]),
      ),
    ],
  });

test.each([false, true])(
  'mixed replacement retains insertion affinity, external edit first=%s',
  externalFirst => {
    const insertion = defineNativePlugin({
      name: 'insert',
      visitors: [
        defineVisitor('ExpressionStatement', {}, path => {
          path.context.editor.appendRight(0, 'prefix();');
        }),
      ],
    });
    const replacement = mixedReplacement('replace');
    const result = transform(
      'old();',
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'order',
            plugins: externalFirst ? [insertion, replacement] : [replacement, insertion],
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toBe('prefix();first();\nlast();');
  },
);

test.each(['remove', 'replace', 'different-prefix'] as const)(
  'mixed replacement conflicts with %s on the original range',
  action => {
    const other =
      action === 'different-prefix'
        ? mixedReplacement('other', 'different();')
        : defineNativePlugin({
            name: 'other',
            visitors: [
              defineVisitor('ExpressionStatement', {}, path => {
                if (action === 'remove') path.remove();
                else path.replaceWith('other();');
              }),
            ],
          });
    expect(() =>
      transform(
        'old();',
        'input.js',
        defineNativePipeline({
          phases: [{ name: 'conflict', plugins: [mixedReplacement('mixed'), other] }],
        }),
      ),
    ).toThrow(/overlapping edits.*owners: mixed, other/);
  },
);

test('identical mixed replacement operations deduplicate as a whole', () => {
  const result = transform(
    'old();',
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'converge', plugins: [mixedReplacement('one'), mixedReplacement('two')] }],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).toBe('first();\nlast();');
});

test('deferred copies include every run of a mixed replacement at the copied boundary', () => {
  const copy = defineNativePlugin({
    name: 'copy',
    visitors: [
      defineVisitor('ExpressionStatement', {}, path => path.insertAfter(path.getSource())),
    ],
  });
  const result = transform(
    'old();',
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'copy', plugins: [mixedReplacement('mixed'), copy] }],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).toBe('first();\nlast();first();\nlast();');
});

test('a moved containing range carries all mixed replacement runs at its boundary', () => {
  const source = 'old(); tail();';
  const move = defineNativePlugin({
    name: 'move',
    pre(context) {
      context.editor.move(0, 7, source.length);
    },
  });
  const mixed = defineNativePlugin({
    name: 'mixed',
    visitors: [
      defineVisitor('ExpressionStatement', {}, path => {
        if (path.start === 0)
          path.replaceWithMultiple([
            { code: 'first();', mapping: 'sourceless' },
            { code: 'last();', mapping: 'anchor-start' },
          ]);
      }),
    ],
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'move', plugins: [move, mixed] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).toBe('tail();first();\nlast(); ');
});

test('a mixed replacement still conflicts with an exact covering move', () => {
  const move = defineNativePlugin({
    name: 'move',
    pre(context) {
      context.editor.move(0, 6, 14);
    },
  });
  expect(() =>
    transform(
      'old(); tail();',
      'input.js',
      defineNativePipeline({
        phases: [{ name: 'move', plugins: [move, mixedReplacement('mixed')] }],
      }),
    ),
  ).toThrow(/moved range.*conflicts with covering edit/);
});
