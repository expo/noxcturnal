---
'noxcturnal': patch
---

Validate invalid input consistently across native, visitor, optimization, and empty pipelines, reporting typed syntax errors with source locations. Preserve pristine bailouts for unsupported mutable namespace exports and the documented Flow and escaped-regexp-name parser boundaries.

Align filename/declaration classification, leading Flow comment recognition, adapter output grammar, missing selected-adapter errors, and read-only source hints. Fragment factories now enforce one complete expression and reject self-contained early errors while allowing unresolved enclosing bindings.

Scope-free and empty pipelines now perform lightweight early-error validation without retaining an AST-node index; this adds validation work to routes that previously accepted invalid source.
