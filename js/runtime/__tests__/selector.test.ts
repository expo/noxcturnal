import { expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  definePipelinePhase,
  defineVisitor,
  transform,
  pipelineCacheKey,
  parameter,
} from '../../index';
import { preparePhase } from '../../pipeline/routes';

for (const mode of ['routed', 'semantic', 'indexed', 'nested'] as const) {
  test(`parent filters match immediate AST parents for enter and exit (${mode})`, () => {
    const seen: string[] = [];
    const nested = [
      defineVisitor(
        { route: 'StaticMemberExpression', parent: { route: 'AssignmentExpression' } },
        {
          fields: ['memberPath'],
          where: { write: { equals: true } },
          ...(mode === 'semantic' ? { scope: true } : {}),
        },
        {
          enter(path) {
            seen.push(`enter:${path.node.memberPath}`);
          },
          exit(path) {
            seen.push(`exit:${path.node.memberPath}`);
          },
        },
      ),
    ];
    const plugin = defineNativePlugin({
      name: 'parent-filter',
      ...(mode === 'indexed'
        ? {
            contract: { queries: [{ exports: true }] },
            pre(context) {
              context.query({ exports: true });
            },
          }
        : {}),
      visitors:
        mode === 'nested'
          ? [
              defineVisitor('Program', { nested, controlFlow: ['nested-traverse'] }, path =>
                path.traverse(nested),
              ),
            ]
          : nested,
    });
    const source = `read.value; target.first = read.value; target.second += 1; target.third++; consume(target.fourth);`;
    expect(
      transform(
        source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'parent', plugins: [plugin] }] }),
      ).status,
    ).toBe('complete');
    expect(seen).toEqual([
      'enter:target.first',
      'exit:target.first',
      'enter:target.second',
      'exit:target.second',
    ]);
  });
}

test('parent matching needs no ancestry, scope, or retained index', () => {
  const seen: string[] = [];
  const phase = definePipelinePhase({
    name: 'parent',
    plugins: [
      defineNativePlugin({
        name: 'parent',
        visitors: [
          defineVisitor(
            { route: 'VariableDeclaration', parent: { route: 'Program' } },
            {},
            path => {
              seen.push(path.sourceText());
              expect(() => (path as unknown as { parentPath: unknown }).parentPath).toThrow(
                /ancestry/,
              );
            },
          ),
        ],
      }),
    ],
  });
  const prepared = preparePhase(phase);
  expect(prepared.includeParent).toBe(false);
  expect(prepared.includeScope).toBe(false);
  expect(prepared.requiresIndexBase).toBe(false);
  expect(prepared.retentionCapabilities).toBe(0);
  expect(
    transform(
      'const outer=1; function f(){const inner=2;} {const block=3;}',
      'input.js',
      defineNativePipeline({ phases: [phase] }),
    ).status,
  ).toBe('complete');
  expect(seen).toEqual(['const outer=1;']);
});

test('independent and coalesced visitors preserve their own parent filters and order', () => {
  const seen: string[] = [];
  const plugins = ['first', 'second'].map(name =>
    defineNativePlugin({
      name,
      visitors: [
        defineVisitor(
          { route: 'Identifier', parent: { route: 'CallExpression|ReturnStatement' } },
          { fields: ['name'] },
          path => seen.push(`${name}:${path.node.name}`),
        ),
        defineVisitor(
          { route: 'Identifier', parent: { route: 'VariableDeclarator' } },
          { fields: ['name'] },
          path => seen.push(`${name}:binding:${path.node.name}`),
        ),
      ],
    }),
  );
  expect(
    transform(
      'const value=other; function f(){return value;} consume(value);',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'parent', plugins }] }),
    ).status,
  ).toBe('complete');
  expect(seen).toEqual([
    'first:binding:value',
    'second:binding:value',
    'first:binding:other',
    'second:binding:other',
    'first:value',
    'second:value',
    'first:consume',
    'second:consume',
    'first:value',
    'second:value',
  ]);
});

test('Program has no parent and parent filters are part of the pipeline cache key', () => {
  const pipeline = (parent: 'Program' | 'BlockStatement') =>
    defineNativePipeline({
      phases: [
        {
          name: 'parent',
          plugins: [
            defineNativePlugin({
              name: 'parent',
              visitors: [
                defineVisitor({ route: 'Program', parent: { route: parent } }, {}, () => {
                  throw new Error('Program has no parent');
                }),
              ],
            }),
          ],
        },
      ],
    });
  const a = pipeline('Program');
  const b = pipeline('BlockStatement');
  expect(transform('', 'input.js', a).status).toBe('complete');
  expect(pipelineCacheKey(a, 'input.js')).not.toBe(pipelineCacheKey(b, 'input.js'));
});

test('selector kinds are validated and definitions are snapshotted', () => {
  for (const parent of [{ route: 'NotAType' }, { route: '' }, 42]) {
    expect(() =>
      defineNativePipeline({
        phases: [
          {
            name: 'invalid',
            plugins: [
              defineNativePlugin({
                name: 'invalid',
                visitors: [defineVisitor({ route: 'Identifier', parent } as any, {}, () => {})],
              }),
            ],
          },
        ],
      }),
    ).toThrow();
  }
  const parent = { route: 'Program' as const };
  const visitor = defineVisitor({ route: 'VariableDeclaration', parent }, {}, () => {});
  (parent as { route: string }).route = 'BlockStatement';
  expect(visitor.selector?.parent?.route).toBe('Program');
  expect(Object.isFrozen(visitor.selector?.parent)).toBe(true);
});

test('parent filters do not prune an IIFE containing assignment targets', () => {
  const declarations: string[] = [];
  const assignments: string[] = [];
  const plugin = defineNativePlugin({
    name: 'iife-parent-filters',
    visitors: [
      defineVisitor({ route: 'VariableDeclaration', parent: { route: 'Program' } }, {}, path => {
        declarations.push(path.sourceText());
      }),
      defineVisitor(
        { route: 'StaticMemberExpression', parent: { route: 'AssignmentExpression' } },
        {
          where: { write: { equals: true } },
          fields: ['memberPath'],
        },
        path => {
          assignments.push(path.node.memberPath!);
        },
      ),
    ],
  });
  const source = `const outer = 1; (function () { const inner = 2; module.exports = inner; })();`;
  expect(
    transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'iife', plugins: [plugin] }] }),
    ).status,
  ).toBe('complete');
  expect(declarations).toEqual(['const outer = 1;']);
  expect(assignments).toEqual(['module.exports']);
});

for (const mode of ['routed', 'semantic', 'indexed', 'nested'] as const) {
  test(`selectors compose predicates, parent and child roles without hydration (${mode})`, () => {
    const seen: string[] = [];
    const visitors = [
      defineVisitor(
        {
          route: 'AssignmentExpression',
          children: {
            left: {
              route: 'Identifier',
              where: { name: { equals: 'exports' }, global: { equals: true } },
            },
          },
        },
        {},
        {
          enter(path) {
            seen.push(`enter:${path.sourceText()}`);
            expect(() => (path as any).getChild('left')).toThrow(/child|children/i);
            expect(() => (path as any).scope).toThrow(/scope/);
          },
          exit(path) {
            seen.push(`exit:${path.sourceText()}`);
          },
        },
      ),
      defineVisitor(
        {
          route: 'CallExpression',
          where: { argumentCount: { equals: 2 } },
          children: {
            callee: {
              route: 'StaticMemberExpression',
              where: { property: { equals: 'assign' } },
              children: {
                object: {
                  route: 'Identifier',
                  where: { name: { equals: 'Object' }, global: { equals: true } },
                },
              },
            },
            arguments: {
              route: 'Identifier',
              index: 0,
              where: { name: { equals: 'exports' }, global: { equals: true } },
            },
          },
        },
        {},
        path => {
          seen.push(`call:${path.sourceText()}`);
        },
      ),
    ];
    const plugin = defineNativePlugin({
      name: 'selectors',
      ...(mode === 'indexed'
        ? {
            contract: { queries: [{ exports: true }] },
            pre(context) {
              context.query({ exports: true });
            },
          }
        : {}),
      visitors:
        mode === 'nested'
          ? [
              defineVisitor(
                'Program',
                { nested: visitors, controlFlow: ['nested-traverse'] },
                path => path.traverse(visitors),
              ),
            ]
          : visitors,
    });
    const peer = defineNativePlugin({
      name: 'semantic-peer',
      visitors: [defineVisitor('Program', { scope: true }, () => {})],
    });
    const phase = definePipelinePhase({
      name: mode,
      plugins: mode === 'semantic' ? [plugin, peer] : [plugin],
    });
    if (mode === 'routed') {
      expect(preparePhase(phase).requiresIndexBase).toBe(false);
      expect(preparePhase(phase).includeScope).toBe(false);
      expect(preparePhase(phase).childPrefetch).toBeUndefined();
    }
    expect(
      transform(
        `exports = 1; (function(){ exports = 2; Object.assign(exports, value); })();
      function shadow(exports, Object) { exports = 3; Object.assign(exports, value); }
      Object.assign(value, exports); Object.assign(exports); other.assign(exports, value);`,
        'input.js',
        defineNativePipeline({ phases: [phase] }),
      ).status,
    ).toBe('complete');
    expect(seen).toEqual([
      'enter:exports = 1',
      'exit:exports = 1',
      'enter:exports = 2',
      'exit:exports = 2',
      'call:Object.assign(exports, value)',
    ]);
  });
}

test('list selection is existential without index, handles missing children, and keeps aliases', () => {
  const seen: string[] = [];
  const visitors = [
    defineVisitor(
      {
        route: 'CallExpression',
        children: { arguments: { route: 'StringLiteral', where: { value: { equals: 'yes' } } } },
      },
      {},
      path => seen.push(path.sourceText()),
    ),
    defineVisitor(
      { route: 'ReturnStatement', children: { argument: { route: 'Identifier' } } },
      {},
      path => seen.push(path.sourceText()),
    ),
    defineVisitor(
      {
        route: 'Identifier',
        parent: { route: 'FunctionDeclaration', where: { async: { equals: true } } },
      },
      { fields: ['name'] },
      path => seen.push(path.node.name),
    ),
  ];
  expect(
    transform(
      `use('no', 'yes'); use('yes'); use(); function f(){return;} async function g(){return value;}`,
      'input.js',
      defineNativePipeline({
        phases: [
          { name: 'selectors', plugins: [defineNativePlugin({ name: 'selectors', visitors })] },
        ],
      }),
    ).status,
  ).toBe('complete');
  expect(seen).toEqual(["use('no', 'yes')", "use('yes')", 'g', 'return value;']);
});

test('selector conditions and legacy where are conjunctive and match fields stay private', () => {
  const seen: string[] = [];
  const visitor = defineVisitor(
    { route: 'Identifier', where: { name: { oneOf: ['one', 'two'] } } },
    { where: { name: { equals: 'two' } } },
    path => {
      expect(path.node).not.toHaveProperty('name');
      seen.push(path.sourceText());
    },
  );
  expect(
    transform(
      'one; two; three;',
      'input.js',
      defineNativePipeline({
        phases: [
          { name: 'match', plugins: [defineNativePlugin({ name: 'match', visitors: [visitor] })] },
        ],
      }),
    ).status,
  ).toBe('complete');
  expect(seen).toEqual(['two']);
});

test('selector roles, fields, list positions, depth and scalar values are validated', () => {
  const invalid = [
    { route: 'CallExpression', children: { missing: { route: 'Identifier' } } },
    { route: 'Identifier', paretn: { route: 'Program' } },
    { route: 'Identifier', fields: ['name'] },
    { route: 'Identifier', parent: { route: 'Program', wher: {} } },
    { route: 'CallExpression', children: { callee: { route: 'Identifier', index: 0 } } },
    { route: 'CallExpression', children: { arguments: { route: 'Identifier', index: -1 } } },
    { route: 'CallExpression', children: { arguments: { route: 'Identifier', index: 0.5 } } },
    { route: 'ImportDeclaration', children: { source: { route: 'Identifier' } } },
    { route: 'Identifier', where: { name: { equals: 42 } } },
    { route: 'Identifier', parent: { route: 'Identifier', where: { unknown: { equals: 1 } } } },
  ];
  for (const selector of invalid)
    expect(() =>
      defineNativePipeline({
        phases: [
          {
            name: 'invalid',
            plugins: [
              defineNativePlugin({
                name: 'invalid',
                visitors: [defineVisitor(selector as any, {}, () => {})],
              }),
            ],
          },
        ],
      }),
    ).toThrow();
  const cyclic: any = { route: 'Identifier' };
  cyclic.parent = cyclic;
  expect(() => defineVisitor(cyclic, {}, () => {})).toThrow(/depth/);
});

test('nested selector requirements must be declared before building the snapshot', () => {
  const nested = [
    defineVisitor(
      { route: 'CallExpression', children: { arguments: { route: 'Identifier', index: 0 } } },
      {},
      () => {},
    ),
  ];
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'nested',
        plugins: [
          defineNativePlugin({
            name: 'undeclared-selector',
            visitors: [
              defineVisitor('Program', { controlFlow: ['nested-traverse'] }, path =>
                path.traverse(nested),
              ),
            ],
          }),
        ],
      },
    ],
  });
  expect(() => transform('use(value);', 'input.js', pipeline)).toThrow(
    /nested selector requires declared child role/,
  );
});

for (const indexed of [false, true]) {
  test(`projected parameter roles match without exposing children (indexed=${indexed})`, () => {
    const seen: string[] = [];
    const plugin = defineNativePlugin({
      name: 'params',
      ...(indexed
        ? {
            contract: { queries: [{ exports: true }] },
            pre(context) {
              context.query({ exports: true });
            },
          }
        : {}),
      visitors: [
        defineVisitor(
          {
            route: 'FunctionDeclaration|ArrowFunctionExpression',
            children: {
              params: {
                route: 'FormalParameter',
                parent: {
                  route: 'FormalParameters',
                  parent: { route: 'FunctionDeclaration|ArrowFunctionExpression' },
                },
                index: 0,
                children: {
                  pattern: { route: 'Identifier', where: { name: { equals: 'wanted' } } },
                  default: { route: 'NumericLiteral', where: { value: { equals: 1 } } },
                },
              },
            },
          },
          {},
          path => seen.push(path.sourceText()),
        ),
      ],
    });
    expect(
      transform(
        'function yes(wanted=1, other){} function no(other, wanted){} function empty(){} const arrow=(wanted=1)=>wanted;',
        'input.js',
        defineNativePipeline({ phases: [{ name: 'params', plugins: [plugin] }] }),
      ).status,
    ).toBe('complete');
    expect(seen).toEqual(['function yes(wanted=1, other){}', '(wanted=1)=>wanted']);
  });
}

test('selector parameters bind recursively, snapshot arrays, and affect cache identity', () => {
  const names = ['first'];
  const seen: string[] = [];
  const visitor = defineVisitor(
    {
      route: 'CallExpression',
      children: {
        arguments: {
          route: 'Identifier',
          index: 0,
          where: { name: { oneOf: names } },
          parent: {
            route: 'CallExpression',
            where: { calleeName: { equals: parameter('callee') } },
          },
        },
      },
    },
    {},
    path => seen.push(path.sourceText()),
  );
  names.push('second');
  const plugin = defineNativePlugin({ name: 'parameters', visitors: [visitor] });
  const pipeline = (callee: string) =>
    defineNativePipeline({
      phases: [{ name: 'parameters', plugins: [plugin.withParameters({ callee })] }],
    });
  expect(
    transform('use(first); use(second); other(first);', 'input.js', pipeline('use')).status,
  ).toBe('complete');
  expect(seen).toEqual(['use(first)']);
  expect(pipelineCacheKey(pipeline('use'), 'input.js')).not.toBe(
    pipelineCacheKey(pipeline('other'), 'input.js'),
  );
});

for (const checked of [false, true]) {
  test(`coalescing preserves distinct child selectors and callback order (checked=${checked})`, () => {
    const seen: string[] = [];
    const plugins = ['first', 'second'].map(name =>
      defineNativePlugin({
        name,
        ...(checked ? { analyze: () => ({ status: 'supported' as const, analysis: null }) } : {}),
        visitors: ['one', 'two'].map(target =>
          defineVisitor(
            {
              route: 'CallExpression',
              children: {
                arguments: { route: 'Identifier', index: 0, where: { name: { equals: target } } },
              },
            },
            {},
            path => seen.push(`${name}:${target}:${path.sourceText()}`),
          ),
        ),
      }),
    );
    expect(
      transform(
        'use(one); use(two);',
        'input.js',
        defineNativePipeline({ phases: [{ name: 'selectors', plugins }] }),
      ).status,
    ).toBe('complete');
    expect(seen).toEqual([
      'first:one:use(one)',
      'second:one:use(one)',
      'first:two:use(two)',
      'second:two:use(two)',
    ]);
  });
}

test('an existential child match filters roots without filtering hydrated siblings', () => {
  const seen: string[][] = [];
  const plugin = defineNativePlugin({
    name: 'mixed-declarations',
    visitors: [
      defineVisitor(
        {
          route: 'VariableDeclaration',
          children: {
            declarations: {
              route: 'VariableDeclarator',
              children: {
                init: { route: 'CallExpression' },
              },
            },
          },
        },
        { children: { declarations: { route: 'VariableDeclarator' } } },
        path => {
          seen.push(path.getChildList('declarations').map(child => child.sourceText()));
        },
      ),
    ],
  });
  expect(
    transform(
      'const untouched=1; const before=1, candidate=load(), after=2;',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'mixed', plugins: [plugin] }] }),
    ).status,
  ).toBe('complete');
  expect(seen).toEqual([['before=1', 'candidate=load()', 'after=2']]);
});
