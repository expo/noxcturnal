Vendored Oxc semantic analysis, pinned at 0.154.0. `UPSTREAM_REVISION` records
`oxc-project/oxc` tag `crates_v0.154.0`. The crate sources and normalized manifest
come from the published crate; `LICENSE` comes from the Oxc repository root.

Local patch in `src/scoping.rs`: add `remove_symbol_declaration_by_id` so
TypeScript import erasure can remove exactly the import declaration while keeping
merged runtime declarations, flags, and locations. The existing span-based public
method retains its coordinate-based contract for compatibility. Both methods use
the same metadata promotion logic. Identity IDs belong to one semantic snapshot.

The host regression in `src/preflight/transform.rs` covers parsed, shared, and
reversed anchors with the full semantic node store enabled and disabled.

`src/checker/typescript.rs`: validate `infer` placement through the actual
conditional `extends_type` subtree on the ancestry stack, using arena identity.
The semantic snapshot is under construction, so not-yet-visited child node IDs
cannot identify that edge. Source anchors only locate diagnostics. The host
regression covers shared, moved, and reversed anchors with and without the full
node store, including nested conditional types.
