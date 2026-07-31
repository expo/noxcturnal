import transformTypeScript from '@babel/plugin-transform-typescript';
import { test } from 'vitest';

import { alignBabelTransform } from '../transform';

test('aligns TypeScript erasure and type-only imports with Babel', () => {
  alignBabelTransform({
    source: `import type { Input } from './types';
export const read = (input: Input): number => input.value;`,
    filename: 'input.ts',
    plugins: [[transformTypeScript, { allowNamespaces: true, isTSX: false }]],
    noxcturnal: { typescript: 'strip' },
  });
});

test('aligns TypeScript namespace runtime lowering with Babel', () => {
  alignBabelTransform({
    source: `namespace Values { export const answer: number = 42; }
globalThis.__result = Values.answer;`,
    filename: 'input.ts',
    plugins: [[transformTypeScript, { allowNamespaces: true, isTSX: false }]],
    noxcturnal: { typescript: 'strip' },
  });
});

test('aligns TSX type erasure while preserving JSX', () => {
  alignBabelTransform({
    source: `import type { Props } from './types';
export const View = (props: Props) => <Widget value={props.value} />;`,
    filename: 'input.tsx',
    plugins: [[transformTypeScript, { allowNamespaces: true, isTSX: true }]],
    noxcturnal: { typescript: 'strip', jsx: 'preserve' },
  });
});
