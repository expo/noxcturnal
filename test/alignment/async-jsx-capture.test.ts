import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
async function execute(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return await context.result;
}
for (const tag of ['this', 'this.Component', 'this.ui.Component'])
  for (const jsx of ['preserve', 'classic'] as const) {
    test.each(['inline', 'runtime'] as const)(`${tag}, JSX=${jsx}, %s`, async mode => {
      const element = `<${tag} />`;
      const source = `const React = {createElement: tag => tag};
const receiver = {Component: 'component', ui: {Component: 'nested'}};
function make() { return (async () => ${element})(); }
globalThis.result = make.call(receiver).then(tag => tag === ${tag.replace('this', 'receiver')});`;
      // JSX has no native parser oracle; this explicit factory call checks receiver semantics.
      expect(await execute(source.replace(element, `React.createElement(${tag})`))).toBe(true);
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [
          require('@babel/plugin-transform-react-jsx'),
          require('@babel/plugin-transform-async-to-generator'),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  { version: '7.29.7', useESModules: false },
                ],
              ]
            : []),
        ],
      })!.code!;
      expect(await execute(reference)).toBe(true);
      let code = compile(
        source,
        {
          jsx,
          transforms: { asyncFunctions: true },
          helpers: { mode, version: '7.29.7' },
        },
        'input.jsx',
      );
      expect(code).not.toMatch(/async\s*\(/);
      expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
      if (jsx === 'preserve') {
        expect(code).toMatch(/<[^>]+\/>/);
        // The later pass lowers JSX only; it cannot repair the completed async transform.
        code = transformSync(code, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [require('@babel/plugin-transform-react-jsx')],
        })!.code!;
      }
      expect(code).not.toMatch(/<[^>]+\/>/);
      expect(await execute(code)).toBe(true);
    });
  }
