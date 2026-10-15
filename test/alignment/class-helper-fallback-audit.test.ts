import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'ordinary inheritance and super accessors',
    source: `class Base{constructor(x){this.x=x}get value(){return this.x}set value(v){this.x=v}method(){return this.x}static tag(){return this.name}}class Child extends Base{constructor(x){super(x)}method(){super.value=super.value+1;return super.method()}}const c=new Child(3);globalThis.result=[c.method(),c.value,c instanceof Base,Object.getOwnPropertyDescriptor(Child.prototype,'method').enumerable,Child.tag()];`,
    expected: [4, 4, true, false, 'Child'],
  },
  {
    name: 'native Error subclass',
    source: `class Custom extends Error{constructor(message){super(message);this.extra=2}read(){return this.message+this.extra}}const e=new Custom('x');globalThis.result=[e instanceof Error,e instanceof Custom,e.read()];`,
    expected: [true, true, 'x2'],
  },
];

function observe(code: string, module: boolean) {
  const child = spawnSync(
    process.execPath,
    [
      `--input-type=${module ? 'module' : 'commonjs'}`,
      '-e',
      `${code}\nconsole.log(JSON.stringify(globalThis.result));`,
    ],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 10_000 },
  );
  expect(child.error).toBeUndefined();
  expect(child.signal).toBeNull();

  expect(child.status, child.stderr).toBe(0);
  return JSON.parse(child.stdout);
}

describe.each(cases)('$name', entry => {
  for (const module of [false, true]) {
    for (const version of ['inline', '7.0.0-beta.0', '7.24.0', '7.29.7', '8.0.0']) {
      describe(`native ESM=${module}, declared helper version=${version}`, () => {
        let actual: unknown;
        beforeAll(() => {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          const source = `${module ? 'export {};' : ''}${entry.source}`;
          expect(observe(source, module)).toEqual(entry.expected);
          const babel = transformSync(source, {
            configFile: false,
            babelrc: false,
            sourceType: module ? 'module' : 'script',
            plugins: [
              [require('@babel/plugin-transform-classes'), { loose: false }],
              ...(version !== 'inline' && version !== '8.0.0'
                ? [[require('@babel/plugin-transform-runtime'), { version, useESModules: module }]]
                : []),
            ],
          })!.code!;
          expect(observe(babel, module)).toEqual(entry.expected);
          const code = compile(
            source,
            {
              transforms: { classes: true },
              helpers:
                version === 'inline'
                  ? { mode: 'inline' }
                  : { mode: 'runtime', moduleName: '@babel/runtime', version },
            },
            module ? 'input.mjs' : 'input.cjs',
          );
          expect(code).not.toMatch(/class (?:Base|Child|Custom)\b/);
          if (version === 'inline' || version === '8.0.0')
            expect(code).not.toContain('@babel/runtime/');
          else expect(code).toContain('@babel/runtime/helpers/');
          actual = observe(code, module);
        });
        test('executes class helpers in the selected module format', () =>
          expect(actual).toEqual(entry.expected));
      });
    }
  }
});
