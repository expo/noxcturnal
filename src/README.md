# Native runtime

This tree implements the Rust addon loaded by the TypeScript package under [`js/`](../js/). TypeScript defines and schedules phases. Rust parses the source, analyzes bindings, collects visitor data, runs native transforms, and commits edits.

The main parts are:

- [`engine/`](engine/README.md) keeps source and parsed state available across phases.
- [`syntax/`](syntax/README.md) classifies input and checks generated code fragments.
- [`semantic/`](semantic/README.md) stores node, scope, and reference facts.
- [`protocol/`](protocol/README.md) decodes JavaScript requests.
- [`preflight/`](preflight/README.md) runs native syntax transforms and optimizations.
- [`edit/`](edit/README.md) applies edits while preserving where text came from.
- [`sourcemap/`](sourcemap/README.md) composes mappings back to the original input.

Native operations distinguish intentional compatibility declines from invalid input and internal failures. Never convert a failed rewrite into a fallback or return its partial output. The [runtime guide](../js/runtime/README.md) explains how those outcomes reach callers.
