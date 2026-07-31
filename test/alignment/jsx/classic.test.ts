import reactJsx from '@babel/plugin-transform-react-jsx';
import { expect, test } from 'vitest';

import { alignBabelBehavior, alignBabelTransform } from '../transform';

test('aligns classic JSX with Babel', () => {
  alignBabelTransform({
    source: `const view = <section id="value">text<span /></section>;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { runtime: 'classic' }]],
    noxcturnal: { jsx: 'classic' },
  });
});

test('aligns classic JSX pragmas with Babel', () => {
  alignBabelTransform({
    source: `/** @jsx h */ /** @jsxFrag Fragment */
const view = <><Widget /></>;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { pragma: 'h', pragmaFrag: 'Fragment', runtime: 'classic' }]],
    noxcturnal: { jsx: 'classic', jsxPragma: 'h', jsxPragmaFrag: 'Fragment' },
  });
});

test('aligns classic JSX attribute, spread, and child evaluation order with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const calls = [];
const read = value => (calls.push(value), value);
const spread = () => (calls.push('spread'), { middle: 2 });
const view = <Widget first={read('first')} {...spread()} last={read('last')}>
  first line
  second line {read('child')}
  <span />
</Widget>;
globalThis.__result = [view, calls];`,
      filename: 'input.jsx',
      plugins: [[reactJsx, { runtime: 'classic' }]],
      noxcturnal: { jsx: 'classic', helpers: { mode: 'inline' } },
      globals: () => ({
        Widget: 'Widget',
        React: {
          createElement(type: unknown, props: unknown, ...children: unknown[]) {
            return { type, props, children };
          },
        },
      }),
      output: { mustNotMatch: [/<Widget|<span/] },
    }),
  ).resolves.toEqual([
    {
      type: 'Widget',
      props: { first: 'first', middle: 2, last: 'last' },
      children: ['first line second line ', 'child', { type: 'span', props: null, children: [] }],
    },
    ['first', 'spread', 'last', 'child'],
  ]);
});
