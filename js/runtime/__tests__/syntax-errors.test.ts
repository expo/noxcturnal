import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  TransformSyntaxError,
  transform,
} from '../../index';

test('an authoritative edited source parse failure becomes a Metro syntax error', () => {
  const corrupt = defineNativePlugin({
    name: 'corrupt',
    pre(context) {
      context.editor.update(0, context.source.length, 'const value = ;');
    },
  });
  const observe = defineNativePlugin({
    name: 'observe',
    visitors: [defineVisitor('Program', {}, () => {})],
  });

  assert.throws(
    () =>
      transform(
        'const value = 1;',
        '/app/fixture.js',
        defineNativePipeline({
          phases: [
            { name: 'corrupt', plugins: [corrupt] },
            { name: 'observe', plugins: [observe] },
          ],
        }),
      ),
    error => {
      assert.ok(error instanceof TransformSyntaxError);
      assert.ok(error instanceof SyntaxError);
      assert.equal(error.name, 'SyntaxError');
      assert.equal(error.type, 'SyntaxError');
      assert.equal(error.code, 'TRANSFORM_SYNTAX_ERROR');
      assert.equal(error.filename, '/app/fixture.js');
      assert.equal(error.loc.line, 1);
      assert.match(error.codeFrame, /const value = ;/);
      assert.doesNotMatch(error.message, /\^/);
      return true;
    },
  );
});

test('plugin fragment failures remain native transform errors', () => {
  const plugin = defineNativePlugin({
    name: 'fragment',
    visitors: [defineVisitor('Program', {}, path => path.context.code.parseExpression('value +'))],
  });
  assert.throws(
    () =>
      transform(
        'value;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'fragment', plugins: [plugin] }] }),
      ),
    error => error instanceof Error && error.name === 'NativeTransformError',
  );
});
