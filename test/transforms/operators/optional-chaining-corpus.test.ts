import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    transforms: {
      optionalChaining: {
        loose: false,
      },
    },
  },
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'member access (?.) > accesses property on object',
    source: `() => {
        const obj = { a: 1 };
        expect(obj?.a).toBe(1);
      }`,
    output: `() => {
  const obj = { a: 1 };
  expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(1);
};`,
  },
  {
    title: 'member access (?.) > returns undefined for null base',
    source: `() => {
        const obj = null;
        expect(obj?.a).toBe(undefined);
      }`,
    output: `() => {
  const obj = null;
  expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(undefined);
};`,
  },
  {
    title: 'member access (?.) > returns undefined for undefined base',
    source: `() => {
        const obj = undefined;
        expect(obj?.a).toBe(undefined);
      }`,
    output: `() => {
  const obj = undefined;
  expect(obj === null || obj === void 0 ? void 0 : obj.a).toBe(undefined);
};`,
  },
  {
    title: 'member access (?.) > accesses nested property',
    source: `() => {
        const obj = { a: { b: { c: 42 } } };
        expect(obj?.a?.b?.c).toBe(42);
      }`,
    output: `() => {
  var _obj$a;
  const obj = { a: { b: { c: 42 } } };
  expect(
    obj === null ||
      obj === void 0 ||
      (_obj$a = obj.a) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.b) === null ||
      _obj$a === void 0
      ? void 0
      : _obj$a.c,
  ).toBe(42);
};`,
  },
  {
    title: 'member access (?.) > short-circuits at first null',
    source: `() => {
        const obj = { a: null };
        expect(obj?.a?.b?.c).toBe(undefined);
      }`,
    output: `() => {
  var _obj$a;
  const obj = { a: null };
  expect(
    obj === null ||
      obj === void 0 ||
      (_obj$a = obj.a) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.b) === null ||
      _obj$a === void 0
      ? void 0
      : _obj$a.c,
  ).toBe(undefined);
};`,
  },
  {
    title: 'member access (?.) > short-circuits at first undefined property',
    source: `() => {
        const obj = { a: {} };
        expect(obj?.a?.b?.c).toBe(undefined);
      }`,
    output: `() => {
  var _obj$a;
  const obj = { a: {} };
  expect(
    obj === null ||
      obj === void 0 ||
      (_obj$a = obj.a) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.b) === null ||
      _obj$a === void 0
      ? void 0
      : _obj$a.c,
  ).toBe(undefined);
};`,
  },
  {
    title: 'member access (?.) > property exists but is falsy',
    source: `() => {
        const obj = { val: 0 };
        expect(obj?.val).toBe(0);
      }`,
    output: `() => {
  const obj = { val: 0 };
  expect(obj === null || obj === void 0 ? void 0 : obj.val).toBe(0);
};`,
  },
  {
    title: 'member access (?.) > preserves all falsy non-nullish values',
    source: `() => {
        expect({ v: 0 }?.v).toBe(0);
        expect({ v: '' }?.v).toBe('');
        expect({ v: false }?.v).toBe(false);
        expect({ v: NaN }?.v).not.toBe(NaN); // NaN !== NaN
        expect(typeof { v: NaN }?.v).toBe('number');
      }`,
    output: `() => {
  var _v, _v2, _v3, _v4, _v5;
  expect((_v = { v: 0 }) === null || _v === void 0 ? void 0 : _v.v).toBe(0);
  expect((_v2 = { v: '' }) === null || _v2 === void 0 ? void 0 : _v2.v).toBe('');
  expect((_v3 = { v: false }) === null || _v3 === void 0 ? void 0 : _v3.v).toBe(false);
  expect((_v4 = { v: NaN }) === null || _v4 === void 0 ? void 0 : _v4.v).not.toBe(NaN);
  expect(typeof ((_v5 = { v: NaN }) === null || _v5 === void 0 ? void 0 : _v5.v)).toBe('number');
};`,
  },
  {
    title: 'member access (?.) > works on non-plain objects',
    source: `() => {
        expect('hello'?.length).toBe(5);
        expect([1, 2, 3]?.length).toBe(3);
        expect((42)?.toFixed(2)).toBe('42.00');
      }`,
    output: `() => {
  var _hello, _ref, _;
  expect((_hello = 'hello') === null || _hello === void 0 ? void 0 : _hello.length).toBe(5);
  expect((_ref = [1, 2, 3]) === null || _ref === void 0 ? void 0 : _ref.length).toBe(3);
  expect((_ = 42) === null || _ === void 0 ? void 0 : _.toFixed(2)).toBe('42.00');
};`,
  },
  {
    title: 'computed member access (?.[]) > accesses computed property',
    source: `() => {
        const obj = { foo: 'bar' };
        const key = 'foo';
        expect(obj?.[key]).toBe('bar');
      }`,
    output: `() => {
  const obj = { foo: 'bar' };
  const key = 'foo';
  expect(obj === null || obj === void 0 ? void 0 : obj[key]).toBe('bar');
};`,
  },
  {
    title: 'computed member access (?.[]) > returns undefined for null base',
    source: `() => {
        const obj = null;
        expect(obj?.['foo']).toBe(undefined);
      }`,
    output: `() => {
  const obj = null;
  expect(obj === null || obj === void 0 ? void 0 : obj['foo']).toBe(undefined);
};`,
  },
  {
    title: 'computed member access (?.[]) > returns undefined for undefined base',
    source: `() => {
        const obj = undefined;
        expect(obj?.['foo']).toBe(undefined);
      }`,
    output: `() => {
  const obj = undefined;
  expect(obj === null || obj === void 0 ? void 0 : obj['foo']).toBe(undefined);
};`,
  },
  {
    title: 'computed member access (?.[]) > accesses array element',
    source: `() => {
        const arr = [10, 20, 30];
        expect(arr?.[1]).toBe(20);
      }`,
    output: `() => {
  const arr = [10, 20, 30];
  expect(arr === null || arr === void 0 ? void 0 : arr[1]).toBe(20);
};`,
  },
  {
    title: 'computed member access (?.[]) > returns undefined for null array',
    source: `() => {
        const arr = null;
        expect(arr?.[0]).toBe(undefined);
      }`,
    output: `() => {
  const arr = null;
  expect(arr === null || arr === void 0 ? void 0 : arr[0]).toBe(undefined);
};`,
  },
  {
    title: 'computed member access (?.[]) > accesses with symbol key',
    source: `() => {
        const sym = Symbol('key');
        const obj = { [sym]: 'value' };
        expect(obj?.[sym]).toBe('value');
      }`,
    output: `() => {
  const sym = Symbol('key');
  const obj = { [sym]: 'value' };
  expect(obj === null || obj === void 0 ? void 0 : obj[sym]).toBe('value');
};`,
  },
  {
    title:
      'computed member access (?.[]) > computed key expression is not evaluated when base is nullish',
    source: `() => {
        let evaluated = false;
        const key = () => {
          evaluated = true;
          return 'foo';
        };
        const obj = null;
        obj?.[key()];
        expect(evaluated).toBe(false);
      }`,
    output: `() => {
  let evaluated = false;
  const key = () => {
    evaluated = true;
    return 'foo';
  };
  const obj = null;
  obj === null || obj === void 0 ? void 0 : obj[key()];
  expect(evaluated).toBe(false);
};`,
  },
  {
    title:
      'computed member access (?.[]) > computed key expression evaluated once when base is non-nullish',
    source: `() => {
        let count = 0;
        const key = () => {
          count++;
          return 'foo';
        };
        const obj = { foo: 'bar' };
        expect(obj?.[key()]).toBe('bar');
        expect(count).toBe(1);
      }`,
    output: `() => {
  let count = 0;
  const key = () => {
    count++;
    return 'foo';
  };
  const obj = { foo: 'bar' };
  expect(obj === null || obj === void 0 ? void 0 : obj[key()]).toBe('bar');
  expect(count).toBe(1);
};`,
  },
  {
    title: 'optional call (?.()) > calls function',
    source: `() => {
        const fn = () => 42;
        expect(fn?.()).toBe(42);
      }`,
    output: `() => {
  const fn = () => 42;
  expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(42);
};`,
  },
  {
    title: 'optional call (?.()) > returns undefined for null function',
    source: `() => {
        const fn = null;
        expect(fn?.()).toBe(undefined);
      }`,
    output: `() => {
  const fn = null;
  expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(undefined);
};`,
  },
  {
    title: 'optional call (?.()) > returns undefined for undefined function',
    source: `() => {
        const fn = undefined;
        expect(fn?.()).toBe(undefined);
      }`,
    output: `() => {
  const fn = undefined;
  expect(fn === null || fn === void 0 ? void 0 : fn()).toBe(undefined);
};`,
  },
  {
    title: 'optional call (?.()) > passes arguments',
    source: `() => {
        const fn = (a, b) => a + b;
        expect(fn?.(2, 3)).toBe(5);
      }`,
    output: `() => {
  const fn = (a, b) => a + b;
  expect(fn === null || fn === void 0 ? void 0 : fn(2, 3)).toBe(5);
};`,
  },
  {
    title: 'optional call (?.()) > arguments not evaluated when function is nullish',
    source: `() => {
        let evaluated = false;
        const fn = null;
        fn?.((evaluated = true));
        expect(evaluated).toBe(false);
      }`,
    output: `() => {
  let evaluated = false;
  const fn = null;
  fn === null || fn === void 0 ? void 0 : fn((evaluated = true));
  expect(evaluated).toBe(false);
};`,
  },
  {
    title: 'optional call (?.()) > works with function stored in variable',
    source: `() => {
        const obj = { fn: (x) => x * 2 };
        expect(obj.fn?.(5)).toBe(10);
      }`,
    output: `() => {
  var _obj$fn;
  const obj = { fn: x => x * 2 };
  expect((_obj$fn = obj.fn) === null || _obj$fn === void 0 ? void 0 : _obj$fn.call(obj, 5)).toBe(
    10,
  );
};`,
  },
  {
    title: 'optional call (?.()) > returns undefined for missing method',
    source: `() => {
        const obj = {};
        expect(obj.fn?.()).toBe(undefined);
      }`,
    output: `() => {
  var _obj$fn;
  const obj = {};
  expect((_obj$fn = obj.fn) === null || _obj$fn === void 0 ? void 0 : _obj$fn.call(obj)).toBe(
    undefined,
  );
};`,
  },
  {
    title: 'method calls (?.method()) > calls method on object',
    source: `() => {
        const obj = {
          greet() {
            return 'hello';
          },
        };
        expect(obj?.greet()).toBe('hello');
      }`,
    output: `() => {
  const obj = {
    greet() {
      return 'hello';
    },
  };
  expect(obj === null || obj === void 0 ? void 0 : obj.greet()).toBe('hello');
};`,
  },
  {
    title: 'method calls (?.method()) > preserves this context',
    source: `() => {
        const obj = {
          name: 'test',
          getName() {
            return this.name;
          },
        };
        expect(obj?.getName()).toBe('test');
      }`,
    output: `() => {
  const obj = {
    name: 'test',
    getName() {
      return this.name;
    },
  };
  expect(obj === null || obj === void 0 ? void 0 : obj.getName()).toBe('test');
};`,
  },
  {
    title: 'method calls (?.method()) > returns undefined when object is null',
    source: `() => {
        const obj = null;
        expect(obj?.greet()).toBe(undefined);
      }`,
    output: `() => {
  const obj = null;
  expect(obj === null || obj === void 0 ? void 0 : obj.greet()).toBe(undefined);
};`,
  },
  {
    title: 'method calls (?.method()) > returns undefined when method is undefined',
    source: `() => {
        const obj = {};
        expect(obj?.greet?.()).toBe(undefined);
      }`,
    output: `() => {
  var _obj$greet;
  const obj = {};
  expect(
    obj === null || obj === void 0 || (_obj$greet = obj.greet) === null || _obj$greet === void 0
      ? void 0
      : _obj$greet.call(obj),
  ).toBe(undefined);
};`,
  },
  {
    title: 'method calls (?.method()) > chained method calls',
    source: `() => {
        const obj = {
          inner: {
            getValue() {
              return 42;
            },
          },
        };
        expect(obj?.inner?.getValue()).toBe(42);
      }`,
    output: `() => {
  var _obj$inner;
  const obj = {
    inner: {
      getValue() {
        return 42;
      },
    },
  };
  expect(
    obj === null || obj === void 0 || (_obj$inner = obj.inner) === null || _obj$inner === void 0
      ? void 0
      : _obj$inner.getValue(),
  ).toBe(42);
};`,
  },
  {
    title: 'method calls (?.method()) > method on prototype chain',
    source: `() => {
        class Base {
          hello() {
            return 'base';
          }
        }
        class Child extends Base {}
        const c = new Child();
        expect(c?.hello()).toBe('base');
      }`,
    output: `() => {
  class Base {
    hello() {
      return 'base';
    }
  }
  class Child extends Base {}
  const c = new Child();
  expect(c === null || c === void 0 ? void 0 : c.hello()).toBe('base');
};`,
  },
  {
    title: 'method calls (?.method()) > this context preserved in nested access',
    source: `() => {
        const obj = {
          x: 10,
          inner: {
            x: 20,
            getX() {
              return this.x;
            },
          },
        };
        expect(obj?.inner?.getX()).toBe(20);
      }`,
    output: `() => {
  var _obj$inner;
  const obj = {
    x: 10,
    inner: {
      x: 20,
      getX() {
        return this.x;
      },
    },
  };
  expect(
    obj === null || obj === void 0 || (_obj$inner = obj.inner) === null || _obj$inner === void 0
      ? void 0
      : _obj$inner.getX(),
  ).toBe(20);
};`,
  },
  {
    title: 'short-circuit evaluation > does not access further properties after null',
    source: `() => {
        let accessed = false;
        const handler = {
          get() {
            accessed = true;
            return {};
          },
        };
        const obj = null;
        obj?.foo;
        expect(accessed).toBe(false);
      }`,
    output: `() => {
  let accessed = false;
  const handler = {
    get() {
      accessed = true;
      return {};
    },
  };
  const obj = null;
  obj === null || obj === void 0 ? void 0 : obj.foo;
  expect(accessed).toBe(false);
};`,
  },
  {
    title: 'short-circuit evaluation > does not call methods after null',
    source: `() => {
        let called = false;
        const obj = null;
        obj?.method?.((called = true));
        expect(called).toBe(false);
      }`,
    output: `() => {
  var _obj$method;
  let called = false;
  const obj = null;
  obj === null || obj === void 0 || (_obj$method = obj.method) === null || _obj$method === void 0
    ? void 0
    : _obj$method.call(obj, (called = true));
  expect(called).toBe(false);
};`,
  },
  {
    title: 'short-circuit evaluation > entire chain short-circuits',
    source: `() => {
        let sideEffect = false;
        const obj = null;
        obj?.a.b.c.d.e?.f?.(() => {
          sideEffect = true;
        });
        expect(sideEffect).toBe(false);
      }`,
    output: `() => {
  var _obj$a$b$c$d$e, _obj$a$b$c$d$e$f;
  let sideEffect = false;
  const obj = null;
  obj === null ||
  obj === void 0 ||
  (_obj$a$b$c$d$e = obj.a.b.c.d.e) === null ||
  _obj$a$b$c$d$e === void 0 ||
  (_obj$a$b$c$d$e$f = _obj$a$b$c$d$e.f) === null ||
  _obj$a$b$c$d$e$f === void 0
    ? void 0
    : _obj$a$b$c$d$e$f.call(_obj$a$b$c$d$e, () => {
        sideEffect = true;
      });
  expect(sideEffect).toBe(false);
};`,
  },
  {
    title: 'short-circuit evaluation > short-circuits computed access after null',
    source: `() => {
        let keyEvaluated = false;
        const obj = null;
        obj?.[
          (() => {
            keyEvaluated = true;
            return 'key';
          })()
        ];
        expect(keyEvaluated).toBe(false);
      }`,
    output: `() => {
  let keyEvaluated = false;
  const obj = null;
  obj === null || obj === void 0
    ? void 0
    : obj[
        (() => {
          keyEvaluated = true;
          return 'key';
        })()
      ];
  expect(keyEvaluated).toBe(false);
};`,
  },
  {
    title: 'short-circuit evaluation > side effects in base are evaluated once',
    source: `() => {
        let count = 0;
        const getObj = () => {
          count++;
          return { a: 1 };
        };
        expect(getObj()?.a).toBe(1);
        expect(count).toBe(1);
      }`,
    output: `() => {
  var _getObj;
  let count = 0;
  const getObj = () => {
    count++;
    return { a: 1 };
  };
  expect((_getObj = getObj()) === null || _getObj === void 0 ? void 0 : _getObj.a).toBe(1);
  expect(count).toBe(1);
};`,
  },
  {
    title:
      'short-circuit evaluation > non-optional part after ?. still evaluates if base is present',
    source: `() => {
        let count = 0;
        const obj = {
          get a() {
            count++;
            return { b: 42 };
          },
        };
        expect(obj?.a.b).toBe(42);
        expect(count).toBe(1);
      }`,
    output: `() => {
  let count = 0;
  const obj = {
    get a() {
      count++;
      return { b: 42 };
    },
  };
  expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(42);
  expect(count).toBe(1);
};`,
  },
  {
    title: 'delete with optional chaining > deletes existing property',
    source: `() => {
        const obj = { a: 1 };
        expect(delete obj?.a).toBe(true);
        expect(obj.a).toBe(undefined);
      }`,
    output: `() => {
  const obj = { a: 1 };
  expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);
  expect(obj.a).toBe(undefined);
};`,
  },
  {
    title: 'delete with optional chaining > returns true for null base',
    source: `() => {
        const obj = null;
        expect(delete obj?.a).toBe(true);
      }`,
    output: `() => {
  const obj = null;
  expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);
};`,
  },
  {
    title: 'delete with optional chaining > returns true for undefined base',
    source: `() => {
        const obj = undefined;
        expect(delete obj?.a).toBe(true);
      }`,
    output: `() => {
  const obj = undefined;
  expect(obj === null || obj === void 0 ? true : delete obj.a).toBe(true);
};`,
  },
  {
    title: 'delete with optional chaining > deletes nested property',
    source: `() => {
        const obj = { a: { b: 1 } };
        expect(delete obj?.a?.b).toBe(true);
        expect(obj.a.b).toBe(undefined);
      }`,
    output: `() => {
  var _obj$a;
  const obj = { a: { b: 1 } };
  expect(
    obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
      ? true
      : delete _obj$a.b,
  ).toBe(true);
  expect(obj.a.b).toBe(undefined);
};`,
  },
  {
    title: 'delete with optional chaining > returns true for null in nested delete',
    source: `() => {
        const obj = { a: null };
        expect(delete obj?.a?.b).toBe(true);
      }`,
    output: `() => {
  var _obj$a;
  const obj = { a: null };
  expect(
    obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
      ? true
      : delete _obj$a.b,
  ).toBe(true);
};`,
  },
  {
    title: 'delete with optional chaining > deletes computed property',
    source: `() => {
        const obj = { foo: 'bar' };
        const key = 'foo';
        expect(delete obj?.[key]).toBe(true);
        expect(obj.foo).toBe(undefined);
      }`,
    output: `() => {
  const obj = { foo: 'bar' };
  const key = 'foo';
  expect(obj === null || obj === void 0 ? true : delete obj[key]).toBe(true);
  expect(obj.foo).toBe(undefined);
};`,
  },
  {
    title: 'in boolean context > if statement with optional chaining',
    source: `() => {
        const obj = null;
        let branch = 'none';
        if (obj?.truthy) {
          branch = 'if';
        } else {
          branch = 'else';
        }
        expect(branch).toBe('else');
      }`,
    output: `() => {
  const obj = null;
  let branch = 'none';
  if (obj === null || obj === void 0 ? void 0 : obj.truthy) {
    branch = 'if';
  } else {
    branch = 'else';
  }
  expect(branch).toBe('else');
};`,
  },
  {
    title: 'in boolean context > if with non-null object and truthy value',
    source: `() => {
        const obj = { flag: true };
        let branch = 'none';
        if (obj?.flag) {
          branch = 'if';
        }
        expect(branch).toBe('if');
      }`,
    output: `() => {
  const obj = { flag: true };
  let branch = 'none';
  if (obj === null || obj === void 0 ? void 0 : obj.flag) {
    branch = 'if';
  }
  expect(branch).toBe('if');
};`,
  },
  {
    title: 'in boolean context > if with non-null object and falsy value',
    source: `() => {
        const obj = { flag: 0 };
        let branch = 'none';
        if (obj?.flag) {
          branch = 'if';
        } else {
          branch = 'else';
        }
        expect(branch).toBe('else');
      }`,
    output: `() => {
  const obj = { flag: 0 };
  let branch = 'none';
  if (obj === null || obj === void 0 ? void 0 : obj.flag) {
    branch = 'if';
  } else {
    branch = 'else';
  }
  expect(branch).toBe('else');
};`,
  },
  {
    title: 'in boolean context > logical NOT with optional chaining',
    source: `() => {
        const obj = null;
        expect(!obj?.foo).toBe(true);
      }`,
    output: `() => {
  const obj = null;
  expect(!(obj === null || obj === void 0 ? void 0 : obj.foo)).toBe(true);
};`,
  },
  {
    title: 'in boolean context > logical NOT with existing value',
    source: `() => {
        const obj = { foo: 'bar' };
        expect(!obj?.foo).toBe(false);
      }`,
    output: `() => {
  const obj = { foo: 'bar' };
  expect(!(obj === null || obj === void 0 ? void 0 : obj.foo)).toBe(false);
};`,
  },
  {
    title: 'in boolean context > double NOT coerces to boolean',
    source: `() => {
        expect(!!null?.foo).toBe(false);
        expect(!!{ foo: 1 }?.foo).toBe(true);
        expect(!!{ foo: 0 }?.foo).toBe(false);
      }`,
    output: `() => {
  var _ref, _foo, _foo2;
  expect(!!((_ref = null) === null || _ref === void 0 ? void 0 : _ref.foo)).toBe(false);
  expect(!!((_foo = { foo: 1 }) === null || _foo === void 0 ? void 0 : _foo.foo)).toBe(true);
  expect(!!((_foo2 = { foo: 0 }) === null || _foo2 === void 0 ? void 0 : _foo2.foo)).toBe(false);
};`,
  },
  {
    title: 'in boolean context > ternary with optional chaining',
    source: `() => {
        const obj = null;
        expect(obj?.val ? 'yes' : 'no').toBe('no');
      }`,
    output: `() => {
  const obj = null;
  expect((obj === null || obj === void 0 ? void 0 : obj.val) ? 'yes' : 'no').toBe('no');
};`,
  },
  {
    title: 'in boolean context > while loop with optional chaining',
    source: `() => {
        const items = [{ next: { next: { next: null } } }];
        let node = items[0];
        let count = 0;
        while (node?.next) {
          node = node.next;
          count++;
        }
        expect(count).toBe(2);
      }`,
    output: `() => {
  const items = [{ next: { next: { next: null } } }];
  let node = items[0];
  let count = 0;
  while (node === null || node === void 0 ? void 0 : node.next) {
    node = node.next;
    count++;
  }
  expect(count).toBe(2);
};`,
  },
  {
    title: 'with logical operators > ?. with && operator',
    source: `() => {
        const obj = null;
        expect(obj?.a && 'yes').toBe(undefined);
      }`,
    output: `() => {
  const obj = null;
  expect((obj === null || obj === void 0 ? void 0 : obj.a) && 'yes').toBe(undefined);
};`,
  },
  {
    title: 'with logical operators > ?. with || operator',
    source: `() => {
        const obj = null;
        expect(obj?.a || 'fallback').toBe('fallback');
      }`,
    output: `() => {
  const obj = null;
  expect((obj === null || obj === void 0 ? void 0 : obj.a) || 'fallback').toBe('fallback');
};`,
  },
  {
    title: 'with logical operators > ?. with ?? operator',
    source: `() => {
        const obj = null;
        expect(obj?.a ?? 'fallback').toBe('fallback');
      }`,
    output: `() => {
  const obj = null;
  expect((obj === null || obj === void 0 ? void 0 : obj.a) ?? 'fallback').toBe('fallback');
};`,
  },
  {
    title: 'with logical operators > ?. returning falsy with ??',
    source: `() => {
        const obj = { a: 0 };
        expect(obj?.a ?? 'fallback').toBe(0);
      }`,
    output: `() => {
  const obj = { a: 0 };
  expect((obj === null || obj === void 0 ? void 0 : obj.a) ?? 'fallback').toBe(0);
};`,
  },
  {
    title: 'with logical operators > ?. returning falsy with ||',
    source: `() => {
        const obj = { a: 0 };
        expect(obj?.a || 'fallback').toBe('fallback');
      }`,
    output: `() => {
  const obj = { a: 0 };
  expect((obj === null || obj === void 0 ? void 0 : obj.a) || 'fallback').toBe('fallback');
};`,
  },
  {
    title: 'with logical operators > chained logical with multiple ?.',
    source: `() => {
        const a = { x: 1 };
        const b = null;
        expect(a?.x && b?.y).toBe(undefined);
      }`,
    output: `() => {
  const a = { x: 1 };
  const b = null;
  expect(
    (a === null || a === void 0 ? void 0 : a.x) && (b === null || b === void 0 ? void 0 : b.y),
  ).toBe(undefined);
};`,
  },
  {
    title: 'mixed chains > optional then regular access',
    source: `() => {
        const obj = { a: { b: 42 } };
        expect(obj?.a.b).toBe(42);
      }`,
    output: `() => {
  const obj = { a: { b: 42 } };
  expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(42);
};`,
  },
  {
    title: 'mixed chains > optional then regular access on null short-circuits all',
    source: `() => {
        const obj = null;
        // The entire chain short-circuits — .b is not attempted
        expect(obj?.a.b).toBe(undefined);
      }`,
    output: `() => {
  const obj = null;
  // The entire chain short-circuits — .b is not attempted
  expect(obj === null || obj === void 0 ? void 0 : obj.a.b).toBe(undefined);
};`,
  },
  {
    title: 'mixed chains > regular then optional access',
    source: `() => {
        const obj = { a: null };
        expect(obj.a?.b).toBe(undefined);
      }`,
    output: `() => {
  var _obj$a;
  const obj = { a: null };
  expect((_obj$a = obj.a) === null || _obj$a === void 0 ? void 0 : _obj$a.b).toBe(undefined);
};`,
  },
  {
    title: 'mixed chains > mixed optional and regular deep chain',
    source: `() => {
        const obj = { a: { b: { c: { d: 'deep' } } } };
        expect(obj?.a.b?.c.d).toBe('deep');
      }`,
    output: `() => {
  var _obj$a$b;
  const obj = { a: { b: { c: { d: 'deep' } } } };
  expect(
    obj === null || obj === void 0 || (_obj$a$b = obj.a.b) === null || _obj$a$b === void 0
      ? void 0
      : _obj$a$b.c.d,
  ).toBe('deep');
};`,
  },
  {
    title: 'mixed chains > optional member then optional call',
    source: `() => {
        const obj = { fn: () => 42 };
        expect(obj?.fn?.()).toBe(42);
      }`,
    output: `() => {
  var _obj$fn;
  const obj = { fn: () => 42 };
  expect(
    obj === null || obj === void 0 || (_obj$fn = obj.fn) === null || _obj$fn === void 0
      ? void 0
      : _obj$fn.call(obj),
  ).toBe(42);
};`,
  },
  {
    title: 'mixed chains > optional member with missing function',
    source: `() => {
        const obj = {};
        expect(obj?.fn?.()).toBe(undefined);
      }`,
    output: `() => {
  var _obj$fn;
  const obj = {};
  expect(
    obj === null || obj === void 0 || (_obj$fn = obj.fn) === null || _obj$fn === void 0
      ? void 0
      : _obj$fn.call(obj),
  ).toBe(undefined);
};`,
  },
  {
    title: 'mixed chains > optional computed then optional member',
    source: `() => {
        const obj = { items: [{ name: 'first' }] };
        expect(obj?.items?.[0]?.name).toBe('first');
        expect(obj?.items?.[99]?.name).toBe(undefined);
      }`,
    output: `() => {
  var _obj$items, _obj$items2;
  const obj = { items: [{ name: 'first' }] };
  expect(
    obj === null ||
      obj === void 0 ||
      (_obj$items = obj.items) === null ||
      _obj$items === void 0 ||
      (_obj$items = _obj$items[0]) === null ||
      _obj$items === void 0
      ? void 0
      : _obj$items.name,
  ).toBe('first');
  expect(
    obj === null ||
      obj === void 0 ||
      (_obj$items2 = obj.items) === null ||
      _obj$items2 === void 0 ||
      (_obj$items2 = _obj$items2[99]) === null ||
      _obj$items2 === void 0
      ? void 0
      : _obj$items2.name,
  ).toBe(undefined);
};`,
  },
  {
    title: 'with classes > optional access on class instance',
    source: `() => {
        class User {
          constructor(name) {
            this.name = name;
          }
          greet() {
            return 'Hi, ' + this.name;
          }
        }
        const user = new User('Alice');
        expect(user?.name).toBe('Alice');
        expect(user?.greet()).toBe('Hi, Alice');
      }`,
    output: `() => {
  class User {
    constructor(name) {
      this.name = name;
    }
    greet() {
      return 'Hi, ' + this.name;
    }
  }
  const user = new User('Alice');
  expect(user === null || user === void 0 ? void 0 : user.name).toBe('Alice');
  expect(user === null || user === void 0 ? void 0 : user.greet()).toBe('Hi, Alice');
};`,
  },
  {
    title: 'with classes > optional access on null instance',
    source: `() => {
        const user = null;
        expect(user?.name).toBe(undefined);
        expect(user?.greet?.()).toBe(undefined);
      }`,
    output: `() => {
  var _user$greet;
  const user = null;
  expect(user === null || user === void 0 ? void 0 : user.name).toBe(undefined);
  expect(
    user === null ||
      user === void 0 ||
      (_user$greet = user.greet) === null ||
      _user$greet === void 0
      ? void 0
      : _user$greet.call(user),
  ).toBe(undefined);
};`,
  },
  {
    title: 'with classes > optional access on inherited method',
    source: `() => {
        class Animal {
          speak() {
            return 'generic';
          }
        }
        class Dog extends Animal {
          speak() {
            return 'woof';
          }
        }
        const d = new Dog();
        expect(d?.speak()).toBe('woof');
        const n = null;
        expect(n?.speak?.()).toBe(undefined);
      }`,
    output: `() => {
  var _n$speak;
  class Animal {
    speak() {
      return 'generic';
    }
  }
  class Dog extends Animal {
    speak() {
      return 'woof';
    }
  }
  const d = new Dog();
  expect(d === null || d === void 0 ? void 0 : d.speak()).toBe('woof');
  const n = null;
  expect(
    n === null || n === void 0 || (_n$speak = n.speak) === null || _n$speak === void 0
      ? void 0
      : _n$speak.call(n),
  ).toBe(undefined);
};`,
  },
  {
    title: 'with classes > optional access on static method',
    source: `() => {
        class Utils {
          static parse(s) {
            return parseInt(s, 10);
          }
        }
        expect(Utils?.parse('42')).toBe(42);
        const Cls = null;
        expect(Cls?.parse?.('42')).toBe(undefined);
      }`,
    output: `() => {
  var _Cls$parse;
  class Utils {
    static parse(s) {
      return parseInt(s, 10);
    }
  }
  expect(Utils === null || Utils === void 0 ? void 0 : Utils.parse('42')).toBe(42);
  const Cls = null;
  expect(
    Cls === null || Cls === void 0 || (_Cls$parse = Cls.parse) === null || _Cls$parse === void 0
      ? void 0
      : _Cls$parse.call(Cls, '42'),
  ).toBe(undefined);
};`,
  },
  {
    title: 'with classes > optional access on getter',
    source: `() => {
        class Box {
          #val;
          constructor(v) {
            this.#val = v;
          }
          get value() {
            return this.#val;
          }
        }
        const box = new Box(42);
        expect(box?.value).toBe(42);
        const empty = null;
        expect(empty?.value).toBe(undefined);
      }`,
    output: `() => {
  class Box {
    #val;
    constructor(v) {
      this.#val = v;
    }
    get value() {
      return this.#val;
    }
  }
  const box = new Box(42);
  expect(box === null || box === void 0 ? void 0 : box.value).toBe(42);
  const empty = null;
  expect(empty === null || empty === void 0 ? void 0 : empty.value).toBe(undefined);
};`,
  },
  {
    title: 'with various types as base > number base',
    source: `() => {
        const n = 42;
        expect(n?.toFixed(2)).toBe('42.00');
        expect(n?.toString()).toBe('42');
      }`,
    output: `() => {
  const n = 42;
  expect(n === null || n === void 0 ? void 0 : n.toFixed(2)).toBe('42.00');
  expect(n === null || n === void 0 ? void 0 : n.toString()).toBe('42');
};`,
  },
  {
    title: 'with various types as base > string base',
    source: `() => {
        const s = 'hello';
        expect(s?.length).toBe(5);
        expect(s?.toUpperCase()).toBe('HELLO');
        expect(s?.[0]).toBe('h');
      }`,
    output: `() => {
  const s = 'hello';
  expect(s === null || s === void 0 ? void 0 : s.length).toBe(5);
  expect(s === null || s === void 0 ? void 0 : s.toUpperCase()).toBe('HELLO');
  expect(s === null || s === void 0 ? void 0 : s[0]).toBe('h');
};`,
  },
  {
    title: 'with various types as base > boolean base',
    source: `() => {
        const b = true;
        expect(b?.toString()).toBe('true');
      }`,
    output: `() => {
  const b = true;
  expect(b === null || b === void 0 ? void 0 : b.toString()).toBe('true');
};`,
  },
  {
    title: 'with various types as base > symbol base',
    source: `() => {
        const s = Symbol('test');
        expect(s?.toString()).toBe('Symbol(test)');
        expect(s?.description).toBe('test');
      }`,
    output: `() => {
  const s = Symbol('test');
  expect(s === null || s === void 0 ? void 0 : s.toString()).toBe('Symbol(test)');
  expect(s === null || s === void 0 ? void 0 : s.description).toBe('test');
};`,
  },
  {
    title: 'with various types as base > bigint base',
    source: `() => {
        const b = BigInt(42);
        expect(b?.toString()).toBe('42');
      }`,
    output: `() => {
  const b = BigInt(42);
  expect(b === null || b === void 0 ? void 0 : b.toString()).toBe('42');
};`,
  },
  {
    title: 'with various types as base > array base',
    source: `() => {
        const arr = [1, 2, 3];
        expect(arr?.length).toBe(3);
        expect(arr?.map((x) => x * 2)).toEqual([2, 4, 6]);
        expect(arr?.[2]).toBe(3);
      }`,
    output: `() => {
  const arr = [1, 2, 3];
  expect(arr === null || arr === void 0 ? void 0 : arr.length).toBe(3);
  expect(arr === null || arr === void 0 ? void 0 : arr.map(x => x * 2)).toEqual([2, 4, 6]);
  expect(arr === null || arr === void 0 ? void 0 : arr[2]).toBe(3);
};`,
  },
  {
    title: 'with various types as base > function base',
    source: `() => {
        const fn = (x) => x * 2;
        expect(fn?.name).toBe('fn');
        expect(fn?.length).toBe(1);
        expect(fn?.(5)).toBe(10);
      }`,
    output: `() => {
  const fn = x => x * 2;
  expect(fn === null || fn === void 0 ? void 0 : fn.name).toBe('fn');
  expect(fn === null || fn === void 0 ? void 0 : fn.length).toBe(1);
  expect(fn === null || fn === void 0 ? void 0 : fn(5)).toBe(10);
};`,
  },
  {
    title: 'with various types as base > regex base',
    source: `() => {
        const re = /test/i;
        expect(re?.test('TEST')).toBe(true);
        expect(re?.flags).toBe('i');
      }`,
    output: `() => {
  const re = /test/i;
  expect(re === null || re === void 0 ? void 0 : re.test('TEST')).toBe(true);
  expect(re === null || re === void 0 ? void 0 : re.flags).toBe('i');
};`,
  },
  {
    title: 'with destructuring > result of optional chain in destructuring default',
    source: `() => {
        const obj = null;
        const { a = obj?.b ?? 'default' } = {};
        expect(a).toBe('default');
      }`,
    output: `() => {
  const obj = null;
  const { a = (obj === null || obj === void 0 ? void 0 : obj.b) ?? 'default' } = {};
  expect(a).toBe('default');
};`,
  },
  {
    title: 'with destructuring > optional chain inside destructured value',
    source: `() => {
        const data = { user: { address: { city: 'NYC' } } };
        const city = data?.user?.address?.city;
        expect(city).toBe('NYC');
      }`,
    output: `() => {
  var _data$user;
  const data = { user: { address: { city: 'NYC' } } };
  const city =
    data === null ||
    data === void 0 ||
    (_data$user = data.user) === null ||
    _data$user === void 0 ||
    (_data$user = _data$user.address) === null ||
    _data$user === void 0
      ? void 0
      : _data$user.city;
  expect(city).toBe('NYC');
};`,
  },
  {
    title: 'with destructuring > optional chain result destructured',
    source: `() => {
        const obj = { coords: { x: 10, y: 20 } };
        const { x, y } = obj?.coords ?? {};
        expect(x).toBe(10);
        expect(y).toBe(20);
      }`,
    output: `() => {
  const obj = {
    coords: {
      x: 10,
      y: 20,
    },
  };
  const { x, y } = (obj === null || obj === void 0 ? void 0 : obj.coords) ?? {};
  expect(x).toBe(10);
  expect(y).toBe(20);
};`,
  },
  {
    title: 'with destructuring > null base with destructure fallback',
    source: `() => {
        const obj = null;
        const { x = 0, y = 0 } = obj?.coords ?? {};
        expect(x).toBe(0);
        expect(y).toBe(0);
      }`,
    output: `() => {
  const obj = null;
  const { x = 0, y = 0 } = (obj === null || obj === void 0 ? void 0 : obj.coords) ?? {};
  expect(x).toBe(0);
  expect(y).toBe(0);
};`,
  },
  {
    title: 'with async/await > optional chain on async function result',
    source: `async () => {
        const fetchData = async () => ({ value: 42 });
        const result = await fetchData();
        expect(result?.value).toBe(42);
      }`,
    output: `async () => {
  const fetchData = async () => ({ value: 42 });
  const result = await fetchData();
  expect(result === null || result === void 0 ? void 0 : result.value).toBe(42);
};`,
  },
  {
    title: 'with async/await > optional chain on null async result',
    source: `async () => {
        const fetchData = async () => null;
        const result = await fetchData();
        expect(result?.value).toBe(undefined);
      }`,
    output: `async () => {
  const fetchData = async () => null;
  const result = await fetchData();
  expect(result === null || result === void 0 ? void 0 : result.value).toBe(undefined);
};`,
  },
  {
    title: 'with async/await > optional call on async method',
    source: `async () => {
        const obj = {
          async getData() {
            return 'data';
          },
        };
        const result = await obj?.getData();
        expect(result).toBe('data');
      }`,
    output: `async () => {
  const obj = {
    async getData() {
      return 'data';
    },
  };
  const result = await (obj === null || obj === void 0 ? void 0 : obj.getData());
  expect(result).toBe('data');
};`,
  },
  {
    title: 'with async/await > optional call on null async method',
    source: `async () => {
        const obj = {};
        const result = await obj?.getData?.();
        expect(result).toBe(undefined);
      }`,
    output: `async () => {
  var _obj$getData;
  const obj = {};
  const result = await (obj === null ||
  obj === void 0 ||
  (_obj$getData = obj.getData) === null ||
  _obj$getData === void 0
    ? void 0
    : _obj$getData.call(obj));
  expect(result).toBe(undefined);
};`,
  },
  {
    title: 'with Map, Set, and WeakMap > optional method call on Map',
    source: `() => {
        const map = new Map([['key', 'value']]);
        expect(map?.get('key')).toBe('value');
        expect(map?.get('missing')).toBe(undefined);
      }`,
    output: `() => {
  const map = new Map([['key', 'value']]);
  expect(map === null || map === void 0 ? void 0 : map.get('key')).toBe('value');
  expect(map === null || map === void 0 ? void 0 : map.get('missing')).toBe(undefined);
};`,
  },
  {
    title: 'with Map, Set, and WeakMap > optional on null Map',
    source: `() => {
        const map = null;
        expect(map?.get?.('key')).toBe(undefined);
      }`,
    output: `() => {
  var _map$get;
  const map = null;
  expect(
    map === null || map === void 0 || (_map$get = map.get) === null || _map$get === void 0
      ? void 0
      : _map$get.call(map, 'key'),
  ).toBe(undefined);
};`,
  },
  {
    title: 'with Map, Set, and WeakMap > optional on Set',
    source: `() => {
        const set = new Set([1, 2, 3]);
        expect(set?.has(2)).toBe(true);
        expect(set?.has(4)).toBe(false);
        expect(set?.size).toBe(3);
      }`,
    output: `() => {
  const set = new Set([1, 2, 3]);
  expect(set === null || set === void 0 ? void 0 : set.has(2)).toBe(true);
  expect(set === null || set === void 0 ? void 0 : set.has(4)).toBe(false);
  expect(set === null || set === void 0 ? void 0 : set.size).toBe(3);
};`,
  },
  {
    title: 'with Map, Set, and WeakMap > optional on WeakMap',
    source: `() => {
        const wm = new WeakMap();
        const key = {};
        wm.set(key, 'val');
        expect(wm?.get(key)).toBe('val');
      }`,
    output: `() => {
  const wm = new WeakMap();
  const key = {};
  wm.set(key, 'val');
  expect(wm === null || wm === void 0 ? void 0 : wm.get(key)).toBe('val');
};`,
  },
  {
    title: 'edge cases > optional chaining on result of typeof',
    source: `() => {
        // typeof always returns a string
        const result = (typeof undefined)?.length;
        expect(result).toBe(9); // "undefined".length
      }`,
    output: `() => {
  var _undefined;
  // typeof always returns a string
  const result =
    (_undefined = typeof undefined) === null || _undefined === void 0 ? void 0 : _undefined.length;
  expect(result).toBe(9);
};`,
  },
  {
    title: 'edge cases > deeply nested with all nullish',
    source: `() => {
        const obj = null;
        expect(obj?.a?.b?.c?.d?.e?.f?.g?.h).toBe(undefined);
      }`,
    output: `() => {
  var _obj$a;
  const obj = null;
  expect(
    obj === null ||
      obj === void 0 ||
      (_obj$a = obj.a) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.b) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.c) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.d) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.e) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.f) === null ||
      _obj$a === void 0 ||
      (_obj$a = _obj$a.g) === null ||
      _obj$a === void 0
      ? void 0
      : _obj$a.h,
  ).toBe(undefined);
};`,
  },
  {
    title: 'edge cases > optional chaining in template literal',
    source: `() => {
        const obj = null;
        const result = \`value: \${obj?.foo ?? 'none'}\`;
        expect(result).toBe('value: none');
      }`,
    output: `() => {
  const obj = null;
  const result = \`value: \${(obj === null || obj === void 0 ? void 0 : obj.foo) ?? 'none'}\`;
  expect(result).toBe('value: none');
};`,
  },
  {
    title: 'edge cases > optional chaining with spread',
    source: `() => {
        const obj = { arr: [1, 2, 3] };
        const result = [...(obj?.arr ?? [])];
        expect(result).toEqual([1, 2, 3]);
     \x20
        const nul = null;
        const result2 = [...(nul?.arr ?? [])];
        expect(result2).toEqual([]);
      }`,
    output: `() => {
  const obj = { arr: [1, 2, 3] };
  const result = [...((obj === null || obj === void 0 ? void 0 : obj.arr) ?? [])];
  expect(result).toEqual([1, 2, 3]);
  const nul = null;
  const result2 = [...((nul === null || nul === void 0 ? void 0 : nul.arr) ?? [])];
  expect(result2).toEqual([]);
};`,
  },
  {
    title: 'edge cases > chained optional calls',
    source: `() => {
        const fn = () => () => () => 42;
        expect(fn?.()?.()?.()).toBe(42);
      }`,
    output: `() => {
  var _fn, _fn2;
  const fn = () => () => () => 42;
  expect(
    fn === null ||
      fn === void 0 ||
      (_fn = fn()) === null ||
      _fn === void 0 ||
      (_fn2 = _fn()) === null ||
      _fn2 === void 0
      ? void 0
      : _fn2(),
  ).toBe(42);
};`,
  },
  {
    title: 'edge cases > chained optional calls with null',
    source: `() => {
        const fn = () => () => null;
        expect(fn?.()?.()?.()).toBe(undefined);
      }`,
    output: `() => {
  var _fn, _fn2;
  const fn = () => () => null;
  expect(
    fn === null ||
      fn === void 0 ||
      (_fn = fn()) === null ||
      _fn === void 0 ||
      (_fn2 = _fn()) === null ||
      _fn2 === void 0
      ? void 0
      : _fn2(),
  ).toBe(undefined);
};`,
  },
  {
    title: 'edge cases > optional on Map.prototype.get result',
    source: `() => {
        const map = new Map();
        map.set('user', { name: 'Alice' });
        expect(map.get('user')?.name).toBe('Alice');
        expect(map.get('missing')?.name).toBe(undefined);
      }`,
    output: `() => {
  var _map$get, _map$get2;
  const map = new Map();
  map.set('user', { name: 'Alice' });
  expect(
    (_map$get = map.get('user')) === null || _map$get === void 0 ? void 0 : _map$get.name,
  ).toBe('Alice');
  expect(
    (_map$get2 = map.get('missing')) === null || _map$get2 === void 0 ? void 0 : _map$get2.name,
  ).toBe(undefined);
};`,
  },
  {
    title: 'edge cases > optional chaining preserves object identity',
    source: `() => {
        const inner = { value: 42 };
        const obj = { inner };
        expect(obj?.inner).toBe(inner);
      }`,
    output: `() => {
  const inner = { value: 42 };
  const obj = { inner };
  expect(obj === null || obj === void 0 ? void 0 : obj.inner).toBe(inner);
};`,
  },
  {
    title: 'edge cases > parenthesized optional chain',
    source: `() => {
        const obj = { a: { b: 42 } };
        expect(obj?.a?.b).toBe(42);
        const nul = null;
        expect(nul?.a?.b).toBe(undefined);
      }`,
    output: `() => {
  var _obj$a, _nul$a;
  const obj = { a: { b: 42 } };
  expect(
    obj === null || obj === void 0 || (_obj$a = obj.a) === null || _obj$a === void 0
      ? void 0
      : _obj$a.b,
  ).toBe(42);
  const nul = null;
  expect(
    nul === null || nul === void 0 || (_nul$a = nul.a) === null || _nul$a === void 0
      ? void 0
      : _nul$a.b,
  ).toBe(undefined);
};`,
  },
  {
    title: 'edge cases > optional chaining with comma operator',
    source: `() => {
        const obj = { a: 1 };
        const result = (0, obj)?.a;
        expect(result).toBe(1);
      }`,
    output: `() => {
  var _ref;
  const obj = { a: 1 };
  const result = (_ref = (0, obj)) === null || _ref === void 0 ? void 0 : _ref.a;
  expect(result).toBe(1);
};`,
  },
  {
    title: 'practical patterns > safe nested config access',
    source: `() => {
        const config = {
          database: {
            connection: {
              host: 'localhost',
              port: 5432,
            },
          },
        };
        expect(config?.database?.connection?.host).toBe('localhost');
        expect(config?.database?.connection?.ssl).toBe(undefined);
        expect(config?.cache?.redis?.host).toBe(undefined);
      }`,
    output: `() => {
  var _config$database, _config$database2, _config$cache;
  const config = {
    database: {
      connection: {
        host: 'localhost',
        port: 5432,
      },
    },
  };
  expect(
    config === null ||
      config === void 0 ||
      (_config$database = config.database) === null ||
      _config$database === void 0 ||
      (_config$database = _config$database.connection) === null ||
      _config$database === void 0
      ? void 0
      : _config$database.host,
  ).toBe('localhost');
  expect(
    config === null ||
      config === void 0 ||
      (_config$database2 = config.database) === null ||
      _config$database2 === void 0 ||
      (_config$database2 = _config$database2.connection) === null ||
      _config$database2 === void 0
      ? void 0
      : _config$database2.ssl,
  ).toBe(undefined);
  expect(
    config === null ||
      config === void 0 ||
      (_config$cache = config.cache) === null ||
      _config$cache === void 0 ||
      (_config$cache = _config$cache.redis) === null ||
      _config$cache === void 0
      ? void 0
      : _config$cache.host,
  ).toBe(undefined);
};`,
  },
  {
    title: 'practical patterns > safe event handler invocation',
    source: `() => {
        let called = false;
        const props = {
          onPress: () => {
            called = true;
          },
        };
        props?.onPress?.();
        expect(called).toBe(true);
     \x20
        const emptyProps = {};
        emptyProps?.onPress?.();
        // No error thrown
        expect(true).toBe(true);
      }`,
    output: `() => {
  var _props$onPress, _emptyProps$onPress;
  let called = false;
  const props = {
    onPress: () => {
      called = true;
    },
  };
  props === null ||
  props === void 0 ||
  (_props$onPress = props.onPress) === null ||
  _props$onPress === void 0
    ? void 0
    : _props$onPress.call(props);
  expect(called).toBe(true);
  const emptyProps = {};
  emptyProps === null ||
  emptyProps === void 0 ||
  (_emptyProps$onPress = emptyProps.onPress) === null ||
  _emptyProps$onPress === void 0
    ? void 0
    : _emptyProps$onPress.call(emptyProps);
  // No error thrown
  expect(true).toBe(true);
};`,
  },
  {
    title: 'practical patterns > safe array element access',
    source: `() => {
        const matrix = [
          [1, 2],
          [3, 4],
        ];
        expect(matrix?.[0]?.[1]).toBe(2);
        expect(matrix?.[5]?.[0]).toBe(undefined);
      }`,
    output: `() => {
  var _matrix$, _matrix$2;
  const matrix = [
    [1, 2],
    [3, 4],
  ];
  expect(
    matrix === null || matrix === void 0 || (_matrix$ = matrix[0]) === null || _matrix$ === void 0
      ? void 0
      : _matrix$[1],
  ).toBe(2);
  expect(
    matrix === null || matrix === void 0 || (_matrix$2 = matrix[5]) === null || _matrix$2 === void 0
      ? void 0
      : _matrix$2[0],
  ).toBe(undefined);
};`,
  },
  {
    title: 'practical patterns > optional chaining in reduce',
    source: `() => {
        const items = [
          { category: { name: 'A' }, value: 1 },
          { category: null, value: 2 },
          { category: { name: 'B' }, value: 3 },
        ];
        const categories = items.map((item) => item.category?.name ?? 'Unknown');
        expect(categories).toEqual(['A', 'Unknown', 'B']);
      }`,
    output: `() => {
  const items = [
    {
      category: { name: 'A' },
      value: 1,
    },
    {
      category: null,
      value: 2,
    },
    {
      category: { name: 'B' },
      value: 3,
    },
  ];
  const categories = items.map(item => {
    var _item$category;
    return (
      ((_item$category = item.category) === null || _item$category === void 0
        ? void 0
        : _item$category.name) ?? 'Unknown'
    );
  });
  expect(categories).toEqual(['A', 'Unknown', 'B']);
};`,
  },
  {
    title: 'practical patterns > JSON response navigation',
    source: `() => {
        const response = {
          data: {
            users: [
              { profile: { avatar: { url: 'https://example.com/photo.jpg' } } },
              { profile: { avatar: null } },
              { profile: null },
            ],
          },
        };
        expect(response.data?.users?.[0]?.profile?.avatar?.url).toBe(
          'https://example.com/photo.jpg'
        );
        expect(response.data?.users?.[1]?.profile?.avatar?.url).toBe(undefined);
        expect(response.data?.users?.[2]?.profile?.avatar?.url).toBe(undefined);
        expect(response.data?.users?.[99]?.profile?.avatar?.url).toBe(undefined);
      }`,
    output: `() => {
  var _response$data, _response$data2, _response$data3, _response$data4;
  const response = {
    data: {
      users: [
        { profile: { avatar: { url: 'https://example.com/photo.jpg' } } },
        { profile: { avatar: null } },
        { profile: null },
      ],
    },
  };
  expect(
    (_response$data = response.data) === null ||
      _response$data === void 0 ||
      (_response$data = _response$data.users) === null ||
      _response$data === void 0 ||
      (_response$data = _response$data[0]) === null ||
      _response$data === void 0 ||
      (_response$data = _response$data.profile) === null ||
      _response$data === void 0 ||
      (_response$data = _response$data.avatar) === null ||
      _response$data === void 0
      ? void 0
      : _response$data.url,
  ).toBe('https://example.com/photo.jpg');
  expect(
    (_response$data2 = response.data) === null ||
      _response$data2 === void 0 ||
      (_response$data2 = _response$data2.users) === null ||
      _response$data2 === void 0 ||
      (_response$data2 = _response$data2[1]) === null ||
      _response$data2 === void 0 ||
      (_response$data2 = _response$data2.profile) === null ||
      _response$data2 === void 0 ||
      (_response$data2 = _response$data2.avatar) === null ||
      _response$data2 === void 0
      ? void 0
      : _response$data2.url,
  ).toBe(undefined);
  expect(
    (_response$data3 = response.data) === null ||
      _response$data3 === void 0 ||
      (_response$data3 = _response$data3.users) === null ||
      _response$data3 === void 0 ||
      (_response$data3 = _response$data3[2]) === null ||
      _response$data3 === void 0 ||
      (_response$data3 = _response$data3.profile) === null ||
      _response$data3 === void 0 ||
      (_response$data3 = _response$data3.avatar) === null ||
      _response$data3 === void 0
      ? void 0
      : _response$data3.url,
  ).toBe(undefined);
  expect(
    (_response$data4 = response.data) === null ||
      _response$data4 === void 0 ||
      (_response$data4 = _response$data4.users) === null ||
      _response$data4 === void 0 ||
      (_response$data4 = _response$data4[99]) === null ||
      _response$data4 === void 0 ||
      (_response$data4 = _response$data4.profile) === null ||
      _response$data4 === void 0 ||
      (_response$data4 = _response$data4.avatar) === null ||
      _response$data4 === void 0
      ? void 0
      : _response$data4.url,
  ).toBe(undefined);
};`,
  },
  {
    title: 'practical patterns > safe method chaining pattern',
    source: `() => {
        class Builder {
          #parts = [];
          add(part) {
            this.#parts.push(part);
            return this;
          }
          build() {
            return this.#parts.join(' ');
          }
        }
        const builder = new Builder();
        const result = builder?.add('hello')?.add('world')?.build();
        expect(result).toBe('hello world');
     \x20
        const nullBuilder = null;
        const nullResult = nullBuilder?.add('hello')?.add('world')?.build();
        expect(nullResult).toBe(undefined);
      }`,
    output: `() => {
  var _builder$add, _nullBuilder$add;
  class Builder {
    #parts = [];
    add(part) {
      this.#parts.push(part);
      return this;
    }
    build() {
      return this.#parts.join(' ');
    }
  }
  const builder = new Builder();
  const result =
    builder === null ||
    builder === void 0 ||
    (_builder$add = builder.add('hello')) === null ||
    _builder$add === void 0 ||
    (_builder$add = _builder$add.add('world')) === null ||
    _builder$add === void 0
      ? void 0
      : _builder$add.build();
  expect(result).toBe('hello world');
  const nullBuilder = null;
  const nullResult =
    nullBuilder === null ||
    nullBuilder === void 0 ||
    (_nullBuilder$add = nullBuilder.add('hello')) === null ||
    _nullBuilder$add === void 0 ||
    (_nullBuilder$add = _nullBuilder$add.add('world')) === null ||
    _nullBuilder$add === void 0
      ? void 0
      : _nullBuilder$add.build();
  expect(nullResult).toBe(undefined);
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
