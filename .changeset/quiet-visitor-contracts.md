---
'noxcturnal': patch
---

Fix visitor planning and dispatch so nested contracts retain their declared data, aggregate aliases classify function/class instances, widening delivers each matching route once, and skip/stop apply across a plugin's routes. Preserve nested plugin ownership and snapshot ancestry exclusions.

Keep cache keys distinct for signed zero, nonfinite values, sparse arrays, and plugin query contracts; options rebinding uses the frozen definition. Mutable query requests refresh cached facts and each plugin must declare its query categories. Unknown enabled native options now throw.

Match static member chains using declared native facts: request `memberPath` for members or `name` for identifiers, including child contracts. Literal dots and backslashes in property names are escaped in `memberPath` strings, leaving ordinary dotted paths unchanged. Matching without the required declaration now throws.

Reduce member matching, query permission checks, and cache-key encoding overhead while preserving the declared contracts and mutable-request checks.

Remove JavaScript source parsing and its prefix caches. Native AST predicates share member prefixes; explicit full-path fields retain their output-size cost. Gather validation allocation statistics during scope-free collection, and reuse the checked semantic graph for DCE-only native phases.

Move source classification, adapter hints, locations, editor searches and whitespace operations, and insertion boundaries to Rust. Generate UIDs from decoded native AST identifier names, ignoring comment/string text and reserving names for the immutable session. Identifier validation also uses Oxc. Editor regex searches execute natively with ECMAScript syntax and UTF-16 offsets.
