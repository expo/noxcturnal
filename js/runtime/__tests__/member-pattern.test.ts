import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  { name: 'plain', source: 'process.env.NODE_ENV;' },
  { name: 'comment', source: 'process /*comment*/ .env.NODE_ENV;' },
  { name: 'escaped identifier', source: String.raw`process.\u0065nv.NODE_ENV;` },
  { name: 'computed string', source: `process['env'].NODE_ENV;` },
];

test.each(cases)('member pattern matches through $name syntax', ({ source }) => {
  let matched: boolean | undefined;
  const plugin = defineNativePlugin({
    name: 'member-pattern',
    visitors: [
      defineVisitor('MemberExpression', { fields: ['memberPath'] }, path => {
        if (path.end === source.length - 1) matched = path.matchesPattern('process.env.NODE_ENV');
      }),
    ],
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'observe', plugins: [plugin] }],
    }),
  );
  expect(result.status).toBe('complete');
  expect(matched).toBe(true);
});
