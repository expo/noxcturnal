---
'noxcturnal': patch
---

Repair public scope rename, UID allocation, scope ownership, and declaration insertion. Generated names account for decoded identifier escapes, valid Unicode rename targets are accepted, and every declaration and reference in a binding is renamed without rewriting property keys or module interfaces. Owned scopes stay distinct from containing scopes, scope parents come from the scope parent table, and global binding references include their semantic flags. Scope insertion uses retained scope coordinates instead of optional body fields, wraps concise arrows and unbraced loop bodies once, and keeps class and switch insertions on a statement list that can actually host them.
