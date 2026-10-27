import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';
import { defineNativePipeline, transform } from '../../js';

const require = createRequire(import.meta.url);

// These are explicit current lowering boundaries, including selected behavior
// that differs from JavaScript semantics. Specification tests remain separate.
function observe(code: string): { value: unknown } | { error: string } {
  const context: Record<string, unknown> = {};
  try {
    new Function('require', 'globalThis', code)(require, context);
    return { value: context.result };
  } catch (error) {
    return { error: (error as Error).name };
  }
}

describe('argument mutation and destructuring evaluation', () => {
  const cases = [
    {
      name: 'default initializer mutations affect later positional reads',
      transform: 'parameters',
      modes: ['inline'],
      source: `function read(first = arguments[1] = 99, second) {
  return [first, second, arguments[1]];
}
globalThis.result = read(undefined, 2);`,
      expected: { value: [99, 99, 99] },
    },
    {
      name: 'default initializer mutations affect the generated rest array',
      transform: 'parameters',
      modes: ['inline'],
      source: `function read(first = arguments[1] = 99, ...rest) {
  return [rest, arguments[1]];
}
globalThis.result = read(undefined, 2, 3);`,
      expected: { value: [[99, 3], 99] },
    },
    {
      name: 'object getter runs before the assignment target',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const events = [];
const output = {};
function target() {
  events.push('target');
  return output;
}
const source = {
  get value() {
    events.push('get');
    return 3;
  }
};
({
  value: target().value = 1
} = source);
globalThis.result = [output.value, events];`,
      expected: { value: [3, ['get', 'target']] },
    },
    {
      name: 'array fast path ignores an overridden iterator',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const array = [1, 2];
array[Symbol.iterator] = function* () {
  yield 9;
};
const [value] = array;
globalThis.result = value;`,
      expected: { value: 1 },
    },
    {
      name: 'iterator consumption completes before defaults execute',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const log = [];
const source = {
  [Symbol.iterator]() {
    return {
      next() {
        log.push('next');
        return {
          value: undefined,
          done: false
        };
      },
      return() {
        log.push('return');
        return {};
      }
    };
  }
};
const [a = (log.push('a'), 1), b = (log.push('b'), 2)] = source;
globalThis.result = log;`,
      expected: { value: ['next', 'next', 'return', 'a', 'b'] },
    },
  ] as const;
  for (const entry of cases) {
    test.each(entry.modes as readonly ('inline' | 'runtime')[])(
      entry.name + ', helpers=%s',
      mode => {
        const code = compile(entry.source, {
          transforms: { [entry.transform]: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(entry.source).toMatch(
          /(?:function read\(first\s*=|const \[|target\(\)\.value\s*=\s*1)/,
        );
        expect(code).not.toMatch(/(?:function read\(first\s*=|const \[|target\(\)\.value\s*=\s*1)/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('require(');
        expect(observe(code)).toEqual(entry.expected);
      },
    );
  }
});

describe('function reflection and inferred names', () => {
  const cases = [
    {
      name: 'lowered parameter arrows are constructable and have a prototype',
      transform: 'parameters',
      modes: ['inline'],
      source: `const read = (value = 1) => value;
let outcome;
try {
  new read();
  outcome = 'constructed';
} catch (e) {
  outcome = e.name;
}
globalThis.result = [outcome, Object.prototype.hasOwnProperty.call(read, 'prototype')];`,
      expected: { value: ['constructed', true] },
    },
    {
      name: 'anonymous parameter defaults have an empty inferred name',
      transform: 'parameters',
      modes: ['inline'],
      source: `function read(value = function () {}) {
  return value.name;
}
globalThis.result = read();`,
      expected: { value: '' },
    },
    {
      name: 'anonymous destructuring defaults have empty inferred names',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const {
  value = function () {}
} = {};
let other;
({
  other = function () {}
} = {});
globalThis.result = [value.name, other.name];`,
      expected: { value: ['', ''] },
    },
  ] as const;
  for (const entry of cases) {
    test.each(entry.modes as readonly ('inline' | 'runtime')[])(
      entry.name + ', helpers=%s',
      mode => {
        const code = compile(entry.source, {
          transforms: { [entry.transform]: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        const syntax =
          entry.transform === 'parameters' ? /=>|function read\(value\s*=/ : /const\s*\{\s*value/;
        expect(entry.source).toMatch(syntax);
        expect(code).not.toMatch(syntax);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('require(');
        expect(observe(code)).toEqual(entry.expected);
      },
    );
  }
});

describe('destructuring scope boundaries', () => {
  const cases = [
    {
      name: 'catch defaults observe the body binding temporal dead zone',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const value = 'outer';
let result;
try {
  throw {};
} catch ({
  item = value
}) {
  let value = 'body';
  result = item;
}
globalThis.result = result;`,
      expected: { error: 'ReferenceError' },
    },
    {
      name: 'catch default closures observe body lexical bindings',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const value = 'outer';
let result;
try {
  throw {};
} catch ({
  read = () => value
}) {
  let value = 'body';
  result = read();
}
globalThis.result = result;`,
      expected: { value: 'body' },
    },
    {
      name: 'reentrant parameter defaults share generated destructuring temporaries',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `let a, b;
function read(source, result = {
  a,
  b
} = source) {
  return [result === source, b];
}
const inner = {
  a: 10,
  b: 20
};
const outer = {
  get a() {
    read(inner);
    return 1;
  },
  b: 2
};
globalThis.result = read(outer);`,
      expected: {
        value: [false, 20],
      },
    },
    {
      name: 'reentrant field initializers share generated destructuring temporaries',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `let a, b;
let source;
class Value {
  result = {
    a,
    b
  } = source;
}
const inner = {
  a: 10,
  b: 20
};
const outer = {
  get a() {
    source = inner;
    new Value();
    return 1;
  },
  b: 2
};
source = outer;
const value = new Value();
globalThis.result = [value.result === outer, b];`,
      expected: {
        value: [false, 20],
      },
    },
  ] as const;
  for (const entry of cases) {
    test.each(entry.modes as readonly ('inline' | 'runtime')[])(
      entry.name + ', helpers=%s',
      mode => {
        const code = compile(entry.source, {
          transforms: { [entry.transform]: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(entry.source).toMatch(/catch\s*\(\s*\{|\{\s*a,\s*b\s*\}\s*=/);
        expect(code).not.toMatch(/catch\s*\(\s*\{|\{\s*a,\s*b\s*\}\s*=/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('require(');
        expect(observe(code)).toEqual(entry.expected);
      },
    );
  }
});

describe('parameter environment boundaries', () => {
  const cases = [
    {
      name: 'a default parameter named arguments shadows generated argument reads',
      transform: 'parameters',
      modes: ['inline'],
      source: `function read(arguments = 1) {
  return arguments;
}
globalThis.result = [read(), read(2)];`,
      expected: {
        error: 'ReferenceError',
      },
    },
    {
      name: 'lowered non-simple parameters expose arguments.callee',
      transform: 'parameters',
      modes: ['inline'],
      source: `function read(value = 1) {
  try {
    return arguments.callee === read;
  } catch (e) {
    return e.name;
  }
}
globalThis.result = read();`,
      expected: { value: true },
    },
    {
      name: 'direct eval in a lowered parameter arrow bails out for receiver access',
      transform: 'parameters',
      modes: ['inline'],
      source: `function make() {
  return (value = 1) => eval('this.value');
}
const read = make.call({
  value: 3
});
globalThis.result = read.call({
  value: 9
});`,
      expected: { value: 9 },
    },
    {
      name: 'direct eval in a lowered parameter arrow bails out for arguments access',
      transform: 'parameters',
      modes: ['inline'],
      source: `function make(value) {
  return (unused = 1) => eval('arguments[0]');
}
globalThis.result = make(3)(9);`,
      expected: { value: 9 },
    },
    {
      name: 'rest array creation invokes inherited numeric setters',
      transform: 'parameters',
      modes: ['inline'],
      source: `const original = Object.getOwnPropertyDescriptor(Array.prototype, '0');
let calls = 0;
try {
  Object.defineProperty(Array.prototype, '0', {
    configurable: true,
    set(value) {
      calls++;
    }
  });
  function read(...rest) {
    return [Object.hasOwn(rest, '0'), rest[0]];
  }
  const value = read(1);
  globalThis.result = [value, calls];
} finally {
  if (original) Object.defineProperty(Array.prototype, '0', original);else delete Array.prototype[0];
}`,
      expected: { value: [[false, undefined], 1] },
    },
    {
      name: 'rest array creation observes inherited nonwritable numeric properties',
      transform: 'parameters',
      modes: ['inline'],
      source: `const original = Object.getOwnPropertyDescriptor(Array.prototype, '0');
try {
  Object.defineProperty(Array.prototype, '0', {
    configurable: true,
    value: 99,
    writable: false
  });
  function read(...rest) {
    return [Object.hasOwn(rest, '0'), rest[0]];
  }
  try {
    globalThis.result = read(1);
  } catch (error) {
    globalThis.result = error.name;
  }
} finally {
  if (original) Object.defineProperty(Array.prototype, '0', original);else delete Array.prototype[0];
}`,
      expected: { value: [false, 99] },
    },
  ] as const;
  for (const entry of cases) {
    test.each(entry.modes as readonly ('inline' | 'runtime')[])(
      entry.name + ', helpers=%s',
      mode => {
        if (entry.name.startsWith('direct eval in a lowered parameter arrow')) {
          const result = transform(
            entry.source,
            'input.js',
            defineNativePipeline({
              phases: [
                {
                  name: 'parameters',
                  native: {
                    transforms: { parameters: true },
                    helpers: { mode, version: '7.29.7' },
                  },
                },
              ],
            }),
          );
          expect(result.status).toBe('bailout');
          if (result.status === 'bailout') {
            expect(result.reason).toContain('lowered-arrow-direct-eval');
            expect(result.source).toBe(entry.source);
          }
          return;
        }
        const code = compile(entry.source, {
          transforms: { [entry.transform]: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(entry.source).toMatch(/function read\((?:arguments|value)\s*=|\.\.\.rest|=>/);
        expect(code).not.toMatch(/function read\((?:arguments|value)\s*=|\.\.\.rest|=>/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('require(');
        expect(observe(code)).toEqual(entry.expected);
      },
    );
  }
});

describe('array iterator boundaries', () => {
  const cases = [
    {
      name: 'array elisions read iterator values before closing',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const events = [];
const iterable = {
  [Symbol.iterator]() {
    return {
      next() {
        return {
          done: false,
          get value() {
            events.push('value');
            return 1;
          }
        };
      },
      return() {
        events.push('return');
        return {};
      }
    };
  }
};
const [,] = iterable;
globalThis.result = events;`,
      expected: { value: ['value', 'return'] },
    },
    {
      name: 'array destructuring accepts a legacy iterator-only object',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const input = {
  '@@iterator'() {
    return {
      next() {
        return {
          value: 1,
          done: false
        };
      },
      return() {
        return {};
      }
    };
  }
};
try {
  const [value] = input;
  globalThis.result = value;
} catch (error) {
  globalThis.result = error.name;
}`,
      expected: { value: 1 },
    },
    {
      name: 'array destructuring accepts primitive iterator results',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const events = [];
const iterable = {
  [Symbol.iterator]() {
    return {
      next() {
        events.push('next');
        return 1;
      },
      return() {
        events.push('return');
        return {};
      }
    };
  }
};
try {
  const [value] = iterable;
  events.push(value === undefined ? 'accepted' : 'value');
} catch (error) {
  events.push(error.name);
}
globalThis.result = events;`,
      expected: { value: ['next', 'return', 'accepted'] },
    },
    {
      name: 'array destructuring retrieves iterator return twice',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const events = [];
const iterable = {
  [Symbol.iterator]() {
    return {
      next() {
        return {
          done: false,
          value: 1
        };
      },
      get return() {
        events.push('get:return');
        return function () {
          events.push('return');
          return {};
        };
      }
    };
  }
};
const [value] = iterable;
globalThis.result = [value, events];`,
      expected: { value: [1, ['get:return', 'get:return', 'return']] },
    },
  ] as const;
  for (const entry of cases) {
    test.each(entry.modes as readonly ('inline' | 'runtime')[])(
      entry.name + ', helpers=%s',
      mode => {
        const code = compile(entry.source, {
          transforms: { [entry.transform]: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(entry.source).toMatch(/const\s*\[/);
        expect(code).not.toMatch(/const\s*\[/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('require(');
        expect(observe(code)).toEqual(entry.expected);
      },
    );
  }
});

describe('iterator value-getter failure', () => {
  const cases = [
    {
      name: 'array destructuring closes after a value getter throws',
      transform: 'destructuring',
      modes: ['inline', 'runtime'],
      source: `const events = [];
const iterable = {
  [Symbol.iterator]() {
    return {
      next() {
        return {
          done: false,
          get value() {
            events.push('value');
            throw new Error('value');
          }
        };
      },
      return() {
        events.push('return');
        return {};
      }
    };
  }
};
try {
  const [value] = iterable;
} catch (error) {
  events.push(error.message);
}
globalThis.result = events;`,
      expected: { value: ['value', 'return', 'value'] },
    },
  ] as const;
  for (const entry of cases) {
    test.each(entry.modes as readonly ('inline' | 'runtime')[])(
      entry.name + ', helpers=%s',
      mode => {
        const code = compile(entry.source, {
          transforms: { [entry.transform]: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });
        expect(entry.source).toMatch(/const\s*\[/);
        expect(code).not.toMatch(/const\s*\[/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('require(');
        expect(observe(code)).toEqual(entry.expected);
      },
    );
  }
});
