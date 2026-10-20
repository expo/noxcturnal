# Generated TypeScript protocol

Do not edit this directory. `pnpm codegen` rewrites it, and `pnpm codegen:check` fails when it drifts.

Node predicates and the protocol tables are generated from the event schema, after that schema is reconciled with the pinned Oxc AST. The Rust output is generated from the same source. Both sides move together.

Oxc's Rust crates and the TypeScript AST types stay on the same exact version. A version bump regenerates this directory in the same change. If a route rejects a field the AST clearly has, check the schema before changing the visitor.
