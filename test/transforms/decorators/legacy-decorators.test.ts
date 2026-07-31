import { expect, test } from 'vitest';

import { transformSource } from '../transform';

const cases = [
  '@sealed class Example {}',
  'class Example { @bound method() {} }',
  'class Example { @tracked accessor value = 1; }',
  'class Example { @tracked value = 1; }',
  'class Example { constructor(@inject service: Service) {} }',
] as const;

for (const source of cases) {
  test(`lowers decorator syntax: ${source}`, async () => {
    const output = await transformSource(source, 'input.ts', {
      typescript: 'strip',
      helpers: { mode: 'inline' },
      transforms: {
        legacyDecorators: true,
        classes: true,
        classProperties: { loose: true },
      },
    });
    expect(output).not.toContain('@');
    expect(output).toContain('_decorate');
  });
}

test('preserves decorator syntax when the transform is not selected', async () => {
  const output = await transformSource('@sealed class Example {}', 'input.js', {});
  expect(output).toContain('@sealed');
  expect(output).not.toContain('_decorate');
});
