import assert from 'node:assert/strict';
import { test, vi } from 'vitest';
import { NativeTransformSession } from '../session';
import { native } from '../../native/binding';
import { packRouteManifest } from '../../protocol/manifest';

import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

// Observe packed hydration from either native entry point. Root-only queries
// returning no batch do not count as child hydration.
function observeChildBatches() {
  const explicit = vi.spyOn(native.NativeIndexedSession.prototype, 'childrenPackedBuffer');
  const routed = vi.spyOn(native.NativeIndexedSession.prototype, 'childrenRoutedPackedBuffer');
  return {
    get batches() {
      return [...explicit.mock.results, ...routed.mock.results].flatMap(result =>
        result.type === 'return' && result.value ? [result.value] : [],
      );
    },
    mockClear() {
      explicit.mockClear();
      routed.mockClear();
    },
    mockRestore() {
      explicit.mockRestore();
      routed.mockRestore();
    },
  };
}
function childParentCount(batch: { edges: Buffer }): number {
  const words = new Uint32Array(
    batch.edges.buffer,
    batch.edges.byteOffset,
    batch.edges.byteLength / 4,
  );
  let count = 0;
  for (let offset = 0; offset < words.length; count++) offset += 2 + words[offset + 1] * 2;
  return count;
}
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
        {
          children: {
            callee: { route: 'Expression', fields: ['name', 'memberPath'] },
            arguments: { route: 'Expression' },
          },
        },
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
            params: { route: 'FormalParameter|FormalParameterRest' },
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

test('keeps same-typed sibling fields under distinct native role ids', () => {
  const observed: Array<[string | undefined, string | undefined]> = [];
  const plugin = defineNativePlugin({
    name: 'same-typed-siblings',
    visitors: [
      defineVisitor(
        'BinaryExpression',
        {
          children: {
            left: { route: 'Identifier', fields: ['name'] },
            right: { route: 'Identifier', fields: ['name'] },
          },
        },
        path =>
          observed.push([path.getChild('left')?.node.name, path.getChild('right')?.node.name]),
      ),
    ],
  });
  transform(
    'left + right;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'siblings', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, [['left', 'right']]);
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

test('preserves trailing rest children in projected public pattern lists', () => {
  const observed: Record<string, string[]> = {};
  const collect = (key: string, paths: readonly { sourceText(): string }[]) => {
    observed[key] = paths.map(path => path.sourceText());
  };
  const plugin = defineNativePlugin({
    name: 'mixed-native-child-edges',
    visitors: [
      defineVisitor(
        'ObjectPattern',
        {
          children: {
            properties: { route: 'BindingProperty|BindingRestElement' },
          },
        },
        path => collect('object', path.getChildList('properties')),
      ),
      defineVisitor(
        'ArrayPattern',
        {
          children: {
            elements: {
              route: 'Identifier|ObjectPattern|ArrayPattern|AssignmentPattern|BindingRestElement',
            },
          },
        },
        path => collect('array', path.getChildList('elements')),
      ),
    ],
  });
  transform(
    'const { value, ...objectRest } = input; const [first, ...arrayRest] = values;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'inspect', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, {
    object: ['value', '...objectRest'],
    array: ['first', '...arrayRest'],
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
            callee: { route: 'Expression', fields: ['name', 'memberPath'] },
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
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, "const selected = 'ios';");
});

test('wildcard enumeration does not authorize arbitrary named child access', () => {
  let error: unknown;
  const plugin = defineNativePlugin({
    name: 'wildcard-is-enumeration-only',
    visitors: [
      defineVisitor('VariableDeclarator', { children: { '*': { route: '*' } } }, path => {
        assert.deepEqual(
          path.getChildren().map(child => child.node.type),
          ['Identifier', 'NumericLiteral'],
        );
        try {
          (path as unknown as { getChild(role: string): unknown }).getChild('id');
        } catch (caught) {
          error = caught;
        }
      }),
    ],
  });
  const result = transform(
    'const value = 1;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.match(
    String(error),
    /wildcard-is-enumeration-only: undeclared child role VariableDeclarator\.id/,
  );
});

test('projects flattened arrow parameters with parser-accurate binding roles', () => {
  const observed: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'parameter-shape',
    visitors: [
      defineVisitor(
        'ArrowFunctionExpression',
        {
          children: {
            params: {
              route: 'FormalParameter|FormalParameterRest|BindingRestElement',
              children: {
                pattern: { route: 'Identifier|ObjectPattern|ArrayPattern' },
                default: { route: 'Expression' },
                argument: { route: 'BindingRestElement' },
              },
            },
          },
        },
        path => {
          observed.push(
            path.getChildList('params').map(parameter =>
              parameter.node.type === 'FormalParameterRest'
                ? {
                    type: parameter.node.type,
                    pattern: undefined,
                    default: undefined,
                    argument: parameter.getChild('argument')?.node.type,
                  }
                : {
                    type: parameter.node.type,
                    pattern: parameter.getChild('pattern')?.node.type,
                    default: parameter.getChild('default')?.node.type,
                    argument: undefined,
                  },
            ),
          );
        },
      ),
    ],
  });
  transform(
    'const fn = async (value = 1, { item }, ...rest) => value;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'parameters', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, [
    [
      {
        type: 'FormalParameter',
        pattern: 'Identifier',
        default: 'NumericLiteral',
        argument: undefined,
      },
      {
        type: 'FormalParameter',
        pattern: 'ObjectPattern',
        default: undefined,
        argument: undefined,
      },
      {
        type: 'FormalParameterRest',
        pattern: undefined,
        default: undefined,
        argument: 'BindingRestElement',
      },
    ],
  ]);
});

test('batches child hydration for sparse matched parents and caches empty children', () => {
  const prefetch = observeChildBatches();
  const observed: string[][] = [];
  const plugin = defineNativePlugin({
    name: 'selective-children',
    visitors: [
      defineVisitor(
        'CallExpression',
        {
          fields: ['calleeName'],
          where: { calleeName: { equals: 'selected' } },
          children: { arguments: { route: 'Expression' } },
        },
        path => {
          observed.push(path.getChildList('arguments').map(child => child.sourceText()));
          path.getChildList('arguments');
        },
      ),
    ],
  });
  try {
    for (const size of [32, 64, 128]) {
      prefetch.mockClear();
      transform(
        `${'other(1);'.repeat(size)} selected(2); selected();`,
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'inspect', plugins: [plugin] }] }),
      );
      assert.equal(prefetch.batches.length, 1);
      assert.equal(childParentCount(prefetch.batches[0]), 2);
    }
    assert.deepEqual(observed, [['2'], [], ['2'], [], ['2'], []]);
  } finally {
    prefetch.mockRestore();
  }
});

test('hydrates recursive named children and empty lists in one native batch', () => {
  const children = observeChildBatches();
  const observed: number[][] = [];
  try {
    const plugin = defineNativePlugin({
      name: 'recursive-child-batch',
      visitors: [
        defineVisitor(
          'ExportNamedDeclaration',
          {
            children: {
              declaration: {
                route: 'VariableDeclaration',
                children: {
                  declarations: {
                    route: 'VariableDeclarator',
                    children: {
                      init: {
                        route: 'CallExpression',
                        children: {
                          arguments: { route: 'NumericLiteral', fields: ['value'] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          path => {
            for (const declaration of path.getChild('declaration')!.getChildList('declarations')) {
              const call = declaration.getChild('init')!;
              const values = call
                .getChildList('arguments')
                .map(arg => (arg.node.type === 'NumericLiteral' ? arg.node.value : -1));
              observed.push(values);
              assert.deepEqual(
                call
                  .getChildList('arguments')
                  .map(arg => (arg.node.type === 'NumericLiteral' ? arg.node.value : -1)),
                values,
              );
            }
          },
        ),
      ],
    });
    const result = transform(
      'export const first=run(), second=run(2, 3);',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
    );
    assert.equal(result.status, 'complete');
    assert.deepEqual(observed, [[], [2, 3]]);
    assert.equal(children.batches.length, 1);
    assert.ok(childParentCount(children.batches[0]) > 1);
  } finally {
    children.mockRestore();
  }
});

test('upgrades a direct child cache to a complete retained graph', () => {
  const session = new NativeTransformSession(
    'export const value=run(7);',
    'input.js',
    {},
    packRouteManifest(
      [],
      false,
      false,
      (1 << 6) - 1,
      {
        ExportNamedDeclaration: ['declaration'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['init'],
        CallExpression: ['arguments'],
      },
      { NumericLiteral: ['value'] },
    ),
  );
  const prefetch = vi.spyOn(session, 'prefetchChildren');
  try {
    const root = session.nodes(['ExportNamedDeclaration'])[0]!;
    session.prefetchChildren([root.id]);
    session.prefetchChildren([root.id], true);
    const declaration = session.children(root.id)[0]!;
    const binding = session.children(declaration.id)[0]!;
    const call = session.children(binding.id)[0]!;
    assert.deepEqual(
      session.children(call.id).map(event => session.nodeView(event).value),
      [7],
    );
    assert.equal(prefetch.mock.calls.length, 2);
  } finally {
    session.close();
  }
});

test('direct singular children preserve absent roles and list results remain independent', () => {
  const initializers: (string | null)[] = [];
  const lists: number[][] = [];
  const plugin = defineNativePlugin({
    name: 'direct-child-results',
    visitors: [
      defineVisitor('VariableDeclarator', { children: { init: { route: 'Expression' } } }, path => {
        initializers.push(path.getChild('init')?.sourceText() ?? null);
        assert.equal(Array.isArray(path.get('init')), false);
      }),
      defineVisitor(
        'CallExpression',
        { children: { arguments: { route: 'NumericLiteral', fields: ['value'] } } },
        path => {
          const first = path.getChildList('arguments');
          (first as unknown[]).pop();
          lists.push(
            path
              .getChildList('arguments')
              .map(child => (child.node.type === 'NumericLiteral' ? child.node.value : -1)),
          );
        },
      ),
    ],
  });
  const result = transform(
    'let missing; const present=run(1, 2);',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(initializers, [null, 'run(1, 2)']);
  assert.deepEqual(lists, [[1, 2]]);
});

test('keeps packed child groups separate across wide, empty, and mixed-role parents', () => {
  const values = Array.from({ length: 256 }, (_, index) => index);
  const observed: number[][] = [];
  const plugin = defineNativePlugin({
    name: 'packed-child-groups',
    visitors: [
      defineVisitor(
        'CallExpression',
        {
          children: {
            callee: { route: 'Identifier', fields: ['name'] },
            arguments: { route: 'NumericLiteral', fields: ['value'] },
          },
        },
        path => {
          const expectedName =
            observed.length === 0 ? 'wide' : observed.length === 1 ? 'empty' : 'last';
          for (let read = 0; read < 3; read++) {
            assert.equal(path.getChild('callee')?.node.name, expectedName);
            const children = path.getChildList('arguments');
            const actual = children.map(child =>
              child.node.type === 'NumericLiteral' ? child.node.value : -1,
            );
            if (read === 0) observed.push(actual);
            else assert.deepEqual(actual, observed[observed.length - 1]);
            (children as unknown[]).length = 0;
          }
        },
      ),
    ],
  });
  const result = transform(
    `wide(${values.join(',')}); empty(); last(999);`,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(observed, [values, [], [999]]);
});

test('shared child hydration plans follow each file analysis decision and delivery route IDs', () => {
  const prefetch = observeChildBatches();
  let active: string | undefined;
  const observed: string[][] = [];
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'inspect',
        plugins: [
          defineNativePlugin({
            name: 'scalar-only',
            visitors: [defineVisitor('Program', {}, () => {})],
          }),
          ...['first', 'second'].map(name =>
            defineNativePlugin({
              name,
              analyze: () =>
                active === name
                  ? { status: 'supported', analysis: undefined }
                  : { status: 'irrelevant' },
              visitors: [
                defineVisitor(
                  'CallExpression',
                  {
                    where: { calleeName: { equals: name } },
                    children: { arguments: { route: 'Expression' } },
                  },
                  path => {
                    observed.push([
                      name,
                      ...path.getChildList('arguments').map(arg => arg.sourceText()),
                    ]);
                  },
                ),
              ],
            }),
          ),
        ],
      },
    ],
  });
  try {
    for (const name of ['first', 'second', undefined, 'first']) {
      active = name;
      observed.length = 0;
      prefetch.mockClear();
      const result = transform('first(1);second(2);', `${name}.js`, pipeline);
      assert.equal(result.status, 'complete');
      if (result.status === 'complete') assert.equal(result.code, 'first(1);second(2);');
      assert.deepEqual(observed, name ? [[name, name === 'first' ? '1' : '2']] : []);
      assert.equal(prefetch.batches.length, name ? 1 : 0);
      if (name) assert.equal(childParentCount(prefetch.batches[0]), 1);
    }
  } finally {
    prefetch.mockRestore();
  }
});

test.each([false, true])(
  'scalar-only ancestry does not hydrate child graphs (nested=%s)',
  nested => {
    const prefetch = observeChildBatches();
    const observed: unknown[] = [];
    const leaf = [
      defineVisitor(
        'CallExpression',
        {
          ancestry: {
            mode: 'findParent',
            routes: { VariableDeclarator: { fields: ['bindingName'] } },
          },
        },
        {
          enter(path) {
            const owner = path.findParent(parent => parent.node.type === 'VariableDeclarator');
            observed.push(owner?.node.type === 'VariableDeclarator' && owner.node.bindingName);
          },
          exit(path) {
            const owner = path.findParent(parent => parent.node.type === 'VariableDeclarator');
            observed.push(owner?.node.type === 'VariableDeclarator' && owner.node.bindingName);
          },
        },
      ),
    ];
    const pipeline = defineNativePipeline({
      phases: [
        {
          name: 'inspect',
          plugins: [
            defineNativePlugin({
              name: 'scalar-ancestry',
              visitors: nested
                ? [
                    defineVisitor(
                      'Program',
                      { nested: leaf, controlFlow: ['nested-traverse'] },
                      path => path.traverse(leaf),
                    ),
                  ]
                : leaf,
            }),
          ],
        },
      ],
    });
    try {
      const result = transform('const owner = create();', 'input.js', pipeline);
      assert.equal(result.status, 'complete');
      if (result.status === 'complete') assert.equal(result.code, 'const owner = create();');
      assert.deepEqual(observed, ['owner', 'owner']);
      assert.equal(prefetch.batches.length, 0);
    } finally {
      prefetch.mockRestore();
    }
  },
);

test('empty child contracts do not request child hydration', () => {
  const prefetch = observeChildBatches();
  let visits = 0;
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'inspect',
        plugins: [
          defineNativePlugin({
            name: 'empty-children',
            visitors: [defineVisitor('CallExpression', { children: {} }, () => visits++)],
          }),
        ],
      },
    ],
  });
  try {
    const result = transform('read();', 'input.js', pipeline);
    assert.equal(result.status, 'complete');
    if (result.status === 'complete') assert.equal(result.code, 'read();');
    assert.equal(visits, 1);
    assert.equal(prefetch.batches.length, 0);
  } finally {
    prefetch.mockRestore();
  }
});
