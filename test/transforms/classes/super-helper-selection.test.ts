import { createRequire } from 'node:module';
import { expect, test } from 'vitest';
import { compile } from '../../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'object method owns its super reads',
    operation:
      'const own = {__proto__: {value: 7}, read() { return super.value }}; super.value = own.read(); return this.saved',
    get: false,
    set: true,
    expected: 7,
  },
  { name: 'no property access', operation: 'return 1', get: false, set: false, expected: 1 },
  {
    name: 'nested class computed key',
    operation: 'return (class { [super.value]() {} }).prototype[2].name',
    get: true,
    set: false,
    expected: '2',
  },
  { name: 'read', operation: 'return super.value', get: true, set: false, expected: 2 },
  { name: 'write', operation: 'return super.value = 4', get: false, set: true, expected: 4 },
  { name: 'compound', operation: 'return super.value += 4', get: true, set: true, expected: 6 },
  {
    name: 'logical assignment',
    operation: 'return super.value ||= 4',
    get: true,
    set: true,
    expected: 2,
  },
  { name: 'update', operation: 'return ++super.value', get: true, set: true, expected: 3 },
  {
    name: 'mixed reads and writes',
    operation: 'super.value = 4; return super.value',
    get: true,
    set: true,
    expected: 4,
  },
  {
    name: 'read inside a computed write key',
    operation: 'return super[super.key] = 4',
    get: true,
    set: true,
    expected: 4,
  },
  {
    name: 'destructuring target',
    operation: '[super.value] = [4]; return this.saved',
    get: true,
    set: true,
    expected: 4,
  },
  {
    name: 'nested write in RHS',
    operation: 'return super.value = (super.other = 4)',
    get: false,
    set: true,
    expected: 4,
  },
] as const;

for (const mode of ['inline', 'runtime'] as const) {
  test.each(cases)(`super helper selection: $name (${mode})`, entry => {
    const code = compile(
      `class Base {
        get value() { return this.saved ?? 2 }
        get key() { return 'value' }
        set value(value) { this.saved = value }
        set other(value) { this.saved = value }
      }
      class Child extends Base { run() { ${entry.operation} } }
      globalThis.result = new Child().run();`,
      {
        transforms: { classes: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      },
    );
    expect(code).not.toMatch(/\bclass\s+(Base|Child)\b/);
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    expect(context.result).toBe(entry.expected);
    for (const helper of ['get', 'set'] as const) {
      // Each inline bundle has a named factory for each Babel dependency.
      // Runtime mode must likewise import each helper only once.
      const pattern =
        mode === 'runtime'
          ? new RegExp(`@babel/runtime/helpers/${helper}["']`, 'g')
          : new RegExp(`\\b${helper}:\\s*function\\s*\\([^,()]+,[^,()]+\\)`, 'g');
      expect(code.match(pattern) ?? []).toHaveLength(entry[helper] ? 1 : 0);
    }
    if (entry.set) expect(code).not.toMatch(/\b_get2\b/);
    const accessor = ['compound', 'logical assignment', 'update', 'destructuring target'].includes(
      entry.name,
    );
    expect(/function _superReference\(/.test(code)).toBe(accessor);
  });
}
