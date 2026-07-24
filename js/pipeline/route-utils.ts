import { ALIAS_EXPANSIONS } from '../generated/event-schema.js';
import type { QueryRequest } from '../types.js';

const ALIAS_SETS = new Map<string, ReadonlySet<string>>(
  Object.entries(ALIAS_EXPANSIONS).map(([key, expansion]) => [key, new Set(expansion)]),
);

export function alias(key: string, type: string): boolean {
  return key === '*' || (ALIAS_SETS.get(key)?.has(type) ?? false);
}

export function array(value: string | readonly string[]): string[] {
  return typeof value === 'string' ? [value] : [...value];
}

export function expandSubscriptions(values: readonly string[]): string[] {
  return [...new Set(values.flatMap(value => value.split('|')))];
}

export function querySubscriptions(request: QueryRequest): string[] {
  const types: string[] = [];
  if (request.imports) {
    types.push(
      'ImportDeclaration',
      'ImportSpecifier',
      'ImportDefaultSpecifier',
      'ImportNamespaceSpecifier',
    );
  }
  if (request.exports) {
    types.push(
      'ExportNamedDeclaration',
      'ExportDefaultDeclaration',
      'ExportAllDeclaration',
      'ExportSpecifier',
    );
  }
  return types;
}
