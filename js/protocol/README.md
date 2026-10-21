# JavaScript protocol

This directory encodes collection plans and edits for the [Rust protocol](../../src/protocol/README.md), then decodes visitor data for the runtime.

Three kinds of buffer cross the boundary: a manifest describing data to collect, a tape of matching node records, and an edit batch. Sending declared facts together avoids a native call for each node or field.

The layout is private to a release. Update both sides together when changing tags, limits, or layouts. Node and field IDs come from the event schema; change the schema and run `pnpm codegen` rather than maintaining separate tables.

Edit coordinates use UTF-16 to match JavaScript string offsets. Structured edit parts preserve source provenance, so flatten them only when they contain no mapping information.

String transport must preserve JavaScript values that ordinary UTF-8 cannot represent, including lone surrogates. Its encoding is separate from constant evaluation, which may intentionally refuse to fold those values.
