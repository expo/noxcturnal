# Source maps

This directory composes each phase's output-to-input mappings back to the caller's original source. The [edit layer](../edit/README.md) preserves text provenance, and the [engine](../engine/README.md) holds map layers across phases.

Keep ranges and integer segments until composition finishes, then encode the final VLQ string once. Encoding at every boundary loses information that later edits need. Preserve unmapped gaps so neighboring mappings cannot incorrectly cover generated text. Columns use UTF-16, matching edit coordinates.

Mapping storage and final encoding have separate resource limits. Either can fail after code generation succeeds; both failures must propagate rather than silently dropping mappings.

Function maps describe functions in the input for Metro symbolication. They must be collected before lowering invents new names. Inline helper text has no original source location and remains unmapped.
