export type * from './types';
export type {
  PreflightHelpers,
  PreflightJsxMode,
  PreflightPlan,
  PreflightReactCompiler,
  PreflightTransforms,
  PreflightTypeScriptMode,
} from './preflight/types';
export type {
  AncestryCapability,
  ChildContract,
  VisitorSelector,
  ChildSelector,
  StoredVisitorSelector,
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
  SyntaxFeature,
  PluginContextFor,
  ContractMetadataWriter,
  SnapshotOptions,
  PluginContext,
  PrepareContext,
  StoredVisitorContract,
  TransformDecision,
  TypedVisitorHandler,
  VisitorRouteSpec,
  VisitorContract,
} from './contracts/visitor';
export { defineVisitor, NativeTransformError } from './contracts/visitor';
export { TransformSyntaxError } from './errors';
export {
  composeNativePipeline,
  defineNativePipeline,
  defineNativePlugin,
  definePipelinePhase,
  parameter,
} from './pipeline/define';
export { compilePhasePlan } from './pipeline/compile';
export { pipelineCacheKey, transformClassificationCacheKey } from './pipeline/cache-key';
export { registerParserAdapter } from './adapters/registry';
export {
  isDeclaration,
  isDeclarationType,
  isExpression,
  isExpressionType,
  isFunction,
  isFunctionType,
  isMemberExpression,
  isMemberExpressionType,
  isMetaProperty,
  isMetaPropertyType,
  isNodeType,
  isStatement,
  isStatementType,
} from './generated/node-predicates';
export type { NodeTypeForRoute, NodeTypeLike, NodeTypeRoute } from './generated/node-predicates';
export { transform } from './runtime/transform';

import { native } from './native/binding';
export const classify = native.classify;
