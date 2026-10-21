import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'for-of parameter Symbol',
    expected: [1, 2],
    bothFail: false,
    key: 'forOf',
    plugins: ['for-of'],
    source: `function read(Symbol){const out=[];for(const x of [1,2])out.push(x);return out}globalThis.result=read(null);`,
  },
  {
    name: 'class parameter Object',
    expected: 1,
    bothFail: true,
    key: 'classes',
    plugins: ['classes'],
    source: `function read(Object){class Value{method(){return 1}}return new Value().method()}globalThis.result=read(null);`,
  },
  {
    name: 'spread lexical Object',
    expected: 1,
    bothFail: false,
    key: 'objectRestSpread',
    plugins: ['object-rest-spread'],
    source: `const Object=null;globalThis.result={...{value:1}}.value;`,
  },
  {
    name: 'destructuring lexical Array',
    expected: 1,
    bothFail: false,
    key: 'destructuring',
    plugins: ['destructuring'],
    source: `const Array=null;const [value]=[1];globalThis.result=value;`,
  },
  {
    name: 'rest lexical Object',
    expected: 2,
    bothFail: false,
    key: 'destructuring',
    plugins: ['destructuring'],
    source: `const Object=null;const {a,...rest}={a:1,b:2};globalThis.result=rest.b;`,
  },
];

function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each(cases)('$name', entry => {
  test('native control', () => expect(run(entry.source)).toEqual(entry.expected));
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let code: string;
    let reference: string;
    beforeAll(() => {
      code = compile(entry.source, {
        transforms: {
          [entry.key]:
            entry.key === 'objectRestSpread' ? { loose: false, useBuiltIns: false } : true,
        },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      reference = transformSync(entry.source, {
        babelrc: false,
        configFile: false,
        sourceType: 'script',
        plugins: [
          ...entry.plugins.map(p => require('@babel/plugin-transform-' + p)),
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
      const syntax =
        entry.key === 'forOf'
          ? /for\s*\([^)]*\bof\b/
          : entry.key === 'classes'
            ? /\bclass\s+Value\b/
            : entry.key === 'objectRestSpread'
              ? /\.\.\./
              : /const\s*[\[{]/;
      expect(entry.source).toMatch(syntax);
      expect(code).not.toMatch(syntax);
      expect(reference).not.toMatch(syntax);
      if (!entry.bothFail && mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      if (mode === 'inline') expect(code).not.toContain('require(');
    });
    test('Babel preserves intrinsic resolution', () =>
      expect(run(reference)).toEqual(entry.expected));
    const check = entry.bothFail ? test.fails : test;
    check('Noxcturnal preserves intrinsic resolution', () =>
      expect(run(code)).toEqual(entry.expected),
    );
  });
});
