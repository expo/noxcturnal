import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, registerParserAdapter, transform } from '../../index';

for (const outerNamed of [false, true])
  describe.each([false, true])(`outer named=${outerNamed}, inner named=%s`, innerNamed => {
    let actual: ReturnType<typeof originalPositionFor>;
    const expected = {
      source: 'original.js',
      line: 6,
      column: 8,
      name: innerNamed ? 'originalName' : outerNamed ? 'intermediateName' : null,
    };
    beforeAll(() => {
      // Outer generated 1:0 -> intermediate 2:3; inner 2:3 -> original 6:8.
      const outer = {
        version: 3 as const,
        sources: ['middle.js'],
        names: outerNamed ? ['intermediateName'] : [],
        mappings: outerNamed ? 'AACGA' : 'AACG',
      };
      const inner = {
        version: 3 as const,
        sources: ['original.js'],
        names: innerNamed ? ['originalName'] : [],
        mappings: innerNamed ? ';GAKQA' : ';GAKQ',
      };
      const unregister = registerParserAdapter({
        name: 'composed-map-names-audit',
        version: '1',
        supports: route => route.syntax === 'unknown',
        compile: code => ({ status: 'complete', code, syntax: 'js', map: outer }),
      });
      try {
        const result = transform('value;', 'input.custom', defineNativePipeline({ phases: [] }), {
          inputSourceMap: inner,
        });
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error('Unexpected bailout');
        expect(result.code).toBe('value;');
        actual = originalPositionFor(
          new TraceMap({ version: 3, sources: ['original.js'], ...result.map }),
          { line: 1, column: 0 },
        );
      } finally {
        unregister();
      }
    });
    test('composition traces names to the original named segment', () => {
      expect(actual).toEqual(expected);
    });
  });
