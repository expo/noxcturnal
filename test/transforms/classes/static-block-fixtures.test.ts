import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass A {}\nf1();\n_defineProperty(A, 'bar', 3);\nf2();\n(() => {\n  do f3();\n  while (false);\n})();\nvar _foo = { _: 4 };",
  'class Foo {\n  static bar = 42;\n  static #_ = (this.foo = Foo.bar);\n}\nconst oldFoo = Foo;\nFoo = null;\nexpect(oldFoo.foo).toBe(42);',
  'class Foo {\n  static bar = 42;\n  static #_ = (this.foo = Foo.bar);\n}\nexpect(Foo.foo).toBe(42);',
  'class Foo {\n  static bar = 42;\n  static #_ = (this.foo = this.bar);\n}\nexpect(Foo.foo).toBe(42);',
  'class Foo {\n  static #_ = (this.foo = 42);\n}\nexpect(Foo.foo).toBe(42);',
  "let Foo = class {\n  static #_ = (() => {\n    expect(this.name).toBe('Foo');\n    if (false) use(this);\n  })();\n};\nlet obj = {\n  ['someName']: class {\n    static x = expect(this.name).toBe('someName');\n    static #_ = (() => {\n      if (false) use(this);\n      expect(this.name).toBe('someName');\n    })();\n  },\n};\nexpect(Foo.name).toBe('Foo');\nexpect(obj.someName.name).toBe('someName');",
  'class Foo extends class extends class Base {\n  static #_ = (this.qux = 21);\n} {\n  static #_ = (this.bar = 21);\n} {\n  static #_ = (this.foo = this.bar + this.qux);\n}\nexpect(Foo.foo).toBe(42);',
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {}\n_Foo = Foo;\nvar _bar = { _: 21 };\n(() => {\n  _Foo.foo = _assertClassBrand(_Foo, _Foo, _bar)._;\n  _Foo.qux1 = _Foo.qux;\n})();\n_defineProperty(Foo, 'qux', 21);\n_Foo.qux2 = _Foo.qux;\nexpect(Foo.foo).toBe(21);\nexpect(Foo.qux1).toBe(undefined);\nexpect(Foo.qux2).toBe(21);",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {}\n_Foo = Foo;\nvar _bar = { _: 21 };\n(() => {\n  _Foo.foo = _assertClassBrand(_Foo, _Foo, _bar)._;\n  _Foo.qux1 = _Foo.qux;\n})();\n(() => {\n  if (foo) bar;\n})();\n_defineProperty(Foo, 'qux', 21);\n_Foo.qux2 = _Foo.qux;",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _Foo;\nclass Foo {}\n_Foo = Foo;\nvar _ = { _: 42 };\n_Foo.foo = _assertClassBrand(_Foo, _Foo, _)._;\nexpect(Foo.foo).toBe(42);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var __ = '__private_Foo__';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  // static block can not be transformed as `#_` here\n  (function () {\n    this.foo = _classPrivateFieldLooseBase(this, __)[__];\n  }).call(Foo);\n  Object.defineProperty(Foo, __, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return Foo;\n})();\nexpect(Foo.foo).toBe(42);",
  "class Base {\n  constructor() {\n    this.Foo = class {\n      static #_ = (this.foo = new.target);\n    };\n  }\n}\nexpect(new Base().Foo).toHaveProperty('foo', undefined);",
  'class Base {\n  constructor() {\n    this.Foo = class {\n      static #_ = (this.foo = new.target);\n    };\n  }\n}\nexpect(new Base().Foo.foo).toBe(undefined);',
  'class Foo {\n  bar = 21;\n  static #_ = (this.foo = this.bar);\n}\nexpect(Foo.foo).toBe(undefined);',
  'class C {\n  /* before 1 */\n  static #_ = (() => {})();\n  /* after 1 */\n  /* before 2 */\n  static #_2 = (this.foo = 42);\n  /* after 2 */\n  /* before 3 */\n  static #_3 = (() => {\n    /* before this.bar */\n    this.bar = 42;\n    this.bar = 42;\n  })(/* after this.bar */);\n}',
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _Foo;\nlet getFoo;\nclass Foo {}\n_Foo = Foo;\nvar _foo = { _: 42 };\ngetFoo = () => _assertClassBrand(_Foo, _Foo, _foo)._;\nexpect(getFoo()).toBe(42);",
  'class Foo extends class {\n  static bar = 42;\n} {\n  static bar = 21;\n  static #_ = (this.foo = super.bar);\n}\nexpect(Foo.foo).toBe(42);',
  'class Foo extends class {\n  static #_ = (this.bar = 42);\n} {\n  static bar = 21;\n  static #_ = (this.foo = super.bar);\n}\nexpect(Foo.foo).toBe(42);',
  'let res = [];\nlet foo = 1;\nclass A {\n  static #_ = (() => {\n    var foo = 3;\n  })();\n  static #_2 = res.push(foo);\n  static x;\n  static #_3 = (() => {\n    var foo = 4;\n  })();\n  static #_4 = res.push(foo);\n}\nexpect(res).toEqual([1, 1]);',
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {}\n_Foo = Foo;\nvar _bar = { _: 21 };\n(() => {\n  _Foo.foo = _assertClassBrand(_Foo, _Foo, _bar)._;\n  _Foo.qux1 = _Foo.qux;\n})();\n_defineProperty(Foo, 'qux', 21);\n_Foo.qux2 = _Foo.qux;",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _bar = '__private_Foo_bar';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _bar, {\n    writable: true,\n    value: 21,\n  });\n  (function () {\n    this.foo = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar);\n  }).call(Foo);\n  return Foo;\n})();\nexpect(Foo.foo).toBe(true);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet getFoo;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  (function () {\n    getFoo = () => _classPrivateMethodCall(this, _foo, []);\n  }).call(Foo);\n  Object.defineProperty(Foo, _foo, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return 42;\n    },\n  });\n  return Foo;\n})();\nexpect(getFoo()).toBe(42);",
] as const;

export const fixtureCases = [
  {
    title: 'class static block — before static fields (input)',
    source:
      'class A {\n  static {\n    f1();\n  }\n  static bar = 3;\n  static {\n    f2();\n  }\n  static {\n    do f3(); while (false);\n  }\n  static #foo = 4;\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'class static block — class binding (exec)',
    source:
      'class Foo {\n  static bar = 42;\n  static {\n    this.foo = Foo.bar;\n  }\n}\nconst oldFoo = Foo;\nFoo = null;\n\nexpect(oldFoo.foo).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'class static block — class binding (input)',
    source:
      'class Foo {\n  static bar = 42;\n  static {\n    this.foo = Foo.bar;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'class static block — class declaration (exec)',
    source:
      'class Foo {\n  static bar = 42;\n  static {\n    this.foo = this.bar;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'class static block — class declaration (input)',
    source:
      'class Foo {\n  static bar = 42;\n  static {\n    this.foo = this.bar;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'class static block — class expression (exec)',
    source: 'class Foo {\n  static {\n    this.foo = 42;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'class static block — class inferred name (exec)',
    source:
      'let Foo = class {\n  static {\n    expect(this.name).toBe("Foo");\n    if (false) use(this);\n  }\n};\n\nlet obj = {\n  ["someName"]: class {\n    static x = expect(this.name).toBe("someName");\n    static {\n      if (false) use(this);\n      expect(this.name).toBe("someName");\n    }\n  }\n};\n\nexpect(Foo.name).toBe("Foo");\nexpect(obj.someName.name).toBe("someName");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'class static block — class inferred name (input)',
    source:
      'let Foo = class {\n  static {\n    expect(this.name).toBe("Foo");\n    if (false) use(this);\n  }\n};\n\nlet obj = {\n  ["someName"]: class {\n    static x = expect(this.name).toBe("someName");\n    static {\n      if (false) use(this);\n      expect(this.name).toBe("someName");\n    }\n  }\n};\n\nexpect(Foo.name).toBe("Foo");\nexpect(obj.someName.name).toBe("someName");\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'class static block — in class heritage (exec)',
    source:
      'class Foo extends class extends class Base {\n  static {\n    this.qux = 21;\n  }\n} {\n  static {\n    this.bar = 21;\n  }\n} {\n  static {\n    this.foo = this.bar + this.qux;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'class static block — in class heritage (input)',
    source:
      'class Foo extends class extends class Base {\n  static {\n    this.qux = 21;\n  }\n} {\n  static {\n    this.bar = 21;\n  }\n} {\n  static {\n    this.foo = this.bar + this.qux;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'class static block — multiple static initializers (exec)',
    source:
      'class Foo {\n  static #bar = 21;\n  static {\n    this.foo = this.#bar;\n    this.qux1 = this.qux;\n  }\n  static qux = 21;\n  static {\n    this.qux2 = this.qux;\n  }\n}\nexpect(Foo.foo).toBe(21);\nexpect(Foo.qux1).toBe(undefined);\nexpect(Foo.qux2).toBe(21);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'class static block — multiple static initializers (input)',
    source:
      'class Foo {\n  static #bar = 21;\n  static {\n    this.foo = this.#bar;\n    this.qux1 = this.qux;\n  }\n  static {\n    if (foo) bar;\n  }\n  static qux = 21;\n  static {\n    this.qux2 = this.qux;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'class static block — name conflict (exec)',
    source:
      'class Foo {\n  static #_ = 42;\n  // static block can not be transformed as `#_` here\n  static {\n    this.foo = this.#_;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'class static block — name conflict (input)',
    source:
      'class Foo {\n  static #_() {};\n  // static block can not be transformed as `#_` here\n  static {\n    this.foo = this.#_;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'class static block — new target (exec)',
    source:
      "class Base {\n  constructor() {\n    this.Foo = class {\n      static {\n        this.foo = new.target;\n      }\n    }\n  }\n}\nexpect((new Base).Foo).toHaveProperty('foo', undefined);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'class static block — new target (input)',
    source:
      'class Base {\n  constructor() {\n    this.Foo = class {\n      static {\n        this.foo = new.target;\n      }\n    }\n  }\n}\nexpect((new Base).Foo.foo).toBe(undefined);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'class static block — non static (exec)',
    source:
      'class Foo {\n  bar = 21;\n  static {\n    this.foo = this.bar;\n  }\n}\nexpect(Foo.foo).toBe(undefined);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'class static block — preserve comments (input)',
    source:
      'class C {\n  /* before 1 */\n  static {}\n  /* after 1 */\n\n  /* before 2 */\n  static {\n    /* before this.foo */\n    this.foo = 42;\n    /* after this.foo */\n  }\n  /* after 2 */\n\n  /* before 3 */\n  static {\n    /* before this.bar */\n    this.bar = 42;\n    this.bar = 42;\n    /* after this.bar */\n  }\n  /* after 3 */\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'class static block — private elements access (exec)',
    source:
      'let getFoo;\nclass Foo {\n  static #foo = 42;\n  static {\n    getFoo = () => this.#foo;\n  }\n}\nexpect(getFoo()).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'class static block — super property (exec)',
    source:
      'class Foo extends class {\n  static bar = 42;\n} {\n  static bar = 21;\n  static {\n    this.foo = super.bar;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'class static block — super static block (exec)',
    source:
      'class Foo extends class {\n  static {\n    this.bar = 42;\n  }\n} {\n  static bar = 21;\n  static {\n    this.foo = super.bar;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'class static block — var scope (exec)',
    source:
      'let res = [];\nlet foo = 1;\nclass A {\n  static {\n    var foo = 3;\n  }\n  static {\n    res.push(foo);\n  }\n  static x;\n  static {\n    var foo = 4;\n  }\n  static {\n    res.push(foo);\n  }\n}\nexpect(res).toEqual([1, 1]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'class static block — var scope (input)',
    source:
      'let res = [];\nlet foo = 1;\nclass A {\n  static {\n    var foo = 3;\n  }\n  static {\n    res.push(foo);\n  }\n  static x;\n  static {\n    var foo = 4;\n  }\n  static {\n    res.push(foo);\n  }\n}\nexpect(res).toEqual([1, 1]);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'integration loose — .new target (exec)',
    source:
      'class Base {\n  constructor() {\n    this.Foo = class {\n      static {\n        this.foo = new.target;\n      }\n    }\n  }\n}\nexpect((new Base).Foo.foo).toBe(undefined);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'integration loose — multiple static initializers (input)',
    source:
      'class Foo {\n  static #bar = 21;\n  static {\n    this.foo = this.#bar;\n    this.qux1 = this.qux;\n  }\n  static qux = 21;\n  static {\n    this.qux2 = this.qux;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'integration loose — name conflict (input)',
    source:
      'class Foo {\n  static #_ = 42;\n  // static block can not be transformed as `#_` here\n  static {\n    this.foo = this.#_;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'integration loose — private in (exec)',
    source:
      'class Foo {\n  static #bar = 21;\n  static {\n    this.foo = #bar in this;\n  }\n}\nexpect(Foo.foo).toBe(true);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'integration loose — private methods access (exec)',
    source:
      'let getFoo;\nclass Foo {\n  static #foo() { return 42 };\n  static {\n    getFoo = () => this.#foo();\n  }\n}\nexpect(getFoo()).toBe(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'integration loose — super static block (input)',
    source:
      'class Foo extends class {\n  static {\n    this.bar = 42;\n  }\n} {\n  static bar = 21;\n  static {\n    this.foo = super.bar;\n  }\n}\nexpect(Foo.foo).toBe(42);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classStaticBlock: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[17],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
