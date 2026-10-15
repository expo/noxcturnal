import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  { name: 'read', operation: 'external;', flags: [true, false, false] },
  { name: 'write', operation: 'external=1;', flags: [false, true, false] },
  { name: 'compound', operation: 'external+=1;', flags: [true, true, false] },
  { name: 'member write', operation: 'external.value=1;', flags: [true, false, true] },
];
for (const global of [false, true])
  describe.each(cases)(`global=${global}: $name`, entry => {
    let actual: unknown[];
    beforeAll(() => {
      let visits = 0;
      const source = `${global ? '' : 'let external={};'}${entry.operation}function f(){return 7;}`;
      const plugin = defineNativePlugin({
        name: 'reference-audit',
        visitors: [
          defineVisitor('NumericLiteral', { scope: true, fields: ['value'] }, path => {
            if (path.node.value !== 7) return;
            visits++;
            const binding = path.scope.getBinding('external')!;
            expect(binding.global).toBe(global);
            expect(binding.references).toHaveLength(1);
            const reference = binding.references[0];
            expect(source.slice(reference.start, reference.end)).toBe('external');
            actual = [reference.scopeId, reference.read, reference.write, reference.memberWrite];
          }),
        ],
      });
      expect(
        transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [{ name: 'scan', plugins: [plugin] }],
          }),
        ).status,
      ).toBe('complete');
      expect(visits).toBe(1);
    });
    (global ? test : test)('returns the required semantic reference fields', () => {
      expect(actual).toEqual([0, ...entry.flags]);
    });
  });
