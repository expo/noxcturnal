// Generates the Rust view of Hermes' AST schema from `ESTree.def`.
//
// The same file drives three things that have to agree exactly: Hermes' own
// `NodeKind` enum, the serializer in `crates/hermes-parser-sys/cpp`, and the
// buffer reader in `crates/hermes-flow`. Two of those are expanded from the
// file by the C++ preprocessor; this makes the third one, so a Hermes pin bump
// that adds, removes, or reorders a node moves all three together or fails.
//
// It also emits the coverage obligation the erasure rules are checked against:
// every node type declared under `#if HERMES_PARSE_FLOW` or `#if HERMES_PARSE_TS`,
// every cover node, and every field marked `ESTREE_IGNORE_IF_EMPTY` on a node
// the plain-JavaScript grammar also produces. `hermes-flow` fails its tests
// when one of those appears with no rule and no bail — which is the guarantee a
// hand-maintained list cannot give.
//
//   node scripts/generate-estree-schema.mjs
//   node scripts/generate-estree-schema.mjs --check

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const crate = path.join(root, 'crates/hermes-parser-sys');
const hermes = process.env.HERMES_SOURCE_DIR ?? path.join(crate, 'hermes');
const definition = path.join(hermes, 'include/hermes/AST/ESTree.def');
const output = path.join(root, 'crates/hermes-flow/src/generated/estree.rs');

if (!fs.existsSync(definition)) {
  process.stderr.write(
    `no ESTree.def at ${definition}; initialize the Hermes submodule or set HERMES_SOURCE_DIR\n`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

/**
 * Configuration this build of Hermes compiles with. `AST/Config.h` turns all
 * three on unless `HERMES_IS_MOBILE_BUILD` is defined, and
 * `crates/hermes-parser-sys` does not define it. `ESTREE_DEFINE_COVER_NODES` is
 * likewise left undefined, so the cover nodes are declared — they are part of
 * the enum this has to index against, even though reaching one is a bail.
 */
const DEFINED = { HERMES_PARSE_FLOW: true, HERMES_PARSE_JSX: true, HERMES_PARSE_TS: true };

/** Which dialect a region of the file belongs to, innermost condition first. */
function dialectOf(conditions) {
  if (conditions.includes('HERMES_PARSE_FLOW')) return 'Flow';
  if (conditions.includes('HERMES_PARSE_JSX')) return 'Jsx';
  if (conditions.includes('HERMES_PARSE_TS')) return 'Ts';
  if (conditions.includes('!ESTREE_DEFINE_COVER_NODES')) return 'Cover';
  return 'Base';
}

/**
 * Reads the macro invocations in declaration order. Order is the whole point:
 * `NodeKind` is the enum expanded from this file, so an invocation's position
 * is its numeric value, sentinels included.
 */
function parseDefinition(source) {
  const invocations = [];
  const conditions = [];
  let pending = null;

  for (const rawLine of source.split('\n')) {
    // Comments can sit inside a multi-line invocation, between fields.
    const line = rawLine.replace(/\/\/.*$/, '');
    const trimmed = line.trim();

    if (pending == null && trimmed.startsWith('#')) {
      const ifMatch = /^#if(n?def)?\s+(!?)\s*([A-Za-z_][A-Za-z0-9_]*)/.exec(trimmed);
      if (ifMatch != null) {
        const [, ndef, bang, name] = ifMatch;
        const negated = (ndef === 'ndef') !== (bang === '!');
        conditions.push(negated ? `!${name}` : name);
        continue;
      }
      if (/^#else\b/.test(trimmed)) {
        const previous = conditions.pop() ?? '';
        conditions.push(previous.startsWith('!') ? previous.slice(1) : `!${previous}`);
        continue;
      }
      if (/^#endif\b/.test(trimmed)) {
        conditions.pop();
        continue;
      }
      // `#define`, `#undef`, `#include`: no bearing on the node list.
      continue;
    }

    if (pending == null) {
      const start = /^(ESTREE_[A-Z0-9_]+)\s*\(/.exec(trimmed);
      if (start == null) continue;
      // A guard body defines the macro rather than invoking it; those live
      // inside `#ifndef ESTREE_FIRST` blocks and were skipped above, but a
      // conditioned-out region still has to be skipped here.
      const skipped = conditions.some(condition =>
        condition.startsWith('!')
          ? DEFINED[condition.slice(1)] === true
          : DEFINED[condition] === false,
      );
      pending = {
        macro: start[1],
        dialect: dialectOf(conditions),
        text: '',
        depth: 0,
        skipped,
      };
    }

    for (const character of pending == null ? '' : trimmed) {
      pending.text += character;
      if (character === '(') pending.depth += 1;
      else if (character === ')') pending.depth -= 1;
      if (pending.depth === 0 && pending.text.includes('(')) break;
    }
    pending.text += ' ';

    if (pending.depth === 0 && pending.text.includes('(')) {
      if (!pending.skipped) invocations.push(pending);
      pending = null;
    }
  }

  return invocations;
}

const FIELD_TYPES = {
  NodePtr: 'Node',
  NodeList: 'List',
  NodeBoolean: 'Bool',
  NodeNumber: 'Number',
  NodeLabel: 'Label',
  NodeString: 'Label',
};

/** Splits `NAME(a, b, c)` into its trimmed arguments. */
function argumentsOf(text) {
  const open = text.indexOf('(');
  const close = text.lastIndexOf(')');
  return text
    .slice(open + 1, close)
    .split(',')
    .map(argument => argument.trim())
    .filter(argument => argument.length > 0);
}

/** Node kinds in enum order, plus the extras marked ESTREE_IGNORE_IF_EMPTY. */
function buildSchema(invocations) {
  const kinds = [];
  const extras = [];

  for (const invocation of invocations) {
    const args = argumentsOf(invocation.text);
    if (invocation.macro === 'ESTREE_FIRST') {
      kinds.push({ name: `_${args[0]}_First`, dialect: 'Sentinel', fields: [] });
      continue;
    }
    if (invocation.macro === 'ESTREE_LAST') {
      kinds.push({ name: `_${args[0]}_Last`, dialect: 'Sentinel', fields: [] });
      continue;
    }
    if (invocation.macro === 'ESTREE_IGNORE_IF_EMPTY') {
      extras.push({ node: args[0], field: args[1] });
      continue;
    }
    const count = /^ESTREE_NODE_(\d+)_ARGS$/.exec(invocation.macro);
    if (count == null) throw new Error(`unhandled macro ${invocation.macro}`);

    const [name, , ...rest] = args;
    const fields = [];
    for (let at = 0; at + 2 < rest.length + 1; at += 3) {
      const [type, field, optional] = rest.slice(at, at + 3);
      const mapped = FIELD_TYPES[type];
      if (mapped == null) throw new Error(`unhandled field type ${type} on ${name}.${field}`);
      fields.push({ name: field, type: mapped, optional: optional === 'true' });
    }
    if (fields.length !== Number(count[1])) {
      throw new Error(`${name}: ${invocation.macro} declared ${fields.length} fields`);
    }
    kinds.push({ name, dialect: invocation.dialect, fields });
  }

  const byName = new Map(kinds.map((kind, index) => [kind.name, { ...kind, index }]));
  for (const extra of extras) {
    const kind = byName.get(extra.node);
    if (kind == null) throw new Error(`ESTREE_IGNORE_IF_EMPTY names unknown node ${extra.node}`);
    const field = kind.fields.find(candidate => candidate.name === extra.field);
    if (field == null) {
      throw new Error(`ESTREE_IGNORE_IF_EMPTY names unknown field ${extra.node}.${extra.field}`);
    }
    field.extra = true;
  }

  return kinds;
}

const kinds = buildSchema(parseDefinition(fs.readFileSync(definition, 'utf8')));

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

/** `JSXOpeningElement` -> `JSX_OPENING_ELEMENT`, `SHBuiltin` -> `SH_BUILTIN`. */
const screamingSnake = name =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toUpperCase();

const rustString = value => `"${value}"`;

const kindConstants = kinds
  .map((kind, index) => [kind, index])
  .filter(([kind]) => kind.dialect !== 'Sentinel')
  .map(([kind, index]) => `    pub const ${screamingSnake(kind.name)}: u32 = ${index};`)
  .join('\n');

const kindRows = kinds
  .map(kind => {
    const fields = kind.fields
      .map(
        field =>
          `Field { name: ${rustString(field.name)}, ty: FieldType::${field.type}, ` +
          `optional: ${field.optional}, extra: ${field.extra === true} }`,
      )
      .join(', ');
    return (
      `    NodeKind { name: ${rustString(kind.name)}, ` +
      `dialect: Dialect::${kind.dialect}, fields: &[${fields}] },`
    );
  })
  .join('\n');

const kindsOfDialect = dialect =>
  kinds
    .map((kind, index) => [kind, index])
    .filter(([kind]) => kind.dialect === dialect)
    .map(([, index]) => index);

const optionalExtras = kinds
  .flatMap((kind, index) =>
    kind.fields
      .filter(field => field.extra === true)
      .map(field => ({ index, dialect: kind.dialect, field: field.name })),
  )
  // A field on a node the plain grammar never produces needs no separate rule:
  // it disappears with its owner. The obligation is the boundary where Flow
  // attaches to value syntax.
  .filter(entry => entry.dialect === 'Base' || entry.dialect === 'Jsx');

// `ESTREE_IGNORE_IF_EMPTY` catches Flow attachments that are nodes or lists,
// because the JavaScript ESTree layer omits exactly those. It does not catch
// the scalar ones — `ClassProperty.declare`, `ImportDeclaration.importKind`,
// `ExportAllDeclaration.exportKind` are all Flow-bearing and unmarked. A scalar
// has no span, so it can only ever be handled by a rule that names it; that
// makes "every scalar field on a value node" a small, complete second
// obligation rather than a vocabulary someone guessed at.
const scalarFields = kinds.flatMap((kind, index) =>
  kind.dialect === 'Base' || kind.dialect === 'Jsx'
    ? kind.fields
        .filter(field => field.type !== 'Node' && field.type !== 'List')
        .map(field => ({ index, field: field.name }))
    : [],
);

const list = values => values.join(', ');

const rust = `// Generated by scripts/generate-estree-schema.mjs. Do not edit.
//
// Expanded from the Hermes submodule's \`include/hermes/AST/ESTree.def\`, with
// \`HERMES_PARSE_FLOW\`, \`HERMES_PARSE_JSX\`, and \`HERMES_PARSE_TS\` all on and cover
// nodes declared, matching how that crate compiles Hermes.

/// How a field is encoded in the serialized buffer. See
/// \`crates/hermes-parser-sys/cpp/hermes_flow_shim.h\` for the wire format.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FieldType {
    /// A nested node, or one zero word when null.
    Node,
    /// A count followed by that many nodes.
    List,
    /// One word, 0 or 1.
    Bool,
    /// Two words of \`f64\` bits.
    Number,
    /// A length and the bytes, or \`NULL_LABEL\`. Covers \`NodeString\` too.
    Label,
}

/// Which grammar declares a node. Everything but \`Base\` and \`Jsx\` is a bail
/// candidate: Flow and TS nodes are type syntax, and reaching a cover node
/// means the parser handed back a shape that should not survive to a finished
/// AST.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Dialect {
    Base,
    Flow,
    Jsx,
    Ts,
    Cover,
    /// A range marker in the enum rather than a node: \`_Statement_First\`.
    Sentinel,
}

#[derive(Debug, Clone, Copy)]
pub struct Field {
    pub name: &'static str,
    pub ty: FieldType,
    /// Declared optional in \`ESTree.def\`.
    pub optional: bool,
    /// Marked \`ESTREE_IGNORE_IF_EMPTY\`: a field the plain-JavaScript grammar
    /// has no production for. On a \`Base\` or \`Jsx\` node that is exactly the
    /// boundary where Flow attaches to value syntax, so every one of them owes
    /// the rules an explicit disposition.
    pub extra: bool,
}

#[derive(Debug, Clone, Copy)]
pub struct NodeKind {
    pub name: &'static str,
    pub dialect: Dialect,
    /// In declaration order, which is serialization order.
    pub fields: &'static [Field],
}

pub const NODE_KIND_COUNT: usize = ${kinds.length};

/// Indexed by raw \`hermes::ESTree::NodeKind\`. The buffer stores kind + 1 so
/// that zero can mean a null node pointer.
#[rustfmt::skip]
pub static NODE_KINDS: [NodeKind; NODE_KIND_COUNT] = [
${kindRows}
];

/// Node kinds declared inside \`#if HERMES_PARSE_FLOW\`.
pub static FLOW_KINDS: &[u32] = &[${list(kindsOfDialect('Flow'))}];

/// Node kinds declared inside \`#if HERMES_PARSE_TS\`.
pub static TS_KINDS: &[u32] = &[${list(kindsOfDialect('Ts'))}];

/// Cover-grammar node kinds.
pub static COVER_KINDS: &[u32] = &[${list(kindsOfDialect('Cover'))}];

/// \`(kind, field)\` pairs marked \`ESTREE_IGNORE_IF_EMPTY\` on a node the plain
/// JavaScript or JSX grammar also produces — the attachment points where Flow
/// meets value syntax, plus a few unrelated markers such as decorators. The
/// rule table must dispose of every one of these.
#[rustfmt::skip]
pub static OPTIONAL_EXTRAS: &[(u32, &str)] = &[
${optionalExtras.map(entry => `    (${entry.index}, ${rustString(entry.field)}),`).join('\n')}
];

/// Every scalar field on a node the plain JavaScript or JSX grammar produces.
/// A scalar carries no span, so no generic walk can erase one — only a rule
/// that names it can. Most are ordinary value syntax and the rules dispose of
/// them as such; the point is that the list is exhaustive, so a Flow-bearing
/// scalar added by a Hermes bump cannot slip through unnoticed the way
/// \`ClassProperty.declare\` would have.
#[rustfmt::skip]
pub static SCALAR_FIELDS: &[(u32, &str)] = &[
${scalarFields.map(entry => `    (${entry.index}, ${rustString(entry.field)}),`).join('\n')}
];

/// Numeric \`NodeKind\` values, for rules that name a node directly.
#[rustfmt::skip]
pub mod kind {
${kindConstants}
}
`;

// Through rustfmt, so `cargo fmt --check` and `--check` here cannot disagree
// about the same file. The wide tables carry `#[rustfmt::skip]` because one
// entry per line is how they stay readable in a diff; everything else is
// formatted the way hand-written Rust in this repository is.
const formatted = execFileSync('rustfmt', ['--emit', 'stdout', '--edition', '2024', '--quiet'], {
  encoding: 'utf8',
  input: rust,
});

if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== formatted) {
    process.stderr.write(`${path.relative(root, output)} is stale; run pnpm codegen:estree\n`);
    process.exit(1);
  }
  process.stdout.write(`${path.relative(root, output)} is up to date (${kinds.length} kinds)\n`);
} else {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, formatted);
  process.stdout.write(
    `${path.relative(root, output)}: ${kinds.length} kinds, ` +
      `${kindsOfDialect('Flow').length} flow, ${optionalExtras.length} attachment points\n`,
  );
}
