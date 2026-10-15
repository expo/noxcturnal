import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import forOf from '@babel/plugin-transform-for-of';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

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
