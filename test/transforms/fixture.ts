import { expect, test } from 'vitest';

import type { PreflightPlan } from '../../js/index';
import { transformOutcome } from './transform';

export interface FixtureMode {
  readonly title: string;
  readonly options: PreflightPlan;
  readonly output?: string;
}

interface FixtureInput {
  readonly title: string;
  readonly source: string;
  readonly filename: string;
}

// Most modes share one output contract. Keep it beside the source instead of
// maintaining a separate, index-addressed output table.
export type FixtureCase = FixtureInput &
  (
    | { readonly output: string; readonly modes: readonly FixtureMode[] }
    | {
        readonly output?: never;
        readonly modes: readonly (FixtureMode & { readonly output: string })[];
      }
  );

export function runFixtures(cases: readonly FixtureCase[]): void {
  for (const fixture of cases) {
    for (const mode of fixture.modes) {
      test(`${fixture.title} [${mode.title}]`, async () => {
        expect(await transformOutcome(fixture.source, fixture.filename, mode.options)).toBe(
          mode.output ?? fixture.output,
        );
      });
    }
  }
}
