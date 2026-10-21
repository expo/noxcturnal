import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const source = `
  const events = [];
  function fail() { throw new Error('default'); }
  async function* read(value = fail()) { yield value; }
  try { read(); events.push('returned'); }
  catch (error) { events.push(error.message); }
  globalThis.result = events;
`;
const outputs = new Map<string, string>();
beforeAll(() => {
  for (const mode of ['inline', 'runtime'] as const) {
    for (const parameters of [false, true]) {
      const code = compile(source, {
        transforms: { asyncGeneratorFunctions: true, parameters },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s+function\s*\*/);
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
      outputs.set(`${mode}:${parameters}`, code);
    }
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        require('@babel/plugin-transform-async-generator-functions'),
        require('@babel/plugin-transform-parameters'),
        ...(mode === 'runtime'
          ? [
              [
                require('@babel/plugin-transform-runtime'),
                { version: '7.29.7', useESModules: false },
              ],
            ]
          : []),
      ],
    });
    expect(reference?.code).toBeTypeOf('string');
    outputs.set(`babel:${mode}`, reference!.code!);
  }
});
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
test('native async generator parameter failure is eager', () => {
  expect(run(source)).toEqual(['default']);
});
test.each(['inline', 'runtime'])('%s Babel composition keeps eager initialization', mode => {
  expect(run(outputs.get(`babel:${mode}`)!)).toEqual(['default']);
});
test.each(['inline', 'runtime'])('%s async lowering alone keeps eager initialization', mode => {
  expect(run(outputs.get(`${mode}:false`)!)).toEqual(['default']);
});
// Existing generator-parameter initialization defect, exposed through async composition.
test.each(['inline', 'runtime'])('%s parameter composition keeps eager initialization', mode => {
  expect(run(outputs.get(`${mode}:true`)!)).toEqual(['default']);
});
