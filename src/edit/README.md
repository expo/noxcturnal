# Edit commit

Visitor edits, Flow erasure, and the native syntax passes all lower to one piece table. The output is the pieces concatenated. Each piece remembers where its bytes came from, so the source map follows from the edit.

A command replaces a range, removes it, attaches text to one side of a point, marks a mapping without changing text, wraps the file, joins the directive prologue, or relocates a range. Mapping policy says whether the new text is sourceless, anchored at its start, anchored at both ends, or identical to the input it replaced.

Public coordinates are UTF-16. On an ASCII source the offset is a byte offset. Any other source uses a byte table. An offset that splits a surrogate is rejected.

Commands are ordered by position and by how they attach to that position. Overlaps are rejected, copies expand, and the result is pieces.

Text wrapped at the start of the file renders before the body. When no explicit order is given, the submission index is the order, so the last wrap is the outermost text. An explicit order sorts higher first. Tied orders keep the earlier call further out. Text wrapped at the end sorts by order, then by submission index. Prologue text joins at the directive prologue, in the order each one was first ensured. Wraps sit at the ends of the file, outside the overlap checks on body ranges.

A replacement whose text equals the source it replaces becomes an original piece. Adjacent original ranges merge, so a no-op replace keeps the input mapping.

A copy expands against the edits in the same commit. Edits fully inside the copied range apply. Untouched slices stay original, so mappings inside a copied span survive. A copy that exactly covers a removal is rejected. A remove-and-copy pair drops the interior mappings a relocation is there to keep. Copies see edits from this commit only. A later phase sees the printed result.

## Moves and overlaps

A move is a hole plus a destination. A destination on either endpoint of the range is legal. One strictly inside is rejected, by the editor before the buffer is built and again by the commit. Relocating a node through the path API rejects the same case in its own words. Edits fully inside the hole travel with the relocated text. A source-map mark inside the hole stays where it was: it is a point on the original, not content of the move. An edit that straddles the hole, a second move that overlaps it, a destination inside it, or an edit that covers the hole exactly is rejected. The messages name the ranges.

Two body ranges that overlap are rejected, and the JavaScript editor attributes that to the owning plugins.

One contained case is legal. The inner edit ends at or before the outer edit, the two have different orders, and the outer order groups more than one command, at least one of which carries a parts list. A plain content string does not qualify. That is how an insertion inside a multi-part replacement is accepted.

## What a commit reports

Skipping the map still renders the code. The default keeps enough boundary information to compose later. The decoded commit keeps the phase map as an integer layer. The VLQ string is written once, at the end of the pipeline.

An empty command list is still rendered, and the changed flags are set against that identity. A byte-identical replace can keep the source version. An explicit mark, or a mapping policy other than identity, can still produce a child whose only change is the map.

Coordinates have to be in the original source. Anything else is rejected on the JavaScript side before the buffer is built.
