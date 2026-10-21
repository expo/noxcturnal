import { transformSync, type NodePath } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const cases = [
  {
    name: 'yield line comment',
    source: 'function* read(){yield 3}globalThis.result=read().next().value;',
    line: true,
  },
  { name: 'await line comment', source: 'globalThis.result=(async()=>await 3)();', line: true },
  {
    name: 'return line comment',
    source: 'function read(){return 3}globalThis.result=read();',
    line: true,
  },
  {
    name: 'throw line comment',
    source: 'try{throw 3}catch(error){globalThis.result=error}',
    line: true,
  },
  {
    name: 'return block comment',
    source: 'function read(){return 3}globalThis.result=read();',
    line: false,
  },
];
function run(source: string) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', source)(context);
  return context.result;
}
describe.each(cases)('$name', entry => {
  let code: string, babel: string;
  beforeAll(() => {
    babel = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      plugins: [
        () => ({
          visitor: {
            NumericLiteral(path: NodePath) {
              path.addComment('leading', 'note', entry.line);
            },
          },
        }),
      ],
    })!.code!;
    const plugin = defineNativePlugin({
      name: 'comment-audit',
      visitors: [
        defineVisitor('NumericLiteral', {}, path => path.addComment('leading', 'note', entry.line)),
      ],
    });
    const result = transform(
      entry.source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'comment', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    code = result.code;
    expect(code).toContain('note');
  });
  test('original control', async () => expect(await run(entry.source)).toBe(3));
  test('Babel comment control', async () => expect(await run(babel)).toBe(3));
  test('comment insertion preserves the statement', async () => expect(await run(code)).toBe(3));
});

for (const content of ['a\nb', 'a\rb', 'a\r\nb', 'a\u2028b', 'a\u2029b', 'a*/b']) {
  for (const line of [false, true]) {
    test(`restricted syntax survives comment ${JSON.stringify(content)}, line=${line}`, () => {
      for (const source of [
        'function read(){return 3}globalThis.result=read();',
        'try{throw 3}catch(error){globalThis.result=error}',
        'function* read(){yield 3}globalThis.result=read().next().value;',
      ]) {
        const result = transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'comments',
                plugins: [
                  defineNativePlugin({
                    name: 'comments',
                    visitors: [
                      defineVisitor('NumericLiteral', {}, path =>
                        path.addComment('leading', content, line),
                      ),
                    ],
                  }),
                ],
              },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error(result.reason);
        expect(run(result.code)).toBe(3);
      }
    });
  }
}

test('standalone leading comments retain line form', () => {
  const result = transform(
    ' \n  3;',
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'comments',
          plugins: [
            defineNativePlugin({
              name: 'comments',
              visitors: [
                defineVisitor('NumericLiteral', {}, path =>
                  path.addComment('leading', 'note', true),
                ),
              ],
            }),
          ],
        },
      ],
    }),
  );
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).toContain('//note\n3');
});

// A newline earlier in the file must not make a same-line restricted operand safe.
// Only whitespace up to the previous line terminator is inspected.
const prefix = `/*${'x'.repeat(8_000)}*/\n`;
const restrictedBoundaries = [
  {
    name: 'return shares a line after an earlier newline',
    source: `${prefix}function read(){\nreturn 3\n}globalThis.result=read();`,
    shape: 'return /*note*/3',
    value: 3,
  },
  {
    name: 'throw shares a line after an earlier newline',
    source: `${prefix}try{\nthrow 3\n}catch(error){globalThis.result=error}`,
    shape: 'throw /*note*/3',
    value: 3,
  },
  {
    name: 'yield shares a line after an earlier newline',
    source: `${prefix}function* read(){\nyield 3\n}globalThis.result=read().next().value;`,
    shape: 'yield /*note*/3',
    value: 3,
  },
  {
    name: 'tab does not make a return line comment safe',
    source: 'function read(){return\t3}globalThis.result=read();',
    shape: 'return\t/*note*/3',
    value: 3,
  },
  {
    name: 'tab does not make a throw line comment safe',
    source: 'try{throw\t3}catch(error){globalThis.result=error}',
    shape: 'throw\t/*note*/3',
    value: 3,
  },
  {
    name: 'nbsp does not make a return line comment safe',
    source: 'function read(){return\u00a03}globalThis.result=read();',
    shape: 'return\u00a0/*note*/3',
    value: 3,
  },
  {
    name: 'return operand is already on the next line',
    source: 'function read(){\nreturn\n  3\n}globalThis.result=read();',
    shape: '//note\n3',
    value: undefined,
  },
  {
    name: 'line separator already breaks return',
    source: 'function read(){return\u20283}globalThis.result=read();',
    shape: '//note\n3',
    value: undefined,
  },
  {
    name: 'carriage return already breaks return',
    source: 'function read(){return\r3}globalThis.result=read();',
    shape: '//note\n3',
    value: undefined,
  },
];
for (const entry of restrictedBoundaries) {
  test(entry.name, () => {
    const result = transform(
      entry.source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'comments',
            plugins: [
              defineNativePlugin({
                name: 'comments',
                visitors: [
                  defineVisitor('NumericLiteral', {}, path =>
                    path.addComment('leading', 'note', true),
                  ),
                ],
              }),
            ],
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toContain(entry.shape);
    expect(run(result.code)).toBe(entry.value);
  });
}

test('raw editor text stays verbatim around return', () => {
  const result = transform(
    'function read(){return 3}globalThis.result=read();',
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'raw',
          plugins: [
            defineNativePlugin({
              name: 'raw',
              visitors: [
                defineVisitor('NumericLiteral', {}, path => {
                  path.context.editor.appendLeft(path.start, '//note\n');
                }),
              ],
            }),
          ],
        },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error(result.reason);
  expect(result.code).toContain('return //note\n3');
  expect(run(result.code)).toBeUndefined();
});
