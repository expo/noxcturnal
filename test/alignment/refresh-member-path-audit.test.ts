import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

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
    fails: false,
  },
  {
    name: 'single member',
    options: { refreshReg: 'runtime.register', refreshSig: 'runtime.signature' },
    fails: false,
  },
  { name: 'nested registration', options: { refreshReg: 'runtime.hooks.register' }, fails: true },
  { name: 'nested signature', options: { refreshSig: 'runtime.hooks.signature' }, fails: true },
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
    try {
      actual = execute(nox);
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      expect((error as Error).message).toMatch(/runtime\.hooks.*not a function/);
      actual = { error: 'TypeError' };
    }
  });
  (entry.fails ? test.fails : test)('calls the complete configured member path', () => {
    expect(actual).toEqual(expected);
  });
});
