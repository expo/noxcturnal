# Noxcturnal contributor guidance

Noxcturnal is a hybrid Rust/TypeScript transform runtime. Rust owns parsing,
semantic analysis, native transforms, event collection, and edit commits; the
TypeScript layer owns public contracts, pipeline composition, visitor ergonomics,
and the JavaScript package surface. Keep changes on the side of that boundary
which owns the behavior instead of duplicating policy across both layers.

## Generated files

Do not edit files under `js/generated/` or `src/generated/` by hand. Edit their
source schema or generator and run `pnpm codegen`. The command first reconciles
`protocol/event-schema.json` with the pinned Oxc AST, then generates the Rust and
TypeScript protocol views from it.

`oxc_ast`/the other Oxc Rust crates and `@oxc-project/types` are a lockstep
boundary. When changing the Oxc version, pin the Rust and npm dependencies to the
same exact version in one change, then regenerate the protocol outputs.

## Runtime contracts

- Plugins in one phase observe the same immutable input. Their edits commit
  together and become observable only at a later phase boundary. Put work that
  must observe prior edits in a separate phase.
- Preserve the three-way transform outcome: success returns a transform result,
  an intentional compatibility boundary returns a bailout with pristine input,
  and invalid input/configuration or internal failures throw. Do not turn fatal
  failures into compatibility fallbacks.
- Visitor data is opt-in through its contract. Declare fields, children,
  ancestry, scope, comments, and other capabilities rather than adding hidden
  per-node native calls. Prefer generated named child roles; use recursive
  wildcards only for genuinely heterogeneous structure.

## AST identity and source locations

Source spans are coordinates and provenance, never node or binding identity.
Read [Identity during rewriting](src/preflight/README.md#identity-during-rewriting)
before changing AST bookkeeping, including native collectors. It defines identity
lifetimes, ancestry rules, valid span uses, and required regression coverage.

## Tests

Read `test/README.md` before adding, moving, or deleting coverage, and read
`test/alignment/README.md` before changing canonical Babel or Hermes comparisons.
The alignment, compliance, transform, and integration suites intentionally test
different contracts; similar fixture text is not sufficient reason to merge or
delete tests.

Add focused regressions beside the owning transform. Use compliance tests for
runtime semantics and integration tests for the packaged public surface. When
removing coverage, identify a surviving test that exercises the same input,
options, execution path, and observable assertion.

## Validation

Use the repository scripts rather than invoking tools with ad hoc options:

- `pnpm codegen:check` after protocol, generated-schema, helper, or Unicode data changes
- `pnpm check:types` for TypeScript API or contract changes
- `pnpm test` for JavaScript/runtime behavior
- `cargo test` for native behavior
- `pnpm format` before handing off source changes
- `pnpm check` for the full pre-commit validation suite

Run the narrow relevant checks while iterating, then the full suite for changes
that cross the Rust/TypeScript boundary or affect published behavior.
