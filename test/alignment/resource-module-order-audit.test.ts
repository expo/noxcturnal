import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
const cases = [
  {
    name: 'exported function reads live binding after disposal',
    source: `export function read(){return value;} using resource={[Symbol.dispose](){value=9;}};export let value=3;export const before=read();`,
    select: '[m.before,m.value,m.read()]',
    expected: [3, 9, 9],
  },
  {
    name: 'default expression remains a snapshot',
    source: `export let value=3;export default value;using resource={[Symbol.dispose](){value=9;}};`,
    select: '[m.default,m.value]',
    expected: [3, 9],
  },
  {
    name: 'imports and re-exports precede body and cleanup',
    source: `import {log} from './dep.mjs';export {value as forwarded} from './dep.mjs';export * from './dep.mjs';using resource={[Symbol.dispose](){log.push('dispose');}};log.push('body');`,
    select: '[m.forwarded,m.value,m.log]',
    expected: [7, 7, ['dependency', 'body', 'dispose']],
  },
];
function execute(code: string, select: string, executable: string) {
  const directory = mkdtempSync(path.join(process.cwd(), 'node_modules/.resource-module-audit-'));
  try {
    const file = path.join(directory, 'input.mjs');
    writeFileSync(file, code);
    writeFileSync(
      path.join(directory, 'dep.mjs'),
      `export const log=['dependency'];export const value=7;`,
    );
    const runner = `const m=await import(${JSON.stringify(pathToFileURL(file).href)});console.log(JSON.stringify(${select}));`;
    return JSON.parse(
      execFileSync(executable, ['--input-type=module', '--eval', runner], { encoding: 'utf8' }),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases) {
  test.skipIf(!nativeSupported)(`${entry.name}, native`, () => {
    expect(execute(entry.source, entry.select, nativeNode)).toEqual(entry.expected);
  });
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, mode => {
    const reference = transformSync(entry.source, {
      sourceType: 'module',
      babelrc: false,
      configFile: false,
      plugins: [
        require('@babel/plugin-transform-explicit-resource-management'),
        ...(mode === 'runtime'
          ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
          : []),
      ],
    })!.code!;
    const code = compile(
      entry.source,
      { transforms: { explicitResourceManagement: true }, helpers: { mode, version: '7.29.7' } },
      'input.mjs',
    );
    expect(code).not.toMatch(/\busing\s+resource\b/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    for (const output of [reference, code])
      expect(execute(output, entry.select, process.execPath)).toEqual(entry.expected);
  });
}
