import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from './runtime';

const modes = ['inline', 'runtime'] as const;
const cases = [
  {
    name: 'three labels retain continue targets and finally execution',
    source: `const events=[]; first: second: third: for (const value of [1,2,3]) {
      try { events.push(value); if(value===1) continue first; if(value===2) continue second; continue third; }
      finally { events.push('finally'); }
    } globalThis.result=events;`,
    expected: [1, 'finally', 2, 'finally', 3, 'finally'],
  },
  {
    name: 'continue to an outer chain closes only the inner iterator',
    source: `const events=[]; const values={ [Symbol.iterator](){ let i=0;return {
      next(){return {value:++i,done:i>2};},return(){events.push('outer:close');return {};}
    };}}; outer: middle: for(const value of values){ inner: innermost: for(const item of {
      [Symbol.iterator](){return {next(){return {value:1,done:false};},return(){events.push('inner:close');return {};}};}
    }){events.push(value);continue outer;}} globalThis.result=events;`,
    expected: [1, 'inner:close', 2, 'inner:close'],
  },
  {
    name: 'outer label break closes the iterator',
    source: `const events=[]; outer: inner: for(const value of { [Symbol.iterator](){return {
      next(){return {value:1,done:false};},return(){events.push('close');return {};}
    };}}){events.push(value);break outer;} globalThis.result=events;`,
    expected: [1, 'close'],
  },
  {
    name: 'assignment loop label chain retains destructuring and closure scope',
    source: `let value;const out=[];outer:inner:for([value] of [[1],[2]]){out.push(()=>value);continue outer;}
      globalThis.result=out.map(read=>read());`,
    expected: [2, 2],
  },
  {
    name: 'a Symbol parameter remains visible to direct eval',
    source: `function read(Symbol){const out=[];for(const value of [1,2])out.push([value,eval('Symbol')]);return out;}
      globalThis.result=read('parameter');`,
    expected: [
      [1, 'parameter'],
      [2, 'parameter'],
    ],
  },
  {
    name: 'a block Symbol binding retains shorthand keys and references',
    source: `const out=[];{const Symbol='block';for(const value of [1])out.push([value,{Symbol}.Symbol]);}
      globalThis.result=out;`,
    expected: [[1, 'block']],
  },
  {
    name: 'root Symbol bindings retain source references and shorthand keys',
    source: `const Symbol='root';const out=[];for(const value of [1,2])out.push([value,{Symbol}.Symbol]);globalThis.result=out;`,
    expected: [
      [1, 'root'],
      [2, 'root'],
    ],
  },
  {
    name: 'Symbol is read after the iterable expression and before iterator lookup',
    source: `const events=[];const iterable={get [Symbol.iterator](){events.push('iterator:get');return function(){events.push('iterator:call');return {next(){return {done:true};}};};}};
      function read(Symbol){for(const value of (events.push('rhs'),iterable)){};}
      read(null);globalThis.result=events;`,
    expected: ['rhs', 'iterator:get', 'iterator:call'],
  },
  {
    name: 'Symbol accessor names do not capture unresolved references',
    source: `function read(Symbol){for(const value of [1])return _iteratorSymbol;}globalThis.result=read(null);`,
    expected: 'external',
    bindings: { _iteratorSymbol: 'external' },
  },
  {
    name: 'every iterator temporary reserves unresolved external references',
    source: `const out=[];for(const value of [1])out.push(_iterator,_iteratorNext,_iteratorCall,_step,_iteratorReturnMethod,_iteratorReturn,_iteratorNormalCompletion,_didIteratorError,_iteratorError,_iteratorError2);globalThis.result=out;`,
    expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    bindings: {
      _iterator: 1,
      _iteratorNext: 2,
      _iteratorCall: 3,
      _step: 4,
      _iteratorReturnMethod: 5,
      _iteratorReturn: 6,
      _iteratorNormalCompletion: 7,
      _didIteratorError: 8,
      _iteratorError: 9,
      _iteratorError2: 10,
    },
  },
  {
    name: 'next own call getters are never read and receivers and arguments are preserved',
    source: `const events=[];let iterator;function next(){events.push([this===iterator,arguments.length]);return {done:true};}
      Object.defineProperty(next,'call',{get(){throw new Error('own call');}});
      iterator={next};for(const value of {[Symbol.iterator](){return iterator;}}){};globalThis.result=events;`,
    expected: [[true, 0]],
  },
  {
    name: 'noncallable next objects are rejected before reading their call property',
    source: `const events=[];const next={get call(){events.push('call:get');return ()=>({done:true});}};
      try{for(const value of {[Symbol.iterator](){return {next,return(){events.push('close');return {};}};}}){}}catch(error){events.push(error.name);}
      globalThis.result=events;`,
    expected: ['TypeError'],
  },
  {
    name: 'next proxies observe a direct call with the iterator receiver',
    source: `const events=[];let iterator;const next=new Proxy(function(){},{apply(target,receiver,args){events.push([receiver===iterator,args.length]);return {done:true};},get(){throw new Error('property read');}});
      iterator={next};for(const value of {[Symbol.iterator](){return iterator;}}){};globalThis.result=events;`,
    expected: [[true, 0]],
  },
  {
    name: 'return proxies are looked up once and observe the iterator receiver',
    source: `const events=[];let iterator;const close=new Proxy(function(){},{apply(target,receiver,args){events.push([receiver===iterator,args.length]);return {};},get(){throw new Error('property read');}});
      iterator={next(){return {done:false,value:1};},get return(){events.push('return:get');return close;}};
      for(const value of {[Symbol.iterator](){return iterator;}}){break;}globalThis.result=events;`,
    expected: ['return:get', [true, 0]],
  },
  {
    name: 'body errors win over a noncallable return with an own call getter',
    source: `const events=[];const close={get call(){events.push('call:get');return ()=>({});}};
      try{for(const value of {[Symbol.iterator](){return {next(){return {done:false,value:1};},get return(){events.push('return:get');return close;}};}}){throw new Error('body');}}catch(error){events.push(error.message);}
      globalThis.result=events;`,
    expected: ['return:get', 'body'],
  },
  {
    name: 'call dispatch is independent of a source Function binding',
    source: `function read(Function){const out=[];for(const value of [1,2])out.push(value);return out;}
      globalThis.result=read(null);`,
    expected: [1, 2],
  },
];

function run(source: string, bindings: Record<string, unknown> = {}): unknown {
  const context: Record<string, unknown> = {};
  new Function(...Object.keys(bindings), 'globalThis', source)(...Object.values(bindings), context);
  return context.result;
}

describe.each(modes)('%s helpers', mode => {
  describe.each(cases)('$name', ({ source, expected, bindings }) => {
    let code: string;
    beforeAll(() => {
      code = compile(source, { transforms: { forOf: true }, helpers: { mode } });
      expect(code).not.toMatch(/for\s*\([^;]*\bof\b/);
      expect(run(source, bindings)).toEqual(expected);
    });
    test('transformed execution', () => {
      expect(run(code, bindings)).toEqual(expected);
    });
  });

  test('isolated root Symbols preserve named exports and live updates', async () => {
    const code = compile(
      `export let Symbol=1, other=2;export {Symbol as alias};
      export function update(){Symbol++;}
      export function collect(){const out=[];for(const value of [1,2])out.push([value,Symbol]);return out;}`,
      { transforms: { forOf: true }, helpers: { mode } },
      'input.mjs',
    );
    const module = await importCode(code);
    expect(module.Symbol).toBe(1);
    expect(module.alias).toBe(1);
    expect(module.other).toBe(2);
    (module.update as () => void)();
    expect(module.Symbol).toBe(2);
    expect(module.alias).toBe(2);
    expect((module.collect as () => unknown)()).toEqual([
      [1, 2],
      [2, 2],
    ]);
  });
  test.each(['function', 'class'] as const)(
    'named default %s exports retain identity',
    async kind => {
      const declaration = kind === 'function' ? 'function Symbol() {}' : 'class Symbol {}';
      const code = compile(
        `export default ${declaration}; export {Symbol as alias};
      export function collect(){const out=[];for(const value of [1,2])out.push(value);return [out,Symbol];}`,
        { transforms: { forOf: true }, helpers: { mode } },
        'input.mjs',
      );
      const module = await importCode(code);
      expect(module.alias).toBe(module.default);
      expect((module.collect as () => unknown)()).toEqual([[1, 2], module.default]);
    },
  );
});
