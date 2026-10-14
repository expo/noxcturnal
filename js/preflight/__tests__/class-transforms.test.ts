import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { expect, test } from 'vitest';

import type { PreflightTransforms } from '../../index';
import { defineNativePipeline, transform } from '../../index';
import { NATIVE_TRANSFORM_NAMES } from '../../preflight/schema';
import {
  NATIVE_TRANSFORM_COMPATIBILITY_BOUNDARIES,
  NATIVE_TRANSFORM_OWNERSHIP_FIXTURES,
} from './native-transform-fixtures';

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
      privateMethods: true,
      privatePropertyInObject: true,
    }),
  );
  assert.equal(result.status, 'complete');
  assert.match(result.code, /class Unrelated\{field=1\}/);
  assert.doesNotMatch(result.code, /#(?:field|method)/);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [[5, true], [5, false], 1, 4]);
});

// NOTE: Private features use one selected representation when composed with public fields.
test('classProperties composes private features through the focused representation', () => {
  for (const source of [
    'class Value { #method() { return 1 } read() { return this.#method() } }',
    'class Value { #field; has(value) { return #field in value } }',
  ]) {
    const result = transform(source, 'fixture.js', pipeline({ classProperties: { loose: true } }));
    assert.equal(result.status, 'complete');
    assert.doesNotMatch(result.code, /#(?:method|field)\b/);
  }

  const repaired = transform(
    'class Value { #method() { return 1 } read() { return this.#method() } } globalThis.result = new Value().read();',
    'fixture.js',
    pipeline({
      classProperties: { loose: true },
      privateMethods: true,
    }),
  );
  assert.equal(repaired.status, 'complete');
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', repaired.code)(context, runtimeRequire);
  assert.equal(context.result, 1);
});

// NOTE: The public option surface accepts either value, but private lowering uses one representation.
test('private feature options use the selected loose representation', () => {
  for (const [source, transforms] of [
    ['class Value { #method() {} }', { privateMethods: true }],
    [
      'class Value { #field; has(input) { return #field in input; } }',
      { privatePropertyInObject: true },
    ],
  ] satisfies [string, PreflightTransforms][]) {
    const result = transform(source, 'fixture.js', pipeline(transforms));
    assert.equal(result.status, 'complete');
    assert.doesNotMatch(result.code, /#(?:method|field)\b/);
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
  const lowering = pipeline({ destructuring: true });
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
    privateMethods: true,
    privatePropertyInObject: true,
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
      privateMethods: true,
      privatePropertyInObject: true,
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
      privateMethods: true,
      privatePropertyInObject: true,
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
      privateMethods: true,
      privatePropertyInObject: true,
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
      privateMethods: true,
      privatePropertyInObject: true,
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
      privateMethods: true,
      privatePropertyInObject: true,
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
  new Function('globalThis', 'require', result.code)(context, createRequire(import.meta.url));
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
