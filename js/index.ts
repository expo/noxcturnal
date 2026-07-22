export type * from './types.js';
export type {
  CodeFactory, CodeFragment, DefinedNativePlugin, EditorCapability, MetadataWriter, NativeBinding, NativeEditor,
  NativeNodePath, NativePipeline, NativePipelineDefinition, NativePlugin, NativePluginDefinition,
  NativePluginPipelineDefinition, NativeScope, PipelinePhase, PluginContext, PrepareContext,
  TransformDecision, Visitor, VisitorHandler,
} from './visitors.js';
export { defineNativePipeline, defineNativePlugin, NativeTransformError, NativeTransformSession, pipelineCacheKey, registerParserAdapter, transform, transformOrFallback } from './visitors.js';

import { native } from './native.js';
export const nativeVersion = native.nativeVersion;
export const oxcVersion = native.oxcVersion;
export const classify = native.classify;
