import { expect, test } from 'vitest';
import { stripVTControlCharacters } from 'node:util';
import { transformSync } from '@babel/core';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  NativeTransformError,
  transform,
} from '../../index';

test('compiler failures expose their diagnostic in the message and stack', () => {
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'react-compiler',
        native: {
          reactCompiler: {
            compilationMode: 'infer',
            panicThreshold: 'critical_errors',
            target: '19',
            enableResetCacheOnSourceFileChanges: true,
          },
          jsx: 'preserve',
        },
      },
    ],
  });
  const source =
    'import { useRef } from "react"; export function Component() { const ref = useRef(0); return <Text>{ref.current}</Text>; }';
  let failure: unknown;
  try {
    transform(source, 'fixture.tsx', pipeline);
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(NativeTransformError);
  if (!(failure instanceof NativeTransformError)) throw failure;
  expect(failure.message).toContain('fixture.tsx: Cannot access refs during render (1:99)');
  expect(failure.message).toContain('Native phase react-compiler failed: transform-error');
  expect(failure.message).toContain('> 1 |');
  expect(failure.stack).toContain(`NativeTransformError: ${failure.message}`);
  expect(failure).toMatchObject({
    code: 'NOXCTURNAL_TRANSFORM_ERROR',
    phase: 'react-compiler',
    reason: 'transform-error',
    diagnostics: [{ message: 'Cannot access refs during render', phase: 'react-compiler' }],
  });
});

test('message formatting collapses repeated diagnostics without losing structured details', () => {
  const cause = new Error('original');
  const diagnostics = [
    { code: 'first', message: ' Cannot access refs during render ', phase: 'react-compiler' },
    { code: 'second', message: 'Cannot access refs during render', phase: 'react-compiler' },
    { code: 'third', message: 'This value cannot be modified', phase: 'react-compiler' },
    { code: 'empty', message: '   ' },
  ];
  const failure = new NativeTransformError('Transform failed', diagnostics, ['plugin'], { cause });
  expect(failure.message).toBe(
    'Transform failed\n\nCannot access refs during render\nThis value cannot be modified',
  );
  expect(failure.diagnostics).toBe(diagnostics);
  expect(failure.owners).toEqual(['plugin']);
  expect(failure.cause).toBe(cause);
});

test('errors without additional diagnostic text preserve their original message', () => {
  expect(new NativeTransformError('Original failure', []).message).toBe('Original failure');
  expect(
    new NativeTransformError('Original failure', [
      { code: 'native-transform-error', message: 'Original failure' },
      { code: 'empty', message: '' },
    ]).message,
  ).toBe('Original failure');
});

test('compiler failures identify the source file and render the failing expression', () => {
  const source =
    'import { useRef } from "react";\nexport function Component() {\n  const ref = useRef(0);\n  return <Text>{ref.current}</Text>;\n}';
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'react-compiler',
        native: {
          reactCompiler: {
            compilationMode: 'infer',
            panicThreshold: 'critical_errors',
            target: '19',
            enableResetCacheOnSourceFileChanges: true,
          },
          jsx: 'preserve',
        },
      },
    ],
  });
  let failure: unknown;
  try {
    transform(source, '/app/Component.tsx', pipeline);
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(NativeTransformError);
  expect(failure).toMatchObject({ filename: '/app/Component.tsx', loc: { line: 4, column: 16 } });
  expect((failure as Error).message).toContain('/app/Component.tsx:');
  expect((failure as Error).message).toContain('Cannot access refs during render');
  expect((failure as Error).message).toContain('ref.current');
});

test('compiler locations trace through an earlier native printing phase', () => {
  const source =
    'import { useRef } from "react";\n\nexport function Component() { const ref = useRef(0); return <Text>{ref.current}</Text>; }';
  const pipeline = defineNativePipeline({
    phases: [
      { name: 'typescript', native: { typescript: 'strip', jsx: 'preserve' } },
      {
        name: 'react-compiler',
        native: {
          reactCompiler: {
            compilationMode: 'infer',
            panicThreshold: 'critical_errors',
            target: '19',
            enableResetCacheOnSourceFileChanges: true,
          },
          jsx: 'preserve',
        },
      },
    ],
  });
  let failure: unknown;
  try {
    transform(source, '/app/Component.tsx', pipeline);
  } catch (error) {
    failure = error;
  }
  expect(failure).toMatchObject({ filename: '/app/Component.tsx', loc: { line: 3, column: 67 } });
  expect((failure as Error).message).toContain('3 | export function Component()');
});

test('unlocated failures identify the file without fabricating a location', () => {
  const cause = new Error('Configuration failed');
  const plugin = defineNativePlugin({
    name: 'fixture',
    pre() {
      throw cause;
    },
  });
  let failure: unknown;
  try {
    transform(
      'const value = 1;',
      '/app/input.js',
      defineNativePipeline({ phases: [{ name: 'fixture', plugins: [plugin] }] }),
    );
  } catch (error) {
    failure = error;
  }
  expect(failure).toMatchObject({
    filename: '/app/input.js',
    cause,
    message: '/app/input.js: Configuration failed',
  });
  expect((failure as NativeTransformError).loc).toBeUndefined();
  expect(failure).not.toHaveProperty('codeFrame');
});

test('buildCodeFrameError points to the plugin node after an earlier edit', () => {
  const prepend = defineNativePlugin({
    name: 'prepend',
    pre(context) {
      context.editor.prepend('const first = 0;\n');
    },
  });
  const reject = defineNativePlugin({
    name: 'reject',
    visitors: [
      defineVisitor(
        'Identifier',
        {
          fields: ['name'],
        },
        path => {
          if (path.node.name === 'value') throw path.buildCodeFrameError('Invalid value');
        },
      ),
    ],
  });
  const pipeline = defineNativePipeline({
    phases: [
      { name: 'prepend', plugins: [prepend] },
      { name: 'reject', plugins: [reject] },
    ],
  });
  let failure: unknown;
  try {
    transform('const value = 1;', '/app/input.js', pipeline);
  } catch (error) {
    failure = error;
  }
  expect(failure).toMatchObject({ filename: '/app/input.js', loc: { line: 1, column: 6 } });
  expect((failure as NativeTransformError).message).toContain('/app/input.js: Invalid value (1:6)');
  expect((failure as NativeTransformError).message).not.toContain('const first');
});

test('plugin error frames align with Babel and keep a zero-based location', () => {
  const source = 'const value = 1;';
  const filename = '/app/input.js';
  let babelFailure: unknown;
  try {
    transformSync(source, {
      filename,
      configFile: false,
      babelrc: false,
      plugins: [
        () => ({
          visitor: {
            Identifier(path: any) {
              throw path.buildCodeFrameError('Invalid value');
            },
          },
        }),
      ],
    });
  } catch (error) {
    babelFailure = error;
  }
  const plugin = defineNativePlugin({
    name: 'reject',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        throw path.buildCodeFrameError('Invalid value');
      }),
    ],
  });
  let failure: unknown;
  try {
    transform(
      source,
      filename,
      defineNativePipeline({ phases: [{ name: 'reject', plugins: [plugin] }] }),
    );
  } catch (error) {
    failure = error;
  }
  expect(babelFailure).not.toHaveProperty('codeFrame');
  expect(failure).not.toHaveProperty('codeFrame');
  expect((babelFailure as Error).message).toContain(`${filename}: Invalid value`);
  expect((failure as Error).message).toContain(`${filename}: Invalid value (1:6)`);
  expect(stripVTControlCharacters((failure as NativeTransformError).message)).toContain(
    '> 1 | const value = 1;\n    |       ^',
  );
  expect(stripVTControlCharacters((babelFailure as Error).message)).toContain(
    '> 1 | const value = 1;\n    |       ^',
  );
  expect((failure as NativeTransformError).loc).toEqual({ line: 1, column: 6 });
});

test('errors in inserted code retain file attribution without an original location', () => {
  const insert = defineNativePlugin({
    name: 'insert',
    pre(context) {
      context.editor.prepend('const added = 0;\n');
    },
  });
  const reject = defineNativePlugin({
    name: 'reject',
    visitors: [
      defineVisitor('Identifier', { fields: ['name'] }, path => {
        if (path.node.name === 'added') throw path.buildCodeFrameError('Inserted value');
      }),
    ],
  });
  let failure: unknown;
  try {
    transform(
      'const existing = 1;',
      '/app/input.js',
      defineNativePipeline({
        phases: [
          { name: 'insert', plugins: [insert] },
          { name: 'reject', plugins: [reject] },
        ],
      }),
    );
  } catch (error) {
    failure = error;
  }
  expect(failure).toMatchObject({ filename: '/app/input.js' });
  expect((failure as NativeTransformError).loc).toBeUndefined();
  expect(failure).not.toHaveProperty('codeFrame');
});

test('plugin locations trace through Flow erasure to the original annotations', () => {
  const source = '// @flow\nconst ignored: number = 1; const value: number = 2;';
  const reject = defineNativePlugin({
    name: 'reject',
    visitors: [
      defineVisitor('Identifier', { fields: ['name'] }, path => {
        if (path.node.name === 'value') throw path.buildCodeFrameError('Invalid value');
      }),
    ],
  });
  let failure: unknown;
  try {
    transform(
      source,
      '/app/input.js',
      defineNativePipeline({ phases: [{ name: 'reject', plugins: [reject] }] }),
    );
  } catch (error) {
    failure = error;
  }
  expect(failure).toMatchObject({
    filename: '/app/input.js',
    loc: { line: 2, column: source.split('\n')[1].indexOf('value') },
  });
  expect((failure as NativeTransformError).message).toContain('value: number');
});

test.each([
  { name: 'earlier edits', source: 'const outer = 1;', prepend: true },
  { name: 'Flow erasure', source: '// @flow\nconst outer: number = 1;', prepend: false },
])('preserves an attributed inner error through $name', ({ source, prepend }) => {
  const innerReject = defineNativePlugin({
    name: 'inner-reject',
    visitors: [
      defineVisitor('Identifier', {}, path => {
        throw path.buildCodeFrameError('Inner failure');
      }),
    ],
  });
  let failure: unknown;
  try {
    transform(
      '\nconst inner = 1;',
      '/inner.js',
      defineNativePipeline({
        phases: [{ name: 'inner', plugins: [innerReject] }],
      }),
    );
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(NativeTransformError);
  const inner = failure as NativeTransformError;
  const original = {
    filename: inner.filename,
    loc: inner.loc,
    message: inner.message,
    stack: inner.stack,
  };
  const insert = defineNativePlugin({
    name: 'insert',
    pre(context) {
      context.editor.prepend('const added = 0;\n');
    },
  });
  const rethrow = defineNativePlugin({
    name: 'rethrow',
    pre() {
      throw inner;
    },
  });
  let caught: unknown;
  try {
    transform(
      source,
      '/outer.js',
      defineNativePipeline({
        phases: [
          ...(prepend ? [{ name: 'insert', plugins: [insert] }] : []),
          { name: 'rethrow', plugins: [rethrow] },
        ],
      }),
    );
  } catch (error) {
    caught = error;
  }
  expect(caught).toBe(inner);
  expect(caught).toMatchObject(original);
});

test('compiler locations trace internal TypeScript printing in a single native phase', () => {
  const source =
    'import { useRef } from "react";\n\nexport function Component(): any { const ref = useRef(0); return <Text>{ref.current}</Text>; }';
  let failure: unknown;
  try {
    transform(
      source,
      '/app/Component.tsx',
      defineNativePipeline({
        phases: [
          {
            name: 'compiler',
            native: {
              transforms: { classes: true },
              jsx: 'preserve',
              reactCompiler: {
                compilationMode: 'infer',
                panicThreshold: 'critical_errors',
                target: '19',
                enableResetCacheOnSourceFileChanges: true,
              },
            },
          },
        ],
      }),
    );
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(NativeTransformError);
  expect(failure).toMatchObject({
    filename: '/app/Component.tsx',
    loc: { line: 3, column: source.split('\n')[2].indexOf('ref.current') },
  });
  expect((failure as Error).message).toContain('3 | export function Component(): any');
});
