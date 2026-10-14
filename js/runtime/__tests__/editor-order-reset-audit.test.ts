import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test.each([0, 2, 4])('all insertion affinities preserve original offset %s', offset => {
  const source = '1;2;';
  const plugin = defineNativePlugin({
    name: 'insert-order',
    pre({ editor }) {
      for (const n of [1, 2]) {
        editor.appendLeft(offset, `/*AL${n}*/`);
        editor.prependLeft(offset, `/*PL${n}*/`);
        editor.appendRight(offset, `/*AR${n}*/`);
        editor.prependRight(offset, `/*PR${n}*/`);
      }
      expect(editor.slice(offset)).toBe(source.slice(offset));
    },
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'insert', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe(
    source.slice(0, offset) +
      '/*PL2*//*PL1*//*AL1*//*AL2*//*PR2*//*PR1*//*AR1*//*AR2*/' +
      source.slice(offset),
  );
});

test('reset removes only fully contained edits owned by the calling plugin', () => {
  const owner = defineNativePlugin({
    name: 'reset-owner',
    pre({ editor }) {
      editor.update(0, 2, 'XX');
      editor.update(3, 4, 'z');
    },
    post({ editor }) {
      editor.reset(1, 6);
      expect(editor.hasChanged()).toBe(true);
    },
  });
  const peer = defineNativePlugin({
    name: 'reset-peer',
    pre({ editor }) {
      editor.update(5, 6, 'Q');
    },
  });
  const result = transform(
    'abcd;ef;',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'reset', plugins: [owner, peer] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe('XXcd;Qf;');
});

test('independent source-preserving wrappers retain both inserted suffixes', () => {
  const plugins = ['first-copy', 'second-copy'].map(name =>
    defineNativePlugin({
      name,
      visitors: [
        defineVisitor('NumericLiteral', {}, path =>
          path.replaceWith(path.context.code.template`${path.getSource()} + 0`),
        ),
      ],
    }),
  );
  const result = transform(
    '1;',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'copy', plugins }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe('1 + 0 + 0;');
});

test.each(['mapping', 'names'] as const)(
  'same replacement text with different %s does not converge',
  difference => {
    const plugins = ['first', 'second'].map((name, index) =>
      defineNativePlugin({
        name,
        visitors: [
          defineVisitor('NumericLiteral', {}, path =>
            path.replaceWith({
              code: '2',
              mapping: difference === 'mapping' && index === 1 ? 'sourceless' : 'anchor-start',
              names: difference === 'names' ? [name] : [],
            }),
          ),
        ],
      }),
    );
    let caught: unknown;
    try {
      transform(
        '1;',
        'input.js',
        defineNativePipeline({ phases: [{ name: 'distinct', plugins }] }),
      );
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toMatch(/overlapping edits/);
    expect((caught as { owners: string[] }).owners).toEqual(['first', 'second']);
  },
);

test('identical copies of another source range converge across plugins', () => {
  const plugins = ['first-copy', 'second-copy'].map(name =>
    defineNativePlugin({
      name,
      visitors: [
        defineVisitor('NumericLiteral', {}, path => {
          if (path.sourceText() === '1') path.replaceWith(path.context.sourceSlice(2, 3));
        }),
      ],
    }),
  );
  const result = transform(
    '1;2;',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'copy', plugins }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe('2;2;');
});
