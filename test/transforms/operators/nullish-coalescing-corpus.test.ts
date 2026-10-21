import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    transforms: {
      nullishCoalescingOperator: {
        loose: false,
      },
    },
  },
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'basic semantics > returns left side when not null or undefined',
    source: `() => {
        expect('hello' ?? 'default').toBe('hello');
        expect(42 ?? 0).toBe(42);
        expect(true ?? false).toBe(true);
      }`,
    output: `() => {
  var _hello, _, _true;
  expect((_hello = 'hello') !== null && _hello !== void 0 ? _hello : 'default').toBe('hello');
  expect((_ = 42) !== null && _ !== void 0 ? _ : 0).toBe(42);
  expect((_true = true) !== null && _true !== void 0 ? _true : false).toBe(true);
};`,
  },
  {
    title: 'basic semantics > returns right side when left is null',
    source: `() => {
        expect(null ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _ref;
  expect((_ref = null) !== null && _ref !== void 0 ? _ref : 'default').toBe('default');
};`,
  },
  {
    title: 'basic semantics > returns right side when left is undefined',
    source: `() => {
        expect(undefined ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _undefined;
  expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : 'default').toBe(
    'default',
  );
};`,
  },
  {
    title: 'basic semantics > returns right side when left is void 0',
    source: `() => {
        expect(void 0 ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _;
  expect((_ = void 0) !== null && _ !== void 0 ? _ : 'default').toBe('default');
};`,
  },
  {
    title: 'basic semantics > preserves falsy non-nullish values',
    source: `() => {
        expect(0 ?? 'default').toBe(0);
        expect('' ?? 'default').toBe('');
        expect(false ?? 'default').toBe(false);
        expect(NaN ?? 'default').not.toBe('default');
      }`,
    output: `() => {
  var _, _ref, _false, _NaN;
  expect((_ = 0) !== null && _ !== void 0 ? _ : 'default').toBe(0);
  expect((_ref = '') !== null && _ref !== void 0 ? _ref : 'default').toBe('');
  expect((_false = false) !== null && _false !== void 0 ? _false : 'default').toBe(false);
  expect((_NaN = NaN) !== null && _NaN !== void 0 ? _NaN : 'default').not.toBe('default');
};`,
  },
  {
    title: 'basic semantics > returns -0 without falling through',
    source: `() => {
        const result = -0 ?? 'default';
        expect(result).toBe(-0);
        expect(1 / result).toBe(-Infinity);
      }`,
    output: `() => {
  var _;
  const result = (_ = -0) !== null && _ !== void 0 ? _ : 'default';
  expect(result).toBe(-0);
  expect(1 / result).toBe(-Infinity);
};`,
  },
  {
    title: 'difference from || operator > ?? keeps 0, || does not',
    source: `() => {
        expect(0 ?? 'fallback').toBe(0);
        expect(0 || 'fallback').toBe('fallback');
      }`,
    output: `() => {
  var _;
  expect((_ = 0) !== null && _ !== void 0 ? _ : 'fallback').toBe(0);
  expect(0 || 'fallback').toBe('fallback');
};`,
  },
  {
    title: 'difference from || operator > ?? keeps empty string, || does not',
    source: `() => {
        expect('' ?? 'fallback').toBe('');
        expect('' || 'fallback').toBe('fallback');
      }`,
    output: `() => {
  var _ref;
  expect((_ref = '') !== null && _ref !== void 0 ? _ref : 'fallback').toBe('');
  expect('' || 'fallback').toBe('fallback');
};`,
  },
  {
    title: 'difference from || operator > ?? keeps false, || does not',
    source: `() => {
        expect(false ?? 'fallback').toBe(false);
        expect(false || 'fallback').toBe('fallback');
      }`,
    output: `() => {
  var _false;
  expect((_false = false) !== null && _false !== void 0 ? _false : 'fallback').toBe(false);
  expect(false || 'fallback').toBe('fallback');
};`,
  },
  {
    title: 'difference from || operator > ?? keeps NaN, || does not',
    source: `() => {
        const qqResult = NaN ?? 'fallback';
        const orResult = NaN || 'fallback';
        expect(typeof qqResult).toBe('number');
        expect(orResult).toBe('fallback');
      }`,
    output: `() => {
  var _NaN;
  const qqResult = (_NaN = NaN) !== null && _NaN !== void 0 ? _NaN : 'fallback';
  const orResult = NaN || 'fallback';
  expect(typeof qqResult).toBe('number');
  expect(orResult).toBe('fallback');
};`,
  },
  {
    title: 'difference from || operator > both fall through on null',
    source: `() => {
        expect(null ?? 'fallback').toBe('fallback');
        expect(null || 'fallback').toBe('fallback');
      }`,
    output: `() => {
  var _ref;
  expect((_ref = null) !== null && _ref !== void 0 ? _ref : 'fallback').toBe('fallback');
  expect(null || 'fallback').toBe('fallback');
};`,
  },
  {
    title: 'difference from || operator > both fall through on undefined',
    source: `() => {
        expect(undefined ?? 'fallback').toBe('fallback');
        expect(undefined || 'fallback').toBe('fallback');
      }`,
    output: `() => {
  var _undefined;
  expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : 'fallback').toBe(
    'fallback',
  );
  expect(undefined || 'fallback').toBe('fallback');
};`,
  },
  {
    title: 'chaining > multiple ?? operators',
    source: `() => {
        expect(null ?? undefined ?? 'found').toBe('found');
      }`,
    output: `() => {
  var _ref, _ref2;
  expect(
    (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : undefined) !== null &&
      _ref !== void 0
      ? _ref
      : 'found',
  ).toBe('found');
};`,
  },
  {
    title: 'chaining > first non-nullish wins in chain',
    source: `() => {
        expect(null ?? 0 ?? 'fallback').toBe(0);
      }`,
    output: `() => {
  var _ref, _ref2;
  expect(
    (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : 0) !== null && _ref !== void 0
      ? _ref
      : 'fallback',
  ).toBe(0);
};`,
  },
  {
    title: 'chaining > all null/undefined falls through to last',
    source: `() => {
        expect(null ?? undefined ?? null ?? 'end').toBe('end');
      }`,
    output: `() => {
  var _ref, _ref2, _ref3;
  expect(
    (_ref =
      (_ref2 = (_ref3 = null) !== null && _ref3 !== void 0 ? _ref3 : undefined) !== null &&
      _ref2 !== void 0
        ? _ref2
        : null) !== null && _ref !== void 0
      ? _ref
      : 'end',
  ).toBe('end');
};`,
  },
  {
    title: 'chaining > first value returned if not nullish',
    source: `() => {
        expect('first' ?? 'second' ?? 'third').toBe('first');
      }`,
    output: `() => {
  var _ref, _first;
  expect(
    (_ref = (_first = 'first') !== null && _first !== void 0 ? _first : 'second') !== null &&
      _ref !== void 0
      ? _ref
      : 'third',
  ).toBe('first');
};`,
  },
  {
    title: 'chaining > chain with false',
    source: `() => {
        expect(null ?? false ?? 'fallback').toBe(false);
      }`,
    output: `() => {
  var _ref, _ref2;
  expect(
    (_ref = (_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : false) !== null && _ref !== void 0
      ? _ref
      : 'fallback',
  ).toBe(false);
};`,
  },
  {
    title: 'with member expressions > property access on object',
    source: `() => {
        const obj = { foo: 'bar' };
        expect(obj.foo ?? 'default').toBe('bar');
      }`,
    output: `() => {
  var _obj$foo;
  const obj = { foo: 'bar' };
  expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe('bar');
};`,
  },
  {
    title: 'with member expressions > missing property returns default',
    source: `() => {
        const obj = {};
        expect(obj.foo ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _obj$foo;
  const obj = {};
  expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe(
    'default',
  );
};`,
  },
  {
    title: 'with member expressions > null property value returns default',
    source: `() => {
        const obj = { foo: null };
        expect(obj.foo ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _obj$foo;
  const obj = { foo: null };
  expect((_obj$foo = obj.foo) !== null && _obj$foo !== void 0 ? _obj$foo : 'default').toBe(
    'default',
  );
};`,
  },
  {
    title: 'with member expressions > falsy property value is preserved',
    source: `() => {
        const obj = { count: 0, name: '', active: false };
        expect(obj.count ?? 99).toBe(0);
        expect(obj.name ?? 'anonymous').toBe('');
        expect(obj.active ?? true).toBe(false);
      }`,
    output: `() => {
  var _obj$count, _obj$name, _obj$active;
  const obj = {
    count: 0,
    name: '',
    active: false,
  };
  expect((_obj$count = obj.count) !== null && _obj$count !== void 0 ? _obj$count : 99).toBe(0);
  expect((_obj$name = obj.name) !== null && _obj$name !== void 0 ? _obj$name : 'anonymous').toBe(
    '',
  );
  expect((_obj$active = obj.active) !== null && _obj$active !== void 0 ? _obj$active : true).toBe(
    false,
  );
};`,
  },
  {
    title: 'with member expressions > nested property access',
    source: `() => {
        const obj = { a: { b: { c: null } } };
        expect(obj.a.b.c ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _obj$a$b$c;
  const obj = { a: { b: { c: null } } };
  expect((_obj$a$b$c = obj.a.b.c) !== null && _obj$a$b$c !== void 0 ? _obj$a$b$c : 'default').toBe(
    'default',
  );
};`,
  },
  {
    title: 'with member expressions > computed property access',
    source: `() => {
        const obj = { key: 'value' };
        const key = 'key';
        expect(obj[key] ?? 'default').toBe('value');
        expect(obj['missing'] ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _obj$key, _obj$missing;
  const obj = { key: 'value' };
  const key = 'key';
  expect((_obj$key = obj[key]) !== null && _obj$key !== void 0 ? _obj$key : 'default').toBe(
    'value',
  );
  expect(
    (_obj$missing = obj['missing']) !== null && _obj$missing !== void 0 ? _obj$missing : 'default',
  ).toBe('default');
};`,
  },
  {
    title: 'with member expressions > array element access',
    source: `() => {
        const arr = [1, null, undefined, 0];
        expect(arr[0] ?? 'default').toBe(1);
        expect(arr[1] ?? 'default').toBe('default');
        expect(arr[2] ?? 'default').toBe('default');
        expect(arr[3] ?? 'default').toBe(0);
        expect(arr[99] ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _arr$, _arr$2, _arr$3, _arr$4, _arr$5;
  const arr = [1, null, undefined, 0];
  expect((_arr$ = arr[0]) !== null && _arr$ !== void 0 ? _arr$ : 'default').toBe(1);
  expect((_arr$2 = arr[1]) !== null && _arr$2 !== void 0 ? _arr$2 : 'default').toBe('default');
  expect((_arr$3 = arr[2]) !== null && _arr$3 !== void 0 ? _arr$3 : 'default').toBe('default');
  expect((_arr$4 = arr[3]) !== null && _arr$4 !== void 0 ? _arr$4 : 'default').toBe(0);
  expect((_arr$5 = arr[99]) !== null && _arr$5 !== void 0 ? _arr$5 : 'default').toBe('default');
};`,
  },
  {
    title: 'with function calls > function returning null',
    source: `() => {
        const fn = () => null;
        expect(fn() ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _fn;
  const fn = () => null;
  expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe('default');
};`,
  },
  {
    title: 'with function calls > function returning undefined',
    source: `() => {
        const fn = () => undefined;
        expect(fn() ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _fn;
  const fn = () => undefined;
  expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe('default');
};`,
  },
  {
    title: 'with function calls > function returning value',
    source: `() => {
        const fn = () => 42;
        expect(fn() ?? 'default').toBe(42);
      }`,
    output: `() => {
  var _fn;
  const fn = () => 42;
  expect((_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default').toBe(42);
};`,
  },
  {
    title: 'with function calls > function returning falsy non-nullish',
    source: `() => {
        expect((() => 0)() ?? 'default').toBe(0);
        expect((() => '')() ?? 'default').toBe('');
        expect((() => false)() ?? 'default').toBe(false);
      }`,
    output: `() => {
  var _ref, _ref2, _ref3;
  expect((_ref = (() => 0)()) !== null && _ref !== void 0 ? _ref : 'default').toBe(0);
  expect((_ref2 = (() => '')()) !== null && _ref2 !== void 0 ? _ref2 : 'default').toBe('');
  expect((_ref3 = (() => false)()) !== null && _ref3 !== void 0 ? _ref3 : 'default').toBe(false);
};`,
  },
  {
    title: 'with function calls > left side evaluated only once',
    source: `() => {
        let count = 0;
        const fn = () => {
          count++;
          return null;
        };
        fn() ?? 'default';
        expect(count).toBe(1);
      }`,
    output: `() => {
  var _fn;
  let count = 0;
  const fn = () => {
    count++;
    return null;
  };
  (_fn = fn()) !== null && _fn !== void 0 ? _fn : 'default';
  expect(count).toBe(1);
};`,
  },
  {
    title: 'with function calls > right side not evaluated when left is non-nullish',
    source: `() => {
        let evaluated = false;
        const right = () => {
          evaluated = true;
          return 'right';
        };
        'left' ?? right();
        expect(evaluated).toBe(false);
      }`,
    output: `() => {
  var _left;
  let evaluated = false;
  const right = () => {
    evaluated = true;
    return 'right';
  };
  (_left = 'left') !== null && _left !== void 0 ? _left : right();
  expect(evaluated).toBe(false);
};`,
  },
  {
    title: 'with function calls > right side evaluated when left is nullish',
    source: `() => {
        let evaluated = false;
        const right = () => {
          evaluated = true;
          return 'right';
        };
        const result = null ?? right();
        expect(evaluated).toBe(true);
        expect(result).toBe('right');
      }`,
    output: `() => {
  var _ref;
  let evaluated = false;
  const right = () => {
    evaluated = true;
    return 'right';
  };
  const result = (_ref = null) !== null && _ref !== void 0 ? _ref : right();
  expect(evaluated).toBe(true);
  expect(result).toBe('right');
};`,
  },
  {
    title: 'short-circuit evaluation > does not evaluate right side when left is 0',
    source: `() => {
        let sideEffect = false;
        const result = 0 ?? ((sideEffect = true), 'fallback');
        expect(result).toBe(0);
        expect(sideEffect).toBe(false);
      }`,
    output: `() => {
  var _;
  let sideEffect = false;
  const result = (_ = 0) !== null && _ !== void 0 ? _ : ((sideEffect = true), 'fallback');
  expect(result).toBe(0);
  expect(sideEffect).toBe(false);
};`,
  },
  {
    title: 'short-circuit evaluation > does not evaluate right side when left is empty string',
    source: `() => {
        let sideEffect = false;
        const result = '' ?? ((sideEffect = true), 'fallback');
        expect(result).toBe('');
        expect(sideEffect).toBe(false);
      }`,
    output: `() => {
  var _ref;
  let sideEffect = false;
  const result = (_ref = '') !== null && _ref !== void 0 ? _ref : ((sideEffect = true), 'fallback');
  expect(result).toBe('');
  expect(sideEffect).toBe(false);
};`,
  },
  {
    title: 'short-circuit evaluation > does not evaluate right side when left is false',
    source: `() => {
        let sideEffect = false;
        const result = false ?? ((sideEffect = true), 'fallback');
        expect(result).toBe(false);
        expect(sideEffect).toBe(false);
      }`,
    output: `() => {
  var _false;
  let sideEffect = false;
  const result =
    (_false = false) !== null && _false !== void 0 ? _false : ((sideEffect = true), 'fallback');
  expect(result).toBe(false);
  expect(sideEffect).toBe(false);
};`,
  },
  {
    title: 'short-circuit evaluation > evaluates right side when left is null',
    source: `() => {
        let sideEffect = false;
        const result = null ?? ((sideEffect = true), 'fallback');
        expect(result).toBe('fallback');
        expect(sideEffect).toBe(true);
      }`,
    output: `() => {
  var _ref;
  let sideEffect = false;
  const result =
    (_ref = null) !== null && _ref !== void 0 ? _ref : ((sideEffect = true), 'fallback');
  expect(result).toBe('fallback');
  expect(sideEffect).toBe(true);
};`,
  },
  {
    title: 'short-circuit evaluation > evaluates right side when left is undefined',
    source: `() => {
        let sideEffect = false;
        const result = undefined ?? ((sideEffect = true), 'fallback');
        expect(result).toBe('fallback');
        expect(sideEffect).toBe(true);
      }`,
    output: `() => {
  var _undefined;
  let sideEffect = false;
  const result =
    (_undefined = undefined) !== null && _undefined !== void 0
      ? _undefined
      : ((sideEffect = true), 'fallback');
  expect(result).toBe('fallback');
  expect(sideEffect).toBe(true);
};`,
  },
  {
    title: 'short-circuit evaluation > complex left side evaluated once with side effects',
    source: `() => {
        const calls = [];
        const obj = {
          get prop() {
            calls.push('get');
            return null;
          },
        };
        obj.prop ?? 'default';
        expect(calls.length).toBe(1);
      }`,
    output: `() => {
  var _obj$prop;
  const calls = [];
  const obj = {
    get prop() {
      calls.push('get');
      return null;
    },
  };
  (_obj$prop = obj.prop) !== null && _obj$prop !== void 0 ? _obj$prop : 'default';
  expect(calls.length).toBe(1);
};`,
  },
  {
    title: 'with assignment > assign result to variable',
    source: `() => {
        const x = null ?? 42;
        expect(x).toBe(42);
      }`,
    output: `() => {
  var _ref;
  const x = (_ref = null) !== null && _ref !== void 0 ? _ref : 42;
  expect(x).toBe(42);
};`,
  },
  {
    title: 'with assignment > assign with non-nullish left',
    source: `() => {
        const x = 0 ?? 42;
        expect(x).toBe(0);
      }`,
    output: `() => {
  var _;
  const x = (_ = 0) !== null && _ !== void 0 ? _ : 42;
  expect(x).toBe(0);
};`,
  },
  {
    title: 'with assignment > nullish coalescing assignment (??=)',
    source: `() => {
        let a = null;
        a ??= 'default';
        expect(a).toBe('default');
      }`,
    output: `() => {
  let a = null;
  a ??= 'default';
  expect(a).toBe('default');
};`,
  },
  {
    title: 'with assignment > ??= does not assign when non-nullish',
    source: `() => {
        let a = 0;
        a ??= 99;
        expect(a).toBe(0);
      }`,
    output: `() => {
  let a = 0;
  a ??= 99;
  expect(a).toBe(0);
};`,
  },
  {
    title: 'with assignment > ??= with undefined',
    source: `() => {
        let a = undefined;
        a ??= 'filled';
        expect(a).toBe('filled');
      }`,
    output: `() => {
  let a = undefined;
  a ??= 'filled';
  expect(a).toBe('filled');
};`,
  },
  {
    title: 'with assignment > ??= with false',
    source: `() => {
        let a = false;
        a ??= true;
        expect(a).toBe(false);
      }`,
    output: `() => {
  let a = false;
  a ??= true;
  expect(a).toBe(false);
};`,
  },
  {
    title: 'with assignment > ??= with empty string',
    source: `() => {
        let a = '';
        a ??= 'nonempty';
        expect(a).toBe('');
      }`,
    output: `() => {
  let a = '';
  a ??= 'nonempty';
  expect(a).toBe('');
};`,
  },
  {
    title: 'with assignment > ??= on object property',
    source: `() => {
        const obj = { a: null, b: 0 };
        obj.a ??= 'filled';
        obj.b ??= 99;
        expect(obj.a).toBe('filled');
        expect(obj.b).toBe(0);
      }`,
    output: `() => {
  const obj = {
    a: null,
    b: 0,
  };
  obj.a ??= 'filled';
  obj.b ??= 99;
  expect(obj.a).toBe('filled');
  expect(obj.b).toBe(0);
};`,
  },
  {
    title: 'with various types > object value preserved',
    source: `() => {
        const obj = { key: 'value' };
        expect((obj ?? {}).key).toBe('value');
      }`,
    output: `() => {
  const obj = { key: 'value' };
  expect((obj !== null && obj !== void 0 ? obj : {}).key).toBe('value');
};`,
  },
  {
    title: 'with various types > null falls through to object default',
    source: `() => {
        const result = null ?? { key: 'default' };
        expect(result.key).toBe('default');
      }`,
    output: `() => {
  var _ref;
  const result = (_ref = null) !== null && _ref !== void 0 ? _ref : { key: 'default' };
  expect(result.key).toBe('default');
};`,
  },
  {
    title: 'with various types > array value preserved',
    source: `() => {
        const arr = [1, 2, 3];
        const result = arr ?? [];
        expect(result.length).toBe(3);
      }`,
    output: `() => {
  const arr = [1, 2, 3];
  const result = arr !== null && arr !== void 0 ? arr : [];
  expect(result.length).toBe(3);
};`,
  },
  {
    title: 'with various types > function value preserved',
    source: `() => {
        const fn = () => 42;
        const result = fn ?? (() => 0);
        expect(result()).toBe(42);
      }`,
    output: `() => {
  const fn = () => 42;
  const result = fn !== null && fn !== void 0 ? fn : () => 0;
  expect(result()).toBe(42);
};`,
  },
  {
    title: 'with various types > symbol value preserved',
    source: `() => {
        const sym = Symbol('test');
        expect(sym ?? 'fallback').toBe(sym);
      }`,
    output: `() => {
  const sym = Symbol('test');
  expect(sym !== null && sym !== void 0 ? sym : 'fallback').toBe(sym);
};`,
  },
  {
    title: 'with various types > bigint value preserved',
    source: `() => {
        const big = BigInt(0);
        expect(big ?? 'fallback').toBe(big);
      }`,
    output: `() => {
  const big = BigInt(0);
  expect(big !== null && big !== void 0 ? big : 'fallback').toBe(big);
};`,
  },
  {
    title: 'with various types > regex value preserved',
    source: `() => {
        const re = /test/;
        expect(re ?? 'fallback').toBe(re);
      }`,
    output: `() => {
  const re = /test/;
  expect(re !== null && re !== void 0 ? re : 'fallback').toBe(re);
};`,
  },
  {
    title: 'with various types > Date value preserved',
    source: `() => {
        const date = new Date(0);
        expect(date ?? 'fallback').toBe(date);
      }`,
    output: `() => {
  const date = new Date(0);
  expect(date !== null && date !== void 0 ? date : 'fallback').toBe(date);
};`,
  },
  {
    title: 'with optional chaining > ?. producing undefined triggers ??',
    source: `() => {
        const obj = {};
        expect(obj.foo?.bar ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _obj$foo$bar;
  const obj = {};
  expect(
    (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',
  ).toBe('default');
};`,
  },
  {
    title: 'with optional chaining > ?. on null triggers ??',
    source: `() => {
        const obj = { foo: null };
        expect(obj.foo?.bar ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _obj$foo$bar;
  const obj = { foo: null };
  expect(
    (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',
  ).toBe('default');
};`,
  },
  {
    title: 'with optional chaining > ?. producing value does not trigger ??',
    source: `() => {
        const obj = { foo: { bar: 'value' } };
        expect(obj.foo?.bar ?? 'default').toBe('value');
      }`,
    output: `() => {
  var _obj$foo$bar;
  const obj = { foo: { bar: 'value' } };
  expect(
    (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 'default',
  ).toBe('value');
};`,
  },
  {
    title: 'with optional chaining > ?. producing 0 does not trigger ??',
    source: `() => {
        const obj = { foo: { bar: 0 } };
        expect(obj.foo?.bar ?? 99).toBe(0);
      }`,
    output: `() => {
  var _obj$foo$bar;
  const obj = { foo: { bar: 0 } };
  expect(
    (_obj$foo$bar = obj.foo?.bar) !== null && _obj$foo$bar !== void 0 ? _obj$foo$bar : 99,
  ).toBe(0);
};`,
  },
  {
    title: 'with optional chaining > deep optional chain with ??',
    source: `() => {
        const obj = { a: { b: { c: { d: null } } } };
        expect(obj.a?.b?.c?.d ?? 'default').toBe('default');
        expect(obj.a?.b?.c?.e ?? 'default').toBe('default');
        expect(obj.x?.y?.z ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _obj$a$b$c$d, _obj$a$b$c$e, _obj$x$y$z;
  const obj = { a: { b: { c: { d: null } } } };
  expect(
    (_obj$a$b$c$d = obj.a?.b?.c?.d) !== null && _obj$a$b$c$d !== void 0 ? _obj$a$b$c$d : 'default',
  ).toBe('default');
  expect(
    (_obj$a$b$c$e = obj.a?.b?.c?.e) !== null && _obj$a$b$c$e !== void 0 ? _obj$a$b$c$e : 'default',
  ).toBe('default');
  expect(
    (_obj$x$y$z = obj.x?.y?.z) !== null && _obj$x$y$z !== void 0 ? _obj$x$y$z : 'default',
  ).toBe('default');
};`,
  },
  {
    title: 'with optional chaining > optional method call with ??',
    source: `() => {
        const obj = { fn: () => null };
        expect(obj.fn?.() ?? 'default').toBe('default');
        expect(obj.missing?.() ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _obj$fn, _obj$missing;
  const obj = { fn: () => null };
  expect((_obj$fn = obj.fn?.()) !== null && _obj$fn !== void 0 ? _obj$fn : 'default').toBe(
    'default',
  );
  expect(
    (_obj$missing = obj.missing?.()) !== null && _obj$missing !== void 0 ? _obj$missing : 'default',
  ).toBe('default');
};`,
  },
  {
    title: 'in function parameters > default parameter with ??',
    source: `() => {
        function greet(name) {
          const displayName = name ?? 'stranger';
          return 'Hello, ' + displayName;
        }
        expect(greet('Alice')).toBe('Hello, Alice');
        expect(greet(null)).toBe('Hello, stranger');
        expect(greet(undefined)).toBe('Hello, stranger');
        expect(greet('')).toBe('Hello, ');
      }`,
    output: `() => {
  function greet(name) {
    const displayName = name !== null && name !== void 0 ? name : 'stranger';
    return 'Hello, ' + displayName;
  }
  expect(greet('Alice')).toBe('Hello, Alice');
  expect(greet(null)).toBe('Hello, stranger');
  expect(greet(undefined)).toBe('Hello, stranger');
  expect(greet('')).toBe('Hello, ');
};`,
  },
  {
    title: 'in function parameters > multiple parameters with ??',
    source: `() => {
        function config(host, port, secure) {
          return {
            host: host ?? 'localhost',
            port: port ?? 3000,
            secure: secure ?? false,
          };
        }
        const c = config(null, 0, undefined);
        expect(c.host).toBe('localhost');
        expect(c.port).toBe(0);
        expect(c.secure).toBe(false);
      }`,
    output: `() => {
  function config(host, port, secure) {
    return {
      host: host !== null && host !== void 0 ? host : 'localhost',
      port: port !== null && port !== void 0 ? port : 3e3,
      secure: secure !== null && secure !== void 0 ? secure : false,
    };
  }
  const c = config(null, 0, undefined);
  expect(c.host).toBe('localhost');
  expect(c.port).toBe(0);
  expect(c.secure).toBe(false);
};`,
  },
  {
    title: 'in function parameters > arrow function with ??',
    source: `() => {
        const getVal = (x) => x ?? 'default';
        expect(getVal(null)).toBe('default');
        expect(getVal(0)).toBe(0);
      }`,
    output: `() => {
  const getVal = x => (x !== null && x !== void 0 ? x : 'default');
  expect(getVal(null)).toBe('default');
  expect(getVal(0)).toBe(0);
};`,
  },
  {
    title: 'in expressions > ternary on left side',
    source: `() => {
        const x = true ? null : 'value';
        expect(x ?? 'default').toBe('default');
      }`,
    output: `() => {
  const x = true ? null : 'value';
  expect(x !== null && x !== void 0 ? x : 'default').toBe('default');
};`,
  },
  {
    title: 'in expressions > arithmetic on right side',
    source: `() => {
        const x = null ?? 2 + 3;
        expect(x).toBe(5);
      }`,
    output: `() => {
  var _ref;
  const x = (_ref = null) !== null && _ref !== void 0 ? _ref : 2 + 3;
  expect(x).toBe(5);
};`,
  },
  {
    title: 'in expressions > template literal on right side',
    source: `() => {
        const name = null ?? \`world\`;
        expect(name).toBe('world');
      }`,
    output: `() => {
  var _ref;
  const name = (_ref = null) !== null && _ref !== void 0 ? _ref : \`world\`;
  expect(name).toBe('world');
};`,
  },
  {
    title: 'in expressions > nested ?? in right side',
    source: `() => {
        const a = null;
        const b = undefined;
        const c = 'found';
        expect(a ?? b ?? c).toBe('found');
      }`,
    output: `() => {
  var _ref;
  const a = null;
  const b = undefined;
  const c = 'found';
  expect((_ref = a !== null && a !== void 0 ? a : b) !== null && _ref !== void 0 ? _ref : c).toBe(
    'found',
  );
};`,
  },
  {
    title: 'in expressions > in return statement',
    source: `() => {
        function getValue(obj) {
          return obj.value ?? 'empty';
        }
        expect(getValue({ value: null })).toBe('empty');
        expect(getValue({ value: 0 })).toBe(0);
      }`,
    output: `() => {
  function getValue(obj) {
    var _obj$value;
    return (_obj$value = obj.value) !== null && _obj$value !== void 0 ? _obj$value : 'empty';
  }
  expect(getValue({ value: null })).toBe('empty');
  expect(getValue({ value: 0 })).toBe(0);
};`,
  },
  {
    title: 'in expressions > in throw expression right side',
    source: `() => {
        const val = null;
        try {
          const result =
            val ??
            (() => {
              throw new Error('nullish');
            })();
          // Should have thrown
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toBe('nullish');
        }
      }`,
    output: `() => {
  const val = null;
  try {
    const result =
      val !== null && val !== void 0
        ? val
        : (() => {
            throw new Error('nullish');
          })();
    // Should have thrown
    expect(true).toBe(false);
  } catch (e) {
    expect(e.message).toBe('nullish');
  }
};`,
  },
  {
    title: 'in destructuring > with destructured property',
    source: `() => {
        const { a } = { a: null };
        expect(a ?? 'default').toBe('default');
      }`,
    output: `() => {
  const { a } = { a: null };
  expect(a !== null && a !== void 0 ? a : 'default').toBe('default');
};`,
  },
  {
    title: 'in destructuring > with default destructuring vs ??',
    source: `() => {
        // Default destructuring only triggers on undefined, not null
        const { a = 'destructure-default' } = { a: null };
        // a is null because destructuring default only applies on undefined
        expect(a).toBe(null);
        expect(a ?? 'nullish-default').toBe('nullish-default');
      }`,
    output: `() => {
  // Default destructuring only triggers on undefined, not null
  const { a = 'destructure-default' } = { a: null };
  // a is null because destructuring default only applies on undefined
  expect(a).toBe(null);
  expect(a !== null && a !== void 0 ? a : 'nullish-default').toBe('nullish-default');
};`,
  },
  {
    title: 'in destructuring > with array destructuring',
    source: `() => {
        const [a, b] = [null, undefined];
        expect(a ?? 'first').toBe('first');
        expect(b ?? 'second').toBe('second');
      }`,
    output: `() => {
  const [a, b] = [null, undefined];
  expect(a !== null && a !== void 0 ? a : 'first').toBe('first');
  expect(b !== null && b !== void 0 ? b : 'second').toBe('second');
};`,
  },
  {
    title: 'in loops and conditionals > in if condition',
    source: `() => {
        const x = null;
        const val = x ?? 0;
        if (val === 0) {
          expect(true).toBe(true);
        } else {
          expect(true).toBe(false);
        }
      }`,
    output: `() => {
  const x = null;
  const val = x !== null && x !== void 0 ? x : 0;
  if (val === 0) {
    expect(true).toBe(true);
  } else {
    expect(true).toBe(false);
  }
};`,
  },
  {
    title: 'in loops and conditionals > in for loop initializer',
    source: `() => {
        const values = [];
        for (let i = null ?? 0; i < 3; i++) {
          values.push(i);
        }
        expect(values).toEqual([0, 1, 2]);
      }`,
    output: `() => {
  var _ref;
  const values = [];
  for (let i = (_ref = null) !== null && _ref !== void 0 ? _ref : 0; i < 3; i++) {
    values.push(i);
  }
  expect(values).toEqual([0, 1, 2]);
};`,
  },
  {
    title: 'in loops and conditionals > in while condition',
    source: `() => {
        let arr = [1, 2, null, 3];
        let results = [];
        let idx = 0;
        while (idx < arr.length) {
          results.push(arr[idx] ?? 'nil');
          idx++;
        }
        expect(results).toEqual([1, 2, 'nil', 3]);
      }`,
    output: `() => {
  let arr = [1, 2, null, 3];
  let results = [];
  let idx = 0;
  while (idx < arr.length) {
    var _arr$idx;
    results.push((_arr$idx = arr[idx]) !== null && _arr$idx !== void 0 ? _arr$idx : 'nil');
    idx++;
  }
  expect(results).toEqual([1, 2, 'nil', 3]);
};`,
  },
  {
    title: 'class contexts > in class method',
    source: `() => {
        class Config {
          constructor(value) {
            this.value = value ?? 'default';
          }
          getValue() {
            return this.value ?? 'none';
          }
        }
        expect(new Config(null).value).toBe('default');
        expect(new Config(0).value).toBe(0);
        expect(new Config(null).getValue()).toBe('default');
      }`,
    output: `() => {
  class Config {
    constructor(value) {
      this.value = value !== null && value !== void 0 ? value : 'default';
    }
    getValue() {
      var _this$value;
      return (_this$value = this.value) !== null && _this$value !== void 0 ? _this$value : 'none';
    }
  }
  expect(new Config(null).value).toBe('default');
  expect(new Config(0).value).toBe(0);
  expect(new Config(null).getValue()).toBe('default');
};`,
  },
  {
    title: 'class contexts > in static method',
    source: `() => {
        class Utils {
          static getDefault(val) {
            return val ?? 'default';
          }
        }
        expect(Utils.getDefault(null)).toBe('default');
        expect(Utils.getDefault('')).toBe('');
      }`,
    output: `() => {
  class Utils {
    static getDefault(val) {
      return val !== null && val !== void 0 ? val : 'default';
    }
  }
  expect(Utils.getDefault(null)).toBe('default');
  expect(Utils.getDefault('')).toBe('');
};`,
  },
  {
    title: 'class contexts > in getter',
    source: `() => {
        class Box {
          #value;
          constructor(v) {
            this.#value = v;
          }
          get content() {
            return this.#value ?? 'empty';
          }
        }
        expect(new Box(null).content).toBe('empty');
        expect(new Box(0).content).toBe(0);
        expect(new Box(false).content).toBe(false);
      }`,
    output: `() => {
  class Box {
    #value;
    constructor(v) {
      this.#value = v;
    }
    get content() {
      var _this$value;
      return (_this$value = this.#value) !== null && _this$value !== void 0 ? _this$value : 'empty';
    }
  }
  expect(new Box(null).content).toBe('empty');
  expect(new Box(0).content).toBe(0);
  expect(new Box(false).content).toBe(false);
};`,
  },
  {
    title: 'edge cases > both sides are null',
    source: `() => {
        expect(null ?? null).toBe(null);
      }`,
    output: `() => {
  var _ref;
  expect((_ref = null) !== null && _ref !== void 0 ? _ref : null).toBe(null);
};`,
  },
  {
    title: 'edge cases > both sides are undefined',
    source: `() => {
        expect(undefined ?? undefined).toBe(undefined);
      }`,
    output: `() => {
  var _undefined;
  expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : undefined).toBe(
    undefined,
  );
};`,
  },
  {
    title: 'edge cases > right side is null',
    source: `() => {
        expect(undefined ?? null).toBe(null);
      }`,
    output: `() => {
  var _undefined;
  expect((_undefined = undefined) !== null && _undefined !== void 0 ? _undefined : null).toBe(null);
};`,
  },
  {
    title: 'edge cases > left side is an expression returning null',
    source: `() => {
        expect((1 > 2 ? 'yes' : null) ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _ref;
  expect((_ref = 1 > 2 ? 'yes' : null) !== null && _ref !== void 0 ? _ref : 'default').toBe(
    'default',
  );
};`,
  },
  {
    title: 'edge cases > works with comma operator',
    source: `() => {
        let x;
        const result = ((x = null), x) ?? 'default';
        expect(result).toBe('default');
      }`,
    output: `() => {
  var _ref;
  let x;
  const result = (_ref = ((x = null), x)) !== null && _ref !== void 0 ? _ref : 'default';
  expect(result).toBe('default');
};`,
  },
  {
    title: 'edge cases > typeof does not throw for undeclared variable in right side',
    source: `() => {
        const result = 'value' ?? undeclaredVar;
        expect(result).toBe('value');
      }`,
    output: `() => {
  var _value;
  const result = (_value = 'value') !== null && _value !== void 0 ? _value : undeclaredVar;
  expect(result).toBe('value');
};`,
  },
  {
    title: 'edge cases > deeply nested nullish coalescing',
    source: `() => {
        const a = null ?? null ?? null ?? null ?? 'deep';
        expect(a).toBe('deep');
      }`,
    output: `() => {
  var _ref, _ref2, _ref3, _ref4;
  const a =
    (_ref =
      (_ref2 =
        (_ref3 = (_ref4 = null) !== null && _ref4 !== void 0 ? _ref4 : null) !== null &&
        _ref3 !== void 0
          ? _ref3
          : null) !== null && _ref2 !== void 0
        ? _ref2
        : null) !== null && _ref !== void 0
      ? _ref
      : 'deep';
  expect(a).toBe('deep');
};`,
  },
  {
    title: 'edge cases > with Map.get()',
    source: `() => {
        const map = new Map();
        map.set('key', 0);
        expect(map.get('key') ?? 'default').toBe(0);
        expect(map.get('missing') ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _map$get, _map$get2;
  const map = new Map();
  map.set('key', 0);
  expect((_map$get = map.get('key')) !== null && _map$get !== void 0 ? _map$get : 'default').toBe(
    0,
  );
  expect(
    (_map$get2 = map.get('missing')) !== null && _map$get2 !== void 0 ? _map$get2 : 'default',
  ).toBe('default');
};`,
  },
  {
    title: 'edge cases > with WeakRef deref',
    source: `() => {
        let obj = { name: 'test' };
        const ref = new WeakRef(obj);
        expect(ref.deref() ?? 'collected').toBe(obj);
      }`,
    output: `() => {
  var _ref$deref;
  let obj = { name: 'test' };
  const ref = new WeakRef(obj);
  expect(
    (_ref$deref = ref.deref()) !== null && _ref$deref !== void 0 ? _ref$deref : 'collected',
  ).toBe(obj);
};`,
  },
  {
    title: 'edge cases > preserves object identity',
    source: `() => {
        const obj = {};
        const result = obj ?? {};
        expect(result).toBe(obj);
      }`,
    output: `() => {
  const obj = {};
  const result = obj !== null && obj !== void 0 ? obj : {};
  expect(result).toBe(obj);
};`,
  },
  {
    title: 'practical patterns > config merging with ??',
    source: `() => {
        const defaults = { host: 'localhost', port: 3000, debug: false };
        const userConfig = { host: null, port: 8080, debug: undefined };
        const config = {
          host: userConfig.host ?? defaults.host,
          port: userConfig.port ?? defaults.port,
          debug: userConfig.debug ?? defaults.debug,
        };
        expect(config.host).toBe('localhost');
        expect(config.port).toBe(8080);
        expect(config.debug).toBe(false);
      }`,
    output: `() => {
  var _userConfig$host, _userConfig$port, _userConfig$debug;
  const defaults = {
    host: 'localhost',
    port: 3e3,
    debug: false,
  };
  const userConfig = {
    host: null,
    port: 8080,
    debug: undefined,
  };
  const config = {
    host:
      (_userConfig$host = userConfig.host) !== null && _userConfig$host !== void 0
        ? _userConfig$host
        : defaults.host,
    port:
      (_userConfig$port = userConfig.port) !== null && _userConfig$port !== void 0
        ? _userConfig$port
        : defaults.port,
    debug:
      (_userConfig$debug = userConfig.debug) !== null && _userConfig$debug !== void 0
        ? _userConfig$debug
        : defaults.debug,
  };
  expect(config.host).toBe('localhost');
  expect(config.port).toBe(8080);
  expect(config.debug).toBe(false);
};`,
  },
  {
    title: 'practical patterns > safe access with fallback',
    source: `() => {
        const response = { data: { users: null } };
        const users = response.data?.users ?? [];
        expect(users).toEqual([]);
      }`,
    output: `() => {
  var _response$data$users;
  const response = { data: { users: null } };
  const users =
    (_response$data$users = response.data?.users) !== null && _response$data$users !== void 0
      ? _response$data$users
      : [];
  expect(users).toEqual([]);
};`,
  },
  {
    title: 'practical patterns > counting with zero preservation',
    source: `() => {
        function getCount(obj) {
          return obj.count ?? -1;
        }
        expect(getCount({ count: 0 })).toBe(0);
        expect(getCount({ count: 10 })).toBe(10);
        expect(getCount({})).toBe(-1);
      }`,
    output: `() => {
  function getCount(obj) {
    var _obj$count;
    return (_obj$count = obj.count) !== null && _obj$count !== void 0 ? _obj$count : -1;
  }
  expect(getCount({ count: 0 })).toBe(0);
  expect(getCount({ count: 10 })).toBe(10);
  expect(getCount({})).toBe(-1);
};`,
  },
  {
    title: 'practical patterns > DOM-style attribute defaults',
    source: `() => {
        const attrs = { tabIndex: 0, disabled: false, id: '' };
        expect(attrs.tabIndex ?? -1).toBe(0);
        expect(attrs.disabled ?? false).toBe(false);
        expect(attrs.id ?? 'auto').toBe('');
        expect(attrs.className ?? 'default').toBe('default');
      }`,
    output: `() => {
  var _attrs$tabIndex, _attrs$disabled, _attrs$id, _attrs$className;
  const attrs = {
    tabIndex: 0,
    disabled: false,
    id: '',
  };
  expect(
    (_attrs$tabIndex = attrs.tabIndex) !== null && _attrs$tabIndex !== void 0
      ? _attrs$tabIndex
      : -1,
  ).toBe(0);
  expect(
    (_attrs$disabled = attrs.disabled) !== null && _attrs$disabled !== void 0
      ? _attrs$disabled
      : false,
  ).toBe(false);
  expect((_attrs$id = attrs.id) !== null && _attrs$id !== void 0 ? _attrs$id : 'auto').toBe('');
  expect(
    (_attrs$className = attrs.className) !== null && _attrs$className !== void 0
      ? _attrs$className
      : 'default',
  ).toBe('default');
};`,
  },
  {
    title: 'practical patterns > nested defaults',
    source: `() => {
        function getTheme(prefs) {
          return {
            color: prefs?.theme?.color ?? prefs?.color ?? 'blue',
            size: prefs?.theme?.size ?? 16,
          };
        }
        expect(getTheme(null).color).toBe('blue');
        expect(getTheme({ color: 'red' }).color).toBe('red');
        expect(getTheme({ theme: { color: 'green' } }).color).toBe('green');
        expect(getTheme({}).size).toBe(16);
      }`,
    output: `() => {
  function getTheme(prefs) {
    var _ref, _prefs$theme$color, _prefs$theme$size;
    return {
      color:
        (_ref =
          (_prefs$theme$color = prefs?.theme?.color) !== null && _prefs$theme$color !== void 0
            ? _prefs$theme$color
            : prefs?.color) !== null && _ref !== void 0
          ? _ref
          : 'blue',
      size:
        (_prefs$theme$size = prefs?.theme?.size) !== null && _prefs$theme$size !== void 0
          ? _prefs$theme$size
          : 16,
    };
  }
  expect(getTheme(null).color).toBe('blue');
  expect(getTheme({ color: 'red' }).color).toBe('red');
  expect(getTheme({ theme: { color: 'green' } }).color).toBe('green');
  expect(getTheme({}).size).toBe(16);
};`,
  },
  {
    title: 'practical patterns > error message fallback',
    source: `() => {
        function getErrorMessage(error) {
          return error?.message ?? error?.code ?? 'Unknown error';
        }
        expect(getErrorMessage({ message: 'Not found' })).toBe('Not found');
        expect(getErrorMessage({ code: 404 })).toBe(404);
        expect(getErrorMessage({})).toBe('Unknown error');
        expect(getErrorMessage(null)).toBe('Unknown error');
      }`,
    output: `() => {
  function getErrorMessage(error) {
    var _ref, _error$message;
    return (_ref =
      (_error$message = error?.message) !== null && _error$message !== void 0
        ? _error$message
        : error?.code) !== null && _ref !== void 0
      ? _ref
      : 'Unknown error';
  }
  expect(getErrorMessage({ message: 'Not found' })).toBe('Not found');
  expect(getErrorMessage({ code: 404 })).toBe(404);
  expect(getErrorMessage({})).toBe('Unknown error');
  expect(getErrorMessage(null)).toBe('Unknown error');
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
