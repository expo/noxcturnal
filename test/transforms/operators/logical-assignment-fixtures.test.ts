import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'logical assignment — anonymous functions exec (exec)',
    source: `var a, b = true, c;

a ||= function () {};
b &&= function () {};
c ??= function () {};

expect(a.name).toBe("a");
expect(b.name).toBe("b");
expect(c.name).toBe("c");
`,
    filename: 'exec.js',
    output: `var a,
  b = true,
  c;
a || (a = function () {});
b && (b = function () {});
c ?? (c = function () {});
expect(a.name).toBe('a');
expect(b.name).toBe('b');
expect(c.name).toBe('c');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — anonymous functions transform (input)',
    source: `var a;
a ||= function () {};
a &&= function () {};
a ??= function () {};
`,
    filename: 'input.js',
    output: `var a;
a || (a = function () {});
a && (a = function () {});
a ?? (a = function () {});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — arrow functions exec (exec)',
    source: `var a, b = true, c;

a ||= () => {};
b &&= () => {};
c ??= () => {};

expect(a.name).toBe("a");
expect(b.name).toBe("b");
expect(c.name).toBe("c");
`,
    filename: 'exec.js',
    output: `var a,
  b = true,
  c;
a || (a = () => {});
b && (b = () => {});
c ?? (c = () => {});
expect(a.name).toBe('a');
expect(b.name).toBe('b');
expect(c.name).toBe('c');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — arrow functions transform (input)',
    source: `var a;
a ||= () => {};
a &&= () => {};
a ??= () => {};
`,
    filename: 'input.js',
    output: `var a;
a || (a = () => {});
a && (a = () => {});
a ?? (a = () => {});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — general semantics (input)',
    source: `var x = 0;
var sets = 0;
var obj = {
  get x() {
    return x;
  },

  set x(value) {
    sets++;
    x = value;
  },
};

expect(obj.x ||= 1).toBe(1);
expect(sets).toBe(1);
expect(obj.x ||= 2).toBe(1);
expect(sets).toBe(1);

expect(obj.x &&= 0).toBe(0);
expect(sets).toBe(2);
expect(obj.x &&= 3).toBe(0);
expect(sets).toBe(2);

var gets = 0;
var deep = {
  get obj() {
    gets++;
    return obj;
  },
};

expect(deep.obj.x ||= 1).toBe(1);
expect(gets).toBe(1);
expect(deep.obj.x ||= 2).toBe(1);
expect(gets).toBe(2);

expect(deep.obj.x &&= 0).toBe(0);
expect(gets).toBe(3);
expect(deep.obj.x &&= 3).toBe(0);
expect(gets).toBe(4);

var key = 0;
expect(obj[++key] ||= 1).toBe(1);
expect(key).toBe(1);
key = 0;
expect(obj[++key] ||= 2).toBe(1);
expect(key).toBe(1);

key = 0;
expect(obj[++key] &&= 0).toBe(0);
expect(key).toBe(1);
key = 0;
expect(obj[++key] &&= 3).toBe(0);
expect(key).toBe(1);

key = 0;
expect(deep.obj[++key] ||= 1).toBe(1);
expect(gets).toBe(5);
expect(key).toBe(1);
key = 0;
expect(deep.obj[++key] ||= 2).toBe(1);
expect(gets).toBe(6);
expect(key).toBe(1);

key = 0;
expect(deep.obj[++key] &&= 0).toBe(0);
expect(gets).toBe(7);
expect(key).toBe(1);
key = 0;
expect(deep.obj[++key] &&= 3).toBe(0);
expect(gets).toBe(8);
expect(key).toBe(1);
`,
    filename: 'input.js',
    output: `var _deep$obj,
  _deep$obj2,
  _deep$obj3,
  _deep$obj4,
  _key,
  _key2,
  _key3,
  _key4,
  _deep$obj5,
  _key5,
  _deep$obj6,
  _key6,
  _deep$obj7,
  _key7,
  _deep$obj8,
  _key8;
var x = 0;
var sets = 0;
var obj = {
  get x() {
    return x;
  },
  set x(value) {
    sets++;
    x = value;
  },
};
expect(obj.x || (obj.x = 1)).toBe(1);
expect(sets).toBe(1);
expect(obj.x || (obj.x = 2)).toBe(1);
expect(sets).toBe(1);
expect(obj.x && (obj.x = 0)).toBe(0);
expect(sets).toBe(2);
expect(obj.x && (obj.x = 3)).toBe(0);
expect(sets).toBe(2);
var gets = 0;
var deep = {
  get obj() {
    gets++;
    return obj;
  },
};
expect((_deep$obj = deep.obj).x || (_deep$obj.x = 1)).toBe(1);
expect(gets).toBe(1);
expect((_deep$obj2 = deep.obj).x || (_deep$obj2.x = 2)).toBe(1);
expect(gets).toBe(2);
expect((_deep$obj3 = deep.obj).x && (_deep$obj3.x = 0)).toBe(0);
expect(gets).toBe(3);
expect((_deep$obj4 = deep.obj).x && (_deep$obj4.x = 3)).toBe(0);
expect(gets).toBe(4);
var key = 0;
expect(obj[(_key = ++key)] || (obj[_key] = 1)).toBe(1);
expect(key).toBe(1);
key = 0;
expect(obj[(_key2 = ++key)] || (obj[_key2] = 2)).toBe(1);
expect(key).toBe(1);
key = 0;
expect(obj[(_key3 = ++key)] && (obj[_key3] = 0)).toBe(0);
expect(key).toBe(1);
key = 0;
expect(obj[(_key4 = ++key)] && (obj[_key4] = 3)).toBe(0);
expect(key).toBe(1);
key = 0;
expect((_deep$obj5 = deep.obj)[(_key5 = ++key)] || (_deep$obj5[_key5] = 1)).toBe(1);
expect(gets).toBe(5);
expect(key).toBe(1);
key = 0;
expect((_deep$obj6 = deep.obj)[(_key6 = ++key)] || (_deep$obj6[_key6] = 2)).toBe(1);
expect(gets).toBe(6);
expect(key).toBe(1);
key = 0;
expect((_deep$obj7 = deep.obj)[(_key7 = ++key)] && (_deep$obj7[_key7] = 0)).toBe(0);
expect(gets).toBe(7);
expect(key).toBe(1);
key = 0;
expect((_deep$obj8 = deep.obj)[(_key8 = ++key)] && (_deep$obj8[_key8] = 3)).toBe(0);
expect(gets).toBe(8);
expect(key).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — named functions exec (exec)',
    source: `var a, b = true, c;

a ||= function d() {};
b &&= function e() {};
c ??= function f() {};

expect(a.name).toBe("d");
expect(b.name).toBe("e");
expect(c.name).toBe("f");
`,
    filename: 'exec.js',
    output: `var a,
  b = true,
  c;
a || (a = function d() {});
b && (b = function e() {});
c ?? (c = function f() {});
expect(a.name).toBe('d');
expect(b.name).toBe('e');
expect(c.name).toBe('f');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — named functions transform (input)',
    source: `var a;
a ||= function d() {};
a &&= function e() {};
a ??= function f() {};
`,
    filename: 'input.js',
    output: `var a;
a || (a = function d() {});
a && (a = function e() {});
a ?? (a = function f() {});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — null coalescing without other (input)',
    source: `let o;
o ??= {};
o.a ??= 1;
o["b"] ??= 2;
`,
    filename: 'input.js',
    output: `var _o, _o2;
let o;
o ?? (o = {});
(_o = o).a ?? (_o.a = 1);
(_o2 = o)['b'] ?? (_o2['b'] = 2);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — null coalescing (exec)',
    source: `var x = undefined;
var sets = 0;
var obj = {
  get x() {
    return x;
  },

  set x(value) {
    sets++;
    x = value;
  },
};

expect(obj.x ??= 1).toBe(1);
expect(sets).toBe(1);
expect(obj.x ??= 2).toBe(1);
expect(sets).toBe(1);

var gets = 0;
var deep = {
  get obj() {
    gets++;
    return obj;
  },
};

obj.x = undefined;
expect(deep.obj.x ??= 1).toBe(1);
expect(gets).toBe(1);
expect(deep.obj.x ??= 2).toBe(1);
expect(gets).toBe(2);

var key = 0;
obj.x = undefined;
expect(obj[++key] ??= 1).toBe(1);
expect(key).toBe(1);
key = 0;
expect(obj[++key] ??= 2).toBe(1);
expect(key).toBe(1);

obj.x = undefined;
key = 0;
expect(deep.obj[++key] ??= 1).toBe(1);
expect(gets).toBe(3);
expect(key).toBe(1);
key = 0;
expect(deep.obj[++key] ??= 2).toBe(1);
expect(gets).toBe(4);
expect(key).toBe(1);
`,
    filename: 'exec.js',
    output: `var _deep$obj, _deep$obj2, _key, _key2, _deep$obj3, _key3, _deep$obj4, _key4;
var x = undefined;
var sets = 0;
var obj = {
  get x() {
    return x;
  },
  set x(value) {
    sets++;
    x = value;
  },
};
expect(obj.x ?? (obj.x = 1)).toBe(1);
expect(sets).toBe(1);
expect(obj.x ?? (obj.x = 2)).toBe(1);
expect(sets).toBe(1);
var gets = 0;
var deep = {
  get obj() {
    gets++;
    return obj;
  },
};
obj.x = undefined;
expect((_deep$obj = deep.obj).x ?? (_deep$obj.x = 1)).toBe(1);
expect(gets).toBe(1);
expect((_deep$obj2 = deep.obj).x ?? (_deep$obj2.x = 2)).toBe(1);
expect(gets).toBe(2);
var key = 0;
obj.x = undefined;
expect(obj[(_key = ++key)] ?? (obj[_key] = 1)).toBe(1);
expect(key).toBe(1);
key = 0;
expect(obj[(_key2 = ++key)] ?? (obj[_key2] = 2)).toBe(1);
expect(key).toBe(1);
obj.x = undefined;
key = 0;
expect((_deep$obj3 = deep.obj)[(_key3 = ++key)] ?? (_deep$obj3[_key3] = 1)).toBe(1);
expect(gets).toBe(3);
expect(key).toBe(1);
key = 0;
expect((_deep$obj4 = deep.obj)[(_key4 = ++key)] ?? (_deep$obj4[_key4] = 2)).toBe(1);
expect(gets).toBe(4);
expect(key).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
  {
    title: 'logical assignment — null coalescing (input)',
    source: `var x = undefined;
var sets = 0;
var obj = {
  get x() {
    return x;
  },

  set x(value) {
    sets++;
    x = value;
  },
};

expect(obj.x ??= 1).toBe(1);
expect(sets, 1);
expect(obj.x ??= 2).toBe(1);
expect(sets, 1);

var gets = 0;
var deep = {
  get obj() {
    gets++;
    return obj;
  },
};

obj.x = undefined;
expect(deep.obj.x ??= 1).toBe(1);
expect(gets, 1);
expect(deep.obj.x ??= 2).toBe(1);
expect(gets, 2);

var key = 0;
obj.x = undefined;
expect(obj[++key] ??= 1).toBe(1);
expect(key, 1);
key = 0;
expect(obj[++key] ??= 2).toBe(1);
expect(key, 1);

obj.x = undefined;
key = 0;
expect(deep.obj[++key] ??= 1).toBe(1);
expect(gets, 3);
expect(key, 1);
key = 0;
expect(deep.obj[++key] ??= 2).toBe(1);
expect(gets, 4);
expect(key, 1);
`,
    filename: 'input.js',
    output: `var _deep$obj, _deep$obj2, _key, _key2, _deep$obj3, _key3, _deep$obj4, _key4;
var x = undefined;
var sets = 0;
var obj = {
  get x() {
    return x;
  },
  set x(value) {
    sets++;
    x = value;
  },
};
expect(obj.x ?? (obj.x = 1)).toBe(1);
expect(sets, 1);
expect(obj.x ?? (obj.x = 2)).toBe(1);
expect(sets, 1);
var gets = 0;
var deep = {
  get obj() {
    gets++;
    return obj;
  },
};
obj.x = undefined;
expect((_deep$obj = deep.obj).x ?? (_deep$obj.x = 1)).toBe(1);
expect(gets, 1);
expect((_deep$obj2 = deep.obj).x ?? (_deep$obj2.x = 2)).toBe(1);
expect(gets, 2);
var key = 0;
obj.x = undefined;
expect(obj[(_key = ++key)] ?? (obj[_key] = 1)).toBe(1);
expect(key, 1);
key = 0;
expect(obj[(_key2 = ++key)] ?? (obj[_key2] = 2)).toBe(1);
expect(key, 1);
obj.x = undefined;
key = 0;
expect((_deep$obj3 = deep.obj)[(_key3 = ++key)] ?? (_deep$obj3[_key3] = 1)).toBe(1);
expect(gets, 3);
expect(key, 1);
key = 0;
expect((_deep$obj4 = deep.obj)[(_key4 = ++key)] ?? (_deep$obj4[_key4] = 2)).toBe(1);
expect(gets, 4);
expect(key, 1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
