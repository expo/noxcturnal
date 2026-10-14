import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'computed method key coercion order',
    native: ['coerce', 'next'],
    babel: ['next', 'coerce'],
    localFailure: true,
    source: `const events=[];const key={toString(){events.push('coerce');return 'first'}};class Value{[key](){}[(events.push('next'),'second')](){}}globalThis.result=events;`,
  },
  {
    name: 'duplicate super rejects rebinding',
    native: ['base', 'base', 'ReferenceError'],
    babel: ['base', 'base'],
    localFailure: false,
    source: `const events=[];class Base{constructor(){events.push('base')}}class Child extends Base{constructor(){super();try{super()}catch(e){events.push(e.name)}}}new Child();globalThis.result=events;`,
  },
  {
    name: 'this access before super rejects',
    native: true,
    babel: true,
    localFailure: true,
    source: `class Base{}class Child extends Base{constructor(){try{this.value=1;globalThis.result=false}catch(e){globalThis.result=true}super()}}new Child();`,
  },
  {
    name: 'ordinary method cannot serve as newTarget',
    native: 'TypeError',
    babel: 'accepted',
    localFailure: false,
    source: `class Value{method(){}}try{Reflect.construct(function(){},[],Value.prototype.method);globalThis.result='accepted'}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'ordinary method has no prototype',
    native: false,
    babel: true,
    localFailure: false,
    source: `class Value{method(){}}globalThis.result=Object.hasOwn(Value.prototype.method,'prototype');`,
  },
  {
    name: 'constructor call rejects before defaults',
    native: ['TypeError'],
    babel: ['default', 'TypeError'],
    localFailure: false,
    source: `const events=[];class Value{constructor(value=events.push('default')){}}try{Value()}catch(e){events.push(e.name)}globalThis.result=events;`,
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

// The reference uses strict class lowering and strict public-field definitions.
// Shared deviations record compatibility limits. Local assertions isolate only
// the compared behavior, without requiring unrelated Babel error-type fidelity.
// Compile before test.fails so transformation errors cannot satisfy a regression.
describe.each(cases)('$name', entry => {
  test('native control', () => {
    expect(run(entry.source)).toEqual(entry.native);
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
          [require('@babel/plugin-transform-class-properties'), { loose: false }],
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
      if (mode === 'inline') expect(code).not.toContain('require(');
      else {
        expect(referenceCode).toContain('@babel/runtime/helpers/');
        if (
          ['duplicate super rejects rebinding', 'this access before super rejects'].includes(
            entry.name,
          )
        )
          expect(code).toContain('@babel/runtime/helpers/');
      }
    });
    test('Babel strict-class reference', () => {
      expect(run(referenceCode)).toEqual(entry.babel);
    });
    const check = entry.localFailure ? test.fails : test;
    check(
      entry.localFailure
        ? 'Noxcturnal preserves the compared Babel behavior'
        : 'Noxcturnal shares the Babel limitation',
      () => {
        expect(run(code)).toEqual(entry.babel);
      },
    );
  });
});
