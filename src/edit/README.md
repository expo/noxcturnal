# Edit commit

This directory combines source edits into a piece table: original source slices plus inserted text. Visitor edits, Flow erasure, and native syntax passes share this mechanism, so their output follows the same mapping rules.

Pieces preserve where text came from. The [source-map layer](../sourcemap/README.md) uses that provenance to map output through later phases. Keep copied fragments structured rather than flattening them to strings.

A commit interprets all coordinates against its input, using UTF-16 offsets to match JavaScript. Edits in a batch apply together, so later edits cannot use offsets from earlier edits' output.

Use relocation for moving source. Removing and reinserting text can lose interior mappings and edits that should travel with it. Ambiguous overlaps are rejected rather than resolved by plugin execution order.

Code changes and mapping changes are separate: unchanged text can still carry a new mapping. Preserve that distinction when reporting commit results to the [engine](../engine/README.md).
