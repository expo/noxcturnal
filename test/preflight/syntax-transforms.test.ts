import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { expect, test } from 'vitest';

import type { PreflightTransforms } from '../../dist/index.js';
import { defineNativePipeline, transform } from '../../dist/index.js';
import { NATIVE_TRANSFORM_NAMES } from '../../dist/preflight/schema.js';

const pipeline = (
  transforms: PreflightTransforms,
  helpers: { mode: 'runtime'; moduleName: string; version: string } = {
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

type TransformName = (typeof NATIVE_TRANSFORM_NAMES)[number];

const TRANSFORM_OWNERSHIP_FIXTURES = {
  blockScoping: ['let value = 1;', true],
  classes: ['class Value {}', true],
  destructuring: ['var { value } = input;', { useBuiltIns: true }],
  parameters: ['function read(value = 1) { return value; }', true],
  forOf: ['for (var value of values) consume(value);', true],
  explicitResourceManagement: ['using value = acquire();', true],
  classStaticBlock: ['class Value { static { this.value = 1; } }', true],
  classProperties: ['class Value { field = 1; }', { loose: true }],
  logicalAssignmentOperators: ['value ||= 1;', true],
  optionalChaining: ['value?.field;', { loose: false }],
  nullishCoalescingOperator: ['value ?? fallback;', { loose: false }],
  exportNamespaceFrom: ['export * as value from "pkg";', true],
  optionalCatchBinding: ['try {} catch {}', true],
  objectRestSpread: ['var value = { ...input };', { loose: true, useBuiltIns: true }],
  asyncGeneratorFunctions: ['async function* values() { yield 1; }', true],
  asyncFunctions: ['async function value() { return 1; }', true],
  exponentiationOperator: ['value **= 2;', true],
  privateMethods: ['class Value { #read() {} }', { loose: true }],
  privatePropertyInObject: [
    'class Value { #field; has(input) { return #field in input; } }',
    { loose: true },
  ],
  regexpSticky: ['var value = /a/y;', true],
  regexpUnicode: ['var value = /😀/u;', true],
  regexpUnicodePropertyEscapes: ['var value = /\\p{ASCII}/u;', true],
  regexpDotAll: ['var value = /a.b/s;', true],
  regexpNamedCaptureGroups: ['var value = /(?<value>a)/;', true],
  regexpLookBehind: ['var value = /(?<=a)b/;', true],
  regexpMatchIndices: ['var value = /a/d;', true],
  regexpUnicodeSets: ['var value = /[a&&b]/v;', true],
} as const satisfies Record<TransformName, readonly [string, PreflightTransforms[TransformName]]>;

test('every public native transform has an explicit ownership fixture', () => {
  assert.deepEqual(Object.keys(TRANSFORM_OWNERSHIP_FIXTURES), [...NATIVE_TRANSFORM_NAMES]);

  const documentedStandaloneBoundaries = new Set<TransformName>([
    'regexpLookBehind',
    'regexpMatchIndices',
    'regexpUnicodeSets',
  ]);
  for (const name of NATIVE_TRANSFORM_NAMES) {
    const [source, option] = TRANSFORM_OWNERSHIP_FIXTURES[name];
    const result = transform(
      source,
      'fixture.js',
      pipeline({ [name]: option } as PreflightTransforms),
    );
    expect({
      name,
      source,
      option,
      status: result.status,
      code: result.status === 'complete' ? result.code : undefined,
      helpers:
        result.status === 'complete'
          ? ((result.metadata.nativeHelpers as string[] | undefined) ?? [])
          : undefined,
      map:
        result.status === 'complete'
          ? { mappings: result.map.mappings, names: result.map.names }
          : undefined,
      reason: result.status === 'bailout' ? result.reason : undefined,
    }).toMatchSnapshot();
    assert.equal(
      result.status,
      documentedStandaloneBoundaries.has(name) ? 'bailout' : 'complete',
      `${name} has no matching ownership disposition`,
    );
    const noOp = transform(
      'var untouched = 1;',
      'fixture.js',
      pipeline({ [name]: option } as PreflightTransforms),
    );
    assert.equal(noOp.status, 'complete', `${name} does not preserve unrelated syntax`);
    if (noOp.status === 'complete') assert.match(noOp.code, /untouched=1/);
  }
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
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.equal(context.answer, 42);
  assert.equal(context.fields, 5);
});

test('private toggles lower owned classes without lowering unrelated class syntax', () => {
  const result = transform(
    `class Unrelated { field = 1 }
     class Example {
       #field;
       constructor(value) { this.#field = value; }
       #method(value) { return this.#field + value; }
       read(input) { return [this.#method(3), #field in input]; }
     }
     class Accessors {
       #field = 1;
       get #value() { return this.#field; }
       set #value(value) { this.#field = value; }
       read() { this.#value = 4; return this.#value; }
     }
     var value = new Example(2);
     globalThis.answer = [value.read(value), value.read({}), new Unrelated().field, new Accessors().read()];`,
    'fixture.js',
    pipeline({
      privateMethods: { loose: true },
      privatePropertyInObject: { loose: true },
    }),
  );
  assert.equal(result.status, 'complete');
  assert.match(result.code, /class Unrelated\{field=1\}/);
  assert.doesNotMatch(result.code, /#(?:field|method)/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [[5, true], [5, false], 1, 4]);
});

test('classProperties rejects pinned Oxc private-method and private-in fusion bugs', () => {
  for (const [source, reason] of [
    [
      'class Value { #method() { return 1 } read() { return this.#method() } }',
      'oxc-class-properties-private-method-fusion',
    ],
    [
      'class Value { #field; has(value) { return #field in value } }',
      'oxc-class-properties-private-in-fusion',
    ],
  ]) {
    const result = transform(source, 'fixture.js', pipeline({ classProperties: { loose: true } }));
    assert.equal(result.status, 'bailout');
    assert.equal(result.reason, `syntax:${reason}`);
    assert.equal(result.source, source);
  }

  const repaired = transform(
    'class Value { #method() { return 1 } read() { return this.#method() } } globalThis.result = new Value().read();',
    'fixture.js',
    pipeline({
      classProperties: { loose: true },
      privateMethods: { loose: true },
    }),
  );
  assert.equal(repaired.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', repaired.code)(context, runtimeRequire);
  assert.equal(context.result, 1);
});

test('spec private feature options retain a structured semantic boundary', () => {
  for (const [source, transforms] of [
    ['class Value { #method() {} }', { privateMethods: { loose: false } }],
    [
      'class Value { #field; has(input) { return #field in input; } }',
      { privatePropertyInObject: { loose: false } },
    ],
  ] satisfies [string, PreflightTransforms][]) {
    const result = transform(source, 'fixture.js', pipeline(transforms));
    assert.equal(result.status, 'bailout');
    assert.equal(result.reason, 'syntax:classes-spec-private-features-not-implemented');
  }
});

test('native classes lower loose private fields, methods, calls, access, and private-in', () => {
  const source = `
    class Secret {
      #value = 2;
      #double(input) { return this.#value * input; }
      read() { return this.#double(3); }
      has(input) { return #value in input; }
    }
    var value = new Secret();
    globalThis.answer = [value.read(), value.has(value), value.has({})];
  `;
  const result = transform(
    source,
    'fixture.js',
    pipeline({
      classes: true,
      classProperties: { loose: true },
      privateMethods: { loose: true },
      privatePropertyInObject: { loose: true },
    }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /#(?:value|double)/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [6, true, false]);
});

test('native class helpers avoid source binding collisions', () => {
  const source =
    'var _construct=1,_construct2=2,_get=3,_get2=4,_classPrivateFieldLooseBase=5,_classPrivateMethodCall=6,_classPrivateFieldLooseBase2=7;class Base{value(){return 8}}class Value extends Base{#value(){return 9}privateValue(){return this.#value()}superValue(){return super.value()}bindings(){return [_construct,_construct2,_get,_get2,_classPrivateFieldLooseBase,_classPrivateMethodCall,_classPrivateFieldLooseBase2]}}var instance=new Value;globalThis.result=[instance.privateValue(),instance.superValue(),instance.bindings()];';
  const result = transform(
    source,
    'fixture.js',
    pipeline({
      classes: true,
      privateMethods: { loose: true },
      privatePropertyInObject: { loose: true },
    }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [9, 8, [1, 2, 3, 4, 5, 6, 7]]);
  assert.match(
    result.code,
    /_construct\d+|_classPrivateFieldLooseBase\d+|_classPrivateMethodCall\d+|_get\d+/,
  );
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
  const cases: [string, PreflightTransforms, string][] = [];

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

test('native classes preserve methods, accessors, computed keys, expressions, and default inheritance', () => {
  const source = `
    var key = "double", trace = [];
    class Base {
      field = 1;
      static staticField = (trace.push("field"), 2);
      static { trace.push("block"); this.fromBlock = 3; }
      constructor(value) { this.value = value; }
      get current() { return this.value; }
      set current(value) { this.value = value; }
      [key]() { return this.value * 2; }
      static create(value) { return new this(value); }
      static kind() { return "base"; }
    }
    class Derived extends Base {
      derivedField = this.value + 1;
      constructor(value) { super(value + 1); this.derived = true; }
      readSuper() { return super.current + super.double(); }
      static kind() { return super.kind() + "-derived"; }
    }
    var Expression = class Named { method() { return Named.name; } };
    var value = Derived.create(3);
    value.current = 4;
    globalThis.answer = [value.current, value.double(), value.readSuper(), Derived.kind(), value instanceof Base, value.field, value.derivedField, Base.staticField, Base.fromBlock, trace, value.derived, Expression.name, new Expression().method()];
  `;
  const result = transform(
    source,
    'fixture.js',
    pipeline({
      classes: true,
      classProperties: { loose: true },
      classStaticBlock: true,
    }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Base|Derived|Named)\b/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [
    4,
    8,
    12,
    'base-derived',
    true,
    1,
    5,
    2,
    3,
    ['field', 'block'],
    true,
    'Named',
    'Named',
  ]);
});

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
  const result = transform(
    source,
    'fixture.js',
    pipeline({ forOf: true, destructuring: { useBuiltIns: true } }),
  );
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
  const result = transform(
    source,
    'fixture.js',
    pipeline({ destructuring: { useBuiltIns: true } }),
  );
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
      destructuring: { useBuiltIns: true },
      objectRestSpread: { loose: false, useBuiltIns: false },
    }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.match(result.code, /_toArray\d+|_objectWithoutProperties\d+/);
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

test('native parameters retain an explicit boundary for arrow lexical super', () => {
  const result = transform(
    'class Base { method(value) { return value; } } class Derived extends Base { method() { return (value = 1) => super.method(value); } }',
    'fixture.js',
    pipeline({ parameters: true }),
  );
  assert.equal(result.status, 'bailout');
  assert.equal(result.reason, 'syntax:arrow-parameters-lexical-super-not-implemented');
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
    'objectSpread2',
    'objectWithoutProperties',
  ]);
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [2, 1, 3, 4]);
});

test('regexp toggles reject Oxc constructor-only output that is not Babel lowering', () => {
  for (const [source, transforms, reason] of [
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

test('native regexp lowering preserves dotAll and named capture behavior', () => {
  const source =
    'var expression=/(?<word>a).\\k<word>/s;var match=expression.exec("a\\na");var replaced="a\\na".replace(expression,function(_,word,offset,input,groups){return groups.word+":"+word+":"+offset+":"+input});globalThis.result=[match&&match[0],match&&match.groups.word,"a\\na".replace(expression,"$<word>!"),replaced,/😀+/u.test("😀😀"),/\\u{1F600}/u.test("😀"),/^.$/u.test("😀"),/^.$/u.test("\\n"),/\\p{ASCII}/u.test("A"),/\\p{Script=Greek}/u.test("λ"),/\\p{Letter}/u.test("𐐀"),/\\P{ASCII}/u.test("λ")];';
  const result = transform(
    source,
    'fixture.js',
    pipeline({
      regexpUnicode: true,
      regexpUnicodePropertyEscapes: true,
      regexpDotAll: true,
      regexpNamedCaptureGroups: true,
    }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\(\?<word>/);
  assert.match(result.code, /\[\^\]/);
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [
    'a\na',
    'a',
    'a!',
    'a:a:0:a\na',
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
  ]);
});

test('native regexp helpers avoid source binding collisions', () => {
  const result = transform(
    'var _wrapRegExp=1,_wrapRegExp2=2;var match=/(?<value>a)/.exec("a");globalThis.result=[_wrapRegExp,_wrapRegExp2,match.groups.value];',
    'fixture.js',
    pipeline({ regexpNamedCaptureGroups: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [1, 2, 'a']);
  assert.match(result.code, /_wrapRegExp\d+/);
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
  assert.doesNotMatch(result.code, /wrapAsyncGenerator|asyncGeneratorDelegate|asyncIterator/);
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
  assert.doesNotMatch(inline.code, /require\(|regeneratorRuntime/);
  assert.match(inline.code, /var babelHelpers=/);
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
    'var babelHelpers = 7; var iterable = { async *values() { yield babelHelpers; } };',
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
  assert.match(collision.code, /var babelHelpers2=/);
  const collisionIterator = new Function(
    `${collision.code}; return iterable.values();`,
  )() as AsyncIterator<number>;
  assert.deepEqual(await collisionIterator.next(), { value: 7, done: false });

  const blockScoping = transform(
    'const value = 1;',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(blockScoping.status, 'complete');
  assert.match(blockScoping.code, /var value\s*=\s*1/);
});

test('focused runtime adapters expose and validate canonical Babel dependencies', () => {
  const current = transform(
    'var [value] = input;',
    'fixture.js',
    pipeline(
      { destructuring: { useBuiltIns: true } },
      {
        mode: 'runtime',
        moduleName: '@babel/runtime',
        version: '7.29.7',
      },
    ),
  );
  assert.equal(current.status, 'complete');
  assert.match(current.code, /require\("@babel\/runtime\/helpers\/slicedToArray"\)/);
  assert.match(current.code, /require\("@babel\/runtime\/helpers\/toArray"\)/);
  assert.deepEqual(current.metadata.nativeHelpers, ['slicedToArray', 'toArray']);

  const old = transform(
    'var [value] = input;',
    'fixture.js',
    pipeline(
      { destructuring: { useBuiltIns: true } },
      {
        mode: 'runtime',
        moduleName: '@babel/runtime',
        version: '6.0.0',
      },
    ),
  );
  assert.equal(old.status, 'bailout');
  assert.match(old.reason, /helper-runtime-too-old/);
});

test('native block scoping renames colliding lexical bindings', () => {
  const result = transform(
    'let value = 0; if (true) { let value = 1; consume(value); } consume(value);',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(result.status, 'complete');
  assert.match(
    result.code,
    /var value\s*=\s*0;[\s\S]*var _value\s*=\s*1;[\s\S]*consume\(_value\)[\s\S]*consume\(value\)/,
  );
  const observed: number[] = [];
  new Function('consume', result.code)((value: number) => observed.push(value));
  assert.deepEqual(observed, [1, 0]);
});

test('native block scoping preserves captured loop bindings and relocated mappings', () => {
  const source = 'var callbacks = []; for (let value of [1, 2, 3]) callbacks.push(() => value);';
  const result = transform(source, 'fixture.js', pipeline({ blockScoping: true }));
  assert.equal(result.status, 'complete');
  const callbacks = new Function(`${result.code}; return callbacks;`)() as Array<() => number>;
  assert.deepEqual(
    callbacks.map(callback => callback()),
    [1, 2, 3],
  );

  const generatedOffset = result.code.indexOf('callbacks.push');
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
      column: source.indexOf('callbacks.push'),
      name: null,
    },
  );
});

test('native block scoping preserves loop bindings captured by deferred class fields', () => {
  const result = transform(
    'var classes=[];for(let value of [1,2,3]){classes.push(class { field=value })}globalThis.result=classes.map(Value=>new Value().field);',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: number[] } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [1, 2, 3]);
});

test('native captured-loop lowering preserves nested loops and abrupt control flow', () => {
  const source =
    'function read() { var values = []; outer: for (let i of [1, 2]) for (let j of [3, 4]) { if (j === 4) continue outer; values.push(() => [i, j]); } return values.map(read => read()); }';
  const result = transform(source, 'fixture.js', pipeline({ blockScoping: true }));
  assert.equal(result.status, 'complete');
  assert.deepEqual(new Function(`${result.code}; return read();`)(), [
    [1, 3],
    [2, 3],
  ]);
});
