import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  NativeTransformError,
  TransformSyntaxError,
  classify,
  compilePhasePlan,
  composeNativePipeline,
  defineNativePipeline,
  defineNativePlugin,
  definePipelinePhase,
  defineVisitor,
  isDeclaration,
  isDeclarationType,
  isExpression,
  isExpressionType,
  isFunction,
  isFunctionType,
  isMemberExpression,
  isMemberExpressionType,
  isMetaProperty,
  isMetaPropertyType,
  isNodeType,
  isStatement,
  isStatementType,
  parameter,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
} from '../../js/index';
import type { NativeNodePath } from '../../js/index';

test('exercises the complete public plugin definition, composition, and transform API', () => {
  const lifecycle: string[] = [];
  const rename = defineNativePlugin<{ visits: number }, { suffix: string }, { ready: true }>({
    name: 'integration-api-rename',
    options: { suffix: 'One' },
    contract: { metadata: { writes: ['renamed'] } },
    createState: context => {
      assert.equal(context.filename, 'fixture.js');
      assert.equal(context.parser.syntax, 'js');
      assert.equal(context.pluginData, undefined);
      return { visits: 0 };
    },
    pre: () => lifecycle.push('pre'),
    analyze: () => {
      lifecycle.push('analyze');
      return { status: 'supported', analysis: { ready: true } };
    },
    apply: (_context, analysis) => {
      assert.equal(analysis.ready, true);
      lifecycle.push('apply');
    },
    visitors: [
      defineVisitor(
        'Identifier',
        { fields: ['name'], where: { name: { oneOf: parameter('names') } } },
        (path, state) => {
          state.visits++;
          path.replaceWith(`${String(path.node.name)}One`);
        },
      ),
    ],
    post(context, state) {
      lifecycle.push('post');
      context.metadata.set('renamed', state.visits);
    },
    cleanup: reason => lifecycle.push(`cleanup:${reason}`),
    editEffect: 'bindings',
  });
  const configured = rename.withOptions({ suffix: 'Two' }).withParameters({ names: ['value'] });
  assert.ok(Object.isFrozen(configured));

  const visitPhase = definePipelinePhase({ name: 'visit', plugins: [configured] });
  const printPhase = definePipelinePhase({
    name: 'print',
    native: { comments: false },
  });
  const composed = composeNativePipeline([visitPhase, printPhase]);
  assert.equal(composeNativePipeline([visitPhase, printPhase]), composed);
  assert.equal(defineNativePipeline({ phases: [visitPhase, printPhase] }), composed);
  assert.deepEqual(
    compilePhasePlan(composed).map(({ name, editEffect, requiresPrintedInput }) => ({
      name,
      editEffect,
      requiresPrintedInput,
    })),
    [
      { name: 'visit', editEffect: 'bindings', requiresPrintedInput: false },
      { name: 'print', editEffect: 'whole-program', requiresPrintedInput: true },
    ],
  );

  const result = transform('const value = value + 1; // remove me', 'fixture.js', composed);
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const valueOne = valueOne + 1;\n');
  assert.deepEqual(result.metadata, { renamed: 2 });
  assert.deepEqual(lifecycle, ['pre', 'analyze', 'apply', 'post', 'cleanup:complete']);

  assert.equal(pipelineCacheKey(composed, 'fixture.js'), pipelineCacheKey(composed, 'fixture.js'));
  assert.notEqual(
    pipelineCacheKey(composed, 'fixture.js'),
    pipelineCacheKey(composed, 'fixture.jsx', { parser: 'jsx' }),
  );
  assert.equal(
    transformClassificationCacheKey(composed, 'fixture.js', 'const first = 1'),
    transformClassificationCacheKey(composed, 'fixture.js', 'const second = 2'),
  );
});

test('exercises classification, parser adapters, predicates, and public errors', () => {
  assert.equal(classify('fixture.tsx', 'const view = <View />').syntax, 'tsx');

  const unregister = registerParserAdapter({
    name: 'integration-api-adapter',
    version: '1',
    supports: route => route.syntax === 'flow',
    compile: source => ({
      status: 'complete',
      code: source.replace(': number', ''),
      map: { mappings: 'AAAA', names: [] },
      syntax: 'js',
      metadata: { used: true },
    }),
  });
  try {
    const adapted = transform(
      '// @flow\nconst value: number = 1;',
      'fixture.js',
      defineNativePipeline({ phases: [] }),
      { parserAdapter: 'integration-api-adapter' },
    );
    assert.equal(adapted.status, 'complete');
    assert.equal(adapted.code, '// @flow\nconst value = 1;');
    assert.deepEqual(adapted.metadata.sourceAdapter, { used: true });
  } finally {
    unregister();
  }

  const declaration = { type: 'VariableDeclaration' };
  const expression = { type: 'CallExpression' };
  const fn = { type: 'ArrowFunctionExpression' };
  const member = { type: 'StaticMemberExpression' };
  const meta = { type: 'ImportMeta' };
  const statement = { type: 'ReturnStatement' };
  assert.ok(isDeclaration(declaration) && isDeclarationType(declaration.type));
  assert.ok(isExpression(expression) && isExpressionType(expression.type));
  assert.ok(isFunction(fn) && isFunctionType(fn.type));
  assert.ok(isMemberExpression(member) && isMemberExpressionType(member.type));
  assert.ok(isMetaProperty(meta) && isMetaPropertyType(meta.type));
  assert.ok(isStatement(statement) && isStatementType(statement.type));
  assert.ok(isNodeType(expression, 'Expression'));
  assert.ok(new NativeTransformError('plugin failed', []) instanceof Error);
  assert.ok(
    new TransformSyntaxError('invalid', 'fixture.js', { line: 1, column: 0 }, 'bad') instanceof
      SyntaxError,
  );
});

test('exercises path navigation, scopes, semantic queries, fragments, and program insertion', () => {
  const observed = new Set<string>();
  const observer = defineNativePlugin({
    name: 'integration-api-observer',
    contract: {
      metadata: { writes: ['observed'] },
      queries: [
        { globals: [{ name: 'select', references: true }] },
        { calls: [{ callee: 'select', globalOnly: true, staticArguments: true }] },
      ],
    },
    visitors: [
      defineVisitor(
        'CallExpression',
        {
          fields: ['calleeName', 'calleePath'],
          comments: 'inner',
          scope: true,
          ancestry: {
            mode: 'findParent',
            routes: { Function: { fields: ['async'] }, Program: {} },
          },
          children: {
            callee: { route: 'Expression' },
            arguments: { route: 'Expression|SpreadElement' },
            '*': { route: 'Expression|SpreadElement' },
          },
        },
        path => {
          if (path.node.calleePath === 'Platform.select') {
            assert.equal(path.node.calleeName, undefined);
            observed.add('member-call-path');
            return;
          }
          assert.equal(path.node.calleeName, 'select');
          assert.equal(path.node.calleePath, 'select');
          observed.add('identity');
          assert.equal(path.id, path.node.id);
          assert.equal(path.type, 'CallExpression');
          assert.equal(path.is('CallExpression'), true);
          assert.equal(path.sourceText(), `select('web')`);
          assert.equal(path.getSource().text(), path.sourceText());
          assert.equal(path.snapshot({ ancestry: 'parent' }).type, 'CallExpression');
          assert.equal(path.getLocation().start.line, 3);
          assert.equal(path.parent?.type, 'VariableDeclarator');
          assert.equal(path.parentPath?.type, 'VariableDeclarator');

          observed.add('children');
          assert.equal((path.get('callee') as NativeNodePath).id, path.getChild('callee')?.id);
          assert.equal(path.getChild('callee')?.sourceText(), 'select');
          assert.equal(path.getChild('callee')?.matchesPattern('select'), true);
          assert.equal(path.getChildList('arguments').length, 1);
          assert.equal(path.getChildren().length, 2);

          observed.add('ancestry');
          assert.equal(path.findParent(parent => parent.type === 'Function')?.type, 'Function');
          assert.equal(
            path.find(parent => parent.type === 'CallExpression'),
            path,
          );

          observed.add('scope');
          assert.equal(path.scope.hasBinding('value'), true);
          assert.equal(path.scope.hasGlobal('select'), true);
          assert.equal(path.scope.getBinding('value')?.name, 'value');
          assert.deepEqual(
            path.scope.getBindings(['value']).map(binding => binding.name),
            ['value'],
          );
          assert.equal(path.scope.getProgramParent().parent, null);
          assert.match(path.scope.generateUid('temporary'), /^_temporary/);

          observed.add('context');
          assert.equal(path.context.filename, 'fixture.js');
          assert.equal(path.context.phase, 'observe');
          assert.equal(path.context.source, source);
          assert.equal(path.context.sourceSlice(path.start, path.end).text(), path.sourceText());
          assert.equal(
            path.context.inspect([{ nodeId: path.id, fields: ['calleeName', 'calleePath'] }])[0]
              .type,
            'CallExpression',
          );
          assert.equal(
            path.context.query({ globals: [{ name: 'select', references: true }] }).globals.select
              .references.length,
            1,
          );
          assert.deepEqual(
            path.context
              .query({ calls: [{ callee: 'select', globalOnly: true, staticArguments: true }] })
              .calls.select.map(call => ({
                calleeName: call.calleeName,
                calleeGlobal: call.calleeGlobal,
                staticArgument: call.staticArgument,
              })),
            [{ calleeName: 'select', calleeGlobal: true, staticArgument: 'web' }],
          );

          observed.add('code');
          assert.equal(path.context.code.identifier('validName').code, 'validName');
          assert.equal(path.context.code.stringLiteral('value').code, '"value"');
          assert.equal(path.context.code.literal(2n).code, '2n');
          assert.equal(path.context.code.parseExpression('1 + 2').code, '1 + 2');
          assert.match(
            path.context.code.parseStatements('const parsed = true;').code,
            /const parsed/,
          );
          assert.equal(path.context.editor.slice(path.start, path.end), path.sourceText());
          assert.equal(path.context.editor.toString(), source);
          assert.equal(path.context.editor.isEmpty(), false);
          assert.equal(path.context.editor.hasChanged(), false);
        },
      ),
    ],
    post(context) {
      context.ensureHelper('integration/helper', 'const helper = true;');
      context.prependToProgram('const before = helper;');
      context.appendToProgram('const after = before;');
      context.metadata.set('observed', [...observed].sort());
    },
  });
  const source = [
    `'use strict';`,
    `function choose(value) {`,
    `  const local = select('web');`,
    `  Platform.select('native');`,
    `  return local;`,
    `}`,
  ].join('\n');
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'observe', plugins: [observer] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.metadata.observed, [
    'ancestry',
    'children',
    'code',
    'context',
    'identity',
    'member-call-path',
    'scope',
  ]);
  assert.match(result.code, /'use strict';\nconst helper = true;\nconst before = helper;/);
  assert.match(result.code, /const after = before;\n$/);
});
