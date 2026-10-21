import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../index';

const reads = [
  ['size', (hints: ReadonlySet<string>) => hints.size],
  ['iteration', (hints: ReadonlySet<string>) => [...hints]],
  ['entries', (hints: ReadonlySet<string>) => [...hints.entries()]],
  ['forEach', (hints: ReadonlySet<string>) => hints.forEach(() => {})],
] as const;
for (const name of ['marker', 'import', 'absent'])
  describe.each(reads)(`${name}: %s`, (_readName, read) => {
    let before: boolean;
    let after: boolean;
    beforeAll(() => {
      let calls = 0;
      const plugin = defineNativePlugin({
        name: 'source-hints-audit',
        createState({ sourceHints }) {
          calls++;
          before = sourceHints.has(name);
          read(sourceHints);
          after = sourceHints.has(name);
          expect([...sourceHints]).toEqual(['import']);
        },
      });
      const result = transform(
        'import "pkg"; const marker = 1;',
        'input.js',
        defineNativePipeline({ phases: [{ name: 'scan', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      expect(calls).toBe(1);
      if (name !== 'marker') expect(before).toBe(name === 'import');
    });
    test('read-only observation preserves membership', () => {
      expect(after).toBe(before);
    });
  });
