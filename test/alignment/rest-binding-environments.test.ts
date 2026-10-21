import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import parameters from '@babel/plugin-transform-parameters';

describe('rest parameter scope', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', `return (function(){${code}})()`)(require, context);
    return context.result;
  }
  describe.each([
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ])('rest parameter $loose $useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s', mode => {
      describe.each(['function', 'concise arrow', 'block arrow', 'method'])('%s', shape => {
        describe.each([false, true])('delayed default=%s', delayed => {
          let actual: unknown;
          beforeAll(() => {
            const params = `{a,...rest},read=${delayed ? '()=>a' : 'a'}`;
            const value = `[${delayed ? 'read()' : 'read'},a,rest]`;
            const definitions = {
              function: `function f(${params}){return ${value}}`,
              'concise arrow': `const f=(${params})=>${value};`,
              'block arrow': `const f=(${params})=>{return ${value}};`,
              method: `const object={f(${params}){return ${value}}};const f=object.f;`,
            };
            const source = `const a=99;${definitions[shape as keyof typeof definitions]}globalThis.result=f({a:1,b:2});`;
            const reference = transformSync(source, {
              babelrc: false,
              configFile: false,
              sourceType: 'script',
              plugins: [
                [objectRest, config],
                ...(mode === 'runtime'
                  ? [[runtime, { version: '7.29.7', useESModules: false }]]
                  : []),
              ],
            })!.code!;
            const code = compile(source, {
              transforms: { objectRestSpread: config },
              helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
            });
            expect(code).not.toContain('...rest');
            expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
            expect(observe(source)).toEqual([1, 1, { b: 2 }]);
            expect(observe(reference)).toEqual([delayed ? 99 : 1, 1, { b: 2 }]);
            actual = observe(code);
            expect(actual).toEqual([1, 1, { b: 2 }]);
            if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
            else expect(code).not.toContain('@babel/runtime');
          });
          test('resolves the later default under the classified parameter contract', () => {
            expect(actual).toEqual([1, 1, { b: 2 }]);
          });
        });
      });
    });
  });
});

describe('rest parameter redeclaration', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }
  describe.each([
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ])('rest redeclaration $loose $useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s', mode => {
      describe.each(['function', 'arrow'])('%s', shape => {
        test.each([false, true])('parameters selected=%s', combined => {
          const body = 'var a;var rest;return [a,rest];';
          const source = `${shape === 'function' ? `function f({a,...rest}){${body}}` : `const f=({a,...rest})=>{${body}};`}globalThis.result=f({a:1,b:2});`;
          const reference = transformSync(source, {
            babelrc: false,
            configFile: false,
            sourceType: 'script',
            plugins: [
              ...(combined ? [parameters] : []),
              [objectRest, config],
              ...(mode === 'runtime'
                ? [[runtime, { version: '7.29.7', useESModules: false }]]
                : []),
            ],
          })!.code!;
          const code = compile(source, {
            transforms: { objectRestSpread: config, ...(combined ? { parameters: true } : {}) },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(observe(source)).toEqual([1, { b: 2 }]);
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(code).not.toContain('...rest');
          if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
          else expect(code).not.toContain('@babel/runtime');
          if (combined) {
            expect(observe(reference)).toEqual([1, { b: 2 }]);
            expect(observe(code)).toEqual([1, { b: 2 }]);
          } else {
            expect(observe(code)).toEqual([1, { b: 2 }]);
            // Babel's standalone rest lowering retains its redeclaration limitation.
            for (const output of [reference]) {
              expect(() => observe(output)).toThrow(SyntaxError);
              expect(() => observe(output)).toThrow(/Identifier 'a' has already been declared/);
            }
          }
        });
      });
    });
  });
});

describe('rest default pattern', () => {
  const require = createRequire(import.meta.url);
  const configs = [
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ];
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }

  describe.each(configs)('rest defaults loose=$loose builtins=$useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
      describe.each(['object', 'array', 'loop', 'catch'] as const)('%s binding', placement => {
        test.each(['undefined', 'present', 'null'] as const)('%s input', input => {
          const value = input === 'present' ? '{a:3,z:4}' : input;
          const pattern = '{a,...rest}=(events.push("default"),{a:1,z:2})';
          const result = 'globalThis.result=[events,a,rest];';
          const binding = {
            object: `const {item:${pattern}}={item:${value}};${result}`,
            array: `const [${pattern}]=[${value}];${result}`,
            loop: `for(const [${pattern}] of [[${value}]]){${result}}`,
            catch: `try{throw [${value}]}catch([${pattern}]){${result}}`,
          }[placement];
          const source = `const events=[];try{${binding}}catch(error){globalThis.result=[events,error.name]}`;
          const expected =
            input === 'null'
              ? [[], 'TypeError']
              : input === 'present'
                ? [[], 3, { z: 4 }]
                : [['default'], 1, { z: 2 }];
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(observe(source)).toEqual(expected);
          const reference = transformSync(source, {
            babelrc: false,
            configFile: false,
            sourceType: 'script',
            plugins: [
              [objectRest, config],
              ...(mode === 'runtime'
                ? [[runtime, { version: '7.29.7', useESModules: false }]]
                : []),
            ],
          })!.code!;
          // Babel copies the original undefined property instead of its default.
          expect(observe(reference)).toEqual(
            placement === 'object' && input === 'undefined' ? [['default'], 1, {}] : expected,
          );
          const code = compile(source, {
            transforms: { objectRestSpread: config },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(code).not.toMatch(/\.\.\.rest/);
          if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
          else expect(code).not.toContain('@babel/runtime');
          expect(observe(code)).toEqual(expected);
        });
      });
    });
  });
});

describe('rest initializer', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }
  const cases = [
    {
      name: 'parameter',
      shared: true,
      source: `let a,rest;function f(n,result=({a,...rest}={get a(){if(n)f(0);return n},b:n})){return [result.b,rest.b]}globalThis.result=f(1);`,
    },
    {
      name: 'field',
      shared: true,
      source: `let a,rest;let outer=true;class C{result=({a,...rest}={get a(){if(outer){outer=false;new C()}return 1},b:outer?1:0});}const value=new C();globalThis.result=[value.result.b,rest.b];`,
    },
    {
      name: 'function body',
      shared: false,
      source: `let a,rest;function f(n){const result=({a,...rest}={get a(){if(n)f(0);return n},b:n});return [result.b,rest.b]}globalThis.result=f(1);`,
    },
    {
      name: 'constructor body',
      shared: false,
      source: `let a,rest;let outer=true;class C{constructor(){this.result=({a,...rest}={get a(){if(outer){outer=false;new C()}return 1},b:outer?1:0});}}const value=new C();globalThis.result=[value.result.b,rest.b];`,
    },
  ];
  describe.each([
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ])('rest initializer $loose $useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s', mode => {
      test.each(cases)('$name', fixture => {
        const reference = transformSync(fixture.source, {
          babelrc: false,
          configFile: false,
          sourceType: 'script',
          plugins: [
            [objectRest, config],
            ...(mode === 'runtime' ? [[runtime, { version: '7.29.7', useESModules: false }]] : []),
          ],
        })!.code!;
        const code = compile(fixture.source, {
          transforms: { objectRestSpread: config },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(code).not.toContain('...rest');
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        expect(observe(fixture.source)).toEqual([1, 1]);
        // Babel and Noxcturnal share outer temporaries for these initializer contexts.
        const expected = fixture.shared ? [0, 0] : [1, 1];
        expect(observe(reference)).toEqual(expected);
        expect(observe(code)).toEqual(expected);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
      });
    });
  });
});

describe('rest assignment default', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }
  describe.each([
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ])('rest assignment default $loose $useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s', mode => {
      describe.each(['undefined', 'present', 'null', 'member'])('%s', input => {
        const expected =
          input === 'null'
            ? ['TypeError', 0]
            : input === 'member'
              ? [['target', 'get', 'set'], { b: 2 }, true]
              : [
                  input === 'present' ? 3 : 1,
                  { b: input === 'present' ? 4 : 2 },
                  input === 'present' ? 0 : 1,
                  true,
                ];
        let actual: unknown;
        beforeAll(() => {
          const source =
            input === 'member'
              ? `const events=[];let copied;const sink={set rest(value){events.push('set');copied=value}};function target(){events.push('target');return sink}const source={get b(){events.push('get');return 2}};const result=({...target().rest}=source);globalThis.result=[events,copied,result===source];`
              : `let a,rest,calls=0;function fallback(){calls++;return {a:1,b:2}}const source={item:${input === 'present' ? '{a:3,b:4}' : input}};try{const result=({item:{a,...rest}=fallback()}=source);globalThis.result=[a,rest,calls,result===source]}catch(error){globalThis.result=[error.name,calls]}`;
          const reference = () =>
            transformSync(source, {
              babelrc: false,
              configFile: false,
              sourceType: 'script',
              plugins: [[objectRest, config]],
            })!.code!;
          if (input === 'member') expect(observe(reference())).toEqual(expected);
          else expect(reference).toThrow(/Expected type "RestElement".*"ObjectProperty"/);
          const code = compile(source, {
            transforms: { objectRestSpread: config },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(code).not.toMatch(/\.\.\.(rest|target)/);
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(observe(source)).toEqual(expected);
          if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
          else expect(code).not.toContain('@babel/runtime');
          actual = observe(code);
          expect(actual).toEqual(expected);
        });
        test('preserves default selection, destination order and assignment identity', () => {
          expect(actual).toEqual(expected);
        });
      });
    });
  });
});
