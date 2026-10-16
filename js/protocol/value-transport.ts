/** Native strings normally stay UTF-8; exceptional UTF-16 strings use a NUL-prefixed JSON string. */
export function decodeString(value: string, cache?: Map<string, string>): string {
  if (value.charCodeAt(0) !== 0) return value;
  const cached = cache?.get(value);
  if (cached !== undefined) return cached;
  const decoded: string = JSON.parse(value.slice(1));
  cache?.set(value, decoded);
  return decoded;
}

/** Preserve isolated surrogates in predicate manifests before Buffer's UTF-8 encoding. */
export function encodeString(value: string): string {
  if (
    value.charCodeAt(0) === 0 ||
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)
  )
    return `\0${JSON.stringify(value)}`;
  return value;
}

export function decodeConstant(
  value: string,
  cache?: Map<string, string>,
): string | number | boolean | null {
  switch (value[0]) {
    case 's':
      return decodeString(value.slice(1), cache);
    case 'n':
      return Number(value.slice(1));
    case 'b':
      return value.slice(1) === 'true';
    case 'z':
      return null;
    default:
      throw new Error('invalid constant value tag');
  }
}
