import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  {
    name: 'function',
    binding: 'outer',
    source: 'function outer(){function inner(){return 3;}}',
    scope: 0,
    parent: null,
    fails: true,
  },
  {
    name: 'class',
    binding: 'Outer',
    source: 'class Outer{method(){return 3;}}',
    scope: 0,
    parent: null,
    fails: true,
  },
  {
    name: 'variable',
    binding: 'outer',
    source: 'const outer=1; function inner(){return 3;}',
    scope: 0,
    parent: null,
    fails: false,
  },
  {
    name: 'nested function',
    binding: 'outer',
    source: 'function owner(){function outer(){function inner(){return 3;}}}',
    scope: 1,
    parent: 0,
    fails: true,
  },
];
for (const bulk of [false, true])
  for (const warm of [false, true])
    describe.each(cases)(`bulk=${bulk} warm=${warm}: $name`, entry => {
      let parentId: number | null;
      let parent: number | null;
      beforeAll(() => {
        let visits = 0;
        const plugin = defineNativePlugin({
          name: 'binding-scope-parent',
          visitors: [
            defineVisitor('NumericLiteral', { scope: true, fields: ['value'] }, path => {
              if (path.node.value !== 3) return;
              visits++;
              if (warm) expect(path.scope.getProgramParent().parent).toBeNull();
              const binding = bulk
                ? path.scope.getBindings([entry.binding])[0]
                : path.scope.getBinding(entry.binding);
              expect(binding?.global).toBe(false);
              expect(binding?.scope?.id).toBe(entry.scope);
              parentId = binding!.scope!.parentId;
              // Read only one parent; traversing the defective chain would never terminate.
              parent = binding!.scope!.parent?.id ?? null;
            }),
          ],
        });
        expect(
          transform(
            entry.source,
            'input.js',
            defineNativePipeline({
              phases: [{ name: 'read', plugins: [plugin] }],
            }),
          ).status,
        ).toBe('complete');
        expect(visits).toBe(1);
      });
      (entry.fails && !warm ? test : test)('binding scope retains its lexical parent', () => {
        expect([parentId, parent]).toEqual([entry.parent, entry.parent]);
      });
    });
