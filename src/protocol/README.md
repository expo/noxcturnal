# Rust protocol

This directory validates and decodes the binary collection requests and edit batches produced by the [JavaScript protocol layer](../../js/protocol/README.md).

The layout is shared within one release. Change both sides together when changing tags, limits, or layouts. Decoder limits bound allocation from incoming buffers; keep encoder validation consistent with them.

Node types, fields, child roles, and predicate domains come from the event schema. Change the schema and run `pnpm codegen` rather than maintaining parallel ID tables. Generated IDs and masks must remain compatible with the buffer representation.
