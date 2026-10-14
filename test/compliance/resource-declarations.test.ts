import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { compile } from './runtime';
const require = createRequire(import.meta.url);
const nativeSupported = (() => {
  try {
    new Function('{using r=null;}');
    return true;
  } catch {
    return false;
  }
})();
const cases = [
  ['strict var/function', `var read=2;function read(){return 1}return read`, 2],
  [
    'strict duplicate functions',
    `function read(){return 1}function read(){return 2}return read()`,
    2,
  ],
  ['var before function', `var read=2;function read(){return 1}return read`, 2],
  ['var after function', `function read(){return 1}var read=3;return read`, 3],
  ['early call', `const observed=read();var read;function read(){return 4}return observed`, 4],
  [
    'duplicate functions',
    `const observed=read();function read(){return 1}function read(){return 2}return observed`,
    2,
  ],
  ['recursive outer binding', `var read;function read(n){return n?read(n-1)+1:0}return read(3)`, 3],
  [
    'mutual references',
    `var a,b;function a(n){return n?b(n-1)+1:0}function b(n){return n?a(n-1)+1:0}return a(4)`,
    4,
  ],
  ['resource closure', `var read;function read(){return resource.value}return read`, 'closure'],
  ['nested block var', `{var read=7}function read(){return 1}return read`, 7],
  ['nested loop var', `for(var read=0;read<2;read++){}function read(){return 1}return read`, 2],
  ['nested try var', `try{var read=8}finally{}function read(){return 1}return read`, 8],
  ['parameter and var', `var value=9;function value(){return 1}return value`, 9],
  ['async duplicate', `var read;async function read(){return resource.value}return read()`, 5],
  [
    'generator duplicate',
    `var read;function* read(){yield resource.value}return read().next().value`,
    5,
  ],
] as const;
for (const [name, body, expected] of cases) {
  for (const mode of ['native', 'inline', 'runtime'] as const) {
    test.skipIf(mode === 'native' && !nativeSupported)(`${name}, ${mode}`, async () => {
      const source = `const log=[];globalThis.result=(function(value){${name.startsWith('strict') ? '"use strict";' : ''}using resource={value:5,[Symbol.dispose](){log.push('disposed')}};${body}})(0);globalThis.log=log;`;
      const code =
        mode === 'native'
          ? source
          : compile(source, {
              transforms: { explicitResourceManagement: true },
              helpers: { mode, version: '7.29.7' },
            });
      if (mode !== 'native') expect(code).not.toMatch(/\busing resource/);
      const actual: Record<string, any> = {};
      new Function('globalThis', 'require', code)(actual, require);
      const value = expected === 'closure' ? actual.result() : await actual.result;
      expect(value).toEqual(expected === 'closure' ? 5 : expected);
      expect(actual.log).toEqual(['disposed']);
    });
  }
}

test('resource-only selection still erases the TypeScript input dialect', () => {
  const code = compile(
    'using resource=null;export enum E{A=1}',
    { transforms: { explicitResourceManagement: true } },
    'input.ts',
  );
  expect(code).not.toMatch(/enum E/);
  expect(code).not.toMatch(/using resource/);
});

test.each(['inline', 'runtime'] as const)(
  'TypeScript overload signatures remain erasable, %s',
  mode => {
    const code = compile(
      `function f(){using r=null;function read(x:number):number;function read(x:string):string;function read(x:any){return x}return read(1)}globalThis.result=f();`,
      {
        typescript: 'strip',
        transforms: { explicitResourceManagement: true },
        helpers: { mode, version: '7.29.7' },
      },
      'input.ts',
    );
    expect(code).not.toMatch(/\busing r/);
    const actual: Record<string, unknown> = {};
    new Function('globalThis', 'require', code)(actual, require);
    expect(actual.result).toBe(1);
  },
);
