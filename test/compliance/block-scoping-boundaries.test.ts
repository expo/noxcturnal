import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);
const cases: (readonly [string, string])[] = [
  [
    'multiple external exit targets',
    `
    const reads=[]; outer: for(var pass=0;pass<3;pass++) {
      stop: { for(let i=0;i<3;i++) { reads.push(()=>[pass,i]);
        if(pass===0) continue outer;
        if(pass===1) break stop;
        break outer;
      }}
    } globalThis.result=reads.map(read=>read());`,
  ],
  [
    'loop body label remains in the extracted function',
    `
    const reads=[];for(let i=0;i<2;i++) inside:{reads.push(()=>i);break inside;}
    globalThis.result=reads.map(read=>read());`,
  ],
  [
    'internal labels remain inside the helper',
    `
    const reads=[]; outer: for(let i=0;i<2;i++) {
      reads.push(()=>i); internal: { break internal; }
      inner: for(var j=0;j<2;j++){ if(j===0) continue inner; break inner; }
      continue outer;
    } globalThis.result=reads.map(read=>read());`,
  ],
  [
    'switch breaks and external continue',
    `
    const reads=[]; outer: for(var pass=0;pass<2;pass++) {
      for(let i=0;i<2;i++){ reads.push(()=>i); switch(i){case 0: break;}
        if(i===1) continue outer;
      }
    } globalThis.result=reads.map(read=>read());`,
  ],
  [
    'nested captures redispatch exits through both helpers',
    `
    const reads=[]; outer: for(let i=0;i<3;i++) {
      reads.push(()=>i); for(let j=0;j<2;j++) {
        reads.push(()=>[i,j]); if(i<2) continue outer; break outer;
      }
    } globalThis.result=reads.map(read=>read());`,
  ],
  [
    'finally can replace a labeled exit',
    `
    const reads=[]; outer: for(let i=0;i<3;i++) {
      reads.push(()=>i); try{break outer;}finally{if(i<2)continue outer;}
    } globalThis.result=reads.map(read=>read());`,
  ],
  [
    'outer readonly private name remains visible in a nested class',
    `
    class Outer { #value(){} run(){const self=this;return new class {
      run(){try{self.#value=3;}catch(error){return error.name;}}
    }().run();}} globalThis.result=new Outer().run();`,
  ],
  [
    'inner writable private name shadows outer readonly name',
    `
    class Outer { #value(){} run(){return new class {
      #value=1; run(){this.#value=3;return this.#value;}
    }().run();}} globalThis.result=new Outer().run();`,
  ],
  [
    'heritage resolves an outer readonly name despite inner writable shadow',
    `
    class Outer { #value(){} run(){try {class Inner extends(this.#value=3,Object){#value=1;}}
      catch(error){return error.name;}}} globalThis.result=new Outer().run();`,
  ],
  [
    'nested static blocks retain independent local and private environments',
    `
    class Outer { static #value=4; static { const reads=[];
      for(let i=0;i<2;i++){class Inner {static #inner=8; static {
        for(let j=0;j<2;j++) reads.push(()=>[i,j,Outer.#value,Inner.#inner]);
      }}} this.result=reads.map(read=>read());}}
    globalThis.result=Outer.result;`,
  ],
];
for (const [name, header] of [
  ['for-in', 'for(let i in {a:1,b:2})'],
  ['for-of', 'for(let i of [0,1])'],
  ['while', 'while(pass++<2)'],
  ['do-while', 'do'],
] as const) {
  // These forms exercise body-local captures as well as captured loop headers.
  const source = `const reads=[];var pass=0;outer: inner: ${header} {
    let value=pass; reads.push(()=>value);continue outer;
  } ${name === 'do-while' ? 'while(++pass<2);' : ''} globalThis.result=reads.map(read=>read());`;
  cases.push([`${name} ancestor label chain`, source]);
}

function observe(code: string, bindings: Record<string, unknown> = {}) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', 'require', ...Object.keys(bindings), code)(
    context,
    require,
    ...Object.values(bindings),
  );
  return context.result;
}

describe.each(['inline', 'runtime'] as const)('block scoping boundaries, %s', mode => {
  test.each(cases)('%s', (_name, source) => {
    const expected = observe(source);
    const code = compile(source, { transforms: { blockScoping: true }, helpers: { mode } });
    expect(code).not.toMatch(/\b(?:let|const)\b/);
    expect(observe(code)).toEqual(expected);
  });
  test('generator record identity binding preserves an unresolved external name', () => {
    const source = `function* run(){for(let i=0;i<2;i++){
      try{yield ()=>[i,_loopRecord];}finally{i++;yield ()=>[i,_loopRecord];}
    }}globalThis.result=[...run()].map(read=>read());`;
    const bindings = { _loopRecord: 'external' };
    expect(
      observe(compile(source, { transforms: { blockScoping: true }, helpers: { mode } }), bindings),
    ).toEqual(observe(source, bindings));
  });
  test('all generated loop names preserve unresolved external references', () => {
    const source = `const reads=[];for(let i=0;i<2;i++)reads.push(()=>i);
      globalThis.result=[reads.map(read=>read()),_loop,_loopResult,_loopRecord];`;
    const bindings = { _loop: 1, _loopResult: 2, _loopRecord: 3 };
    expect(
      observe(compile(source, { transforms: { blockScoping: true }, helpers: { mode } }), bindings),
    ).toEqual(observe(source, bindings));
  });
});

for (const asyncGenerator of [false, true]) {
  test.each(['try { yield "cleanup"; } finally {}', 'yield* ["cleanup"];'])(
    `nested/delegated cleanup preserves external completion, async=${asyncGenerator}: %s`,
    async cleanup => {
      const source = `const reads=[];${asyncGenerator ? 'async ' : ''}function* run(){
        for(let i=0;i<2;i++){reads.push(()=>i);try{yield i;}finally{i++;${asyncGenerator ? 'await 0;' : ''}${cleanup}}}
        throw new Error('must not continue');
      }globalThis.result={run,reads};`;
      const code = compile(source, { transforms: { blockScoping: true } });
      for (const program of [source, code]) {
        const { run, reads } = observe(program) as {
          run: () => Generator | AsyncGenerator;
          reads: (() => number)[];
        };
        const iterator = run();
        expect(await iterator.next()).toEqual({ value: 0, done: false });
        expect(await iterator.return(23)).toEqual({ value: 'cleanup', done: false });
        expect(await iterator.next()).toEqual({ value: 23, done: true });
        expect(reads.map(read => read())).toEqual([1]);
      }
    },
  );
  test(`internal return record survives yielding cleanup, async=${asyncGenerator}`, async () => {
    const source = `const reads=[];${asyncGenerator ? 'async ' : ''}function* run(){
      for(let i=0;i<2;i++){reads.push(()=>i);try{return 23;}finally{yield 'cleanup';i++;}}
    }globalThis.result={run,reads};`;
    const code = compile(source, { transforms: { blockScoping: true } });
    for (const program of [source, code]) {
      const { run, reads } = observe(program) as {
        run: () => Generator | AsyncGenerator;
        reads: (() => number)[];
      };
      const iterator = run();
      expect(await iterator.next()).toEqual({ value: 'cleanup', done: false });
      expect(await iterator.next()).toEqual({ value: 23, done: true });
      expect(reads.map(read => read())).toEqual([1]);
    }
  });

  test.each([
    'undefined',
    'null',
    '17',
    '"stop"',
    '({type:"normal",vars:[99]})',
    'new Proxy({}, {get(_target,key){if(key==="then")return;throw new Error("unexpected access");}})',
  ])(
    `yielding finally preserves arbitrary external return (%s), async=${asyncGenerator}`,
    async value => {
      const source = `const reads=[]; ${asyncGenerator ? 'async ' : ''}function* run(){
        for(let i=0;i<2;i++){reads.push(()=>i);try{yield i;}finally{i++;${asyncGenerator ? 'await 0;' : ''}yield 'cleanup';}}
        throw new Error('must not continue');
      } globalThis.result={run,reads,value:${value}};`;
      const code = compile(source, { transforms: { blockScoping: true } });
      expect(code).not.toMatch(/\b(?:let|const)\b/);
      for (const program of [source, code]) {
        const { run, reads, value } = observe(program) as {
          run: () => Generator | AsyncGenerator;
          reads: (() => number)[];
          value: unknown;
        };
        const iterator = run();
        expect(await iterator.next()).toEqual({ value: 0, done: false });
        expect(await iterator.return(value)).toEqual({ value: 'cleanup', done: false });
        const result = await iterator.next();
        expect(result.done).toBe(true);
        expect(result.value).toBe(value);
        expect(reads.map(read => read())).toEqual([1]);
      }
    },
  );
}
