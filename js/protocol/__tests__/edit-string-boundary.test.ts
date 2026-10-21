import { beforeAll, describe, expect, test } from 'vitest';
import { packEdits } from '../edits';
import { native } from '../../native/binding';

const cases = [
  { name: 'surrogate pair spans separate strings', strings: ['\ud800', '\udc00'] },
  { name: 'surrogate pair inside one string', strings: ['\ud800\udc00', 'x'] },
  { name: 'isolated surrogate followed by ASCII', strings: ['\ud800', 'x'] },
  { name: 'ordinary separate strings', strings: ['a', 'b'] },
];
describe.each(cases)('$name', entry => {
  let decoded: string | null;
  let committed: boolean;
  beforeAll(() => {
    const packed = packEdits(
      entry.strings.map(content => ({
        kind: 'Replace' as const,
        start: 0,
        end: 0,
        content,
      })),
    );
    try {
      native.commitPackedBuffer('', 'input.js', packed);
      committed = true;
    } catch (error) {
      expect((error as Error).message).toBe('invalid packed edit UTF-8');
      committed = false;
    }
    const count = packed.readUInt32LE(0);
    expect(count).toBe(2);
    const length = packed.readUInt32LE(8);
    const start = 8 + count * 4;
    // Read only the first entry; its bytes are initialized even in the failing case.
    try {
      decoded = new TextDecoder('utf-8', { fatal: true }).decode(
        packed.subarray(start, start + length),
      );
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      decoded = null;
    }
  });
  test('each length-prefixed entry is independently valid UTF-8', () => {
    expect(decoded).toBe(Buffer.from(entry.strings[0], 'utf8').toString('utf8'));
  });
  test('native commit accepts the serialized strings', () => {
    expect(committed).toBe(true);
  });
});
