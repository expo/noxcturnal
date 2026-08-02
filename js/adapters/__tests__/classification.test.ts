import assert from 'node:assert/strict';
import { test } from 'vitest';

import { classify } from '../../index';
import { classifyForTransform, parserFilename, sourceHints } from '../classification';

test('loads the Noxcturnal binding and classifies parser routes', () => {
  assert.deepEqual(classify('fixture.tsx', 'const view = <View />').syntax, 'tsx');
  assert.equal(classify('fixture.js', '// @flow\nconst x: number = 1').supported, false);
});

test('classifies filenames, parser overrides, and lazy source hints', () => {
  assert.equal(parserFilename('fixture.js', 'tsx'), 'fixture.tsx');
  assert.equal(parserFilename('fixture.d.ts', 'dts'), 'fixture.d.ts');
  assert.equal(parserFilename('fixture.mjs', 'auto'), 'fixture.mjs');
  assert.equal(classifyForTransform('fixture.d.ts', '').syntax, 'dts');
  assert.equal(classifyForTransform('fixture.unknown', '').reason, 'unknown-extension');
  assert.equal(classifyForTransform('fixture.js', '', 'jsx').syntax, 'jsx');

  const hints = sourceHints('import value from "pkg"; process.env.NODE_ENV;');
  assert.equal(hints.has('import'), true);
  assert.equal(hints.has('require'), false);
  assert.equal(hints.size, 2);
  assert.deepEqual([...hints], ['process.env', 'import']);
  assert.deepEqual([...hints.keys()], ['process.env', 'import']);
  assert.deepEqual([...hints.values()], ['process.env', 'import']);
  assert.deepEqual(
    [...hints.entries()],
    [
      ['process.env', 'process.env'],
      ['import', 'import'],
    ],
  );
  const visited: string[] = [];
  hints.forEach(value => visited.push(value));
  assert.deepEqual(visited, ['process.env', 'import']);
});
