import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { expect, test } from 'vitest';
import { native } from '../../native/binding';
import type { EditCommand } from '../../types';
import { PARTS_TAG } from '../constants';
import { packEdits } from '../edits';

test('source-free text parts use the existing compact text payload', () => {
  const parts = Array(1000).fill('generated();\n') as string[];
  const edit: EditCommand = { kind: 'AppendLeft', start: 0, end: 0, contentParts: parts };
  expect(packEdits([edit])).toEqual(
    packEdits([{ ...edit, contentParts: undefined, content: parts.join('') }]),
  );
});

test.each(['none', 'boundary', 'character'] as const)(
  'joined literal parts preserve code and %s mappings',
  mode => {
    const source = 'before();after();';
    const edits: EditCommand[] = [
      { kind: 'AppendLeft', start: 0, end: 0, contentParts: ['/* ', '😀', ' */\n'] },
      {
        kind: 'Replace',
        start: 0,
        end: source.indexOf(';'),
        contentParts: ['replacement', '()', '\n'],
      },
    ];
    const result = native.commitPackedBuffer(source, 'input.js', packEdits(edits), mode);
    const scalarResult = native.commitPackedBuffer(
      source,
      'input.js',
      packEdits(
        edits.map(({ contentParts, ...edit }) => ({ ...edit, content: contentParts!.join('') })),
      ),
      mode,
    );
    expect(result).toEqual(scalarResult);
    expect(result.code).toBe('/* 😀 */\nreplacement()\n;after();');
    if (mode !== 'none') {
      const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
      expect(originalPositionFor(map, { line: 2, column: 0 }).source).toBeNull();
      expect(originalPositionFor(map, { line: 3, column: 1 })).toMatchObject({
        source: 'input.js',
        line: 1,
        column: mode === 'boundary' ? source.indexOf(';') : source.indexOf('after'),
      });
    }
  },
);

test('mixed text/copy parts remain live to other edits and preserve their mappings', () => {
  const source = '/*😀*/let value=1;';
  const start = source.indexOf('value');
  const result = native.commitPackedBuffer(
    source,
    'input.js',
    packEdits([
      {
        kind: 'Replace',
        start,
        end: start + 5,
        content: 'renamed',
        mapping: 'AnchorBoundaries',
        names: ['value'],
      },
      {
        kind: 'AppendLeft',
        start: source.length,
        end: source.length,
        contentParts: ['\nconsume(', { start, end: start + 5 }, ');'],
      },
    ]),
    'character',
  );
  expect(result.code).toBe('/*😀*/let renamed=1;\nconsume(renamed);');
  const observed: number[] = [];
  new Function('consume', result.code)((value: number) => observed.push(value));
  expect(observed).toEqual([1]);
  const map = new TraceMap({ version: 3, sources: ['input.js'], ...result.map });
  expect(originalPositionFor(map, { line: 2, column: 'consume('.length })).toMatchObject({
    source: 'input.js',
    line: 1,
    column: start,
    name: 'value',
  });
});

test.each([
  { mapping: 'AnchorStart' as const },
  { mapping: 'Identity' as const },
  { names: ['value'] },
])('text parts carrying explicit metadata stay structured: %j', metadata => {
  const data = packEdits([
    { kind: 'AppendLeft', start: 0, end: 0, contentParts: ['a', 'b'], ...metadata },
  ]);
  const wordsOffset = data.readUInt32LE(4);
  expect(data.readUInt32LE(wordsOffset + 16) & PARTS_TAG).not.toBe(0);
});
