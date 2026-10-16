---
'noxcturnal': patch
---

`path.matchesPattern()` returns false for nodes that are neither identifiers nor static or computed members, such as a `super()` callee or a spread argument. Identifiers still require a declared `name`, and static or computed members still require a declared `memberPath`. Calling it without that declaration throws.
