import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { transformSync } from '@babel/core';
import transformTypeScript from '@babel/plugin-transform-typescript';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

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
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-ts-declaration-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source.replaceAll('globalThis.result', '(globalThis as any).result'));
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      types: [],
      skipLibCheck: true,
    });
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([]);
    let code = '';
    program.emit(undefined, (name, text) => {
      if (name.endsWith('.js')) code = text;
    });
    return code;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases)
  describe(entry.name, () => {
    beforeAll(() => {
      expect(ts.version).toBe('5.9.3');
      expect(observe(reference(entry.source))).toEqual(entry.expected);
      const babel = transformSync(entry.source, {
        filename: 'input.ts',
        configFile: false,
        babelrc: false,
        plugins: [[transformTypeScript, { allowDeclareFields: true }]],
      })!.code!;
      expect(observe(babel)).toEqual(entry.expected);
    });
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
