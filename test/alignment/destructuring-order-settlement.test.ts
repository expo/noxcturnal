import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import destructuring from '@babel/plugin-transform-destructuring';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'array target evaluation follows eager consumption',
    source: `const events=[];const target={};const source={[Symbol.iterator](){events.push('iterator');return{next(){events.push('next');return{value:3,done:false};},return(){events.push('return');return{};}};}};function object(){events.push('target');return target;}[object().value]=source;globalThis.result=[events,target.value];`,
    native: [['iterator', 'target', 'next', 'return'], 3],
    baseline: [['iterator', 'next', 'return', 'target'], 3],
  },
  {
    name: 'computed key coercion follows target evaluation',
    source: `const events=[];const key={toString(){events.push('key');return 'x';}};function target(){events.push('target');return{};}({[key]:target().value}={x:1});globalThis.result=events;`,
    native: ['key', 'target'],
    baseline: ['target', 'key'],
  },
  {
    name: 'nested pattern failure follows extra consumption',
    source: `const events=[];let i=0;const source={[Symbol.iterator](){return{next(){events.push('next');return{value:i++===0?null:2,done:false};},return(){events.push('return');return{};}};}};try{const [{value},second]=source;}catch(error){events.push(error.name);}globalThis.result=events;`,
    native: ['next', 'return', 'TypeError'],
    baseline: ['next', 'next', 'return', 'TypeError'],
  },
];
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
for (const entry of cases) {
  test.each(['inline', 'runtime'] as const)(`${entry.name}, helpers=%s`, mode => {
    expect(observe(entry.source)).toEqual(entry.native);
    const reference = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [
        destructuring,
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
    expect(observe(reference)).toEqual(entry.baseline);
    const code = compile(entry.source, {
      transforms: { destructuring: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/\[object\(\)\.value\]\s*=|\{\s*\[key\]\s*:|const\s*\[\s*\{/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    else expect(code).not.toContain('@babel/runtime');
    expect(observe(code)).toEqual(entry.baseline);
  });
}
