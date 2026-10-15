import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const source = `/*${'x'.repeat(100_000)}*/ 3;`;

test.each([
  { method: 'prependToProgram', eager: false },
  { method: 'appendToProgram', eager: false },
  { method: 'ensureHelper', eager: false },
  { method: 'prependToProgram', eager: true },
] as const)('$method with eager=$eager', ({ method, eager }) => {
  const plugin = defineNativePlugin({
    name: 'program-insertion',
    visitors: eager ? [defineVisitor('NumericLiteral', { scope: true }, () => {})] : [],
    pre(context) {
      if (method === 'ensureHelper') context.ensureHelper('marker', '0;');
      else context[method]('0;');
    },
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'insert', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).toContain('0;');
});
