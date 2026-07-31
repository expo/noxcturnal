import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  '/[\\u0035-\\u0037]\\u{10FFFF}/u;',
  '/(?:\\*️⃣|#️⃣|0️⃣|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣)/u;',
] as const;

export const fixtureCases = [
  {
    title: 'basic — basic (input)',
    source: '/[[0-7]&&[5-9]]\\u{10FFFF}/v;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodeSets: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'basic — string properties (input)',
    source: '/\\p{Emoji_Keycap_Sequence}/v\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodeSets: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
