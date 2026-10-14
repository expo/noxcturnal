import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
async function run(code: string): Promise<unknown> {
  const dir = mkdtempSync(path.join(process.cwd(), 'node_modules/.resource-ts-audit-'));
  try {
    const file = path.join(dir, 'input.mjs');
    writeFileSync(file, code);
    try {
      const module = await import(pathToFileURL(file).href);
      return ['ok', module.log];
    } catch (error) {
      return ['error', (error as Error).name];
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
for (const kind of ['enum', 'namespace'])
  describe(kind, () => {
    const source = `export const log=[];using resource={[Symbol.dispose](){log.push('dispose');}};log.push('before');${kind === 'enum' ? `export enum E{X=(log.push('enum'),1)}` : `export namespace N{export const x=(log.push('namespace'),1);}`}log.push('after');`;
    const expected = ['before', kind, 'after', 'dispose'];
    const outcomes = new Map<string, unknown>();
    const erased = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
      reportDiagnostics: true,
    });
    beforeAll(async () => {
      expect(erased.diagnostics).toEqual([]);
      for (const mode of ['inline', 'runtime'] as const) {
        const helperPlugin =
          mode === 'runtime'
            ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
            : [];
        const reference = transformSync(source, {
          filename: 'input.ts',
          sourceType: 'module',
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-typescript'),
            require('@babel/plugin-transform-explicit-resource-management'),
            ...helperPlugin,
          ],
        })!.code!;
        expect(await run(reference)).toEqual(['error', 'SyntaxError']);
        const babelErased = transformSync(source, {
          filename: 'input.ts',
          sourceType: 'module',
          babelrc: false,
          configFile: false,
          plugins: [require('@babel/plugin-transform-typescript')],
        })!.code!;
        const separated = transformSync(babelErased, {
          sourceType: 'module',
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-explicit-resource-management'),
            ...helperPlugin,
          ],
        })!.code!;
        expect(await run(separated)).toEqual(['ok', expected]);
        for (const parameters of [false, true]) {
          const code = compile(
            source,
            {
              typescript: 'strip',
              transforms: { explicitResourceManagement: true, parameters },
              helpers: { mode, version: '7.29.7' },
            },
            'input.ts',
          );
          expect(code).not.toMatch(/\busing\s+resource\b/);
          expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
          const outcome = await run(code);
          if (kind === 'enum' && !parameters) expect(outcome).toEqual(['error', 'TypeError']);
          outcomes.set(`${mode}:${parameters}`, outcome);
        }
      }
    });
    test.skipIf(!nativeSupported)('TypeScript erasure preserves native resource order', () => {
      const directory = mkdtempSync(path.join(process.cwd(), 'node_modules/.resource-ts-native-'));
      try {
        const file = path.join(directory, 'input.mjs');
        writeFileSync(file, erased.outputText);
        const script = `const m=await import(${JSON.stringify(pathToFileURL(file).href)});console.log(JSON.stringify(m.log));`;
        expect(
          JSON.parse(
            execFileSync(nativeNode, ['--input-type=module', '--eval', script], {
              encoding: 'utf8',
            }),
          ),
        ).toEqual(expected);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    });
    for (const mode of ['inline', 'runtime'])
      for (const parameters of [false, true]) {
        (kind === 'enum' && !parameters ? test.fails : test)(
          `module order, ${mode}, prepass=${parameters}`,
          () => {
            expect(outcomes.get(`${mode}:${parameters}`)).toEqual(['ok', expected]);
          },
        );
      }
  });
