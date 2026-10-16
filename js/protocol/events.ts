import { decodeConstant, decodeString } from './value-transport';
import { FIELD_KEYS, NODE_TYPES } from '../generated/event-schema';
import type { EventBatch, NativeEvent } from '../types';
import type { NativeComment } from '../types';
import {
  DYNAMIC_TAG,
  EXIT_TAG,
  MISSING_VALUE,
  NODE_COUNT_PAYLOAD,
  NUMBER_PAYLOAD,
  NUMBER_VALUE,
  PACKED_HEADER_BYTES,
  ROUTED_HEADER_BYTES,
  ROUTED_TAPE_MAGIC,
  TAG_INDEX,
  alignToWord,
  paddingFor,
} from './constants';

export interface PackedEventBatch {
  data: Buffer;
  strings: string[];
  nodeCount: number;
  emittedCount: number;
  includeParent?: boolean;
  includeScope?: boolean;
  includeExit?: boolean;
}

const EMPTY_FIELDS = Object.freeze([]) as unknown as NativeEvent['fields'];

export interface RoutedEventBatch {
  data: Buffer;
  stringAt(id: number): string;
  recordBytes: number;
  stringSlabBytes: number;
  nodeCount: number;
  nodeRecordCount: number;
  routeDeliveryCount: number;
  /** Eight-word [id, type, start, end, parentId, parentTypeId, scopeId, scopeParentId] entries. */
  parentSummaries: Uint32Array;
  includeParent: boolean;
  includeScope: boolean;
  includeExit: boolean;
  includeComments: boolean;
}

export function decodeRoutedEnvelope(buffer: Buffer): RoutedEventBatch {
  if (buffer.length < ROUTED_HEADER_BYTES || buffer.readUInt32LE(0) !== ROUTED_TAPE_MAGIC)
    throw new Error('invalid routed tape');
  const flags = buffer.readUInt32LE(4);
  const stringCount = buffer.readUInt32LE(20);
  const recordsOffset = buffer.readUInt32LE(24);
  const parentCount = buffer.readUInt32LE(28);
  const stringsEnd = recordsOffset - parentCount * 32;
  if (stringsEnd < ROUTED_HEADER_BYTES || stringCount > (stringsEnd - ROUTED_HEADER_BYTES) / 4)
    throw new Error('invalid routed tape string count');
  const stringOffsets = new Uint32Array(stringCount);
  const stringLengths = new Uint32Array(stringCount);
  let offset = ROUTED_HEADER_BYTES;
  for (let index = 0; index < stringCount; index++) {
    if (offset + 4 > stringsEnd) throw new Error('invalid routed tape string table');
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    if (length > stringsEnd - offset) throw new Error('invalid routed tape string length');
    stringOffsets[index] = offset;
    stringLengths[index] = length;
    offset += length + paddingFor(length);
  }
  if (offset !== stringsEnd || recordsOffset > buffer.length)
    throw new Error('invalid routed tape offsets');
  return {
    data: buffer.subarray(recordsOffset),
    stringAt: lazyStringLookup(buffer, stringOffsets, stringLengths),
    recordBytes: buffer.length - recordsOffset,
    stringSlabBytes: stringsEnd - ROUTED_HEADER_BYTES,
    nodeCount: buffer.readUInt32LE(8),
    nodeRecordCount: buffer.readUInt32LE(12),
    routeDeliveryCount: buffer.readUInt32LE(16),
    parentSummaries: new Uint32Array(
      buffer.buffer,
      buffer.byteOffset + stringsEnd,
      parentCount * 8,
    ),
    includeParent: (flags & 1) !== 0,
    includeScope: (flags & 2) !== 0,
    includeExit: (flags & 4) !== 0,
    includeComments: (flags & 8) !== 0,
  };
}

function lazyStringLookup(
  buffer: Buffer,
  offsets: Uint32Array,
  lengths: Uint32Array,
): (id: number) => string {
  const cache = new Array<string | undefined>(offsets.length);
  return id => {
    if (id >= offsets.length) throw new Error(`invalid routed string id ${id}`);
    return (cache[id] ??= buffer.toString('utf8', offsets[id], offsets[id] + lengths[id]));
  };
}

/** Decode a routed tape directly into its precompiled handlers.
 *
 * This hot path does not allocate a route subarray or invoke an intermediate
 * JavaScript callback for every node record.
 */
export function dispatchRoutedEvents(
  batch: RoutedEventBatch,
  handlers: readonly ((event: NativeEvent) => void)[],
  onEvent?: (event: NativeEvent) => void,
): void {
  // Signed reads keep every tape word SMI-representable: exit tags surface as negative
  // values and absent-id sentinels as -1, so no heap numbers are allocated per record.
  const words = new Int32Array(batch.data.buffer, batch.data.byteOffset, batch.data.byteLength / 4);
  const enterEvents: (NativeEvent | undefined)[] | null = batch.includeExit ? [] : null;
  // Interned exceptional strings need JSON decoding only once per tape.
  const decodedStrings = new Map<string, string>();
  let offset = 0;
  for (let record = 0; record < batch.nodeRecordCount; record++) {
    const sequenceWord = words[offset++];
    if (sequenceWord < 0) {
      const id = words[offset++];
      const routeCount = words[offset++];
      const routeStart = offset;
      offset += routeCount;
      const enter = enterEvents?.[id];
      if (!enter) throw new Error(`routed exit event ${id} has no enter record`);
      const event: NativeEvent = {
        ...enter,
        sequence: sequenceWord & TAG_INDEX,
        side: 'exit',
      };
      onEvent?.(event);
      for (let index = routeStart + routeCount - 1; index >= routeStart; index--)
        handlers[words[index]](event);
      continue;
    }
    const sequence = sequenceWord;
    const id = words[offset++];
    const type = NODE_TYPES[words[offset++]];
    if (!type) throw new Error('invalid routed node type');
    const start = words[offset++];
    const end = words[offset++];
    const parentId = batch.includeParent ? words[offset++] : -1;
    const parentTypeId = batch.includeParent ? words[offset++] : -1;
    const scopeId = batch.includeScope ? words[offset++] : 0;
    const scopeParentId = batch.includeScope ? words[offset++] : -1;
    const fieldCount = words[offset++];
    const event: NativeEvent = {
      sequence,
      side: 'enter',
      id,
      type,
      start,
      end,
      parentId: parentId === -1 ? undefined : parentId,
      parentType: parentTypeId === -1 ? undefined : NODE_TYPES[parentTypeId],
      scopeId,
      scopeParentId: scopeParentId === -1 ? undefined : scopeParentId,
      fields: EMPTY_FIELDS,
    };
    const node = event as NativeEvent & Record<string, unknown>;
    for (let field = 0; field < fieldCount; field++) {
      const key = FIELD_KEYS[words[offset++]];
      if (!key) throw new Error('invalid routed field key');
      const value = decodeValue(words[offset++], batch.stringAt);
      node[key] =
        typeof value === 'string' ? coerceFieldValue(key, type, value, decodedStrings) : value;
    }
    if (batch.includeComments) {
      const commentCount = words[offset++];
      const comments = new Array<NativeComment>(commentCount);
      for (let comment = 0; comment < commentCount; comment++) {
        const kind = words[offset++] === 0 ? 'line' : 'block';
        const value = batch.stringAt(words[offset++]);
        const commentStart = words[offset++];
        const commentEnd = words[offset++];
        comments[comment] = Object.freeze({ kind, value, start: commentStart, end: commentEnd });
      }
      event.comments = Object.freeze(comments);
    }
    const routeCount = words[offset++];
    const routeStart = offset;
    offset += routeCount;
    if (enterEvents) enterEvents[id] = event;
    onEvent?.(event);
    for (let index = routeStart; index < routeStart + routeCount; index++)
      handlers[words[index]](event);
  }
  if (offset !== words.length) throw new Error('trailing routed tape words');
}

export function decodePackedEnvelope(buffer: Buffer): PackedEventBatch {
  const shapeNodeCount = buffer.readUInt32LE(0);
  const nodeCount = shapeNodeCount & NODE_COUNT_PAYLOAD;
  const emittedCount = buffer.readUInt32LE(4);
  const stringCount = buffer.readUInt32LE(8);
  const wordsOffset = buffer.readUInt32LE(12);
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
    const sequenceWord = batch.data.readUInt32LE(offset);
    offset += 4;
    if ((sequenceWord & DYNAMIC_TAG) !== 0) {
      const id = batch.data.readUInt32LE(offset);
      offset += 4;
      const enter = enterEvents?.[id];
      if (!enter) throw new Error(`packed exit event ${id} has no preceding enter event`);
      events[index] = { ...enter, sequence: sequenceWord & TAG_INDEX, side: 'exit' };
      continue;
    }
    const sequence = sequenceWord;
    const id = batch.data.readUInt32LE(offset);
    offset += 4;
    const type = decodeTag(batch.data.readUInt32LE(offset), NODE_TYPES, batch.strings);
    offset += 4;
    const start = batch.data.readUInt32LE(offset);
    offset += 4;
    const end = batch.data.readUInt32LE(offset);
    offset += 4;
    const rawParentId = batch.data.readUInt32LE(offset);
    offset += 4;
    const rawParentType = batch.data.readUInt32LE(offset);
    offset += 4;
    const scopeId = batch.data.readUInt32LE(offset);
    offset += 4;
    const rawScopeParentId = batch.data.readUInt32LE(offset);
    offset += 4;
    const fieldCount = batch.data.readUInt32LE(offset);
    offset += 4;
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
      parentType:
        rawParentType === MISSING_VALUE
          ? undefined
          : decodeTag(rawParentType, NODE_TYPES, batch.strings),
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
  };
}

export function parseScalar(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  const number = Number(value);
  return value !== '' && Number.isFinite(number) ? number : value;
}

/** Coerce a decoded string field only where a non-string value is meaningful.
 *
 * Booleans and counts arrive packed as typed words. String-carried numbers are
 * numeric literals. `constantValue` carries an explicit kind tag and is never
 * guessed from its text. Other host strings decode only the exceptional
 * UTF-16 form; identifier names and operators stay untouched.
 */
export function coerceFieldValue(
  key: string,
  nodeType: string,
  value: string,
  decodedStrings?: Map<string, string>,
): string | number | boolean | null {
  if (key === 'constantValue') return decodeConstant(value, decodedStrings);
  if (key === 'value' && nodeType === 'NumericLiteral') return Number(value);
  if (key === 'value' && nodeType === 'BooleanLiteral') return parseScalar(value);
  if (
    key === 'value' ||
    key === 'staticArgument' ||
    key === 'property' ||
    key === 'source' ||
    key === 'imported' ||
    key === 'exported' ||
    key === 'local'
  )
    return decodeString(value, decodedStrings);
  return value;
}

function decodeTag(tag: number, known: readonly string[], strings: string[]): string {
  return tag & DYNAMIC_TAG ? strings[tag & TAG_INDEX] : known[tag];
}

function decodeValue(
  word: number,
  strings: readonly string[] | ((id: number) => string),
): string | number | boolean {
  if (word & DYNAMIC_TAG) return (word & 1) === 1;
  if (word & NUMBER_VALUE) return word & NUMBER_PAYLOAD;
  return typeof strings === 'function' ? strings(word) : strings[word];
}
