---
'noxcturnal': patch
---

Fix visitor planning and dispatch so nested contracts retain their declared data, aggregate aliases classify function/class instances, widening delivers each matching route once, and skip/stop apply across a plugin's routes. Preserve nested plugin ownership and snapshot ancestry exclusions.

Keep cache keys distinct for signed zero, nonfinite values, sparse arrays, and plugin query contracts; options rebinding uses the frozen definition. Mutable query requests refresh cached facts and each plugin must declare its query categories. Unknown enabled native options now throw.

Match static member chains consistently with or without retained fields. Literal dots and backslashes in property names are escaped in `memberPath` strings, leaving ordinary dotted paths unchanged.

Reduce member matching, query permission checks, and cache-key encoding overhead while preserving the declared contracts and mutable-request checks.

Make complex member scanning iterative and share long-chain prefixes within the immutable session. Gather validation allocation statistics during scope-free collection, and reuse the checked semantic graph for DCE-only native phases.
