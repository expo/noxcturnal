import assert from 'node:assert/strict';
import { test } from 'vitest';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { Worker } from 'node:worker_threads';

import type { SourceFragment } from '../../dist/index.js';
import {
  classify,
  compilePhasePlan,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  NativeTransformError,
  pipelineCacheKey,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
} from '../../dist/index.js';
import { NativeTransformSession } from '../../dist/runtime/session.js';
import { native } from '../../dist/native/binding.js';
import { packEdits } from '../../dist/protocol/edits.js';
import { decodeRoutedEnvelope } from '../../dist/protocol/events.js';
import { packRouteManifest } from '../../dist/protocol/manifest.js';

const ALL_RETAINED_CAPABILITIES = (1 << 6) - 1;
const openRetained = (
  source: string,
  filename: string,
  options: ConstructorParameters<typeof NativeTransformSession>[2] = {},
) =>
  new NativeTransformSession(
    source,
    filename,
    options,
    packRouteManifest([], false, false, ALL_RETAINED_CAPABILITIES),
  );

test('provides lazy compact structural child roles without recursive ESTree transfer', () => {
  const observed: Record<string, string[]> = {};
  const sources = (value: ReturnType<any>) =>
    (Array.isArray(value) ? value : value ? [value] : []).map(path => path.sourceText());
  const plugin = defineNativePlugin({
    name: 'child-roles',
    visitors: [
      defineVisitor('Program', { children: { body: { route: 'Statement' } } }, path => {
        observed.body = sources(path.get('body'));
      }),
      defineVisitor(
        'ImportDeclaration',
        {
          children: {
            specifiers: { route: 'ImportSpecifier' },
            source: { route: 'StringLiteral' },
          },
        },
        path => {
          observed.specifiers = sources(path.get('specifiers'));
          observed.source = sources(path.get('source'));
        },
      ),
      defineVisitor(
        'VariableDeclarator',
        { children: { id: { route: 'Identifier' }, init: { route: 'Expression' } } },
        path => {
          if (path.sourceText().includes('result')) {
            observed.id = sources(path.get('id'));
            observed.init = sources(path.get('init'));
          }
        },
      ),
      defineVisitor(
        'CallExpression',
        { children: { callee: { route: 'Expression' }, arguments: { route: 'Expression' } } },
        path => {
          observed.callee = sources(path.get('callee'));
          observed.arguments = sources(path.get('arguments'));
        },
      ),
      defineVisitor(
        'ObjectProperty',
        { children: { key: { route: 'Identifier' }, value: { route: 'Expression' } } },
        path => {
          observed.key = sources(path.get('key'));
          observed.value = sources(path.get('value'));
        },
      ),
      defineVisitor(
        'Function',
        {
          children: {
            params: { route: 'FormalParameters', children: { '*': { route: '*' } } },
          },
        },
        path => {
          observed.params = sources(path.get('params'));
        },
      ),
      defineVisitor(
        'ExportDefaultDeclaration',
        { children: { declaration: { route: 'Expression' } } },
        path => {
          observed.declaration = sources(path.get('declaration'));
        },
      ),
    ],
  });
  transform(
    "import item, { x as y } from 'pkg'; function f(a, { b }) {} const result = fn({ platform: 1 }, y); export default result;",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'inspect', plugins: [plugin] }] }),
    { maxFollowUpBatches: 2 },
  );
  assert.deepEqual(observed.callee, ['fn']);
  assert.deepEqual(observed.arguments, ['{ platform: 1 }', 'y']);
  assert.deepEqual(observed.key, ['platform']);
  assert.deepEqual(observed.value, ['1']);
  assert.deepEqual(observed.id, ['result']);
  assert.deepEqual(observed.init, ['fn({ platform: 1 }, y)']);
  assert.deepEqual(observed.source, ["'pkg'"]);
  assert.deepEqual(observed.specifiers, ['item', 'x as y']);
  assert.deepEqual(observed.params, ['a', '{ b }']);
  assert.deepEqual(observed.declaration, ['result']);
  assert.equal(observed.body.length, 4);
});

test('requires structural child roles to be declared before parsing', () => {
  const plugin = defineNativePlugin({
    name: 'undeclared-child',
    visitors: [
      defineVisitor('CallExpression', {}, path => {
        // @ts-expect-error This test verifies the runtime guard for an undeclared child capability.
        path.get('arguments');
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        'run(1)',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
      ),
    /undeclared child role CallExpression\.arguments/,
  );
});

test('distinguishes control-flow and class child roles needed by structural fixes', () => {
  const observed: Record<string, string | null> = {};
  const one = (value: unknown) =>
    value && !Array.isArray(value) ? (value as { sourceText(): string }) : null;
  const plugin = defineNativePlugin({
    name: 'structural-roles',
    visitors: [
      defineVisitor(
        'TryStatement',
        {
          children: {
            block: { route: 'BlockStatement' },
            handler: { route: 'CatchClause' },
            finalizer: { route: 'BlockStatement' },
          },
        },
        path => {
          observed.block = one(path.get('block'))?.sourceText() ?? null;
          observed.handler = one(path.get('handler'))?.sourceText() ?? null;
          observed.finalizer = one(path.get('finalizer'))?.sourceText() ?? null;
        },
      ),
      defineVisitor(
        'Class',
        {
          fields: ['name'],
          children: { superClass: { route: 'Expression' }, body: { route: 'ClassBody' } },
        },
        path => {
          observed.superClass = one(path.get('superClass'))?.sourceText() ?? null;
          observed.classBody = one(path.get('body'))?.sourceText() ?? null;
        },
      ),
      defineVisitor(
        'DoWhileStatement',
        { children: { body: { route: 'Statement' }, test: { route: 'Expression' } } },
        path => {
          observed.doWhileBody = one(path.get('body'))?.sourceText() ?? null;
          observed.doWhileTest = one(path.get('test'))?.sourceText() ?? null;
        },
      ),
    ],
  });
  transform(
    'try { work() } catch (error) { recover(error) } finally { cleanup() } class Child extends Parent { method() {} } do { tick() } while (ready)',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'inspect', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, {
    block: '{ work() }',
    handler: 'catch (error) { recover(error) }',
    finalizer: '{ cleanup() }',
    superClass: 'Parent',
    classBody: '{ method() {} }',
    doWhileBody: '{ tick() }',
    doWhileTest: 'ready',
  });
});

test('serves every generated child role family through the runtime selector', () => {
  const observed: Record<string, string[]> = {};
  const collect = (key: string, value: unknown) => {
    const paths = Array.isArray(value) ? value : value == null ? [] : [value];
    (observed[key] ??= []).push(
      ...paths.map(path => (path as { sourceText(): string }).sourceText()),
    );
  };
  const plugin = defineNativePlugin({
    name: 'generated-child-roles',
    visitors: [
      defineVisitor(
        'IfStatement',
        {
          children: {
            test: { route: 'Expression' },
            consequent: { route: 'Statement' },
            alternate: { route: 'Statement' },
          },
        },
        path => {
          collect('test', path.get('test'));
          collect('consequent', path.get('consequent'));
          collect('alternate', path.get('alternate'));
        },
      ),
      defineVisitor(
        'BinaryExpression',
        { children: { left: { route: 'Expression' }, right: { route: 'Expression' } } },
        path => {
          collect('left', path.get('left'));
          collect('right', path.get('right'));
        },
      ),
      defineVisitor(
        'StaticMemberExpression',
        { children: { object: { route: 'Expression' }, property: { route: 'Identifier' } } },
        path => {
          collect('object', path.get('object'));
          collect('property', path.get('property'));
        },
      ),
      defineVisitor(
        'ReturnStatement',
        { children: { argument: { route: 'Expression' } } },
        path => {
          collect('argument', path.get('argument'));
        },
      ),
      defineVisitor(
        'ArrayExpression',
        { children: { elements: { route: 'Expression' } } },
        path => {
          collect('elements', path.get('elements'));
        },
      ),
      defineVisitor('Program', { children: { directives: { route: 'Directive' } } }, path => {
        collect('directives', path.get('directives'));
      }),
    ],
  });
  transform(
    "'use strict';\nfunction pick() { if (flags.enabled === true) { return [first, second]; } else { return null; } }",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'inspect', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, {
    test: ['flags.enabled === true'],
    consequent: ['{ return [first, second]; }'],
    alternate: ['{ return null; }'],
    left: ['flags.enabled'],
    right: ['true'],
    object: ['flags'],
    property: ['enabled'],
    argument: ['[first, second]', 'null'],
    elements: ['first', 'second'],
    directives: ["'use strict';"],
  });
});

test('rejects unknown child roles at definition time and names the valid set', () => {
  const plugin = defineNativePlugin({
    name: 'bad-child-role',
    visitors: [
      defineVisitor(
        'VariableDeclaration',
        { children: { nonsenseRole: { route: 'VariableDeclarator' } } } as never,
        () => {},
      ),
    ],
  });
  assert.throws(
    () =>
      transform(
        'let x = 1;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
      ),
    /unknown child role nonsenseRole for route VariableDeclaration \(valid roles: declarations\)/,
  );
});

test('rejects child routes a role cannot deliver at definition time', () => {
  const plugin = defineNativePlugin({
    name: 'bad-child-route',
    visitors: [
      defineVisitor(
        'VariableDeclaration',
        { children: { declarations: { route: 'Identifier' } } } as never,
        () => {},
      ),
    ],
  });
  assert.throws(
    () =>
      transform(
        'let x = 1;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
      ),
    /child role VariableDeclaration\.declarations cannot deliver route Identifier/,
  );
});

test('rejects unknown segments in composite child routes at definition time', () => {
  const plugin = defineNativePlugin({
    name: 'bad-composite-child-route',
    visitors: [
      defineVisitor(
        'VariableDeclarator',
        { children: { init: { route: 'Identifier|Garbage' } } } as never,
        () => {},
      ),
    ],
  });
  assert.throws(
    () =>
      transform(
        'let x = value;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
      ),
    /unknown child route for role init Garbage/,
  );
});

test('rejects predicate values incompatible with their generated field type', () => {
  const incompatibleKind = defineNativePlugin({
    name: 'bad-predicate-kind',
    visitors: [
      defineVisitor('VariableDeclaration', { where: { kind: { equals: 42 } } } as never, () => {}),
    ],
  });
  assert.throws(
    () =>
      transform(
        'let x = 1;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [incompatibleKind] }] }),
      ),
    /incompatible scalar value for VariableDeclaration\.kind/,
  );

  const invalidUnionMember = defineNativePlugin({
    name: 'bad-predicate-union-member',
    visitors: [
      defineVisitor(
        'VariableDeclaration',
        { where: { kind: { equals: 'sideways' } } } as never,
        () => {},
      ),
    ],
  });
  assert.throws(
    () =>
      transform(
        'let x = 1;',
        'fixture.js',
        defineNativePipeline({
          phases: [{ name: 'visit', plugins: [invalidUnionMember] }],
        }),
      ),
    /incompatible scalar value for VariableDeclaration\.kind/,
  );
});

test('implements a Platform.select-style transform through declared compact roles', () => {
  const plugin = defineNativePlugin({
    name: 'platform-select',
    visitors: [
      defineVisitor(
        'CallExpression',
        {
          children: {
            callee: { route: 'Expression' },
            arguments: {
              route: 'ObjectExpression',
              children: {
                properties: {
                  route: 'ObjectProperty',
                  fields: ['computed', 'key'],
                  children: { value: { route: 'Expression' } },
                },
              },
            },
          },
        },
        path => {
          const callee = path.getChild('callee');
          if (!callee?.matchesPattern('Platform.select')) return;
          const argument = path.getChildList('arguments')[0];
          if (!argument?.is('ObjectExpression')) return;
          const properties = argument.getChildList('properties');
          if (
            properties.some(
              property =>
                property.node.type !== 'ObjectProperty' || property.node.computed === true,
            )
          )
            return;
          const selected =
            properties.find(property => property.node.key === 'ios') ??
            properties.find(property => property.node.key === 'native') ??
            properties.find(property => property.node.key === 'default');
          const value = selected?.getChild('value');
          if (value) path.replaceWith(value.getSource());
        },
      ),
    ],
  });
  const result = transform(
    "const selected = Platform.select({ web: 'web', native: makeNative(), ios: 'ios' });",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'platform', plugins: [plugin] }] }),
    { maxFollowUpBatches: 2 },
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, "const selected = 'ios';");
});
