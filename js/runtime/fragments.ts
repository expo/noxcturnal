import type {
  Code,
  CodeFactory,
  CodeFragment,
  CompositeFragment,
  NativeNodePath,
  SourceFragment,
} from '../contracts/visitor.js';
import { native } from '../native/binding.js';
import type { NativeTransformSession } from './session.js';

const SOURCE_FRAGMENT_SESSIONS = new WeakMap<SourceFragment, NativeTransformSession>();
const DIRECTIVE_PROLOGUE =
  /(?:\s|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*(['"])(?:(?!\1)[^\\\r\n]|\\.)*\1[ \t]*(?:;|(?=\r?\n|$))/y;

export type RealizedContent =
  | { content: string; contentParts?: undefined }
  | { content?: undefined; contentParts: (string | { start: number; end: number })[] };

export interface IntentRegistration {
  owner: string;
  realized: RealizedContent;
  phase: string;
  start?: number;
  end?: number;
}

export function directivePrologueEnd(source: string): number {
  let offset = 0;
  if (source.startsWith('#!')) {
    const newline = source.indexOf('\n');
    offset = newline === -1 ? source.length : newline + 1;
  }
  DIRECTIVE_PROLOGUE.lastIndex = offset;
  while (DIRECTIVE_PROLOGUE.exec(source) != null) offset = DIRECTIVE_PROLOGUE.lastIndex;
  if (source.charCodeAt(offset) === 13 && source.charCodeAt(offset + 1) === 10) offset += 2;
  else if (source.charCodeAt(offset) === 10) offset += 1;
  return offset;
}

export function identicalRealizedContent(a: RealizedContent, b: RealizedContent): boolean {
  if (a.content != null || b.content != null) return a.content === b.content;
  return identicalContentParts(a.contentParts, b.contentParts);
}

export function makeSourceFragment(
  session: NativeTransformSession,
  start: number,
  end: number,
): SourceFragment {
  const reject = (): never => {
    throw new Error(
      `source fragment ${start}..${end} carries provenance and cannot be used as text; ` +
        'interpolate it with code.template`...` (or pass it to replaceWith) to keep provenance, ' +
        'or call .text() to copy it as plain text',
    );
  };
  const fragment: SourceFragment = Object.freeze({
    kind: 'source',
    start,
    end,
    text: () => session.source.slice(start, end),
    toString: reject,
    [Symbol.toPrimitive]: reject,
  });
  SOURCE_FRAGMENT_SESSIONS.set(fragment, session);
  return fragment;
}

export function sourceFragmentBelongsTo(
  fragment: SourceFragment,
  session: NativeTransformSession,
): boolean {
  return SOURCE_FRAGMENT_SESSIONS.get(fragment) === session;
}

export function realizeContent(
  session: NativeTransformSession,
  value: Code | readonly Code[],
  onDegrade?: (message: string, fragment: SourceFragment) => void,
  prefix = '',
  suffix = '',
): RealizedContent {
  const parts: (string | { start: number; end: number })[] = [];
  let hasCopy = false;
  const push = (part: Code): void => {
    if (typeof part === 'string') {
      if (part) parts.push(part);
      return;
    }
    if ('kind' in part) {
      if (part.kind === 'composite') {
        for (const inner of part.parts) push(inner);
        return;
      }
      if (SOURCE_FRAGMENT_SESSIONS.get(part) === session) {
        parts.push({ start: part.start, end: part.end });
        hasCopy = true;
      } else {
        onDegrade?.(
          `source fragment ${part.start}..${part.end} comes from another phase; copied as text`,
          part,
        );
        if (part.text()) parts.push(part.text());
      }
      return;
    }
    if (part.code) parts.push(part.code);
  };
  if (prefix) parts.push(prefix);
  if (isFragmentList(value)) {
    value.forEach((part, index) => {
      if (index > 0) parts.push('\n');
      push(part);
    });
  } else {
    push(value);
  }
  if (suffix) parts.push(suffix);
  if (!hasCopy) return { content: parts.join('') };
  const merged: (string | { start: number; end: number })[] = [];
  for (const part of parts) {
    const last = merged[merged.length - 1];
    if (typeof part === 'string' && typeof last === 'string')
      merged[merged.length - 1] = last + part;
    else merged.push(part);
  }
  return { contentParts: merged };
}

export function isProvenanceCode(value: Code): value is SourceFragment | CompositeFragment {
  return typeof value !== 'string' && 'kind' in value;
}

export function containsProvenance(value: Code | NativeNodePath): boolean {
  if (typeof value === 'string') return false;
  if ('getSource' in value) return true;
  if (!('kind' in value)) return false;
  return value.kind === 'source' || value.parts.some(part => containsProvenance(part));
}

export function isFragmentList(value: Code | readonly Code[]): value is readonly Code[] {
  return Array.isArray(value);
}

export const codeFactory: CodeFactory = {
  identifier(name) {
    if (!/^[$A-Z_a-z][$\w]*$/.test(name)) throw new Error(`Invalid identifier: ${name}`);
    return { code: name, mapping: 'sourceless' };
  },
  stringLiteral: value => ({ code: JSON.stringify(value), mapping: 'sourceless' }),
  literal(value) {
    return {
      code:
        typeof value === 'bigint'
          ? `${value}n`
          : value === null
            ? 'null'
            : typeof value === 'string'
              ? JSON.stringify(value)
              : String(value),
      mapping: 'sourceless',
    };
  },
  template(parts, ...values) {
    if (values.some(containsProvenance)) {
      const composite: (string | CodeFragment | SourceFragment)[] = [];
      parts.forEach((part, index) => {
        if (part) composite.push(part);
        if (index >= values.length) return;
        const value = values[index]!;
        const resolved: Code =
          typeof value !== 'string' && 'getSource' in value ? value.getSource() : value;
        if (typeof resolved === 'string' || !('kind' in resolved)) composite.push(resolved);
        else if (resolved.kind === 'source') composite.push(resolved);
        else composite.push(...resolved.parts);
      });
      return { kind: 'composite', parts: composite };
    }
    return {
      code: parts.reduce(
        (code, part, index) =>
          code +
          part +
          (index < values.length
            ? typeof values[index] === 'string'
              ? (values[index] as string)
              : (values[index] as CodeFragment).code
            : ''),
        '',
      ),
      mapping: 'sourceless',
    };
  },
  parseExpression(code, parserMode) {
    native.validateExpression(code, parserMode === 'auto' ? undefined : parserMode);
    return { code, mapping: 'anchor-boundaries' };
  },
  parseStatements(code, parserMode) {
    native.validateStatements(code, parserMode === 'auto' ? undefined : parserMode);
    return { code, mapping: 'anchor-boundaries' };
  },
};

function identicalContentParts(
  a: readonly (string | { start: number; end: number })[],
  b: readonly (string | { start: number; end: number })[],
): boolean {
  return (
    a.length === b.length &&
    a.every((part, index) => {
      const other = b[index];
      if (typeof part === 'string' || typeof other === 'string') return part === other;
      return part.start === other.start && part.end === other.end;
    })
  );
}
