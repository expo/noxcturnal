import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  isExpression,
  isExpressionType,
  isNodeType,
  transform,
} from '../../index';

describe.each([
  ['ImportMeta', 'const value = import.meta;', 'input.mjs'],
  ['NewTarget', 'function read() { const value = new.target; }', 'input.js'],
  ['JSXElement', 'const value = <View />;', 'input.jsx'],
  ['JSXFragment', 'const value = <>text</>;', 'input.jsx'],
] as const)('Expression alias includes %s', (type, source, filename) => {
  const direct: string[] = [];
  const alias: string[] = [];
  const expressionChildren: string[] = [];
  let predicates: boolean[];
  let concreteContractError: unknown;

  beforeAll(() => {
    const plugin = defineNativePlugin({
      name: 'expression-alias-audit',
      visitors: [
        defineVisitor(type, {}, path => {
          direct.push(path.node.type);
          predicates = [
            isExpression(path.node),
            isExpressionType(path.node.type),
            isNodeType(path.node, 'Expression'),
          ];
        }),
        defineVisitor('Expression', {}, path => alias.push(path.node.type)),
        defineVisitor(
          'VariableDeclarator',
          { children: { init: { route: 'Expression' } } },
          path => {
            const child = path.getChild('init');
            if (child) expressionChildren.push(child.node.type);
          },
        ),
      ],
    });
    const result = transform(
      source,
      filename,
      defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    expect(direct).toEqual([type]);
    try {
      defineNativePipeline({
        phases: [
          {
            name: 'concrete-child',
            plugins: [
              defineNativePlugin({
                name: 'concrete-expression-child',
                visitors: [
                  defineVisitor(
                    'VariableDeclarator',
                    // @ts-expect-error The incomplete alias also rejects valid concrete child types.
                    { children: { init: { route: type } } },
                    () => {},
                  ),
                ],
              }),
            ],
          },
        ],
      });
    } catch (error) {
      concreteContractError = error;
    }
    if (concreteContractError !== undefined) {
      expect(concreteContractError).toBeInstanceOf(Error);
      expect((concreteContractError as Error).message).toBe(
        `concrete-expression-child: child role VariableDeclarator.init cannot deliver route ${type}`,
      );
    }
  });

  test.fails('delivers the expression through the alias visitor', () => {
    expect(alias).toContain(type);
  });

  test.fails('recognizes the expression through public predicates', () => {
    expect(predicates).toEqual([true, true, true]);
  });

  test('exposes the initializer through an Expression child contract', () => {
    expect(expressionChildren).toEqual([type]);
  });

  test.fails('accepts the concrete initializer child contract', () => {
    expect(concreteContractError).toBeUndefined();
  });
});
