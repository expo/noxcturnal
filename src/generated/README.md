# Generated Rust data

Do not edit this directory. `pnpm codegen` rewrites it, and `pnpm codegen:check` fails when it drifts. The TypeScript output is generated from the same sources.

The event schema is the node-type, field, child-role, and predicate-domain table the protocol and the engine share. It is reconciled with the pinned Oxc AST before it is generated. Inline helpers come from the pinned Babel helper packages. RegExp Unicode property tables come from the Unicode data the in-tree RegExp pass reads. The Flow crate has its own generated ESTree shape, produced by the same codegen run from Hermes' definition. That output lives in the crate.

Oxc's Rust crates and the TypeScript AST types move together. Regenerating the event schema is part of that upgrade. If a visitor field is missing at runtime, check the schema before changing the collector.

## Compatibility

The generated ids and the buffer layouts they describe are private to one release. The JavaScript package and its native binaries are versioned together, so a package only ever loads a binary generated from the same schema. There is no compatibility between versions, and nothing outside this repository should depend on the ids or the layout.
