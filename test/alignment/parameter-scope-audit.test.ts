import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'arrow nested staticblock this context',
    expected: 3,
    source: `const outer={value:9,make(){return ((value=1)=>class Value{static value=3;static{this.result=this.value}})()}};globalThis.result=outer.make().result;`,
  },
  {
    name: 'arrow nested computed class key outer this',
    expected: 3,
    source: `const outer={key:'read',make(){return ((value=1)=>class Value{[this.key](){return 3}})()}};globalThis.result=new (outer.make())().read();`,
  },
  {
    name: 'arrow nested class heritage outer this',
    expected: 3,
    source: `const outer={Base:class{read(){return 3}},make(){return ((value=1)=>class Value extends this.Base{})()}};globalThis.result=new (outer.make())().read();`,
  },
  {
    name: 'arrow body lexical arguments binding',
    expected: 3,
    source: `function outer(){return ((value=1)=>{let arguments=3;return arguments})()}globalThis.result=outer(9);`,
  },
  {
    name: 'arrow catch arguments binding',
    expected: 3,
    source: `function outer(){return ((value=1)=>{try{throw 3}catch(arguments){return arguments}})()}globalThis.result=outer(9);`,
  },
  {
    name: 'arrow nested class instance field this',
    expected: 3,
    source: `const outer={value:9,make(){return ((value=1)=>class Value{value=3;field=this.value})()}};globalThis.result=new (outer.make())().field;`,
  },
  {
    name: 'arrow nested class static field this',
    expected: 3,
    source: `const outer={value:9,make(){return ((value=1)=>class Value{static value=3;static field=this.value})()}};globalThis.result=outer.make().field;`,
  },
  {
    name: 'arrow nested class field newtarget',
    expected: true,
    source: `function Factory(){return ((value=1)=>class Value{field=new.target})()}globalThis.result=new (new Factory())().field===undefined;`,
  },
];

function run(code: string) {
  const context: Record<string, unknown> = {};
  try {
    new Function('require', 'globalThis', code)(require, context);
  } catch (error) {
    return { error: (error as Error).name };
  }
  return context.result;
}

// Only parameter lowering is selected; nested classes retain native syntax.
// Compile separately from the runtime assertions.
describe.each(cases)('$name', entry => {
  test('native control', () => {
    expect(run(entry.source)).toEqual(entry.expected);
  });
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let referenceCode: string;
    let code: string;
    beforeAll(() => {
      const reference = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [[require('@babel/plugin-transform-parameters'), {}]],
      });
      referenceCode = reference!.code!;
      code = compile(entry.source, {
        transforms: { parameters: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });

      const defaultArrow = /\(\s*value\s*=\s*1\s*\)\s*=>/;
      expect(entry.source).toMatch(defaultArrow);
      expect(code).not.toMatch(defaultArrow);
      expect(referenceCode).not.toMatch(defaultArrow);
    });
    test('Babel parameter reference', () => {
      expect(run(referenceCode)).toEqual(entry.expected);
    });
    test('parameter lowering preserves lexical environments', () => {
      expect(run(code)).toEqual(entry.expected);
    });
  });
});
