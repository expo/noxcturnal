import assert from 'node:assert/strict';
import { describe, test } from 'vitest';

import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const metadata = ['declarationNameAnchor', 'declarationNamePrefix'] as const;

function nameDeclarations(source: string, name = '_ref'): string {
  const plugin = defineNativePlugin({
    name: 'declaration-name',
    visitors: [
      defineVisitor('FunctionDeclaration|ClassDeclaration', { fields: metadata }, path => {
        path.replaceWith(path.withDeclarationName(name));
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'name', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  return result.code;
}

describe('withDeclarationName', () => {
  test.each([
    ['export default function() {}', 'export default function _ref() {}'],
    ['export default function () {}', 'export default function _ref () {}'],
    ['export default async function() {}', 'export default async function _ref() {}'],
    ['export default function*() {}', 'export default function* _ref() {}'],
    [
      'export default async function*/* comment */() {}',
      'export default async function* _ref/* comment */() {}',
    ],
    [
      'export default function /* a */ * /* b */ () {}',
      'export default function /* a */ * _ref /* b */ () {}',
    ],
    [
      'export default function\n/* before star */\n*\n/* before params */\n() {}',
      'export default function\n/* before star */\n* _ref\n/* before params */\n() {}',
    ],
    ['export default class {}', 'export default class _ref {}'],
    ['export default class extends Base {}', 'export default class _ref extends Base {}'],
    ['@sealed\nexport default class {}', '@sealed\nexport default class _ref {}'],
    [
      'export default class/* before heritage */extends Base {}',
      'export default class _ref/* before heritage */extends Base {}',
    ],
  ])('names %s', (input, expected) => assert.equal(nameDeclarations(input), expected));

  test('accepts Unicode and dollar-prefixed identifiers', () => {
    assert.equal(
      nameDeclarations('export default function() {}', '$élan'),
      'export default function $élan() {}',
    );
  });

  test('throws a structured plugin-owned error for invalid identifiers', () => {
    assert.throws(
      () => nameDeclarations('export default function() {}', 'not valid'),
      error =>
        error instanceof Error &&
        error.name === 'NativeTransformError' &&
        /Invalid declaration identifier/.test(error.message),
    );
  });

  test('rejects named declarations and missing metadata', () => {
    assert.throws(() => nameDeclarations('function named() {}'), /only supports anonymous/);
    const plugin = defineNativePlugin({
      name: 'undeclared',
      visitors: [
        defineVisitor('FunctionDeclaration', {}, path => path.withDeclarationName('_ref')),
      ],
    });
    assert.throws(
      () =>
        transform(
          'export default function() {}',
          'fixture.js',
          defineNativePipeline({
            phases: [{ name: 'name', plugins: [plugin] }],
          }),
        ),
      /native metadata/,
    );
  });

  test('fails loudly for malformed native metadata', () => {
    const plugin = defineNativePlugin({
      name: 'malformed-metadata',
      visitors: [
        defineVisitor('FunctionDeclaration', { fields: metadata }, path => {
          (path as unknown as { event: Record<string, unknown> }).event.declarationNameAnchor =
            'invalid';
          path.withDeclarationName('_ref');
        }),
      ],
    });
    assert.throws(
      () =>
        transform(
          'export default function() {}',
          'fixture.js',
          defineNativePipeline({
            phases: [{ name: 'name', plugins: [plugin] }],
          }),
        ),
      /native metadata/,
    );
  });

  test('preserves contained edits while inserting the generated name', () => {
    const name = defineNativePlugin({
      name: 'name',
      visitors: [
        defineVisitor('FunctionDeclaration', { fields: metadata }, path => {
          path.replaceWith(path.withDeclarationName('_ref'));
        }),
      ],
    });
    const editBody = defineNativePlugin({
      name: 'body-edit',
      visitors: [defineVisitor('NumericLiteral', {}, path => path.replaceWith('2'))],
    });
    const result = transform(
      'export default function() { return 1; }',
      'fixture.js',
      defineNativePipeline({
        phases: [{ name: 'edit', plugins: [name, editBody] }],
      }),
    );
    assert.equal(result.status, 'complete');
    assert.equal(result.code, 'export default function _ref() { return 2; }');
  });

  test.each([
    ['const value = function() {};', 'FunctionExpression'],
    ['const Value = class {};', 'ClassExpression'],
  ] as const)('rejects unsupported node shape in %s', (source, route) => {
    const plugin = defineNativePlugin({
      name: 'unsupported-shape',
      visitors: [
        defineVisitor(route, { fields: metadata }, path => {
          path.withDeclarationName('_ref');
        }),
      ],
    });
    assert.throws(
      () =>
        transform(
          source,
          'fixture.js',
          defineNativePipeline({
            phases: [{ name: 'name', plugins: [plugin] }],
          }),
        ),
      /only supports anonymous/,
    );
  });

  test('rejects unrelated node kinds', () => {
    const plugin = defineNativePlugin({
      name: 'unrelated-shape',
      visitors: [
        defineVisitor('NumericLiteral', {}, path => {
          path.withDeclarationName('_ref');
        }),
      ],
    });
    assert.throws(
      () =>
        transform(
          'const value = 1;',
          'fixture.js',
          defineNativePipeline({
            phases: [{ name: 'name', plugins: [plugin] }],
          }),
        ),
      /only supports anonymous|native metadata/,
    );
  });
});
