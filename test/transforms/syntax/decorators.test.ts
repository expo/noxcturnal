import { test } from 'vitest';
import { expectBailout } from '../transform';

const cases = [
  '@sealed class Example {}',
  'class Example { @bound method() {} }',
  'class Example { @tracked accessor value = 1; }',
  'class Example { @tracked value = 1; }',
  'class Example { constructor(@inject service: Service) {} }',
] as const;

for (const source of cases) {
  test(`rejects unsupported decorator syntax: ${source}`, () => {
    expectBailout(
      source,
      'input.ts',
      { typescript: 'strip', transforms: { classes: true, classProperties: { loose: true } } },
      'preflight:decorators-not-supported',
    );
  });
}
