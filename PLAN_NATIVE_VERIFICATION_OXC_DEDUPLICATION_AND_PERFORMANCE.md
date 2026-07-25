# Native Pipeline Verification, Oxc Deduplication, Helper Provenance, and Performance Plan

## Purpose

This plan follows `PLAN_BABEL_PRESET_EXPO_NATIVE_REPLACEMENT.md`. The previous
plan moved ordinary Expo application and dependency modules from Babel onto
Noxcturnal, added native language and Metro passes, retained explicit
compatibility boundaries, and established broad differential and performance
coverage. This follow-up does not assume that a passing compatibility suite
proves the implementation is minimal or optimal. It audits whether:

1. the replacement is correct across the supported Expo matrix;
2. Noxcturnal duplicates transforms already implemented correctly by the pinned
   `oxc_transformer`;
3. every bailout is known, tested, measurable, and intentionally retained;
4. every runtime and inline helper is derived from the selected
   `@babel/runtime`, rather than a handwritten approximation;
5. the pipeline performs the minimum number of parses, semantic builds, AST
   traversals, renders, allocations, and JavaScript crossings; and
6. the focused private-class and legacy-class passes justify their cost versus
   Oxc's built-in class transforms.

The output of this plan is an evidence-backed decision for every custom pass:
keep it, replace it with Oxc, narrow it to a compatibility repair, or remove it.

## Outcome of the Previous Plan

The completed plan established the following baseline:

- Native Rust lowering for block scoping, parameters, destructuring,
  `for...of`, legacy classes, loose private methods/private-in, object
  rest/spread, and the supported regexp corpus.
- Oxc-backed TypeScript, JSX, React Refresh, React Compiler, and the other
  supported modern transforms.
- Fused native Metro constant folding and fixed-point dead-code elimination.
- Expo-owned native module, dependency, wrapping, inline-require, environment,
  React Native Web, Router, UI, widget, React Server, DOM, and warning passes.
- A pristine-source Babel boundary for React Native Codegen, custom Babel
  configuration, Worklets/Reanimated, decorators, legacy
  `export v from`, and explicitly unsupported semantics.
- Exhaustive public-transform ownership snapshots, strict typechecking of all
  executable tests, Babel/runtime differentials, source-map checks, and a
  production/development corpus matrix.
- Separation of Codegen classification and the Hermes Flow parser adapter from
  the main Expo transformer.

The last full verification passed:

- 204 Noxcturnal JavaScript tests.
- 20 Noxcturnal Rust tests.
- Nix-backed build, architecture, code generation, strict type checks,
  formatting, Clippy, package validation, and declaration snapshot checks.
- 302 Expo transformer tests and 19 snapshots.
- Expo TypeScript, formatting, lint, and diff checks. Lint reported only the
  intentional runtime-evaluation `Function` constructor warnings.

The last maintained benchmark means were:

| Workload                                                       |     Mean |
| -------------------------------------------------------------- | -------: |
| Fused Metro constant folding and DCE                           | 0.618 ms |
| 200 production TypeScript/JSX components                       | 0.233 ms |
| 200 development React Refresh components                       | 0.272 ms |
| 200 focused private-feature classes plus 200 unrelated classes | 14.39 ms |
| 500 legacy classes                                             | 15.23 ms |
| 200 non-Hermes legacy modules                                  | 1.442 ms |

These measurements are the comparison baseline, not permanent acceptable
thresholds.

### Real `router-e2e` baseline

A subsequent five-run, alternating cold-cache benchmark used
`apps/router-e2e`, `expo start --clear`, and an iOS Hermes bundle request.
`pnpx 2g` debug spans showed the native pipeline completing roughly 1,100 files
fully and leaving roughly 120 files on Babel. Directionally:

- end-to-end bundling improved from about 1.9 seconds with forced Babel to about
  1.4 seconds with Noxcturnal;
- matched full-native files used about 4.1 ms of aggregate worker time per file,
  versus about 6.5 ms for their Babel transform spans;
- complete per-file transform spans were about 4.2 ms natively versus about
  9.8 ms on the Babel route; and
- the native graph contained slightly fewer modules and produced a meaningfully
  smaller development bundle.

This validates the architectural direction, but **does not meet the per-file
performance target**. A roughly 4 ms average full-native transform is still too
expensive for the desired Metro hot path. End-to-end improvement is not a
substitute for reducing parse, semantic, traversal, helper, mapping, and render
cost per file.

The same trace also showed avoidable full-path fallbacks for optional CommonJS
requires, captured-loop lowering, Flow adapter routing, application/workspace
routing, and one follow-up-batch budget exhaustion. React Native Codegen remains
an intentional Babel boundary, but the other observed families must be reduced
or made substantially cheaper.

## Required Deliverables

Create and keep the following generated or reviewed artifacts:

1. `audit/transform-ownership.json`
   - Every public transform and internal syntax pass.
   - Oxc capability and exact pinned Oxc option/pass, if available.
   - Noxcturnal implementation owner.
   - Expo profile selecting it.
   - Semantic differences and final keep/replace/narrow decision.
2. `audit/bailouts.json`
   - Every statically declared and dynamically parameterized bailout.
   - Layer, owner, source location, triggering fixture, pristine-source
     guarantee, Babel destination, frequency, and disposition.
3. `audit/helper-provenance.json`
   - Every helper name, selected runtime version, runtime import path, generated
     inline source hash, module format, dependencies, and tests.
4. `audit/performance.json`
   - Machine and build metadata, benchmark samples, confidence intervals,
     allocation/parse/traversal counters, baseline comparison, and thresholds.
5. A concise final report updating the previous plan's completion ledger with
   the decisions and measured changes.

Generated artifacts must have deterministic check commands and fail CI when
the source registry changes without an updated disposition.

## Phase 1: Freeze and Reproduce the Correctness Baseline

### 1.1 Record the exact toolchain

- Record the Noxcturnal commit, Expo commit, Rust toolchain, target triple,
  Node, pnpm, Nix flake lock, `oxc_*` crate versions, Babel packages, and every
  installed `@babel/runtime` version.
- Confirm that the linked Noxcturnal package used by Expo points at the current
  build, not a stale native binary or declaration directory.
- Make benchmark and differential commands print these versions.

### 1.2 Run the complete gates from clean build products

- Remove only generated build products through existing clean scripts.
- Rebuild native and JavaScript packages under `nix develop`.
- Run `nix develop -c pnpm verify` in Noxcturnal.
- Run the complete `@expo/metro-config` typecheck, test, lint, formatting, and
  diff-check gates.
- Run package packing and load the packed artifact in a temporary consumer so
  tests do not accidentally depend on unpublished workspace source.
- Run tests with debug and release native builds where behavior could vary.

### 1.3 Expand end-to-end verification

- Transform representative real Expo package and application corpora, not only
  synthetic fixtures.
- Run the same Metro graph through native completion and the pristine Babel
  route, comparing:
  - runtime exports and thrown errors;
  - dependency names, kinds, locations, optionality, contexts, and import
    counts;
  - Metro metadata and function maps;
  - source-map traces at statements, expressions, function names, helpers,
    wrappers, and generated proxies;
  - warnings and code-frame locations;
  - stable bailout classification.
- Include development/production, Hermes V0/V1, non-Hermes, iOS/Android/web,
  Node, React Server, DOM/webview, graph-optimization, minified/unminified,
  script/module, Flow/TypeScript/JSX, React Compiler, and Refresh combinations.
- Add process and actual worker-thread isolation tests for parser adapters,
  helper caches, semantic caches, and transform registries.
- Seed generated tests deterministically and persist failing seeds.

### 1.4 Verification acceptance gate

- No supported fixture may silently change runtime behavior, graph data,
  metadata, warning behavior, or representative mappings.
- Every fallback must return pristine input to Babel.
- Every known incompatibility must produce a stable typed reason.
- The packed consumer must pass the same core matrix as the workspace link.

## Phase 2: Audit Custom Transforms Against `oxc_transformer`

### 2.1 Build an authoritative Oxc capability matrix

Inspect the exact pinned Oxc 0.141 source and APIs used by Noxcturnal. Do not
infer support from Oxc's website, current main branch, or transform names.

For every transform:

- locate the Oxc option, implementation module, helper behavior, assumptions,
  target gating, and parser prerequisites;
- determine whether it is independently selectable or fused with other class,
  ES2015, regexp, TypeScript, or JSX work;
- test whether unrelated syntax is preserved;
- test whether loose/spec and helper options match Babel/Expo;
- identify Oxc bugs or mixed-mode output that motivated custom code;
- repeat against the newest compatible Oxc release on an experiment branch to
  distinguish pinned-version limitations from architectural limitations.

The matrix must include:

- block scoping;
- parameters;
- destructuring;
- `for...of`;
- classes, class properties, static blocks, private methods, accessors,
  private-in, and derived constructors;
- object rest/spread;
- async functions, async generators, and explicit resource management;
- logical assignment, optional chaining, nullish coalescing, exponentiation,
  and optional catch binding;
- export namespace/default-from parsing;
- sticky, dotAll, Unicode, Unicode properties, named captures, lookbehind,
  match indices, and Unicode sets;
- TypeScript, JSX, React Refresh, and React Compiler.

### 2.2 Regexp Unicode assessment

Specifically determine whether `regexpUnicode`, Unicode property escapes,
dotAll, and named capture groups duplicate Oxc's regexp transformer.

For each regexp feature, compare four implementations:

1. Babel's relevant transform plugin;
2. Oxc with only the exact feature enabled;
3. the custom Noxcturnal Rust pass;
4. Oxc followed by any minimal compatibility repair that would still be needed.

Use a differential corpus covering:

- BMP and astral literals, escapes, quantifiers, dot, and character classes;
- ignore-case expansion;
- Unicode property/script/category aliases and complements;
- property escapes inside and outside classes;
- named groups, replacements, backreferences, duplicate names, and forward
  references;
- invalid patterns and construction-time errors;
- combinations of `/u`, `/v`, `/s`, `/d`, and sticky flags;
- literal and `RegExp` constructor forms where Babel's contract differs.

Measure output size, helper/runtime requirements, compilation time, and runtime
time. If Oxc is semantically complete for the supported Expo profiles, delete
the duplicate Rust implementation. If Oxc is almost complete, keep only a
small, named repair pass with a regression fixture for every repaired Oxc bug.

### 2.3 Legacy and private class assessment

Evaluate Oxc's complete and focused class transforms before retaining the
custom class rewriter.

Run separate experiments for:

- 500 public legacy classes;
- 200 private-feature classes;
- 200 private-feature plus 200 unrelated modern classes;
- deeply inherited derived classes;
- fields, static fields/blocks, computed names, methods, getters/setters,
  private calls, private-in, and constructor access;
- loose and spec configurations;
- cases that previously produced Oxc's invalid mixed loose/spec output.

Compare:

1. current focused Rust pass;
2. Oxc's class transform with the exact Expo target and assumptions;
3. Oxc plus a narrow pre/post compatibility repair;
4. Babel as the semantic and output-helper reference.

Collect:

- parse, semantic, transform, helper-materialization, print, and total time;
- allocations and peak RSS;
- output size and helper count;
- unrelated-class preservation;
- runtime semantics and source maps.

Decision rules:

- Prefer Oxc when it matches semantics and does not lower unrelated syntax that
  the public toggle does not own.
- Prefer Oxc plus a narrow repair over a complete parallel class compiler.
- Keep the custom pass only where measured Oxc behavior is incorrect or its
  fused lowering causes a material compatibility/performance regression.
- File a minimal upstream Oxc reproduction for each retained workaround.
- Re-run the audit when upgrading Oxc; encode resolved upstream issue/version
  metadata in the ownership registry.

### 2.4 Other custom-pass assessment

Repeat the same keep/replace/narrow audit for block scoping, parameters,
destructuring, `for...of`, and object rest/spread. Pay particular attention to
passes that construct large textual edits, rebuild semantics, or materialize
helpers already available through Oxc.

### 2.5 Oxc deduplication acceptance gate

- No custom general-language transform remains merely because it already
  exists.
- Every retained custom pass has a pinned Oxc counterexample, differential
  fixture, performance comparison, and ownership explanation.
- Every removed pass leaves its public option and behavior intact through Oxc,
  or receives an explicit breaking-change decision.

## Phase 3: Enumerate, Classify, and Reduce Every Bailout

### 3.1 Generate the inventory

Build a source scanner backed by explicit registries rather than relying only
on `rg`. It must collect:

- Rust `unsupported(...)` calls and errors propagated into them;
- JavaScript `context.unsupported(...)` and `path.unsupported(...)`;
- early fallback functions in the Expo consumer;
- parser adapter `unsupported` results;
- dynamic/template reasons such as restricted imports, missing bindings,
  dynamic dependency kinds, and plugin-prefixed reasons;
- generic error/fallback wrappers such as `noxcturnal-error:*`.

Require every reason to be declared in a typed registry with:

- stable reason ID or parameterized family;
- layer and owning pass;
- category;
- whether the input is pristine;
- expected destination;
- one positive trigger test and one nearby non-trigger test;
- permanent, temporary, diagnostic-preserving, configuration, or bug status.

### 3.2 Current baseline bailout families to reconcile

The initial generated inventory must include at least the following current
families. The generator, not this prose list, becomes authoritative.

#### Noxcturnal engine and parser

- parser-adapter unsupported/error outcomes;
- `parse-error`;
- `semantic-error`;
- `transform-error`;
- `react-compiler-not-built`;
- broad catch-all visitor rejection;
- plugin/phase-prefixed `unsupported` decisions;
- edit conflicts and protocol/runtime errors.

#### Native language passes

- `arrow-parameters-lexical-super-not-implemented`;
- parameter, destructuring, `for...of`, class, object-rest, and regexp edit
  conflicts;
- spec private-feature lowering;
- accessor properties;
- private constructor access and unsupported private-call shapes;
- private methods combined with `super`;
- `super` writes and unsupported `super` calls;
- derived-constructor `new.target` and non-straight-line `super()` flow;
- decorators;
- regexp Unicode ignore-case complexity;
- Unicode properties in classes and unsupported property shapes;
- Unicode code-point escape and astral-class shapes;
- named-reference/group shapes, forward references, and duplicate groups;
- lookbehind, match-indices, and Unicode-set semantic boundaries;
- selected-syntax postcondition failures.

Some preflight source branches still contain `classes-not-implemented`,
`destructuring-not-implemented`, `for-of-not-implemented`, and regexp
semantic-mismatch reasons as postcondition or configuration guards. Verify
whether each is reachable. Delete dead reasons; retain reachable reasons only
with a triggering fixture.

#### Expo early/configuration routing

- first-stage `not-node-modules`;
- custom transformer and non-default Babel configuration;
- assets, non-module input, and unsupported extensions;
- React Native Codegen;
- Worklets/Reanimated candidates;
- React Compiler disabled/profile/platform/Flow boundaries;
- non-Hermes and React Native Web routing;
- Expo directives and conflicting client/server directives.

#### Expo semantic and diagnostic boundaries

- restricted environment imports and React/React DOM APIs;
- server-action non-async, nested declaration, default export, export-all,
  re-export, pattern, and export-kind families;
- DOM component named export, missing default, layout, and API route cases;
- server-reference CommonJS and export-all forms;
- decorators and maintained Hermes workaround shape failures.

#### Metro module/dependency boundaries

- reserved dependency-map and native ESM marker collisions;
- dynamic require/import/prefetch/maybe-sync dependencies;
- invalid weak/worker resolution;
- unsupported `require.context` arguments, recursion, filter, and mode;
- unsupported Metro dependency calls;
- missing shared dependency state, import binding, default declaration, or
  native ESM import;
- invalid Metro metadata;
- caught `noxcturnal-error:*` failures.

### 3.3 Reachability and frequency audit

- Generate one minimal trigger for every static reason or parameterized family.
- Prove dead reasons unreachable, then remove them.
- Instrument local Expo corpus builds to count bailout reason, file category,
  profile, source size, and elapsed work before bailout.
- Never record source text or sensitive paths in telemetry.
- Rank fallbacks by frequency multiplied by avoidable cost.
- Distinguish intentional routing from a failure after native work has begun.
- Set a zero tolerance for generic `transform-error` or `noxcturnal-error`
  outcomes on supported corpus files.

### 3.4 Bailout reduction decisions

For each reachable bailout:

- implement it;
- route it earlier and more cheaply;
- retain it to preserve Babel diagnostics;
- classify it as an ecosystem boundary;
- or replace it with a typed fatal error when fallback would hide corruption.

Prioritize the bailout families observed in the real iOS bundle:

1. Remove the captured-loop block-scoping fallback by completing the native
   lowering or selecting the already implemented Rust path correctly.
2. Eliminate `follow-up-batch-budget-exceeded`; a supported file must not depend
   on an arbitrary JavaScript visitor batch budget.
3. Support optional static CommonJS dependencies in the full native Metro path.
4. Continue Flow-adapted files through the full native dependency/wrapping path
   where their post-adapter syntax is supported.
5. Move eligible development application and Expo workspace files from
   `not-node-modules` routing into the full native path.
6. Remove avoidable development public-environment fallback.
7. Keep Codegen pristine and early, while ensuring its classification cost is
   negligible.

For every eliminated bailout, measure both the newly native transform cost and
the removed discarded-attempt/Babel cost. Do not improve coverage by adding a
native path that is slower than the fallback it replaces.

The final report must list the exact number of:

- static reasons;
- parameterized reason families;
- permanent compatibility boundaries;
- temporary Oxc limitations;
- diagnostic-preserving fallbacks;
- configuration/early-routing outcomes;
- internal invariant failures;
- corpus-observed occurrences by profile.

### 3.5 Bailout acceptance gate

- The generated inventory exactly matches source.
- Every reachable reason has trigger, non-trigger, pristine-input, and
  destination coverage.
- No supported ordinary file reaches a generic fallback.
- Adding a new bailout without registry metadata and tests fails CI.

## Phase 4: Make `@babel/runtime` the Only Helper Authority

### 4.1 Define helper provenance

Every helper must originate from the exact runtime version selected by Expo's
`enableBabelRuntime` contract:

- explicit `false` or script mode: inline, with no runtime dependency;
- explicit version string: that exact compatible `@babel/runtime`;
- missing/boolean selection: Expo/Babel's documented fallback version.

Do not treat a helper with a Babel-compatible name as sufficient. Its source,
module format, dependency closure, semantics, and version must be traceable to
the selected installed `@babel/runtime`.

### 4.2 Runtime import mode

- Generate a fixture for every reachable helper-producing transform.
- Run Babel with the same transform options and runtime version.
- Extract the canonical helper import path from Babel output.
- Assert Noxcturnal emits the same `@babel/runtime/helpers/...` or compatible
  versioned entrypoint and Metro dependency.
- Verify helper deduplication, collision-safe local naming, import order,
  CommonJS/ESM/script behavior, and version gating.
- Remove handwritten import-path tables when they can be generated from this
  canonical process.

### 4.3 Inline mode must derive from generated runtime imports

Inline helpers must not be separately handwritten implementations.

Build a deterministic helper generator that:

1. invokes the pinned Babel transform/runtime configuration for a minimal
   feature fixture;
2. captures the generated `@babel/runtime` helper imports;
3. resolves those imports against the selected runtime package;
4. loads and normalizes the helper module plus its transitive helper imports;
5. converts the module into collision-safe inline declarations for the target
   script/module format;
6. preserves runtime helper semantics, dependency order, comments/license
   requirements, and version-specific changes;
7. emits generated Rust/TypeScript helper assets, hashes, and provenance
   metadata; and
8. fails `codegen:check` when installed runtime output differs.

The inline materializer may rename bindings or compose the dependency graph,
but it may not maintain an independently authored semantic body.

### 4.4 Helper equivalence tests

For every helper and supported runtime version:

- compare runtime-import and inline modes on the same transformed fixture;
- compare both with Babel execution;
- cover symbols, descriptors, getters/setters, prototypes, constructors,
  iterators, async rejection/cleanup, suppressed errors, private brands, and
  malformed inputs relevant to that helper;
- verify no `require`, import, or Metro dependency survives in inline/script
  mode;
- verify source maps either trace to the triggering source or are explicitly
  unmapped generated code;
- snapshot the canonical import, dependency closure, normalized inline source,
  and content hash.

### 4.5 Helper acceptance gate

- Every reachable helper has generated Babel-runtime provenance.
- Runtime mode imports only canonical `@babel/runtime` entrypoints.
- Inline mode is regenerated from those canonical runtime modules.
- There are no handwritten helper bodies outside the generator/materializer.
- All configured runtime versions either pass equivalence or fail early with a
  typed unsupported-version reason.

## Phase 5: Maximize Performance

### 5.1 Measure the whole pipeline, not only transform bodies

Add structured counters and timers for:

- classification and early routing;
- native library initialization;
- parser adapter work;
- parse and semantic construction;
- each native transform;
- each JavaScript plugin batch and native/JS crossing;
- helper discovery/materialization;
- source-map composition;
- printing/rendering;
- dependency collection and module wrapping;
- fallback work discarded before Babel;
- Babel fallback time where retained.

Also record allocations, peak RSS, output bytes, edit count, reparses, semantic
rebuilds, and number of AST traversals.

Instrumentation must be zero/near-zero cost when disabled and excluded from
normal output.

Produce a per-file cost decomposition keyed by stable anonymous file category
and size bucket. The report must make the approximately 4 ms current average
explainable as parse, semantic, native transform, JavaScript plugin crossing,
dependency collection, wrapping, source-map composition, and rendering costs.
Aggregate bundle time alone cannot identify or close this gap.

### 5.2 Benchmark design

- Pin CPU governor/power state where possible and record machine metadata.
- Warm native loading separately from hot transform timing.
- Report cold, warm, median, mean, p75, p95, p99, confidence interval, and
  sample count.
- Run A/B commits in alternating order to reduce thermal and background bias.
- Use minimum practical process isolation for cold-start measurements.
- Keep small, medium, large, and adversarial files for every transform family.
- Add real Expo corpus throughput and peak-memory benchmarks.
- Measure native completion, Babel fallback, and end-to-end Metro work.

Keep the `router-e2e` iOS request as a required macrobenchmark. Capture:

- full-native files separately from files that eventually invoke Babel;
- the exact same filename set under forced Babel;
- aggregate worker time and wall-clock bundle time separately;
- per-file median, p75, p95, p99, and size-normalized time;
- discarded native work before every fallback; and
- module count and output bytes so speed is not gained by silently doing less
  required work.

### 5.3 Optimize in priority order

1. Eliminate the observed avoidable bailouts so supported files do not pay both
   native-attempt and Babel costs.
2. Eliminate duplicate Oxc/custom transformations.
3. Bail out before parsing or semantic work when safely classifiable.
4. Fuse passes sharing one AST and semantic model.
5. Avoid reparsing and source-map composition layers.
6. Replace broad JavaScript visitors with native queries or focused Rust passes
   when profiling proves the crossing material.
7. Avoid rendering intermediate code.
8. Cache immutable compiled plans and generated helper graphs by exact options.
9. Reduce edit count and helper string allocation.
10. Optimize large-file source-map composition and dependency collection.
11. Only micro-optimize individual node handling after profiles identify it.

### 5.4 Per-file performance targets

The initial `router-e2e` result is a baseline failure for this gate. Use these
provisional same-machine release-build targets until profiling supports tighter
ones:

- full-native aggregate worker time divided by completed files: **at most
  2.5 ms/file**, down from roughly 4.1 ms/file;
- complete `transform:file` aggregate worker time for the same files: **at most
  3.0 ms/file**, down from roughly 4.2 ms/file;
- median full-native transform for ordinary files: **at most 1.5 ms**;
- p95 full-native transform for files up to 50 KiB: **at most 5 ms**;
- median rejected full-path attempt: **at most 0.1 ms** when an early
  source/configuration classification is safe; and
- discarded native work across all fallbacks: **less than 1%** of aggregate
  transform worker time, excluding work required to preserve a parser
  diagnostic.

Report size cohorts separately so a few generated files cannot hide ordinary
small-file overhead or make an average target meaningless. Tighten these
targets after the first decomposition; do not relax them merely to match the
current implementation.

### 5.5 Specific class-pass performance gate

The current 14–15 ms class stress results require explicit comparison with Oxc.
Set provisional goals, subject to correctness:

- no-op discovery must remain below the cost of running a class transform;
- focused private lowering must scale with selected classes, not all classes;
- unrelated modern classes must remain byte/AST-equivalent when the public
  option does not own them;
- Oxc replacement is preferred if it is at least semantically equivalent and
  materially faster;
- retaining the custom pass requires explaining its absolute cost, scaling
  curve, and why Oxc or Oxc-plus-repair cannot replace it.

Do not set a fixed percentage threshold until repeated same-machine A/B data is
available. Use confidence intervals and require a reproducible regression
outside noise before accepting or rejecting a change.

### 5.6 Constant folding and DCE performance gate

- Compare the fused native optimization with Metro's two Babel plugin passes,
  Oxc's compressor/minifier facilities where semantically applicable, and no
  optimization.
- Measure fixed cost, fixed-point iterations, large function graphs, unsafe
  side-effect cases, and source-map cost.
- Verify independent toggles do not accidentally run the other analysis.
- Keep the fused pass only if it preserves Metro semantics and remains cheaper
  than equivalent post-processing alternatives.

### 5.7 Performance acceptance gate

- No retained custom pass is slower than an equivalent correct Oxc path without
  a documented semantic or integration justification.
- Disabled transforms add no AST traversal or meaningful allocation.
- Ordinary supported files parse and build semantics the minimum required
  number of times.
- Known fallbacks discard minimal native work.
- The real-app per-file targets above are met, not merely the end-to-end bundle
  comparison.
- Avoidable observed bailout families are removed or have a measured,
  correctness-backed reason to remain.
- CI has stable regression checks for large changes; noisy microbenchmarks
  remain reported rather than flaky hard failures.

## Phase 6: Implementation Order

1. Freeze toolchain and reproduce all correctness/performance baselines.
2. Add the generated transform-ownership and bailout registries.
3. Complete the exact pinned-Oxc capability matrix.
4. Eliminate the observed optional-require, captured-loop, follow-up-budget,
   eligible Flow, development-environment, and application/workspace fallbacks.
5. Audit regexp Unicode and class transforms because they are likely
   duplication and the class benchmarks are comparatively expensive.
6. Implement canonical Babel-runtime helper provenance and generation.
7. Replace or narrow duplicated custom transforms one at a time.
8. Re-run full differentials and corpus verification after every replacement.
9. Profile the resulting pipeline and optimize parse/traversal/render hotspots
   until the per-file gates pass.
10. Measure bailout frequency on representative Expo corpora and reduce the
    highest-impact avoidable reasons.
11. Publish the final evidence report and update both plan ledgers.

Each transform replacement is a separate reviewable change with:

- a pinned Oxc/Babel/custom differential;
- before/after ownership data;
- before/after benchmark data;
- source-map and helper checks;
- full Noxcturnal and Expo gates.

## Final Completion Criteria

This plan is complete only when:

- the implementation passes clean, packed, end-to-end verification across the
  supported Expo matrix;
- every custom general-language pass has a documented Oxc comparison and a
  justified final disposition;
- regexp Unicode and both class paths have explicit measured decisions;
- the exact bailout count is generated, every reachable reason is tested, and
  ordinary supported corpus files have no generic fallbacks;
- every runtime helper import is canonical for the selected `@babel/runtime`;
- every inline helper is generated from those runtime imports/modules, with no
  separately handwritten semantic body;
- performance profiles show the minimum practical parse, semantic, traversal,
  render, helper, and fallback work;
- `router-e2e` and the broader corpus meet the per-file native and discarded
  fallback-work targets, with further bailout reduction demonstrated;
- all correctness, packaging, lint, type, Rust, source-map, corpus, and
  benchmark gates pass; and
- the final report states what was removed, retained, narrowed, upstreamed, and
  why.
