import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { transformSync as transportModule } from 'esbuild';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
const cases = [
  ['anonymous default function', 'export default function(){return null}'],
  ['anonymous default arrow', 'export default ()=>null;'],
  ['class declaration', 'class App{}'],
  ['multiple declarators', 'const App=()=>null,Other=()=>null;'],
  ['lowercase function', 'function app(){return null}'],
  ['nested declaration', 'function outer(){function App(){return null}return App}outer();'],
  ['higher-order arrow', 'const App=()=>()=>null;'],
  [
    'require-like factory',
    'function requireComponent(v){return v}const App=requireComponent(()=>null);',
  ],
  ['unconsumed tagged factory', 'const tag=()=>()=>null;const App=tag`component`;'],
  ['uninitialized declaration', 'let App;'],
  ['destructured binding', 'const {App}={App:()=>null};'],
] as const;
function observe(code: string) {
  const registrations: string[] = [];
  const module = { exports: {} };
  const body = transportModule(code, { format: 'cjs' }).code;
  new Function('module', '$RefreshReg$', '$RefreshSig$', body)(
    module,
    (_component: unknown, id: string) => registrations.push(id),
    () => () => {},
  );
  return registrations;
}
for (const emitFullSignatures of [false, true]) {
  describe.each(cases)('%s', (_name, source) => {
    test(`retains the Babel registration boundary; full signatures=${emitFullSignatures}`, () => {
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [
          [referenceRequire('react-refresh/babel'), { skipEnvCheck: true, emitFullSignatures }],
        ],
      })!.code!;
      expect(observe(reference)).toEqual([]);
      const code = compile(source, { reactRefresh: { emitFullSignatures } });
      expect(observe(code)).toEqual([]);
      // A registered neighbor proves Refresh is enabled for the same input/options.
      const control = compile(`${source}\nfunction Neighbor(){return null}`, {
        reactRefresh: { emitFullSignatures },
      });
      expect(observe(control)).toEqual(['Neighbor']);
    });
  });
}
