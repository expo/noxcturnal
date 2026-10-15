import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'spread method home object',
    native: 3,
    babel: undefined,
    source: `const result={...{},read(){return super.value}};Object.setPrototypeOf(result,{value:3});globalThis.result=result.read();`,
  },
  {
    name: 'spread late prototype setter',
    native: [true, 3],
    babel: [false, undefined],
    source: `const proto={value:3};const result={...{},__proto__:proto};globalThis.result=[Object.getPrototypeOf(result)===proto,result.value];`,
  },
  {
    name: 'spread accessor halves',
    native: [3, [4]],
    babel: [undefined, [4]],
    source: `const events=[];const result={get value(){return 3},...{},set value(next){events.push(next)}};result.value=4;globalThis.result=[result.value,events];`,
  },
  {
    name: 'spread proxy key order',
    native: ['keys', 'symbol', 'a'],
    babel: ['keys', 'keys', 'a', 'symbol'],
    source: `const events=[],symbol=Symbol();const source=new Proxy({get a(){events.push('a');return 1},get [symbol](){events.push('symbol');return 2}},{ownKeys(){events.push('keys');return [symbol,'a']}});const result={...source};globalThis.result=events;`,
  },
  {
    name: 'spread descriptor changes during getters',
    native: false,
    babel: true,
    source: `const source={get a(){Object.defineProperty(source,'b',{enumerable:false});return 1},b:2};const result={...source};globalThis.result=Object.hasOwn(result,'b');`,
  },
  {
    name: 'rest own proto data property',
    native: [true, true, undefined],
    babel: [false, false, 1],
    source: `const source=JSON.parse('{"__proto__":{"marker":1},"omit":2,"keep":3}');const {omit,...rest}=source;globalThis.result=[Object.hasOwn(rest,'__proto__'),Object.getPrototypeOf(rest)===Object.prototype,rest.marker];`,
  },
  {
    name: 'rest single ownKeys snapshot',
    native: [1, 1],
    babel: [2, 1],
    source: `let calls=0;const source=new Proxy({a:1},{ownKeys(target){calls++;return Reflect.ownKeys(target)}});const {missing,...rest}=source;globalThis.result=[calls,rest.a];`,
  },
  {
    name: 'rest descriptor changes during getters',
    native: false,
    babel: true,
    source: `const source={get a(){Object.defineProperty(source,'b',{enumerable:false});return 1},b:2};const {missing,...rest}=source;globalThis.result=Object.hasOwn(rest,'b');`,
  },
];

function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

// Compare the selected strict object-rest/spread path with its Babel reference.
// Native controls document the discrepancy without requiring stricter helper forks.
describe.each(cases)('$name', entry => {
  test('native control', () => {
    expect(run(entry.source)).toEqual(entry.native);
  });
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let referenceCode: string;
    let code: string;
    beforeAll(() => {
      const reference = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [
          [
            require('@babel/plugin-transform-object-rest-spread'),
            { loose: false, useBuiltIns: false },
          ],
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
      referenceCode = reference!.code!;
      code = compile(entry.source, {
        transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toContain('...');
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
    });
    test('Babel strict-spread reference', () => {
      expect(run(referenceCode)).toEqual(entry.babel);
    });
    test('Noxcturnal follows the Babel object baseline', () => {
      expect(run(code)).toEqual(entry.babel);
    });
  });
});
