import { test } from 'vitest';

import { alignHermesFlowTransform } from '../transform';

test('aligns hook lowering with Hermes', () => {
  alignHermesFlowTransform(`// @flow
hook useGreeting(name: string): string { return name; }`);
});

test('aligns hook default and rest parameters with Hermes', () => {
  alignHermesFlowTransform(`// @flow
hook useValues(first: number = 1, ...rest: Array<number>): number {
  return first + rest.length;
}`);
});

test('aligns generic hooks and erased type parameters with Hermes', () => {
  alignHermesFlowTransform(`// @flow
hook useValue<T>(value: T): T { return value; }`);
});
