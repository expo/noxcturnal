export type * from './types.js';
export type {
  CodeFactory,
  CodeFragment,
  CompiledPhasePlan,
  DefinedNativePlugin,
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
  SnapshotOptions,
  PluginContext,
  PrepareContext,
  TransformDecision,
  Visitor,
  VisitorHandler,
} from './visitors.js';
export {
  defineNativePipeline,
  defineNativePlugin,
  compilePhasePlan,
  NativeTransformError,
  NativeTransformSession,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
} from './visitors.js';

import { native } from './native.js';
export const classify = native.classify;
