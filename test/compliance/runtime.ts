import { expect } from 'vitest';

import type { PreflightPlan, TransformOptions } from '../../js';
import { defineNativePipeline, transform } from '../../js';

type RuntimeBindings = Record<string, unknown>;

export function compile(
  source: string,
  plan: PreflightPlan,
  filename = 'input.js',
  options?: TransformOptions,
): string {
  const result = transform(
    source,
    filename,
    defineNativePipeline({
      phases: [
        {
          name: 'compliance',
          native: { helpers: { mode: 'inline' }, ...plan },
        },
      ],
    }),
    options,
  );
  expect(result.status, JSON.stringify(result)).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  return result.code;
}

export function execute<T extends RuntimeBindings = RuntimeBindings>(
  source: string,
  plan: PreflightPlan,
  bindings: RuntimeBindings = {},
  filename = 'input.js',
): T {
  const context: RuntimeBindings = {};
  const names = Object.keys(bindings);
  const values = Object.values(bindings);
  new Function(...names, 'globalThis', compile(source, plan, filename))(...values, context);
  return context as T;
}

export async function executeModule(
  source: string,
  plan: PreflightPlan,
  filename = 'input.mjs',
): Promise<Record<string, unknown>> {
  const code = compile(source, plan, filename);
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${crypto.randomUUID()}`;
  return import(url) as Promise<Record<string, unknown>>;
}

export async function importCode(code: string): Promise<Record<string, unknown>> {
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${crypto.randomUUID()}`;
  return import(url) as Promise<Record<string, unknown>>;
}
