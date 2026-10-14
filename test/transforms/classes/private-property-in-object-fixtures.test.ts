import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  function _initialize() {\n    Object.defineProperty(this, _foo, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');\n  function _initialize() {\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 'bar',\n    });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(Foo), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _foo, {\n    writable: true,\n    value: 'foo',\n  });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  function _initialize() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  var _foo2 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo2');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  var _privateMethod18 = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  function _initialize() {\n    Object.defineProperty(this, _foo, { value: _privateMethod });\n    Object.defineProperty(this, _foo2, { value: _privateMethod18 });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'test2', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo2);\n      },\n      'name',\n      {\n        value: 'test2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nconst cl = new Foo();\nexpect(cl.test({})).toBe(false);\nexpect(cl.test(cl)).toBe(true);\nexpect(cl.test2({})).toBe(false);\nexpect(cl.test2(cl)).toBe(true);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  var _foo2 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo2');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  var _privateMethod17 = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  function _initialize() {\n    Object.defineProperty(this, _foo, { value: _privateMethod });\n    Object.defineProperty(this, _foo2, { value: _privateMethod17 });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'test2', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo2);\n      },\n      'name',\n      {\n        value: 'test2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');\n  function _initialize() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 1,\n    });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let Nested = (() => {\n          'use strict';\n          var _bar20 =\n            _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Nested_bar');\n          function _initialize22() {\n            Object.defineProperty(this, _bar20, {\n              writable: true,\n              value: 2,\n            });\n          }\n          const Nested = function Nested() {\n            if (!new.target) throw new TypeError('Cannot call a class as a function');\n            _initialize22.call(this);\n          };\n          Object.defineProperty(Nested.prototype, 'test', {\n            value: Object.defineProperty(\n              function () {\n                if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar20);\n              },\n              'name',\n              {\n                value: 'test',\n                configurable: true,\n              },\n            ),\n            writable: true,\n            configurable: true,\n          });\n          Object.defineProperty(Nested, 'prototype', { writable: false });\n          return Nested;\n        })();\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  function _initialize() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let Nested = (() => {\n          'use strict';\n          var _foo18 =\n            _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Nested_foo');\n          function _initialize20() {\n            Object.defineProperty(this, _foo18, {\n              writable: true,\n              value: 2,\n            });\n          }\n          const Nested = function Nested() {\n            if (!new.target) throw new TypeError('Cannot call a class as a function');\n            _initialize20.call(this);\n          };\n          Object.defineProperty(Nested.prototype, 'test', {\n            value: Object.defineProperty(\n              function () {\n                if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo18);\n              },\n              'name',\n              {\n                value: 'test',\n                configurable: true,\n              },\n            ),\n            writable: true,\n            configurable: true,\n          });\n          Object.defineProperty(Nested, 'prototype', { writable: false });\n          return Nested;\n        })();\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  function _initialize() {\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let Nested = (() => {\n          'use strict';\n          const Nested = function Nested() {\n            if (!new.target) throw new TypeError('Cannot call a class as a function');\n          };\n          Object.defineProperty(Nested.prototype, 'test', {\n            value: Object.defineProperty(\n              function () {\n                if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n              },\n              'name',\n              {\n                value: 'test',\n                configurable: true,\n              },\n            ),\n            writable: true,\n            configurable: true,\n          });\n          Object.defineProperty(Nested, 'prototype', { writable: false });\n          return Nested;\n        })();\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_p');\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    Object.defineProperty(_Class, _p, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p),\n    });\n    return _Class;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p18 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class17_p');\n    const _Class17 = function _Class17() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class17, 'prototype', { writable: false });\n    Object.defineProperty(_Class17, _p18, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p18),\n    });\n    return _Class17;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p23 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class22_p');\n    const _Class22 = function _Class22() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class22, 'prototype', { writable: false });\n    Object.defineProperty(_Class22, _p23, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p23),\n    });\n    return _Class22;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p28 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class27_p');\n    const _Class27 = function _Class27() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class27, 'prototype', { writable: false });\n    Object.defineProperty(_Class27, _p28, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p28),\n    });\n    return _Class27;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p33 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class32_p');\n    const _Class32 = function _Class32() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class32, 'prototype', { writable: false });\n    Object.defineProperty(_Class32, _p33, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p33),\n    });\n    return _Class32;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p38 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class37_p');\n    const _Class37 = function _Class37() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class37, 'prototype', { writable: false });\n    Object.defineProperty(_Class37, _p38, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p38),\n    });\n    return _Class37;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p43 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class42_p');\n    const _Class42 = function _Class42() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class42, 'prototype', { writable: false });\n    Object.defineProperty(_Class42, _p43, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p43),\n    });\n    return _Class42;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got bigint`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p48 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class47_p');\n    var _privateMethod49 = function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    };\n    const _Class47 = function _Class47() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class47, 'prototype', { writable: false });\n    Object.defineProperty(_Class47, _p48, { value: _privateMethod49 });\n    Object.defineProperty(_Class47, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p48),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    return _Class47;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p53 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class52_p');\n    var _privateMethod54 = function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    };\n    const _Class52 = function _Class52() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class52, 'prototype', { writable: false });\n    Object.defineProperty(_Class52, _p53, { value: _privateMethod54 });\n    Object.defineProperty(_Class52, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p53),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    return _Class52;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p58 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class57_p');\n    var _privateMethod59 = function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    };\n    const _Class57 = function _Class57() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class57, 'prototype', { writable: false });\n    Object.defineProperty(_Class57, _p58, { value: _privateMethod59 });\n    Object.defineProperty(_Class57, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p58),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    return _Class57;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p63 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class62_p');\n    var _privateMethod64 = function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    };\n    const _Class62 = function _Class62() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class62, 'prototype', { writable: false });\n    Object.defineProperty(_Class62, _p63, { value: _privateMethod64 });\n    Object.defineProperty(_Class62, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p63),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    return _Class62;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p68 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class67_p');\n    var _privateMethod69 = function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    };\n    const _Class67 = function _Class67() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class67, 'prototype', { writable: false });\n    Object.defineProperty(_Class67, _p68, { value: _privateMethod69 });\n    Object.defineProperty(_Class67, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p68),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    return _Class67;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p73 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class72_p');\n    var _privateMethod74 = function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    };\n    const _Class72 = function _Class72() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class72, 'prototype', { writable: false });\n    Object.defineProperty(_Class72, _p73, { value: _privateMethod74 });\n    Object.defineProperty(_Class72, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p73),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    return _Class72;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p78 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class77_p');\n    var _privateMethod79 = function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    };\n    const _Class77 = function _Class77() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class77, 'prototype', { writable: false });\n    Object.defineProperty(_Class77, _p78, { value: _privateMethod79 });\n    Object.defineProperty(_Class77, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p78),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    return _Class77;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got bigint`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p83 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class82_p');\n      function _initialize85() {\n        Object.defineProperty(this, _p83, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p83),\n        });\n      }\n      const _Class82 = function _Class82() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize85.call(this);\n      };\n      Object.defineProperty(_Class82, 'prototype', { writable: false });\n      return _Class82;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p88 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class87_p');\n      function _initialize90() {\n        Object.defineProperty(this, _p88, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p88),\n        });\n      }\n      const _Class87 = function _Class87() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize90.call(this);\n      };\n      Object.defineProperty(_Class87, 'prototype', { writable: false });\n      return _Class87;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p93 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class92_p');\n      function _initialize95() {\n        Object.defineProperty(this, _p93, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p93),\n        });\n      }\n      const _Class92 = function _Class92() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize95.call(this);\n      };\n      Object.defineProperty(_Class92, 'prototype', { writable: false });\n      return _Class92;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p98 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class97_p');\n      function _initialize100() {\n        Object.defineProperty(this, _p98, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p98),\n        });\n      }\n      const _Class97 = function _Class97() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize100.call(this);\n      };\n      Object.defineProperty(_Class97, 'prototype', { writable: false });\n      return _Class97;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p103 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class102_p');\n      function _initialize105() {\n        Object.defineProperty(this, _p103, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p103),\n        });\n      }\n      const _Class102 = function _Class102() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize105.call(this);\n      };\n      Object.defineProperty(_Class102, 'prototype', { writable: false });\n      return _Class102;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p108 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class107_p');\n      function _initialize110() {\n        Object.defineProperty(this, _p108, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p108),\n        });\n      }\n      const _Class107 = function _Class107() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize110.call(this);\n      };\n      Object.defineProperty(_Class107, 'prototype', { writable: false });\n      return _Class107;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p113 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class112_p');\n      function _initialize115() {\n        Object.defineProperty(this, _p113, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p113),\n        });\n      }\n      const _Class112 = function _Class112() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize115.call(this);\n      };\n      Object.defineProperty(_Class112, 'prototype', { writable: false });\n      return _Class112;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got bigint`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p118 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class117_p');\n      var _privateMethod119 = function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      };\n      function _initialize120() {\n        Object.defineProperty(this, _p118, { value: _privateMethod119 });\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p118),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n      }\n      const _Class117 = function _Class117() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize120.call(this);\n      };\n      Object.defineProperty(_Class117, 'prototype', { writable: false });\n      return _Class117;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p123 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class122_p');\n      var _privateMethod124 = function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      };\n      function _initialize125() {\n        Object.defineProperty(this, _p123, { value: _privateMethod124 });\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p123),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n      }\n      const _Class122 = function _Class122() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize125.call(this);\n      };\n      Object.defineProperty(_Class122, 'prototype', { writable: false });\n      return _Class122;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p128 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class127_p');\n      var _privateMethod129 = function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      };\n      function _initialize130() {\n        Object.defineProperty(this, _p128, { value: _privateMethod129 });\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p128),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n      }\n      const _Class127 = function _Class127() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize130.call(this);\n      };\n      Object.defineProperty(_Class127, 'prototype', { writable: false });\n      return _Class127;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p133 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class132_p');\n      var _privateMethod134 = function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      };\n      function _initialize135() {\n        Object.defineProperty(this, _p133, { value: _privateMethod134 });\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p133),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n      }\n      const _Class132 = function _Class132() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize135.call(this);\n      };\n      Object.defineProperty(_Class132, 'prototype', { writable: false });\n      return _Class132;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p138 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class137_p');\n      var _privateMethod139 = function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      };\n      function _initialize140() {\n        Object.defineProperty(this, _p138, { value: _privateMethod139 });\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p138),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n      }\n      const _Class137 = function _Class137() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize140.call(this);\n      };\n      Object.defineProperty(_Class137, 'prototype', { writable: false });\n      return _Class137;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p143 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class142_p');\n      var _privateMethod144 = function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      };\n      function _initialize145() {\n        Object.defineProperty(this, _p143, { value: _privateMethod144 });\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p143),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n      }\n      const _Class142 = function _Class142() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize145.call(this);\n      };\n      Object.defineProperty(_Class142, 'prototype', { writable: false });\n      return _Class142;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p148 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class147_p');\n      var _privateMethod149 = function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      };\n      function _initialize150() {\n        Object.defineProperty(this, _p148, { value: _privateMethod149 });\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p148),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n      }\n      const _Class147 = function _Class147() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _initialize150.call(this);\n      };\n      Object.defineProperty(_Class147, 'prototype', { writable: false });\n      return _Class147;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got bigint`);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _foo, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _foo, {\n    writable: true,\n    value: 1,\n  });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _foo, { value: _privateMethod });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  var _foo2 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo2');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  var _privateMethod17 = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  function _initialize() {\n    Object.defineProperty(this, _foo, { value: _privateMethod });\n    Object.defineProperty(this, _foo2, { value: _privateMethod17 });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'test2', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  function _initialize() {\n    Object.defineProperty(this, _foo, { value: _privateMethod });\n  }\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Test = (() => {\n  'use strict';\n  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Test_x');\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'method', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const Test = 2;\n        const func = () => {\n          const Test = 3;\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _x) && Test;\n        };\n        return func() + Test;\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  Object.defineProperty(Test, _x, {\n    writable: true,\n    value: 1,\n  });\n  return Test;\n})();\nconst t = new Test();\nconst t2 = new Test();\nexpect(t.method(Test)).toBe(5);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Test = (() => {\n  'use strict';\n  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Test_x');\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'method', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const Test = 2;\n        const func = () => {\n          const Test = 3;\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _x) && Test;\n        };\n        return func() + Test;\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  Object.defineProperty(Test, _x, {\n    writable: true,\n    value: 1,\n  });\n  return Test;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\n(\n  x = (() => {\n    'use strict';\n    var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_foo');\n    function _initialize() {\n      Object.defineProperty(this, _foo, {\n        writable: true,\n        value: void 0,\n      });\n    }\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      _initialize.call(this);\n    };\n    Object.defineProperty(_Class, 'name', {\n      value: 'x',\n      configurable: true,\n    });\n    Object.defineProperty(_Class.prototype, 'test', {\n      value: Object.defineProperty(\n        function (other) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n        },\n        'name',\n        {\n          value: 'test',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })(),\n) => {};",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nfunction fn() {\n  return new ((() => {\n    'use strict';\n    var _priv = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_priv');\n    function _initialize() {\n      Object.defineProperty(this, _priv, {\n        writable: true,\n        value: void 0,\n      });\n    }\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      _initialize.call(this);\n    };\n    Object.defineProperty(_Class.prototype, 'method', {\n      value: Object.defineProperty(\n        function (obj) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _priv);\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })())();\n}",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nfunction fn() {\n  return new ((() => {\n    'use strict';\n    var _priv = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_priv');\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class.prototype, 'method', {\n      value: Object.defineProperty(\n        function (obj) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _priv);\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    Object.defineProperty(_Class, _priv, {\n      writable: true,\n      value: void 0,\n    });\n    return _Class;\n  })())();\n}",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet hasW, hasX, hasY, hasZ;\nlet halfConstructed;\nlet F = (() => {\n  'use strict';\n  var _z = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_z');\n  var _y = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_y');\n  var _w = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_w');\n  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_x');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  function _initialize() {\n    Object.defineProperty(this, _z, { value: _privateMethod });\n    Object.defineProperty(this, _w, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _y, {\n      writable: true,\n      value: (() => {\n        halfConstructed = this;\n        throw 'error';\n      })(),\n    });\n  }\n  const F = function F() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(F.prototype, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        hasW = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);\n        hasX = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        hasY = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);\n        hasZ = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(F, 'prototype', { writable: false });\n  return F;\n})();\ntry {\n  new F();\n} catch {}\nhalfConstructed.m();\nexpect(hasW).toBe(true);\nexpect(hasX).toBe(true);\nexpect(hasY).toBe(false);\nexpect(hasZ).toBe(true);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet F = (() => {\n  'use strict';\n  var _z = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_z');\n  var _y = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_y');\n  var _w = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_w');\n  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_x');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  function _initialize() {\n    Object.defineProperty(this, _z, { value: _privateMethod });\n    Object.defineProperty(this, _w, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _y, {\n      writable: true,\n      value: (() => {\n        throw 'error';\n      })(),\n    });\n  }\n  const F = function F() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(F.prototype, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(F, 'prototype', { writable: false });\n  return F;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet hasW, hasX, hasY, hasZ;\nlet halfConstructed;\ntry {\n  let F = (() => {\n    'use strict';\n    var _z = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_z');\n    var _y = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_y');\n    var _w = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_w');\n    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_x');\n    var _privateMethod = function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    };\n    const F = function F() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(F, 'm', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          hasW = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);\n          hasX = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n          hasY = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);\n          hasZ = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);\n        },\n        'name',\n        {\n          value: 'm',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(F, 'prototype', { writable: false });\n    Object.defineProperty(F, _z, { value: _privateMethod });\n    Object.defineProperty(F, _w, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(F, _x, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(F, _y, {\n      writable: true,\n      value: (() => {\n        halfConstructed = F;\n        throw 'error';\n      })(),\n    });\n    return F;\n  })();\n} catch {}\nhalfConstructed.m();\nexpect(hasW).toBe(true);\nexpect(hasX).toBe(true);\nexpect(hasY).toBe(false);\nexpect(hasZ).toBe(true);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet F = (() => {\n  'use strict';\n  var _z = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_z');\n  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_x');\n  var _y = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_y');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  const F = function F() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(F, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(F, 'prototype', { writable: false });\n  Object.defineProperty(F, _z, { value: _privateMethod });\n  Object.defineProperty(F, _x, {\n    writable: true,\n    value: 0,\n  });\n  Object.defineProperty(F, _y, {\n    writable: true,\n    value: (() => {\n      throw 'error';\n    })(),\n  });\n  return F;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet A = (() => {\n  'use strict';\n  var _m = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_m');\n  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_x');\n  var _privateMethod = function () {\n    if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n  };\n  function _initialize() {\n    Object.defineProperty(this, _m, { value: _privateMethod });\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: void 0,\n    });\n  }\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _initialize.call(this);\n  };\n  Object.defineProperty(A.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _m);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _m);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),\n};\nfunction _classPrivateFieldLooseBase(e, s, a) {\n  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nvar _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet A = (() => {\n  'use strict';\n  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_foo');\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let A = function fn(A) {\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(A), _foo);\n        };\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  Object.defineProperty(A, _foo, {\n    writable: true,\n    value: void 0,\n  });\n  return A;\n})();",
] as const;

export const fixtureCases = [
  {
    title: 'assumption privateFieldsAsProperties — accessor (input)',
    source: 'class Foo {\n  get #foo() {}\n\n  test(other) {\n    return #foo in other;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — compiled classes (input)',
    source:
      'class Foo {\n  static #foo = "foo";\n  #bar = "bar";\n\n  static test() {\n    return #foo in Foo;\n  }\n\n  test() {\n    return #bar in this;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — field (input)',
    source: 'class Foo {\n  #foo = 1;\n\n  test(other) {\n    return #foo in other;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — method (exec)',
    source:
      'class Foo {\n  #foo() { }\n  #foo2() { }\n\n  test(other) {\n    return #foo in other;\n  }\n  test2(other) {\n    return #foo2 in other;\n  }\n}\n\nconst cl = new Foo();\n\nexpect(cl.test({})).toBe(false);\nexpect(cl.test(cl)).toBe(true);\nexpect(cl.test2({})).toBe(false);\nexpect(cl.test2(cl)).toBe(true);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — method (input)',
    source:
      'class Foo {\n  #foo() { }\n  #foo2() { }\n\n  test(other) {\n    return #foo in other;\n  }\n  test2(other) {\n    return #foo2 in other;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — nested class other redeclared (input)',
    source:
      'class Foo {\n  #foo = 1;\n  #bar = 1;\n\n  test() {\n    class Nested {\n      #bar = 2;\n\n      test() {\n        #foo in this;\n        #bar in this;\n      }\n    }\n\n    #foo in this;\n    #bar in this;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — nested class redeclared (input)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested {\n      #foo = 2;\n\n      test() {\n        #foo in this;\n      }\n    }\n\n    #foo in this;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — nested class (input)',
    source:
      'class Foo {\n  #foo = 1;\n\n  test() {\n    class Nested {\n      test() {\n        #foo in this;\n      }\n    }\n\n    #foo in this;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — rhs not object (exec)',
    source:
      "expect(() => class { static #p = #p in 0 }).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(() => class { static #p = #p in \"\" }).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(() => class { static #p = #p in true }).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(() => class { static #p = #p in void 0 }).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(() => class { static #p = #p in null }).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(() => class { static #p = #p in Symbol.iterator }).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(() => class { static #p = #p in 0n }).toThrow(`right-hand side of 'in' should be an object, got bigint`);\n\nexpect(() => class { static #p() {}; static q = #p in 0 }).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(() => class { static #p() {}; static q = #p in \"\" }).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(() => class { static #p() {}; static q = #p in true }).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(() => class { static #p() {}; static q = #p in void 0 }).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(() => class { static #p() {}; static q = #p in null }).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(() => class { static #p() {}; static q = #p in Symbol.iterator }).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(() => class { static #p() {}; static q = #p in 0n }).toThrow(`right-hand side of 'in' should be an object, got bigint`);\n\nexpect(() => new class { #p = #p in 0 }).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(() => new class { #p = #p in \"\" }).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(() => new class { #p = #p in true }).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(() => new class { #p = #p in void 0 }).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(() => new class { #p = #p in null }).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(() => new class { #p = #p in Symbol.iterator }).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(() => new class { #p = #p in 0n }).toThrow(`right-hand side of 'in' should be an object, got bigint`);\n\nexpect(() => new class { #p() {}; q = #p in 0 }).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(() => new class { #p() {}; q = #p in \"\" }).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(() => new class { #p() {}; q = #p in true }).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(() => new class { #p() {}; q = #p in void 0 }).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(() => new class { #p() {}; q = #p in null }).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(() => new class { #p() {}; q = #p in Symbol.iterator }).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(() => new class { #p() {}; q = #p in 0n }).toThrow(`right-hand side of 'in' should be an object, got bigint`);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — static accessor (input)',
    source:
      'class Foo {\n  static get #foo() {}\n\n  test(other) {\n    return #foo in other;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — static field (input)',
    source:
      'class Foo {\n  static #foo = 1;\n\n  test(other) {\n    return #foo in other;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsProperties — static method (input)',
    source:
      'class Foo {\n  static #foo() {}\n\n  test(other) {\n    return #foo in other;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'assumption privateFieldsAsSymbols — method (input)',
    source:
      'class Foo {\n  #foo() { }\n  #foo2() { }\n\n  test(other) {\n    return #foo in other;\n  }\n  test2(other) {\n    return #foo in other;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'private loose — method (input)',
    source: 'class Foo {\n  #foo() {}\n\n  test(other) {\n    return #foo in other;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'private loose — static shadow (exec)',
    source:
      'class Test {\n\n  static #x = 1\n\n  method(other) {\n    const Test = 2;\n    const func = () => {\n      const Test = 3;\n      return #x in other && Test;\n    }\n    return func() + Test;\n  }\n}\n\nconst t = new Test();\nconst t2 = new Test();\nexpect(t.method(Test)).toBe(5)\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'private loose — static shadow (input)',
    source:
      'class Test {\n\n  static #x = 1\n\n  method(other) {\n    const Test = 2;\n    const func = () => {\n      const Test = 3;\n      return #x in other && Test;\n    }\n    return func() + Test;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'to native fields — class expression in default param (input)',
    source: '(x = class {\n  #foo;\n  test(other) { return #foo in other }\n}) => {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'to native fields — class expression instance (input)',
    source:
      'function fn() {\n  return new class {\n    #priv;\n\n    method(obj) {\n      return #priv in obj;\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'to native fields — class expression static (input)',
    source:
      'function fn() {\n  return new class {\n    static #priv;\n\n    method(obj) {\n      return #priv in obj;\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'to native fields — half constructed instance (exec)',
    source:
      'let hasW, hasX, hasY, hasZ;\nlet halfConstructed;\n\nclass F {\n  m() {\n    hasW = #w in this;\n    hasX = #x in this;\n    hasY = #y in this;\n    hasZ = #z in this;\n  }\n  get #w() {}\n  #x = 0;\n  #y = (() => {\n    halfConstructed = this;\n    throw "error";\n  })();\n  #z() {}\n}\n\ntry {\n  new F();\n} catch {}\nhalfConstructed.m();\n\nexpect(hasW).toBe(true);\nexpect(hasX).toBe(true);\nexpect(hasY).toBe(false);\nexpect(hasZ).toBe(true);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'to native fields — half constructed instance (input)',
    source:
      "class F {\n  m() {\n    #w in this;\n    #x in this;\n    #y in this;\n    #z in this;\n  }\n  get #w() {}\n  #x = 0;\n  #y = (() => {\n    throw 'error';\n  })();\n  #z() {}\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'to native fields — half constructed static (exec)',
    source:
      'let hasW, hasX, hasY, hasZ;\nlet halfConstructed;\n\ntry {\n  class F {\n    static m() {\n      hasW = #w in this;\n      hasX = #x in this;\n      hasY = #y in this;\n      hasZ = #z in this;\n    }\n    static get #w() {}\n    static #x = 0;\n    static #y = (() => {\n      halfConstructed = this;\n      throw "error";\n    })();\n    static #z() {}\n  }\n} catch {}\n\nhalfConstructed.m();\n\nexpect(hasW).toBe(true);\nexpect(hasX).toBe(true);\nexpect(hasY).toBe(false);\nexpect(hasZ).toBe(true);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'to native fields — half constructed static (input)',
    source:
      "class F {\n  static m() {\n    #x in this;\n    #y in this;\n    #z in this;\n  }\n  static #x = 0;\n  static #y = (() => {\n    throw 'error';\n  })();\n  static #z() {}\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'to native fields — multiple checks (input)',
    source:
      'class A {\n  #x;\n  #m() {}\n\n  test() {\n    #x in this;\n    #m in this;\n    #x in this;\n    #m in this;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
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
    title: 'to native fields — static shadowed binding (input)',
    source:
      'class A {\n  static #foo;\n\n  test() {\n    let A = function fn(A) {\n      return #foo in A;\n    };\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privatePropertyInObject: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[24],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
