import { FIELD_KEY_IDS, FIELD_KEYS, NODE_TYPE_IDS, NODE_TYPES } from './generated-event-schema.js';
import type { EditCommand, EventBatch, NativeEvent, ScalarPredicate } from './types.js';

export interface PackedEventBatch {
  data: Buffer;
  strings: string[];
  nodeCount: number;
  emittedCount: number;
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
const PACKED_HEADER_BYTES = 16;
const ROUTE_MANIFEST_MAGIC = 0x4e524d31;
const ROUTED_TAPE_MAGIC = 0x4e525431;
export const ROUTED_PROTOCOL_VERSION = 2;
const EMPTY_FIELDS = Object.freeze([]) as unknown as NativeEvent['fields'];

export interface NativeRouteManifestEntry {
  id: number;
  pluginId: number;
  nodeType: string;
  side: 'enter' | 'exit';
  order: number;
  predicates: Readonly<Record<string, ScalarPredicate>>;
  payloadFields: readonly string[];
}

export interface RoutedEventBatch {
  data: Buffer;
  strings: string[];
  nodeCount: number;
  nodeRecordCount: number;
  routeDeliveryCount: number;
  includeParent: boolean;
  includeScope: boolean;
}

export function packRouteManifest(
  routes: readonly NativeRouteManifestEntry[],
  includeParent: boolean,
  includeScope: boolean,
): Buffer {
  if (routes.length > 4096) throw new Error('compiled route limit exceeded');
  const strings: string[] = [];
  const stringIds = new Map<string, number>();
  const intern = (value: string) => {
    const existing = stringIds.get(value);
    if (existing != null) return existing;
    const id = strings.length;
    strings.push(value);
    stringIds.set(value, id);
    return id;
  };
  const words: number[] = [
    ROUTE_MANIFEST_MAGIC,
    ROUTED_PROTOCOL_VERSION,
    Number(includeParent) | (Number(includeScope) << 1),
    routes.length,
    0,
    0,
    0,
    0,
  ];
  for (const route of routes) {
    const predicates = Object.entries(route.predicates);
    if (predicates.length > 64 || route.payloadFields.length > 64)
      throw new Error(`compiled route ${route.id} exceeds field limits`);
    words.push(
      route.id,
      requiredId(NODE_TYPE_IDS, route.nodeType, 'node type'),
      route.side === 'exit' ? 1 : 0,
      route.pluginId,
      route.order,
      0,
      predicates.length,
      route.payloadFields.length,
    );
    for (const [field, predicate] of predicates) {
      const values =
        'equals' in predicate
          ? [predicate.equals]
          : 'oneOf' in predicate
            ? predicate.oneOf
            : [predicate.present];
      words.push(
        requiredId(FIELD_KEY_IDS, field, 'field'),
        'equals' in predicate ? 0 : 'oneOf' in predicate ? 1 : 2,
        values.length,
      );
      for (const value of values) {
        if (typeof value === 'string') words.push(0, intern(value));
        else if (typeof value === 'number') words.push(1, intern(String(value)));
        else if (typeof value === 'boolean') words.push(2, Number(value));
        else words.push(3, 0);
      }
    }
    for (const field of route.payloadFields) words.push(requiredId(FIELD_KEY_IDS, field, 'field'));
  }
  words[4] = strings.length;
  words[5] = words.length * 4;
  words[6] = routes.reduce((count, route) => Math.max(count, route.pluginId + 1), 0);
  const stringsBytes = strings.reduce(
    (total, value) => total + 4 + Buffer.byteLength(value) + paddingFor(Buffer.byteLength(value)),
    0,
  );
  const output = Buffer.allocUnsafe(words.length * 4 + stringsBytes);
  words.forEach((word, index) => output.writeUInt32LE(word >>> 0, index * 4));
  let offset = words.length * 4;
  for (const value of strings) {
    const length = output.write(value, offset + 4, 'utf8');
    output.writeUInt32LE(length, offset);
    offset += 4 + length;
    const padding = paddingFor(length);
    output.fill(0, offset, offset + padding);
    offset += padding;
  }
  return output;
}

export function decodeRoutedEnvelope(buffer: Buffer): RoutedEventBatch {
  if (buffer.length < 32 || buffer.readUInt32LE(0) !== ROUTED_TAPE_MAGIC)
    throw new Error('invalid routed tape');
  if (buffer.readUInt32LE(4) !== ROUTED_PROTOCOL_VERSION)
    throw new Error('incompatible routed protocol version');
  const flags = buffer.readUInt32LE(8);
  const stringCount = buffer.readUInt32LE(24);
  const recordsOffset = buffer.readUInt32LE(28);
  const strings: string[] = [];
  let offset = 32;
  for (let index = 0; index < stringCount; index++) {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    strings.push(buffer.toString('utf8', offset, offset + length));
    offset += length + paddingFor(length);
  }
  if (offset !== recordsOffset || recordsOffset > buffer.length)
    throw new Error('invalid routed tape offsets');
  return {
    data: buffer.subarray(recordsOffset),
    strings,
    nodeCount: buffer.readUInt32LE(12),
    nodeRecordCount: buffer.readUInt32LE(16),
    routeDeliveryCount: buffer.readUInt32LE(20),
    includeParent: (flags & 1) !== 0,
    includeScope: (flags & 2) !== 0,
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
  const words = new Uint32Array(
    batch.data.buffer,
    batch.data.byteOffset,
    batch.data.byteLength / 4,
  );
  const enterEvents: (NativeEvent | undefined)[] = [];
  let offset = 0;
  for (let record = 0; record < batch.nodeRecordCount; record++) {
    const sequenceWord = words[offset++];
    if ((sequenceWord & DYNAMIC_TAG) !== 0) {
      const id = words[offset++];
      const routeCount = words[offset++];
      const routeStart = offset;
      offset += routeCount;
      const enter = enterEvents[id];
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
    const parentId = batch.includeParent ? words[offset++] : MISSING_VALUE;
    const parentTypeId = batch.includeParent ? words[offset++] : MISSING_VALUE;
    const scopeId = batch.includeScope ? words[offset++] : 0;
    const scopeParentId = batch.includeScope ? words[offset++] : MISSING_VALUE;
    const fieldCount = words[offset++];
    const event: NativeEvent = {
      sequence,
      side: 'enter',
      id,
      type,
      start,
      end,
      parentId: parentId === MISSING_VALUE ? undefined : parentId,
      parentType: parentTypeId === MISSING_VALUE ? undefined : NODE_TYPES[parentTypeId],
      scopeId,
      scopeParentId: scopeParentId === MISSING_VALUE ? undefined : scopeParentId,
      fields: EMPTY_FIELDS,
    };
    const node = event as NativeEvent & Record<string, unknown>;
    for (let field = 0; field < fieldCount; field++) {
      const key = FIELD_KEYS[words[offset++]];
      if (!key) throw new Error('invalid routed field key');
      const value = decodeValue(words[offset++], batch.strings);
      node[key] =
        typeof value === 'string' && (key !== 'value' || type !== 'StringLiteral')
          ? parseScalar(value)
          : value;
    }
    const routeCount = words[offset++];
    const routeStart = offset;
    offset += routeCount;
    enterEvents[id] = event;
    onEvent?.(event);
    for (let index = routeStart; index < routeStart + routeCount; index++)
      handlers[words[index]](event);
  }
  if (offset !== words.length) throw new Error('trailing routed tape words');
}

function requiredId(map: ReadonlyMap<string, number>, value: string, kind: string): number {
  const id = map.get(value);
  if (id == null) throw new Error(`unknown routed ${kind}: ${value}`);
  return id;
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

export function packEdits(edits: readonly EditCommand[]): Buffer {
  const strings: string[] = [];
  const stringLengths: number[] = [];
  const addString = (value: string) => {
    strings.push(value);
    stringLengths.push(Buffer.byteLength(value));
  };
  let wordCount = 0;
  for (const edit of edits) {
    if (edit.content != null) addString(edit.content);
    for (const name of edit.names ?? []) addString(name);
    wordCount += 7 + (edit.names?.length ?? 0);
  }
  const stringsSize = stringLengths.reduce(
    (size, length) => size + 4 + length + paddingFor(length),
    0,
  );
  const wordsOffset = 8 + stringsSize;
  const data = Buffer.allocUnsafe(wordsOffset + wordCount * 4);
  data.writeUInt32LE(strings.length, 0);
  data.writeUInt32LE(wordsOffset, 4);
  let offset = 8;
  for (let index = 0; index < strings.length; index++) {
    const value = strings[index];
    const length = stringLengths[index];
    data.writeUInt32LE(length, offset);
    offset += 4;
    data.write(value, offset, length, 'utf8');
    offset = alignToWord(offset + length);
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
  return (4 - (length % 4)) % 4;
}
