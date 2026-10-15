import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const logical = require('@babel/plugin-transform-logical-assignment-operators');
const nullish = require('@babel/plugin-transform-nullish-coalescing-operator');
const observe = (code: string) => runInNewContext(code, { require }, { timeout: 1000 });
const operators = [
  { operator: '||=', initial: '0', skip: '4' },
  { operator: '&&=', initial: '4', skip: '0' },
  { operator: '??=', initial: 'undefined', skip: '0' },
];

// Cover each selection path independently: classes can consume private operations
// before logical lowering, while standalone logical lowering retains native classes.
describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
  describe.each([false, true])('class lowering=%s', classes => {
    test.each(operators)(
      '$operator retains a mutable private receiver across getter and RHS',
      entry => {
        const source = `
        const events = []; let receiver;
        class C {
          constructor(name) { this.name = name; }
          get #value() { events.push(['get', this.name]); receiver = second; return ${entry.initial}; }
          set #value(value) { events.push(['set', this.name, value]); }
          static run() { return receiver.#value ${entry.operator} (events.push('rhs'), receiver = third, 7); }
        }
        const first = new C('first'), second = new C('second'), third = new C('third');
        receiver = first;
        globalThis.result = [C.run(), events];
      `;
        const expected = [7, [['get', 'first'], 'rhs', ['set', 'first', 7]]];
        const plugins = [
          logical,
          [nullish, { loose: false }],
          ...(classes
            ? [
                [require('@babel/plugin-transform-class-properties'), { loose: true }],
                [require('@babel/plugin-transform-private-methods'), { loose: true }],
                require('@babel/plugin-transform-classes'),
              ]
            : []),
        ];
        expect(observe(source)).toEqual(expected);
        const babel = transformSync(source, { configFile: false, babelrc: false, plugins })!.code!;
        expect(observe(babel)).toEqual(expected);
        const code = compile(source, {
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          transforms: {
            logicalAssignmentOperators: true,
            nullishCoalescingOperator: { loose: false },
            ...(classes ? { classes: true } : {}),
          },
        });
        expect(code).not.toMatch(/\|\|=|&&=|\?\?/);
        expect(observe(code)).toEqual(expected);
      },
    );
  });
});

describe.each([false, true])('private nullish loose=%s', loose => {
  test.each(['null', 'undefined', 'false', '0', "''", '7'])(
    'reads %s once and completes selected nullish syntax',
    initial => {
      const source = `
      const events = [];
      class C {
        get #value() { events.push('get'); return ${initial}; }
        set #value(value) { events.push(['set', value]); }
        run() { return this.#value ??= (events.push('rhs'), 3); }
      }
      globalThis.result = [new C().run(), events];
    `;
      const expected = observe(source);
      const babel = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [logical, [nullish, { loose }]],
      })!.code!;
      expect(observe(babel)).toEqual(expected);
      const code = compile(source, {
        transforms: { logicalAssignmentOperators: true, nullishCoalescingOperator: { loose } },
      });
      expect(code).not.toContain('??');
      expect(observe(code)).toEqual(expected);
    },
  );
});

test('semantic temporary allocation reserves external names, suffixes and escaped references', () => {
  const source = String.raw`
    class C { #x = 0; self() { return this; }
      run() { return [this.self().#x ||= 3, _private, _this$self, _this$self2, _this$\u0073elf3]; }
    }
    globalThis.result = new C().run();
  `;
  const bindings = { _private: 11, _this$self: 12, _this$self2: 13, _this$self3: 14 };
  const code = compile(source, { transforms: { logicalAssignmentOperators: true } });
  expect(code).not.toContain('||=');
  expect(runInNewContext(code, bindings)).toEqual([3, 11, 12, 13, 14]);
});

describe.each(operators)('regexp $operator identity', ({ operator, initial, skip }) => {
  test.each([false, true])('computed key=%s', computed => {
    const source = `
      let receiver; const events = [];
      Object.defineProperty(RegExp.prototype, 'value', {
        get() { receiver = this; events.push('get'); return ${initial}; },
        set(value) { events.push([this === receiver, value]); },
      });
      globalThis.result = [/x/${computed ? "['value']" : '.value'} ${operator} 3, events];
    `;
    const expected = [3, ['get', [true, 3]]];
    expect(observe(source)).toEqual(expected);
    const code = compile(source, { transforms: { logicalAssignmentOperators: true } });
    expect(code).not.toMatch(/\|\|=|&&=|\?\?=/);
    expect(observe(code)).toEqual(expected);
  });
  test('retains branch short circuit without setter or RHS', () => {
    const source = `
      const events = [];
      Object.defineProperty(RegExp.prototype, 'value', {
        get() { events.push('get'); return ${skip}; },
        set() { events.push('set'); },
      });
      /x/.value ${operator} events.push('rhs'); globalThis.result = events;
    `;
    expect(observe(compile(source, { transforms: { logicalAssignmentOperators: true } }))).toEqual([
      'get',
    ]);
  });
});

test('regexp computed keys keep their identity across repeated coercion', () => {
  const source = `
    let first; const events = [];
    RegExp.prototype.toString = function() { events.push(first ? first === this : true); first = this; return 'value'; };
    const object = { value: 0 }; object[/key/] ||= 3;
    globalThis.result = [object.value, events];
  `;
  expect(observe(source)).toEqual([3, [true, true]]);
  expect(observe(compile(source, { transforms: { logicalAssignmentOperators: true } }))).toEqual([
    3,
    [true, true],
  ]);
});

test('adjacent optional-call and exponentiation paths preserve regexp receiver identity', () => {
  const source = `
    let receiver; const events = [];
    Object.defineProperty(RegExp.prototype, 'method', {
      get() { receiver = this; return function() { events.push(this === receiver); }; },
    });
    Object.defineProperty(RegExp.prototype, 'value', {
      get() { receiver = this; return 2; },
      set(value) { events.push(this === receiver, value); },
    });
    /x/.method?.(); /x/.value **= 3; globalThis.result = events;
  `;
  expect(observe(source)).toEqual([true, true, 8]);
  const code = compile(source, {
    transforms: { optionalChaining: { loose: false }, exponentiationOperator: true },
  });
  expect(code).not.toMatch(/\?\.|\*\*/);
  expect(observe(code)).toEqual([true, true, 8]);
});

describe.each(operators)('native private readonly $operator', ({ operator, initial, skip }) => {
  test.each([false, true])('short circuit=%s', shortCircuit => {
    const source = `
      const events = [];
      class C {
        get #value() { events.push('get'); return ${shortCircuit ? skip : initial}; }
        run() { try { this.#value ${operator} (events.push('rhs'), 3); } catch (error) { events.push(error.name); } }
      }
      new C().run(); globalThis.result = events;
    `;
    const expected = shortCircuit ? ['get'] : ['get', 'rhs', 'TypeError'];
    expect(observe(source)).toEqual(expected);
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [logical],
    })!.code!;
    expect(observe(babel)).toEqual(expected);
    const code = compile(source, { transforms: { logicalAssignmentOperators: true } });
    expect(code).not.toMatch(/\|\|=|&&=|\?\?=/);
    expect(observe(code)).toEqual(expected);
  });
});

test('legacy auto-accessor computed regexp keys share one allocation', () => {
  const source = `
    let first; const events = [];
    RegExp.prototype.toString = function() {
      events.push(first ? this === first : true); first = this; return 'value';
    };
    function decorate() {}
    class C { @decorate accessor [/key/] = 3; }
    const instance = new C(); instance.value = 4;
    globalThis.result = [instance.value, events];
  `;
  const ts = require('typescript');
  // This is an emit/runtime control; transpileModule does not type-check the source.
  const reference = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
  }).outputText;
  expect(observe(reference)).toEqual([4, [true, true, true, true]]);
  const code = compile(
    source,
    { typescript: 'strip', transforms: { legacyDecorators: true } },
    'input.ts',
  );
  expect(code).not.toMatch(/@decorate|\baccessor\s*\[/);
  expect(observe(code)).toEqual([4, [true, true, true, true]]);
});
