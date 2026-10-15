import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Test = (__nox_super_0_231 => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_231, arguments, _newtarget || Test);\n      return _this;\n    }\n    var _result = function () {\n      woops.super.test();\n      _super();\n      _get(Object.getPrototypeOf(Test.prototype), 'test', _this).call(_this);\n      _super(...arguments);\n      _super('test', ...arguments);\n      _get(Object.getPrototypeOf(Test.prototype), 'test', _this).call(_this, ...arguments);\n      _get(Object.getPrototypeOf(Test.prototype), 'test', _this).call(_this, 'test', ...arguments);\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_231 !== null && typeof __nox_super_0_231 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test.prototype = Object.create(__nox_super_0_231 && __nox_super_0_231.prototype, {\n    constructor: {\n      value: Test,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_231);\n  else Test.__proto__ = __nox_super_0_231;\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})(Foo);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Test = (__nox_super_0_102 => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_102, [], new.target || Test);\n    var _result = function () {\n      _get(Object.getPrototypeOf(Test.prototype), 'test', this);\n      _get(Object.getPrototypeOf(Test.prototype), 'test', this).whatever;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_102 !== null && typeof __nox_super_0_102 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test.prototype = Object.create(__nox_super_0_102 && __nox_super_0_102.prototype, {\n    constructor: {\n      value: Test,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_102);\n  else Test.__proto__ = __nox_super_0_102;\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})(Foo);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Test = (__nox_super_0_87 => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_87, arguments, _newtarget || Test);\n      return _this;\n    }\n    var _result = function () {\n      _get(Object.getPrototypeOf(Test.prototype), 'foo', _this)?.bar;\n      _get(Object.getPrototypeOf(Test.prototype), 'foo', _this)?.();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_87 !== null && typeof __nox_super_0_87 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test.prototype = Object.create(__nox_super_0_87 && __nox_super_0_87.prototype, {\n    constructor: {\n      value: Test,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_87);\n  else Test.__proto__ = __nox_super_0_87;\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})(Foo);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Test = (__nox_super_0_153 => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_153, [], new.target || Test);\n    var _result = function () {\n      _get(Object.getPrototypeOf(Test.prototype), 'test', this).whatever();\n      _get(Object.getPrototypeOf(Test.prototype), 'test', this).call(this);\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_153 !== null && typeof __nox_super_0_153 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test.prototype = Object.create(__nox_super_0_153 && __nox_super_0_153.prototype, {\n    constructor: {\n      value: Test,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_153);\n  else Test.__proto__ = __nox_super_0_153;\n  Object.defineProperty(Test, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Test), 'wow', this).call(this);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})(Foo);",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    return super.constructor;\n  };\n  Object.defineProperty(Test, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return super.constructor;\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();\n// Instances\nexpect(Object.getPrototypeOf(Test.prototype)).toBe(Object.prototype);\nexpect(new Test()).toBe(Object);\n// Static\nexpect(Object.getPrototypeOf(Test)).toBe(Function.prototype);\nexpect(Test.test()).toBe(Function);",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    super.hasOwnProperty('test');\n  };\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "let A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "let A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    console.log('a');\n  };\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nlet B = (() => {\n  'use strict';\n  const B = function B() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(B.prototype, 'b', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        console.log('b');\n      },\n      'name',\n      {\n        value: 'b',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(B, 'prototype', { writable: false });\n  return B;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet B = (() => {\n  'use strict';\n  const B = function B() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(B, 'prototype', { writable: false });\n  return B;\n})();\nlet A = (__nox_super_12_121 => {\n  'use strict';\n  const A = function A(track) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_12_121, arguments, _newtarget || A);\n      return _this;\n    }\n    var _result = function () {\n      if (track !== undefined) _super(track);\n      else _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_12_121 !== null && typeof __nox_super_12_121 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  A.prototype = Object.create(__nox_super_12_121 && __nox_super_12_121.prototype, {\n    constructor: {\n      value: A,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(A, __nox_super_12_121);\n  else A.__proto__ = __nox_super_12_121;\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})(B);",
  "let Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'bar', {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var o = (() => {\n  'use strict';\n  const _Class = function _Class() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class, 'name', {\n    value: 'o',\n    configurable: true,\n  });\n  Object.defineProperty(_Class.prototype, '𠮷野家', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: '𠮷野家',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(_Class, 'prototype', { writable: false });\n  return _Class;\n})();",
  "// @flow\n// @flow\nlet C = (() => {\n  'use strict';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(C.prototype, 'm', {\n    value: Object.defineProperty(\n      function (x) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'a';\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(C, 'prototype', { writable: false });\n  return C;\n})();",
  "let Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'a', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'a',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'b', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'b',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test.prototype, 'c', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'c',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "'use strict';\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet ListBuffer = (__nox_super_0_39 => {\n  'use strict';\n  const ListBuffer = function ListBuffer() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_39, arguments, new.target || ListBuffer);\n    return _this;\n  };\n  if (__nox_super_0_39 !== null && typeof __nox_super_0_39 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  ListBuffer.prototype = Object.create(__nox_super_0_39 && __nox_super_0_39.prototype, {\n    constructor: {\n      value: ListBuffer,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(ListBuffer, __nox_super_0_39);\n  else ListBuffer.__proto__ = __nox_super_0_39;\n  Object.defineProperty(ListBuffer, 'prototype', { writable: false });\n  return ListBuffer;\n})(ArrayBuffer);\nexpect(new ListBuffer()).toBeInstanceOf(ListBuffer);\nexpect(new ListBuffer()).toBeInstanceOf(ArrayBuffer);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet ListBuffer = (__nox_super_0_39 => {\n  'use strict';\n  const ListBuffer = function ListBuffer() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_39, arguments, new.target || ListBuffer);\n    return _this;\n  };\n  if (__nox_super_0_39 !== null && typeof __nox_super_0_39 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  ListBuffer.prototype = Object.create(__nox_super_0_39 && __nox_super_0_39.prototype, {\n    constructor: {\n      value: ListBuffer,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(ListBuffer, __nox_super_0_39);\n  else ListBuffer.__proto__ = __nox_super_0_39;\n  Object.defineProperty(ListBuffer, 'prototype', { writable: false });\n  return ListBuffer;\n})(ArrayBuffer);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet SharedListBuffer = (__nox_super_0_51 => {\n  'use strict';\n  const SharedListBuffer = function SharedListBuffer() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_51, arguments, new.target || SharedListBuffer);\n    return _this;\n  };\n  if (__nox_super_0_51 !== null && typeof __nox_super_0_51 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  SharedListBuffer.prototype = Object.create(__nox_super_0_51 && __nox_super_0_51.prototype, {\n    constructor: {\n      value: SharedListBuffer,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(SharedListBuffer, __nox_super_0_51);\n  else SharedListBuffer.__proto__ = __nox_super_0_51;\n  Object.defineProperty(SharedListBuffer, 'prototype', { writable: false });\n  return SharedListBuffer;\n})(SharedArrayBuffer);\nexpect(new SharedListBuffer()).toBeInstanceOf(SharedListBuffer);\nexpect(new SharedListBuffer()).toBeInstanceOf(SharedArrayBuffer);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet SharedListBuffer = (__nox_super_0_51 => {\n  'use strict';\n  const SharedListBuffer = function SharedListBuffer() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_51, arguments, new.target || SharedListBuffer);\n    return _this;\n  };\n  if (__nox_super_0_51 !== null && typeof __nox_super_0_51 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  SharedListBuffer.prototype = Object.create(__nox_super_0_51 && __nox_super_0_51.prototype, {\n    constructor: {\n      value: SharedListBuffer,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(SharedListBuffer, __nox_super_0_51);\n  else SharedListBuffer.__proto__ = __nox_super_0_51;\n  Object.defineProperty(SharedListBuffer, 'prototype', { writable: false });\n  return SharedListBuffer;\n})(SharedArrayBuffer);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet BigInt64List = (__nox_super_0_43 => {\n  'use strict';\n  const BigInt64List = function BigInt64List() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_43, arguments, new.target || BigInt64List);\n    return _this;\n  };\n  if (__nox_super_0_43 !== null && typeof __nox_super_0_43 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  BigInt64List.prototype = Object.create(__nox_super_0_43 && __nox_super_0_43.prototype, {\n    constructor: {\n      value: BigInt64List,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(BigInt64List, __nox_super_0_43);\n  else BigInt64List.__proto__ = __nox_super_0_43;\n  Object.defineProperty(BigInt64List, 'prototype', { writable: false });\n  return BigInt64List;\n})(BigInt64Array);\nexpect(new BigInt64List()).toBeInstanceOf(BigInt64List);\nexpect(new BigInt64List()).toBeInstanceOf(BigInt64Array);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet BigInt64List = (__nox_super_0_43 => {\n  'use strict';\n  const BigInt64List = function BigInt64List() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_43, arguments, new.target || BigInt64List);\n    return _this;\n  };\n  if (__nox_super_0_43 !== null && typeof __nox_super_0_43 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  BigInt64List.prototype = Object.create(__nox_super_0_43 && __nox_super_0_43.prototype, {\n    constructor: {\n      value: BigInt64List,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(BigInt64List, __nox_super_0_43);\n  else BigInt64List.__proto__ = __nox_super_0_43;\n  Object.defineProperty(BigInt64List, 'prototype', { writable: false });\n  return BigInt64List;\n})(BigInt64Array);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet MergedError = (__nox_super_0_43 => {\n  'use strict';\n  const MergedError = function MergedError() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_43, arguments, new.target || MergedError);\n    return _this;\n  };\n  if (__nox_super_0_43 !== null && typeof __nox_super_0_43 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  MergedError.prototype = Object.create(__nox_super_0_43 && __nox_super_0_43.prototype, {\n    constructor: {\n      value: MergedError,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(MergedError, __nox_super_0_43);\n  else MergedError.__proto__ = __nox_super_0_43;\n  Object.defineProperty(MergedError, 'prototype', { writable: false });\n  return MergedError;\n})(AggregateError);\nexpect(new MergedError([])).toBeInstanceOf(MergedError);\nexpect(new MergedError([])).toBeInstanceOf(AggregateError);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet MergedError = (__nox_super_0_43 => {\n  'use strict';\n  const MergedError = function MergedError() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_43, arguments, new.target || MergedError);\n    return _this;\n  };\n  if (__nox_super_0_43 !== null && typeof __nox_super_0_43 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  MergedError.prototype = Object.create(__nox_super_0_43 && __nox_super_0_43.prototype, {\n    constructor: {\n      value: MergedError,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(MergedError, __nox_super_0_43);\n  else MergedError.__proto__ = __nox_super_0_43;\n  Object.defineProperty(MergedError, 'prototype', { writable: false });\n  return MergedError;\n})(AggregateError);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet List = (__nox_super_0_27 => {\n  'use strict';\n  const List = function List() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_27, arguments, new.target || List);\n    return _this;\n  };\n  if (__nox_super_0_27 !== null && typeof __nox_super_0_27 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  List.prototype = Object.create(__nox_super_0_27 && __nox_super_0_27.prototype, {\n    constructor: {\n      value: List,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_0_27);\n  else List.__proto__ = __nox_super_0_27;\n  Object.defineProperty(List, 'prototype', { writable: false });\n  return List;\n})(Array);\nexpect(new List()).toBeInstanceOf(List);\nexpect(new List()).toBeInstanceOf(Array);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet List = (__nox_super_0_27 => {\n  'use strict';\n  const List = function List() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_27, arguments, new.target || List);\n    return _this;\n  };\n  if (__nox_super_0_27 !== null && typeof __nox_super_0_27 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  List.prototype = Object.create(__nox_super_0_27 && __nox_super_0_27.prototype, {\n    constructor: {\n      value: List,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_0_27);\n  else List.__proto__ = __nox_super_0_27;\n  Object.defineProperty(List, 'prototype', { writable: false });\n  return List;\n})(Array);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet RangeIterator = (__nox_super_0_39 => {\n  'use strict';\n  const RangeIterator = function RangeIterator() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_39, arguments, new.target || RangeIterator);\n    return _this;\n  };\n  if (__nox_super_0_39 !== null && typeof __nox_super_0_39 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  RangeIterator.prototype = Object.create(__nox_super_0_39 && __nox_super_0_39.prototype, {\n    constructor: {\n      value: RangeIterator,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(RangeIterator, __nox_super_0_39);\n  else RangeIterator.__proto__ = __nox_super_0_39;\n  Object.defineProperty(RangeIterator, 'prototype', { writable: false });\n  return RangeIterator;\n})(Iterator);\nexpect(() => new RangeIterator()).toThrow(\"Constructor Iterator requires 'new'\");",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\n// Iterator can not be invoked with new, so this example does not\n// satisfy the superIsCallableConstructor assumption, it will throw\n// a runtime error\nlet RangeIterator = (__nox_super_153_192 => {\n  'use strict';\n  const RangeIterator = function RangeIterator() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_153_192, arguments, new.target || RangeIterator);\n    return _this;\n  };\n  if (__nox_super_153_192 !== null && typeof __nox_super_153_192 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  RangeIterator.prototype = Object.create(__nox_super_153_192 && __nox_super_153_192.prototype, {\n    constructor: {\n      value: RangeIterator,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(RangeIterator, __nox_super_153_192);\n  else RangeIterator.__proto__ = __nox_super_153_192;\n  Object.defineProperty(RangeIterator, 'prototype', { writable: false });\n  return RangeIterator;\n})(Iterator);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet BaseController = (__nox_super_0_52 => {\n  'use strict';\n  const BaseController = function BaseController() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_52, arguments, new.target || BaseController);\n    return _this;\n  };\n  if (__nox_super_0_52 !== null && typeof __nox_super_0_52 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  BaseController.prototype = Object.create(__nox_super_0_52 && __nox_super_0_52.prototype, {\n    constructor: {\n      value: BaseController,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(BaseController, __nox_super_0_52);\n  else BaseController.__proto__ = __nox_super_0_52;\n  Object.defineProperty(BaseController, 'prototype', { writable: false });\n  return BaseController;\n})(Chaplin.Controller);\nlet BaseController2 = (__nox_super_54_115 => {\n  'use strict';\n  const BaseController2 = function BaseController2() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_54_115, arguments, new.target || BaseController2);\n    return _this;\n  };\n  if (__nox_super_54_115 !== null && typeof __nox_super_54_115 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  BaseController2.prototype = Object.create(__nox_super_54_115 && __nox_super_54_115.prototype, {\n    constructor: {\n      value: BaseController2,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(BaseController2, __nox_super_54_115);\n  else BaseController2.__proto__ = __nox_super_54_115;\n  Object.defineProperty(BaseController2, 'prototype', { writable: false });\n  return BaseController2;\n})(Chaplin.Controller.Another);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Test = (__nox_super_0_92 => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_92, [], new.target || Test);\n    var _result = function () {\n      this;\n      this.prop = 1;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_92 !== null && typeof __nox_super_0_92 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test.prototype = Object.create(__nox_super_0_92 && __nox_super_0_92.prototype, {\n    constructor: {\n      value: Test,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_92);\n  else Test.__proto__ = __nox_super_0_92;\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})(Foo);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Test = (__nox_super_0_26 => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_26, arguments, new.target || Test);\n    return _this;\n  };\n  if (__nox_super_0_26 !== null && typeof __nox_super_0_26 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test.prototype = Object.create(__nox_super_0_26 && __nox_super_0_26.prototype, {\n    constructor: {\n      value: Test,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_26);\n  else Test.__proto__ = __nox_super_0_26;\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})(Foo);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\n// JSON is wrapped because it starts with an uppercase letter, but it\n// should not be possible to extend it anyway.\nexpect(() =>\n  (__nox_super_131_163 => {\n    'use strict';\n    const BetterJSON = function BetterJSON() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      var _this = _construct(__nox_super_131_163, arguments, new.target || BetterJSON);\n      return _this;\n    };\n    if (__nox_super_131_163 !== null && typeof __nox_super_131_163 !== 'function')\n      throw new TypeError('Super expression must either be null or a function');\n    BetterJSON.prototype = Object.create(__nox_super_131_163 && __nox_super_131_163.prototype, {\n      constructor: {\n        value: BetterJSON,\n        writable: true,\n        configurable: true,\n      },\n    });\n    if (Object.setPrototypeOf) Object.setPrototypeOf(BetterJSON, __nox_super_131_163);\n    else BetterJSON.__proto__ = __nox_super_131_163;\n    Object.defineProperty(BetterJSON, 'prototype', { writable: false });\n    return BetterJSON;\n  })(JSON),\n).toThrow();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\n// Imported from\n// https://github.com/WebReflection/babel-plugin-transform-builtin-classes/blob/85efe1374e1c59a8323c7eddd4326f6c93d9f64f/test/test.js\nlet List = (__nox_super_152_292 => {\n  'use strict';\n  const List = function List(value) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_152_292, arguments, _newtarget || List);\n      return _this;\n    }\n    var _result = function () {\n      _super().push(value);\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_152_292 !== null && typeof __nox_super_152_292 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  List.prototype = Object.create(__nox_super_152_292 && __nox_super_152_292.prototype, {\n    constructor: {\n      value: List,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_152_292);\n  else List.__proto__ = __nox_super_152_292;\n  Object.defineProperty(List.prototype, 'push', {\n    value: Object.defineProperty(\n      function (value) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _get(Object.getPrototypeOf(List.prototype), 'push', this).call(this, value);\n        return this;\n      },\n      'name',\n      {\n        value: 'push',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(List, 'prototype', { writable: false });\n  return List;\n})(Array);\nexpect(new List(1)).toBeInstanceOf(List);\nexpect(new List(2)).toBeInstanceOf(Array);\nvar l = new List(3);\nexpect(l).toHaveLength(1);\nexpect(l[0]).toBe(3);\nexpect(l.push(4)).toBe(l);\nexpect(l).toHaveLength(2);\nexpect(l.join()).toBe('3,4');\nlet SecondLevel = (__nox_super_535_603 => {\n  'use strict';\n  const SecondLevel = function SecondLevel() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_535_603, arguments, new.target || SecondLevel);\n    return _this;\n  };\n  if (__nox_super_535_603 !== null && typeof __nox_super_535_603 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  SecondLevel.prototype = Object.create(__nox_super_535_603 && __nox_super_535_603.prototype, {\n    constructor: {\n      value: SecondLevel,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(SecondLevel, __nox_super_535_603);\n  else SecondLevel.__proto__ = __nox_super_535_603;\n  Object.defineProperty(SecondLevel.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this;\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(SecondLevel, 'prototype', { writable: false });\n  return SecondLevel;\n})(List);\nexpect(new SecondLevel(1)).toBeInstanceOf(SecondLevel);\nexpect(new SecondLevel(2)).toBeInstanceOf(List);\nexpect(new SecondLevel(3)).toBeInstanceOf(Array);\nvar s = new SecondLevel(4);\nexpect(s).toHaveLength(1);\nexpect(s[0]).toBe(4);\nexpect(s.push(5)).toBe(s);\nexpect(s).toHaveLength(2);\nexpect(s.join()).toBe('4,5');\nexpect(s.method()).toBe(s);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar env = { Array: null };\n// We need to use \"with\" to avoid leaking the modified Array to other tests.\nwith (env) {\n  let List = (__nox_super_123_150 => {\n    'use strict';\n    const List = function List() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      var _this = _construct(__nox_super_123_150, arguments, new.target || List);\n      return _this;\n    };\n    if (__nox_super_123_150 !== null && typeof __nox_super_123_150 !== 'function')\n      throw new TypeError('Super expression must either be null or a function');\n    List.prototype = Object.create(__nox_super_123_150 && __nox_super_123_150.prototype, {\n      constructor: {\n        value: List,\n        writable: true,\n        configurable: true,\n      },\n    });\n    if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_123_150);\n    else List.__proto__ = __nox_super_123_150;\n    Object.defineProperty(List, 'prototype', { writable: false });\n    return List;\n  })(Array);\n  expect(List.prototype.__proto__).toBeUndefined();\n}",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Array = (() => {\n  'use strict';\n  const Array = function Array() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Array, 'prototype', { writable: false });\n  return Array;\n})();\nlet List = (__nox_super_16_43 => {\n  'use strict';\n  const List = function List() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_16_43, arguments, new.target || List);\n    return _this;\n  };\n  if (__nox_super_16_43 !== null && typeof __nox_super_16_43 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  List.prototype = Object.create(__nox_super_16_43 && __nox_super_16_43.prototype, {\n    constructor: {\n      value: List,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_16_43);\n  else List.__proto__ = __nox_super_16_43;\n  Object.defineProperty(List, 'prototype', { writable: false });\n  return List;\n})(Array);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar called = false;\nvar env = {\n  Array: function Array() {\n    called = true;\n  },\n};\n// We need to use \"with\" to avoid leaking the modified Array to other tests.\nwith (env) {\n  let List = (__nox_super_180_207 => {\n    'use strict';\n    const List = function List() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      var _this = _construct(__nox_super_180_207, arguments, new.target || List);\n      return _this;\n    };\n    if (__nox_super_180_207 !== null && typeof __nox_super_180_207 !== 'function')\n      throw new TypeError('Super expression must either be null or a function');\n    List.prototype = Object.create(__nox_super_180_207 && __nox_super_180_207.prototype, {\n      constructor: {\n        value: List,\n        writable: true,\n        configurable: true,\n      },\n    });\n    if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_180_207);\n    else List.__proto__ = __nox_super_180_207;\n    Object.defineProperty(List, 'prototype', { writable: false });\n    return List;\n  })(Array);\n  new List();\n  expect(called).toBe(true);\n}",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\n// basic sanity check to confirm the external wrapNativeSuper helper works\nlet Test1 = (__nox_super_76_140 => {\n  'use strict';\n  const Test1 = function Test1() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_76_140, arguments, new.target || Test1);\n    return _this;\n  };\n  if (__nox_super_76_140 !== null && typeof __nox_super_76_140 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test1.prototype = Object.create(__nox_super_76_140 && __nox_super_76_140.prototype, {\n    constructor: {\n      value: Test1,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test1, __nox_super_76_140);\n  else Test1.__proto__ = __nox_super_76_140;\n  Object.defineProperty(Test1.prototype, 'name', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'test1';\n      },\n      'name',\n      {\n        value: 'name',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test1, 'prototype', { writable: false });\n  return Test1;\n})(Array);\nlet Test2 = (__nox_super_142_206 => {\n  'use strict';\n  const Test2 = function Test2() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_142_206, arguments, new.target || Test2);\n    return _this;\n  };\n  if (__nox_super_142_206 !== null && typeof __nox_super_142_206 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test2.prototype = Object.create(__nox_super_142_206 && __nox_super_142_206.prototype, {\n    constructor: {\n      value: Test2,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test2, __nox_super_142_206);\n  else Test2.__proto__ = __nox_super_142_206;\n  Object.defineProperty(Test2.prototype, 'name', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'test2';\n      },\n      'name',\n      {\n        value: 'name',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test2, 'prototype', { writable: false });\n  return Test2;\n})(Array);\nvar t1 = new Test1();\nvar t2 = new Test2();\nexpect(Test1).not.toBe(Test2);\nexpect(t1).not.toBe(t2);\nexpect(t1.name()).toBe('test1');\nexpect(t2.name()).toBe('test2');\nexpect(t1).toBeInstanceOf(Test1);\nexpect(t2).toBeInstanceOf(Test2);\nexpect(t1).toBeInstanceOf(Array);\nexpect(t2).toBeInstanceOf(Array);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    value: Object.defineProperty(\n      function (...args) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(this).toBe(obj);\n        expect(args).toEqual([1, 2, 3]);\n        return 1;\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_131_341 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_131_341, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_131_341 !== null && typeof __nox_super_131_341 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_131_341 && __nox_super_131_341.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_131_341);\n  else Obj.__proto__ = __nox_super_131_341;\n  Object.defineProperty(Obj.prototype, 'call', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);\n      },\n      'name',\n      {\n        value: 'call',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        throw new Error('called');\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        // This is incorrect according to the spec,\n        // but close enough for loose.\n        expect(this).toBe(Base.prototype);\n        return function (...args) {\n          expect(this).toBe(obj);\n          expect(args).toEqual([1, 2, 3]);\n          return 1;\n        };\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_295_458 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_295_458, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_295_458 !== null && typeof __nox_super_295_458 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_295_458 && __nox_super_295_458.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_458);\n  else Obj.__proto__ = __nox_super_295_458;\n  Object.defineProperty(Obj.prototype, 'call', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);\n      },\n      'name',\n      {\n        value: 'call',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  writable: true,\n  configurable: true,\n  value() {\n    throw new Error('called');\n  },\n});\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        // This is incorrect according to the spec,\n        // but close enough for loose.\n        expect(this).toBe(Base.prototype);\n        return function (...args) {\n          expect(this).toBe(obj);\n          expect(args).toEqual([1, 2, 3]);\n          return 1;\n        };\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_295_505 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_295_505, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_295_505 !== null && typeof __nox_super_295_505 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_295_505 && __nox_super_295_505.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_505);\n  else Obj.__proto__ = __nox_super_295_505;\n  Object.defineProperty(Obj.prototype, 'call', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);\n      },\n      'name',\n      {\n        value: 'call',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        throw new Error('called');\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_30_149 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_30_149, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_30_149 !== null && typeof __nox_super_30_149 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_30_149 && __nox_super_30_149.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_149);\n  else Obj.__proto__ = __nox_super_30_149;\n  Object.defineProperty(Obj.prototype, 'call', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this);\n      },\n      'name',\n      {\n        value: 'call',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        throw new Error('gobbledygook');\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(() => {\n  obj.call();\n  // Assert that this throws, but that it's not\n  // Obj.p.test's error that is thrown\n}).toThrow(TypeError);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        throw new Error('gobbledygook');\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_87_153 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_87_153, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_87_153 !== null && typeof __nox_super_87_153 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_87_153 && __nox_super_87_153.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_87_153);\n  else Obj.__proto__ = __nox_super_87_153;\n  Object.defineProperty(Obj.prototype, 'call', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this);\n      },\n      'name',\n      {\n        value: 'call',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  writable: true,\n  configurable: true,\n  value() {\n    throw new Error('gobbledygook');\n  },\n});\nconst obj = new Obj();\nexpect(() => {\n  obj.call();\n  // Assert that this throws, but that it's not\n  // a gobbledygook error that is thrown\n}).toThrow(TypeError);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        throw new Error('gobbledygook');\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_87_206 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_87_206, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_87_206 !== null && typeof __nox_super_87_206 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_87_206 && __nox_super_87_206.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_87_206);\n  else Obj.__proto__ = __nox_super_87_206;\n  Object.defineProperty(Obj.prototype, 'call', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this);\n      },\n      'name',\n      {\n        value: 'call',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        throw new Error('gobbledygook');\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(() => {\n  obj.call();\n  // Assert that this throws, but that it's not\n  // a gobbledygook error that is thrown\n}).toThrow(TypeError);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nObject.defineProperty(Base.prototype, 'test', {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\nlet Obj = (__nox_super_134_197 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_134_197, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_134_197 !== null && typeof __nox_super_134_197 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_134_197 && __nox_super_134_197.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_134_197);\n  else Obj.__proto__ = __nox_super_134_197;\n  Object.defineProperty(Obj.prototype, 'get', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);\n      },\n      'name',\n      {\n        value: 'get',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nBase.prototype.test = 1;\nlet Obj = (__nox_super_55_118 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_55_118, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_55_118 !== null && typeof __nox_super_55_118 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_55_118 && __nox_super_55_118.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_55_118);\n  else Obj.__proto__ = __nox_super_55_118;\n  Object.defineProperty(Obj.prototype, 'get', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);\n      },\n      'name',\n      {\n        value: 'get',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObj.prototype.test = 2;\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        // This is incorrect according to the spec,\n        // but close enough for loose.\n        expect(this).toBe(Base.prototype);\n        return 1;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_185_248 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_185_248, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_185_248 !== null && typeof __nox_super_185_248 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_185_248 && __nox_super_185_248.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_185_248);\n  else Obj.__proto__ = __nox_super_185_248;\n  Object.defineProperty(Obj.prototype, 'get', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);\n      },\n      'name',\n      {\n        value: 'get',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_30_93 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_30_93, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_30_93 !== null && typeof __nox_super_30_93 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_30_93 && __nox_super_30_93.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_93);\n  else Obj.__proto__ = __nox_super_30_93;\n  Object.defineProperty(Obj.prototype, 'get', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);\n      },\n      'name',\n      {\n        value: 'get',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBeUndefined();",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        throw new Error('called');\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_81_144 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_81_144, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_81_144 !== null && typeof __nox_super_81_144 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_81_144 && __nox_super_81_144.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_81_144);\n  else Obj.__proto__ = __nox_super_81_144;\n  Object.defineProperty(Obj.prototype, 'get', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);\n      },\n      'name',\n      {\n        value: 'get',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBeUndefined();",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nObject.defineProperty(Base.prototype, 0, {\n  value: 0,\n  writable: true,\n  configurable: true,\n});\nObject.defineProperty(Base.prototype, 1, {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\nlet i = 0;\nconst proper = {\n  get prop() {\n    return i++;\n  },\n};\nlet Obj = (__nox_super_295_405 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_295_405, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_295_405 !== null && typeof __nox_super_295_405 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_295_405 && __nox_super_295_405.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_405);\n  else Obj.__proto__ = __nox_super_295_405;\n  Object.defineProperty(Obj.prototype, 'assign', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        (() => {\n          var _key = proper.prop;\n          var _value = _get(Object.getPrototypeOf(Obj.prototype), _key, this) + 1;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'assign',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'assign2', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        (() => {\n          var _key = i;\n          var _value = _get(Object.getPrototypeOf(Obj.prototype), _key, this) + 1;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'assign2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nobj.assign();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(1);\nobj.assign2();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(2);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nObject.defineProperty(Base.prototype, 0, {\n  value: 0,\n  writable: true,\n  configurable: true,\n});\nObject.defineProperty(Base.prototype, 1, {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\nlet i = 0;\nconst proper = {\n  get prop() {\n    return i++;\n  },\n};\nlet Obj = (__nox_super_295_399 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_295_399, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_295_399 !== null && typeof __nox_super_295_399 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_295_399 && __nox_super_295_399.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_399);\n  else Obj.__proto__ = __nox_super_295_399;\n  Object.defineProperty(Obj.prototype, 'update', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        (() => {\n          var _key = proper.prop;\n          var _value = _get(Object.getPrototypeOf(Obj.prototype), _key, this);\n          var _result = _value++;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _result;\n        })();\n      },\n      'name',\n      {\n        value: 'update',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'update2', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        (() => {\n          var _key = i;\n          var _value = _get(Object.getPrototypeOf(Obj.prototype), _key, this);\n          var _result = _value++;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _result;\n        })();\n      },\n      'name',\n      {\n        value: 'update2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nobj.update();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(1);\nobj.update2();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(2);",
  "let C = (() => {\n  'use strict';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(C.prototype, 'a', {\n    get: Object.defineProperty(\n      function () {\n        /* before get a */\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n      'name',\n      {\n        value: 'get a',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(C.prototype, 'a', {\n    set: Object.defineProperty(\n      function (v) {\n        /* after get a */\n        /* before set a */\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'set a',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(C, 'prototype', { writable: false });\n  return C;\n  /* after set a */\n})();",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nObject.defineProperty(Base.prototype, 'test', {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\nlet Obj = (__nox_super_135_202 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_135_202, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_135_202 !== null && typeof __nox_super_135_202 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_135_202 && __nox_super_135_202.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_135_202);\n  else Obj.__proto__ = __nox_super_135_202;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet called = false;\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        called = true;\n        return 1;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_103_170 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_103_170, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_103_170 !== null && typeof __nox_super_103_170 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_103_170 && __nox_super_103_170.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_103_170);\n  else Obj.__proto__ = __nox_super_103_170;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(() => {\nexpect(obj.set()).toBe(3);\n// }).toThrow(TypeError);\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_30_97 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_30_97, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_30_97 !== null && typeof __nox_super_30_97 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_30_97 && __nox_super_30_97.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_97);\n  else Obj.__proto__ = __nox_super_30_97;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet called = false;\nlet Obj = (__nox_super_50_156 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_50_156, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_50_156 !== null && typeof __nox_super_50_156 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_50_156 && __nox_super_50_156.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_50_156);\n  else Obj.__proto__ = __nox_super_50_156;\n  Object.defineProperty(Obj.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        called = true;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(obj.set()).toBe(3);\nexpect(() => {\n  obj.set();\n}).toThrow(TypeError);\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(undefined);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_30_97 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_30_97, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_30_97 !== null && typeof __nox_super_30_97 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_30_97 && __nox_super_30_97.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_97);\n  else Obj.__proto__ = __nox_super_30_97;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet value = 2;\nlet Obj = (__nox_super_45_148 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_45_148, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_45_148 !== null && typeof __nox_super_45_148 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_45_148 && __nox_super_45_148.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_45_148);\n  else Obj.__proto__ = __nox_super_45_148;\n  Object.defineProperty(Obj.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        value = v;\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\n// This is incorrect according to the spec,\n// but close enough for loose.\nexpect(value).toBe(3);\nexpect(obj.test).toBe(undefined);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet value = 1;\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        value = v;\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_80_147 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_80_147, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_80_147 !== null && typeof __nox_super_80_147 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_80_147 && __nox_super_80_147.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_80_147);\n  else Obj.__proto__ = __nox_super_80_147;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\n// todo\nexpect(value).toBe(1);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\n// todo\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet value = 1;\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        value = v;\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_80_147 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_80_147, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_80_147 !== null && typeof __nox_super_80_147 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_80_147 && __nox_super_80_147.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_80_147);\n  else Obj.__proto__ = __nox_super_80_147;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(value).toBe(3);\nexpect(value).toBe(1);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(obj.test).toBe(2);\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(this).toBe(obj);\n        return function (...args) {\n          expect(this).toBe(obj);\n          expect(args).toEqual([1, 2, 3]);\n          return 1;\n        };\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_200_410 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_200_410, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_200_410 !== null && typeof __nox_super_200_410 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_200_410 && __nox_super_200_410.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_200_410);\n  else Obj.__proto__ = __nox_super_200_410;\n  Object.defineProperty(Obj.prototype, 'call', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);\n        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);\n      },\n      'name',\n      {\n        value: 'call',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        throw new Error('called');\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);",
  "let x = 1;\nlet A = ((_key, _key13, _key14) => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, _key, {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          'get ' +\n          (typeof _key === 'symbol'\n            ? _key.description === void 0\n              ? ''\n              : '[' + _key.description + ']'\n            : String(_key)),\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, _key13, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key13 === 'symbol'\n            ? _key13.description === void 0\n              ? ''\n              : '[' + _key13.description + ']'\n            : String(_key13),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, _key14, {\n    set: Object.defineProperty(\n      function (_) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          'set ' +\n          (typeof _key14 === 'symbol'\n            ? _key14.description === void 0\n              ? ''\n              : '[' + _key14.description + ']'\n            : String(_key14)),\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})(x, ((x = 3), 2), x);\nexpect(Object.getOwnPropertyDescriptors(A.prototype)).toMatchObject({\n  1: {\n    get: expect.any(Function),\n    set: undefined,\n  },\n  2: { value: expect.any(Function) },\n  3: {\n    get: undefined,\n    set: expect.any(Function),\n  },\n});",
  "let A = ((_key, _key12, _key13) => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, _key, {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          'get ' +\n          (typeof _key === 'symbol'\n            ? _key.description === void 0\n              ? ''\n              : '[' + _key.description + ']'\n            : String(_key)),\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, _key12, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key12 === 'symbol'\n            ? _key12.description === void 0\n              ? ''\n              : '[' + _key12.description + ']'\n            : String(_key12),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, _key13, {\n    set: Object.defineProperty(\n      function (_) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          'set ' +\n          (typeof _key13 === 'symbol'\n            ? _key13.description === void 0\n              ? ''\n              : '[' + _key13.description + ']'\n            : String(_key13)),\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})(x, ((x = 2), 3), x);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(this).toBe(obj);\n        return 1;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_91_154 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_91_154, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_91_154 !== null && typeof __nox_super_91_154 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_91_154 && __nox_super_91_154.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_91_154);\n  else Obj.__proto__ = __nox_super_91_154;\n  Object.defineProperty(Obj.prototype, 'get', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);\n      },\n      'name',\n      {\n        value: 'get',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);",
  "let A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 'x', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'get x',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, 'x', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'x',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, 'x', {\n    set: Object.defineProperty(\n      function (_) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'set x',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nexpect(Object.getOwnPropertyDescriptors(A.prototype)).toMatchObject({\n  x: {\n    get: undefined,\n    set: expect.any(Function),\n  },\n});",
  "let A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 'x', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'get x',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, 'x', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'x',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, 'x', {\n    set: Object.defineProperty(\n      function (_) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'set x',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "let A = ((_key, _key12) => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 1, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, _key, {\n    set: Object.defineProperty(\n      function (_) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          'set ' +\n          (typeof _key === 'symbol'\n            ? _key.description === void 0\n              ? ''\n              : '[' + _key.description + ']'\n            : String(_key)),\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, 2, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, '2', {\n    set: function (_) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, 3n, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, 3, {\n    set: function (_) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, _key12, {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          'get ' +\n          (typeof _key12 === 'symbol'\n            ? _key12.description === void 0\n              ? ''\n              : '[' + _key12.description + ']'\n            : String(_key12)),\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, '4', {\n    set: function (_) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, 5n, {\n    get: function () {\n      // Different keys\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, '5n', {\n    set: function (_) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})(1, 4n);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet called = false;\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        called = true;\n        return 1;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_103_170 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_103_170, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_103_170 !== null && typeof __nox_super_103_170 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_103_170 && __nox_super_103_170.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_103_170);\n  else Obj.__proto__ = __nox_super_103_170;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(() => {\n  obj.set();\n}).toThrow(TypeError);\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(2);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 1;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_64_131 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_64_131, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_64_131 !== null && typeof __nox_super_64_131 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_64_131 && __nox_super_64_131.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_64_131);\n  else Obj.__proto__ = __nox_super_64_131;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(() => {\n  // this requires helpers to be in file (not external), so they\n  // are in \"strict\" mode code.\n  obj.set();\n}).toThrow(TypeError);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(2);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet called = false;\nlet Obj = (__nox_super_50_156 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_50_156, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_50_156 !== null && typeof __nox_super_50_156 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_50_156 && __nox_super_50_156.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_50_156);\n  else Obj.__proto__ = __nox_super_50_156;\n  Object.defineProperty(Obj.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        called = true;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_30_115 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_30_115, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_30_115 !== null && typeof __nox_super_30_115 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_30_115 && __nox_super_30_115.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_115);\n  else Obj.__proto__ = __nox_super_30_115;\n  Object.defineProperty(Obj.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet value = 2;\nlet Obj = (__nox_super_45_148 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_45_148, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_45_148 !== null && typeof __nox_super_45_148 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_45_148 && __nox_super_45_148.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_45_148);\n  else Obj.__proto__ = __nox_super_45_148;\n  Object.defineProperty(Obj.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        value = v;\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(value).toBe(2);\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet value = 2;\nlet Obj = (__nox_super_45_176 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_45_176, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_45_176 !== null && typeof __nox_super_45_176 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_45_176 && __nox_super_45_176.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_45_176);\n  else Obj.__proto__ = __nox_super_45_176;\n  Object.defineProperty(Obj.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(this).toBe(obj);\n        value = v;\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(value).toBe(2);\nexpect(obj.test).toBe(3);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet value = 1;\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'test', {\n    set: Object.defineProperty(\n      function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        value = v;\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Obj = (__nox_super_80_147 => {\n  'use strict';\n  const Obj = function Obj() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_80_147, arguments, new.target || Obj);\n    return _this;\n  };\n  if (__nox_super_80_147 !== null && typeof __nox_super_80_147 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Obj.prototype = Object.create(__nox_super_80_147 && __nox_super_80_147.prototype, {\n    constructor: {\n      value: Obj,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_80_147);\n  else Obj.__proto__ = __nox_super_80_147;\n  Object.defineProperty(Obj.prototype, 'set', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (() => {\n          var _key = 'test';\n          var _value = 3;\n          Reflect.set(Object.getPrototypeOf(Obj.prototype), _key, _value, this);\n          return _value;\n        })();\n      },\n      'name',\n      {\n        value: 'set',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Obj, 'prototype', { writable: false });\n  return Obj;\n})(Base);\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(value).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(2);",
  "function t() {\n  'use strict';\n  let Foo = (() => {\n    'use strict';\n    const Foo = function Foo() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(Foo.prototype, 'method', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(Foo, 'prototype', { writable: false });\n    return Foo;\n  })();\n}",
  "let x = (() => {\n  'use strict';\n  const x = function x() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    4;\n    5;\n    6;\n  };\n  Object.defineProperty(x.prototype, 'f', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        1;\n        2;\n        3;\n      },\n      'name',\n      {\n        value: 'f',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(x, 'prototype', { writable: false });\n  return x;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_62 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_14_62, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {}.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_14_62 !== null && typeof __nox_super_14_62 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_62 && __nox_super_14_62.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_62);\n  else Foo.__proto__ = __nox_super_14_62;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(ReferenceError, \"this hasn't been initialised\");",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_48 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_48, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {}.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_48 !== null && typeof __nox_super_0_48 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_48 && __nox_super_0_48.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_48);\n  else Foo.__proto__ = __nox_super_0_48;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Child = (__nox_super_0_73 => {\n  'use strict';\n  const Child = function Child() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_73, arguments, _newtarget || Child);\n      return _this;\n    }\n    var _result = function () {\n      return false;\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_73 !== null && typeof __nox_super_0_73 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Child.prototype = Object.create(__nox_super_0_73 && __nox_super_0_73.prototype, {\n    constructor: {\n      value: Child,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Child, __nox_super_0_73);\n  else Child.__proto__ = __nox_super_0_73;\n  Object.defineProperty(Child, 'prototype', { writable: false });\n  return Child;\n})(Base);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Child = (__nox_super_0_70 => {\n  'use strict';\n  const Child = function Child() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_70, arguments, _newtarget || Child);\n      return _this;\n    }\n    var _result = function () {\n      return {};\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_70 !== null && typeof __nox_super_0_70 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Child.prototype = Object.create(__nox_super_0_70 && __nox_super_0_70.prototype, {\n    constructor: {\n      value: Child,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Child, __nox_super_0_70);\n  else Child.__proto__ = __nox_super_0_70;\n  Object.defineProperty(Child, 'prototype', { writable: false });\n  return Child;\n})(Base);",
  "let C = (() => {\n  'use strict';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(C.prototype, 'a', {\n    value: Object.defineProperty(\n      function () {\n        /* before a */\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'a',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(C, 'prototype', { writable: false });\n  return C;\n  /* after a */\n})();",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    return { x: 1 };\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexpect(new Foo().x).toBe(1);\nlet Bar = (__nox_super_102_174 => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_102_174, [], new.target || Bar);\n    var _result = function () {\n      return;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_102_174 !== null && typeof __nox_super_102_174 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Bar.prototype = Object.create(__nox_super_102_174 && __nox_super_102_174.prototype, {\n    constructor: {\n      value: Bar,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar, __nox_super_102_174);\n  else Bar.__proto__ = __nox_super_102_174;\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})(Foo);\nexpect(new Bar().x).toBe(1);\nlet Bar2 = (__nox_super_206_316 => {\n  'use strict';\n  const Bar2 = function Bar2() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_206_316, [], new.target || Bar2);\n    var _result = function () {\n      expect(this.x).toBe(1);\n      return { x: 2 };\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_206_316 !== null && typeof __nox_super_206_316 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Bar2.prototype = Object.create(__nox_super_206_316 && __nox_super_206_316.prototype, {\n    constructor: {\n      value: Bar2,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar2, __nox_super_206_316);\n  else Bar2.__proto__ = __nox_super_206_316;\n  Object.defineProperty(Bar2, 'prototype', { writable: false });\n  return Bar2;\n})(Foo);\nexpect(new Bar2().x).toBe(2);\nlet singleton;\nlet Sub = (__nox_super_365_488 => {\n  'use strict';\n  const Sub = function Sub() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_365_488, arguments, _newtarget || Sub);\n      return _this;\n    }\n    var _result = function () {\n      if (singleton) {\n        return singleton;\n      }\n      singleton = _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_365_488 !== null && typeof __nox_super_365_488 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Sub.prototype = Object.create(__nox_super_365_488 && __nox_super_365_488.prototype, {\n    constructor: {\n      value: Sub,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_365_488);\n  else Sub.__proto__ = __nox_super_365_488;\n  Object.defineProperty(Sub, 'prototype', { writable: false });\n  return Sub;\n})(Foo);\nlet instance = new Sub();\nexpect(instance).toBe(singleton);\ninstance = new Sub();\nexpect(instance).toBe(singleton);",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'foo', {\n    value: Object.defineProperty(\n      function (props) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        [x, ...super.client] = props;\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'foo', {\n    value: Object.defineProperty(\n      function (props) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        [super.client] = props;\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'foo', {\n    value: Object.defineProperty(\n      function (props) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        ({ x, ...super.client } = props);\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'foo', {\n    value: Object.defineProperty(\n      function (props) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        ({ client: super.client } = props);\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "let Database = (() => {\n  'use strict';\n  const Database = function Database() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Database.prototype, 'transaction', {\n    value: Object.defineProperty(\n      function (callback) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this.table.transaction(x => callback(new DaoTransaction(x)));\n      },\n      'name',\n      {\n        value: 'transaction',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Database, 'prototype', { writable: false });\n  return Database;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Test = (() => {\n  'use strict';\n  var _key = '__private_Test_key';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _key, {\n      writable: true,\n      value: '',\n    });\n  };\n  Object.defineProperty(Test.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _key)[_key];\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "let Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, 'key', {\n      value: '',\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n  };\n  Object.defineProperty(Test.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this.key;\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_85 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_85, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      if (dynamic()) _super();\n      _this;\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_85 !== null && typeof __nox_super_0_85 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_85 && __nox_super_0_85.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_85);\n  else Foo.__proto__ = __nox_super_0_85;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_64 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_64, [this], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_64 !== null && typeof __nox_super_0_64 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_64 && __nox_super_0_64.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_64);\n  else Foo.__proto__ = __nox_super_0_64;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nlet Foo = (__nox_super_0_70 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _construct.assert(_this);\n    var _this = _construct(__nox_super_0_70, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_70 !== null && typeof __nox_super_0_70 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_70 && __nox_super_0_70.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_70);\n  else Foo.__proto__ = __nox_super_0_70;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet C = (__nox_super_0_69 => {\n  'use strict';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_69, arguments, _newtarget || C);\n      return _this;\n    }\n    var _result = function () {\n      _super(_super(_super()));\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_69 !== null && typeof __nox_super_0_69 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  C.prototype = Object.create(__nox_super_0_69 && __nox_super_0_69.prototype, {\n    constructor: {\n      value: C,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(C, __nox_super_0_69);\n  else C.__proto__ = __nox_super_0_69;\n  Object.defineProperty(C, 'prototype', { writable: false });\n  return C;\n})(P);",
  "import _babelHelper from '@babel/runtime/helpers/construct';\nvar _construct2 = { construct: _babelHelper };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nimport net from 'net';\nimport { EventEmitter } from 'events';\nimport BinarySerializer from './helpers/binary-serializer';\n// import ...\nlet Connection = (__nox_super_152_501 => {\n  'use strict';\n  const Connection = function Connection(endpoint, joinKey, joinData, roomId) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_152_501, [], new.target || Connection);\n    var _result = function () {\n      this.isConnected = false;\n      this.roomId = roomId;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n    // ...\n  };\n  if (__nox_super_152_501 !== null && typeof __nox_super_152_501 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Connection.prototype = Object.create(__nox_super_152_501 && __nox_super_152_501.prototype, {\n    constructor: {\n      value: Connection,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Connection, __nox_super_152_501);\n  else Connection.__proto__ = __nox_super_152_501;\n  Object.defineProperty(Connection.prototype, 'send', {\n    value: Object.defineProperty(\n      function (message) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.sock.write(BinarySerializer.serializeMessage(message));\n      },\n      'name',\n      {\n        value: 'send',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Connection.prototype, 'disconnect', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.sock.close();\n      },\n      'name',\n      {\n        value: 'disconnect',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Connection, 'prototype', { writable: false });\n  return Connection;\n})(EventEmitter);\nexport default Connection;",
  "import _babelHelper from '@babel/runtime/helpers/construct';\nimport _babelHelper2 from '@babel/runtime/helpers/get';\nvar _construct2 = { construct: _babelHelper };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: _babelHelper2 };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nimport BaseFoo from './BaseFoo';\nlet SubFoo = (__nox_super_49_153 => {\n  'use strict';\n  const SubFoo = function SubFoo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_49_153, arguments, new.target || SubFoo);\n    return _this;\n  };\n  if (__nox_super_49_153 !== null && typeof __nox_super_49_153 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  SubFoo.prototype = Object.create(__nox_super_49_153 && __nox_super_49_153.prototype, {\n    constructor: {\n      value: SubFoo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(SubFoo, __nox_super_49_153);\n  else SubFoo.__proto__ = __nox_super_49_153;\n  Object.defineProperty(SubFoo, 'talk', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _get(Object.getPrototypeOf(SubFoo), 'talk', this).call(this);\n        console.log('SubFoo.talk');\n      },\n      'name',\n      {\n        value: 'talk',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(SubFoo, 'prototype', { writable: false });\n  return SubFoo;\n})(BaseFoo);\nexport default SubFoo;",
  "import _babelHelper from '@babel/runtime/helpers/construct';\nvar _construct2 = { construct: _babelHelper };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nimport React, { Component } from 'react';\nlet RandomComponent = (__nox_super_56_255 => {\n  'use strict';\n  const RandomComponent = function RandomComponent() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_56_255, [], new.target || RandomComponent);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_56_255 !== null && typeof __nox_super_56_255 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  RandomComponent.prototype = Object.create(__nox_super_56_255 && __nox_super_56_255.prototype, {\n    constructor: {\n      value: RandomComponent,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(RandomComponent, __nox_super_56_255);\n  else RandomComponent.__proto__ = __nox_super_56_255;\n  Object.defineProperty(RandomComponent.prototype, 'render', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (\n          <div className=\"sui-RandomComponent\">\n            <h2>Hi there!</h2>\n          </div>\n        );\n      },\n      'name',\n      {\n        value: 'render',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(RandomComponent, 'prototype', { writable: false });\n  return RandomComponent;\n})(Component);\nexport default RandomComponent;",
  "let _Class = (() => {\n  'use strict';\n  const _Class = function _Class() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class, 'prototype', { writable: false });\n  return _Class;\n})();\nexport default _Class;",
  "import _babelHelper from '@babel/runtime/helpers/construct';\nvar _construct2 = { construct: _babelHelper };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet b = (() => {\n  'use strict';\n  const b = function b() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(b, 'prototype', { writable: false });\n  return b;\n})();\nlet a1 = (__nox_super_13_95 => {\n  'use strict';\n  const a1 = function a1() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_13_95, [], new.target || a1);\n    var _result = function () {\n      this.x = () => this;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_13_95 !== null && typeof __nox_super_13_95 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  a1.prototype = Object.create(__nox_super_13_95 && __nox_super_13_95.prototype, {\n    constructor: {\n      value: a1,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(a1, __nox_super_13_95);\n  else a1.__proto__ = __nox_super_13_95;\n  Object.defineProperty(a1, 'prototype', { writable: false });\n  return a1;\n})(b);\nlet a2 = (__nox_super_112_194 => {\n  'use strict';\n  const a2 = function a2() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_112_194, [], new.target || a2);\n    var _result = function () {\n      this.x = () => this;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_112_194 !== null && typeof __nox_super_112_194 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  a2.prototype = Object.create(__nox_super_112_194 && __nox_super_112_194.prototype, {\n    constructor: {\n      value: a2,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(a2, __nox_super_112_194);\n  else a2.__proto__ = __nox_super_112_194;\n  Object.defineProperty(a2, 'prototype', { writable: false });\n  return a2;\n})(b);\nexport default a2;",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Point = (() => {\n  'use strict';\n  const Point = function Point() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Point.prototype, 'getX', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(this.x).toBe(3);\n      },\n      'name',\n      {\n        value: 'getX',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Point, 'prototype', { writable: false });\n  return Point;\n})();\nlet ColorPoint = (__nox_super_65_274 => {\n  'use strict';\n  const ColorPoint = function ColorPoint() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_65_274, [], new.target || ColorPoint);\n    var _result = function () {\n      this.x = 2;\n      (() => {\n        var _key = 'x';\n        var _value = 3;\n        Reflect.set(Object.getPrototypeOf(ColorPoint.prototype), _key, _value, this);\n        return _value;\n      })();\n      expect(this.x).toBe(3);\n      expect(_get(Object.getPrototypeOf(ColorPoint.prototype), 'x', this)).toBeUndefined();\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_65_274 !== null && typeof __nox_super_65_274 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  ColorPoint.prototype = Object.create(__nox_super_65_274 && __nox_super_65_274.prototype, {\n    constructor: {\n      value: ColorPoint,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(ColorPoint, __nox_super_65_274);\n  else ColorPoint.__proto__ = __nox_super_65_274;\n  Object.defineProperty(ColorPoint.prototype, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.getX();\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(ColorPoint, 'prototype', { writable: false });\n  return ColorPoint;\n})(Point);\nconst cp = new ColorPoint();\ncp.m();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Point = (() => {\n  'use strict';\n  const Point = function Point() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Point.prototype, 'getX', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(this.x).toBe(3);\n      },\n      'name',\n      {\n        value: 'getX',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Point, 'prototype', { writable: false });\n  return Point;\n})();\nlet ColorPoint = (__nox_super_65_275 => {\n  'use strict';\n  const ColorPoint = function ColorPoint() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_65_275, [], new.target || ColorPoint);\n    var _result = function () {\n      this.x = 2;\n      (() => {\n        var _key = 'x';\n        var _value = 3;\n        Reflect.set(Object.getPrototypeOf(ColorPoint.prototype), _key, _value, this);\n        return _value;\n      })();\n      expect(this.x).toBe(3);\n      expect(_get(Object.getPrototypeOf(ColorPoint.prototype), 'x', this)).toBeUndefined();\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_65_275 !== null && typeof __nox_super_65_275 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  ColorPoint.prototype = Object.create(__nox_super_65_275 && __nox_super_65_275.prototype, {\n    constructor: {\n      value: ColorPoint,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(ColorPoint, __nox_super_65_275);\n  else ColorPoint.__proto__ = __nox_super_65_275;\n  Object.defineProperty(ColorPoint.prototype, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.getX();\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(ColorPoint, 'prototype', { writable: false });\n  return ColorPoint;\n})(Point);\nconst cp = new ColorPoint();\ncp.m();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\n// https://github.com/babel/babel/issues/5817\nlet Parent = (() => {\n  'use strict';\n  const Parent = function Parent() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Parent, 'prototype', { writable: false });\n  return Parent;\n})();\nlet Table = (__nox_super_64_191 => {\n  'use strict';\n  const Table = function Table() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_64_191, [], new.target || Table);\n    var _result = function () {\n      this.returnParam = param => {\n        return param;\n      };\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_64_191 !== null && typeof __nox_super_64_191 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Table.prototype = Object.create(__nox_super_64_191 && __nox_super_64_191.prototype, {\n    constructor: {\n      value: Table,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Table, __nox_super_64_191);\n  else Table.__proto__ = __nox_super_64_191;\n  Object.defineProperty(Table, 'prototype', { writable: false });\n  return Table;\n})(Parent);\nconst table = new Table();\nexpect(table.returnParam(false)).toBe(false);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet A = (__nox_super_0_125 => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_125, [], new.target || A);\n    var _result = function () {\n      this.arrow1 = x => {\n        return x;\n      };\n      this.arrow2 = x => x;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_125 !== null && typeof __nox_super_0_125 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  A.prototype = Object.create(__nox_super_0_125 && __nox_super_0_125.prototype, {\n    constructor: {\n      value: A,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(A, __nox_super_0_125);\n  else A.__proto__ = __nox_super_0_125;\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})(B);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\n// Pretend that `Reflect.construct` isn't supported.\nglobal.Reflect = undefined;\nglobal.HTMLElement = function () {\n  // Here, `this.HTMLElement` is this function, not the original HTMLElement\n  // constructor. `this.constructor` should be this function too, but isn't.\n  constructor = this.constructor;\n};\nvar constructor;\nlet CustomElement = (__nox_super_326_368 => {\n  'use strict';\n  const CustomElement = function CustomElement() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_326_368, arguments, new.target || CustomElement);\n    return _this;\n  };\n  if (__nox_super_326_368 !== null && typeof __nox_super_326_368 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  CustomElement.prototype = Object.create(__nox_super_326_368 && __nox_super_326_368.prototype, {\n    constructor: {\n      value: CustomElement,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(CustomElement, __nox_super_326_368);\n  else CustomElement.__proto__ = __nox_super_326_368;\n  Object.defineProperty(CustomElement, 'prototype', { writable: false });\n  return CustomElement;\n})(HTMLElement);\nnew CustomElement();\nexpect(constructor).toBe(CustomElement);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nconst oldReflect = this.Reflect;\nconst oldHTMLElement = this.HTMLElement;\ntry {\n  // Pretend that `Reflect.construct` isn't supported.\n  this.Reflect = undefined;\n  this.HTMLElement = function () {\n    // Here, `this.HTMLElement` is this function, not the original HTMLElement\n    // constructor. `this.constructor` should be this function too, but isn't.\n    constructor = this.constructor;\n  };\n  var constructor;\n  let CustomElement = (__nox_super_421_463 => {\n    'use strict';\n    const CustomElement = function CustomElement() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      var _this = _construct(__nox_super_421_463, arguments, new.target || CustomElement);\n      return _this;\n    };\n    if (__nox_super_421_463 !== null && typeof __nox_super_421_463 !== 'function')\n      throw new TypeError('Super expression must either be null or a function');\n    CustomElement.prototype = Object.create(__nox_super_421_463 && __nox_super_421_463.prototype, {\n      constructor: {\n        value: CustomElement,\n        writable: true,\n        configurable: true,\n      },\n    });\n    if (Object.setPrototypeOf) Object.setPrototypeOf(CustomElement, __nox_super_421_463);\n    else CustomElement.__proto__ = __nox_super_421_463;\n    Object.defineProperty(CustomElement, 'prototype', { writable: false });\n    return CustomElement;\n  })(HTMLElement);\n  new CustomElement();\n  expect(constructor).toBe(CustomElement);\n} finally {\n  // Restore original env\n  this.Reflect = oldReflect;\n  this.HTMLElement = oldHTMLElement;\n}",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar x = {\n  Foo: (__nox_super_17_37 => {\n    'use strict';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      var _this = _construct(__nox_super_17_37, arguments, new.target || _Class);\n      return _this;\n    };\n    Object.defineProperty(_Class, 'name', {\n      value: 'Foo',\n      configurable: true,\n    });\n    if (__nox_super_17_37 !== null && typeof __nox_super_17_37 !== 'function')\n      throw new TypeError('Super expression must either be null or a function');\n    _Class.prototype = Object.create(__nox_super_17_37 && __nox_super_17_37.prototype, {\n      constructor: {\n        value: _Class,\n        writable: true,\n        configurable: true,\n      },\n    });\n    if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_17_37);\n    else _Class.__proto__ = __nox_super_17_37;\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })(Foo),\n};",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nlet B = (__nox_super_12_75 => {\n  'use strict';\n  const B = function B() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_12_75, [], new.target || B);\n    var _result = function () {\n      return this;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_12_75 !== null && typeof __nox_super_12_75 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  B.prototype = Object.create(__nox_super_12_75 && __nox_super_12_75.prototype, {\n    constructor: {\n      value: B,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_12_75);\n  else B.__proto__ = __nox_super_12_75;\n  Object.defineProperty(B, 'prototype', { writable: false });\n  return B;\n})(A);",
  "let A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 'foo', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const foo = 2;\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "export default function () {\n  return (() => {\n    'use strict';\n    const Select = function Select() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(Select.prototype, 'query', {\n      value: Object.defineProperty(\n        function (query) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value: 'query',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(Select, 'prototype', { writable: false });\n    return Select;\n  })();\n}",
  "let Example = (() => {\n  'use strict';\n  const Example = function Example() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Example.prototype, 'test1', {\n    value: Object.defineProperty(\n      async function () {\n        await Promise.resolve(2);\n      },\n      'name',\n      {\n        value: 'test1',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Example.prototype, 'test2', {\n    value: Object.defineProperty(\n      function* () {\n        yield 3;\n      },\n      'name',\n      {\n        value: 'test2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Example, 'prototype', { writable: false });\n  return Example;\n})();",
  "let Foo = (() => {\n  'use strict';\n  const Foo = function Foo(val) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    this._val = val;\n  };\n  Object.defineProperty(Foo.prototype, 'foo2', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return foo2(this._val);\n      },\n      'name',\n      {\n        value: 'foo2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_167 => {\n  'use strict';\n  const Foo = function Foo(options) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    let parentOptions = {};\n    parentOptions.init = function () {\n      this;\n    };\n    var _this = _construct(__nox_super_0_167, [parentOptions], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_167 !== null && typeof __nox_super_0_167 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_167 && __nox_super_0_167.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_167);\n  else Foo.__proto__ = __nox_super_0_167;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Test = (__nox_super_0_438 => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_438, arguments, _newtarget || Test);\n      return _this;\n    }\n    var _result = function () {\n      woops.super.test();\n      _super();\n      _get(Object.getPrototypeOf(Test.prototype), 'test', _this).call(_this);\n      _super(...arguments);\n      _super('test', ...arguments);\n      _get(Object.getPrototypeOf(Test.prototype), 'test', _this).call(_this, ...arguments);\n      _get(Object.getPrototypeOf(Test.prototype), 'test', _this).call(_this, 'test', ...arguments);\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_438 !== null && typeof __nox_super_0_438 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test.prototype = Object.create(__nox_super_0_438 && __nox_super_0_438.prototype, {\n    constructor: {\n      value: Test,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_438);\n  else Test.__proto__ = __nox_super_0_438;\n  Object.defineProperty(Test.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _get(Object.getPrototypeOf(Test.prototype), 'test', this).call(this);\n        _get(Object.getPrototypeOf(Test.prototype), 'test', this).call(this, ...arguments);\n        _get(Object.getPrototypeOf(Test.prototype), 'test', this).call(this, 'test', ...arguments);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'foo', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _get(Object.getPrototypeOf(Test), 'foo', this).call(this);\n        _get(Object.getPrototypeOf(Test), 'foo', this).call(this, ...arguments);\n        _get(Object.getPrototypeOf(Test), 'foo', this).call(this, 'test', ...arguments);\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})(Foo);",
  "expect(() => {\n  let A = (_key => {\n    'use strict';\n    const A = function A() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(A.prototype, _key, {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value:\n            typeof _key === 'symbol'\n              ? _key.description === void 0\n                ? ''\n                : '[' + _key.description + ']'\n              : String(_key),\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(A, 'prototype', { writable: false });\n    return A;\n  })(A.name);\n}).toThrow(ReferenceError);",
  "var log = [];\nlet A = ((_key, _key12, _key13, _key14) => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, _key, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key === 'symbol'\n            ? _key.description === void 0\n              ? ''\n              : '[' + _key.description + ']'\n            : String(_key),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, _key12, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key12 === 'symbol'\n            ? _key12.description === void 0\n              ? ''\n              : '[' + _key12.description + ']'\n            : String(_key12),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A.prototype, _key13, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key13 === 'symbol'\n            ? _key13.description === void 0\n              ? ''\n              : '[' + _key13.description + ']'\n            : String(_key13),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, _key14, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key14 === 'symbol'\n            ? _key14.description === void 0\n              ? ''\n              : '[' + _key14.description + ']'\n            : String(_key14),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})(log.push(1), log.push(2), log.push(3), log.push(4));\nexpect(log).toEqual([1, 2, 3, 4]);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nasync function* fn() {\n  let A = (_key => {\n    'use strict';\n    const A = function A() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(A.prototype, _key, {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value:\n            typeof _key === 'symbol'\n              ? _key.description === void 0\n                ? ''\n                : '[' + _key.description + ']'\n              : String(_key),\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(A, 'prototype', { writable: false });\n    return A;\n  })(yield 1);\n  let B = ((__nox_super_61_103, _key13) => {\n    'use strict';\n    const B = function B() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      var _this = _construct(__nox_super_61_103, arguments, new.target || B);\n      return _this;\n    };\n    if (__nox_super_61_103 !== null && typeof __nox_super_61_103 !== 'function')\n      throw new TypeError('Super expression must either be null or a function');\n    B.prototype = Object.create(__nox_super_61_103 && __nox_super_61_103.prototype, {\n      constructor: {\n        value: B,\n        writable: true,\n        configurable: true,\n      },\n    });\n    if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_61_103);\n    else B.__proto__ = __nox_super_61_103;\n    Object.defineProperty(B.prototype, _key13, {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value:\n            typeof _key13 === 'symbol'\n              ? _key13.description === void 0\n                ? ''\n                : '[' + _key13.description + ']'\n              : String(_key13),\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(B, 'prototype', { writable: false });\n    return B;\n  })(A, await 1);\n}",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nconst sym = Symbol();\nlet Foo = (_key => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, _key, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 1;\n      },\n      'name',\n      {\n        value:\n          typeof _key === 'symbol'\n            ? _key.description === void 0\n              ? ''\n              : '[' + _key.description + ']'\n            : String(_key),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(sym);\nlet Bar = ((__nox_super_69_140, _key14) => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_69_140, arguments, new.target || Bar);\n    return _this;\n  };\n  if (__nox_super_69_140 !== null && typeof __nox_super_69_140 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Bar.prototype = Object.create(__nox_super_69_140 && __nox_super_69_140.prototype, {\n    constructor: {\n      value: Bar,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar, __nox_super_69_140);\n  else Bar.__proto__ = __nox_super_69_140;\n  Object.defineProperty(Bar.prototype, _key14, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _get(Object.getPrototypeOf(Bar.prototype), sym, this).call(this) + 2;\n      },\n      'name',\n      {\n        value:\n          typeof _key14 === 'symbol'\n            ? _key14.description === void 0\n              ? ''\n              : '[' + _key14.description + ']'\n            : String(_key14),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})(Foo, sym);\nlet i = new Bar();\nexpect(i[sym]()).toBe(3);",
  "let Foo = ((_key, _key11) => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'foo', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'foo', {\n    value: function () {\n      'second';\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, _key, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key === 'symbol'\n            ? _key.description === void 0\n              ? ''\n              : '[' + _key.description + ']'\n            : String(_key),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, _key11, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key11 === 'symbol'\n            ? _key11.description === void 0\n              ? ''\n              : '[' + _key11.description + ']'\n            : String(_key11),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(bar, bar + 'foo');",
  "const foo = { [Symbol.toPrimitive]: () => 'foo' };\nexpect(\n  new ((_key => {\n    'use strict';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class.prototype, _key, {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return 0;\n        },\n        'name',\n        {\n          value:\n            typeof _key === 'symbol'\n              ? _key.description === void 0\n                ? ''\n                : '[' + _key.description + ']'\n              : String(_key),\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })(foo))().foo(),\n).toBe(0);\nexpect(\n  new ((_key15 => {\n    'use strict';\n    const _Class14 = function _Class14() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class14.prototype, _key15, {\n      get: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return 0;\n        },\n        'name',\n        {\n          value:\n            'get ' +\n            (typeof _key15 === 'symbol'\n              ? _key15.description === void 0\n                ? ''\n                : '[' + _key15.description + ']'\n              : String(_key15)),\n          configurable: true,\n        },\n      ),\n      configurable: true,\n    });\n    Object.defineProperty(_Class14, 'prototype', { writable: false });\n    return _Class14;\n  })(foo))().foo,\n).toBe(0);\nexpect(\n  (new ((_key17 => {\n    'use strict';\n    const _Class16 = function _Class16() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class16.prototype, _key17, {\n      set: Object.defineProperty(\n        function (v) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return v;\n        },\n        'name',\n        {\n          value:\n            'set ' +\n            (typeof _key17 === 'symbol'\n              ? _key17.description === void 0\n                ? ''\n                : '[' + _key17.description + ']'\n              : String(_key17)),\n          configurable: true,\n        },\n      ),\n      configurable: true,\n    });\n    Object.defineProperty(_Class16, 'prototype', { writable: false });\n    return _Class16;\n  })(foo))().foo = 0),\n).toBe(0);\nconst arrayLike = { [Symbol.toPrimitive]: () => [] };\nexpect(\n  () =>\n    new ((_key19 => {\n      'use strict';\n      const _Class18 = function _Class18() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n      };\n      Object.defineProperty(_Class18.prototype, _key19, {\n        value: Object.defineProperty(\n          function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n            return 0;\n          },\n          'name',\n          {\n            value:\n              typeof _key19 === 'symbol'\n                ? _key19.description === void 0\n                  ? ''\n                  : '[' + _key19.description + ']'\n                : String(_key19),\n            configurable: true,\n          },\n        ),\n        writable: true,\n        configurable: true,\n      });\n      Object.defineProperty(_Class18, 'prototype', { writable: false });\n      return _Class18;\n    })(arrayLike))(),\n).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    new ((_key21 => {\n      'use strict';\n      const _Class20 = function _Class20() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n      };\n      Object.defineProperty(_Class20.prototype, _key21, {\n        get: Object.defineProperty(\n          function () {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n            return 0;\n          },\n          'name',\n          {\n            value:\n              'get ' +\n              (typeof _key21 === 'symbol'\n                ? _key21.description === void 0\n                  ? ''\n                  : '[' + _key21.description + ']'\n                : String(_key21)),\n            configurable: true,\n          },\n        ),\n        configurable: true,\n      });\n      Object.defineProperty(_Class20, 'prototype', { writable: false });\n      return _Class20;\n    })(arrayLike))(),\n).toThrow('@@toPrimitive must return a primitive value.');\nexpect(\n  () =>\n    new ((_key23 => {\n      'use strict';\n      const _Class22 = function _Class22() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n      };\n      Object.defineProperty(_Class22.prototype, _key23, {\n        set: Object.defineProperty(\n          function (v) {\n            if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n            return v;\n          },\n          'name',\n          {\n            value:\n              'set ' +\n              (typeof _key23 === 'symbol'\n                ? _key23.description === void 0\n                  ? ''\n                  : '[' + _key23.description + ']'\n                : String(_key23)),\n            configurable: true,\n          },\n        ),\n        configurable: true,\n      });\n      Object.defineProperty(_Class22, 'prototype', { writable: false });\n      return _Class22;\n    })(arrayLike))(),\n).toThrow('@@toPrimitive must return a primitive value.');",
  "let Example = (() => {\n  'use strict';\n  const Example = function Example() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var Example;\n  };\n  Object.defineProperty(Example, 'prototype', { writable: false });\n  return Example;\n})();\nvar t = new Example();",
  "let Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    this.state = 'test';\n  };\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();\nlet Foo = (__nox_super_63_148 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_63_148, [], new.target || Foo);\n    var _result = function () {\n      this.state = 'test';\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_63_148 !== null && typeof __nox_super_63_148 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_63_148 && __nox_super_63_148.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_63_148);\n  else Foo.__proto__ = __nox_super_63_148;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nlet ConstructorScoping = (() => {\n  'use strict';\n  const ConstructorScoping = function ConstructorScoping() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    let bar;\n    {\n      let bar;\n    }\n  };\n  Object.defineProperty(ConstructorScoping, 'prototype', { writable: false });\n  return ConstructorScoping;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_90 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(\n      __nox_super_0_90,\n      [\n        () => {\n          this.test;\n        },\n      ],\n      new.target || Foo,\n    );\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_90 !== null && typeof __nox_super_0_90 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_90 && __nox_super_0_90.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_90);\n  else Foo.__proto__ = __nox_super_0_90;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\n// [Symbol.toPrimitive] must be called if exist\nvar counter = 0;\nexpect(() => {\n  new ((() => {\n    'use strict';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class.prototype, 'f', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          delete super[\n            {\n              [Symbol.toPrimitive]: function () {\n                ++counter;\n                return 0;\n              },\n            }\n          ];\n        },\n        'name',\n        {\n          value: 'f',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })())().f();\n}).toThrow(ReferenceError);\nexpect(counter).toBe(1);\n// [Symbol.toPrimitive] must return a primitive value\nexpect(() => {\n  new ((() => {\n    'use strict';\n    const _Class11 = function _Class11() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class11.prototype, 'f', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          delete super[\n            {\n              [Symbol.toPrimitive]: function () {\n                return {};\n              },\n            }\n          ];\n        },\n        'name',\n        {\n          value: 'f',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class11, 'prototype', { writable: false });\n    return _Class11;\n  })())().f();\n}).toThrow(TypeError);",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\n// [Symbol.toPrimitive] must be called if exist\nvar counter = 0;\nnew ((() => {\n  'use strict';\n  const _Class = function _Class() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class.prototype, 'f', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        delete super[\n          {\n            [Symbol.toPrimitive]: function () {\n              ++counter;\n              return 0;\n            },\n          }\n        ];\n      },\n      'name',\n      {\n        value: 'f',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(_Class, 'prototype', { writable: false });\n  return _Class;\n})())().f();\n// [Symbol.toPrimitive] must return a primitive value\nnew ((() => {\n  'use strict';\n  const _Class11 = function _Class11() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class11.prototype, 'f', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        delete super[\n          {\n            [Symbol.toPrimitive]: function () {\n              return {};\n            },\n          }\n        ];\n      },\n      'name',\n      {\n        value: 'f',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(_Class11, 'prototype', { writable: false });\n  return _Class11;\n})())().f();",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nexpect(() => {\n  new ((() => {\n    'use strict';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class.prototype, 'f', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          delete super.x;\n        },\n        'name',\n        {\n          value: 'f',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })())().f();\n}).toThrow(ReferenceError);\nexpect(() => {\n  new ((() => {\n    'use strict';\n    const _Class11 = function _Class11() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class11.prototype, 'f', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          delete super[0];\n        },\n        'name',\n        {\n          value: 'f',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class11, 'prototype', { writable: false });\n    return _Class11;\n  })())().f();\n}).toThrow(ReferenceError);\n// [expr] should be evaluated\nvar counter = 0;\nexpect(() => {\n  new ((() => {\n    'use strict';\n    const _Class12 = function _Class12() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class12.prototype, 'f', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          delete super[++counter];\n        },\n        'name',\n        {\n          value: 'f',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class12, 'prototype', { writable: false });\n    return _Class12;\n  })())().f();\n}).toThrow(ReferenceError);\nexpect(counter).toBe(1);\n// TypeError before ReferenceError\nexpect(() => {\n  new ((() => {\n    'use strict';\n    const _Class13 = function _Class13() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class13.prototype, 'f', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          delete super[0()];\n        },\n        'name',\n        {\n          value: 'f',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class13, 'prototype', { writable: false });\n    return _Class13;\n  })())().f();\n}).toThrow(TypeError);",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nnew ((() => {\n  'use strict';\n  const _Class = function _Class() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class.prototype, 'f', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        delete super.x;\n      },\n      'name',\n      {\n        value: 'f',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(_Class, 'prototype', { writable: false });\n  return _Class;\n})())().f();\nnew ((() => {\n  'use strict';\n  const _Class11 = function _Class11() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class11.prototype, 'f', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        delete super[0];\n      },\n      'name',\n      {\n        value: 'f',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(_Class11, 'prototype', { writable: false });\n  return _Class11;\n})())().f();\n// [expr] should be evaluated\nvar counter = 0;\nnew ((() => {\n  'use strict';\n  const _Class12 = function _Class12() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class12.prototype, 'f', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        delete super[++counter];\n      },\n      'name',\n      {\n        value: 'f',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(_Class12, 'prototype', { writable: false });\n  return _Class12;\n})())().f();\n// TypeError before ReferenceError\nnew ((() => {\n  'use strict';\n  const _Class13 = function _Class13() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class13.prototype, 'f', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        delete super[0()];\n      },\n      'name',\n      {\n        value: 'f',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(_Class13, 'prototype', { writable: false });\n  return _Class13;\n})())().f();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_93 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_14_93, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      if (eval('false')) _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_14_93 !== null && typeof __nox_super_14_93 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_93 && __nox_super_14_93.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_93);\n  else Foo.__proto__ = __nox_super_14_93;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_79 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_79, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      if (eval('false')) _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_79 !== null && typeof __nox_super_0_79 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_79 && __nox_super_0_79.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_79);\n  else Foo.__proto__ = __nox_super_0_79;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_101 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_14_101, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      const fn = () => _super();\n      fn();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_14_101 !== null && typeof __nox_super_14_101 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_101 && __nox_super_14_101.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_101);\n  else Foo.__proto__ = __nox_super_14_101;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nnew Foo();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_87 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_87, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      const fn = () => _super();\n      fn();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_87 !== null && typeof __nox_super_0_87 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_87 && __nox_super_0_87.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_87);\n  else Foo.__proto__ = __nox_super_0_87;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_91 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_14_91, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      const fn = () => _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_14_91 !== null && typeof __nox_super_14_91 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_91 && __nox_super_14_91.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_91);\n  else Foo.__proto__ = __nox_super_14_91;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_77 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_77, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      const fn = () => _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_77 !== null && typeof __nox_super_0_77 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_77 && __nox_super_0_77.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_77);\n  else Foo.__proto__ = __nox_super_0_77;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_62 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_14_62, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {}.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_14_62 !== null && typeof __nox_super_14_62 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_62 && __nox_super_14_62.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_62);\n  else Foo.__proto__ = __nox_super_14_62;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_88 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_14_88, [], new.target || Foo);\n    var _result = function () {\n      return 3;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_14_88 !== null && typeof __nox_super_14_88 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_88 && __nox_super_14_88.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_88);\n  else Foo.__proto__ = __nox_super_14_88;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nlet Foo2 = (__nox_super_90_168 => {\n  'use strict';\n  const Foo2 = function Foo2() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_90_168, [], new.target || Foo2);\n    var _result = function () {\n      return null;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_90_168 !== null && typeof __nox_super_90_168 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo2.prototype = Object.create(__nox_super_90_168 && __nox_super_90_168.prototype, {\n    constructor: {\n      value: Foo2,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo2, __nox_super_90_168);\n  else Foo2.__proto__ = __nox_super_90_168;\n  Object.defineProperty(Foo2, 'prototype', { writable: false });\n  return Foo2;\n})(Bar);\nexpect(() => new Foo()).toThrow('Derived constructors may only return object or undefined');\nexpect(() => new Foo2()).toThrow('Derived constructors may only return object or undefined');",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_74 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_74, [], new.target || Foo);\n    var _result = function () {\n      return 3;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_74 !== null && typeof __nox_super_0_74 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_74 && __nox_super_0_74.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_74);\n  else Foo.__proto__ = __nox_super_0_74;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "let Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexport default Foo;",
  "import _babelHelper from '@babel/runtime/helpers/construct';\nvar _construct2 = { construct: _babelHelper };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet _Class = (__nox_super_15_33 => {\n  'use strict';\n  const _Class = function _Class() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_15_33, arguments, new.target || _Class);\n    return _this;\n  };\n  if (__nox_super_15_33 !== null && typeof __nox_super_15_33 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  _Class.prototype = Object.create(__nox_super_15_33 && __nox_super_15_33.prototype, {\n    constructor: {\n      value: _Class,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_15_33);\n  else _Class.__proto__ = __nox_super_15_33;\n  Object.defineProperty(_Class, 'prototype', { writable: false });\n  return _Class;\n})(A);\nexport default _Class;",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nvar log = [];\nvar SuperClass = require('module-which-exports-native-class');\nlet SubClass = (__nox_super_93_297 => {\n  'use strict';\n  const SubClass = function SubClass() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    log.push(4);\n    var _this = _construct(__nox_super_93_297, [], new.target || SubClass);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_93_297 !== null && typeof __nox_super_93_297 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  SubClass.prototype = Object.create(__nox_super_93_297 && __nox_super_93_297.prototype, {\n    constructor: {\n      value: SubClass,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(SubClass, __nox_super_93_297);\n  else SubClass.__proto__ = __nox_super_93_297;\n  Object.defineProperty(SubClass.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        log.push(5);\n        _get(Object.getPrototypeOf(SubClass.prototype), 'method', this).call(this);\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(SubClass, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        log.push(6);\n        _get(Object.getPrototypeOf(SubClass), 'method', this).call(this);\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(SubClass, 'prototype', { writable: false });\n  return SubClass;\n})(SuperClass);\nnew SubClass().method();\nSubClass.method();\nexpect(log).toEqual([4, 1, 5, 2, 6, 3]);\n// Magic function to avoid transpiling class\nfunction require() {\n  return eval(`(\n    class SuperClass {\n      constructor() { log.push(1); }\n      method() { log.push(2); }\n      static method() { log.push(3); }\n    }\n  )`);\n}",
  "var o = {\n  foo: (() => {\n    'use strict';\n    const foo = function foo() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(foo, 'prototype', { writable: false });\n    return foo;\n  })(),\n};",
  "let Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 5 + 5;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Test.prototype, 'test', {\n    set: Object.defineProperty(\n      function (val) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this._test = val;\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "let Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'test', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 5 + 5;\n      },\n      'name',\n      {\n        value: 'get test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "let Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 5 + 5;\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "let Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'test', {\n    set: Object.defineProperty(\n      function (val) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this._test = val;\n      },\n      'name',\n      {\n        value: 'set test',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (__nox_super_0_154 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_154, [], new.target || Foo);\n    var _result = function () {\n      let X = (_key => {\n        'use strict';\n        const X = function X() {\n          if (!new.target) throw new TypeError('Cannot call a class as a function');\n        };\n        Object.defineProperty(X.prototype, _key, {\n          value: Object.defineProperty(\n            function () {\n              if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n            },\n            'name',\n            {\n              value:\n                typeof _key === 'symbol'\n                  ? _key.description === void 0\n                    ? ''\n                    : '[' + _key.description + ']'\n                  : String(_key),\n              configurable: true,\n            },\n          ),\n          writable: true,\n          configurable: true,\n        });\n        Object.defineProperty(X, 'prototype', { writable: false });\n        return X;\n      })(\n        (() => {\n          let Foo;\n          _get(Object.getPrototypeOf(Foo.prototype), 'method', this).call(this);\n        })(),\n      );\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_154 !== null && typeof __nox_super_0_154 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_154 && __nox_super_0_154.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_154);\n  else Foo.__proto__ = __nox_super_0_154;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nlet Foo = (__nox_super_30_167 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_30_167, [], new.target || Foo);\n    var _result = function () {\n      if (true) {\n        let Foo;\n        _get(Object.getPrototypeOf(Foo.prototype), 'method', this).call(this);\n      }\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_30_167 !== null && typeof __nox_super_30_167 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_30_167 && __nox_super_30_167.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_30_167);\n  else Foo.__proto__ = __nox_super_30_167;\n  Object.defineProperty(Foo.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Base);",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, 'method', {\n    value: Object.defineProperty(\n      function (Foo) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return super.method(Foo);\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return () => {\n          let Bar;\n          return super.method(Bar);\n        };\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Baz = (() => {\n  'use strict';\n  const Baz = function Baz() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Baz.prototype, 'method', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        let Baz = (() => {\n          'use strict';\n          const Baz = function Baz() {\n            if (!new.target) throw new TypeError('Cannot call a class as a function');\n          };\n          Object.defineProperty(Baz.prototype, 'f', {\n            value: Object.defineProperty(\n              function () {\n                if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n                let Baz = 1;\n                return Baz;\n              },\n              'name',\n              {\n                value: 'f',\n                configurable: true,\n              },\n            ),\n            writable: true,\n            configurable: true,\n          });\n          Object.defineProperty(Baz, 'prototype', { writable: false });\n          return Baz;\n        })();\n        return super.method(Baz);\n      },\n      'name',\n      {\n        value: 'method',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Baz, 'prototype', { writable: false });\n  return Baz;\n})();",
  "import { a } from './a';\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, '_a', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        a();\n      },\n      'name',\n      {\n        value: '_a',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Hello = (() => {\n  'use strict';\n  const Hello = function Hello() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    return {\n      toString() {\n        return 'hello';\n      },\n    };\n  };\n  Object.defineProperty(Hello, 'prototype', { writable: false });\n  return Hello;\n})();\nlet Outer = (__nox_super_125_277 => {\n  'use strict';\n  const Outer = function Outer() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_125_277, arguments, _newtarget || Outer);\n      return _this;\n    }\n    var _result = function () {\n      let Inner = (_key => {\n        'use strict';\n        const Inner = function Inner() {\n          if (!new.target) throw new TypeError('Cannot call a class as a function');\n        };\n        Object.defineProperty(Inner.prototype, _key, {\n          value: Object.defineProperty(\n            function () {\n              if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n              return 'hello';\n            },\n            'name',\n            {\n              value:\n                typeof _key === 'symbol'\n                  ? _key.description === void 0\n                    ? ''\n                    : '[' + _key.description + ']'\n                  : String(_key),\n              configurable: true,\n            },\n          ),\n          writable: true,\n          configurable: true,\n        });\n        Object.defineProperty(Inner, 'prototype', { writable: false });\n        return Inner;\n      })(_super());\n      return new Inner();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_125_277 !== null && typeof __nox_super_125_277 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Outer.prototype = Object.create(__nox_super_125_277 && __nox_super_125_277.prototype, {\n    constructor: {\n      value: Outer,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_125_277);\n  else Outer.__proto__ = __nox_super_125_277;\n  Object.defineProperty(Outer, 'prototype', { writable: false });\n  return Outer;\n})(Hello);\nexpect(new Outer().hello()).toBe('hello');",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Hello = (() => {\n  'use strict';\n  const Hello = function Hello() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Hello.prototype, 'toString', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'hello';\n      },\n      'name',\n      {\n        value: 'toString',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Hello, 'prototype', { writable: false });\n  return Hello;\n})();\nlet Outer = (__nox_super_70_244 => {\n  'use strict';\n  const Outer = function Outer() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_70_244, [], new.target || Outer);\n    var _result = function () {\n      let Inner = (_key => {\n        'use strict';\n        const Inner = function Inner() {\n          if (!new.target) throw new TypeError('Cannot call a class as a function');\n        };\n        Object.defineProperty(Inner.prototype, _key, {\n          value: Object.defineProperty(\n            function () {\n              if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n              return 'hello';\n            },\n            'name',\n            {\n              value:\n                typeof _key === 'symbol'\n                  ? _key.description === void 0\n                    ? ''\n                    : '[' + _key.description + ']'\n                  : String(_key),\n              configurable: true,\n            },\n          ),\n          writable: true,\n          configurable: true,\n        });\n        Object.defineProperty(Inner, 'prototype', { writable: false });\n        return Inner;\n      })(_get(Object.getPrototypeOf(Outer.prototype), 'toString', this).call(this));\n      return new Inner();\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_70_244 !== null && typeof __nox_super_70_244 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Outer.prototype = Object.create(__nox_super_70_244 && __nox_super_70_244.prototype, {\n    constructor: {\n      value: Outer,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_70_244);\n  else Outer.__proto__ = __nox_super_70_244;\n  Object.defineProperty(Outer, 'prototype', { writable: false });\n  return Outer;\n})(Hello);\nexpect(new Outer().hello()).toBe('hello');",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Hello = (() => {\n  'use strict';\n  const Hello = function Hello() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    return {\n      toString() {\n        return 'hello';\n      },\n    };\n  };\n  Object.defineProperty(Hello, 'prototype', { writable: false });\n  return Hello;\n})();\nlet Outer = (__nox_super_125_275 => {\n  'use strict';\n  const Outer = function Outer() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_125_275, arguments, _newtarget || Outer);\n      return _this;\n    }\n    var _result = function () {\n      const Inner = {\n        [_super()]() {\n          return 'hello';\n        },\n      };\n      return Inner;\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_125_275 !== null && typeof __nox_super_125_275 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Outer.prototype = Object.create(__nox_super_125_275 && __nox_super_125_275.prototype, {\n    constructor: {\n      value: Outer,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_125_275);\n  else Outer.__proto__ = __nox_super_125_275;\n  Object.defineProperty(Outer, 'prototype', { writable: false });\n  return Outer;\n})(Hello);\nexpect(new Outer().hello()).toBe('hello');",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Hello = (() => {\n  'use strict';\n  const Hello = function Hello() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Hello.prototype, 'toString', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'hello';\n      },\n      'name',\n      {\n        value: 'toString',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Hello, 'prototype', { writable: false });\n  return Hello;\n})();\nlet Outer = (__nox_super_70_242 => {\n  'use strict';\n  const Outer = function Outer() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_70_242, [], new.target || Outer);\n    var _result = function () {\n      const Inner = {\n        [_get(Object.getPrototypeOf(Outer.prototype), 'toString', this).call(this)]() {\n          return 'hello';\n        },\n      };\n      return Inner;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_70_242 !== null && typeof __nox_super_70_242 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Outer.prototype = Object.create(__nox_super_70_242 && __nox_super_70_242.prototype, {\n    constructor: {\n      value: Outer,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_70_242);\n  else Outer.__proto__ = __nox_super_70_242;\n  Object.defineProperty(Outer, 'prototype', { writable: false });\n  return Outer;\n})(Hello);\nexpect(new Outer().hello()).toBe('hello');",
  "let Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "let MyCtrl = (() => {\n  'use strict';\n  const MyCtrl = function MyCtrl(a) {\n    'any directive prologue';\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    foo;\n  };\n  Object.defineProperty(MyCtrl, 'prototype', { writable: false });\n  return MyCtrl;\n})();\nlet MyCtrl2 = (() => {\n  'use strict';\n  const MyCtrl2 = function MyCtrl2(a) {\n    'a';\n    'b';\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    foo;\n  };\n  Object.defineProperty(MyCtrl2, 'prototype', { writable: false });\n  return MyCtrl2;\n})();\nlet MyCtrl3 = (() => {\n  'use strict';\n  const MyCtrl3 = function MyCtrl3(a) {\n    'a';\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    foo;\n    ('b');\n  };\n  Object.defineProperty(MyCtrl3, 'prototype', { writable: false });\n  return MyCtrl3;\n})();",
  "// #1649\nlet Foo = ((_key, _key11) => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo.prototype, _key, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key === 'symbol'\n            ? _key.description === void 0\n              ? ''\n              : '[' + _key.description + ']'\n            : String(_key),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, _key11, {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value:\n          typeof _key11 === 'symbol'\n            ? _key11.description === void 0\n              ? ''\n              : '[' + _key11.description + ']'\n            : String(_key11),\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Symbol(), Symbol());",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    return { x: 1 };\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexpect(new Foo().x).toBe(1);\nlet Bar = (__nox_super_102_174 => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_102_174, [], new.target || Bar);\n    var _result = function () {\n      return;\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_102_174 !== null && typeof __nox_super_102_174 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Bar.prototype = Object.create(__nox_super_102_174 && __nox_super_102_174.prototype, {\n    constructor: {\n      value: Bar,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar, __nox_super_102_174);\n  else Bar.__proto__ = __nox_super_102_174;\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})(Foo);\nexpect(new Bar().x).toBe(1);\nlet Bar2 = (__nox_super_206_316 => {\n  'use strict';\n  const Bar2 = function Bar2() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_206_316, [], new.target || Bar2);\n    var _result = function () {\n      expect(this.x).toBe(1);\n      return { x: 2 };\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_206_316 !== null && typeof __nox_super_206_316 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Bar2.prototype = Object.create(__nox_super_206_316 && __nox_super_206_316.prototype, {\n    constructor: {\n      value: Bar2,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar2, __nox_super_206_316);\n  else Bar2.__proto__ = __nox_super_206_316;\n  Object.defineProperty(Bar2, 'prototype', { writable: false });\n  return Bar2;\n})(Foo);\nexpect(new Bar2().x).toBe(2);\nlet singleton;\nlet Sub = (__nox_super_365_488 => {\n  'use strict';\n  const Sub = function Sub() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_365_488, arguments, _newtarget || Sub);\n      return _this;\n    }\n    var _result = function () {\n      if (singleton) {\n        return singleton;\n      }\n      singleton = _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_365_488 !== null && typeof __nox_super_365_488 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Sub.prototype = Object.create(__nox_super_365_488 && __nox_super_365_488.prototype, {\n    constructor: {\n      value: Sub,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_365_488);\n  else Sub.__proto__ = __nox_super_365_488;\n  Object.defineProperty(Sub, 'prototype', { writable: false });\n  return Sub;\n})(Foo);\nlet instance = new Sub();\nexpect(instance).toBe(singleton);\ninstance = new Sub();\nexpect(instance).toBe(singleton);\nlet Undefined = (__nox_super_604_720 => {\n  'use strict';\n  const Undefined = function Undefined() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_604_720, arguments, _newtarget || Undefined);\n      return _this;\n    }\n    var _result = function () {\n      if (false) {\n        _super();\n      }\n      return;\n      _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_604_720 !== null && typeof __nox_super_604_720 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Undefined.prototype = Object.create(__nox_super_604_720 && __nox_super_604_720.prototype, {\n    constructor: {\n      value: Undefined,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Undefined, __nox_super_604_720);\n  else Undefined.__proto__ = __nox_super_604_720;\n  Object.defineProperty(Undefined, 'prototype', { writable: false });\n  return Undefined;\n})(Foo);\nexpect(() => {\n  new Undefined();\n}).toThrow('this');",
  "var BaseView = (() => {\n  'use strict';\n  const BaseView = function BaseView() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    this.autoRender = true;\n  };\n  Object.defineProperty(BaseView, 'prototype', { writable: false });\n  return BaseView;\n})();\nvar BaseView = (() => {\n  'use strict';\n  const _Class = function _Class() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    this.autoRender = true;\n  };\n  Object.defineProperty(_Class, 'name', {\n    value: 'BaseView',\n    configurable: true,\n  });\n  Object.defineProperty(_Class, 'prototype', { writable: false });\n  return _Class;\n})();\nvar BaseView = (() => {\n  'use strict';\n  const _Class11 = function _Class11() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(_Class11, 'name', {\n    value: 'BaseView',\n    configurable: true,\n  });\n  Object.defineProperty(_Class11.prototype, 'foo', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.autoRender = true;\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(_Class11, 'prototype', { writable: false });\n  return _Class11;\n})();",
  "let A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A, 'a', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'a',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'b', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'get b',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A, 'b', {\n    set: Object.defineProperty(\n      function (b) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'set b',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet TestEmpty = (__nox_super_0_38 => {\n  'use strict';\n  const TestEmpty = function TestEmpty() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_0_38, arguments, new.target || TestEmpty);\n    return _this;\n  };\n  if (__nox_super_0_38 !== null && typeof __nox_super_0_38 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  TestEmpty.prototype = Object.create(__nox_super_0_38 && __nox_super_0_38.prototype, {\n    constructor: {\n      value: TestEmpty,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(TestEmpty, __nox_super_0_38);\n  else TestEmpty.__proto__ = __nox_super_0_38;\n  Object.defineProperty(TestEmpty, 'prototype', { writable: false });\n  return TestEmpty;\n})(\n  (() => {\n    'use strict';\n    const _Class = function _Class() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class, 'prototype', { writable: false });\n    return _Class;\n  })(),\n);\nlet TestConstructorOnly = (__nox_super_40_106 => {\n  'use strict';\n  const TestConstructorOnly = function TestConstructorOnly() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_40_106, arguments, new.target || TestConstructorOnly);\n    return _this;\n  };\n  if (__nox_super_40_106 !== null && typeof __nox_super_40_106 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  TestConstructorOnly.prototype = Object.create(\n    __nox_super_40_106 && __nox_super_40_106.prototype,\n    {\n      constructor: {\n        value: TestConstructorOnly,\n        writable: true,\n        configurable: true,\n      },\n    },\n  );\n  if (Object.setPrototypeOf) Object.setPrototypeOf(TestConstructorOnly, __nox_super_40_106);\n  else TestConstructorOnly.__proto__ = __nox_super_40_106;\n  Object.defineProperty(TestConstructorOnly, 'prototype', { writable: false });\n  return TestConstructorOnly;\n})(\n  (() => {\n    'use strict';\n    const _Class15 = function _Class15() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class15, 'prototype', { writable: false });\n    return _Class15;\n  })(),\n);\nlet TestMethodOnly = (__nox_super_108_164 => {\n  'use strict';\n  const TestMethodOnly = function TestMethodOnly() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_108_164, arguments, new.target || TestMethodOnly);\n    return _this;\n  };\n  if (__nox_super_108_164 !== null && typeof __nox_super_108_164 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  TestMethodOnly.prototype = Object.create(__nox_super_108_164 && __nox_super_108_164.prototype, {\n    constructor: {\n      value: TestMethodOnly,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(TestMethodOnly, __nox_super_108_164);\n  else TestMethodOnly.__proto__ = __nox_super_108_164;\n  Object.defineProperty(TestMethodOnly, 'prototype', { writable: false });\n  return TestMethodOnly;\n})(\n  (() => {\n    'use strict';\n    const _Class16 = function _Class16() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class16.prototype, 'method', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class16, 'prototype', { writable: false });\n    return _Class16;\n  })(),\n);\nlet TestConstructorAndMethod = (__nox_super_166_253 => {\n  'use strict';\n  const TestConstructorAndMethod = function TestConstructorAndMethod() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_166_253, arguments, new.target || TestConstructorAndMethod);\n    return _this;\n  };\n  if (__nox_super_166_253 !== null && typeof __nox_super_166_253 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  TestConstructorAndMethod.prototype = Object.create(\n    __nox_super_166_253 && __nox_super_166_253.prototype,\n    {\n      constructor: {\n        value: TestConstructorAndMethod,\n        writable: true,\n        configurable: true,\n      },\n    },\n  );\n  if (Object.setPrototypeOf) Object.setPrototypeOf(TestConstructorAndMethod, __nox_super_166_253);\n  else TestConstructorAndMethod.__proto__ = __nox_super_166_253;\n  Object.defineProperty(TestConstructorAndMethod, 'prototype', { writable: false });\n  return TestConstructorAndMethod;\n})(\n  (() => {\n    'use strict';\n    const _Class17 = function _Class17() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class17.prototype, 'method', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class17, 'prototype', { writable: false });\n    return _Class17;\n  })(),\n);\nlet TestMultipleMethods = (__nox_super_255_323 => {\n  'use strict';\n  const TestMultipleMethods = function TestMultipleMethods() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_255_323, arguments, new.target || TestMultipleMethods);\n    return _this;\n  };\n  if (__nox_super_255_323 !== null && typeof __nox_super_255_323 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  TestMultipleMethods.prototype = Object.create(\n    __nox_super_255_323 && __nox_super_255_323.prototype,\n    {\n      constructor: {\n        value: TestMultipleMethods,\n        writable: true,\n        configurable: true,\n      },\n    },\n  );\n  if (Object.setPrototypeOf) Object.setPrototypeOf(TestMultipleMethods, __nox_super_255_323);\n  else TestMultipleMethods.__proto__ = __nox_super_255_323;\n  Object.defineProperty(TestMultipleMethods, 'prototype', { writable: false });\n  return TestMultipleMethods;\n})(\n  (() => {\n    'use strict';\n    const _Class18 = function _Class18() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(_Class18.prototype, 'm1', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value: 'm1',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class18.prototype, 'm2', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n        'name',\n        {\n          value: 'm2',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(_Class18, 'prototype', { writable: false });\n    return _Class18;\n  })(),\n);",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nconst oldReflect = global.Reflect;\ntry {\n  global.Reflect = undefined;\n  let NewTarget;\n  let A = (() => {\n    'use strict';\n    const A = function A() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      NewTarget = new.target;\n    };\n    Object.defineProperty(A, 'prototype', { writable: false });\n    return A;\n  })();\n  let B = (__nox_super_169_189 => {\n    'use strict';\n    const B = function B() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      var _this = _construct(__nox_super_169_189, arguments, new.target || B);\n      return _this;\n    };\n    if (__nox_super_169_189 !== null && typeof __nox_super_169_189 !== 'function')\n      throw new TypeError('Super expression must either be null or a function');\n    B.prototype = Object.create(__nox_super_169_189 && __nox_super_169_189.prototype, {\n      constructor: {\n        value: B,\n        writable: true,\n        configurable: true,\n      },\n    });\n    if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_169_189);\n    else B.__proto__ = __nox_super_169_189;\n    Object.defineProperty(B, 'prototype', { writable: false });\n    return B;\n  })(A);\n  new A();\n  expect(NewTarget).toBe(A);\n  new B();\n  expect(NewTarget).toBe(B);\n} finally {\n  global.Reflect = oldReflect;\n}",
  "'use strict';\nvar _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet NewTarget;\nlet A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    NewTarget = new.target;\n  };\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nlet B = (__nox_super_87_107 => {\n  'use strict';\n  const B = function B() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_87_107, arguments, new.target || B);\n    return _this;\n  };\n  if (__nox_super_87_107 !== null && typeof __nox_super_87_107 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  B.prototype = Object.create(__nox_super_87_107 && __nox_super_87_107.prototype, {\n    constructor: {\n      value: B,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_87_107);\n  else B.__proto__ = __nox_super_87_107;\n  Object.defineProperty(B, 'prototype', { writable: false });\n  return B;\n})(A);\nnew A();\nexpect(NewTarget).toBe(A);\nnew B();\nexpect(NewTarget).toBe(B);",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo(props) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    [x, ...super.client] = props;\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo(props) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    [super.client] = props;\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo(props) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    ({ x, ...super.client } = props);\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (() => {\n  'use strict';\n  const Foo = function Foo(props) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    ({ client: super.client } = props);\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nnew ((__nox_super_20_85 => {\n  'use strict';\n  const _Class = function _Class() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_20_85, arguments, _newtarget || _Class);\n      return _this;\n    }\n    var _result = function () {\n      _super() || null;\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_20_85 !== null && typeof __nox_super_20_85 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  _Class.prototype = Object.create(__nox_super_20_85 && __nox_super_20_85.prototype, {\n    constructor: {\n      value: _Class,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_20_85);\n  else _Class.__proto__ = __nox_super_20_85;\n  Object.defineProperty(_Class, 'prototype', { writable: false });\n  return _Class;\n})(Base))();\nnew ((__nox_super_91_152 => {\n  'use strict';\n  const _Class11 = function _Class11() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_91_152, arguments, _newtarget || _Class11);\n      return _this;\n    }\n    var _result = function () {\n      _super()?.();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_91_152 !== null && typeof __nox_super_91_152 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  _Class11.prototype = Object.create(__nox_super_91_152 && __nox_super_91_152.prototype, {\n    constructor: {\n      value: _Class11,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class11, __nox_super_91_152);\n  else _Class11.__proto__ = __nox_super_91_152;\n  Object.defineProperty(_Class11, 'prototype', { writable: false });\n  return _Class11;\n})(Base))();\nnew ((__nox_super_158_223 => {\n  'use strict';\n  const _Class12 = function _Class12() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_158_223, arguments, _newtarget || _Class12);\n      return _this;\n    }\n    var _result = function () {\n      _super()?.[null];\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_158_223 !== null && typeof __nox_super_158_223 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  _Class12.prototype = Object.create(__nox_super_158_223 && __nox_super_158_223.prototype, {\n    constructor: {\n      value: _Class12,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class12, __nox_super_158_223);\n  else _Class12.__proto__ = __nox_super_158_223;\n  Object.defineProperty(_Class12, 'prototype', { writable: false });\n  return _Class12;\n})(Base))();\nnew ((__nox_super_229_290 => {\n  'use strict';\n  const _Class13 = function _Class13() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_229_290, arguments, _newtarget || _Class13);\n      return _this;\n    }\n    var _result = function () {\n      1 + _super();\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_229_290 !== null && typeof __nox_super_229_290 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  _Class13.prototype = Object.create(__nox_super_229_290 && __nox_super_229_290.prototype, {\n    constructor: {\n      value: _Class13,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class13, __nox_super_229_290);\n  else _Class13.__proto__ = __nox_super_229_290;\n  Object.defineProperty(_Class13, 'prototype', { writable: false });\n  return _Class13;\n})(Base))();",
  "let Test = (() => {\n  'use strict';\n  const Test = function Test() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test.prototype, 'foo', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        super();\n      },\n      'name',\n      {\n        value: 'foo',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Test, 'prototype', { writable: false });\n  return Test;\n})();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Base = (() => {\n  'use strict';\n  const Base = function Base() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Base, 'prototype', { writable: false });\n  return Base;\n})();\nexpect(\n  () =>\n    new ((__nox_super_33_106 => {\n      'use strict';\n      const _Class = function _Class() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        var _this,\n          _newtarget = new.target;\n        function _super() {\n          _this = _construct(__nox_super_33_106, arguments, _newtarget || _Class);\n          return _this;\n        }\n        var _result = function () {\n          x: {\n            break x;\n            _super();\n          }\n        }.apply(void 0, arguments);\n        if (_result !== void 0) {\n          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n            return _result;\n          throw new TypeError('Derived constructors may only return object or undefined');\n        }\n        if (_this === void 0)\n          throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n        return _this;\n      };\n      if (__nox_super_33_106 !== null && typeof __nox_super_33_106 !== 'function')\n        throw new TypeError('Super expression must either be null or a function');\n      _Class.prototype = Object.create(__nox_super_33_106 && __nox_super_33_106.prototype, {\n        constructor: {\n          value: _Class,\n          writable: true,\n          configurable: true,\n        },\n      });\n      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_33_106);\n      else _Class.__proto__ = __nox_super_33_106;\n      Object.defineProperty(_Class, 'prototype', { writable: false });\n      return _Class;\n    })(Base))(),\n).toThrow();\nexpect(\n  () =>\n    new ((__nox_super_137_211 => {\n      'use strict';\n      const _Class11 = function _Class11() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        var _this,\n          _newtarget = new.target;\n        function _super() {\n          _this = _construct(__nox_super_137_211, arguments, _newtarget || _Class11);\n          return _this;\n        }\n        var _result = function () {\n          try {\n          } catch {\n            _super();\n          }\n        }.apply(void 0, arguments);\n        if (_result !== void 0) {\n          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n            return _result;\n          throw new TypeError('Derived constructors may only return object or undefined');\n        }\n        if (_this === void 0)\n          throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n        return _this;\n      };\n      if (__nox_super_137_211 !== null && typeof __nox_super_137_211 !== 'function')\n        throw new TypeError('Super expression must either be null or a function');\n      _Class11.prototype = Object.create(__nox_super_137_211 && __nox_super_137_211.prototype, {\n        constructor: {\n          value: _Class11,\n          writable: true,\n          configurable: true,\n        },\n      });\n      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class11, __nox_super_137_211);\n      else _Class11.__proto__ = __nox_super_137_211;\n      Object.defineProperty(_Class11, 'prototype', { writable: false });\n      return _Class11;\n    })(Base))(),\n).toThrow();\nexpect(\n  () =>\n    new ((__nox_super_242_325 => {\n      'use strict';\n      const _Class12 = function _Class12() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        var _this,\n          _newtarget = new.target;\n        function _super() {\n          _this = _construct(__nox_super_242_325, arguments, _newtarget || _Class12);\n          return _this;\n        }\n        var _result = function () {\n          try {\n            throw 0;\n            _super();\n          } catch {}\n        }.apply(void 0, arguments);\n        if (_result !== void 0) {\n          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n            return _result;\n          throw new TypeError('Derived constructors may only return object or undefined');\n        }\n        if (_this === void 0)\n          throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n        return _this;\n      };\n      if (__nox_super_242_325 !== null && typeof __nox_super_242_325 !== 'function')\n        throw new TypeError('Super expression must either be null or a function');\n      _Class12.prototype = Object.create(__nox_super_242_325 && __nox_super_242_325.prototype, {\n        constructor: {\n          value: _Class12,\n          writable: true,\n          configurable: true,\n        },\n      });\n      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class12, __nox_super_242_325);\n      else _Class12.__proto__ = __nox_super_242_325;\n      Object.defineProperty(_Class12, 'prototype', { writable: false });\n      return _Class12;\n    })(Base))(),\n).toThrow();\nexpect(\n  () =>\n    new ((__nox_super_356_421 => {\n      'use strict';\n      const _Class13 = function _Class13() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        var _this,\n          _newtarget = new.target;\n        function _super() {\n          _this = _construct(__nox_super_356_421, arguments, _newtarget || _Class13);\n          return _this;\n        }\n        var _result = function () {\n          true || _super();\n        }.apply(void 0, arguments);\n        if (_result !== void 0) {\n          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n            return _result;\n          throw new TypeError('Derived constructors may only return object or undefined');\n        }\n        if (_this === void 0)\n          throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n        return _this;\n      };\n      if (__nox_super_356_421 !== null && typeof __nox_super_356_421 !== 'function')\n        throw new TypeError('Super expression must either be null or a function');\n      _Class13.prototype = Object.create(__nox_super_356_421 && __nox_super_356_421.prototype, {\n        constructor: {\n          value: _Class13,\n          writable: true,\n          configurable: true,\n        },\n      });\n      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class13, __nox_super_356_421);\n      else _Class13.__proto__ = __nox_super_356_421;\n      Object.defineProperty(_Class13, 'prototype', { writable: false });\n      return _Class13;\n    })(Base))(),\n).toThrow();\nexpect(\n  () =>\n    new ((__nox_super_452_517 => {\n      'use strict';\n      const _Class14 = function _Class14() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        var _this,\n          _newtarget = new.target;\n        function _super() {\n          _this = _construct(__nox_super_452_517, arguments, _newtarget || _Class14);\n          return _this;\n        }\n        var _result = function () {\n          ({}) ?? _super();\n        }.apply(void 0, arguments);\n        if (_result !== void 0) {\n          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n            return _result;\n          throw new TypeError('Derived constructors may only return object or undefined');\n        }\n        if (_this === void 0)\n          throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n        return _this;\n      };\n      if (__nox_super_452_517 !== null && typeof __nox_super_452_517 !== 'function')\n        throw new TypeError('Super expression must either be null or a function');\n      _Class14.prototype = Object.create(__nox_super_452_517 && __nox_super_452_517.prototype, {\n        constructor: {\n          value: _Class14,\n          writable: true,\n          configurable: true,\n        },\n      });\n      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class14, __nox_super_452_517);\n      else _Class14.__proto__ = __nox_super_452_517;\n      Object.defineProperty(_Class14, 'prototype', { writable: false });\n      return _Class14;\n    })(Base))(),\n).toThrow();\nexpect(\n  () =>\n    new ((__nox_super_548_614 => {\n      'use strict';\n      const _Class15 = function _Class15() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        var _this,\n          _newtarget = new.target;\n        function _super() {\n          _this = _construct(__nox_super_548_614, arguments, _newtarget || _Class15);\n          return _this;\n        }\n        var _result = function () {\n          false && _super();\n        }.apply(void 0, arguments);\n        if (_result !== void 0) {\n          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n            return _result;\n          throw new TypeError('Derived constructors may only return object or undefined');\n        }\n        if (_this === void 0)\n          throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n        return _this;\n      };\n      if (__nox_super_548_614 !== null && typeof __nox_super_548_614 !== 'function')\n        throw new TypeError('Super expression must either be null or a function');\n      _Class15.prototype = Object.create(__nox_super_548_614 && __nox_super_548_614.prototype, {\n        constructor: {\n          value: _Class15,\n          writable: true,\n          configurable: true,\n        },\n      });\n      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class15, __nox_super_548_614);\n      else _Class15.__proto__ = __nox_super_548_614;\n      Object.defineProperty(_Class15, 'prototype', { writable: false });\n      return _Class15;\n    })(Base))(),\n).toThrow();\nexpect(\n  () =>\n    new ((__nox_super_645_710 => {\n      'use strict';\n      const _Class16 = function _Class16() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        var _this,\n          _newtarget = new.target;\n        function _super() {\n          _this = _construct(__nox_super_645_710, arguments, _newtarget || _Class16);\n          return _this;\n        }\n        var _result = function () {\n          null?.(_super());\n        }.apply(void 0, arguments);\n        if (_result !== void 0) {\n          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n            return _result;\n          throw new TypeError('Derived constructors may only return object or undefined');\n        }\n        if (_this === void 0)\n          throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n        return _this;\n      };\n      if (__nox_super_645_710 !== null && typeof __nox_super_645_710 !== 'function')\n        throw new TypeError('Super expression must either be null or a function');\n      _Class16.prototype = Object.create(__nox_super_645_710 && __nox_super_645_710.prototype, {\n        constructor: {\n          value: _Class16,\n          writable: true,\n          configurable: true,\n        },\n      });\n      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class16, __nox_super_645_710);\n      else _Class16.__proto__ = __nox_super_645_710;\n      Object.defineProperty(_Class16, 'prototype', { writable: false });\n      return _Class16;\n    })(Base))(),\n).toThrow();\nexpect(\n  () =>\n    new ((__nox_super_742_807 => {\n      'use strict';\n      const _Class17 = function _Class17() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        var _this,\n          _newtarget = new.target;\n        function _super() {\n          _this = _construct(__nox_super_742_807, arguments, _newtarget || _Class17);\n          return _this;\n        }\n        var _result = function () {\n          null?.[_super()];\n        }.apply(void 0, arguments);\n        if (_result !== void 0) {\n          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n            return _result;\n          throw new TypeError('Derived constructors may only return object or undefined');\n        }\n        if (_this === void 0)\n          throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n        return _this;\n      };\n      if (__nox_super_742_807 !== null && typeof __nox_super_742_807 !== 'function')\n        throw new TypeError('Super expression must either be null or a function');\n      _Class17.prototype = Object.create(__nox_super_742_807 && __nox_super_742_807.prototype, {\n        constructor: {\n          value: _Class17,\n          writable: true,\n          configurable: true,\n        },\n      });\n      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class17, __nox_super_742_807);\n      else _Class17.__proto__ = __nox_super_742_807;\n      Object.defineProperty(_Class17, 'prototype', { writable: false });\n      return _Class17;\n    })(Base))(),\n).toThrow();",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar A_called = false;\nvar X_called = false;\nlet A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    A_called = true;\n  };\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nlet X = (() => {\n  'use strict';\n  const X = function X() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    X_called = true;\n  };\n  Object.defineProperty(X, 'prototype', { writable: false });\n  return X;\n})();\nlet B = (__nox_super_137_157 => {\n  'use strict';\n  const B = function B() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_137_157, arguments, new.target || B);\n    return _this;\n  };\n  if (__nox_super_137_157 !== null && typeof __nox_super_137_157 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  B.prototype = Object.create(__nox_super_137_157 && __nox_super_137_157.prototype, {\n    constructor: {\n      value: B,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_137_157);\n  else B.__proto__ = __nox_super_137_157;\n  Object.defineProperty(B, 'prototype', { writable: false });\n  return B;\n})(A);\nB.prototype.__proto__ = X.prototype;\nB.__proto__ = X;\nexpect(new B() instanceof B).toBe(true);\nexpect(new B() instanceof A).toBe(false);\nexpect(new B() instanceof X).toBe(true);\nexpect(A_called).toBe(false);\nexpect(X_called).toBe(true);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_85 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_14_85, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      _get(Object.getPrototypeOf(Foo.prototype), 'foo', _this).call(_this, _super());\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_14_85 !== null && typeof __nox_super_14_85 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_85 && __nox_super_14_85.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_85);\n  else Foo.__proto__ = __nox_super_14_85;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (__nox_super_0_71 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_71, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      _get(Object.getPrototypeOf(Foo.prototype), 'foo', _this).call(_this, _super());\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_71 !== null && typeof __nox_super_0_71 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_71 && __nox_super_0_71.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_71);\n  else Foo.__proto__ = __nox_super_0_71;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_91 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _get(Object.getPrototypeOf(Foo.prototype), 'foo', _construct.assert(_this)).call(\n      _construct.assert(_this),\n    );\n    var _this = _construct(__nox_super_14_91, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_14_91 !== null && typeof __nox_super_14_91 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_91 && __nox_super_14_91.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_91);\n  else Foo.__proto__ = __nox_super_14_91;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (__nox_super_0_77 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _get(Object.getPrototypeOf(Foo.prototype), 'foo', _construct.assert(_this)).call(\n      _construct.assert(_this),\n    );\n    var _this = _construct(__nox_super_0_77, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_77 !== null && typeof __nox_super_0_77 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_77 && __nox_super_0_77.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_77);\n  else Foo.__proto__ = __nox_super_0_77;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_27_129 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const t = () =>\n      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(\n        _construct.assert(_this),\n      );\n    t();\n    var _this = _construct(__nox_super_27_129, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_27_129 !== null && typeof __nox_super_27_129 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_27_129 && __nox_super_27_129.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_27_129);\n  else Foo.__proto__ = __nox_super_27_129;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (__nox_super_0_108 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var t = () =>\n      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(\n        _construct.assert(_this),\n      );\n    _get(Object.getPrototypeOf(Foo.prototype), 'foo', _construct.assert(_this)).call(\n      _construct.assert(_this),\n    );\n    var _this = _construct(__nox_super_0_108, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_108 !== null && typeof __nox_super_0_108 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_108 && __nox_super_0_108.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_108);\n  else Foo.__proto__ = __nox_super_0_108;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_27_129 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const t = () =>\n      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(\n        _construct.assert(_this),\n      );\n    var _this = _construct(__nox_super_27_129, [], new.target || Foo);\n    var _result = function () {\n      t();\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_27_129 !== null && typeof __nox_super_27_129 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_27_129 && __nox_super_27_129.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_27_129);\n  else Foo.__proto__ = __nox_super_27_129;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nnew Foo();",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (__nox_super_0_102 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const t = () =>\n      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(\n        _construct.assert(_this),\n      );\n    var _this = _construct(__nox_super_0_102, [], new.target || Foo);\n    var _result = function () {\n      t();\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_102 !== null && typeof __nox_super_0_102 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_102 && __nox_super_0_102.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_102);\n  else Foo.__proto__ = __nox_super_0_102;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_27_120 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const t = () =>\n      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(\n        _construct.assert(_this),\n      );\n    var _this = _construct(__nox_super_27_120, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_27_120 !== null && typeof __nox_super_27_120 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_27_120 && __nox_super_27_120.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_27_120);\n  else Foo.__proto__ = __nox_super_27_120;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nnew Foo();",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (__nox_super_0_93 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const t = () =>\n      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(\n        _construct.assert(_this),\n      );\n    var _this = _construct(__nox_super_0_93, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_93 !== null && typeof __nox_super_0_93 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_93 && __nox_super_0_93.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_93);\n  else Foo.__proto__ = __nox_super_0_93;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet called = false;\nlet A = (() => {\n  'use strict';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 'prop', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        called = true;\n      },\n      'name',\n      {\n        value: 'get prop',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nlet B = (__nox_super_72_139 => {\n  'use strict';\n  const B = function B() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_72_139, arguments, _newtarget || B);\n      return _this;\n    }\n    var _result = function () {\n      _get(Object.getPrototypeOf(B.prototype), _super().prop, _this);\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_72_139 !== null && typeof __nox_super_72_139 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  B.prototype = Object.create(__nox_super_72_139 && __nox_super_72_139.prototype, {\n    constructor: {\n      value: B,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_72_139);\n  else B.__proto__ = __nox_super_72_139;\n  Object.defineProperty(B, 'prototype', { writable: false });\n  return B;\n})(A);\nexpect(() => {\n  new B();\n}).toThrow(ReferenceError);\nexpect(called).toBe(false);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nlet Foo = (__nox_super_0_76 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_76, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      _get(Object.getPrototypeOf(Foo.prototype), _super().method, _this).call(_this);\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_76 !== null && typeof __nox_super_0_76 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_76 && __nox_super_0_76.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_76);\n  else Foo.__proto__ = __nox_super_0_76;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\n// test262/test/language/expressions/super/call-spread-err-sngl-err-itr-get-get.js\nvar iter = {};\nObject.defineProperty(iter, Symbol.iterator, {\n  get: function () {\n    throw new Error('err');\n  },\n});\nlet Test262ParentClass = (() => {\n  'use strict';\n  const Test262ParentClass = function Test262ParentClass() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Test262ParentClass, 'prototype', { writable: false });\n  return Test262ParentClass;\n})();\nlet Test262ChildClass = (__nox_super_252_348 => {\n  'use strict';\n  const Test262ChildClass = function Test262ChildClass() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_252_348, [...iter], new.target || Test262ChildClass);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_252_348 !== null && typeof __nox_super_252_348 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Test262ChildClass.prototype = Object.create(\n    __nox_super_252_348 && __nox_super_252_348.prototype,\n    {\n      constructor: {\n        value: Test262ChildClass,\n        writable: true,\n        configurable: true,\n      },\n    },\n  );\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Test262ChildClass, __nox_super_252_348);\n  else Test262ChildClass.__proto__ = __nox_super_252_348;\n  Object.defineProperty(Test262ChildClass, 'prototype', { writable: false });\n  return Test262ChildClass;\n})(Test262ParentClass);\nexpect(() => {\n  new Test262ChildClass();\n}).toThrow('err');",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_78 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_14_78, [this], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_14_78 !== null && typeof __nox_super_14_78 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_78 && __nox_super_14_78.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_78);\n  else Foo.__proto__ = __nox_super_14_78;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_111 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const fn = () => _construct.assert(_this);\n    fn();\n    var _this = _construct(__nox_super_14_111, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_14_111 !== null && typeof __nox_super_14_111 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_111 && __nox_super_14_111.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_111);\n  else Foo.__proto__ = __nox_super_14_111;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nlet Foo = (__nox_super_0_97 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const fn = () => _construct.assert(_this);\n    fn();\n    var _this = _construct(__nox_super_0_97, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_97 !== null && typeof __nox_super_0_97 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_97 && __nox_super_0_97.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_97);\n  else Foo.__proto__ = __nox_super_0_97;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_111 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const fn = () => _construct.assert(_this);\n    var _this = _construct(__nox_super_14_111, [], new.target || Foo);\n    var _result = function () {\n      fn();\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_14_111 !== null && typeof __nox_super_14_111 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_111 && __nox_super_14_111.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_111);\n  else Foo.__proto__ = __nox_super_14_111;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nnew Foo();",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nlet Foo = (__nox_super_0_97 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    const fn = () => _construct.assert(_this);\n    var _this = _construct(__nox_super_0_97, [], new.target || Foo);\n    var _result = function () {\n      fn();\n    }.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_97 !== null && typeof __nox_super_0_97 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_97 && __nox_super_0_97.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_97);\n  else Foo.__proto__ = __nox_super_0_97;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_76 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_14_76, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      Foo[_this];\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_14_76 !== null && typeof __nox_super_14_76 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_76 && __nox_super_14_76.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_76);\n  else Foo.__proto__ = __nox_super_14_76;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow(\"this hasn't been initialised\");",
  "var _construct2 = { construct: require('@babel/runtime/helpers/construct') };\nfunction _construct(t, r, c) {\n  return _construct2.construct(t, r, c);\n}\nlet Foo = (__nox_super_0_62 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this,\n      _newtarget = new.target;\n    function _super() {\n      _this = _construct(__nox_super_0_62, arguments, _newtarget || Foo);\n      return _this;\n    }\n    var _result = function () {\n      Foo[_this];\n    }.apply(void 0, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    if (_this === void 0)\n      throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");\n    return _this;\n  };\n  if (__nox_super_0_62 !== null && typeof __nox_super_0_62 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_62 && __nox_super_0_62.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_62);\n  else Foo.__proto__ = __nox_super_0_62;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nlet Bar = (() => {\n  'use strict';\n  const Bar = function Bar() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Bar, 'prototype', { writable: false });\n  return Bar;\n})();\nlet Foo = (__nox_super_14_96 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _construct.assert(_this).foo = 'bar';\n    var _this = _construct(__nox_super_14_96, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_14_96 !== null && typeof __nox_super_14_96 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_14_96 && __nox_super_14_96.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_96);\n  else Foo.__proto__ = __nox_super_14_96;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);\nexpect(() => new Foo()).toThrow();",
  "var _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nlet Foo = (__nox_super_0_82 => {\n  'use strict';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    _construct.assert(_this).foo = 'bar';\n    var _this = _construct(__nox_super_0_82, [], new.target || Foo);\n    var _result = function () {}.apply(_this, arguments);\n    if (_result !== void 0) {\n      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')\n        return _result;\n      throw new TypeError('Derived constructors may only return object or undefined');\n    }\n    return _this;\n  };\n  if (__nox_super_0_82 !== null && typeof __nox_super_0_82 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Foo.prototype = Object.create(__nox_super_0_82 && __nox_super_0_82.prototype, {\n    constructor: {\n      value: Foo,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_82);\n  else Foo.__proto__ = __nox_super_0_82;\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})(Bar);",
] as const;

export const fixtureCases = [
  {
    title: 'assumption constantSuper — accessing super class (input)',
    source:
      'class Test extends Foo {\n  constructor() {\n    woops.super.test();\n    super();\n    super.test();\n\n    super(...arguments);\n    super("test", ...arguments);\n\n    super.test(...arguments);\n    super.test("test", ...arguments);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption constantSuper — accessing super properties (input)',
    source:
      'class Test extends Foo {\n  constructor() {\n    super();\n    super.test;\n    super.test.whatever;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption constantSuper — accessing super property optional chain (input)',
    source:
      'class Test extends Foo {\n  constructor() {\n    super.foo?.bar;\n    super.foo?.();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption constantSuper — calling super properties (input)',
    source:
      'class Test extends Foo {\n  constructor() {\n    super();\n    super.test.whatever();\n    super.test();\n  }\n\n  static test() {\n    return super.wow();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption constantSuper — default super (input)',
    source:
      'class Test {\n  constructor() {\n    return super.constructor;\n  }\n\n  static test() {\n    return super.constructor;\n  }\n}\n\n// Instances\nexpect(Object.getPrototypeOf(Test.prototype)).toBe(Object.prototype);\nexpect(new Test()).toBe(Object);\n\n// Static\nexpect(Object.getPrototypeOf(Test)).toBe(Function.prototype);\nexpect(Test.test()).toBe(Function);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption constantSuper — super function fallback (input)',
    source: 'class Test {\n  constructor() {\n    super.hasOwnProperty("test");\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption noCallClass — class (input)',
    source: 'class A {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption noCallClass — with constructor (input)',
    source:
      "class A {\n  constructor() {\n    console.log('a');\n  }\n}\n\nclass B {\n  b() {\n    console.log('b');\n  }\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption noCallClass — with superClass (input)',
    source:
      'class B {}\n\nclass A extends B {\n  constructor(track) {\n    if (track !== undefined) super(track);\n    else super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption setClassMethods — literal key (input)',
    source: 'class Foo {\n  "bar"() {\n\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption setClassMethods — method name non bmp not supported (input)',
    source: 'var o = class { 𠮷野家() {} };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption setClassMethods — method return type annotation (input)',
    source: "// @flow\n// @flow\nclass C {\n  m(x: number): string {\n    return 'a';\n  }\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption setClassMethods — method reuse prototype (input)',
    source: 'class Test {\n  a() {}\n  static b() {}\n  c() {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption setClassMethods — program with use strict directive (input)',
    source: '"use strict";\n\nclass Foo {\n    method() {\n        \n    }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins es2015 (exec)',
    source:
      'class ListBuffer extends ArrayBuffer {}\n\nexpect(new ListBuffer).toBeInstanceOf(ListBuffer);\nexpect(new ListBuffer).toBeInstanceOf(ArrayBuffer);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins es2015 (input)',
    source: 'class ListBuffer extends ArrayBuffer {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins es2017 (exec)',
    source:
      'class SharedListBuffer extends SharedArrayBuffer {}\n\nexpect(new SharedListBuffer).toBeInstanceOf(SharedListBuffer);\nexpect(new SharedListBuffer).toBeInstanceOf(SharedArrayBuffer);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins es2017 (input)',
    source: 'class SharedListBuffer extends SharedArrayBuffer {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins es2020 (exec)',
    source:
      'class BigInt64List extends BigInt64Array {}\n\nexpect(new BigInt64List).toBeInstanceOf(BigInt64List);\nexpect(new BigInt64List).toBeInstanceOf(BigInt64Array);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins es2020 (input)',
    source: 'class BigInt64List extends BigInt64Array {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins es2021 (exec)',
    source:
      'class MergedError extends AggregateError {}\n\nexpect(new MergedError([])).toBeInstanceOf(MergedError);\nexpect(new MergedError([])).toBeInstanceOf(AggregateError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins es2021 (input)',
    source: 'class MergedError extends AggregateError {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins (exec)',
    source:
      'class List extends Array {}\n\nexpect(new List).toBeInstanceOf(List);\nexpect(new List).toBeInstanceOf(Array);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — extend builtins (input)',
    source: 'class List extends Array {}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — invalid extend builtins Iterator (exec)',
    source:
      'class RangeIterator extends Iterator {}\n\nexpect(() => new RangeIterator).toThrow("Constructor Iterator requires \'new\'");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
  {
    title: 'assumption superIsCallableConstructor — invalid extend builtins Iterator (input)',
    source:
      '// Iterator can not be invoked with new, so this example does not\n// satisfy the superIsCallableConstructor assumption, it will throw\n// a runtime error\nclass RangeIterator extends Iterator {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — super class id member expression (input)',
    source:
      'class BaseController extends Chaplin.Controller {\n\n}\n\nclass BaseController2 extends Chaplin.Controller.Another {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — super class this usage (input)',
    source:
      'class Test extends Foo {\n  constructor() {\n    super();\n\n    this;\n\n    this.prop = 1;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'assumption superIsCallableConstructor — super class (input)',
    source: 'class Test extends Foo { }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'extend builtins — builtin objects throw when wrapped (exec)',
    source:
      '// JSON is wrapped because it starts with an uppercase letter, but it\n// should not be possible to extend it anyway.\n\nexpect(() => class BetterJSON extends JSON {}).toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'extend builtins — imported_babel plugin transform builtin classes (exec)',
    source:
      "// Imported from\n// https://github.com/WebReflection/babel-plugin-transform-builtin-classes/blob/85efe1374e1c59a8323c7eddd4326f6c93d9f64f/test/test.js\n\nclass List extends Array {\n  constructor(value) {\n    super().push(value);\n  }\n  push(value) {\n    super.push(value);\n    return this;\n  }\n}\n\nexpect(new List(1)).toBeInstanceOf(List);\nexpect(new List(2)).toBeInstanceOf(Array);\n\nvar l = new List(3);\nexpect(l).toHaveLength(1);\nexpect(l[0]).toBe(3);\nexpect(l.push(4)).toBe(l);\nexpect(l).toHaveLength(2);\nexpect(l.join()).toBe('3,4');\n\nclass SecondLevel extends List {\n  method() {\n    return this;\n  }\n}\n\nexpect(new SecondLevel(1)).toBeInstanceOf(SecondLevel);\nexpect(new SecondLevel(2)).toBeInstanceOf(List);\nexpect(new SecondLevel(3)).toBeInstanceOf(Array);\n\nvar s = new SecondLevel(4);\nexpect(s).toHaveLength(1);\nexpect(s[0]).toBe(4);\nexpect(s.push(5)).toBe(s);\nexpect(s).toHaveLength(2);\nexpect(s.join()).toBe('4,5');\nexpect(s.method()).toBe(s);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'extend builtins — overwritten null (exec)',
    source:
      'var env = {\n  Array: null,\n};\n\n// We need to use "with" to avoid leaking the modified Array to other tests.\nwith (env) {\n  class List extends Array {}\n  expect(List.prototype.__proto__).toBeUndefined();\n}\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'extend builtins — shadowed (input)',
    source: 'class Array {}\n\nclass List extends Array {}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'extend builtins — super called (exec)',
    source:
      'var called = false;\n\nvar env = {\n  Array: function Array() {\n    called = true;\n  }\n};\n\n// We need to use "with" to avoid leaking the modified Array to other tests.\nwith (env) {\n  class List extends Array {};\n  new List();\n\n  expect(called).toBe(true);\n}\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'extend builtins — wrap native super (exec)',
    source:
      "// basic sanity check to confirm the external wrapNativeSuper helper works\n\nclass Test1 extends Array {\n  name() {\n    return 'test1';\n  }\n}\n\nclass Test2 extends Array {\n  name() {\n    return 'test2';\n  }\n}\n\nvar t1 = new Test1();\nvar t2 = new Test2();\n\nexpect(Test1).not.toBe(Test2);\nexpect(t1).not.toBe(t2);\nexpect(t1.name()).toBe('test1');\nexpect(t2.name()).toBe('test2');\nexpect(t1).toBeInstanceOf(Test1);\nexpect(t2).toBeInstanceOf(Test2);\nexpect(t1).toBeInstanceOf(Array);\nexpect(t2).toBeInstanceOf(Array);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'get set loose — call semantics data defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n  test(...args) {\n    expect(this).toBe(obj);\n    expect(args).toEqual([1, 2, 3]);\n    return 1;\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    super.test(1, 2, 3);\n    super.test(1, ...[2, 3]);\n    super.test(...[1, 2, 3]);\n    return super.test(...arguments);\n  }\n\n  test() {\n    throw new Error("called");\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — call semantics data defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n  test(...args) {\n    expect(this).toBe(obj);\n    expect(args).toEqual([1, 2, 3]);\n    return 1;\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    super.test(1, 2, 3);\n    super.test(1, ...[2, 3]);\n    super.test(...[1, 2, 3]);\n    return super.test(...arguments);\n  }\n\n  test() {\n    throw new Error("called");\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — call semantics getter defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    // This is incorrect according to the spec,\n    // but close enough for loose.\n    expect(this).toBe(Base.prototype);\n\n    return function(...args) {\n      expect(this).toBe(obj);\n      expect(args).toEqual([1, 2, 3]);\n      return 1;\n    };\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    super.test(1, 2, 3);\n    super.test(1, ...[2, 3]);\n    super.test(...[1, 2, 3]);\n    return super.test(...arguments);\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  writable: true,\n  configurable: true,\n  value() {\n    throw new Error("called");\n  }\n});\n\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'get set loose — call semantics getter defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    // This is incorrect according to the spec,\n    // but close enough for loose.\n    expect(this).toBe(Base.prototype);\n\n    return function(...args) {\n      expect(this).toBe(obj);\n      expect(args).toEqual([1, 2, 3]);\n      return 1;\n    };\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    super.test(1, 2, 3);\n    super.test(1, ...[2, 3]);\n    super.test(...[1, 2, 3]);\n    return super.test(...arguments);\n  }\n\n  test() {\n    throw new Error("called");\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — call semantics not defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  call() {\n    return super.test();\n  }\n\n  test() {\n    throw new Error("gobbledygook");\n  }\n}\n\nconst obj = new Obj();\nexpect(() => {\n  obj.call();\n\n  // Assert that this throws, but that it\'s not\n  // Obj.p.test\'s error that is thrown\n}).toThrow(TypeError)\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'get set loose — call semantics not defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  call() {\n    return super.test();\n  }\n\n  test() {\n    throw new Error("gobbledygook");\n  }\n}\n\nconst obj = new Obj();\nexpect(() => {\n  obj.call();\n\n  // Assert that this throws, but that it\'s not\n  // Obj.p.test\'s error that is thrown\n}).toThrow(TypeError)\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'get set loose — call semantics setter defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n  set test(v) {\n    throw new Error("gobbledygook");\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    return super.test();\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  writable: true,\n  configurable: true,\n  value() {\n    throw new Error("gobbledygook");\n  }\n});\n\nconst obj = new Obj();\nexpect(() => {\n  obj.call();\n\n  // Assert that this throws, but that it\'s not\n  // a gobbledygook error that is thrown\n}).toThrow(TypeError)\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — call semantics setter defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n  set test(v) {\n    throw new Error("gobbledygook");\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    return super.test();\n  }\n\n  test() {\n    throw new Error("gobbledygook");\n  }\n}\n\nconst obj = new Obj();\nexpect(() => {\n  obj.call();\n\n  // Assert that this throws, but that it\'s not\n  // a gobbledygook error that is thrown\n}).toThrow(TypeError)\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'get set loose — get semantics data defined on parent (exec)',
    source:
      "\"use strict\";\nclass Base {\n}\nObject.defineProperty(Base.prototype, 'test', {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — get semantics data defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n}\nBase.prototype.test = 1;\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObj.prototype.test = 2;\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'get set loose — get semantics getter defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    // This is incorrect according to the spec,\n    // but close enough for loose.\n    expect(this).toBe(Base.prototype);\n    return 1;\n  }\n}\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — get semantics getter defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    // This is incorrect according to the spec,\n    // but close enough for loose.\n    expect(this).toBe(Base.prototype);\n    return 1;\n  }\n}\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — get semantics not defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBeUndefined();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'get set loose — get semantics not defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBeUndefined();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'get set loose — get semantics setter defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n  set test(v) {\n    throw new Error("called");\n  }\n}\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBeUndefined();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — get semantics setter defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n  set test(v) {\n    throw new Error("called");\n  }\n}\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBeUndefined();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — memoized assign (exec)',
    source:
      '"use strict";\nclass Base {}\nObject.defineProperty(Base.prototype, 0, {\n  value: 0,\n  writable: true,\n  configurable: true,\n});\nObject.defineProperty(Base.prototype, 1, {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\n\nlet i = 0;\nconst proper = {\n  get prop() {\n    return i++;\n  },\n};\n\nclass Obj extends Base {\n  assign() {\n    super[proper.prop] += 1;\n  }\n\n  assign2() {\n    super[i] += 1;\n  }\n}\n\nconst obj = new Obj();\n\nobj.assign();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(1);\n\nobj.assign2();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(2);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'get set loose — memoized assign (input)',
    source:
      '"use strict";\nclass Base {}\nObject.defineProperty(Base.prototype, 0, {\n  value: 0,\n  writable: true,\n  configurable: true,\n});\nObject.defineProperty(Base.prototype, 1, {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\n\nlet i = 0;\nconst proper = {\n  get prop() {\n    return i++;\n  },\n};\n\nclass Obj extends Base {\n  assign() {\n    super[proper.prop] += 1;\n  }\n\n  assign2() {\n    super[i] += 1;\n  }\n}\n\nconst obj = new Obj();\n\nobj.assign();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(1);\n\nobj.assign2();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(2);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'get set loose — memoized update (exec)',
    source:
      '"use strict";\nclass Base {}\nObject.defineProperty(Base.prototype, 0, {\n  value: 0,\n  writable: true,\n  configurable: true,\n});\nObject.defineProperty(Base.prototype, 1, {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\n\nlet i = 0;\nconst proper = {\n  get prop() {\n    return i++;\n  },\n};\n\nclass Obj extends Base {\n  update() {\n    super[proper.prop]++;\n  }\n\n  update2() {\n    super[i]++;\n  }\n}\n\nconst obj = new Obj();\n\nobj.update();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(1);\n\nobj.update2();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(2);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — memoized update (input)',
    source:
      '"use strict";\nclass Base {}\nObject.defineProperty(Base.prototype, 0, {\n  value: 0,\n  writable: true,\n  configurable: true,\n});\nObject.defineProperty(Base.prototype, 1, {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\n\nlet i = 0;\nconst proper = {\n  get prop() {\n    return i++;\n  },\n};\n\nclass Obj extends Base {\n  update() {\n    super[proper.prop]++;\n  }\n\n  update2() {\n    super[i]++;\n  }\n}\n\nconst obj = new Obj();\n\nobj.update();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(1);\n\nobj.update2();\nexpect(i).toBe(1);\nexpect(obj[0]).toBe(1);\nexpect(obj[1]).toBe(2);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — preserve comments (input)',
    source:
      'class C {\n  /* before get a */\n  get a() { return 42 }\n  /* after get a */\n\n  /* before set a */\n  set a(v) {}\n  /* after set a */\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[48],
      },
    ],
  },
  {
    title: 'get set loose — set semantics data defined on parent (exec)',
    source:
      "\"use strict\";\nclass Base  {\n}\nObject.defineProperty(Base.prototype, 'test', {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — set semantics data defined on parent (input)',
    source:
      "\"use strict\";\nclass Base  {\n}\nObject.defineProperty(Base.prototype, 'test', {\n  value: 1,\n  writable: true,\n  configurable: true,\n});\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, 'test', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — set semantics getter defined on parent (exec)',
    source:
      '"use strict";\nlet called = false;\nclass Base {\n  get test() {\n    called = true;\n    return 1;\n  }\n};\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\n\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(() => {\n  expect(obj.set()).toBe(3);\n// }).toThrow(TypeError);\n\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[50],
      },
    ],
  },
  {
    title: 'get set loose — set semantics getter defined on parent (input)',
    source:
      '"use strict";\nlet called = false;\nclass Base {\n  get test() {\n    called = true;\n    return 1;\n  }\n};\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\n\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(() => {\n  expect(obj.set()).toBe(3);\n// }).toThrow(TypeError);\n\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[50],
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent data on obj (exec)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — set semantics not defined on parent data on obj (input)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — set semantics not defined on parent getter on obj (exec)',
    source:
      '"use strict";\nclass Base {\n}\n\nlet called = false;\nclass Obj extends Base {\n  get test() {\n    called = true;\n  }\n\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(obj.set()).toBe(3);\nexpect(() => {\n  obj.set();\n}).toThrow(TypeError);\n\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(undefined);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[52],
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent getter on obj (input)',
    source:
      '"use strict";\nclass Base {\n}\n\nlet called = false;\nclass Obj extends Base {\n  get test() {\n    called = true;\n  }\n\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(obj.set()).toBe(3);\nexpect(() => {\n  obj.set();\n}).toThrow(TypeError);\n\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(undefined);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[52],
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent not on obj (exec)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — set semantics not defined on parent not on obj (input)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — set semantics not defined on parent setter on obj (exec)',
    source:
      '"use strict";\nclass Base {\n}\n\nlet value = 2;\nclass Obj extends Base {\n  set test(v) {\n    value = v;\n  }\n\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\n\n// This is incorrect according to the spec,\n// but close enough for loose.\nexpect(value).toBe(3);\n\nexpect(obj.test).toBe(undefined);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[54],
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent setter on obj (input)',
    source:
      '"use strict";\nclass Base {\n}\n\nlet value = 2;\nclass Obj extends Base {\n  set test(v) {\n    value = v;\n  }\n\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\n\n// This is incorrect according to the spec,\n// but close enough for loose.\nexpect(value).toBe(3);\n\nexpect(obj.test).toBe(undefined);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[54],
      },
    ],
  },
  {
    title: 'get set loose — set semantics setter defined on parent (exec)',
    source:
      '"use strict";\nlet value = 1;\nclass Base {\n  set test(v) {\n    value = v;\n  }\n}\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\n// todo\nexpect(value).toBe(1);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\n// todo\nexpect(obj.test).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set loose — set semantics setter defined on parent (input)',
    source:
      '"use strict";\nlet value = 1;\nclass Base {\n  set test(v) {\n    value = v;\n  }\n}\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\n\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(value).toBe(3);\nexpect(value).toBe(1);\n\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\n\n// This is incorrect according to the spec,\n// but close enough for loose.\n// expect(obj.test).toBe(2);\nexpect(obj.test).toBe(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[56],
      },
    ],
  },
  {
    title: 'get set — call semantics getter defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    expect(this).toBe(obj);\n    return function(...args) {\n      expect(this).toBe(obj);\n      expect(args).toEqual([1, 2, 3]);\n      return 1;\n    };\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    super.test(1, 2, 3);\n    super.test(1, ...[2, 3]);\n    super.test(...[1, 2, 3]);\n    return super.test(...arguments);\n  }\n\n  test() {\n    throw new Error("called");\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set — call semantics getter defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    expect(this).toBe(obj);\n    return function(...args) {\n      expect(this).toBe(obj);\n      expect(args).toEqual([1, 2, 3]);\n      return 1;\n    };\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    super.test(1, 2, 3);\n    super.test(1, ...[2, 3]);\n    super.test(...[1, 2, 3]);\n    return super.test(...arguments);\n  }\n\n  test() {\n    throw new Error("called");\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.call(1, 2, 3)).toBe(1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set — call semantics setter defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n  set test(v) {\n    throw new Error("gobbledygook");\n  }\n}\n\nclass Obj extends Base {\n  call() {\n    return super.test();\n  }\n\n  test() {\n    throw new Error("gobbledygook");\n  }\n}\n\nconst obj = new Obj();\nexpect(() => {\n  obj.call();\n\n  // Assert that this throws, but that it\'s not\n  // a gobbledygook error that is thrown\n}).toThrow(TypeError)\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'get set — change computed key (exec)',
    source:
      'let x = 1;\n\nclass A {\n  get [x]() {}\n  [(x = 3, 2)]() {}\n  set [x](_) {}\n}\n\nexpect(Object.getOwnPropertyDescriptors(A.prototype)).toMatchObject({\n  1: {\n    get: expect.any(Function),\n    set: undefined,\n  },\n  2: {\n    value: expect.any(Function),\n  },\n  3: {\n    get: undefined,\n    set: expect.any(Function),\n  }\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[58],
      },
    ],
  },
  {
    title: 'get set — change computed key (input)',
    source: 'class A {\n  get [x]() {}\n  [(x = 2, 3)]() {}\n  set [x](_) {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set — get semantics getter defined on parent (exec)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    expect(this).toBe(obj);\n    return 1;\n  }\n}\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[60],
      },
    ],
  },
  {
    title: 'get set — get semantics getter defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    expect(this).toBe(obj);\n    return 1;\n  }\n}\n\nclass Obj extends Base {\n  get() {\n    return super.test;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.test).toBe(2);\nexpect(obj.get()).toBe(1);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[60],
      },
    ],
  },
  {
    title: 'get set — method conflict (exec)',
    source:
      'class A {\n  get x() {}\n  x() {}\n  set x(_) {}\n}\n\nexpect(Object.getOwnPropertyDescriptors(A.prototype)).toMatchObject({\n  x: {\n    get: undefined,\n    set: expect.any(Function),\n  }\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set — method conflict (input)',
    source: 'class A {\n  get x() {}\n  x() {}\n  set x(_) {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[62],
      },
    ],
  },
  {
    title: 'get set — numeric keys (input)',
    source:
      'class A {\n  get 1() {}\n  set [1](_) {}\n\n  get 2() {}\n  set "2"(_) {}\n\n  get 3n() {}\n  set 3(_) {}\n\n  get [4n]() {}\n  set "4"(_) {}\n\n  // Different keys\n  get 5n() {}\n  set "5n"(_) {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set — set semantics getter defined on parent (exec)',
    source:
      '"use strict";\nlet called = false;\nclass Base {\n  get test() {\n    called = true;\n    return 1;\n  }\n};\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(() => {\n  obj.set();\n}).toThrow(TypeError);\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(2);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[64],
      },
    ],
  },
  {
    title: 'get set — set semantics getter defined on parent (input)',
    source:
      '"use strict";\nclass Base {\n  get test() {\n    return 1;\n  }\n};\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(() => {\n  // this requires helpers to be in file (not external), so they\n  // are in "strict" mode code.\n  obj.set();\n}).toThrow(TypeError);\nexpect(Base.prototype.test).toBe(1);\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(2);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set — set semantics not defined on parent getter on obj (exec)',
    source:
      '"use strict";\nclass Base {\n}\n\nlet called = false;\nclass Obj extends Base {\n  get test() {\n    called = true;\n  }\n\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(called).toBe(false);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[66],
      },
    ],
  },
  {
    title: 'get set — set semantics not defined on parent getter on obj (input)',
    source:
      '"use strict";\nclass Base {\n}\n\nclass Obj extends Base {\n  get test() { }\n\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(obj.test).toBe(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set — set semantics not defined on parent setter on obj (exec)',
    source:
      '"use strict";\nclass Base {\n}\n\nlet value = 2;\nclass Obj extends Base {\n  set test(v) {\n    value = v;\n  }\n\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(value).toBe(2);\nexpect(obj.test).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[68],
      },
    ],
  },
  {
    title: 'get set — set semantics not defined on parent setter on obj (input)',
    source:
      '"use strict";\nclass Base {\n}\n\nlet value = 2;\nclass Obj extends Base {\n  set test(v) {\n    expect(this).toBe(obj);\n    value = v;\n  }\n\n  set() {\n    return super.test = 3;\n  }\n}\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBeUndefined();\nexpect(value).toBe(2);\nexpect(obj.test).toBe(3);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'get set — set semantics setter defined on parent (exec)',
    source:
      '"use strict";\nlet value = 1;\nclass Base {\n  set test(v) {\n    value = v;\n  }\n}\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(value).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(2);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[70],
      },
    ],
  },
  {
    title: 'get set — set semantics setter defined on parent (input)',
    source:
      '"use strict";\nlet value = 1;\nclass Base {\n  set test(v) {\n    value = v;\n  }\n}\n\nclass Obj extends Base {\n  set() {\n    return super.test = 3;\n  }\n}\nObject.defineProperty(Obj.prototype, \'test\', {\n  value: 2,\n  writable: true,\n  configurable: true,\n});\n\nconst obj = new Obj();\nexpect(obj.set()).toBe(3);\nexpect(value).toBe(3);\nexpect(Base.prototype.test).toBeUndefined();\nexpect(Obj.prototype.test).toBe(2);\nexpect(obj.test).toBe(2);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[70],
      },
    ],
  },
  {
    title: 'loose — blockstatement with use strict directive (input)',
    source: 'function t() {\n    "use strict";\n    class Foo {\n      method() {}\n    }\n  }',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'loose — constructor order (input)',
    source:
      'class x {\n  f() {\n    1\n    2\n    3\n  }\n\n  constructor() {\n    4\n    5\n    6\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[72],
      },
    ],
  },
  {
    title: 'loose — default super (exec)',
    source:
      'class Test {\n  constructor() {\n    return super.constructor;\n  }\n\n  static test() {\n    return super.constructor;\n  }\n}\n\n// Instances\nexpect(Object.getPrototypeOf(Test.prototype)).toBe(Object.prototype);\nexpect(new Test()).toBe(Object);\n\n// Static\nexpect(Object.getPrototypeOf(Test)).toBe(Function.prototype);\nexpect(Test.test()).toBe(Function);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'loose — derived constructor must call super (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n\n  }\n}\n\nexpect(() => new Foo()).toThrow(ReferenceError, "this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'loose — derived constructor must call super (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[74],
      },
    ],
  },
  {
    title: 'loose — derived constructor no super return falsey (input)',
    source: 'class Child extends Base {\n    constructor(){\n      return false;\n    }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'loose — derived constructor no super return object (input)',
    source: 'class Child extends Base {\n    constructor(){\n      return {};\n    }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[76],
      },
    ],
  },
  {
    title: 'loose — preserve comments (input)',
    source: 'class C {\n  /* before a */\n  a() {}\n  /* after a */\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'loose — returning from derived constructor (exec)',
    source:
      '"use strict";\nclass Foo {\n  constructor() {\n    return { x: 1 };\n  }\n}\n\nexpect(new Foo().x).toBe(1);\n\nclass Bar extends Foo {\n  constructor() {\n    super();\n    return;\n  }\n}\n\nexpect(new Bar().x).toBe(1);\n\nclass Bar2 extends Foo {\n  constructor() {\n    super();\n    expect(this.x).toBe(1);\n    return { x: 2 };\n  }\n}\n\nexpect(new Bar2().x).toBe(2);\n\n\nlet singleton;\nclass Sub extends Foo {\n  constructor() {\n    if (singleton) {\n      return singleton;\n    }\n    singleton = super();\n  }\n}\n\nlet instance = new Sub;\nexpect(instance).toBe(singleton);\n\ninstance = new Sub;\nexpect(instance).toBe(singleton);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[78],
      },
    ],
  },
  {
    title: 'loose — super destructuring array pattern 1 (input)',
    source: 'class Foo {\n  foo(props) {\n    ;([x, ...super.client] = props);\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'loose — super destructuring array pattern (input)',
    source: 'class Foo {\n  foo(props) {\n    ;([super.client] = props);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[80],
      },
    ],
  },
  {
    title: 'loose — super destructuring object pattern 1 (input)',
    source: 'class Foo {\n  foo(props) {\n    ;({ x, ...super.client } = props)\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'loose — super destructuring object pattern (input)',
    source: 'class Foo {\n  foo(props) {\n    ;({ client: super.client } = props)\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[82],
      },
    ],
  },
  {
    title: 'misc — function name ts annotation (input)',
    source:
      'class Database {\n  transaction(\n    // If the type annotation here contains the *name of the method*\n    // then it changes how the method is compiled. Rename `transaction`\n    // below and see how the output changes.\n    callback: (transaction: Transaction) => unknown,\n  ) {\n    return this.table.transaction(\n      (x) => callback(new DaoTransaction(x)),\n    );\n  }\n}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
          typescript: 'strip',
        },
        output: expectedOutputs[83],
      },
    ],
  },
  {
    title: 'misc — missing class properties transform private (input)',
    source: "class Test {\n  #key = '';\n\n  method() {\n      return this.#key;\n  }\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
            classProperties: {
              loose: false,
            },
            privateMethods: true,
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[84],
      },
    ],
  },
  {
    title: 'misc — missing class properties transform public (input)',
    source: "class Test {\n  key = '';\n\n  method() {\n      return this.key;\n  }\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'misc — this before super 2 (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    if (dynamic()) super();\n    this;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[86],
      },
    ],
  },
  {
    title: 'misc — this before super 3 (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    super(this);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'misc — this before super (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    this;\n    super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[88],
      },
    ],
  },
  {
    title: 'regression — 14652 (input)',
    source: 'class C extends P {\n  constructor() {\n    super(super(super()))\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'regression — 2663 (input)',
    source:
      "import net from 'net';\nimport { EventEmitter } from 'events';\nimport BinarySerializer from './helpers/binary-serializer';\n// import ...\n\nexport default class Connection extends EventEmitter {\n    constructor(endpoint, joinKey, joinData, roomId) {\n        super();\n\n        this.isConnected = false;\n        this.roomId = roomId;\n\n        // ...\n    }\n\n    send(message) {\n        this.sock.write(BinarySerializer.serializeMessage(message));\n    }\n\n    disconnect() {\n        this.sock.close();\n    }\n}\n",
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[90],
      },
    ],
  },
  {
    title: 'regression — 2694 (input)',
    source:
      "import BaseFoo from './BaseFoo';\n\nexport default class SubFoo extends BaseFoo {\n  static talk() {\n    super.talk();\n    console.log('SubFoo.talk');\n  }\n}\n",
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[91],
      },
    ],
  },
  {
    title: 'regression — 2775 (input)',
    source:
      "import React, {Component} from 'react';\n\nexport default class RandomComponent extends Component {\n  constructor(){\n    super();\n  }\n\n  render() {\n    return (\n      <div className='sui-RandomComponent'>\n        <h2>Hi there!</h2>\n      </div>\n    );\n  }\n}\n",
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
          jsx: 'preserve',
        },
        output: expectedOutputs[92],
      },
    ],
  },
  {
    title: 'regression — 2941 (input)',
    source: 'export default class {}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[93],
      },
    ],
  },
  {
    title: 'regression — 3028 (input)',
    source:
      'class b {\n}\n\nclass a1 extends b {\n  constructor() {\n    super();\n    this.x = () => this;\n  }\n}\n\nexport default class a2 extends b {\n  constructor() {\n    super();\n    this.x = () => this;\n  }\n}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[94],
      },
    ],
  },
  {
    title: 'regression — 5769 (exec)',
    source:
      'class Point {\n  getX() {\n    expect(this.x).toBe(3); // C\n  }\n}\n\nclass ColorPoint extends Point {\n  constructor() {\n    super();\n    this.x = 2;\n    super.x = 3;\n    expect(this.x).toBe(3);   // A\n    expect(super.x).toBeUndefined();  // B\n  }\n\n  m() {\n    this.getX()\n  }\n}\n\nconst cp = new ColorPoint();\ncp.m();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'regression — 5769 (input)',
    source:
      'class Point {\n  getX() {\n    expect(this.x).toBe(3); // C\n  }\n}\n\nclass ColorPoint extends Point {\n  constructor() {\n    super();\n    this.x = 2;\n    super.x = 3;\n    expect(this.x).toBe(3);   // A\n    expect(super.x).toBeUndefined();  // B\n  }\n\n  m() {\n    this.getX();\n  }\n}\n\nconst cp = new ColorPoint();\ncp.m();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[96],
      },
    ],
  },
  {
    title: 'regression — 5817 (exec)',
    source:
      '// https://github.com/babel/babel/issues/5817\n\nclass Parent {}\n\nclass Table extends Parent {\n  constructor() {\n    super();\n    this.returnParam = (param) => {\n      return param;\n    }\n  }\n}\n\nconst table = new Table();\n\nexpect(table.returnParam(false)).toBe(false);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'regression — 5817 (input)',
    source:
      'class A extends B {\n  constructor() {\n    super();\n\n    this.arrow1 = (x) => { return x; };\n    this.arrow2 = (x) => x;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[98],
      },
    ],
  },
  {
    title: 'regression — 8499 (exec)',
    source:
      "// Pretend that `Reflect.construct` isn't supported.\nglobal.Reflect = undefined;\n\nglobal.HTMLElement = function() {\n  // Here, `this.HTMLElement` is this function, not the original HTMLElement\n  // constructor. `this.constructor` should be this function too, but isn't.\n  constructor = this.constructor;\n};\n\nvar constructor;\n\nclass CustomElement extends HTMLElement {}\nnew CustomElement();\n\nexpect(constructor).toBe(CustomElement);\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'regression — 8499 (input)',
    source:
      "const oldReflect = this.Reflect;\nconst oldHTMLElement = this.HTMLElement;\n\ntry {\n  // Pretend that `Reflect.construct` isn't supported.\n  this.Reflect = undefined;\n\n  this.HTMLElement = function() {\n    // Here, `this.HTMLElement` is this function, not the original HTMLElement\n    // constructor. `this.constructor` should be this function too, but isn't.\n    constructor = this.constructor;\n  };\n\n  var constructor;\n\n  class CustomElement extends HTMLElement {};\n  new CustomElement();\n\n  expect(constructor).toBe(CustomElement);\n} finally {\n  // Restore original env\n  this.Reflect = oldReflect;\n  this.HTMLElement = oldHTMLElement;\n}\n\n\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'regression — T2494 (input)',
    source: 'var x = {\n  Foo: class extends Foo {}\n};\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[101],
      },
    ],
  },
  {
    title: 'regression — T2997 (input)',
    source: 'class A {}\n\nclass B extends A {\n  constructor() {\n    return super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'regression — T6712 (input)',
    source: 'class A {\n  foo() {\n    const foo = 2;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[103],
      },
    ],
  },
  {
    title: 'regression — T6750 (input)',
    source:
      'export default function() {\n  return class Select {\n    query(query) {\n    }\n  }\n}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'regression — T6755 (input)',
    source:
      'class Example {\n  async test1(){\n    await Promise.resolve(2);\n  }\n\n  *test2(){\n    yield 3;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'regression — T7010 (input)',
    source:
      'class Foo {\n  constructor(val){\n    this._val = val;\n  }\n  foo2(){\n    return foo2(this._val);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[106],
      },
    ],
  },
  {
    title: 'regression — regression 1155 (input)',
    source:
      'class Foo extends Bar {\n  constructor (options) {\n    let parentOptions = {};\n    parentOptions.init = function () {\n      this;\n    };\n    super(parentOptions);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — accessing super class (input)',
    source:
      'class Test extends Foo {\n  constructor() {\n    woops.super.test();\n    super();\n    super.test();\n\n    super(...arguments);\n    super("test", ...arguments);\n\n    super.test(...arguments);\n    super.test("test", ...arguments);\n  }\n\n  test() {\n    super.test();\n    super.test(...arguments);\n    super.test("test", ...arguments);\n  }\n\n  static foo() {\n    super.foo();\n    super.foo(...arguments);\n    super.foo("test", ...arguments);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[108],
      },
    ],
  },
  {
    title: 'spec — computed key class tdz (exec)',
    source: 'expect(() => {\n  class A {\n    [A.name]() {}\n  }\n}).toThrow(ReferenceError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — computed keys call order (exec)',
    source:
      'var log = [];\n\nclass A {\n  [log.push(1)]() {}\n  static [log.push(2)]() {}\n  [log.push(3)]() {}\n  static [log.push(4)]() {}\n}\n\nexpect(log).toEqual([1, 2, 3, 4]);\n\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[110],
      },
    ],
  },
  {
    title: 'spec — computed keys yield await (input)',
    source:
      'async function* fn() {\n  class A {\n    [yield 1]() {}\n  }\n\n  class B extends A {\n    [await 1]() {}\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — computed methods (exec)',
    source:
      'const sym = Symbol();\n\nclass Foo {\n  [sym] () {\n    return 1;\n  }\n}\n\nclass Bar extends Foo {\n  [sym] () {\n    return super[sym]() + 2;\n  }\n}\n\nlet i = new Bar();\n\nexpect(i[sym]()).toBe(3);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[112],
      },
    ],
  },
  {
    title: 'spec — computed methods (input)',
    source:
      'class Foo {\n  foo() {}\n  "foo"() { "second" }\n  [bar]() {}\n  [bar + "foo"]() {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — computed toPrimitive (exec)',
    source:
      'const foo = { [Symbol.toPrimitive]: () => "foo" };\n\nexpect((new class { [foo](){ return 0; } }).foo()).toBe(0);\nexpect((new class { get [foo](){ return 0; } }).foo).toBe(0);\nexpect((new class { set [foo](v){ return v; } }).foo = 0).toBe(0);\n\nconst arrayLike = { [Symbol.toPrimitive] : () => [] };\n\nexpect(() => new class { [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => new class { get [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => new class { set [arrayLike](v){ return v; } }).toThrow("@@toPrimitive must return a primitive value.");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[114],
      },
    ],
  },
  {
    title: 'spec — computed toPrimitive (input)',
    source:
      'const foo = { [Symbol.toPrimitive]: () => "foo" };\n\nexpect((new class { [foo](){ return 0; } }).foo()).toBe(0);\nexpect((new class { get [foo](){ return 0; } }).foo).toBe(0);\nexpect((new class { set [foo](v){ return v; } }).foo = 0).toBe(0);\n\nconst arrayLike = { [Symbol.toPrimitive] : () => [] };\n\nexpect(() => new class { [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => new class { get [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");\nexpect(() => new class { set [arrayLike](v){ return v; } }).toThrow("@@toPrimitive must return a primitive value.");\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[114],
      },
    ],
  },
  {
    title: 'spec — constructor binding collision (input)',
    source:
      'class Example {\n  constructor() {\n    var Example;\n  }\n}\n\nvar t = new Example();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — constructor only (input)',
    source: 'class Foo {\n    constructor() {\n\n    }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[116],
      },
    ],
  },
  {
    title: 'spec — constructor (input)',
    source:
      'class Test {\n  constructor() {\n    this.state = "test";\n  }\n}\n\nclass Foo extends Bar {\n  constructor() {\n    super();\n    this.state = "test";\n  }\n}\n\nclass ConstructorScoping {\n  constructor(){\n    let bar;\n    {\n      let bar;\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — delay arrow function for bare super derived (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    super(() => {\n      this.test;\n    });\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[118],
      },
    ],
  },
  {
    title: 'spec — delete super property to property key (exec)',
    source:
      '// [Symbol.toPrimitive] must be called if exist\nvar counter = 0;\nexpect(() => {\n  (new class {\n    f() {\n      delete super[{\n        [Symbol.toPrimitive]: function() { ++counter; return 0; },\n      }];\n    }\n  }).f();\n}).toThrow(ReferenceError);\nexpect(counter).toBe(1);\n\n// [Symbol.toPrimitive] must return a primitive value\nexpect(() => {\n  (new class {\n    f() {\n      delete super[{\n        [Symbol.toPrimitive]: function() { return {}; },\n      }];\n    }\n  }).f();\n}).toThrow(TypeError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — delete super property to property key (input)',
    source:
      '// [Symbol.toPrimitive] must be called if exist\nvar counter = 0;\n(new class {\n  f() {\n    delete super[{\n      [Symbol.toPrimitive]: function() { ++counter; return 0; },\n    }];\n  }\n}).f();\n\n// [Symbol.toPrimitive] must return a primitive value\n(new class {\n  f() {\n    delete super[{\n      [Symbol.toPrimitive]: function() { return {}; },\n    }];\n  }\n}).f();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[120],
      },
    ],
  },
  {
    title: 'spec — delete super property (exec)',
    source:
      'expect(() => {\n  (new class {\n    f() { delete super.x; }\n  }).f();\n}).toThrow(ReferenceError);\n\nexpect(() => {\n  (new class {\n    f() { delete super[0]; }\n  }).f();\n}).toThrow(ReferenceError);\n\n// [expr] should be evaluated\nvar counter = 0;\nexpect(() => {\n  (new class {\n    f() { delete super[++counter]; }\n  }).f();\n}).toThrow(ReferenceError);\nexpect(counter).toBe(1);\n\n// TypeError before ReferenceError\nexpect(() => {\n  (new class {\n    f() { delete super[0()]; }\n  }).f();\n}).toThrow(TypeError);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — delete super property (input)',
    source:
      '(new class {\n  f() { delete super.x; }\n}).f();\n\n(new class {\n  f() { delete super[0]; }\n}).f();\n\n// [expr] should be evaluated\nvar counter = 0;\n(new class {\n  f() { delete super[++counter]; }\n}).f();\n\n// TypeError before ReferenceError\n(new class {\n  f() { delete super[0()]; }\n}).f();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[122],
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 2 (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    if (eval("false")) super();\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — derived constructor must call super 2 (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    if (eval("false")) super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[124],
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 3 (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    const fn = () => super();\n    fn();\n  }\n}\n\nnew Foo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — derived constructor must call super 3 (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    const fn = () => super();\n    fn();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[126],
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 4 (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    const fn = () => super();\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — derived constructor must call super 4 (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    const fn = () => super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[128],
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — derived constructor no primitive return (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    super();\n    return 3;\n  }\n}\n\nclass Foo2 extends Bar {\n  constructor() {\n    super();\n    return null;\n  }\n}\n\nexpect(() => new Foo()).toThrow("Derived constructors may only return object or undefined");\nexpect(() => new Foo2()).toThrow("Derived constructors may only return object or undefined");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[130],
      },
    ],
  },
  {
    title: 'spec — derived constructor no primitive return (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    super();\n    return 3;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — export default (input)',
    source: 'export default class Foo {}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[132],
      },
    ],
  },
  {
    title: 'spec — export super class (input)',
    source: 'export default class extends A {}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — extend untranspiled class (exec)',
    source:
      '"use strict";\n\nvar log = [];\nvar SuperClass = require("module-which-exports-native-class");\n\nclass SubClass extends SuperClass {\n  constructor() {\n    log.push(4);\n    super();\n  }\n  method() {\n    log.push(5);\n    super.method();\n  }\n  static method() {\n    log.push(6);\n    super.method();\n  }\n}\n\nnew SubClass().method();\nSubClass.method();\n\nexpect(log).toEqual([4, 1, 5, 2, 6, 3]);\n\n// Magic function to avoid transpiling class\nfunction require() {\n  return eval(`(\n    class SuperClass {\n      constructor() { log.push(1); }\n      method() { log.push(2); }\n      static method() { log.push(3); }\n    }\n  )`);\n}\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[134],
      },
    ],
  },
  {
    title: 'spec — inferred expression name (input)',
    source: 'var o = { foo: class foo {} };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — instance getter and setter (input)',
    source:
      'class Test {\n  get test() {\n    return 5 + 5;\n  }\n  set test(val) {\n    this._test = val;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[136],
      },
    ],
  },
  {
    title: 'spec — instance getter (input)',
    source: 'class Test {\n  get test() {\n  return 5 + 5;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — instance method (input)',
    source: 'class Test {\n  test() {\n  return 5 + 5;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[138],
      },
    ],
  },
  {
    title: 'spec — instance setter (input)',
    source: 'class Test {\n  set test(val) {\n  this._test = val;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — name collisions with class ref in computed key (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    super();\n    class X {\n      [(() => {\n        let Foo;\n        super.method();\n      })()]() {}\n    }\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[140],
      },
    ],
  },
  {
    title: 'spec — name collisions with class ref in constructor (input)',
    source:
      'class Base {\n  method() {}\n}\n\nclass Foo extends Base {\n  constructor() {\n    super();\n\n    if (true) {\n      let Foo;\n      super.method();\n    }\n  }\n\n  method() { }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — name collisions with class ref in method (input)',
    source:
      'class Foo {\n  method(Foo) {\n    return super.method(Foo);\n  }\n}\n\nclass Bar {\n  method() {\n    return () => {\n      let Bar;\n      return super.method(Bar);\n    };\n  }\n}\n\nclass Baz {\n  method() {\n    class Baz {\n      f() {\n        let Baz = 1;\n        return Baz;\n      }\n    }\n\n    return super.method(Baz)\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[142],
      },
    ],
  },
  {
    title: 'spec — name method collision (input)',
    source: 'import { a } from "./a";\n\nclass Foo {\n  _a() {\n    a();\n  }\n}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — nested class super call in key (exec)',
    source:
      "\"use strict\";\nclass Hello {\n  constructor() {\n    return {\n      toString() {\n        return 'hello';\n      },\n    };\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    class Inner {\n      [super()]() {\n        return 'hello';\n      }\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello()).toBe('hello');\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[144],
      },
    ],
  },
  {
    title: 'spec — nested class super call in key (input)',
    source:
      "\"use strict\";\nclass Hello {\n  constructor() {\n    return {\n      toString() {\n        return 'hello';\n      },\n    };\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    class Inner {\n      [super()]() {\n        return 'hello';\n      }\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello()).toBe('hello');\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[144],
      },
    ],
  },
  {
    title: 'spec — nested class super property in key (exec)',
    source:
      "\"use strict\";\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      [super.toString()]() {\n        return 'hello';\n      }\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello()).toBe('hello');\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — nested class super property in key (input)',
    source:
      "\"use strict\";\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    class Inner {\n      [super.toString()]() {\n        return 'hello';\n      }\n    }\n\n    return new Inner();\n  }\n}\n\nexpect(new Outer().hello()).toBe('hello');\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — nested object super call in key (exec)',
    source:
      "\"use strict\";\nclass Hello {\n  constructor() {\n    return {\n      toString() {\n        return 'hello';\n      },\n    };\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    const Inner = {\n      [super()]() {\n        return 'hello';\n      },\n    };\n\n    return Inner;\n  }\n}\n\nexpect(new Outer().hello()).toBe('hello');\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[146],
      },
    ],
  },
  {
    title: 'spec — nested object super call in key (input)',
    source:
      "\"use strict\";\nclass Hello {\n  constructor() {\n    return {\n      toString() {\n        return 'hello';\n      },\n    };\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    const Inner = {\n      [super()]() {\n        return 'hello';\n      },\n    };\n\n    return Inner;\n  }\n}\n\nexpect(new Outer().hello()).toBe('hello');\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[146],
      },
    ],
  },
  {
    title: 'spec — nested object super property in key (exec)',
    source:
      "\"use strict\";\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    const Inner = {\n      [super.toString()]() {\n        return 'hello';\n      },\n    };\n\n    return Inner;\n  }\n}\n\nexpect(new Outer().hello()).toBe('hello');\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — nested object super property in key (input)',
    source:
      "\"use strict\";\nclass Hello {\n  toString() {\n    return 'hello';\n  }\n}\n\nclass Outer extends Hello {\n  constructor() {\n    super();\n    const Inner = {\n      [super.toString()]() {\n        return 'hello';\n      },\n    };\n\n    return Inner;\n  }\n}\n\nexpect(new Outer().hello()).toBe('hello');\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — plain class (input)',
    source: 'class Test { }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[148],
      },
    ],
  },
  {
    title: 'spec — preserves directives (input)',
    source:
      'class MyCtrl {\n  constructor(a) {\n    "any directive prologue";\n    foo;\n  }\n}\n\nclass MyCtrl2 {\n  constructor(a) {\n    "a";\n    "b";\n    foo;\n  }\n}\n\nclass MyCtrl3 {\n  constructor(a) {\n    "a";\n    foo;\n    "b";\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — relaxed method coercion (input)',
    source: '// #1649\n\nclass Foo {\n  [Symbol()]() {}\n  [Symbol()]() {}\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
            classProperties: {
              loose: false,
            },
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
    ],
  },
  {
    title: 'spec — returning from derived constructor (exec)',
    source:
      '"use strict";\nclass Foo {\n  constructor() {\n    return { x: 1 };\n  }\n}\n\nexpect(new Foo().x).toBe(1);\n\nclass Bar extends Foo {\n  constructor() {\n    super();\n    return;\n  }\n}\n\nexpect(new Bar().x).toBe(1);\n\nclass Bar2 extends Foo {\n  constructor() {\n    super();\n    expect(this.x).toBe(1);\n    return { x: 2 };\n  }\n}\n\nexpect(new Bar2().x).toBe(2);\n\n\nlet singleton;\nclass Sub extends Foo {\n  constructor() {\n    if (singleton) {\n      return singleton;\n    }\n    singleton = super();\n  }\n}\n\nlet instance = new Sub;\nexpect(instance).toBe(singleton);\n\ninstance = new Sub;\nexpect(instance).toBe(singleton);\n\nclass Undefined extends Foo {\n  constructor() {\n    if (false) {\n      super();\n    }\n    return;\n    super();\n  }\n}\n\nexpect(() => {\n  new Undefined();\n}).toThrow("this");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — statement (input)',
    source:
      'var BaseView = class BaseView {\n  constructor() {\n    this.autoRender = true;\n  }\n}\n\nvar BaseView = class {\n  constructor() {\n    this.autoRender = true;\n  }\n}\n\nvar BaseView = class {\n  foo() {\n    this.autoRender = true;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[152],
      },
    ],
  },
  {
    title: 'spec — static (input)',
    source:
      'class A {\n  static a() {\n\n  }\n\n  static get b(){\n\n  }\n\n  static set b(b){\n\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super class anonymous (input)',
    source:
      'class TestEmpty extends (class {}) {\n}\n\nclass TestConstructorOnly extends (class { constructor() {} }) {\n}\n\nclass TestMethodOnly extends (class { method() {} }) {\n}\n\nclass TestConstructorAndMethod extends (class {\n  constructor() {}\n  method() {}\n}) {\n}\n\nclass TestMultipleMethods extends (class {\n  m1() {}\n  m2() {}\n}) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[154],
      },
    ],
  },
  {
    title: 'spec — super correct new target without reflect (exec)',
    source:
      '"use strict";\n\nconst oldReflect = global.Reflect;\ntry {\n  global.Reflect = undefined;\n\n  let NewTarget;\n\n  class A {\n    constructor() { NewTarget = new.target; }\n  }\n  class B extends A {}\n\n  new A();\n  expect(NewTarget).toBe(A);\n\n  new B();\n  expect(NewTarget).toBe(B);\n} finally {\n  global.Reflect = oldReflect;\n}\n\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super correct new target (exec)',
    source:
      '"use strict";\n\nlet NewTarget;\n\nclass A {\n  constructor() { NewTarget = new.target; }\n}\nclass B extends A {}\n\nnew A();\nexpect(NewTarget).toBe(A);\n\nnew B();\nexpect(NewTarget).toBe(B);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[156],
      },
    ],
  },
  {
    title: 'spec — super destructuring array pattern 1 (input)',
    source: 'class Foo {\n  constructor(props) {\n    ;([x, ...super.client] = props);\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super destructuring array pattern (input)',
    source: 'class Foo {\n  constructor(props) {\n    ;([super.client] = props);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[158],
      },
    ],
  },
  {
    title: 'spec — super destructuring object pattern 1 (input)',
    source: 'class Foo {\n  constructor(props) {\n    ;({ x, ...super.client } = props)\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super destructuring object pattern (input)',
    source: 'class Foo {\n  constructor(props) {\n    ;({ client: super.client } = props)\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[160],
      },
    ],
  },
  {
    title: 'spec — super guaranteed (input)',
    source:
      'class Base {};\n\nnew class extends Base {\n  constructor() {\n    super() || null;\n  }\n}\n\nnew class extends Base {\n  constructor() {\n    super()?.();\n  }\n}\n\nnew class extends Base {\n  constructor() {\n    super()?.[null];\n  }\n}\n\nnew class extends Base {\n  constructor() {\n    1 + super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super illegal non constructor call (input)',
    source: 'class Test {\n  foo() {\n    super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[162],
      },
    ],
  },
  {
    title: 'spec — super missing (exec)',
    source:
      'class Base {};\n\nexpect(() => new class extends Base {\n  constructor() {\n    x: { break x; super(); }\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    try {} catch { super(); }\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    try { throw 0; super(); } catch {}\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    true || super();\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    ({}) ?? super();\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    false && super();\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    null?.(super());\n  }\n}).toThrow();\n\n\nexpect(() => new class extends Base {\n  constructor() {\n    null?.[super()];\n  }\n}).toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super missing (input)',
    source:
      'class Base {};\n\nexpect(() => new class extends Base {\n  constructor() {\n    x: { break x; super(); }\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    try {} catch { super(); }\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    try { throw 0; super(); } catch {}\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    true || super();\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    ({}) ?? super();\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    false && super();\n  }\n}).toThrow();\n\nexpect(() => new class extends Base {\n  constructor() {\n    null?.(super());\n  }\n}).toThrow();\n\n\nexpect(() => new class extends Base {\n  constructor() {\n    null?.[super()];\n  }\n}).toThrow();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super proto modifications (exec)',
    source:
      'var A_called = false;\nvar X_called = false;\n\nclass A { constructor() { A_called = true } }\nclass X { constructor() { X_called = true } }\nclass B extends A {}\n\nB.prototype.__proto__ = X.prototype;\nB.__proto__ = X;\n\nexpect(new B() instanceof B).toBe(true);\nexpect(new B() instanceof A).toBe(false);\nexpect(new B() instanceof X).toBe(true);\nexpect(A_called).toBe(false);\nexpect(X_called).toBe(true);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[164],
      },
    ],
  },
  {
    title: 'spec — super reference before bare super inline (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    super.foo(super());\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super reference before bare super inline (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    super.foo(super());\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[166],
      },
    ],
  },
  {
    title: 'spec — super reference before bare super (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    super.foo();\n    super();\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super reference before bare super (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    super.foo();\n    super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[168],
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda 2 (exec)',
    source:
      'class Bar {\n  test() {}\n}\n\nclass Foo extends Bar {\n  constructor() {\n    const t = () => super.test()\n    t();\n    super();\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super reference before in lambda 2 (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    var t = () => super.test()\n    super.foo();\n    super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[170],
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda 3 (exec)',
    source:
      'class Bar {\n  test() {}\n}\n\nclass Foo extends Bar {\n  constructor() {\n    const t = () => super.test()\n    super();\n    t();\n  }\n}\n\nnew Foo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super reference before in lambda 3 (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    const t = () => super.test()\n    super();\n    t();\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[172],
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda (exec)',
    source:
      'class Bar {\n  test() {}\n}\n\nclass Foo extends Bar {\n  constructor() {\n    const t = () => super.test()\n    super();\n  }\n}\n\nnew Foo();',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super reference before in lambda (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    const t = () => super.test()\n    super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[174],
      },
    ],
  },
  {
    title: 'spec — super reference in prop exression (exec)',
    source:
      'let called = false;\n\nclass A {\n  get prop() {\n    called = true;\n  }\n}\n\nclass B extends A {\n  constructor() {\n    super[super().prop]\n  }\n}\n\nexpect(() => {\n  new B();\n}).toThrow(ReferenceError);\nexpect(called).toBe(false);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — super reference in prop exression (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    super[super().method]();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[176],
      },
    ],
  },
  {
    title: 'spec — super spread args (exec)',
    source:
      '// test262/test/language/expressions/super/call-spread-err-sngl-err-itr-get-get.js\n\nvar iter = {};\nObject.defineProperty(iter, Symbol.iterator, {\n  get: function() {\n    throw new Error("err");\n  }\n});\n\nclass Test262ParentClass {\n  constructor() {}\n}\n\nclass Test262ChildClass extends Test262ParentClass {\n  constructor() {\n    super(...iter);\n  }\n}\n\nexpect(()=>{\n  new Test262ChildClass();\n}).toThrow("err");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — this not allowed before super in derived classes 2 (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    super(this);\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[178],
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 3 (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    const fn = () => this;\n    fn();\n    super();\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — this not allowed before super in derived classes 3 (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    const fn = () => this;\n    fn();\n    super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[180],
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 4 (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    const fn = () => this;\n    super();\n    fn();\n  }\n}\n\nnew Foo();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — this not allowed before super in derived classes 4 (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    const fn = () => this;\n    super();\n    fn();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[182],
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 5 (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    Foo[this];\n  }\n}\n\nexpect(() => new Foo()).toThrow("this hasn\'t been initialised");\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — this not allowed before super in derived classes 5 (input)',
    source: 'class Foo extends Bar {\n  constructor() {\n    Foo[this];\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[184],
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes (exec)',
    source:
      'class Bar {}\n\nclass Foo extends Bar {\n  constructor() {\n    this.foo = "bar";\n    super();\n  }\n}\n\nexpect(() => new Foo()).toThrow();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
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
    title: 'spec — this not allowed before super in derived classes (input)',
    source:
      'class Foo extends Bar {\n  constructor() {\n    this.foo = "bar";\n    super();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            classes: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[186],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
