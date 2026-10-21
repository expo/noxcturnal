import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// Adopted Babel helper behavior; native controls remain in the compliance suite.
const cases = [
  [
    'array destructuring does not close after iterator value getter throws',
    'destructuring',
    "\n const events=[];const iterable={[Symbol.iterator](){return {next(){return {done:false,get value(){events.push('value');throw new Error('value');}};},return(){events.push('return');return {};}};}};\n try{const [value]=iterable;}catch(error){events.push(error.message);}globalThis.result=events;\n    ",
  ],
] as const;
const observations: Record<string, unknown> = {
  'array destructuring does not close after iterator value getter throws': [
    'value',
    'return',
    'value',
  ],
};
function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
for (const [name, transform, source] of cases) {
  test.each(['inline', 'runtime'] as const)(name + ' follows Babel with %s helpers', mode => {
    const code = compile(source, {
      transforms: { [transform]: true },
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
