import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { NativeTransformSession } from '../session';

for (const source of ['', ' \t\n', '  3;', '\ufeff\r\n\t3;\u2028 \u2029 4;']) {
  test(`Program leading line comment preserves form: ${JSON.stringify(source)}`, () => {
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'comment',
            plugins: [
              defineNativePlugin({
                name: 'comment',
                visitors: [
                  defineVisitor('Program', {}, path => path.addComment('leading', 'note', true)),
                ],
              }),
            ],
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toBe(`//note\n${source}`);
  });
}

test('paged line facts agree with adjacent whitespace at CRLF, Unicode, page edges, and EOF', () => {
  const source = ' '.repeat(4095) + '\r\n\ufeff  3;\u2028\t\u2029 4;\n' + ' '.repeat(4096);
  const session = new NativeTransformSession(source, 'input.js');
  try {
    const offsets = [
      0,
      1,
      4094,
      4095,
      4096,
      4097,
      4100,
      4101,
      4102,
      4103,
      4104,
      4105,
      8191,
      8192,
      source.length,
    ];
    // Repeat each page, then revisit pages in reverse to exercise cache replacement.
    for (const offset of [...offsets, ...[...offsets].reverse()]) {
      const prefix = source
        .slice(0, offset)
        .split(/[\r\n\u2028\u2029]/)
        .at(-1)!;
      expect(session.startsLine(offset)).toBe(prefix.trim().length === 0);
    }
  } finally {
    session.close();
  }
});
