import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test('scope methods retain their owner when extracted, including edits and generated names', () => {
  let visits = 0;
  const result = transform(
    'let value=1; function target(parameter){return value+parameter+external;}',
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'edit',
          plugins: [
            defineNativePlugin({
              name: 'detached-scope-methods',
              visitors: [
                defineVisitor('FunctionDeclaration', { scope: true }, path => {
                  visits++;
                  const scope = path.scope;
                  const {
                    hasBinding,
                    hasGlobal,
                    getBinding,
                    getBindings,
                    getProgramParent,
                    generateUid,
                    rename,
                  } = scope;
                  expect(hasBinding('parameter')).toBe(true);
                  expect(hasBinding('missing')).toBe(false);
                  expect(hasGlobal('external')).toBe(true);
                  expect(hasGlobal('missing')).toBe(false);
                  expect(getBinding('parameter')!.scope).toBe(scope);
                  expect(getBinding('value')!.scope).toBe(getProgramParent());
                  expect(
                    getBindings(['parameter', 'value', 'missing']).map(binding => binding.name),
                  ).toEqual(['parameter', 'value']);
                  const first = generateUid('temp');
                  const second = generateUid('temp');
                  expect(first).not.toBe(second);
                  expect(rename('parameter', 'renamedParameter')).toBe('renamedParameter');
                  expect(scope.parent).toBe(getProgramParent());
                  expect(scope.path?.type).toBe('Function');
                }),
              ],
            }),
          ],
        },
      ],
    }),
  );
  expect(visits).toBe(1);
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toContain('function target(renamedParameter)');
  expect(new Function('external', result.code + ';return target(2);')(3)).toBe(6);
});
