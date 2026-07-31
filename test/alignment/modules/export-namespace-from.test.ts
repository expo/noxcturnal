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
