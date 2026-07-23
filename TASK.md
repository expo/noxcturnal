# Native preflight transforms: Flow, TypeScript, JSX, and syntax lowering

Date: 2026-07-24

Scope: give Noxcturnal built-in, toggleable "preflight" transforms that run natively
before the visitor phases, covering the base language work that `babel-preset-expo`
currently does with Babel: Flow handling, TypeScript erasure, JSX/TSX lowering, and
per-target syntax lowering matching the preset's base configs
(`~/git/expo/expo/packages/babel-preset-expo/src/configs`: `flow`, `typescript`,
`react`, `hermes-v0`, `hermes-v1`, `web`, `webview`). The goal is that ordinary
application and dependency code no longer needs Babel at all; Babel remains only an
explicit consumer-side fallback boundary for custom transformers and external
compilers (React Compiler, Worklets, Codegen).

Why now: the traced cold iOS bundle on `apps/router-e2e` (2026-07-24) shows the full
Noxcturnal route is 5.3x faster than the Babel-equivalent stages on matched files, but
covers only 296 of 1,166 JS modules. The fallback population is language work, not
policy: 513 Flow files, 208 files needing destructuring/parameter lowering, 63 TS/JSX
extensions, 21 class-lowering, 21 RN codegen. Preflight transforms recover almost all
of it.

Standing rules for every task below:

- **Performance must not degrade.** Record `pnpm benchmark` before starting; the
  2026-07-24 record (`bench-ws6-r1-c1-final.txt`) has these gates: `1 changed text
phases: rendered` ~0.35 ms, `650 KiB dense edits` ~12.5 ms, copy benches ~15.1 /
  ~12.2 ms, `650 KiB, 3 changed text phases: rendered` ~7.5 ms. Noisy benches get a
  dedicated interleaved A/B (swap `.node` + `dist` between alternating rounds) before
  accepting or rejecting a change. A pipeline with no preflight options enabled must
  cost nothing: the 1-phase and dense benches are the guard.
- **Toggleable means declarative.** Every preflight option is plain data on the
  pipeline (profile names mirroring the preset configs), participates in
  `pipelineCacheKey`, and is snapshotted/frozen at definition like phases are today.
- **No legacy or compatibility paths inside Noxcturnal.** One transform pipeline;
  preflight stages are native phases in the existing phase model, not a parallel
  engine. The Babel fallback lives in the consumer as an explicit boundary for files
  preflight declares unsupported — a routing decision, not a dual implementation.
- **Parity is behavioral, not textual.** Gates run `babel-preset-expo`'s fixtures and
  runtime-behavior tests through both pipelines. Do not assume Oxc defaults match
  Babel loose-mode semantics; evaluation order, getters/setters, private fields, and
  helper behavior need explicit differential tests (`loose: true` is set across the
  preset's class/private transforms).

## N0: dependency spike and coverage matrix

- Add `oxc_transformer`, `oxc_codegen`, and `oxc_sourcemap` pinned to the existing
  `=0.141.0` family. Confirm crate names/APIs at that version; upgrade the whole Oxc
  pin in lockstep if the transformer requires it (regenerate the event-schema check).
- Produce a committed coverage matrix: for each plugin in the four base configs, note
  whether Oxc 0.141 provides it, provides it with different semantics, or lacks it.
  Verify rather than assume, especially the suspected gaps: block scoping,
  ES2015 classes, destructuring (`useBuiltIns`), parameters, `for...of`, and
  async-to-generator pairing. Known-covered candidates: TypeScript erasure, JSX
  (classic/automatic/dev), regexp transforms (unicode, named groups), ES2016–ES2022
  features (exponent, optional catch, optional chaining, nullish coalescing, logical
  assignment, class properties/static blocks/private members, async generators).
- The matrix decides N3/N5 sequencing and is the stop/go evidence for each profile.
- Gate: spike lands only the dependency + matrix (in FITMENT.md), no behavior change.

## N1: native transform phase infrastructure

- Introduce a native phase kind in the pipeline: a phase with `native` transform
  options instead of JS plugins. It runs parse → `oxc_transformer` → `oxc_codegen`
  entirely in Rust and yields rendered code plus a mapping.
- Map integration reuses the WS6 machinery: convert Oxc's sourcemap tokens directly
  into the packed decoded layer format (`pack_decoded_layer`) — no VLQ encode at the
  phase boundary — and let `composeDecodedChain` compose it with visitor-phase layers
  exactly like any committed layer today.
- Options object (target profile, typescript, jsx, helper strategy) is part of the
  phase definition, frozen at `defineNativePipeline`, and hashed into
  `pipelineCacheKey`.
- Unsupported syntax or semantics produce a structured `unsupported` result (same
  shape as today's classification bailout) so the consumer can route the file to its
  fallback; never silently change semantics.
- Diagnostics carry the native phase's wall time separately under `debugPerformance`
  (`nativeTransformMs`), and `metadata.performance.phases` reports the phase like any
  other.
- Ordering: preflight phases are ordinary phases, so React-structure-sensitive visitor
  phases (Refresh, display-name, RSC analysis) can be scheduled _before_ the JSX
  lowering phase and module/dependency phases after it. Document the recommended
  order: type strip → React-aware analysis → JSX lowering → target lowering → module
  transforms.
- Delete nothing yet; this stage is additive infrastructure with a no-op default.
- Gate: full `pnpm verify`; benchmark suite unchanged (no preflight enabled anywhere);
  a Rust test proving decoded-layer equivalence for a native phase (map from a native
  phase composed with a visitor phase matches the VLQ-composed reference).

## N2: TypeScript and JSX/TSX profiles

- TypeScript erasure via the Oxc TS transform: annotations, type-only imports/exports
  (removed before module conversion and dependency collection), `as`/`satisfies`,
  non-null assertions, `declare`, accessibility modifiers; runtime constructs (enums,
  namespaces, parameter properties) through Oxc where semantics match Babel's
  `@babel/plugin-transform-typescript`; import-equals/export-assignment per current
  preset support.
- Decorators (legacy and modern) are explicitly `unsupported` at first — precise
  fallback, not approximation.
- JSX lowering matching the preset's `react` config: automatic and classic runtimes,
  `jsxImportSource` and file-level pragmas, development output (source/self via
  `jsx-development`), production pure annotations, fragments, spreads, member
  expressions; generated runtime imports must surface in dependency metadata the same
  way `import_support` does today.
- `.d.ts`/`.mts`/`.cts` classification behavior is unchanged.
- Gate: run `babel-preset-expo`'s TypeScript and React fixture suites through both
  pipelines (classic/automatic × dev/prod × JS/JSX/TSX × client/server); dependency
  metadata and TraceMap positions compared, runtime behavior fixtures pass; consumer
  eligibility gate `typed-or-jsx-extension` deleted for files the profile covers.

## N3: syntax lowering profiles — `hermes-v1` and `web` first

These two have the smallest plugin sets and unblock the modern targets:

- `hermes-v1` (SDK 56+): block scoping, class static blocks (`loose`), async
  generator functions, plus the three Hermes fix plugins
  (`fix-hermes-v1-async-arrow-non-simple-params`, `fix-hermes-v1-super-in-object-accessor`,
  `fix-hermes-v1-class-in-finally`) ported as small native passes with the upstream
  plugins' own test fixtures.
- `web` (modern): class static blocks, private methods, private property-in-object
  (all `loose`).
- Express profiles as declarative target descriptors that select Oxc transform
  options plus Noxcturnal-native passes for anything the matrix marked missing
  (block scoping is the expected native-pass candidate for `hermes-v1`).
- Loose-mode parity: differential tests for `loose: true` class/private semantics
  (define vs assign, getter/setter shadowing), not just snapshots.
- Match the preset's output posture per profile (`comments: false`, `compact: true`
  for Hermes profiles) via `oxc_codegen` options; decide and document whether comment
  stripping is part of the profile or left to minification.
- Gate: differential fixtures against the Babel profile output (behavioral tests plus
  representative snapshots); traced consumer run shows the Hermes eligibility gates
  for covered features removed; benchmark suite holds (preflight phases add cost only
  where enabled — record per-file native-phase time in the trace).

## N4: Flow

Flow is the tricky one: Oxc does not parse Flow, and 513 of the 870 traced fallbacks
are Flow files (React Native core).

- **Delivery path: source-stage compiler adapter.** Extend the parser-adapter surface
  with a source-stage contract:
  `supports(classification) → compile(source, filename, options) → { code, map, metadata } | unsupported`.
  The consumer registers a Flow adapter built on `hermes-parser` (the same frontend
  the preset uses via `babel-plugin-syntax-hermes-parser` with
  `parseLangTypes: 'flow'`), performing type stripping, Flow enum lowering
  (`babel-plugin-transform-flow-enums` semantics), and type-import/export removal —
  producing plain JS/JSX plus a map before Noxcturnal parses it.
  - The adapter's map enters as the innermost layer (compose once at the input
    boundary; prefer handing it over decoded rather than VLQ if the adapter can).
  - Adapter identity + version + options join the transform cache key.
  - Comments, directives, and JSX must survive stripping (Refresh and directive
    detection depend on them).
- **Native spike (decide, don't assume):** evaluate replacing the JS-side adapter
  with a native strip. Options in preference order: (1) Oxc gains Flow support
  upstream (track, don't wait); (2) a Rust port of token-level Flow stripping for the
  restricted RN dependency grammar, validated against the full RN corpus by diffing
  against hermes-parser output; (3) keep the JS adapter permanently — it only pays on
  Flow files and hermes-parser is fast. Record the decision with corpus numbers.
- Out of scope: React Native Codegen's schema-bearing Flow declarations keep their
  existing fallback (`react-native-codegen` gate stays).
- Gate: RN core corpus (the 513 traced files) round-trips: adapter + Noxcturnal
  output is behaviorally equivalent to the Babel pipeline, maps symbolicate through
  the composed chain, and the `flow-requires-parser-adapter` fallback disappears for
  supported files. Measure adapter cost per file in the trace.

## N5: legacy profiles — `hermes-v0` and `webview`

The largest Oxc coverage risk lives here (classes, destructuring with `useBuiltIns`,
parameters, `for...of`, async-to-generator, unicode/named-group regex, block scoping,
plus `react-display-name`):

- For each feature the N0 matrix marks missing: prefer contributing/adopting the Oxc
  transform upstream; implement as a Noxcturnal-native pass only when the feature is
  small and stable (regex transforms, display-name); otherwise the profile declares
  the feature `unsupported` and the consumer keeps those files on Babel.
- `react-display-name` fits the existing visitor/edit architecture — implement it as
  an Expo-owned visitor, not a preflight pass.
- Explicit stop condition: if `hermes-v0`/`webview` cannot reach behavioral parity
  without reimplementing a large fraction of Babel's ES2015 lowering, ship them as
  partial profiles (native for what Oxc covers, Babel for the rest) and record that
  boundary in FITMENT.md rather than forcing completeness. SDK 56+ (`hermes-v1`) is
  the strategic target; `hermes-v0`/`webview` are long-tail.

## N6: consumer integration and evidence

- Replace the consumer's per-feature eligibility gates
  (`expo-metro-eligibility:*`, `typed-or-jsx-extension`,
  `flow-requires-parser-adapter`) with preflight configuration selected per
  platform/SDK profile; fallback telemetry keeps counting whatever remains.
- Traced cold-bundle procedure (2g spans, direct iOS bundle request against
  `apps/router-e2e`, matched-file comparison) before/after each profile lands.
- Targets: full-route coverage from 296/1,166 modules to >90% of JS modules on
  `hermes-v1`; controlled cold bundle at or below ~1.25 s (prior estimate for a
  Babel-free default pipeline was ~0.9–1.2 s). If an expanded route cannot get below
  ~1.3 s with output-graph parity, reassess preflight scope rather than pushing
  through.
- metro-config jest suites green throughout; new suites for preflight routing.

## Order and gates

1. N0 → N1 land first (spike, then infrastructure with a no-op default).
2. N2 (TypeScript + JSX) is the first user-visible profile — it unlocks app code and
   the 63 typed-extension fallbacks with the least semantic risk.
3. N3 (`hermes-v1`, `web`) next; N4 (Flow) can proceed in parallel with N3 since it
   is adapter work, not Oxc transform work.
4. N5 last, gated on the N0 matrix and an explicit go/partial/stop decision.
5. N6 evidence runs continuously; each profile's consumer gate flips only with its
   traced parity proof.

## Verification discipline

1. `nix develop -c pnpm verify`, clippy `-D warnings`, `cargo fmt --check`,
   `git diff --check`, `pnpm format`.
2. `pnpm benchmark` against the recorded baseline; interleaved A/B (swap `.node` +
   `dist` between alternating rounds) for any suspected delta on noisy benches —
   full-suite runs drift ~5% on this machine and are not authoritative.
3. Consumer claims need the traced cold-bundle procedure with matched-file span
   comparison and the metro-config jest suites green.
4. Behavioral parity gates run `babel-preset-expo` fixtures through both pipelines;
   snapshots alone do not count for lowering semantics.
