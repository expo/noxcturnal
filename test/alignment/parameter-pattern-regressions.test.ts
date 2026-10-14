import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

describe.each(['inline', 'runtime'] as const)('%s literal exclusions', mode => {
  test.each(['1e21', '1e-7', '0xff', '0xffn', '1000000000000000000000000000000000n'])(
    'normalizes %s with JavaScript property-key semantics',
    key => {
      for (const assignment of [false, true]) {
        const source = `${assignment ? 'let value, rest; (' : 'const '}{${key}:value,...rest}={${key}:1,other:2}${assignment ? ')' : ''};globalThis.result=[value,rest];`;
        expect(observe(source)).toEqual([1, { other: 2 }]);
        const code = compile(source, {
          transforms: { destructuring: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toContain('...rest');
        expect(observe(code)).toEqual([1, { other: 2 }]);
      }
    },
  );
});

test('standalone object rest does not select unrelated outer default parameters', () => {
  const source = `function read(value = (() => { const {a,...rest}={a:1,b:2};return rest; })()) { return value; }globalThis.result=read();`;
  const code = compile(source, {
    transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
  });
  expect(code).toMatch(/function read\(value\s*=/);
  expect(code).not.toContain('...rest');
  expect(observe(code)).toEqual({ b: 2 });
});

describe.each(['function', 'method', 'class'] as const)('%s generator default boundary', kind => {
  test.each([false, true])('async=%s initializes before returning the iterator', async => {
    const body = `(value = (events.push('default'), 2)) { yield value; }`;
    const definition =
      kind === 'function'
        ? `${async ? 'async ' : ''}function* read${body}`
        : kind === 'method'
          ? `const object = { ${async ? 'async ' : ''}*read${body} }; const read=()=>object.read();`
          : `class Value { ${async ? 'async ' : ''}*read${body} } const read=()=>new Value().read();`;
    const source = `const events=[];${definition}read();events.push('returned');globalThis.result=events;`;
    expect(observe(source)).toEqual(['default', 'returned']);
    const code = compile(source, { transforms: { parameters: true } });
    expect(code).not.toMatch(/read\(value\s*=/);
    expect(observe(code)).toEqual(['default', 'returned']);
  });
});
