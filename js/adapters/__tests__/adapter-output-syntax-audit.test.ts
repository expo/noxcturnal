import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  registerParserAdapter,
  transform,
} from '../../index';

for (const mode of ['empty', 'visitor', 'scope', 'native'] as const)
  describe.each(['js', 'jsx'] as const)(`${mode} adapter output=%s`, syntax => {
    let actual: unknown;
    beforeAll(() => {
      let visits = 0;
      let compilations = 0;
      const unregister = registerParserAdapter({
        name: 'output-syntax-audit',
        version: '1.0.0',
        supports: classification => classification.syntax === 'flow',
        compile(source) {
          compilations++;
          const code = source.replace(': number', '');
          expect(() => new Function(code)).not.toThrow();
          return { status: 'complete', code, syntax, map: { mappings: 'AAAA', names: [] } };
        },
      });
      try {
        const plugin = defineNativePlugin({
          name: 'observe-adapted-code',
          visitors: [
            defineVisitor('NumericLiteral', { scope: mode === 'scope' }, () => {
              visits++;
            }),
          ],
        });
        const pipeline = defineNativePipeline({
          phases:
            mode === 'empty'
              ? []
              : mode === 'native'
                ? [{ name: 'native', native: { transforms: { blockScoping: true } } }]
                : [{ name: 'observe', plugins: [plugin] }],
        });
        try {
          const result = transform('// @flow\nconst value: number=3;', 'input.js', pipeline, {
            parserAdapter: 'output-syntax-audit',
          });
          expect(result.status).toBe('complete');
          if (result.status !== 'complete') throw new Error('Unexpected bailout');
          if (mode === 'native') expect(result.code).not.toMatch(/\bconst\b/);
          actual = [result.status, visits];
        } catch (error) {
          expect((error as Error).message).toBe('flow-requires-parser-adapter');
          actual = ['flow-requires-parser-adapter', visits];
        }
        expect(compilations).toBe(1);
      } finally {
        unregister();
      }
    });
    (syntax === 'js' && mode !== 'empty' ? test.fails : test)(
      'honors the adapter output syntax when the pipeline parses its output',
      () => expect(actual).toEqual(['complete', mode === 'visitor' || mode === 'scope' ? 1 : 0]),
    );
  });
