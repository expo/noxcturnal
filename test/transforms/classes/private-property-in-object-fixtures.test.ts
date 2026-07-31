import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  var _bar = '__private_Foo_bar';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 'bar',\n    });\n  };\n  Object.defineProperty(Foo, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(Foo), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _foo, {\n    writable: true,\n    value: 'foo',\n  });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  var _foo2 = '__private_Foo_foo2';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _foo2, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'test2', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo2);\n      },\n      'name',\n      {\n        value: 'test2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nconst cl = new Foo();\nexpect(cl.test({})).toBe(false);\nexpect(cl.test(cl)).toBe(true);\nexpect(cl.test2({})).toBe(false);\nexpect(cl.test2(cl)).toBe(true);",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  var _foo2 = '__private_Foo_foo2';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _foo2, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'test2', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo2);\n      },\n      'name',\n      {\n        value: 'test2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  var _bar = '__private_Foo_bar';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n    Object.defineProperty(this, _bar, {\n      writable: true,\n      value: 1,\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let Nested = (() => {\n          'use strict';\n          var _bar13 = '__private_Nested_bar';\n          const Nested = function Nested() {\n            if (!new.target) throw new TypeError('Cannot call a class as a function');\n            Object.defineProperty(this, _bar13, {\n              writable: true,\n              value: 2,\n            });\n          };\n          Object.defineProperty(Nested.prototype, 'test', {\n            value: Object.defineProperty(\n              function () {\n                if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar13);\n              },\n              'name',\n              {\n                value: 'test',\n                configurable: true,\n              },\n            ),\n            writable: true,\n            configurable: true,\n          });\n          Object.defineProperty(Nested, 'prototype', { writable: false });\n          return Nested;\n        })();\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let Nested = (() => {\n          'use strict';\n          var _foo12 = '__private_Nested_foo';\n          const Nested = function Nested() {\n            if (!new.target) throw new TypeError('Cannot call a class as a function');\n            Object.defineProperty(this, _foo12, {\n              writable: true,\n              value: 2,\n            });\n          };\n          Object.defineProperty(Nested.prototype, 'test', {\n            value: Object.defineProperty(\n              function () {\n                if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo12);\n              },\n              'name',\n              {\n                value: 'test',\n                configurable: true,\n              },\n            ),\n            writable: true,\n            configurable: true,\n          });\n          Object.defineProperty(Nested, 'prototype', { writable: false });\n          return Nested;\n        })();\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      writable: true,\n      value: 1,\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let Nested = (() => {\n          'use strict';\n          const Nested = function Nested() {\n            if (!new.target) throw new TypeError('Cannot call a class as a function');\n          };\n          Object.defineProperty(Nested.prototype, 'test', {\n            value: Object.defineProperty(\n              function () {\n                if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n              },\n              'name',\n              {\n                value: 'test',\n                configurable: true,\n              },\n            ),\n            writable: true,\n            configurable: true,\n          });\n          Object.defineProperty(Nested, 'prototype', { writable: false });\n          return Nested;\n        })();\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p = '__private__Class_p';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    Object.defineProperty(_Class, _p, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p),\n    });\n    return _Class;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p12 = '__private__Class11_p';\n    const _Class11 = function _Class11() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class11, 'prototype', { writable: false });\n    Object.defineProperty(_Class11, _p12, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p12),\n    });\n    return _Class11;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p14 = '__private__Class13_p';\n    const _Class13 = function _Class13() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class13, 'prototype', { writable: false });\n    Object.defineProperty(_Class13, _p14, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p14),\n    });\n    return _Class13;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p16 = '__private__Class15_p';\n    const _Class15 = function _Class15() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class15, 'prototype', { writable: false });\n    Object.defineProperty(_Class15, _p16, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p16),\n    });\n    return _Class15;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p18 = '__private__Class17_p';\n    const _Class17 = function _Class17() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class17, 'prototype', { writable: false });\n    Object.defineProperty(_Class17, _p18, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p18),\n    });\n    return _Class17;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p20 = '__private__Class19_p';\n    const _Class19 = function _Class19() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class19, 'prototype', { writable: false });\n    Object.defineProperty(_Class19, _p20, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p20),\n    });\n    return _Class19;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p22 = '__private__Class21_p';\n    const _Class21 = function _Class21() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class21, 'prototype', { writable: false });\n    Object.defineProperty(_Class21, _p22, {\n      writable: true,\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p22),\n    });\n    return _Class21;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got bigint`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p24 = '__private__Class23_p';\n    const _Class23 = function _Class23() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class23, 'prototype', { writable: false });\n    Object.defineProperty(_Class23, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p24),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(_Class23, _p24, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return _Class23;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p26 = '__private__Class25_p';\n    const _Class25 = function _Class25() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class25, 'prototype', { writable: false });\n    Object.defineProperty(_Class25, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p26),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(_Class25, _p26, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return _Class25;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p28 = '__private__Class27_p';\n    const _Class27 = function _Class27() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class27, 'prototype', { writable: false });\n    Object.defineProperty(_Class27, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p28),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(_Class27, _p28, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return _Class27;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p30 = '__private__Class29_p';\n    const _Class29 = function _Class29() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class29, 'prototype', { writable: false });\n    Object.defineProperty(_Class29, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p30),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(_Class29, _p30, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return _Class29;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p32 = '__private__Class31_p';\n    const _Class31 = function _Class31() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class31, 'prototype', { writable: false });\n    Object.defineProperty(_Class31, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p32),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(_Class31, _p32, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return _Class31;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p34 = '__private__Class33_p';\n    const _Class33 = function _Class33() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class33, 'prototype', { writable: false });\n    Object.defineProperty(_Class33, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p34),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(_Class33, _p34, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return _Class33;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(() =>\n  (() => {\n    'use strict';\n    var _p36 = '__private__Class35_p';\n    const _Class35 = function _Class35() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class35, 'prototype', { writable: false });\n    Object.defineProperty(_Class35, 'q', {\n      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p36),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(_Class35, _p36, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return _Class35;\n  })(),\n).toThrow(`right-hand side of 'in' should be an object, got bigint`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p38 = '__private__Class37_p';\n      const _Class37 = function _Class37() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, _p38, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p38),\n        });\n      };\n      Object.defineProperty(_Class37, 'prototype', { writable: false });\n      return _Class37;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p40 = '__private__Class39_p';\n      const _Class39 = function _Class39() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, _p40, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p40),\n        });\n      };\n      Object.defineProperty(_Class39, 'prototype', { writable: false });\n      return _Class39;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p42 = '__private__Class41_p';\n      const _Class41 = function _Class41() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, _p42, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p42),\n        });\n      };\n      Object.defineProperty(_Class41, 'prototype', { writable: false });\n      return _Class41;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p44 = '__private__Class43_p';\n      const _Class43 = function _Class43() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, _p44, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p44),\n        });\n      };\n      Object.defineProperty(_Class43, 'prototype', { writable: false });\n      return _Class43;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p46 = '__private__Class45_p';\n      const _Class45 = function _Class45() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, _p46, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p46),\n        });\n      };\n      Object.defineProperty(_Class45, 'prototype', { writable: false });\n      return _Class45;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p48 = '__private__Class47_p';\n      const _Class47 = function _Class47() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, _p48, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p48),\n        });\n      };\n      Object.defineProperty(_Class47, 'prototype', { writable: false });\n      return _Class47;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p50 = '__private__Class49_p';\n      const _Class49 = function _Class49() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, _p50, {\n          writable: true,\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p50),\n        });\n      };\n      Object.defineProperty(_Class49, 'prototype', { writable: false });\n      return _Class49;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got bigint`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p52 = '__private__Class51_p';\n      const _Class51 = function _Class51() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p52),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n        Object.defineProperty(this, _p52, {\n          value: function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          },\n        });\n      };\n      Object.defineProperty(_Class51, 'prototype', { writable: false });\n      return _Class51;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got number`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p54 = '__private__Class53_p';\n      const _Class53 = function _Class53() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p54),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n        Object.defineProperty(this, _p54, {\n          value: function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          },\n        });\n      };\n      Object.defineProperty(_Class53, 'prototype', { writable: false });\n      return _Class53;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got string`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p56 = '__private__Class55_p';\n      const _Class55 = function _Class55() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p56),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n        Object.defineProperty(this, _p56, {\n          value: function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          },\n        });\n      };\n      Object.defineProperty(_Class55, 'prototype', { writable: false });\n      return _Class55;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got boolean`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p58 = '__private__Class57_p';\n      const _Class57 = function _Class57() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p58),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n        Object.defineProperty(this, _p58, {\n          value: function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          },\n        });\n      };\n      Object.defineProperty(_Class57, 'prototype', { writable: false });\n      return _Class57;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got undefined`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p60 = '__private__Class59_p';\n      const _Class59 = function _Class59() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p60),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n        Object.defineProperty(this, _p60, {\n          value: function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          },\n        });\n      };\n      Object.defineProperty(_Class59, 'prototype', { writable: false });\n      return _Class59;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got null`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p62 = '__private__Class61_p';\n      const _Class61 = function _Class61() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p62),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n        Object.defineProperty(this, _p62, {\n          value: function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          },\n        });\n      };\n      Object.defineProperty(_Class61, 'prototype', { writable: false });\n      return _Class61;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got symbol`);\nexpect(\n  () =>\n    new ((() => {\n      'use strict';\n      var _p64 = '__private__Class63_p';\n      const _Class63 = function _Class63() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        Object.defineProperty(this, 'q', {\n          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p64),\n          enumerable: true,\n          configurable: true,\n          writable: true,\n        });\n        Object.defineProperty(this, _p64, {\n          value: function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          },\n        });\n      };\n      Object.defineProperty(_Class63, 'prototype', { writable: false });\n      return _Class63;\n    })())(),\n).toThrow(`right-hand side of 'in' should be an object, got bigint`);",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _foo, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _foo, {\n    writable: true,\n    value: 1,\n  });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _foo, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  var _foo2 = '__private_Foo_foo2';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _foo2, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'test2', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Foo = (() => {\n  'use strict';\n  var _foo = '__private_Foo_foo';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'test', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Test = (() => {\n  'use strict';\n  var _x = '__private_Test_x';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'method', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const Test = 2;\n        const func = () => {\n          const Test = 3;\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _x) && Test;\n        };\n        return func() + Test;\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  Object.defineProperty(Test, _x, {\n    writable: true,\n    value: 1,\n  });\n  return Test;\n})();\nconst t = new Test();\nconst t2 = new Test();\nexpect(t.method(Test)).toBe(5);",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet Test = (() => {\n  'use strict';\n  var _x = '__private_Test_x';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'method', {\n    value: Object.defineProperty(\n      function (other) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const Test = 2;\n        const func = () => {\n          const Test = 3;\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _x) && Test;\n        };\n        return func() + Test;\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  Object.defineProperty(Test, _x, {\n    writable: true,\n    value: 1,\n  });\n  return Test;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\n(\n  x = (() => {\n    'use strict';\n    var _foo = '__private__Class_foo';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      Object.defineProperty(this, _foo, {\n        writable: true,\n        value: void 0,\n      });\n    };\n    Object.defineProperty(_Class.prototype, 'test', {\n      value: Object.defineProperty(\n        function (other) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);\n        },\n        'name',\n        {\n          value: 'test',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })(),\n) => {};",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nfunction fn() {\n  return new ((() => {\n    'use strict';\n    var _priv = '__private__Class_priv';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      Object.defineProperty(this, _priv, {\n        writable: true,\n        value: void 0,\n      });\n    };\n    Object.defineProperty(_Class.prototype, 'method', {\n      value: Object.defineProperty(\n        function (obj) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _priv);\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })())();\n}",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nfunction fn() {\n  return new ((() => {\n    'use strict';\n    var _priv = '__private__Class_priv';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class.prototype, 'method', {\n      value: Object.defineProperty(\n        function (obj) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _priv);\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    Object.defineProperty(_Class, _priv, {\n      writable: true,\n      value: void 0,\n    });\n    return _Class;\n  })())();\n}",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet hasW, hasX, hasY, hasZ;\nlet halfConstructed;\nlet F = (() => {\n  'use strict';\n  var _z = '__private_F_z';\n  var _y = '__private_F_y';\n  var _w = '__private_F_w';\n  var _x = '__private_F_x';\n  const F = function F() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _y, {\n      writable: true,\n      value: (() => {\n        halfConstructed = this;\n        throw 'error';\n      })(),\n    });\n    Object.defineProperty(this, _z, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _w, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(F.prototype, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        hasW = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);\n        hasX = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        hasY = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);\n        hasZ = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(F, 'prototype', { writable: false });\n  return F;\n})();\ntry {\n  new F();\n} catch {}\nhalfConstructed.m();\nexpect(hasW).toBe(true);\nexpect(hasX).toBe(true);\nexpect(hasY).toBe(false);\nexpect(hasZ).toBe(true);",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet F = (() => {\n  'use strict';\n  var _z = '__private_F_z';\n  var _y = '__private_F_y';\n  var _w = '__private_F_w';\n  var _x = '__private_F_x';\n  const F = function F() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _y, {\n      writable: true,\n      value: (() => {\n        throw 'error';\n      })(),\n    });\n    Object.defineProperty(this, _z, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _w, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(F.prototype, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(F, 'prototype', { writable: false });\n  return F;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet hasW, hasX, hasY, hasZ;\nlet halfConstructed;\ntry {\n  let F = (() => {\n    'use strict';\n    var _z = '__private_F_z';\n    var _y = '__private_F_y';\n    var _w = '__private_F_w';\n    var _x = '__private_F_x';\n    const F = function F() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(F, 'm', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          hasW = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);\n          hasX = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n          hasY = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);\n          hasZ = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);\n        },\n        'name',\n        {\n          value: 'm',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(F, 'prototype', { writable: false });\n    Object.defineProperty(F, _x, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(F, _y, {\n      writable: true,\n      value: (() => {\n        halfConstructed = F;\n        throw 'error';\n      })(),\n    });\n    Object.defineProperty(F, _z, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(F, _w, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return F;\n  })();\n} catch {}\nhalfConstructed.m();\nexpect(hasW).toBe(true);\nexpect(hasX).toBe(true);\nexpect(hasY).toBe(false);\nexpect(hasZ).toBe(true);",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet F = (() => {\n  'use strict';\n  var _z = '__private_F_z';\n  var _x = '__private_F_x';\n  var _y = '__private_F_y';\n  const F = function F() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(F, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(F, 'prototype', { writable: false });\n  Object.defineProperty(F, _x, {\n    writable: true,\n    value: 0,\n  });\n  Object.defineProperty(F, _y, {\n    writable: true,\n    value: (() => {\n      throw 'error';\n    })(),\n  });\n  Object.defineProperty(F, _z, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return F;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet A = (() => {\n  'use strict';\n  var _m = '__private_A_m';\n  var _x = '__private_A_x';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _x, {\n      writable: true,\n      value: void 0,\n    });\n    Object.defineProperty(this, _m, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(A.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _m);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);\n        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _m);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },\n  _checkInRHS = _checkInRHS2.checkInRHS;\nlet A = (() => {\n  'use strict';\n  var _foo = '__private_A_foo';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let A = function fn(A) {\n          return Object.prototype.hasOwnProperty.call(_checkInRHS(A), _foo);\n        };\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  Object.defineProperty(A, _foo, {\n    writable: true,\n    value: void 0,\n  });\n  return A;\n})();",
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
