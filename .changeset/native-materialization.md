---
'noxcturnal': patch
---

Reduce native materialization work by reusing syntax-selection AST counts, resolving child roles only when requested, skipping initial cache invalidation, and collecting binding references in shared storage.
