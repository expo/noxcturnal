import { transformSync, type NodePath } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePlugin,
  defineNativePipeline,
  defineVisitor,
  NativeTransformError,
  transform,
} from '../../index';
const source = 'const value=3; globalThis.result=value;';
function run(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each(['π', '变量', 'a\u0301', '𐐀', 'renamed'])('rename to %s', name => {
  let actual: unknown, reference: unknown;
  beforeAll(() => {
    reference = run(
      transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [
          () => ({
            visitor: {
              Program(path: NodePath) {
                path.scope.rename('value', name);
              },
            },
          }),
        ],
      })!.code!,
    );
    const plugin = defineNativePlugin({
      name: 'rename-unicode',
      pre(context) {
        expect(context.code.identifier(name).code).toBe(name);
      },
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          path.scope.rename('value', name);
        }),
      ],
    });
    try {
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      actual = run(result.code);
    } catch (error) {
      expect(error).toBeInstanceOf(NativeTransformError);
      expect((error as Error).message).toContain(`Invalid identifier: ${name}`);
      actual = 'rejected';
    }
  });
  test('native identifier control', () => expect(run(source.replaceAll('value', name))).toBe(3));
  test('Babel rename control', () => expect(reference).toBe(3));
  (name === 'renamed' ? test : test.fails)('renames a valid Unicode binding', () =>
    expect(actual).toBe(3),
  );
});
