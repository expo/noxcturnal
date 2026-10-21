import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'basic — basic (input)',
    source: `/[[0-7]&&[5-9]]\\u{10FFFF}/v;
`,
    filename: 'input.js',
    output: '/[\\u0035-\\u0037]\\u{10FFFF}/u;',
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
      },
    ],
  },
  {
    title: 'basic — string properties (input)',
    source: `/\\p{Emoji_Keycap_Sequence}/v
`,
    filename: 'input.js',
    output: '/(?:\\*️⃣|#️⃣|0️⃣|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣)/u;',
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
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
