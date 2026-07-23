import {
  FIELD_KEY_IDS,
  FIELD_KEYS,
  NODE_TYPE_IDS,
  NODE_TYPES,
  PREDICATE_FIELDS,
} from './generated-event-schema.js';
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

const DYNAMIC_TAG = 0x80000000;
const TAG_INDEX = 0x7fffffff;
const NUMBER_VALUE = 0x40000000;
const NUMBER_PAYLOAD = 0x3fffffff;
const EXIT_TAG = 0x20000000;
const NODE_COUNT_PAYLOAD = 0x1fffffff;
const MISSING_VALUE = 0xffffffff;
const PARTS_TAG = 0x80000000;
const PACKED_HEADER_BYTES = 16;
const ROUTE_MANIFEST_MAGIC = 0x4e524d46;
const ROUTED_TAPE_MAGIC = 0x4e525446;
const ROUTED_HEADER_BYTES = 32;
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
}

export function packRouteManifest(
  routes: readonly NativeRouteManifestEntry[],
  includeParent: boolean,
  includeScope: boolean,
  retentionCapabilities = 0,
  structuralParentTypes: readonly string[] = [],
  retainedFields: Readonly<Record<string, readonly string[]>> = {},
): Buffer {
  if (routes.length > 4096) throw new Error('compiled route limit exceeded');
  const concreteStructuralParentTypes = [
    ...new Set(
      structuralParentTypes.flatMap(type =>
        NODE_TYPE_IDS.has(type)
          ? [type]
          : NODE_TYPES.filter(concrete => concrete && aliasType(type, concrete)),
      ),
    ),
  ];
  const concreteRetainedFields: Record<string, string[]> = {};
  for (const [type, fields] of Object.entries(retainedFields)) {
    const concreteTypes = NODE_TYPE_IDS.has(type)
      ? [type]
      : NODE_TYPES.filter(concrete => concrete && aliasType(type, concrete));
    for (const concrete of concreteTypes) {
      const target = (concreteRetainedFields[concrete] ??= []);
      for (const field of fields) if (!target.includes(field)) target.push(field);
    }
  }
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
    Number(includeParent) | (Number(includeScope) << 1) | (retentionCapabilities << 2),
    routes.length,
    0,
    0,
    0,
    concreteStructuralParentTypes.length,
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
  for (const nodeType of concreteStructuralParentTypes)
    words.push(requiredId(NODE_TYPE_IDS, nodeType, 'structural parent type'));
  const retainedFieldEntries = Object.entries(concreteRetainedFields);
  words.push(retainedFieldEntries.length);
  for (const [nodeType, fields] of retainedFieldEntries) {
    words.push(requiredId(NODE_TYPE_IDS, nodeType, 'retained field node type'), fields.length);
    for (const field of fields) words.push(requiredId(FIELD_KEY_IDS, field, 'retained field'));
  }
  words[3] = strings.length;
  words[4] = words.length * 4;
  words[5] = routes.reduce((count, route) => Math.max(count, route.pluginId + 1), 0);
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

function aliasType(alias: string, concrete: string): boolean {
  if (alias === concrete) return true;
  if (alias === 'Identifier') return concrete === 'Identifier';
  if (alias === 'Function')
    return concrete === 'Function' || concrete === 'ArrowFunctionExpression';
  if (alias === 'Class') return concrete === 'Class';
  if (alias === 'Expression') return PREDICATE_FIELDS[concrete] != null;
  return false;
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
      node[key] = typeof value === 'string' ? coerceFieldValue(key, type, value) : value;
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
  for (const edit of edits) {
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
  // One interning pass with flat side tables; no per-edit allocation.
  const contentWords = new Uint32Array(edits.length);
  const nameIds: number[] = [];
  const partsData: number[] = [];
  let editWords = 0;
  let partsEntryCount = 0;
  for (let index = 0; index < edits.length; index++) {
    const edit = edits[index];
    if (edit.kind === 'Move') {
      // Move edits reuse the content word as their destination offset.
      contentWords[index] = edit.destination ?? MISSING_VALUE;
    } else if (edit.contentParts != null) {
      contentWords[index] = PARTS_TAG | partsEntryCount++;
      partsData.push(edit.contentParts.length);
      for (const part of edit.contentParts) {
        if (typeof part === 'string') partsData.push(0, addString(part), 0);
        else partsData.push(1, part.start, part.end);
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
  // Strings pack as one lengths table plus a single concatenated slab: one utf8 encode
  // instead of one native write call per string.
  const slabBytes = stringLengths.reduce((size, length) => size + length, 0);
  const wordsOffset = alignToWord(8 + strings.length * 4 + slabBytes);
  const data = Buffer.allocUnsafe(wordsOffset + wordCount * 4);
  data.writeUInt32LE(strings.length, 0);
  data.writeUInt32LE(wordsOffset, 4);
  for (let index = 0; index < strings.length; index++)
    data.writeUInt32LE(stringLengths[index], 8 + index * 4);
  const slabOffset = 8 + strings.length * 4;
  data.write(strings.join(''), slabOffset, slabBytes, 'utf8');
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

/** Coerce a decoded string field only where a non-string value is meaningful.
 *
 * Booleans and counts arrive packed as typed words; the only string-carried
 * scalars that can represent numbers or booleans are literal `value`s and
 * evaluated `constantValue`s. Identifier names, operators, and other
 * source-derived strings stay strings without a numeric parse attempt.
 */
export function coerceFieldValue(
  key: string,
  nodeType: string,
  value: string,
): string | number | boolean {
  return (key === 'value' && nodeType !== 'StringLiteral') || key === 'constantValue'
    ? parseScalar(value)
    : value;
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

function alignToWord(offset: number): number {
  return (offset + 3) & ~3;
}

function paddingFor(length: number): number {
  return (4 - (length % 4)) % 4;
}
