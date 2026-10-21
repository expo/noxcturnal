import { createRequire } from 'node:module';
import { spawnSync, execFileSync } from 'node:child_process';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const nativeNode = process.env.NOXCTURNAL_AUDIT_RESOURCE_NODE ?? process.execPath;
const nativeSupported = spawnSync(nativeNode, ['--eval', '{using x=null;}']).status === 0;
const cases = [
  {
    name: 'body lexical binding shadows resource',
    body: `for(using x of values){const x=9;log.push(x);}`,
    expected: [9, 'dispose:1', 9, 'dispose:2'],
  },
  {
    name: 'non-block body retains each iteration binding',
    body: `const reads=[];for(using x of values)reads.push(()=>x.id);log.push(reads.map(read=>read()));`,
    expected: ['dispose:1', 'dispose:2', [1, 2]],
  },
  {
    name: 'body throw disposes before escaping',
    body: `try{for(using x of values){log.push(x.id);throw new RangeError();}}catch(error){log.push(error.name);}`,
    expected: [1, 'dispose:1', 'RangeError'],
  },
  {
    name: 'labelled continue disposes each inner iteration',
    body: `outer:for(let index=0;index<2;index++){for(using x of values){log.push(x.id);continue outer;}}`,
    expected: [1, 'dispose:1', 1, 'dispose:1'],
  },
];
for (const entry of cases) {
  const source = `const log=[];const values=[1,2].map(id=>({id,[Symbol.dispose](){log.push('dispose:'+id);}}));${entry.body}globalThis.result=log;`;
  test.skipIf(!nativeSupported)(`${entry.name}, native`, () => {
    expect(
      JSON.parse(
        execFileSync(
          nativeNode,
          ['--eval', source + ';console.log(JSON.stringify(globalThis.result));'],
          { encoding: 'utf8' },
        ),
      ),
    ).toEqual(entry.expected);
  });
  test.each(['inline', 'runtime'] as const)(`${entry.name}, %s`, mode => {
    const reference = transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [
        require('@babel/plugin-transform-explicit-resource-management'),
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
    const code = compile(source, {
      transforms: { explicitResourceManagement: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/\busing\s+x\b/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    for (const output of [reference, code]) {
      const context: Record<string, unknown> = {};
      new Function('require', 'globalThis', output)(require, context);
      expect(context.result).toEqual(entry.expected);
    }
  });
}
