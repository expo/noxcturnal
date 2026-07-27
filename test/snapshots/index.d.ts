export type * from './types.js';
export type {
  PreflightHelpers,
  PreflightJsxMode,
  PreflightPlan,
  PreflightReactCompiler,
  PreflightTransforms,
  PreflightTypeScriptMode,
} from './preflight/types.js';
export type {
  AncestryCapability,
  ChildContract,
  Code,
  CodeFactory,
  CodeFragment,
  CompositeFragment,
  ContractNode,
  ContractNodeBase,
  ContractPath,
  ContractPathBase,
  SourceFragment,
  CompiledPhasePlan,
  DefinedNativePlugin,
  DefinedVisitor,
  MetadataWriter,
  NativeBinding,
  NativeEditor,
  NativeNodePath,
  NativePipeline,
  NativePipelineDefinition,
  NativePlugin,
  NativePluginDefinition,
  NativeScope,
  PipelinePhase,
  PluginContract,
  PluginContextFor,
  ContractMetadataWriter,
  SnapshotOptions,
  PluginContext,
  PrepareContext,
  StoredVisitorContract,
  TransformDecision,
  TypedVisitorHandler,
  VisitorRouteSpec,
  VisitorConfiguration,
  VisitorContract,
} from './contracts/visitor.js';
export { defineVisitor, NativeTransformError } from './contracts/visitor.js';
export {
  composeNativePipeline,
  defineNativePipeline,
  defineNativePlugin,
  definePipelinePhase,
} from './pipeline/define.js';
export { compilePhasePlan } from './pipeline/compile.js';
export { pipelineCacheKey, transformClassificationCacheKey } from './pipeline/cache-key.js';
export { registerParserAdapter } from './adapters/registry.js';
export { transform } from './runtime/transform.js';
export declare const classify: (
  filename: string,
  source: string,
) => import('./types.js').ParseClassification;
