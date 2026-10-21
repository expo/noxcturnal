import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'external object identity and getter',
    source:
      'const events=[];const source={get value(){events.push("get");return 3}};const props=<div {...source}/>;globalThis.result=[props===source,events.slice(),props.value,events];',
  },
  {
    name: 'literal getter flattening',
    source:
      'const events=[];const props=<div {...{get value(){events.push("get");return 3}}}/>;globalThis.result=[events.slice(),typeof Object.getOwnPropertyDescriptor(props,"value").get,props.value,events];',
  },
  {
    name: 'literal prototype setter',
    source:
      'const prototype={inherited:3};const props=<div {...{__proto__:prototype,value:4}}/>;globalThis.result=[props.value,props.inherited,Object.hasOwn(props,"__proto__"),Object.getPrototypeOf(props)===prototype];',
  },
  {
    name: 'bound prototype object control',
    source:
      'const prototype={inherited:3};const source={__proto__:prototype,value:4};const props=<div {...source}/>;globalThis.result=[props.value,props.inherited,Object.hasOwn(props,"__proto__"),Object.getPrototypeOf(props)===prototype];',
  },
] as const;
function run(code: string) {
  const context: { result?: unknown } = {};
  new Function('React', 'require', 'globalThis', code)(
    { createElement: (_tag: unknown, props: unknown) => props },
    require,
    context,
  );
  return context.result;
}

for (const [index, entry] of cases.entries()) {
  for (const development of [false, true]) {
    describe(`${entry.name}; development=${development}`, () => {
      const usesHelper = index === 2 || (development && (index === 0 || index === 3));
      const modes = usesHelper ? (['inline', 'runtime'] as const) : (['inline'] as const);
      for (const mode of modes) {
        let actual: unknown;
        let expected: unknown;
        beforeAll(() => {
          const babel = transformSync(entry.source, {
            configFile: false,
            babelrc: false,
            sourceType: 'script',
            filename: 'input.jsx',
            plugins: [
              [
                require(
                  development
                    ? '@babel/plugin-transform-react-jsx-development'
                    : '@babel/plugin-transform-react-jsx',
                ),
                { runtime: 'classic', useBuiltIns: false, useSpread: false },
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
          })!.code!;
          expected =
            index === 0
              ? [!development, development ? ['get'] : [], 3, ['get']]
              : index === 1
                ? [[], 'function', 3, ['get']]
                : index === 2 || !development
                  ? [4, 3, false, true]
                  : [4, undefined, false, false];
          expect(babel).not.toContain('<div');
          expect(run(babel)).toEqual(expected);
          const nox = compile(
            entry.source,
            {
              jsx: development ? 'classic-development' : 'classic',
              helpers: { mode, version: '7.29.7' },
            },
            'input.jsx',
          );
          expect(nox).not.toContain('<div');
          if (usesHelper && index !== 2 && mode === 'runtime')
            expect(nox).toContain('@babel/runtime/helpers/extends');
          else expect(nox).not.toContain('@babel/runtime');
          actual = run(nox);
        });
        test(mode, () => expect(actual).toEqual(expected));
      }
    });
  }
}
