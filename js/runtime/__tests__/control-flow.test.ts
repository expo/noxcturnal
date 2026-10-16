import assert from 'node:assert/strict';
import { test } from 'vitest';

import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { native } from '../../native/binding';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../../runtime/session';

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

test('composes source maps across phases', () => {
  const first = defineNativePlugin({
    name: 'first',
    visitors: [
      defineVisitor('NumericLiteral', {}, path =>
        path.replaceWith({ code: '20', mapping: 'anchor-boundaries' }),
      ),
    ],
  });
  const second = defineNativePlugin({
    name: 'second',
    visitors: [
      defineVisitor('NumericLiteral', {}, path =>
        path.replaceWith({ code: '300', mapping: 'anchor-boundaries' }),
      ),
    ],
  });
  const result = transform(
    'const value = 1',
    'fixture.js',
    defineNativePipeline({
      phases: [
        { name: 'first', plugins: [first] },
        { name: 'second', plugins: [second] },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 300');
  assert.ok(result.map.mappings.length > 0);
});

test('supports all four insertion affinities deterministically', () => {
  const plugin = defineNativePlugin({
    name: 'affinity',
    pre(context) {
      context.editor.appendLeft(0, 'AL');
      context.editor.prependLeft(0, 'PL');
      context.editor.appendRight(0, 'AR');
      context.editor.prependRight(0, 'PR');
    },
  });
  const result = transform(
    'x',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'PLALPRARx');
});

test('lowers static and functional replacements against pristine source', () => {
  const plugin = defineNativePlugin({
    name: 'replace',
    pre(context) {
      context.editor.replace('one', 'ONE');
      context.editor.replaceAll(/two/g, match => match.toUpperCase());
    },
  });
  const result = transform(
    'one; two; two;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'ONE; TWO; TWO;');
});

test('allows an explicit parser mode independent of filename extension', () => {
  const result = transform(
    'const value: number = 1',
    'fixture.js',
    defineNativePipeline({ phases: [] }),
    { parser: 'ts' },
  );
  assert.equal(result.status, 'complete');
});

test('widens over only the remaining traversal and suppresses duplicates', () => {
  const seen: string[] = [];
  const plugin = defineNativePlugin({
    name: 'widen',
    visitors: [
      defineVisitor(
        'CallExpression',
        { fields: ['calleeName'], controlFlow: ['dynamic-subscriptions'] },
        path => {
          if (path.node.calleeName === 'mark') path.context.subscribeRemaining('Identifier');
        },
      ),
      defineVisitor(
        'Identifier',
        { fields: ['name'], controlFlow: ['dynamic-subscriptions'] },
        path => {
          seen.push(String(path.node.name));
        },
      ),
    ],
  });
  transform(
    'before; mark(); after;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(seen, ['before', 'mark', 'after']);
});

test('supports path-scoped and lexical-scope dynamic subscriptions', () => {
  const calls: string[] = [];
  const identifiers: string[] = [];
  const plugin = defineNativePlugin({
    name: 'path-widen',
    visitors: [
      defineVisitor(
        'CallExpression',
        { fields: ['calleeName'], controlFlow: ['dynamic-subscriptions'] },
        path => {
          calls.push(String(path.node.calleeName));
          if (path.node.calleeName === 'within') path.subscribeWithin('Identifier');
          if (path.node.calleeName === 'scope') path.subscribeForScope('Identifier');
        },
      ),
      defineVisitor(
        'Identifier',
        { fields: ['name'], controlFlow: ['dynamic-subscriptions'] },
        path => identifiers.push(String(path.node.name)),
      ),
    ],
  });
  transform(
    'within(inner); function run() { scope(); after; }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.deepEqual(calls, ['within', 'scope']);
  assert.deepEqual(identifiers, ['within', 'inner', 'run', 'scope', 'after']);
});

test('implements per-plugin skip and stop', () => {
  const skipped: string[] = [];
  const stopped: string[] = [];
  const skipPlugin = defineNativePlugin({
    name: 'skip',
    visitors: [
      defineVisitor('Function', { controlFlow: ['skip'] }, path => {
        path.skip();
      }),
      defineVisitor('Identifier', { fields: ['name'], controlFlow: ['skip'] }, path => {
        skipped.push(String(path.node.name));
      }),
    ],
  });
  const stopPlugin = defineNativePlugin({
    name: 'stop',
    visitors: [
      defineVisitor('Identifier', { fields: ['name'], controlFlow: ['stop'] }, path => {
        stopped.push(String(path.node.name));
        path.stop();
      }),
    ],
  });
  transform(
    'outside; function fn(inside) { return inside } trailing;',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'visit', plugins: [skipPlugin, stopPlugin] }],
    }),
  );
  assert.ok(skipped.includes('outside'));
  assert.ok(!skipped.includes('inside'));
  assert.equal(stopped.length, 1);
});

test('requires an explicit global stop capability', () => {
  let peerCalls = 0;
  const localStopOnly = defineNativePlugin({
    name: 'local-stop-only',
    visitors: [
      defineVisitor('Identifier', { controlFlow: ['stop'] }, path => {
        path.context.stopAll();
      }),
    ],
  });
  assert.throws(
    () =>
      transform(
        'value;',
        'fixture.js',
        defineNativePipeline({ phases: [{ name: 'transform', plugins: [localStopOnly] }] }),
      ),
    /local-stop-only: undeclared control-flow capability stop-all/,
  );

  const globalStop = defineNativePlugin({
    name: 'global-stop',
    visitors: [
      defineVisitor('Identifier', { controlFlow: ['stop-all'] }, path => {
        path.context.stopAll();
      }),
    ],
  });
  const peer = defineNativePlugin({
    name: 'global-stop-peer',
    visitors: [
      defineVisitor('Identifier', {}, () => {
        peerCalls++;
      }),
    ],
  });
  transform(
    'value;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [globalStop, peer] }] }),
  );
  assert.equal(peerCalls, 0);
});

test('keeps static routes independent from another plugin dynamic skip state', () => {
  let dynamicIdentifiers = 0;
  let staticIdentifiers = 0;
  const dynamic = defineNativePlugin({
    name: 'dynamic-skip',
    visitors: [
      defineVisitor('Function', { controlFlow: ['skip'] }, path => {
        path.skip();
      }),
      defineVisitor('Identifier', { controlFlow: ['skip'] }, () => {
        dynamicIdentifiers++;
      }),
    ],
  });
  const fixed = defineNativePlugin({
    name: 'fixed-route',
    visitors: [
      defineVisitor('Identifier', {}, () => {
        staticIdentifiers++;
      }),
    ],
  });
  const result = transform(
    'const outside = 1; function example(argument) { return argument }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [dynamic, fixed] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(dynamicIdentifiers, 1);
  assert.equal(staticIdentifiers, 4);
});

test('provides call and capture query declarations', () => {
  let calls = 0;
  let captures: unknown[] = [];
  const plugin = defineNativePlugin({
    name: 'queries',
    contract: {
      queries: [
        { calls: [{ callee: 'load', globalOnly: true, staticArguments: true }] },
        { captures: [{ functionId: 0 }] },
      ],
    },
    visitors: [
      defineVisitor('Function', {}, path => {
        calls = path.context.query({
          calls: [{ callee: 'load', globalOnly: true, staticArguments: true }],
        }).calls.load.length;
        captures = path.context.query({ captures: [{ functionId: path.node.id }] }).captures[
          path.node.id
        ];
      }),
    ],
  });
  transform(
    "const outer = 1; load('x'); function fn() { return outer }",
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  assert.equal(calls, 1);
  assert.equal(captures.length, 1);
});

test('exposes binding reads, writes, and lexical captures', () => {
  const session = openRetained(
    'let outer = 0; function update() { outer++; return outer }',
    'fixture.js',
  );
  const [fn] = session.nodes(['Function']);
  const facts = session.query({ bindings: [{ name: 'outer' }], captures: [{ functionId: fn.id }] });
  assert.equal(facts.bindings.length, 1);
  assert.ok(facts.bindings[0].references.some(reference => reference.write === true));
  assert.ok(facts.bindings[0].references.some(reference => reference.read === true));
  assert.ok(
    facts.captures[fn.id].some(reference => reference.id === facts.bindings[0].references[0].id),
  );
  session.close();
});

test('filters captures by direct Program binding ownership', () => {
  const session = openRetained(
    `const program = 1;
     { const block = 2; function outer() {
       const lexical = 3;
       return function inner() { return program + block + lexical };
     } }`,
    'fixture.js',
  );
  const functions = session.nodes(['Function']);
  const inner = functions.find(fn => fn.name === 'inner')!;

  const all = session.query({ captures: [{ functionId: inner.id }] }).captures[inner.id];
  const program = session.query({
    captures: [{ functionId: inner.id, programBindings: true }],
  }).captures[inner.id];
  const lexical = session.query({
    captures: [{ functionId: inner.id, programBindings: false }],
  }).captures[inner.id];

  assert.deepEqual(
    new Set(all.map(capture => capture.name)),
    new Set(['program', 'block', 'lexical']),
  );
  assert.deepEqual(new Set(program.map(capture => capture.name)), new Set(['program']));
  assert.deepEqual(new Set(lexical.map(capture => capture.name)), new Set(['block', 'lexical']));

  const raw = new native.NativeIndexedSession(
    session.source,
    'fixture.js',
    packRouteManifest([], false, false, ALL_RETAINED_CAPABILITIES),
  );
  assert.deepEqual(
    new Set(raw.queryCapturesBatch([inner.id])[0].references.map(capture => capture.name)),
    new Set(['program', 'block', 'lexical']),
  );
  raw.close();
  session.close();
});

test('rejects conflicting duplicate capture filters', () => {
  const session = openRetained('const outer = 1; function fn() { return outer }', 'fixture.js');
  const [fn] = session.nodes(['Function']);
  assert.throws(
    () =>
      session.query({
        captures: [
          { functionId: fn.id, programBindings: true },
          { functionId: fn.id, programBindings: false },
        ],
      }),
    /Conflicting programBindings filters/,
  );
  session.close();
});

test('capture filtering performs no binding queries', () => {
  const prototype = native.NativeIndexedSession.prototype;
  const queryBindings = prototype.queryBindings;
  let bindingQueries = 0;
  prototype.queryBindings = function (
    this: typeof prototype,
    ...args: Parameters<typeof queryBindings>
  ) {
    bindingQueries++;
    return queryBindings.apply(this, args);
  };
  try {
    const session = openRetained(
      'const program = 1; function outer(local) { return function inner() { return program + local } }',
      'fixture.js',
    );
    const inner = session.nodes(['Function']).find(fn => fn.name === 'inner')!;
    session.query({ captures: [{ functionId: inner.id, programBindings: false }] });
    assert.equal(bindingQueries, 0);
    session.close();
  } finally {
    prototype.queryBindings = queryBindings;
  }
});

test('batches and deduplicates captures for many functions', () => {
  const source = `const outer = 1;${Array.from(
    { length: 128 },
    (_, index) => `function fn${index}(){return outer}`,
  ).join('')}`;
  const session = openRetained(source, 'fixture.js');
  const functions = session.nodes(['Function']);
  const requests = functions.flatMap(fn => [{ functionId: fn.id }, { functionId: fn.id }]);
  const captures = session.query({ captures: requests }).captures;
  assert.equal(Object.keys(captures).length, functions.length);
  for (const fn of functions) {
    assert.equal(captures[fn.id].length, 1);
    assert.equal(captures[fn.id][0].name, 'outer');
  }
  session.close();
});

test('indexes repeated scope lookups without consuming follow-up batches', () => {
  const source = Array.from(
    { length: 100 },
    (_, index) => `const value${index} = global${index};`,
  ).join('\n');
  let bindings = 0;
  let globals = 0;
  const plugin = defineNativePlugin({
    name: 'many-scope-lookups',
    visitors: [
      defineVisitor('Identifier', { fields: ['name'], scope: true }, path => {
        const name = String(path.node.name);
        if (path.scope.hasBinding(name)) bindings++;
        if (path.scope.hasGlobal(name)) globals++;
      }),
    ],
  });
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(bindings, 100);
  assert.equal(globals, 100);
});

test('filters hot event families only when every subscriber opts in', () => {
  const firstSeen = new Set();
  const secondSeen = new Set();
  const first = defineNativePlugin({
    name: 'first-filter',
    visitors: [
      defineVisitor(
        'ReferencedIdentifier',
        { fields: ['name'], where: { name: { oneOf: ['first'] } } },
        path => {
          firstSeen.add(String(path.node.name));
        },
      ),
      defineVisitor(
        'StaticMemberExpression',
        { fields: ['memberPath'], where: { memberPath: { oneOf: ['process.env.FIRST'] } } },
        path => {
          firstSeen.add(String(path.node.memberPath));
        },
      ),
    ],
  });
  const second = defineNativePlugin({
    name: 'second-filter',
    visitors: [
      defineVisitor(
        'ReferencedIdentifier',
        { fields: ['name'], where: { name: { oneOf: ['second'] } } },
        path => {
          secondSeen.add(String(path.node.name));
        },
      ),
      defineVisitor(
        'StaticMemberExpression',
        { fields: ['memberPath'], where: { memberPath: { oneOf: ['process.env.SECOND'] } } },
        path => {
          secondSeen.add(String(path.node.memberPath));
        },
      ),
    ],
  });
  transform(
    'first; second; third; process.env.FIRST; process.env.SECOND; process.env.THIRD;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [first, second] }] }),
  );
  assert.deepEqual([...firstSeen].sort(), ['first', 'process.env.FIRST']);
  assert.deepEqual([...secondSeen].sort(), ['process.env.SECOND', 'second']);

  const unfiltered = new Set();
  const broad = defineNativePlugin({
    name: 'unfiltered',
    visitors: [
      defineVisitor('ReferencedIdentifier', { fields: ['name'] }, path => {
        unfiltered.add(String(path.node.name));
      }),
    ],
  });
  transform(
    'first; second; third;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'transform', plugins: [first, broad] }] }),
  );
  assert.ok(unfiltered.has('third'));
});

test('a plugin left out of a phase runs no lifecycle at all', () => {
  let lifecycleCalls = 0;
  const plugin = defineNativePlugin({
    name: 'excluded',
    createState() {
      lifecycleCalls++;
    },
    pre() {
      lifecycleCalls++;
    },
    visitors: [
      defineVisitor('Identifier', {}, () => {
        lifecycleCalls++;
      }),
    ],
    post() {
      lifecycleCalls++;
    },
  });
  // Enablement is inclusion: a plugin that should not run for this file is not put
  // in the phase, so its plan stays a property of its definition.
  const include = false;
  transform(
    'const value = source;',
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'transform', plugins: include ? [plugin] : [] }],
    }),
  );
  assert.equal(lifecycleCalls, 0);
});

test('resolves the nearest binding and renames only its semantic references', () => {
  const plugin = defineNativePlugin({
    name: 'rename-binding',
    visitors: [
      defineVisitor('Program', { scope: true }, path => {
        const binding = path.scope.getBinding('value');
        assert.equal(binding?.global, false);
        assert.equal(binding?.references.length, 3);
        assert.equal(binding?.path?.node.type, 'VariableDeclarator');
        assert.equal(binding?.scope?.id, path.scope.id);
        assert.equal(binding?.scope?.getProgramParent().id, path.scope.id);
        assert.equal(path.scope.rename('value', 'renamed'), 'renamed');
      }),
    ],
  });
  const source =
    'let value = 1; use(value); const object = { value }; ({ value } = object); function nested(value) { return value }';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(
    result.code,
    'let renamed = 1; use(renamed); const object = { value: renamed }; ({ value: renamed } = object); function nested(value) { return value }',
  );
});

test('classifies member-chain writes on visitor and binding references', () => {
  const visitorFlags = new Map<string, boolean>();
  let bindingFlags: boolean[] = [];
  const plugin = defineNativePlugin({
    name: 'member-write-references',
    visitors: [
      defineVisitor('ReferencedIdentifier', { fields: ['name', 'memberWrite'] }, path => {
        if (path.node.name === 'binding' || path.node.name === 'key') {
          visitorFlags.set(`${path.node.name}@${path.node.start}`, path.node.memberWrite);
        }
      }),
      defineVisitor('Program', { scope: true }, path => {
        bindingFlags = path.scope
          .getBinding('binding')!
          .references.map(reference => reference.memberWrite === true);
      }),
    ],
  });
  const source = `
    let binding = source, key;
    use(binding);
    binding = source;
    binding.value;
    binding.value = next;
    binding[key].value++;
    ++binding.value;
    binding.value += next;
    binding.value ||= next;
    delete (binding).value;
    delete binding?.value;
    ({ value: binding.value } = source);
    for (binding.value in source) break;
    for (binding.value of source) break;
  `;
  transform(
    source,
    'fixture.ts',
    defineNativePipeline({ phases: [{ name: 'classify', plugins: [plugin] }] }),
  );

  assert.deepEqual(bindingFlags, [
    false,
    false,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ]);
  const bindingVisitorFlags = [...visitorFlags]
    .filter(([key]) => key.startsWith('binding@'))
    .map(([, value]) => value);
  assert.deepEqual(bindingVisitorFlags, bindingFlags);
  assert.ok(
    [...visitorFlags]
      .filter(([key]) => key.startsWith('key@'))
      .every(([, value]) => value === false),
  );
});

test('resolves multiple bindings through one scope lookup', () => {
  let observed: unknown;
  const plugin = defineNativePlugin({
    name: 'binding-batch',
    visitors: [
      defineVisitor('Program', { scope: true }, path => {
        observed = path.scope
          .getBindings(['first', 'second', 'missing'])
          .map(binding => [binding.name, binding.references.length]);
      }),
    ],
  });
  transform(
    'const first = 1, second = first; use(second);',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'bindings', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, [
    ['first', 1],
    ['second', 1],
  ]);
});

test('exposes lazy Babel-shaped binding paths and scope parent chains', () => {
  let observed: unknown;
  const plugin = defineNativePlugin({
    name: 'binding-path',
    visitors: [
      defineVisitor('Function', { fields: ['name', 'bodyStart'], scope: true }, path => {
        if (path.node.name !== 'nested') return;
        const binding = path.scope.getBinding('parameter');
        observed = [
          binding?.path?.node.type,
          binding?.scope?.id,
          binding?.scope === path.scope,
          binding?.scope?.parent?.id,
          binding?.scope?.getProgramParent().id,
        ];
      }),
    ],
  });
  transform(
    'function nested(parameter) { return parameter }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'scope', plugins: [plugin] }] }),
  );
  assert.deepEqual(observed, ['FormalParameter', 1, true, 0, 0]);
});

test('pushes generated declarations into a scope after its directive prologue', () => {
  const plugin = defineNativePlugin({
    name: 'scope-push',
    visitors: [
      defineVisitor('Function', { fields: ['name', 'bodyStart'], scope: true }, path => {
        if (path.node.name === 'action')
          path.scope.push(path.context.code.parseStatements('var injected = 1;'));
      }),
    ],
  });
  const result = transform(
    'function action() { "use action"; return injected }',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'push', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(
    result.code,
    'function action() { "use action";\n;\nvar injected = 1;\n;\n return injected }',
  );
});

test('provides Babel-shaped multi-replacement, container, comment, and code-frame helpers', () => {
  const plugin = defineNativePlugin({
    name: 'path-conveniences',
    visitors: [
      defineVisitor('Program', {}, path => {
        path.unshiftContainer('body', '/* first */\n');
        path.pushContainer('body', '\n/* last */');
      }),
      defineVisitor('NumericLiteral', {}, path => {
        path.replaceWithMultiple(['2', '3']);
        assert.match(path.buildCodeFrameError('fixture').message, /fixture/);
      }),
    ],
  });
  const result = transform(
    'const value = 1;',
    'fixture.js',
    defineNativePipeline({ phases: [{ name: 'edit', plugins: [plugin] }] }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, '/* first */\nconst value = 2\n3;\n/* last */');
});
