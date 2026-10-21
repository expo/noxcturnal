import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
// Adopted Babel baseline for arrow/function reflection and inferred names.
const cases = [
  [
    'parameter lowering preserves arrow non-constructability and absence of prototype',
    'parameters',
    "\n      const read = (value = 1) => value;\n      let outcome;\n      try {\n        new read();\n        outcome = 'constructed';\n      } catch (e) {\n        outcome = e.name;\n      }\n      globalThis.result = [\n        outcome,\n        Object.prototype.hasOwnProperty.call(read, 'prototype'),\n      ];\n    ",
  ],
  [
    'parameter defaults preserve anonymous function names',
    'parameters',
    '\n      function read(value = function () {}) {\n        return value.name;\n      }\n      globalThis.result = read();\n    ',
  ],
  [
    'destructuring defaults preserve anonymous function names in bindings and assignments',
    'destructuring',
    '\n      const { value = function () {} } = {};\n      let other;\n      ({ other = function () {} } = {});\n      globalThis.result = [value.name, other.name];\n    ',
  ],
] as const;
const observations: Record<string, unknown> = {
  'parameter lowering preserves arrow non-constructability and absence of prototype': [
    'constructed',
    true,
  ],
  'parameter defaults preserve anonymous function names': '',
  'destructuring defaults preserve anonymous function names in bindings and assignments': ['', ''],
};
function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
for (const [name, transform, source] of cases) {
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
    if (transform === 'parameters') expect(code).not.toMatch(/=>|function read\(value\s*=/);
    else expect(code).not.toMatch(/const\s*\{\s*value/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
    else expect(code).not.toContain('require(');
    expect(run(reference!.code!)).toEqual(observations[name]);
    expect(run(code)).toEqual(observations[name]);
  });
}
