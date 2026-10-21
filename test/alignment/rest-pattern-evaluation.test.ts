import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import runtime from '@babel/plugin-transform-runtime';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('rest key order', () => {
  const require = createRequire(import.meta.url);
  const configs = [
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ];
  const cases = [
    {
      name: 'binding key after earlier default',
      source:
        'const events=[];const {a=(events.push("a"),1),[(events.push("key"),"b")]:b,...rest}={b:2};globalThis.result=[events,a,b,rest];',
      native: [['a', 'key'], 1, 2, {}],
      strict: [['key', 'a'], 1, 2, {}],
      local: true,
    },
    {
      name: 'assignment key after RHS',
      source:
        'const events=[];let b,rest;({[(events.push("key"),"b")]:b,...rest}=(events.push("rhs"),{b:2}));globalThis.result=[events,b,rest];',
      native: [['rhs', 'key'], 2, {}],
      strict: [['key', 'rhs'], 2, {}],
      local: true,
    },
    {
      name: 'binding key changed by getter',
      source:
        'let key="a";const {[key]:value,...rest}={get a(){key="b";return 1},b:2};globalThis.result=[value,rest];',
      native: [1, { b: 2 }],
      strict: [1, { a: 1 }],
      local: false,
    },
    {
      name: 'assignment key changed by getter',
      source:
        'let key="a",value,rest;({[key]:value,...rest}={get a(){key="b";return 1},b:2});globalThis.result=[value,rest];',
      native: [1, { b: 2 }],
      strict: [1, { a: 1 }],
      local: false,
    },
  ];
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }
  describe.each(configs)('rest keys loose=$loose builtins=$useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
      describe.each(cases)('$name', entry => {
        let actual: unknown;
        beforeAll(() => {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(observe(entry.source)).toEqual(entry.native);
          const reference = transformSync(entry.source, {
            configFile: false,
            babelrc: false,
            sourceType: 'script',
            plugins: [
              [objectRest, config],
              ...(mode === 'runtime'
                ? [[runtime, { version: '7.29.7', useESModules: false }]]
                : []),
            ],
          })!.code!;
          expect(observe(reference)).toEqual(entry.local ? entry.native : entry.strict);
          const code = compile(entry.source, {
            transforms: { objectRestSpread: config },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(code).not.toMatch(/\.\.\.rest/);
          if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
          else expect(code).not.toContain('@babel/runtime');
          actual = observe(code);
          expect(actual).toEqual(entry.native);
        });
        test('preserves local ordering or the adopted shared key baseline', () => {
          expect(actual).toEqual(entry.native);
        });
      });
    });
  });
});

describe('rest source capture', () => {
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
  ])('rest source loose=$loose builtins=$useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
      describe.each(['declaration', 'assignment'] as const)('%s', placement => {
        test.each(['identifier', 'call'] as const)('%s source', shape => {
          const rhs = shape === 'identifier' ? 'source' : 'read()';
          const source = `let calls=0;let source={get a(){source={b:99};return 1},b:2};
          const original=source;function read(){calls++;return source}
          ${placement === 'declaration' ? `const {a,...rest}=${rhs};` : `let a,rest;const result=({a,...rest}=${rhs});`}
          globalThis.result=[a,rest.b,calls${placement === 'assignment' ? ',result===original' : ''}];`;
          const expected = [
            1,
            2,
            shape === 'call' ? 1 : 0,
            ...(placement === 'assignment' ? [true] : []),
          ];
          expect(observe(source)).toEqual(expected);
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
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
          const uncaptured = placement === 'declaration' && shape === 'identifier';
          // CRITERIA.md adopts Babel's declaration-source reread limitation.
          expect(observe(reference)).toEqual(uncaptured ? [1, 99, 0] : expected);
          expect(observe(code)).toEqual(expected);
          if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
          else expect(code).not.toContain('@babel/runtime');
        });
      });
    });
  });
});

describe('rest nested target', () => {
  const require = createRequire(import.meta.url);
  const configs = [
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ];
  const cases = [
    {
      name: 'nested object and outer rest',
      source:
        'let a,inner,outer;({nested:{a,...inner},...outer}={nested:{a:1,b:2},c:3});globalThis.result=[a,inner,outer];',
      expected: [1, { b: 2 }, { c: 3 }],
      strict: [1, { nested: { a: 1, b: 2 }, c: 3 }, { c: 3 }],
    },
    {
      name: 'nested array and outer rest',
      source:
        'let a,inner,outer;({nested:[{a,...inner}],...outer}={nested:[{a:1,b:2}],c:3});globalThis.result=[a,inner,outer];',
      expected: [1, { b: 2 }, { c: 3 }],
      strict: [1, { b: 2 }, { c: 3 }],
    },
    {
      name: 'nested object without outer rest',
      source:
        'let a,inner;({nested:{a,...inner}}={nested:{a:1,b:2},c:3});globalThis.result=[a,inner];',
      expected: [1, { b: 2 }],
      strict: [1, { b: 2 }],
    },
    {
      name: 'consumed nested assignment without outer rest',
      source:
        'let a,inner;const source={nested:{a:1,b:2},c:3};const result=({nested:{a,...inner}}=source);globalThis.result=[result===source,a,inner];',
      expected: [true, 1, { b: 2 }],
      strict: [false, 1, { b: 2 }],
    },
  ];
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }
  describe.each(configs)('nested targets loose=$loose builtins=$useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
      describe.each(cases)('$name', entry => {
        let actual: unknown;
        beforeAll(() => {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(observe(entry.source)).toEqual(entry.expected);
          // The pinned Babel plugin rejects this supported native syntax. It supplies
          // no runtime oracle; record its exact failure rather than adopting it.
          expect(() =>
            transformSync(entry.source, {
              configFile: false,
              babelrc: false,
              plugins: [[objectRest, config]],
            }),
          ).toThrow(/Expected type "RestElement".*"ObjectProperty"/);
          const code = compile(entry.source, {
            transforms: { objectRestSpread: config },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(code).not.toMatch(/\.\.\.(inner|outer)/);
          if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
          else expect(code).not.toContain('@babel/runtime');
          actual = observe(code);
          expect(actual).toEqual(entry.expected);
        });
        test('copies from the nested value and preserves the original RHS result', () =>
          expect(actual).toEqual(entry.expected));
      });
    });
  });
});

describe('rest nested binding', () => {
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
  describe.each(configs)('nested rest loose=$loose builtins=$useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
      describe.each(['object', 'array'])('%s parent pattern', parent => {
        const expected = [1, { z: 2 }, 1];
        let actual: unknown;
        beforeAll(() => {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          const source =
            parent === 'object'
              ? 'const {first:{a,...x},b=a}={first:{a:1,z:2}};globalThis.result=[a,x,b];'
              : 'const [{a,...x},b=a]=[{a:1,z:2}];globalThis.result=[a,x,b];';
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
          if (parent === 'object') expect(observe(reference)).toEqual(expected);
          // Babel also extracts array elements before lowering their nested rest.
          // CRITERIA.md adopts that limitation; object-parent failures are local.
          else expect(() => observe(reference)).toThrow(ReferenceError);
          const code = compile(source, {
            transforms: { objectRestSpread: config },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(code).not.toMatch(/\.\.\.x/);
          if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
          else expect(code).not.toContain('@babel/runtime');
          // Check output parseability before evaluating its runtime behavior.
          new Function('require', 'globalThis', code);
          try {
            actual = observe(code);
          } catch (error) {
            expect(error).toBeInstanceOf(ReferenceError);
            expect((error as Error).message).toMatch(/before initialization/);
            actual = { error: 'ReferenceError' };
          }
        });
        test('matches the classified nested-binding initialization contract', () => {
          expect(actual).toEqual(expected);
        });
      });
    });
  });
});

describe('rest exclusion branches', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }
  const cases = [
    {
      name: 'parameter without exclusions',
      source: `const symbol=Symbol();function f({...rest}){return [rest.a,rest[symbol]]}let error;try{f(null)}catch(e){error=e.name}globalThis.result=[f({a:1,[symbol]:2}),error];`,
      expected: [[1, 2], 'TypeError'],
    },
    {
      name: 'root template key',
      source: 'const {[`a`]:a,...rest}={a:1,b:2};globalThis.result=[a,rest];',
      expected: [1, { b: 2 }],
    },
    {
      name: 'function template key repeated calls',
      source:
        'function f(source){const {[`a`]:a,...rest}=source;return [a,rest]}globalThis.result=[f({a:1,b:2}),f({a:3,c:4})];',
      expected: [
        [1, { b: 2 }],
        [3, { c: 4 }],
      ],
    },
    ...(['var', 'let'] as const).map(kind => ({
      name: `classic for ${kind} initializer`,
      source: `const events=[],callbacks=[];for(${kind} {[(events.push('key'),'a')]:a=(events.push('default'),1),...rest}={b:2};a<3;a++){callbacks.push(()=>[a,rest.b])}globalThis.result=[events,callbacks.map(f=>f())];`,
      expected: [
        ['key', 'default'],
        kind === 'var'
          ? [
              [3, 2],
              [3, 2],
            ]
          : [
              [1, 2],
              [2, 2],
            ],
      ],
    })),
  ];
  describe.each([
    { loose: false, useBuiltIns: false },
    { loose: false, useBuiltIns: true },
    { loose: true, useBuiltIns: false },
    { loose: true, useBuiltIns: true },
  ])('rest exclusions $loose $useBuiltIns', config => {
    describe.each(['inline', 'runtime'] as const)('%s', mode => {
      test.each(cases)('$name', fixture => {
        expect(observe(fixture.source)).toEqual(fixture.expected);
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
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        expect(observe(reference)).toEqual(fixture.expected);
        expect(observe(code)).toEqual(fixture.expected);
      });
    });
  });
});
