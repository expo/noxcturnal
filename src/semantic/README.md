# Semantic facts

This directory derives node, scope, and reference facts from Oxc's semantic analysis. The [engine](../engine/README.md) retains the facts requested by visitor contracts and uses them to answer queries.

Constant evaluation may refuse a fold when it cannot reproduce JavaScript's value exactly, including cases involving lone surrogates or rounding of large numeric literals. Transport must preserve those values across the Rust/JavaScript boundary, including lone surrogates and negative zero.

Adding a visitor-visible fact requires agreement between semantic collection, the generated protocol field, and the visitor declaration. A field's existence in the schema does not mean it has a meaningful value on every node type.

Direct export ownership is collected from declaration names and binding patterns
into a node-ID map. Binding renames use that identity and semantic scope; source
ranges are attached when constructing text edits. Initializer expressions,
parameters, and local declarations do not become exports through source-range
containment. Coordinate-based queries for immutable input remain text operations.

Capture batches use traversal intervals derived from the semantic scope tree to
select enclosing requested functions. Source ranges remain response locations;
they do not determine capture ownership, nesting, or lookup order. Program-binding
filters apply before capture records are materialized.

Shorthand rename roles match the actual binding or assignment target by node ID.
A default initializer can share a property's source anchor without becoming its
target. Shorthand object properties inside defaults retain their own rename role.
Import/export token-sharing checks describe immutable source spelling, rather
than declaration ownership.

Subtree intervals are derived from the retained traversal tape and parent links,
including when some exit carriers are omitted. Neither node-ID numeric order nor
source coordinates determine ancestry. The interval cache belongs to this index.
