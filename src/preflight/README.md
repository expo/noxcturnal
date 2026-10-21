# Native preflight

This directory executes native transform phases: syntax lowering, type stripping, JSX, React Compiler and Refresh work, optimization, and formatting. The [engine](../engine/README.md) supplies source and a validated [TypeScript plan](../../js/preflight/README.md), and receives output and mappings.

Flow erasure runs before these phases. The native phase works with the syntax supplied by the runtime rather than reclassifying retained source comments.

## Transform order

Some rewrites must run before Oxc's main traversal. TypeScript and legacy decorators may need a language prepass so later rewrites see executable syntax. In-tree class, parameter, iterator, destructuring, and block-scoping passes prepare syntax and bindings for the remaining transforms.

Other repairs must run inside the Oxc traversal because a later transform in that traversal needs to see their output. Keep those fixes in the vendored transformer or compiler; an after-the-fact repair is too late. Their local changes are documented in [Oxc transformer notes](../../vendor/oxc_transformer/NOXCTURNAL.md) and [React Compiler notes](../../vendor/oxc_react_compiler/NOXCTURNAL.md).

Async lowering needs a second traversal when React Refresh replaces a function after its awaits were visited. Refresh stays in the first traversal so it can see JSX. Block scoping may also need another pass when Oxc introduces lexical bindings, such as during TypeScript enum lowering.

Parameter and destructuring rewrites can introduce captured lexical locals inside loops. Settle those captures again before flat block-scoping planning.

Every rewrite that changes bindings invalidates semantic plans built before it. Reserve helper names before subsequent passes allocate names, and rebuild scope information before planning more binding-sensitive work.

## Completion and failure

An intentional compatibility boundary declines without returning partial code or mappings. Invalid input or configuration throws. A failed postcondition after rewriting is fatal: later passes must not continue with a tree that fails the rewrite's postconditions. The [runtime](../../js/runtime/README.md) turns declines into bailouts with the caller's original source.

## Helpers and optimization

Helpers use pinned Babel metadata to choose between runtime imports and generated inline fragments. Preserve helper identity across passes so generated bindings cannot shadow helper references. Helper insertion follows hashbangs and directives and remains unmapped.

Optimization follows Metro's conservative behavior. Folding must preserve value-versus-reference semantics, and dead-code elimination must respect observable bindings, direct `eval`, and `with`. Module context permits bundler-oriented removal of unused script functions without changing parsing semantics.

Use [alignment tests](../../test/alignment/README.md) for canonical Babel and Hermes comparisons and [compliance tests](../../test/README.md) for execution semantics.
