import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var a,\n  b = true,\n  c;\na || (a = function () {});\nb && (b = function () {});\nc ?? (c = function () {});\nexpect(a.name).toBe('a');\nexpect(b.name).toBe('b');\nexpect(c.name).toBe('c');",
  'var a;\na || (a = function () {});\na && (a = function () {});\na ?? (a = function () {});',
  "var a,\n  b = true,\n  c;\na || (a = () => {});\nb && (b = () => {});\nc ?? (c = () => {});\nexpect(a.name).toBe('a');\nexpect(b.name).toBe('b');\nexpect(c.name).toBe('c');",
  'var a;\na || (a = () => {});\na && (a = () => {});\na ?? (a = () => {});',
  'var _deep$obj,\n  _deep$obj2,\n  _deep$obj3,\n  _deep$obj4,\n  _key,\n  _key2,\n  _key3,\n  _key4,\n  _deep$obj5,\n  _key5,\n  _deep$obj6,\n  _key6,\n  _deep$obj7,\n  _key7,\n  _deep$obj8,\n  _key8;\nvar x = 0;\nvar sets = 0;\nvar obj = {\n  get x() {\n    return x;\n  },\n  set x(value) {\n    sets++;\n    x = value;\n  },\n};\nexpect(obj.x || (obj.x = 1)).toBe(1);\nexpect(sets).toBe(1);\nexpect(obj.x || (obj.x = 2)).toBe(1);\nexpect(sets).toBe(1);\nexpect(obj.x && (obj.x = 0)).toBe(0);\nexpect(sets).toBe(2);\nexpect(obj.x && (obj.x = 3)).toBe(0);\nexpect(sets).toBe(2);\nvar gets = 0;\nvar deep = {\n  get obj() {\n    gets++;\n    return obj;\n  },\n};\nexpect((_deep$obj = deep.obj).x || (_deep$obj.x = 1)).toBe(1);\nexpect(gets).toBe(1);\nexpect((_deep$obj2 = deep.obj).x || (_deep$obj2.x = 2)).toBe(1);\nexpect(gets).toBe(2);\nexpect((_deep$obj3 = deep.obj).x && (_deep$obj3.x = 0)).toBe(0);\nexpect(gets).toBe(3);\nexpect((_deep$obj4 = deep.obj).x && (_deep$obj4.x = 3)).toBe(0);\nexpect(gets).toBe(4);\nvar key = 0;\nexpect(obj[(_key = ++key)] || (obj[_key] = 1)).toBe(1);\nexpect(key).toBe(1);\nkey = 0;\nexpect(obj[(_key2 = ++key)] || (obj[_key2] = 2)).toBe(1);\nexpect(key).toBe(1);\nkey = 0;\nexpect(obj[(_key3 = ++key)] && (obj[_key3] = 0)).toBe(0);\nexpect(key).toBe(1);\nkey = 0;\nexpect(obj[(_key4 = ++key)] && (obj[_key4] = 3)).toBe(0);\nexpect(key).toBe(1);\nkey = 0;\nexpect((_deep$obj5 = deep.obj)[(_key5 = ++key)] || (_deep$obj5[_key5] = 1)).toBe(1);\nexpect(gets).toBe(5);\nexpect(key).toBe(1);\nkey = 0;\nexpect((_deep$obj6 = deep.obj)[(_key6 = ++key)] || (_deep$obj6[_key6] = 2)).toBe(1);\nexpect(gets).toBe(6);\nexpect(key).toBe(1);\nkey = 0;\nexpect((_deep$obj7 = deep.obj)[(_key7 = ++key)] && (_deep$obj7[_key7] = 0)).toBe(0);\nexpect(gets).toBe(7);\nexpect(key).toBe(1);\nkey = 0;\nexpect((_deep$obj8 = deep.obj)[(_key8 = ++key)] && (_deep$obj8[_key8] = 3)).toBe(0);\nexpect(gets).toBe(8);\nexpect(key).toBe(1);',
  "var a,\n  b = true,\n  c;\na || (a = function d() {});\nb && (b = function e() {});\nc ?? (c = function f() {});\nexpect(a.name).toBe('d');\nexpect(b.name).toBe('e');\nexpect(c.name).toBe('f');",
  'var a;\na || (a = function d() {});\na && (a = function e() {});\na ?? (a = function f() {});',
  "var _o, _o2;\nlet o;\no ?? (o = {});\n(_o = o).a ?? (_o.a = 1);\n(_o2 = o)['b'] ?? (_o2['b'] = 2);",
  'var _deep$obj, _deep$obj2, _key, _key2, _deep$obj3, _key3, _deep$obj4, _key4;\nvar x = undefined;\nvar sets = 0;\nvar obj = {\n  get x() {\n    return x;\n  },\n  set x(value) {\n    sets++;\n    x = value;\n  },\n};\nexpect(obj.x ?? (obj.x = 1)).toBe(1);\nexpect(sets).toBe(1);\nexpect(obj.x ?? (obj.x = 2)).toBe(1);\nexpect(sets).toBe(1);\nvar gets = 0;\nvar deep = {\n  get obj() {\n    gets++;\n    return obj;\n  },\n};\nobj.x = undefined;\nexpect((_deep$obj = deep.obj).x ?? (_deep$obj.x = 1)).toBe(1);\nexpect(gets).toBe(1);\nexpect((_deep$obj2 = deep.obj).x ?? (_deep$obj2.x = 2)).toBe(1);\nexpect(gets).toBe(2);\nvar key = 0;\nobj.x = undefined;\nexpect(obj[(_key = ++key)] ?? (obj[_key] = 1)).toBe(1);\nexpect(key).toBe(1);\nkey = 0;\nexpect(obj[(_key2 = ++key)] ?? (obj[_key2] = 2)).toBe(1);\nexpect(key).toBe(1);\nobj.x = undefined;\nkey = 0;\nexpect((_deep$obj3 = deep.obj)[(_key3 = ++key)] ?? (_deep$obj3[_key3] = 1)).toBe(1);\nexpect(gets).toBe(3);\nexpect(key).toBe(1);\nkey = 0;\nexpect((_deep$obj4 = deep.obj)[(_key4 = ++key)] ?? (_deep$obj4[_key4] = 2)).toBe(1);\nexpect(gets).toBe(4);\nexpect(key).toBe(1);',
  'var _deep$obj, _deep$obj2, _key, _key2, _deep$obj3, _key3, _deep$obj4, _key4;\nvar x = undefined;\nvar sets = 0;\nvar obj = {\n  get x() {\n    return x;\n  },\n  set x(value) {\n    sets++;\n    x = value;\n  },\n};\nexpect(obj.x ?? (obj.x = 1)).toBe(1);\nexpect(sets, 1);\nexpect(obj.x ?? (obj.x = 2)).toBe(1);\nexpect(sets, 1);\nvar gets = 0;\nvar deep = {\n  get obj() {\n    gets++;\n    return obj;\n  },\n};\nobj.x = undefined;\nexpect((_deep$obj = deep.obj).x ?? (_deep$obj.x = 1)).toBe(1);\nexpect(gets, 1);\nexpect((_deep$obj2 = deep.obj).x ?? (_deep$obj2.x = 2)).toBe(1);\nexpect(gets, 2);\nvar key = 0;\nobj.x = undefined;\nexpect(obj[(_key = ++key)] ?? (obj[_key] = 1)).toBe(1);\nexpect(key, 1);\nkey = 0;\nexpect(obj[(_key2 = ++key)] ?? (obj[_key2] = 2)).toBe(1);\nexpect(key, 1);\nobj.x = undefined;\nkey = 0;\nexpect((_deep$obj3 = deep.obj)[(_key3 = ++key)] ?? (_deep$obj3[_key3] = 1)).toBe(1);\nexpect(gets, 3);\nexpect(key, 1);\nkey = 0;\nexpect((_deep$obj4 = deep.obj)[(_key4 = ++key)] ?? (_deep$obj4[_key4] = 2)).toBe(1);\nexpect(gets, 4);\nexpect(key, 1);',
] as const;

export const fixtureCases = [
  {
    title: 'logical assignment — anonymous functions exec (exec)',
    source:
      'var a, b = true, c;\n\na ||= function () {};\nb &&= function () {};\nc ??= function () {};\n\nexpect(a.name).toBe("a");\nexpect(b.name).toBe("b");\nexpect(c.name).toBe("c");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'logical assignment — anonymous functions transform (input)',
    source: 'var a;\na ||= function () {};\na &&= function () {};\na ??= function () {};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'logical assignment — arrow functions exec (exec)',
    source:
      'var a, b = true, c;\n\na ||= () => {};\nb &&= () => {};\nc ??= () => {};\n\nexpect(a.name).toBe("a");\nexpect(b.name).toBe("b");\nexpect(c.name).toBe("c");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'logical assignment — arrow functions transform (input)',
    source: 'var a;\na ||= () => {};\na &&= () => {};\na ??= () => {};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'logical assignment — general semantics (input)',
    source:
      'var x = 0;\nvar sets = 0;\nvar obj = {\n  get x() {\n    return x;\n  },\n\n  set x(value) {\n    sets++;\n    x = value;\n  },\n};\n\nexpect(obj.x ||= 1).toBe(1);\nexpect(sets).toBe(1);\nexpect(obj.x ||= 2).toBe(1);\nexpect(sets).toBe(1);\n\nexpect(obj.x &&= 0).toBe(0);\nexpect(sets).toBe(2);\nexpect(obj.x &&= 3).toBe(0);\nexpect(sets).toBe(2);\n\nvar gets = 0;\nvar deep = {\n  get obj() {\n    gets++;\n    return obj;\n  },\n};\n\nexpect(deep.obj.x ||= 1).toBe(1);\nexpect(gets).toBe(1);\nexpect(deep.obj.x ||= 2).toBe(1);\nexpect(gets).toBe(2);\n\nexpect(deep.obj.x &&= 0).toBe(0);\nexpect(gets).toBe(3);\nexpect(deep.obj.x &&= 3).toBe(0);\nexpect(gets).toBe(4);\n\nvar key = 0;\nexpect(obj[++key] ||= 1).toBe(1);\nexpect(key).toBe(1);\nkey = 0;\nexpect(obj[++key] ||= 2).toBe(1);\nexpect(key).toBe(1);\n\nkey = 0;\nexpect(obj[++key] &&= 0).toBe(0);\nexpect(key).toBe(1);\nkey = 0;\nexpect(obj[++key] &&= 3).toBe(0);\nexpect(key).toBe(1);\n\nkey = 0;\nexpect(deep.obj[++key] ||= 1).toBe(1);\nexpect(gets).toBe(5);\nexpect(key).toBe(1);\nkey = 0;\nexpect(deep.obj[++key] ||= 2).toBe(1);\nexpect(gets).toBe(6);\nexpect(key).toBe(1);\n\nkey = 0;\nexpect(deep.obj[++key] &&= 0).toBe(0);\nexpect(gets).toBe(7);\nexpect(key).toBe(1);\nkey = 0;\nexpect(deep.obj[++key] &&= 3).toBe(0);\nexpect(gets).toBe(8);\nexpect(key).toBe(1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'logical assignment — named functions exec (exec)',
    source:
      'var a, b = true, c;\n\na ||= function d() {};\nb &&= function e() {};\nc ??= function f() {};\n\nexpect(a.name).toBe("d");\nexpect(b.name).toBe("e");\nexpect(c.name).toBe("f");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'logical assignment — named functions transform (input)',
    source: 'var a;\na ||= function d() {};\na &&= function e() {};\na ??= function f() {};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'logical assignment — null coalescing without other (input)',
    source: 'let o;\no ??= {};\no.a ??= 1;\no["b"] ??= 2;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'logical assignment — null coalescing (exec)',
    source:
      'var x = undefined;\nvar sets = 0;\nvar obj = {\n  get x() {\n    return x;\n  },\n\n  set x(value) {\n    sets++;\n    x = value;\n  },\n};\n\nexpect(obj.x ??= 1).toBe(1);\nexpect(sets).toBe(1);\nexpect(obj.x ??= 2).toBe(1);\nexpect(sets).toBe(1);\n\nvar gets = 0;\nvar deep = {\n  get obj() {\n    gets++;\n    return obj;\n  },\n};\n\nobj.x = undefined;\nexpect(deep.obj.x ??= 1).toBe(1);\nexpect(gets).toBe(1);\nexpect(deep.obj.x ??= 2).toBe(1);\nexpect(gets).toBe(2);\n\nvar key = 0;\nobj.x = undefined;\nexpect(obj[++key] ??= 1).toBe(1);\nexpect(key).toBe(1);\nkey = 0;\nexpect(obj[++key] ??= 2).toBe(1);\nexpect(key).toBe(1);\n\nobj.x = undefined;\nkey = 0;\nexpect(deep.obj[++key] ??= 1).toBe(1);\nexpect(gets).toBe(3);\nexpect(key).toBe(1);\nkey = 0;\nexpect(deep.obj[++key] ??= 2).toBe(1);\nexpect(gets).toBe(4);\nexpect(key).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'logical assignment — null coalescing (input)',
    source:
      'var x = undefined;\nvar sets = 0;\nvar obj = {\n  get x() {\n    return x;\n  },\n\n  set x(value) {\n    sets++;\n    x = value;\n  },\n};\n\nexpect(obj.x ??= 1).toBe(1);\nexpect(sets, 1);\nexpect(obj.x ??= 2).toBe(1);\nexpect(sets, 1);\n\nvar gets = 0;\nvar deep = {\n  get obj() {\n    gets++;\n    return obj;\n  },\n};\n\nobj.x = undefined;\nexpect(deep.obj.x ??= 1).toBe(1);\nexpect(gets, 1);\nexpect(deep.obj.x ??= 2).toBe(1);\nexpect(gets, 2);\n\nvar key = 0;\nobj.x = undefined;\nexpect(obj[++key] ??= 1).toBe(1);\nexpect(key, 1);\nkey = 0;\nexpect(obj[++key] ??= 2).toBe(1);\nexpect(key, 1);\n\nobj.x = undefined;\nkey = 0;\nexpect(deep.obj[++key] ??= 1).toBe(1);\nexpect(gets, 3);\nexpect(key, 1);\nkey = 0;\nexpect(deep.obj[++key] ??= 2).toBe(1);\nexpect(gets, 4);\nexpect(key, 1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            logicalAssignmentOperators: true,
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
