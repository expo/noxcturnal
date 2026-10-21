import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);
const configs = [
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
];
function observe(code: string, module: boolean): unknown {
  // Every CommonJS case gets fresh globals and loads the installed helper package.
  // ES modules use Node subprocesses to exercise native import resolution.
  if (!module) {
    const context: Record<string, unknown> = { require };
    runInNewContext(code, context);
    return context.result;
  }

  const child = spawnSync(
    process.execPath,
    [
      `--input-type=${module ? 'module' : 'commonjs'}`,
      '-e',
      `${code}\nconsole.log(JSON.stringify(globalThis.result));`,
    ],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 10000 },
  );
  expect(child.error).toBeUndefined();
  expect(child.signal).toBeNull();

  expect(child.status, child.stderr).toBe(0);
  return JSON.parse(child.stdout);
}

test('execution cases use the pinned runtime helper package', () => {
  expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
});

describe.each([
  { format: 'CommonJS', module: false },
  { format: 'ES module', module: true },
])('rest helper fallback in $format', ({ module }) => {
  const source = `
    ${module ? 'export {};' : ''}
    const events = [];
    const key = (events.push('key'), 'a');
    const { [key]: a, ...rest } = { a: 1, b: 2 };
    const spread = { ...rest, c: 3 };
    globalThis.result = [events, a, rest, spread];
  `;
  const expected = [['key'], 1, { b: 2 }, { b: 2, c: 3 }];

  describe.each(configs)('loose=$loose builtins=$useBuiltIns', config => {
    test.each(['7.0.0-beta.0', '7.1.4', '7.1.5', '7.4.0', '7.5.0', '7.29.7', '8.0.0'])(
      'declared runtime %s selects and executes the compatible helper path',
      version => {
        const code = compile(
          source,
          {
            transforms: { objectRestSpread: config },
            helpers: { mode: 'runtime', moduleName: '@babel/runtime', version },
          },
          module ? 'input.mjs' : 'input.js',
        );
        expect(code).not.toMatch(/\.\.\.rest/);
        const importsPropertyKey = !['7.0.0-beta.0', '7.1.4', '8.0.0'].includes(version);
        expect(code.includes('@babel/runtime/helpers/toPropertyKey')).toBe(importsPropertyKey);
        // useBuiltIns only selects the assignment path in loose mode.
        const strict = !config.loose;
        expect(code.includes('@babel/runtime/helpers/objectSpread2')).toBe(
          strict && ['7.5.0', '7.29.7'].includes(version),
        );
        if (version === '8.0.0') expect(code).not.toContain('@babel/runtime');
        else expect(code).toContain('@babel/runtime/helpers/');
        expect(observe(code, module)).toEqual(expected);
      },
    );
  });
});
