import { transformSync } from '@babel/core';
import transformTypeScript from '@babel/plugin-transform-typescript';
import transformJSX from '@babel/plugin-transform-react-jsx';
import transformParameters from '@babel/plugin-transform-parameters';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';
const dependency =
  'data:text/javascript;base64,' +
  Buffer.from(
    `export const h=(tag)=>tag;export const Fragment='fragment';export const React={createElement:h,Fragment};`,
  ).toString('base64');
const cases = [
  { name: 'custom factory element', fragment: false, pragma: 'h' },
  { name: 'custom factory fragment', fragment: true, pragma: 'h' },
  {
    name: 'custom fragment with standard factory',
    fragment: true,
    pragma: 'React.createElement',
  },
];
for (const directive of [false, true])
  for (const entry of cases)
    for (const prepass of [false, true])
      for (const mode of ['inline', 'runtime'] as const)
        describe(`${entry.name}, directive=${directive}, prepass=${prepass}, ${mode}`, () => {
          const source = `${directive ? `/** @jsx ${entry.pragma} */\n/** @jsxFrag Fragment */\n` : ''}import {h,Fragment,React} from '${dependency}';function identity(value:number=1){return value}export const defaultValue=identity();export const result=${entry.fragment ? '<>text</>' : '<div/>'};`;
          const expected = entry.fragment ? 'fragment' : 'div';
          let actual: unknown;
          beforeAll(async () => {
            const babel = transformSync(source, {
              filename: 'input.tsx',
              configFile: false,
              babelrc: false,
              plugins: [
                [
                  transformTypeScript,
                  {
                    isTSX: true,
                    ...(directive ? {} : { jsxPragma: entry.pragma, jsxPragmaFrag: 'Fragment' }),
                  },
                ],
                [
                  transformJSX,
                  {
                    runtime: 'classic',
                    ...(directive ? {} : { pragma: entry.pragma, pragmaFrag: 'Fragment' }),
                  },
                ],
                ...(prepass ? [transformParameters] : []),
              ],
            })!.code!;
            if (directive) {
              const erased = transformSync(source, {
                filename: 'input.tsx',
                configFile: false,
                babelrc: false,
                plugins: [[transformTypeScript, { isTSX: true }]],
              })!.code!;
              const lowered = transformSync(erased, {
                filename: 'input.jsx',
                configFile: false,
                babelrc: false,
                plugins: [[transformJSX, { runtime: 'classic' }]],
              })!.code!;
              expect((await importCode(lowered)).result).toBe(expected);
            }
            const reference = await importCode(babel);
            expect(reference.result).toBe(expected);
            expect(reference.defaultValue).toBe(1);
            const code = compile(
              source,
              {
                typescript: 'strip',
                transforms: { parameters: prepass },
                jsx: 'classic',
                ...(directive ? {} : { jsxPragma: entry.pragma, jsxPragmaFrag: 'Fragment' }),
                helpers: { mode, version: '7.29.7' },
              },
              'input.tsx',
            );
            expect(code).not.toMatch(/<div|<>/);
            expect(code).not.toContain('@babel/runtime');
            if (prepass) expect(code).not.toMatch(/identity\(value\s*=/);
            const output = await importCode(code);
            expect(output.defaultValue).toBe(1);
            actual = output.result;
          });
          test('retains the factory and fragment imports needed by emitted JSX', () =>
            expect(actual).toBe(expected));
        });

for (const mode of ['inline', 'runtime'] as const) {
  test(`${mode} applies directive precedence and drops unrelated imports in the prepass`, async () => {
    const unused = 'data:text/javascript,throw%20new%20Error("unused%20factory")';
    const source = `/** @jsx h */
/** @jsxFrag Fragment */
import {h, Fragment} from '${dependency}';
import {wrong, WrongFragment} from '${unused}';
function identity(value:number=1){ return value; }
export const result = <>text</>;
export const defaultValue = identity();`;
    const code = compile(
      source,
      {
        typescript: 'strip',
        jsx: 'classic',
        jsxPragma: 'wrong',
        jsxPragmaFrag: 'WrongFragment',
        transforms: { parameters: true },
        helpers: { mode, version: '7.29.7' },
      },
      'input.tsx',
    );
    expect(code).not.toContain(unused);
    expect(await importCode(code)).toMatchObject({ result: 'fragment', defaultValue: 1 });
  });

  test(`${mode} erases an unused fragment import for element-only JSX`, async () => {
    const unused = 'data:text/javascript,throw%20new%20Error("unused%20fragment")';
    const source = `import {h} from '${dependency}'; import {Fragment} from '${unused}';
function identity(value:number=1){return value;}
export const result=<div/>;`;
    const code = compile(
      source,
      {
        typescript: 'strip',
        jsx: 'classic',
        jsxPragma: 'h',
        jsxPragmaFrag: 'Fragment',
        transforms: { parameters: true },
        helpers: { mode, version: '7.29.7' },
      },
      'input.tsx',
    );
    expect(code).not.toContain(unused);
    expect((await importCode(code)).result).toBe('div');
  });
}
