import assert from 'node:assert/strict';
import { test } from 'vitest';

import { alias, array, expandSubscriptions, querySubscriptions } from '../route-utils';

test('normalizes route aliases and subscription sets', () => {
  assert.equal(alias('*', 'Identifier'), true);
  assert.equal(alias('Expression', 'Identifier'), true);
  assert.equal(alias('Function', 'Identifier'), false);
  assert.deepEqual(array('Identifier'), ['Identifier']);
  assert.deepEqual(array(['Identifier', 'CallExpression']), ['Identifier', 'CallExpression']);
  assert.deepEqual(expandSubscriptions(['Identifier|Expression', 'Identifier']), [
    'Identifier',
    'Expression',
  ]);
});

test('maps coarse module queries to their concrete subscriptions', () => {
  assert.deepEqual(querySubscriptions({}), []);
  assert.deepEqual(querySubscriptions({ imports: true }), [
    'ImportDeclaration',
    'ImportSpecifier',
    'ImportDefaultSpecifier',
    'ImportNamespaceSpecifier',
  ]);
  assert.deepEqual(querySubscriptions({ exports: true }), [
    'ExportNamedDeclaration',
    'ExportDefaultDeclaration',
    'ExportAllDeclaration',
    'ExportSpecifier',
  ]);
});
