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
const nativeSupported =
  spawnSync(nativeNode, ['--input-type=module', '--eval', 'await using x=null;']).status === 0;
const cases = [
  {
    name: 'import waits for disposal',
    body: `await using resource={async [Symbol.asyncDispose](){log.push('dispose:start');await 0;log.push('dispose:end');}};log.push('body');`,
    expected: ['fulfilled', ['body', 'dispose:start', 'dispose:end']],
  },
  {
    name: 'async disposal errors nest around the body error',
    body: `await using first={async [Symbol.asyncDispose](){await 0;log.push('first');throw new Error('first');}};await using second={async [Symbol.asyncDispose](){await 0;log.push('second');throw new Error('second');}};log.push('body');throw new Error('body');`,
    expected: [
      'rejected',
      [
        'SuppressedError',
        ['Error', 'first'],
        ['SuppressedError', ['Error', 'second'], ['Error', 'body']],
      ],
      ['body', 'second', 'first'],
    ],
  },
  {
    name: 'initializer rejection still awaits prior cleanup',
    body: `await using first={async [Symbol.asyncDispose](){await 0;log.push('first');throw new Error('first');}};await using second=await Promise.reject(new Error('initialize'));`,
    expected: [
      'rejected',
      ['SuppressedError', ['Error', 'first'], ['Error', 'initialize']],
      ['first'],
    ],
  },
];
function run(code: string, executable: string) {
  const directory = mkdtempSync(
    path.join(process.cwd(), 'node_modules/.resource-async-module-audit-'),
  );
  try {
    const entry = path.join(directory, 'input.mjs'),
      dependency = path.join(directory, 'dep.mjs');
    writeFileSync(entry, code);
    writeFileSync(dependency, 'export const log=[];');
    const runner = `const {log}=await import(${JSON.stringify(pathToFileURL(dependency).href)});function summarize(error){return error.name==='SuppressedError'?[error.name,summarize(error.error),summarize(error.suppressed)]:[error.name,error.message];}let result;try{await import(${JSON.stringify(pathToFileURL(entry).href)});result=['fulfilled',log];}catch(error){result=['rejected',summarize(error),log];}console.log(JSON.stringify(result));`;
    return JSON.parse(
      execFileSync(executable, ['--input-type=module', '--eval', runner], {
        encoding: 'utf8',
        timeout: 5000,
      }),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases) {
  const source = `import {log} from './dep.mjs';${entry.body}`;
  test.skipIf(!nativeSupported)(`${entry.name}, native`, () => {
    expect(run(source, nativeNode)).toEqual(entry.expected);
  });
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, mode => {
    const reference = transformSync(source, {
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
      source,
      { transforms: { explicitResourceManagement: true }, helpers: { mode, version: '7.29.7' } },
      'input.mjs',
    );
    expect(code).not.toMatch(/\busing\s+(?:resource|first|second)\b/);
    expect(code).toMatch(/\bawait\b/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    for (const output of [reference, code])
      expect(run(output, process.execPath)).toEqual(entry.expected);
  });
}
