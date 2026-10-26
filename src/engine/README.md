# Engine

The engine manages native state while the [TypeScript runtime](../../js/runtime/README.md) schedules phases. It keeps source, parsed data, and map layers in Rust to avoid copying them across the boundary after every operation.

Native phases run through [preflight](../preflight/README.md); visitor changes go through the [edit commit](../edit/README.md). Both paths contribute to the same final source and composed map. An all-native pipeline can execute in one call.

A session retains the facts requested by the phase's visitor contracts. It supports queries and later traversals without requiring a separate native call to discover each node's context. Collection must remain opt-in.

The input parse can serve selection and function-map collection before it is consumed by traversal or validation. Do not reuse consumed session or parsed-program handles.

Reuse indexes only when the source and requested facts still match. A no-edit phase can retain its index, while changes that invalidate bindings require new semantic analysis. Source-map failures remain fatal even when code generation succeeded.

Path-owned traversals select exact retained subtrees by node ID and tape interval.
The separate source-range routing API keeps its coordinate-filtering contract;
identical spans can include multiple nodes there. Nested traversal and
`subscribeWithin` must use the node-root route, including its own enter/exit events.
