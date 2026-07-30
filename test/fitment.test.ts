import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
} from '../dist/index.js';

type ImportState = { modules: Map<string, string> };

const metroImports = defineNativePlugin<ImportState>({
  name: 'metro-import-fitment',
  createState: () => ({ modules: new Map() }),
  visitors: [
    defineVisitor(
      'ImportDeclaration',
      {
        fields: ['source'],
        scope: true,
        ancestry: { mode: 'parent' },
        children: {
          specifiers: { route: 'ImportSpecifier', fields: ['local', 'imported'] },
        },
      },
      (path, state: ImportState) => {
        const source = String(path.node.source);
        let moduleId = state.modules.get(source);
        const firstImport = moduleId == null;
        if (!moduleId) {
          moduleId = path.scope.getProgramParent().generateUid(source);
          state.modules.set(source, moduleId);
        }
        const specifiers = path.getChildList('specifiers');
        if (specifiers.length === 0) {
          path.replaceWith(
            firstImport ? `var ${moduleId} = require(${JSON.stringify(source)});` : '',
          );
          return;
        }
        const declarations = firstImport
          ? [`var ${moduleId} = require(${JSON.stringify(source)});`]
          : [];
        for (const specifier of specifiers) {
          const local = String(specifier.node.local);
          const imported = String(specifier.node.imported);
          const expression =
            imported === '*'
              ? moduleId
              : /^[$A-Z_a-z][$\w]*$/.test(imported)
                ? `${moduleId}.${imported}`
                : `${moduleId}[${JSON.stringify(imported)}]`;
          declarations.push(`var ${local} = ${expression};`);
          const binding = path.scope.getBinding(local);
          assert.ok(binding, `missing import binding ${local}`);
          const parentIds = binding.references.flatMap(reference =>
            reference.parentId == null ? [] : [reference.parentId],
          );
          const parents = new Map(
            path.context
              .inspect(parentIds.map(nodeId => ({ nodeId, fields: [] })))
              .map(parent => [parent.id, parent]),
          );
          for (const reference of binding.references) {
            if (reference.parentType === 'ExportSpecifier') continue;
            const parent = reference.parentId == null ? undefined : parents.get(reference.parentId);
            const isDirectCall =
              reference.parentType === 'CallExpression' && parent?.start === reference.start;
            const preservesShorthand =
              reference.parentType === 'ObjectProperty' && parent?.start === reference.start;
            const replacement = isDirectCall
              ? `(0, ${expression})`
              : preservesShorthand
                ? `${local}: ${expression}`
                : expression;
            path.context.editor.overwrite(reference.start!, reference.end!, replacement);
          }
        }
        path.replaceWith(declarations.join('\n'));
      },
    ),
  ],
});

type ExportState = { statements: string[] };

const boundIdentifiers = defineVisitor('Identifier', { fields: ['name', 'binding'] }, () => {});

const metroExports = defineNativePlugin<ExportState>({
  name: 'metro-export-fitment',
  createState: () => ({ statements: [] }),
  visitors: [
    defineVisitor(
      'ExportNamedDeclaration',
      {
        controlFlow: ['nested-traverse'],
        nested: [boundIdentifiers],
        children: {
          declaration: { route: 'Declaration' },
          specifiers: { route: 'ExportSpecifier', fields: ['local', 'exported'] },
        },
      },
      (path, state: ExportState) => {
        const declaration = path.getChild('declaration');
        if (declaration) {
          const names = new Set<string>();
          declaration.traverse([
            defineVisitor('Identifier', { fields: ['name', 'binding'] }, identifier => {
              if (identifier.node.binding === true) names.add(String(identifier.node.name));
            }),
          ]);
          path.replaceWith(declaration.getSource());
          for (const name of names) state.statements.push(`exports.${name} = ${name};`);
          return;
        }
        for (const specifier of path.getChildList('specifiers')) {
          const local = String(specifier.node.local);
          const exported = String(specifier.node.exported);
          state.statements.push(
            `Object.defineProperty(exports, ${JSON.stringify(exported)}, { enumerable: true, get: () => ${local} });`,
          );
        }
        path.remove();
      },
    ),
    defineVisitor(
      'ExportDefaultDeclaration',
      { scope: true, children: { declaration: { route: 'Declaration' } } },
      (path, state: ExportState) => {
        const declaration = path.getChild('declaration');
        assert.ok(declaration);
        const local = path.scope.generateUid('default');
        path.replaceWith(path.context.code.template`var ${local} = ${declaration.getSource()};`);
        state.statements.push(`exports.default = ${local};`);
      },
    ),
    defineVisitor(
      'Program',
      {},
      {
        exit(path, state: ExportState) {
          if (state.statements.length > 0) {
            path.unshiftContainer(
              'body',
              `Object.defineProperty(exports, '__esModule', { value: true });`,
            );
            path.pushContainer('body', state.statements.join('\n'));
          }
        },
      },
    ),
  ],
});

test('expresses Metro-style import/export lowering with semantic references and JSX', () => {
  const source = [
    `import def, { foo as local } from 'pkg';`,
    `import * as ns from 'other';`,
    `export { local as renamed };`,
    `export const answer = local;`,
    `export default def();`,
    `const shorthand = { local };`,
    `const view = <ns.Widget value={local} />;`,
  ].join('\n');
  const result = transform(
    source,
    'fixture.jsx',
    defineNativePipeline({
      phases: [
        { name: 'imports', plugins: [metroImports], requiresPrintedInput: true },
        { name: 'exports', plugins: [metroExports] },
      ],
    }),
    { parser: 'jsx' },
  );
  assert.equal(result.status, 'complete');
  assert.match(result.code, /var _pkg = require\("pkg"\);/);
  assert.match(result.code, /var _other = require\("other"\);/);
  assert.match(result.code, /var local = _pkg\.foo;/);
  assert.match(result.code, /var _default = \(0, _pkg\.default\)\(\);/);
  assert.match(result.code, /const shorthand = \{ local: _pkg\.foo \};/);
  assert.match(result.code, /<_other\.Widget value=\{_pkg\.foo\} \/>/);
  assert.match(
    result.code,
    /Object\.defineProperty\(exports, "renamed", \{ enumerable: true, get: \(\) => local \}\);/,
  );
  assert.match(result.code, /exports\.answer = answer;/);
  assert.match(result.code, /exports\.default = _default;/);
  assert.doesNotMatch(result.code, /\b(?:import|export)\s/);
});

type ActionState = { names: string[] };

const serverActions = defineNativePlugin<ActionState>({
  name: 'server-actions-fitment',
  contract: { metadata: { writes: ['reactServerActions'] } },
  createState: () => ({ names: [] }),
  visitors: [
    defineVisitor(
      'ArrowFunctionExpression',
      {
        fields: ['async', 'bodyEnd'],
        scope: true,
        ancestry: { mode: 'programParent' },
        children: {
          body: {
            route: 'FunctionBody',
            children: { directives: { route: 'Directive', fields: ['value'] } },
          },
          params: {
            route: 'FormalParameters',
            children: { '*': { route: '*' } },
          },
        },
      },
      (path, state: ActionState) => {
        const body = path.getChild('body');
        if (!body || body.node.type !== 'FunctionBody') return;
        const directive = body
          .getChildList('directives')
          .find(item => item.node.value === 'use server');
        if (!directive) return;
        if (path.node.async !== true)
          throw path.buildCodeFrameError('functions marked with "use server" must be async');
        const captures = path.context.query({ captures: [{ functionId: path.node.id }] }).captures[
          path.node.id
        ];
        const names = [...new Set(captures.map(capture => String(capture.name)))].sort();
        const actionId = path.scope.getProgramParent().generateUid('inlineAction');
        const parameters = path.getChildList('params').map(parameter => parameter.sourceText());
        const closureParameter = names.length > 0 ? ['$$closure'] : [];
        const bodyEnd = Number(path.node.bodyEnd);
        const bodySource = path.context.source.slice(directive.node.end, bodyEnd);
        const closureInit = names.length > 0 ? `var [${names.join(', ')}] = $$closure;` : '';
        const extracted = `export var ${actionId} = registerServerReference(async function(${[...closureParameter, ...parameters].join(', ')}) {${closureInit}${bodySource}}, "./fixture", ${JSON.stringify(actionId)});`;
        path.getProgramParent()!.unshiftContainer('body', extracted);
        path.replaceWith(
          names.length > 0 ? `${actionId}.bind(null, [${names.join(', ')}])` : actionId,
        );
        state.names.push(actionId);
      },
    ),
  ],
  post(context, state) {
    context.metadata.set('reactServerActions', { id: './fixture', names: state.names });
  },
});

test('expresses server-action extraction with captures, directives, scopes, and generation', () => {
  const source = `function factory(captured) { return async (argument) => { "use server"; return captured + argument; }; }`;
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'actions', plugins: [serverActions] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.match(
    result.code,
    /export var _inlineAction = registerServerReference\(async function\(\$\$closure, argument\)/,
  );
  assert.match(result.code, /var \[captured\] = \$\$closure;/);
  assert.match(result.code, /return captured \+ argument;/);
  assert.match(result.code, /return _inlineAction\.bind\(null, \[captured\]\);/);
  assert.doesNotMatch(result.code, /use server/);
  assert.deepEqual(result.metadata.reactServerActions, {
    id: './fixture',
    names: ['_inlineAction'],
  });
});

test('expresses shared-token responsibility over one import statement through an intent key', () => {
  // Two independent transforms both need the same import statement rewritten — the
  // dependency collector lowers it to a require, and the polyfill rewriter needs the
  // same lowering as its anchor. One intent key makes that shared responsibility an
  // explicit contract instead of an accidental byte-identical collision.
  const source = "import { fetch } from 'whatwg-fetch';\nfetch('/api');\n";
  const claimImportLowering = (context: {
    source: string;
    ensureReplace(key: string, start: number, end: number, code: string): void;
  }) => {
    const statementEnd = context.source.indexOf(';\n') + 1;
    context.ensureReplace(
      'shared/import:whatwg-fetch',
      0,
      statementEnd,
      "const { fetch } = require('whatwg-fetch');",
    );
  };
  const dependencyCollector = defineNativePlugin({
    name: 'dependency-collector',
    contract: { metadata: { writes: ['dependencies'] } },
    pre(context) {
      claimImportLowering(context);
      context.metadata.set('dependencies', ['whatwg-fetch']);
    },
  });
  const polyfillRewriter = defineNativePlugin({
    name: 'polyfill-rewriter',
    pre(context) {
      claimImportLowering(context);
    },
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'lower', plugins: [dependencyCollector, polyfillRewriter] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, "const { fetch } = require('whatwg-fetch');\nfetch('/api');\n");
  assert.deepEqual(result.metadata.dependencies, ['whatwg-fetch']);
});
