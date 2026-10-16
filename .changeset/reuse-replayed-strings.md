---
'noxcturnal': patch
---

Avoid allocating duplicate strings when replaying retained visitor routes. Reuse existing dictionary entries for repeated field values, ancestor data, and comments while preserving string IDs and visitor output.
