---
'noxcturnal': patch
---

Reuse route-handler scratch state across synchronous transforms, while isolating reentrant transforms and clearing per-file bindings on every exit.
