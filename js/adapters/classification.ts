import type { ParseClassification, TransformOptions } from '../types';

import { native } from '../native/binding';

export function sourceHints(source: string): ReadonlySet<string> {
  let hints: Set<string> | undefined;
  const values = () => (hints ??= new Set(native.sourceHints(source)));
  const result: ReadonlySet<string> = {
    get size() {
      return values().size;
    },
    has: hint => values().has(hint),
    keys: () => values().keys(),
    values: () => values().values(),
    entries: () => values().entries(),
    [Symbol.iterator]: () => values().values(),
    forEach(callback, thisArg) {
      for (const value of values()) callback.call(thisArg, value, value, result);
    },
  };
  return result;
}

export function parserFilename(filename: string, parser: TransformOptions['parser']): string {
  if (!parser || parser === 'auto') return filename;
  const extension = parser === 'dts' ? 'd.ts' : parser;
  return `${filename.replace(/(?:\.d)?\.[^.]+$/, '')}.${extension}`;
}

export function classifyForTransform(
  filename: string,
  source: string,
  syntaxOverride?: 'js' | 'jsx',
): ParseClassification {
  if (syntaxOverride) return { syntax: syntaxOverride, supported: true, reason: 'oxc-supported' };
  return native.classify(filename, source);
}
