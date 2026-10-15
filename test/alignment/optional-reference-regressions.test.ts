import { transformSync } from '@babel/core';
import optional from '@babel/plugin-transform-optional-chaining';
import typescript from '@babel/plugin-transform-typescript';
import { runInNewContext } from 'node:vm';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'computed key mutation retains the optional-call receiver',
    source: `let object={name:'first',m(){return this.name}};
      function key(){object={name:'second'};return 'm'}
      globalThis.result=object[key()]?.();`,
    expected: 'first',
  },
  {
    name: 'parenthesized method getter mutation retains the call receiver',
    source: `let object={name:'first',get m(){object={name:'second'};return function(){return this.name}}};
      globalThis.result=(((object?.m)))();`,
    expected: 'first',
  },
  {
    name: 'optional call results stay unbound inside a longer chain',
    source: `const object={m(){return function(){'use strict';return this===undefined}}};
      globalThis.result=[object?.m()?.(),(object?.m())?.(),((object.m?.()))()];`,
    expected: [true, true, true],
  },
  {
    name: 'mandatory grouped calls retain their receiver before outer optional access',
    source: `const object={value:3,m(){return {value:this.value}}};
      globalThis.result=[((object?.m))()?.value,((object?.m))?.()?.value];`,
    expected: [3, 3],
  },
  {
    name: 'grouped mandatory properties run even when a later access is optional',
    source: `const events=[];let object=null;
      try{((object?.a)).b?.[events.push('key')]}catch(error){events.push(error.name)}
      globalThis.result=events;`,
    expected: ['TypeError'],
  },
  {
    name: 'nested grouping preserves nullish deletion and skips keys',
    source: `const events=[];const object=null;
      globalThis.result=[delete (((object?.[events.push('key')]))),events];`,
    expected: [true, []],
  },
  {
    name: 'nested grouping deletes without reading the getter in a default',
    source: `const events=[];const object={get x(){events.push('get')}};
      function f(unused=(()=>0)(),removed=delete (((object?.x)))){return removed}
      globalThis.result=[f(),Object.hasOwn(object,'x'),events];`,
    expected: [true, false, []],
  },
  ...['function inner(x = 0){ return x }', '(x = 0) => x', 'class { method(x=0){return x} }'].map(
    nested => ({
      name: `recursive defaults following ${nested}`,
      source: `const first={name:'first',m(){return this.name}},second={name:'second',m:first.m};
      let object=first,entered=false;
      function get(){return object}function key(){if(!entered){entered=true;object=second;f()}return 'm'}
      function f(unused=${nested},value=get()?.[key()]?.()){return value}
      globalThis.result=f();`,
      expected: 'first',
    }),
  ),
];

describe.each(cases)('$name', ({ source, expected }) => {
  test.each([false, true])('preserves references with loose=%s', loose => {
    const observe = (code: string) => {
      const context: Record<string, unknown> = {};
      new Function('globalThis', code)(context);
      return context.result;
    };
    expect(observe(source)).toEqual(expected);
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [[optional, { loose }]],
    })!.code!;
    expect(observe(reference)).toEqual(expected);
    const code = compile(source, { transforms: { optionalChaining: { loose } } });
    expect(code).not.toContain('?.');
    expect(code).not.toContain('@babel/runtime');
    expect(observe(code)).toEqual(expected);
  });
});

describe.each(['as unknown', '!', 'satisfies unknown'])('TypeScript wrapper %s', wrapper => {
  test.each(['call', 'delete'])('preserves the %s reference', operation => {
    const base = `const events=[];const object={get x(){events.push('get');return 1},m(){return this===object}};`;
    const expression = operation === 'call' ? 'object?.m' : 'object?.x';
    const wrapped = wrapper === '!' ? `(${expression})!` : `(${expression}) ${wrapper}`;
    const source = `${base}globalThis.result=[${operation === 'call' ? `((${wrapped}))()` : `delete ((${wrapped}))`},Object.hasOwn(object,'x'),events];`;
    const reference = transformSync(source, {
      filename: 'input.ts',
      configFile: false,
      babelrc: false,
      plugins: [typescript, [optional, { loose: false }]],
    })!.code!;
    const code = compile(
      source,
      { typescript: 'strip', transforms: { optionalChaining: { loose: false } } },
      'input.ts',
    );
    const expected = [true, operation === 'call', []];
    for (const output of [reference, code]) {
      expect(output).not.toContain('?.');
      const context: Record<string, unknown> = {};
      runInNewContext(output, context);
      expect(context.result).toEqual(expected);
    }
  });
});

describe.each([
  [
    'direct eval',
    `let object={name:'first',get m(){eval("object={name:'second'}");return function(){return this.name}}};`,
  ],
  [
    'script global property',
    `var object={name:'first',get m(){globalThis.object={name:'second'};return function(){return this.name}}};`,
  ],
])('adopted static binding analysis: %s', (_name, declaration) => {
  test('matches Babel when the receiver write is absent from lexical references', () => {
    const source = `${declaration}globalThis.result=object.m?.();`;
    const reference = transformSync(source, {
      sourceType: 'script',
      configFile: false,
      babelrc: false,
      plugins: [[optional, { loose: false }]],
    })!.code!;
    const code = compile(source, { transforms: { optionalChaining: { loose: false } } });
    const observe = (input: string) => {
      const context: Record<string, unknown> = {};
      runInNewContext(input, context);
      return context.result;
    };
    expect(observe(source)).toBe('first');
    expect(observe(reference)).toBe('second');
    expect(code).not.toContain('?.');
    expect(observe(code)).toBe('second');
  });
});
