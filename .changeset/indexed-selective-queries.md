---
'noxcturnal': patch
---

Index retained nodes by type and calls by callee on demand, and batch multi-callee queries into one native request. Repeated selective queries avoid scanning unrelated records while preserving result order and call filters.
