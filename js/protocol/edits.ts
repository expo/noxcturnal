import { FIELD_KEY_IDS, NODE_TYPE_IDS } from '../generated/event-schema';
import type { EditCommand } from '../types';
import { MISSING_VALUE, PARTS_TAG, alignToWord } from './constants';

const EDIT_KINDS: Record<EditCommand['kind'], number> = {
  Replace: 0,
  Remove: 1,
  AppendLeft: 2,
  PrependLeft: 3,
  AppendRight: 4,
  PrependRight: 5,
  AddSourceMapLocation: 6,
  Prefix: 7,
  Prologue: 8,
  Suffix: 9,
  Move: 10,
};

const EDIT_MAPPINGS: Record<NonNullable<EditCommand['mapping']>, number> = {
  Sourceless: 0,
  AnchorStart: 1,
  AnchorBoundaries: 2,
  Identity: 3,
};

export function packEdits(edits: readonly EditCommand[]): Buffer {
  const offset = (value: number): void => {
    if (!Number.isInteger(value) || value < 0 || value > 0xffffffff)
      throw new Error(`invalid edit offset ${value}: expected an unsigned 32-bit integer`);
  };
  for (const edit of edits) {
    offset(edit.start);
    offset(edit.end);
    if (edit.kind === 'Move' && edit.destination != null) offset(edit.destination);
    for (const part of edit.contentParts ?? [])
      if (typeof part !== 'string') {
        offset(part.start);
        offset(part.end);
      }
    if (edit.coordinateSpace != null && edit.coordinateSpace !== 'original')
      throw new Error(
        `edit coordinate space ${edit.coordinateSpace} requires explicit translation before commit`,
      );
  }
  const strings: string[] = [];
  const stringLengths: number[] = [];
  const addString = (value: string): number => {
    strings.push(value);
    stringLengths.push(Buffer.byteLength(value));
    return strings.length - 1;
  };
  const contentWords = new Uint32Array(edits.length);
  const nameIds: number[] = [];
  const partsData: number[] = [];
  let editWords = 0;
  let partsEntryCount = 0;
  for (let index = 0; index < edits.length; index++) {
    const edit = edits[index];
    if (edit.kind === 'Move') {
      contentWords[index] = edit.destination ?? MISSING_VALUE;
    } else if (edit.contentParts != null) {
      if (
        (edit.mapping ?? 'Sourceless') === 'Sourceless' &&
        !edit.names?.length &&
        edit.contentParts.every(part => typeof part === 'string')
      ) {
        // Batched, source-free contributions need one text payload, not a
        // separate native string and generated piece for every contribution.
        contentWords[index] = addString(edit.contentParts.join(''));
      } else {
        contentWords[index] = PARTS_TAG | partsEntryCount++;
        partsData.push(edit.contentParts.length);
        for (const part of edit.contentParts) {
          if (typeof part === 'string') partsData.push(0, addString(part), 0);
          else partsData.push(1, part.start, part.end);
        }
      }
    } else if (edit.content != null) {
      contentWords[index] = addString(edit.content);
    } else {
      contentWords[index] = MISSING_VALUE;
    }
    const names = edit.names;
    if (names) for (const name of names) nameIds.push(addString(name));
    editWords += 7 + (names?.length ?? 0);
  }
  const wordCount = 1 + editWords + partsData.length;
  const slabBytes = stringLengths.reduce((size, length) => size + length, 0);
  const wordsOffset = alignToWord(8 + strings.length * 4 + slabBytes);
  const data = Buffer.allocUnsafe(wordsOffset + wordCount * 4);
  data.writeUInt32LE(strings.length, 0);
  data.writeUInt32LE(wordsOffset, 4);
  for (let index = 0; index < strings.length; index++)
    data.writeUInt32LE(stringLengths[index], 8 + index * 4);
  const slabOffset = 8 + strings.length * 4;
  let stringOffset = slabOffset;
  for (const value of strings) stringOffset += data.write(value, stringOffset, 'utf8');
  data.fill(0, slabOffset + slabBytes, wordsOffset);
  let wordIndex = 0;
  let nameCursor = 0;
  const words = new Uint32Array(wordCount);
  const write = (word: number) => {
    words[wordIndex++] = word;
  };
  write(1 + editWords);
  for (let index = 0; index < edits.length; index++) {
    const edit = edits[index];
    const nameCount = edit.names?.length ?? 0;
    write(EDIT_KINDS[edit.kind]);
    write(edit.start);
    write(edit.end);
    write(contentWords[index]);
    write(EDIT_MAPPINGS[edit.mapping ?? 'Sourceless']);
    write(edit.order ?? index);
    write(nameCount);
    for (let name = 0; name < nameCount; name++) write(nameIds[nameCursor++]);
  }
  for (const word of partsData) write(word);
  data.set(new Uint8Array(words.buffer, 0, words.byteLength), wordsOffset);
  return data;
}

export function packFieldRequests(
  fields?: Readonly<Record<string, readonly string[]>>,
): Buffer | undefined {
  if (!fields) return undefined;
  const words: number[] = [];
  for (const [nodeType, requested] of Object.entries(fields)) {
    const typeId = NODE_TYPE_IDS.get(nodeType);
    if (typeId == null) continue;
    const countIndex = words.length + 1;
    words.push(typeId, 0);
    for (const field of requested) {
      const fieldId = FIELD_KEY_IDS.get(field);
      if (fieldId != null && fieldId !== 0) words.push(fieldId);
    }
    words[countIndex] = words.length - countIndex - 1;
  }
  const data = Buffer.allocUnsafe(words.length * 4);
  for (let index = 0; index < words.length; index++) data.writeUInt32LE(words[index], index * 4);
  return data;
}
