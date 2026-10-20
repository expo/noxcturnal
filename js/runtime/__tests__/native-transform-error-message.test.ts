import { expect, test } from 'vitest';
import { NativeTransformError } from '../../index';

test('message formatting collapses repeated diagnostics without losing structured details', () => {
  const cause = new Error('original');
  const diagnostics = [
    { code: 'first', message: ' Cannot access refs during render ', phase: 'react-compiler' },
    { code: 'second', message: 'Cannot access refs during render', phase: 'react-compiler' },
    { code: 'third', message: 'This value cannot be modified', phase: 'react-compiler' },
    { code: 'empty', message: '   ' },
  ];
  const failure = new NativeTransformError('Transform failed', diagnostics, ['plugin'], { cause });
  expect(failure.message).toBe(
    'Transform failed\n\nCannot access refs during render\nThis value cannot be modified',
  );
  expect(failure.diagnostics).toBe(diagnostics);
  expect(failure.owners).toEqual(['plugin']);
  expect(failure.cause).toBe(cause);
});

test('errors without additional diagnostic text preserve their original message', () => {
  expect(new NativeTransformError('Original failure', []).message).toBe('Original failure');
  expect(
    new NativeTransformError('Original failure', [
      { code: 'native-transform-error', message: 'Original failure' },
      { code: 'empty', message: '' },
    ]).message,
  ).toBe('Original failure');
});
