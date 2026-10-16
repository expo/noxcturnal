import { createRequire } from 'node:module';
import path from 'node:path';
import { expect, test } from 'vitest';
import flowStripTypes from '@babel/plugin-transform-flow-strip-types';
import babel from '@babel/core';
import explicitResourceManagement from '@babel/plugin-transform-explicit-resource-management';
import syntaxHermesParser from 'babel-plugin-syntax-hermes-parser';

import cases from '../../fixtures/flow-parser-update/cases.json';
import {
  alignBabelBehavior,
  alignHermesFlowTransform,
  expectBabelSupportedNoxcturnalBailout,
} from '../transform';

const require = createRequire(import.meta.url);
type Parser = NonNullable<Parameters<typeof alignHermesFlowTransform>[2]>;
const references: { name: string; parser: Parser; exact: boolean }[] = [
  { name: 'hermes-parser 0.36.0', parser: require('hermes-parser'), exact: false },
];
// The supplemental source-built suite is run by the documented step-2 command.
// Normal checks retain the published pinned-reference suite.
if (process.env.HERMES_UPDATE_REFERENCE) {
  const directory = path.resolve(process.env.HERMES_UPDATE_REFERENCE);
  const identity = require(path.join(directory, 'identity.json'));
  expect(identity.revision).toBe('17b37301da5da4a2cd55d78f9697c46c0fd96123');
  references.push({
    name: `Hermes ${identity.revision}`,
    exact: true,
    parser: await require(path.join(directory, 'initialize.cjs'))(),
  });
}

test('Hermes 0.36.0 and native variance fields execute with equivalent initialization and descriptors', async () => {
  await expect(
    alignBabelBehavior({
      source: `// @flow
      const calls = [];
      class Fields {
        static readonly first: number = (calls.push('static'), 1);
        readonly second: number = (calls.push('instance'), 2);
        writeonly third: number = 3;
      }
      const fields = new Fields();
      fields.second++;
      globalThis.__result = [calls, Fields.first, fields.second, fields.third,
        Object.getOwnPropertyDescriptor(fields, 'second')];`,
      filename: 'input.js',
      plugins: [[syntaxHermesParser, { parseLangTypes: 'flow' }], flowStripTypes],
      noxcturnal: {},
      output: { mustNotMatch: [/\breadonly\b/, /\bwriteonly\b/, /: number/] },
    }),
  ).resolves.toEqual([
    ['static', 'instance'],
    1,
    3,
    3,
    { configurable: true, enumerable: true, value: 3, writable: true },
  ]);
});

test('Hermes 0.36.0 resource-loop ASTs and native Flow lowering preserve synchronous disposal', async () => {
  await expect(
    alignBabelBehavior({
      source: `// @flow
      globalThis.__result = (async () => {
        const calls: Array<string> = [];
        const values = [{[Symbol.dispose]() { calls.push('sync'); }}];
        for (using value of values) { calls.push('body'); }
        return calls;
      })();`,
      filename: 'input.js',
      plugins: [
        [syntaxHermesParser, { parseLangTypes: 'flow' }],
        flowStripTypes,
        explicitResourceManagement,
      ],
      noxcturnal: { helpers: { mode: 'inline' }, transforms: { explicitResourceManagement: true } },
      output: { mustNotMatch: [/\busing value\b/, /Array<string>/] },
    }),
  ).resolves.toEqual(['body', 'sync']);
});

for (const reference of references) {
  test(`${reference.name} wraps resource-loop bindings in VariableDeclarators`, () => {
    for (const [source, declaration] of [
      ['for (using x of y);', 'using'],
      ['for (using x in y);', 'using'],
    ]) {
      expect(
        reference.parser.parse(source, { babel: false, flow: 'all', sourceType: 'module' }),
      ).toMatchObject({
        body: [
          {
            left: {
              kind: declaration,
              declarations: [
                { type: 'VariableDeclarator', init: null, id: { type: 'Identifier', name: 'x' } },
              ],
            },
          },
        ],
      });
    }
  });

  test.each(cases)(`${reference.name} parses $id`, row => {
    const parse = () =>
      reference.parser.parse(row.source, {
        babel: false,
        flow: 'all',
        sourceType: 'module',
        enableExperimentalComponentSyntax: true,
        enableExperimentalFlowMatchSyntax: true,
        enableExperimentalFlowRecordSyntax: true,
      });
    const accepts = reference.exact ? row.outcome !== 'ParseFailed' : row.pinnedAccepted;
    if (accepts) expect(parse()).toBeDefined();
    else expect(parse).toThrow(SyntaxError);
  });

  test.each(
    cases.filter(
      row => row.outcome === 'erased' && row.public !== 'flow-erasure-unsupported-syntax',
    ),
  )(`${reference.name} aligns $id`, row => {
    alignHermesFlowTransform(`// @flow\n${row.source}`, 'input.js', reference.parser);
  });

  if (reference.exact) {
    test.each(cases.filter(row => row.classification === 'intentional compatibility boundary'))(
      `${reference.name} preserves the $id compatibility boundary`,
      row => {
        expectBabelSupportedNoxcturnalBailout(
          {
            source: `// @flow\n${row.source}`,
            filename: 'input.js',
            noxcturnal: {},
            plugins: [
              {
                parserOverride(source: string) {
                  return reference.parser.parse(source, {
                    babel: true,
                    flow: 'all',
                    sourceType: 'module',
                    enableExperimentalComponentSyntax: true,
                    enableExperimentalFlowMatchSyntax: true,
                    enableExperimentalFlowRecordSyntax: true,
                  }) as NonNullable<ReturnType<typeof babel.parseSync>>;
                },
              },
            ],
          },
          'flow-requires-parser-adapter',
        );
      },
    );
  }
}
