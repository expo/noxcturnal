import { expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  transform,
  type QueryRequest,
} from '../../index';
import { stableJson } from '../../pipeline/cache-key';
import { staticMemberPath } from '../member-pattern';

const memberCases = [
  ['process /*a*/ . /*b*/ env /*c*/ [ /*d*/ "NODE_ENV" /*e*/ ]', 'process.env.NODE_ENV'],
  [String.raw`pr\u006fcess.\u{65}nv['NODE_\x45NV']`, 'process.env.NODE_ENV'],
  [String.raw`process['env.NODE_ENV']`, String.raw`process.env\.NODE_ENV`],
  [String.raw`process['a\\b']`, String.raw`process.a\\b`],
  [String.raw`process['a\'b']`, "process.a'b"],
  [String.raw`process['a\nb']`, 'process.a\nb'],
  ['((process).env)["NODE_ENV"]', 'process.env.NODE_ENV'],
  ['process[""].value', 'process..value'],
  ['process["😀"].value', 'process.😀.value'],
] as const;
for (const [expression, encoded] of memberCases) {
  test(`static member representation: ${expression}`, () => {
    expect(staticMemberPath(expression)).toBe(encoded);
    for (const fields of [false, true]) {
      const observations: unknown[] = [];
      const plugin = defineNativePlugin({
        name: 'members',
        visitors: [
          defineVisitor('MemberExpression', fields ? { fields: ['memberPath'] } : {}, path => {
            if (path.end === expression.length)
              observations.push([
                path.matchesPattern(encoded),
                path.matchesPattern('process', true),
                path.matchesPattern('pro', true),
                path.matchesPattern(encoded + '.extra'),
              ]);
          }),
        ],
      });
      expect(
        transform(
          expression + ';',
          'input.js',
          defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
        ).status,
      ).toBe('complete');
      expect(observations).toEqual([[true, true, false, false]]);
    }
    let selected = 0;
    const plugin = defineNativePlugin({
      name: 'predicate',
      visitors: [
        defineVisitor(
          'StaticMemberExpression|ComputedMemberExpression',
          { where: { memberPath: { equals: encoded } } },
          path => {
            if (path.end === expression.length) selected++;
          },
        ),
      ],
    });
    expect(
      transform(
        expression + ';',
        'input.js',
        defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
      ).status,
    ).toBe('complete');
    expect(selected).toBe(1);
  });
}

test.each([
  'process[key]',
  'process["env" + "x"]',
  'factory().env',
  'process[1]',
  'process.#private',
])('member fallback refuses dynamic or unsupported input: %s', source => {
  expect(staticMemberPath(source)).toBeNull();
});

test('configuration encoding distinguishes scalar values, holes, and tag-looking strings', () => {
  const values = [
    null,
    undefined,
    NaN,
    Infinity,
    -Infinity,
    0,
    -0,
    '',
    'undefined:undefined',
    [],
    [undefined],
    new Array(1),
    [null],
    { value: undefined },
    {},
    { value: 'n:NaN' },
  ];
  expect(new Set(values.map(stableJson)).size).toBe(values.length);
  expect(stableJson({ b: 1, a: 2 })).toBe(stableJson({ a: 2, b: 1 }));
});

test('deep nested contracts retain child fields without declaring leaves at root', () => {
  const observed: unknown[] = [];
  const leaves = [
    defineVisitor(
      'VariableDeclarator',
      {
        children: {
          init: {
            route: 'ImportExpression',
            children: { source: { route: 'StringLiteral', fields: ['value'] } },
          },
        },
      },
      path => observed.push(path.getChild('init')?.getChild('source')?.node.value),
    ),
  ];
  const middle = [
    defineVisitor(
      'FunctionExpression',
      { nested: leaves, controlFlow: ['nested-traverse'] },
      path => path.traverse(leaves),
    ),
  ];
  const root = defineVisitor(
    'Program',
    { nested: middle, controlFlow: ['nested-traverse'] },
    path => path.traverse(middle),
  );
  const plugin = defineNativePlugin({ name: 'deep', visitors: [root] });
  expect(
    transform(
      'const fn = function(){ const result = import("pkg"); };',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
    ).status,
  ).toBe('complete');
  expect(observed).toEqual(['pkg']);
});

test.each(['exports', 'constants', 'captures', 'bindings'] as const)(
  '%s queries reject sibling-only capabilities',
  capability => {
    const request: QueryRequest =
      capability === 'exports'
        ? { exports: true }
        : capability === 'constants'
          ? { constants: [0] }
          : capability === 'captures'
            ? { captures: [{ functionId: 0 }] }
            : { bindings: [{ name: 'value' }] };
    const undeclared = defineNativePlugin({
      name: 'undeclared',
      pre: context => {
        context.query(request);
      },
    });
    const peer = defineNativePlugin({ name: 'peer', contract: { queries: [request] } });
    const pipeline = defineNativePipeline({
      phases: [{ name: 'scan', plugins: [undeclared, peer] }],
    });
    expect(() => transform('export const value = 1;', 'input.js', pipeline)).toThrow(
      `undeclared: undeclared query capability ${capability}`,
    );
  },
);

test.each([
  '((process as any).env).NODE_ENV',
  '(process!).env.NODE_ENV',
  '(process satisfies object).env.NODE_ENV',
])('unsupported TS wrappers do not depend on retained fields: %s', expression => {
  for (const fields of [false, true]) {
    const seen: boolean[] = [];
    const plugin = defineNativePlugin({
      name: 'ts-members',
      visitors: [
        defineVisitor('MemberExpression', fields ? { fields: ['memberPath'] } : {}, path => {
          if (path.end === expression.length)
            seen.push(path.matchesPattern('process.env.NODE_ENV'));
        }),
      ],
    });
    expect(
      transform(
        expression + ';',
        'input.ts',
        defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
      ).status,
    ).toBe('complete');
    expect(seen).toEqual([false]);
  }
});

test('partial member matching respects quoted separator boundaries', () => {
  const source = String.raw`object['a.b'].value; object['a\\'].value;`;
  const seen: boolean[][] = [];
  const plugin = defineNativePlugin({
    name: 'prefixes',
    visitors: [
      defineVisitor('MemberExpression', { fields: ['memberPath'] }, path => {
        if (path.node.memberPath?.endsWith('.value'))
          seen.push([
            path.matchesPattern('object.a\\', true),
            path.matchesPattern(String.raw`object.a\.b`, true),
            path.matchesPattern(String.raw`object.a\\`, true),
            path.matchesPattern('object.a', true),
          ]);
      }),
    ],
  });
  expect(
    transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
    ).status,
  ).toBe('complete');
  expect(seen).toEqual([
    [false, true, false, false],
    [false, false, true, false],
  ]);
});

test.each([false, true])(
  'overlapping skip roots preserve identity through widening: child first=%s',
  childFirst => {
    const seen: string[] = [];
    const plugin = defineNativePlugin({
      name: 'skip-order',
      visitors: [
        defineVisitor(
          'Program',
          {
            controlFlow: ['skip', 'dynamic-subscriptions'],
            children: {
              body: {
                route: 'ExpressionStatement',
                children: {
                  expression: {
                    route: 'CallExpression',
                    children: { callee: { route: 'Identifier' } },
                  },
                },
              },
            },
          },
          path => {
            const statement = path.getChildList('body')[0];
            const call = statement.getChild('expression')!;
            const callee = call.getChild('callee')!;
            for (const target of childFirst ? [callee, statement] : [statement, callee])
              target.skip();
            path.subscribeWithin('Identifier');
          },
        ),
        defineVisitor('Identifier', { fields: ['name'] }, path =>
          seen.push(String(path.node.name)),
        ),
      ],
    });
    expect(
      transform(
        'call(argument); trailing;',
        'input.js',
        defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
      ).status,
    ).toBe('complete');
    expect(seen).toEqual(['trailing']);
  },
);
