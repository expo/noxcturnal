import { test } from 'vitest';
import { alignHermesFlowTransform } from '../transform';

test.each([
  ['async components', 'async component Read(value: number) { return value; }'],
  ['async hooks', 'async hook useValue(): Promise<number> { return await 1; }'],
  ['earlier references', 'const before = Read; component Read(ref?: R) { return null; }'],
  [
    'nested references',
    'function outer() { const before = Read; component Read(ref?: R) { return null; } return before; }',
  ],
  ['named export', 'const before = Read; export component Read(ref?: R) { return null; }'],
  [
    'default export',
    'const before = Read; export default component Read(ref?: R) { return null; }',
  ],
  [
    'switch case',
    'switch (value) { case 1: const before = Read; component Read(ref?: R) { return null; } break; }',
  ],
  [
    'multiple wrappers at one reference',
    'const before = [One, Two]; component One(ref?: R) { return null; } component Two(ref?: R) { return null; }',
  ],
  [
    'destructured rest',
    'component Read(value: number, ...{other, rest = 2}: Props) { return value + other + rest; }',
  ],
  ['Flow in defaults', 'component Read(value: number = (1: number)) { return value; }'],
  [
    'comments around rest annotations',
    'component Read(...{value} /* } */ : Props) { return value; }',
  ],
  ['defaulted ref', 'component Read(ref: R = (fallback: R)) { return ref; }'],
  [
    'trailing rest line comment',
    'component Read(...{value // trailing\n}: Props) { return value; }',
  ],
  [
    'rest line comment after a trailing comma',
    'component Read(first: number, ...{value, // trailing\n}: Props) { return first + value; }',
  ],
] as const)('aligns component %s with Hermes 0.36.0', (_name, source) => {
  alignHermesFlowTransform(`// @flow\n${source}`);
});
