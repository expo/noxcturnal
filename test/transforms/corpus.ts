import { expect, test } from 'vitest';
import { transformOutcome } from './transform';

export type CorpusCase = readonly [title: string, source: string, output: string];

type TransformOptions = NonNullable<Parameters<typeof transformOutcome>[2]>;

export interface CorpusConfig {
  readonly filename: string;
  readonly options: TransformOptions;
  readonly assertionKind: 'transform snapshot';
  readonly sourceIndentation: number;
}

export function runCorpus(cases: readonly CorpusCase[], config: CorpusConfig): void {
  for (const corpusCase of cases) {
    const [title, compactSource, output] = corpusCase;
    test(title, async () => {
      const source = expandSource(compactSource, config.sourceIndentation);
      expect(await transformOutcome(source, config.filename, config.options)).toBe(output);
    });
  }
}

function expandSource(source: string, indentation: number): string {
  return source.replaceAll('\n', `\n${' '.repeat(indentation)}`);
}
