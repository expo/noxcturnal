---
'noxcturnal': patch
---

Preserve strict object spread semantics when `useBuiltIns` is enabled. Restrict classic JSX props completion to calls originating from JSX elements, so composed transforms cannot apply assignment semantics to ordinary object arguments.
