# Native binding

This directory loads the Rust addon for the current platform and translates TypeScript transform plans into native arguments. The [runtime](../runtime/README.md) calls the binding; the Rust [engine](../../src/engine/README.md) manages the source and parsed state behind it.

The loader first tries a binary beside the package, then the matching optional platform package. Only a missing binary permits fallback: hiding another load error could mask a broken installation. Published ESM bundles provide the CommonJS loader needed to load the addon.

Source and map layers stay in Rust across phases to avoid repeated large copies across the boundary.

Builds of the same package version can differ in native Flow support. Flow classification cache keys include that capability to prevent reuse across incompatible builds.

Prepared plans register their owned manifest buffers for lazy native compilation.
Sharing is keyed by the exact Buffer object, and registered buffers must remain
immutable. Unregistered raw buffers are validated on every native call. A compiled
handle snapshots the bytes and owns source-independent routing metadata; sessions
retain shared native ownership so closing one session cannot invalidate another.
