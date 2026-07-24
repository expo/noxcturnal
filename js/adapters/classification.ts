import type { ParseClassification, TransformOptions } from '../types.js';

const SOURCE_HINTS = [
  'process.env',
  'require',
  'import',
  'export',
  'codegenNativeComponent',
] as const;

class LazySourceHints implements ReadonlySet<string> {
  #set?: Set<string>;

  constructor(readonly source: string) {}

  get size(): number {
    return this.#all().size;
  }

  has(value: string): boolean {
    return this.#set?.has(value) ?? this.source.includes(value);
  }

  entries(): SetIterator<[string, string]> {
    return this.#all().entries();
  }

  keys(): SetIterator<string> {
    return this.#all().keys();
  }

  values(): SetIterator<string> {
    return this.#all().values();
  }

  forEach(
    callback: (value: string, value2: string, set: ReadonlySet<string>) => void,
    thisArg?: unknown,
  ): void {
    for (const value of this.#all()) callback.call(thisArg, value, value, this);
  }

  [Symbol.iterator](): SetIterator<string> {
    return this.values();
  }

  #all(): Set<string> {
    return (this.#set ??= new Set(SOURCE_HINTS.filter(hint => this.source.includes(hint))));
  }
}

export function sourceHints(source: string): ReadonlySet<string> {
  return new LazySourceHints(source);
}

export function parserFilename(filename: string, parser: TransformOptions['parser']): string {
  if (!parser || parser === 'auto') return filename;
  const extension = parser === 'dts' ? 'd.ts' : parser;
  return `${filename.replace(/(?:\.d)?\.[^.]+$/, '')}.${extension}`;
}

export function classifyForTransform(filename: string, source: string): ParseClassification {
  const lower = filename.toLowerCase();
  const syntax = lower.endsWith('.d.ts')
    ? 'dts'
    : lower.endsWith('.tsx')
      ? 'tsx'
      : lower.endsWith('.ts') || lower.endsWith('.mts') || lower.endsWith('.cts')
        ? 'ts'
        : lower.endsWith('.jsx')
          ? 'jsx'
          : lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')
            ? source.includes('@flow')
              ? 'flow'
              : 'js'
            : 'unknown';
  const supported = syntax !== 'flow' && syntax !== 'unknown';
  return {
    syntax,
    supported,
    get codegenCandidate() {
      return source.includes('codegenNativeComponent') || source.includes('codegenNativeCommands');
    },
    reason: supported
      ? 'oxc-supported'
      : syntax === 'flow'
        ? 'flow-requires-parser-adapter'
        : 'unknown-extension',
  };
}
