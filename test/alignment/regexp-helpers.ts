import { createRequire } from 'node:module';

export const regexpRequire = createRequire(import.meta.url);

/** Execute a regexp fixture with isolated globals and access to Babel runtime helpers. */
export function runRegExpCode(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(regexpRequire, context);
  return context.result;
}
