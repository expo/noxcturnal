import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import { beforeAll, expect, test } from 'vitest';
import { defineNativePipeline, NativeTransformError, transform } from '../../index';

const require = createRequire(import.meta.url);
const source = `namespace N {
  export let value = 1;
  export function read() { return value; }
}
N.value = 4;
N.read();`;
const pipeline = defineNativePipeline({
  phases: [{ name: 'typescript', native: { typescript: 'strip' } }],
});
let outcome: ReturnType<typeof transform> | undefined;
let failure: unknown;

beforeAll(() => {
  try {
    outcome = transform(source, 'input.ts', pipeline);
  } catch (error) {
    failure = error;
  }
  if (failure !== undefined) {
    // An unrelated compilation failure must not satisfy the expected failure.
    expect(failure).toBeInstanceOf(NativeTransformError);
    expect((failure as NativeTransformError).code).toBe('NOXCTURNAL_TRANSFORM_ERROR');
    expect((failure as Error).message).toBe('Native phase typescript failed: transform-error');
    expect(
      (failure as NativeTransformError).diagnostics.some(diagnostic =>
        diagnostic.message.includes('Namespaces exporting non-const are not supported by Oxc'),
      ),
    ).toBe(true);
  }
});

test('mutable namespace input passes TypeScript semantic checking', () => {
  const filename = '/nox-namespace-outcome-input.ts';
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
  const program = ts.createProgram([filename], options, host);
  expect(ts.getPreEmitDiagnostics(program)).toEqual([]);
});

test('Babel identifies the same partial namespace support boundary', () => {
  expect(() =>
    transformSync(source, {
      filename: 'input.ts',
      configFile: false,
      babelrc: false,
      plugins: [[require('@babel/plugin-transform-typescript'), { allowNamespaces: true }]],
    }),
  ).toThrow('Namespaces exporting non-const are not supported by Babel');
});

test.fails('unsupported mutable namespace returns a pristine bailout', () => {
  expect(failure).toBeUndefined();
  expect(outcome).toMatchObject({ status: 'bailout', source });
});

test('supported const namespace completes and executes', () => {
  const result = transform(
    'namespace N { export const value = 3; } globalThis.result = N.value;',
    'input.ts',
    pipeline,
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).not.toMatch(/\bnamespace\b/);
  const context: Record<string, unknown> = {};
  new Function('globalThis', result.code)(context);
  expect(context.result).toBe(3);
});

test.each([
  {
    name: 'destructured const namespace export',
    input: 'namespace N { export const { value } = { value: 3 }; } globalThis.result = N.value;',
  },
  {
    name: 'ambient mutable namespace declaration',
    input: 'declare namespace N { export let value: number; } globalThis.result = 3;',
  },
])('$name completes without a compatibility bailout', ({ input }) => {
  const result = transform(input, 'input.ts', pipeline);
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).not.toMatch(/\bnamespace\b/);
  const context: Record<string, unknown> = {};
  new Function('globalThis', result.code)(context);
  expect(context.result).toBe(3);
});
