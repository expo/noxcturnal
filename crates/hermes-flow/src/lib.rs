//! Span-based Flow erasure.
//!
//! Hermes parses; a walk over the serialized AST buffer collects the byte
//! ranges occupied by Flow-only syntax; those ranges are deleted. No tree is
//! built and no AST is translated, so the output keeps the original file's
//! formatting and the resulting source map stays near-identity.
//!
//! The walk is bail-first: anything the rules do not recognise — a
//! cover-grammar node or an unhandled Flow-bearing field — abandons the
//! file to the caller's existing parser adapter rather than guessing.
//!
//! The proposals that declare runtime constructs — `enum`, `component`, `hook`,
//! `record`, and `match` — are the exception, because deleting them would change what a
//! program does. Each is rewritten in place instead, matching what
//! `hermes-parser`'s own JavaScript transforms produce.
//!
//! # Layout
//!
//! - [`generated::estree`] is expanded from Hermes' `ESTree.def` and is the
//!   only description of the AST's shape. It also emits the coverage
//!   obligations the rules are tested against.
//! - [`reader`] walks the serialized buffer.
//! - [`rules`] is the reviewable disposition table: what each node kind and
//!   each attachment point means.
//! - [`erase`] is the walk that turns those into spans.
//! - [`proposals`] and the record lowering in [`erase`] implement the runtime constructs.
//!
//! The `parser` feature links Hermes. Without it everything above still builds
//! and tests, because the buffer is a self-contained blob that a fixture file
//! can supply.

pub mod erase;
pub mod generated;
pub mod proposals;
pub mod reader;
pub mod rules;

pub use erase::{Bail, Edit, Erasure, erase};
pub use reader::{Buffer, ReadError};
pub use rules::BailKind;

/// Parses `source` with the linked Hermes and erases its Flow syntax.
///
/// `Err` covers both a parse failure and a bail; either way the caller should
/// fall back to its own parser adapter.
#[cfg(feature = "parser")]
pub fn erase_source(source: &str) -> Result<Erasure, Bail> {
    let parse = hermes_parser_sys::Parse::new(source).map_err(|error| Bail {
        kind: BailKind::ParseFailed,
        detail: error.message,
    })?;
    erase(source, parse.buffer())
}

#[cfg(all(test, feature = "parser"))]
mod drift {
    use crate::generated::estree::{NODE_KIND_COUNT, NODE_KINDS};

    /// The generated table indexes Hermes' `NodeKind` by position, so a pin
    /// bump that inserts a node silently renumbers every kind after it. This is
    /// what turns that into a test failure: both sides are expanded from the
    /// same `ESTree.def`, and this proves the build agrees.
    #[test]
    fn generated_kinds_match_the_linked_parser() {
        assert_eq!(
            hermes_parser_sys::node_kind_count() as usize,
            NODE_KIND_COUNT,
            "generated kind count differs from the linked Hermes; run pnpm codegen:estree"
        );
        for (index, kind) in NODE_KINDS.iter().enumerate() {
            assert_eq!(
                hermes_parser_sys::node_kind_name(index as u32),
                Some(kind.name),
                "kind {index} differs from the linked Hermes"
            );
        }
    }
}
