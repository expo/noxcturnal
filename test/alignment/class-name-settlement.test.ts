import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
const cases = [
  {
    name: 'private newTarget and static accessor construction shapes',
    source: `class Value{#method(){} expose(){return this.#method}static method(){}get value(){return 1}set value(v){}}const descriptor=Object.getOwnPropertyDescriptor(Value.prototype,'value');let construction;try{Reflect.construct(function(){},[],new Value().expose());construction='accepted'}catch(error){construction=error.name}globalThis.result=[construction,[Value.method,descriptor.get,descriptor.set].map(fn=>Object.hasOwn(fn,'prototype'))];`,
    native: ['TypeError', [false, false, false]],
  },
  {
    name: 'public string method name',
    source: `class Value{'literal'(){}}globalThis.result=Value.prototype.literal.name;`,
    native: 'literal',
  },
  {
    name: 'numeric and private generated names',
    source: `class Value{123(){return 12} #method(){return 13} expose(){return this.#method}}const instance=new Value();globalThis.result=[[Value.prototype[123].name,instance.expose().name],[instance[123](),instance.expose()()]];`,
    native: [
      ['123', '#method'],
      [12, 13],
    ],
  },
  {
    name: 'symbol description getter effects',
    source: `const calls=[];const descriptor=Object.getOwnPropertyDescriptor(Symbol.prototype,'description');try{Object.defineProperty(Symbol.prototype,'description',{configurable:true,get(){calls.push('description');return 'override'}});const key=Symbol('original');class Value{[key](){}}globalThis.result=[Value.prototype[key].name,calls];}finally{Object.defineProperty(Symbol.prototype,'description',descriptor)}`,
    native: ['[original]', []],
  },
];
describe.each(cases)('$name', entry => {
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let actual: unknown;
    beforeAll(() => {
      expect(observe(entry.source)).toEqual(entry.native);
      const reference = transformSync(entry.source, {
        babelrc: false,
        configFile: false,
        sourceType: 'script',
        plugins: [
          [require('@babel/plugin-transform-private-methods'), { loose: true }],
          [require('@babel/plugin-transform-class-properties'), { loose: true }],
          require('@babel/plugin-transform-classes'),
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
      const code = compile(entry.source, {
        transforms: { classes: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/\bclass\s+Value\b|#method\b/);
      expect(reference).not.toMatch(/\bclass\s+Value\b|#method\b/);
      actual = observe(code);
      const babelValue = observe(reference);
      if (mode === 'runtime') {
        expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
        expect(reference).toContain('@babel/runtime/helpers/');
        if (entry.name === 'numeric and private generated names')
          expect(code).toContain('@babel/runtime/helpers/classPrivateFieldLooseBase');
      } else expect(code).not.toContain('require(');
      if (entry.name === 'public string method name') {
        expect(babelValue).toBe('literal');
        expect(actual).toBe('literal');
      } else if (entry.name === 'symbol description getter effects') {
        expect(babelValue).toEqual(['value', []]);
        expect(actual).toEqual(['[original]', []]);
      } else if (entry.name === 'private newTarget and static accessor construction shapes') {
        expect(babelValue).toEqual(['accepted', [true, true, true]]);
      } else {
        // Generated numeric/private spellings differ; no particular temporary name is promised.
        expect(babelValue).toEqual([
          [expect.any(String), expect.any(String)],
          [12, 13],
        ]);
      }
    });
    if (entry.name === 'private newTarget and static accessor construction shapes') {
      test('shares the Babel ordinary-function representation', () => {
        expect(actual).toEqual(['accepted', [true, true, true]]);
      });
    } else if (entry.name === 'numeric and private generated names') {
      test('preserves callable behavior without promising generated name spellings', () => {
        expect(actual).toEqual([
          [expect.any(String), expect.any(String)],
          [12, 13],
        ]);
      });
    } else {
      test('preserves the compared naming observation', () => {
        if (entry.name === 'public string method name') expect(actual).toBe('literal');
        else expect((actual as unknown[])[1]).toEqual([]);
      });
    }
  });
});

test.each(['inline', 'runtime'] as const)(
  'field function names remain an adopted generated-name boundary (%s)',
  mode => {
    const source = `class Value {
      method = function () { return 1 };
      arrow = () => 2;
      static method = function () { return 3 };
    }
    const instance = new Value();
    globalThis.result = [
      [instance.method.name, instance.arrow.name, Value.method.name],
      [instance.method(), instance.arrow(), Value.method()],
    ];`;
    expect(observe(source)).toEqual([
      ['method', 'arrow', 'method'],
      [1, 2, 3],
    ]);
    const reference = transformSync(source, {
      babelrc: false,
      configFile: false,
      plugins: [
        [require('@babel/plugin-transform-class-properties'), { loose: false }],
        require('@babel/plugin-transform-classes'),
      ],
    })!.code!;
    expect(observe(reference)).toEqual([
      ['', '', ''],
      [1, 2, 3],
    ]);
    const code = compile(source, {
      transforms: { classes: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/\bclass\s+Value\b/);
    // Synthetic spellings are observable, but neither transform promises the
    // source field name. Preserve callable behavior without pinning a temporary.
    expect(observe(code)).toEqual([
      [expect.any(String), expect.any(String), expect.any(String)],
      [1, 2, 3],
    ]);
  },
);
