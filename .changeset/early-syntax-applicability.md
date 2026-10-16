---
'noxcturnal': patch
---

Add `contract.syntax.anyOf` so plugins can require actual syntax before retaining native data or hydrating children. Share the input parse with active visitors, recheck applicability after source changes, and skip child hydration for plugins rejected during analysis.
