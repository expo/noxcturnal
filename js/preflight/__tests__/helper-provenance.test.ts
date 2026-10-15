import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { test } from 'vitest';

import { native } from '../../native/binding';

const runtimeRequire = createRequire(import.meta.url);

test('structural helper dependencies are identical in inline and runtime modes', () => {
  for (const [source, filename, transforms] of [
    ['const value = { ...input };', 'fixture.js', { objectRestSpread: true }],
    ['for (const value of input) consume(value);', 'fixture.js', { forOf: true }],
    [
      'const view = <Widget label="value" {...props} />;',
      'fixture.jsx',
      { jsx: 'classic', jsxPragma: 'React.createElement' },
    ],
  ] as const) {
    const inline = native.nativePreflightTransform(source, filename, {
      ...transforms,
      helpersMode: 'inline',
    });
    const runtime = native.nativePreflightTransform(source, filename, {
      ...transforms,
      helpersMode: 'runtime',
      helpersModuleName: '@babel/runtime',
      helpersVersion: '7.29.7',
    });
    assert.equal(inline.status, 'complete');
    assert.equal(runtime.status, 'complete');
    assert.deepEqual(inline.helpersUsed, runtime.helpersUsed);
  }
});

test('Expo 7.20 runtime mixes available runtime helpers with inline fallback', async () => {
  const source = `
    var disposed = false;
    var resource = { [Symbol.dispose]() { disposed = true; } };
    async function increment(value) { return value + 1; }
    { using current = resource; }
    globalThis.answer = increment(4).then(value => [value, disposed]);
  `;
  const result = native.nativePreflightTransform(source, 'fixture.js', {
    asyncFunctions: true,
    explicitResourceManagement: true,
    helpersMode: 'runtime',
    helpersModuleName: '@babel/runtime',
    helpersVersion: '7.20.0',
  });
  assert.equal(result.status, 'complete', result.reason);
  assert.deepEqual(result.helpersUsed, ['asyncToGenerator', 'usingCtx']);
  assert.match(result.code!, /require\("@babel\/runtime\/helpers\/asyncToGenerator"\)/);
  assert.doesNotMatch(result.code!, /require\("@babel\/runtime\/helpers\/usingCtx"\)/);
  assert.match(result.code!, /usingCtx/);
  const context: { answer?: Promise<unknown> } = {};
  new Function('globalThis', 'require', result.code!)(context, runtimeRequire);
  assert.deepEqual(await context.answer, [5, true]);
});

test('mixed module output uses a structural import, keeps fallback local, and executes', async () => {
  const result = native.nativePreflightTransform(
    'export async function read(resource) { using current = resource; return 1; }',
    'fixture.mjs',
    {
      asyncFunctions: true,
      explicitResourceManagement: true,
      helpersMode: 'runtime',
      helpersModuleName: '@babel/runtime',
      helpersVersion: '7.20.0',
    },
  );
  assert.equal(result.status, 'complete', result.reason);
  assert.match(
    result.code!,
    /import _asyncToGenerator from "@babel\/runtime\/helpers\/asyncToGenerator"/,
  );
  assert.doesNotMatch(result.code!, /@babel\/runtime\/helpers\/usingCtx/);
  assert.match(result.code!, /var babelHelpersFallback/);
  const runtimeUrl = pathToFileURL(
    runtimeRequire.resolve('@babel/runtime/helpers/asyncToGenerator'),
  ).href;
  const executable = result.code!.replace(
    '"@babel/runtime/helpers/asyncToGenerator"',
    JSON.stringify(runtimeUrl),
  );
  const fixture = await import(
    `data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`
  );
  let disposed = false;
  const resource = { [Symbol.dispose]: () => (disposed = true) };
  assert.equal(await fixture.read(resource), 1);
  assert.equal(disposed, true);
});

test('invalid runtime versions are configuration diagnostics and inline ignores versions', () => {
  const invalid = native.nativePreflightTransform('async function read() {}', 'fixture.js', {
    asyncFunctions: true,
    helpersMode: 'runtime',
    helpersVersion: '^7.20.0',
  });
  assert.equal(invalid.status, 'unsupported');
  assert.equal(invalid.reason, 'helper-runtime-version-invalid:^7.20.0');

  const inline = native.nativePreflightTransform('async function read() {}', 'fixture.js', {
    asyncFunctions: true,
    helpersMode: 'inline',
    helpersVersion: 'not-semver',
  });
  assert.equal(inline.status, 'complete', inline.reason);
  assert.doesNotMatch(inline.code!, /@babel\/runtime|require\(/);
});

test('legacy decorator registry preserves evaluation, application, descriptor, and parameter ABI', () => {
  const source = `
    var events = [];
    function classDecorator(value) { events.push('class'); return class extends value { replacement = true; }; }
    function methodDecorator(target, key, descriptor) {
      events.push('method:' + key);
      var original = descriptor.value;
      descriptor.value = function (value) { return original.call(this, value) + 1; };
      return descriptor;
    }
    function parameterDecorator(target, key, index) { events.push('parameter:' + key + ':' + index); }
    @classDecorator
    class Example {
      @methodDecorator
      read(@parameterDecorator value) { return value; }
    }
    var instance = new Example();
    globalThis.answer = [events, instance.read(2), instance.replacement];
  `;
  const result = native.nativePreflightTransform(source, 'fixture.ts', {
    typescript: 'strip',
    legacyDecorators: true,
    classes: true,
    classProperties: true,
    classPropertiesLoose: true,
    helpersMode: 'inline',
  });
  assert.equal(result.status, 'complete', result.reason);
  assert.ok(result.code);
  const context: { answer?: unknown } = {};
  new Function('globalThis', 'require', result.code)(context, runtimeRequire);
  assert.deepEqual(context.answer, [['parameter:read:0', 'method:read', 'class'], 3, true]);
});

test('async iterator result registry rejects non-object results', () => {
  const source = `
    var iterator = {
      [Symbol.asyncIterator]() { return this; },
      next() { return Promise.resolve(1); }
    };
    globalThis.read = async function () { for await (var value of iterator) return value; };
  `;
  const result = native.nativePreflightTransform(source, 'fixture.js', {
    asyncGeneratorFunctions: true,
    helpersMode: 'inline',
  });
  assert.equal(result.status, 'complete', result.reason);
  const code = result.code;
  assert.ok(code);
  const helper = code.match(/function (_iteratorResult\d*)\(/)?.[1];
  assert.ok(helper, code);
  assert.throws(
    () => new Function('globalThis', 'require', `${code};${helper}(1);`)({}, runtimeRequire),
    {
      name: 'TypeError',
      message: 'Iterator result is not an object',
    },
  );
});

test('for-of shares one standard helper across loops and reserves external helper names', () => {
  const source = `const out=[];
    for(const value of [1])out.push(value, _createForOfIteratorHelper);
    for(const value of new Set([2]))out.push(value);
    globalThis.result=out;`;
  for (const [helpersMode, helpersVersion] of [
    ['inline', '7.29.7'],
    ['runtime', '7.29.7'],
    ['runtime', '7.0.0'],
  ] as const) {
    const result = native.nativePreflightTransform(source, 'fixture.js', {
      forOf: true,
      helpersMode,
      helpersVersion,
    });
    assert.equal(result.status, 'complete', result.reason);
    assert.deepEqual(result.helpersUsed, ['createForOfIteratorHelper']);
    assert.doesNotMatch(
      result.code!,
      /_iteratorSymbol|_iteratorCall|_iteratorNext|_iteratorReturnMethod|Iterator result is not an object/,
    );
    const imports =
      result.code!.match(/require\("@babel\/runtime\/helpers\/createForOfIteratorHelper"\)/g) ?? [];
    assert.equal(imports.length, helpersMode === 'runtime' && helpersVersion === '7.29.7' ? 1 : 0);
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', '_createForOfIteratorHelper', result.code!)(
      runtimeRequire,
      context,
      'external',
    );
    assert.deepEqual(context.result, [1, 'external', 2]);
  }
});
