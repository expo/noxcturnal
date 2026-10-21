# Native runtime

This crate is the addon the package loads. TypeScript decides what a phase may do. This tree parses the file, answers queries, rewrites syntax, and commits edits. The TypeScript package under [`js/`](../js/) is the other side of that boundary.

Flow erasure keeps a private field with no value. It still declares the class-scoped name used by reads and by the `in` operator. The type annotation on that field is erased. A declared field is removed, private or public, because it never exists at runtime. A public field that has a type and no value is removed when it is not decorated. A decorated one stays, because the decorator is a runtime call.

## How to report a failure

Throw when the input or the configuration was illegal, or a resource limit was hit. Parse failures use UTF-16 columns and are tagged so the JavaScript side can turn them into syntax errors without relying on the error's type. A source map that exceeds either of its budgets throws too.

Return a decline, with no code and no map, when the file is legal and this transform will not take it. The caller gets a bailout and keeps the original source. A namespace that exports a mutable binding is that kind of decline only when every diagnostic from the visit is that one Oxc limitation. Any other diagnostic in the list keeps the failure fatal. An escaped regexp name that the parser cannot accept takes the decline path as well. Other parse diagnostics throw.

Return an error when a rewrite already ran and the result still breaks a postcondition. The partial buffer is dropped, and the caller gets a fatal transform error.
