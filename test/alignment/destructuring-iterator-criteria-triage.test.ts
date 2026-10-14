import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// These inherited Babel helper limitations follow the adopted runtime baseline.
const cases = [
  [
    'array elisions do not read iterator values',
    "\n    const events = [];\n    const iterable = { [Symbol.iterator]() { return {\n      next() { return { done: false, get value() { events.push('value'); return 1; } }; },\n      return() { events.push('return'); return {}; }\n    }; } };\n    const [,] = iterable;\n    globalThis.result = events;\n      ",
  ],
  [
    'array destructuring rejects legacy iterator-only object',
    "\n    const input = { '@@iterator'() { return { next() { return { value: 1, done: false }; }, return() { return {}; } }; } };\n    try { const [value] = input; globalThis.result = value; }\n    catch (error) { globalThis.result = error.name; }\n      ",
  ],
  [
    'array destructuring rejects primitive iterator result objects',
    "\n const events=[];const iterable={[Symbol.iterator](){return {next(){events.push('next');return 1;},return(){events.push('return');return {};}};}};\n try{const [value]=iterable;events.push(value===undefined?'accepted':'value');}catch(error){events.push(error.name);}globalThis.result=events;\n    ",
  ],
  [
    'array destructuring retrieves iterator return once',
    "\n const events=[];const iterable={[Symbol.iterator](){return {next(){return {done:false,value:1};},get return(){events.push('get:return');return function(){events.push('return');return {};};}};}};\n const [value]=iterable;globalThis.result=[value,events];\n    ",
  ],
] as const;
const observations: Record<string, unknown> = {
  'array elisions do not read iterator values': ['value', 'return'],
  'array destructuring rejects legacy iterator-only object': 1,
  'array destructuring rejects primitive iterator result objects': ['next', 'return', 'accepted'],
  'array destructuring retrieves iterator return once': [1, ['get:return', 'get:return', 'return']],
};
function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
for (const [name, source] of cases) {
  test.each(['inline', 'runtime'] as const)(name + ' follows Babel with %s helpers', mode => {
    const code = compile(source, {
      transforms: { destructuring: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    const reference = transformSync(source, {
      babelrc: false,
      configFile: false,
      sourceType: 'script',
      plugins: [
        [require('@babel/plugin-transform-destructuring'), {}],
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
    expect(code).not.toMatch(/const\s*\[/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    else expect(code).not.toContain('require(');
    expect(run(reference!.code!)).toEqual(observations[name]);
    expect(run(code)).toEqual(observations[name]);
  });
}
