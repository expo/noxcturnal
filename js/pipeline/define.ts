import type {
  DefinedNativePlugin,
  DefinedVisitor,
  NativePipeline,
  NativePipelineDefinition,
  NativePlugin,
  NativePluginDefinition,
  PipelinePhase,
  PluginContract,
} from '../contracts/visitor';
import type { PredicateParameter, ScalarPredicate, ScalarValue } from '../types';
import { stableJson } from './cache-key';
import { preparePhase } from './routes';
import type { PreflightPlan } from '../preflight/types';
import {
  NATIVE_TRANSFORM_NAMES,
  NATIVE_TRANSFORM_OPTION_NAMES,
  NATIVE_TRANSFORM_OPTION_KEYS,
} from '../preflight/schema';

const NATIVE_TRANSFORMS = new Set<string>(NATIVE_TRANSFORM_NAMES);
const NATIVE_TRANSFORM_OPTIONS = new Set<string>(NATIVE_TRANSFORM_OPTION_NAMES);
const definedPhases = new WeakSet<PipelinePhase>();
interface PipelineCompositionNode {
  children: WeakMap<PipelinePhase, PipelineCompositionNode>;
  pipeline?: NativePipeline;
}
const pipelineCompositions: PipelineCompositionNode = { children: new WeakMap() };

/** Define and freeze a reusable plugin, including its visitor table. */
export function defineNativePlugin<
  State = undefined,
  Options = undefined,
  Analysis = unknown,
  const Contract extends PluginContract = PluginContract,
>(
  plugin: NativePluginDefinition<State, Options, Analysis, Contract>,
): DefinedNativePlugin<State, Options, Analysis, Contract> {
  if ('visitor' in plugin)
    throw new Error(
      `${plugin.name}: the visitor-object form was removed; define typed visitors with defineVisitor and pass them as visitors`,
    );
  const definition = {
    ...plugin,
    visitors: plugin.visitors == null ? undefined : Object.freeze([...plugin.visitors]),
    contract: plugin.contract == null ? undefined : Object.freeze({ ...plugin.contract }),
  } as DefinedNativePlugin<State, Options, Analysis, Contract>;
  Object.defineProperty(definition, 'withOptions', {
    enumerable: false,
    value: (options: Options) => defineNativePlugin({ ...definition, options }),
  });
  Object.defineProperty(definition, 'withParameters', {
    enumerable: false,
    value: (values: ParameterValues) => bindParameters(definition, values),
  });
  return Object.freeze(definition);
}

/** Declare a predicate value supplied when the plugin is bound.
 *
 * `where: { name: { oneOf: parameter('identifierKeys') } }` keeps the operator and
 * the matched field in the contract while deferring the values. Bind them once per
 * configuration with `plugin.withParameters({ identifierKeys: [...] })`; equal
 * values return the same plugin, so the bound plugin's plan is fixed by identity
 * and never depends on the file being transformed. */
export function parameter(name: string): PredicateParameter {
  if (typeof name !== 'string' || name.length === 0) throw new Error('parameter requires a name');
  return Object.freeze({ parameter: name });
}

function isParameter(value: unknown): value is PredicateParameter {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as PredicateParameter).parameter === 'string'
  );
}

type ParameterValues = Readonly<Record<string, ScalarValue | readonly ScalarValue[]>>;

function bindPredicate(
  pluginName: string,
  field: string,
  predicate: ScalarPredicate,
  values: ParameterValues,
  seen: Set<string>,
): ScalarPredicate {
  const resolve = (
    declared: PredicateParameter,
    expectsList: boolean,
  ): ScalarValue | readonly ScalarValue[] => {
    const { parameter: name } = declared;
    if (!Object.hasOwn(values, name))
      throw new Error(`${pluginName}: unbound predicate parameter ${name} for ${field}`);
    seen.add(name);
    const value = values[name];
    if (expectsList !== Array.isArray(value))
      throw new Error(
        `${pluginName}: predicate parameter ${name} must be ${expectsList ? 'a list of scalars' : 'a scalar'}`,
      );
    return value;
  };
  if ('equals' in predicate && isParameter(predicate.equals))
    return { equals: resolve(predicate.equals, false) as ScalarValue };
  if ('oneOf' in predicate && isParameter(predicate.oneOf))
    return {
      oneOf: Object.freeze([...(resolve(predicate.oneOf, true) as readonly ScalarValue[])]),
    };
  return predicate;
}

function bindVisitorParameters(
  pluginName: string,
  visitor: DefinedVisitor<any>,
  values: ParameterValues,
  seen: Set<string>,
): DefinedVisitor<any> {
  const contract = visitor.contract;
  let where = contract.where;
  if (where != null) {
    let bound: Record<string, ScalarPredicate> | undefined;
    for (const [field, predicate] of Object.entries(where)) {
      if (predicate == null) continue;
      const resolved = bindPredicate(pluginName, field, predicate, values, seen);
      if (resolved === predicate) continue;
      bound ??= { ...(where as Record<string, ScalarPredicate>) };
      bound[field] = resolved;
    }
    if (bound != null) where = Object.freeze(bound);
  }
  const nested = contract.nested.map(inner =>
    bindVisitorParameters(pluginName, inner, values, seen),
  );
  const nestedChanged = nested.some((inner, index) => inner !== contract.nested[index]);
  if (where === contract.where && !nestedChanged) return visitor;
  return Object.freeze({
    ...visitor,
    contract: Object.freeze({ ...contract, where, nested: Object.freeze(nested) }),
  });
}

export function defineNativePipeline(pipeline: NativePipelineDefinition): NativePipeline {
  return composeInternedPhases(
    pipeline.phases
      .map(phase => (definedPhases.has(phase) ? phase : normalizePipelinePhase(phase)))
      .filter(phase => phase.native == null || hasActiveNativeOperation(phase.native)),
  );
}

/**
 * Define a reusable phase once. Composing this phase into multiple pipelines
 * preserves its identity, allowing phase preparation and route compilation to
 * remain cached while consumers cheaply select a per-file phase sequence.
 */
export function definePipelinePhase(phase: PipelinePhase): PipelinePhase {
  if (definedPhases.has(phase)) return phase;
  const defined = normalizePipelinePhase(phase);
  definedPhases.add(defined);
  return defined;
}

/**
 * Compose previously defined phases into an interned pipeline. Repeated phase
 * sequences return the same pipeline object, so both phase- and pipeline-level
 * compilation can be paid once without retaining per-file configuration.
 */
export function composeNativePipeline(phases: readonly PipelinePhase[]): NativePipeline {
  for (const phase of phases)
    if (!definedPhases.has(phase))
      throw new Error('composeNativePipeline requires phases created with definePipelinePhase');
  return composeInternedPhases(
    phases.filter(phase => phase.native == null || hasActiveNativeOperation(phase.native)),
  );
}

/** Intern an ordered sequence of already-interned phases. */
function composeInternedPhases(phases: readonly PipelinePhase[]): NativePipeline {
  let node = pipelineCompositions;
  for (const phase of phases) {
    let child = node.children.get(phase);
    if (child == null) {
      child = { children: new WeakMap() };
      node.children.set(phase, child);
    }
    node = child;
  }
  return (node.pipeline ??= Object.freeze({ phases: Object.freeze([...phases]) }));
}

/** Stable integer identity per plugin definition, for structural phase keys. */
const pluginIds = new WeakMap<object, number>();
let nextPluginId = 0;
function pluginId(plugin: NativePlugin<any, any>): number {
  let id = pluginIds.get(plugin);
  if (id == null) {
    id = nextPluginId++;
    pluginIds.set(plugin, id);
  }
  return id;
}

const internedPhases = new Map<string, PipelinePhase>();
/** Budget for phases first seen while transforming. */
const MAX_RUNTIME_INTERNED_PHASES = 1024;
/** Null while the definition scope is open. */
let runtimeInternLimit: number | null = null;

/**
 * End the definition scope; the first transform calls this.
 *
 * Phases interned before any transform are program configuration and finite by
 * construction, so they are not counted against the runtime budget and cannot be
 * crowded out by shapes discovered later. Everything after this point shares a
 * bounded budget on top of whatever definition scope used.
 *
 * A consumer that memoises its phases lazily — on the first file rather than at
 * module scope — reaches this boundary before most of its reusable phases exist, so
 * those compete for the runtime budget like any other. Define phases at module
 * scope to get the guarantee.
 */
export function closeDefinitionScope(): void {
  runtimeInternLimit ??= internedPhases.size + MAX_RUNTIME_INTERNED_PHASES;
}

/** Phase identity is structural, so a consumer cannot lose it by accident.
 *
 * Plan and route compilation are memoised on the phase object, so an anonymous
 * phase rebuilt for every file would recompile for every file. A phase is fully
 * described by its name, its flags, and either its native plan or its ordered
 * plugin identities, so building the same phase twice returns the same object and
 * those memos hit — whether the consumer reached for `definePipelinePhase` or
 * wrote the phase inline. */
function internPhase(phase: PipelinePhase, normalize: () => PipelinePhase): PipelinePhase {
  const flags = [
    phase.name,
    phase.editEffect ?? '',
    phase.requiresPrintedInput ?? '',
    phase.requiresFreshSemantics ?? '',
    phase.requiresRealizedMap ?? '',
  ].join(':');
  const key =
    phase.native != null
      ? `n${flags}${stableJson(phase.native)}`
      : `p${flags}:${(phase.plugins ?? []).map(pluginId).join(',')}`;
  const interned = internedPhases.get(key);
  if (interned != null) return interned;
  const normalized = normalize();
  definedPhases.add(normalized);
  // Every plan a plugin phase compiles from is fixed by its definitions, so compile
  // it now rather than on the first file that reaches it. Contract errors surface
  // here, where the offending definition is, and the transform path is left with a
  // lookup. Native phases have no routes to compile and are skipped.
  if (normalized.native == null) preparePhase(normalized);
  // Bounded after the definition scope closes, so a consumer that genuinely builds
  // a distinct phase shape per file cannot grow this table without limit. Entries
  // already interned keep hitting once it is full, so the phases a pipeline reuses
  // stay cheap and only newly seen shapes degrade to recompilation. Interned phases
  // are retained for the process, along with their compiled routes and manifest.
  if (runtimeInternLimit == null || internedPhases.size < runtimeInternLimit)
    internedPhases.set(key, normalized);
  return normalized;
}

function normalizePipelinePhase(phase: PipelinePhase): PipelinePhase {
  if (phase.native != null && phase.plugins != null)
    throw new Error(`${phase.name}: native phases cannot contain visitor plugins`);
  if (phase.native != null) {
    const native = normalizeNativePlan(phase.native);
    validateNativePlan(phase.name, native);
    const normalizedPhase = { ...phase, native };
    return internPhase(normalizedPhase, () =>
      Object.freeze({
        ...normalizedPhase,
        native: deepFreeze(structuredClone(native)),
      }),
    );
  }
  return internPhase(phase, () =>
    Object.freeze({
      ...phase,
      plugins: Object.freeze([...(phase.plugins ?? [])]),
    }),
  );
}

function normalizeNativePlan(plan: PreflightPlan): PreflightPlan {
  const native = Object.fromEntries(
    Object.entries(plan).filter(([, value]) => value !== undefined),
  ) as PreflightPlan;

  for (const key of ['transforms', 'optimize'] as const) {
    const options = plan[key];
    if (options == null) continue;
    const enabled = Object.fromEntries(
      Object.entries(options).filter(([, value]) => value !== false && value !== undefined),
    );
    if (Object.keys(enabled).length === 0) {
      delete native[key];
    } else {
      (native as Record<string, unknown>)[key] = enabled;
    }
  }

  return native;
}

function validateNativePlan(phaseName: string, plan: PreflightPlan): void {
  const known = new Set([
    'transforms',
    'optimize',
    'reactCompiler',
    'reactRefresh',
    'typescript',
    'jsx',
    'jsxPure',
    'jsxThrowIfNamespace',
    'jsxImportSource',
    'jsxPragma',
    'jsxPragmaFrag',
    'helpers',
    'compact',
    'comments',
  ]);
  for (const [name, value] of Object.entries(plan))
    if (!known.has(name) && value !== false && value !== undefined)
      throw new Error(`${phaseName}: unknown native option ${name}`);
  if (plan.jsx === 'automatic-if-present') {
    const transformNames = plan.transforms == null ? [] : Object.keys(plan.transforms);
    const hasTransforms = transformNames.some(name => name !== 'blockScoping');
    const hasFusedBlockScoping = plan.transforms?.blockScoping === true;
    const hasOptimization =
      plan.optimize?.constantFolding === true || plan.optimize?.deadCodeElimination === true;
    if (
      hasTransforms ||
      hasOptimization ||
      plan.typescript != null ||
      plan.reactCompiler != null ||
      plan.reactRefresh != null ||
      plan.compact === true ||
      (plan.comments === false && !hasFusedBlockScoping)
    ) {
      const active = [
        ...(hasTransforms ? [`transforms:${transformNames.join(',')}`] : []),
        ...(hasOptimization ? ['optimize'] : []),
        ...(plan.typescript != null ? ['typescript'] : []),
        ...(plan.reactCompiler != null ? ['reactCompiler'] : []),
        ...(plan.reactRefresh != null ? ['reactRefresh'] : []),
        ...(plan.compact === true ? ['compact'] : []),
        ...(plan.comments === false && !hasFusedBlockScoping ? ['comments'] : []),
      ];
      throw new Error(
        `${phaseName}: automatic-if-present JSX must be a standalone conditional native phase; also requested ${active.join(', ')}`,
      );
    }
  }
  if (plan.reactRefresh != null) {
    const refresh = plan.reactRefresh;
    const allowed = new Set(['refreshReg', 'refreshSig', 'emitFullSignatures']);
    if (Object.keys(refresh).some(key => !allowed.has(key)))
      throw new Error(`${phaseName}: unknown React Refresh option`);
    for (const [name, value] of [
      ['refreshReg', refresh.refreshReg],
      ['refreshSig', refresh.refreshSig],
    ] as const) {
      if (value != null && (typeof value !== 'string' || value.length === 0))
        throw new Error(`${phaseName}: invalid React Refresh ${name}`);
    }
    if (refresh.emitFullSignatures != null && typeof refresh.emitFullSignatures !== 'boolean')
      throw new Error(`${phaseName}: invalid React Refresh emitFullSignatures`);
  }
  if (plan.reactCompiler != null) {
    const compiler = plan.reactCompiler;
    const keys = Object.keys(compiler);
    const allowed = new Set([
      'compilationMode',
      'panicThreshold',
      'target',
      'enableResetCacheOnSourceFileChanges',
      'customOptOutDirectives',
    ]);
    if (keys.some(key => !allowed.has(key)))
      throw new Error(`${phaseName}: unknown React Compiler option`);
    if (!['infer', 'syntax', 'annotation', 'all'].includes(compiler.compilationMode))
      throw new Error(`${phaseName}: invalid React Compiler compilationMode`);
    if (!['none', 'critical_errors', 'all_errors'].includes(compiler.panicThreshold))
      throw new Error(`${phaseName}: invalid React Compiler panicThreshold`);
    if (!['17', '18', '19'].includes(compiler.target))
      throw new Error(`${phaseName}: invalid React Compiler target`);
    if (typeof compiler.enableResetCacheOnSourceFileChanges !== 'boolean')
      throw new Error(`${phaseName}: invalid React Compiler enableResetCacheOnSourceFileChanges`);
    if (
      compiler.customOptOutDirectives != null &&
      (!Array.isArray(compiler.customOptOutDirectives) ||
        compiler.customOptOutDirectives.some(
          directive => typeof directive !== 'string' || directive.length === 0,
        ))
    )
      throw new Error(`${phaseName}: invalid React Compiler customOptOutDirectives`);
  }
  if (plan.optimize != null) {
    const allowed = new Set(['constantFolding', 'deadCodeElimination', 'moduleContext']);
    for (const [name, value] of Object.entries(plan.optimize)) {
      if (!allowed.has(name)) throw new Error(`${phaseName}: unknown native optimization ${name}`);
      if (value !== true)
        throw new Error(`${phaseName}: native optimization ${name} must be true or absent`);
    }
  }
  for (const [name, value] of Object.entries(plan.transforms ?? {})) {
    if (!NATIVE_TRANSFORMS.has(name))
      throw new Error(`${phaseName}: unknown native transform ${name}`);
    if (value === false)
      throw new Error(`${phaseName}: native transform ${name} must be true or absent`);
    if (NATIVE_TRANSFORM_OPTIONS.has(name) && (value == null || typeof value !== 'object'))
      throw new Error(`${phaseName}: native transform ${name} requires an options object`);
    if (!NATIVE_TRANSFORM_OPTIONS.has(name) && value !== true)
      throw new Error(`${phaseName}: native transform ${name} must be true`);
    if (NATIVE_TRANSFORM_OPTIONS.has(name)) {
      const expected =
        NATIVE_TRANSFORM_OPTION_KEYS[name as keyof typeof NATIVE_TRANSFORM_OPTION_KEYS];
      const actual = Object.keys(value as object);
      if (
        actual.length !== expected.length ||
        expected.some(
          key =>
            !Object.hasOwn(value as object, key) ||
            typeof (value as Record<string, unknown>)[key] !== 'boolean',
        ) ||
        actual.some(key => !(expected as readonly string[]).includes(key))
      )
        throw new Error(
          `${phaseName}: native transform ${name} requires { ${expected
            .map(key => `${key}: boolean`)
            .join(', ')} }`,
        );
    }
  }
}

function hasActiveNativeOperation(plan: PreflightPlan): boolean {
  return (
    Object.keys(plan.transforms ?? {}).length > 0 ||
    Object.keys(plan.optimize ?? {}).length > 0 ||
    plan.reactCompiler != null ||
    plan.reactRefresh != null ||
    plan.typescript != null ||
    plan.jsx != null ||
    plan.compact === true ||
    plan.comments === false
  );
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

const boundPlugins = new WeakMap<object, Map<string, DefinedNativePlugin<any, any, any, any>>>();

/** Resolve a plugin's declared predicate parameters, interning on the values.
 *
 * Binding is a configuration-scope operation: repeating it with equal values
 * returns the same plugin, so downstream plan and route compilation stay keyed by
 * identity rather than by a serialization of per-file state. */
function bindParameters<State, Options, Analysis, Contract extends PluginContract>(
  plugin: DefinedNativePlugin<State, Options, Analysis, Contract>,
  values: ParameterValues,
): DefinedNativePlugin<State, Options, Analysis, Contract> {
  const key = stableJson(values);
  let bound = boundPlugins.get(plugin);
  if (bound == null) {
    bound = new Map();
    boundPlugins.set(plugin, bound);
  }
  const cached = bound.get(key);
  if (cached != null) return cached as DefinedNativePlugin<State, Options, Analysis, Contract>;
  const seen = new Set<string>();
  const visitors = (plugin.visitors ?? []).map(visitor =>
    bindVisitorParameters(plugin.name, visitor, values, seen),
  );
  for (const name of Object.keys(values))
    if (!seen.has(name)) throw new Error(`${plugin.name}: no predicate declares parameter ${name}`);
  const result = defineNativePlugin({
    ...(plugin as unknown as NativePluginDefinition<State, Options, Analysis, Contract>),
    visitors,
  });
  bound.set(key, result);
  return result;
}
