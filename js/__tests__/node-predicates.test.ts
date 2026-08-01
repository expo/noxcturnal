import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  isExpression,
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

test('node predicates narrow node-like values and generic routes remain available', () => {
  const statement = { type: 'ReturnStatement', value: 1 };
  const expression = { type: 'CallExpression', value: 2 };

  assert.equal(isStatement(statement), true);
  assert.equal(isExpression(expression), true);
  assert.equal(isNodeType(expression, 'Expression'), true);
  assert.equal(isNodeType(expression, 'Statement'), false);
  assert.equal(isNodeType(expression, 'CallExpression'), true);
});
