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
  { route: 'Expression', expected: expressions, fails: true },
  { route: 'Declaration', expected: declarations, fails: true },
  { route: 'Statement', expected: declarations, fails: true },
  { route: 'FunctionExpression', expected: [expressions[0]], fails: false },
  { route: 'ClassExpression', expected: [expressions[1]], fails: false },
  { route: 'FunctionDeclaration', expected: [declarations[0]], fails: false },
  { route: 'ClassDeclaration', expected: [declarations[1]], fails: false },
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
  (entry.fails ? test.fails : test)('delivers the semantic category selected by the route', () => {
    expect(actual).toEqual(entry.expected);
  });
});
