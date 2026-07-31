import namedCaptureGroups from '@babel/plugin-transform-named-capturing-groups-regex';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns named capture groups and backreferences with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `const match = /(?<word>a+)\\k<word>/.exec('aaaa'); globalThis.__result = [match[0], match.groups.word];`,
      filename: 'input.js',
      plugins: [namedCaptureGroups],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpNamedCaptureGroups: true } },
      output: { mustNotMatch: [/\(\?<word>/, /\\k<word>/] },
    }),
  ).resolves.toEqual(['aaaa', 'aa']);
});
