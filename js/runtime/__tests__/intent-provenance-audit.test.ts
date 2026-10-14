import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  NativeTransformError,
  transform,
} from '../../index';

for (const kind of ['helper', 'replacement'] as const) {
  for (const provenance of [false, true]) {
    describe.each([false, true])(`${kind}, provenance=${provenance}, changed=%s`, changed => {
      let rejected: boolean;
      beforeAll(() => {
        const claim = (name: string) =>
          defineNativePlugin({
            name,
            pre(context) {
              const content = provenance ? context.sourceSlice(0, 3) : context.source.slice(0, 3);
              if (kind === 'helper') context.ensureHelper('shared/value', content);
              else context.ensureReplace('shared/value', 5, 8, content);
            },
          });
        try {
          const result = transform(
            'aaa; bbb;',
            'input.js',
            defineNativePipeline({
              phases: [
                { name: 'first', plugins: [claim('first-claimer')] },
                {
                  name: 'mutation',
                  plugins: [
                    defineNativePlugin({
                      name: 'mutator',
                      pre(context) {
                        if (changed) context.editor.update(0, 3, 'ccc');
                      },
                    }),
                  ],
                },
                { name: 'last', plugins: [claim('last-claimer')] },
              ],
            }),
          );
          expect(result.status).toBe('complete');
          if (result.status !== 'complete') throw new Error('Unexpected bailout');
          expect(result.code.startsWith(changed ? 'ccc' : 'aaa')).toBe(true);
          rejected = false;
        } catch (error) {
          expect(error).toBeInstanceOf(NativeTransformError);
          expect((error as Error).message).toMatch(/realized different content/);
          expect((error as NativeTransformError).owners).toEqual(['last-claimer', 'first-claimer']);
          rejected = true;
        }
      });
      (provenance && changed ? test.fails : test)(
        'compares content across phase source versions',
        () => {
          expect(rejected).toBe(changed);
        },
      );
    });
  }
}

for (const kind of ['helper', 'replacement'] as const) {
  describe.each([false, true])(`${kind}, shifted identical content, provenance=%s`, provenance => {
    let rejected: boolean;
    beforeAll(() => {
      const claim = (name: string, offset: number) =>
        defineNativePlugin({
          name,
          pre(context) {
            const content = provenance
              ? context.sourceSlice(offset, offset + 3)
              : context.source.slice(offset, offset + 3);
            expect(typeof content === 'string' ? content : content.text()).toBe('aaa');
            if (kind === 'helper') context.ensureHelper('shared/value', content);
            else context.ensureReplace('shared/value', 5, 8, content);
          },
        });
      try {
        const result = transform(
          'aaa; bbb;',
          'input.js',
          defineNativePipeline({
            phases: [
              { name: 'first', plugins: [claim('first-claimer', 0)] },
              {
                name: 'shift',
                plugins: [
                  defineNativePlugin({
                    name: 'shifter',
                    pre(context) {
                      context.editor.prepend('/*x*/');
                    },
                  }),
                ],
              },
              { name: 'last', plugins: [claim('last-claimer', 5)] },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        rejected = false;
      } catch (error) {
        expect(error).toBeInstanceOf(NativeTransformError);
        expect((error as Error).message).toMatch(/realized different content/);
        expect((error as NativeTransformError).owners).toEqual(['last-claimer', 'first-claimer']);
        rejected = true;
      }
    });
    (provenance ? test.fails : test)(
      'accepts identical text at changed offsets in later phases',
      () => {
        expect(rejected).toBe(false);
      },
    );
  });
}
