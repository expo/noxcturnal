Read this when compiler integration in this tree behaves differently from upstream.
The bullets name the file that holds each repair. Open that file and confirm the
repair is still there before you edit it or treat the bullet as a diff.

Vendored `oxc_react_compiler` from `oxc-project/oxc` tag `crates_v0.154.0`
(`d47efe5`, recorded in `UPSTREAM_REVISION`), selected by `[patch.crates-io]`.
The React Compiler crate has its own version line: that Oxc release publishes it
as 0.143.0, while the other Oxc crates are 0.154.0. MIT license retained.

Upstream fixtures and snapshot tests are omitted and their Cargo test targets
removed; repository alignment and React renderer regressions cover the
integration patches.

Keep Rust and npm Oxc versions pinned together. Reassess local compiler diagnostics,
selection, and source-cache invalidation patches against upstream before upgrades.

Local patches:

- `lib.rs`: expose fatal compilation status independently from diagnostic severity;
  preserve the existing diagnostic-returning API for lint consumers.
- `react_compiler_lowering/build_hir.rs`, `identifier_loc_index.rs`, and `scope.rs`:
  derive hoisting and capture membership from semantic node identity and AST
  ancestry, and preserve identifier traversal order independently of source spans.
  Include bare arrow statement roots and object-method computed keys; shared
  declaration/reference anchors do not suppress captures.
- `scope.rs` and JSX lowering in `build_hir.rs` / `hir_builder.rs`: resolve builtin
  translation tags at their semantic AST nodes, including lexical shadowing and
  separate parameter/body environments, without a source-position scope index.
- `react_compiler_validation/validate_no_derived_computations_in_effects.rs`:
  experimental lint counts setter uses by function/instruction/operand identity,
  including dependency evaluation, rather than collapsing shared source spans.
  The ordinary validator and default feature selection are unchanged.
- `entrypoint/program.rs`: match lexical directive values rather than cooked strings.
- `entrypoint/pipeline.rs`: stop unsupported lowering before partial HIR reaches
  inference; propagate the optional source fingerprint to code generation.
- `entrypoint/imports.rs`, `environment.rs`, and `codegen_reactive_function.rs`:
  fingerprint source once per file with existing SHA1 infrastructure; reserve one
  fixed memo slot and clear memo values when the fingerprint changes. This is
  a change detector, not a security hash. Disabled mode emits no additional code.

The native fingerprint and the Nix source fileset include all of `vendor/`.
