import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePlugin, defineNativePipeline, defineVisitor, transform } from '../../index';
for (const retained of [false, true])
  for (const explicitFields of [false, true])
    describe.each(['none', 'parent'] as const)(
      `retained=${retained} explicit fields=${explicitFields} ancestry=%s`,
      ancestry => {
        let hasParent: boolean;
        beforeAll(() => {
          let visits = 0;
          const visitor = defineVisitor(
            'NumericLiteral',
            { scope: retained, fields: ['value'], ancestry: { mode: 'parent' } },
            p => {
              visits++;
              const snapshot = p.snapshot({
                ancestry,
                ...(explicitFields ? { fields: ['value'] } : {}),
              });
              expect(snapshot.value).toBe(3);
              expect(Object.isFrozen(snapshot)).toBe(true);
              hasParent =
                Object.hasOwn(snapshot, 'parentId') || Object.hasOwn(snapshot, 'parentType');
              if (ancestry === 'parent') {
                expect(Reflect.get(snapshot, 'parentId')).toBe(p.parent?.id);
                expect(Reflect.get(snapshot, 'parentType')).toBe('VariableDeclarator');
              }
            },
          );
          expect(
            transform(
              'const x=3;',
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
        (!explicitFields && ancestry === 'none' ? test.fails : test)(
          'honors ancestry selection independently of scalar selection',
          () => expect(hasParent).toBe(ancestry === 'parent'),
        );
      },
    );
