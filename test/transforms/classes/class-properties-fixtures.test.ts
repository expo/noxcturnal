import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _superPropGet = require('@babel/runtime/helpers/superPropGet');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _A;\nclass A extends class B {} {}\n_A = A;\n_defineProperty(A, 'x', _superPropGet(_A, 'x', _A));",
  'var _A;\nclass A extends class B {} {}\n_A = A;\nA.x = Object.getPrototypeOf(_A).x;',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass A extends B {\n  constructor(..._args) {\n    super(..._args);\n    _defineProperty(this, 'foo', super.bar);\n  }\n}",
  'class A extends B {\n  constructor(..._args) {\n    super(..._args);\n    this.foo = super.bar;\n  }\n}',
  "var _superPropGet = require('@babel/runtime/helpers/superPropGet');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _A;\nclass A extends B {}\n_A = A;\n_defineProperty(A, 'foo', _superPropGet(_A, 'bar', _A));",
  'var _A;\nclass A extends B {}\n_A = A;\nA.foo = Object.getPrototypeOf(_A).bar;',
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o,\n      _deep$very$o$Foo,\n      _deep$very$o2,\n      _deep$very$o2$Foo,\n      _deep$very$o3,\n      _deep$very$o3$Foo,\n      _o$Foo$self,\n      _o$Foo$self$self,\n      _ref,\n      _ref$self,\n      _ref2,\n      _ref2$self,\n      _self2,\n      _self2$self,\n      _o$Foo$self$getSelf,\n      _assertClassBrand$_,\n      _ref3,\n      _ref3$call,\n      _ref4,\n      _ref4$getSelf,\n      _ref5,\n      _ref5$getSelf,\n      _ref5$getSelf$call,\n      _ref6,\n      _ref6$self,\n      _assertClassBrand$_2,\n      _call,\n      _call$self,\n      _getSelf,\n      _getSelf$self,\n      _getSelf2,\n      _getSelf2$self,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o2,\n      _fnDeep$very$o2$Foo,\n      _fnDeep$very$o3,\n      _fnDeep$very$o3$Foo,\n      _fn$Foo$self,\n      _fn$Foo$self$self,\n      _ref7,\n      _ref7$self,\n      _ref8,\n      _ref8$self,\n      _self3,\n      _self3$self,\n      _fn$Foo$self$getSelf,\n      _assertClassBrand$_3,\n      _ref9,\n      _ref9$call,\n      _ref10,\n      _ref10$getSelf,\n      _ref11,\n      _ref11$getSelf,\n      _ref11$getSelf$call,\n      _ref12,\n      _ref12$self,\n      _assertClassBrand$_4,\n      _call2,\n      _call2$self,\n      _getSelf3,\n      _getSelf3$self,\n      _getSelf4,\n      _getSelf4$self;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.call(_o$Foo2).toString,\n    ).toEqual((1).toString);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)\n            ._.call(_o$Foo3)\n            .toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._.call(\n            _deep$very$o$Foo,\n          ),\n    ).toEqual(1);\n    expect(\n      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._.call(\n            _deep$very$o2$Foo,\n          ).toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)\n            ._.call(_deep$very$o3$Foo)\n            .toString(),\n    ).toEqual('1');\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._), _m)._.call(\n            _o$Foo$self,\n          ),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),\n            _m,\n          )._.call(_o$Foo$self$self),\n    ).toEqual(1);\n    expect(\n      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._.call(_ref$self),\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._.call(_ref2$self),\n    ).toEqual(1);\n    expect(\n      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._.call(_self2$self),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n            _m,\n          )._.call(_o$Foo$self$getSelf),\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n        _ref3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._.call(\n            _ref3$call,\n          ),\n    ).toEqual(1);\n    expect(\n      (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._.call(_ref4$getSelf),\n    ).toEqual(1);\n    expect(\n      (_ref5$getSelf = (_ref5 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n        null || _ref5$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._.call(\n            _ref5$getSelf$call,\n          ),\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._.call(_ref6$self),\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_2)) === null || _call === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_call$self = _call.self), _m)._.call(_call$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._.call(_getSelf2$self),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._.call(_fn$Foo),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._.call(_fn$Foo2).toString,\n    ).toEqual((1).toString);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)\n            ._.call(_fn$Foo3)\n            .toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._.call(\n            _fnDeep$very$o$Foo,\n          ),\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._.call(\n            _fnDeep$very$o2$Foo,\n          ).toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)\n            ._.call(_fnDeep$very$o3$Foo)\n            .toString(),\n    ).toEqual('1');\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),\n            _m,\n          )._.call(_fn$Foo$self),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),\n            _m,\n          )._.call(_fn$Foo$self$self),\n    ).toEqual(1);\n    expect(\n      (_ref7 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._.call(_ref7$self),\n    ).toEqual(1);\n    expect(\n      (_ref8 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._.call(_ref8$self),\n    ).toEqual(1);\n    expect(\n      (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._.call(_self3$self),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),\n            _m,\n          )._.call(_fn$Foo$self$getSelf),\n    ).toEqual(1);\n    expect(\n      (_ref9 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n        _ref9 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._.call(\n            _ref9$call,\n          ),\n    ).toEqual(1);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref10 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._.call(_ref10$getSelf),\n    ).toEqual(1);\n    expect(\n      (_ref11$getSelf = (_ref11 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.getSelf) === null || _ref11$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._.call(\n            _ref11$getSelf$call,\n          ),\n    ).toEqual(1);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._.call(_ref12$self),\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_4)) === null || _call2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._.call(_call2$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._.call(_getSelf3$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._.call(_getSelf4$self),\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _o$Foo4,\n      _o$Foo5,\n      _o$Foo6,\n      _deep$very$o4,\n      _deep$very$o4$Foo,\n      _deep$very$o5,\n      _deep$very$o5$Foo,\n      _deep$very$o6,\n      _deep$very$o6$Foo,\n      _o$Foo$self2,\n      _o$Foo$self$self2,\n      _ref13,\n      _ref13$self,\n      _ref14,\n      _ref14$self,\n      _self4,\n      _self4$self,\n      _o$Foo$self$getSelf2,\n      _assertClassBrand$_5,\n      _ref15,\n      _ref15$call,\n      _ref16,\n      _ref16$getSelf,\n      _ref17,\n      _ref17$getSelf,\n      _ref17$getSelf$call,\n      _ref18,\n      _ref18$self,\n      _assertClassBrand$_6,\n      _call3,\n      _call3$self,\n      _getSelf5,\n      _getSelf5$self,\n      _getSelf6,\n      _getSelf6$self,\n      _fn$Foo4,\n      _fn$Foo5,\n      _fn$Foo6,\n      _fnDeep$very$o4,\n      _fnDeep$very$o4$Foo,\n      _fnDeep$very$o5,\n      _fnDeep$very$o5$Foo,\n      _fnDeep$very$o6,\n      _fnDeep$very$o6$Foo,\n      _fn$Foo$self2,\n      _fn$Foo$self$self2,\n      _ref19,\n      _ref19$self,\n      _ref20,\n      _ref20$self,\n      _self5,\n      _self5$self,\n      _fn$Foo$self$getSelf2,\n      _assertClassBrand$_7,\n      _ref21,\n      _ref21$call,\n      _ref22,\n      _ref22$getSelf,\n      _ref23,\n      _ref23$getSelf,\n      _ref23$getSelf$call,\n      _ref24,\n      _ref24$self,\n      _assertClassBrand$_8,\n      _call4,\n      _call4$self,\n      _getSelf7,\n      _getSelf7$self,\n      _getSelf8,\n      _getSelf8$self;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo4 = o.Foo), _m)._.call(_o$Foo4),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo5 = o.Foo), _m)._.call(_o$Foo5).toString,\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo6 = o.Foo), _m)\n            ._.call(_o$Foo6)\n            .toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o4$Foo = _deep$very$o4.Foo), _m)._.call(\n            _deep$very$o4$Foo,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o5$Foo = _deep$very$o5.Foo), _m)._.call(\n            _deep$very$o5$Foo,\n          ).toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o6$Foo = _deep$very$o6.Foo), _m)\n            ._.call(_deep$very$o6$Foo)\n            .toString(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self2 = _assertClassBrand(Foo, o.Foo, _self)._),\n            _m,\n          )._.call(_o$Foo$self2),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$self2 = _assertClassBrand(Foo, o.Foo, _self)._.self),\n            _m,\n          )._.call(_o$Foo$self$self2),\n    ).toEqual(undefined);\n    expect(\n      (_ref13 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref13 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref13$self = _ref13.self), _m)._.call(_ref13$self),\n    ).toEqual(undefined);\n    expect(\n      (_ref14 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref14 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref14$self = _ref14.self), _m)._.call(_ref14$self),\n    ).toEqual(undefined);\n    expect(\n      (_self4 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_self4$self = _self4.self), _m)._.call(_self4$self),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$getSelf2 = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n            _m,\n          )._.call(_o$Foo$self$getSelf2),\n    ).toEqual(undefined);\n    expect(\n      (_ref15 =\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n        _ref15 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref15$call = _ref15.call(_assertClassBrand$_5)), _m)._.call(\n            _ref15$call,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_ref16 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref16 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref16$getSelf = _ref16.getSelf()), _m)._.call(_ref16$getSelf),\n    ).toEqual(undefined);\n    expect(\n      (_ref17$getSelf = (_ref17 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n        null || _ref17$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref17$getSelf$call = _ref17$getSelf.call(_ref17)), _m)._.call(\n            _ref17$getSelf$call,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_ref18 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref18 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref18$self = _ref18.self), _m)._.call(_ref18$self),\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_6)) === null || _call3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_call3$self = _call3.self), _m)._.call(_call3$self),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf5$self = _getSelf5.self), _m)._.call(_getSelf5$self),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf6$self = _getSelf6.self), _m)._.call(_getSelf6$self),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo4 = fn().Foo), _m)._.call(_fn$Foo4),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo5 = fn().Foo), _m)._.call(_fn$Foo5).toString,\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo6 = fn().Foo), _m)\n            ._.call(_fn$Foo6)\n            .toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o4$Foo = _fnDeep$very$o4.Foo), _m)._.call(\n            _fnDeep$very$o4$Foo,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o5$Foo = _fnDeep$very$o5.Foo), _m)._.call(\n            _fnDeep$very$o5$Foo,\n          ).toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o6$Foo = _fnDeep$very$o6.Foo), _m)\n            ._.call(_fnDeep$very$o6$Foo)\n            .toString(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self2 = _assertClassBrand(Foo, fn().Foo, _self)._),\n            _m,\n          )._.call(_fn$Foo$self2),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self$self2 = _assertClassBrand(Foo, fn().Foo, _self)._.self),\n            _m,\n          )._.call(_fn$Foo$self$self2),\n    ).toEqual(undefined);\n    expect(\n      (_ref19 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref19 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref19$self = _ref19.self), _m)._.call(_ref19$self),\n    ).toEqual(undefined);\n    expect(\n      (_ref20 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref20 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref20$self = _ref20.self), _m)._.call(_ref20$self),\n    ).toEqual(undefined);\n    expect(\n      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_self5$self = _self5.self), _m)._.call(_self5$self),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self$getSelf2 = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),\n            _m,\n          )._.call(_fn$Foo$self$getSelf2),\n    ).toEqual(undefined);\n    expect(\n      (_ref21 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n        _ref21 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref21$call = _ref21.call(_assertClassBrand$_7)), _m)._.call(\n            _ref21$call,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_ref22 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref22 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref22$getSelf = _ref22.getSelf()), _m)._.call(_ref22$getSelf),\n    ).toEqual(undefined);\n    expect(\n      (_ref23$getSelf = (_ref23 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.getSelf) === null || _ref23$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref23$getSelf$call = _ref23$getSelf.call(_ref23)), _m)._.call(\n            _ref23$getSelf$call,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_ref24 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref24 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref24$self = _ref24.self), _m)._.call(_ref24$self),\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_8)) === null || _call4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_call4$self = _call4.self), _m)._.call(_call4$self),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf7$self = _getSelf7.self), _m)._.call(_getSelf7$self),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf8$self = _getSelf8.self), _m)._.call(_getSelf8$self),\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();\nFoo.testNull();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _classPrivateFieldLoo,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _classPrivateFieldLoo2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _classPrivateFieldLoo3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _classPrivateFieldLoo4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m](),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[\n            _m\n          ](),\n    ).toEqual(1);\n    expect(\n      (_ref =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref2.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self2.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n        null || _ref3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref4 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref5$getSelf = (_ref5 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n        ?.getSelf) === null || _ref5$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref6.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo2)) === null || _call === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[\n            _m\n          ](),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[\n            _m\n          ](),\n    ).toEqual(1);\n    expect(\n      (_ref7 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref7.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref8 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref8.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self3.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref9 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n              .getSelf) === null || _ref9 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref11$getSelf = (_ref11 =\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n        ?.getSelf) === null || _ref11$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref12 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref12.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call2.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m](),\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _deep$very$o4,\n      _deep$very$o5,\n      _deep$very$o6,\n      _ref13,\n      _ref14,\n      _self4,\n      _classPrivateFieldLoo5,\n      _ref15,\n      _ref16,\n      _ref17,\n      _ref17$getSelf,\n      _ref18,\n      _classPrivateFieldLoo6,\n      _call3,\n      _getSelf5,\n      _getSelf6,\n      _fnDeep$very$o4,\n      _fnDeep$very$o5,\n      _fnDeep$very$o6,\n      _ref19,\n      _ref20,\n      _self5,\n      _classPrivateFieldLoo7,\n      _ref21,\n      _ref22,\n      _ref23,\n      _ref23$getSelf,\n      _ref24,\n      _classPrivateFieldLoo8,\n      _call4,\n      _getSelf7,\n      _getSelf8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString,\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o4.Foo, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o5.Foo, _m)[_m]().toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o6.Foo, _m)[_m]().toString(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[\n            _m\n          ](),\n    ).toEqual(undefined);\n    expect(\n      (_ref13 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref13 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref13.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref14 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref14 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref14.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self4 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self4.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref15 =\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n        null || _ref15 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref15.call(_classPrivateFieldLoo5), _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref16 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref16 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref16.getSelf(), _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref17$getSelf = (_ref17 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n        ?.getSelf) === null || _ref17$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref17$getSelf.call(_ref17), _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref18 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null ||\n        _ref18 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref18.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo6)) === null || _call3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call3.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf5.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf6.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString,\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o4.Foo, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o5.Foo, _m)[_m]().toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o6.Foo, _m)[_m]().toString(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[\n            _m\n          ](),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[\n            _m\n          ](),\n    ).toEqual(undefined);\n    expect(\n      (_ref19 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref19 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref19.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref20 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref20 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref20.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self5 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self5.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref21 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n              .getSelf) === null || _ref21 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref21.call(_classPrivateFieldLoo7), _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref22 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref22 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref22.getSelf(), _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref23$getSelf = (_ref23 =\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n        ?.getSelf) === null || _ref23$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref23$getSelf.call(_ref23), _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref24 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref24 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref24.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo8)) === null || _call4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call4.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf7.self, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf8.self, _m)[_m](),\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();\nFoo.testNull();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o,\n      _deep$very$o$Foo,\n      _deep$very$o2,\n      _deep$very$o2$Foo,\n      _deep$very$o3,\n      _deep$very$o3$Foo,\n      _o$Foo$self,\n      _o$Foo$self$self,\n      _ref,\n      _ref$self,\n      _ref2,\n      _ref2$self,\n      _self2,\n      _self2$self,\n      _o$Foo$self$getSelf,\n      _assertClassBrand$_,\n      _ref3,\n      _ref3$call,\n      _ref4,\n      _ref4$getSelf,\n      _ref5,\n      _ref5$getSelf,\n      _ref5$getSelf$call,\n      _ref6,\n      _ref6$self,\n      _assertClassBrand$_2,\n      _call,\n      _call$self,\n      _getSelf,\n      _getSelf$self,\n      _getSelf2,\n      _getSelf2$self,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o2,\n      _fnDeep$very$o2$Foo,\n      _fnDeep$very$o3,\n      _fnDeep$very$o3$Foo,\n      _fn$Foo$self,\n      _fn$Foo$self$self,\n      _ref7,\n      _ref7$self,\n      _ref8,\n      _ref8$self,\n      _self3,\n      _self3$self,\n      _fn$Foo$self$getSelf,\n      _assertClassBrand$_3,\n      _ref9,\n      _ref9$call,\n      _ref10,\n      _ref10$getSelf,\n      _ref11,\n      _ref11$getSelf,\n      _ref11$getSelf$call,\n      _ref12,\n      _ref12$self,\n      _assertClassBrand$_4,\n      _call2,\n      _call2$self,\n      _getSelf3,\n      _getSelf3$self,\n      _getSelf4,\n      _getSelf4$self;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo);\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.call(_o$Foo2).toString;\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)\n          ._.call(_o$Foo3)\n          .toString();\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._.call(_deep$very$o$Foo);\n    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._.call(\n          _deep$very$o2$Foo,\n        ).toString;\n    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)\n          ._.call(_deep$very$o3$Foo)\n          .toString();\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._), _m)._.call(\n          _o$Foo$self,\n        );\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),\n          _m,\n        )._.call(_o$Foo$self$self);\n    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._.call(_ref$self);\n    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n      null || _ref2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._.call(_ref2$self);\n    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n      ?.self) === null || _self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._.call(_self2$self);\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n          _m,\n        )._.call(_o$Foo$self$getSelf);\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n    _ref3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._.call(\n          _ref3$call,\n        );\n    (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._.call(_ref4$getSelf);\n    (_ref5$getSelf = (_ref5 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n      null || _ref5$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._.call(\n          _ref5$getSelf$call,\n        );\n    (_ref6 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n      null || _ref6 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._.call(_ref6$self);\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_2)) === null || _call === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_call$self = _call.self), _m)._.call(_call$self);\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self);\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._.call(_getSelf2$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._.call(_fn$Foo);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._.call(_fn$Foo2).toString;\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)\n          ._.call(_fn$Foo3)\n          .toString();\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._.call(\n          _fnDeep$very$o$Foo,\n        );\n    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._.call(\n          _fnDeep$very$o2$Foo,\n        ).toString;\n    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)\n          ._.call(_fnDeep$very$o3$Foo)\n          .toString();\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),\n          _m,\n        )._.call(_fn$Foo$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),\n          _m,\n        )._.call(_fn$Foo$self$self);\n    (_ref7 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref7 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._.call(_ref7$self);\n    (_ref8 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n      null || _ref8 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._.call(_ref8$self);\n    (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.self) === null || _self3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._.call(_self3$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),\n          _m,\n        )._.call(_fn$Foo$self$getSelf);\n    (_ref9 =\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n    _ref9 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._.call(\n          _ref9$call,\n        );\n    (_ref10 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref10 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._.call(_ref10$getSelf);\n    (_ref11$getSelf = (_ref11 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.getSelf) === null || _ref11$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._.call(\n          _ref11$getSelf$call,\n        );\n    (_ref12 =\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._.call(_ref12$self);\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_4)) === null || _call2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._.call(_call2$self);\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._.call(_getSelf3$self);\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._.call(_getSelf4$self);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _classPrivateFieldLoo,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _classPrivateFieldLoo2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _classPrivateFieldLoo3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _classPrivateFieldLoo4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]();\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString;\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString();\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m]();\n    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]().toString;\n    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]().toString();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[\n          _m\n        ]();\n    (_ref =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref.self, _m)[_m]();\n    (_ref2 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref2.self, _m)[_m]();\n    (_self2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.self) === null || _self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self2.self, _m)[_m]();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(), _m)[\n          _m\n        ]();\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n      null || _ref3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m]();\n    (_ref4 =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m]();\n    (_ref5$getSelf = (_ref5 =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n      ?.getSelf) === null || _ref5$getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m]();\n    (_ref6 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref6.self, _m)[_m]();\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo2)) === null || _call === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call.self, _m)[_m]();\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m]();\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m]();\n    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString;\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString();\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m]();\n    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]().toString;\n    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]().toString();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[_m]();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[\n          _m\n        ]();\n    (_ref7 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref7.self, _m)[_m]();\n    (_ref8 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref8.self, _m)[_m]();\n    (_self3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self) === null || _self3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self3.self, _m)[_m]();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(\n          _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n          _m,\n        )[_m]();\n    (_ref9 =\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n            .getSelf) === null || _ref9 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m]();\n    (_ref10 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m]();\n    (_ref11$getSelf = (_ref11 =\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n      ?.getSelf) === null || _ref11$getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m]();\n    (_ref12 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n    _ref12 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref12.self, _m)[_m]();\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call2.self, _m)[_m]();\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m]();\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m]();\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass C {\n  static testIf(o) {\n    if (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    return (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d\n      ? true\n      : false;\n  }\n  static testLoop(o) {\n    while (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c.d) {\n      for (; (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c)?.d;) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while ((o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    return !!(o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d;\n  }\n  static testIfDeep(o) {\n    var _o$obj;\n    if (\n      ((_o$obj = o.obj) === null || _o$obj === void 0\n        ? void 0\n        : _assertClassBrand(C, _o$obj, _a)._.b\n      )?.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    var _o$obj2;\n    return ((_o$obj2 = o.obj) === null || _o$obj2 === void 0\n      ? void 0\n      : _assertClassBrand(C, _o$obj2, _a)._.b\n    )?.c.d\n      ? true\n      : false;\n  }\n  static testLoopDeep(o) {\n    var _o$obj3;\n    while (\n      (_o$obj3 = o.obj) === null || _o$obj3 === void 0\n        ? void 0\n        : _assertClassBrand(C, _o$obj3, _a)._.b.c.d\n    ) {\n      var _o$obj4;\n      for (\n        ;\n        ((_o$obj4 = o.obj) === null || _o$obj4 === void 0\n          ? void 0\n          : _assertClassBrand(C, _o$obj4, _a)._.b.c\n        )?.d;\n      ) {\n        var _o$obj5;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          ((_o$obj5 = o.obj) === null || _o$obj5 === void 0\n            ? void 0\n            : _assertClassBrand(C, _o$obj5, _a)._.b\n          )?.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    var _o$obj6;\n    return !!(\n      (_o$obj6 = o.obj) === null || _o$obj6 === void 0\n        ? void 0\n        : _assertClassBrand(C, _o$obj6, _a)._.b\n    )?.c.d;\n  }\n  static testLogicalInIf(o) {\n    if (\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d &&\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._)?.b.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testLogicalInReturn(o) {\n    return (\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d &&\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._)?.b.c.d\n    );\n  }\n  static testNullishCoalescing(o) {\n    if (\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ??\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d\n    ) {\n      return (\n        (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ??\n        (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d\n      );\n    }\n    return (\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ?? o\n    );\n  }\n  static test() {\n    const c = C;\n    expect(C.testIf(c)).toBe(true);\n    expect(C.testConditional(c)).toBe(true);\n    expect(C.testLoop(c)).toBe(true);\n    expect(C.testNegate(c)).toBe(true);\n    expect(C.testIfDeep({ obj: c })).toBe(true);\n    expect(C.testConditionalDeep({ obj: c })).toBe(true);\n    expect(C.testLoopDeep({ obj: c })).toBe(true);\n    expect(C.testNegateDeep({ obj: c })).toBe(true);\n    expect(C.testLogicalInIf(c)).toBe(true);\n    expect(C.testLogicalInReturn(c)).toBe(2);\n    expect(C.testNullishCoalescing(c)).toBe(2);\n  }\n  static testNullish() {\n    for (const n of [null, undefined]) {\n      expect(C.testIf(n)).toBe(false);\n      expect(C.testConditional(n)).toBe(false);\n      expect(C.testLoop(n)).toBe(false);\n      expect(C.testNegate(n)).toBe(false);\n      expect(C.testIfDeep({ obj: n })).toBe(false);\n      expect(C.testConditionalDeep({ obj: n })).toBe(false);\n      expect(C.testLoopDeep({ obj: n })).toBe(false);\n      expect(C.testNegateDeep({ obj: n })).toBe(false);\n      expect(C.testLogicalInIf(n)).toBe(false);\n      expect(C.testLogicalInReturn(n)).toBe(undefined);\n      expect(C.testNullishCoalescing(n)).toBe(n);\n    }\n  }\n}\nvar _a = { _: { b: { c: { d: 2 } } } };\nC.test();\nC.testNullish();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _a = /* @__PURE__ */ _classPrivateFieldLooseKey('a');\nclass C {\n  static testIf(o) {\n    if (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    return (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d\n      ? true\n      : false;\n  }\n  static testLoop(o) {\n    while (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c.d) {\n      for (\n        ;\n        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c)?.d;\n      ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    return !!(o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d;\n  }\n  static testIfDeep(o) {\n    var _o$obj;\n    if (\n      ((_o$obj = o.obj) === null || _o$obj === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$obj, _a)[_a].b\n      )?.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    var _o$obj2;\n    return ((_o$obj2 = o.obj) === null || _o$obj2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_o$obj2, _a)[_a].b\n    )?.c.d\n      ? true\n      : false;\n  }\n  static testLoopDeep(o) {\n    var _o$obj3;\n    while (\n      (_o$obj3 = o.obj) === null || _o$obj3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$obj3, _a)[_a].b.c.d\n    ) {\n      var _o$obj4;\n      for (\n        ;\n        ((_o$obj4 = o.obj) === null || _o$obj4 === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(_o$obj4, _a)[_a].b.c\n        )?.d;\n      ) {\n        var _o$obj5;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          ((_o$obj5 = o.obj) === null || _o$obj5 === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(_o$obj5, _a)[_a].b\n          )?.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    var _o$obj6;\n    return !!(\n      (_o$obj6 = o.obj) === null || _o$obj6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$obj6, _a)[_a].b\n    )?.c.d;\n  }\n  static testLogicalInIf(o) {\n    if (\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d &&\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a])?.b.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testLogicalInReturn(o) {\n    return (\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d &&\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a])?.b.c.d\n    );\n  }\n  static testNullishCoalescing(o) {\n    if (\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c\n        .non_existent ??\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d\n    ) {\n      return (\n        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c\n          .non_existent ??\n        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d\n      );\n    }\n    return (\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c\n        .non_existent ?? o\n    );\n  }\n  static test() {\n    const c = C;\n    expect(C.testIf(c)).toBe(true);\n    expect(C.testConditional(c)).toBe(true);\n    expect(C.testLoop(c)).toBe(true);\n    expect(C.testNegate(c)).toBe(true);\n    expect(C.testIfDeep({ obj: c })).toBe(true);\n    expect(C.testConditionalDeep({ obj: c })).toBe(true);\n    expect(C.testLoopDeep({ obj: c })).toBe(true);\n    expect(C.testNegateDeep({ obj: c })).toBe(true);\n    expect(C.testLogicalInIf(c)).toBe(true);\n    expect(C.testLogicalInReturn(c)).toBe(2);\n    expect(C.testNullishCoalescing(c)).toBe(2);\n  }\n  static testNullish() {\n    for (const n of [null, undefined]) {\n      expect(C.testIf(n)).toBe(false);\n      expect(C.testConditional(n)).toBe(false);\n      expect(C.testLoop(n)).toBe(false);\n      expect(C.testNegate(n)).toBe(false);\n      expect(C.testIfDeep({ obj: n })).toBe(false);\n      expect(C.testConditionalDeep({ obj: n })).toBe(false);\n      expect(C.testLoopDeep({ obj: n })).toBe(false);\n      expect(C.testNegateDeep({ obj: n })).toBe(false);\n      expect(C.testLogicalInIf(n)).toBe(false);\n      expect(C.testLogicalInReturn(n)).toBe(undefined);\n      expect(C.testNullishCoalescing(n)).toBe(n);\n    }\n  }\n}\nObject.defineProperty(C, _a, {\n  writable: true,\n  value: { b: { c: { d: 2 } } },\n});\nC.test();\nC.testNullish();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass C {\n  static testIf(o) {\n    if (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    return (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d\n      ? true\n      : false;\n  }\n  static testLoop(o) {\n    while (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c.d) {\n      for (; (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b.c)?.d;) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while ((o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    return !!(o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d;\n  }\n  static testIfDeep(o) {\n    var _o$obj;\n    if (\n      ((_o$obj = o.obj) === null || _o$obj === void 0\n        ? void 0\n        : _assertClassBrand(C, _o$obj, _a)._.b\n      )?.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    var _o$obj2;\n    return ((_o$obj2 = o.obj) === null || _o$obj2 === void 0\n      ? void 0\n      : _assertClassBrand(C, _o$obj2, _a)._.b\n    )?.c.d\n      ? true\n      : false;\n  }\n  static testLoopDeep(o) {\n    var _o$obj3;\n    while (\n      (_o$obj3 = o.obj) === null || _o$obj3 === void 0\n        ? void 0\n        : _assertClassBrand(C, _o$obj3, _a)._.b.c.d\n    ) {\n      var _o$obj4;\n      for (\n        ;\n        ((_o$obj4 = o.obj) === null || _o$obj4 === void 0\n          ? void 0\n          : _assertClassBrand(C, _o$obj4, _a)._.b.c\n        )?.d;\n      ) {\n        var _o$obj5;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          ((_o$obj5 = o.obj) === null || _o$obj5 === void 0\n            ? void 0\n            : _assertClassBrand(C, _o$obj5, _a)._.b\n          )?.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    var _o$obj6;\n    return !!(\n      (_o$obj6 = o.obj) === null || _o$obj6 === void 0\n        ? void 0\n        : _assertClassBrand(C, _o$obj6, _a)._.b\n    )?.c.d;\n  }\n  static testLogicalInIf(o) {\n    if (\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d &&\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._)?.b.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testLogicalInReturn(o) {\n    return (\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d &&\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._)?.b.c.d\n    );\n  }\n  static testNullishCoalescing(o) {\n    if (\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ??\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d\n    ) {\n      return (\n        (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ??\n        (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.d\n      );\n    }\n    return (\n      (o === null || o === void 0 ? void 0 : _assertClassBrand(C, o, _a)._.b)?.c.non_existent ?? o\n    );\n  }\n}\nvar _a = { _: { b: { c: { d: 2 } } } };\nC.test();\nC.testNullish();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _a = /* @__PURE__ */ _classPrivateFieldLooseKey('a');\nclass C {\n  static testIf(o) {\n    if (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    return (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d\n      ? true\n      : false;\n  }\n  static testLoop(o) {\n    while (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c.d) {\n      for (\n        ;\n        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b.c)?.d;\n      ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    return !!(o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d;\n  }\n  static testIfDeep(o) {\n    var _o$obj;\n    if (\n      ((_o$obj = o.obj) === null || _o$obj === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$obj, _a)[_a].b\n      )?.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    var _o$obj2;\n    return ((_o$obj2 = o.obj) === null || _o$obj2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_o$obj2, _a)[_a].b\n    )?.c.d\n      ? true\n      : false;\n  }\n  static testLoopDeep(o) {\n    var _o$obj3;\n    while (\n      (_o$obj3 = o.obj) === null || _o$obj3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$obj3, _a)[_a].b.c.d\n    ) {\n      var _o$obj4;\n      for (\n        ;\n        ((_o$obj4 = o.obj) === null || _o$obj4 === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(_o$obj4, _a)[_a].b.c\n        )?.d;\n      ) {\n        var _o$obj5;\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (\n          ((_o$obj5 = o.obj) === null || _o$obj5 === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(_o$obj5, _a)[_a].b\n          )?.c.d\n        );\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    var _o$obj6;\n    return !!(\n      (_o$obj6 = o.obj) === null || _o$obj6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$obj6, _a)[_a].b\n    )?.c.d;\n  }\n  static testLogicalInIf(o) {\n    if (\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d &&\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a])?.b.c.d\n    ) {\n      return true;\n    }\n    return false;\n  }\n  static testLogicalInReturn(o) {\n    return (\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d &&\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a])?.b.c.d\n    );\n  }\n  static testNullishCoalescing(o) {\n    if (\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c\n        .non_existent ??\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d\n    ) {\n      return (\n        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c\n          .non_existent ??\n        (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c.d\n      );\n    }\n    return (\n      (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o, _a)[_a].b)?.c\n        .non_existent ?? o\n    );\n  }\n}\nObject.defineProperty(C, _a, {\n  writable: true,\n  value: { b: { c: { d: 2 } } },\n});\nC.test();\nC.testNullish();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass A {\n  static dynamicCheck() {\n    expect(_assertClassBrand(A, this, _x)._).toBe(0);\n    expect((_x._ = _assertClassBrand(A, this, 1))).toBe(1);\n    expect(_assertClassBrand(A, this, _x)._).toBe(1);\n    [_assertClassBrand(A, this, _x)._] = [2];\n    expect(_assertClassBrand(A, this, _x)._).toBe(2);\n  }\n  static noCheck() {\n    expect(_x._).toBe(2);\n    expect((_x._ = 3)).toBe(3);\n    [_x._] = [4];\n    expect(_x._).toBe(4);\n  }\n}\nvar _x = { _: 0 };\nA.dynamicCheck();\nA.noCheck();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nclass A {\n  static dynamicCheck() {\n    expect(_classPrivateFieldLooseBase(this, _x)[_x]).toBe(0);\n    expect((_classPrivateFieldLooseBase(this, _x)[_x] = 1)).toBe(1);\n    expect(_classPrivateFieldLooseBase(this, _x)[_x]).toBe(1);\n    [_classPrivateFieldLooseBase(this, _x)[_x]] = [2];\n    expect(_classPrivateFieldLooseBase(this, _x)[_x]).toBe(2);\n  }\n  static noCheck() {\n    expect(_classPrivateFieldLooseBase(A, _x)[_x]).toBe(2);\n    expect((_classPrivateFieldLooseBase(A, _x)[_x] = 3)).toBe(3);\n    [_classPrivateFieldLooseBase(A, _x)[_x]] = [4];\n    expect(_classPrivateFieldLooseBase(A, _x)[_x]).toBe(4);\n  }\n}\nObject.defineProperty(A, _x, {\n  writable: true,\n  value: 0,\n});\nA.dynamicCheck();\nA.noCheck();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass A {\n  static dynamicCheck() {\n    _assertClassBrand(A, this, _x)._;\n    _x._ = _assertClassBrand(A, this, 2);\n    [_assertClassBrand(A, this, _x)._] = [];\n  }\n  static noCheck() {\n    _x._;\n    _x._ = 2;\n    [_x._] = [];\n  }\n}\nvar _x = { _: 2 };",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nclass A {\n  static dynamicCheck() {\n    _classPrivateFieldLooseBase(this, _x)[_x];\n    _classPrivateFieldLooseBase(this, _x)[_x] = 2;\n    [_classPrivateFieldLooseBase(this, _x)[_x]] = [];\n  }\n  static noCheck() {\n    _classPrivateFieldLooseBase(A, _x)[_x];\n    _classPrivateFieldLooseBase(A, _x)[_x] = 2;\n    [_classPrivateFieldLooseBase(A, _x)[_x]] = [];\n  }\n}\nObject.defineProperty(A, _x, {\n  writable: true,\n  value: 2,\n});",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _track, _track2, _track3, _track4, _track5, _track6, _track7, _track8, _track9;\nconst actualOrder = [];\nconst track = i => {\n  actualOrder.push(i);\n  return i;\n};\n_track4 = track(1);\n_track = track(2);\n_track5 = track(3);\n_track6 = track(4);\n_track2 = track(5);\n_track7 = track(6);\n_track8 = track(7);\n_track9 = track(8);\n_track3 = track(9);\nclass MyClass {\n  constructor() {\n    _defineProperty(this, _track, track(13));\n    _defineProperty(this, _track2, track(14));\n    _defineProperty(this, _track3, track(15));\n  }\n  get [_track5]() {\n    return 'foo';\n  }\n  set [_track6](value) {\n    this.bar = value;\n  }\n  [_track9]() {}\n}\n_defineProperty(MyClass, _track4, track(10));\n_defineProperty(MyClass, _track7, track(11));\n_defineProperty(MyClass, _track8, track(12));\nconst inst = new MyClass();\nconst expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];\nexpect(actualOrder).toEqual(expectedOrder);\nexpect(MyClass[1]).toBe(10);\nexpect(inst[2]).toBe(13);\nexpect(inst[3]).toBe('foo');\ninst[4] = 'baz';\nexpect(inst.bar).toBe('baz');\nexpect(inst[5]).toBe(14);\nexpect(MyClass[6]).toBe(11);\nexpect(MyClass[7]).toBe(12);\nexpect(typeof inst[8]).toBe('function');\nexpect(inst[9]).toBe(15);",
  "let _track, _track2, _track3, _track4, _track5, _track6, _track7, _track8, _track9;\nconst actualOrder = [];\nconst track = i => {\n  actualOrder.push(i);\n  return i;\n};\n_track4 = track(1);\n_track = track(2);\n_track5 = track(3);\n_track6 = track(4);\n_track2 = track(5);\n_track7 = track(6);\n_track8 = track(7);\n_track9 = track(8);\n_track3 = track(9);\nclass MyClass {\n  constructor() {\n    this[_track] = track(13);\n    this[_track2] = track(14);\n    this[_track3] = track(15);\n  }\n  get [_track5]() {\n    return 'foo';\n  }\n  set [_track6](value) {\n    this.bar = value;\n  }\n  [_track9]() {}\n}\nMyClass[_track4] = track(10);\nMyClass[_track7] = track(11);\nMyClass[_track8] = track(12);\nconst inst = new MyClass();\nconst expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];\nexpect(actualOrder).toEqual(expectedOrder);\nexpect(MyClass[1]).toBe(10);\nexpect(inst[2]).toBe(13);\nexpect(inst[3]).toBe('foo');\ninst[4] = 'baz';\nexpect(inst.bar).toBe('baz');\nexpect(inst[5]).toBe(14);\nexpect(MyClass[6]).toBe(11);\nexpect(MyClass[7]).toBe(12);\nexpect(typeof inst[8]).toBe('function');\nexpect(inst[9]).toBe(15);",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _undefined, _, _baz, _ref, _one, _ref2, _ref3, _ref4, _computed, _computed2, _ref5;\nconst foo = 'foo';\nconst bar = () => {};\nconst four = 4;\n_one = one();\n_ref2 = 2 * 4 + 7;\n_ref3 = 2 * four + 7;\n_ref4 = 2 * four + seven;\n_undefined = undefined;\n_ = void 0;\n_computed = computed();\n_computed2 = computed();\n_ref5 = 'test' + one;\n_baz = baz;\n_ref = `template${expression}`;\nclass MyClass {\n  constructor() {\n    _defineProperty(this, null, 'null');\n    _defineProperty(this, _undefined, 'undefined');\n    _defineProperty(this, _, 'void 0');\n    _defineProperty(this, /regex/, 'regex');\n    _defineProperty(this, foo, 'foo');\n    _defineProperty(this, bar, 'bar');\n    _defineProperty(this, _baz, 'baz');\n    _defineProperty(this, `template`, 'template');\n    _defineProperty(this, _ref, 'template-with-expression');\n  }\n  get ['whatever']() {}\n  set ['whatever'](value) {}\n  get [_computed]() {}\n  set [_computed2](value) {}\n  [_ref5]() {}\n  static [10]() {}\n}\n_defineProperty(MyClass, _one, 'test');\n_defineProperty(MyClass, _ref2, '247');\n_defineProperty(MyClass, _ref3, '247');\n_defineProperty(MyClass, _ref4, '247');",
  "let _undefined, _, _baz, _ref, _one, _ref2, _ref3, _ref4, _computed, _computed2, _ref5;\nconst foo = 'foo';\nconst bar = () => {};\nconst four = 4;\n_one = one();\n_ref2 = 2 * 4 + 7;\n_ref3 = 2 * four + 7;\n_ref4 = 2 * four + seven;\n_undefined = undefined;\n_ = void 0;\n_computed = computed();\n_computed2 = computed();\n_ref5 = 'test' + one;\n_baz = baz;\n_ref = `template${expression}`;\nclass MyClass {\n  constructor() {\n    this[null] = 'null';\n    this[_undefined] = 'undefined';\n    this[_] = 'void 0';\n    this[/regex/] = 'regex';\n    this[foo] = 'foo';\n    this[bar] = 'bar';\n    this[_baz] = 'baz';\n    this[`template`] = 'template';\n    this[_ref] = 'template-with-expression';\n  }\n  get ['whatever']() {}\n  set ['whatever'](value) {}\n  get [_computed]() {}\n  set [_computed2](value) {}\n  [_ref5]() {}\n  static [10]() {}\n}\nMyClass[_one] = 'test';\nMyClass[_ref2] = '247';\nMyClass[_ref3] = '247';\nMyClass[_ref4] = '247';",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar foo = 'bar';\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'bar', foo);\n    var _foo = 'foo';\n    var baz = 'baz';\n  }\n}\n_defineProperty(Foo, 'bar', baz);",
  "var foo = 'bar';\nclass Foo {\n  constructor() {\n    this.bar = foo;\n    var _foo = 'foo';\n    var baz = 'baz';\n  }\n}\nFoo.bar = baz;",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo extends Bar {\n  constructor(..._args) {\n    super(..._args);\n    _defineProperty(this, 'bar', 'foo');\n  }\n}",
  "class Foo extends Bar {\n  constructor(..._args) {\n    super(..._args);\n    this.bar = 'foo';\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Child extends Parent {\n  constructor() {\n    super();\n    _defineProperty(this, 'scopedFunctionWithThis', () => {\n      this.name = {};\n    });\n  }\n}",
  'class Child extends Parent {\n  constructor() {\n    super();\n    this.scopedFunctionWithThis = () => {\n      this.name = {};\n    };\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nfunction test(x) {\n  let _x;\n  _x = x;\n  class F {\n    constructor() {\n      _defineProperty(this, _x, 1);\n    }\n  }\n  x = 'deadbeef';\n  expect(new F().foo).toBe(1);\n  x = 'wrong';\n  expect(new F().foo).toBe(1);\n}\ntest('foo');",
  "function test(x) {\n  let _x;\n  _x = x;\n  class F {\n    constructor() {\n      this[_x] = 1;\n    }\n  }\n  x = 'deadbeef';\n  expect(new F().foo).toBe(1);\n  x = 'wrong';\n  expect(new F().foo).toBe(1);\n}\ntest('foo');",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'bar', void 0);\n  }\n}",
  'class Foo {\n  constructor() {\n    this.bar = void 0;\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'bar', 'foo');\n  }\n}",
  "class Foo {\n  constructor() {\n    this.bar = 'foo';\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _bar, _name;\n_bar = bar;\n_name = name;\nclass A {\n  constructor() {\n    _defineProperty(this, 'name', 8);\n    _defineProperty(this, 'length', 9);\n  }\n}\n_defineProperty(A, 'name', 1);\n_defineProperty(A, 'length', 2);\n_defineProperty(A, 'foo', 3);\n_defineProperty(A, _bar, 4);\n_defineProperty(A, 'name', 5);\n_defineProperty(A, _name, 6);\n_defineProperty(A, 'name', 7);",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _bar, _name;\n_bar = bar;\n_name = name;\nclass A {\n  constructor() {\n    this.name = 8;\n    this.length = 9;\n  }\n}\n_defineProperty(A, 'name', 1);\n_defineProperty(A, 'length', 2);\nA.foo = 3;\nA[_bar] = 4;\n_defineProperty(A, 'name', 5);\nA[_name] = 6;\n_defineProperty(A, 'name', 7);",
  "import _defineProperty from '@babel/runtime/helpers/defineProperty';\nexport default param => {\n  var _App;\n  return (\n    (_App = class App {\n      getParam() {\n        return param;\n      }\n    }),\n    _defineProperty(_App, 'props', {\n      prop1: 'prop1',\n      prop2: 'prop2',\n    }),\n    _App\n  );\n};",
  "export default param => {\n  var _App;\n  return (\n    (_App = class App {\n      getParam() {\n        return param;\n      }\n    }),\n    (_App.props = {\n      prop1: 'prop1',\n      prop2: 'prop2',\n    }),\n    _App\n  );\n};",
  "import _defineProperty from '@babel/runtime/helpers/defineProperty';\nvar _Class;\ncall(((_Class = class {}), _defineProperty(_Class, 'test', true), _Class));\nexport default class _Class2 {}\n_defineProperty(_Class2, 'test', true);",
  'var _Class;\ncall(((_Class = class {}), (_Class.test = true), _Class));\nexport default class _Class2 {}\n_Class2.test = true;',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nfunction withContext(ComposedComponent) {\n  var _WithContext;\n  return (\n    (_WithContext = class WithContext extends Component {}),\n    _defineProperty(_WithContext, 'propTypes', {\n      context: PropTypes.shape({\n        addCss: PropTypes.func,\n        setTitle: PropTypes.func,\n        setMeta: PropTypes.func,\n      }),\n    }),\n    _WithContext\n  );\n}",
  'function withContext(ComposedComponent) {\n  var _WithContext;\n  return (\n    (_WithContext = class WithContext extends Component {}),\n    (_WithContext.propTypes = {\n      context: PropTypes.shape({\n        addCss: PropTypes.func,\n        setTitle: PropTypes.func,\n        setMeta: PropTypes.func,\n      }),\n    }),\n    _WithContext\n  );\n}',
  "import _defineProperty from '@babel/runtime/helpers/defineProperty';\nclass MyClass {\n  constructor() {\n    _defineProperty(this, 'myAsyncMethod', async () => {\n      console.log(this);\n    });\n  }\n}\n(class MyClass2 {\n  constructor() {\n    _defineProperty(this, 'myAsyncMethod', async () => {\n      console.log(this);\n    });\n  }\n});\nexport default class MyClass3 {\n  constructor() {\n    _defineProperty(this, 'myAsyncMethod', async () => {\n      console.log(this);\n    });\n  }\n}",
  'class MyClass {\n  constructor() {\n    this.myAsyncMethod = async () => {\n      console.log(this);\n    };\n  }\n}\n(class MyClass2 {\n  constructor() {\n    this.myAsyncMethod = async () => {\n      console.log(this);\n    };\n  }\n});\nexport default class MyClass3 {\n  constructor() {\n    this.myAsyncMethod = async () => {\n      console.log(this);\n    };\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _A;\nclass A {}\n_A = A;\n_defineProperty(A, 'self', _A);\n_defineProperty(A, 'getA', () => _A);\nconst oldA = A;\nA = null;\nexpect(oldA.self).toBe(oldA);\nexpect(oldA.getA()).toBe(oldA);",
  'var _A;\nclass A {}\n_A = A;\nA.self = _A;\nA.getA = () => _A;\nconst oldA = A;\nA = null;\nexpect(oldA.self).toBe(oldA);\nexpect(oldA.getA()).toBe(oldA);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _A;\nclass A {}\n_A = A;\n_defineProperty(A, 'self', _A);\n_defineProperty(A, 'getA', () => _A);",
  'var _A;\nclass A {}\n_A = A;\nA.self = _A;\nA.getA = () => _A;',
  "import _defineProperty from '@babel/runtime/helpers/defineProperty';\nexport class MyClass {}\n_defineProperty(MyClass, 'property', value);\nexport default class MyClass2 {}\n_defineProperty(MyClass2, 'property', value);",
  'export class MyClass {}\nMyClass.property = value;\nexport default class MyClass2 {}\nMyClass2.property = value;',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Class;\nvar Foo = ((_Class = class {}), _defineProperty(_Class, 'num', 0), _Class);\nexpect(Foo.num).toBe(0);\nexpect((Foo.num = 1)).toBe(1);\nexpect(Foo.name).toBe('Foo');",
  "var _Class;\nvar Foo = ((_Class = class {}), (_Class.num = 0), _Class);\nexpect(Foo.num).toBe(0);\nexpect((Foo.num = 1)).toBe(1);\nexpect(Foo.name).toBe('Foo');",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Class;\nvar Foo = ((_Class = class {}), _defineProperty(_Class, 'num', 0), _Class);",
  'var _Class;\nvar Foo = ((_Class = class {}), (_Class.num = 0), _Class);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _superPropGet = require('@babel/runtime/helpers/superPropGet');\nvar _B;\nclass A {}\n_defineProperty(A, 'prop', 1);\nclass B extends A {}\n_B = B;\n_defineProperty(B, 'prop', 2);\n_defineProperty(B, 'propA', _superPropGet(_B, 'prop', _B));\n_defineProperty(B, 'getPropA', () => _superPropGet(_B, 'prop', _B));",
  'var _B;\nclass A {}\nA.prop = 1;\nclass B extends A {}\n_B = B;\nB.prop = 2;\nB.propA = Object.getPrototypeOf(_B).prop;\nB.getPropA = () => Object.getPrototypeOf(_B).prop;',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _superPropGet = require('@babel/runtime/helpers/superPropGet');\nvar _B;\nclass A {}\n_defineProperty(A, 'prop', 1);\nclass B extends A {}\n_B = B;\n_defineProperty(B, 'prop', 2);\n_defineProperty(B, 'propA', _superPropGet(_B, 'prop', _B));\n_defineProperty(B, 'getPropA', () => _superPropGet(_B, 'prop', _B));\nconst { prop, propA, getPropA } = B;\nexpect(prop).toBe(2);\nexpect(propA).toBe(1);\nexpect(getPropA()).toBe(1);\nconst oldB = B;\nB = null;\nexpect(oldB.prop).toBe(2);\nexpect(oldB.propA).toBe(1);\nexpect(oldB.getPropA()).toBe(1);",
  'var _B;\nclass A {}\nA.prop = 1;\nclass B extends A {}\n_B = B;\nB.prop = 2;\nB.propA = Object.getPrototypeOf(_B).prop;\nB.getPropA = () => Object.getPrototypeOf(_B).prop;\nconst { prop, propA, getPropA } = B;\nexpect(prop).toBe(2);\nexpect(propA).toBe(1);\nexpect(getPropA()).toBe(1);\nconst oldB = B;\nB = null;\nexpect(oldB.prop).toBe(2);\nexpect(oldB.propA).toBe(1);\nexpect(oldB.getPropA()).toBe(1);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _A;\nclass A {}\n_A = A;\n_defineProperty(A, 'self', _A);\n_defineProperty(A, 'getA', () => _A);\nconst { self, getA } = A;\nexpect(self).toBe(A);\nexpect(getA()).toBe(A);\nconst oldA = A;\nA = null;\nexpect(oldA.self).toBe(oldA);\nexpect(oldA.getA()).toBe(oldA);",
  'var _A;\nclass A {}\n_A = A;\nA.self = _A;\nA.getA = () => _A;\nconst { self, getA } = A;\nexpect(self).toBe(A);\nexpect(getA()).toBe(A);\nconst oldA = A;\nA = null;\nexpect(oldA.self).toBe(oldA);\nexpect(oldA.getA()).toBe(oldA);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {}\n_defineProperty(Foo, 'num', void 0);\nexpect('num' in Foo).toBe(true);\nexpect(Foo.num).toBeUndefined();",
  "class Foo {}\nFoo.num = void 0;\nexpect('num' in Foo).toBe(true);\nexpect(Foo.num).toBeUndefined();",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {}\n_defineProperty(Foo, 'bar', void 0);",
  'class Foo {}\nFoo.bar = void 0;',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {}\n_defineProperty(Foo, 'num', 0);\n_defineProperty(Foo, 'str', 'foo');\nexpect(Foo.num).toBe(0);\nexpect((Foo.num = 1)).toBe(1);\nexpect(Foo.str).toBe('foo');\nexpect((Foo.str = 'bar')).toBe('bar');",
  "class Foo {}\nFoo.num = 0;\nFoo.str = 'foo';\nexpect(Foo.num).toBe(0);\nexpect((Foo.num = 1)).toBe(1);\nexpect(Foo.str).toBe('foo');\nexpect((Foo.str = 'bar')).toBe('bar');",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {}\n_defineProperty(Foo, 'bar', 'foo');",
  "class Foo {}\nFoo.bar = 'foo';",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass A {\n  foo() {\n    return 'bar';\n  }\n}\nclass B extends A {\n  constructor(..._args) {\n    super(..._args);\n    _defineProperty(this, 'foo', super.foo());\n  }\n}",
  "class A {\n  foo() {\n    return 'bar';\n  }\n}\nclass B extends A {\n  constructor(..._args) {\n    super(..._args);\n    this.foo = super.foo();\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo extends Bar {\n  constructor() {\n    var _super = (..._args) => (super(..._args), _defineProperty(this, 'bar', 'foo'), this);\n    foo(_super());\n  }\n}",
  "class Foo extends Bar {\n  constructor() {\n    var _super = (..._args) => (super(..._args), (this.bar = 'foo'), this);\n    foo(_super());\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo extends Bar {\n  constructor() {\n    super();\n    _defineProperty(this, 'bar', 'foo');\n  }\n}",
  "class Foo extends Bar {\n  constructor() {\n    super();\n    this.bar = 'foo';\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass A {\n  constructor(_force) {\n    _defineProperty(this, 'force', force);\n    _defineProperty(this, 'foo', super.method());\n  }\n}",
  'class A {\n  constructor(_force) {\n    this.force = force;\n    this.foo = super.method();\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _Symbol$search;\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nfunction dec() {}\n_Symbol$search = Symbol.search;\nclass A {\n  constructor() {\n    _defineProperty(this, 'a', void 0);\n  }\n  [_Symbol$search]() {}\n}\n_decorate([dec], A.prototype, 'a', void 0);",
  "let _Symbol$search;\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nfunction dec() {}\n_Symbol$search = Symbol.search;\nclass A {\n  constructor() {\n    this.a = void 0;\n  }\n  [_Symbol$search]() {}\n}\n_decorate([dec], A.prototype, 'a', void 0);",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nexpect(() => {\n  let _ref;\n  _ref = Foo + 1;\n  class Foo {\n    constructor() {\n      _defineProperty(this, _ref, 2);\n    }\n  }\n}).toThrow(ReferenceError);",
  'expect(() => {\n  let _ref;\n  _ref = Foo + 1;\n  class Foo {\n    constructor() {\n      this[_ref] = 2;\n    }\n  }\n}).toThrow(ReferenceError);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _ref;\n_ref = Foo + 1;\nclass Foo {\n  constructor() {\n    _defineProperty(this, _ref, 2);\n  }\n}",
  'let _ref;\n_ref = Foo + 1;\nclass Foo {\n  constructor() {\n    this[_ref] = 2;\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nexpect(() => {\n  let _x$x;\n  _x$x = { x: A || 0 }.x;\n  class A {}\n  _defineProperty(A, _x$x, void 0);\n}).toThrow(ReferenceError);",
  'expect(() => {\n  let _x$x;\n  _x$x = { x: A || 0 }.x;\n  class A {}\n  A[_x$x] = void 0;\n}).toThrow(ReferenceError);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _x$x;\n_x$x = { x: A || 0 }.x;\nclass A {}\n_defineProperty(A, _x$x, void 0);",
  'let _x$x;\n_x$x = { x: A || 0 }.x;\nclass A {}\nA[_x$x] = void 0;',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nexpect(() => {\n  let _ref;\n  _ref = C + 3;\n  class C {}\n  _defineProperty(C, _ref, 3);\n}).toThrow(ReferenceError);",
  'expect(() => {\n  let _ref;\n  _ref = C + 3;\n  class C {}\n  C[_ref] = 3;\n}).toThrow(ReferenceError);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _ref;\n_ref = C + 3;\nclass C {}\n_defineProperty(C, _ref, 3);",
  'let _ref;\n_ref = C + 3;\nclass C {}\nC[_ref] = 3;',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'a', void 0);\n  }\n}\n_decorate([dec(function () {})], Foo.prototype, 'a', void 0);",
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass Foo {\n  constructor() {\n    this.a = void 0;\n  }\n}\n_decorate([dec(function () {})], Foo.prototype, 'a', void 0);",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass C {\n  constructor(T) {\n    _defineProperty(\n      this,\n      // Output should not use `_initialiseProps`\n      'x',\n      void 0,\n    );\n    _defineProperty(this, 'y', 0);\n  }\n}",
  'class C {\n  constructor(T) {\n    this.x = void 0;\n    this.y = 0;\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass C {\n  constructor() {\n    _defineProperty(\n      this,\n      /* before a */\n      'a',\n      void 0,\n    );\n  }\n}\n_defineProperty(C, 'b', void 0);",
  'class C {\n  constructor() {\n    this.a = void 0;\n  }\n}\nC.b = void 0;',
  "var _defineProperty2 = require('@babel/runtime/helpers/defineProperty');\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nfunction dec() {}\n// Create a local function binding so babel has to change the name of the helper\nfunction _defineProperty() {}\nclass A {\n  constructor() {\n    _defineProperty2(this, 'a', void 0);\n    _defineProperty2(this, 'b', 123);\n    _defineProperty2(this, 'c', 456);\n  }\n}\n_decorate([dec], A.prototype, 'a', void 0);\n_decorate([dec], A.prototype, 'b', void 0);",
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nfunction dec() {}\n// Create a local function binding so babel has to change the name of the helper\nfunction _defineProperty() {}\nclass A {\n  constructor() {\n    this.a = void 0;\n    this.b = 123;\n    this.c = 456;\n  }\n}\n_decorate([dec], A.prototype, 'a', void 0);\n_decorate([dec], A.prototype, 'b', void 0);",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nfunction dec() {}\nclass A {\n  constructor() {\n    _defineProperty(this, 'a', void 0);\n    _defineProperty(this, 'b', 123);\n    _defineProperty(this, 'c', 456);\n  }\n}\n_decorate([dec], A.prototype, 'a', void 0);\n_decorate([dec], A.prototype, 'b', void 0);",
  "function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nfunction dec() {}\nclass A {\n  constructor() {\n    this.a = void 0;\n    this.b = 123;\n    this.c = 456;\n  }\n}\n_decorate([dec], A.prototype, 'a', void 0);\n_decorate([dec], A.prototype, 'b', void 0);",
  'function _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nlet Foo = class Foo {};\nFoo = _decorate([deco], Foo);',
  "'use strict';\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass Hello {\n  constructor() {\n    return () => () => 'hello';\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    class Inner {\n      constructor() {\n        _defineProperty(this, 'hello', void 0);\n      }\n    }\n    _decorate([super()], Inner.prototype, 'hello', void 0);\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  "'use strict';\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass Hello {\n  constructor() {\n    return () => () => 'hello';\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    class Inner {\n      constructor() {\n        this.hello = void 0;\n      }\n    }\n    _decorate([super()], Inner.prototype, 'hello', void 0);\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  "'use strict';\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Hello {\n  constructor() {\n    return {\n      toString() {\n        return 'hello';\n      },\n    };\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    let _super;\n    _super = super();\n    class Inner {\n      constructor() {\n        _defineProperty(this, _super, 'hello');\n      }\n    }\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  "'use strict';\nclass Hello {\n  constructor() {\n    return {\n      toString() {\n        return 'hello';\n      },\n    };\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    let _super;\n    _super = super();\n    class Inner {\n      constructor() {\n        this[_super] = 'hello';\n      }\n    }\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  "'use strict';\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      accessor [super.toString()] = 'hello';\n    }\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  "'use strict';\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass Hello {\n  dec() {\n    return () => 'hello';\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      constructor() {\n        _defineProperty(this, 'hello', void 0);\n      }\n    }\n    _decorate([super.dec], Inner.prototype, 'hello', void 0);\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  "'use strict';\nfunction _decorate(decorators, target, key, descriptor) {\n  var argumentCount = arguments.length;\n  var result =\n    argumentCount < 3\n      ? target\n      : descriptor === null\n        ? (descriptor = Object.getOwnPropertyDescriptor(target, key))\n        : descriptor;\n  var decorator;\n  for (var index = decorators.length - 1; index >= 0; index--) {\n    if ((decorator = decorators[index]))\n      result =\n        (argumentCount < 3\n          ? decorator(result)\n          : argumentCount > 3\n            ? decorator(target, key, result)\n            : decorator(target, key)) || result;\n  }\n  if (argumentCount > 3 && result) Object.defineProperty(target, key, result);\n  return result;\n}\nclass Hello {\n  dec() {\n    return () => 'hello';\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      constructor() {\n        this.hello = void 0;\n      }\n    }\n    _decorate([super.dec], Inner.prototype, 'hello', void 0);\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  "'use strict';\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    let _super$toString;\n    super();\n    _super$toString = super.toString();\n    class Inner {\n      constructor() {\n        _defineProperty(this, _super$toString, 'hello');\n      }\n    }\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  "'use strict';\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\nclass Outer extends Hello {\n  constructor() {\n    let _super$toString;\n    super();\n    _super$toString = super.toString();\n    class Inner {\n      constructor() {\n        this[_super$toString] = 'hello';\n      }\n    }\n    return new Inner();\n  }\n}\nexpect(new Outer().hello).toBe('hello');",
  'expect(() => {\n  var _C;\n  class C {\n    constructor() {\n      _p._;\n    }\n  }\n  _C = C;\n  var _ = { _: new _C() };\n  var _p = { _: void 0 };\n}).toThrow(/attempted to use private field on non-instance/);\nexpect(() => {\n  var _C2;\n  class C {\n    constructor() {\n      _p2._ = 0;\n    }\n  }\n  _C2 = C;\n  var _2 = { _: new _C2() };\n  var _p2 = { _: void 0 };\n}).toThrow(/attempted to use private field on non-instance/);\nexpect(() => {\n  var _C3;\n  class C {\n    constructor() {\n      for (_p3._ of [0]);\n    }\n  }\n  _C3 = C;\n  var _3 = { _: new _C3() };\n  var _p3 = { _: void 0 };\n}).toThrow(/attempted to use private field on non-instance/);',
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nexpect(() => {\n  var _C;\n  var _ = /* @__PURE__ */ _classPrivateFieldLooseKey('_');\n  var _p = /* @__PURE__ */ _classPrivateFieldLooseKey('p');\n  class C {\n    constructor() {\n      _classPrivateFieldLooseBase(C, _p)[_p];\n    }\n  }\n  _C = C;\n  Object.defineProperty(C, _, {\n    writable: true,\n    value: new _C(),\n  });\n  Object.defineProperty(C, _p, {\n    writable: true,\n    value: void 0,\n  });\n}).toThrow(/attempted to use private field on non-instance/);\nexpect(() => {\n  var _C2;\n  var _2 = /* @__PURE__ */ _classPrivateFieldLooseKey('_');\n  var _p2 = /* @__PURE__ */ _classPrivateFieldLooseKey('p');\n  class C {\n    constructor() {\n      _classPrivateFieldLooseBase(C, _p2)[_p2] = 0;\n    }\n  }\n  _C2 = C;\n  Object.defineProperty(C, _2, {\n    writable: true,\n    value: new _C2(),\n  });\n  Object.defineProperty(C, _p2, {\n    writable: true,\n    value: void 0,\n  });\n}).toThrow(/attempted to use private field on non-instance/);\nexpect(() => {\n  var _C3;\n  var _3 = /* @__PURE__ */ _classPrivateFieldLooseKey('_');\n  var _p3 = /* @__PURE__ */ _classPrivateFieldLooseKey('p');\n  class C {\n    constructor() {\n      for (_classPrivateFieldLooseBase(C, _p3)[_p3] of [0]);\n    }\n  }\n  _C3 = C;\n  Object.defineProperty(C, _3, {\n    writable: true,\n    value: new _C3(),\n  });\n  Object.defineProperty(C, _p3, {\n    writable: true,\n    value: void 0,\n  });\n}).toThrow(/attempted to use private field on non-instance/);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 0);\n  }\n  test(other) {\n    var _other$obj;\n    _classPrivateFieldSet(_foo, this, _classPrivateFieldGet(_foo, this) + 1);\n    _classPrivateFieldSet(_foo, this, 2);\n    _classPrivateFieldSet(\n      _foo,\n      (_other$obj = other.obj),\n      _classPrivateFieldGet(_foo, _other$obj) + 1,\n    );\n    _classPrivateFieldSet(_foo, other.obj, 2);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 0,\n    });\n  }\n  test(other) {\n    _classPrivateFieldLooseBase(this, _foo)[_foo] += 1;\n    _classPrivateFieldLooseBase(this, _foo)[_foo] = 2;\n    _classPrivateFieldLooseBase(other.obj, _foo)[_foo] += 1;\n    _classPrivateFieldLooseBase(other.obj, _foo)[_foo] = 2;\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, function () {\n      return this;\n    });\n  }\n  test(other) {\n    return [\n      _classPrivateFieldGet(_foo, this).call(this),\n      _classPrivateFieldGet(_foo, other).call(other),\n    ];\n  }\n}\nconst f = new Foo();\nconst o = new Foo();\nconst test = f.test(o);\nexpect(test[0]).toBe(f);\nexpect(test[1]).toBe(o);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: function () {\n        return this;\n      },\n    });\n  }\n  test(other) {\n    return [\n      _classPrivateFieldLooseBase(this, _foo)[_foo](),\n      _classPrivateFieldLooseBase(other, _foo)[_foo](),\n    ];\n  }\n}\nconst f = new Foo();\nconst o = new Foo();\nconst test = f.test(o);\nexpect(test[0]).toBe(f);\nexpect(test[1]).toBe(o);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, function () {\n      return this;\n    });\n  }\n  test(other) {\n    var _other$obj;\n    _classPrivateFieldGet(_foo, this).call(this);\n    _classPrivateFieldGet(_foo, (_other$obj = other.obj)).call(_other$obj);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: function () {\n        return this;\n      },\n    });\n  }\n  test(other) {\n    _classPrivateFieldLooseBase(this, _foo)[_foo]();\n    _classPrivateFieldLooseBase(other.obj, _foo)[_foo]();\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _x = /* @__PURE__ */ new WeakMap();\nvar _y = /* @__PURE__ */ new WeakMap();\nclass Point {\n  constructor(x = 0, y = 0) {\n    _classPrivateFieldInitSpec(this, _x, void 0);\n    _classPrivateFieldInitSpec(this, _y, void 0);\n    _classPrivateFieldSet(_x, this, +x);\n    _classPrivateFieldSet(_y, this, +y);\n  }\n  get x() {\n    return _classPrivateFieldGet(_x, this);\n  }\n  set x(value) {\n    _classPrivateFieldSet(_x, this, +value);\n  }\n  get y() {\n    return _classPrivateFieldGet(_y, this);\n  }\n  set y(value) {\n    _classPrivateFieldSet(_y, this, +value);\n  }\n  equals(p) {\n    return (\n      _classPrivateFieldGet(_x, this) === _classPrivateFieldGet(_x, p) &&\n      _classPrivateFieldGet(_y, this) === _classPrivateFieldGet(_y, p)\n    );\n  }\n  toString() {\n    return `Point<${_classPrivateFieldGet(_x, this)},${_classPrivateFieldGet(_y, this)}>`;\n  }\n}\nconst p1 = new Point(1, 2);\nconst p2 = new Point(2, 3);\nconst p3 = new Point(1, 2);\nexpect(p1.x).toBe(1);\nexpect(p1.y).toBe(2);\nexpect(p2.x).toBe(2);\nexpect(p2.y).toBe(3);\nexpect(p3.x).toBe(1);\nexpect(p3.y).toBe(2);\nexpect(p1.equals(p1)).toBe(true);\nexpect(p1.equals(p2)).toBe(false);\nexpect(p1.equals(p3)).toBe(true);\nexpect(p2.equals(p1)).toBe(false);\nexpect(p2.equals(p2)).toBe(true);\nexpect(p2.equals(p3)).toBe(false);\nexpect(p3.equals(p1)).toBe(true);\nexpect(p3.equals(p2)).toBe(false);\nexpect(p3.equals(p3)).toBe(true);\nexpect(p1.toString()).toBe('Point<1,2>');\nexpect(p2.toString()).toBe('Point<2,3>');\nexpect(p3.toString()).toBe('Point<1,2>');\np1.x += 1;\np1.y = 3;\np2.x -= 1;\np2.y = 3;\np3.x = 0;\np3.y = 0;\nexpect(p1.x).toBe(2);\nexpect(p1.y).toBe(3);\nexpect(p2.x).toBe(1);\nexpect(p2.y).toBe(3);\nexpect(p3.x).toBe(0);\nexpect(p3.y).toBe(0);\nexpect(p1.equals(p1)).toBe(true);\nexpect(p1.equals(p2)).toBe(false);\nexpect(p1.equals(p3)).toBe(false);\nexpect(p2.equals(p1)).toBe(false);\nexpect(p2.equals(p2)).toBe(true);\nexpect(p2.equals(p3)).toBe(false);\nexpect(p3.equals(p1)).toBe(false);\nexpect(p3.equals(p2)).toBe(false);\nexpect(p3.equals(p3)).toBe(true);\nexpect(p1.toString()).toBe('Point<2,3>');\nexpect(p2.toString()).toBe('Point<1,3>');\nexpect(p3.toString()).toBe('Point<0,0>');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');\nclass Point {\n  constructor(x = 0, y = 0) {\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: void 0,\n    });\n    Object.defineProperty(this, _y, {\n      writable: true,\n      value: void 0,\n    });\n    _classPrivateFieldLooseBase(this, _x)[_x] = +x;\n    _classPrivateFieldLooseBase(this, _y)[_y] = +y;\n  }\n  get x() {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  }\n  set x(value) {\n    _classPrivateFieldLooseBase(this, _x)[_x] = +value;\n  }\n  get y() {\n    return _classPrivateFieldLooseBase(this, _y)[_y];\n  }\n  set y(value) {\n    _classPrivateFieldLooseBase(this, _y)[_y] = +value;\n  }\n  equals(p) {\n    return (\n      _classPrivateFieldLooseBase(this, _x)[_x] === _classPrivateFieldLooseBase(p, _x)[_x] &&\n      _classPrivateFieldLooseBase(this, _y)[_y] === _classPrivateFieldLooseBase(p, _y)[_y]\n    );\n  }\n  toString() {\n    return `Point<${_classPrivateFieldLooseBase(this, _x)[_x]},${_classPrivateFieldLooseBase(this, _y)[_y]}>`;\n  }\n}\nconst p1 = new Point(1, 2);\nconst p2 = new Point(2, 3);\nconst p3 = new Point(1, 2);\nexpect(p1.x).toBe(1);\nexpect(p1.y).toBe(2);\nexpect(p2.x).toBe(2);\nexpect(p2.y).toBe(3);\nexpect(p3.x).toBe(1);\nexpect(p3.y).toBe(2);\nexpect(p1.equals(p1)).toBe(true);\nexpect(p1.equals(p2)).toBe(false);\nexpect(p1.equals(p3)).toBe(true);\nexpect(p2.equals(p1)).toBe(false);\nexpect(p2.equals(p2)).toBe(true);\nexpect(p2.equals(p3)).toBe(false);\nexpect(p3.equals(p1)).toBe(true);\nexpect(p3.equals(p2)).toBe(false);\nexpect(p3.equals(p3)).toBe(true);\nexpect(p1.toString()).toBe('Point<1,2>');\nexpect(p2.toString()).toBe('Point<2,3>');\nexpect(p3.toString()).toBe('Point<1,2>');\np1.x += 1;\np1.y = 3;\np2.x -= 1;\np2.y = 3;\np3.x = 0;\np3.y = 0;\nexpect(p1.x).toBe(2);\nexpect(p1.y).toBe(3);\nexpect(p2.x).toBe(1);\nexpect(p2.y).toBe(3);\nexpect(p3.x).toBe(0);\nexpect(p3.y).toBe(0);\nexpect(p1.equals(p1)).toBe(true);\nexpect(p1.equals(p2)).toBe(false);\nexpect(p1.equals(p3)).toBe(false);\nexpect(p2.equals(p1)).toBe(false);\nexpect(p2.equals(p2)).toBe(true);\nexpect(p2.equals(p3)).toBe(false);\nexpect(p3.equals(p1)).toBe(false);\nexpect(p3.equals(p2)).toBe(false);\nexpect(p3.equals(p3)).toBe(true);\nexpect(p1.toString()).toBe('Point<2,3>');\nexpect(p2.toString()).toBe('Point<1,3>');\nexpect(p3.toString()).toBe('Point<0,0>');",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _x = /* @__PURE__ */ new WeakMap();\nvar _y = /* @__PURE__ */ new WeakMap();\nclass Point {\n  constructor(x = 0, y = 0) {\n    _classPrivateFieldInitSpec(this, _x, void 0);\n    _classPrivateFieldInitSpec(this, _y, void 0);\n    _classPrivateFieldSet(_x, this, +x);\n    _classPrivateFieldSet(_y, this, +y);\n  }\n  get x() {\n    return _classPrivateFieldGet(_x, this);\n  }\n  set x(value) {\n    _classPrivateFieldSet(_x, this, +value);\n  }\n  get y() {\n    return _classPrivateFieldGet(_y, this);\n  }\n  set y(value) {\n    _classPrivateFieldSet(_y, this, +value);\n  }\n  equals(p) {\n    return (\n      _classPrivateFieldGet(_x, this) === _classPrivateFieldGet(_x, p) &&\n      _classPrivateFieldGet(_y, this) === _classPrivateFieldGet(_y, p)\n    );\n  }\n  toString() {\n    return `Point<${_classPrivateFieldGet(_x, this)},${_classPrivateFieldGet(_y, this)}>`;\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');\nclass Point {\n  constructor(x = 0, y = 0) {\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: void 0,\n    });\n    Object.defineProperty(this, _y, {\n      writable: true,\n      value: void 0,\n    });\n    _classPrivateFieldLooseBase(this, _x)[_x] = +x;\n    _classPrivateFieldLooseBase(this, _y)[_y] = +y;\n  }\n  get x() {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  }\n  set x(value) {\n    _classPrivateFieldLooseBase(this, _x)[_x] = +value;\n  }\n  get y() {\n    return _classPrivateFieldLooseBase(this, _y)[_y];\n  }\n  set y(value) {\n    _classPrivateFieldLooseBase(this, _y)[_y] = +value;\n  }\n  equals(p) {\n    return (\n      _classPrivateFieldLooseBase(this, _x)[_x] === _classPrivateFieldLooseBase(p, _x)[_x] &&\n      _classPrivateFieldLooseBase(this, _y)[_y] === _classPrivateFieldLooseBase(p, _y)[_y]\n    );\n  }\n  toString() {\n    return `Point<${_classPrivateFieldLooseBase(this, _x)[_x]},${_classPrivateFieldLooseBase(this, _y)[_y]}>`;\n  }\n}",
  "import _classPrivateFieldInitSpec from '@babel/runtime/helpers/classPrivateFieldInitSpec';\nvar _message = /* @__PURE__ */ new WeakMap();\nexport class TypeError {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _message, void 0);\n  }\n}",
  "import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';\nvar _message = /* @__PURE__ */ _classPrivateFieldLooseKey('message');\nexport class TypeError {\n  constructor() {\n    Object.defineProperty(this, _message, {\n      writable: true,\n      value: void 0,\n    });\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar foo = 'bar';\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, foo);\n    var _foo = 'foo';\n  }\n  test() {\n    return _classPrivateFieldGet(_bar, this);\n  }\n}\nconst f = new Foo();\nexpect(f.test()).toBe(foo);\nexpect('bar' in f).toBe(false);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar foo = 'bar';\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: foo,\n    });\n    var _foo = 'foo';\n  }\n  test() {\n    return _classPrivateFieldLooseBase(this, _bar)[_bar];\n  }\n}\nconst f = new Foo();\nexpect(f.test()).toBe(foo);\nexpect('bar' in f).toBe(false);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar foo = 'bar';\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, foo);\n    var _foo = 'foo';\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar foo = 'bar';\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: foo,\n    });\n    var _foo = 'foo';\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _x = /* @__PURE__ */ new WeakMap();\nclass C {\n  constructor() {\n    _defineProperty(this, 'y', _classPrivateFieldGet(_x, this));\n    _classPrivateFieldInitSpec(this, _x, void 0);\n  }\n}\nexpect(() => {\n  new C();\n}).toThrow();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nclass C {\n  constructor() {\n    this.y = _classPrivateFieldLooseBase(this, _x)[_x];\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: void 0,\n    });\n  }\n}\nexpect(() => {\n  new C();\n}).toThrow();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo extends Bar {\n  constructor() {\n    var _super = (..._args) => (\n      super(..._args),\n      _classPrivateFieldInitSpec(this, _bar, 'foo'),\n      this\n    );\n    if (condition) {\n      _super();\n    } else {\n      _super();\n    }\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo extends Bar {\n  constructor() {\n    var _super = (..._args) => (\n      super(..._args),\n      Object.defineProperty(this, _bar, {\n        writable: true,\n        value: 'foo',\n      }),\n      this\n    );\n    if (condition) {\n      _super();\n    } else {\n      _super();\n    }\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _prop = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _prop, 'foo');\n  }\n  foo() {\n    return _classPrivateFieldGet(_prop, this);\n  }\n}\nvar _prop2 = /* @__PURE__ */ new WeakMap();\nclass Bar extends Foo {\n  constructor(..._args) {\n    super(..._args);\n    _classPrivateFieldInitSpec(this, _prop2, 'bar');\n  }\n  bar() {\n    return _classPrivateFieldGet(_prop2, this);\n  }\n}\nconst f = new Foo();\nexpect(f.foo()).toBe('foo');\nconst b = new Bar();\nexpect(b.foo()).toBe('foo');\nexpect(b.bar()).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _prop = /* @__PURE__ */ _classPrivateFieldLooseKey('prop');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _prop, {\n      writable: true,\n      value: 'foo',\n    });\n  }\n  foo() {\n    return _classPrivateFieldLooseBase(this, _prop)[_prop];\n  }\n}\nvar _prop2 = /* @__PURE__ */ _classPrivateFieldLooseKey('prop');\nclass Bar extends Foo {\n  constructor(..._args) {\n    super(..._args);\n    Object.defineProperty(this, _prop2, {\n      writable: true,\n      value: 'bar',\n    });\n  }\n  bar() {\n    return _classPrivateFieldLooseBase(this, _prop2)[_prop2];\n  }\n}\nconst f = new Foo();\nexpect(f.foo()).toBe('foo');\nconst b = new Bar();\nexpect(b.foo()).toBe('foo');\nexpect(b.bar()).toBe('bar');",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _prop = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _prop, 'foo');\n  }\n}\nvar _prop2 = /* @__PURE__ */ new WeakMap();\nclass Bar extends Foo {\n  constructor(..._args) {\n    super(..._args);\n    _classPrivateFieldInitSpec(this, _prop2, 'bar');\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _prop = /* @__PURE__ */ _classPrivateFieldLooseKey('prop');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _prop, {\n      writable: true,\n      value: 'foo',\n    });\n  }\n}\nvar _prop2 = /* @__PURE__ */ _classPrivateFieldLooseKey('prop');\nclass Bar extends Foo {\n  constructor(..._args) {\n    super(..._args);\n    Object.defineProperty(this, _prop2, {\n      writable: true,\n      value: 'bar',\n    });\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    _classPrivateFieldSet(_client, this, 1);\n    [\n      this.x = _classPrivateFieldGet(_client, this),\n      _toSetter(_classPrivateFieldSet, [_client, this])._,\n      this.y = _classPrivateFieldGet(_client, this),\n    ] = props;\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo([undefined, 'bar']);\nexpect(foo.getClient()).toBe('bar');\nexpect(foo.x).toBe(1);\nexpect(foo.y).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    _classPrivateFieldLooseBase(this, _client)[_client] = 1;\n    [\n      this.x = _classPrivateFieldLooseBase(this, _client)[_client],\n      _classPrivateFieldLooseBase(this, _client)[_client],\n      this.y = _classPrivateFieldLooseBase(this, _client)[_client],\n    ] = props;\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo([undefined, 'bar']);\nexpect(foo.getClient()).toBe('bar');\nexpect(foo.x).toBe(1);\nexpect(foo.y).toBe('bar');",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    _classPrivateFieldSet(_client, this, 1);\n    [\n      this.x = _classPrivateFieldGet(_client, this),\n      _toSetter(_classPrivateFieldSet, [_client, this])._,\n      this.y = _classPrivateFieldGet(_client, this),\n    ] = props;\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    _classPrivateFieldLooseBase(this, _client)[_client] = 1;\n    [\n      this.x = _classPrivateFieldLooseBase(this, _client)[_client],\n      _classPrivateFieldLooseBase(this, _client)[_client],\n      this.y = _classPrivateFieldLooseBase(this, _client)[_client],\n    ] = props;\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    let x;\n    [x, ..._toSetter(_classPrivateFieldSet, [_client, this])._] = props;\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo(['foo', 'bar', 'baz', 'quu']);\nexpect(foo.getClient()).toEqual(['bar', 'baz', 'quu']);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    let x;\n    [x, ..._classPrivateFieldLooseBase(this, _client)[_client]] = props;\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo(['foo', 'bar', 'baz', 'quu']);\nexpect(foo.getClient()).toEqual(['bar', 'baz', 'quu']);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    [x, ..._toSetter(_classPrivateFieldSet, [_client, this])._] = props;\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    [x, ..._classPrivateFieldLooseBase(this, _client)[_client]] = props;\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    [_toSetter(_classPrivateFieldSet, [_client, this])._ = 5] = props;\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo([]);\nexpect(foo.getClient()).toEqual(5);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    [_classPrivateFieldLooseBase(this, _client)[_client] = 5] = props;\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo([]);\nexpect(foo.getClient()).toEqual(5);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    [_toSetter(_classPrivateFieldSet, [_client, this])._ = 5] = props;\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    [_classPrivateFieldLooseBase(this, _client)[_client] = 5] = props;\n  }\n}",
  "class Foo {\n  constructor(props) {\n    [_client._] = props;\n  }\n  getClient() {\n    return _client._;\n  }\n}\nvar _client = { _: void 0 };\nconst foo = new Foo(['bar']);\nexpect(foo.getClient()).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    [_classPrivateFieldLooseBase(Foo, _client)[_client]] = props;\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(Foo, _client)[_client];\n  }\n}\nObject.defineProperty(Foo, _client, {\n  writable: true,\n  value: void 0,\n});\nconst foo = new Foo(['bar']);\nexpect(foo.getClient()).toBe('bar');",
  'class Foo {\n  constructor(props) {\n    [_client._] = props;\n  }\n}\nvar _client = { _: void 0 };',
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    [_classPrivateFieldLooseBase(Foo, _client)[_client]] = props;\n  }\n}\nObject.defineProperty(Foo, _client, {\n  writable: true,\n  value: void 0,\n});",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    [_toSetter(_classPrivateFieldSet, [_client, this])._] = props;\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo(['bar']);\nexpect(foo.getClient()).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    [_classPrivateFieldLooseBase(this, _client)[_client]] = props;\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo(['bar']);\nexpect(foo.getClient()).toBe('bar');",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    [_toSetter(_classPrivateFieldSet, [_client, this])._] = props;\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    [_classPrivateFieldLooseBase(this, _client)[_client]] = props;\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    _classPrivateFieldSet(_client, this, 'foo');\n    ({\n      x: this.x = _classPrivateFieldGet(_client, this),\n      y: _toSetter(_classPrivateFieldSet, [_client, this])._,\n      z: this.z = _classPrivateFieldGet(_client, this),\n    } = props);\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo({ y: 'bar' });\nexpect(foo.getClient()).toBe('bar');\nexpect(foo.x).toBe('foo');\nexpect(foo.z).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    _classPrivateFieldLooseBase(this, _client)[_client] = 'foo';\n    ({\n      x: this.x = _classPrivateFieldLooseBase(this, _client)[_client],\n      y: _classPrivateFieldLooseBase(this, _client)[_client],\n      z: this.z = _classPrivateFieldLooseBase(this, _client)[_client],\n    } = props);\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo({ y: 'bar' });\nexpect(foo.getClient()).toBe('bar');\nexpect(foo.x).toBe('foo');\nexpect(foo.z).toBe('bar');",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    _classPrivateFieldSet(_client, this, 'foo');\n    ({\n      x: this.x = _classPrivateFieldGet(_client, this),\n      y: _toSetter(_classPrivateFieldSet, [_client, this])._,\n      z: this.z = _classPrivateFieldGet(_client, this),\n    } = props);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    _classPrivateFieldLooseBase(this, _client)[_client] = 'foo';\n    ({\n      x: this.x = _classPrivateFieldLooseBase(this, _client)[_client],\n      y: _classPrivateFieldLooseBase(this, _client)[_client],\n      z: this.z = _classPrivateFieldLooseBase(this, _client)[_client],\n    } = props);\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    let x;\n    ({ x, ..._toSetter(_classPrivateFieldSet, [_client, this])._ } = props);\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo({\n  x: 'foo',\n  y: 'bar',\n  z: 'baz',\n});\nexpect(foo.getClient()).toEqual({\n  y: 'bar',\n  z: 'baz',\n});",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    let x;\n    ({ x, ..._classPrivateFieldLooseBase(this, _client)[_client] } = props);\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo({\n  x: 'foo',\n  y: 'bar',\n  z: 'baz',\n});\nexpect(foo.getClient()).toEqual({\n  y: 'bar',\n  z: 'baz',\n});",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    ({ x, ..._toSetter(_classPrivateFieldSet, [_client, this])._ } = props);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    ({ x, ..._classPrivateFieldLooseBase(this, _client)[_client] } = props);\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    ({ client: _toSetter(_classPrivateFieldSet, [_client, this])._ = 5 } = props);\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo({});\nexpect(foo.getClient()).toEqual(5);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    ({ client: _classPrivateFieldLooseBase(this, _client)[_client] = 5 } = props);\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo({});\nexpect(foo.getClient()).toEqual(5);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    ({ client: _toSetter(_classPrivateFieldSet, [_client, this])._ = 5 } = props);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    ({ client: _classPrivateFieldLooseBase(this, _client)[_client] = 5 } = props);\n  }\n}",
  "class Foo {\n  constructor(props) {\n    ({ client: _client._ } = props);\n  }\n  getClient() {\n    return _client._;\n  }\n}\nvar _client = { _: void 0 };\nconst foo = new Foo({ client: 'bar' });\nexpect(foo.getClient()).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    ({ client: _classPrivateFieldLooseBase(Foo, _client)[_client] } = props);\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(Foo, _client)[_client];\n  }\n}\nObject.defineProperty(Foo, _client, {\n  writable: true,\n  value: void 0,\n});\nconst foo = new Foo({ client: 'bar' });\nexpect(foo.getClient()).toBe('bar');",
  'class Foo {\n  constructor(props) {\n    ({ client: _client._ } = props);\n  }\n}\nvar _client = { _: void 0 };',
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    ({ client: _classPrivateFieldLooseBase(Foo, _client)[_client] } = props);\n  }\n}\nObject.defineProperty(Foo, _client, {\n  writable: true,\n  value: void 0,\n});",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    ({ client: _toSetter(_classPrivateFieldSet, [_client, this])._ } = props);\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo({ client: 'bar' });\nexpect(foo.getClient()).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    ({ client: _classPrivateFieldLooseBase(this, _client)[_client] } = props);\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo({ client: 'bar' });\nexpect(foo.getClient()).toBe('bar');",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    ({ client: _toSetter(_classPrivateFieldSet, [_client, this])._ } = props);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    ({ client: _classPrivateFieldLooseBase(this, _client)[_client] } = props);\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar foo = 'bar';\nvar _bar = /* @__PURE__ */ new WeakMap();\nvar _baz = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(_foo) {\n    _classPrivateFieldInitSpec(this, _bar, this);\n    _classPrivateFieldInitSpec(this, _baz, foo);\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar foo = 'bar';\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nvar _baz = /* @__PURE__ */ _classPrivateFieldLooseKey('baz');\nclass Foo {\n  constructor(_foo) {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: this,\n    });\n    Object.defineProperty(this, _baz, {\n      writable: true,\n      value: foo,\n    });\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _scopedFunctionWithThis = /* @__PURE__ */ new WeakMap();\nclass Child extends Parent {\n  constructor() {\n    super();\n    _classPrivateFieldInitSpec(this, _scopedFunctionWithThis, () => {\n      this.name = {};\n    });\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _scopedFunctionWithThis = /* @__PURE__ */ _classPrivateFieldLooseKey('scopedFunctionWithThis');\nclass Child extends Parent {\n  constructor() {\n    super();\n    Object.defineProperty(this, _scopedFunctionWithThis, {\n      writable: true,\n      value: () => {\n        this.name = {};\n      },\n    });\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, void 0);\n  }\n  test() {\n    return _classPrivateFieldGet(_bar, this);\n  }\n}\nexpect(new Foo().test()).toBe(undefined);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  test() {\n    return _classPrivateFieldLooseBase(this, _bar)[_bar];\n  }\n}\nexpect(new Foo().test()).toBe(undefined);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, void 0);\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: void 0,\n    });\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, 'foo');\n  }\n  test() {\n    return _classPrivateFieldGet(_bar, this);\n  }\n  static test(foo) {\n    return _classPrivateFieldGet(_bar, foo);\n  }\n}\nconst f = new Foo();\nexpect(f.test()).toBe('foo');\nexpect(Foo.test(f)).toBe('foo');\nexpect('bar' in f).toBe(false);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 'foo',\n    });\n  }\n  test() {\n    return _classPrivateFieldLooseBase(this, _bar)[_bar];\n  }\n  static test(foo) {\n    return _classPrivateFieldLooseBase(foo, _bar)[_bar];\n  }\n}\nconst f = new Foo();\nexpect(f.test()).toBe('foo');\nexpect(Foo.test(f)).toBe('foo');\nexpect('bar' in f).toBe(false);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, 'foo');\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 'foo',\n    });\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _nullish = /* @__PURE__ */ new WeakMap();\nvar _and = /* @__PURE__ */ new WeakMap();\nvar _or = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _nullish, 0);\n    _classPrivateFieldInitSpec(this, _and, 0);\n    _classPrivateFieldInitSpec(this, _or, 0);\n  }\n  self() {\n    return this;\n  }\n  test() {\n    var _this$self;\n    _classPrivateFieldGet(_nullish, this) ?? _classPrivateFieldSet(_nullish, this, 42);\n    _classPrivateFieldGet(_and, this) && _classPrivateFieldSet(_and, this, 0);\n    _classPrivateFieldGet(_or, this) || _classPrivateFieldSet(_or, this, 0);\n    _classPrivateFieldGet(_nullish, (_this$self = this.self())) ??\n      _classPrivateFieldSet(_nullish, _this$self, 42);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _nullish = /* @__PURE__ */ _classPrivateFieldLooseKey('nullish');\nvar _and = /* @__PURE__ */ _classPrivateFieldLooseKey('and');\nvar _or = /* @__PURE__ */ _classPrivateFieldLooseKey('or');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _nullish, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _and, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _or, {\n      writable: true,\n      value: 0,\n    });\n  }\n  self() {\n    return this;\n  }\n  test() {\n    _classPrivateFieldLooseBase(this, _nullish)[_nullish] ??= 42;\n    _classPrivateFieldLooseBase(this, _and)[_and] &&= 0;\n    _classPrivateFieldLooseBase(this, _or)[_or] ||= 0;\n    _classPrivateFieldLooseBase(this.self(), _nullish)[_nullish] ??= 42;\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _x = /* @__PURE__ */ new WeakMap();\nvar _y = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _x, 0);\n    _classPrivateFieldInitSpec(this, _y, _classPrivateFieldGet(_x, this) + 1);\n  }\n  test() {\n    return _classPrivateFieldGet(_y, this);\n  }\n}\nconst f = new Foo();\nexpect(f.test()).toBe(1);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _y, {\n      writable: true,\n      value: _classPrivateFieldLooseBase(this, _x)[_x] + 1,\n    });\n  }\n  test() {\n    return _classPrivateFieldLooseBase(this, _y)[_y];\n  }\n}\nconst f = new Foo();\nexpect(f.test()).toBe(1);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _x = /* @__PURE__ */ new WeakMap();\nvar _y = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _x, 0);\n    _classPrivateFieldInitSpec(this, _y, _classPrivateFieldGet(_x, this));\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _y = /* @__PURE__ */ _classPrivateFieldLooseKey('y');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _y, {\n      writable: true,\n      value: _classPrivateFieldLooseBase(this, _x)[_x],\n    });\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, 'bar');\n  }\n  static test() {\n    return _foo._;\n  }\n  test() {\n    return _classPrivateFieldGet(_bar, this);\n  }\n}\nvar _foo = { _: 'foo' };\nconst f = new Foo();\nexpect('foo' in Foo).toBe(false);\nexpect('bar' in f).toBe(false);\nexpect(Foo.test()).toBe('foo');\nexpect(f.test()).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 'bar',\n    });\n  }\n  static test() {\n    return _classPrivateFieldLooseBase(Foo, _foo)[_foo];\n  }\n  test() {\n    return _classPrivateFieldLooseBase(this, _bar)[_bar];\n  }\n}\nObject.defineProperty(Foo, _foo, {\n  writable: true,\n  value: 'foo',\n});\nconst f = new Foo();\nexpect('foo' in Foo).toBe(false);\nexpect('bar' in f).toBe(false);\nexpect(Foo.test()).toBe('foo');\nexpect(f.test()).toBe('bar');",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    let _classPrivateFieldGet2;\n    var _foo2 = /* @__PURE__ */ new WeakMap();\n    _classPrivateFieldGet2 = _classPrivateFieldGet(_foo2, this);\n    class Nested {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _foo2, 2);\n      }\n      [_classPrivateFieldGet2]() {}\n    }\n    return new Nested();\n  }\n}\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).toThrow();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    let _classPrivateFieldLoo;\n    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\n    _classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _foo2)[_foo2];\n    class Nested {\n      constructor() {\n        Object.defineProperty(this, _foo2, {\n          writable: true,\n          value: 2,\n        });\n      }\n      [_classPrivateFieldLoo]() {}\n    }\n    return new Nested();\n  }\n}\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).toThrow();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    let _classPrivateFieldGet2;\n    var _foo2 = /* @__PURE__ */ new WeakMap();\n    _classPrivateFieldGet2 = _classPrivateFieldGet(_foo2, this);\n    class Nested {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _foo2, 2);\n      }\n      [_classPrivateFieldGet2]() {}\n    }\n    _classPrivateFieldGet(_foo, this);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    let _classPrivateFieldLoo;\n    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\n    _classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _foo2)[_foo2];\n    class Nested {\n      constructor() {\n        Object.defineProperty(this, _foo2, {\n          writable: true,\n          value: 2,\n        });\n      }\n      [_classPrivateFieldLoo]() {}\n    }\n    _classPrivateFieldLooseBase(this, _foo)[_foo];\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    class Nested {\n      [_classPrivateFieldGet(_foo, this)]() {}\n    }\n    return new Nested();\n  }\n}\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).not.toThrow();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    class Nested {\n      [_classPrivateFieldLooseBase(this, _foo)[_foo]]() {}\n    }\n    return new Nested();\n  }\n}\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).not.toThrow();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    class Nested {\n      [_classPrivateFieldGet(_foo, this)]() {}\n    }\n    _classPrivateFieldGet(_foo, this);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    class Nested {\n      [_classPrivateFieldLooseBase(this, _foo)[_foo]]() {}\n    }\n    _classPrivateFieldLooseBase(this, _foo)[_foo];\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    var _foo2;\n    let _this$foo;\n    var _foo3 = /* @__PURE__ */ new WeakMap();\n    class Nested extends ((_foo2 = /* @__PURE__ */ new WeakMap()),\n    (_this$foo = _classPrivateFieldGet(_foo2, this)),\n    class {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _foo2, 2);\n        _defineProperty(this, _this$foo, 2);\n      }\n    }) {\n      constructor(..._args) {\n        super(..._args);\n        _classPrivateFieldInitSpec(this, _foo3, 3);\n      }\n    }\n  }\n}\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).toThrow();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    var _foo2;\n    let _this$foo;\n    var _foo3 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\n    class Nested extends ((_foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),\n    (_this$foo = _classPrivateFieldLooseBase(this, _foo2)[_foo2]),\n    class {\n      constructor() {\n        Object.defineProperty(this, _foo2, {\n          writable: true,\n          value: 2,\n        });\n        this[_this$foo] = 2;\n      }\n    }) {\n      constructor(..._args) {\n        super(..._args);\n        Object.defineProperty(this, _foo3, {\n          writable: true,\n          value: 3,\n        });\n      }\n    }\n  }\n}\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).toThrow();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    var _foo2;\n    let _this$foo;\n    var _foo3 = /* @__PURE__ */ new WeakMap();\n    class Nested extends ((_foo2 = /* @__PURE__ */ new WeakMap()),\n    (_this$foo = _classPrivateFieldGet(_foo2, this)),\n    class {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _foo2, 2);\n        _defineProperty(this, _this$foo, 2);\n      }\n    }) {\n      constructor(..._args) {\n        super(..._args);\n        _classPrivateFieldInitSpec(this, _foo3, 3);\n      }\n    }\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    var _foo2;\n    let _this$foo;\n    var _foo3 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\n    class Nested extends ((_foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),\n    (_this$foo = _classPrivateFieldLooseBase(this, _foo2)[_foo2]),\n    class {\n      constructor() {\n        Object.defineProperty(this, _foo2, {\n          writable: true,\n          value: 2,\n        });\n        this[_this$foo] = 2;\n      }\n    }) {\n      constructor(..._args) {\n        super(..._args);\n        Object.defineProperty(this, _foo3, {\n          writable: true,\n          value: 3,\n        });\n      }\n    }\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    let _this$foo;\n    var _foo2 = /* @__PURE__ */ new WeakMap();\n    class Nested extends ((_this$foo = _classPrivateFieldGet(_foo, this)),\n    class {\n      constructor() {\n        _defineProperty(this, _this$foo, 2);\n      }\n    }) {\n      constructor(..._args) {\n        super(..._args);\n        _classPrivateFieldInitSpec(this, _foo2, 3);\n      }\n    }\n    return new Nested();\n  }\n}\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).not.toThrow();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    let _this$foo;\n    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\n    class Nested extends ((_this$foo = _classPrivateFieldLooseBase(this, _foo)[_foo]),\n    class {\n      constructor() {\n        this[_this$foo] = 2;\n      }\n    }) {\n      constructor(..._args) {\n        super(..._args);\n        Object.defineProperty(this, _foo2, {\n          writable: true,\n          value: 3,\n        });\n      }\n    }\n    return new Nested();\n  }\n}\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).not.toThrow();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    let _this$foo;\n    var _foo2 = /* @__PURE__ */ new WeakMap();\n    class Nested extends ((_this$foo = _classPrivateFieldGet(_foo, this)),\n    class {\n      constructor() {\n        _defineProperty(this, _this$foo, 2);\n      }\n    }) {\n      constructor(..._args) {\n        super(..._args);\n        _classPrivateFieldInitSpec(this, _foo2, 3);\n      }\n    }\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    let _this$foo;\n    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\n    class Nested extends ((_this$foo = _classPrivateFieldLooseBase(this, _foo)[_foo]),\n    class {\n      constructor() {\n        this[_this$foo] = 2;\n      }\n    }) {\n      constructor(..._args) {\n        super(..._args);\n        Object.defineProperty(this, _foo2, {\n          writable: true,\n          value: 3,\n        });\n      }\n    }\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n    _classPrivateFieldInitSpec(this, _bar, 1);\n  }\n  test() {\n    var _bar2 = /* @__PURE__ */ new WeakMap();\n    class Nested {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _bar2, 2);\n      }\n      test() {\n        _classPrivateFieldGet(_foo, this);\n        _classPrivateFieldGet(_bar2, this);\n      }\n    }\n    _classPrivateFieldGet(_foo, this);\n    _classPrivateFieldGet(_bar, this);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    var _bar2 = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\n    class Nested {\n      constructor() {\n        Object.defineProperty(this, _bar2, {\n          writable: true,\n          value: 2,\n        });\n      }\n      test() {\n        _classPrivateFieldLooseBase(this, _foo)[_foo];\n        _classPrivateFieldLooseBase(this, _bar2)[_bar2];\n      }\n    }\n    _classPrivateFieldLooseBase(this, _foo)[_foo];\n    _classPrivateFieldLooseBase(this, _bar)[_bar];\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    var _foo2 = /* @__PURE__ */ new WeakMap();\n    class Nested {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _foo2, 2);\n      }\n      test() {\n        _classPrivateFieldGet(_foo2, this);\n      }\n    }\n    _classPrivateFieldGet(_foo, this);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    var _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\n    class Nested {\n      constructor() {\n        Object.defineProperty(this, _foo2, {\n          writable: true,\n          value: 2,\n        });\n      }\n      test() {\n        _classPrivateFieldLooseBase(this, _foo2)[_foo2];\n      }\n    }\n    _classPrivateFieldLooseBase(this, _foo)[_foo];\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 1);\n  }\n  test() {\n    class Nested {\n      test() {\n        _classPrivateFieldGet(_foo, this);\n      }\n    }\n    _classPrivateFieldGet(_foo, this);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  test() {\n    class Nested {\n      test() {\n        _classPrivateFieldLooseBase(this, _foo)[_foo];\n      }\n    }\n    _classPrivateFieldLooseBase(this, _foo)[_foo];\n  }\n}",
  "export default param => {\n  var _App, _props;\n  return (\n    (_App = class App {\n      getParam() {\n        return param;\n      }\n    }),\n    (_props = {\n      _: {\n        prop1: 'prop1',\n        prop2: 'prop2',\n      },\n    }),\n    _App\n  );\n};",
  "import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';\nexport default param => {\n  var _App, _props;\n  return (\n    (_props = /* @__PURE__ */ _classPrivateFieldLooseKey('props')),\n    (_App = class App {\n      getParam() {\n        return param;\n      }\n    }),\n    Object.defineProperty(_App, _props, {\n      writable: true,\n      value: {\n        prop1: 'prop1',\n        prop2: 'prop2',\n      },\n    }),\n    _App\n  );\n};",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _assertClassBrand$_,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _assertClassBrand$_2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _assertClassBrand$_3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _assertClassBrand$_4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._).toEqual(1);\n    expect(\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString,\n    ).toEqual((1).toString);\n    expect(\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o.Foo, _x)._,\n    ).toEqual(1);\n    expect(\n      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o2.Foo, _x)._.toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o3.Foo, _x)._.toString(),\n    ).toEqual('1');\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._, _x)._,\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref2.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self2.self, _x)._,\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.getSelf(), _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n        _ref3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref3.call(_assertClassBrand$_), _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref4.getSelf(), _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref5$getSelf = (_ref5 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n        null || _ref5$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref5$getSelf.call(_ref5), _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref6.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_2)) === null || _call === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf2.self, _x)._,\n    ).toEqual(1);\n    expect(fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._).toEqual(\n      1,\n    );\n    expect(\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString,\n    ).toEqual((1).toString);\n    expect(\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o.Foo, _x)._,\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o2.Foo, _x)._.toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o3.Foo, _x)._.toString(),\n    ).toEqual('1');\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._, _x)._,\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref7 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref7.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref8 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref8.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self3.self, _x)._,\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.getSelf(), _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref9 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n        _ref9 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref9.call(_assertClassBrand$_3), _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref10 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref10.getSelf(), _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref11$getSelf = (_ref11 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.getSelf) === null || _ref11$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref11$getSelf.call(_ref11), _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref12.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_4)) === null || _call2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call2.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf3.self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf4.self, _x)._,\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _deep$very$o4,\n      _deep$very$o5,\n      _deep$very$o6,\n      _ref13,\n      _ref14,\n      _self4,\n      _assertClassBrand$_5,\n      _ref15,\n      _ref16,\n      _ref17,\n      _ref17$getSelf,\n      _ref18,\n      _assertClassBrand$_6,\n      _call3,\n      _getSelf5,\n      _getSelf6,\n      _fnDeep$very$o4,\n      _fnDeep$very$o5,\n      _fnDeep$very$o6,\n      _ref19,\n      _ref20,\n      _self5,\n      _assertClassBrand$_7,\n      _ref21,\n      _ref22,\n      _ref23,\n      _ref23$getSelf,\n      _ref24,\n      _assertClassBrand$_8,\n      _call4,\n      _getSelf7,\n      _getSelf8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._).toEqual(\n      undefined,\n    );\n    expect(\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString,\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o4.Foo, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o5.Foo, _x)._.toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o6.Foo, _x)._.toString(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._, _x)._,\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref13 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref13 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref13.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref14 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref14 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref14.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self4 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self4.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.getSelf(), _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref15 =\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n        _ref15 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref15.call(_assertClassBrand$_5), _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref16 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref16 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref16.getSelf(), _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref17$getSelf = (_ref17 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n        null || _ref17$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref17$getSelf.call(_ref17), _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref18 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref18 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref18.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_6)) === null || _call3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call3.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf5.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf6.self, _x)._,\n    ).toEqual(undefined);\n    expect(fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._).toEqual(\n      undefined,\n    );\n    expect(\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString,\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o4.Foo, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o5.Foo, _x)._.toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o6.Foo, _x)._.toString(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._, _x)._,\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref19 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref19 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref19.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref20 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref20 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref20.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self5.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.getSelf(), _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref21 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n        _ref21 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref21.call(_assertClassBrand$_7), _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref22 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref22 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref22.getSelf(), _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref23$getSelf = (_ref23 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.getSelf) === null || _ref23$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref23$getSelf.call(_ref23), _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref24 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref24 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref24.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_8)) === null || _call4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call4.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf7.self, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf8.self, _x)._,\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();\nFoo.testNull();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _classPrivateFieldLoo,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _classPrivateFieldLoo2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _classPrivateFieldLoo3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _classPrivateFieldLoo4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o.Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _x)[_x],\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _x)[\n            _x\n          ],\n    ).toEqual(1);\n    expect(\n      (_ref =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref2.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self2.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),\n            _x,\n          )[_x],\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n        null || _ref3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref4 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref4.getSelf(), _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref5$getSelf = (_ref5 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n        ?.getSelf) === null || _ref5$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref6.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo2)) === null || _call === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf2.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _x)[_x],\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _x)[\n            _x\n          ],\n    ).toEqual(1);\n    expect(\n      (_ref7 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref7.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref8 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref8.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self3.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n            _x,\n          )[_x],\n    ).toEqual(1);\n    expect(\n      (_ref9 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n              .getSelf) === null || _ref9 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref10.getSelf(), _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref11$getSelf = (_ref11 =\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n        ?.getSelf) === null || _ref11$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref12 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref12.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call2.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf3.self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf4.self, _x)[_x],\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _deep$very$o4,\n      _deep$very$o5,\n      _deep$very$o6,\n      _ref13,\n      _ref14,\n      _self4,\n      _classPrivateFieldLoo5,\n      _ref15,\n      _ref16,\n      _ref17,\n      _ref17$getSelf,\n      _ref18,\n      _classPrivateFieldLoo6,\n      _call3,\n      _getSelf5,\n      _getSelf6,\n      _fnDeep$very$o4,\n      _fnDeep$very$o5,\n      _fnDeep$very$o6,\n      _ref19,\n      _ref20,\n      _self5,\n      _classPrivateFieldLoo7,\n      _ref21,\n      _ref22,\n      _ref23,\n      _ref23$getSelf,\n      _ref24,\n      _classPrivateFieldLoo8,\n      _call4,\n      _getSelf7,\n      _getSelf8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString,\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o4.Foo, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o5.Foo, _x)[_x].toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o6.Foo, _x)[_x].toString(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _x)[\n            _x\n          ],\n    ).toEqual(undefined);\n    expect(\n      (_ref13 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref13 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref13.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref14 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref14 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref14.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self4 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self4.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),\n            _x,\n          )[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref15 =\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n        null || _ref15 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref15.call(_classPrivateFieldLoo5), _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref16 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref16 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref16.getSelf(), _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref17$getSelf = (_ref17 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n        ?.getSelf) === null || _ref17$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref17$getSelf.call(_ref17), _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref18 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null ||\n        _ref18 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref18.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo6)) === null || _call3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call3.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf5.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf6.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString,\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o4.Foo, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o5.Foo, _x)[_x].toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o6.Foo, _x)[_x].toString(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _x)[\n            _x\n          ],\n    ).toEqual(undefined);\n    expect(\n      (_ref19 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref19 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref19.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref20 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref20 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref20.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self5 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self5.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n            _x,\n          )[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref21 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n              .getSelf) === null || _ref21 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref21.call(_classPrivateFieldLoo7), _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref22 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref22 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref22.getSelf(), _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref23$getSelf = (_ref23 =\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n        ?.getSelf) === null || _ref23$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref23$getSelf.call(_ref23), _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref24 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref24 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref24.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo8)) === null || _call4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call4.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf7.self, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf8.self, _x)[_x],\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();\nFoo.testNull();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _assertClassBrand$_,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _assertClassBrand$_2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _assertClassBrand$_3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _assertClassBrand$_4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._;\n    o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString;\n    o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _x)._.toString();\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o.Foo, _x)._;\n    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o2.Foo, _x)._.toString;\n    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o3.Foo, _x)._.toString();\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._, _x)._;\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.self, _x)._;\n    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref.self, _x)._;\n    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n      null || _ref2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref2.self, _x)._;\n    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n      ?.self) === null || _self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self2.self, _x)._;\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _assertClassBrand(Foo, o.Foo, _self)._.getSelf(), _x)._;\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n    _ref3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref3.call(_assertClassBrand$_), _x)._;\n    (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref4.getSelf(), _x)._;\n    (_ref5$getSelf = (_ref5 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n      null || _ref5$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref5$getSelf.call(_ref5), _x)._;\n    (_ref6 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n      null || _ref6 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref6.self, _x)._;\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_2)) === null || _call === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call.self, _x)._;\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf.self, _x)._;\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf2.self, _x)._;\n    fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._;\n    fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString;\n    fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _x)._.toString();\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o.Foo, _x)._;\n    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o2.Foo, _x)._.toString;\n    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o3.Foo, _x)._.toString();\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._, _x)._;\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.self, _x)._;\n    (_ref7 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref7 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref7.self, _x)._;\n    (_ref8 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n      null || _ref8 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref8.self, _x)._;\n    (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.self) === null || _self3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self3.self, _x)._;\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _assertClassBrand(Foo, fn().Foo, _self)._.getSelf(), _x)._;\n    (_ref9 =\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n    _ref9 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref9.call(_assertClassBrand$_3), _x)._;\n    (_ref10 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref10 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref10.getSelf(), _x)._;\n    (_ref11$getSelf = (_ref11 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.getSelf) === null || _ref11$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref11$getSelf.call(_ref11), _x)._;\n    (_ref12 =\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref12.self, _x)._;\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_4)) === null || _call2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call2.self, _x)._;\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf3.self, _x)._;\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf4.self, _x)._;\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _classPrivateFieldLoo,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _classPrivateFieldLoo2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _classPrivateFieldLoo3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _classPrivateFieldLoo4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x];\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString;\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _x)[_x].toString();\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o.Foo, _x)[_x];\n    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _x)[_x].toString;\n    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _x)[_x].toString();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _x)[_x];\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _x)[_x];\n    (_ref =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref.self, _x)[_x];\n    (_ref2 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref2.self, _x)[_x];\n    (_self2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.self) === null || _self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self2.self, _x)[_x];\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(), _x)[\n          _x\n        ];\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n      null || _ref3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _x)[_x];\n    (_ref4 =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref4.getSelf(), _x)[_x];\n    (_ref5$getSelf = (_ref5 =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n      ?.getSelf) === null || _ref5$getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _x)[_x];\n    (_ref6 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref6.self, _x)[_x];\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo2)) === null || _call === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call.self, _x)[_x];\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf.self, _x)[_x];\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf2.self, _x)[_x];\n    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _x)[_x];\n    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString;\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(fn().Foo, _x)[_x].toString();\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _x)[_x];\n    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _x)[_x].toString;\n    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _x)[_x].toString();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _x)[_x];\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _x)[\n          _x\n        ];\n    (_ref7 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref7.self, _x)[_x];\n    (_ref8 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref8.self, _x)[_x];\n    (_self3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self) === null || _self3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self3.self, _x)[_x];\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(\n          _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n          _x,\n        )[_x];\n    (_ref9 =\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n            .getSelf) === null || _ref9 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _x)[_x];\n    (_ref10 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref10.getSelf(), _x)[_x];\n    (_ref11$getSelf = (_ref11 =\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n      ?.getSelf) === null || _ref11$getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _x)[_x];\n    (_ref12 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n    _ref12 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref12.self, _x)[_x];\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call2.self, _x)[_x];\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf3.self, _x)[_x];\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf4.self, _x)[_x];\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(() => (Foo === null || Foo === void 0 ? true : delete _self._.unicorn)).toThrow(\n      TypeError,\n    );\n    expect(() => {\n      var _deep$very$o;\n      return (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n        ? true\n        : delete _assertClassBrand(Foo, _deep$very$o.Foo, _self)._.unicorn;\n    }).toThrow(TypeError);\n    expect(() =>\n      o === null || o === void 0 ? true : delete _assertClassBrand(Foo, o.Foo, _self)._.unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      o === null || o === void 0\n        ? true\n        : delete _assertClassBrand(Foo, o.Foo, _self)._.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self\n          .unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)\n          ?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self\n          ?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      o === null || o === void 0\n        ? true\n        : delete _assertClassBrand(Foo, o.Foo, _self)._.getSelf().unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _assertClassBrand$_;\n      return delete (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_).unicorn;\n    }).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n        )?.getSelf().unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n        )?.getSelf?.().unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _assertClassBrand$_2;\n      return delete (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_2)?.self.unicorn;\n    }).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n        )?.getSelf()?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n        )?.getSelf?.()?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      fn === null || fn === void 0\n        ? true\n        : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _fnDeep$very$o;\n      return (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n        ? true\n        : delete _assertClassBrand(Foo, _fnDeep$very$o.Foo, _self)._.unicorn;\n    }).toThrow(TypeError);\n    expect(() =>\n      fn === null || fn === void 0\n        ? true\n        : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      fn === null || fn === void 0\n        ? true\n        : delete _assertClassBrand(Foo, fn().Foo, _self)._.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n          ?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n          ?.self?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      fn === null || fn === void 0\n        ? true\n        : delete _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _assertClassBrand$_3;\n      return delete (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_3).unicorn;\n    }).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n        )?.getSelf().unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n        )?.getSelf?.().unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _assertClassBrand$_4;\n      return delete (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_4)?.self.unicorn;\n    }).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n        )?.getSelf()?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n        )?.getSelf?.()?.self.unicorn,\n    ).toThrow(TypeError);\n  }\n  static testNull() {\n    var _deep$very$o2,\n      _assertClassBrand$_5,\n      _assertClassBrand$_6,\n      _fnDeep$very$o2,\n      _assertClassBrand$_7,\n      _assertClassBrand$_8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n        ? true\n        : delete _assertClassBrand(Foo, _deep$very$o2.Foo, _self)._.unicorn,\n    ).toBe(true);\n    expect(\n      o === null || o === void 0 ? true : delete _assertClassBrand(Foo, o.Foo, _self)._.unicorn,\n    ).toBe(true);\n    expect(\n      o === null || o === void 0\n        ? true\n        : delete _assertClassBrand(Foo, o.Foo, _self)._.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self\n        .unicorn,\n    ).toBe(true);\n    expect(\n      delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)\n        ?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self\n        ?.self.unicorn,\n    ).toBe(true);\n    expect(\n      o === null || o === void 0\n        ? true\n        : delete _assertClassBrand(Foo, o.Foo, _self)._.getSelf().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_5).unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_6)?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()?.self.unicorn,\n    ).toBe(true);\n    expect(\n      fn === null || fn === void 0\n        ? true\n        : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn,\n    ).toBe(true);\n    expect(\n      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n        ? true\n        : delete _assertClassBrand(Foo, _fnDeep$very$o2.Foo, _self)._.unicorn,\n    ).toBe(true);\n    expect(\n      fn === null || fn === void 0\n        ? true\n        : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn,\n    ).toBe(true);\n    expect(\n      fn === null || fn === void 0\n        ? true\n        : delete _assertClassBrand(Foo, fn().Foo, _self)._.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self?.self.unicorn,\n    ).toBe(true);\n    expect(\n      fn === null || fn === void 0\n        ? true\n        : delete _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_7).unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_8)?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()?.self.unicorn,\n    ).toBe(true);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nObject.defineProperty(Foo, 'unicorn', { configurable: false });\nFoo.test();\nFoo.testNull();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(() =>\n      Foo === null || Foo === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(Foo, _self)[_self].unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _deep$very$o;\n      return (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(_deep$very$o.Foo, _self)[_self].unicorn;\n    }).toThrow(TypeError);\n    expect(() =>\n      o === null || o === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      o === null || o === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n        )?.self?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      o === null || o === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf().unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _classPrivateFieldLoo;\n      return delete (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo).unicorn;\n    }).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n        )?.getSelf().unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n        )?.getSelf?.().unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _classPrivateFieldLoo2;\n      return delete (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo2)?.self.unicorn;\n    }).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n        )?.getSelf()?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n        )?.getSelf?.()?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      fn === null || fn === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _fnDeep$very$o;\n      return (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _self)[_self].unicorn;\n    }).toThrow(TypeError);\n    expect(() =>\n      fn === null || fn === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      fn === null || fn === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n        )?.self?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() =>\n      fn === null || fn === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _classPrivateFieldLoo3;\n      return delete (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo3).unicorn;\n    }).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n        )?.getSelf().unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n        )?.getSelf?.().unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n        )?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(() => {\n      var _classPrivateFieldLoo4;\n      return delete (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo4)?.self.unicorn;\n    }).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n        )?.getSelf()?.self.unicorn,\n    ).toThrow(TypeError);\n    expect(\n      () =>\n        delete (\n          fn === null || fn === void 0\n            ? void 0\n            : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n        )?.getSelf?.()?.self.unicorn,\n    ).toThrow(TypeError);\n  }\n  static testNull() {\n    var _deep$very$o2,\n      _classPrivateFieldLoo5,\n      _classPrivateFieldLoo6,\n      _fnDeep$very$o2,\n      _classPrivateFieldLoo7,\n      _classPrivateFieldLoo8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(_deep$very$o2.Foo, _self)[_self].unicorn,\n    ).toBe(true);\n    expect(\n      o === null || o === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].unicorn,\n    ).toBe(true);\n    expect(\n      o === null || o === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self?.self.unicorn,\n    ).toBe(true);\n    expect(\n      o === null || o === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo5).unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo6)?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()?.self.unicorn,\n    ).toBe(true);\n    expect(\n      fn === null || fn === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn,\n    ).toBe(true);\n    expect(\n      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _self)[_self].unicorn,\n    ).toBe(true);\n    expect(\n      fn === null || fn === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn,\n    ).toBe(true);\n    expect(\n      fn === null || fn === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self?.self.unicorn,\n    ).toBe(true);\n    expect(\n      fn === null || fn === void 0\n        ? true\n        : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo7).unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.().unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n      )?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo8)?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()?.self.unicorn,\n    ).toBe(true);\n    expect(\n      delete (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()?.self.unicorn,\n    ).toBe(true);\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nObject.defineProperty(Foo, 'unicorn', { configurable: false });\nFoo.test();\nFoo.testNull();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _assertClassBrand$_,\n      _assertClassBrand$_2,\n      _fnDeep$very$o,\n      _assertClassBrand$_3,\n      _assertClassBrand$_4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    Foo === null || Foo === void 0 ? true : delete _self._.unicorn;\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? true\n      : delete _assertClassBrand(Foo, _deep$very$o.Foo, _self)._.unicorn;\n    o === null || o === void 0 ? true : delete _assertClassBrand(Foo, o.Foo, _self)._.unicorn;\n    o === null || o === void 0 ? true : delete _assertClassBrand(Foo, o.Foo, _self)._.self.unicorn;\n    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self\n      .unicorn;\n    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)?.self\n      .unicorn;\n    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.self\n      ?.self.unicorn;\n    o === null || o === void 0\n      ? true\n      : delete _assertClassBrand(Foo, o.Foo, _self)._.getSelf().unicorn;\n    delete (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_).unicorn;\n    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf()\n      .unicorn;\n    delete (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.().unicorn;\n    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf())\n      ?.self.unicorn;\n    delete (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_2)?.self.unicorn;\n    delete (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf()\n      ?.self.unicorn;\n    delete (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()?.self.unicorn;\n    fn === null || fn === void 0 ? true : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn;\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? true\n      : delete _assertClassBrand(Foo, _fnDeep$very$o.Foo, _self)._.unicorn;\n    fn === null || fn === void 0 ? true : delete _assertClassBrand(Foo, fn().Foo, _self)._.unicorn;\n    fn === null || fn === void 0\n      ? true\n      : delete _assertClassBrand(Foo, fn().Foo, _self)._.self.unicorn;\n    delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)?.self\n      .unicorn;\n    delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self)\n      ?.self.unicorn;\n    delete (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)?.self\n      ?.self.unicorn;\n    fn === null || fn === void 0\n      ? true\n      : delete _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().unicorn;\n    delete (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_3).unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf().unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.().unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n    )?.self.unicorn;\n    delete (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_4)?.self.unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()?.self.unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()?.self.unicorn;\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _classPrivateFieldLoo,\n      _classPrivateFieldLoo2,\n      _fnDeep$very$o,\n      _classPrivateFieldLoo3,\n      _classPrivateFieldLoo4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    Foo === null || Foo === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(Foo, _self)[_self].unicorn;\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(_deep$very$o.Foo, _self)[_self].unicorn;\n    o === null || o === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].unicorn;\n    o === null || o === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].self.unicorn;\n    delete (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n      ?.self.unicorn;\n    delete (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n    )?.self.unicorn;\n    delete (o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n      ?.self?.self.unicorn;\n    o === null || o === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf().unicorn;\n    delete (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo).unicorn;\n    delete (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf().unicorn;\n    delete (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.().unicorn;\n    delete (\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n    )?.self.unicorn;\n    delete (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo2)?.self.unicorn;\n    delete (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()?.self.unicorn;\n    delete (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()?.self.unicorn;\n    fn === null || fn === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn;\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _self)[_self].unicorn;\n    fn === null || fn === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].unicorn;\n    fn === null || fn === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self.unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self.unicorn;\n    delete (\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n    )?.self.unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self?.self.unicorn;\n    fn === null || fn === void 0\n      ? true\n      : delete _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().unicorn;\n    delete (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo3).unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf().unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.().unicorn;\n    delete (\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n    )?.self.unicorn;\n    delete (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo4)?.self.unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()?.self.unicorn;\n    delete (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()?.self.unicorn;\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo$self$getSelf,\n      _fnDeep$very$o$Foo,\n      _getSelf,\n      _getSelf$self,\n      _fn$Foo$self$getSelf$;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    function f(\n      o,\n      r = o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo),\n    ) {\n      return r;\n    }\n    function g(\n      o,\n      r = o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n            _m,\n          )._.call(_o$Foo$self$getSelf),\n    ) {\n      return r;\n    }\n    function h(\n      fnDeep,\n      r = (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _m)._.call(_fnDeep$very$o$Foo),\n    ) {\n      return r;\n    }\n    function i(\n      fn,\n      r = (_getSelf = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self),\n    ) {\n      return r;\n    }\n    function j(\n      fn,\n      r = _assertClassBrand(\n        Foo,\n        (_fn$Foo$self$getSelf$ = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().self),\n        _m,\n      )._?.call(_fn$Foo$self$getSelf$),\n    ) {\n      return r;\n    }\n    expect(f(o)).toBe(1);\n    expect(g(o)).toBe(1);\n    expect(h(fnDeep)).toBe(1);\n    expect(i(fn)).toBe(1);\n    expect(j(fn)).toBe(1);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _fnDeep$very$o$Foo, _getSelf;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    function f(\n      o,\n      r = o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m](),\n    ) {\n      return r;\n    }\n    function g(\n      o,\n      r = o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m](),\n    ) {\n      return r;\n    }\n    function h(\n      fnDeep,\n      r = (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _m)[_m](),\n    ) {\n      return r;\n    }\n    function i(\n      fn,\n      r = (_getSelf = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m](),\n    ) {\n      return r;\n    }\n    function j(\n      fn,\n      r = _classPrivateFieldLooseBase(\n        _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().self,\n        _m,\n      )[_m]?.(),\n    ) {\n      return r;\n    }\n    expect(f(o)).toBe(1);\n    expect(g(o)).toBe(1);\n    expect(h(fnDeep)).toBe(1);\n    expect(i(fn)).toBe(1);\n    expect(j(fn)).toBe(1);\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo$self$getSelf,\n      _fnDeep$very$o$Foo,\n      _getSelf,\n      _getSelf$self,\n      _fn$Foo$self$getSelf$;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    function f(\n      o,\n      r = o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo),\n    ) {\n      return r;\n    }\n    function g(\n      o,\n      r = o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n            _m,\n          )._?.call(_o$Foo$self$getSelf),\n    ) {\n      return r;\n    }\n    function h(\n      fnDeep,\n      r = (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _m)._.call(_fnDeep$very$o$Foo),\n    ) {\n      return r;\n    }\n    function i(\n      fn,\n      r = (_getSelf = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self),\n    ) {\n      return r;\n    }\n    function j(\n      fn,\n      r = _assertClassBrand(\n        Foo,\n        (_fn$Foo$self$getSelf$ = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf().self),\n        _m,\n      )._?.call(_fn$Foo$self$getSelf$),\n    ) {\n      return r;\n    }\n    f(o);\n    g(o);\n    h(fnDeep);\n    i(fn);\n    j(fn);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _fnDeep$very$o$Foo, _getSelf;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    function f(\n      o,\n      r = o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m](),\n    ) {\n      return r;\n    }\n    function g(\n      o,\n      r = o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m]?.(),\n    ) {\n      return r;\n    }\n    function h(\n      fnDeep,\n      r = (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _m)[_m](),\n    ) {\n      return r;\n    }\n    function i(\n      fn,\n      r = (_getSelf = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m](),\n    ) {\n      return r;\n    }\n    function j(\n      fn,\n      r = _classPrivateFieldLooseBase(\n        _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf().self,\n        _m,\n      )[_m]?.(),\n    ) {\n      return r;\n    }\n    f(o);\n    g(o);\n    h(fnDeep);\n    i(fn);\n    j(fn);\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _m = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _m, void 0);\n  }\n  init() {\n    _classPrivateFieldSet(_m, this, (...args) => args);\n  }\n  static test() {\n    const f = new Foo();\n    f.init();\n    return _classPrivateFieldGet(_m, f)?.call(f, ...arguments);\n  }\n  static testNull() {\n    const f = new Foo();\n    return _classPrivateFieldGet(_m, f)?.call(f, ...arguments);\n  }\n}\nexpect(Foo.test(1, 2)).toEqual([1, 2]);\nexpect(Foo.testNull(1, 2)).toBe(undefined);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _m, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  init() {\n    _classPrivateFieldLooseBase(this, _m)[_m] = (...args) => args;\n  }\n  static test() {\n    const f = new Foo();\n    f.init();\n    return _classPrivateFieldLooseBase(f, _m)[_m]?.(...arguments);\n  }\n  static testNull() {\n    const f = new Foo();\n    return _classPrivateFieldLooseBase(f, _m)[_m]?.(...arguments);\n  }\n}\nexpect(Foo.test(1, 2)).toEqual([1, 2]);\nexpect(Foo.testNull(1, 2)).toBe(undefined);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _m = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _m, void 0);\n  }\n  init() {\n    _classPrivateFieldSet(_m, this, (...args) => args);\n  }\n  static test() {\n    const f = new Foo();\n    f.init();\n    return _classPrivateFieldGet(_m, f)?.call(f, ...arguments);\n  }\n  static testNull() {\n    const f = new Foo();\n    return _classPrivateFieldGet(_m, f)?.call(f, ...arguments);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _m, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  init() {\n    _classPrivateFieldLooseBase(this, _m)[_m] = (...args) => args;\n  }\n  static test() {\n    const f = new Foo();\n    f.init();\n    return _classPrivateFieldLooseBase(f, _m)[_m]?.(...arguments);\n  }\n  static testNull() {\n    const f = new Foo();\n    return _classPrivateFieldLooseBase(f, _m)[_m]?.(...arguments);\n  }\n}",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o,\n      _deep$very$o$Foo,\n      _deep$very$o2,\n      _deep$very$o2$Foo,\n      _deep$very$o3,\n      _deep$very$o3$Foo,\n      _o$Foo$self,\n      _o$Foo$self$self,\n      _ref,\n      _ref$self,\n      _ref2,\n      _ref2$self,\n      _self2,\n      _self2$self,\n      _o$Foo$self$getSelf,\n      _assertClassBrand$_,\n      _ref3,\n      _ref3$call,\n      _ref4,\n      _ref4$getSelf,\n      _ref5,\n      _ref5$getSelf,\n      _ref5$getSelf$call,\n      _ref6,\n      _ref6$self,\n      _assertClassBrand$_2,\n      _call,\n      _call$self,\n      _getSelf,\n      _getSelf$self,\n      _getSelf2,\n      _getSelf2$self,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o2,\n      _fnDeep$very$o2$Foo,\n      _fnDeep$very$o3,\n      _fnDeep$very$o3$Foo,\n      _fn$Foo$self,\n      _fn$Foo$self$self,\n      _ref7,\n      _ref7$self,\n      _ref8,\n      _ref8$self,\n      _self3,\n      _self3$self,\n      _fn$Foo$self$getSelf,\n      _assertClassBrand$_3,\n      _ref9,\n      _ref9$call,\n      _ref10,\n      _ref10$getSelf,\n      _ref11,\n      _ref11$getSelf,\n      _ref11$getSelf$call,\n      _ref12,\n      _ref12$self,\n      _assertClassBrand$_4,\n      _call2,\n      _call2$self,\n      _getSelf3,\n      _getSelf3$self,\n      _getSelf4,\n      _getSelf4$self;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(_m._?.call(Foo)).toEqual(1);\n    expect(_m._?.call(Foo).toString).toEqual((1).toString);\n    expect(_m._?.call(Foo).toString()).toEqual('1');\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._?.call(_o$Foo),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._?.call(_o$Foo2).toString,\n    ).toEqual((1).toString);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)\n            ._?.call(_o$Foo3)\n            .toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._?.call(\n            _deep$very$o$Foo,\n          ),\n    ).toEqual(1);\n    expect(\n      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._?.call(\n            _deep$very$o2$Foo,\n          ).toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)\n            ._?.call(_deep$very$o3$Foo)\n            .toString(),\n    ).toEqual('1');\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._),\n            _m,\n          )._?.call(_o$Foo$self),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),\n            _m,\n          )._?.call(_o$Foo$self$self),\n    ).toEqual(1);\n    expect(\n      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._?.call(_ref$self),\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._?.call(_ref2$self),\n    ).toEqual(1);\n    expect(\n      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._?.call(_self2$self),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n            _m,\n          )._?.call(_o$Foo$self$getSelf),\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n        _ref3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._?.call(\n            _ref3$call,\n          ),\n    ).toEqual(1);\n    expect(\n      (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._?.call(_ref4$getSelf),\n    ).toEqual(1);\n    expect(\n      (_ref5$getSelf = (_ref5 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n        null || _ref5$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._?.call(\n            _ref5$getSelf$call,\n          ),\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._?.call(_ref6$self),\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_2)) === null || _call === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_call$self = _call.self), _m)._?.call(_call$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._?.call(_getSelf$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._?.call(_getSelf2$self),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._?.call(_fn$Foo),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._?.call(_fn$Foo2).toString,\n    ).toEqual((1).toString);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)\n            ._?.call(_fn$Foo3)\n            .toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._?.call(\n            _fnDeep$very$o$Foo,\n          ),\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._?.call(\n            _fnDeep$very$o2$Foo,\n          ).toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)\n            ._?.call(_fnDeep$very$o3$Foo)\n            .toString(),\n    ).toEqual('1');\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),\n            _m,\n          )._?.call(_fn$Foo$self),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),\n            _m,\n          )._?.call(_fn$Foo$self$self),\n    ).toEqual(1);\n    expect(\n      (_ref7 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._?.call(_ref7$self),\n    ).toEqual(1);\n    expect(\n      (_ref8 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._?.call(_ref8$self),\n    ).toEqual(1);\n    expect(\n      (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._?.call(_self3$self),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),\n            _m,\n          )._?.call(_fn$Foo$self$getSelf),\n    ).toEqual(1);\n    expect(\n      (_ref9 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n        _ref9 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._?.call(\n            _ref9$call,\n          ),\n    ).toEqual(1);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref10 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._?.call(_ref10$getSelf),\n    ).toEqual(1);\n    expect(\n      (_ref11$getSelf = (_ref11 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.getSelf) === null || _ref11$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._?.call(\n            _ref11$getSelf$call,\n          ),\n    ).toEqual(1);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._?.call(_ref12$self),\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_4)) === null || _call2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._?.call(_call2$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._?.call(_getSelf3$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._?.call(_getSelf4$self),\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _o$Foo4,\n      _o$Foo5,\n      _o$Foo6,\n      _deep$very$o4,\n      _deep$very$o4$Foo,\n      _deep$very$o5,\n      _deep$very$o5$Foo,\n      _deep$very$o6,\n      _deep$very$o6$Foo,\n      _o$Foo$self2,\n      _o$Foo$self$self2,\n      _ref13,\n      _ref13$self,\n      _ref14,\n      _ref14$self,\n      _self4,\n      _self4$self,\n      _o$Foo$self$getSelf2,\n      _assertClassBrand$_5,\n      _ref15,\n      _ref15$call,\n      _ref16,\n      _ref16$getSelf,\n      _ref17,\n      _ref17$getSelf,\n      _ref17$getSelf$call,\n      _ref18,\n      _ref18$self,\n      _assertClassBrand$_6,\n      _call3,\n      _call3$self,\n      _getSelf5,\n      _getSelf5$self,\n      _getSelf6,\n      _getSelf6$self,\n      _fn$Foo4,\n      _fn$Foo5,\n      _fn$Foo6,\n      _fnDeep$very$o4,\n      _fnDeep$very$o4$Foo,\n      _fnDeep$very$o5,\n      _fnDeep$very$o5$Foo,\n      _fnDeep$very$o6,\n      _fnDeep$very$o6$Foo,\n      _fn$Foo$self2,\n      _fn$Foo$self$self2,\n      _ref19,\n      _ref19$self,\n      _ref20,\n      _ref20$self,\n      _self5,\n      _self5$self,\n      _fn$Foo$self$getSelf2,\n      _assertClassBrand$_7,\n      _ref21,\n      _ref21$call,\n      _ref22,\n      _ref22$getSelf,\n      _ref23,\n      _ref23$getSelf,\n      _ref23$getSelf$call,\n      _ref24,\n      _ref24$self,\n      _assertClassBrand$_8,\n      _call4,\n      _call4$self,\n      _getSelf7,\n      _getSelf7$self,\n      _getSelf8,\n      _getSelf8$self;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo4 = o.Foo), _m)._?.call(_o$Foo4),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo5 = o.Foo), _m)._?.call(_o$Foo5).toString,\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo6 = o.Foo), _m)\n            ._?.call(_o$Foo6)\n            .toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o4$Foo = _deep$very$o4.Foo), _m)._?.call(\n            _deep$very$o4$Foo,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o5$Foo = _deep$very$o5.Foo), _m)._?.call(\n            _deep$very$o5$Foo,\n          ).toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_deep$very$o6$Foo = _deep$very$o6.Foo), _m)\n            ._?.call(_deep$very$o6$Foo)\n            .toString(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self2 = _assertClassBrand(Foo, o.Foo, _self)._),\n            _m,\n          )._?.call(_o$Foo$self2),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$self2 = _assertClassBrand(Foo, o.Foo, _self)._.self),\n            _m,\n          )._?.call(_o$Foo$self$self2),\n    ).toEqual(undefined);\n    expect(\n      (_ref13 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref13 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref13$self = _ref13.self), _m)._?.call(_ref13$self),\n    ).toEqual(undefined);\n    expect(\n      (_ref14 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref14 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref14$self = _ref14.self), _m)._?.call(_ref14$self),\n    ).toEqual(undefined);\n    expect(\n      (_self4 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_self4$self = _self4.self), _m)._?.call(_self4$self),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_o$Foo$self$getSelf2 = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n            _m,\n          )._?.call(_o$Foo$self$getSelf2),\n    ).toEqual(undefined);\n    expect(\n      (_ref15 =\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n        _ref15 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref15$call = _ref15.call(_assertClassBrand$_5)), _m)._?.call(\n            _ref15$call,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_ref16 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref16 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref16$getSelf = _ref16.getSelf()), _m)._?.call(_ref16$getSelf),\n    ).toEqual(undefined);\n    expect(\n      (_ref17$getSelf = (_ref17 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n        null || _ref17$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref17$getSelf$call = _ref17$getSelf.call(_ref17)), _m)._?.call(\n            _ref17$getSelf$call,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_ref18 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref18 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref18$self = _ref18.self), _m)._?.call(_ref18$self),\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_6)) === null || _call3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_call3$self = _call3.self), _m)._?.call(_call3$self),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf5$self = _getSelf5.self), _m)._?.call(_getSelf5$self),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf6$self = _getSelf6.self), _m)._?.call(_getSelf6$self),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo4 = fn().Foo), _m)._?.call(_fn$Foo4),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo5 = fn().Foo), _m)._?.call(_fn$Foo5).toString,\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fn$Foo6 = fn().Foo), _m)\n            ._?.call(_fn$Foo6)\n            .toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o4$Foo = _fnDeep$very$o4.Foo), _m)._?.call(\n            _fnDeep$very$o4$Foo,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o5$Foo = _fnDeep$very$o5.Foo), _m)._?.call(\n            _fnDeep$very$o5$Foo,\n          ).toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_fnDeep$very$o6$Foo = _fnDeep$very$o6.Foo), _m)\n            ._?.call(_fnDeep$very$o6$Foo)\n            .toString(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self2 = _assertClassBrand(Foo, fn().Foo, _self)._),\n            _m,\n          )._?.call(_fn$Foo$self2),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self$self2 = _assertClassBrand(Foo, fn().Foo, _self)._.self),\n            _m,\n          )._?.call(_fn$Foo$self$self2),\n    ).toEqual(undefined);\n    expect(\n      (_ref19 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref19 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref19$self = _ref19.self), _m)._?.call(_ref19$self),\n    ).toEqual(undefined);\n    expect(\n      (_ref20 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref20 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref20$self = _ref20.self), _m)._?.call(_ref20$self),\n    ).toEqual(undefined);\n    expect(\n      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_self5$self = _self5.self), _m)._?.call(_self5$self),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(\n            Foo,\n            (_fn$Foo$self$getSelf2 = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),\n            _m,\n          )._?.call(_fn$Foo$self$getSelf2),\n    ).toEqual(undefined);\n    expect(\n      (_ref21 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n        _ref21 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref21$call = _ref21.call(_assertClassBrand$_7)), _m)._?.call(\n            _ref21$call,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_ref22 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref22 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref22$getSelf = _ref22.getSelf()), _m)._?.call(_ref22$getSelf),\n    ).toEqual(undefined);\n    expect(\n      (_ref23$getSelf = (_ref23 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.getSelf) === null || _ref23$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref23$getSelf$call = _ref23$getSelf.call(_ref23)), _m)._?.call(\n            _ref23$getSelf$call,\n          ),\n    ).toEqual(undefined);\n    expect(\n      (_ref24 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref24 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_ref24$self = _ref24.self), _m)._?.call(_ref24$self),\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_8)) === null || _call4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_call4$self = _call4.self), _m)._?.call(_call4$self),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf7$self = _getSelf7.self), _m)._?.call(_getSelf7$self),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_getSelf8$self = _getSelf8.self), _m)._?.call(_getSelf8$self),\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();\nFoo.testNull();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _classPrivateFieldLoo,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _classPrivateFieldLoo2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _classPrivateFieldLoo3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _classPrivateFieldLoo4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(_classPrivateFieldLooseBase(Foo, _m)[_m]?.()).toEqual(1);\n    expect(_classPrivateFieldLooseBase(Foo, _m)[_m]?.().toString).toEqual((1).toString);\n    expect(_classPrivateFieldLooseBase(Foo, _m)[_m]?.().toString()).toEqual('1');\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString,\n    ).toEqual((1).toString);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]?.().toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]?.().toString(),\n    ).toEqual('1');\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[\n            _m\n          ]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref2.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_self2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self2.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n        null || _ref3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref4 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref5$getSelf = (_ref5 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n        ?.getSelf) === null || _ref5$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref6.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo2)) === null || _call === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString,\n    ).toEqual((1).toString);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]?.().toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]?.().toString(),\n    ).toEqual('1');\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[\n            _m\n          ]?.(),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[\n            _m\n          ]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref7 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref7.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref8 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref8.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_self3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self3.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref9 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n              .getSelf) === null || _ref9 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref11$getSelf = (_ref11 =\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n        ?.getSelf) === null || _ref11$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref12 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref12.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call2.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m]?.(),\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m]?.(),\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _deep$very$o4,\n      _deep$very$o5,\n      _deep$very$o6,\n      _ref13,\n      _ref14,\n      _self4,\n      _classPrivateFieldLoo5,\n      _ref15,\n      _ref16,\n      _ref17,\n      _ref17$getSelf,\n      _ref18,\n      _classPrivateFieldLoo6,\n      _call3,\n      _getSelf5,\n      _getSelf6,\n      _fnDeep$very$o4,\n      _fnDeep$very$o5,\n      _fnDeep$very$o6,\n      _ref19,\n      _ref20,\n      _self5,\n      _classPrivateFieldLoo7,\n      _ref21,\n      _ref22,\n      _ref23,\n      _ref23$getSelf,\n      _ref24,\n      _classPrivateFieldLoo8,\n      _call4,\n      _getSelf7,\n      _getSelf8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString,\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o4 = deep?.very.o) === null || _deep$very$o4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o4.Foo, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o5 = deep?.very.o) === null || _deep$very$o5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o5.Foo, _m)[_m]?.().toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o6 = deep?.very.o) === null || _deep$very$o6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o6.Foo, _m)[_m]?.().toString(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[\n            _m\n          ]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref13 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref13 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref13.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref14 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref14 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref14.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_self4 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self4.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref15 =\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n        null || _ref15 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref15.call(_classPrivateFieldLoo5), _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref16 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref16 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref16.getSelf(), _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref17$getSelf = (_ref17 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n        ?.getSelf) === null || _ref17$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref17$getSelf.call(_ref17), _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref18 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null ||\n        _ref18 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref18.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo6)) === null || _call3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call3.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf5.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf6.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString,\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o4 = fnDeep?.().very.o) === null || _fnDeep$very$o4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o4.Foo, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o5 = fnDeep?.().very.o) === null || _fnDeep$very$o5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o5.Foo, _m)[_m]?.().toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o6 = fnDeep?.().very.o) === null || _fnDeep$very$o6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o6.Foo, _m)[_m]?.().toString(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[\n            _m\n          ]?.(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[\n            _m\n          ]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref19 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref19 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref19.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref20 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref20 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref20.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_self5 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self5.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(\n            _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n            _m,\n          )[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref21 =\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n              .getSelf) === null || _ref21 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref21.call(_classPrivateFieldLoo7), _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref22 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref22 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref22.getSelf(), _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref23$getSelf = (_ref23 =\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n        ?.getSelf) === null || _ref23$getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref23$getSelf.call(_ref23), _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_ref24 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref24 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref24.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo8)) === null || _call4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call4.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf7.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf8.self, _m)[_m]?.(),\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();\nFoo.testNull();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o,\n      _deep$very$o$Foo,\n      _deep$very$o2,\n      _deep$very$o2$Foo,\n      _deep$very$o3,\n      _deep$very$o3$Foo,\n      _o$Foo$self,\n      _o$Foo$self$self,\n      _ref,\n      _ref$self,\n      _ref2,\n      _ref2$self,\n      _self2,\n      _self2$self,\n      _o$Foo$self$getSelf,\n      _assertClassBrand$_,\n      _ref3,\n      _ref3$call,\n      _ref4,\n      _ref4$getSelf,\n      _ref5,\n      _ref5$getSelf,\n      _ref5$getSelf$call,\n      _ref6,\n      _ref6$self,\n      _assertClassBrand$_2,\n      _call,\n      _call$self,\n      _getSelf,\n      _getSelf$self,\n      _getSelf2,\n      _getSelf2$self,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o2,\n      _fnDeep$very$o2$Foo,\n      _fnDeep$very$o3,\n      _fnDeep$very$o3$Foo,\n      _fn$Foo$self,\n      _fn$Foo$self$self,\n      _ref7,\n      _ref7$self,\n      _ref8,\n      _ref8$self,\n      _self3,\n      _self3$self,\n      _fn$Foo$self$getSelf,\n      _assertClassBrand$_3,\n      _ref9,\n      _ref9$call,\n      _ref10,\n      _ref10$getSelf,\n      _ref11,\n      _ref11$getSelf,\n      _ref11$getSelf$call,\n      _ref12,\n      _ref12$self,\n      _assertClassBrand$_4,\n      _call2,\n      _call2$self,\n      _getSelf3,\n      _getSelf3$self,\n      _getSelf4,\n      _getSelf4$self;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    _m._?.call(Foo);\n    _m._?.call(Foo).toString;\n    _m._?.call(Foo).toString();\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._?.call(_o$Foo);\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._?.call(_o$Foo2).toString;\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)\n          ._?.call(_o$Foo3)\n          .toString();\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._?.call(_deep$very$o$Foo);\n    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._?.call(\n          _deep$very$o2$Foo,\n        ).toString;\n    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)\n          ._?.call(_deep$very$o3$Foo)\n          .toString();\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._), _m)._?.call(\n          _o$Foo$self,\n        );\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),\n          _m,\n        )._?.call(_o$Foo$self$self);\n    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._?.call(_ref$self);\n    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n      null || _ref2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._?.call(_ref2$self);\n    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n      ?.self) === null || _self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._?.call(_self2$self);\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n          _m,\n        )._?.call(_o$Foo$self$getSelf);\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n    _ref3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._?.call(\n          _ref3$call,\n        );\n    (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._?.call(_ref4$getSelf);\n    (_ref5$getSelf = (_ref5 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n      null || _ref5$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._?.call(\n          _ref5$getSelf$call,\n        );\n    (_ref6 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n      null || _ref6 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._?.call(_ref6$self);\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_2)) === null || _call === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_call$self = _call.self), _m)._?.call(_call$self);\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._?.call(_getSelf$self);\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._?.call(_getSelf2$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._?.call(_fn$Foo);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._?.call(_fn$Foo2).toString;\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)\n          ._?.call(_fn$Foo3)\n          .toString();\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._?.call(\n          _fnDeep$very$o$Foo,\n        );\n    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._?.call(\n          _fnDeep$very$o2$Foo,\n        ).toString;\n    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)\n          ._?.call(_fnDeep$very$o3$Foo)\n          .toString();\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),\n          _m,\n        )._?.call(_fn$Foo$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),\n          _m,\n        )._?.call(_fn$Foo$self$self);\n    (_ref7 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref7 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._?.call(_ref7$self);\n    (_ref8 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n      null || _ref8 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._?.call(_ref8$self);\n    (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.self) === null || _self3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._?.call(_self3$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),\n          _m,\n        )._?.call(_fn$Foo$self$getSelf);\n    (_ref9 =\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n    _ref9 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._?.call(\n          _ref9$call,\n        );\n    (_ref10 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref10 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._?.call(_ref10$getSelf);\n    (_ref11$getSelf = (_ref11 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.getSelf) === null || _ref11$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._?.call(\n          _ref11$getSelf$call,\n        );\n    (_ref12 =\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._?.call(_ref12$self);\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_4)) === null || _call2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._?.call(_call2$self);\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._?.call(_getSelf3$self);\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._?.call(_getSelf4$self);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _classPrivateFieldLoo,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _classPrivateFieldLoo2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _classPrivateFieldLoo3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _classPrivateFieldLoo4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    _classPrivateFieldLooseBase(Foo, _m)[_m]?.();\n    _classPrivateFieldLooseBase(Foo, _m)[_m]?.().toString;\n    _classPrivateFieldLooseBase(Foo, _m)[_m]?.().toString();\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.();\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString;\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]?.().toString();\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m]?.();\n    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]?.().toString;\n    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]?.().toString();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]?.();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[\n          _m\n        ]?.();\n    (_ref =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref.self, _m)[_m]?.();\n    (_ref2 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref2.self, _m)[_m]?.();\n    (_self2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.self) === null || _self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self2.self, _m)[_m]?.();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(), _m)[\n          _m\n        ]?.();\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n      null || _ref3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m]?.();\n    (_ref4 =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m]?.();\n    (_ref5$getSelf = (_ref5 =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n      ?.getSelf) === null || _ref5$getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m]?.();\n    (_ref6 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref6.self, _m)[_m]?.();\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo2)) === null || _call === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call.self, _m)[_m]?.();\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m]?.();\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m]?.();\n    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString;\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]?.().toString();\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m]?.();\n    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]?.().toString;\n    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]?.().toString();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[\n          _m\n        ]?.();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[\n          _m\n        ]?.();\n    (_ref7 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref7.self, _m)[_m]?.();\n    (_ref8 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref8.self, _m)[_m]?.();\n    (_self3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self) === null || _self3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self3.self, _m)[_m]?.();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(\n          _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n          _m,\n        )[_m]?.();\n    (_ref9 =\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n            .getSelf) === null || _ref9 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m]?.();\n    (_ref10 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m]?.();\n    (_ref11$getSelf = (_ref11 =\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n      ?.getSelf) === null || _ref11$getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m]?.();\n    (_ref12 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n    _ref12 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref12.self, _m)[_m]?.();\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call2.self, _m)[_m]?.();\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m]?.();\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m]?.();\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o$Foo,\n      _deep$very$o$Foo2,\n      _deep$very$o$Foo3,\n      _ref,\n      _ref2,\n      _self2,\n      _self3,\n      _self$self,\n      _ref3,\n      _assertClassBrand$_,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _self4,\n      _assertClassBrand$_2,\n      _call$self,\n      _getSelf$self,\n      _getSelf$self2,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o$Foo2,\n      _fnDeep$very$o$Foo3,\n      _ref4,\n      _ref5,\n      _self5,\n      _self6,\n      _self$self2,\n      _ref6,\n      _assertClassBrand$_3,\n      _call2,\n      _getSelf3,\n      _getSelf4,\n      _self7,\n      _assertClassBrand$_4,\n      _call$self2,\n      _getSelf$self3,\n      _getSelf$self4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo)).toEqual(1);\n    expect(Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString).toEqual((1).toString);\n    expect(Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString()).toEqual('1');\n    expect(\n      (_o$Foo = o?.Foo) === null || _o$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo, _m)._.call(_o$Foo),\n    ).toEqual(1);\n    expect(\n      (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo2, _m)._.call(_o$Foo2).toString,\n    ).toEqual((1).toString);\n    expect(\n      (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo3, _m)._.call(_o$Foo3).toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo, _m)._.call(_deep$very$o$Foo),\n    ).toEqual(1);\n    expect(\n      (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo2, _m)._.call(_deep$very$o$Foo2).toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo3, _m)._.call(_deep$very$o$Foo3).toString(),\n    ).toEqual('1');\n    expect(\n      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref, _m)._.call(_ref),\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref2, _m)._.call(_ref2),\n    ).toEqual(1);\n    expect(\n      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self2, _m)._.call(_self2),\n    ).toEqual(1);\n    expect(\n      (_self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)\n        ?.self) === null || _self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self3, _m)._.call(_self3),\n    ).toEqual(1);\n    expect(\n      (_self$self = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self?.self) === null || _self$self === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self$self, _m)._.call(_self$self),\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref3, _m)._.call(_ref3),\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_)) === null || _call === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call, _m)._.call(_call),\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf, _m)._.call(_getSelf),\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf2, _m)._.call(_getSelf2),\n    ).toEqual(1);\n    expect(\n      (_self4 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()\n      )?.self) === null || _self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self4, _m)._.call(_self4),\n    ).toEqual(1);\n    expect(\n      (_call$self = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_2)?.self) === null || _call$self === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call$self, _m)._.call(_call$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf$self = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()?.self) === null || _getSelf$self === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self, _m)._.call(_getSelf$self),\n    ).toEqual(1);\n    expect(\n      (_getSelf$self2 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self2, _m)._.call(_getSelf$self2),\n    ).toEqual(1);\n    expect(\n      (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo, _m)._.call(_fn$Foo),\n    ).toEqual(1);\n    expect(\n      (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo2, _m)._.call(_fn$Foo2).toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo3, _m)._.call(_fn$Foo3).toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _m)._.call(_fnDeep$very$o$Foo),\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo2, _m)._.call(_fnDeep$very$o$Foo2).toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo3, _m)._.call(_fnDeep$very$o$Foo3).toString(),\n    ).toEqual('1');\n    expect(\n      (_ref4 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref4, _m)._.call(_ref4),\n    ).toEqual(1);\n    expect(\n      (_ref5 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref5, _m)._.call(_ref5),\n    ).toEqual(1);\n    expect(\n      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self5, _m)._.call(_self5),\n    ).toEqual(1);\n    expect(\n      (_self6 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self\n      )?.self) === null || _self6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self6, _m)._.call(_self6),\n    ).toEqual(1);\n    expect(\n      (_self$self2 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.self?.self) === null || _self$self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self$self2, _m)._.call(_self$self2),\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref6, _m)._.call(_ref6),\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_3)) === null || _call2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call2, _m)._.call(_call2),\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf3, _m)._.call(_getSelf3),\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf4, _m)._.call(_getSelf4),\n    ).toEqual(1);\n    expect(\n      (_self7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n      )?.self) === null || _self7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self7, _m)._.call(_self7),\n    ).toEqual(1);\n    expect(\n      (_call$self2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_4)?.self) === null || _call$self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call$self2, _m)._.call(_call$self2),\n    ).toEqual(1);\n    expect(\n      (_getSelf$self3 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()?.self) === null || _getSelf$self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self3, _m)._.call(_getSelf$self3),\n    ).toEqual(1);\n    expect(\n      (_getSelf$self4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self4, _m)._.call(_getSelf$self4),\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _o$Foo4,\n      _o$Foo5,\n      _o$Foo6,\n      _deep$very$o$Foo4,\n      _deep$very$o$Foo5,\n      _deep$very$o$Foo6,\n      _ref7,\n      _ref8,\n      _self8,\n      _self9,\n      _self$self3,\n      _ref9,\n      _assertClassBrand$_5,\n      _call3,\n      _getSelf5,\n      _getSelf6,\n      _self10,\n      _assertClassBrand$_6,\n      _call$self3,\n      _getSelf$self5,\n      _getSelf$self6,\n      _fn$Foo4,\n      _fn$Foo5,\n      _fn$Foo6,\n      _fnDeep$very$o$Foo4,\n      _fnDeep$very$o$Foo5,\n      _fnDeep$very$o$Foo6,\n      _ref10,\n      _ref11,\n      _self11,\n      _self12,\n      _self$self4,\n      _ref12,\n      _assertClassBrand$_7,\n      _call4,\n      _getSelf7,\n      _getSelf8,\n      _self13,\n      _assertClassBrand$_8,\n      _call$self4,\n      _getSelf$self7,\n      _getSelf$self8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      (_o$Foo4 = o?.Foo) === null || _o$Foo4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo4, _m)._.call(_o$Foo4),\n    ).toEqual(undefined);\n    expect(\n      (_o$Foo5 = o?.Foo) === null || _o$Foo5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo5, _m)._.call(_o$Foo5).toString,\n    ).toEqual(undefined);\n    expect(\n      (_o$Foo6 = o?.Foo) === null || _o$Foo6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo6, _m)._.call(_o$Foo6).toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo4 = deep?.very.o?.Foo) === null || _deep$very$o$Foo4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo4, _m)._.call(_deep$very$o$Foo4),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo5 = deep?.very.o?.Foo) === null || _deep$very$o$Foo5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo5, _m)._.call(_deep$very$o$Foo5).toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo6 = deep?.very.o?.Foo) === null || _deep$very$o$Foo6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo6, _m)._.call(_deep$very$o$Foo6).toString(),\n    ).toEqual(undefined);\n    expect(\n      (_ref7 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref7, _m)._.call(_ref7),\n    ).toEqual(undefined);\n    expect(\n      (_ref8 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref8, _m)._.call(_ref8),\n    ).toEqual(undefined);\n    expect(\n      (_self8 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self8, _m)._.call(_self8),\n    ).toEqual(undefined);\n    expect(\n      (_self9 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)\n        ?.self) === null || _self9 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self9, _m)._.call(_self9),\n    ).toEqual(undefined);\n    expect(\n      (_self$self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self?.self) === null || _self$self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self$self3, _m)._.call(_self$self3),\n    ).toEqual(undefined);\n    expect(\n      (_ref9 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref9 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref9, _m)._.call(_ref9),\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_5)) === null || _call3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call3, _m)._.call(_call3),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf5, _m)._.call(_getSelf5),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf6, _m)._.call(_getSelf6),\n    ).toEqual(undefined);\n    expect(\n      (_self10 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()\n      )?.self) === null || _self10 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self10, _m)._.call(_self10),\n    ).toEqual(undefined);\n    expect(\n      (_call$self3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_6)?.self) === null || _call$self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call$self3, _m)._.call(_call$self3),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self5 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()?.self) === null || _getSelf$self5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self5, _m)._.call(_getSelf$self5),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self6 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()?.self) === null || _getSelf$self6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self6, _m)._.call(_getSelf$self6),\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo4 = fn?.().Foo) === null || _fn$Foo4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo4, _m)._.call(_fn$Foo4),\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo5 = fn?.().Foo) === null || _fn$Foo5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo5, _m)._.call(_fn$Foo5).toString,\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo6 = fn?.().Foo) === null || _fn$Foo6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo6, _m)._.call(_fn$Foo6).toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo4 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo4, _m)._.call(_fnDeep$very$o$Foo4),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo5 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo5, _m)._.call(_fnDeep$very$o$Foo5).toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo6 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo6, _m)._.call(_fnDeep$very$o$Foo6).toString(),\n    ).toEqual(undefined);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref10 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref10, _m)._.call(_ref10),\n    ).toEqual(undefined);\n    expect(\n      (_ref11 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref11 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref11, _m)._.call(_ref11),\n    ).toEqual(undefined);\n    expect(\n      (_self11 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self11 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self11, _m)._.call(_self11),\n    ).toEqual(undefined);\n    expect(\n      (_self12 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self\n      )?.self) === null || _self12 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self12, _m)._.call(_self12),\n    ).toEqual(undefined);\n    expect(\n      (_self$self4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.self?.self) === null || _self$self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self$self4, _m)._.call(_self$self4),\n    ).toEqual(undefined);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref12, _m)._.call(_ref12),\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_7)) === null || _call4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call4, _m)._.call(_call4),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf7, _m)._.call(_getSelf7),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf8, _m)._.call(_getSelf8),\n    ).toEqual(undefined);\n    expect(\n      (_self13 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n      )?.self) === null || _self13 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self13, _m)._.call(_self13),\n    ).toEqual(undefined);\n    expect(\n      (_call$self4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_8)?.self) === null || _call$self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call$self4, _m)._.call(_call$self4),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()?.self) === null || _getSelf$self7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self7, _m)._.call(_getSelf$self7),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self8 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()?.self) === null || _getSelf$self8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self8, _m)._.call(_getSelf$self8),\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();\nFoo.testNull();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o$Foo,\n      _deep$very$o$Foo2,\n      _deep$very$o$Foo3,\n      _ref,\n      _ref2,\n      _self2,\n      _self3,\n      _self$self,\n      _ref3,\n      _classPrivateFieldLoo,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _self4,\n      _classPrivateFieldLoo2,\n      _call$self,\n      _getSelf$self,\n      _getSelf$self2,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o$Foo2,\n      _fnDeep$very$o$Foo3,\n      _ref4,\n      _ref5,\n      _self5,\n      _self6,\n      _self$self2,\n      _ref6,\n      _classPrivateFieldLoo3,\n      _call2,\n      _getSelf3,\n      _getSelf4,\n      _self7,\n      _classPrivateFieldLoo4,\n      _call$self2,\n      _getSelf$self3,\n      _getSelf$self4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      Foo === null || Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      (_o$Foo = o?.Foo) === null || _o$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo2, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo3, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo2, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo3, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      (_ref =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref2, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self2, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self3 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n      )?.self) === null || _self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self3, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self$self = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self?.self) === null || _self$self === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self$self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref3, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo)) === null || _call === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf2, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self4 = (\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n      )?.self) === null || _self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self4, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_call$self = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo2)?.self) === null || _call$self === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call$self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf$self = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()?.self) === null || _getSelf$self === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf$self2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self2, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo2, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo3, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo2, _m)[_m]().toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo3, _m)[_m]().toString(),\n    ).toEqual('1');\n    expect(\n      (_ref4 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref4, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref5 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref5, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self5 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self5, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self6 = (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n      )?.self) === null || _self6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self6, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self$self2 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self?.self) === null || _self$self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self$self2, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref6, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo3)) === null || _call2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call2, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf3, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf4, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_self7 = (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n      )?.self) === null || _self7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self7, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_call$self2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo4)?.self) === null || _call$self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call$self2, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf$self3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()?.self) === null || _getSelf$self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self3, _m)[_m](),\n    ).toEqual(1);\n    expect(\n      (_getSelf$self4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self4, _m)[_m](),\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _o$Foo4,\n      _o$Foo5,\n      _o$Foo6,\n      _deep$very$o$Foo4,\n      _deep$very$o$Foo5,\n      _deep$very$o$Foo6,\n      _ref7,\n      _ref8,\n      _self8,\n      _self9,\n      _self$self3,\n      _ref9,\n      _classPrivateFieldLoo5,\n      _call3,\n      _getSelf5,\n      _getSelf6,\n      _self10,\n      _classPrivateFieldLoo6,\n      _call$self3,\n      _getSelf$self5,\n      _getSelf$self6,\n      _fn$Foo4,\n      _fn$Foo5,\n      _fn$Foo6,\n      _fnDeep$very$o$Foo4,\n      _fnDeep$very$o$Foo5,\n      _fnDeep$very$o$Foo6,\n      _ref10,\n      _ref11,\n      _self11,\n      _self12,\n      _self$self4,\n      _ref12,\n      _classPrivateFieldLoo7,\n      _call4,\n      _getSelf7,\n      _getSelf8,\n      _self13,\n      _classPrivateFieldLoo8,\n      _call$self4,\n      _getSelf$self7,\n      _getSelf$self8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      (_o$Foo4 = o?.Foo) === null || _o$Foo4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo4, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_o$Foo5 = o?.Foo) === null || _o$Foo5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo5, _m)[_m]().toString,\n    ).toEqual(undefined);\n    expect(\n      (_o$Foo6 = o?.Foo) === null || _o$Foo6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo6, _m)[_m]().toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo4 = deep?.very.o?.Foo) === null || _deep$very$o$Foo4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo4, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo5 = deep?.very.o?.Foo) === null || _deep$very$o$Foo5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo5, _m)[_m]().toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo6 = deep?.very.o?.Foo) === null || _deep$very$o$Foo6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo6, _m)[_m]().toString(),\n    ).toEqual(undefined);\n    expect(\n      (_ref7 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref7, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref8 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref8, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self8 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self8, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self9 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n      )?.self) === null || _self9 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self9, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self$self3 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self?.self) === null || _self$self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self$self3, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref9 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref9 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref9, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo5)) === null || _call3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call3, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf5, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf6, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self10 = (\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n      )?.self) === null || _self10 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self10, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_call$self3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo6)?.self) === null || _call$self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call$self3, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self5 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()?.self) === null || _getSelf$self5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self5, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self6 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()?.self) === null || _getSelf$self6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self6, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo4 = fn?.().Foo) === null || _fn$Foo4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo4, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo5 = fn?.().Foo) === null || _fn$Foo5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo5, _m)[_m]().toString,\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo6 = fn?.().Foo) === null || _fn$Foo6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo6, _m)[_m]().toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo4 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo4, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo5 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo5, _m)[_m]().toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo6 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo6, _m)[_m]().toString(),\n    ).toEqual(undefined);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref10, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref11 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref11 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref11, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self11 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self11 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self11, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self12 = (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n      )?.self) === null || _self12 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self12, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self$self4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self?.self) === null || _self$self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self$self4, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref12 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref12, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo7)) === null || _call4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call4, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf7, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf8, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_self13 = (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n      )?.self) === null || _self13 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self13, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_call$self4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo8)?.self) === null || _call$self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call$self4, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self7 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()?.self) === null || _getSelf$self7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self7, _m)[_m](),\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self8 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()?.self) === null || _getSelf$self8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self8, _m)[_m](),\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();\nFoo.testNull();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o$Foo,\n      _deep$very$o$Foo2,\n      _deep$very$o$Foo3,\n      _ref,\n      _ref2,\n      _self2,\n      _self3,\n      _self$self,\n      _ref3,\n      _assertClassBrand$_,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _self4,\n      _assertClassBrand$_2,\n      _call$self,\n      _getSelf$self,\n      _getSelf$self2,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o$Foo2,\n      _fnDeep$very$o$Foo3,\n      _ref4,\n      _ref5,\n      _self5,\n      _self6,\n      _self$self2,\n      _ref6,\n      _assertClassBrand$_3,\n      _call2,\n      _getSelf3,\n      _getSelf4,\n      _self7,\n      _assertClassBrand$_4,\n      _call$self2,\n      _getSelf$self3,\n      _getSelf$self4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo);\n    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString;\n    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString();\n    (_o$Foo = o?.Foo) === null || _o$Foo === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo, _m)._.call(_o$Foo);\n    (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo2, _m)._.call(_o$Foo2).toString;\n    (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo3, _m)._.call(_o$Foo3).toString();\n    (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o$Foo, _m)._.call(_deep$very$o$Foo);\n    (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o$Foo2, _m)._.call(_deep$very$o$Foo2).toString;\n    (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o$Foo3, _m)._.call(_deep$very$o$Foo3).toString();\n    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref, _m)._.call(_ref);\n    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n      null || _ref2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref2, _m)._.call(_ref2);\n    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n      ?.self) === null || _self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self2, _m)._.call(_self2);\n    (_self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)\n      ?.self) === null || _self3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self3, _m)._.call(_self3);\n    (_self$self = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n      ?.self?.self) === null || _self$self === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self$self, _m)._.call(_self$self);\n    (_ref3 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n      null || _ref3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref3, _m)._.call(_ref3);\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_)) === null || _call === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call, _m)._.call(_call);\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf, _m)._.call(_getSelf);\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf2, _m)._.call(_getSelf2);\n    (_self4 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()\n    )?.self) === null || _self4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self4, _m)._.call(_self4);\n    (_call$self = (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_2)?.self) === null || _call$self === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call$self, _m)._.call(_call$self);\n    (_getSelf$self = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf()?.self) === null || _getSelf$self === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf$self, _m)._.call(_getSelf$self);\n    (_getSelf$self2 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf$self2, _m)._.call(_getSelf$self2);\n    (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo, _m)._.call(_fn$Foo);\n    (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo2, _m)._.call(_fn$Foo2).toString;\n    (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo3, _m)._.call(_fn$Foo3).toString();\n    (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _m)._.call(_fnDeep$very$o$Foo);\n    (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o$Foo2, _m)._.call(_fnDeep$very$o$Foo2).toString;\n    (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o$Foo3, _m)._.call(_fnDeep$very$o$Foo3).toString();\n    (_ref4 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref4, _m)._.call(_ref4);\n    (_ref5 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n      null || _ref5 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref5, _m)._.call(_ref5);\n    (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.self) === null || _self5 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self5, _m)._.call(_self5);\n    (_self6 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self\n    )?.self) === null || _self6 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self6, _m)._.call(_self6);\n    (_self$self2 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.self?.self) === null || _self$self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self$self2, _m)._.call(_self$self2);\n    (_ref6 =\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref6 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref6, _m)._.call(_ref6);\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_3)) === null || _call2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call2, _m)._.call(_call2);\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf3, _m)._.call(_getSelf3);\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf4, _m)._.call(_getSelf4);\n    (_self7 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n    )?.self) === null || _self7 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self7, _m)._.call(_self7);\n    (_call$self2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_4)?.self) === null || _call$self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call$self2, _m)._.call(_call$self2);\n    (_getSelf$self3 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()?.self) === null || _getSelf$self3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf$self3, _m)._.call(_getSelf$self3);\n    (_getSelf$self4 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf$self4, _m)._.call(_getSelf$self4);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o$Foo,\n      _deep$very$o$Foo2,\n      _deep$very$o$Foo3,\n      _ref,\n      _ref2,\n      _self2,\n      _self3,\n      _self$self,\n      _ref3,\n      _classPrivateFieldLoo,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _self4,\n      _classPrivateFieldLoo2,\n      _call$self,\n      _getSelf$self,\n      _getSelf$self2,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o$Foo2,\n      _fnDeep$very$o$Foo3,\n      _ref4,\n      _ref5,\n      _self5,\n      _self6,\n      _self$self2,\n      _ref6,\n      _classPrivateFieldLoo3,\n      _call2,\n      _getSelf3,\n      _getSelf4,\n      _self7,\n      _classPrivateFieldLoo4,\n      _call$self2,\n      _getSelf$self3,\n      _getSelf$self4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]();\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString;\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString();\n    (_o$Foo = o?.Foo) === null || _o$Foo === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_o$Foo, _m)[_m]();\n    (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_o$Foo2, _m)[_m]().toString;\n    (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_o$Foo3, _m)[_m]().toString();\n    (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o$Foo, _m)[_m]();\n    (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o$Foo2, _m)[_m]().toString;\n    (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o$Foo3, _m)[_m]().toString();\n    (_ref =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref, _m)[_m]();\n    (_ref2 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref2, _m)[_m]();\n    (_self2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.self) === null || _self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self2, _m)[_m]();\n    (_self3 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n    )?.self) === null || _self3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self3, _m)[_m]();\n    (_self$self = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.self?.self) === null || _self$self === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self$self, _m)[_m]();\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref3, _m)[_m]();\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo)) === null || _call === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call, _m)[_m]();\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf, _m)[_m]();\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf2, _m)[_m]();\n    (_self4 = (\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n    )?.self) === null || _self4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self4, _m)[_m]();\n    (_call$self = (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo2)?.self) === null || _call$self === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call$self, _m)[_m]();\n    (_getSelf$self = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()?.self) === null || _getSelf$self === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf$self, _m)[_m]();\n    (_getSelf$self2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf$self2, _m)[_m]();\n    (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fn$Foo, _m)[_m]();\n    (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fn$Foo2, _m)[_m]().toString;\n    (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fn$Foo3, _m)[_m]().toString();\n    (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _m)[_m]();\n    (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo2, _m)[_m]().toString;\n    (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo3, _m)[_m]().toString();\n    (_ref4 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref4, _m)[_m]();\n    (_ref5 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref5 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref5, _m)[_m]();\n    (_self5 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self) === null || _self5 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self5, _m)[_m]();\n    (_self6 = (\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n    )?.self) === null || _self6 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self6, _m)[_m]();\n    (_self$self2 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self?.self) === null || _self$self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self$self2, _m)[_m]();\n    (_ref6 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n    _ref6 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref6, _m)[_m]();\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo3)) === null || _call2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call2, _m)[_m]();\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf3, _m)[_m]();\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf4, _m)[_m]();\n    (_self7 = (\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n    )?.self) === null || _self7 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self7, _m)[_m]();\n    (_call$self2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo4)?.self) === null || _call$self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call$self2, _m)[_m]();\n    (_getSelf$self3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()?.self) === null || _getSelf$self3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf$self3, _m)[_m]();\n    (_getSelf$self4 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf$self4, _m)[_m]();\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o,\n      _deep$very$o$Foo,\n      _deep$very$o2,\n      _deep$very$o2$Foo,\n      _deep$very$o3,\n      _deep$very$o3$Foo,\n      _o$Foo$self,\n      _o$Foo$self$self,\n      _ref,\n      _ref$self,\n      _ref2,\n      _ref2$self,\n      _self2,\n      _self2$self,\n      _o$Foo$self$getSelf,\n      _assertClassBrand$_,\n      _ref3,\n      _ref3$call,\n      _ref4,\n      _ref4$getSelf,\n      _ref5,\n      _ref5$getSelf,\n      _ref5$getSelf$call,\n      _ref6,\n      _ref6$self,\n      _assertClassBrand$_2,\n      _call,\n      _call$self,\n      _getSelf,\n      _getSelf$self,\n      _getSelf2,\n      _getSelf2$self,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o2,\n      _fnDeep$very$o2$Foo,\n      _fnDeep$very$o3,\n      _fnDeep$very$o3$Foo,\n      _fn$Foo$self,\n      _fn$Foo$self$self,\n      _ref7,\n      _ref7$self,\n      _ref8,\n      _ref8$self,\n      _self3,\n      _self3$self,\n      _fn$Foo$self$getSelf,\n      _assertClassBrand$_3,\n      _ref9,\n      _ref9$call,\n      _ref10,\n      _ref10$getSelf,\n      _ref11,\n      _ref11$getSelf,\n      _ref11$getSelf$call,\n      _ref12,\n      _ref12$self,\n      _assertClassBrand$_4,\n      _call2,\n      _call2$self,\n      _getSelf3,\n      _getSelf3$self,\n      _getSelf4,\n      _getSelf4$self;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo);\n    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString;\n    Foo === null || Foo === void 0 ? void 0 : _m._.call(Foo).toString();\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.call(_o$Foo);\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.call(_o$Foo2).toString;\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)\n          ._.call(_o$Foo3)\n          .toString();\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o$Foo = _deep$very$o.Foo), _m)._.call(_deep$very$o$Foo);\n    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o2$Foo = _deep$very$o2.Foo), _m)._.call(\n          _deep$very$o2$Foo,\n        ).toString;\n    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_deep$very$o3$Foo = _deep$very$o3.Foo), _m)\n          ._.call(_deep$very$o3$Foo)\n          .toString();\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo$self = _assertClassBrand(Foo, o.Foo, _self)._), _m)._.call(\n          _o$Foo$self,\n        );\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_o$Foo$self$self = _assertClassBrand(Foo, o.Foo, _self)._.self),\n          _m,\n        )._.call(_o$Foo$self$self);\n    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref$self = _ref.self), _m)._.call(_ref$self);\n    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n      null || _ref2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref2$self = _ref2.self), _m)._.call(_ref2$self);\n    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n      ?.self) === null || _self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_self2$self = _self2.self), _m)._.call(_self2$self);\n    o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_o$Foo$self$getSelf = _assertClassBrand(Foo, o.Foo, _self)._.getSelf()),\n          _m,\n        )._.call(_o$Foo$self$getSelf);\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf) === null ||\n    _ref3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref3$call = _ref3.call(_assertClassBrand$_)), _m)._.call(\n          _ref3$call,\n        );\n    (_ref4 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref4$getSelf = _ref4.getSelf()), _m)._.call(_ref4$getSelf);\n    (_ref5$getSelf = (_ref5 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)?.getSelf) ===\n      null || _ref5$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref5$getSelf$call = _ref5$getSelf.call(_ref5)), _m)._.call(\n          _ref5$getSelf$call,\n        );\n    (_ref6 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n      null || _ref6 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref6$self = _ref6.self), _m)._.call(_ref6$self);\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_2)) === null || _call === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_call$self = _call.self), _m)._.call(_call$self);\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf$self = _getSelf.self), _m)._.call(_getSelf$self);\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf2$self = _getSelf2.self), _m)._.call(_getSelf2$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo = fn().Foo), _m)._.call(_fn$Foo);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo2 = fn().Foo), _m)._.call(_fn$Foo2).toString;\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fn$Foo3 = fn().Foo), _m)\n          ._.call(_fn$Foo3)\n          .toString();\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o$Foo = _fnDeep$very$o.Foo), _m)._.call(\n          _fnDeep$very$o$Foo,\n        );\n    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o2$Foo = _fnDeep$very$o2.Foo), _m)._.call(\n          _fnDeep$very$o2$Foo,\n        ).toString;\n    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_fnDeep$very$o3$Foo = _fnDeep$very$o3.Foo), _m)\n          ._.call(_fnDeep$very$o3$Foo)\n          .toString();\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self = _assertClassBrand(Foo, fn().Foo, _self)._),\n          _m,\n        )._.call(_fn$Foo$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self$self = _assertClassBrand(Foo, fn().Foo, _self)._.self),\n          _m,\n        )._.call(_fn$Foo$self$self);\n    (_ref7 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref7 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref7$self = _ref7.self), _m)._.call(_ref7$self);\n    (_ref8 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n      null || _ref8 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref8$self = _ref8.self), _m)._.call(_ref8$self);\n    (_self3 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.self) === null || _self3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_self3$self = _self3.self), _m)._.call(_self3$self);\n    fn === null || fn === void 0\n      ? void 0\n      : _assertClassBrand(\n          Foo,\n          (_fn$Foo$self$getSelf = _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()),\n          _m,\n        )._.call(_fn$Foo$self$getSelf);\n    (_ref9 =\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf) === null ||\n    _ref9 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref9$call = _ref9.call(_assertClassBrand$_3)), _m)._.call(\n          _ref9$call,\n        );\n    (_ref10 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref10 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref10$getSelf = _ref10.getSelf()), _m)._.call(_ref10$getSelf);\n    (_ref11$getSelf = (_ref11 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.getSelf) === null || _ref11$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref11$getSelf$call = _ref11$getSelf.call(_ref11)), _m)._.call(\n          _ref11$getSelf$call,\n        );\n    (_ref12 =\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_ref12$self = _ref12.self), _m)._.call(_ref12$self);\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_4)) === null || _call2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_call2$self = _call2.self), _m)._.call(_call2$self);\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf3$self = _getSelf3.self), _m)._.call(_getSelf3$self);\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_getSelf4$self = _getSelf4.self), _m)._.call(_getSelf4$self);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _deep$very$o,\n      _deep$very$o2,\n      _deep$very$o3,\n      _ref,\n      _ref2,\n      _self2,\n      _classPrivateFieldLoo,\n      _ref3,\n      _ref4,\n      _ref5,\n      _ref5$getSelf,\n      _ref6,\n      _classPrivateFieldLoo2,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _fnDeep$very$o,\n      _fnDeep$very$o2,\n      _fnDeep$very$o3,\n      _ref7,\n      _ref8,\n      _self3,\n      _classPrivateFieldLoo3,\n      _ref9,\n      _ref10,\n      _ref11,\n      _ref11$getSelf,\n      _ref12,\n      _classPrivateFieldLoo4,\n      _call2,\n      _getSelf3,\n      _getSelf4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]();\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString;\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _m)[_m]().toString();\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]();\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString;\n    o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _m)[_m]().toString();\n    (_deep$very$o = deep?.very.o) === null || _deep$very$o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o.Foo, _m)[_m]();\n    (_deep$very$o2 = deep?.very.o) === null || _deep$very$o2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o2.Foo, _m)[_m]().toString;\n    (_deep$very$o3 = deep?.very.o) === null || _deep$very$o3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o3.Foo, _m)[_m]().toString();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self], _m)[_m]();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].self, _m)[\n          _m\n        ]();\n    (_ref =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref.self, _m)[_m]();\n    (_ref2 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref2.self, _m)[_m]();\n    (_self2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.self) === null || _self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self2.self, _m)[_m]();\n    o === null || o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf(), _m)[\n          _m\n        ]();\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf) ===\n      null || _ref3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref3.call(_classPrivateFieldLoo), _m)[_m]();\n    (_ref4 =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref4.getSelf(), _m)[_m]();\n    (_ref5$getSelf = (_ref5 =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self])\n      ?.getSelf) === null || _ref5$getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref5$getSelf.call(_ref5), _m)[_m]();\n    (_ref6 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref6 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref6.self, _m)[_m]();\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo2)) === null || _call === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call.self, _m)[_m]();\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf.self, _m)[_m]();\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf2.self, _m)[_m]();\n    fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString;\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(fn().Foo, _m)[_m]().toString();\n    (_fnDeep$very$o = fnDeep?.().very.o) === null || _fnDeep$very$o === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o.Foo, _m)[_m]();\n    (_fnDeep$very$o2 = fnDeep?.().very.o) === null || _fnDeep$very$o2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o2.Foo, _m)[_m]().toString;\n    (_fnDeep$very$o3 = fnDeep?.().very.o) === null || _fnDeep$very$o3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o3.Foo, _m)[_m]().toString();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self], _m)[_m]();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_classPrivateFieldLooseBase(fn().Foo, _self)[_self].self, _m)[\n          _m\n        ]();\n    (_ref7 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref7 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref7.self, _m)[_m]();\n    (_ref8 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref8 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref8.self, _m)[_m]();\n    (_self3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self) === null || _self3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self3.self, _m)[_m]();\n    fn === null || fn === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(\n          _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf(),\n          _m,\n        )[_m]();\n    (_ref9 =\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n            .getSelf) === null || _ref9 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref9.call(_classPrivateFieldLoo3), _m)[_m]();\n    (_ref10 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref10.getSelf(), _m)[_m]();\n    (_ref11$getSelf = (_ref11 =\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self])\n      ?.getSelf) === null || _ref11$getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref11$getSelf.call(_ref11), _m)[_m]();\n    (_ref12 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n    _ref12 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref12.self, _m)[_m]();\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo4)) === null || _call2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call2.self, _m)[_m]();\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf3.self, _m)[_m]();\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf4.self, _m)[_m]();\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o$Foo,\n      _deep$very$o$Foo2,\n      _deep$very$o$Foo3,\n      _ref,\n      _ref2,\n      _self2,\n      _self3,\n      _self$self,\n      _ref3,\n      _assertClassBrand$_,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _self4,\n      _assertClassBrand$_2,\n      _call$self,\n      _getSelf$self,\n      _getSelf$self2,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o$Foo2,\n      _fnDeep$very$o$Foo3,\n      _ref4,\n      _ref5,\n      _self5,\n      _self6,\n      _self$self2,\n      _ref6,\n      _assertClassBrand$_3,\n      _call2,\n      _getSelf3,\n      _getSelf4,\n      _self7,\n      _assertClassBrand$_4,\n      _call$self2,\n      _getSelf$self3,\n      _getSelf$self4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(Foo === null || Foo === void 0 ? void 0 : _x._).toEqual(1);\n    expect(Foo === null || Foo === void 0 ? void 0 : _x._.toString).toEqual((1).toString);\n    expect(Foo === null || Foo === void 0 ? void 0 : _x._.toString()).toEqual('1');\n    expect(\n      (_o$Foo = o?.Foo) === null || _o$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo, _x)._,\n    ).toEqual(1);\n    expect(\n      (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo2, _x)._.toString,\n    ).toEqual((1).toString);\n    expect(\n      (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo3, _x)._.toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo, _x)._,\n    ).toEqual(1);\n    expect(\n      (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo2, _x)._.toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo3, _x)._.toString(),\n    ).toEqual('1');\n    expect(\n      (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref, _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref2, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self2, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)\n        ?.self) === null || _self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self3, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self$self = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self?.self) === null || _self$self === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self$self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref3, _x)._,\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_)) === null || _call === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf2, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self4 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()\n      )?.self) === null || _self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self4, _x)._,\n    ).toEqual(1);\n    expect(\n      (_call$self = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_2)?.self) === null || _call$self === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call$self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf$self = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()?.self) === null || _getSelf$self === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf$self2 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self2, _x)._,\n    ).toEqual(1);\n    expect(\n      (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo, _x)._,\n    ).toEqual(1);\n    expect(\n      (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo2, _x)._.toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo3, _x)._.toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _x)._,\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo2, _x)._.toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo3, _x)._.toString(),\n    ).toEqual('1');\n    expect(\n      (_ref4 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref4, _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref5 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref5, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self5, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self6 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self\n      )?.self) === null || _self6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self6, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self$self2 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.self?.self) === null || _self$self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self$self2, _x)._,\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref6, _x)._,\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_3)) === null || _call2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call2, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf3, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf4, _x)._,\n    ).toEqual(1);\n    expect(\n      (_self7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n      )?.self) === null || _self7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self7, _x)._,\n    ).toEqual(1);\n    expect(\n      (_call$self2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_4)?.self) === null || _call$self2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call$self2, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf$self3 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()?.self) === null || _getSelf$self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self3, _x)._,\n    ).toEqual(1);\n    expect(\n      (_getSelf$self4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self4, _x)._,\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _o$Foo4,\n      _o$Foo5,\n      _o$Foo6,\n      _deep$very$o$Foo4,\n      _deep$very$o$Foo5,\n      _deep$very$o$Foo6,\n      _ref7,\n      _ref8,\n      _self8,\n      _self9,\n      _self$self3,\n      _ref9,\n      _assertClassBrand$_5,\n      _call3,\n      _getSelf5,\n      _getSelf6,\n      _self10,\n      _assertClassBrand$_6,\n      _call$self3,\n      _getSelf$self5,\n      _getSelf$self6,\n      _fn$Foo4,\n      _fn$Foo5,\n      _fn$Foo6,\n      _fnDeep$very$o$Foo4,\n      _fnDeep$very$o$Foo5,\n      _fnDeep$very$o$Foo6,\n      _ref10,\n      _ref11,\n      _self11,\n      _self12,\n      _self$self4,\n      _ref12,\n      _assertClassBrand$_7,\n      _call4,\n      _getSelf7,\n      _getSelf8,\n      _self13,\n      _assertClassBrand$_8,\n      _call$self4,\n      _getSelf$self7,\n      _getSelf$self8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      (_o$Foo4 = o?.Foo) === null || _o$Foo4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo4, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_o$Foo5 = o?.Foo) === null || _o$Foo5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo5, _x)._.toString,\n    ).toEqual(undefined);\n    expect(\n      (_o$Foo6 = o?.Foo) === null || _o$Foo6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo6, _x)._.toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo4 = deep?.very.o?.Foo) === null || _deep$very$o$Foo4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo4, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo5 = deep?.very.o?.Foo) === null || _deep$very$o$Foo5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo5, _x)._.toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo6 = deep?.very.o?.Foo) === null || _deep$very$o$Foo6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _deep$very$o$Foo6, _x)._.toString(),\n    ).toEqual(undefined);\n    expect(\n      (_ref7 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n        null || _ref7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref7, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref8 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n        null || _ref8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref8, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self8 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self) === null || _self8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self8, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self9 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)\n        ?.self) === null || _self9 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self9, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self$self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n        ?.self?.self) === null || _self$self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self$self3, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref9 =\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n        null || _ref9 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref9, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_5 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_5)) === null || _call3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call3, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf5, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf6, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self10 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()\n      )?.self) === null || _self10 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self10, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_call$self3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_assertClassBrand$_6 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_6)?.self) === null || _call$self3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call$self3, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self5 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf()?.self) === null || _getSelf$self5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self5, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self6 = (\n        o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n      )?.getSelf?.()?.self) === null || _getSelf$self6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self6, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo4 = fn?.().Foo) === null || _fn$Foo4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo4, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo5 = fn?.().Foo) === null || _fn$Foo5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo5, _x)._.toString,\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo6 = fn?.().Foo) === null || _fn$Foo6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo6, _x)._.toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo4 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo4, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo5 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo5 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo5, _x)._.toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo6 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo6 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fnDeep$very$o$Foo6, _x)._.toString(),\n    ).toEqual(undefined);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n        null || _ref10 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref10, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref11 =\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n        null || _ref11 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref11, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self11 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n        ?.self) === null || _self11 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self11, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self12 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self\n      )?.self) === null || _self12 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self12, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self$self4 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.self?.self) === null || _self$self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self$self4, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref12 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _ref12, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_7 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_7)) === null || _call4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call4, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf7, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf8, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_self13 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n      )?.self) === null || _self13 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _self13, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_call$self4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_assertClassBrand$_8 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n      )?.call(_assertClassBrand$_8)?.self) === null || _call$self4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _call$self4, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self7 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf()?.self) === null || _getSelf$self7 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self7, _x)._,\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self8 = (\n        fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n      )?.getSelf?.()?.self) === null || _getSelf$self8 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _getSelf$self8, _x)._,\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();\nFoo.testNull();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o$Foo,\n      _deep$very$o$Foo2,\n      _deep$very$o$Foo3,\n      _ref,\n      _ref2,\n      _self2,\n      _self3,\n      _self$self,\n      _ref3,\n      _classPrivateFieldLoo,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _self4,\n      _classPrivateFieldLoo2,\n      _call$self,\n      _getSelf$self,\n      _getSelf$self2,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o$Foo2,\n      _fnDeep$very$o$Foo3,\n      _ref4,\n      _ref5,\n      _self5,\n      _self6,\n      _self$self2,\n      _ref6,\n      _classPrivateFieldLoo3,\n      _call2,\n      _getSelf3,\n      _getSelf4,\n      _self7,\n      _classPrivateFieldLoo4,\n      _call$self2,\n      _getSelf$self3,\n      _getSelf$self4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      (_o$Foo = o?.Foo) === null || _o$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo2, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo3, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo2, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo3, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      (_ref =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref2 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref2, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self2, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self3 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n      )?.self) === null || _self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self3, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self$self = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self?.self) === null || _self$self === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self$self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref3 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref3, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_call = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo)) === null || _call === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf2, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self4 = (\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n      )?.self) === null || _self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self4, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_call$self = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo2)?.self) === null || _call$self === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call$self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf$self = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()?.self) === null || _getSelf$self === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf$self2 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self2, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo2, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo3, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo2, _x)[_x].toString,\n    ).toEqual((1).toString);\n    expect(\n      (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo3, _x)[_x].toString(),\n    ).toEqual('1');\n    expect(\n      (_ref4 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref4, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref5 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref5, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self5 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self5, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self6 = (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n      )?.self) === null || _self6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self6, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self$self2 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self?.self) === null || _self$self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self$self2, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_ref6 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref6, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_call2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo3)) === null || _call2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call2, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf3, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf4, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_self7 = (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n      )?.self) === null || _self7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self7, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_call$self2 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo4)?.self) === null || _call$self2 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call$self2, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf$self3 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()?.self) === null || _getSelf$self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self3, _x)[_x],\n    ).toEqual(1);\n    expect(\n      (_getSelf$self4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self4, _x)[_x],\n    ).toEqual(1);\n  }\n  static testNull() {\n    var _o$Foo4,\n      _o$Foo5,\n      _o$Foo6,\n      _deep$very$o$Foo4,\n      _deep$very$o$Foo5,\n      _deep$very$o$Foo6,\n      _ref7,\n      _ref8,\n      _self8,\n      _self9,\n      _self$self3,\n      _ref9,\n      _classPrivateFieldLoo5,\n      _call3,\n      _getSelf5,\n      _getSelf6,\n      _self10,\n      _classPrivateFieldLoo6,\n      _call$self3,\n      _getSelf$self5,\n      _getSelf$self6,\n      _fn$Foo4,\n      _fn$Foo5,\n      _fn$Foo6,\n      _fnDeep$very$o$Foo4,\n      _fnDeep$very$o$Foo5,\n      _fnDeep$very$o$Foo6,\n      _ref10,\n      _ref11,\n      _self11,\n      _self12,\n      _self$self4,\n      _ref12,\n      _classPrivateFieldLoo7,\n      _call4,\n      _getSelf7,\n      _getSelf8,\n      _self13,\n      _classPrivateFieldLoo8,\n      _call$self4,\n      _getSelf$self7,\n      _getSelf$self8;\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n    expect(\n      (_o$Foo4 = o?.Foo) === null || _o$Foo4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo4, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_o$Foo5 = o?.Foo) === null || _o$Foo5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo5, _x)[_x].toString,\n    ).toEqual(undefined);\n    expect(\n      (_o$Foo6 = o?.Foo) === null || _o$Foo6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_o$Foo6, _x)[_x].toString(),\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo4 = deep?.very.o?.Foo) === null || _deep$very$o$Foo4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo4, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo5 = deep?.very.o?.Foo) === null || _deep$very$o$Foo5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo5, _x)[_x].toString,\n    ).toEqual(undefined);\n    expect(\n      (_deep$very$o$Foo6 = deep?.very.o?.Foo) === null || _deep$very$o$Foo6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_deep$very$o$Foo6, _x)[_x].toString(),\n    ).toEqual(undefined);\n    expect(\n      (_ref7 =\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n        null || _ref7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref7, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref8 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref8, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self8 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self) === null || _self8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self8, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self9 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n      )?.self) === null || _self9 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self9, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self$self3 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.self?.self) === null || _self$self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self$self3, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref9 =\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref9 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref9, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_call3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo5 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo5)) === null || _call3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call3, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf5 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf5, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf6 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf6, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self10 = (\n        o === null || o === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n      )?.self) === null || _self10 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self10, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_call$self3 = (\n        o === null || o === void 0\n          ? void 0\n          : (_classPrivateFieldLoo6 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo6)?.self) === null || _call$self3 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call$self3, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self5 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf()?.self) === null || _getSelf$self5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self5, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self6 = (\n        o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n      )?.getSelf?.()?.self) === null || _getSelf$self6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self6, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo4 = fn?.().Foo) === null || _fn$Foo4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo4, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo5 = fn?.().Foo) === null || _fn$Foo5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo5, _x)[_x].toString,\n    ).toEqual(undefined);\n    expect(\n      (_fn$Foo6 = fn?.().Foo) === null || _fn$Foo6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fn$Foo6, _x)[_x].toString(),\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo4 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo4, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo5 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo5 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo5, _x)[_x].toString,\n    ).toEqual(undefined);\n    expect(\n      (_fnDeep$very$o$Foo6 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo6 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo6, _x)[_x].toString(),\n    ).toEqual(undefined);\n    expect(\n      (_ref10 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref10 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref10, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref11 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref11 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref11, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self11 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self) === null || _self11 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self11, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self12 = (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n      )?.self) === null || _self12 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self12, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self$self4 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.self?.self) === null || _self$self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self$self4, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_ref12 =\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n        _ref12 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_ref12, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_call4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo7 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo7)) === null || _call4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call4, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf7 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()) === null || _getSelf7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf7, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf8 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()) === null || _getSelf8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf8, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_self13 = (\n        fn === null || fn === void 0\n          ? void 0\n          : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n      )?.self) === null || _self13 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_self13, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_call$self4 = (\n        fn === null || fn === void 0\n          ? void 0\n          : (_classPrivateFieldLoo8 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n      )?.call(_classPrivateFieldLoo8)?.self) === null || _call$self4 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_call$self4, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self7 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf()?.self) === null || _getSelf$self7 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self7, _x)[_x],\n    ).toEqual(undefined);\n    expect(\n      (_getSelf$self8 = (\n        fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n      )?.getSelf?.()?.self) === null || _getSelf$self8 === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(_getSelf$self8, _x)[_x],\n    ).toEqual(undefined);\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();\nFoo.testNull();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o$Foo,\n      _deep$very$o$Foo2,\n      _deep$very$o$Foo3,\n      _ref,\n      _ref2,\n      _self2,\n      _self3,\n      _self$self,\n      _ref3,\n      _assertClassBrand$_,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _self4,\n      _assertClassBrand$_2,\n      _call$self,\n      _getSelf$self,\n      _getSelf$self2,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o$Foo2,\n      _fnDeep$very$o$Foo3,\n      _ref4,\n      _ref5,\n      _self5,\n      _self6,\n      _self$self2,\n      _ref6,\n      _assertClassBrand$_3,\n      _call2,\n      _getSelf3,\n      _getSelf4,\n      _self7,\n      _assertClassBrand$_4,\n      _call$self2,\n      _getSelf$self3,\n      _getSelf$self4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    Foo === null || Foo === void 0 ? void 0 : _x._;\n    Foo === null || Foo === void 0 ? void 0 : _x._.toString;\n    Foo === null || Foo === void 0 ? void 0 : _x._.toString();\n    (_o$Foo = o?.Foo) === null || _o$Foo === void 0 ? void 0 : _assertClassBrand(Foo, _o$Foo, _x)._;\n    (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo2, _x)._.toString;\n    (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo3, _x)._.toString();\n    (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o$Foo, _x)._;\n    (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o$Foo2, _x)._.toString;\n    (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _deep$very$o$Foo3, _x)._.toString();\n    (_ref = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._) ===\n      null || _ref === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref, _x)._;\n    (_ref2 = o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self) ===\n      null || _ref2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref2, _x)._;\n    (_self2 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n      ?.self) === null || _self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self2, _x)._;\n    (_self3 = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.self)\n      ?.self) === null || _self3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self3, _x)._;\n    (_self$self = (o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._)\n      ?.self?.self) === null || _self$self === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self$self, _x)._;\n    (_ref3 =\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()) ===\n      null || _ref3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref3, _x)._;\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_ = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_)) === null || _call === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call, _x)._;\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf, _x)._;\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf2, _x)._;\n    (_self4 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._.getSelf()\n    )?.self) === null || _self4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self4, _x)._;\n    (_call$self = (\n      o === null || o === void 0\n        ? void 0\n        : (_assertClassBrand$_2 = _assertClassBrand(Foo, o.Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_2)?.self) === null || _call$self === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call$self, _x)._;\n    (_getSelf$self = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf()?.self) === null || _getSelf$self === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf$self, _x)._;\n    (_getSelf$self2 = (\n      o === null || o === void 0 ? void 0 : _assertClassBrand(Foo, o.Foo, _self)._\n    )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf$self2, _x)._;\n    (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo, _x)._;\n    (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo2, _x)._.toString;\n    (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo3, _x)._.toString();\n    (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o$Foo, _x)._;\n    (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o$Foo2, _x)._.toString;\n    (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fnDeep$very$o$Foo3, _x)._.toString();\n    (_ref4 = fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._) ===\n      null || _ref4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref4, _x)._;\n    (_ref5 =\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self) ===\n      null || _ref5 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref5, _x)._;\n    (_self5 = (fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._)\n      ?.self) === null || _self5 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self5, _x)._;\n    (_self6 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.self\n    )?.self) === null || _self6 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self6, _x)._;\n    (_self$self2 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.self?.self) === null || _self$self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self$self2, _x)._;\n    (_ref6 =\n      fn === null || fn === void 0\n        ? void 0\n        : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()) === null || _ref6 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _ref6, _x)._;\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_3 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_3)) === null || _call2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call2, _x)._;\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf3, _x)._;\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf4, _x)._;\n    (_self7 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._.getSelf()\n    )?.self) === null || _self7 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _self7, _x)._;\n    (_call$self2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_assertClassBrand$_4 = _assertClassBrand(Foo, fn().Foo, _self)._).getSelf\n    )?.call(_assertClassBrand$_4)?.self) === null || _call$self2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _call$self2, _x)._;\n    (_getSelf$self3 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf()?.self) === null || _getSelf$self3 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf$self3, _x)._;\n    (_getSelf$self4 = (\n      fn === null || fn === void 0 ? void 0 : _assertClassBrand(Foo, fn().Foo, _self)._\n    )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _getSelf$self4, _x)._;\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\nvar _self = { _: _Foo };\n_defineProperty(Foo, 'self', _Foo);\nFoo.test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nclass Foo {\n  static getSelf() {\n    return this;\n  }\n  static test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _deep$very$o$Foo,\n      _deep$very$o$Foo2,\n      _deep$very$o$Foo3,\n      _ref,\n      _ref2,\n      _self2,\n      _self3,\n      _self$self,\n      _ref3,\n      _classPrivateFieldLoo,\n      _call,\n      _getSelf,\n      _getSelf2,\n      _self4,\n      _classPrivateFieldLoo2,\n      _call$self,\n      _getSelf$self,\n      _getSelf$self2,\n      _fn$Foo,\n      _fn$Foo2,\n      _fn$Foo3,\n      _fnDeep$very$o$Foo,\n      _fnDeep$very$o$Foo2,\n      _fnDeep$very$o$Foo3,\n      _ref4,\n      _ref5,\n      _self5,\n      _self6,\n      _self$self2,\n      _ref6,\n      _classPrivateFieldLoo3,\n      _call2,\n      _getSelf3,\n      _getSelf4,\n      _self7,\n      _classPrivateFieldLoo4,\n      _call$self2,\n      _getSelf$self3,\n      _getSelf$self4;\n    const o = { Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x];\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x].toString;\n    Foo === null || Foo === void 0 ? void 0 : _classPrivateFieldLooseBase(Foo, _x)[_x].toString();\n    (_o$Foo = o?.Foo) === null || _o$Foo === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_o$Foo, _x)[_x];\n    (_o$Foo2 = o?.Foo) === null || _o$Foo2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_o$Foo2, _x)[_x].toString;\n    (_o$Foo3 = o?.Foo) === null || _o$Foo3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_o$Foo3, _x)[_x].toString();\n    (_deep$very$o$Foo = deep?.very.o?.Foo) === null || _deep$very$o$Foo === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o$Foo, _x)[_x];\n    (_deep$very$o$Foo2 = deep?.very.o?.Foo) === null || _deep$very$o$Foo2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o$Foo2, _x)[_x].toString;\n    (_deep$very$o$Foo3 = deep?.very.o?.Foo) === null || _deep$very$o$Foo3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_deep$very$o$Foo3, _x)[_x].toString();\n    (_ref =\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]) ===\n      null || _ref === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref, _x)[_x];\n    (_ref2 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self) === null || _ref2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref2, _x)[_x];\n    (_self2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.self) === null || _self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self2, _x)[_x];\n    (_self3 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self].self\n    )?.self) === null || _self3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self3, _x)[_x];\n    (_self$self = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.self?.self) === null || _self$self === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self$self, _x)[_x];\n    (_ref3 =\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()) === null || _ref3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref3, _x)[_x];\n    (_call = (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo)) === null || _call === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call, _x)[_x];\n    (_getSelf = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf, _x)[_x];\n    (_getSelf2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf2, _x)[_x];\n    (_self4 = (\n      o === null || o === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(o.Foo, _self)[_self].getSelf()\n    )?.self) === null || _self4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self4, _x)[_x];\n    (_call$self = (\n      o === null || o === void 0\n        ? void 0\n        : (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(o.Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo2)?.self) === null || _call$self === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call$self, _x)[_x];\n    (_getSelf$self = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf()?.self) === null || _getSelf$self === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf$self, _x)[_x];\n    (_getSelf$self2 = (\n      o === null || o === void 0 ? void 0 : _classPrivateFieldLooseBase(o.Foo, _self)[_self]\n    )?.getSelf?.()?.self) === null || _getSelf$self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf$self2, _x)[_x];\n    (_fn$Foo = fn?.().Foo) === null || _fn$Foo === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fn$Foo, _x)[_x];\n    (_fn$Foo2 = fn?.().Foo) === null || _fn$Foo2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fn$Foo2, _x)[_x].toString;\n    (_fn$Foo3 = fn?.().Foo) === null || _fn$Foo3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fn$Foo3, _x)[_x].toString();\n    (_fnDeep$very$o$Foo = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo, _x)[_x];\n    (_fnDeep$very$o$Foo2 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo2, _x)[_x].toString;\n    (_fnDeep$very$o$Foo3 = fnDeep?.().very.o?.Foo) === null || _fnDeep$very$o$Foo3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_fnDeep$very$o$Foo3, _x)[_x].toString();\n    (_ref4 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]) === null || _ref4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref4, _x)[_x];\n    (_ref5 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self) === null || _ref5 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref5, _x)[_x];\n    (_self5 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self) === null || _self5 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self5, _x)[_x];\n    (_self6 = (\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].self\n    )?.self) === null || _self6 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self6, _x)[_x];\n    (_self$self2 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.self?.self) === null || _self$self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self$self2, _x)[_x];\n    (_ref6 =\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()) === null ||\n    _ref6 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_ref6, _x)[_x];\n    (_call2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo3 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo3)) === null || _call2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call2, _x)[_x];\n    (_getSelf3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()) === null || _getSelf3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf3, _x)[_x];\n    (_getSelf4 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()) === null || _getSelf4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf4, _x)[_x];\n    (_self7 = (\n      fn === null || fn === void 0\n        ? void 0\n        : _classPrivateFieldLooseBase(fn().Foo, _self)[_self].getSelf()\n    )?.self) === null || _self7 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_self7, _x)[_x];\n    (_call$self2 = (\n      fn === null || fn === void 0\n        ? void 0\n        : (_classPrivateFieldLoo4 = _classPrivateFieldLooseBase(fn().Foo, _self)[_self]).getSelf\n    )?.call(_classPrivateFieldLoo4)?.self) === null || _call$self2 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_call$self2, _x)[_x];\n    (_getSelf$self3 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf()?.self) === null || _getSelf$self3 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf$self3, _x)[_x];\n    (_getSelf$self4 = (\n      fn === null || fn === void 0 ? void 0 : _classPrivateFieldLooseBase(fn().Foo, _self)[_self]\n    )?.getSelf?.()?.self) === null || _getSelf$self4 === void 0\n      ? void 0\n      : _classPrivateFieldLooseBase(_getSelf$self4, _x)[_x];\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nObject.defineProperty(Foo, _self, {\n  writable: true,\n  value: _Foo,\n});\nFoo.self = _Foo;\nFoo.test();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return Foo;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo$self$getSelf,\n      _o$Foo$self$getSelf2,\n      _fn$Foo$self$getSelf,\n      _fn$Foo$self$getSelf2;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))()).toEqual(1);\n    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString).toEqual(\n      (1).toString,\n    );\n    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString()).toEqual('1');\n    expect(\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.bind(_o$Foo))(),\n    ).toEqual(1);\n    expect(\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.bind(_o$Foo2))().toString,\n    ).toEqual((1).toString);\n    expect(\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)._.bind(_o$Foo3))().toString(),\n    ).toEqual('1');\n    expect(\n      ((_o$Foo$self$getSelf = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo$self$getSelf, _m)._.bind(_o$Foo$self$getSelf))(),\n    ).toEqual(1);\n    expect(\n      ((_o$Foo$self$getSelf2 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo$self$getSelf2, _m)._.bind(_o$Foo$self$getSelf2))(),\n    ).toEqual(1);\n    expect(\n      ((_fn$Foo$self$getSelf = (fn()?.Foo?.self.getSelf)()) === null ||\n        _fn$Foo$self$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo$self$getSelf, _m)._.bind(_fn$Foo$self$getSelf))(),\n    ).toEqual(1);\n    expect(\n      ((_fn$Foo$self$getSelf2 = (fn?.().Foo.self?.getSelf)()) === null ||\n        _fn$Foo$self$getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo$self$getSelf2, _m)._.bind(_fn$Foo$self$getSelf2))(),\n    ).toEqual(1);\n  }\n  testNull() {\n    const o = null;\n    const fn = function () {\n      return { o };\n    };\n    expect(() => {\n      var _o$Foo4;\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo4 = o.Foo), _m)._.bind(_o$Foo4))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo5;\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo5 = o.Foo), _m)._.bind(_o$Foo5))().toString;\n    }).toThrow();\n    expect(() => {\n      var _o$Foo6;\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo6 = o.Foo), _m)._.bind(_o$Foo6))().toString();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo$self$getSelf3;\n      ((_o$Foo$self$getSelf3 = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo$self$getSelf3, _m)._.bind(_o$Foo$self$getSelf3))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo$self$getSelf4;\n      ((_o$Foo$self$getSelf4 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo$self$getSelf4, _m)._.bind(_o$Foo$self$getSelf4))();\n    }).toThrow();\n    expect(() => {\n      var _fn$Foo$self$getSelf3;\n      return (\n        (_fn$Foo$self$getSelf3 = (fn()?.Foo?.self.getSelf)()) === null ||\n          _fn$Foo$self$getSelf3 === void 0\n          ? void 0\n          : _assertClassBrand(Foo, _fn$Foo$self$getSelf3, _m)._.bind(_fn$Foo$self$getSelf3)\n      )();\n    }).toThrow();\n    expect(() => {\n      var _fn$Foo$self$getSelf4;\n      return (\n        (_fn$Foo$self$getSelf4 = (fn?.().Foo.self?.getSelf)()) === null ||\n          _fn$Foo$self$getSelf4 === void 0\n          ? void 0\n          : _assertClassBrand(Foo, _fn$Foo$self$getSelf4, _m)._.bind(_fn$Foo$self$getSelf4)\n      )();\n    }).toThrow();\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\n_defineProperty(Foo, 'self', _Foo);\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nnew Foo().test();\nnew Foo().testNull();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nclass Foo {\n  static getSelf() {\n    return Foo;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo$self$getSelf,\n      _o$Foo$self$getSelf2,\n      _fn$Foo$self$getSelf,\n      _fn$Foo$self$getSelf2;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))()).toEqual(1);\n    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString).toEqual(\n      (1).toString,\n    );\n    expect((Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString()).toEqual('1');\n    expect(\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.bind(_o$Foo))(),\n    ).toEqual(1);\n    expect(\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.bind(_o$Foo2))().toString,\n    ).toEqual((1).toString);\n    expect(\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)._.bind(_o$Foo3))().toString(),\n    ).toEqual('1');\n    expect(\n      ((_o$Foo$self$getSelf = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo$self$getSelf, _m)._.bind(_o$Foo$self$getSelf))(),\n    ).toEqual(1);\n    expect(\n      ((_o$Foo$self$getSelf2 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo$self$getSelf2, _m)._.bind(_o$Foo$self$getSelf2))(),\n    ).toEqual(1);\n    expect(\n      ((_fn$Foo$self$getSelf = (fn()?.Foo?.self.getSelf)()) === null ||\n        _fn$Foo$self$getSelf === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo$self$getSelf, _m)._.bind(_fn$Foo$self$getSelf))(),\n    ).toEqual(1);\n    expect(\n      ((_fn$Foo$self$getSelf2 = (fn?.().Foo.self?.getSelf)()) === null ||\n        _fn$Foo$self$getSelf2 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _fn$Foo$self$getSelf2, _m)._.bind(_fn$Foo$self$getSelf2))(),\n    ).toEqual(1);\n  }\n  testNull() {\n    const o = null;\n    const fn = function () {\n      return { o };\n    };\n    expect(() => {\n      var _o$Foo4;\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo4 = o.Foo), _m)._.bind(_o$Foo4))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo5;\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo5 = o.Foo), _m)._.bind(_o$Foo5))().toString;\n    }).toThrow();\n    expect(() => {\n      var _o$Foo6;\n      (o === null || o === void 0\n        ? void 0\n        : _assertClassBrand(Foo, (_o$Foo6 = o.Foo), _m)._.bind(_o$Foo6))().toString();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo$self$getSelf3;\n      ((_o$Foo$self$getSelf3 = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf3 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo$self$getSelf3, _m)._.bind(_o$Foo$self$getSelf3))();\n    }).toThrow();\n    expect(() => {\n      var _o$Foo$self$getSelf4;\n      ((_o$Foo$self$getSelf4 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf4 === void 0\n        ? void 0\n        : _assertClassBrand(Foo, _o$Foo$self$getSelf4, _m)._.bind(_o$Foo$self$getSelf4))();\n    }).toThrow();\n    expect(() => {\n      var _fn$Foo$self$getSelf3;\n      return (\n        (_fn$Foo$self$getSelf3 = (fn()?.Foo?.self.getSelf)()) === null ||\n          _fn$Foo$self$getSelf3 === void 0\n          ? void 0\n          : _assertClassBrand(Foo, _fn$Foo$self$getSelf3, _m)._.bind(_fn$Foo$self$getSelf3)\n      )();\n    }).toThrow();\n    expect(() => {\n      var _fn$Foo$self$getSelf4;\n      return (\n        (_fn$Foo$self$getSelf4 = (fn?.().Foo.self?.getSelf)()) === null ||\n          _fn$Foo$self$getSelf4 === void 0\n          ? void 0\n          : _assertClassBrand(Foo, _fn$Foo$self$getSelf4, _m)._.bind(_fn$Foo$self$getSelf4)\n      )();\n    }).toThrow();\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nFoo.self = _Foo;\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nnew Foo().test();\nnew Foo().testNull();",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {\n  static getSelf() {\n    return Foo;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo$self$getSelf,\n      _o$Foo$self$getSelf2,\n      _fn$Foo$self$getSelf,\n      _fn$Foo$self$getSelf2;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))();\n    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString;\n    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString();\n    (o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.bind(_o$Foo))();\n    (o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.bind(_o$Foo2))().toString;\n    (o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)._.bind(_o$Foo3))().toString();\n    ((_o$Foo$self$getSelf = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo$self$getSelf, _m)._.bind(_o$Foo$self$getSelf))();\n    ((_o$Foo$self$getSelf2 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo$self$getSelf2, _m)._.bind(_o$Foo$self$getSelf2))();\n    ((_fn$Foo$self$getSelf = (fn()?.Foo?.self.getSelf)()) === null ||\n      _fn$Foo$self$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo$self$getSelf, _m)._.bind(_fn$Foo$self$getSelf))();\n    ((_fn$Foo$self$getSelf2 = (fn?.().Foo.self?.getSelf)()) === null ||\n      _fn$Foo$self$getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo$self$getSelf2, _m)._.bind(_fn$Foo$self$getSelf2))();\n  }\n}\n_Foo = Foo;\nvar _x = { _: 1 };\n_defineProperty(Foo, 'self', _Foo);\nvar _m = {\n  _: function () {\n    return _assertClassBrand(_Foo, this, _x)._;\n  },\n};\nnew Foo().test();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo;\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nvar _m = /* @__PURE__ */ _classPrivateFieldLooseKey('m');\nclass Foo {\n  static getSelf() {\n    return Foo;\n  }\n  test() {\n    var _o$Foo,\n      _o$Foo2,\n      _o$Foo3,\n      _o$Foo$self$getSelf,\n      _o$Foo$self$getSelf2,\n      _fn$Foo$self$getSelf,\n      _fn$Foo$self$getSelf2;\n    const o = { Foo };\n    const fn = function () {\n      return o;\n    };\n    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))();\n    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString;\n    (Foo === null || Foo === void 0 ? void 0 : _m._.bind(Foo))().toString();\n    (o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo = o.Foo), _m)._.bind(_o$Foo))();\n    (o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo2 = o.Foo), _m)._.bind(_o$Foo2))().toString;\n    (o === null || o === void 0\n      ? void 0\n      : _assertClassBrand(Foo, (_o$Foo3 = o.Foo), _m)._.bind(_o$Foo3))().toString();\n    ((_o$Foo$self$getSelf = (o.Foo?.self.getSelf)()) === null || _o$Foo$self$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo$self$getSelf, _m)._.bind(_o$Foo$self$getSelf))();\n    ((_o$Foo$self$getSelf2 = (o.Foo.self?.getSelf)()) === null || _o$Foo$self$getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _o$Foo$self$getSelf2, _m)._.bind(_o$Foo$self$getSelf2))();\n    ((_fn$Foo$self$getSelf = (fn()?.Foo?.self.getSelf)()) === null ||\n      _fn$Foo$self$getSelf === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo$self$getSelf, _m)._.bind(_fn$Foo$self$getSelf))();\n    ((_fn$Foo$self$getSelf2 = (fn?.().Foo.self?.getSelf)()) === null ||\n      _fn$Foo$self$getSelf2 === void 0\n      ? void 0\n      : _assertClassBrand(Foo, _fn$Foo$self$getSelf2, _m)._.bind(_fn$Foo$self$getSelf2))();\n  }\n}\n_Foo = Foo;\nObject.defineProperty(Foo, _x, {\n  writable: true,\n  value: 1,\n});\nFoo.self = _Foo;\nObject.defineProperty(Foo, _m, {\n  writable: true,\n  value: function () {\n    return _classPrivateFieldLooseBase(this, _x)[_x];\n  },\n});\nnew Foo().test();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _a = /* @__PURE__ */ new WeakMap();\nclass C {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _a, void 0);\n  }\n}\nvar _b = { _: void 0 };",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _a = /* @__PURE__ */ _classPrivateFieldLooseKey('a');\nvar _b = /* @__PURE__ */ _classPrivateFieldLooseKey('b');\nclass C {\n  constructor() {\n    Object.defineProperty(this, _a, {\n      writable: true,\n      value: void 0,\n    });\n  }\n}\nObject.defineProperty(C, _b, {\n  writable: true,\n  value: void 0,\n});",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _outer = /* @__PURE__ */ new WeakMap();\nclass Outer {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _outer, void 0);\n    class Test extends _classPrivateFieldGet(_outer, this) {}\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _outer = /* @__PURE__ */ _classPrivateFieldLooseKey('outer');\nclass Outer {\n  constructor() {\n    Object.defineProperty(this, _outer, {\n      writable: true,\n      value: void 0,\n    });\n    class Test extends _classPrivateFieldLooseBase(this, _outer)[_outer] {}\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nfunction classFactory() {\n  var _Foo, _foo, _bar;\n  return (\n    (_foo = /* @__PURE__ */ new WeakMap()),\n    (_Foo = class Foo {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _foo, 'foo');\n      }\n      instance() {\n        return _classPrivateFieldGet(_foo, this);\n      }\n      static() {\n        return _assertClassBrand(_Foo, Foo, _bar)._;\n      }\n      static instance(inst) {\n        return _classPrivateFieldGet(_foo, inst);\n      }\n      static static() {\n        return _assertClassBrand(_Foo, Foo, _bar)._;\n      }\n    }),\n    (_bar = { _: 'bar' }),\n    _Foo\n  );\n}\nconst Foo1 = classFactory();\nconst Foo2 = classFactory();\nconst f1 = new Foo1();\nconst f2 = new Foo2();\nexpect(f1.instance()).toBe('foo');\nexpect(f1.static()).toBe('bar');\nexpect(f2.instance()).toBe('foo');\nexpect(f2.static()).toBe('bar');\nexpect(Foo1.instance(f1)).toBe('foo');\nexpect(Foo1.static()).toBe('bar');\nexpect(Foo2.instance(f2)).toBe('foo');\nexpect(Foo2.static()).toBe('bar');\nassert.throws(() => f1.instance.call(f2));\nassert.throws(() => f2.instance.call(f1));\nassert.throws(() => Foo1.instance(f2));\nassert.throws(() => Foo2.instance(f1));",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nfunction classFactory() {\n  var _Foo, _foo, _bar;\n  return (\n    (_foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),\n    (_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),\n    (_Foo = class Foo {\n      constructor() {\n        Object.defineProperty(this, _foo, {\n          writable: true,\n          value: 'foo',\n        });\n      }\n      instance() {\n        return _classPrivateFieldLooseBase(this, _foo)[_foo];\n      }\n      static() {\n        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n      }\n      static instance(inst) {\n        return _classPrivateFieldLooseBase(inst, _foo)[_foo];\n      }\n      static static() {\n        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n      }\n    }),\n    Object.defineProperty(_Foo, _bar, {\n      writable: true,\n      value: 'bar',\n    }),\n    _Foo\n  );\n}\nconst Foo1 = classFactory();\nconst Foo2 = classFactory();\nconst f1 = new Foo1();\nconst f2 = new Foo2();\nexpect(f1.instance()).toBe('foo');\nexpect(f1.static()).toBe('bar');\nexpect(f2.instance()).toBe('foo');\nexpect(f2.static()).toBe('bar');\nexpect(Foo1.instance(f1)).toBe('foo');\nexpect(Foo1.static()).toBe('bar');\nexpect(Foo2.instance(f2)).toBe('foo');\nexpect(Foo2.static()).toBe('bar');\nassert.throws(() => f1.instance.call(f2));\nassert.throws(() => f2.instance.call(f1));\nassert.throws(() => Foo1.instance(f2));\nassert.throws(() => Foo2.instance(f1));",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _two = /* @__PURE__ */ new WeakMap();\nvar _private = /* @__PURE__ */ new WeakMap();\nvar _four = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'one', _classPrivateFieldGet(_private, this));\n    _classPrivateFieldInitSpec(this, _two, _classPrivateFieldGet(_private, this));\n    _classPrivateFieldInitSpec(this, _private, 0);\n    _defineProperty(this, 'three', _classPrivateFieldGet(_private, this));\n    _classPrivateFieldInitSpec(this, _four, _classPrivateFieldGet(_private, this));\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _two = /* @__PURE__ */ _classPrivateFieldLooseKey('two');\nvar _private = /* @__PURE__ */ _classPrivateFieldLooseKey('private');\nvar _four = /* @__PURE__ */ _classPrivateFieldLooseKey('four');\nclass Foo {\n  constructor() {\n    this.one = _classPrivateFieldLooseBase(this, _private)[_private];\n    Object.defineProperty(this, _two, {\n      writable: true,\n      value: _classPrivateFieldLooseBase(this, _private)[_private],\n    });\n    Object.defineProperty(this, _private, {\n      writable: true,\n      value: 0,\n    });\n    this.three = _classPrivateFieldLooseBase(this, _private)[_private];\n    Object.defineProperty(this, _four, {\n      writable: true,\n      value: _classPrivateFieldLooseBase(this, _private)[_private],\n    });\n  }\n}",
  "class Foo {\n  test(x) {\n    return _foo._.call(Foo, x);\n  }\n}\nvar _foo = {\n  _: function (x) {\n    return x;\n  },\n};\nconst f = new Foo();\nconst test = f.test();\nexpect(f.test('bar')).toBe('bar');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  test(x) {\n    return _classPrivateFieldLooseBase(Foo, _foo)[_foo](x);\n  }\n}\nObject.defineProperty(Foo, _foo, {\n  writable: true,\n  value: function (x) {\n    return x;\n  },\n});\nconst f = new Foo();\nconst test = f.test();\nexpect(f.test('bar')).toBe('bar');",
  'class Foo {\n  test(x) {\n    return _foo._.call(Foo, x);\n  }\n}\nvar _foo = {\n  _: function (x) {\n    return x;\n  },\n};',
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  test(x) {\n    return _classPrivateFieldLooseBase(Foo, _foo)[_foo](x);\n  }\n}\nObject.defineProperty(Foo, _foo, {\n  writable: true,\n  value: function (x) {\n    return x;\n  },\n});",
  'var _A;\nclass A {\n  static extract() {\n    return {\n      self: _self._,\n      getA: _getA._,\n    };\n  }\n}\n_A = A;\nvar _self = { _: _A };\nvar _getA = { _: () => _A };\nconst oldA = A;\nA = null;\nexpect(oldA.extract().self).toBe(oldA);\nexpect(oldA.extract().getA()).toBe(oldA);',
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _A;\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nvar _getA = /* @__PURE__ */ _classPrivateFieldLooseKey('getA');\nclass A {\n  static extract() {\n    return {\n      self: _classPrivateFieldLooseBase(A, _self)[_self],\n      getA: _classPrivateFieldLooseBase(A, _getA)[_getA],\n    };\n  }\n}\n_A = A;\nObject.defineProperty(A, _self, {\n  writable: true,\n  value: _A,\n});\nObject.defineProperty(A, _getA, {\n  writable: true,\n  value: () => _A,\n});\nconst oldA = A;\nA = null;\nexpect(oldA.extract().self).toBe(oldA);\nexpect(oldA.extract().getA()).toBe(oldA);",
  'var _A;\nclass A {}\n_A = A;\nvar _self = { _: _A };\nvar _getA = { _: () => _A };',
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _A;\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nvar _getA = /* @__PURE__ */ _classPrivateFieldLooseKey('getA');\nclass A {}\n_A = A;\nObject.defineProperty(A, _self, {\n  writable: true,\n  value: _A,\n});\nObject.defineProperty(A, _getA, {\n  writable: true,\n  value: () => _A,\n});",
  'export class MyClass {}\nvar _property = { _: value };\nexport default class MyClass2 {}\nvar _property2 = { _: value };',
  "import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';\nvar _property = /* @__PURE__ */ _classPrivateFieldLooseKey('property');\nexport class MyClass {}\nObject.defineProperty(MyClass, _property, {\n  writable: true,\n  value,\n});\nvar _property2 = /* @__PURE__ */ _classPrivateFieldLooseKey('property');\nexport default class MyClass2 {}\nObject.defineProperty(MyClass2, _property2, {\n  writable: true,\n  value,\n});",
  'var _Class, _num;\nvar Foo = ((_Class = class {}), (_num = { _: 0 }), _Class);',
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Class, _num;\nvar Foo =\n  ((_num = /* @__PURE__ */ _classPrivateFieldLooseKey('num')),\n  (_Class = class {}),\n  Object.defineProperty(_Class, _num, {\n    writable: true,\n    value: 0,\n  }),\n  _Class);",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass Base {\n  static getThis() {\n    return _assertClassBrand(Base, this, _foo)._;\n  }\n  static updateThis(val) {\n    return (_foo._ = _assertClassBrand(Base, this, val));\n  }\n  static getClass() {\n    return _foo._;\n  }\n  static updateClass(val) {\n    return (_foo._ = val);\n  }\n}\nvar _foo = { _: 1 };\nclass Sub1 extends Base {\n  static update(val) {\n    return (_foo2._ = _assertClassBrand(Sub1, this, val));\n  }\n}\nvar _foo2 = { _: 2 };\nclass Sub2 extends Base {}\nexpect(Base.getThis()).toBe(1);\nexpect(Base.getClass()).toBe(1);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(1);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(1);\nexpect(Sub1.update(3)).toBe(3);\nexpect(Base.getThis()).toBe(1);\nexpect(Base.getClass()).toBe(1);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(1);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(1);\nexpect(Base.updateThis(4)).toBe(4);\nexpect(Base.getThis()).toBe(4);\nexpect(Base.getClass()).toBe(4);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(4);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(4);\nexpect(Base.updateClass(5)).toBe(5);\nexpect(Base.getThis()).toBe(5);\nexpect(Base.getClass()).toBe(5);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(5);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(5);\nexpect(() => Sub2.updateThis(6)).toThrow();\nexpect(Sub2.updateClass(7)).toBe(7);\nexpect(Base.getThis()).toBe(7);\nexpect(Base.getClass()).toBe(7);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(7);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(7);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Base {\n  static getThis() {\n    return _classPrivateFieldLooseBase(this, _foo)[_foo];\n  }\n  static updateThis(val) {\n    return (_classPrivateFieldLooseBase(this, _foo)[_foo] = val);\n  }\n  static getClass() {\n    return _classPrivateFieldLooseBase(Base, _foo)[_foo];\n  }\n  static updateClass(val) {\n    return (_classPrivateFieldLooseBase(Base, _foo)[_foo] = val);\n  }\n}\nObject.defineProperty(Base, _foo, {\n  writable: true,\n  value: 1,\n});\nvar _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Sub1 extends Base {\n  static update(val) {\n    return (_classPrivateFieldLooseBase(this, _foo2)[_foo2] = val);\n  }\n}\nObject.defineProperty(Sub1, _foo2, {\n  writable: true,\n  value: 2,\n});\nclass Sub2 extends Base {}\nexpect(Base.getThis()).toBe(1);\nexpect(Base.getClass()).toBe(1);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(1);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(1);\nexpect(Sub1.update(3)).toBe(3);\nexpect(Base.getThis()).toBe(1);\nexpect(Base.getClass()).toBe(1);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(1);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(1);\nexpect(Base.updateThis(4)).toBe(4);\nexpect(Base.getThis()).toBe(4);\nexpect(Base.getClass()).toBe(4);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(4);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(4);\nexpect(Base.updateClass(5)).toBe(5);\nexpect(Base.getThis()).toBe(5);\nexpect(Base.getClass()).toBe(5);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(5);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(5);\nexpect(() => Sub2.updateThis(6)).toThrow();\nexpect(Sub2.updateClass(7)).toBe(7);\nexpect(Base.getThis()).toBe(7);\nexpect(Base.getClass()).toBe(7);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(7);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(7);",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass Base {\n  static getThis() {\n    return _assertClassBrand(Base, this, _foo)._;\n  }\n  static updateThis(val) {\n    return (_foo._ = _assertClassBrand(Base, this, val));\n  }\n  static getClass() {\n    return _foo._;\n  }\n  static updateClass(val) {\n    return (_foo._ = val);\n  }\n}\nvar _foo = { _: 1 };\nclass Sub1 extends Base {\n  static update(val) {\n    return (_foo2._ = _assertClassBrand(Sub1, this, val));\n  }\n}\nvar _foo2 = { _: 2 };\nclass Sub2 extends Base {}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Base {\n  static getThis() {\n    return _classPrivateFieldLooseBase(this, _foo)[_foo];\n  }\n  static updateThis(val) {\n    return (_classPrivateFieldLooseBase(this, _foo)[_foo] = val);\n  }\n  static getClass() {\n    return _classPrivateFieldLooseBase(Base, _foo)[_foo];\n  }\n  static updateClass(val) {\n    return (_classPrivateFieldLooseBase(Base, _foo)[_foo] = val);\n  }\n}\nObject.defineProperty(Base, _foo, {\n  writable: true,\n  value: 1,\n});\nvar _foo2 = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Sub1 extends Base {\n  static update(val) {\n    return (_classPrivateFieldLooseBase(this, _foo2)[_foo2] = val);\n  }\n}\nObject.defineProperty(Sub1, _foo2, {\n  writable: true,\n  value: 2,\n});\nclass Sub2 extends Base {}",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass Test {\n  static method() {\n    const Test = 2;\n    const func = () => {\n      const Test = 3;\n      return _assertClassBrand(Test, this, _x)._ + Test;\n    };\n    return func() + Test;\n  }\n}\nvar _x = { _: 1 };\nexpect(Test.method()).toBe(6);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nclass Test {\n  static method() {\n    const Test = 2;\n    const func = () => {\n      const Test = 3;\n      return _classPrivateFieldLooseBase(this, _x)[_x] + Test;\n    };\n    return func() + Test;\n  }\n}\nObject.defineProperty(Test, _x, {\n  writable: true,\n  value: 1,\n});\nexpect(Test.method()).toBe(6);",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass Test {\n  static method() {\n    const Test = 2;\n    const func = () => {\n      const Test = 3;\n      return _assertClassBrand(Test, this, _x)._ + Test;\n    };\n    return func() + Test;\n  }\n}\nvar _x = { _: 1 };",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _x = /* @__PURE__ */ _classPrivateFieldLooseKey('x');\nclass Test {\n  static method() {\n    const Test = 2;\n    const func = () => {\n      const Test = 3;\n      return _classPrivateFieldLooseBase(this, _x)[_x] + Test;\n    };\n    return func() + Test;\n  }\n}\nObject.defineProperty(Test, _x, {\n  writable: true,\n  value: 1,\n});",
  'var _A;\nclass A {\n  static extract() {\n    return {\n      self: _self._,\n      getA: _getA._,\n    };\n  }\n}\n_A = A;\nvar _self = { _: _A };\nvar _getA = { _: () => _A };\nconst { self, getA } = A.extract();\nexpect(self).toBe(A);\nexpect(getA()).toBe(A);\nconst oldA = A;\nA = null;\nexpect(oldA.extract().self).toBe(oldA);\nexpect(oldA.extract().getA()).toBe(oldA);',
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _A;\nvar _self = /* @__PURE__ */ _classPrivateFieldLooseKey('self');\nvar _getA = /* @__PURE__ */ _classPrivateFieldLooseKey('getA');\nclass A {\n  static extract() {\n    return {\n      self: _classPrivateFieldLooseBase(A, _self)[_self],\n      getA: _classPrivateFieldLooseBase(A, _getA)[_getA],\n    };\n  }\n}\n_A = A;\nObject.defineProperty(A, _self, {\n  writable: true,\n  value: _A,\n});\nObject.defineProperty(A, _getA, {\n  writable: true,\n  value: () => _A,\n});\nconst { self, getA } = A.extract();\nexpect(self).toBe(A);\nexpect(getA()).toBe(A);\nconst oldA = A;\nA = null;\nexpect(oldA.extract().self).toBe(oldA);\nexpect(oldA.extract().getA()).toBe(oldA);",
  "class Foo {\n  static test() {\n    return _bar._;\n  }\n  test() {\n    return _bar._;\n  }\n}\nvar _bar = { _: void 0 };\nexpect('bar' in Foo).toBe(false);\nexpect(Foo.test()).toBe(undefined);\nexpect(Foo.test()).toBe(undefined);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  static test() {\n    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n  }\n  test() {\n    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n  }\n}\nObject.defineProperty(Foo, _bar, {\n  writable: true,\n  value: void 0,\n});\nexpect('bar' in Foo).toBe(false);\nexpect(Foo.test()).toBe(undefined);\nexpect(Foo.test()).toBe(undefined);",
  'class Foo {\n  static test() {\n    return _bar._;\n  }\n  test() {\n    return _bar._;\n  }\n}\nvar _bar = { _: void 0 };',
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  static test() {\n    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n  }\n  test() {\n    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n  }\n}\nObject.defineProperty(Foo, _bar, {\n  writable: true,\n  value: void 0,\n});",
  "class Foo {\n  static test() {\n    return _bar._;\n  }\n  test() {\n    return _bar._;\n  }\n}\nvar _bar = { _: 'foo' };\nexpect('bar' in Foo).toBe(false);\nexpect(Foo.test()).toBe('foo');\nexpect(Foo.test()).toBe('foo');",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  static test() {\n    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n  }\n  test() {\n    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n  }\n}\nObject.defineProperty(Foo, _bar, {\n  writable: true,\n  value: 'foo',\n});\nexpect('bar' in Foo).toBe(false);\nexpect(Foo.test()).toBe('foo');\nexpect(Foo.test()).toBe('foo');",
  "class Foo {\n  static test() {\n    return _bar._;\n  }\n  test() {\n    return _bar._;\n  }\n}\nvar _bar = { _: 'foo' };",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  static test() {\n    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n  }\n  test() {\n    return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n  }\n}\nObject.defineProperty(Foo, _bar, {\n  writable: true,\n  value: 'foo',\n});",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo extends Bar {\n  constructor() {\n    var _super = (..._args) => (\n      super(..._args),\n      _classPrivateFieldInitSpec(this, _bar, 'foo'),\n      this\n    );\n    foo(_super());\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo extends Bar {\n  constructor() {\n    var _super = (..._args) => (\n      super(..._args),\n      Object.defineProperty(this, _bar, {\n        writable: true,\n        value: 'foo',\n      }),\n      this\n    );\n    foo(_super());\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo extends Bar {\n  constructor() {\n    super();\n    _classPrivateFieldInitSpec(this, _bar, 'foo');\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo extends Bar {\n  constructor() {\n    super();\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 'foo',\n    });\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 0);\n  }\n  test(other) {\n    var _this$foo,\n      _this$foo2,\n      _this$foo3,\n      _other$obj,\n      _other$obj$foo,\n      _other$obj$foo2,\n      _other$obj2,\n      _other$obj$foo3;\n    return [\n      (_classPrivateFieldSet(\n        _foo,\n        this,\n        ((_this$foo = _classPrivateFieldGet(_foo, this)), (_this$foo2 = _this$foo++), _this$foo),\n      ),\n      _this$foo2),\n      _classPrivateFieldGet(_foo, this),\n      _classPrivateFieldSet(\n        _foo,\n        this,\n        ((_this$foo3 = _classPrivateFieldGet(_foo, this)), ++_this$foo3),\n      ),\n      _classPrivateFieldGet(_foo, this),\n      (_classPrivateFieldSet(\n        _foo,\n        (_other$obj = other.obj),\n        ((_other$obj$foo = _classPrivateFieldGet(_foo, _other$obj)),\n        (_other$obj$foo2 = _other$obj$foo++),\n        _other$obj$foo),\n      ),\n      _other$obj$foo2),\n      _classPrivateFieldGet(_foo, other.obj),\n      _classPrivateFieldSet(\n        _foo,\n        (_other$obj2 = other.obj),\n        ((_other$obj$foo3 = _classPrivateFieldGet(_foo, _other$obj2)), ++_other$obj$foo3),\n      ),\n      _classPrivateFieldGet(_foo, other.obj),\n    ];\n  }\n}\nconst f = new Foo();\nconst results = f.test({ obj: f });\nexpect(results[0]).toBe(0);\nexpect(results[1]).toBe(1);\nexpect(results[2]).toBe(2);\nexpect(results[3]).toBe(2);\nexpect(results[4]).toBe(2);\nexpect(results[5]).toBe(3);\nexpect(results[6]).toBe(4);\nexpect(results[7]).toBe(4);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 0,\n    });\n  }\n  test(other) {\n    return [\n      _classPrivateFieldLooseBase(this, _foo)[_foo]++,\n      _classPrivateFieldLooseBase(this, _foo)[_foo],\n      ++_classPrivateFieldLooseBase(this, _foo)[_foo],\n      _classPrivateFieldLooseBase(this, _foo)[_foo],\n      _classPrivateFieldLooseBase(other.obj, _foo)[_foo]++,\n      _classPrivateFieldLooseBase(other.obj, _foo)[_foo],\n      ++_classPrivateFieldLooseBase(other.obj, _foo)[_foo],\n      _classPrivateFieldLooseBase(other.obj, _foo)[_foo],\n    ];\n  }\n}\nconst f = new Foo();\nconst results = f.test({ obj: f });\nexpect(results[0]).toBe(0);\nexpect(results[1]).toBe(1);\nexpect(results[2]).toBe(2);\nexpect(results[3]).toBe(2);\nexpect(results[4]).toBe(2);\nexpect(results[5]).toBe(3);\nexpect(results[6]).toBe(4);\nexpect(results[7]).toBe(4);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _foo, 0);\n  }\n  test(other) {\n    var _this$foo,\n      _this$foo2,\n      _this$foo3,\n      _other$obj,\n      _other$obj$foo,\n      _other$obj$foo2,\n      _other$obj2,\n      _other$obj$foo3;\n    (_classPrivateFieldSet(\n      _foo,\n      this,\n      ((_this$foo = _classPrivateFieldGet(_foo, this)), (_this$foo2 = _this$foo++), _this$foo),\n    ),\n      _this$foo2);\n    _classPrivateFieldSet(\n      _foo,\n      this,\n      ((_this$foo3 = _classPrivateFieldGet(_foo, this)), ++_this$foo3),\n    );\n    (_classPrivateFieldSet(\n      _foo,\n      (_other$obj = other.obj),\n      ((_other$obj$foo = _classPrivateFieldGet(_foo, _other$obj)),\n      (_other$obj$foo2 = _other$obj$foo++),\n      _other$obj$foo),\n    ),\n      _other$obj$foo2);\n    _classPrivateFieldSet(\n      _foo,\n      (_other$obj2 = other.obj),\n      ((_other$obj$foo3 = _classPrivateFieldGet(_foo, _other$obj2)), ++_other$obj$foo3),\n    );\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 0,\n    });\n  }\n  test(other) {\n    _classPrivateFieldLooseBase(this, _foo)[_foo]++;\n    ++_classPrivateFieldLooseBase(this, _foo)[_foo];\n    _classPrivateFieldLooseBase(other.obj, _foo)[_foo]++;\n    ++_classPrivateFieldLooseBase(other.obj, _foo)[_foo];\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _arr = /* @__PURE__ */ new WeakMap();\nclass D {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _arr, void 0);\n  }\n  f() {\n    for (const el of _classPrivateFieldGet(_arr, this));\n  }\n}\nvar _p = /* @__PURE__ */ new WeakMap();\nclass C {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _p, void 0);\n  }\n  m() {\n    for (_toSetter(_classPrivateFieldSet, [_p, this])._ of []);\n  }\n}\nvar _arr2 = /* @__PURE__ */ new WeakMap();\nclass E {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _arr2, void 0);\n  }\n  f() {\n    for (_toSetter(_classPrivateFieldSet, [_arr2, this])._ of [1, 2]);\n  }\n}\nvar _ar = /* @__PURE__ */ new WeakMap();\nclass F {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _ar, void 0);\n  }\n  g() {\n    for (_toSetter(_classPrivateFieldSet, [_ar, this])._ in [1, 2, 3]);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _arr = /* @__PURE__ */ _classPrivateFieldLooseKey('arr');\nclass D {\n  constructor() {\n    Object.defineProperty(this, _arr, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  f() {\n    for (const el of _classPrivateFieldLooseBase(this, _arr)[_arr]);\n  }\n}\nvar _p = /* @__PURE__ */ _classPrivateFieldLooseKey('p');\nclass C {\n  constructor() {\n    Object.defineProperty(this, _p, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  m() {\n    for (_classPrivateFieldLooseBase(this, _p)[_p] of []);\n  }\n}\nvar _arr2 = /* @__PURE__ */ _classPrivateFieldLooseKey('arr');\nclass E {\n  constructor() {\n    Object.defineProperty(this, _arr2, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  f() {\n    for (_classPrivateFieldLooseBase(this, _arr2)[_arr2] of [1, 2]);\n  }\n}\nvar _ar = /* @__PURE__ */ _classPrivateFieldLooseKey('ar');\nclass F {\n  constructor() {\n    Object.defineProperty(this, _ar, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  g() {\n    for (_classPrivateFieldLooseBase(this, _ar)[_ar] in [1, 2, 3]);\n  }\n}",
  'expect(() => {\n  var _C;\n  class C {\n    constructor() {\n      _p._;\n    }\n  }\n  _C = C;\n  var _ = { _: new _C() };\n  var _p = { _: void 0 };\n}).toThrow(TypeError);\nexpect(() => {\n  var _C2;\n  class C {\n    constructor() {\n      _p2._ = 0;\n    }\n  }\n  _C2 = C;\n  var _2 = { _: new _C2() };\n  var _p2 = { _: void 0 };\n}).toThrow(TypeError);\nexpect(() => {\n  var _C3;\n  class C {\n    constructor() {\n      for (_p3._ of [0]);\n    }\n  }\n  _C3 = C;\n  var _3 = { _: new _C3() };\n  var _p3 = { _: void 0 };\n}).toThrow(TypeError);',
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nexpect(() => {\n  var _C;\n  var _ = /* @__PURE__ */ _classPrivateFieldLooseKey('_');\n  var _p = /* @__PURE__ */ _classPrivateFieldLooseKey('p');\n  class C {\n    constructor() {\n      _classPrivateFieldLooseBase(C, _p)[_p];\n    }\n  }\n  _C = C;\n  Object.defineProperty(C, _, {\n    writable: true,\n    value: new _C(),\n  });\n  Object.defineProperty(C, _p, {\n    writable: true,\n    value: void 0,\n  });\n}).toThrow(TypeError);\nexpect(() => {\n  var _C2;\n  var _2 = /* @__PURE__ */ _classPrivateFieldLooseKey('_');\n  var _p2 = /* @__PURE__ */ _classPrivateFieldLooseKey('p');\n  class C {\n    constructor() {\n      _classPrivateFieldLooseBase(C, _p2)[_p2] = 0;\n    }\n  }\n  _C2 = C;\n  Object.defineProperty(C, _2, {\n    writable: true,\n    value: new _C2(),\n  });\n  Object.defineProperty(C, _p2, {\n    writable: true,\n    value: void 0,\n  });\n}).toThrow(TypeError);\nexpect(() => {\n  var _C3;\n  var _3 = /* @__PURE__ */ _classPrivateFieldLooseKey('_');\n  var _p3 = /* @__PURE__ */ _classPrivateFieldLooseKey('p');\n  class C {\n    constructor() {\n      for (_classPrivateFieldLooseBase(C, _p3)[_p3] of [0]);\n    }\n  }\n  _C3 = C;\n  Object.defineProperty(C, _3, {\n    writable: true,\n    value: new _C3(),\n  });\n  Object.defineProperty(C, _p3, {\n    writable: true,\n    value: void 0,\n  });\n}).toThrow(TypeError);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    ({ x: _toSetter(_classPrivateFieldSet, [_client, this])._ = 5 } = props);\n  }\n  getClient() {\n    return _classPrivateFieldGet(_client, this);\n  }\n}\nconst foo = new Foo({});\nexpect(foo.getClient()).toEqual(5);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    ({ x: _classPrivateFieldLooseBase(this, _client)[_client] = 5 } = props);\n  }\n  getClient() {\n    return _classPrivateFieldLooseBase(this, _client)[_client];\n  }\n}\nconst foo = new Foo({});\nexpect(foo.getClient()).toEqual(5);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _toSetter = require('@babel/runtime/helpers/toSetter');\nvar _client = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor(props) {\n    _classPrivateFieldInitSpec(this, _client, void 0);\n    ({ x: _toSetter(_classPrivateFieldSet, [_client, this])._ = 5 } = props);\n  }\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _client = /* @__PURE__ */ _classPrivateFieldLooseKey('client');\nclass Foo {\n  constructor(props) {\n    Object.defineProperty(this, _client, {\n      writable: true,\n      value: void 0,\n    });\n    ({ x: _classPrivateFieldLooseBase(this, _client)[_client] = 5 } = props);\n  }\n}",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet2');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, 'foo');\n  }\n  test() {\n    return _classPrivateFieldGet(_bar, this);\n  }\n  update() {\n    var _this$bar, _this$bar2;\n    (_classPrivateFieldSet(\n      _bar,\n      this,\n      ((_this$bar = _classPrivateFieldGet(_bar, this)), (_this$bar2 = _this$bar++), _this$bar),\n    ),\n      _this$bar2);\n  }\n  set(val) {\n    _classPrivateFieldSet(_bar, this, val);\n  }\n  static test(foo) {\n    return _classPrivateFieldGet(_bar, foo);\n  }\n  static update(foo) {\n    _classPrivateFieldSet(_bar, foo, _classPrivateFieldGet(_bar, foo) ** 2);\n  }\n}\nconst f = new Foo();\nexpect(f.test()).toBe('foo');\nexpect(Foo.test(f)).toBe('foo');\nexpect('bar' in f).toBe(false);\nf.set(1);\nexpect(f.test()).toBe(1);\nf.update();\nexpect(Foo.test(f)).toBe(2);\nFoo.update(f);\nexpect(f.test()).toBe(4);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 'foo',\n    });\n  }\n  test() {\n    return _classPrivateFieldLooseBase(this, _bar)[_bar];\n  }\n  update() {\n    _classPrivateFieldLooseBase(this, _bar)[_bar]++;\n  }\n  set(val) {\n    _classPrivateFieldLooseBase(this, _bar)[_bar] = val;\n  }\n  static test(foo) {\n    return _classPrivateFieldLooseBase(foo, _bar)[_bar];\n  }\n  static update(foo) {\n    _classPrivateFieldLooseBase(foo, _bar)[_bar] **= 2;\n  }\n}\nconst f = new Foo();\nexpect(f.test()).toBe('foo');\nexpect(Foo.test(f)).toBe('foo');\nexpect('bar' in f).toBe(false);\nf.set(1);\nexpect(f.test()).toBe(1);\nf.update();\nexpect(Foo.test(f)).toBe(2);\nFoo.update(f);\nexpect(f.test()).toBe(4);",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _bar = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _bar, 'bar');\n  }\n  static test() {\n    return _foo._;\n  }\n  test() {\n    return _classPrivateFieldGet(_bar, this);\n  }\n}\nvar _foo = { _: 'foo' };",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nvar _bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 'bar',\n    });\n  }\n  static test() {\n    return _classPrivateFieldLooseBase(Foo, _foo)[_foo];\n  }\n  test() {\n    return _classPrivateFieldLooseBase(this, _bar)[_bar];\n  }\n}\nObject.defineProperty(Foo, _foo, {\n  writable: true,\n  value: 'foo',\n});",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nfunction classFactory() {\n  var _Foo, _foo, _bar;\n  return (\n    (_foo = /* @__PURE__ */ new WeakMap()),\n    (_Foo = class Foo {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _foo, 'foo');\n      }\n      instance() {\n        return _classPrivateFieldGet(_foo, this);\n      }\n      static() {\n        return _assertClassBrand(_Foo, Foo, _bar)._;\n      }\n      static instance(inst) {\n        return _classPrivateFieldGet(_foo, inst);\n      }\n      static static() {\n        return _assertClassBrand(_Foo, Foo, _bar)._;\n      }\n    }),\n    (_bar = { _: 'bar' }),\n    _Foo\n  );\n}\nconst Foo1 = classFactory();\nconst Foo2 = classFactory();\nconst f1 = new Foo1();\nconst f2 = new Foo2();\nexpect(f1.instance()).toBe('foo');\nexpect(f1.static()).toBe('bar');\nexpect(f2.instance()).toBe('foo');\nexpect(f2.static()).toBe('bar');\nexpect(Foo1.instance(f1)).toBe('foo');\nexpect(Foo1.static()).toBe('bar');\nexpect(Foo2.instance(f2)).toBe('foo');\nexpect(Foo2.static()).toBe('bar');\nexpect(() => {\n  (f1.instance.call(f2), undefined);\n}).toThrow();\nexpect(() => {\n  (f2.instance.call(f1), undefined);\n}).toThrow();\nexpect(() => {\n  (Foo1.instance(f2), undefined);\n}).toThrow();\nexpect(() => {\n  (Foo2.instance(f1), undefined);\n}).toThrow();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nfunction classFactory() {\n  var _Foo, _foo, _bar;\n  return (\n    (_foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),\n    (_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),\n    (_Foo = class Foo {\n      constructor() {\n        Object.defineProperty(this, _foo, {\n          writable: true,\n          value: 'foo',\n        });\n      }\n      instance() {\n        return _classPrivateFieldLooseBase(this, _foo)[_foo];\n      }\n      static() {\n        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n      }\n      static instance(inst) {\n        return _classPrivateFieldLooseBase(inst, _foo)[_foo];\n      }\n      static static() {\n        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n      }\n    }),\n    Object.defineProperty(_Foo, _bar, {\n      writable: true,\n      value: 'bar',\n    }),\n    _Foo\n  );\n}\nconst Foo1 = classFactory();\nconst Foo2 = classFactory();\nconst f1 = new Foo1();\nconst f2 = new Foo2();\nexpect(f1.instance()).toBe('foo');\nexpect(f1.static()).toBe('bar');\nexpect(f2.instance()).toBe('foo');\nexpect(f2.static()).toBe('bar');\nexpect(Foo1.instance(f1)).toBe('foo');\nexpect(Foo1.static()).toBe('bar');\nexpect(Foo2.instance(f2)).toBe('foo');\nexpect(Foo2.static()).toBe('bar');\nexpect(() => {\n  (f1.instance.call(f2), undefined);\n}).toThrow();\nexpect(() => {\n  (f2.instance.call(f1), undefined);\n}).toThrow();\nexpect(() => {\n  (Foo1.instance(f2), undefined);\n}).toThrow();\nexpect(() => {\n  (Foo2.instance(f1), undefined);\n}).toThrow();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nfunction classFactory() {\n  var _Foo, _foo, _bar;\n  return (\n    (_foo = /* @__PURE__ */ new WeakMap()),\n    (_Foo = class Foo {\n      constructor() {\n        _classPrivateFieldInitSpec(this, _foo, 'foo');\n      }\n      instance() {\n        return _classPrivateFieldGet(_foo, this);\n      }\n      static() {\n        return _assertClassBrand(_Foo, Foo, _bar)._;\n      }\n      static instance(inst) {\n        return _classPrivateFieldGet(_foo, inst);\n      }\n      static static() {\n        return _assertClassBrand(_Foo, Foo, _bar)._;\n      }\n    }),\n    (_bar = { _: 'bar' }),\n    _Foo\n  );\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nfunction classFactory() {\n  var _Foo, _foo, _bar;\n  return (\n    (_foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo')),\n    (_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),\n    (_Foo = class Foo {\n      constructor() {\n        Object.defineProperty(this, _foo, {\n          writable: true,\n          value: 'foo',\n        });\n      }\n      instance() {\n        return _classPrivateFieldLooseBase(this, _foo)[_foo];\n      }\n      static() {\n        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n      }\n      static instance(inst) {\n        return _classPrivateFieldLooseBase(inst, _foo)[_foo];\n      }\n      static static() {\n        return _classPrivateFieldLooseBase(Foo, _bar)[_bar];\n      }\n    }),\n    Object.defineProperty(_Foo, _bar, {\n      writable: true,\n      value: 'bar',\n    }),\n    _Foo\n  );\n}",
  'var _Class, _test;\ncall(((_Class = class {}), (_test = { _: true }), _Class));\nexport default class _Class2 {}\nvar _test2 = { _: true };',
  "import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';\nvar _Class, _test;\ncall(\n  ((_test = /* @__PURE__ */ _classPrivateFieldLooseKey('test')),\n  (_Class = class {}),\n  Object.defineProperty(_Class, _test, {\n    writable: true,\n    value: true,\n  }),\n  _Class),\n);\nvar _test2 = /* @__PURE__ */ _classPrivateFieldLooseKey('test');\nexport default class _Class2 {}\nObject.defineProperty(_Class2, _test2, {\n  writable: true,\n  value: true,\n});",
  'function withContext(ComposedComponent) {\n  var _WithContext, _propTypes;\n  return (\n    (_WithContext = class WithContext extends Component {}),\n    (_propTypes = {\n      _: {\n        context: PropTypes.shape({\n          addCss: PropTypes.func,\n          setTitle: PropTypes.func,\n          setMeta: PropTypes.func,\n        }),\n      },\n    }),\n    _WithContext\n  );\n}',
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nfunction withContext(ComposedComponent) {\n  var _WithContext, _propTypes;\n  return (\n    (_propTypes = /* @__PURE__ */ _classPrivateFieldLooseKey('propTypes')),\n    (_WithContext = class WithContext extends Component {}),\n    Object.defineProperty(_WithContext, _propTypes, {\n      writable: true,\n      value: {\n        context: PropTypes.shape({\n          addCss: PropTypes.func,\n          setTitle: PropTypes.func,\n          setMeta: PropTypes.func,\n        }),\n      },\n    }),\n    _WithContext\n  );\n}",
  "import _classPrivateFieldInitSpec from '@babel/runtime/helpers/classPrivateFieldInitSpec';\nvar _myAsyncMethod2;\nvar _myAsyncMethod = /* @__PURE__ */ new WeakMap();\nclass MyClass {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _myAsyncMethod, async () => {\n      console.log(this);\n    });\n  }\n}\n((_myAsyncMethod2 = /* @__PURE__ */ new WeakMap()),\n  class MyClass2 {\n    constructor() {\n      _classPrivateFieldInitSpec(this, _myAsyncMethod2, async () => {\n        console.log(this);\n      });\n    }\n  });\nvar _myAsyncMethod3 = /* @__PURE__ */ new WeakMap();\nexport default class MyClass3 {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _myAsyncMethod3, async () => {\n      console.log(this);\n    });\n  }\n}",
  "import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';\nvar _myAsyncMethod2;\nvar _myAsyncMethod = /* @__PURE__ */ _classPrivateFieldLooseKey('myAsyncMethod');\nclass MyClass {\n  constructor() {\n    Object.defineProperty(this, _myAsyncMethod, {\n      writable: true,\n      value: async () => {\n        console.log(this);\n      },\n    });\n  }\n}\n((_myAsyncMethod2 = /* @__PURE__ */ _classPrivateFieldLooseKey('myAsyncMethod')),\n  class MyClass2 {\n    constructor() {\n      Object.defineProperty(this, _myAsyncMethod2, {\n        writable: true,\n        value: async () => {\n          console.log(this);\n        },\n      });\n    }\n  });\nvar _myAsyncMethod3 = /* @__PURE__ */ _classPrivateFieldLooseKey('myAsyncMethod');\nexport default class MyClass3 {\n  constructor() {\n    Object.defineProperty(this, _myAsyncMethod3, {\n      writable: true,\n      value: async () => {\n        console.log(this);\n      },\n    });\n  }\n}",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo, _x;\nconst f =\n  ((_Foo = class Foo {\n    static extract() {\n      return {\n        x: _assertClassBrand(_Foo, Foo, _x)._,\n        y: Foo.y,\n      };\n    }\n  }),\n  (_x = { _: _Foo }),\n  _defineProperty(_Foo, 'y', _Foo),\n  _Foo);\nconst { x, y } = f.extract();\nexpect(x).toBe(f);\nexpect(y).toBe(f);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo, _x;\nconst f =\n  ((_x = /* @__PURE__ */ _classPrivateFieldLooseKey('x')),\n  (_Foo = class Foo {\n    static extract() {\n      return {\n        x: _classPrivateFieldLooseBase(Foo, _x)[_x],\n        y: Foo.y,\n      };\n    }\n  }),\n  Object.defineProperty(_Foo, _x, {\n    writable: true,\n    value: _Foo,\n  }),\n  (_Foo.y = _Foo),\n  _Foo);\nconst { x, y } = f.extract();\nexpect(x).toBe(f);\nexpect(y).toBe(f);",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo, _x;\nconst f = ((_Foo = class Foo {}), (_x = { _: _Foo }), _defineProperty(_Foo, 'y', _Foo), _Foo);",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _Foo, _x;\nconst f =\n  ((_x = /* @__PURE__ */ _classPrivateFieldLooseKey('x')),\n  (_Foo = class Foo {}),\n  Object.defineProperty(_Foo, _x, {\n    writable: true,\n    value: _Foo,\n  }),\n  (_Foo.y = _Foo),\n  _Foo);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nconst f = (() => {\n  'use strict';\n  var _method_shadowed = '__private_Foo_method_shadowed';\n  var _method = '__private_Foo_method';\n  var _bar = '__private_Foo_bar';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'extract', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return {\n          bar: _classPrivateFieldLooseBase(Foo, _bar)[_bar],\n          method: _classPrivateFieldLooseBase(Foo, _method)[_method],\n          method_shadowed: _classPrivateFieldLooseBase(Foo, _method_shadowed)[_method_shadowed],\n        };\n      },\n      'name',\n      {\n        value: 'extract',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _bar, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return Foo;\n    },\n  });\n  Object.defineProperty(Foo, _method, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return function inner() {\n        return Foo;\n      };\n    },\n  });\n  Object.defineProperty(Foo, _method_shadowed, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      new Foo();\n      return function inner() {\n        let Foo = 3;\n        return Foo;\n      };\n    },\n  });\n  return Foo;\n})();\nconst { bar, method, method_shadowed } = f.extract();\nexpect(bar()).toBe(f);\nexpect(method()()).toBe(f);\nexpect(method_shadowed()()).toBe(3);",
  "const f = (() => {\n  'use strict';\n  var _method_shadowed = '__private_Foo_method_shadowed';\n  var _method = '__private_Foo_method';\n  var _bar = '__private_Foo_bar';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _bar, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return Foo;\n    },\n  });\n  Object.defineProperty(Foo, _method, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return function inner() {\n        return Foo;\n      };\n    },\n  });\n  Object.defineProperty(Foo, _method_shadowed, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      new Foo();\n      return function inner() {\n        let Foo = 3;\n        return Foo;\n      };\n    },\n  });\n  return Foo;\n})();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nclass A {\n  foo() {\n    return 'bar';\n  }\n}\nvar _foo = /* @__PURE__ */ new WeakMap();\nclass B extends A {\n  constructor(..._args) {\n    super(..._args);\n    _classPrivateFieldInitSpec(this, _foo, super.foo());\n  }\n}",
  "var _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nclass A {\n  foo() {\n    return 'bar';\n  }\n}\nvar _foo = /* @__PURE__ */ _classPrivateFieldLooseKey('foo');\nclass B extends A {\n  constructor(..._args) {\n    super(..._args);\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: super.foo(),\n    });\n  }\n}",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass Foo {\n  static getReceiver() {\n    return _assertClassBrand(Foo, this, _tag)._.bind(this)``;\n  }\n}\nvar _tag = {\n  _: function () {\n    return this;\n  },\n};\nexpect(Foo.getReceiver()).toBe(Foo);",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _tag = /* @__PURE__ */ _classPrivateFieldLooseKey('tag');\nclass Foo {\n  static getReceiver() {\n    return _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n  }\n}\nObject.defineProperty(Foo, _tag, {\n  writable: true,\n  value: function () {\n    return this;\n  },\n});\nexpect(Foo.getReceiver()).toBe(Foo);",
  "var _assertClassBrand = require('@babel/runtime/helpers/assertClassBrand');\nclass Foo {\n  static getReceiver() {\n    return _assertClassBrand(Foo, this, _tag)._.bind(this)``;\n  }\n}\nvar _tag = {\n  _: function () {\n    return this;\n  },\n};",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _tag = /* @__PURE__ */ _classPrivateFieldLooseKey('tag');\nclass Foo {\n  static getReceiver() {\n    return _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n  }\n}\nObject.defineProperty(Foo, _tag, {\n  writable: true,\n  value: function () {\n    return this;\n  },\n});",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _tag = '__private_Foo_tag';\n  var _tag2 = '__private_Foo_tag2';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _tag2, {\n      writable: true,\n      value: function () {\n        return this;\n      },\n    });\n    Object.defineProperty(this, _tag, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this;\n      },\n    });\n    const receiver = _classPrivateFieldLooseBase(this, _tag)[_tag]`tagged template`;\n    expect(receiver).toBe(this);\n    const receiver2 = _classPrivateFieldLooseBase(this, _tag2)[_tag2]`tagged template`;\n    expect(receiver2).toBe(this);\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nnew Foo();",
  "var _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nvar _tag = /* @__PURE__ */ new WeakMap();\nclass Foo {\n  constructor() {\n    _classPrivateFieldInitSpec(this, _tag, void 0);\n  }\n  test() {\n    _classPrivateFieldGet(_tag, this).bind(this)``;\n  }\n}\nnew Foo();",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nvar _tag = /* @__PURE__ */ _classPrivateFieldLooseKey('tag');\nclass Foo {\n  constructor() {\n    Object.defineProperty(this, _tag, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  test() {\n    _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n  }\n}\nnew Foo();",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Foo;\nclass Foo {}\n_Foo = Foo;\n_defineProperty(Foo, 'fn', () => console.log(_Foo));",
  'var _Foo;\nclass Foo {}\n_Foo = Foo;\nFoo.fn = () => console.log(_Foo);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'fn', () => console.log(this));\n  }\n}",
  'class Foo {\n  constructor() {\n    this.fn = () => console.log(this);\n  }\n}',
  "import _defineProperty from '@babel/runtime/helpers/defineProperty';\nexport class TypeError {\n  constructor() {\n    _defineProperty(this, 'message', void 0);\n  }\n}",
  'export class TypeError {\n  constructor() {\n    this.message = void 0;\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'foo', 0);\n  }\n  test(other) {\n    this.foo++;\n    this.foo += 1;\n    this.foo = 2;\n    other.obj.foo++;\n    other.obj.foo += 1;\n    other.obj.foo = 2;\n  }\n}",
  'class Foo {\n  constructor() {\n    this.foo = 0;\n  }\n  test(other) {\n    this.foo++;\n    this.foo += 1;\n    this.foo = 2;\n    other.obj.foo++;\n    other.obj.foo += 1;\n    other.obj.foo = 2;\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'foo', function () {\n      return this;\n    });\n  }\n  test(other) {\n    return [this.foo(), other.foo()];\n  }\n}\nconst f = new Foo();\nconst o = new Foo();\nconst test = f.test(o);\nexpect(test[0]).toBe(f);\nexpect(test[1]).toBe(o);",
  'class Foo {\n  constructor() {\n    this.foo = function () {\n      return this;\n    };\n  }\n  test(other) {\n    return [this.foo(), other.foo()];\n  }\n}\nconst f = new Foo();\nconst o = new Foo();\nconst test = f.test(o);\nexpect(test[0]).toBe(f);\nexpect(test[1]).toBe(o);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'foo', function () {\n      return this;\n    });\n  }\n  test(other) {\n    this.foo();\n    other.obj.foo();\n  }\n}",
  'class Foo {\n  constructor() {\n    this.foo = function () {\n      return this;\n    };\n  }\n  test(other) {\n    this.foo();\n    other.obj.foo();\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _Class;\nconst foo = { [Symbol.toPrimitive]: () => 'foo' };\nexpect(((_Class = class {}), _defineProperty(_Class, foo, 0), _Class).foo).toBe(0);\nexpect(\n  class {\n    static [foo]() {\n      return 0;\n    }\n  }.foo(),\n).toBe(0);\nexpect(\n  class {\n    static get [foo]() {\n      return 0;\n    }\n  }.foo,\n).toBe(0);\nexpect(\n  (class {\n    static set [foo](v) {\n      return v;\n    }\n  }.foo = 0),\n).toBe(0);\nexpect(\n  new (class {\n    constructor() {\n      _defineProperty(this, foo, 0);\n    }\n  })().foo,\n).toBe(0);\nconst arrayLike = { [Symbol.toPrimitive]: () => [] };\nexpect(() => {\n  var _Class2;\n  return ((_Class2 = class {}), _defineProperty(_Class2, arrayLike, 0), _Class2);\n}).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    class {\n      static [arrayLike]() {\n        return 0;\n      }\n    },\n).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    class {\n      static get [arrayLike]() {\n        return 0;\n      }\n    },\n).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    class {\n      static set [arrayLike](v) {\n        return v;\n      }\n    },\n).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    new (class {\n      constructor() {\n        _defineProperty(this, arrayLike, 0);\n      }\n    })(),\n).toThrow('@@toPrimitive must return a primitive value.');",
  "var _Class;\nconst foo = { [Symbol.toPrimitive]: () => 'foo' };\nexpect(((_Class = class {}), (_Class[foo] = 0), _Class).foo).toBe(0);\nexpect(\n  class {\n    static [foo]() {\n      return 0;\n    }\n  }.foo(),\n).toBe(0);\nexpect(\n  class {\n    static get [foo]() {\n      return 0;\n    }\n  }.foo,\n).toBe(0);\nexpect(\n  (class {\n    static set [foo](v) {\n      return v;\n    }\n  }.foo = 0),\n).toBe(0);\nexpect(\n  new (class {\n    constructor() {\n      this[foo] = 0;\n    }\n  })().foo,\n).toBe(0);\nconst arrayLike = { [Symbol.toPrimitive]: () => [] };\nexpect(() => {\n  var _Class2;\n  return ((_Class2 = class {}), (_Class2[arrayLike] = 0), _Class2);\n}).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    class {\n      static [arrayLike]() {\n        return 0;\n      }\n    },\n).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    class {\n      static get [arrayLike]() {\n        return 0;\n      }\n    },\n).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    class {\n      static set [arrayLike](v) {\n        return v;\n      }\n    },\n).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    new (class {\n      constructor() {\n        this[arrayLike] = 0;\n      }\n    })(),\n).toThrow('@@toPrimitive must return a primitive value.');",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nconst createClass = k => {\n  let _k;\n  return (\n    (_k = k()),\n    class {\n      constructor() {\n        _defineProperty(this, _k, 2);\n      }\n    }\n  );\n};\nconst clazz = createClass(() => 'foo');\nconst instance = new clazz();\nexpect(instance.foo).toBe(2);",
  "const createClass = k => {\n  let _k;\n  return (\n    (_k = k()),\n    class {\n      constructor() {\n        this[_k] = 2;\n      }\n    }\n  );\n};\nconst clazz = createClass(() => 'foo');\nconst instance = new clazz();\nexpect(instance.foo).toBe(2);",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nconst createClass = k => {\n  let _k;\n  return (\n    (_k = k()),\n    class {\n      constructor() {\n        _defineProperty(this, _k, 2);\n      }\n    }\n  );\n};",
  'const createClass = k => {\n  let _k;\n  return (\n    (_k = k()),\n    class {\n      constructor() {\n        this[_k] = 2;\n      }\n    }\n  );\n};',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _superPropGet = require('@babel/runtime/helpers/superPropGet');\nexpect(() => {\n  new (class {\n    constructor() {\n      _defineProperty(this, 'y', delete super.x);\n    }\n  })();\n}).toThrow(ReferenceError);\nexpect(() => {\n  new (class {\n    constructor() {\n      _defineProperty(this, 'y', delete super[0]);\n    }\n  })();\n}).toThrow(ReferenceError);\nexpect(() => {\n  var _X;\n  class X1 {}\n  _X = X1;\n  _defineProperty(X1, 'y', delete _superPropGet(_X, 'x', _X));\n}).toThrow(ReferenceError);\nexpect(() => {\n  var _X2;\n  class X2 {}\n  _X2 = X2;\n  _defineProperty(X2, 'y', delete _superPropGet(_X2, 0, _X2));\n}).toThrow(ReferenceError);",
  'expect(() => {\n  new (class {\n    constructor() {\n      this.y = delete super.x;\n    }\n  })();\n}).toThrow(ReferenceError);\nexpect(() => {\n  new (class {\n    constructor() {\n      this.y = delete super[0];\n    }\n  })();\n}).toThrow(ReferenceError);\nexpect(() => {\n  var _X;\n  class X1 {}\n  _X = X1;\n  X1.y = delete Object.getPrototypeOf(_X).x;\n}).toThrow(ReferenceError);\nexpect(() => {\n  var _X2;\n  class X2 {}\n  _X2 = X2;\n  X2.y = delete Object.getPrototypeOf(_X2)[0];\n}).toThrow(ReferenceError);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _superPropGet = require('@babel/runtime/helpers/superPropGet');\nvar _X, _X2;\nnew (class {\n  constructor() {\n    _defineProperty(this, 'y', delete super.x);\n  }\n})();\nnew (class {\n  constructor() {\n    _defineProperty(this, 'y', delete super[0]);\n  }\n})();\nclass X1 {}\n_X = X1;\n_defineProperty(X1, 'y', delete _superPropGet(_X, 'x', _X));\nclass X2 {}\n_X2 = X2;\n_defineProperty(X2, 'y', delete _superPropGet(_X2, 0, _X2));",
  'var _X, _X2;\nnew (class {\n  constructor() {\n    this.y = delete super.x;\n  }\n})();\nnew (class {\n  constructor() {\n    this.y = delete super[0];\n  }\n})();\nclass X1 {}\n_X = X1;\nX1.y = delete Object.getPrototypeOf(_X).x;\nclass X2 {}\n_X2 = X2;\nX2.y = delete Object.getPrototypeOf(_X2)[0];',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'x', delete this);\n  }\n}\n_defineProperty(Foo, 'x', true);\nexpect(new Foo().x).toBe(true);\nexpect(Foo.x).toBe(true);",
  'class Foo {\n  constructor() {\n    this.x = delete this;\n  }\n}\nFoo.x = true;\nexpect(new Foo().x).toBe(true);\nexpect(Foo.x).toBe(true);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'x', delete this);\n  }\n}\n_defineProperty(Foo, 'x', true);",
  'class Foo {\n  constructor() {\n    this.x = delete this;\n  }\n}\nFoo.x = true;',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo extends Bar {\n  constructor() {\n    var _super = (..._args) => (super(..._args), _defineProperty(this, 'bar', 'foo'), this);\n    if (condition) {\n      _super();\n    } else {\n      _super();\n    }\n  }\n}",
  "class Foo extends Bar {\n  constructor() {\n    var _super = (..._args) => (super(..._args), (this.bar = 'foo'), this);\n    if (condition) {\n      _super();\n    } else {\n      _super();\n    }\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _super = function () {\n  'use strict';\n  _defineProperty(this, 'bar', 'foo');\n  return this;\n};\nclass Foo extends Bar {\n  constructor(x = test ? _super.call(super()) : 0) {}\n}",
  "let _super = function () {\n  'use strict';\n  this.bar = 'foo';\n  return this;\n};\nclass Foo extends Bar {\n  constructor(x = test ? _super.call(super()) : 0) {}\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _super = function () {\n  'use strict';\n  _defineProperty(this, 'bar', 'foo');\n  return this;\n};\nclass Foo extends Bar {\n  constructor(\n    x = () => {\n      check(_super.call(super()));\n    },\n  ) {}\n}",
  "let _super = function () {\n  'use strict';\n  this.bar = 'foo';\n  return this;\n};\nclass Foo extends Bar {\n  constructor(\n    x = () => {\n      check(_super.call(super()));\n    },\n  ) {}\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _super = function () {\n  'use strict';\n  _defineProperty(this, 'bar', 'foo');\n  return this;\n};\nclass Foo extends Bar {\n  constructor(x = _super.call(super())) {}\n}",
  "let _super = function () {\n  'use strict';\n  this.bar = 'foo';\n  return this;\n};\nclass Foo extends Bar {\n  constructor(x = _super.call(super())) {}\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar foo = 'bar';\nclass Foo {\n  constructor(_foo) {\n    _defineProperty(this, 'bar', this);\n    _defineProperty(this, 'baz', foo);\n  }\n}",
  "var foo = 'bar';\nclass Foo {\n  constructor(_foo) {\n    this.bar = this;\n    this.baz = foo;\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'bar', 'bar');\n  }\n  static test() {\n    return Foo.foo;\n  }\n  test() {\n    return this.bar;\n  }\n}\n_defineProperty(Foo, 'foo', 'foo');\nconst f = new Foo();\nexpect('foo' in Foo).toBe(true);\nexpect('bar' in f).toBe(true);\nexpect(Foo.test()).toBe('foo');\nexpect(f.test()).toBe('bar');",
  "class Foo {\n  constructor() {\n    this.bar = 'bar';\n  }\n  static test() {\n    return Foo.foo;\n  }\n  test() {\n    return this.bar;\n  }\n}\nFoo.foo = 'foo';\nconst f = new Foo();\nexpect('foo' in Foo).toBe(true);\nexpect('bar' in f).toBe(true);\nexpect(Foo.test()).toBe('foo');\nexpect(f.test()).toBe('bar');",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'bar', 'bar');\n  }\n}\n_defineProperty(Foo, 'foo', 'foo');",
  "class Foo {\n  constructor() {\n    this.bar = 'bar';\n  }\n}\nFoo.foo = 'foo';",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 0, 'foo');\n    _defineProperty(this, 1, 'bar');\n  }\n}",
  "class Foo {\n  constructor() {\n    this[0] = 'foo';\n    this[1] = 'bar';\n  }\n}",
  'class Foo {\n  constructor(props) {\n    [x, ...super.client] = props;\n  }\n}',
  'class Foo {\n  constructor(props) {\n    [super.client] = props;\n  }\n}',
  'class Foo {\n  constructor(props) {\n    ({ x, ...super.client } = props);\n  }\n}',
  'class Foo {\n  constructor(props) {\n    ({ client: super.client } = props);\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'foo', 0);\n  }\n  test(other) {\n    return [\n      this.foo++,\n      this.foo,\n      ++this.foo,\n      this.foo,\n      other.obj.foo++,\n      other.obj.foo,\n      ++other.obj.foo,\n      other.obj.foo,\n    ];\n  }\n}\nconst f = new Foo();\nconst results = f.test({ obj: f });\nexpect(results[0]).toBe(0);\nexpect(results[1]).toBe(1);\nexpect(results[2]).toBe(2);\nexpect(results[3]).toBe(2);\nexpect(results[4]).toBe(2);\nexpect(results[5]).toBe(3);\nexpect(results[6]).toBe(4);\nexpect(results[7]).toBe(4);",
  'class Foo {\n  constructor() {\n    this.foo = 0;\n  }\n  test(other) {\n    return [\n      this.foo++,\n      this.foo,\n      ++this.foo,\n      this.foo,\n      other.obj.foo++,\n      other.obj.foo,\n      ++other.obj.foo,\n      other.obj.foo,\n    ];\n  }\n}\nconst f = new Foo();\nconst results = f.test({ obj: f });\nexpect(results[0]).toBe(0);\nexpect(results[1]).toBe(1);\nexpect(results[2]).toBe(2);\nexpect(results[3]).toBe(2);\nexpect(results[4]).toBe(2);\nexpect(results[5]).toBe(3);\nexpect(results[6]).toBe(4);\nexpect(results[7]).toBe(4);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass Foo {\n  constructor() {\n    _defineProperty(this, 'foo', 0);\n  }\n  test(other) {\n    this.foo++;\n    ++this.foo;\n    other.obj.foo++;\n    ++other.obj.foo;\n  }\n}",
  'class Foo {\n  constructor() {\n    this.foo = 0;\n  }\n  test(other) {\n    this.foo++;\n    ++this.foo;\n    other.obj.foo++;\n    ++other.obj.foo;\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nexpect(() => {\n  let _ref;\n  _ref = 0 in 0;\n  class X {\n    constructor() {\n      _defineProperty(this, _ref, void 0);\n    }\n  }\n}).toThrow();\nexpect(() => {\n  let _ref2;\n  _ref2 = 0 instanceof 0;\n  class X {\n    constructor() {\n      _defineProperty(this, _ref2, void 0);\n    }\n  }\n}).toThrow();",
  'expect(() => {\n  let _ref;\n  _ref = 0 in 0;\n  class X {\n    constructor() {\n      this[_ref] = void 0;\n    }\n  }\n}).toThrow();\nexpect(() => {\n  let _ref2;\n  _ref2 = 0 instanceof 0;\n  class X {\n    constructor() {\n      this[_ref2] = void 0;\n    }\n  }\n}).toThrow();',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nlet _ref, _ref2;\n_ref = 0 in 0;\n_ref2 = 0 instanceof 0;\nclass X {\n  constructor() {\n    _defineProperty(this, _ref, void 0);\n    _defineProperty(this, _ref2, void 0);\n  }\n}",
  'let _ref, _ref2;\n_ref = 0 in 0;\n_ref2 = 0 instanceof 0;\nclass X {\n  constructor() {\n    this[_ref] = void 0;\n    this[_ref2] = void 0;\n  }\n}',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\n() => {\n  var _Foo;\n  class Foo {\n    constructor() {\n      _defineProperty(this, 'fn', () => console.log(this));\n    }\n  }\n  _Foo = Foo;\n  _defineProperty(Foo, 'fn', () => console.log(_Foo));\n};\n() => {\n  var _Bar;\n  return (\n    (_Bar = class Bar {\n      constructor() {\n        _defineProperty(this, 'fn', () => console.log(this));\n      }\n    }),\n    _defineProperty(_Bar, 'fn', () => console.log(_Bar)),\n    _Bar\n  );\n};\n() => {\n  var _Baz;\n  class Baz {\n    constructor(_force) {\n      _defineProperty(this, 'fn', () => console.log(this));\n      _defineProperty(this, 'force', force);\n    }\n  }\n  _Baz = Baz;\n  _defineProperty(Baz, 'fn', () => console.log(_Baz));\n};\nvar qux = function () {\n  var _Qux;\n  class Qux {\n    constructor() {\n      _defineProperty(this, 'fn', () => console.log(this));\n    }\n  }\n  _Qux = Qux;\n  _defineProperty(Qux, 'fn', () => console.log(_Qux));\n}.bind(this);",
  '() => {\n  var _Foo;\n  class Foo {\n    constructor() {\n      this.fn = () => console.log(this);\n    }\n  }\n  _Foo = Foo;\n  Foo.fn = () => console.log(_Foo);\n};\n() => {\n  var _Bar;\n  return (\n    (_Bar = class Bar {\n      constructor() {\n        this.fn = () => console.log(this);\n      }\n    }),\n    (_Bar.fn = () => console.log(_Bar)),\n    _Bar\n  );\n};\n() => {\n  var _Baz;\n  class Baz {\n    constructor(_force) {\n      this.fn = () => console.log(this);\n      this.force = force;\n    }\n  }\n  _Baz = Baz;\n  Baz.fn = () => console.log(_Baz);\n};\nvar qux = function () {\n  var _Qux;\n  class Qux {\n    constructor() {\n      this.fn = () => console.log(this);\n    }\n  }\n  _Qux = Qux;\n  Qux.fn = () => console.log(_Qux);\n}.bind(this);',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _superPropGet = require('@babel/runtime/helpers/superPropGet');\nclass Test {\n  constructor() {\n    var _Other;\n    class Other extends Test {\n      constructor(..._args) {\n        super(..._args);\n        _defineProperty(this, 'a', () => super.test);\n      }\n    }\n    _Other = Other;\n    _defineProperty(Other, 'a', () => _superPropGet(_Other, 'test', _Other));\n  }\n}",
  'class Test {\n  constructor() {\n    var _Other;\n    class Other extends Test {\n      constructor(..._args) {\n        super(..._args);\n        this.a = () => super.test;\n      }\n    }\n    _Other = Other;\n    Other.a = () => Object.getPrototypeOf(_Other).test;\n  }\n}',
  "'use strict';\nvar _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass C {}\nclass A extends C {\n  constructor() {\n    super();\n    _defineProperty(this, 'field', 1);\n    class B extends C {\n      constructor() {\n        super();\n        expect(this.field).toBeUndefined();\n      }\n    }\n    expect(this.field).toBe(1);\n    new B();\n  }\n}\nnew A();\nclass Obj {\n  constructor() {\n    return {};\n  }\n}\n// ensure superClass is still transformed\nclass SuperClass extends Obj {\n  constructor() {\n    var _super = (..._args) => (super(..._args), _defineProperty(this, 'field', 1), this);\n    class B extends (_super(), Obj) {\n      constructor() {\n        super();\n        expect(this.field).toBeUndefined();\n      }\n    }\n    expect(this.field).toBe(1);\n    new B();\n  }\n}\nnew SuperClass();\n// ensure ComputedKey Method is still transformed\nclass ComputedMethod extends Obj {\n  constructor() {\n    var _super2 = (..._args2) => (super(..._args2), _defineProperty(this, 'field', 1), this);\n    class B extends Obj {\n      constructor() {\n        super();\n        expect(this.field).toBeUndefined();\n      }\n      [_super2()]() {}\n    }\n    expect(this.field).toBe(1);\n    new B();\n  }\n}\nnew ComputedMethod();\n// ensure ComputedKey Field is still transformed\nclass ComputedField extends Obj {\n  constructor() {\n    let _super4;\n    var _super3 = (..._args3) => (super(..._args3), _defineProperty(this, 'field', 1), this);\n    _super4 = _super3();\n    class B extends Obj {\n      constructor() {\n        super();\n        _defineProperty(this, _super4, 1);\n        expect(this.field).toBeUndefined();\n      }\n    }\n    expect(this.field).toBe(1);\n    new B();\n  }\n}\nnew ComputedField();",
  "'use strict';\nclass C {}\nclass A extends C {\n  constructor() {\n    super();\n    this.field = 1;\n    class B extends C {\n      constructor() {\n        super();\n        expect(this.field).toBeUndefined();\n      }\n    }\n    expect(this.field).toBe(1);\n    new B();\n  }\n}\nnew A();\nclass Obj {\n  constructor() {\n    return {};\n  }\n}\n// ensure superClass is still transformed\nclass SuperClass extends Obj {\n  constructor() {\n    var _super = (..._args) => (super(..._args), (this.field = 1), this);\n    class B extends (_super(), Obj) {\n      constructor() {\n        super();\n        expect(this.field).toBeUndefined();\n      }\n    }\n    expect(this.field).toBe(1);\n    new B();\n  }\n}\nnew SuperClass();\n// ensure ComputedKey Method is still transformed\nclass ComputedMethod extends Obj {\n  constructor() {\n    var _super2 = (..._args2) => (super(..._args2), (this.field = 1), this);\n    class B extends Obj {\n      constructor() {\n        super();\n        expect(this.field).toBeUndefined();\n      }\n      [_super2()]() {}\n    }\n    expect(this.field).toBe(1);\n    new B();\n  }\n}\nnew ComputedMethod();\n// ensure ComputedKey Field is still transformed\nclass ComputedField extends Obj {\n  constructor() {\n    let _super4;\n    var _super3 = (..._args3) => (super(..._args3), (this.field = 1), this);\n    _super4 = _super3();\n    class B extends Obj {\n      constructor() {\n        super();\n        this[_super4] = 1;\n        expect(this.field).toBeUndefined();\n      }\n    }\n    expect(this.field).toBe(1);\n    new B();\n  }\n}\nnew ComputedField();",
  "import _defineProperty from '@babel/runtime/helpers/defineProperty';\nexport class Foo extends Bar {\n  constructor(..._args) {\n    super(..._args);\n    _defineProperty(this, 'test', args);\n  }\n}\n_defineProperty(Foo, 'foo', {});",
  'export class Foo extends Bar {\n  constructor(..._args) {\n    super(..._args);\n    this.test = args;\n  }\n}\nFoo.foo = {};',
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nconst field = Symbol('field');\nclass A {\n  constructor() {\n    _defineProperty(this, field, 10);\n  }\n}",
  "const field = Symbol('field');\nclass A {\n  constructor() {\n    this[field] = 10;\n  }\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nconst classes = [];\nfor (let i = 0; i <= 10; ++i) {\n  var _A, _bar;\n  let _i;\n  classes.push(\n    ((_bar = /* @__PURE__ */ new WeakMap()),\n    (_i = i),\n    (_A = class A {\n      constructor() {\n        _defineProperty(this, _i, `computed field ${i}`);\n        _classPrivateFieldInitSpec(this, _bar, `private field ${i}`);\n      }\n      getBar() {\n        return _classPrivateFieldGet(_bar, this);\n      }\n    }),\n    _defineProperty(_A, 'foo', `static field ${i}`),\n    _A),\n  );\n}\nfor (let i = 0; i <= 10; ++i) {\n  const clazz = classes[i];\n  expect(clazz.foo).toBe('static field ' + i);\n  const instance = new clazz();\n  expect(Object.getOwnPropertyNames(instance)).toEqual([String(i)]);\n  expect(instance[i]).toBe('computed field ' + i);\n  expect(instance.getBar()).toBe('private field ' + i);\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nconst classes = [];\nfor (let i = 0; i <= 10; ++i) {\n  var _A, _bar;\n  let _i;\n  classes.push(\n    ((_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),\n    (_i = i),\n    (_A = class A {\n      constructor() {\n        this[_i] = `computed field ${i}`;\n        Object.defineProperty(this, _bar, {\n          writable: true,\n          value: `private field ${i}`,\n        });\n      }\n      getBar() {\n        return _classPrivateFieldLooseBase(this, _bar)[_bar];\n      }\n    }),\n    (_A.foo = `static field ${i}`),\n    _A),\n  );\n}\nfor (let i = 0; i <= 10; ++i) {\n  const clazz = classes[i];\n  expect(clazz.foo).toBe('static field ' + i);\n  const instance = new clazz();\n  expect(Object.getOwnPropertyNames(instance)).toEqual([String(i)]);\n  expect(instance[i]).toBe('computed field ' + i);\n  expect(instance.getBar()).toBe('private field ' + i);\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nvar _classPrivateFieldInitSpec = require('@babel/runtime/helpers/classPrivateFieldInitSpec');\nvar _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet2');\nconst classes = [];\nfor (let i = 0; i <= 10; ++i) {\n  var _A, _bar;\n  let _i;\n  classes.push(\n    ((_bar = /* @__PURE__ */ new WeakMap()),\n    (_i = i),\n    (_A = class A {\n      constructor() {\n        _defineProperty(this, _i, `computed field ${i}`);\n        _classPrivateFieldInitSpec(this, _bar, `private field ${i}`);\n      }\n      getBar() {\n        return _classPrivateFieldGet(_bar, this);\n      }\n    }),\n    _defineProperty(_A, 'foo', `static field ${i}`),\n    _A),\n  );\n}",
  "var _classPrivateFieldLooseBase = require('@babel/runtime/helpers/classPrivateFieldLooseBase');\nvar _classPrivateFieldLooseKey = require('@babel/runtime/helpers/classPrivateFieldLooseKey');\nconst classes = [];\nfor (let i = 0; i <= 10; ++i) {\n  var _A, _bar;\n  let _i;\n  classes.push(\n    ((_bar = /* @__PURE__ */ _classPrivateFieldLooseKey('bar')),\n    (_i = i),\n    (_A = class A {\n      constructor() {\n        this[_i] = `computed field ${i}`;\n        Object.defineProperty(this, _bar, {\n          writable: true,\n          value: `private field ${i}`,\n        });\n      }\n      getBar() {\n        return _classPrivateFieldLooseBase(this, _bar)[_bar];\n      }\n    }),\n    (_A.foo = `static field ${i}`),\n    _A),\n  );\n}",
  "var _defineProperty = require('@babel/runtime/helpers/defineProperty');\nclass A extends B {\n  constructor() {\n    var _super = (..._args) => (super(..._args), _defineProperty(this, 'x', 2), this);\n    x ? _super(a) : _super(b);\n  }\n}",
  'class A extends B {\n  constructor() {\n    var _super = (..._args) => (super(..._args), (this.x = 2), this);\n    x ? _super(a) : _super(b);\n  }\n}',
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _field = '__private_A_field';\n  var _getter = '__private_A_getter';\n  var _method = '__private_A_method';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _field, {\n      writable: true,\n      value: void 0,\n    });\n    Object.defineProperty(this, _method, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _getter, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(A.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _field)[_field];\n        _classPrivateFieldLooseBase(this, _getter)[_getter];\n        _classPrivateFieldLooseBase(this, _method)[_method];\n        inExpr(_classPrivateFieldLooseBase(this, _field)[_field]);\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _field = '__private_A_field';\n  var _setter = '__private_A_setter';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _field, {\n      writable: true,\n      value: void 0,\n    });\n    Object.defineProperty(this, _setter, {\n      set: function (value) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(A.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _field)[_field] = 42;\n        _classPrivateFieldLooseBase(this, _setter)[_setter] = 43;\n        inExpr((_classPrivateFieldLooseBase(this, _field)[_field] = 5));\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
] as const;

export const fixtureCases = [
  {
    title: 'assumption constantSuper — complex super class (input)',
    source: 'class A extends class B {} {\n  static x = super.x;\n}\n',
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
        output: expectedOutputs[0],
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
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'assumption constantSuper — instance field (input)',
    source: 'class A extends B {\n  foo = super.bar;\n}\n',
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
        output: expectedOutputs[2],
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
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'assumption constantSuper — static field (input)',
    source: 'class A extends B {\n  static foo = super.bar;\n}\n',
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
        output: expectedOutputs[4],
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
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional chain before member call (exec)',
    source:
      "class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(o?.Foo.#m()).toEqual(1);\n    expect(o?.Foo.#m().toString).toEqual(1..toString);\n    expect(o?.Foo.#m().toString()).toEqual('1');\n\n    expect(deep?.very.o?.Foo.#m()).toEqual(1);\n    expect(deep?.very.o?.Foo.#m().toString).toEqual(1..toString);\n    expect(deep?.very.o?.Foo.#m().toString()).toEqual('1');\n\n    expect(o?.Foo.#self.#m()).toEqual(1);\n    expect(o?.Foo.#self.self.#m()).toEqual(1);\n    expect(o?.Foo.#self?.self.#m()).toEqual(1);\n    expect(o?.Foo.#self.self?.self.#m()).toEqual(1);\n    expect(o?.Foo.#self?.self?.self.#m()).toEqual(1);\n\n    expect(o?.Foo.#self.getSelf().#m()).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.().#m()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf().#m()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.().#m()).toEqual(1);\n    expect(o?.Foo.#self.getSelf()?.self.#m()).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.()?.self.#m()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf()?.self.#m()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.()?.self.#m()).toEqual(1);\n\n    expect(fn?.().Foo.#m()).toEqual(1);\n    expect(fn?.().Foo.#m().toString).toEqual(1..toString);\n    expect(fn?.().Foo.#m().toString()).toEqual('1');\n\n    expect(fnDeep?.().very.o?.Foo.#m()).toEqual(1);\n    expect(fnDeep?.().very.o?.Foo.#m().toString).toEqual(1..toString);\n    expect(fnDeep?.().very.o?.Foo.#m().toString()).toEqual('1');\n\n    expect(fn?.().Foo.#self.#m()).toEqual(1);\n    expect(fn?.().Foo.#self.self.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.self.#m()).toEqual(1);\n    expect(fn?.().Foo.#self.self?.self.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.self?.self.#m()).toEqual(1);\n\n    expect(fn?.().Foo.#self.getSelf().#m()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.().#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf().#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.().#m()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf()?.self.#m()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.()?.self.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf()?.self.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self.#m()).toEqual(1);\n  }\n\n  static testNull() {\n    const o = null;;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(o?.Foo.#m()).toEqual(undefined);\n    expect(o?.Foo.#m().toString).toEqual(undefined);\n    expect(o?.Foo.#m().toString()).toEqual(undefined);\n\n    expect(deep?.very.o?.Foo.#m()).toEqual(undefined);\n    expect(deep?.very.o?.Foo.#m().toString).toEqual(undefined);\n    expect(deep?.very.o?.Foo.#m().toString()).toEqual(undefined);\n\n    expect(o?.Foo.#self.#m()).toEqual(undefined);\n    expect(o?.Foo.#self.self.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.self.#m()).toEqual(undefined);\n    expect(o?.Foo.#self.self?.self.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.self?.self.#m()).toEqual(undefined);\n\n    expect(o?.Foo.#self.getSelf().#m()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.().#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf().#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.().#m()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf()?.self.#m()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.()?.self.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf()?.self.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.()?.self.#m()).toEqual(undefined);\n\n    expect(fn?.().Foo.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#m().toString).toEqual(undefined);\n    expect(fn?.().Foo.#m().toString()).toEqual(undefined);\n\n    expect(fnDeep?.().very.o?.Foo.#m()).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo.#m().toString).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo.#m().toString()).toEqual(undefined);\n\n    expect(fn?.().Foo.#self.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.self.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.self?.self.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self?.self.#m()).toEqual(undefined);\n\n    expect(fn?.().Foo.#self.getSelf().#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.().#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf().#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.().#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf()?.self.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.()?.self.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf()?.self.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self.#m()).toEqual(undefined);\n  }\n}\n\nFoo.test();\nFoo.testNull();\n",
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
        output: expectedOutputs[6],
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
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional chain before member call (input)',
    source:
      'class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    o?.Foo.#m();\n    o?.Foo.#m().toString;\n    o?.Foo.#m().toString();\n\n    deep?.very.o?.Foo.#m();\n    deep?.very.o?.Foo.#m().toString;\n    deep?.very.o?.Foo.#m().toString();\n\n    o?.Foo.#self.#m();\n    o?.Foo.#self.self.#m();\n    o?.Foo.#self?.self.#m();\n    o?.Foo.#self.self?.self.#m();\n    o?.Foo.#self?.self?.self.#m();\n\n    o?.Foo.#self.getSelf().#m();\n    o?.Foo.#self.getSelf?.().#m();\n    o?.Foo.#self?.getSelf().#m();\n    o?.Foo.#self?.getSelf?.().#m();\n    o?.Foo.#self.getSelf()?.self.#m();\n    o?.Foo.#self.getSelf?.()?.self.#m();\n    o?.Foo.#self?.getSelf()?.self.#m();\n    o?.Foo.#self?.getSelf?.()?.self.#m();\n\n    fn?.().Foo.#m();\n    fn?.().Foo.#m().toString;\n    fn?.().Foo.#m().toString();\n\n    fnDeep?.().very.o?.Foo.#m();\n    fnDeep?.().very.o?.Foo.#m().toString;\n    fnDeep?.().very.o?.Foo.#m().toString();\n\n    fn?.().Foo.#self.#m();\n    fn?.().Foo.#self.self.#m();\n    fn?.().Foo.#self?.self.#m();\n    fn?.().Foo.#self.self?.self.#m();\n    fn?.().Foo.#self?.self?.self.#m();\n\n    fn?.().Foo.#self.getSelf().#m();\n    fn?.().Foo.#self.getSelf?.().#m();\n    fn?.().Foo.#self?.getSelf().#m();\n    fn?.().Foo.#self?.getSelf?.().#m();\n    fn?.().Foo.#self.getSelf()?.self.#m();\n    fn?.().Foo.#self.getSelf?.()?.self.#m();\n    fn?.().Foo.#self?.getSelf()?.self.#m();\n    fn?.().Foo.#self?.getSelf?.()?.self.#m();\n  }\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[8],
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
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional chain cast to boolean (exec)',
    source:
      'class C {\n  static #a = {\n    b: {\n      c: {\n        d: 2,\n      },\n    },\n  };\n  static testIf(o) {\n    if (o?.#a.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    return o?.#a.b?.c.d ? true : false;\n  }\n  static testLoop(o) {\n    while (o?.#a.b.c.d) {\n      for (; o?.#a.b.c?.d; ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o?.#a.b?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    return !!o?.#a.b?.c.d;\n  }\n  static testIfDeep(o) {\n    if (o.obj?.#a.b?.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    return o.obj?.#a.b?.c.d ? true : false;\n  }\n  static testLoopDeep(o) {\n    while (o.obj?.#a.b.c.d) {\n      for (; o.obj?.#a.b.c?.d; ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o.obj?.#a.b?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    return !!o.obj?.#a.b?.c.d;\n  }\n\n  static testLogicalInIf(o) {\n    if (o?.#a.b?.c.d && o?.#a?.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n\n  static testLogicalInReturn(o) {\n    return o?.#a.b?.c.d && o?.#a?.b.c.d;\n  }\n\n  static testNullishCoalescing(o) {\n    if (o?.#a.b?.c.non_existent ?? o?.#a.b?.c.d) {\n      return o?.#a.b?.c.non_existent ?? o?.#a.b?.c.d;\n    }\n    return o?.#a.b?.c.non_existent ?? o;\n  }\n\n  static test() {\n    const c = C;\n    expect(C.testIf(c)).toBe(true);\n    expect(C.testConditional(c)).toBe(true);\n    expect(C.testLoop(c)).toBe(true);\n    expect(C.testNegate(c)).toBe(true);\n\n    expect(C.testIfDeep({ obj: c })).toBe(true);\n    expect(C.testConditionalDeep({ obj: c })).toBe(true);\n    expect(C.testLoopDeep({ obj: c })).toBe(true);\n    expect(C.testNegateDeep({ obj: c })).toBe(true);\n\n    expect(C.testLogicalInIf(c)).toBe(true);\n    expect(C.testLogicalInReturn(c)).toBe(2);\n\n    expect(C.testNullishCoalescing(c)).toBe(2);\n  }\n\n  static testNullish() {\n    for (const n of [null, undefined]) {\n      expect(C.testIf(n)).toBe(false);\n      expect(C.testConditional(n)).toBe(false);\n      expect(C.testLoop(n)).toBe(false);\n      expect(C.testNegate(n)).toBe(false);\n\n      expect(C.testIfDeep({ obj: n })).toBe(false);\n      expect(C.testConditionalDeep({ obj: n })).toBe(false);\n      expect(C.testLoopDeep({ obj: n })).toBe(false);\n      expect(C.testNegateDeep({ obj: n })).toBe(false);\n\n      expect(C.testLogicalInIf(n)).toBe(false);\n      expect(C.testLogicalInReturn(n)).toBe(undefined);\n\n      expect(C.testNullishCoalescing(n)).toBe(n);\n    }\n  }\n}\n\nC.test();\nC.testNullish();\n',
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
        output: expectedOutputs[10],
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
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'assumption noDocumentAll — optional chain cast to boolean (input)',
    source:
      'class C {\n  static #a = {\n    b: {\n      c: {\n        d: 2,\n      },\n    },\n  };\n  static testIf(o) {\n    if (o?.#a.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditional(o) {\n    return o?.#a.b?.c.d ? true : false;\n  }\n  static testLoop(o) {\n    while (o?.#a.b.c.d) {\n      for (; o?.#a.b.c?.d; ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o?.#a.b?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegate(o) {\n    return !!o?.#a.b?.c.d;\n  }\n  static testIfDeep(o) {\n    if (o.obj?.#a.b?.c.d) {\n      return true;\n    }\n    return false;\n  }\n  static testConditionalDeep(o) {\n    return o.obj?.#a.b?.c.d ? true : false;\n  }\n  static testLoopDeep(o) {\n    while (o.obj?.#a.b.c.d) {\n      for (; o.obj?.#a.b.c?.d; ) {\n        let i = 0;\n        do {\n          i++;\n          if (i === 2) {\n            return true;\n          }\n        } while (o.obj?.#a.b?.c.d);\n      }\n    }\n    return false;\n  }\n  static testNegateDeep(o) {\n    return !!o.obj?.#a.b?.c.d;\n  }\n\n  static testLogicalInIf(o) {\n    if (o?.#a.b?.c.d && o?.#a?.b.c.d) {\n      return true;\n    }\n    return false;\n  }\n\n  static testLogicalInReturn(o) {\n    return o?.#a.b?.c.d && o?.#a?.b.c.d;\n  }\n\n  static testNullishCoalescing(o) {\n    if (o?.#a.b?.c.non_existent ?? o?.#a.b?.c.d) {\n      return o?.#a.b?.c.non_existent ?? o?.#a.b?.c.d;\n    }\n    return o?.#a.b?.c.non_existent ?? o;\n  }\n}\n\nC.test();\nC.testNullish();\n',
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
        output: expectedOutputs[12],
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
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'assumption noUninitializedPrivateFieldAccess — static private (exec)',
    source:
      'class A {\n  static #x = 0;\n\n  static dynamicCheck() {\n    expect(this.#x).toBe(0);\n    expect(this.#x = 1).toBe(1);\n    expect(this.#x).toBe(1);\n    [this.#x] = [2];\n    expect(this.#x).toBe(2);\n  }\n\n  static noCheck() {\n    expect(A.#x).toBe(2);\n    expect(A.#x = 3).toBe(3);\n    [A.#x] = [4];\n    expect(A.#x).toBe(4);\n  }\n}\n\nA.dynamicCheck();\nA.noCheck();\n\n\n',
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
        output: expectedOutputs[14],
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
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'assumption noUninitializedPrivateFieldAccess — static private (input)',
    source:
      'class A {\n  static #x = 2;\n\n  static dynamicCheck() {\n    this.#x;\n    this.#x = 2;\n    [this.#x] = [];\n  }\n\n  static noCheck() {\n    A.#x;\n    A.#x = 2;\n    [A.#x] = [];\n  }\n}\n',
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
        output: expectedOutputs[16],
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
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — computed initialization order (exec)',
    source:
      'const actualOrder = [];\n\nconst track = i => {\n  actualOrder.push(i);\n  return i;\n};\n\nclass MyClass {\n  static [track(1)] = track(10);\n  [track(2)] = track(13);\n  get [track(3)]() {\n    return "foo";\n  }\n  set [track(4)](value) {\n    this.bar = value;\n  }\n  [track(5)] = track(14);\n  static [track(6)] = track(11);\n  static [track(7)] = track(12);\n  [track(8)]() {}\n  [track(9)] = track(15);\n}\n\nconst inst = new MyClass();\n\nconst expectedOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];\nexpect(actualOrder).toEqual(expectedOrder);\n\nexpect(MyClass[1]).toBe(10);\nexpect(inst[2]).toBe(13);\nexpect(inst[3]).toBe("foo");\ninst[4] = "baz";\nexpect(inst.bar).toBe("baz");\nexpect(inst[5]).toBe(14);\nexpect(MyClass[6]).toBe(11);\nexpect(MyClass[7]).toBe(12);\nexpect(typeof inst[8]).toBe("function");\nexpect(inst[9]).toBe(15);\n',
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
        output: expectedOutputs[18],
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
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — computed (input)',
    source:
      'const foo = "foo";\nconst bar = () => {};\nconst four = 4;\n\nclass MyClass {\n  static [one()] = "test";\n  static [2 * 4 + 7] = "247";\n  static [2 * four + 7] = "247";\n  static [2 * four + seven] = "247";\n  [null] = "null";\n  [undefined] = "undefined";\n  [void 0] = "void 0";\n  get ["whatever"]() {}\n  set ["whatever"](value) {}\n  get [computed()]() {}\n  set [computed()](value) {}\n  ["test" + one]() {}\n  static [10]() {}\n  [/regex/] = "regex";\n  [foo] = "foo";\n  [bar] = "bar";\n  [baz] = "baz";\n  [`template`] = "template";\n  [`template${expression}`] = "template-with-expression";\n}\n',
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
        output: expectedOutputs[20],
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
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — constructor collision (input)',
    source:
      'var foo = "bar";\n\nclass Foo {\n  bar = foo;\n  static bar = baz;\n\n  constructor() {\n    var foo = "foo";\n    var baz = "baz";\n  }\n}\n',
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
        output: expectedOutputs[22],
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
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — derived (input)',
    source: 'class Foo extends Bar {\n  bar = "foo";\n}\n',
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
        output: expectedOutputs[24],
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
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — foobar (input)',
    source:
      'class Child extends Parent {\n    constructor() {\n        super();\n    }\n\n    scopedFunctionWithThis = () => {\n        this.name = {};\n    }\n}\n',
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
        output: expectedOutputs[26],
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
        output: expectedOutputs[27],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — instance computed (exec)',
    source:
      "function test(x) {\n  class F {\n    [x] = 1;\n    constructor() {}\n  }\n\n  x = 'deadbeef';\n  expect(new F().foo).toBe(1);\n  x = 'wrong';\n  expect(new F().foo).toBe(1);\n}\n\ntest('foo');\n",
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
        output: expectedOutputs[28],
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
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — instance computed (input)',
    source:
      "function test(x) {\n  class F {\n    [x] = 1;\n    constructor() {}\n  }\n\n  x = 'deadbeef';\n  expect(new F().foo).toBe(1);\n  x = 'wrong';\n  expect(new F().foo).toBe(1);\n}\n\ntest('foo');\n",
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
        output: expectedOutputs[28],
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
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — instance undefined (input)',
    source: 'class Foo {\n  bar;\n}\n',
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
        output: expectedOutputs[30],
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
        output: expectedOutputs[31],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — instance (input)',
    source: 'class Foo {\n  bar = "foo";\n}\n',
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
        output: expectedOutputs[32],
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
        output: expectedOutputs[33],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — length name use define (input)',
    source:
      'class A {\n    static name = 1;\n    static length = 2;\n    static foo = 3;\n    static [bar] = 4;\n    static ["name"] = 5;\n    static [name] = 6;\n    static "name" = 7;\n\n    name = 8;\n    length = 9;\n}',
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
        output: expectedOutputs[34],
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
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — non block arrow func (input)',
    source:
      "export default param =>\n  class App {\n    static props = {\n      prop1: 'prop1',\n      prop2: 'prop2'\n    }\n\n    getParam() {\n      return param;\n    }\n  }\n",
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
        output: expectedOutputs[36],
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
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — regression T2983 (input)',
    source:
      'call(class {\n  static test = true\n});\n\nexport default class {\n  static test = true\n};\n',
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
        output: expectedOutputs[38],
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
        output: expectedOutputs[39],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — regression T6719 (input)',
    source:
      'function withContext(ComposedComponent) {\n    return class WithContext extends Component {\n\n        static propTypes = {\n            context: PropTypes.shape(\n                {\n                    addCss: PropTypes.func,\n                    setTitle: PropTypes.func,\n                    setMeta: PropTypes.func,\n                }\n            ),\n        };\n    };\n}\n',
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
        output: expectedOutputs[40],
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
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — regression T7364 (input)',
    source:
      'class MyClass {\n  myAsyncMethod = async () => {\n    console.log(this);\n  }\n}\n\n(class MyClass2 {\n  myAsyncMethod = async () => {\n    console.log(this);\n  }\n})\n\nexport default class MyClass3 {\n  myAsyncMethod = async () => {\n    console.log(this);\n  }\n}\n',
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
        output: expectedOutputs[42],
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
        output: expectedOutputs[43],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static class binding (exec)',
    source:
      'class A {\n  static self = A;\n  static getA = () => A;\n}\n\nconst oldA = A;\nA = null;\n\nexpect(oldA.self).toBe(oldA);\nexpect(oldA.getA()).toBe(oldA);\n',
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
        output: expectedOutputs[44],
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
        output: expectedOutputs[45],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static class binding (input)',
    source: 'class A {\n  static self = A;\n  static getA = () => A;\n}\n',
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
        output: expectedOutputs[46],
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
        output: expectedOutputs[47],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static export (input)',
    source:
      'export class MyClass {\n  static property = value;\n}\n\nexport default class MyClass2 {\n  static property = value;\n}\n',
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
        output: expectedOutputs[48],
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
        output: expectedOutputs[49],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static infer name (exec)',
    source:
      'var Foo = class {\n  static num = 0;\n}\n\nexpect(Foo.num).toBe(0);\nexpect(Foo.num = 1).toBe(1);\nexpect(Foo.name).toBe("Foo");\n',
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
        output: expectedOutputs[50],
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
        output: expectedOutputs[51],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static infer name (input)',
    source: 'var Foo = class {\n  static num = 0;\n}\n',
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
        output: expectedOutputs[52],
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
        output: expectedOutputs[53],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static super loose (input)',
    source:
      'class A {\n  static prop = 1;\n}\n\nclass B extends A {\n  static prop = 2;\n  static propA = super.prop;\n  static getPropA = () => super.prop;\n}\n',
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
        output: expectedOutputs[54],
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
        output: expectedOutputs[55],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static super (exec)',
    source:
      'class A {\n  static prop = 1;\n}\n\nclass B extends A {\n  static prop = 2;\n  static propA = super.prop;\n  static getPropA = () => super.prop;\n}\n\nconst { prop, propA, getPropA } = B;\n\nexpect(prop).toBe(2);\nexpect(propA).toBe(1);\nexpect(getPropA()).toBe(1);\n\nconst oldB = B;\nB = null;\n\nexpect(oldB.prop).toBe(2);\nexpect(oldB.propA).toBe(1);\nexpect(oldB.getPropA()).toBe(1);\n',
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
        output: expectedOutputs[56],
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
        output: expectedOutputs[57],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static this (exec)',
    source:
      'class A {\n  static self = this;\n  static getA = () => this;\n}\n\nconst { self, getA } = A;\n\nexpect(self).toBe(A);\nexpect(getA()).toBe(A);\n\nconst oldA = A;\nA = null;\n\nexpect(oldA.self).toBe(oldA);\nexpect(oldA.getA()).toBe(oldA);\n',
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
        output: expectedOutputs[58],
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
        output: expectedOutputs[59],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static this (input)',
    source: 'class A {\n  static self = this;\n  static getA = () => this;\n}\n',
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
        output: expectedOutputs[46],
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
        output: expectedOutputs[47],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static undefined (exec)',
    source:
      'class Foo {\n  static num;\n}\n\nexpect("num" in Foo).toBe(true);\nexpect(Foo.num).toBeUndefined();\n',
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
        output: expectedOutputs[60],
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
        output: expectedOutputs[61],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static undefined (input)',
    source: 'class Foo {\n  static bar;\n}\n',
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
        output: expectedOutputs[62],
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
        output: expectedOutputs[63],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static (exec)',
    source:
      'class Foo {\n  static num = 0;\n  static str = "foo";\n}\n\nexpect(Foo.num).toBe(0);\nexpect(Foo.num = 1).toBe(1);\nexpect(Foo.str).toBe("foo");\nexpect(Foo.str = "bar").toBe("bar");\n',
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
        output: expectedOutputs[64],
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
        output: expectedOutputs[65],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — static (input)',
    source: 'class Foo {\n  static bar = "foo";\n}\n',
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
        output: expectedOutputs[66],
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
        output: expectedOutputs[67],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — super call (input)',
    source:
      'class A {\n  foo() {\n    return "bar";\n  }\n}\n\nclass B extends A {\n  foo = super.foo();\n}\n',
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
        output: expectedOutputs[68],
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
        output: expectedOutputs[69],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — super expression (input)',
    source:
      'class Foo extends Bar {\n  bar = "foo";\n\n  constructor() {\n    foo(super());\n  }\n}\n',
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
        output: expectedOutputs[70],
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
        output: expectedOutputs[71],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — super statement (input)',
    source: 'class Foo extends Bar {\n  bar = "foo";\n\n  constructor() {\n    super();\n  }\n}\n',
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
        output: expectedOutputs[72],
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
        output: expectedOutputs[73],
      },
    ],
  },
  {
    title: 'assumption setPublicClassFields — super with collision (input)',
    source: 'class A {\n  force = force;\n  foo = super.method();\n\n  constructor(force) {}\n}\n',
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
        output: expectedOutputs[74],
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
        output: expectedOutputs[75],
      },
    ],
  },
  {
    title: 'class name tdz — decorator interop (input)',
    source: 'function dec() {}\n\nclass A {\n  @dec a;\n\n  [Symbol.search]() {}\n}\n',
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
        output: expectedOutputs[76],
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
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'class name tdz — general (exec)',
    source:
      'expect(() => {\n  class Foo {\n    [Foo + 1] = 2;\n  };  \n}).toThrow(ReferenceError);\n',
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
        output: expectedOutputs[78],
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
        output: expectedOutputs[79],
      },
    ],
  },
  {
    title: 'class name tdz — general (input)',
    source: 'class Foo {\n  [Foo + 1] = 2;\n};\n',
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
        output: expectedOutputs[80],
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
        output: expectedOutputs[81],
      },
    ],
  },
  {
    title: 'class name tdz — static edgest case (exec)',
    source:
      'expect(() => {\n  class A {\n    static [{ x: A || 0 }.x];\n  }\n}).toThrow(ReferenceError);\n',
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
        output: expectedOutputs[82],
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
        output: expectedOutputs[83],
      },
    ],
  },
  {
    title: 'class name tdz — static edgest case (input)',
    source: 'class A {\n  static [{ x: A || 0 }.x];\n}\n',
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
        output: expectedOutputs[84],
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
        output: expectedOutputs[85],
      },
    ],
  },
  {
    title: 'class name tdz — static general (exec)',
    source:
      'expect(() => {\n  class C {\n    static [C + 3] = 3;\n  }\n}).toThrow(ReferenceError);\n',
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
        output: expectedOutputs[86],
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
        output: expectedOutputs[87],
      },
    ],
  },
  {
    title: 'class name tdz — static general (input)',
    source: 'class C {\n  static [C + 3] = 3;\n}\n',
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
        output: expectedOutputs[88],
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
        output: expectedOutputs[89],
      },
    ],
  },
  {
    title: 'class name tdz — typescript type (input)',
    source: 'class Foo {\n  @dec(function (this: Foo) {})\n  a;\n}\n',
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
        output: expectedOutputs[90],
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
        output: expectedOutputs[91],
      },
    ],
  },
  {
    title: 'compile to class — constructor collision ignores types loose (input)',
    source:
      'class C {\n    // Output should not use `_initialiseProps`\n    x: T;\n    y = 0;\n    constructor(T) {}\n}\n',
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
        output: expectedOutputs[92],
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
        output: expectedOutputs[93],
      },
    ],
  },
  {
    title: 'compile to class — preserve comments (input)',
    source:
      'class C {\n  /* before a */\n  a;\n  /* after a */\n\n  /* before b */\n  static b;\n  /* after b */\n}\n',
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
        output: expectedOutputs[94],
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
        output: expectedOutputs[95],
      },
    ],
  },
  {
    title: 'decorators legacy interop — local define property (input)',
    source:
      'function dec() {}\n\n// Create a local function binding so babel has to change the name of the helper\nfunction _defineProperty() {}\n\nclass A {\n  @dec a;\n\n  @dec b = 123;\n\n  c = 456;\n}\n',
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
        output: expectedOutputs[96],
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
        output: expectedOutputs[97],
      },
    ],
  },
  {
    title: 'decorators legacy interop — loose (input)',
    source: 'function dec() {}\n\nclass A {\n  @dec a;\n\n  @dec b = 123;\n\n  c = 456;\n}\n',
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
        output: expectedOutputs[98],
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
        output: expectedOutputs[99],
      },
    ],
  },
  {
    title: 'decorators legacy interop — wrong order (input)',
    source: '@deco\nclass Foo {}',
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
        output: expectedOutputs[100],
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
        output: expectedOutputs[100],
      },
    ],
  },
  {
    title: 'nested class — super call in decorator (exec)',
    source:
      '"use strict";\nclass Hello {\n  constructor() {\n    return () => () => "hello";\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    class Inner {\n      @(super()) hello;\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe(\'hello\');\n',
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
        output: expectedOutputs[101],
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
        output: expectedOutputs[102],
      },
    ],
  },
  {
    title: 'nested class — super call in decorator (input)',
    source:
      '"use strict";\nclass Hello {\n  constructor() {\n    return () => () => "hello";\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    class Inner {\n      @(super()) hello;\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe(\'hello\');\n',
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
        output: expectedOutputs[101],
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
        output: expectedOutputs[102],
      },
    ],
  },
  {
    title: 'nested class — super call in key (exec)',
    source:
      '"use strict";\nclass Hello {\n  constructor() {\n    return {\n      toString() {\n        return \'hello\';\n      },\n    };\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    class Inner {\n      [super()] = "hello";\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe(\'hello\');\n',
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
        output: expectedOutputs[103],
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
        output: expectedOutputs[104],
      },
    ],
  },
  {
    title: 'nested class — super call in key (input)',
    source:
      '"use strict";\nclass Hello {\n  constructor() {\n    return {\n      toString() {\n        return \'hello\';\n      },\n    };\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    class Inner {\n      [super()] = "hello";\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe(\'hello\');\n',
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
        output: expectedOutputs[103],
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
        output: expectedOutputs[104],
      },
    ],
  },
  {
    title: 'nested class — super property in accessor key (exec)',
    source:
      "\"use strict\";\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      accessor [super.toString()] = 'hello';\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe('hello');\n",
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
        output: expectedOutputs[105],
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
        output: expectedOutputs[105],
      },
    ],
  },
  {
    title: 'nested class — super property in accessor key (input)',
    source:
      "\"use strict\";\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      accessor [super.toString()] = 'hello';\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe('hello');\n",
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
        output: expectedOutputs[105],
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
        output: expectedOutputs[105],
      },
    ],
  },
  {
    title: 'nested class — super property in decorator (exec)',
    source:
      '"use strict";\nclass Hello {\n  dec() { return () => "hello" }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      @(super.dec) hello;\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe(\'hello\');\n',
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
        output: expectedOutputs[106],
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
        output: expectedOutputs[107],
      },
    ],
  },
  {
    title: 'nested class — super property in decorator (input)',
    source:
      '"use strict";\nclass Hello {\n  dec() { return () => "hello" }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      @(super.dec) hello;\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe(\'hello\');\n',
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
        output: expectedOutputs[106],
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
        output: expectedOutputs[107],
      },
    ],
  },
  {
    title: 'nested class — super property in key (exec)',
    source:
      "\"use strict\";\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      [super.toString()] = 'hello';\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe('hello');\n",
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
        output: expectedOutputs[108],
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
        output: expectedOutputs[109],
      },
    ],
  },
  {
    title: 'nested class — super property in key (input)',
    source:
      "\"use strict\";\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      [super.toString()] = 'hello';\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello).toBe('hello');\n",
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
        output: expectedOutputs[108],
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
        output: expectedOutputs[109],
      },
    ],
  },
  {
    title: 'private loose — access before declaration (exec)',
    source:
      'expect(() => {\n  class C {\n    static #_ = new C;\n    static #p;\n    constructor() {\n      C.#p;\n    }\n  }\n}).toThrow(/attempted to use private field on non-instance/);\n\nexpect(() => {\n  class C {\n    static #_ = new C;\n    static #p;\n    constructor() {\n      C.#p = 0;\n    }\n  }\n}).toThrow(/attempted to use private field on non-instance/);\n\nexpect(() => {\n  class C {\n    static #_ = new C;\n    static #p;\n    constructor() {\n      for (C.#p of [0]);\n    }\n  }\n}).toThrow(/attempted to use private field on non-instance/);\n',
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
        output: expectedOutputs[110],
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
        output: expectedOutputs[111],
      },
    ],
  },
  {
    title: 'private loose — assignment (input)',
    source:
      'class Foo {\n  #foo = 0;\n\n  test(other) {\n    this.#foo += 1;\n    this.#foo = 2;\n    other.obj.#foo += 1;\n    other.obj.#foo = 2;\n  }\n}\n',
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
        output: expectedOutputs[112],
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
        output: expectedOutputs[113],
      },
    ],
  },
  {
    title: 'private loose — call (exec)',
    source:
      'class Foo {\n  #foo = function() {\n    return this;\n  }\n\n  test(other) {\n    return [this.#foo(), other.#foo()];\n  }\n}\n\nconst f = new Foo;\nconst o = new Foo;\nconst test = f.test(o);\nexpect(test[0]).toBe(f);\nexpect(test[1]).toBe(o);\n',
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
        output: expectedOutputs[114],
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
        output: expectedOutputs[115],
      },
    ],
  },
  {
    title: 'private loose — call (input)',
    source:
      'class Foo {\n  #foo = function() {\n    return this;\n  }\n\n  test(other) {\n    this.#foo();\n    other.obj.#foo();\n  }\n}\n',
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
        output: expectedOutputs[116],
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
        output: expectedOutputs[117],
      },
    ],
  },
  {
    title: 'private loose — canonical (exec)',
    source:
      'class Point {\n    #x;\n    #y;\n\n    constructor(x = 0, y = 0) {\n        this.#x = +x;\n        this.#y = +y;\n    }\n\n    get x() { return this.#x }\n    set x(value) { this.#x = +value }\n\n    get y() { return this.#y }\n    set y(value) { this.#y = +value }\n\n    equals(p) { return this.#x === p.#x && this.#y === p.#y }\n\n    toString() { return `Point<${ this.#x },${ this.#y }>` }\n\n}\n\nconst p1 = new Point(1, 2);\nconst p2 = new Point(2, 3);\nconst p3 = new Point(1, 2);\n\nexpect(p1.x).toBe(1);\nexpect(p1.y).toBe(2);\nexpect(p2.x).toBe(2);\nexpect(p2.y).toBe(3);\nexpect(p3.x).toBe(1);\nexpect(p3.y).toBe(2);\n\nexpect(p1.equals(p1)).toBe(true)\nexpect(p1.equals(p2)).toBe(false)\nexpect(p1.equals(p3)).toBe(true)\nexpect(p2.equals(p1)).toBe(false)\nexpect(p2.equals(p2)).toBe(true)\nexpect(p2.equals(p3)).toBe(false)\nexpect(p3.equals(p1)).toBe(true)\nexpect(p3.equals(p2)).toBe(false)\nexpect(p3.equals(p3)).toBe(true)\n\nexpect(p1.toString()).toBe("Point<1,2>")\nexpect(p2.toString()).toBe("Point<2,3>")\nexpect(p3.toString()).toBe("Point<1,2>")\n\np1.x += 1;\np1.y = 3;\np2.x -= 1;\np2.y = 3;\np3.x = 0;\np3.y = 0;\n\nexpect(p1.x).toBe(2);\nexpect(p1.y).toBe(3);\nexpect(p2.x).toBe(1);\nexpect(p2.y).toBe(3);\nexpect(p3.x).toBe(0);\nexpect(p3.y).toBe(0);\n\nexpect(p1.equals(p1)).toBe(true)\nexpect(p1.equals(p2)).toBe(false)\nexpect(p1.equals(p3)).toBe(false)\nexpect(p2.equals(p1)).toBe(false)\nexpect(p2.equals(p2)).toBe(true)\nexpect(p2.equals(p3)).toBe(false)\nexpect(p3.equals(p1)).toBe(false)\nexpect(p3.equals(p2)).toBe(false)\nexpect(p3.equals(p3)).toBe(true)\n\nexpect(p1.toString()).toBe("Point<2,3>")\nexpect(p2.toString()).toBe("Point<1,3>")\nexpect(p3.toString()).toBe("Point<0,0>")\n',
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
        output: expectedOutputs[118],
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
        output: expectedOutputs[119],
      },
    ],
  },
  {
    title: 'private loose — canonical (input)',
    source:
      'class Point {\n    #x;\n    #y;\n\n    constructor(x = 0, y = 0) {\n        this.#x = +x;\n        this.#y = +y;\n    }\n\n    get x() { return this.#x }\n    set x(value) { this.#x = +value }\n\n    get y() { return this.#y }\n    set y(value) { this.#y = +value }\n\n    equals(p) { return this.#x === p.#x && this.#y === p.#y }\n\n    toString() { return `Point<${ this.#x },${ this.#y }>` }\n\n}\n',
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
        output: expectedOutputs[120],
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
        output: expectedOutputs[121],
      },
    ],
  },
  {
    title: 'private loose — class shadow builtins (input)',
    source: 'export class TypeError {\n  #message\n}\n',
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
        output: expectedOutputs[122],
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
        output: expectedOutputs[123],
      },
    ],
  },
  {
    title: 'private loose — constructor collision (exec)',
    source:
      'var foo = "bar";\n\nclass Foo {\n  #bar = foo;\n\n  constructor() {\n    var foo = "foo";\n  }\n\n  test() {\n    return this.#bar;\n  }\n}\n\nconst f = new Foo;\nexpect(f.test()).toBe(foo);\nexpect("bar" in f).toBe(false);\n',
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
        output: expectedOutputs[124],
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
        output: expectedOutputs[125],
      },
    ],
  },
  {
    title: 'private loose — constructor collision (input)',
    source:
      'var foo = "bar";\n\nclass Foo {\n  #bar = foo;\n\n  constructor() {\n    var foo = "foo";\n  }\n}\n',
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
        output: expectedOutputs[126],
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
        output: expectedOutputs[127],
      },
    ],
  },
  {
    title: 'private loose — declaration order (exec)',
    source: 'class C {\n  y = this.#x;\n  #x;\n}\n\nexpect(() => {\n  new C();\n}).toThrow();\n',
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
        output: expectedOutputs[128],
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
        output: expectedOutputs[129],
      },
    ],
  },
  {
    title: 'private loose — declaration order (input)',
    source: 'class C {\n  y = this.#x;\n  #x;\n}\n\nexpect(() => {\n  new C();\n}).toThrow();\n',
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
        output: expectedOutputs[128],
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
        output: expectedOutputs[129],
      },
    ],
  },
  {
    title: 'private loose — derived multiple supers (input)',
    source:
      'class Foo extends Bar {\n  #bar = "foo";\n\n  constructor() {\n    if (condition) {\n      super();\n    } else {\n      super();\n    }\n  }\n}\n',
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
        output: expectedOutputs[130],
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
        output: expectedOutputs[131],
      },
    ],
  },
  {
    title: 'private loose — derived (exec)',
    source:
      'class Foo {\n  #prop = "foo";\n\n  foo() {\n    return this.#prop;\n  }\n}\n\nclass Bar extends Foo {\n  #prop = "bar";\n\n  bar() {\n    return this.#prop;\n  }\n}\n\nconst f = new Foo;\nexpect(f.foo()).toBe("foo");\n\nconst b = new Bar;\nexpect(b.foo()).toBe("foo");\nexpect(b.bar()).toBe("bar");\n',
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
        output: expectedOutputs[132],
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
        output: expectedOutputs[133],
      },
    ],
  },
  {
    title: 'private loose — derived (input)',
    source: 'class Foo {\n  #prop = "foo";\n}\n\nclass Bar extends Foo {\n  #prop = "bar";\n}\n',
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
        output: expectedOutputs[134],
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
        output: expectedOutputs[135],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 1 (exec)',
    source:
      "class Foo {\n  #client\n\n  constructor(props) {\n    this.#client = 1;\n    ;([this.x = this.#client, this.#client, this.y = this.#client] = props);\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo([undefined, 'bar']);\nexpect(foo.getClient()).toBe('bar');\nexpect(foo.x).toBe(1);\nexpect(foo.y).toBe('bar');\n",
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
        output: expectedOutputs[136],
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
        output: expectedOutputs[137],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 1 (input)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    this.#client = 1;\n    ([this.x = this.#client, this.#client, this.y = this.#client] = props);\n  }\n}',
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
        output: expectedOutputs[138],
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
        output: expectedOutputs[139],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 2 (exec)',
    source:
      "class Foo {\n  #client\n\n  constructor(props) {\n    let x;\n    ;([x, ...this.#client] = props);\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo(['foo', 'bar', 'baz', 'quu']);\nexpect(foo.getClient()).toEqual(['bar', 'baz', 'quu']);\n",
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
        output: expectedOutputs[140],
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
        output: expectedOutputs[141],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 2 (input)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ([x, ...this.#client] = props);\n  }\n}',
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
        output: expectedOutputs[142],
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
        output: expectedOutputs[143],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 3 (exec)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ([this.#client = 5] = props);\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo([]);\nexpect(foo.getClient()).toEqual(5);\n',
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
        output: expectedOutputs[144],
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
        output: expectedOutputs[145],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern 3 (input)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ([this.#client = 5] = props);\n  }\n}',
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
        output: expectedOutputs[146],
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
        output: expectedOutputs[147],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern static (exec)',
    source:
      "class Foo {\n  static #client\n\n  constructor(props) {\n    ;([Foo.#client] = props);\n  }\n\n  getClient() {\n    return Foo.#client;\n  }\n}\n\nconst foo = new Foo(['bar']);\nexpect(foo.getClient()).toBe('bar');\n",
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
        output: expectedOutputs[148],
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
        output: expectedOutputs[149],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern static (input)',
    source:
      'class Foo {\n  static #client\n\n  constructor(props) {\n    ([Foo.#client] = props);\n  }\n}\n',
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
        output: expectedOutputs[150],
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
        output: expectedOutputs[151],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern (exec)',
    source:
      "class Foo {\n  #client\n\n  constructor(props) {\n    ;([this.#client] = props);\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo(['bar']);\nexpect(foo.getClient()).toBe('bar');\n",
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
        output: expectedOutputs[152],
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
        output: expectedOutputs[153],
      },
    ],
  },
  {
    title: 'private loose — destructuring array pattern (input)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ([this.#client] = props);\n  }\n}\n',
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
        output: expectedOutputs[154],
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
        output: expectedOutputs[155],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 1 (exec)',
    source:
      "class Foo {\n  #client\n\n  constructor(props) {\n    this.#client = 'foo';\n    ;({ x: this.x = this.#client, y: this.#client, z: this.z = this.#client } = props)\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo({ y: 'bar' });\nexpect(foo.getClient()).toBe('bar');\nexpect(foo.x).toBe('foo');\nexpect(foo.z).toBe('bar');\n",
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
        output: expectedOutputs[156],
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
        output: expectedOutputs[157],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 1 (input)',
    source:
      "class Foo {\n  #client\n\n  constructor(props) {\n    this.#client = 'foo';\n    ({ x: this.x = this.#client, y: this.#client, z: this.z = this.#client } = props)\n  }\n}",
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
        output: expectedOutputs[158],
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
        output: expectedOutputs[159],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 2 exec (exec)',
    source:
      "class Foo {\n  #client\n\n  constructor(props) {\n    let x;\n    ;({ x, ...this.#client } = props)\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo({ x: 'foo', y: 'bar', z: 'baz' });\nexpect(foo.getClient()).toEqual({ y: 'bar', z: 'baz' });\n",
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
        output: expectedOutputs[160],
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
        output: expectedOutputs[161],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 2 (input)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ({ x, ...this.#client } = props)\n  }\n}',
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
        output: expectedOutputs[162],
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
        output: expectedOutputs[163],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 3 (exec)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ({ client: this.#client = 5 } = props);\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo({});\nexpect(foo.getClient()).toEqual(5);\n',
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
        output: expectedOutputs[164],
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
        output: expectedOutputs[165],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern 3 (input)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ({ client: this.#client = 5 } = props);\n  }\n}',
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
        output: expectedOutputs[166],
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
        output: expectedOutputs[167],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern static (exec)',
    source:
      "class Foo {\n  static #client\n\n  constructor(props) {\n    ;({ client: Foo.#client } = props)\n  }\n\n  getClient() {\n    return Foo.#client;\n  }\n}\n\nconst foo = new Foo({ client: 'bar' });\nexpect(foo.getClient()).toBe('bar');\n",
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
        output: expectedOutputs[168],
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
        output: expectedOutputs[169],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern static (input)',
    source:
      'class Foo {\n  static #client\n\n  constructor(props) {\n    ({ client: Foo.#client } = props)\n  }\n}\n',
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
        output: expectedOutputs[170],
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
        output: expectedOutputs[171],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern (exec)',
    source:
      "class Foo {\n  #client\n\n  constructor(props) {\n    ;({ client: this.#client } = props)\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo({ client: 'bar' });\nexpect(foo.getClient()).toBe('bar');\n",
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
        output: expectedOutputs[172],
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
        output: expectedOutputs[173],
      },
    ],
  },
  {
    title: 'private loose — destructuring object pattern (input)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ({ client: this.#client } = props)\n  }\n}',
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
        output: expectedOutputs[174],
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
        output: expectedOutputs[175],
      },
    ],
  },
  {
    title: 'private loose — extracted this (input)',
    source:
      'var foo = "bar";\n\nclass Foo {\n  #bar = this;\n  #baz = foo;\n\n  constructor(foo) {\n  }\n}\n',
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
        output: expectedOutputs[176],
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
        output: expectedOutputs[177],
      },
    ],
  },
  {
    title: 'private loose — foobar (input)',
    source:
      'class Child extends Parent {\n  constructor() {\n    super();\n  }\n\n  #scopedFunctionWithThis = () => {\n    this.name = {};\n  }\n}\n',
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
        output: expectedOutputs[178],
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
        output: expectedOutputs[179],
      },
    ],
  },
  {
    title: 'private loose — instance undefined (exec)',
    source:
      'class Foo {\n  #bar;\n\n  test() {\n    return this.#bar;\n  }\n}\n\nexpect(new Foo().test()).toBe(undefined);\n',
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
        output: expectedOutputs[180],
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
        output: expectedOutputs[181],
      },
    ],
  },
  {
    title: 'private loose — instance undefined (input)',
    source: 'class Foo {\n  #bar;\n}\n',
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
        output: expectedOutputs[182],
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
        output: expectedOutputs[183],
      },
    ],
  },
  {
    title: 'private loose — instance (exec)',
    source:
      'class Foo {\n  #bar = "foo";\n\n  test() {\n    return this.#bar;\n  }\n\n  static test(foo) {\n    return foo.#bar;\n  }\n}\n\nconst f = new Foo();\nexpect(f.test()).toBe("foo");\nexpect(Foo.test(f)).toBe("foo");\nexpect("bar" in f).toBe(false);\n',
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
        output: expectedOutputs[184],
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
        output: expectedOutputs[185],
      },
    ],
  },
  {
    title: 'private loose — instance (input)',
    source: 'class Foo {\n  #bar = "foo";\n}\n',
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
        output: expectedOutputs[186],
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
        output: expectedOutputs[187],
      },
    ],
  },
  {
    title: 'private loose — logical assignment (input)',
    source:
      'class Foo {\n  #nullish = 0;\n  #and = 0;\n  #or = 0;\n\n  self() {\n    return this;\n  }\n\n  test() {\n    this.#nullish ??= 42;\n    this.#and &&= 0;\n    this.#or ||= 0;\n\n    this.self().#nullish ??= 42;\n  }\n}\n',
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
        output: expectedOutputs[188],
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
        output: expectedOutputs[189],
      },
    ],
  },
  {
    title: 'private loose — multiple (exec)',
    source:
      'class Foo {\n  #x = 0;\n  #y = this.#x + 1;\n\n  test() {\n    return this.#y;\n  }\n}\n\nconst f = new Foo();\nexpect(f.test()).toBe(1);\n',
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
        output: expectedOutputs[190],
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
        output: expectedOutputs[191],
      },
    ],
  },
  {
    title: 'private loose — multiple (input)',
    source: 'class Foo {\n  #x = 0;\n  #y = this.#x;\n}\n',
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
        output: expectedOutputs[192],
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
        output: expectedOutputs[193],
      },
    ],
  },
  {
    title: 'private loose — native classes (input)',
    source:
      'class Foo {\n  static #foo = "foo";\n  #bar = "bar";\n\n  static test() {\n    return Foo.#foo;\n  }\n\n  test() {\n    return this.#bar;\n  }\n}\n\nconst f = new Foo();\nexpect("foo" in Foo).toBe(false)\nexpect("bar" in f).toBe(false)\nexpect(Foo.test()).toBe("foo")\nexpect(f.test()).toBe("bar")\n',
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
        output: expectedOutputs[194],
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
        output: expectedOutputs[195],
      },
    ],
  },
  {
    title: 'private loose — nested class computed redeclared (exec)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested {\n      #foo = 2;\n\n      [this.#foo]() {\n      }\n    }\n\n    return new Nested();\n  }\n}\n\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).toThrow();\n',
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
        output: expectedOutputs[196],
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
        output: expectedOutputs[197],
      },
    ],
  },
  {
    title: 'private loose — nested class computed redeclared (input)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested {\n      #foo = 2;\n\n      [this.#foo]() {\n      }\n    }\n\n    this.#foo;\n  }\n}\n',
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
        output: expectedOutputs[198],
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
        output: expectedOutputs[199],
      },
    ],
  },
  {
    title: 'private loose — nested class computed (exec)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested {\n      [this.#foo]() {\n      }\n    }\n\n    return new Nested();\n  }\n}\n\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).not.toThrow();\n',
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
        output: expectedOutputs[200],
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
        output: expectedOutputs[201],
      },
    ],
  },
  {
    title: 'private loose — nested class computed (input)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested {\n      [this.#foo]() {\n      }\n    }\n\n    this.#foo;\n  }\n}\n',
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
        output: expectedOutputs[202],
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
        output: expectedOutputs[203],
      },
    ],
  },
  {
    title: 'private loose — nested class extends computed redeclared (exec)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested extends class {\n      #foo = 2;\n\n      [this.#foo] = 2;\n    } {\n      #foo = 3;\n    }\n  }\n}\n\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).toThrow();\n',
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
        output: expectedOutputs[204],
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
        output: expectedOutputs[205],
      },
    ],
  },
  {
    title: 'private loose — nested class extends computed redeclared (input)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested extends class {\n      #foo = 2;\n      [this.#foo] = 2;\n    } {\n      #foo = 3;\n    }\n  }\n}\n',
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
        output: expectedOutputs[206],
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
        output: expectedOutputs[207],
      },
    ],
  },
  {
    title: 'private loose — nested class extends computed (exec)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested extends class {\n      [this.#foo] = 2;\n    } {\n      #foo = 3;\n    }\n\n    return new Nested();\n  }\n}\n\nconst f = new Foo();\nexpect(() => {\n  f.test();\n}).not.toThrow();\n',
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
        output: expectedOutputs[208],
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
        output: expectedOutputs[209],
      },
    ],
  },
  {
    title: 'private loose — nested class extends computed (input)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested extends class {\n      [this.#foo] = 2;\n    } {\n      #foo = 3;\n    }\n  }\n}\n',
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
        output: expectedOutputs[210],
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
        output: expectedOutputs[211],
      },
    ],
  },
  {
    title: 'private loose — nested class other redeclared (input)',
    source:
      'class Foo {\n  #foo = 1;\n  #bar = 1;\n\n  test() {\n    class Nested {\n      #bar = 2;\n\n      test() {\n        this.#foo;\n        this.#bar;\n      }\n    }\n\n    this.#foo;\n    this.#bar;\n  }\n}\n',
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
        output: expectedOutputs[212],
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
        output: expectedOutputs[213],
      },
    ],
  },
  {
    title: 'private loose — nested class redeclared (input)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested {\n      #foo = 2;\n\n      test() {\n        this.#foo;\n      }\n    }\n\n    this.#foo;\n  }\n}\n',
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
        output: expectedOutputs[214],
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
        output: expectedOutputs[215],
      },
    ],
  },
  {
    title: 'private loose — nested class (input)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested {\n      test() {\n        this.#foo;\n      }\n    }\n\n    this.#foo;\n  }\n}\n',
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
        output: expectedOutputs[216],
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
        output: expectedOutputs[217],
      },
    ],
  },
  {
    title: 'private loose — non block arrow func (input)',
    source:
      "export default param =>\n  class App {\n    static #props = {\n      prop1: 'prop1',\n      prop2: 'prop2'\n    }\n\n    getParam() {\n      return param;\n    }\n  }\n",
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
        output: expectedOutputs[218],
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
        output: expectedOutputs[219],
      },
    ],
  },
  {
    title: 'private loose — optional chain before property with transform (exec)',
    source:
      "class Foo {\n  static #x = 1;\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(o?.Foo.#x).toEqual(1);\n    expect(o?.Foo.#x.toString).toEqual(1..toString);\n    expect(o?.Foo.#x.toString()).toEqual('1');\n\n    expect(deep?.very.o?.Foo.#x).toEqual(1);\n    expect(deep?.very.o?.Foo.#x.toString).toEqual(1..toString);\n    expect(deep?.very.o?.Foo.#x.toString()).toEqual('1');\n\n    expect(o?.Foo.#self.#x).toEqual(1);\n    expect(o?.Foo.#self.self.#x).toEqual(1);\n    expect(o?.Foo.#self?.self.#x).toEqual(1);\n    expect(o?.Foo.#self.self?.self.#x).toEqual(1);\n    expect(o?.Foo.#self?.self?.self.#x).toEqual(1);\n\n    expect(o?.Foo.#self.getSelf().#x).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.().#x).toEqual(1);\n    expect(o?.Foo.#self?.getSelf().#x).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.().#x).toEqual(1);\n    expect(o?.Foo.#self.getSelf()?.self.#x).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.()?.self.#x).toEqual(1);\n    expect(o?.Foo.#self?.getSelf()?.self.#x).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.()?.self.#x).toEqual(1);\n\n    expect(fn?.().Foo.#x).toEqual(1);\n    expect(fn?.().Foo.#x.toString).toEqual(1..toString);\n    expect(fn?.().Foo.#x.toString()).toEqual('1');\n\n    expect(fnDeep?.().very.o?.Foo.#x).toEqual(1);\n    expect(fnDeep?.().very.o?.Foo.#x.toString).toEqual(1..toString);\n    expect(fnDeep?.().very.o?.Foo.#x.toString()).toEqual('1');\n\n    expect(fn?.().Foo.#self.#x).toEqual(1);\n    expect(fn?.().Foo.#self.self.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.self.#x).toEqual(1);\n    expect(fn?.().Foo.#self.self?.self.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.self?.self.#x).toEqual(1);\n\n    expect(fn?.().Foo.#self.getSelf().#x).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.().#x).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf().#x).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.().#x).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf()?.self.#x).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.()?.self.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf()?.self.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self.#x).toEqual(1);\n  }\n\n  static testNull() {\n    const o = null;;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(o?.Foo.#x).toEqual(undefined);\n    expect(o?.Foo.#x.toString).toEqual(undefined);\n    expect(o?.Foo.#x.toString()).toEqual(undefined);\n\n    expect(deep?.very.o?.Foo.#x).toEqual(undefined);\n    expect(deep?.very.o?.Foo.#x.toString).toEqual(undefined);\n    expect(deep?.very.o?.Foo.#x.toString()).toEqual(undefined);\n\n    expect(o?.Foo.#self.#x).toEqual(undefined);\n    expect(o?.Foo.#self.self.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.self.#x).toEqual(undefined);\n    expect(o?.Foo.#self.self?.self.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.self?.self.#x).toEqual(undefined);\n\n    expect(o?.Foo.#self.getSelf().#x).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.().#x).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf().#x).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.().#x).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf()?.self.#x).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.()?.self.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf()?.self.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.()?.self.#x).toEqual(undefined);\n\n    expect(fn?.().Foo.#x).toEqual(undefined);\n    expect(fn?.().Foo.#x.toString).toEqual(undefined);\n    expect(fn?.().Foo.#x.toString()).toEqual(undefined);\n\n    expect(fnDeep?.().very.o?.Foo.#x).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo.#x.toString).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo.#x.toString()).toEqual(undefined);\n\n    expect(fn?.().Foo.#self.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.self.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.self?.self.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self?.self.#x).toEqual(undefined);\n\n    expect(fn?.().Foo.#self.getSelf().#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.().#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf().#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.().#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf()?.self.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.()?.self.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf()?.self.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self.#x).toEqual(undefined);\n  }\n}\n\nFoo.test();\nFoo.testNull();\n",
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
        output: expectedOutputs[220],
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
        output: expectedOutputs[221],
      },
    ],
  },
  {
    title: 'private loose — optional chain before property with transform (input)',
    source:
      'class Foo {\n  static #x = 1;\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    o?.Foo.#x;\n    o?.Foo.#x.toString;\n    o?.Foo.#x.toString();\n\n    deep?.very.o?.Foo.#x;\n    deep?.very.o?.Foo.#x.toString;\n    deep?.very.o?.Foo.#x.toString();\n\n    o?.Foo.#self.#x;\n    o?.Foo.#self.self.#x;\n    o?.Foo.#self?.self.#x;\n    o?.Foo.#self.self?.self.#x;\n    o?.Foo.#self?.self?.self.#x;\n\n    o?.Foo.#self.getSelf().#x;\n    o?.Foo.#self.getSelf?.().#x;\n    o?.Foo.#self?.getSelf().#x;\n    o?.Foo.#self?.getSelf?.().#x;\n    o?.Foo.#self.getSelf()?.self.#x;\n    o?.Foo.#self.getSelf?.()?.self.#x;\n    o?.Foo.#self?.getSelf()?.self.#x;\n    o?.Foo.#self?.getSelf?.()?.self.#x;\n\n    fn?.().Foo.#x;\n    fn?.().Foo.#x.toString;\n    fn?.().Foo.#x.toString();\n\n    fnDeep?.().very.o?.Foo.#x;\n    fnDeep?.().very.o?.Foo.#x.toString;\n    fnDeep?.().very.o?.Foo.#x.toString();\n\n    fn?.().Foo.#self.#x;\n    fn?.().Foo.#self.self.#x;\n    fn?.().Foo.#self?.self.#x;\n    fn?.().Foo.#self.self?.self.#x;\n    fn?.().Foo.#self?.self?.self.#x;\n\n    fn?.().Foo.#self.getSelf().#x;\n    fn?.().Foo.#self.getSelf?.().#x;\n    fn?.().Foo.#self?.getSelf().#x;\n    fn?.().Foo.#self?.getSelf?.().#x;\n    fn?.().Foo.#self.getSelf()?.self.#x;\n    fn?.().Foo.#self.getSelf?.()?.self.#x;\n    fn?.().Foo.#self?.getSelf()?.self.#x;\n    fn?.().Foo.#self?.getSelf?.()?.self.#x;\n  }\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[222],
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
        output: expectedOutputs[223],
      },
    ],
  },
  {
    title: 'private loose — optional chain delete property with transform (exec)',
    source:
      'class Foo {\n  static #x = 1;\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n    expect(() => delete Foo?.#self.unicorn).toThrow(TypeError);\n    expect(() => delete deep?.very.o?.Foo.#self.unicorn).toThrow(TypeError);\n\n    expect(() => delete o?.Foo.#self.unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self.self.unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self?.self.unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self.self?.self.unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self?.self?.self.unicorn).toThrow(TypeError);\n\n    expect(() => delete o?.Foo.#self.getSelf().unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self.getSelf?.().unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self?.getSelf().unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self?.getSelf?.().unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self.getSelf()?.self.unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self.getSelf?.()?.self.unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self?.getSelf()?.self.unicorn).toThrow(TypeError);\n    expect(() => delete o?.Foo.#self?.getSelf?.()?.self.unicorn).toThrow(TypeError);\n\n    expect(() => delete fn?.().Foo.#self.unicorn).toThrow(TypeError);\n    expect(() => delete fnDeep?.().very.o?.Foo.#self.unicorn).toThrow(TypeError);\n\n    expect(() => delete fn?.().Foo.#self.unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self.self.unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self?.self.unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self.self?.self.unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self?.self?.self.unicorn).toThrow(TypeError);\n\n    expect(() => delete fn?.().Foo.#self.getSelf().unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self.getSelf?.().unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self?.getSelf().unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self?.getSelf?.().unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self.getSelf()?.self.unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self.getSelf?.()?.self.unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self?.getSelf()?.self.unicorn).toThrow(TypeError);\n    expect(() => delete fn?.().Foo.#self?.getSelf?.()?.self.unicorn).toThrow(TypeError);\n\n\n  }\n\n  static testNull() {\n    const o = null;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(delete deep?.very.o?.Foo.#self.unicorn).toBe(true);\n\n    expect(delete o?.Foo.#self.unicorn).toBe(true);\n    expect(delete o?.Foo.#self.self.unicorn).toBe(true);\n    expect(delete o?.Foo.#self?.self.unicorn).toBe(true);\n    expect(delete o?.Foo.#self.self?.self.unicorn).toBe(true);\n    expect(delete o?.Foo.#self?.self?.self.unicorn).toBe(true);\n\n    expect(delete o?.Foo.#self.getSelf().unicorn).toBe(true);\n    expect(delete o?.Foo.#self.getSelf?.().unicorn).toBe(true);\n    expect(delete o?.Foo.#self?.getSelf().unicorn).toBe(true);\n    expect(delete o?.Foo.#self?.getSelf?.().unicorn).toBe(true);\n    expect(delete o?.Foo.#self.getSelf()?.self.unicorn).toBe(true);\n    expect(delete o?.Foo.#self.getSelf?.()?.self.unicorn).toBe(true);\n    expect(delete o?.Foo.#self?.getSelf()?.self.unicorn).toBe(true);\n    expect(delete o?.Foo.#self?.getSelf?.()?.self.unicorn).toBe(true);\n\n    expect(delete fn?.().Foo.#self.unicorn).toBe(true);\n    expect(delete fnDeep?.().very.o?.Foo.#self.unicorn).toBe(true);\n\n    expect(delete fn?.().Foo.#self.unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self.self.unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self?.self.unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self.self?.self.unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self?.self?.self.unicorn).toBe(true);\n\n    expect(delete fn?.().Foo.#self.getSelf().unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self.getSelf?.().unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self?.getSelf().unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self?.getSelf?.().unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self.getSelf()?.self.unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self.getSelf?.()?.self.unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self?.getSelf()?.self.unicorn).toBe(true);\n    expect(delete fn?.().Foo.#self?.getSelf?.()?.self.unicorn).toBe(true);\n  }\n}\n\nObject.defineProperty(Foo, "unicorn", { configurable: false });\nFoo.test();\nFoo.testNull();\n',
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
        output: expectedOutputs[224],
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
        output: expectedOutputs[225],
      },
    ],
  },
  {
    title: 'private loose — optional chain delete property with transform (input)',
    source:
      'class Foo {\n  static #x = 1;\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    delete Foo?.#self.unicorn;\n    delete deep?.very.o?.Foo.#self.unicorn;\n\n    delete o?.Foo.#self.unicorn;\n    delete o?.Foo.#self.self.unicorn;\n    delete o?.Foo.#self?.self.unicorn;\n    delete o?.Foo.#self.self?.self.unicorn;\n    delete o?.Foo.#self?.self?.self.unicorn;\n\n    delete o?.Foo.#self.getSelf().unicorn;\n    delete o?.Foo.#self.getSelf?.().unicorn;\n    delete o?.Foo.#self?.getSelf().unicorn;\n    delete o?.Foo.#self?.getSelf?.().unicorn;\n    delete o?.Foo.#self.getSelf()?.self.unicorn;\n    delete o?.Foo.#self.getSelf?.()?.self.unicorn;\n    delete o?.Foo.#self?.getSelf()?.self.unicorn;\n    delete o?.Foo.#self?.getSelf?.()?.self.unicorn;\n\n    delete fn?.().Foo.#self.unicorn;\n    delete fnDeep?.().very.o?.Foo.#self.unicorn;\n\n    delete fn?.().Foo.#self.unicorn;\n    delete fn?.().Foo.#self.self.unicorn;\n    delete fn?.().Foo.#self?.self.unicorn;\n    delete fn?.().Foo.#self.self?.self.unicorn;\n    delete fn?.().Foo.#self?.self?.self.unicorn;\n\n    delete fn?.().Foo.#self.getSelf().unicorn;\n    delete fn?.().Foo.#self.getSelf?.().unicorn;\n    delete fn?.().Foo.#self?.getSelf().unicorn;\n    delete fn?.().Foo.#self?.getSelf?.().unicorn;\n    delete fn?.().Foo.#self.getSelf()?.self.unicorn;\n    delete fn?.().Foo.#self.getSelf?.()?.self.unicorn;\n    delete fn?.().Foo.#self?.getSelf()?.self.unicorn;\n    delete fn?.().Foo.#self?.getSelf?.()?.self.unicorn;\n\n  }\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[226],
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
        output: expectedOutputs[227],
      },
    ],
  },
  {
    title: 'private loose — optional chain in function param with transform (exec)',
    source:
      'class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    function f(o, r = o?.Foo.#m()) {\n      return r;\n    }\n\n    function g(o, r = o?.Foo.#self.getSelf().#m()) {\n      return r;\n    }\n\n    function h(fnDeep, r = fnDeep?.().very.o?.Foo?.#m()) {\n      return r;\n    }\n\n    function i(fn, r = fn?.().Foo.#self?.getSelf()?.self.#m()) {\n      return r;\n    }\n\n    function j(fn, r = (fn().Foo.#self.getSelf().self.#m)?.()) {\n      return r;\n    }\n\n    expect(f(o)).toBe(1);\n    expect(g(o)).toBe(1);\n    expect(h(fnDeep)).toBe(1);\n    expect(i(fn)).toBe(1);\n    expect(j(fn)).toBe(1);\n  }\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[228],
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
        output: expectedOutputs[229],
      },
    ],
  },
  {
    title: 'private loose — optional chain in function param with transform (input)',
    source:
      'class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    function f(o, r = o?.Foo.#m()) {\n      return r;\n    }\n\n    function g(o, r = o?.Foo.#self.getSelf().#m?.()) {\n      return r;\n    }\n\n    function h(fnDeep, r = fnDeep?.().very.o?.Foo?.#m()) {\n      return r;\n    }\n\n    function i(fn, r = fn?.().Foo.#self?.getSelf()?.self.#m()) {\n      return r;\n    }\n\n    function j(fn, r = (fn().Foo.#self.getSelf().self.#m)?.()) {\n      return r;\n    }\n\n    f(o);\n    g(o);\n    h(fnDeep);\n    i(fn);\n    j(fn);\n  }\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[230],
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
        output: expectedOutputs[231],
      },
    ],
  },
  {
    title: 'private loose — optional chain member optional call spread arguments (exec)',
    source:
      'class Foo {\n  #m;\n  init() {\n    this.#m = (...args) => args;\n  }\n  static test() {\n    const f = new Foo();\n    f.init();\n    return f.#m?.(...arguments);\n  }\n\n  static testNull() {\n    const f = new Foo();\n    return f.#m?.(...arguments);\n  }\n}\n\nexpect(Foo.test(1, 2)).toEqual([1, 2]);\nexpect(Foo.testNull(1, 2)).toBe(undefined);\n',
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
        output: expectedOutputs[232],
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
        output: expectedOutputs[233],
      },
    ],
  },
  {
    title: 'private loose — optional chain member optional call spread arguments (input)',
    source:
      'class Foo {\n  #m;\n  init() {\n    this.#m = (...args) => args;\n  }\n  static test() {\n    const f = new Foo();\n    f.init();\n    return f.#m?.(...arguments);\n  }\n\n  static testNull() {\n    const f = new Foo();\n    return f.#m?.(...arguments);\n  }\n}\n',
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
        output: expectedOutputs[234],
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
        output: expectedOutputs[235],
      },
    ],
  },
  {
    title: 'private loose — optional chain member optional call with transform (exec)',
    source:
      "class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(Foo.#m?.()).toEqual(1);\n    expect(Foo.#m?.().toString).toEqual(1..toString);\n    expect(Foo.#m?.().toString()).toEqual('1');\n\n    expect(o?.Foo.#m?.()).toEqual(1);\n    expect(o?.Foo.#m?.().toString).toEqual(1..toString);\n    expect(o?.Foo.#m?.().toString()).toEqual('1');\n\n    expect(deep?.very.o?.Foo.#m?.()).toEqual(1);\n    expect(deep?.very.o?.Foo.#m?.().toString).toEqual(1..toString);\n    expect(deep?.very.o?.Foo.#m?.().toString()).toEqual('1');\n\n    expect(o?.Foo.#self.#m?.()).toEqual(1);\n    expect(o?.Foo.#self.self.#m?.()).toEqual(1);\n    expect(o?.Foo.#self?.self.#m?.()).toEqual(1);\n    expect(o?.Foo.#self.self?.self.#m?.()).toEqual(1);\n    expect(o?.Foo.#self?.self?.self.#m?.()).toEqual(1);\n\n    expect(o?.Foo.#self.getSelf().#m?.()).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.().#m?.()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf().#m?.()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.().#m?.()).toEqual(1);\n    expect(o?.Foo.#self.getSelf()?.self.#m?.()).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.()?.self.#m?.()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf()?.self.#m?.()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.()?.self.#m?.()).toEqual(1);\n\n    expect(fn?.().Foo.#m?.()).toEqual(1);\n    expect(fn?.().Foo.#m?.().toString).toEqual(1..toString);\n    expect(fn?.().Foo.#m?.().toString()).toEqual('1');\n\n    expect(fnDeep?.().very.o?.Foo.#m?.()).toEqual(1);\n    expect(fnDeep?.().very.o?.Foo.#m?.().toString).toEqual(1..toString);\n    expect(fnDeep?.().very.o?.Foo.#m?.().toString()).toEqual('1');\n\n    expect(fn?.().Foo.#self.#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self.self.#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self?.self.#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self.self?.self.#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self?.self?.self.#m?.()).toEqual(1);\n\n    expect(fn?.().Foo.#self.getSelf().#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.().#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf().#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.().#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf()?.self.#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.()?.self.#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf()?.self.#m?.()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self.#m?.()).toEqual(1);\n  }\n\n  static testNull() {\n    const o = null;;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(o?.Foo.#m?.()).toEqual(undefined);\n    expect(o?.Foo.#m?.().toString).toEqual(undefined);\n    expect(o?.Foo.#m?.().toString()).toEqual(undefined);\n\n    expect(deep?.very.o?.Foo.#m?.()).toEqual(undefined);\n    expect(deep?.very.o?.Foo.#m?.().toString).toEqual(undefined);\n    expect(deep?.very.o?.Foo.#m?.().toString()).toEqual(undefined);\n\n    expect(o?.Foo.#self.#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self.self.#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self?.self.#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self.self?.self.#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self?.self?.self.#m?.()).toEqual(undefined);\n\n    expect(o?.Foo.#self.getSelf().#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.().#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf().#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.().#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf()?.self.#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.()?.self.#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf()?.self.#m?.()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.()?.self.#m?.()).toEqual(undefined);\n\n    expect(fn?.().Foo.#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#m?.().toString).toEqual(undefined);\n    expect(fn?.().Foo.#m?.().toString()).toEqual(undefined);\n\n    expect(fnDeep?.().very.o?.Foo.#m?.()).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo.#m?.().toString).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo.#m?.().toString()).toEqual(undefined);\n\n    expect(fn?.().Foo.#self.#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self.self.#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self.#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self.self?.self.#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self?.self.#m?.()).toEqual(undefined);\n\n    expect(fn?.().Foo.#self.getSelf().#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.().#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf().#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.().#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf()?.self.#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.()?.self.#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf()?.self.#m?.()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self.#m?.()).toEqual(undefined);\n  }\n}\n\nFoo.test();\nFoo.testNull();\n",
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
        output: expectedOutputs[236],
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
        output: expectedOutputs[237],
      },
    ],
  },
  {
    title: 'private loose — optional chain member optional call with transform (input)',
    source:
      'class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    Foo.#m?.();\n    Foo.#m?.().toString;\n    Foo.#m?.().toString();\n\n    o?.Foo.#m?.();\n    o?.Foo.#m?.().toString;\n    o?.Foo.#m?.().toString();\n\n    deep?.very.o?.Foo.#m?.();\n    deep?.very.o?.Foo.#m?.().toString;\n    deep?.very.o?.Foo.#m?.().toString();\n\n    o?.Foo.#self.#m?.();\n    o?.Foo.#self.self.#m?.();\n    o?.Foo.#self?.self.#m?.();\n    o?.Foo.#self.self?.self.#m?.();\n    o?.Foo.#self?.self?.self.#m?.();\n\n    o?.Foo.#self.getSelf().#m?.();\n    o?.Foo.#self.getSelf?.().#m?.();\n    o?.Foo.#self?.getSelf().#m?.();\n    o?.Foo.#self?.getSelf?.().#m?.();\n    o?.Foo.#self.getSelf()?.self.#m?.();\n    o?.Foo.#self.getSelf?.()?.self.#m?.();\n    o?.Foo.#self?.getSelf()?.self.#m?.();\n    o?.Foo.#self?.getSelf?.()?.self.#m?.();\n\n    fn?.().Foo.#m?.();\n    fn?.().Foo.#m?.().toString;\n    fn?.().Foo.#m?.().toString();\n\n    fnDeep?.().very.o?.Foo.#m?.();\n    fnDeep?.().very.o?.Foo.#m?.().toString;\n    fnDeep?.().very.o?.Foo.#m?.().toString();\n\n    fn?.().Foo.#self.#m?.();\n    fn?.().Foo.#self.self.#m?.();\n    fn?.().Foo.#self?.self.#m?.();\n    fn?.().Foo.#self.self?.self.#m?.();\n    fn?.().Foo.#self?.self?.self.#m?.();\n\n    fn?.().Foo.#self.getSelf().#m?.();\n    fn?.().Foo.#self.getSelf?.().#m?.();\n    fn?.().Foo.#self?.getSelf().#m?.();\n    fn?.().Foo.#self?.getSelf?.().#m?.();\n    fn?.().Foo.#self.getSelf()?.self.#m?.();\n    fn?.().Foo.#self.getSelf?.()?.self.#m?.();\n    fn?.().Foo.#self?.getSelf()?.self.#m?.();\n    fn?.().Foo.#self?.getSelf?.()?.self.#m?.();\n  }\n\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[238],
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
        output: expectedOutputs[239],
      },
    ],
  },
  {
    title: 'private loose — optional chain optional member call with transform (exec)',
    source:
      "class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(Foo?.#m()).toEqual(1);\n    expect(Foo?.#m().toString).toEqual(1..toString);\n    expect(Foo?.#m().toString()).toEqual('1');\n\n    expect(o?.Foo?.#m()).toEqual(1);\n    expect(o?.Foo?.#m().toString).toEqual(1..toString);\n    expect(o?.Foo?.#m().toString()).toEqual('1');\n\n    expect(deep?.very.o?.Foo?.#m()).toEqual(1);\n    expect(deep?.very.o?.Foo?.#m().toString).toEqual(1..toString);\n    expect(deep?.very.o?.Foo?.#m().toString()).toEqual('1');\n\n    expect(o?.Foo.#self?.#m()).toEqual(1);\n    expect(o?.Foo.#self.self?.#m()).toEqual(1);\n    expect(o?.Foo.#self?.self?.#m()).toEqual(1);\n    expect(o?.Foo.#self.self?.self?.#m()).toEqual(1);\n    expect(o?.Foo.#self?.self?.self?.#m()).toEqual(1);\n\n    expect(o?.Foo.#self.getSelf()?.#m()).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.()?.#m()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf()?.#m()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.()?.#m()).toEqual(1);\n    expect(o?.Foo.#self.getSelf()?.self?.#m()).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.()?.self?.#m()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf()?.self?.#m()).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.()?.self?.#m()).toEqual(1);\n\n    expect(fn?.().Foo?.#m()).toEqual(1);\n    expect(fn?.().Foo?.#m().toString).toEqual(1..toString);\n    expect(fn?.().Foo?.#m().toString()).toEqual('1');\n\n    expect(fnDeep?.().very.o?.Foo?.#m()).toEqual(1);\n    expect(fnDeep?.().very.o?.Foo?.#m().toString).toEqual(1..toString);\n    expect(fnDeep?.().very.o?.Foo?.#m().toString()).toEqual('1');\n\n    expect(fn?.().Foo.#self?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self.self?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.self?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self.self?.self?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.self?.self?.#m()).toEqual(1);\n\n    expect(fn?.().Foo.#self.getSelf()?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.()?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf()?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.()?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf()?.self?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.()?.self?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf()?.self?.#m()).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self?.#m()).toEqual(1);\n  }\n\n  static testNull() {\n    const o = null;;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(o?.Foo?.#m()).toEqual(undefined);\n    expect(o?.Foo?.#m().toString).toEqual(undefined);\n    expect(o?.Foo?.#m().toString()).toEqual(undefined);\n\n    expect(deep?.very.o?.Foo?.#m()).toEqual(undefined);\n    expect(deep?.very.o?.Foo?.#m().toString).toEqual(undefined);\n    expect(deep?.very.o?.Foo?.#m().toString()).toEqual(undefined);\n\n    expect(o?.Foo.#self?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self.self?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.self?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self.self?.self?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.self?.self?.#m()).toEqual(undefined);\n\n    expect(o?.Foo.#self.getSelf()?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.()?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf()?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.()?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf()?.self?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.()?.self?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf()?.self?.#m()).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.()?.self?.#m()).toEqual(undefined);\n\n    expect(fn?.().Foo?.#m()).toEqual(undefined);\n    expect(fn?.().Foo?.#m().toString).toEqual(undefined);\n    expect(fn?.().Foo?.#m().toString()).toEqual(undefined);\n\n    expect(fnDeep?.().very.o?.Foo?.#m()).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo?.#m().toString).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo?.#m().toString()).toEqual(undefined);\n\n    expect(fn?.().Foo.#self?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.self?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.self?.self?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self?.self?.#m()).toEqual(undefined);\n\n    expect(fn?.().Foo.#self.getSelf()?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.()?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf()?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.()?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf()?.self?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.()?.self?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf()?.self?.#m()).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self?.#m()).toEqual(undefined);\n  }\n}\n\nFoo.test();\nFoo.testNull();\n",
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
        output: expectedOutputs[240],
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
        output: expectedOutputs[241],
      },
    ],
  },
  {
    title: 'private loose — optional chain optional member call with transform (input)',
    source:
      'class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    Foo?.#m();\n    Foo?.#m().toString;\n    Foo?.#m().toString();\n\n    o?.Foo?.#m();\n    o?.Foo?.#m().toString;\n    o?.Foo?.#m().toString();\n\n    deep?.very.o?.Foo?.#m();\n    deep?.very.o?.Foo?.#m().toString;\n    deep?.very.o?.Foo?.#m().toString();\n\n    o?.Foo.#self?.#m();\n    o?.Foo.#self.self?.#m();\n    o?.Foo.#self?.self?.#m();\n    o?.Foo.#self.self?.self?.#m();\n    o?.Foo.#self?.self?.self?.#m();\n\n    o?.Foo.#self.getSelf()?.#m();\n    o?.Foo.#self.getSelf?.()?.#m();\n    o?.Foo.#self?.getSelf()?.#m();\n    o?.Foo.#self?.getSelf?.()?.#m();\n    o?.Foo.#self.getSelf()?.self?.#m();\n    o?.Foo.#self.getSelf?.()?.self?.#m();\n    o?.Foo.#self?.getSelf()?.self?.#m();\n    o?.Foo.#self?.getSelf?.()?.self?.#m();\n\n    fn?.().Foo?.#m();\n    fn?.().Foo?.#m().toString;\n    fn?.().Foo?.#m().toString();\n\n    fnDeep?.().very.o?.Foo?.#m();\n    fnDeep?.().very.o?.Foo?.#m().toString;\n    fnDeep?.().very.o?.Foo?.#m().toString();\n\n    fn?.().Foo.#self?.#m();\n    fn?.().Foo.#self.self?.#m();\n    fn?.().Foo.#self?.self?.#m();\n    fn?.().Foo.#self.self?.self?.#m();\n    fn?.().Foo.#self?.self?.self?.#m();\n\n    fn?.().Foo.#self.getSelf()?.#m();\n    fn?.().Foo.#self.getSelf?.()?.#m();\n    fn?.().Foo.#self?.getSelf()?.#m();\n    fn?.().Foo.#self?.getSelf?.()?.#m();\n    fn?.().Foo.#self.getSelf()?.self?.#m();\n    fn?.().Foo.#self.getSelf?.()?.self?.#m();\n    fn?.().Foo.#self?.getSelf()?.self?.#m();\n    fn?.().Foo.#self?.getSelf?.()?.self?.#m();\n  }\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[242],
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
        output: expectedOutputs[243],
      },
    ],
  },
  {
    title: 'private loose — optional chain optional member call (input)',
    source:
      'class Foo {\n  static #x = 1;\n  static #m = function() { return this.#x; };\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    Foo?.#m();\n    Foo?.#m().toString;\n    Foo?.#m().toString();\n\n    o?.Foo.#m();\n    o?.Foo.#m().toString;\n    o?.Foo.#m().toString();\n\n    deep?.very.o?.Foo.#m();\n    deep?.very.o?.Foo.#m().toString;\n    deep?.very.o?.Foo.#m().toString();\n\n    o?.Foo.#self.#m();\n    o?.Foo.#self.self.#m();\n    o?.Foo.#self?.self.#m();\n    o?.Foo.#self.self?.self.#m();\n    o?.Foo.#self?.self?.self.#m();\n\n    o?.Foo.#self.getSelf().#m();\n    o?.Foo.#self.getSelf?.().#m();\n    o?.Foo.#self?.getSelf().#m();\n    o?.Foo.#self?.getSelf?.().#m();\n    o?.Foo.#self.getSelf()?.self.#m();\n    o?.Foo.#self.getSelf?.()?.self.#m();\n    o?.Foo.#self?.getSelf()?.self.#m();\n    o?.Foo.#self?.getSelf?.()?.self.#m();\n\n    fn?.().Foo.#m();\n    fn?.().Foo.#m().toString;\n    fn?.().Foo.#m().toString();\n\n    fnDeep?.().very.o?.Foo.#m();\n    fnDeep?.().very.o?.Foo.#m().toString;\n    fnDeep?.().very.o?.Foo.#m().toString();\n\n    fn?.().Foo.#self.#m();\n    fn?.().Foo.#self.self.#m();\n    fn?.().Foo.#self?.self.#m();\n    fn?.().Foo.#self.self?.self.#m();\n    fn?.().Foo.#self?.self?.self.#m();\n\n    fn?.().Foo.#self.getSelf().#m();\n    fn?.().Foo.#self.getSelf?.().#m();\n    fn?.().Foo.#self?.getSelf().#m();\n    fn?.().Foo.#self?.getSelf?.().#m();\n    fn?.().Foo.#self.getSelf()?.self.#m();\n    fn?.().Foo.#self.getSelf?.()?.self.#m();\n    fn?.().Foo.#self?.getSelf()?.self.#m();\n    fn?.().Foo.#self?.getSelf?.()?.self.#m();\n  }\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[244],
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
        output: expectedOutputs[245],
      },
    ],
  },
  {
    title: 'private loose — optional chain optional property with transform (exec)',
    source:
      "class Foo {\n  static #x = 1;\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(Foo?.#x).toEqual(1);\n    expect(Foo?.#x.toString).toEqual(1..toString);\n    expect(Foo?.#x.toString()).toEqual('1');\n\n    expect(o?.Foo?.#x).toEqual(1);\n    expect(o?.Foo?.#x.toString).toEqual(1..toString);\n    expect(o?.Foo?.#x.toString()).toEqual('1');\n\n    expect(deep?.very.o?.Foo?.#x).toEqual(1);\n    expect(deep?.very.o?.Foo?.#x.toString).toEqual(1..toString);\n    expect(deep?.very.o?.Foo?.#x.toString()).toEqual('1');\n\n    expect(o?.Foo.#self?.#x).toEqual(1);\n    expect(o?.Foo.#self.self?.#x).toEqual(1);\n    expect(o?.Foo.#self?.self?.#x).toEqual(1);\n    expect(o?.Foo.#self.self?.self?.#x).toEqual(1);\n    expect(o?.Foo.#self?.self?.self?.#x).toEqual(1);\n\n    expect(o?.Foo.#self.getSelf()?.#x).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.()?.#x).toEqual(1);\n    expect(o?.Foo.#self?.getSelf()?.#x).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.()?.#x).toEqual(1);\n    expect(o?.Foo.#self.getSelf()?.self?.#x).toEqual(1);\n    expect(o?.Foo.#self.getSelf?.()?.self?.#x).toEqual(1);\n    expect(o?.Foo.#self?.getSelf()?.self?.#x).toEqual(1);\n    expect(o?.Foo.#self?.getSelf?.()?.self?.#x).toEqual(1);\n\n    expect(fn?.().Foo?.#x).toEqual(1);\n    expect(fn?.().Foo?.#x.toString).toEqual(1..toString);\n    expect(fn?.().Foo?.#x.toString()).toEqual('1');\n\n    expect(fnDeep?.().very.o?.Foo?.#x).toEqual(1);\n    expect(fnDeep?.().very.o?.Foo?.#x.toString).toEqual(1..toString);\n    expect(fnDeep?.().very.o?.Foo?.#x.toString()).toEqual('1');\n\n    expect(fn?.().Foo.#self?.#x).toEqual(1);\n    expect(fn?.().Foo.#self.self?.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.self?.#x).toEqual(1);\n    expect(fn?.().Foo.#self.self?.self?.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.self?.self?.#x).toEqual(1);\n\n    expect(fn?.().Foo.#self.getSelf()?.#x).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.()?.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf()?.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.()?.#x).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf()?.self?.#x).toEqual(1);\n    expect(fn?.().Foo.#self.getSelf?.()?.self?.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf()?.self?.#x).toEqual(1);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self?.#x).toEqual(1);\n  }\n\n  static testNull() {\n    const o = null;;\n    const deep = { very: { o } };\n    const fn = null;\n    function fnDeep() {\n      return deep;\n    }\n\n    expect(o?.Foo?.#x).toEqual(undefined);\n    expect(o?.Foo?.#x.toString).toEqual(undefined);\n    expect(o?.Foo?.#x.toString()).toEqual(undefined);\n\n    expect(deep?.very.o?.Foo?.#x).toEqual(undefined);\n    expect(deep?.very.o?.Foo?.#x.toString).toEqual(undefined);\n    expect(deep?.very.o?.Foo?.#x.toString()).toEqual(undefined);\n\n    expect(o?.Foo.#self?.#x).toEqual(undefined);\n    expect(o?.Foo.#self.self?.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.self?.#x).toEqual(undefined);\n    expect(o?.Foo.#self.self?.self?.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.self?.self?.#x).toEqual(undefined);\n\n    expect(o?.Foo.#self.getSelf()?.#x).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.()?.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf()?.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.()?.#x).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf()?.self?.#x).toEqual(undefined);\n    expect(o?.Foo.#self.getSelf?.()?.self?.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf()?.self?.#x).toEqual(undefined);\n    expect(o?.Foo.#self?.getSelf?.()?.self?.#x).toEqual(undefined);\n\n    expect(fn?.().Foo?.#x).toEqual(undefined);\n    expect(fn?.().Foo?.#x.toString).toEqual(undefined);\n    expect(fn?.().Foo?.#x.toString()).toEqual(undefined);\n\n    expect(fnDeep?.().very.o?.Foo?.#x).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo?.#x.toString).toEqual(undefined);\n    expect(fnDeep?.().very.o?.Foo?.#x.toString()).toEqual(undefined);\n\n    expect(fn?.().Foo.#self?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.self?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.self?.self?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.self?.self?.#x).toEqual(undefined);\n\n    expect(fn?.().Foo.#self.getSelf()?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.()?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf()?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.()?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf()?.self?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self.getSelf?.()?.self?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf()?.self?.#x).toEqual(undefined);\n    expect(fn?.().Foo.#self?.getSelf?.()?.self?.#x).toEqual(undefined);\n  }\n}\n\nFoo.test();\nFoo.testNull();\n",
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
        output: expectedOutputs[246],
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
        output: expectedOutputs[247],
      },
    ],
  },
  {
    title: 'private loose — optional chain optional property with transform (input)',
    source:
      'class Foo {\n  static #x = 1;\n  static #self = Foo;\n  static self = Foo;\n  static getSelf() { return this }\n\n  static test() {\n    const o = { Foo: Foo };\n    const deep = { very: { o } };\n    function fn() {\n      return o;\n    }\n    function fnDeep() {\n      return deep;\n    }\n\n    Foo?.#x;\n    Foo?.#x.toString;\n    Foo?.#x.toString();\n\n    o?.Foo?.#x;\n    o?.Foo?.#x.toString;\n    o?.Foo?.#x.toString();\n\n    deep?.very.o?.Foo?.#x;\n    deep?.very.o?.Foo?.#x.toString;\n    deep?.very.o?.Foo?.#x.toString();\n\n    o?.Foo.#self?.#x;\n    o?.Foo.#self.self?.#x;\n    o?.Foo.#self?.self?.#x;\n    o?.Foo.#self.self?.self?.#x;\n    o?.Foo.#self?.self?.self?.#x;\n\n    o?.Foo.#self.getSelf()?.#x;\n    o?.Foo.#self.getSelf?.()?.#x;\n    o?.Foo.#self?.getSelf()?.#x;\n    o?.Foo.#self?.getSelf?.()?.#x;\n    o?.Foo.#self.getSelf()?.self?.#x;\n    o?.Foo.#self.getSelf?.()?.self?.#x;\n    o?.Foo.#self?.getSelf()?.self?.#x;\n    o?.Foo.#self?.getSelf?.()?.self?.#x;\n\n    fn?.().Foo?.#x;\n    fn?.().Foo?.#x.toString;\n    fn?.().Foo?.#x.toString();\n\n    fnDeep?.().very.o?.Foo?.#x;\n    fnDeep?.().very.o?.Foo?.#x.toString;\n    fnDeep?.().very.o?.Foo?.#x.toString();\n\n    fn?.().Foo.#self?.#x;\n    fn?.().Foo.#self.self?.#x;\n    fn?.().Foo.#self?.self?.#x;\n    fn?.().Foo.#self.self?.self?.#x;\n    fn?.().Foo.#self?.self?.self?.#x;\n\n    fn?.().Foo.#self.getSelf()?.#x;\n    fn?.().Foo.#self.getSelf?.()?.#x;\n    fn?.().Foo.#self?.getSelf()?.#x;\n    fn?.().Foo.#self?.getSelf?.()?.#x;\n    fn?.().Foo.#self.getSelf()?.self?.#x;\n    fn?.().Foo.#self.getSelf?.()?.self?.#x;\n    fn?.().Foo.#self?.getSelf()?.self?.#x;\n    fn?.().Foo.#self?.getSelf?.()?.self?.#x;\n  }\n}\n\nFoo.test();\n',
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
        output: expectedOutputs[248],
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
        output: expectedOutputs[249],
      },
    ],
  },
  {
    title: 'private loose — parenthesized optional member call with transform (exec)',
    source:
      "class Foo {\n  static #x = 1;\n\n  static self = Foo;\n  static #m = function() { return this.#x; };\n  static getSelf() { return Foo }\n\n  test() {\n    const o = { Foo: Foo };\n    const fn = function () {\n      return o;\n    };\n\n    expect((Foo?.#m)()).toEqual(1);\n    expect((Foo?.#m)().toString).toEqual(1..toString);\n    expect((Foo?.#m)().toString()).toEqual('1');\n\n    expect((o?.Foo.#m)()).toEqual(1);\n    expect((o?.Foo.#m)().toString).toEqual(1..toString);\n    expect((o?.Foo.#m)().toString()).toEqual('1');\n\n    expect((((o.Foo?.self.getSelf)())?.#m)()).toEqual(1);\n    expect((((o.Foo.self?.getSelf)())?.#m)()).toEqual(1);\n\n    expect((((fn()?.Foo?.self.getSelf)())?.#m)()).toEqual(1);\n    expect((((fn?.().Foo.self?.getSelf)())?.#m)()).toEqual(1);\n  }\n\n  testNull() {\n    const o = null;\n    const fn = function () {\n      return { o };\n    }\n\n    expect(() => { (o?.Foo.#m)() }).toThrow();\n    expect(() => { (o?.Foo.#m)().toString }).toThrow();\n    expect(() => { (o?.Foo.#m)().toString() }).toThrow();\n\n    expect(() => { (((o.Foo?.self.getSelf)())?.#m)() }).toThrow();\n    expect(() => { (((o.Foo.self?.getSelf)())?.#m)() }).toThrow();\n\n    expect(() => (((fn()?.Foo?.self.getSelf)())?.#m)()).toThrow();\n    expect(() => (((fn?.().Foo.self?.getSelf)())?.#m)()).toThrow();\n  }\n}\n\n(new Foo).test();\n(new Foo).testNull();\n",
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
        output: expectedOutputs[250],
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
        output: expectedOutputs[251],
      },
    ],
  },
  {
    title: 'private loose — parenthesized optional member call with transform (input)',
    source:
      'class Foo {\n  static #x = 1;\n\n  static self = Foo;\n  static #m = function() { return this.#x; };\n  static getSelf() { return Foo }\n\n  test() {\n    const o = { Foo: Foo };\n    const fn = function () {\n      return o;\n    };\n\n    (Foo?.#m)();\n    (Foo?.#m)().toString;\n    (Foo?.#m)().toString();\n\n    (o?.Foo.#m)();\n    (o?.Foo.#m)().toString;\n    (o?.Foo.#m)().toString();\n\n    (((o.Foo?.self.getSelf)())?.#m)();\n    (((o.Foo.self?.getSelf)())?.#m)();\n\n    (((fn()?.Foo?.self.getSelf)())?.#m)();\n    (((fn?.().Foo.self?.getSelf)())?.#m)();\n  }\n}\n\n(new Foo).test();\n',
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
        output: expectedOutputs[252],
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
        output: expectedOutputs[253],
      },
    ],
  },
  {
    title: 'private loose — preserve comments (input)',
    source:
      'class C {\n  /* before a */\n  #a;\n  /* after a */\n\n  /* before b */\n  static #b;\n  /* after b */\n}\n',
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
        output: expectedOutputs[254],
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
        output: expectedOutputs[255],
      },
    ],
  },
  {
    title: 'private loose — private in derived (input)',
    source:
      'class Outer {\n  #outer;\n\n  constructor() {\n    class Test extends this.#outer {\n    }\n  }\n}\n',
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
        output: expectedOutputs[256],
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
        output: expectedOutputs[257],
      },
    ],
  },
  {
    title: 'private loose — reevaluated (input)',
    source:
      'function classFactory() {\n  return class Foo {\n    #foo = "foo";\n    static #bar = "bar";\n\n    instance() {\n      return this.#foo;\n    }\n\n    static() {\n      return Foo.#bar;\n    }\n\n    static instance(inst) {\n      return inst.#foo;\n    }\n\n    static static() {\n      return Foo.#bar;\n    }\n  }\n}\n\nconst Foo1 = classFactory();\nconst Foo2 = classFactory();\n\nconst f1 = new Foo1;\nconst f2 = new Foo2;\n\nexpect(f1.instance()).toBe("foo");\nexpect(f1.static()).toBe("bar");\nexpect(f2.instance()).toBe("foo");\nexpect(f2.static()).toBe("bar");\n\nexpect(Foo1.instance(f1)).toBe("foo");\nexpect(Foo1.static()).toBe("bar");\nexpect(Foo2.instance(f2)).toBe("foo");\nexpect(Foo2.static()).toBe("bar");\n\nassert.throws(() => f1.instance.call(f2));\nassert.throws(() => f2.instance.call(f1));\nassert.throws(() => Foo1.instance(f2));\nassert.throws(() => Foo2.instance(f1));\n',
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
        output: expectedOutputs[258],
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
        output: expectedOutputs[259],
      },
    ],
  },
  {
    title: 'private loose — reference in other property (input)',
    source:
      'class Foo {\n  one = this.#private;\n  #two = this.#private;\n  #private = 0;\n  three = this.#private;\n  #four = this.#private;\n}\n',
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
        output: expectedOutputs[260],
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
        output: expectedOutputs[261],
      },
    ],
  },
  {
    title: 'private loose — static call (exec)',
    source:
      'class Foo {\n  static #foo = function(x) {\n    return x;\n  }\n\n  test(x) {\n    return Foo.#foo(x);\n  }\n}\n\nconst f = new Foo;\nconst test = f.test();\nexpect(f.test("bar")).toBe("bar");\n',
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
        output: expectedOutputs[262],
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
        output: expectedOutputs[263],
      },
    ],
  },
  {
    title: 'private loose — static call (input)',
    source:
      'class Foo {\n  static #foo = function(x) {\n    return x;\n  }\n\n  test(x) {\n    return Foo.#foo(x);\n  }\n}\n\n',
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
        output: expectedOutputs[264],
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
        output: expectedOutputs[265],
      },
    ],
  },
  {
    title: 'private loose — static class binding (exec)',
    source:
      'class A {\n  static #self = A;\n  static #getA = () => A;\n\n  static extract() {\n    return { self: A.#self, getA: A.#getA };\n  }\n}\n\n\nconst oldA = A;\nA = null;\n\nexpect(oldA.extract().self).toBe(oldA);\nexpect(oldA.extract().getA()).toBe(oldA);\n',
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
        output: expectedOutputs[266],
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
        output: expectedOutputs[267],
      },
    ],
  },
  {
    title: 'private loose — static class binding (input)',
    source: 'class A {\n  static #self = A;\n  static #getA = () => A;\n}\n',
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
        output: expectedOutputs[268],
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
        output: expectedOutputs[269],
      },
    ],
  },
  {
    title: 'private loose — static export (input)',
    source:
      'export class MyClass {\n  static #property = value;\n}\n\nexport default class MyClass2 {\n  static #property = value;\n}\n',
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
        output: expectedOutputs[270],
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
        output: expectedOutputs[271],
      },
    ],
  },
  {
    title: 'private loose — static infer name (input)',
    source: 'var Foo = class {\n  static #num = 0;\n}\n',
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
        output: expectedOutputs[272],
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
        output: expectedOutputs[273],
      },
    ],
  },
  {
    title: 'private loose — static inherited (exec)',
    source:
      'class Base {\n  static #foo = 1;\n\n  static getThis() {\n    return this.#foo;\n  }\n\n  static updateThis(val) {\n    return (this.#foo = val);\n  }\n\n  static getClass() {\n    return Base.#foo;\n  }\n\n  static updateClass(val) {\n    return (Base.#foo = val);\n  }\n}\n\nclass Sub1 extends Base {\n  static #foo = 2;\n\n  static update(val) {\n    return (this.#foo = val);\n  }\n}\n\nclass Sub2 extends Base {}\n\nexpect(Base.getThis()).toBe(1);\nexpect(Base.getClass()).toBe(1);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(1);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(1);\n\nexpect(Sub1.update(3)).toBe(3);\nexpect(Base.getThis()).toBe(1);\nexpect(Base.getClass()).toBe(1);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(1);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(1);\n\nexpect(Base.updateThis(4)).toBe(4);\nexpect(Base.getThis()).toBe(4);\nexpect(Base.getClass()).toBe(4);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(4);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(4);\n\nexpect(Base.updateClass(5)).toBe(5);\nexpect(Base.getThis()).toBe(5);\nexpect(Base.getClass()).toBe(5);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(5);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(5);\n\nexpect(() => Sub2.updateThis(6)).toThrow();\nexpect(Sub2.updateClass(7)).toBe(7);\nexpect(Base.getThis()).toBe(7);\nexpect(Base.getClass()).toBe(7);\nexpect(() => Sub1.getThis()).toThrow();\nexpect(Sub1.getClass()).toBe(7);\nexpect(() => Sub2.getThis()).toThrow();\nexpect(Sub2.getClass()).toBe(7);\n',
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
        output: expectedOutputs[274],
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
        output: expectedOutputs[275],
      },
    ],
  },
  {
    title: 'private loose — static inherited (input)',
    source:
      'class Base {\n  static #foo = 1;\n\n  static getThis() {\n    return this.#foo;\n  }\n\n  static updateThis(val) {\n    return (this.#foo = val);\n  }\n\n  static getClass() {\n    return Base.#foo;\n  }\n\n  static updateClass(val) {\n    return (Base.#foo = val);\n  }\n}\n\nclass Sub1 extends Base {\n  static #foo = 2;\n\n  static update(val) {\n    return (this.#foo = val);\n  }\n}\n\nclass Sub2 extends Base {}\n',
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
        output: expectedOutputs[276],
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
        output: expectedOutputs[277],
      },
    ],
  },
  {
    title: 'private loose — static shadow (exec)',
    source:
      'class Test {\n\n  static #x = 1\n\n  static method() {\n    const Test = 2;\n    const func = () => {\n      const Test = 3;\n      return this.#x + Test;\n    }\n    return func() + Test;\n  }\n}\n\nexpect(Test.method()).toBe(6)\n',
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
        output: expectedOutputs[278],
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
        output: expectedOutputs[279],
      },
    ],
  },
  {
    title: 'private loose — static shadow (input)',
    source:
      'class Test {\n\n  static #x = 1\n\n  static method() {\n    const Test = 2;\n    const func = () => {\n      const Test = 3;\n      return this.#x + Test;\n    }\n    return func() + Test;\n  }\n}\n',
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
        output: expectedOutputs[280],
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
        output: expectedOutputs[281],
      },
    ],
  },
  {
    title: 'private loose — static this (exec)',
    source:
      'class A {\n  static #self = this;\n  static #getA = () => this;\n\n  static extract() {\n    return { self: A.#self, getA: A.#getA };\n  }\n}\n\nconst { self, getA } = A.extract();\n\nexpect(self).toBe(A);\nexpect(getA()).toBe(A);\n\nconst oldA = A;\nA = null;\n\nexpect(oldA.extract().self).toBe(oldA);\nexpect(oldA.extract().getA()).toBe(oldA);\n',
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
        output: expectedOutputs[282],
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
        output: expectedOutputs[283],
      },
    ],
  },
  {
    title: 'private loose — static this (input)',
    source: 'class A {\n  static #self = this;\n  static #getA = () => this;\n}\n',
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
        output: expectedOutputs[268],
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
        output: expectedOutputs[269],
      },
    ],
  },
  {
    title: 'private loose — static undefined (exec)',
    source:
      'class Foo {\n  static #bar;\n\n  static test() {\n    return Foo.#bar;\n  }\n\n  test() {\n    return Foo.#bar;\n  }\n}\n\nexpect("bar" in Foo).toBe(false);\nexpect(Foo.test()).toBe(undefined);\nexpect(Foo.test()).toBe(undefined);\n',
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
        output: expectedOutputs[284],
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
        output: expectedOutputs[285],
      },
    ],
  },
  {
    title: 'private loose — static undefined (input)',
    source:
      'class Foo {\n  static #bar;\n\n  static test() {\n    return Foo.#bar;\n  }\n\n  test() {\n    return Foo.#bar;\n  }\n}\n',
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
        output: expectedOutputs[286],
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
        output: expectedOutputs[287],
      },
    ],
  },
  {
    title: 'private loose — static (exec)',
    source:
      'class Foo {\n  static #bar = "foo";\n\n  static test() {\n    return Foo.#bar;\n  }\n\n  test() {\n    return Foo.#bar;\n  }\n}\n\nexpect("bar" in Foo).toBe(false);\nexpect(Foo.test()).toBe("foo");\nexpect(Foo.test()).toBe("foo");\n',
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
        output: expectedOutputs[288],
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
        output: expectedOutputs[289],
      },
    ],
  },
  {
    title: 'private loose — static (input)',
    source:
      'class Foo {\n  static #bar = "foo";\n\n  static test() {\n    return Foo.#bar;\n  }\n\n  test() {\n    return Foo.#bar;\n  }\n}\n',
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
        output: expectedOutputs[290],
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
        output: expectedOutputs[291],
      },
    ],
  },
  {
    title: 'private loose — super expression (input)',
    source:
      'class Foo extends Bar {\n  #bar = "foo";\n\n  constructor() {\n    foo(super());\n  }\n}\n',
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
        output: expectedOutputs[292],
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
        output: expectedOutputs[293],
      },
    ],
  },
  {
    title: 'private loose — super statement (input)',
    source: 'class Foo extends Bar {\n  #bar = "foo";\n\n  constructor() {\n    super();\n  }\n}\n',
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
        output: expectedOutputs[294],
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
        output: expectedOutputs[295],
      },
    ],
  },
  {
    title: 'private loose — update (exec)',
    source:
      'class Foo {\n  #foo = 0;\n\n  test(other) {\n    return [\n      this.#foo++,\n      this.#foo,\n      ++this.#foo,\n      this.#foo,\n      other.obj.#foo++,\n      other.obj.#foo,\n      ++other.obj.#foo,\n      other.obj.#foo,\n    ];\n  }\n}\n\nconst f = new Foo;\nconst results = f.test({ obj: f });\nexpect(results[0]).toBe(0);\nexpect(results[1]).toBe(1);\nexpect(results[2]).toBe(2);\nexpect(results[3]).toBe(2);\nexpect(results[4]).toBe(2);\nexpect(results[5]).toBe(3);\nexpect(results[6]).toBe(4);\nexpect(results[7]).toBe(4);\n',
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
        output: expectedOutputs[296],
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
        output: expectedOutputs[297],
      },
    ],
  },
  {
    title: 'private loose — update (input)',
    source:
      'class Foo {\n  #foo = 0;\n\n  test(other) {\n    this.#foo++;\n    ++this.#foo;\n    other.obj.#foo++;\n    ++other.obj.#foo;\n  }\n}\n',
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
        output: expectedOutputs[298],
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
        output: expectedOutputs[299],
      },
    ],
  },
  {
    title: 'private — 1 helpermemberexpressionfunction (input)',
    source:
      'class D {\n  #arr;\n  f() {\n    for (const el of this.#arr);\n  }\n}\n\nclass C {\n  #p;\n  m() {\n    for (this.#p of []);\n  }\n}\n\nclass E {\n  #arr;\n  f() {\n    for (this.#arr of [1, 2]);\n  }\n}\n\nclass F {\n  #ar;\n  g() {\n    for (this.#ar in [1,2,3]);\n  }\n}',
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
        output: expectedOutputs[300],
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
        output: expectedOutputs[301],
      },
    ],
  },
  {
    title: 'private — access before declaration (exec)',
    source:
      'expect(() => {\n  class C {\n    static #_ = new C;\n    static #p;\n    constructor() {\n      C.#p;\n    }\n  }\n}).toThrow(TypeError);\n\nexpect(() => {\n  class C {\n    static #_ = new C;\n    static #p;\n    constructor() {\n      C.#p = 0;\n    }\n  }\n}).toThrow(TypeError);\n\nexpect(() => {\n  class C {\n    static #_ = new C;\n    static #p;\n    constructor() {\n      for (C.#p of [0]);\n    }\n  }\n}).toThrow(TypeError);\n',
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
        output: expectedOutputs[302],
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
        output: expectedOutputs[303],
      },
    ],
  },
  {
    title: 'private — destructuring object pattern 3 (exec)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ({x: this.#client = 5} = props);\n  }\n\n  getClient() {\n    return this.#client;\n  }\n}\n\nconst foo = new Foo({});\nexpect(foo.getClient()).toEqual(5);\n',
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
        output: expectedOutputs[304],
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
        output: expectedOutputs[305],
      },
    ],
  },
  {
    title: 'private — destructuring object pattern 3 (input)',
    source:
      'class Foo {\n  #client\n\n  constructor(props) {\n    ({x: this.#client = 5} = props);\n  }\n}',
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
        output: expectedOutputs[306],
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
        output: expectedOutputs[307],
      },
    ],
  },
  {
    title: 'private — instance (exec)',
    source:
      'class Foo {\n  #bar = "foo";\n\n  test() {\n    return this.#bar;\n  }\n\n  update() {\n    this.#bar++;\n  }\n\n  set(val) {\n    this.#bar = val;\n  }\n\n  static test(foo) {\n    return foo.#bar;\n  }\n\n  static update(foo) {\n    foo.#bar **= 2;\n  }\n}\n\nconst f = new Foo();\nexpect(f.test()).toBe("foo");\nexpect(Foo.test(f)).toBe("foo");\nexpect("bar" in f).toBe(false);\n\nf.set(1);\nexpect(f.test()).toBe(1);\nf.update();\nexpect(Foo.test(f)).toBe(2);\nFoo.update(f);\nexpect(f.test()).toBe(4);\n',
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
        output: expectedOutputs[308],
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
        output: expectedOutputs[309],
      },
    ],
  },
  {
    title: 'private — native classes (exec)',
    source:
      'class Foo {\n  static #foo = "foo";\n  #bar = "bar";\n\n  static test() {\n    return Foo.#foo;\n  }\n\n  test() {\n    return this.#bar;\n  }\n}\n\nconst f = new Foo();\nexpect("foo" in Foo).toBe(false)\nexpect("bar" in f).toBe(false)\nexpect(Foo.test()).toBe("foo")\nexpect(f.test()).toBe("bar")\n',
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
        output: expectedOutputs[194],
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
        output: expectedOutputs[195],
      },
    ],
  },
  {
    title: 'private — native classes (input)',
    source:
      'class Foo {\n  static #foo = "foo";\n  #bar = "bar";\n\n  static test() {\n    return Foo.#foo;\n  }\n\n  test() {\n    return this.#bar;\n  }\n}\n',
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
        output: expectedOutputs[310],
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
        output: expectedOutputs[311],
      },
    ],
  },
  {
    title: 'private — reevaluated (exec)',
    source:
      'function classFactory() {\n  return class Foo {\n    #foo = "foo";\n    static #bar = "bar";\n\n    instance() {\n      return this.#foo;\n    }\n\n    static() {\n      return Foo.#bar;\n    }\n\n    static instance(inst) {\n      return inst.#foo;\n    }\n\n    static static() {\n      return Foo.#bar;\n    }\n  };\n}\n\nconst Foo1 = classFactory();\nconst Foo2 = classFactory();\n\nconst f1 = new Foo1();\nconst f2 = new Foo2();\n\nexpect(f1.instance()).toBe("foo");\nexpect(f1.static()).toBe("bar");\nexpect(f2.instance()).toBe("foo");\nexpect(f2.static()).toBe("bar");\n\nexpect(Foo1.instance(f1)).toBe("foo");\nexpect(Foo1.static()).toBe("bar");\nexpect(Foo2.instance(f2)).toBe("foo");\nexpect(Foo2.static()).toBe("bar");\n\nexpect(() => {\n  f1.instance.call(f2), undefined;\n}).toThrow();\nexpect(() => {\n  f2.instance.call(f1), undefined;\n}).toThrow();\nexpect(() => {\n  Foo1.instance(f2), undefined;\n}).toThrow();\nexpect(() => {\n  Foo2.instance(f1), undefined;\n}).toThrow();\n',
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
        output: expectedOutputs[312],
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
        output: expectedOutputs[313],
      },
    ],
  },
  {
    title: 'private — reevaluated (input)',
    source:
      'function classFactory() {\n  return class Foo {\n    #foo = "foo";\n    static #bar = "bar";\n\n    instance() {\n      return this.#foo;\n    }\n\n    static() {\n      return Foo.#bar;\n    }\n\n    static instance(inst) {\n      return inst.#foo;\n    }\n\n    static static() {\n      return Foo.#bar;\n    }\n  };\n}\n',
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
        output: expectedOutputs[314],
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
        output: expectedOutputs[315],
      },
    ],
  },
  {
    title: 'private — regression T2983 (input)',
    source:
      'call(class {\n  static #test = true\n});\n\nexport default class {\n  static #test = true\n};\n',
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
        output: expectedOutputs[316],
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
        output: expectedOutputs[317],
      },
    ],
  },
  {
    title: 'private — regression T6719 (input)',
    source:
      'function withContext(ComposedComponent) {\n    return class WithContext extends Component {\n\n        static #propTypes = {\n            context: PropTypes.shape(\n                {\n                    addCss: PropTypes.func,\n                    setTitle: PropTypes.func,\n                    setMeta: PropTypes.func,\n                }\n            ),\n        };\n    };\n}\n',
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
        output: expectedOutputs[318],
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
        output: expectedOutputs[319],
      },
    ],
  },
  {
    title: 'private — regression T7364 (input)',
    source:
      'class MyClass {\n  #myAsyncMethod = async () => {\n    console.log(this);\n  }\n}\n\n(class MyClass2 {\n  #myAsyncMethod = async () => {\n    console.log(this);\n  }\n})\n\nexport default class MyClass3 {\n  #myAsyncMethod = async () => {\n    console.log(this);\n  }\n}\n',
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
        output: expectedOutputs[320],
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
        output: expectedOutputs[321],
      },
    ],
  },
  {
    title: 'private — static self field (exec)',
    source:
      'const f = class Foo {\n  static #x = Foo;\n  static y = Foo;\n\n  static extract() {\n    return {\n      x: Foo.#x,\n      y: Foo.y,\n    }\n  }\n};\n\nconst { x, y } = f.extract();\nexpect(x).toBe(f)\nexpect(y).toBe(f)\n',
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
        output: expectedOutputs[322],
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
        output: expectedOutputs[323],
      },
    ],
  },
  {
    title: 'private — static self field (input)',
    source: 'const f = class Foo {\n  static #x = Foo;\n  static y = Foo;\n}',
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
        output: expectedOutputs[324],
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
        output: expectedOutputs[325],
      },
    ],
  },
  {
    title: 'private — static self method (exec)',
    source:
      'const f = class Foo {\n  static #bar() {\n    return Foo;\n  }\n\n  static #method() {\n    return function inner() {\n      return Foo;\n    };\n  }\n  static #method_shadowed() {\n    new Foo();\n    return function inner() {\n      let Foo = 3;\n      return Foo;\n    }\n  }\n\n  static extract() {\n    return {\n      bar: Foo.#bar,\n      method: Foo.#method,\n      method_shadowed: Foo.#method_shadowed\n    }\n  }\n};\n\nconst { bar, method, method_shadowed } = f.extract();\nexpect(bar()).toBe(f)\nexpect(method()()).toBe(f)\nexpect(method_shadowed()()).toBe(3)\n',
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
        output: expectedOutputs[326],
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
        output: expectedOutputs[326],
      },
    ],
  },
  {
    title: 'private — static self method (input)',
    source:
      'const f = class Foo {\n  static #bar() {\n    return Foo;\n  }\n\n  static #method() {\n    return function inner() {\n      return Foo;\n    };\n  }\n  static #method_shadowed() {\n    new Foo();\n    return function inner() {\n      let Foo = 3;\n      return Foo;\n    }\n  }\n}\n',
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
        output: expectedOutputs[327],
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
        output: expectedOutputs[327],
      },
    ],
  },
  {
    title: 'private — static (input)',
    source:
      'class Foo {\n  static #bar = "foo";\n\n  static test() {\n    return Foo.#bar;\n  }\n\n  test() {\n    return Foo.#bar;\n  }\n}\n\nexpect("bar" in Foo).toBe(false)\nexpect(Foo.test()).toBe("foo")\nexpect(Foo.test()).toBe("foo")\n',
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
        output: expectedOutputs[288],
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
        output: expectedOutputs[289],
      },
    ],
  },
  {
    title: 'private — super call (input)',
    source:
      'class A {\n  foo() {\n    return "bar";\n  }\n}\n\nclass B extends A {\n  #foo = super.foo();\n}\n',
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
        output: expectedOutputs[328],
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
        output: expectedOutputs[329],
      },
    ],
  },
  {
    title: 'private — tagged template static (exec)',
    source:
      'class Foo {\n    static #tag = function () { return this };\n\n    static getReceiver() {\n        return this.#tag``;\n    }\n}\n  \nexpect(Foo.getReceiver()).toBe(Foo);',
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
        output: expectedOutputs[330],
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
        output: expectedOutputs[331],
      },
    ],
  },
  {
    title: 'private — tagged template static (input)',
    source:
      'class Foo {\n    static #tag = function () { return this };\n\n    static getReceiver() {\n        return this.#tag``;\n    }\n}\n  ',
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
        output: expectedOutputs[332],
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
        output: expectedOutputs[333],
      },
    ],
  },
  {
    title: 'private — tagged template (exec)',
    source:
      'class Foo {\n    #tag() {\n      return this;\n    }\n  \n    #tag2 = function() { return this; };\n\n    constructor() {\n      const receiver = this.#tag`tagged template`;\n      expect(receiver).toBe(this);\n  \n      const receiver2 = this.#tag2`tagged template`;\n      expect(receiver2).toBe(this);\n    }\n}\n\n  new Foo();',
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
        output: expectedOutputs[334],
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
        output: expectedOutputs[334],
      },
    ],
  },
  {
    title: 'private — tagged template (input)',
    source: 'class Foo {\n  #tag;\n\n  test() {\n    this.#tag``;\n  }\n}\n\nnew Foo();',
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
        output: expectedOutputs[335],
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
        output: expectedOutputs[336],
      },
    ],
  },
  {
    title: 'public loose — arrow static this without transform (input)',
    source: 'class Foo {\n  static fn = () => console.log(this);\n}\n',
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
        output: expectedOutputs[337],
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
        output: expectedOutputs[338],
      },
    ],
  },
  {
    title: 'public loose — arrow this without transform (input)',
    source: 'class Foo {\n  fn = () => console.log(this);\n}\n',
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
        output: expectedOutputs[339],
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
        output: expectedOutputs[340],
      },
    ],
  },
  {
    title: 'public loose — class shadow builtins (input)',
    source: 'export class TypeError {\n  message\n}\n',
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
        output: expectedOutputs[341],
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
        output: expectedOutputs[342],
      },
    ],
  },
  {
    title: 'public — assignment (input)',
    source:
      'class Foo {\n  foo = 0;\n\n  test(other) {\n    this.foo++;\n    this.foo += 1;\n    this.foo = 2;\n    other.obj.foo++;\n    other.obj.foo += 1;\n    other.obj.foo = 2;\n  }\n}\n',
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
        output: expectedOutputs[343],
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
        output: expectedOutputs[344],
      },
    ],
  },
  {
    title: 'public — call (exec)',
    source:
      'class Foo {\n  foo = function() {\n    return this;\n  }\n\n  test(other) {\n    return [this.foo(), other.foo()];\n  }\n}\n\nconst f = new Foo;\nconst o = new Foo;\nconst test = f.test(o);\nexpect(test[0]).toBe(f);\nexpect(test[1]).toBe(o);\n',
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
        output: expectedOutputs[345],
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
        output: expectedOutputs[346],
      },
    ],
  },
  {
    title: 'public — call (input)',
    source:
      'class Foo {\n  foo = function() {\n    return this;\n  }\n\n  test(other) {\n    this.foo();\n    other.obj.foo();\n  }\n}\n',
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
        output: expectedOutputs[347],
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
        output: expectedOutputs[348],
      },
    ],
  },
  {
    title: 'public — computed toPrimitive (exec)',
    source:
      'const foo = { [Symbol.toPrimitive]: () => "foo" };\n\nexpect((class { static [foo] = 0 }).foo).toBe(0);\nexpect((class { static [foo](){ return 0; } }).foo()).toBe(0);\nexpect((class { static get [foo](){ return 0; } }).foo).toBe(0);\nexpect((class { static set [foo](v){ return v; } }).foo = 0).toBe(0);\n\nexpect((new class { [foo] = 0 }).foo).toBe(0);\n\nconst arrayLike = { [Symbol.toPrimitive] : () => [] };\n\nexpect(() => class { static [arrayLike] = 0 }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => class { static [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => class { static get [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => class { static set [arrayLike](v){ return v; } }).toThrow("@@toPrimitive must return a primitive value.");\n\nexpect(() => new class { [arrayLike] = 0 }).toThrow("@@toPrimitive must return a primitive value.");\n',
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
        output: expectedOutputs[349],
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
        output: expectedOutputs[350],
      },
    ],
  },
  {
    title: 'public — computed toPrimitive (input)',
    source:
      'const foo = { [Symbol.toPrimitive]: () => "foo" };\n\nexpect((class { static [foo] = 0 }).foo).toBe(0);\nexpect((class { static [foo](){ return 0; } }).foo()).toBe(0);\nexpect((class { static get [foo](){ return 0; } }).foo).toBe(0);\nexpect((class { static set [foo](v){ return v; } }).foo = 0).toBe(0);\n\nexpect((new class { [foo] = 0 }).foo).toBe(0);\n\nconst arrayLike = { [Symbol.toPrimitive] : () => [] };\n\nexpect(() => class { static [arrayLike] = 0 }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => class { static [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => class { static get [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => class { static set [arrayLike](v){ return v; } }).toThrow("@@toPrimitive must return a primitive value.");\n\nexpect(() => new class { [arrayLike] = 0 }).toThrow("@@toPrimitive must return a primitive value.");\n',
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
        output: expectedOutputs[349],
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
        output: expectedOutputs[350],
      },
    ],
  },
  {
    title: 'public — computed without block (exec)',
    source:
      "const createClass = (k) => class { [k()] = 2 };\n\nconst clazz = createClass(() => 'foo');\nconst instance = new clazz();\nexpect(instance.foo).toBe(2);",
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
        output: expectedOutputs[351],
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
        output: expectedOutputs[352],
      },
    ],
  },
  {
    title: 'public — computed without block (input)',
    source: 'const createClass = (k) => class { [k()] = 2 };\n',
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
        output: expectedOutputs[353],
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
        output: expectedOutputs[354],
      },
    ],
  },
  {
    title: 'public — delete super property (exec)',
    source:
      'expect(() => {\n  new class { y = delete super.x; };\n}).toThrow(ReferenceError);\n\nexpect(() => {\n  new class { y = delete super[0]; };\n}).toThrow(ReferenceError);\n\nexpect(() => {\n  class X1 { static y = delete super.x; }\n}).toThrow(ReferenceError);\n\nexpect(() => {\n  class X2 { static y = delete super[0]; }\n}).toThrow(ReferenceError);\n',
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
        output: expectedOutputs[355],
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
        output: expectedOutputs[356],
      },
    ],
  },
  {
    title: 'public — delete super property (input)',
    source:
      'new class { y = delete super.x; };\n\nnew class { y = delete super[0]; };\n\nclass X1 { static y = delete super.x; }\n\nclass X2 { static y = delete super[0]; }\n',
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
        output: expectedOutputs[357],
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
        output: expectedOutputs[358],
      },
    ],
  },
  {
    title: 'public — delete this (exec)',
    source:
      'class Foo {\n  x = delete this;\n  static x = delete this;\n}\n\nexpect(new Foo().x).toBe(true);\nexpect(Foo.x).toBe(true);\n',
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
        output: expectedOutputs[359],
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
        output: expectedOutputs[360],
      },
    ],
  },
  {
    title: 'public — delete this (input)',
    source: 'class Foo {\n  x = delete this;\n  static x = delete this;\n}\n',
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
        output: expectedOutputs[361],
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
        output: expectedOutputs[362],
      },
    ],
  },
  {
    title: 'public — derived multiple supers (input)',
    source:
      'class Foo extends Bar {\n  bar = "foo";\n\n  constructor() {\n    if (condition) {\n      super();\n    } else {\n      super();\n    }\n  }\n}\n',
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
        output: expectedOutputs[363],
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
        output: expectedOutputs[364],
      },
    ],
  },
  {
    title: 'public — derived super in default params complex (input)',
    source:
      'class Foo extends Bar {\n  bar = "foo";\n\n  constructor(x = test ? super() : 0) {\n  }\n}\n',
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
        output: expectedOutputs[365],
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
        output: expectedOutputs[366],
      },
    ],
  },
  {
    title: 'public — derived super in default params in arrow (input)',
    source:
      'class Foo extends Bar {\n  bar = "foo";\n\n  constructor(x = () => { check(super()) }) {\n  }\n}\n',
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
        output: expectedOutputs[367],
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
        output: expectedOutputs[368],
      },
    ],
  },
  {
    title: 'public — derived super in default params (input)',
    source: 'class Foo extends Bar {\n  bar = "foo";\n\n  constructor(x = super()) {\n  }\n}\n',
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
        output: expectedOutputs[369],
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
        output: expectedOutputs[370],
      },
    ],
  },
  {
    title: 'public — extracted this (input)',
    source:
      'var foo = "bar";\n\nclass Foo {\n  bar = this;\n  baz = foo;\n\n  constructor(foo) {\n  }\n}\n',
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
        output: expectedOutputs[371],
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
        output: expectedOutputs[372],
      },
    ],
  },
  {
    title: 'public — native classes (exec)',
    source:
      'class Foo {\n  static foo = "foo";\n  bar = "bar";\n\n  static test() {\n    return Foo.foo;\n  }\n\n  test() {\n    return this.bar;\n  }\n}\n\nconst f = new Foo();\nexpect("foo" in Foo).toBe(true)\nexpect("bar" in f).toBe(true)\nexpect(Foo.test()).toBe("foo")\nexpect(f.test()).toBe("bar")\n',
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
        output: expectedOutputs[373],
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
        output: expectedOutputs[374],
      },
    ],
  },
  {
    title: 'public — native classes (input)',
    source: 'class Foo {\n  static foo = "foo";\n  bar = "bar";\n}\n',
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
        output: expectedOutputs[375],
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
        output: expectedOutputs[376],
      },
    ],
  },
  {
    title: 'public — numeric (input)',
    source: 'class Foo {\n  0 = "foo";\n  1 = "bar";\n}\n',
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
        output: expectedOutputs[377],
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
        output: expectedOutputs[378],
      },
    ],
  },
  {
    title: 'public — super destructuring array pattern 1 (input)',
    source: 'class Foo {\n  constructor(props) {\n    ;([x, ...super.client] = props);\n  }\n}',
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
        output: expectedOutputs[379],
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
        output: expectedOutputs[379],
      },
    ],
  },
  {
    title: 'public — super destructuring array pattern (input)',
    source: 'class Foo {\n  constructor(props) {\n    ;([super.client] = props);\n  }\n}\n',
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
        output: expectedOutputs[380],
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
        output: expectedOutputs[380],
      },
    ],
  },
  {
    title: 'public — super destructuring object pattern 1 (input)',
    source: 'class Foo {\n  constructor(props) {\n    ;({ x, ...super.client } = props)\n  }\n}',
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
        output: expectedOutputs[381],
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
        output: expectedOutputs[381],
      },
    ],
  },
  {
    title: 'public — super destructuring object pattern (input)',
    source: 'class Foo {\n  constructor(props) {\n    ;({ client: super.client } = props)\n  }\n}',
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
        output: expectedOutputs[382],
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
        output: expectedOutputs[382],
      },
    ],
  },
  {
    title: 'public — update (exec)',
    source:
      'class Foo {\n  foo = 0;\n\n  test(other) {\n    return [\n      this.foo++,\n      this.foo,\n      ++this.foo,\n      this.foo,\n      other.obj.foo++,\n      other.obj.foo,\n      ++other.obj.foo,\n      other.obj.foo,\n    ];\n  }\n}\n\nconst f = new Foo;\nconst results = f.test({ obj: f });\nexpect(results[0]).toBe(0);\nexpect(results[1]).toBe(1);\nexpect(results[2]).toBe(2);\nexpect(results[3]).toBe(2);\nexpect(results[4]).toBe(2);\nexpect(results[5]).toBe(3);\nexpect(results[6]).toBe(4);\nexpect(results[7]).toBe(4);\n',
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
        output: expectedOutputs[383],
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
        output: expectedOutputs[384],
      },
    ],
  },
  {
    title: 'public — update (input)',
    source:
      'class Foo {\n  foo = 0;\n\n  test(other) {\n    this.foo++;\n    ++this.foo;\n    other.obj.foo++;\n    ++other.obj.foo;\n  }\n}\n',
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
        output: expectedOutputs[385],
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
        output: expectedOutputs[386],
      },
    ],
  },
  {
    title: 'regression — 15098 (exec)',
    source:
      'expect(() => {\n  class X { [0 in 0]; }\n}).toThrow();\n\nexpect(() => {\n  class X { [0 instanceof 0]; }\n}).toThrow();\n',
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
        output: expectedOutputs[387],
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
        output: expectedOutputs[388],
      },
    ],
  },
  {
    title: 'regression — 15098 (input)',
    source: 'class X {\n  [ 0 in 0 ];\n  [ 0 instanceof 0 ];\n}',
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
        output: expectedOutputs[389],
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
        output: expectedOutputs[390],
      },
    ],
  },
  {
    title: 'regression — 6153 (input)',
    source:
      '() => {\n  class Foo {\n    fn = () => console.log(this);\n    static fn = () => console.log(this);\n  }\n};\n\n() => class Bar {\n  fn = () => console.log(this);\n  static fn = () => console.log(this);\n};\n\n() => {\n  class Baz {\n    fn = () => console.log(this);\n    force = force\n    static fn = () => console.log(this);\n\n    constructor(force) {}\n  }\n};\n\nvar qux = function() {\n  class Qux {\n    fn = () => console.log(this);\n    static fn = () => console.log(this);\n  }\n}.bind(this)\n',
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
        output: expectedOutputs[391],
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
        output: expectedOutputs[392],
      },
    ],
  },
  {
    title: 'regression — 6154 (input)',
    source:
      'class Test {\n  constructor() {\n    class Other extends Test {\n      a = () => super.test;\n      static a = () => super.test;\n    }\n  }\n}\n',
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
        output: expectedOutputs[393],
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
        output: expectedOutputs[394],
      },
    ],
  },
  {
    title: 'regression — 7371 (exec)',
    source:
      '"use strict";\nclass C {\n}\n\nclass A extends C {\n  field = 1;\n\n  constructor() {\n    super();\n\n    class B extends C {\n      constructor() {\n        super();\n\n        expect(this.field).toBeUndefined();\n      }\n    }\n\n    expect(this.field).toBe(1)\n\n    new B();\n  }\n}\n\nnew A();\n\nclass Obj {\n  constructor() {\n    return {};\n  }\n}\n\n// ensure superClass is still transformed\nclass SuperClass extends Obj {\n  field = 1;\n\n  constructor() {\n    class B extends (super(), Obj) {\n      constructor() {\n        super();\n\n        expect(this.field).toBeUndefined()\n      }\n    }\n\n    expect(this.field).toBe(1)\n\n    new B();\n  }\n}\n\nnew SuperClass();\n\n// ensure ComputedKey Method is still transformed\nclass ComputedMethod extends Obj {\n  field = 1;\n\n  constructor() {\n    class B extends Obj {\n      constructor() {\n        super();\n\n        expect(this.field).toBeUndefined()\n      }\n\n      [super()]() { }\n    }\n\n    expect(this.field).toBe(1)\n\n    new B();\n  }\n}\n\nnew ComputedMethod();\n\n\n// ensure ComputedKey Field is still transformed\nclass ComputedField extends Obj {\n  field = 1;\n\n  constructor() {\n    class B extends Obj {\n      constructor() {\n        super();\n\n        expect(this.field).toBeUndefined()\n      }\n\n      [super()] = 1;\n    }\n\n    expect(this.field).toBe(1)\n\n    new B();\n  }\n}\n\nnew ComputedField();\n',
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
        output: expectedOutputs[395],
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
        output: expectedOutputs[396],
      },
    ],
  },
  {
    title: 'regression — 7371 (input)',
    source:
      '"use strict";\nclass C {\n}\n\nclass A extends C {\n  field = 1;\n\n  constructor() {\n    super();\n\n    class B extends C {\n      constructor() {\n        super();\n\n        expect(this.field).toBeUndefined();\n      }\n    }\n\n    expect(this.field).toBe(1)\n\n    new B();\n  }\n}\n\nnew A();\n\nclass Obj {\n  constructor() {\n    return {};\n  }\n}\n\n// ensure superClass is still transformed\nclass SuperClass extends Obj {\n  field = 1;\n\n  constructor() {\n    class B extends (super(), Obj) {\n      constructor() {\n        super();\n\n        expect(this.field).toBeUndefined()\n      }\n    }\n\n    expect(this.field).toBe(1)\n\n    new B();\n  }\n}\n\nnew SuperClass();\n\n// ensure ComputedKey Method is still transformed\nclass ComputedMethod extends Obj {\n  field = 1;\n\n  constructor() {\n    class B extends Obj {\n      constructor() {\n        super();\n\n        expect(this.field).toBeUndefined()\n      }\n\n      [super()]() { }\n    }\n\n    expect(this.field).toBe(1)\n\n    new B();\n  }\n}\n\nnew ComputedMethod();\n\n\n// ensure ComputedKey Field is still transformed\nclass ComputedField extends Obj {\n  field = 1;\n\n  constructor() {\n    class B extends Obj {\n      constructor() {\n        super();\n\n        expect(this.field).toBeUndefined()\n      }\n\n      [super()] = 1;\n    }\n\n    expect(this.field).toBe(1)\n\n    new B();\n  }\n}\n\nnew ComputedField();\n',
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
        output: expectedOutputs[395],
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
        output: expectedOutputs[396],
      },
    ],
  },
  {
    title: 'regression — 7951 (input)',
    source: 'export class Foo extends Bar {\n  static foo = {};\n\n  test = args;\n}\n',
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
        output: expectedOutputs[397],
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
        output: expectedOutputs[398],
      },
    ],
  },
  {
    title: 'regression — 8110 (input)',
    source: "const field = Symbol('field');\n\nclass A {\n  [field] = 10;\n}\n",
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
        output: expectedOutputs[399],
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
        output: expectedOutputs[400],
      },
    ],
  },
  {
    title: 'regression — 8882 (exec)',
    source:
      "const classes = [];\nfor (let i = 0; i <= 10; ++i) {\n  classes.push(\n    class A {\n      [i] = `computed field ${i}`;\n      static foo = `static field ${i}`;\n      #bar = `private field ${i}`;\n      getBar() {\n        return this.#bar;\n      }\n    }\n  );\n}\n\nfor(let i=0; i<= 10; ++i) {\n  const clazz = classes[i];\n  expect(clazz.foo).toBe('static field ' + i);\n  \n  const instance = new clazz();\n  expect(Object.getOwnPropertyNames(instance)).toEqual([String(i)])\n  expect(instance[i]).toBe('computed field ' + i);\n  expect(instance.getBar()).toBe('private field ' + i);\n}",
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
        output: expectedOutputs[401],
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
        output: expectedOutputs[402],
      },
    ],
  },
  {
    title: 'regression — 8882 (input)',
    source:
      'const classes = [];\nfor (let i = 0; i <= 10; ++i) {\n  classes.push(\n    class A {\n      [i] = `computed field ${i}`;\n      static foo = `static field ${i}`;\n      #bar = `private field ${i}`;\n      getBar() {\n        return this.#bar;\n      }\n    }\n  );\n}',
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
        output: expectedOutputs[403],
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
        output: expectedOutputs[404],
      },
    ],
  },
  {
    title: 'regression — multiple super in termary (input)',
    source:
      'class A extends B {\n  x = 2;\n  constructor() {\n    x ? super(a) : super(b)\n  }\n}\n',
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
        output: expectedOutputs[405],
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
        output: expectedOutputs[406],
      },
    ],
  },
  {
    title: 'source maps — private get (input)',
    source:
      'class A {\n  #field;\n\n  get #getter() {}\n\n  #method() {}\n\n  method() {\n    this.#field;\n    this.#getter;\n    this.#method;\n\n    inExpr(this.#field);\n  }\n}\n',
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
        output: expectedOutputs[407],
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
        output: expectedOutputs[407],
      },
    ],
  },
  {
    title: 'source maps — private set (input)',
    source:
      'class A {\n  #field;\n\n  set #setter(value) {}\n\n  method() {\n    this.#field = 42;\n    this.#setter = 43;\n\n\n    inExpr(this.#field = 5);\n  }\n}\n',
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
        output: expectedOutputs[408],
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
        output: expectedOutputs[408],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
