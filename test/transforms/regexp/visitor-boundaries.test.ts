import { expect, test } from 'vitest';
import type { PreflightTransforms } from '../../../js';
import { compile } from '../../compliance/runtime';

function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
const contexts = [
  { name: 'default parameter', expression: '((r = /./s) => r.flags)()' },
  { name: 'getter body', expression: '({get value() { return /./s.flags; }}).value' },
  { name: 'class field', expression: '(new (class { value = /./s.flags; })).value' },
  { name: 'computed method key', expression: 'Object.keys({[/./s.flags]() {}})[0]' },
  { name: 'template substitution', expression: '`${/./s.flags}`' },
  { name: 'optional-call argument', expression: '((r) => r.flags)?.(/./s)' },
  { name: 'nested arrow', expression: '(() => () => /./s.flags)()()' },
];
for (const entry of contexts) {
  test(`dot-all literal visitation: ${entry.name}`, () => {
    const source = `globalThis.result = ${entry.expression};`;
    expect(run(source)).toBe('s');
    const code = compile(source, { transforms: { regexpDotAll: true } });
    expect(code).not.toContain('/./s');
    expect(run(code)).toBe('');
  });
}
const selections: {
  name: string;
  transforms: PreflightTransforms;
  pattern: string;
  flags: string;
  marker: RegExp;
}[] = [
  {
    name: 'dot-all',
    transforms: { regexpDotAll: true },
    pattern: '.',
    flags: 's',
    marker: /\/\.\/s/,
  },
  {
    name: 'Unicode',
    transforms: { regexpUnicode: true },
    pattern: '.',
    flags: 'u',
    marker: /\/\.\/u/,
  },
  {
    name: 'Unicode sets',
    transforms: { regexpUnicodeSets: true },
    pattern: '[a]',
    flags: 'v',
    marker: /\/\[a\]\/v/,
  },
  {
    name: 'Unicode properties',
    transforms: { regexpUnicodePropertyEscapes: true },
    pattern: String.raw`\p{ASCII}`,
    flags: 'u',
    marker: /\/\\p\{ASCII\}\//,
  },
  {
    name: 'named capture',
    transforms: { regexpNamedCaptureGroups: true },
    pattern: '(?<letter>a)',
    flags: '',
    marker: /\/\(\?<letter>/,
  },
  {
    name: 'sticky',
    transforms: { regexpSticky: true },
    pattern: 'a',
    flags: 'y',
    marker: /\/a\/y/,
  },
];
for (const entry of selections) {
  test(`${entry.name}: only literal patterns are lowered`, () => {
    const source = `const literal = /${entry.pattern}/${entry.flags};
      const call = RegExp(${JSON.stringify(entry.pattern)}, ${JSON.stringify(entry.flags)});
      const construct = new RegExp(${JSON.stringify(entry.pattern)}, ${JSON.stringify(entry.flags)});
      const unselected = /z/g;
      globalThis.result = [literal.test('a'), call.source, call.flags, construct.source, construct.flags, unselected.source, unselected.flags];`;
    const expected = run(source);
    const code = compile(source, { transforms: entry.transforms });
    expect(code).not.toMatch(entry.marker);
    expect(run(code)).toEqual(expected);
  });
}
