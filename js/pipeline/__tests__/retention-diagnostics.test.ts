import assert from 'node:assert/strict';
import { test } from 'vitest';

import { defineNativePlugin, definePipelinePhase, defineVisitor } from '../../index';
import { inspectPreparedPhaseRetention } from '../routes';

function inspect(visitor: ReturnType<typeof defineVisitor>) {
  return inspectPreparedPhaseRetention(
    definePipelinePhase({
      name: 'retention',
      plugins: [defineNativePlugin({ name: 'fixture', visitors: [visitor] })],
    }),
  );
}

test('a shallow parameter wildcard indexes only its container parent', () => {
  const diagnostic = inspect(
    defineVisitor(
      'FormalParameters',
      { children: { '*': { route: 'FormalParameter|FormalParameterRest' } } },
      () => {},
    ),
  );
  assert.deepEqual(diagnostic.structuralParentTypes, ['FormalParameters']);
  assert.deepEqual(diagnostic.wildcardParents, ['FormalParameters']);
  assert.equal(diagnostic.includesEveryConcreteType, false);
});

test('a nested all-node wildcard exposes its all-concrete retention cliff', () => {
  const diagnostic = inspect(
    defineVisitor(
      'FormalParameters',
      {
        children: {
          '*': { route: '*', children: { '*': { route: '*' } } },
        },
      },
      () => {},
    ),
  );
  assert.equal(diagnostic.includesEveryConcreteType, true);
  assert.ok(diagnostic.structuralParentTypeCount > 100);
});

test('named declaration and binding roles retain only their concrete parents', () => {
  const diagnostic = inspect(
    defineVisitor(
      'VariableDeclaration',
      {
        children: {
          declarations: {
            route: 'VariableDeclarator',
            children: {
              id: {
                route: 'ObjectPattern',
                children: {
                  properties: {
                    route: 'BindingProperty',
                    children: { value: { route: 'Identifier', fields: ['name'] } },
                  },
                },
              },
              init: { route: 'Expression', fields: ['staticArgument'] },
            },
          },
        },
      },
      () => {},
    ),
  );
  assert.deepEqual(diagnostic.structuralParentTypes, [
    'BindingProperty',
    'ObjectPattern',
    'VariableDeclaration',
    'VariableDeclarator',
  ]);
  assert.deepEqual(diagnostic.childRoles.VariableDeclarator, ['id', 'init']);
  assert.deepEqual(diagnostic.wildcardParents, []);
  assert.deepEqual(diagnostic.scalarFields.Identifier, ['name']);
  assert.deepEqual(diagnostic.scalarFields.ImportExpression, ['staticArgument']);
  assert.equal(diagnostic.scalarFields.Identifier?.includes('staticArgument'), false);
});
