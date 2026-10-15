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
        const source = `const babelHelpers=11,babelHelpersFallback=13,_asyncToGenerator=17;
async function read(value){await 0;if(value<0)throw new Error('bad');return value+babelHelpers+babelHelpersFallback+_asyncToGenerator;}
${module ? 'export const result' : 'globalThis.result'}=Promise.all([read(1),read(-1).catch(error=>error.message)]);`;
        const reference = transformSync(source, {
          sourceType: module ? 'module' : 'script',
          compact,
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-async-to-generator'),
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
            transforms: { asyncFunctions: true },
            helpers: { mode: policy.mode, version: policy.version },
          },
          module ? 'input.mjs' : 'input.js',
        );
        expect(code).not.toMatch(/async\s+function/);
        expect(code.includes('@babel/runtime/')).toBe(policy.imported);
        if (module) {
          const directory = await mkdtemp(
            path.join(process.cwd(), 'node_modules/.async-helper-audit-'),
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
              expect(await namespace.result).toEqual([42, 'bad']);
            }
          } finally {
            await rm(directory, { recursive: true, force: true });
          }
        } else {
          for (const text of [source, reference, code]) {
            const context = { require, result: undefined };
            runInNewContext(text, context, { timeout: 1000 });
            expect(await context.result).toEqual([42, 'bad']);
          }
        }
      });
