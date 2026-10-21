import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  registerParserAdapter,
  transform,
} from '../../index';

const source = 'value;';
const filename = 'input.custom';

test('adapter rejection preserves diagnostics and source without preparing plugins', () => {
  const diagnostics = [
    { code: 'unsupported-feature', message: 'adapter declined', start: 0, end: 5 },
  ];
  let prepared = 0;
  const unregister = registerParserAdapter({
    name: 'reject-with-diagnostics',
    version: '1',
    supports: () => true,
    compile: () => ({ status: 'unsupported', reason: 'feature', diagnostics }),
  });
  try {
    const plugin = defineNativePlugin({
      name: 'unreached',
      createState() {
        prepared++;
      },
      pre() {
        throw new Error('unreachable');
      },
    });
    expect(
      transform(
        source,
        filename,
        defineNativePipeline({ phases: [{ name: 'unreached', plugins: [plugin] }] }),
      ),
    ).toEqual({ status: 'bailout', reason: 'feature', source, diagnostics });
    expect(prepared).toBe(0);
  } finally {
    unregister();
  }
});

test.each([false, true])(
  'unchanged adapter bytes preserve metadata and mapped names, compose=%s',
  compose => {
    const adapterMap = {
      mappings: compose ? 'AACG' : 'AACGA',
      names: compose ? [] : ['adapterName'],
    };
    const inputMap = { mappings: ';GAKQA', names: ['originalName'] };
    const metadata = { unchanged: true };
    const unregister = registerParserAdapter({
      name: 'map-only-adapter',
      version: '1',
      supports: route => route.syntax === 'unknown',
      compile: code => ({ status: 'complete', code, syntax: 'js', map: adapterMap, metadata }),
    });
    try {
      const result = transform(source, filename, defineNativePipeline({ phases: [] }), {
        inputSourceMap: compose ? inputMap : undefined,
      });
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error('Unexpected bailout');
      expect(result.code).toBe(source);
      expect(result.metadata.sourceAdapter).toEqual(metadata);
      const position = originalPositionFor(
        new TraceMap({ version: 3, sources: ['original.js'], ...result.map }),
        { line: 1, column: 0 },
      );
      expect(position).toEqual({
        source: 'original.js',
        line: compose ? 6 : 2,
        column: compose ? 8 : 3,
        name: compose ? 'originalName' : 'adapterName',
      });
    } finally {
      unregister();
    }
  },
);
