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
  (entry.line && entry.name !== 'await line comment' ? test.fails : test)(
    'comment insertion preserves the statement',
    async () => expect(await run(code)).toBe(3),
  );
});
