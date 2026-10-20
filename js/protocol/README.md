# JavaScript protocol

This packs the buffers that cross into Rust and unpacks the tape Rust sends back. The layout is shared with the Rust decoder. The protocol tests run both sides. Change a tag, a limit, or a generated id on both sides in the same change.

Three buffers matter. A route manifest says which nodes, fields, and children to collect. A routed tape is what Rust sends back. An edit buffer is the commit for a visitor phase. Ids for node types, fields, child roles, and predicates come from the event schema. Change the schema, then run `pnpm codegen`.

The manifest is bounded. A route, its predicates, the values on one predicate, and the payload fields all have a cap, and so does the manifest's size. The packer does not apply the per-predicate value cap. The pipeline rejects a list past that cap, and a value that is not a scalar, when the phase is prepared. Alias routes expand to concrete types. A child role a variant does not declare contributes nothing. A wildcard role replaces the role list and asks Rust to retain heterogeneous structure. Prefer a named role.

Edit offsets are UTF-16 indexes into the original source. A move stores its destination where a replacement would store new text, and Rust drops any parts on a move, because a move relocates a range rather than inserting content. An omitted destination means the move is incomplete. A plain string stays one string. A parts list collapses to one string only when every part is sourceless, unlabeled text. Anything else stays a parts table, so provenance can survive. Consecutive repeated source-map names share one entry.

The tape carries a string slab and records. Each record identifies the node and its span. Parent and scope are added only when the manifest asked for them, so a walk does not take another native call, and a phase that did not ask does not pay for them. A short buffer or a bad magic is rejected.

Host strings stay UTF-8. A value that contains an isolated surrogate, or that itself starts with the escape used to mark one, is sent as a tagged JSON string. Constants use a small set of tags. A plain round-trip was changing lone surrogates and signed zeroes, which is why the tagged form exists. Constant folding has its own rules and leaves a lone surrogate unfolded.
