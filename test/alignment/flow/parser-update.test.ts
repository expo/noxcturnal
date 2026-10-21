import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import flowStripTypes from '@babel/plugin-transform-flow-strip-types';
import explicitResourceManagement from '@babel/plugin-transform-explicit-resource-management';
import syntaxHermesParser from 'babel-plugin-syntax-hermes-parser';

import cases from '../../fixtures/flow-parser-update/cases.json';
import {
  alignBabelBehavior,
  alignHermesFlowTransform,
  alignFlowDecoratorTransform,
} from '../transform';

const require = createRequire(import.meta.url);
type Parser = NonNullable<Parameters<typeof alignHermesFlowTransform>[2]>;
const parser: Parser = require('hermes-parser');

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

test(`hermes-parser 0.36.0 wraps resource-loop bindings in VariableDeclarators`, () => {
  for (const [source, declaration] of [
    ['for (using x of y);', 'using'],
    ['for (using x in y);', 'using'],
  ]) {
    expect(parser.parse(source, { babel: false, flow: 'all', sourceType: 'module' })).toMatchObject(
      {
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
      },
    );
  }
});

test.each(cases)(`hermes-parser 0.36.0 parses $id`, row => {
  const parse = () =>
    parser.parse(row.source, {
      babel: false,
      flow: 'all',
      sourceType: 'module',
      enableExperimentalComponentSyntax: true,
      enableExperimentalFlowMatchSyntax: true,
      enableExperimentalFlowRecordSyntax: true,
    });
  const accepts = row.pinnedAccepted;
  if (accepts) {
    const ast = parse();
    expect(ast).toBeDefined();
    if (row.provenance === 'decorators') {
      expect(ast).toMatchObject({
        body: [
          {
            body: {
              body: [
                { decorators: [{ type: 'Decorator' }] },
                { decorators: [{ type: 'Decorator' }] },
              ],
            },
          },
        ],
      });
    }
  } else expect(parse).toThrow(SyntaxError);
});

test.each(
  cases.filter(
    row => row.outcome === 'erased' && row.public !== 'syntax-error' && row.pinnedAccepted,
  ),
)(`hermes-parser 0.36.0 aligns $id`, row => {
  if (row.provenance === 'decorators') {
    // Hermes parses decorators in ESTree, but its Babel adapter
    // discards them. Compare preservation with Babel's Flow stripper.
    alignFlowDecoratorTransform(`// @flow\n${row.source}`);
  } else {
    alignHermesFlowTransform(`// @flow\n${row.source}`, 'input.js', parser);
  }
});
