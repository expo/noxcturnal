import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
async function run(code: string) {
  const context: Record<string, unknown> = {};
  try {
    new Function('require', 'globalThis', code)(require, context);
  } catch (e) {
    return ['sync', (e as Error).name];
  }
  try {
    return ['ok', await context.result];
  } catch (e) {
    return ['reject', (e as Error).name];
  }
}
const cases = [
  ['var', 'a=1', 'var a; return a;'],
  ['closure', 'a=()=>a', 'var a; return a()===a;'],
  ['throw', 'a=(()=>{throw new RangeError()})()', 'return a;'],
  ['tdz', 'a=b,b=1', 'return a;'],
  ['body', 'a=()=>typeof b', 'var b=1; return a();'],
  ['arguments', 'a=arguments[1]', 'return a;'],
];
for (const kind of ['declaration', 'arrow', 'object', 'class'])
  for (const [name, params, body] of cases)
    test.each(['inline', 'runtime'] as const)(`${kind} ${name}, %s`, async mode => {
      const definition =
        kind === 'declaration'
          ? `async function read(${params}){${body}}`
          : kind === 'arrow'
            ? `const read=async(${params})=>{${body}};`
            : kind === 'object'
              ? `const owner={async read(${params}){${body}}}; const read=()=>owner.read(undefined,7);`
              : `class C{async read(${params}){${body}}} const read=()=>new C().read(undefined,7);`;
      const source =
        '(function(){' +
        definition +
        ' globalThis.result=read(undefined,7);}).call(null,undefined,9);';
      const native = await run(source);
      const expected: Record<string, unknown> = {
        var: ['ok', 1],
        closure: ['ok', true],
        throw: ['reject', 'RangeError'],
        tdz: ['reject', 'ReferenceError'],
        body: ['ok', 'undefined'],
        arguments: ['ok', kind === 'arrow' ? 9 : 7],
      };
      expect(native).toEqual(expected[name]);
      const babel = await run(
        transformSync(source, {
          babelrc: false,
          configFile: false,
          sourceType: 'script',
          plugins: [
            require('@babel/plugin-transform-parameters'),
            require('@babel/plugin-transform-async-to-generator'),
            ...(mode === 'runtime'
              ? [
                  [
                    require('@babel/plugin-transform-runtime'),
                    { version: '7.29.7', useESModules: false },
                  ],
                ]
              : []),
          ],
        })!.code!,
      );
      expect(babel).toEqual(native);
      const code = compile(source, {
        transforms: { asyncFunctions: true, parameters: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s*(?:function|read|\()/);
      expect(code).not.toMatch(/\(\s*a\s*=(?!=)/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await run(code)).toEqual(native);
    });
