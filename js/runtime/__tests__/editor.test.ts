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

test('preserves String.replace substitution semantics for contextual regular expressions', () => {
  const { editor, edits } = editorFixture('ab ac');
  editor.replaceAll(/(?<=a)(b|c)/g, "[$&:$1:$`:$']");
  assert.deepEqual(
    edits.map(edit => [edit.start, edit.end, edit.content]),
    [
      [1, 2, '[b:b:a: ac]'],
      [4, 5, '[c:c:ab a:]'],
    ],
  );

  const named = editorFixture('value=42');
  named.editor.replace(/(?<key>\w+)=(?<value>\d+)/, '$<value>:$<key>');
  assert.equal(named.edits[0]?.content, '42:value');
});

test('native replacement facts preserve UTF-16 offsets, sticky searches and callbacks', () => {
  const unicode = editorFixture('😀ab 😀ac');
  unicode.editor.replaceAll(/(?<=a)(b|c)/gu, (match, group) => `${group}:${match}`);
  assert.deepEqual(
    unicode.edits.map(edit => [edit.start, edit.end, edit.content]),
    [
      [3, 4, 'b:b'],
      [8, 9, 'c:c'],
    ],
  );
  const empty = editorFixture('😀');
  empty.editor.replaceAll(/(?:)/gu, '|');
  assert.deepEqual(
    empty.edits.map(edit => edit.start),
    [0, 2],
  );
  const sticky = editorFixture('aba');
  sticky.editor.replaceAll(/a/y, 'x');
  assert.deepEqual(
    sticky.edits.map(edit => edit.start),
    [0],
  );
  const literal = editorFixture('a.b a.b');
  literal.editor.replaceAll('a.b', '[$&:$0:$$]');
  assert.deepEqual(
    literal.edits.map(edit => edit.content),
    ['[a.b:$0:$]', '[a.b:$0:$]'],
  );
});

test('native replacements preserve unmatched and numbered capture substitutions', () => {
  const fixture = editorFixture('a');
  fixture.editor.replace(/(?<missing>b)?(a)/, '$<missing>:$1:$2:$02:$12:$99');
  assert.equal(fixture.edits[0]?.content, '::a:a:2:$99');
});

test('native captures preserve individual UTF-16 units in non-Unicode regexes', () => {
  const fixture = editorFixture('😀');
  fixture.editor.replaceAll(/./g, match => {
    assert.equal(match.length, 1);
    return match;
  });
  assert.deepEqual(
    fixture.edits.map(edit => [edit.start, edit.end, edit.content]),
    [
      [0, 1, '\ud83d'],
      [1, 2, '\ude00'],
    ],
  );
  const substitution = editorFixture('😀');
  substitution.editor.replace(/./, '$&');
  assert.equal(substitution.edits[0]?.content, '\ud83d');
  const replacement = editorFixture('x');
  replacement.editor.replace('x', '\ud800$&\udfff');
  assert.equal(replacement.edits[0]?.content, '\ud800x\udfff');
});

test('native Unicode regex patterns decode literal astral characters', () => {
  for (const search of [/😀/u, /[😀]/u, /😀/gu, new RegExp('[😀]', 'gv')]) {
    const fixture = editorFixture('😀');
    fixture.editor.replaceAll(search, 'X');
    assert.deepEqual(
      fixture.edits.map(edit => [edit.start, edit.end, edit.content]),
      [[0, 2, 'X']],
    );
  }
});

test('native source transport preserves unpaired UTF-16 units', () => {
  const source = '\ud800x\udfff';
  const fixture = editorFixture(source);
  fixture.editor.replaceAll(/./g, '$&');
  assert.deepEqual(
    fixture.edits.map(edit => edit.content),
    ['\ud800', 'x', '\udfff'],
  );
  const indented = editorFixture(source);
  indented.editor.indent('\udfff');
  assert.equal(indented.edits[0]?.content, '\udfff' + source);
});
