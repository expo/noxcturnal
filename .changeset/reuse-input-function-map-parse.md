---
'noxcturnal': patch
---

Reuse the input parse when generating function maps instead of parsing the same source again. Collect maps before visitor edits and native language lowering, preserve original input coordinates across later phases, and skip collection when function maps are disabled.
