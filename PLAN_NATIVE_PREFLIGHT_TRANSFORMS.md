# Native preflight transforms: Flow, TypeScript, JSX, and syntax lowering

Date: 2026-07-24

Scope: give Noxcturnal built-in, toggleable "preflight" transforms that run natively
before the visitor phases, covering the base language work that `babel-preset-expo`
currently does with Babel: Flow handling, TypeScript erasure, JSX/TSX lowering, and
individually selected syntax transforms covering the preset's base configs
(`~/git/expo/expo/packages/babel-preset-expo/src/configs`: `flow`, `typescript`,
`react`, `hermes-v0`, `hermes-v1`, `web`, `webview`). Noxcturnal does not define
target or preset names: consumers own those recipes and compose them from orthogonal
transform toggles. The goal is that ordinary
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
- **Toggleable means declarative and orthogonal.** Every syntax lowering or
  compatibility transform has its own plain-data toggle on the pipeline, participates
  in `pipelineCacheKey`, and is snapshotted/frozen at definition like phases are
  today. Noxcturnal exposes capabilities, not target groups: names such as
  `hermes-v1`, `web`, or `webview` belong only to consumer-owned preset recipes.
  Enabling one transform must not implicitly enable another.
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
- Available lowering is ESNext → ES2015, not a general ES5 compiler. In 0.141 the
  documented transformations are: explicit resource management; regexp `v`; class
  static blocks/fields/private members; logical assignment; nullish coalescing;
  optional chaining; export-namespace-from; optional catch binding; object
  rest/spread; async iteration and async generators; async functions; exponentiation;
  arrows; and regexp literal transforms (unicode properties/lookbehind/named groups,
  dotAll, sticky, and unicode). Numeric separators are removed by codegen.
- The consequential missing ES2015 transforms are block scoping, classes,
  destructuring, parameters, and `for...of`. Oxc also does not promise ES5 output.
  These are known gaps for the transform recipes currently used by older Hermes and
  webview consumers, not merely “suspected gaps.”
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
  emitted, applicable runtime threshold, assumptions used, and Babel semantic
  differences.
- The matrix decides N3/N5 sequencing and is the stop/go evidence for each transform.
- Gate: spike lands only the dependency + matrix (in FITMENT.md), no behavior change.

## N1: native transform phase infrastructure

- Introduce a native phase kind in the pipeline: a phase with `native` transform
  options instead of JS plugins. It runs parse → `oxc_transformer` → `oxc_codegen`
  entirely in Rust and yields rendered code plus a mapping.
- Map integration reuses the WS6 machinery: convert Oxc's sourcemap tokens directly
  into the packed decoded layer format (`pack_decoded_layer`) — no VLQ encode at the
  phase boundary — and let `composeDecodedChain` compose it with visitor-phase layers
  exactly like any committed layer today.
- Options object (individual transform toggles, TypeScript, JSX, helper strategy) is part of the
  phase definition, frozen at `defineNativePipeline`, and hashed into
  `pipelineCacheKey`.
- The public shape has no `target` or `preset` field. Syntax work lives under an
  orthogonal `transforms` object, for example:
  `{ classStaticBlock: true, asyncGeneratorFunctions: true }`. Boolean transforms
  use `true`; transforms with semantic choices own a small options object. Unknown
  keys and `false` are rejected rather than normalized into an implicit group.
  TypeScript, JSX, helpers, comments, and compact output remain independent sibling
  concerns.
- Consumer packages may export recipe builders such as `expoHermesSdk56()` or
  `expoModernWeb()`, but those builders resolve to ordinary frozen preflight data
  before reaching Noxcturnal. Recipe identity is not part of execution or caching;
  the resolved toggle data is.
- Unsupported syntax or semantics produce a structured `unsupported` result (same
  shape as today's classification bailout) so the consumer can route the file to its
  fallback; never silently change semantics.
- Diagnostics carry the native phase's wall time separately under `debugPerformance`
  (`nativeTransformMs`), and `metadata.performance.phases` reports the phase like any
  other.
- Ordering: expose one fused Oxc preflight where possible, but retain named hook
  boundaries for Expo visitors. Recommended order:
  source classification/Flow frontend → React Compiler → type strip →
  React-aware analysis and Expo source visitors → Refresh → JSX → selected lowering →
  helper materialization → module/dependency transforms. Oxc's own fixed traversal
  order already matches Compiler → TS → JSX → env; do not split it into repeated
  parse/codegen cycles merely to mimic Babel plugin boundaries. If an Expo visitor
  must run between Oxc stages, benchmark a native AST hook or use one deliberate
  rendered boundary.
- Delete nothing yet; this stage is additive infrastructure with a no-op default.
- Gate: full `pnpm verify`; benchmark suite unchanged (no preflight enabled anywhere);
  a Rust test proving decoded-layer equivalence for a native phase (map from a native
  phase composed with a visitor phase matches the VLQ-composed reference).

## N2: TypeScript and JSX/TSX transforms

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
  eligibility gate `typed-or-jsx-extension` deleted for files the enabled transforms cover.

## N2a: helper ABI, runtime imports, and polyfill policy

Treat generated helpers as part of the transform contract, not as an incidental
codegen detail:

- Add `helpers: { mode: 'runtime' | 'inline', moduleName, version }`. Expo consumer recipes
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
  runtime-helper configuration.
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
- Gate: every helper reachable from the enabled transform toggles has a fixture compared with
  `@babel/plugin-transform-runtime` at the pinned runtime version. Runtime behavior,
  dependency metadata, script-mode inlining, and no-global-regenerator assertions
  must pass.

## N3: individually toggleable modern syntax lowering

Implement the smallest modern transform inventory first. The Expo consumer may
compose these into recipes currently called `hermes-v1` or `web`, but those recipe
names and groupings are not part of Noxcturnal's API:

- Independent toggles: block scoping, class static blocks, async generator functions,
  private methods, and private property-in-object. Options such as `loose` live on
  the transform that consumes them; they are never inherited from a target name.
- Each declarative transform toggle selects exactly one Oxc transform option or one
  Noxcturnal-native pass. Missing matrix items remain explicit unsupported results
  only when that exact toggle is requested (block scoping is the expected native-pass
  candidate).
- The one-off Hermes workarounds
  (`fix-hermes-v1-async-arrow-non-simple-params`,
  `fix-hermes-v1-super-in-object-accessor`, and
  `fix-hermes-v1-class-in-finally`) are explicitly **not** native preflight
  transforms. Keep them as separately maintained typed visitor plugins in ordinary
  pipeline phases, with the upstream plugins' fixtures. Consumers choose them in
  their recipes; their plugin identity/options already participate in the pipeline
  cache key.
- Loose-mode parity: differential tests for `loose: true` class/private semantics
  (define vs assign, getter/setter shadowing), not just snapshots.
- Code-generation posture (`comments`, `compact`) remains independent from syntax
  selection. A consumer recipe may set both, but enabling a Hermes workaround cannot
  silently strip comments or compact output.
- Gate each native toggle independently against the corresponding Babel language
  transform and each maintained one-off visitor against its upstream plugin fixtures
  (behavioral tests plus representative snapshots). Then gate consumer-owned recipes
  against the full Babel config. The benchmark suite must show that disabled toggles
  add no cost and record per-file native-phase time for enabled transforms.

## N4: Flow

Flow is the tricky one: Oxc does not parse Flow, and 513 of the 870 traced fallbacks
are Flow files (React Native core).

- **Delivery path: a narrow Hermes frontend, not a general Babel fallback.** Extend
  the parser-adapter surface with a source-stage contract:
  `supports(classification) → compile(source, filename, options) →
{ code, map, syntax: 'js' | 'jsx', metadata } | unsupported`.
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

Decision record (2026-07-24): use the focused Hermes path and do not transform the
Flow input with Babel. On all 637 non-Codegen `@flow` JS/JSX files in the installed
React Native 0.86 corpus (2.29 MB), three interleaved hot-worker rounds produced:

| path                                                                                                                           | coverage |  hot time/file |
| ------------------------------------------------------------------------------------------------------------------------------ | -------: | -------------: |
| Hermes ESTree parse → enum/match/component/record transforms → full Flow strip → bundled ESTree-to-Babel converter → generator |  637/637 | 0.421–0.451 ms |
| Hermes Babel AST → `@babel/plugin-transform-flow-strip-types` → generator                                                      |  637/637 | 1.026–1.134 ms |
| complete `babel-preset-expo` Hermes route                                                                                      |  637/637 | 1.987–2.075 ms |

The focused path is about 2.4x faster than the Babel Flow transform and 4.7x faster
than the complete preset route. The Expo adapter therefore depends only on the
already-required `hermes-parser` and `@babel/generator`; it does not add or execute
the Babel Flow transform plugin. The converter is loaded from the versioned Hermes
package because Hermes does not publicly export it; the actual Hermes and generator
versions are both included in adapter identity/cache keys. A consumer test guards
type-only import removal, annotation removal, maps, preserved `@flow` comments, and
continuation through native visitors.

The Expo consumer recipe selects a native language phase only when source inspection
finds work owned by that recipe (class static blocks, async generators, or JSX).
Flow without JSX is printed once by the adapter and does not pay a second native
parse/codegen boundary. The language phase stays non-compact because Metro's
dependency collector must still see ordinary string literals; final compaction is a
later consumer concern. Flow+JSX, helper-import collection, and the full source →
language → Metro module ordering have direct integration tests.

Helper versioning follows the existing Babel caller contract. Metro's
`config.enableBabelRuntime` is passed into the recipe. `ExpoMetroConfig` populates
that field with the project's resolved `@babel/runtime` version, and the Babel
transformer exposes the same string to Babel as caller `babelRuntimeVersion`.
Consequently, a string is the project runtime version targeted by both paths,
`false` selects dependency-free inline helpers, and only an absent/boolean value
uses Babel preset Expo's 7.20.0 fallback minimum. The recipe does not infer
compatibility from Metro-config's own installed runtime.

## N4a: React Compiler integration

React Compiler is an optional source compiler boundary, not an ordinary post-lowering
visitor:

- Initial integration keeps Expo's current eligibility: explicit caller opt-in,
  client only, non-server, non-`node_modules`, and per-platform opt-out. Preserve the
  default opt-out directives (`use no memo`, `use no forget`) plus Expo's `widget`
  directive and user additions.
- Run it on original JSX and before selected syntax lowering. For TS/TSX, use Oxc's native
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

Implementation checkpoint (2026-07-24): Noxcturnal enables Oxc 0.141's pinned
`react_compiler` feature behind an independent `reactCompiler` conformance object.
The exposed boundary is limited to compilation mode, panic threshold, React
17/18/19 target, development cache-reset policy, and additive opt-out directives;
unknown options are rejected. The conformance layer preserves `use no memo` and
`use no forget` because Oxc 0.141 treats custom directives as replacements despite
documenting them as additions. Tests cover all three runtime-module targets, fused
Compiler → TypeScript → JSX order, compiler-runtime dependency collection, maps,
the default and Expo `widget` opt-outs, and refusal to compile parser-adapted Flow
after stripping. Representative app TSX fixtures also run through the real
`babel-preset-expo` compiler route and the native route.

The Expo consumer now selects a dedicated app-source prepass when React Compiler is
explicitly enabled. It runs Oxc's fixed Compiler → TypeScript front-end on pristine
JS/JSX/TS/TSX, preserves JSX, and then runs the ordinary resolved Babel recipe with
Compiler disabled. Expo source plugins therefore still follow Compiler, Refresh
still follows those plugins, and Babel still owns JSX and module handling. The
end-to-end worker fixture proves compiler-runtime injection, `$RefreshReg$`, TS/JSX
handling, and a composed original TSX position. Node modules, Flow, Codegen, server
environments, custom transformers, and non-default project configs remain on Babel.
Because a project config can branch on Babel's caller, the consumer resolves and
compares the config again under the exact post-prepass caller before accepting
native output. The latest enabled native compiler microfixture measures 0.0427
ms/file; absent `reactCompiler` leaves the existing preflight paths unchanged. The
full benchmark guard remains green (0.3422 ms static visitor,
12.0249 ms dense 650 KiB edits, 13.8711/11.1010 ms copy cases, 7.3260 ms rendered
three-phase case). A five-round hot language-pipeline comparison on the
representative app TSX fixture measured Babel Compiler+TS+Refresh+JSX at
1.437/1.354/1.160/1.130/1.067 ms and native Compiler+TS followed by Babel
Refresh+JSX at 0.413/0.381/0.328/0.283/0.293 ms (3.48–3.99× faster); both outputs
contained the compiler runtime and Refresh registration. The
compiler raises the default release binary from about 3.2 MB to 4.8 MB, so it is
also an explicit Cargo feature. `--no-default-features` builds the smaller base and
returns `react-compiler-not-built` only when that exact option is requested; both
feature configurations pass `cargo check`.

## N5: remaining legacy transform toggles

The largest confirmed Oxc coverage gap lives here (classes, destructuring with `useBuiltIns`,
parameters, `for...of`, async-to-generator, unicode/named-group regex, block scoping,
plus `react-display-name`):

- Add one independent toggle for each feature that passes its semantic gate; never
  add a `hermes-v0` or `webview` switch. For each feature the N0 matrix marks missing:
  prefer contributing/adopting the Oxc
  transform upstream; implement as a Noxcturnal-native pass only when the feature is
  small and stable (regex transforms, display-name); otherwise that transform toggle
  declares the feature `unsupported` and the consumer keeps those files on Babel.
- The missing ES2015 inventory is still declarative one by one:
  `classes`, `destructuring: { useBuiltIns }`, `parameters`, and `forOf`. Each
  structured boundary is syntax-specific, so enabling `classes` does not reject a
  class-free file merely because the capability is unavailable in Oxc 0.141.
- `react-display-name` fits the existing visitor/edit architecture — implement it as
  an Expo-owned visitor, not a preflight pass. The Metro-config consumer now owns
  this visitor for the legacy/default profile: it matches Babel's one-object-argument
  `React.createClass`/`createReactClass` cases, preserves explicit names, infers
  assignment/property/declarator and default-export names, and remains disabled for
  Hermes V1. This removes the former blanket `react-display-name` fallback without
  adding a Noxcturnal native-transform toggle.
- Explicit stop condition: if the consumer's older-Hermes or webview recipe cannot
  reach behavioral parity
  without reimplementing a large fraction of Babel's ES2015 lowering, ship them as
  partial consumer recipes (native for what Oxc covers, Babel for the rest) and
  record that boundary in FITMENT.md rather than forcing completeness. Noxcturnal's
  individual toggles remain runtime-agnostic.

## N6: consumer integration and evidence

- Replace the consumer's per-feature eligibility gates with a consumer-owned recipe
  of preflight toggles selected per platform/SDK; fallback telemetry keeps counting
  whatever remains. The `typed-or-jsx-extension` gate and supported
  `flow-requires-parser-adapter` cases are now removed: JS/JSX/TS/TSX select their
  parser and language capabilities independently, while Flow selects the registered
  source adapter before the same recipe continues.
- Traced cold-bundle procedure (2g spans, direct iOS bundle request against
  `apps/router-e2e`, matched-file comparison) before/after each consumer recipe change.
- Consumer evidence target: full-route coverage from 296/1,166 modules to >90% of JS
  modules for the SDK 56+ Hermes recipe; controlled cold bundle at or below ~1.25 s (prior estimate for a
  Babel-free default pipeline was ~0.9–1.2 s). If an expanded route cannot get below
  ~1.3 s with output-graph parity, reassess preflight scope rather than pushing
  through.
- metro-config jest suites green throughout; new suites for preflight routing.

Evidence checkpoint (2026-07-24): a clean Hermes iOS request against
`apps/router-e2e` transformed 1,257 JS modules, completed 1,155 (91.9%) through the
full native route, and invoked Babel 86 times. The final request completed in 1.234 s.
Before the Expo-owned maintained `super` visitor, the matched trace completed 1,129
modules natively, invoked Babel 112 times, and took 1.320 s. Both bundles contain
1,278 module wrappers. The final graph has one additional, correct dependency edge:
the focused Hermes Flow stripper was found to drop value-bearing side-effect imports
alongside type-only imports, so the adapter now preserves those nodes and directly
tests Metro collection. This clears the numeric N6 coverage and cold-time gates;
behavioral suites and the remaining completion audit still apply.

Project Babel configs are resolved by Babel and compared with the default Expo
preset descriptor and effective top-level options. The canonical
`apps/router-e2e` config is equivalent and retains this route; added plugins,
changed preset options, or other effective options fall back. This comparison does
not inspect config source or bless filenames. Babel still resolves the project side
for every filename so overrides remain authoritative; only the invariant default
descriptor is cached by caller and resolution roots.

The Expo consumer now also runs representative TS runtime constructs, source-map
positions, namespaces, and automatic JSX selection through the real
`babel-preset-expo` configuration and the native route. That differential exposed
and fixed an ordering bug: TypeScript/JSX language work now runs before ordinary
Expo visitors, so a visitor such as block scoping cannot edit a declaration inside
a namespace before Oxc expands it. Expo's Babel configuration selects
`react/jsx-runtime` in both development and production; development policy outside
this language phase must not silently select `jsx-dev-runtime`. The complete
consumer differential also compares the surviving TS/TSX dependency edges: type-only
imports disappear while runtime and JSX-runtime imports remain. A default Expo
transformer is not sufficient proof that this recipe applies, because a project
Babel config can replace the preset or its JSX/runtime policy. The consumer now
compares Babel's resolved descriptors and effective options with the default recipe
and falls back only when they differ; explicitly disabled lookup remains
authoritative. A hot classifier microbenchmark measured 31.5 ms for 1,000 distinct
filenames after caching the invariant default side. Independent Babel-plugin
behavior differentials also cover class static blocks, logical assignment,
loose/spec optional chaining and nullish coalescing, optional catch binding,
exponentiation, sticky regexp, export namespace, spec object rest/spread, explicit
resource management, and both class-property modes. Async-function and
async-generator fixtures additionally
compare Promise/await, delegation, and `for await` runtime behavior against their
Babel transforms. A behavioral 12-case JSX matrix covers classic/automatic ×
development/production × JS/JSX/TSX, and 12 real-preset cases cover
client/server × development/production × JS/JSX/TSX. Each fixture selects exactly
one native transform toggle;
the consumer remains the only owner of transform recipes. The complete metro-config
check is 48 suites, 1,004 passing tests, 4 skipped, and 374 snapshots. The upstream
`babel-preset-expo` matrix is also green at 28 suites, 598 passing tests, 4 skipped,
and 339 snapshots. The one-off `fix-hermes-v1-*` transforms remain ordinary
Expo-maintained visitors: none is a native preflight lowering toggle.

The matched cold `apps/router-e2e` compiler trace measured native-prepass medians
of 1.327 s versus 1.360 s for the former all-Babel compiler route, while preserving
1,278 Metro module wrappers and reducing the bundle by 2,817 bytes. The compiler-off
baseline was 1.205/1.182 s. Although the opt-in compiler route crosses the plan's
1.3 s reassessment threshold, reverting it is slower; the added time is compiler
work rather than a disabled-path regression. Across 1,284 transformed files the
native route retained 86 Babel spans, made 1,253 full Nox attempts, and produced
184 Nox spans, so unsupported/config-sensitive files still route explicitly.

## Order and gates

1. N0 → N1 land first (spike, then infrastructure with a no-op default).
2. N2 (TypeScript + JSX) is the first user-visible transform set — it unlocks app code and
   the 63 typed-extension fallbacks with the least semantic risk.
3. N3 modern individual toggles next; N4 (Flow) can proceed in parallel with N3
   since it is adapter work, not Oxc transform work. Consumer-owned Hermes and web
   recipes are integration fixtures, not library API.
   - Related workstream: `PLAN_TYPED_VISITOR_CONTRACTS.md` (typed per-visitor
     contracts) is independent of preflight, but its phases 1–2 should land before
     this plan adds new first-party visitors (display-name, Refresh, RSC analysis),
     so those are written against the typed surface once instead of migrated later.
4. N5 last, gated on the N0 matrix and an explicit go/partial/stop decision.
5. N6 evidence runs continuously; each consumer recipe gate flips only with its
   traced parity proof, while each library toggle retains its own unit/differential
   gate.

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
