import assert from 'node:assert/strict';
import { test } from 'vitest';

import * as api from '../../js/index';
import { native } from '../../js/native/binding';

test('preserves the public source and native ABI surfaces', () => {
  assert.deepEqual(Object.keys(api).sort(), [
    'NativeTransformError',
    'TransformSyntaxError',
    'classify',
    'compilePhasePlan',
    'composeNativePipeline',
    'defineNativePipeline',
    'defineNativePlugin',
    'definePipelinePhase',
    'defineVisitor',
    'isDeclaration',
    'isDeclarationType',
    'isExpression',
    'isExpressionType',
    'isFunction',
    'isFunctionType',
    'isMemberExpression',
    'isMemberExpressionType',
    'isMetaProperty',
    'isMetaPropertyType',
    'isNodeType',
    'isStatement',
    'isStatementType',
    'parameter',
    'pipelineCacheKey',
    'registerParserAdapter',
    'transform',
    'transformClassificationCacheKey',
  ]);
  assert.deepEqual(Object.keys(native).sort(), [
    'EditKind',
    'MappingPolicy',
    'NativeCompiledManifest',
    'NativeIndexedSession',
    'NativeParsedSource',
    'NativePipelineSession',
    'NativeSourceText',
    'classify',
    'commitDecodedBuffer',
    'commitPackedBuffer',
    'composeDecodedChain',
    'composeMappings',
    'generateFunctionMap',
    'materializeRoutedBuffer',
    'nativeFlowErase',
    'nativePreflightTransform',
    'originalSourcePosition',
    'runNativePipeline',
    'sourceHints',
    'validateExpression',
    'validateIdentifier',
    'validateProgram',
    'validateStatements',
  ]);
});
