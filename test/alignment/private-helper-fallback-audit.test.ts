import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
function observe(code: string, module: boolean, missingRequire = false) {
  const child = spawnSync(
    process.execPath,
    [
      `--input-type=${module ? 'module' : 'commonjs'}`,
      '-e',
      `${code}\nconsole.log(JSON.stringify(globalThis.result));`,
    ],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 10_000 },
  );
  expect(child.error).toBeUndefined();
  expect(child.signal).toBeNull();
  if (missingRequire) {
    expect(child.status).toBe(1);
    expect(child.stderr).toContain('ReferenceError: require is not defined in ES module scope');
    return { error: 'ReferenceError' };
  }
  expect(child.status, child.stderr).toBe(0);
  return JSON.parse(child.stdout);
}

for (const module of [false, true]) {
  for (const version of ['inline', '7.0.0-alpha.1', '7.0.0-beta.0', '7.29.7', '8.0.0']) {
    describe(`private read/write/call: ESM=${module}, helpers=${version}`, () => {
      const importsBase = version === '7.0.0-beta.0' || version === '7.29.7';
      const fails = module && importsBase;
      let actual: unknown;
      beforeAll(() => {
        const source = `${module ? 'export {};' : ''}class C{#value=1;#method(x){return this.#value+x}get #accessor(){return this.#value}set #accessor(v){this.#value=v}run(){const before=this.#accessor;this.#accessor=2;return [before,this.#value,this.#method(3)]}}globalThis.result=new C().run();`;
        expect(observe(source, module)).toEqual([1, 2, 5]);
        const reference = transformSync(source, {
          configFile: false,
          babelrc: false,
          sourceType: module ? 'module' : 'script',
          plugins: [
            [require('@babel/plugin-transform-private-methods'), { loose: true }],
            [require('@babel/plugin-transform-class-properties'), { loose: true }],
            ...(importsBase
              ? [[require('@babel/plugin-transform-runtime'), { version, useESModules: module }]]
              : []),
          ],
        })!.code!;
        expect(observe(reference, module)).toEqual([1, 2, 5]);
        const code = compile(
          source,
          {
            transforms: { privateMethods: true, classProperties: { loose: true } },
            helpers:
              version === 'inline'
                ? { mode: 'inline' }
                : { mode: 'runtime', moduleName: '@babel/runtime', version },
          },
          module ? 'input.mjs' : 'input.cjs',
        );
        expect(code).not.toMatch(/#(?:value|method|accessor)\b/);
        expect(code.includes('@babel/runtime/helpers/classPrivateFieldLooseBase')).toBe(
          importsBase,
        );
        actual = observe(code, module, fails);
      });
      (fails ? test.fails : test)(
        'preserves private accessor and call behavior across helper fallback',
        () => expect(actual).toEqual([1, 2, 5]),
      );
    });
  }
}

for (const isStatic of [false, true]) {
  for (const module of [false, true]) {
    for (const version of ['inline', '7.20.4', '7.20.5', '7.29.7', '8.0.0']) {
      describe(`private in: static=${isStatic}, ESM=${module}, helpers=${version}`, () => {
        const importsCheck = version === '7.20.5' || version === '7.29.7';
        const fails = module && importsCheck;
        const expected = [
          [...Array(8).fill('TypeError'), true, false, false, false, false, false],
          14,
          0,
        ];
        let actual: unknown;
        beforeAll(() => {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          const source = `${module ? 'export {};' : ''}let effects=0,coercions=0;class C{${isStatic ? 'static ' : ''}#value=1;static has(v){return #value in v}}const branded=${isStatic ? 'C' : 'new C()'};const inherited=${isStatic ? 'class extends C{}' : 'Object.create(branded)'};const values=[null,undefined,false,0,NaN,1n,'text',Symbol(),branded,{},inherited,()=>{},Object(3),{[Symbol.toPrimitive](){coercions++;return 1}}];const results=values.map(value=>{try{return C.has((effects++,value))}catch(error){return error.name}});globalThis.result=[results,effects,coercions];`;
          expect(observe(source, module)).toEqual(expected);
          const reference = transformSync(source, {
            configFile: false,
            babelrc: false,
            sourceType: module ? 'module' : 'script',
            plugins: [
              [require('@babel/plugin-transform-private-property-in-object'), { loose: true }],
              [require('@babel/plugin-transform-class-properties'), { loose: true }],
              ...(version !== 'inline' && version !== '8.0.0'
                ? [[require('@babel/plugin-transform-runtime'), { version, useESModules: module }]]
                : []),
            ],
          })!.code!;
          expect(observe(reference, module)).toEqual(expected);
          const code = compile(
            source,
            {
              transforms: { privatePropertyInObject: true, classProperties: { loose: true } },
              helpers:
                version === 'inline'
                  ? { mode: 'inline' }
                  : { mode: 'runtime', moduleName: '@babel/runtime', version },
            },
            module ? 'input.mjs' : 'input.cjs',
          );
          expect(code).not.toMatch(/#value\b/);
          expect(code.includes('@babel/runtime/helpers/checkInRHS')).toBe(importsCheck);
          actual = observe(code, module, fails);
        });
        (fails ? test.fails : test)('preserves brand and RHS checks across helper fallback', () =>
          expect(actual).toEqual(expected),
        );
      });
    }
  }
}
