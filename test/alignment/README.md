# Transform alignment tests

These tests compare Noxcturnal with one canonical Babel or Hermes transform at a
time. `babel-preset-expo` is used only to identify the transforms and option
combinations Expo relies on; the full preset is deliberately not executed here.
The native passes those comparisons exercise are described in
[`src/preflight/README.md`](../../src/preflight/README.md). Flow erasure is
[`crates/hermes-flow`](../../crates/hermes-flow) plus [`src/flow.rs`](../../src/flow.rs).

The canonical versions are pinned in the root `package.json`. The inventory test
records the `babel-preset-expo` version used for the review, and
resolves the shipped Hermes, web, WebView, and React configs so plugin-list drift
must be classified explicitly.

Fixtures stay inline in their transform's test file. Prefer a small source case
that exposes semantics over a large snapshot. The Hermes parser-update matrix is
the exception: those rows live in `test/fixtures/flow-parser-update/` and are
shared with the public Flow tests.

## Comparison modes

- `alignBabelTransform` canonicalizes both outputs through the same Babel parser
  and generator, then requires structural equality. Use it when output structure
  is part of the transform contract.
- `alignBabelBehavior` runs both outputs in isolated VM contexts and compares the
  tagged value assigned to `globalThis.__result`, or their thrown outcome. It
  preserves `undefined`, special numbers, BigInt, collections, and object
  properties across VM realms. A thrown error is compared by `name` and
  `message`. Every behavioral fixture must also declare syntax that must be
  absent from (or present in) Noxcturnal's output, so a no-op transform cannot
  pass merely because Node supports the input.
- `alignHermesFlowTransform` uses the transforms exported by the pinned
  `hermes-parser`, strips the remaining Flow annotations, and compares that output
  structurally with native Flow erasure.
- `alignFlowDecoratorTransform` compares member-decorator preservation with
  Babel's Flow stripper. Hermes' Babel adapter drops those decorators, so parser
  acceptance is asserted separately.
- `expectBabelSupportedNoxcturnalBailout` documents an intentional native boundary
  while ensuring the selected Babel transform accepts the same source.

All helpers disable project Babel configuration. An alignment fixture must select
its Babel plugins and Noxcturnal preflight options explicitly.
