import { beforeAll, describe, expect, test } from 'vitest';
import type { EditCommand } from '../../types';
import { createEditor } from '../editor';

const cases = [
  { name: 'empty Unicode matches', source: '😀', expression: /(?:)/gu },
  { name: 'Unicode lookahead matches', source: '😀x', expression: /(?=.)/gu },
];

describe.each(cases)('$name', ({ source, expression }) => {
  let offsets: number[];
  let expected: number[];
  let stopped: boolean;
  beforeAll(() => {
    expected = [];
    source.replaceAll(expression, (_match, offset: number) => {
      expected.push(offset);
      return '_';
    });
    const edits: EditCommand[] = [];
    let order = 0;
    const editor = createEditor(
      { source, commit: () => ({ code: source }) },
      edits,
      'unicode-progress',
      () => order++,
    );
    let calls = 0;
    const sentinel = new Error('replacement failed to make progress');
    stopped = false;
    try {
      editor.replaceAll(expression, () => {
        // Bound the probe: the defect must not hang the test worker.
        if (++calls > expected.length + 1) throw sentinel;
        return '_';
      });
    } catch (error) {
      if (error !== sentinel) throw error;
      stopped = true;
    }
    offsets = edits.map(edit => edit.start);
  });

  test.fails('replacement advances across a complete Unicode code point', () => {
    expect({ stopped, offsets }).toEqual({ stopped: false, offsets: expected });
  });
});

test('non-Unicode empty replacements advance by code units', () => {
  const source = '😀';
  const edits: EditCommand[] = [];
  let order = 0;
  const editor = createEditor(
    { source, commit: () => ({ code: source }) },
    edits,
    'code-unit-progress',
    () => order++,
  );
  editor.replaceAll(/(?:)/g, '_');
  expect(edits.map(edit => edit.start)).toEqual([0, 1, 2]);
});
