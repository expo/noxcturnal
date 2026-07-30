// Typecheck wall-time fixture for the typed-contract gates: 30 representative
// visitor contracts. Measure with:
//   tsc --noEmit --strict --target es2022 --module commonjs --moduleResolution node \
//       --skipLibCheck benchmark/typecheck-fixture.ts
// Budget: within 1.5x of the pre-tightening baseline (see the plan doc).
import { defineNativePlugin, defineVisitor } from '../js/index.js';

interface S1 {
  names: string[];
}
interface S2 {
  count: number;
}

const v1 = defineVisitor('Identifier', { fields: ['name', 'global'] }, (path, state: S1) => {
  if (path.node.global === true) state.names.push(String(path.node.name));
});
const v2 = defineVisitor('StringLiteral', { fields: ['value'] }, path => {
  path.node.value;
});
const v3 = defineVisitor('NumericLiteral', { fields: ['value'] }, path => {
  path.node.value;
});
const v4 = defineVisitor('BooleanLiteral', { where: { value: { equals: true } } }, () => {});
const v5 = defineVisitor(
  'CallExpression',
  { fields: ['calleeName', 'argumentCount'], where: { optional: { equals: false } } },
  path => {
    path.node.calleeName;
    path.node.argumentCount;
  },
);
const v6 = defineVisitor(
  'VariableDeclaration',
  {
    fields: ['kind'],
    children: { declarations: { route: 'VariableDeclarator', fields: ['kind'] } },
  },
  path => {
    path.getChildList('declarations')[0]?.node.kind;
  },
);
const v7 = defineVisitor('VariableDeclarator', { fields: ['hasInitializer'] }, path => {
  path.node.hasInitializer;
});
const v8 = defineVisitor('Function', { fields: ['async', 'parameterCount'] }, path => {
  path.node.async;
});
const v9 = defineVisitor('ArrowFunctionExpression', { fields: ['bodyStart', 'bodyEnd'] }, path => {
  path.node.bodyStart;
});
const v10 = defineVisitor('FunctionDeclaration', { fields: ['name'] }, path => {
  path.node.name;
});
const v11 = defineVisitor('Class', { fields: ['name', 'nodeKind'] }, path => {
  path.node.nodeKind;
});
const v12 = defineVisitor('ImportDeclaration', { fields: ['source', 'importKind'] }, path => {
  path.node.source;
});
const v13 = defineVisitor('ImportSpecifier', { fields: ['imported', 'local'] }, path => {
  path.node.imported;
});
const v14 = defineVisitor(
  'ExportNamedDeclaration',
  { children: { declaration: { route: 'Declaration' }, specifiers: { route: 'ExportSpecifier' } } },
  path => {
    path.getChild('declaration');
    path.getChildList('specifiers');
  },
);
const v15 = defineVisitor('ExportSpecifier', { fields: ['local', 'exported'] }, () => {});
const v16 = defineVisitor(
  'StaticMemberExpression',
  { fields: ['memberPath', 'rootName'], where: { computed: { equals: false } } },
  path => {
    path.node.memberPath;
  },
);
const v17 = defineVisitor('BinaryExpression', { where: { operator: { equals: '===' } } }, () => {});
const v18 = defineVisitor('LogicalExpression', { fields: ['operator'] }, path => {
  path.node.operator;
});
const v19 = defineVisitor('UnaryExpression', { fields: ['operator', 'prefix'] }, () => {});
const v20 = defineVisitor(
  'ObjectProperty',
  { fields: ['kind', 'computed', 'shorthand', 'key'] },
  path => {
    path.node.key;
  },
);
const v21 = defineVisitor('Directive', { where: { value: { equals: 'use strict' } } }, () => {});
const v22 = defineVisitor('YieldExpression', { fields: ['delegate'] }, () => {});
const v23 = defineVisitor('ReferencedIdentifier', { fields: ['name'] }, (path, state: S2) => {
  state.count += 1;
  path.node.name;
});
const v24 = defineVisitor('Identifier|StringLiteral', { fields: ['name', 'value'] }, path => {
  if (path.node.type === 'Identifier') path.node.name;
});
const v25 = defineVisitor('Expression', { fields: ['calleeName'], scope: true }, path => {
  path.scope.hasBinding('x');
});
const v26 = defineVisitor(
  'VariableDeclaration',
  { scope: true, ancestry: { mode: 'findParent' } },
  path => {
    path.findParent(parent => parent.type === 'Program');
  },
);
const v27 = defineVisitor(
  'CallExpression',
  { ancestry: { mode: 'functionParent' }, controlFlow: ['skip'] },
  path => {
    path.getFunctionParent();
    path.skip();
  },
);
const v28 = defineVisitor('Function', { controlFlow: ['nested-traverse'], nested: [v1] }, path => {
  path.traverse([v1], { names: [] });
});
const v29 = defineVisitor(
  'Program',
  { children: { body: { route: 'Statement' }, directives: { route: 'Directive' } } },
  path => {
    path.getChildList('body');
  },
);
const v30 = defineVisitor(
  'TryStatement',
  {
    children: {
      block: { route: 'BlockStatement' },
      handler: { route: 'CatchClause' },
      finalizer: { route: 'BlockStatement' },
    },
  },
  path => {
    path.getChild('handler');
  },
);

export const plugin = defineNativePlugin({
  name: 'thirty-visitors',
  visitors: [
    v2,
    v3,
    v4,
    v5,
    v6,
    v7,
    v8,
    v9,
    v10,
    v11,
    v12,
    v13,
    v14,
    v15,
    v16,
    v17,
    v18,
    v19,
    v20,
    v21,
    v22,
    v24,
    v25,
    v26,
    v27,
    v28,
    v29,
    v30,
  ],
});
export const stateful = defineNativePlugin({
  name: 'stateful-visitors',
  visitors: [v1],
  createState: (): S1 => ({ names: [] }),
});
export const counting = defineNativePlugin({
  name: 'counting-visitors',
  visitors: [v23],
  createState: (): S2 => ({ count: 0 }),
});
