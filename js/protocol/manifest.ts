import { encodeString } from './value-transport';
import {
  CHILD_ROLES,
  FIELD_KEY_IDS,
  NODE_TYPE_IDS,
  NODE_TYPES,
  PREDICATE_FIELDS,
} from '../generated/event-schema';
import type { ScalarPredicate, ScalarValue } from '../types';
import { ROUTE_MANIFEST_MAGIC, paddingFor } from './constants';

export interface NativeRouteManifestEntry {
  id: number;
  pluginId: number;
  nodeType: string;
  side: 'enter' | 'exit';
  order: number;
  predicates: Readonly<Record<string, ScalarPredicate>>;
  payloadFields: readonly string[];
  comments?: 'inner';
}

export type ChildRetentionPlan = Readonly<Record<string, readonly string[]>>;

export const MAX_COMPILED_ROUTES = 4096;

export function packRouteManifest(
  routes: readonly NativeRouteManifestEntry[],
  includeParent: boolean,
  includeScope: boolean,
  retentionCapabilities = 0,
  childRetention: ChildRetentionPlan = {},
  retainedFields: Readonly<Record<string, readonly string[]>> = {},
  ancestorFields: Readonly<Record<string, readonly string[]>> = {},
  ancestorTypes: readonly string[] = [],
  ancestorChildParentTypes: readonly string[] = [],
  ancestryDepth = includeParent ? Number.POSITIVE_INFINITY : 0,
): Buffer {
  if (routes.length > MAX_COMPILED_ROUTES) throw new Error('compiled route limit exceeded');
  const concreteChildRetention = new Map<string, { wildcard: boolean; roleIds: number[] }>();
  for (const [type, requestedRoles] of Object.entries(childRetention)) {
    const concreteTypes = NODE_TYPE_IDS.has(type)
      ? [type]
      : NODE_TYPES.filter(concrete => concrete && aliasType(type, concrete));
    for (const concrete of concreteTypes) {
      const entry = concreteChildRetention.get(concrete) ?? { wildcard: false, roleIds: [] };
      for (const role of requestedRoles) {
        if (role === '*') {
          entry.wildcard = true;
          entry.roleIds.length = 0;
          continue;
        }
        if (entry.wildcard) continue;
        const declaration = CHILD_ROLES[concrete]?.[role];
        // Composite routes use union semantics: an absent role contributes no
        // request to an incompatible concrete parent variant.
        if (declaration != null && !entry.roleIds.includes(declaration.id))
          entry.roleIds.push(declaration.id);
      }
      if (entry.wildcard || entry.roleIds.length > 0) concreteChildRetention.set(concrete, entry);
    }
  }
  const concreteChildEntries = [...concreteChildRetention.entries()]
    .map(([parentType, entry]) => ({
      parentType,
      wildcard: entry.wildcard,
      roleIds: entry.roleIds.sort((left, right) => left - right),
    }))
    .sort(
      (left, right) =>
        requiredId(NODE_TYPE_IDS, left.parentType, 'child parent type') -
        requiredId(NODE_TYPE_IDS, right.parentType, 'child parent type'),
    );
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
  const concreteAncestorFields: Record<string, string[]> = {};
  for (const [type, fields] of Object.entries(ancestorFields)) {
    const concreteTypes = NODE_TYPE_IDS.has(type)
      ? [type]
      : NODE_TYPES.filter(concrete => concrete && aliasType(type, concrete));
    for (const concrete of concreteTypes) {
      const target = (concreteAncestorFields[concrete] ??= []);
      for (const field of fields) if (!target.includes(field)) target.push(field);
    }
  }
  const expandTypes = (types: readonly string[]) => [
    ...new Set(
      types.flatMap(type =>
        NODE_TYPE_IDS.has(type)
          ? [type]
          : NODE_TYPES.filter(concrete => concrete && aliasType(type, concrete)),
      ),
    ),
  ];
  const concreteAncestorTypes = expandTypes(ancestorTypes);
  const concreteAncestorChildParentTypes = expandTypes(ancestorChildParentTypes);
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
    concreteChildEntries.length,
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
      route.comments === 'inner' ? 1 : 0,
      predicates.length,
      route.payloadFields.length,
    );
    for (const [field, predicate] of predicates) {
      // Predicates reaching the manifest are validated, so no parameter survives.
      const values: readonly ScalarValue[] =
        'equals' in predicate
          ? [predicate.equals as ScalarValue]
          : 'oneOf' in predicate
            ? (predicate.oneOf as readonly ScalarValue[])
            : [predicate.present];
      words.push(
        requiredId(FIELD_KEY_IDS, field, 'field'),
        'equals' in predicate ? 0 : 'oneOf' in predicate ? 1 : 2,
        values.length,
      );
      for (const value of values) {
        if (typeof value === 'string') words.push(0, intern(encodeString(value)));
        else if (typeof value === 'number') words.push(1, intern(String(value)));
        else if (typeof value === 'boolean') words.push(2, Number(value));
        else words.push(3, 0);
      }
    }
    for (const field of route.payloadFields) words.push(requiredId(FIELD_KEY_IDS, field, 'field'));
  }
  for (const entry of concreteChildEntries) {
    words.push(
      requiredId(NODE_TYPE_IDS, entry.parentType, 'child parent type'),
      Number(entry.wildcard),
      entry.roleIds.length,
      ...entry.roleIds,
    );
  }
  const retainedFieldEntries = Object.entries(concreteRetainedFields);
  words.push(retainedFieldEntries.length);
  for (const [nodeType, fields] of retainedFieldEntries) {
    words.push(requiredId(NODE_TYPE_IDS, nodeType, 'retained field node type'), fields.length);
    for (const field of fields) words.push(requiredId(FIELD_KEY_IDS, field, 'retained field'));
  }
  const ancestorFieldEntries = Object.entries(concreteAncestorFields);
  const hasAncestorPlan =
    ancestorFieldEntries.length > 0 ||
    concreteAncestorTypes.length > 0 ||
    concreteAncestorChildParentTypes.length > 0 ||
    (includeParent && ancestryDepth !== Number.POSITIVE_INFINITY);
  if (hasAncestorPlan) {
    words.push(ancestorFieldEntries.length);
    for (const [nodeType, fields] of ancestorFieldEntries) {
      words.push(requiredId(NODE_TYPE_IDS, nodeType, 'ancestor field node type'), fields.length);
      for (const field of fields) words.push(requiredId(FIELD_KEY_IDS, field, 'ancestor field'));
    }
    words.push(concreteAncestorTypes.length);
    for (const type of concreteAncestorTypes)
      words.push(requiredId(NODE_TYPE_IDS, type, 'ancestor node type'));
    words.push(concreteAncestorChildParentTypes.length);
    for (const type of concreteAncestorChildParentTypes)
      words.push(requiredId(NODE_TYPE_IDS, type, 'ancestor child parent type'));
    words.push(ancestryDepth === Number.POSITIVE_INFINITY ? 0xffffffff : ancestryDepth);
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
