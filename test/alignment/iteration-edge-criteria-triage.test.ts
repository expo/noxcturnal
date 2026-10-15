import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const source =
  "const events=[];const descriptor=Object.getOwnPropertyDescriptor(Number.prototype,'next');Object.defineProperty(Number.prototype,'next',{configurable:true,value(){events.push('next');return{done:true};}});try{try{for(const value of {[Symbol.iterator](){return 1;}}){}}catch(e){events.push(e.name);}}finally{if(descriptor)Object.defineProperty(Number.prototype,'next',descriptor);else delete Number.prototype.next;}globalThis.result=events;";
// Both transforms use Babel's for-of helper and accept this primitive iterator.
test.each(['inline', 'runtime'] as const)(
  'primitive iterator acquisition follows Babel with %s helpers',
  mode => {
    const code = compile(source, {
      transforms: { forOf: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    const reference = transformSync(source, {
      babelrc: false,
      configFile: false,
      sourceType: 'script',
      plugins: [
        [require('@babel/plugin-transform-for-of'), {}],
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
    expect(reference?.code).toBeTypeOf('string');
    expect(code).not.toMatch(/for\s*\([^;]*\bof\b/);
    if (mode === 'inline') expect(code).not.toContain('require(');
    else expect(code).toContain('@babel/runtime/helpers/createForOfIteratorHelper');
    if (mode === 'runtime') expect(reference!.code!).toContain('@babel/runtime/helpers/');
    for (const output of [reference!.code!, code]) {
      const context: Record<string, unknown> = {};
      new Function('require', 'globalThis', output)(require, context);
      expect(context.result).toEqual(['next']);
    }
  },
);
