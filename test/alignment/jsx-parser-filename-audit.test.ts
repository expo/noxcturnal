import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js/index';

const require = createRequire(import.meta.url);
const source = 'globalThis.result = <div />;';
function execute(code: string): string {
  const context: { result?: { __source: { fileName: string } } } = {};
  const React = {
    createElement(_tag: string, props: unknown) {
      return props;
    },
  };
  new Function('React', 'globalThis', code)(React, context);
  return context.result!.__source.fileName;
}
describe.each([
  {
    filename: '/project/input.jsx',
    emitted: '/project/input.jsx',
    parser: 'auto' as const,
    fails: false,
  },
  {
    filename: '/project/input.js',
    emitted: '/project/input.jsx',
    parser: 'jsx' as const,
    fails: true,
  },
  { filename: '/project.dir/input', emitted: '/project.jsx', parser: 'jsx' as const, fails: true },
])('$filename parser=$parser', entry => {
  let actual: string;
  beforeAll(() => {
    const babel = transformSync(source, {
      filename: entry.filename,
      babelrc: false,
      configFile: false,
      sourceType: 'script',
      plugins: [[require('@babel/plugin-transform-react-jsx-development'), { runtime: 'classic' }]],
    })!.code!;
    expect(execute(babel)).toBe(entry.filename);
    const result = transform(
      source,
      entry.filename,
      defineNativePipeline({
        phases: [{ name: 'jsx', native: { jsx: 'classic-development' } }],
      }),
      { parser: entry.parser },
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(result.code).not.toContain('<div');
    actual = execute(result.code);
    expect([entry.filename, entry.emitted]).toContain(actual);
  });
  test('reports the original filename in JSX development metadata', () => {
    expect(actual).toBe(entry.filename);
  });
});
