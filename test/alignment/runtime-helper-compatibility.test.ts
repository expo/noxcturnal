import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  ...[
    { name: 'async disposer call', symbol: 'asyncDispose' },
    { name: 'sync fallback disposer call', symbol: 'dispose' },
  ].map(({ name, symbol }) => ({
    name,
    transform: 'explicitResourceManagement',
    plugin: 'explicit-resource-management',
    source: `
      globalThis.result = (async () => {
        const log = [];
        function dispose() { log.push('dispose'); }
        dispose.call = () => log.push('call');
        { await using r = { [Symbol.${symbol}]: dispose }; }
        return log;
      })();
    `,
  })),
  {
    name: 'disposer promise then',
    transform: 'explicitResourceManagement',
    plugin: 'explicit-resource-management',
    source: `
      globalThis.result = (async () => {
        const log = [];
        const promise = Promise.resolve();
        promise.then = () => { log.push('own:then'); throw new Error('intercepted'); };
        try {
          await using r = { [Symbol.asyncDispose]() { log.push('dispose'); return promise; } };
          log.push('body');
        } catch (error) { log.push(error.message); }
        return log;
      })();
    `,
  },
  {
    name: 'null async disposal',
    transform: 'explicitResourceManagement',
    plugin: 'explicit-resource-management',
    source: `globalThis.result=(async()=>{const log=[];try{await using r={[Symbol.asyncDispose]:null,[Symbol.dispose](){log.push('dispose')}};log.push('body')}catch(e){log.push(e.name)}return log})();`,
  },
  {
    name: 'disposer call',
    transform: 'explicitResourceManagement',
    plugin: 'explicit-resource-management',
    source: `const log=[];function dispose(){log.push('dispose')}dispose.call=()=>log.push('call');{using r={[Symbol.dispose]:dispose};}globalThis.result=log;`,
  },
  {
    name: 'iterator call',
    transform: 'asyncGeneratorFunctions',
    plugin: 'async-generator-functions',
    source: `globalThis.result=(async()=>{const out=[];for(const symbol of [Symbol.asyncIterator,Symbol.iterator]){function acquire(){return [1][Symbol.iterator]();}acquire.call=()=>[2][Symbol.iterator]();for await(const x of {[symbol]:acquire})out.push(x)}return out})();`,
  },
  {
    name: 'noncallable iterator',
    transform: 'asyncGeneratorFunctions',
    plugin: 'async-generator-functions',
    source: `globalThis.result=(async()=>{try{for await(const x of {[Symbol.asyncIterator]:{call(){return [1][Symbol.iterator]()}}}){}return 'accepted'}catch(e){return e.name}})();`,
  },
];
// These assert the adopted Babel helper baseline, not native ECMAScript behavior.
describe.each(cases)('$name', entry => {
  test.each(['inline', 'runtime'] as const)('%s helper compatibility', async mode => {
    const run = async (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('require', 'globalThis', code)(require, context);
      return await context.result;
    };
    const code = compile(entry.source, {
      transforms: { [entry.transform]: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    const reference = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        [require('@babel/plugin-transform-' + entry.plugin), {}],
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
    expect(code).not.toMatch(/\b(?:await\s+)?using\s+r\s*=/);
    expect(code).not.toMatch(/for\s+await\s*\(/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    else expect(code).not.toContain('require(');
    const expected: Record<string, unknown> = {
      'async disposer call': ['call'],
      'sync fallback disposer call': ['call'],
      'disposer promise then': ['body', 'dispose', 'own:then', 'intercepted'],
      'null async disposal': ['TypeError'],
      'disposer call': ['call'],
      'iterator call': [2, 2],
      'noncallable iterator': 'accepted',
    };
    expect(await run(reference!.code!)).toEqual(expected[entry.name]);
    expect(await run(code)).toEqual(expected[entry.name]);
  });
});
