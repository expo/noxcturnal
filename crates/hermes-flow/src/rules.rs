//! What each node kind and each attachment point means.
//!
//! This is the reviewable half of the crate. Everything here is declared by
//! name and resolved once against the generated schema, so a rule reads as the
//! syntax it is about rather than as a field index.
//!
//! # How the rules stay honest across a Hermes bump
//!
//! Two different mechanisms, because the two risks are different.
//!
//! A **new node kind** is safe by default: anything in the Flow, TypeScript, or
//! cover dialects that is not named below bails. A pin bump that adds a Flow
//! node therefore produces a fallback and a visible drop in the coverage
//! counter, never wrong output. That is why the ~160 inner type nodes are not
//! enumerated here — they are unreachable in practice, since they vanish with
//! the enclosing annotation's span, and a bail is the right answer if one is
//! somehow reached.
//!
//! A **new field on an existing value node** is not safe by default, because
//! the default there has to be "walk it" for ordinary JavaScript to work. So
//! every field the generator identifies as a possible attachment point —
//! `OPTIONAL_EXTRAS` and `SCALAR_FIELDS`, 92 of them at the current pin — must
//! appear in [`FIELD_RULES`], and `rules::tests::every_obligation_is_disposed`
//! fails when one does not. That is the check the first draft of the plan's
//! hand-written rule list could not give.

use std::sync::LazyLock;

use crate::generated::estree::{Dialect, NODE_KIND_COUNT, NODE_KINDS};

/// Why a file was abandoned to the caller's parser adapter.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BailKind {
    /// Hermes could not parse it.
    ParseFailed,
    /// A proposal shape the lowering does not recognize.
    Proposal,
    /// A `TS*` node. Hermes is built with TypeScript parsing on, but nothing
    /// here erases TypeScript.
    TypeScript,
    /// A cover-grammar node, which should never reach a finished AST.
    CoverGrammar,
    /// Flow syntax with no rule.
    UnhandledFlow,
    /// Syntax outside Flow that the rules do not cover, such as decorators.
    UnhandledSyntax,
    /// The buffer did not read back, or a rule could not find a marker it
    /// needs in the source. Either is a defect rather than unsupported input.
    Malformed,
    /// A construct that has no lowering here *or* in `hermes-parser` — a `var`
    /// binding in a match pattern, a `yield` in a case body that becomes a
    /// function. Unlike every other kind this is not a fallback: it is the
    /// answer, and the caller reports it.
    Rejected,
}

impl BailKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::ParseFailed => "parse-failed",
            Self::Proposal => "proposal-syntax",
            Self::TypeScript => "typescript-syntax",
            Self::CoverGrammar => "cover-grammar",
            Self::UnhandledFlow => "unhandled-flow",
            Self::UnhandledSyntax => "unhandled-syntax",
            Self::Malformed => "malformed",
            Self::Rejected => "rejected",
        }
    }

    /// Whether handing the file to the caller's parser adapter could do any
    /// better than stopping here.
    ///
    /// It could for everything the rules merely do not cover. It could not for
    /// [`BailKind::Rejected`]: the adapter runs the same transforms this one
    /// mirrors, so it arrives at the same refusal by a longer route — or, where
    /// that transform emits code that does not parse, at a syntax error
    /// reported against a line nobody wrote. Reporting it here is the whole
    /// difference between a diagnostic and a mystery.
    pub fn has_fallback(self) -> bool {
        !matches!(self, Self::Rejected)
    }
}

/// What the walk does with a whole node.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NodeRule {
    /// Ordinary syntax: walk its fields under [`FIELD_RULES`].
    Walk,
    /// Flow-only declaration: record the node's whole span and skip its
    /// subtree.
    EraseWhole,
    /// Keep the first field's subtree and erase from its end to the node's
    /// end. Covers `(x: T)`, `x as T`, and `x as const` with one rule, because
    /// in each the value is the first field and everything after it is type
    /// syntax — including the `as` keyword, which is not part of any node.
    EraseTail,
    /// Abandon the file.
    Bail(BailKind),
}

/// What the walk does with one field of a node it is walking.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FieldRule {
    /// Value syntax: walk it, or skip it when it carries nothing to erase.
    Plain,
    /// Flow-only: record its span and skip its subtree. A scalar can never be
    /// `Erase` — it has no span.
    Erase,
    /// Needs more than a span, so [`crate::erase`] handles it by name.
    Hook,
    /// Not covered by the rules. Bail when it is present and non-empty.
    BailIfPresent,
}

/// Flow-only declarations, erased whole.
///
/// `mixins` is not in the class rules because it is a field of `DeclareClass`,
/// which is erased wholesale anyway.
const ERASE_WHOLE: &[&str] = &[
    "TypeAlias",
    "OpaqueType",
    "InterfaceDeclaration",
    "DeclareTypeAlias",
    "DeclareOpaqueType",
    "DeclareInterface",
    "DeclareClass",
    "DeclareFunction",
    "DeclareVariable",
    "DeclareModule",
    "DeclareModuleExports",
    "DeclareNamespace",
    "DeclareExportDeclaration",
    "DeclareExportAllDeclaration",
    "DeclareEnum",
    "DeclareComponent",
    "DeclareHook",
];

/// Flow expressions that wrap a value: keep the value, erase the type.
const ERASE_TAIL: &[&str] = &["TypeCastExpression", "AsExpression", "AsConstExpression"];

/// The disposition of every field the generator flags as a possible attachment
/// point. Exhaustive by test: see the module docs.
#[rustfmt::skip]
pub const FIELD_RULES: &[(&str, &str, FieldRule)] = &[
    // -- functions ---------------------------------------------------------
    // `params` is a hook because a `this` parameter has no field of its own:
    // Hermes represents it as `params[0]` being an `Identifier` named `this`,
    // and removing it needs the next parameter's start for the comma.
    ("FunctionDeclaration",      "params",         FieldRule::Hook),
    ("FunctionDeclaration",      "typeParameters", FieldRule::Erase),
    ("FunctionDeclaration",      "returnType",     FieldRule::Erase),
    ("FunctionDeclaration",      "predicate",      FieldRule::Erase),
    ("FunctionDeclaration",      "generator",      FieldRule::Plain),
    ("FunctionDeclaration",      "async",          FieldRule::Plain),
    ("FunctionExpression",       "params",         FieldRule::Hook),
    ("FunctionExpression",       "typeParameters", FieldRule::Erase),
    ("FunctionExpression",       "returnType",     FieldRule::Erase),
    ("FunctionExpression",       "predicate",      FieldRule::Erase),
    ("FunctionExpression",       "generator",      FieldRule::Plain),
    ("FunctionExpression",       "async",          FieldRule::Plain),
    ("ArrowFunctionExpression",  "params",         FieldRule::Hook),
    // `hook useThing<T>(a: T): R {}` differs from a function only in its
    // keyword, which `erase` swaps; the fields behave identically.
    ("HookDeclaration",          "typeParameters", FieldRule::Erase),
    ("HookDeclaration",          "returnType",     FieldRule::Erase),
    ("HookDeclaration",          "async",          FieldRule::Plain),
    ("ArrowFunctionExpression",  "typeParameters", FieldRule::Erase),
    ("ArrowFunctionExpression",  "returnType",     FieldRule::Erase),
    ("ArrowFunctionExpression",  "predicate",      FieldRule::Erase),
    ("ArrowFunctionExpression",  "expression",     FieldRule::Plain),
    ("ArrowFunctionExpression",  "async",          FieldRule::Plain),

    // -- classes -----------------------------------------------------------
    // `implements` is a hook rather than an erase: the `implements` keyword
    // itself belongs to no node, so erasing the list would leave it behind.
    // Decorators remain value syntax for a later, explicitly selected native
    // decorator transform; their expressions may themselves contain Flow.
    ("ClassDeclaration",         "typeParameters",     FieldRule::Erase),
    ("ClassDeclaration",         "superTypeArguments", FieldRule::Erase),
    ("ClassDeclaration",         "implements",         FieldRule::Hook),
    ("ClassDeclaration",         "decorators",         FieldRule::Plain),
    ("ClassExpression",          "typeParameters",     FieldRule::Erase),
    ("ClassExpression",          "superTypeArguments", FieldRule::Erase),
    ("ClassExpression",          "implements",         FieldRule::Hook),
    ("ClassExpression",          "decorators",         FieldRule::Plain),
    ("MethodDefinition",         "decorators",         FieldRule::Plain),
    ("MethodDefinition",         "kind",               FieldRule::Plain),
    ("MethodDefinition",         "computed",           FieldRule::Plain),
    ("MethodDefinition",         "static",             FieldRule::Plain),

    // `declare foo: T` erases the whole member; the optional `?` is a byte in
    // the gap between the key and the annotation, so both need a hook.
    // `tsModifiers` is TypeScript, which nothing here erases.
    ("ClassProperty",            "typeAnnotation", FieldRule::Erase),
    ("ClassProperty",            "variance",       FieldRule::Erase),
    ("ClassProperty",            "declare",        FieldRule::Hook),
    ("ClassProperty",            "optional",       FieldRule::Hook),
    ("ClassProperty",            "tsModifiers",    FieldRule::BailIfPresent),
    ("ClassProperty",            "decorators",     FieldRule::Plain),
    ("ClassProperty",            "computed",       FieldRule::Plain),
    ("ClassProperty",            "static",         FieldRule::Plain),
    ("ClassPrivateProperty",     "typeAnnotation", FieldRule::Erase),
    ("ClassPrivateProperty",     "variance",       FieldRule::Erase),
    ("ClassPrivateProperty",     "declare",        FieldRule::Hook),
    ("ClassPrivateProperty",     "optional",       FieldRule::Hook),
    ("ClassPrivateProperty",     "tsModifiers",    FieldRule::BailIfPresent),
    ("ClassPrivateProperty",     "decorators",     FieldRule::Plain),
    ("ClassPrivateProperty",     "static",         FieldRule::Plain),

    // -- bindings and calls ------------------------------------------------
    ("Identifier",               "typeAnnotation", FieldRule::Erase),
    ("Identifier",               "optional",       FieldRule::Hook),
    ("Identifier",               "name",           FieldRule::Plain),
    ("ObjectPattern",            "typeAnnotation", FieldRule::Erase),
    ("ArrayPattern",             "typeAnnotation", FieldRule::Erase),
    ("CallExpression",           "typeArguments",  FieldRule::Erase),
    ("NewExpression",            "typeArguments",  FieldRule::Erase),
    ("OptionalCallExpression",   "typeArguments",  FieldRule::Erase),
    // Optional chaining, not Flow optionality.
    ("OptionalCallExpression",   "optional",       FieldRule::Plain),
    ("OptionalMemberExpression", "optional",       FieldRule::Plain),
    ("OptionalMemberExpression", "computed",       FieldRule::Plain),
    ("MemberExpression",         "computed",       FieldRule::Plain),

    // -- modules -----------------------------------------------------------
    // `type` and `typeof` on a declaration erase the statement; on a specifier
    // they erase the specifier and its separating comma.
    ("ImportDeclaration",        "specifiers",  FieldRule::Hook),
    ("ImportDeclaration",        "importKind",  FieldRule::Hook),
    ("ImportSpecifier",          "importKind",  FieldRule::Hook),
    ("ExportNamedDeclaration",   "declaration", FieldRule::Hook),
    ("ExportNamedDeclaration",   "exportKind",  FieldRule::Hook),
    ("ExportAllDeclaration",     "exportKind",  FieldRule::Hook),

    // -- JSX ---------------------------------------------------------------
    ("JSXOpeningElement",        "typeArguments", FieldRule::Erase),
    ("JSXOpeningElement",        "selfClosing",   FieldRule::Plain),
    ("JSXIdentifier",            "name",          FieldRule::Plain),
    ("JSXStringLiteral",         "value",         FieldRule::Plain),
    ("JSXStringLiteral",         "raw",           FieldRule::Plain),
    ("JSXText",                  "value",         FieldRule::Plain),
    ("JSXText",                  "raw",           FieldRule::Plain),

    // -- plain JavaScript scalars ------------------------------------------
    // Listed only so the obligation set is covered; none of them carry Flow.
    ("BlockStatement",           "implicit",      FieldRule::Plain),
    ("ExpressionStatement",      "directive",     FieldRule::Plain),
    ("ForOfStatement",           "await",         FieldRule::Plain),
    ("BooleanLiteral",           "value",         FieldRule::Plain),
    ("StringLiteral",            "value",         FieldRule::Plain),
    ("NumericLiteral",           "value",         FieldRule::Plain),
    ("BigIntLiteral",            "bigint",        FieldRule::Plain),
    ("RegExpLiteral",            "pattern",       FieldRule::Plain),
    ("RegExpLiteral",            "flags",         FieldRule::Plain),
    ("DirectiveLiteral",         "value",         FieldRule::Plain),
    ("ArrayExpression",          "trailingComma", FieldRule::Plain),
    ("YieldExpression",          "delegate",      FieldRule::Plain),
    ("AssignmentExpression",     "operator",      FieldRule::Plain),
    ("BinaryExpression",         "operator",      FieldRule::Plain),
    ("LogicalExpression",        "operator",      FieldRule::Plain),
    ("UnaryExpression",          "operator",      FieldRule::Plain),
    ("UnaryExpression",          "prefix",        FieldRule::Plain),
    ("UpdateExpression",         "operator",      FieldRule::Plain),
    ("UpdateExpression",         "prefix",        FieldRule::Plain),
    ("VariableDeclaration",      "kind",          FieldRule::Plain),
    ("TemplateElement",          "tail",          FieldRule::Plain),
    ("TemplateElement",          "cooked",        FieldRule::Plain),
    ("TemplateElement",          "raw",           FieldRule::Plain),
    ("Property",                 "kind",          FieldRule::Plain),
    ("Property",                 "computed",      FieldRule::Plain),
    ("Property",                 "method",        FieldRule::Plain),
    ("Property",                 "shorthand",     FieldRule::Plain),
];

/// The most fields any node in `ESTree.def` declares.
const MAX_FIELDS: usize = 10;

/// A node's rules, resolved to positions so the walk never compares a string.
#[derive(Debug, Clone, Copy)]
pub struct Resolved {
    pub node: NodeRule,
    fields: [FieldRule; MAX_FIELDS],
}

impl Resolved {
    pub fn field(&self, index: usize) -> FieldRule {
        self.fields[index]
    }
}

static TABLE: LazyLock<Box<[Resolved; NODE_KIND_COUNT]>> = LazyLock::new(build);

/// The resolved rules for a node kind.
pub fn resolved(kind: u32) -> &'static Resolved {
    &TABLE[kind as usize]
}

fn build() -> Box<[Resolved; NODE_KIND_COUNT]> {
    let mut table = vec![
        Resolved {
            node: NodeRule::Walk,
            fields: [FieldRule::Plain; MAX_FIELDS],
        };
        NODE_KIND_COUNT
    ];

    for (index, kind) in NODE_KINDS.iter().enumerate() {
        // Bail-first: a dialect the rules do not erase is abandoned unless it
        // is named below, so a node added by a Hermes bump degrades to a
        // fallback rather than to wrong output.
        table[index].node = match kind.dialect {
            Dialect::Base | Dialect::Jsx | Dialect::Sentinel => NodeRule::Walk,
            Dialect::Flow => NodeRule::Bail(BailKind::UnhandledFlow),
            Dialect::Ts => NodeRule::Bail(BailKind::TypeScript),
            Dialect::Cover => NodeRule::Bail(BailKind::CoverGrammar),
        };
    }

    let index_of = |name: &str| {
        NODE_KINDS
            .iter()
            .position(|kind| kind.name == name)
            .unwrap_or_else(|| panic!("rules name unknown node {name}"))
    };

    for name in ERASE_WHOLE {
        table[index_of(name)].node = NodeRule::EraseWhole;
    }
    for name in ERASE_TAIL {
        table[index_of(name)].node = NodeRule::EraseTail;
    }
    // Handled by `erase`, which rewrites them rather than abandoning the file.
    for name in [
        "EnumDeclaration",
        "ComponentDeclaration",
        "HookDeclaration",
        "RecordDeclaration",
        "RecordExpression",
        "RecordExpressionProperties",
    ] {
        table[index_of(name)].node = NodeRule::Walk;
    }
    for (node, field, rule) in FIELD_RULES {
        let index = index_of(node);
        let position = NODE_KINDS[index]
            .fields
            .iter()
            .position(|candidate| candidate.name == *field)
            .unwrap_or_else(|| panic!("rules name unknown field {node}.{field}"));
        table[index].fields[position] = *rule;
    }

    table
        .into_boxed_slice()
        .try_into()
        .unwrap_or_else(|_| unreachable!("built one entry per node kind"))
}

/// The proposal syntax the plan measured at 17 of 464 corpus files. These are
/// Flow-dialect nodes, so they already bail by default; naming them separately
/// only sharpens the reason the coverage counter reports.
const PROPOSAL: &[&str] = &["ComponentParameter"];

/// Refines a bail reason for reporting. Never changes whether a file bails.
pub fn bail_kind_for(kind: u32) -> BailKind {
    let name = NODE_KINDS[kind as usize].name;
    if PROPOSAL.contains(&name) || name.starts_with("Match") || name.starts_with("Record") {
        return BailKind::Proposal;
    }
    match resolved(kind).node {
        NodeRule::Bail(reason) => reason,
        _ => BailKind::UnhandledFlow,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::generated::estree::{OPTIONAL_EXTRAS, SCALAR_FIELDS};

    /// Every attachment point the generator derives from `ESTree.def` must have
    /// an explicit disposition. This is the check that makes a Hermes pin bump
    /// a test failure instead of a silent correctness risk.
    #[test]
    fn every_obligation_is_disposed() {
        let declared: Vec<(&str, &str)> = FIELD_RULES
            .iter()
            .map(|(node, field, _)| (*node, *field))
            .collect();

        let mut missing = Vec::new();
        for (kind, field) in OPTIONAL_EXTRAS.iter().chain(SCALAR_FIELDS) {
            let node = NODE_KINDS[*kind as usize].name;
            if !declared.contains(&(node, *field)) {
                missing.push(format!("{node}.{field}"));
            }
        }
        assert!(
            missing.is_empty(),
            "attachment points with no rule: {}\n\
             Add each to FIELD_RULES with a disposition, or bail on it.",
            missing.join(", ")
        );
    }

    /// The mirror: a rule naming a field that no longer exists is a rename the
    /// pin bump introduced, and would otherwise sit there doing nothing.
    #[test]
    fn every_rule_names_a_live_field() {
        for (node, field, _) in FIELD_RULES {
            let kind = NODE_KINDS
                .iter()
                .find(|kind| kind.name == *node)
                .unwrap_or_else(|| panic!("rule names unknown node {node}"));
            assert!(
                kind.fields.iter().any(|candidate| candidate.name == *field),
                "rule names unknown field {node}.{field}"
            );
        }
    }

    #[test]
    fn a_scalar_is_never_erased_by_span() {
        for (node, field, rule) in FIELD_RULES {
            if *rule != FieldRule::Erase {
                continue;
            }
            let kind = NODE_KINDS.iter().find(|kind| kind.name == *node).unwrap();
            let declared = kind.fields.iter().find(|f| f.name == *field).unwrap();
            assert!(
                matches!(
                    declared.ty,
                    crate::generated::estree::FieldType::Node
                        | crate::generated::estree::FieldType::List
                ),
                "{node}.{field} is a scalar and has no span to erase"
            );
        }
    }

    #[test]
    fn unnamed_flow_nodes_bail() {
        let kind = NODE_KINDS
            .iter()
            .position(|kind| kind.name == "UnionTypeAnnotation")
            .expect("UnionTypeAnnotation");
        assert_eq!(
            resolved(kind as u32).node,
            NodeRule::Bail(BailKind::UnhandledFlow)
        );
    }

    /// A stale name here would quietly stop sharpening the bail reason.
    #[test]
    fn proposal_names_exist() {
        for name in PROPOSAL {
            assert!(
                NODE_KINDS.iter().any(|kind| kind.name == *name),
                "PROPOSAL names unknown node {name}"
            );
        }
    }

    /// The distinction the caller acts on: everything but a rejection means
    /// "try the parser adapter instead".
    #[test]
    fn only_a_rejection_has_no_fallback() {
        assert!(!BailKind::Rejected.has_fallback());
        for kind in [
            BailKind::ParseFailed,
            BailKind::Proposal,
            BailKind::TypeScript,
            BailKind::CoverGrammar,
            BailKind::UnhandledFlow,
            BailKind::UnhandledSyntax,
            BailKind::Malformed,
        ] {
            assert!(kind.has_fallback(), "{}", kind.as_str());
        }
    }

    #[test]
    fn named_declarations_erase_whole() {
        let kind = NODE_KINDS
            .iter()
            .position(|kind| kind.name == "TypeAlias")
            .expect("TypeAlias");
        assert_eq!(resolved(kind as u32).node, NodeRule::EraseWhole);
    }
}
