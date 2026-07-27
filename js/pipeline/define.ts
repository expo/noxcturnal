import type {
  DefinedNativePlugin,
  NativePipeline,
  NativePipelineDefinition,
  NativePluginDefinition,
  PipelinePhase,
  PluginContract,
} from '../contracts/visitor.js';
import type { PreflightPlan } from '../preflight/types.js';
import {
  NATIVE_TRANSFORM_NAMES,
  NATIVE_TRANSFORM_OPTION_NAMES,
  NATIVE_TRANSFORM_OPTION_KEYS,
} from '../preflight/schema.js';

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
    value: (options: Options) => defineNativePlugin({ ...plugin, options }),
  });
  return Object.freeze(definition);
}

export function defineNativePipeline(pipeline: NativePipelineDefinition): NativePipeline {
  return Object.freeze({
    phases: Object.freeze(
      pipeline.phases.map(phase =>
        definedPhases.has(phase) ? phase : normalizePipelinePhase(phase),
      ),
    ),
  });
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
  let node = pipelineCompositions;
  for (const phase of phases) {
    if (!definedPhases.has(phase))
      throw new Error('composeNativePipeline requires phases created with definePipelinePhase');
    let child = node.children.get(phase);
    if (child == null) {
      child = { children: new WeakMap() };
      node.children.set(phase, child);
    }
    node = child;
  }
  return (node.pipeline ??= Object.freeze({
    phases: Object.freeze([...phases]),
  }));
}

function normalizePipelinePhase(phase: PipelinePhase): PipelinePhase {
  if (phase.native != null && phase.plugins != null)
    throw new Error(`${phase.name}: native phases cannot contain visitor plugins`);
  if (phase.native != null) {
    validateNativePlan(phase.name, phase.native);
    return Object.freeze({
      ...phase,
      native: deepFreeze(structuredClone(phase.native)),
    });
  }
  return Object.freeze({
    ...phase,
    plugins: Object.freeze([...(phase.plugins ?? [])]),
  });
}

function validateNativePlan(phaseName: string, plan: PreflightPlan): void {
  if (plan.jsx === 'automatic-if-present') {
    const hasTransforms = plan.transforms != null && Object.keys(plan.transforms).length > 0;
    const hasOptimization =
      plan.optimize?.constantFolding === true || plan.optimize?.deadCodeElimination === true;
    if (
      hasTransforms ||
      hasOptimization ||
      plan.typescript != null ||
      plan.reactCompiler != null ||
      plan.reactRefresh != null ||
      plan.compact === true ||
      plan.comments === false
    ) {
      const active = [
        ...(hasTransforms ? [`transforms:${Object.keys(plan.transforms!).join(',')}`] : []),
        ...(hasOptimization ? ['optimize'] : []),
        ...(plan.typescript != null ? ['typescript'] : []),
        ...(plan.reactCompiler != null ? ['reactCompiler'] : []),
        ...(plan.reactRefresh != null ? ['reactRefresh'] : []),
        ...(plan.compact === true ? ['compact'] : []),
        ...(plan.comments === false ? ['comments'] : []),
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
    const allowed = new Set(['constantFolding', 'deadCodeElimination']);
    for (const [name, value] of Object.entries(plan.optimize)) {
      if (!allowed.has(name)) throw new Error(`${phaseName}: unknown native optimization ${name}`);
      if (value !== true)
        throw new Error(`${phaseName}: native optimization ${name} must be true or absent`);
    }
  }
  if (plan.transforms == null) return;
  for (const [name, value] of Object.entries(plan.transforms)) {
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

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}
