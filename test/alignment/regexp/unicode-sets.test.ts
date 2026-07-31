import unicodeSetsRegex from '@babel/plugin-transform-unicode-sets-regex';
import { test } from 'vitest';

import { expectBabelSupportedNoxcturnalBailout } from '../transform';

test('records the Unicode-sets boundary against Babel', () => {
  expectBabelSupportedNoxcturnalBailout(
    {
      source: `const expression = /^[\\p{ASCII}&&\\p{Letter}]+$/v; globalThis.__result = [expression.test('abc'), expression.test('123')];`,
      filename: 'input.js',
      plugins: [unicodeSetsRegex],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpUnicodeSets: true } },
    },
    'alignment:regexp-unicode-sets-semantic-mismatch',
  );
});
