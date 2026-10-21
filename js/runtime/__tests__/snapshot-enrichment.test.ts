import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

for (const retained of [false, true]) {
  test(`snapshot selects declared fields and preserves earlier snapshots: retained=${retained}`, () => {
    let visits = 0;
    let saved: Readonly<Record<string, unknown>> | undefined;
    const visitor = defineVisitor(
      'NumericLiteral',
      { scope: retained, fields: ['value'] },
      path => {
        visits++;
        const before = path.snapshot({ fields: [] });
        expect(Object.hasOwn(before, 'value')).toBe(false);
        saved = path.snapshot({ fields: ['value'] });
        expect(saved.value).toBe(3);
        expect(Object.isFrozen(saved)).toBe(true);
        expect(Object.hasOwn(before, 'value')).toBe(false);
        expect(Reflect.get(path.snapshot({ fields: ['value'] }), 'value')).toBe(3);
        expect(Object.hasOwn(path.snapshot({ fields: [] }), 'value')).toBe(false);
      },
    );
    expect(
      transform(
        '3;',
        'input.js',
        defineNativePipeline({
          phases: [
            {
              name: 'scan',
              plugins: [defineNativePlugin({ name: 'snapshot', visitors: [visitor] })],
            },
          ],
        }),
      ).status,
    ).toBe('complete');
    expect(visits).toBe(1);
    expect(saved?.value).toBe(3);
  });

  test(`snapshot rejects unknown fields before enrichment: retained=${retained}`, () => {
    let visits = 0;
    const visitor = defineVisitor('NumericLiteral', { scope: retained }, path => {
      visits++;
      expect(() => path.snapshot({ fields: ['value', 'notAField'] })).toThrow(
        'unknown snapshot field notAField',
      );
      expect(Object.hasOwn(path.snapshot(), 'value')).toBe(false);
      if (retained) {
        expect(Reflect.get(path.snapshot({ fields: ['value'] }), 'value')).toBeUndefined();
      } else {
        expect(() => path.snapshot({ fields: ['value'] })).toThrow(
          'undeclared-retention-capability: inspection',
        );
      }
      // Explicit snapshot selection does not widen the typed visitor view.
      // @ts-expect-error value was not declared on this visitor
      void path.node.value;
    });
    expect(
      transform(
        '3;',
        'input.js',
        defineNativePipeline({
          phases: [
            {
              name: 'scan',
              plugins: [defineNativePlugin({ name: 'snapshot', visitors: [visitor] })],
            },
          ],
        }),
      ).status,
    ).toBe('complete');
    expect(visits).toBe(1);
  });
}
