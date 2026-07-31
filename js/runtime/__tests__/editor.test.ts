import assert from 'node:assert/strict';
import { test } from 'vitest';

import type { EditCommand } from '../../types';
import { createEditor } from '../editor';

const editorFixture = (source = '  first\n\nsecond  ') => {
  const edits: EditCommand[] = [];
  let order = 0;
  const editor = createEditor(
    {
      source,
      commit: committed => ({ code: committed.map(edit => edit.kind).join(',') }),
    },
    edits,
    'fixture',
    () => order++,
  );
  return { editor, edits };
};

test('exposes deterministic editor inspection and basic mutations', () => {
  const { editor, edits } = editorFixture();
  assert.equal(editor.hasChanged(), false);
  assert.equal(editor.slice(2, 7), 'first');
  assert.equal(editor.isEmpty(), false);

  editor.remove(2, 7);
  editor.update(9, 15, 'replacement');
  editor.append('suffix');
  assert.equal(editor.hasChanged(), true);
  assert.deepEqual(
    edits.map(edit => [edit.kind, edit.start, edit.end, edit.content]),
    [
      ['Remove', 2, 7, undefined],
      ['Replace', 9, 15, 'replacement'],
      ['Suffix', 17, 17, 'suffix'],
    ],
  );
  assert.equal(editor.toString(), 'Remove,Replace,Suffix');
});

test('resets owned edits within a range and indents nonblank lines', () => {
  const { editor, edits } = editorFixture('first\n\nsecond');
  editor.update(0, 5, 'changed');
  editor.update(7, 13, 'changed');
  editor.reset(0, 5);
  assert.deepEqual(
    edits.map(edit => [edit.start, edit.end]),
    [[7, 13]],
  );

  editor.indent('> ');
  assert.equal(edits.at(-1)?.content, '> first\n\n> second');
  assert.throws(() => editor.move(1, 5, 3), /inside moved range/);
});

test('trims surrounding whitespace and recognizes empty sources', () => {
  const { editor, edits } = editorFixture('  value  ');
  editor.trim();
  assert.deepEqual(
    edits.map(edit => [edit.kind, edit.start, edit.end]),
    [
      ['Remove', 0, 2],
      ['Remove', 7, 9],
    ],
  );
  assert.equal(editorFixture(' \n\t').editor.isEmpty(), true);
});
