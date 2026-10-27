import { expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  transform,
  type QueryRequest,
  type SyntaxFeature,
} from '../../index';

test('metadata conflicts follow the applicable phase subset across repeated files', () => {
  const calls: string[] = [];
  const writer = (feature: SyntaxFeature) =>
    defineNativePlugin({
      name: feature,
      contract: { syntax: { anyOf: [feature] }, metadata: { writes: ['shared'] } },
      pre(context) {
        calls.push(feature);
        context.metadata.set('shared', feature);
      },
    });
  const pipeline = defineNativePipeline({
    phases: [{ name: 'write', plugins: [writer('Class'), writer('ImportDeclaration')] }],
  });
  for (let round = 0; round < 2; round++) {
    for (const [source, feature] of [
      ['class C {}', 'Class'],
      ['import value from "pkg";', 'ImportDeclaration'],
    ]) {
      const result = transform(source, 'input.js', pipeline);
      expect(result.status).toBe('complete');
      if (result.status === 'complete') expect(result.metadata.shared).toBe(feature);
    }
    expect(() => transform('import value from "pkg";class C {}', 'input.js', pipeline)).toThrow(
      'metadata key shared is owned by both Class and ImportDeclaration',
    );
  }
  expect(calls).toEqual(['Class', 'ImportDeclaration', 'Class', 'ImportDeclaration']);
});

test('query permissions remain aligned with the compiled retention contract across files', () => {
  const declaration: QueryRequest = { imports: true };
  let calls = 0;
  const plugin = defineNativePlugin({
    name: 'fixed-permissions',
    contract: { queries: [declaration] },
    pre(context) {
      expect(context.query({ imports: true }).imports).toHaveLength(1);
      expect(() => context.query({ exports: true })).toThrow('undeclared query capability exports');
      calls++;
    },
  });
  const pipeline = defineNativePipeline({ phases: [{ name: 'read', plugins: [plugin] }] });
  declaration.imports = false;
  declaration.exports = true;
  for (const filename of ['first.js', 'second.js'])
    expect(transform('import value from "pkg";export {value};', filename, pipeline).status).toBe(
      'complete',
    );
  expect(calls).toBe(2);
});
