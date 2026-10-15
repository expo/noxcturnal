import { transformSync } from '@babel/core';
import parameters from '@babel/plugin-transform-parameters';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

function observe(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
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
      prefix + `accessor [((unused = 0) => this.key)()] = ((unused = 0) => this.value)();` + suffix;
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
    expect(first + code).not.toContain('@babel/runtime');
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
    expect(first + code).not.toContain('@babel/runtime');
    expect(observe(code)).toBe(3);
  });
});
