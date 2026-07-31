import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = ["var re = new RegExp('o+', 'y');", 'var re = /o+/;'] as const;

export const fixtureCases = [
  {
    title: 'sticky regex — basic (input)',
    source: 'var re = /o+/y;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpSticky: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'sticky regex — ignore non sticky (input)',
    source: 'var re = /o+/;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpSticky: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
