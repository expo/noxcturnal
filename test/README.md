# Test suite ownership

This directory checks Noxcturnal at four levels: compatibility with reference transforms, runtime behavior, individual transform output, and the packaged public API. Use the suite descriptions below to choose where a regression belongs. Tests beside the implementation in `js/` and Rust modules cover their local contracts.

Every test under this directory is owned by this repository and may be maintained directly. In
particular, the fixture and corpus cases under `transforms/` are freestanding tests: they are not
generated from, synchronized with, or sourced from another checkout. Use the normal Vitest
snapshot workflow when an intentional output change requires snapshot updates.

## Suite layers

- `alignment/` compares native output structure or behavior with the pinned Babel plugins or Hermes
  transforms. Put canonical compatibility comparisons here, including separate reference option
  modes when each mode is useful evidence.
- `compliance/` executes transformed programs. Put runtime semantics here, especially evaluation
  order, receivers, descriptors, errors, control flow, and helper behavior.
- `transforms/` owns fast public-transform selection tests, focused output contracts and regressions,
  plus the larger freestanding fixture and corpus collections. A focused selection test should show
  that syntax owned by the selected transform changes. Name deliberate identity, unsupported, and
  bailout cases as boundaries instead of claiming that they lower syntax.
- `integration/` tests the packaged public surface and advertised capabilities. Put export, package-loading,
  pipeline-composition, and advertised-capability coverage here.

`fixtures/flow-parser-update/` is the shared Hermes parser-update matrix. Alignment and public Flow
tests both read it. Its README is the coverage record for that pin.

A structural alignment test, an executed semantic test, a focused regression, and a packaging test
can reasonably start from similar source. That overlap is intentional when each copy observes a
different contract. Similar subject matter or source text alone is not evidence that one is
redundant.

## Adding and deleting tests

Choose the narrowest layer that owns the contract. Add a focused regression beside its transform;
add a broader imported-style example to the repository-owned fixture or corpus table only when that
collection is the useful scope. Keep table rows independently named so a failure identifies the
scenario and option mode without an array index.

Before deleting a test, identify a surviving test with the same input category, transform options,
execution path, and observable assertion. The survivor must fail for the same regression. Broader
coverage, a similar title, or a test in another layer is not enough. Do not remove an alignment mode,
runtime semantic contract, bailout boundary, source-map contract, helper ABI/output-shape assertion,
or public-surface assertion merely to reduce test count. Historical comparisons may be retired
when direct regressions assert the selected behavior. Babel execution is not a separate contract
that must live forever: preserve the native input categories, options, helper modes, execution
paths, expected results, and output assertions in the current owner. Remove superseded audit
controls and expected-failure assertions about an unselected behavior once that owner covers the
current contract. Record the surviving test in the review or change description when deleting
coverage.

Implementation constraints for a transform live in the feature README beside the code
(under [`js/`](../js/) and [`src/`](../src/README.md)). A test records an
observable contract. It does not replace that note.

## Readable assertions

Keep a scenario's input, options, expected observations, and assertions together. Use named table
rows and object properties for independently meaningful observations; an array is appropriate when
order itself is the contract. Avoid numeric indexes into a separate expected-output table. Fixture
cases may declare one shared `output` beside `source`, or override it per mode when modes differ.
Use multiline source for programs with multiple statements. Preserve deliberate whitespace, source
locations, parentheses, and literal spellings when rewriting a regression.

Put assertions in the test body. Use hooks for expensive shared resources, with cleanup, rather
than doing the actual test in `beforeAll` and checking a staged value later. A rejection test should
assert the operation throws directly; a catch block around assertions can accidentally catch its
own assertion failure. Remove obsolete expected-failure flags once a regression passes.

An executed program needs an observable result and an explicit expected value. Comparing native
and reference output alone can let both return an unintended `undefined`. Alignment additionally
checks that the selected syntax changed, since Node may already execute the original syntax.
Keep output-shape checks alongside semantic assertions when the helper ABI or lowering is part of
the contract. Native stress tests must check the resulting output as well as completing without
an error; a large fixture alone does not prove it exercised the intended branch.

## Execution cost and redundancy

Group related regressions into focused feature files with named scenario sections. Each isolated
file reloads the runtime and its reference-transform dependencies. Keep isolation enabled: adapter
registration, definition budgets, mocks, and module state are contracts tested by these suites.

Retain transform-option and helper-version combinations that exercise distinct paths. Move a
pristine source control outside a helper-version matrix when that version cannot affect the
untransformed source, or remove it once explicit expected results make the control obsolete.
Batch related crash-isolated cases in one bounded child process when they can report individually
labeled results. Keep process isolation for native crash/hang regressions and actual package
loading. Pack a single archive for package-consumer scenarios that use identical package contents;
each consumer still gets its own directory and cleanup.

Measure before pruning. Fixture and corpus modes cover distinct source, filename, options, and
output combinations, including identity and bailout cases. Combine split assertions about one
execution before removing modes; use the survivor requirements above for any coverage deletion.

Run a focused suite with `pnpm test test/alignment` (or another owning directory). To compare whole
suite costs on a constrained machine, use the same worker count and built addon for both revisions:

```sh
pnpm test --maxWorkers=2 --minWorkers=2 --reporter=json --outputFile=/tmp/noxcturnal-tests.json
```

Compare elapsed wall time, per-file duration, executed cases, and skipped cases. Collection and
worker startup are separate costs from test-body execution; adding all per-file durations does not
give wall time. Keep benchmark reports outside the repository. Optional registry, browser, and
release-addon cases remain explicit skips when their prerequisites are absent.

`pnpm check` runs native tests with `cargo test --workspace`, including Hermes erasure and linking
tests. It shares Cargo's host target with the N-API build so native dependencies can be reused
between code generation, Clippy, building, and testing. Cold Rust/Hermes compilation is a separate
CI cost from the JavaScript case count.
