import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  [
    'super getter constructs partial static receiver',
    `const events=[];class Base{static get build(){events.push(['get',this.early,this.late]);return new this()}}class Value extends Base{static early=3;field=(events.push('field'),this.constructor.early);static instance=super.build;static late=4}globalThis.result=[Value.instance.field,events];`,
    [3, [['get', 3, undefined], 'field']],
  ],
  [
    'static catches failed reentrant construction',
    `const events=[];class Base{static get build(){return new this()}}class Value extends Base{field=(()=>{events.push('field');throw 'failure'})();static{try{super.build}catch(error){events.push(error)}}static after=(events.push('after'),3)}globalThis.result=[Value.after,events];`,
    [3, ['field', 'failure', 'after']],
  ],
  [
    'super setter aborts remaining static initialization',
    `const events=[];let escaped;class Base{static set build(value){escaped=this;events.push(value.field);throw 'failure'}}try{class Value extends Base{field=3;static{super.build=new this()}static after=events.push('after')}}catch(error){events.push(error)}globalThis.result=[events,escaped.after,new escaped().field];`,
    [[3, 'failure'], undefined, 3],
  ],
] as const;
function run(code: string) {
  const context: any = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
for (const [name, source, expected] of cases) {
  describe(name, () => {
    const actual = new Map<string, unknown>();
    beforeAll(() => {
      expect(run(source)).toEqual(expected);
      for (const mode of ['inline', 'runtime'] as const) {
        const babel = transformSync(source, {
          babelrc: false,
          configFile: false,
          sourceType: 'script',
          plugins: [
            require('@babel/plugin-transform-class-static-block'),
            [require('@babel/plugin-transform-class-properties'), { loose: false }],
            [require('@babel/plugin-transform-classes'), { loose: false }],
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
        expect(babel).not.toMatch(/class (?:Value|Base)/);
        expect(run(babel)).toEqual(expected);
        const nox = compile(source, {
          transforms: { classes: true, classProperties: { loose: false }, classStaticBlock: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(nox).not.toMatch(/class (?:Value|Base)/);
        try {
          actual.set(mode, run(nox));
        } catch (error) {
          expect((error as Error).name).toBe('SyntaxError');
          expect((error as Error).message).toMatch(/super.*unexpected/i);
          actual.set(mode, { error: 'SyntaxError' });
        }
      }
    });
    for (const mode of ['inline', 'runtime'] as const) {
      test(mode, () => expect(actual.get(mode)).toEqual(expected));
    }
  });
}
