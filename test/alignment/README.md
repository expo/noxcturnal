# Transform alignment tests

These tests compare Noxcturnal with one canonical Babel or Hermes transform at a
time. `babel-preset-expo` is used only to identify the transforms and option
combinations Expo relies on; the full preset is deliberately not executed here.

The canonical versions are pinned in the root `package.json`. The inventory test
records the `babel-preset-expo` version and Expo commit used for the review, and
resolves the shipped Hermes, web, WebView, and React configs so plugin-list drift
must be classified explicitly.

Fixtures stay inline in their transform's test file. Prefer a small source case
that exposes semantics over a large snapshot.

## Comparison modes

- `alignBabelTransform` canonicalizes both outputs through the same Babel parser
  and generator, then requires structural equality. Use it when output structure
  is part of the transform contract.
- `alignBabelBehavior` runs both outputs in isolated VM contexts and compares the
  tagged value assigned to `globalThis.__result`, or their thrown outcome. It
  preserves `undefined`, special numbers, BigInt, collections, error identity,
  and object properties across VM realms. Every behavioral fixture must also
  declare syntax that must be absent from (or present in) Noxcturnal's output,
  so a no-op transform cannot pass merely because Node supports the input.
- `alignHermesFlowTransform` uses the transforms exported by the pinned
  `hermes-parser`, strips the remaining Flow annotations, and compares that output
  structurally with native Flow erasure.
- `expectBabelSupportedNoxcturnalBailout` documents an intentional native boundary
  while ensuring the selected Babel transform accepts the same source.

All helpers disable project Babel configuration. An alignment fixture must select
its Babel plugins and Noxcturnal preflight options explicitly.
