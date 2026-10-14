import { createRequire } from 'node:module';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const policies = [
  { name: 'inline', mode: 'inline' as const, version: '7.29.7', imported: false },
  { name: 'runtime default', mode: 'runtime' as const, version: undefined, imported: true },
  { name: 'runtime current', mode: 'runtime' as const, version: '7.29.7', imported: true },
  {
    name: 'unsupported major fallback',
    mode: 'runtime' as const,
    version: '8.0.0',
    imported: false,
  },
];
for (const policy of policies)
  for (const module of [false, true])
    for (const compact of [false, true])
      test(`${policy.name}, module=${module}, compact=${compact}`, async () => {
        const source = `const babelHelpers=11,babelHelpersFallback=13,_wrapAsyncGenerator=17,_awaitAsyncGenerator=19;
async function* read(){yield await Promise.resolve(1+babelHelpers+babelHelpersFallback+_wrapAsyncGenerator+_awaitAsyncGenerator);throw new Error('bad');}
async function observe(){const out=[];try{for await(const value of read())out.push(value);}catch(error){out.push(error.message);}return out;}
${module ? 'export const result' : 'globalThis.result'}=observe();`;
        const reference = transformSync(source, {
          sourceType: module ? 'module' : 'script',
          compact,
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-async-generator-functions'),
            ...(policy.mode === 'runtime'
              ? [
                  [
                    require('@babel/plugin-transform-runtime'),
                    {
                      ...(policy.version === undefined ? {} : { version: policy.version }),
                      useESModules: false,
                    },
                  ],
                ]
              : []),
          ],
        })!.code!;
        expect(reference.includes('@babel/runtime/')).toBe(policy.imported);
        const code = compile(
          source,
          {
            compact,
            transforms: { asyncGeneratorFunctions: true },
            helpers: { mode: policy.mode, version: policy.version },
          },
          module ? 'input.mjs' : 'input.js',
        );
        expect(code).not.toMatch(/async\s+function\s*\*|for\s+await/);
        expect(code.includes('@babel/runtime/')).toBe(policy.imported);
        if (module) {
          const directory = await mkdtemp(
            path.join(process.cwd(), 'node_modules/.async-generator-helper-audit-'),
          );
          try {
            for (const [name, text] of [
              ['native', source],
              ['babel', reference],
              ['transformed', code],
            ]) {
              const file = path.join(directory, name + '.mjs');
              await writeFile(file, text);
              const namespace = await import(pathToFileURL(file).href);
              expect(await namespace.result).toEqual([61, 'bad']);
            }
          } finally {
            await rm(directory, { recursive: true, force: true });
          }
        } else {
          for (const text of [source, reference, code]) {
            const context = { require, result: undefined };
            runInNewContext(text, context, { timeout: 1000 });
            expect(await context.result).toEqual([61, 'bad']);
          }
        }
      });
