import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import forOf from '@babel/plugin-transform-for-of';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

describe('for of intrinsics', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'shadowed Symbol and direct eval on a generic iterable',
      source: `const iterable=new Set([1,2]);function read(Symbol){const out=[];for(const value of iterable)out.push([value,eval('Symbol')]);return out;}globalThis.result=read('parameter');`,
      expected: [
        [1, 'parameter'],
        [2, 'parameter'],
      ],
    },
    {
      name: 'Symbol restored after module initialization but before acquisition',
      source: `const original=Symbol;const iterable=new Set([1,2]);globalThis.Symbol=undefined;
      function read(Symbol){const out=[];for(const value of iterable)out.push(value);return out;}
      globalThis.Symbol=original;globalThis.result=read(null);`,
      expected: [1, 2],
    },
    {
      name: 'Symbol restored during iterable evaluation',
      source: `const original=Symbol;const iterable=new Set([1,2]);globalThis.Symbol=undefined;
      function read(Symbol){const out=[];for(const value of (globalThis.Symbol=original,iterable))out.push(value);return out;}
      globalThis.result=read(null);`,
      expected: [1, 2],
    },
    {
      name: 'unrelated Symbol scopes do not affect a generic iterable',
      source: `function unrelated(Symbol){return Symbol;}const out=[];for(const value of new Set([1,2]))out.push(value);globalThis.result=out;`,
      expected: [1, 2],
    },
  ];

  describe.each(cases)('$name', ({ source, expected }) => {
    const observe = (code: string) => runInNewContext(code + ';globalThis.result', { require });
    test('native and pinned Babel controls', () => {
      expect(observe(source)).toEqual(expected);
      const babel = transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [forOf],
      })!.code!;
      expect(observe(babel)).toEqual(expected);
    });
    test.each(['inline', 'runtime'] as const)('%s lowering', mode => {
      const code = compile(source, { transforms: { forOf: true }, helpers: { mode } });
      expect(code).not.toMatch(/for\s*\([^;]*\bof\b/);
      expect(observe(code)).toEqual(expected);
    });
  });
});

describe('for of label chain', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'continue to outer label in a for-of label chain',
      source: `const out = [];
outer: inner: for (const value of [1, 2]) {
  out.push(value);
  continue outer;
}
globalThis.result = out;`,
      expected: [1, 2],
      knownFailure: false,
    },
    {
      name: 'continue to innermost label in a for-of label chain',
      source: `const out = [];
outer: inner: for (const value of [1, 2]) {
  out.push(value);
  continue inner;
}
globalThis.result = out;`,
      expected: [1, 2],
      knownFailure: false,
    },
    {
      name: 'break to outer label in a for-of label chain',
      source: `const out = [];
outer: inner: for (const value of [1, 2]) {
  out.push(value);
  break outer;
}
globalThis.result = out;`,
      expected: [1],
      knownFailure: false,
    },
  ];
  function run(code: string): unknown {
    const context: Record<string, unknown> = {};
    new Function('globalThis', code)(context);
    return context.result;
  }

  describe.each(cases)('$name', ({ source, expected, knownFailure }) => {
    let code: string;
    let babel: string;
    beforeAll(() => {
      code = compile(source, { transforms: { forOf: true }, helpers: { mode: 'inline' } });
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [require('@babel/plugin-transform-for-of')],
      });
      expect(reference?.code).toBeTypeOf('string');
      babel = reference!.code!;
      expect(code).not.toMatch(/for\s*\([^;]*\bof\b/);
    });
    test('native control', () => {
      expect(run(source)).toEqual(expected);
    });
    test('Babel control', () => {
      expect(run(babel)).toEqual(expected);
    });
    const transformedTest = knownFailure ? test.fails : test;
    transformedTest('transformed execution', () => {
      expect(run(code)).toEqual(expected);
    });
  });
});

describe('for of baseline settlement', () => {
  const observe = (code: string): unknown => runInNewContext(code + ';globalThis.result');
  function reference(source: string): string {
    return transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [forOf],
    })!.code!;
  }
  const cases = [
    {
      name: 'own next.call override',
      source: `const events=[];function next(){events.push('next');return {done:true};}next.call=()=>{events.push('override');return {done:true};};for(const value of {[Symbol.iterator](){return {next};}}){}globalThis.result=events;`,
      expected: ['next'],
    },
    {
      name: 'own return.call override',
      source: `const events=[];function close(){events.push('close');return {};}close.call=()=>{events.push('override');return {};};for(const value of {[Symbol.iterator](){return {next(){return {done:false,value:1};},return:close};}}){break;}globalThis.result=events;`,
      expected: ['close'],
    },
    {
      name: 'noncallable return with call property',
      source: `const events=[];try{for(const value of {[Symbol.iterator](){return {next(){return {done:false,value:1};},return:{call(){events.push('override');return {};}}};}}){break;}}catch(error){events.push(error.name);}globalThis.result=events;`,
      expected: ['TypeError'],
    },
  ];
  describe.each(cases)('for-of dispatch baseline: $name', ({ source, expected }) => {
    let actual: unknown;
    beforeAll(() => {
      expect(observe(source)).toEqual(expected);
      expect(observe(reference(source))).toEqual(expected);
      const code = compile(source, { transforms: { forOf: true } });
      expect(code).not.toMatch(/for\s*\([^)]*\bof\b/);
      expect(code).not.toContain('@babel/runtime');
      actual = observe(code);
    });
    test('preserves the cached method call under the Babel baseline', () =>
      expect(actual).toEqual(expected));
  });

  test('loop-head TDZ is an adopted shared placement limitation', () => {
    const source = `let values=[1];try{for(let values of values){}globalThis.result='accepted';}catch(error){globalThis.result=error.name;}`;
    expect(observe(source)).toBe('ReferenceError');
    expect(observe(reference(source))).toBe('accepted');
    const code = compile(source, { transforms: { forOf: true } });
    expect(code).not.toMatch(/for\s*\([^)]*\bof\b/);
    expect(code).not.toContain('@babel/runtime');
    expect(observe(code)).toBe('accepted');
  });

  test('primitive step with inherited done retains shared validation limitation', () => {
    const source = `let reads=0;Object.defineProperty(Number.prototype,'done',{get(){reads++;return true;},configurable:true});try{for(const value of {[Symbol.iterator](){return {next(){return 1;}};}}){}globalThis.result=[reads,'accepted'];}catch(error){globalThis.result=[reads,error.name];}`;
    expect(observe(source)).toEqual([0, 'TypeError']);
    expect(observe(reference(source))).toEqual([2, 'accepted']);
    const code = compile(source, { transforms: { forOf: true } });
    expect(code).not.toMatch(/for\s*\([^)]*\bof\b/);
    expect(code).not.toContain('@babel/runtime');
    expect(observe(code)).toEqual([2, 'accepted']);
  });
});
