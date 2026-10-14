import { beforeAll, describe, expect, test } from 'vitest';
import {
  classify,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
} from '../../index';

describe.each(['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'])('%s', extension => {
  for (const uppercase of [false, true]) {
    describe(uppercase ? 'uppercase' : 'lowercase', () => {
      let supported: boolean;
      let completed: boolean;
      beforeAll(() => {
        const filename = `input.${uppercase ? extension.toUpperCase() : extension}`;
        const source = 'const x=3;';
        supported = classify(filename, source).supported;
        let visits = 0;
        const plugin = defineNativePlugin({
          name: 'extension-audit',
          visitors: [
            defineVisitor('NumericLiteral', {}, () => {
              visits++;
            }),
          ],
        });
        try {
          const result = transform(
            source,
            filename,
            defineNativePipeline({
              phases: [{ name: 'read', plugins: [plugin] }],
            }),
          );
          completed = result.status === 'complete';
          if (result.status === 'complete') expect(visits).toBe(1);
          else expect(result.source).toBe(source);
        } catch (error) {
          expect((error as Error).message).toBe(`unsupported filename extension: ${filename}`);
          completed = false;
        }
        if (!uppercase) {
          expect(supported).toBe(true);
          expect(completed).toBe(true);
        }
      });
      (uppercase ? test.fails : test)(
        'classification agrees with parsing valid plain source',
        () => {
          expect(completed).toBe(supported);
        },
      );
    });
  }
});
