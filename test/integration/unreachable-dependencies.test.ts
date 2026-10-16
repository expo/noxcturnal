import { expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js/index';

test.each([false, true])(
  'removes lowered unreachable dependencies (separate phases=%s)',
  separate => {
    const language = { transforms: { blockScoping: true } } as const;
    const optimization = {
      optimize: { constantFolding: true, deadCodeElimination: true, moduleContext: true },
    } as const;
    const result = transform(
      `export function root() {
      if (false) {
        const Tutorial = require('./onboard/Tutorial').Tutorial;
        return Tutorial;
      }
      return null;
    }`,
      'index.js',
      defineNativePipeline({
        phases: separate
          ? [
              { name: 'language', native: language },
              { name: 'optimization', native: optimization },
            ]
          : [{ name: 'combined', native: { ...language, ...optimization } }],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(JSON.stringify(result));
    expect(result.code).not.toContain('require(');
    expect(result.code).not.toContain('if (false)');
    expect(result.code).toContain('return null;');
  },
);
