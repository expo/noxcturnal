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
untransformed source, or remove it once explicit expected results make the control obsolete. A
repeated source string in alignment, compliance, and packaging needs inspection of its options,
execution path, and assertions. Keep distinct contracts and retire comparisons superseded by the
current native regression; suite placement alone does not justify a duplicate.

Batch related crash-isolated cases in one bounded child process when they can report individually
labeled results. Keep process isolation for native crash/hang regressions and actual package
loading. Pack a single archive for package-consumer scenarios that use identical package contents;
each consumer still gets its own directory and cleanup. The array-tail packaging matrix retains
all five syntax forms, four transform configurations, and two helper modes. Its shared Babel
controls run once per syntax form and transform configuration, since native helper mode does not
change the Babel invocation.

`compliance/rest-helper-fallback.test.ts` retains all 56 transform/helper-version/module-format
cases and checks the installed runtime version once. Its 28 CommonJS programs use fresh VM contexts
with real runtime-helper loading; its 28 ESM programs keep subprocess execution for module loading.
Pristine source controls are retired now that the transformed expectations are explicit.

In the runtime field tests, the numeric `toHaveLength(1)` and exact string equality assertions
subsume the former repeated length and string-type assertions respectively.

Measure before pruning. The fixture/corpus inventory has distinct source, filename, options, and
output combinations, including deliberate identity and bailout cases. Removing those modes to
reduce the displayed test count would weaken coverage. Combine split assertions about one
execution instead, and remove repeated controls only with the survivor evidence described above.

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

## Current owners of retired audit coverage

Established behavior is asserted directly in the following suites. Their native input categories,
transform options, helper versions/modes, execution paths, output guards, and expected observations
replace the historical reference comparisons. Source/Babel controls are intentionally retired;
they do not exercise Noxcturnal. A fixture snapshot alone does not replace executed semantics.

| Retired comparisons                                                             | Current owner                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Six class/private criteria suites                                               | `compliance/class-lowering-boundaries.test.ts`: 41 named scenarios, both helper modes, syntax and helper-import assertions                                                                                                         |
| Six binding/parameter/destructuring criteria suites                             | `compliance/variable-lowering-boundaries.test.ts`: 23 named scenarios and the same 36 helper-mode cases                                                                                                                            |
| Class/private helper fallback comparisons                                       | `compliance/class-helper-fallback.test.ts` and `compliance/private-helper-fallback.test.ts`: all 50 native helper-version/module-format cases, exact results, and helper import/fallback assertions                                |
| Async protocol and delegation criteria                                          | `compliance/async-helper-contract.test.ts`: ten named cases, both helper modes, explicit current observations                                                                                                                      |
| Identical regexp-helper-compatibility and async-regexp-criteria suites          | `compliance/regexp-helper-contract.test.ts`: eight named cases, both helper modes, named-group removal and helper imports                                                                                                          |
| Object criteria                                                                 | `compliance/object-helper-contract.test.ts`: eight strict rest/spread cases, both helper modes, copy values, ordering, prototypes, and helper imports                                                                              |
| Operator criteria and edge criteria                                             | `compliance/operator-boundaries.test.ts`: six coercion/dispatch cases, including BigInt coercion order, syntax removal, and helper absence                                                                                         |
| Logical/private/super, optional/private/super, and BigInt audit comparisons     | Existing named cases in `compliance/operators.test.ts`; their output guards run on the same compilation as the semantic assertions                                                                                                 |
| Repeated Unicode/dot-all/set/named-group comparisons                            | Existing named cases in `compliance/regexp.test.ts`; transferred guards retain flag/escape removal and the no-helper identity boundary                                                                                             |
| Await-using lookup/suspension comparison                                        | `compliance/resources.test.ts`: “await using follows async lookup fallback and nullish suspension semantics”, including its output guard                                                                                           |
| Static-block and derived-inheritance alignment copies                           | Existing named cases in `compliance/classes.test.ts`, including transferred output guards                                                                                                                                          |
| TypeScript declaration/runtime audit references                                 | `compliance/typescript-declarations.test.ts` and `compliance/typescript-runtime.test.ts`: all native extension/helper/loose/shape/error/dependency cases; TypeScript-only diagnostics audits retired                               |
| Decorator accessor/order, class environments, and transform boundary references | Same named sections in `compliance/decorator-accessor-order.test.ts`, `compliance/decorator-class-environments.test.ts`, and `compliance/decorator-transform-boundaries.test.ts`; all 284 native cases and adapter controls remain |
| Async constructor new.target and module references                              | `compliance/async-helper-contract.test.ts` retains both helper modes for constructor new.target; `compliance/async-modules.test.ts` retains all eight actual ESM/helper-mode cases                                                 |
| Exponentiation receiver/default/reentry comparisons                             | `compliance/exponentiation-references.test.ts`: all 30 compact/reference/coercion cases with explicit results and output guards                                                                                                    |
| Duplicated cold regexp helper initialization audits                             | `compliance/regexp-helper-contract.test.ts`: explicit cold-process TypeError in both helper modes, syntax removal and import checks                                                                                                |
| Regexp Unicode/sticky/token audit references                                    | `compliance/regexp-runtime-boundaries.test.ts`: nine direct cases preserving both Unicode lowering selections, UTF-16 boundaries, shadowed RegExp, and adjacent-digit behavior                                                     |
| Numerical and GetValue optimizer audit copies                                   | `compliance/optimizer-contexts.test.ts`: selector/context matrices, explicit UTF-16/numeric observations and transferred no-addition output guard; broader distinct coercion/exception matrices remain                             |
| Decorator reflection and repair references                                      | `compliance/decorator-reflection.test.ts` and `compliance/decorator-repair-regressions.test.ts`: all 42 native hook/repair/helper cases, including ignored Reflect.decorate hooks and dynamic accessor callbacks                   |
| Conditional/try nested-super TypeScript audit controls                          | Five native cases in `compliance/typescript-runtime.test.ts`: branch-selected initialization and finally ordering across helper/class modes; TypeScript-only rejection probes retired                                              |
| Optional new.target/deletion context comparisons                                | `compliance/optional-contexts.test.ts`: the same three native context cases, exact results, syntax removal, and helper absence                                                                                                     |
| Duplicate fragment wrapper escape                                               | `js/runtime/__tests__/parser-outcomes-regressions.test.ts`: expression-fragment row for `0); extra(); (0`                                                                                                                          |
| Duplicate const=; parse-outcome audit                                           | The routed and parameters matrix rows in that parser suite, plus its focused native→visitor test preserving the unique phase-boundary assertion                                                                                    |
| Published 0.1.1 package-loading audit                                           | `integration/package-esm-loading.test.ts`: current tarball, both loaders, actual binary identity, local precedence, optional fallback, and missing-addon errors; built-package composition retains classification                  |

The compliance table reference arms (including host-skipped pristine `using` programs) are removed.
The remaining transformed rows retain explicit expectations. Historical desired-spec `test.fails`
rows that duplicate selected helper behavior are replaced by truthfully named current-state cases;
other unresolved failures remain explicit. API unit tests likewise keep their native inputs and
expected results without repeatedly executing Babel or pristine fixture controls.

<details>
<summary>Scenario replacements for removed compliance rows</summary>

- test/compliance/variables.test.ts: “parameter defaults preserve anonymous function names” → test/compliance/variable-lowering-boundaries.test.ts: “anonymous parameter defaults have an empty inferred name” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “array destructuring honors an overridden array iterator” → test/compliance/variable-lowering-boundaries.test.ts: “array fast path ignores an overridden iterator” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “destructuring defaults preserve anonymous function names in bindings and assignments” → test/compliance/variable-lowering-boundaries.test.ts: “anonymous destructuring defaults have empty inferred names” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “default parameters named arguments do not shadow generated argument reads” → test/compliance/variable-lowering-boundaries.test.ts: “a default parameter named arguments shadows generated argument reads” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “non-simple parameters preserve the throwing arguments.callee accessor” → test/compliance/variable-lowering-boundaries.test.ts: “lowered non-simple parameters expose arguments.callee” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “parameter lowering preserves arrow non-constructability and absence of prototype” → test/compliance/variable-lowering-boundaries.test.ts: “lowered parameter arrows are constructable and have a prototype” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “array elisions do not read iterator values” → test/compliance/variable-lowering-boundaries.test.ts: “array elisions read iterator values before closing” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “array destructuring rejects legacy iterator-only object” → test/compliance/variable-lowering-boundaries.test.ts: “array destructuring accepts a legacy iterator-only object” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “array binding defaults interleave iterator steps” → test/compliance/variable-lowering-boundaries.test.ts: “iterator consumption completes before defaults execute” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “object assignment with default evaluates target before source getter” → test/compliance/variable-lowering-boundaries.test.ts: “object getter runs before the assignment target” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “parameter arrows preserve lexical this in direct eval” → test/compliance/variable-lowering-boundaries.test.ts: “direct eval in a lowered parameter arrow uses its call receiver” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “parameter arrows preserve lexical arguments in direct eval” → test/compliance/variable-lowering-boundaries.test.ts: “direct eval in a lowered parameter arrow uses its call arguments” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “catch destructuring defaults cannot see body lexical bindings” → test/compliance/variable-lowering-boundaries.test.ts: “catch defaults observe the body binding temporal dead zone” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “catch destructuring default closures keep outer lexical bindings” → test/compliance/variable-lowering-boundaries.test.ts: “catch default closures observe body lexical bindings” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “array destructuring does not close after iterator value getter throws” → test/compliance/variable-lowering-boundaries.test.ts: “array destructuring closes after a value getter throws” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “array destructuring rejects primitive iterator result objects” → test/compliance/variable-lowering-boundaries.test.ts: “array destructuring accepts primitive iterator results” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “array destructuring retrieves iterator return once” → test/compliance/variable-lowering-boundaries.test.ts: “array destructuring retrieves iterator return twice” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “destructuring assignments in parameter defaults isolate reentrant temporaries” → test/compliance/variable-lowering-boundaries.test.ts: “reentrant parameter defaults share generated destructuring temporaries” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “destructuring assignments in field initializers isolate reentrant temporaries” → test/compliance/variable-lowering-boundaries.test.ts: “reentrant field initializers share generated destructuring temporaries” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “later parameters read original arguments after earlier defaults mutate arguments” → test/compliance/variable-lowering-boundaries.test.ts: “default initializer mutations affect later positional reads” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “rest parameters read original arguments after defaults mutate arguments” → test/compliance/variable-lowering-boundaries.test.ts: “default initializer mutations affect the generated rest array” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “rest array creation bypasses inherited numeric setters” → test/compliance/variable-lowering-boundaries.test.ts: “rest array creation invokes inherited numeric setters” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “rest array creation bypasses inherited nonwritable numeric properties” → test/compliance/variable-lowering-boundaries.test.ts: “rest array creation observes inherited nonwritable numeric properties” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “computed class keys are coerced once before the next key expression” → test/compliance/class-lowering-boundaries.test.ts: “later key expressions run before earlier key coercion” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “derived constructor parameter closures observe the initialized receiver” → test/compliance/class-lowering-boundaries.test.ts: “derived parameter closure this binding”
- test/compliance/classes.test.ts: “duplicate super calls evaluate base then reject rebinding” → test/compliance/class-lowering-boundaries.test.ts: “duplicate super calls complete without a rebinding error” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “base field initializer new.target is undefined” → test/compliance/class-lowering-boundaries.test.ts: “base field new.target resolves to the constructor” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “base fields resolve outer names despite constructor parameters” → test/compliance/class-lowering-boundaries.test.ts: “base field preserves outer parameter binding”
- test/compliance/classes.test.ts: “computed class keys retain class strictness” → test/compliance/class-lowering-boundaries.test.ts: “computed class keys retain surrounding sloppy assignment behavior” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “class heritage retains class strictness” → test/compliance/class-lowering-boundaries.test.ts: “heritage expressions retain surrounding sloppy assignment behavior” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “computed super reads coerce keys before prototype lookup” → test/compliance/class-lowering-boundaries.test.ts: “super base selection precedes computed-key coercion” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “instance fields can read later private accessors” → test/compliance/class-lowering-boundaries.test.ts: “instance field reads later private accessor”
- test/compliance/classes.test.ts: “static fields can call later private methods” → test/compliance/class-lowering-boundaries.test.ts: “static field calls later private method”
- test/compliance/classes.test.ts: “static fields can read later private accessors” → test/compliance/class-lowering-boundaries.test.ts: “static field reads later private accessor”
- test/compliance/classes.test.ts: “private method compound assignment evaluates RHS and coercion before rejecting write” → test/compliance/class-lowering-boundaries.test.ts: “private method compound RHS coercion”
- test/compliance/classes.test.ts: “private calls retain callable across argument mutation” → test/compliance/class-lowering-boundaries.test.ts: “private callee is fetched before arguments”
- test/compliance/classes.test.ts: “private methods share function identity across instances” → test/compliance/class-lowering-boundaries.test.ts: “private methods share identity across instances”
- test/compliance/classes.test.ts: “private field assignment evaluates RHS before brand rejection” → test/compliance/class-lowering-boundaries.test.ts: “invalid loose-private writes reject before the right-hand side” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “private calls ignore overridden apply properties” → test/compliance/class-lowering-boundaries.test.ts: “private call own apply”
- test/compliance/classes.test.ts: “private calls reject non-callable objects with apply methods” → test/compliance/class-lowering-boundaries.test.ts: “private noncallable with apply”
- test/compliance/classes.test.ts: “private setter-only access throws on reads” → test/compliance/class-lowering-boundaries.test.ts: “setter-only private access reads undefined” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “derived method defaults retain super property access” → test/compliance/class-lowering-boundaries.test.ts: “method parameter default super property”
- test/compliance/classes.test.ts: “base class methods retain implicit super home object” → test/compliance/class-lowering-boundaries.test.ts: “implicit base class super property”
- test/compliance/classes.test.ts: “class methods cannot serve as Reflect.construct newTarget” → test/compliance/class-lowering-boundaries.test.ts: “lowered ordinary methods are accepted as a newTarget” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/classes.test.ts: “calling class constructors rejects before parameter defaults” → test/compliance/class-lowering-boundaries.test.ts: “constructor defaults execute before a plain-call error” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “strict spread methods use final object as home object” → test/compliance/object-helper-contract.test.ts: “spread method home object” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “strict spread prototype setter after spread” → test/compliance/object-helper-contract.test.ts: “spread late prototype setter” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “strict spread accessor halves merge across spread” → test/compliance/object-helper-contract.test.ts: “spread accessor halves” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async functions remain nonconstructable” → test/compliance/async-helper-contract.test.ts: “async function constructability” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async delegation captures next once” → test/compliance/async-helper-contract.test.ts: “async delegation repeated next lookup” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async delegation closes when throw method missing” → test/compliance/async-helper-contract.test.ts: “async delegation closes when throw method missing”
- test/compliance/async.test.ts: “await ignores overridden then on a native promise” → test/compliance/async-helper-contract.test.ts: “an own then override escapes the lowered async catch” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async delegation defers throw and return lookup” → test/compliance/async-helper-contract.test.ts: “async delegation defers throw and return lookup” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async delegation reads done once for yielded result” → test/compliance/async-helper-contract.test.ts: “async delegation reads done once for yielded result” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async delegation reads done once for completed result” → test/compliance/async-helper-contract.test.ts: “async delegation reads done once for completed result” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async generator methods reject invalid receivers through promises” → test/compliance/async-helper-contract.test.ts: “lowered async generator methods reject invalid receivers synchronously” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async generator methods reject objects spoofing invoke” → test/compliance/async-helper-contract.test.ts: “async generator public dispatch” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/async.test.ts: “async generator instances inherit from the function prototype” → test/compliance/async-helper-contract.test.ts: “async generator prototype representation” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/regexp.test.ts: “named replacement expansion preserves a following decimal digit” → test/compliance/regexp-helper-contract.test.ts: “named replacement followed by a decimal digit” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/regexp.test.ts: “named replacement expansion respects escaped dollar signs” → test/compliance/regexp-helper-contract.test.ts: “named replacement with an escaped dollar” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/regexp.test.ts: “named capture replacement calls ignore own apply properties” → test/compliance/regexp-helper-contract.test.ts: “named replacement callback own apply” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/regexp.test.ts: “named string replacement uses groups returned by custom exec” → test/compliance/regexp-helper-contract.test.ts: “custom exec replaces named groups” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/regexp.test.ts: “named string replacement respects absent groups from custom exec” → test/compliance/regexp-helper-contract.test.ts: “custom exec omits named groups” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/regexp.test.ts: “RegExp function preserves named regexp identity without flags” → test/compliance/regexp-helper-contract.test.ts: “native RegExp call copies wrapped pattern” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/regexp.test.ts: “named replacement callbacks omit groups when custom exec omits them” → test/compliance/regexp-helper-contract.test.ts: “custom exec callback receives synthesized groups” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “exponentiation preserves dynamic BigInt operands” → test/compliance/operator-boundaries.test.ts: “dynamic BigInt exponentiation uses Math.pow behavior” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “exponentiation converts boxed BigInts” → test/compliance/operator-boundaries.test.ts: “boxed BigInt exponentiation throws during Math.pow coercion” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “exponentiation does not resolve shadowed Math” → test/compliance/operator-boundaries.test.ts: “exponentiation uses lexical Math lookup” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “optional method calls ignore overridden call properties” → test/compliance/operator-boundaries.test.ts: “strict optional method call uses own call dispatch” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “optional method calls reject noncallables with call properties” → test/compliance/operator-boundaries.test.ts: “strict optional call uses noncallable call-property behavior” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “object rest uses a single ownKeys snapshot with excluded key” → test/compliance/object-helper-contract.test.ts: “rest single ownKeys snapshot” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/regexp.test.ts: “regexp constructor cloning preserves named capture groups” → test/compliance/regexp-helper-contract.test.ts: “native constructor loses named group metadata” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “object rest preserves an own **proto** data property without changing its prototype” → test/compliance/object-helper-contract.test.ts: “rest own proto data property” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “strict spread honors proxy key order across symbols” → test/compliance/object-helper-contract.test.ts: “spread proxy key order” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “strict spread rechecks descriptors after preceding getters” → test/compliance/object-helper-contract.test.ts: “spread descriptor changes during getters” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/operators.test.ts: “exponentiation accepts object conversions yielding BigInts” → test/compliance/operator-boundaries.test.ts: “BigInt-producing object exponentiation throws during Math.pow coercion” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “object rest rechecks enumerability after earlier getter with excluded key” → test/compliance/object-helper-contract.test.ts: “rest descriptor changes during getters” (retires former desired-spec failure; successor asserts adopted current behavior)
- test/compliance/variables.test.ts: “array rest ignores species” → test/compliance/array-rest-copy.test.ts: “whole array rest reuses its fresh conversion with inline helpers” (same destructuring path; a throwing species getter replaces the recorded-event sentinel).
- test/compliance/variables.test.ts: “object rest uses a single ownKeys snapshot” → test/compliance/object-rest-copy.test.ts: inline helpers, assignment=false (same strict object rest transform; asserts one keys event).
- test/compliance/variables.test.ts: “object rest excludes symbols added during copying” → test/compliance/object-rest-copy.test.ts: inline helpers, assignment=false (asserts absence of symbol introduced by first getter).
- test/compliance/variables.test.ts: “object rest rechecks enumerability after earlier getter” → test/compliance/object-rest-copy.test.ts: inline helpers, assignment=false (asserts absence of b after first getter makes it nonenumerable).
- test/compliance/variables.test.ts: “leading parameters remain unmapped when a later parameter has a default” → “simple parameters before a default remain unmapped from arguments” (transferred immediate arguments[0] observation before overwriting it; now verifies both assignment directions independently).
- test/compliance/variables.test.ts: “object rest rejects callable results from Symbol.toPrimitive” → “object-rest computed keys accept callable Symbol.toPrimitive results” (retires former desired-spec failure; explicit current adopted helper behavior).
- test/compliance/optimization.test.ts: “folding a leading string expression does not create strict directive” → “folding does not create a strict directive” (identical parsed input, folding options, execution context and expected false).
- test/compliance/number-string.test.ts: “number-to-string folding: positive / folding uses JavaScript number formatting” → test/compliance/optimizer-contexts.test.ts: “numeric string formatting and exponentiation exceptional values compose with comparisons”, positive decimal formatting row. Same literal expression and constantFolding option; transferred no-addition output guard into the surviving numerical matrix.
- test/compliance/number-string.test.ts: “number-to-string folding: negative / folding uses JavaScript number formatting” → the same surviving numerical matrix, negative decimal formatting row; same expression/options and transferred output guard.
- test/compliance/rest-helper-fallback.test.ts: the two “pristine control preserves computed-key order, rest, and spread” tests are retired reference-only executions; all 56 transformed format/configuration/version paths retain explicit expected values, and the runtime-package version assertion now has one independent test.
- test/compliance/regexp.test.ts: “lowered Unicode regexps advance empty matchAll results by code point” → test/compliance/regexp-runtime-boundaries.test.ts: “empty matchAll advances by UTF-16 unit after Unicode lowering” (same regexp/options/input category; successor asserts adopted current behavior and syntax absence)
- test/compliance/regexp.test.ts: “lowered Unicode regexps preserve exec starting inside a surrogate pair” → test/compliance/regexp-runtime-boundaries.test.ts: “exec from inside a surrogate pair misses after Unicode lowering” (same regexp/options/input category; successor asserts adopted current behavior and syntax absence)
- test/compliance/regexp.test.ts: “lowered Unicode ignore-case regexps preserve non-ASCII word boundaries” → test/compliance/regexp-runtime-boundaries.test.ts: “Unicode-only word characters lose boundary behavior” (same regexp/options/input category; successor asserts adopted current behavior and syntax absence)
- test/compliance/regexp.test.ts: “sticky literal ignores shadowed RegExp” → test/compliance/regexp-runtime-boundaries.test.ts: “sticky constructors resolve the lexical RegExp binding” (same regexp/options/input category; successor asserts adopted current behavior and syntax absence)
- test/compliance/regexp.test.ts: “named backreference before digit” → test/compliance/regexp-runtime-boundaries.test.ts: “named backreference adjacent to a digit preserves the token boundary” (same regexp/options/input category; successor asserts adopted current behavior and syntax absence)
- test/compliance/regexp.test.ts: “Unicode ignore-case backreferences fold Kelvin sign” → test/compliance/regexp-runtime-boundaries.test.ts: “Unicode-only folds are lost in backreferences” (same regexp/options/input category; successor asserts adopted current behavior and syntax absence)
- test/compliance/regexp.test.ts: “Unicode ignore-case backreferences fold long s” → test/compliance/regexp-runtime-boundaries.test.ts: “Unicode-only folds are lost in backreferences” (same regexp/options/input category; successor asserts adopted current behavior and syntax absence)
- test/compliance/optimization.test.ts: “typeof retains a conditional unresolved-reference error” → test/compliance/optimizer-contexts.test.ts: “conditional value contexts / typeof missing binding” (same constantFolding options and ConstantFolder::value selected-operand branch; explicit runtime observations retained)
- test/compliance/optimization.test.ts: “folded eval callee stays indirect” → test/compliance/optimizer-contexts.test.ts: “conditional value contexts / indirect eval” (same constantFolding options and ConstantFolder::value selected-operand branch; explicit runtime observations retained)
- test/compliance/optimization.test.ts: “conditional callee remains unbound” → test/compliance/optimizer-contexts.test.ts: “conditional value contexts / ordinary call” (same constantFolding options and ConstantFolder::value selected-operand branch; explicit runtime observations retained)
- test/compliance/optimization.test.ts: “logical callee remains unbound” → test/compliance/optimizer-contexts.test.ts: “or value contexts / ordinary call” (same constantFolding options and ConstantFolder::value selected-operand branch; explicit runtime observations retained)
- test/compliance/optimization.test.ts: “delete conditional does not delete selected property” → test/compliance/optimizer-contexts.test.ts: “conditional value contexts / delete” (same constantFolding options and ConstantFolder::value selected-operand branch; explicit runtime observations retained)
- test/compliance/optimization.test.ts: “folded anonymous function stays unnamed” → test/compliance/optimizer-contexts.test.ts: “conditional value contexts / anonymous function name” (same constantFolding options and ConstantFolder::value selected-operand branch; explicit runtime observations retained)
- test/compliance/optimization.test.ts: “folding a conditional tag preserves value invocation” → test/compliance/optimizer-contexts.test.ts: “conditional value contexts / tag” (same constantFolding options and ConstantFolder::value selected-operand branch; explicit runtime observations retained)
- test/compliance/optimization.test.ts: “folding a conditional optional call preserves value invocation” → test/compliance/optimizer-contexts.test.ts: “conditional value contexts / optional call” (same constantFolding options and ConstantFolder::value selected-operand branch; explicit runtime observations retained)

</details>
