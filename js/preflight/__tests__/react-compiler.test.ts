import assert from 'node:assert/strict';

import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { test } from 'vitest';

import type { PreflightReactCompiler } from '../../index';
import {
  defineNativePipeline,
  defineNativePlugin,
  registerParserAdapter,
  transform,
} from '../../index';

const compiler = (overrides: Partial<PreflightReactCompiler> = {}): PreflightReactCompiler => ({
  compilationMode: 'infer',
  panicThreshold: 'none',
  target: '19',
  enableResetCacheOnSourceFileChanges: true,
  ...overrides,
});

const pipeline = (
  reactCompiler: PreflightReactCompiler,
  language: { typescript?: 'strip'; jsx?: 'preserve' | 'automatic' } = {
    jsx: 'preserve',
  },
) =>
  defineNativePipeline({
    phases: [
      {
        name: 'react-compiler',
        native: {
          reactCompiler,
          ...language,
          comments: true,
          compact: false,
        },
      },
    ],
  });

test.each([
  ['17', 'react-compiler-runtime'],
  ['18', 'react-compiler-runtime'],
  ['19', 'react/compiler-runtime'],
] as const)('compiles a component for React %s with the matching runtime', (target, runtime) => {
  const source =
    'function Component(props) {\n  return <View onPress={() => props.onPress()}>{props.text}</View>;\n}';
  const result = transform(source, 'fixture.jsx', pipeline(compiler({ target })));

  assert.equal(result.status, 'complete');
  assert.match(result.code, new RegExp(runtime.replace('/', '\\/')));
  assert.match(result.code, /_c\(/);
  assert.match(result.code, /<View/);
});

test('runs before TypeScript erasure and JSX lowering in the fused native phase', () => {
  const source = `type Props = { text: string };
function Component(props: Props) {
  return <View>{props.text}</View>;
}`;
  const result = transform(
    source,
    'fixture.tsx',
    pipeline(compiler(), { typescript: 'strip', jsx: 'automatic' }),
  );

  assert.equal(result.status, 'complete');
  assert.match(result.code, /react\/compiler-runtime/);
  assert.match(result.code, /react\/jsx-runtime/);
  assert.doesNotMatch(result.code, /type Props|props:\s*Props|<View/);

  const trace = new TraceMap({
    version: 3,
    sources: ['fixture.tsx'],
    names: result.map.names,
    mappings: result.map.mappings,
  });
  assert.equal(originalPositionFor(trace, { line: 3, column: 0 }).source, 'fixture.tsx');
});

test('exposes compiler runtime imports to following dependency phases', () => {
  const dependencies = defineNativePlugin({
    name: 'compiler-runtime-dependencies',
    contract: {
      metadata: { writes: ['dependencies'] },
      queries: [{ calls: [{ callee: 'require', staticArguments: true }] }],
    },
    pre(context) {
      context.metadata.set(
        'dependencies',
        context
          .query({ calls: [{ callee: 'require', staticArguments: true }] })
          .calls.require?.map(call => call.staticArgument) ?? [],
      );
    },
  });
  const result = transform(
    'function Component(props) { return <View>{props.text}</View>; }',
    'fixture.jsx',
    defineNativePipeline({
      phases: [
        {
          name: 'react-compiler',
          native: { reactCompiler: compiler(), jsx: 'preserve' },
        },
        { name: 'dependencies', plugins: [dependencies] },
      ],
    }),
  );

  assert.equal(result.status, 'complete');
  assert.deepEqual(result.metadata.dependencies, ['react/compiler-runtime']);
});

test.each(['use no memo', 'use no forget', 'use widget'])(
  'preserves the %s opt-out boundary',
  directive => {
    const result = transform(
      `function Component(props) { "${directive}"; return <View>{props.text}</View>; }`,
      'fixture.jsx',
      pipeline(
        compiler({
          customOptOutDirectives: ['use widget'],
        }),
      ),
    );

    assert.equal(result.status, 'complete');
    assert.doesNotMatch(result.code, /compiler-runtime|_c\(/);
    assert.match(result.code, /function Component/);
  },
);

test('validates the version-coupled compiler conformance options', () => {
  assert.throws(
    () =>
      pipeline(
        compiler({
          target: '20' as '19',
        }),
      ),
    /invalid React Compiler target/,
  );
  assert.throws(
    () =>
      pipeline(
        compiler({
          customOptOutDirectives: [''],
        }),
      ),
    /invalid React Compiler customOptOutDirectives/,
  );
});

test('refuses to compile parser-adapted source after its original syntax was stripped', () => {
  registerParserAdapter({
    name: 'react-compiler-original-source-test',
    version: '1',
    supports: classification => classification.syntax === 'flow',
    compile: () => ({
      status: 'complete',
      code: 'function Component(props) { return <View>{props.text}</View>; }',
      map: { mappings: '', names: [] },
      syntax: 'jsx',
    }),
  });
  const source =
    '/** @flow */ function Component(props: { text: string }) { return <View>{props.text}</View>; }';
  const result = transform(source, 'fixture.js', pipeline(compiler()), {
    parserAdapter: 'react-compiler-original-source-test',
  });

  assert.equal(result.status, 'bailout');
  assert.equal(result.reason, 'react-compiler-original-source-required');
  assert.equal(result.source, source);
});
