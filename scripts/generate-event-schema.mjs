import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const tsCompiler = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'protocol/event-schema.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Route model shared by every emitted table. A route expands to the concrete
// node types it can deliver; carriers are the concrete types with field data.
// ---------------------------------------------------------------------------
const ALIASES = schema.aliases;
// These routes are narrowed by implicit scalar predicates rather than concrete
// node type alone, so they cannot have sound node-type-only helpers.
const PREDICATE_SPECIALIZED_ROUTES = new Set([
  'ClassDeclaration',
  'ClassExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'ReferencedIdentifier',
  'TSDeclareFunction',
]);
const expansionOf = route =>
  route === '*'
    ? schema.nodeTypes
    : (ALIASES[route] ?? (schema.nodeTypes.includes(route) ? [route] : []));

/** Normalized field rows: route -> field -> { type, optional }. */
const carrierRows = Object.fromEntries(
  Object.entries(schema.fieldTypes).map(([route, fields]) => [
    route,
    Object.fromEntries(
      Object.entries(fields).map(([key, type]) => [
        key.replace(/\?$/, ''),
        { type, optional: key.endsWith('?') },
      ]),
    ),
  ]),
);

/** Union semantics across an expansion: a field is present when any member emits
 * it, and required only when every member requires it. */
function unionRow(members) {
  const row = {};
  for (const member of members) {
    for (const [field, spec] of Object.entries(carrierRows[member] ?? {})) {
      const entry = (row[field] ??= { types: [], optional: false });
      if (!entry.types.includes(spec.type)) entry.types.push(spec.type);
      entry.optional ||= spec.optional;
    }
  }
  for (const [field, entry] of Object.entries(row)) {
    entry.optional ||= members.some(member => carrierRows[member]?.[field] == null);
  }
  return Object.fromEntries(
    Object.entries(row).map(([field, entry]) => [
      field,
      { type: entry.types.join(' | '), optional: entry.optional },
    ]),
  );
}

const routeRows = {};
for (const carrier of Object.keys(carrierRows)) routeRows[carrier] = carrierRows[carrier];
for (const alias of Object.keys(ALIASES)) routeRows[alias] = unionRow(ALIASES[alias]);
routeRows['*'] = unionRow(schema.nodeTypes);
// Collapsed function/class keys and ReferencedIdentifier compile an implicit
// native predicate (nodeKind equals / global present), so their rows narrow.
for (const key of ['FunctionDeclaration', 'FunctionExpression', 'TSDeclareFunction']) {
  routeRows[key] = {
    ...carrierRows.Function,
    nodeKind: { type: `'${key}'`, optional: false },
  };
}
for (const key of ['ClassDeclaration', 'ClassExpression']) {
  routeRows[key] = {
    ...carrierRows.Class,
    nodeKind: { type: `'${key}'`, optional: false },
  };
}
{
  const { binding: _binding, ...identifier } = carrierRows.Identifier;
  routeRows.ReferencedIdentifier = {
    ...identifier,
    global: { type: 'boolean', optional: false },
    memberWrite: { type: 'boolean', optional: false },
  };
}

/** Predicate rows mirror runtime intersection semantics: a predicate field must be
 * valid for every concrete type the route expands to. */
function predicateRow(route) {
  const members = expansionOf(route);
  if (members.length === 0) return {};
  let keys = schema.predicateFields[members[0]] ?? [];
  for (const member of members.slice(1)) {
    const memberFields = schema.predicateFields[member] ?? [];
    keys = keys.filter(field => memberFields.includes(field));
  }
  const row = {};
  for (const field of keys) {
    const types = [];
    for (const member of members) {
      const spec = routeRows[route]?.[field] ?? carrierRows[member]?.[field];
      if (spec && !types.includes(spec.type)) types.push(spec.type);
    }
    row[field] = types.join(' | ') || 'string | number | boolean | null';
  }
  return row;
}
const predicateRows = {};
for (const route of Object.keys(routeRows)) {
  const row = predicateRow(route);
  if (Object.keys(row).length > 0) predicateRows[route] = row;
}

// Runtime predicate domains preserve the same scalar compatibility guarantees for
// JavaScript consumers and callers using unsafe casts. Named literal unions are
// resolved from the version-locked @oxc-project/types declaration file.
const oxcTypesPath = path.join(root, 'node_modules/@oxc-project/types/types.d.ts');
const oxcTypesSource = tsCompiler.createSourceFile(
  oxcTypesPath,
  fs.readFileSync(oxcTypesPath, 'utf8'),
  tsCompiler.ScriptTarget.Latest,
  false,
);
const scalarAliases = new Map(
  oxcTypesSource.statements
    .filter(tsCompiler.isTypeAliasDeclaration)
    .map(declaration => [declaration.name.text, declaration.type]),
);
const astInterfaceFields = new Map(
  oxcTypesSource.statements
    .filter(tsCompiler.isInterfaceDeclaration)
    .map(declaration => [
      declaration.name.text,
      new Map(
        declaration.members
          .filter(member => tsCompiler.isPropertySignature(member) && member.type != null)
          .map(member => [
            member.name.getText(oxcTypesSource),
            member.type.getText(oxcTypesSource),
          ]),
      ),
    ]),
);
function scalarDomain(node, seen = new Set()) {
  if (tsCompiler.isUnionTypeNode(node)) {
    const members = node.types.map(member => scalarDomain(member, seen));
    const kinds = [...new Set(members.flatMap(member => member.kinds))];
    const values = members.every(member => member.values != null)
      ? [...new Set(members.flatMap(member => member.values))]
      : null;
    return { kinds, values };
  }
  if (tsCompiler.isLiteralTypeNode(node)) {
    const literal = node.literal;
    if (tsCompiler.isStringLiteral(literal)) return { kinds: ['string'], values: [literal.text] };
    if (tsCompiler.isNumericLiteral(literal))
      return { kinds: ['number'], values: [Number(literal.text)] };
    if (literal.kind === tsCompiler.SyntaxKind.TrueKeyword)
      return { kinds: ['boolean'], values: [true] };
    if (literal.kind === tsCompiler.SyntaxKind.FalseKeyword)
      return { kinds: ['boolean'], values: [false] };
    if (literal.kind === tsCompiler.SyntaxKind.NullKeyword)
      return { kinds: ['null'], values: [null] };
  }
  const primitiveKinds = new Map([
    [tsCompiler.SyntaxKind.StringKeyword, 'string'],
    [tsCompiler.SyntaxKind.NumberKeyword, 'number'],
    [tsCompiler.SyntaxKind.BooleanKeyword, 'boolean'],
  ]);
  const primitive = primitiveKinds.get(node.kind);
  if (primitive != null) return { kinds: [primitive], values: null };
  if (tsCompiler.isTypeReferenceNode(node) && tsCompiler.isIdentifier(node.typeName)) {
    const name = node.typeName.text;
    const alias = scalarAliases.get(name);
    if (alias != null && !seen.has(name)) return scalarDomain(alias, new Set(seen).add(name));
  }
  throw new Error(`cannot derive runtime scalar domain for ${node.getText(oxcTypesSource)}`);
}
function domainForType(type) {
  const source = tsCompiler.createSourceFile(
    'predicate-domain.ts',
    `type PredicateDomain = ${type};`,
    tsCompiler.ScriptTarget.Latest,
    false,
  );
  return scalarDomain(source.statements[0].type);
}
const predicateValueDomains = Object.fromEntries(
  Object.entries(carrierRows).map(([route, fields]) => [
    route,
    Object.fromEntries(
      Object.entries(fields).map(([field, spec]) => {
        const domain = domainForType(spec.type);
        return [
          field,
          {
            kinds: domain.kinds,
            ...(domain.values == null ? {} : { values: domain.values }),
          },
        ];
      }),
    ),
  ]),
);

/** Child-role rows: concrete types from the authored table; alias and collapsed
 * routes take the intersection of their expansion members' roles. */
function childRow(route) {
  const members = expansionOf(route);
  if (members.length === 0) return {};
  const first = schema.childRoles[members[0]];
  if (first == null) return {};
  const row = {};
  for (const [role, declaration] of Object.entries(first)) {
    const declarations = [declaration];
    let shared = true;
    for (const member of members.slice(1)) {
      const other = schema.childRoles[member]?.[role];
      if (other == null) {
        shared = false;
        break;
      }
      declarations.push(other);
    }
    if (!shared) continue;
    const childTypes = [
      ...new Set(declarations.flatMap(entry => entry.routes.flatMap(expansionOf))),
    ];
    const listFlags = [...new Set(declarations.map(entry => entry.list))];
    row[role] = {
      childTypes,
      list: listFlags.length === 1 ? listFlags[0] : 'mixed',
    };
  }
  return row;
}
const childRows = {};
for (const route of [...Object.keys(schema.childRoles), ...Object.keys(ALIASES)]) {
  const row = childRow(route);
  if (Object.keys(row).length > 0) childRows[route] = row;
}

// Child-role protocol ids are global, deterministic ids for concrete
// `(parent type, public role)` pairs. Sorting makes the wire identity independent
// of JSON object insertion order while keeping the authored schema readable.
const concreteChildRoleEntries = Object.entries(schema.childRoles)
  .flatMap(([parentType, roles]) =>
    Object.entries(roles).map(([role, declaration]) => ({
      parentType,
      role,
      declaration,
    })),
  )
  .sort(
    (left, right) =>
      (left.parentType < right.parentType ? -1 : left.parentType > right.parentType ? 1 : 0) ||
      (left.role < right.role ? -1 : left.role > right.role ? 1 : 0),
  )
  .map((entry, index) => ({ ...entry, id: index + 1 }));
const childRoleIdByPair = new Map(
  concreteChildRoleEntries.map(entry => [`${entry.parentType}\0${entry.role}`, entry.id]),
);
const childRoleNativeEntries = concreteChildRoleEntries.map(entry => {
  const key = `${entry.parentType}.${entry.role}`;
  const override = schema.childRoleNative?.[key] ?? {};
  const edgeOverrides = override.edges ?? [
    { field: override.field ?? entry.role, shape: override.shape },
  ];
  if (edgeOverrides.length === 0)
    throw new Error(`child role ${key} must declare at least one native edge`);
  const edges = edgeOverrides.map(edge => {
    const type = astInterfaceFields.get(entry.parentType)?.get(edge.field);
    const shape =
      edge.shape ??
      (type == null
        ? null
        : /\bArray\s*</.test(type) || /\[\]$/.test(type)
          ? 'list'
          : /\bnull\b/.test(type)
            ? 'optional'
            : 'single');
    if (shape == null)
      throw new Error(
        `child role ${key} native edge ${edge.field} has no field shape; add childRoleNative metadata`,
      );
    if (!['single', 'optional', 'list', 'optionalList', 'listOptionalItems'].includes(shape))
      throw new Error(`child role ${key} has invalid native shape ${JSON.stringify(shape)}`);
    return { field: edge.field, shape };
  });
  return {
    ...entry,
    edges,
    projection: override.projection ?? null,
    cardinality: entry.declaration.list
      ? 'list'
      : edges[0].shape === 'optional'
        ? 'optional'
        : 'single',
  };
});
const childRoleNativeByPair = new Map(
  childRoleNativeEntries.map(entry => [`${entry.parentType}\0${entry.role}`, entry]),
);

// ---------------------------------------------------------------------------
// Rust output
// ---------------------------------------------------------------------------
function rustMatch(name, values) {
  const arms = values
    .map((value, index) => `        ${JSON.stringify(value)} => ${index + 1},`)
    .join('\n');
  return `pub(crate) fn ${name}(value: &str) -> Option<u32> {\n    Some(match value {\n${arms}\n        _ => return None,\n    })\n}\n`;
}

const rustReverse = `pub(crate) fn node_type_name(value: u32) -> Option<&'static str> {\n    Some(match value {\n${schema.nodeTypes.map((value, index) => `        ${index + 1} => ${JSON.stringify(value)},`).join('\n')}\n        _ => return None,\n    })\n}\n`;
const rustFieldReverse = `pub(crate) fn field_key_name(value: u32) -> Option<&'static str> {\n    Some(match value {\n${schema.fieldKeys.map((value, index) => `        ${index + 1} => ${JSON.stringify(value)},`).join('\n')}\n        _ => return None,\n    })\n}\n`;
const rustAstKind = `pub(crate) fn ast_kind_protocol_id(kind: oxc_ast::AstKind<'_>) -> u32 {\n    match kind {\n${Object.entries(
  schema.astKinds,
)
  .map(
    ([variant, name]) =>
      `        oxc_ast::AstKind::${variant}(..) => ${schema.nodeTypes.indexOf(name) + 1},`,
  )
  .join('\n')}\n    }\n}\n`;
const rustPredicateFields = `pub(crate) fn predicate_field_supported(node_type_id: u32, field_id: u32) -> bool {\n    matches!(\n        (node_type_id, field_id),\n        ${Object.entries(
  schema.predicateFields,
)
  .flatMap(([node, fields]) =>
    fields.map(
      field => `(${schema.nodeTypes.indexOf(node) + 1}, ${schema.fieldKeys.indexOf(field) + 1})`,
    ),
  )
  .join('\n            | ')}\n    )\n}\n`;
const aliasArms = Object.entries(ALIASES)
  .map(([alias, expansion]) => {
    const members = expansion.filter(type => type !== alias).map(type => JSON.stringify(type));
    // Match rustfmt: a single-line matches! when it fits in 100 columns.
    const singleLine = `        ${JSON.stringify(alias)} => matches!(node_type, ${members.join(' | ')}),`;
    if (singleLine.length <= 100) return singleLine;
    const multiLineMembers = members.join('\n                | ');
    const packed = `            ${members.join(' | ')}`;
    return `        ${JSON.stringify(alias)} => matches!(\n            node_type,\n${
      packed.length <= 100 ? packed : `            ${multiLineMembers}`
    }\n        ),`;
  })
  .join('\n');
const rustAliasMatches = `pub(crate) fn alias_matches(subscription: &str, node_type: &str) -> bool {\n    if subscription == "*" || subscription == node_type {\n        return true;\n    }\n    match subscription {\n${aliasArms}\n        _ => false,\n    }\n}\n`;
// Field selection happens per node in the hot collectors, so it is expressed as a
// bit per field key rather than as a name list. `FieldMask` is a `u64`, which the
// generated count is asserted to fit.
const screamingSnake = value =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toUpperCase();
const rustFieldConstants = `/// Protocol ids for every declarable field key, for compile-time field selection.\npub(crate) mod field_ids {\n${schema.fieldKeys
  .map((value, index) => `    pub(crate) const ${screamingSnake(value)}: u32 = ${index + 1};`)
  .join('\n')}\n}\n`;

const rustChildRoleId = `pub(crate) fn child_role_id(parent_type_id: u32, role: &str) -> Option<u32> {\n    Some(match (parent_type_id, role) {\n${concreteChildRoleEntries
  .map(
    entry =>
      `        (${schema.nodeTypes.indexOf(entry.parentType) + 1}, ${JSON.stringify(entry.role)}) => ${entry.id},`,
  )
  .join('\n')}\n        _ => return None,\n    })\n}\n`;
const rustChildRoleParent = `pub(crate) fn child_role_parent_type_id(role_id: u32) -> Option<u32> {\n    Some(match role_id {\n${concreteChildRoleEntries
  .map(entry => `        ${entry.id} => ${schema.nodeTypes.indexOf(entry.parentType) + 1},`)
  .join('\n')}\n        _ => return None,\n    })\n}\n`;
const rustChildRoleName = `pub(crate) fn child_role_name(role_id: u32) -> Option<&'static str> {\n    Some(match role_id {\n${concreteChildRoleEntries
  .map(entry => `        ${entry.id} => ${JSON.stringify(entry.role)},`)
  .join('\n')}\n        _ => return None,\n    })\n}\n`;
const rustChildRoleParentHasRoles = `pub(crate) fn child_role_parent_has_roles(parent_type_id: u32) -> bool {\n    matches!(parent_type_id, ${[
  ...new Set(concreteChildRoleEntries.map(entry => schema.nodeTypes.indexOf(entry.parentType) + 1)),
].join(' | ')})\n}\n`;
const projectedRoleIds = childRoleNativeEntries
  .filter(entry => entry.projection === 'formalParameters')
  .map(entry => entry.id);
const rustChildRoleProjection = `pub(crate) fn child_role_projects_formal_parameters(role_id: u32) -> bool {\n    matches!(role_id, ${projectedRoleIds.join(' | ')})\n}\n`;
const rustChildRoleCardinality = `pub(crate) fn child_role_cardinality(role_id: u32) -> Option<u8> {\n    Some(match role_id {\n${childRoleNativeEntries
  .map(
    entry =>
      `        ${entry.id} => ${entry.cardinality === 'single' ? 0 : entry.cardinality === 'optional' ? 1 : 2},`,
  )
  .join('\n')}\n        _ => return None,\n    })\n}\n`;
const rustIntegerPattern = values => {
  const sorted = [...new Set(values)].sort((left, right) => left - right);
  const parts = [];
  for (let start = 0; start < sorted.length;) {
    let end = start;
    while (end + 1 < sorted.length && sorted[end + 1] === sorted[end] + 1) end++;
    const length = end - start + 1;
    if (length >= 3) parts.push(`${sorted[start]}..=${sorted[end]}`);
    else for (let index = start; index <= end; index++) parts.push(String(sorted[index]));
    start = end + 1;
  }
  return parts.join(' | ');
};
const rustChildRoleForEdge = `pub(crate) fn child_role_id_for_edge(parent: oxc_ast::AstKind<'_>, child: oxc_ast::AstKind<'_>) -> Option<u32> {\n    let child_id = child.node_id();\n    match parent {\n${Object.entries(
  Object.groupBy(childRoleNativeEntries, entry => entry.parentType),
)
  .map(([parentType, entries]) => {
    const variant = Object.entries(schema.astKinds).find(
      ([, publicType]) => publicType === parentType,
    )?.[0];
    if (variant == null) throw new Error(`child role parent ${parentType} has no AstKind variant`);
    const edgeEntries = entries.flatMap(entry => entry.edges.map(edge => ({ entry, edge })));
    const listEntries = edgeEntries.filter(({ edge }) =>
      ['list', 'optionalList', 'listOptionalItems'].includes(edge.shape),
    );
    for (let index = 0; index < listEntries.length; index++) {
      const left = listEntries[index].entry;
      const leftTypes = new Set(left.declaration.routes.flatMap(expansionOf));
      for (const { entry: right } of listEntries.slice(index + 1)) {
        const overlap = right.declaration.routes
          .flatMap(expansionOf)
          .filter(type => leftTypes.has(type));
        if (overlap.length > 0)
          throw new Error(
            `child roles ${parentType}.${left.role} and ${parentType}.${right.role} have ambiguous native list child types: ${overlap.join(', ')}`,
          );
      }
    }
    const checks = edgeEntries
      // Exact scalar fields must win when their public types overlap a list role,
      // such as CallExpression.callee and CallExpression.arguments.
      .sort(
        (left, right) =>
          Number(['list', 'optionalList', 'listOptionalItems'].includes(left.edge.shape)) -
          Number(['list', 'optionalList', 'listOptionalItems'].includes(right.edge.shape)),
      )
      .map(({ entry, edge }) => {
        const access = `parent.${edge.field}`;
        const listTypeIds = [
          ...new Set(
            entry.declaration.routes
              .flatMap(expansionOf)
              .map(type => schema.nodeTypes.indexOf(type) + 1)
              .filter(id => id > 0),
          ),
        ];
        const matches = ['list', 'optionalList', 'listOptionalItems'].includes(edge.shape)
          ? `matches!(ast_kind_protocol_id(child), ${rustIntegerPattern(listTypeIds)})`
          : edge.shape === 'optional'
            ? `${access}.as_ref().is_some_and(|edge| edge.node_id() == child_id)`
            : `${access}.node_id() == child_id`;
        return `            if ${matches} { return Some(${entry.id}); }`;
      })
      .join('\n');
    const parentBinding = edgeEntries.some(({ edge }) =>
      ['single', 'optional'].includes(edge.shape),
    )
      ? 'parent'
      : '_parent';
    return `        oxc_ast::AstKind::${variant}(${parentBinding}) => {\n${checks}\n            None\n        }`;
  })
  .join('\n')}\n        _ => None,\n    }\n}\n`;

const rust = `// Generated by scripts/generate-event-schema.mjs. Do not edit.\n\npub(crate) const NODE_TYPE_COUNT: usize = ${schema.nodeTypes.length};\npub(crate) const FIELD_KEY_COUNT: usize = ${schema.fieldKeys.length};\npub(crate) const CHILD_ROLE_COUNT: usize = ${concreteChildRoleEntries.length};\nconst _: () = assert!(FIELD_KEY_COUNT < 64, "field keys must fit a FieldMask");\n\n${rustMatch('node_type_id', schema.nodeTypes)}\n${rustReverse}\n${rustMatch('field_key_id', schema.fieldKeys)}\n${rustFieldReverse}\n${rustFieldConstants}\n${rustChildRoleId}\n${rustChildRoleParent}\n${rustChildRoleName}\n${rustChildRoleParentHasRoles}\n${rustChildRoleProjection}\n${rustChildRoleCardinality}\n${rustChildRoleForEdge}\n${rustPredicateFields}\n${rustAliasMatches}\n${rustAstKind}`;

const formattedRust = execFileSync('rustfmt', ['--edition', '2024', '--emit', 'stdout'], {
  cwd: root,
  encoding: 'utf8',
  input: rust,
});

// ---------------------------------------------------------------------------
// TypeScript output
// ---------------------------------------------------------------------------
const namedImports = [
  ...new Set(
    Object.values(schema.fieldTypes).flatMap(fields =>
      Object.values(fields).flatMap(type => type.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? []),
    ),
  ),
].sort();

const renderRow = row =>
  Object.entries(row)
    .map(([field, spec]) => `    readonly ${field}${spec.optional ? '?' : ''}: ${spec.type};`)
    .join('\n');
const renderInterface = (name, rows, renderValue) =>
  `export interface ${name} {\n${Object.entries(rows)
    .map(([route, row]) => `  ${JSON.stringify(route)}: ${renderValue(row)};`)
    .join('\n')}\n}\n`;
const objectRow = row => `{\n${renderRow(row)}\n  }`;
const literalUnion = values => values.map(value => JSON.stringify(value)).join(' | ');

const tsRouteTypes = `export interface NativeRouteTypes {\n${[
  ...Object.entries(ALIASES).map(
    ([alias, expansion]) => `  ${JSON.stringify(alias)}: ${literalUnion(expansion)};`,
  ),
  `  '*': NativeNodeType;`,
].join('\n')}\n}\n`;

// Routes whose row equals their carrier row resolve through the type-level
// fallback onto NativeNodeFields; only divergent rows are emitted. A carrier
// name diverges only when it doubles as an alias (`Function`).
const divergesFromCarrier = route =>
  !(route in carrierRows) || expansionOf(route).join('|') !== route;
const pickDivergent = rows =>
  Object.fromEntries(Object.entries(rows).filter(([route]) => divergesFromCarrier(route)));

const tsNodeFields = renderInterface('NativeNodeFields', carrierRows, objectRow);
const tsRouteFields = renderInterface('NativeRouteFields', pickDivergent(routeRows), objectRow);
const tsRoutePredicates = renderInterface(
  'NativeRoutePredicates',
  pickDivergent(predicateRows),
  row =>
    `{\n${Object.entries(row)
      .map(([field, type]) => `    readonly ${field}: ${type};`)
      .join('\n')}\n  }`,
);
const tsChildRoles = renderInterface(
  'NativeChildRoles',
  childRows,
  row =>
    `{\n${Object.entries(row)
      .map(
        ([role, spec]) =>
          `    readonly ${JSON.stringify(role)}: { readonly child: ${literalUnion(spec.childTypes)}; readonly list: ${
            spec.list === 'mixed' ? 'boolean' : spec.list
          } };`,
      )
      .join('\n')}\n  }`,
);

const runtimeChildRoles = Object.fromEntries(
  Object.entries(schema.childRoles).map(([type, roles]) => [
    type,
    Object.fromEntries(
      Object.entries(roles).map(([role, declaration]) => [
        role,
        {
          id: childRoleIdByPair.get(`${type}\0${role}`),
          cardinality: childRoleNativeByPair.get(`${type}\0${role}`).cardinality,
          native: {
            edges: childRoleNativeByPair.get(`${type}\0${role}`).edges,
            projection: childRoleNativeByPair.get(`${type}\0${role}`).projection,
          },
          types: [...new Set(declaration.routes.flatMap(expansionOf))],
          list: declaration.list,
        },
      ]),
    ),
  ]),
);

const unformattedTs = `// Generated by scripts/generate-event-schema.mjs. Do not edit.

import type { ${namedImports.join(', ')} } from '@oxc-project/types';

export const NODE_TYPES = ${JSON.stringify(['', ...schema.nodeTypes])} as const;
export type NativeNodeType = Exclude<(typeof NODE_TYPES)[number], ''>;
export const NODE_TYPE_IDS = new Map<string, number>(NODE_TYPES.map((value, index) => [value, index]));
export const FIELD_KEYS = ${JSON.stringify(['', ...schema.fieldKeys])} as const;
export type NativeFieldKey = Exclude<(typeof FIELD_KEYS)[number], ''>;
export const FIELD_KEY_IDS = new Map<string, number>(FIELD_KEYS.map((value, index) => [value, index]));
export const PREDICATE_FIELDS: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(schema.predicateFields)};
/** Runtime scalar domains for predicate validation, generated from the same
 * field types that drive RouteWhere. */
export const PREDICATE_VALUE_DOMAINS: Readonly<
  Record<string, Readonly<Record<string, {
    readonly kinds: readonly ('string' | 'number' | 'boolean' | 'null')[];
    readonly values?: readonly (string | number | boolean | null)[];
  }>>>
> = ${JSON.stringify(predicateValueDomains)};
/** Alias route expansions: every concrete node type an alias route delivers.
 * Aliases that shadow a concrete type (\`Function\`) include it. */
export const ALIAS_EXPANSIONS: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(ALIASES)};
/** Child roles per concrete node type: the concrete types a declared child
 * contract may claim for the role, and whether the role selects a list. */
export const CHILD_ROLES: Readonly<
  Record<string, Readonly<Record<string, {
    readonly id: number;
    readonly cardinality: 'single' | 'optional' | 'list';
    readonly types: readonly string[];
    readonly list: boolean;
    readonly native: {
      readonly edges: readonly {
        readonly field: string;
        readonly shape: 'single' | 'optional' | 'list' | 'optionalList' | 'listOptionalItems';
      }[];
      readonly projection: string | null;
    };
  }>>>
> = ${JSON.stringify(runtimeChildRoles)};
export const CHILD_ROLE_COUNT = ${concreteChildRoleEntries.length};
export const CHILD_ROLE_BY_ID: ReadonlyArray<
  | undefined
  | { readonly parentType: NativeNodeType; readonly role: string; readonly list: boolean; readonly cardinality: 'single' | 'optional' | 'list' }
> = ${JSON.stringify([
  '__CHILD_ROLE_SENTINEL__',
  ...concreteChildRoleEntries.map(entry => ({
    parentType: entry.parentType,
    role: entry.role,
    list: entry.declaration.list,
    cardinality: childRoleNativeByPair.get(`${entry.parentType}\0${entry.role}`).cardinality,
  })),
]).replace('"__CHILD_ROLE_SENTINEL__"', 'undefined')};
/** Concrete expansions of alias routes as literal unions. Concrete routes expand
 * to themselves and are resolved structurally by consumers. */
${tsRouteTypes}
/** Wire field value types per concrete node type. */
${tsNodeFields}
/** Wire field value types for routes that diverge from their concrete carrier:
 * alias routes with union semantics across their expansion and implicit-predicate
 * specializations. Concrete routes resolve through NativeNodeFields. */
${tsRouteFields}
/** Native predicate fields for routes that diverge from their concrete carrier,
 * with runtime intersection semantics: a predicate must be valid for every
 * concrete type in the route's expansion. Concrete routes resolve through
 * NativeNodeFields with optionality stripped (their predicate fields and field
 * types coincide by schema validation). */
${tsRoutePredicates}
/** Statically declarable child roles per route (intersection across expansions). */
${tsChildRoles}`;
const ts = execFileSync('pnpm', ['exec', 'oxfmt', '--stdin-filepath', 'event-schema.ts'], {
  cwd: root,
  encoding: 'utf8',
  input: unformattedTs,
});

const typeOnlyAliases = Object.entries(ALIASES).filter(
  ([route]) => !PREDICATE_SPECIALIZED_ROUTES.has(route),
);
const predicateName = route => `is${route}`;
const typePredicateName = route => `${predicateName(route)}Type`;
const predicateCases = members =>
  members.map(member => `    case ${JSON.stringify(member)}:`).join('\n');
const unformattedPredicatesTs = `// Generated by scripts/generate-event-schema.mjs. Do not edit.

import type { NativeNodeType, NativeRouteTypes } from './event-schema';

export interface NodeTypeLike {
  readonly type: string;
}

export type NodeTypeRoute = NativeNodeType | ${literalUnion(typeOnlyAliases.map(([route]) => route))};
export type NodeTypeForRoute<Route extends NodeTypeRoute> =
  Route extends keyof NativeRouteTypes ? NativeRouteTypes[Route] : Route;

/** Generic route matcher for dynamic or uncommon checks. Prefer the generated
 * specialized predicates below in hot paths. */
export function isNodeType<Node extends NodeTypeLike, Route extends NodeTypeRoute>(
  node: Node,
  route: Route,
): node is Node & { readonly type: NodeTypeForRoute<Route> } {
  switch (route) {
${typeOnlyAliases
  .map(
    ([route]) =>
      `    case ${JSON.stringify(route)}:\n      return ${typePredicateName(route)}(node.type);`,
  )
  .join('\n')}
    default:
      return node.type === route;
  }
}

${typeOnlyAliases
  .map(
    ([route, members]) => `export function ${typePredicateName(route)}(
  type: string,
): type is NativeRouteTypes[${JSON.stringify(route)}] {
  switch (type) {
${predicateCases(members)}
      return true;
    default:
      return false;
  }
}

export function ${predicateName(route)}<Node extends NodeTypeLike>(
  node: Node,
): node is Node & { readonly type: NativeRouteTypes[${JSON.stringify(route)}] } {
  return ${typePredicateName(route)}(node.type);
}`,
  )
  .join('\n\n')}
`;
const predicatesTs = execFileSync(
  'pnpm',
  ['exec', 'oxfmt', '--stdin-filepath', 'node-predicates.ts'],
  { cwd: root, encoding: 'utf8', input: unformattedPredicatesTs },
);

const outputs = [
  [path.join(root, 'src/generated/event_schema.rs'), formattedRust],
  [path.join(root, 'js/generated/event-schema.ts'), ts],
  [path.join(root, 'js/generated/node-predicates.ts'), predicatesTs],
];
if (process.argv[2] === '--check') {
  for (const [filename, expected] of outputs) {
    if (!fs.existsSync(filename) || fs.readFileSync(filename, 'utf8') !== expected) {
      throw new Error(`${path.relative(root, filename)} is stale; run pnpm codegen`);
    }
  }
} else {
  for (const [filename, contents] of outputs) fs.writeFileSync(filename, contents);
}
