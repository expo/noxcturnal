import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const babelRoot = path.resolve(here, '../../../../babel/babel/packages');
const runtimeHelpers = {
  mode: 'runtime',
  moduleName: '@babel/runtime',
  version: '7.29.7',
};

/**
 * Babel's transform fixtures are an unusually thorough catalogue of syntax
 * shapes and historical regressions. These generated tests deliberately embed
 * their inputs and snapshot Noxcturnal's own output; Babel is only needed when
 * regenerating this corpus, never when running it.
 *
 * A fixture is run in every public Noxcturnal mode relevant to that transform.
 * This is intentionally broader than copying Babel's fixture options: it makes
 * our spec/loose and built-in-helper contracts visible independently.
 */
const transforms = [
  ['variables', 'block-scoping', 'block-scoping', [{ transforms: { blockScoping: true } }]],
  ['classes', 'classes', 'classes', [{ transforms: { classes: true }, helpers: runtimeHelpers }]],
  [
    'classes',
    'class-properties',
    'class-properties',
    [false, true].map(loose => ({
      transforms: { classProperties: { loose } },
      helpers: runtimeHelpers,
    })),
  ],
  [
    'classes',
    'static-block',
    'class-static-block',
    [{ transforms: { classStaticBlock: true }, helpers: runtimeHelpers }],
  ],
  [
    'classes',
    'private-methods',
    'private-methods',
    [false, true].map(loose => ({
      transforms: { privateMethods: { loose } },
      helpers: runtimeHelpers,
    })),
  ],
  [
    'classes',
    'private-property-in-object',
    'private-property-in-object',
    [false, true].map(loose => ({
      transforms: { privatePropertyInObject: { loose } },
      helpers: runtimeHelpers,
    })),
  ],
  [
    'destructuring',
    'destructuring',
    'destructuring',
    [false, true].map(useBuiltIns => ({
      transforms: { destructuring: { useBuiltIns } },
      helpers: runtimeHelpers,
    })),
  ],
  ['functions', 'parameters', 'parameters', [{ transforms: { parameters: true } }]],
  [
    'functions',
    'async-functions',
    'async-to-generator',
    [{ transforms: { asyncFunctions: true }, helpers: { mode: 'inline' } }],
  ],
  [
    'functions',
    'async-generators',
    'async-generator-functions',
    [{ transforms: { asyncGeneratorFunctions: true }, helpers: { mode: 'inline' } }],
  ],
  ['loops', 'for-of', 'for-of', [{ transforms: { forOf: true }, helpers: { mode: 'inline' } }]],
  [
    'resources',
    'explicit-resource-management',
    'explicit-resource-management',
    [{ transforms: { explicitResourceManagement: true }, helpers: { mode: 'inline' } }],
  ],
  [
    'operators',
    'logical-assignment',
    'logical-assignment-operators',
    [{ transforms: { logicalAssignmentOperators: true } }],
  ],
  [
    'operators',
    'optional-chaining',
    'optional-chaining',
    [false, true].map(loose => ({ transforms: { optionalChaining: { loose } } })),
  ],
  [
    'operators',
    'nullish-coalescing',
    'nullish-coalescing-operator',
    [false, true].map(loose => ({ transforms: { nullishCoalescingOperator: { loose } } })),
  ],
  [
    'operators',
    'exponentiation',
    'exponentiation-operator',
    [{ transforms: { exponentiationOperator: true } }],
  ],
  [
    'objects',
    'object-rest-spread',
    'object-rest-spread',
    [false, true].flatMap(loose =>
      [false, true].map(useBuiltIns => ({
        transforms: { objectRestSpread: { loose, useBuiltIns } },
        helpers: runtimeHelpers,
      })),
    ),
  ],
  [
    'modules',
    'export-namespace-from',
    'export-namespace-from',
    [{ transforms: { exportNamespaceFrom: true } }],
  ],
  [
    'errors',
    'optional-catch-binding',
    'optional-catch-binding',
    [{ transforms: { optionalCatchBinding: true } }],
  ],
  ['regexp', 'sticky', 'sticky-regex', [{ transforms: { regexpSticky: true } }]],
  ['regexp', 'unicode', 'unicode-regex', [{ transforms: { regexpUnicode: true } }]],
  [
    'regexp',
    'unicode-property-escapes',
    'unicode-property-regex',
    [{ transforms: { regexpUnicodePropertyEscapes: true }, helpers: { mode: 'inline' } }],
  ],
  ['regexp', 'dot-all', 'dotall-regex', [{ transforms: { regexpDotAll: true } }]],
  [
    'regexp',
    'named-capture-groups',
    'named-capturing-groups-regex',
    [{ transforms: { regexpNamedCaptureGroups: true }, helpers: { mode: 'inline' } }],
  ],
  [
    'regexp',
    'unicode-sets',
    'unicode-sets-regex',
    [{ transforms: { regexpUnicodeSets: true }, helpers: { mode: 'inline' } }],
  ],
  ['typescript', 'type-stripping', 'typescript', [{ typescript: 'strip' }]],
  ['flow', 'type-stripping', 'flow-strip-types', [{}]],
  ['jsx', 'runtime', 'react-jsx', [{ jsx: 'classic' }, { jsx: 'automatic' }]],
  [
    'jsx',
    'development-runtime',
    'react-jsx-development',
    [{ jsx: 'classic-development' }, { jsx: 'automatic-development' }],
  ],
];

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory)) {
    const absolute = path.join(directory, entry);
    if ((await stat(absolute)).isDirectory()) files.push(...(await filesUnder(absolute)));
    else if (/^(input|exec)\.(?:js|jsx|mjs|cjs|ts|tsx)$/.test(entry)) files.push(absolute);
  }
  return files;
}

function modeName(plan) {
  const value = JSON.stringify(plan);
  const labels = [];
  if (value.includes('"loose":true')) labels.push('loose');
  if (value.includes('"loose":false')) labels.push('spec');
  if (value.includes('"useBuiltIns":true')) labels.push('built-ins');
  if (value.includes('"useBuiltIns":false')) labels.push('helpers');
  return labels.length ? ` [${labels.join(', ')}]` : '';
}

for (const [category, outputName, babelName, plans] of transforms) {
  const fixtureRoot = path.join(
    babelRoot,
    `babel-plugin-transform-${babelName}`,
    'test',
    'fixtures',
  );
  let fixtures;
  try {
    fixtures = (await filesUnder(fixtureRoot)).sort();
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }

  const tests = [];
  for (const filename of fixtures) {
    let source = await readFile(filename, 'utf8');
    if (category === 'flow' && !/^\s*\/\*?\s*@flow\b/m.test(source)) {
      source = `// @flow\n${source}`;
    }
    const relative = path.relative(fixtureRoot, filename);
    for (const plan of plans) {
      const effectivePlan = structuredClone(plan);
      if (category === 'classes' && source.includes('#')) {
        const loose =
          effectivePlan.transforms?.classProperties?.loose ??
          effectivePlan.transforms?.privateMethods?.loose ??
          effectivePlan.transforms?.privatePropertyInObject?.loose ??
          false;
        effectivePlan.transforms ??= {};
        effectivePlan.transforms.classProperties ??= { loose };
        effectivePlan.transforms.privateMethods ??= { loose };
        effectivePlan.transforms.privatePropertyInObject ??= { loose };
      }
      const jsxMode = plan.jsx ? ` [${plan.jsx}]` : '';
      const title = `${relative}${modeName(plan)}${jsxMode}`;
      const inputName = category === 'jsx' ? 'input.jsx' : path.basename(filename);
      tests.push(`test(${JSON.stringify(title)}, async () => {
  const source = ${JSON.stringify(source)};
  expect(
    await transformOutcome(source, ${JSON.stringify(inputName)}, ${JSON.stringify(effectivePlan)}),
  ).toMatchInlineSnapshot();
});`);
    }
  }

  const output =
    `// Generated by generate-transform-fixtures.mjs. Do not edit by hand.\n` +
    `import { expect, test } from 'vitest';\n` +
    `import { transformOutcome } from '../transform';\n\n` +
    `// Babel fixture source: packages/babel-plugin-transform-${babelName}/test/fixtures\n` +
    tests.join('\n\n') +
    '\n';
  await writeFile(path.join(here, category, `${outputName}-fixtures.test.ts`), output);
}
