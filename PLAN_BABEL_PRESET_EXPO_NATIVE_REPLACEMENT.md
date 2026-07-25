# Babel Preset Expo Replacement Audit and Completion Plan

## Current implementation status (2026-07-25)

The original inventory below records the starting state. The following native
implementations now supersede its bailout-only entries:

- Fused Metro constant folding and fixed-point dead-function elimination.
- Block scoping, including captured loop bindings and abrupt control flow.
- Parameters, destructuring, `for...of`, classes, class fields, static blocks,
  and Expo's loose private-method/private-in configuration. When classes are
  otherwise preserved, the focused private pass lowers only classes that own
  selected private syntax and leaves unrelated classes intact; this avoids
  Oxc 0.141's invalid mixed loose/spec private output on modern web. Loose
  private fields, methods, getters/setters, constructor access, calls, and
  brand checks are covered.
- Expo's loose+built-in object rest/spread configuration.
- DotAll, named captures, Unicode regexp lowering, and Unicode property escapes.
- Static CommonJS/ESM dependency collection, module wrapping, inline requires,
  define/import-meta/platform transforms, and development `EXPO_PUBLIC_*`
  references through `expo/virtual/env`.
- Metro-compatible optional dependency metadata for CommonJS, dynamic imports,
  workers, weak dependencies, and require contexts, including rejection
  handlers, exclusion lists, and required-use dominance when a module is
  referenced both optionally and unconditionally.
- Expression-local Metro/webpack ignore comments for dynamic imports, which
  remain intact and deliberately uncollected without a file-level Babel bailout.
- Hermes V0 and non-Hermes native dependency recipes, including async lowering
  and loose+built-in object rest/spread.
- Eligible native-client production application TypeScript/JSX files through
  the complete native Metro graph path, followed by Metro's configured
  production minifier when requested.
- Plain production application JavaScript modules through the complete native
  graph path. Expo Router `loader` bundles, client `loader` removal,
  `loaderReference`/constant-folding metadata, and client/server
  `generateMetadata` behavior are handled by an Expo-owned noxcturnal plugin;
  web/React Server `APP_MANIFEST` reads are also inlined natively with the same
  public web-manifest filtering and assignment-expression exclusions as Babel.
- Eligible production Node application TypeScript/JSX files through the same
  native language, define, module, dependency, wrapping, and source-map path.
- Graph-optimization builds use native source transforms and collect-only
  dependency metadata, then retain Metro's AST/reconciliation stage required by
  the whole-graph tree shaker; they no longer require the configurable Babel
  preset for eligible files.
- Ordinary production web TypeScript/JSX files use the native modern-engine
  recipe. Root `react-native`/`react-native-web` imports, named re-exports, and
  CommonJS bindings use the same per-export `react-native-web/dist` rewrites as
  Babel; side-effect imports, export-all, general requires, and package
  subpaths retain the Babel plugin's intentional no-op behavior.
- Expo UI `Icon.select` uses an Expo-owned source plugin with aliased and
  namespace-import binding support, platform branch elimination, and Android
  literal `import()` asset conversion; compiled `@expo/ui` modules no longer
  have a blanket Babel boundary.
- Widget functions are serialized by an Expo-owned post-JSX source plugin,
  including declarations, arrows, object methods, default exports, directive
  removal, compact generation, and template-literal escaping.
- Client bundles validate actual `server-only` imports, re-exports, requires,
  weak/import helper calls, and dynamic imports in a source-gated native
  visitor. Harmless string occurrences remain on the native path; invalid
  imports alone defer to Babel for its established code-frame diagnostic.
- Development application modules use Oxc's native React Refresh transform,
  including component/HOC registrations and hook signatures. This removes the
  blanket `app-react-refresh` Babel boundary while preserving the
  `$RefreshReg$`/`$RefreshSig$` runtime contract.
- Eligible Hermes application modules with React Compiler enabled now compose
  the native Compiler prepass, TypeScript/JSX lowering, React Refresh, static
  ESM conversion, dependency collection, and Metro wrapping in one native
  pipeline. The full path owns static ESM conversion even when Metro's legacy
  `experimentalImportSupport` flag is false; the first-stage-only path retains
  that compatibility boundary.
- Ordinary React Server TypeScript/JSX modules now use the complete native
  Metro path. A parsed, binding-aware validation phase mirrors Expo's
  `client-only` import checks and restricted `react`/`react-dom` API boundary
  before any source mutation. Program and function directives are detected
  from Oxc directive nodes, including inline `"use server"` actions that the
  former raw-source heuristic could miss; the supported server-action forms
  below continue through the native graph while unusual forms defer on pristine
  input.
- React Server `"use client"` and `"use dom"` modules now become client
  reference proxies in an Expo-owned native source phase. It matches Babel's
  output key, exported-name metadata, client-reference URL, default/named
  registration behavior, export-all proxy behavior, and conflicting-directive
  boundary before continuing through native ESM/dependency/wrapping phases.
  Proxy collection and all React Server validations share the existing
  pre-language Router phase, so ordinary server modules do not incur another
  parse solely for this post-preset replacement.
- Native-client `"use dom"` modules now produce the Expo DOM WebView proxy,
  development URL or production MD5 HTML key, display name, dependency edges,
  and `expoDomComponentReference` metadata without Babel. Named exports,
  missing defaults, layout/API routes, and web's intentional no-op retain the
  preset's behavior.
- File-level `"use server"` modules in client bundles now produce
  `createServerReference` proxies, export/reference metadata, and their two
  runtime dependency edges natively. Parsed function-level directives still
  defer to Babel for actual server-action extraction, and invalid CommonJS or
  export-all forms preserve Babel's diagnostic path.
- Development app modules preserve Babel's deprecated deep
  `react-native/*` import warnings (imports, re-exports, and static requires),
  including the `InitializeCore` exception and source locations.
- React Server files with module-level `"use server"` and supported named
  async-function/variable exports now register those actions natively, emit the
  same action ID/name and server-reference metadata, and continue through the
  native Metro graph. Named and anonymous async-function defaults, async-arrow
  defaults, and identifier defaults are supported as well; assignment defaults,
  re-exports, patterns, and non-async functions remain precise Babel boundaries.
- No-capture async arrow and function-expression actions with function-level
  `"use server"` are also extracted and registered natively using
  Noxcturnal's semantic capture query; generated action IDs and metadata match
  Babel. Captured closures use Babel's lazy bound-argument wrapper shape.
  Top-level async function declarations are supported; nested
  declaration-hoisting variants still defer before mutation.
- The public transform registry now drives an exhaustive ownership test: every
  `NATIVE_TRANSFORM_NAMES` entry has selected-syntax and unrelated-syntax
  coverage plus a structured output/helper/bailout snapshot. Adding a public
  transform without an explicit disposition fails the suite.
- `tsconfig.tests.json` now strictly typechecks every executable TypeScript test
  in addition to the dedicated negative public-type suite. Runtime-invalid
  contract fixtures carry local expected-error annotations rather than
  disabling diagnostics for the suite.
- Codegen eligibility recognizes Flow TurboModules plus TypeScript Native
  Components and Native Commands before mutation. Exact Codegen imports remain
  conservative pristine-source boundaries, while comments, strings, and
  locally shadowed call names no longer create false Babel fallbacks.
- The Expo consumer's pristine-source Codegen classifier and Hermes Flow parser
  adapter are isolated from the main transformer. The adapter remains loaded
  only when Noxcturnal is first needed, preserving the early legacy/fallback
  path's initialization cost.
- A deterministic production/development corpus matrix validates concurrent
  native completion, emitted code and map stability, Metro dependency graphs,
  function maps, representative original-position traces, and runtime
  side-effect behavior across TypeScript optimization, JSX/Refresh, ESM, Flow,
  and dynamic imports.

These are Rust preflight passes when they lower JavaScript syntax. Expo-specific
source and Metro graph behavior remains in `@expo/metro-config` native plugins.
The legacy syntax phase does not use noxcturnal JavaScript plugins for general
language lowering.

The remaining public regexp toggles for lookbehind, match indices, and Unicode
sets are explicit Babel boundaries. Their semantics require either a regexp
engine/runtime wrapper or a complete regexp-set compiler; partial textual
rewrites are not accepted as implementations.

Spec-mode (`loose: false`) private methods and private-in are also an explicit
public boundary. Expo's supported profiles consistently request the implemented
loose configuration; implementing spec brands would require a separate
WeakSet/WeakMap pass rather than reusing Oxc 0.141's currently inconsistent
mixed-mode output.

Additional structured language boundaries are deliberately retained instead of
accepting partial semantics:

- Non-simple arrow parameters whose body closes over lexical `super`.
- Derived constructors with `new.target`, non-straight-line `super()` control
  flow, or private access around the derived-constructor rewrite.
- Methods combining private access with `super`, and writes/updates through
  `super`.
- Stage-3 auto-accessor properties.
- Complex Unicode-regexp cases not handled by the focused compiler:
  ignore-case Unicode expansion, Unicode properties inside character classes,
  astral character classes, duplicate/forward named groups, and unsupported
  group/property shapes.

These are typed pristine-source Babel boundaries. The implementation does not
emit Oxc output when its semantics are known to differ.

The maintained native benchmark transforms 200 TypeScript/JSX components with
React Refresh in 0.2717 ms mean (0.2487 ms minimum), versus 0.2333 ms mean for
the same production JSX recipe. The 0.0384 ms incremental instrumentation cost
is small enough for the development path and avoids a Babel process entirely.
The focused modern private-feature stress case (200 private classes alongside
200 unrelated public classes) measured 14.39 ms mean; its cost is confined to
files containing selected private syntax, and unrelated classes remain
unlowered.
For the same 200-component corpus with React Compiler and Refresh both enabled,
a warmed local comparison measured the two-phase native pipeline at 5.05 ms
mean versus 160.33 ms for `babel-preset-expo` (about 31.7x faster).

The Expo-owned React Server routes have a small-file crossover: the complete
native Metro path measured 1.19–1.32 ms for tiny ordinary/proxy/action modules,
while the warmed Babel preset alone measured 0.35–0.57 ms (an intentionally
incomplete comparison because Babel still requires Metro dependency and
wrapping passes). At 200 exports, the complete native path measured 5.16 ms for
module actions and 5.81 ms for client proxies, versus 7.38 ms and 9.98 ms for
the Babel preset alone. This confirms the native route wins on meaningful
transform volume while keeping fixed phase count important for tiny modules;
the validation/proxy visitors therefore share an existing parse phase.

Current retained Expo compatibility boundaries are:

- Nested-declaration and unusual re-export/default React Server action forms.
- Legacy `export v from` proposal syntax.
- Custom Babel configurations, Worklets/Reanimated, decorators, and
  React Native Codegen remain intentional pristine-source Babel boundaries.

## Summary

The implementation now covers the default Expo preset and Metro graph path for
ordinary app and dependency modules across Hermes, Node, web, and React Server
profiles. Babel remains a deliberate compatibility boundary rather than the
default path for supported files.

- Public regexp lookbehind, match-indices, and Unicode-set toggles remain
  explicit semantic boundaries.
- Spec-mode private methods/private-in remain an explicit semantic boundary;
  Expo's loose profile is native.
- Rare React Server export/hoisting forms retain precise Babel fallbacks.
- React Native Codegen is intentionally excluded: Codegen candidates must bail out before native mutation and be handled by Babel from pristine source.
- Consumer presets remain outside Noxcturnal; all native lowering stays independently selectable.

## Original Missing-Transform Inventory and Final Disposition

The original audit found the following bailout-only capabilities. The table is
kept as the completion ledger rather than as a stale list of current failures.

| Transform                                                    | Final disposition                                                                                                                                | Needed by Expo                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `blockScoping`                                               | Implemented natively, including captured-loop bindings, abrupt control flow, nested scopes, and renaming.                                        | Hermes V0, Hermes V1, webview |
| `classes`                                                    | Implemented by a focused Rust class pass with independent public-class lowering.                                                                 | Hermes V0, webview            |
| `destructuring`                                              | Implemented natively for declarations, assignments, parameters, catch bindings, iterators, defaults, computed keys, and rest.                    | Hermes V0, webview            |
| `parameters`                                                 | Implemented natively for defaults, rest, destructuring, function length, and lexical state; lexical-`super` arrows retain a structured boundary. | Hermes V0, webview            |
| `forOf`                                                      | Implemented natively with iterator cleanup and abrupt/labeled control flow.                                                                      | Webview                       |
| `privateMethods`                                             | Implemented in focused loose mode without lowering unrelated classes; spec mode and documented mixed `super` cases retain structured boundaries. | Hermes V0, web, webview       |
| `privatePropertyInObject`                                    | Implemented in focused loose mode with native brand checks; spec mode retains a structured boundary.                                             | Hermes V0, web, webview       |
| `regexpUnicode`                                              | Implemented for the supported Unicode corpus; complex case-folding/class shapes retain explicit semantic boundaries.                             | Hermes V0, webview            |
| `regexpNamedCaptureGroups`                                   | Implemented for supported groups, replacements, and backreferences; duplicate/forward and unsupported group shapes retain explicit boundaries.   | Hermes V0, webview            |
| `regexpUnicodePropertyEscapes`                               | Implemented for the maintained property/script corpus with structured boundaries for unsupported class/property shapes.                          | Public Noxcturnal capability  |
| `regexpDotAll`                                               | Implemented natively and runtime-differential tested.                                                                                            | Public Noxcturnal capability  |
| `regexpLookBehind`                                           | Explicit permanent semantic boundary: no compatible downlevel runtime/compiler is available in the current stack.                                | Public Noxcturnal capability  |
| `regexpMatchIndices`                                         | Explicit permanent semantic boundary: emulating match indices requires a regexp runtime wrapper.                                                 | Public Noxcturnal capability  |
| `regexpUnicodeSets`                                          | Explicit permanent semantic boundary pending a complete Unicode-set compiler.                                                                    | Public Noxcturnal capability  |
| `objectRestSpread` with `{ loose: true, useBuiltIns: true }` | Implemented by the focused native object pass, independently runtime-tested; spec/helper modes remain supported.                                 | Non-Hermes Expo configuration |

Each implemented capability lowers only its selected feature, preserves
unrelated syntax, exposes its semantic options, and has direct behavioral/Babel
differential coverage.

### Consumer-owned focused transform disposition

These operations belong in consumer-owned source, module, or postflight phases
rather than a target/preset API. The production Expo integration now implements:

- CommonJS/ESM conversion with live bindings, re-exports, interop, top-level
  `this`, strict-mode policy, and Metro dependency collection.
- Development `EXPO_PUBLIC_*` injection.
- Expo Router loader, metadata, manifest, client-reference, DOM-reference, and
  server-reference routes.
- Supported module and inline server actions.
- Dynamic-export detection.
- Deep React Native import warnings.
- Native Metro constant folding and fixed-point dead-code elimination.
- Inline requires, use-strict insertion, module wrapping, dependency
  collection, and pseudo-global normalization.

`@babel/plugin-proposal-export-default-from` remains the exception. Oxc rejects
this legacy proposal at parse time because it is not standard ESM syntax. A
special pre-parser rewrite would add another lexer/parser boundary for uncommon
syntax and is not justified as a fast-path pass; files that actually use it
retain Babel unless usage data changes that tradeoff.

### Already implemented language transforms

Retain and expand differentials for the currently functional capabilities:

- TypeScript erasure and runtime constructs.
- JSX classic, classic-development, automatic, and automatic-development.
- Explicit resource management.
- Class static blocks.
- Class properties in proven loose/spec configurations.
- Logical assignment.
- Optional chaining.
- Nullish coalescing.
- Export namespace from.
- Optional catch binding.
- Spec-compatible object rest/spread configurations.
- Async functions.
- Async generator functions and async iteration.
- Exponentiation.
- Sticky regexp transformation.
- Helper runtime imports and the proven inline-helper families.
- Optional React Compiler prepass.

### Expo-maintained visitors that must remain outside native lowering

- `fix-hermes-v1-async-arrow-non-simple-params`
- `fix-hermes-v1-super-in-object-accessor`
- `fix-hermes-v1-class-in-finally`
- React display-name inference

The three Hermes fixes are one-off Expo compatibility workarounds, not general language transforms. Consumers select them individually in their recipes.

### Intentional Babel boundaries

Do not count these as missing native capabilities:

- React Native Codegen.
- Custom Babel configurations and arbitrary user plugins.
- Worklets/Reanimated compiler plugins.
- Decorators, unless a separate project explicitly approves implementing their full semantics.

## Required Implementation Changes

### Correctness before wider rollout

- Derive one authoritative helper configuration for Babel and Noxcturnal:
  - Script or explicit `false` → inline helpers with no dependency.
  - Explicit string → exact targeted `@babel/runtime` version.
  - Missing/boolean value → Babel preset’s `7.20.0` fallback.
- Replace raw-source transform-selection regexes with parser-derived facts.
- Add postconditions so native completion is impossible when selected syntax remains unlowered.
- Use AST/query-based ESM detection or always install the focused ESM visitors.
- Complete semantic parity for the currently partial Expo visitors.
- Return typed, stable bailout reasons instead of generic `transform-error` where the incompatible capability is known.

### Preserve React Native Codegen as a Babel boundary

- Do not implement Codegen in Noxcturnal, the Flow adapter, or Expo-maintained visitors.
- Detect Codegen candidates before Flow stripping, TypeScript erasure, JSX lowering, helper insertion, or visitor execution.
- Return `react-native-codegen` with byte-identical original source.
- Send that pristine source through Babel with `@react-native/babel-plugin-codegen`.
- Cover Flow and TypeScript Native Components, Native Commands, and TurboModule specs.
- Track Codegen separately in telemetry and exclude it from native replacement coverage.
- Treat native completion of a Codegen candidate as a correctness failure.

### Completed independent lowering sequence

The bailout-only inventory was implemented in this order:

1. Block scoping, including captured loops and renaming.
2. Parameters and destructuring.
3. Classes.
4. `for...of`.
5. Private methods and private-in.
6. Unicode and named-group regexp transforms.
7. Remaining implementable public regexp capabilities; the three runtime/compiler
   boundaries above were retained explicitly.
8. Loose+built-in object rest/spread.

No implementation may implicitly enable another public transform. If an underlying Oxc pass combines features, Noxcturnal must preserve unrelated syntax or use a focused pass.

### Add explicit postflight capabilities

Add a distinct optimization phase:

```ts
{
  name: 'metro-optimization',
  optimize: {
    constantFolding: true,
    deadCodeElimination: true,
  },
}
```

- `constantFolding` evaluates safe unary, binary, logical, conditional, and `if` expressions.
- `deadCodeElimination` removes unreferenced functions and declarations to a fixed point.
- Both remain independently selectable.
- Module wrapping, dependency collection, inline-requires, and other Metro operations remain separate transforms.
- Production minification may remain in Metro’s configured minifier.

## Noxcturnal Test-Suite Expansion

### Test structure and tooling

- Add `tsconfig.tests.json` covering all test sources and run it from `pnpm typecheck`.
- Add a reusable fixture harness accepting source, filename, exactly one transform configuration, helper policy, expected status, and optional runtime evaluator.
- Add a Babel differential harness using pinned test-only `@babel/core`, `@babel/runtime`, and individual Babel plugins.
- Maintain an exhaustive registry keyed by `NATIVE_TRANSFORM_NAMES`.
- Fail when any public transform lacks:
  - Positive owned-syntax coverage.
  - No-op independence coverage.
  - All option variants.
  - Runtime behavior coverage.
  - Helper coverage where applicable.
  - Source-map coverage.
  - A documented bailout test while still unimplemented.

### Vitest snapshots

Use `expect(...).toMatchSnapshot()` on structured records:

```ts
{
  source,
  options,
  status,
  code,
  helpers,
  dependencies,
  reason,
}
```

Snapshot:

- Every transform independently.
- Loose/spec and built-in/helper variants.
- TypeScript and JSX matrices.
- Helper collisions, deduplication, runtime versions, and script inlining.
- Every known structured bailout from the explicit missing-transform table.
- Multi-phase ordering.
- Constant-folding and dead-code before/after output.
- Selected decoded source-map positions.
- Codegen’s pristine `react-native-codegen` bailout, never native Codegen output.

Snapshots are shape contracts; each also requires behavioral or bailout assertions.

### Behavioral and Babel differentials

Cover:

- Evaluation order, getters/setters, computed keys, errors, and side effects.
- Block scopes, collisions, closures, loops, `switch`, break/continue, and captured bindings.
- Classes, inheritance, derived constructors, fields, private brands, and static initialization.
- Destructuring defaults, iterator closing, rest properties, symbols, and null errors.
- Parameter defaults, rest, destructuring, function length, and `arguments`.
- `for...of` iterator cleanup and abrupt completion.
- Async functions, generators, delegation, rejection, and cleanup.
- Optional chaining, nullish coalescing, and logical assignment assumptions.
- Regexp matching, replacements, groups, flags, and errors.
- TypeScript/JSX dependency preservation.
- Constant-folding safety and dead-code fixed points.
- Helper dependencies and script-mode behavior.

Runtime results, errors where contractual, side-effect traces, dependencies, and ownership must match; textual output need not.

### Codegen bailout tests

- Add representative Flow and TypeScript Native Component, Native Commands, and TurboModule fixtures.
- Assert bailout occurs before every native phase.
- Assert original source is byte-identical.
- Assert Expo’s Babel route successfully invokes Codegen afterward.
- Add negative cases containing Codegen-like text in comments, strings, or unrelated/shadowed calls.
- Test caller combinations where the preset enables or omits Codegen.
- Track Codegen as an expected Babel category.

### Regression, corpus, map, and performance tests

- Add adversarial comments, whitespace, JSX fragments in `.js`, comment-prefixed ESM, shebangs, directives, and shadowing.
- Port small attributed upstream Babel fixtures where permitted.
- Expand Flow fixtures without using Babel’s Flow transform.
- Add module fixtures for live bindings, cycles, re-exports, lazy imports, dynamic imports, and Metro metadata.
- Add deterministic generated-case matrices for bindings and expression forms.
- Assert representative mappings for every transform family.
- Add multi-worker isolation tests.
- Keep timing assertions in Vitest benchmarks:
  - Disabled transforms add no measurable work.
  - Each transform family has a hot-file case.
  - Codegen detection is cheaper than attempting and rolling back native work.
- Run all compatibility tests from `pnpm verify`; never update snapshots automatically there.

## Replacement Acceptance Gates

- Every missing/bailout-only transform above is either implemented and differential-tested or explicitly classified as a permanent Babel boundary.
- Every public transform has exhaustive registry-backed tests and snapshots.
- All helper paths pass runtime/inline, version, collision, dependency, and script tests.
- Resolved configuration coverage includes Hermes V1, Hermes V0, web, server, webview/DOM, development/production, script/module, ESM, JSX, helper settings, and React Compiler.
- Production and development corpus traces show no silent runtime, graph, metadata, or source-map mismatches.
- Every Codegen candidate deterministically bails to Babel with pristine source.
- Wholesale replacement is ready when ordinary default Expo files complete without Babel for every supported profile. Codegen and explicitly external/custom transforms remain documented Babel boundaries.

## Maintainability and Assumptions

- Generate public types, validation, binding options, Rust options, cache serialization, documentation, and exhaustive tests from one transform registry.
- Split the Expo consumer into language recipes, maintained visitors, Flow adapter, module/dependency transforms, Codegen eligibility, and general eligibility modules.
- Consumer presets remain outside Noxcturnal.
- React Native Codegen is permanently out of scope for native replication.
- The exact `babelRuntimeVersion` carried through `enableBabelRuntime` remains authoritative.
- Correctness and differential evidence take precedence over native coverage percentage.
