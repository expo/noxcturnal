import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from 'vitest';
import { compile } from './runtime';

const cases = [
  {
    name: 'named export called before declaration and recursively',
    source: `export const result = read(3);
export async function read(n) { return n ? 1 + await read(n - 1) : 0; }`,
    expected: 3,
  },
  {
    name: 'named default export retains its local recursive binding',
    source: `export const result = read(3);
export default async function read(n) { return n ? 1 + await read(n - 1) : 0; }`,
    expected: 3,
  },
  {
    name: 'anonymous default export executes with its receiver and arguments',
    source: `export default async function(value) { await 0; return this.base + arguments[0]; }`,
    expected: 7,
    callDefault: true,
  },
  {
    name: 'top-level await remains outside the lowered generator',
    source: `const events = [];
events.push('module');
await Promise.resolve().then(() => events.push('await'));
export async function read() { await 0; events.push('function'); return events; }
export const result = read();`,
    expected: ['module', 'await', 'function'],
    topLevelAwait: true,
  },
];

for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, async mode => {
    const directory = await mkdtemp(path.join(process.cwd(), 'node_modules/.async-module-'));
    try {
      const actual = compile(
        entry.source,
        {
          transforms: { asyncFunctions: true },
          helpers: { mode, version: '7.29.7' },
        },
        'input.mjs',
      );
      expect(actual).not.toMatch(/async\s+function/);
      expect(actual.includes('@babel/runtime/')).toBe(mode === 'runtime');
      if (entry.topLevelAwait) expect(actual).toMatch(/\bawait\b/);
      const filename = path.join(directory, 'transformed.mjs');
      await writeFile(filename, actual);
      const namespace = await import(pathToFileURL(filename).href);
      const value = entry.callDefault
        ? await namespace.default.call({ base: 4 }, 3)
        : await namespace.result;
      expect(value).toEqual(entry.expected);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
