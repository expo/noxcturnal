import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'assumption constantSuper — complex super class (input)',
    source: `class A extends class B {} {
  static x = super.x;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _superPropGet = require('@babel/runtime/helpers/superPropGet');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _A;
class A extends class B {} {}
_A = A;
_defineProperty(A, 'x', _superPropGet(_A, 'x', _A));`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _A;
class A extends class B {} {}
_A = A;
A.x = Object.getPrototypeOf(_A).x;`,
      },
    ],
  },
  {
    title: 'assumption constantSuper — instance field (input)',
    source: `class A extends B {
  foo = super.bar;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class A extends B {
  constructor(..._args) {
    super(..._args);
    _defineProperty(this, 'foo', super.bar);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class A extends B {
  constructor(..._args) {
    super(..._args);
    this.foo = super.bar;
  }
}`,
      },
    ],
  },
  {
    title: 'assumption constantSuper — static field (input)',
    source: `class A extends B {
  static foo = super.bar;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _superPropGet = require('@babel/runtime/helpers/superPropGet');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _A;
class A extends B {}
_A = A;
_defineProperty(A, 'foo', _superPropGet(_A, 'bar', _A));`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _A;
class A extends B {}
_A = A;
A.foo = Object.getPrototypeOf(_A).bar;`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional chain before member call (exec)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    expect(o?.Foo.#m()).toEqual(1);
    expect(o?.Foo.#m().toString).toEqual(1..toString);
    expect(o?.Foo.#m().toString()).toEqual('1');

    expect(deep?.very.o?.Foo.#m()).toEqual(1);
    expect(deep?.very.o?.Foo.#m().toString).toEqual(1..toString);
    expect(deep?.very.o?.Foo.#m().toString()).toEqual('1');

    expect(o?.Foo.#self.#m()).toEqual(1);
    expect(o?.Foo.#self.self.#m()).toEqual(1);
    expect(o?.Foo.#self?.self.#m()).toEqual(1);
    expect(o?.Foo.#self.self?.self.#m()).toEqual(1);
    expect(o?.Foo.#self?.self?.self.#m()).toEqual(1);

    expect(o?.Foo.#self.getSelf().#m()).toEqual(1);
    expect(o?.Foo.#self.getSelf?.().#m()).toEqual(1);
    expect(o?.Foo.#self?.getSelf().#m()).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.().#m()).toEqual(1);
    expect(o?.Foo.#self.getSelf()?.self.#m()).toEqual(1);
    expect(o?.Foo.#self.getSelf?.()?.self.#m()).toEqual(1);
    expect(o?.Foo.#self?.getSelf()?.self.#m()).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.()?.self.#m()).toEqual(1);

    expect(fn?.().Foo.#m()).toEqual(1);
    expect(fn?.().Foo.#m().toString).toEqual(1..toString);
    expect(fn?.().Foo.#m().toString()).toEqual('1');

    expect(fnDeep?.().very.o?.Foo.#m()).toEqual(1);
    expect(fnDeep?.().very.o?.Foo.#m().toString).toEqual(1..toString);
    expect(fnDeep?.().very.o?.Foo.#m().toString()).toEqual('1');

    expect(fn?.().Foo.#self.#m()).toEqual(1);
    expect(fn?.().Foo.#self.self.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.self.#m()).toEqual(1);
    expect(fn?.().Foo.#self.self?.self.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.self?.self.#m()).toEqual(1);

    expect(fn?.().Foo.#self.getSelf().#m()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.().#m()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf().#m()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.().#m()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf()?.self.#m()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.()?.self.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf()?.self.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.()?.self.#m()).toEqual(1);
  }

  static testNull() {
    const o = null;;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }

    expect(o?.Foo.#m()).toEqual(undefined);
    expect(o?.Foo.#m().toString).toEqual(undefined);
    expect(o?.Foo.#m().toString()).toEqual(undefined);

    expect(deep?.very.o?.Foo.#m()).toEqual(undefined);
    expect(deep?.very.o?.Foo.#m().toString).toEqual(undefined);
    expect(deep?.very.o?.Foo.#m().toString()).toEqual(undefined);

    expect(o?.Foo.#self.#m()).toEqual(undefined);
    expect(o?.Foo.#self.self.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.self.#m()).toEqual(undefined);
    expect(o?.Foo.#self.self?.self.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.self?.self.#m()).toEqual(undefined);

    expect(o?.Foo.#self.getSelf().#m()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.().#m()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf().#m()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.().#m()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf()?.self.#m()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.()?.self.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf()?.self.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.()?.self.#m()).toEqual(undefined);

    expect(fn?.().Foo.#m()).toEqual(undefined);
    expect(fn?.().Foo.#m().toString).toEqual(undefined);
    expect(fn?.().Foo.#m().toString()).toEqual(undefined);

    expect(fnDeep?.().very.o?.Foo.#m()).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo.#m().toString).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo.#m().toString()).toEqual(undefined);

    expect(fn?.().Foo.#self.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.self.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.self.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.self?.self.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.self?.self.#m()).toEqual(undefined);

    expect(fn?.().Foo.#self.getSelf().#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.().#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf().#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.().#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf()?.self.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.()?.self.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf()?.self.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.()?.self.#m()).toEqual(undefined);
  }
}

Foo.test();
Foo.testNull();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o,
      _deep$very$o$Foo,
      _deep$very$o2,
      _deep$very$o2$Foo,
      _deep$very$o3,
      _deep$very$o3$Foo,
      _o$Foo$self,
      _o$Foo$self$self,
      _ref,
      _ref$self,
      _ref2,
      _ref2$self,
      _self2,
      _self2$self,
      _o$Foo$self$getSelf,
      _assertClassBrand$_,
      _ref3,
      _ref3$call,
      _ref4,
      _ref4$getSelf,
      _ref5,
      _ref5$getSelf,
      _ref5$getSelf$call,
      _ref6,
      _ref6$self,
      _assertClassBrand$_2,
      _call,
      _call$self,
      _getSelf,
      _getSelf$self,
      _getSelf2,
      _getSelf2$self,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o2,
      _fnDeep$very$o2$Foo,
      _fnDeep$very$o3,
      _fnDeep$very$o3$Foo,
      _fn$Foo$self,
      _fn$Foo$self$self,
      _ref7,
      _ref7$self,
      _ref8,
      _ref8$self,
      _self3,
      _self3$self,
      _fn$Foo$self$getSelf,
      _assertClassBrand$_3,
      _ref9,
      _ref9$call,
      _ref10,
      _ref10$getSelf,
      _ref11,
      _ref11$getSelf,
      _ref11$getSelf$call,
      _ref12,
      _ref12$self,
      _assertClassBrand$_4,
      _call2,
      _call2$self,
      _getSelf3,
      _getSelf3$self,
      _getSelf4,
      _getSelf4$self;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.call(_o$Foo2).toString,
    ).toEqual((1).toString);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)
            ._.call(_o$Foo3)
            .toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._.call(
            _deep$very$o$Foo,
          ),
    ).toEqual(1);
    expect(
      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._.call(
            _deep$very$o2$Foo,
          ).toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)
            ._.call(_deep$very$o3$Foo)
            .toString(),
    ).toEqual('1');
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._), _m)._.call(
            _o$Foo$self,
          ),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),
            _m,
          )._.call(_o$Foo$self$self),
    ).toEqual(1);
    expect(
      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._.call(_ref$self),
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._.call(_ref2$self),
    ).toEqual(1);
    expect(
      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._.call(_self2$self),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
            _m,
          )._.call(_o$Foo$self$getSelf),
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
        _ref3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._.call(
            _ref3$call,
          ),
    ).toEqual(1);
    expect(
      (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._.call(_ref4$getSelf),
    ).toEqual(1);
    expect(
      (_ref5$getSelf = (_ref5 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
        null || _ref5$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._.call(
            _ref5$getSelf$call,
          ),
    ).toEqual(1);
    expect(
      (_ref6 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref6 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._.call(_ref6$self),
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_2)) === null || _call === void 0
        ? void 0
        : _assertClassBrand(Foo, (_call$self = _call.self), _m)._.call(_call$self),
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self),
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._.call(_getSelf2$self),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._.call(_fn$Foo),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._.call(_fn$Foo2).toString,
    ).toEqual((1).toString);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)
            ._.call(_fn$Foo3)
            .toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._.call(
            _fnDeep$very$o$Foo,
          ),
    ).toEqual(1);
    expect(
      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._.call(
            _fnDeep$very$o2$Foo,
          ).toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)
            ._.call(_fnDeep$very$o3$Foo)
            .toString(),
    ).toEqual('1');
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),
            _m,
          )._.call(_fn$Foo$self),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),
            _m,
          )._.call(_fn$Foo$self$self),
    ).toEqual(1);
    expect(
      (_ref7 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref7 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._.call(_ref7$self),
    ).toEqual(1);
    expect(
      (_ref8 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref8 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._.call(_ref8$self),
    ).toEqual(1);
    expect(
      (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._.call(_self3$self),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),
            _m,
          )._.call(_fn$Foo$self$getSelf),
    ).toEqual(1);
    expect(
      (_ref9 =
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
        _ref9 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._.call(
            _ref9$call,
          ),
    ).toEqual(1);
    expect(
      (_ref10 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref10 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._.call(_ref10$getSelf),
    ).toEqual(1);
    expect(
      (_ref11$getSelf = (_ref11 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.getSelf) === null || _ref11$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._.call(
            _ref11$getSelf$call,
          ),
    ).toEqual(1);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._.call(_ref12$self),
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_4)) === null || _call2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._.call(_call2$self),
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._.call(_getSelf3$self),
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._.call(_getSelf4$self),
    ).toEqual(1);
  }
  static testNull() {
    var _o$Foo4,
      _o$Foo5,
      _o$Foo6,
      _deep$very$o4,
      _deep$very$o4$Foo,
      _deep$very$o5,
      _deep$very$o5$Foo,
      _deep$very$o6,
      _deep$very$o6$Foo,
      _o$Foo$self2,
      _o$Foo$self$self2,
      _ref13,
      _ref13$self,
      _ref14,
      _ref14$self,
      _self4,
      _self4$self,
      _o$Foo$self$getSelf2,
      _assertClassBrand$_5,
      _ref15,
      _ref15$call,
      _ref16,
      _ref16$getSelf,
      _ref17,
      _ref17$getSelf,
      _ref17$getSelf$call,
      _ref18,
      _ref18$self,
      _assertClassBrand$_6,
      _call3,
      _call3$self,
      _getSelf5,
      _getSelf5$self,
      _getSelf6,
      _getSelf6$self,
      _fn$Foo4,
      _fn$Foo5,
      _fn$Foo6,
      _fnDeep$very$o4,
      _fnDeep$very$o4$Foo,
      _fnDeep$very$o5,
      _fnDeep$very$o5$Foo,
      _fnDeep$very$o6,
      _fnDeep$very$o6$Foo,
      _fn$Foo$self2,
      _fn$Foo$self$self2,
      _ref19,
      _ref19$self,
      _ref20,
      _ref20$self,
      _self5,
      _self5$self,
      _fn$Foo$self$getSelf2,
      _assertClassBrand$_7,
      _ref21,
      _ref21$call,
      _ref22,
      _ref22$getSelf,
      _ref23,
      _ref23$getSelf,
      _ref23$getSelf$call,
      _ref24,
      _ref24$self,
      _assertClassBrand$_8,
      _call4,
      _call4$self,
      _getSelf7,
      _getSelf7$self,
      _getSelf8,
      _getSelf8$self;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo4 = o.Foo), _m)._.call(_o$Foo4),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo5 = o.Foo), _m)._.call(_o$Foo5).toString,
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo6 = o.Foo), _m)
            ._.call(_o$Foo6)
            .toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o4$Foo = _deep$very$o4.Foo), _m)._.call(
            _deep$very$o4$Foo,
          ),
    ).toEqual(undefined);
    expect(
      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o5$Foo = _deep$very$o5.Foo), _m)._.call(
            _deep$very$o5$Foo,
          ).toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o6$Foo = _deep$very$o6.Foo), _m)
            ._.call(_deep$very$o6$Foo)
            .toString(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self2 = _assertClassBrand(Foo, o.Foo, _self)._),
            _m,
          )._.call(_o$Foo$self2),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$self2 = _assertClassBrand(Foo, o.Foo, _self)._.self),
            _m,
          )._.call(_o$Foo$self$self2),
    ).toEqual(undefined);
    expect(
      (_ref13 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref13 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref13$self = _ref13.self), _m)._.call(_ref13$self),
    ).toEqual(undefined);
    expect(
      (_ref14 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref14 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref14$self = _ref14.self), _m)._.call(_ref14$self),
    ).toEqual(undefined);
    expect(
      (_self4 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_self4$self = _self4.self), _m)._.call(_self4$self),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$getSelf2 = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
            _m,
          )._.call(_o$Foo$self$getSelf2),
    ).toEqual(undefined);
    expect(
      (_ref15 =
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
        _ref15 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref15$call = _ref15.call(_assertClassBrand$_5)), _m)._.call(
            _ref15$call,
          ),
    ).toEqual(undefined);
    expect(
      (_ref16 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref16 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref16$getSelf = _ref16.getSelf()), _m)._.call(_ref16$getSelf),
    ).toEqual(undefined);
    expect(
      (_ref17$getSelf = (_ref17 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
        null || _ref17$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref17$getSelf$call = _ref17$getSelf.call(_ref17)), _m)._.call(
            _ref17$getSelf$call,
          ),
    ).toEqual(undefined);
    expect(
      (_ref18 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref18 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref18$self = _ref18.self), _m)._.call(_ref18$self),
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_6)) === null || _call3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_call3$self = _call3.self), _m)._.call(_call3$self),
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf5$self = _getSelf5.self), _m)._.call(_getSelf5$self),
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf6$self = _getSelf6.self), _m)._.call(_getSelf6$self),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo4 = fn().Foo), _m)._.call(_fn$Foo4),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo5 = fn().Foo), _m)._.call(_fn$Foo5).toString,
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo6 = fn().Foo), _m)
            ._.call(_fn$Foo6)
            .toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o4$Foo = _fnDeep$very$o4.Foo), _m)._.call(
            _fnDeep$very$o4$Foo,
          ),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o5$Foo = _fnDeep$very$o5.Foo), _m)._.call(
            _fnDeep$very$o5$Foo,
          ).toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o6$Foo = _fnDeep$very$o6.Foo), _m)
            ._.call(_fnDeep$very$o6$Foo)
            .toString(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self2 = _assertClassBrand(Foo, fn().Foo, _self)._),
            _m,
          )._.call(_fn$Foo$self2),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self$self2 = _assertClassBrand(Foo, fn().Foo, _self)._.self),
            _m,
          )._.call(_fn$Foo$self$self2),
    ).toEqual(undefined);
    expect(
      (_ref19 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref19 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref19$self = _ref19.self), _m)._.call(_ref19$self),
    ).toEqual(undefined);
    expect(
      (_ref20 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref20 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref20$self = _ref20.self), _m)._.call(_ref20$self),
    ).toEqual(undefined);
    expect(
      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self5 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_self5$self = _self5.self), _m)._.call(_self5$self),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self$getSelf2 = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),
            _m,
          )._.call(_fn$Foo$self$getSelf2),
    ).toEqual(undefined);
    expect(
      (_ref21 =
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
        _ref21 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref21$call = _ref21.call(_assertClassBrand$_7)), _m)._.call(
            _ref21$call,
          ),
    ).toEqual(undefined);
    expect(
      (_ref22 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref22 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref22$getSelf = _ref22.getSelf()), _m)._.call(_ref22$getSelf),
    ).toEqual(undefined);
    expect(
      (_ref23$getSelf = (_ref23 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.getSelf) === null || _ref23$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref23$getSelf$call = _ref23$getSelf.call(_ref23)), _m)._.call(
            _ref23$getSelf$call,
          ),
    ).toEqual(undefined);
    expect(
      (_ref24 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref24 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref24$self = _ref24.self), _m)._.call(_ref24$self),
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_8)) === null || _call4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_call4$self = _call4.self), _m)._.call(_call4$self),
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf7$self = _getSelf7.self), _m)._.call(_getSelf7$self),
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf8$self = _getSelf8.self), _m)._.call(_getSelf8$self),
    ).toEqual(undefined);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();
Foo.testNull();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _classPrivateFieldLoo,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _classPrivateFieldLoo2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _classPrivateFieldLoo3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _classPrivateFieldLoo4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m](),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[
            _m
          ](),
    ).toEqual(1);
    expect(
      (_ref =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref2.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self2.self, _m)[_m](),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),
            _m,
          )[_m](),
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
        null || _ref3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref4 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref5$getSelf = (_ref5 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
        ?.getSelf) === null || _ref5$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref6 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref6.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo2)) === null || _call === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m](),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[
            _m
          ](),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[
            _m
          ](),
    ).toEqual(1);
    expect(
      (_ref7 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref7.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref8 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref8.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self3.self, _m)[_m](),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
            _m,
          )[_m](),
    ).toEqual(1);
    expect(
      (_ref9 =
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
              .getSelf) === null || _ref9 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref10 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref11$getSelf = (_ref11 =
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
        ?.getSelf) === null || _ref11$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref12 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref12.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call2.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m](),
    ).toEqual(1);
  }
  static testNull() {
    var _deep$very$o4,
      _deep$very$o5,
      _deep$very$o6,
      _ref13,
      _ref14,
      _self4,
      _classPrivateFieldLoo5,
      _ref15,
      _ref16,
      _ref17,
      _ref17$getSelf,
      _ref18,
      _classPrivateFieldLoo6,
      _call3,
      _getSelf5,
      _getSelf6,
      _fnDeep$very$o4,
      _fnDeep$very$o5,
      _fnDeep$very$o6,
      _ref19,
      _ref20,
      _self5,
      _classPrivateFieldLoo7,
      _ref21,
      _ref22,
      _ref23,
      _ref23$getSelf,
      _ref24,
      _classPrivateFieldLoo8,
      _call4,
      _getSelf7,
      _getSelf8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m](),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString,
    ).toEqual(undefined);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o4.Foo, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o5.Foo, _m)[_m]().toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o6.Foo, _m)[_m]().toString(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m](),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[
            _m
          ](),
    ).toEqual(undefined);
    expect(
      (_ref13 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref13 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref13.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref14 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref14 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref14.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self4 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self4.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),
            _m,
          )[_m](),
    ).toEqual(undefined);
    expect(
      (_ref15 =
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
        null || _ref15 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref15.call(_classPrivateFieldLoo5), _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref16 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref16 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref16.getSelf(), _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref17$getSelf = (_ref17 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
        ?.getSelf) === null || _ref17$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref17$getSelf.call(_ref17), _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref18 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null ||
        _ref18 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref18.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo6)) === null || _call3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call3.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf5.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf6.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m](),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString,
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o4.Foo, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o5.Foo, _m)[_m]().toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o6.Foo, _m)[_m]().toString(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[
            _m
          ](),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[
            _m
          ](),
    ).toEqual(undefined);
    expect(
      (_ref19 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref19 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref19.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref20 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref20 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref20.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self5 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self5.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
            _m,
          )[_m](),
    ).toEqual(undefined);
    expect(
      (_ref21 =
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
              .getSelf) === null || _ref21 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref21.call(_classPrivateFieldLoo7), _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref22 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref22 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref22.getSelf(), _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref23$getSelf = (_ref23 =
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
        ?.getSelf) === null || _ref23$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref23$getSelf.call(_ref23), _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref24 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref24 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref24.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo8)) === null || _call4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call4.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf7.self, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf8.self, _m)[_m](),
    ).toEqual(undefined);
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();
Foo.testNull();`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional chain before member call (input)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    o?.Foo.#m();
    o?.Foo.#m().toString;
    o?.Foo.#m().toString();

    deep?.very.o?.Foo.#m();
    deep?.very.o?.Foo.#m().toString;
    deep?.very.o?.Foo.#m().toString();

    o?.Foo.#self.#m();
    o?.Foo.#self.self.#m();
    o?.Foo.#self?.self.#m();
    o?.Foo.#self.self?.self.#m();
    o?.Foo.#self?.self?.self.#m();

    o?.Foo.#self.getSelf().#m();
    o?.Foo.#self.getSelf?.().#m();
    o?.Foo.#self?.getSelf().#m();
    o?.Foo.#self?.getSelf?.().#m();
    o?.Foo.#self.getSelf()?.self.#m();
    o?.Foo.#self.getSelf?.()?.self.#m();
    o?.Foo.#self?.getSelf()?.self.#m();
    o?.Foo.#self?.getSelf?.()?.self.#m();

    fn?.().Foo.#m();
    fn?.().Foo.#m().toString;
    fn?.().Foo.#m().toString();

    fnDeep?.().very.o?.Foo.#m();
    fnDeep?.().very.o?.Foo.#m().toString;
    fnDeep?.().very.o?.Foo.#m().toString();

    fn?.().Foo.#self.#m();
    fn?.().Foo.#self.self.#m();
    fn?.().Foo.#self?.self.#m();
    fn?.().Foo.#self.self?.self.#m();
    fn?.().Foo.#self?.self?.self.#m();

    fn?.().Foo.#self.getSelf().#m();
    fn?.().Foo.#self.getSelf?.().#m();
    fn?.().Foo.#self?.getSelf().#m();
    fn?.().Foo.#self?.getSelf?.().#m();
    fn?.().Foo.#self.getSelf()?.self.#m();
    fn?.().Foo.#self.getSelf?.()?.self.#m();
    fn?.().Foo.#self?.getSelf()?.self.#m();
    fn?.().Foo.#self?.getSelf?.()?.self.#m();
  }
}

Foo.test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o,
      _deep$very$o$Foo,
      _deep$very$o2,
      _deep$very$o2$Foo,
      _deep$very$o3,
      _deep$very$o3$Foo,
      _o$Foo$self,
      _o$Foo$self$self,
      _ref,
      _ref$self,
      _ref2,
      _ref2$self,
      _self2,
      _self2$self,
      _o$Foo$self$getSelf,
      _assertClassBrand$_,
      _ref3,
      _ref3$call,
      _ref4,
      _ref4$getSelf,
      _ref5,
      _ref5$getSelf,
      _ref5$getSelf$call,
      _ref6,
      _ref6$self,
      _assertClassBrand$_2,
      _call,
      _call$self,
      _getSelf,
      _getSelf$self,
      _getSelf2,
      _getSelf2$self,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o2,
      _fnDeep$very$o2$Foo,
      _fnDeep$very$o3,
      _fnDeep$very$o3$Foo,
      _fn$Foo$self,
      _fn$Foo$self$self,
      _ref7,
      _ref7$self,
      _ref8,
      _ref8$self,
      _self3,
      _self3$self,
      _fn$Foo$self$getSelf,
      _assertClassBrand$_3,
      _ref9,
      _ref9$call,
      _ref10,
      _ref10$getSelf,
      _ref11,
      _ref11$getSelf,
      _ref11$getSelf$call,
      _ref12,
      _ref12$self,
      _assertClassBrand$_4,
      _call2,
      _call2$self,
      _getSelf3,
      _getSelf3$self,
      _getSelf4,
      _getSelf4$self;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo);
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.call(_o$Foo2).toString;
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)
          ._.call(_o$Foo3)
          .toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._.call(_deep$very$o$Foo);
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._.call(
          _deep$very$o2$Foo,
        ).toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)
          ._.call(_deep$very$o3$Foo)
          .toString();
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._), _m)._.call(
          _o$Foo$self,
        );
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),
          _m,
        )._.call(_o$Foo$self$self);
    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._.call(_ref$self);
    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
      null || _ref2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._.call(_ref2$self);
    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
      ?.self) === null || _self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._.call(_self2$self);
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
          _m,
        )._.call(_o$Foo$self$getSelf);
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
    _ref3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._.call(
          _ref3$call,
        );
    (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref4 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._.call(_ref4$getSelf);
    (_ref5$getSelf = (_ref5 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
      null || _ref5$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._.call(
          _ref5$getSelf$call,
        );
    (_ref6 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
      null || _ref6 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._.call(_ref6$self);
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_2)) === null || _call === void 0
      ? void 0
      : _assertClassBrand(Foo, (_call$self = _call.self), _m)._.call(_call$self);
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self);
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._.call(_getSelf2$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._.call(_fn$Foo);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._.call(_fn$Foo2).toString;
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)
          ._.call(_fn$Foo3)
          .toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._.call(
          _fnDeep$very$o$Foo,
        );
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._.call(
          _fnDeep$very$o2$Foo,
        ).toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)
          ._.call(_fnDeep$very$o3$Foo)
          .toString();
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),
          _m,
        )._.call(_fn$Foo$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),
          _m,
        )._.call(_fn$Foo$self$self);
    (_ref7 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref7 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._.call(_ref7$self);
    (_ref8 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
      null || _ref8 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._.call(_ref8$self);
    (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.self) === null || _self3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._.call(_self3$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),
          _m,
        )._.call(_fn$Foo$self$getSelf);
    (_ref9 =
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
    _ref9 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._.call(
          _ref9$call,
        );
    (_ref10 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref10 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._.call(_ref10$getSelf);
    (_ref11$getSelf = (_ref11 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.getSelf) === null || _ref11$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._.call(
          _ref11$getSelf$call,
        );
    (_ref12 =
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._.call(_ref12$self);
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_4)) === null || _call2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._.call(_call2$self);
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._.call(_getSelf3$self);
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._.call(_getSelf4$self);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _classPrivateFieldLoo,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _classPrivateFieldLoo2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _classPrivateFieldLoo3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _classPrivateFieldLoo4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]();
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString;
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m]();
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]().toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]().toString();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[
          _m
        ]();
    (_ref =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref.self, _m)[_m]();
    (_ref2 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref2.self, _m)[_m]();
    (_self2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.self) === null || _self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self2.self, _m)[_m]();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(), _m)[
          _m
        ]();
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
      null || _ref3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m]();
    (_ref4 =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m]();
    (_ref5$getSelf = (_ref5 =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
      ?.getSelf) === null || _ref5$getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m]();
    (_ref6 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref6.self, _m)[_m]();
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo2)) === null || _call === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call.self, _m)[_m]();
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m]();
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m]();
    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString;
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m]();
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]().toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]().toString();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[_m]();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[
          _m
        ]();
    (_ref7 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref7.self, _m)[_m]();
    (_ref8 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref8.self, _m)[_m]();
    (_self3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self) === null || _self3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self3.self, _m)[_m]();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(
          _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
          _m,
        )[_m]();
    (_ref9 =
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
            .getSelf) === null || _ref9 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m]();
    (_ref10 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m]();
    (_ref11$getSelf = (_ref11 =
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
      ?.getSelf) === null || _ref11$getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m]();
    (_ref12 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
    _ref12 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref12.self, _m)[_m]();
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call2.self, _m)[_m]();
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m]();
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m]();
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional chain cast to boolean (exec)',
    source: `class C {
  static #a = {
    b: {
      c: {
        d: 2,
      },
    },
  };
  static testIf(o) {
    if (o?.#a.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    return o?.#a.b?.c.d ? true : false;
  }
  static testLoop(o) {
    while (o?.#a.b.c.d) {
      for (; o?.#a.b.c?.d; ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o?.#a.b?.c.d);
      }
    }
    return false;
  }
  static testNegate(o) {
    return !!o?.#a.b?.c.d;
  }
  static testIfDeep(o) {
    if (o.obj?.#a.b?.c.d) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    return o.obj?.#a.b?.c.d ? true : false;
  }
  static testLoopDeep(o) {
    while (o.obj?.#a.b.c.d) {
      for (; o.obj?.#a.b.c?.d; ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o.obj?.#a.b?.c.d);
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    return !!o.obj?.#a.b?.c.d;
  }

  static testLogicalInIf(o) {
    if (o?.#a.b?.c.d && o?.#a?.b.c.d) {
      return true;
    }
    return false;
  }

  static testLogicalInReturn(o) {
    return o?.#a.b?.c.d && o?.#a?.b.c.d;
  }

  static testNullishCoalescing(o) {
    if (o?.#a.b?.c.non_existent ?? o?.#a.b?.c.d) {
      return o?.#a.b?.c.non_existent ?? o?.#a.b?.c.d;
    }
    return o?.#a.b?.c.non_existent ?? o;
  }

  static test() {
    const c = C;
    expect(C.testIf(c)).toBe(true);
    expect(C.testConditional(c)).toBe(true);
    expect(C.testLoop(c)).toBe(true);
    expect(C.testNegate(c)).toBe(true);

    expect(C.testIfDeep({ obj: c })).toBe(true);
    expect(C.testConditionalDeep({ obj: c })).toBe(true);
    expect(C.testLoopDeep({ obj: c })).toBe(true);
    expect(C.testNegateDeep({ obj: c })).toBe(true);

    expect(C.testLogicalInIf(c)).toBe(true);
    expect(C.testLogicalInReturn(c)).toBe(2);

    expect(C.testNullishCoalescing(c)).toBe(2);
  }

  static testNullish() {
    for (const n of [null, undefined]) {
      expect(C.testIf(n)).toBe(false);
      expect(C.testConditional(n)).toBe(false);
      expect(C.testLoop(n)).toBe(false);
      expect(C.testNegate(n)).toBe(false);

      expect(C.testIfDeep({ obj: n })).toBe(false);
      expect(C.testConditionalDeep({ obj: n })).toBe(false);
      expect(C.testLoopDeep({ obj: n })).toBe(false);
      expect(C.testNegateDeep({ obj: n })).toBe(false);

      expect(C.testLogicalInIf(n)).toBe(false);
      expect(C.testLogicalInReturn(n)).toBe(undefined);

      expect(C.testNullishCoalescing(n)).toBe(n);
    }
  }
}

C.test();
C.testNullish();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class C {
  static testIf(o) {
    if (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    return (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d
      ? true
      : false;
  }
  static testLoop(o) {
    while (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c.d) {
      for (; (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c)?.d;) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while ((o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d);
      }
    }
    return false;
  }
  static testNegate(o) {
    return !!(o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d;
  }
  static testIfDeep(o) {
    var _o$obj;
    if (
      ((_o$obj = o.obj) === null || _o$obj === void 0
        ? void 0
        : _assertClassBrand(C, _o$obj, _a)._.b
      )?.c.d
    ) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    var _o$obj2;
    return ((_o$obj2 = o.obj) === null || _o$obj2 === void 0
      ? void 0
      : _assertClassBrand(C, _o$obj2, _a)._.b
    )?.c.d
      ? true
      : false;
  }
  static testLoopDeep(o) {
    var _o$obj3;
    while (
      (_o$obj3 = o.obj) === null || _o$obj3 === void 0
        ? void 0
        : _assertClassBrand(C, _o$obj3, _a)._.b.c.d
    ) {
      var _o$obj4;
      for (
        ;
        ((_o$obj4 = o.obj) === null || _o$obj4 === void 0
          ? void 0
          : _assertClassBrand(C, _o$obj4, _a)._.b.c
        )?.d;
      ) {
        var _o$obj5;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          ((_o$obj5 = o.obj) === null || _o$obj5 === void 0
            ? void 0
            : _assertClassBrand(C, _o$obj5, _a)._.b
          )?.c.d
        );
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    var _o$obj6;
    return !!(
      (_o$obj6 = o.obj) === null || _o$obj6 === void 0
        ? void 0
        : _assertClassBrand(C, _o$obj6, _a)._.b
    )?.c.d;
  }
  static testLogicalInIf(o) {
    if (
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d &&
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._)?.b.c.d
    ) {
      return true;
    }
    return false;
  }
  static testLogicalInReturn(o) {
    return (
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d &&
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._)?.b.c.d
    );
  }
  static testNullishCoalescing(o) {
    if (
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ??
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d
    ) {
      return (
        (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ??
        (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d
      );
    }
    return (
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ?? o
    );
  }
  static test() {
    const c = C;
    expect(C.testIf(c)).toBe(true);
    expect(C.testConditional(c)).toBe(true);
    expect(C.testLoop(c)).toBe(true);
    expect(C.testNegate(c)).toBe(true);
    expect(C.testIfDeep({ obj: c })).toBe(true);
    expect(C.testConditionalDeep({ obj: c })).toBe(true);
    expect(C.testLoopDeep({ obj: c })).toBe(true);
    expect(C.testNegateDeep({ obj: c })).toBe(true);
    expect(C.testLogicalInIf(c)).toBe(true);
    expect(C.testLogicalInReturn(c)).toBe(2);
    expect(C.testNullishCoalescing(c)).toBe(2);
  }
  static testNullish() {
    for (const n of [null, undefined]) {
      expect(C.testIf(n)).toBe(false);
      expect(C.testConditional(n)).toBe(false);
      expect(C.testLoop(n)).toBe(false);
      expect(C.testNegate(n)).toBe(false);
      expect(C.testIfDeep({ obj: n })).toBe(false);
      expect(C.testConditionalDeep({ obj: n })).toBe(false);
      expect(C.testLoopDeep({ obj: n })).toBe(false);
      expect(C.testNegateDeep({ obj: n })).toBe(false);
      expect(C.testLogicalInIf(n)).toBe(false);
      expect(C.testLogicalInReturn(n)).toBe(undefined);
      expect(C.testNullishCoalescing(n)).toBe(n);
    }
  }
}
var _a = { _: { b: { c: { d: 2 } } } };
C.test();
C.testNullish();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _a = /* @__PURE__ */ _classPrivateFieldLooseKey('a');
class C {
  static testIf(o) {
    if (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    return (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d
      ? true
      : false;
  }
  static testLoop(o) {
    while (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c.d) {
      for (
        ;
        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c)?.d;
      ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d
        );
      }
    }
    return false;
  }
  static testNegate(o) {
    return !!(o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d;
  }
  static testIfDeep(o) {
    var _o$obj;
    if (
      ((_o$obj = o.obj) === null || _o$obj === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$obj, _a)[_a].b
      )?.c.d
    ) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    var _o$obj2;
    return ((_o$obj2 = o.obj) === null || _o$obj2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_o$obj2, _a)[_a].b
    )?.c.d
      ? true
      : false;
  }
  static testLoopDeep(o) {
    var _o$obj3;
    while (
      (_o$obj3 = o.obj) === null || _o$obj3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$obj3, _a)[_a].b.c.d
    ) {
      var _o$obj4;
      for (
        ;
        ((_o$obj4 = o.obj) === null || _o$obj4 === void 0
          ? void 0
          : _classPrivateFieldLooseBase(_o$obj4, _a)[_a].b.c
        )?.d;
      ) {
        var _o$obj5;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          ((_o$obj5 = o.obj) === null || _o$obj5 === void 0
            ? void 0
            : _classPrivateFieldLooseBase(_o$obj5, _a)[_a].b
          )?.c.d
        );
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    var _o$obj6;
    return !!(
      (_o$obj6 = o.obj) === null || _o$obj6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$obj6, _a)[_a].b
    )?.c.d;
  }
  static testLogicalInIf(o) {
    if (
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d &&
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a])?.b.c.d
    ) {
      return true;
    }
    return false;
  }
  static testLogicalInReturn(o) {
    return (
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d &&
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a])?.b.c.d
    );
  }
  static testNullishCoalescing(o) {
    if (
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c
        .non_existent ??
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d
    ) {
      return (
        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c
          .non_existent ??
        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d
      );
    }
    return (
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c
        .non_existent ?? o
    );
  }
  static test() {
    const c = C;
    expect(C.testIf(c)).toBe(true);
    expect(C.testConditional(c)).toBe(true);
    expect(C.testLoop(c)).toBe(true);
    expect(C.testNegate(c)).toBe(true);
    expect(C.testIfDeep({ obj: c })).toBe(true);
    expect(C.testConditionalDeep({ obj: c })).toBe(true);
    expect(C.testLoopDeep({ obj: c })).toBe(true);
    expect(C.testNegateDeep({ obj: c })).toBe(true);
    expect(C.testLogicalInIf(c)).toBe(true);
    expect(C.testLogicalInReturn(c)).toBe(2);
    expect(C.testNullishCoalescing(c)).toBe(2);
  }
  static testNullish() {
    for (const n of [null, undefined]) {
      expect(C.testIf(n)).toBe(false);
      expect(C.testConditional(n)).toBe(false);
      expect(C.testLoop(n)).toBe(false);
      expect(C.testNegate(n)).toBe(false);
      expect(C.testIfDeep({ obj: n })).toBe(false);
      expect(C.testConditionalDeep({ obj: n })).toBe(false);
      expect(C.testLoopDeep({ obj: n })).toBe(false);
      expect(C.testNegateDeep({ obj: n })).toBe(false);
      expect(C.testLogicalInIf(n)).toBe(false);
      expect(C.testLogicalInReturn(n)).toBe(undefined);
      expect(C.testNullishCoalescing(n)).toBe(n);
    }
  }
}
Object.defineProperty(C, _a, {
  writable: true,
  value: { b: { c: { d: 2 } } },
});
C.test();
C.testNullish();`,
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional chain cast to boolean (input)',
    source: `class C {
  static #a = {
    b: {
      c: {
        d: 2,
      },
    },
  };
  static testIf(o) {
    if (o?.#a.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    return o?.#a.b?.c.d ? true : false;
  }
  static testLoop(o) {
    while (o?.#a.b.c.d) {
      for (; o?.#a.b.c?.d; ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o?.#a.b?.c.d);
      }
    }
    return false;
  }
  static testNegate(o) {
    return !!o?.#a.b?.c.d;
  }
  static testIfDeep(o) {
    if (o.obj?.#a.b?.c.d) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    return o.obj?.#a.b?.c.d ? true : false;
  }
  static testLoopDeep(o) {
    while (o.obj?.#a.b.c.d) {
      for (; o.obj?.#a.b.c?.d; ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (o.obj?.#a.b?.c.d);
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    return !!o.obj?.#a.b?.c.d;
  }

  static testLogicalInIf(o) {
    if (o?.#a.b?.c.d && o?.#a?.b.c.d) {
      return true;
    }
    return false;
  }

  static testLogicalInReturn(o) {
    return o?.#a.b?.c.d && o?.#a?.b.c.d;
  }

  static testNullishCoalescing(o) {
    if (o?.#a.b?.c.non_existent ?? o?.#a.b?.c.d) {
      return o?.#a.b?.c.non_existent ?? o?.#a.b?.c.d;
    }
    return o?.#a.b?.c.non_existent ?? o;
  }
}

C.test();
C.testNullish();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class C {
  static testIf(o) {
    if (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    return (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d
      ? true
      : false;
  }
  static testLoop(o) {
    while (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c.d) {
      for (; (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c)?.d;) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while ((o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d);
      }
    }
    return false;
  }
  static testNegate(o) {
    return !!(o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d;
  }
  static testIfDeep(o) {
    var _o$obj;
    if (
      ((_o$obj = o.obj) === null || _o$obj === void 0
        ? void 0
        : _assertClassBrand(C, _o$obj, _a)._.b
      )?.c.d
    ) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    var _o$obj2;
    return ((_o$obj2 = o.obj) === null || _o$obj2 === void 0
      ? void 0
      : _assertClassBrand(C, _o$obj2, _a)._.b
    )?.c.d
      ? true
      : false;
  }
  static testLoopDeep(o) {
    var _o$obj3;
    while (
      (_o$obj3 = o.obj) === null || _o$obj3 === void 0
        ? void 0
        : _assertClassBrand(C, _o$obj3, _a)._.b.c.d
    ) {
      var _o$obj4;
      for (
        ;
        ((_o$obj4 = o.obj) === null || _o$obj4 === void 0
          ? void 0
          : _assertClassBrand(C, _o$obj4, _a)._.b.c
        )?.d;
      ) {
        var _o$obj5;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          ((_o$obj5 = o.obj) === null || _o$obj5 === void 0
            ? void 0
            : _assertClassBrand(C, _o$obj5, _a)._.b
          )?.c.d
        );
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    var _o$obj6;
    return !!(
      (_o$obj6 = o.obj) === null || _o$obj6 === void 0
        ? void 0
        : _assertClassBrand(C, _o$obj6, _a)._.b
    )?.c.d;
  }
  static testLogicalInIf(o) {
    if (
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d &&
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._)?.b.c.d
    ) {
      return true;
    }
    return false;
  }
  static testLogicalInReturn(o) {
    return (
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d &&
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._)?.b.c.d
    );
  }
  static testNullishCoalescing(o) {
    if (
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ??
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d
    ) {
      return (
        (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ??
        (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d
      );
    }
    return (
      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ?? o
    );
  }
}
var _a = { _: { b: { c: { d: 2 } } } };
C.test();
C.testNullish();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _a = /* @__PURE__ */ _classPrivateFieldLooseKey('a');
class C {
  static testIf(o) {
    if (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c.d) {
      return true;
    }
    return false;
  }
  static testConditional(o) {
    return (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d
      ? true
      : false;
  }
  static testLoop(o) {
    while (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c.d) {
      for (
        ;
        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c)?.d;
      ) {
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d
        );
      }
    }
    return false;
  }
  static testNegate(o) {
    return !!(o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d;
  }
  static testIfDeep(o) {
    var _o$obj;
    if (
      ((_o$obj = o.obj) === null || _o$obj === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$obj, _a)[_a].b
      )?.c.d
    ) {
      return true;
    }
    return false;
  }
  static testConditionalDeep(o) {
    var _o$obj2;
    return ((_o$obj2 = o.obj) === null || _o$obj2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_o$obj2, _a)[_a].b
    )?.c.d
      ? true
      : false;
  }
  static testLoopDeep(o) {
    var _o$obj3;
    while (
      (_o$obj3 = o.obj) === null || _o$obj3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$obj3, _a)[_a].b.c.d
    ) {
      var _o$obj4;
      for (
        ;
        ((_o$obj4 = o.obj) === null || _o$obj4 === void 0
          ? void 0
          : _classPrivateFieldLooseBase(_o$obj4, _a)[_a].b.c
        )?.d;
      ) {
        var _o$obj5;
        let i = 0;
        do {
          i++;
          if (i === 2) {
            return true;
          }
        } while (
          ((_o$obj5 = o.obj) === null || _o$obj5 === void 0
            ? void 0
            : _classPrivateFieldLooseBase(_o$obj5, _a)[_a].b
          )?.c.d
        );
      }
    }
    return false;
  }
  static testNegateDeep(o) {
    var _o$obj6;
    return !!(
      (_o$obj6 = o.obj) === null || _o$obj6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$obj6, _a)[_a].b
    )?.c.d;
  }
  static testLogicalInIf(o) {
    if (
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d &&
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a])?.b.c.d
    ) {
      return true;
    }
    return false;
  }
  static testLogicalInReturn(o) {
    return (
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d &&
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a])?.b.c.d
    );
  }
  static testNullishCoalescing(o) {
    if (
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c
        .non_existent ??
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d
    ) {
      return (
        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c
          .non_existent ??
        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d
      );
    }
    return (
      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c
        .non_existent ?? o
    );
  }
}
Object.defineProperty(C, _a, {
  writable: true,
  value: { b: { c: { d: 2 } } },
});
C.test();
C.testNullish();`,
      },
    ],
  },
  {
    title: 'assumption noUninitializedPrivateFieldAccess — static private (exec)',
    source: `class A {
  static #x = 0;

  static dynamicCheck() {
    expect(this.#x).toBe(0);
    expect(this.#x = 1).toBe(1);
    expect(this.#x).toBe(1);
    [this.#x] = [2];
    expect(this.#x).toBe(2);
  }

  static noCheck() {
    expect(A.#x).toBe(2);
    expect(A.#x = 3).toBe(3);
    [A.#x] = [4];
    expect(A.#x).toBe(4);
  }
}

A.dynamicCheck();
A.noCheck();


`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class A {
  static dynamicCheck() {
    expect(_assertClassBrand(A, this, _x)._).toBe(0);
    expect((_x._ = _assertClassBrand(A, this, 1))).toBe(1);
    expect(_assertClassBrand(A, this, _x)._).toBe(1);
    [_assertClassBrand(A, this, _x)._] = [2];
    expect(_assertClassBrand(A, this, _x)._).toBe(2);
  }
  static noCheck() {
    expect(_x._).toBe(2);
    expect((_x._ = 3)).toBe(3);
    [_x._] = [4];
    expect(_x._).toBe(4);
  }
}
var _x = { _: 0 };
A.dynamicCheck();
A.noCheck();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
class A {
  static dynamicCheck() {
    expect(_classPrivateFieldLooseBase(this, _x)[_x]).toBe(0);
    expect((_classPrivateFieldLooseBase(this, _x)[_x] = 1)).toBe(1);
    expect(_classPrivateFieldLooseBase(this, _x)[_x]).toBe(1);
    [_classPrivateFieldLooseBase(this, _x)[_x]] = [2];
    expect(_classPrivateFieldLooseBase(this, _x)[_x]).toBe(2);
  }
  static noCheck() {
    expect(_classPrivateFieldLooseBase(A, _x)[_x]).toBe(2);
    expect((_classPrivateFieldLooseBase(A, _x)[_x] = 3)).toBe(3);
    [_classPrivateFieldLooseBase(A, _x)[_x]] = [4];
    expect(_classPrivateFieldLooseBase(A, _x)[_x]).toBe(4);
  }
}
Object.defineProperty(A, _x, {
  writable: true,
  value: 0,
});
A.dynamicCheck();
A.noCheck();`,
      },
    ],
  },
  {
    title: 'assumption noUninitializedPrivateFieldAccess — static private (input)',
    source: `class A {
  static #x = 2;

  static dynamicCheck() {
    this.#x;
    this.#x = 2;
    [this.#x] = [];
  }

  static noCheck() {
    A.#x;
    A.#x = 2;
    [A.#x] = [];
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class A {
  static dynamicCheck() {
    _assertClassBrand(A, this, _x)._;
    _x._ = _assertClassBrand(A, this, 2);
    [_assertClassBrand(A, this, _x)._] = [];
  }
  static noCheck() {
    _x._;
    _x._ = 2;
    [_x._] = [];
  }
}
var _x = { _: 2 };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
class A {
  static dynamicCheck() {
    _classPrivateFieldLooseBase(this, _x)[_x];
    _classPrivateFieldLooseBase(this, _x)[_x] = 2;
    [_classPrivateFieldLooseBase(this, _x)[_x]] = [];
  }
  static noCheck() {
    _classPrivateFieldLooseBase(A, _x)[_x];
    _classPrivateFieldLooseBase(A, _x)[_x] = 2;
    [_classPrivateFieldLooseBase(A, _x)[_x]] = [];
  }
}
Object.defineProperty(A, _x, {
  writable: true,
  value: 2,
});`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — computed initialization order (exec)',
    source: `const actualOrder = [];

const track = i => {
  actualOrder.push(i);
  return i;
};

class MyClass {
  static [track(1)] = track(10);
  [track(2)] = track(13);
  get [track(3)]() {
    return "foo";
  }
  set [track(4)](value) {
    this.bar = value;
  }
  [track(5)] = track(14);
  static [track(6)] = track(11);
  static [track(7)] = track(12);
  [track(8)]() {}
  [track(9)] = track(15);
}

const inst = new MyClass();

const expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
expect(actualOrder).toEqual(expectedOrder);

expect(MyClass[1]).toBe(10);
expect(inst[2]).toBe(13);
expect(inst[3]).toBe("foo");
inst[4] = "baz";
expect(inst.bar).toBe("baz");
expect(inst[5]).toBe(14);
expect(MyClass[6]).toBe(11);
expect(MyClass[7]).toBe(12);
expect(typeof inst[8]).toBe("function");
expect(inst[9]).toBe(15);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _track, _track2, _track3, _track4, _track5, _track6, _track7, _track8, _track9;
const actualOrder = [];
const track = i => {
  actualOrder.push(i);
  return i;
};
_track4 = track(1);
_track = track(2);
_track5 = track(3);
_track6 = track(4);
_track2 = track(5);
_track7 = track(6);
_track8 = track(7);
_track9 = track(8);
_track3 = track(9);
class MyClass {
  constructor() {
    _defineProperty(this, _track, track(13));
    _defineProperty(this, _track2, track(14));
    _defineProperty(this, _track3, track(15));
  }
  get [_track5]() {
    return 'foo';
  }
  set [_track6](value) {
    this.bar = value;
  }
  [_track9]() {}
}
_defineProperty(MyClass, _track4, track(10));
_defineProperty(MyClass, _track7, track(11));
_defineProperty(MyClass, _track8, track(12));
const inst = new MyClass();
const expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
expect(actualOrder).toEqual(expectedOrder);
expect(MyClass[1]).toBe(10);
expect(inst[2]).toBe(13);
expect(inst[3]).toBe('foo');
inst[4] = 'baz';
expect(inst.bar).toBe('baz');
expect(inst[5]).toBe(14);
expect(MyClass[6]).toBe(11);
expect(MyClass[7]).toBe(12);
expect(typeof inst[8]).toBe('function');
expect(inst[9]).toBe(15);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _track, _track2, _track3, _track4, _track5, _track6, _track7, _track8, _track9;
const actualOrder = [];
const track = i => {
  actualOrder.push(i);
  return i;
};
_track4 = track(1);
_track = track(2);
_track5 = track(3);
_track6 = track(4);
_track2 = track(5);
_track7 = track(6);
_track8 = track(7);
_track9 = track(8);
_track3 = track(9);
class MyClass {
  constructor() {
    this[_track] = track(13);
    this[_track2] = track(14);
    this[_track3] = track(15);
  }
  get [_track5]() {
    return 'foo';
  }
  set [_track6](value) {
    this.bar = value;
  }
  [_track9]() {}
}
MyClass[_track4] = track(10);
MyClass[_track7] = track(11);
MyClass[_track8] = track(12);
const inst = new MyClass();
const expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
expect(actualOrder).toEqual(expectedOrder);
expect(MyClass[1]).toBe(10);
expect(inst[2]).toBe(13);
expect(inst[3]).toBe('foo');
inst[4] = 'baz';
expect(inst.bar).toBe('baz');
expect(inst[5]).toBe(14);
expect(MyClass[6]).toBe(11);
expect(MyClass[7]).toBe(12);
expect(typeof inst[8]).toBe('function');
expect(inst[9]).toBe(15);`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — computed (input)',
    source: `const foo = "foo";
const bar = () => {};
const four = 4;

class MyClass {
  static [one()] = "test";
  static [2 * 4 + 7] = "247";
  static [2 * four + 7] = "247";
  static [2 * four + seven] = "247";
  [null] = "null";
  [undefined] = "undefined";
  [void 0] = "void 0";
  get ["whatever"]() {}
  set ["whatever"](value) {}
  get [computed()]() {}
  set [computed()](value) {}
  ["test" + one]() {}
  static [10]() {}
  [/regex/] = "regex";
  [foo] = "foo";
  [bar] = "bar";
  [baz] = "baz";
  [\`template\`] = "template";
  [\`template\${expression}\`] = "template-with-expression";
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _undefined, _, _baz, _ref, _one, _ref2, _ref3, _ref4, _computed, _computed2, _ref5;
const foo = 'foo';
const bar = () => {};
const four = 4;
_one = one();
_ref2 = 2 * 4 + 7;
_ref3 = 2 * four + 7;
_ref4 = 2 * four + seven;
_undefined = undefined;
_ = void 0;
_computed = computed();
_computed2 = computed();
_ref5 = 'test' + one;
_baz = baz;
_ref = \`template\${expression}\`;
class MyClass {
  constructor() {
    _defineProperty(this, null, 'null');
    _defineProperty(this, _undefined, 'undefined');
    _defineProperty(this, _, 'void 0');
    _defineProperty(this, /regex/, 'regex');
    _defineProperty(this, foo, 'foo');
    _defineProperty(this, bar, 'bar');
    _defineProperty(this, _baz, 'baz');
    _defineProperty(this, \`template\`, 'template');
    _defineProperty(this, _ref, 'template-with-expression');
  }
  get ['whatever']() {}
  set ['whatever'](value) {}
  get [_computed]() {}
  set [_computed2](value) {}
  [_ref5]() {}
  static [10]() {}
}
_defineProperty(MyClass, _one, 'test');
_defineProperty(MyClass, _ref2, '247');
_defineProperty(MyClass, _ref3, '247');
_defineProperty(MyClass, _ref4, '247');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _undefined, _, _baz, _ref, _one, _ref2, _ref3, _ref4, _computed, _computed2, _ref5;
const foo = 'foo';
const bar = () => {};
const four = 4;
_one = one();
_ref2 = 2 * 4 + 7;
_ref3 = 2 * four + 7;
_ref4 = 2 * four + seven;
_undefined = undefined;
_ = void 0;
_computed = computed();
_computed2 = computed();
_ref5 = 'test' + one;
_baz = baz;
_ref = \`template\${expression}\`;
class MyClass {
  constructor() {
    this[null] = 'null';
    this[_undefined] = 'undefined';
    this[_] = 'void 0';
    this[/regex/] = 'regex';
    this[foo] = 'foo';
    this[bar] = 'bar';
    this[_baz] = 'baz';
    this[\`template\`] = 'template';
    this[_ref] = 'template-with-expression';
  }
  get ['whatever']() {}
  set ['whatever'](value) {}
  get [_computed]() {}
  set [_computed2](value) {}
  [_ref5]() {}
  static [10]() {}
}
MyClass[_one] = 'test';
MyClass[_ref2] = '247';
MyClass[_ref3] = '247';
MyClass[_ref4] = '247';`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — constructor collision (input)',
    source: `var foo = "bar";

class Foo {
  bar = foo;
  static bar = baz;

  constructor() {
    var foo = "foo";
    var baz = "baz";
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var foo = 'bar';
class Foo {
  constructor() {
    _defineProperty(this, 'bar', foo);
    var _foo = 'foo';
    var baz = 'baz';
  }
}
_defineProperty(Foo, 'bar', baz);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var foo = 'bar';
class Foo {
  constructor() {
    this.bar = foo;
    var _foo = 'foo';
    var baz = 'baz';
  }
}
Foo.bar = baz;`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — derived (input)',
    source: `class Foo extends Bar {
  bar = "foo";
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo extends Bar {
  constructor(..._args) {
    super(..._args);
    _defineProperty(this, 'bar', 'foo');
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo extends Bar {
  constructor(..._args) {
    super(..._args);
    this.bar = 'foo';
  }
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — foobar (input)',
    source: `class Child extends Parent {
    constructor() {
        super();
    }

    scopedFunctionWithThis = () => {
        this.name = {};
    }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Child extends Parent {
  constructor() {
    super();
    _defineProperty(this, 'scopedFunctionWithThis', () => {
      this.name = {};
    });
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Child extends Parent {
  constructor() {
    super();
    this.scopedFunctionWithThis = () => {
      this.name = {};
    };
  }
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — instance computed (exec)',
    source: `function test(x) {
  class F {
    [x] = 1;
    constructor() {}
  }

  x = 'deadbeef';
  expect(new F().foo).toBe(1);
  x = 'wrong';
  expect(new F().foo).toBe(1);
}

test('foo');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function test(x) {
  let _x;
  _x = x;
  class F {
    constructor() {
      _defineProperty(this, _x, 1);
    }
  }
  x = 'deadbeef';
  expect(new F().foo).toBe(1);
  x = 'wrong';
  expect(new F().foo).toBe(1);
}
test('foo');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `function test(x) {
  let _x;
  _x = x;
  class F {
    constructor() {
      this[_x] = 1;
    }
  }
  x = 'deadbeef';
  expect(new F().foo).toBe(1);
  x = 'wrong';
  expect(new F().foo).toBe(1);
}
test('foo');`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — instance computed (input)',
    source: `function test(x) {
  class F {
    [x] = 1;
    constructor() {}
  }

  x = 'deadbeef';
  expect(new F().foo).toBe(1);
  x = 'wrong';
  expect(new F().foo).toBe(1);
}

test('foo');
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function test(x) {
  let _x;
  _x = x;
  class F {
    constructor() {
      _defineProperty(this, _x, 1);
    }
  }
  x = 'deadbeef';
  expect(new F().foo).toBe(1);
  x = 'wrong';
  expect(new F().foo).toBe(1);
}
test('foo');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `function test(x) {
  let _x;
  _x = x;
  class F {
    constructor() {
      this[_x] = 1;
    }
  }
  x = 'deadbeef';
  expect(new F().foo).toBe(1);
  x = 'wrong';
  expect(new F().foo).toBe(1);
}
test('foo');`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — instance undefined (input)',
    source: `class Foo {
  bar;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'bar', void 0);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.bar = void 0;
  }
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — instance (input)',
    source: `class Foo {
  bar = "foo";
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'bar', 'foo');
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.bar = 'foo';
  }
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — length name use define (input)',
    source: `class A {
    static name = 1;
    static length = 2;
    static foo = 3;
    static [bar] = 4;
    static ["name"] = 5;
    static [name] = 6;
    static "name" = 7;

    name = 8;
    length = 9;
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _bar, _name;
_bar = bar;
_name = name;
class A {
  constructor() {
    _defineProperty(this, 'name', 8);
    _defineProperty(this, 'length', 9);
  }
}
_defineProperty(A, 'name', 1);
_defineProperty(A, 'length', 2);
_defineProperty(A, 'foo', 3);
_defineProperty(A, _bar, 4);
_defineProperty(A, 'name', 5);
_defineProperty(A, _name, 6);
_defineProperty(A, 'name', 7);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _bar, _name;
_bar = bar;
_name = name;
class A {
  constructor() {
    this.name = 8;
    this.length = 9;
  }
}
_defineProperty(A, 'name', 1);
_defineProperty(A, 'length', 2);
A.foo = 3;
A[_bar] = 4;
_defineProperty(A, 'name', 5);
A[_name] = 6;
_defineProperty(A, 'name', 7);`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — non block arrow func (input)',
    source: `export default param =>
  class App {
    static props = {
      prop1: 'prop1',
      prop2: 'prop2'
    }

    getParam() {
      return param;
    }
  }
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `import _defineProperty from '@babel/runtime/helpers/defineProperty';
export default param => {
  var _App;
  return (
    (_App = class App {
      getParam() {
        return param;
      }
    }),
    _defineProperty(_App, 'props', {
      prop1: 'prop1',
      prop2: 'prop2',
    }),
    _App
  );
};`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `export default param => {
  var _App;
  return (
    (_App = class App {
      getParam() {
        return param;
      }
    }),
    (_App.props = {
      prop1: 'prop1',
      prop2: 'prop2',
    }),
    _App
  );
};`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — regression T2983 (input)',
    source: `call(class {
  static test = true
});

export default class {
  static test = true
};
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `import _defineProperty from '@babel/runtime/helpers/defineProperty';
var _Class;
call(((_Class = class {}), _defineProperty(_Class, 'test', true), _Class));
export default class _Class2 {}
_defineProperty(_Class2, 'test', true);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _Class;
call(((_Class = class {}), (_Class.test = true), _Class));
export default class _Class2 {}
_Class2.test = true;`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — regression T6719 (input)',
    source: `function withContext(ComposedComponent) {
    return class WithContext extends Component {

        static propTypes = {
            context: PropTypes.shape(
                {
                    addCss: PropTypes.func,
                    setTitle: PropTypes.func,
                    setMeta: PropTypes.func,
                }
            ),
        };
    };
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function withContext(ComposedComponent) {
  var _WithContext;
  return (
    (_WithContext = class WithContext extends Component {}),
    _defineProperty(_WithContext, 'propTypes', {
      context: PropTypes.shape({
        addCss: PropTypes.func,
        setTitle: PropTypes.func,
        setMeta: PropTypes.func,
      }),
    }),
    _WithContext
  );
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `function withContext(ComposedComponent) {
  var _WithContext;
  return (
    (_WithContext = class WithContext extends Component {}),
    (_WithContext.propTypes = {
      context: PropTypes.shape({
        addCss: PropTypes.func,
        setTitle: PropTypes.func,
        setMeta: PropTypes.func,
      }),
    }),
    _WithContext
  );
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — regression T7364 (input)',
    source: `class MyClass {
  myAsyncMethod = async () => {
    console.log(this);
  }
}

(class MyClass2 {
  myAsyncMethod = async () => {
    console.log(this);
  }
})

export default class MyClass3 {
  myAsyncMethod = async () => {
    console.log(this);
  }
}
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `import _defineProperty from '@babel/runtime/helpers/defineProperty';
class MyClass {
  constructor() {
    _defineProperty(this, 'myAsyncMethod', async () => {
      console.log(this);
    });
  }
}
(class MyClass2 {
  constructor() {
    _defineProperty(this, 'myAsyncMethod', async () => {
      console.log(this);
    });
  }
});
export default class MyClass3 {
  constructor() {
    _defineProperty(this, 'myAsyncMethod', async () => {
      console.log(this);
    });
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class MyClass {
  constructor() {
    this.myAsyncMethod = async () => {
      console.log(this);
    };
  }
}
(class MyClass2 {
  constructor() {
    this.myAsyncMethod = async () => {
      console.log(this);
    };
  }
});
export default class MyClass3 {
  constructor() {
    this.myAsyncMethod = async () => {
      console.log(this);
    };
  }
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static class binding (exec)',
    source: `class A {
  static self = A;
  static getA = () => A;
}

const oldA = A;
A = null;

expect(oldA.self).toBe(oldA);
expect(oldA.getA()).toBe(oldA);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _A;
class A {}
_A = A;
_defineProperty(A, 'self', _A);
_defineProperty(A, 'getA', () => _A);
const oldA = A;
A = null;
expect(oldA.self).toBe(oldA);
expect(oldA.getA()).toBe(oldA);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _A;
class A {}
_A = A;
A.self = _A;
A.getA = () => _A;
const oldA = A;
A = null;
expect(oldA.self).toBe(oldA);
expect(oldA.getA()).toBe(oldA);`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static class binding (input)',
    source: `class A {
  static self = A;
  static getA = () => A;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _A;
class A {}
_A = A;
_defineProperty(A, 'self', _A);
_defineProperty(A, 'getA', () => _A);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _A;
class A {}
_A = A;
A.self = _A;
A.getA = () => _A;`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static export (input)',
    source: `export class MyClass {
  static property = value;
}

export default class MyClass2 {
  static property = value;
}
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `import _defineProperty from '@babel/runtime/helpers/defineProperty';
export class MyClass {}
_defineProperty(MyClass, 'property', value);
export default class MyClass2 {}
_defineProperty(MyClass2, 'property', value);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `export class MyClass {}
MyClass.property = value;
export default class MyClass2 {}
MyClass2.property = value;`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static infer name (exec)',
    source: `var Foo = class {
  static num = 0;
}

expect(Foo.num).toBe(0);
expect(Foo.num = 1).toBe(1);
expect(Foo.name).toBe("Foo");
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Class;
var Foo = ((_Class = class {}), _defineProperty(_Class, 'num', 0), _Class);
expect(Foo.num).toBe(0);
expect((Foo.num = 1)).toBe(1);
expect(Foo.name).toBe('Foo');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _Class;
var Foo = ((_Class = class {}), (_Class.num = 0), _Class);
expect(Foo.num).toBe(0);
expect((Foo.num = 1)).toBe(1);
expect(Foo.name).toBe('Foo');`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static infer name (input)',
    source: `var Foo = class {
  static num = 0;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Class;
var Foo = ((_Class = class {}), _defineProperty(_Class, 'num', 0), _Class);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _Class;
var Foo = ((_Class = class {}), (_Class.num = 0), _Class);`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static super loose (input)',
    source: `class A {
  static prop = 1;
}

class B extends A {
  static prop = 2;
  static propA = super.prop;
  static getPropA = () => super.prop;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _superPropGet = require('@babel/runtime/helpers/superPropGet');
var _B;
class A {}
_defineProperty(A, 'prop', 1);
class B extends A {}
_B = B;
_defineProperty(B, 'prop', 2);
_defineProperty(B, 'propA', _superPropGet(_B, 'prop', _B));
_defineProperty(B, 'getPropA', () => _superPropGet(_B, 'prop', _B));`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _B;
class A {}
A.prop = 1;
class B extends A {}
_B = B;
B.prop = 2;
B.propA = Object.getPrototypeOf(_B).prop;
B.getPropA = () => Object.getPrototypeOf(_B).prop;`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static super (exec)',
    source: `class A {
  static prop = 1;
}

class B extends A {
  static prop = 2;
  static propA = super.prop;
  static getPropA = () => super.prop;
}

const { prop, propA, getPropA } = B;

expect(prop).toBe(2);
expect(propA).toBe(1);
expect(getPropA()).toBe(1);

const oldB = B;
B = null;

expect(oldB.prop).toBe(2);
expect(oldB.propA).toBe(1);
expect(oldB.getPropA()).toBe(1);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _superPropGet = require('@babel/runtime/helpers/superPropGet');
var _B;
class A {}
_defineProperty(A, 'prop', 1);
class B extends A {}
_B = B;
_defineProperty(B, 'prop', 2);
_defineProperty(B, 'propA', _superPropGet(_B, 'prop', _B));
_defineProperty(B, 'getPropA', () => _superPropGet(_B, 'prop', _B));
const { prop, propA, getPropA } = B;
expect(prop).toBe(2);
expect(propA).toBe(1);
expect(getPropA()).toBe(1);
const oldB = B;
B = null;
expect(oldB.prop).toBe(2);
expect(oldB.propA).toBe(1);
expect(oldB.getPropA()).toBe(1);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _B;
class A {}
A.prop = 1;
class B extends A {}
_B = B;
B.prop = 2;
B.propA = Object.getPrototypeOf(_B).prop;
B.getPropA = () => Object.getPrototypeOf(_B).prop;
const { prop, propA, getPropA } = B;
expect(prop).toBe(2);
expect(propA).toBe(1);
expect(getPropA()).toBe(1);
const oldB = B;
B = null;
expect(oldB.prop).toBe(2);
expect(oldB.propA).toBe(1);
expect(oldB.getPropA()).toBe(1);`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static this (exec)',
    source: `class A {
  static self = this;
  static getA = () => this;
}

const { self, getA } = A;

expect(self).toBe(A);
expect(getA()).toBe(A);

const oldA = A;
A = null;

expect(oldA.self).toBe(oldA);
expect(oldA.getA()).toBe(oldA);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _A;
class A {}
_A = A;
_defineProperty(A, 'self', _A);
_defineProperty(A, 'getA', () => _A);
const { self, getA } = A;
expect(self).toBe(A);
expect(getA()).toBe(A);
const oldA = A;
A = null;
expect(oldA.self).toBe(oldA);
expect(oldA.getA()).toBe(oldA);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _A;
class A {}
_A = A;
A.self = _A;
A.getA = () => _A;
const { self, getA } = A;
expect(self).toBe(A);
expect(getA()).toBe(A);
const oldA = A;
A = null;
expect(oldA.self).toBe(oldA);
expect(oldA.getA()).toBe(oldA);`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static this (input)',
    source: `class A {
  static self = this;
  static getA = () => this;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _A;
class A {}
_A = A;
_defineProperty(A, 'self', _A);
_defineProperty(A, 'getA', () => _A);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _A;
class A {}
_A = A;
A.self = _A;
A.getA = () => _A;`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static undefined (exec)',
    source: `class Foo {
  static num;
}

expect("num" in Foo).toBe(true);
expect(Foo.num).toBeUndefined();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {}
_defineProperty(Foo, 'num', void 0);
expect('num' in Foo).toBe(true);
expect(Foo.num).toBeUndefined();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {}
Foo.num = void 0;
expect('num' in Foo).toBe(true);
expect(Foo.num).toBeUndefined();`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static undefined (input)',
    source: `class Foo {
  static bar;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {}
_defineProperty(Foo, 'bar', void 0);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {}
Foo.bar = void 0;`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static (exec)',
    source: `class Foo {
  static num = 0;
  static str = "foo";
}

expect(Foo.num).toBe(0);
expect(Foo.num = 1).toBe(1);
expect(Foo.str).toBe("foo");
expect(Foo.str = "bar").toBe("bar");
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {}
_defineProperty(Foo, 'num', 0);
_defineProperty(Foo, 'str', 'foo');
expect(Foo.num).toBe(0);
expect((Foo.num = 1)).toBe(1);
expect(Foo.str).toBe('foo');
expect((Foo.str = 'bar')).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {}
Foo.num = 0;
Foo.str = 'foo';
expect(Foo.num).toBe(0);
expect((Foo.num = 1)).toBe(1);
expect(Foo.str).toBe('foo');
expect((Foo.str = 'bar')).toBe('bar');`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static (input)',
    source: `class Foo {
  static bar = "foo";
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {}
_defineProperty(Foo, 'bar', 'foo');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {}
Foo.bar = 'foo';`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — super call (input)',
    source: `class A {
  foo() {
    return "bar";
  }
}

class B extends A {
  foo = super.foo();
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class A {
  foo() {
    return 'bar';
  }
}
class B extends A {
  constructor(..._args) {
    super(..._args);
    _defineProperty(this, 'foo', super.foo());
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class A {
  foo() {
    return 'bar';
  }
}
class B extends A {
  constructor(..._args) {
    super(..._args);
    this.foo = super.foo();
  }
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — super expression (input)',
    source: `class Foo extends Bar {
  bar = "foo";

  constructor() {
    foo(super());
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo extends Bar {
  constructor() {
    var _super = (..._args) => (super(..._args), _defineProperty(this, 'bar', 'foo'), this);
    foo(_super());
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo extends Bar {
  constructor() {
    var _super = (..._args) => (super(..._args), (this.bar = 'foo'), this);
    foo(_super());
  }
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — super statement (input)',
    source: `class Foo extends Bar {
  bar = "foo";

  constructor() {
    super();
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo extends Bar {
  constructor() {
    super();
    _defineProperty(this, 'bar', 'foo');
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo extends Bar {
  constructor() {
    super();
    this.bar = 'foo';
  }
}`,
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — super with collision (input)',
    source: `class A {
  force = force;
  foo = super.method();

  constructor(force) {}
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class A {
  constructor(_force) {
    _defineProperty(this, 'force', force);
    _defineProperty(this, 'foo', super.method());
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class A {
  constructor(_force) {
    this.force = force;
    this.foo = super.method();
  }
}`,
      },
    ],
  },
  {
    title: 'class name tdz — decorator interop (input)',
    source: `function dec() {}

class A {
  @dec a;

  [Symbol.search]() {}
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _Symbol$search;
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
function dec() {}
_Symbol$search = Symbol.search;
class A {
  constructor() {
    _defineProperty(this, 'a', void 0);
  }
  [_Symbol$search]() {}
}
_decorate([dec], A.prototype, 'a', void 0);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _Symbol$search;
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
function dec() {}
_Symbol$search = Symbol.search;
class A {
  constructor() {
    this.a = void 0;
  }
  [_Symbol$search]() {}
}
_decorate([dec], A.prototype, 'a', void 0);`,
      },
    ],
  },
  {
    title: 'class name tdz — general (exec)',
    source: `expect(() => {
  class Foo {
    [Foo + 1] = 2;
  };\x20\x20
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
expect(() => {
  let _ref;
  _ref = Foo + 1;
  class Foo {
    constructor() {
      _defineProperty(this, _ref, 2);
    }
  }
}).toThrow(ReferenceError);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `expect(() => {
  let _ref;
  _ref = Foo + 1;
  class Foo {
    constructor() {
      this[_ref] = 2;
    }
  }
}).toThrow(ReferenceError);`,
      },
    ],
  },
  {
    title: 'class name tdz — general (input)',
    source: `class Foo {
  [Foo + 1] = 2;
};
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _ref;
_ref = Foo + 1;
class Foo {
  constructor() {
    _defineProperty(this, _ref, 2);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _ref;
_ref = Foo + 1;
class Foo {
  constructor() {
    this[_ref] = 2;
  }
}`,
      },
    ],
  },
  {
    title: 'class name tdz — static edgest case (exec)',
    source: `expect(() => {
  class A {
    static [{ x: A || 0 }.x];
  }
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
expect(() => {
  let _x$x;
  _x$x = { x: A || 0 }.x;
  class A {}
  _defineProperty(A, _x$x, void 0);
}).toThrow(ReferenceError);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `expect(() => {
  let _x$x;
  _x$x = { x: A || 0 }.x;
  class A {}
  A[_x$x] = void 0;
}).toThrow(ReferenceError);`,
      },
    ],
  },
  {
    title: 'class name tdz — static edgest case (input)',
    source: `class A {
  static [{ x: A || 0 }.x];
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _x$x;
_x$x = { x: A || 0 }.x;
class A {}
_defineProperty(A, _x$x, void 0);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _x$x;
_x$x = { x: A || 0 }.x;
class A {}
A[_x$x] = void 0;`,
      },
    ],
  },
  {
    title: 'class name tdz — static general (exec)',
    source: `expect(() => {
  class C {
    static [C + 3] = 3;
  }
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
expect(() => {
  let _ref;
  _ref = C + 3;
  class C {}
  _defineProperty(C, _ref, 3);
}).toThrow(ReferenceError);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `expect(() => {
  let _ref;
  _ref = C + 3;
  class C {}
  C[_ref] = 3;
}).toThrow(ReferenceError);`,
      },
    ],
  },
  {
    title: 'class name tdz — static general (input)',
    source: `class C {
  static [C + 3] = 3;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _ref;
_ref = C + 3;
class C {}
_defineProperty(C, _ref, 3);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _ref;
_ref = C + 3;
class C {}
C[_ref] = 3;`,
      },
    ],
  },
  {
    title: 'class name tdz — typescript type (input)',
    source: `class Foo {
  @dec(function (this: Foo) {})
  a;
}
`,
    filename: 'input.ts',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
          typescript: 'strip',
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Foo {
  constructor() {
    _defineProperty(this, 'a', void 0);
  }
}
_decorate([dec(function () {})], Foo.prototype, 'a', void 0);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
          typescript: 'strip',
        },
        output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Foo {
  constructor() {
    this.a = void 0;
  }
}
_decorate([dec(function () {})], Foo.prototype, 'a', void 0);`,
      },
    ],
  },
  {
    title: 'compile to class — constructor collision ignores types loose (input)',
    source: `class C {
    // Output should not use \`_initialiseProps\`
    x: T;
    y = 0;
    constructor(T) {}
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
          typescript: 'strip',
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class C {
  constructor(T) {
    _defineProperty(
      this,
      // Output should not use \`_initialiseProps\`
      'x',
      void 0,
    );
    _defineProperty(this, 'y', 0);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
          typescript: 'strip',
        },
        output: `class C {
  constructor(T) {
    this.x = void 0;
    this.y = 0;
  }
}`,
      },
    ],
  },
  {
    title: 'compile to class — preserve comments (input)',
    source: `class C {
  /* before a */
  a;
  /* after a */

  /* before b */
  static b;
  /* after b */
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class C {
  constructor() {
    _defineProperty(
      this,
      /* before a */
      'a',
      void 0,
    );
  }
}
_defineProperty(C, 'b', void 0);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class C {
  constructor() {
    this.a = void 0;
  }
}
C.b = void 0;`,
      },
    ],
  },
  {
    title: 'decorators legacy interop — local define property (input)',
    source: `function dec() {}

// Create a local function binding so babel has to change the name of the helper
function _defineProperty() {}

class A {
  @dec a;

  @dec b = 123;

  c = 456;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty2 = require('@babel/runtime/helpers/defineProperty');
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
function dec() {}
// Create a local function binding so babel has to change the name of the helper
function _defineProperty() {}
class A {
  constructor() {
    _defineProperty2(this, 'a', void 0);
    _defineProperty2(this, 'b', 123);
    _defineProperty2(this, 'c', 456);
  }
}
_decorate([dec], A.prototype, 'a', void 0);
_decorate([dec], A.prototype, 'b', void 0);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
function dec() {}
// Create a local function binding so babel has to change the name of the helper
function _defineProperty() {}
class A {
  constructor() {
    this.a = void 0;
    this.b = 123;
    this.c = 456;
  }
}
_decorate([dec], A.prototype, 'a', void 0);
_decorate([dec], A.prototype, 'b', void 0);`,
      },
    ],
  },
  {
    title: 'decorators legacy interop — loose (input)',
    source: `function dec() {}

class A {
  @dec a;

  @dec b = 123;

  c = 456;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
function dec() {}
class A {
  constructor() {
    _defineProperty(this, 'a', void 0);
    _defineProperty(this, 'b', 123);
    _defineProperty(this, 'c', 456);
  }
}
_decorate([dec], A.prototype, 'a', void 0);
_decorate([dec], A.prototype, 'b', void 0);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
function dec() {}
class A {
  constructor() {
    this.a = void 0;
    this.b = 123;
    this.c = 456;
  }
}
_decorate([dec], A.prototype, 'a', void 0);
_decorate([dec], A.prototype, 'b', void 0);`,
      },
    ],
  },
  {
    title: 'decorators legacy interop — wrong order (input)',
    source: `@deco
class Foo {}`,
    filename: 'input.js',
    output: `function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
let Foo = class Foo {};
Foo = _decorate([deco], Foo);`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
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
    title: 'nested class — super call in decorator (exec)',
    source: `"use strict";
class Hello {
  constructor() {
    return () => () => "hello";
  }
}

class Outer extends Hello {
  constructor() {
    class Inner {
      @(super()) hello;
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Hello {
  constructor() {
    return () => () => 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    class Inner {
      constructor() {
        _defineProperty(this, 'hello', void 0);
      }
    }
    _decorate([super()], Inner.prototype, 'hello', void 0);
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Hello {
  constructor() {
    return () => () => 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    class Inner {
      constructor() {
        this.hello = void 0;
      }
    }
    _decorate([super()], Inner.prototype, 'hello', void 0);
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
    ],
  },
  {
    title: 'nested class — super call in decorator (input)',
    source: `"use strict";
class Hello {
  constructor() {
    return () => () => "hello";
  }
}

class Outer extends Hello {
  constructor() {
    class Inner {
      @(super()) hello;
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Hello {
  constructor() {
    return () => () => 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    class Inner {
      constructor() {
        _defineProperty(this, 'hello', void 0);
      }
    }
    _decorate([super()], Inner.prototype, 'hello', void 0);
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Hello {
  constructor() {
    return () => () => 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    class Inner {
      constructor() {
        this.hello = void 0;
      }
    }
    _decorate([super()], Inner.prototype, 'hello', void 0);
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
    ],
  },
  {
    title: 'nested class — super call in key (exec)',
    source: `"use strict";
class Hello {
  constructor() {
    return {
      toString() {
        return 'hello';
      },
    };
  }
}

class Outer extends Hello {
  constructor() {
    class Inner {
      [super()] = "hello";
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Hello {
  constructor() {
    return {
      toString() {
        return 'hello';
      },
    };
  }
}
class Outer extends Hello {
  constructor() {
    let _super;
    _super = super();
    class Inner {
      constructor() {
        _defineProperty(this, _super, 'hello');
      }
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
class Hello {
  constructor() {
    return {
      toString() {
        return 'hello';
      },
    };
  }
}
class Outer extends Hello {
  constructor() {
    let _super;
    _super = super();
    class Inner {
      constructor() {
        this[_super] = 'hello';
      }
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
    ],
  },
  {
    title: 'nested class — super call in key (input)',
    source: `"use strict";
class Hello {
  constructor() {
    return {
      toString() {
        return 'hello';
      },
    };
  }
}

class Outer extends Hello {
  constructor() {
    class Inner {
      [super()] = "hello";
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Hello {
  constructor() {
    return {
      toString() {
        return 'hello';
      },
    };
  }
}
class Outer extends Hello {
  constructor() {
    let _super;
    _super = super();
    class Inner {
      constructor() {
        _defineProperty(this, _super, 'hello');
      }
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
class Hello {
  constructor() {
    return {
      toString() {
        return 'hello';
      },
    };
  }
}
class Outer extends Hello {
  constructor() {
    let _super;
    _super = super();
    class Inner {
      constructor() {
        this[_super] = 'hello';
      }
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
    ],
  },
  {
    title: 'nested class — super property in accessor key (exec)',
    source: `"use strict";
class Hello {
  toString() {
    return 'hello';
  }
}

class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      accessor [super.toString()] = 'hello';
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'exec.js',
    output: `'use strict';
class Hello {
  toString() {
    return 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      accessor [super.toString()] = 'hello';
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
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
    title: 'nested class — super property in accessor key (input)',
    source: `"use strict";
class Hello {
  toString() {
    return 'hello';
  }
}

class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      accessor [super.toString()] = 'hello';
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'input.js',
    output: `'use strict';
class Hello {
  toString() {
    return 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      accessor [super.toString()] = 'hello';
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
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
    title: 'nested class — super property in decorator (exec)',
    source: `"use strict";
class Hello {
  dec() { return () => "hello" }
}

class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      @(super.dec) hello;
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Hello {
  dec() {
    return () => 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      constructor() {
        _defineProperty(this, 'hello', void 0);
      }
    }
    _decorate([super.dec], Inner.prototype, 'hello', void 0);
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Hello {
  dec() {
    return () => 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      constructor() {
        this.hello = void 0;
      }
    }
    _decorate([super.dec], Inner.prototype, 'hello', void 0);
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
    ],
  },
  {
    title: 'nested class — super property in decorator (input)',
    source: `"use strict";
class Hello {
  dec() { return () => "hello" }
}

class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      @(super.dec) hello;
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Hello {
  dec() {
    return () => 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      constructor() {
        _defineProperty(this, 'hello', void 0);
      }
    }
    _decorate([super.dec], Inner.prototype, 'hello', void 0);
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
function _decorate(decorators, target, key, descriptor) {
  var argumentCount = arguments.length;
  var result =
    argumentCount < 3
      ? target
      : descriptor === null
        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))
        : descriptor;
  var decorator;
  for (var index = decorators.length - 1; index >= 0; index--) {
    if ((decorator = decorators[index]))
      result =
        (argumentCount < 3
          ? decorator(result)
          : argumentCount > 3
            ? decorator(target, key, result)
            : decorator(target, key)) || result;
  }
  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);
  return result;
}
class Hello {
  dec() {
    return () => 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      constructor() {
        this.hello = void 0;
      }
    }
    _decorate([super.dec], Inner.prototype, 'hello', void 0);
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
    ],
  },
  {
    title: 'nested class — super property in key (exec)',
    source: `"use strict";
class Hello {
  toString() {
    return 'hello';
  }
}

class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      [super.toString()] = 'hello';
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Hello {
  toString() {
    return 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    let _super$toString;
    super();
    _super$toString = super.toString();
    class Inner {
      constructor() {
        _defineProperty(this, _super$toString, 'hello');
      }
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
class Hello {
  toString() {
    return 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    let _super$toString;
    super();
    _super$toString = super.toString();
    class Inner {
      constructor() {
        this[_super$toString] = 'hello';
      }
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
    ],
  },
  {
    title: 'nested class — super property in key (input)',
    source: `"use strict";
class Hello {
  toString() {
    return 'hello';
  }
}

class Outer extends Hello {
  constructor() {
    super();
    class Inner {
      [super.toString()] = 'hello';
    }

    return new Inner();
  }
}

expect(new Outer().hello).toBe('hello');
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Hello {
  toString() {
    return 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    let _super$toString;
    super();
    _super$toString = super.toString();
    class Inner {
      constructor() {
        _defineProperty(this, _super$toString, 'hello');
      }
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
class Hello {
  toString() {
    return 'hello';
  }
}
class Outer extends Hello {
  constructor() {
    let _super$toString;
    super();
    _super$toString = super.toString();
    class Inner {
      constructor() {
        this[_super$toString] = 'hello';
      }
    }
    return new Inner();
  }
}
expect(new Outer().hello).toBe('hello');`,
      },
    ],
  },
  {
    title: 'private loose — access before declaration (exec)',
    source: `expect(() => {
  class C {
    static #_ = new C;
    static #p;
    constructor() {
      C.#p;
    }
  }
}).toThrow(/attempted to use private field on non-instance/);

expect(() => {
  class C {
    static #_ = new C;
    static #p;
    constructor() {
      C.#p = 0;
    }
  }
}).toThrow(/attempted to use private field on non-instance/);

expect(() => {
  class C {
    static #_ = new C;
    static #p;
    constructor() {
      for (C.#p of [0]);
    }
  }
}).toThrow(/attempted to use private field on non-instance/);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `expect(() => {
  var _C;
  class C {
    constructor() {
      _p._;
    }
  }
  _C = C;
  var _ = { _: new _C() };
  var _p = { _: void 0 };
}).toThrow(/attempted to use private field on non-instance/);
expect(() => {
  var _C2;
  class C {
    constructor() {
      _p2._ = 0;
    }
  }
  _C2 = C;
  var _2 = { _: new _C2() };
  var _p2 = { _: void 0 };
}).toThrow(/attempted to use private field on non-instance/);
expect(() => {
  var _C3;
  class C {
    constructor() {
      for (_p3._ of [0]);
    }
  }
  _C3 = C;
  var _3 = { _: new _C3() };
  var _p3 = { _: void 0 };
}).toThrow(/attempted to use private field on non-instance/);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
expect(() => {
  var _C;
  var _ = /* @__PURE__ */ _classPrivateFieldLooseKey('_');
  var _p = /* @__PURE__ */ _classPrivateFieldLooseKey('p');
  class C {
    constructor() {
      _classPrivateFieldLooseBase(C, _p)[_p];
    }
  }
  _C = C;
  Object.defineProperty(C, _, {
    writable: true,
    value: new _C(),
  });
  Object.defineProperty(C, _p, {
    writable: true,
    value: void 0,
  });
}).toThrow(/attempted to use private field on non-instance/);
expect(() => {
  var _C2;
  var _2 = /* @__PURE__ */ _classPrivateFieldLooseKey('_');
  var _p2 = /* @__PURE__ */ _classPrivateFieldLooseKey('p');
  class C {
    constructor() {
      _classPrivateFieldLooseBase(C, _p2)[_p2] = 0;
    }
  }
  _C2 = C;
  Object.defineProperty(C, _2, {
    writable: true,
    value: new _C2(),
  });
  Object.defineProperty(C, _p2, {
    writable: true,
    value: void 0,
  });
}).toThrow(/attempted to use private field on non-instance/);
expect(() => {
  var _C3;
  var _3 = /* @__PURE__ */ _classPrivateFieldLooseKey('_');
  var _p3 = /* @__PURE__ */ _classPrivateFieldLooseKey('p');
  class C {
    constructor() {
      for (_classPrivateFieldLooseBase(C, _p3)[_p3] of [0]);
    }
  }
  _C3 = C;
  Object.defineProperty(C, _3, {
    writable: true,
    value: new _C3(),
  });
  Object.defineProperty(C, _p3, {
    writable: true,
    value: void 0,
  });
}).toThrow(/attempted to use private field on non-instance/);`,
      },
    ],
  },
  {
    title: 'private loose — assignment (input)',
    source: `class Foo {
  #foo = 0;

  test(other) {
    this.#foo += 1;
    this.#foo = 2;
    other.obj.#foo += 1;
    other.obj.#foo = 2;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 0);
  }
  test(other) {
    var _other$obj;
    _classPrivateFieldSet(_foo, this, _classPrivateFieldGet(_foo, this) + 1);
    _classPrivateFieldSet(_foo, this, 2);
    _classPrivateFieldSet(
      _foo,
      (_other$obj = other.obj),
      _classPrivateFieldGet(_foo, _other$obj) + 1,
    );
    _classPrivateFieldSet(_foo, other.obj, 2);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 0,
    });
  }
  test(other) {
    _classPrivateFieldLooseBase(this, _foo)[_foo] += 1;
    _classPrivateFieldLooseBase(this, _foo)[_foo] = 2;
    _classPrivateFieldLooseBase(other.obj, _foo)[_foo] += 1;
    _classPrivateFieldLooseBase(other.obj, _foo)[_foo] = 2;
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — call (exec)',
    source: `class Foo {
  #foo = function() {
    return this;
  }

  test(other) {
    return [this.#foo(), other.#foo()];
  }
}

const f = new Foo;
const o = new Foo;
const test = f.test(o);
expect(test[0]).toBe(f);
expect(test[1]).toBe(o);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, function () {
      return this;
    });
  }
  test(other) {
    return [
      _classPrivateFieldGet(_foo, this).call(this),
      _classPrivateFieldGet(_foo, other).call(other),
    ];
  }
}
const f = new Foo();
const o = new Foo();
const test = f.test(o);
expect(test[0]).toBe(f);
expect(test[1]).toBe(o);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: function () {
        return this;
      },
    });
  }
  test(other) {
    return [
      _classPrivateFieldLooseBase(this, _foo)[_foo](),
      _classPrivateFieldLooseBase(other, _foo)[_foo](),
    ];
  }
}
const f = new Foo();
const o = new Foo();
const test = f.test(o);
expect(test[0]).toBe(f);
expect(test[1]).toBe(o);`,
      },
    ],
  },
  {
    title: 'private loose — call (input)',
    source: `class Foo {
  #foo = function() {
    return this;
  }

  test(other) {
    this.#foo();
    other.obj.#foo();
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, function () {
      return this;
    });
  }
  test(other) {
    var _other$obj;
    _classPrivateFieldGet(_foo, this).call(this);
    _classPrivateFieldGet(_foo, (_other$obj = other.obj)).call(_other$obj);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: function () {
        return this;
      },
    });
  }
  test(other) {
    _classPrivateFieldLooseBase(this, _foo)[_foo]();
    _classPrivateFieldLooseBase(other.obj, _foo)[_foo]();
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — canonical (exec)',
    source: `class Point {
    #x;
    #y;

    constructor(x = 0, y = 0) {
        this.#x = +x;
        this.#y = +y;
    }

    get x() { return this.#x }
    set x(value) { this.#x = +value }

    get y() { return this.#y }
    set y(value) { this.#y = +value }

    equals(p) { return this.#x === p.#x && this.#y === p.#y }

    toString() { return \`Point<\${ this.#x },\${ this.#y }>\` }

}

const p1 = new Point(1, 2);
const p2 = new Point(2, 3);
const p3 = new Point(1, 2);

expect(p1.x).toBe(1);
expect(p1.y).toBe(2);
expect(p2.x).toBe(2);
expect(p2.y).toBe(3);
expect(p3.x).toBe(1);
expect(p3.y).toBe(2);

expect(p1.equals(p1)).toBe(true)
expect(p1.equals(p2)).toBe(false)
expect(p1.equals(p3)).toBe(true)
expect(p2.equals(p1)).toBe(false)
expect(p2.equals(p2)).toBe(true)
expect(p2.equals(p3)).toBe(false)
expect(p3.equals(p1)).toBe(true)
expect(p3.equals(p2)).toBe(false)
expect(p3.equals(p3)).toBe(true)

expect(p1.toString()).toBe("Point<1,2>")
expect(p2.toString()).toBe("Point<2,3>")
expect(p3.toString()).toBe("Point<1,2>")

p1.x += 1;
p1.y = 3;
p2.x -= 1;
p2.y = 3;
p3.x = 0;
p3.y = 0;

expect(p1.x).toBe(2);
expect(p1.y).toBe(3);
expect(p2.x).toBe(1);
expect(p2.y).toBe(3);
expect(p3.x).toBe(0);
expect(p3.y).toBe(0);

expect(p1.equals(p1)).toBe(true)
expect(p1.equals(p2)).toBe(false)
expect(p1.equals(p3)).toBe(false)
expect(p2.equals(p1)).toBe(false)
expect(p2.equals(p2)).toBe(true)
expect(p2.equals(p3)).toBe(false)
expect(p3.equals(p1)).toBe(false)
expect(p3.equals(p2)).toBe(false)
expect(p3.equals(p3)).toBe(true)

expect(p1.toString()).toBe("Point<2,3>")
expect(p2.toString()).toBe("Point<1,3>")
expect(p3.toString()).toBe("Point<0,0>")
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _x = /* @__PURE__ */ new WeakMap();
var _y = /* @__PURE__ */ new WeakMap();
class Point {
  constructor(x = 0, y = 0) {
    _classPrivateFieldInitSpec(this, _x, void 0);
    _classPrivateFieldInitSpec(this, _y, void 0);
    _classPrivateFieldSet(_x, this, +x);
    _classPrivateFieldSet(_y, this, +y);
  }
  get x() {
    return _classPrivateFieldGet(_x, this);
  }
  set x(value) {
    _classPrivateFieldSet(_x, this, +value);
  }
  get y() {
    return _classPrivateFieldGet(_y, this);
  }
  set y(value) {
    _classPrivateFieldSet(_y, this, +value);
  }
  equals(p) {
    return (
      _classPrivateFieldGet(_x, this) === _classPrivateFieldGet(_x, p) &&
      _classPrivateFieldGet(_y, this) === _classPrivateFieldGet(_y, p)
    );
  }
  toString() {
    return \`Point<\${_classPrivateFieldGet(_x, this)},\${_classPrivateFieldGet(_y, this)}>\`;
  }
}
const p1 = new Point(1, 2);
const p2 = new Point(2, 3);
const p3 = new Point(1, 2);
expect(p1.x).toBe(1);
expect(p1.y).toBe(2);
expect(p2.x).toBe(2);
expect(p2.y).toBe(3);
expect(p3.x).toBe(1);
expect(p3.y).toBe(2);
expect(p1.equals(p1)).toBe(true);
expect(p1.equals(p2)).toBe(false);
expect(p1.equals(p3)).toBe(true);
expect(p2.equals(p1)).toBe(false);
expect(p2.equals(p2)).toBe(true);
expect(p2.equals(p3)).toBe(false);
expect(p3.equals(p1)).toBe(true);
expect(p3.equals(p2)).toBe(false);
expect(p3.equals(p3)).toBe(true);
expect(p1.toString()).toBe('Point<1,2>');
expect(p2.toString()).toBe('Point<2,3>');
expect(p3.toString()).toBe('Point<1,2>');
p1.x += 1;
p1.y = 3;
p2.x -= 1;
p2.y = 3;
p3.x = 0;
p3.y = 0;
expect(p1.x).toBe(2);
expect(p1.y).toBe(3);
expect(p2.x).toBe(1);
expect(p2.y).toBe(3);
expect(p3.x).toBe(0);
expect(p3.y).toBe(0);
expect(p1.equals(p1)).toBe(true);
expect(p1.equals(p2)).toBe(false);
expect(p1.equals(p3)).toBe(false);
expect(p2.equals(p1)).toBe(false);
expect(p2.equals(p2)).toBe(true);
expect(p2.equals(p3)).toBe(false);
expect(p3.equals(p1)).toBe(false);
expect(p3.equals(p2)).toBe(false);
expect(p3.equals(p3)).toBe(true);
expect(p1.toString()).toBe('Point<2,3>');
expect(p2.toString()).toBe('Point<1,3>');
expect(p3.toString()).toBe('Point<0,0>');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');
class Point {
  constructor(x = 0, y = 0) {
    Object.defineProperty(this, _x, {
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, _y, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _x)[_x] = +x;
    _classPrivateFieldLooseBase(this, _y)[_y] = +y;
  }
  get x() {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  }
  set x(value) {
    _classPrivateFieldLooseBase(this, _x)[_x] = +value;
  }
  get y() {
    return _classPrivateFieldLooseBase(this, _y)[_y];
  }
  set y(value) {
    _classPrivateFieldLooseBase(this, _y)[_y] = +value;
  }
  equals(p) {
    return (
      _classPrivateFieldLooseBase(this, _x)[_x] === _classPrivateFieldLooseBase(p, _x)[_x] &&
      _classPrivateFieldLooseBase(this, _y)[_y] === _classPrivateFieldLooseBase(p, _y)[_y]
    );
  }
  toString() {
    return \`Point<\${_classPrivateFieldLooseBase(this, _x)[_x]},\${_classPrivateFieldLooseBase(this, _y)[_y]}>\`;
  }
}
const p1 = new Point(1, 2);
const p2 = new Point(2, 3);
const p3 = new Point(1, 2);
expect(p1.x).toBe(1);
expect(p1.y).toBe(2);
expect(p2.x).toBe(2);
expect(p2.y).toBe(3);
expect(p3.x).toBe(1);
expect(p3.y).toBe(2);
expect(p1.equals(p1)).toBe(true);
expect(p1.equals(p2)).toBe(false);
expect(p1.equals(p3)).toBe(true);
expect(p2.equals(p1)).toBe(false);
expect(p2.equals(p2)).toBe(true);
expect(p2.equals(p3)).toBe(false);
expect(p3.equals(p1)).toBe(true);
expect(p3.equals(p2)).toBe(false);
expect(p3.equals(p3)).toBe(true);
expect(p1.toString()).toBe('Point<1,2>');
expect(p2.toString()).toBe('Point<2,3>');
expect(p3.toString()).toBe('Point<1,2>');
p1.x += 1;
p1.y = 3;
p2.x -= 1;
p2.y = 3;
p3.x = 0;
p3.y = 0;
expect(p1.x).toBe(2);
expect(p1.y).toBe(3);
expect(p2.x).toBe(1);
expect(p2.y).toBe(3);
expect(p3.x).toBe(0);
expect(p3.y).toBe(0);
expect(p1.equals(p1)).toBe(true);
expect(p1.equals(p2)).toBe(false);
expect(p1.equals(p3)).toBe(false);
expect(p2.equals(p1)).toBe(false);
expect(p2.equals(p2)).toBe(true);
expect(p2.equals(p3)).toBe(false);
expect(p3.equals(p1)).toBe(false);
expect(p3.equals(p2)).toBe(false);
expect(p3.equals(p3)).toBe(true);
expect(p1.toString()).toBe('Point<2,3>');
expect(p2.toString()).toBe('Point<1,3>');
expect(p3.toString()).toBe('Point<0,0>');`,
      },
    ],
  },
  {
    title: 'private loose — canonical (input)',
    source: `class Point {
    #x;
    #y;

    constructor(x = 0, y = 0) {
        this.#x = +x;
        this.#y = +y;
    }

    get x() { return this.#x }
    set x(value) { this.#x = +value }

    get y() { return this.#y }
    set y(value) { this.#y = +value }

    equals(p) { return this.#x === p.#x && this.#y === p.#y }

    toString() { return \`Point<\${ this.#x },\${ this.#y }>\` }

}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _x = /* @__PURE__ */ new WeakMap();
var _y = /* @__PURE__ */ new WeakMap();
class Point {
  constructor(x = 0, y = 0) {
    _classPrivateFieldInitSpec(this, _x, void 0);
    _classPrivateFieldInitSpec(this, _y, void 0);
    _classPrivateFieldSet(_x, this, +x);
    _classPrivateFieldSet(_y, this, +y);
  }
  get x() {
    return _classPrivateFieldGet(_x, this);
  }
  set x(value) {
    _classPrivateFieldSet(_x, this, +value);
  }
  get y() {
    return _classPrivateFieldGet(_y, this);
  }
  set y(value) {
    _classPrivateFieldSet(_y, this, +value);
  }
  equals(p) {
    return (
      _classPrivateFieldGet(_x, this) === _classPrivateFieldGet(_x, p) &&
      _classPrivateFieldGet(_y, this) === _classPrivateFieldGet(_y, p)
    );
  }
  toString() {
    return \`Point<\${_classPrivateFieldGet(_x, this)},\${_classPrivateFieldGet(_y, this)}>\`;
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');
class Point {
  constructor(x = 0, y = 0) {
    Object.defineProperty(this, _x, {
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, _y, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _x)[_x] = +x;
    _classPrivateFieldLooseBase(this, _y)[_y] = +y;
  }
  get x() {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  }
  set x(value) {
    _classPrivateFieldLooseBase(this, _x)[_x] = +value;
  }
  get y() {
    return _classPrivateFieldLooseBase(this, _y)[_y];
  }
  set y(value) {
    _classPrivateFieldLooseBase(this, _y)[_y] = +value;
  }
  equals(p) {
    return (
      _classPrivateFieldLooseBase(this, _x)[_x] === _classPrivateFieldLooseBase(p, _x)[_x] &&
      _classPrivateFieldLooseBase(this, _y)[_y] === _classPrivateFieldLooseBase(p, _y)[_y]
    );
  }
  toString() {
    return \`Point<\${_classPrivateFieldLooseBase(this, _x)[_x]},\${_classPrivateFieldLooseBase(this, _y)[_y]}>\`;
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — class shadow builtins (input)',
    source: `export class TypeError {
  #message
}
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `import _classPrivateFieldInitSpec from '@babel/runtime/helpers/classPrivateFieldInitSpec';
var _message = /* @__PURE__ */ new WeakMap();
export class TypeError {
  constructor() {
    _classPrivateFieldInitSpec(this, _message, void 0);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';
var _message = /* @__PURE__ */ _classPrivateFieldLooseKey('message');
export class TypeError {
  constructor() {
    Object.defineProperty(this, _message, {
      writable: true,
      value: void 0,
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — constructor collision (exec)',
    source: `var foo = "bar";

class Foo {
  #bar = foo;

  constructor() {
    var foo = "foo";
  }

  test() {
    return this.#bar;
  }
}

const f = new Foo;
expect(f.test()).toBe(foo);
expect("bar" in f).toBe(false);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var foo = 'bar';
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, foo);
    var _foo = 'foo';
  }
  test() {
    return _classPrivateFieldGet(_bar, this);
  }
}
const f = new Foo();
expect(f.test()).toBe(foo);
expect('bar' in f).toBe(false);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var foo = 'bar';
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: foo,
    });
    var _foo = 'foo';
  }
  test() {
    return _classPrivateFieldLooseBase(this, _bar)[_bar];
  }
}
const f = new Foo();
expect(f.test()).toBe(foo);
expect('bar' in f).toBe(false);`,
      },
    ],
  },
  {
    title: 'private loose — constructor collision (input)',
    source: `var foo = "bar";

class Foo {
  #bar = foo;

  constructor() {
    var foo = "foo";
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var foo = 'bar';
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, foo);
    var _foo = 'foo';
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var foo = 'bar';
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: foo,
    });
    var _foo = 'foo';
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — declaration order (exec)',
    source: `class C {
  y = this.#x;
  #x;
}

expect(() => {
  new C();
}).toThrow();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _x = /* @__PURE__ */ new WeakMap();
class C {
  constructor() {
    _defineProperty(this, 'y', _classPrivateFieldGet(_x, this));
    _classPrivateFieldInitSpec(this, _x, void 0);
  }
}
expect(() => {
  new C();
}).toThrow();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
class C {
  constructor() {
    this.y = _classPrivateFieldLooseBase(this, _x)[_x];
    Object.defineProperty(this, _x, {
      writable: true,
      value: void 0,
    });
  }
}
expect(() => {
  new C();
}).toThrow();`,
      },
    ],
  },
  {
    title: 'private loose — declaration order (input)',
    source: `class C {
  y = this.#x;
  #x;
}

expect(() => {
  new C();
}).toThrow();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _x = /* @__PURE__ */ new WeakMap();
class C {
  constructor() {
    _defineProperty(this, 'y', _classPrivateFieldGet(_x, this));
    _classPrivateFieldInitSpec(this, _x, void 0);
  }
}
expect(() => {
  new C();
}).toThrow();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
class C {
  constructor() {
    this.y = _classPrivateFieldLooseBase(this, _x)[_x];
    Object.defineProperty(this, _x, {
      writable: true,
      value: void 0,
    });
  }
}
expect(() => {
  new C();
}).toThrow();`,
      },
    ],
  },
  {
    title: 'private loose — derived multiple supers (input)',
    source: `class Foo extends Bar {
  #bar = "foo";

  constructor() {
    if (condition) {
      super();
    } else {
      super();
    }
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo extends Bar {
  constructor() {
    var _super = (..._args) => (
      super(..._args),
      _classPrivateFieldInitSpec(this, _bar, 'foo'),
      this
    );
    if (condition) {
      _super();
    } else {
      _super();
    }
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo extends Bar {
  constructor() {
    var _super = (..._args) => (
      super(..._args),
      Object.defineProperty(this, _bar, {
        writable: true,
        value: 'foo',
      }),
      this
    );
    if (condition) {
      _super();
    } else {
      _super();
    }
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — derived (exec)',
    source: `class Foo {
  #prop = "foo";

  foo() {
    return this.#prop;
  }
}

class Bar extends Foo {
  #prop = "bar";

  bar() {
    return this.#prop;
  }
}

const f = new Foo;
expect(f.foo()).toBe("foo");

const b = new Bar;
expect(b.foo()).toBe("foo");
expect(b.bar()).toBe("bar");
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _prop = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _prop, 'foo');
  }
  foo() {
    return _classPrivateFieldGet(_prop, this);
  }
}
var _prop2 = /* @__PURE__ */ new WeakMap();
class Bar extends Foo {
  constructor(..._args) {
    super(..._args);
    _classPrivateFieldInitSpec(this, _prop2, 'bar');
  }
  bar() {
    return _classPrivateFieldGet(_prop2, this);
  }
}
const f = new Foo();
expect(f.foo()).toBe('foo');
const b = new Bar();
expect(b.foo()).toBe('foo');
expect(b.bar()).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _prop = /* @__PURE__ */ _classPrivateFieldLooseKey('prop');
class Foo {
  constructor() {
    Object.defineProperty(this, _prop, {
      writable: true,
      value: 'foo',
    });
  }
  foo() {
    return _classPrivateFieldLooseBase(this, _prop)[_prop];
  }
}
var _prop2 = /* @__PURE__ */ _classPrivateFieldLooseKey('prop');
class Bar extends Foo {
  constructor(..._args) {
    super(..._args);
    Object.defineProperty(this, _prop2, {
      writable: true,
      value: 'bar',
    });
  }
  bar() {
    return _classPrivateFieldLooseBase(this, _prop2)[_prop2];
  }
}
const f = new Foo();
expect(f.foo()).toBe('foo');
const b = new Bar();
expect(b.foo()).toBe('foo');
expect(b.bar()).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — derived (input)',
    source: `class Foo {
  #prop = "foo";
}

class Bar extends Foo {
  #prop = "bar";
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _prop = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _prop, 'foo');
  }
}
var _prop2 = /* @__PURE__ */ new WeakMap();
class Bar extends Foo {
  constructor(..._args) {
    super(..._args);
    _classPrivateFieldInitSpec(this, _prop2, 'bar');
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _prop = /* @__PURE__ */ _classPrivateFieldLooseKey('prop');
class Foo {
  constructor() {
    Object.defineProperty(this, _prop, {
      writable: true,
      value: 'foo',
    });
  }
}
var _prop2 = /* @__PURE__ */ _classPrivateFieldLooseKey('prop');
class Bar extends Foo {
  constructor(..._args) {
    super(..._args);
    Object.defineProperty(this, _prop2, {
      writable: true,
      value: 'bar',
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 1 (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    this.#client = 1;
    ;([this.x = this.#client, this.#client, this.y = this.#client] = props);
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo([undefined, 'bar']);
expect(foo.getClient()).toBe('bar');
expect(foo.x).toBe(1);
expect(foo.y).toBe('bar');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    _classPrivateFieldSet(_client, this, 1);
    [
      this.x = _classPrivateFieldGet(_client, this),
      _toSetter(_classPrivateFieldSet, [_client, this])._,
      this.y = _classPrivateFieldGet(_client, this),
    ] = props;
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo([undefined, 'bar']);
expect(foo.getClient()).toBe('bar');
expect(foo.x).toBe(1);
expect(foo.y).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _client)[_client] = 1;
    [
      this.x = _classPrivateFieldLooseBase(this, _client)[_client],
      _classPrivateFieldLooseBase(this, _client)[_client],
      this.y = _classPrivateFieldLooseBase(this, _client)[_client],
    ] = props;
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo([undefined, 'bar']);
expect(foo.getClient()).toBe('bar');
expect(foo.x).toBe(1);
expect(foo.y).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 1 (input)',
    source: `class Foo {
  #client

  constructor(props) {
    this.#client = 1;
    ([this.x = this.#client, this.#client, this.y = this.#client] = props);
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    _classPrivateFieldSet(_client, this, 1);
    [
      this.x = _classPrivateFieldGet(_client, this),
      _toSetter(_classPrivateFieldSet, [_client, this])._,
      this.y = _classPrivateFieldGet(_client, this),
    ] = props;
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _client)[_client] = 1;
    [
      this.x = _classPrivateFieldLooseBase(this, _client)[_client],
      _classPrivateFieldLooseBase(this, _client)[_client],
      this.y = _classPrivateFieldLooseBase(this, _client)[_client],
    ] = props;
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 2 (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    let x;
    ;([x, ...this.#client] = props);
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo(['foo', 'bar', 'baz', 'quu']);
expect(foo.getClient()).toEqual(['bar', 'baz', 'quu']);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    let x;
    [x, ..._toSetter(_classPrivateFieldSet, [_client, this])._] = props;
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo(['foo', 'bar', 'baz', 'quu']);
expect(foo.getClient()).toEqual(['bar', 'baz', 'quu']);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    let x;
    [x, ..._classPrivateFieldLooseBase(this, _client)[_client]] = props;
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo(['foo', 'bar', 'baz', 'quu']);
expect(foo.getClient()).toEqual(['bar', 'baz', 'quu']);`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 2 (input)',
    source: `class Foo {
  #client

  constructor(props) {
    ([x, ...this.#client] = props);
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    [x, ..._toSetter(_classPrivateFieldSet, [_client, this])._] = props;
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    [x, ..._classPrivateFieldLooseBase(this, _client)[_client]] = props;
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 3 (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    ([this.#client = 5] = props);
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo([]);
expect(foo.getClient()).toEqual(5);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    [_toSetter(_classPrivateFieldSet, [_client, this])._ = 5] = props;
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo([]);
expect(foo.getClient()).toEqual(5);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    [_classPrivateFieldLooseBase(this, _client)[_client] = 5] = props;
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo([]);
expect(foo.getClient()).toEqual(5);`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 3 (input)',
    source: `class Foo {
  #client

  constructor(props) {
    ([this.#client = 5] = props);
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    [_toSetter(_classPrivateFieldSet, [_client, this])._ = 5] = props;
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    [_classPrivateFieldLooseBase(this, _client)[_client] = 5] = props;
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern static (exec)',
    source: `class Foo {
  static #client

  constructor(props) {
    ;([Foo.#client] = props);
  }

  getClient() {
    return Foo.#client;
  }
}

const foo = new Foo(['bar']);
expect(foo.getClient()).toBe('bar');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  constructor(props) {
    [_client._] = props;
  }
  getClient() {
    return _client._;
  }
}
var _client = { _: void 0 };
const foo = new Foo(['bar']);
expect(foo.getClient()).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    [_classPrivateFieldLooseBase(Foo, _client)[_client]] = props;
  }
  getClient() {
    return _classPrivateFieldLooseBase(Foo, _client)[_client];
  }
}
Object.defineProperty(Foo, _client, {
  writable: true,
  value: void 0,
});
const foo = new Foo(['bar']);
expect(foo.getClient()).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern static (input)',
    source: `class Foo {
  static #client

  constructor(props) {
    ([Foo.#client] = props);
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  constructor(props) {
    [_client._] = props;
  }
}
var _client = { _: void 0 };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    [_classPrivateFieldLooseBase(Foo, _client)[_client]] = props;
  }
}
Object.defineProperty(Foo, _client, {
  writable: true,
  value: void 0,
});`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    ;([this.#client] = props);
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo(['bar']);
expect(foo.getClient()).toBe('bar');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    [_toSetter(_classPrivateFieldSet, [_client, this])._] = props;
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo(['bar']);
expect(foo.getClient()).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    [_classPrivateFieldLooseBase(this, _client)[_client]] = props;
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo(['bar']);
expect(foo.getClient()).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern (input)',
    source: `class Foo {
  #client

  constructor(props) {
    ([this.#client] = props);
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    [_toSetter(_classPrivateFieldSet, [_client, this])._] = props;
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    [_classPrivateFieldLooseBase(this, _client)[_client]] = props;
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 1 (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    this.#client = 'foo';
    ;({ x: this.x = this.#client, y: this.#client, z: this.z = this.#client } = props)
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo({ y: 'bar' });
expect(foo.getClient()).toBe('bar');
expect(foo.x).toBe('foo');
expect(foo.z).toBe('bar');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    _classPrivateFieldSet(_client, this, 'foo');
    ({
      x: this.x = _classPrivateFieldGet(_client, this),
      y: _toSetter(_classPrivateFieldSet, [_client, this])._,
      z: this.z = _classPrivateFieldGet(_client, this),
    } = props);
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo({ y: 'bar' });
expect(foo.getClient()).toBe('bar');
expect(foo.x).toBe('foo');
expect(foo.z).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _client)[_client] = 'foo';
    ({
      x: this.x = _classPrivateFieldLooseBase(this, _client)[_client],
      y: _classPrivateFieldLooseBase(this, _client)[_client],
      z: this.z = _classPrivateFieldLooseBase(this, _client)[_client],
    } = props);
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo({ y: 'bar' });
expect(foo.getClient()).toBe('bar');
expect(foo.x).toBe('foo');
expect(foo.z).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 1 (input)',
    source: `class Foo {
  #client

  constructor(props) {
    this.#client = 'foo';
    ({ x: this.x = this.#client, y: this.#client, z: this.z = this.#client } = props)
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    _classPrivateFieldSet(_client, this, 'foo');
    ({
      x: this.x = _classPrivateFieldGet(_client, this),
      y: _toSetter(_classPrivateFieldSet, [_client, this])._,
      z: this.z = _classPrivateFieldGet(_client, this),
    } = props);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _client)[_client] = 'foo';
    ({
      x: this.x = _classPrivateFieldLooseBase(this, _client)[_client],
      y: _classPrivateFieldLooseBase(this, _client)[_client],
      z: this.z = _classPrivateFieldLooseBase(this, _client)[_client],
    } = props);
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 2 exec (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    let x;
    ;({ x, ...this.#client } = props)
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo({ x: 'foo', y: 'bar', z: 'baz' });
expect(foo.getClient()).toEqual({ y: 'bar', z: 'baz' });
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    let x;
    ({ x, ..._toSetter(_classPrivateFieldSet, [_client, this])._ } = props);
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo({
  x: 'foo',
  y: 'bar',
  z: 'baz',
});
expect(foo.getClient()).toEqual({
  y: 'bar',
  z: 'baz',
});`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    let x;
    ({ x, ..._classPrivateFieldLooseBase(this, _client)[_client] } = props);
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo({
  x: 'foo',
  y: 'bar',
  z: 'baz',
});
expect(foo.getClient()).toEqual({
  y: 'bar',
  z: 'baz',
});`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 2 (input)',
    source: `class Foo {
  #client

  constructor(props) {
    ({ x, ...this.#client } = props)
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    ({ x, ..._toSetter(_classPrivateFieldSet, [_client, this])._ } = props);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    ({ x, ..._classPrivateFieldLooseBase(this, _client)[_client] } = props);
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 3 (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    ({ client: this.#client = 5 } = props);
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo({});
expect(foo.getClient()).toEqual(5);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    ({ client: _toSetter(_classPrivateFieldSet, [_client, this])._ = 5 } = props);
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo({});
expect(foo.getClient()).toEqual(5);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    ({ client: _classPrivateFieldLooseBase(this, _client)[_client] = 5 } = props);
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo({});
expect(foo.getClient()).toEqual(5);`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 3 (input)',
    source: `class Foo {
  #client

  constructor(props) {
    ({ client: this.#client = 5 } = props);
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    ({ client: _toSetter(_classPrivateFieldSet, [_client, this])._ = 5 } = props);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    ({ client: _classPrivateFieldLooseBase(this, _client)[_client] = 5 } = props);
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern static (exec)',
    source: `class Foo {
  static #client

  constructor(props) {
    ;({ client: Foo.#client } = props)
  }

  getClient() {
    return Foo.#client;
  }
}

const foo = new Foo({ client: 'bar' });
expect(foo.getClient()).toBe('bar');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  constructor(props) {
    ({ client: _client._ } = props);
  }
  getClient() {
    return _client._;
  }
}
var _client = { _: void 0 };
const foo = new Foo({ client: 'bar' });
expect(foo.getClient()).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    ({ client: _classPrivateFieldLooseBase(Foo, _client)[_client] } = props);
  }
  getClient() {
    return _classPrivateFieldLooseBase(Foo, _client)[_client];
  }
}
Object.defineProperty(Foo, _client, {
  writable: true,
  value: void 0,
});
const foo = new Foo({ client: 'bar' });
expect(foo.getClient()).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern static (input)',
    source: `class Foo {
  static #client

  constructor(props) {
    ({ client: Foo.#client } = props)
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  constructor(props) {
    ({ client: _client._ } = props);
  }
}
var _client = { _: void 0 };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    ({ client: _classPrivateFieldLooseBase(Foo, _client)[_client] } = props);
  }
}
Object.defineProperty(Foo, _client, {
  writable: true,
  value: void 0,
});`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    ;({ client: this.#client } = props)
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo({ client: 'bar' });
expect(foo.getClient()).toBe('bar');
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    ({ client: _toSetter(_classPrivateFieldSet, [_client, this])._ } = props);
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo({ client: 'bar' });
expect(foo.getClient()).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    ({ client: _classPrivateFieldLooseBase(this, _client)[_client] } = props);
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo({ client: 'bar' });
expect(foo.getClient()).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern (input)',
    source: `class Foo {
  #client

  constructor(props) {
    ({ client: this.#client } = props)
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    ({ client: _toSetter(_classPrivateFieldSet, [_client, this])._ } = props);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    ({ client: _classPrivateFieldLooseBase(this, _client)[_client] } = props);
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — extracted this (input)',
    source: `var foo = "bar";

class Foo {
  #bar = this;
  #baz = foo;

  constructor(foo) {
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var foo = 'bar';
var _bar = /* @__PURE__ */ new WeakMap();
var _baz = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(_foo) {
    _classPrivateFieldInitSpec(this, _bar, this);
    _classPrivateFieldInitSpec(this, _baz, foo);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var foo = 'bar';
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
var _baz = /* @__PURE__ */ _classPrivateFieldLooseKey('baz');
class Foo {
  constructor(_foo) {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: this,
    });
    Object.defineProperty(this, _baz, {
      writable: true,
      value: foo,
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — foobar (input)',
    source: `class Child extends Parent {
  constructor() {
    super();
  }

  #scopedFunctionWithThis = () => {
    this.name = {};
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _scopedFunctionWithThis = /* @__PURE__ */ new WeakMap();
class Child extends Parent {
  constructor() {
    super();
    _classPrivateFieldInitSpec(this, _scopedFunctionWithThis, () => {
      this.name = {};
    });
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _scopedFunctionWithThis = /* @__PURE__ */ _classPrivateFieldLooseKey('scopedFunctionWithThis');
class Child extends Parent {
  constructor() {
    super();
    Object.defineProperty(this, _scopedFunctionWithThis, {
      writable: true,
      value: () => {
        this.name = {};
      },
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — instance undefined (exec)',
    source: `class Foo {
  #bar;

  test() {
    return this.#bar;
  }
}

expect(new Foo().test()).toBe(undefined);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, void 0);
  }
  test() {
    return _classPrivateFieldGet(_bar, this);
  }
}
expect(new Foo().test()).toBe(undefined);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: void 0,
    });
  }
  test() {
    return _classPrivateFieldLooseBase(this, _bar)[_bar];
  }
}
expect(new Foo().test()).toBe(undefined);`,
      },
    ],
  },
  {
    title: 'private loose — instance undefined (input)',
    source: `class Foo {
  #bar;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, void 0);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: void 0,
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — instance (exec)',
    source: `class Foo {
  #bar = "foo";

  test() {
    return this.#bar;
  }

  static test(foo) {
    return foo.#bar;
  }
}

const f = new Foo();
expect(f.test()).toBe("foo");
expect(Foo.test(f)).toBe("foo");
expect("bar" in f).toBe(false);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, 'foo');
  }
  test() {
    return _classPrivateFieldGet(_bar, this);
  }
  static test(foo) {
    return _classPrivateFieldGet(_bar, foo);
  }
}
const f = new Foo();
expect(f.test()).toBe('foo');
expect(Foo.test(f)).toBe('foo');
expect('bar' in f).toBe(false);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 'foo',
    });
  }
  test() {
    return _classPrivateFieldLooseBase(this, _bar)[_bar];
  }
  static test(foo) {
    return _classPrivateFieldLooseBase(foo, _bar)[_bar];
  }
}
const f = new Foo();
expect(f.test()).toBe('foo');
expect(Foo.test(f)).toBe('foo');
expect('bar' in f).toBe(false);`,
      },
    ],
  },
  {
    title: 'private loose — instance (input)',
    source: `class Foo {
  #bar = "foo";
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, 'foo');
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 'foo',
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — logical assignment (input)',
    source: `class Foo {
  #nullish = 0;
  #and = 0;
  #or = 0;

  self() {
    return this;
  }

  test() {
    this.#nullish ??= 42;
    this.#and &&= 0;
    this.#or ||= 0;

    this.self().#nullish ??= 42;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _nullish = /* @__PURE__ */ new WeakMap();
var _and = /* @__PURE__ */ new WeakMap();
var _or = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _nullish, 0);
    _classPrivateFieldInitSpec(this, _and, 0);
    _classPrivateFieldInitSpec(this, _or, 0);
  }
  self() {
    return this;
  }
  test() {
    var _this$self;
    _classPrivateFieldGet(_nullish, this) ?? _classPrivateFieldSet(_nullish, this, 42);
    _classPrivateFieldGet(_and, this) && _classPrivateFieldSet(_and, this, 0);
    _classPrivateFieldGet(_or, this) || _classPrivateFieldSet(_or, this, 0);
    _classPrivateFieldGet(_nullish, (_this$self = this.self())) ??
      _classPrivateFieldSet(_nullish, _this$self, 42);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _nullish = /* @__PURE__ */ _classPrivateFieldLooseKey('nullish');
var _and = /* @__PURE__ */ _classPrivateFieldLooseKey('and');
var _or = /* @__PURE__ */ _classPrivateFieldLooseKey('or');
class Foo {
  constructor() {
    Object.defineProperty(this, _nullish, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(this, _and, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(this, _or, {
      writable: true,
      value: 0,
    });
  }
  self() {
    return this;
  }
  test() {
    _classPrivateFieldLooseBase(this, _nullish)[_nullish] ??= 42;
    _classPrivateFieldLooseBase(this, _and)[_and] &&= 0;
    _classPrivateFieldLooseBase(this, _or)[_or] ||= 0;
    _classPrivateFieldLooseBase(this.self(), _nullish)[_nullish] ??= 42;
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — multiple (exec)',
    source: `class Foo {
  #x = 0;
  #y = this.#x + 1;

  test() {
    return this.#y;
  }
}

const f = new Foo();
expect(f.test()).toBe(1);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _x = /* @__PURE__ */ new WeakMap();
var _y = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _x, 0);
    _classPrivateFieldInitSpec(this, _y, _classPrivateFieldGet(_x, this) + 1);
  }
  test() {
    return _classPrivateFieldGet(_y, this);
  }
}
const f = new Foo();
expect(f.test()).toBe(1);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');
class Foo {
  constructor() {
    Object.defineProperty(this, _x, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(this, _y, {
      writable: true,
      value: _classPrivateFieldLooseBase(this, _x)[_x] + 1,
    });
  }
  test() {
    return _classPrivateFieldLooseBase(this, _y)[_y];
  }
}
const f = new Foo();
expect(f.test()).toBe(1);`,
      },
    ],
  },
  {
    title: 'private loose — multiple (input)',
    source: `class Foo {
  #x = 0;
  #y = this.#x;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _x = /* @__PURE__ */ new WeakMap();
var _y = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _x, 0);
    _classPrivateFieldInitSpec(this, _y, _classPrivateFieldGet(_x, this));
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');
class Foo {
  constructor() {
    Object.defineProperty(this, _x, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(this, _y, {
      writable: true,
      value: _classPrivateFieldLooseBase(this, _x)[_x],
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — native classes (input)',
    source: `class Foo {
  static #foo = "foo";
  #bar = "bar";

  static test() {
    return Foo.#foo;
  }

  test() {
    return this.#bar;
  }
}

const f = new Foo();
expect("foo" in Foo).toBe(false)
expect("bar" in f).toBe(false)
expect(Foo.test()).toBe("foo")
expect(f.test()).toBe("bar")
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, 'bar');
  }
  static test() {
    return _foo._;
  }
  test() {
    return _classPrivateFieldGet(_bar, this);
  }
}
var _foo = { _: 'foo' };
const f = new Foo();
expect('foo' in Foo).toBe(false);
expect('bar' in f).toBe(false);
expect(Foo.test()).toBe('foo');
expect(f.test()).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 'bar',
    });
  }
  static test() {
    return _classPrivateFieldLooseBase(Foo, _foo)[_foo];
  }
  test() {
    return _classPrivateFieldLooseBase(this, _bar)[_bar];
  }
}
Object.defineProperty(Foo, _foo, {
  writable: true,
  value: 'foo',
});
const f = new Foo();
expect('foo' in Foo).toBe(false);
expect('bar' in f).toBe(false);
expect(Foo.test()).toBe('foo');
expect(f.test()).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — nested class computed redeclared (exec)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested {
      #foo = 2;

      [this.#foo]() {
      }
    }

    return new Nested();
  }
}

const f = new Foo();
expect(() => {
  f.test();
}).toThrow();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    let _classPrivateFieldGet2;
    var _foo2 = /* @__PURE__ */ new WeakMap();
    _classPrivateFieldGet2 = _classPrivateFieldGet(_foo2, this);
    class Nested {
      constructor() {
        _classPrivateFieldInitSpec(this, _foo2, 2);
      }
      [_classPrivateFieldGet2]() {}
    }
    return new Nested();
  }
}
const f = new Foo();
expect(() => {
  f.test();
}).toThrow();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    let _classPrivateFieldLoo;
    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
    _classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _foo2)[_foo2];
    class Nested {
      constructor() {
        Object.defineProperty(this, _foo2, {
          writable: true,
          value: 2,
        });
      }
      [_classPrivateFieldLoo]() {}
    }
    return new Nested();
  }
}
const f = new Foo();
expect(() => {
  f.test();
}).toThrow();`,
      },
    ],
  },
  {
    title: 'private loose — nested class computed redeclared (input)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested {
      #foo = 2;

      [this.#foo]() {
      }
    }

    this.#foo;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    let _classPrivateFieldGet2;
    var _foo2 = /* @__PURE__ */ new WeakMap();
    _classPrivateFieldGet2 = _classPrivateFieldGet(_foo2, this);
    class Nested {
      constructor() {
        _classPrivateFieldInitSpec(this, _foo2, 2);
      }
      [_classPrivateFieldGet2]() {}
    }
    _classPrivateFieldGet(_foo, this);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    let _classPrivateFieldLoo;
    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
    _classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _foo2)[_foo2];
    class Nested {
      constructor() {
        Object.defineProperty(this, _foo2, {
          writable: true,
          value: 2,
        });
      }
      [_classPrivateFieldLoo]() {}
    }
    _classPrivateFieldLooseBase(this, _foo)[_foo];
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — nested class computed (exec)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested {
      [this.#foo]() {
      }
    }

    return new Nested();
  }
}

const f = new Foo();
expect(() => {
  f.test();
}).not.toThrow();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    class Nested {
      [_classPrivateFieldGet(_foo, this)]() {}
    }
    return new Nested();
  }
}
const f = new Foo();
expect(() => {
  f.test();
}).not.toThrow();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    class Nested {
      [_classPrivateFieldLooseBase(this, _foo)[_foo]]() {}
    }
    return new Nested();
  }
}
const f = new Foo();
expect(() => {
  f.test();
}).not.toThrow();`,
      },
    ],
  },
  {
    title: 'private loose — nested class computed (input)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested {
      [this.#foo]() {
      }
    }

    this.#foo;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    class Nested {
      [_classPrivateFieldGet(_foo, this)]() {}
    }
    _classPrivateFieldGet(_foo, this);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    class Nested {
      [_classPrivateFieldLooseBase(this, _foo)[_foo]]() {}
    }
    _classPrivateFieldLooseBase(this, _foo)[_foo];
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — nested class extends computed redeclared (exec)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested extends class {
      #foo = 2;

      [this.#foo] = 2;
    } {
      #foo = 3;
    }
  }
}

const f = new Foo();
expect(() => {
  f.test();
}).toThrow();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    var _foo2;
    let _this$foo;
    var _foo3 = /* @__PURE__ */ new WeakMap();
    class Nested extends ((_foo2 = /* @__PURE__ */ new WeakMap()),
    (_this$foo = _classPrivateFieldGet(_foo2, this)),
    class {
      constructor() {
        _classPrivateFieldInitSpec(this, _foo2, 2);
        _defineProperty(this, _this$foo, 2);
      }
    }) {
      constructor(..._args) {
        super(..._args);
        _classPrivateFieldInitSpec(this, _foo3, 3);
      }
    }
  }
}
const f = new Foo();
expect(() => {
  f.test();
}).toThrow();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    var _foo2;
    let _this$foo;
    var _foo3 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
    class Nested extends ((_foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),
    (_this$foo = _classPrivateFieldLooseBase(this, _foo2)[_foo2]),
    class {
      constructor() {
        Object.defineProperty(this, _foo2, {
          writable: true,
          value: 2,
        });
        this[_this$foo] = 2;
      }
    }) {
      constructor(..._args) {
        super(..._args);
        Object.defineProperty(this, _foo3, {
          writable: true,
          value: 3,
        });
      }
    }
  }
}
const f = new Foo();
expect(() => {
  f.test();
}).toThrow();`,
      },
    ],
  },
  {
    title: 'private loose — nested class extends computed redeclared (input)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested extends class {
      #foo = 2;
      [this.#foo] = 2;
    } {
      #foo = 3;
    }
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    var _foo2;
    let _this$foo;
    var _foo3 = /* @__PURE__ */ new WeakMap();
    class Nested extends ((_foo2 = /* @__PURE__ */ new WeakMap()),
    (_this$foo = _classPrivateFieldGet(_foo2, this)),
    class {
      constructor() {
        _classPrivateFieldInitSpec(this, _foo2, 2);
        _defineProperty(this, _this$foo, 2);
      }
    }) {
      constructor(..._args) {
        super(..._args);
        _classPrivateFieldInitSpec(this, _foo3, 3);
      }
    }
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    var _foo2;
    let _this$foo;
    var _foo3 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
    class Nested extends ((_foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),
    (_this$foo = _classPrivateFieldLooseBase(this, _foo2)[_foo2]),
    class {
      constructor() {
        Object.defineProperty(this, _foo2, {
          writable: true,
          value: 2,
        });
        this[_this$foo] = 2;
      }
    }) {
      constructor(..._args) {
        super(..._args);
        Object.defineProperty(this, _foo3, {
          writable: true,
          value: 3,
        });
      }
    }
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — nested class extends computed (exec)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested extends class {
      [this.#foo] = 2;
    } {
      #foo = 3;
    }

    return new Nested();
  }
}

const f = new Foo();
expect(() => {
  f.test();
}).not.toThrow();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    let _this$foo;
    var _foo2 = /* @__PURE__ */ new WeakMap();
    class Nested extends ((_this$foo = _classPrivateFieldGet(_foo, this)),
    class {
      constructor() {
        _defineProperty(this, _this$foo, 2);
      }
    }) {
      constructor(..._args) {
        super(..._args);
        _classPrivateFieldInitSpec(this, _foo2, 3);
      }
    }
    return new Nested();
  }
}
const f = new Foo();
expect(() => {
  f.test();
}).not.toThrow();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    let _this$foo;
    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
    class Nested extends ((_this$foo = _classPrivateFieldLooseBase(this, _foo)[_foo]),
    class {
      constructor() {
        this[_this$foo] = 2;
      }
    }) {
      constructor(..._args) {
        super(..._args);
        Object.defineProperty(this, _foo2, {
          writable: true,
          value: 3,
        });
      }
    }
    return new Nested();
  }
}
const f = new Foo();
expect(() => {
  f.test();
}).not.toThrow();`,
      },
    ],
  },
  {
    title: 'private loose — nested class extends computed (input)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested extends class {
      [this.#foo] = 2;
    } {
      #foo = 3;
    }
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    let _this$foo;
    var _foo2 = /* @__PURE__ */ new WeakMap();
    class Nested extends ((_this$foo = _classPrivateFieldGet(_foo, this)),
    class {
      constructor() {
        _defineProperty(this, _this$foo, 2);
      }
    }) {
      constructor(..._args) {
        super(..._args);
        _classPrivateFieldInitSpec(this, _foo2, 3);
      }
    }
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    let _this$foo;
    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
    class Nested extends ((_this$foo = _classPrivateFieldLooseBase(this, _foo)[_foo]),
    class {
      constructor() {
        this[_this$foo] = 2;
      }
    }) {
      constructor(..._args) {
        super(..._args);
        Object.defineProperty(this, _foo2, {
          writable: true,
          value: 3,
        });
      }
    }
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — nested class other redeclared (input)',
    source: `class Foo {
  #foo = 1;
  #bar = 1;

  test() {
    class Nested {
      #bar = 2;

      test() {
        this.#foo;
        this.#bar;
      }
    }

    this.#foo;
    this.#bar;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
    _classPrivateFieldInitSpec(this, _bar, 1);
  }
  test() {
    var _bar2 = /* @__PURE__ */ new WeakMap();
    class Nested {
      constructor() {
        _classPrivateFieldInitSpec(this, _bar2, 2);
      }
      test() {
        _classPrivateFieldGet(_foo, this);
        _classPrivateFieldGet(_bar2, this);
      }
    }
    _classPrivateFieldGet(_foo, this);
    _classPrivateFieldGet(_bar, this);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 1,
    });
  }
  test() {
    var _bar2 = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
    class Nested {
      constructor() {
        Object.defineProperty(this, _bar2, {
          writable: true,
          value: 2,
        });
      }
      test() {
        _classPrivateFieldLooseBase(this, _foo)[_foo];
        _classPrivateFieldLooseBase(this, _bar2)[_bar2];
      }
    }
    _classPrivateFieldLooseBase(this, _foo)[_foo];
    _classPrivateFieldLooseBase(this, _bar)[_bar];
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — nested class redeclared (input)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested {
      #foo = 2;

      test() {
        this.#foo;
      }
    }

    this.#foo;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    var _foo2 = /* @__PURE__ */ new WeakMap();
    class Nested {
      constructor() {
        _classPrivateFieldInitSpec(this, _foo2, 2);
      }
      test() {
        _classPrivateFieldGet(_foo2, this);
      }
    }
    _classPrivateFieldGet(_foo, this);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
    class Nested {
      constructor() {
        Object.defineProperty(this, _foo2, {
          writable: true,
          value: 2,
        });
      }
      test() {
        _classPrivateFieldLooseBase(this, _foo2)[_foo2];
      }
    }
    _classPrivateFieldLooseBase(this, _foo)[_foo];
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — nested class (input)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested {
      test() {
        this.#foo;
      }
    }

    this.#foo;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 1);
  }
  test() {
    class Nested {
      test() {
        _classPrivateFieldGet(_foo, this);
      }
    }
    _classPrivateFieldGet(_foo, this);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  test() {
    class Nested {
      test() {
        _classPrivateFieldLooseBase(this, _foo)[_foo];
      }
    }
    _classPrivateFieldLooseBase(this, _foo)[_foo];
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — non block arrow func (input)',
    source: `export default param =>
  class App {
    static #props = {
      prop1: 'prop1',
      prop2: 'prop2'
    }

    getParam() {
      return param;
    }
  }
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `export default param => {
  var _App, _props;
  return (
    (_App = class App {
      getParam() {
        return param;
      }
    }),
    (_props = {
      _: {
        prop1: 'prop1',
        prop2: 'prop2',
      },
    }),
    _App
  );
};`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';
export default param => {
  var _App, _props;
  return (
    (_props = /* @__PURE__ */ _classPrivateFieldLooseKey('props')),
    (_App = class App {
      getParam() {
        return param;
      }
    }),
    Object.defineProperty(_App, _props, {
      writable: true,
      value: {
        prop1: 'prop1',
        prop2: 'prop2',
      },
    }),
    _App
  );
};`,
      },
    ],
  },
  {
    title: 'private loose — optional chain before property with transform (exec)',
    source: `class Foo {
  static #x = 1;
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    expect(o?.Foo.#x).toEqual(1);
    expect(o?.Foo.#x.toString).toEqual(1..toString);
    expect(o?.Foo.#x.toString()).toEqual('1');

    expect(deep?.very.o?.Foo.#x).toEqual(1);
    expect(deep?.very.o?.Foo.#x.toString).toEqual(1..toString);
    expect(deep?.very.o?.Foo.#x.toString()).toEqual('1');

    expect(o?.Foo.#self.#x).toEqual(1);
    expect(o?.Foo.#self.self.#x).toEqual(1);
    expect(o?.Foo.#self?.self.#x).toEqual(1);
    expect(o?.Foo.#self.self?.self.#x).toEqual(1);
    expect(o?.Foo.#self?.self?.self.#x).toEqual(1);

    expect(o?.Foo.#self.getSelf().#x).toEqual(1);
    expect(o?.Foo.#self.getSelf?.().#x).toEqual(1);
    expect(o?.Foo.#self?.getSelf().#x).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.().#x).toEqual(1);
    expect(o?.Foo.#self.getSelf()?.self.#x).toEqual(1);
    expect(o?.Foo.#self.getSelf?.()?.self.#x).toEqual(1);
    expect(o?.Foo.#self?.getSelf()?.self.#x).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.()?.self.#x).toEqual(1);

    expect(fn?.().Foo.#x).toEqual(1);
    expect(fn?.().Foo.#x.toString).toEqual(1..toString);
    expect(fn?.().Foo.#x.toString()).toEqual('1');

    expect(fnDeep?.().very.o?.Foo.#x).toEqual(1);
    expect(fnDeep?.().very.o?.Foo.#x.toString).toEqual(1..toString);
    expect(fnDeep?.().very.o?.Foo.#x.toString()).toEqual('1');

    expect(fn?.().Foo.#self.#x).toEqual(1);
    expect(fn?.().Foo.#self.self.#x).toEqual(1);
    expect(fn?.().Foo.#self?.self.#x).toEqual(1);
    expect(fn?.().Foo.#self.self?.self.#x).toEqual(1);
    expect(fn?.().Foo.#self?.self?.self.#x).toEqual(1);

    expect(fn?.().Foo.#self.getSelf().#x).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.().#x).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf().#x).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.().#x).toEqual(1);
    expect(fn?.().Foo.#self.getSelf()?.self.#x).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.()?.self.#x).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf()?.self.#x).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.()?.self.#x).toEqual(1);
  }

  static testNull() {
    const o = null;;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }

    expect(o?.Foo.#x).toEqual(undefined);
    expect(o?.Foo.#x.toString).toEqual(undefined);
    expect(o?.Foo.#x.toString()).toEqual(undefined);

    expect(deep?.very.o?.Foo.#x).toEqual(undefined);
    expect(deep?.very.o?.Foo.#x.toString).toEqual(undefined);
    expect(deep?.very.o?.Foo.#x.toString()).toEqual(undefined);

    expect(o?.Foo.#self.#x).toEqual(undefined);
    expect(o?.Foo.#self.self.#x).toEqual(undefined);
    expect(o?.Foo.#self?.self.#x).toEqual(undefined);
    expect(o?.Foo.#self.self?.self.#x).toEqual(undefined);
    expect(o?.Foo.#self?.self?.self.#x).toEqual(undefined);

    expect(o?.Foo.#self.getSelf().#x).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.().#x).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf().#x).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.().#x).toEqual(undefined);
    expect(o?.Foo.#self.getSelf()?.self.#x).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.()?.self.#x).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf()?.self.#x).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.()?.self.#x).toEqual(undefined);

    expect(fn?.().Foo.#x).toEqual(undefined);
    expect(fn?.().Foo.#x.toString).toEqual(undefined);
    expect(fn?.().Foo.#x.toString()).toEqual(undefined);

    expect(fnDeep?.().very.o?.Foo.#x).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo.#x.toString).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo.#x.toString()).toEqual(undefined);

    expect(fn?.().Foo.#self.#x).toEqual(undefined);
    expect(fn?.().Foo.#self.self.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.self.#x).toEqual(undefined);
    expect(fn?.().Foo.#self.self?.self.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.self?.self.#x).toEqual(undefined);

    expect(fn?.().Foo.#self.getSelf().#x).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.().#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf().#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.().#x).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf()?.self.#x).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.()?.self.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf()?.self.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.()?.self.#x).toEqual(undefined);
  }
}

Foo.test();
Foo.testNull();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _assertClassBrand$_,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _assertClassBrand$_2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _assertClassBrand$_3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _assertClassBrand$_4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._).toEqual(1);
    expect(
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString,
    ).toEqual((1).toString);
    expect(
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o.Foo, _x)._,
    ).toEqual(1);
    expect(
      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o2.Foo, _x)._.toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o3.Foo, _x)._.toString(),
    ).toEqual('1');
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._, _x)._,
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.self, _x)._,
    ).toEqual(1);
    expect(
      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref.self, _x)._,
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref2.self, _x)._,
    ).toEqual(1);
    expect(
      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self2.self, _x)._,
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.getSelf(), _x)._,
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
        _ref3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref3.call(_assertClassBrand$_), _x)._,
    ).toEqual(1);
    expect(
      (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref4.getSelf(), _x)._,
    ).toEqual(1);
    expect(
      (_ref5$getSelf = (_ref5 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
        null || _ref5$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref5$getSelf.call(_ref5), _x)._,
    ).toEqual(1);
    expect(
      (_ref6 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref6.self, _x)._,
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_2)) === null || _call === void 0
        ? void 0
        : _assertClassBrand(Foo, _call.self, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf.self, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf2.self, _x)._,
    ).toEqual(1);
    expect(fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._).toEqual(
      1,
    );
    expect(
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString,
    ).toEqual((1).toString);
    expect(
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o.Foo, _x)._,
    ).toEqual(1);
    expect(
      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o2.Foo, _x)._.toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o3.Foo, _x)._.toString(),
    ).toEqual('1');
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._, _x)._,
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.self, _x)._,
    ).toEqual(1);
    expect(
      (_ref7 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref7.self, _x)._,
    ).toEqual(1);
    expect(
      (_ref8 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref8.self, _x)._,
    ).toEqual(1);
    expect(
      (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self3.self, _x)._,
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.getSelf(), _x)._,
    ).toEqual(1);
    expect(
      (_ref9 =
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
        _ref9 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref9.call(_assertClassBrand$_3), _x)._,
    ).toEqual(1);
    expect(
      (_ref10 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref10 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref10.getSelf(), _x)._,
    ).toEqual(1);
    expect(
      (_ref11$getSelf = (_ref11 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.getSelf) === null || _ref11$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref11$getSelf.call(_ref11), _x)._,
    ).toEqual(1);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref12.self, _x)._,
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_4)) === null || _call2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call2.self, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf3.self, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf4.self, _x)._,
    ).toEqual(1);
  }
  static testNull() {
    var _deep$very$o4,
      _deep$very$o5,
      _deep$very$o6,
      _ref13,
      _ref14,
      _self4,
      _assertClassBrand$_5,
      _ref15,
      _ref16,
      _ref17,
      _ref17$getSelf,
      _ref18,
      _assertClassBrand$_6,
      _call3,
      _getSelf5,
      _getSelf6,
      _fnDeep$very$o4,
      _fnDeep$very$o5,
      _fnDeep$very$o6,
      _ref19,
      _ref20,
      _self5,
      _assertClassBrand$_7,
      _ref21,
      _ref22,
      _ref23,
      _ref23$getSelf,
      _ref24,
      _assertClassBrand$_8,
      _call4,
      _getSelf7,
      _getSelf8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._).toEqual(
      undefined,
    );
    expect(
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString,
    ).toEqual(undefined);
    expect(
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o4.Foo, _x)._,
    ).toEqual(undefined);
    expect(
      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o5.Foo, _x)._.toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o6.Foo, _x)._.toString(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._, _x)._,
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_ref13 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref13 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref13.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_ref14 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref14 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref14.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_self4 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self4.self, _x)._,
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.getSelf(), _x)._,
    ).toEqual(undefined);
    expect(
      (_ref15 =
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
        _ref15 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref15.call(_assertClassBrand$_5), _x)._,
    ).toEqual(undefined);
    expect(
      (_ref16 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref16 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref16.getSelf(), _x)._,
    ).toEqual(undefined);
    expect(
      (_ref17$getSelf = (_ref17 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
        null || _ref17$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref17$getSelf.call(_ref17), _x)._,
    ).toEqual(undefined);
    expect(
      (_ref18 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref18 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref18.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_6)) === null || _call3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call3.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf5.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf6.self, _x)._,
    ).toEqual(undefined);
    expect(fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._).toEqual(
      undefined,
    );
    expect(
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString,
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o4.Foo, _x)._,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o5.Foo, _x)._.toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o6.Foo, _x)._.toString(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._, _x)._,
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_ref19 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref19 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref19.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_ref20 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref20 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref20.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self5.self, _x)._,
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.getSelf(), _x)._,
    ).toEqual(undefined);
    expect(
      (_ref21 =
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
        _ref21 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref21.call(_assertClassBrand$_7), _x)._,
    ).toEqual(undefined);
    expect(
      (_ref22 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref22 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref22.getSelf(), _x)._,
    ).toEqual(undefined);
    expect(
      (_ref23$getSelf = (_ref23 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.getSelf) === null || _ref23$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref23$getSelf.call(_ref23), _x)._,
    ).toEqual(undefined);
    expect(
      (_ref24 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref24 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref24.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_8)) === null || _call4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call4.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf7.self, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf8.self, _x)._,
    ).toEqual(undefined);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();
Foo.testNull();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _classPrivateFieldLoo,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _classPrivateFieldLoo2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _classPrivateFieldLoo3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _classPrivateFieldLoo4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x],
    ).toEqual(1);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o.Foo, _x)[_x],
    ).toEqual(1);
    expect(
      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _x)[_x],
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _x)[
            _x
          ],
    ).toEqual(1);
    expect(
      (_ref =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref2.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_self2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self2.self, _x)[_x],
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),
            _x,
          )[_x],
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
        null || _ref3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _x)[_x],
    ).toEqual(1);
    expect(
      (_ref4 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref4.getSelf(), _x)[_x],
    ).toEqual(1);
    expect(
      (_ref5$getSelf = (_ref5 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
        ?.getSelf) === null || _ref5$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _x)[_x],
    ).toEqual(1);
    expect(
      (_ref6 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref6.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo2)) === null || _call === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf2.self, _x)[_x],
    ).toEqual(1);
    expect(
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _x)[_x],
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _x)[_x],
    ).toEqual(1);
    expect(
      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _x)[_x],
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _x)[
            _x
          ],
    ).toEqual(1);
    expect(
      (_ref7 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref7.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_ref8 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref8.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_self3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self3.self, _x)[_x],
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
            _x,
          )[_x],
    ).toEqual(1);
    expect(
      (_ref9 =
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
              .getSelf) === null || _ref9 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _x)[_x],
    ).toEqual(1);
    expect(
      (_ref10 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref10.getSelf(), _x)[_x],
    ).toEqual(1);
    expect(
      (_ref11$getSelf = (_ref11 =
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
        ?.getSelf) === null || _ref11$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _x)[_x],
    ).toEqual(1);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref12 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref12.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call2.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf3.self, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf4.self, _x)[_x],
    ).toEqual(1);
  }
  static testNull() {
    var _deep$very$o4,
      _deep$very$o5,
      _deep$very$o6,
      _ref13,
      _ref14,
      _self4,
      _classPrivateFieldLoo5,
      _ref15,
      _ref16,
      _ref17,
      _ref17$getSelf,
      _ref18,
      _classPrivateFieldLoo6,
      _call3,
      _getSelf5,
      _getSelf6,
      _fnDeep$very$o4,
      _fnDeep$very$o5,
      _fnDeep$very$o6,
      _ref19,
      _ref20,
      _self5,
      _classPrivateFieldLoo7,
      _ref21,
      _ref22,
      _ref23,
      _ref23$getSelf,
      _ref24,
      _classPrivateFieldLoo8,
      _call4,
      _getSelf7,
      _getSelf8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x],
    ).toEqual(undefined);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString,
    ).toEqual(undefined);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o4.Foo, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o5.Foo, _x)[_x].toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o6.Foo, _x)[_x].toString(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _x)[_x],
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _x)[
            _x
          ],
    ).toEqual(undefined);
    expect(
      (_ref13 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref13 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref13.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref14 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref14 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref14.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self4 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self4.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),
            _x,
          )[_x],
    ).toEqual(undefined);
    expect(
      (_ref15 =
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
        null || _ref15 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref15.call(_classPrivateFieldLoo5), _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref16 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref16 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref16.getSelf(), _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref17$getSelf = (_ref17 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
        ?.getSelf) === null || _ref17$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref17$getSelf.call(_ref17), _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref18 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null ||
        _ref18 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref18.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo6)) === null || _call3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call3.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf5.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf6.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _x)[_x],
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString,
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o4.Foo, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o5.Foo, _x)[_x].toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o6.Foo, _x)[_x].toString(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _x)[_x],
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _x)[
            _x
          ],
    ).toEqual(undefined);
    expect(
      (_ref19 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref19 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref19.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref20 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref20 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref20.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self5 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self5.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
            _x,
          )[_x],
    ).toEqual(undefined);
    expect(
      (_ref21 =
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
              .getSelf) === null || _ref21 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref21.call(_classPrivateFieldLoo7), _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref22 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref22 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref22.getSelf(), _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref23$getSelf = (_ref23 =
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
        ?.getSelf) === null || _ref23$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref23$getSelf.call(_ref23), _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref24 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref24 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref24.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo8)) === null || _call4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call4.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf7.self, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf8.self, _x)[_x],
    ).toEqual(undefined);
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();
Foo.testNull();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain before property with transform (input)',
    source: `class Foo {
  static #x = 1;
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    o?.Foo.#x;
    o?.Foo.#x.toString;
    o?.Foo.#x.toString();

    deep?.very.o?.Foo.#x;
    deep?.very.o?.Foo.#x.toString;
    deep?.very.o?.Foo.#x.toString();

    o?.Foo.#self.#x;
    o?.Foo.#self.self.#x;
    o?.Foo.#self?.self.#x;
    o?.Foo.#self.self?.self.#x;
    o?.Foo.#self?.self?.self.#x;

    o?.Foo.#self.getSelf().#x;
    o?.Foo.#self.getSelf?.().#x;
    o?.Foo.#self?.getSelf().#x;
    o?.Foo.#self?.getSelf?.().#x;
    o?.Foo.#self.getSelf()?.self.#x;
    o?.Foo.#self.getSelf?.()?.self.#x;
    o?.Foo.#self?.getSelf()?.self.#x;
    o?.Foo.#self?.getSelf?.()?.self.#x;

    fn?.().Foo.#x;
    fn?.().Foo.#x.toString;
    fn?.().Foo.#x.toString();

    fnDeep?.().very.o?.Foo.#x;
    fnDeep?.().very.o?.Foo.#x.toString;
    fnDeep?.().very.o?.Foo.#x.toString();

    fn?.().Foo.#self.#x;
    fn?.().Foo.#self.self.#x;
    fn?.().Foo.#self?.self.#x;
    fn?.().Foo.#self.self?.self.#x;
    fn?.().Foo.#self?.self?.self.#x;

    fn?.().Foo.#self.getSelf().#x;
    fn?.().Foo.#self.getSelf?.().#x;
    fn?.().Foo.#self?.getSelf().#x;
    fn?.().Foo.#self?.getSelf?.().#x;
    fn?.().Foo.#self.getSelf()?.self.#x;
    fn?.().Foo.#self.getSelf?.()?.self.#x;
    fn?.().Foo.#self?.getSelf()?.self.#x;
    fn?.().Foo.#self?.getSelf?.()?.self.#x;
  }
}

Foo.test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _assertClassBrand$_,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _assertClassBrand$_2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _assertClassBrand$_3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _assertClassBrand$_4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._;
    o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString;
    o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o.Foo, _x)._;
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o2.Foo, _x)._.toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o3.Foo, _x)._.toString();
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._, _x)._;
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.self, _x)._;
    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref.self, _x)._;
    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
      null || _ref2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref2.self, _x)._;
    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
      ?.self) === null || _self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self2.self, _x)._;
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.getSelf(), _x)._;
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
    _ref3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref3.call(_assertClassBrand$_), _x)._;
    (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref4.getSelf(), _x)._;
    (_ref5$getSelf = (_ref5 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
      null || _ref5$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref5$getSelf.call(_ref5), _x)._;
    (_ref6 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
      null || _ref6 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref6.self, _x)._;
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_2)) === null || _call === void 0
      ? void 0
      : _assertClassBrand(Foo, _call.self, _x)._;
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf.self, _x)._;
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf2.self, _x)._;
    fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._;
    fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString;
    fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o.Foo, _x)._;
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o2.Foo, _x)._.toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o3.Foo, _x)._.toString();
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._, _x)._;
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.self, _x)._;
    (_ref7 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref7 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref7.self, _x)._;
    (_ref8 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
      null || _ref8 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref8.self, _x)._;
    (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.self) === null || _self3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self3.self, _x)._;
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.getSelf(), _x)._;
    (_ref9 =
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
    _ref9 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref9.call(_assertClassBrand$_3), _x)._;
    (_ref10 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref10 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref10.getSelf(), _x)._;
    (_ref11$getSelf = (_ref11 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.getSelf) === null || _ref11$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref11$getSelf.call(_ref11), _x)._;
    (_ref12 =
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref12.self, _x)._;
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_4)) === null || _call2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _call2.self, _x)._;
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf3.self, _x)._;
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf4.self, _x)._;
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _classPrivateFieldLoo,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _classPrivateFieldLoo2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _classPrivateFieldLoo3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _classPrivateFieldLoo4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x];
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString;
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o.Foo, _x)[_x];
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _x)[_x].toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _x)[_x].toString();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _x)[_x];
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _x)[_x];
    (_ref =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref.self, _x)[_x];
    (_ref2 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref2.self, _x)[_x];
    (_self2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.self) === null || _self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self2.self, _x)[_x];
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(), _x)[
          _x
        ];
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
      null || _ref3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _x)[_x];
    (_ref4 =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref4.getSelf(), _x)[_x];
    (_ref5$getSelf = (_ref5 =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
      ?.getSelf) === null || _ref5$getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _x)[_x];
    (_ref6 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref6.self, _x)[_x];
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo2)) === null || _call === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call.self, _x)[_x];
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf.self, _x)[_x];
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf2.self, _x)[_x];
    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _x)[_x];
    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString;
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _x)[_x];
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _x)[_x].toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _x)[_x].toString();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _x)[_x];
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _x)[
          _x
        ];
    (_ref7 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref7.self, _x)[_x];
    (_ref8 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref8.self, _x)[_x];
    (_self3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self) === null || _self3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self3.self, _x)[_x];
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(
          _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
          _x,
        )[_x];
    (_ref9 =
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
            .getSelf) === null || _ref9 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _x)[_x];
    (_ref10 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref10.getSelf(), _x)[_x];
    (_ref11$getSelf = (_ref11 =
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
      ?.getSelf) === null || _ref11$getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _x)[_x];
    (_ref12 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
    _ref12 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref12.self, _x)[_x];
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call2.self, _x)[_x];
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf3.self, _x)[_x];
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf4.self, _x)[_x];
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain delete property with transform (exec)',
    source: `class Foo {
  static #x = 1;
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(() => delete Foo?.#self.unicorn).toThrow(TypeError);
    expect(() => delete deep?.very.o?.Foo.#self.unicorn).toThrow(TypeError);

    expect(() => delete o?.Foo.#self.unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self.self.unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self?.self.unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self.self?.self.unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self?.self?.self.unicorn).toThrow(TypeError);

    expect(() => delete o?.Foo.#self.getSelf().unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self.getSelf?.().unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self?.getSelf().unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self?.getSelf?.().unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self.getSelf()?.self.unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self.getSelf?.()?.self.unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self?.getSelf()?.self.unicorn).toThrow(TypeError);
    expect(() => delete o?.Foo.#self?.getSelf?.()?.self.unicorn).toThrow(TypeError);

    expect(() => delete fn?.().Foo.#self.unicorn).toThrow(TypeError);
    expect(() => delete fnDeep?.().very.o?.Foo.#self.unicorn).toThrow(TypeError);

    expect(() => delete fn?.().Foo.#self.unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self.self.unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self?.self.unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self.self?.self.unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self?.self?.self.unicorn).toThrow(TypeError);

    expect(() => delete fn?.().Foo.#self.getSelf().unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self.getSelf?.().unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self?.getSelf().unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self?.getSelf?.().unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self.getSelf()?.self.unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self.getSelf?.()?.self.unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self?.getSelf()?.self.unicorn).toThrow(TypeError);
    expect(() => delete fn?.().Foo.#self?.getSelf?.()?.self.unicorn).toThrow(TypeError);


  }

  static testNull() {
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }

    expect(delete deep?.very.o?.Foo.#self.unicorn).toBe(true);

    expect(delete o?.Foo.#self.unicorn).toBe(true);
    expect(delete o?.Foo.#self.self.unicorn).toBe(true);
    expect(delete o?.Foo.#self?.self.unicorn).toBe(true);
    expect(delete o?.Foo.#self.self?.self.unicorn).toBe(true);
    expect(delete o?.Foo.#self?.self?.self.unicorn).toBe(true);

    expect(delete o?.Foo.#self.getSelf().unicorn).toBe(true);
    expect(delete o?.Foo.#self.getSelf?.().unicorn).toBe(true);
    expect(delete o?.Foo.#self?.getSelf().unicorn).toBe(true);
    expect(delete o?.Foo.#self?.getSelf?.().unicorn).toBe(true);
    expect(delete o?.Foo.#self.getSelf()?.self.unicorn).toBe(true);
    expect(delete o?.Foo.#self.getSelf?.()?.self.unicorn).toBe(true);
    expect(delete o?.Foo.#self?.getSelf()?.self.unicorn).toBe(true);
    expect(delete o?.Foo.#self?.getSelf?.()?.self.unicorn).toBe(true);

    expect(delete fn?.().Foo.#self.unicorn).toBe(true);
    expect(delete fnDeep?.().very.o?.Foo.#self.unicorn).toBe(true);

    expect(delete fn?.().Foo.#self.unicorn).toBe(true);
    expect(delete fn?.().Foo.#self.self.unicorn).toBe(true);
    expect(delete fn?.().Foo.#self?.self.unicorn).toBe(true);
    expect(delete fn?.().Foo.#self.self?.self.unicorn).toBe(true);
    expect(delete fn?.().Foo.#self?.self?.self.unicorn).toBe(true);

    expect(delete fn?.().Foo.#self.getSelf().unicorn).toBe(true);
    expect(delete fn?.().Foo.#self.getSelf?.().unicorn).toBe(true);
    expect(delete fn?.().Foo.#self?.getSelf().unicorn).toBe(true);
    expect(delete fn?.().Foo.#self?.getSelf?.().unicorn).toBe(true);
    expect(delete fn?.().Foo.#self.getSelf()?.self.unicorn).toBe(true);
    expect(delete fn?.().Foo.#self.getSelf?.()?.self.unicorn).toBe(true);
    expect(delete fn?.().Foo.#self?.getSelf()?.self.unicorn).toBe(true);
    expect(delete fn?.().Foo.#self?.getSelf?.()?.self.unicorn).toBe(true);
  }
}

Object.defineProperty(Foo, "unicorn", { configurable: false });
Foo.test();
Foo.testNull();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(() => (Foo === null || Foo === void 0 ? true : delete _self._.unicorn)).toThrow(
      TypeError,
    );
    expect(() => {
      var _deep$very$o;
      return (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
        ? true
        : delete _assertClassBrand(Foo, _deep$very$o.Foo, _self)._.unicorn;
    }).toThrow(TypeError);
    expect(() =>
      o === null || o === void 0 ? true : delete _assertClassBrand(Foo, o.Foo, _self)._.unicorn,
    ).toThrow(TypeError);
    expect(() =>
      o === null || o === void 0
        ? true
        : delete _assertClassBrand(Foo, o.Foo, _self)._.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self
          .unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)
          ?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self
          ?.self.unicorn,
    ).toThrow(TypeError);
    expect(() =>
      o === null || o === void 0
        ? true
        : delete _assertClassBrand(Foo, o.Foo, _self)._.getSelf().unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _assertClassBrand$_;
      return delete (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_).unicorn;
    }).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
        )?.getSelf().unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
        )?.getSelf?.().unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _assertClassBrand$_2;
      return delete (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_2)?.self.unicorn;
    }).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
        )?.getSelf()?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
        )?.getSelf?.()?.self.unicorn,
    ).toThrow(TypeError);
    expect(() =>
      fn === null || fn === void 0
        ? true
        : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _fnDeep$very$o;
      return (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
        ? true
        : delete _assertClassBrand(Foo, _fnDeep$very$o.Foo, _self)._.unicorn;
    }).toThrow(TypeError);
    expect(() =>
      fn === null || fn === void 0
        ? true
        : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn,
    ).toThrow(TypeError);
    expect(() =>
      fn === null || fn === void 0
        ? true
        : delete _assertClassBrand(Foo, fn().Foo, _self)._.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
          ?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
          ?.self?.self.unicorn,
    ).toThrow(TypeError);
    expect(() =>
      fn === null || fn === void 0
        ? true
        : delete _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _assertClassBrand$_3;
      return delete (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_3).unicorn;
    }).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
        )?.getSelf().unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
        )?.getSelf?.().unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _assertClassBrand$_4;
      return delete (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_4)?.self.unicorn;
    }).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
        )?.getSelf()?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
        )?.getSelf?.()?.self.unicorn,
    ).toThrow(TypeError);
  }
  static testNull() {
    var _deep$very$o2,
      _assertClassBrand$_5,
      _assertClassBrand$_6,
      _fnDeep$very$o2,
      _assertClassBrand$_7,
      _assertClassBrand$_8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
        ? true
        : delete _assertClassBrand(Foo, _deep$very$o2.Foo, _self)._.unicorn,
    ).toBe(true);
    expect(
      o === null || o === void 0 ? true : delete _assertClassBrand(Foo, o.Foo, _self)._.unicorn,
    ).toBe(true);
    expect(
      o === null || o === void 0
        ? true
        : delete _assertClassBrand(Foo, o.Foo, _self)._.self.unicorn,
    ).toBe(true);
    expect(
      delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self
        .unicorn,
    ).toBe(true);
    expect(
      delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)
        ?.self.unicorn,
    ).toBe(true);
    expect(
      delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self
        ?.self.unicorn,
    ).toBe(true);
    expect(
      o === null || o === void 0
        ? true
        : delete _assertClassBrand(Foo, o.Foo, _self)._.getSelf().unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_5).unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf().unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.().unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_6)?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()?.self.unicorn,
    ).toBe(true);
    expect(
      fn === null || fn === void 0
        ? true
        : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn,
    ).toBe(true);
    expect(
      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
        ? true
        : delete _assertClassBrand(Foo, _fnDeep$very$o2.Foo, _self)._.unicorn,
    ).toBe(true);
    expect(
      fn === null || fn === void 0
        ? true
        : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn,
    ).toBe(true);
    expect(
      fn === null || fn === void 0
        ? true
        : delete _assertClassBrand(Foo, fn().Foo, _self)._.self.unicorn,
    ).toBe(true);
    expect(
      delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self?.self.unicorn,
    ).toBe(true);
    expect(
      fn === null || fn === void 0
        ? true
        : delete _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_7).unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf().unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.().unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_8)?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()?.self.unicorn,
    ).toBe(true);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Object.defineProperty(Foo, 'unicorn', { configurable: false });
Foo.test();
Foo.testNull();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(() =>
      Foo === null || Foo === void 0
        ? true
        : delete _classPrivateFieldLooseBase(Foo, _self)[_self].unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _deep$very$o;
      return (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
        ? true
        : delete _classPrivateFieldLooseBase(_deep$very$o.Foo, _self)[_self].unicorn;
    }).toThrow(TypeError);
    expect(() =>
      o === null || o === void 0
        ? true
        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].unicorn,
    ).toThrow(TypeError);
    expect(() =>
      o === null || o === void 0
        ? true
        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0
            ? void 0
            : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
        )?.self?.self.unicorn,
    ).toThrow(TypeError);
    expect(() =>
      o === null || o === void 0
        ? true
        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf().unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _classPrivateFieldLoo;
      return delete (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo).unicorn;
    }).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
        )?.getSelf().unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
        )?.getSelf?.().unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0
            ? void 0
            : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _classPrivateFieldLoo2;
      return delete (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo2)?.self.unicorn;
    }).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
        )?.getSelf()?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
        )?.getSelf?.()?.self.unicorn,
    ).toThrow(TypeError);
    expect(() =>
      fn === null || fn === void 0
        ? true
        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _fnDeep$very$o;
      return (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
        ? true
        : delete _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _self)[_self].unicorn;
    }).toThrow(TypeError);
    expect(() =>
      fn === null || fn === void 0
        ? true
        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn,
    ).toThrow(TypeError);
    expect(() =>
      fn === null || fn === void 0
        ? true
        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
        )?.self?.self.unicorn,
    ).toThrow(TypeError);
    expect(() =>
      fn === null || fn === void 0
        ? true
        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _classPrivateFieldLoo3;
      return delete (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo3).unicorn;
    }).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
        )?.getSelf().unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
        )?.getSelf?.().unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
        )?.self.unicorn,
    ).toThrow(TypeError);
    expect(() => {
      var _classPrivateFieldLoo4;
      return delete (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo4)?.self.unicorn;
    }).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
        )?.getSelf()?.self.unicorn,
    ).toThrow(TypeError);
    expect(
      () =>
        delete (
          fn === null || fn === void 0
            ? void 0
            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
        )?.getSelf?.()?.self.unicorn,
    ).toThrow(TypeError);
  }
  static testNull() {
    var _deep$very$o2,
      _classPrivateFieldLoo5,
      _classPrivateFieldLoo6,
      _fnDeep$very$o2,
      _classPrivateFieldLoo7,
      _classPrivateFieldLoo8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
        ? true
        : delete _classPrivateFieldLooseBase(_deep$very$o2.Foo, _self)[_self].unicorn,
    ).toBe(true);
    expect(
      o === null || o === void 0
        ? true
        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].unicorn,
    ).toBe(true);
    expect(
      o === null || o === void 0
        ? true
        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self?.self.unicorn,
    ).toBe(true);
    expect(
      o === null || o === void 0
        ? true
        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf().unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo5).unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf().unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.().unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo6)?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()?.self.unicorn,
    ).toBe(true);
    expect(
      fn === null || fn === void 0
        ? true
        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn,
    ).toBe(true);
    expect(
      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
        ? true
        : delete _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _self)[_self].unicorn,
    ).toBe(true);
    expect(
      fn === null || fn === void 0
        ? true
        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn,
    ).toBe(true);
    expect(
      fn === null || fn === void 0
        ? true
        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self?.self.unicorn,
    ).toBe(true);
    expect(
      fn === null || fn === void 0
        ? true
        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo7).unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf().unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.().unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
      )?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo8)?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()?.self.unicorn,
    ).toBe(true);
    expect(
      delete (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()?.self.unicorn,
    ).toBe(true);
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Object.defineProperty(Foo, 'unicorn', { configurable: false });
Foo.test();
Foo.testNull();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain delete property with transform (input)',
    source: `class Foo {
  static #x = 1;
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    delete Foo?.#self.unicorn;
    delete deep?.very.o?.Foo.#self.unicorn;

    delete o?.Foo.#self.unicorn;
    delete o?.Foo.#self.self.unicorn;
    delete o?.Foo.#self?.self.unicorn;
    delete o?.Foo.#self.self?.self.unicorn;
    delete o?.Foo.#self?.self?.self.unicorn;

    delete o?.Foo.#self.getSelf().unicorn;
    delete o?.Foo.#self.getSelf?.().unicorn;
    delete o?.Foo.#self?.getSelf().unicorn;
    delete o?.Foo.#self?.getSelf?.().unicorn;
    delete o?.Foo.#self.getSelf()?.self.unicorn;
    delete o?.Foo.#self.getSelf?.()?.self.unicorn;
    delete o?.Foo.#self?.getSelf()?.self.unicorn;
    delete o?.Foo.#self?.getSelf?.()?.self.unicorn;

    delete fn?.().Foo.#self.unicorn;
    delete fnDeep?.().very.o?.Foo.#self.unicorn;

    delete fn?.().Foo.#self.unicorn;
    delete fn?.().Foo.#self.self.unicorn;
    delete fn?.().Foo.#self?.self.unicorn;
    delete fn?.().Foo.#self.self?.self.unicorn;
    delete fn?.().Foo.#self?.self?.self.unicorn;

    delete fn?.().Foo.#self.getSelf().unicorn;
    delete fn?.().Foo.#self.getSelf?.().unicorn;
    delete fn?.().Foo.#self?.getSelf().unicorn;
    delete fn?.().Foo.#self?.getSelf?.().unicorn;
    delete fn?.().Foo.#self.getSelf()?.self.unicorn;
    delete fn?.().Foo.#self.getSelf?.()?.self.unicorn;
    delete fn?.().Foo.#self?.getSelf()?.self.unicorn;
    delete fn?.().Foo.#self?.getSelf?.()?.self.unicorn;

  }
}

Foo.test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _assertClassBrand$_,
      _assertClassBrand$_2,
      _fnDeep$very$o,
      _assertClassBrand$_3,
      _assertClassBrand$_4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    Foo === null || Foo === void 0 ? true : delete _self._.unicorn;
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? true
      : delete _assertClassBrand(Foo, _deep$very$o.Foo, _self)._.unicorn;
    o === null || o === void 0 ? true : delete _assertClassBrand(Foo, o.Foo, _self)._.unicorn;
    o === null || o === void 0 ? true : delete _assertClassBrand(Foo, o.Foo, _self)._.self.unicorn;
    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self
      .unicorn;
    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)?.self
      .unicorn;
    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self
      ?.self.unicorn;
    o === null || o === void 0
      ? true
      : delete _assertClassBrand(Foo, o.Foo, _self)._.getSelf().unicorn;
    delete (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_).unicorn;
    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf()
      .unicorn;
    delete (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.().unicorn;
    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf())
      ?.self.unicorn;
    delete (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_2)?.self.unicorn;
    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf()
      ?.self.unicorn;
    delete (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()?.self.unicorn;
    fn === null || fn === void 0 ? true : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn;
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? true
      : delete _assertClassBrand(Foo, _fnDeep$very$o.Foo, _self)._.unicorn;
    fn === null || fn === void 0 ? true : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn;
    fn === null || fn === void 0
      ? true
      : delete _assertClassBrand(Foo, fn().Foo, _self)._.self.unicorn;
    delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)?.self
      .unicorn;
    delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self)
      ?.self.unicorn;
    delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)?.self
      ?.self.unicorn;
    fn === null || fn === void 0
      ? true
      : delete _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().unicorn;
    delete (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_3).unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf().unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.().unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
    )?.self.unicorn;
    delete (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_4)?.self.unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()?.self.unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()?.self.unicorn;
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _classPrivateFieldLoo,
      _classPrivateFieldLoo2,
      _fnDeep$very$o,
      _classPrivateFieldLoo3,
      _classPrivateFieldLoo4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    Foo === null || Foo === void 0
      ? true
      : delete _classPrivateFieldLooseBase(Foo, _self)[_self].unicorn;
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? true
      : delete _classPrivateFieldLooseBase(_deep$very$o.Foo, _self)[_self].unicorn;
    o === null || o === void 0
      ? true
      : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].unicorn;
    o === null || o === void 0
      ? true
      : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].self.unicorn;
    delete (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
      ?.self.unicorn;
    delete (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
    )?.self.unicorn;
    delete (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
      ?.self?.self.unicorn;
    o === null || o === void 0
      ? true
      : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf().unicorn;
    delete (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo).unicorn;
    delete (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf().unicorn;
    delete (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.().unicorn;
    delete (
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
    )?.self.unicorn;
    delete (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo2)?.self.unicorn;
    delete (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()?.self.unicorn;
    delete (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()?.self.unicorn;
    fn === null || fn === void 0
      ? true
      : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn;
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? true
      : delete _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _self)[_self].unicorn;
    fn === null || fn === void 0
      ? true
      : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn;
    fn === null || fn === void 0
      ? true
      : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self.unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self.unicorn;
    delete (
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
    )?.self.unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self?.self.unicorn;
    fn === null || fn === void 0
      ? true
      : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().unicorn;
    delete (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo3).unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf().unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.().unicorn;
    delete (
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
    )?.self.unicorn;
    delete (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo4)?.self.unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()?.self.unicorn;
    delete (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()?.self.unicorn;
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain in function param with transform (exec)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    function f(o, r = o?.Foo.#m()) {
      return r;
    }

    function g(o, r = o?.Foo.#self.getSelf().#m()) {
      return r;
    }

    function h(fnDeep, r = fnDeep?.().very.o?.Foo?.#m()) {
      return r;
    }

    function i(fn, r = fn?.().Foo.#self?.getSelf()?.self.#m()) {
      return r;
    }

    function j(fn, r = (fn().Foo.#self.getSelf().self.#m)?.()) {
      return r;
    }

    expect(f(o)).toBe(1);
    expect(g(o)).toBe(1);
    expect(h(fnDeep)).toBe(1);
    expect(i(fn)).toBe(1);
    expect(j(fn)).toBe(1);
  }
}

Foo.test();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo$self$getSelf,
      _fnDeep$very$o$Foo,
      _getSelf,
      _getSelf$self,
      _fn$Foo$self$getSelf$;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    function f(
      o,
      r = o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo),
    ) {
      return r;
    }
    function g(
      o,
      r = o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
            _m,
          )._.call(_o$Foo$self$getSelf),
    ) {
      return r;
    }
    function h(
      fnDeep,
      r = (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _m)._.call(_fnDeep$very$o$Foo),
    ) {
      return r;
    }
    function i(
      fn,
      r = (_getSelf = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self),
    ) {
      return r;
    }
    function j(
      fn,
      r = _assertClassBrand(
        Foo,
        (_fn$Foo$self$getSelf$ = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().self),
        _m,
      )._?.call(_fn$Foo$self$getSelf$),
    ) {
      return r;
    }
    expect(f(o)).toBe(1);
    expect(g(o)).toBe(1);
    expect(h(fnDeep)).toBe(1);
    expect(i(fn)).toBe(1);
    expect(j(fn)).toBe(1);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _fnDeep$very$o$Foo, _getSelf;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    function f(
      o,
      r = o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m](),
    ) {
      return r;
    }
    function g(
      o,
      r = o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),
            _m,
          )[_m](),
    ) {
      return r;
    }
    function h(
      fnDeep,
      r = (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _m)[_m](),
    ) {
      return r;
    }
    function i(
      fn,
      r = (_getSelf = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m](),
    ) {
      return r;
    }
    function j(
      fn,
      r = _classPrivateFieldLooseBase(
        _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().self,
        _m,
      )[_m]?.(),
    ) {
      return r;
    }
    expect(f(o)).toBe(1);
    expect(g(o)).toBe(1);
    expect(h(fnDeep)).toBe(1);
    expect(i(fn)).toBe(1);
    expect(j(fn)).toBe(1);
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain in function param with transform (input)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    function f(o, r = o?.Foo.#m()) {
      return r;
    }

    function g(o, r = o?.Foo.#self.getSelf().#m?.()) {
      return r;
    }

    function h(fnDeep, r = fnDeep?.().very.o?.Foo?.#m()) {
      return r;
    }

    function i(fn, r = fn?.().Foo.#self?.getSelf()?.self.#m()) {
      return r;
    }

    function j(fn, r = (fn().Foo.#self.getSelf().self.#m)?.()) {
      return r;
    }

    f(o);
    g(o);
    h(fnDeep);
    i(fn);
    j(fn);
  }
}

Foo.test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo$self$getSelf,
      _fnDeep$very$o$Foo,
      _getSelf,
      _getSelf$self,
      _fn$Foo$self$getSelf$;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    function f(
      o,
      r = o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo),
    ) {
      return r;
    }
    function g(
      o,
      r = o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
            _m,
          )._?.call(_o$Foo$self$getSelf),
    ) {
      return r;
    }
    function h(
      fnDeep,
      r = (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _m)._.call(_fnDeep$very$o$Foo),
    ) {
      return r;
    }
    function i(
      fn,
      r = (_getSelf = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self),
    ) {
      return r;
    }
    function j(
      fn,
      r = _assertClassBrand(
        Foo,
        (_fn$Foo$self$getSelf$ = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().self),
        _m,
      )._?.call(_fn$Foo$self$getSelf$),
    ) {
      return r;
    }
    f(o);
    g(o);
    h(fnDeep);
    i(fn);
    j(fn);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _fnDeep$very$o$Foo, _getSelf;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    function f(
      o,
      r = o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m](),
    ) {
      return r;
    }
    function g(
      o,
      r = o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),
            _m,
          )[_m]?.(),
    ) {
      return r;
    }
    function h(
      fnDeep,
      r = (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _m)[_m](),
    ) {
      return r;
    }
    function i(
      fn,
      r = (_getSelf = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m](),
    ) {
      return r;
    }
    function j(
      fn,
      r = _classPrivateFieldLooseBase(
        _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().self,
        _m,
      )[_m]?.(),
    ) {
      return r;
    }
    f(o);
    g(o);
    h(fnDeep);
    i(fn);
    j(fn);
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain member optional call spread arguments (exec)',
    source: `class Foo {
  #m;
  init() {
    this.#m = (...args) => args;
  }
  static test() {
    const f = new Foo();
    f.init();
    return f.#m?.(...arguments);
  }

  static testNull() {
    const f = new Foo();
    return f.#m?.(...arguments);
  }
}

expect(Foo.test(1, 2)).toEqual([1, 2]);
expect(Foo.testNull(1, 2)).toBe(undefined);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _m = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _m, void 0);
  }
  init() {
    _classPrivateFieldSet(_m, this, (...args) => args);
  }
  static test() {
    const f = new Foo();
    f.init();
    return _classPrivateFieldGet(_m, f)?.call(f, ...arguments);
  }
  static testNull() {
    const f = new Foo();
    return _classPrivateFieldGet(_m, f)?.call(f, ...arguments);
  }
}
expect(Foo.test(1, 2)).toEqual([1, 2]);
expect(Foo.testNull(1, 2)).toBe(undefined);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
class Foo {
  constructor() {
    Object.defineProperty(this, _m, {
      writable: true,
      value: void 0,
    });
  }
  init() {
    _classPrivateFieldLooseBase(this, _m)[_m] = (...args) => args;
  }
  static test() {
    const f = new Foo();
    f.init();
    return _classPrivateFieldLooseBase(f, _m)[_m]?.(...arguments);
  }
  static testNull() {
    const f = new Foo();
    return _classPrivateFieldLooseBase(f, _m)[_m]?.(...arguments);
  }
}
expect(Foo.test(1, 2)).toEqual([1, 2]);
expect(Foo.testNull(1, 2)).toBe(undefined);`,
      },
    ],
  },
  {
    title: 'private loose — optional chain member optional call spread arguments (input)',
    source: `class Foo {
  #m;
  init() {
    this.#m = (...args) => args;
  }
  static test() {
    const f = new Foo();
    f.init();
    return f.#m?.(...arguments);
  }

  static testNull() {
    const f = new Foo();
    return f.#m?.(...arguments);
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _m = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _m, void 0);
  }
  init() {
    _classPrivateFieldSet(_m, this, (...args) => args);
  }
  static test() {
    const f = new Foo();
    f.init();
    return _classPrivateFieldGet(_m, f)?.call(f, ...arguments);
  }
  static testNull() {
    const f = new Foo();
    return _classPrivateFieldGet(_m, f)?.call(f, ...arguments);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
class Foo {
  constructor() {
    Object.defineProperty(this, _m, {
      writable: true,
      value: void 0,
    });
  }
  init() {
    _classPrivateFieldLooseBase(this, _m)[_m] = (...args) => args;
  }
  static test() {
    const f = new Foo();
    f.init();
    return _classPrivateFieldLooseBase(f, _m)[_m]?.(...arguments);
  }
  static testNull() {
    const f = new Foo();
    return _classPrivateFieldLooseBase(f, _m)[_m]?.(...arguments);
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — optional chain member optional call with transform (exec)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    expect(Foo.#m?.()).toEqual(1);
    expect(Foo.#m?.().toString).toEqual(1..toString);
    expect(Foo.#m?.().toString()).toEqual('1');

    expect(o?.Foo.#m?.()).toEqual(1);
    expect(o?.Foo.#m?.().toString).toEqual(1..toString);
    expect(o?.Foo.#m?.().toString()).toEqual('1');

    expect(deep?.very.o?.Foo.#m?.()).toEqual(1);
    expect(deep?.very.o?.Foo.#m?.().toString).toEqual(1..toString);
    expect(deep?.very.o?.Foo.#m?.().toString()).toEqual('1');

    expect(o?.Foo.#self.#m?.()).toEqual(1);
    expect(o?.Foo.#self.self.#m?.()).toEqual(1);
    expect(o?.Foo.#self?.self.#m?.()).toEqual(1);
    expect(o?.Foo.#self.self?.self.#m?.()).toEqual(1);
    expect(o?.Foo.#self?.self?.self.#m?.()).toEqual(1);

    expect(o?.Foo.#self.getSelf().#m?.()).toEqual(1);
    expect(o?.Foo.#self.getSelf?.().#m?.()).toEqual(1);
    expect(o?.Foo.#self?.getSelf().#m?.()).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.().#m?.()).toEqual(1);
    expect(o?.Foo.#self.getSelf()?.self.#m?.()).toEqual(1);
    expect(o?.Foo.#self.getSelf?.()?.self.#m?.()).toEqual(1);
    expect(o?.Foo.#self?.getSelf()?.self.#m?.()).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.()?.self.#m?.()).toEqual(1);

    expect(fn?.().Foo.#m?.()).toEqual(1);
    expect(fn?.().Foo.#m?.().toString).toEqual(1..toString);
    expect(fn?.().Foo.#m?.().toString()).toEqual('1');

    expect(fnDeep?.().very.o?.Foo.#m?.()).toEqual(1);
    expect(fnDeep?.().very.o?.Foo.#m?.().toString).toEqual(1..toString);
    expect(fnDeep?.().very.o?.Foo.#m?.().toString()).toEqual('1');

    expect(fn?.().Foo.#self.#m?.()).toEqual(1);
    expect(fn?.().Foo.#self.self.#m?.()).toEqual(1);
    expect(fn?.().Foo.#self?.self.#m?.()).toEqual(1);
    expect(fn?.().Foo.#self.self?.self.#m?.()).toEqual(1);
    expect(fn?.().Foo.#self?.self?.self.#m?.()).toEqual(1);

    expect(fn?.().Foo.#self.getSelf().#m?.()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.().#m?.()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf().#m?.()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.().#m?.()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf()?.self.#m?.()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.()?.self.#m?.()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf()?.self.#m?.()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.()?.self.#m?.()).toEqual(1);
  }

  static testNull() {
    const o = null;;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }

    expect(o?.Foo.#m?.()).toEqual(undefined);
    expect(o?.Foo.#m?.().toString).toEqual(undefined);
    expect(o?.Foo.#m?.().toString()).toEqual(undefined);

    expect(deep?.very.o?.Foo.#m?.()).toEqual(undefined);
    expect(deep?.very.o?.Foo.#m?.().toString).toEqual(undefined);
    expect(deep?.very.o?.Foo.#m?.().toString()).toEqual(undefined);

    expect(o?.Foo.#self.#m?.()).toEqual(undefined);
    expect(o?.Foo.#self.self.#m?.()).toEqual(undefined);
    expect(o?.Foo.#self?.self.#m?.()).toEqual(undefined);
    expect(o?.Foo.#self.self?.self.#m?.()).toEqual(undefined);
    expect(o?.Foo.#self?.self?.self.#m?.()).toEqual(undefined);

    expect(o?.Foo.#self.getSelf().#m?.()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.().#m?.()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf().#m?.()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.().#m?.()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf()?.self.#m?.()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.()?.self.#m?.()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf()?.self.#m?.()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.()?.self.#m?.()).toEqual(undefined);

    expect(fn?.().Foo.#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#m?.().toString).toEqual(undefined);
    expect(fn?.().Foo.#m?.().toString()).toEqual(undefined);

    expect(fnDeep?.().very.o?.Foo.#m?.()).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo.#m?.().toString).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo.#m?.().toString()).toEqual(undefined);

    expect(fn?.().Foo.#self.#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self.self.#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self?.self.#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self.self?.self.#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self?.self?.self.#m?.()).toEqual(undefined);

    expect(fn?.().Foo.#self.getSelf().#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.().#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf().#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.().#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf()?.self.#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.()?.self.#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf()?.self.#m?.()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.()?.self.#m?.()).toEqual(undefined);
  }
}

Foo.test();
Foo.testNull();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o,
      _deep$very$o$Foo,
      _deep$very$o2,
      _deep$very$o2$Foo,
      _deep$very$o3,
      _deep$very$o3$Foo,
      _o$Foo$self,
      _o$Foo$self$self,
      _ref,
      _ref$self,
      _ref2,
      _ref2$self,
      _self2,
      _self2$self,
      _o$Foo$self$getSelf,
      _assertClassBrand$_,
      _ref3,
      _ref3$call,
      _ref4,
      _ref4$getSelf,
      _ref5,
      _ref5$getSelf,
      _ref5$getSelf$call,
      _ref6,
      _ref6$self,
      _assertClassBrand$_2,
      _call,
      _call$self,
      _getSelf,
      _getSelf$self,
      _getSelf2,
      _getSelf2$self,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o2,
      _fnDeep$very$o2$Foo,
      _fnDeep$very$o3,
      _fnDeep$very$o3$Foo,
      _fn$Foo$self,
      _fn$Foo$self$self,
      _ref7,
      _ref7$self,
      _ref8,
      _ref8$self,
      _self3,
      _self3$self,
      _fn$Foo$self$getSelf,
      _assertClassBrand$_3,
      _ref9,
      _ref9$call,
      _ref10,
      _ref10$getSelf,
      _ref11,
      _ref11$getSelf,
      _ref11$getSelf$call,
      _ref12,
      _ref12$self,
      _assertClassBrand$_4,
      _call2,
      _call2$self,
      _getSelf3,
      _getSelf3$self,
      _getSelf4,
      _getSelf4$self;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(_m._?.call(Foo)).toEqual(1);
    expect(_m._?.call(Foo).toString).toEqual((1).toString);
    expect(_m._?.call(Foo).toString()).toEqual('1');
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._?.call(_o$Foo),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._?.call(_o$Foo2).toString,
    ).toEqual((1).toString);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)
            ._?.call(_o$Foo3)
            .toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._?.call(
            _deep$very$o$Foo,
          ),
    ).toEqual(1);
    expect(
      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._?.call(
            _deep$very$o2$Foo,
          ).toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)
            ._?.call(_deep$very$o3$Foo)
            .toString(),
    ).toEqual('1');
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._),
            _m,
          )._?.call(_o$Foo$self),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),
            _m,
          )._?.call(_o$Foo$self$self),
    ).toEqual(1);
    expect(
      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._?.call(_ref$self),
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._?.call(_ref2$self),
    ).toEqual(1);
    expect(
      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._?.call(_self2$self),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
            _m,
          )._?.call(_o$Foo$self$getSelf),
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
        _ref3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._?.call(
            _ref3$call,
          ),
    ).toEqual(1);
    expect(
      (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._?.call(_ref4$getSelf),
    ).toEqual(1);
    expect(
      (_ref5$getSelf = (_ref5 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
        null || _ref5$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._?.call(
            _ref5$getSelf$call,
          ),
    ).toEqual(1);
    expect(
      (_ref6 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref6 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._?.call(_ref6$self),
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_2)) === null || _call === void 0
        ? void 0
        : _assertClassBrand(Foo, (_call$self = _call.self), _m)._?.call(_call$self),
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._?.call(_getSelf$self),
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._?.call(_getSelf2$self),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._?.call(_fn$Foo),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._?.call(_fn$Foo2).toString,
    ).toEqual((1).toString);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)
            ._?.call(_fn$Foo3)
            .toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._?.call(
            _fnDeep$very$o$Foo,
          ),
    ).toEqual(1);
    expect(
      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._?.call(
            _fnDeep$very$o2$Foo,
          ).toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)
            ._?.call(_fnDeep$very$o3$Foo)
            .toString(),
    ).toEqual('1');
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),
            _m,
          )._?.call(_fn$Foo$self),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),
            _m,
          )._?.call(_fn$Foo$self$self),
    ).toEqual(1);
    expect(
      (_ref7 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref7 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._?.call(_ref7$self),
    ).toEqual(1);
    expect(
      (_ref8 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref8 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._?.call(_ref8$self),
    ).toEqual(1);
    expect(
      (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._?.call(_self3$self),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),
            _m,
          )._?.call(_fn$Foo$self$getSelf),
    ).toEqual(1);
    expect(
      (_ref9 =
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
        _ref9 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._?.call(
            _ref9$call,
          ),
    ).toEqual(1);
    expect(
      (_ref10 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref10 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._?.call(_ref10$getSelf),
    ).toEqual(1);
    expect(
      (_ref11$getSelf = (_ref11 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.getSelf) === null || _ref11$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._?.call(
            _ref11$getSelf$call,
          ),
    ).toEqual(1);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._?.call(_ref12$self),
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_4)) === null || _call2 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._?.call(_call2$self),
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._?.call(_getSelf3$self),
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._?.call(_getSelf4$self),
    ).toEqual(1);
  }
  static testNull() {
    var _o$Foo4,
      _o$Foo5,
      _o$Foo6,
      _deep$very$o4,
      _deep$very$o4$Foo,
      _deep$very$o5,
      _deep$very$o5$Foo,
      _deep$very$o6,
      _deep$very$o6$Foo,
      _o$Foo$self2,
      _o$Foo$self$self2,
      _ref13,
      _ref13$self,
      _ref14,
      _ref14$self,
      _self4,
      _self4$self,
      _o$Foo$self$getSelf2,
      _assertClassBrand$_5,
      _ref15,
      _ref15$call,
      _ref16,
      _ref16$getSelf,
      _ref17,
      _ref17$getSelf,
      _ref17$getSelf$call,
      _ref18,
      _ref18$self,
      _assertClassBrand$_6,
      _call3,
      _call3$self,
      _getSelf5,
      _getSelf5$self,
      _getSelf6,
      _getSelf6$self,
      _fn$Foo4,
      _fn$Foo5,
      _fn$Foo6,
      _fnDeep$very$o4,
      _fnDeep$very$o4$Foo,
      _fnDeep$very$o5,
      _fnDeep$very$o5$Foo,
      _fnDeep$very$o6,
      _fnDeep$very$o6$Foo,
      _fn$Foo$self2,
      _fn$Foo$self$self2,
      _ref19,
      _ref19$self,
      _ref20,
      _ref20$self,
      _self5,
      _self5$self,
      _fn$Foo$self$getSelf2,
      _assertClassBrand$_7,
      _ref21,
      _ref21$call,
      _ref22,
      _ref22$getSelf,
      _ref23,
      _ref23$getSelf,
      _ref23$getSelf$call,
      _ref24,
      _ref24$self,
      _assertClassBrand$_8,
      _call4,
      _call4$self,
      _getSelf7,
      _getSelf7$self,
      _getSelf8,
      _getSelf8$self;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo4 = o.Foo), _m)._?.call(_o$Foo4),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo5 = o.Foo), _m)._?.call(_o$Foo5).toString,
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo6 = o.Foo), _m)
            ._?.call(_o$Foo6)
            .toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o4$Foo = _deep$very$o4.Foo), _m)._?.call(
            _deep$very$o4$Foo,
          ),
    ).toEqual(undefined);
    expect(
      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o5$Foo = _deep$very$o5.Foo), _m)._?.call(
            _deep$very$o5$Foo,
          ).toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_deep$very$o6$Foo = _deep$very$o6.Foo), _m)
            ._?.call(_deep$very$o6$Foo)
            .toString(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self2 = _assertClassBrand(Foo, o.Foo, _self)._),
            _m,
          )._?.call(_o$Foo$self2),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$self2 = _assertClassBrand(Foo, o.Foo, _self)._.self),
            _m,
          )._?.call(_o$Foo$self$self2),
    ).toEqual(undefined);
    expect(
      (_ref13 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref13 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref13$self = _ref13.self), _m)._?.call(_ref13$self),
    ).toEqual(undefined);
    expect(
      (_ref14 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref14 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref14$self = _ref14.self), _m)._?.call(_ref14$self),
    ).toEqual(undefined);
    expect(
      (_self4 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_self4$self = _self4.self), _m)._?.call(_self4$self),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_o$Foo$self$getSelf2 = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
            _m,
          )._?.call(_o$Foo$self$getSelf2),
    ).toEqual(undefined);
    expect(
      (_ref15 =
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
        _ref15 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref15$call = _ref15.call(_assertClassBrand$_5)), _m)._?.call(
            _ref15$call,
          ),
    ).toEqual(undefined);
    expect(
      (_ref16 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref16 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref16$getSelf = _ref16.getSelf()), _m)._?.call(_ref16$getSelf),
    ).toEqual(undefined);
    expect(
      (_ref17$getSelf = (_ref17 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
        null || _ref17$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref17$getSelf$call = _ref17$getSelf.call(_ref17)), _m)._?.call(
            _ref17$getSelf$call,
          ),
    ).toEqual(undefined);
    expect(
      (_ref18 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref18 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref18$self = _ref18.self), _m)._?.call(_ref18$self),
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_6)) === null || _call3 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_call3$self = _call3.self), _m)._?.call(_call3$self),
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf5$self = _getSelf5.self), _m)._?.call(_getSelf5$self),
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf6$self = _getSelf6.self), _m)._?.call(_getSelf6$self),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo4 = fn().Foo), _m)._?.call(_fn$Foo4),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo5 = fn().Foo), _m)._?.call(_fn$Foo5).toString,
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fn$Foo6 = fn().Foo), _m)
            ._?.call(_fn$Foo6)
            .toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o4$Foo = _fnDeep$very$o4.Foo), _m)._?.call(
            _fnDeep$very$o4$Foo,
          ),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o5$Foo = _fnDeep$very$o5.Foo), _m)._?.call(
            _fnDeep$very$o5$Foo,
          ).toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_fnDeep$very$o6$Foo = _fnDeep$very$o6.Foo), _m)
            ._?.call(_fnDeep$very$o6$Foo)
            .toString(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self2 = _assertClassBrand(Foo, fn().Foo, _self)._),
            _m,
          )._?.call(_fn$Foo$self2),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self$self2 = _assertClassBrand(Foo, fn().Foo, _self)._.self),
            _m,
          )._?.call(_fn$Foo$self$self2),
    ).toEqual(undefined);
    expect(
      (_ref19 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref19 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref19$self = _ref19.self), _m)._?.call(_ref19$self),
    ).toEqual(undefined);
    expect(
      (_ref20 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref20 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref20$self = _ref20.self), _m)._?.call(_ref20$self),
    ).toEqual(undefined);
    expect(
      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self5 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_self5$self = _self5.self), _m)._?.call(_self5$self),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(
            Foo,
            (_fn$Foo$self$getSelf2 = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),
            _m,
          )._?.call(_fn$Foo$self$getSelf2),
    ).toEqual(undefined);
    expect(
      (_ref21 =
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
        _ref21 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref21$call = _ref21.call(_assertClassBrand$_7)), _m)._?.call(
            _ref21$call,
          ),
    ).toEqual(undefined);
    expect(
      (_ref22 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref22 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref22$getSelf = _ref22.getSelf()), _m)._?.call(_ref22$getSelf),
    ).toEqual(undefined);
    expect(
      (_ref23$getSelf = (_ref23 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.getSelf) === null || _ref23$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref23$getSelf$call = _ref23$getSelf.call(_ref23)), _m)._?.call(
            _ref23$getSelf$call,
          ),
    ).toEqual(undefined);
    expect(
      (_ref24 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref24 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_ref24$self = _ref24.self), _m)._?.call(_ref24$self),
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_8)) === null || _call4 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_call4$self = _call4.self), _m)._?.call(_call4$self),
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf7$self = _getSelf7.self), _m)._?.call(_getSelf7$self),
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _assertClassBrand(Foo, (_getSelf8$self = _getSelf8.self), _m)._?.call(_getSelf8$self),
    ).toEqual(undefined);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();
Foo.testNull();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _classPrivateFieldLoo,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _classPrivateFieldLoo2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _classPrivateFieldLoo3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _classPrivateFieldLoo4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(_classPrivateFieldLooseBase(Foo, _m)[_m]?.()).toEqual(1);
    expect(_classPrivateFieldLooseBase(Foo, _m)[_m]?.().toString).toEqual((1).toString);
    expect(_classPrivateFieldLooseBase(Foo, _m)[_m]?.().toString()).toEqual('1');
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString,
    ).toEqual((1).toString);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]?.().toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]?.().toString(),
    ).toEqual('1');
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]?.(),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[
            _m
          ]?.(),
    ).toEqual(1);
    expect(
      (_ref =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref2.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_self2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self2.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),
            _m,
          )[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
        null || _ref3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref4 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref5$getSelf = (_ref5 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
        ?.getSelf) === null || _ref5$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref6 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref6.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo2)) === null || _call === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString,
    ).toEqual((1).toString);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]?.().toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]?.().toString(),
    ).toEqual('1');
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[
            _m
          ]?.(),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[
            _m
          ]?.(),
    ).toEqual(1);
    expect(
      (_ref7 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref7.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref8 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref8.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_self3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self3.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
            _m,
          )[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref9 =
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
              .getSelf) === null || _ref9 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref10 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref11$getSelf = (_ref11 =
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
        ?.getSelf) === null || _ref11$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref12 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref12.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call2.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m]?.(),
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m]?.(),
    ).toEqual(1);
  }
  static testNull() {
    var _deep$very$o4,
      _deep$very$o5,
      _deep$very$o6,
      _ref13,
      _ref14,
      _self4,
      _classPrivateFieldLoo5,
      _ref15,
      _ref16,
      _ref17,
      _ref17$getSelf,
      _ref18,
      _classPrivateFieldLoo6,
      _call3,
      _getSelf5,
      _getSelf6,
      _fnDeep$very$o4,
      _fnDeep$very$o5,
      _fnDeep$very$o6,
      _ref19,
      _ref20,
      _self5,
      _classPrivateFieldLoo7,
      _ref21,
      _ref22,
      _ref23,
      _ref23$getSelf,
      _ref24,
      _classPrivateFieldLoo8,
      _call4,
      _getSelf7,
      _getSelf8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString,
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o4.Foo, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o5.Foo, _m)[_m]?.().toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o6.Foo, _m)[_m]?.().toString(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[
            _m
          ]?.(),
    ).toEqual(undefined);
    expect(
      (_ref13 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref13 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref13.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref14 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref14 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref14.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_self4 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self4.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),
            _m,
          )[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref15 =
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
        null || _ref15 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref15.call(_classPrivateFieldLoo5), _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref16 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref16 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref16.getSelf(), _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref17$getSelf = (_ref17 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
        ?.getSelf) === null || _ref17$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref17$getSelf.call(_ref17), _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref18 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null ||
        _ref18 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref18.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo6)) === null || _call3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call3.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf5.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf6.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString,
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o4.Foo, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o5.Foo, _m)[_m]?.().toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o6.Foo, _m)[_m]?.().toString(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[
            _m
          ]?.(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[
            _m
          ]?.(),
    ).toEqual(undefined);
    expect(
      (_ref19 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref19 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref19.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref20 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref20 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref20.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_self5 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self5.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
            _m,
          )[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref21 =
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
              .getSelf) === null || _ref21 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref21.call(_classPrivateFieldLoo7), _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref22 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref22 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref22.getSelf(), _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref23$getSelf = (_ref23 =
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
        ?.getSelf) === null || _ref23$getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref23$getSelf.call(_ref23), _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_ref24 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref24 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref24.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo8)) === null || _call4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call4.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf7.self, _m)[_m]?.(),
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf8.self, _m)[_m]?.(),
    ).toEqual(undefined);
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();
Foo.testNull();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain member optional call with transform (input)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    Foo.#m?.();
    Foo.#m?.().toString;
    Foo.#m?.().toString();

    o?.Foo.#m?.();
    o?.Foo.#m?.().toString;
    o?.Foo.#m?.().toString();

    deep?.very.o?.Foo.#m?.();
    deep?.very.o?.Foo.#m?.().toString;
    deep?.very.o?.Foo.#m?.().toString();

    o?.Foo.#self.#m?.();
    o?.Foo.#self.self.#m?.();
    o?.Foo.#self?.self.#m?.();
    o?.Foo.#self.self?.self.#m?.();
    o?.Foo.#self?.self?.self.#m?.();

    o?.Foo.#self.getSelf().#m?.();
    o?.Foo.#self.getSelf?.().#m?.();
    o?.Foo.#self?.getSelf().#m?.();
    o?.Foo.#self?.getSelf?.().#m?.();
    o?.Foo.#self.getSelf()?.self.#m?.();
    o?.Foo.#self.getSelf?.()?.self.#m?.();
    o?.Foo.#self?.getSelf()?.self.#m?.();
    o?.Foo.#self?.getSelf?.()?.self.#m?.();

    fn?.().Foo.#m?.();
    fn?.().Foo.#m?.().toString;
    fn?.().Foo.#m?.().toString();

    fnDeep?.().very.o?.Foo.#m?.();
    fnDeep?.().very.o?.Foo.#m?.().toString;
    fnDeep?.().very.o?.Foo.#m?.().toString();

    fn?.().Foo.#self.#m?.();
    fn?.().Foo.#self.self.#m?.();
    fn?.().Foo.#self?.self.#m?.();
    fn?.().Foo.#self.self?.self.#m?.();
    fn?.().Foo.#self?.self?.self.#m?.();

    fn?.().Foo.#self.getSelf().#m?.();
    fn?.().Foo.#self.getSelf?.().#m?.();
    fn?.().Foo.#self?.getSelf().#m?.();
    fn?.().Foo.#self?.getSelf?.().#m?.();
    fn?.().Foo.#self.getSelf()?.self.#m?.();
    fn?.().Foo.#self.getSelf?.()?.self.#m?.();
    fn?.().Foo.#self?.getSelf()?.self.#m?.();
    fn?.().Foo.#self?.getSelf?.()?.self.#m?.();
  }

}

Foo.test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o,
      _deep$very$o$Foo,
      _deep$very$o2,
      _deep$very$o2$Foo,
      _deep$very$o3,
      _deep$very$o3$Foo,
      _o$Foo$self,
      _o$Foo$self$self,
      _ref,
      _ref$self,
      _ref2,
      _ref2$self,
      _self2,
      _self2$self,
      _o$Foo$self$getSelf,
      _assertClassBrand$_,
      _ref3,
      _ref3$call,
      _ref4,
      _ref4$getSelf,
      _ref5,
      _ref5$getSelf,
      _ref5$getSelf$call,
      _ref6,
      _ref6$self,
      _assertClassBrand$_2,
      _call,
      _call$self,
      _getSelf,
      _getSelf$self,
      _getSelf2,
      _getSelf2$self,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o2,
      _fnDeep$very$o2$Foo,
      _fnDeep$very$o3,
      _fnDeep$very$o3$Foo,
      _fn$Foo$self,
      _fn$Foo$self$self,
      _ref7,
      _ref7$self,
      _ref8,
      _ref8$self,
      _self3,
      _self3$self,
      _fn$Foo$self$getSelf,
      _assertClassBrand$_3,
      _ref9,
      _ref9$call,
      _ref10,
      _ref10$getSelf,
      _ref11,
      _ref11$getSelf,
      _ref11$getSelf$call,
      _ref12,
      _ref12$self,
      _assertClassBrand$_4,
      _call2,
      _call2$self,
      _getSelf3,
      _getSelf3$self,
      _getSelf4,
      _getSelf4$self;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    _m._?.call(Foo);
    _m._?.call(Foo).toString;
    _m._?.call(Foo).toString();
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._?.call(_o$Foo);
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._?.call(_o$Foo2).toString;
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)
          ._?.call(_o$Foo3)
          .toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._?.call(_deep$very$o$Foo);
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._?.call(
          _deep$very$o2$Foo,
        ).toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)
          ._?.call(_deep$very$o3$Foo)
          .toString();
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._), _m)._?.call(
          _o$Foo$self,
        );
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),
          _m,
        )._?.call(_o$Foo$self$self);
    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._?.call(_ref$self);
    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
      null || _ref2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._?.call(_ref2$self);
    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
      ?.self) === null || _self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._?.call(_self2$self);
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
          _m,
        )._?.call(_o$Foo$self$getSelf);
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
    _ref3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._?.call(
          _ref3$call,
        );
    (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref4 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._?.call(_ref4$getSelf);
    (_ref5$getSelf = (_ref5 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
      null || _ref5$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._?.call(
          _ref5$getSelf$call,
        );
    (_ref6 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
      null || _ref6 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._?.call(_ref6$self);
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_2)) === null || _call === void 0
      ? void 0
      : _assertClassBrand(Foo, (_call$self = _call.self), _m)._?.call(_call$self);
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._?.call(_getSelf$self);
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._?.call(_getSelf2$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._?.call(_fn$Foo);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._?.call(_fn$Foo2).toString;
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)
          ._?.call(_fn$Foo3)
          .toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._?.call(
          _fnDeep$very$o$Foo,
        );
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._?.call(
          _fnDeep$very$o2$Foo,
        ).toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)
          ._?.call(_fnDeep$very$o3$Foo)
          .toString();
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),
          _m,
        )._?.call(_fn$Foo$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),
          _m,
        )._?.call(_fn$Foo$self$self);
    (_ref7 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref7 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._?.call(_ref7$self);
    (_ref8 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
      null || _ref8 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._?.call(_ref8$self);
    (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.self) === null || _self3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._?.call(_self3$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),
          _m,
        )._?.call(_fn$Foo$self$getSelf);
    (_ref9 =
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
    _ref9 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._?.call(
          _ref9$call,
        );
    (_ref10 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref10 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._?.call(_ref10$getSelf);
    (_ref11$getSelf = (_ref11 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.getSelf) === null || _ref11$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._?.call(
          _ref11$getSelf$call,
        );
    (_ref12 =
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._?.call(_ref12$self);
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_4)) === null || _call2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._?.call(_call2$self);
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._?.call(_getSelf3$self);
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._?.call(_getSelf4$self);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _classPrivateFieldLoo,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _classPrivateFieldLoo2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _classPrivateFieldLoo3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _classPrivateFieldLoo4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    _classPrivateFieldLooseBase(Foo, _m)[_m]?.();
    _classPrivateFieldLooseBase(Foo, _m)[_m]?.().toString;
    _classPrivateFieldLooseBase(Foo, _m)[_m]?.().toString();
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.();
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString;
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m]?.();
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]?.().toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]?.().toString();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]?.();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[
          _m
        ]?.();
    (_ref =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref.self, _m)[_m]?.();
    (_ref2 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref2.self, _m)[_m]?.();
    (_self2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.self) === null || _self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self2.self, _m)[_m]?.();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(), _m)[
          _m
        ]?.();
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
      null || _ref3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m]?.();
    (_ref4 =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m]?.();
    (_ref5$getSelf = (_ref5 =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
      ?.getSelf) === null || _ref5$getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m]?.();
    (_ref6 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref6.self, _m)[_m]?.();
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo2)) === null || _call === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call.self, _m)[_m]?.();
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m]?.();
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m]?.();
    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString;
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m]?.();
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]?.().toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]?.().toString();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[
          _m
        ]?.();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[
          _m
        ]?.();
    (_ref7 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref7.self, _m)[_m]?.();
    (_ref8 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref8.self, _m)[_m]?.();
    (_self3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self) === null || _self3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self3.self, _m)[_m]?.();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(
          _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
          _m,
        )[_m]?.();
    (_ref9 =
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
            .getSelf) === null || _ref9 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m]?.();
    (_ref10 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m]?.();
    (_ref11$getSelf = (_ref11 =
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
      ?.getSelf) === null || _ref11$getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m]?.();
    (_ref12 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
    _ref12 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref12.self, _m)[_m]?.();
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call2.self, _m)[_m]?.();
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m]?.();
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m]?.();
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain optional member call with transform (exec)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    expect(Foo?.#m()).toEqual(1);
    expect(Foo?.#m().toString).toEqual(1..toString);
    expect(Foo?.#m().toString()).toEqual('1');

    expect(o?.Foo?.#m()).toEqual(1);
    expect(o?.Foo?.#m().toString).toEqual(1..toString);
    expect(o?.Foo?.#m().toString()).toEqual('1');

    expect(deep?.very.o?.Foo?.#m()).toEqual(1);
    expect(deep?.very.o?.Foo?.#m().toString).toEqual(1..toString);
    expect(deep?.very.o?.Foo?.#m().toString()).toEqual('1');

    expect(o?.Foo.#self?.#m()).toEqual(1);
    expect(o?.Foo.#self.self?.#m()).toEqual(1);
    expect(o?.Foo.#self?.self?.#m()).toEqual(1);
    expect(o?.Foo.#self.self?.self?.#m()).toEqual(1);
    expect(o?.Foo.#self?.self?.self?.#m()).toEqual(1);

    expect(o?.Foo.#self.getSelf()?.#m()).toEqual(1);
    expect(o?.Foo.#self.getSelf?.()?.#m()).toEqual(1);
    expect(o?.Foo.#self?.getSelf()?.#m()).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.()?.#m()).toEqual(1);
    expect(o?.Foo.#self.getSelf()?.self?.#m()).toEqual(1);
    expect(o?.Foo.#self.getSelf?.()?.self?.#m()).toEqual(1);
    expect(o?.Foo.#self?.getSelf()?.self?.#m()).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.()?.self?.#m()).toEqual(1);

    expect(fn?.().Foo?.#m()).toEqual(1);
    expect(fn?.().Foo?.#m().toString).toEqual(1..toString);
    expect(fn?.().Foo?.#m().toString()).toEqual('1');

    expect(fnDeep?.().very.o?.Foo?.#m()).toEqual(1);
    expect(fnDeep?.().very.o?.Foo?.#m().toString).toEqual(1..toString);
    expect(fnDeep?.().very.o?.Foo?.#m().toString()).toEqual('1');

    expect(fn?.().Foo.#self?.#m()).toEqual(1);
    expect(fn?.().Foo.#self.self?.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.self?.#m()).toEqual(1);
    expect(fn?.().Foo.#self.self?.self?.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.self?.self?.#m()).toEqual(1);

    expect(fn?.().Foo.#self.getSelf()?.#m()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.()?.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf()?.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.()?.#m()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf()?.self?.#m()).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.()?.self?.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf()?.self?.#m()).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.()?.self?.#m()).toEqual(1);
  }

  static testNull() {
    const o = null;;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }

    expect(o?.Foo?.#m()).toEqual(undefined);
    expect(o?.Foo?.#m().toString).toEqual(undefined);
    expect(o?.Foo?.#m().toString()).toEqual(undefined);

    expect(deep?.very.o?.Foo?.#m()).toEqual(undefined);
    expect(deep?.very.o?.Foo?.#m().toString).toEqual(undefined);
    expect(deep?.very.o?.Foo?.#m().toString()).toEqual(undefined);

    expect(o?.Foo.#self?.#m()).toEqual(undefined);
    expect(o?.Foo.#self.self?.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.self?.#m()).toEqual(undefined);
    expect(o?.Foo.#self.self?.self?.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.self?.self?.#m()).toEqual(undefined);

    expect(o?.Foo.#self.getSelf()?.#m()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.()?.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf()?.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.()?.#m()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf()?.self?.#m()).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.()?.self?.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf()?.self?.#m()).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.()?.self?.#m()).toEqual(undefined);

    expect(fn?.().Foo?.#m()).toEqual(undefined);
    expect(fn?.().Foo?.#m().toString).toEqual(undefined);
    expect(fn?.().Foo?.#m().toString()).toEqual(undefined);

    expect(fnDeep?.().very.o?.Foo?.#m()).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo?.#m().toString).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo?.#m().toString()).toEqual(undefined);

    expect(fn?.().Foo.#self?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.self?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.self?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.self?.self?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.self?.self?.#m()).toEqual(undefined);

    expect(fn?.().Foo.#self.getSelf()?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.()?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf()?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.()?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf()?.self?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.()?.self?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf()?.self?.#m()).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.()?.self?.#m()).toEqual(undefined);
  }
}

Foo.test();
Foo.testNull();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o$Foo,
      _deep$very$o$Foo2,
      _deep$very$o$Foo3,
      _ref,
      _ref2,
      _self2,
      _self3,
      _self$self,
      _ref3,
      _assertClassBrand$_,
      _call,
      _getSelf,
      _getSelf2,
      _self4,
      _assertClassBrand$_2,
      _call$self,
      _getSelf$self,
      _getSelf$self2,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o$Foo2,
      _fnDeep$very$o$Foo3,
      _ref4,
      _ref5,
      _self5,
      _self6,
      _self$self2,
      _ref6,
      _assertClassBrand$_3,
      _call2,
      _getSelf3,
      _getSelf4,
      _self7,
      _assertClassBrand$_4,
      _call$self2,
      _getSelf$self3,
      _getSelf$self4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo)).toEqual(1);
    expect(Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString).toEqual((1).toString);
    expect(Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString()).toEqual('1');
    expect(
      (_o$Foo = o?.Foo) === null || _o$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo, _m)._.call(_o$Foo),
    ).toEqual(1);
    expect(
      (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo2, _m)._.call(_o$Foo2).toString,
    ).toEqual((1).toString);
    expect(
      (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo3, _m)._.call(_o$Foo3).toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo, _m)._.call(_deep$very$o$Foo),
    ).toEqual(1);
    expect(
      (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo2, _m)._.call(_deep$very$o$Foo2).toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo3, _m)._.call(_deep$very$o$Foo3).toString(),
    ).toEqual('1');
    expect(
      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref, _m)._.call(_ref),
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref2, _m)._.call(_ref2),
    ).toEqual(1);
    expect(
      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self2, _m)._.call(_self2),
    ).toEqual(1);
    expect(
      (_self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)
        ?.self) === null || _self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self3, _m)._.call(_self3),
    ).toEqual(1);
    expect(
      (_self$self = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self?.self) === null || _self$self === void 0
        ? void 0
        : _assertClassBrand(Foo, _self$self, _m)._.call(_self$self),
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref3, _m)._.call(_ref3),
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_)) === null || _call === void 0
        ? void 0
        : _assertClassBrand(Foo, _call, _m)._.call(_call),
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf, _m)._.call(_getSelf),
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf2, _m)._.call(_getSelf2),
    ).toEqual(1);
    expect(
      (_self4 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()
      )?.self) === null || _self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self4, _m)._.call(_self4),
    ).toEqual(1);
    expect(
      (_call$self = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_2)?.self) === null || _call$self === void 0
        ? void 0
        : _assertClassBrand(Foo, _call$self, _m)._.call(_call$self),
    ).toEqual(1);
    expect(
      (_getSelf$self = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()?.self) === null || _getSelf$self === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self, _m)._.call(_getSelf$self),
    ).toEqual(1);
    expect(
      (_getSelf$self2 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self2, _m)._.call(_getSelf$self2),
    ).toEqual(1);
    expect(
      (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo, _m)._.call(_fn$Foo),
    ).toEqual(1);
    expect(
      (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo2, _m)._.call(_fn$Foo2).toString,
    ).toEqual((1).toString);
    expect(
      (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo3, _m)._.call(_fn$Foo3).toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _m)._.call(_fnDeep$very$o$Foo),
    ).toEqual(1);
    expect(
      (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo2, _m)._.call(_fnDeep$very$o$Foo2).toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo3, _m)._.call(_fnDeep$very$o$Foo3).toString(),
    ).toEqual('1');
    expect(
      (_ref4 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref4, _m)._.call(_ref4),
    ).toEqual(1);
    expect(
      (_ref5 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref5, _m)._.call(_ref5),
    ).toEqual(1);
    expect(
      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self5, _m)._.call(_self5),
    ).toEqual(1);
    expect(
      (_self6 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self
      )?.self) === null || _self6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self6, _m)._.call(_self6),
    ).toEqual(1);
    expect(
      (_self$self2 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.self?.self) === null || _self$self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self$self2, _m)._.call(_self$self2),
    ).toEqual(1);
    expect(
      (_ref6 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref6, _m)._.call(_ref6),
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_3)) === null || _call2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call2, _m)._.call(_call2),
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf3, _m)._.call(_getSelf3),
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf4, _m)._.call(_getSelf4),
    ).toEqual(1);
    expect(
      (_self7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
      )?.self) === null || _self7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self7, _m)._.call(_self7),
    ).toEqual(1);
    expect(
      (_call$self2 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_4)?.self) === null || _call$self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call$self2, _m)._.call(_call$self2),
    ).toEqual(1);
    expect(
      (_getSelf$self3 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()?.self) === null || _getSelf$self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self3, _m)._.call(_getSelf$self3),
    ).toEqual(1);
    expect(
      (_getSelf$self4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self4, _m)._.call(_getSelf$self4),
    ).toEqual(1);
  }
  static testNull() {
    var _o$Foo4,
      _o$Foo5,
      _o$Foo6,
      _deep$very$o$Foo4,
      _deep$very$o$Foo5,
      _deep$very$o$Foo6,
      _ref7,
      _ref8,
      _self8,
      _self9,
      _self$self3,
      _ref9,
      _assertClassBrand$_5,
      _call3,
      _getSelf5,
      _getSelf6,
      _self10,
      _assertClassBrand$_6,
      _call$self3,
      _getSelf$self5,
      _getSelf$self6,
      _fn$Foo4,
      _fn$Foo5,
      _fn$Foo6,
      _fnDeep$very$o$Foo4,
      _fnDeep$very$o$Foo5,
      _fnDeep$very$o$Foo6,
      _ref10,
      _ref11,
      _self11,
      _self12,
      _self$self4,
      _ref12,
      _assertClassBrand$_7,
      _call4,
      _getSelf7,
      _getSelf8,
      _self13,
      _assertClassBrand$_8,
      _call$self4,
      _getSelf$self7,
      _getSelf$self8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      (_o$Foo4 = o?.Foo) === null || _o$Foo4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo4, _m)._.call(_o$Foo4),
    ).toEqual(undefined);
    expect(
      (_o$Foo5 = o?.Foo) === null || _o$Foo5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo5, _m)._.call(_o$Foo5).toString,
    ).toEqual(undefined);
    expect(
      (_o$Foo6 = o?.Foo) === null || _o$Foo6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo6, _m)._.call(_o$Foo6).toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo4 = deep?.very.o?.Foo) === null || _deep$very$o$Foo4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo4, _m)._.call(_deep$very$o$Foo4),
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo5 = deep?.very.o?.Foo) === null || _deep$very$o$Foo5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo5, _m)._.call(_deep$very$o$Foo5).toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo6 = deep?.very.o?.Foo) === null || _deep$very$o$Foo6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo6, _m)._.call(_deep$very$o$Foo6).toString(),
    ).toEqual(undefined);
    expect(
      (_ref7 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref7, _m)._.call(_ref7),
    ).toEqual(undefined);
    expect(
      (_ref8 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref8, _m)._.call(_ref8),
    ).toEqual(undefined);
    expect(
      (_self8 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self8, _m)._.call(_self8),
    ).toEqual(undefined);
    expect(
      (_self9 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)
        ?.self) === null || _self9 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self9, _m)._.call(_self9),
    ).toEqual(undefined);
    expect(
      (_self$self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self?.self) === null || _self$self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self$self3, _m)._.call(_self$self3),
    ).toEqual(undefined);
    expect(
      (_ref9 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref9 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref9, _m)._.call(_ref9),
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_5)) === null || _call3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call3, _m)._.call(_call3),
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf5, _m)._.call(_getSelf5),
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf6, _m)._.call(_getSelf6),
    ).toEqual(undefined);
    expect(
      (_self10 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()
      )?.self) === null || _self10 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self10, _m)._.call(_self10),
    ).toEqual(undefined);
    expect(
      (_call$self3 = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_6)?.self) === null || _call$self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call$self3, _m)._.call(_call$self3),
    ).toEqual(undefined);
    expect(
      (_getSelf$self5 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()?.self) === null || _getSelf$self5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self5, _m)._.call(_getSelf$self5),
    ).toEqual(undefined);
    expect(
      (_getSelf$self6 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()?.self) === null || _getSelf$self6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self6, _m)._.call(_getSelf$self6),
    ).toEqual(undefined);
    expect(
      (_fn$Foo4 = fn?.().Foo) === null || _fn$Foo4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo4, _m)._.call(_fn$Foo4),
    ).toEqual(undefined);
    expect(
      (_fn$Foo5 = fn?.().Foo) === null || _fn$Foo5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo5, _m)._.call(_fn$Foo5).toString,
    ).toEqual(undefined);
    expect(
      (_fn$Foo6 = fn?.().Foo) === null || _fn$Foo6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo6, _m)._.call(_fn$Foo6).toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo4 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo4, _m)._.call(_fnDeep$very$o$Foo4),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo5 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo5, _m)._.call(_fnDeep$very$o$Foo5).toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo6 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo6, _m)._.call(_fnDeep$very$o$Foo6).toString(),
    ).toEqual(undefined);
    expect(
      (_ref10 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref10 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref10, _m)._.call(_ref10),
    ).toEqual(undefined);
    expect(
      (_ref11 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref11 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref11, _m)._.call(_ref11),
    ).toEqual(undefined);
    expect(
      (_self11 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self11 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self11, _m)._.call(_self11),
    ).toEqual(undefined);
    expect(
      (_self12 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self
      )?.self) === null || _self12 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self12, _m)._.call(_self12),
    ).toEqual(undefined);
    expect(
      (_self$self4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.self?.self) === null || _self$self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self$self4, _m)._.call(_self$self4),
    ).toEqual(undefined);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref12, _m)._.call(_ref12),
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_7)) === null || _call4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call4, _m)._.call(_call4),
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf7, _m)._.call(_getSelf7),
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf8, _m)._.call(_getSelf8),
    ).toEqual(undefined);
    expect(
      (_self13 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
      )?.self) === null || _self13 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self13, _m)._.call(_self13),
    ).toEqual(undefined);
    expect(
      (_call$self4 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_8)?.self) === null || _call$self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call$self4, _m)._.call(_call$self4),
    ).toEqual(undefined);
    expect(
      (_getSelf$self7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()?.self) === null || _getSelf$self7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self7, _m)._.call(_getSelf$self7),
    ).toEqual(undefined);
    expect(
      (_getSelf$self8 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()?.self) === null || _getSelf$self8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self8, _m)._.call(_getSelf$self8),
    ).toEqual(undefined);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();
Foo.testNull();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o$Foo,
      _deep$very$o$Foo2,
      _deep$very$o$Foo3,
      _ref,
      _ref2,
      _self2,
      _self3,
      _self$self,
      _ref3,
      _classPrivateFieldLoo,
      _call,
      _getSelf,
      _getSelf2,
      _self4,
      _classPrivateFieldLoo2,
      _call$self,
      _getSelf$self,
      _getSelf$self2,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o$Foo2,
      _fnDeep$very$o$Foo3,
      _ref4,
      _ref5,
      _self5,
      _self6,
      _self$self2,
      _ref6,
      _classPrivateFieldLoo3,
      _call2,
      _getSelf3,
      _getSelf4,
      _self7,
      _classPrivateFieldLoo4,
      _call$self2,
      _getSelf$self3,
      _getSelf$self4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(
      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      Foo === null || Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      (_o$Foo = o?.Foo) === null || _o$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo2, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo3, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo2, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo3, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      (_ref =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref, _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref2, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self2, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self3 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
      )?.self) === null || _self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self3, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self$self = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self?.self) === null || _self$self === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self$self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref3, _m)[_m](),
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo)) === null || _call === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf2, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self4 = (
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
      )?.self) === null || _self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self4, _m)[_m](),
    ).toEqual(1);
    expect(
      (_call$self = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo2)?.self) === null || _call$self === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call$self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf$self = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()?.self) === null || _getSelf$self === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf$self2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self2, _m)[_m](),
    ).toEqual(1);
    expect(
      (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo2, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo3, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _m)[_m](),
    ).toEqual(1);
    expect(
      (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo2, _m)[_m]().toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo3, _m)[_m]().toString(),
    ).toEqual('1');
    expect(
      (_ref4 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref4, _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref5 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref5, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self5 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self5, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self6 = (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
      )?.self) === null || _self6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self6, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self$self2 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self?.self) === null || _self$self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self$self2, _m)[_m](),
    ).toEqual(1);
    expect(
      (_ref6 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref6, _m)[_m](),
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo3)) === null || _call2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call2, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf3, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf4, _m)[_m](),
    ).toEqual(1);
    expect(
      (_self7 = (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
      )?.self) === null || _self7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self7, _m)[_m](),
    ).toEqual(1);
    expect(
      (_call$self2 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo4)?.self) === null || _call$self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call$self2, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf$self3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()?.self) === null || _getSelf$self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self3, _m)[_m](),
    ).toEqual(1);
    expect(
      (_getSelf$self4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self4, _m)[_m](),
    ).toEqual(1);
  }
  static testNull() {
    var _o$Foo4,
      _o$Foo5,
      _o$Foo6,
      _deep$very$o$Foo4,
      _deep$very$o$Foo5,
      _deep$very$o$Foo6,
      _ref7,
      _ref8,
      _self8,
      _self9,
      _self$self3,
      _ref9,
      _classPrivateFieldLoo5,
      _call3,
      _getSelf5,
      _getSelf6,
      _self10,
      _classPrivateFieldLoo6,
      _call$self3,
      _getSelf$self5,
      _getSelf$self6,
      _fn$Foo4,
      _fn$Foo5,
      _fn$Foo6,
      _fnDeep$very$o$Foo4,
      _fnDeep$very$o$Foo5,
      _fnDeep$very$o$Foo6,
      _ref10,
      _ref11,
      _self11,
      _self12,
      _self$self4,
      _ref12,
      _classPrivateFieldLoo7,
      _call4,
      _getSelf7,
      _getSelf8,
      _self13,
      _classPrivateFieldLoo8,
      _call$self4,
      _getSelf$self7,
      _getSelf$self8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      (_o$Foo4 = o?.Foo) === null || _o$Foo4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo4, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_o$Foo5 = o?.Foo) === null || _o$Foo5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo5, _m)[_m]().toString,
    ).toEqual(undefined);
    expect(
      (_o$Foo6 = o?.Foo) === null || _o$Foo6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo6, _m)[_m]().toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo4 = deep?.very.o?.Foo) === null || _deep$very$o$Foo4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo4, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo5 = deep?.very.o?.Foo) === null || _deep$very$o$Foo5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo5, _m)[_m]().toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo6 = deep?.very.o?.Foo) === null || _deep$very$o$Foo6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo6, _m)[_m]().toString(),
    ).toEqual(undefined);
    expect(
      (_ref7 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref7, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref8 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref8, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self8 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self8, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self9 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
      )?.self) === null || _self9 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self9, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self$self3 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self?.self) === null || _self$self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self$self3, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref9 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref9 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref9, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo5)) === null || _call3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call3, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf5, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf6, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self10 = (
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
      )?.self) === null || _self10 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self10, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_call$self3 = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo6)?.self) === null || _call$self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call$self3, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf$self5 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()?.self) === null || _getSelf$self5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self5, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf$self6 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()?.self) === null || _getSelf$self6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self6, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_fn$Foo4 = fn?.().Foo) === null || _fn$Foo4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo4, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_fn$Foo5 = fn?.().Foo) === null || _fn$Foo5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo5, _m)[_m]().toString,
    ).toEqual(undefined);
    expect(
      (_fn$Foo6 = fn?.().Foo) === null || _fn$Foo6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo6, _m)[_m]().toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo4 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo4, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo5 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo5, _m)[_m]().toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo6 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo6, _m)[_m]().toString(),
    ).toEqual(undefined);
    expect(
      (_ref10 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref10, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref11 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref11 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref11, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self11 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self11 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self11, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self12 = (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
      )?.self) === null || _self12 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self12, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self$self4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self?.self) === null || _self$self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self$self4, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref12 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref12, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo7)) === null || _call4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call4, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf7, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf8, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_self13 = (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
      )?.self) === null || _self13 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self13, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_call$self4 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo8)?.self) === null || _call$self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call$self4, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf$self7 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()?.self) === null || _getSelf$self7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self7, _m)[_m](),
    ).toEqual(undefined);
    expect(
      (_getSelf$self8 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()?.self) === null || _getSelf$self8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self8, _m)[_m](),
    ).toEqual(undefined);
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();
Foo.testNull();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain optional member call with transform (input)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    Foo?.#m();
    Foo?.#m().toString;
    Foo?.#m().toString();

    o?.Foo?.#m();
    o?.Foo?.#m().toString;
    o?.Foo?.#m().toString();

    deep?.very.o?.Foo?.#m();
    deep?.very.o?.Foo?.#m().toString;
    deep?.very.o?.Foo?.#m().toString();

    o?.Foo.#self?.#m();
    o?.Foo.#self.self?.#m();
    o?.Foo.#self?.self?.#m();
    o?.Foo.#self.self?.self?.#m();
    o?.Foo.#self?.self?.self?.#m();

    o?.Foo.#self.getSelf()?.#m();
    o?.Foo.#self.getSelf?.()?.#m();
    o?.Foo.#self?.getSelf()?.#m();
    o?.Foo.#self?.getSelf?.()?.#m();
    o?.Foo.#self.getSelf()?.self?.#m();
    o?.Foo.#self.getSelf?.()?.self?.#m();
    o?.Foo.#self?.getSelf()?.self?.#m();
    o?.Foo.#self?.getSelf?.()?.self?.#m();

    fn?.().Foo?.#m();
    fn?.().Foo?.#m().toString;
    fn?.().Foo?.#m().toString();

    fnDeep?.().very.o?.Foo?.#m();
    fnDeep?.().very.o?.Foo?.#m().toString;
    fnDeep?.().very.o?.Foo?.#m().toString();

    fn?.().Foo.#self?.#m();
    fn?.().Foo.#self.self?.#m();
    fn?.().Foo.#self?.self?.#m();
    fn?.().Foo.#self.self?.self?.#m();
    fn?.().Foo.#self?.self?.self?.#m();

    fn?.().Foo.#self.getSelf()?.#m();
    fn?.().Foo.#self.getSelf?.()?.#m();
    fn?.().Foo.#self?.getSelf()?.#m();
    fn?.().Foo.#self?.getSelf?.()?.#m();
    fn?.().Foo.#self.getSelf()?.self?.#m();
    fn?.().Foo.#self.getSelf?.()?.self?.#m();
    fn?.().Foo.#self?.getSelf()?.self?.#m();
    fn?.().Foo.#self?.getSelf?.()?.self?.#m();
  }
}

Foo.test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o$Foo,
      _deep$very$o$Foo2,
      _deep$very$o$Foo3,
      _ref,
      _ref2,
      _self2,
      _self3,
      _self$self,
      _ref3,
      _assertClassBrand$_,
      _call,
      _getSelf,
      _getSelf2,
      _self4,
      _assertClassBrand$_2,
      _call$self,
      _getSelf$self,
      _getSelf$self2,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o$Foo2,
      _fnDeep$very$o$Foo3,
      _ref4,
      _ref5,
      _self5,
      _self6,
      _self$self2,
      _ref6,
      _assertClassBrand$_3,
      _call2,
      _getSelf3,
      _getSelf4,
      _self7,
      _assertClassBrand$_4,
      _call$self2,
      _getSelf$self3,
      _getSelf$self4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo);
    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString;
    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString();
    (_o$Foo = o?.Foo) === null || _o$Foo === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo, _m)._.call(_o$Foo);
    (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo2, _m)._.call(_o$Foo2).toString;
    (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo3, _m)._.call(_o$Foo3).toString();
    (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o$Foo, _m)._.call(_deep$very$o$Foo);
    (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o$Foo2, _m)._.call(_deep$very$o$Foo2).toString;
    (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o$Foo3, _m)._.call(_deep$very$o$Foo3).toString();
    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref, _m)._.call(_ref);
    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
      null || _ref2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref2, _m)._.call(_ref2);
    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
      ?.self) === null || _self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self2, _m)._.call(_self2);
    (_self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)
      ?.self) === null || _self3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self3, _m)._.call(_self3);
    (_self$self = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
      ?.self?.self) === null || _self$self === void 0
      ? void 0
      : _assertClassBrand(Foo, _self$self, _m)._.call(_self$self);
    (_ref3 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
      null || _ref3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref3, _m)._.call(_ref3);
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_)) === null || _call === void 0
      ? void 0
      : _assertClassBrand(Foo, _call, _m)._.call(_call);
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf, _m)._.call(_getSelf);
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf2, _m)._.call(_getSelf2);
    (_self4 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()
    )?.self) === null || _self4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self4, _m)._.call(_self4);
    (_call$self = (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_2)?.self) === null || _call$self === void 0
      ? void 0
      : _assertClassBrand(Foo, _call$self, _m)._.call(_call$self);
    (_getSelf$self = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf()?.self) === null || _getSelf$self === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf$self, _m)._.call(_getSelf$self);
    (_getSelf$self2 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf$self2, _m)._.call(_getSelf$self2);
    (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo, _m)._.call(_fn$Foo);
    (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo2, _m)._.call(_fn$Foo2).toString;
    (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo3, _m)._.call(_fn$Foo3).toString();
    (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _m)._.call(_fnDeep$very$o$Foo);
    (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o$Foo2, _m)._.call(_fnDeep$very$o$Foo2).toString;
    (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o$Foo3, _m)._.call(_fnDeep$very$o$Foo3).toString();
    (_ref4 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref4, _m)._.call(_ref4);
    (_ref5 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
      null || _ref5 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref5, _m)._.call(_ref5);
    (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.self) === null || _self5 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self5, _m)._.call(_self5);
    (_self6 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self
    )?.self) === null || _self6 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self6, _m)._.call(_self6);
    (_self$self2 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.self?.self) === null || _self$self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self$self2, _m)._.call(_self$self2);
    (_ref6 =
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref6 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref6, _m)._.call(_ref6);
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_3)) === null || _call2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _call2, _m)._.call(_call2);
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf3, _m)._.call(_getSelf3);
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf4, _m)._.call(_getSelf4);
    (_self7 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
    )?.self) === null || _self7 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self7, _m)._.call(_self7);
    (_call$self2 = (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_4)?.self) === null || _call$self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _call$self2, _m)._.call(_call$self2);
    (_getSelf$self3 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()?.self) === null || _getSelf$self3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf$self3, _m)._.call(_getSelf$self3);
    (_getSelf$self4 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf$self4, _m)._.call(_getSelf$self4);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o$Foo,
      _deep$very$o$Foo2,
      _deep$very$o$Foo3,
      _ref,
      _ref2,
      _self2,
      _self3,
      _self$self,
      _ref3,
      _classPrivateFieldLoo,
      _call,
      _getSelf,
      _getSelf2,
      _self4,
      _classPrivateFieldLoo2,
      _call$self,
      _getSelf$self,
      _getSelf$self2,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o$Foo2,
      _fnDeep$very$o$Foo3,
      _ref4,
      _ref5,
      _self5,
      _self6,
      _self$self2,
      _ref6,
      _classPrivateFieldLoo3,
      _call2,
      _getSelf3,
      _getSelf4,
      _self7,
      _classPrivateFieldLoo4,
      _call$self2,
      _getSelf$self3,
      _getSelf$self4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]();
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString;
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString();
    (_o$Foo = o?.Foo) === null || _o$Foo === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_o$Foo, _m)[_m]();
    (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_o$Foo2, _m)[_m]().toString;
    (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_o$Foo3, _m)[_m]().toString();
    (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o$Foo, _m)[_m]();
    (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o$Foo2, _m)[_m]().toString;
    (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o$Foo3, _m)[_m]().toString();
    (_ref =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref, _m)[_m]();
    (_ref2 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref2, _m)[_m]();
    (_self2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.self) === null || _self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self2, _m)[_m]();
    (_self3 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
    )?.self) === null || _self3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self3, _m)[_m]();
    (_self$self = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.self?.self) === null || _self$self === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self$self, _m)[_m]();
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref3, _m)[_m]();
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo)) === null || _call === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call, _m)[_m]();
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf, _m)[_m]();
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf2, _m)[_m]();
    (_self4 = (
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
    )?.self) === null || _self4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self4, _m)[_m]();
    (_call$self = (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo2)?.self) === null || _call$self === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call$self, _m)[_m]();
    (_getSelf$self = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()?.self) === null || _getSelf$self === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf$self, _m)[_m]();
    (_getSelf$self2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf$self2, _m)[_m]();
    (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fn$Foo, _m)[_m]();
    (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fn$Foo2, _m)[_m]().toString;
    (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fn$Foo3, _m)[_m]().toString();
    (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _m)[_m]();
    (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo2, _m)[_m]().toString;
    (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo3, _m)[_m]().toString();
    (_ref4 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref4, _m)[_m]();
    (_ref5 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref5 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref5, _m)[_m]();
    (_self5 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self) === null || _self5 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self5, _m)[_m]();
    (_self6 = (
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
    )?.self) === null || _self6 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self6, _m)[_m]();
    (_self$self2 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self?.self) === null || _self$self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self$self2, _m)[_m]();
    (_ref6 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
    _ref6 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref6, _m)[_m]();
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo3)) === null || _call2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call2, _m)[_m]();
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf3, _m)[_m]();
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf4, _m)[_m]();
    (_self7 = (
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
    )?.self) === null || _self7 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self7, _m)[_m]();
    (_call$self2 = (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo4)?.self) === null || _call$self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call$self2, _m)[_m]();
    (_getSelf$self3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()?.self) === null || _getSelf$self3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf$self3, _m)[_m]();
    (_getSelf$self4 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf$self4, _m)[_m]();
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain optional member call (input)',
    source: `class Foo {
  static #x = 1;
  static #m = function() { return this.#x; };
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    Foo?.#m();
    Foo?.#m().toString;
    Foo?.#m().toString();

    o?.Foo.#m();
    o?.Foo.#m().toString;
    o?.Foo.#m().toString();

    deep?.very.o?.Foo.#m();
    deep?.very.o?.Foo.#m().toString;
    deep?.very.o?.Foo.#m().toString();

    o?.Foo.#self.#m();
    o?.Foo.#self.self.#m();
    o?.Foo.#self?.self.#m();
    o?.Foo.#self.self?.self.#m();
    o?.Foo.#self?.self?.self.#m();

    o?.Foo.#self.getSelf().#m();
    o?.Foo.#self.getSelf?.().#m();
    o?.Foo.#self?.getSelf().#m();
    o?.Foo.#self?.getSelf?.().#m();
    o?.Foo.#self.getSelf()?.self.#m();
    o?.Foo.#self.getSelf?.()?.self.#m();
    o?.Foo.#self?.getSelf()?.self.#m();
    o?.Foo.#self?.getSelf?.()?.self.#m();

    fn?.().Foo.#m();
    fn?.().Foo.#m().toString;
    fn?.().Foo.#m().toString();

    fnDeep?.().very.o?.Foo.#m();
    fnDeep?.().very.o?.Foo.#m().toString;
    fnDeep?.().very.o?.Foo.#m().toString();

    fn?.().Foo.#self.#m();
    fn?.().Foo.#self.self.#m();
    fn?.().Foo.#self?.self.#m();
    fn?.().Foo.#self.self?.self.#m();
    fn?.().Foo.#self?.self?.self.#m();

    fn?.().Foo.#self.getSelf().#m();
    fn?.().Foo.#self.getSelf?.().#m();
    fn?.().Foo.#self?.getSelf().#m();
    fn?.().Foo.#self?.getSelf?.().#m();
    fn?.().Foo.#self.getSelf()?.self.#m();
    fn?.().Foo.#self.getSelf?.()?.self.#m();
    fn?.().Foo.#self?.getSelf()?.self.#m();
    fn?.().Foo.#self?.getSelf?.()?.self.#m();
  }
}

Foo.test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o,
      _deep$very$o$Foo,
      _deep$very$o2,
      _deep$very$o2$Foo,
      _deep$very$o3,
      _deep$very$o3$Foo,
      _o$Foo$self,
      _o$Foo$self$self,
      _ref,
      _ref$self,
      _ref2,
      _ref2$self,
      _self2,
      _self2$self,
      _o$Foo$self$getSelf,
      _assertClassBrand$_,
      _ref3,
      _ref3$call,
      _ref4,
      _ref4$getSelf,
      _ref5,
      _ref5$getSelf,
      _ref5$getSelf$call,
      _ref6,
      _ref6$self,
      _assertClassBrand$_2,
      _call,
      _call$self,
      _getSelf,
      _getSelf$self,
      _getSelf2,
      _getSelf2$self,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o2,
      _fnDeep$very$o2$Foo,
      _fnDeep$very$o3,
      _fnDeep$very$o3$Foo,
      _fn$Foo$self,
      _fn$Foo$self$self,
      _ref7,
      _ref7$self,
      _ref8,
      _ref8$self,
      _self3,
      _self3$self,
      _fn$Foo$self$getSelf,
      _assertClassBrand$_3,
      _ref9,
      _ref9$call,
      _ref10,
      _ref10$getSelf,
      _ref11,
      _ref11$getSelf,
      _ref11$getSelf$call,
      _ref12,
      _ref12$self,
      _assertClassBrand$_4,
      _call2,
      _call2$self,
      _getSelf3,
      _getSelf3$self,
      _getSelf4,
      _getSelf4$self;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo);
    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString;
    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString();
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo);
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.call(_o$Foo2).toString;
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)
          ._.call(_o$Foo3)
          .toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._.call(_deep$very$o$Foo);
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._.call(
          _deep$very$o2$Foo,
        ).toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)
          ._.call(_deep$very$o3$Foo)
          .toString();
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._), _m)._.call(
          _o$Foo$self,
        );
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),
          _m,
        )._.call(_o$Foo$self$self);
    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._.call(_ref$self);
    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
      null || _ref2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._.call(_ref2$self);
    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
      ?.self) === null || _self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._.call(_self2$self);
    o === null || o === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),
          _m,
        )._.call(_o$Foo$self$getSelf);
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||
    _ref3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._.call(
          _ref3$call,
        );
    (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref4 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._.call(_ref4$getSelf);
    (_ref5$getSelf = (_ref5 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===
      null || _ref5$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._.call(
          _ref5$getSelf$call,
        );
    (_ref6 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
      null || _ref6 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._.call(_ref6$self);
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_2)) === null || _call === void 0
      ? void 0
      : _assertClassBrand(Foo, (_call$self = _call.self), _m)._.call(_call$self);
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self);
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._.call(_getSelf2$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._.call(_fn$Foo);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._.call(_fn$Foo2).toString;
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)
          ._.call(_fn$Foo3)
          .toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._.call(
          _fnDeep$very$o$Foo,
        );
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._.call(
          _fnDeep$very$o2$Foo,
        ).toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)
          ._.call(_fnDeep$very$o3$Foo)
          .toString();
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),
          _m,
        )._.call(_fn$Foo$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),
          _m,
        )._.call(_fn$Foo$self$self);
    (_ref7 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref7 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._.call(_ref7$self);
    (_ref8 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
      null || _ref8 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._.call(_ref8$self);
    (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.self) === null || _self3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._.call(_self3$self);
    fn === null || fn === void 0
      ? void 0
      : _assertClassBrand(
          Foo,
          (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),
          _m,
        )._.call(_fn$Foo$self$getSelf);
    (_ref9 =
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||
    _ref9 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._.call(
          _ref9$call,
        );
    (_ref10 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref10 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._.call(_ref10$getSelf);
    (_ref11$getSelf = (_ref11 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.getSelf) === null || _ref11$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._.call(
          _ref11$getSelf$call,
        );
    (_ref12 =
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._.call(_ref12$self);
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_4)) === null || _call2 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._.call(_call2$self);
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._.call(_getSelf3$self);
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._.call(_getSelf4$self);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _deep$very$o,
      _deep$very$o2,
      _deep$very$o3,
      _ref,
      _ref2,
      _self2,
      _classPrivateFieldLoo,
      _ref3,
      _ref4,
      _ref5,
      _ref5$getSelf,
      _ref6,
      _classPrivateFieldLoo2,
      _call,
      _getSelf,
      _getSelf2,
      _fnDeep$very$o,
      _fnDeep$very$o2,
      _fnDeep$very$o3,
      _ref7,
      _ref8,
      _self3,
      _classPrivateFieldLoo3,
      _ref9,
      _ref10,
      _ref11,
      _ref11$getSelf,
      _ref12,
      _classPrivateFieldLoo4,
      _call2,
      _getSelf3,
      _getSelf4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]();
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString;
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString();
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]();
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString;
    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString();
    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m]();
    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]().toString;
    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]().toString();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[
          _m
        ]();
    (_ref =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref.self, _m)[_m]();
    (_ref2 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref2.self, _m)[_m]();
    (_self2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.self) === null || _self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self2.self, _m)[_m]();
    o === null || o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(), _m)[
          _m
        ]();
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===
      null || _ref3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m]();
    (_ref4 =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m]();
    (_ref5$getSelf = (_ref5 =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])
      ?.getSelf) === null || _ref5$getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m]();
    (_ref6 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref6.self, _m)[_m]();
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo2)) === null || _call === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call.self, _m)[_m]();
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m]();
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m]();
    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString;
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString();
    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m]();
    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]().toString;
    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]().toString();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[_m]();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[
          _m
        ]();
    (_ref7 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref7.self, _m)[_m]();
    (_ref8 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref8.self, _m)[_m]();
    (_self3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self) === null || _self3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self3.self, _m)[_m]();
    fn === null || fn === void 0
      ? void 0
      : _classPrivateFieldLooseBase(
          _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),
          _m,
        )[_m]();
    (_ref9 =
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
            .getSelf) === null || _ref9 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m]();
    (_ref10 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m]();
    (_ref11$getSelf = (_ref11 =
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])
      ?.getSelf) === null || _ref11$getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m]();
    (_ref12 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
    _ref12 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref12.self, _m)[_m]();
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call2.self, _m)[_m]();
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m]();
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m]();
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain optional property with transform (exec)',
    source: `class Foo {
  static #x = 1;
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    expect(Foo?.#x).toEqual(1);
    expect(Foo?.#x.toString).toEqual(1..toString);
    expect(Foo?.#x.toString()).toEqual('1');

    expect(o?.Foo?.#x).toEqual(1);
    expect(o?.Foo?.#x.toString).toEqual(1..toString);
    expect(o?.Foo?.#x.toString()).toEqual('1');

    expect(deep?.very.o?.Foo?.#x).toEqual(1);
    expect(deep?.very.o?.Foo?.#x.toString).toEqual(1..toString);
    expect(deep?.very.o?.Foo?.#x.toString()).toEqual('1');

    expect(o?.Foo.#self?.#x).toEqual(1);
    expect(o?.Foo.#self.self?.#x).toEqual(1);
    expect(o?.Foo.#self?.self?.#x).toEqual(1);
    expect(o?.Foo.#self.self?.self?.#x).toEqual(1);
    expect(o?.Foo.#self?.self?.self?.#x).toEqual(1);

    expect(o?.Foo.#self.getSelf()?.#x).toEqual(1);
    expect(o?.Foo.#self.getSelf?.()?.#x).toEqual(1);
    expect(o?.Foo.#self?.getSelf()?.#x).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.()?.#x).toEqual(1);
    expect(o?.Foo.#self.getSelf()?.self?.#x).toEqual(1);
    expect(o?.Foo.#self.getSelf?.()?.self?.#x).toEqual(1);
    expect(o?.Foo.#self?.getSelf()?.self?.#x).toEqual(1);
    expect(o?.Foo.#self?.getSelf?.()?.self?.#x).toEqual(1);

    expect(fn?.().Foo?.#x).toEqual(1);
    expect(fn?.().Foo?.#x.toString).toEqual(1..toString);
    expect(fn?.().Foo?.#x.toString()).toEqual('1');

    expect(fnDeep?.().very.o?.Foo?.#x).toEqual(1);
    expect(fnDeep?.().very.o?.Foo?.#x.toString).toEqual(1..toString);
    expect(fnDeep?.().very.o?.Foo?.#x.toString()).toEqual('1');

    expect(fn?.().Foo.#self?.#x).toEqual(1);
    expect(fn?.().Foo.#self.self?.#x).toEqual(1);
    expect(fn?.().Foo.#self?.self?.#x).toEqual(1);
    expect(fn?.().Foo.#self.self?.self?.#x).toEqual(1);
    expect(fn?.().Foo.#self?.self?.self?.#x).toEqual(1);

    expect(fn?.().Foo.#self.getSelf()?.#x).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.()?.#x).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf()?.#x).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.()?.#x).toEqual(1);
    expect(fn?.().Foo.#self.getSelf()?.self?.#x).toEqual(1);
    expect(fn?.().Foo.#self.getSelf?.()?.self?.#x).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf()?.self?.#x).toEqual(1);
    expect(fn?.().Foo.#self?.getSelf?.()?.self?.#x).toEqual(1);
  }

  static testNull() {
    const o = null;;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }

    expect(o?.Foo?.#x).toEqual(undefined);
    expect(o?.Foo?.#x.toString).toEqual(undefined);
    expect(o?.Foo?.#x.toString()).toEqual(undefined);

    expect(deep?.very.o?.Foo?.#x).toEqual(undefined);
    expect(deep?.very.o?.Foo?.#x.toString).toEqual(undefined);
    expect(deep?.very.o?.Foo?.#x.toString()).toEqual(undefined);

    expect(o?.Foo.#self?.#x).toEqual(undefined);
    expect(o?.Foo.#self.self?.#x).toEqual(undefined);
    expect(o?.Foo.#self?.self?.#x).toEqual(undefined);
    expect(o?.Foo.#self.self?.self?.#x).toEqual(undefined);
    expect(o?.Foo.#self?.self?.self?.#x).toEqual(undefined);

    expect(o?.Foo.#self.getSelf()?.#x).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.()?.#x).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf()?.#x).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.()?.#x).toEqual(undefined);
    expect(o?.Foo.#self.getSelf()?.self?.#x).toEqual(undefined);
    expect(o?.Foo.#self.getSelf?.()?.self?.#x).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf()?.self?.#x).toEqual(undefined);
    expect(o?.Foo.#self?.getSelf?.()?.self?.#x).toEqual(undefined);

    expect(fn?.().Foo?.#x).toEqual(undefined);
    expect(fn?.().Foo?.#x.toString).toEqual(undefined);
    expect(fn?.().Foo?.#x.toString()).toEqual(undefined);

    expect(fnDeep?.().very.o?.Foo?.#x).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo?.#x.toString).toEqual(undefined);
    expect(fnDeep?.().very.o?.Foo?.#x.toString()).toEqual(undefined);

    expect(fn?.().Foo.#self?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self.self?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.self?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self.self?.self?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.self?.self?.#x).toEqual(undefined);

    expect(fn?.().Foo.#self.getSelf()?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.()?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf()?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.()?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf()?.self?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self.getSelf?.()?.self?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf()?.self?.#x).toEqual(undefined);
    expect(fn?.().Foo.#self?.getSelf?.()?.self?.#x).toEqual(undefined);
  }
}

Foo.test();
Foo.testNull();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o$Foo,
      _deep$very$o$Foo2,
      _deep$very$o$Foo3,
      _ref,
      _ref2,
      _self2,
      _self3,
      _self$self,
      _ref3,
      _assertClassBrand$_,
      _call,
      _getSelf,
      _getSelf2,
      _self4,
      _assertClassBrand$_2,
      _call$self,
      _getSelf$self,
      _getSelf$self2,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o$Foo2,
      _fnDeep$very$o$Foo3,
      _ref4,
      _ref5,
      _self5,
      _self6,
      _self$self2,
      _ref6,
      _assertClassBrand$_3,
      _call2,
      _getSelf3,
      _getSelf4,
      _self7,
      _assertClassBrand$_4,
      _call$self2,
      _getSelf$self3,
      _getSelf$self4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(Foo === null || Foo === void 0 ? void 0 : _x._).toEqual(1);
    expect(Foo === null || Foo === void 0 ? void 0 : _x._.toString).toEqual((1).toString);
    expect(Foo === null || Foo === void 0 ? void 0 : _x._.toString()).toEqual('1');
    expect(
      (_o$Foo = o?.Foo) === null || _o$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo, _x)._,
    ).toEqual(1);
    expect(
      (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo2, _x)._.toString,
    ).toEqual((1).toString);
    expect(
      (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo3, _x)._.toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo, _x)._,
    ).toEqual(1);
    expect(
      (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo2, _x)._.toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo3, _x)._.toString(),
    ).toEqual('1');
    expect(
      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref, _x)._,
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref2, _x)._,
    ).toEqual(1);
    expect(
      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self2, _x)._,
    ).toEqual(1);
    expect(
      (_self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)
        ?.self) === null || _self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self3, _x)._,
    ).toEqual(1);
    expect(
      (_self$self = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self?.self) === null || _self$self === void 0
        ? void 0
        : _assertClassBrand(Foo, _self$self, _x)._,
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref3, _x)._,
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_)) === null || _call === void 0
        ? void 0
        : _assertClassBrand(Foo, _call, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf2, _x)._,
    ).toEqual(1);
    expect(
      (_self4 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()
      )?.self) === null || _self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self4, _x)._,
    ).toEqual(1);
    expect(
      (_call$self = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_2)?.self) === null || _call$self === void 0
        ? void 0
        : _assertClassBrand(Foo, _call$self, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf$self = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()?.self) === null || _getSelf$self === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf$self2 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self2, _x)._,
    ).toEqual(1);
    expect(
      (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo, _x)._,
    ).toEqual(1);
    expect(
      (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo2, _x)._.toString,
    ).toEqual((1).toString);
    expect(
      (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo3, _x)._.toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _x)._,
    ).toEqual(1);
    expect(
      (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo2, _x)._.toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo3, _x)._.toString(),
    ).toEqual('1');
    expect(
      (_ref4 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref4, _x)._,
    ).toEqual(1);
    expect(
      (_ref5 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref5, _x)._,
    ).toEqual(1);
    expect(
      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self5, _x)._,
    ).toEqual(1);
    expect(
      (_self6 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self
      )?.self) === null || _self6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self6, _x)._,
    ).toEqual(1);
    expect(
      (_self$self2 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.self?.self) === null || _self$self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self$self2, _x)._,
    ).toEqual(1);
    expect(
      (_ref6 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref6, _x)._,
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_3)) === null || _call2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call2, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf3, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf4, _x)._,
    ).toEqual(1);
    expect(
      (_self7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
      )?.self) === null || _self7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self7, _x)._,
    ).toEqual(1);
    expect(
      (_call$self2 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_4)?.self) === null || _call$self2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call$self2, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf$self3 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()?.self) === null || _getSelf$self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self3, _x)._,
    ).toEqual(1);
    expect(
      (_getSelf$self4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self4, _x)._,
    ).toEqual(1);
  }
  static testNull() {
    var _o$Foo4,
      _o$Foo5,
      _o$Foo6,
      _deep$very$o$Foo4,
      _deep$very$o$Foo5,
      _deep$very$o$Foo6,
      _ref7,
      _ref8,
      _self8,
      _self9,
      _self$self3,
      _ref9,
      _assertClassBrand$_5,
      _call3,
      _getSelf5,
      _getSelf6,
      _self10,
      _assertClassBrand$_6,
      _call$self3,
      _getSelf$self5,
      _getSelf$self6,
      _fn$Foo4,
      _fn$Foo5,
      _fn$Foo6,
      _fnDeep$very$o$Foo4,
      _fnDeep$very$o$Foo5,
      _fnDeep$very$o$Foo6,
      _ref10,
      _ref11,
      _self11,
      _self12,
      _self$self4,
      _ref12,
      _assertClassBrand$_7,
      _call4,
      _getSelf7,
      _getSelf8,
      _self13,
      _assertClassBrand$_8,
      _call$self4,
      _getSelf$self7,
      _getSelf$self8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      (_o$Foo4 = o?.Foo) === null || _o$Foo4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo4, _x)._,
    ).toEqual(undefined);
    expect(
      (_o$Foo5 = o?.Foo) === null || _o$Foo5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo5, _x)._.toString,
    ).toEqual(undefined);
    expect(
      (_o$Foo6 = o?.Foo) === null || _o$Foo6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo6, _x)._.toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo4 = deep?.very.o?.Foo) === null || _deep$very$o$Foo4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo4, _x)._,
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo5 = deep?.very.o?.Foo) === null || _deep$very$o$Foo5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo5, _x)._.toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo6 = deep?.very.o?.Foo) === null || _deep$very$o$Foo6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _deep$very$o$Foo6, _x)._.toString(),
    ).toEqual(undefined);
    expect(
      (_ref7 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
        null || _ref7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref7, _x)._,
    ).toEqual(undefined);
    expect(
      (_ref8 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
        null || _ref8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref8, _x)._,
    ).toEqual(undefined);
    expect(
      (_self8 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self) === null || _self8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self8, _x)._,
    ).toEqual(undefined);
    expect(
      (_self9 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)
        ?.self) === null || _self9 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self9, _x)._,
    ).toEqual(undefined);
    expect(
      (_self$self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
        ?.self?.self) === null || _self$self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self$self3, _x)._,
    ).toEqual(undefined);
    expect(
      (_ref9 =
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
        null || _ref9 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref9, _x)._,
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_5)) === null || _call3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call3, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf5, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf6, _x)._,
    ).toEqual(undefined);
    expect(
      (_self10 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()
      )?.self) === null || _self10 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self10, _x)._,
    ).toEqual(undefined);
    expect(
      (_call$self3 = (
        o === null || o === void 0
          ? void 0
          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_6)?.self) === null || _call$self3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call$self3, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf$self5 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf()?.self) === null || _getSelf$self5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self5, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf$self6 = (
        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
      )?.getSelf?.()?.self) === null || _getSelf$self6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self6, _x)._,
    ).toEqual(undefined);
    expect(
      (_fn$Foo4 = fn?.().Foo) === null || _fn$Foo4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo4, _x)._,
    ).toEqual(undefined);
    expect(
      (_fn$Foo5 = fn?.().Foo) === null || _fn$Foo5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo5, _x)._.toString,
    ).toEqual(undefined);
    expect(
      (_fn$Foo6 = fn?.().Foo) === null || _fn$Foo6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo6, _x)._.toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo4 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo4, _x)._,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo5 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo5 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo5, _x)._.toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo6 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo6 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fnDeep$very$o$Foo6, _x)._.toString(),
    ).toEqual(undefined);
    expect(
      (_ref10 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
        null || _ref10 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref10, _x)._,
    ).toEqual(undefined);
    expect(
      (_ref11 =
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
        null || _ref11 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref11, _x)._,
    ).toEqual(undefined);
    expect(
      (_self11 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
        ?.self) === null || _self11 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self11, _x)._,
    ).toEqual(undefined);
    expect(
      (_self12 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self
      )?.self) === null || _self12 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self12, _x)._,
    ).toEqual(undefined);
    expect(
      (_self$self4 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.self?.self) === null || _self$self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self$self4, _x)._,
    ).toEqual(undefined);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0
        ? void 0
        : _assertClassBrand(Foo, _ref12, _x)._,
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_7)) === null || _call4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call4, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf7, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf8, _x)._,
    ).toEqual(undefined);
    expect(
      (_self13 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
      )?.self) === null || _self13 === void 0
        ? void 0
        : _assertClassBrand(Foo, _self13, _x)._,
    ).toEqual(undefined);
    expect(
      (_call$self4 = (
        fn === null || fn === void 0
          ? void 0
          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
      )?.call(_assertClassBrand$_8)?.self) === null || _call$self4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _call$self4, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf$self7 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf()?.self) === null || _getSelf$self7 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self7, _x)._,
    ).toEqual(undefined);
    expect(
      (_getSelf$self8 = (
        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
      )?.getSelf?.()?.self) === null || _getSelf$self8 === void 0
        ? void 0
        : _assertClassBrand(Foo, _getSelf$self8, _x)._,
    ).toEqual(undefined);
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();
Foo.testNull();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o$Foo,
      _deep$very$o$Foo2,
      _deep$very$o$Foo3,
      _ref,
      _ref2,
      _self2,
      _self3,
      _self$self,
      _ref3,
      _classPrivateFieldLoo,
      _call,
      _getSelf,
      _getSelf2,
      _self4,
      _classPrivateFieldLoo2,
      _call$self,
      _getSelf$self,
      _getSelf$self2,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o$Foo2,
      _fnDeep$very$o$Foo3,
      _ref4,
      _ref5,
      _self5,
      _self6,
      _self$self2,
      _ref6,
      _classPrivateFieldLoo3,
      _call2,
      _getSelf3,
      _getSelf4,
      _self7,
      _classPrivateFieldLoo4,
      _call$self2,
      _getSelf$self3,
      _getSelf$self4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    expect(
      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x],
    ).toEqual(1);
    expect(
      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      (_o$Foo = o?.Foo) === null || _o$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo, _x)[_x],
    ).toEqual(1);
    expect(
      (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo2, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo3, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo, _x)[_x],
    ).toEqual(1);
    expect(
      (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo2, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo3, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      (_ref =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref, _x)[_x],
    ).toEqual(1);
    expect(
      (_ref2 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref2, _x)[_x],
    ).toEqual(1);
    expect(
      (_self2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self2, _x)[_x],
    ).toEqual(1);
    expect(
      (_self3 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
      )?.self) === null || _self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self3, _x)[_x],
    ).toEqual(1);
    expect(
      (_self$self = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self?.self) === null || _self$self === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self$self, _x)[_x],
    ).toEqual(1);
    expect(
      (_ref3 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref3, _x)[_x],
    ).toEqual(1);
    expect(
      (_call = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo)) === null || _call === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf2, _x)[_x],
    ).toEqual(1);
    expect(
      (_self4 = (
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
      )?.self) === null || _self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self4, _x)[_x],
    ).toEqual(1);
    expect(
      (_call$self = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo2)?.self) === null || _call$self === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call$self, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf$self = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()?.self) === null || _getSelf$self === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf$self2 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self2, _x)[_x],
    ).toEqual(1);
    expect(
      (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo, _x)[_x],
    ).toEqual(1);
    expect(
      (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo2, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo3, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _x)[_x],
    ).toEqual(1);
    expect(
      (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo2, _x)[_x].toString,
    ).toEqual((1).toString);
    expect(
      (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo3, _x)[_x].toString(),
    ).toEqual('1');
    expect(
      (_ref4 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref4, _x)[_x],
    ).toEqual(1);
    expect(
      (_ref5 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref5, _x)[_x],
    ).toEqual(1);
    expect(
      (_self5 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self5, _x)[_x],
    ).toEqual(1);
    expect(
      (_self6 = (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
      )?.self) === null || _self6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self6, _x)[_x],
    ).toEqual(1);
    expect(
      (_self$self2 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self?.self) === null || _self$self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self$self2, _x)[_x],
    ).toEqual(1);
    expect(
      (_ref6 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref6, _x)[_x],
    ).toEqual(1);
    expect(
      (_call2 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo3)) === null || _call2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call2, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf3, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf4, _x)[_x],
    ).toEqual(1);
    expect(
      (_self7 = (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
      )?.self) === null || _self7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self7, _x)[_x],
    ).toEqual(1);
    expect(
      (_call$self2 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo4)?.self) === null || _call$self2 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call$self2, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf$self3 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()?.self) === null || _getSelf$self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self3, _x)[_x],
    ).toEqual(1);
    expect(
      (_getSelf$self4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self4, _x)[_x],
    ).toEqual(1);
  }
  static testNull() {
    var _o$Foo4,
      _o$Foo5,
      _o$Foo6,
      _deep$very$o$Foo4,
      _deep$very$o$Foo5,
      _deep$very$o$Foo6,
      _ref7,
      _ref8,
      _self8,
      _self9,
      _self$self3,
      _ref9,
      _classPrivateFieldLoo5,
      _call3,
      _getSelf5,
      _getSelf6,
      _self10,
      _classPrivateFieldLoo6,
      _call$self3,
      _getSelf$self5,
      _getSelf$self6,
      _fn$Foo4,
      _fn$Foo5,
      _fn$Foo6,
      _fnDeep$very$o$Foo4,
      _fnDeep$very$o$Foo5,
      _fnDeep$very$o$Foo6,
      _ref10,
      _ref11,
      _self11,
      _self12,
      _self$self4,
      _ref12,
      _classPrivateFieldLoo7,
      _call4,
      _getSelf7,
      _getSelf8,
      _self13,
      _classPrivateFieldLoo8,
      _call$self4,
      _getSelf$self7,
      _getSelf$self8;
    const o = null;
    const deep = { very: { o } };
    const fn = null;
    function fnDeep() {
      return deep;
    }
    expect(
      (_o$Foo4 = o?.Foo) === null || _o$Foo4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo4, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_o$Foo5 = o?.Foo) === null || _o$Foo5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo5, _x)[_x].toString,
    ).toEqual(undefined);
    expect(
      (_o$Foo6 = o?.Foo) === null || _o$Foo6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_o$Foo6, _x)[_x].toString(),
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo4 = deep?.very.o?.Foo) === null || _deep$very$o$Foo4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo4, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo5 = deep?.very.o?.Foo) === null || _deep$very$o$Foo5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo5, _x)[_x].toString,
    ).toEqual(undefined);
    expect(
      (_deep$very$o$Foo6 = deep?.very.o?.Foo) === null || _deep$very$o$Foo6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_deep$very$o$Foo6, _x)[_x].toString(),
    ).toEqual(undefined);
    expect(
      (_ref7 =
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
        null || _ref7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref7, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref8 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref8, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self8 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self) === null || _self8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self8, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self9 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
      )?.self) === null || _self9 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self9, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self$self3 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.self?.self) === null || _self$self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self$self3, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref9 =
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref9 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref9, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_call3 = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo5)) === null || _call3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call3, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf5 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf5, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf6 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf6, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self10 = (
        o === null || o === void 0
          ? void 0
          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
      )?.self) === null || _self10 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self10, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_call$self3 = (
        o === null || o === void 0
          ? void 0
          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo6)?.self) === null || _call$self3 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call$self3, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf$self5 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf()?.self) === null || _getSelf$self5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self5, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf$self6 = (
        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
      )?.getSelf?.()?.self) === null || _getSelf$self6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self6, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_fn$Foo4 = fn?.().Foo) === null || _fn$Foo4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo4, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_fn$Foo5 = fn?.().Foo) === null || _fn$Foo5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo5, _x)[_x].toString,
    ).toEqual(undefined);
    expect(
      (_fn$Foo6 = fn?.().Foo) === null || _fn$Foo6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fn$Foo6, _x)[_x].toString(),
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo4 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo4, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo5 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo5 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo5, _x)[_x].toString,
    ).toEqual(undefined);
    expect(
      (_fnDeep$very$o$Foo6 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo6 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo6, _x)[_x].toString(),
    ).toEqual(undefined);
    expect(
      (_ref10 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref10, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref11 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref11 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref11, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self11 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self) === null || _self11 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self11, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self12 = (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
      )?.self) === null || _self12 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self12, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self$self4 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.self?.self) === null || _self$self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self$self4, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_ref12 =
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
        _ref12 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_ref12, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_call4 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo7)) === null || _call4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call4, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf7 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()) === null || _getSelf7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf7, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf8 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()) === null || _getSelf8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf8, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_self13 = (
        fn === null || fn === void 0
          ? void 0
          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
      )?.self) === null || _self13 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_self13, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_call$self4 = (
        fn === null || fn === void 0
          ? void 0
          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
      )?.call(_classPrivateFieldLoo8)?.self) === null || _call$self4 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_call$self4, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf$self7 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf()?.self) === null || _getSelf$self7 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self7, _x)[_x],
    ).toEqual(undefined);
    expect(
      (_getSelf$self8 = (
        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
      )?.getSelf?.()?.self) === null || _getSelf$self8 === void 0
        ? void 0
        : _classPrivateFieldLooseBase(_getSelf$self8, _x)[_x],
    ).toEqual(undefined);
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();
Foo.testNull();`,
      },
    ],
  },
  {
    title: 'private loose — optional chain optional property with transform (input)',
    source: `class Foo {
  static #x = 1;
  static #self = Foo;
  static self = Foo;
  static getSelf() { return this }

  static test() {
    const o = { Foo: Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }

    Foo?.#x;
    Foo?.#x.toString;
    Foo?.#x.toString();

    o?.Foo?.#x;
    o?.Foo?.#x.toString;
    o?.Foo?.#x.toString();

    deep?.very.o?.Foo?.#x;
    deep?.very.o?.Foo?.#x.toString;
    deep?.very.o?.Foo?.#x.toString();

    o?.Foo.#self?.#x;
    o?.Foo.#self.self?.#x;
    o?.Foo.#self?.self?.#x;
    o?.Foo.#self.self?.self?.#x;
    o?.Foo.#self?.self?.self?.#x;

    o?.Foo.#self.getSelf()?.#x;
    o?.Foo.#self.getSelf?.()?.#x;
    o?.Foo.#self?.getSelf()?.#x;
    o?.Foo.#self?.getSelf?.()?.#x;
    o?.Foo.#self.getSelf()?.self?.#x;
    o?.Foo.#self.getSelf?.()?.self?.#x;
    o?.Foo.#self?.getSelf()?.self?.#x;
    o?.Foo.#self?.getSelf?.()?.self?.#x;

    fn?.().Foo?.#x;
    fn?.().Foo?.#x.toString;
    fn?.().Foo?.#x.toString();

    fnDeep?.().very.o?.Foo?.#x;
    fnDeep?.().very.o?.Foo?.#x.toString;
    fnDeep?.().very.o?.Foo?.#x.toString();

    fn?.().Foo.#self?.#x;
    fn?.().Foo.#self.self?.#x;
    fn?.().Foo.#self?.self?.#x;
    fn?.().Foo.#self.self?.self?.#x;
    fn?.().Foo.#self?.self?.self?.#x;

    fn?.().Foo.#self.getSelf()?.#x;
    fn?.().Foo.#self.getSelf?.()?.#x;
    fn?.().Foo.#self?.getSelf()?.#x;
    fn?.().Foo.#self?.getSelf?.()?.#x;
    fn?.().Foo.#self.getSelf()?.self?.#x;
    fn?.().Foo.#self.getSelf?.()?.self?.#x;
    fn?.().Foo.#self?.getSelf()?.self?.#x;
    fn?.().Foo.#self?.getSelf?.()?.self?.#x;
  }
}

Foo.test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o$Foo,
      _deep$very$o$Foo2,
      _deep$very$o$Foo3,
      _ref,
      _ref2,
      _self2,
      _self3,
      _self$self,
      _ref3,
      _assertClassBrand$_,
      _call,
      _getSelf,
      _getSelf2,
      _self4,
      _assertClassBrand$_2,
      _call$self,
      _getSelf$self,
      _getSelf$self2,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o$Foo2,
      _fnDeep$very$o$Foo3,
      _ref4,
      _ref5,
      _self5,
      _self6,
      _self$self2,
      _ref6,
      _assertClassBrand$_3,
      _call2,
      _getSelf3,
      _getSelf4,
      _self7,
      _assertClassBrand$_4,
      _call$self2,
      _getSelf$self3,
      _getSelf$self4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    Foo === null || Foo === void 0 ? void 0 : _x._;
    Foo === null || Foo === void 0 ? void 0 : _x._.toString;
    Foo === null || Foo === void 0 ? void 0 : _x._.toString();
    (_o$Foo = o?.Foo) === null || _o$Foo === void 0 ? void 0 : _assertClassBrand(Foo, _o$Foo, _x)._;
    (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo2, _x)._.toString;
    (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo3, _x)._.toString();
    (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o$Foo, _x)._;
    (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o$Foo2, _x)._.toString;
    (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _deep$very$o$Foo3, _x)._.toString();
    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===
      null || _ref === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref, _x)._;
    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===
      null || _ref2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref2, _x)._;
    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
      ?.self) === null || _self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self2, _x)._;
    (_self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)
      ?.self) === null || _self3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self3, _x)._;
    (_self$self = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)
      ?.self?.self) === null || _self$self === void 0
      ? void 0
      : _assertClassBrand(Foo, _self$self, _x)._;
    (_ref3 =
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===
      null || _ref3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref3, _x)._;
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_)) === null || _call === void 0
      ? void 0
      : _assertClassBrand(Foo, _call, _x)._;
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf, _x)._;
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf2, _x)._;
    (_self4 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()
    )?.self) === null || _self4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self4, _x)._;
    (_call$self = (
      o === null || o === void 0
        ? void 0
        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_2)?.self) === null || _call$self === void 0
      ? void 0
      : _assertClassBrand(Foo, _call$self, _x)._;
    (_getSelf$self = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf()?.self) === null || _getSelf$self === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf$self, _x)._;
    (_getSelf$self2 = (
      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._
    )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf$self2, _x)._;
    (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo, _x)._;
    (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo2, _x)._.toString;
    (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo3, _x)._.toString();
    (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _x)._;
    (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o$Foo2, _x)._.toString;
    (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fnDeep$very$o$Foo3, _x)._.toString();
    (_ref4 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===
      null || _ref4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref4, _x)._;
    (_ref5 =
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===
      null || _ref5 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref5, _x)._;
    (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)
      ?.self) === null || _self5 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self5, _x)._;
    (_self6 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self
    )?.self) === null || _self6 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self6, _x)._;
    (_self$self2 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.self?.self) === null || _self$self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self$self2, _x)._;
    (_ref6 =
      fn === null || fn === void 0
        ? void 0
        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref6 === void 0
      ? void 0
      : _assertClassBrand(Foo, _ref6, _x)._;
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_3)) === null || _call2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _call2, _x)._;
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf3, _x)._;
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf4, _x)._;
    (_self7 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()
    )?.self) === null || _self7 === void 0
      ? void 0
      : _assertClassBrand(Foo, _self7, _x)._;
    (_call$self2 = (
      fn === null || fn === void 0
        ? void 0
        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf
    )?.call(_assertClassBrand$_4)?.self) === null || _call$self2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _call$self2, _x)._;
    (_getSelf$self3 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf()?.self) === null || _getSelf$self3 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf$self3, _x)._;
    (_getSelf$self4 = (
      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._
    )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0
      ? void 0
      : _assertClassBrand(Foo, _getSelf$self4, _x)._;
  }
}
_Foo = Foo;
var _x = { _: 1 };
var _self = { _: _Foo };
_defineProperty(Foo, 'self', _Foo);
Foo.test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
class Foo {
  static getSelf() {
    return this;
  }
  static test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _deep$very$o$Foo,
      _deep$very$o$Foo2,
      _deep$very$o$Foo3,
      _ref,
      _ref2,
      _self2,
      _self3,
      _self$self,
      _ref3,
      _classPrivateFieldLoo,
      _call,
      _getSelf,
      _getSelf2,
      _self4,
      _classPrivateFieldLoo2,
      _call$self,
      _getSelf$self,
      _getSelf$self2,
      _fn$Foo,
      _fn$Foo2,
      _fn$Foo3,
      _fnDeep$very$o$Foo,
      _fnDeep$very$o$Foo2,
      _fnDeep$very$o$Foo3,
      _ref4,
      _ref5,
      _self5,
      _self6,
      _self$self2,
      _ref6,
      _classPrivateFieldLoo3,
      _call2,
      _getSelf3,
      _getSelf4,
      _self7,
      _classPrivateFieldLoo4,
      _call$self2,
      _getSelf$self3,
      _getSelf$self4;
    const o = { Foo };
    const deep = { very: { o } };
    function fn() {
      return o;
    }
    function fnDeep() {
      return deep;
    }
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x];
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x].toString;
    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x].toString();
    (_o$Foo = o?.Foo) === null || _o$Foo === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_o$Foo, _x)[_x];
    (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_o$Foo2, _x)[_x].toString;
    (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_o$Foo3, _x)[_x].toString();
    (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o$Foo, _x)[_x];
    (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o$Foo2, _x)[_x].toString;
    (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_deep$very$o$Foo3, _x)[_x].toString();
    (_ref =
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===
      null || _ref === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref, _x)[_x];
    (_ref2 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref2, _x)[_x];
    (_self2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.self) === null || _self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self2, _x)[_x];
    (_self3 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self
    )?.self) === null || _self3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self3, _x)[_x];
    (_self$self = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.self?.self) === null || _self$self === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self$self, _x)[_x];
    (_ref3 =
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref3, _x)[_x];
    (_call = (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo)) === null || _call === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call, _x)[_x];
    (_getSelf = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf, _x)[_x];
    (_getSelf2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf2, _x)[_x];
    (_self4 = (
      o === null || o === void 0
        ? void 0
        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()
    )?.self) === null || _self4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self4, _x)[_x];
    (_call$self = (
      o === null || o === void 0
        ? void 0
        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo2)?.self) === null || _call$self === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call$self, _x)[_x];
    (_getSelf$self = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf()?.self) === null || _getSelf$self === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf$self, _x)[_x];
    (_getSelf$self2 = (
      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]
    )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf$self2, _x)[_x];
    (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fn$Foo, _x)[_x];
    (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fn$Foo2, _x)[_x].toString;
    (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fn$Foo3, _x)[_x].toString();
    (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _x)[_x];
    (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo2, _x)[_x].toString;
    (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo3, _x)[_x].toString();
    (_ref4 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref4, _x)[_x];
    (_ref5 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref5 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref5, _x)[_x];
    (_self5 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self) === null || _self5 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self5, _x)[_x];
    (_self6 = (
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self
    )?.self) === null || _self6 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self6, _x)[_x];
    (_self$self2 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.self?.self) === null || _self$self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self$self2, _x)[_x];
    (_ref6 =
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||
    _ref6 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_ref6, _x)[_x];
    (_call2 = (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo3)) === null || _call2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call2, _x)[_x];
    (_getSelf3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()) === null || _getSelf3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf3, _x)[_x];
    (_getSelf4 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()) === null || _getSelf4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf4, _x)[_x];
    (_self7 = (
      fn === null || fn === void 0
        ? void 0
        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()
    )?.self) === null || _self7 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_self7, _x)[_x];
    (_call$self2 = (
      fn === null || fn === void 0
        ? void 0
        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf
    )?.call(_classPrivateFieldLoo4)?.self) === null || _call$self2 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_call$self2, _x)[_x];
    (_getSelf$self3 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf()?.self) === null || _getSelf$self3 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf$self3, _x)[_x];
    (_getSelf$self4 = (
      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]
    )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0
      ? void 0
      : _classPrivateFieldLooseBase(_getSelf$self4, _x)[_x];
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Object.defineProperty(Foo, _self, {
  writable: true,
  value: _Foo,
});
Foo.self = _Foo;
Foo.test();`,
      },
    ],
  },
  {
    title: 'private loose — parenthesized optional member call with transform (exec)',
    source: `class Foo {
  static #x = 1;

  static self = Foo;
  static #m = function() { return this.#x; };
  static getSelf() { return Foo }

  test() {
    const o = { Foo: Foo };
    const fn = function () {
      return o;
    };

    expect((Foo?.#m)()).toEqual(1);
    expect((Foo?.#m)().toString).toEqual(1..toString);
    expect((Foo?.#m)().toString()).toEqual('1');

    expect((o?.Foo.#m)()).toEqual(1);
    expect((o?.Foo.#m)().toString).toEqual(1..toString);
    expect((o?.Foo.#m)().toString()).toEqual('1');

    expect((((o.Foo?.self.getSelf)())?.#m)()).toEqual(1);
    expect((((o.Foo.self?.getSelf)())?.#m)()).toEqual(1);

    expect((((fn()?.Foo?.self.getSelf)())?.#m)()).toEqual(1);
    expect((((fn?.().Foo.self?.getSelf)())?.#m)()).toEqual(1);
  }

  testNull() {
    const o = null;
    const fn = function () {
      return { o };
    }

    expect(() => { (o?.Foo.#m)() }).toThrow();
    expect(() => { (o?.Foo.#m)().toString }).toThrow();
    expect(() => { (o?.Foo.#m)().toString() }).toThrow();

    expect(() => { (((o.Foo?.self.getSelf)())?.#m)() }).toThrow();
    expect(() => { (((o.Foo.self?.getSelf)())?.#m)() }).toThrow();

    expect(() => (((fn()?.Foo?.self.getSelf)())?.#m)()).toThrow();
    expect(() => (((fn?.().Foo.self?.getSelf)())?.#m)()).toThrow();
  }
}

(new Foo).test();
(new Foo).testNull();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return Foo;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo$self$getSelf,
      _o$Foo$self$getSelf2,
      _fn$Foo$self$getSelf,
      _fn$Foo$self$getSelf2;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))()).toEqual(1);
    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString).toEqual(
      (1).toString,
    );
    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString()).toEqual('1');
    expect(
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.bind(_o$Foo))(),
    ).toEqual(1);
    expect(
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.bind(_o$Foo2))().toString,
    ).toEqual((1).toString);
    expect(
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)._.bind(_o$Foo3))().toString(),
    ).toEqual('1');
    expect(
      ((_o$Foo$self$getSelf = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo$self$getSelf, _m)._.bind(_o$Foo$self$getSelf))(),
    ).toEqual(1);
    expect(
      ((_o$Foo$self$getSelf2 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo$self$getSelf2, _m)._.bind(_o$Foo$self$getSelf2))(),
    ).toEqual(1);
    expect(
      ((_fn$Foo$self$getSelf = (fn()?.Foo?.self.getSelf)()) === null ||
        _fn$Foo$self$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo$self$getSelf, _m)._.bind(_fn$Foo$self$getSelf))(),
    ).toEqual(1);
    expect(
      ((_fn$Foo$self$getSelf2 = (fn?.().Foo.self?.getSelf)()) === null ||
        _fn$Foo$self$getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo$self$getSelf2, _m)._.bind(_fn$Foo$self$getSelf2))(),
    ).toEqual(1);
  }
  testNull() {
    const o = null;
    const fn = function () {
      return { o };
    };
    expect(() => {
      var _o$Foo4;
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo4 = o.Foo), _m)._.bind(_o$Foo4))();
    }).toThrow();
    expect(() => {
      var _o$Foo5;
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo5 = o.Foo), _m)._.bind(_o$Foo5))().toString;
    }).toThrow();
    expect(() => {
      var _o$Foo6;
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo6 = o.Foo), _m)._.bind(_o$Foo6))().toString();
    }).toThrow();
    expect(() => {
      var _o$Foo$self$getSelf3;
      ((_o$Foo$self$getSelf3 = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo$self$getSelf3, _m)._.bind(_o$Foo$self$getSelf3))();
    }).toThrow();
    expect(() => {
      var _o$Foo$self$getSelf4;
      ((_o$Foo$self$getSelf4 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo$self$getSelf4, _m)._.bind(_o$Foo$self$getSelf4))();
    }).toThrow();
    expect(() => {
      var _fn$Foo$self$getSelf3;
      return (
        (_fn$Foo$self$getSelf3 = (fn()?.Foo?.self.getSelf)()) === null ||
          _fn$Foo$self$getSelf3 === void 0
          ? void 0
          : _assertClassBrand(Foo, _fn$Foo$self$getSelf3, _m)._.bind(_fn$Foo$self$getSelf3)
      )();
    }).toThrow();
    expect(() => {
      var _fn$Foo$self$getSelf4;
      return (
        (_fn$Foo$self$getSelf4 = (fn?.().Foo.self?.getSelf)()) === null ||
          _fn$Foo$self$getSelf4 === void 0
          ? void 0
          : _assertClassBrand(Foo, _fn$Foo$self$getSelf4, _m)._.bind(_fn$Foo$self$getSelf4)
      )();
    }).toThrow();
  }
}
_Foo = Foo;
var _x = { _: 1 };
_defineProperty(Foo, 'self', _Foo);
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
new Foo().test();
new Foo().testNull();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
class Foo {
  static getSelf() {
    return Foo;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo$self$getSelf,
      _o$Foo$self$getSelf2,
      _fn$Foo$self$getSelf,
      _fn$Foo$self$getSelf2;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))()).toEqual(1);
    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString).toEqual(
      (1).toString,
    );
    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString()).toEqual('1');
    expect(
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.bind(_o$Foo))(),
    ).toEqual(1);
    expect(
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.bind(_o$Foo2))().toString,
    ).toEqual((1).toString);
    expect(
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)._.bind(_o$Foo3))().toString(),
    ).toEqual('1');
    expect(
      ((_o$Foo$self$getSelf = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo$self$getSelf, _m)._.bind(_o$Foo$self$getSelf))(),
    ).toEqual(1);
    expect(
      ((_o$Foo$self$getSelf2 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo$self$getSelf2, _m)._.bind(_o$Foo$self$getSelf2))(),
    ).toEqual(1);
    expect(
      ((_fn$Foo$self$getSelf = (fn()?.Foo?.self.getSelf)()) === null ||
        _fn$Foo$self$getSelf === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo$self$getSelf, _m)._.bind(_fn$Foo$self$getSelf))(),
    ).toEqual(1);
    expect(
      ((_fn$Foo$self$getSelf2 = (fn?.().Foo.self?.getSelf)()) === null ||
        _fn$Foo$self$getSelf2 === void 0
        ? void 0
        : _assertClassBrand(Foo, _fn$Foo$self$getSelf2, _m)._.bind(_fn$Foo$self$getSelf2))(),
    ).toEqual(1);
  }
  testNull() {
    const o = null;
    const fn = function () {
      return { o };
    };
    expect(() => {
      var _o$Foo4;
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo4 = o.Foo), _m)._.bind(_o$Foo4))();
    }).toThrow();
    expect(() => {
      var _o$Foo5;
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo5 = o.Foo), _m)._.bind(_o$Foo5))().toString;
    }).toThrow();
    expect(() => {
      var _o$Foo6;
      (o === null || o === void 0
        ? void 0
        : _assertClassBrand(Foo, (_o$Foo6 = o.Foo), _m)._.bind(_o$Foo6))().toString();
    }).toThrow();
    expect(() => {
      var _o$Foo$self$getSelf3;
      ((_o$Foo$self$getSelf3 = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf3 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo$self$getSelf3, _m)._.bind(_o$Foo$self$getSelf3))();
    }).toThrow();
    expect(() => {
      var _o$Foo$self$getSelf4;
      ((_o$Foo$self$getSelf4 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf4 === void 0
        ? void 0
        : _assertClassBrand(Foo, _o$Foo$self$getSelf4, _m)._.bind(_o$Foo$self$getSelf4))();
    }).toThrow();
    expect(() => {
      var _fn$Foo$self$getSelf3;
      return (
        (_fn$Foo$self$getSelf3 = (fn()?.Foo?.self.getSelf)()) === null ||
          _fn$Foo$self$getSelf3 === void 0
          ? void 0
          : _assertClassBrand(Foo, _fn$Foo$self$getSelf3, _m)._.bind(_fn$Foo$self$getSelf3)
      )();
    }).toThrow();
    expect(() => {
      var _fn$Foo$self$getSelf4;
      return (
        (_fn$Foo$self$getSelf4 = (fn?.().Foo.self?.getSelf)()) === null ||
          _fn$Foo$self$getSelf4 === void 0
          ? void 0
          : _assertClassBrand(Foo, _fn$Foo$self$getSelf4, _m)._.bind(_fn$Foo$self$getSelf4)
      )();
    }).toThrow();
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Foo.self = _Foo;
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
new Foo().test();
new Foo().testNull();`,
      },
    ],
  },
  {
    title: 'private loose — parenthesized optional member call with transform (input)',
    source: `class Foo {
  static #x = 1;

  static self = Foo;
  static #m = function() { return this.#x; };
  static getSelf() { return Foo }

  test() {
    const o = { Foo: Foo };
    const fn = function () {
      return o;
    };

    (Foo?.#m)();
    (Foo?.#m)().toString;
    (Foo?.#m)().toString();

    (o?.Foo.#m)();
    (o?.Foo.#m)().toString;
    (o?.Foo.#m)().toString();

    (((o.Foo?.self.getSelf)())?.#m)();
    (((o.Foo.self?.getSelf)())?.#m)();

    (((fn()?.Foo?.self.getSelf)())?.#m)();
    (((fn?.().Foo.self?.getSelf)())?.#m)();
  }
}

(new Foo).test();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {
  static getSelf() {
    return Foo;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo$self$getSelf,
      _o$Foo$self$getSelf2,
      _fn$Foo$self$getSelf,
      _fn$Foo$self$getSelf2;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))();
    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString;
    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString();
    (o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.bind(_o$Foo))();
    (o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.bind(_o$Foo2))().toString;
    (o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)._.bind(_o$Foo3))().toString();
    ((_o$Foo$self$getSelf = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo$self$getSelf, _m)._.bind(_o$Foo$self$getSelf))();
    ((_o$Foo$self$getSelf2 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo$self$getSelf2, _m)._.bind(_o$Foo$self$getSelf2))();
    ((_fn$Foo$self$getSelf = (fn()?.Foo?.self.getSelf)()) === null ||
      _fn$Foo$self$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo$self$getSelf, _m)._.bind(_fn$Foo$self$getSelf))();
    ((_fn$Foo$self$getSelf2 = (fn?.().Foo.self?.getSelf)()) === null ||
      _fn$Foo$self$getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo$self$getSelf2, _m)._.bind(_fn$Foo$self$getSelf2))();
  }
}
_Foo = Foo;
var _x = { _: 1 };
_defineProperty(Foo, 'self', _Foo);
var _m = {
  _: function () {
    return _assertClassBrand(_Foo, this, _x)._;
  },
};
new Foo().test();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo;
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
var _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');
class Foo {
  static getSelf() {
    return Foo;
  }
  test() {
    var _o$Foo,
      _o$Foo2,
      _o$Foo3,
      _o$Foo$self$getSelf,
      _o$Foo$self$getSelf2,
      _fn$Foo$self$getSelf,
      _fn$Foo$self$getSelf2;
    const o = { Foo };
    const fn = function () {
      return o;
    };
    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))();
    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString;
    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString();
    (o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.bind(_o$Foo))();
    (o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.bind(_o$Foo2))().toString;
    (o === null || o === void 0
      ? void 0
      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)._.bind(_o$Foo3))().toString();
    ((_o$Foo$self$getSelf = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo$self$getSelf, _m)._.bind(_o$Foo$self$getSelf))();
    ((_o$Foo$self$getSelf2 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _o$Foo$self$getSelf2, _m)._.bind(_o$Foo$self$getSelf2))();
    ((_fn$Foo$self$getSelf = (fn()?.Foo?.self.getSelf)()) === null ||
      _fn$Foo$self$getSelf === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo$self$getSelf, _m)._.bind(_fn$Foo$self$getSelf))();
    ((_fn$Foo$self$getSelf2 = (fn?.().Foo.self?.getSelf)()) === null ||
      _fn$Foo$self$getSelf2 === void 0
      ? void 0
      : _assertClassBrand(Foo, _fn$Foo$self$getSelf2, _m)._.bind(_fn$Foo$self$getSelf2))();
  }
}
_Foo = Foo;
Object.defineProperty(Foo, _x, {
  writable: true,
  value: 1,
});
Foo.self = _Foo;
Object.defineProperty(Foo, _m, {
  writable: true,
  value: function () {
    return _classPrivateFieldLooseBase(this, _x)[_x];
  },
});
new Foo().test();`,
      },
    ],
  },
  {
    title: 'private loose — preserve comments (input)',
    source: `class C {
  /* before a */
  #a;
  /* after a */

  /* before b */
  static #b;
  /* after b */
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _a = /* @__PURE__ */ new WeakMap();
class C {
  constructor() {
    _classPrivateFieldInitSpec(this, _a, void 0);
  }
}
var _b = { _: void 0 };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _a = /* @__PURE__ */ _classPrivateFieldLooseKey('a');
var _b = /* @__PURE__ */ _classPrivateFieldLooseKey('b');
class C {
  constructor() {
    Object.defineProperty(this, _a, {
      writable: true,
      value: void 0,
    });
  }
}
Object.defineProperty(C, _b, {
  writable: true,
  value: void 0,
});`,
      },
    ],
  },
  {
    title: 'private loose — private in derived (input)',
    source: `class Outer {
  #outer;

  constructor() {
    class Test extends this.#outer {
    }
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _outer = /* @__PURE__ */ new WeakMap();
class Outer {
  constructor() {
    _classPrivateFieldInitSpec(this, _outer, void 0);
    class Test extends _classPrivateFieldGet(_outer, this) {}
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _outer = /* @__PURE__ */ _classPrivateFieldLooseKey('outer');
class Outer {
  constructor() {
    Object.defineProperty(this, _outer, {
      writable: true,
      value: void 0,
    });
    class Test extends _classPrivateFieldLooseBase(this, _outer)[_outer] {}
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — reevaluated (input)',
    source: `function classFactory() {
  return class Foo {
    #foo = "foo";
    static #bar = "bar";

    instance() {
      return this.#foo;
    }

    static() {
      return Foo.#bar;
    }

    static instance(inst) {
      return inst.#foo;
    }

    static static() {
      return Foo.#bar;
    }
  }
}

const Foo1 = classFactory();
const Foo2 = classFactory();

const f1 = new Foo1;
const f2 = new Foo2;

expect(f1.instance()).toBe("foo");
expect(f1.static()).toBe("bar");
expect(f2.instance()).toBe("foo");
expect(f2.static()).toBe("bar");

expect(Foo1.instance(f1)).toBe("foo");
expect(Foo1.static()).toBe("bar");
expect(Foo2.instance(f2)).toBe("foo");
expect(Foo2.static()).toBe("bar");

assert.throws(() => f1.instance.call(f2));
assert.throws(() => f2.instance.call(f1));
assert.throws(() => Foo1.instance(f2));
assert.throws(() => Foo2.instance(f1));
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
function classFactory() {
  var _Foo, _foo, _bar;
  return (
    (_foo = /* @__PURE__ */ new WeakMap()),
    (_Foo = class Foo {
      constructor() {
        _classPrivateFieldInitSpec(this, _foo, 'foo');
      }
      instance() {
        return _classPrivateFieldGet(_foo, this);
      }
      static() {
        return _assertClassBrand(_Foo, Foo, _bar)._;
      }
      static instance(inst) {
        return _classPrivateFieldGet(_foo, inst);
      }
      static static() {
        return _assertClassBrand(_Foo, Foo, _bar)._;
      }
    }),
    (_bar = { _: 'bar' }),
    _Foo
  );
}
const Foo1 = classFactory();
const Foo2 = classFactory();
const f1 = new Foo1();
const f2 = new Foo2();
expect(f1.instance()).toBe('foo');
expect(f1.static()).toBe('bar');
expect(f2.instance()).toBe('foo');
expect(f2.static()).toBe('bar');
expect(Foo1.instance(f1)).toBe('foo');
expect(Foo1.static()).toBe('bar');
expect(Foo2.instance(f2)).toBe('foo');
expect(Foo2.static()).toBe('bar');
assert.throws(() => f1.instance.call(f2));
assert.throws(() => f2.instance.call(f1));
assert.throws(() => Foo1.instance(f2));
assert.throws(() => Foo2.instance(f1));`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
function classFactory() {
  var _Foo, _foo, _bar;
  return (
    (_foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),
    (_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),
    (_Foo = class Foo {
      constructor() {
        Object.defineProperty(this, _foo, {
          writable: true,
          value: 'foo',
        });
      }
      instance() {
        return _classPrivateFieldLooseBase(this, _foo)[_foo];
      }
      static() {
        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
      }
      static instance(inst) {
        return _classPrivateFieldLooseBase(inst, _foo)[_foo];
      }
      static static() {
        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
      }
    }),
    Object.defineProperty(_Foo, _bar, {
      writable: true,
      value: 'bar',
    }),
    _Foo
  );
}
const Foo1 = classFactory();
const Foo2 = classFactory();
const f1 = new Foo1();
const f2 = new Foo2();
expect(f1.instance()).toBe('foo');
expect(f1.static()).toBe('bar');
expect(f2.instance()).toBe('foo');
expect(f2.static()).toBe('bar');
expect(Foo1.instance(f1)).toBe('foo');
expect(Foo1.static()).toBe('bar');
expect(Foo2.instance(f2)).toBe('foo');
expect(Foo2.static()).toBe('bar');
assert.throws(() => f1.instance.call(f2));
assert.throws(() => f2.instance.call(f1));
assert.throws(() => Foo1.instance(f2));
assert.throws(() => Foo2.instance(f1));`,
      },
    ],
  },
  {
    title: 'private loose — reference in other property (input)',
    source: `class Foo {
  one = this.#private;
  #two = this.#private;
  #private = 0;
  three = this.#private;
  #four = this.#private;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _two = /* @__PURE__ */ new WeakMap();
var _private = /* @__PURE__ */ new WeakMap();
var _four = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _defineProperty(this, 'one', _classPrivateFieldGet(_private, this));
    _classPrivateFieldInitSpec(this, _two, _classPrivateFieldGet(_private, this));
    _classPrivateFieldInitSpec(this, _private, 0);
    _defineProperty(this, 'three', _classPrivateFieldGet(_private, this));
    _classPrivateFieldInitSpec(this, _four, _classPrivateFieldGet(_private, this));
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _two = /* @__PURE__ */ _classPrivateFieldLooseKey('two');
var _private = /* @__PURE__ */ _classPrivateFieldLooseKey('private');
var _four = /* @__PURE__ */ _classPrivateFieldLooseKey('four');
class Foo {
  constructor() {
    this.one = _classPrivateFieldLooseBase(this, _private)[_private];
    Object.defineProperty(this, _two, {
      writable: true,
      value: _classPrivateFieldLooseBase(this, _private)[_private],
    });
    Object.defineProperty(this, _private, {
      writable: true,
      value: 0,
    });
    this.three = _classPrivateFieldLooseBase(this, _private)[_private];
    Object.defineProperty(this, _four, {
      writable: true,
      value: _classPrivateFieldLooseBase(this, _private)[_private],
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — static call (exec)',
    source: `class Foo {
  static #foo = function(x) {
    return x;
  }

  test(x) {
    return Foo.#foo(x);
  }
}

const f = new Foo;
const test = f.test();
expect(f.test("bar")).toBe("bar");
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  test(x) {
    return _foo._.call(Foo, x);
  }
}
var _foo = {
  _: function (x) {
    return x;
  },
};
const f = new Foo();
const test = f.test();
expect(f.test('bar')).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  test(x) {
    return _classPrivateFieldLooseBase(Foo, _foo)[_foo](x);
  }
}
Object.defineProperty(Foo, _foo, {
  writable: true,
  value: function (x) {
    return x;
  },
});
const f = new Foo();
const test = f.test();
expect(f.test('bar')).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private loose — static call (input)',
    source: `class Foo {
  static #foo = function(x) {
    return x;
  }

  test(x) {
    return Foo.#foo(x);
  }
}

`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  test(x) {
    return _foo._.call(Foo, x);
  }
}
var _foo = {
  _: function (x) {
    return x;
  },
};`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  test(x) {
    return _classPrivateFieldLooseBase(Foo, _foo)[_foo](x);
  }
}
Object.defineProperty(Foo, _foo, {
  writable: true,
  value: function (x) {
    return x;
  },
});`,
      },
    ],
  },
  {
    title: 'private loose — static class binding (exec)',
    source: `class A {
  static #self = A;
  static #getA = () => A;

  static extract() {
    return { self: A.#self, getA: A.#getA };
  }
}


const oldA = A;
A = null;

expect(oldA.extract().self).toBe(oldA);
expect(oldA.extract().getA()).toBe(oldA);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _A;
class A {
  static extract() {
    return {
      self: _self._,
      getA: _getA._,
    };
  }
}
_A = A;
var _self = { _: _A };
var _getA = { _: () => _A };
const oldA = A;
A = null;
expect(oldA.extract().self).toBe(oldA);
expect(oldA.extract().getA()).toBe(oldA);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _A;
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
var _getA = /* @__PURE__ */ _classPrivateFieldLooseKey('getA');
class A {
  static extract() {
    return {
      self: _classPrivateFieldLooseBase(A, _self)[_self],
      getA: _classPrivateFieldLooseBase(A, _getA)[_getA],
    };
  }
}
_A = A;
Object.defineProperty(A, _self, {
  writable: true,
  value: _A,
});
Object.defineProperty(A, _getA, {
  writable: true,
  value: () => _A,
});
const oldA = A;
A = null;
expect(oldA.extract().self).toBe(oldA);
expect(oldA.extract().getA()).toBe(oldA);`,
      },
    ],
  },
  {
    title: 'private loose — static class binding (input)',
    source: `class A {
  static #self = A;
  static #getA = () => A;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _A;
class A {}
_A = A;
var _self = { _: _A };
var _getA = { _: () => _A };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _A;
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
var _getA = /* @__PURE__ */ _classPrivateFieldLooseKey('getA');
class A {}
_A = A;
Object.defineProperty(A, _self, {
  writable: true,
  value: _A,
});
Object.defineProperty(A, _getA, {
  writable: true,
  value: () => _A,
});`,
      },
    ],
  },
  {
    title: 'private loose — static export (input)',
    source: `export class MyClass {
  static #property = value;
}

export default class MyClass2 {
  static #property = value;
}
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `export class MyClass {}
var _property = { _: value };
export default class MyClass2 {}
var _property2 = { _: value };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';
var _property = /* @__PURE__ */ _classPrivateFieldLooseKey('property');
export class MyClass {}
Object.defineProperty(MyClass, _property, {
  writable: true,
  value,
});
var _property2 = /* @__PURE__ */ _classPrivateFieldLooseKey('property');
export default class MyClass2 {}
Object.defineProperty(MyClass2, _property2, {
  writable: true,
  value,
});`,
      },
    ],
  },
  {
    title: 'private loose — static infer name (input)',
    source: `var Foo = class {
  static #num = 0;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _Class, _num;
var Foo = ((_Class = class {}), (_num = { _: 0 }), _Class);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Class, _num;
var Foo =
  ((_num = /* @__PURE__ */ _classPrivateFieldLooseKey('num')),
  (_Class = class {}),
  Object.defineProperty(_Class, _num, {
    writable: true,
    value: 0,
  }),
  _Class);`,
      },
    ],
  },
  {
    title: 'private loose — static inherited (exec)',
    source: `class Base {
  static #foo = 1;

  static getThis() {
    return this.#foo;
  }

  static updateThis(val) {
    return (this.#foo = val);
  }

  static getClass() {
    return Base.#foo;
  }

  static updateClass(val) {
    return (Base.#foo = val);
  }
}

class Sub1 extends Base {
  static #foo = 2;

  static update(val) {
    return (this.#foo = val);
  }
}

class Sub2 extends Base {}

expect(Base.getThis()).toBe(1);
expect(Base.getClass()).toBe(1);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(1);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(1);

expect(Sub1.update(3)).toBe(3);
expect(Base.getThis()).toBe(1);
expect(Base.getClass()).toBe(1);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(1);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(1);

expect(Base.updateThis(4)).toBe(4);
expect(Base.getThis()).toBe(4);
expect(Base.getClass()).toBe(4);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(4);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(4);

expect(Base.updateClass(5)).toBe(5);
expect(Base.getThis()).toBe(5);
expect(Base.getClass()).toBe(5);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(5);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(5);

expect(() => Sub2.updateThis(6)).toThrow();
expect(Sub2.updateClass(7)).toBe(7);
expect(Base.getThis()).toBe(7);
expect(Base.getClass()).toBe(7);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(7);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(7);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class Base {
  static getThis() {
    return _assertClassBrand(Base, this, _foo)._;
  }
  static updateThis(val) {
    return (_foo._ = _assertClassBrand(Base, this, val));
  }
  static getClass() {
    return _foo._;
  }
  static updateClass(val) {
    return (_foo._ = val);
  }
}
var _foo = { _: 1 };
class Sub1 extends Base {
  static update(val) {
    return (_foo2._ = _assertClassBrand(Sub1, this, val));
  }
}
var _foo2 = { _: 2 };
class Sub2 extends Base {}
expect(Base.getThis()).toBe(1);
expect(Base.getClass()).toBe(1);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(1);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(1);
expect(Sub1.update(3)).toBe(3);
expect(Base.getThis()).toBe(1);
expect(Base.getClass()).toBe(1);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(1);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(1);
expect(Base.updateThis(4)).toBe(4);
expect(Base.getThis()).toBe(4);
expect(Base.getClass()).toBe(4);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(4);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(4);
expect(Base.updateClass(5)).toBe(5);
expect(Base.getThis()).toBe(5);
expect(Base.getClass()).toBe(5);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(5);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(5);
expect(() => Sub2.updateThis(6)).toThrow();
expect(Sub2.updateClass(7)).toBe(7);
expect(Base.getThis()).toBe(7);
expect(Base.getClass()).toBe(7);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(7);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(7);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Base {
  static getThis() {
    return _classPrivateFieldLooseBase(this, _foo)[_foo];
  }
  static updateThis(val) {
    return (_classPrivateFieldLooseBase(this, _foo)[_foo] = val);
  }
  static getClass() {
    return _classPrivateFieldLooseBase(Base, _foo)[_foo];
  }
  static updateClass(val) {
    return (_classPrivateFieldLooseBase(Base, _foo)[_foo] = val);
  }
}
Object.defineProperty(Base, _foo, {
  writable: true,
  value: 1,
});
var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Sub1 extends Base {
  static update(val) {
    return (_classPrivateFieldLooseBase(this, _foo2)[_foo2] = val);
  }
}
Object.defineProperty(Sub1, _foo2, {
  writable: true,
  value: 2,
});
class Sub2 extends Base {}
expect(Base.getThis()).toBe(1);
expect(Base.getClass()).toBe(1);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(1);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(1);
expect(Sub1.update(3)).toBe(3);
expect(Base.getThis()).toBe(1);
expect(Base.getClass()).toBe(1);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(1);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(1);
expect(Base.updateThis(4)).toBe(4);
expect(Base.getThis()).toBe(4);
expect(Base.getClass()).toBe(4);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(4);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(4);
expect(Base.updateClass(5)).toBe(5);
expect(Base.getThis()).toBe(5);
expect(Base.getClass()).toBe(5);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(5);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(5);
expect(() => Sub2.updateThis(6)).toThrow();
expect(Sub2.updateClass(7)).toBe(7);
expect(Base.getThis()).toBe(7);
expect(Base.getClass()).toBe(7);
expect(() => Sub1.getThis()).toThrow();
expect(Sub1.getClass()).toBe(7);
expect(() => Sub2.getThis()).toThrow();
expect(Sub2.getClass()).toBe(7);`,
      },
    ],
  },
  {
    title: 'private loose — static inherited (input)',
    source: `class Base {
  static #foo = 1;

  static getThis() {
    return this.#foo;
  }

  static updateThis(val) {
    return (this.#foo = val);
  }

  static getClass() {
    return Base.#foo;
  }

  static updateClass(val) {
    return (Base.#foo = val);
  }
}

class Sub1 extends Base {
  static #foo = 2;

  static update(val) {
    return (this.#foo = val);
  }
}

class Sub2 extends Base {}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class Base {
  static getThis() {
    return _assertClassBrand(Base, this, _foo)._;
  }
  static updateThis(val) {
    return (_foo._ = _assertClassBrand(Base, this, val));
  }
  static getClass() {
    return _foo._;
  }
  static updateClass(val) {
    return (_foo._ = val);
  }
}
var _foo = { _: 1 };
class Sub1 extends Base {
  static update(val) {
    return (_foo2._ = _assertClassBrand(Sub1, this, val));
  }
}
var _foo2 = { _: 2 };
class Sub2 extends Base {}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Base {
  static getThis() {
    return _classPrivateFieldLooseBase(this, _foo)[_foo];
  }
  static updateThis(val) {
    return (_classPrivateFieldLooseBase(this, _foo)[_foo] = val);
  }
  static getClass() {
    return _classPrivateFieldLooseBase(Base, _foo)[_foo];
  }
  static updateClass(val) {
    return (_classPrivateFieldLooseBase(Base, _foo)[_foo] = val);
  }
}
Object.defineProperty(Base, _foo, {
  writable: true,
  value: 1,
});
var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Sub1 extends Base {
  static update(val) {
    return (_classPrivateFieldLooseBase(this, _foo2)[_foo2] = val);
  }
}
Object.defineProperty(Sub1, _foo2, {
  writable: true,
  value: 2,
});
class Sub2 extends Base {}`,
      },
    ],
  },
  {
    title: 'private loose — static shadow (exec)',
    source: `class Test {

  static #x = 1

  static method() {
    const Test = 2;
    const func = () => {
      const Test = 3;
      return this.#x + Test;
    }
    return func() + Test;
  }
}

expect(Test.method()).toBe(6)
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class Test {
  static method() {
    const Test = 2;
    const func = () => {
      const Test = 3;
      return _assertClassBrand(Test, this, _x)._ + Test;
    };
    return func() + Test;
  }
}
var _x = { _: 1 };
expect(Test.method()).toBe(6);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
class Test {
  static method() {
    const Test = 2;
    const func = () => {
      const Test = 3;
      return _classPrivateFieldLooseBase(this, _x)[_x] + Test;
    };
    return func() + Test;
  }
}
Object.defineProperty(Test, _x, {
  writable: true,
  value: 1,
});
expect(Test.method()).toBe(6);`,
      },
    ],
  },
  {
    title: 'private loose — static shadow (input)',
    source: `class Test {

  static #x = 1

  static method() {
    const Test = 2;
    const func = () => {
      const Test = 3;
      return this.#x + Test;
    }
    return func() + Test;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class Test {
  static method() {
    const Test = 2;
    const func = () => {
      const Test = 3;
      return _assertClassBrand(Test, this, _x)._ + Test;
    };
    return func() + Test;
  }
}
var _x = { _: 1 };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');
class Test {
  static method() {
    const Test = 2;
    const func = () => {
      const Test = 3;
      return _classPrivateFieldLooseBase(this, _x)[_x] + Test;
    };
    return func() + Test;
  }
}
Object.defineProperty(Test, _x, {
  writable: true,
  value: 1,
});`,
      },
    ],
  },
  {
    title: 'private loose — static this (exec)',
    source: `class A {
  static #self = this;
  static #getA = () => this;

  static extract() {
    return { self: A.#self, getA: A.#getA };
  }
}

const { self, getA } = A.extract();

expect(self).toBe(A);
expect(getA()).toBe(A);

const oldA = A;
A = null;

expect(oldA.extract().self).toBe(oldA);
expect(oldA.extract().getA()).toBe(oldA);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _A;
class A {
  static extract() {
    return {
      self: _self._,
      getA: _getA._,
    };
  }
}
_A = A;
var _self = { _: _A };
var _getA = { _: () => _A };
const { self, getA } = A.extract();
expect(self).toBe(A);
expect(getA()).toBe(A);
const oldA = A;
A = null;
expect(oldA.extract().self).toBe(oldA);
expect(oldA.extract().getA()).toBe(oldA);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _A;
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
var _getA = /* @__PURE__ */ _classPrivateFieldLooseKey('getA');
class A {
  static extract() {
    return {
      self: _classPrivateFieldLooseBase(A, _self)[_self],
      getA: _classPrivateFieldLooseBase(A, _getA)[_getA],
    };
  }
}
_A = A;
Object.defineProperty(A, _self, {
  writable: true,
  value: _A,
});
Object.defineProperty(A, _getA, {
  writable: true,
  value: () => _A,
});
const { self, getA } = A.extract();
expect(self).toBe(A);
expect(getA()).toBe(A);
const oldA = A;
A = null;
expect(oldA.extract().self).toBe(oldA);
expect(oldA.extract().getA()).toBe(oldA);`,
      },
    ],
  },
  {
    title: 'private loose — static this (input)',
    source: `class A {
  static #self = this;
  static #getA = () => this;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _A;
class A {}
_A = A;
var _self = { _: _A };
var _getA = { _: () => _A };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _A;
var _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');
var _getA = /* @__PURE__ */ _classPrivateFieldLooseKey('getA');
class A {}
_A = A;
Object.defineProperty(A, _self, {
  writable: true,
  value: _A,
});
Object.defineProperty(A, _getA, {
  writable: true,
  value: () => _A,
});`,
      },
    ],
  },
  {
    title: 'private loose — static undefined (exec)',
    source: `class Foo {
  static #bar;

  static test() {
    return Foo.#bar;
  }

  test() {
    return Foo.#bar;
  }
}

expect("bar" in Foo).toBe(false);
expect(Foo.test()).toBe(undefined);
expect(Foo.test()).toBe(undefined);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  static test() {
    return _bar._;
  }
  test() {
    return _bar._;
  }
}
var _bar = { _: void 0 };
expect('bar' in Foo).toBe(false);
expect(Foo.test()).toBe(undefined);
expect(Foo.test()).toBe(undefined);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  static test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
  test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
}
Object.defineProperty(Foo, _bar, {
  writable: true,
  value: void 0,
});
expect('bar' in Foo).toBe(false);
expect(Foo.test()).toBe(undefined);
expect(Foo.test()).toBe(undefined);`,
      },
    ],
  },
  {
    title: 'private loose — static undefined (input)',
    source: `class Foo {
  static #bar;

  static test() {
    return Foo.#bar;
  }

  test() {
    return Foo.#bar;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  static test() {
    return _bar._;
  }
  test() {
    return _bar._;
  }
}
var _bar = { _: void 0 };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  static test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
  test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
}
Object.defineProperty(Foo, _bar, {
  writable: true,
  value: void 0,
});`,
      },
    ],
  },
  {
    title: 'private loose — static (exec)',
    source: `class Foo {
  static #bar = "foo";

  static test() {
    return Foo.#bar;
  }

  test() {
    return Foo.#bar;
  }
}

expect("bar" in Foo).toBe(false);
expect(Foo.test()).toBe("foo");
expect(Foo.test()).toBe("foo");
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  static test() {
    return _bar._;
  }
  test() {
    return _bar._;
  }
}
var _bar = { _: 'foo' };
expect('bar' in Foo).toBe(false);
expect(Foo.test()).toBe('foo');
expect(Foo.test()).toBe('foo');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  static test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
  test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
}
Object.defineProperty(Foo, _bar, {
  writable: true,
  value: 'foo',
});
expect('bar' in Foo).toBe(false);
expect(Foo.test()).toBe('foo');
expect(Foo.test()).toBe('foo');`,
      },
    ],
  },
  {
    title: 'private loose — static (input)',
    source: `class Foo {
  static #bar = "foo";

  static test() {
    return Foo.#bar;
  }

  test() {
    return Foo.#bar;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  static test() {
    return _bar._;
  }
  test() {
    return _bar._;
  }
}
var _bar = { _: 'foo' };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  static test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
  test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
}
Object.defineProperty(Foo, _bar, {
  writable: true,
  value: 'foo',
});`,
      },
    ],
  },
  {
    title: 'private loose — super expression (input)',
    source: `class Foo extends Bar {
  #bar = "foo";

  constructor() {
    foo(super());
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo extends Bar {
  constructor() {
    var _super = (..._args) => (
      super(..._args),
      _classPrivateFieldInitSpec(this, _bar, 'foo'),
      this
    );
    foo(_super());
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo extends Bar {
  constructor() {
    var _super = (..._args) => (
      super(..._args),
      Object.defineProperty(this, _bar, {
        writable: true,
        value: 'foo',
      }),
      this
    );
    foo(_super());
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — super statement (input)',
    source: `class Foo extends Bar {
  #bar = "foo";

  constructor() {
    super();
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo extends Bar {
  constructor() {
    super();
    _classPrivateFieldInitSpec(this, _bar, 'foo');
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo extends Bar {
  constructor() {
    super();
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 'foo',
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private loose — update (exec)',
    source: `class Foo {
  #foo = 0;

  test(other) {
    return [
      this.#foo++,
      this.#foo,
      ++this.#foo,
      this.#foo,
      other.obj.#foo++,
      other.obj.#foo,
      ++other.obj.#foo,
      other.obj.#foo,
    ];
  }
}

const f = new Foo;
const results = f.test({ obj: f });
expect(results[0]).toBe(0);
expect(results[1]).toBe(1);
expect(results[2]).toBe(2);
expect(results[3]).toBe(2);
expect(results[4]).toBe(2);
expect(results[5]).toBe(3);
expect(results[6]).toBe(4);
expect(results[7]).toBe(4);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 0);
  }
  test(other) {
    var _this$foo,
      _this$foo2,
      _this$foo3,
      _other$obj,
      _other$obj$foo,
      _other$obj$foo2,
      _other$obj2,
      _other$obj$foo3;
    return [
      (_classPrivateFieldSet(
        _foo,
        this,
        ((_this$foo = _classPrivateFieldGet(_foo, this)), (_this$foo2 = _this$foo++), _this$foo),
      ),
      _this$foo2),
      _classPrivateFieldGet(_foo, this),
      _classPrivateFieldSet(
        _foo,
        this,
        ((_this$foo3 = _classPrivateFieldGet(_foo, this)), ++_this$foo3),
      ),
      _classPrivateFieldGet(_foo, this),
      (_classPrivateFieldSet(
        _foo,
        (_other$obj = other.obj),
        ((_other$obj$foo = _classPrivateFieldGet(_foo, _other$obj)),
        (_other$obj$foo2 = _other$obj$foo++),
        _other$obj$foo),
      ),
      _other$obj$foo2),
      _classPrivateFieldGet(_foo, other.obj),
      _classPrivateFieldSet(
        _foo,
        (_other$obj2 = other.obj),
        ((_other$obj$foo3 = _classPrivateFieldGet(_foo, _other$obj2)), ++_other$obj$foo3),
      ),
      _classPrivateFieldGet(_foo, other.obj),
    ];
  }
}
const f = new Foo();
const results = f.test({ obj: f });
expect(results[0]).toBe(0);
expect(results[1]).toBe(1);
expect(results[2]).toBe(2);
expect(results[3]).toBe(2);
expect(results[4]).toBe(2);
expect(results[5]).toBe(3);
expect(results[6]).toBe(4);
expect(results[7]).toBe(4);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 0,
    });
  }
  test(other) {
    return [
      _classPrivateFieldLooseBase(this, _foo)[_foo]++,
      _classPrivateFieldLooseBase(this, _foo)[_foo],
      ++_classPrivateFieldLooseBase(this, _foo)[_foo],
      _classPrivateFieldLooseBase(this, _foo)[_foo],
      _classPrivateFieldLooseBase(other.obj, _foo)[_foo]++,
      _classPrivateFieldLooseBase(other.obj, _foo)[_foo],
      ++_classPrivateFieldLooseBase(other.obj, _foo)[_foo],
      _classPrivateFieldLooseBase(other.obj, _foo)[_foo],
    ];
  }
}
const f = new Foo();
const results = f.test({ obj: f });
expect(results[0]).toBe(0);
expect(results[1]).toBe(1);
expect(results[2]).toBe(2);
expect(results[3]).toBe(2);
expect(results[4]).toBe(2);
expect(results[5]).toBe(3);
expect(results[6]).toBe(4);
expect(results[7]).toBe(4);`,
      },
    ],
  },
  {
    title: 'private loose — update (input)',
    source: `class Foo {
  #foo = 0;

  test(other) {
    this.#foo++;
    ++this.#foo;
    other.obj.#foo++;
    ++other.obj.#foo;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _foo = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _foo, 0);
  }
  test(other) {
    var _this$foo,
      _this$foo2,
      _this$foo3,
      _other$obj,
      _other$obj$foo,
      _other$obj$foo2,
      _other$obj2,
      _other$obj$foo3;
    (_classPrivateFieldSet(
      _foo,
      this,
      ((_this$foo = _classPrivateFieldGet(_foo, this)), (_this$foo2 = _this$foo++), _this$foo),
    ),
      _this$foo2);
    _classPrivateFieldSet(
      _foo,
      this,
      ((_this$foo3 = _classPrivateFieldGet(_foo, this)), ++_this$foo3),
    );
    (_classPrivateFieldSet(
      _foo,
      (_other$obj = other.obj),
      ((_other$obj$foo = _classPrivateFieldGet(_foo, _other$obj)),
      (_other$obj$foo2 = _other$obj$foo++),
      _other$obj$foo),
    ),
      _other$obj$foo2);
    _classPrivateFieldSet(
      _foo,
      (_other$obj2 = other.obj),
      ((_other$obj$foo3 = _classPrivateFieldGet(_foo, _other$obj2)), ++_other$obj$foo3),
    );
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 0,
    });
  }
  test(other) {
    _classPrivateFieldLooseBase(this, _foo)[_foo]++;
    ++_classPrivateFieldLooseBase(this, _foo)[_foo];
    _classPrivateFieldLooseBase(other.obj, _foo)[_foo]++;
    ++_classPrivateFieldLooseBase(other.obj, _foo)[_foo];
  }
}`,
      },
    ],
  },
  {
    title: 'private — 1 helpermemberexpressionfunction (input)',
    source: `class D {
  #arr;
  f() {
    for (const el of this.#arr);
  }
}

class C {
  #p;
  m() {
    for (this.#p of []);
  }
}

class E {
  #arr;
  f() {
    for (this.#arr of [1, 2]);
  }
}

class F {
  #ar;
  g() {
    for (this.#ar in [1,2,3]);
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _arr = /* @__PURE__ */ new WeakMap();
class D {
  constructor() {
    _classPrivateFieldInitSpec(this, _arr, void 0);
  }
  f() {
    for (const el of _classPrivateFieldGet(_arr, this));
  }
}
var _p = /* @__PURE__ */ new WeakMap();
class C {
  constructor() {
    _classPrivateFieldInitSpec(this, _p, void 0);
  }
  m() {
    for (_toSetter(_classPrivateFieldSet, [_p, this])._ of []);
  }
}
var _arr2 = /* @__PURE__ */ new WeakMap();
class E {
  constructor() {
    _classPrivateFieldInitSpec(this, _arr2, void 0);
  }
  f() {
    for (_toSetter(_classPrivateFieldSet, [_arr2, this])._ of [1, 2]);
  }
}
var _ar = /* @__PURE__ */ new WeakMap();
class F {
  constructor() {
    _classPrivateFieldInitSpec(this, _ar, void 0);
  }
  g() {
    for (_toSetter(_classPrivateFieldSet, [_ar, this])._ in [1, 2, 3]);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _arr = /* @__PURE__ */ _classPrivateFieldLooseKey('arr');
class D {
  constructor() {
    Object.defineProperty(this, _arr, {
      writable: true,
      value: void 0,
    });
  }
  f() {
    for (const el of _classPrivateFieldLooseBase(this, _arr)[_arr]);
  }
}
var _p = /* @__PURE__ */ _classPrivateFieldLooseKey('p');
class C {
  constructor() {
    Object.defineProperty(this, _p, {
      writable: true,
      value: void 0,
    });
  }
  m() {
    for (_classPrivateFieldLooseBase(this, _p)[_p] of []);
  }
}
var _arr2 = /* @__PURE__ */ _classPrivateFieldLooseKey('arr');
class E {
  constructor() {
    Object.defineProperty(this, _arr2, {
      writable: true,
      value: void 0,
    });
  }
  f() {
    for (_classPrivateFieldLooseBase(this, _arr2)[_arr2] of [1, 2]);
  }
}
var _ar = /* @__PURE__ */ _classPrivateFieldLooseKey('ar');
class F {
  constructor() {
    Object.defineProperty(this, _ar, {
      writable: true,
      value: void 0,
    });
  }
  g() {
    for (_classPrivateFieldLooseBase(this, _ar)[_ar] in [1, 2, 3]);
  }
}`,
      },
    ],
  },
  {
    title: 'private — access before declaration (exec)',
    source: `expect(() => {
  class C {
    static #_ = new C;
    static #p;
    constructor() {
      C.#p;
    }
  }
}).toThrow(TypeError);

expect(() => {
  class C {
    static #_ = new C;
    static #p;
    constructor() {
      C.#p = 0;
    }
  }
}).toThrow(TypeError);

expect(() => {
  class C {
    static #_ = new C;
    static #p;
    constructor() {
      for (C.#p of [0]);
    }
  }
}).toThrow(TypeError);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `expect(() => {
  var _C;
  class C {
    constructor() {
      _p._;
    }
  }
  _C = C;
  var _ = { _: new _C() };
  var _p = { _: void 0 };
}).toThrow(TypeError);
expect(() => {
  var _C2;
  class C {
    constructor() {
      _p2._ = 0;
    }
  }
  _C2 = C;
  var _2 = { _: new _C2() };
  var _p2 = { _: void 0 };
}).toThrow(TypeError);
expect(() => {
  var _C3;
  class C {
    constructor() {
      for (_p3._ of [0]);
    }
  }
  _C3 = C;
  var _3 = { _: new _C3() };
  var _p3 = { _: void 0 };
}).toThrow(TypeError);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
expect(() => {
  var _C;
  var _ = /* @__PURE__ */ _classPrivateFieldLooseKey('_');
  var _p = /* @__PURE__ */ _classPrivateFieldLooseKey('p');
  class C {
    constructor() {
      _classPrivateFieldLooseBase(C, _p)[_p];
    }
  }
  _C = C;
  Object.defineProperty(C, _, {
    writable: true,
    value: new _C(),
  });
  Object.defineProperty(C, _p, {
    writable: true,
    value: void 0,
  });
}).toThrow(TypeError);
expect(() => {
  var _C2;
  var _2 = /* @__PURE__ */ _classPrivateFieldLooseKey('_');
  var _p2 = /* @__PURE__ */ _classPrivateFieldLooseKey('p');
  class C {
    constructor() {
      _classPrivateFieldLooseBase(C, _p2)[_p2] = 0;
    }
  }
  _C2 = C;
  Object.defineProperty(C, _2, {
    writable: true,
    value: new _C2(),
  });
  Object.defineProperty(C, _p2, {
    writable: true,
    value: void 0,
  });
}).toThrow(TypeError);
expect(() => {
  var _C3;
  var _3 = /* @__PURE__ */ _classPrivateFieldLooseKey('_');
  var _p3 = /* @__PURE__ */ _classPrivateFieldLooseKey('p');
  class C {
    constructor() {
      for (_classPrivateFieldLooseBase(C, _p3)[_p3] of [0]);
    }
  }
  _C3 = C;
  Object.defineProperty(C, _3, {
    writable: true,
    value: new _C3(),
  });
  Object.defineProperty(C, _p3, {
    writable: true,
    value: void 0,
  });
}).toThrow(TypeError);`,
      },
    ],
  },
  {
    title: 'private — destructuring object pattern 3 (exec)',
    source: `class Foo {
  #client

  constructor(props) {
    ({x: this.#client = 5} = props);
  }

  getClient() {
    return this.#client;
  }
}

const foo = new Foo({});
expect(foo.getClient()).toEqual(5);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    ({ x: _toSetter(_classPrivateFieldSet, [_client, this])._ = 5 } = props);
  }
  getClient() {
    return _classPrivateFieldGet(_client, this);
  }
}
const foo = new Foo({});
expect(foo.getClient()).toEqual(5);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    ({ x: _classPrivateFieldLooseBase(this, _client)[_client] = 5 } = props);
  }
  getClient() {
    return _classPrivateFieldLooseBase(this, _client)[_client];
  }
}
const foo = new Foo({});
expect(foo.getClient()).toEqual(5);`,
      },
    ],
  },
  {
    title: 'private — destructuring object pattern 3 (input)',
    source: `class Foo {
  #client

  constructor(props) {
    ({x: this.#client = 5} = props);
  }
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _toSetter = require('@babel/runtime/helpers/toSetter');
var _client = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, void 0);
    ({ x: _toSetter(_classPrivateFieldSet, [_client, this])._ = 5 } = props);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');
class Foo {
  constructor(props) {
    Object.defineProperty(this, _client, {
      writable: true,
      value: void 0,
    });
    ({ x: _classPrivateFieldLooseBase(this, _client)[_client] = 5 } = props);
  }
}`,
      },
    ],
  },
  {
    title: 'private — instance (exec)',
    source: `class Foo {
  #bar = "foo";

  test() {
    return this.#bar;
  }

  update() {
    this.#bar++;
  }

  set(val) {
    this.#bar = val;
  }

  static test(foo) {
    return foo.#bar;
  }

  static update(foo) {
    foo.#bar **= 2;
  }
}

const f = new Foo();
expect(f.test()).toBe("foo");
expect(Foo.test(f)).toBe("foo");
expect("bar" in f).toBe(false);

f.set(1);
expect(f.test()).toBe(1);
f.update();
expect(Foo.test(f)).toBe(2);
Foo.update(f);
expect(f.test()).toBe(4);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, 'foo');
  }
  test() {
    return _classPrivateFieldGet(_bar, this);
  }
  update() {
    var _this$bar, _this$bar2;
    (_classPrivateFieldSet(
      _bar,
      this,
      ((_this$bar = _classPrivateFieldGet(_bar, this)), (_this$bar2 = _this$bar++), _this$bar),
    ),
      _this$bar2);
  }
  set(val) {
    _classPrivateFieldSet(_bar, this, val);
  }
  static test(foo) {
    return _classPrivateFieldGet(_bar, foo);
  }
  static update(foo) {
    _classPrivateFieldSet(_bar, foo, _classPrivateFieldGet(_bar, foo) ** 2);
  }
}
const f = new Foo();
expect(f.test()).toBe('foo');
expect(Foo.test(f)).toBe('foo');
expect('bar' in f).toBe(false);
f.set(1);
expect(f.test()).toBe(1);
f.update();
expect(Foo.test(f)).toBe(2);
Foo.update(f);
expect(f.test()).toBe(4);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 'foo',
    });
  }
  test() {
    return _classPrivateFieldLooseBase(this, _bar)[_bar];
  }
  update() {
    _classPrivateFieldLooseBase(this, _bar)[_bar]++;
  }
  set(val) {
    _classPrivateFieldLooseBase(this, _bar)[_bar] = val;
  }
  static test(foo) {
    return _classPrivateFieldLooseBase(foo, _bar)[_bar];
  }
  static update(foo) {
    _classPrivateFieldLooseBase(foo, _bar)[_bar] **= 2;
  }
}
const f = new Foo();
expect(f.test()).toBe('foo');
expect(Foo.test(f)).toBe('foo');
expect('bar' in f).toBe(false);
f.set(1);
expect(f.test()).toBe(1);
f.update();
expect(Foo.test(f)).toBe(2);
Foo.update(f);
expect(f.test()).toBe(4);`,
      },
    ],
  },
  {
    title: 'private — native classes (exec)',
    source: `class Foo {
  static #foo = "foo";
  #bar = "bar";

  static test() {
    return Foo.#foo;
  }

  test() {
    return this.#bar;
  }
}

const f = new Foo();
expect("foo" in Foo).toBe(false)
expect("bar" in f).toBe(false)
expect(Foo.test()).toBe("foo")
expect(f.test()).toBe("bar")
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, 'bar');
  }
  static test() {
    return _foo._;
  }
  test() {
    return _classPrivateFieldGet(_bar, this);
  }
}
var _foo = { _: 'foo' };
const f = new Foo();
expect('foo' in Foo).toBe(false);
expect('bar' in f).toBe(false);
expect(Foo.test()).toBe('foo');
expect(f.test()).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 'bar',
    });
  }
  static test() {
    return _classPrivateFieldLooseBase(Foo, _foo)[_foo];
  }
  test() {
    return _classPrivateFieldLooseBase(this, _bar)[_bar];
  }
}
Object.defineProperty(Foo, _foo, {
  writable: true,
  value: 'foo',
});
const f = new Foo();
expect('foo' in Foo).toBe(false);
expect('bar' in f).toBe(false);
expect(Foo.test()).toBe('foo');
expect(f.test()).toBe('bar');`,
      },
    ],
  },
  {
    title: 'private — native classes (input)',
    source: `class Foo {
  static #foo = "foo";
  #bar = "bar";

  static test() {
    return Foo.#foo;
  }

  test() {
    return this.#bar;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _bar = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _bar, 'bar');
  }
  static test() {
    return _foo._;
  }
  test() {
    return _classPrivateFieldGet(_bar, this);
  }
}
var _foo = { _: 'foo' };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  constructor() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 'bar',
    });
  }
  static test() {
    return _classPrivateFieldLooseBase(Foo, _foo)[_foo];
  }
  test() {
    return _classPrivateFieldLooseBase(this, _bar)[_bar];
  }
}
Object.defineProperty(Foo, _foo, {
  writable: true,
  value: 'foo',
});`,
      },
    ],
  },
  {
    title: 'private — reevaluated (exec)',
    source: `function classFactory() {
  return class Foo {
    #foo = "foo";
    static #bar = "bar";

    instance() {
      return this.#foo;
    }

    static() {
      return Foo.#bar;
    }

    static instance(inst) {
      return inst.#foo;
    }

    static static() {
      return Foo.#bar;
    }
  };
}

const Foo1 = classFactory();
const Foo2 = classFactory();

const f1 = new Foo1();
const f2 = new Foo2();

expect(f1.instance()).toBe("foo");
expect(f1.static()).toBe("bar");
expect(f2.instance()).toBe("foo");
expect(f2.static()).toBe("bar");

expect(Foo1.instance(f1)).toBe("foo");
expect(Foo1.static()).toBe("bar");
expect(Foo2.instance(f2)).toBe("foo");
expect(Foo2.static()).toBe("bar");

expect(() => {
  f1.instance.call(f2), undefined;
}).toThrow();
expect(() => {
  f2.instance.call(f1), undefined;
}).toThrow();
expect(() => {
  Foo1.instance(f2), undefined;
}).toThrow();
expect(() => {
  Foo2.instance(f1), undefined;
}).toThrow();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
function classFactory() {
  var _Foo, _foo, _bar;
  return (
    (_foo = /* @__PURE__ */ new WeakMap()),
    (_Foo = class Foo {
      constructor() {
        _classPrivateFieldInitSpec(this, _foo, 'foo');
      }
      instance() {
        return _classPrivateFieldGet(_foo, this);
      }
      static() {
        return _assertClassBrand(_Foo, Foo, _bar)._;
      }
      static instance(inst) {
        return _classPrivateFieldGet(_foo, inst);
      }
      static static() {
        return _assertClassBrand(_Foo, Foo, _bar)._;
      }
    }),
    (_bar = { _: 'bar' }),
    _Foo
  );
}
const Foo1 = classFactory();
const Foo2 = classFactory();
const f1 = new Foo1();
const f2 = new Foo2();
expect(f1.instance()).toBe('foo');
expect(f1.static()).toBe('bar');
expect(f2.instance()).toBe('foo');
expect(f2.static()).toBe('bar');
expect(Foo1.instance(f1)).toBe('foo');
expect(Foo1.static()).toBe('bar');
expect(Foo2.instance(f2)).toBe('foo');
expect(Foo2.static()).toBe('bar');
expect(() => {
  (f1.instance.call(f2), undefined);
}).toThrow();
expect(() => {
  (f2.instance.call(f1), undefined);
}).toThrow();
expect(() => {
  (Foo1.instance(f2), undefined);
}).toThrow();
expect(() => {
  (Foo2.instance(f1), undefined);
}).toThrow();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
function classFactory() {
  var _Foo, _foo, _bar;
  return (
    (_foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),
    (_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),
    (_Foo = class Foo {
      constructor() {
        Object.defineProperty(this, _foo, {
          writable: true,
          value: 'foo',
        });
      }
      instance() {
        return _classPrivateFieldLooseBase(this, _foo)[_foo];
      }
      static() {
        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
      }
      static instance(inst) {
        return _classPrivateFieldLooseBase(inst, _foo)[_foo];
      }
      static static() {
        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
      }
    }),
    Object.defineProperty(_Foo, _bar, {
      writable: true,
      value: 'bar',
    }),
    _Foo
  );
}
const Foo1 = classFactory();
const Foo2 = classFactory();
const f1 = new Foo1();
const f2 = new Foo2();
expect(f1.instance()).toBe('foo');
expect(f1.static()).toBe('bar');
expect(f2.instance()).toBe('foo');
expect(f2.static()).toBe('bar');
expect(Foo1.instance(f1)).toBe('foo');
expect(Foo1.static()).toBe('bar');
expect(Foo2.instance(f2)).toBe('foo');
expect(Foo2.static()).toBe('bar');
expect(() => {
  (f1.instance.call(f2), undefined);
}).toThrow();
expect(() => {
  (f2.instance.call(f1), undefined);
}).toThrow();
expect(() => {
  (Foo1.instance(f2), undefined);
}).toThrow();
expect(() => {
  (Foo2.instance(f1), undefined);
}).toThrow();`,
      },
    ],
  },
  {
    title: 'private — reevaluated (input)',
    source: `function classFactory() {
  return class Foo {
    #foo = "foo";
    static #bar = "bar";

    instance() {
      return this.#foo;
    }

    static() {
      return Foo.#bar;
    }

    static instance(inst) {
      return inst.#foo;
    }

    static static() {
      return Foo.#bar;
    }
  };
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
function classFactory() {
  var _Foo, _foo, _bar;
  return (
    (_foo = /* @__PURE__ */ new WeakMap()),
    (_Foo = class Foo {
      constructor() {
        _classPrivateFieldInitSpec(this, _foo, 'foo');
      }
      instance() {
        return _classPrivateFieldGet(_foo, this);
      }
      static() {
        return _assertClassBrand(_Foo, Foo, _bar)._;
      }
      static instance(inst) {
        return _classPrivateFieldGet(_foo, inst);
      }
      static static() {
        return _assertClassBrand(_Foo, Foo, _bar)._;
      }
    }),
    (_bar = { _: 'bar' }),
    _Foo
  );
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
function classFactory() {
  var _Foo, _foo, _bar;
  return (
    (_foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),
    (_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),
    (_Foo = class Foo {
      constructor() {
        Object.defineProperty(this, _foo, {
          writable: true,
          value: 'foo',
        });
      }
      instance() {
        return _classPrivateFieldLooseBase(this, _foo)[_foo];
      }
      static() {
        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
      }
      static instance(inst) {
        return _classPrivateFieldLooseBase(inst, _foo)[_foo];
      }
      static static() {
        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
      }
    }),
    Object.defineProperty(_Foo, _bar, {
      writable: true,
      value: 'bar',
    }),
    _Foo
  );
}`,
      },
    ],
  },
  {
    title: 'private — regression T2983 (input)',
    source: `call(class {
  static #test = true
});

export default class {
  static #test = true
};
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _Class, _test;
call(((_Class = class {}), (_test = { _: true }), _Class));
export default class _Class2 {}
var _test2 = { _: true };`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';
var _Class, _test;
call(
  ((_test = /* @__PURE__ */ _classPrivateFieldLooseKey('test')),
  (_Class = class {}),
  Object.defineProperty(_Class, _test, {
    writable: true,
    value: true,
  }),
  _Class),
);
var _test2 = /* @__PURE__ */ _classPrivateFieldLooseKey('test');
export default class _Class2 {}
Object.defineProperty(_Class2, _test2, {
  writable: true,
  value: true,
});`,
      },
    ],
  },
  {
    title: 'private — regression T6719 (input)',
    source: `function withContext(ComposedComponent) {
    return class WithContext extends Component {

        static #propTypes = {
            context: PropTypes.shape(
                {
                    addCss: PropTypes.func,
                    setTitle: PropTypes.func,
                    setMeta: PropTypes.func,
                }
            ),
        };
    };
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `function withContext(ComposedComponent) {
  var _WithContext, _propTypes;
  return (
    (_WithContext = class WithContext extends Component {}),
    (_propTypes = {
      _: {
        context: PropTypes.shape({
          addCss: PropTypes.func,
          setTitle: PropTypes.func,
          setMeta: PropTypes.func,
        }),
      },
    }),
    _WithContext
  );
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
function withContext(ComposedComponent) {
  var _WithContext, _propTypes;
  return (
    (_propTypes = /* @__PURE__ */ _classPrivateFieldLooseKey('propTypes')),
    (_WithContext = class WithContext extends Component {}),
    Object.defineProperty(_WithContext, _propTypes, {
      writable: true,
      value: {
        context: PropTypes.shape({
          addCss: PropTypes.func,
          setTitle: PropTypes.func,
          setMeta: PropTypes.func,
        }),
      },
    }),
    _WithContext
  );
}`,
      },
    ],
  },
  {
    title: 'private — regression T7364 (input)',
    source: `class MyClass {
  #myAsyncMethod = async () => {
    console.log(this);
  }
}

(class MyClass2 {
  #myAsyncMethod = async () => {
    console.log(this);
  }
})

export default class MyClass3 {
  #myAsyncMethod = async () => {
    console.log(this);
  }
}
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `import _classPrivateFieldInitSpec from '@babel/runtime/helpers/classPrivateFieldInitSpec';
var _myAsyncMethod2;
var _myAsyncMethod = /* @__PURE__ */ new WeakMap();
class MyClass {
  constructor() {
    _classPrivateFieldInitSpec(this, _myAsyncMethod, async () => {
      console.log(this);
    });
  }
}
((_myAsyncMethod2 = /* @__PURE__ */ new WeakMap()),
  class MyClass2 {
    constructor() {
      _classPrivateFieldInitSpec(this, _myAsyncMethod2, async () => {
        console.log(this);
      });
    }
  });
var _myAsyncMethod3 = /* @__PURE__ */ new WeakMap();
export default class MyClass3 {
  constructor() {
    _classPrivateFieldInitSpec(this, _myAsyncMethod3, async () => {
      console.log(this);
    });
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';
var _myAsyncMethod2;
var _myAsyncMethod = /* @__PURE__ */ _classPrivateFieldLooseKey('myAsyncMethod');
class MyClass {
  constructor() {
    Object.defineProperty(this, _myAsyncMethod, {
      writable: true,
      value: async () => {
        console.log(this);
      },
    });
  }
}
((_myAsyncMethod2 = /* @__PURE__ */ _classPrivateFieldLooseKey('myAsyncMethod')),
  class MyClass2 {
    constructor() {
      Object.defineProperty(this, _myAsyncMethod2, {
        writable: true,
        value: async () => {
          console.log(this);
        },
      });
    }
  });
var _myAsyncMethod3 = /* @__PURE__ */ _classPrivateFieldLooseKey('myAsyncMethod');
export default class MyClass3 {
  constructor() {
    Object.defineProperty(this, _myAsyncMethod3, {
      writable: true,
      value: async () => {
        console.log(this);
      },
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private — static self field (exec)',
    source: `const f = class Foo {
  static #x = Foo;
  static y = Foo;

  static extract() {
    return {
      x: Foo.#x,
      y: Foo.y,
    }
  }
};

const { x, y } = f.extract();
expect(x).toBe(f)
expect(y).toBe(f)
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo, _x;
const f =
  ((_Foo = class Foo {
    static extract() {
      return {
        x: _assertClassBrand(_Foo, Foo, _x)._,
        y: Foo.y,
      };
    }
  }),
  (_x = { _: _Foo }),
  _defineProperty(_Foo, 'y', _Foo),
  _Foo);
const { x, y } = f.extract();
expect(x).toBe(f);
expect(y).toBe(f);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo, _x;
const f =
  ((_x = /* @__PURE__ */ _classPrivateFieldLooseKey('x')),
  (_Foo = class Foo {
    static extract() {
      return {
        x: _classPrivateFieldLooseBase(Foo, _x)[_x],
        y: Foo.y,
      };
    }
  }),
  Object.defineProperty(_Foo, _x, {
    writable: true,
    value: _Foo,
  }),
  (_Foo.y = _Foo),
  _Foo);
const { x, y } = f.extract();
expect(x).toBe(f);
expect(y).toBe(f);`,
      },
    ],
  },
  {
    title: 'private — static self field (input)',
    source: `const f = class Foo {
  static #x = Foo;
  static y = Foo;
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo, _x;
const f = ((_Foo = class Foo {}), (_x = { _: _Foo }), _defineProperty(_Foo, 'y', _Foo), _Foo);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _Foo, _x;
const f =
  ((_x = /* @__PURE__ */ _classPrivateFieldLooseKey('x')),
  (_Foo = class Foo {}),
  Object.defineProperty(_Foo, _x, {
    writable: true,
    value: _Foo,
  }),
  (_Foo.y = _Foo),
  _Foo);`,
      },
    ],
  },
  {
    title: 'private — static self method (exec)',
    source: `const f = class Foo {
  static #bar() {
    return Foo;
  }

  static #method() {
    return function inner() {
      return Foo;
    };
  }
  static #method_shadowed() {
    new Foo();
    return function inner() {
      let Foo = 3;
      return Foo;
    }
  }

  static extract() {
    return {
      bar: Foo.#bar,
      method: Foo.#method,
      method_shadowed: Foo.#method_shadowed
    }
  }
};

const { bar, method, method_shadowed } = f.extract();
expect(bar()).toBe(f)
expect(method()()).toBe(f)
expect(method_shadowed()()).toBe(3)
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
const f = (() => {
  'use strict';
  var _method_shadowed = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_method_shadowed',
  );
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_method');
  var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
  var _privateMethod23 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return Foo;
  };
  var _privateMethod22 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return function inner() {
      return Foo;
    };
  };
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    new Foo();
    return function inner() {
      let Foo = 3;
      return Foo;
    };
  };
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'extract', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return {
          bar: _classPrivateFieldLooseBase(Foo, _bar)[_bar],
          method: _classPrivateFieldLooseBase(Foo, _method)[_method],
          method_shadowed: _classPrivateFieldLooseBase(Foo, _method_shadowed)[_method_shadowed],
        };
      },
      'name',
      {
        value: 'extract',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  Object.defineProperty(Foo, _bar, { value: _privateMethod23 });
  Object.defineProperty(Foo, _method, { value: _privateMethod22 });
  Object.defineProperty(Foo, _method_shadowed, { value: _privateMethod });
  return Foo;
})();
const { bar, method, method_shadowed } = f.extract();
expect(bar()).toBe(f);
expect(method()()).toBe(f);
expect(method_shadowed()()).toBe(3);`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
    title: 'private — static self method (input)',
    source: `const f = class Foo {
  static #bar() {
    return Foo;
  }

  static #method() {
    return function inner() {
      return Foo;
    };
  }
  static #method_shadowed() {
    new Foo();
    return function inner() {
      let Foo = 3;
      return Foo;
    }
  }
}
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
const f = (() => {
  'use strict';
  var _method_shadowed = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_method_shadowed',
  );
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_method');
  var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
  var _privateMethod20 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return Foo;
  };
  var _privateMethod19 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return function inner() {
      return Foo;
    };
  };
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    new Foo();
    return function inner() {
      let Foo = 3;
      return Foo;
    };
  };
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  Object.defineProperty(Foo, _bar, { value: _privateMethod20 });
  Object.defineProperty(Foo, _method, { value: _privateMethod19 });
  Object.defineProperty(Foo, _method_shadowed, { value: _privateMethod });
  return Foo;
})();`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
    title: 'private — static (input)',
    source: `class Foo {
  static #bar = "foo";

  static test() {
    return Foo.#bar;
  }

  test() {
    return Foo.#bar;
  }
}

expect("bar" in Foo).toBe(false)
expect(Foo.test()).toBe("foo")
expect(Foo.test()).toBe("foo")
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `class Foo {
  static test() {
    return _bar._;
  }
  test() {
    return _bar._;
  }
}
var _bar = { _: 'foo' };
expect('bar' in Foo).toBe(false);
expect(Foo.test()).toBe('foo');
expect(Foo.test()).toBe('foo');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');
class Foo {
  static test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
  test() {
    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
  }
}
Object.defineProperty(Foo, _bar, {
  writable: true,
  value: 'foo',
});
expect('bar' in Foo).toBe(false);
expect(Foo.test()).toBe('foo');
expect(Foo.test()).toBe('foo');`,
      },
    ],
  },
  {
    title: 'private — super call (input)',
    source: `class A {
  foo() {
    return "bar";
  }
}

class B extends A {
  #foo = super.foo();
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
class A {
  foo() {
    return 'bar';
  }
}
var _foo = /* @__PURE__ */ new WeakMap();
class B extends A {
  constructor(..._args) {
    super(..._args);
    _classPrivateFieldInitSpec(this, _foo, super.foo());
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
class A {
  foo() {
    return 'bar';
  }
}
var _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');
class B extends A {
  constructor(..._args) {
    super(..._args);
    Object.defineProperty(this, _foo, {
      writable: true,
      value: super.foo(),
    });
  }
}`,
      },
    ],
  },
  {
    title: 'private — tagged template static (exec)',
    source: `class Foo {
    static #tag = function () { return this };

    static getReceiver() {
        return this.#tag\`\`;
    }
}
\x20\x20
expect(Foo.getReceiver()).toBe(Foo);`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class Foo {
  static getReceiver() {
    return _assertClassBrand(Foo, this, _tag)._.bind(this)\`\`;
  }
}
var _tag = {
  _: function () {
    return this;
  },
};
expect(Foo.getReceiver()).toBe(Foo);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _tag = /* @__PURE__ */ _classPrivateFieldLooseKey('tag');
class Foo {
  static getReceiver() {
    return _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
  }
}
Object.defineProperty(Foo, _tag, {
  writable: true,
  value: function () {
    return this;
  },
});
expect(Foo.getReceiver()).toBe(Foo);`,
      },
    ],
  },
  {
    title: 'private — tagged template static (input)',
    source: `class Foo {
    static #tag = function () { return this };

    static getReceiver() {
        return this.#tag\`\`;
    }
}
  `,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');
class Foo {
  static getReceiver() {
    return _assertClassBrand(Foo, this, _tag)._.bind(this)\`\`;
  }
}
var _tag = {
  _: function () {
    return this;
  },
};`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _tag = /* @__PURE__ */ _classPrivateFieldLooseKey('tag');
class Foo {
  static getReceiver() {
    return _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
  }
}
Object.defineProperty(Foo, _tag, {
  writable: true,
  value: function () {
    return this;
  },
});`,
      },
    ],
  },
  {
    title: 'private — tagged template (exec)',
    source: `class Foo {
    #tag() {
      return this;
    }
\x20\x20
    #tag2 = function() { return this; };

    constructor() {
      const receiver = this.#tag\`tagged template\`;
      expect(receiver).toBe(this);
\x20\x20
      const receiver2 = this.#tag2\`tagged template\`;
      expect(receiver2).toBe(this);
    }
}

  new Foo();`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Foo = (() => {
  'use strict';
  var _tag = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_tag');
  var _tag2 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_tag2');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return this;
  };
  function _initialize() {
    Object.defineProperty(this, _tag, { value: _privateMethod });
    Object.defineProperty(this, _tag2, {
      writable: true,
      value: function () {
        return this;
      },
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    const receiver = _classPrivateFieldLooseBase(this, _tag)[_tag]\`tagged template\`;
    expect(receiver).toBe(this);
    const receiver2 = _classPrivateFieldLooseBase(this, _tag2)[_tag2]\`tagged template\`;
    expect(receiver2).toBe(this);
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
new Foo();`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
    title: 'private — tagged template (input)',
    source: `class Foo {
  #tag;

  test() {
    this.#tag\`\`;
  }
}

new Foo();`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
var _tag = /* @__PURE__ */ new WeakMap();
class Foo {
  constructor() {
    _classPrivateFieldInitSpec(this, _tag, void 0);
  }
  test() {
    _classPrivateFieldGet(_tag, this).bind(this)\`\`;
  }
}
new Foo();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
var _tag = /* @__PURE__ */ _classPrivateFieldLooseKey('tag');
class Foo {
  constructor() {
    Object.defineProperty(this, _tag, {
      writable: true,
      value: void 0,
    });
  }
  test() {
    _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
  }
}
new Foo();`,
      },
    ],
  },
  {
    title: 'public loose — arrow static this without transform (input)',
    source: `class Foo {
  static fn = () => console.log(this);
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Foo;
class Foo {}
_Foo = Foo;
_defineProperty(Foo, 'fn', () => console.log(_Foo));`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _Foo;
class Foo {}
_Foo = Foo;
Foo.fn = () => console.log(_Foo);`,
      },
    ],
  },
  {
    title: 'public loose — arrow this without transform (input)',
    source: `class Foo {
  fn = () => console.log(this);
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'fn', () => console.log(this));
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.fn = () => console.log(this);
  }
}`,
      },
    ],
  },
  {
    title: 'public loose — class shadow builtins (input)',
    source: `export class TypeError {
  message
}
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `import _defineProperty from '@babel/runtime/helpers/defineProperty';
export class TypeError {
  constructor() {
    _defineProperty(this, 'message', void 0);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `export class TypeError {
  constructor() {
    this.message = void 0;
  }
}`,
      },
    ],
  },
  {
    title: 'public — assignment (input)',
    source: `class Foo {
  foo = 0;

  test(other) {
    this.foo++;
    this.foo += 1;
    this.foo = 2;
    other.obj.foo++;
    other.obj.foo += 1;
    other.obj.foo = 2;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'foo', 0);
  }
  test(other) {
    this.foo++;
    this.foo += 1;
    this.foo = 2;
    other.obj.foo++;
    other.obj.foo += 1;
    other.obj.foo = 2;
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.foo = 0;
  }
  test(other) {
    this.foo++;
    this.foo += 1;
    this.foo = 2;
    other.obj.foo++;
    other.obj.foo += 1;
    other.obj.foo = 2;
  }
}`,
      },
    ],
  },
  {
    title: 'public — call (exec)',
    source: `class Foo {
  foo = function() {
    return this;
  }

  test(other) {
    return [this.foo(), other.foo()];
  }
}

const f = new Foo;
const o = new Foo;
const test = f.test(o);
expect(test[0]).toBe(f);
expect(test[1]).toBe(o);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'foo', function () {
      return this;
    });
  }
  test(other) {
    return [this.foo(), other.foo()];
  }
}
const f = new Foo();
const o = new Foo();
const test = f.test(o);
expect(test[0]).toBe(f);
expect(test[1]).toBe(o);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.foo = function () {
      return this;
    };
  }
  test(other) {
    return [this.foo(), other.foo()];
  }
}
const f = new Foo();
const o = new Foo();
const test = f.test(o);
expect(test[0]).toBe(f);
expect(test[1]).toBe(o);`,
      },
    ],
  },
  {
    title: 'public — call (input)',
    source: `class Foo {
  foo = function() {
    return this;
  }

  test(other) {
    this.foo();
    other.obj.foo();
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'foo', function () {
      return this;
    });
  }
  test(other) {
    this.foo();
    other.obj.foo();
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.foo = function () {
      return this;
    };
  }
  test(other) {
    this.foo();
    other.obj.foo();
  }
}`,
      },
    ],
  },
  {
    title: 'public — computed toPrimitive (exec)',
    source: `const foo = { [Symbol.toPrimitive]: () => "foo" };

expect((class { static [foo] = 0 }).foo).toBe(0);
expect((class { static [foo](){ return 0; } }).foo()).toBe(0);
expect((class { static get [foo](){ return 0; } }).foo).toBe(0);
expect((class { static set [foo](v){ return v; } }).foo = 0).toBe(0);

expect((new class { [foo] = 0 }).foo).toBe(0);

const arrayLike = { [Symbol.toPrimitive] : () => [] };

expect(() => class { static [arrayLike] = 0 }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => class { static [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => class { static get [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => class { static set [arrayLike](v){ return v; } }).toThrow("@@toPrimitive must return a primitive value.");

expect(() => new class { [arrayLike] = 0 }).toThrow("@@toPrimitive must return a primitive value.");
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Class;
const foo = { [Symbol.toPrimitive]: () => 'foo' };
expect(((_Class = class {}), _defineProperty(_Class, foo, 0), _Class).foo).toBe(0);
expect(
  class {
    static [foo]() {
      return 0;
    }
  }.foo(),
).toBe(0);
expect(
  class {
    static get [foo]() {
      return 0;
    }
  }.foo,
).toBe(0);
expect(
  (class {
    static set [foo](v) {
      return v;
    }
  }.foo = 0),
).toBe(0);
expect(
  new (class {
    constructor() {
      _defineProperty(this, foo, 0);
    }
  })().foo,
).toBe(0);
const arrayLike = { [Symbol.toPrimitive]: () => [] };
expect(() => {
  var _Class2;
  return ((_Class2 = class {}), _defineProperty(_Class2, arrayLike, 0), _Class2);
}).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static [arrayLike]() {
        return 0;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static get [arrayLike]() {
        return 0;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static set [arrayLike](v) {
        return v;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    new (class {
      constructor() {
        _defineProperty(this, arrayLike, 0);
      }
    })(),
).toThrow('@@toPrimitive must return a primitive value.');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _Class;
const foo = { [Symbol.toPrimitive]: () => 'foo' };
expect(((_Class = class {}), (_Class[foo] = 0), _Class).foo).toBe(0);
expect(
  class {
    static [foo]() {
      return 0;
    }
  }.foo(),
).toBe(0);
expect(
  class {
    static get [foo]() {
      return 0;
    }
  }.foo,
).toBe(0);
expect(
  (class {
    static set [foo](v) {
      return v;
    }
  }.foo = 0),
).toBe(0);
expect(
  new (class {
    constructor() {
      this[foo] = 0;
    }
  })().foo,
).toBe(0);
const arrayLike = { [Symbol.toPrimitive]: () => [] };
expect(() => {
  var _Class2;
  return ((_Class2 = class {}), (_Class2[arrayLike] = 0), _Class2);
}).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static [arrayLike]() {
        return 0;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static get [arrayLike]() {
        return 0;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static set [arrayLike](v) {
        return v;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    new (class {
      constructor() {
        this[arrayLike] = 0;
      }
    })(),
).toThrow('@@toPrimitive must return a primitive value.');`,
      },
    ],
  },
  {
    title: 'public — computed toPrimitive (input)',
    source: `const foo = { [Symbol.toPrimitive]: () => "foo" };

expect((class { static [foo] = 0 }).foo).toBe(0);
expect((class { static [foo](){ return 0; } }).foo()).toBe(0);
expect((class { static get [foo](){ return 0; } }).foo).toBe(0);
expect((class { static set [foo](v){ return v; } }).foo = 0).toBe(0);

expect((new class { [foo] = 0 }).foo).toBe(0);

const arrayLike = { [Symbol.toPrimitive] : () => [] };

expect(() => class { static [arrayLike] = 0 }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => class { static [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => class { static get [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => class { static set [arrayLike](v){ return v; } }).toThrow("@@toPrimitive must return a primitive value.");

expect(() => new class { [arrayLike] = 0 }).toThrow("@@toPrimitive must return a primitive value.");
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _Class;
const foo = { [Symbol.toPrimitive]: () => 'foo' };
expect(((_Class = class {}), _defineProperty(_Class, foo, 0), _Class).foo).toBe(0);
expect(
  class {
    static [foo]() {
      return 0;
    }
  }.foo(),
).toBe(0);
expect(
  class {
    static get [foo]() {
      return 0;
    }
  }.foo,
).toBe(0);
expect(
  (class {
    static set [foo](v) {
      return v;
    }
  }.foo = 0),
).toBe(0);
expect(
  new (class {
    constructor() {
      _defineProperty(this, foo, 0);
    }
  })().foo,
).toBe(0);
const arrayLike = { [Symbol.toPrimitive]: () => [] };
expect(() => {
  var _Class2;
  return ((_Class2 = class {}), _defineProperty(_Class2, arrayLike, 0), _Class2);
}).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static [arrayLike]() {
        return 0;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static get [arrayLike]() {
        return 0;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static set [arrayLike](v) {
        return v;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    new (class {
      constructor() {
        _defineProperty(this, arrayLike, 0);
      }
    })(),
).toThrow('@@toPrimitive must return a primitive value.');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
            legacyDecorators: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _Class;
const foo = { [Symbol.toPrimitive]: () => 'foo' };
expect(((_Class = class {}), (_Class[foo] = 0), _Class).foo).toBe(0);
expect(
  class {
    static [foo]() {
      return 0;
    }
  }.foo(),
).toBe(0);
expect(
  class {
    static get [foo]() {
      return 0;
    }
  }.foo,
).toBe(0);
expect(
  (class {
    static set [foo](v) {
      return v;
    }
  }.foo = 0),
).toBe(0);
expect(
  new (class {
    constructor() {
      this[foo] = 0;
    }
  })().foo,
).toBe(0);
const arrayLike = { [Symbol.toPrimitive]: () => [] };
expect(() => {
  var _Class2;
  return ((_Class2 = class {}), (_Class2[arrayLike] = 0), _Class2);
}).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static [arrayLike]() {
        return 0;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static get [arrayLike]() {
        return 0;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    class {
      static set [arrayLike](v) {
        return v;
      }
    },
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    new (class {
      constructor() {
        this[arrayLike] = 0;
      }
    })(),
).toThrow('@@toPrimitive must return a primitive value.');`,
      },
    ],
  },
  {
    title: 'public — computed without block (exec)',
    source: `const createClass = (k) => class { [k()] = 2 };

const clazz = createClass(() => 'foo');
const instance = new clazz();
expect(instance.foo).toBe(2);`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
const createClass = k => {
  let _k;
  return (
    (_k = k()),
    class {
      constructor() {
        _defineProperty(this, _k, 2);
      }
    }
  );
};
const clazz = createClass(() => 'foo');
const instance = new clazz();
expect(instance.foo).toBe(2);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `const createClass = k => {
  let _k;
  return (
    (_k = k()),
    class {
      constructor() {
        this[_k] = 2;
      }
    }
  );
};
const clazz = createClass(() => 'foo');
const instance = new clazz();
expect(instance.foo).toBe(2);`,
      },
    ],
  },
  {
    title: 'public — computed without block (input)',
    source: `const createClass = (k) => class { [k()] = 2 };
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
const createClass = k => {
  let _k;
  return (
    (_k = k()),
    class {
      constructor() {
        _defineProperty(this, _k, 2);
      }
    }
  );
};`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `const createClass = k => {
  let _k;
  return (
    (_k = k()),
    class {
      constructor() {
        this[_k] = 2;
      }
    }
  );
};`,
      },
    ],
  },
  {
    title: 'public — delete super property (exec)',
    source: `expect(() => {
  new class { y = delete super.x; };
}).toThrow(ReferenceError);

expect(() => {
  new class { y = delete super[0]; };
}).toThrow(ReferenceError);

expect(() => {
  class X1 { static y = delete super.x; }
}).toThrow(ReferenceError);

expect(() => {
  class X2 { static y = delete super[0]; }
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _superPropGet = require('@babel/runtime/helpers/superPropGet');
expect(() => {
  new (class {
    constructor() {
      _defineProperty(this, 'y', delete super.x);
    }
  })();
}).toThrow(ReferenceError);
expect(() => {
  new (class {
    constructor() {
      _defineProperty(this, 'y', delete super[0]);
    }
  })();
}).toThrow(ReferenceError);
expect(() => {
  var _X;
  class X1 {}
  _X = X1;
  _defineProperty(X1, 'y', delete _superPropGet(_X, 'x', _X));
}).toThrow(ReferenceError);
expect(() => {
  var _X2;
  class X2 {}
  _X2 = X2;
  _defineProperty(X2, 'y', delete _superPropGet(_X2, 0, _X2));
}).toThrow(ReferenceError);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `expect(() => {
  new (class {
    constructor() {
      this.y = delete super.x;
    }
  })();
}).toThrow(ReferenceError);
expect(() => {
  new (class {
    constructor() {
      this.y = delete super[0];
    }
  })();
}).toThrow(ReferenceError);
expect(() => {
  var _X;
  class X1 {}
  _X = X1;
  X1.y = delete Object.getPrototypeOf(_X).x;
}).toThrow(ReferenceError);
expect(() => {
  var _X2;
  class X2 {}
  _X2 = X2;
  X2.y = delete Object.getPrototypeOf(_X2)[0];
}).toThrow(ReferenceError);`,
      },
    ],
  },
  {
    title: 'public — delete super property (input)',
    source: `new class { y = delete super.x; };

new class { y = delete super[0]; };

class X1 { static y = delete super.x; }

class X2 { static y = delete super[0]; }
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _superPropGet = require('@babel/runtime/helpers/superPropGet');
var _X, _X2;
new (class {
  constructor() {
    _defineProperty(this, 'y', delete super.x);
  }
})();
new (class {
  constructor() {
    _defineProperty(this, 'y', delete super[0]);
  }
})();
class X1 {}
_X = X1;
_defineProperty(X1, 'y', delete _superPropGet(_X, 'x', _X));
class X2 {}
_X2 = X2;
_defineProperty(X2, 'y', delete _superPropGet(_X2, 0, _X2));`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _X, _X2;
new (class {
  constructor() {
    this.y = delete super.x;
  }
})();
new (class {
  constructor() {
    this.y = delete super[0];
  }
})();
class X1 {}
_X = X1;
X1.y = delete Object.getPrototypeOf(_X).x;
class X2 {}
_X2 = X2;
X2.y = delete Object.getPrototypeOf(_X2)[0];`,
      },
    ],
  },
  {
    title: 'public — delete this (exec)',
    source: `class Foo {
  x = delete this;
  static x = delete this;
}

expect(new Foo().x).toBe(true);
expect(Foo.x).toBe(true);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'x', delete this);
  }
}
_defineProperty(Foo, 'x', true);
expect(new Foo().x).toBe(true);
expect(Foo.x).toBe(true);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.x = delete this;
  }
}
Foo.x = true;
expect(new Foo().x).toBe(true);
expect(Foo.x).toBe(true);`,
      },
    ],
  },
  {
    title: 'public — delete this (input)',
    source: `class Foo {
  x = delete this;
  static x = delete this;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'x', delete this);
  }
}
_defineProperty(Foo, 'x', true);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.x = delete this;
  }
}
Foo.x = true;`,
      },
    ],
  },
  {
    title: 'public — derived multiple supers (input)',
    source: `class Foo extends Bar {
  bar = "foo";

  constructor() {
    if (condition) {
      super();
    } else {
      super();
    }
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo extends Bar {
  constructor() {
    var _super = (..._args) => (super(..._args), _defineProperty(this, 'bar', 'foo'), this);
    if (condition) {
      _super();
    } else {
      _super();
    }
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo extends Bar {
  constructor() {
    var _super = (..._args) => (super(..._args), (this.bar = 'foo'), this);
    if (condition) {
      _super();
    } else {
      _super();
    }
  }
}`,
      },
    ],
  },
  {
    title: 'public — derived super in default params complex (input)',
    source: `class Foo extends Bar {
  bar = "foo";

  constructor(x = test ? super() : 0) {
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _super = function () {
  'use strict';
  _defineProperty(this, 'bar', 'foo');
  return this;
};
class Foo extends Bar {
  constructor(x = test ? _super.call(super()) : 0) {}
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _super = function () {
  'use strict';
  this.bar = 'foo';
  return this;
};
class Foo extends Bar {
  constructor(x = test ? _super.call(super()) : 0) {}
}`,
      },
    ],
  },
  {
    title: 'public — derived super in default params in arrow (input)',
    source: `class Foo extends Bar {
  bar = "foo";

  constructor(x = () => { check(super()) }) {
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _super = function () {
  'use strict';
  _defineProperty(this, 'bar', 'foo');
  return this;
};
class Foo extends Bar {
  constructor(
    x = () => {
      check(_super.call(super()));
    },
  ) {}
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _super = function () {
  'use strict';
  this.bar = 'foo';
  return this;
};
class Foo extends Bar {
  constructor(
    x = () => {
      check(_super.call(super()));
    },
  ) {}
}`,
      },
    ],
  },
  {
    title: 'public — derived super in default params (input)',
    source: `class Foo extends Bar {
  bar = "foo";

  constructor(x = super()) {
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _super = function () {
  'use strict';
  _defineProperty(this, 'bar', 'foo');
  return this;
};
class Foo extends Bar {
  constructor(x = _super.call(super())) {}
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _super = function () {
  'use strict';
  this.bar = 'foo';
  return this;
};
class Foo extends Bar {
  constructor(x = _super.call(super())) {}
}`,
      },
    ],
  },
  {
    title: 'public — extracted this (input)',
    source: `var foo = "bar";

class Foo {
  bar = this;
  baz = foo;

  constructor(foo) {
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var foo = 'bar';
class Foo {
  constructor(_foo) {
    _defineProperty(this, 'bar', this);
    _defineProperty(this, 'baz', foo);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var foo = 'bar';
class Foo {
  constructor(_foo) {
    this.bar = this;
    this.baz = foo;
  }
}`,
      },
    ],
  },
  {
    title: 'public — native classes (exec)',
    source: `class Foo {
  static foo = "foo";
  bar = "bar";

  static test() {
    return Foo.foo;
  }

  test() {
    return this.bar;
  }
}

const f = new Foo();
expect("foo" in Foo).toBe(true)
expect("bar" in f).toBe(true)
expect(Foo.test()).toBe("foo")
expect(f.test()).toBe("bar")
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'bar', 'bar');
  }
  static test() {
    return Foo.foo;
  }
  test() {
    return this.bar;
  }
}
_defineProperty(Foo, 'foo', 'foo');
const f = new Foo();
expect('foo' in Foo).toBe(true);
expect('bar' in f).toBe(true);
expect(Foo.test()).toBe('foo');
expect(f.test()).toBe('bar');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.bar = 'bar';
  }
  static test() {
    return Foo.foo;
  }
  test() {
    return this.bar;
  }
}
Foo.foo = 'foo';
const f = new Foo();
expect('foo' in Foo).toBe(true);
expect('bar' in f).toBe(true);
expect(Foo.test()).toBe('foo');
expect(f.test()).toBe('bar');`,
      },
    ],
  },
  {
    title: 'public — native classes (input)',
    source: `class Foo {
  static foo = "foo";
  bar = "bar";
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'bar', 'bar');
  }
}
_defineProperty(Foo, 'foo', 'foo');`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.bar = 'bar';
  }
}
Foo.foo = 'foo';`,
      },
    ],
  },
  {
    title: 'public — numeric (input)',
    source: `class Foo {
  0 = "foo";
  1 = "bar";
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 0, 'foo');
    _defineProperty(this, 1, 'bar');
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this[0] = 'foo';
    this[1] = 'bar';
  }
}`,
      },
    ],
  },
  {
    title: 'public — super destructuring array pattern 1 (input)',
    source: `class Foo {
  constructor(props) {
    ;([x, ...super.client] = props);
  }
}`,
    filename: 'input.js',
    output: `class Foo {
  constructor(props) {
    [x, ...super.client] = props;
  }
}`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
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
    title: 'public — super destructuring array pattern (input)',
    source: `class Foo {
  constructor(props) {
    ;([super.client] = props);
  }
}
`,
    filename: 'input.js',
    output: `class Foo {
  constructor(props) {
    [super.client] = props;
  }
}`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
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
    title: 'public — super destructuring object pattern 1 (input)',
    source: `class Foo {
  constructor(props) {
    ;({ x, ...super.client } = props)
  }
}`,
    filename: 'input.js',
    output: `class Foo {
  constructor(props) {
    ({ x, ...super.client } = props);
  }
}`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
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
    title: 'public — super destructuring object pattern (input)',
    source: `class Foo {
  constructor(props) {
    ;({ client: super.client } = props)
  }
}`,
    filename: 'input.js',
    output: `class Foo {
  constructor(props) {
    ({ client: super.client } = props);
  }
}`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
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
    title: 'public — update (exec)',
    source: `class Foo {
  foo = 0;

  test(other) {
    return [
      this.foo++,
      this.foo,
      ++this.foo,
      this.foo,
      other.obj.foo++,
      other.obj.foo,
      ++other.obj.foo,
      other.obj.foo,
    ];
  }
}

const f = new Foo;
const results = f.test({ obj: f });
expect(results[0]).toBe(0);
expect(results[1]).toBe(1);
expect(results[2]).toBe(2);
expect(results[3]).toBe(2);
expect(results[4]).toBe(2);
expect(results[5]).toBe(3);
expect(results[6]).toBe(4);
expect(results[7]).toBe(4);
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'foo', 0);
  }
  test(other) {
    return [
      this.foo++,
      this.foo,
      ++this.foo,
      this.foo,
      other.obj.foo++,
      other.obj.foo,
      ++other.obj.foo,
      other.obj.foo,
    ];
  }
}
const f = new Foo();
const results = f.test({ obj: f });
expect(results[0]).toBe(0);
expect(results[1]).toBe(1);
expect(results[2]).toBe(2);
expect(results[3]).toBe(2);
expect(results[4]).toBe(2);
expect(results[5]).toBe(3);
expect(results[6]).toBe(4);
expect(results[7]).toBe(4);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.foo = 0;
  }
  test(other) {
    return [
      this.foo++,
      this.foo,
      ++this.foo,
      this.foo,
      other.obj.foo++,
      other.obj.foo,
      ++other.obj.foo,
      other.obj.foo,
    ];
  }
}
const f = new Foo();
const results = f.test({ obj: f });
expect(results[0]).toBe(0);
expect(results[1]).toBe(1);
expect(results[2]).toBe(2);
expect(results[3]).toBe(2);
expect(results[4]).toBe(2);
expect(results[5]).toBe(3);
expect(results[6]).toBe(4);
expect(results[7]).toBe(4);`,
      },
    ],
  },
  {
    title: 'public — update (input)',
    source: `class Foo {
  foo = 0;

  test(other) {
    this.foo++;
    ++this.foo;
    other.obj.foo++;
    ++other.obj.foo;
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class Foo {
  constructor() {
    _defineProperty(this, 'foo', 0);
  }
  test(other) {
    this.foo++;
    ++this.foo;
    other.obj.foo++;
    ++other.obj.foo;
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Foo {
  constructor() {
    this.foo = 0;
  }
  test(other) {
    this.foo++;
    ++this.foo;
    other.obj.foo++;
    ++other.obj.foo;
  }
}`,
      },
    ],
  },
  {
    title: 'regression — 15098 (exec)',
    source: `expect(() => {
  class X { [0 in 0]; }
}).toThrow();

expect(() => {
  class X { [0 instanceof 0]; }
}).toThrow();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
expect(() => {
  let _ref;
  _ref = 0 in 0;
  class X {
    constructor() {
      _defineProperty(this, _ref, void 0);
    }
  }
}).toThrow();
expect(() => {
  let _ref2;
  _ref2 = 0 instanceof 0;
  class X {
    constructor() {
      _defineProperty(this, _ref2, void 0);
    }
  }
}).toThrow();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `expect(() => {
  let _ref;
  _ref = 0 in 0;
  class X {
    constructor() {
      this[_ref] = void 0;
    }
  }
}).toThrow();
expect(() => {
  let _ref2;
  _ref2 = 0 instanceof 0;
  class X {
    constructor() {
      this[_ref2] = void 0;
    }
  }
}).toThrow();`,
      },
    ],
  },
  {
    title: 'regression — 15098 (input)',
    source: `class X {
  [ 0 in 0 ];
  [ 0 instanceof 0 ];
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
let _ref, _ref2;
_ref = 0 in 0;
_ref2 = 0 instanceof 0;
class X {
  constructor() {
    _defineProperty(this, _ref, void 0);
    _defineProperty(this, _ref2, void 0);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `let _ref, _ref2;
_ref = 0 in 0;
_ref2 = 0 instanceof 0;
class X {
  constructor() {
    this[_ref] = void 0;
    this[_ref2] = void 0;
  }
}`,
      },
    ],
  },
  {
    title: 'regression — 6153 (input)',
    source: `() => {
  class Foo {
    fn = () => console.log(this);
    static fn = () => console.log(this);
  }
};

() => class Bar {
  fn = () => console.log(this);
  static fn = () => console.log(this);
};

() => {
  class Baz {
    fn = () => console.log(this);
    force = force
    static fn = () => console.log(this);

    constructor(force) {}
  }
};

var qux = function() {
  class Qux {
    fn = () => console.log(this);
    static fn = () => console.log(this);
  }
}.bind(this)
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
() => {
  var _Foo;
  class Foo {
    constructor() {
      _defineProperty(this, 'fn', () => console.log(this));
    }
  }
  _Foo = Foo;
  _defineProperty(Foo, 'fn', () => console.log(_Foo));
};
() => {
  var _Bar;
  return (
    (_Bar = class Bar {
      constructor() {
        _defineProperty(this, 'fn', () => console.log(this));
      }
    }),
    _defineProperty(_Bar, 'fn', () => console.log(_Bar)),
    _Bar
  );
};
() => {
  var _Baz;
  class Baz {
    constructor(_force) {
      _defineProperty(this, 'fn', () => console.log(this));
      _defineProperty(this, 'force', force);
    }
  }
  _Baz = Baz;
  _defineProperty(Baz, 'fn', () => console.log(_Baz));
};
var qux = function () {
  var _Qux;
  class Qux {
    constructor() {
      _defineProperty(this, 'fn', () => console.log(this));
    }
  }
  _Qux = Qux;
  _defineProperty(Qux, 'fn', () => console.log(_Qux));
}.bind(this);`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `() => {
  var _Foo;
  class Foo {
    constructor() {
      this.fn = () => console.log(this);
    }
  }
  _Foo = Foo;
  Foo.fn = () => console.log(_Foo);
};
() => {
  var _Bar;
  return (
    (_Bar = class Bar {
      constructor() {
        this.fn = () => console.log(this);
      }
    }),
    (_Bar.fn = () => console.log(_Bar)),
    _Bar
  );
};
() => {
  var _Baz;
  class Baz {
    constructor(_force) {
      this.fn = () => console.log(this);
      this.force = force;
    }
  }
  _Baz = Baz;
  Baz.fn = () => console.log(_Baz);
};
var qux = function () {
  var _Qux;
  class Qux {
    constructor() {
      this.fn = () => console.log(this);
    }
  }
  _Qux = Qux;
  Qux.fn = () => console.log(_Qux);
}.bind(this);`,
      },
    ],
  },
  {
    title: 'regression — 6154 (input)',
    source: `class Test {
  constructor() {
    class Other extends Test {
      a = () => super.test;
      static a = () => super.test;
    }
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _superPropGet = require('@babel/runtime/helpers/superPropGet');
class Test {
  constructor() {
    var _Other;
    class Other extends Test {
      constructor(..._args) {
        super(..._args);
        _defineProperty(this, 'a', () => super.test);
      }
    }
    _Other = Other;
    _defineProperty(Other, 'a', () => _superPropGet(_Other, 'test', _Other));
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class Test {
  constructor() {
    var _Other;
    class Other extends Test {
      constructor(..._args) {
        super(..._args);
        this.a = () => super.test;
      }
    }
    _Other = Other;
    Other.a = () => Object.getPrototypeOf(_Other).test;
  }
}`,
      },
    ],
  },
  {
    title: 'regression — 7371 (exec)',
    source: `"use strict";
class C {
}

class A extends C {
  field = 1;

  constructor() {
    super();

    class B extends C {
      constructor() {
        super();

        expect(this.field).toBeUndefined();
      }
    }

    expect(this.field).toBe(1)

    new B();
  }
}

new A();

class Obj {
  constructor() {
    return {};
  }
}

// ensure superClass is still transformed
class SuperClass extends Obj {
  field = 1;

  constructor() {
    class B extends (super(), Obj) {
      constructor() {
        super();

        expect(this.field).toBeUndefined()
      }
    }

    expect(this.field).toBe(1)

    new B();
  }
}

new SuperClass();

// ensure ComputedKey Method is still transformed
class ComputedMethod extends Obj {
  field = 1;

  constructor() {
    class B extends Obj {
      constructor() {
        super();

        expect(this.field).toBeUndefined()
      }

      [super()]() { }
    }

    expect(this.field).toBe(1)

    new B();
  }
}

new ComputedMethod();


// ensure ComputedKey Field is still transformed
class ComputedField extends Obj {
  field = 1;

  constructor() {
    class B extends Obj {
      constructor() {
        super();

        expect(this.field).toBeUndefined()
      }

      [super()] = 1;
    }

    expect(this.field).toBe(1)

    new B();
  }
}

new ComputedField();
`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class C {}
class A extends C {
  constructor() {
    super();
    _defineProperty(this, 'field', 1);
    class B extends C {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new A();
class Obj {
  constructor() {
    return {};
  }
}
// ensure superClass is still transformed
class SuperClass extends Obj {
  constructor() {
    var _super = (..._args) => (super(..._args), _defineProperty(this, 'field', 1), this);
    class B extends (_super(), Obj) {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new SuperClass();
// ensure ComputedKey Method is still transformed
class ComputedMethod extends Obj {
  constructor() {
    var _super2 = (..._args2) => (super(..._args2), _defineProperty(this, 'field', 1), this);
    class B extends Obj {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
      [_super2()]() {}
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new ComputedMethod();
// ensure ComputedKey Field is still transformed
class ComputedField extends Obj {
  constructor() {
    let _super4;
    var _super3 = (..._args3) => (super(..._args3), _defineProperty(this, 'field', 1), this);
    _super4 = _super3();
    class B extends Obj {
      constructor() {
        super();
        _defineProperty(this, _super4, 1);
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new ComputedField();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
class C {}
class A extends C {
  constructor() {
    super();
    this.field = 1;
    class B extends C {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new A();
class Obj {
  constructor() {
    return {};
  }
}
// ensure superClass is still transformed
class SuperClass extends Obj {
  constructor() {
    var _super = (..._args) => (super(..._args), (this.field = 1), this);
    class B extends (_super(), Obj) {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new SuperClass();
// ensure ComputedKey Method is still transformed
class ComputedMethod extends Obj {
  constructor() {
    var _super2 = (..._args2) => (super(..._args2), (this.field = 1), this);
    class B extends Obj {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
      [_super2()]() {}
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new ComputedMethod();
// ensure ComputedKey Field is still transformed
class ComputedField extends Obj {
  constructor() {
    let _super4;
    var _super3 = (..._args3) => (super(..._args3), (this.field = 1), this);
    _super4 = _super3();
    class B extends Obj {
      constructor() {
        super();
        this[_super4] = 1;
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new ComputedField();`,
      },
    ],
  },
  {
    title: 'regression — 7371 (input)',
    source: `"use strict";
class C {
}

class A extends C {
  field = 1;

  constructor() {
    super();

    class B extends C {
      constructor() {
        super();

        expect(this.field).toBeUndefined();
      }
    }

    expect(this.field).toBe(1)

    new B();
  }
}

new A();

class Obj {
  constructor() {
    return {};
  }
}

// ensure superClass is still transformed
class SuperClass extends Obj {
  field = 1;

  constructor() {
    class B extends (super(), Obj) {
      constructor() {
        super();

        expect(this.field).toBeUndefined()
      }
    }

    expect(this.field).toBe(1)

    new B();
  }
}

new SuperClass();

// ensure ComputedKey Method is still transformed
class ComputedMethod extends Obj {
  field = 1;

  constructor() {
    class B extends Obj {
      constructor() {
        super();

        expect(this.field).toBeUndefined()
      }

      [super()]() { }
    }

    expect(this.field).toBe(1)

    new B();
  }
}

new ComputedMethod();


// ensure ComputedKey Field is still transformed
class ComputedField extends Obj {
  field = 1;

  constructor() {
    class B extends Obj {
      constructor() {
        super();

        expect(this.field).toBeUndefined()
      }

      [super()] = 1;
    }

    expect(this.field).toBe(1)

    new B();
  }
}

new ComputedField();
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class C {}
class A extends C {
  constructor() {
    super();
    _defineProperty(this, 'field', 1);
    class B extends C {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new A();
class Obj {
  constructor() {
    return {};
  }
}
// ensure superClass is still transformed
class SuperClass extends Obj {
  constructor() {
    var _super = (..._args) => (super(..._args), _defineProperty(this, 'field', 1), this);
    class B extends (_super(), Obj) {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new SuperClass();
// ensure ComputedKey Method is still transformed
class ComputedMethod extends Obj {
  constructor() {
    var _super2 = (..._args2) => (super(..._args2), _defineProperty(this, 'field', 1), this);
    class B extends Obj {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
      [_super2()]() {}
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new ComputedMethod();
// ensure ComputedKey Field is still transformed
class ComputedField extends Obj {
  constructor() {
    let _super4;
    var _super3 = (..._args3) => (super(..._args3), _defineProperty(this, 'field', 1), this);
    _super4 = _super3();
    class B extends Obj {
      constructor() {
        super();
        _defineProperty(this, _super4, 1);
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new ComputedField();`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `'use strict';
class C {}
class A extends C {
  constructor() {
    super();
    this.field = 1;
    class B extends C {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new A();
class Obj {
  constructor() {
    return {};
  }
}
// ensure superClass is still transformed
class SuperClass extends Obj {
  constructor() {
    var _super = (..._args) => (super(..._args), (this.field = 1), this);
    class B extends (_super(), Obj) {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new SuperClass();
// ensure ComputedKey Method is still transformed
class ComputedMethod extends Obj {
  constructor() {
    var _super2 = (..._args2) => (super(..._args2), (this.field = 1), this);
    class B extends Obj {
      constructor() {
        super();
        expect(this.field).toBeUndefined();
      }
      [_super2()]() {}
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new ComputedMethod();
// ensure ComputedKey Field is still transformed
class ComputedField extends Obj {
  constructor() {
    let _super4;
    var _super3 = (..._args3) => (super(..._args3), (this.field = 1), this);
    _super4 = _super3();
    class B extends Obj {
      constructor() {
        super();
        this[_super4] = 1;
        expect(this.field).toBeUndefined();
      }
    }
    expect(this.field).toBe(1);
    new B();
  }
}
new ComputedField();`,
      },
    ],
  },
  {
    title: 'regression — 7951 (input)',
    source: `export class Foo extends Bar {
  static foo = {};

  test = args;
}
`,
    filename: 'input.mjs',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `import _defineProperty from '@babel/runtime/helpers/defineProperty';
export class Foo extends Bar {
  constructor(..._args) {
    super(..._args);
    _defineProperty(this, 'test', args);
  }
}
_defineProperty(Foo, 'foo', {});`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `export class Foo extends Bar {
  constructor(..._args) {
    super(..._args);
    this.test = args;
  }
}
Foo.foo = {};`,
      },
    ],
  },
  {
    title: 'regression — 8110 (input)',
    source: `const field = Symbol('field');

class A {
  [field] = 10;
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
const field = Symbol('field');
class A {
  constructor() {
    _defineProperty(this, field, 10);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `const field = Symbol('field');
class A {
  constructor() {
    this[field] = 10;
  }
}`,
      },
    ],
  },
  {
    title: 'regression — 8882 (exec)',
    source: `const classes = [];
for (let i = 0; i <= 10; ++i) {
  classes.push(
    class A {
      [i] = \`computed field \${i}\`;
      static foo = \`static field \${i}\`;
      #bar = \`private field \${i}\`;
      getBar() {
        return this.#bar;
      }
    }
  );
}

for(let i=0; i<= 10; ++i) {
  const clazz = classes[i];
  expect(clazz.foo).toBe('static field ' + i);
\x20\x20
  const instance = new clazz();
  expect(Object.getOwnPropertyNames(instance)).toEqual([String(i)])
  expect(instance[i]).toBe('computed field ' + i);
  expect(instance.getBar()).toBe('private field ' + i);
}`,
    filename: 'exec.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
const classes = [];
for (let i = 0; i <= 10; ++i) {
  var _A, _bar;
  let _i;
  classes.push(
    ((_bar = /* @__PURE__ */ new WeakMap()),
    (_i = i),
    (_A = class A {
      constructor() {
        _defineProperty(this, _i, \`computed field \${i}\`);
        _classPrivateFieldInitSpec(this, _bar, \`private field \${i}\`);
      }
      getBar() {
        return _classPrivateFieldGet(_bar, this);
      }
    }),
    _defineProperty(_A, 'foo', \`static field \${i}\`),
    _A),
  );
}
for (let i = 0; i <= 10; ++i) {
  const clazz = classes[i];
  expect(clazz.foo).toBe('static field ' + i);
  const instance = new clazz();
  expect(Object.getOwnPropertyNames(instance)).toEqual([String(i)]);
  expect(instance[i]).toBe('computed field ' + i);
  expect(instance.getBar()).toBe('private field ' + i);
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
const classes = [];
for (let i = 0; i <= 10; ++i) {
  var _A, _bar;
  let _i;
  classes.push(
    ((_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),
    (_i = i),
    (_A = class A {
      constructor() {
        this[_i] = \`computed field \${i}\`;
        Object.defineProperty(this, _bar, {
          writable: true,
          value: \`private field \${i}\`,
        });
      }
      getBar() {
        return _classPrivateFieldLooseBase(this, _bar)[_bar];
      }
    }),
    (_A.foo = \`static field \${i}\`),
    _A),
  );
}
for (let i = 0; i <= 10; ++i) {
  const clazz = classes[i];
  expect(clazz.foo).toBe('static field ' + i);
  const instance = new clazz();
  expect(Object.getOwnPropertyNames(instance)).toEqual([String(i)]);
  expect(instance[i]).toBe('computed field ' + i);
  expect(instance.getBar()).toBe('private field ' + i);
}`,
      },
    ],
  },
  {
    title: 'regression — 8882 (input)',
    source: `const classes = [];
for (let i = 0; i <= 10; ++i) {
  classes.push(
    class A {
      [i] = \`computed field \${i}\`;
      static foo = \`static field \${i}\`;
      #bar = \`private field \${i}\`;
      getBar() {
        return this.#bar;
      }
    }
  );
}`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');
const classes = [];
for (let i = 0; i <= 10; ++i) {
  var _A, _bar;
  let _i;
  classes.push(
    ((_bar = /* @__PURE__ */ new WeakMap()),
    (_i = i),
    (_A = class A {
      constructor() {
        _defineProperty(this, _i, \`computed field \${i}\`);
        _classPrivateFieldInitSpec(this, _bar, \`private field \${i}\`);
      }
      getBar() {
        return _classPrivateFieldGet(_bar, this);
      }
    }),
    _defineProperty(_A, 'foo', \`static field \${i}\`),
    _A),
  );
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
        output: `var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');
var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');
const classes = [];
for (let i = 0; i <= 10; ++i) {
  var _A, _bar;
  let _i;
  classes.push(
    ((_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),
    (_i = i),
    (_A = class A {
      constructor() {
        this[_i] = \`computed field \${i}\`;
        Object.defineProperty(this, _bar, {
          writable: true,
          value: \`private field \${i}\`,
        });
      }
      getBar() {
        return _classPrivateFieldLooseBase(this, _bar)[_bar];
      }
    }),
    (_A.foo = \`static field \${i}\`),
    _A),
  );
}`,
      },
    ],
  },
  {
    title: 'regression — multiple super in termary (input)',
    source: `class A extends B {
  x = 2;
  constructor() {
    x ? super(a) : super(b)
  }
}
`,
    filename: 'input.js',
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
            classProperties: {
              loose: false,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `var _defineProperty = require('@babel/runtime/helpers/defineProperty');
class A extends B {
  constructor() {
    var _super = (..._args) => (super(..._args), _defineProperty(this, 'x', 2), this);
    x ? _super(a) : _super(b);
  }
}`,
      },
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
            },
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: `class A extends B {
  constructor() {
    var _super = (..._args) => (super(..._args), (this.x = 2), this);
    x ? _super(a) : _super(b);
  }
}`,
      },
    ],
  },
  {
    title: 'source maps — private get (input)',
    source: `class A {
  #field;

  get #getter() {}

  #method() {}

  method() {
    this.#field;
    this.#getter;
    this.#method;

    inExpr(this.#field);
  }
}
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let A = (() => {
  'use strict';
  var _field = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_field');
  var _getter = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_getter');
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_method');
  var _privateMethod18 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _method, { value: _privateMethod18 });
    Object.defineProperty(this, _getter, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
    Object.defineProperty(this, _field, {
      writable: true,
      value: void 0,
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _field)[_field];
        _classPrivateFieldLooseBase(this, _getter)[_getter];
        _classPrivateFieldLooseBase(this, _method)[_method];
        inExpr(_classPrivateFieldLooseBase(this, _field)[_field]);
      },
      'name',
      {
        value: 'method',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
    title: 'source maps — private set (input)',
    source: `class A {
  #field;

  set #setter(value) {}

  method() {
    this.#field = 42;
    this.#setter = 43;


    inExpr(this.#field = 5);
  }
}
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let A = (() => {
  'use strict';
  var _field = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_field');
  var _setter = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_setter');
  function _initialize() {
    Object.defineProperty(this, _setter, {
      set: function (value) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
    Object.defineProperty(this, _field, {
      writable: true,
      value: void 0,
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _field)[_field] = 42;
        _classPrivateFieldLooseBase(this, _setter)[_setter] = 43;
        inExpr((_classPrivateFieldLooseBase(this, _field)[_field] = 5));
      },
      'name',
      {
        value: 'method',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
    modes: [
      {
        title: 'spec',
        options: {
          transforms: {
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
      {
        title: 'loose',
        options: {
          transforms: {
            classProperties: {
              loose: true,
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
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
