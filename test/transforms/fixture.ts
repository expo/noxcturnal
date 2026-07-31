import { expect, test } from 'vitest';

import type { PreflightPlan } from '../../js/index';
import { transformOutcome } from './transform';

export interface FixtureMode {
  readonly title: string;
  readonly options: PreflightPlan;
  readonly output: string;
}

export interface FixtureCase {
  readonly title: string;
  readonly source: string;
  readonly filename: string;
  readonly modes: readonly FixtureMode[];
}

export function runFixtures(cases: readonly FixtureCase[]): void {
  for (const fixture of cases) {
    for (const mode of fixture.modes) {
      test(`${fixture.title} [${mode.title}]`, async () => {
        expect(await transformOutcome(fixture.source, fixture.filename, mode.options)).toBe(
          mode.output,
        );
      });
    }
  }
}
