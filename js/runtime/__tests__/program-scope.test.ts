import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import type { NativeScope } from '../../contracts/visitor';

test('a deep first lookup shares the program scope with later parent and sibling reads, per file', () => {
  const roots: NativeScope[] = [];
  let root: NativeScope | undefined;
  let visits = 0;
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'scan',
        plugins: [
          defineNativePlugin({
            name: 'program-scope',
            visitors: [
              defineVisitor('NumericLiteral', { scope: true }, path => {
                visits++;
                const program = path.scope.getProgramParent();
                if (root) expect(program).toBe(root);
                else roots.push((root = program));
                expect(program.parentId).toBeNull();
                expect(program.parent).toBeNull();
                expect(program.path?.type).toBe('Program');
                expect(program.getProgramParent()).toBe(program);
                let ancestor = path.scope;
                while (ancestor.parent) ancestor = ancestor.parent;
                expect(ancestor).toBe(program);
              }),
            ],
          }),
        ],
      },
    ],
  });
  const source = 'function outer(){function inner(){1;}} 2; function sibling(){3;}';
  for (const filename of ['first.js', 'second.js']) {
    root = undefined;
    visits = 0;
    expect(transform(source, filename, pipeline).status).toBe('complete');
    expect(visits).toBe(3);
  }
  expect(roots).toHaveLength(2);
  expect(roots[0]).not.toBe(roots[1]);
});
