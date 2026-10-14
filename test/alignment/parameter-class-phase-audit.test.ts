import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';

const require = createRequire(import.meta.url);
const source = `class Base {}
class Child extends Base {
  constructor(value = () => this) {
    super();
    this.matches = value() === this;
  }
}
globalThis.result = new Child().matches;`;

function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

describe.each(['inline', 'runtime'] as const)('parameters before classes with %s helpers', mode => {
  let code: string;
  let babel: string;
  beforeAll(() => {
    const helpers = { mode, version: '7.29.7' };
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({
        phases: [
          { name: 'parameters', native: { transforms: { parameters: true }, helpers } },
          { name: 'classes', native: { transforms: { classes: true }, helpers } },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    code = result.code;
    babel = source;
    for (const stage of ['parameters', 'classes']) {
      const reference = transformSync(babel, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [
          require(`@babel/plugin-transform-${stage}`),
          ...(mode === 'runtime'
            ? [
                [
                  require('@babel/plugin-transform-runtime'),
                  {
                    version: '7.29.7',
                    useESModules: false,
                  },
                ],
              ]
            : []),
        ],
      });
      expect(reference?.code).toBeTypeOf('string');
      babel = reference!.code!;
      if (stage === 'parameters') {
        expect(babel).toMatch(/constructor\s*\(\s*\)/);
        expect(babel).toContain('arguments.length');
      }
    }
    for (const output of [code, babel]) {
      expect(output).not.toMatch(/\bclass\s+(?:Base|Child)\b/);
      expect(output).not.toMatch(/\(\s*value\s*=/);
      expect(output).toContain('arguments.length');
      if (mode === 'runtime') {
        expect(output).toMatch(/require\(["']@babel\/runtime\/helpers\//);
      } else {
        expect(output).not.toContain('@babel/runtime');
        expect(output).toContain('Reflect.construct');
      }
    }
  });
  test('native receiver control', () => {
    expect(run(source)).toBe(true);
  });
  test('Babel separate passes preserve the initialized receiver', () => {
    expect(run(babel)).toBe(true);
  });
  test.fails('Noxcturnal phases preserve the initialized receiver', () => {
    expect(run(code)).toBe(true);
  });
});
