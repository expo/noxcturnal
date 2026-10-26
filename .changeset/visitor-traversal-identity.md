---
'noxcturnal': patch
---

Keep path.skip(), path.traverse(), and subscribeWithin() within their owning AST subtrees when source locations coincide, without retaining an index for skip-only visitors.
