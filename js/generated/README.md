# Generated TypeScript protocol

Do not edit this directory. `pnpm codegen` rewrites it, and `pnpm codegen:check` fails when it drifts.

Node predicates and the protocol tables are generated from the event schema, after that schema is reconciled with the pinned Oxc AST. The Rust output is generated from the same source. Both sides move together.

Oxc's Rust crates and the TypeScript AST types stay on the same exact version. A version bump regenerates this directory in the same change. If a route rejects a field the AST clearly has, check the schema before changing the visitor.

## Compatibility

The generated ids and the buffer layouts they describe are private to one release. The JavaScript package and its native binaries are versioned together, so a package only ever loads a binary generated from the same schema. There is no compatibility between versions, and nothing outside this repository should depend on the ids or the layout.
