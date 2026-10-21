import { format } from 'oxfmt';
import { expect, test } from 'vitest';

import type { PreflightPlan } from '../../js/index';
import { defineNativePipeline, transform, TransformSyntaxError } from '../../js/index';
import { nativeFlowErasureBuilt } from '../../js/native/binding';

export { nativeFlowErasureBuilt };

export const flowTest = test.skipIf(!nativeFlowErasureBuilt());

export async function transformSource(
  source: string,
  filename: string,
  preflight: PreflightPlan,
): Promise<string> {
  const result = transform(
    source,
    filename,
    defineNativePipeline({ phases: [{ name: 'preflight', native: preflight }] }),
  );
  if (result.status !== 'complete') throw new Error(JSON.stringify(result));
  return formatOutput(result.code);
}

/** Transform an external corpus case, retaining an intentional bailout as snapshot output. */
export async function transformOutcome(
  source: string,
  filename: string,
  preflight: PreflightPlan,
): Promise<string> {
  let result;
  try {
    result = transform(
      source,
      filename,
      defineNativePipeline({ phases: [{ name: 'preflight', native: preflight }] }),
    );
  } catch (error) {
    if (error instanceof TransformSyntaxError) return '[syntax-error] invalid-input';
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: unknown }).code === 'NOXCTURNAL_TRANSFORM_ERROR'
    ) {
      const fatal = error as { phase?: string; reason?: string };
      return `[error] ${fatal.phase ?? 'unknown'}:${fatal.reason ?? 'native-transform-error'}`;
    }
    throw error;
  }
  if (result.status !== 'complete') return `[bailout] ${result.reason}`;
  return formatOutput(result.code);
}

async function formatOutput(code: string): Promise<string> {
  const formatted = await format('output.js', code, {
    arrowParens: 'avoid',
    printWidth: 100,
    singleQuote: true,
    trailingComma: 'all',
  });
  expect(formatted.errors).toEqual([]);
  return formatted.code.trimEnd();
}

export const runtimeHelpers = {
  mode: 'runtime',
  moduleName: '@babel/runtime',
  version: '7.29.7',
} as const;
