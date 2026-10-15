import { runInNewContext } from 'node:vm';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  runInNewContext(code, context);
  return context.result;
}

const folding = { optimize: { constantFolding: true } } as const;
const elimination = { optimize: { deadCodeElimination: true } } as const;

describe.each([
  ['conditional', (value: string) => `true ? ${value} : null`],
  ['and', (value: string) => `1 && ${value}`],
  ['or', (value: string) => `0 || ${value}`],
  ['coalescing', (value: string) => `null ?? ${value}`],
] as const)('%s value contexts', (_name, select) => {
  test.each([
    ['ordinary call', `(${select('object.method')})()`, true],
    ['optional call', `(${select('object.method')})?.()`, true],
    ['tag', `(${select('object.method')})\`text\``, true],
    ['delete', `[delete (${select('object.value')}), object.value, reads]`, [true, 7, 2]],
    [
      'typeof missing binding',
      `(()=>{try{return typeof (${select('missing')})}catch(e){return e.name}})()`,
      'ReferenceError',
    ],
    [
      'anonymous function name',
      `(()=>{const value=(${select('function(){}')});return value.name})()`,
      '',
    ],
    ['arrow name', `(()=>{const value=(${select('(()=>0)')});return value.name})()`, ''],
    ['class name', `(()=>{const value=(${select('class {}')});return value.name})()`, ''],
    [
      'indirect eval',
      `(()=>{let secret=1;return (${select('eval')})('typeof secret')})()`,
      'undefined',
    ],
  ])('%s', (_context, expression, expected) => {
    const source = `let reads=0; const object={method(){'use strict';return this===undefined},get value(){reads++;return 7}};globalThis.result=${expression};`;
    expect(observe(source)).toEqual(expected);
    const code = compile(source, folding);
    expect(observe(code)).toEqual(expected);
  });
});

test.each([
  `if(false){for(var hidden of []){}} return hidden;`,
  `if(true){}else{try{}catch(error){var hidden=1}} return hidden;`,
  `if(false){if(true){var hidden=sideEffect()}}return hidden;`,
  `if(false){{function hidden(){}}}return hidden;`,
])('unselected nested declarations retain their outer binding: %s', body => {
  const source = `function inspect(){${body}}globalThis.result=inspect();`;
  expect(observe(source)).toBeUndefined();
  expect(observe(compile(source, folding))).toBeUndefined();
});

test.each([
  `var value=0; {function value(){}} return typeof value;`,
  `var value=0; if(true) {function value(){}} return typeof value;`,
  `var value; const events=[]; const target={set value(v){events.push(typeof v)}}; with(target){var value=()=>1} return events.join();`,
  `var value; const events=[]; const target=new Proxy({value:0},{set(o,k,v){events.push(typeof v);return true}}); with(target){var value=function(){}} return events.join();`,
])('DCE retains implicit writes: %s', body => {
  const source = `function inspect(){${body}}globalThis.result=inspect();`;
  expect(observe(source)).toBe('function');
  expect(observe(compile(source, elimination))).toBe('function');
});

test.each([
  'function publicValue(){return 9}',
  'var publicValue=function(){return 9}',
  'let publicValue=()=>9',
  'const publicValue=()=>9',
])('script binding remains visible to later scripts: %s', declaration => {
  const context = {};
  runInNewContext(compile(declaration, elimination), context);
  expect(runInNewContext('publicValue()', context)).toBe(9);
});

test.each([String.raw`(\u0065val)`, String.raw`((ev\u0061l))`])(
  'escaped parenthesized eval %s',
  callee => {
    const source = `function inspect(){const hidden=()=>42;return ${callee}('hidden()')}globalThis.result=inspect();`;
    expect(observe(source)).toBe(42);
    expect(observe(compile(source, elimination))).toBe(42);
  },
);

test('UTF16 ordering, replacement characters, and isolated-surrogate arithmetic retain native values', () => {
  const expressions = [
    String.raw`'\u{10000}' < '\uE000'`,
    String.raw`'\u{10000}' > '\uFFFF'`,
    String.raw`'\uD800' < '\uE000'`,
    String.raw`'\uDFFF' >= '\u{10000}'`,
    String.raw`'\uFFFDd800' === '\uD800'`,
    String.raw`'\uD800' + '\uDC00'`,
    String.raw`'\uDC00' + 'tail'`,
    String.raw`+'\uD800'`,
    String.raw`'\uD800' == 0`,
    String.raw`'\uFFFDd800' + 'tail'`,
  ];
  const source = `globalThis.result=[${expressions.join(',')}];`;
  expect(observe(compile(source, folding))).toEqual(observe(source));
});

test('numeric string formatting and exponentiation exceptional values compose with comparisons', () => {
  const expressions = [
    ...[
      '1000000000000000.25',
      '-1000000000000000.25',
      '1e21',
      '1e-7',
      '1e-6',
      '5e-324',
      '-0',
      '1/0',
      '-1/0',
      '0/0',
    ].map(value => `''+(${value})`),
    ...['1', '-1', 'true'].flatMap(base =>
      ['1/0', '-1/0', '0/0', "'x'"].map(power => `((${base})**(${power}))===1`),
    ),
    `(0/0)**0`,
    `(-0)**3`,
    `(-0)**-3`,
    `(-1/0)**3`,
    `(-1/0)**-3`,
  ];
  const source = `globalThis.result=[${expressions.join(',')}];`;
  expect(observe(compile(source, folding))).toEqual(observe(source));
});
