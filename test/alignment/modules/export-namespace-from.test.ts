import exportNamespaceFrom from 'babel-preset-expo/build/plugins/babel-plugin-transform-export-namespace-from';
import { test } from 'vitest';

import { alignBabelTransform } from '../transform';

test('aligns export namespace lowering with Babel', () => {
  alignBabelTransform({
    source: `export * as helpers from './helpers';`,
    filename: 'input.js',
    plugins: [exportNamespaceFrom],
    noxcturnal: { transforms: { exportNamespaceFrom: true } },
  });
});

test('aligns namespace import binding allocation with existing and generated names', () => {
  alignBabelTransform({
    source: `const _helpers = 1;
export * as helpers from './helpers';
export * as other from './other';`,
    filename: 'input.js',
    plugins: [exportNamespaceFrom],
    noxcturnal: { transforms: { exportNamespaceFrom: true } },
  });
});

// Babel's transform currently drops the with-clause and can therefore load a
// different module type. Keep the comparison executable until Babel preserves
// it, at which point this becomes ordinary alignment coverage.
test.fails('records Babel divergence for namespace export import attributes', () => {
  alignBabelTransform({
    source: `export * as data from './data.json' with { type: 'json' };`,
    filename: 'input.mjs',
    plugins: [exportNamespaceFrom],
    noxcturnal: { transforms: { exportNamespaceFrom: true } },
  });
});
