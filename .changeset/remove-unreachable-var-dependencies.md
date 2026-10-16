---
'noxcturnal': patch
---

Remove unreachable `var` initializers when folding constant `if` conditions while preserving hoisted bindings. This prevents dependencies referenced only by unreachable initializers from being retained after block-scoping transforms, including when lowering and optimization run in the same phase.
