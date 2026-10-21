# Source maps

Each phase records mappings as integer segments. The VLQ string is written once, when the pipeline finishes. Composition needs the original ranges until then. Encoding at every boundary would drop provenance, and a gap in a boundary map would let an edit spill onto neighboring code.

A segment records the generated position, the original position, and a name. Two marks on the name say whether the span is an open-ended anchor or an identity span. Those marks stay inside composition and are stripped before VLQ. Columns are UTF-16, the same coordinates as edits.

Layers compose from the earliest phase to the latest. A copied range stays one span, so a later phase can place an inner boundary through it. When a generated line already has a segment, a point on that line with no input mapping is stored unmapped. A line whose segments all trace to nothing is omitted. Dropping an interior gap lets a neighboring mapping cover it.

An input map may name several sources. Layers produced by edits name one. An explicit edit label wins inside that chain. Symbol names trace back to the original symbol.

A malformed layer fails. The resident mapping store and the encoded mappings string each have their own budget. Crossing either throws, including when the transform itself succeeded. The two failures are distinct so a test can tell a composition that grew too large from an encoding that did. Tests can force the resident limit without allocating the whole budget.

A function map is a Metro index of the input parse, taken before any mutation. It does not describe names a lowering invented. Inline helper text inserted by preflight has no mappings. Only mappings after the insertion shift.
