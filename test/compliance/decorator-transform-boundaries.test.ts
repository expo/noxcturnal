import { describe, expect, test } from 'vitest';
import { compile, importCode } from './runtime';

import { createRequire } from 'node:module';

import { defineNativePipeline, transform } from '../../js';

describe('decorator javascript import', () => {
  const cases = [
    { name: 'unused named import', head: `import {value} from 'audit-dependency';` },
    { name: 'unused default import', head: `import value from 'audit-dependency';` },
    { name: 'unused namespace import', head: `import * as value from 'audit-dependency';` },
    { name: 'bare import', head: `import 'audit-dependency';` },
  ];
  function load(code: string, throwing: boolean) {
    const dependency =
      'data:text/javascript;base64,' +
      Buffer.from(
        `export const value=3;export default value;${throwing ? `throw new Error('dependency evaluated');` : ''}`,
      ).toString('base64') +
      '#' +
      crypto.randomUUID();
    return importCode(code.replaceAll('audit-dependency', dependency));
  }
  for (const entry of cases)
    describe(entry.name, () => {
      const source = `${entry.head}let calls=0;function mark(C){calls++;return C}@mark class C{static value=3}export const result=[calls,C.value];`;

      for (const mode of ['inline', 'runtime'] as const)
        test(`preserves JavaScript dependency evaluation, ${mode}`, async () => {
          const code = compile(
            source,
            { transforms: { legacyDecorators: true }, helpers: { mode, version: '7.29.7' } },
            'input.js',
          );
          expect(code).not.toContain('@mark');
          expect(code).not.toContain('@babel/runtime');
          await expect(load(code, true)).rejects.toThrow('dependency evaluated');
          expect((await load(code, false)).result).toEqual([1, 3]);
        });
    });
});

describe('decorator constructor overload', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  for (const classDecorator of [false, true])
    describe(`constructor overload, class decorator=${classDecorator}`, () => {
      const source = `const log:any[]=[];function inject(target:any,key:undefined,index:number){log.push(['parameter',key,index])}function mark(C:any):any{log.push(['class']);return C}${classDecorator ? '@mark ' : ''}class C{value:number;constructor(value:number);constructor(@inject value=3){this.value=value}}globalThis.result=[new C(7).value,log];`;
      const expected = [7, [['parameter', undefined, 0], ...(classDecorator ? [['class']] : [])]];

      for (const classes of [false, true])
        for (const mode of ['inline', 'runtime'] as const)
          test(`classes=${classes}, ${mode}`, () => {
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
            expect(code).not.toMatch(/@inject|@mark/);
            if (classes) expect(code).not.toMatch(/class\s+C\b/);
            expect(observe(code)).toEqual(expected);
          });
    });
});

describe('decorator rest parameter', () => {
  const cases = [
    {
      name: 'constructor',
      member: 'constructor(@dec ...values:any[]){}',
      expected: [['undefined', 0]],
    },
    {
      name: 'instance method',
      member: 'method(first:number,@dec ...values:any[]){}',
      expected: [['method', 1]],
    },
    {
      name: 'static method',
      member: 'static method(first:number,second:number,@dec ...values:any[]){}',
      expected: [['method', 2]],
    },
  ];
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', code)(context);
    return context.result;
  }

  for (const entry of cases) {
    describe(entry.name, () => {
      const source = `const calls=[];function dec(target,key,index){calls.push([String(key),index])}class C{${entry.member}}(globalThis as any).result=calls;`;

      for (const mode of ['inline', 'runtime'] as const) {
        describe(mode, () => {
          test('lowers the supported rest-parameter decorator', () => {
            const plan = {
              typescript: 'strip' as const,
              transforms: { legacyDecorators: true },
              helpers: { mode, version: '7.29.7' },
            };
            const control = compile(
              source.replace('...values:any[]', 'values:any'),
              plan,
              'input.ts',
            );
            expect(control).not.toContain('@dec');
            expect(observe(control)).toEqual(entry.expected);
            const result = transform(
              source,
              'input.ts',
              defineNativePipeline({ phases: [{ name: 'audit', native: plan }] }),
            );
            expect(result.status).toBe('complete');
            if (result.status !== 'complete') throw Error(result.reason);
            expect(result.code).not.toContain('@dec');
            expect(observe(result.code)).toEqual(entry.expected);
          });
        });
      }
    });
  }
});

describe('decorator private access', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  const cases = [
    { name: 'field read', member: '#value=3;', expression: 'value.#value', expected: [3, 3] },
    {
      name: 'method call',
      member: '#value(){return 3}',
      expression: 'value.#value()',
      expected: [3, 3],
    },
    {
      name: 'field assignment',
      member: '#value=3;',
      expression: 'value.#value=4',
      expected: [4, 4],
    },
    { name: 'field update', member: '#value=3;', expression: 'value.#value++', expected: [3, 4] },
  ];
  for (const brandGuard of [false, true])
    for (const entry of cases)
      describe(`${entry.name}, brand guard=${brandGuard}`, () => {
        const source = `let check:(value:any)=>number;function capture(read:(value:any)=>number){check=read;return function(target:any,key:string,descriptor:PropertyDescriptor):any{}}class C{${entry.member}@capture((value:C)=>${brandGuard ? `(#value in value,${entry.expression})` : entry.expression})read(){return ${entry.name === 'method call' ? 'this.#value()' : 'this.#value'}}}const c=new C();globalThis.result=[check(c),c.read()];`;

        for (const classes of [false, true])
          for (const mode of ['inline', 'runtime'] as const)
            describe(`classes=${classes}, ${mode}`, () => {
              test('keeps private accesses in their declaring environment', () => {
                const code = compile(
                  source,
                  {
                    typescript: 'strip',
                    transforms: {
                      legacyDecorators: true,
                      classes,
                      ...(classes
                        ? {
                            classProperties: { loose: false },
                            privateMethods: true,
                            privatePropertyInObject: true,
                          }
                        : {}),
                    },
                    helpers: { mode, version: '7.29.7' },
                  },
                  'input.ts',
                );
                expect(code).not.toContain('@capture');
                if (classes) expect(code).not.toMatch(/class\s+C\b/);
                const actual = observe(code);
                expect(actual).toEqual(entry.expected);
              });
            });
      });
});

describe('decorator order', () => {
  const require = createRequire(import.meta.url);
  const source = `const log=[];function mark(label){log.push('eval:'+label);return function(...args){log.push('apply:'+label+':'+String(args[1])+':'+args.length)}}
@mark('class') class C {
 @mark('static-method') static read(@mark('static-param') value){}
 @mark('instance-method') read(@mark('instance-param') value){}
 @mark('static-field') static field=1;
 @mark('instance-field') field=2;
 constructor(@mark('constructor-param') value){}
}(globalThis as any).result=log;`;
  const instance = [
    'eval:instance-method',
    'eval:instance-param',
    'apply:instance-param:read:3',
    'apply:instance-method:read:3',
    'eval:instance-field',
    'apply:instance-field:field:3',
  ];
  const statics = [
    'eval:static-method',
    'eval:static-param',
    'apply:static-param:read:3',
    'apply:static-method:read:3',
    'eval:static-field',
    'apply:static-field:field:3',
  ];
  const constructor = [
    'eval:class',
    'eval:constructor-param',
    'apply:constructor-param:undefined:3',
    'apply:class:undefined:1',
  ];
  const expected = [...instance, ...statics, ...constructor];
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  for (const mode of ['inline', 'runtime'] as const) {
    for (const classes of [false, true]) {
      describe(`legacy decorator grouping, ${mode}, classes=${classes}`, () => {
        test('groups instance decorators before static decorators and constructor decorators', () => {
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
          expect(code).not.toContain('@mark');
          expect(code).not.toContain(' as any');
          if (classes) expect(code).not.toMatch(/class\s+C\b/);
          const actual = observe(code);
          expect(actual).toEqual(expected);
        });
      });
    }
  }
});

test.each([false, true])(
  'bails out pristinely for decorated class expressions (braced=%s)',
  braced => {
    for (const expression of [
      `out.push(new (@mark class { value = row; })().value);`,
      `out.push(class { @mark read() { return row; } });`,
      `out.push(class { read(@mark value: number) { return value; } });`,
    ]) {
      const source = `const out = [];
      const mark = C => C;
      for (const row of [1, 2])
        ${braced ? `{ ${expression} }` : expression}`;
      const result = transform(
        source,
        'input.ts',
        defineNativePipeline({
          phases: [
            {
              name: 'decorators',
              native: { typescript: 'strip', transforms: { legacyDecorators: true } },
            },
          ],
        }),
      );
      expect(result.status).toBe('bailout');
      if (result.status === 'bailout') {
        expect(result.reason).toContain('decorated-class-expression');
        expect(result.source).toBe(source);
      }
    }
  },
);

test('invalid decorated expressions throw before compatibility bailout', () => {
  const source = `const duplicate=1; const duplicate=2; const C=(@mark class {});`;
  expect(() =>
    transform(
      source,
      'input.ts',
      defineNativePipeline({
        phases: [
          {
            name: 'decorators',
            native: { typescript: 'strip', transforms: { legacyDecorators: true } },
          },
        ],
      }),
    ),
  ).toThrow();
});
