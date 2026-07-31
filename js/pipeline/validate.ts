import {
  ALIAS_EXPANSIONS,
  FIELD_KEY_IDS,
  NODE_TYPE_IDS,
  NODE_TYPES,
  PREDICATE_FIELDS,
  PREDICATE_VALUE_DOMAINS,
} from '../generated/event-schema';
import type { ControlFlowCapability, ScalarPredicate, ScalarValue } from '../types';

export interface PredicateRequirements {
  where?: Readonly<
    Partial<Record<string, Readonly<Partial<Record<string, ScalarPredicate>>> | undefined>>
  >;
  controlFlow?: readonly ControlFlowCapability[];
}

export function validateRouteSpec(pluginName: string, description: string, route: string): void {
  const invalid = route.split('|').find(part => {
    if (part === '*') return false;
    return !NODE_TYPE_IDS.has(part) && ALIAS_EXPANSIONS[part] == null;
  });
  if (invalid != null || route.length === 0)
    throw new Error(`${pluginName}: unknown ${description} ${invalid ?? route}`);
}

export function concreteRouteTypes(route: string): string[] {
  const concrete: string[] = [];
  for (const part of route.split('|')) {
    if (part === '*') {
      for (let index = 1; index < NODE_TYPES.length; index++) concrete.push(NODE_TYPES[index]);
    } else {
      const expansion = ALIAS_EXPANSIONS[part];
      if (expansion != null) concrete.push(...expansion);
      else if (NODE_TYPE_IDS.has(part)) concrete.push(part);
    }
  }
  return [...new Set(concrete)];
}

export function isCollapsedFunctionKey(key: string): boolean {
  return (
    key === 'FunctionDeclaration' || key === 'FunctionExpression' || key === 'TSDeclareFunction'
  );
}

export function isCollapsedClassKey(key: string): boolean {
  return key === 'ClassDeclaration' || key === 'ClassExpression';
}

export function validatePredicates(plugin: string, plan: PredicateRequirements): void {
  const controlCapabilities = new Set<ControlFlowCapability>([
    'skip',
    'stop',
    'stop-all',
    'nested-traverse',
    'dynamic-subscriptions',
  ]);
  const declaredControls = new Set<string>();
  for (const capability of plan.controlFlow ?? []) {
    if (!controlCapabilities.has(capability) || !declaredControls.add(capability))
      throw new Error(`${plugin}: invalid control-flow capability ${capability}`);
  }
  for (const [route, predicates] of Object.entries(plan.where ?? {})) {
    const concreteTypes = concreteRouteTypes(route);
    if (concreteTypes.length === 0) throw new Error(`${plugin}: unknown predicate route ${route}`);
    for (const [field, predicate] of Object.entries(predicates ?? {})) {
      if (!FIELD_KEY_IDS.has(field))
        throw new Error(`${plugin}: unsupported predicate field ${field}`);
      const invalidType = concreteTypes.find(type => !PREDICATE_FIELDS[type]?.includes(field));
      if (invalidType)
        throw new Error(`${plugin}: predicate field ${field} is not valid for ${invalidType}`);
      if (predicate == null || typeof predicate !== 'object')
        throw new Error(`${plugin}: invalid predicate for ${route}.${field}`);
      const operations =
        Number('equals' in predicate) +
        Number('oneOf' in predicate) +
        Number('present' in predicate);
      if (
        operations !== 1 ||
        ('oneOf' in predicate &&
          !Array.isArray(predicate.oneOf) &&
          !isPredicateParameter(predicate.oneOf)) ||
        ('present' in predicate && typeof predicate.present !== 'boolean')
      )
        throw new Error(`${plugin}: invalid predicate for ${route}.${field}`);
      // An unresolved parameter never reaches compilation: it means the plugin was
      // used without `withParameters`, which would otherwise compile as a value.
      if (
        ('equals' in predicate && isPredicateParameter(predicate.equals)) ||
        ('oneOf' in predicate && isPredicateParameter(predicate.oneOf))
      )
        throw new Error(
          `${plugin}: predicate parameter for ${route}.${field} was never bound; call plugin.withParameters(...)`,
        );
      const values: readonly ScalarValue[] =
        'equals' in predicate
          ? [predicate.equals as ScalarValue]
          : 'oneOf' in predicate
            ? (predicate.oneOf as readonly ScalarValue[])
            : [];
      if (values.length > 1024 || values.some(value => !isScalarPredicateValue(value)))
        throw new Error(`${plugin}: invalid scalar value for ${route}.${field}`);
      for (const concreteType of concreteTypes) {
        const domain = PREDICATE_VALUE_DOMAINS[concreteType]?.[field];
        if (
          domain != null &&
          values.some(
            value =>
              !domain.kinds.includes(scalarPredicateKind(value)) ||
              (domain.values != null && !domain.values.includes(value)),
          )
        )
          throw new Error(`${plugin}: incompatible scalar value for ${route}.${field}`);
      }
    }
  }
}

function isScalarPredicateValue(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

function scalarPredicateKind(
  value: string | number | boolean | null,
): 'string' | 'number' | 'boolean' | 'null' {
  if (value === null) return 'null';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  return 'boolean';
}

/** A predicate value still carrying an unbound `parameter(name)` declaration. */
export function isPredicateParameter(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as { parameter?: unknown }).parameter === 'string'
  );
}
