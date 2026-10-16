import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { expect, test } from 'vitest';

import { defineNativePipeline, transform, TransformSyntaxError } from '../../../js';
import { native } from '../../../js/native/binding';
import cases from '../../fixtures/flow-parser-update/cases.json';

// No adapters are registered: every successful case must use native erasure.
const pipeline = defineNativePipeline({ phases: [{ name: 'flow', native: { jsx: 'preserve' } }] });

test.each(cases)('native public path: $id', row => {
  const source = `// @flow\n${row.source}`;
  const erased = native.nativeFlowErase(source, 'input.js');
  if (row.outcome === 'erased') {
    expect(erased.status).toBe('erased');
    expect(erased.code).toBe(`// @flow\n${row.output}`);
  } else {
    expect(erased.status).toBe('bailed');
  }
  const run = () => transform(source, 'input.js', pipeline);
  if (row.public === 'syntax-error') {
    expect(run).toThrow(TransformSyntaxError);
  } else {
    const result = run();
    expect(result.status).toBe(row.outcome === 'erased' ? 'complete' : 'bailout');
    if (result.status === 'bailout') {
      expect(result.reason).toBe('flow-requires-parser-adapter');
      expect(result.source).toBe(source);
    }
  }
});

test('readonly deletion maps retain UTF-16 positions after comments and non-ASCII text', () => {
  const source =
    "// café 🦉\nclass C { static readonly /* λ */ value: number = 'é'; readonly /* 保 */ other: string = '✓'; }";
  const erased = native.nativeFlowErase(source, 'fixture.js', 'character');
  expect(erased.status).toBe('erased');
  expect(erased.code).toBe(
    "// café 🦉\nclass C { static  /* λ */ value = 'é';  /* 保 */ other = '✓'; }",
  );
  expect(erased.spanCount).toBe(4);
  const trace = new TraceMap({
    version: 3,
    sources: ['fixture.js'],
    names: erased.map!.names,
    mappings: erased.map!.mappings,
  });
  for (const token of ['static', '/* λ */', 'value', "'é'", '/* 保 */', 'other', "'✓'"]) {
    const generated = erased.code!.split('\n')[1].indexOf(token);
    expect(originalPositionFor(trace, { line: 2, column: generated })).toEqual({
      source: 'fixture.js',
      line: 2,
      column: source.split('\n')[1].indexOf(token),
      name: null,
    });
  }
});
