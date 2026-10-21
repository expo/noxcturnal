import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'export namespace — namespace default (input)',
    source: `export * as default from "foo";
`,
    filename: 'input.mjs',
    output: `import * as _default from 'foo';
export { _default as default };`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exportNamespaceFrom: true,
          },
        },
      },
    ],
  },
  {
    title: 'export namespace — namespace es6 (input)',
    source: `export * as foo from "bar";
`,
    filename: 'input.mjs',
    output: `import * as _foo from 'bar';
export { _foo as foo };`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exportNamespaceFrom: true,
          },
        },
      },
    ],
  },
  {
    title: 'export namespace — namespace string (input)',
    source: `export * as "some exports" from "foo";
`,
    filename: 'input.mjs',
    output: `import * as _someExports from 'foo';
export { _someExports as 'some exports' };`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            exportNamespaceFrom: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
