# Hermes parser update coverage matrix

This is the step-2 inventory for baseline
`73855a1475e016cec814d67578f860112ef711e1` and candidate
`17b37301da5da4a2cd55d78f9697c46c0fd96123`. The embedded checkout remains pinned
throughout validation. The baseline is extracted with `git archive` into `target/`;
the other Hermes worktree is never touched.

## Scope and evidence

Inventory reviewed the complete endpoint diff of `lib/Parser`,
`include/hermes/Parser`, AST definitions/keywords, changed `test/Parser` fixtures,
`unittests/AST/JSONTest.cpp`, and changed JavaScript parser tests, then traced
individual functions to the originating commits and cross-checked the
[parser changelog][changelog]. The stable and `static_h` histories contain
separately imported/grafted commits: a raw `old..new` history includes shared old
features. Endpoint source/test diffs determine the delta; history supplies
provenance, rather than treating every historical commit as new syntax.

All source cases use Flow `all`, JSX enabled, component/match/record grammar
enabled, and CommonJS-compatible parsing, matching the native shim and upstream
WASM entry point. JavaScript references explicitly use `sourceType: 'module'`,
`babel: false` for acceptance, and `babel: true` with enum transforms enabled for
structural comparison. Tests disable project Babel configuration. Babel strips
annotations directly from Hermes' AST; it does not reparse Flow syntax.

`cases.json` is the executable matrix: each named row contains the complete
source, expected native outcome, exact erasure text, public exception/boundary
where applicable, classification, provenance key, and 0.36.0 acceptance.
`native-observations.json` records both native outcomes, exact emitted code for
successes, input SHA-256, and both revision identities. The table below joins
those files. It is not a list of the 101 application fallback files.

The assertion names for **every** row `id` are:

- Native: `crates/hermes-flow/tests/erasure.rs::parser_update_inventory` (assertion
  messages include `id`); direct output text, or the specific bailout kind.
- Public: `test/transforms/flow/parser-update.test.ts::native public path: id`;
  no parser adapter is registered. It checks direct native output, successful
  downstream Oxc/public compilation, or a pristine-input controlled boundary.
- Canonical: `test/alignment/flow/parser-update.test.ts::hermes-parser 0.36.0
parses id` and `Hermes 17b373... parses id`. Supported rows also run `aligns id`
  through `alignHermesFlowTransform` against **both** references. Parser-rejected syntax
  has no transformed-output comparison; rejection is compared directly instead.
  Raw invalid regexp patterns additionally have a structural identity comparison,
  since neither parser validates their pattern grammar.
  The downstream-invalid resource `for…in` row likewise has no structural
  transform comparison. Intentional native boundaries use
  `expectBabelSupportedNoxcturnalBailout` with the exact Hermes parser override.

For erased declarations, runtime and per-token map assertions are inapplicable:
the entire declaration is deleted. Value-level fields have both the native text
assertions and the executed comparisons below. Rejected inputs and compatibility
bailouts have no emitted-JavaScript map. Unchanged value identifiers/JSX/regex
have identity assertions; the new Unicode identifier has explicit erased output
and downstream Oxc acceptance.

## Complete native parser delta ledger

| Change / provenance                                                                                                            | Upstream fixtures and local rows                                                                                                                                                                                | Disposition                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [Readonly variance][readonly-commit]                                                                                           | [readonly-variance.js][readonly-test], [readonly-variance-error.js][readonly-error]; `readonly-*`, application examples                                                                                         | Supported property/indexer/tuple/class erasure; method variance rejected                                                                     |
| [Reserved-word variance lookahead][reserved-commit]                                                                            | Same readonly fixture, optional `default` also in [TypeAnnotations-test.js][annotations-js]; `*-reserved-*`, `readonly-default-optional`                                                                        | Supported; contextual names remain names                                                                                                     |
| [Writeonly variance][writeonly-commit]                                                                                         | [writeonly-variance.js][writeonly-test], [writeonly-variance-error.js][writeonly-error]; `writeonly-*`                                                                                                          | Supported erasure; method variance rejected                                                                                                  |
| [`in` names][in-name-commit], [`in` variance][in-commit], [`out` variance][out-commit], [extra upstream cases][variance-extra] | [in-type-param-name.js][in-name-test], [in-type-param-name-error.js][in-name-error], [in-variance.js][in-test], [out-variance.js][out-test]; `in-*`, `out-*`, `mixed-variance-function`, `invalid-type-param-*` | Supported erasure and ambiguity handling; invalid names rejected                                                                             |
| [Resource-loop declarators][using-commit]                                                                                      | [for-using.js][using-test], [for-using-declarator.js][using-declarator]; `using-*`, `await-using-*`                                                                                                             | Correct AST wrapper; `for…in` remains an Oxc compatibility boundary; `for…of` works                                                          |
| [Async component await][async-commit]                                                                                          | [async-component.js][async-test], [ComponentDeclaration-test.js][component-js]; `async-component-*`, `sync-component-await-invalid`                                                                             | Parser fix verified; async component lowering remains intentionally unsupported                                                              |
| [Bad binding return][match-binding-commit]                                                                                     | [pattern-binding-error.js][match-binding-test]; `match-binding-invalid`                                                                                                                                         | Controlled ParseFailed                                                                                                                       |
| [Bad object pattern return][match-object-commit]                                                                               | [pattern-object-binding-error.js][match-object-binding-test], [pattern-object-value-error.js][match-object-value-test]; corresponding `match-object-*-invalid`                                                  | Controlled ParseFailed                                                                                                                       |
| [Match statement body check][match-statement-commit]                                                                           | [statement-non-block-body-error.js][match-statement-test]; `match-statement-body-invalid`                                                                                                                       | Controlled ParseFailed                                                                                                                       |
| [JSX attribute member rejection][jsx-commit]                                                                                   | [jsx-error-attr-member.js][jsx-test]; `jsx-attribute-member-invalid`, `jsx-member-tag`                                                                                                                          | Bad attributes rejected; member tags still supported downstream                                                                              |
| [Lexer unreachable return removal][lexer-commit]                                                                               | `directive-lexer`; all upstream Parser tests                                                                                                                                                                    | No grammar or observable lexer change; directive/template bytes remain identical                                                             |
| [Compiler JSON depth limit][json-commit]                                                                                       | [JSONParserTest.DeepNestingTest][json-test]                                                                                                                                                                     | No Flow source row: the shim uses JSParser, never the compiler JSONParser. Upstream unit test executes and checks controlled depth rejection |

`JSParserImpl.h` gains the common variance lookahead and moves readonly from the
TS-only identifier block to Flow-or-TS; these are covered by the variance rows.
`Keywords.def` adds the matching keyword strings. No `ESTree.def`, public
`JSParser.h`, or native serializer schema changes occur. The [cleanup refactor][cleanup]
is already reflected in the baseline endpoint, so contributes no additional
source delta. The [Rust FFI option export][ffi] changes another consumer's API,
not this shim; native and WASM proposal grammar flags are explicitly enabled.

Changed upstream JS tests add the same readonly cases in
[ClassProperty-test.js][class-js] and [TypeAnnotations-test.js][annotations-js]
and decorator location checks in [Locations-test.js][locations-js]. The latter
maps to `decorator-property-and-method`, an existing intentional native boundary.
[Hook][hook-js]/component printer round-trip assertions and [opaque-bound][opaque-js] printing change
JavaScript printers, not native acceptance. [RecordDeclaration][record-declaration-js], [RecordExpression][record-expression-js],
[MatchExpression][match-expression-js], [MatchStatement][match-statement-js], and
[SimpleTransform][simple-transform-js] test changes replace
[Flow utility annotations][utility-commit] in test helpers; they add no native syntax delta.
The printer assertions originate in the [Prettier update][printer-commit]; decorator
locations and private/public property visitor keys originate in the
[decorator key fix][decorator-commit]. The native shim traverses its own generated
ESTree schema, whose decorator fields were already present. Existing
family anchors below cover those syntax families. No upstream tests were removed.

## Linked Unicode and regex syntax effects

[Unicode 17 tables][unicode-commit] add identifier characters; `unicode17-identifier`
uses U+1E6C0, rejects at baseline, erases at candidate, and passes Oxc and both
JavaScript reference comparisons. [Script extension search][script-search],
[range pooling][range-pool], [range fixes][range-fix], [further range fixes][range-fix2],
and [pool cleanup][range-cleanup] affect character sets. Upstream
`PlatformUnicodeTests` (6 tests) passed; unchanged regex Unicode escapes and
case-folding are additionally exercised by upstream regex runtime tests.

[Regex modifier parsing][regex-commit], [flag propagation][regex-flags],
[flag state refactor][regex-state], [word boundaries][regex-word], and
[negative properties][regex-negative] change the linked regex engine. The native
JSParser/WASM parser treats a regexp literal as a raw pattern and does **not**
validate its modifier flags. Consequently `regex-modifiers-invalid` is retained
verbatim by baseline, candidate, both JS references, and the no-op public pipeline;
this is recorded as invalid syntax with deferred regexp validation, not claimed as
supported syntax or a newly accepted JavaScript grammar change. The actual
`RegexParser` rejection is asserted by upstream
[test/hermes/regexp-modifiers-group.js][regex-test] (`new RegExp('(?ii:)')`) through
the upstream runtime test workflow. The valid `regex-modifiers` row proves raw
literal preservation and downstream Oxc parseability. Support-library Regex/RegExp
unit tests (8 tests) also passed. The upstream regexp runtime selection passed
20 tests; its one unsupported test is `test/jit/regexp.js`, which requires the
JIT disabled in this build. Native Flow erasure does not execute regexes.

## Source cases

`A` = accepted by the parser, `R` = rejected. Native outcomes are explicit.
`E` = supported erasure/lowering, `I` = invalid syntax, `B` = intentional
compatibility boundary. `D` = direct acceptance/rejection comparison only;
`S` = acceptance plus structural transformation alignment. The exact reference
column is acceptance asserted against the source-built candidate (not 0.37.0).
Every row also has native/public assertions as named above.

| Case / variant                    | Provenance                                                              | Baseline | Candidate native outcome | Hermes 0.36.0 | Exact reference | Canonical assertion | Class |
| --------------------------------- | ----------------------------------------------------------------------- | -------- | ------------------------ | ------------- | --------------- | ------------------- | ----- |
| `scroll-view-interface`           | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `packager-asset`                  | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `virtual-collection`              | [out][out-provenance]                                                   | R        | `erased`                 | A             | A               | S                   | E     |
| `dom-exception`                   | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-property`               | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-string-key`             | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-numeric-key`            | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-indexer`                | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-named-indexer`          | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-reserved-with`          | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-reserved-enum`          | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-reserved-default`       | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-reserved-new`           | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-tuple`                  | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-initialized`            | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-private`                | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-property-name`          | [readonly][readonly-provenance]                                         | A        | `erased`                 | A             | A               | S                   | E     |
| `readonly-method-name`            | [readonly][readonly-provenance]                                         | A        | `erased`                 | A             | A               | S                   | E     |
| `readonly-invalid-object-method`  | [readonly][readonly-provenance]                                         | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `readonly-invalid-class-method`   | [readonly][readonly-provenance]                                         | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `writeonly-property`              | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-string-key`            | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-numeric-key`           | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-indexer`               | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-named-indexer`         | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-reserved-with`         | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-reserved-enum`         | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-reserved-default`      | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-reserved-new`          | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-tuple`                 | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-initialized`           | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-private`               | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-property-name`         | [writeonly][writeonly-provenance]                                       | A        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-method-name`           | [writeonly][writeonly-provenance]                                       | A        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-invalid-object-method` | [writeonly][writeonly-provenance]                                       | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `writeonly-invalid-class-method`  | [writeonly][writeonly-provenance]                                       | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `in-variance`                     | [in][in-provenance]                                                     | R        | `erased`                 | A             | A               | S                   | E     |
| `in-mixed`                        | [in][in-provenance]                                                     | R        | `erased`                 | A             | A               | S                   | E     |
| `in-same-name`                    | [in][in-provenance]                                                     | R        | `erased`                 | A             | A               | S                   | E     |
| `in-name`                         | [in][in-provenance]                                                     | R        | `erased`                 | A             | A               | S                   | E     |
| `in-name-colon`                   | [in][in-provenance]                                                     | R        | `erased`                 | A             | A               | S                   | E     |
| `in-name-extends`                 | [in][in-provenance]                                                     | R        | `erased`                 | A             | A               | S                   | E     |
| `in-name-default`                 | [in][in-provenance]                                                     | R        | `erased`                 | A             | A               | S                   | E     |
| `out-variance`                    | [out][out-provenance]                                                   | R        | `erased`                 | A             | A               | S                   | E     |
| `out-mixed`                       | [out][out-provenance]                                                   | R        | `erased`                 | A             | A               | S                   | E     |
| `out-same-name`                   | [out][out-provenance]                                                   | R        | `erased`                 | A             | A               | S                   | E     |
| `out-name`                        | [out][out-provenance]                                                   | A        | `erased`                 | A             | A               | S                   | E     |
| `out-name-colon`                  | [out][out-provenance]                                                   | A        | `erased`                 | A             | A               | S                   | E     |
| `out-name-extends`                | [out][out-provenance]                                                   | A        | `erased`                 | A             | A               | S                   | E     |
| `out-name-default`                | [out][out-provenance]                                                   | A        | `erased`                 | A             | A               | S                   | E     |
| `mixed-variance-function`         | [out][out-provenance]                                                   | R        | `erased`                 | A             | A               | S                   | E     |
| `in-out-names`                    | [in][in-provenance]                                                     | R        | `erased`                 | A             | A               | S                   | E     |
| `out-in-name`                     | [out][out-provenance]                                                   | R        | `erased`                 | A             | A               | S                   | E     |
| `value-keywords`                  | [readonly][readonly-provenance]                                         | A        | `erased`                 | A             | A               | S                   | E     |
| `invalid-type-param-0`            | [in][in-provenance]                                                     | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `invalid-type-param-return`       | [in][in-provenance]                                                     | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `invalid-type-param-class`        | [in][in-provenance]                                                     | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `invalid-type-param-void`         | [in][in-provenance]                                                     | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `invalid-type-param-const`        | [in][in-provenance]                                                     | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `async-component-await`           | [async-component][async-component-provenance]                           | R        | `Proposal`               | R             | A               | D                   | B     |
| `async-component-nested`          | [async-component][async-component-provenance]                           | R        | `Proposal`               | R             | A               | D                   | B     |
| `sync-component-await-invalid`    | [async-component][async-component-provenance]                           | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `match-binding-invalid`           | [match-binding-invalid][match-binding-invalid-provenance]               | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `match-object-binding-invalid`    | [match-object-binding-invalid][match-object-binding-invalid-provenance] | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `match-object-value-invalid`      | [match-object-value-invalid][match-object-value-invalid-provenance]     | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `match-statement-body-invalid`    | [match-statement-body-invalid][match-statement-body-invalid-provenance] | R        | `ParseFailed`            | R             | R               | D                   | I     |
| `jsx-attribute-member-invalid`    | [jsx][jsx-provenance]                                                   | A        | `ParseFailed`            | A             | R               | D                   | I     |
| `jsx-member-tag`                  | [jsx][jsx-provenance]                                                   | A        | `erased`                 | A             | A               | S                   | E     |
| `using-of`                        | [using][using-provenance]                                               | A        | `erased`                 | A             | A               | S                   | E     |
| `using-in`                        | [using][using-provenance]                                               | A        | `erased`                 | A             | A               | D                   | I     |
| `await-using-of`                  | [using][using-provenance]                                               | A        | `erased`                 | A             | A               | S                   | E     |
| `await-using-await-of`            | [using][using-provenance]                                               | A        | `erased`                 | A             | A               | S                   | E     |
| `directive-lexer`                 | [lexer][lexer-provenance]                                               | A        | `erased`                 | A             | A               | S                   | E     |
| `regex-modifiers`                 | [regex][regex-provenance]                                               | A        | `erased`                 | A             | A               | S                   | E     |
| `regex-modifiers-invalid`         | [regex][regex-provenance]                                               | A        | `erased`                 | A             | A               | S                   | I     |
| `unicode17-identifier`            | [unicode][unicode-provenance]                                           | A        | `erased`                 | A             | A               | S                   | E     |
| `readonly-default-optional`       | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `readonly-uninitialized`          | [readonly][readonly-provenance]                                         | R        | `erased`                 | A             | A               | S                   | E     |
| `writeonly-uninitialized`         | [writeonly][writeonly-provenance]                                       | R        | `erased`                 | A             | A               | S                   | E     |
| `out-mixed-name`                  | [out][out-provenance]                                                   | A        | `erased`                 | A             | A               | S                   | E     |
| `in-out-mixed`                    | [out][out-provenance]                                                   | R        | `erased`                 | A             | A               | S                   | E     |
| `decorator-property-and-method`   | [decorators][decorators-provenance]                                     | A        | `UnhandledSyntax`        | A             | A               | D                   | B     |

## Existing Flow-family anchors (retained)

These are the pre-existing executable anchors, not additional newly implemented
syntax. The native column names functions in `crates/hermes-flow/tests/erasure.rs`.
Canonical paths are under `test/alignment/flow/`, public paths under
`test/transforms/flow/`, and executed tests under `test/compliance/flow.test.ts`.

| Family                                                                                                                                         | Native anchors                                                                                                                                                                    | Public / canonical anchors                                                                                                                                                                                                                                                                                                                             | Observable contract                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Type/opaque/interface/declare forms                                                                                                            | `erases_type_declarations_whole`                                                                                                                                                  | `type-stripping.test.ts` (“opaque and exported types”, “interfaces and generics”, “declare module”)                                                                                                                                                                                                                                                    | Whole-declaration deletion, structural output                                                                 |
| Type-expression families (primitive/literal/nullable, union/intersection, object/exact/indexer, tuple/array, generic/utility/typeof/key types) | `erases_type_declarations_whole`, `erases_annotations_on_bindings`, `erases_function_type_syntax`                                                                                 | public `type-stripping-fixtures.test.ts` named “strip type annotations”, “strip tuples”, “strip string literal types”, “strip qualified generic type”; canonical `type-stripping.test.ts` named “union and intersection aliases”, “variance and exact objects”, “tuple and array annotations”, “typeof and key types”, “nullable and optional members” | Whole-type deletion; existing tested variants retained                                                        |
| Binding/function annotations, patterns, defaults, optional/this parameters                                                                     | `erases_annotations_on_bindings`, `erases_the_optional_marker`, `erases_a_this_parameter`, `keeps_defaults_on_typed_parameters`, `erases_function_type_syntax`                    | `type-stripping.test.ts`, including “aligns optional and defaulted parameters with Babel”                                                                                                                                                                                                                                                              | Exact erasure and defaults retained                                                                           |
| Class headers/members/private fields                                                                                                           | `erases_class_type_syntax`                                                                                                                                                        | public `type-stripping.test.ts` (“removes type-only class fields…”, “preserves value-less private fields…”); canonical “typed class members”                                                                                                                                                                                                           | Runtime field identity, exact output, descriptors/initialization in new compliance tests                      |
| Calls/new/optional calls/JSX attachments                                                                                                       | `erases_call_and_jsx_type_arguments`                                                                                                                                              | public `type-stripping-fixtures.test.ts`; canonical “aligns Flow annotations while preserving JSX”                                                                                                                                                                                                                                                     | Type arguments removed while preserving JSX/value syntax                                                      |
| Imports/exports                                                                                                                                | `erases_type_only_imports_and_exports`, `keeps_side_effect_imports`                                                                                                               | public `type-stripping-fixtures.test.ts`; canonical “aligns type-only imports and exports with Babel”                                                                                                                                                                                                                                                  | Type-only dependency removal, side effects retained                                                           |
| Casts and parenthesized values                                                                                                                 | `erases_casts_but_keeps_the_value`, `keeps_the_parentheses_around_a_cast_value`, `does_not_find_as_inside_an_identifier`                                                          | public `type-stripping-fixtures.test.ts`; canonical “casts”                                                                                                                                                                                                                                                                                            | Value/parens survive; keyword boundaries                                                                      |
| Enums                                                                                                                                          | `transforms_enum_declarations`                                                                                                                                                    | `enums.test.ts` (mirrored, initialized string/number, symbol)                                                                                                                                                                                                                                                                                          | Structural lowering and executed representations                                                              |
| Components                                                                                                                                     | `transforms_component_declarations`, `transforms_component_ref_parameters`                                                                                                        | `components.test.ts` (parameters, refs, renders, interacting proposals)                                                                                                                                                                                                                                                                                | Structural lowering, executed renamed/default/rest props; forward-reference bailout retained                  |
| Hooks                                                                                                                                          | `transforms_hook_declarations`                                                                                                                                                    | `hooks.test.ts` (plain, defaults/rest, generics)                                                                                                                                                                                                                                                                                                       | Structural lowering and executed call behavior                                                                |
| Match                                                                                                                                          | `transforms_match_expressions`, `transforms_match_statements`, `transforms_match_patterns`, `rejects_match_syntax_no_transform_compiles`, `rejects_a_yield_it_would_have_to_wrap` | `match.test.ts`; compliance “Flow match…” and “non-exhaustive Flow match…”                                                                                                                                                                                                                                                                             | Structural lowering, evaluation count, bindings/control flow, throws/rejections; malformed cases now explicit |
| Records                                                                                                                                        | `bails_on_untransformed_proposals`                                                                                                                                                | canonical `boundaries.test.ts::records the Flow record fallback against Hermes`                                                                                                                                                                                                                                                                        | Intentional bailout, not implemented support                                                                  |
| Decorators                                                                                                                                     | `bails_on_decorators`                                                                                                                                                             | canonical `boundaries.test.ts::records the decorated Flow class fallback against Hermes`; new location-shaped matrix row                                                                                                                                                                                                                               | Intentional bailout, not implemented support                                                                  |
| Formatting/comments and maps                                                                                                                   | `preserves_formatting_around_what_it_removes`; new `readonly_spans_preserve_comments_and_utf8`                                                                                    | new public “readonly deletion maps retain UTF-16 positions…”                                                                                                                                                                                                                                                                                           | Exact comments/UTF-8 spans and byte offsets, character-mode UTF-16 deletion-map positions                     |

The full native/public/alignment suites remain intact; no existing expectation was
weakened and no test was deleted. These anchors describe tested scope, not a claim
that every possible Flow combination or proposal lowers natively.

## Runtime and reference limitations

- `Flow readonly and writeonly fields retain initialization, descriptors, and
writable values` executes static/instance initializers, absence of type-only
  fields, contextual names, writability, enumerability, and configurability.
  The alignment case “Hermes 0.36.0 and native variance fields execute with
  equivalent initialization and descriptors” executes both outputs independently.
- Resource-loop AST wrapper assertions run against both Hermes references.
  Synchronous disposal is also compared against Hermes 0.36.0 plus Babel's
  resource transform. Native async disposal is executed by “Flow resource-loop
  heads preserve asynchronous disposal through Oxc lowering”. Babel 7.29.7's
  explicit-resource-management plugin lowers `for (await using …)` via its sync
  helper, so it is not a valid execution oracle for those async cases. The
  unlowered canonical Hermes structure still aligns for both async-loop forms;
  native execution explicitly checks awaited disposal ordering. No assertion is
  made to agree with that separate Babel lowering bug.
- Async components parse with the candidate, but remain native `Proposal`
  bailouts. Both async rows are reference-version mismatches in 0.36.0 and are
  resolved with candidate acceptance and canonical-transform-supported bailout
  assertions against the exact reference. They are not implemented support.
- JSX member attributes are rejected by the candidate but accepted by 0.36.0.
  The exact reference resolves this rejection mismatch. Valid member tag names
  still pass native/public/canonical paths. Diagnostic wording is not compared.
- `using-in` is accepted by Hermes but rejected downstream: the public Flow path
  returns `flow-erasure-unsupported-syntax` with pristine source. That controlled
  boundary remains; no new lowering or runtime promise is made for invalid loops.

## Reproduction and validation

Use the repository's pinned development shell. No package pins change:
`hermes-parser` and `babel-plugin-syntax-hermes-parser` remain exactly 0.36.0.
A published 0.37.0 was inspected temporarily, but still accepted the invalid JSX
attribute; it was removed and is not used as an oracle. The exact-source build
uses the pinned candidate's CMake WASM target, JS sources, checked-in visitor
keys, and its C-preprocessor deserializer template. The build uses the existing
Babel/Hermes plugin to strip Flow and esbuild only to convert modules to CommonJS;
no parser grammar is patched. Emscripten is obtained from the repository's locked
Nixpkgs input (6.0.2-git here). Initialization awaits its WASM factory once before
exposing Hermes' synchronous API. Build identity is written under `target/`.

```sh
nix develop --command node scripts/check-hermes-update-baseline.mjs
nix develop --command nix shell --inputs-from . nixpkgs#emscripten --command node scripts/build-hermes-update-reference.mjs
nix develop --command cargo test -p hermes-flow --features parser
nix develop --command pnpm build:native
HERMES_UPDATE_REFERENCE=target/hermes-update-reference nix develop --command pnpm test test/transforms/flow test/alignment/flow test/compliance/flow.test.ts
nix develop --command cmake -S crates/hermes-parser-sys/hermes -B target/hermes-host -DHERMES_TEST_EXTRA_ARGS=--filter=Parser/
nix develop --command cmake --build target/hermes-host --target check-hermes -j 8
nix develop --command cmake -S crates/hermes-parser-sys/hermes -B target/hermes-host -DHERMES_TEST_EXTRA_ARGS=--filter=regexp
nix develop --command cmake --build target/hermes-host --target check-hermes -j 8
nix develop --command cmake --build target/hermes-host --target HermesASTTests HermesSupportTests PlatformUnicodeTests -j 8
nix develop --command target/hermes-host/unittests/AST/HermesASTTests --gtest_filter=JSONParserTest.DeepNestingTest
nix develop --command target/hermes-host/unittests/Support/HermesSupportTests --gtest_filter=Regex.*:RegExp.*
nix develop --command target/hermes-host/unittests/PlatformUnicode/PlatformUnicodeTests
```

Unset `HERMES_SOURCE_DIR` before final candidate validation if it is set in your
shell. The baseline script deliberately uses overrides only for its two isolated
probe builds. `--record` rewrites the observations after a reviewed corpus change;
normal execution verifies them, and compares candidate outcomes with `cases.json`.
Upstream tests use Hermes' documented CMake `check-hermes`/lit workflow. The source
build and probes are supplemental audit commands; normal `pnpm check` keeps the
pinned 0.36.0 suite and does not require an Emscripten installation.

Coverage: **82/82 source cases** have executable native and public assertions.
**62 supported**, **3 intentional boundaries**, **17 invalid syntax**. There are
**3 resolved pinned-reference acceptance mismatches**, **0 unresolved reference
mismatches**, **0 unclassified source changes**, and **0 open parser-update
erasure gaps**. The compiler JSON entry point is specifically inapplicable to
Flow source, with a passing upstream depth regression instead. The no-op lexer,
Rust FFI consumer, and shared cleanup changes are classified in the ledger.
Existing async-component, record, decorator, and downstream boundaries prevent
any claim of unrestricted Flow support.

Final Darwin ARM64 validation passed: 49 parser-enabled native crate tests,
82/82 baseline/candidate probe comparisons, 502 public/compliance/alignment tests
with the exact reference enabled, 460 upstream parser tests, 20 upstream regexp
tests (one JIT-only test unsupported), the JSON depth regression, 8 Regex/RegExp
unit tests, and 6 Unicode unit tests. `pnpm format` and the complete `pnpm check`
also passed (10,730 JavaScript tests and 140 root Rust tests). Generated files and
JavaScript reference package pins are unchanged. Release-target and performance
validation remain step 5 work.

[readonly-commit]: https://github.com/facebook/hermes/commit/d235b337de9ae1ce0638625d6f8f0e42cfbcb506
[reserved-commit]: https://github.com/facebook/hermes/commit/61ac7fccaec282df9b8fd78b6113ce59c4f2db74
[writeonly-commit]: https://github.com/facebook/hermes/commit/9d354f057a7158a1bc2acd64310021a89c70dd4a
[in-name-commit]: https://github.com/facebook/hermes/commit/1f8594a39320d034369c30634ec09bc1e63353c1
[in-commit]: https://github.com/facebook/hermes/commit/183dcc2107635526f80aac50ed7727f581d0bba8
[out-commit]: https://github.com/facebook/hermes/commit/932b4ead469311eb7f300500db85e81716cdc136
[variance-extra]: https://github.com/facebook/hermes/commit/a0e0b756d2470ee77035fdba61186f254de9d796
[using-commit]: https://github.com/facebook/hermes/commit/e10405ef9d5cdb1d23c31a6ce38c059101e479c5
[async-commit]: https://github.com/facebook/hermes/commit/fdabd611d2f176d009cee560f7a6c78a1d3d52e6
[match-binding-commit]: https://github.com/facebook/hermes/commit/8d786acbe3ae5821de91c926f9aab864b49d1b6f
[match-object-commit]: https://github.com/facebook/hermes/commit/ca6de21ceeedf8cbd40ce865b7c9dd74eb1cd4b8
[match-statement-commit]: https://github.com/facebook/hermes/commit/0964b8d567518168c0750758d83598811e4a8b7d
[jsx-commit]: https://github.com/facebook/hermes/commit/91f1222dde60c14c9885422aca39dc7bebee71c8
[lexer-commit]: https://github.com/facebook/hermes/commit/8ec174452fb30fbf776eaa218f5c7b4c2d5e554d
[json-commit]: https://github.com/facebook/hermes/commit/304c1533c7bf8dfae98e910b6a027900050474c8
[cleanup]: https://github.com/facebook/hermes/commit/f1548afcd41dd1a66119bce6dff262003d2a0775
[ffi]: https://github.com/facebook/hermes/commit/4ae3430ebdcbea64bef826d57bd9a9f215d97085
[unicode-commit]: https://github.com/facebook/hermes/commit/9c2a87e08961edc5afbde3ecf28141490500cd9e
[script-search]: https://github.com/facebook/hermes/commit/2e9ac6007fb70f113e910822febb143514acff0c
[range-pool]: https://github.com/facebook/hermes/commit/9f83d6413113dc2e3626f9ba8e45c283a58dad02
[range-fix]: https://github.com/facebook/hermes/commit/26395bb7e9e46d3aa27af1783e6248368aae31e1
[range-fix2]: https://github.com/facebook/hermes/commit/b780866437bbe14e89e3b032bb3a753c1e9c5615
[range-cleanup]: https://github.com/facebook/hermes/commit/33aabd86676354c0a2a6a9e00d90284dcae6ddac
[regex-commit]: https://github.com/facebook/hermes/commit/fdc5d1be19b580cddc481fa1e9553792d88a56bf
[regex-flags]: https://github.com/facebook/hermes/commit/6da22af5c9907dbc7f235d0125fdf54209dc84bc
[regex-state]: https://github.com/facebook/hermes/commit/29048f75736d64fcdd4581faba10e442adf0dc7b
[regex-word]: https://github.com/facebook/hermes/commit/2c10db337eda039d113ad2a1ef403883c3de1d2e
[regex-negative]: https://github.com/facebook/hermes/commit/7b12fec90cf16b4e9937059a5d5655f44025abdf
[changelog]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/CHANGELOG.md
[readonly-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/readonly-variance.js
[readonly-error]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/readonly-variance-error.js
[writeonly-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/writeonly-variance.js
[writeonly-error]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/writeonly-variance-error.js
[in-name-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/in-type-param-name.js
[in-name-error]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/in-type-param-name-error.js
[in-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/in-variance.js
[out-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/out-variance.js
[using-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/for-using.js
[using-declarator]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/for-using-declarator.js
[async-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/component-syntax/async-component.js
[match-binding-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/match/pattern-binding-error.js
[match-object-binding-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/match/pattern-object-binding-error.js
[match-object-value-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/match/pattern-object-value-error.js
[match-statement-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/match/statement-non-block-body-error.js
[jsx-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/jsx-error-attr-member.js
[json-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/unittests/AST/JSONTest.cpp
[regex-test]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/hermes/regexp-modifiers-group.js
[class-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/ClassProperty-test.js
[component-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/ComponentDeclaration-test.js
[annotations-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/TypeAnnotations-test.js
[locations-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/Locations-test.js
[readonly-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/readonly-variance.js
[writeonly-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/writeonly-variance.js
[in-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/in-type-param-name.js
[out-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/out-variance.js
[async-component-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/component-syntax/async-component.js
[match-binding-invalid-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/match/pattern-binding-error.js
[match-object-binding-invalid-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/match/pattern-object-binding-error.js
[match-object-value-invalid-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/match/pattern-object-value-error.js
[match-statement-body-invalid-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/flow/match/statement-non-block-body-error.js
[jsx-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/jsx-error-attr-member.js
[using-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/Parser/for-using.js
[lexer-provenance]: https://github.com/facebook/hermes/commit/8ec174452fb30fbf776eaa218f5c7b4c2d5e554d
[regex-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/test/hermes/regexp-modifiers-group.js
[unicode-provenance]: https://github.com/facebook/hermes/commit/9c2a87e08961edc5afbde3ecf28141490500cd9e
[decorators-provenance]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/Locations-test.js
[hook-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/HookDeclaration-test.js
[opaque-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/OpaqueType-test.js
[record-declaration-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/RecordDeclaration-test.js
[record-expression-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/RecordExpression-test.js
[match-expression-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/MatchExpression-test.js
[match-statement-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/MatchStatement-test.js
[simple-transform-js]: https://github.com/facebook/hermes/blob/17b37301da5da4a2cd55d78f9697c46c0fd96123/tools/hermes-parser/js/hermes-parser/__tests__/transform/SimpleTransform-test.js
[utility-commit]: https://github.com/facebook/hermes/commit/9f7bcbade227db3c3304cd10da6a186fabc6d6a1
[printer-commit]: https://github.com/facebook/hermes/commit/c6aa644f6c2768bbf8753e621c48c24fb5183a0d
[decorator-commit]: https://github.com/facebook/hermes/commit/1ef26c6e2effd5a14aa0131bb04dad4640e2d7a0
