# TypeScript surface

This tree is the public package. Rust parses, analyzes, lowers syntax, checks edits, and prints. TypeScript decides what a plugin may ask for, which phases run, and how those requests cross into the addon. The [root README](../README.md) is how to call it.

Sessions, the editor, route preparation, and the native-plan schema stay internal. The public entry is the definitions, `transform`, classification, cache keys, and the generated node predicates.

Plugins in one phase see one input. Their edits are checked and printed together. Put a rewrite that depends on an earlier rewrite in a later phase.

The [root README](../README.md) has the contract for `transform`, including which `cleanup` failure stays primary.

A native plan belongs on the phase. The same-named field on the transform options is a leftover: `transform` does not apply it, but the pipeline cache key still hashes it, so a value left there changes cache identity.

Per-file data belongs in `pluginData`, or in values bound into the definition when they are part of the predicate. A reusable definition that closes over per-file data shares that closure across files. The pipeline cache key covers Noxcturnal's own configuration and leaves `pluginData` out, so a consumer that caches on that key adds its own file data.
