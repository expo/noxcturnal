import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const source = `const a = /(?<a>a)/; const b = /(?<b>b)/; globalThis.result = a[Symbol.replace].call(b, 'b', '$<b>!');`;
const outcomes = new Map<string, unknown>();
function runFresh(code: string): unknown {
  const child = spawnSync(process.execPath, [], {
    encoding: 'utf8',
    timeout: 3000,
    input: `try {
      ${code}
      process.stdout.write(JSON.stringify({ value: globalThis.result }));
    } catch (error) {
      process.stdout.write(JSON.stringify({ error: error.name }));
    }`,
  });
  expect(child.error).toBeUndefined();
  expect(child.status).toBe(0);
  return JSON.parse(child.stdout);
}
beforeAll(() => {
  outcomes.set('native', runFresh(source));
  for (const mode of ['inline', 'runtime'] as const) {
    const code = compile(source, {
      transforms: { regexpNamedCaptureGroups: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toMatch(/\(\?<\w/);
    outcomes.set('nox-' + mode, runFresh(code));
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        require('@babel/plugin-transform-named-capturing-groups-regex'),
        ...(mode === 'runtime'
          ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
          : []),
      ],
    });
    expect(reference?.code).toBeTypeOf('string');
    expect(reference!.code!).not.toMatch(/\(\?<\w/);
    for (const output of [code, reference!.code!]) {
      if (mode === 'runtime') expect(output).toContain('@babel/runtime/helpers/wrapRegExp');
      else expect(output).not.toContain('@babel/runtime');
    }
    outcomes.set('babel-' + mode, runFresh(reference!.code!));
  }
});
test('native replacement can be borrowed between named regexps', () => {
  expect(outcomes.get('native')).toEqual({ value: 'b!' });
});
test('Babel inline replacement can be borrowed between named regexps', () => {
  expect(outcomes.get('babel-inline')).toEqual({ value: 'b!' });
});
test('bundled CommonJS helper matches the cold Babel runtime baseline', () => {
  expect(outcomes.get('nox-inline')).toEqual(outcomes.get('babel-runtime'));
});
test('cold runtime behavior matches the pinned Babel runtime baseline', () => {
  expect(outcomes.get('nox-runtime')).toEqual(outcomes.get('babel-runtime'));
});
