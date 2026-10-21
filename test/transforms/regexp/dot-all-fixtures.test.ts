import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'dotall regex — simple (input)',
    source: `var a = /./;
var b = /./s;
`,
    filename: 'input.js',
    output: `var a = /./;
var b = /[^]/;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpDotAll: true,
          },
        },
      },
    ],
  },
  {
    title: 'dotall regex — with unicode flag (input)',
    source: `var a = /./u;
var b = /./su;
`,
    filename: 'input.js',
    output: `var a = /./u;
var b = /[^]/u;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpDotAll: true,
          },
        },
      },
    ],
  },
  {
    title: 'dotall regex — with unicode property escape (input)',
    source: `var a = /\\p{Unified_Ideograph}./u;
var b = /\\p{Unified_Ideograph}./su;
`,
    filename: 'input.js',
    output: `var a = /\\p{Unified_Ideograph}./u;
var b = /\\p{Unified_Ideograph}[^]/u;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpDotAll: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
