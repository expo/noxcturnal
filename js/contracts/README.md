# Visitor contracts

A visitor contract declares which nodes a plugin visits, which facts it reads, and which operations it may perform. The [pipeline](../pipeline/README.md) combines contracts into a collection plan; Rust collects those facts, and the [runtime](../runtime/README.md) exposes them to callbacks.

Declare only the facts the plugin needs. Rust collects scope, ancestry, children, and comments in batches, avoiding native calls for individual nodes or fields. Prefer generated named child roles; recursive wildcards are for genuinely heterogeneous structure.

Use syntax requirements as a cheap filter before plugin state is created. Use `analyze` for decisions that need semantic information. Broad visitors bypass selective collection and require explicit opt-in.

For a fixed member pattern, prefer a route predicate over callback-side matching. Predicates let the native side filter matches and share member-chain prefixes.

Source fragments preserve where copied text came from. Keep them as fragments when building edits; request their text explicitly when a string is needed.

Declarations and validation rules live in [`visitor.ts`](visitor.ts).
