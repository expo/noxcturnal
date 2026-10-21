import { describe, expect, test } from 'vitest';
import { compile, importCode } from './runtime';
import { createRequire } from 'node:module';

describe('typescript expression erasure', () => {
  const cases = [
    {
      name: 'as wrapped direct eval',
      source: `function read(){const local=3;return (eval as typeof eval)('local')}globalThis.result=read();`,
      expected: 3,
    },
    {
      name: 'satisfies wrapped direct eval',
      source: `function read(){const local=3;return (eval satisfies typeof eval)('local')}globalThis.result=read();`,
      expected: 3,
    },
    {
      name: 'non-null direct eval',
      source: `function read(){const local=3;return eval!('local')}globalThis.result=read();`,
      expected: 3,
    },
    {
      name: 'instantiation call receiver',
      source: `const o={value:3,read<T>(){return this.value}};globalThis.result=(o.read<number>)();`,
      expected: 3,
    },
    {
      name: 'instantiation tagged receiver',
      source: `const o={value:3,read<T>(strings:TemplateStringsArray){return this.value}};globalThis.result=(o.read<number>)\`text\`;`,
      expected: 3,
    },
    {
      name: 'nested cast call receiver',
      source: `const o={value:3,read(){return this.value}};globalThis.result=((o.read as typeof o.read)!)();`,
      expected: 3,
    },
    {
      name: 'cast member update',
      source: `const o={value:3};const previous=(o.value as number)++;globalThis.result=[previous,o.value];`,
      expected: [3, 4],
    },
    {
      name: 'non-null member destructuring target',
      source: `const o={value:3};[o.value!]=[4];globalThis.result=o.value;`,
      expected: 4,
    },
    {
      name: 'non-null identifier destructuring target',
      source: `let value=3;[value!]=[4];globalThis.result=value;`,
      expected: 4,
    },
    {
      name: 'non-null optional member chain',
      source: `function read(o:{value:number}|null){return o?.value!}globalThis.result=[read(null),read({value:3})];`,
      expected: [undefined, 3],
    },
    {
      name: 'non-null optional method chain',
      source: `function read(o:{value:number,read():number}|null){return o?.read!()}globalThis.result=[read(null),read({value:3,read(){return this.value}})];`,
      expected: [undefined, 3],
    },
    {
      name: 'this parameter erasure',
      source: `function read(this:{value:number},...args:number[]){return [this.value,args,read.length]}globalThis.result=read.call({value:3},4,5);`,
      expected: [3, [4, 5], 0],
    },
  ];
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', code)(context);
    return context.result;
  }
  for (const entry of cases)
    describe(entry.name, () => {
      for (const mode of ['inline', 'runtime'] as const)
        test(`preserves the expression reference, ${mode}`, () => {
          const code = compile(
            entry.source,
            { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
            'input.ts',
          );
          expect(code).not.toMatch(
            /\bsatisfies\b|\bas\s+(?:number|typeof)|<number>|<T>|!\s*[)(\]=]|this\s*:/,
          );
          expect(code).not.toContain('@babel/runtime');
          expect(observe(code)).toEqual(entry.expected);
        });
    });
});

describe('typescript enum branches', () => {
  const cases = [
    {
      name: 'qualified enum namespace merge',
      source: `enum E{A=1}namespace E{export const twice=E.A*2}globalThis.result=E.twice;`,
      expected: 2,
    },
    {
      name: 'nested shadowing and member capture',
      source: `enum E{A=1,B=A,C=(()=>{const A=4;return A})(),D=(()=>A)()}globalThis.result=[E.A,E.B,E.C,E.D];`,
      expected: [1, 1, 4, 1],
    },
    {
      name: 'merged enum reference',
      source: `enum E{A=1}enum E{B=A+2}globalThis.result=[E.A,E.B];`,
      expected: [1, 3],
    },
    {
      name: 'effectful initializer and dependent member',
      source: `const calls=[];function value(){calls.push('call');return 7}enum E{A=value(),B=A+1}globalThis.result=[E.A,E.B,calls];`,
      expected: [7, 8, ['call']],
    },
    {
      name: 'heterogeneous members and reverse mappings',
      source: `enum E{A='a',B=A+'b',C=2,D}globalThis.result=[E.A,E.B,E.C,E.D,E[2],E[3]];`,
      expected: ['a', 'ab', 2, 3, 'C', 'D'],
    },
    {
      name: 'numeric operators and auto increment',
      source: `enum E{A=1<<3,B=~A,C=-(2**3),D}globalThis.result=[E.A,E.B,E.C,E.D];`,
      expected: [8, -9, -8, -7],
    },
  ];
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', code)(context);
    return context.result;
  }
  for (const entry of cases) {
    describe(entry.name, () => {
      for (const mode of ['inline', 'runtime'] as const)
        test(`preserves enum behavior, ${mode}`, () => {
          const code = compile(
            entry.source,
            { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
            'input.ts',
          );
          expect(code).not.toMatch(/\b(?:enum|namespace)\s+E\b/);
          expect(observe(code)).toEqual(entry.expected);
        });
    });
  }
});

describe('typescript const enum', () => {
  const cases = [
    {
      name: 'local const enum',
      source: `const enum E{A=2,B=A*3}export const value=E.B;`,
      value: 6,
      exposed: undefined,
    },
    {
      name: 'exported const enum',
      source: `export const enum E{A=2,B=A*3}export const value=E.B;`,
      value: 6,
      exposed: 6,
    },
    {
      name: 'namespace const enum',
      source: `export namespace N{export const enum E{A=3}export function read(){return E.A}}export const value=N.read();`,
      value: 3,
      exposed: 3,
    },
    {
      name: 'merged const enum',
      source: `const enum E{A=2}const enum E{B=3}export const value=[E.A,E.B];`,
      value: [2, 3],
      exposed: undefined,
    },
    {
      name: 'shadowed enum name',
      source: `const enum E{A=3}function read(E:{A:number}){return E.A}export const value=[E.A,read({A:7})];`,
      value: [3, 7],
      exposed: undefined,
    },
  ];
  async function observe(code: string) {
    const module = await importCode(code);
    return {
      value: module.value,
      exposed:
        (module.E as { B?: number } | undefined)?.B ??
        (module.N as { E: { A: number } } | undefined)?.E.A,
    };
  }
  for (const entry of cases) {
    describe(entry.name, () => {
      const expected = { value: entry.value, exposed: entry.exposed };
      for (const mode of ['inline', 'runtime'] as const)
        test(`preserves values and exported enum objects, ${mode}`, async () => {
          const code = compile(
            entry.source,
            { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
            'input.ts',
          );
          expect(code).not.toMatch(/\b(?:const enum|namespace)\b/);
          expect(code).not.toContain('@babel/runtime');
          expect(await observe(code)).toEqual(expected);
        });
    });
  }
  describe('ambient const enum requires a runtime value', () => {
    const source = `declare const enum E{A=3}export const value=E.A;`;
    for (const mode of ['inline', 'runtime'] as const)
      test(`retains the ambient-value requirement, ${mode}`, async () => {
        const code = compile(
          source,
          { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
          'input.ts',
        );
        expect(code).not.toMatch(/\b(?:declare|enum)\b/);
        await expect(importCode(code)).rejects.toThrow(ReferenceError);
        expect(await observe('const E={A:3};' + code)).toEqual({ value: 3, exposed: undefined });
      });
  });
});

describe('typescript parameter property branches', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'escaped identifier',
      source: String.raw`class C{constructor(public \u0078=3){}}globalThis.result=[new C().x,Object.keys(new C())];`,
      expected: [3, ['x']],
    },
    {
      name: 'prototype-named parameter',
      source: `class C{constructor(public __proto__={value:3}){}}const c=new C();globalThis.result=[Object.hasOwn(c,'__proto__'),c.__proto__.value,Object.getPrototypeOf(c)===C.prototype];`,
      expected: [true, 3, true],
      loose: [false, 3, false],
    },
    {
      name: 'defaults and body effects',
      source: `const calls=[];class C{constructor(public x=(calls.push('x'),3),readonly y=(calls.push('y'),x+1)){calls.push(this.x+':'+this.y)}}const c=new C();globalThis.result=[c.x,c.y,calls];`,
      expected: [3, 4, ['x', 'y', '3:4']],
    },
    {
      name: 'superclass replacement receiver',
      source: `class Base{constructor(){return {fromBase:true}}}class C extends Base{constructor(public x=3){super()}}const c=new C();globalThis.result=[c.x,(c as any).fromBase,Object.hasOwn(c,'x')];`,
      expected: [3, true, true],
    },
    {
      name: 'constructor overload',
      source: `class C{constructor(x:number);constructor(public x=3){}}globalThis.result=new C(7).x;`,
      expected: 7,
    },
    {
      name: 'field reads parameter property',
      source: `class C{field=(this as any).x;constructor(public x=3){}}const c=new C();globalThis.result=[c.x,c.field];`,
      expected: [3, undefined],
    },
  ];
  function observe(code: string) {
    const context: { result?: unknown } = {};
    new Function('globalThis', 'require', code)(context, require);
    return context.result;
  }
  for (const entry of cases) {
    describe(entry.name, () => {
      for (const fields of ['preserve', 'strict', 'loose'] as const) {
        for (const mode of ['inline', 'runtime'] as const) {
          test(`preserves parameter properties, fields=${fields}, ${mode}`, () => {
            const code = compile(
              entry.source,
              {
                typescript: 'strip',
                ...(fields === 'preserve'
                  ? {}
                  : {
                      transforms: { classes: true, classProperties: { loose: fields === 'loose' } },
                    }),
                helpers: { mode, version: '7.29.7' },
              },
              'input.ts',
            );
            expect(code).not.toMatch(/\b(?:public|readonly)\s+[\\\w]/);
            if (fields !== 'preserve') expect(code).not.toMatch(/class\s+C\b/);
            expect(observe(code)).toEqual(
              fields === 'loose' ? (entry.loose ?? entry.expected) : entry.expected,
            );
          });
        }
      }
    });
  }
});

describe('typescript jsx import retention', () => {
  const dependency =
    'data:text/javascript;base64,' +
    Buffer.from(
      `export const h=(tag)=>tag;export const Fragment='fragment';export const React={createElement:h,Fragment};`,
    ).toString('base64');
  const cases = [
    { name: 'custom factory element', fragment: false, pragma: 'h' },
    { name: 'custom factory fragment', fragment: true, pragma: 'h' },
    {
      name: 'custom fragment with standard factory',
      fragment: true,
      pragma: 'React.createElement',
    },
  ];
  for (const directive of [false, true])
    for (const entry of cases)
      for (const prepass of [false, true])
        for (const mode of ['inline', 'runtime'] as const)
          test(`${entry.name}, directive=${directive}, prepass=${prepass}, ${mode}`, async () => {
            const source = `${directive ? `/** @jsx ${entry.pragma} */\n/** @jsxFrag Fragment */\n` : ''}import {h,Fragment,React} from '${dependency}';function identity(value:number=1){return value}export const defaultValue=identity();export const result=${entry.fragment ? '<>text</>' : '<div/>'};`;
            const expected = entry.fragment ? 'fragment' : 'div';
            const code = compile(
              source,
              {
                typescript: 'strip',
                transforms: { parameters: prepass },
                jsx: 'classic',
                ...(directive ? {} : { jsxPragma: entry.pragma, jsxPragmaFrag: 'Fragment' }),
                helpers: { mode, version: '7.29.7' },
              },
              'input.tsx',
            );
            expect(code).not.toMatch(/<div|<>/);
            expect(code).not.toContain('@babel/runtime');
            if (prepass) expect(code).not.toMatch(/identity\(value\s*=/);
            const output = await importCode(code);
            expect(output.defaultValue).toBe(1);
            expect(output.result).toBe(expected);
          });

  for (const mode of ['inline', 'runtime'] as const) {
    test(`${mode} applies directive precedence and drops unrelated imports in the prepass`, async () => {
      const unused = 'data:text/javascript,throw%20new%20Error("unused%20factory")';
      const source = `/** @jsx h */
/** @jsxFrag Fragment */
import {h, Fragment} from '${dependency}';
import {wrong, WrongFragment} from '${unused}';
function identity(value:number=1){ return value; }
export const result = <>text</>;
export const defaultValue = identity();`;
      const code = compile(
        source,
        {
          typescript: 'strip',
          jsx: 'classic',
          jsxPragma: 'wrong',
          jsxPragmaFrag: 'WrongFragment',
          transforms: { parameters: true },
          helpers: { mode, version: '7.29.7' },
        },
        'input.tsx',
      );
      expect(code).not.toContain(unused);
      expect(await importCode(code)).toMatchObject({ result: 'fragment', defaultValue: 1 });
    });

    test(`${mode} erases an unused fragment import for element-only JSX`, async () => {
      const unused = 'data:text/javascript,throw%20new%20Error("unused%20fragment")';
      const source = `import {h} from '${dependency}'; import {Fragment} from '${unused}';
function identity(value:number=1){return value;}
export const result=<div/>;`;
      const code = compile(
        source,
        {
          typescript: 'strip',
          jsx: 'classic',
          jsxPragma: 'h',
          jsxPragmaFrag: 'Fragment',
          transforms: { parameters: true },
          helpers: { mode, version: '7.29.7' },
        },
        'input.tsx',
      );
      expect(code).not.toContain(unused);
      expect((await importCode(code)).result).toBe('div');
    });
  }
});

describe('typescript parameter properties after nested super', () => {
  const require = createRequire(import.meta.url);
  function run(code: string) {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }

  test('initializes the parameter property after either conditional super branch', () => {
    const source = `
      class Base {}
      class Value extends Base {
        constructor(public value = 3) { if (value) super(); else super(); }
      }
      globalThis.result = [new Value().value, new Value(0).value];
    `;
    const code = compile(source, { typescript: 'strip' }, 'input.ts');
    expect(code).not.toMatch(/\bpublic\b/);
    expect(code).not.toContain('@babel/runtime');
    expect(run(code)).toEqual([3, 0]);
  });

  for (const mode of ['inline', 'runtime'] as const) {
    test.each([false, true])(
      `initializes after super in try/finally, helpers=${mode}, classes=%s`,
      classes => {
        const source = `const events: string[] = []; class Base {} class Value extends Base { constructor(public value = 3) { try { super(); } finally { events.push('finally'); } } } const value = new Value(); globalThis.result = [value.value, events];`;
        const code = compile(
          source,
          {
            typescript: 'strip',
            transforms: { classes },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          },
          'input.ts',
        );
        expect(code).not.toMatch(/\bpublic\b|: string\[\]/);
        if (classes) expect(code).not.toMatch(/\bclass\s+(?:Value|Base)\b/);
        else expect(code).toMatch(/\bclass\s+Value\b/);
        expect(run(code)).toEqual([3, ['finally']]);
      },
    );
  }
});
