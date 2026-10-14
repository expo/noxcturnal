import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { generatedPositionFor, originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
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
    '{ using resource = make(); }',
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

test('async-generator helper requirements fall back for an old runtime', async () => {
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
  assert.equal(oldRuntime.status, 'complete');
  assert.doesNotMatch(oldRuntime.code, /@babel\/runtime\/helpers/);

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
  const generated = generatedPositionFor(inlineMap, {
    source: 'fixture.js',
    line: 1,
    column: 0,
  });
  assert.notEqual(generated.line, null);
  assert.deepEqual(originalPositionFor(inlineMap, generated as { line: number; column: number }), {
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
      { destructuring: true },
      {
        mode: 'runtime',
        moduleName: '@babel/runtime',
        version: '7.29.7',
      },
    ),
  );
  assert.equal(current.status, 'complete');
  assert.match(current.code, /require\("@babel\/runtime\/helpers\/slicedToArray"\)/);
  assert.match(current.code, /require\("@babel\/runtime\/helpers\/toConsumableArray"\)/);
  assert.deepEqual(current.metadata.nativeHelpers, ['slicedToArray', 'toConsumableArray']);

  const old = transform(
    'var [value] = input;',
    'fixture.js',
    pipeline(
      { destructuring: true },
      {
        mode: 'runtime',
        moduleName: '@babel/runtime',
        version: '6.0.0',
      },
    ),
  );
  assert.equal(old.status, 'complete');
  assert.doesNotMatch(old.code, /@babel\/runtime\/helpers/);
});
