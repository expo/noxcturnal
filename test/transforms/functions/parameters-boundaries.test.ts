import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers a non-simple setter parameter to one simple parameter', async () => {
  const output = await transformSource(
    `const value = { set field(next = 1) { this.next = next; } };`,
    'input.js',
    { transforms: { parameters: true } },
  );
  expect(output).not.toContain('[bailout]');
  expect(output).not.toContain('next = 1');
  expect(output).toMatch(/set field\(_arg\)/);
});
