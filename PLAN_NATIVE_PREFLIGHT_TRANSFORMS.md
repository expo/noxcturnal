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

## Research snapshot and decisions (Oxc 0.141.0)

The plan is pinned to the capabilities of the actual `0.141.0` Rust API, not the
latest documentation in the abstract:

- `TransformOptions` evaluates React Compiler first, then TypeScript, decorators,
  built-in plugins, JSX, and environment lowering. It exposes `react_compiler`,
  `typescript`, `jsx`, `env`, `assumptions`, and `helper_loader` directly.
- Target lowering is ESNext → ES2015, not a general ES5 compiler. In 0.141 the
  documented transformations are: explicit resource management; regexp `v`; class
  static blocks/fields/private members; logical assignment; nullish coalescing;
  optional chaining; export-namespace-from; optional catch binding; object
  rest/spread; async iteration and async generators; async functions; exponentiation;
  arrows; and regexp literal transforms (unicode properties/lookbehind/named groups,
  dotAll, sticky, and unicode). Numeric separators are removed by codegen.
- The consequential missing ES2015 transforms are block scoping, classes,
  destructuring, parameters, and `for...of`. Oxc also does not promise ES5 output.
  These are known gaps for `hermes-v0`/`webview`, not merely “suspected gaps.”
- Oxc runtime helpers default to `@oxc-project/runtime`; that package describes its
  helpers as copied from `@babel/runtime`, but package/path compatibility is not API
  parity. Noxcturnal therefore needs an explicit helper ABI rather than leaking the
  Oxc default into Expo output.
- Neither Oxc nor Babel syntax lowering supplies platform built-ins such as
  `Promise`, `Symbol`, `WeakMap`, `Object.assign`, or regexp engine behavior. Helper
  loading and polyfilling are separate concerns. Expo currently enables
  `@babel/plugin-transform-runtime` for helpers/regenerator but does not enable its
  `corejs` mode; preserve that posture.
- Oxc's React Compiler integration is experimental but deliberately runs on original
  source before type stripping and JSX lowering. Expo's Babel preset likewise adds
  React Compiler as early as possible and currently restricts it to opted-in,
  non-`node_modules`, client code.

These facts establish the initial coverage matrix below; N0 verifies it with pinned
crate fixtures and Expo differentials rather than rediscovering the architecture.

## N0: dependency spike and coverage matrix

- Add `oxc_transformer`, `oxc_codegen`, and `oxc_sourcemap` pinned to the existing
  `=0.141.0` family. Confirm crate names/APIs at that version; upgrade the whole Oxc
  pin in lockstep if the transformer requires it (regenerate the event-schema check).
- Produce a committed coverage matrix: for each plugin in the four base configs, note
  whether Oxc 0.141 provides it, provides it with different semantics, or lacks it.
  Verify rather than assume. Seed it with the documented result: block scoping,
  ES2015 classes, destructuring (`useBuiltIns`), parameters, and `for...of` are not
  lowered; async functions and async generators are lowered; TypeScript erasure, JSX
  (classic/automatic/dev), regexp transforms, and the ES2016–ES2022 features listed
  above are covered. For every covered item record the exact Oxc option, helpers
  emitted, target threshold, assumptions used, and Babel semantic differences.
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
- Ordering: expose one fused Oxc preflight where possible, but retain named hook
  boundaries for Expo visitors. Recommended order:
  source classification/Flow frontend → React Compiler → type strip →
  React-aware analysis and Expo source visitors → Refresh → JSX → target lowering →
  helper materialization → module/dependency transforms. Oxc's own fixed traversal
  order already matches Compiler → TS → JSX → env; do not split it into repeated
  parse/codegen cycles merely to mimic Babel plugin boundaries. If an Expo visitor
  must run between Oxc stages, benchmark a native AST hook or use one deliberate
  rendered boundary.
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

## N2a: helper ABI, runtime imports, and polyfill policy

Treat generated helpers as part of the transform contract, not as an incidental
codegen detail:

- Add `helpers: { mode: 'runtime' | 'inline', moduleName, version }`. Expo profiles
  default to `runtime`, `moduleName: '@babel/runtime'`, and the same resolved version
  used by `babel-preset-expo`. `inline` exists for scripts, because Metro's
  `metroSourceType === 'script'` cannot gain dependencies and Expo disables
  transform-runtime there.
- Implement a Noxcturnal helper loader/materializer that maps every helper requested
  by Oxc lowering to the matching `@babel/runtime/helpers/<name>` import. Do not
  textual-rewrite imports emitted by `@oxc-project/runtime`: consume Oxc's helper
  requests at the loader boundary, choose collision-free bindings, deduplicate per
  file, attach purity metadata, and emit ESM before module lowering. This may require
  a small upstreamable extension to Oxc's Rust helper-loader interface; N0 must prove
  whether 0.141 exposes enough customization before N1 is accepted.
- Maintain a committed helper-compatibility table:
  `Oxc helper → Babel helper path → minimum @babel/runtime version → export shape →
semantic differential`. A missing or non-equivalent helper produces structured
  `unsupported`; it never silently falls back to an inline Oxc helper in an Expo
  runtime profile.
- Keep helper imports visible to the normal dependency collector. Module lowering
  must happen after helper insertion so Metro sees the same generated dependencies
  it sees today. Test ESM/CJS, lazy imports, name collisions, duplicate helpers, and
  one-line-file dependency metadata.
- Regenerator is a helper/runtime concern only if a selected lowering actually emits
  it. Oxc 0.141 lowers async functions/generators with its own helper set; parity
  tests decide whether those helpers can map to Babel's
  `asyncToGenerator`/`wrapAsyncGenerator` family. Never inject a global
  `regeneratorRuntime`.
- Do not add usage-based `core-js` injection to preflight. Syntax lowering does not
  imply built-in polyfills, and Expo's present preset does not provide them. If a
  future target needs built-ins, add a separate declarative `polyfills` phase with an
  explicit compatibility dataset, entry-vs-usage policy, dependency metadata, and
  cache key; do not overload `helpers`.
- Gate: every helper reachable from the enabled profiles has a fixture compared with
  `@babel/plugin-transform-runtime` at the pinned runtime version. Runtime behavior,
  dependency metadata, script-mode inlining, and no-global-regenerator assertions
  must pass.

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

- **Delivery path: a narrow Hermes frontend, not a general Babel fallback.** Extend
  the parser-adapter surface with a source-stage contract:
  `supports(classification) → compile(source, filename, options) → { code, map, metadata } | unsupported`.
  The consumer registers a worker-local Flow adapter built on `hermes-parser`, the
  same frontend family used by React Native/Expo. Parse once with Flow detection,
  enable Hermes's built-in `TransformEnumSyntax`, strip type-only syntax/imports/
  exports on its Babel-compatible AST, and print plain JS/JSX plus a map. This avoids
  running Babel's plugin scheduler and avoids parsing once for classification and
  again for stripping. Keep the WASM module and printer hot for the Metro worker.
  - First spike the cheapest proven implementation: Hermes parse with
    `transformOptions.TransformEnumSyntax` plus one focused Flow-strip traversal and
    generator. If Babel's transform-flow-strip-types is materially faster or more
    complete on the RN corpus, use it temporarily with the Hermes parser; the
    contract remains narrow and replaceable.
  - Classify by extension/caller metadata and `@flow` pragma without parsing.
    `flow: 'detect'` preserves JS ambiguity behavior; use `flow: 'all'` only where the
    caller has authoritatively classified a file as Flow.
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

Efficiency decision gate: benchmark hot-worker throughput and peak RSS for (a)
Hermes parse + focused strip/print, (b) Hermes parser + Babel strip plugin, and (c)
the current complete Babel route over the exact 513-file corpus. Choose the fastest
option that reaches 100% syntax coverage outside Codegen and map parity; cache only
the final compiled result by source hash + adapter version/options, never the large
Flow AST. A native token stripper is not the default: modern Flow component/hook
syntax, enums, comments/directives, and grammar ambiguities make a second parser in
Rust a high-maintenance optimization unless profiling proves the adapter dominates.

## N4a: React Compiler integration

React Compiler is an optional source compiler boundary, not an ordinary post-lowering
visitor:

- Initial integration keeps Expo's current eligibility: explicit caller opt-in,
  client only, non-server, non-`node_modules`, and per-platform opt-out. Preserve the
  default opt-out directives (`use no memo`, `use no forget`) plus Expo's `widget`
  directive and user additions.
- Run it on original JSX and before target lowering. For TS/TSX, use Oxc's native
  `react_compiler` pass before its TypeScript pass. For Flow, the ordering must retain
  Flow component/hook syntax when `compilationMode: 'syntax'`; therefore either:
  (1) feed the Hermes/Babel-compatible original AST to the external compiler before
  stripping, or (2) keep that file on the existing Babel compiler route. Never strip
  Flow first in syntax mode.
- Treat the Oxc React Compiler API as experimental and version-coupled. Pin compiler
  version/options in the pipeline cache key and add an adapter conformance layer so
  Oxc API churn does not leak into the public pipeline schema. On compiler diagnostic
  or unsupported syntax, follow Expo's configured panic policy and route explicitly;
  do not partially compile.
- Compiler-generated runtime imports (`react/compiler-runtime` for React 19 targets
  or `react-compiler-runtime` for older targets) enter the same dependency metadata
  path as JSX and lowering helpers. Noxcturnal must not rewrite these through the
  Babel helper ABI.
- Gate independently from base preflight: compiler fixtures with opt-in/out
  directives, dev cache-reset behavior, target 17/18/19 runtime imports, sourcemaps,
  Refresh ordering, Flow syntax mode, and “never compile node_modules.” Base
  preflight ships without waiting for this gate.

## N5: legacy profiles — `hermes-v0` and `webview`

The largest confirmed Oxc coverage gap lives here (classes, destructuring with `useBuiltIns`,
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
   - Related workstream: `PLAN_TYPED_VISITOR_CONTRACTS.md` (typed per-visitor
     contracts) is independent of preflight, but its phases 1–2 should land before
     this plan adds new first-party visitors (display-name, Refresh, RSC analysis),
     so those are written against the typed surface once instead of migrated later.
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

## Primary references

- [Oxc 0.141 `TransformOptions` and fixed transform order](https://docs.rs/oxc/0.141.0/oxc/transformer/struct.TransformOptions.html)
- [Oxc transformer lowering coverage](https://oxc.rs/docs/guide/usage/transformer/lowering)
- [Oxc transformer overview and helper modes](https://oxc.rs/docs/guide/usage/transformer)
- [Oxc TypeScript transform options](https://oxc.rs/docs/guide/usage/transformer/typescript)
- [`hermes-parser` API and built-in Flow enum transform](https://www.npmjs.com/package/hermes-parser)
- [Babel transform-runtime helper and polyfill semantics](https://babeljs.io/docs/babel-plugin-transform-runtime/)
- [React Compiler configuration](https://react.dev/reference/react-compiler/configuration)
- [React Compiler compilation modes, including Flow syntax mode](https://react.dev/reference/react-compiler/compilationMode)
- [React Compiler guidance for runtime imports and plugin ordering](https://react.dev/reference/react-compiler/compiling-libraries)
