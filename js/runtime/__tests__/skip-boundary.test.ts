import { beforeAll, describe, expect, test, vi } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

import { NativeTransformSession } from '../session';

const cases = [
  {
    name: 'statement and callee share start',
    source: 'call(argument); trailing;',
    parent: 'ExpressionStatement' as const,
  },
  {
    name: 'call and callee share start',
    source: 'call(argument); trailing;',
    parent: 'CallExpression' as const,
  },
  {
    name: 'function descendants start later',
    source: 'function call(argument){} trailing;',
    parent: 'Function' as const,
  },
];
describe.each([false, true])('nested traversal: %s', nested => {
  describe.each(cases)('$name', entry => {
    let visited: string[];
    let exited: string[];
    beforeAll(() => {
      visited = [];
      exited = [];
      let skipped = false;
      const visitors = [
        defineVisitor(entry.parent, { controlFlow: ['skip'] }, path => {
          if (!skipped) {
            skipped = true;
            path.skip();
          }
        }),
        defineVisitor(
          'Identifier',
          { fields: ['name'], controlFlow: ['skip'] },
          {
            enter(path) {
              visited.push(String(path.node.name));
            },
            exit(path) {
              exited.push(String(path.node.name));
            },
          },
        ),
      ];
      const plugin = defineNativePlugin({
        name: 'skip-boundary',
        visitors: nested
          ? [
              defineVisitor(
                'Program',
                { controlFlow: ['nested-traverse'], nested: visitors },
                path => path.traverse(visitors),
              ),
            ]
          : visitors,
      });
      const result = transform(
        entry.source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'skip', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      expect(skipped).toBe(true);
    });
    test('skips all descendants while preserving siblings', () => {
      expect(visited).toEqual(['trailing']);
    });
    test('skips descendant exit handlers while preserving siblings', () => {
      expect(exited).toEqual(['trailing']);
    });
  });
});

for (const source of [
  'import {value} from "pkg";value;',
  'const value=1;const object={value};',
  'const {value}=input;value;',
  'const value=1;export {value};',
]) {
  test.each([false, true])(`skip preserves coincident siblings in ${source}, nested=%s`, nested => {
    for (const exits of [false, true]) {
      const run = (skip: boolean) => {
        const entered: number[] = [];
        const exited: number[] = [];
        let skipped = false;
        const enter = (path: { node: { id: number }; start: number; skip(): void }) => {
          entered.push(path.node.id);
          if (skip && !skipped && path.start === source.indexOf('{') + 1) {
            skipped = true;
            path.skip();
          }
        };
        const visitors = [
          defineVisitor(
            'Identifier',
            { controlFlow: ['skip'] },
            exits
              ? {
                  enter,
                  exit: path => {
                    exited.push(path.node.id);
                  },
                }
              : enter,
          ),
        ];
        const plugin = defineNativePlugin({
          name: 'skip-coincident-siblings',
          visitors: nested
            ? [
                defineVisitor(
                  'Program',
                  { controlFlow: ['nested-traverse'], nested: visitors },
                  path => path.traverse(visitors),
                ),
              ]
            : visitors,
        });
        const result = transform(
          source,
          'input.mjs',
          defineNativePipeline({ phases: [{ name: 'skip', plugins: [plugin] }] }),
        );
        expect(result.status).toBe('complete');
        if (skip) expect(skipped).toBe(true);
        return { entered, exited };
      };
      const expected = run(false);
      expect(expected.entered.length).toBeGreaterThanOrEqual(3);
      expect(run(true), `exits=${exits}: ${source}`).toEqual(expected);
    }
  });
}

test('out-of-order child skips preserve adjacent roots and skip their descendants', () => {
  const roots: number[] = [];
  let calls = 0;
  const plugin = defineNativePlugin({
    name: 'skip-adjacent-children',
    visitors: [
      defineVisitor(
        'Program',
        { children: { body: { route: 'ExpressionStatement' } }, controlFlow: ['skip'] },
        path => {
          const children = path.getChildList('body');
          for (const index of [0, 2, 1]) children[index]!.skip();
        },
      ),
      defineVisitor('ExpressionStatement', { controlFlow: ['skip'] }, path => {
        roots.push(path.node.id);
      }),
      defineVisitor('CallExpression', { controlFlow: ['skip'] }, () => {
        calls++;
      }),
    ],
  });
  const result = transform(
    'first();second();third();',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'skip', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  expect(roots).toHaveLength(3);
  expect(calls).toBe(0);
});

test.each([false, true])('skip-only routes remain stateless, called=%s', called => {
  const retainedBytes: number[] = [];
  const close = NativeTransformSession.prototype.close;
  const closing = vi.spyOn(NativeTransformSession.prototype, 'close').mockImplementation(function (
    this: NativeTransformSession,
  ) {
    retainedBytes.push(this.nativeMemoryBytes);
    close.call(this);
  });
  const intervals = vi.spyOn(NativeTransformSession.prototype, 'traversalIntervals');
  const entered: string[] = [];
  const exited: string[] = [];
  try {
    const visitors = [
      defineVisitor('Function', { controlFlow: ['skip'] }, path => {
        if (called) path.skip();
      }),
      defineVisitor(
        'Identifier',
        { fields: ['name'] },
        {
          enter: path => {
            entered.push(String(path.node.name));
          },
          exit: path => {
            exited.push(String(path.node.name));
          },
        },
      ),
    ];
    const result = transform(
      'function call(argument){inner();} trailing;',
      'input.js',
      defineNativePipeline({
        phases: [
          { name: 'skip', plugins: [defineNativePlugin({ name: 'stateless-skip', visitors })] },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    const expected = called ? ['trailing'] : ['call', 'argument', 'inner', 'trailing'];
    expect(entered).toEqual(expected);
    expect(exited).toEqual(expected);
    expect(retainedBytes).toEqual([0]);
    expect(intervals).not.toHaveBeenCalled();
  } finally {
    closing.mockRestore();
    intervals.mockRestore();
  }
});

test('unused skip keeps an existing index lazy', () => {
  const retainedBytes: number[] = [];
  const close = NativeTransformSession.prototype.close;
  const closing = vi.spyOn(NativeTransformSession.prototype, 'close').mockImplementation(function (
    this: NativeTransformSession,
  ) {
    retainedBytes.push(this.nativeMemoryBytes);
    close.call(this);
  });
  const intervals = vi.spyOn(NativeTransformSession.prototype, 'traversalIntervals');
  try {
    for (const skip of [false, true]) {
      let visits = 0;
      const visitor = defineVisitor(
        'Function',
        { scope: true, controlFlow: skip ? ['skip'] : [] },
        () => {
          visits++;
        },
      );
      expect(
        transform(
          'function first(){return 1} function second(){return 2}',
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'lazy-skip',
                plugins: [defineNativePlugin({ name: 'lazy-skip', visitors: [visitor] })],
              },
            ],
          }),
        ).status,
      ).toBe('complete');
      expect(visits).toBe(2);
    }
    expect(retainedBytes).toHaveLength(2);
    expect(retainedBytes[0]).toBeGreaterThan(0);
    expect(retainedBytes[1]).toBe(retainedBytes[0]);
    expect(intervals).not.toHaveBeenCalled();
  } finally {
    closing.mockRestore();
    intervals.mockRestore();
  }
});
