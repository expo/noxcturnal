import { createRequire } from 'node:module';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const require = createRequire(import.meta.url);
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const source =
  'function declared(){};class Declared{};const f=function expression(){};const c=class Expression{};';
const declarations = ['function declared(){}', 'class Declared{}'];
const expressions = ['function expression(){}', 'class Expression{}'];
const cases = [
  { route: 'Expression', expected: expressions },
  { route: 'Declaration', expected: declarations },
  { route: 'Statement', expected: declarations },
  { route: 'FunctionExpression', expected: [expressions[0]] },
  { route: 'ClassExpression', expected: [expressions[1]] },
  { route: 'FunctionDeclaration', expected: [declarations[0]] },
  { route: 'ClassDeclaration', expected: [declarations[1]] },
] as const;

describe.each(cases)('$route distinguishes declaration and expression instances', entry => {
  let actual: string[];
  beforeAll(() => {
    const reference: string[] = [];
    traverse(parser.parse(source), {
      [entry.route](path: {
        isFunction(): boolean;
        isClass(): boolean;
        node: { start: number; end: number };
      }) {
        if (path.isFunction() || path.isClass()) {
          reference.push(source.slice(path.node.start, path.node.end));
        }
      },
    });
    expect(reference).toEqual(entry.expected);
    actual = [];
    const plugin = defineNativePlugin({
      name: 'collapsed-alias',
      visitors: [
        defineVisitor(entry.route, {}, path => {
          if (path.node.type === 'Function' || path.node.type === 'Class') {
            actual.push(source.slice(path.node.start, path.node.end));
          }
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
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toBe(source);
  });
  test('delivers the semantic category selected by the route', () => {
    expect(actual).toEqual(entry.expected);
  });
});
