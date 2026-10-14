import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
async function run(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  try {
    return ['fulfilled', await context.result];
  } catch (error) {
    return ['rejected', (error as Error).name];
  }
}
const cases = [
  {
    name: 'compound',
    body: `return super.x += await (log.push('rhs'),3);`,
    expected: [5, ['get', 'rhs', 'set:5']],
    broken: true,
  },
  {
    name: 'logical',
    body: `return super.x ||= await (log.push('rhs'),3);`,
    expected: [2, ['get']],
  },
  { name: 'update', body: `return super.x++;`, expected: [2, ['get', 'set:3']] },
  { name: 'tag', body: 'return super.read`value`;', expected: [true, []], selected: [false, []] },
  { name: 'grouped', body: `return (super.read)();`, expected: [true, []], broken: true },
  {
    name: 'computed',
    body: `return super[(log.push('key'),'read')](await (log.push('arg'),3));`,
    expected: [true, ['key', 'arg']],
  },
];
for (const kind of ['instance', 'static'])
  for (const entry of cases)
    for (const mode of ['inline', 'runtime'] as const)
      describe(`${kind} ${entry.name}, ${mode}`, () => {
        const outcomes = new Map<boolean, unknown>();
        beforeAll(async () => {
          const stat = kind === 'static' ? 'static ' : '';
          const source = `const log=[]; class B{${stat}get x(){log.push('get');return 2;} ${stat}set x(v){log.push('set:'+v);} ${stat}read(){return this===owner;}} class C extends B{${stat}async run(){${entry.body}}}const owner=${kind === 'static' ? 'C' : 'new C()'};globalThis.result=owner.run().then(value=>[value,log]);`;
          expect(await run(source)).toEqual(['fulfilled', entry.expected]);
          for (const asyncFunctions of entry.name === 'grouped' ? [true, false] : [true]) {
            const reference = transformSync(source, {
              sourceType: 'script',
              babelrc: false,
              configFile: false,
              plugins: [
                require('@babel/plugin-transform-classes'),
                ...(asyncFunctions ? [require('@babel/plugin-transform-async-to-generator')] : []),
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
            expect(await run(reference)).toEqual(['fulfilled', entry.selected ?? entry.expected]);
            const code = compile(source, {
              transforms: { classes: true, asyncFunctions },
              helpers: { mode, version: '7.29.7' },
            });
            expect(code).not.toMatch(/class\s+[BC]\b/);
            if (asyncFunctions) expect(code).not.toMatch(/async\s*(?:function|run)/);
            else expect(code).toContain('async function');
            expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
            outcomes.set(asyncFunctions, await run(code));
            if (entry.name === 'compound')
              expect(outcomes.get(asyncFunctions)).toEqual(['rejected', 'ReferenceError']);
          }
        });
        (entry.broken ? test.fails : test)('preserves selected combined-pass behavior', () => {
          expect(outcomes.get(true)).toEqual(['fulfilled', entry.selected ?? entry.expected]);
        });
        if (entry.name === 'grouped')
          test.fails('class lowering alone preserves the grouped call receiver', () => {
            expect(outcomes.get(false)).toEqual(['fulfilled', entry.expected]);
          });
      });
