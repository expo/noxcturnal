import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const source = 'function App(){const [value]=useState(3);return value}globalThis.result=App();';
function execute(code: string) {
  const registrations: string[] = [];
  let setup = 0;
  let calls = 0;
  const register = (_component: unknown, name: string) => {
    registrations.push(name);
  };
  const signature = () => {
    setup++;
    return () => {
      calls++;
    };
  };
  const runtime = { register, signature, hooks: { register, signature } };
  const context: { result?: number } = {};
  new Function(
    'runtime',
    'register',
    'signature',
    '$RefreshReg$',
    '$RefreshSig$',
    'useState',
    'globalThis',
    code,
  )(runtime, register, signature, register, signature, (value: number) => [value], context);
  return [context.result, registrations, setup, calls];
}
describe.each([
  {
    name: 'identifiers',
    options: { refreshReg: 'register', refreshSig: 'signature' },
  },
  {
    name: 'single member',
    options: { refreshReg: 'runtime.register', refreshSig: 'runtime.signature' },
  },
  { name: 'nested registration', options: { refreshReg: 'runtime.hooks.register' } },
  { name: 'nested signature', options: { refreshSig: 'runtime.hooks.signature' } },
])('$name', entry => {
  let actual: unknown;
  let expected: unknown;
  beforeAll(() => {
    const babel = transformSync(source, {
      babelrc: false,
      configFile: false,
      sourceType: 'script',
      plugins: [[require('react-refresh/babel'), { ...entry.options, skipEnvCheck: true }]],
    })!.code!;
    expected = execute(babel);
    expect(expected).toEqual([3, ['App'], 1, 2]);
    const nox = compile(source, { reactRefresh: entry.options });
    expect(nox).toContain('_s');
    actual = execute(nox);
  });
  test('calls the complete configured member path', () => {
    expect(actual).toEqual(expected);
  });
});

for (const depth of ['runtime.hooks', 'runtime.hooks.callbacks']) {
  test(`executes import.meta.${depth} callback paths`, async () => {
    const options = {
      refreshReg: `import.meta.${depth}.register`,
      refreshSig: `import.meta.${depth}.signature`,
    };
    const input = 'function App(){const [value]=useState(3);return value}export const value=App();';
    const reference = transformSync(input, {
      babelrc: false,
      configFile: false,
      plugins: [[require('react-refresh/babel'), { ...options, skipEnvCheck: true }]],
    })!.code!;
    const actual = compile(input, { reactRefresh: options }, 'input.mjs');
    const prefix = `const observed={registrations:[],setup:0,calls:0};
      const callbacks={register(type,id){observed.registrations.push(id)},signature(){observed.setup++;return ()=>{observed.calls++}}};
      import.meta.runtime={hooks:${depth.endsWith('callbacks') ? '{callbacks}' : 'callbacks'}};
      const useState=value=>[value];`;
    for (const code of [reference, actual]) {
      const result = await importCode(prefix + code + ';export {observed};');
      expect(result.value).toBe(3);
      expect(result.observed).toEqual({ registrations: ['App'], setup: 1, calls: 2 });
    }
  });
}
