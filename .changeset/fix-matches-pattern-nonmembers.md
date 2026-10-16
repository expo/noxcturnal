---
'noxcturnal': patch
---

`path.matchesPattern()` returns false for nodes that are not a static or computed member chain. That includes a `super()` callee, a spread argument, and an identifier reached through a `memberPath` declaration such as an `Expression` callee. Identifiers still require a declared `name` to match their own name, and static or computed members still require a declared `memberPath`. Calling it without the declaration that applies to that node throws.
