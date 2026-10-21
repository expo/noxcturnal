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

test('aligns Unicode escapes in group names with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`const match = /(?<\u0061>x)\k<\u0061>/.exec('xx');
globalThis.__result = [match[0], match.groups.a, Object.keys(match.groups)];`,
      filename: 'input.js',
      plugins: [namedCaptureGroups],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpNamedCaptureGroups: true } },
      output: { mustNotMatch: [/\(\?</, /\\k</] },
    }),
  ).resolves.toEqual(['xx', 'x', ['a']]);
});

test('aligns named groups across replace callbacks, matchAll, and indices', async () => {
  await expect(
    alignBabelBehavior({
      source: String.raw`
        const expression = /(?<required>x)(?<optional>y)?/dg;
        const matches = [...'x xy'.matchAll(expression)];
        const stringReplacement = 'xy'.replace(expression, '$<optional>-$<required>');
        const callbackReplacement = 'xy'.replace(expression, (...args) => {
          const groups = args.at(-1);
          return Object.keys(groups).join(',') + ':' + groups.required;
        });
        globalThis.__result = [
          stringReplacement,
          callbackReplacement,
          matches.map(match => [
            match.groups.required,
            match.groups.optional,
            match.indices.groups.required,
            match.indices.groups.optional,
          ]),
          expression.source,
          expression.flags,
        ];
      `,
      filename: 'input.js',
      plugins: [namedCaptureGroups],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { regexpNamedCaptureGroups: true } },
      output: { mustNotMatch: [/\(\?<required>/, /\(\?<optional>/] },
    }),
  ).resolves.toEqual([
    'y-x',
    'required,optional:x',
    [
      ['x', undefined, [0, 1], undefined],
      ['x', 'y', [2, 3], [3, 4]],
    ],
    '(x)(y)?',
    'dg',
  ]);
});
