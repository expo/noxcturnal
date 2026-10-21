# Helper formatter

This binary is a codegen tool. Library code does not call it. The inline-helper generator sends a JSON array of helper source strings in one invocation. For each source, the binary parses the script once, runs semantic analysis once, and returns its formatted code, globals, and bindings as a JSON object in the output array. A parse or semantic diagnostic aborts generation, so an invalid helper never lands in the generated table.

Globals are the unresolved references at the root. The script `require` binding is skipped: runtime loaders follow it on purpose, and it is not a collision. Bindings are the root scope's own names. The generator records both so a later check knows which names a helper closes over.

Change the generator or the pinned Babel helper version, then run `pnpm codegen`. To inspect one helper, pipe a JSON array containing its source to `cargo run --quiet --bin format_inline_helper`.
