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

/** Recognize only static member syntax; no evaluation or native lookups. */
export function staticMemberPath(source: string): string | null {
  let offset = 0;
  const space = () => {
    while (offset < source.length) {
      const match = /^(?:\s+|\/\*[\s\S]*?\*\/|\/\/[^\r\n\u2028\u2029]*)/.exec(source.slice(offset));
      if (!match) break;
      offset += match[0].length;
    }
  };
  const consume = (token: string) => {
    space();
    if (!source.startsWith(token, offset)) return false;
    offset += token.length;
    return true;
  };
  const escape = (): string | null => {
    const char = source[offset++];
    if (char === 'u' || char === 'x') {
      const braced = char === 'u' && source[offset] === '{';
      if (braced) offset++;
      const digits = braced
        ? /^[\da-fA-F]+/.exec(source.slice(offset))?.[0]
        : source.slice(offset, offset + (char === 'u' ? 4 : 2));
      if (
        !digits ||
        !/^[\da-fA-F]+$/.test(digits) ||
        (!braced && digits.length !== (char === 'u' ? 4 : 2))
      )
        return null;
      offset += digits.length;
      if (braced && source[offset++] !== '}') return null;
      const value = parseInt(digits, 16);
      return value <= 0x10ffff ? String.fromCodePoint(value) : null;
    }
    if (char === '\r') {
      if (source[offset] === '\n') offset++;
      return '';
    }
    if (char === '\n' || char === '\u2028' || char === '\u2029') return '';
    const simple: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v' };
    if (/[0-7]/.test(char ?? '')) {
      let digits = char;
      const limit = char <= '3' ? 3 : 2;
      while (digits.length < limit && /[0-7]/.test(source[offset] ?? ''))
        digits += source[offset++];
      return String.fromCharCode(parseInt(digits, 8));
    }
    return simple[char] ?? char ?? null;
  };
  const identifier = (): string | null => {
    space();
    let value = '';
    while (offset < source.length) {
      const char = String.fromCodePoint(source.codePointAt(offset)!);
      if (char === '\\') {
        offset++;
        if (source[offset] !== 'u') return null;
        const decoded = escape();
        if (
          decoded === null ||
          !(value ? /^[$\u200c\u200d\p{ID_Continue}]$/u : /^[$_\p{ID_Start}]$/u).test(decoded)
        )
          return null;
        value += decoded;
      } else if ((value ? /^[$\u200c\u200d\p{ID_Continue}]$/u : /^[$_\p{ID_Start}]$/u).test(char)) {
        value += char;
        offset += char.length;
      } else break;
    }
    return value || null;
  };
  const string = (): string | null => {
    space();
    const quote = source[offset++];
    if (quote !== '"' && quote !== "'") return null;
    let value = '';
    while (offset < source.length) {
      const char = source[offset++];
      if (char === quote) return value;
      if (char === '\\') {
        const decoded = escape();
        if (decoded === null) return null;
        value += decoded;
      } else value += char;
    }
    return null;
  };
  const chain = (): string | null => {
    let path: string | null;
    if (consume('(')) {
      path = chain();
      if (!consume(')')) return null;
    } else path = identifier();
    if (path === null) return null;
    while (true) {
      const optional = consume('?.');
      if (consume('[')) {
        const property = string();
        if (property === null || !consume(']')) return null;
        path += `.${memberSegment(property)}`;
      } else if (optional || consume('.')) {
        const property = identifier();
        if (property === null) return null;
        path += `.${memberSegment(property)}`;
      } else break;
    }
    return path;
  };
  const path = chain();
  space();
  return offset === source.length ? path : null;
}
