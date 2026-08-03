import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  NativeTransformError,
  parameter,
  transform,
} from '../../index';

test('rejects malformed ancestry modes while defining a visitor', () => {
  for (const mode of [0, -1, 1.5, Number.NaN]) {
    assert.throws(
      () => defineVisitor('Identifier', { ancestry: { mode } }, () => {}),
      /positive integer/,
    );
  }
  assert.throws(
    () =>
      defineVisitor(
        'Identifier',
        // @ts-expect-error Exercise runtime rejection of forbidden predicates.
        { ancestry: { mode: 'findParent', routes: { Identifier: { where: {} } } } },
        () => {},
      ),
    /cannot declare where predicates/,
  );
});

test('typed visitors compile contracts locally and narrow the payload', () => {
  const source = 'let a = 1; const b = 2; var c = 3;';
  const kinds: unknown[] = [];
  const declaration = defineVisitor(
    'VariableDeclaration',
    { fields: ['kind'], where: { kind: { oneOf: ['let', 'const'] } } },
    path => {
      kinds.push(path.node.kind);
    },
  );
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'scan', plugins: [defineNativePlugin({ name: 'typed', visitors: [declaration] })] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(kinds.sort(), ['const', 'let']);
});

test('typed visitor match-only predicate fields are not callback-visible', () => {
  const source = 'const value = 1;';
  let observedKind: unknown = 'unset';
  const declaration = defineVisitor(
    'VariableDeclaration',
    { where: { kind: { equals: 'const' } } },
    path => {
      observedKind = (path.node as unknown as Record<string, unknown>).kind;
    },
  );
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'scan', plugins: [defineNativePlugin({ name: 'typed', visitors: [declaration] })] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(observedKind, undefined);
});

test('regexp literal fields preserve lexical pattern and flag spelling', () => {
  const source = String.raw`[/./, /a\/b/i, /[/]/u, /\p{Script=Greek}+/mi, /(?<word>a)/, /[\q{ab}]/v, /\n/]`;
  const observed: { pattern: string; flags: string }[] = [];
  const routed = defineVisitor('RegExpLiteral', { fields: ['pattern', 'flags'] }, path => {
    observed.push({ pattern: path.node.pattern, flags: path.node.flags });
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [defineNativePlugin({ name: 'regexp-fields', visitors: [routed] })],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(observed, [
    { pattern: '.', flags: '' },
    { pattern: String.raw`a\/b`, flags: 'i' },
    { pattern: '[/]', flags: 'u' },
    { pattern: String.raw`\p{Script=Greek}+`, flags: 'mi' },
    { pattern: '(?<word>a)', flags: '' },
    { pattern: String.raw`[\q{ab}]`, flags: 'v' },
    { pattern: String.raw`\n`, flags: '' },
  ]);
});

test('inner comments are parser-ranged, ordered, immutable, and contract-scoped', () => {
  const source = `/* before */ import(/* first */ /* webpackIgnore: true */ 'pkg' // last\n); /* after */`;
  let observed: readonly { kind: string; value: string; start: number; end: number }[] = [];
  let undeclared: unknown;
  const declared = defineVisitor('ImportExpression', { comments: 'inner' }, path => {
    observed = path.getComments('inner');
  });
  const missing = defineVisitor('ImportExpression', {}, path => {
    try {
      (path as unknown as { getComments(relation: 'inner'): unknown }).getComments('inner');
    } catch (error) {
      undeclared = error;
    }
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [defineNativePlugin({ name: 'comments', visitors: [declared, missing] })],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(
    observed.map(comment => [comment.kind, comment.value]),
    [
      ['block', ' first '],
      ['block', ' webpackIgnore: true '],
      ['line', ' last'],
    ],
  );
  assert.ok(Object.isFrozen(observed));
  assert.ok(observed.every(Object.isFrozen));
  assert.ok(
    observed.every(comment => source.slice(comment.start, comment.end).includes(comment.value)),
  );
  assert.ok(undeclared instanceof NativeTransformError);
});

test('a reparsed phase observes comments committed by an earlier phase', () => {
  let observed: readonly string[] = [];
  const insert = defineVisitor('StringLiteral', { fields: ['value'] }, path => {
    if (path.node.value === 'pkg') path.insertBefore('/* inserted */');
  });
  const inspect = defineVisitor('ImportExpression', { comments: 'inner' }, path => {
    observed = path.getComments('inner').map(comment => comment.value);
  });
  const result = transform(
    `import('pkg')`,
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'insert', plugins: [defineNativePlugin({ name: 'insert', visitors: [insert] })] },
        {
          name: 'inspect',
          plugins: [defineNativePlugin({ name: 'inspect', visitors: [inspect] })],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(observed, [' inserted ']);
});

test('comment inspection is independent from output comment preservation', () => {
  let observed = false;
  const inspect = defineVisitor('ImportExpression', { comments: 'inner' }, path => {
    observed = path.getComments('inner').some(comment => comment.value.includes('@metro-ignore'));
  });
  const result = transform(
    `import(/* @metro-ignore */ 'pkg')`,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'inspect',
          plugins: [defineNativePlugin({ name: 'inspect', visitors: [inspect] })],
        },
        { name: 'print', native: { comments: false } },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(observed, true);
  if (result.status === 'complete') assert.doesNotMatch(result.code, /metro-ignore/);
});

test('typed visitor capabilities are contract-scoped, not plugin-wide', () => {
  const source = 'const value = compute();';
  let scopedOk = false;
  let unscopedError: Error | null = null;
  const scoped = defineVisitor('VariableDeclaration', { scope: true }, path => {
    scopedOk = (path as { scope: { getBinding(name: string): unknown } }).scope != null;
  });
  const unscoped = defineVisitor('CallExpression', {}, path => {
    try {
      void (path as unknown as { scope: unknown }).scope;
    } catch (error) {
      unscopedError = error as Error;
    }
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [defineNativePlugin({ name: 'typed', visitors: [scoped, unscoped] })],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.ok(scopedOk);
  assert.match(String(unscopedError), /undeclared scope access|scope/);
});

test('typed visitors reject undeclared control flow at the exact route', () => {
  const source = 'const value = 1;';
  const undeclared = defineVisitor('VariableDeclaration', {}, path => {
    (path as unknown as { skip(): void }).skip();
  });
  assert.throws(
    () =>
      transform(
        source,
        'fixture.js',
        defineNativePipeline({
          phases: [
            {
              name: 'scan',
              plugins: [defineNativePlugin({ name: 'typed', visitors: [undeclared] })],
            },
          ],
        }),
      ),
    /typed: undeclared control-flow capability skip/,
  );
});

test('two typed visitors on one route keep independent predicates', () => {
  const source = "require('./a'); importAll('./b', './c'); other();";
  const requires: string[] = [];
  const contexts: number[] = [];
  const plainRequire = defineVisitor(
    'CallExpression',
    { fields: ['staticArgument'], where: { calleeName: { equals: 'require' } } },
    path => {
      requires.push(String(path.node.staticArgument));
    },
  );
  const contextRequire = defineVisitor(
    'CallExpression',
    { fields: ['argumentCount'], where: { calleeName: { equals: 'importAll' } } },
    path => {
      contexts.push(Number(path.node.argumentCount));
    },
  );
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [
            defineNativePlugin({ name: 'typed', visitors: [plainRequire, contextRequire] }),
          ],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(requires, ['./a']);
  assert.deepEqual(contexts, [2]);
});

test('bound predicate parameters resolve to values and intern by value', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'typed',
    visitors: [
      defineVisitor(
        'Identifier',
        { fields: ['name'], where: { name: { oneOf: parameter('names') } } },
        path => {
          seen.push(String(path.node.name));
        },
      ),
    ],
  });
  const bound = plugin.withParameters({ names: ['__DEV__'] });
  assert.equal(bound, plugin.withParameters({ names: ['__DEV__'] }));
  assert.notEqual(bound, plugin.withParameters({ names: ['other'] }));
  const run = (selected: typeof plugin) =>
    transform(
      'const flag = __DEV__ && other;',
      'fixture.js',
      defineNativePipeline({ phases: [{ name: 'scan', plugins: [selected] }] }),
    );
  assert.equal(run(bound).status, 'complete');
  assert.deepEqual(seen, ['__DEV__']);
  seen.length = 0;
  assert.equal(run(plugin.withParameters({ names: ['other'] })).status, 'complete');
  assert.deepEqual(seen, ['other']);
});

test('an unbound predicate parameter is a contract error', () => {
  const plugin = defineNativePlugin({
    name: 'unbound',
    visitors: [
      defineVisitor(
        'Identifier',
        { fields: ['name'], where: { name: { equals: parameter('name') } } },
        () => {},
      ),
    ],
  });
  assert.throws(
    () =>
      transform(
        'const value = 1;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
      ),
    /predicate parameter for Identifier.name was never bound/,
  );
  assert.throws(() => plugin.withParameters({ name: ['a'] }), /must be a scalar/);
  assert.throws(
    () => plugin.withParameters({ name: 'a', other: 'b' }),
    /no predicate declares parameter other/,
  );
});

test('typed enter and exit handlers share one contract and reverse exits', () => {
  const order: string[] = [];
  const fn = defineVisitor(
    'Function',
    {},
    {
      enter(path) {
        order.push(`enter:${path.start}`);
      },
      exit(path) {
        order.push(`exit:${path.start}`);
      },
    },
  );
  const result = transform(
    'function outer() { function inner() {} }',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'scan', plugins: [defineNativePlugin({ name: 'typed', visitors: [fn] })] }],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(order, ['enter:0', 'enter:19', 'exit:19', 'exit:0']);
});

test('typed plugins reject the removed visitor-object form', () => {
  assert.throws(
    () =>
      defineNativePlugin({
        name: 'mixed',
        visitor: { Identifier() {} },
      } as never),
    /the visitor-object form was removed/,
  );
});

test('typed children access declared roles with prefetched fields', () => {
  const locals: string[] = [];
  const imports = defineVisitor(
    'ImportDeclaration',
    {
      fields: ['source'],
      children: { specifiers: { route: 'ImportSpecifier', fields: ['local', 'imported'] } },
    },
    path => {
      for (const specifier of path.getChildList('specifiers'))
        locals.push(String((specifier.node as unknown as Record<string, unknown>).local));
    },
  );
  const undeclaredRole = defineVisitor(
    'ImportDeclaration',
    { children: { specifiers: { route: 'ImportSpecifier' } } },
    path => {
      assert.throws(
        () =>
          (path as unknown as { getChildList(role: string): unknown }).getChildList('assertions'),
        /undeclared child access|child/,
      );
    },
  );
  const result = transform(
    "import { one, two } from 'module';",
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'scan',
          plugins: [defineNativePlugin({ name: 'typed', visitors: [imports, undeclaredRole] })],
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(locals, ['one', 'two']);
});

test('typed nested traversal includes arrow functions through the Function alias', () => {
  const found: string[] = [];
  const outer = defineVisitor('Program', { controlFlow: ['nested-traverse'], fields: [] }, path => {
    path.traverse([
      defineVisitor('Function', {}, fn => {
        found.push(fn.type);
      }),
    ]);
  });
  const result = transform(
    'function named() {} const arrow = () => {};',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'scan', plugins: [defineNativePlugin({ name: 'typed', visitors: [outer] })] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(found.sort(), ['ArrowFunctionExpression', 'Function']);
});

test('plugin contracts type and union metadata and query requirements', () => {
  const plugin = defineNativePlugin({
    name: 'contracted',
    contract: {
      metadata: { writes: ['dependencies'] },
      queries: [{ calls: [{ callee: 'require', staticArguments: true }] }],
    },
    post(context) {
      const calls = context.query({ calls: [{ callee: 'require', staticArguments: true }] });
      context.metadata.set(
        'dependencies',
        calls.calls.require?.map(call => call.staticArgument) ?? [],
      );
    },
  });
  const result = transform(
    "require('./a'); require('./b');",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.metadata.dependencies, ['./a', './b']);
});
