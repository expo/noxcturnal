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

test('native block scoping preserves keys when renaming shorthand assignment targets', () => {
  const result = transform(
    'var name = "outer"; function read() { let name; ({ user: { name } } = { user: { name: "test" } }); return name; } globalThis.result = read();',
    'fixture.js',
    pipeline({ blockScoping: true }),
  );
  assert.equal(result.status, 'complete');
  assert.match(result.code, /user:\s*\{\s*name:\s*_name/);
  const target: { result?: string } = {};
  new Function('globalThis', result.code)(target);
  assert.equal(target.result, 'test');
});

test('native block scoping preserves const write errors after lowering to var', () => {
  for (const write of ['value = 2', 'value += 2', 'value++']) {
    const result = transform(
      `const value = 1; ${write};`,
      'fixture.js',
      pipeline({ blockScoping: true }),
    );
    assert.equal(result.status, 'complete');
    assert.throws(() => new Function('require', result.code)(runtimeRequire), TypeError);
  }
});

test('Hermes V1 block scoping preserves read-only private stores without lowering classes', () => {
  for (const source of [
    'const marker = 1; class Foo { #bar() {} constructor() { this.#bar = 1; } } new Foo();',
    'const marker = 1; class Foo { #bar() {} constructor() { this.#bar += 1; } } new Foo();',
    'const marker = 1; class Foo { get #bar() { return 1; } constructor() { this.#bar = 2; } } new Foo();',
  ]) {
    const result = transform(source, 'fixture.js', pipeline({ blockScoping: true }));
    assert.equal(result.status, 'complete');
    assert.match(result.code, /class Foo/);
    assert.throws(() => new Function('require', result.code)(runtimeRequire), TypeError);
  }
});

test('native loose private methods and getter-only accessors remain read-only', () => {
  for (const source of [
    'class Foo { #bar() {} constructor() { this.#bar = 1; } } new Foo();',
    'class Foo { #bar() {} constructor() { this.#bar += 1; } } new Foo();',
    'class Foo { get #bar() { return 1; } constructor() { this.#bar = 2; } } new Foo();',
  ]) {
    const result = transform(
      source,
      'fixture.js',
      pipeline({
        classes: true,
        classProperties: { loose: true },
        privateMethods: { loose: true },
      }),
    );
    assert.equal(result.status, 'complete');
    assert.throws(() => new Function('require', result.code)(runtimeRequire), TypeError);
  }
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
