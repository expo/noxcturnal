import { transformSync } from '@babel/core';
import logical from '@babel/plugin-transform-logical-assignment-operators';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import nullish from '@babel/plugin-transform-nullish-coalescing-operator';
import { defineNativePipeline, transform } from '../../js';
import { createRequire } from 'node:module';

describe('private logical abrupt', () => {
  const cases = [
    {
      name: 'wrong-brand receiver before RHS',
      operator: '||=',
      receiver: '{}',
      getter: 'return 0;',
      setter: '',
      expected: ['receiver', 'TypeError'],
    },
    {
      name: 'throwing getter before RHS',
      operator: '&&=',
      receiver: 'this',
      getter: "events.push('get'); throw marker;",
      setter: '',
      expected: ['receiver', 'get', 'sentinel'],
    },
    {
      name: 'throwing setter after RHS',
      operator: '??=',
      receiver: 'this',
      getter: "events.push('get'); return null;",
      setter: "events.push('set'); throw marker;",
      expected: ['receiver', 'get', 'rhs', 'set', 'sentinel'],
    },
  ];
  describe.each(cases)(
    'private logical assignment: $name',
    ({ operator, receiver, getter, setter, expected }) => {
      test('preserves abrupt-completion order without class lowering', () => {
        const source = `
      const events = [], marker = {};
      class C {
        get #value() { ${getter} }
        set #value(value) { ${setter} }
        self() { events.push('receiver'); return ${receiver}; }
        update() { return this.self().#value ${operator} (events.push('rhs'), 3); }
      }
      try { new C().update(); }
      catch (error) { events.push(error === marker ? 'sentinel' : error.name); }
      globalThis.result = events;
    `;
        const observe = (code: string) => {
          const context: Record<string, unknown> = {};
          new Function('globalThis', code)(context);
          return context.result;
        };
        expect(observe(source)).toEqual(expected);
        const babel = transformSync(source, {
          configFile: false,
          babelrc: false,
          plugins: [logical],
        })!.code!;
        expect(observe(babel)).toEqual(expected);
        const code = compile(source, { transforms: { logicalAssignmentOperators: true } });
        expect(code).not.toMatch(/(?:\|\|=|&&=|\?\?=)/);
        expect(code).not.toContain('@babel/runtime');
        expect(observe(code)).toEqual(expected);
      });
    },
  );
});

describe('private logical name', () => {
  describe.each([false, true])('private logical temporary, declared binding=%s', declared => {
    let actual: unknown;
    beforeAll(() => {
      const source = `
      ${declared ? 'const _private = 99;' : ''}
      class C {
        #x = 0;
        self() { return this; }
        read() { return [this.self().#x ||= 3, _private === 99]; }
      }
      globalThis.result = new C().read();
    `;
      const nox = compile(source, { transforms: { logicalAssignmentOperators: true } });
      const babel = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [logical],
      })!.code!;
      const observe = (code: string) => {
        const context: Record<string, unknown> = {};
        if (declared) new Function('globalThis', code)(context);
        else new Function('_private', 'globalThis', code)(99, context);
        return context.result;
      };
      expect(observe(source)).toEqual([3, true]);
      expect(observe(babel)).toEqual([3, true]);
      expect(nox).not.toContain('||=');
      expect(nox).not.toContain('@babel/runtime');
      actual = observe(nox);
    });
    test('does not capture an existing reference with a generated temporary', () => {
      expect(actual).toEqual([3, true]);
    });
  });
});

describe('private nullish composition', () => {
  describe.each([false, true])('private nullish completion, separate phases=%s', separated => {
    let code: string;
    beforeAll(() => {
      const source = `
      class C { #x = null; read() { return this.#x ??= 3; } }
      const instance = new C();
      globalThis.result = [instance.read(), instance.read()];
    `;
      if (separated) {
        const result = transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              { name: 'logical', native: { transforms: { logicalAssignmentOperators: true } } },
              {
                name: 'nullish',
                native: { transforms: { nullishCoalescingOperator: { loose: false } } },
              },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error(result.reason);
        code = result.code;
      } else {
        code = compile(source, {
          transforms: {
            logicalAssignmentOperators: true,
            nullishCoalescingOperator: { loose: false },
          },
        });
      }
      const babel = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [logical, [nullish, { loose: false }]],
      })!.code!;
      const observe = (output: string) => {
        const context: Record<string, unknown> = {};
        new Function('globalThis', output)(context);
        return context.result;
      };
      expect(observe(source)).toEqual([3, 3]);
      expect(observe(babel)).toEqual([3, 3]);
      expect(observe(code)).toEqual([3, 3]);
      expect(babel).not.toContain('??');
      expect(code).not.toContain('??=');
      expect(code).not.toContain('@babel/runtime');
    });
    test('removes nullish syntax created by private assignment completion', () => {
      expect(code).not.toContain('??');
    });
  });
});

describe('private update', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'optional private read skips nullish receivers',
      expected: [undefined, undefined, 3],
      source: `class Value{#value=3;static read(object){return object?.#value}}globalThis.result=[Value.read(null),Value.read(undefined),Value.read(new Value())];`,
    },
    {
      name: 'optional private receiver skips call arguments',
      expected: [undefined, undefined, 3, ['arg']],
      source: `const events=[];class Value{#value=()=>3;static read(object){return object?.#value(events.push('arg'))}}globalThis.result=[Value.read(null),Value.read(undefined),Value.read(new Value()),events];`,
    },
  ];

  function run(code: string) {
    const context: Record<string, unknown> = {};
    try {
      new Function('require', 'globalThis', code)(require, context);
    } catch (error) {
      return { error: (error as Error).name };
    }
    return context.result;
  }

  // Loose private storage is the selected reference; classes remain strict.
  // Compile before test.fails so transformation errors cannot satisfy a regression.
  describe.each(cases)('$name', entry => {
    test('native control', () => {
      expect(run(entry.source)).toEqual(entry.expected);
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
            [require('@babel/plugin-transform-class-properties'), { loose: true }],
            [require('@babel/plugin-transform-private-methods'), { loose: true }],
            [require('@babel/plugin-transform-private-property-in-object'), { loose: true }],
            [require('@babel/plugin-transform-classes'), {}],
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
          transforms: { classes: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        const classSyntax = /\bclass\s+(?:Value|Example|Base|Child|Other|Stamp)\b|\bclass\s*\{/;
        expect(entry.source).toMatch(classSyntax);
        expect(referenceCode).not.toMatch(classSyntax);
        expect(referenceCode).not.toContain('#value');
        expect(code).not.toMatch(classSyntax);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('require(');
      });
      test('Babel loose-private reference', () => {
        expect(run(referenceCode)).toEqual(entry.expected);
      });
      const check = test;
      check('Noxcturnal follows the Babel loose-private baseline', () => {
        expect(run(code)).toEqual(entry.expected);
      });
    });
  });
});

describe('nested private', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'computed key closure retains private environment',
      expected: 3,
      source: `let read;class Value{#value=3;[(read=object=>object.#value,'key')](){}}globalThis.result=read(new Value());`,
    },
  ];

  function run(code: string) {
    const context: Record<string, unknown> = {};
    try {
      new Function('require', 'globalThis', code)(require, context);
    } catch (error) {
      return { error: (error as Error).name };
    }
    return context.result;
  }

  // Loose private storage is the selected reference; classes remain strict.
  // Compile before test.fails so transformation errors cannot satisfy a regression.
  describe.each(cases)('$name', entry => {
    test('native control', () => {
      expect(run(entry.source)).toEqual(entry.expected);
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
            [require('@babel/plugin-transform-class-static-block'), {}],
            [require('@babel/plugin-transform-class-properties'), { loose: true }],
            [require('@babel/plugin-transform-private-methods'), { loose: true }],
            [require('@babel/plugin-transform-private-property-in-object'), { loose: true }],
            [require('@babel/plugin-transform-classes'), {}],
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
          transforms: { classes: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        const classSyntax =
          /\bclass\s+(?:Value|Example|Base|Child|Other|Stamp|Inner)\b|\bclass\s*\{|#(?:value|method|field)\b/;
        expect(entry.source).toMatch(classSyntax);
        expect(referenceCode).not.toMatch(classSyntax);
        expect(code).not.toMatch(classSyntax);
        if (mode === 'runtime') {
          expect(code).toContain('@babel/runtime/helpers/');
        }
      });
      test('Babel loose-private reference', () => {
        expect(run(referenceCode)).toEqual(entry.expected);
      });
      const check = test;
      check('Noxcturnal follows the Babel loose-private baseline', () => {
        expect(run(code)).toEqual(entry.expected);
      });
    });
  });
});
