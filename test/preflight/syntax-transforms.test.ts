import assert from 'node:assert/strict';

import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { test } from 'vitest';

import type { PreflightTransforms } from '../../dist/index.js';
import { defineNativePipeline, transform } from '../../dist/index.js';

const pipeline = (
  transforms: PreflightTransforms,
  helpers: { mode: 'runtime'; moduleName: string; version: string } = {
    mode: 'runtime',
    moduleName: '@babel/runtime',
    version: '7.29.2',
  },
) =>
  defineNativePipeline({
    phases: [
      {
        name: 'syntax',
        native: { transforms, helpers, compact: true, comments: false },
      },
    ],
  });

test('classStaticBlock lowers independently with explicit compact/comment posture', () => {
  const result = transform(
    '/* removed */ class Example { field = 2; #private = 3; static { this.answer = 42; } read() { return this.#private; } } globalThis.answer = Example.answer; globalThis.fields = new Example().field + new Example().read();',
    'fixture.js',
    pipeline({ classStaticBlock: true }),
  );

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /static\s*\{|removed/);
  assert.match(result.code, /static#_=this\.answer=42/);
  assert.match(result.code, /field=2/);
  assert.match(result.code, /#private=3/);
  const context: { answer?: number; fields?: number } = {};
  new Function('globalThis', result.code)(context);
  assert.equal(context.answer, 42);
  assert.equal(context.fields, 5);
});

test('private toggles explicitly route Oxc 0.141 semantic mismatches to fallback', () => {
  for (const [source, transforms] of [
    ['class Example { field = 1 }', { privateMethods: { loose: true } }],
    [
      'class Example { #field = 1; read() { return #field in this } }',
      { privatePropertyInObject: { loose: true } },
    ],
    ['class Example { #method() {} }', { privateMethods: { loose: true } }],
  ] satisfies [string, PreflightTransforms][]) {
    const result = transform(source, 'fixture.js', pipeline(transforms));
    assert.equal(result.status, 'bailout');
    assert.equal(result.reason, 'syntax:class-features-semantic-mismatch');
  }
});

test('language transforms are selected independently rather than as a target group', () => {
  const source =
    'var object = { value: 0 }; object.value ||= 2; var selected = object?.value ?? 3; var squared = 2 ** 3; try { throw 1 } catch {}';
  const cases: [PreflightTransforms, RegExp, RegExp[]][] = [
    [{ logicalAssignmentOperators: true }, /\|\|=/, [/\?\./, /\?\?/, /\*\*/]],
    [{ optionalChaining: { loose: false } }, /\?\./, [/\|\|=/, /\?\?/, /\*\*/]],
    [{ nullishCoalescingOperator: { loose: false } }, /\?\?/, [/\|\|=/, /\?\./, /\*\*/]],
    [{ exponentiationOperator: true }, /\*\*/, [/\|\|=/, /\?\./, /\?\?/]],
    [{ optionalCatchBinding: true }, /catch\s*\{/, [/\|\|=/, /\?\./, /\?\?/, /\*\*/]],
  ];

  for (const [transforms, removed, preserved] of cases) {
    const result = transform(source, 'fixture.js', pipeline(transforms));
    assert.equal(result.status, 'complete');
    assert.doesNotMatch(result.code, removed);
    for (const syntax of preserved) assert.match(result.code, syntax);
  }
});

test('missing ES2015 transforms are independent syntax-specific boundaries', () => {
  const cases = [
    ['class Value {}', { classes: true }, 'classes-not-implemented'],
    [
      'var { value } = input;',
      { destructuring: { useBuiltIns: true } },
      'destructuring-not-implemented',
    ],
    [
      'function read(value = 1) { return value }',
      { parameters: true },
      'parameters-not-implemented',
    ],
    ['for (var value of input) consume(value);', { forOf: true }, 'for-of-not-implemented'],
  ] satisfies [string, PreflightTransforms, string][];

  for (const [source, transforms, reason] of cases) {
    const result = transform(source, 'fixture.js', pipeline(transforms));
    assert.equal(result.status, 'bailout');
    assert.equal(result.reason, `syntax:${reason}`);
  }

  for (const transforms of cases.map(([, transforms]) => transforms)) {
    const result = transform(
      'function read(value) { return value + 1 }',
      'fixture.js',
      pipeline(transforms),
    );
    assert.equal(result.status, 'complete');
  }
});

test('transform option objects reject missing and unrelated fields', () => {
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [
          {
            name: 'invalid',
            native: {
              transforms: {
                destructuring: {} as { useBuiltIns: boolean },
              },
            },
          },
        ],
      }),
    /destructuring requires \{ useBuiltIns: boolean \}/,
  );
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [
          {
            name: 'invalid',
            native: {
              transforms: {
                optionalChaining: { loose: true, preset: 'web' } as {
                  loose: boolean;
                },
              },
            },
          },
        ],
      }),
    /optionalChaining requires \{ loose: boolean \}/,
  );
});

test('rejects conflicting semantic options instead of resolving them as a preset', () => {
  assert.throws(
    () =>
      transform(
        'var value = input?.value ?? 1;',
        'fixture.js',
        pipeline({
          optionalChaining: { loose: true },
          nullishCoalescingOperator: { loose: false },
        }),
      ),
    /must use the same loose value/,
  );
  assert.throws(
    () =>
      transform(
        'class Value { field = 1; #method() {} }',
        'fixture.js',
        pipeline({
          classProperties: { loose: false },
          privateMethods: { loose: true },
        }),
      ),
    /must use the same loose value/,
  );
});

test('classProperties owns loose assignment semantics explicitly', () => {
  const source =
    'var calls = 0; class Base { set field(value) { calls += value } } class Derived extends Base { field = 2 } globalThis.result = [calls, new Derived().field, calls];';
  const run = (loose: boolean) => {
    const result = transform(source, 'fixture.js', pipeline({ classProperties: { loose } }));
    assert.equal(result.status, 'complete');
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', result.code)(context, (specifier: string) => {
      if (specifier.endsWith('/defineProperty'))
        return (object: object, key: PropertyKey, value: unknown) =>
          Object.defineProperty(object, key, { configurable: true, enumerable: true, value });
      throw new Error(`unexpected helper ${specifier}`);
    });
    return context.result;
  };

  assert.deepEqual(run(false), [0, 2, 0]);
  assert.deepEqual(run(true), [0, undefined, 2]);
});

test('runtime helpers deduplicate and avoid source binding collisions', () => {
  const result = transform(
    'var _defineProperty = 7; class Value { first = 1; second = 2; } globalThis.result = [_defineProperty, new Value().first + new Value().second];',
    'fixture.js',
    pipeline({ classProperties: { loose: false } }),
  );

  assert.equal(result.status, 'complete');
  assert.equal([...result.code.matchAll(/@babel\/runtime\/helpers\/defineProperty/g)].length, 1);
  assert.match(result.code, /var _defineProperty2\s*=\s*require/);
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, (specifier: string) => {
    if (specifier.endsWith('/defineProperty'))
      return (object: object, key: PropertyKey, value: unknown) =>
        Object.defineProperty(object, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value,
        });
    throw new Error(`unexpected helper ${specifier}`);
  });
  assert.deepEqual(context.result, [7, 3]);
});

test('unsupported object-rest options remain an explicit transform boundary', () => {
  const result = transform(
    'var { value, ...rest } = input;',
    'fixture.js',
    pipeline({ objectRestSpread: { loose: true, useBuiltIns: true } }),
  );
  assert.equal(result.status, 'bailout');
  assert.equal(result.reason, 'syntax:transform-error');
});

test('inline object and class helpers preserve symbols, getters, and field definition', () => {
  const source =
    'var key = Symbol("key"); var gets = 0; var source = { a: 1, get b() { gets++; return 2; }, [key]: 3 }; var copy = { ...source }; var { a, ...rest } = copy; class Box { value = 4 } globalThis.result = [copy.b, gets, rest[key], new Box().value];';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'inline-object-helpers',
          native: {
            transforms: {
              classProperties: { loose: false },
              objectRestSpread: { loose: false, useBuiltIns: false },
            },
            helpers: { mode: 'inline' },
          },
        },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /require\(|@babel\/runtime/);
  assert.deepEqual(result.metadata.nativeHelpers, [
    'defineProperty',
    'objectSpread2',
    'objectWithoutProperties',
  ]);
  const context: { result?: unknown } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, [2, 1, 3, 4]);
});

test('regexp toggles reject Oxc constructor-only output that is not Babel lowering', () => {
  for (const [source, transforms, reason] of [
    ['var expression = /😀/u;', { regexpUnicode: true }, 'regexp-unicode-semantic-mismatch'],
    [
      'var expression = /\\p{ASCII}/u;',
      { regexpUnicodePropertyEscapes: true },
      'regexp-unicode-property-escapes-semantic-mismatch',
    ],
    ['var expression = /./s;', { regexpDotAll: true }, 'regexp-dot-all-semantic-mismatch'],
    [
      'var expression = /(?<word>a)/;',
      { regexpNamedCaptureGroups: true },
      'regexp-named-capture-groups-semantic-mismatch',
    ],
    [
      'var expression = /(?<=a)b/;',
      { regexpLookBehind: true },
      'regexp-look-behind-semantic-mismatch',
    ],
    [
      'var expression = /a/d;',
      { regexpMatchIndices: true },
      'regexp-match-indices-semantic-mismatch',
    ],
    [
      'var expression = /[a&&b]/v;',
      { regexpUnicodeSets: true },
      'regexp-unicode-sets-semantic-mismatch',
    ],
  ] satisfies [string, PreflightTransforms, string][]) {
    const result = transform(source, 'fixture.js', pipeline(transforms));
    assert.equal(result.status, 'bailout');
    assert.equal(result.reason, `syntax:${reason}`);
  }
});

test('regexp semantic boundaries only reject syntax owned by the selected toggle', () => {
  for (const transforms of [
    { regexpUnicode: true },
    { regexpUnicodePropertyEscapes: true },
    { regexpDotAll: true },
    { regexpNamedCaptureGroups: true },
    { regexpLookBehind: true },
    { regexpMatchIndices: true },
    { regexpUnicodeSets: true },
  ] satisfies PreflightTransforms[]) {
    const result = transform('var expression = /plain/;', 'fixture.js', pipeline(transforms));
    assert.equal(result.status, 'complete');
  }
});

test('explicit resource management exposes its helper contract independently', () => {
  const result = transform(
    'using resource = make();',
    'fixture.js',
    pipeline({ explicitResourceManagement: true }),
  );

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\busing\b/);
  assert.match(result.code, /@babel\/runtime\/helpers\/usingCtx/);
  assert.deepEqual(result.metadata.nativeHelpers, ['usingCtx']);

  const inline = transform(
    'var events = []; { using value = { [Symbol.dispose || Symbol.for("Symbol.dispose")]() { events.push("dispose"); } }; events.push("body"); } globalThis.events = events;',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'resource-management',
          native: {
            transforms: { explicitResourceManagement: true },
            helpers: { mode: 'inline' },
          },
        },
      ],
    }),
  );
  assert.equal(inline.status, 'complete');
  assert.doesNotMatch(inline.code, /require\(|regeneratorRuntime/);
  const context: { events?: string[] } = {};
  new Function('globalThis', inline.code)(context);
  assert.deepEqual(context.events, ['body', 'dispose']);
});

test('exportNamespaceFrom and sticky regexp lowering are independently selectable', () => {
  const namespace = transform(
    'export * as values from "pkg";',
    'fixture.js',
    pipeline({ exportNamespaceFrom: true }),
  );
  assert.equal(namespace.status, 'complete');
  assert.doesNotMatch(namespace.code, /export\s*\*\s*as/);
  assert.match(namespace.code, /import\s*\*\s*as/);

  const sticky = transform(
    'var expression = /a/y;',
    'fixture.js',
    pipeline({ regexpSticky: true }),
  );
  assert.equal(sticky.status, 'complete');
  assert.match(sticky.code, /new RegExp\(["'`]a["'`],["'`]y["'`]\)/);
});

test('asyncGeneratorFunctions lowers through the configured Babel helper ABI', () => {
  const result = transform(
    'var iterable = { async *values(input) { yield await 1; yield* input; for await (var value of input) yield value; } };',
    'fixture.js',
    pipeline({ asyncGeneratorFunctions: true }),
  );

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /async\s*\*/);
  assert.match(result.code, /@babel\/runtime\/helpers\/wrapAsyncGenerator/);
  assert.ok((result.metadata.nativeHelpers as string[]).includes('wrapAsyncGenerator'));
  assert.deepEqual(result.metadata.nativeHelpers, [
    'asyncGeneratorDelegate',
    'asyncIterator',
    'awaitAsyncGenerator',
    'wrapAsyncGenerator',
  ]);
  assert.doesNotMatch(result.code, /regeneratorRuntime/);
});

test('asyncFunctions is independently selectable and runs with inline helpers', async () => {
  const result = transform(
    'var load = async function (value) { return await value + 1; };',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'async-functions',
          native: {
            transforms: { asyncFunctions: true },
            helpers: { mode: 'inline' },
          },
        },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\basync\s+function\b|regeneratorRuntime|require\(/);
  assert.deepEqual(result.metadata.nativeHelpers, ['asyncToGenerator']);
  const load = new Function(`${result.code}; return load;`)() as (value: number) => Promise<number>;
  assert.equal(await load(4), 5);
});

test('async-generator helper requirements and unavailable block scoping are structured', async () => {
  const oldRuntime = transform(
    'var iterable = { async *values() { yield 1; } };',
    'fixture.js',
    pipeline(
      { asyncGeneratorFunctions: true },
      {
        mode: 'runtime',
        moduleName: '@babel/runtime',
        version: '6.0.0',
      },
    ),
  );
  assert.equal(oldRuntime.status, 'bailout');
  assert.match(oldRuntime.reason, /helper-runtime-too-old/);

  const inline = transform(
    'var iterable = { async *values(input) { yield await 1; yield* input; for await (var value of input) yield value; } };',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'syntax',
          native: {
            transforms: { asyncGeneratorFunctions: true },
            helpers: { mode: 'inline' },
            compact: true,
            comments: false,
          },
        },
      ],
    }),
  );
  assert.equal(inline.status, 'complete');
  assert.doesNotMatch(inline.code, /require\(|babelHelpers|regeneratorRuntime/);
  const iterator = new Function(
    `${inline.code}; return iterable.values([2]);`,
  )() as AsyncIterator<number>;
  assert.deepEqual(await iterator.next(), { value: 1, done: false });
  assert.deepEqual(await iterator.next(), { value: 2, done: false });
  assert.deepEqual(await iterator.next(), { value: 2, done: false });
  assert.deepEqual(await iterator.next(), { value: undefined, done: true });
  const inlineMap = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: inline.map.names,
    mappings: inline.map.mappings,
  });
  assert.deepEqual(originalPositionFor(inlineMap, { line: 2, column: 0 }), {
    source: 'fixture.js',
    line: 1,
    column: 0,
    name: null,
  });

  const collision = transform(
    'var _noxHelpers = 7; var iterable = { async *values() { yield _noxHelpers; } };',
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'syntax',
          native: {
            transforms: { asyncGeneratorFunctions: true },
            helpers: { mode: 'inline' },
            compact: true,
            comments: false,
          },
        },
      ],
    }),
  );
  assert.equal(collision.status, 'complete');
  assert.match(collision.code, /var _noxHelpers2=/);
  const collisionIterator = new Function(
    `${collision.code}; return iterable.values();`,
  )() as AsyncIterator<number>;
  assert.deepEqual(await collisionIterator.next(), { value: 7, done: false });

  const blockScoping = transform(
    'const value = 1;',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(blockScoping.status, 'bailout');
  assert.equal(blockScoping.reason, 'syntax:block-scoping-not-implemented');
});
