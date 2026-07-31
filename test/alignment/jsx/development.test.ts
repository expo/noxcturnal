import reactJsxDevelopment from '@babel/plugin-transform-react-jsx-development';
import { test } from 'vitest';

import { alignBabelTransform } from '../transform';

test('aligns classic development JSX with Babel', () => {
  alignBabelTransform({
    source: `const view = <Widget value={42} />;`,
    filename: 'input.jsx',
    plugins: [[reactJsxDevelopment, { runtime: 'classic' }]],
    noxcturnal: { jsx: 'classic-development', helpers: { mode: 'inline' } },
  });
});

test('aligns injected development metadata after user props and spreads', () => {
  alignBabelTransform({
    source: `const view = <Widget __self={read('self')} {...read('spread')} __source={read('source')} />;`,
    filename: 'input.jsx',
    plugins: [[reactJsxDevelopment, { runtime: 'classic' }]],
    noxcturnal: { jsx: 'classic-development', helpers: { mode: 'inline' } },
  });
});
