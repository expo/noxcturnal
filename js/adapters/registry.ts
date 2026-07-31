import type { ParseClassification, ParserAdapter } from '../types';

const parserAdapters = new Map<string, ParserAdapter>();

export function registerParserAdapter(adapter: ParserAdapter): () => void {
  if (parserAdapters.has(adapter.name))
    throw new Error(`Parser adapter already registered: ${adapter.name}`);
  parserAdapters.set(adapter.name, adapter);
  return () => {
    if (parserAdapters.get(adapter.name) === adapter) parserAdapters.delete(adapter.name);
  };
}

export function selectParserAdapter(
  name: string | undefined,
  classification: ParseClassification,
): ParserAdapter | undefined {
  if (name) return parserAdapters.get(name);
  for (const candidate of parserAdapters.values()) {
    if (candidate.supports(classification)) return candidate;
  }
  return undefined;
}

export function parserAdapterCacheDescriptor(
  name: string | undefined,
  classification?: ParseClassification,
): { name: string; version: string; options: unknown } | null {
  const adapter =
    classification == null
      ? name == null
        ? undefined
        : parserAdapters.get(name)
      : selectParserAdapter(name, classification);
  return adapter == null
    ? null
    : { name: adapter.name, version: adapter.version, options: adapter.options ?? null };
}
