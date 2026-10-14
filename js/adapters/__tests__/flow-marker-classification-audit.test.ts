import { beforeAll, describe, expect, test } from 'vitest';
import { classify } from '../../index';
import { classifyForTransform } from '../classification';

const cases = [
  { name: 'string literal', source: 'const marker = "@flow";', syntax: 'js', fails: true },
  { name: 'template literal', source: 'const marker = `@flow`;', syntax: 'js', fails: true },
  { name: 'regexp literal', source: 'const marker = /@flow/;', syntax: 'js', fails: true },
  { name: 'ordinary JavaScript', source: 'const marker = "flow";', syntax: 'js', fails: false },
  { name: 'Flow comment', source: '// @flow\nconst marker = 3;', syntax: 'flow', fails: false },
];
describe.each(cases)('$name', entry => {
  let actual: unknown;
  beforeAll(() => {
    // All fixtures parse as JavaScript; only the comment control opts into Flow.
    expect(() => new Function(entry.source)).not.toThrow();
    actual = [
      classify('input.js', entry.source),
      classifyForTransform('input.js', entry.source),
    ].map(result => [result.syntax, result.supported]);
  });
  (entry.fails ? test.fails : test)('recognizes a Flow marker only in a directive context', () => {
    const expected = [entry.syntax, entry.syntax === 'js'];
    expect(actual).toEqual([expected, expected]);
  });
});
