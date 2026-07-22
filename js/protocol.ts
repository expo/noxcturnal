import { FIELD_KEYS, NODE_TYPE_IDS, NODE_TYPES } from './generated-event-schema.js';
import type { EditCommand, EventBatch, NativeEvent } from './types.js';

export interface PackedEventBatch {
  data: Buffer;
  strings: string[];
  nodeCount: number;
  emittedCount: number;
  timings: EventBatch['timings'];
  includeParent?: boolean;
  includeScope?: boolean;
  includeExit?: boolean;
}

const EDIT_KINDS: Record<EditCommand['kind'], number> = {
  Replace: 0,
  Remove: 1,
  AppendLeft: 2,
  PrependLeft: 3,
  AppendRight: 4,
  PrependRight: 5,
  AddSourceMapLocation: 6,
};

const EDIT_MAPPINGS: Record<NonNullable<EditCommand['mapping']>, number> = {
  Sourceless: 0,
  AnchorStart: 1,
  AnchorBoundaries: 2,
  Identity: 3,
};

const DYNAMIC_TAG = 0x80000000;
const TAG_INDEX = 0x7fffffff;
const NUMBER_VALUE = 0x40000000;
const NUMBER_PAYLOAD = 0x3fffffff;
const EXIT_TAG = 0x20000000;
const NODE_COUNT_PAYLOAD = 0x1fffffff;
const MISSING_VALUE = 0xffffffff;
const PACKED_HEADER_BYTES = 48;
const EMPTY_FIELDS = Object.freeze([]) as unknown as NativeEvent['fields'];

export function forEachDispatchEvent(batch: PackedEventBatch, callback: (event: NativeEvent) => void): void {
  const words = new Uint32Array(batch.data.buffer, batch.data.byteOffset, batch.data.byteLength / 4);
  const enterEvents: (NativeEvent | undefined)[] | null = batch.includeExit === false ? null : [];
  let offset = 0;
  for (let index = 0; index < batch.emittedCount; index++) {
    const sequenceWord = words[offset++];
    if ((sequenceWord & DYNAMIC_TAG) !== 0) {
      const id = words[offset++];
      const enter = enterEvents?.[id];
      if (!enter) throw new Error(`packed exit event ${id} has no preceding enter event`);
      callback({ ...enter, sequence: sequenceWord & TAG_INDEX, side: 'exit' });
      continue;
    }
    const sequence = sequenceWord;
    const id = words[offset++];
    const type = decodeTag(words[offset++], NODE_TYPES, batch.strings);
    const start = words[offset++];
    const end = words[offset++];
    const rawParentId = batch.includeParent === false ? MISSING_VALUE : words[offset++];
    const rawParentType = batch.includeParent === false ? MISSING_VALUE : words[offset++];
    const scopeId = batch.includeScope === false ? 0 : words[offset++];
    const rawScopeParentId = batch.includeScope === false ? MISSING_VALUE : words[offset++];
    const fieldCount = words[offset++];
    const event: NativeEvent = {
      sequence,
      side: 'enter',
      id,
      type,
      start,
      end,
      parentId: rawParentId === MISSING_VALUE ? undefined : rawParentId,
      parentType: rawParentType === MISSING_VALUE ? undefined : decodeTag(rawParentType, NODE_TYPES, batch.strings),
      scopeId,
      scopeParentId: rawScopeParentId === MISSING_VALUE ? undefined : rawScopeParentId,
      fields: EMPTY_FIELDS,
    };
    const node = event as NativeEvent & Record<string, unknown>;
    for (let field = 0; field < fieldCount; field++) {
      const key = decodeTag(words[offset++], FIELD_KEYS, batch.strings);
      const value = decodeValue(words[offset++], batch.strings);
      node[key] = typeof value === 'string' && (key !== 'value' || type !== 'StringLiteral')
        ? parseScalar(value)
        : value;
    }
    if (enterEvents) enterEvents[id] = event;
    callback(event);
  }
}

export function decodePackedEnvelope(buffer: Buffer): PackedEventBatch {
  const shapeNodeCount = buffer.readUInt32LE(0);
  const nodeCount = shapeNodeCount & NODE_COUNT_PAYLOAD;
  const emittedCount = buffer.readUInt32LE(4);
  const stringCount = buffer.readUInt32LE(8);
  const wordsOffset = buffer.readUInt32LE(12);
  const timings = {
    parseMs: buffer.readDoubleLE(16),
    semanticMs: buffer.readDoubleLE(24),
    traversalMs: buffer.readDoubleLE(32),
    renderAndMapMs: buffer.readDoubleLE(40),
  };
  const strings = new Array<string>(stringCount);
  let offset = PACKED_HEADER_BYTES;
  for (let index = 0; index < stringCount; index++) {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    strings[index] = buffer.toString('utf8', offset, offset + length);
    offset = alignToWord(offset + length);
  }
  return {
    data: buffer.subarray(wordsOffset),
    strings,
    nodeCount,
    emittedCount,
    timings,
    includeParent: (shapeNodeCount & DYNAMIC_TAG) !== 0,
    includeScope: (shapeNodeCount & NUMBER_VALUE) !== 0,
    includeExit: (shapeNodeCount & EXIT_TAG) !== 0,
  };
}

export function decodeEventBatch(batch: PackedEventBatch): EventBatch {
  const events = new Array<NativeEvent>(batch.emittedCount);
  const enterEvents: (NativeEvent | undefined)[] | null = batch.includeExit === false ? null : [];
  let offset = 0;
  for (let index = 0; index < events.length; index++) {
    const sequenceWord = batch.data.readUInt32LE(offset); offset += 4;
    if ((sequenceWord & DYNAMIC_TAG) !== 0) {
      const id = batch.data.readUInt32LE(offset); offset += 4;
      const enter = enterEvents?.[id];
      if (!enter) throw new Error(`packed exit event ${id} has no preceding enter event`);
      events[index] = { ...enter, sequence: sequenceWord & TAG_INDEX, side: 'exit' };
      continue;
    }
    const sequence = sequenceWord;
    const id = batch.data.readUInt32LE(offset); offset += 4;
    const type = decodeTag(batch.data.readUInt32LE(offset), NODE_TYPES, batch.strings); offset += 4;
    const start = batch.data.readUInt32LE(offset); offset += 4;
    const end = batch.data.readUInt32LE(offset); offset += 4;
    const rawParentId = batch.data.readUInt32LE(offset); offset += 4;
    const rawParentType = batch.data.readUInt32LE(offset); offset += 4;
    const scopeId = batch.data.readUInt32LE(offset); offset += 4;
    const rawScopeParentId = batch.data.readUInt32LE(offset); offset += 4;
    const fieldCount = batch.data.readUInt32LE(offset); offset += 4;
    const fields = new Array<{ key: string; value: string | number | boolean }>(fieldCount);
    for (let field = 0; field < fieldCount; field++) {
      fields[field] = {
        key: decodeTag(batch.data.readUInt32LE(offset), FIELD_KEYS, batch.strings),
        value: decodeValue(batch.data.readUInt32LE(offset + 4), batch.strings),
      };
      offset += 8;
    }
    const event: NativeEvent = {
      sequence,
      side: 'enter',
      id,
      type,
      start,
      end,
      parentId: rawParentId === MISSING_VALUE ? undefined : rawParentId,
      parentType: rawParentType === MISSING_VALUE ? undefined : decodeTag(rawParentType, NODE_TYPES, batch.strings),
      scopeId,
      scopeParentId: rawScopeParentId === MISSING_VALUE ? undefined : rawScopeParentId,
      fields,
    };
    if (enterEvents) enterEvents[id] = event;
    events[index] = event;
  }
  return {
    events,
    nodeCount: batch.nodeCount,
    emittedCount: batch.emittedCount,
    timings: batch.timings,
  };
}

export function packEdits(edits: readonly EditCommand[]): Buffer {
  const encodedStrings: Buffer[] = [];
  let wordCount = 0;
  for (const edit of edits) {
    if (edit.content != null) encodedStrings.push(Buffer.from(edit.content));
    for (const name of edit.names ?? []) encodedStrings.push(Buffer.from(name));
    wordCount += 7 + (edit.names?.length ?? 0);
  }
  const stringsSize = encodedStrings.reduce(
    (size, value) => size + 4 + value.length + paddingFor(value.length),
    0,
  );
  const wordsOffset = 8 + stringsSize;
  const data = Buffer.allocUnsafe(wordsOffset + wordCount * 4);
  data.writeUInt32LE(encodedStrings.length, 0);
  data.writeUInt32LE(wordsOffset, 4);
  let offset = 8;
  for (const value of encodedStrings) {
    data.writeUInt32LE(value.length, offset);
    offset += 4;
    value.copy(data, offset);
    offset = alignToWord(offset + value.length);
  }
  let wordOffset = wordsOffset;
  let stringId = 0;
  const write = (word: number) => {
    data.writeUInt32LE(word >>> 0, wordOffset);
    wordOffset += 4;
  };
  for (let index = 0; index < edits.length; index++) {
    const edit = edits[index];
    const names = edit.names ?? [];
    write(EDIT_KINDS[edit.kind]);
    write(edit.start);
    write(edit.end);
    write(edit.content == null ? MISSING_VALUE : stringId++);
    write(EDIT_MAPPINGS[edit.mapping ?? 'Sourceless']);
    write(edit.order ?? index);
    write(names.length);
    for (let nameIndex = 0; nameIndex < names.length; nameIndex++) write(stringId++);
  }
  return data;
}

export function packFieldRequests(fields?: Readonly<Record<string, readonly string[]>>): Buffer | undefined {
  if (!fields) return undefined;
  const words: number[] = [];
  for (const [nodeType, requested] of Object.entries(fields)) {
    const typeId = NODE_TYPE_IDS.get(nodeType);
    if (typeId == null) continue;
    const fieldIds = requested
      .map(field => FIELD_KEYS.indexOf(field as typeof FIELD_KEYS[number]))
      .filter(id => id > 0);
    words.push(typeId, fieldIds.length, ...fieldIds);
  }
  const data = Buffer.allocUnsafe(words.length * 4);
  for (let index = 0; index < words.length; index++) {
    data.writeUInt32LE(words[index], index * 4);
  }
  return data;
}

export function parseScalar(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  const number = Number(value);
  return value !== '' && Number.isFinite(number) ? number : value;
}

function decodeTag(tag: number, known: readonly string[], strings: string[]): string {
  return tag & DYNAMIC_TAG ? strings[tag & TAG_INDEX] : known[tag];
}

function decodeValue(word: number, strings: string[]): string | number | boolean {
  if (word & DYNAMIC_TAG) return (word & 1) === 1;
  if (word & NUMBER_VALUE) return word & NUMBER_PAYLOAD;
  return strings[word];
}

function alignToWord(offset: number): number {
  return (offset + 3) & ~3;
}

function paddingFor(length: number): number {
  return (4 - length % 4) % 4;
}
