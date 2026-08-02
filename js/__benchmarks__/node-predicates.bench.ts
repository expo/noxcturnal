import { bench } from 'vitest';

import { isNodeType, isStatementType } from '../index';

const types = Array.from({ length: 1_000 }, (_, index) =>
  index % 4 === 0
    ? 'ExpressionStatement'
    : index % 4 === 1
      ? 'VariableDeclaration'
      : index % 4 === 2
        ? 'CallExpression'
        : 'Identifier',
);

bench('direct Statement type predicate over 1,000 type strings', () => {
  let matches = 0;
  for (const type of types) matches += Number(isStatementType(type));
  return matches;
});

const nodes = types.map(type => ({ type }));

bench('generic route API over 1,000 existing nodes', () => {
  let matches = 0;
  for (const node of nodes) matches += Number(isNodeType(node, 'Statement'));
  return matches;
});

const ancestorTypes = [
  'Identifier',
  'CallExpression',
  'ExpressionStatement',
  'BlockStatement',
  'TryStatement',
];

bench('Statement predicate in an ancestor walk', () => {
  let matches = 0;
  for (let iteration = 0; iteration < 1_000; iteration++) {
    for (const type of ancestorTypes) {
      if (isStatementType(type)) matches++;
    }
  }
  return matches;
});
