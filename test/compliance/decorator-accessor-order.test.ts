import { createRequire } from 'node:module';

import { describe, expect, test } from 'vitest';
import { compile } from './runtime';
import { defineNativePipeline, transform } from '../../js';

describe('decorator auto accessor', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  for (const replacement of [false, true])
    for (const isStatic of [false, true])
      for (const computed of [false, true])
        describe(`legacy auto-accessor, replacement=${replacement}, static=${isStatic}, computed=${computed}`, () => {
          const key = computed ? '[key]' : 'value';
          const access = computed ? '[key]' : '.value';
          const source = `let Original:any;function replace(C:any):any{Original=C;return class extends C{}}const key=Symbol('value');const calls=[];function wrap(target:any,name:string|symbol,descriptor:PropertyDescriptor):any{calls.push([typeof name,typeof descriptor.get,typeof descriptor.set]);const get=descriptor.get!;const set=descriptor.set!;return {...descriptor,get(){return get.call(this)*2},set(value:number){set.call(this,value+1)}}}${replacement ? '@replace ' : ''}class C{@wrap ${isStatic ? 'static ' : ''}accessor ${key}=3}class D extends C{}const target=${isStatic ? 'D' : 'new D()'};const first=target${access};target${access}=4;const descriptor=Object.getOwnPropertyDescriptor(${replacement ? (isStatic ? 'Original' : 'Original.prototype') : isStatic ? 'C' : 'C.prototype'},${computed ? 'key' : "'value'"})!;globalThis.result=[first,target${access},descriptor.enumerable,descriptor.configurable,calls];`;
          const expected = [
            6,
            10,
            false,
            true,
            [[computed ? 'symbol' : 'string', 'function', 'function']],
          ];

          for (const classes of [false, true])
            for (const mode of ['inline', 'runtime'] as const)
              describe(`classes=${classes}, ${mode}`, () => {
                test('preserves decorated accessors', () => {
                  const code = compile(
                    source,
                    {
                      typescript: 'strip',
                      transforms: {
                        legacyDecorators: true,
                        classes,
                        ...(classes ? { classProperties: { loose: false } } : {}),
                      },
                      helpers: { mode, version: '7.29.7' },
                    },
                    'input.ts',
                  );
                  expect(code).not.toMatch(/@wrap|@replace|\baccessor\s/);
                  if (classes) expect(code).not.toMatch(/class\s+[CD]\b/);
                  const actual = observe(code);
                  expect(actual).toEqual(expected);
                });
              });
        });
});

describe('decorator auto accessor keys', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  const cases = [
    {
      name: 'backing name collision',
      body: `#_value_accessor_storage=7;@mark accessor value=3;read(){return [this.value,this.#_value_accessor_storage]}`,
      result: `new C().read()`,
      expected: [3, 7],
    },
    {
      name: 'quoted non-identifier key',
      body: `@mark accessor 'a-b'=3;`,
      result: `new C()['a-b']`,
      expected: 3,
    },
    {
      name: 'computed key getter',
      prefix: `const key=Symbol('key');let count=0;const keys={get field():typeof key{count++;return key}};`,
      body: `@mark accessor [keys.field]=3;`,
      result: `[new C()[key],count]`,
      expected: [3, 1],
    },
  ];
  for (const entry of cases)
    describe(entry.name, () => {
      const source = `${entry.prefix ?? ''}function mark(target:any,key:string|symbol,descriptor:PropertyDescriptor):any{}class C{${entry.body}}globalThis.result=${entry.result};`;

      for (const mode of ['inline', 'runtime'] as const)
        describe(mode, () => {
          test('preserves valid accessor names and private storage', () => {
            const result = transform(
              source,
              'input.ts',
              defineNativePipeline({
                phases: [
                  {
                    name: 'audit',
                    native: {
                      typescript: 'strip',
                      transforms: { legacyDecorators: true },
                      helpers: { mode, version: '7.29.7' },
                    },
                  },
                ],
              }),
            );
            expect(result.status).toBe('complete');
            if (result.status !== 'complete') throw new Error(result.reason);
            expect(result.code).not.toMatch(/@mark|\baccessor\s/);
            expect(result.code).not.toContain('@babel/runtime');
            const actual = observe(result.code);
            expect(actual).toEqual(entry.expected);
          });
        });
    });
});

describe('decorator auto accessor order', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  const orders = [
    {
      failure: 'none',
      instance: [
        'key',
        'static-before',
        'static-after',
        'factory',
        'apply',
        'construct',
        'initializer',
        'done',
      ],
      static: [
        'key',
        'static-before',
        'initializer',
        'static-after',
        'factory',
        'apply',
        'construct',
        'done',
      ],
    },
    { failure: 'key', instance: ['key', 'stop'], static: ['key', 'stop'] },
    {
      failure: 'initializer',
      instance: [
        'key',
        'static-before',
        'static-after',
        'factory',
        'apply',
        'construct',
        'initializer',
        'stop',
      ],
      static: ['key', 'static-before', 'initializer', 'stop'],
    },
    {
      failure: 'factory',
      instance: ['key', 'static-before', 'static-after', 'factory', 'stop'],
      static: ['key', 'static-before', 'initializer', 'static-after', 'factory', 'stop'],
    },
    {
      failure: 'apply',
      instance: ['key', 'static-before', 'static-after', 'factory', 'apply', 'stop'],
      static: ['key', 'static-before', 'initializer', 'static-after', 'factory', 'apply', 'stop'],
    },
  ] as const;
  for (const entry of orders)
    for (const isStatic of [false, true])
      describe(`auto-accessor order, failure=${entry.failure}, static=${isStatic}`, () => {
        const failure = entry.failure;
        const source = `const log:string[]=[];const key=Symbol('key');const keys={get field():typeof key{log.push('key');${failure === 'key' ? "throw new Error('stop');" : 'return key;'}}};function initialize(){log.push('initializer');${failure === 'initializer' ? "throw new Error('stop');" : 'return 3;'}}function mark(){log.push('factory');${failure === 'factory' ? "throw new Error('stop');" : ''}return function(target:any,name:string|symbol,descriptor:PropertyDescriptor):any{log.push('apply');${failure === 'apply' ? "throw new Error('stop');" : ''}}}try{class C{static before=(log.push('static-before'),0);@mark() ${isStatic ? 'static ' : ''}accessor [keys.field]=initialize();static after=(log.push('static-after'),0)}log.push('construct');new C();log.push('done')}catch(error){log.push((error as Error).message)}globalThis.result=log;`;
        const expected = isStatic ? entry.static : entry.instance;
        for (const classes of [false, true])
          for (const mode of ['inline', 'runtime'] as const)
            test(`preserves effects, classes=${classes}, ${mode}`, () => {
              const code = compile(
                source,
                {
                  typescript: 'strip',
                  transforms: {
                    legacyDecorators: true,
                    classes,
                    ...(classes ? { classProperties: { loose: false } } : {}),
                  },
                  helpers: { mode, version: '7.29.7' },
                },
                'input.ts',
              );
              expect(code).not.toMatch(/@mark|\baccessor\s/);
              if (classes) expect(code).not.toMatch(/class\s+C\b/);
              expect(observe(code)).toEqual(expected);
            });
      });
});

describe('decorator accessor', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  for (const isStatic of [false, true]) {
    for (const getterFirst of [false, true]) {
      describe(`accessor decorator grouping, static=${isStatic}, getter first=${getterFirst}`, () => {
        const prefix = isStatic ? 'static ' : '';
        const getter = `@getter ${prefix}get value(){return this.n}`;
        const setter = `${prefix}set value(@parameter next:number){this.n=next}`;
        const source = `const calls=[];
 function getter(target,key,descriptor){calls.push('get');const original=descriptor.get;const factor=target.factor??1;return {...descriptor,get(){return original.call(this)*factor}}}
 function parameter(target,key,index){calls.push('parameter:'+index);target.factor=2}
 class C{${prefix}n=3;${getterFirst ? getter + setter : setter + getter}}
 const c=${isStatic ? 'C' : 'new C()'};c.value=4;(globalThis as any).result=[calls,c.value];`;
        const expected = [['parameter:0', 'get'], 8];

        for (const mode of ['inline', 'runtime'] as const) {
          for (const classes of [false, true]) {
            describe(`${mode}, classes=${classes}`, () => {
              test('applies setter-parameter metadata before replacing the accessor descriptor', () => {
                const code = compile(
                  source,
                  {
                    typescript: 'strip',
                    transforms: {
                      legacyDecorators: true,
                      ...(classes ? { classes: true, classProperties: { loose: true } } : {}),
                    },
                    helpers: { mode, version: '7.29.7' },
                  },
                  'input.ts',
                );
                expect(code).not.toMatch(/@(getter|parameter)/);
                expect(code).not.toContain(' as any');
                if (classes) expect(code).not.toMatch(/class\s+C\b/);
                const actual = observe(code);
                expect(actual).toEqual(expected);
              });
            });
          }
        }
      });
    }
  }
});

describe('decorator key', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'identifier',
      key: 'value',
      select: '"value"',
      type: 'string',
      text: 'value',
      effects: [],
    },
    { name: 'numeric literal', key: '1', select: '1', type: 'number', text: '1', effects: [] },
    { name: 'string literal', key: '"1"', select: '1', type: 'string', text: '1', effects: [] },
    { name: 'computed number', key: '[1]', select: '1', type: 'number', text: '1', effects: [] },
    {
      name: 'computed string',
      key: '["value"]',
      select: '"value"',
      type: 'string',
      text: 'value',
      effects: [],
    },
    {
      name: 'computed template',
      key: '[`value`]',
      select: '"value"',
      type: 'string',
      text: 'value',
      effects: [],
    },
    {
      name: 'dynamic string',
      key: '[keyName]',
      select: '"value"',
      type: 'string',
      text: 'value',
      effects: [],
    },
    { name: 'symbol', key: '[token]', select: 'token', type: 'symbol', text: 'token', effects: [] },
    {
      name: 'side-effecting key',
      key: '[getKey()]',
      select: '"value"',
      type: 'string',
      text: 'value',
      effects: ['key'],
    },
  ];
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  for (const entry of cases) {
    describe(entry.name, () => {
      const source = `const log=[];const keyName='value';const token=Symbol('token');function getKey(){log.push('key');return 'value'}
 function dec(target,key,descriptor){log.push(['decorate',typeof key,key===token?'token':String(key)]);const original=descriptor.value;return {...descriptor,enumerable:true,value(){return original.call(this)+1}}}
 class C{@dec
 ${entry.key}(){return 7}}
 const c=new C();const descriptor=Object.getOwnPropertyDescriptor(C.prototype,${entry.select});(globalThis as any).result=[log,c[${entry.select}](),descriptor.enumerable,descriptor.configurable,descriptor.writable];`;
      const expected = [
        [...entry.effects, ['decorate', entry.type, entry.text]],
        8,
        true,
        true,
        true,
      ];

      for (const mode of ['inline', 'runtime'] as const) {
        for (const classes of [false, true]) {
          test(`preserves key and descriptor, ${mode}, classes=${classes}`, () => {
            const code = compile(
              source,
              {
                typescript: 'strip',
                transforms: { legacyDecorators: true, ...(classes ? { classes: true } : {}) },
                helpers: { mode, version: '7.29.7' },
              },
              'input.ts',
            );
            expect(code).not.toContain('@dec');
            if (classes) expect(code).not.toMatch(/class\s+C\b/);
            expect(observe(code)).toEqual(expected);
          });
        }
      }
    });
  }
});
