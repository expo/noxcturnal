import { transformSync, type NodePath } from '@babel/core';
import { expect, test } from 'vitest';
import { defineNativePlugin, defineNativePipeline, defineVisitor, transform } from '../../index';
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const computed of [false, true])
  test(`proto property rename, computed=${computed}`, () => {
    const source = `const __proto__={value:3};const object=${computed ? "{['__proto__']:__proto__}" : '{__proto__}'};globalThis.result=[Object.hasOwn(object,'__proto__'),Object.getPrototypeOf(object)===Object.prototype,object.value??null];`;
    expect(run(source)).toEqual([true, true, null]);
    const reference = transformSync(source, {
      babelrc: false,
      configFile: false,
      plugins: [
        () => ({
          visitor: {
            Program(path: NodePath) {
              path.scope.rename('__proto__', 'renamed');
            },
          },
        }),
      ],
    })!.code!;
    const plugin = defineNativePlugin({
      name: 'rename-proto-baseline',
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          path.scope.rename('__proto__', 'renamed');
        }),
      ],
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('unexpected bailout');
    expect(result.code).toContain('renamed');
    const expected = computed ? [true, true, null] : [false, false, 3];
    expect(run(reference)).toEqual(expected);
    expect(run(result.code)).toEqual(expected);
  });
