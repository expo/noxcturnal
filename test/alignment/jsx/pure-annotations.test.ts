import reactJsx from '@babel/plugin-transform-react-jsx';
import reactPureAnnotations from '@babel/plugin-transform-react-pure-annotations';
import { expect, test } from 'vitest';

import { alignBabelTransform } from '../transform';

test('aligns production JSX structure with Babel pure annotations enabled', () => {
  const result = alignBabelTransform({
    source: `const view = <Widget value={42} />;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { pure: true, runtime: 'classic' }], reactPureAnnotations],
    noxcturnal: { jsx: 'classic' },
  });
  expect(result.babel).toMatch(/[@#]__PURE__/);
  expect(result.noxcturnal).toMatch(/[@#]__PURE__/);
});
