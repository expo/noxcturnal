import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';

const cases = [
  { name: 'whitespace trim', source: ' \n\t', expected: '' },
  { name: 'convergent replacements', source: '1;', expected: '2;' },
];
describe.each(cases)('$name', entry => {
  let preview: string | undefined;
  let final: string;
  beforeAll(() => {
    let caught: unknown;
    const plugin = defineNativePlugin({
      name: 'preview-dedupe',
      pre(context) {
        if (entry.name === 'whitespace trim') context.editor.trim();
        else {
          context.editor.update(0, 1, '2');
          context.editor.update(0, 1, '2');
        }
        try {
          preview = context.editor.toString();
        } catch (error) {
          caught = error;
        }
      },
    });
    const result = transform(
      entry.source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    final = result.code;
    expect(final).toBe(entry.expected);
    expect(caught).toBeUndefined();
  });
  test('editor preview agrees with the successful final commit', () => {
    expect(preview).toBe(final);
  });
});

test('duplicate zero-width insertions remain repeated in preview and final output', () => {
  let preview: string | undefined;
  const plugin = defineNativePlugin({
    name: 'insertion-repeat',
    pre(context) {
      context.editor.appendLeft(0, '/*x*/');
      context.editor.appendLeft(0, '/*x*/');
      preview = context.editor.toString();
    },
  });
  const result = transform(
    '1;',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'repeat', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe('/*x*//*x*/1;');
  expect(preview).toBe(result.code);
});

test('a conflict surviving dedupe retry identifies the surviving owners', () => {
  const plugins = ['first', 'duplicate', 'conflict'].map((name, index) =>
    defineNativePlugin({
      name,
      pre(context) {
        context.editor.update(0, 1, index === 2 ? '3' : '2');
      },
    }),
  );
  let caught: unknown;
  try {
    transform('1;', 'input.js', defineNativePipeline({ phases: [{ name: 'conflict', plugins }] }));
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(Error);
  expect((caught as Error).message).toMatch(/overlapping edits/);
  expect((caught as { owners: string[] }).owners).toEqual(['first', 'conflict']);
});
