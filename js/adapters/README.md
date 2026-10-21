# Parser adapters

Adapters convert syntax the native parser cannot handle into JavaScript or JSX before the normal pipeline runs. They return source text and mappings.

The [runtime](../runtime/README.md) classifies input through Rust, tries native Flow erasure where applicable, then consults caller-registered adapters if the source remains unsupported. Naming an adapter pins that implementation and bypasses native Flow erasure. Supported input skips adapters entirely.

`classification.ts` bridges to Rust classification. `registry.ts` manages caller-provided adapters; there are no built-in adapter compilers here. See [`ParserAdapter`](../types.ts) for the registration and compilation contract.

Later phases use the adapter's declared output syntax, even if its JavaScript retains an `@flow` comment. Its mappings compose with the pipeline's other maps.

An intentional decline returns a bailout with the caller's original source. Exceptions remain failures.

Change the adapter's version when its output changes. Cache keys use its declared name, version, and options; they cannot detect changes inside its implementation.
