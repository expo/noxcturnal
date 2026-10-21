import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'accessors loose — basic (exec)',
    source: `class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
  }
}

const cl = new Cl();

expect(cl.publicGetPrivateField()).toEqual("top secret string");

cl.publicSetPrivateField("new secret string");
expect(cl.publicGetPrivateField()).toEqual("new secret string");

`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 'top secret string',
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = 'not secret string';
  };
  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();
expect(cl.publicGetPrivateField()).toEqual('top secret string');
cl.publicSetPrivateField('new secret string');
expect(cl.publicGetPrivateField()).toEqual('new secret string');`,
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
      },
    ],
  },
  {
    title: 'accessors loose — basic (input)',
    source: `class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 'top secret string',
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = 'not secret string';
  };
  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — class binding (exec)',
    source: `class A {
  get #getA() { return A };
  get getA() {
    return this.#getA;
  }
}

const oldA = A;
A = null;

expect(new oldA().getA).toBe(oldA);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let A = (() => {
  'use strict';
  var _getA = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_getA');
  function _initialize() {
    Object.defineProperty(this, _getA, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return A;
      },
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A.prototype, 'getA', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _getA)[_getA];
      },
      'name',
      {
        value: 'get getA',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
const oldA = A;
A = null;
expect(new oldA().getA).toBe(oldA);`,
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
      },
    ],
  },
  {
    title: 'accessors loose — class binding (input)',
    source: `class A {
  get #getA() { return A };
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
  var _getA = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_getA');
  function _initialize() {
    Object.defineProperty(this, _getA, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return A;
      },
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — get only setter (exec)',
    source: `class Cl {
  #privateField = 0;

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  constructor() {
    expect(this.#privateFieldValue).toBeUndefined();
  }
}

const cl = new Cl();
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    expect(
      _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue],
    ).toBeUndefined();
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — get only setter (input)',
    source: `class Cl {
  #privateField = 0;

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  constructor() {
    this.publicField = this.#privateFieldValue;
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
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — helper (exec)',
    source: `let foo;
class Cl {
  set #foo(v) { return 1 }
  test() {
    foo = this.#foo = 2;
  }
}

new Cl().test();

expect(foo).toBe(2);`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let foo;
let Cl = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_foo');
  function _initialize() {
    Object.defineProperty(this, _foo, {
      set: function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 1;
      },
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Cl.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        foo = _classPrivateFieldLooseBase(this, _foo)[_foo] = 2;
      },
      'name',
      {
        value: 'test',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
new Cl().test();
expect(foo).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'accessors loose — preserve comments (input)',
    source: `class C {
  /* before get a */
  get #a() { return 42 };
  /* after get a */

  /* before set a */
  set #a(v) {}
  /* after set a */
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
let C = (() => {
  'use strict';
  var _a = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_a');
  function _initialize() {
    /* before get a */
    Object.defineProperty(this, _a, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 42;
      },
      set: function (v) {
        /* after get a */
        /* before set a */
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
  }
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(C, 'prototype', { writable: false });
  return C;
  /* after set a */
})();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — reassignment (exec)',
    source: `let counter = 0;
class Foo {
  constructor() {
    this.#privateFieldValue = ++counter;
  }

  get #privateFieldValue() {
    return 42;
  }
}

expect(() => new Foo).toThrow();
expect(counter).toBe(1);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let counter = 0;
let Foo = (() => {
  'use strict';
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 42;
      },
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = ++counter;
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
expect(() => new Foo()).toThrow();
expect(counter).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'accessors loose — reassignment (input)',
    source: `let counter = 0;
class Foo {
  constructor() {
    this.#privateFieldValue = ++counter;
  }

  get #privateFieldValue() {
    return 42;
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
let counter = 0;
let Foo = (() => {
  'use strict';
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 42;
      },
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = ++counter;
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — set only getter (exec)',
    source: `class Cl {
  #privateField = 0;

  get #privateFieldValue() {
    return this.#privateField;
  }

  constructor() {
    expect(() => this.#privateFieldValue = 1).toThrow(TypeError);
    expect(() => ([this.#privateFieldValue] = [1])).toThrow(TypeError);
  }
}

const cl = new Cl();
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    expect(
      () => (_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = 1),
    ).toThrow(TypeError);
    expect(
      () => ([_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]] = [1]),
    ).toThrow(TypeError);
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — set only getter (input)',
    source: `class Cl {
  #privateField = 0;

  get #privateFieldValue() {
    return this.#privateField;
  }

  constructor() {
    this.#privateFieldValue = 1;
    ([this.#privateFieldValue] = [1]);
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
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = 1;
    [_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]] = [1];
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — updates (exec)',
    source: `class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
  }

  get publicFieldValue() {
    return this.publicField;
  }

  set publicFieldValue(newValue) {
    this.publicField = newValue;
  }

  testUpdates() {
    this.#privateField = 0;
    this.publicField = 0;
    this.#privateFieldValue = this.#privateFieldValue++;
    this.publicFieldValue = this.publicFieldValue++;
    expect(this.#privateField).toEqual(this.publicField);

    ++this.#privateFieldValue;
    ++this.publicFieldValue;
    expect(this.#privateField).toEqual(this.publicField);

    this.#privateFieldValue += 1;
    this.publicFieldValue += 1;
    expect(this.#privateField).toEqual(this.publicField);
  }
}

const cl = new Cl();
cl.testUpdates();
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 'top secret string',
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = 'not secret string';
  };
  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicFieldValue', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return this.publicField;
      },
      'name',
      {
        value: 'get publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicFieldValue', {
    set: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.publicField = newValue;
      },
      'name',
      {
        value: 'set publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'testUpdates', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = 0;
        this.publicField = 0;
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] =
          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]++;
        this.publicFieldValue = this.publicFieldValue++;
        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(
          this.publicField,
        );
        ++_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
        ++this.publicFieldValue;
        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(
          this.publicField,
        );
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] += 1;
        this.publicFieldValue += 1;
        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(
          this.publicField,
        );
      },
      'name',
      {
        value: 'testUpdates',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();
cl.testUpdates();`,
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
      },
    ],
  },
  {
    title: 'accessors loose — updates (input)',
    source: `class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
  }

  get publicFieldValue() {
    return this.publicField;
  }

  set publicFieldValue(newValue) {
    this.publicField = newValue;
  }

  testUpdates() {
    this.#privateField = 0;
    this.publicField = 0;
    this.#privateFieldValue = this.#privateFieldValue++;
    this.publicFieldValue = this.publicFieldValue++;

    ++this.#privateFieldValue;
    ++this.publicFieldValue;

    this.#privateFieldValue += 1;
    this.publicFieldValue += 1;

    this.#privateFieldValue = -(this.#privateFieldValue ** this.#privateFieldValue);
    this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 'top secret string',
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = 'not secret string';
  };
  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicFieldValue', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return this.publicField;
      },
      'name',
      {
        value: 'get publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicFieldValue', {
    set: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.publicField = newValue;
      },
      'name',
      {
        value: 'set publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'testUpdates', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = 0;
        this.publicField = 0;
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] =
          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]++;
        this.publicFieldValue = this.publicFieldValue++;
        ++_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
        ++this.publicFieldValue;
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] += 1;
        this.publicFieldValue += 1;
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = -(
          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] **
          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]
        );
        this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);
      },
      'name',
      {
        value: 'testUpdates',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors — arguments (exec)',
    source: `class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    expect(arguments.length).toBe(0);
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    expect(arguments.length).toBe(1);
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
  }
}

const cl = new Cl();

expect(cl.publicGetPrivateField()).toEqual("top secret string");

cl.publicSetPrivateField("new secret string");
expect(cl.publicGetPrivateField()).toEqual("new secret string");

`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(arguments.length).toBe(0);
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(arguments.length).toBe(1);
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 'top secret string',
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = 'not secret string';
  };
  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();
expect(cl.publicGetPrivateField()).toEqual('top secret string');
cl.publicSetPrivateField('new secret string');
expect(cl.publicGetPrivateField()).toEqual('new secret string');`,
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
      },
    ],
  },
  {
    title: 'accessors — arguments (input)',
    source: `class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    expect(arguments.length).toBe(0);
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    expect(arguments.length).toBe(1);
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
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
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(arguments.length).toBe(0);
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(arguments.length).toBe(1);
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 'top secret string',
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = 'not secret string';
  };
  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors — destructuring (input)',
    source: `class A {
  set #setter(v) {}
  get #getter() {}

  m() {
    [this.#setter] = [1];
    [this.#getter] = [1];
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
  var _setter = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_setter');
  var _getter = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_getter');
  function _initialize() {
    Object.defineProperty(this, _setter, {
      set: function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
    Object.defineProperty(this, _getter, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A.prototype, 'm', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        [_classPrivateFieldLooseBase(this, _setter)[_setter]] = [1];
        [_classPrivateFieldLooseBase(this, _getter)[_getter]] = [1];
      },
      'name',
      {
        value: 'm',
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
      },
    ],
  },
  {
    title: 'accessors — get only setter (exec)',
    source: `class Cl {
  #privateField = 0;

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  constructor() {
    expect(() => this.#privateFieldValue).toThrow(TypeError);
  }
}

const cl = new Cl();
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    expect(() => _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]).toThrow(
      TypeError,
    );
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();`,
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
      },
    ],
  },
  {
    title: 'accessors — reassignment (exec)',
    source: `let results = [];
class Foo {
  constructor() {
    this.self.#privateFieldValue = results.push(2);
  }

  get self() {
    results.push(1);
    return this;
  }

  get #privateFieldValue() {
    return 42;
  }
}

expect(() => new Foo).toThrow(TypeError);
expect(results).toStrictEqual([1, 2]);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let results = [];
let Foo = (() => {
  'use strict';
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 42;
      },
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue] =
      results.push(2);
  };
  Object.defineProperty(Foo.prototype, 'self', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        results.push(1);
        return this;
      },
      'name',
      {
        value: 'get self',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
expect(() => new Foo()).toThrow(TypeError);
expect(results).toStrictEqual([1, 2]);`,
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
      },
    ],
  },
  {
    title: 'accessors — reassignment (input)',
    source: `let results = [];
class Foo {
  constructor() {
    this.self.#privateFieldValue = results.push(2);
  }

  get self() {
    results.push(1);
    return this;
  }

  get #privateFieldValue() {
    return 42;
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
let results = [];
let Foo = (() => {
  'use strict';
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 42;
      },
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue] =
      results.push(2);
  };
  Object.defineProperty(Foo.prototype, 'self', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        results.push(1);
        return this;
      },
      'name',
      {
        value: 'get self',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors — set only getter (exec)',
    source: `class Cl {
  #privateField = 0;
  counter = 0;

  get #privateFieldValue() {
    return this.#privateField;
  }

  get self() {
    this.counter++;
    return this;
  }

  constructor() {
    expect(() => this.self.#privateFieldValue = 1).toThrow(TypeError);
    expect(this.counter).toBe(1);
    expect(() => ([this.self.#privateFieldValue] = [1])).toThrow(TypeError);
    expect(this.counter).toBe(2);
  }
}

const cl = new Cl();
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(this, 'counter', {
      value: 0,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    expect(
      () => (_classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue] = 1),
    ).toThrow(TypeError);
    expect(this.counter).toBe(1);
    expect(
      () =>
        ([_classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue]] = [1]),
    ).toThrow(TypeError);
    expect(this.counter).toBe(2);
  };
  Object.defineProperty(Cl.prototype, 'self', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.counter++;
        return this;
      },
      'name',
      {
        value: 'get self',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();`,
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
      },
    ],
  },
  {
    title: 'accessors — set only getter (input)',
    source: `class Cl {
  #privateField = 0;
  counter = 0;

  get #privateFieldValue() {
    return this.#privateField;
  }

  get self() {
    this.counter++;
    return this;
  }

  constructor() {
    this.self.#privateFieldValue = 1
    ([this.self.#privateFieldValue] = [1]);
  }
}

const cl = new Cl();
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(this, 'counter', {
      value: 0,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue] = 1(
      ([_classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue]] = [1]),
    );
  };
  Object.defineProperty(Cl.prototype, 'self', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.counter++;
        return this;
      },
      'name',
      {
        value: 'get self',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();`,
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
      },
    ],
  },
  {
    title: 'accessors — tagged template (exec)',
    source: `class Foo {
  get #tag() {
    return function() { return this; };
  }
\x20\x20
  constructor() {
    const receiver = this.#tag\`\`;
    expect(receiver).toBe(this);
  }
}`,
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
  function _initialize() {
    Object.defineProperty(this, _tag, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return function () {
          return this;
        };
      },
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    const receiver = _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
    expect(receiver).toBe(this);
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'accessors — tagged template (input)',
    source: `class Foo {
  get #tag() {
    return () => this;
  }

  constructor() {
    this.#tag\`\`;
  }
}

new Foo();`,
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
  var _tag = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_tag');
  function _initialize() {
    Object.defineProperty(this, _tag, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return () => this;
      },
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
new Foo();`,
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
      },
    ],
  },
  {
    title: 'accessors — updates bigint (exec)',
    source: `class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
  }

  get publicFieldValue() {
    return this.publicField;
  }

  set publicFieldValue(newValue) {
    this.publicField = newValue;
  }

  testUpdates() {
    this.#privateField = 0n;
    this.publicField = 0n;
    this.#privateFieldValue = this.#privateFieldValue++;
    this.publicFieldValue = this.publicFieldValue++;
    expect(this.#privateField).toEqual(this.publicField);

    ++this.#privateFieldValue;
    ++this.publicFieldValue;
    expect(this.#privateField).toEqual(this.publicField);

    this.#privateFieldValue += 1n;
    this.publicFieldValue += 1n;
    expect(this.#privateField).toEqual(this.publicField);
  }
}

const cl = new Cl();
cl.testUpdates();
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 'top secret string',
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = 'not secret string';
  };
  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicFieldValue', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return this.publicField;
      },
      'name',
      {
        value: 'get publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicFieldValue', {
    set: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.publicField = newValue;
      },
      'name',
      {
        value: 'set publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'testUpdates', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = 0n;
        this.publicField = 0n;
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] =
          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]++;
        this.publicFieldValue = this.publicFieldValue++;
        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(
          this.publicField,
        );
        ++_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
        ++this.publicFieldValue;
        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(
          this.publicField,
        );
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] += 1n;
        this.publicFieldValue += 1n;
        expect(_classPrivateFieldLooseBase(this, _privateField)[_privateField]).toEqual(
          this.publicField,
        );
      },
      'name',
      {
        value: 'testUpdates',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const cl = new Cl();
cl.testUpdates();`,
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
      },
    ],
  },
  {
    title: 'accessors — updates bigint (input)',
    source: `class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
  }

  get publicFieldValue() {
    return this.publicField;
  }

  set publicFieldValue(newValue) {
    this.publicField = newValue;
  }

  testUpdates() {
    this.#privateField = 0n;
    this.publicField = 0n;
    this.#privateFieldValue = this.#privateFieldValue++;
    this.publicFieldValue = this.publicFieldValue++;

    ++this.#privateFieldValue;
    ++this.publicFieldValue;

    this.#privateFieldValue += 1n;
    this.publicFieldValue += 1n;

    this.#privateFieldValue = -(this.#privateFieldValue ** this.#privateFieldValue);
    this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 'top secret string',
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = 'not secret string';
  };
  Object.defineProperty(Cl.prototype, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicFieldValue', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return this.publicField;
      },
      'name',
      {
        value: 'get publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicFieldValue', {
    set: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.publicField = newValue;
      },
      'name',
      {
        value: 'set publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'testUpdates', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = 0n;
        this.publicField = 0n;
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] =
          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]++;
        this.publicFieldValue = this.publicFieldValue++;
        ++_classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
        ++this.publicFieldValue;
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] += 1n;
        this.publicFieldValue += 1n;
        _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = -(
          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] **
          _classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue]
        );
        this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);
      },
      'name',
      {
        value: 'testUpdates',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption constantSuper — private method super (input)',
    source: `class Base {
  superMethod() {
    return 'good';
  }
}

class Sub extends Base {
  superMethod() {
    return 'bad';
  }

  #privateMethod() {
    return super.superMethod();
  }

  publicMethod() {
    return this.#privateMethod();
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
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
class Base {
  superMethod() {
    return 'good';
  }
}
let Sub = (__nox_super_57_239 => {
  'use strict';
  var _privateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Sub_privateMethod',
  );
  var _privateMethod15 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return _get(Object.getPrototypeOf(Sub.prototype), 'superMethod', this).call(this);
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethod, { value: _privateMethod15 });
  }
  const Sub = function Sub() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Sub), arguments, new.target || Sub);
    (function () {
      _initialize.call(this);
    }).call(_this);
    return _this;
  };
  if (__nox_super_57_239 !== null && typeof __nox_super_57_239 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Sub.prototype = Object.create(__nox_super_57_239 && __nox_super_57_239.prototype, {
    constructor: {
      value: Sub,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_57_239);
  else Sub.__proto__ = __nox_super_57_239;
  Object.defineProperty(Sub.prototype, 'superMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'bad';
      },
      'name',
      {
        value: 'superMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Sub.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod]();
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Sub, 'prototype', { writable: false });
  return Sub;
})(Base);`,
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
      },
    ],
  },
  {
    title: 'duplicated names — get get (input)',
    source: `class Cl {
  #privateField = 0;
\x20\x20
  get #getSet() {
    return this.#privateField;
  }

  get #getSet() {
    return this.#privateField;
  }
}`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'duplicated names — get method (input)',
    source: `class Cl {
  #privateField = 0;
\x20\x20
  get #foo() {
    return this.#privateField;
  }

  #foo() {
    return 'foo';
  }
}`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'duplicated names — get set (input)',
    source: `class Cl {
  #privateField = 0;

  get #getSet() {
    return this.#privateField;
  }
\x20\x20
  set #getSet(newValue) {
    this.#privateField = newValue;
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _getSet = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_getSet');
  function _initialize() {
    Object.defineProperty(this, _getSet, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'duplicated names — method get (input)',
    source: `class Cl {
  #privateField = 0;

  #foo() {
    return 'foo';
  }

  get #foo() {
    return this.#privateField;
  }
}`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'duplicated names — method method (input)',
    source: `class Cl {
  #dank() {
    return 'foo';
  }

  #dank() {
    return 'foo';
  }

}`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'duplicated names — method set (input)',
    source: `class Cl {
  #privateField = 0;

  #foo() {
    return 'foo';
  }

  set #foo(newValue) {
    this.#privateField = newValue;
  }
}`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'duplicated names — set get (input)',
    source: `class Cl {
  #privateField = 0;
\x20\x20
  set #getSet(newValue) {
    this.#privateField = newValue;
  }

  get #getSet() {
    return this.#privateField;
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _getSet = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_getSet');
  function _initialize() {
    Object.defineProperty(this, _getSet, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
      },
      set: function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
      },
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0,
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'duplicated names — set method (input)',
    source: `class Cl {
  #privateField = 0;

  set #foo(newValue) {
    this.#privateField = newValue;
  }

  #foo() {
    return 'foo';
  }
}`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'duplicated names — set set (input)',
    source: `class Cl {
  #privateField = 0;
\x20\x20
  set #getSet(newValue) {
    return this.#privateField;
  }

  set #getSet(newValue) {
    return this.#privateField;
  }
}`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'misc — multiple (input)',
    source: `class A {
  #method() {}

  get #getter() {}

  set #setter(v) {}

  get #getset() {}
  set #getset(v) {}

  constructor() {
    this.#method();
    this.#getter;
    this.#setter = 1;
    this.#getset;
    this.#getset = 2;
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
  var _getset = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_getset');
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_method');
  var _getter = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_getter');
  var _setter = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_setter');
  var _privateMethod19 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _method, { value: _privateMethod19 });
    Object.defineProperty(this, _getter, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
    Object.defineProperty(this, _setter, {
      set: function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
    Object.defineProperty(this, _getset, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      set: function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this, _method)[_method]();
    _classPrivateFieldLooseBase(this, _getter)[_getter];
    _classPrivateFieldLooseBase(this, _setter)[_setter] = 1;
    _classPrivateFieldLooseBase(this, _getset)[_getset];
    _classPrivateFieldLooseBase(this, _getset)[_getset] = 2;
  };
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — assignment (exec)',
    source: `class Foo {
    constructor() {
      this.publicField = this.#privateMethod();
    }

    #privateMethod() {
      return 42;
    }
  }

  expect((new Foo).publicField).toEqual(42);
`,
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
  var _privateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateMethod',
  );
  var _privateMethod14 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 42;
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethod, { value: _privateMethod14 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod]();
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
expect(new Foo().publicField).toEqual(42);`,
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
      },
    ],
  },
  {
    title: 'private method loose — assignment (input)',
    source: `class Foo {
  constructor() {
    this.publicField = this.#privateMethod();
  }

  #privateMethod() {
    return 42;
  }
}`,
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
  var _privateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateMethod',
  );
  var _privateMethod14 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 42;
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethod, { value: _privateMethod14 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.publicField = _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod]();
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — async (exec)',
    source: `(function () {
class Cl {
  async #foo() {
    return 2;
  }

  test() {
    return this.#foo();
  }
}

return new Cl().test().then(val => {
  expect(val).toBe(2);
});

});
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
(function () {
  let Cl = (() => {
    'use strict';
    var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_foo');
    var _privateMethod = async function () {
      return 2;
    };
    function _initialize() {
      Object.defineProperty(this, _foo, { value: _privateMethod });
    }
    const Cl = function Cl() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Cl.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _foo)[_foo]();
        },
        'name',
        {
          value: 'test',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Cl, 'prototype', { writable: false });
    return Cl;
  })();
  return new Cl().test().then(val => {
    expect(val).toBe(2);
  });
});`,
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
      },
    ],
  },
  {
    title: 'private method loose — async (input)',
    source: `class Cl {
  async #foo() {
    return 2;
  }

  test() {
    return this.#foo();
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
let Cl = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_foo');
  var _privateMethod = async function () {
    return 2;
  };
  function _initialize() {
    Object.defineProperty(this, _foo, { value: _privateMethod });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Cl.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _foo)[_foo]();
      },
      'name',
      {
        value: 'test',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — before fields (exec)',
    source: `class Cl {
  prop = this.#method(1);

  #priv = this.#method(2);

  #method(x) {
    return x;
  }

  getPriv() {
    return this.#priv;
  }
}

expect(new Cl().prop).toBe(1);
expect(new Cl().getPriv()).toBe(2);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _priv = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_priv');
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_method');
  var _privateMethod17 = function (x) {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return x;
  };
  function _initialize() {
    Object.defineProperty(this, _method, { value: _privateMethod17 });
    Object.defineProperty(this, 'prop', {
      value: _classPrivateFieldLooseBase(this, _method)[_method](1),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(this, _priv, {
      writable: true,
      value: _classPrivateFieldLooseBase(this, _method)[_method](2),
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Cl.prototype, 'getPriv', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _priv)[_priv];
      },
      'name',
      {
        value: 'getPriv',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
expect(new Cl().prop).toBe(1);
expect(new Cl().getPriv()).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'private method loose — before fields (input)',
    source: `class Cl {
  prop = this.#method(1);

  #priv = this.#method(2);

  #method(x) {
    return x;
  }

  getPriv() {
    return this.#priv;
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
let Cl = (() => {
  'use strict';
  var _priv = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_priv');
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_method');
  var _privateMethod17 = function (x) {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return x;
  };
  function _initialize() {
    Object.defineProperty(this, _method, { value: _privateMethod17 });
    Object.defineProperty(this, 'prop', {
      value: _classPrivateFieldLooseBase(this, _method)[_method](1),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(this, _priv, {
      writable: true,
      value: _classPrivateFieldLooseBase(this, _method)[_method](2),
    });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Cl.prototype, 'getPriv', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _priv)[_priv];
      },
      'name',
      {
        value: 'getPriv',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — class binding (exec)',
    source: `class A {
  #getA() { return A };
  getA() {
    return this.#getA();
  }
}

const oldA = A;
A = null;

expect(new oldA().getA()).toBe(oldA);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let A = (() => {
  'use strict';
  var _getA = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_getA');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return A;
  };
  function _initialize() {
    Object.defineProperty(this, _getA, { value: _privateMethod });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A.prototype, 'getA', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _getA)[_getA]();
      },
      'name',
      {
        value: 'getA',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
const oldA = A;
A = null;
expect(new oldA().getA()).toBe(oldA);`,
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
      },
    ],
  },
  {
    title: 'private method loose — class binding (input)',
    source: `class A {
  #getA() { return A };
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
  var _getA = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_getA');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return A;
  };
  function _initialize() {
    Object.defineProperty(this, _getA, { value: _privateMethod });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — class expression (input)',
    source: `console.log(class A {
  #foo() {}

  method() {
    this.#foo();
  }
});
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
console.log(
  (() => {
    'use strict';
    var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_foo');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    function _initialize() {
      Object.defineProperty(this, _foo, { value: _privateMethod });
    }
    const A = function A() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(A.prototype, 'method', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _foo)[_foo]();
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
  })(),
);`,
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
      },
    ],
  },
  {
    title: 'private method loose — context (exec)',
    source: `class Foo {
    constructor(status) {
      this.status = status;
      expect(() => this.#getStatus = null).toThrow(TypeError);
    }

    #getStatus() {
      return this.status;
    }

    getCurrentStatus() {
      return this.#getStatus();
    }

    setCurrentStatus(newStatus) {
      this.status = newStatus;
    }

    getFakeStatus(fakeStatus) {
      const getStatus = this.#getStatus;
      return function () {
        return getStatus.call({ status: fakeStatus });
      };
    }

    getFakeStatusFunc() {
      return {
        status: 'fake-status',
        getFakeStatus: this.#getStatus,
      };
    }
  }

  const f = new Foo('inactive');
  expect(f.getCurrentStatus()).toBe('inactive');

  f.setCurrentStatus('new-status');
  expect(f.getCurrentStatus()).toBe('new-status');

  expect(f.getFakeStatus('fake')()).toBe('fake');
  expect(f.getFakeStatusFunc().getFakeStatus()).toBe('fake-status');
`,
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
  var _getStatus =
    _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_getStatus');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return this.status;
  };
  function _initialize() {
    Object.defineProperty(this, _getStatus, { value: _privateMethod });
  }
  const Foo = function Foo(status) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.status = status;
    expect(() => (_classPrivateFieldLooseBase(this, _getStatus)[_getStatus] = null)).toThrow(
      TypeError,
    );
  };
  Object.defineProperty(Foo.prototype, 'getCurrentStatus', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _getStatus)[_getStatus]();
      },
      'name',
      {
        value: 'getCurrentStatus',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, 'setCurrentStatus', {
    value: Object.defineProperty(
      function (newStatus) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.status = newStatus;
      },
      'name',
      {
        value: 'setCurrentStatus',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, 'getFakeStatus', {
    value: Object.defineProperty(
      function (fakeStatus) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        const getStatus = _classPrivateFieldLooseBase(this, _getStatus)[_getStatus];
        return function () {
          return getStatus.call({ status: fakeStatus });
        };
      },
      'name',
      {
        value: 'getFakeStatus',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, 'getFakeStatusFunc', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return {
          status: 'fake-status',
          getFakeStatus: _classPrivateFieldLooseBase(this, _getStatus)[_getStatus],
        };
      },
      'name',
      {
        value: 'getFakeStatusFunc',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
const f = new Foo('inactive');
expect(f.getCurrentStatus()).toBe('inactive');
f.setCurrentStatus('new-status');
expect(f.getCurrentStatus()).toBe('new-status');
expect(f.getFakeStatus('fake')()).toBe('fake');
expect(f.getFakeStatusFunc().getFakeStatus()).toBe('fake-status');`,
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
      },
    ],
  },
  {
    title: 'private method loose — context (input)',
    source: `class Foo {
  constructor(status) {
    this.status = status;
  }

  #getStatus() {
    return this.status;
  }

  getCurrentStatus() {
    return this.#getStatus();
  }

  setCurrentStatus(newStatus) {
    this.status = newStatus;
  }

  getFakeStatus(fakeStatus) {
    const fakeGetStatus = this.#getStatus;
    return function() {
      return fakeGetStatus.call({ status: fakeStatus });
    };
  }

  getFakeStatusFunc() {
    return {
      status: 'fake-status',
      getFakeStatus: this.#getStatus,
    };
  }
}`,
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
  var _getStatus =
    _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_getStatus');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return this.status;
  };
  function _initialize() {
    Object.defineProperty(this, _getStatus, { value: _privateMethod });
  }
  const Foo = function Foo(status) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    this.status = status;
  };
  Object.defineProperty(Foo.prototype, 'getCurrentStatus', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _getStatus)[_getStatus]();
      },
      'name',
      {
        value: 'getCurrentStatus',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, 'setCurrentStatus', {
    value: Object.defineProperty(
      function (newStatus) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.status = newStatus;
      },
      'name',
      {
        value: 'setCurrentStatus',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, 'getFakeStatus', {
    value: Object.defineProperty(
      function (fakeStatus) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        const fakeGetStatus = _classPrivateFieldLooseBase(this, _getStatus)[_getStatus];
        return function () {
          return fakeGetStatus.call({ status: fakeStatus });
        };
      },
      'name',
      {
        value: 'getFakeStatus',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, 'getFakeStatusFunc', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return {
          status: 'fake-status',
          getFakeStatus: _classPrivateFieldLooseBase(this, _getStatus)[_getStatus],
        };
      },
      'name',
      {
        value: 'getFakeStatusFunc',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — exfiltrated (exec)',
    source: `let exfiltrated;
class Foo {
    #privateMethod() {}

    constructor() {
        if (exfiltrated === undefined) {
            exfiltrated = this.#privateMethod;
        }
        expect(exfiltrated).toStrictEqual(this.#privateMethod);
    }
}

new Foo();
// check for private method function object equality
new Foo();`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let exfiltrated;
let Foo = (() => {
  'use strict';
  var _privateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateMethod',
  );
  var _privateMethod15 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethod, { value: _privateMethod15 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    if (exfiltrated === undefined) {
      exfiltrated = _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod];
    }
    expect(exfiltrated).toStrictEqual(
      _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod],
    );
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
new Foo();
// check for private method function object equality
new Foo();`,
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
      },
    ],
  },
  {
    title: 'private method loose — exfiltrated (input)',
    source: `let exfiltrated;
class Foo {
    #privateMethod() {}

    constructor() {
        if (exfiltrated === undefined) {
            exfiltrated = this.#privateMethod;
        }
    }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let exfiltrated;
let Foo = (() => {
  'use strict';
  var _privateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateMethod',
  );
  var _privateMethod15 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethod, { value: _privateMethod15 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    if (exfiltrated === undefined) {
      exfiltrated = _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod];
    }
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — generator (exec)',
    source: `class Cl {
  *#foo() {
    yield 2;
    return 3;
  }

  test() {
    return this.#foo();
  }
}

const val = new Cl().test();
expect(val.next()).toEqual({ value: 2, done: false });
expect(val.next()).toEqual({ value: 3, done: true });
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_foo');
  var _privateMethod = function* () {
    yield 2;
    return 3;
  };
  function _initialize() {
    Object.defineProperty(this, _foo, { value: _privateMethod });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Cl.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _foo)[_foo]();
      },
      'name',
      {
        value: 'test',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();
const val = new Cl().test();
expect(val.next()).toEqual({
  value: 2,
  done: false,
});
expect(val.next()).toEqual({
  value: 3,
  done: true,
});`,
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
      },
    ],
  },
  {
    title: 'private method loose — generator (input)',
    source: `class Cl {
  *#foo() {
    yield 2;
    return 3;
  }

  test() {
    return this.#foo();
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
let Cl = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_foo');
  var _privateMethod = function* () {
    yield 2;
    return 3;
  };
  function _initialize() {
    Object.defineProperty(this, _foo, { value: _privateMethod });
  }
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Cl.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _foo)[_foo]();
      },
      'name',
      {
        value: 'test',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — preserve comments (input)',
    source: `class C {
  /* before a */
  #a() {};
  /* after a */
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
let C = (() => {
  'use strict';
  var _a = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_a');
  /* before a */
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _a, { value: _privateMethod });
  }
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(C, 'prototype', { writable: false });
  return C;
  /* after a */
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — reassignment (exec)',
    source: `let counter = 0;
class Foo {
  constructor() {
    this.#privateMethod = ++counter;
  }

  #privateMethod() {
    return 42;
  }
}

expect(() => new Foo).toThrow();
expect(counter).toBe(1);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let counter = 0;
let Foo = (() => {
  'use strict';
  var _privateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateMethod',
  );
  var _privateMethod15 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 42;
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethod, { value: _privateMethod15 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod] = ++counter;
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
expect(() => new Foo()).toThrow();
expect(counter).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'private method loose — reassignment (input)',
    source: `let counter = 0;
class Foo {
  constructor() {
    this.#privateMethod = ++counter;
  }

  #privateMethod() {
    return 42;
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
let counter = 0;
let Foo = (() => {
  'use strict';
  var _privateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateMethod',
  );
  var _privateMethod15 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 42;
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethod, { value: _privateMethod15 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod] = ++counter;
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'private method loose — super (exec)',
    source: `class Base {
  superMethod() {
    return 'good';
  }
}

class Sub extends Base {
  superMethod() {
    return 'bad';
  }

  #privateMethod() {
    return super.superMethod();
  }

  publicMethod() {
    return this.#privateMethod();
  }
}

expect((new Sub()).publicMethod()).toEqual('good');
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
class Base {
  superMethod() {
    return 'good';
  }
}
let Sub = (__nox_super_57_239 => {
  'use strict';
  var _privateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Sub_privateMethod',
  );
  var _privateMethod15 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return _get(Object.getPrototypeOf(Sub.prototype), 'superMethod', this).call(this);
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethod, { value: _privateMethod15 });
  }
  const Sub = function Sub() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Sub), arguments, new.target || Sub);
    (function () {
      _initialize.call(this);
    }).call(_this);
    return _this;
  };
  if (__nox_super_57_239 !== null && typeof __nox_super_57_239 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Sub.prototype = Object.create(__nox_super_57_239 && __nox_super_57_239.prototype, {
    constructor: {
      value: Sub,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_57_239);
  else Sub.__proto__ = __nox_super_57_239;
  Object.defineProperty(Sub.prototype, 'superMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'bad';
      },
      'name',
      {
        value: 'superMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Sub.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod]();
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Sub, 'prototype', { writable: false });
  return Sub;
})(Base);
expect(new Sub().publicMethod()).toEqual('good');`,
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
      },
    ],
  },
  {
    title: 'private method — destructuring (input)',
    source: `class A {
  #method() {}

  m() {
    [this.#method] = [1];
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
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_method');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _method, { value: _privateMethod });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A.prototype, 'm', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        [_classPrivateFieldLooseBase(this, _method)[_method]] = [1];
      },
      'name',
      {
        value: 'm',
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
      },
    ],
  },
  {
    title: 'private method — read only (exec)',
    source: `class A {
  counter = 0;
  #method() {}
  self() {
    this.counter++;
    return this;
  }

  constructor() {
    expect(() => this.self().#method = 2).toThrow(TypeError);
    expect(this.counter).toBe(1);
    expect(() => ([this.#method] = [2])).toThrow(TypeError);
  }
}

new A;
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let A = (() => {
  'use strict';
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_method');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _method, { value: _privateMethod });
    Object.defineProperty(this, 'counter', {
      value: 0,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    expect(() => (_classPrivateFieldLooseBase(this.self(), _method)[_method] = 2)).toThrow(
      TypeError,
    );
    expect(this.counter).toBe(1);
    expect(() => ([_classPrivateFieldLooseBase(this, _method)[_method]] = [2])).toThrow(TypeError);
  };
  Object.defineProperty(A.prototype, 'self', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.counter++;
        return this;
      },
      'name',
      {
        value: 'self',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
new A();`,
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
      },
    ],
  },
  {
    title: 'private method — read only (input)',
    source: `class A {
  counter = 0;
  #method() {}
  self() {
    this.counter++;
    return this;
  }

  constructor() {
    this.self().#method = 2;
    ([this.#method] = [2]);
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
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_method');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _method, { value: _privateMethod });
    Object.defineProperty(this, 'counter', {
      value: 0,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this.self(), _method)[_method] = 2;
    [_classPrivateFieldLooseBase(this, _method)[_method]] = [2];
  };
  Object.defineProperty(A.prototype, 'self', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.counter++;
        return this;
      },
      'name',
      {
        value: 'self',
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
      },
    ],
  },
  {
    title: 'private method — reassignment (exec)',
    source: `let results = [];
class Foo {
  constructor() {
    this.self.#privateFieldValue = results.push(2);
  }

  get self() {
    results.push(1);
    return this;
  }

  #privateFieldValue() {
    return 42;
  }
}

expect(() => new Foo).toThrow(TypeError);
expect(results).toStrictEqual([1, 2]);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let results = [];
let Foo = (() => {
  'use strict';
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateFieldValue',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 42;
  };
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, { value: _privateMethod });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue] =
      results.push(2);
  };
  Object.defineProperty(Foo.prototype, 'self', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        results.push(1);
        return this;
      },
      'name',
      {
        value: 'get self',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
expect(() => new Foo()).toThrow(TypeError);
expect(results).toStrictEqual([1, 2]);`,
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
      },
    ],
  },
  {
    title: 'private method — reassignment (input)',
    source: `let results = [];
class Foo {
  constructor() {
    this.self.#privateFieldValue = results.push(2);
  }

  get self() {
    results.push(1);
    return this;
  }

  #privateFieldValue() {
    return 42;
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
let results = [];
let Foo = (() => {
  'use strict';
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateFieldValue',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 42;
  };
  function _initialize() {
    Object.defineProperty(this, _privateFieldValue, { value: _privateMethod });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    _classPrivateFieldLooseBase(this.self, _privateFieldValue)[_privateFieldValue] =
      results.push(2);
  };
  Object.defineProperty(Foo.prototype, 'self', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        results.push(1);
        return this;
      },
      'name',
      {
        value: 'get self',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'private method — scopable (exec)',
    source: `class Foo {
  #privateMethodA() {
    const i = 40;
    return i;
  }

  #privateMethodB() {
    const i = 2;
    return i;
  }

  publicMethod() {
    return this.#privateMethodA() + this.#privateMethodB();
  }
}

expect((new Foo).publicMethod()).toEqual(42);`,
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
  var _privateMethodA = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateMethodA',
  );
  var _privateMethodB = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Foo_privateMethodB',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    const i = 40;
    return i;
  };
  var _privateMethod17 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    const i = 2;
    return i;
  };
  function _initialize() {
    Object.defineProperty(this, _privateMethodA, { value: _privateMethod });
    Object.defineProperty(this, _privateMethodB, { value: _privateMethod17 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return (
          _classPrivateFieldLooseBase(this, _privateMethodA)[_privateMethodA]() +
          _classPrivateFieldLooseBase(this, _privateMethodB)[_privateMethodB]()
        );
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
expect(new Foo().publicMethod()).toEqual(42);`,
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
      },
    ],
  },
  {
    title: 'private method — tagged template (exec)',
    source: `class Foo {
  #tag() {
    return this;
  }
\x20\x20
  constructor() {
    const receiver = this.#tag\`tagged template\`;
    expect(receiver).toBe(this);
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
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return this;
  };
  function _initialize() {
    Object.defineProperty(this, _tag, { value: _privateMethod });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
    const receiver = _classPrivateFieldLooseBase(this, _tag)[_tag]\`tagged template\`;
    expect(receiver).toBe(this);
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
new Foo();`,
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
      },
    ],
  },
  {
    title: 'private method — tagged template (input)',
    source: `class Foo {
  #tag() {
    this.#tag\`\`;
  }
}
new Foo();`,
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
  var _tag = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_tag');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
  };
  function _initialize() {
    Object.defineProperty(this, _tag, { value: _privateMethod });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
new Foo();`,
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
      },
    ],
  },
  {
    title: 'private static method loose — async (input)',
    source: `(function () {
class Cl {
  static async #privateStaticMethod() {
    return 2;
  }

  test() {
    return Cl.#privateStaticMethod();
  }
}

return new Cl().test().then(val => {
  expect(val).toBe(2);
});

});
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
(function () {
  let Cl = (() => {
    'use strict';
    var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
      '__private_Cl_privateStaticMethod',
    );
    var _privateMethod = async function () {
      return 2;
    };
    const Cl = function Cl() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Cl.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
        },
        'name',
        {
          value: 'test',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Cl, 'prototype', { writable: false });
    Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
    return Cl;
  })();
  return new Cl().test().then(val => {
    expect(val).toBe(2);
  });
});`,
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
      },
    ],
  },
  {
    title: 'private static method loose — basic (exec)',
    source: `const privateStaticValue = 1017;

class Cl {
  static staticMethod2() {
    return Cl.#privateStaticMethod();
  }

  static #privateStaticMethod() {
    return privateStaticValue;
  }

  static staticMethod() {
    return Cl.#privateStaticMethod();
  }

  static privateStaticMethod() {
    return Cl.#privateStaticMethod();
  }

  publicMethod() {
    return Cl.#privateStaticMethod();
  }

  constructor() {
    this.instanceField = Cl.#privateStaticMethod();
  }
}

expect((new Cl).publicMethod()).toEqual(privateStaticValue);
// expect((new Cl).instanceField).toEqual(privateStaticValue);
// expect(Cl.privateStaticMethod()).toEqual(privateStaticValue);
// expect(Cl.staticMethod()).toEqual(privateStaticValue);
// expect(Cl.staticMethod2()).toEqual(privateStaticValue);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
const privateStaticValue = 1017;
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return privateStaticValue;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    this.instanceField = _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[
      _privateStaticMethod
    ]();
  };
  Object.defineProperty(Cl, 'staticMethod2', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'staticMethod2',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'staticMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'staticMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'privateStaticMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'privateStaticMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();
expect(new Cl().publicMethod()).toEqual(privateStaticValue);
// expect((new Cl).instanceField).toEqual(privateStaticValue);
// expect(Cl.privateStaticMethod()).toEqual(privateStaticValue);
// expect(Cl.staticMethod()).toEqual(privateStaticValue);
// expect(Cl.staticMethod2()).toEqual(privateStaticValue);`,
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
      },
    ],
  },
  {
    title: 'private static method loose — basic (input)',
    source: `class Cl {
  static staticMethod2() {
    return Cl.#privateStaticMethod();
  }

  static #privateStaticMethod() {
    return 1017;
  }

  static staticMethod() {
    return Cl.#privateStaticMethod();
  }

  static privateStaticMethod() {
    return Cl.#privateStaticMethod();
  }

  publicMethod() {
    return Cl.#privateStaticMethod();
  }

  constructor() {
    this.instanceField = Cl.#privateStaticMethod();
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
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 1017;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    this.instanceField = _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[
      _privateStaticMethod
    ]();
  };
  Object.defineProperty(Cl, 'staticMethod2', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'staticMethod2',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'staticMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'staticMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'privateStaticMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'privateStaticMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'private static method loose — class check (exec)',
    source: `class Cl {
  static #privateStaticMethod() {
    return 1017;
  }

  publicMethod(checked) {
    return checked.#privateStaticMethod();
  }
}

const cl = new Cl();
expect(cl.publicMethod(Cl)).toBe(1017);`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 1017;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function (checked) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(checked, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();
const cl = new Cl();
expect(cl.publicMethod(Cl)).toBe(1017);`,
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
      },
    ],
  },
  {
    title: 'private static method loose — class check (input)',
    source: `class Cl {
  static #privateStaticMethod() { }

  publicMethod(checked) {
    return checked.#privateStaticMethod();
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function (checked) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(checked, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'private static method loose — class expression (input)',
    source: `console.log(class A {
  static #foo() {}

  method() {
    this.#foo();
  }
});
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
console.log(
  (() => {
    'use strict';
    var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_foo');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const A = function A() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(A.prototype, 'method', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _foo)[_foo]();
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
    Object.defineProperty(A, _foo, { value: _privateMethod });
    return A;
  })(),
);`,
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
      },
    ],
  },
  {
    title: 'private static method loose — exfiltrated (exec)',
    source: `let exfiltrated;

class Cl {
  static #privateStaticMethod() {
    return 1017;
  }

  constructor() {
    if (exfiltrated === undefined) {
        exfiltrated = Cl.#privateStaticMethod;
    }
    expect(exfiltrated).toStrictEqual(Cl.#privateStaticMethod);
  }
}

new Cl();
// check for private method function object equality
new Cl();

expect(exfiltrated()).toEqual(1017);`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let exfiltrated;
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 1017;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    if (exfiltrated === undefined) {
      exfiltrated = _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod];
    }
    expect(exfiltrated).toStrictEqual(
      _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod],
    );
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();
new Cl();
// check for private method function object equality
new Cl();
expect(exfiltrated()).toEqual(1017);`,
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
      },
    ],
  },
  {
    title: 'private static method loose — exfiltrated (input)',
    source: `let exfiltrated;

class Cl {
  static #privateStaticMethod() {
    return 1017;
  }

  constructor() {
    if (exfiltrated === undefined) {
        exfiltrated = Cl.#privateStaticMethod;
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
let exfiltrated;
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return 1017;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    if (exfiltrated === undefined) {
      exfiltrated = _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod];
    }
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'private static method loose — generator (exec)',
    source: `class Cl {
  static *#foo() {
    yield 2;
    return 3;
  }

  test() {
    return Cl.#foo();
  }
}

const val = new Cl().test();
expect(val.next()).toEqual({ value: 2, done: false });
expect(val.next()).toEqual({ value: 3, done: true });
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_foo');
  var _privateMethod = function* () {
    yield 2;
    return 3;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _foo)[_foo]();
      },
      'name',
      {
        value: 'test',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _foo, { value: _privateMethod });
  return Cl;
})();
const val = new Cl().test();
expect(val.next()).toEqual({
  value: 2,
  done: false,
});
expect(val.next()).toEqual({
  value: 3,
  done: true,
});`,
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
      },
    ],
  },
  {
    title: 'private static method loose — generator (input)',
    source: `class Cl {
  static *#foo() {
    yield 2;
    return 3;
  }

  test() {
    return Cl.#foo();
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
let Cl = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Cl_foo');
  var _privateMethod = function* () {
    yield 2;
    return 3;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _foo)[_foo]();
      },
      'name',
      {
        value: 'test',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _foo, { value: _privateMethod });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'private static method loose — preserve comments (input)',
    source: `class C {
  /* before a */
  static #a() {};
  /* after a */
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
let C = (() => {
  'use strict';
  var _a = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_a');
  /* before a */
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(C, 'prototype', { writable: false });
  Object.defineProperty(C, _a, { value: _privateMethod });
  return C;
  /* after a */
})();`,
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
      },
    ],
  },
  {
    title: 'private static method loose — reassignment (exec)',
    source: `class Cl {
  static #privateStaticMethod() { }

  constructor() {
    expect(() => Cl.#privateStaticMethod = null).toThrow(TypeError);
  }
}

new Cl();`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    expect(
      () => (_classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod] = null),
    ).toThrow(TypeError);
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();
new Cl();`,
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
      },
    ],
  },
  {
    title: 'private static method loose — reassignment (input)',
    source: `class Cl {
  static #privateStaticMethod() { }

  constructor() {
    Cl.#privateStaticMethod = null;
  }
}

new Cl();`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod] = null;
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();
new Cl();`,
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
      },
    ],
  },
  {
    title: 'private static method loose — scopable (exec)',
    source: `class Cl {
  static #privateMethodA() {
    const i = 40;
    return i;
  }

  static #privateMethodB() {
    const i = 2;
    return i;
  }

  publicMethod() {
    return Cl.#privateMethodA() + Cl.#privateMethodB();
  }
}

expect((new Cl).publicMethod()).toEqual(42);`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateMethodA = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateMethodA',
  );
  var _privateMethodB = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateMethodB',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    const i = 40;
    return i;
  };
  var _privateMethod17 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    const i = 2;
    return i;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return (
          _classPrivateFieldLooseBase(Cl, _privateMethodA)[_privateMethodA]() +
          _classPrivateFieldLooseBase(Cl, _privateMethodB)[_privateMethodB]()
        );
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateMethodA, { value: _privateMethod });
  Object.defineProperty(Cl, _privateMethodB, { value: _privateMethod17 });
  return Cl;
})();
expect(new Cl().publicMethod()).toEqual(42);`,
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
      },
    ],
  },
  {
    title: 'private static method loose — super (exec)',
    source: `class Base {
  static basePublicStaticMethod() {
    return 'good';
  }
}

class Sub extends Base {
  static basePublicStaticMethod() {
    return 'bad';
  }

  static #subStaticPrivateMethod() {
    return super.basePublicStaticMethod();
  }

  static check() {
    return Sub.#subStaticPrivateMethod();
  }
}

expect(Sub.check()).toEqual('good');
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
class Base {
  static basePublicStaticMethod() {
    return 'good';
  }
}
let Sub = (__nox_super_75_310 => {
  'use strict';
  var _subStaticPrivateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Sub_subStaticPrivateMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return _get(Object.getPrototypeOf(Sub), 'basePublicStaticMethod', this).call(this);
  };
  const Sub = function Sub() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Sub), arguments, new.target || Sub);
    return _this;
  };
  if (__nox_super_75_310 !== null && typeof __nox_super_75_310 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Sub.prototype = Object.create(__nox_super_75_310 && __nox_super_75_310.prototype, {
    constructor: {
      value: Sub,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_75_310);
  else Sub.__proto__ = __nox_super_75_310;
  Object.defineProperty(Sub, 'basePublicStaticMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'bad';
      },
      'name',
      {
        value: 'basePublicStaticMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Sub, 'check', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Sub, _subStaticPrivateMethod)[_subStaticPrivateMethod]();
      },
      'name',
      {
        value: 'check',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Sub, 'prototype', { writable: false });
  Object.defineProperty(Sub, _subStaticPrivateMethod, { value: _privateMethod });
  return Sub;
})(Base);
expect(Sub.check()).toEqual('good');`,
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
      },
    ],
  },
  {
    title: 'private static method loose — super (input)',
    source: `class Base {
  static basePublicStaticMethod() {
    return 'good';
  }
}

class Sub extends Base {
  static basePublicStaticMethod() {
    return 'bad';
  }

  static #subStaticPrivateMethod() {
    return super.basePublicStaticMethod();
  }

  static check() {
    Sub.#subStaticPrivateMethod();
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
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
class Base {
  static basePublicStaticMethod() {
    return 'good';
  }
}
let Sub = (__nox_super_75_303 => {
  'use strict';
  var _subStaticPrivateMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Sub_subStaticPrivateMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return _get(Object.getPrototypeOf(Sub), 'basePublicStaticMethod', this).call(this);
  };
  const Sub = function Sub() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Sub), arguments, new.target || Sub);
    return _this;
  };
  if (__nox_super_75_303 !== null && typeof __nox_super_75_303 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Sub.prototype = Object.create(__nox_super_75_303 && __nox_super_75_303.prototype, {
    constructor: {
      value: Sub,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_75_303);
  else Sub.__proto__ = __nox_super_75_303;
  Object.defineProperty(Sub, 'basePublicStaticMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'bad';
      },
      'name',
      {
        value: 'basePublicStaticMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Sub, 'check', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Sub, _subStaticPrivateMethod)[_subStaticPrivateMethod]();
      },
      'name',
      {
        value: 'check',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Sub, 'prototype', { writable: false });
  Object.defineProperty(Sub, _subStaticPrivateMethod, { value: _privateMethod });
  return Sub;
})(Base);`,
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
      },
    ],
  },
  {
    title: 'private static method loose — this (exec)',
    source: `class A {
  static get a() { return 1 }
}

class B extends A {
  static get b() { return 2 }

  static #getA() { return super.a }
  static #getB() { return this.b }

  static extract() {
    return [this.#getA, this.#getB];
  }
}

const [getA, getB] = B.extract();
expect(getA.call({ a: 3 })).toBe(1);
expect(getB.call({ b: 4 })).toBe(4);`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
class A {
  static get a() {
    return 1;
  }
}
let B = (__nox_super_43_229 => {
  'use strict';
  var _getA = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_B_getA');
  var _getB = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_B_getB');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return _get(Object.getPrototypeOf(B), 'a', this);
  };
  var _privateMethod19 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return this.b;
  };
  const B = function B() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(B), arguments, new.target || B);
    return _this;
  };
  if (__nox_super_43_229 !== null && typeof __nox_super_43_229 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  B.prototype = Object.create(__nox_super_43_229 && __nox_super_43_229.prototype, {
    constructor: {
      value: B,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_43_229);
  else B.__proto__ = __nox_super_43_229;
  Object.defineProperty(B, 'b', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 2;
      },
      'name',
      {
        value: 'get b',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(B, 'extract', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return [
          _classPrivateFieldLooseBase(this, _getA)[_getA],
          _classPrivateFieldLooseBase(this, _getB)[_getB],
        ];
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
  Object.defineProperty(B, 'prototype', { writable: false });
  Object.defineProperty(B, _getA, { value: _privateMethod });
  Object.defineProperty(B, _getB, { value: _privateMethod19 });
  return B;
})(A);
const [getA, getB] = B.extract();
expect(getA.call({ a: 3 })).toBe(1);
expect(getB.call({ b: 4 })).toBe(4);`,
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
      },
    ],
  },
  {
    title: 'private static method loose — this (input)',
    source: `class A {
  static get a() { return 1 }
}

class B extends A {
  static get b() { return 2 }

  static #getA() { return super.a }
  static #getB() { return this.b }

  static extract() {
    return [this.#getA, this.#getB];
  }
}

const [getA, getB] = B.extract();`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
class A {
  static get a() {
    return 1;
  }
}
let B = (__nox_super_43_229 => {
  'use strict';
  var _getA = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_B_getA');
  var _getB = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_B_getB');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return _get(Object.getPrototypeOf(B), 'a', this);
  };
  var _privateMethod19 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return this.b;
  };
  const B = function B() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(B), arguments, new.target || B);
    return _this;
  };
  if (__nox_super_43_229 !== null && typeof __nox_super_43_229 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  B.prototype = Object.create(__nox_super_43_229 && __nox_super_43_229.prototype, {
    constructor: {
      value: B,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_43_229);
  else B.__proto__ = __nox_super_43_229;
  Object.defineProperty(B, 'b', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 2;
      },
      'name',
      {
        value: 'get b',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(B, 'extract', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return [
          _classPrivateFieldLooseBase(this, _getA)[_getA],
          _classPrivateFieldLooseBase(this, _getB)[_getB],
        ];
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
  Object.defineProperty(B, 'prototype', { writable: false });
  Object.defineProperty(B, _getA, { value: _privateMethod });
  Object.defineProperty(B, _getB, { value: _privateMethod19 });
  return B;
})(A);
const [getA, getB] = B.extract();`,
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
      },
    ],
  },
  {
    title: 'private static method — basic (exec)',
    source: `const privateStaticValue = 1017;

class Cl {
  static staticMethod2() {
    return Cl.#privateStaticMethod();
  }

  static #privateStaticMethod() {
    return privateStaticValue;
  }

  static staticMethod() {
    return Cl.#privateStaticMethod();
  }

  static privateStaticMethod() {
    return Cl.#privateStaticMethod();
  }

  publicMethod() {
    return Cl.#privateStaticMethod();
  }

  constructor() {
    this.instanceField = Cl.#privateStaticMethod();
  }
}

expect((new Cl).publicMethod()).toEqual(privateStaticValue);
expect((new Cl).instanceField).toEqual(privateStaticValue);
expect(Cl.privateStaticMethod()).toEqual(privateStaticValue);
expect(Cl.staticMethod()).toEqual(privateStaticValue);
expect(Cl.staticMethod2()).toEqual(privateStaticValue);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
const privateStaticValue = 1017;
let Cl = (() => {
  'use strict';
  var _privateStaticMethod = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticMethod',
  );
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return privateStaticValue;
  };
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    this.instanceField = _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[
      _privateStaticMethod
    ]();
  };
  Object.defineProperty(Cl, 'staticMethod2', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'staticMethod2',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'staticMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'staticMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'privateStaticMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'privateStaticMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl.prototype, 'publicMethod', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
      },
      'name',
      {
        value: 'publicMethod',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticMethod, { value: _privateMethod });
  return Cl;
})();
expect(new Cl().publicMethod()).toEqual(privateStaticValue);
expect(new Cl().instanceField).toEqual(privateStaticValue);
expect(Cl.privateStaticMethod()).toEqual(privateStaticValue);
expect(Cl.staticMethod()).toEqual(privateStaticValue);
expect(Cl.staticMethod2()).toEqual(privateStaticValue);`,
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
      },
    ],
  },
  {
    title: 'private static method — read only (exec)',
    source: `class A {
  static #method() {}

  run() {
    expect(() => A.#method = 2).toThrow(TypeError);
    expect(() => ([A.#method] = [2])).toThrow(TypeError);
  }
}


`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let A = (() => {
  'use strict';
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_method');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, 'run', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(() => (_classPrivateFieldLooseBase(A, _method)[_method] = 2)).toThrow(TypeError);
        expect(() => ([_classPrivateFieldLooseBase(A, _method)[_method]] = [2])).toThrow(TypeError);
      },
      'name',
      {
        value: 'run',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  Object.defineProperty(A, _method, { value: _privateMethod });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'private static method — read only (input)',
    source: `class A {
  static #method() {}

  run() {
    A.#method = 2;
    ([A.#method] = [2]);
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
  var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_method');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, 'run', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(A, _method)[_method] = 2;
        [_classPrivateFieldLooseBase(A, _method)[_method]] = [2];
      },
      'name',
      {
        value: 'run',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  Object.defineProperty(A, _method, { value: _privateMethod });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'private static method — tagged template (exec)',
    source: `class Foo {
  static #tag() {
    return this;
  }

  static getReceiver() {
    return this.#tag\`\`;
  }
}

expect(Foo.getReceiver()).toBe(Foo);`,
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
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    return this;
  };
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'getReceiver', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
      },
      'name',
      {
        value: 'getReceiver',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  Object.defineProperty(Foo, _tag, { value: _privateMethod });
  return Foo;
})();
expect(Foo.getReceiver()).toBe(Foo);`,
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
      },
    ],
  },
  {
    title: 'private static method — tagged template (input)',
    source: `class Foo {
  static #tag() {
    this.#tag\`\`;
  }
}
new Foo();`,
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
  var _tag = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_tag');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
  };
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  Object.defineProperty(Foo, _tag, { value: _privateMethod });
  return Foo;
})();
new Foo();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — access in static field initializer (exec)',
    source: `expect((() => {
  let r;
  class C {
    static #_ = new C;
    static get #p() { return 0 };
    constructor() {
      r = C.#p;
    }
  }
  return r;
})()).toBe(0);

expect((() => {
  let r;
  class C {
    static #_ = new C;
    static set #p(v) { r = v; };
    constructor() {
      C.#p = 0;
    }
  }
  return r;
})()).toBe(0);

expect((() => {
  let r;
  class C {
    static #_ = new C;
    static set #p(v) { r = v; };
    constructor() {
      for (C.#p of [0]);
    }
  }
  return r;
})()).toBe(0);
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
expect(
  (() => {
    let r;
    let C = (() => {
      'use strict';
      var _p = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_p');
      var __ = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C__');
      const C = function C() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        r = _classPrivateFieldLooseBase(C, _p)[_p];
      };
      Object.defineProperty(C, 'prototype', { writable: false });
      Object.defineProperty(C, _p, {
        get: function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return 0;
        },
      });
      Object.defineProperty(C, __, {
        writable: true,
        value: new C(),
      });
      return C;
    })();
    return r;
  })(),
).toBe(0);
expect(
  (() => {
    let r;
    let C = (() => {
      'use strict';
      var _p22 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_p');
      var __21 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C__');
      const C = function C() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _classPrivateFieldLooseBase(C, _p22)[_p22] = 0;
      };
      Object.defineProperty(C, 'prototype', { writable: false });
      Object.defineProperty(C, _p22, {
        set: function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          r = v;
        },
      });
      Object.defineProperty(C, __21, {
        writable: true,
        value: new C(),
      });
      return C;
    })();
    return r;
  })(),
).toBe(0);
expect(
  (() => {
    let r;
    let C = (() => {
      'use strict';
      var _p28 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_p');
      var __27 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C__');
      const C = function C() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        for (_classPrivateFieldLooseBase(C, _p28)[_p28] of [0]);
      };
      Object.defineProperty(C, 'prototype', { writable: false });
      Object.defineProperty(C, _p28, {
        set: function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          r = v;
        },
      });
      Object.defineProperty(C, __27, {
        writable: true,
        value: new C(),
      });
      return C;
    })();
    return r;
  })(),
).toBe(0);`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — basic (exec)',
    source: `class Cl {
  static #PRIVATE_STATIC_FIELD = "top secret string";

  static get #privateStaticFieldValue() {
    return Cl.#PRIVATE_STATIC_FIELD;
  }

  static set #privateStaticFieldValue(newValue) {
    Cl.#PRIVATE_STATIC_FIELD = \`Updated: \${newValue}\`;
  }

  static getValue() {
    return Cl.#privateStaticFieldValue;
  }

  static setValue() {
    Cl.#privateStaticFieldValue = "dank";
  }
}

expect(Cl.getValue()).toEqual("top secret string");
Cl.setValue();
expect(Cl.getValue()).toEqual("Updated: dank");`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateStaticFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticFieldValue',
  );
  var _PRIVATE_STATIC_FIELD = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_PRIVATE_STATIC_FIELD',
  );
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl, 'getValue', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];
      },
      'name',
      {
        value: 'getValue',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'setValue', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue] =
          'dank';
      },
      'name',
      {
        value: 'setValue',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticFieldValue, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD];
    },
    set: function (newValue) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] =
        \`Updated: \${newValue}\`;
    },
  });
  Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {
    writable: true,
    value: 'top secret string',
  });
  return Cl;
})();
expect(Cl.getValue()).toEqual('top secret string');
Cl.setValue();
expect(Cl.getValue()).toEqual('Updated: dank');`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — basic (input)',
    source: `class Cl {
  static #PRIVATE_STATIC_FIELD = "top secret string";

  static get #privateStaticFieldValue() {
    return Cl.#PRIVATE_STATIC_FIELD;
  }

  static set #privateStaticFieldValue(newValue) {
    Cl.#PRIVATE_STATIC_FIELD = \`Updated: \${newValue}\`;
  }

  static getValue() {
    return Cl.#privateStaticFieldValue;
  }

  static setValue() {
    Cl.#privateStaticFieldValue = "dank";
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateStaticFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticFieldValue',
  );
  var _PRIVATE_STATIC_FIELD = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_PRIVATE_STATIC_FIELD',
  );
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl, 'getValue', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];
      },
      'name',
      {
        value: 'getValue',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'setValue', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue] =
          'dank';
      },
      'name',
      {
        value: 'setValue',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticFieldValue, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD];
    },
    set: function (newValue) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] =
        \`Updated: \${newValue}\`;
    },
  });
  Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {
    writable: true,
    value: 'top secret string',
  });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — destructure set (exec)',
    source: `class C {
  static set #p(v) { C.#q = v }
  static #q;
  constructor() {
    ([C.#p] = [0]);
    expect(C.#q).toBe(0);
  }
}

new C;
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let C = (() => {
  'use strict';
  var _p = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_p');
  var _q = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_q');
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    [_classPrivateFieldLooseBase(C, _p)[_p]] = [0];
    expect(_classPrivateFieldLooseBase(C, _q)[_q]).toBe(0);
  };
  Object.defineProperty(C, 'prototype', { writable: false });
  Object.defineProperty(C, _p, {
    set: function (v) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(C, _q)[_q] = v;
    },
  });
  Object.defineProperty(C, _q, {
    writable: true,
    value: void 0,
  });
  return C;
})();
new C();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — destructure set (input)',
    source: `class C {
  static set #p(v) { C.#q = v }
  static #q;
  constructor() {
    ([C.#p] = [0]);
  }
}

new C;
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let C = (() => {
  'use strict';
  var _p = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_p');
  var _q = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_q');
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    [_classPrivateFieldLooseBase(C, _p)[_p]] = [0];
  };
  Object.defineProperty(C, 'prototype', { writable: false });
  Object.defineProperty(C, _p, {
    set: function (v) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(C, _q)[_q] = v;
    },
  });
  Object.defineProperty(C, _q, {
    writable: true,
    value: void 0,
  });
  return C;
})();
new C();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — get only setter (exec)',
    source: `class Cl {
  static #PRIVATE_STATIC_FIELD = 0;

  static set #privateStaticFieldValue(newValue) {
    Cl.#PRIVATE_STATIC_FIELD = newValue;
  }

  static getPrivateStaticFieldValue() {
    return Cl.#privateStaticFieldValue;
  }
}

expect(Cl.getPrivateStaticFieldValue()).toBeUndefined();`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateStaticFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticFieldValue',
  );
  var _PRIVATE_STATIC_FIELD = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_PRIVATE_STATIC_FIELD',
  );
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl, 'getPrivateStaticFieldValue', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];
      },
      'name',
      {
        value: 'getPrivateStaticFieldValue',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticFieldValue, {
    set: function (newValue) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] = newValue;
    },
  });
  Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {
    writable: true,
    value: 0,
  });
  return Cl;
})();
expect(Cl.getPrivateStaticFieldValue()).toBeUndefined();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — get only setter (input)',
    source: `class Cl {
  static #PRIVATE_STATIC_FIELD = 0;

  static set #privateStaticFieldValue(newValue) {
    Cl.#PRIVATE_STATIC_FIELD = newValue;
  }

  static getPrivateStaticFieldValue() {
    return Cl.#privateStaticFieldValue;
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateStaticFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateStaticFieldValue',
  );
  var _PRIVATE_STATIC_FIELD = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_PRIVATE_STATIC_FIELD',
  );
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl, 'getPrivateStaticFieldValue', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];
      },
      'name',
      {
        value: 'getPrivateStaticFieldValue',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateStaticFieldValue, {
    set: function (newValue) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] = newValue;
    },
  });
  Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {
    writable: true,
    value: 0,
  });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — preserve comments (input)',
    source: `class C {
  /* before get a */
  static get #a() { return 42 };
  /* after get a */

  /* before set a */
  static set #a(v) {}
  /* after set a */
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
let C = (() => {
  'use strict';
  var _a = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_C_a');
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(C, 'prototype', { writable: false });
  /* before get a */
  Object.defineProperty(C, _a, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 42;
    },
    set: function (v) {
      /* after get a */
      /* before set a */
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    },
  });
  return C;
  /* after set a */
})();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — set only getter (exec)',
    source: `class Cl {
  static #privateField = 0;

  static get #privateFieldValue() {
    return this.#privateField;
  }

  constructor() {
    expect(() => Cl.#privateFieldValue = 1).toThrow(TypeError);
    expect(() => ([Cl.#privateFieldValue] = [1])).toThrow(TypeError);
  }
}

const cl = new Cl();
`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    expect(
      () => (_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = 1),
    ).toThrow(TypeError);
    expect(
      () => ([_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]] = [1]),
    ).toThrow(TypeError);
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateFieldValue, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
    },
  });
  Object.defineProperty(Cl, _privateField, {
    writable: true,
    value: 0,
  });
  return Cl;
})();
const cl = new Cl();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — set only getter (input)',
    source: `class Cl {
  static #privateField = 0;

  static get #privateFieldValue() {
    return this.#privateField;
  }

  constructor() {
    Cl.#privateFieldValue = 1;
    ([Cl.#privateFieldValue] = [1]);
  }
}

const cl = new Cl();

`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = 1;
    [_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]] = [1];
  };
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateFieldValue, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _privateField)[_privateField];
    },
  });
  Object.defineProperty(Cl, _privateField, {
    writable: true,
    value: 0,
  });
  return Cl;
})();
const cl = new Cl();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — updates (exec)',
    source: `class Cl {
  static #privateField = "top secret string";
  static publicField = "not secret string";

  static get #privateFieldValue() {
    return Cl.#privateField;
  }

  static set #privateFieldValue(newValue) {
    Cl.#privateField = newValue;
  }

  static publicGetPrivateField() {
    return Cl.#privateFieldValue;
  }

  static publicSetPrivateField(newValue) {
    Cl.#privateFieldValue = newValue;
  }

  static get publicFieldValue() {
    return Cl.publicField;
  }

  static set publicFieldValue(newValue) {
    Cl.publicField = newValue;
  }

  static testUpdates() {
    Cl.#privateField = 0;
    Cl.publicField = 0;
    Cl.#privateFieldValue = Cl.#privateFieldValue++;
    Cl.publicFieldValue = Cl.publicFieldValue++;
    expect(Cl.#privateField).toEqual(Cl.publicField);

    ++Cl.#privateFieldValue;
    ++Cl.publicFieldValue;
    expect(Cl.#privateField).toEqual(Cl.publicField);

    Cl.#privateFieldValue += 1;
    Cl.publicFieldValue += 1;
    expect(Cl.#privateField).toEqual(Cl.publicField);
  }
}

Cl.testUpdates();`,
    filename: 'exec.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'publicFieldValue', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Cl.publicField;
      },
      'name',
      {
        value: 'get publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl, 'publicFieldValue', {
    set: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        Cl.publicField = newValue;
      },
      'name',
      {
        value: 'set publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl, 'testUpdates', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = 0;
        Cl.publicField = 0;
        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] =
          _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]++;
        Cl.publicFieldValue = Cl.publicFieldValue++;
        expect(_classPrivateFieldLooseBase(Cl, _privateField)[_privateField]).toEqual(
          Cl.publicField,
        );
        ++_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];
        ++Cl.publicFieldValue;
        expect(_classPrivateFieldLooseBase(Cl, _privateField)[_privateField]).toEqual(
          Cl.publicField,
        );
        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] += 1;
        Cl.publicFieldValue += 1;
        expect(_classPrivateFieldLooseBase(Cl, _privateField)[_privateField]).toEqual(
          Cl.publicField,
        );
      },
      'name',
      {
        value: 'testUpdates',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateFieldValue, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(Cl, _privateField)[_privateField];
    },
    set: function (newValue) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = newValue;
    },
  });
  Object.defineProperty(Cl, _privateField, {
    writable: true,
    value: 'top secret string',
  });
  Object.defineProperty(Cl, 'publicField', {
    value: 'not secret string',
    enumerable: true,
    configurable: true,
    writable: true,
  });
  return Cl;
})();
Cl.testUpdates();`,
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
      },
    ],
  },
  {
    title: 'static accessors loose — updates (input)',
    source: `class Cl {
  static #privateField = "top secret string";
  static publicField = "not secret string";

  static get #privateFieldValue() {
    return Cl.#privateField;
  }

  static set #privateFieldValue(newValue) {
    Cl.#privateField = newValue;
  }

  static publicGetPrivateField() {
    return Cl.#privateFieldValue;
  }

  static publicSetPrivateField(newValue) {
    Cl.#privateFieldValue = newValue;
  }

  static get publicFieldValue() {
    return Cl.publicField;
  }

  static set publicFieldValue(newValue) {
    Cl.publicField = newValue;
  }

  static testUpdates() {
    Cl.#privateField = 0;
    Cl.publicField = 0;
    Cl.#privateFieldValue = Cl.#privateFieldValue++;
    Cl.publicFieldValue = Cl.publicFieldValue++;

    ++Cl.#privateFieldValue;
    ++Cl.publicFieldValue;

    Cl.#privateFieldValue += 1;
    Cl.publicFieldValue += 1;

    Cl.#privateFieldValue = -(Cl.#privateFieldValue ** Cl.#privateFieldValue);
    Cl.publicFieldValue = -(Cl.publicFieldValue ** Cl.publicFieldValue);
  }
}`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
let Cl = (() => {
  'use strict';
  var _privateField = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateField',
  );
  var _privateFieldValue = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
    '__private_Cl_privateFieldValue',
  );
  const Cl = function Cl() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Cl, 'publicGetPrivateField', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];
      },
      'name',
      {
        value: 'publicGetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'publicSetPrivateField', {
    value: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = newValue;
      },
      'name',
      {
        value: 'publicSetPrivateField',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'publicFieldValue', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Cl.publicField;
      },
      'name',
      {
        value: 'get publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl, 'publicFieldValue', {
    set: Object.defineProperty(
      function (newValue) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        Cl.publicField = newValue;
      },
      'name',
      {
        value: 'set publicFieldValue',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Cl, 'testUpdates', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = 0;
        Cl.publicField = 0;
        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] =
          _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]++;
        Cl.publicFieldValue = Cl.publicFieldValue++;
        ++_classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];
        ++Cl.publicFieldValue;
        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] += 1;
        Cl.publicFieldValue += 1;
        _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = -(
          _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] **
          _classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]
        );
        Cl.publicFieldValue = -(Cl.publicFieldValue ** Cl.publicFieldValue);
      },
      'name',
      {
        value: 'testUpdates',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Cl, 'prototype', { writable: false });
  Object.defineProperty(Cl, _privateFieldValue, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(Cl, _privateField)[_privateField];
    },
    set: function (newValue) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = newValue;
    },
  });
  Object.defineProperty(Cl, _privateField, {
    writable: true,
    value: 'top secret string',
  });
  Object.defineProperty(Cl, 'publicField', {
    value: 'not secret string',
    enumerable: true,
    configurable: true,
    writable: true,
  });
  return Cl;
})();`,
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
      },
    ],
  },
  {
    title: 'static accessors — tagged template (input)',
    source: `class Foo {
  static get #tag() {
    return function() { return this; };
  }
\x20\x20
  static test() {
    const receiver = this.#tag\`\`;
    expect(receiver).toBe(this);
  }
}`,
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
  var _tag = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_tag');
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        const receiver = _classPrivateFieldLooseBase(this, _tag)[_tag]\`\`;
        expect(receiver).toBe(this);
      },
      'name',
      {
        value: 'test',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  Object.defineProperty(Foo, _tag, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return function () {
        return this;
      };
    },
  });
  return Foo;
})();`,
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
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
