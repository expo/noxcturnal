import { beforeAll, describe, expect, test } from 'vitest';
import type { EditCommand } from '../../types';
import { createEditor } from '../editor';
import { NativeTransformSession } from '../session';

const cases = [
  { name: 'sticky starts at supplied cursor', source: 'ba', flags: 'y', cursor: 1, fails: true },
  {
    name: 'sticky does not restart an exhausted cursor',
    source: 'a',
    flags: 'y',
    cursor: 1,
    fails: true,
  },
  { name: 'ordinary regex ignores cursor', source: 'ba', flags: '', cursor: 1, fails: false },
  { name: 'global regex resets cursor', source: 'a', flags: 'g', cursor: 1, fails: false },
];
describe.each(cases)('$name', entry => {
  let expected: string;
  let actual: string;
  beforeAll(() => {
    const expression = () => {
      const regex = new RegExp('a', entry.flags);
      regex.lastIndex = entry.cursor;
      return regex;
    };
    expected = entry.source.replace(expression(), 'x');
    const session = new NativeTransformSession(entry.source, 'input.js');
    const edits: EditCommand[] = [];
    let order = 0;
    try {
      const editor = createEditor(session, edits, 'sticky-state', () => order++);
      editor.replace(expression(), 'x');
      actual = editor.toString();
    } finally {
      session.close();
    }
  });
  (entry.fails ? test.fails : test)('matching respects sticky search position', () => {
    expect(actual).toBe(expected);
  });
});
