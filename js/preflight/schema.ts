import type { PreflightTransforms } from './types';

/** Runtime schema for validating the public per-transform configuration. */
export const NATIVE_TRANSFORM_NAMES = [
  'blockScoping',
  'classes',
  'destructuring',
  'parameters',
  'forOf',
  'explicitResourceManagement',
  'classStaticBlock',
  'classProperties',
  'logicalAssignmentOperators',
  'optionalChaining',
  'nullishCoalescingOperator',
  'exportNamespaceFrom',
  'optionalCatchBinding',
  'objectRestSpread',
  'asyncGeneratorFunctions',
  'asyncFunctions',
  'exponentiationOperator',
  'privateMethods',
  'privatePropertyInObject',
  'regexpSticky',
  'regexpUnicode',
  'regexpUnicodePropertyEscapes',
  'regexpDotAll',
  'regexpNamedCaptureGroups',
  'regexpLookBehind',
  'regexpMatchIndices',
  'regexpUnicodeSets',
] as const satisfies readonly (keyof PreflightTransforms)[];

export const NATIVE_TRANSFORM_OPTION_NAMES = [
  'classProperties',
  'destructuring',
  'optionalChaining',
  'nullishCoalescingOperator',
  'objectRestSpread',
  'privateMethods',
  'privatePropertyInObject',
] as const satisfies readonly (keyof PreflightTransforms)[];

export const NATIVE_TRANSFORM_OPTION_KEYS = {
  classProperties: ['loose'],
  destructuring: ['useBuiltIns'],
  optionalChaining: ['loose'],
  nullishCoalescingOperator: ['loose'],
  objectRestSpread: ['loose', 'useBuiltIns'],
  privateMethods: ['loose'],
  privatePropertyInObject: ['loose'],
} as const satisfies Partial<Record<keyof PreflightTransforms, readonly string[]>>;
