import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { test } from 'vitest';

import { native } from '../../native/binding';

const runtimeRequire = createRequire(import.meta.url);

test('structural helper dependencies are identical in inline and runtime modes', () => {
  for (const [source, filename, transforms] of [
    ['const value = { ...input };', 'fixture.js', { objectRestSpread: true }],
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
