import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'sticky regex — basic (input)',
    source: `var re = /o+/y;
`,
    filename: 'input.js',
    output: "var re = new RegExp('o+', 'y');",
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpSticky: true,
          },
        },
      },
    ],
  },
  {
    title: 'sticky regex — ignore non sticky (input)',
    source: `var re = /o+/;
`,
    filename: 'input.js',
    output: 'var re = /o+/;',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpSticky: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
