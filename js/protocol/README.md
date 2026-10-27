# JavaScript protocol

This directory encodes collection plans and edits for the [Rust protocol](../../src/protocol/README.md), then decodes visitor data for the runtime.

Three kinds of buffer cross the boundary: a manifest describing data to collect, a tape of matching node records, and an edit batch. Sending declared facts together avoids a native call for each node or field.

The layout is private to a release. Update both sides together when changing tags, limits, or layouts. Node and field IDs come from the event schema; change the schema and run `pnpm codegen` rather than maintaining separate tables.

Edit coordinates use UTF-16 to match JavaScript string offsets. Structured edit parts preserve source provenance, so flatten them only when they contain no mapping information.

String transport must preserve JavaScript values that ordinary UTF-8 cannot represent, including lone surrogates. Its encoding is separate from constant evaluation, which may intentionally refuse to fold those values.

Skip-capable manifests opt into structural bounds (manifest flag 10, routed shape
flag 4). Stateless collection then adds one word to enter records after their source end:
the exclusive subtree end in event-sequence coordinates. The existing sequence
word is the start. Exit records preserve their enter start for later skip calls. This
metadata is not a retention capability and must not force a retained index.
Indexed collection leaves the shape flag unset and preserves lazy table loading.

In routed enter records, the type word's high bit marks a matched exit carrier;
the remaining bits identify the node type. Only these enters survive in the
decoder's exit stack. Native routing emits matching exits in structural order,
so the stack is bounded by nesting depth rather than the number or maximum ID of
visited nodes. Node IDs validate each pair; spans do not participate in pairing.

Child batches pair packed node events with a little-endian adjacency buffer. Each
group is `[parentId, count, ...[childId, roleId]]`; zero-count groups cache empty
parents. CSR edges have one entry per child under its structural or projected
parent, in native child order. Recursive requests expand retained roles by node
identity and transfer each child's scalar facts once, including when several
requested roots reach it.

Route flag bit 1 declares an internal immediate-parent type filter. After the eight-word route header,
a nonempty count and concrete parent type IDs precede the scalar predicates. Routes without
this flag keep their existing layout. Parent types affect matching only; they neither request
ancestry transport nor add retained capabilities.

Route flag bit 2 adds a structural selector after the optional parent filter and before route
predicates. Its recursive encoding is `[variantCount, ...variants]`. Each variant starts with
`[typeId, predicateCount, hasParent, childCount]`, followed by ordinary compiled predicates, an
optional parent selector, and children encoded as `[roleId, indexOrMax, ...selector]`. Variants
are alternatives; predicates, parent, and child conditions within a variant are conjunctive.
The callback always receives the route root. Child conditions are existential unless an index
is given. Limits are eight levels and 4096 variant records per manifest. Decode validates every
field, role, index, and bound before walking. Simple root predicates and parent type conditions
lower to the existing route filters. Indexed replay reuses the generated role graph; selector
requirements never authorize callback data access.
