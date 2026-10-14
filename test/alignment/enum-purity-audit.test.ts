import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { transformSync as minify } from 'esbuild';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const modes = ['inline', 'runtime'] as const;
const cases = [
  {
    name: 'getter initializer',
    source: `const log: string[] = [];
const obj = { get value() { log.push('get'); return 3; } };
enum E { A = obj.value }
(globalThis as any).result = log;`,
    expected: ['get'],
  },
  {
    name: 'throwing getter initializer',
    source: `const log: string[] = [];
const obj = { get value(): number { log.push('get'); throw 'stop'; } };
try { enum E { A = obj.value } } catch (error) { log.push(String(error)); }
(globalThis as any).result = log;`,
    expected: ['get', 'stop'],
  },
];

function execute(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', `'use strict';\n${code}`)(context);
  return context.result;
}

function optimized(code: string, ignoreAnnotations = false): string {
  // Module-level tree shaking is essential: esbuild keeps these unused bindings
  // inside an IIFE. No script-global binding is observed by the fixtures.
  return minify(code, {
    format: 'esm',
    target: 'es2022',
    minify: true,
    treeShaking: true,
    ignoreAnnotations,
  }).code;
}

function checkTypeScript(source: string): string {
  const filename = '/nox-enum-purity-input.ts';
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    skipLibCheck: true,
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (path, version, onError, shouldCreateNewSourceFile) =>
    path === filename
      ? ts.createSourceFile(path, source, version, true)
      : getSourceFile(path, version, onError, shouldCreateNewSourceFile);
  expect(ts.getPreEmitDiagnostics(ts.createProgram([filename], options, host))).toEqual([]);
  return ts.transpileModule(source, { compilerOptions: options }).outputText;
}

function babel(source: string): string {
  return transformSync(source, {
    filename: 'input.ts',
    sourceType: 'module',
    babelrc: false,
    configFile: false,
    plugins: [require('@babel/plugin-transform-typescript')],
  })!.code!;
}

describe.each(cases)('$name', ({ source, expected }) => {
  const observed = new Map<string, unknown>();
  beforeAll(() => {
    const reference = checkTypeScript(source);
    const canonical = babel(source);
    expect(execute(reference)).toEqual(expected);
    expect(execute(optimized(reference))).toEqual(expected);
    expect(execute(canonical)).toEqual(expected);
    expect(execute(optimized(canonical))).toEqual(expected);
    for (const mode of modes) {
      const code = compile(
        source,
        { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
        'input.ts',
      );
      expect(code).not.toMatch(/\benum E\b/);
      expect(code).not.toContain('@babel/runtime/');
      expect(execute(code)).toEqual(expected);
      // This isolates annotation ownership from the enum lowering itself.
      expect(execute(optimized(code, true))).toEqual(expected);
      observed.set(mode, execute(optimized(code)));
    }
  });

  for (const mode of modes) {
    test(`${mode} preserves effects when an unused enum is tree-shaken`, () => {
      expect(observed.get(mode)).toEqual(expected);
    });
  }
});

test.each(modes)('%s preserves a directly called enum initializer during tree shaking', mode => {
  const source = `const log: string[] = [];
function value() { log.push('call'); return 3; }
enum E { A = value() }
(globalThis as any).result = log;`;
  const code = compile(
    source,
    { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
    'input.ts',
  );
  expect(code).not.toMatch(/\benum E\b/);
  expect(execute(optimized(code))).toEqual(['call']);
  expect(execute(optimized(babel(source)))).toEqual(['call']);
});

test('the downstream minifier honors pure annotations', () => {
  const source = `globalThis.result = [];
var unused = /* @__PURE__ */ (() => globalThis.result.push('effect'))();`;
  expect(execute(source)).toEqual(['effect']);
  expect(execute(optimized(source))).toEqual([]);
  expect(execute(optimized(source, true))).toEqual(['effect']);
});

for (const initializer of [
  'obj["value"]',
  'obj.value + 1',
  '(true ? obj.value : 0)',
  '(0, obj.value)',
  'obj?.value',
  '(obj.value as number)',
  'obj.value!',
  '(value += 1)',
  '(obj.value, 3)',
  '(value = 3, 1)',
  '(obj.value && 3)',
  '(obj.value ? 3 : 3)',
  '+({ valueOf() { value++; return 3; } })',
]) {
  test.each(modes)('%s retains nested enum effects: ' + initializer, mode => {
    const source = `let value = 0;
const obj = { get value() { value++; return 3; } };
enum E { A = ${initializer} }
(globalThis as any).result = value;`;
    const code = compile(
      source,
      { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
      'input.ts',
    );
    const expected = initializer === '(value = 3, 1)' ? 3 : 1;
    expect(execute(optimized(code))).toBe(expected);
    // Babel also over-annotates numeric coercion (an accepted audit boundary).
    // The conservative local rule preserves it without a custom helper.
    expect(execute(optimized(babel(source)))).toBe(initializer.startsWith('+(') ? 0 : expected);
  });
}

test.each(modes)('%s keeps constant enums safely removable', mode => {
  const source = `enum E { A, B = 2 * 3, C = B + 1, D = "text" }
(globalThis as any).result = 1;`;
  const code = compile(
    source,
    { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
    'input.ts',
  );
  expect(code).toContain('@__PURE__');
  expect(execute(optimized(code))).toBe(1);
  expect(optimized(code)).not.toContain('text');
});
