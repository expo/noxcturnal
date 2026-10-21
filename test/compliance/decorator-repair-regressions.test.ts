import { createRequire } from 'node:module';

import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);
function observe(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', 'require', code)(context, require);
  return context.result;
}

const cases = [
  {
    name: 'backing storage does not capture enclosing private references',
    source: `function mark(target: any, key: any, descriptor: any) {}
class Outer {
  #_accessor_storage0 = 7;
  make() {
    class Inner {
      @mark
      accessor value = 3;
      read(value: Outer) {
        return value.#_accessor_storage0;
      }
    }
    return [new Inner().value, new Inner().read(this)];
  }
}
globalThis.result = new Outer().make();`,
    expected: [3, 7],
  },
  {
    name: 'literal computed accessors combine setter parameter metadata',
    source: `const calls = [];
function mark(t: any, k: any, d: any) {
  calls.push('method');
}
function parameter(t: any, k: any, i: number) {
  calls.push('parameter:' + i);
}
class C {
  @mark
  get ['value']() {
    return 3;
  }
  set ['value'](
    @parameter
    value: number,
  ) {}
}
globalThis.result = [new C().value, calls];`,
    expected: [3, ['parameter:0', 'method']],
  },
  {
    name: 'static accessor storage belongs to each evaluated original class',
    source: `const classes = [];
function replace(C: any): any {
  return class extends C {};
}
for (let value = 1; value <= 2; value++) {
  @replace
  class C {
    static accessor value = value;
  }
  classes.push(C);
}
const [A, B] = classes;
A.value = 7;
globalThis.result = [A.value, B.value];`,
    expected: [7, 2],
  },
  {
    name: 'nested heritage retains its enclosing private environment',

    source: `let read: any;
const calls = [];
function capture(fn: any) {
  read = fn;
  return (target: any, key: any) => {
    calls.push('member');
  };
}
function replace(C: any): any {
  calls.push('class');
  return class extends C {};
}
@replace
class C {
  #value = class {};
  @capture(
    (value: C) =>
      class extends value.#value {
        #value = 1;
      },
  )
  read() {
    return 3;
  }
}
globalThis.result = [typeof read(new C()), new C().read(), calls];`,
    expected: ['function', 3, ['member', 'class']],
  },
  {
    name: 'private member placement preserves constructor adapters and replacement',
    source: `let read: any;
const calls = [];
function capture(fn: any) {
  read = fn;
  return (target: any, key: any) => {
    calls.push('member');
  };
}
function parameter(target: any, key: any, index: number) {
  calls.push('parameter:' + index);
}
function replace(C: any): any {
  calls.push('class');
  return class extends C {
    extra = 7;
  };
}
@replace
class C {
  #value = 3;
  constructor(
    @parameter
    ...values: any[]
  ) {}
  @capture((value: C) => value.#value)
  read() {
    return this.#value;
  }
}
const c = new C();
globalThis.result = [read(c), c.read(), (c as any).extra, calls];`,
    expected: [3, 3, 7, ['member', 'parameter:0', 'class']],
  },
  {
    name: 'backing storage allocation avoids every existing private declaration',
    source: `function mark(target: any, key: any, descriptor: any) {}
class C {
  #_accessor_storage0 = 9;
  #_accessor_storage1() {
    return 8;
  }
  @mark
  accessor 'a-b' = 3;
  @mark
  accessor 12 = 4;
  read() {
    return [
      this['a-b'],
      this[12],
      this.#_accessor_storage0,
      this.#_accessor_storage1(),
    ];
  }
}
globalThis.result = new C().read();`,
    expected: [3, 4, 9, 8],
  },
];
for (const entry of cases) {
  describe(entry.name, () => {
    for (const classes of [false, true]) {
      for (const mode of ['inline', 'runtime'] as const) {
        test(`classes=${classes}, ${mode}`, () => {
          const code = compile(
            entry.source,
            {
              typescript: 'strip',
              transforms: {
                legacyDecorators: true,
                classes,
                ...(classes ? { classProperties: { loose: false }, privateMethods: true } : {}),
              },
              helpers: { mode, version: '7.29.7' },
            },
            'input.ts',
          );
          expect(code).not.toMatch(/@(replace|capture|parameter|mark)|\baccessor\s/);
          if (classes) expect(code).not.toMatch(/class\s+C\b/);
          expect(observe(code)).toEqual(entry.expected);
        });
      }
    }
  });
}

// A dynamic key can denote different properties at each evaluation. Keep its
// independent getter and setter callbacks.
const dynamicSource = `const calls = [];
const first = Symbol('first'),
  second = Symbol('second');
let key = first;
function mark(t: any, k: any, d: any) {
  calls.push('method:' + k.description);
}
function parameter(t: any, k: any, i: number) {
  calls.push('parameter:' + k.description);
}
class C {
  @mark
  get [key](): any {
    return 3;
  }
  [(key = second)]() {}
  set [key](
    @parameter
    value: number,
  ) {}
}
globalThis.result = calls;`;

for (const mode of ['inline', 'runtime'] as const) {
  test(`dynamic accessor keys keep separate callbacks, ${mode}`, () => {
    const code = compile(
      dynamicSource,
      {
        typescript: 'strip',
        transforms: { legacyDecorators: true },
        helpers: { mode, version: '7.29.7' },
      },
      'input.ts',
    );
    expect(code).not.toMatch(/@mark|@parameter/);
    expect(observe(code)).toEqual(['method:first', 'parameter:second']);
  });
}
