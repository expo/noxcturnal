import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import parameters from '@babel/plugin-transform-parameters';

describe('parameter scope', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'arrow nested staticblock this context',
      expected: 3,
      source: `const outer={value:9,make(){return ((value=1)=>class Value{static value=3;static{this.result=this.value}})()}};globalThis.result=outer.make().result;`,
    },
    {
      name: 'arrow nested computed class key outer this',
      expected: 3,
      source: `const outer={key:'read',make(){return ((value=1)=>class Value{[this.key](){return 3}})()}};globalThis.result=new (outer.make())().read();`,
    },
    {
      name: 'arrow nested class heritage outer this',
      expected: 3,
      source: `const outer={Base:class{read(){return 3}},make(){return ((value=1)=>class Value extends this.Base{})()}};globalThis.result=new (outer.make())().read();`,
    },
    {
      name: 'arrow body lexical arguments binding',
      expected: 3,
      source: `function outer(){return ((value=1)=>{let arguments=3;return arguments})()}globalThis.result=outer(9);`,
    },
    {
      name: 'arrow catch arguments binding',
      expected: 3,
      source: `function outer(){return ((value=1)=>{try{throw 3}catch(arguments){return arguments}})()}globalThis.result=outer(9);`,
    },
    {
      name: 'arrow nested class instance field this',
      expected: 3,
      source: `const outer={value:9,make(){return ((value=1)=>class Value{value=3;field=this.value})()}};globalThis.result=new (outer.make())().field;`,
    },
    {
      name: 'arrow nested class static field this',
      expected: 3,
      source: `const outer={value:9,make(){return ((value=1)=>class Value{static value=3;static field=this.value})()}};globalThis.result=outer.make().field;`,
    },
    {
      name: 'arrow nested class field newtarget',
      expected: true,
      source: `function Factory(){return ((value=1)=>class Value{field=new.target})()}globalThis.result=new (new Factory())().field===undefined;`,
    },
  ];

  function run(code: string) {
    const context: Record<string, unknown> = {};
    try {
      new Function('require', 'globalThis', code)(require, context);
    } catch (error) {
      return { error: (error as Error).name };
    }
    return context.result;
  }

  // Only parameter lowering is selected; nested classes retain native syntax.
  // Compile separately from the runtime assertions.
  describe.each(cases)('$name', entry => {
    test('native control', () => {
      expect(run(entry.source)).toEqual(entry.expected);
    });
    describe.each(['inline', 'runtime'] as const)('%s', mode => {
      let referenceCode: string;
      let code: string;
      beforeAll(() => {
        const reference = transformSync(entry.source, {
          configFile: false,
          babelrc: false,
          sourceType: 'script',
          plugins: [[require('@babel/plugin-transform-parameters'), {}]],
        });
        referenceCode = reference!.code!;
        code = compile(entry.source, {
          transforms: { parameters: true },
          helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
        });

        const defaultArrow = /\(\s*value\s*=\s*1\s*\)\s*=>/;
        expect(entry.source).toMatch(defaultArrow);
        expect(code).not.toMatch(defaultArrow);
        expect(referenceCode).not.toMatch(defaultArrow);
      });
      test('Babel parameter reference', () => {
        expect(run(referenceCode)).toEqual(entry.expected);
      });
      test('parameter lowering preserves lexical environments', () => {
        expect(run(code)).toEqual(entry.expected);
      });
    });
  });
});

describe('parameter anchor', () => {
  const require = createRequire(import.meta.url);

  function observe(code: string): unknown {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }

  const cases = [
    {
      name: 'direct static-block statement',
      source: `class C { static value = 3; static { const read = (unused = 0) => this.value; this.result = read(); } } globalThis.result = C.result;`,
      expected: 3,
      babelExpected: undefined,
      fallback: false,
    },
    {
      name: 'concise-arrow body',
      source: `function read() { const make = () => ((unused = 0) => [this.value, arguments[0]]); return make()(); } globalThis.result = read.call({value:3},4);`,
      expected: [3, 4],
      babelExpected: [3, 4],
      fallback: true,
    },
    {
      name: 'computed field key and instance initializer',
      source: `const owner = {key:'field', make() { return class C { value=3; [((unused = 0) => this.key)()] = ((unused = 0) => this.value)(); }; }}; globalThis.result = new (owner.make())().field;`,
      expected: 3,
      babelExpected: 3,
      fallback: true,
    },
  ];

  describe.each(['inline', 'runtime'] as const)('parameter capture anchors, mode=%s', mode => {
    for (const entry of cases) {
      test(entry.name, () => {
        expect(observe(entry.source)).toEqual(entry.expected);
        const babel = transformSync(entry.source, {
          configFile: false,
          babelrc: false,
          plugins: [parameters],
        })!.code!;
        expect(observe(babel)).toEqual(entry.babelExpected);
        const code = compile(entry.source, { transforms: { parameters: true }, helpers: { mode } });
        expect(code).not.toMatch(/unused\s*=\s*0/);
        expect(code).toContain('_this');
        if (entry.fallback) expect(code).toContain('=>');
        expect(code).not.toContain('@babel/runtime');
        expect(observe(code)).toEqual(entry.expected);
      });
    }

    test('computed auto-accessor key and initializer before class lowering', () => {
      const prefix = `const owner={key:'field',make(){return class C { value=3;`;
      const suffix = `};}};const C=owner.make();const instance=new C();const initial=instance.field;instance.field=7;const descriptor=Object.getOwnPropertyDescriptor(C.prototype,'field');globalThis.result=[instance.field,initial,typeof descriptor.get,typeof descriptor.set,Object.hasOwn(instance,'field')];`;
      const source =
        prefix +
        `accessor [((unused = 0) => this.key)()] = ((unused = 0) => this.value)();` +
        suffix;
      const oracle =
        prefix +
        `#storage=this.value;get [owner.key](){return this.#storage;}set [owner.key](next){this.#storage=next;}` +
        suffix;
      expect(observe(oracle)).toEqual([7, 3, 'function', 'function', false]);
      const first = compile(source, { transforms: { parameters: true }, helpers: { mode } });
      expect(first).toContain('accessor');
      expect(first).not.toMatch(/unused\s*=\s*0/);
      expect(first).toContain('=>');
      const code = compile(first, { transforms: { classes: true }, helpers: { mode } });
      expect(code).not.toMatch(/\baccessor\b/);
      expect(first).not.toContain('@babel/runtime');
      if (mode === 'inline') expect(code).not.toContain('@babel/runtime');
      else expect(code).toContain('@babel/runtime/helpers/classPrivateFieldLooseKey');
      expect(observe(code)).toEqual([7, 3, 'function', 'function', false]);
    });

    test('static auto-accessor initializer before class lowering', () => {
      const source = `class C { static value=3; static accessor field=((unused = 0)=>this.value)(); }globalThis.result=C.field;`;
      const oracle = `class C { static value=3;static #storage=this.value;static get field(){return this.#storage;}static set field(next){this.#storage=next;} }globalThis.result=C.field;`;
      expect(observe(oracle)).toBe(3);
      const first = compile(source, { transforms: { parameters: true }, helpers: { mode } });
      expect(first).toContain('accessor');
      expect(first).not.toMatch(/unused\s*=\s*0/);
      expect(first).toContain('=>');
      const code = compile(first, { transforms: { classes: true }, helpers: { mode } });
      expect(code).not.toMatch(/\baccessor\b/);
      expect(first).not.toContain('@babel/runtime');
      if (mode === 'inline') expect(code).not.toContain('@babel/runtime');
      else expect(code).toContain('@babel/runtime/helpers/classPrivateFieldLooseKey');
      expect(observe(code)).toBe(3);
    });
  });
});

describe('parameter default capture placement', () => {
  const require = createRequire(import.meta.url);
  const modes = ['inline', 'runtime'] as const;
  const cases = [
    {
      name: 'function default arrow captures its invocation receiver',
      source: `function read(fn = (unused = 0) => this.value) { return fn(); }
globalThis.result = read.call({ value: 3 });`,
    },
    {
      name: 'function default arrow captures its invocation arguments',
      source: `function outer(seed) {
  function read(first, fn = (unused = 0) => arguments[0]) { return fn(); }
  return read(3);
}
globalThis.result = outer(9);`,
    },
    {
      name: 'method default arrow captures the method receiver',
      source: `const owner = {
  value: 3,
  read(fn = (unused = 0) => this.value) { return fn(); }
};
globalThis.result = owner.read();`,
    },
  ];

  function execute(code: string): unknown {
    const context: Record<string, unknown> = {};
    // Distinguish an incorrectly hoisted capture from the called receiver without
    // depending on the host process's global object.
    new Function('globalThis', code).call({ value: 9 }, context);
    return context.result;
  }

  function babel(source: string): string {
    return transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [require('@babel/plugin-transform-parameters')],
    })!.code!;
  }

  describe.each(cases)('$name', ({ source }) => {
    const observed = new Map<string, unknown>();
    beforeAll(() => {
      expect(execute(source)).toBe(3);
      expect(execute(babel(source))).toBe(3);
      for (const mode of modes) {
        const code = compile(source, {
          transforms: { parameters: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/unused\s*=\s*0|read\([^)]*fn\s*=/);
        // Parameters use local capture aliases, not Babel runtime helpers.
        expect(code).not.toContain('@babel/runtime/');
        observed.set(mode, execute(code));
      }
    });
    for (const mode of modes) {
      test(`${mode} initializes the capture in the owning activation`, () => {
        expect(observed.get(mode)).toBe(3);
      });
    }
  });

  test.each(modes)('%s retains a lexical arrow when its default uses super', mode => {
    const source = `const base = { read() { return this.value; } };
function make(obj = {
  __proto__: base,
  value: 3,
  read(fn = (unused = 0) => super.read()) { return fn(); }
}) { return obj; }
globalThis.result = make().read();`;
    const code = compile(source, {
      transforms: { parameters: true },
      helpers: { mode, version: '7.29.7' },
    });
    expect(code).not.toMatch(/unused\s*=\s*0|make\(obj\s*=/);
    expect(execute(source)).toBe(3);
    expect(execute(babel(source))).toBe(3);
    expect(execute(code)).toBe(3);
  });

  test.each(modes)('%s captures receivers and arguments correctly inside a function body', mode => {
    const sources = [
      `function read() { const fn = (unused = 0) => this.value; return fn(); }
globalThis.result = read.call({ value: 3 });`,
      `function outer(seed) {
  function read(first) { const fn = (unused = 0) => arguments[0]; return fn(); }
  return read(3);
}
globalThis.result = outer(9);`,
    ];
    for (const source of sources) {
      const code = compile(source, {
        transforms: { parameters: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/unused\s*=\s*0/);
      expect(execute(source)).toBe(3);
      expect(execute(babel(source))).toBe(3);
      expect(execute(code)).toBe(3);
    }
  });
});

describe('parameter switch case capture', () => {
  const require = createRequire(import.meta.url);
  const modes = ['inline', 'runtime'] as const;
  const cases = [
    {
      name: 'receiver',
      alias: '_this',
      source: `function read() {
  switch (3) {
    case ((unused = 0) => this.value)(): return 'yes';
    default: return 'no';
  }
}
globalThis.result = read.call({ value: 3 });`,
    },
    {
      name: 'arguments',
      alias: '_arguments',
      source: `function read(first) {
  switch (3) {
    case ((unused = 0) => arguments[0])(): return 'yes';
    default: return 'no';
  }
}
globalThis.result = read(3);`,
    },
  ];

  function execute(code: string): unknown {
    const context: Record<string, unknown> = {};
    new Function('globalThis', code)(context);
    return context.result;
  }

  function babel(source: string): string {
    return transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [require('@babel/plugin-transform-parameters')],
    })!.code!;
  }

  describe.each(cases)('$name capture in a switch case test', ({ source, alias }) => {
    const outcomes = new Map<string, { value?: unknown; error?: unknown }>();
    beforeAll(() => {
      expect(execute(source)).toBe('yes');
      expect(execute(babel(source))).toBe('yes');
      for (const mode of modes) {
        const code = compile(source, {
          transforms: { parameters: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/unused\s*=\s*0/);
        // Both configurations exercise local parameter capture; no helper is used.
        expect(code).not.toContain('@babel/runtime/');
        try {
          outcomes.set(mode, { value: execute(code) });
        } catch (error) {
          expect(error).toBeInstanceOf(ReferenceError);
          expect((error as Error).message).toBe(`${alias} is not defined`);
          outcomes.set(mode, { error });
        }
      }
    });
    for (const mode of modes) {
      test(`${mode} emits the capture declaration`, () => {
        expect(outcomes.get(mode)).toEqual({ value: 'yes' });
      });
    }
  });

  test.each(modes)('%s emits receiver and arguments captures for switch discriminants', mode => {
    const sources = [
      `function read() {
  switch (((unused = 0) => this.value)()) { case 3: return 'yes'; }
}
globalThis.result = read.call({ value: 3 });`,
      `function read(first) {
  switch (((unused = 0) => arguments[0])()) { case 3: return 'yes'; }
}
globalThis.result = read(3);`,
    ];
    for (const source of sources) {
      const code = compile(source, {
        transforms: { parameters: true },
        helpers: { mode, version: '7.29.7' },
      });
      expect(code).not.toMatch(/unused\s*=\s*0/);
      expect(execute(source)).toBe('yes');
      expect(execute(babel(source))).toBe('yes');
      expect(execute(code)).toBe('yes');
    }
  });
});

describe('parameter pattern regressions', () => {
  const require = createRequire(import.meta.url);
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }

  describe.each(['inline', 'runtime'] as const)('%s literal exclusions', mode => {
    test.each(['1e21', '1e-7', '0xff', '0xffn', '1000000000000000000000000000000000n'])(
      'normalizes %s with JavaScript property-key semantics',
      key => {
        for (const assignment of [false, true]) {
          const source = `${assignment ? 'let value, rest; (' : 'const '}{${key}:value,...rest}={${key}:1,other:2}${assignment ? ')' : ''};globalThis.result=[value,rest];`;
          expect(observe(source)).toEqual([1, { other: 2 }]);
          const code = compile(source, {
            transforms: { destructuring: true },
            helpers: { mode, version: '7.29.7' },
          });
          expect(code).not.toContain('...rest');
          expect(observe(code)).toEqual([1, { other: 2 }]);
        }
      },
    );
  });

  test('standalone object rest does not select unrelated outer default parameters', () => {
    const source = `function read(value = (() => { const {a,...rest}={a:1,b:2};return rest; })()) { return value; }globalThis.result=read();`;
    const code = compile(source, {
      transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
    });
    expect(code).toMatch(/function read\(value\s*=/);
    expect(code).not.toContain('...rest');
    expect(observe(code)).toEqual({ b: 2 });
  });

  describe.each(['function', 'method', 'class'] as const)('%s generator default boundary', kind => {
    test.each([false, true])('async=%s initializes before returning the iterator', async => {
      const body = `(value = (events.push('default'), 2)) { yield value; }`;
      const definition =
        kind === 'function'
          ? `${async ? 'async ' : ''}function* read${body}`
          : kind === 'method'
            ? `const object = { ${async ? 'async ' : ''}*read${body} }; const read=()=>object.read();`
            : `class Value { ${async ? 'async ' : ''}*read${body} } const read=()=>new Value().read();`;
      const source = `const events=[];${definition}read();events.push('returned');globalThis.result=events;`;
      expect(observe(source)).toEqual(['default', 'returned']);
      const code = compile(source, { transforms: { parameters: true } });
      expect(code).not.toMatch(/read\(value\s*=/);
      expect(observe(code)).toEqual(['default', 'returned']);
    });
  });
});
