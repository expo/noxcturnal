import { expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  registerParserAdapter,
  transform,
} from '../../index';

test.each([
  { filename: 'src/Component.custom', parser: 'tsx' as const, source: 'const value = 1;' },
  { filename: '/app/Component.custom', parser: 'jsx' as const, source: 'const value = 1;' },
  {
    filename: '../shared/Component.js',
    parser: undefined,
    source: '// @flow\nconst value: number = 1;',
  },
])('plugins observe the original filename: $filename', ({ filename, parser, source }) => {
  const observed: [string, string][] = [];
  const plugin = defineNativePlugin({
    name: 'observe-filename',
    createState(context) {
      observed.push(['createState', context.filename]);
    },
    pre(context) {
      observed.push(['pre', context.filename]);
    },
    analyze(context) {
      observed.push(['analyze', context.filename]);
    },
    apply(context) {
      observed.push(['apply', context.filename]);
    },
    visitors: [
      defineVisitor('Identifier', {}, path => {
        observed.push(['visitor', path.context.filename]);
      }),
    ],
    post(context) {
      observed.push(['post', context.filename]);
    },
  });
  const result = transform(
    source,
    filename,
    defineNativePipeline({
      phases: [{ name: 'observe', plugins: [plugin] }],
    }),
    { parser },
  );
  expect(result.status).toBe('complete');
  expect(observed).toEqual(
    ['createState', 'pre', 'analyze', 'apply', 'visitor', 'post'].map(hook => [hook, filename]),
  );
});

test('parser adapters do not replace the public plugin filename', () => {
  const filename = 'src/input.custom';
  const observed: string[] = [];
  const unregister = registerParserAdapter({
    name: 'plugin-filename',
    version: '1',
    supports: () => true,
    compile(source, adapterFilename) {
      observed.push(adapterFilename);
      return {
        status: 'complete',
        code: source,
        syntax: 'jsx',
        map: { mappings: 'AAAA', names: [] },
      };
    },
  });
  try {
    const plugin = defineNativePlugin({
      name: 'adapter-filename',
      pre(context) {
        observed.push(context.filename);
      },
      visitors: [
        defineVisitor('Identifier', {}, path => {
          observed.push(path.context.filename);
        }),
      ],
    });
    const result = transform(
      'value;',
      filename,
      defineNativePipeline({
        phases: [{ name: 'observe', plugins: [plugin] }],
      }),
      { parserAdapter: 'plugin-filename' },
    );
    expect(result.status).toBe('complete');
    expect(observed).toEqual([filename, filename, filename]);
  } finally {
    unregister();
  }
});
