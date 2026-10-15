import { transformSync, type NodePath } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const cases = [
  ['plain', 'process.env.NODE_ENV;', false],
  ['comment', 'process /*comment*/ .env.NODE_ENV;', true],
  ['escaped identifier', String.raw`process.\u0065nv.NODE_ENV;`, true],
  ['computed string', `process['env'].NODE_ENV;`, true],
] as const;
describe.each(cases)('%s', (_name, source, _fails) => {
  let retained: unknown, babel: unknown;
  beforeAll(() => {
    transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [
        () => ({
          visitor: {
            MemberExpression(path: NodePath) {
              if (path.node.end === source.length - 1)
                babel = path.matchesPattern('process.env.NODE_ENV');
            },
          },
        }),
      ],
    });
    {
      const plugin = defineNativePlugin({
        name: 'pattern-audit',
        visitors: [
          defineVisitor('MemberExpression', { fields: ['memberPath'] }, path => {
            if (path.end === source.length - 1) {
              const result = path.matchesPattern('process.env.NODE_ENV');
              retained = result;
            }
          }),
        ],
      });
      const result = transform(
        source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'observe', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
    }
    expect(typeof retained).toBe('boolean');
  });
  test('Babel pattern control', () => expect(babel).toBe(true));
  test('retained member path control', () => expect(retained).toBe(true));
});
