import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, test } from 'vitest';
import { compile, importCode } from './runtime';
import { createRequire } from 'node:module';

describe('typescript declaration erasure', () => {
  const cases = [
    {
      name: 'declared computed key does not invoke getter',
      source: `let calls=0;const key=Symbol('key');const keys={get field():typeof key{calls++;return key}};class C{declare [keys.field]:number}const c=new C();globalThis.result=[calls,Reflect.ownKeys(c)];`,
      expected: [0, []],
    },
    {
      name: 'abstract computed method does not invoke getter',
      source: `let calls=0;const key=Symbol('key');const keys={get field():typeof key{calls++;return key}};abstract class C{abstract [keys.field]():number}globalThis.result=[calls,Reflect.ownKeys(C.prototype)];`,
      expected: [0, ['constructor']],
    },
    {
      name: 'ambient value declarations',
      source: `declare const a:number;declare let b:number;declare var c:number;declare function read():number;declare class C{}declare enum E{A}globalThis.result=[typeof a,typeof b,typeof c,typeof read,typeof C,typeof E];`,
      expected: Array(6).fill('undefined'),
    },
    {
      name: 'declare and runtime fields',
      source: `class C{declare erased:number;value!:number;optional?:number;readonly initialized=3;static declare erasedStatic:number}const c=new C();globalThis.result=[Object.keys(c),Object.hasOwn(C,'erasedStatic'),c.initialized];`,
      expected: [['value', 'optional', 'initialized'], false, 3],
    },
    {
      name: 'abstract members and index signature',
      source: `abstract class Base{abstract value:number;abstract read():number;[key:string]:unknown}class C extends Base{value=3;read(){return this.value}}globalThis.result=[Object.keys(Base.prototype),Object.keys(new C()),new C().read()];`,
      expected: [[], ['value'], 3],
    },
    {
      name: 'computed declared symbol field',
      source: `const key=Symbol('key');class C{declare [key]:number;value=3}const c=new C();globalThis.result=[Object.getOwnPropertySymbols(c).length,c.value];`,
      expected: [0, 3],
    },
    {
      name: 'method overload signatures',
      source: `class C{read(value:number):number;read(value:string):number;read(value:number|string){return Number(value)}}globalThis.result=[new C().read('3'),Object.getOwnPropertyNames(C.prototype)];`,
      expected: [3, ['constructor', 'read']],
    },
    {
      name: 'function overload signatures',
      source: `function read(value:number):number;function read(value:string):number;function read(value:number|string){return Number(value)}globalThis.result=[read('3'),read.length];`,
      expected: [3, 1],
    },
    {
      name: 'interface and type alias merged with class',
      source: `interface C{erased:number}type Alias=C;class C{value=3}const c:Alias=new C();globalThis.result=[Object.keys(c),c.value];`,
      expected: [['value'], 3],
    },
    {
      name: 'access modifiers preserve runtime properties',
      source: `class Base{protected value=3;read(){return this.value}}class C extends Base{private extra=4;public override read(){return super.read()+this.extra}}globalThis.result=[Object.keys(new C()),new C().read()];`,
      expected: [['value', 'extra'], 7],
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
        test(`preserves declaration erasure, ${mode}`, () => {
          const code = compile(
            entry.source,
            { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
            'input.ts',
          );
          expect(code).not.toMatch(
            /\b(?:declare|abstract|interface|implements|protected|private|public|readonly|override)\s|\btype Alias/,
          );
          expect(code).not.toContain('@babel/runtime');
          expect(observe(code)).toEqual(entry.expected);
        });
    });
});

describe('typescript import erasure', () => {
  const cases = [
    {
      name: 'only type import module marker',
      source: `import type {Input} from './dependency.js';`,
      load: false,
      value: undefined,
      marker: true,
    },
    {
      name: 'only type specifier module marker',
      source: `import {type Input} from './dependency.js';`,
      load: false,
      value: undefined,
      marker: true,
    },
    {
      name: 'exported interface module marker',
      source: `export interface Input{value:number}`,
      load: false,
      value: undefined,
      marker: true,
    },
    {
      name: 'default interface module marker',
      source: `export default interface Input{value:number}`,
      load: false,
      value: undefined,
      marker: true,
    },
    {
      name: 'local type reexport module marker',
      source: `type Input={value:number};export {Input};`,
      load: false,
      value: undefined,
      marker: true,
    },
    {
      name: 'whole type import',
      source: `import type {Input} from './dependency.js';export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'specifier type import',
      source: `import {type Input} from './dependency.js';export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'default used as a type',
      source: `import Value from './dependency.js';type T=Value;export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'namespace used as a type',
      source: `import * as NS from './dependency.js';type T=NS.Input;export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'type query',
      source: `import {Value} from './dependency.js';type T=typeof Value;export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'runtime typeof',
      source: `import {Value} from './dependency.js';export const value=typeof Value;`,
      load: true,
      value: 'function',
    },
    {
      name: 'mixed import',
      source: `import {type Input,actual} from './dependency.js';export const value=actual;`,
      load: true,
      value: 7,
    },
    {
      name: 'bare import',
      source: `import './dependency.js';export const value=1;`,
      load: true,
      value: 1,
    },
    {
      name: 'empty import',
      source: `import {} from './dependency.js';export const value=1;`,
      load: true,
      value: 1,
    },
    {
      name: 'type reexport',
      source: `export type {Input} from './dependency.js';export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'type specifier reexport',
      source: `export {type Input} from './dependency.js';export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'type star reexport',
      source: `export type * from './dependency.js';export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'type namespace reexport',
      source: `export type * as Types from './dependency.js';export const value=1;`,
      load: false,
      value: 1,
    },
    {
      name: 'empty reexport',
      source: `export {} from './dependency.js';export const value=1;`,
      load: true,
      value: 1,
    },
    {
      name: 'value reexport',
      source: `export {actual as value} from './dependency.js';`,
      load: true,
      value: 7,
    },
  ];
  async function observe(code: string, tripwire: boolean) {
    const dependency =
      'data:text/javascript;base64,' +
      Buffer.from(
        `export class Value{};export default Value;export const actual=7;${tripwire ? "throw new Error('dependency evaluated');" : ''}`,
      ).toString('base64') +
      '#' +
      crypto.randomUUID();
    return (await importCode(code.replaceAll('./dependency.js', dependency))).value;
  }
  for (const entry of cases) {
    describe(entry.name, () => {
      for (const mode of ['inline', 'runtime'] as const)
        test(`preserves runtime loading, ${mode}`, async () => {
          const code = compile(
            entry.source,
            { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
            'input.ts',
          );
          expect(code).not.toMatch(/\b(?:import|export)\s+type\b|\btype T\s*=/);
          if (entry.marker) expect(code).toMatch(/export\s*\{\s*\}/);
          expect(code.includes('dependency.js')).toBe(entry.load);
          expect(await observe(code, false)).toBe(entry.value);
          if (entry.load) await expect(observe(code, true)).rejects.toThrow('dependency evaluated');
          else expect(await observe(code, true)).toBe(entry.value);
        });
    });
  }
});

describe('typescript import alias', () => {
  async function observe(code: string) {
    // Only redirect this fixture's dependency location; execute real Node ESM.
    const dependency =
      'data:text/javascript;base64,' +
      Buffer.from(`export const Y={value:3};throw new Error('dependency evaluated');`).toString(
        'base64',
      ) +
      '#' +
      crypto.randomUUID();
    return (await importCode(code.replaceAll('./dependency.js', dependency))).value;
  }
  for (const length of [2, 3]) {
    for (const forwardReference of [false, true]) {
      describe(`unused alias chain, length=${length}, forward references=${forwardReference}`, () => {
        const aliases =
          length === 2
            ? ['import A=B.Y;', 'import B=N;']
            : ['import A=B.Y;', 'import B=C;', 'import C=N;'];
        const source = `import * as N from './dependency.js';${(forwardReference ? aliases : [...aliases].reverse()).join('')}export const value=1;`;
        for (const mode of ['inline', 'runtime'] as const) {
          test(`removes aliases and their unused dependencies, ${mode}`, async () => {
            const code = compile(
              source,
              { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
              'input.ts',
            );
            expect(code).not.toMatch(/import\s+[ABC]\s*=/);
            expect(code).not.toContain('@babel/runtime');
            expect(code).not.toContain('dependency.js');
            expect(await observe(code)).toBe(1);
          });
        }
      });
    }
  }

  for (const mode of ['inline', 'runtime'] as const) {
    test(`${mode} removes a branching, reordered alias dependency graph`, async () => {
      const source = `import * as N from './dependency.js';
import A = B.Y; import D = B.Y; import C = N; import B = C;
type T = typeof A;
export const value = 1;`;
      const code = compile(
        source,
        { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
        'input.ts',
      );
      expect(code).not.toContain('dependency.js');
      expect(await observe(code)).toBe(1);
    });

    test(`${mode} retains an alias shared with an executed binding`, async () => {
      const dependency =
        'data:text/javascript;base64,' +
        Buffer.from('export const Y = { value: 7 };').toString('base64');
      const source = `import * as N from '${dependency}';
import B = N; import A = B.Y; import Unused = B.Y;
export const value = A.value;`;
      const code = compile(
        source,
        { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
        'input.ts',
      );
      expect(code).not.toMatch(/import\s+\w+\s*=/);
      expect((await importCode(code)).value).toBe(7);
    });

    test(`${mode} retains an exported alias without local uses`, async () => {
      const dependency =
        'data:text/javascript;base64,' +
        Buffer.from('export const Y = { value: 7 };').toString('base64');
      const code = compile(
        `import * as N from '${dependency}'; import B=N; export import A=B.Y;`,
        { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
        'input.ts',
      );
      expect((await importCode(code)).A).toEqual({ value: 7 });
    });
  }
  test('retains a bare side-effect import while erasing unused aliases', async () => {
    const dependency =
      'data:text/javascript;base64,' +
      Buffer.from('export const Y = { value: 7 };').toString('base64');
    const effect = 'data:text/javascript,throw%20new%20Error("side-effect")';
    const sideEffect = compile(
      `import '${effect}'; import * as N from '${dependency}'; import A=B.Y; import B=N; export const value=1;`,
      { typescript: 'strip' },
      'input.ts',
    );
    await expect(importCode(sideEffect)).rejects.toThrow('side-effect');
  });
});

describe('typescript namespace binding', () => {
  const cases = [
    {
      name: 'ambient namespace has no runtime object',
      source: `declare namespace N{const value:number}globalThis.result=typeof N;`,
      expected: 'undefined',
    },
    {
      name: 'ambient dotted namespace has no runtime object',
      source: `declare namespace Outer.Inner{const value:number}globalThis.result=typeof Outer;`,
      expected: 'undefined',
    },
    {
      name: 'ambient type namespace merges with runtime namespace',
      source: `declare namespace N{interface Input{value:number}}namespace N{export const input:Input={value:3}}globalThis.result=N.input.value;`,
      expected: 3,
    },
    {
      name: 'ambient external module has no runtime initialization',
      source: `declare module 'virtual-audit-module'{export const value:number}globalThis.result=3;`,
      expected: 3,
    },
    {
      name: 'mixed declaration publishes late',
      source: `namespace N{export const a=3,{b}={b:N.a}}globalThis.result=[N.a,N.b];`,
      expected: [3, undefined],
    },
    {
      name: 'pattern default publishes late',
      source: `namespace N{export const {a=3,b=N.a}={}}globalThis.result=[N.a,N.b];`,
      expected: [3, undefined],
    },
    {
      name: 'simple declarations publish eagerly',
      source: `namespace N{export const a=3,b=N.a}globalThis.result=[N.a,N.b];`,
      expected: [3, 3],
    },
    {
      name: 'split declaration control',
      source: `namespace N{export const a=3;export const {b}={b:N.a}}globalThis.result=[N.a,N.b];`,
      expected: [3, 3],
    },
    {
      name: 'type namespace before runtime merge',
      source: `namespace N{export interface Input{value:number}}namespace N{export const input:Input={value:3}}globalThis.result=N.input.value;`,
      expected: 3,
    },
    {
      name: 'type namespace after runtime merge',
      source: `namespace N{export const input={value:3}}namespace N{export interface Input{value:number}}globalThis.result=N.input.value;`,
      expected: 3,
    },
    {
      name: 'dotted namespace',
      source: `namespace Outer.Inner{export const value=3}globalThis.result=Outer.Inner.value;`,
      expected: 3,
    },
    {
      name: 'private nested namespace',
      source: `namespace Outer{namespace Hidden{export const value=3}export function read(){return Hidden.value}}globalThis.result=Outer.read();`,
      expected: 3,
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
        test(`preserves namespace initialization and binding, ${mode}`, () => {
          const code = compile(
            entry.source,
            { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
            'input.ts',
          );
          expect(code).not.toMatch(/\bnamespace\s+(?:N|Outer|Hidden)\b/);
          expect(code).not.toMatch(/\bdeclare\s+(?:namespace|module)\b/);
          expect(code).not.toContain('@babel/runtime');
          expect(observe(code)).toEqual(entry.expected);
        });
    });
  }
});

describe('typescript commonjs boundary', () => {
  const cases = [
    {
      name: 'direct namespace alias',
      source: `namespace N{export const value=7}import Alias=N;export = Alias.value;`,
      expected: 7,
    },
    {
      name: 'exported namespace alias',
      source: `namespace Outer{export namespace Inner{export const value=7}}namespace N{export import Alias=Outer.Inner}export = N.Alias.value;`,
      expected: 7,
    },
    {
      name: 'external import value',
      source: `import dep = require('./dependency.cjs');export = dep.value;`,
      expected: 3,
    },
    {
      name: 'unused external import',
      source: `import dep = require('./dependency.cjs');export = 5;`,
      expected: 5,
      unloaded: true,
    },
    {
      name: 'type-only external import',
      source: `import type dep = require('./dependency.cjs');const value:typeof dep.value=5;export = value;`,
      expected: 5,
      unloaded: true,
    },
    {
      name: 'external import used only in a type query',
      source: `import dep = require('./dependency.cjs');const value:typeof dep.value=5;export = value;`,
      expected: 5,
      unloaded: true,
    },
    {
      name: 'qualified namespace alias',
      source: `namespace N{export namespace Inner{export const value=7}}import Alias=N.Inner;export = Alias.value;`,
      expected: 7,
    },
    {
      name: 'export expression evaluates once',
      source: `let count=0;function read(){count++;return {value:count}}export = read();`,
      expected: { value: 1 },
    },
  ];
  function observe(code: string, unloaded = false) {
    const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-ts-cjs-runtime-'));
    const filename = join(directory, 'input.cjs');
    const require = createRequire(filename);
    try {
      writeFileSync(filename, code);
      writeFileSync(
        join(directory, 'dependency.cjs'),
        unloaded ? `throw new Error('erased dependency loaded')` : `module.exports={value:3};`,
      );
      return require(filename);
    } finally {
      delete require.cache[filename];
      delete require.cache[join(directory, 'dependency.cjs')];
      rmSync(directory, { recursive: true, force: true });
    }
  }
  for (const entry of cases)
    for (const extension of ['ts', 'cts'])
      describe(`${entry.name}, .${extension}`, () => {
        for (const mode of ['inline', 'runtime'] as const)
          test(`executes the CommonJS boundary, ${mode}`, () => {
            const code = compile(
              entry.source,
              { typescript: 'strip', helpers: { mode, version: '7.29.7' } },
              `input.${extension}`,
            );
            expect(code).not.toMatch(/\bexport\s*=|\bimport\s+(?:type\s+)?\w+\s*=/);
            expect(code).not.toContain('@babel/runtime');
            expect(observe(code, entry.unloaded)).toEqual(entry.expected);
          });
      });
});
