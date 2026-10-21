import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from './runtime';

describe('private helper fallback', () => {
  const require = createRequire(import.meta.url);
  beforeAll(() => {
    expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
  });

  function observe(code: string, module: boolean) {
    const child = spawnSync(
      process.execPath,
      [
        `--input-type=${module ? 'module' : 'commonjs'}`,
        '-e',
        `${code}\nconsole.log(JSON.stringify(globalThis.result));`,
      ],
      { cwd: process.cwd(), encoding: 'utf8', timeout: 10_000 },
    );
    expect(child.error).toBeUndefined();
    expect(child.signal).toBeNull();
    expect(child.status, child.stderr).toBe(0);
    return JSON.parse(child.stdout);
  }

  describe.each([false, true])('private read/write/call: ESM=%s', module => {
    const source = `${module ? 'export {};' : ''}
class C {
  #value = 1;
  #method(extra) { return this.#value + extra; }
  get #accessor() { return this.#value; }
  set #accessor(value) { this.#value = value; }
  run() {
    const before = this.#accessor;
    this.#accessor = 2;
    return [before, this.#value, this.#method(3)];
  }
}
globalThis.result = new C().run();`;
    const expected = [1, 2, 5];

    test.each(['inline', '7.0.0-alpha.1', '7.0.0-beta.0', '7.29.7', '8.0.0'])(
      'preserves accessor and call behavior with helpers=%s',
      version => {
        // LooseBase became available at beta.0. Unsupported runtime versions
        // must fall back to inline helpers while preserving the same behavior.
        const importsBase = version === '7.0.0-beta.0' || version === '7.29.7';

        const code = compile(
          source,
          {
            transforms: { privateMethods: true, classProperties: { loose: true } },
            helpers:
              version === 'inline'
                ? { mode: 'inline' }
                : { mode: 'runtime', moduleName: '@babel/runtime', version },
          },
          module ? 'input.mjs' : 'input.cjs',
        );
        expect(code).not.toMatch(/#(?:value|method|accessor)\b/);
        expect(code.includes('@babel/runtime/helpers/classPrivateFieldLooseBase')).toBe(
          importsBase,
        );
        expect(observe(code, module)).toEqual(expected);
      },
    );
  });

  describe.each([false, true])('private in: static=%s', isStatic => {
    describe.each([false, true])('ESM=%s', module => {
      const source = `${module ? 'export {};' : ''}
let effects = 0;
let coercions = 0;
class C {
  ${isStatic ? 'static ' : ''}#value = 1;
  static has(value) { return #value in value; }
}
const branded = ${isStatic ? 'C' : 'new C()'};
const inherited = ${isStatic ? 'class extends C {}' : 'Object.create(branded)'};
const values = [
  null, undefined, false, 0, NaN, 1n, 'text', Symbol(),
  branded, {}, inherited, () => {}, Object(3),
  { [Symbol.toPrimitive]() { coercions++; return 1; } },
];
const results = values.map(value => {
  try { return C.has((effects++, value)); }
  catch (error) { return error.name; }
});
globalThis.result = [results, effects, coercions];`;
      // Primitive operands throw; only C or its instance owns the brand.
      // Every RHS evaluates once and none is coerced to a property key.
      const expected = [
        [
          'TypeError',
          'TypeError',
          'TypeError',
          'TypeError',
          'TypeError',
          'TypeError',
          'TypeError',
          'TypeError',
          true,
          false,
          false,
          false,
          false,
          false,
        ],
        14,
        0,
      ];

      test.each(['inline', '7.20.4', '7.20.5', '7.29.7', '8.0.0'])(
        'preserves brand and RHS checks with helpers=%s',
        version => {
          const importsCheck = version === '7.20.5' || version === '7.29.7';

          const code = compile(
            source,
            {
              transforms: { privatePropertyInObject: true, classProperties: { loose: true } },
              helpers:
                version === 'inline'
                  ? { mode: 'inline' }
                  : { mode: 'runtime', moduleName: '@babel/runtime', version },
            },
            module ? 'input.mjs' : 'input.cjs',
          );
          expect(code).not.toMatch(/#value\b/);
          expect(code.includes('@babel/runtime/helpers/checkInRHS')).toBe(importsCheck);
          expect(observe(code, module)).toEqual(expected);
        },
      );
    });
  });
});
