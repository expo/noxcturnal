import { beforeAll, describe, expect, test } from 'vitest';
import { transformSync } from '@babel/core';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
  TransformSyntaxError,
  type NativePipelineDefinition,
} from '../../index';

const cases = [
  { name: 'duplicate lexical binding', source: 'let x; let x;', invalid: true, native: 'bailout' },
  {
    name: 'duplicate strict parameter',
    source: 'function f(a,a){"use strict";}',
    invalid: true,
    native: 'bailout',
  },
  { name: 'break without loop', source: 'break;', invalid: true, native: 'complete' },
  {
    name: 'const assignment is a runtime error',
    source: 'const x=1; x=2;',
    invalid: false,
    native: 'complete',
  },
] as const;

for (const mode of ['native', 'visitor', 'scope', 'optimize'] as const) {
  describe.each(cases)(`${mode}: $name`, entry => {
    let outcome: string;
    beforeAll(() => {
      const parseNative = () => new Function(entry.source);
      const parseBabel = () => transformSync(entry.source, { configFile: false, babelrc: false });
      if (entry.invalid) {
        expect(parseNative).toThrow(SyntaxError);
        expect(parseBabel).toThrow(SyntaxError);
      } else {
        expect(parseNative).not.toThrow();
        expect(parseBabel).not.toThrow();
      }
      let visits = 0;
      const plugin = defineNativePlugin({
        name: 'observer',
        visitors: [
          defineVisitor('Program', { scope: mode === 'scope' }, () => {
            visits++;
          }),
        ],
      });
      const phase: NativePipelineDefinition['phases'][number] =
        mode === 'native'
          ? { name: mode, native: { transforms: { parameters: true } } }
          : mode === 'optimize'
            ? { name: mode, native: { optimize: { constantFolding: true } } }
            : { name: mode, plugins: [plugin] };
      const expected =
        entry.invalid && mode === 'scope' ? 'throw' : mode === 'native' ? entry.native : 'complete';
      try {
        const result = transform(
          entry.source,
          'input.js',
          defineNativePipeline({ phases: [phase] }),
        );
        outcome = result.status;
        if (result.status === 'bailout') {
          expect(result.reason).toBe('native:semantic-error');
          expect(result.source).toBe(entry.source);
          expect(result.diagnostics.length).toBeGreaterThan(0);
          expect(result.diagnostics.every(diagnostic => diagnostic.code === 'unsupported')).toBe(
            true,
          );
        } else if (entry.invalid) {
          expect(() => new Function(result.code)).toThrow(SyntaxError);
        }
      } catch (error) {
        expect(error).toBeInstanceOf(TransformSyntaxError);
        outcome = 'throw';
      }
      expect(outcome).toBe(expected);
      expect(visits).toBe(mode === 'visitor' || (mode === 'scope' && !entry.invalid) ? 1 : 0);
    });
    (entry.invalid && mode !== 'scope' ? test.fails : test)(
      'separates invalid input from valid syntax',
      () => {
        expect(outcome).toBe(entry.invalid ? 'throw' : 'complete');
      },
    );
  });
}
