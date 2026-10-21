# Preflight plan

A preflight plan configures a native phase: syntax lowering, type stripping, JSX, React Compiler or Refresh work, optimization, and formatting.

This directory owns the public configuration contract in `types.ts` and `schema.ts`. The pipeline validates plans, and the binding converts them to addon arguments for [Rust preflight](../../src/preflight/README.md).

`automatic-if-present` JSX can share a phase with block scoping. Comment stripping is allowed alongside it only when block scoping is enabled. Put other rewrites in separate phases so they do not run on files the JSX pass would leave unchanged.

Module context allows dead-code elimination to treat a script as code a bundler may later wrap. It does not change the file's parsing semantics.

Class lowering also handles fields and private state. Optional chaining and nullish coalescing must agree on loose settings. Preserve these relationships when extending the schema.
