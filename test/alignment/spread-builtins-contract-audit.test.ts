import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
const cases = [
  {
    regression: true,
    name: 'spread getter before later property evaluation',
    source: `const events=[];const value={...{get a(){events.push('get');return 1}},b:(events.push('later'),2)};globalThis.result=[events,value.a,value.b];`,
    strict: [['get', 'later'], 1, 2],
    loose: [['later', 'get'], 1, 2],
  },
  {
    regression: true,
    name: 'getter after spread remains an accessor',
    source: `const events=[];const value={...{},get a(){events.push('get');return 1}};globalThis.result=[events,typeof Object.getOwnPropertyDescriptor(value,'a').get];`,
    strict: [[], 'function'],
    loose: [['get'], 'undefined'],
  },
  {
    regression: true,
    name: 'consecutive spreads observe an earlier getter replacing the later source',
    source: `let second={b:2};const value={...{get a(){second={b:3};return 1}},...second};globalThis.result=[value.a,value.b];`,
    strict: [1, 3],
    loose: [1, 2],
  },
  {
    regression: false,
    name: 'nested spread expressions',
    source: `const value={a:{...{b:2}},...{c:3}};globalThis.result=[value.a.b,value.c];`,
    strict: [2, 3],
    loose: [2, 3],
  },
  {
    regression: false,
    name: 'ordinary literal without spread',
    source: `const events=[];const value={get a(){events.push('get');return 1}};globalThis.result=[events,typeof Object.getOwnPropertyDescriptor(value,'a').get];`,
    strict: [[], 'function'],
    loose: [[], 'function'],
  },
];
describe.each([
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
])('spread contract loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each(cases)('$name', fixture => {
      const fails = fixture.regression && !config.loose && config.useBuiltIns;
      let actual: unknown;
      beforeAll(() => {
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        expect(observe(fixture.source)).toEqual(fixture.strict);
        const reference = transformSync(fixture.source, {
          babelrc: false,
          configFile: false,
          sourceType: 'script',
          plugins: [
            [objectRest, config],
            ...(mode === 'runtime' ? [[runtime, { version: '7.29.7', useESModules: false }]] : []),
          ],
        })!.code!;
        expect(observe(reference)).toEqual(config.loose ? fixture.loose : fixture.strict);
        const code = compile(fixture.source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toContain('...');
        if (config.useBuiltIns && fixture.source.includes('...'))
          expect(code).toContain('Object.assign');
        actual = observe(code);
        expect(actual).toEqual(config.loose || config.useBuiltIns ? fixture.loose : fixture.strict);
      });
      (fails ? test.fails : test)('preserves the selected strict or loose spread contract', () => {
        expect(actual).toEqual(config.loose ? fixture.loose : fixture.strict);
      });
    });
  });
});
