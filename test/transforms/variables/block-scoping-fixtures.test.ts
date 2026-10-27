import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'const violations — assignment expression (exec)',
    source: `const state1 = {};
expect(function() {
  const a = 3;
  let b = 1;
  state1.getA = () => a;
  state1.getB = () => b;

  a += b++;
}).toThrow('"a" is read-only');
expect(state1.getA()).toBe(3); // Assignment did not succeed
expect(state1.getB()).toBe(2); // \`b++\` was evaluated before error thrown

const state2 = {};
expect(function() {
  const a = {
    valueOf() {
      state2.valueOfIsCalled = true;
    }
  };
  state2.a = a;
  state2.getA = () => a;
  state2.getB = () => b;

  let b = 1;
  a += b++;
}).toThrow('"a" is read-only');
expect(state2.getA()).toBe(state2.a); // Assignment did not succeed
expect(state2.getB()).toBe(2); // \`b++\` was evaluated before error thrown
expect(state2.valueOfIsCalled).toBe(true); // \`a\` was read before error thrown

const state3 = {};
expect(function() {
  const a = 32;
  let b = 1;
  state3.getA = () => a;
  state3.getB = () => b;

  a >>>= ++b;
}).toThrow('"a" is read-only');
expect(state3.getA()).toBe(32); // Assignment did not succeed
expect(state3.getB()).toBe(2); // \`++b\` was evaluated before error thrown

const state4 = {};
expect(function() {
  const a = 1;
  let b = 1;
  state4.getA = () => a;
  state4.getB = () => b;

  a &&= ++b;
}).toThrow('"a" is read-only');
expect(state4.getA()).toBe(1); // Assignment did not succeed
expect(state4.getB()).toBe(2); // \`++b\` was evaluated before error thrown

{
  const a = 1;
  let b = 1;
  a ||= ++b;

  expect(a).toBe(1); // Assignment not made
  expect(b).toBe(1); // \`++b\` was not evaluated
}
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var state1 = {};
expect(function () {
  var a = 3;
  var b = 1;
  state1.getA = () => a;
  state1.getB = () => b;
  ((_readOnlyValue = a), (_readOnlyValue += b++), _readOnlyError('a'));
}).toThrow('"a" is read-only');
expect(state1.getA()).toBe(3);
expect(state1.getB()).toBe(2);
var state2 = {};
expect(function () {
  var a = {
    valueOf() {
      state2.valueOfIsCalled = true;
    },
  };
  state2.a = a;
  state2.getA = () => a;
  state2.getB = () => b;
  var b = 1;
  ((_readOnlyValue = a), (_readOnlyValue += b++), _readOnlyError('a'));
}).toThrow('"a" is read-only');
expect(state2.getA()).toBe(state2.a);
expect(state2.getB()).toBe(2);
expect(state2.valueOfIsCalled).toBe(true);
var state3 = {};
expect(function () {
  var a = 32;
  var b = 1;
  state3.getA = () => a;
  state3.getB = () => b;
  ((_readOnlyValue = a), (_readOnlyValue >>>= ++b), _readOnlyError('a'));
}).toThrow('"a" is read-only');
expect(state3.getA()).toBe(32);
expect(state3.getB()).toBe(2);
var state4 = {};
expect(function () {
  var a = 1;
  var b = 1;
  state4.getA = () => a;
  state4.getB = () => b;
  ((_readOnlyValue = a), (_readOnlyValue &&= (++b, _readOnlyError('a'))));
}).toThrow('"a" is read-only');
expect(state4.getA()).toBe(1);
expect(state4.getB()).toBe(2);
{
  var a = 1;
  var b = 1;
  ((_readOnlyValue = a), (_readOnlyValue ||= (++b, _readOnlyError('a'))));
  expect(a).toBe(1);
  expect(b).toBe(1);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — assignment expression (input)',
    source: `const a = 5;
let b = 0;
a += b++;
a >>>= b++;
a ||= b++;
a &&= b++;
a ??= b++;
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var a = 5;
var b = 0;
((_readOnlyValue = a), (_readOnlyValue += b++), _readOnlyError('a'));
((_readOnlyValue = a), (_readOnlyValue >>>= b++), _readOnlyError('a'));
((_readOnlyValue = a), (_readOnlyValue ||= (b++, _readOnlyError('a'))));
((_readOnlyValue = a), (_readOnlyValue &&= (b++, _readOnlyError('a'))));
((_readOnlyValue = a), (_readOnlyValue ??= (b++, _readOnlyError('a'))));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — assignment in for loop (exec)',
    source: `expect(function () {
    for (const element = 1; element++;) break;
}).toThrow('"element" is read-only');

expect(function () {
    for (;;) {
        const from = 50;
        from--;
        break;
    }
}).toThrow('"from" is read-only');
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
expect(function () {
  for (var element = 1; (_readOnlyValue = element), _readOnlyValue++, _readOnlyError('element');)
    break;
}).toThrow('"element" is read-only');
expect(function () {
  for (;;) {
    var from = 50;
    ((_readOnlyValue = from), _readOnlyValue--, _readOnlyError('from'));
    break;
  }
}).toThrow('"from" is read-only');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — assignment in for loop (input)',
    source: `for (const element = 1; element++;) {
  const from = 50;
  from--;
}
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
for (var element = 1; (_readOnlyValue = element), _readOnlyValue++, _readOnlyError('element');) {
  var from = 50;
  ((_readOnlyValue = from), _readOnlyValue--, _readOnlyError('from'));
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — assignment in for of loop (exec)',
    source: `expect(function () {
    const array = [1, 2, 3];
    for (const element of array) {
        const from = 50;
        from--;
    }
}).toThrow('"from" is read-only');`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
expect(function () {
  var array = [1, 2, 3];
  for (var element of array) {
    var from = 50;
    ((_readOnlyValue = from), _readOnlyValue--, _readOnlyError('from'));
  }
}).toThrow('"from" is read-only');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — assignment in for of loop (input)',
    source: `for (const element of []) {
  const from = 50;
  from--;
}
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
for (var element of []) {
  var from = 50;
  ((_readOnlyValue = from), _readOnlyValue--, _readOnlyError('from'));
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — block scoped (exec)',
    source: `const bar = 123;
{ const bar = 456; }
expect(bar).toBe(123);
`,
    filename: 'exec.js',
    output: `var bar = 123;
{
  var _bar = 456;
}
expect(bar).toBe(123);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — block statement (input)',
    source: `for (let i in arr) {
  const MULTIPLIER = 5;
  console.log(arr[i] * MULTIPLIER);
}
`,
    filename: 'input.js',
    output: `for (var i in arr) {
  var MULTIPLIER = 5;
  console.log(arr[i] * MULTIPLIER);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — deadcode violation (exec)',
    source: `function f() {
  const a = "foo";

  if (false) a = "false";

  return a;
}

expect(f()).toBe("foo");
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
function f() {
  var a = 'foo';
  if (false) ('false', _readOnlyError('a'));
  return a;
}
expect(f()).toBe('foo');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — deadcode violation (input)',
    source: `(function(){
  const a = "foo";

  if (false) a = "false";

  return a;
})();
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
(function () {
  var a = 'foo';
  if (false) ('false', _readOnlyError('a'));
  return a;
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — destructuring assignment (exec)',
    source: `expect(function() {
  const [a, b] = [1, 2];
  a = 3;
}).toThrow('"a" is read-only');

expect(function() {
  const a = 1;
  [a] = [2];
}).toThrow('"a" is read-only');

expect(function() {
  const b = 1;
  ({b} = {b: 2});
}).toThrow('"b" is read-only');
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
expect(function () {
  var [a, b] = [1, 2];
  (3, _readOnlyError('a'));
}).toThrow('"a" is read-only');
expect(function () {
  var a = 1;
  ([2], _readOnlyError('a'));
}).toThrow('"a" is read-only');
expect(function () {
  var b = 1;
  ({ b: 2 }, _readOnlyError('b'));
}).toThrow('"b" is read-only');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — destructuring assignment (input)',
    source: `const [a, b] = [1, 2];
a = 3;
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var [a, b] = [1, 2];
(3, _readOnlyError('a'));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — destructuring (input)',
    source: `const [a, b] = [1, 2];
const [c, d] = [3, 4];
const { e, f } = { e: 5, f: 6 };
const { a: g, b: h } = { a: 7, b: 8 };
`,
    filename: 'input.js',
    output: `var [a, b] = [1, 2];
var [c, d] = [3, 4];
var { e, f } = {
  e: 5,
  f: 6,
};
var { a: g, b: h } = {
  a: 7,
  b: 8,
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — flow declar (input)',
    source: `// @flow
declare class foo {}
const foo1 = 1;
`,
    filename: 'input.js',
    output: `// @flow
var foo1 = 1;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — ignore member expressions (input)',
    source: `const x = {};
x.key = "value";
`,
    filename: 'input.js',
    output: `var x = {};
x.key = 'value';`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — loop (exec)',
    source: `expect(function() {
  for (const i = 0; i < 3; i = i + 1) {
    // whatever
  }
}).toThrow('"i" is read-only');
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
expect(function () {
  for (var i = 0; i < 3; i + 1, _readOnlyError('i')) {}
}).toThrow('"i" is read-only');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — loop (input)',
    source: `for (const i = 0; i < 3; i = i + 1) {
  console.log(i);
}

for (const j = 0; j < 3; j++) {
  console.log(j);
}
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
for (var i = 0; i < 3; i + 1, _readOnlyError('i')) {
  console.log(i);
}
for (var j = 0; j < 3; _readOnlyValue = j, _readOnlyValue++, _readOnlyError('j')) {
  console.log(j);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — nested update expressions (exec)',
    source: `expect(function() {
  const c = 17;
  let a = 0;

  function f() {
    return ++c+--a;
  }

  f();

}).toThrow('"c" is read-only');
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
expect(function () {
  var c = 17;
  var a = 0;
  function f() {
    return ((_readOnlyValue = c), ++_readOnlyValue, _readOnlyError('c')) + --a;
  }
  f();
}).toThrow('"c" is read-only');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — nested update expressions (input)',
    source: `const c = 17;
let a = 0;

function f() {
  return ++c+--a;
}
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var c = 17;
var a = 0;
function f() {
  return ((_readOnlyValue = c), ++_readOnlyValue, _readOnlyError('c')) + --a;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — no assignment (exec)',
    source: `const state1 = {};
expect(function() {
  const a = 3;
  state1.getA = () => a;

  a = 7;
}).toThrow('"a" is read-only');
expect(state1.getA()).toBe(3); // Assignment did not succeed

const state2 = {};
expect(function() {
  const a = 3;
  let b = 0;
  state2.getA = () => a;
  state2.getB = () => b;

  a = b++;
}).toThrow('"a" is read-only');
expect(state2.getA()).toBe(3); // Assignment did not succeed
expect(state2.getB()).toBe(1); // \`b++\` was evaluated before error thrown
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var state1 = {};
expect(function () {
  var a = 3;
  state1.getA = () => a;
  (7, _readOnlyError('a'));
}).toThrow('"a" is read-only');
expect(state1.getA()).toBe(3);
var state2 = {};
expect(function () {
  var a = 3;
  var b = 0;
  state2.getA = () => a;
  state2.getB = () => b;
  (b++, _readOnlyError('a'));
}).toThrow('"a" is read-only');
expect(state2.getA()).toBe(3);
expect(state2.getB()).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — no assignment (input)',
    source: `const MULTIPLIER = 5;
MULTIPLIER = "overwrite";

const a = 5;
let b = 0;
a = b++;
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var MULTIPLIER = 5;
('overwrite', _readOnlyError('MULTIPLIER'));
var a = 5;
var b = 0;
(b++, _readOnlyError('a'));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — no for in (exec)',
    source: `const state = {};
function f(arr) {
  const MULTIPLIER = 5;
  state.getMultiplier = () => MULTIPLIER;

  for (MULTIPLIER in arr);

  return 'survived';
}

expect(function() {
  f([1,2,3]);
}).toThrow('"MULTIPLIER" is read-only');
expect(state.getMultiplier()).toBe(5); // Assignment did not succeed

expect(f([])).toBe('survived');
`,
    filename: 'exec.js',
    output: `var state = {};
function f(arr) {
  var MULTIPLIER = 5;
  state.getMultiplier = () => MULTIPLIER;
  for (MULTIPLIER in arr);
  return 'survived';
}
expect(function () {
  f([1, 2, 3]);
}).toThrow('"MULTIPLIER" is read-only');
expect(state.getMultiplier()).toBe(5);
expect(f([])).toBe('survived');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — no for in (input)',
    source: `const MULTIPLIER = 5;

for (MULTIPLIER in arr);
`,
    filename: 'input.js',
    output: `var MULTIPLIER = 5;
for (MULTIPLIER in arr);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — program (input)',
    source: `const MULTIPLIER = 5;

for (var i in arr) {
  console.log(arr[i] * MULTIPLIER);
}
`,
    filename: 'input.js',
    output: `var MULTIPLIER = 5;
for (var i in arr) {
  console.log(arr[i] * MULTIPLIER);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — shadowing function declaration (input)',
    source: `function B() {
  const B = 1;
}
`,
    filename: 'input.js',
    output: `function B() {
  var _B = 1;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — shadowing function expression (input)',
    source: `(function B() {
  const B = 1;
});
`,
    filename: 'input.js',
    output: `(function B() {
  var _B = 1;
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — update expression prefix (exec)',
    source: `const state1 = {};
expect(function() {
  const a = "str";
  state1.getA = () => a;

  --a;
}).toThrow('"a" is read-only');
expect(state1.getA()).toBe("str"); // Assignment did not succeed

const state2 = {};
expect(function() {
  const b = {
    valueOf() {
      state2.valueOfIsCalled = true;
    }
  };
  state2.b = b;
  state2.getB = () => b;

  --b;
}).toThrow('"b" is read-only');
expect(state2.getB()).toBe(state2.b); // Assignment did not succeed
expect(state2.valueOfIsCalled).toBe(true); // \`bar\` was read before error thrown
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var state1 = {};
expect(function () {
  var a = 'str';
  state1.getA = () => a;
  ((_readOnlyValue = a), --_readOnlyValue, _readOnlyError('a'));
}).toThrow('"a" is read-only');
expect(state1.getA()).toBe('str');
var state2 = {};
expect(function () {
  var b = {
    valueOf() {
      state2.valueOfIsCalled = true;
    },
  };
  state2.b = b;
  state2.getB = () => b;
  ((_readOnlyValue = b), --_readOnlyValue, _readOnlyError('b'));
}).toThrow('"b" is read-only');
expect(state2.getB()).toBe(state2.b);
expect(state2.valueOfIsCalled).toBe(true);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — update expression prefix (input)',
    source: `const a = "str";
--a;
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var a = 'str';
((_readOnlyValue = a), --_readOnlyValue, _readOnlyError('a'));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — update expression (exec)',
    source: `const state1 = {};
expect(function() {
  const foo = 1;
  state1.getFoo = () => foo;

  foo++;
}).toThrow('"foo" is read-only');
expect(state1.getFoo()).toBe(1); // Assignment did not succeed

const state2 = {};
expect(function() {
  const bar = {
    valueOf() {
      state2.valueOfIsCalled = true;
    }
  };
  state2.bar = bar;
  state2.getBar = () => bar;

  bar++;
}).toThrow('"bar" is read-only');
expect(state2.getBar()).toBe(state2.bar); // Assignment did not succeed
expect(state2.valueOfIsCalled).toBe(true); // \`bar\` was read before error thrown
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var state1 = {};
expect(function () {
  var foo = 1;
  state1.getFoo = () => foo;
  ((_readOnlyValue = foo), _readOnlyValue++, _readOnlyError('foo'));
}).toThrow('"foo" is read-only');
expect(state1.getFoo()).toBe(1);
var state2 = {};
expect(function () {
  var bar = {
    valueOf() {
      state2.valueOfIsCalled = true;
    },
  };
  state2.bar = bar;
  state2.getBar = () => bar;
  ((_readOnlyValue = bar), _readOnlyValue++, _readOnlyError('bar'));
}).toThrow('"bar" is read-only');
expect(state2.getBar()).toBe(state2.bar);
expect(state2.valueOfIsCalled).toBe(true);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'const violations — update expression (input)',
    source: `const foo = 1;
foo++;
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
var foo = 1;
((_readOnlyValue = foo), _readOnlyValue++, _readOnlyError('foo'));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 async generator (input)',
    source: `// NOTE: When compiling async generators,
// we run the async-generator-functions transform
// as soon as in Program:enter, so when the block-scoping plugin
// runs it has already been transpiled to a plain function.
// The functions is thus visible to the outer scope.
// This is a bug.

if (true) {
  async function* run() {
    return true;
  }
}

function test() {
  return run();
}
`,
    filename: 'input.js',
    output: `// NOTE: When compiling async generators,
// we run the async-generator-functions transform
// as soon as in Program:enter, so when the block-scoping plugin
// runs it has already been transpiled to a plain function.
// The functions is thus visible to the outer scope.
// This is a bug.

if (true) {
  async function* run() {
    return true;
  }
}

function test() {
  return run();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 async (input)',
    source: `if (true) {
  async function run() {
    return true;
  }
}

function test() {
  return run();
}
`,
    filename: 'input.js',
    output: `if (true) {
  async function run() {
    return true;
  }
}

function test() {
  return run();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 collision const (input)',
    source: `const run = function () {
  return false;
};

if (true) {
  function run() {
    return true;
  }
}

function test() {
  return run();
}
`,
    filename: 'input.js',
    output: `var run = function () {
  return false;
};
if (true) {
  function run() {
    return true;
  }
}
function test() {
  return run();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 collision let (input)',
    source: `let run = function () {
  return false;
};

if (true) {
  function run() {
    return true;
  }
}

function test() {
  return run();
}
`,
    filename: 'input.js',
    output: `var run = function () {
  return false;
};
if (true) {
  function run() {
    return true;
  }
}
function test() {
  return run();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 collision var (input)',
    source: `var run = function () {
  return false;
};

if (true) {
  function run() {
    return true;
  }
}

function test() {
  return run();
}
`,
    filename: 'input.js',
    output: `var run = function () {
  return false;
};

if (true) {
  function run() {
    return true;
  }
}

function test() {
  return run();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 generator (input)',
    source: `if (true) {
  function* run() {
    return true;
  }
}

function test() {
  return run();
}
`,
    filename: 'input.js',
    output: `if (true) {
  function* run() {
    return true;
  }
}

function test() {
  return run();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 in class (exec)',
    source: `class A {
  m() {
    if (true) {
      function f() {
        return true;
      }
    }

    function g() {
      return f();
    }

    return g();
  }
}

expect(new A().m).toThrow(ReferenceError);`,
    filename: 'exec.js',
    output: `class A {
  m() {
    if (true) {
      function f() {
        return true;
      }
    }

    function g() {
      return f();
    }

    return g();
  }
}

expect(new A().m).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 in class (input)',
    source: `class A {
  m() {
    if (true) {
      function f() {
        return true;
      }
    }

    function g() {
      return f();
    }

    return g();
  }
}

expect(new A().m).toThrow(ReferenceError);`,
    filename: 'input.js',
    output: `class A {
  m() {
    if (true) {
      function f() {
        return true;
      }
    }

    function g() {
      return f();
    }

    return g();
  }
}

expect(new A().m).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 in module expression (input)',
    source: `const m = module {
  if (true) {
    function f() {
      return true;
    }
  }

  function g() {
    return f();
  }
};
`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 module (input)',
    source: `if (true) {
  function run() {
    return true;
  }
}

function test() {
  return run();
}
`,
    filename: 'input.mjs',
    output: `if (true) {
  function run() {
    return true;
  }
}

function test() {
  return run();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — annex B_3_3 (input)',
    source: `if (true) {
  function run() {
    return true;
  }
}

function test() {
  return run();
}
`,
    filename: 'input.js',
    output: `if (true) {
  function run() {
    return true;
  }
}

function test() {
  return run();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — assignment patterns (input)',
    source: `const foo = "foo";

function foobar() {
  for (let item of [1, 2, 3]) {
    let foo = "bar";
    [bar, foo] = [1, 2];
  }
}
`,
    filename: 'input.js',
    output: `var foo = 'foo';
function foobar() {
  for (var item of [1, 2, 3]) {
    var _foo = 'bar';
    [bar, _foo] = [1, 2];
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — block inside switch inside loop (exec)',
    source: `// it shouldn't break on a case-break statement
var i;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 1: {
      break;
    }
  }

  const z = 3; // to force the plugin to convert to loop function call
  () => z;
}

expect(i).toBe(10);

// it should continue on continue statements within switch
var j = 0;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 0: {
      continue;
    }
  }
  j++;

  const z = 3;
  () => z;
}

expect(j).toBe(9);

// it should work with loops nested within switch
j = 0;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 0: {
      for (var k = 0; k < 10; k++) {
        const z = 3;
        () => z;
        j++;
        break;
      }
      break;
    }
  }

  const z = 3;
  () => z;
}

expect(j).toBe(1);
`,
    filename: 'exec.js',
    output: `// it shouldn't break on a case-break statement
var i;
var _loopResult;
var _loop = () => {
  switch (i) {
    case 1: {
      break;
    }
  }
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult = _loop();
}
expect(i).toBe(10);
// it should continue on continue statements within switch
var j = 0;
var _loopResult8;
var _loop7 = () => {
  switch (i) {
    case 0: {
      return {
        type: 'continue',
        vars: [],
      };
    }
  }
  j++;
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult8 = _loop7();
  if (_loopResult8.type === 'continue') continue;
}
expect(j).toBe(9);
// it should work with loops nested within switch
j = 0;
var k;
var _loopResult10;
var _loop9 = () => {
  switch (i) {
    case 0: {
      var _loopResult12;
      var _loop11 = () => {
        var _z = 3;
        () => _z;
        j++;
        return {
          type: 'break',
          vars: [],
        };
        return {
          type: 'normal',
          vars: [],
        };
      };
      for (k = 0; k < 10; k++) {
        _loopResult12 = _loop11();
        if (_loopResult12.type === 'break') break;
      }
      break;
    }
  }
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult10 = _loop9();
}
expect(j).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — block inside switch inside loop (input)',
    source: `// it shouldn't break on a case-break statement
var i;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 1:
      break;
  }

  const z = 3; // to force the plugin to convert to loop function call
  () => z;
}

expect(i).toBe(10);

// it should continue on continue statements within switch
var j = 0;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 0:
      continue;
  }
  j++;

  const z = 3;
  () => z;
}

expect(j).toBe(9);

// it should work with loops nested within switch
j = 0;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 0:
      for (var k = 0; k < 10; k++) {
        const z = 3;
        () => z;
        j++;
        break;
      }
      break;
  }

  const z = 3;
  () => z;
}

expect(j).toBe(1);
`,
    filename: 'input.js',
    output: `// it shouldn't break on a case-break statement
var i;
var _loopResult;
var _loop = () => {
  switch (i) {
    case 1:
      break;
  }
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult = _loop();
}
expect(i).toBe(10);
// it should continue on continue statements within switch
var j = 0;
var _loopResult8;
var _loop7 = () => {
  switch (i) {
    case 0:
      return {
        type: 'continue',
        vars: [],
      };
  }
  j++;
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult8 = _loop7();
  if (_loopResult8.type === 'continue') continue;
}
expect(j).toBe(9);
// it should work with loops nested within switch
j = 0;
var k;
var _loopResult10;
var _loop9 = () => {
  switch (i) {
    case 0:
      var _loopResult12;
      var _loop11 = () => {
        var _z = 3;
        () => _z;
        j++;
        return {
          type: 'break',
          vars: [],
        };
        return {
          type: 'normal',
          vars: [],
        };
      };
      for (k = 0; k < 10; k++) {
        _loopResult12 = _loop11();
        if (_loopResult12.type === 'break') break;
      }
      break;
  }
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult10 = _loop9();
}
expect(j).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — block not shadow global (input)',
    source: `{ a; }
{ let a; }

(function () {
  { b; }
  { let b; }
})();

{ c = 0; }
{ let c; }

(function () {
  { d = 0; }
  { let d; }
})`,
    filename: 'input.js',
    output: `{
  a;
}
{
  var _a;
}
(function () {
  {
    b;
  }
  {
    var _b;
  }
})();
{
  c = 0;
}
{
  var _c;
}
(function () {
  {
    d = 0;
  }
  {
    var _d;
  }
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — block not shadow outer variable (exec)',
    source: `let a = 1;

function f() {
  let res;
  { res = a; }
  { let a = 2; }
  return res;
}

expect(f()).toBe(1);
`,
    filename: 'exec.js',
    output: `var a = 1;
function f() {
  var res;
  {
    res = a;
  }
  {
    var _a = 2;
  }
  return res;
}
expect(f()).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — block not shadow outer variable (input)',
    source: `let a = 1;

function f() {
  { console.log(a); }
  { let a = 2; }
}
`,
    filename: 'input.js',
    output: `var a = 1;
function f() {
  {
    console.log(a);
  }
  {
    var _a = 2;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — closure in generator or async (exec)',
    source: `(function () {
function* a() {
  do {
    let x = yield "iteration";
    var fn = () => x;
  } while (false);
  return fn;
}

async function b() {
  do {
    let x = await "iteration";
    var fn = () => x;
  } while (false);
  return fn;
}

async function* c() {
  do {
    let x = yield "iteration";
    var fn = () => x;
  } while (false);
  return fn;
}

return (async () => {
  let it = a();
  expect(it.next().value).toBe("iteration");
  expect(it.next("foo").value()).toBe("foo");

  expect((await b())()).toBe("iteration");

  it = c();
  expect((await it.next()).value).toBe("iteration");
  expect((await it.next("foo")).value()).toBe("foo");
})();


});
`,
    filename: 'exec.js',
    output: `(function () {
  function* a() {
    var fn;
    var _loopResult;
    var _loop = function* () {
      var x = yield 'iteration';
      fn = () => x;
      return {
        type: 'normal',
        vars: [],
      };
    };
    do {
      _loopResult = yield* _loop.call(this);
    } while (false);
    return fn;
  }
  async function b() {
    var fn;
    var _loopResult10;
    var _loop9 = async () => {
      var x = await 'iteration';
      fn = () => x;
      return {
        type: 'normal',
        vars: [],
      };
    };
    do {
      _loopResult10 = await _loop9();
    } while (false);
    return fn;
  }
  async function* c() {
    var fn;
    var _loopResult12;
    var _loop11 = function* () {
      var x = yield 'iteration';
      fn = () => x;
      return {
        type: 'normal',
        vars: [],
      };
    };
    do {
      _loopResult12 = yield* _loop11.call(this);
    } while (false);
    return fn;
  }
  return (async () => {
    var it = a();
    expect(it.next().value).toBe('iteration');
    expect(it.next('foo').value()).toBe('foo');
    expect((await b())()).toBe('iteration');
    it = c();
    expect((await it.next()).value).toBe('iteration');
    expect((await it.next('foo')).value()).toBe('foo');
  })();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — closure in generator or async (input)',
    source: `function* a() {
  do {
    let x = yield "iteration";
    var fn = () => x;
  } while (false);
  return fn;
}

async function b() {
  do {
    let x = await "iteration";
    var fn = () => x;
  } while (false);
  return fn;
}

async function* c() {
  do {
    let x = yield "iteration";
    var fn = () => x;
  } while (false);
  return fn;
}
`,
    filename: 'input.js',
    output: `function* a() {
  var fn;
  var _loopResult;
  var _loop = function* () {
    var x = yield 'iteration';
    fn = () => x;
    return {
      type: 'normal',
      vars: [],
    };
  };
  do {
    _loopResult = yield* _loop.call(this);
  } while (false);
  return fn;
}
async function b() {
  var fn;
  var _loopResult8;
  var _loop7 = async () => {
    var x = await 'iteration';
    fn = () => x;
    return {
      type: 'normal',
      vars: [],
    };
  };
  do {
    _loopResult8 = await _loop7();
  } while (false);
  return fn;
}
async function* c() {
  var fn;
  var _loopResult10;
  var _loop9 = function* () {
    var x = yield 'iteration';
    fn = () => x;
    return {
      type: 'normal',
      vars: [],
    };
  };
  do {
    _loopResult10 = yield* _loop9.call(this);
  } while (false);
  return fn;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for break continue closure (exec)',
    source: `expect(() => {
  for (const a of [1]) {
    switch (true) {
      case true: {
        const b = 1;
        () => b;
        if (true) break;
        continue;
      }
      case false: {
        throw new Error("unreachable");
      }
    }
  }
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `expect(() => {
  var _loopResult;
  var _loop = a => {
    switch (true) {
      case true: {
        var b = 1;
        () => b;
        if (true) break;
        return {
          type: 'continue',
          vars: [a],
        };
      }
      case false: {
        throw new Error('unreachable');
      }
    }
    return {
      type: 'normal',
      vars: [a],
    };
  };
  for (var a of [1]) {
    _loopResult = _loop(a);
    if (_loopResult.type === 'continue') continue;
  }
}).not.toThrow();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for break continue closure (input)',
    source: `for (const a of [1]) {
  switch (true) {
    case true: {
      const b = 1;
      () => b;
      if (true) break;
      continue;
    }
    case false: {
      throw new Error("unreachable");
    }
  }
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = a => {
  switch (true) {
    case true: {
      var b = 1;
      () => b;
      if (true) break;
      return {
        type: 'continue',
        vars: [a],
      };
    }
    case false: {
      throw new Error('unreachable');
    }
  }
  return {
    type: 'normal',
    vars: [a],
  };
};
for (var a of [1]) {
  _loopResult = _loop(a);
  if (_loopResult.type === 'continue') continue;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for break continue return (input)',
    source: `(function () {
  for (let i in nums) {
    fns.push(function () { return i; });
    if (i === 1) {
      continue;
    } else if (i === 2) {
      break;
    } else if (i === 3) {
      return i;
    }
  }
})();
`,
    filename: 'input.js',
    output: `(function () {
  var _loopResult;
  var _loop = i => {
    fns.push(function () {
      return i;
    });
    if (i === 1) {
      return {
        type: 'continue',
        vars: [i],
      };
    } else if (i === 2) {
      return {
        type: 'break',
        vars: [i],
      };
    } else if (i === 3) {
      return {
        type: 'return',
        value: i,
        vars: [i],
      };
    }
    return {
      type: 'normal',
      vars: [i],
    };
  };
  for (var i in nums) {
    _loopResult = _loop(i);
    i = _loopResult.vars[0];
    if (_loopResult.type === 'return') return _loopResult.value;
    if (_loopResult.type === 'break') break;
    if (_loopResult.type === 'continue') continue;
  }
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for break (input)',
    source: `for (let i in nums) {
  fns.push(function () { return i; });
  break;
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = i => {
  fns.push(function () {
    return i;
  });
  return {
    type: 'break',
    vars: [i],
  };
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i in nums) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
  if (_loopResult.type === 'break') break;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for const closure (input)',
    source: `for (let i = 0; i < 5; i++) {
  const l = i;
  setTimeout(function() {
    console.log(l);
  }, 1);
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = i => {
  var l = i;
  setTimeout(function () {
    console.log(l);
  }, 1);
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 0; i < 5; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for continuation (input)',
    source: `for (let i = 0; i < 2; i++) {
  () => { i };
  console.log(i);
  i += 1;
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = i => {
  () => {
    i;
  };
  console.log(i);
  i += 1;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 0; i < 2; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for continue (input)',
    source: `for (let i in nums) {
  fns.push(function () { return i; });
  continue;
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = i => {
  fns.push(function () {
    return i;
  });
  return {
    type: 'continue',
    vars: [i],
  };
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i in nums) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
  if (_loopResult.type === 'continue') continue;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for inside for x (input)',
    source: `function w() {
    for (let i = 0; i < y; i++) {
        let outer = {}
        for (var key in someObj) {
            let x = () => outer;
        }
    }
}

function w2() {
    for (let i = 0; i < y; i++) {
        let outer = {}
        for (var key of someObj) {
            let x = () => outer;
        }
    }
}
`,
    filename: 'input.js',
    output: `function w() {
  var key;
  var _loopResult;
  var _loop = i => {
    var outer = {};
    for (key in someObj) {
      var x = () => outer;
    }
    return {
      type: 'normal',
      vars: [i],
    };
  };
  for (var i = 0; i < y; i++) {
    _loopResult = _loop(i);
    i = _loopResult.vars[0];
  }
}
function w2() {
  var key;
  var _loopResult11;
  var _loop10 = i => {
    var outer = {};
    for (key of someObj) {
      var x = () => outer;
    }
    return {
      type: 'normal',
      vars: [i],
    };
  };
  for (var i = 0; i < y; i++) {
    _loopResult11 = _loop10(i);
    i = _loopResult11.vars[0];
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for return undefined (input)',
    source: `(function () {
  for (let i in nums) {
    fns.push(function () { return i; });
    return;
  }
})();
`,
    filename: 'input.js',
    output: `(function () {
  var _loopResult;
  var _loop = i => {
    fns.push(function () {
      return i;
    });
    return {
      type: 'return',
      value: void 0,
      vars: [i],
    };
    return {
      type: 'normal',
      vars: [i],
    };
  };
  for (var i in nums) {
    _loopResult = _loop(i);
    i = _loopResult.vars[0];
    if (_loopResult.type === 'return') return _loopResult.value;
  }
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for return (input)',
    source: `(function () {
  for (let i in nums) {
    fns.push(function () { return i; });
    return i;
  }
})();
`,
    filename: 'input.js',
    output: `(function () {
  var _loopResult;
  var _loop = i => {
    fns.push(function () {
      return i;
    });
    return {
      type: 'return',
      value: i,
      vars: [i],
    };
    return {
      type: 'normal',
      vars: [i],
    };
  };
  for (var i in nums) {
    _loopResult = _loop(i);
    i = _loopResult.vars[0];
    if (_loopResult.type === 'return') return _loopResult.value;
  }
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for variable update different captured (exec)',
    source: `let res = [];

for (let i = 1; i < 6; i++) {
  let y = i;
  res.push((() => y)());
  i++;
}

expect(res).toEqual([1, 3, 5]);
`,
    filename: 'exec.js',
    output: `var res = [];
var _loopResult;
var _loop = i => {
  var y = i;
  res.push((() => y)());
  i++;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 1; i < 6; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}
expect(res).toEqual([1, 3, 5]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for variable update different captured (input)',
    source: `for (let i = 4; i < 6; i++) {
  let y = i;
  () => y;
  i++;
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = i => {
  var y = i;
  () => y;
  i++;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 4; i < 6; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for without block (exec)',
    source: `function proxyObserver(properties) {
  for (let key in properties)
    if (properties[key].observer) {
      let base = properties[key].observer;
      properties[key].observer = () => {
        return base.apply(this);
      };
    }

  return properties;
}

const results = proxyObserver([
  { observer: () => 1 },
  { observer: () => 2 },
])
expect(results[0].observer()).toBe(1)
expect(results[1].observer()).toBe(2)
`,
    filename: 'exec.js',
    output: `function proxyObserver(properties) {
  var _loopResult;
  var _loop = key => {
    if (properties[key].observer) {
      var base = properties[key].observer;
      properties[key].observer = () => {
        return base.apply(this);
      };
    }
    return {
      type: 'normal',
      vars: [key],
    };
  };
  for (var key in properties) {
    _loopResult = _loop(key);
    key = _loopResult.vars[0];
  }
  return properties;
}
var results = proxyObserver([{ observer: () => 1 }, { observer: () => 2 }]);
expect(results[0].observer()).toBe(1);
expect(results[1].observer()).toBe(2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for without block (input)',
    source: `function proxyObserver(component) {
  for (let key in component.properties)
    if (component.properties[key].observer) {
      let base = component.properties[key].observer;
      component.properties[key].observer = () => {
        base.apply(this);
      };
    }

  return component;
}

function proxyObserver2(component) {
  for (let key of component.properties)
    while (1) {
      let base = component.properties[key].observer;
      component.properties[key].observer = () => {
        base.apply(this);
      };
    }

  return component;
}
`,
    filename: 'input.js',
    output: `function proxyObserver(component) {
  var _loopResult;
  var _loop = key => {
    if (component.properties[key].observer) {
      var base = component.properties[key].observer;
      component.properties[key].observer = () => {
        base.apply(this);
      };
    }
    return {
      type: 'normal',
      vars: [key],
    };
  };
  for (var key in component.properties) {
    _loopResult = _loop(key);
    key = _loopResult.vars[0];
  }
  return component;
}
function proxyObserver2(component) {
  var _loopResult8;
  var _loop7;
  var _loopResult10;
  var _loop9 = key => {
    _loop7 = () => {
      var base = component.properties[key].observer;
      component.properties[key].observer = () => {
        base.apply(this);
      };
      return {
        type: 'normal',
        vars: [],
      };
    };
    while (1) {
      _loopResult8 = _loop7();
    }
    return {
      type: 'normal',
      vars: [key],
    };
  };
  for (var key of component.properties) {
    _loopResult10 = _loop9(key);
    key = _loopResult10.vars[0];
  }
  return component;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — for x inside for (input)',
    source: `function w() {
  for (let key in someObj) {
    let outer = {}
    for (var i = 0; i < y; i++) {
      let x = () => outer;
    }
  }
}
`,
    filename: 'input.js',
    output: `function w() {
  var i;
  var _loopResult;
  var _loop = key => {
    var outer = {};
    for (i = 0; i < y; i++) {
      var x = () => outer;
    }
    return {
      type: 'normal',
      vars: [key],
    };
  };
  for (var key in someObj) {
    _loopResult = _loop(key);
    key = _loopResult.vars[0];
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — function in catch (input)',
    source: `try {
  foo();
} catch (x) {
  function harmless(x) {
    return x;
  }
}
`,
    filename: 'input.js',
    output: `try {
  foo();
} catch (x) {
  function harmless(x) {
    return x;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — function name (input)',
    source: `let foo = () => {
  foo = () => { };
};

foo();
`,
    filename: 'input.js',
    output: `var foo = () => {
  foo = () => {};
};
foo();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — function (input)',
    source: `function test() {
  let foo = "bar";
}
`,
    filename: 'input.js',
    output: `function test() {
  var foo = 'bar';
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — hoisting (input)',
    source: `for (let i of nums) {
  var x = 5;
  var { f } = { f: 2 };
  fns.push(function () {
    return i * x;
  });
}
`,
    filename: 'input.js',
    output: `var x;
var f;
var _loopResult;
var _loop = i => {
  x = 5;
  ({ f: f } = { f: 2 });
  fns.push(function () {
    return i * x;
  });
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i of nums) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 10339 (exec)',
    source: `(function () {
const code = \`
  for (const {foo, ...bar} of { bar: [] }) {
    () => foo;
    const [qux] = bar;
    try {} catch (e) {
      let quux = qux;
    }
  }
\`;

let programPath;
let forOfPath;
let functionPath;

return transformAsync(code, {
  configFile: false,
  plugins: [
    __dirname + "/../../../../lib/index.js",
    {
      post({ path }) {
        programPath = path;
        path.traverse({
          ForOfStatement(path) { forOfPath = path },
          FunctionExpression(path) { functionPath = path }
        });
      }
    }
  ]
}).then(() => {
  expect(Object.keys(programPath.scope.bindings)).toEqual(["foo", "bar"]);

  // for declarations should be transformed to for bindings
  expect(forOfPath.scope.bindings).toEqual({});
  // The body should be wrapped into closure
  expect(forOfPath.get("body").scope.bindings).toEqual({});

  expect(Object.keys(functionPath.scope.bindings)).toEqual(["foo", "qux", "quux"]);
});

});
`,
    filename: 'exec.js',
    output: `(function () {
  var code = \`
  for (const {foo, ...bar} of { bar: [] }) {
    () => foo;
    const [qux] = bar;
    try {} catch (e) {
      let quux = qux;
    }
  }
\`;
  var programPath;
  var forOfPath;
  var functionPath;
  return transformAsync(code, {
    configFile: false,
    plugins: [
      __dirname + '/../../../../lib/index.js',
      {
        post({ path }) {
          programPath = path;
          path.traverse({
            ForOfStatement(path) {
              forOfPath = path;
            },
            FunctionExpression(path) {
              functionPath = path;
            },
          });
        },
      },
    ],
  }).then(() => {
    expect(Object.keys(programPath.scope.bindings)).toEqual(['foo', 'bar']);
    // for declarations should be transformed to for bindings
    expect(forOfPath.scope.bindings).toEqual({});
    // The body should be wrapped into closure
    expect(forOfPath.get('body').scope.bindings).toEqual({});
    expect(Object.keys(functionPath.scope.bindings)).toEqual(['foo', 'qux', 'quux']);
  });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 10339 (input)',
    source: `for (const {foo, ...bar} of {}) {
  () => foo;
  const [qux] = bar;
  try {} catch (e) {
    const quux = qux;
  }
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = (foo, bar) => {
  () => foo;
  var [qux] = bar;
  try {
  } catch (e) {
    var quux = qux;
  }
  return {
    type: 'normal',
    vars: [foo, bar],
  };
};
for (var { foo, ...bar } of {}) {
  _loopResult = _loop(foo, bar);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 1051 (input)',
    source: `foo.func1 = function() {
  if (cond1) {
    for (;;) {
      if (cond2) {
        function func2() {}
        function func3() {}
        func4(function() {
          func2();
        });
        break;
      }
    }
  }
};
`,
    filename: 'input.js',
    output: `foo.func1 = function () {
  if (cond1) {
    for (;;) {
      if (cond2) {
        function func2() {}
        function func3() {}
        func4(function () {
          func2();
        });
        break;
      }
    }
  }
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 14960 (input)',
    source: `{
  switch (1) {
    case 1:
      expect(f()).toBe(1);
      function f() {
        return 1;
      }
  }
}
`,
    filename: 'input.js',
    output: `{
  switch (1) {
    case 1:
      expect(f()).toBe(1);
      function f() {
        return 1;
      }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow and capture (exec)',
    source: `let res = [];

let i = 0;
for (let i = 4; i < 6; i++) {
  res.push((() => i)());
}

expect(res).toEqual([4, 5]);
`,
    filename: 'exec.js',
    output: `var res = [];
var i = 0;
var _loopResult;
var _loop = i => {
  res.push((() => i)());
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 4; _i < 6; _i++) {
  _loopResult = _loop(_i);
  _i = _loopResult.vars[0];
}
expect(res).toEqual([4, 5]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow and capture (input)',
    source: `let i;
for (let i = 4; i < 6; i++) {
  () => i;
}
`,
    filename: 'input.js',
    output: `var i;
var _loopResult;
var _loop = i => {
  () => i;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 4; _i < 6; _i++) {
  _loopResult = _loop(_i);
  _i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow and update (exec)',
    source: `let res = [];

let i = 0;
for (let i = 1; i < 6; i++) {
  let y = i;
  res.push((() => y)());
  i++;
}

expect(res).toEqual([1, 3, 5]);
`,
    filename: 'exec.js',
    output: `var res = [];
var i = 0;
var _loopResult;
var _loop = i => {
  var y = i;
  res.push((() => y)());
  i++;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 1; _i < 6; _i++) {
  _loopResult = _loop(_i);
  _i = _loopResult.vars[0];
}
expect(res).toEqual([1, 3, 5]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow and update (input)',
    source: `let i;
for (let i = 4; i < 6; i++) {
  let y = i;
  () => y;
  i++;
}
`,
    filename: 'input.js',
    output: `var i;
var _loopResult;
var _loop = i => {
  var y = i;
  () => y;
  i++;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 4; _i < 6; _i++) {
  _loopResult = _loop(_i);
  _i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow original sibling scope (exec)',
    source: `let res = [];

for (let i = 1; i < 3; i++) {
  let x = i;
  res.push((() => x)());
}

for (let i = 4; i < 6; i++) {
  let y = i;
  res.push((() => y)());
}

expect(res).toEqual([1, 2, 4, 5]);
`,
    filename: 'exec.js',
    output: `var res = [];
var _loopResult;
var _loop = i => {
  var x = i;
  res.push((() => x)());
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 1; i < 3; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}
var _loopResult8;
var _loop7 = i => {
  var y = i;
  res.push((() => y)());
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 4; _i < 6; _i++) {
  _loopResult8 = _loop7(_i);
  _i = _loopResult8.vars[0];
}
expect(res).toEqual([1, 2, 4, 5]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow original sibling scope (input)',
    source: `for (let i = 1; i < 3; i++) {
  let x = i;
  () => x;
}

for (let i = 4; i < 6; i++) {
  let y = i;
  () => y;
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = i => {
  var x = i;
  () => x;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 1; i < 3; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}
var _loopResult6;
var _loop5 = i => {
  var y = i;
  () => y;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 4; _i < 6; _i++) {
  _loopResult6 = _loop5(_i);
  _i = _loopResult6.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow (exec)',
    source: `let res = [];

let i = 0;
for (let i = 4; i < 6; i++) {
  let y = i;
  res.push((() => y)());
}

expect(res).toEqual([4, 5]);
`,
    filename: 'exec.js',
    output: `var res = [];
var i = 0;
var _loopResult;
var _loop = i => {
  var y = i;
  res.push((() => y)());
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 4; _i < 6; _i++) {
  _loopResult = _loop(_i);
  _i = _loopResult.vars[0];
}
expect(res).toEqual([4, 5]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 15308 for variable shadow (input)',
    source: `let i;
for (let i = 4; i < 6; i++) {
  let y = i;
  () => y;
}
`,
    filename: 'input.js',
    output: `var i;
var _loopResult;
var _loop = i => {
  var y = i;
  () => y;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 4; _i < 6; _i++) {
  _loopResult = _loop(_i);
  _i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 18087 indirect (exec)',
    source: `let count = 0;

for (let outer = 0; outer < 2; outer++) {
  do {
    for (let done; !done; done = true) {
      count++;
    }
  } while (false);
}

expect(count).toBe(2);
`,
    filename: 'exec.js',
    output: `var count = 0;
for (var outer = 0; outer < 2; outer++) {
  do {
    for (var done = void 0; !done; done = true) {
      count++;
    }
  } while (false);
}
expect(count).toBe(2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 18087 indirect (input)',
    source: `let count = 0;

for (let outer = 0; outer < 2; outer++) {
  do {
    for (let done; !done; done = true) {
      count++;
    }
  } while (false);
}

expect(count).toBe(2);
`,
    filename: 'input.js',
    output: `var count = 0;
for (var outer = 0; outer < 2; outer++) {
  do {
    for (var done = void 0; !done; done = true) {
      count++;
    }
  } while (false);
}
expect(count).toBe(2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 18087 (exec)',
    source: `let count = 0;

for (let outer = 0; outer < 2; outer++) {
  for (let done; !done; done = true) {
    count++;
  }
}

expect(count).toBe(2);
`,
    filename: 'exec.js',
    output: `var count = 0;
for (var outer = 0; outer < 2; outer++) {
  for (var done = void 0; !done; done = true) {
    count++;
  }
}
expect(count).toBe(2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 18087 (input)',
    source: `let count = 0;

for (let outer = 0; outer < 2; outer++) {
  for (let done; !done; done = true) {
    count++;
  }
}

expect(count).toBe(2);
`,
    filename: 'input.js',
    output: `var count = 0;
for (var outer = 0; outer < 2; outer++) {
  for (var done = void 0; !done; done = true) {
    count++;
  }
}
expect(count).toBe(2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 2174 (input)',
    source: `if (true) {
  function foo() {}
  function bar() {
    return foo;
  }
  for (var x in {}) {}
}
`,
    filename: 'input.js',
    output: `if (true) {
  function foo() {}
  function bar() {
    return foo;
  }
  for (var x in {}) {
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 4363 (input)',
    source: `function WithoutCurlyBraces() {
  if (true)
    for (let k in kv) {
        function foo() { return this }
        function bar() { return foo.call(this) }
        console.log(this, k) // => undefined
    }
}

function WithCurlyBraces() {
  if (true) {
    for (let k in kv) {
        function foo() { return this }
        function bar() { return foo.call(this) }
        console.log(this, k) // => 777
    }
  }
}
`,
    filename: 'input.js',
    output: `function WithoutCurlyBraces() {
  if (true)
    for (var k in kv) {
      function foo() {
        return this;
      }
      function bar() {
        return foo.call(this);
      }
      console.log(this, k);
    }
}
function WithCurlyBraces() {
  if (true) {
    for (var k in kv) {
      function foo() {
        return this;
      }
      function bar() {
        return foo.call(this);
      }
      console.log(this, k);
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 4946 (input)',
    source: `(function foo() {
  let foo = true;
});
`,
    filename: 'input.js',
    output: `(function foo() {
  var _foo = true;
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 8128 for of after (exec)',
    source: `"use strict";

const results = [0, 1, 2];
const fns = [];

for (let result of results) {
  result = result * 2;
  fns.push(() => {
    return result;
  });
}

expect(fns[0]()).toBe(0);
expect(fns[1]()).toBe(2);
expect(fns[2]()).toBe(4);
`,
    filename: 'exec.js',
    output: `'use strict';
var results = [0, 1, 2];
var fns = [];
var _loopResult;
var _loop = result => {
  result = result * 2;
  fns.push(() => {
    return result;
  });
  return {
    type: 'normal',
    vars: [result],
  };
};
for (var result of results) {
  _loopResult = _loop(result);
  result = _loopResult.vars[0];
}
expect(fns[0]()).toBe(0);
expect(fns[1]()).toBe(2);
expect(fns[2]()).toBe(4);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 8128 for of after (input)',
    source: `for (let result of results) {
  result = otherValue;
  fn(() => {
    result;
  });
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = result => {
  result = otherValue;
  fn(() => {
    result;
  });
  return {
    type: 'normal',
    vars: [result],
  };
};
for (var result of results) {
  _loopResult = _loop(result);
  result = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 8498 loop init collision destructuring (input)',
    source: `for (let a, { b } = {};;) {
  let a, { b } = {};

  {
    let a, { b } = {};
  }
}
`,
    filename: 'input.js',
    output: `for (var a, { b } = {}; ;) {
  var _a = void 0,
    { b: _b } = {};
  {
    var _a2 = void 0,
      { b: _b2 } = {};
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 8498 loop init collision (input)',
    source: `for (let i = 0; i < 3; i++) {
    let i = 'abc';
    console.log(i);

    {
      let i = "hello";
    }
}
`,
    filename: 'input.js',
    output: `for (var i = 0; i < 3; i++) {
  var _i = 'abc';
  console.log(_i);
  {
    var _i2 = 'hello';
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue 973 (input)',
    source: `let arr = [];
for(let i = 0; i < 10; i++) {
  for (let i = 0; i < 10; i++) {
    arr.push(() => i);
  }
}
`,
    filename: 'input.js',
    output: `var arr = [];
for (var i = 0; i < 10; i++) {
  var _loopResult;
  var _loop = i => {
    arr.push(() => i);
    return {
      type: 'normal',
      vars: [i],
    };
  };
  for (var _i = 0; _i < 10; _i++) {
    _loopResult = _loop(_i);
    _i = _loopResult.vars[0];
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — issue T7525 (input)',
    source: `let a = 1;

for (let a = 2, i = a + 1; i < 10; i++) {
  console.log(i);
}

for (let a in [1, 2, 3]) {
  let a = 3;
  console.log(a);
}
`,
    filename: 'input.js',
    output: `var a = 1;
for (var _a = 2, i = _a + 1; i < 10; i++) {
  console.log(i);
}
for (var _a2 in [1, 2, 3]) {
  var _a3 = 3;
  console.log(_a3);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — jsx identifier (input)',
    source: `// #1683

var arr = [];
for(let i = 0; i < 4; ++i) {
  arr.push(
    <i></i>
  );
}
`,
    filename: 'input.jsx',
    output: `// #1683
var arr = [];
for (var i = 0; i < 4; ++i) {
  arr.push(<i></i>);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
          jsx: 'preserve',
        },
      },
    ],
  },
  {
    title: 'general — label complex (input)',
    source: `outer: while (t) {
  inner: while (t2) {
    for (let i = 0; i < 3; i++) {
      later(() => i);
      if (test1) break outer;
      else if (test2) break inner;
      else if (test3) continue outer;
      else if (test4) continue inner;
      else if (test5) break;
      else if (test6) continue;
    }
  }
}
`,
    filename: 'input.js',
    output: `outer: while (t) {
  inner: while (t2) {
    var _loopResult;
    var _loop = i => {
      later(() => i);
      if (test1)
        return {
          type: 'break:outer',
          vars: [i],
        };
      else if (test2)
        return {
          type: 'break:inner',
          vars: [i],
        };
      else if (test3)
        return {
          type: 'continue:outer',
          vars: [i],
        };
      else if (test4)
        return {
          type: 'continue:inner',
          vars: [i],
        };
      else if (test5)
        return {
          type: 'break',
          vars: [i],
        };
      else if (test6)
        return {
          type: 'continue',
          vars: [i],
        };
      return {
        type: 'normal',
        vars: [i],
      };
    };
    for (var i = 0; i < 3; i++) {
      _loopResult = _loop(i);
      i = _loopResult.vars[0];
      if (_loopResult.type === 'break') break;
      if (_loopResult.type === 'break:inner') break inner;
      if (_loopResult.type === 'break:outer') break outer;
      if (_loopResult.type === 'continue') continue;
      if (_loopResult.type === 'continue:inner') continue inner;
      if (_loopResult.type === 'continue:outer') continue outer;
    }
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — label (input)',
    source: `loop:
for (var i = 0; i < 10; i++) {
  const z = 3; // force loop function
  () => z;
  switch(true) {
    case true:
      break loop;
  }
}

`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = () => {
  var z = 3;
  () => z;
  switch (true) {
    case true:
      return {
        type: 'break:loop',
        vars: [],
      };
  }
  return {
    type: 'normal',
    vars: [],
  };
};
loop: for (var i = 0; i < 10; i++) {
  _loopResult = _loop();
  if (_loopResult.type === 'break:loop') break loop;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — loop closure hoisted function (exec)',
    source: `for (let i = 0; i < 3; i++) {
    if (i === 0) {
        function test() {
            return i;
        }
    }
  expect(test()).toBe(0);
}
`,
    filename: 'exec.js',
    output: `var _loopResult;
var _loop = i => {
  if (i === 0) {
    function test() {
      return i;
    }
  }
  expect(test()).toBe(0);
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 0; i < 3; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — loop closure hoisted function (input)',
    source: `for (let i = 0; i < 3; i++) {
    if (i === 0) {
        function test() {
            return i;
        }
    }
  expect(test()).toBe(0);
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = i => {
  if (i === 0) {
    function test() {
      return i;
    }
  }
  expect(test()).toBe(0);
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 0; i < 3; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — loop closure in class (exec)',
    source: `let run = [];

for (let i = 0; i < 2; i++) {
  run.push(class C {
    x = i;
  });
}

expect(new run[0]().x).toBe(0);
expect(new run[1]().x).toBe(1);
`,
    filename: 'exec.js',
    output: `var run = [];
var _loopResult;
var _loop = i => {
  run.push(
    class C {
      x = i;
    },
  );
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 0; i < 2; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}
expect(new run[0]().x).toBe(0);
expect(new run[1]().x).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — loop closure in class (input)',
    source: `for (let i = 0; i < 2; i++) {
  class C {
    x = i;
  }
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = i => {
  class C {
    x = i;
  }
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var i = 0; i < 2; i++) {
  _loopResult = _loop(i);
  i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — loop closure in method (exec)',
    source: `var objects = [];
var i2 = 0;
for (var i = 0; i < 10; i++) {
  let captured = i2;
  i2++;

  objects.push({
    foo() {
      return captured;
    }
  });
}

expect(objects[0].foo()).toBe(0);
expect(objects[1].foo()).toBe(1);
`,
    filename: 'exec.js',
    output: `var objects = [];
var i2 = 0;
var _loopResult;
var _loop = () => {
  var captured = i2;
  i2++;
  objects.push({
    foo() {
      return captured;
    },
  });
  return {
    type: 'normal',
    vars: [],
  };
};
for (var i = 0; i < 10; i++) {
  _loopResult = _loop();
}
expect(objects[0].foo()).toBe(0);
expect(objects[1].foo()).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — loop closure in method (input)',
    source: `var objects = [];
var i2 = 0;
for (var i = 0; i < 10; i++) {
  let captured = i2;
  i2++;

  objects.push({
    foo() {
      return captured;
    }
  });
}

expect(objects[0].foo()).toBe(0);
expect(objects[1].foo()).toBe(1);
`,
    filename: 'input.js',
    output: `var objects = [];
var i2 = 0;
var _loopResult;
var _loop = () => {
  var captured = i2;
  i2++;
  objects.push({
    foo() {
      return captured;
    },
  });
  return {
    type: 'normal',
    vars: [],
  };
};
for (var i = 0; i < 10; i++) {
  _loopResult = _loop();
}
expect(objects[0].foo()).toBe(0);
expect(objects[1].foo()).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — loop initializer default (input)',
    source: `while (value) {
  let foo;

  if (bar) {
    foo = [];
  }

  if (foo) {
    doIt();
  }
}
`,
    filename: 'input.js',
    output: `while (value) {
  var foo = void 0;
  if (bar) {
    foo = [];
  }
  if (foo) {
    doIt();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — loops and no loops (input)',
    source: `function foo() {
  const x = 5;
  console.log(x);

  {
    const x = 7;
    setTimeout(() => x, 0);
  }
}

function bar() {
  const x = 5;
  console.log(x);

  for (let i = 0; i < 7; i++) {
    {
      const x = i;
      setTimeout(() => x, 0);
    }
  }
}

function baz() {
  const x = 5;
  console.log(x);

  for (let i = 0; i < 7; i++) {
    var qux = function qux(y) {
      const x = y;
      setTimeout(() => x, 0);
    };
    qux(i);
  }
}
`,
    filename: 'input.js',
    output: `function foo() {
  var x = 5;
  console.log(x);
  {
    var _x = 7;
    setTimeout(() => _x, 0);
  }
}
function bar() {
  var x = 5;
  console.log(x);
  var _loopResult;
  var _loop = i => {
    {
      var _x2 = i;
      setTimeout(() => _x2, 0);
    }
    return {
      type: 'normal',
      vars: [i],
    };
  };
  for (var i = 0; i < 7; i++) {
    _loopResult = _loop(i);
    i = _loopResult.vars[0];
  }
}
function baz() {
  var x = 5;
  console.log(x);
  var _loopResult12;
  var _loop11 = i => {
    var qux = function qux(y) {
      var _x3 = y;
      setTimeout(() => _x3, 0);
    };
    qux(i);
    return {
      type: 'normal',
      vars: [i],
    };
  };
  for (var i = 0; i < 7; i++) {
    _loopResult12 = _loop11(i);
    i = _loopResult12.vars[0];
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — program (input)',
    source: `let test = "foo";
`,
    filename: 'input.js',
    output: "var test = 'foo';",
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — rename inside switch (input)',
    source: `window.test = () => {
    const e = "TEST";
    switch (e) {
        case "TEST":
            const e = [];
            e.push('111');
            alert(e);
            break;
        default: alert('666'); break;
    }
};

window.test = () => {
    const e = "TEST";
    switch (e) {
        case "TEST":
            const e = [];
            switch(e) {}
    }
};`,
    filename: 'input.js',
    output: `window.test = () => {
  var e = 'TEST';
  switch (e) {
    case 'TEST':
      var _e = [];
      _e.push('111');
      alert(_e);
      break;
    default:
      alert('666');
      break;
  }
};
window.test = () => {
  var e = 'TEST';
  switch (e) {
    case 'TEST':
      var _e2 = [];
      switch (_e2) {
      }
  }
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — sibling scopes (input)',
    source: `var f1, f2;
{
  let z = 'z1 value';
  f1 = function() { return z; };
}
{
  let z = 'z2 value';
  f2 = function() { return z; };
}
f1();
f2();
`,
    filename: 'input.js',
    output: `var f1, f2;
{
  var z = 'z1 value';
  f1 = function () {
    return z;
  };
}
{
  var _z = 'z2 value';
  f2 = function () {
    return _z;
  };
}
f1();
f2();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — superswitch (input)',
    source: `function foo() {
  while (true) {
    switch (2) {
      case 0: {
        if (true) {
          return;
        }

        const stuff = new Map();
        const data = 0;
        stuff.forEach(() => {
          const d = data;
        });
        break;
      }
    }
  }
}
`,
    filename: 'input.js',
    output: `function foo() {
  var _loopResult;
  var _loop = () => {
    switch (2) {
      case 0: {
        if (true) {
          return {
            type: 'return',
            value: void 0,
            vars: [],
          };
        }
        var stuff = new Map();
        var data = 0;
        stuff.forEach(() => {
          var d = data;
        });
        break;
      }
    }
    return {
      type: 'normal',
      vars: [],
    };
  };
  while (true) {
    _loopResult = _loop();
    if (_loopResult.type === 'return') return _loopResult.value;
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — switch callbacks (input)',
    source: `function fn() {
    while (true) {
        switch (true) {
        default:
            let foo = 4;
            if (true) {
                let bar = () => foo;
                console.log(bar());
            }
        }
    }
}
`,
    filename: 'input.js',
    output: `function fn() {
  var _loopResult;
  var _loop = () => {
    switch (true) {
      default:
        var foo = 4;
        if (true) {
          var bar = () => foo;
          console.log(bar());
        }
    }
    return {
      type: 'normal',
      vars: [],
    };
  };
  while (true) {
    _loopResult = _loop();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — switch inside loop (exec)',
    source: `// it shouldn't break on a case-break statement
var i;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 1:
      break;
  }

  const z = 3; // to force the plugin to convert to loop function call
  () => z;
}

expect(i).toBe(10);

// it should continue on continue statements within switch
var j = 0;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 0:
      continue;
  }
  j++;

  const z = 3;
  () => z;
}

expect(j).toBe(9);

// it should work with loops nested within switch
j = 0;
for (i = 0; i < 10; i++) {
  switch (i) {
    case 0:
      for (var k = 0; k < 10; k++) {
        const z = 3;
        () => z;
        j++;
        break;
      }
      break;
  }

  const z = 3;
  () => z;
}

expect(j).toBe(1);
`,
    filename: 'exec.js',
    output: `// it shouldn't break on a case-break statement
var i;
var _loopResult;
var _loop = () => {
  switch (i) {
    case 1:
      break;
  }
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult = _loop();
}
expect(i).toBe(10);
// it should continue on continue statements within switch
var j = 0;
var _loopResult8;
var _loop7 = () => {
  switch (i) {
    case 0:
      return {
        type: 'continue',
        vars: [],
      };
  }
  j++;
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult8 = _loop7();
  if (_loopResult8.type === 'continue') continue;
}
expect(j).toBe(9);
// it should work with loops nested within switch
j = 0;
var k;
var _loopResult10;
var _loop9 = () => {
  switch (i) {
    case 0:
      var _loopResult12;
      var _loop11 = () => {
        var _z = 3;
        () => _z;
        j++;
        return {
          type: 'break',
          vars: [],
        };
        return {
          type: 'normal',
          vars: [],
        };
      };
      for (k = 0; k < 10; k++) {
        _loopResult12 = _loop11();
        if (_loopResult12.type === 'break') break;
      }
      break;
  }
  var z = 3;
  () => z;
  return {
    type: 'normal',
    vars: [],
  };
};
for (i = 0; i < 10; i++) {
  _loopResult10 = _loop9();
}
expect(j).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — switch shadow (input)',
    source: `switch (x) {
  default: let x;
}
`,
    filename: 'input.js',
    output: `switch (x) {
  default:
    var _x;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — switch (input)',
    source: `let a = true;
let b = false;
class e {}
function f() {}

switch (a) {
  case true:
    let c = 2;
    let foo = true;
    break;
  case false:
    let d = 3;
    foo = false;
    break;
}

switch (true) {
  case true:
    let a = false;
    let b = true;
    let c = 4;
    let d = 5;

  case false:
    class e {}
    function f() {}
}
`,
    filename: 'input.js',
    output: `var a = true;
var b = false;
class e {}
function f() {}
switch (a) {
  case true:
    var c = 2;
    var foo = true;
    break;
  case false:
    var d = 3;
    foo = false;
    break;
}
switch (true) {
  case true:
    var _a = false;
    var _b = true;
    var _c = 4;
    var _d = 5;
  case false:
    class e {}
    function f() {}
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — untransformed await using declaration (input)',
    source: `{
  await using foo = null;
}
`,
    filename: 'input.js',
    output: `{
  await using foo = null;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — untransformed using declaration (input)',
    source: `{
  using foo = null;
}
`,
    filename: 'input.js',
    output: `{
  using foo = null;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — wrap closure shadow variables reassignment (input)',
    source: `for (let index = 0; index < 10; index++) {
    if (index % 2) {
        index+=3;
        continue;
    }
    let fn = function () {index;};
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = index => {
  if (index % 2) {
    index += 3;
    return {
      type: 'continue',
      vars: [index],
    };
  }
  var fn = function () {
    index;
  };
  return {
    type: 'normal',
    vars: [index],
  };
};
for (var index = 0; index < 10; index++) {
  _loopResult = _loop(index);
  index = _loopResult.vars[0];
  if (_loopResult.type === 'continue') continue;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'general — wrap closure shadow variables (input)',
    source: `let a = 1;
for (let a = 1; a < 100; a++) {
  items.forEach(item => a);
}
console.log(a);
`,
    filename: 'input.js',
    output: `var a = 1;
var _loopResult;
var _loop = a => {
  items.forEach(item => a);
  return {
    type: 'normal',
    vars: [a],
  };
};
for (var _a = 1; _a < 100; _a++) {
  _loopResult = _loop(_a);
  _a = _loopResult.vars[0];
}
console.log(a);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — issue 17684 (input)',
    source: `// Test 1: switch(e)
function test(e) {
    let i = e;
    {
        const e = i[0];
        switch (e) {
            case "n":
                const e = 1;
                return true;
            default:
                return false;
        }
    }
}
console.log(test("nn"));

// Test 2: switch(e.x)
function test2(e) {
    let i = e;
    {
        const e = { x: "test" };
        switch (e.x) {
            case "test":
                const e = 1;
                return true;
            default:
                return false;
        }
    }
}
console.log(test2({ x: "n" }));

// Test 3: switch(e.x + e.y)
function test3(e) {
    let i = e;
    {
        const e = { x: "te", y: "st" };
        switch (e.x + e.y) {
            case "test":
                const e = 1;
                return true;
            default:
                return false;
        }
    }
}
console.log(test3({ x: "x", y: "y" }));

// Test 4: switch(e.f())
function test4(e) {
    let i = e;
    {
        const e = { f: () => "test" };
        switch (e.f()) {
            case "test":
                const e = 1;
                return true;
            default:
                return false;
        }
    }
}
console.log(test4({ f: () => "test" }));

// Test 5: switch(id(e))
function id(v) {
    return v;
}

function test5(e) {
    let i = e;
    {
        const e = i[0];
        switch (id(e)) {
            case "n":
                const e = 1;
                return true;
            default:
                return false;
        }
    }
}
console.log(test5("nn"));
`,
    filename: 'input.js',
    output: `// Test 1: switch(e)
function test(e) {
  var i = e;
  {
    var _e3 = i[0];
    switch (_e3) {
      case 'n':
        var _e4 = 1;
        return true;
      default:
        return false;
    }
  }
}
console.log(test('nn'));
// Test 2: switch(e.x)
function test2(e) {
  var i = e;
  {
    var _e5 = { x: 'test' };
    switch (_e5.x) {
      case 'test':
        var _e6 = 1;
        return true;
      default:
        return false;
    }
  }
}
console.log(test2({ x: 'n' }));
// Test 3: switch(e.x + e.y)
function test3(e) {
  var i = e;
  {
    var _e7 = {
      x: 'te',
      y: 'st',
    };
    switch (_e7.x + _e7.y) {
      case 'test':
        var _e8 = 1;
        return true;
      default:
        return false;
    }
  }
}
console.log(
  test3({
    x: 'x',
    y: 'y',
  }),
);
// Test 4: switch(e.f())
function test4(e) {
  var i = e;
  {
    var _e9 = { f: () => 'test' };
    switch (_e9.f()) {
      case 'test':
        var _e10 = 1;
        return true;
      default:
        return false;
    }
  }
}
console.log(test4({ f: () => 'test' }));
// Test 5: switch(id(e))
function id(v) {
  return v;
}
function test5(e) {
  var i = e;
  {
    var _e = i[0];
    switch (id(_e)) {
      case 'n':
        var _e2 = 1;
        return true;
      default:
        return false;
    }
  }
}
console.log(test5('nn'));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — regression 1130 (input)',
    source: `function A() {
  let a;
}

function B() {
  let a;
}
`,
    filename: 'input.js',
    output: `function A() {
  var a;
}
function B() {
  var a;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — rename with global ids (input)',
    source: `// https://github.com/babel/babel/pull/15361

function fooBar(arrayOfThings) {
    for (let index = 0; index < arrayOfThings.length; index++) {
      const thing = arrayOfThings[index];
      const someMapObj = {};
      let arrow = (x) => someMapObj;
      arrow(0)
    }
}

fooBar([1,2,3])
`,
    filename: 'input.ts',
    output: `// https://github.com/babel/babel/pull/15361
function fooBar(arrayOfThings) {
  var _loopResult;
  var _loop = index => {
    var thing = arrayOfThings[index];
    var someMapObj = {};
    var arrow = x => someMapObj;
    arrow(0);
    return {
      type: 'normal',
      vars: [index],
    };
  };
  for (var index = 0; index < arrayOfThings.length; index++) {
    _loopResult = _loop(index);
    index = _loopResult.vars[0];
  }
}
fooBar([1, 2, 3]);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — updated for binding with tdz enabled (input)',
    source: `for (let index = 0; index < 10; index++) {
  index++;
  () => index;
}
`,
    filename: 'input.js',
    output: `var _loopResult;
var _loop = index => {
  index++;
  () => index;
  return {
    type: 'normal',
    vars: [index],
  };
};
for (var index = 0; index < 10; index++) {
  _loopResult = _loop(index);
  index = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'regression — wrap closure updated shadow variables (input)',
    source: `// https://github.com/babel/babel/issues/15397

var i;
for (let i = 0; i < 1; ) {
  i++
  () => i;
}
`,
    filename: 'input.js',
    output: `// https://github.com/babel/babel/issues/15397
var i;
var _loopResult;
var _loop = i => {
  i++;
  () => i;
  return {
    type: 'normal',
    vars: [i],
  };
};
for (var _i = 0; _i < 1;) {
  _loopResult = _loop(_i);
  _i = _loopResult.vars[0];
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — block ref function call (exec)',
    source: `expect(() => {
  f();

  const f = function f() {}
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `expect(() => {
  f();
  var f = function f() {};
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — block ref function call (input)',
    source: `f();

const f = function f() {}
`,
    filename: 'input.js',
    output: `f();
var f = function f() {};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — const readonly (exec)',
    source: `function callNow(f) {
  f();
}

function callLater(f) {
  return () => f();
}

expect(() => {
  const x = 0;
  x = 1;
}).toThrow(TypeError);

expect(() => {
  x = 1;
  const x = 0;
}).toThrow(ReferenceError);

expect(() => {
  callNow(() => {
    x = 1;
  });
  const x = 0;
}).toThrow(ReferenceError);


expect(() => {
  const call = callLater(() => {
    x = 1;
  });
  const x = 0;
  call();
}).toThrow(TypeError);
`,
    filename: 'exec.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
function callNow(f) {
  f();
}
function callLater(f) {
  return () => f();
}
expect(() => {
  var x = 0;
  (1, _readOnlyError('x'));
}).toThrow(TypeError);
expect(() => {
  (1, _readOnlyError('x'));
  var x = 0;
}).toThrow(ReferenceError);
expect(() => {
  callNow(() => {
    (1, _readOnlyError('x'));
  });
  var x = 0;
}).toThrow(ReferenceError);
expect(() => {
  var call = callLater(() => {
    (1, _readOnlyError('x'));
  });
  var x = 0;
  call();
}).toThrow(TypeError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — const readonly (input)',
    source: `maybeCallLater(function () {
  x = 2;
});

const x = 0;
x = 1;
`,
    filename: 'input.js',
    output: `var _readOnlyValue;
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
maybeCallLater(function () {
  (2, _readOnlyError('x'));
});
var x = 0;
(1, _readOnlyError('x'));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — destructured self reference (exec)',
    source: `expect(() => {
  let { b: d } = { d }
}).toThrow(ReferenceError);`,
    filename: 'exec.js',
    output: `expect(() => {
  var { b: d } = { d };
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — destructured self reference (input)',
    source: `let { b: d } = { d }
`,
    filename: 'input.js',
    output: 'var { b: d } = { d };',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — exported fn (input)',
    source: `import { foo } from "somewhere";

// foo might call "bar"
foo();

a;

let a;

a;

export function bar() {
  return a;
}
`,
    filename: 'input.mjs',
    output: `import { foo } from 'somewhere';
// foo might call "bar"
foo();
a;
var a;
a;
export function bar() {
  return a;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call after (exec)',
    source: `expect(() => {
  function f() {
    x;
  }
  let x;
  f();
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `expect(() => {
  function f() {
    x;
  }
  var x;
  f();
}).not.toThrow();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call after (input)',
    source: `function f() {
    x;
}
let x;
f();
`,
    filename: 'input.js',
    output: `function f() {
  x;
}
var x;
f();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call before (exec)',
    source: `expect(() => {
  function f() {
    x;
  }
  f();
  let x;
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `expect(() => {
  function f() {
    x;
  }
  f();
  var x;
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call before (input)',
    source: `function f() {
    x;
}
f();
let x;
`,
    filename: 'input.js',
    output: `function f() {
  x;
}
f();
var x;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call maybe real after (exec)',
    source: `expect(() => {
  function f() { x }
  Math.random() === 2 && f();
  let x;
  f();
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `expect(() => {
  function f() {
    x;
  }
  Math.random() === 2 && f();
  var x;
  f();
}).not.toThrow();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call maybe real after (input)',
    source: `function f() { x }
Math.random() === 2 && f();
let x;
f();
`,
    filename: 'input.js',
    output: `function f() {
  x;
}
Math.random() === 2 && f();
var x;
f();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call maybe value assign (exec)',
    source: `function f() { x }
Math.random() === 2 && f();
let x = 3;

expect(x).toBe(3);
`,
    filename: 'exec.js',
    output: `function f() {
  x;
}
Math.random() === 2 && f();
var x = 3;
expect(x).toBe(3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call maybe value assign (input)',
    source: `function f() { x }
Math.random() === 2 && f();
let x = 3;

expect(x).toBe(3);
`,
    filename: 'input.js',
    output: `function f() {
  x;
}
Math.random() === 2 && f();
var x = 3;
expect(x).toBe(3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call maybe (exec)',
    source: `// "random" :)
let random = (i => {
  const vals = [0, 0, 1, 1];
  return () => vals[i++];
})(0);

expect(() => {
  function f() { x }
  random() && f();
  let x;
}).not.toThrow();

expect(() => {
  function f() { x }
  random() || f();
  let x;
}).toThrow(ReferenceError);

expect(() => {
  function f() { x }
  random() && f();
  let x;
}).toThrow(ReferenceError);

expect(() => {
  function f() { x }
  random() || f();
  let x;
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `// "random" :)
var random = (i => {
  var vals = [0, 0, 1, 1];
  return () => vals[i++];
})(0);
expect(() => {
  function f() {
    x;
  }
  random() && f();
  var x;
}).not.toThrow();
expect(() => {
  function f() {
    x;
  }
  random() || f();
  var x;
}).toThrow(ReferenceError);
expect(() => {
  function f() {
    x;
  }
  random() && f();
  var x;
}).toThrow(ReferenceError);
expect(() => {
  function f() {
    x;
  }
  random() || f();
  var x;
}).not.toThrow();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call maybe (input)',
    source: `function f() { x }
Math.random() && f();
let x;
`,
    filename: 'input.js',
    output: `function f() {
  x;
}
Math.random() && f();
var x;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call nested function (exec)',
    source: `expect(() => {
  function f() {
    return function() { x };
  }
  let g = f();
  let x;
  g();
}).not.toThrow();

expect(() => {
  function f() {
    return function() { x };
  }
  let g = f();
  g();
  let x;
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `expect(() => {
  function f() {
    return function () {
      x;
    };
  }
  var g = f();
  var x;
  g();
}).not.toThrow();
expect(() => {
  function f() {
    return function () {
      x;
    };
  }
  var g = f();
  g();
  var x;
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call nested function (input)',
    source: `function f() {
  return function() { x };
}
f();
let x;`,
    filename: 'input.js',
    output: `function f() {
  return function () {
    x;
  };
}
f();
var x;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call recursive after (exec)',
    source: `expect(() => {
  function f(i) {
    if (i) f(i - 1);
    x;
  }

  let x;
  f(3);
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `expect(() => {
  function f(i) {
    if (i) f(i - 1);
    x;
  }
  var x;
  f(3);
}).not.toThrow();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call recursive after (input)',
    source: `function f(i) {
  if (i) f(i - 1);
  x;
}

let x;
f(3);
`,
    filename: 'input.js',
    output: `function f(i) {
  if (i) f(i - 1);
  x;
}
var x;
f(3);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call recursive before (exec)',
    source: `expect(() => {
  function f(i) {
    if (i) f(i - 1);
    x;
  }

  f(3);
  let x;
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `expect(() => {
  function f(i) {
    if (i) f(i - 1);
    x;
  }
  f(3);
  var x;
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call recursive before (input)',
    source: `function f(i) {
  if (i) f(i - 1);
  x;
}

f(3);
let x;
`,
    filename: 'input.js',
    output: `function f(i) {
  if (i) f(i - 1);
  x;
}
f(3);
var x;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call recursive reference (exec)',
    source: `expect(() => {
  function f(i) {
    return () => {
      x;
      f(i - 1);
    };
  }

  const g = f(1);
  let x;
  g();
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `expect(() => {
  function f(i) {
    return () => {
      x;
      f(i - 1);
    };
  }
  var g = f(1);
  var x;
  g();
}).not.toThrow();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function call recursive reference (input)',
    source: `function f(i) {
  return () => {
    x;
    f(i - 1);
  };
}

const g = f(1);
let x;
g();
`,
    filename: 'input.js',
    output: `function f(i) {
  return () => {
    x;
    f(i - 1);
  };
}
var g = f(1);
var x;
g();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function expression (input)',
    source: `f(() => a);
let a;

let b;
f(() => b);
`,
    filename: 'input.js',
    output: `f(() => a);
var a;
var b;
f(() => b);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — function ref (input)',
    source: `function f() { x }
maybeCall(f);
let x;
`,
    filename: 'input.js',
    output: `function f() {
  x;
}
maybeCall(f);
var x;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — hoisted function (exec)',
    source: `expect(() => {
  f();

  function f() {}
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `expect(() => {
  f();

  function f() {}
}).not.toThrow();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — hoisted function (input)',
    source: `f();

function f() {}
`,
    filename: 'input.js',
    output: `f();

function f() {}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — hoisted var (exec)',
    source: `expect(() => {
  x = 3;

  var x;
}).not.toThrow();
`,
    filename: 'exec.js',
    output: `expect(() => {
  x = 3;

  var x;
}).not.toThrow();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — hoisted var (input)',
    source: `x = 3;

var x;
`,
    filename: 'input.js',
    output: `x = 3;

var x;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — self reference (exec)',
    source: `expect(() => {
  let x = x;
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `expect(() => {
  var x = x;
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — self reference (input)',
    source: `let x = x;
`,
    filename: 'input.js',
    output: 'var x = x;',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — shadow outer var (exec)',
    source: `expect(() => {
  var a = 5;
  if (a) {
    a;
    let a = 2;
  }
  a;
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `expect(() => {
  var a = 5;
  if (a) {
    _a;
    var _a = 2;
  }
  a;
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — shadow outer var (input)',
    source: `var a = 5;
if (a) {
  a;
  let a = 2;
}
a;
`,
    filename: 'input.js',
    output: `var a = 5;
if (a) {
  _a;
  var _a = 2;
}
a;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — simple assign no tdz (exec)',
    source: `let i
i = 2;
`,
    filename: 'exec.js',
    output: `var i;
i = 2;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — simple assign no tdz (input)',
    source: `let i
i = 2;
`,
    filename: 'input.js',
    output: `var i;
i = 2;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — simple assign (exec)',
    source: `expect(() => {
  i = 2;
  let i
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `expect(() => {
  i = 2;
  var i;
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — simple assign (input)',
    source: `i = 2;
let i
`,
    filename: 'input.js',
    output: `i = 2;
var i;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — simple reference (exec)',
    source: `expect(() => {
  i
  let i
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `expect(() => {
  i;
  var i;
}).toThrow(ReferenceError);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — simple reference (input)',
    source: `i
let i
`,
    filename: 'input.js',
    output: `i;
var i;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — switch shadow (input)',
    source: `let x;
switch (x) {
  default: let x;
}
`,
    filename: 'input.js',
    output: `var x;
switch (x) {
  default:
    var _x;
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
  {
    title: 'tdz — update expression (input)',
    source: `maybeCallLater(function f() {
  x++;
  ++x;
  x.p++;
  ++x.p;
});

x++;
++x;
x.p++;
++x.p;

let x;
`,
    filename: 'input.js',
    output: `maybeCallLater(function f() {
  x++;
  ++x;
  x.p++;
  ++x.p;
});
x++;
++x;
x.p++;
++x.p;
var x;`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            blockScoping: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
