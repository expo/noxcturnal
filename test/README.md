# Test suite ownership

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
or public-surface assertion merely to reduce test count. Record the surviving test in the review or
change description when deleting coverage.

Implementation constraints for a transform live in the feature README beside the code
(under [`js/`](../js/) and [`src/`](../src/README.md)). A test records an
observable contract. It does not replace that note.
