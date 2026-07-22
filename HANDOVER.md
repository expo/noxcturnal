# Noxcturnal handover

## Project status

Noxcturnal is an independent native-backed JavaScript transformation library. It is a working codename, not a final package identity. The project lives at `/Users/phil/git/expo/noxcturnal`; the governing plan is `/Users/phil/git/expo/plan-native-metro-transform-visitors.md`.

The revised plan's general transform and JavaScript plugin contract is implemented and verified. The package deliberately does **not** expose a Metro transformer, dependency collection, dependency-map rewriting, wrapping, or any other framework-specific operation.

The current worktree consists of new, uncommitted files. Preserve it when continuing work.

## What is implemented

The public entry point exports:

- `transform` and `transformOrFallback`;
- `defineNativePlugin` and `defineNativePipeline`;
- `NativeTransformSession`;
- `registerParserAdapter`;
- `pipelineCacheKey`;
- `classify`, `nativeVersion`, and `oxcVersion`;
- the complete TypeScript plugin, visitor, path, scope, query, editor, mapping, result, and diagnostic types.

The transform contract supports:

- ordered immutable phases with a native render/reparse boundary between phases;
- immutable reusable plugin definitions with `withOptions`, plus frozen pipeline/phase/plugin-array snapshots;
- declarative subscriptions, fields, semantic/query requirements, metadata ownership, phase filters, and ancestry declarations;
- an optional analyze/apply lifecycle that resolves all transform decisions before any apply hook executes;
- `prepare`, isolated state creation, `pre`, enter/exit visitors, `post`, and guaranteed `cleanup` handling;
- concrete and union visitor keys plus `Function`, `Statement`, `Expression`, and `MemberExpression` aliases;
- per-plugin `skip`/`stop`, pipeline `stopAll`, targeted `path.traverse`, subtree/scope widening, remaining-file subscriptions, and explicit program revisits;
- lazy compact `parentPath`, `findParent`, function-parent, and program-parent access;
- declared structural child roles with one packed prefetch, Babel-shaped `get`, typed `getChild`/`getChildList`, and no hidden property-level FFI;
- nearest-scope binding/global checks, interned scope identity backed by Oxc's complete packed scope-parent table, parent/program-owner paths, lazy binding declaration/owning-scope paths, directive-safe `scope.push`, semantic binding rename (including shorthand-property preservation), and collision-safe UID generation;
- batched globals, imports, exports, conservative constant-expression evaluation, calls, binding read/write references, and lexical capture queries plus shallow node inspection; constant IDs and scope parents use dedicated packed integer-buffer calls rather than object transfer;
- field-aware Babel routes for referenced identifiers, meta properties, and Oxc-collapsed function/class declaration and expression variants;
- typed metadata ownership, structured diagnostics, deterministic errors, transactional bailout, and pristine caller fallback;
- caller-provided parser adapters for syntax outside the built-in parser contract.

The editor supports replacement/removal, multiple-fragment replacement, append/prepend, body-container insertion, comments, all four insertion affinities, move/reset/indent/trim, static and functional replacement lowering, source-map marks, overlap rejection, and UTF-16 public offsets. `context.editor.supports()` is the compatibility boundary; unsupported future MagicString operations must be capability-gated rather than silently approximated.

Source maps are generated as encoded VLQ in Rust. `line`, `boundary`, and `character` modes, mapping policies, names, Unicode offsets, explicit marks, encoded input maps, and multi-phase composition are implemented. Decoded segment arrays do not cross N-API.

## Architecture

### Native layer

- `src/engine.rs`: parser classification, Oxc parsing and semantic construction, packed event collection, owned follow-up indexing, native session class, field filtering, global facts, inspection, fragment validation, commits, timings, and memory accounting.
- `src/editor.rs`: UTF-16-to-byte conversion, edit normalization, insertion affinity ordering, and overlap validation.
- `src/sourcemap.rs`: direct VLQ emission, fidelity modes, names, marks, and encoded map composition.
- `src/lib.rs`: deliberately small NAPI-RS binding surface.

Oxc crates are pinned together at `0.141.0`. The native session uses the safe ownership option from the plan: parse and semantic work materialize owned indexes in one call. It does not retain a borrowed/self-referential Oxc AST across N-API returns. The pipeline supplies merged subscriptions and declared query requirements at construction, so narrow transforms do not first retain a broad event index. Follow-up batches reuse materialized node families and lazily reparse only when an undeclared family is requested.

### JavaScript layer

- `js/types.ts`: public data contracts.
- `js/native.ts`: local/platform binding loader and unavailable-binding behavior.
- `js/visitors.ts`: session facade, pipeline executor, dispatcher, path/scope/editor facade, queries, lifecycle, bailout, parser adapters, and cache keys.
- `js/index.ts`: public exports.

Hot node views share one ephemeral shallow record with their packed event header; public session batches retain their documented event representation. Parent paths are constructed lazily from compact native indexed records. Per-plugin path operations are shared through one runtime object instead of allocating closures per node. Avoid reintroducing eager recursive ancestor construction: it previously increased the static visitor benchmark from about 20 ms to about 266 ms.

## Important semantics

- All plugins in one phase observe the same immutable input source and AST.
- Enter handlers run in plugin declaration order; exit handlers run in reverse plugin order.
- Edits are buffered and committed transactionally after visitor replay.
- Generated code is visible only in a later phase.
- A plugin receives each `(node, side)` once unless it explicitly traverses/revisits.
- Public ranges use JavaScript UTF-16 code units. Rust byte offsets never leak into the JS API.
- A bailout discards edits and attempted metadata and returns the pristine original input.
- Flow and unknown syntax return stable unsupported routes unless a caller parser adapter handles them.
- Catch-all visitors require `allowBroadVisitors` and emit an optimization diagnostic.
- Sessions are synchronous, explicitly closable, worker-thread isolated, batch-budgeted, and memory-budgeted.

The `Function` alias must match real function nodes only. Do not change it back to substring matching: that incorrectly classified `FunctionBody` as a function and was caught by the ancestor contract tests.

## Development and verification

Use Nix for Rust tooling. From `/Users/phil/git/expo/noxcturnal`:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm verify
pnpm benchmark
nix shell nixpkgs#cargo nixpkgs#rustc nixpkgs#rustfmt nixpkgs#clippy nixpkgs#pkg-config -c cargo fmt --check
nix shell nixpkgs#cargo nixpkgs#rustc nixpkgs#rustfmt nixpkgs#clippy nixpkgs#pkg-config -c cargo clippy --all-targets -- -D warnings
pnpm pack --pack-destination "$(mktemp -d)"
git diff --check
```

`pnpm verify` runs TypeScript checking, the Vitest integration suite, and Rust unit tests. Integration tests and benchmarks intentionally use Vitest, per project requirement.

Latest verified results on macOS arm64:

- 55 Vitest integration/fitment tests passed;
- 7 Rust unit tests passed;
- TypeScript, `cargo fmt`, clippy with denied warnings, frozen offline install, package dry-run, and `git diff --check` passed;
- the latest Metro transform spike run over its 500-file synthetic corpus (847.9 KiB, source maps enabled) completed in 20.0 ms median versus Babel's 214.9 ms across 12 warm samples: **10.73x faster than Babel** and **3.80x faster than Oxc-walker + MagicString**;
- all four implementations observed 8,500 dependencies; the benchmark checks parseability and stable checksums for every implementation;
- native stages on the final sample were approximately parse 2.4 ms, semantic 2.1 ms, traversal 1.9 ms, and render/map 2.0 ms; measured N-API transfer was 2.2 ms after subtracting native stage time.
- the latest standalone Vitest run averaged 4.13 ms for subscribed identifier materialization, 11.94 ms for broad materialization, 1.73 ms for the static JavaScript visitor fixture, and 5.78 ms for a declared structural child transform.

`.github/workflows/ci.yml` now verifies the full project on macOS arm64 and builds artifacts for all eight declared NAPI targets. The matrix still needs its first hosted run before cross-platform distribution is considered validated.

Benchmark numbers are machine-local and should be treated as regression indicators, not universal acceptance figures.

The packed event word stream and the non-ASCII byte-to-UTF-16 index use the parse's `oxc_allocator` arena. Packed field requests and edit commands are decoded directly from N-API buffers without an intermediate word vector, ASCII edit normalization does not allocate an offset index, and hot owned hash indexes use the same `rustc_hash` implementation used throughout Oxc. Keep final code/maps, edit records containing strings, public event objects, and interned owned strings outside the arena: they either cross the N-API boundary or contain `Drop` types, which Oxc arena containers deliberately do not support.


## Tests worth preserving

`test/runtime.test.ts` covers parser routing, narrow native materialization, phase reparsing, lifecycle and ordering, aliases, field-aware Babel visitor routes, member-chain matching, declared structural child roles, traversal and widening, semantic and conservative constant-expression queries, binding paths and complete scope identity/parents/insertion, inspection, editor behavior, transactional conflict handling, bailout/fallback, parent paths, ancestry helpers, metadata ownership, parser adapters, map composition/tracing, Unicode and CRLF mappings, worker threads, budgets, and randomized non-overlapping edit batches. `test/fitment.test.ts` implements representative Metro module lowering and server-action extraction end to end, including output parsing.

`benchmark/runtime.bench.ts` compares narrow native event materialization, deliberately broad materialization, and the static JavaScript visitor facade. Any hot-path change should run all three.

## Packaging

The root package is a pnpm workspace with eight NAPI platform packages under `npm/`:

- macOS arm64/x64;
- Linux arm64/x64, GNU and musl;
- Windows arm64/x64 MSVC.

The root package declares them with `workspace:*` optional dependencies. `pnpm pack` rewrites these to `0.1.0` in the published manifest. The loader first tries the local `.node` file and then the matching optional platform package. Failure to load produces the stable `native-load-failed` parser route so callers can fall back without breaking startup.

Only the local macOS arm64 binary has been built. The other directories are publish scaffolds and require their respective CI builds before release.

## Deliberate extension points and remaining gates

The general JS plugin API is complete, but the following plan items are intentionally optional feasibility/distribution gates rather than missing framework operations:

- Flow parsing remains caller-adapted/Babel/Hermes territory.
- A continuation traversal cursor is unnecessary while indexed follow-up scans meet the API and performance requirements.
- Static events and edit commands use packed integer buffers with UTF-8 string tables. The protocol is generated from `protocol/event-schema.json`, and `scripts/sync-oxc-event-schema.mjs` keeps all 189 current Oxc node kinds synchronized with the pinned crate.
- Separately compiled native-plugin registration is not exposed yet; no framework-specific native plugins should be added to this package to simulate that extension point.
- Full MagicString `Bundle`, mutable offset, decoded-map compatibility helpers, and deprecated locate helpers are outside the hot general transform contract.
- Recorded Expo bundle corpus comparisons, Babel differential fixtures, 11-worker cold-bundle measurements, and cross-platform binary CI require downstream fixtures/infrastructure not present in this standalone repository.
- Publication still requires selecting the final npm identity, building every supported binary, and running install/load tests on each target.

If downstream integration begins, keep it outside Noxcturnal. Add only general node facts, queries, editor capabilities, or plugin primitives that can be justified independently of Metro/Expo policy.

## Recommended next work

1. Add CI for the eight platform packages and test installation through the optional-dependency loader.
2. Run the recorded corpus and Babel differential gates when downstream fixtures are available.
3. Profile real plugins using declared narrow fields and subscriptions; extend direct typed fact encoders generically as additional hot node families appear.
4. Expand semantic fixtures for destructuring, hoisting, class/private scopes, catch bindings, TS namespaces/enums, and JSX references as real consumers exercise them.
5. Keep API changes experimental until ordering, dynamic subscription, and mutation semantics have downstream canary coverage.

Do not add a Metro transformer or dependency collector as a convenience API. That would reverse the central scope decision in the revised plan.
