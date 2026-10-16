import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  codeFactory,
  containsProvenance,
  identicalRealizedContent,
  isFragmentList,
  isProvenanceCode,
  realizedContentText,
} from '../fragments';

test('realizes adjacent UTF-16 ranges, literal separators, gaps and reordered copies', () => {
  assert.equal(
    realizedContentText(
      { contentParts: [{ start: 1, end: 3 }, '', { start: 3, end: 5 }] },
      'ab💤cd',
    ),
    'b💤c',
  );
  assert.equal(
    realizedContentText(
      {
        contentParts: [
          { start: 0, end: 1 },
          '',
          { start: 1, end: 2 },
          '(',
          { start: 2, end: 3 },
          { start: 3, end: 4 },
          ')',
          { start: 5, end: 6 },
          { start: 0, end: 1 },
        ],
      },
      'ab💤cd',
    ),
    'ab(💤)da',
  );
});

test('constructs and validates sourceless code fragments', () => {
  assert.deepEqual(codeFactory.identifier('$value'), { code: '$value', mapping: 'sourceless' });
  assert.throws(() => codeFactory.identifier('not valid'), /Invalid identifier/);
  assert.deepEqual(codeFactory.stringLiteral('a"b'), {
    code: '"a\\"b"',
    mapping: 'sourceless',
  });
  assert.equal(codeFactory.literal(1n).code, '1n');
  assert.equal(codeFactory.literal(null).code, 'null');
  assert.equal(codeFactory.literal('value').code, '"value"');
  assert.equal(codeFactory.literal(false).code, 'false');
  assert.deepEqual(codeFactory.template`left ${codeFactory.literal(1)} right`, {
    code: 'left 1 right',
    mapping: 'sourceless',
  });
});

test('recognizes fragment shapes and compares realized content structurally', () => {
  const source = { kind: 'source' as const, start: 1, end: 2, text: () => 'x' };
  const composite = { kind: 'composite' as const, parts: ['(', source, ')'] };
  assert.equal(isProvenanceCode(source), true);
  assert.equal(containsProvenance(composite), true);
  assert.equal(containsProvenance({ code: 'x', mapping: 'sourceless' }), false);
  assert.equal(isFragmentList(['a', 'b']), true);
  assert.equal(identicalRealizedContent({ content: 'x' }, { content: 'x' }), true);
  assert.equal(
    identicalRealizedContent(
      { contentParts: ['(', { start: 1, end: 2 }, ')'] },
      { contentParts: ['(', { start: 1, end: 2 }, ')'] },
    ),
    true,
  );
  assert.equal(
    identicalRealizedContent(
      { contentParts: [{ start: 1, end: 2 }] },
      { contentParts: [{ start: 1, end: 3 }] },
    ),
    false,
  );
});
