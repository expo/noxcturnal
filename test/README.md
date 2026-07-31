# Test suite ownership

Every test under this directory is owned by this repository and may be maintained directly. In
particular, the fixture and corpus cases under `transforms/` are freestanding tests: they are not
generated from, synchronized with, or sourced from a Babel or Expo checkout. Use the normal Vitest
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
- `integration/` tests the packaged public surface and fitment claims. Put export, package-loading,
  pipeline-composition, and advertised-capability coverage here.

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

`pnpm test:duplicates` runs the exact-duplicate inventory as part of `pnpm check`; it is a
classification aid, not permission to collapse suite layers. `duplicate-allowlist.json` is reviewed
code: every allowed duplicate must state why the copies are intentional and name the distinct
observable contract protected by each one. New exact duplicates must either be removed or added to
that allowlist with the same evidence; renaming or formatting a case does not make duplicate
execution distinct.
