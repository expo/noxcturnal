import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'single if body',
    body: 'if (true) for await (const x of [1,2]) out.push(() => x);',
    expected: [1, 2],
  },
  {
    name: 'single while body',
    body: 'let pass=0; while(pass++<1) for await (const x of [1,2]) out.push(() => x);',
    expected: [1, 2],
  },
  {
    name: 'switch consequent',
    body: 'switch(1){case 1: for await(const x of [1,2]) out.push(()=>x);break;}',
    expected: [1, 2],
  },
  {
    name: 'assignment target setter',
    body: 'const box={set value(x){out.push(()=>x)}};for await(box.value of [1,2]) {}',
    expected: [1, 2],
  },
  {
    name: 'destructured loop binding',
    body: 'for await(const [x] of [[1],[2]]) out.push(()=>x);',
    expected: [1, 2],
  },
  {
    name: 'body binding shadows head',
    body: 'for await(const x of [1,2]) {let x=3;out.push(()=>x);}',
    expected: [3, 3],
  },
  {
    name: 'empty body exhausts iterator',
    body: 'const source={async *[Symbol.asyncIterator](){out.push(()=>1);yield 1;out.push(()=>2);yield 2;out.push(()=>3);}};for await(const x of source) {}',
    expected: [1, 2, 3],
  },
];
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const mode of ['inline', 'runtime'] as const) {
  for (const entry of cases) {
    test(`${entry.name}, ${mode}`, async () => {
      const source = `globalThis.result=(async()=>{const out=[];${entry.body}return out.map(read=>read());})();`;
      expect(await run(source)).toEqual(entry.expected);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-async-generator-functions'),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ],
      })!.code!;
      expect(await run(reference)).toEqual(entry.expected);
      const code = compile(source, {
        transforms: { asyncGeneratorFunctions: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/for\s+await|async\s*\*/);
      expect(await run(code)).toEqual(entry.expected);
    });
  }
}
