import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
  TransformSyntaxError,
} from '../../index';

for (const observer of [false, true]) {
  describe(`invalid source with native phase; observer=${observer}`, () => {
    let outcome: string;
    beforeAll(() => {
      let visits = 0;
      const plugin = defineNativePlugin({
        name: 'observer',
        visitors: [
          defineVisitor('Program', {}, () => {
            visits++;
          }),
        ],
      });
      const source = 'const =;';
      expect(() => new Function(source)).toThrow(SyntaxError);
      expect(() =>
        transform(
          source,
          'input.js',
          defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
        ),
      ).toThrow(TransformSyntaxError);
      expect(() =>
        transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              { name: 'native', native: { transforms: { parameters: true } } },
              ...(observer ? [{ name: 'visit', plugins: [plugin] }] : []),
            ],
          }),
        ),
      ).toThrow(TransformSyntaxError);
      expect(visits).toBe(0);
      outcome = 'throw';
    });
    test('invalid input throws rather than becoming a compatibility bailout', () =>
      expect(outcome).toBe('throw'));
  });
}
