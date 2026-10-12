---
'noxcturnal': patch
---

Fix block-scoping transforms hanging on function-local bindings in loop headers and iterables.

Preserve captured loop bindings across initializers, conditions, updates, and `finally` blocks, including `const` assignment errors, function-scoped `var` declarations, and enclosing `arguments` references in generators. Avoid unnecessary loop helpers and retain safe iteration-local declarations to preserve generated-code performance.
