import type { PreflightTransforms } from '../../index';
import { NATIVE_TRANSFORM_NAMES } from '../../preflight/schema';

export type NativeTransformName = (typeof NATIVE_TRANSFORM_NAMES)[number];

export const NATIVE_TRANSFORM_OWNERSHIP_FIXTURES = {
  blockScoping: ['let value = 1;', true],
  classes: ['class Value {}', true],
  legacyDecorators: ['@sealed class Value {}', true],
  destructuring: ['var { value } = input;', { useBuiltIns: true }],
  parameters: ['function read(value = 1) { return value; }', true],
  forOf: ['for (var value of values) consume(value);', true],
  explicitResourceManagement: ['using value = acquire();', true],
  classStaticBlock: ['class Value { static { this.value = 1; } }', true],
  classProperties: ['class Value { field = 1; }', { loose: true }],
  logicalAssignmentOperators: ['value ||= 1;', true],
  optionalChaining: ['value?.field;', { loose: false }],
  nullishCoalescingOperator: ['value ?? fallback;', { loose: false }],
  exportNamespaceFrom: ['export * as value from "pkg";', true],
  optionalCatchBinding: ['try {} catch {}', true],
  objectRestSpread: ['var value = { ...input };', { loose: true, useBuiltIns: true }],
  asyncGeneratorFunctions: ['async function* values() { yield 1; }', true],
  asyncFunctions: ['async function value() { return 1; }', true],
  exponentiationOperator: ['value **= 2;', true],
  privateMethods: ['class Value { #read() {} }', { loose: true }],
  privatePropertyInObject: [
    'class Value { #field; has(input) { return #field in input; } }',
    { loose: true },
  ],
  regexpSticky: ['var value = /a/y;', true],
  regexpUnicode: ['var value = /😀/u;', true],
  regexpUnicodePropertyEscapes: ['var value = /\\p{ASCII}/u;', true],
  regexpDotAll: ['var value = /a.b/s;', true],
  regexpNamedCaptureGroups: ['var value = /(?<value>a)/;', true],
  regexpLookBehind: ['var value = /(?<=a)b/;', true],
  regexpMatchIndices: ['var value = /a/d;', true],
  regexpUnicodeSets: ['var value = /[a&&b]/v;', true],
} as const satisfies Record<
  NativeTransformName,
  readonly [string, PreflightTransforms[NativeTransformName]]
>;

export const NATIVE_TRANSFORM_COMPATIBILITY_BOUNDARIES = new Set<NativeTransformName>();
