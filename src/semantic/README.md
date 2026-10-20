# Semantic facts

This holds facts from Oxc's semantic analysis, and two string conversions that stay apart.

Constant evaluation serves the optimizer. Values are null, boolean, number, and string. Truthiness follows JavaScript: a non-empty string is truthy, including a string of the digit zero. Numeric conversion is a separate step. A lone surrogate is refused. The optimizer will not fold a value JavaScript would not produce. Binary, octal, and hex integers whose significant digits exceed what an IEEE double can round once are left as written. Wider values can double-round.

Host transport is the other conversion. Most strings cross as UTF-8. A leading escape plus a JSON string is used when the value contains an isolated surrogate, or when the value itself starts with that escape. Oxc stores an isolated surrogate as a replacement character plus four hex digits. The encoder turns that marker back into the scalar the AST stored. A plain round-trip used to change lone surrogates and the spelling of negative zero. Folding and transport were split so a refusal in the optimizer is not also a lossy crossing.

The session index remembers where each node sits, who owns it, and which scope it belongs to. Scope ancestry is remembered once per scope. The indexes for types, calls, children, and traversal are built the first time something asks. A missing parent is distinguishable from the first node.

The index contains only what the route manifest requested. A new semantic field needs a key in the semantic field list, a generated field id, and a declaration on the visitor. A write is filled for identifier references, from the reference flags, and for member expressions. Declaring it on another node does not produce a value.
