import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { transformSync as transport } from 'esbuild';
import { beforeAll, describe, expect, test } from 'vitest';
import { NativeTransformError } from '../../js';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
const cases = [
  {
    name: 'noncritical unsupported syntax',
    source: `export function App({value}) {class Box {} return <div>{value}</div>}`,
    diagnostic: /Inline.*class.*declarations are not supported/i,
    critical: false,
  },
  {
    name: 'noncritical local class instance',
    source: `export function App({value}) {class Box {read(){return value}} return <div>{new Box().read()}</div>}`,
    diagnostic: /Inline.*class.*declarations are not supported/i,
    nativeDiagnostic:
      /Invariant.*InferMutationAliasingEffects.*Expected value kind to be initialized/i,
    critical: false,
  },
  {
    name: 'critical ref mutation',
    source: `import {useRef} from 'react'; export function App({value}) {const ref=useRef(value);ref.current=value;return <div>{value}</div>}`,
    diagnostic: /ref.*during render/i,
    critical: true,
  },
];

// These rejected functions stay uncompiled. A minimal element/ref implementation
// observes their preserved JS behavior; actual memo-runtime tests live separately.
function observe(code: string) {
  const module = { exports: {} as { App?: (props: { value: number }) => unknown } };
  const react = {
    createElement: (type: string, props: unknown, value: unknown) => ({ type, props, value }),
    useRef: (current: unknown) => ({ current }),
  };
  new Function(
    'module',
    'exports',
    'require',
    'React',
    transport(code, { loader: 'jsx', format: 'cjs' }).code,
  )(
    module,
    module.exports,
    (name: string) => {
      expect(name).toBe('react');
      return react;
    },
    react,
  );
  return module.exports.App!({ value: 7 });
}

for (const entry of cases) {
  for (const jsx of ['preserve', 'classic'] as const) {
    for (const panicThreshold of ['none', 'critical_errors', 'all_errors'] as const) {
      describe(`${entry.name}, JSX=${jsx}, threshold=${panicThreshold}`, () => {
        const shouldThrow =
          panicThreshold === 'all_errors' ||
          (entry.critical && panicThreshold === 'critical_errors');
        const defect = !entry.critical && panicThreshold === 'critical_errors';
        let actual: unknown;
        beforeAll(() => {
          const reference = () =>
            transformSync(entry.source, {
              filename: 'input.jsx',
              configFile: false,
              babelrc: false,
              parserOpts: { plugins: ['jsx'] },
              plugins: [
                [
                  referenceRequire('babel-plugin-react-compiler'),
                  {
                    compilationMode: 'infer',
                    panicThreshold,
                    target: '19',
                    environment: { enableResetCacheOnSourceFileChanges: false },
                  },
                ],
                ...(jsx === 'classic'
                  ? [referenceRequire('@babel/plugin-transform-react-jsx')]
                  : []),
              ],
            })!.code!;
          if (shouldThrow) expect(reference).toThrow(entry.diagnostic);
          else {
            const code = reference();
            expect(code).not.toContain('compiler-runtime');
            expect(observe(code)).toEqual({ type: 'div', props: null, value: 7 });
          }
          try {
            const code = compile(
              entry.source,
              {
                reactCompiler: {
                  compilationMode: 'infer',
                  panicThreshold,
                  target: '19',
                  enableResetCacheOnSourceFileChanges: false,
                },
                jsx,
              },
              'input.jsx',
            );
            expect(code).not.toContain('compiler-runtime');
            if (jsx === 'classic') expect(code).not.toContain('<div>');
            else expect(code).toContain('<div>');
            actual = observe(code);
          } catch (error) {
            expect(error).toBeInstanceOf(NativeTransformError);
            const failure = error as NativeTransformError;
            expect(failure.reason).toBe('transform-error');
            expect(JSON.stringify(failure.diagnostics)).toMatch(
              entry.nativeDiagnostic ?? entry.diagnostic,
            );
            actual = 'transform-error';
          }
          if (defect) expect(actual).toBe('transform-error');
          else
            expect(actual).toEqual(
              shouldThrow ? 'transform-error' : { type: 'div', props: null, value: 7 },
            );
        });
        (defect ? test.fails : test)(
          'honors diagnostic severity and continues selected JSX lowering',
          () => {
            expect(actual).toEqual(
              shouldThrow ? 'transform-error' : { type: 'div', props: null, value: 7 },
            );
          },
        );
      });
    }
  }
}
