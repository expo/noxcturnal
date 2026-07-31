import { test } from 'vitest';
import { expectBailout } from '../transform';

test('records the non-simple setter parameter boundary', () => {
  expectBailout(
    `const value = { set field(next = 1) {} };`,
    'input.js',
    { transforms: { parameters: true } },
    'preflight:parameters-setter-semantics-not-implemented',
  );
});
