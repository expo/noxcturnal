import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const done = { value: undefined, done: true };
const cases = [
  {
    name: 'completed generator settles all request kinds',
    body: `log.push('body');yield 1;return 2;`,
    consume: `await it.next();await it.next();return [await it.next(),await it.return(Promise.resolve(7)),await it.throw(failure).then(()=>false,error=>error===failure),log];`,
    expected: [done, { value: 7, done: true }, true, ['body']],
  },
  {
    name: 'throw before first next does not enter body',
    body: `log.push('body');try{yield 1;}finally{log.push('finally');}`,
    consume: `const rejected=await it.throw(failure).then(()=>false,error=>error===failure);return [rejected,await it.next(),log];`,
    expected: [true, done, []],
  },
  {
    name: 'return before first next awaits value without entering body',
    body: `log.push('body');try{yield 1;}finally{log.push('finally');}`,
    consume: `return [await it.return(Promise.resolve(7)),await it.next(),log];`,
    expected: [{ value: 7, done: true }, done, []],
  },
  {
    name: 'queued next waits for current await',
    body: `log.push('start');yield await gate;log.push('resume');yield 2;log.push('end');`,
    consume: `const first=it.next(),second=it.next();release(1);return [await Promise.all([first,second]),await it.next(),log];`,
    expected: [
      [
        { value: 1, done: false },
        { value: 2, done: false },
      ],
      done,
      ['start', 'resume', 'end'],
    ],
  },
  {
    name: 'queued throw enters suspended catch after first yield',
    body: `log.push('start');try{yield await gate;}catch(error){log.push(error===failure?'caught':'unexpected');yield 9;}finally{log.push('finally');}`,
    consume: `const first=it.next(),second=it.throw(failure);release(1);return [await Promise.all([first,second]),await it.next(),log];`,
    expected: [
      [
        { value: 1, done: false },
        { value: 9, done: false },
      ],
      done,
      ['start', 'caught', 'finally'],
    ],
  },
  {
    name: 'queued return survives yielding finally',
    body: `try{yield await gate;}finally{log.push('finally');yield 2;}`,
    consume: `const first=it.next(),second=it.return(7);release(1);return [await Promise.all([first,second]),await it.next(),log];`,
    expected: [
      [
        { value: 1, done: false },
        { value: 2, done: false },
      ],
      { value: 7, done: true },
      ['finally'],
    ],
  },
  {
    name: 'rejected yielded value resumes catch before next queued request',
    body: `try{yield Promise.reject(failure);}catch(error){log.push(error===failure?'caught':'unexpected');yield 3;}return 4;`,
    consume: `const first=it.next(),second=it.next();return [await Promise.all([first,second]),await it.next(),log];`,
    expected: [
      [
        { value: 3, done: false },
        { value: 4, done: true },
      ],
      done,
      ['caught'],
    ],
  },
];
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const mode of ['inline', 'runtime'] as const)
  for (const entry of cases)
    test(`${entry.name}, ${mode}`, async () => {
      const source = `globalThis.result=(async()=>{const log=[],failure={};let release;const gate=new Promise(resolve=>release=resolve);async function* values(){${entry.body}}const it=values();${entry.consume}})();`;
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
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/async\s+function\s*\*/);
      expect(await run(code)).toEqual(entry.expected);
    });
