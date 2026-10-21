import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// Native differentials remain in compliance/resources.test.ts. These preserve
// the scoped Babel baseline without deleting or changing those observations.
const cases = [
  {
    name: 'using assignment',
    body: `let result;try{resource=undefined;result='accepted';}catch(error){result=error.name;}`,
    expected: 'accepted',
  },
  {
    name: 'exported const assignment',
    body: `export const value=1;let result;try{value=2;result=value;}catch(error){result=error.name;}`,
    expected: 2,
  },
  {
    name: 'let TDZ',
    body: `let result;try{result=typeof value;}catch(error){result=error.name;}let value=1;`,
    expected: 'undefined',
  },
  {
    name: 'class TDZ',
    body: `let result;try{result=typeof Value;}catch(error){result=error.name;}class Value{}`,
    expected: 'undefined',
  },
];
async function run(code: string) {
  const directory = mkdtempSync(
    path.join(process.cwd(), 'node_modules/.resource-module-baseline-'),
  );
  try {
    const file = path.join(directory, 'input.mjs');
    writeFileSync(file, code);
    return (await import(pathToFileURL(file).href)).result;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases)
  test.each(['inline', 'runtime'] as const)(
    `${entry.name}, %s adopted module baseline`,
    async mode => {
      const source = `using resource=null;${entry.body}export {result};`;
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
      expect(code).not.toMatch(/\busing\s+resource\b/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await run(reference)).toEqual(entry.expected);
      expect(await run(code)).toEqual(entry.expected);
    },
  );
