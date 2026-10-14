---
'noxcturnal': patch
---

Preserve logical-assignment receivers across private getter effects and regexp allocations. Allocate private temporaries without capturing external bindings, and finish selected nullish lowering in the same phase as private logical assignment.
