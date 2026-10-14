import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  transform,
  type QueryRequest,
  type QueryResult,
} from '../../index';

const cases: {
  name: string;
  source: string;
  request: QueryRequest;
  count: (result: QueryResult) => number;
}[] = [
  {
    name: 'globals',
    source: 'external;',
    request: { globals: [{ name: 'external', references: true }] },
    count: result => result.globals.external.references.length,
  },
  {
    name: 'calls',
    source: 'require("pkg");',
    request: { calls: [{ callee: 'require', staticArguments: true }] },
    count: result => result.calls.require.length,
  },
  {
    name: 'imports',
    source: 'import value from "pkg";',
    request: { imports: true },
    count: result => result.imports.length,
  },
];
for (const declared of [false, true])
  describe.each(cases)(`$name query declared=${declared}`, entry => {
    let outcome: string;
    beforeAll(() => {
      let count: number | undefined;
      const plugin = defineNativePlugin({
        name: 'query-contract-audit',
        contract: declared ? { queries: [entry.request] } : undefined,
        pre(context) {
          count = entry.count(context.query(entry.request));
        },
      });
      const run = (peer = false) =>
        transform(
          entry.source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'query',
                plugins: [
                  plugin,
                  ...(peer
                    ? [
                        defineNativePlugin({
                          name: 'passive-query-peer',
                          contract: { queries: [entry.request] },
                        }),
                      ]
                    : []),
                ],
              },
            ],
          }),
        );
      if (declared) {
        expect(run().status).toBe('complete');
        expect(count).toBe(1);
        outcome = 'complete';
      } else {
        expect(() => run()).toThrow(
          `query-contract-audit: undeclared query capability ${entry.name}`,
        );
        expect(() => run(true)).toThrow(
          `query-contract-audit: undeclared query capability ${entry.name}`,
        );
        outcome = 'throw';
      }
    });
    test('requires a declared query capability instead of silently returning missing facts', () => {
      expect(outcome).toBe(declared ? 'complete' : 'throw');
    });
  });
