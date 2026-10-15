import assert from 'node:assert/strict';
import { test } from 'vitest';

import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test('rejects conflicting edits transactionally', () => {
  const plugin = (name: string) =>
    defineNativePlugin({
      name,
      visitors: [defineVisitor('Identifier', {}, path => path.replaceWith(name))],
    });
  assert.throws(
    () =>
      transform(
        'const value = 1',
        'fixture.js',
        defineNativePipeline({
          phases: [{ name: 'source', plugins: [plugin('a'), plugin('b')] }],
        }),
      ),
    /overlapping edits/,
  );
});

test('expands union visitor keys before native subscription planning', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'union',
    visitors: [
      defineVisitor('ImportDeclaration|ExportNamedDeclaration', {}, path =>
        seen.push(path.node.type),
      ),
    ],
  });
  transform(
    "import value from 'source'; export { value }",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(seen, ['ImportDeclaration', 'ExportNamedDeclaration']);
});

test('expands the Expression alias consistently for literal expressions', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'expressions',
    visitors: [defineVisitor('Expression', {}, path => seen.push(path.node.type))],
  });
  transform(
    'true; 1; "value"; null; /value/;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.ok(seen.includes('BooleanLiteral'));
  assert.ok(seen.includes('NumericLiteral'));
  assert.ok(seen.includes('StringLiteral'));
  assert.ok(seen.includes('NullLiteral'));
  assert.ok(seen.includes('RegExpLiteral'));
});

test('treats declarations as Babel statements despite collapsed Oxc node kinds', () => {
  const declarations: string[] = [];
  const statements: string[] = [];
  const plugin = defineNativePlugin({
    name: 'declaration-alias',
    visitors: [
      defineVisitor('Declaration', {}, path => {
        declarations.push(path.node.type);
      }),
      defineVisitor('Statement', {}, path => {
        statements.push(path.node.type);
      }),
    ],
  });
  transform(
    "import value from 'pkg'; const item = value; function fn() {} class Example {} export { item };",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(declarations, [
    'ImportDeclaration',
    'VariableDeclaration',
    'Function',
    'Class',
    'ExportNamedDeclaration',
  ]);
  assert.deepEqual(statements, declarations);
});

test('provides parent paths backed by native indexed records', () => {
  let parentType: string | undefined;
  const plugin = defineNativePlugin({
    name: 'parent',
    visitors: [
      defineVisitor('NumericLiteral', { ancestry: { mode: 'parent' } }, path => {
        parentType = path.parentPath?.node.type;
      }),
    ],
  });
  transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.equal(parentType, 'VariableDeclarator');
});

test('provides source locations, parent summaries, and self-inclusive ancestry search', () => {
  let observed: unknown;
  const plugin = defineNativePlugin({
    name: 'path-observation',
    visitors: [
      defineVisitor('NumericLiteral', { ancestry: { mode: 'programParent' } }, path => {
        observed = {
          location: path.getLocation(),
          parentType: path.parent?.type,
          self: path.find(candidate => candidate.id === path.id) === path,
        };
      }),
    ],
  });
  transform(
    'const value =\n  1;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'observe', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, {
    location: { start: { line: 2, column: 2 }, end: { line: 2, column: 3 } },
    parentType: 'VariableDeclarator',
    self: true,
  });
});

test('supports wildcard child access through getChildren', () => {
  let childTypes: string[] = [];
  const plugin = defineNativePlugin({
    name: 'all-children',
    visitors: [
      defineVisitor('Program', { children: { '*': { route: '*' } } }, path => {
        childTypes = path.getChildren().map(child => child.node.type);
      }),
    ],
  });
  transform(
    'const value = 1; use(value);',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'children', plugins: [plugin] }] }),
  );
  assert.deepEqual(childTypes, ['VariableDeclaration', 'ExpressionStatement']);
});

test('preserves nested wildcard contracts through runtime enumeration', () => {
  let binding: string | undefined;
  const plugin = defineNativePlugin({
    name: 'nested-wildcard-children',
    visitors: [
      defineVisitor(
        'Program',
        {
          children: {
            '*': {
              route: 'VariableDeclaration',
              children: {
                '*': {
                  route: 'VariableDeclarator',
                  children: { id: { route: 'Identifier', fields: ['name'] } },
                },
              },
            },
          },
        },
        path => {
          binding = path.getChildren()[0]?.getChildren()[0]?.getChild('id')?.node.name;
        },
      ),
    ],
  });
  transform(
    'const value = 1;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'children', plugins: [plugin] }] }),
  );
  assert.equal(binding, 'value');
});

test('supports path mutation aliases, insertion, and comments', () => {
  const plugin = defineNativePlugin({
    name: 'path-mutations',
    visitors: [
      defineVisitor('NumericLiteral', { fields: ['value'] }, path => {
        if (path.node.value === 1) path.update('2');
        else if (path.node.value === 3) path.overwrite('4');
        else if (path.node.value === 5) path.insertBefore('/* before */');
        else if (path.node.value === 6) path.addComment('trailing', ' after ');
      }),
    ],
  });
  const result = transform(
    '[1, 3, 5, 6];',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'mutate', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, '[2, 4, /* before */5, 6/* after */];');
});

test('provides lazy ancestor helpers without recursive node materialization', () => {
  let ancestors: unknown;
  const plugin = defineNativePlugin({
    name: 'ancestors',
    visitors: [
      defineVisitor('NumericLiteral', { ancestry: { mode: 'programParent' } }, path => {
        ancestors = [
          path.findParent(parent => parent.node.type === 'ReturnStatement')?.node.type,
          path.getFunctionParent()?.node.type,
          path.getProgramParent()?.node.type,
        ];
      }),
    ],
  });
  transform(
    'function fixture() { return 1 }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(ancestors, ['ReturnStatement', 'Function', 'Program']);
});

test('enforces direct, bounded, and function-parent ancestry reach', () => {
  const observed: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'ancestry-reach',
    visitors: [
      defineVisitor('NumericLiteral', { ancestry: { mode: 'parent' } }, path => {
        // @ts-expect-error Direct-parent mode deliberately does not expose a second hop.
        observed.push(['parent', path.parentPath?.node.type, path.parentPath?.parentPath]);
      }),
      defineVisitor('NumericLiteral', { ancestry: { mode: 2 } }, path => {
        observed.push([
          'bounded',
          path.parentPath?.node.type,
          path.parentPath?.parentPath?.node.type,
          path.parentPath?.parentPath?.parentPath,
        ]);
      }),
      defineVisitor('NumericLiteral', { ancestry: { mode: 'functionParent' } }, path => {
        observed.push(['function', path.getFunctionParent()?.node.type]);
      }),
    ],
  });
  transform(
    'function fixture() { return 1 }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, [
    ['parent', 'ReturnStatement', null],
    ['bounded', 'ReturnStatement', 'FunctionBody', null],
    ['function', 'Function'],
  ]);
});

test('hydrates declared ancestor fields in the initial routed envelope', () => {
  const names: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'ancestor-fields',
    visitors: [
      defineVisitor(
        'CallExpression',
        {
          ancestry: {
            mode: 'findParent',
            routes: {
              VariableDeclarator: { fields: ['bindingName'] },
              AssignmentExpression: { fields: ['targetName'] },
            },
          },
        },
        path => {
          const owner = path.findParent(
            parent =>
              parent.node.type === 'VariableDeclarator' ||
              parent.node.type === 'AssignmentExpression',
          );
          if (owner?.node.type === 'VariableDeclarator') names.push(owner.node.bindingName);
          if (owner?.node.type === 'AssignmentExpression') names.push(owner.node.targetName);
        },
      ),
    ],
  });
  transform(
    'const Foo = create(); exports.Bar = create(); obj["Baz"] = create(); obj[key] = create();',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(names, ['Foo', 'Bar', 'Baz', undefined]);
});

test('unions overlapping alias and concrete ancestor route fields', () => {
  let observed: unknown;
  const plugin = defineNativePlugin({
    name: 'ancestor-alias-union',
    visitors: [
      defineVisitor(
        'Identifier',
        {
          where: { name: { equals: 'object' } },
          ancestry: {
            mode: 'parent',
            routes: {
              MemberExpression: { fields: ['memberPath'] },
              StaticMemberExpression: { fields: ['computed'] },
            },
          },
        },
        path => {
          const parent = path.parentPath;
          if (parent?.node.type === 'StaticMemberExpression')
            observed = [parent.node.type, parent.node.memberPath, parent.node.computed];
        },
      ),
    ],
  });
  transform(
    'object.property;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, ['StaticMemberExpression', 'object.property', false]);
});

test('projects simple binding names and unambiguous plain-assignment targets', () => {
  const bindings: unknown[] = [];
  const targets: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'assignment-fields',
    visitors: [
      defineVisitor('VariableDeclarator', { fields: ['bindingName'] }, path => {
        bindings.push(path.node.bindingName);
      }),
      defineVisitor('AssignmentExpression', { fields: ['operator', 'targetName'] }, path =>
        targets.push([path.node.operator, path.node.targetName]),
      ),
    ],
  });
  transform(
    [
      'const value = 1, { nested } = source;',
      'Foo = value;',
      'exports.Bar = value;',
      'obj["Baz"] = value;',
      'obj[key] = value;',
      '({ nested } = value);',
      'Foo += value;',
    ].join('\n'),
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(bindings, ['value', undefined]);
  assert.deepEqual(targets, [
    ['=', 'Foo'],
    ['=', 'Bar'],
    ['=', 'Baz'],
    ['=', undefined],
    ['=', undefined],
    ['+=', undefined],
  ]);
});

test('hydrates ancestor child roles and provenance without follow-up native batches', () => {
  let observed: unknown;
  const plugin = defineNativePlugin({
    name: 'ancestor-children',
    visitors: [
      defineVisitor(
        'Identifier',
        {
          where: { name: { equals: 'value' } },
          ancestry: {
            mode: 'findParent',
            routes: {
              TryStatement: {
                children: { block: { route: 'BlockStatement' } },
              },
            },
          },
        },
        path => {
          const statement = path.findParent(parent => parent.node.type === 'TryStatement');
          const block = statement?.getChild('block');
          observed = {
            statement: statement?.node.id,
            block: block?.node.id,
            source: block?.getSource().text(),
            parent: block?.parentPath?.node.id,
          };
        },
      ),
    ],
  });
  transform(
    'try /* gap */ { use(value); } catch {}',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, {
    statement: 1,
    block: 2,
    source: '{ use(value); }',
    parent: 1,
  });
});

test('keeps hydrated ancestor capabilities identical on enter and exit', () => {
  const observed: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'ancestor-enter-exit',
    visitors: [
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
    ],
  });
  transform(
    'const owner = create();',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, ['owner', 'owner']);
});

test('plans independent ancestry requirements for nested traversal visitors', () => {
  const observed: unknown[] = [];
  const nested = [
    defineVisitor(
      'CallExpression',
      {
        ancestry: {
          mode: 'findParent',
          routes: { VariableDeclarator: { fields: ['bindingName'] } },
        },
      },
      path => {
        const owner = path.findParent(parent => parent.node.type === 'VariableDeclarator');
        observed.push(owner?.node.type === 'VariableDeclarator' && owner.node.bindingName);
      },
    ),
  ];
  const plugin = defineNativePlugin({
    name: 'nested-ancestry',
    visitors: [
      defineVisitor('Function', { controlFlow: ['nested-traverse'], nested }, path =>
        path.traverse(nested),
      ),
    ],
  });
  transform(
    'function fixture() { const nestedOwner = create(); }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, ['nestedOwner']);
});

test('rejects ancestor child roles omitted from a visitor despite phase-unioned hydration', () => {
  let error: unknown;
  const hydrated = defineNativePlugin({
    name: 'child-reader',
    visitors: [
      defineVisitor(
        'Identifier',
        {
          ancestry: {
            mode: 'findParent',
            routes: {
              TryStatement: { children: { block: { route: 'BlockStatement' } } },
            },
          },
        },
        () => {},
      ),
    ],
  });
  const structural = defineNativePlugin({
    name: 'child-structural',
    visitors: [
      defineVisitor('Identifier', { ancestry: { mode: 'findParent' } }, path => {
        try {
          // @ts-expect-error Deliberately exercise per-visitor child capability isolation.
          path.findParent(parent => parent.node.type === 'TryStatement')?.getChild('block');
        } catch (caught) {
          error = caught;
        }
      }),
    ],
  });
  transform(
    'try { use(value); } catch {}',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [hydrated, structural] }] }),
  );
  assert.match(String(error), /child-structural: undeclared child role TryStatement\.block/);
});

test('requires ancestry and scope payloads to be declared', () => {
  const ancestry = defineNativePlugin({
    name: 'undeclared-ancestry',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        // @ts-expect-error This test verifies the runtime guard for undeclared ancestry.
        void path.parentPath;
      }),
    ],
  });
  const scope = defineNativePlugin({
    name: 'undeclared-scope',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        // @ts-expect-error This test verifies the runtime guard for undeclared scope.
        void path.scope;
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        'value',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [ancestry] }] }),
      ),
    /undeclared ancestry access/,
  );
  assert.throws(
    () =>
      transform(
        'value',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'visit', plugins: [scope] }] }),
      ),
    /undeclared scope semantics/,
  );
});

test('selects the phases a plugin runs in by inclusion and validates expression fragments natively', () => {
  const visited: string[] = [];
  const plugin = defineNativePlugin({
    name: 'phased',
    visitors: [
      defineVisitor('Program', {}, path => {
        visited.push(path.context.phase);
        assert.throws(
          () => path.context.code.parseExpression('value +'),
          /invalid expression fragment/,
        );
      }),
    ],
  });
  transform(
    'value',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'first', plugins: [] },
        { name: 'second', plugins: [plugin] },
      ],
    }),
  );
  assert.deepEqual(visited, ['second']);
});

test('builds escaped primitive literals and validates statement fragments', () => {
  const plugin = defineNativePlugin({
    name: 'code-factory',
    visitors: [
      defineVisitor('Program', {}, path => {
        assert.equal(path.context.code.literal('quoted\nvalue').code, '"quoted\\nvalue"');
        assert.equal(path.context.code.literal(12n).code, '12n');
        path.appendToBody(
          path.context.code.parseStatements('\nexport const generated = null;').code,
        );
        assert.throws(
          () => path.context.code.parseStatements('export const ='),
          /invalid statement fragment/,
        );
      }),
    ],
  });
  const result = transform(
    'const original = true;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'generate', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const original = true;\nexport const generated = null;');
});

test('projects static call paths and their root globality without child or scope access', () => {
  const calls: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'static-call-facts',
    visitors: [
      defineVisitor(
        'CallExpression',
        { fields: ['calleeName', 'calleePath', 'calleeGlobal'] },
        path => {
          calls.push({
            name: path.node.calleeName,
            path: path.node.calleePath,
            global: path.node.calleeGlobal,
          });
        },
      ),
    ],
  });
  transform(
    'require.resolveWeak("a"); function local(require){require.context("./b")} invoke();',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'calls', plugins: [plugin] }] }),
  );
  assert.deepEqual(calls, [
    { name: undefined, path: 'require.resolveWeak', global: true },
    { name: undefined, path: 'require.context', global: false },
    { name: 'invoke', path: 'invoke', global: true },
  ]);
});
