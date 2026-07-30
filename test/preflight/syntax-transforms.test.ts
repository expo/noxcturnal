import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { expect, test } from 'vitest';

import type { PreflightTransforms } from '../../dist/index.js';
import { defineNativePipeline, transform } from '../../dist/index.js';
import { NATIVE_TRANSFORM_NAMES } from '../../dist/preflight/schema.js';
import {
  NATIVE_TRANSFORM_COMPATIBILITY_BOUNDARIES,
  NATIVE_TRANSFORM_OWNERSHIP_FIXTURES,
} from './native-transform-fixtures.js';

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

test('every public native transform has an explicit ownership fixture', () => {
  assert.deepEqual(Object.keys(NATIVE_TRANSFORM_OWNERSHIP_FIXTURES), [...NATIVE_TRANSFORM_NAMES]);

  for (const name of NATIVE_TRANSFORM_NAMES) {
    const [source, option] = NATIVE_TRANSFORM_OWNERSHIP_FIXTURES[name];
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
      NATIVE_TRANSFORM_COMPATIBILITY_BOUNDARIES.has(name) ? 'bailout' : 'complete',
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

  assert.equal(result.status, 'complete', result.status === 'bailout' ? result.reason : undefined);
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

// Bundling `apps/native-component-list` for iOS aborted the Metro worker here:
// a `MethodDefinition` with no body reached `body.as_ref().unwrap()` in the
// class lowering, and a panic across the napi boundary takes the process with
// it rather than failing the file. TypeScript declaration syntax produces these
// — an overload signature or an `abstract` member — and both reach the lowering
// because it runs on the pre-strip AST.
//
// They carry no runtime code, so the lowering skips them. Two ways that can go
// wrong and each is covered below: emitting an overload signature as if it were
// a method, and mistaking one for the implementation it precedes.
// Eight files in an iOS bundle of `apps/native-component-list` fell back to
// Babel with `destructuring-edit-conflict`, at 70 ms each — the most expensive
// fallback per file in the whole pass. Both destructuring lowerings replaced the
// construct *including* its initializer, so a pattern nested anywhere inside
// that initializer produced an edit inside the outer edit's range and the piece
// table rejected the pair. The initializer's bytes are now left in place, which
// is what lets the nested edit compose.
test('native destructuring lowers patterns nested inside an initializer', () => {
  const lowering = pipeline({ destructuring: { useBuiltIns: true } });
  for (const [source, expected] of [
    // The shape from the corpus: an assignment pattern whose right-hand side
    // contains a function containing another pattern.
    [
      'var outer;\n' +
        'outer = [[5]].map(function build() {\n' +
        '  let [inner] = arguments.length > 0 ? arguments[0] : void 0;\n' +
        '  return inner;\n' +
        '});\n' +
        'globalThis.answer = outer[0];',
      5,
    ],
    // Both constructs end at the same offset, so the inner suffix has to render
    // before the outer one.
    ['var b;\nlet [a] = [b] = [7];\nglobalThis.answer = a + b;', 14],
    ['var m, n;\n[m] = [n] = [8];\nglobalThis.answer = m + n;', 16],
    // A parenthesized initializer must keep its parentheses.
    ['let [a, b] = ([1, 2]);\nglobalThis.answer = a + b;', 3],
    ['let [a] = (0, [9]);\nglobalThis.answer = a;', 9],
  ] satisfies [string, number][]) {
    const result = transform(source, 'fixture.js', lowering);
    assert.equal(result.status, 'complete');
    assert.ok(result.status === 'complete');
    const context: { answer?: unknown } = {};
    new Function('globalThis', 'require', result.code)(context, runtimeRequire);
    assert.equal(context.answer, expected);
  }
});

test('native classes skip bodiless TypeScript methods', () => {
  const lowering = pipeline({
    classes: true,
    classProperties: { loose: true },
    privateMethods: { loose: true },
    privatePropertyInObject: { loose: true },
  });
  for (const [source, expected] of [
    // An overload signature must not shadow the implementation that follows.
    [
      'class Value { read(input: string): number; read(input: any) { return 10 + input; } }\n' +
        'globalThis.answer = new Value().read(2);',
      12,
    ],
    // The same, for a constructor: the signature comes first in the body.
    [
      'class Value { x: number; constructor(input: string); constructor(input: any) { this.x = input + 1; } }\n' +
        'globalThis.answer = new Value(1).x;',
      2,
    ],
    // `abstract` members exist only in the type system.
    [
      'abstract class Base { abstract read(): void; write() { return 7; } }\n' +
        'class Value extends Base { read() {} }\n' +
        'globalThis.answer = new Value().write();',
      7,
    ],
    // A private overload resolves through the same private-key binding.
    [
      'class Value { #v = 3; #d(input: string): number; #d(input: any) { return this.#v * input; } read() { return this.#d(4); } }\n' +
        'globalThis.answer = new Value().read();',
      12,
    ],
    // `super` in the implementation still lowers, and the signature above it
    // must not be scanned for `super` on a body it does not have.
    [
      'class Base { m() { return 1; } }\n' +
        'class Value extends Base { m(input: string): number; m(input: any) { return super.m() + input; } }\n' +
        'globalThis.answer = new Value().m(4);',
      5,
    ],
  ] satisfies [string, number][]) {
    const result = transform(source, 'fixture.ts', lowering);
    assert.equal(result.status, 'complete');
    assert.ok(result.status === 'complete');
    const context: { answer?: unknown } = {};
    new Function('globalThis', 'require', result.code)(context, runtimeRequire);
    assert.equal(context.answer, expected);
  }
});

// An ambient class emits nothing at all. Lowering one turned `declare class A {}`
// into a real `var A`, because the TypeScript strip pass that would have deleted
// it no longer saw a class — wrong independently of bodiless methods, and true
// for `declare class Value { x: number }` with no methods at all.
test('native classes leave ambient declarations to the TypeScript strip pass', () => {
  const lowering = pipeline({ classes: true, classProperties: { loose: true } });
  for (const source of [
    'declare class Value { read(): void; }',
    'declare class Value { x: number; }',
  ]) {
    const result = transform(
      `${source}\nglobalThis.answer = typeof Value;`,
      'fixture.ts',
      lowering,
    );
    assert.equal(result.status, 'complete');
    assert.ok(result.status === 'complete');
    assert.doesNotMatch(result.code, /\bValue\s*=/);
    const context: { answer?: unknown } = {};
    new Function('globalThis', 'require', result.code)(context, runtimeRequire);
    assert.equal(context.answer, 'undefined');
  }

  // A real class alongside an ambient one still lowers.
  const mixed = transform(
    'declare class Ambient { read(): void; }\nclass Value { read() { return 9; } }\n' +
      'globalThis.answer = new Value().read();',
    'fixture.ts',
    lowering,
  );
  assert.equal(mixed.status, 'complete');
  assert.ok(mixed.status === 'complete');
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', mixed.code)(context, runtimeRequire);
  assert.equal(context.answer, 9);
});

test('native classes lower loose private fields, methods, calls, access, and private-in', () => {
  const source = `
    class Secret {
      #value = 2;
      #double(input) { return this.#value * input; }
      read() { return this.#double(3); }
      has(input) { return #value in input; }
      increment(input) { return ++input.#value; }
      callOther(input) { return input.#double(2); }
    }
    var value = new Secret();
    var readError = false, callError = false;
    try { value.increment({}); } catch (error) { readError = error instanceof TypeError; }
    try { value.callOther({}); } catch (error) { callError = error instanceof TypeError; }
    globalThis.answer = [
      value.read(),
      value.increment(value),
      value.has(value),
      value.has({}),
      readError,
      callError,
    ];
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
  assert.doesNotMatch(result.code, /\bclass\s+Secret\b/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [6, 3, true, false, true, true]);
});

test('native classes rewrite private references inside field initializers and static blocks', () => {
  const source = `
    class Registry {
      #value = 2;
      #read = () => this.#value;
      #callback = () => this.#read();
      static #staticValue = 3;
      static { globalThis.staticValue = this.#staticValue; }
      result() { return this.#callback(); }
    }
    globalThis.result = new Registry().result();
  `;
  const result = transform(
    source,
    'fixture.js',
    pipeline({
      classes: true,
      classProperties: { loose: true },
      classStaticBlock: true,
      privateMethods: { loose: true },
      privatePropertyInObject: { loose: true },
    }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /#[A-Za-z_$]/);
  assert.doesNotMatch(result.code, /\bclass\s+Registry\b/);
  const context: { result?: unknown; staticValue?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.equal(context.result, 2);
  assert.equal(context.staticValue, 3);
});

test('native classes structurally pair loose private accessors', () => {
  const result = transform(
    `
      class Accessors {
        #field = 1;
        get #value() { return this.#field; }
        set #value(value) { this.#field = value; }
        static #staticField = 2;
        static get #staticValue() { return this.#staticField; }
        static set #staticValue(value) { this.#staticField = value; }
        #reverseField = 3;
        set #reverseValue(value) { this.#reverseField = value; }
        get #reverseValue() { return this.#reverseField; }
        read() { this.#value = 4; return this.#value; }
        readReverse() { this.#reverseValue = 6; return this.#reverseValue; }
        static read() { this.#staticValue = 5; return this.#staticValue; }
      }
      const instance = new Accessors();
      globalThis.result = [instance.read(), Accessors.read(), instance.readReverse()];
    `,
    'fixture.js',
    pipeline({
      classes: true,
      classProperties: { loose: true },
      privateMethods: { loose: true },
      privatePropertyInObject: { loose: true },
    }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+Accessors\b|#[A-Za-z_$]/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [4, 5, 6]);
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

test('native private methods lower structurally for sibling classes after the directive prologue', () => {
  const source =
    '"use strict";class First{#read(){return 1}read(){return this.#read()}}class Second{#read(){return 2}read(){return this.#read()}}globalThis.result=[new First().read(),new Second().read()];';
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
  assert.ok(result.code.startsWith('"use strict";'));
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [1, 2]);
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
    var key = "double", trace = [], keyReads = 0, rhsReads = 0;
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
      writeSuper(value) { return super.current = (trace.push("set"), value); }
      addSuper(value) { return super[(keyReads++, "current")] += (rhsReads++, value); }
      static kind() { return super.kind() + "-derived"; }
    }
    var Expression = class Named { method() { return Named.name; } };
    var value = Derived.create(3);
    value.current = 4;
    var assigned = value.writeSuper(6);
    var added = value.addSuper(2);
    globalThis.answer = [value.current, assigned, added, keyReads, rhsReads, value.double(), value.readSuper(), Derived.kind(), value instanceof Base, value.field, value.derivedField, Base.staticField, Base.fromBlock, trace, value.derived, Expression.name, new Expression().method()];
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
    8,
    6,
    8,
    1,
    1,
    16,
    24,
    'base-derived',
    true,
    1,
    5,
    2,
    3,
    ['field', 'block', 'set'],
    true,
    'Named',
    'Named',
  ]);
});

test('native classes structurally lower plain declarations and expressions', () => {
  const result = transform(
    'class Value { constructor(value) { this.value = value; } read() { return this.value; } get doubled() { return this.value * 2; } static kind() { return "value"; } } var Expression = class Named { read() { return Named.name; } }; globalThis.result = [new Value(3).read(), new Value(3).doubled, Value.kind(), new Expression().read()];',
    'fixture.js',
    pipeline({ classes: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Value|Named)\b/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, [3, 6, 'value', 'Named']);
});

test('native classes evaluate computed field and method keys once in source order', () => {
  const result = transform(
    `
      var trace = [];
      function key(name) { trace.push("key:" + name); return name; }
      class Computed {
        [key("method")]() { return this.field; }
        [key("field")] = (trace.push("instance"), 3);
        static [key("staticField")] = (trace.push("static"), 4);
        [key("second")]() { return this.field + 1; }
        static { trace.push("block"); }
      }
      var first = new Computed(), second = new Computed();
      globalThis.result = [
        first.method(),
        second.second(),
        Computed.staticField,
        trace,
      ];
    `,
    'fixture.js',
    pipeline({
      classes: true,
      classProperties: { loose: true },
      classStaticBlock: true,
    }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+Computed\b/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, [
    3,
    4,
    4,
    [
      'key:method',
      'key:field',
      'key:staticField',
      'key:second',
      'static',
      'block',
      'instance',
      'instance',
    ],
  ]);
});

test('native classes structurally lower exports and nested classes', async () => {
  const result = transform(
    `
      export class Outer {
        make() {
          return class Inner {
            static value() { return 7; }
          };
        }
      }
      export default class DefaultValue {
        read() { return new Outer().make().value(); }
      }
    `,
    'fixture.mjs',
    pipeline({ classes: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Outer|Inner|DefaultValue)\b/);
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`
  );
  assert.equal(new module.default().read(), 7);
  assert.equal(new module.Outer().make().value(), 7);
});

test('native classes structurally lower default derived constructors', () => {
  const result = transform(
    `
      class Base {
        constructor(value) { this.value = value; }
        read() { return this.value; }
        static kind() { return "base"; }
      }
      class Derived extends Base {
        offset = this.value + 1;
        doubled() { return this.value * 2; }
        static own() { return "derived"; }
      }
      globalThis.result = [
        new Derived(4).read(),
        new Derived(4).doubled(),
        Derived.kind(),
        Derived.own(),
        new Derived(4) instanceof Base,
        new Derived(4).offset,
      ];
    `,
    'fixture.js',
    pipeline({ classes: true, classProperties: { loose: true } }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Base|Derived)\b/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [4, 8, 'base', 'derived', true, 5]);
});

test('native classes structurally lower leading-super derived constructors', () => {
  const result = transform(
    `
      class Base {
        constructor(value) { this.value = value; }
      }
      class Derived extends Base {
        offset = this.value + 2;
        constructor(value) {
          super(value + 1);
          this.arrow = () => this.value;
          this.normal = function () { return this === globalThis.marker; };
        }
      }
      var value = new Derived(4);
      globalThis.result = [
        value.value,
        value.arrow(),
        value.normal.call(globalThis.marker),
        value instanceof Base,
        value.offset,
      ];
    `,
    'fixture.js',
    pipeline({ classes: true, classProperties: { loose: true } }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Base|Derived)\b/);
  const marker = {};
  const context: { result?: unknown[]; marker: object } = { marker };
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [5, 5, true, true, 7]);
});

test('native classes structurally lower short-circuiting super assignments', () => {
  const result = transform(
    `
      var gets = 0, sets = 0, rhs = 0;
      class Base {
        get current() { gets++; return this._value; }
        set current(value) { sets++; this._value = value; }
      }
      class Derived extends Base {
        or(value) { return super.current ||= (rhs++, value); }
        and(value) { return super.current &&= (rhs++, value); }
        nullish(value) { return super.current ??= (rhs++, value); }
      }
      var value = new Derived();
      var results = [value.or(3), value.or(4), value.and(5)];
      value._value = 0;
      results.push(value.and(6), value.nullish(6));
      value._value = null;
      results.push(value.nullish(7));
      globalThis.result = [results, gets, sets, rhs, value._value];
    `,
    'fixture.js',
    pipeline({ classes: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Base|Derived)\b/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [[3, 3, 5, 0, 0, 7], 6, 3, 3, 7]);
});

test('native classes structurally lower prefix and postfix super updates', () => {
  const result = transform(
    `
      var keys = 0, sets = 0;
      class Base {
        get current() { return this._value; }
        set current(value) { sets++; this._value = value; }
      }
      class Derived extends Base {
        post() { return super[(keys++, "current")]++; }
        pre() { return --super.current; }
      }
      var value = new Derived();
      value._value = 3;
      var numberResults = [value.post(), value._value, value.pre(), value._value];
      value._value = 1n;
      var bigintResults = [value.post(), value._value];
      globalThis.result = [numberResults, bigintResults, keys, sets];
    `,
    'fixture.js',
    pipeline({ classes: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Base|Derived)\b/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [[3, 4, 3, 3], [1n, 2n], 2, 3]);
});

test('native classes structurally validate explicit derived constructor returns', () => {
  const result = transform(
    `
      class Base {}
      class Derived extends Base {
        constructor(kind) {
          super();
          this.nested = function () { return 1; };
          if (kind === "object") return { kind };
          if (kind === "function") return function returned() {};
          if (kind === "undefined") return;
          return 1;
        }
      }
      var object = new Derived("object");
      var callable = new Derived("function");
      var normal = new Derived("undefined");
      var error;
      try { new Derived("primitive"); } catch (caught) { error = caught.message; }
      globalThis.result = [
        object.kind,
        typeof callable,
        normal instanceof Derived,
        normal.nested(),
        error,
      ];
    `,
    'fixture.js',
    pipeline({ classes: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Base|Derived)\b/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [
    'object',
    'function',
    true,
    1,
    'Derived constructors may only return object or undefined',
  ]);
});

test('native classes structurally handle derived constructors that do not always call super', () => {
  const result = transform(
    `
      class Base {}
      class ObjectResult extends Base {
        constructor() { return { valid: true }; }
      }
      class MissingSuper extends Base {
        constructor(kind) {
          if (kind === "super") super();
          if (kind === "object") return { replacement: true };
          return;
        }
      }
      var objectOnly = new ObjectResult();
      var conditional = new MissingSuper("super");
      var replacement = new MissingSuper("object");
      var errors = [];
      for (var kind of ["missing", "undefined"]) {
        try { new MissingSuper(kind); } catch (error) { errors.push(error.name); }
      }
      globalThis.result = [
        objectOnly.valid,
        conditional instanceof MissingSuper,
        replacement.replacement,
        errors,
      ];
    `,
    'fixture.js',
    pipeline({ classes: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Base|ObjectResult|MissingSuper)\b/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [true, true, true, ['ReferenceError', 'ReferenceError']]);
});

test('native classes structurally lower literal public field keys', () => {
  const result = transform(
    `
      class Value {
        '' = 1;
        2 = 3;
      }
      var value = new Value();
      globalThis.result = [value[''], value[2]];
    `,
    'fixture.js',
    pipeline({ classes: true, classProperties: { loose: true } }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+Value\b/);
  const context: { result?: unknown[] } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, [1, 3]);
});

test('native classes structurally lower anonymous expressions returned from generic arrows', () => {
  const result = transform(
    `
      export default <T>(value: T) =>
        class extends Array<T> {
          field = value;
        };
    `,
    'fixture.ts',
    defineNativePipeline({
      phases: [
        {
          name: 'syntax',
          native: {
            transforms: {
              classes: true,
              classProperties: { loose: true },
            },
            typescript: 'strip',
            helpers: {
              mode: 'runtime',
              moduleName: '@babel/runtime',
              version: '7.29.7',
            },
            compact: true,
            comments: false,
          },
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete', result.status === 'bailout' ? result.reason : undefined);
  assert.doesNotMatch(result.code, /\bclass\s+extends\b/);
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

test('destructuring preserves a binding renamed by block scoping', () => {
  const result = transform(
    'function read(input) { { let routes = 1; globalThis.inner = routes; } const { routes } = input; return routes; } globalThis.result = read({ routes: 2 });',
    'fixture.js',
    pipeline({ blockScoping: true, destructuring: { useBuiltIns: true } }),
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
    pipeline({ parameters: true, destructuring: { useBuiltIns: true } }),
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

// A property escape inside a character class used to bail: its expansion is
// itself a class, and the part above U+FFFF is a sequence of surrogate pairs
// that no class can hold. The class is rewritten whole instead — basic-plane
// ranges merged into one class, astral ranges hoisted out beside it — which is
// the shape `regexpu-core` produces for Babel.
test('native regexp lowers property escapes inside a character class', () => {
  const lowering = pipeline({ regexpUnicodePropertyEscapes: true });
  const source = [
    'globalThis.result = [',
    // Basic-plane only.
    '  /[\\p{Script=Arabic}\\p{Script=Hebrew}]/u.test("\\u0631"),',
    '  /[\\p{Script=Arabic}\\p{Script=Hebrew}]/u.test("\\u05D0"),',
    '  /[\\p{Script=Arabic}\\p{Script=Hebrew}]/u.test("a"),',
    // Mixed with literals and ranges.
    '  /^[a-z\\p{Nd}]+$/u.test("ab\\u0669"),',
    '  /^[\\p{Nd}_-]+$/u.test("_-\\u0660"),',
    // Astral: the hoisted alternative has to match a surrogate pair.
    '  /^[\\p{Script=Deseret}]$/u.test("\\u{10400}"),',
    '  /^[\\p{Script=Deseret}]$/u.test("a"),',
    // A negative lookahead wrapping a class, from the corpus.
    '  /(?![\\p{Mark}\\p{Decimal_Number}])[\\p{Script=Arabic}]/u.test("\\u0631"),',
    '  /(?![\\p{Mark}\\p{Decimal_Number}])[\\p{Script=Arabic}]/u.test("\\u0660"),',
    // `\\p{Cs}` is refused by the Rust property tables because a Rust `char`
    // cannot be a surrogate; it is a fixed range by definition.
    '  /^\\p{Cs}$/u.test("\\uD800"),',
    '  /^[\\p{Cs}]$/u.test("\\uDFFF"),',
    '  /^[\\p{Cs}]$/u.test("a"),',
    '];',
  ].join('\n');
  const result = transform(source, 'fixture.js', lowering);
  assert.equal(result.status, 'complete');
  assert.ok(result.status === 'complete');
  assert.doesNotMatch(result.code, /\\p\{/);
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.result, [
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
  ]);
});

// The class rewrite must be exactly the union of the same properties lowered on
// their own. Anything left over after that is the Unicode table difference
// between `regex-syntax` and Babel's `@unicode/*` data, which predates this and
// shows up outside classes too.
test('a lowered property class equals the union of its properties', () => {
  const lowering = pipeline({ regexpUnicodePropertyEscapes: true });
  const lower = (pattern: string) => {
    const result = transform(`var expression = /${pattern}/u;`, 'fixture.js', lowering);
    assert.equal(result.status, 'complete');
    assert.ok(result.status === 'complete');
    return result.code.replace(/^var expression=\//, '').replace(/\/u;\s*$/, '');
  };
  for (const properties of [
    ['Mark', 'Decimal_Number'],
    ['Script=Arabic', 'Script=Hebrew'],
    ['Nd', 'ASCII'],
  ]) {
    // The lowered form keeps its `u` flag — only `regexpUnicode` strips it, and
    // `\u{...}` needs the flag — so both sides compile with it.
    const asClass = new RegExp(
      `^(?:${lower(`[${properties.map(name => `\\p{${name}}`).join('')}]`)})$`,
      'u',
    );
    const asUnion = new RegExp(
      `^(?:${properties.map(name => lower(`\\p{${name}}`)).join('|')})$`,
      'u',
    );
    for (let code = 0; code < 0x2000; code += 1) {
      const sample = String.fromCharCode(code);
      assert.equal(
        asClass.test(sample),
        asUnion.test(sample),
        `U+${code.toString(16)} differs for [${properties.join(', ')}]`,
      );
    }
  }
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
  assert.deepEqual(result.metadata.nativeHelpers, ['wrapRegExp']);
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

test('native block scoping renames a block binding that would shadow an outer binding', () => {
  const result = transform(
    'const matcher = /%/g; function decode(value) { for (let index = 0; index < value.length; index++) { const matcher = value.charCodeAt(index); if (matcher === 37) break; } return value.replace(matcher, "/"); } globalThis.output = decode("%2F");',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(result.status, 'complete');
  assert.match(result.code, /var _matcher\s*=\s*value\.charCodeAt\(index\)/);
  const target: { output?: string } = {};
  new Function('globalThis', result.code)(target);
  assert.equal(target.output, '/2F');
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

test('captured-loop fragments normalize UTF-8 offsets before structural mutation', () => {
  const result = transform(
    'function read(items) { /* → */ var callbacks = []; for (const key in items) { if (!items[key]) continue; callbacks.push(() => key); } return callbacks.map(callback => callback()); } globalThis.result = read({ a: 1, b: 0, c: 1 });',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: string[] } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, ['a', 'c']);
});

test('captured loops inside private class methods retain their enclosing private names', () => {
  const result = transform(
    'class Values { #items = [1, 2]; read() { const callbacks = []; for (const value of this.#items) callbacks.push(() => value); return callbacks.map(callback => callback()); } } globalThis.result = new Values().read();',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: number[] } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, [1, 2]);
});

test('captured-loop helpers preserve colliding header bindings as parameters', () => {
  const result = transform(
    'var values = []; for (let ii = 0; ii < 1; ii++) values.push(ii); for (let ii = 0; ii < 2; ii++) { let value = ii; values.push(() => value); } globalThis.result = [values[0], values[1](), values[2]()];',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', result.code)(context);
  assert.deepEqual(context.result, [0, 0, 1]);
  assert.match(result.code, /_loop\d*\(_ii\)/);
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

test('native captured-loop AST relocation preserves await and delegated yield', async () => {
  const asyncResult = transform(
    'async function read() { var callbacks = []; for (let value of [Promise.resolve(1), Promise.resolve(2)]) { value = await value; callbacks.push(() => value); } return callbacks.map(callback => callback()); }',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(asyncResult.status, 'complete');
  const readAsync = new Function(`${asyncResult.code}; return read;`)() as () => Promise<number[]>;
  assert.deepEqual(await readAsync(), [1, 2]);

  const generatorResult = transform(
    'function* read() { var callbacks = []; for (let value of [1, 2]) { yield value; callbacks.push(() => value); } return callbacks.map(callback => callback()); }',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(generatorResult.status, 'complete');
  const readGenerator = new Function(`${generatorResult.code}; return read;`)() as () => Generator<
    number,
    number[]
  >;
  const iterator = readGenerator();
  assert.deepEqual(iterator.next(), { value: 1, done: false });
  assert.deepEqual(iterator.next(), { value: 2, done: false });
  assert.deepEqual(iterator.next(), { value: [1, 2], done: true });
});

test('generated prologue statements do not fuse with an unterminated directive', () => {
  // `'use strict'` without a semicolon is closed by automatic semicolon
  // insertion, so anything written at the directive's end joins the string
  // literal instead of following it.
  for (const [name, transforms, source, answer] of [
    [
      'destructuring',
      { destructuring: { useBuiltIns: true } },
      "'use strict'\nconst { value } = globalThis.input\nglobalThis.answer = value",
      5,
    ],
    [
      'parameters',
      { parameters: true },
      "'use strict'\nfunction read(value = 2) { return value }\nglobalThis.answer = read()",
      2,
    ],
    [
      'regexpNamedCaptureGroups',
      { regexpNamedCaptureGroups: true },
      "'use strict'\nglobalThis.answer = /(?<digit>\\d)/.exec('7').groups.digit",
      '7',
    ],
    [
      'function body directive',
      { parameters: true },
      "function read(value = 2) {\n  'use strict'\n  return value\n}\nglobalThis.answer = read()",
      2,
    ],
  ] as const) {
    const result = transform(source, 'fixture.js', pipeline(transforms));
    assert.equal(
      result.status,
      'complete',
      `${name}: ${result.status === 'bailout' ? result.reason : result.status}`,
    );
    assert.match(result.code, /"use strict";/, name);
    const context: { input: { value: number }; answer?: unknown } = { input: { value: 5 } };
    new Function('globalThis', 'require', result.code)(context, runtimeRequire);
    assert.equal(context.answer, answer, name);
  }
});

test('arrow parameter capture stays in the scope that owns its this', () => {
  // A class field initializer binds its own `this`, and an enclosing arrow's
  // concise body has no braces, so neither can host a hoisted `var _this`.
  const result = transform(
    `class Example {
       value = 4;
       read = ({ addend }) => this.value + addend;
       curried = (factor) => ({ addend }) => this.value * factor + addend;
     }
     var example = new Example();
     globalThis.answer = [example.read({ addend: 1 }), example.curried(2)({ addend: 3 })];`,
    'fixture.js',
    pipeline({ parameters: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [5, 11]);
});

test('classes lower TypeScript constructor parameter properties into fields', () => {
  const result = transform(
    `class Base { constructor(seed) { this.seed = seed } }
     class Derived extends Base {
       field = 1;
       constructor(public named: number, protected fallback = 2) {
         super(named);
         this.total = this.named + this.fallback + this.field + this.seed;
       }
     }
     class Plain { offset = 10; constructor(private only: number) { this.total = this.only + this.offset } }
     globalThis.answer = [new Derived(3).total, new Plain(5).total];`,
    'fixture.ts',
    pipeline({ classes: true, classProperties: { loose: true } }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\b(?:public|protected|private)\b/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [9, 15]);
});

test('React Refresh keeps the async wrapper the async lowering installs', () => {
  // Oxc visits Refresh before async-to-generator, so the `_s(...)` wrapper it
  // installs used to hide the function that still had to be wrapped, leaving a
  // bare `yield` in an `async` body.
  const result = transform(
    "import { useState } from 'react';\nexport default async (input) => { useState(); return await input; };",
    'fixture.jsx',
    defineNativePipeline({
      phases: [
        {
          name: 'refresh',
          native: {
            transforms: { asyncFunctions: true },
            reactRefresh: {},
            helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
            compact: true,
            comments: false,
          },
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\basync\s*(?:\(|function)/);
  assert.match(result.code, /_asyncToGenerator\(function\*/);
  // The phase output is re-parsed at every downstream boundary.
  assert.equal(
    transform(
      result.code,
      'fixture.jsx',
      defineNativePipeline({ phases: [{ name: 'reparse', native: { compact: true } }] }),
    ).status,
    'complete',
  );
});

test('derived constructors accept every shape of leading super call', () => {
  const source = `
    class Base { constructor(tag) { this.tag = tag } }
    class Sequence extends Base {
      field = 'f';
      constructor(tag) { super(tag), this.extra = tag + '!'; }
    }
    class Returned extends Base {
      constructor(tag) { return super(tag); }
    }
    class ReturnedSequence extends Base {
      constructor(tag) { return super(tag), this.extra = 'tail', this; }
    }
    class Escapes extends Base {
      constructor(tag) { super(tag); return { replaced: tag }; }
    }
    var sequence = new Sequence('a'), returned = new Returned('b'), tail = new ReturnedSequence('c');
    globalThis.answer = [
      [sequence.tag, sequence.field, sequence.extra],
      [returned.tag, returned instanceof Returned],
      [tail.tag, tail.extra, tail instanceof ReturnedSequence],
      new Escapes('d').replaced,
    ];
  `;
  const result = transform(
    source,
    'fixture.js',
    pipeline({ classes: true, classProperties: { loose: true } }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(
    result.code,
    /\bclass\s+(?:Base|Sequence|Returned|ReturnedSequence|Escapes)\b/,
  );
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [['a', 'f', 'a!'], ['b', true], ['c', 'tail', true], 'd']);
});

test('derived constructors lower a super call the body reaches conditionally', () => {
  // Nothing here fits the split template: the call is inside a branch, and it
  // appears twice. The general lowering renames `this` instead of splitting.
  const source = `
    class Base { constructor(tag) { this.tag = tag } }
    class Derived extends Base {
      field = 'f';
      constructor(flag) {
        if (!new.target) { throw new TypeError('needs new'); }
        var prepared = flag ? 'yes' : 'no';
        if (flag) { super(prepared); this.extra = 1; } else { super(prepared); this.extra = 2; }
        this.seen = this.tag + this.field;
      }
    }
    class Sub extends Derived { constructor() { super(true); this.sub = true } }
    var yes = new Derived(true), no = new Derived(false), sub = new Sub();
    var threw = false;
    try { Derived.call({}, true) } catch (error) { threw = error instanceof TypeError }
    globalThis.answer = [
      [yes.tag, yes.field, yes.extra, yes.seen],
      [no.tag, no.extra],
      [sub.tag, sub.sub, sub instanceof Sub, sub instanceof Base],
      threw,
    ];
  `;
  const result = transform(
    source,
    'fixture.js',
    pipeline({ classes: true, classProperties: { loose: true } }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\bclass\s+(?:Base|Derived|Sub)\b/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [
    ['yes', 'f', 1, 'yesf'],
    ['no', 2],
    ['yes', true, true, true],
    true,
  ]);
});

test('derived constructors keep new.target pointing at the constructed class', () => {
  const source = `
    class Base {}
    class Derived extends Base {
      constructor() { super(); this.target = new.target === Derived; this.name = new.target.name }
    }
    class Sub extends Derived {}
    globalThis.answer = [new Derived().target, new Sub().target, new Sub().name];
  `;
  const result = transform(source, 'fixture.js', pipeline({ classes: true }));
  assert.equal(result.status, 'complete');
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [true, false, 'Sub']);
});

test('derived constructors reach private names and super properties', () => {
  const source = `
    class Base {
      constructor(seed) { this.seed = seed }
      scale(input) { return input * 2 }
    }
    class Derived extends Base {
      #secret;
      #doubled = 0;
      constructor(seed) {
        super(seed);
        this.#secret = seed + 1;
        this.#doubled = super.scale(this.#secret);
      }
      read() { return [this.#secret, this.#doubled] }
    }
    globalThis.answer = new Derived(3).read();
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
  assert.doesNotMatch(result.code, /#(?:secret|doubled)/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [4, 8]);
});

test('one method may use both super and private names', () => {
  const source = `
    class Base {
      value() { return 1 }
      wrap(input) { return ['wrapped', input] }
      static kind() { return 'base' }
    }
    class Derived extends Base {
      #bonus = 10;
      #scale(input) { return input * 3 }
      total() { return super.value() + this.#bonus }
      nested() { return super.wrap(this.#scale(this.#bonus)) }
      viaPrivate() { return this.#combine() }
      #combine() { return super.value() + this.#bonus * 2 }
      static kind() { return super.kind() + '-derived' }
    }
    var value = new Derived();
    globalThis.answer = [value.total(), value.nested(), value.viaPrivate(), Derived.kind()];
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
  assert.doesNotMatch(result.code, /#(?:bonus|scale|combine)/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [11, ['wrapped', 30], 21, 'base-derived']);
});

test('generated constructor locals do not capture the module bindings they shadow', () => {
  const source = `
    var _this = 'outer', _result = 'outer', _newtarget = 'outer', _super = 'outer';
    class Base { constructor(tag) { this.tag = tag } }
    class Split extends Base { constructor(tag) { super(tag); this.seen = _this + _result } }
    class General extends Base {
      constructor(tag) { if (tag) { super(tag) } else { super('none') } this.seen = _newtarget + _super }
    }
    globalThis.answer = [new Split('a').seen, new General('b').seen, new General(0).tag];
  `;
  const result = transform(source, 'fixture.js', pipeline({ classes: true }));
  assert.equal(result.status, 'complete');
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, ['outerouter', 'outerouter', 'none']);
});

test('TypeScript enums and namespaces lower past the block-scoping postcondition', () => {
  const result = transform(
    `export enum Style { Normal, Solid }
     namespace Shapes { export const size = 2; }
     const scale = Shapes.size;
     globalThis.answer = [Style.Solid, Style[0], scale];`,
    'fixture.ts',
    pipeline({ blockScoping: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\b(?:let|const)\s/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code.replace(/^export /gm, ''))(
    context,
    runtimeRequire,
  );
  assert.deepEqual(context.answer, [1, 'Normal', 2]);
});

test('a lexical binding declared inside a loop callback is not a captured loop binding', () => {
  // The declaration's own function is not the closure that captures it, so
  // `for (let i …) { xs.map(([a, b]) => …) }` needs no per-iteration environment.
  const result = transform(
    `function collect(...rows) {
       var out = [];
       for (let index = 0, total = rows.length; index < total; ++index) {
         out.push(rows[index].map(([key, value]) => key + value + index));
       }
       return out;
     }
     globalThis.answer = collect([['a', 1]], [['b', 2]]);`,
    'fixture.js',
    pipeline({ blockScoping: true, destructuring: { useBuiltIns: true }, parameters: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [['a10'], ['b21']]);
});

test('a function inside a parameter default is lowered from the body it moves to', () => {
  const result = transform(
    `function useLinking(ref, { enabled = true, subscribe = (listener) => {
       const callback = ({ url }) => listener(url);
       return callback({ url: 'href' });
     } } = {}) {
       return [enabled, subscribe((value) => 'got:' + value)];
     }
     globalThis.answer = useLinking(null);`,
    'fixture.js',
    pipeline({ destructuring: { useBuiltIns: true }, parameters: true }),
  );
  assert.equal(result.status, 'complete');
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [true, 'got:href']);
});

test('parameter lists that only exist as TypeScript types are not left unlowered', () => {
  const result = transform(
    `interface Renderer { render(...items: string[]): string }
     type Formatter = ({ value }: { value: string }) => string;
     declare function ambient(...rest: number[]): void;
     class Shape {
       area(...sizes: number[]): number;
       area(first: number): number {
         return first;
       }
     }
     const format: Formatter = ({ value }) => value;
     globalThis.answer = [format({ value: 'ok' }), new Shape().area(2)];`,
    'fixture.ts',
    pipeline({ parameters: true, destructuring: { useBuiltIns: true } }),
  );
  assert.equal(result.status, 'complete');
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, ['ok', 2]);
});

test('the language prepass erases TypeScript before the ES rewrites read it', () => {
  // `declare` and `abstract` fields emit nothing, an overload signature and an
  // ambient class emit nothing, a parameter property becomes a field plus an
  // ordered constructor assignment, and an `enum` reaches block scoping already
  // lowered. Every one of those used to be the ES rewrites' problem.
  const result = transform(
    `enum Kind { Wide, Tall }
     declare class Ambient { gone: number }
     abstract class Shape {
       abstract label: () => string;
       declare hint: string;
       kind = Kind.Wide;
       area(...sizes: number[]): number;
       area(first: number): number { return first }
     }
     class Box extends Shape {
       label = () => 'box';
       constructor(public width: number, protected height = 2) {
         super();
         this.total = this.width * this.height;
       }
     }
     const box = new Box(3);
     globalThis.answer = [box.total, box.label(), box.kind, box.area(4), Object.keys(box).sort()];`,
    'fixture.ts',
    pipeline({ blockScoping: true, classes: true, classProperties: { loose: true } }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /\b(?:let|const)\s/);
  assert.doesNotMatch(result.code, /\bAmbient\b/);
  // An abstract or `declare`d field is a type, so it must not reach the instance.
  assert.doesNotMatch(result.code, /\bhint\b/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [6, 'box', 0, 4, ['height', 'kind', 'label', 'total', 'width']]);
});

test('a parameter name that only collides with a type keeps its own name', () => {
  // Type parameters and annotation parameters are symbols too, so before the
  // prepass they made the ES rewrites rename bindings and wrap function bodies
  // to avoid collisions that could not happen at runtime.
  const result = transform(
    `type Handler = (value: string) => void;
     interface Props { value: string; onChange: (value: string) => void }
     function render(props: Props) {
       const { value } = props;
       return value.toUpperCase();
     }
     globalThis.answer = render({ value: 'ok', onChange: () => {} });`,
    'fixture.ts',
    pipeline({ blockScoping: true, destructuring: { useBuiltIns: true }, parameters: true }),
  );
  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /_value\b/);
  assert.doesNotMatch(result.code, /\}\.apply\(this, ?arguments\)/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.equal(context.answer, 'OK');
});

test('React Refresh still registers a context used as a JSX element', () => {
  // Refresh only registers `const Foo = call()` when `Foo` appears as a JSX
  // element name, so it has to run while the JSX is still JSX — which is why it
  // stays out of the language prepass.
  const result = transform(
    `import { createContext, useState } from 'react';
     export const ThemeContext = createContext<number>(1);
     export function Provider({ children }: { children: unknown }) {
       const [value] = useState(2);
       return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
     }`,
    'fixture.tsx',
    defineNativePipeline({
      phases: [
        {
          name: 'refresh',
          native: {
            typescript: 'strip',
            jsx: 'automatic',
            jsxImportSource: 'react',
            reactRefresh: {},
            transforms: {
              blockScoping: true,
              destructuring: { useBuiltIns: true },
              parameters: true,
            },
            helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
            compact: true,
            comments: false,
          },
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.match(result.code, /\$RefreshReg\$\(\w+, ?`ThemeContext`\)/);
  assert.match(result.code, /\$RefreshReg\$\(\w+, ?`Provider`\)/);
  // The signature call belongs at the top of the body, ahead of the prologue
  // the parameter rewrite adds.
  assert.match(result.code, /function Provider\(\)\{_s\(\)/);
});

test('React Refresh signatures track hook structure after native mutation', () => {
  const refreshPipeline = defineNativePipeline({
    phases: [
      {
        name: 'refresh',
        native: {
          jsx: 'automatic',
          reactRefresh: {},
          transforms: { destructuring: { useBuiltIns: true } },
          helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
          compact: true,
          comments: false,
        },
      },
    ],
  });
  const signature = (source: string) => {
    const result = transform(source, 'fixture.jsx', refreshPipeline);
    assert.equal(result.status, 'complete');
    const match = result.code.match(/_s\(C,`([^`]+)`\)/);
    assert.ok(match);
    return match[1];
  };
  const stateOnly = signature(
    "import { useState } from 'react'; export function C() { const [value] = useState(1); return value; }",
  );
  const effectThenState = signature(
    "import { useEffect, useState } from 'react'; export function C() { useEffect(() => {}); const [value] = useState(1); return value; }",
  );
  assert.notEqual(stateOnly, effectThenState);
});

test('Oxc keeps the class-feature transforms it owns and loses the ones it does not', () => {
  // `set_public_class_fields` is how `classProperties: { loose }` reaches Oxc,
  // so it has to survive when Oxc is the one lowering fields — and it must not
  // be set when `classes` is, because there it configures nothing Oxc will run
  // and is still read by Oxc's TypeScript strip, which lowers a static field
  // into a static block on the strength of it.
  const source = `class C { x = 1; static s = 2; static { globalThis.block = 3 } }
    globalThis.answer = [new C().x, C.s, globalThis.block];`;
  const expected = [1, 2, 3];

  const loose = transform(
    source,
    'fixture.js',
    pipeline({ classProperties: { loose: true }, classStaticBlock: true }),
  );
  assert.equal(loose.status, 'complete');
  assert.match(loose.code, /this\.x\s*=\s*1/);
  assert.doesNotMatch(loose.code, /_defineProperty/);

  const spec = transform(
    source,
    'fixture.js',
    pipeline({ classProperties: { loose: false }, classStaticBlock: true }),
  );
  assert.equal(spec.status, 'complete');
  assert.match(spec.code, /_defineProperty\(this, ?`x`, ?1\)/);

  const owned = transform(
    source,
    'fixture.js',
    pipeline({ classes: true, classProperties: { loose: true }, classStaticBlock: true }),
  );
  assert.equal(owned.status, 'complete');
  assert.doesNotMatch(owned.code, /\bclass\s+C\b/);
  assert.doesNotMatch(owned.code, /_defineProperty/);

  for (const result of [loose, spec, owned]) {
    const context: { answer?: unknown; block?: unknown } = {};
    new Function('globalThis', 'require', result.code)(context, runtimeRequire);
    assert.deepEqual(context.answer, expected);
  }
});

test('a loose option does not loosen a transform it was not given to', () => {
  // `no_document_all` is a whole-program assumption, and the only readers are
  // optional chaining and the optional chain class properties builds around a
  // private field. Selecting it from `nullishCoalescingOperator` left the
  // nullish output untouched — Oxc's nullish transform never reads it — while
  // quietly rewriting `o?.#x` in a transform the caller configured separately.
  const chain = 'class C { #x = 1; read(o) { return o?.#x } }';
  const strict = /o===null\|\|o===void 0/;

  const nullishLoose = transform(
    chain,
    'fixture.js',
    pipeline({ classProperties: { loose: false }, nullishCoalescingOperator: { loose: true } }),
  );
  assert.equal(nullishLoose.status, 'complete');
  assert.match(nullishLoose.code, strict);

  // Asking for it where it belongs still works.
  const chainLoose = transform(
    chain,
    'fixture.js',
    pipeline({ classProperties: { loose: false }, optionalChaining: { loose: true } }),
  );
  assert.equal(chainLoose.status, 'complete');
  assert.match(chainLoose.code, /o==null/);

  const chainStrict = transform(
    chain,
    'fixture.js',
    pipeline({ classProperties: { loose: false }, optionalChaining: { loose: false } }),
  );
  assert.equal(chainStrict.status, 'complete');
  assert.match(chainStrict.code, strict);
});

test('inline helper materialization gets the same TypeScript treatment', () => {
  // Inline helper materialization used to skip the language prepass, which left
  // it running a second, separate implementation of TypeScript erasure inside
  // the rewrites — one that every other test in this file had stopped covering.
  // The prepass runs on every path now and that implementation is gone, so this
  // pins that the mode which was the exception behaves like the rest.
  const inline = { mode: 'inline' } as const;
  const run = (source: string, transforms: Parameters<typeof pipeline>[0]) => {
    const result = transform(source, 'fixture.ts', pipeline(transforms, inline));
    assert.equal(result.status, 'complete', result.status === 'bailout' ? result.reason : '');
    assert.ok(result.status === 'complete');
    const context: { answer?: unknown } = {};
    new Function('globalThis', 'require', result.code)(context, runtimeRequire);
    return { code: result.code, answer: context.answer };
  };
  const classes = { classes: true, classProperties: { loose: true } } as const;

  // A parameter property is not a parameter.
  const parameterProperty = run(
    `class Plain { offset = 10; constructor(private only: number) { this.total = this.only + this.offset } }
     globalThis.answer = new Plain(5).total;`,
    classes,
  );
  assert.doesNotMatch(parameterProperty.code, /\b(?:public|protected|private)\b/);
  assert.equal(parameterProperty.answer, 15);

  // An overload signature is not the implementation.
  assert.equal(
    run(
      `class Value { read(input: string): number; read(input: any) { return 10 + input } }
       globalThis.answer = new Value().read(2);`,
      classes,
    ).answer,
    12,
  );

  // An ambient class emits nothing.
  const ambient = run(
    'declare class Value { x: number }\nglobalThis.answer = typeof Value;',
    classes,
  );
  assert.doesNotMatch(ambient.code, /\bValue\s*=/);
  assert.equal(ambient.answer, 'undefined');

  // A `declare`d or `abstract` field never reaches the instance.
  const fields = run(
    `abstract class Shape { abstract label: () => string; declare hint: string; kind = 1 }
     class Box extends Shape { label = () => 'box' }
     globalThis.answer = Object.keys(new Box()).sort();`,
    classes,
  );
  assert.doesNotMatch(fields.code, /\bhint\b/);
  assert.deepEqual(fields.answer, ['kind', 'label']);

  // A parameter list that only ever existed as a type is not unlowered work.
  assert.equal(
    run(
      `interface Renderer { render(...items: string[]): string }
       type Formatter = ({ value }: { value: string }) => string;
       const format: Formatter = ({ value }) => value;
       globalThis.answer = format({ value: 'ok' });`,
      { parameters: true, destructuring: { useBuiltIns: true } },
    ).answer,
    'ok',
  );
});

test('a decorator is refused rather than dropped on the way through', () => {
  // Neither the TypeScript pass nor the `classes` rewrite implements decorators,
  // and both discard them in passing. Checked only after the rewrites, as it
  // used to be, there is nothing left to find and the class ships undecorated —
  // which is what `ActionSheetScreen.tsx` had been doing.
  for (const source of [
    '@wrap\nclass App { render() { return 1 } }',
    'class App { @bound method() { return 1 } }',
    'class App { constructor(@inject() private service: Service) {} }',
  ]) {
    const result = transform(
      `${source}\nglobalThis.answer = new App();`,
      'fixture.ts',
      pipeline({ classes: true, classProperties: { loose: true } }),
    );
    assert.equal(result.status, 'bailout');
    assert.ok(result.status === 'bailout');
    assert.equal(result.reason, 'syntax:decorators-not-supported');
  }
});
