import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(
  execFileSync('cargo', ['metadata', '--format-version', '1'], { cwd: root, encoding: 'utf8' }),
);
const oxc = metadata.packages.find(pkg => pkg.name === 'oxc_ast');
if (!oxc) throw new Error('cargo metadata did not contain oxc_ast');

// ---------------------------------------------------------------------------
// Version parity: the npm types package is generated from the same ast_tools as
// the oxc_ast crate and versioned in lockstep. Bump both in one commit, then run
// `pnpm codegen`.
// ---------------------------------------------------------------------------
const typesPackage = JSON.parse(
  fs.readFileSync(path.join(root, 'node_modules/@oxc-project/types/package.json'), 'utf8'),
);
const declaredPin = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  .dependencies?.['@oxc-project/types'];
if (typesPackage.version !== oxc.version)
  throw new Error(
    `@oxc-project/types@${typesPackage.version} does not match oxc_ast@${oxc.version}; ` +
      'bump the Cargo pin and the npm pin in one commit, then run pnpm codegen',
  );
if (declaredPin !== oxc.version)
  throw new Error(
    `package.json pins @oxc-project/types as ${JSON.stringify(declaredPin)}; ` +
      `pin it exactly to ${oxc.version} (no range)`,
  );

const source = fs.readFileSync(
  path.join(path.dirname(oxc.manifest_path), 'src/generated/ast_kind.rs'),
  'utf8',
);
const body = /pub enum AstType \{([\s\S]*?)\n\}/.exec(source)?.[1];
if (!body) throw new Error('Could not read Oxc AstType variants');
const variants = [...body.matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*=\s*\d+,/gm)].map(
  match => match[1],
);
const publicName = variant =>
  variant === 'IdentifierName' ||
  variant === 'IdentifierReference' ||
  variant === 'BindingIdentifier'
    ? 'Identifier'
    : variant;
const nodeTypes = [...new Set(variants.map(publicName))];
const nodeTypeSet = new Set(nodeTypes);

// ---------------------------------------------------------------------------
// Alias expansions, computed over the current node-type list with the same rules
// the runtime historically used. This is the single authored copy: the TypeScript
// runtime table, the type-level expansions, and the Rust dispatch matcher are all
// generated from the `aliases` section this writes.
// ---------------------------------------------------------------------------
const isDeclarationType = type =>
  type.endsWith('Declaration') || type === 'Function' || type === 'Class';
const isLiteralExpressionType = type =>
  [
    'Identifier',
    'StringLiteral',
    'NumericLiteral',
    'BooleanLiteral',
    'BigIntLiteral',
    'RegExpLiteral',
    'NullLiteral',
    'TemplateLiteral',
  ].includes(type);
const ALIAS_RULES = {
  Function: type =>
    type === 'Function' ||
    type === 'ArrowFunctionExpression' ||
    type.endsWith('FunctionDeclaration') ||
    type.endsWith('FunctionExpression'),
  Statement: type => type.endsWith('Statement') || isDeclarationType(type),
  Declaration: isDeclarationType,
  Expression: type => type.endsWith('Expression') || isLiteralExpressionType(type),
  MemberExpression: type =>
    type === 'StaticMemberExpression' ||
    type === 'ComputedMemberExpression' ||
    type === 'PrivateFieldExpression',
  MetaProperty: type => type === 'ImportMeta' || type === 'NewTarget',
  ReferencedIdentifier: type => type === 'Identifier',
  FunctionDeclaration: type => type === 'Function',
  FunctionExpression: type => type === 'Function',
  TSDeclareFunction: type => type === 'Function',
  ClassDeclaration: type => type === 'Class',
  ClassExpression: type => type === 'Class',
};
const aliases = Object.fromEntries(
  Object.entries(ALIAS_RULES).map(([alias, matches]) => [alias, nodeTypes.filter(matches)]),
);
for (const [alias, expansion] of Object.entries(aliases))
  if (expansion.length === 0) throw new Error(`alias ${alias} expands to no node types`);

// ---------------------------------------------------------------------------
// @oxc-project/types extraction: exported interfaces (keyed by interface name,
// which equals the AstType variant name) and exported scalar type aliases. The
// `type` strings inside interfaces describe the ESTree serialization and are
// deliberately ignored; `parent?` back-references likewise.
// ---------------------------------------------------------------------------
const typesDtsPath = path.join(root, 'node_modules/@oxc-project/types/types.d.ts');
const typesDts = ts.createSourceFile(
  typesDtsPath,
  fs.readFileSync(typesDtsPath, 'utf8'),
  ts.ScriptTarget.Latest,
  false,
);
/** interface name -> Map(property name -> { text, optional }) */
const astInterfaces = new Map();
/** type alias name -> type node */
const astAliases = new Map();
for (const statement of typesDts.statements) {
  if (ts.isInterfaceDeclaration(statement)) {
    const members = new Map();
    for (const member of statement.members) {
      if (!ts.isPropertySignature(member) || member.type == null) continue;
      const name = member.name.getText(typesDts);
      if (name === 'parent' || name === 'type') continue;
      members.set(name, {
        text: member.type.getText(typesDts).replace(/\s+/g, ' '),
        node: member.type,
        optional: member.questionToken != null,
      });
    }
    astInterfaces.set(statement.name.text, members);
  } else if (ts.isTypeAliasDeclaration(statement)) {
    astAliases.set(statement.name.text, statement.type);
  }
}
/** A type node is scalar-ish when it only mentions literals, string/number/boolean
 * keywords, and references to scalar-ish aliases: the shapes a wire field can mirror. */
function isScalarType(node, seen = new Set()) {
  if (ts.isUnionTypeNode(node)) return node.types.every(type => isScalarType(type, seen));
  if (ts.isLiteralTypeNode(node)) return true;
  if (
    node.kind === ts.SyntaxKind.StringKeyword ||
    node.kind === ts.SyntaxKind.NumberKeyword ||
    node.kind === ts.SyntaxKind.BooleanKeyword
  )
    return true;
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    const alias = astAliases.get(node.typeName.text);
    if (alias == null || seen.has(node.typeName.text)) return false;
    return isScalarType(alias, new Set(seen).add(node.typeName.text));
  }
  return false;
}

// ---------------------------------------------------------------------------
// Hand-authored schema sections, preserved across syncs and validated here.
// ---------------------------------------------------------------------------
const schemaFile = path.join(root, 'protocol/event-schema.json');
const previous = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
const { predicateFields, fieldKeys, fieldTypes, childRoles } = previous;
if (fieldTypes == null || childRoles == null)
  throw new Error('protocol/event-schema.json is missing hand-authored fieldTypes/childRoles');

const aliasNames = new Set(Object.keys(aliases));
const isRouteName = name => name === '*' || nodeTypeSet.has(name) || aliasNames.has(name);

// fieldTypes must cover exactly the predicateFields surface, and every referenced
// named type must still be exported by @oxc-project/types.
const fieldTypeEntries = new Map(
  Object.entries(fieldTypes).map(([route, fields]) => [
    route,
    new Map(
      Object.entries(fields).map(([key, type]) => [
        key.replace(/\?$/, ''),
        { type, optional: key.endsWith('?') },
      ]),
    ),
  ]),
);
for (const [route, fields] of Object.entries(predicateFields)) {
  const declared = fieldTypeEntries.get(route);
  if (!declared) throw new Error(`fieldTypes is missing route ${route}`);
  for (const field of fields)
    if (!declared.has(field)) throw new Error(`fieldTypes.${route} is missing ${field}`);
}
for (const [route, fields] of fieldTypeEntries) {
  const predicates = predicateFields[route];
  if (!predicates) throw new Error(`fieldTypes declares unknown route ${route}`);
  if (!nodeTypeSet.has(route))
    throw new Error(`fieldTypes route ${route} is not a concrete node type`);
  for (const [field, { type }] of fields) {
    if (!predicates.includes(field))
      throw new Error(`fieldTypes.${route}.${field} is not a declared predicate field`);
    if (!fieldKeys.includes(field))
      throw new Error(`fieldTypes.${route}.${field} is not a field key`);
    for (const reference of type.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? []) {
      if (!astAliases.has(reference) && !astInterfaces.has(reference))
        throw new Error(
          `fieldTypes.${route}.${field} references ${reference}, which @oxc-project/types does not export`,
        );
      const alias = astAliases.get(reference);
      if (alias == null || !isScalarType(alias))
        throw new Error(
          `fieldTypes.${route}.${field} references ${reference}, which is not a scalar union`,
        );
    }
  }
}

// Mirror agreement: where a wire field shares its name with a scalar AST field on
// the corresponding interface(s), the authored type must match the AST type. This
// is the drift gate for oxc upgrades; projection fields have no mirror and are
// skipped.
const variantsByRoute = new Map();
for (const variant of variants) {
  const route = publicName(variant);
  if (!variantsByRoute.has(route)) variantsByRoute.set(route, []);
  variantsByRoute.get(route).push(variant);
}
for (const [route, fields] of fieldTypeEntries) {
  for (const [field, { type }] of fields) {
    const mirrors = (variantsByRoute.get(route) ?? [])
      .map(variant => astInterfaces.get(variant)?.get(field))
      .filter(mirror => mirror != null && isScalarType(mirror.node));
    if (mirrors.length === 0) continue;
    const authored = type.replace(/\s+/g, ' ').trim();
    if (!mirrors.some(mirror => mirror.text === authored))
      throw new Error(
        `fieldTypes.${route}.${field} is ${JSON.stringify(authored)} but @oxc-project/types ` +
          `declares ${JSON.stringify(mirrors[0].text)}; reconcile and run pnpm codegen`,
      );
  }
}

// childRoles: parent types, role child routes, and cardinality shapes must stay
// well-formed against the current node-type and alias lists.
for (const [type, roles] of Object.entries(childRoles)) {
  if (!nodeTypeSet.has(type)) throw new Error(`childRoles declares unknown node type ${type}`);
  for (const [role, declaration] of Object.entries(roles)) {
    if (!Array.isArray(declaration.routes) || declaration.routes.length === 0)
      throw new Error(`childRoles.${type}.${role} needs at least one route`);
    if (typeof declaration.list !== 'boolean')
      throw new Error(`childRoles.${type}.${role} needs a boolean list flag`);
    for (const route of declaration.routes)
      if (!isRouteName(route))
        throw new Error(`childRoles.${type}.${role} references unknown route ${route}`);
  }
}

const next = `${JSON.stringify(
  {
    nodeTypes,
    astKinds: Object.fromEntries(variants.map(variant => [variant, publicName(variant)])),
    aliases,
    predicateFields,
    fieldKeys,
    fieldTypes,
    childRoles,
  },
  null,
  2,
)}\n`;
if (process.argv[2] === '--check') {
  // Compare parsed content rather than bytes: the checked-in file is rewritten by the
  // repository formatter, which changes whitespace without changing the schema.
  if (
    JSON.stringify(JSON.parse(fs.readFileSync(schemaFile, 'utf8'))) !==
    JSON.stringify(JSON.parse(next))
  )
    throw new Error('protocol/event-schema.json is stale against oxc_ast; run pnpm codegen');
} else {
  fs.writeFileSync(schemaFile, next);
}
