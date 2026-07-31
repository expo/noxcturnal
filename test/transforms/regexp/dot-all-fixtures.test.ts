import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  'var a = /./;\nvar b = /[^]/;',
  'var a = /./u;\nvar b = /[^]/u;',
  'var a = /\\p{Unified_Ideograph}./u;\nvar b = /\\p{Unified_Ideograph}[^]/u;',
] as const;

export const fixtureCases = [
  {
    title: 'dotall regex — simple (input)',
    source: 'var a = /./;\nvar b = /./s;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpDotAll: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'dotall regex — with unicode flag (input)',
    source: 'var a = /./u;\nvar b = /./su;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpDotAll: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'dotall regex — with unicode property escape (input)',
    source: 'var a = /\\p{Unified_Ideograph}./u;\nvar b = /\\p{Unified_Ideograph}./su;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpDotAll: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
