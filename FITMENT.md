# Expo and Metro transform fitment

This matrix audits the source transforms currently present in `babel-preset-expo/src/plugins` and `@expo/metro-config/src/transform-plugins`. “Supported” means the transform can be reimplemented as a Noxcturnal plugin without transferring a recursive ESTree. It does not mean the Babel plugin itself can be loaded unchanged.

| Transform                                      | Required Noxcturnal primitives                                                                                                                                                   | Status                                                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `babel-plugin-transform-export-namespace-from` | export/specifier child roles, UID generation, multiple replacement                                                                                                               | Supported                                                                                          |
| `client-module-proxy-plugin`                   | directives, import/export queries, targeted traversal, metadata, validated module statements                                                                                     | Supported                                                                                          |
| `define-plugin`                                | `ReferencedIdentifier`, static member-chain matching, unary argument roles, scope binding checks, replacement                                                                    | Supported                                                                                          |
| `detect-dynamic-exports`                       | call/assignment roles, semantic globals, metadata                                                                                                                                | Supported                                                                                          |
| `environment-restricted-imports`               | import/export/call facts and ranged diagnostics                                                                                                                                  | Supported                                                                                          |
| `expo-inline-manifest-plugin`                  | global static-member chains, literals, replacement                                                                                                                               | Supported                                                                                          |
| `expo-router-plugin`                           | global static-member chains, escaped literals, replacement                                                                                                                       | Supported                                                                                          |
| `fix-hermes-v1-async-arrow-non-simple-params`  | function parameter/body roles, UIDs, validated generated statements                                                                                                              | Supported                                                                                          |
| `fix-hermes-v1-class-in-finally`               | class declaration/expression routing, `TryStatement` block/handler/finalizer roles, ancestry                                                                                     | Supported                                                                                          |
| `fix-hermes-v1-super-in-object-accessor`       | ancestry, member/object roles, object-property kind/key/computed facts                                                                                                           | Supported                                                                                          |
| `import-meta-transform-plugin`                 | `MetaProperty` routing and expression replacement                                                                                                                                | Supported                                                                                          |
| `inline-env-vars`                              | `process.env` member-chain matching, global facts, escaped literals                                                                                                              | Supported                                                                                          |
| `lazy-decorators-plugin`                       | complete Babel decorators lowering                                                                                                                                               | Intentional Babel fallback; arbitrary compiler compatibility is out of scope                       |
| `minify-platform-select-plugin`                | call arguments, member roles, object property lists and scalar property facts                                                                                                    | Supported                                                                                          |
| `restricted-react-api-plugin`                  | import specifiers, destructuring children, member chains, bindings, diagnostics                                                                                                  | Supported                                                                                          |
| `server-actions-plugin`                        | directives, function/export roles, captures, binding declaration/owner paths, stable scope identity/complete parent tree, UIDs, directive-safe scope/program insertion, metadata | Supported; representative extraction fixture passes, downstream snapshot differentials remain      |
| `server-data-loaders-plugin`                   | export declarations/specifiers, bindings, metadata, removal                                                                                                                      | Supported                                                                                          |
| `server-metadata-plugin`                       | export declarations/specifiers, metadata, removal                                                                                                                                | Supported                                                                                          |
| `use-dom-directive-plugin`                     | directives, import/export traversal, body insertion, metadata                                                                                                                    | Supported                                                                                          |
| `warn-on-deep-rn-imports`                      | imports and ranged diagnostics                                                                                                                                                   | Supported                                                                                          |
| `widgets-plugin`                               | object property key/value roles, scalar property facts, literal replacement                                                                                                      | Supported                                                                                          |
| `importExportLiveBindings`                     | import/export structure, bindings and references (including JSX), semantic rename, UIDs, program generation                                                                      | Supported; representative module-lowering fixture passes, downstream snapshot differentials remain |
| `importExportStatic`                           | import/export structure, bindings and references (including JSX), semantic rename, UIDs, program generation                                                                      | Supported; representative module-lowering fixture passes, downstream snapshot differentials remain |

The three `fix-hermes-v1-*` entries are Expo-maintained, one-off compatibility
visitors. “Supported” in this table means the visitor contract can host them; they
are deliberately not native preflight transforms or public lowering toggles.
The lazy decorators wrapper intentionally delegates to the complete Babel decorators transform. It is arbitrary Babel-plugin compatibility and remains on the Babel syntax-lowering route. Reanimated/Worklets, React Native Codegen, and other external compilers configured by the preset remain there as well. React Compiler has a pinned, optional native preflight boundary and an Expo app-source prepass; Babel still owns the plugins after Compiler, Refresh, JSX, and module handling. Flow is the deliberate parser exception: the consumer owns the narrow, benchmarked Hermes source adapter described below rather than invoking Babel merely to adapt its syntax.

## API mapping

- Babel visitor aliases used by these transforms map to concrete Oxc subscriptions before traversal. Field-sensitive routes include `ReferencedIdentifier`, `FunctionDeclaration`, `FunctionExpression`, `ClassDeclaration`, `ClassExpression`, and `MetaProperty`.
- `PluginPlan.children` declares structural roles before parsing. The runtime retains one native index and prefetches all requested parent types’ direct children in one packed-buffer call. Undeclared structural reads throw rather than introducing hidden per-property FFI.
- `path.get()` provides the familiar Babel-shaped union. `getChild()` and `getChildList()` are the constrained typed alternatives. Returned paths are shallow summaries with source ranges and scalar facts.
- Complex construction uses escaped primitives, code templates, and natively validated expression or statement fragments. Generated syntax becomes observable only after a phase boundary.
- Binding renames use Oxc semantic identities, not textual name matching, and preserve shorthand object/destructuring keys.
- Scope ancestry comes from Oxc's complete semantic scope table through an on-demand packed integer buffer, so empty intermediate scopes are preserved without adding object transfer to ordinary event batches.
- Ancestry and scope payloads are opt-in through each visitor contract. Summary-only
  ancestry retains compact structural records; declared ancestry routes add sparse,
  node-ID-keyed scalar and child records without duplicating them per routed event.
  Unused parent, scope, and ancestor-field data remain absent from the packed hot path.
- Transforms that legitimately share responsibility for the same tokens — dependency registration, ESM lowering, and polyfill rewrites converging on one import statement — should adopt `context.ensureReplace` intent keys instead of raw replacement, so the shared claim is an explicit contract (first owner wins, divergence is loud) rather than a byte-identical collision resolved by the convergent-edit fallback. `test/fitment.test.ts` expresses one such shared import-statement lowering.

## Remaining evidence gates

`test/fitment.test.ts` implements representative transforms rather than merely probing individual helpers: Metro-style import/export lowering covers semantic import references, JSX, shorthand properties, unbound calls, generated module/export statements, and an explicit reparse phase; server-action extraction covers directives, lexical captures, complete scope parents, parameters, generated top-level registration, replacement, metadata, and reparsing the output.

Complete migration readiness still requires running the existing Expo snapshot suites against downstream production implementations of the two module transforms and server actions. Recorded bundle corpus, Flow fallback frequency, 11-worker behavior, and cross-platform binary checks also remain external evidence gates. These are validation gaps rather than reasons to add Metro-specific policy to this library.

## Native preflight coverage (Oxc 0.141.0)

This matrix is the N0 stop/go record for `PLAN_NATIVE_PREFLIGHT_TRANSFORMS.md`. It
was checked against the published 0.141.0 crate sources and the Expo configs at
`packages/babel-preset-expo/src/configs`, not inferred from newer Oxc behavior.
`oxc_codegen` and `oxc_transformer` are pinned to `=0.141.0`.
`oxc_sourcemap` has an independent version line; codegen 0.141 declares `8.0.2`,
which is pinned directly so its token API cannot drift under the native boundary.

### Frontends and React

| Expo transform            | Oxc 0.141 facility                                                          | Helpers / threshold                                                                                     | Fit and semantic boundary                                                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flow strip and Flow enums | None; Oxc's parser does not accept Flow                                     | None                                                                                                    | Missing. N4 needs the Hermes source adapter. Codegen declarations remain on the explicit consumer fallback.                                                                                 |
| TypeScript                | `TransformOptions.typescript` (`TypeScriptOptions`)                         | No runtime package for ordinary erasure; Oxc emits code for enums, namespaces, and parameter properties | Covered for N2, subject to differential fixtures. The Expo config enables namespaces and selects TS/TSX by extension. Decorators remain explicitly unsupported.                             |
| React JSX, classic        | `TransformOptions.jsx` with `runtime: Classic` and `jsx_plugin: true`       | No helper import; `React.createElement`/fragment pragma                                                 | Covered. File pragmas are parsed by Oxc. Development `__source`/`__self`, spread ordering, and pragma differentials remain gates.                                                           |
| React JSX, automatic      | `runtime: Automatic`, `import_source`, `development`, `pure`                | ESM imports from `<source>/jsx-runtime` or `<source>/jsx-dev-runtime`                                   | Covered. Generated imports must pass through dependency collection. Expo uses `pure: !dev`; Oxc defaults `pure` on, so N2 must set it explicitly.                                           |
| React pure annotations    | `JsxOptions.pure`                                                           | None                                                                                                    | Covered for JSX and documented top-level React calls; compare the exact annotated call set with Babel.                                                                                      |
| React display name        | None                                                                        | None                                                                                                    | Missing and intentionally assigned to a first-party visitor in N5.                                                                                                                          |
| React Compiler            | Pinned `react_compiler` crate feature; runs before TypeScript, JSX, and env | `react/compiler-runtime` for React 19; `react-compiler-runtime` for 17/18                               | Native conformance boundary and eligible Expo app-source prepass implemented. Flow, dependencies, server files, custom transformers/configs, and unsupported syntax retain the Babel route. |

The compiler feature adds roughly 1.6 MB to the stripped arm64 release binary
(about 3.2 → 4.8 MB). It is a named Cargo feature and can be omitted with
`--no-default-features`; requesting `reactCompiler` from that build returns the
specific `react-compiler-not-built` boundary. Both feature configurations compile.

### Individually selectable syntax transforms

Oxc's environment selection can be driven by target queries, but Noxcturnal does not
expose those groupings. Each pass below is selected independently; consumers own
runtime and platform recipes.

`react-display-name` is deliberately absent from the native-transform inventory.
Metro-config implements the legacy/default-profile behavior as an Expo-owned typed
visitor and leaves it disabled for Hermes V1, matching where Babel preset Expo
currently enables the plugin. Consumer tests cover inferred variable, assignment,
object-property, nested-declarator, and default-export names plus preservation of an
explicit computed `displayName`.

The public `transforms` object currently exposes independent toggles for block
scoping, classes, destructuring, parameters, `for...of`, explicit resource
management, class static blocks, class properties, logical assignment, optional
chaining, nullish coalescing, export-namespace-from, optional catch binding, object
rest/spread, async functions, async generators, exponentiation, private methods,
private-property-in-object, and each individual regexp lowering (sticky, Unicode,
Unicode properties, dotAll, named groups, lookbehind, match indices, and Unicode
sets). Missing Oxc facilities are syntax-specific structured boundaries: selecting
one does not reject a file that does not contain that feature. The API has no target
or preset field. Maintained Hermes correctness fixes remain ordinary consumer
visitor plugins and do not enter the native preflight ABI.

| Babel transform used by Expo recipes            | Oxc 0.141 facility                                       | Helpers                                                                                                                                          | Status / semantic work                                                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| block scoping                                   | None                                                     | —                                                                                                                                                | Missing. The independent toggle returns unsupported when block-scoped declarations occur.                                                                                              |
| class properties                                | ES2022 class-properties pass                             | `defineProperty` in spec mode                                                                                                                    | Loose and spec setter-shadowing behavior matches the corresponding Babel plugin. Requested private transforms return `class-features-semantic-mismatch` rather than changing behavior. |
| class static block                              | ES2022 class-static-block pass                           | May share class-property helpers                                                                                                                 | Covered independently with a Babel behavior differential; unrelated public/private fields remain unlowered.                                                                            |
| private methods                                 | ES2022 class-properties/private-method pass              | spec helpers including `classPrivateMethodInitSpec`, `classPrivateFieldGet2`, `assertClassBrand`; loose helpers `classPrivateFieldLooseKey/Base` | Not enabled for Expo web: the 0.141 loose combination can mix spec initialization with loose access and omit the expected brand. Structured bailout protects semantics.                |
| private property in object                      | ES2022 private-in pass                                   | `checkInRHS` in spec paths; loose private-field helpers                                                                                          | Not enabled for Expo web: the 0.141 loose path can emit `.has` against a string loose key. Structured bailout protects semantics.                                                      |
| ES2015 classes                                  | None                                                     | —                                                                                                                                                | Independent `classes` toggle; returns `classes-not-implemented` only when a class occurs. This prevents complete older-Hermes and webview recipes.                                     |
| destructuring (`useBuiltIns`)                   | None                                                     | —                                                                                                                                                | Independent `destructuring: { useBuiltIns }` toggle; declarations, assignments, and catch bindings return `destructuring-not-implemented`.                                             |
| parameters                                      | None                                                     | —                                                                                                                                                | Independent `parameters` toggle; default, rest, and destructured parameters return `parameters-not-implemented`; simple parameters continue.                                           |
| `for...of`                                      | None (only `for await...of` as part of async generators) | —                                                                                                                                                | Independent `forOf` toggle; ordinary loops return `for-of-not-implemented`; `for await...of` remains owned by async-generator lowering.                                                |
| async-to-generator                              | ES2017 async-functions pass                              | `asyncToGenerator`                                                                                                                               | Covered independently; Promise/await runtime behavior matches Babel's corresponding transform.                                                                                         |
| async generator functions                       | ES2018 async-generator pass                              | `wrapAsyncGenerator`, `awaitAsyncGenerator`, `asyncGeneratorDelegate`, `asyncIterator`                                                           | Covered independently; await, delegation, and `for await` behavior match Babel's corresponding transform.                                                                              |
| unicode regexp                                  | Regexp unicode transform                                 | None; may use `RegExp` constructor                                                                                                               | Covered for transformable patterns. Engine behavior/polyfills are deliberately outside preflight.                                                                                      |
| named capture regexp                            | Regexp named-groups transform                            | None; may use `RegExp` constructor/wrapper output                                                                                                | Oxc 0.141 preserves unsupported runtime semantics instead of Babel's groups wrapper; matching syntax receives a structured semantic-mismatch bailout.                                  |
| optional catch binding                          | ES2019 pass                                              | None                                                                                                                                             | Facility exists; expose as an independent toggle.                                                                                                                                      |
| optional chaining (`loose`)                     | ES2020 pass                                              | None                                                                                                                                             | Spec-mode getter/evaluation order matches Babel. Expo webview loose behavior still requires an explicit `no_document_all` posture.                                                     |
| nullish coalescing (`loose`)                    | ES2020 pass                                              | None                                                                                                                                             | Spec-mode evaluation order matches Babel; loose `document.all` behavior still requires an explicit assumption.                                                                         |
| logical assignment                              | ES2021 pass                                              | None                                                                                                                                             | Covered; getter/setter evaluation order matches the independent Babel plugin.                                                                                                          |
| object rest/spread used by the base Expo config | ES2018 object-rest/spread pass                           | `objectSpread2`, `objectWithoutProperties`, `objectDestructuringEmpty`, `extends` depending on assumptions                                       | Spec mode matches Babel for symbols and getter order. Expo's loose+built-ins combination remains an explicit transform-error boundary in Oxc 0.141.                                    |

The other environment passes available at 0.141 are explicit resource management,
regexp `v`, export-namespace-from, exponentiation, arrows, nullish coalescing,
optional chaining, logical assignment, class fields/private members, object
rest/spread, async functions/iteration/generators, and regexp dotAll, sticky,
lookbehind, Unicode properties, named groups, and Unicode lowering. Numeric
separators are normalized by codegen. Oxc is an ESNext-to-ES2015 transformer, not an
ES5 compiler.

The regexp option names above describe Oxc facilities, not automatically proven
lowering. In 0.141, Unicode properties, dotAll, lookbehind, match indices, Unicode
sets, Unicode mode, and named groups can be printed as a `RegExp` constructor while
retaining the unsupported flag or pattern feature. Each public toggle now detects
its owned literal syntax and returns a feature-specific semantic-mismatch bailout
instead of claiming Babel-equivalent lowering. Sticky literals are the exception:
the Babel contract is likewise literal-to-constructor lowering and is covered
independently.

### Expo-only Hermes fixes

| Fix                                    | Oxc equivalent                        | Decision                                                                                                                             |
| -------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| async arrow with non-simple parameters | None as an Expo/Hermes bug workaround | Implemented as the consumer's maintained typed visitor, outside native preflight; upstream fixtures and runtime behavior pass.       |
| `super` in object accessor             | None as an Expo/Hermes bug workaround | Implemented as the consumer's maintained typed visitor, outside native preflight; upstream positive and exclusion fixtures pass.     |
| class in `finally`                     | None as an Expo/Hermes bug workaround | Implemented as the consumer's maintained typed visitor, outside native preflight; scope-boundary fixtures and runtime behavior pass. |

### Helper and source-map API spike

Oxc 0.141 exposes `HelperLoaderOptions { module_name, mode }` and reports
`helpers_used`, so the module root can be changed to `@babel/runtime` and requested
helper names can be audited. It does **not** expose a callback/trait for per-helper
path or export-shape selection, and its documented inline mode is not implemented.
N1 can use runtime mode only behind a Noxcturnal compatibility allowlist; N2a must
materialize script-mode helpers itself or declare the file unsupported. This is
enough for the N1 infrastructure spike but not enough to claim the Expo helper ABI.

`oxc_codegen::CodegenReturn` exposes the `oxc_sourcemap::SourceMap` produced when
`CodegenOptions.source_map_path` is set. The map exposes decoded tokens directly, so
N1 can pack those tokens into the existing decoded-layer format without a VLQ
encode/decode boundary.

### Sequencing decision

- **Go:** N1 infrastructure, N2 TypeScript/JSX, then independently selectable N3 transforms.
- **Conditional:** helper-emitting transforms are unsupported in Expo runtime mode
  until their N2a allowlist and runtime differentials pass.
- **Partial/stop:** older-Hermes and webview consumer recipes cannot be complete on Oxc 0.141 because
  classes, destructuring, parameters, `for...of`, and block scoping are absent.
  Implement only proven native coverage and retain explicit consumer routing for the
  missing feature set.

### Babel runtime helper compatibility

The executable source of truth is `src/preflight/helpers.rs`; this table mirrors it
for review. Every path is relative to the configured helper module, every export is a
default export, and runtime mode rejects absent/older versions before codegen. The
version is deliberately part of the declarative pipeline/cache key. Expo's currently
resolved `@babel/runtime` 7.29.2 satisfies every row.

| Oxc helper                   | Babel helper path                    | Minimum version | Semantic differential                                           |
| ---------------------------- | ------------------------------------ | --------------- | --------------------------------------------------------------- |
| `awaitAsyncGenerator`        | `helpers/awaitAsyncGenerator`        | 7.0.0           | Babel async helper ABI; runtime fixtures required               |
| `asyncGeneratorDelegate`     | `helpers/asyncGeneratorDelegate`     | 7.0.0           | Babel async helper ABI; runtime fixtures required               |
| `asyncIterator`              | `helpers/asyncIterator`              | 7.0.0           | Babel async helper ABI; iterator closing is behavioral          |
| `asyncToGenerator`           | `helpers/asyncToGenerator`           | 7.0.0           | Babel async helper ABI; Promise scheduling is behavioral        |
| `wrapAsyncGenerator`         | `helpers/wrapAsyncGenerator`         | 7.0.0           | Babel async helper ABI; runtime fixtures required               |
| `extends`                    | `helpers/extends`                    | 7.0.0           | Babel helper ABI; built-in `Object.assign` posture is unchanged |
| `objectDestructuringEmpty`   | `helpers/objectDestructuringEmpty`   | 7.0.0           | Babel null/undefined throw behavior                             |
| `objectWithoutProperties`    | `helpers/objectWithoutProperties`    | 7.0.0           | Babel symbol/enumerability behavior                             |
| `defineProperty`             | `helpers/defineProperty`             | 7.0.0           | Babel key coercion and define-vs-assign behavior                |
| `readOnlyError`              | `helpers/readOnlyError`              | 7.0.0           | Babel error behavior                                            |
| `writeOnlyError`             | `helpers/writeOnlyError`             | 7.0.0           | Babel error behavior                                            |
| `taggedTemplateLiteral`      | `helpers/taggedTemplateLiteral`      | 7.0.0           | Babel freezing/raw-array behavior                               |
| `objectSpread2`              | `helpers/objectSpread2`              | 7.5.0           | Babel property ordering/getter behavior                         |
| `classPrivateFieldInitSpec`  | `helpers/classPrivateFieldInitSpec`  | 7.10.0          | Babel private-field brand behavior                              |
| `classPrivateMethodInitSpec` | `helpers/classPrivateMethodInitSpec` | 7.10.0          | Babel private-method brand behavior                             |
| `classPrivateFieldLooseKey`  | `helpers/classPrivateFieldLooseKey`  | 7.10.0          | Babel loose-key allocation behavior                             |
| `classPrivateFieldLooseBase` | `helpers/classPrivateFieldLooseBase` | 7.10.0          | Babel loose access/error behavior                               |
| `toPropertyKey`              | `helpers/toPropertyKey`              | 7.22.0          | Babel primitive/symbol coercion behavior                        |
| `checkInRHS`                 | `helpers/checkInRHS`                 | 7.22.0          | Babel private-in RHS error behavior                             |
| `classPrivateFieldGet2`      | `helpers/classPrivateFieldGet2`      | 7.24.0          | Babel 7.24 class-feature ABI                                    |
| `classPrivateFieldSet2`      | `helpers/classPrivateFieldSet2`      | 7.24.0          | Babel 7.24 setter/return-value ABI                              |
| `assertClassBrand`           | `helpers/assertClassBrand`           | 7.24.0          | Babel brand check/error behavior                                |
| `toSetter`                   | `helpers/toSetter`                   | 7.24.0          | Babel destructuring setter behavior                             |
| `superPropGet`               | `helpers/superPropGet`               | 7.24.0          | Babel receiver/getter behavior                                  |
| `superPropSet`               | `helpers/superPropSet`               | 7.24.0          | Babel receiver/setter/strict behavior                           |
| `usingCtx`                   | `helpers/usingCtx`                   | 7.28.0          | Babel disposal ordering and suppressed-error behavior           |

Oxc's decorator helpers are intentionally absent: decorators are rejected before
transformation. A request for any helper outside this table is a structured
`helper-not-compatible` bailout. Runtime mode imports directly from the configured
module at Oxc's helper-loader boundary; Noxcturnal never rewrites
`@oxc-project/runtime` text. Inline mode materializes the async helper family,
`usingCtx`, and the object/class family (`defineProperty`, `objectSpread2`,
`objectWithoutProperties`, `objectDestructuringEmpty`, `extends`, and
`toPropertyKey`) into one collision-free, file-local binding and shifts the decoded
map layer over that sourceless prefix. It introduces no dependency and no
`regeneratorRuntime` global. Runtime differentials cover async behavior,
loose/spec class fields, object spread/rest symbols and getter order, reverse and
async disposal, and suppressed disposal errors. Helpers outside these proven
families retain the explicit `inline-helper-not-compatible:<name>` boundary.

### Implemented source-stage adapter boundary

Flow remains consumer-provided, but the library boundary is now narrow:
`supports(classification)` selects an adapter and
`compile(source, filename, options)` returns only code, a compact VLQ map, its plain
JS-or-JSX syntax mode, metadata, or an explicit unsupported result. The normal native pipeline continues on the
compiled JavaScript; the adapter map is composed once as the innermost input layer.
Adapter name, version, and serializable options participate in both named pipeline
keys and classification keys. Conformance tests cover continuation through the
pipeline, map handoff, cache invalidation, and unsupported reasons. No Flow AST is
retained or cached.

The adjacent Expo checkout registers a worker-local adapter using its existing
`hermes-parser` 0.36.0 and `@babel/generator`. It parses ESTree once, applies Hermes'
enum, match, component, and record transforms, runs the full dedicated
`stripFlowTypes` transform, converts with the converter bundled in the same Hermes
version, and prints JS/JSX with a map. It does not invoke Babel's transform engine or
Flow-strip plugin. Adapter and generator versions are in the cache identity, and the
adapter's declared output syntax is authoritative even when the `@flow` comment is
preserved.

On 637 non-Codegen React Native 0.86 Flow files (2.29 MB), the focused route covered
637/637 at 0.421–0.451 ms/file across three interleaved hot rounds. Hermes plus
Babel's Flow transform took 1.026–1.134 ms/file, while the complete Expo Babel route
took 1.987–2.075 ms/file. The focused route is therefore the selected implementation.

The Expo consumer's real-preset differentials now cover enum and parameter-property
runtime behavior, TypeScript namespace expansion, a mapped output position, and
automatic JSX runtime selection in development and production. They also enforce
the consumer phase order `TypeScript/JSX → maintained Expo visitors`: running block
scoping first can edit declarations nested in a namespace before Oxc expands the
namespace. Expo selects `react/jsx-runtime` in both modes; development does not
select `react/jsx-dev-runtime` in this recipe. A TSX dependency differential proves
that type-only imports disappear while the runtime value import and
`react/jsx-runtime` remain. Using Expo's transformer alone does not prove that a
project retained this recipe; resolved project configs must match the default
descriptor and effective options, otherwise the consumer falls back.

Library-level Babel plugin differentials separately cover class static blocks,
logical assignment, loose/spec optional chaining and nullish coalescing, optional
catch binding, exponentiation assignment, sticky regexp construction, export
namespace behavior, spec object rest/spread, resource management, and loose/spec
class properties. A 12-case behavioral JSX matrix covers
classic/automatic × development/production × JS/JSX/TSX, while another 12 cases
exercise the real Expo preset for client/server × development/production ×
JS/JSX/TSX. These fixtures select one native toggle at a time and compare runtime
behavior; they do not introduce a target or preset into the Noxcturnal API.

React Compiler-enabled application JS/JSX/TS/TSX now uses a separate consumer
prepass rather than widening the dependency recipe. Oxc receives pristine source
and runs its fixed Compiler → TypeScript order while preserving JSX; the resolved
Expo Babel recipe then continues with Compiler disabled, retaining Expo plugins,
Refresh, JSX, and module handling. An end-to-end Metro fixture observes both
compiler-runtime output and `$RefreshReg$` and traces the generated component back
to its original TSX line. Flow, Codegen, server source, node modules, custom
transformers, and non-default project configs remain explicit Babel boundaries. The
project config is resolved a second time under the post-prepass Babel caller so
caller-conditional configuration cannot be silently reinterpreted.

### Benchmark checkpoint

The original no-preflight cases remain within the initial baseline gate. The latest
post-adapter/independent-toggle checkpoint on 2026-07-24 measured 0.3425 ms for one
changed rendered node, 12.1456 ms for dense 650 KiB edits, 13.5697 / 11.0665 ms for
the two copy cases, and 7.7615 ms for three rendered edits in 650 KiB. Enabled native
preflight microfixtures measured 0.0085 ms for TypeScript, 0.0076 ms for automatic
JSX, 0.0086 ms for an async generator, and 0.0427 ms for React Compiler. All
baseline guards remain within or better than the recorded gates.

For the new app prepass, five hot 300-file rounds compared the same representative
TSX component through Babel Compiler+TS+Refresh+JSX and through native Compiler+TS
followed by Babel Refresh+JSX. The former measured
1.437/1.354/1.160/1.130/1.067 ms/file; the latter
0.413/0.381/0.328/0.283/0.293 ms/file, a 3.48–3.99× speedup for this language
pipeline. Both paths emitted `react/compiler-runtime` and Refresh registration.

The 2026-07-24 clean Hermes iOS trace against `apps/router-e2e` requested
`.expo/.virtual-metro-entry.bundle` with `dev=true`, `minify=false`, and an empty
Metro cache:

| Evidence                      | Before maintained visitors | After all maintained visitors and Flow graph fix |
| ----------------------------- | -------------------------: | -----------------------------------------------: |
| Transformed JS modules        |                      1,257 |                                            1,257 |
| Full native-route completions |              1,129 (89.8%) |                                    1,155 (91.9%) |
| Babel transforms              |                        112 |                                               86 |
| Requested bundle wall time    |                    1.320 s |                                          1.234 s |
| Bundle module wrappers        |                      1,278 |                                            1,278 |
| Collected dependency edges    |                      3,838 |                                            3,839 |

The recovered population comprises 24 former
`hermes-super-in-object-accessor-fix` routes, one async-arrow workaround route, and
one Flow module that previously produced an empty adapter result. During that last
investigation, the graph comparison exposed that Hermes' focused Flow stripper drops
zero-specifier imports even when `importKind` is `value`. The adapter now preserves
those side-effect import nodes explicitly; this restores the missing
`../Utilities/BackHandler` edge in `renderApplication.js`, hence the intentional
3,838 → 3,839 graph correction. A direct complete-path test guards dependency
collection for this case. The full-route target exceeds 90%, and the controlled cold
request remains below the 1.25 s target. Remaining first-stage fallbacks are 49 React
Native Codegen files, 23 application files whose source transforms are not yet owned
here, 12 captured-loop block-scoping cases, and two explicit policy cases.

The fixture app's canonical project Babel config is resolved through Babel and
compared with the consumer's default Expo recipe. Equivalent resolved preset
descriptors and effective options retain the route; changed preset options, added
plugins, or other effective options fall back. Babel resolves the project side for
each filename so overrides remain authoritative, while the invariant default side
is cached by caller and resolution roots. The classifier measured 31.5 ms for
1,000 distinct hot filenames.
