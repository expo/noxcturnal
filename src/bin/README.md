# Helper formatter

This binary is a codegen tool. Library code does not call it. The inline-helper generator pipes helper source in. The binary parses that source as a script and prints it. Asking for globals or bindings also runs semantic analysis and exits when it reports a diagnostic, so a helper that fails there never lands in the generated table.

Globals are the unresolved references at the root. The script `require` binding is skipped: runtime loaders follow it on purpose, and it is not a collision. Bindings are the root scope's own names. The generator records both so a later check knows which names a helper closes over.

Change the generator or the pinned Babel helper version, then run `pnpm codegen`. Running the binary by hand is useful when a helper fails and you want the diagnostic on its own.
