import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import exponentiation from '@babel/plugin-transform-exponentiation-operator';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'computed key reassigns a parameter receiver',
    source: `const a={x:3}, b={x:4}; function f(obj) {
      return obj[(obj=b, 'x')] **= 2;
    } globalThis.result=[f(a),a.x,b.x];`,
    expected: [9, 9, 4],
  },
  {
    name: 'computed key captures a receiver before a nested assignment',
    source: `const a={x:3}, b={x:4}; let obj=a;
      globalThis.result=[obj[(obj=b, obj.x **= 2, 'x')] **= 2,a.x,b.x];`,
    expected: [9, 9, 16],
  },
  {
    name: 'recursive arrow defaults have independent temporaries',
    source: `const a={x:2},b={x:3};let obj=a,entered=false;
      const get=()=>obj;const key=()=>{if(!entered){entered=true;obj=b;f()}return 'x'};
      const f=(value=get()[key()] **= 2)=>value;
      globalThis.result=[f(),a.x,b.x];`,
    expected: [4, 4, 9],
  },
  {
    name: 'destructured defaults have independent temporaries',
    source: `const a={x:2},b={x:3};let obj=a,entered=false;
      const get=()=>obj;const key=()=>{if(!entered){entered=true;obj=b;f()}return 'x'};
      function f({value=get()[key()] **= 2}={}){return value}
      globalThis.result=[f(),a.x,b.x];`,
    expected: [4, 4, 9],
  },
  {
    name: 'nested function parameters do not end the outer initializer context',
    source: `const a={x:2},b={x:3};let obj=a,entered=false;
      const get=()=>obj;const key=()=>{if(!entered){entered=true;obj=b;f()}return 'x'};
      function f(value=((function nested(unused=0){}), get()[key()] **= 2)){return value}
      globalThis.result=[f(),a.x,b.x];`,
    expected: [4, 4, 9],
  },
  {
    name: 'nested class methods do not end the outer initializer context',
    source: `const a={x:2},b={x:3};let obj=a,entered=false;
      const get=()=>obj;const key=()=>{if(!entered){entered=true;obj=b;f()}return 'x'};
      function f(value=((class Nested { method(unused=0){} }), get()[key()] **= 2)){return value}
      globalThis.result=[f(),a.x,b.x];`,
    expected: [4, 4, 9],
  },
  {
    name: 'default wrapper retains earlier parameters and arguments',
    babelRejects: true,
    source: `function f(obj, value=obj[arguments[1] || 'x'] **= 2){return value}
      const obj={x:3};globalThis.result=[f(obj),obj.x];`,
    expected: [9, 9],
  },
  {
    name: 'default wrapper retains this and new.target',
    source: `const obj={x:3};function C(value=(new.target===C ? obj : this)['x'] **= 2){this.value=value}
      globalThis.result=[new C().value,obj.x,C.call({x:4})];`,
    expected: [9, 9, undefined],
  },
  {
    name: 'default super reference retains its home object',
    babelRejects: true,
    source: `class B {get x(){return this.stored} set x(v){this.stored=v}}
      class C extends B {stored=3;update(value=super['x'] **= 2){return value}}
      const c=new C();globalThis.result=[c.update(),c.stored];`,
    expected: [9, 9],
  },
  {
    name: 'static receiver reentry in a parameter retains the reference',
    source: `const a={x:2},b={x:3};let obj=a,entered=false;
      function get(){const saved=obj;if(!entered){entered=true;obj=b;f()}return saved}
      function f(value=get().x **= 2){return value}
      globalThis.result=[f(),a.x,b.x];`,
    expected: [4, 4, 9],
  },
  {
    name: 'computed reference preserves getter, RHS and setter order',
    source: `const log=[];const obj={get x(){log.push('get');return 3},set x(v){log.push(['set',v])}};
      function receiver(){log.push('receiver');return obj}function key(){log.push('key');return 'x'}
      globalThis.result=[receiver()[key()] **= (log.push('rhs'),2),log];`,
    expected: [9, ['receiver', 'key', 'get', 'rhs', ['set', 9]]],
  },
  {
    name: 'throwing key prevents property access and RHS',
    source: `const log=[];const obj={get x(){log.push('get');return 3}};
      try{obj[(()=>{log.push('key');throw new RangeError()})()] **= (log.push('rhs'),2)}catch(e){log.push(e.name)}
      globalThis.result=log;`,
    expected: ['key', 'RangeError'],
  },
  {
    name: 'generator computed keys preserve suspension and the receiver',
    source: `const a={x:3},b={x:4};let obj=a;function* f(){return obj[yield 'key'] **= 2}
      const it=f();const first=it.next();obj=b;globalThis.result=[first,it.next('x'),a.x,b.x];`,
    expected: [{ value: 'key', done: false }, { value: 9, done: true }, 9, 4],
  },
];

function observe(source: string) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', source)(context);
  return context.result;
}

describe.each([false, true])('exponentiation references (compact=%s)', compact => {
  for (const { name, source, expected, babelRejects } of cases) {
    test(name, () => {
      expect(observe(source)).toEqual(expected);
      const babel = () =>
        transformSync(source, {
          configFile: false,
          babelrc: false,
          plugins: [exponentiation],
        })!.code!;
      // The pinned plugin crashes when a parameter assignment needs no memoized
      // receiver/key. Native execution still validates our supported input.
      if (babelRejects) expect(babel).toThrow("Cannot read properties of null (reading 'assign')");
      else expect(observe(babel())).toEqual(expected);
      const code = compile(source, { compact, transforms: { exponentiationOperator: true } });
      expect(code).not.toContain('**=');
      expect(code).toContain('Math.pow');
      expect(observe(code)).toEqual(expected);
    });
  }
});

test('private assignment default retains lexical private access under reentry', () => {
  const source = `class C {#x=2;get value(){return this.#x}
    update(other,value=other().#x **= 2){return value}}
    const a=new C(),b=new C();let entered=false;
    function get(){if(!entered){entered=true;a.update(()=>b)}return a}
    globalThis.result=[a.update(get),a.value,b.value];`;
  expect(observe(source)).toEqual([4, 4, 4]);
  const code = compile(source, { transforms: { exponentiationOperator: true } });
  expect(code).not.toContain('**=');
  expect(observe(code)).toEqual([4, 4, 4]);
});

test('RegExp property keys retain allocated identity during coercion', () => {
  const source = `const seen=[];
    RegExp.prototype[Symbol.toPrimitive]=function(){seen.push(this);return 'x'};
    const obj={x:3};obj[/x/] **= 2;
    globalThis.result=[seen.length,seen.every(v=>v===seen[0]),obj.x];`;
  const expected = [2, true, 9];
  expect(runInNewContext(source)).toEqual(expected);
  const babel = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [exponentiation],
  })!.code!;
  expect(runInNewContext(babel)).toEqual(expected);
  const code = compile(source, { transforms: { exponentiationOperator: true } });
  expect(code).not.toContain('**=');
  expect(runInNewContext(code)).toEqual(expected);
});

// Like Babel, immutable-binding analysis does not model assignments hidden in
// dynamic eval or writes through the script global object's property surface.
describe.each(['eval', 'global-property'] as const)('accepted %s mutation boundary', kind => {
  test('uses the same receiver strategy as Babel', () => {
    const source = `var first={x:3},second={x:4},receiver=first;
      function key(){${kind === 'eval' ? "eval('receiver=second')" : 'globalThis.receiver=second'};return 'x'}
      globalThis.result=[receiver[key()] **= 2,first.x,second.x];`;
    expect(runInNewContext(source)).toEqual([9, 9, 4]);
    const babel = transformSync(source, {
      sourceType: 'script',
      configFile: false,
      babelrc: false,
      plugins: [exponentiation],
    })!.code!;
    expect(runInNewContext(babel)).toEqual([16, 16, 4]);
    const code = compile(source, { transforms: { exponentiationOperator: true } });
    expect(code).not.toContain('**=');
    expect(runInNewContext(code)).toEqual([16, 16, 4]);
  });
});
