import flowStripTypes from '@babel/plugin-transform-flow-strip-types';
import flowEnums from 'babel-plugin-transform-flow-enums';
import { test } from 'vitest';

import { alignBabelTransform } from '../transform';

const plugins = [flowEnums, flowStripTypes];

test('aligns mirrored Flow enums with Babel', () => {
  alignBabelTransform({
    source: `// @flow
enum Status { Active, Off }`,
    filename: 'input.js',
    plugins,
    noxcturnal: {},
  });
});

test('aligns initialized string and number enums with Babel', () => {
  alignBabelTransform({
    source: `// @flow
enum Suit of string { Hearts = 'h', Spades = 's' }
enum Code of number { Ok = 200, Missing = 404 }`,
    filename: 'input.js',
    plugins,
    noxcturnal: {},
  });
});

test('aligns symbol enums with Hermes', () => {
  alignBabelTransform({
    source: `// @flow
enum Token of symbol { Start, End }`,
    filename: 'input.js',
    plugins,
    noxcturnal: {},
  });
});
