import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'dynamic super constructor',
    native: 2,
    babel: 2,
    localFailure: true,
    source: `class Base{constructor(){this.value=1}}function Other(){this.value=2}class Child extends Base{constructor(){super()}}Object.setPrototypeOf(Child,Other);globalThis.result=new Child().value;`,
  },
  {
    name: 'unsuccessful strict super write',
    native: 'TypeError',
    babel: 'TypeError',
    localFailure: true,
    source: `class Base{}Object.defineProperty(Base.prototype,'value',{value:1,writable:false});class Child extends Base{write(){try{super.value=3;return 'accepted'}catch(e){return e.name}}}globalThis.result=new Child().write();`,
  },
  {
    name: 'super write wrapper binding collision',
    native: 3,
    babel: 3,
    localFailure: true,
    source: `class Base{}class Child extends Base{write(_value){return super.value=_value}}globalThis.result=new Child().write(3);`,
  },
  {
    name: 'super write keeps generator suspension',
    native: [1, 3],
    babel: [1, 3],
    localFailure: true,
    source: `class Base{}class Child extends Base{*write(){return super.value=yield 1}}const iterator=new Child().write();globalThis.result=[iterator.next().value,iterator.next(3).value];`,
  },
  {
    name: 'computed super key coerces before base selection',
    native: 2,
    babel: 1,
    localFailure: false,
    source: `class Base{get value(){return 1}}class Other{get value(){return 2}}class Child extends Base{read(key){return super[key]}}const key={[Symbol.toPrimitive](){Object.setPrototypeOf(Child.prototype,Other.prototype);return 'value'}};globalThis.result=new Child().read(key);`,
  },
  {
    name: 'super tag retains receiver',
    native: 3,
    babel: 'TypeError',
    localFailure: false,
    source: `class Base{tag(){return this.value}}class Child extends Base{read(){this.value=3;return super.tag\`text\`}}try{globalThis.result=new Child().read()}catch(e){globalThis.result=e.name}`,
  },
  {
    name: 'derived parameter closure this binding',
    native: true,
    babel: { error: 'ReferenceError' },
    localFailure: true,
    source: `class Base{}class Child extends Base{constructor(value=()=>this){super();this.matches=value()===this}}globalThis.result=new Child().matches;`,
  },
  {
    name: 'base field new.target environment',
    native: true,
    babel: false,
    localFailure: false,
    source: `class Value{value=new.target}globalThis.result=new Value().value===undefined;`,
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
// Shared deviations record compatibility limits; differing failures remain candidates.
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
      if (mode === 'runtime' && entry.name !== 'base field new.target environment')
        expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
    });
    test('Babel strict-class reference', () => {
      expect(run(referenceCode)).toEqual(entry.babel);
    });
    const check = test;
    check(
      entry.localFailure
        ? 'Noxcturnal native discrepancy'
        : 'Noxcturnal shares the Babel limitation',
      () => {
        expect(run(code)).toEqual(entry.localFailure ? entry.native : entry.babel);
      },
    );
  });
});
