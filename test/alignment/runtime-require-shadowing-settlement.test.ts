import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'script lexical loader binding',
    declaration: 'let require = () => { throw new Error("intercepted"); };',
    expected: 'ReferenceError',
  },
  {
    name: 'hoisted loader function',
    declaration: 'function require() { throw new Error("intercepted"); }',
    expected: 'intercepted',
  },
];
function observe(code: string): unknown {
  try {
    const context = { require, result: undefined };
    runInNewContext(code, context);
    return context.result;
  } catch (error) {
    const caught = error as Error;
    return caught.name === 'ReferenceError' ? caught.name : caught.message;
  }
}

function observeCommonJs(code: string): unknown {
  const context: Record<string, unknown> = {};
  try {
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  } catch (error) {
    return (error as Error).message;
  }
}

for (const version of ['7.0.0', '7.29.7'])
  for (const entry of cases)
    test(`${entry.name}, declared ${version}`, () => {
      const source = `${entry.declaration}\nasync function read() { return 3; } globalThis.result = typeof read;`;
      expect(observe(source)).toBe('function');
      if (entry.name === 'hoisted loader function')
        expect(observeCommonJs(source)).toBe('function');
      const reference = transformSync(source, {
        sourceType: 'script',
        configFile: false,
        babelrc: false,
        plugins: [
          require('@babel/plugin-transform-async-to-generator'),
          [require('@babel/plugin-transform-runtime'), { version, useESModules: false }],
        ],
      })!.code!;
      const code = compile(source, {
        transforms: { asyncFunctions: true },
        helpers: { mode: 'runtime', version },
      });
      for (const output of [reference, code]) {
        expect(output).not.toMatch(/async\s+function/);
        expect(output).toContain('@babel/runtime/helpers/');
        expect(observe(output)).toBe(entry.expected);
        if (entry.name === 'hoisted loader function')
          expect(observeCommonJs(output)).toBe(entry.expected);
      }
      const inline = compile(source, {
        transforms: { asyncFunctions: true },
        helpers: { mode: 'inline' },
      });
      expect(inline).not.toContain('@babel/runtime/helpers/');
      expect(observe(inline)).toBe('function');
    });
