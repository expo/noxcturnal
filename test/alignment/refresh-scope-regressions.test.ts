import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
function signatures(code: string) {
  const found: { name: string; key: string; reset: boolean }[] = [];
  new Function('require', '$RefreshReg$', '$RefreshSig$', code)(
    (name: string) => {
      expect(name).toBe('react/compiler-runtime');
      return { c: () => [] };
    },
    () => {},
    () =>
      (fn: Function, key: string, reset = false) => {
        if (fn) found.push({ name: fn.name, key, reset });
        return fn;
      },
  );
  return found;
}
for (const emitFullSignatures of [false, true]) {
  describe(`Refresh signature ownership, full=${emitFullSignatures}`, () => {
    test.each([
      ['nested blocks', 'function App(){{{useState(0)}}}', true],
      ['static block', 'function App(){class C{static {useState(0)}}return C}', false],
      ['nested static block', 'function App(){{class C{static {{useState(0)}}}}}', false],
      ['instance field Babel boundary', 'function App(){class C{x=useState(0)}return C}', true],
      [
        'static field Babel boundary',
        'function App(){class C{static x=useState(0)}return C}',
        true,
      ],
      [
        'nested function boundary',
        'function App(){function Inner(){useState(0)}return Inner}',
        false,
      ],
      [
        'inner function in static block',
        'function App(){class C{static {function Inner(){useState(0)}}}return C}',
        false,
      ],
      [
        'string is not a reset comment',
        'const text="@refresh reset"; function App(){useState(0)}',
        true,
      ],
      ['trailing reset comment', 'function App(){useState(0)} /* @refresh reset */', true],
      ['nested reset comment', 'function App(){/* @refresh reset */useState(0)}', true],
    ])('%s', (_name, source, hasSignature) => {
      const options = { emitFullSignatures };
      const babel = transformSync(source as string, {
        babelrc: false,
        configFile: false,
        plugins: [[referenceRequire('react-refresh/babel'), { ...options, skipEnvCheck: true }]],
      })!.code!;
      const actual = compile(source as string, { reactRefresh: options });
      expect(signatures(actual)).toEqual(signatures(babel));
      expect(signatures(actual).some(signature => signature.name === 'App')).toBe(hasSignature);
    });
  });
}

for (const emitFullSignatures of [false, true]) {
  test(`generated reducer signatures compile and track added hooks, full=${emitFullSignatures}`, () => {
    const source = (additional: boolean) => `function App(){'use memo';
      const [value]=React.useReducer((state)=>state,1);
      ${additional ? 'React.useReducer((state)=>state,2);' : ''}
      return React.createElement('div',null,value);}`;
    const outputs = [false, true].map(additional =>
      compile(source(additional), {
        reactCompiler: {
          compilationMode: 'annotation',
          panicThreshold: 'none',
          target: '19',
          enableResetCacheOnSourceFileChanges: false,
        },
        reactRefresh: { emitFullSignatures },
      }),
    );
    for (const output of outputs) {
      expect(output).toContain('react/compiler-runtime');
      expect(output).toContain('$RefreshSig$');
    }
    // These module imports are not executed: registration/signature callbacks
    // observe function metadata only, independently of the actual renderer tests.
    const observed = outputs.map(output => signatures(output.replace(/^import[^;]+;\s*/m, '')));
    expect(observed[0]).toHaveLength(1);
    expect(observed[1]).toHaveLength(1);
    expect(observed[1][0].key).not.toBe(observed[0][0].key);
  });
}
