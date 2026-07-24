import {
  FIELD_KEY_IDS,
  NODE_TYPE_IDS,
  NODE_TYPES,
  PREDICATE_FIELDS,
} from '../generated/event-schema.js';
import type { ScalarPredicate } from '../types.js';
import { ROUTE_MANIFEST_MAGIC, paddingFor } from './constants.js';

export interface NativeRouteManifestEntry {
  id: number;
  pluginId: number;
  nodeType: string;
  side: 'enter' | 'exit';
  order: number;
  predicates: Readonly<Record<string, ScalarPredicate>>;
  payloadFields: readonly string[];
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

function requiredId(map: ReadonlyMap<string, number>, value: string, kind: string): number {
  const id = map.get(value);
  if (id == null) throw new Error(`unknown routed ${kind}: ${value}`);
  return id;
}
