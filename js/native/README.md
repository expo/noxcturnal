# Native binding

This is where JavaScript loads the addon, and where a native plan is flattened into the flags Rust expects.

The loader looks for a binary built for this process: operating system, architecture, and, on Linux, glibc or musl. Linux uses glibc when the process report has a glibc runtime version, and musl otherwise. It tries a colocated binary beside the package, then the matching optional package. From source the colocated binary is at the repo root. From a published build it is in the package output. A missing binary falls through. Any other load error is rethrown, so a bad binary is not hidden behind the optional package. Published ESM has no CommonJS loader, so the bundle defines one before this module runs.

One addon instance is loaded. Source text and map layers stay on the native side. Copying the source or the finished map back, and running an all-native pipeline, are the calls that move a large payload across.

A plan becomes paired flags: the switch, plus the companion that configures it. Module context is forwarded only when the plan sets it. Dead-code elimination is the only pass that reads it. When it is set, that pass may remove a script's unused top-level function bindings, because a bundler may wrap that script later. Parsing stays script semantics.

Flow erasure is probed once. A binary built without it declines, and an adapter may try. Two builds of the same package version can differ, so the classification cache key includes the probe for a Flow file. A throw is a malformed buffer, a cover-grammar node, or a construct no implementation compiles.
