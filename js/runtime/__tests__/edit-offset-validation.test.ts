import { expect, test } from 'vitest';
import type { EditCommand } from '../../types';
import { createEditor } from '../editor';
import { NativeTransformSession } from '../session';

const cases = [
  { name: 'offset wraps at 32 bits', start: 2 ** 32, end: 2 ** 32 + 1, valid: false },
  {
    name: 'negative offset wraps at 32 bits',
    start: -(2 ** 32),
    end: -(2 ** 32) + 1,
    valid: false,
  },
  { name: 'ordinary out of bounds', start: 10, end: 11, valid: false },
  { name: 'valid range', start: 0, end: 1, valid: true },
];
test.each(cases)('editor range validation: $name', ({ start, end, valid }) => {
  const session = new NativeTransformSession('abc', 'input.js');
  const edits: EditCommand[] = [];
  let order = 0;
  try {
    const editor = createEditor(session, edits, 'offset-validation', () => order++);
    editor.remove(start, end);
    if (valid) expect(editor.toString()).toBe('bc');
    else expect(() => editor.toString()).toThrow(/offset|range|bounds/i);
  } finally {
    session.close();
  }
});

const coordinateCases: {
  name: string;
  edit: EditCommand;
  valid: boolean;
  code: string;
}[] = [
  ...[2 ** 32, -(2 ** 32), 10, 0].map(offset => ({
    name: `copy range at ${offset}`,
    edit: {
      kind: 'Replace' as const,
      start: 2,
      end: 3,
      contentParts: [{ start: offset, end: offset + 1 }],
    },
    valid: offset === 0,
    code: 'aba',
  })),
  ...[2 ** 32, -(2 ** 32), 10, 0].map(offset => ({
    name: `move destination at ${offset}`,
    edit: { kind: 'Move' as const, start: 1, end: 2, destination: offset },
    valid: offset === 0,
    code: 'bac',
  })),
];
for (const offset of [0.5, -0.5, NaN, Infinity, -Infinity]) {
  for (const kind of ['Remove', 'Copy', 'Move'] as const) {
    coordinateCases.push({
      name: `${kind} with non-integer coordinate ${offset}`,
      edit:
        kind === 'Remove'
          ? { kind: 'Remove', start: offset, end: 1 }
          : kind === 'Copy'
            ? { kind: 'Replace', start: 2, end: 3, contentParts: [{ start: offset, end: 1 }] }
            : { kind: 'Move', start: 1, end: 2, destination: offset },
      valid: false,
      code: kind === 'Remove' ? 'bc' : kind === 'Copy' ? 'aba' : 'bac',
    });
  }
}
test.each(coordinateCases)('native coordinate validation: $name', ({ edit, valid, code }) => {
  const session = new NativeTransformSession('abc', 'input.js');
  try {
    if (valid) expect(session.commit([edit]).code).toBe(code);
    else expect(() => session.commit([edit])).toThrow(/offset|range|bounds/i);
  } finally {
    session.close();
  }
});

test('Move rejects invalid copied offsets even when its destination supplies the payload', () => {
  const session = new NativeTransformSession('abc', 'input.js');
  try {
    expect(() =>
      session.commit([
        {
          kind: 'Move',
          start: 0,
          end: 1,
          destination: 3,
          contentParts: [{ start: 2 ** 32, end: 2 ** 32 + 1 }],
        },
      ]),
    ).toThrow(/invalid edit offset/);
  } finally {
    session.close();
  }
});
