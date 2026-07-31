import syntaxHermesParser from 'babel-plugin-syntax-hermes-parser';
import { test } from 'vitest';

import { expectBabelSupportedNoxcturnalBailout } from '../transform';

test('records the Flow record fallback against Hermes', () => {
  expectBabelSupportedNoxcturnalBailout(
    {
      source: `// @flow
const value = R { field: 1 };`,
      filename: 'input.js',
      plugins: [[syntaxHermesParser, { parseLangTypes: 'flow' }]],
      noxcturnal: {},
    },
    'flow-requires-parser-adapter',
  );
});

test('records the decorated Flow class fallback against Hermes', () => {
  expectBabelSupportedNoxcturnalBailout(
    {
      source: `// @flow
class Example { @dec value: number = 1; }`,
      filename: 'input.js',
      plugins: [[syntaxHermesParser, { parseLangTypes: 'flow' }]],
      noxcturnal: {},
    },
    'flow-requires-parser-adapter',
  );
});
