import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "import * as _default from 'foo';\nexport { _default as default };",
  "import * as _foo from 'bar';\nexport { _foo as foo };",
  "import * as _someExports from 'foo';\nexport { _someExports as 'some exports' };",
] as const;

export const fixtureCases = [
  {
    title: 'export namespace — namespace default (input)',
    source: 'export * as default from "foo";\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exportNamespaceFrom: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'export namespace — namespace es6 (input)',
    source: 'export * as foo from "bar";\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exportNamespaceFrom: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'export namespace — namespace string (input)',
    source: 'export * as "some exports" from "foo";\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exportNamespaceFrom: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
