import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const source = `let recurse=true,second;class Value{constructor(){this.stored=0}self(){return this}get #value(){if(recurse){recurse=false;Value.write(second)}return 0}set #value(value){this.stored=value}static write(obj,value=(obj.self().#value ||= 3)){return value}}const first=new Value();second=new Value();Value.write(first);globalThis.result=[first.stored,second.stored];`;

function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
test('native reentrant private default', () => expect(run(source)).toEqual([3, 3]));
test.each([
  ['parameters', 'logical-assignment-operators'],
  ['logical-assignment-operators', 'parameters'],
])('Babel plugin order %s then %s preserves activation', (first, second) => {
  const output = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [first, second].map(p => require('@babel/plugin-transform-' + p)),
  })!.code!;
  expect(output).not.toContain('||=');
  expect(run(output)).toEqual([3, 3]);
});
test('one native phase preserves reentrant default temporaries', () => {
  const output = compile(source, {
    transforms: { parameters: true, logicalAssignmentOperators: true },
  });
  expect(output).not.toContain('||=');
  expect(output).not.toMatch(/static\s+write\s*\([^)]*=/);
  expect(run(output)).toEqual([3, 3]);
});
test('parameter phase before logical phase preserves activation', () => {
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [
        { name: 'parameters', native: { transforms: { parameters: true } } },
        { name: 'logical', native: { transforms: { logicalAssignmentOperators: true } } },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).not.toContain('||=');
  expect(run(result.code)).toEqual([3, 3]);
});
