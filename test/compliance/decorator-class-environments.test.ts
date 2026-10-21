import { createRequire } from 'node:module';

import { describe, expect, test } from 'vitest';
import { compile } from './runtime';
import { transformSync as transport } from 'esbuild';

describe('decorator class boundaries', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  const cases = [
    {
      name: 'ambient class decorator',
      source: `let calls=0;function mark(...args:any[]):any{calls++}@mark declare class C{}globalThis.result=[calls,typeof C];`,
      expected: [0, 'undefined'],
    },
    {
      name: 'ambient property decorator',
      source: `let calls=0;function mark(...args:any[]):any{calls++}declare class C{@mark value:number}globalThis.result=[calls,typeof C];`,
      expected: [0, 'undefined'],
    },
    ...[false, true].flatMap(named =>
      [false, true].map(isStatic => ({
        name: `undecorated class expression, named=${named}, static=${isStatic}`,
        source: `let calls=0;function mark(C:any):any{calls++;return C}@mark class Anchor{}const C=class ${named ? 'Inner' : ''}{${isStatic ? 'static ' : ''}accessor value=3};const target=${isStatic ? 'C' : 'new C()'};const first=target.value;target.value=4;globalThis.result=[calls,first,target.value];`,
        expected: [1, 3, 4],
      })),
    ),
  ];
  for (const entry of cases)
    describe(entry.name, () => {
      for (const classes of [false, true])
        for (const mode of ['inline', 'runtime'] as const)
          test(`classes=${classes}, ${mode}`, () => {
            const code = compile(
              entry.source,
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
            expect(code).not.toMatch(/@mark|\bdeclare\s|\baccessor\s/);
            if (classes)
              expect(code).not.toMatch(/\bclass\s+(?:Anchor|Inner|_class)\b|=\s*class\b/);
            expect(observe(code)).toEqual(entry.expected);
          });
    });
});

describe('decorator class replacement', () => {
  const require = createRequire(import.meta.url);
  const body = `static initial=C;static self(){return C}self(){return C}`;
  const cases = [
    {
      name: 'local declaration',
      declaration: `@outer @inner class C{${body}}export {C as Selected};`,
      select: 'Selected',
    },
    { name: 'named export', declaration: `@outer @inner export class C{${body}}`, select: 'C' },
    {
      name: 'named default export',
      declaration: `@outer @inner export default class C{${body}}`,
      select: 'default',
    },
    {
      name: 'anonymous default export',
      declaration: `@outer @inner export default class {static initial=1;static self(){return this}self(){return this.constructor}}`,
      select: 'default',
    },
    {
      name: 'namespace export',
      declaration: `export namespace N{@outer @inner export class C{${body}}}`,
      select: 'N',
    },
  ];
  function observe(code: string, select: string, anonymous = false) {
    const module = { exports: {} as Record<string, any> };
    new Function('module', 'exports', 'require', transport(code, { format: 'cjs' }).code)(
      module,
      module.exports,
      require,
    );
    const C = select === 'N' ? module.exports.N.C : module.exports[select];
    const value = new C();
    return [
      module.exports.calls,
      value.tag,
      C.initial === (anonymous ? 1 : module.exports.Original),
      C.self() === C,
      value.self() === C,
      value instanceof module.exports.Original,
    ];
  }

  for (const entry of cases) {
    for (const replaceOuter of [false, true]) {
      describe(`${entry.name}, replace outer=${replaceOuter}`, () => {
        const source = `export let Original:any;export const calls=[];function inner(value:any):any{calls.push('inner');Original=value;return class extends value{tag='inner'}}function outer(value:any):any{calls.push('outer');${replaceOuter ? "return class extends value{tag='outer'}" : ''}}${entry.declaration}`;
        const expected = [
          ['inner', 'outer'],
          replaceOuter ? 'outer' : 'inner',
          true,
          true,
          true,
          true,
        ];

        for (const mode of ['inline', 'runtime'] as const) {
          for (const classes of [false, true]) {
            test(`preserves replacement identity, ${mode}, classes=${classes}`, () => {
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
              expect(code).not.toMatch(/@(outer|inner)/);
              expect(code).not.toContain(': any');
              if (classes) expect(code).not.toMatch(/\bclass\s+(?:C|extends)\b/);
              expect(
                observe(code, entry.select, entry.name === 'anonymous default export'),
              ).toEqual(expected);
            });
          }
        }
      });
    }
  }
});

describe('decorator self alias', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  const source = `function replace(C:any):any{return class extends C{}}function make(){@replace class C{arrow=()=>C;static arrow=()=>C;shorthand(){return {C}}nested(){return class{read(){return C}}}shadow(C:unknown){return C}static captured=(()=>C)}return C}const First=make();const Second=make();const first=new First();const second=new Second();globalThis.result=[first.arrow()===First,First.arrow()===First,first.shorthand().C===First,new (first.nested())().read()===First,first.shadow(3),First.captured()===First,second.arrow()===Second,first.arrow()!==Second];`;

  for (const classes of [false, true])
    for (const mode of ['inline', 'runtime'] as const)
      test(`decorated class self aliases, classes=${classes}, ${mode}`, () => {
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
        expect(code).not.toContain('@replace');
        if (classes) expect(code).not.toMatch(/class\s+C\b/);
        expect(observe(code)).toEqual([true, true, true, true, 3, true, true, true]);
      });
});

describe('decorator private environment', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  for (const constructorDecorator of [false, true])
    for (const classDecorator of [false, true])
      describe(`private environment decorator, class decorator=${classDecorator}, constructor decorator=${constructorDecorator}`, () => {
        const source = `let check:(value:any)=>boolean;let calls=0;function capture(predicate:(value:any)=>boolean){check=predicate;return function(target:any,key:string,descriptor:PropertyDescriptor):any{calls++}}function inject(target:any,key:undefined,index:number){calls++}function mark(C:any):any{calls++;return C}${classDecorator ? '@mark ' : ''}class C{${constructorDecorator ? 'constructor(@inject value=1){}' : ''}#value=3;@capture(value=>#value in value)read(){return this.#value}}const c=new C();globalThis.result=[check(c),check({}),c.read(),calls];`;
        const expected = [
          true,
          false,
          3,
          1 + Number(classDecorator) + Number(constructorDecorator),
        ];

        for (const classes of [false, true])
          for (const mode of ['inline', 'runtime'] as const)
            describe(`classes=${classes}, ${mode}`, () => {
              test('preserves every decorator callback in private scope', () => {
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
                expect(code).not.toMatch(/@capture|@mark|@inject/);
                if (classes) expect(code).not.toMatch(/class\s+C\b/);
                const actual = observe(code);
                expect(actual).toEqual(expected);
              });
            });
      });
});

describe('decorator nested private', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }

  const cases = [
    {
      name: 'nested class owns private brand',
      expression: `()=>{class Inner{#value=3;read(){return #value in this}}return new Inner().read()}`,
      value: true,
    },
    {
      name: 'nested class owns private read',
      expression: `()=>{class Inner{#value=3;read(){return this.#value}}return new Inner().read()}`,
      value: 3,
    },
    {
      name: 'enclosing class owns private read',
      expression: `()=>outer.#value`,
      value: 3,
    },
  ];
  for (const entry of cases)
    describe(entry.name, () => {
      const source = `const log:any[]=[];function capture(read:()=>unknown){log.push(read());return function(target:any,key:string,descriptor:PropertyDescriptor):any{log.push('member')}}function mark(C:any):any{log.push('class');return C}class Outer{#value=3;build(){const outer=this;@mark class C{@capture(${entry.expression})read(){return 7}}return new C().read()}}const value=new Outer().build();globalThis.result=[value,log];`;
      const expected = [7, [entry.value, 'member', 'class']];

      for (const classes of [false, true])
        for (const mode of ['inline', 'runtime'] as const)
          describe(`classes=${classes}, ${mode}`, () => {
            test('respects ownership of nested private names', () => {
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
              expect(code).not.toMatch(/@capture|@mark/);
              if (classes) expect(code).not.toMatch(/class\s+(?:C|Outer|Inner)\b/);
              const actual = observe(code);
              expect(actual).toEqual(expected);
            });
          });
    });
});
