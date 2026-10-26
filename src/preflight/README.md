# Native preflight

This directory executes native transform phases: syntax lowering, type stripping, JSX, React Compiler and Refresh work, optimization, and formatting. The [engine](../engine/README.md) supplies source and a validated [TypeScript plan](../../js/preflight/README.md), and receives output and mappings.

Flow erasure runs before these phases. The native phase works with the syntax supplied by the runtime rather than reclassifying retained source comments.

## Transform order

Some rewrites must run before Oxc's main traversal. TypeScript and legacy decorators may need a language prepass so later rewrites see executable syntax. In-tree class, parameter, iterator, destructuring, and block-scoping passes prepare syntax and bindings for the remaining transforms.

Other repairs must run inside the Oxc traversal because a later transform in that traversal needs to see their output. Keep those fixes in the vendored transformer or compiler; an after-the-fact repair is too late. Their local changes are documented in [Oxc transformer notes](../../vendor/oxc_transformer/NOXCTURNAL.md) and [React Compiler notes](../../vendor/oxc_react_compiler/NOXCTURNAL.md).

Async lowering needs a second traversal when React Refresh replaces a function after its awaits were visited. Refresh stays in the first traversal so it can see JSX. Block scoping may also need another pass when Oxc introduces lexical bindings, such as during TypeScript enum lowering.

Parameter and destructuring rewrites can introduce captured lexical locals inside loops. Settle those captures again before flat block-scoping planning.

## Identity during rewriting

Source spans carry mapping provenance. Multiple generated nodes can share a span,
and earlier rewrites can move nodes out of source order. Use `SymbolId` and
`ReferenceId` for renames, `NodeId` for planned mutations and temporary owners,
and AST ancestry for containment and scope boundaries. Source ranges cannot stand
in for these identities, even when they are unique in freshly parsed source.
Do not key transform plans, captures, caches, or mutation targets by spans, or
infer live AST traversal order from source ranges. These rules also apply to
native collectors outside this directory.

Node IDs belong to one semantic snapshot. Every rewrite that changes bindings
invalidates semantic plans built before it; rebuilding semantics can reassign IDs.
Consume plans against the tree they analyzed, retain identity when moving existing
nodes, and rebuild before analyzing new or cloned nodes. Parser-only or locally
constructed nodes may have default IDs: use stable arena identity or traversal
state when semantics are unavailable. Constant folding, for example, memoizes
failed evaluations by arena address because it also runs on parser-only trees.
Arena addresses belong to their allocated tree and cannot survive reparsing.

Reserve helper names before subsequent passes allocate names, and rebuild scope
information before planning more binding-sensitive work. Regressions for structural
bookkeeping should exercise coincident anchors and AST order that differs from
source order, in addition to ordinary parsed inputs.

### Location-based boundaries

`object_spread::JsxOrigins` deliberately classifies source origins across Oxc's
replacement of JSX with calls; it does not select a unique live node. Immutable
visitor text edits and retained-index range queries likewise describe source
coordinates. Keep those coordinate contracts intact.
Spans also remain appropriate for source maps, diagnostics, and slicing immutable
source. Document deliberate origin classification when several generated nodes
can relate to one source construct; it must not select a unique live node.

React Compiler hoisting and capture collection use semantic node identity, AST
ancestry, and identifier traversal order. They retain spans only as source locations;
shared declaration/reference anchors must not suppress a capture.

The vendored Oxc TypeScript enum/namespace passes match redeclarations by the
declaration node IDs retained in Oxc scoping, including when the full node store
is disabled. TypeScript import erasure likewise removes the exact import-specifier
node through the vendored semantic crate, preserving merged runtime declarations.
Its `infer` syntax validation follows the actual conditional extends subtree by
arena identity while semantic IDs are still being assigned.

React Compiler's experimental derived-effect lint identifies setter
uses by owning function, instruction slot, and operand. Its use sets belong to one
immutable HIR snapshot; spans only locate diagnostics. Captured bindings transport
values into functions, while dependency evaluation owns both its array operands
and the loads that produce them.

## Completion and failure

An intentional compatibility boundary declines without returning partial code or mappings. Invalid input or configuration throws. A failed postcondition after rewriting is fatal: later passes must not continue with a tree that fails the rewrite's postconditions. The [runtime](../../js/runtime/README.md) turns declines into bailouts with the caller's original source.

## Helpers and optimization

Helpers use pinned Babel metadata to choose between runtime imports and generated inline fragments. External helper references are recorded by the owning loader and materialized by reference ID, including across the deferred async traversal. Runtime helper imports retain their binding IDs; loose-rest completion selects only those bindings and recorded external references. Empty spans do not identify helpers. Preserve helper identity across passes so generated bindings cannot shadow helper references. Helper insertion follows hashbangs, directives, and safe generated declarations, and remains unmapped. Preamble membership uses arena identity and declaration structure. Generated executable statements such as disposal blocks can call helpers regardless of their source anchors and must follow helper initialization.

Optimization follows Metro's conservative behavior. Folding must preserve value-versus-reference semantics, and dead-code elimination must respect observable bindings, direct `eval`, and `with`. Module context permits bundler-oriented removal of unused script functions without changing parsing semantics.

Use [alignment tests](../../test/alignment/README.md) for canonical Babel and Hermes comparisons and [compliance tests](../../test/README.md) for execution semantics.
