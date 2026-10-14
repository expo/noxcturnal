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
function reference(source: string) {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-ts-expression-'));
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
        plugins: [transformTypeScript],
      })!.code!;
      expect(observe(babel)).toEqual(entry.expected);
    });
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
