import { resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import {
  NativeTransformError,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
} from '../../index';
import type { DefinedVisitor } from '../../index';

function run(source: string, visitors: readonly DefinedVisitor<unknown>[], nested: boolean) {
  const plugin = defineNativePlugin({
    name: 'nested-contract-audit',
    visitors: nested
      ? [
          defineVisitor(
            'Program',
            {
              controlFlow: ['nested-traverse'],
              nested: visitors,
            },
            path => path.traverse(visitors),
          ),
        ]
      : visitors,
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'visit', plugins: [plugin] }],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  return result;
}

describe.each([
  ['FunctionExpression', 'Function', 'const value = function () {};', 'function () {}'],
  ['ClassExpression', 'Class', 'const value = class {};', 'class {}'],
] as const)('nested %s implicit predicate', (route, type, source, expected) => {
  let error: unknown;
  let actual: string[];
  beforeAll(() => {
    const direct: string[] = [];
    run(source, [defineVisitor(route, {}, path => direct.push(path.getSource().text()))], false);
    expect(direct).toEqual([expected]);
    const explicit: string[] = [];
    run(
      source,
      [
        defineVisitor(route, { fields: ['nodeKind'] }, path =>
          explicit.push(path.getSource().text()),
        ),
      ],
      true,
    );
    expect(explicit).toEqual([expected]);
    actual = [];
    try {
      run(source, [defineVisitor(route, {}, path => actual.push(path.getSource().text()))], true);
    } catch (caught) {
      error = caught;
    }
    if (error !== undefined) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        `nested-contract-audit: nested traversal requires declared field ${type}.nodeKind`,
      );
    }
  });
  test('retains the field required by the specialized route without a manual payload request', () => {
    expect(error).toBeUndefined();
    expect(actual).toEqual([expected]);
  });
});

describe('nested child projection', () => {
  let actual: unknown[];
  beforeAll(() => {
    const source = 'const value = 3;';
    const visitor = (seen: unknown[]) =>
      defineVisitor(
        'VariableDeclarator',
        {
          children: { init: { route: 'NumericLiteral', fields: ['value'] } },
        },
        path => {
          const child = path.getChild('init');
          seen.push(child ? [child.node.type, child.node.value] : null);
        },
      );
    const direct: unknown[] = [];
    run(source, [visitor(direct)], false);
    expect(direct).toEqual([['NumericLiteral', 3]]);
    actual = [];
    run(source, [visitor(actual)], true);
    expect(actual).toHaveLength(1);
  });
  test('retains declared children and their fields for a nested visitor', () => {
    expect(actual).toEqual([['NumericLiteral', 3]]);
  });
});

describe('nested traversal retains its owning phase plan', () => {
  let error: unknown;
  let actual: string[];
  beforeAll(() => {
    const source = 'function read() { return external; }';
    const direct: string[] = [];
    const directLeaf = [
      defineVisitor('Identifier', { fields: ['name'] }, path =>
        direct.push(String(path.node.name)),
      ),
    ];
    run(source, directLeaf, true);
    expect(direct).toEqual(['read', 'external']);
    actual = [];
    const leaf = [
      defineVisitor('Identifier', { fields: ['name'] }, path =>
        actual.push(String(path.node.name)),
      ),
    ];
    const middle = defineVisitor(
      'Function',
      { controlFlow: ['nested-traverse'], nested: leaf },
      path => path.traverse(leaf),
    );
    try {
      // Declare the leaf at the outer level too, to rule out a missing retained
      // field as the sole cause: the second traversal loses the owning plan.
      run(source, [middle, ...leaf], true);
    } catch (caught) {
      error = caught;
    }
    if (error !== undefined) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        'nested: nested traversal requires declared field Identifier.name',
      );
    }
  });
  test('serves an explicitly retained field through a second nested traversal', () => {
    expect(error).toBeUndefined();
    expect(actual).toContain('external');
  });
});

describe('nested comment retention', () => {
  let actual: string[];
  beforeAll(() => {
    const source = "import(/* mark */ 'pkg');";
    const visitor = (seen: string[]) =>
      defineVisitor('ImportExpression', { comments: 'inner' }, path => {
        seen.push(...path.getComments('inner').map(comment => comment.value.trim()));
      });
    const direct: string[] = [];
    run(source, [visitor(direct)], false);
    expect(direct).toEqual(['mark']);
    actual = [];
    let callbacks = 0;
    run(
      source,
      [
        defineVisitor('ImportExpression', { comments: 'inner' }, path => {
          callbacks++;
          actual.push(...path.getComments('inner').map(comment => comment.value.trim()));
        }),
      ],
      true,
    );
    expect(callbacks).toBe(1);
  });
  test('retains comments declared only by a nested visitor', () => {
    expect(actual).toEqual(['mark']);
  });
});

describe('nested edit ownership', () => {
  let actual: readonly string[] | undefined;
  beforeAll(() => {
    const conflict = (nested: boolean) => {
      const plugin = (name: string) => {
        const visitors = [defineVisitor('NumericLiteral', {}, path => path.replaceWith(name))];
        return defineNativePlugin({
          name,
          visitors: nested
            ? [
                defineVisitor(
                  'Program',
                  {
                    controlFlow: ['nested-traverse'],
                    nested: visitors,
                  },
                  path => path.traverse(visitors),
                ),
              ]
            : visitors,
        });
      };
      let caught: unknown;
      try {
        transform(
          '3;',
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'visit',
                plugins: [plugin('first'), plugin('second')],
              },
            ],
          }),
        );
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(NativeTransformError);
      const error = caught as NativeTransformError;
      expect(error.message).toContain(`${resolve('input.js')}: overlapping edits at 0..1 and 0..1`);
      return error.owners;
    };
    expect(conflict(false)).toEqual(['first', 'second']);
    actual = conflict(true);
  });
  test('attributes overlapping edits to their owning plugins', () => {
    expect(actual).toEqual(['first', 'second']);
  });
});

test('nested scope lookup and nonconflicting edits retain their behavior', () => {
  const seen: unknown[] = [];
  const visitors = [
    defineVisitor('Identifier', { fields: ['name'], scope: true }, path => {
      if (path.node.name === 'value') {
        seen.push(path.scope.getBinding('value')?.name);
        path.replaceWith('renamed');
      }
    }),
  ];
  const result = run('const value = 3; value;', visitors, true);
  expect(seen).toEqual(['value', 'value']);
  expect(result.code).toBe('const renamed = 3; renamed;');
});

test('bounded nested enter and exit routes hydrate ancestors outside the queried span', () => {
  const seen: string[] = [];
  const ancestry = {
    mode: 'findParent',
    routes: { VariableDeclarator: { fields: ['bindingName'] } },
  } as const;
  const nested = [
    defineVisitor(
      'CallExpression',
      { fields: ['calleeName'], ancestry },
      {
        enter(path) {
          const owner = path.findParent(parent => parent.node.type === 'VariableDeclarator');
          expect(owner?.node.type === 'VariableDeclarator' && owner.node.bindingName).toBe('owner');
          seen.push(`enter:${path.node.calleeName}`);
        },
        exit(path) {
          const owner = path.findParent(parent => parent.node.type === 'VariableDeclarator');
          expect(owner?.node.type === 'VariableDeclarator' && owner.node.bindingName).toBe('owner');
          seen.push(`exit:${path.node.calleeName}`);
        },
      },
    ),
    defineVisitor(
      'Identifier',
      { fields: ['name'], where: { name: { equals: 'value' } }, ancestry },
      {
        exit(path) {
          const owner = path.findParent(parent => parent.node.type === 'VariableDeclarator');
          expect(owner?.node.type === 'VariableDeclarator' && owner.node.bindingName).toBe('owner');
          seen.push(`exit:${path.node.name}`);
        },
      },
    ),
  ];
  const plugin = defineNativePlugin({
    name: 'bounded-nested-ancestry',
    visitors: [
      defineVisitor(
        'VariableDeclarator',
        {
          children: { init: { route: 'CallExpression' } },
          nested,
          controlFlow: ['nested-traverse'],
        },
        path => path.getChild('init')?.traverse(nested),
      ),
    ],
  });
  const source = `${'before();'.repeat(100)}const owner = outer(inner(value)); after();`;
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).toBe(source);
  expect(seen).toEqual(['enter:outer', 'enter:inner', 'exit:value', 'exit:inner', 'exit:outer']);
});

for (const source of [
  'import {value} from "pkg";value;',
  'const value=1;const object={value};',
  'const {value}=input;value;',
  'const value=1;export {value};',
]) {
  test.each([false, true])(
    `nested traversal stays in the selected node: ${source}, exits=%s`,
    exits => {
      const entered: number[] = [];
      const exited: number[] = [];
      let target: number | undefined;
      const nested = [
        defineVisitor(
          'Identifier',
          {},
          exits
            ? {
                enter: path => {
                  entered.push(path.node.id);
                },
                exit: path => {
                  exited.push(path.node.id);
                },
              }
            : path => {
                entered.push(path.node.id);
              },
        ),
        defineVisitor('ImportSpecifier|ExportSpecifier', {}, path => {
          entered.push(path.node.id);
        }),
      ];
      const plugin = defineNativePlugin({
        name: 'nested-identity',
        visitors: [
          defineVisitor('Identifier', { controlFlow: ['nested-traverse'], nested }, path => {
            if (target == null && path.start === source.indexOf('{') + 1) {
              target = path.node.id;
              path.traverse(nested);
            }
          }),
        ],
      });
      const result = transform(
        source,
        'input.mjs',
        defineNativePipeline({ phases: [{ name: 'nested', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      expect(target).toBeDefined();
      expect(entered).toEqual([target]);
      expect(exited).toEqual(exits ? [target] : []);
    },
  );

  test(`within subscription excludes coincident siblings: ${source}`, () => {
    const seen: number[] = [];
    let immediate: number[] | undefined;
    let selected = false;
    const plugin = defineNativePlugin({
      name: 'within-identity',
      visitors: [
        defineVisitor('Identifier', { controlFlow: ['dynamic-subscriptions'] }, path => {
          seen.push(path.node.id);
          if (!selected && path.start === source.indexOf('{') + 1) {
            selected = true;
            const before = seen.length;
            path.subscribeWithin('Identifier');
            immediate = seen.slice(before);
          }
        }),
      ],
    });
    const result = transform(
      source,
      'input.mjs',
      defineNativePipeline({ phases: [{ name: 'within', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    expect(immediate).toEqual([]);
    expect(seen.length).toBeGreaterThanOrEqual(3);
    expect(new Set(seen).size).toBe(seen.length);
  });
}
