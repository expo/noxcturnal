import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import babel from '@babel/core';

const sourceDirectory = path.join(os.homedir(), 'git/expo/expo/apps/test-suite/tests');
const outputDirectory = path.dirname(new URL(import.meta.url).pathname);

const suites = {
  JSAsync: {
    output: 'functions/async-functions-corpus.test.ts',
    preflight: `{ helpers: runtimeHelpers, transforms: { asyncFunctions: true } }`,
  },
  JSAsyncGenerator: {
    output: 'functions/async-generators-corpus.test.ts',
    preflight: `{ helpers: runtimeHelpers, transforms: { asyncGeneratorFunctions: true } }`,
  },
  JSBlockScoping: {
    output: 'variables/block-scoping-corpus.test.ts',
    preflight: `{ transforms: { blockScoping: true } }`,
  },
  JSDestructuring: {
    output: 'destructuring/destructuring-corpus.test.ts',
    preflight: `{ helpers: runtimeHelpers, transforms: { destructuring: { useBuiltIns: true } } }`,
  },
  JSHermesMisc: { output: 'syntax/hermes-corpus.test.ts', preflight: `{}` },
  JSNamedGroupsRegexes: {
    output: 'regexp/named-capture-groups-corpus.test.ts',
    preflight: `{ helpers: runtimeHelpers, transforms: { regexpNamedCaptureGroups: true } }`,
  },
  JSNullishCoalescing: {
    output: 'operators/nullish-coalescing-corpus.test.ts',
    preflight: `{ transforms: { nullishCoalescingOperator: { loose: false } } }`,
  },
  JSOptionalChaining: {
    output: 'operators/optional-chaining-corpus.test.ts',
    preflight: `{ transforms: { optionalChaining: { loose: false } } }`,
  },
  JSPrivateMethods: {
    output: 'classes/private-methods-corpus.test.ts',
    preflight: `{ helpers: runtimeHelpers, transforms: { privateMethods: { loose: true } } }`,
  },
  JSPrivateProperties: {
    output: 'classes/private-properties-corpus.test.ts',
    preflight: `{ helpers: runtimeHelpers, transforms: { classProperties: { loose: true }, privatePropertyInObject: { loose: true } } }`,
  },
  JSReactJSX: {
    output: 'jsx/react-jsx-corpus.test.ts',
    filename: 'input.jsx',
    preflight: `{ jsx: 'automatic' }`,
  },
  JSUnicodeRegexes: {
    output: 'regexp/unicode-corpus.test.ts',
    preflight: `{ helpers: runtimeHelpers, transforms: { regexpUnicode: true } }`,
  },
};

for (const [suite, configuration] of Object.entries(suites)) {
  const sourcePath = path.join(sourceDirectory, `${suite}.js`);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const ast = babel.parseSync(source, {
    filename: sourcePath,
    sourceType: 'module',
    parserOpts: { plugins: ['jsx'] },
  });
  const cases = collectCases(ast.program, source);
  const imports = configuration.preflight.includes('runtimeHelpers')
    ? `runtimeHelpers, transformOutcome`
    : `transformOutcome`;
  const tests = cases
    .map(({ name, callback, skipped }, index) => {
      const status = skipped ? '[upstream xit] ' : '';
      const title = `${String(index + 1).padStart(3, '0')} ${status}${name}`;
      return `test(${JSON.stringify(title)}, async () => {
  const source = ${JSON.stringify(callback)};
  expect(await transformOutcome(source, ${JSON.stringify(configuration.filename ?? 'input.js')}, ${configuration.preflight})).toMatchInlineSnapshot();
});`;
    })
    .join('\n\n');
  const generated = `// Generated from apps/test-suite/tests/${suite}.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { ${imports} } from '../transform';

${tests}
`;
  const outputPath = path.join(outputDirectory, configuration.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, generated);
  process.stdout.write(`${suite}: ${cases.length} cases\n`);
}

function collectCases(root, source) {
  const cases = [];
  visit(root, []);
  return cases;

  function visit(node, ancestry) {
    if (node == null || typeof node !== 'object') return;
    if (node.type === 'CallExpression' && identifier(node.callee, ['describe'])) {
      const [title, callback] = node.arguments;
      const name = stringValue(title);
      if (name != null && isFunction(callback)) {
        visit(callback.body, [...ancestry, name]);
        return;
      }
    }
    if (node.type === 'CallExpression' && identifier(node.callee, ['it', 'xit'])) {
      const [title, callback] = node.arguments;
      const name = stringValue(title);
      if (name != null && isFunction(callback) && callback.start != null && callback.end != null) {
        cases.push({
          name: [...ancestry, name].join(' > '),
          callback: source.slice(callback.start, callback.end),
          skipped: node.callee.name === 'xit',
        });
        return;
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments') continue;
      if (Array.isArray(value)) for (const child of value) visit(child, ancestry);
      else visit(value, ancestry);
    }
  }
}

function identifier(node, names) {
  return node?.type === 'Identifier' && names.includes(node.name);
}

function isFunction(node) {
  return node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression';
}

function stringValue(node) {
  return node?.type === 'StringLiteral' ? node.value : null;
}
