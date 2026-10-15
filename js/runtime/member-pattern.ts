/** Backslashes quote only literal dots and backslashes, never separators. */
export function validMemberPattern(pattern: string): boolean {
  if (pattern.length === 0) return false;
  if (!pattern.includes('\\')) return true;
  for (let i = 0; i < pattern.length; i++)
    if (pattern[i] === '\\' && !['.', '\\'].includes(pattern[++i])) return false;
  return true;
}

/** Encode property boundaries without changing ordinary dotted paths. */
export function memberSegment(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\./g, '\\.');
}

/** Recognize static member syntax in one forward scan, without evaluation. */
export interface MemberPathScan {
  prefix(start: number, end: number, path: string): void;
  knownPrefix(start: number): { end: number; path: string } | null | undefined;
  nonstatic(openings: readonly number[], start: number, after: number): void;
}

export function staticMemberPath(source: string, scan?: MemberPathScan): string | null {
  if (!scan && plainMember.test(source)) return source;
  let offset = 0;
  let start = 0;
  let prefixEnd = 0;
  const openings: number[] = [];
  const fail = (): null => {
    scan?.nonstatic(openings, start, prefixEnd + 1);
    return null;
  };
  const space = (): boolean => {
    while (offset < source.length) {
      const code = source.charCodeAt(offset);
      if (code === 32 || (code >= 9 && code <= 13) || (code > 127 && /\s/u.test(source[offset]))) {
        offset++;
      } else if (code === 47 && source[offset + 1] === '*') {
        // A single-character search is much faster on long comment bodies.
        // Fall back when that slash is inside the comment, preserving the first
        // closing delimiter without a loop over arbitrary slashes or stars.
        const slash = source.indexOf('/', offset + 2);
        const end =
          slash > offset + 2 && source.charCodeAt(slash - 1) === 42
            ? slash - 1
            : source.indexOf('*/', offset + 2);
        if (end < 0) return false;
        offset = end + 2;
      } else if (code === 47 && source[offset + 1] === '/') {
        offset += 2;
        while (offset < source.length && !lineEnd(source.charCodeAt(offset))) offset++;
      } else break;
    }
    return true;
  };
  const escape = (): string | null => {
    const char = source[offset++];
    if (char === 'u' || char === 'x') {
      const braced = char === 'u' && source[offset] === '{';
      if (braced) offset++;
      const start = offset;
      const limit = braced ? source.length : offset + (char === 'u' ? 4 : 2);
      let value = 0;
      while (offset < limit) {
        const digit = hexDigit(source.charCodeAt(offset));
        if (digit < 0) break;
        value = value * 16 + digit;
        offset++;
      }
      if (offset === start || (!braced && offset !== limit) || value > 0x10ffff) return null;
      if (braced && source[offset++] !== '}') return null;
      return String.fromCodePoint(value);
    }
    if (char === '\r') {
      if (source[offset] === '\n') offset++;
      return '';
    }
    if (char === '\n' || char === '\u2028' || char === '\u2029') return '';
    if (char >= '0' && char <= '7') {
      let value = char.charCodeAt(0) - 48;
      const limit = offset + (char <= '3' ? 2 : 1);
      while (offset < limit && source[offset] >= '0' && source[offset] <= '7')
        value = value * 8 + source.charCodeAt(offset++) - 48;
      return String.fromCharCode(value);
    }
    return simpleEscapes[char] ?? char ?? null;
  };
  const identifier = (): string | null => {
    let start = offset;
    let value = '';
    let first = true;
    while (offset < source.length) {
      const code = source.charCodeAt(offset);
      if (code === 92) {
        value += source.slice(start, offset++);
        if (source[offset] !== 'u') return null;
        const decoded = escape();
        if (decoded === null || !(first ? identifierStart : identifierContinue).test(decoded))
          return null;
        value += decoded;
        start = offset;
      } else if (
        code === 36 ||
        code === 95 ||
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        (!first && code >= 48 && code <= 57)
      ) {
        offset++;
      } else if (code > 127) {
        const char = String.fromCodePoint(source.codePointAt(offset)!);
        if (!(first ? identifierStart : identifierContinue).test(char)) break;
        offset += char.length;
      } else break;
      first = false;
    }
    return first ? null : value + source.slice(start, offset);
  };
  const string = (): string | null => {
    const quote = source[offset++];
    if (quote !== '"' && quote !== "'") return null;
    let start = offset;
    let value = '';
    while (offset < source.length) {
      const char = source[offset++];
      if (char === quote) return value + source.slice(start, offset - 1);
      if (char === '\\') {
        value += source.slice(start, offset - 1);
        const decoded = escape();
        if (decoded === null) return null;
        value += decoded;
        start = offset;
      }
    }
    return null;
  };
  if (!space()) return fail();
  let known: ReturnType<MemberPathScan['knownPrefix']>;
  while (true) {
    start = offset;
    known = scan?.knownPrefix(offset);
    if (known === null) return fail();
    if (known || source[offset] !== '(') break;
    openings.push(offset);
    offset++;
    if (!space()) return fail();
  }
  let path = known ? known.path : identifier();
  if (known) offset = known.end;
  if (path === null) return fail();
  prefixEnd = offset;
  scan?.prefix(start, offset, path);
  while (true) {
    if (!space()) return fail();
    if (source[offset] === ')') {
      const opening = openings.pop();
      if (opening === undefined) return fail();
      start = opening;
      offset++;
      prefixEnd = offset;
      scan?.prefix(start, offset, path);
      continue;
    }
    const optional = source.startsWith('?.', offset);
    if (optional) {
      offset += 2;
      if (!space()) return fail();
    }
    if (source[offset] === '[') {
      offset++;
      if (!space()) return fail();
      const property = string();
      if (property === null || !space() || source[offset++] !== ']') return fail();
      path += `.${memberSegment(property)}`;
    } else if (optional || source[offset] === '.') {
      if (!optional) offset++;
      if (!space()) return fail();
      const property = identifier();
      if (property === null) return fail();
      path += `.${property}`;
    } else break;
    prefixEnd = offset;
    scan?.prefix(start, offset, path);
  }
  return openings.length === 0 && offset === source.length ? path : fail();
}

const plainMember = /^[$A-Z_a-z][$\w]*(?:\.[$A-Z_a-z][$\w]*)*(?![\s\S])/;
const identifierStart = /^[$_\p{ID_Start}]$/u;
const identifierContinue = /^[$\u200c\u200d\p{ID_Continue}]$/u;
const simpleEscapes: Record<string, string> = {
  n: '\n',
  r: '\r',
  t: '\t',
  b: '\b',
  f: '\f',
  v: '\v',
};
function lineEnd(code: number): boolean {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
}
function hexDigit(code: number): number {
  if (code >= 48 && code <= 57) return code - 48;
  if (code >= 65 && code <= 70) return code - 55;
  if (code >= 97 && code <= 102) return code - 87;
  return -1;
}
