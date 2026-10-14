import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'super optional call retains receiver',
    expected: 3,
    source: `class Base{read(){return this.value}}class Value extends Base{value=3;run(){return super.read?.()}}globalThis.result=new Value().run();`,
  },
];

function run(code: string) {
  const context: Record<string, unknown> = {};
  try {
    new Function('require', 'globalThis', code)(require, context);
  } catch (error) {
    return { error: (error as Error).name };
  }
  return context.result;
}

// Compile before test.fails so transformation errors cannot satisfy a regression.
describe.each(cases)('$name', entry => {
  test('native control', () => {
    expect(run(entry.source)).toEqual(entry.expected);
  });
  describe.each(['inline', 'runtime'] as const)('%s', mode => {
    let referenceCode: string;
    let code: string;
    beforeAll(() => {
      const reference = transformSync(entry.source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [
          [require('@babel/plugin-transform-class-properties'), { loose: true }],
          [require('@babel/plugin-transform-classes'), {}],
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
      referenceCode = reference!.code!;
      code = compile(entry.source, {
        transforms: { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      const classSyntax =
        /\bclass\s+(?:Value|Example|Base|Child|Other|Stamp)\b|\bclass\s*\{|#(?:value|method|field)\b/;
      expect(entry.source).toMatch(classSyntax);
      expect(referenceCode).not.toMatch(classSyntax);
      expect(code).not.toMatch(classSyntax);
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
    });
    test('Babel class reference', () => {
      expect(run(referenceCode)).toEqual(entry.expected);
    });
    test.fails('Noxcturnal preserves the optional super receiver', () => {
      expect(run(code)).toEqual(entry.expected);
    });
  });
});

// Babel declares an unsupported boundary for this AST-target family. Noxcturnal
// currently reports success but emits invalid JavaScript. The regression requires
// the currently completed output to execute correctly. A deliberate bailout
// repair would require updating the success expectation in the setup.
describe.each([
  { name: 'object assignment pattern', statement: '({ value: super.value } = { value: 3 });' },
  { name: 'array assignment pattern', statement: '[super.value] = [3];' },
  { name: 'for-of assignment head', statement: 'for (super.value of [3]) {}' },
])('super target in $name', entry => {
  const source = `class Base { set value(value) { this.saved = value; } }
class Value extends Base { run() { ${entry.statement} return this.saved; } }
globalThis.result = new Value().run();`;
  test('native target semantics', () => {
    expect(run(source)).toBe(3);
  });
  test('Babel exposes its unsupported target boundary', () => {
    expect(() =>
      transformSync(source, {
        babelrc: false,
        configFile: false,
        sourceType: 'script',
        plugins: [[require('@babel/plugin-transform-classes'), {}]],
      }),
    ).toThrow('Destructuring to a super field is not supported yet.');
  });
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    let code: string;
    beforeAll(() => {
      code = compile(source, {
        transforms: { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/\bclass\s+(?:Base|Value)\b/);
    });
    test.fails('completed class output preserves assignment target behavior', () => {
      expect(run(code)).toBe(3);
    });
  });
});
