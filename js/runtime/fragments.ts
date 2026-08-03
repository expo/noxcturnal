import type {
  Code,
  CodeFactory,
  CodeFragment,
  CompositeFragment,
  NativeNodePath,
  SourceFragment,
} from '../contracts/visitor';
import { native } from '../native/binding';
import type { NativeTransformSession } from './session';

const SOURCE_FRAGMENT_SESSIONS = new WeakMap<SourceFragment, NativeTransformSession>();

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
  let strings: string[] = [];
  const flushStrings = (): void => {
    if (strings.length) merged.push(strings.join(''));
    strings = [];
  };
  for (const part of parts) {
    if (typeof part === 'string') strings.push(part);
    else {
      flushStrings();
      merged.push(part);
    }
  }
  flushStrings();
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

function isReservedIdentifier(name: string): boolean {
  switch (name) {
    case 'await':
    case 'break':
    case 'case':
    case 'catch':
    case 'class':
    case 'const':
    case 'continue':
    case 'debugger':
    case 'default':
    case 'delete':
    case 'do':
    case 'else':
    case 'enum':
    case 'export':
    case 'extends':
    case 'false':
    case 'finally':
    case 'for':
    case 'function':
    case 'if':
    case 'implements':
    case 'import':
    case 'in':
    case 'instanceof':
    case 'interface':
    case 'let':
    case 'new':
    case 'null':
    case 'package':
    case 'private':
    case 'protected':
    case 'public':
    case 'return':
    case 'static':
    case 'super':
    case 'switch':
    case 'this':
    case 'throw':
    case 'true':
    case 'try':
    case 'typeof':
    case 'var':
    case 'void':
    case 'while':
    case 'with':
    case 'yield':
      return true;
    default:
      return false;
  }
}

export const codeFactory: CodeFactory = {
  identifier(name) {
    if (
      isReservedIdentifier(name) ||
      !/^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u.test(name)
    )
      throw new Error(`Invalid identifier: ${name}`);
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
    const chunks: string[] = [];
    parts.forEach((part, index) => {
      chunks.push(part);
      if (index >= values.length) return;
      const value = values[index]!;
      chunks.push(typeof value === 'string' ? value : (value as CodeFragment).code);
    });
    return {
      code: chunks.join(''),
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
