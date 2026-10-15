import { createRequire } from 'node:module';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const body = `try { yield await Promise.resolve(this.base + arguments[0]); return 9; } finally { log.push('finally'); }`;
const cases = [
  {
    name: 'named export invoked before declaration',
    source: `export const log=[];export const iterator=read.call({base:4},3);export async function* read(value){${body}}`,
    callDefault: false,
  },
  {
    name: 'named default export invoked before declaration',
    source: `export const log=[];export const iterator=read.call({base:4},3);export default async function* read(value){${body}}`,
    callDefault: false,
  },
  {
    name: 'anonymous default export',
    source: `export const log=[];export default async function*(value){${body}}`,
    callDefault: true,
  },
  {
    name: 'top-level await outside generator',
    source: `export const log=[];await Promise.resolve().then(()=>log.push('module'));export default async function*(value){${body}}`,
    callDefault: true,
    topLevelAwait: true,
  },
];
for (const mode of ['inline', 'runtime'] as const)
  for (const entry of cases) {
    test(`${entry.name}, ${mode}`, async () => {
      const directory = await mkdtemp(
        path.join(process.cwd(), 'node_modules/.async-generator-module-audit-'),
      );
      try {
        const reference = transformSync(entry.source, {
          sourceType: 'module',
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-async-generator-functions'),
            ...(mode === 'runtime'
              ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
              : []),
          ],
        })!.code!;
        const code = compile(
          entry.source,
          { transforms: { asyncGeneratorFunctions: true }, helpers: { mode, version: '7.29.7' } },
          'input.mjs',
        );
        expect(code).not.toMatch(/async\s+function\s*\*/);
        expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
        if (entry.topLevelAwait) expect(code).toMatch(/\bawait\b/);
        for (const [name, text] of [
          ['native', entry.source],
          ['babel', reference],
          ['nox', code],
        ]) {
          const file = path.join(directory, `${name}.mjs`);
          await writeFile(file, text);
          const namespace = await import(pathToFileURL(file).href);
          const iterator = entry.callDefault
            ? namespace.default.call({ base: 4 }, 3)
            : namespace.iterator;
          expect(await iterator.next(), name).toEqual({ value: 7, done: false });
          expect(await iterator.next(), name).toEqual({ value: 9, done: true });
          expect(await iterator.next(), name).toEqual({ value: undefined, done: true });
          expect(namespace.log, name).toEqual(
            entry.topLevelAwait ? ['module', 'finally'] : ['finally'],
          );
        }
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    });
  }
