import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { EditCommand, EventBatch, NativeVlqMap, ParseClassification, Timings } from './types.js';

interface NativeBinding {
  available: boolean;
  NativeIndexedSession: new (source: string, filename: string, subscriptions?: string[]) => {
    next(subscriptions: string[], rootStart?: number, rootEnd?: number, fieldRequests?: { nodeType: string; fields: string[] }[]): EventBatch;
    nextPacked(subscriptions: string[], rootStart?: number, rootEnd?: number, fieldRequests?: { nodeType: string; fields: string[] }[], includeExit?: boolean): { data: Buffer; strings: string[]; nodeCount: number; emittedCount: number; timings: Timings };
    queryGlobals(names: string[]): { name: string; references: { id: number; start: number; end: number }[] }[];
    inspect(nodeIds: number[]): import('./types.js').NativeEvent[];
    childrenPackedBuffer(parentIds: number[], parentTypes: string[], parentTypeIds: number[]): Buffer;
    constantsPackedBuffer(nodeIds: number[]): Buffer;
    scopeParentsBuffer(): Buffer;
    commit(edits: EditCommand[], sourceMapMode?: string): { code: string; map: NativeVlqMap; timings: Timings };
    close(): void;
    memoryUsage(): number;
  };
  classify(filename: string, source: string): ParseClassification;
  commitEdits(source: string, filename: string, edits: EditCommand[], sourceMapMode?: string): { code: string; map: NativeVlqMap; timings: Timings };
  commitPackedEdits(source: string, filename: string, data: Buffer, strings: string[], sourceMapMode?: string): { code: string; map: NativeVlqMap; timings: Timings };
  commitPackedBuffer(source: string, filename: string, data: Buffer, sourceMapMode?: string): { code: string; map: NativeVlqMap; timings: Timings };
  materializeEvents(source: string, filename: string, subscriptions: string[], rootStart?: number, rootEnd?: number): EventBatch;
  materializePackedEvents(source: string, filename: string, subscriptions: string[], subscriptionIds: number[], rootStart?: number, rootEnd?: number, fieldRequests?: Buffer, includeExit?: boolean): { data: Buffer; strings: string[]; nodeCount: number; emittedCount: number; timings: Timings };
  materializePackedBuffer(source: string, filename: string, subscriptions: string[], subscriptionIds: number[], rootStart?: number, rootEnd?: number, fieldRequests?: Buffer, includeExit?: boolean, includeParent?: boolean, includeScope?: boolean, identifierNames?: string[], staticMemberPatterns?: string[]): Buffer;
  queryGlobals(source: string, filename: string, names: string[]): { name: string; references: { id: number; start: number; end: number }[] }[];
  inspectNodes(source: string, filename: string, nodeIds: number[]): import('./types.js').NativeEvent[];
  nativeVersion(): string;
  oxcVersion(): string;
  composeMappings(outer: string, inner: string, outerNameCount: number): string;
  validateExpression(code: string, parserMode?: string): void;
  validateStatements(code: string, parserMode?: string): void;
}

const require = createRequire(import.meta.url);
function loadBinding(): NativeBinding {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const suffix = platformSuffix();
  const local = join(root, `noxcturnal.${suffix}.node`);
  if (existsSync(local)) return Object.assign(require(local), { available: true }) as NativeBinding;
  try { return Object.assign(require(`noxcturnal-${suffix}`), { available: true }) as NativeBinding; }
  catch (error) {
    const unavailable = () => { throw new Error('Noxcturnal native binding is unavailable.', { cause: error }); };
    return {
      available: false,
      NativeIndexedSession: class { constructor() { unavailable(); } } as never,
      classify: () => ({ syntax: 'unknown', supported: false, codegenCandidate: false, reason: 'native-load-failed' }),
      nativeVersion: () => 'unavailable',
      oxcVersion: () => 'unavailable',
      commitEdits: unavailable as never,
      commitPackedEdits: unavailable as never,
      commitPackedBuffer: unavailable as never,
      materializeEvents: unavailable as never,
      materializePackedEvents: unavailable as never,
      materializePackedBuffer: unavailable as never,
      queryGlobals: unavailable as never,
      inspectNodes: unavailable as never,
      composeMappings: unavailable as never,
      validateExpression: unavailable as never,
      validateStatements: unavailable as never,
    };
  }
}
function platformSuffix(): string {
  if (process.platform === 'darwin') return `darwin-${process.arch}`;
  if (process.platform === 'win32') return `win32-${process.arch}-msvc`;
  if (process.platform === 'linux') {
    const glibc = (process.report?.getReport?.() as { header?: { glibcVersionRuntime?: string } } | undefined)?.header?.glibcVersionRuntime;
    return `linux-${process.arch}-${glibc ? 'gnu' : 'musl'}`;
  }
  return `${process.platform}-${process.arch}`;
}
export const native = loadBinding();
export type NativeIndexedSessionBinding = InstanceType<NativeBinding['NativeIndexedSession']>;
