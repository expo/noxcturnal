import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { transformSync } from '@babel/core';
import transformTypeScript from '@babel/plugin-transform-typescript';
import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
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
    babel: [false, 3, false],
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
    tsLoose: [3, 3],
  },
];
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', code)(context, require);
  return context.result;
}
function reference(source: string, useDefineForClassFields: boolean) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-parameter-property-'));
  try {
    const filename = join(directory, 'input.ts');
    writeFileSync(filename, source.replaceAll('globalThis.result', '(globalThis as any).result'));
    const program = ts.createProgram([filename], {
      target: ts.ScriptTarget.ES2022,
      useDefineForClassFields,
      types: [],
      skipLibCheck: true,
    });
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([]);
    let output = '';
    program.emit(undefined, (name, text) => {
      if (name.endsWith('.js')) output = text;
    });
    return output;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
for (const entry of cases) {
  describe(entry.name, () => {
    beforeAll(() => {
      expect(ts.version).toBe('5.9.3');
      expect(observe(reference(entry.source, true))).toEqual(entry.expected);
      expect(observe(reference(entry.source, false))).toEqual(
        entry.tsLoose ?? entry.loose ?? entry.expected,
      );
      const babel = transformSync(entry.source, {
        filename: 'input.ts',
        configFile: false,
        babelrc: false,
        plugins: [transformTypeScript],
      })!.code!;
      expect(observe(babel)).toEqual(entry.babel ?? entry.expected);
    });
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
