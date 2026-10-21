import { beforeAll, describe, expect, test } from 'vitest';
import type { EditCommand } from '../../types';
import { createEditor } from '../editor';
import { NativeTransformSession } from '../session';
const cases = [
  {
    name: 'empty named token',
    source: 'a',
    expression: /(?<x>a)/,
    replacement: '$<>',
    all: false,
    fails: true,
  },
  {
    name: 'global empty named token',
    source: 'aba',
    expression: /(?<x>a)/g,
    replacement: '$<>',
    all: true,
    fails: true,
  },
  {
    name: 'empty token without named captures',
    source: 'a',
    expression: /(a)/,
    replacement: '$<>',
    all: false,
    fails: false,
  },
  {
    name: 'escaped named token',
    source: 'a',
    expression: /(?<x>a)/,
    replacement: '$$<x>',
    all: false,
    fails: false,
  },
  {
    name: 'absent named token',
    source: 'a',
    expression: /(?<x>a)/,
    replacement: '$<missing>',
    all: false,
    fails: false,
  },
  {
    name: 'two-digit fallback',
    source: 'a',
    expression: /(a)/,
    replacement: '$12',
    all: false,
    fails: false,
  },
  {
    name: 'leading zero capture',
    source: 'a',
    expression: /(a)/,
    replacement: '$01',
    all: false,
    fails: false,
  },
];
describe.each(cases)('$name', entry => {
  let actual: string, expected: string;
  beforeAll(() => {
    expected = entry.all
      ? entry.source.replaceAll(entry.expression, entry.replacement)
      : entry.source.replace(entry.expression, entry.replacement);
    const session = new NativeTransformSession(entry.source, 'input.js');
    const edits: EditCommand[] = [];
    let order = 0;
    try {
      const editor = createEditor(session, edits, 'replacement-token-audit', () => order++);
      if (entry.all) editor.replaceAll(entry.expression, entry.replacement);
      else editor.replace(entry.expression, entry.replacement);
      expect(edits.length).toBeGreaterThan(0);
      actual = editor.toString();
    } finally {
      session.close();
    }
  });
  test('replacement expansion matches native substitution', () => expect(actual).toBe(expected));
});
