import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { bench, describe } from 'vitest';
import { native, type NativeIndexedSessionBinding } from '../native/binding';
import { packRouteManifest } from '../protocol/manifest';

// Compare matching addon profiles in separate processes. The baseline can omit
// queryCallsBatch; the fallback preserves its previous per-callee crossings.
const baselinePath = process.env.NOXCTURNAL_QUERY_BENCH_BASELINE;
const addon = baselinePath
  ? (createRequire(import.meta.url)(baselinePath) as typeof native)
  : native;
const manifest = packRouteManifest([], false, false, (1 << 0) | (1 << 2));
const requests = Array.from({ length: 16 }, (_, id) => ({ callee: `selected${id}` }));
const samples = { time: 0, iterations: 25, warmupTime: 0, warmupIterations: 5 };

for (const count of [1_000, 10_000, 100_000]) {
  const source = `import 'dep'; const knownMissing = 0;
${Array.from({ length: count }, () => 'unrelated();').join('\n')}
${requests.map(request => `${request.callee}('value');`).join('\n')}`;
  describe(`${baselinePath ? 'scan' : 'indexed'}: ${count} unrelated calls`, () => {
    let session: NativeIndexedSessionBinding;
    const open = () => {
      session = new addon.NativeIndexedSession(source, 'bench.js', manifest);
    };
    const close = () => session.close();
    const calls = (count: number) =>
      session.queryCallsBatch
        ? session.queryCallsBatch(requests.slice(0, count))
        : requests.slice(0, count).map(request => session.queryCalls(request.callee));

    // Validate workloads outside the timer: benchmark callback failures are not
    // reliably propagated by every benchmark runner version.
    open();
    const before = session.memoryUsage();
    assert.equal(session.queryCalls('knownMissing').length, 0);
    assert.equal(calls(16).length, 16);
    for (const group of calls(16)) {
      assert.equal(group.length, 1);
      assert.equal(group[0]!.staticArgument, 'value');
    }
    const afterCalls = session.memoryUsage();
    session.queryNodesPackedBuffer(['ImportDeclaration']);
    const afterNodes = session.memoryUsage();
    console.log(
      JSON.stringify({
        count,
        bytesBeforeQueries: before,
        bytesAfterCallQueries: afterCalls,
        bytesAfterNodeQueries: afterNodes,
      }),
    );
    close();

    bench(
      'construct without queries',
      () => {
        open();
        close();
      },
      samples,
    );
    bench(
      'first call query (index build)',
      () => {
        session.queryCalls('knownMissing');
      },
      {
        ...samples,
        setup(task) {
          task.opts.beforeEach = open;
          task.opts.afterEach = close;
        },
      },
    );
    bench(
      'first node query (index build)',
      () => {
        session.queryNodesPackedBuffer(['ImportDeclaration']);
      },
      {
        ...samples,
        setup(task) {
          task.opts.beforeEach = open;
          task.opts.afterEach = close;
        },
      },
    );
    for (const requested of [1, 16])
      bench(
        `warm calls: ${requested} names`,
        () => {
          calls(requested);
        },
        {
          ...samples,
          setup() {
            open();
            calls(16);
          },
          teardown: close,
        },
      );
    bench(
      'warm call query: known name without calls',
      () => {
        session.queryCalls('knownMissing');
      },
      {
        ...samples,
        setup() {
          open();
          calls(16);
        },
        teardown: close,
      },
    );
    bench(
      'warm call query: dense results',
      () => {
        session.queryCalls('unrelated');
      },
      {
        ...samples,
        setup() {
          open();
          calls(16);
        },
        teardown: close,
      },
    );
    bench(
      'warm node query: one import',
      () => {
        session.queryNodesPackedBuffer(['ImportDeclaration']);
      },
      {
        ...samples,
        setup() {
          open();
          session.queryNodesPackedBuffer(['ImportDeclaration']);
        },
        teardown: close,
      },
    );
  });
}
