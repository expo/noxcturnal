# Module restructuring before native preflight transforms

Date: 2026-07-24

## Decision

Yes: refactor `js` and `src` before adding the bulk of
`PLAN_NATIVE_PREFLIGHT_TRANSFORMS.md`, but keep the refactor narrow, mechanical, and
behavior-preserving.

The problem is not the top-level `js`/`src` split. That split is appropriate:

- `js` owns the public TypeScript API, pipeline planning, plugin execution, and the
  N-API client.
- `src` owns parsing, semantic indexing, routed event production, edit commitment,
  code generation, and source maps.

The problem is that most responsibilities inside each side have accumulated in one
file. `js/visitors.ts` is about 4,900 lines and contains public type contracts,
pipeline definition and validation, cache keys, parser adapters, session
orchestration, route compilation, dispatch, paths/scopes/bindings, fragments,
editing, classification, and utility code. `src/engine.rs` is about 3,000 lines and
contains classification, route-manifest decoding, AST field projection, retained
and streaming route execution, wire encoding, edit decoding/commitment, fragment
validation, and source-map composition.

Preflight would add several new axes—Flow source adapters, Oxc transform planning,
React Compiler, JSX/TS lowering, helper loading, and generated dependencies. Adding
them to the two existing aggregators would make ordering and ownership harder to
reason about and test.

Do not rename `js` to `src` or move Rust into a novel top-level directory. That
creates packaging churn without improving the boundary. Keep `js/index.ts` and
`src/lib.rs` as stable composition roots and preserve all current public exports.

## Design rules

- Organize by responsibility, not by individual class or function.
- Dependencies point inward:
  public API → pipeline/runtime orchestration → protocol/native binding. Shared
  domain types must not import orchestration.
- Wire-format constants have one generated/schema-backed source of truth where
  practical. Until generation is available, colocate and cross-test the TypeScript
  and Rust definitions.
- Generated files live in explicit `generated/` modules and are never hand-edited.
- Preflight is its own subsystem on both sides. It must not be folded into visitor
  dispatch merely because both are transforms.
- Extraction commits contain no intentional behavior or public-type changes.
- Avoid tiny files. A module should represent a coherent subsystem with a useful
  test seam; roughly 200–800 lines is a guide, not a gate.
- Preserve the zero-cost path when no preflight configuration is enabled.

## Target TypeScript layout

```text
js/
  index.ts                         public exports only
  types.ts                         stable result/query/native DTOs
  native/
    binding.ts                     binary discovery and N-API interface
  protocol/
    events.ts                      routed/packed event decoding and dispatch
    edits.ts                       edit and field-request encoding
    manifest.ts                    route-manifest encoding
    constants.ts                   wire constants (generated later if possible)
  contracts/
    visitor.ts                     typed visitor and route contracts
    plugin.ts                      plugin/context/metadata contracts
    path.ts                        public path/scope/binding/fragment interfaces
  pipeline/
    define.ts                      define/freeze plugin, visitor, and pipeline
    compile.ts                     phase and route compilation
    validate.ts                    contract/predicate/capability validation
    cache-key.ts                   stable keys and static-plan caches
    types.ts                       internal prepared/compiled plan types
  runtime/
    transform.ts                   top-level transform orchestration
    session.ts                     NativeTransformSession
    dispatch.ts                    event callback dispatch and control flow
    path.ts                        path/scope/binding implementations
    editor.ts                      edit collection, realization, and conflicts
    fragments.ts                   code/source/composite fragment realization
    metadata.ts                    metadata and performance accounting
  adapters/
    registry.ts                    source/parser adapter registry and identity
    classification.ts              filename/source classification policy
  preflight/                       added by the preflight plan, not this refactor
    types.ts
    plan.ts
    helpers.ts
  generated/
    event-schema.ts
```

`types.ts` should remain a compatibility barrel initially. Move a public type only
when `index.ts` continues to export it from the same package entry and generated
declarations remain compatible. Internal modules should import from the owning file,
not through `index.ts` or a broad barrel.

The current `protocol.ts` should be split early because preflight-generated imports
will need a clear dependency-metadata path, while route manifests and edit packing
are unrelated wire concerns. The current `native.ts` becomes `native/binding.ts`;
retain a temporary re-export only if internal migration requires it.

## Target Rust layout

```text
src/
  lib.rs                           N-API exports and module composition only
  syntax/
    classification.rs             SourceType and fallback classification
    fragments.rs                  expression/statement validation
  engine/
    mod.rs                         indexed-session facade
    session.rs                     NativeIndexedSession lifecycle
    fields.rs                      AST node field projection
    collect.rs                     streaming event collection
    retained.rs                    retained route execution facade
  protocol/
    mod.rs
    manifest.rs                    route manifest decoding/validation
    routed.rs                      routed envelope encoding
    edits.rs                       packed edit decoding
    constants.rs                   limits, tags, and magic values
  semantic/
    retained_index.rs
    constant_eval.rs
  edit/
    mod.rs                         piece-table edit construction
    commit.rs                      commit entry points
  sourcemap/
    mod.rs                         rendering
    decoded.rs                     decoded-layer packing/composition
    vlq.rs                         VLQ encoding/composition
    function_map.rs
  generated/
    event_schema.rs
  preflight/                       added by the preflight plan, not this refactor
    mod.rs
    options.rs
    transform.rs
    helpers.rs
```

This is an ownership map, not a requirement to create every directory immediately.
Keep `editor.rs`, `sourcemap.rs`, `function_map.rs`, `retained_index.rs`, and
`constant_eval.rs` intact until an extraction needs their boundary. The first Rust
priority is decomposing `engine.rs`, since it currently crosses syntax, semantic,
protocol, and commit layers.

`engine/mod.rs` should expose a small crate-private facade used by `lib.rs`.
Protocol modules may depend on neutral DTOs and schema data, but must not own parser
or visitor logic. `preflight` may depend on syntax, Oxc transformer/codegen, helper
ABI, and sourcemap modules; it must not depend on the JS visitor protocol.

## Dependency shape

```text
TypeScript:
index
  └─ pipeline + runtime
       ├─ contracts
       ├─ adapters / preflight
       ├─ protocol
       └─ native binding

Rust:
lib (N-API)
  ├─ engine ── semantic
  │    ├─ syntax
  │    └─ protocol
  ├─ edit ── sourcemap
  └─ preflight ── syntax + sourcemap
```

No TypeScript module below `runtime/transform.ts` may import the package root.
Rust `protocol` must not import `engine`; neutral types should move down or be passed
in. These two rules prevent the likely circular dependencies.

## Migration plan

### R0: lock the current surface and dependency graph

- Snapshot the package export names and emitted `dist/index.d.ts`.
- Add architecture checks for forbidden imports:
  internal TypeScript imports from `./index`, protocol → runtime/pipeline, and Rust
  protocol → engine.
- Record current build artifact paths and binary loading behavior.
- Record `pnpm benchmark`; restructuring is held to the same no-regression discipline
  as preflight.
- Gate: no file moves and no behavior changes.

### R1: extract low-coupling TypeScript modules

- Move native binding loading to `native/binding.ts`.
- Split `protocol.ts` into manifest, events, and edits without changing bytes.
- Move generated schema to `generated/event-schema.ts` and update both generation
  scripts so generation remains the only writer.
- Keep compatibility re-exports during the extraction, then remove internal imports
  through the old files in the same phase.
- Gate: byte-for-byte protocol fixture equality, public declaration snapshot, full
  verification, and packaging smoke test against the built native binary.

### R2: extract TypeScript contracts and pipeline compiler

- Move public visitor/path/plugin contracts first, with no runtime implementations.
- Extract pipeline definition/freezing, route compilation, validation, and cache
  keys. Keep caches beside the compiler that owns their invariants.
- Do not redesign the typed contracts during this phase.
  `PLAN_TYPED_VISITOR_CONTRACTS.md` remains the authority for type-surface changes.
- Gate: existing public type tests unchanged, invalid-contract diagnostics unchanged,
  cache keys byte-for-byte equal, and pipeline objects retain current freeze
  behavior.

### R3: extract the TypeScript runtime

- Move session orchestration, dispatcher, path/scope/binding implementations,
  fragments, editing, and metadata into `runtime/`.
- Make `runtime/transform.ts` the only coordinator. It receives compiled plans and
  adapters through explicit inputs rather than reaching into registries and caches
  throughout the runtime.
- Move parser-adapter registration and classification into `adapters/`; preserve the
  existing public registration function.
- Gate: full runtime suite, source-map and diagnostic snapshot parity, memory counters
  unchanged, and interleaved benchmark A/B if any hot benchmark moves beyond noise.

### R4: decompose `src/engine.rs`

- Extract classification and fragment validation first; they already have narrow
  inputs and outputs.
- Extract manifest decoding and routed envelope encoding together, preserving all
  limits and validation errors.
- Extract AST field projection and streaming collection.
- Make retained route execution consume `semantic::RetainedIndex` through a narrow
  interface; do not rewrite the index itself.
- Move packed edit decoding beside commit entry points.
- Gate each extraction independently with existing Rust tests plus byte-for-byte
  routed buffers, exact error messages where public, and `cargo clippy -D warnings`.

### R5: clarify source-map and generated-code ownership

- Move decoded-layer packing/composition and VLQ concerns behind separate internal
  modules while preserving the existing facade.
- Move `function_map` under sourcemap only if the dependency direction remains clean;
  otherwise leave it top-level rather than forcing an inaccurate hierarchy.
- Move generated Rust schema and update `sync-oxc-event-schema.mjs`.
- Gate: decoded and VLQ reference equivalence tests, generated-file check, and
  function-map snapshots.

### R6: establish empty preflight seams

- Add declarative preflight option types and empty Rust/TypeScript module facades.
- Thread an optional, disabled preflight plan through `pipelineCacheKey` and transform
  orchestration only when the corresponding phase from the preflight plan begins.
- Do not add Oxc transformer dependencies or behavior in this restructuring plan;
  those remain N0/N1 of `PLAN_NATIVE_PREFLIGHT_TRANSFORMS.md`.
- Gate: disabled configuration has identical cache keys unless a preflight field is
  explicitly present, identical output, and no measurable hot-path cost.

## Sequencing with the preflight plan

R0–R4 should precede native preflight N1. N0's dependency and coverage spike may run
before or alongside the restructuring because it does not change runtime behavior.
R5 can overlap N0, but must finish before decoded Oxc maps are integrated. R6 and
preflight N1 should be treated as one handoff: this plan establishes ownership;
the preflight plan implements behavior.

Do not block TypeScript/JSX capability work on an ideal final tree. If R1–R4 expose
the `pipeline`, `runtime`, `adapters`, `engine`, and `protocol` seams, the structural
goal is met. Further splitting should be justified by an actual dependency or test
problem.

## Test organization

The current `test/runtime.test.ts` is also about 4,000 lines. Split it after the
production seams exist, following behavior rather than mirroring files:

```text
test/
  pipeline/
  runtime/
  protocol/
  adapters/
  sourcemap/
  integration/
  public-types.test-d.ts
  fitment.test.ts
```

Avoid moving tests and production code in the same extraction commit unless a test
imports a newly internal symbol. Stable behavior tests are the safety net for these
moves, not cleanup collateral.

## Completion criteria

- `js/visitors.ts` and `src/engine.rs` no longer exist as catch-all modules.
- Public package exports and native ABI are unchanged.
- Pipeline compilation, runtime execution, wire protocol, adapters, and preflight
  have explicit owners.
- No new circular dependencies or broad compatibility barrels exist internally.
- Generated code has explicit locations and generation commands.
- Full verification, formatting, declaration snapshots, packaging smoke tests, and
  benchmark gates pass.
- The preflight plan can add Flow, React Compiler, lowering, and helper handling
  without modifying visitor dispatch or route-protocol internals.
