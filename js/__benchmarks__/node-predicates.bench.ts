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

bench('specialized Statement predicate over 1,000 node types', () => {
  let matches = 0;
  for (const type of types) matches += Number(isStatementType(type));
  return matches;
});

bench('generic Statement predicate over 1,000 nodes', () => {
  let matches = 0;
  for (const type of types) matches += Number(isNodeType({ type }, 'Statement'));
  return matches;
});
