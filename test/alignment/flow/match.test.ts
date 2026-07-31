import { test } from 'vitest';

import { alignHermesFlowTransform } from '../transform';

test('aligns match expressions with Hermes', () => {
  alignHermesFlowTransform(`// @flow
export const label = match (value) { 0 => 'none', const count => String(count) };`);
});

test('aligns guarded match statements with Hermes', () => {
  alignHermesFlowTransform(`// @flow
match (value) { 1 if (enabled) => { one(); }, _ => { other(); } }`);
});

test('aligns object, array, alias, and rest patterns with Hermes', () => {
  alignHermesFlowTransform(`// @flow
export const object = match (value) {
  { kind: 'item', const id, ...const rest } => [id, rest],
  _ => null,
};
export const array = match (value) { [1, ...const rest] as whole => [whole, rest], _ => null };`);
});

test.each([
  ['non-exhaustive statements', `match (value) { 1 => { one(); } }`],
  [
    'single evaluation of complex arguments',
    `export const result = match (read()) { const value => value };`,
  ],
  [
    'instance patterns',
    `export const result = match (value) { Box { const item } => item, _ => null };`,
  ],
  [
    'alternation, NaN, and member references',
    `export const result = match (value) { 1 | 2 => 'low', NaN => 'nan', constants.value => 'reference', _ => 'other' };`,
  ],
  [
    'Flow syntax inside guards and cases',
    `export const result = match (value) { const item if (item as number) => (item: number), _ => 0 };`,
  ],
  [
    'canonical string and numeric property names',
    `export const result = match (value) { { 'space key': 1, 0x10: const item } => item, _ => null };`,
  ],
] as const)('aligns %s with Hermes', (_name, statement) => {
  alignHermesFlowTransform(`// @flow\n${statement}`);
});
