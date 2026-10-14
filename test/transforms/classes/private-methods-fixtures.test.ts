import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 'top secret string',\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = 'not secret string';\n  };\n  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();\nexpect(cl.publicGetPrivateField()).toEqual('top secret string');\ncl.publicSetPrivateField('new secret string');\nexpect(cl.publicGetPrivateField()).toEqual('new secret string');",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 'top secret string',\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = 'not secret string';\n  };\n  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _getA = '__private_A_getA';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _getA, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return A;\n      },\n    });\n  };\n  Object.defineProperty(A.prototype, 'getA', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _getA)[_getA];\n      },\n      'name',\n      {\n        value: 'get getA',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nconst oldA = A;\nA = null;\nexpect(new oldA().getA).toBe(oldA);",
  "let A = (() => {\n  'use strict';\n  var _getA = '__private_A_getA';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _getA, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return A;\n      },\n    });\n  };\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    expect(\n      _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue],\n    ).toBeUndefined();\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet foo;\nlet Cl = (() => {\n  'use strict';\n  var _foo = '__private_Cl_foo';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      set: function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 1;\n      },\n    });\n  };\n  Object.defineProperty(Cl.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        foo = _classPrivateFieldLooseBase(this, _foo)[_foo] = 2;\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nnew Cl().test();\nexpect(foo).toBe(2);",
  "let C = (() => {\n  'use strict';\n  var _a = '__private_C_a';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    /* before get a */\n    Object.defineProperty(this, _a, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n      set: function (v) {\n        /* after get a */\n        /* before set a */\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(C, 'prototype', { writable: false });\n  return C;\n  /* after set a */\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet counter = 0;\nlet Foo = (() => {\n  'use strict';\n  var _privateFieldValue = '__private_Foo_privateFieldValue';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexpect(() => new Foo()).toThrow();\nexpect(counter).toBe(1);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet counter = 0;\nlet Foo = (() => {\n  'use strict';\n  var _privateFieldValue = '__private_Foo_privateFieldValue';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n    });\n    expect(() =>\n      (() => {\n        throw new TypeError('Attempted to set read only private field');\n      })(),\n    ).toThrow(TypeError);\n    expect(\n      () => ([_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]] = [1]),\n    ).toThrow(TypeError);\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n    [_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]] = [1];\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 'top secret string',\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = 'not secret string';\n  };\n  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicFieldValue', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this.publicField;\n      },\n      'name',\n      {\n        value: 'get publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicFieldValue', {\n    set: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.publicField = newValue;\n      },\n      'name',\n      {\n        value: 'set publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'testUpdates', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = 0;\n        this.publicField = 0;\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] =\n          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]++;\n        this.publicFieldValue = this.publicFieldValue++;\n        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(\n          this.publicField,\n        );\n        ++_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n        ++this.publicFieldValue;\n        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(\n          this.publicField,\n        );\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] += 1;\n        this.publicFieldValue += 1;\n        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(\n          this.publicField,\n        );\n      },\n      'name',\n      {\n        value: 'testUpdates',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();\ncl.testUpdates();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 'top secret string',\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = 'not secret string';\n  };\n  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicFieldValue', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this.publicField;\n      },\n      'name',\n      {\n        value: 'get publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicFieldValue', {\n    set: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.publicField = newValue;\n      },\n      'name',\n      {\n        value: 'set publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'testUpdates', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = 0;\n        this.publicField = 0;\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] =\n          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]++;\n        this.publicFieldValue = this.publicFieldValue++;\n        ++_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n        ++this.publicFieldValue;\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] += 1;\n        this.publicFieldValue += 1;\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = -(\n          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] **\n          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]\n        );\n        this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);\n      },\n      'name',\n      {\n        value: 'testUpdates',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 'top secret string',\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(arguments.length).toBe(0);\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(arguments.length).toBe(1);\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = 'not secret string';\n  };\n  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();\nexpect(cl.publicGetPrivateField()).toEqual('top secret string');\ncl.publicSetPrivateField('new secret string');\nexpect(cl.publicGetPrivateField()).toEqual('new secret string');",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 'top secret string',\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(arguments.length).toBe(0);\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(arguments.length).toBe(1);\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = 'not secret string';\n  };\n  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _setter = '__private_A_setter';\n  var _getter = '__private_A_getter';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _setter, {\n      set: function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _getter, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(A.prototype, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        [_classPrivateFieldLooseBase(this, _setter)[_setter]] = [1];\n        [_classPrivateFieldLooseBase(this, _getter)[_getter]] = [1];\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    expect(() => _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]).toThrow(\n      TypeError,\n    );\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet results = [];\nlet Foo = (() => {\n  'use strict';\n  var _privateFieldValue = '__private_Foo_privateFieldValue';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Foo.prototype, 'self', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        results.push(1);\n        return this;\n      },\n      'name',\n      {\n        value: 'get self',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexpect(() => new Foo()).toThrow(TypeError);\nexpect(results).toStrictEqual([1, 2]);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet results = [];\nlet Foo = (() => {\n  'use strict';\n  var _privateFieldValue = '__private_Foo_privateFieldValue';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Foo.prototype, 'self', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        results.push(1);\n        return this;\n      },\n      'name',\n      {\n        value: 'get self',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, 'counter', {\n      value: 0,\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n    });\n    expect(() =>\n      (() => {\n        throw new TypeError('Attempted to set read only private field');\n      })(),\n    ).toThrow(TypeError);\n    expect(this.counter).toBe(1);\n    expect(\n      () =>\n        ([_classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue]] = [1]),\n    ).toThrow(TypeError);\n    expect(this.counter).toBe(2);\n  };\n  Object.defineProperty(Cl.prototype, 'self', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.counter++;\n        return this;\n      },\n      'name',\n      {\n        value: 'get self',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, 'counter', {\n      value: 0,\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Cl.prototype, 'self', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.counter++;\n        return this;\n      },\n      'name',\n      {\n        value: 'get self',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _tag = '__private_Foo_tag';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _tag, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return function () {\n          return this;\n        };\n      },\n    });\n    const receiver = _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n    expect(receiver).toBe(this);\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _tag = '__private_Foo_tag';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _tag, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return () => this;\n      },\n    });\n    _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nnew Foo();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 'top secret string',\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = 'not secret string';\n  };\n  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicFieldValue', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this.publicField;\n      },\n      'name',\n      {\n        value: 'get publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicFieldValue', {\n    set: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.publicField = newValue;\n      },\n      'name',\n      {\n        value: 'set publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'testUpdates', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = 0n;\n        this.publicField = 0n;\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] =\n          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]++;\n        this.publicFieldValue = this.publicFieldValue++;\n        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(\n          this.publicField,\n        );\n        ++_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n        ++this.publicFieldValue;\n        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(\n          this.publicField,\n        );\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] += 1n;\n        this.publicFieldValue += 1n;\n        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(\n          this.publicField,\n        );\n      },\n      'name',\n      {\n        value: 'testUpdates',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst cl = new Cl();\ncl.testUpdates();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 'top secret string',\n    });\n    Object.defineProperty(this, _privateFieldValue, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n    this.publicField = 'not secret string';\n  };\n  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicFieldValue', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this.publicField;\n      },\n      'name',\n      {\n        value: 'get publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicFieldValue', {\n    set: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.publicField = newValue;\n      },\n      'name',\n      {\n        value: 'set publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'testUpdates', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = 0n;\n        this.publicField = 0n;\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] =\n          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]++;\n        this.publicFieldValue = this.publicFieldValue++;\n        ++_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];\n        ++this.publicFieldValue;\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] += 1n;\n        this.publicFieldValue += 1n;\n        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = -(\n          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] **\n          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]\n        );\n        this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);\n      },\n      'name',\n      {\n        value: 'testUpdates',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nvar _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nclass Base {\n  superMethod() {\n    return 'good';\n  }\n}\nlet Sub = (__nox_super_57_239 => {\n  'use strict';\n  var _privateMethod = '__private_Sub_privateMethod';\n  const Sub = function Sub() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_57_239, arguments, new.target || Sub);\n    (function () {\n      Object.defineProperty(this, _privateMethod, {\n        value: function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return _get(Object.getPrototypeOf(Sub.prototype), 'superMethod', this).call(this);\n        },\n      });\n    }).call(_this);\n    return _this;\n  };\n  if (__nox_super_57_239 !== null && typeof __nox_super_57_239 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Sub.prototype = Object.create(__nox_super_57_239 && __nox_super_57_239.prototype, {\n    constructor: {\n      value: Sub,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_57_239);\n  else Sub.__proto__ = __nox_super_57_239;\n  Object.defineProperty(Sub.prototype, 'superMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'bad';\n      },\n      'name',\n      {\n        value: 'superMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Sub.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(this, _privateMethod, []);\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Sub, 'prototype', { writable: false });\n  return Sub;\n})(Base);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _getSet = '__private_Cl_getSet';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _getSet, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n    });\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _foo = '__private_Cl_foo';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _foo, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'foo';\n      },\n    });\n    Object.defineProperty(this, _foo, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n    });\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _getSet = '__private_Cl_getSet';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _getSet, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "let Cl = (() => {\n  'use strict';\n  var _dank = '__private_Cl_dank';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _dank, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'foo';\n      },\n    });\n    Object.defineProperty(this, _dank, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'foo';\n      },\n    });\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _foo = '__private_Cl_foo';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _foo, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'foo';\n      },\n    });\n    Object.defineProperty(this, _foo, {\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;\n      },\n    });\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _getSet = '__private_Cl_getSet';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateField, {\n      writable: true,\n      value: 0,\n    });\n    Object.defineProperty(this, _getSet, {\n      set: function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n      },\n    });\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _getset = '__private_A_getset';\n  var _method = '__private_A_method';\n  var _getter = '__private_A_getter';\n  var _setter = '__private_A_setter';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _method, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _getter, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _setter, {\n      set: function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    Object.defineProperty(this, _getset, {\n      get: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n      set: function (v) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    _classPrivateMethodCall(this, _method, []);\n    _classPrivateFieldLooseBase(this, _getter)[_getter];\n    _classPrivateFieldLooseBase(this, _setter)[_setter] = 1;\n    _classPrivateFieldLooseBase(this, _getset)[_getset];\n    _classPrivateFieldLooseBase(this, _getset)[_getset] = 2;\n  };\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _privateMethod = '__private_Foo_privateMethod';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateMethod, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    this.publicField = _classPrivateMethodCall(this, _privateMethod, []);\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexpect(new Foo().publicField).toEqual(42);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _privateMethod = '__private_Foo_privateMethod';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateMethod, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    this.publicField = _classPrivateMethodCall(this, _privateMethod, []);\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\n(function () {\n  let Cl = (() => {\n    'use strict';\n    var _foo = '__private_Cl_foo';\n    const Cl = function Cl() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      Object.defineProperty(this, _foo, {\n        value: async function () {\n          return 2;\n        },\n      });\n    };\n    Object.defineProperty(Cl.prototype, 'test', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return _classPrivateMethodCall(this, _foo, []);\n        },\n        'name',\n        {\n          value: 'test',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(Cl, 'prototype', { writable: false });\n    return Cl;\n  })();\n  return new Cl().test().then(val => {\n    expect(val).toBe(2);\n  });\n});",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _foo = '__private_Cl_foo';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      value: async function () {\n        return 2;\n      },\n    });\n  };\n  Object.defineProperty(Cl.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(this, _foo, []);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _priv = '__private_Cl_priv';\n  var _method = '__private_Cl_method';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, 'prop', {\n      value: _classPrivateMethodCall(this, _method, [1]),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(this, _priv, {\n      writable: true,\n      value: _classPrivateMethodCall(this, _method, [2]),\n    });\n    Object.defineProperty(this, _method, {\n      value: function (x) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return x;\n      },\n    });\n  };\n  Object.defineProperty(Cl.prototype, 'getPriv', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _priv)[_priv];\n      },\n      'name',\n      {\n        value: 'getPriv',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nexpect(new Cl().prop).toBe(1);\nexpect(new Cl().getPriv()).toBe(2);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _priv = '__private_Cl_priv';\n  var _method = '__private_Cl_method';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, 'prop', {\n      value: _classPrivateMethodCall(this, _method, [1]),\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(this, _priv, {\n      writable: true,\n      value: _classPrivateMethodCall(this, _method, [2]),\n    });\n    Object.defineProperty(this, _method, {\n      value: function (x) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return x;\n      },\n    });\n  };\n  Object.defineProperty(Cl.prototype, 'getPriv', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _priv)[_priv];\n      },\n      'name',\n      {\n        value: 'getPriv',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _getA = '__private_A_getA';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _getA, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return A;\n      },\n    });\n  };\n  Object.defineProperty(A.prototype, 'getA', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(this, _getA, []);\n      },\n      'name',\n      {\n        value: 'getA',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nconst oldA = A;\nA = null;\nexpect(new oldA().getA()).toBe(oldA);",
  "let A = (() => {\n  'use strict';\n  var _getA = '__private_A_getA';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _getA, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return A;\n      },\n    });\n  };\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nconsole.log(\n  (() => {\n    'use strict';\n    var _foo = '__private_A_foo';\n    const A = function A() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n      Object.defineProperty(this, _foo, {\n        value: function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        },\n      });\n    };\n    Object.defineProperty(A.prototype, 'method', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          _classPrivateMethodCall(this, _foo, []);\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(A, 'prototype', { writable: false });\n    return A;\n  })(),\n);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _getStatus = '__private_Foo_getStatus';\n  const Foo = function Foo(status) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _getStatus, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this.status;\n      },\n    });\n    this.status = status;\n    expect(() =>\n      (() => {\n        throw new TypeError('Attempted to set read only private field');\n      })(),\n    ).toThrow(TypeError);\n  };\n  Object.defineProperty(Foo.prototype, 'getCurrentStatus', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(this, _getStatus, []);\n      },\n      'name',\n      {\n        value: 'getCurrentStatus',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'setCurrentStatus', {\n    value: Object.defineProperty(\n      function (newStatus) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.status = newStatus;\n      },\n      'name',\n      {\n        value: 'setCurrentStatus',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'getFakeStatus', {\n    value: Object.defineProperty(\n      function (fakeStatus) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const getStatus = _classPrivateFieldLooseBase(this, _getStatus)[_getStatus];\n        return function () {\n          return getStatus.call({ status: fakeStatus });\n        };\n      },\n      'name',\n      {\n        value: 'getFakeStatus',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'getFakeStatusFunc', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return {\n          status: 'fake-status',\n          getFakeStatus: _classPrivateFieldLooseBase(this, _getStatus)[_getStatus],\n        };\n      },\n      'name',\n      {\n        value: 'getFakeStatusFunc',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nconst f = new Foo('inactive');\nexpect(f.getCurrentStatus()).toBe('inactive');\nf.setCurrentStatus('new-status');\nexpect(f.getCurrentStatus()).toBe('new-status');\nexpect(f.getFakeStatus('fake')()).toBe('fake');\nexpect(f.getFakeStatusFunc().getFakeStatus()).toBe('fake-status');",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _getStatus = '__private_Foo_getStatus';\n  const Foo = function Foo(status) {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _getStatus, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this.status;\n      },\n    });\n    this.status = status;\n  };\n  Object.defineProperty(Foo.prototype, 'getCurrentStatus', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(this, _getStatus, []);\n      },\n      'name',\n      {\n        value: 'getCurrentStatus',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'setCurrentStatus', {\n    value: Object.defineProperty(\n      function (newStatus) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.status = newStatus;\n      },\n      'name',\n      {\n        value: 'setCurrentStatus',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'getFakeStatus', {\n    value: Object.defineProperty(\n      function (fakeStatus) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const fakeGetStatus = _classPrivateFieldLooseBase(this, _getStatus)[_getStatus];\n        return function () {\n          return fakeGetStatus.call({ status: fakeStatus });\n        };\n      },\n      'name',\n      {\n        value: 'getFakeStatus',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo.prototype, 'getFakeStatusFunc', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return {\n          status: 'fake-status',\n          getFakeStatus: _classPrivateFieldLooseBase(this, _getStatus)[_getStatus],\n        };\n      },\n      'name',\n      {\n        value: 'getFakeStatusFunc',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet exfiltrated;\nlet Foo = (() => {\n  'use strict';\n  var _privateMethod = '__private_Foo_privateMethod';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateMethod, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    if (exfiltrated === undefined) {\n      exfiltrated = _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod];\n    }\n    expect(exfiltrated).toStrictEqual(\n      _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod],\n    );\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nnew Foo();\n// check for private method function object equality\nnew Foo();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet exfiltrated;\nlet Foo = (() => {\n  'use strict';\n  var _privateMethod = '__private_Foo_privateMethod';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateMethod, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    if (exfiltrated === undefined) {\n      exfiltrated = _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod];\n    }\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _foo = '__private_Cl_foo';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      value: function* () {\n        yield 2;\n        return 3;\n      },\n    });\n  };\n  Object.defineProperty(Cl.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(this, _foo, []);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();\nconst val = new Cl().test();\nexpect(val.next()).toEqual({\n  value: 2,\n  done: false,\n});\nexpect(val.next()).toEqual({\n  value: 3,\n  done: true,\n});",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _foo = '__private_Cl_foo';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _foo, {\n      value: function* () {\n        yield 2;\n        return 3;\n      },\n    });\n  };\n  Object.defineProperty(Cl.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(this, _foo, []);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  return Cl;\n})();",
  "let C = (() => {\n  'use strict';\n  var _a = '__private_C_a';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    /* before a */\n    Object.defineProperty(this, _a, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(C, 'prototype', { writable: false });\n  return C;\n  /* after a */\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet counter = 0;\nlet Foo = (() => {\n  'use strict';\n  var _privateMethod = '__private_Foo_privateMethod';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateMethod, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexpect(() => new Foo()).toThrow();\nexpect(counter).toBe(1);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet counter = 0;\nlet Foo = (() => {\n  'use strict';\n  var _privateMethod = '__private_Foo_privateMethod';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateMethod, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nvar _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nclass Base {\n  superMethod() {\n    return 'good';\n  }\n}\nlet Sub = (__nox_super_57_239 => {\n  'use strict';\n  var _privateMethod = '__private_Sub_privateMethod';\n  const Sub = function Sub() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_57_239, arguments, new.target || Sub);\n    (function () {\n      Object.defineProperty(this, _privateMethod, {\n        value: function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return _get(Object.getPrototypeOf(Sub.prototype), 'superMethod', this).call(this);\n        },\n      });\n    }).call(_this);\n    return _this;\n  };\n  if (__nox_super_57_239 !== null && typeof __nox_super_57_239 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Sub.prototype = Object.create(__nox_super_57_239 && __nox_super_57_239.prototype, {\n    constructor: {\n      value: Sub,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_57_239);\n  else Sub.__proto__ = __nox_super_57_239;\n  Object.defineProperty(Sub.prototype, 'superMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'bad';\n      },\n      'name',\n      {\n        value: 'superMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Sub.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(this, _privateMethod, []);\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Sub, 'prototype', { writable: false });\n  return Sub;\n})(Base);\nexpect(new Sub().publicMethod()).toEqual('good');",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _method = '__private_A_method';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _method, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n  };\n  Object.defineProperty(A.prototype, 'm', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        [_classPrivateFieldLooseBase(this, _method)[_method]] = [1];\n      },\n      'name',\n      {\n        value: 'm',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _method = '__private_A_method';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, 'counter', {\n      value: 0,\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(this, _method, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    expect(() =>\n      (() => {\n        throw new TypeError('Attempted to set read only private field');\n      })(),\n    ).toThrow(TypeError);\n    expect(this.counter).toBe(1);\n    expect(() => ([_classPrivateFieldLooseBase(this, _method)[_method]] = [2])).toThrow(TypeError);\n  };\n  Object.defineProperty(A.prototype, 'self', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.counter++;\n        return this;\n      },\n      'name',\n      {\n        value: 'self',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();\nnew A();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _method = '__private_A_method';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, 'counter', {\n      value: 0,\n      enumerable: true,\n      configurable: true,\n      writable: true,\n    });\n    Object.defineProperty(this, _method, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n    [_classPrivateFieldLooseBase(this, _method)[_method]] = [2];\n  };\n  Object.defineProperty(A.prototype, 'self', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        this.counter++;\n        return this;\n      },\n      'name',\n      {\n        value: 'self',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet results = [];\nlet Foo = (() => {\n  'use strict';\n  var _privateFieldValue = '__private_Foo_privateFieldValue';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateFieldValue, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Foo.prototype, 'self', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        results.push(1);\n        return this;\n      },\n      'name',\n      {\n        value: 'get self',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexpect(() => new Foo()).toThrow(TypeError);\nexpect(results).toStrictEqual([1, 2]);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet results = [];\nlet Foo = (() => {\n  'use strict';\n  var _privateFieldValue = '__private_Foo_privateFieldValue';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateFieldValue, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 42;\n      },\n    });\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Foo.prototype, 'self', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        results.push(1);\n        return this;\n      },\n      'name',\n      {\n        value: 'get self',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _privateMethodA = '__private_Foo_privateMethodA';\n  var _privateMethodB = '__private_Foo_privateMethodB';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _privateMethodA, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const i = 40;\n        return i;\n      },\n    });\n    Object.defineProperty(this, _privateMethodB, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const i = 2;\n        return i;\n      },\n    });\n  };\n  Object.defineProperty(Foo.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (\n          _classPrivateMethodCall(this, _privateMethodA, []) +\n          _classPrivateMethodCall(this, _privateMethodB, [])\n        );\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nexpect(new Foo().publicMethod()).toEqual(42);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _tag = '__private_Foo_tag';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _tag, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return this;\n      },\n    });\n    const receiver = _classPrivateFieldLooseBase(this, _tag)[_tag]`tagged template`;\n    expect(receiver).toBe(this);\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nnew Foo();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _tag = '__private_Foo_tag';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    Object.defineProperty(this, _tag, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n      },\n    });\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  return Foo;\n})();\nnew Foo();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\n(function () {\n  let Cl = (() => {\n    'use strict';\n    var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n    const Cl = function Cl() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(Cl.prototype, 'test', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n        },\n        'name',\n        {\n          value: 'test',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(Cl, 'prototype', { writable: false });\n    Object.defineProperty(Cl, _privateStaticMethod, {\n      value: async function () {\n        return 2;\n      },\n    });\n    return Cl;\n  })();\n  return new Cl().test().then(val => {\n    expect(val).toBe(2);\n  });\n});",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nconst privateStaticValue = 1017;\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    this.instanceField = _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n  };\n  Object.defineProperty(Cl, 'staticMethod2', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'staticMethod2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'staticMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'staticMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'privateStaticMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'privateStaticMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return privateStaticValue;\n    },\n  });\n  return Cl;\n})();\nexpect(new Cl().publicMethod()).toEqual(privateStaticValue);\n// expect((new Cl).instanceField).toEqual(privateStaticValue);\n// expect(Cl.privateStaticMethod()).toEqual(privateStaticValue);\n// expect(Cl.staticMethod()).toEqual(privateStaticValue);\n// expect(Cl.staticMethod2()).toEqual(privateStaticValue);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    this.instanceField = _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n  };\n  Object.defineProperty(Cl, 'staticMethod2', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'staticMethod2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'staticMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'staticMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'privateStaticMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'privateStaticMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return 1017;\n    },\n  });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function (checked) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(checked, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return 1017;\n    },\n  });\n  return Cl;\n})();\nconst cl = new Cl();\nexpect(cl.publicMethod(Cl)).toBe(1017);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function (checked) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(checked, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nconsole.log(\n  (() => {\n    'use strict';\n    var _foo = '__private_A_foo';\n    const A = function A() {\n      if (!new.target) throw new TypeError('Cannot call a class as a function');\n    };\n    Object.defineProperty(A.prototype, 'method', {\n      value: Object.defineProperty(\n        function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          _classPrivateMethodCall(this, _foo, []);\n        },\n        'name',\n        {\n          value: 'method',\n          configurable: true,\n        },\n      ),\n      writable: true,\n      configurable: true,\n    });\n    Object.defineProperty(A, 'prototype', { writable: false });\n    Object.defineProperty(A, _foo, {\n      value: function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      },\n    });\n    return A;\n  })(),\n);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet exfiltrated;\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    if (exfiltrated === undefined) {\n      exfiltrated = _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod];\n    }\n    expect(exfiltrated).toStrictEqual(\n      _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod],\n    );\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return 1017;\n    },\n  });\n  return Cl;\n})();\nnew Cl();\n// check for private method function object equality\nnew Cl();\nexpect(exfiltrated()).toEqual(1017);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet exfiltrated;\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    if (exfiltrated === undefined) {\n      exfiltrated = _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod];\n    }\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return 1017;\n    },\n  });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _foo = '__private_Cl_foo';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _foo, []);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _foo, {\n    value: function* () {\n      yield 2;\n      return 3;\n    },\n  });\n  return Cl;\n})();\nconst val = new Cl().test();\nexpect(val.next()).toEqual({\n  value: 2,\n  done: false,\n});\nexpect(val.next()).toEqual({\n  value: 3,\n  done: true,\n});",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _foo = '__private_Cl_foo';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl.prototype, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _foo, []);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _foo, {\n    value: function* () {\n      yield 2;\n      return 3;\n    },\n  });\n  return Cl;\n})();",
  "let C = (() => {\n  'use strict';\n  var _a = '__private_C_a';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(C, 'prototype', { writable: false });\n  /* before a */\n  Object.defineProperty(C, _a, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return C;\n  /* after a */\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    expect(() =>\n      (() => {\n        throw new TypeError('Attempted to set read only private field');\n      })(),\n    ).toThrow(TypeError);\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return Cl;\n})();\nnew Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return Cl;\n})();\nnew Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateMethodA = '__private_Cl_privateMethodA';\n  var _privateMethodB = '__private_Cl_privateMethodB';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return (\n          _classPrivateMethodCall(Cl, _privateMethodA, []) +\n          _classPrivateMethodCall(Cl, _privateMethodB, [])\n        );\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateMethodA, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      const i = 40;\n      return i;\n    },\n  });\n  Object.defineProperty(Cl, _privateMethodB, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      const i = 2;\n      return i;\n    },\n  });\n  return Cl;\n})();\nexpect(new Cl().publicMethod()).toEqual(42);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nvar _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nclass Base {\n  static basePublicStaticMethod() {\n    return 'good';\n  }\n}\nlet Sub = (__nox_super_75_310 => {\n  'use strict';\n  var _subStaticPrivateMethod = '__private_Sub_subStaticPrivateMethod';\n  const Sub = function Sub() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_75_310, arguments, new.target || Sub);\n    return _this;\n  };\n  if (__nox_super_75_310 !== null && typeof __nox_super_75_310 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Sub.prototype = Object.create(__nox_super_75_310 && __nox_super_75_310.prototype, {\n    constructor: {\n      value: Sub,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_75_310);\n  else Sub.__proto__ = __nox_super_75_310;\n  Object.defineProperty(Sub, 'basePublicStaticMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'bad';\n      },\n      'name',\n      {\n        value: 'basePublicStaticMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Sub, 'check', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Sub, _subStaticPrivateMethod, []);\n      },\n      'name',\n      {\n        value: 'check',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Sub, 'prototype', { writable: false });\n  Object.defineProperty(Sub, _subStaticPrivateMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _get(Object.getPrototypeOf(Sub), 'basePublicStaticMethod', this).call(this);\n    },\n  });\n  return Sub;\n})(Base);\nexpect(Sub.check()).toEqual('good');",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nvar _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nclass Base {\n  static basePublicStaticMethod() {\n    return 'good';\n  }\n}\nlet Sub = (__nox_super_75_303 => {\n  'use strict';\n  var _subStaticPrivateMethod = '__private_Sub_subStaticPrivateMethod';\n  const Sub = function Sub() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_75_303, arguments, new.target || Sub);\n    return _this;\n  };\n  if (__nox_super_75_303 !== null && typeof __nox_super_75_303 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  Sub.prototype = Object.create(__nox_super_75_303 && __nox_super_75_303.prototype, {\n    constructor: {\n      value: Sub,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_75_303);\n  else Sub.__proto__ = __nox_super_75_303;\n  Object.defineProperty(Sub, 'basePublicStaticMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 'bad';\n      },\n      'name',\n      {\n        value: 'basePublicStaticMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Sub, 'check', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateMethodCall(Sub, _subStaticPrivateMethod, []);\n      },\n      'name',\n      {\n        value: 'check',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Sub, 'prototype', { writable: false });\n  Object.defineProperty(Sub, _subStaticPrivateMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _get(Object.getPrototypeOf(Sub), 'basePublicStaticMethod', this).call(this);\n    },\n  });\n  return Sub;\n})(Base);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nvar _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nclass A {\n  static get a() {\n    return 1;\n  }\n}\nlet B = (__nox_super_43_229 => {\n  'use strict';\n  var _getA = '__private_B_getA';\n  var _getB = '__private_B_getB';\n  const B = function B() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_43_229, arguments, new.target || B);\n    return _this;\n  };\n  if (__nox_super_43_229 !== null && typeof __nox_super_43_229 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  B.prototype = Object.create(__nox_super_43_229 && __nox_super_43_229.prototype, {\n    constructor: {\n      value: B,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_43_229);\n  else B.__proto__ = __nox_super_43_229;\n  Object.defineProperty(B, 'b', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 2;\n      },\n      'name',\n      {\n        value: 'get b',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(B, 'extract', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return [\n          _classPrivateFieldLooseBase(this, _getA)[_getA],\n          _classPrivateFieldLooseBase(this, _getB)[_getB],\n        ];\n      },\n      'name',\n      {\n        value: 'extract',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(B, 'prototype', { writable: false });\n  Object.defineProperty(B, _getA, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _get(Object.getPrototypeOf(B), 'a', this);\n    },\n  });\n  Object.defineProperty(B, _getB, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return this.b;\n    },\n  });\n  return B;\n})(A);\nconst [getA, getB] = B.extract();\nexpect(getA.call({ a: 3 })).toBe(1);\nexpect(getB.call({ b: 4 })).toBe(4);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nvar _construct2 = {\n  construct: require('@babel/runtime/helpers/construct'),\n  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),\n};\nfunction _construct(t, e, r) {\n  return _construct2.construct(t, e, r);\n}\n_construct.assert = _construct2.assertThisInitialized;\nvar _get2 = { get: require('@babel/runtime/helpers/get') };\nfunction _get(e, t, r) {\n  return _get2.get(e, t, r);\n}\nclass A {\n  static get a() {\n    return 1;\n  }\n}\nlet B = (__nox_super_43_229 => {\n  'use strict';\n  var _getA = '__private_B_getA';\n  var _getB = '__private_B_getB';\n  const B = function B() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    var _this = _construct(__nox_super_43_229, arguments, new.target || B);\n    return _this;\n  };\n  if (__nox_super_43_229 !== null && typeof __nox_super_43_229 !== 'function')\n    throw new TypeError('Super expression must either be null or a function');\n  B.prototype = Object.create(__nox_super_43_229 && __nox_super_43_229.prototype, {\n    constructor: {\n      value: B,\n      writable: true,\n      configurable: true,\n    },\n  });\n  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_43_229);\n  else B.__proto__ = __nox_super_43_229;\n  Object.defineProperty(B, 'b', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return 2;\n      },\n      'name',\n      {\n        value: 'get b',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(B, 'extract', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return [\n          _classPrivateFieldLooseBase(this, _getA)[_getA],\n          _classPrivateFieldLooseBase(this, _getB)[_getB],\n        ];\n      },\n      'name',\n      {\n        value: 'extract',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(B, 'prototype', { writable: false });\n  Object.defineProperty(B, _getA, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _get(Object.getPrototypeOf(B), 'a', this);\n    },\n  });\n  Object.defineProperty(B, _getB, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return this.b;\n    },\n  });\n  return B;\n})(A);\nconst [getA, getB] = B.extract();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nconst privateStaticValue = 1017;\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticMethod = '__private_Cl_privateStaticMethod';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    this.instanceField = _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n  };\n  Object.defineProperty(Cl, 'staticMethod2', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'staticMethod2',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'staticMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'staticMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'privateStaticMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'privateStaticMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl.prototype, 'publicMethod', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateMethodCall(Cl, _privateStaticMethod, []);\n      },\n      'name',\n      {\n        value: 'publicMethod',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateStaticMethod, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return privateStaticValue;\n    },\n  });\n  return Cl;\n})();\nexpect(new Cl().publicMethod()).toEqual(privateStaticValue);\nexpect(new Cl().instanceField).toEqual(privateStaticValue);\nexpect(Cl.privateStaticMethod()).toEqual(privateStaticValue);\nexpect(Cl.staticMethod()).toEqual(privateStaticValue);\nexpect(Cl.staticMethod2()).toEqual(privateStaticValue);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _method = '__private_A_method';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 'run', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        expect(() =>\n          (() => {\n            throw new TypeError('Attempted to set read only private field');\n          })(),\n        ).toThrow(TypeError);\n        expect(() => ([_classPrivateFieldLooseBase(A, _method)[_method]] = [2])).toThrow(TypeError);\n      },\n      'name',\n      {\n        value: 'run',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  Object.defineProperty(A, _method, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet A = (() => {\n  'use strict';\n  var _method = '__private_A_method';\n  const A = function A() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(A.prototype, 'run', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        (() => {\n          throw new TypeError('Attempted to set read only private field');\n        })();\n        [_classPrivateFieldLooseBase(A, _method)[_method]] = [2];\n      },\n      'name',\n      {\n        value: 'run',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(A, 'prototype', { writable: false });\n  Object.defineProperty(A, _method, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return A;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _tag = '__private_Foo_tag';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'getReceiver', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n      },\n      'name',\n      {\n        value: 'getReceiver',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _tag, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return this;\n    },\n  });\n  return Foo;\n})();\nexpect(Foo.getReceiver()).toBe(Foo);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _tag = '__private_Foo_tag';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _tag, {\n    value: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n    },\n  });\n  return Foo;\n})();\nnew Foo();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nexpect(\n  (() => {\n    let r;\n    let C = (() => {\n      'use strict';\n      var _p = '__private_C_p';\n      var __ = '__private_C__';\n      const C = function C() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        r = _classPrivateFieldLooseBase(C, _p)[_p];\n      };\n      Object.defineProperty(C, 'prototype', { writable: false });\n      Object.defineProperty(C, __, {\n        writable: true,\n        value: new C(),\n      });\n      Object.defineProperty(C, _p, {\n        get: function () {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          return 0;\n        },\n      });\n      return C;\n    })();\n    return r;\n  })(),\n).toBe(0);\nexpect(\n  (() => {\n    let r;\n    let C = (() => {\n      'use strict';\n      var _p15 = '__private_C_p';\n      var __14 = '__private_C__';\n      const C = function C() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        _classPrivateFieldLooseBase(C, _p15)[_p15] = 0;\n      };\n      Object.defineProperty(C, 'prototype', { writable: false });\n      Object.defineProperty(C, __14, {\n        writable: true,\n        value: new C(),\n      });\n      Object.defineProperty(C, _p15, {\n        set: function (v) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          r = v;\n        },\n      });\n      return C;\n    })();\n    return r;\n  })(),\n).toBe(0);\nexpect(\n  (() => {\n    let r;\n    let C = (() => {\n      'use strict';\n      var _p17 = '__private_C_p';\n      var __16 = '__private_C__';\n      const C = function C() {\n        if (!new.target) throw new TypeError('Cannot call a class as a function');\n        for (_classPrivateFieldLooseBase(C, _p17)[_p17] of [0]);\n      };\n      Object.defineProperty(C, 'prototype', { writable: false });\n      Object.defineProperty(C, __16, {\n        writable: true,\n        value: new C(),\n      });\n      Object.defineProperty(C, _p17, {\n        set: function (v) {\n          if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n          r = v;\n        },\n      });\n      return C;\n    })();\n    return r;\n  })(),\n).toBe(0);",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticFieldValue = '__private_Cl_privateStaticFieldValue';\n  var _PRIVATE_STATIC_FIELD = '__private_Cl_PRIVATE_STATIC_FIELD';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl, 'getValue', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];\n      },\n      'name',\n      {\n        value: 'getValue',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'setValue', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue] =\n          'dank';\n      },\n      'name',\n      {\n        value: 'setValue',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {\n    writable: true,\n    value: 'top secret string',\n  });\n  Object.defineProperty(Cl, _privateStaticFieldValue, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD];\n    },\n    set: function (newValue) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] =\n        `Updated: ${newValue}`;\n    },\n  });\n  return Cl;\n})();\nexpect(Cl.getValue()).toEqual('top secret string');\nCl.setValue();\nexpect(Cl.getValue()).toEqual('Updated: dank');",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticFieldValue = '__private_Cl_privateStaticFieldValue';\n  var _PRIVATE_STATIC_FIELD = '__private_Cl_PRIVATE_STATIC_FIELD';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl, 'getValue', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];\n      },\n      'name',\n      {\n        value: 'getValue',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'setValue', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue] =\n          'dank';\n      },\n      'name',\n      {\n        value: 'setValue',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {\n    writable: true,\n    value: 'top secret string',\n  });\n  Object.defineProperty(Cl, _privateStaticFieldValue, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD];\n    },\n    set: function (newValue) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] =\n        `Updated: ${newValue}`;\n    },\n  });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet C = (() => {\n  'use strict';\n  var _p = '__private_C_p';\n  var _q = '__private_C_q';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    [_classPrivateFieldLooseBase(C, _p)[_p]] = [0];\n    expect(_classPrivateFieldLooseBase(C, _q)[_q]).toBe(0);\n  };\n  Object.defineProperty(C, 'prototype', { writable: false });\n  Object.defineProperty(C, _q, {\n    writable: true,\n    value: void 0,\n  });\n  Object.defineProperty(C, _p, {\n    set: function (v) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(C, _q)[_q] = v;\n    },\n  });\n  return C;\n})();\nnew C();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet C = (() => {\n  'use strict';\n  var _p = '__private_C_p';\n  var _q = '__private_C_q';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    [_classPrivateFieldLooseBase(C, _p)[_p]] = [0];\n  };\n  Object.defineProperty(C, 'prototype', { writable: false });\n  Object.defineProperty(C, _q, {\n    writable: true,\n    value: void 0,\n  });\n  Object.defineProperty(C, _p, {\n    set: function (v) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(C, _q)[_q] = v;\n    },\n  });\n  return C;\n})();\nnew C();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticFieldValue = '__private_Cl_privateStaticFieldValue';\n  var _PRIVATE_STATIC_FIELD = '__private_Cl_PRIVATE_STATIC_FIELD';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl, 'getPrivateStaticFieldValue', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];\n      },\n      'name',\n      {\n        value: 'getPrivateStaticFieldValue',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {\n    writable: true,\n    value: 0,\n  });\n  Object.defineProperty(Cl, _privateStaticFieldValue, {\n    set: function (newValue) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] = newValue;\n    },\n  });\n  return Cl;\n})();\nexpect(Cl.getPrivateStaticFieldValue()).toBeUndefined();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateStaticFieldValue = '__private_Cl_privateStaticFieldValue';\n  var _PRIVATE_STATIC_FIELD = '__private_Cl_PRIVATE_STATIC_FIELD';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl, 'getPrivateStaticFieldValue', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];\n      },\n      'name',\n      {\n        value: 'getPrivateStaticFieldValue',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {\n    writable: true,\n    value: 0,\n  });\n  Object.defineProperty(Cl, _privateStaticFieldValue, {\n    set: function (newValue) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] = newValue;\n    },\n  });\n  return Cl;\n})();",
  "let C = (() => {\n  'use strict';\n  var _a = '__private_C_a';\n  const C = function C() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(C, 'prototype', { writable: false });\n  /* before get a */\n  Object.defineProperty(C, _a, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return 42;\n    },\n    set: function (v) {\n      /* after get a */\n      /* before set a */\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n    },\n  });\n  return C;\n  /* after set a */\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    expect(() =>\n      (() => {\n        throw new TypeError('Attempted to set read only private field');\n      })(),\n    ).toThrow(TypeError);\n    expect(\n      () => ([_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]] = [1]),\n    ).toThrow(TypeError);\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateField, {\n    writable: true,\n    value: 0,\n  });\n  Object.defineProperty(Cl, _privateFieldValue, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n    },\n  });\n  return Cl;\n})();\nconst cl = new Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n    (() => {\n      throw new TypeError('Attempted to set read only private field');\n    })();\n    [_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]] = [1];\n  };\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateField, {\n    writable: true,\n    value: 0,\n  });\n  Object.defineProperty(Cl, _privateFieldValue, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _classPrivateFieldLooseBase(this, _privateField)[_privateField];\n    },\n  });\n  return Cl;\n})();\nconst cl = new Cl();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'publicFieldValue', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Cl.publicField;\n      },\n      'name',\n      {\n        value: 'get publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'publicFieldValue', {\n    set: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        Cl.publicField = newValue;\n      },\n      'name',\n      {\n        value: 'set publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'testUpdates', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = 0;\n        Cl.publicField = 0;\n        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] =\n          _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]++;\n        Cl.publicFieldValue = Cl.publicFieldValue++;\n        expect(_classPrivateFieldLooseBase(Cl, _privateField)[_privateField]).toEqual(\n          Cl.publicField,\n        );\n        ++_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];\n        ++Cl.publicFieldValue;\n        expect(_classPrivateFieldLooseBase(Cl, _privateField)[_privateField]).toEqual(\n          Cl.publicField,\n        );\n        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] += 1;\n        Cl.publicFieldValue += 1;\n        expect(_classPrivateFieldLooseBase(Cl, _privateField)[_privateField]).toEqual(\n          Cl.publicField,\n        );\n      },\n      'name',\n      {\n        value: 'testUpdates',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateField, {\n    writable: true,\n    value: 'top secret string',\n  });\n  Object.defineProperty(Cl, 'publicField', {\n    value: 'not secret string',\n    enumerable: true,\n    configurable: true,\n    writable: true,\n  });\n  Object.defineProperty(Cl, _privateFieldValue, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _classPrivateFieldLooseBase(Cl, _privateField)[_privateField];\n    },\n    set: function (newValue) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = newValue;\n    },\n  });\n  return Cl;\n})();\nCl.testUpdates();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Cl = (() => {\n  'use strict';\n  var _privateField = '__private_Cl_privateField';\n  var _privateFieldValue = '__private_Cl_privateFieldValue';\n  const Cl = function Cl() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Cl, 'publicGetPrivateField', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];\n      },\n      'name',\n      {\n        value: 'publicGetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'publicSetPrivateField', {\n    value: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = newValue;\n      },\n      'name',\n      {\n        value: 'publicSetPrivateField',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'publicFieldValue', {\n    get: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        return Cl.publicField;\n      },\n      'name',\n      {\n        value: 'get publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'publicFieldValue', {\n    set: Object.defineProperty(\n      function (newValue) {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        Cl.publicField = newValue;\n      },\n      'name',\n      {\n        value: 'set publicFieldValue',\n        configurable: true,\n      },\n    ),\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'testUpdates', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        _classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = 0;\n        Cl.publicField = 0;\n        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] =\n          _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]++;\n        Cl.publicFieldValue = Cl.publicFieldValue++;\n        ++_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];\n        ++Cl.publicFieldValue;\n        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] += 1;\n        Cl.publicFieldValue += 1;\n        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = -(\n          _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] **\n          _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]\n        );\n        Cl.publicFieldValue = -(Cl.publicFieldValue ** Cl.publicFieldValue);\n      },\n      'name',\n      {\n        value: 'testUpdates',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Cl, 'prototype', { writable: false });\n  Object.defineProperty(Cl, _privateField, {\n    writable: true,\n    value: 'top secret string',\n  });\n  Object.defineProperty(Cl, 'publicField', {\n    value: 'not secret string',\n    enumerable: true,\n    configurable: true,\n    writable: true,\n  });\n  Object.defineProperty(Cl, _privateFieldValue, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return _classPrivateFieldLooseBase(Cl, _privateField)[_privateField];\n    },\n    set: function (newValue) {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      _classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = newValue;\n    },\n  });\n  return Cl;\n})();",
  "var _classPrivateFieldLooseBase2 = {\n  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),\n};\nfunction _classPrivateFieldLooseBase(e, s) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);\n}\nfunction _classPrivateMethodCall(e, s, a) {\n  return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s)[s].apply(e, a);\n}\nlet Foo = (() => {\n  'use strict';\n  var _tag = '__private_Foo_tag';\n  const Foo = function Foo() {\n    if (!new.target) throw new TypeError('Cannot call a class as a function');\n  };\n  Object.defineProperty(Foo, 'test', {\n    value: Object.defineProperty(\n      function () {\n        if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n        const receiver = _classPrivateFieldLooseBase(this, _tag)[_tag]``;\n        expect(receiver).toBe(this);\n      },\n      'name',\n      {\n        value: 'test',\n        configurable: true,\n      },\n    ),\n    writable: true,\n    configurable: true,\n  });\n  Object.defineProperty(Foo, 'prototype', { writable: false });\n  Object.defineProperty(Foo, _tag, {\n    get: function () {\n      if (new.target) throw new TypeError(\"Class methods cannot be invoked with 'new'\");\n      return function () {\n        return this;\n      };\n    },\n  });\n  return Foo;\n})();",
];

export const fixtureCases = [
  {
    title: 'accessors loose — basic (exec)',
    source:
      'class Cl {\n  #privateField = "top secret string";\n\n  constructor() {\n    this.publicField = "not secret string";\n  }\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  publicGetPrivateField() {\n    return this.#privateFieldValue;\n  }\n\n  publicSetPrivateField(newValue) {\n    this.#privateFieldValue = newValue;\n  }\n}\n\nconst cl = new Cl();\n\nexpect(cl.publicGetPrivateField()).toEqual("top secret string");\n\ncl.publicSetPrivateField("new secret string");\nexpect(cl.publicGetPrivateField()).toEqual("new secret string");\n\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors loose — basic (input)',
    source:
      'class Cl {\n  #privateField = "top secret string";\n\n  constructor() {\n    this.publicField = "not secret string";\n  }\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  publicGetPrivateField() {\n    return this.#privateFieldValue;\n  }\n\n  publicSetPrivateField(newValue) {\n    this.#privateFieldValue = newValue;\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors loose — class binding (exec)',
    source:
      'class A {\n  get #getA() { return A };\n  get getA() {\n    return this.#getA;\n  }\n}\n\nconst oldA = A;\nA = null;\n\nexpect(new oldA().getA).toBe(oldA);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors loose — class binding (input)',
    source: 'class A {\n  get #getA() { return A };\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors loose — get only setter (exec)',
    source:
      'class Cl {\n  #privateField = 0;\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  constructor() {\n    expect(this.#privateFieldValue).toBeUndefined();\n  }\n}\n\nconst cl = new Cl();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors loose — get only setter (input)',
    source:
      'class Cl {\n  #privateField = 0;\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  constructor() {\n    this.publicField = this.#privateFieldValue;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors loose — helper (exec)',
    source:
      'let foo;\nclass Cl {\n  set #foo(v) { return 1 }\n  test() {\n    foo = this.#foo = 2;\n  }\n}\n\nnew Cl().test();\n\nexpect(foo).toBe(2);',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    ],
  },
  {
    title: 'accessors loose — preserve comments (input)',
    source:
      'class C {\n  /* before get a */\n  get #a() { return 42 };\n  /* after get a */\n\n  /* before set a */\n  set #a(v) {}\n  /* after set a */\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors loose — reassignment (exec)',
    source:
      'let counter = 0;\nclass Foo {\n  constructor() {\n    this.#privateFieldValue = ++counter;\n  }\n\n  get #privateFieldValue() {\n    return 42;\n  }\n}\n\nexpect(() => new Foo).toThrow();\nexpect(counter).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors loose — reassignment (input)',
    source:
      'let counter = 0;\nclass Foo {\n  constructor() {\n    this.#privateFieldValue = ++counter;\n  }\n\n  get #privateFieldValue() {\n    return 42;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors loose — set only getter (exec)',
    source:
      'class Cl {\n  #privateField = 0;\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  constructor() {\n    expect(() => this.#privateFieldValue = 1).toThrow(TypeError);\n    expect(() => ([this.#privateFieldValue] = [1])).toThrow(TypeError);\n  }\n}\n\nconst cl = new Cl();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors loose — set only getter (input)',
    source:
      'class Cl {\n  #privateField = 0;\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  constructor() {\n    this.#privateFieldValue = 1;\n    ([this.#privateFieldValue] = [1]);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors loose — updates (exec)',
    source:
      'class Cl {\n  #privateField = "top secret string";\n\n  constructor() {\n    this.publicField = "not secret string";\n  }\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  publicGetPrivateField() {\n    return this.#privateFieldValue;\n  }\n\n  publicSetPrivateField(newValue) {\n    this.#privateFieldValue = newValue;\n  }\n\n  get publicFieldValue() {\n    return this.publicField;\n  }\n\n  set publicFieldValue(newValue) {\n    this.publicField = newValue;\n  }\n\n  testUpdates() {\n    this.#privateField = 0;\n    this.publicField = 0;\n    this.#privateFieldValue = this.#privateFieldValue++;\n    this.publicFieldValue = this.publicFieldValue++;\n    expect(this.#privateField).toEqual(this.publicField);\n\n    ++this.#privateFieldValue;\n    ++this.publicFieldValue;\n    expect(this.#privateField).toEqual(this.publicField);\n\n    this.#privateFieldValue += 1;\n    this.publicFieldValue += 1;\n    expect(this.#privateField).toEqual(this.publicField);\n  }\n}\n\nconst cl = new Cl();\ncl.testUpdates();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    ],
  },
  {
    title: 'accessors loose — updates (input)',
    source:
      'class Cl {\n  #privateField = "top secret string";\n\n  constructor() {\n    this.publicField = "not secret string";\n  }\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  publicGetPrivateField() {\n    return this.#privateFieldValue;\n  }\n\n  publicSetPrivateField(newValue) {\n    this.#privateFieldValue = newValue;\n  }\n\n  get publicFieldValue() {\n    return this.publicField;\n  }\n\n  set publicFieldValue(newValue) {\n    this.publicField = newValue;\n  }\n\n  testUpdates() {\n    this.#privateField = 0;\n    this.publicField = 0;\n    this.#privateFieldValue = this.#privateFieldValue++;\n    this.publicFieldValue = this.publicFieldValue++;\n\n    ++this.#privateFieldValue;\n    ++this.publicFieldValue;\n\n    this.#privateFieldValue += 1;\n    this.publicFieldValue += 1;\n\n    this.#privateFieldValue = -(this.#privateFieldValue ** this.#privateFieldValue);\n    this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors — arguments (exec)',
    source:
      'class Cl {\n  #privateField = "top secret string";\n\n  constructor() {\n    this.publicField = "not secret string";\n  }\n\n  get #privateFieldValue() {\n    expect(arguments.length).toBe(0);\n    return this.#privateField;\n  }\n\n  set #privateFieldValue(newValue) {\n    expect(arguments.length).toBe(1);\n    this.#privateField = newValue;\n  }\n\n  publicGetPrivateField() {\n    return this.#privateFieldValue;\n  }\n\n  publicSetPrivateField(newValue) {\n    this.#privateFieldValue = newValue;\n  }\n}\n\nconst cl = new Cl();\n\nexpect(cl.publicGetPrivateField()).toEqual("top secret string");\n\ncl.publicSetPrivateField("new secret string");\nexpect(cl.publicGetPrivateField()).toEqual("new secret string");\n\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    ],
  },
  {
    title: 'accessors — arguments (input)',
    source:
      'class Cl {\n  #privateField = "top secret string";\n\n  constructor() {\n    this.publicField = "not secret string";\n  }\n\n  get #privateFieldValue() {\n    expect(arguments.length).toBe(0);\n    return this.#privateField;\n  }\n\n  set #privateFieldValue(newValue) {\n    expect(arguments.length).toBe(1);\n    this.#privateField = newValue;\n  }\n\n  publicGetPrivateField() {\n    return this.#privateFieldValue;\n  }\n\n  publicSetPrivateField(newValue) {\n    this.#privateFieldValue = newValue;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors — destructuring (input)',
    source:
      'class A {\n  set #setter(v) {}\n  get #getter() {}\n\n  m() {\n    [this.#setter] = [1];\n    [this.#getter] = [1];\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    ],
  },
  {
    title: 'accessors — get only setter (exec)',
    source:
      'class Cl {\n  #privateField = 0;\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  constructor() {\n    expect(() => this.#privateFieldValue).toThrow(TypeError);\n  }\n}\n\nconst cl = new Cl();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors — reassignment (exec)',
    source:
      'let results = [];\nclass Foo {\n  constructor() {\n    this.self.#privateFieldValue = results.push(2);\n  }\n\n  get self() {\n    results.push(1);\n    return this;\n  }\n\n  get #privateFieldValue() {\n    return 42;\n  }\n}\n\nexpect(() => new Foo).toThrow(TypeError);\nexpect(results).toStrictEqual([1, 2]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors — reassignment (input)',
    source:
      'let results = [];\nclass Foo {\n  constructor() {\n    this.self.#privateFieldValue = results.push(2);\n  }\n\n  get self() {\n    results.push(1);\n    return this;\n  }\n\n  get #privateFieldValue() {\n    return 42;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors — set only getter (exec)',
    source:
      'class Cl {\n  #privateField = 0;\n  counter = 0;\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  get self() {\n    this.counter++;\n    return this;\n  }\n\n  constructor() {\n    expect(() => this.self.#privateFieldValue = 1).toThrow(TypeError);\n    expect(this.counter).toBe(1);\n    expect(() => ([this.self.#privateFieldValue] = [1])).toThrow(TypeError);\n    expect(this.counter).toBe(2);\n  }\n}\n\nconst cl = new Cl();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors — set only getter (input)',
    source:
      'class Cl {\n  #privateField = 0;\n  counter = 0;\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  get self() {\n    this.counter++;\n    return this;\n  }\n\n  constructor() {\n    this.self.#privateFieldValue = 1\n    ([this.self.#privateFieldValue] = [1]);\n  }\n}\n\nconst cl = new Cl();\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'accessors — tagged template (exec)',
    source:
      'class Foo {\n  get #tag() {\n    return function() { return this; };\n  }\n  \n  constructor() {\n    const receiver = this.#tag``;\n    expect(receiver).toBe(this);\n  }\n}',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors — tagged template (input)',
    source:
      'class Foo {\n  get #tag() {\n    return () => this;\n  }\n\n  constructor() {\n    this.#tag``;\n  }\n}\n\nnew Foo();',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors — updates bigint (exec)',
    source:
      'class Cl {\n  #privateField = "top secret string";\n\n  constructor() {\n    this.publicField = "not secret string";\n  }\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  publicGetPrivateField() {\n    return this.#privateFieldValue;\n  }\n\n  publicSetPrivateField(newValue) {\n    this.#privateFieldValue = newValue;\n  }\n\n  get publicFieldValue() {\n    return this.publicField;\n  }\n\n  set publicFieldValue(newValue) {\n    this.publicField = newValue;\n  }\n\n  testUpdates() {\n    this.#privateField = 0n;\n    this.publicField = 0n;\n    this.#privateFieldValue = this.#privateFieldValue++;\n    this.publicFieldValue = this.publicFieldValue++;\n    expect(this.#privateField).toEqual(this.publicField);\n\n    ++this.#privateFieldValue;\n    ++this.publicFieldValue;\n    expect(this.#privateField).toEqual(this.publicField);\n\n    this.#privateFieldValue += 1n;\n    this.publicFieldValue += 1n;\n    expect(this.#privateField).toEqual(this.publicField);\n  }\n}\n\nconst cl = new Cl();\ncl.testUpdates();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'accessors — updates bigint (input)',
    source:
      'class Cl {\n  #privateField = "top secret string";\n\n  constructor() {\n    this.publicField = "not secret string";\n  }\n\n  get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  set #privateFieldValue(newValue) {\n    this.#privateField = newValue;\n  }\n\n  publicGetPrivateField() {\n    return this.#privateFieldValue;\n  }\n\n  publicSetPrivateField(newValue) {\n    this.#privateFieldValue = newValue;\n  }\n\n  get publicFieldValue() {\n    return this.publicField;\n  }\n\n  set publicFieldValue(newValue) {\n    this.publicField = newValue;\n  }\n\n  testUpdates() {\n    this.#privateField = 0n;\n    this.publicField = 0n;\n    this.#privateFieldValue = this.#privateFieldValue++;\n    this.publicFieldValue = this.publicFieldValue++;\n\n    ++this.#privateFieldValue;\n    ++this.publicFieldValue;\n\n    this.#privateFieldValue += 1n;\n    this.publicFieldValue += 1n;\n\n    this.#privateFieldValue = -(this.#privateFieldValue ** this.#privateFieldValue);\n    this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'assumption constantSuper — private method super (input)',
    source:
      "class Base {\n  superMethod() {\n    return 'good';\n  }\n}\n\nclass Sub extends Base {\n  superMethod() {\n    return 'bad';\n  }\n\n  #privateMethod() {\n    return super.superMethod();\n  }\n\n  publicMethod() {\n    return this.#privateMethod();\n  }\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — get get (input)',
    source:
      'class Cl {\n  #privateField = 0;\n  \n  get #getSet() {\n    return this.#privateField;\n  }\n\n  get #getSet() {\n    return this.#privateField;\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — get method (input)',
    source:
      "class Cl {\n  #privateField = 0;\n  \n  get #foo() {\n    return this.#privateField;\n  }\n\n  #foo() {\n    return 'foo';\n  }\n}",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — get set (input)',
    source:
      'class Cl {\n  #privateField = 0;\n\n  get #getSet() {\n    return this.#privateField;\n  }\n  \n  set #getSet(newValue) {\n    this.#privateField = newValue;\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — method get (input)',
    source:
      "class Cl {\n  #privateField = 0;\n\n  #foo() {\n    return 'foo';\n  }\n\n  get #foo() {\n    return this.#privateField;\n  }\n}",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — method method (input)',
    source:
      "class Cl {\n  #dank() {\n    return 'foo';\n  }\n\n  #dank() {\n    return 'foo';\n  }\n\n}",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — method set (input)',
    source:
      "class Cl {\n  #privateField = 0;\n\n  #foo() {\n    return 'foo';\n  }\n\n  set #foo(newValue) {\n    this.#privateField = newValue;\n  }\n}",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — set get (input)',
    source:
      'class Cl {\n  #privateField = 0;\n  \n  set #getSet(newValue) {\n    this.#privateField = newValue;\n  }\n\n  get #getSet() {\n    return this.#privateField;\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — set method (input)',
    source:
      "class Cl {\n  #privateField = 0;\n\n  set #foo(newValue) {\n    this.#privateField = newValue;\n  }\n\n  #foo() {\n    return 'foo';\n  }\n}",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'duplicated names — set set (input)',
    source:
      'class Cl {\n  #privateField = 0;\n  \n  set #getSet(newValue) {\n    return this.#privateField;\n  }\n\n  set #getSet(newValue) {\n    return this.#privateField;\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'misc — multiple (input)',
    source:
      'class A {\n  #method() {}\n\n  get #getter() {}\n\n  set #setter(v) {}\n\n  get #getset() {}\n  set #getset(v) {}\n\n  constructor() {\n    this.#method();\n    this.#getter;\n    this.#setter = 1;\n    this.#getset;\n    this.#getset = 2;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — assignment (exec)',
    source:
      'class Foo {\n    constructor() {\n      this.publicField = this.#privateMethod();\n    }\n\n    #privateMethod() {\n      return 42;\n    }\n  }\n\n  expect((new Foo).publicField).toEqual(42);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — assignment (input)',
    source:
      'class Foo {\n  constructor() {\n    this.publicField = this.#privateMethod();\n  }\n\n  #privateMethod() {\n    return 42;\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — async (exec)',
    source:
      '(function () {\nclass Cl {\n  async #foo() {\n    return 2;\n  }\n\n  test() {\n    return this.#foo();\n  }\n}\n\nreturn new Cl().test().then(val => {\n  expect(val).toBe(2);\n});\n\n});\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — async (input)',
    source:
      'class Cl {\n  async #foo() {\n    return 2;\n  }\n\n  test() {\n    return this.#foo();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — before fields (exec)',
    source:
      'class Cl {\n  prop = this.#method(1);\n\n  #priv = this.#method(2);\n\n  #method(x) {\n    return x;\n  }\n\n  getPriv() {\n    return this.#priv;\n  }\n}\n\nexpect(new Cl().prop).toBe(1);\nexpect(new Cl().getPriv()).toBe(2);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — before fields (input)',
    source:
      'class Cl {\n  prop = this.#method(1);\n\n  #priv = this.#method(2);\n\n  #method(x) {\n    return x;\n  }\n\n  getPriv() {\n    return this.#priv;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — class binding (exec)',
    source:
      'class A {\n  #getA() { return A };\n  getA() {\n    return this.#getA();\n  }\n}\n\nconst oldA = A;\nA = null;\n\nexpect(new oldA().getA()).toBe(oldA);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — class binding (input)',
    source: 'class A {\n  #getA() { return A };\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — class expression (input)',
    source: 'console.log(class A {\n  #foo() {}\n\n  method() {\n    this.#foo();\n  }\n});\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — context (exec)',
    source:
      "class Foo {\n    constructor(status) {\n      this.status = status;\n      expect(() => this.#getStatus = null).toThrow(TypeError);\n    }\n\n    #getStatus() {\n      return this.status;\n    }\n\n    getCurrentStatus() {\n      return this.#getStatus();\n    }\n\n    setCurrentStatus(newStatus) {\n      this.status = newStatus;\n    }\n\n    getFakeStatus(fakeStatus) {\n      const getStatus = this.#getStatus;\n      return function () {\n        return getStatus.call({ status: fakeStatus });\n      };\n    }\n\n    getFakeStatusFunc() {\n      return {\n        status: 'fake-status',\n        getFakeStatus: this.#getStatus,\n      };\n    }\n  }\n\n  const f = new Foo('inactive');\n  expect(f.getCurrentStatus()).toBe('inactive');\n\n  f.setCurrentStatus('new-status');\n  expect(f.getCurrentStatus()).toBe('new-status');\n\n  expect(f.getFakeStatus('fake')()).toBe('fake');\n  expect(f.getFakeStatusFunc().getFakeStatus()).toBe('fake-status');\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — context (input)',
    source:
      "class Foo {\n  constructor(status) {\n    this.status = status;\n  }\n\n  #getStatus() {\n    return this.status;\n  }\n\n  getCurrentStatus() {\n    return this.#getStatus();\n  }\n\n  setCurrentStatus(newStatus) {\n    this.status = newStatus;\n  }\n\n  getFakeStatus(fakeStatus) {\n    const fakeGetStatus = this.#getStatus;\n    return function() {\n      return fakeGetStatus.call({ status: fakeStatus });\n    };\n  }\n\n  getFakeStatusFunc() {\n    return {\n      status: 'fake-status',\n      getFakeStatus: this.#getStatus,\n    };\n  }\n}",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — exfiltrated (exec)',
    source:
      'let exfiltrated;\nclass Foo {\n    #privateMethod() {}\n\n    constructor() {\n        if (exfiltrated === undefined) {\n            exfiltrated = this.#privateMethod;\n        }\n        expect(exfiltrated).toStrictEqual(this.#privateMethod);\n    }\n}\n\nnew Foo();\n// check for private method function object equality\nnew Foo();',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — exfiltrated (input)',
    source:
      'let exfiltrated;\nclass Foo {\n    #privateMethod() {}\n\n    constructor() {\n        if (exfiltrated === undefined) {\n            exfiltrated = this.#privateMethod;\n        }\n    }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — generator (exec)',
    source:
      'class Cl {\n  *#foo() {\n    yield 2;\n    return 3;\n  }\n\n  test() {\n    return this.#foo();\n  }\n}\n\nconst val = new Cl().test();\nexpect(val.next()).toEqual({ value: 2, done: false });\nexpect(val.next()).toEqual({ value: 3, done: true });\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — generator (input)',
    source:
      'class Cl {\n  *#foo() {\n    yield 2;\n    return 3;\n  }\n\n  test() {\n    return this.#foo();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — preserve comments (input)',
    source: 'class C {\n  /* before a */\n  #a() {};\n  /* after a */\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — reassignment (exec)',
    source:
      'let counter = 0;\nclass Foo {\n  constructor() {\n    this.#privateMethod = ++counter;\n  }\n\n  #privateMethod() {\n    return 42;\n  }\n}\n\nexpect(() => new Foo).toThrow();\nexpect(counter).toBe(1);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — reassignment (input)',
    source:
      'let counter = 0;\nclass Foo {\n  constructor() {\n    this.#privateMethod = ++counter;\n  }\n\n  #privateMethod() {\n    return 42;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method loose — super (exec)',
    source:
      "class Base {\n  superMethod() {\n    return 'good';\n  }\n}\n\nclass Sub extends Base {\n  superMethod() {\n    return 'bad';\n  }\n\n  #privateMethod() {\n    return super.superMethod();\n  }\n\n  publicMethod() {\n    return this.#privateMethod();\n  }\n}\n\nexpect((new Sub()).publicMethod()).toEqual('good');\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method — destructuring (input)',
    source: 'class A {\n  #method() {}\n\n  m() {\n    [this.#method] = [1];\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method — read only (exec)',
    source:
      'class A {\n  counter = 0;\n  #method() {}\n  self() {\n    this.counter++;\n    return this;\n  }\n\n  constructor() {\n    expect(() => this.self().#method = 2).toThrow(TypeError);\n    expect(this.counter).toBe(1);\n    expect(() => ([this.#method] = [2])).toThrow(TypeError);\n  }\n}\n\nnew A;\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method — read only (input)',
    source:
      'class A {\n  counter = 0;\n  #method() {}\n  self() {\n    this.counter++;\n    return this;\n  }\n\n  constructor() {\n    this.self().#method = 2;\n    ([this.#method] = [2]);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method — reassignment (exec)',
    source:
      'let results = [];\nclass Foo {\n  constructor() {\n    this.self.#privateFieldValue = results.push(2);\n  }\n\n  get self() {\n    results.push(1);\n    return this;\n  }\n\n  #privateFieldValue() {\n    return 42;\n  }\n}\n\nexpect(() => new Foo).toThrow(TypeError);\nexpect(results).toStrictEqual([1, 2]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method — reassignment (input)',
    source:
      'let results = [];\nclass Foo {\n  constructor() {\n    this.self.#privateFieldValue = results.push(2);\n  }\n\n  get self() {\n    results.push(1);\n    return this;\n  }\n\n  #privateFieldValue() {\n    return 42;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method — scopable (exec)',
    source:
      'class Foo {\n  #privateMethodA() {\n    const i = 40;\n    return i;\n  }\n\n  #privateMethodB() {\n    const i = 2;\n    return i;\n  }\n\n  publicMethod() {\n    return this.#privateMethodA() + this.#privateMethodB();\n  }\n}\n\nexpect((new Foo).publicMethod()).toEqual(42);',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method — tagged template (exec)',
    source:
      'class Foo {\n  #tag() {\n    return this;\n  }\n  \n  constructor() {\n    const receiver = this.#tag`tagged template`;\n    expect(receiver).toBe(this);\n  }\n}\nnew Foo();',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private method — tagged template (input)',
    source: 'class Foo {\n  #tag() {\n    this.#tag``;\n  }\n}\nnew Foo();',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — async (input)',
    source:
      '(function () {\nclass Cl {\n  static async #privateStaticMethod() {\n    return 2;\n  }\n\n  test() {\n    return Cl.#privateStaticMethod();\n  }\n}\n\nreturn new Cl().test().then(val => {\n  expect(val).toBe(2);\n});\n\n});\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — basic (exec)',
    source:
      'const privateStaticValue = 1017;\n\nclass Cl {\n  static staticMethod2() {\n    return Cl.#privateStaticMethod();\n  }\n\n  static #privateStaticMethod() {\n    return privateStaticValue;\n  }\n\n  static staticMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  static privateStaticMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  publicMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  constructor() {\n    this.instanceField = Cl.#privateStaticMethod();\n  }\n}\n\nexpect((new Cl).publicMethod()).toEqual(privateStaticValue);\n// expect((new Cl).instanceField).toEqual(privateStaticValue);\n// expect(Cl.privateStaticMethod()).toEqual(privateStaticValue);\n// expect(Cl.staticMethod()).toEqual(privateStaticValue);\n// expect(Cl.staticMethod2()).toEqual(privateStaticValue);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — basic (input)',
    source:
      'class Cl {\n  static staticMethod2() {\n    return Cl.#privateStaticMethod();\n  }\n\n  static #privateStaticMethod() {\n    return 1017;\n  }\n\n  static staticMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  static privateStaticMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  publicMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  constructor() {\n    this.instanceField = Cl.#privateStaticMethod();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — class check (exec)',
    source:
      'class Cl {\n  static #privateStaticMethod() {\n    return 1017;\n  }\n\n  publicMethod(checked) {\n    return checked.#privateStaticMethod();\n  }\n}\n\nconst cl = new Cl();\nexpect(cl.publicMethod(Cl)).toBe(1017);',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — class check (input)',
    source:
      'class Cl {\n  static #privateStaticMethod() { }\n\n  publicMethod(checked) {\n    return checked.#privateStaticMethod();\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — class expression (input)',
    source:
      'console.log(class A {\n  static #foo() {}\n\n  method() {\n    this.#foo();\n  }\n});\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — exfiltrated (exec)',
    source:
      'let exfiltrated;\n\nclass Cl {\n  static #privateStaticMethod() {\n    return 1017;\n  }\n\n  constructor() {\n    if (exfiltrated === undefined) {\n        exfiltrated = Cl.#privateStaticMethod;\n    }\n    expect(exfiltrated).toStrictEqual(Cl.#privateStaticMethod);\n  }\n}\n\nnew Cl();\n// check for private method function object equality\nnew Cl();\n\nexpect(exfiltrated()).toEqual(1017);',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — exfiltrated (input)',
    source:
      'let exfiltrated;\n\nclass Cl {\n  static #privateStaticMethod() {\n    return 1017;\n  }\n\n  constructor() {\n    if (exfiltrated === undefined) {\n        exfiltrated = Cl.#privateStaticMethod;\n    }\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — generator (exec)',
    source:
      'class Cl {\n  static *#foo() {\n    yield 2;\n    return 3;\n  }\n\n  test() {\n    return Cl.#foo();\n  }\n}\n\nconst val = new Cl().test();\nexpect(val.next()).toEqual({ value: 2, done: false });\nexpect(val.next()).toEqual({ value: 3, done: true });\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — generator (input)',
    source:
      'class Cl {\n  static *#foo() {\n    yield 2;\n    return 3;\n  }\n\n  test() {\n    return Cl.#foo();\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — preserve comments (input)',
    source: 'class C {\n  /* before a */\n  static #a() {};\n  /* after a */\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — reassignment (exec)',
    source:
      'class Cl {\n  static #privateStaticMethod() { }\n\n  constructor() {\n    expect(() => Cl.#privateStaticMethod = null).toThrow(TypeError);\n  }\n}\n\nnew Cl();',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — reassignment (input)',
    source:
      'class Cl {\n  static #privateStaticMethod() { }\n\n  constructor() {\n    Cl.#privateStaticMethod = null;\n  }\n}\n\nnew Cl();',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — scopable (exec)',
    source:
      'class Cl {\n  static #privateMethodA() {\n    const i = 40;\n    return i;\n  }\n\n  static #privateMethodB() {\n    const i = 2;\n    return i;\n  }\n\n  publicMethod() {\n    return Cl.#privateMethodA() + Cl.#privateMethodB();\n  }\n}\n\nexpect((new Cl).publicMethod()).toEqual(42);',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — super (exec)',
    source:
      "class Base {\n  static basePublicStaticMethod() {\n    return 'good';\n  }\n}\n\nclass Sub extends Base {\n  static basePublicStaticMethod() {\n    return 'bad';\n  }\n\n  static #subStaticPrivateMethod() {\n    return super.basePublicStaticMethod();\n  }\n\n  static check() {\n    return Sub.#subStaticPrivateMethod();\n  }\n}\n\nexpect(Sub.check()).toEqual('good');\n",
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — super (input)',
    source:
      "class Base {\n  static basePublicStaticMethod() {\n    return 'good';\n  }\n}\n\nclass Sub extends Base {\n  static basePublicStaticMethod() {\n    return 'bad';\n  }\n\n  static #subStaticPrivateMethod() {\n    return super.basePublicStaticMethod();\n  }\n\n  static check() {\n    Sub.#subStaticPrivateMethod();\n  }\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — this (exec)',
    source:
      'class A {\n  static get a() { return 1 }\n}\n\nclass B extends A {\n  static get b() { return 2 }\n\n  static #getA() { return super.a }\n  static #getB() { return this.b }\n\n  static extract() {\n    return [this.#getA, this.#getB];\n  }\n}\n\nconst [getA, getB] = B.extract();\nexpect(getA.call({ a: 3 })).toBe(1);\nexpect(getB.call({ b: 4 })).toBe(4);',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method loose — this (input)',
    source:
      'class A {\n  static get a() { return 1 }\n}\n\nclass B extends A {\n  static get b() { return 2 }\n\n  static #getA() { return super.a }\n  static #getB() { return this.b }\n\n  static extract() {\n    return [this.#getA, this.#getB];\n  }\n}\n\nconst [getA, getB] = B.extract();',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method — basic (exec)',
    source:
      'const privateStaticValue = 1017;\n\nclass Cl {\n  static staticMethod2() {\n    return Cl.#privateStaticMethod();\n  }\n\n  static #privateStaticMethod() {\n    return privateStaticValue;\n  }\n\n  static staticMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  static privateStaticMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  publicMethod() {\n    return Cl.#privateStaticMethod();\n  }\n\n  constructor() {\n    this.instanceField = Cl.#privateStaticMethod();\n  }\n}\n\nexpect((new Cl).publicMethod()).toEqual(privateStaticValue);\nexpect((new Cl).instanceField).toEqual(privateStaticValue);\nexpect(Cl.privateStaticMethod()).toEqual(privateStaticValue);\nexpect(Cl.staticMethod()).toEqual(privateStaticValue);\nexpect(Cl.staticMethod2()).toEqual(privateStaticValue);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method — read only (exec)',
    source:
      'class A {\n  static #method() {}\n\n  run() {\n    expect(() => A.#method = 2).toThrow(TypeError);\n    expect(() => ([A.#method] = [2])).toThrow(TypeError);\n  }\n}\n\n\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method — read only (input)',
    source:
      'class A {\n  static #method() {}\n\n  run() {\n    A.#method = 2;\n    ([A.#method] = [2]);\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method — tagged template (exec)',
    source:
      'class Foo {\n  static #tag() {\n    return this;\n  }\n\n  static getReceiver() {\n    return this.#tag``;\n  }\n}\n\nexpect(Foo.getReceiver()).toBe(Foo);',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'private static method — tagged template (input)',
    source: 'class Foo {\n  static #tag() {\n    this.#tag``;\n  }\n}\nnew Foo();',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — access in static field initializer (exec)',
    source:
      'expect((() => {\n  let r;\n  class C {\n    static #_ = new C;\n    static get #p() { return 0 };\n    constructor() {\n      r = C.#p;\n    }\n  }\n  return r;\n})()).toBe(0);\n\nexpect((() => {\n  let r;\n  class C {\n    static #_ = new C;\n    static set #p(v) { r = v; };\n    constructor() {\n      C.#p = 0;\n    }\n  }\n  return r;\n})()).toBe(0);\n\nexpect((() => {\n  let r;\n  class C {\n    static #_ = new C;\n    static set #p(v) { r = v; };\n    constructor() {\n      for (C.#p of [0]);\n    }\n  }\n  return r;\n})()).toBe(0);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
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
    title: 'static accessors loose — basic (exec)',
    source:
      'class Cl {\n  static #PRIVATE_STATIC_FIELD = "top secret string";\n\n  static get #privateStaticFieldValue() {\n    return Cl.#PRIVATE_STATIC_FIELD;\n  }\n\n  static set #privateStaticFieldValue(newValue) {\n    Cl.#PRIVATE_STATIC_FIELD = `Updated: ${newValue}`;\n  }\n\n  static getValue() {\n    return Cl.#privateStaticFieldValue;\n  }\n\n  static setValue() {\n    Cl.#privateStaticFieldValue = "dank";\n  }\n}\n\nexpect(Cl.getValue()).toEqual("top secret string");\nCl.setValue();\nexpect(Cl.getValue()).toEqual("Updated: dank");',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — basic (input)',
    source:
      'class Cl {\n  static #PRIVATE_STATIC_FIELD = "top secret string";\n\n  static get #privateStaticFieldValue() {\n    return Cl.#PRIVATE_STATIC_FIELD;\n  }\n\n  static set #privateStaticFieldValue(newValue) {\n    Cl.#PRIVATE_STATIC_FIELD = `Updated: ${newValue}`;\n  }\n\n  static getValue() {\n    return Cl.#privateStaticFieldValue;\n  }\n\n  static setValue() {\n    Cl.#privateStaticFieldValue = "dank";\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — destructure set (exec)',
    source:
      'class C {\n  static set #p(v) { C.#q = v }\n  static #q;\n  constructor() {\n    ([C.#p] = [0]);\n    expect(C.#q).toBe(0);\n  }\n}\n\nnew C;\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — destructure set (input)',
    source:
      'class C {\n  static set #p(v) { C.#q = v }\n  static #q;\n  constructor() {\n    ([C.#p] = [0]);\n  }\n}\n\nnew C;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — get only setter (exec)',
    source:
      'class Cl {\n  static #PRIVATE_STATIC_FIELD = 0;\n\n  static set #privateStaticFieldValue(newValue) {\n    Cl.#PRIVATE_STATIC_FIELD = newValue;\n  }\n\n  static getPrivateStaticFieldValue() {\n    return Cl.#privateStaticFieldValue;\n  }\n}\n\nexpect(Cl.getPrivateStaticFieldValue()).toBeUndefined();',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — get only setter (input)',
    source:
      'class Cl {\n  static #PRIVATE_STATIC_FIELD = 0;\n\n  static set #privateStaticFieldValue(newValue) {\n    Cl.#PRIVATE_STATIC_FIELD = newValue;\n  }\n\n  static getPrivateStaticFieldValue() {\n    return Cl.#privateStaticFieldValue;\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — preserve comments (input)',
    source:
      'class C {\n  /* before get a */\n  static get #a() { return 42 };\n  /* after get a */\n\n  /* before set a */\n  static set #a(v) {}\n  /* after set a */\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — set only getter (exec)',
    source:
      'class Cl {\n  static #privateField = 0;\n\n  static get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  constructor() {\n    expect(() => Cl.#privateFieldValue = 1).toThrow(TypeError);\n    expect(() => ([Cl.#privateFieldValue] = [1])).toThrow(TypeError);\n  }\n}\n\nconst cl = new Cl();\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
          },
          helpers: {
            mode: 'runtime',
            moduleName: '@babel/runtime',
            version: '7.29.7',
          },
        },
        output: expectedOutputs[92],
      },
    ],
  },
  {
    title: 'static accessors loose — set only getter (input)',
    source:
      'class Cl {\n  static #privateField = 0;\n\n  static get #privateFieldValue() {\n    return this.#privateField;\n  }\n\n  constructor() {\n    Cl.#privateFieldValue = 1;\n    ([Cl.#privateFieldValue] = [1]);\n  }\n}\n\nconst cl = new Cl();\n\n',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — updates (exec)',
    source:
      'class Cl {\n  static #privateField = "top secret string";\n  static publicField = "not secret string";\n\n  static get #privateFieldValue() {\n    return Cl.#privateField;\n  }\n\n  static set #privateFieldValue(newValue) {\n    Cl.#privateField = newValue;\n  }\n\n  static publicGetPrivateField() {\n    return Cl.#privateFieldValue;\n  }\n\n  static publicSetPrivateField(newValue) {\n    Cl.#privateFieldValue = newValue;\n  }\n\n  static get publicFieldValue() {\n    return Cl.publicField;\n  }\n\n  static set publicFieldValue(newValue) {\n    Cl.publicField = newValue;\n  }\n\n  static testUpdates() {\n    Cl.#privateField = 0;\n    Cl.publicField = 0;\n    Cl.#privateFieldValue = Cl.#privateFieldValue++;\n    Cl.publicFieldValue = Cl.publicFieldValue++;\n    expect(Cl.#privateField).toEqual(Cl.publicField);\n\n    ++Cl.#privateFieldValue;\n    ++Cl.publicFieldValue;\n    expect(Cl.#privateField).toEqual(Cl.publicField);\n\n    Cl.#privateFieldValue += 1;\n    Cl.publicFieldValue += 1;\n    expect(Cl.#privateField).toEqual(Cl.publicField);\n  }\n}\n\nCl.testUpdates();',
    filename: 'exec.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors loose — updates (input)',
    source:
      'class Cl {\n  static #privateField = "top secret string";\n  static publicField = "not secret string";\n\n  static get #privateFieldValue() {\n    return Cl.#privateField;\n  }\n\n  static set #privateFieldValue(newValue) {\n    Cl.#privateField = newValue;\n  }\n\n  static publicGetPrivateField() {\n    return Cl.#privateFieldValue;\n  }\n\n  static publicSetPrivateField(newValue) {\n    Cl.#privateFieldValue = newValue;\n  }\n\n  static get publicFieldValue() {\n    return Cl.publicField;\n  }\n\n  static set publicFieldValue(newValue) {\n    Cl.publicField = newValue;\n  }\n\n  static testUpdates() {\n    Cl.#privateField = 0;\n    Cl.publicField = 0;\n    Cl.#privateFieldValue = Cl.#privateFieldValue++;\n    Cl.publicFieldValue = Cl.publicFieldValue++;\n\n    ++Cl.#privateFieldValue;\n    ++Cl.publicFieldValue;\n\n    Cl.#privateFieldValue += 1;\n    Cl.publicFieldValue += 1;\n\n    Cl.#privateFieldValue = -(Cl.#privateFieldValue ** Cl.#privateFieldValue);\n    Cl.publicFieldValue = -(Cl.publicFieldValue ** Cl.publicFieldValue);\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
    title: 'static accessors — tagged template (input)',
    source:
      'class Foo {\n  static get #tag() {\n    return function() { return this; };\n  }\n  \n  static test() {\n    const receiver = this.#tag``;\n    expect(receiver).toBe(this);\n  }\n}',
    filename: 'input.js',
    modes: [
      {
        title: 'loose',
        options: {
          transforms: {
            privateMethods: true,
            classProperties: {
              loose: false,
            },
            privatePropertyInObject: true,
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
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
