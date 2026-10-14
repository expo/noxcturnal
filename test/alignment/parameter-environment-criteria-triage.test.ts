import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// Shared transform behavior; these parameter-only cases emit no Babel helpers.
const cases = [
  [
    'default parameters named arguments do not shadow generated argument reads',
    '\n      function read(arguments = 1) {\n        return arguments;\n      }\n      globalThis.result = [read(), read(2)];\n    ',
  ],
  [
    'non-simple parameters preserve the throwing arguments.callee accessor',
    '\n      function read(value = 1) {\n        try {\n          return arguments.callee === read;\n        } catch (e) {\n          return e.name;\n        }\n      }\n      globalThis.result = read();\n    ',
  ],
  [
    'parameter arrows preserve lexical this in direct eval',
    "\n function make(){return (value=1)=>eval('this.value');}\n const read=make.call({value:3});globalThis.result=read.call({value:9});\n    ",
  ],
  [
    'parameter arrows preserve lexical arguments in direct eval',
    "\n function make(value){return (unused=1)=>eval('arguments[0]');}\n globalThis.result=make(3)(9);\n    ",
  ],
  [
    'rest array creation bypasses inherited numeric setters',
    "\n const original=Object.getOwnPropertyDescriptor(Array.prototype,'0');let calls=0;\n try{Object.defineProperty(Array.prototype,'0',{configurable:true,set(value){calls++;}});function read(...rest){return [Object.hasOwn(rest,'0'),rest[0]];}const value=read(1);globalThis.result=[value,calls];}finally{if(original)Object.defineProperty(Array.prototype,'0',original);else delete Array.prototype[0];}\n    ",
  ],
  [
    'rest array creation bypasses inherited nonwritable numeric properties',
    "\n const original=Object.getOwnPropertyDescriptor(Array.prototype,'0');\n try{Object.defineProperty(Array.prototype,'0',{configurable:true,value:99,writable:false});function read(...rest){return [Object.hasOwn(rest,'0'),rest[0]];}try{globalThis.result=read(1);}catch(error){globalThis.result=error.name;}}finally{if(original)Object.defineProperty(Array.prototype,'0',original);else delete Array.prototype[0];}\n    ",
  ],
] as const;
const observations: Record<string, unknown> = {
  'default parameters named arguments do not shadow generated argument reads': {
    error: 'ReferenceError',
  },
  'non-simple parameters preserve the throwing arguments.callee accessor': { value: true },
  'parameter arrows preserve lexical this in direct eval': { value: 9 },
  'parameter arrows preserve lexical arguments in direct eval': { value: 9 },
  'rest array creation bypasses inherited numeric setters': { value: [[false, undefined], 1] },
  'rest array creation bypasses inherited nonwritable numeric properties': { value: [false, 99] },
};
function run(code: string) {
  const context: Record<string, unknown> = {};
  try {
    new Function('globalThis', code)(context);
    return { value: context.result };
  } catch (error) {
    return { error: (error as Error).name };
  }
}
for (const [name, source] of cases) {
  test(name + ' shared Babel limitation', () => {
    const code = compile(source, { transforms: { parameters: true } });
    const reference = transformSync(source, {
      babelrc: false,
      configFile: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-parameters')],
    });
    expect(reference?.code).toBeTypeOf('string');
    expect(code).not.toMatch(/function read\((?:arguments|value)\s*=|\.\.\.rest|=>/);
    expect(code).not.toContain('require(');
    expect(run(reference!.code!)).toEqual(observations[name]);
    expect(run(code)).toEqual(observations[name]);
  });
}
