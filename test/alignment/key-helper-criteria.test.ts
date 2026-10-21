import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'object rest accepts null results from Symbol.toPrimitive',
    source:
      '\n const key={[Symbol.toPrimitive](){return null;}};try{const {[key]:value,...rest}={null:1,other:2};globalThis.result=[value,rest];}catch(error){globalThis.result=error.name;}\n    ',
    expected: 'TypeError',
  },
  {
    name: 'object rest treats null Symbol.toPrimitive methods as absent',
    source:
      "\n const key={[Symbol.toPrimitive]:null,toString(){return 'value';}};try{const {[key]:value,...rest}={value:1,other:2};globalThis.result=[value,rest];}catch(error){globalThis.result=error.name;}\n    ",
    expected: 'TypeError',
  },
  {
    name: 'object rest preserves symbols returned by ordinary key conversion',
    source:
      '\n const symbol=Symbol();const key={toString(){return symbol;}};try{const {[key]:value,...rest}={[symbol]:1,other:2};globalThis.result=[value,rest];}catch(error){globalThis.result=error.name;}\n    ',
    expected: 'TypeError',
  },
  {
    name: 'array destructuring rejects typed arrays with disabled iterators',
    source:
      '\n const source=new Uint8Array([1,2]);source[Symbol.iterator]=null;try{const [value]=source;globalThis.result=value;}catch(error){globalThis.result=error.name;}\n    ',
    expected: 1,
  },
  {
    name: 'array destructuring rejects spoofed typed array tags',
    source:
      "\n const source={0:1,length:1,[Symbol.toStringTag]:'Uint8Array'};try{const [value]=source;globalThis.result=value;}catch(error){globalThis.result=error.name;}\n    ",
    expected: 1,
  },
  {
    name: 'array destructuring rejects Maps with disabled iterators',
    source:
      "\n const source=new Map([['a',1]]);source[Symbol.iterator]=null;try{const [value]=source;globalThis.result=value;}catch(error){globalThis.result=error.name;}\n    ",
    expected: undefined,
  },
];
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(entry.name + ' follows Babel with %s helpers', mode => {
    const code = compile(entry.source, {
      transforms: { destructuring: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    const reference = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        require('@babel/plugin-transform-destructuring'),
        ...(mode === 'runtime'
          ? [
              [
                require('@babel/plugin-transform-runtime'),
                { version: '7.29.7', useESModules: false },
              ],
            ]
          : []),
      ],
    });
    expect(code).not.toMatch(/const\s+[\[{]/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    else expect(code).not.toContain('require(');
    for (const output of [code, reference!.code!]) {
      const context: Record<string, unknown> = {};
      new Function('require', 'globalThis', output)(require, context);
      expect(context.result).toEqual(entry.expected);
    }
  });
}
