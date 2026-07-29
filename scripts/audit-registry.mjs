export const PINNED_OXC_VERSION = '0.141.0';

const oxc = (option, decision = 'keep-oxc') => ({
  capability: 'available',
  option,
  decision,
});
const custom = (owner, difference, decision = 'keep-custom') => ({
  capability: 'counterexample-required',
  option: null,
  owner,
  difference,
  decision,
});
const unavailable = (owner, difference) => ({
  capability: 'unavailable-in-pinned-oxc',
  option: null,
  owner,
  difference,
  decision: 'keep-custom',
  evidence:
    'oxc_transformer-0.141.0/src/es2015/options.rs exposes only arrow_function; no independently selectable implementation exists.',
});
const regexpCustom = (difference, decision = 'keep-custom') => ({
  ...custom('src/preflight/regexp.rs', difference, decision),
  oxcSource: 'oxc_transformer-0.141.0/src/regexp/mod.rs:126-179',
  pinnedOxcBehavior:
    'Replaces a literal with new RegExp(originalPattern, originalFlags); it does not lower unsupported regexp syntax.',
});

export const transforms = {
  blockScoping: unavailable(
    'src/preflight/block_scoping.rs',
    'Pinned Oxc 0.141 has no block-scoping transform.',
  ),
  classes: unavailable(
    'src/preflight/classes.rs',
    'Pinned Oxc 0.141 has class-feature transforms but no public-to-ES5 class transform.',
  ),
  destructuring: unavailable(
    'src/preflight/destructuring.rs',
    'Pinned Oxc 0.141 has no general destructuring transform.',
  ),
  parameters: unavailable(
    'src/preflight/parameters.rs',
    'Pinned Oxc 0.141 has no parameters transform.',
  ),
  forOf: unavailable('src/preflight/for_of.rs', 'Pinned Oxc 0.141 has no for-of transform.'),
  explicitResourceManagement: oxc('TransformOptions.env.es2026.explicit_resource_management'),
  classStaticBlock: oxc('TransformOptions.env.es2022.class_static_block'),
  classProperties: oxc('TransformOptions.env.es2022.class_properties'),
  logicalAssignmentOperators: oxc('TransformOptions.env.es2021.logical_assignment_operators'),
  optionalChaining: oxc('TransformOptions.env.es2020.optional_chaining'),
  nullishCoalescingOperator: oxc('TransformOptions.env.es2020.nullish_coalescing_operator'),
  exportNamespaceFrom: oxc('TransformOptions.env.es2020.export_namespace_from'),
  optionalCatchBinding: oxc('TransformOptions.env.es2019.optional_catch_binding'),
  objectRestSpread: {
    capability: 'available-with-option-gap',
    option: 'TransformOptions.env.es2018.object_rest_spread',
    owner: 'oxc_transformer + focused loose/built-in repair',
    difference:
      'Oxc owns ordinary modes; src/preflight/object_spread.rs and destructuring.rs handle the loose+useBuiltIns combination Oxc 0.141 rejects as unimplemented.',
    decision: 'narrow-custom',
  },
  asyncGeneratorFunctions: oxc('TransformOptions.env.es2018.async_generator_functions'),
  asyncFunctions: oxc('TransformOptions.env.es2017.async_to_generator'),
  exponentiationOperator: oxc('TransformOptions.env.es2016.exponentiation_operator'),
  privateMethods: {
    ...custom(
      'src/preflight/classes.rs',
      'Oxc classProperties emits an undefined brand and mismatched loose-base key for a private method when selected alone.',
      'keep-custom',
    ),
    pinnedCounterexample:
      'class Value { #method(){} call(){ return this.#method() } } with classProperties.loose=true',
    regressionReason: 'oxc-class-properties-private-method-fusion',
  },
  privatePropertyInObject: {
    ...custom(
      'src/preflight/classes.rs',
      'Oxc classProperties emits stringKey.has(checkInRHS(value)) for loose private-in.',
      'keep-custom',
    ),
    pinnedCounterexample: 'class Value { #field; has(value){ return #field in value } }',
    regressionReason: 'oxc-class-properties-private-in-fusion',
  },
  regexpSticky: regexpCustom('Exact Babel flag rewrite contract.'),
  regexpUnicode: regexpCustom(
    'Oxc 0.141 converts the literal to RegExp(pattern, flags) without lowering the unsupported pattern or flag.',
    'keep-custom',
  ),
  regexpUnicodePropertyEscapes: regexpCustom(
    'Property aliases and class forms currently have typed compatibility boundaries.',
    'keep-custom',
  ),
  regexpDotAll: regexpCustom('Exact Babel dot rewrite contract.', 'keep-custom'),
  regexpNamedCaptureGroups: regexpCustom(
    'Custom wrapper currently supplies named replacement behavior.',
    'keep-custom',
  ),
  regexpLookBehind: regexpCustom(
    'Semantic boundary only; no lowering is currently selected.',
    'retain-boundary',
  ),
  regexpMatchIndices: regexpCustom(
    'Semantic boundary only; no lowering is currently selected.',
    'retain-boundary',
  ),
  regexpUnicodeSets: regexpCustom(
    'Semantic boundary only; no lowering is currently selected.',
    'retain-boundary',
  ),
};

const permanent = {
  category: 'compatibility',
  disposition: 'retain',
  pristine: true,
  destination: 'babel',
};
const temporary = {
  category: 'implementation-gap',
  disposition: 'implement-or-replace',
  pristine: true,
  destination: 'babel',
};
const invariant = {
  category: 'internal-invariant',
  disposition: 'make-fatal-or-eliminate',
  pristine: true,
  destination: 'babel',
};

export const bailouts = {
  'react-compiler-not-built': {
    ...permanent,
    owner: 'reactCompiler',
    triggerTest: 'react-compiler.test.ts',
  },
  'parse-error': {
    ...permanent,
    category: 'diagnostic-preserving',
    owner: 'parser',
    triggerTest: 'native-phase.test.ts',
  },
  'semantic-error': { ...invariant, owner: 'semantic', triggerTest: 'native-phase.test.ts' },
  'transform-error': { ...invariant, owner: 'oxcTransformer', triggerTest: 'native-phase.test.ts' },
  'native-transform-error': {
    ...invariant,
    owner: 'runtime',
    triggerTest: 'runtime-boundaries.test.ts',
  },
  'decorators-not-supported': {
    ...permanent,
    owner: 'preflight',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'broad-catch-all-visitor': {
    ...permanent,
    category: 'configuration',
    owner: 'runtime',
    triggerTest: 'runtime/contracts.test.ts',
  },
  'captured-loop-edit-conflict': {
    ...invariant,
    owner: 'blockScoping',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'captured-loop-ast-target-missing': {
    ...invariant,
    owner: 'blockScoping',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'captured-loop-post-rewrite-semantic-error': {
    ...invariant,
    owner: 'blockScoping',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'parameters-edit-conflict': {
    ...invariant,
    owner: 'parameters',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'parameters-rest-names-missing': {
    ...invariant,
    owner: 'parameters',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'parameters-arrow-expression-body-shape-error': {
    ...invariant,
    owner: 'parameters',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'parameters-empty-capture-declaration': {
    ...invariant,
    owner: 'parameters',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'destructuring-edit-conflict': {
    ...invariant,
    owner: 'destructuring',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'destructuring-temporary-declaration-empty': {
    ...invariant,
    owner: 'destructuring',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'for-of-edit-conflict': {
    ...invariant,
    owner: 'forOf',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-edit-conflict': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-ast-target-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-post-rewrite-semantic-error': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-postcondition-failed': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-decorators-not-implemented': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-shape-not-implemented': {
    ...temporary,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-ast-target-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-derived-constructor-body-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-derived-result-name-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-derived-new-target-name-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-derived-super-call-name-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-leading-super-return-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-leading-super-sequence-empty': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-leading-super-sequence-head-mismatch': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-leading-super-expression-mismatch': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-private-key-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-field-options-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-static-block-options-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-shape-mismatch': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-derived-assert-name-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-constructor-body-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-method-key-mismatch': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-method-body-missing': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-direct-field-key-mismatch': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'object-rest-edit-conflict': {
    ...invariant,
    owner: 'objectRestSpread',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'object-spread-edit-conflict': {
    ...invariant,
    owner: 'objectRestSpread',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-edit-conflict': {
    ...invariant,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'arrow-parameters-lexical-super-not-implemented': {
    ...temporary,
    owner: 'parameters',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-spec-private-features-not-implemented': {
    ...temporary,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-accessor-properties-not-implemented': {
    ...temporary,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-body-edit-conflict': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-super-write-not-implemented': {
    ...temporary,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-private-elements-require-private-transform': {
    ...permanent,
    category: 'configuration',
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-fields-require-class-properties-transform': {
    ...permanent,
    category: 'configuration',
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-static-block-requires-static-block-transform': {
    ...permanent,
    category: 'configuration',
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-private-in-requires-private-property-in-object-transform': {
    ...permanent,
    category: 'configuration',
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-super-without-heritage': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-private-name-resolution-failed': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'class-features-postcondition-failed': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'block-scoping-postcondition-failed': {
    ...invariant,
    owner: 'blockScoping',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'captured-loop-block-scoping-postcondition-failed': {
    ...invariant,
    owner: 'blockScoping',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'block-scoping-postcondition-semantic-error': {
    ...invariant,
    owner: 'blockScoping',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'destructuring-missing-initializer': {
    ...permanent,
    category: 'diagnostic-preserving',
    owner: 'destructuring',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'parameters-postcondition-failed': {
    ...invariant,
    owner: 'parameters',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'for-of-postcondition-failed': {
    ...invariant,
    owner: 'forOf',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'pre-for-of-semantic-error': {
    ...invariant,
    owner: 'forOf',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'for-of-ast-target-missing': {
    ...invariant,
    owner: 'forOf',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'pre-destructuring-semantic-error': {
    ...invariant,
    owner: 'destructuring',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'pre-block-scoping-semantic-error': {
    ...invariant,
    owner: 'blockScoping',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'post-rewrite-semantic-error': {
    ...invariant,
    owner: 'preflight',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-class-shape-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-ignore-case-complex-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-negated-class-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-class-range-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-class-escape-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-class-shape': {
    ...invariant,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-in-class-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-shape-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-code-point-escape-shape-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-astral-class-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-named-reference-shape-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-forward-named-reference-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-named-group-shape-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-duplicate-named-groups-not-implemented': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-unsupported': {
    ...temporary,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-escapes-require-property-transform': {
    ...permanent,
    category: 'configuration',
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-code-point-out-of-range': {
    ...permanent,
    category: 'diagnostic-preserving',
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-semantic-mismatch': {
    ...invariant,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-property-escapes-semantic-mismatch': {
    ...invariant,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-dot-all-semantic-mismatch': {
    ...invariant,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-named-capture-groups-semantic-mismatch': {
    ...invariant,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-look-behind-semantic-mismatch': {
    ...permanent,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-match-indices-semantic-mismatch': {
    ...permanent,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'regexp-unicode-sets-semantic-mismatch': {
    ...permanent,
    owner: 'regexp',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'classes-not-implemented': {
    ...invariant,
    owner: 'classes',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'oxc-class-properties-private-method-fusion': {
    ...temporary,
    category: 'pinned-oxc-limitation',
    disposition: 'retain-until-oxc-upgrade',
    owner: 'classProperties',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'oxc-class-properties-private-in-fusion': {
    ...temporary,
    category: 'pinned-oxc-limitation',
    disposition: 'retain-until-oxc-upgrade',
    owner: 'classProperties',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'destructuring-not-implemented': {
    ...invariant,
    owner: 'destructuring',
    triggerTest: 'syntax-transforms.test.ts',
  },
  'for-of-not-implemented': {
    ...invariant,
    owner: 'forOf',
    triggerTest: 'syntax-transforms.test.ts',
  },
};

export const bailoutFamilies = [
  {
    pattern: 'helper-runtime-too-old:*',
    owner: 'helpers',
    category: 'configuration',
    disposition: 'fail-early',
  },
  {
    pattern: 'helper-runtime-module-unsupported:*',
    owner: 'helpers',
    category: 'configuration',
    disposition: 'fail-early',
  },
  {
    pattern: 'helper-not-compatible:*',
    owner: 'helpers',
    category: 'compatibility',
    disposition: 'retain',
  },
  {
    pattern: 'inline-helper-not-compatible:*',
    owner: 'helpers',
    category: 'compatibility',
    disposition: 'generate',
  },
  {
    pattern: '<plugin-or-phase>:<reason>',
    owner: 'runtime',
    category: 'parameterized-plugin',
    disposition: 'require-owner-registry',
  },
];
