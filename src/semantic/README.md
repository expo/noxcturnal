# Semantic facts

This directory derives node, scope, and reference facts from Oxc's semantic analysis. The [engine](../engine/README.md) retains the facts requested by visitor contracts and uses them to answer queries.

Constant evaluation may refuse a fold when it cannot reproduce JavaScript's value exactly, including cases involving lone surrogates or rounding of large numeric literals. Transport must preserve those values across the Rust/JavaScript boundary, including lone surrogates and negative zero.

Adding a visitor-visible fact requires agreement between semantic collection, the generated protocol field, and the visitor declaration. A field's existence in the schema does not mean it has a meaningful value on every node type.
