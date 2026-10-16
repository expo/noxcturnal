import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

for (const firstNamed of [false, true]) {
  test.each([false, true])(
    `decoded edit layers retain explicit fragment labels, first=${firstNamed}, second=%s`,
    secondNamed => {
      const phases = [firstNamed, secondNamed].map((named, index) => ({
        name: `edit-${index}`,
        plugins: [
          defineNativePlugin({
            name: `label-${index}`,
            visitors: [
              defineVisitor('NumericLiteral', {}, path =>
                path.replaceWith({
                  code: index === 0 ? '20' : '300',
                  mapping: 'anchor-start',
                  names: named ? [index === 0 ? 'firstLabel' : 'secondLabel'] : [],
                }),
              ),
            ],
          }),
        ],
      }));
      const result = transform('/*🙂*/ 1;', 'input.js', defineNativePipeline({ phases }));
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).toBe('/*🙂*/ 300;');
      expect(
        originalPositionFor(new TraceMap({ version: 3, sources: ['input.js'], ...result.map }), {
          line: 1,
          column: 7,
        }),
      ).toEqual({
        source: 'input.js',
        line: 1,
        column: 7,
        name: secondNamed ? 'secondLabel' : firstNamed ? 'firstLabel' : null,
      });
    },
  );
}

test('decoded layers offset separate name tables while preserving earlier untouched labels', () => {
  const phases = ['first', 'second'].map((label, index) => ({
    name: label,
    plugins: [
      defineNativePlugin({
        name: label,
        visitors: [
          defineVisitor('NumericLiteral', {}, path => {
            if (path.sourceText() === String(index + 1))
              path.replaceWith({
                code: String(index + 10),
                mapping: 'anchor-start',
                names: [label],
              });
          }),
        ],
      }),
    ],
  }));
  const result = transform('1; 2;', 'input.js', defineNativePipeline({ phases }));
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe('10; 11;');
  const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
  expect(originalPositionFor(map, { line: 1, column: 0 })).toEqual({
    source: 'input.js',
    line: 1,
    column: 0,
    name: 'first',
  });
  expect(originalPositionFor(map, { line: 1, column: 4 })).toEqual({
    source: 'input.js',
    line: 1,
    column: 3,
    name: 'second',
  });
});

describe('named identity replacement', () => {
  let actual: ReturnType<typeof originalPositionFor>;
  beforeAll(() => {
    const inner = defineNativePlugin({
      name: 'inner-labels',
      visitors: [
        defineVisitor('NumericLiteral', {}, path =>
          path.replaceWith({
            code: path.sourceText(),
            mapping: 'anchor-start',
            names: [path.sourceText() === '1' ? 'first' : 'second'],
          }),
        ),
      ],
    });
    const outer = defineNativePlugin({
      name: 'identity-label',
      visitors: [
        defineVisitor('Program', {}, path =>
          path.replaceWith({ code: path.sourceText(), mapping: 'identity', names: ['span'] }),
        ),
      ],
    });
    const result = transform(
      '1; 2;',
      'input.js',
      defineNativePipeline({
        phases: [
          { name: 'inner', plugins: [inner] },
          { name: 'outer', plugins: [outer] },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(result.code).toBe('1; 2;');
    const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
    actual = originalPositionFor(map, { line: 1, column: 0 });
    expect(actual).toEqual({ source: 'input.js', line: 1, column: 0, name: 'span' });
    expect(originalPositionFor(map, { line: 1, column: 3 })).toEqual({
      source: 'input.js',
      line: 1,
      column: 3,
      name: 'second',
    });
  });
  test('unchanged identity text preserves its explicitly supplied label', () => {
    expect(actual).toEqual({ source: 'input.js', line: 1, column: 0, name: 'span' });
  });
});

test('three decoded layers handle unequal name tables and repeated strings', () => {
  const assignments: Record<string, string>[] = [
    { '1': 'shared', '4': 'extra' },
    { '2': 'middle' },
    { '3': 'shared' },
  ];
  const phases = assignments.map((labels, index) => ({
    name: `names-${index}`,
    plugins: [
      defineNativePlugin({
        name: `names-${index}`,
        visitors: [
          defineVisitor('NumericLiteral', {}, path => {
            const value = path.sourceText();
            if (labels[value])
              path.replaceWith({
                code: `${value}0`,
                mapping: 'anchor-start',
                names: [labels[value], 'unused'],
              });
          }),
        ],
      }),
    ],
  }));
  const result = transform('1;2;3;4;', 'input.js', defineNativePipeline({ phases }));
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe('10;20;30;40;');
  const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
  for (const [index, name] of ['shared', 'middle', 'shared', 'extra'].entries()) {
    expect(originalPositionFor(map, { line: 1, column: index * 3 })).toEqual({
      source: 'input.js',
      line: 1,
      column: index * 2,
      name,
    });
  }
});
