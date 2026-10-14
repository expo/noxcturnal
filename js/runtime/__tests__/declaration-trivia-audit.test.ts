import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  NativeTransformError,
  transform,
} from '../../index';

const cases = [
  { name: 'LF', separator: '\n', fails: false },
  { name: 'CR', separator: '\r', fails: false },
  { name: 'line separator', separator: '\u2028', fails: true },
  { name: 'paragraph separator', separator: '\u2029', fails: true },
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
    let output: string | undefined;
    try {
      const result = transform(
        source,
        'input.mjs',
        defineNativePipeline({ phases: [{ name: 'name', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      output = result.code;
    } catch (error) {
      expect(error).toBeInstanceOf(NativeTransformError);
      expect((error as Error).message).toMatch(
        /withDeclarationName only supports anonymous function and class declarations with native metadata/,
      );
    }
    if (output !== undefined) {
      expect(output).toContain('* Named');
      actual = await run(output);
    }
  });
  test('native module accepts the line-comment terminator', async () =>
    expect(await run(source)).toBe(3));
  (entry.fails ? test.fails : test)('declaration naming accepts the same valid header', () =>
    expect(actual).toBe(3),
  );
});

describe.each([
  {
    name: 'NBSP before generator',
    source: 'export default \u00a0function*(){return 3}',
    fails: true,
  },
  {
    name: 'BOM before generator',
    source: 'export default \ufefffunction*(){return 3}',
    fails: true,
  },
  {
    name: 'EM SPACE in async generator header',
    source: 'export default async\u2003function*(){return 3}',
    fails: true,
  },
  {
    name: 'ASCII space in async generator header',
    source: 'export default async function*(){return 3}',
    fails: false,
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
    try {
      const result = transform(
        entry.source,
        'input.mjs',
        defineNativePipeline({ phases: [{ name: 'name', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      named = result.code;
    } catch (error) {
      expect(error).toBeInstanceOf(NativeTransformError);
      expect((error as Error).message).toMatch(
        /withDeclarationName only supports anonymous function and class declarations with native metadata/,
      );
    }
    if (named !== undefined) {
      expect(named).toContain('* Named');
      actual = await value(named);
    }
  });
  async function value(code: string) {
    const module = await import(
      `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    );
    return (await module.default().next()).value;
  }
  test('native module accepts Unicode whitespace', async () =>
    expect(await value(entry.source)).toBe(3));
  (entry.fails ? test.fails : test)('declaration naming locates the function keyword', () => {
    expect(actual).toBe(3);
  });
});
