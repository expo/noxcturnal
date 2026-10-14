import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { describe, expect, test } from 'vitest';
import type { PreflightPlan } from '../../js';
import { compile, importCode } from './runtime';

const require = createRequire(import.meta.url);
const modes = [
  { mode: 'inline' as const },
  { mode: 'runtime' as const, version: '7.29.7' },
  { mode: 'runtime' as const, version: '7.0.0' },
  { mode: 'runtime' as const, version: '8.0.0' },
];
function moduleImports(code: string) {
  return code.replace(
    /from\s+(["'])(@babel\/runtime\/[^"']+)\1/g,
    (_m, _q, path) => `from ${JSON.stringify(pathToFileURL(require.resolve(path)).href)}`,
  );
}
const captures: {
  name: string;
  source: string;
  transforms: PreflightPlan['transforms'];
  syntax: RegExp;
  expected: unknown;
}[] = [
  {
    name: 'async Promise',
    source: 'const Promise=null;async function read(){return 1}globalThis.result=read();',
    transforms: { asyncFunctions: true },
    syntax: /async function/,
    expected: 1,
  },
  {
    name: 'async-generator Promise',
    source:
      'const Promise=null;async function* read(){yield 2}globalThis.result=read().next().then(x=>x.value);',
    transforms: { asyncGeneratorFunctions: true },
    syntax: /async function\*/,
    expected: 2,
  },
  {
    name: 'mixed object and async helper globals',
    source:
      'const Object=null,Promise=null;async function read(){return {...{value:3}}.value}globalThis.result=read();',
    transforms: { asyncFunctions: true, objectRestSpread: { loose: false, useBuiltIns: false } },
    syntax: /async function|\.\.\./,
    expected: 3,
  },
  {
    name: 'resource helper globals',
    source:
      'const Symbol=null,Error=null;const events=[];{using x={[globalThis.Symbol.dispose](){events.push("disposed")}}}globalThis.result=events;',
    transforms: { explicitResourceManagement: true },
    syntax: /using x/,
    expected: ['disposed'],
  },
];
describe.each(modes)('helper globals $mode $version', helpers => {
  for (const entry of captures)
    test(entry.name, async () => {
      if (
        entry.name !== 'resource helper globals' ||
        Number(process.versions.node.split('.')[0]) >= 24
      ) {
        const native = { require, Symbol, result: undefined };
        runInNewContext(entry.source, native);
        expect(await native.result).toEqual(entry.expected);
      }
      const code = compile(entry.source, { transforms: entry.transforms, helpers });
      expect(code).not.toMatch(entry.syntax);
      const context = { require, Symbol, result: undefined };
      runInNewContext(code, context);
      expect(await context.result).toEqual(entry.expected);
    });
  test.each([false, true])('escaped helper names, compact=%s', compact => {
    const source = String.raw`const _ext\u0065nds='user',babelH\u{65}lpers='external';globalThis.result=[_extends,babelHelpers,{...{value:1}}];`;
    const code = compile(source, {
      compact,
      transforms: { objectRestSpread: { loose: true, useBuiltIns: false } },
      helpers,
    });
    expect(code).not.toContain('...');
    const context = { require, Symbol, result: undefined };
    runInNewContext(code, context);
    expect(context.result).toEqual(['user', 'external', { value: 1 }]);
  });
  test('named regexp adapter executes in native ESM', async () => {
    const code = compile(
      'export default /(?<x>a)/.exec("a").groups.x;',
      { transforms: { regexpNamedCaptureGroups: true }, helpers },
      'input.mjs',
    );
    expect(code).not.toContain('(?<x>');
    expect(code).not.toMatch(/\brequire\(/);
    expect((await importCode(moduleImports(code))).default).toBe('a');
  });
  test('global protection preserves public exports, live references and shorthand keys', async () => {
    const source = `export let Object=null, factory=(parameter)=>parameter;export {Object as alias};export function update(){Object=8}export const result={...{value:1}};export const read=()=>({Object});`;
    const code = compile(
      source,
      { transforms: { objectRestSpread: { loose: false, useBuiltIns: false } }, helpers },
      'input.mjs',
    );
    const result = await importCode(moduleImports(code));
    expect(result.Object).toBeNull();
    expect(Object.keys(result).sort()).toEqual([
      'Object',
      'alias',
      'factory',
      'read',
      'result',
      'update',
    ]);
    expect((result.factory as (value: number) => number)(7)).toBe(7);
    expect(result.alias).toBeNull();
    expect(result.result).toEqual({ value: 1 });
    (result.update as () => void)();
    expect(result.Object).toBe(8);
    expect(result.alias).toBe(8);
    expect((result.read as () => unknown)()).toEqual({ Object: 8 });
  });
});

// Explicit module filenames must select imports even without import/export syntax.
describe.each(modes)('explicit module helper loading $mode $version', helpers => {
  test.each([
    {
      name: 'adapter',
      source: 'const [x]=[5];globalThis.__helperModuleResult=x;',
      transforms: { destructuring: true },
    },
    {
      name: 'Oxc bridge',
      source: 'async function read(){return 6}globalThis.__helperModuleResult=await read();',
      transforms: { asyncFunctions: true },
    },
  ])('$name', async ({ source, transforms }) => {
    const code = compile(source, { transforms, helpers }, 'input.mjs');
    expect(code).not.toMatch(/\brequire\(/);
    await importCode(moduleImports(code));
    const host = globalThis as typeof globalThis & { __helperModuleResult?: number };
    expect(host.__helperModuleResult).toBe(source.includes('return 6') ? 6 : 5);
    delete host.__helperModuleResult;
  });
});
