import assert from 'node:assert/strict';

import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { test } from 'vitest';

import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  pipelineCacheKey,
  transform,
} from '../../dist/index.js';

test('freezes native options and includes them in the pipeline cache key', () => {
  const options = {
    typescript: 'strip' as const,
    transforms: { classStaticBlock: true as const },
    helpers: { mode: 'runtime' as const, moduleName: '@babel/runtime', version: '7.0.0' },
  };
  const pipeline = defineNativePipeline({
    phases: [{ name: 'preflight', native: options }],
  });
  options.helpers.moduleName = 'mutated-after-definition';

  assert.ok(Object.isFrozen(pipeline.phases[0].native));
  assert.ok(Object.isFrozen(pipeline.phases[0].native?.helpers));
  assert.ok(Object.isFrozen(pipeline.phases[0].native?.transforms));
  assert.equal(pipeline.phases[0].native?.helpers?.moduleName, '@babel/runtime');
  assert.notEqual(
    pipelineCacheKey(pipeline, 'fixture.ts'),
    pipelineCacheKey(
      defineNativePipeline({
        phases: [
          {
            name: 'preflight',
            native: {
              typescript: 'strip',
              helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.1.0' },
            },
          },
        ],
      }),
      'fixture.ts',
    ),
  );
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [{ name: 'invalid', native: {}, plugins: [] }],
      }),
    /cannot contain visitor plugins/,
  );
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [
          {
            name: 'invalid-transform',
            native: { transforms: { classStaticBlock: false as never } },
          },
        ],
      }),
    /must be true or absent/,
  );
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [
          {
            name: 'unknown-transform',
            native: { transforms: { targetPreset: true } as never },
          },
        ],
      }),
    /unknown native transform targetPreset/,
  );
});

test('runs a fused native TypeScript phase and reports its own timing', () => {
  const result = transform(
    'const value: number = 1;',
    'fixture.ts',
    defineNativePipeline({
      phases: [{ name: 'preflight', native: { typescript: 'strip' } }],
    }),
    { debugPerformance: true },
  );

  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 1;\n');
  assert.notEqual(result.map.mappings, '');
  const performance = result.metadata.performance as {
    nativeTransformMs: number;
    nativeParses: number;
    phaseExecutions: { name: string; nativeTransformMs: number }[];
  };
  assert.equal(performance.nativeParses, 1);
  assert.ok(performance.nativeTransformMs > 0);
  assert.equal(performance.phaseExecutions[0].name, 'preflight');
  assert.ok(performance.phaseExecutions[0].nativeTransformMs > 0);
});

test('runs React Fast Refresh instrumentation in the native JSX transform', () => {
  const result = transform(
    [
      "import { useState } from 'react';",
      'export default function App() {',
      '  const [count, setCount] = useState(0);',
      '  return <button onClick={() => setCount(count + 1)}>{count}</button>;',
      '}',
    ].join('\n'),
    'App.tsx',
    defineNativePipeline({
      phases: [
        {
          name: 'development-react',
          native: {
            typescript: 'strip',
            jsx: 'automatic',
            jsxImportSource: 'react',
            reactRefresh: {},
          },
        },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.match(result.code, /\$RefreshReg\$/);
  assert.match(result.code, /\$RefreshSig\$/);
  assert.match(result.code, /App/);
  assert.doesNotMatch(result.code, /<button/);
});

test('validates React Fast Refresh options', () => {
  assert.throws(
    () =>
      defineNativePipeline({
        phases: [
          {
            name: 'refresh',
            native: { reactRefresh: { refreshReg: '' } },
          },
        ],
      }),
    /invalid React Refresh refreshReg/,
  );
});

test('runs Metro-compatible constant folding and DCE as one native postflight', () => {
  const result = transform(
    [
      'function leaf() { return 1 + 2 * 3; }',
      'function dead() { return leaf(); }',
      'const unusedArrow = () => 42;',
      'const liveArrow = () => (false ? 1 : 2);',
      'if (0) { sideEffect(); } else { module.exports = liveArrow(); }',
    ].join('\n'),
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'metro-optimization',
          native: {
            optimize: { constantFolding: true, deadCodeElimination: true },
          },
        },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.doesNotMatch(result.code, /function (?:leaf|dead)/);
  assert.doesNotMatch(result.code, /unusedArrow/);
  assert.match(result.code, /const liveArrow = \(\) => 2;/);
  assert.match(result.code, /module\.exports = liveArrow\(\);/);
  assert.doesNotMatch(result.code, /sideEffect/);
});

test('keeps a native legacy no-op byte-identical with an identity map', () => {
  const source = '  var value= require("dep");\nmodule.exports=value;';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [
        {
          name: 'legacy-language',
          native: {
            transforms: {
              blockScoping: true,
              parameters: true,
              destructuring: { useBuiltIns: true },
              classes: true,
              classProperties: { loose: true },
              classStaticBlock: true,
              asyncFunctions: true,
            },
            comments: false,
          },
        },
      ],
    }),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.code, source);
  assert.ok(result.map.mappings.length > 0);
});

test('keeps Metro postflight operations independently selectable', () => {
  const source = 'function dead() { return 1 + 2; } module.exports = 0;';
  const foldOnly = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'fold', native: { optimize: { constantFolding: true } } }],
    }),
  );
  const dceOnly = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'dce', native: { optimize: { deadCodeElimination: true } } }],
    }),
  );

  assert.equal(foldOnly.status, 'complete');
  assert.match(foldOnly.code, /function dead\(\)/);
  assert.match(foldOnly.code, /return 3;/);
  assert.equal(dceOnly.status, 'complete');
  assert.doesNotMatch(dceOnly.code, /function dead/);
});

test('composes a native decoded layer with a following visitor layer', () => {
  const replace = defineNativePlugin({
    name: 'replace',
    visitors: [
      defineVisitor('NumericLiteral', {}, path =>
        path.replaceWith({ code: '200', mapping: 'anchor-start' }),
      ),
    ],
  });
  const result = transform(
    'const value: number = 1;',
    'fixture.ts',
    defineNativePipeline({
      phases: [
        { name: 'preflight', native: { typescript: 'strip' } },
        { name: 'visitor', plugins: [replace] },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.equal(result.code, 'const value = 200;\n');
  const map = new TraceMap({
    version: 3,
    sources: ['fixture.ts'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.deepEqual(originalPositionFor(map, { line: 1, column: 14 }), {
    source: 'fixture.ts',
    line: 1,
    column: 22,
    name: null,
  });
});

test('lowers block scoping through the native preflight capability', () => {
  const source = 'const pristine = true;';
  const result = transform(
    source,
    'fixture.js',
    defineNativePipeline({
      phases: [{ name: 'preflight', native: { transforms: { blockScoping: true } } }],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.match(result.code, /var pristine = true/);

  const map = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  const generatedColumn = result.code.indexOf('pristine');
  assert.deepEqual(originalPositionFor(map, { line: 1, column: generatedColumn }), {
    source: 'fixture.js',
    line: 1,
    column: source.indexOf('pristine'),
    name: null,
  });
});
