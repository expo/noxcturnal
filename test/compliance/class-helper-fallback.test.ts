import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);
beforeAll(() => {
  expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
});
const cases = [
  {
    name: 'ordinary inheritance and super accessors',
    source: `class Base {
  constructor(value) { this.x = value; }
  get value() { return this.x; }
  set value(value) { this.x = value; }
  method() { return this.x; }
  static tag() { return this.name; }
}
class Child extends Base {
  constructor(value) { super(value); }
  method() {
    super.value = super.value + 1;
    return super.method();
  }
}
const child = new Child(3);
globalThis.result = [
  child.method(), child.value, child instanceof Base,
  Object.getOwnPropertyDescriptor(Child.prototype, 'method').enumerable,
  Child.tag(),
];`,
    expected: [4, 4, true, false, 'Child'],
  },
  {
    name: 'native Error subclass',
    source: `class Custom extends Error {
  constructor(message) { super(message); this.extra = 2; }
  read() { return this.message + this.extra; }
}
const error = new Custom('x');
globalThis.result = [error instanceof Error, error instanceof Custom, error.read()];`,
    expected: [true, true, 'x2'],
  },
];

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

describe.each(cases)('$name', entry => {
  describe.each([false, true])('native ESM=%s', module => {
    const source = `${module ? 'export {};' : ''}${entry.source}`;

    test.each(['inline', '7.0.0-beta.0', '7.24.0', '7.29.7', '8.0.0'])(
      'executes class helpers with declared version=%s',
      version => {
        const code = compile(
          source,
          {
            transforms: { classes: true },
            helpers:
              version === 'inline'
                ? { mode: 'inline' }
                : { mode: 'runtime', moduleName: '@babel/runtime', version },
          },
          module ? 'input.mjs' : 'input.cjs',
        );
        expect(code).not.toMatch(/class (?:Base|Child|Custom)\b/);
        if (version === 'inline' || version === '8.0.0')
          expect(code).not.toContain('@babel/runtime/');
        else expect(code).toContain('@babel/runtime/helpers/');
        expect(observe(code, module)).toEqual(entry.expected);
      },
    );
  });
});
