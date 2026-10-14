import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { transformSync as transport } from 'esbuild';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
const compiler = {
  compilationMode: 'infer',
  panicThreshold: 'none',
  target: '19',
  enableResetCacheOnSourceFileChanges: false,
} as const;
const warning = `export function App({value}) {class Box {} return <div>{value}</div>}`;
const critical = `import {useRef} from 'react';export function App({value}) {const ref=useRef(value);ref.current=value;return <div>{value}</div>}`;
const field = `class Owner {value=7;read(){return this.value}} globalThis.result=new Owner().read();`;
function babel(
  source: string,
  plugins: NonNullable<import('@babel/core').TransformOptions['plugins']>,
) {
  return transformSync(source, {
    filename: 'input.jsx',
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['jsx'] },
    plugins: [
      [
        referenceRequire('babel-plugin-react-compiler'),
        { ...compiler, environment: { enableResetCacheOnSourceFileChanges: false } },
      ],
      ...plugins,
      referenceRequire('@babel/plugin-transform-react-jsx'),
    ],
  })!.code!;
}
function observe(code: string) {
  const state: { result?: number } = {};
  const registrations: string[] = [];
  const module = { exports: {} };
  new Function(
    'module',
    'exports',
    'require',
    'globalThis',
    '$RefreshReg$',
    transport(code, { format: 'cjs' }).code,
  )(
    module,
    module.exports,
    (name: string) => (name === 'react' ? {} : require(name)),
    state,
    (_value: unknown, id: string) => registrations.push(id),
  );
  return { value: state.result, registrations };
}
for (const mode of ['inline', 'runtime'] as const) {
  for (const compact of [false, true]) {
    describe(`warning recovery helper accounting, ${mode}, compact=${compact}`, () => {
      let actual: unknown;
      beforeAll(() => {
        const source = warning + field;
        const reference = babel(source, [
          [referenceRequire('@babel/plugin-transform-class-properties'), { loose: false }],
        ]);
        expect(observe(reference).value).toBe(7);
        const plan = {
          reactCompiler: compiler,
          jsx: 'classic' as const,
          transforms: { classProperties: { loose: false } },
          helpers: { mode, version: '7.29.7' },
          compact,
        };
        // Error diagnostics stop Oxc before class lowering; recovery then runs it once.
        const errorControl = compile(critical + field, plan, 'input.jsx');
        expect(observe(errorControl).value).toBe(7);
        const noCompiler = compile(source, { ...plan, reactCompiler: undefined }, 'input.jsx');
        expect(observe(noCompiler).value).toBe(7);
        const code = compile(source, plan, 'input.jsx');
        expect(code).not.toMatch(/value\s*=\s*7/);
        if (mode === 'inline') {
          expect(code).toContain('babelHelpers.defineProperty');
          expect(() => observe(code)).toThrow(ReferenceError);
          try {
            actual = observe(code).value;
          } catch (error) {
            expect(String(error)).toContain('babelHelpers is not defined');
            actual = 'missing helper';
          }
        } else {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(code).toContain('@babel/runtime/helpers/defineProperty');
          actual = observe(code).value;
          expect(actual).toBe(7);
        }
      });
      (mode === 'inline' ? test.fails : test)(
        'preserves helpers requested before warning recovery',
        () => expect(actual).toBe(7),
      );
    });
  }
}
for (const emitFullSignatures of [false, true]) {
  describe(`warning recovery Refresh registration, full signatures=${emitFullSignatures}`, () => {
    let actual: unknown;
    beforeAll(() => {
      const reference = babel(warning, [
        [referenceRequire('react-refresh/babel'), { skipEnvCheck: true, emitFullSignatures }],
      ]);
      expect(observe(reference).registrations).toEqual(['App']);
      const plan = {
        reactCompiler: compiler,
        reactRefresh: { emitFullSignatures },
        jsx: 'classic' as const,
      };
      expect(
        observe(compile(warning, { ...plan, reactCompiler: undefined }, 'input.jsx')).registrations,
      ).toEqual(['App']);
      const code = compile(warning, plan, 'input.jsx');
      actual = observe(code).registrations;
      expect(actual).toEqual(['App', 'App']);
    });
    test.fails('registers the component once', () => expect(actual).toEqual(['App']));
  });
}
