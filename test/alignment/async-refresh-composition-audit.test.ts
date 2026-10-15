import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const referenceRequire = createRequire(require.resolve('babel-preset-expo/package.json'));
const cases = [
  {
    name: 'declaration',
    definition: `async function App(input){const [value]=useState(3);await 0;return [value,input,this.base];}`,
    invoke: `App.call({base:4},7)`,
    expected: ['fulfilled', [3, 7, 4]],
  },
  {
    name: 'expression',
    definition: `const App=async function(input){const [value]=useState(3);await 0;return [value,input,this.base];};`,
    invoke: `App.call({base:4},7)`,
    expected: ['fulfilled', [3, 7, 4]],
  },
  {
    name: 'lexical arrow',
    definition: `function make(){const App=async(input)=>{const [value]=useState(3);await 0;return [value,input,this.base];};return App;}const App=make.call({base:4});`,
    invoke: `App(7)`,
    expected: ['fulfilled', [3, 7, 4]],
  },
  {
    name: 'rejected expression',
    definition: `const App=async function(){useState(3);await 0;throw new RangeError('expected');};`,
    invoke: `App()`,
    expected: ['rejected', 'RangeError'],
  },
];
async function run(code: string) {
  const context: Record<string, unknown> = {};
  let calls = 0;
  let signatures = 0;
  // Model only the instrumentation ABI. This does not render an async React component.
  new Function('require', 'globalThis', 'useState', '$RefreshReg$', '$RefreshSig$', code)(
    require,
    context,
    (value: unknown) => {
      calls++;
      return [value];
    },
    () => {},
    () => {
      signatures++;
      return (value: unknown) => value;
    },
  );
  return { result: await context.result, calls, signatures };
}
for (const entry of cases)
  for (const compact of [false, true])
    test.each(['inline', 'runtime'] as const)(
      `${entry.name}, compact=${compact}, %s`,
      async mode => {
        const source = `${entry.definition} globalThis.result=${entry.invoke}.then(value=>['fulfilled',value],error=>['rejected',error.name]);`;
        const native = await run(source);
        expect(native.result).toEqual(entry.expected);
        expect(native.calls).toBe(1);
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          compact,
          plugins: [
            [referenceRequire('react-refresh/babel'), { skipEnvCheck: true }],
            require('@babel/plugin-transform-async-to-generator'),
            ...(mode === 'runtime'
              ? [
                  [
                    require('@babel/plugin-transform-runtime'),
                    { version: '7.29.7', useESModules: false },
                  ],
                ]
              : []),
          ],
        })!.code!;
        const code = compile(
          source,
          {
            compact,
            reactRefresh: {},
            transforms: { asyncFunctions: true },
            helpers: { mode, version: '7.29.7' },
          },
          'input.jsx',
        );
        expect(code).not.toMatch(/async\s*(?:function|\()/);
        expect(code).toContain('$RefreshSig$');
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        for (const output of [reference, code]) {
          const actual = await run(output);
          expect(actual.result).toEqual(entry.expected);
          expect(actual.calls).toBe(1);
          expect(actual.signatures).toBeGreaterThan(0);
        }
      },
    );
