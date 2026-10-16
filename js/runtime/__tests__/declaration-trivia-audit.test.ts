import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  { name: 'LF', separator: '\n' },
  { name: 'CR', separator: '\r' },
  { name: 'line separator', separator: '\u2028' },
  { name: 'paragraph separator', separator: '\u2029' },
];
async function run(source: string) {
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  );
  return module.default().next().value;
}
describe.each(cases)('$name', entry => {
  const source = `export default function // note${entry.separator}*(){return 3}`;
  let actual: unknown;
  beforeAll(async () => {
    const plugin = defineNativePlugin({
      name: 'declaration-trivia',
      visitors: [
        defineVisitor(
          'FunctionDeclaration',
          { fields: ['declarationNameAnchor', 'declarationNamePrefix'] },
          path => {
            path.replaceWith(path.withDeclarationName('Named'));
          },
        ),
      ],
    });
    const result = transform(
      source,
      'input.mjs',
      defineNativePipeline({ phases: [{ name: 'name', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toContain('* Named');
    actual = await run(result.code);
  });
  test('native module accepts the line-comment terminator', async () =>
    expect(await run(source)).toBe(3));
  test('declaration naming accepts the same valid header', () => expect(actual).toBe(3));
});

describe.each([
  {
    name: 'NBSP before generator',
    source: 'export default \u00a0function*(){return 3}',
  },
  {
    name: 'BOM before generator',
    source: 'export default \ufefffunction*(){return 3}',
  },
  {
    name: 'EM SPACE in async generator header',
    source: 'export default async\u2003function*(){return 3}',
  },
  {
    name: 'ASCII space in async generator header',
    source: 'export default async function*(){return 3}',
  },
])('$name', entry => {
  let named: string | undefined;
  let actual: unknown;
  beforeAll(async () => {
    const plugin = defineNativePlugin({
      name: 'header-whitespace',
      visitors: [
        defineVisitor(
          'FunctionDeclaration',
          { fields: ['declarationNameAnchor', 'declarationNamePrefix'] },
          path => {
            path.replaceWith(path.withDeclarationName('Named'));
          },
        ),
      ],
    });
    const result = transform(
      entry.source,
      'input.mjs',
      defineNativePipeline({ phases: [{ name: 'name', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    named = result.code;
    expect(named).toContain('* Named');
    actual = await value(named);
  });
  async function value(code: string) {
    const module = await import(
      `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    );
    return (await module.default().next()).value;
  }
  test('native module accepts Unicode whitespace', async () =>
    expect(await value(entry.source)).toBe(3));
  test('declaration naming locates the function keyword', () => {
    expect(actual).toBe(3);
  });
});
