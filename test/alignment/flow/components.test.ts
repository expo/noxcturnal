import { test } from 'vitest';

import { alignHermesFlowTransform } from '../transform';

test('aligns component parameter lowering with Hermes', () => {
  alignHermesFlowTransform(`// @flow
component Example(a: T, external as local: U = 1, ...rest: Props) {
  return [a, local, rest];
}`);
});

test('aligns component ref lowering with Hermes', () => {
  alignHermesFlowTransform(`// @flow
component Example(ref?: Ref, value: T) { return value; }`);
});

test('aligns empty component parameters with Hermes', () => {
  alignHermesFlowTransform(`// @flow
component Example() { return null; }`);
});

test('aligns interacting Flow proposals with Hermes', () => {
  alignHermesFlowTransform(`// @flow
enum Status { Active, Off }
component StatusView(status: Status) {
  return match (status) { Status.Active => 'active', _ => 'off' };
}`);
});

test.each([
  [
    'renamed and defaulted parameters',
    `component Example(external as local: string = 'value') { return local; }`,
  ],
  ['destructured parameters', `component Example(prop as { a, b }: Props) { return a + b; }`],
  ['a sole rest parameter', `component Example(...props: Props) { return props; }`],
  [
    'type parameters and renders clauses',
    `component Example<T>(value: T) renders React.Node { return value; }`,
  ],
  ['a ref-only component', `component Example(ref?: Ref) { return null; }`],
] as const)('aligns %s with Hermes', (_name, declaration) => {
  alignHermesFlowTransform(`// @flow\n${declaration}`);
});
