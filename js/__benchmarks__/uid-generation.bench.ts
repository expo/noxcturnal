import { createRequire } from 'node:module';
import { bench, describe } from 'vitest';
import { packRouteManifest } from '../protocol/manifest';

// Run the saved 00fa537 addon and the current addon in separate processes:
// NOXCTURNAL_UID_BENCH_BASELINE=/path/to/baseline.node pnpm benchmark js/__benchmarks__/uid-generation.bench.ts
// pnpm benchmark js/__benchmarks__/uid-generation.bench.ts
// Use matching build profiles. Setup hooks exclude parsing/indexing from UID
// measurements; the separate construction case makes that linear cost visible.
const baselinePath = process.env.NOXCTURNAL_UID_BENCH_BASELINE;
const label = baselinePath ? 'inventory handoff' : 'indexed membership';
interface Session {
  generateUid?(hint: string): string | null;
  createSourceText?(source: string): { generateUid(hint: string, filename: string): string };
  close(): void;
}
const addon: {
  NativeIndexedSession: new (source: string, filename: string, manifest: Buffer) => Session;
} = baselinePath
  ? createRequire(import.meta.url)(baselinePath)
  : (await import('../native/binding')).native;
const manifest = packRouteManifest([], false, false, 1);

for (const count of [1_000, 10_000, 100_000]) {
  const source = Array.from({ length: count }, (_, id) => `const local${id} = global${id};`).join(
    '\n',
  );
  describe(`${label}: ${count} declarations, ${source.length} source units`, () => {
    let session: Session;
    let sourceText: ReturnType<NonNullable<Session['createSourceText']>> | undefined;
    const open = () => {
      session = new addon.NativeIndexedSession(source, 'bench.js', manifest);
      sourceText = undefined;
    };
    const close = () => {
      session.close();
      sourceText = undefined;
    };
    const generate = (hint: string) => {
      if (session.generateUid) return session.generateUid(hint);
      sourceText ??= session.createSourceText!(source);
      return sourceText.generateUid(hint, 'bench.js');
    };
    // Fixed iteration counts avoid millions of expensive setup calls when the
    // measured operation takes only microseconds.
    const samples = { time: 0, iterations: 25, warmupTime: 0, warmupIterations: 5 };
    bench(
      'parse and materialize (no UID)',
      () => {
        open();
        close();
      },
      samples,
    );
    bench(
      'first UID after materialization',
      () => {
        if (generate('fresh') !== '_fresh') throw new Error('unexpected first UID');
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
      '1000 subsequent UIDs',
      () => {
        for (let id = 0; id < 1_000; id++) generate('fresh');
      },
      {
        ...samples,
        setup(task) {
          task.opts.beforeEach = () => {
            open();
            generate('fresh');
          };
          task.opts.afterEach = close;
        },
      },
    );
  });
}
