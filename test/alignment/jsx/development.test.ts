import reactJsxDevelopment from '@babel/plugin-transform-react-jsx-development';
import { test } from 'vitest';

import { alignBabelTransform } from '../transform';

test('aligns classic development JSX with Babel', () => {
  alignBabelTransform({
    source: `const view = <Widget value={42} />;`,
    filename: 'input.jsx',
    plugins: [[reactJsxDevelopment, { runtime: 'classic' }]],
    noxcturnal: { jsx: 'classic-development' },
  });
});
