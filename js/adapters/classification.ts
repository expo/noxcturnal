import type { ParseClassification, TransformOptions } from '../types';

const SOURCE_HINTS = ['process.env', 'require', 'import', 'export'] as const;

class LazySourceHints implements ReadonlySet<string> {
  #set?: Set<string>;

  constructor(readonly source: string) {}

  get size(): number {
    return this.#all().size;
  }

  has(value: string): boolean {
    return (
      this.#set?.has(value) ??
      (SOURCE_HINTS.some(hint => hint === value) && this.source.includes(value))
    );
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

export function classifyForTransform(
  filename: string,
  source: string,
  syntaxOverride?: 'js' | 'jsx',
): ParseClassification {
  const lower = filename.toLowerCase();
  const syntax =
    syntaxOverride ??
    (/\.d\.(?:ts|mts|cts)$/.test(lower)
      ? 'dts'
      : lower.endsWith('.tsx')
        ? 'tsx'
        : lower.endsWith('.ts') || lower.endsWith('.mts') || lower.endsWith('.cts')
          ? 'ts'
          : lower.endsWith('.jsx')
            ? 'jsx'
            : lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')
              ? hasFlowDirective(source)
                ? 'flow'
                : 'js'
              : 'unknown');
  const supported = syntax !== 'flow' && syntax !== 'unknown';
  return {
    syntax,
    supported,
    reason: supported
      ? 'oxc-supported'
      : syntax === 'flow'
        ? 'flow-requires-parser-adapter'
        : 'unknown-extension',
  };
}

// Flow's pragma belongs to the leading comment header. Stop at the first token:
// quotes, templates and regular expressions are never directive comments.
function hasFlowDirective(source: string): boolean {
  let remaining = source;
  if (remaining.startsWith('#!')) remaining = remaining.replace(/^[^\r\n\u2028\u2029]*/, '');
  while (true) {
    remaining = remaining.trimStart();
    let end: number;
    if (remaining.startsWith('//')) {
      end = remaining.search(/[\r\n\u2028\u2029]/);
      if (end < 0) end = remaining.length;
    } else if (remaining.startsWith('/*')) {
      end = remaining.indexOf('*/', 2);
      if (end < 0) return false;
      end += 2;
    } else return false;
    if (/(?:^|[^\w])@flow(?:$|[^\w])/.test(remaining.slice(2, end))) return true;
    remaining = remaining.slice(end);
  }
}
