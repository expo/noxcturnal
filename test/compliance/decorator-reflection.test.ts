import { createRequire } from 'node:module';

import { describe, expect, test } from 'vitest';

import { compile } from './runtime';
const require = createRequire(import.meta.url);
function observe(code: string, hook: string) {
  const context: { result?: unknown } = {};
  let calls = 0;
  const reflection = Object.create(Reflect);
  if (hook === 'noncallable') reflection.decorate = 3;
  if (hook === 'delegate' || hook === 'throw')
    reflection.decorate = (
      _decorators: unknown,
      target: unknown,
      _key: unknown,
      descriptor: unknown,
    ) => {
      calls++;
      if (hook === 'throw') throw new Error('reflect hook');
      return descriptor ?? target;
    };
  try {
    new Function('globalThis', 'Reflect', 'require', code)(context, reflection, require);
    return { result: context.result, calls };
  } catch (error) {
    return { error: (error as Error).message, calls };
  }
}

for (const kind of ['class', 'method'])
  for (const hook of ['absent', 'noncallable', 'delegate', 'throw'])
    describe(`${kind}, Reflect.decorate=${hook}`, () => {
      const source = `const log = [];
function mark(...args) { log.push('decorator'); }
${kind === 'class' ? '@mark class C {}' : 'class C { @mark read() { return 3; } }'}
globalThis.result = log;`;
      const expected = { result: ['decorator'], calls: 0 };

      for (const mode of ['inline', 'runtime'] as const)
        test(`applies decorators without invoking the reflection hook, ${mode}`, () => {
          const code = compile(
            source,
            { transforms: { legacyDecorators: true }, helpers: { mode, version: '7.29.7' } },
            'input.js',
          );
          expect(code).not.toContain('@mark');
          expect(code).not.toContain('@babel/runtime');
          expect(observe(code, hook)).toEqual(expected);
        });
    });
