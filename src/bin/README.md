# Helper formatter

This code-generation binary formats Babel helper source and reports its bindings and unresolved references. The generator uses those facts to build helper tables and reserve names used by helpers.

Invalid helper source stops code generation.

After changing the generator or pinned Babel helpers, run `pnpm codegen`. To inspect one helper, pipe a JSON array containing its source to `cargo run --quiet --bin format_inline_helper`.
