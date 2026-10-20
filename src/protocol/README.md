# Rust protocol

This decodes the buffers the JavaScript protocol packs. JavaScript packs. Rust checks limits and rejects a buffer it cannot read. Constants live on both sides, and the protocol tests run both encoders. Add a tag, a magic, or a limit on both sides in the same change.

The caps exist so a manifest cannot allocate without bound: how many routes, how many predicates on a route, how many values on one predicate, how many payload fields, and how large the manifest may be. A route's predicates each have their own value cap.

Field selection is a mask of the facts a route asked for. The ids come from the schema and have to fit that mask. Asking for module facts asks for every fact a node can produce. An empty selection asks for none. A mask of every fact is indistinguishable from a caller that took no position, so it is treated as a request for everything.

Node types are a bitset sized to the generated type count. Node types, field ids, child roles, and predicate domains come from that schema. A hand-maintained copy drifts on the next Oxc upgrade.
