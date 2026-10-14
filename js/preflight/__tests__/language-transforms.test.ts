import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { test } from 'vitest';

import type { PreflightTransforms } from '../../index';
import { defineNativePipeline, transform } from '../../index';

const pipeline = (
  transforms: PreflightTransforms,
  helpers: { mode: 'runtime'; moduleName: string; version: string } | { mode: 'inline' } = {
    mode: 'runtime',
    moduleName: '@babel/runtime',
    version: '7.29.7',
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

const runtimeRequire = createRequire(import.meta.url);

test('native for-of preserves iterable closing, control flow, nesting, and destructured heads', () => {
  const source = `
    var closed = 0, values = [];
    function* items() { try { yield { value: 1 }; yield { value: 2 }; yield { value: 3 }; } finally { closed++; } }
    for (var { value } of items()) {
      if (value === 1) continue;
      for (var nested of [value]) values.push(nested);
      if (value === 2) break;
    }
    var labeled = [];
    outer: for (var x of [1, 2]) {
      for (var y of [1, 2]) {
        if (y === 1) continue outer;
        labeled.push([x, y]);
      }
    }
    globalThis.answer = [values, closed, labeled];
  `;
  const result = transform(source, 'fixture.js', pipeline({ forOf: true, destructuring: true }));
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bof\b/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [[2], 1, []]);
});

test('native destructuring preserves getters, iterators, defaults, rest, nesting, and catch bindings', () => {
  const source = `
    var reads = 0, closed = false;
    var key = "value";
    var input = { get value() { reads++; return { nested: 3 }; }, extra: 4 };
    var { [key]: { nested = 2 }, ...rest } = input;
    function* values() { try { yield 5; yield 6; yield 7; } finally { closed = true; } }
    var [first, second = 9] = values();
    var assigned, tail, assignmentValue = ([assigned, ...tail] = [8, 9, 10]);
    try { throw { message: "ok" }; } catch ({ message }) { globalThis.caught = message; }
    globalThis.answer = [nested, rest.extra, first, second, reads, closed, assigned, tail, assignmentValue];
  `;
  const result = transform(source, 'fixture.js', pipeline({ destructuring: true }));
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /var\s*[{[]|catch\s*\(\s*{/);
  const context: { answer?: unknown; caught?: string } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [3, 4, 5, 6, 1, true, 8, [9, 10], [8, 9, 10]]);
  assert.equal(context.caught, 'ok');
});

test('native destructuring helpers avoid source binding collisions', () => {
  const source =
    'var _toArray=1,_toArray2=2,_objectDestructuringEmpty=3,_objectDestructuringEmpty2=4,_objectWithoutProperties=5,_objectWithoutProperties2=6;var [first]=[7];var {value,...rest}={value:8,other:9};globalThis.result=[_toArray,_toArray2,_objectDestructuringEmpty,_objectDestructuringEmpty2,_objectWithoutProperties,_objectWithoutProperties2,first,value,rest.other];';
  const result = transform(
    source,
    'fixture.js',
    pipeline({
      destructuring: true,
      objectRestSpread: { loose: false, useBuiltIns: false },
    }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.match(result.code, /_toArray\d+|_objectWithoutProperties\d+/);
});

test('destructuring preserves a binding renamed by block scoping', () => {
  const result = transform(
    'function read(input) { { let routes = 1; globalThis.inner = routes; } const { routes } = input; return routes; } globalThis.result = read({ routes: 2 });',
    'fixture.js',
    pipeline({ blockScoping: true, destructuring: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { inner?: unknown; result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual([context.inner, context.result], [1, 2]);
});

test('native parameters preserve defaults, rest, destructuring, length, and mappings', () => {
  const source =
    'function read(first, { value } = { value: 2 }, ...rest) { return [first, value, rest, read.length]; }';
  const result = transform(source, 'fixture.js', pipeline({ parameters: true }));
  assert.equal(result.status, 'complete');
  const read = new Function(`${result.code}; return read;`)() as (
    first: number,
    value?: { value: number },
    ...rest: number[]
  ) => unknown;
  assert.deepEqual(read(1, undefined, 3, 4), [1, 2, [3, 4], 1]);

  const generatedOffset = result.code.indexOf('return[');
  const before = result.code.slice(0, generatedOffset).split('\n');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(
    originalPositionFor(map, {
      line: before.length,
      column: before.at(-1)!.length,
    }),
    {
      source: 'fixture.js',
      line: 1,
      column: source.indexOf('return ['),
      name: null,
    },
  );
});

test('native parameters preserve arrow lexical state and nested defaults', () => {
  const source =
    'function outer(input) { return (first = 1) => (second = 2) => [first, second, this.value, arguments[0]]; }';
  const result = transform(source, 'fixture.js', pipeline({ parameters: true }));
  assert.equal(result.status, 'complete');
  const outer = new Function(`${result.code}; return outer;`)() as Function;
  assert.deepEqual(outer.call({ value: 3 }, 4)()(), [1, 2, 3, 4]);
});

test('native parameters preserve a lowered arrow in a nullish-coalescing operand', () => {
  const result = transform(
    'const render = fallback ?? (({ color } = {}) => color);',
    'fixture.js',
    pipeline({ parameters: true }),
  );
  assert.equal(result.status, 'complete');
  const evaluate = new Function('fallback', `${result.code}; return render;`);
  const lowered = evaluate(null) as (input?: { color?: string }) => string | undefined;
  assert.equal(lowered({ color: 'blue' }), 'blue');
  const fallback = () => 'fallback';
  assert.equal(evaluate(fallback), fallback);
});

test('native parameters lower destructured rest bindings without fallback', () => {
  const result = transform(
    'function read(prefix, ...[first, second = 4]) { return [prefix, first, second]; } globalThis.result = read(1, 2);',
    'fixture.js',
    pipeline({ parameters: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\.\.\./);
  const context: { result?: number[] } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, [1, 2, 4]);
});

test('native parameters structurally reparse JSX arrow bodies', () => {
  const result = transform(
    'const View = ({ value, ...props }) => <div {...props}>{value}</div>;',
    'fixture.jsx',
    pipeline({ parameters: true, destructuring: true }),
  );
  assert.equal(result.status, 'complete');
  assert.match(result.code, /function\s*\(\)/);
  assert.match(result.code, /<div/);
});

test('native parameters isolate defaults from body bindings', () => {
  const source =
    'var shadow = 7; function read(value = shadow) { var shadow = 1; return [value, shadow, this.flag, arguments.length]; }';
  const result = transform(source, 'fixture.js', pipeline({ parameters: true }));
  assert.equal(result.status, 'complete');
  const read = new Function(`${result.code}; return read;`)() as Function;
  assert.deepEqual(read.call({ flag: 2 }), [7, 1, 2, 0]);

  const arrowResult = transform(
    'var shadow = 8; function make() { return (value = shadow) => { var shadow = 2; return [value, shadow, this.flag, arguments[0]]; }; }',
    'fixture.js',
    pipeline({ parameters: true }),
  );
  assert.equal(arrowResult.status, 'complete');
  const make = new Function(`${arrowResult.code}; return make;`)() as Function;
  assert.deepEqual(make.call({ flag: 3 }, 4)(), [8, 2, 3, 4]);
});

test('native parameters preserve arrow lexical new.target', () => {
  const result = transform(
    'function Factory() { return (value = 1) => [value, new.target && new.target.name]; }',
    'fixture.js',
    pipeline({ parameters: true }),
  );
  assert.equal(result.status, 'complete');
  const Factory = new Function(`${result.code}; return Factory;`)() as {
    new (): () => unknown;
    (): () => unknown;
  };
  assert.deepEqual(new Factory()(), [1, 'Factory']);
  assert.deepEqual(Factory()(), [1, undefined]);
});

test('native parameters do not capture lexical state from nested ordinary functions', () => {
  const result = transform(
    'function outer() { return (value = 1) => function inner() { return [value, this.flag, arguments[0], new.target && new.target.name]; }; }',
    'fixture.js',
    pipeline({ parameters: true }),
  );
  assert.equal(result.status, 'complete');
  const outer = new Function(`${result.code}; return outer;`)() as Function;
  const inner = outer.call({ flag: 'outer' })();
  assert.deepEqual(inner.call({ flag: 'inner' }, 2), [1, 'inner', 2, undefined]);
});

test('native parameters preserve arrow lexical super', () => {
  const result = transform(
    'class Base { method(value) { return value; } } class Derived extends Base { method() { return (value = 1) => super.method(value); } }',
    'fixture.js',
    pipeline({ parameters: true }),
  );
  assert.equal(result.status, 'complete');
  const Derived = new Function(`${result.code}; return Derived;`)() as new () => {
    method(): (value?: number) => number;
  };
  assert.equal(new Derived().method()(), 1);
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
                destructuring: {} as true,
              },
            },
          },
        ],
      }),
    /destructuring must be true/,
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

test('validates shared semantics while class feature representations remain independent', () => {
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
  const classFeatures = transform(
    'class Value { field = 1; #method() {} }',
    'fixture.js',
    pipeline({
      classProperties: { loose: false },
      privateMethods: true,
    }),
  );
  assert.equal(classFeatures.status, 'complete');
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

test('class lowering preserves the most-derived prototype through an inheritance chain', () => {
  const result = transform(
    'class Root {} class Middle extends Root {} class Leaf extends Middle { method() { return 42 } } var value = new Leaf(); globalThis.result = [value.constructor.name, value instanceof Leaf, value instanceof Middle, value.method()];',
    'fixture.js',
    pipeline({ classes: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, ['Leaf', true, true, 42]);
});

test('class lowering preserves lexical this in field arrows with rest parameters', () => {
  const result = transform(
    'class Events { listeners = []; call = (...args) => this.listeners.map(listener => listener(...args)); } var events = new Events(); events.listeners.push(value => value + 1); globalThis.result = events.call(2);',
    'fixture.js',
    pipeline({ classes: true, classProperties: { loose: true }, parameters: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, [3]);
  assert.doesNotMatch(result.code, /var _this\d*=this;[\s\S]*var Events/);
});

test('derived class field arrows retain their own return semantics', () => {
  const result = transform(
    'class Base {} class Derived extends Base { value = 4; primitive = () => this.value; object = () => ({ value: this.value }); } var value = new Derived(); globalThis.result = [value.primitive(), value.object().value];',
    'fixture.js',
    pipeline({ classes: true, classProperties: { loose: true } }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [4, 4]);
  assert.doesNotMatch(result.code, /constructors may only return[\s\S]*value\.primitive/);
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

test('loose built-in object rest/spread lowers through the focused native pass', () => {
  const result = transform(
    'var symbol=Symbol("s"),calls=0,input={get value(){calls++;return 2},extra:3,[symbol]:4};var copy={first:1,...input,last:5};var {value,...rest}=copy;globalThis.result=[value,rest.extra,rest[symbol],copy[symbol],calls,copy.first,copy.last];',
    'fixture.js',
    pipeline({ objectRestSpread: { loose: true, useBuiltIns: true } }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\.\.\./);
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [2, 3, undefined, 4, 1, 1, 5]);
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
    'objectDestructuringEmpty',
    'objectSpread2',
    'objectWithoutProperties',
  ]);
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [2, 1, 3, 4]);
});

test('regexp toggles preserve native syntax without constructor rewrites', () => {
  for (const [source, transforms] of [
    ['var expression = /(?<=a)b/;', { regexpLookBehind: true }],
    ['var expression = /a/d;', { regexpMatchIndices: true }],
  ] satisfies [string, PreflightTransforms][]) {
    const result = transform(source, 'fixture.js', pipeline(transforms));
    assert.equal(result.status, 'complete');
    assert.match(result.code, transforms.regexpLookBehind ? /\(\?<=a\)b/ : /\/a\/d/);
    assert.doesNotMatch(result.code, /new RegExp/);
  }

  const unicodeSets = transform(
    'var expression = /[a&&b]/v;',
    'fixture.js',
    pipeline({ regexpUnicodeSets: true }),
  );
  assert.equal(unicodeSets.status, 'complete');
  assert.match(unicodeSets.code, /\/\(\?!\)\/u/);
});
