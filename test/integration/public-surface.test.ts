import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'vitest';

import { native } from '../../dist/native/binding.js';

const root = path.resolve(import.meta.dirname, '../..');
const api = createRequire(import.meta.url)('../../dist/index.js') as Record<string, unknown>;

test('preserves the public package and native ABI surfaces', () => {
  assert.deepEqual(Object.keys(api).sort(), [
    'NativeTransformError',
    'classify',
    'compilePhasePlan',
    'defineNativePipeline',
    'defineNativePlugin',
    'defineVisitor',
    'pipelineCacheKey',
    'registerParserAdapter',
    'transform',
    'transformClassificationCacheKey',
  ]);
  assert.deepEqual(Object.keys(native).sort(), [
    'EditKind',
    'MappingPolicy',
    'NativeIndexedSession',
    'classify',
    'commitDecodedBuffer',
    'commitPackedBuffer',
    'composeDecodedChain',
    'composeMappings',
    'generateFunctionMap',
    'materializeRoutedBuffer',
    'validateExpression',
    'validateStatements',
  ]);
});

test('matches the emitted public declaration snapshot', () => {
  const emitted = fs.readFileSync(path.join(root, 'dist/index.d.ts'), 'utf8');
  const snapshot = fs.readFileSync(path.join(root, 'test/snapshots/index.d.ts'), 'utf8');
  assert.equal(emitted, snapshot);
});
