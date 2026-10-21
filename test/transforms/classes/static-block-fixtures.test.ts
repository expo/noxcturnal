import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'class static block — before static fields (input)',
    source: `class A {
  static {
    f1();
  }
  static bar = 3;
  static {
    f2();
  }
  static {
    do f3(); while (false);
  }
  static #foo = 4;
}`,
    filename: 'input.js',
    output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class A {}
f1();
_defineProperty(A, 'bar', 3);
f2();
(() => {
  do f3();
  while (false);
})();
var _foo = { _: 4 };`,
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
      },
    ],
  },
  {
    title: 'class static block — class binding (exec)',
    source: `class Foo {
  static bar = 42;
  static {
    this.foo = Foo.bar;
  }
}
const oldFoo = Foo;
Foo = null;

expect(oldFoo.foo).toBe(42);
`,
    filename: 'exec.js',
    output: `var _staticBlock;
let Foo =
  (class Foo {
    static bar = (_value => ((_staticBlock = () => ((this.foo = Foo.bar), this)), _value))(42);
  },
  _staticBlock());
const oldFoo = Foo;
Foo = null;
expect(oldFoo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — class binding (input)',
    source: `class Foo {
  static bar = 42;
  static {
    this.foo = Foo.bar;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'input.js',
    output: `var _staticBlock;
let Foo =
  (class Foo {
    static bar = (_value => ((_staticBlock = () => ((this.foo = Foo.bar), this)), _value))(42);
  },
  _staticBlock());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — class declaration (exec)',
    source: `class Foo {
  static bar = 42;
  static {
    this.foo = this.bar;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'exec.js',
    output: `var _staticBlock;
let Foo =
  (class Foo {
    static bar = (_value => ((_staticBlock = () => ((this.foo = this.bar), this)), _value))(42);
  },
  _staticBlock());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — class declaration (input)',
    source: `class Foo {
  static bar = 42;
  static {
    this.foo = this.bar;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'input.js',
    output: `var _staticBlock;
let Foo =
  (class Foo {
    static bar = (_value => ((_staticBlock = () => ((this.foo = this.bar), this)), _value))(42);
  },
  _staticBlock());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — class expression (exec)',
    source: `class Foo {
  static {
    this.foo = 42;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'exec.js',
    output: `var _staticBlock;
let Foo =
  (class Foo {
    static #_ = (_staticBlock = () => ((this.foo = 42), this));
  },
  _staticBlock());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — class inferred name (exec)',
    source: `let Foo = class {
  static {
    expect(this.name).toBe("Foo");
    if (false) use(this);
  }
};

let obj = {
  ["someName"]: class {
    static x = expect(this.name).toBe("someName");
    static {
      if (false) use(this);
      expect(this.name).toBe("someName");
    }
  }
};

expect(Foo.name).toBe("Foo");
expect(obj.someName.name).toBe("someName");
`,
    filename: 'exec.js',
    output: `var _staticBlock, _staticBlock2;
let Foo =
  ({
    Foo: class {
      static #_ = (_staticBlock = () => (
        (() => {
          expect(this.name).toBe('Foo');
          if (false) use(this);
        })(),
        this
      ));
    },
  }['Foo'],
  _staticBlock());
let obj = {
  ['someName']:
    ({
      someName: class {
        static x = (_value => (
          (_staticBlock2 = () => (
            (() => {
              if (false) use(this);
              expect(this.name).toBe('someName');
            })(),
            this
          )),
          _value
        ))(expect(this.name).toBe('someName'));
      },
    }['someName'],
    _staticBlock2()),
};
expect(Foo.name).toBe('Foo');
expect(obj.someName.name).toBe('someName');`,
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
      },
    ],
  },
  {
    title: 'class static block — class inferred name (input)',
    source: `let Foo = class {
  static {
    expect(this.name).toBe("Foo");
    if (false) use(this);
  }
};

let obj = {
  ["someName"]: class {
    static x = expect(this.name).toBe("someName");
    static {
      if (false) use(this);
      expect(this.name).toBe("someName");
    }
  }
};

expect(Foo.name).toBe("Foo");
expect(obj.someName.name).toBe("someName");
`,
    filename: 'input.js',
    output: `var _staticBlock, _staticBlock2;
let Foo =
  ({
    Foo: class {
      static #_ = (_staticBlock = () => (
        (() => {
          expect(this.name).toBe('Foo');
          if (false) use(this);
        })(),
        this
      ));
    },
  }['Foo'],
  _staticBlock());
let obj = {
  ['someName']:
    ({
      someName: class {
        static x = (_value => (
          (_staticBlock2 = () => (
            (() => {
              if (false) use(this);
              expect(this.name).toBe('someName');
            })(),
            this
          )),
          _value
        ))(expect(this.name).toBe('someName'));
      },
    }['someName'],
    _staticBlock2()),
};
expect(Foo.name).toBe('Foo');
expect(obj.someName.name).toBe('someName');`,
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
      },
    ],
  },
  {
    title: 'class static block — in class heritage (exec)',
    source: `class Foo extends class extends class Base {
  static {
    this.qux = 21;
  }
} {
  static {
    this.bar = 21;
  }
} {
  static {
    this.foo = this.bar + this.qux;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'exec.js',
    output: `var _staticBlock, _staticBlock2, _staticBlock3;
let Foo =
  (class Foo extends (class extends (class Base {
    static #_ = (_staticBlock = () => ((this.qux = 21), this));
  },
  _staticBlock()) {
    static #_ = (_staticBlock2 = () => ((this.bar = 21), this));
  },
  _staticBlock2()) {
    static #_ = (_staticBlock3 = () => ((this.foo = this.bar + this.qux), this));
  },
  _staticBlock3());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — in class heritage (input)',
    source: `class Foo extends class extends class Base {
  static {
    this.qux = 21;
  }
} {
  static {
    this.bar = 21;
  }
} {
  static {
    this.foo = this.bar + this.qux;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'input.js',
    output: `var _staticBlock, _staticBlock2, _staticBlock3;
let Foo =
  (class Foo extends (class extends (class Base {
    static #_ = (_staticBlock = () => ((this.qux = 21), this));
  },
  _staticBlock()) {
    static #_ = (_staticBlock2 = () => ((this.bar = 21), this));
  },
  _staticBlock2()) {
    static #_ = (_staticBlock3 = () => ((this.foo = this.bar + this.qux), this));
  },
  _staticBlock3());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — multiple static initializers (exec)',
    source: `class Foo {
  static #bar = 21;
  static {
    this.foo = this.#bar;
    this.qux1 = this.qux;
  }
  static qux = 21;
  static {
    this.qux2 = this.qux;
  }
}
expect(Foo.foo).toBe(21);
expect(Foo.qux1).toBe(undefined);
expect(Foo.qux2).toBe(21);
`,
    filename: 'exec.js',
    output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {}
_Foo = Foo;
var _bar = { _: 21 };
(() => {
  _Foo.foo = _assertClassBrand(_Foo, _Foo, _bar)._;
  _Foo.qux1 = _Foo.qux;
})();
_defineProperty(Foo, 'qux', 21);
_Foo.qux2 = _Foo.qux;
expect(Foo.foo).toBe(21);
expect(Foo.qux1).toBe(undefined);
expect(Foo.qux2).toBe(21);`,
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
      },
    ],
  },
  {
    title: 'class static block — multiple static initializers (input)',
    source: `class Foo {
  static #bar = 21;
  static {
    this.foo = this.#bar;
    this.qux1 = this.qux;
  }
  static {
    if (foo) bar;
  }
  static qux = 21;
  static {
    this.qux2 = this.qux;
  }
}
`,
    filename: 'input.js',
    output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {}
_Foo = Foo;
var _bar = { _: 21 };
(() => {
  _Foo.foo = _assertClassBrand(_Foo, _Foo, _bar)._;
  _Foo.qux1 = _Foo.qux;
})();
(() => {
  if (foo) bar;
})();
_defineProperty(Foo, 'qux', 21);
_Foo.qux2 = _Foo.qux;`,
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
      },
    ],
  },
  {
    title: 'class static block — name conflict (exec)',
    source: `class Foo {
  static #_ = 42;
  // static block can not be transformed as \`#_\` here
  static {
    this.foo = this.#_;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'exec.js',
    output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _Foo;
class Foo {}
_Foo = Foo;
var _ = { _: 42 };
_Foo.foo = _assertClassBrand(_Foo, _Foo, _)._;
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — name conflict (input)',
    source: `class Foo {
  static #_() {};
  // static block can not be transformed as \`#_\` here
  static {
    this.foo = this.#_;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Foo = (() => {
  'use strict';
  var __ = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo__');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  Object.defineProperty(Foo, __, { value: _privateMethod });
  // static block can not be transformed as \`#_\` here
  (function () {
    this.foo = _classPrivateFieldLooseBase(this, __)[__];
  }).call(Foo);
  return Foo;
})();
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — new target (exec)',
    source: `class Base {
  constructor() {
    this.Foo = class {
      static {
        this.foo = new.target;
      }
    }
  }
}
expect((new Base).Foo).toHaveProperty('foo', undefined);
`,
    filename: 'exec.js',
    output: `class Base {
  constructor() {
    var _staticBlock;
    this.Foo =
      (class {
        static #_ = (_staticBlock = () => ((this.foo = new.target), this));
      },
      _staticBlock());
  }
}
expect(new Base().Foo).toHaveProperty('foo', undefined);`,
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
      },
    ],
  },
  {
    title: 'class static block — new target (input)',
    source: `class Base {
  constructor() {
    this.Foo = class {
      static {
        this.foo = new.target;
      }
    }
  }
}
expect((new Base).Foo.foo).toBe(undefined);
`,
    filename: 'input.js',
    output: `class Base {
  constructor() {
    var _staticBlock;
    this.Foo =
      (class {
        static #_ = (_staticBlock = () => ((this.foo = new.target), this));
      },
      _staticBlock());
  }
}
expect(new Base().Foo.foo).toBe(undefined);`,
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
      },
    ],
  },
  {
    title: 'class static block — non static (exec)',
    source: `class Foo {
  bar = 21;
  static {
    this.foo = this.bar;
  }
}
expect(Foo.foo).toBe(undefined);
`,
    filename: 'exec.js',
    output: `var _staticBlock;
let Foo =
  (class Foo {
    bar = 21;
    static #_ = (_staticBlock = () => ((this.foo = this.bar), this));
  },
  _staticBlock());
expect(Foo.foo).toBe(undefined);`,
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
      },
    ],
  },
  {
    title: 'class static block — preserve comments (input)',
    source: `class C {
  /* before 1 */
  static {}
  /* after 1 */

  /* before 2 */
  static {
    /* before this.foo */
    this.foo = 42;
    /* after this.foo */
  }
  /* after 2 */

  /* before 3 */
  static {
    /* before this.bar */
    this.bar = 42;
    this.bar = 42;
    /* after this.bar */
  }
  /* after 3 */
}
`,
    filename: 'input.js',
    output: `var _staticBlock;
let C =
  (class C {
    static #_ = (_staticBlock = () => (
      (() => {})(),
      (this.foo = 42),
      (() => {
        /* before this.bar */
        this.bar = 42;
        this.bar = 42;
      })(/* after this.bar */),
      this
    ));
  },
  _staticBlock());`,
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
      },
    ],
  },
  {
    title: 'class static block — private elements access (exec)',
    source: `let getFoo;
class Foo {
  static #foo = 42;
  static {
    getFoo = () => this.#foo;
  }
}
expect(getFoo()).toBe(42);
`,
    filename: 'exec.js',
    output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _Foo;
let getFoo;
class Foo {}
_Foo = Foo;
var _foo = { _: 42 };
getFoo = () => _assertClassBrand(_Foo, _Foo, _foo)._;
expect(getFoo()).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — super property (exec)',
    source: `class Foo extends class {
  static bar = 42;
} {
  static bar = 21;
  static {
    this.foo = super.bar;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'exec.js',
    output: `var _staticBlock;
let Foo =
  (class Foo extends class {
    static bar = 42;
  } {
    static bar = (_value => ((_staticBlock = () => ((this.foo = super.bar), this)), _value))(21);
  },
  _staticBlock());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — super static block (exec)',
    source: `class Foo extends class {
  static {
    this.bar = 42;
  }
} {
  static bar = 21;
  static {
    this.foo = super.bar;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'exec.js',
    output: `var _staticBlock, _staticBlock2;
let Foo =
  (class Foo extends (class {
    static #_ = (_staticBlock = () => ((this.bar = 42), this));
  },
  _staticBlock()) {
    static bar = (_value => ((_staticBlock2 = () => ((this.foo = super.bar), this)), _value))(21);
  },
  _staticBlock2());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'class static block — var scope (exec)',
    source: `let res = [];
let foo = 1;
class A {
  static {
    var foo = 3;
  }
  static {
    res.push(foo);
  }
  static x;
  static {
    var foo = 4;
  }
  static {
    res.push(foo);
  }
}
expect(res).toEqual([1, 1]);
`,
    filename: 'exec.js',
    output: `var _staticBlock;
let res = [];
let foo = 1;
let A =
  (class A {
    static x = (_value => (
      (_staticBlock = () => (
        (() => {
          var foo = 4;
        })(),
        res.push(foo),
        this
      )),
      _value
    ))(
      ((() => {
        var foo = 3;
      })(),
      res.push(foo),
      void 0),
    );
  },
  _staticBlock());
expect(res).toEqual([1, 1]);`,
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
      },
    ],
  },
  {
    title: 'class static block — var scope (input)',
    source: `let res = [];
let foo = 1;
class A {
  static {
    var foo = 3;
  }
  static {
    res.push(foo);
  }
  static x;
  static {
    var foo = 4;
  }
  static {
    res.push(foo);
  }
}
expect(res).toEqual([1, 1]);
`,
    filename: 'input.js',
    output: `var _staticBlock;
let res = [];
let foo = 1;
let A =
  (class A {
    static x = (_value => (
      (_staticBlock = () => (
        (() => {
          var foo = 4;
        })(),
        res.push(foo),
        this
      )),
      _value
    ))(
      ((() => {
        var foo = 3;
      })(),
      res.push(foo),
      void 0),
    );
  },
  _staticBlock());
expect(res).toEqual([1, 1]);`,
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
      },
    ],
  },
  {
    title: 'integration loose — .new target (exec)',
    source: `class Base {
  constructor() {
    this.Foo = class {
      static {
        this.foo = new.target;
      }
    }
  }
}
expect((new Base).Foo.foo).toBe(undefined);
`,
    filename: 'exec.js',
    output: `class Base {
  constructor() {
    var _staticBlock;
    this.Foo =
      (class {
        static #_ = (_staticBlock = () => ((this.foo = new.target), this));
      },
      _staticBlock());
  }
}
expect(new Base().Foo.foo).toBe(undefined);`,
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
      },
    ],
  },
  {
    title: 'integration loose — multiple static initializers (input)',
    source: `class Foo {
  static #bar = 21;
  static {
    this.foo = this.#bar;
    this.qux1 = this.qux;
  }
  static qux = 21;
  static {
    this.qux2 = this.qux;
  }
}
`,
    filename: 'input.js',
    output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {}
_Foo = Foo;
var _bar = { _: 21 };
(() => {
  _Foo.foo = _assertClassBrand(_Foo, _Foo, _bar)._;
  _Foo.qux1 = _Foo.qux;
})();
_defineProperty(Foo, 'qux', 21);
_Foo.qux2 = _Foo.qux;`,
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
      },
    ],
  },
  {
    title: 'integration loose — name conflict (input)',
    source: `class Foo {
  static #_ = 42;
  // static block can not be transformed as \`#_\` here
  static {
    this.foo = this.#_;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'input.js',
    output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _Foo;
class Foo {}
_Foo = Foo;
var _ = { _: 42 };
_Foo.foo = _assertClassBrand(_Foo, _Foo, _)._;
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'integration loose — private in (exec)',
    source: `class Foo {
  static #bar = 21;
  static {
    this.foo = #bar in this;
  }
}
expect(Foo.foo).toBe(true);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  Object.defineProperty(Foo, _bar, {
    writable: true,
    value: 21,
  });
  (function () {
    this.foo = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar);
  }).call(Foo);
  return Foo;
})();
expect(Foo.foo).toBe(true);`,
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
      },
    ],
  },
  {
    title: 'integration loose — private methods access (exec)',
    source: `let getFoo;
class Foo {
  static #foo() { return 42 };
  static {
    getFoo = () => this.#foo();
  }
}
expect(getFoo()).toBe(42);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let getFoo;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 42;
  };
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  Object.defineProperty(Foo, _foo, { value: _privateMethod });
  (function () {
    getFoo = () => _classPrivateFieldLooseBase(this, _foo)[_foo]();
  }).call(Foo);
  return Foo;
})();
expect(getFoo()).toBe(42);`,
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
      },
    ],
  },
  {
    title: 'integration loose — super static block (input)',
    source: `class Foo extends class {
  static {
    this.bar = 42;
  }
} {
  static bar = 21;
  static {
    this.foo = super.bar;
  }
}
expect(Foo.foo).toBe(42);
`,
    filename: 'input.js',
    output: `var _staticBlock, _staticBlock2;
let Foo =
  (class Foo extends (class {
    static #_ = (_staticBlock = () => ((this.bar = 42), this));
  },
  _staticBlock()) {
    static bar = (_value => ((_staticBlock2 = () => ((this.foo = super.bar), this)), _value))(21);
  },
  _staticBlock2());
expect(Foo.foo).toBe(42);`,
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
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
