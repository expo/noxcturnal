import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  isExpression,
  isDeclaration,
  isFunctionType,
  isMemberExpressionType,
  isNodeType,
  isStatement,
  isStatementType,
} from '../index';

test('specialized node predicates match generated alias expansions', () => {
  assert.equal(isStatementType('ExpressionStatement'), true);
  assert.equal(isStatementType('VariableDeclaration'), true);
  assert.equal(isStatementType('Function'), true);
  assert.equal(isStatementType('Class'), true);
  assert.equal(isStatementType('CallExpression'), false);
  assert.equal(isFunctionType('ArrowFunctionExpression'), true);
  assert.equal(isMemberExpressionType('PrivateFieldExpression'), true);
});

test('ambient function declarations remain declarations and statements', () => {
  const node = { type: 'Function', nodeKind: 'TSDeclareFunction' };
  assert.equal(isExpression(node), false);
  assert.equal(isDeclaration(node), true);
  assert.equal(isStatement(node), true);
  assert.equal(isNodeType(node, 'Declaration'), true);
  assert.equal(isNodeType(node, 'Statement'), true);
});

test.each(['Function', 'Class'])(
  '%s node predicates distinguish declarations and expressions',
  type => {
    for (const kind of ['Declaration', 'Expression', undefined]) {
      const node = { type, nodeKind: kind === undefined ? undefined : `${type}${kind}` };
      assert.equal(isExpression(node), kind === 'Expression');
      assert.equal(isDeclaration(node), kind === 'Declaration');
      assert.equal(isStatement(node), kind === 'Declaration');
      assert.equal(isNodeType(node, 'Expression'), kind === 'Expression');
      assert.equal(isNodeType(node, 'Declaration'), kind === 'Declaration');
      assert.equal(isNodeType(node, 'Statement'), kind === 'Declaration');
    }
  },
);

test('node predicates narrow node-like values and generic routes remain available', () => {
  const statement = { type: 'ReturnStatement', value: 1 };
  const expression = { type: 'CallExpression', value: 2 };

  assert.equal(isStatement(statement), true);
  assert.equal(isExpression(expression), true);
  assert.equal(isNodeType(expression, 'Expression'), true);
  assert.equal(isNodeType(expression, 'Statement'), false);
  assert.equal(isNodeType(expression, 'CallExpression'), true);
});
