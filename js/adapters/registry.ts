import type { ParseClassification, ParserAdapter } from '../types.js';

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
