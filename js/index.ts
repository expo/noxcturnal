export type * from './types.js';
export type {
  Code,
  CodeFactory,
  CodeFragment,
  CompositeFragment,
  SourceFragment,
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
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
} from './visitors.js';

import { native } from './native.js';
export const classify = native.classify;
