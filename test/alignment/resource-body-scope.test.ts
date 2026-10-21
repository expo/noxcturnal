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
    name: 'static-block disposal precedes later static initialization',
    body: `class C{static{using resource=make(1);this.read=()=>resource.id;log.push('block');}static value=log.push('field');}log.push(C.read());`,
    expected: ['block', 'dispose:1', 'field', 1],
  },
  {
    name: 'nested try disposes before source catch and finally',
    body: `try{using resource=make(1);log.push('body');throw new RangeError();}catch(error){log.push(error.name);}finally{log.push('finally');}`,
    expected: ['body', 'dispose:1', 'RangeError', 'finally'],
  },
  {
    name: 'function-local strict directive survives disposal wrapping',
    body: `function read(){'use strict';using resource=make(1);log.push(this===undefined);return ()=>resource.id;}const readResource=read();log.push(readResource());`,
    expected: [true, 'dispose:1', 1],
    babel: [false, 'dispose:1', 1],
  },
];

for (const entry of cases) {
  const source = `const log=[];const make=id=>({id,[Symbol.dispose](){log.push('dispose:'+id);}});${entry.body}globalThis.result=log;`;
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
    expect(code).not.toMatch(/\busing\s+resource\b/);
    expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
    for (const [output, expected] of [
      [reference, entry.babel ?? entry.expected],
      [code, entry.expected],
    ] as const) {
      const context: Record<string, unknown> = {};
      new Function('require', 'globalThis', output)(require, context);
      expect(context.result).toEqual(expected);
    }
  });
}
