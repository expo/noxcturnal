import { beforeAll, describe, expect, test } from 'vitest';
import type { EditCommand } from '../../types';
import { createEditor } from '../editor';
import { NativeTransformSession } from '../session';

const cases = [
  { name: 'offset wraps at 32 bits', start: 2 ** 32, end: 2 ** 32 + 1, valid: false, fails: true },
  {
    name: 'negative offset wraps at 32 bits',
    start: -(2 ** 32),
    end: -(2 ** 32) + 1,
    valid: false,
    fails: true,
  },
  { name: 'ordinary out of bounds', start: 10, end: 11, valid: false, fails: false },
  { name: 'valid range', start: 0, end: 1, valid: true, fails: false },
];
describe.each(cases)('$name', entry => {
  let accepted: boolean;
  beforeAll(() => {
    const session = new NativeTransformSession('abc', 'input.js');
    const edits: EditCommand[] = [];
    let order = 0;
    try {
      const editor = createEditor(session, edits, 'offset-validation', () => order++);
      editor.remove(entry.start, entry.end);
      try {
        const code = editor.toString();
        expect(code).toBe('bc');
        accepted = true;
      } catch (error) {
        expect((error as Error).message).toMatch(/offset|range|bounds/i);
        accepted = false;
      }
    } finally {
      session.close();
    }
  });
  test('rejects offsets outside the original source', () => {
    expect(accepted).toBe(entry.valid);
  });
});

const coordinateCases: {
  name: string;
  edit: EditCommand;
  valid: boolean;
  fails: boolean;
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
    fails: Math.abs(offset) === 2 ** 32,
    code: 'aba',
  })),
  ...[2 ** 32, -(2 ** 32), 10, 0].map(offset => ({
    name: `move destination at ${offset}`,
    edit: { kind: 'Move' as const, start: 1, end: 2, destination: offset },
    valid: offset === 0,
    fails: Math.abs(offset) === 2 ** 32,
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
      fails: true,
      code: kind === 'Remove' ? 'bc' : kind === 'Copy' ? 'aba' : 'bac',
    });
  }
}
describe.each(coordinateCases)('$name', entry => {
  let accepted: boolean;
  beforeAll(() => {
    const session = new NativeTransformSession('abc', 'input.js');
    try {
      let code: string | undefined;
      try {
        code = session.commit([entry.edit]).code;
        accepted = true;
      } catch (error) {
        expect((error as Error).message).toMatch(/offset|range|bounds/i);
        accepted = false;
      }
      if (accepted) expect(code).toBe(entry.code);
    } finally {
      session.close();
    }
  });
  test('validates finite integer coordinates before packing', () => {
    expect(accepted).toBe(entry.valid);
  });
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
