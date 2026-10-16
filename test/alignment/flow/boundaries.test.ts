import { test } from 'vitest';

import { alignFlowDecoratorTransform, alignHermesFlowTransform } from '../transform';

test('lowers the formerly unsupported Flow record expression against Hermes', () => {
  alignHermesFlowTransform(`// @flow
const value = R { field: 1 };`);
});

test('preserves the formerly unsupported decorated Flow class against Babel Flow stripping', () => {
  alignFlowDecoratorTransform(`// @flow
class Example { @dec value: number = 1; }`);
});
