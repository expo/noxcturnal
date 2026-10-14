import { beforeAll, describe, expect, test } from 'vitest';
import type { EditCommand } from '../../types';
import { createEditor } from '../editor';
import { NativeTransformSession } from '../session';

const cases = [
  { name: 'global regex', search: /a/g, all: false, fails: true },
  { name: 'non-global regex', search: /a/, all: false, fails: false },
  { name: 'global replaceAll', search: /a/g, all: true, fails: false },
  { name: 'string replace', search: 'a', all: false, fails: false },
];
describe.each(cases)('$name', entry => {
  let actual: string;
  let expected: string;
  beforeAll(() => {
    const source = 'aba';
    expected = entry.all ? source.replaceAll(entry.search, 'x') : source.replace(entry.search, 'x');
    const session = new NativeTransformSession(source, 'input.js');
    const edits: EditCommand[] = [];
    let order = 0;
    try {
      const editor = createEditor(session, edits, 'global-replace', () => order++);
      if (entry.all) editor.replaceAll(entry.search, 'x');
      else editor.replace(entry.search, 'x');
      actual = editor.toString();
    } finally {
      session.close();
    }
  });
  (entry.fails ? test.fails : test)('respects the selected replacement scope', () => {
    expect(actual).toBe(expected);
  });
});
