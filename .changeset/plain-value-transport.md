---
'noxcturnal': patch
---

Preserve JavaScript values as they cross native transport. Constant fields, queries, and direct and retained predicates carry an explicit kind, so negative zero, non-finite numbers, null, and numeric-looking strings stay distinct. Lone surrogates and other strings Rust UTF-8 cannot hold use a NUL-prefixed JSON form; ordinary strings pass through unchanged. Query globals and plugin metadata keep `__proto__` as an own enumerable data property.
