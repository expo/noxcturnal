import { runInNewContext } from 'node:vm';
import { expect, test, vi } from 'vitest';
import {
  defineNativePipeline,
  registerParserAdapter,
  transform,
  TransformSyntaxError,
} from '../../index';
import { native } from '../../native/binding';

const pipeline = defineNativePipeline({
  phases: [{ name: 'native', native: { jsx: 'preserve' } }],
});

const parserGaps = [
  'import source wasm from "./a.wasm";',
  'import defer * as ns from "./a.js";',
  'export * from "x" with { type: "json" };',
  '@dec export class C {}',
  'import type, { imp } from "bar";',
];

test.each(parserGaps)(
  'preserves the Hermes parser boundary without an Oxc recovery pass: %s',
  body => {
    const source = `// @flow\n${body}`;
    const erased = native.nativeFlowErase(source, 'input.js');
    expect(erased.reason).toBe('parse-failed');
    expect(erased.detail).toBeTruthy();
    const validate = vi.spyOn(native, 'validateProgram');
    try {
      expect(transform(source, 'input.js', pipeline)).toMatchObject({
        status: 'bailout',
        reason: 'flow-requires-parser-adapter',
        source,
        diagnostics: [{ code: erased.reason, message: erased.detail, phase: 'flow-erasure' }],
      });
      expect(validate).not.toHaveBeenCalled();
    } finally {
      validate.mockRestore();
    }
  },
);

test('preserves ambiguous Flow syntax when Hermes cannot parse the whole file', () => {
  const source = '// @flow\nexport * from "x" with {type:"json"}; globalThis.result = f<T>(x);';
  expect(transform(source, 'input.js', pipeline)).toMatchObject({
    status: 'bailout',
    reason: 'flow-requires-parser-adapter',
    source,
  });
  const compile = vi.fn(() => ({
    status: 'complete' as const,
    code: 'globalThis.result = f(x);',
    syntax: 'js' as const,
    map: { mappings: '', names: [] },
  }));
  const unregister = registerParserAdapter({
    name: 'flow-gap',
    version: '1',
    supports: route => route.syntax === 'flow',
    compile,
  });
  try {
    const result = transform(source, 'input.js', pipeline);
    expect(compile).toHaveBeenCalledWith(source, 'input.js', {});
    expect(result.status).toBe('complete');
    expect(result.diagnostics).toEqual([]);
    if (result.status !== 'complete') return;
    const context = { f: () => 42, T: 0, x: 0, result: undefined };
    runInNewContext(result.code, context);
    expect(context.result).toBe(42);
  } finally {
    unregister();
  }
});

test('retains native and adapter diagnostics when automatic fallback also declines', () => {
  const source = '// @flow\nexport * from "x" with {type:"json"};';
  const erased = native.nativeFlowErase(source, 'input.js');
  const diagnostics = [{ code: 'adapter-boundary', message: 'Adapter cannot compile this file.' }];
  const unregister = registerParserAdapter({
    name: 'flow-declined',
    version: '1',
    supports: route => route.syntax === 'flow',
    compile: () => ({ status: 'unsupported', reason: 'adapter-declined', diagnostics }),
  });
  try {
    expect(transform(source, 'input.js', pipeline)).toEqual({
      status: 'bailout',
      reason: 'adapter-declined',
      source,
      diagnostics: [
        { code: erased.reason, message: erased.detail, phase: 'flow-erasure' },
        ...diagnostics,
      ],
    });
    expect(diagnostics).toEqual([
      { code: 'adapter-boundary', message: 'Adapter cannot compile this file.' },
    ]);
  } finally {
    unregister();
  }
});

test('an explicit Flow adapter bypasses native erasure and its diagnostics', () => {
  const erasure = vi.spyOn(native, 'nativeFlowErase');
  const unregister = registerParserAdapter({
    name: 'explicit-flow',
    version: '1',
    supports: () => false,
    compile: () => ({
      status: 'complete',
      code: 'const value = 1;',
      syntax: 'js',
      map: { mappings: '', names: [] },
    }),
  });
  try {
    const result = transform('// @flow\nconst value: number = 1;', 'input.js', pipeline, {
      parserAdapter: 'explicit-flow',
    });
    expect(result.status).toBe('complete');
    expect(result.diagnostics).toEqual([]);
    expect(erasure).not.toHaveBeenCalled();
  } finally {
    unregister();
    erasure.mockRestore();
  }
});

test('fatal native erasure failures propagate instead of becoming fallback diagnostics', () => {
  const error = new Error('internal Flow erasure failure');
  const erasure = vi.spyOn(native, 'nativeFlowErase').mockImplementation(() => {
    throw error;
  });
  try {
    expect(() => transform('// @flow\nconst value: number = 1;', 'input.js', pipeline)).toThrow(
      error,
    );
  } finally {
    erasure.mockRestore();
  }
});

test('still offers unsupported explicit Flow annotations to an automatic adapter', () => {
  const source = '// @flow\nexport * from "x" with {type:"json"}; const value: number = 1;';
  const compile = vi.fn(() => ({
    status: 'complete' as const,
    code: 'const value = 1;',
    syntax: 'js' as const,
    map: { mappings: '', names: [] },
  }));
  const unregister = registerParserAdapter({
    name: 'flow-gap',
    version: '1',
    supports: route => route.syntax === 'flow',
    compile,
  });
  try {
    expect(transform(source, 'input.js', pipeline).status).toBe('complete');
    expect(compile).toHaveBeenCalledWith(source, 'input.js', {});
  } finally {
    unregister();
  }
});

test('Oxc syntax errors after successful erasure remain fatal', () => {
  expect(() => transform('// @flow\nfor (using value in values) {}', 'input.js', pipeline)).toThrow(
    TransformSyntaxError,
  );
});

test.each(['\n', '\r', '\r\n', '\u2028', '\u2029'])(
  'preserves the original source on Hermes parse failure after %j',
  newline => {
    const source = `// @flow${newline}const café = "🦉"; const value = ;`;
    expect(transform(source, 'input.js', pipeline)).toMatchObject({
      status: 'bailout',
      reason: 'flow-requires-parser-adapter',
      source,
    });
    expect(native.nativeFlowErase(source, 'input.js')).toMatchObject({
      status: 'bailed',
      reason: 'parse-failed',
    });
  },
);

test.each([
  'component C(ref: R, ref: R) { return null; }',
  'component C(ref as first: R, ref as second: R) { return null; }',
])('rejects duplicate component refs instead of reporting a coverage gap: %s', body => {
  const compile = vi.fn(() => ({ status: 'unsupported' as const, reason: 'must not run' }));
  const unregister = registerParserAdapter({
    name: 'duplicate-ref',
    version: '1',
    supports: route => route.syntax === 'flow',
    compile,
  });
  try {
    expect(() => transform(`// @flow\n${body}`, 'input.js', pipeline)).toThrow(
      "cannot have more than one 'ref' parameter",
    );
    expect(compile).not.toHaveBeenCalled();
  } finally {
    unregister();
  }
});
