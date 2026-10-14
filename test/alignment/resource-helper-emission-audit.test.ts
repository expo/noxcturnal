import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const policies = [
  { mode: 'inline' as const, version: '7.29.7', usingImport: false, asyncImport: false },
  { mode: 'runtime' as const, version: '7.20.0', usingImport: false, asyncImport: true },
  { mode: 'runtime' as const, version: '7.23.8', usingImport: false, asyncImport: true },
  { mode: 'runtime' as const, version: '7.23.9', usingImport: true, asyncImport: true },
  { mode: 'runtime' as const, version: '7.29.7', usingImport: true, asyncImport: true },
  { mode: 'runtime' as const, version: '8.0.0', usingImport: false, asyncImport: false },
];
async function run(code: string) {
  const directory = mkdtempSync(path.join(process.cwd(), 'node_modules/.resource-helper-audit-'));
  try {
    const file = path.join(directory, 'input.mjs');
    writeFileSync(file, code);
    const m = await import(pathToFileURL(file).href);
    return [m.result, m.log];
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const policy of policies)
  for (const compact of [false, true])
    test(`${policy.mode} ${policy.version}, compact=${compact}`, async () => {
      const source = `const babelHelpers=11,babelHelpersFallback=13,_usingCtx=17;export const log=[];using first={[Symbol.dispose](){log.push('first');}},second={[Symbol.dispose](){log.push('second');}};async function read(){return await (babelHelpers+babelHelpersFallback+_usingCtx);}export const result=await read();`;
      const reference = transformSync(source, {
        sourceType: 'module',
        compact,
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-explicit-resource-management'),
          require('@babel/plugin-transform-async-to-generator'),
          ...(policy.mode === 'runtime'
            ? [[require('@babel/plugin-transform-runtime'), { version: policy.version }]]
            : []),
        ],
      })!.code!;
      const code = compile(
        source,
        {
          compact,
          transforms: { explicitResourceManagement: true, asyncFunctions: true },
          helpers: { mode: policy.mode, version: policy.version },
        },
        'input.mjs',
      );
      expect(code).not.toMatch(/\busing\s+first\b|async\s+function/);
      for (const output of [reference, code]) {
        expect(output.includes('@babel/runtime/helpers/usingCtx')).toBe(policy.usingImport);
        expect(output.includes('@babel/runtime/helpers/asyncToGenerator')).toBe(policy.asyncImport);
        expect(await run(output)).toEqual([41, ['second', 'first']]);
      }
    });
