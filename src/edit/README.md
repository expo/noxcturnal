# Edit commit

This directory combines source edits into a piece table: original source slices plus inserted text. Visitor edits, Flow erasure, and native syntax passes share this mechanism, so their output follows the same mapping rules.

Pieces preserve where text came from. The [source-map layer](../sourcemap/README.md) uses that provenance to map output through later phases. Keep copied fragments structured rather than flattening them to strings.

A commit interprets all coordinates against its input, using UTF-16 offsets to match JavaScript. Edits in a batch apply together, so later edits cannot use offsets from earlier edits' output.

Use relocation for moving source. Removing and reinserting text can lose interior mappings and edits that should travel with it. Ambiguous overlaps are rejected rather than resolved by plugin execution order.

Code changes and mapping changes are separate: unchanged text can still carry a new mapping. Preserve that distinction when reporting commit results to the [engine](../engine/README.md).

Program preambles and epilogues are output placement intents. They do not compete
with replacements for an input coordinate. The output assembler first builds body
edits and resolves payload source copies against that same batch; intents do not
copy one another. It then locates the edited body's directives, hashbang, statements,
and comments, places strictness and program insertions with safe boundaries, and
assembles wrapper sections last. Helper keys retain their per-transform registry
and first-ensure ordering. Program placements belong to the entire phase input:
partial source resets retain them, while a full-program reset removes the caller's
placements. Positional insertions still use ordinary overlap rules.

Payload pieces retain original provenance in a temporary document, then relocate
to their output positions. Composing these map layers preserves copied mappings
and leaves literal generated code unmapped. Resident source and maps change only
after the complete assembly succeeds, including during convergent-edit retries.
