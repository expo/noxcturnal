import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
// These shared Babel scope limitations are adopted under CRITERIA.md;
// native differences and local static-block defects are tracked separately.
const cases = [
  [
    'catch destructuring defaults cannot see body lexical bindings',
    'destructuring',
    "\n const value='outer';let result;\n try{throw {};}catch({item=value}){let value='body';result=item;}\n globalThis.result=result;\n    ",
  ],
  [
    'catch destructuring default closures keep outer lexical bindings',
    'destructuring',
    "\n const value='outer';let result;try{throw {};}catch({read=()=>value}){let value='body';result=read();}\n globalThis.result=result;\n    ",
  ],
  [
    'destructuring assignments in parameter defaults isolate reentrant temporaries',
    'destructuring',
    '\n let a,b;function read(source,result=({a,b}=source)){return [result===source,b];}\n const inner={a:10,b:20};const outer={get a(){read(inner);return 1;},b:2};\n globalThis.result=read(outer);\n    ',
  ],
  [
    'destructuring assignments in field initializers isolate reentrant temporaries',
    'destructuring',
    '\n let a,b;let source;class Value{result=({a,b}=source);}\n const inner={a:10,b:20};const outer={get a(){source=inner;new Value();return 1;},b:2};source=outer;\n const value=new Value();globalThis.result=[value.result===outer,b];\n    ',
  ],
] as const;
const observations: Record<string, unknown> = {
  'catch destructuring defaults cannot see body lexical bindings': { error: 'ReferenceError' },
  'catch destructuring default closures keep outer lexical bindings': { value: 'body' },
  'destructuring assignments in parameter defaults isolate reentrant temporaries': {
    value: [false, 20],
  },
  'destructuring assignments in field initializers isolate reentrant temporaries': {
    value: [false, 20],
  },
};
function run(code: string) {
  const context: Record<string, unknown> = {};
  try {
    new Function('require', 'globalThis', code)(require, context);
    return { value: context.result };
  } catch (error) {
    return { error: (error as Error).name };
  }
}
for (const [name, transform, source] of cases) {
  test.each(['inline', 'runtime'] as const)(
    name + ' shared Babel limitation with %s helpers',
    mode => {
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
      expect(code).not.toMatch(/catch\s*\(\s*\{|\(\{\s*a,\s*b\s*\}\s*=/);
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
      expect(run(reference!.code!)).toEqual(observations[name]);
      expect(run(code)).toEqual(observations[name]);
    },
  );
}
