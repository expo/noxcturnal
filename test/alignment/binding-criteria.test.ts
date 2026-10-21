import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
// These observations follow the adopted Babel baseline; native differences remain
// independently covered in compliance/variables.test.ts.
const cases = [
  [
    'arguments mutate',
    'parameters',
    `function read(first=(arguments[1]=99),second){return [first,second,arguments[1]];}globalThis.result=read(undefined,2);`,
  ],
  [
    'rest mutate',
    'parameters',
    `function read(first=(arguments[1]=99),...rest){return [rest,arguments[1]];}globalThis.result=read(undefined,2,3);`,
  ],
  [
    'default target order',
    'destructuring',
    `const events=[];const output={};function target(){events.push('target');return output;}const source={get value(){events.push('get');return 3;}};({value:target().value=1}=source);globalThis.result=[output.value,events];`,
  ],
  [
    'array iterator',
    'destructuring',
    `const array=[1,2];array[Symbol.iterator]=function*(){yield 9;};const [value]=array;globalThis.result=value;`,
  ],
  [
    'eager defaults',
    'destructuring',
    `const log=[];const source={[Symbol.iterator](){return {next(){log.push('next');return {value:undefined,done:false};},return(){log.push('return');return {};}}}};const [a=(log.push('a'),1),b=(log.push('b'),2)]=source;globalThis.result=log;`,
  ],
] as const;
const observations: Record<string, unknown> = {
  'arguments mutate': [99, 99, 99],
  'rest mutate': [[99, 3], 99],
  'default target order': [3, ['get', 'target']],
  'array iterator': 1,
  'eager defaults': ['next', 'next', 'return', 'a', 'b'],
};

function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

for (const [name, transform, source] of cases) {
  // Parameter lowering emits no helper, so a second helper mode is redundant.
  const modes =
    transform === 'parameters' ? (['inline'] as const) : (['inline', 'runtime'] as const);
  test.each(modes)(name + ' follows Babel with %s helpers', mode => {
    const code = compile(source, {
      transforms: { [transform]: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    const reference = transformSync(source, {
      babelrc: false,
      configFile: false,
      sourceType: 'script',
      plugins: [
        [require('@babel/plugin-transform-' + transform), {}],
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
    if (transform === 'parameters') expect(code).not.toMatch(/function read\(first\s*=/);
    else expect(code).not.toMatch(/(?:const \[|target\(\)\.value\s*=\s*1)/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    else expect(code).not.toContain('require(');
    expect(run(reference!.code!)).toEqual(observations[name]);
    expect(run(code)).toEqual(observations[name]);
  });
}
