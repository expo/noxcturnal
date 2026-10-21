import { expect, test } from 'vitest';
import { transformOutcome } from './transform';

export interface CorpusCase {
  readonly title: string;
  readonly source: string;
  readonly output: string;
}

type TransformOptions = NonNullable<Parameters<typeof transformOutcome>[2]>;

export interface CorpusConfig {
  readonly filename: string;
  readonly options: TransformOptions;
}

export function runCorpus(cases: readonly CorpusCase[], config: CorpusConfig): void {
  // Embedded expect() calls are source text: this suite compares transform output.
  for (const { title, source, output } of cases) {
    test(`output snapshot: ${title}`, async () => {
      expect(await transformOutcome(source, config.filename, config.options)).toBe(output);
    });
  }
}
