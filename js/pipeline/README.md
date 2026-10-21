# Pipeline definitions

This directory validates and compiles plugin and phase definitions into plans for the [runtime](../runtime/README.md). A phase contains either visitor plugins or a native transform plan. Plugins in one phase observe the same input and commit their edits together; work that needs those edits belongs in a later phase.

Define reusable phases at module scope, before the first transform. Equivalent definitions share objects and compiled routes. New definitions created after the first transform share a bounded cache; once it fills, new shapes compile their routes on every use.

Visitor contracts become routes describing which nodes and facts Rust should collect. Edit effects describe how much a phase may change and help determine when parsed data can be reused. Understating an effect risks invalid reuse; a phase that promises no edits is checked at runtime.

## Cache identity

Cache keys describe configuration, not JavaScript function bodies. Plugins with different closures need distinct declared identities or options when they produce different output. Per-file `pluginData` is excluded; consumers must account for any output-affecting data in their own cache configuration.

The pipeline key describes the configured phases. The classification key adds file-specific routing, including an automatically selected parser adapter and native Flow capability. Adapter versioning is described in the [adapter guide](../adapters/README.md).

See [`define.ts`](define.ts) for definition reuse, [`compile.ts`](compile.ts) for phase planning, and [`cache-key.ts`](cache-key.ts) for the exact key inputs.
