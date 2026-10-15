import { describe, expect, test } from 'vitest';
import { decodeConstant, decodeString, encodeString } from '../value-transport';

describe('host value transport', () => {
  test('round-trips exceptional strings without touching ordinary text', () => {
    for (const value of [
      'plain',
      '3',
      'true',
      '',
      '\uD800',
      '\uDC00',
      '\uD83D\uDE00',
      '\0',
      '\uFFFD\uD800',
      'a\uD800b',
      '\u2028',
    ]) {
      expect(decodeString(encodeString(value))).toBe(value);
      const exceptional =
        value.charCodeAt(0) === 0 ||
        /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value);
      if (!exceptional) expect(encodeString(value)).toBe(value);
    }
  });

  test('decodes an explicit constant kind tag', () => {
    expect(Object.is(decodeConstant('n-0'), -0)).toBe(true);
    expect(decodeConstant('n0')).toBe(0);
    expect(decodeConstant('nInfinity')).toBe(Infinity);
    expect(decodeConstant('n-Infinity')).toBe(-Infinity);
    expect(Object.is(decodeConstant('nNaN'), NaN)).toBe(true);
    expect(decodeConstant(`s${encodeString('\uD800')}`)).toBe('\uD800');
    expect(decodeConstant('strue')).toBe('true');
    expect(decodeConstant('btrue')).toBe(true);
    expect(decodeConstant('bfalse')).toBe(false);
    expect(decodeConstant('z')).toBe(null);
  });
});
