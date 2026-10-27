import { expect, test, vi } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import type { NativeBinding } from '../../contracts/visitor';
import { native } from '../../native/binding';

for (const first of ['single', 'batch'] as const)
  test(`${first} lookup shares binding facts with subsequent single and batch requests`, () => {
    const single = vi.spyOn(native.NativeIndexedSession.prototype, 'queryBindings');
    const batch = vi.spyOn(native.NativeIndexedSession.prototype, 'queryBindingsBatch');
    let visits = 0;
    const source = 'let shared=0; shared++; function inner(shared){shared++; return shared;}';
    const plugin = defineNativePlugin({
      name: 'shared-binding-cache',
      visitors: [
        defineVisitor('Identifier', { fields: ['name'], scope: true }, path => {
          if (path.node.name !== 'shared') return;
          const binding =
            first === 'single'
              ? path.scope.getBinding('shared')!
              : path.scope.getBindings(['shared'])[0]!;
          expect(binding.global).toBe(false);
          expect(binding.references).toHaveLength(binding.scope!.id === 0 ? 1 : 2);
          expect(
            binding.references.every(
              reference => source.slice(reference.start, reference.end) === 'shared',
            ),
          ).toBe(true);
          const repeated = path.scope.getBindings(['shared', 'absent', 'shared']);
          expect(repeated).toHaveLength(2);
          expect(repeated[0]).not.toBe(binding);
          expect(repeated[1]).not.toBe(repeated[0]);
          expect(repeated[0].references).toBe(binding.references);
          expect(repeated[1].references).toBe(binding.references);
          expect(path.scope.getBinding('shared')!.references).toBe(binding.references);
          expect(path.scope.getBinding('absent')).toBeNull();
          visits++;
        }),
      ],
    });
    try {
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({
          phases: [
            {
              name: 'scan',
              plugins: [
                plugin,
                defineNativePlugin({
                  name: 'second-reader',
                  visitors: [
                    defineVisitor('Program', { scope: true }, path => {
                      const binding = path.scope.getBinding('shared')!;
                      expect(binding.references).toHaveLength(1);
                      expect(binding.declaration?.start).toBe(source.indexOf('shared'));
                    }),
                  ],
                }),
              ],
            },
          ],
        }),
      );
      expect(result.status).toBe('complete');
      expect(visits).toBe(5);
      // Program warms the outer binding; both APIs then share one hydration for
      // that declaration and one for the shadowing parameter, across plugins.
      expect(single.mock.calls.length + batch.mock.calls.length).toBe(2);
      expect(single.mock.calls).toHaveLength(first === 'single' ? 2 : 1);
      expect(batch.mock.calls).toHaveLength(first === 'single' ? 0 : 1);
    } finally {
      single.mockRestore();
      batch.mockRestore();
    }
  });

test('binding views keep lazy owner paths and scopes local to their visitor runtime', () => {
  const seen: NativeBinding[] = [];
  const plugins = ['first', 'second'].map(name =>
    defineNativePlugin({
      name,
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          const binding = path.scope.getBinding('shared')!;
          expect(binding.name).toBe('shared');
          expect(binding.global).toBe(false);
          expect(binding.scope).toBe(path.scope);
          const owner = binding.path!;
          expect(owner.type).toBe('VariableDeclarator');
          expect(binding.path).toBe(owner);
          expect(() => owner.stop()).toThrow(`${name}: undeclared control-flow capability stop`);
          for (const previous of seen) {
            expect(binding).not.toBe(previous);
            expect(binding.path).not.toBe(previous.path);
            expect(binding.scope).not.toBe(previous.scope);
            expect(binding.references).toBe(previous.references);
          }
          seen.push(binding);
        }),
      ],
    }),
  );
  const result = transform(
    'let shared=0; shared++;',
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'read', plugins }],
    }),
  );
  expect(result.status).toBe('complete');
  expect(seen).toHaveLength(2);
});

test('binding caches observe immutable phase input and refresh after a binding edit', () => {
  const observations: string[] = [];
  const reader = (name: string, rename = false) =>
    defineNativePlugin({
      name,
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          const binding = path.scope.getBinding('shared');
          if (binding) {
            observations.push(`${name}:${binding.name}:${binding.references.length}`);
            if (rename) path.scope.rename('shared', 'renamed');
          } else {
            const renamed = path.scope.getBindings(['renamed'])[0]!;
            observations.push(`${name}:${renamed.name}:${renamed.references.length}`);
          }
        }),
      ],
    });
  const result = transform(
    'let shared=0; shared++;',
    'input.js',
    defineNativePipeline({
      phases: [
        { name: 'edit', plugins: [reader('rename', true), reader('same-phase')] },
        { name: 'observe', plugins: [reader('next-phase')] },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toBe('let renamed=0; renamed++;');
  expect(observations).toEqual(['rename:shared:1', 'same-phase:shared:1', 'next-phase:renamed:1']);
});

test('reusing a pipeline never shares cached binding facts across source files', () => {
  let references = 0;
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'scan',
        plugins: [
          defineNativePlugin({
            name: 'file-local-cache',
            visitors: [
              defineVisitor('Program', { scope: true }, path => {
                references = path.scope.getBinding('shared')!.references.length;
                expect(path.scope.getBindings(['shared'])[0].references).toHaveLength(references);
              }),
            ],
          }),
        ],
      },
    ],
  });
  for (const count of [1, 3]) {
    const result = transform(`let shared=0; ${'shared++;'.repeat(count)}`, `${count}.js`, pipeline);
    expect(result.status).toBe('complete');
    expect(references).toBe(count);
  }
});
