import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'assumption constantSuper — accessing super class (input)',
    source: `class Test extends Foo {
  constructor() {
    woops.super.test();
    super();
    super.test();

    super(...arguments);
    super("test", ...arguments);

    super.test(...arguments);
    super.test("test", ...arguments);
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Test = (__nox_super_0_231 => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Test), arguments, _newtarget || Test);
      return _this;
    }
    var _result = function () {
      woops.super.test();
      _super();
      _get(Object.getPrototypeOf(Test.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
      );
      _super(...arguments);
      _super('test', ...arguments);
      _get(Object.getPrototypeOf(Test.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
        ...arguments,
      );
      _get(Object.getPrototypeOf(Test.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
        'test',
        ...arguments,
      );
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_231 !== null && typeof __nox_super_0_231 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test.prototype = Object.create(__nox_super_0_231 && __nox_super_0_231.prototype, {
    constructor: {
      value: Test,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_231);
  else Test.__proto__ = __nox_super_0_231;
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})(Foo);`,
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
      },
    ],
  },
  {
    title: 'assumption constantSuper — accessing super properties (input)',
    source: `class Test extends Foo {
  constructor() {
    super();
    super.test;
    super.test.whatever;
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Test = (__nox_super_0_102 => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Test), [], new.target || Test);
    var _result = function () {
      _get(Object.getPrototypeOf(Test.prototype), 'test', this);
      _get(Object.getPrototypeOf(Test.prototype), 'test', this).whatever;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_102 !== null && typeof __nox_super_0_102 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test.prototype = Object.create(__nox_super_0_102 && __nox_super_0_102.prototype, {
    constructor: {
      value: Test,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_102);
  else Test.__proto__ = __nox_super_0_102;
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})(Foo);`,
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
      },
    ],
  },
  {
    title: 'assumption constantSuper — accessing super property optional chain (input)',
    source: `class Test extends Foo {
  constructor() {
    super.foo?.bar;
    super.foo?.();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Test = (__nox_super_0_87 => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Test), arguments, _newtarget || Test);
      return _this;
    }
    var _result = function () {
      _get(Object.getPrototypeOf(Test.prototype), 'foo', _construct.assert(_this))?.bar;
      _get(Object.getPrototypeOf(Test.prototype), 'foo', _construct.assert(_this))?.call(
        _construct.assert(_this),
      );
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_87 !== null && typeof __nox_super_0_87 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test.prototype = Object.create(__nox_super_0_87 && __nox_super_0_87.prototype, {
    constructor: {
      value: Test,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_87);
  else Test.__proto__ = __nox_super_0_87;
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})(Foo);`,
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
      },
    ],
  },
  {
    title: 'assumption constantSuper — calling super properties (input)',
    source: `class Test extends Foo {
  constructor() {
    super();
    super.test.whatever();
    super.test();
  }

  static test() {
    return super.wow();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Test = (__nox_super_0_153 => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Test), [], new.target || Test);
    var _result = function () {
      _get(Object.getPrototypeOf(Test.prototype), 'test', this).whatever();
      _get(Object.getPrototypeOf(Test.prototype), 'test', this).call(this);
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_153 !== null && typeof __nox_super_0_153 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test.prototype = Object.create(__nox_super_0_153 && __nox_super_0_153.prototype, {
    constructor: {
      value: Test,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_153);
  else Test.__proto__ = __nox_super_0_153;
  Object.defineProperty(Test, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Test), 'wow', this).call(this);
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
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})(Foo);`,
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
      },
    ],
  },
  {
    title: 'assumption constantSuper — default super (input)',
    source: `class Test {
  constructor() {
    return super.constructor;
  }

  static test() {
    return super.constructor;
  }
}

// Instances
expect(Object.getPrototypeOf(Test.prototype)).toBe(Object.prototype);
expect(new Test()).toBe(Object);

// Static
expect(Object.getPrototypeOf(Test)).toBe(Function.prototype);
expect(Test.test()).toBe(Function);
`,
    filename: 'input.js',
    output: `var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    return super.constructor;
  };
  Object.defineProperty(Test, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Test), 'constructor', this);
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
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();
// Instances
expect(Object.getPrototypeOf(Test.prototype)).toBe(Object.prototype);
expect(new Test()).toBe(Object);
// Static
expect(Object.getPrototypeOf(Test)).toBe(Function.prototype);
expect(Test.test()).toBe(Function);`,
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
      },
    ],
  },
  {
    title: 'assumption constantSuper — super function fallback (input)',
    source: `class Test {
  constructor() {
    super.hasOwnProperty("test");
  }
}
`,
    filename: 'input.js',
    output: `var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    super.hasOwnProperty('test');
  };
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption noCallClass — class (input)',
    source: `class A {}
`,
    filename: 'input.js',
    output: `let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption noCallClass — with constructor (input)',
    source: `class A {
  constructor() {
    console.log('a');
  }
}

class B {
  b() {
    console.log('b');
  }
}
`,
    filename: 'input.js',
    output: `let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    console.log('a');
  };
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
let B = (() => {
  'use strict';
  const B = function B() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(B.prototype, 'b', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        console.log('b');
      },
      'name',
      {
        value: 'b',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(B, 'prototype', { writable: false });
  return B;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption noCallClass — with superClass (input)',
    source: `class B {}

class A extends B {
  constructor(track) {
    if (track !== undefined) super(track);
    else super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let B = (() => {
  'use strict';
  const B = function B() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(B, 'prototype', { writable: false });
  return B;
})();
let A = (__nox_super_12_121 => {
  'use strict';
  const A = function A(_argument) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(A), arguments, _newtarget || A);
      return _this;
    }
    var _result = function (track) {
      if (track !== undefined) _super(track);
      else _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_12_121 !== null && typeof __nox_super_12_121 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  A.prototype = Object.create(__nox_super_12_121 && __nox_super_12_121.prototype, {
    constructor: {
      value: A,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(A, __nox_super_12_121);
  else A.__proto__ = __nox_super_12_121;
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})(B);`,
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
      },
    ],
  },
  {
    title: 'assumption setClassMethods — literal key (input)',
    source: `class Foo {
  "bar"() {

  }
}
`,
    filename: 'input.js',
    output: `let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'bar', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'bar',
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
      },
    ],
  },
  {
    title: 'assumption setClassMethods — method name non bmp not supported (input)',
    source: `var o = class { 𠮷野家() {} };
`,
    filename: 'input.js',
    output: `var o = (() => {
  'use strict';
  const _Class = function _Class() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class, 'name', {
    value: 'o',
    configurable: true,
  });
  Object.defineProperty(_Class.prototype, '𠮷野家', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: '𠮷野家',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(_Class, 'prototype', { writable: false });
  return _Class;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption setClassMethods — method return type annotation (input)',
    source: `// @flow
// @flow
class C {
  m(x: number): string {
    return 'a';
  }
}
`,
    filename: 'input.js',
    output: `// @flow
// @flow
let C = (() => {
  'use strict';
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(C.prototype, 'm', {
    value: Object.defineProperty(
      function (x) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'a';
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
  Object.defineProperty(C, 'prototype', { writable: false });
  return C;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption setClassMethods — method reuse prototype (input)',
    source: `class Test {
  a() {}
  static b() {}
  c() {}
}
`,
    filename: 'input.js',
    output: `let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test.prototype, 'a', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'a',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Test, 'b', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'b',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Test.prototype, 'c', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'c',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption setClassMethods — program with use strict directive (input)',
    source: `"use strict";

class Foo {
    method() {
\x20\x20\x20\x20\x20\x20\x20\x20
    }
}`,
    filename: 'input.js',
    output: `'use strict';
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins es2015 (exec)',
    source: `class ListBuffer extends ArrayBuffer {}

expect(new ListBuffer).toBeInstanceOf(ListBuffer);
expect(new ListBuffer).toBeInstanceOf(ArrayBuffer);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let ListBuffer = (__nox_super_0_39 => {
  'use strict';
  const ListBuffer = function ListBuffer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(ListBuffer), arguments, new.target || ListBuffer);
    return _this;
  };
  if (__nox_super_0_39 !== null && typeof __nox_super_0_39 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  ListBuffer.prototype = Object.create(__nox_super_0_39 && __nox_super_0_39.prototype, {
    constructor: {
      value: ListBuffer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(ListBuffer, __nox_super_0_39);
  else ListBuffer.__proto__ = __nox_super_0_39;
  Object.defineProperty(ListBuffer, 'prototype', { writable: false });
  return ListBuffer;
})(ArrayBuffer);
expect(new ListBuffer()).toBeInstanceOf(ListBuffer);
expect(new ListBuffer()).toBeInstanceOf(ArrayBuffer);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins es2015 (input)',
    source: `class ListBuffer extends ArrayBuffer {}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let ListBuffer = (__nox_super_0_39 => {
  'use strict';
  const ListBuffer = function ListBuffer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(ListBuffer), arguments, new.target || ListBuffer);
    return _this;
  };
  if (__nox_super_0_39 !== null && typeof __nox_super_0_39 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  ListBuffer.prototype = Object.create(__nox_super_0_39 && __nox_super_0_39.prototype, {
    constructor: {
      value: ListBuffer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(ListBuffer, __nox_super_0_39);
  else ListBuffer.__proto__ = __nox_super_0_39;
  Object.defineProperty(ListBuffer, 'prototype', { writable: false });
  return ListBuffer;
})(ArrayBuffer);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins es2017 (exec)',
    source: `class SharedListBuffer extends SharedArrayBuffer {}

expect(new SharedListBuffer).toBeInstanceOf(SharedListBuffer);
expect(new SharedListBuffer).toBeInstanceOf(SharedArrayBuffer);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let SharedListBuffer = (__nox_super_0_51 => {
  'use strict';
  const SharedListBuffer = function SharedListBuffer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(SharedListBuffer),
      arguments,
      new.target || SharedListBuffer,
    );
    return _this;
  };
  if (__nox_super_0_51 !== null && typeof __nox_super_0_51 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  SharedListBuffer.prototype = Object.create(__nox_super_0_51 && __nox_super_0_51.prototype, {
    constructor: {
      value: SharedListBuffer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(SharedListBuffer, __nox_super_0_51);
  else SharedListBuffer.__proto__ = __nox_super_0_51;
  Object.defineProperty(SharedListBuffer, 'prototype', { writable: false });
  return SharedListBuffer;
})(SharedArrayBuffer);
expect(new SharedListBuffer()).toBeInstanceOf(SharedListBuffer);
expect(new SharedListBuffer()).toBeInstanceOf(SharedArrayBuffer);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins es2017 (input)',
    source: `class SharedListBuffer extends SharedArrayBuffer {}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let SharedListBuffer = (__nox_super_0_51 => {
  'use strict';
  const SharedListBuffer = function SharedListBuffer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(SharedListBuffer),
      arguments,
      new.target || SharedListBuffer,
    );
    return _this;
  };
  if (__nox_super_0_51 !== null && typeof __nox_super_0_51 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  SharedListBuffer.prototype = Object.create(__nox_super_0_51 && __nox_super_0_51.prototype, {
    constructor: {
      value: SharedListBuffer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(SharedListBuffer, __nox_super_0_51);
  else SharedListBuffer.__proto__ = __nox_super_0_51;
  Object.defineProperty(SharedListBuffer, 'prototype', { writable: false });
  return SharedListBuffer;
})(SharedArrayBuffer);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins es2020 (exec)',
    source: `class BigInt64List extends BigInt64Array {}

expect(new BigInt64List).toBeInstanceOf(BigInt64List);
expect(new BigInt64List).toBeInstanceOf(BigInt64Array);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let BigInt64List = (__nox_super_0_43 => {
  'use strict';
  const BigInt64List = function BigInt64List() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(BigInt64List),
      arguments,
      new.target || BigInt64List,
    );
    return _this;
  };
  if (__nox_super_0_43 !== null && typeof __nox_super_0_43 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  BigInt64List.prototype = Object.create(__nox_super_0_43 && __nox_super_0_43.prototype, {
    constructor: {
      value: BigInt64List,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(BigInt64List, __nox_super_0_43);
  else BigInt64List.__proto__ = __nox_super_0_43;
  Object.defineProperty(BigInt64List, 'prototype', { writable: false });
  return BigInt64List;
})(BigInt64Array);
expect(new BigInt64List()).toBeInstanceOf(BigInt64List);
expect(new BigInt64List()).toBeInstanceOf(BigInt64Array);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins es2020 (input)',
    source: `class BigInt64List extends BigInt64Array {}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let BigInt64List = (__nox_super_0_43 => {
  'use strict';
  const BigInt64List = function BigInt64List() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(BigInt64List),
      arguments,
      new.target || BigInt64List,
    );
    return _this;
  };
  if (__nox_super_0_43 !== null && typeof __nox_super_0_43 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  BigInt64List.prototype = Object.create(__nox_super_0_43 && __nox_super_0_43.prototype, {
    constructor: {
      value: BigInt64List,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(BigInt64List, __nox_super_0_43);
  else BigInt64List.__proto__ = __nox_super_0_43;
  Object.defineProperty(BigInt64List, 'prototype', { writable: false });
  return BigInt64List;
})(BigInt64Array);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins es2021 (exec)',
    source: `class MergedError extends AggregateError {}

expect(new MergedError([])).toBeInstanceOf(MergedError);
expect(new MergedError([])).toBeInstanceOf(AggregateError);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let MergedError = (__nox_super_0_43 => {
  'use strict';
  const MergedError = function MergedError() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(MergedError),
      arguments,
      new.target || MergedError,
    );
    return _this;
  };
  if (__nox_super_0_43 !== null && typeof __nox_super_0_43 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  MergedError.prototype = Object.create(__nox_super_0_43 && __nox_super_0_43.prototype, {
    constructor: {
      value: MergedError,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(MergedError, __nox_super_0_43);
  else MergedError.__proto__ = __nox_super_0_43;
  Object.defineProperty(MergedError, 'prototype', { writable: false });
  return MergedError;
})(AggregateError);
expect(new MergedError([])).toBeInstanceOf(MergedError);
expect(new MergedError([])).toBeInstanceOf(AggregateError);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins es2021 (input)',
    source: `class MergedError extends AggregateError {}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let MergedError = (__nox_super_0_43 => {
  'use strict';
  const MergedError = function MergedError() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(MergedError),
      arguments,
      new.target || MergedError,
    );
    return _this;
  };
  if (__nox_super_0_43 !== null && typeof __nox_super_0_43 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  MergedError.prototype = Object.create(__nox_super_0_43 && __nox_super_0_43.prototype, {
    constructor: {
      value: MergedError,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(MergedError, __nox_super_0_43);
  else MergedError.__proto__ = __nox_super_0_43;
  Object.defineProperty(MergedError, 'prototype', { writable: false });
  return MergedError;
})(AggregateError);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins (exec)',
    source: `class List extends Array {}

expect(new List).toBeInstanceOf(List);
expect(new List).toBeInstanceOf(Array);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let List = (__nox_super_0_27 => {
  'use strict';
  const List = function List() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(List), arguments, new.target || List);
    return _this;
  };
  if (__nox_super_0_27 !== null && typeof __nox_super_0_27 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  List.prototype = Object.create(__nox_super_0_27 && __nox_super_0_27.prototype, {
    constructor: {
      value: List,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_0_27);
  else List.__proto__ = __nox_super_0_27;
  Object.defineProperty(List, 'prototype', { writable: false });
  return List;
})(Array);
expect(new List()).toBeInstanceOf(List);
expect(new List()).toBeInstanceOf(Array);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — extend builtins (input)',
    source: 'class List extends Array {}',
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let List = (__nox_super_0_27 => {
  'use strict';
  const List = function List() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(List), arguments, new.target || List);
    return _this;
  };
  if (__nox_super_0_27 !== null && typeof __nox_super_0_27 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  List.prototype = Object.create(__nox_super_0_27 && __nox_super_0_27.prototype, {
    constructor: {
      value: List,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_0_27);
  else List.__proto__ = __nox_super_0_27;
  Object.defineProperty(List, 'prototype', { writable: false });
  return List;
})(Array);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — invalid extend builtins Iterator (exec)',
    source: `class RangeIterator extends Iterator {}

expect(() => new RangeIterator).toThrow("Constructor Iterator requires 'new'");
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let RangeIterator = (__nox_super_0_39 => {
  'use strict';
  const RangeIterator = function RangeIterator() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(RangeIterator),
      arguments,
      new.target || RangeIterator,
    );
    return _this;
  };
  if (__nox_super_0_39 !== null && typeof __nox_super_0_39 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  RangeIterator.prototype = Object.create(__nox_super_0_39 && __nox_super_0_39.prototype, {
    constructor: {
      value: RangeIterator,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(RangeIterator, __nox_super_0_39);
  else RangeIterator.__proto__ = __nox_super_0_39;
  Object.defineProperty(RangeIterator, 'prototype', { writable: false });
  return RangeIterator;
})(Iterator);
expect(() => new RangeIterator()).toThrow("Constructor Iterator requires 'new'");`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — invalid extend builtins Iterator (input)',
    source: `// Iterator can not be invoked with new, so this example does not
// satisfy the superIsCallableConstructor assumption, it will throw
// a runtime error
class RangeIterator extends Iterator {}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
// Iterator can not be invoked with new, so this example does not
// satisfy the superIsCallableConstructor assumption, it will throw
// a runtime error
let RangeIterator = (__nox_super_153_192 => {
  'use strict';
  const RangeIterator = function RangeIterator() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(RangeIterator),
      arguments,
      new.target || RangeIterator,
    );
    return _this;
  };
  if (__nox_super_153_192 !== null && typeof __nox_super_153_192 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  RangeIterator.prototype = Object.create(__nox_super_153_192 && __nox_super_153_192.prototype, {
    constructor: {
      value: RangeIterator,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(RangeIterator, __nox_super_153_192);
  else RangeIterator.__proto__ = __nox_super_153_192;
  Object.defineProperty(RangeIterator, 'prototype', { writable: false });
  return RangeIterator;
})(Iterator);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — super class id member expression (input)',
    source: `class BaseController extends Chaplin.Controller {

}

class BaseController2 extends Chaplin.Controller.Another {

}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let BaseController = (__nox_super_0_52 => {
  'use strict';
  const BaseController = function BaseController() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(BaseController),
      arguments,
      new.target || BaseController,
    );
    return _this;
  };
  if (__nox_super_0_52 !== null && typeof __nox_super_0_52 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  BaseController.prototype = Object.create(__nox_super_0_52 && __nox_super_0_52.prototype, {
    constructor: {
      value: BaseController,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(BaseController, __nox_super_0_52);
  else BaseController.__proto__ = __nox_super_0_52;
  Object.defineProperty(BaseController, 'prototype', { writable: false });
  return BaseController;
})(Chaplin.Controller);
let BaseController2 = (__nox_super_54_115 => {
  'use strict';
  const BaseController2 = function BaseController2() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(BaseController2),
      arguments,
      new.target || BaseController2,
    );
    return _this;
  };
  if (__nox_super_54_115 !== null && typeof __nox_super_54_115 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  BaseController2.prototype = Object.create(__nox_super_54_115 && __nox_super_54_115.prototype, {
    constructor: {
      value: BaseController2,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(BaseController2, __nox_super_54_115);
  else BaseController2.__proto__ = __nox_super_54_115;
  Object.defineProperty(BaseController2, 'prototype', { writable: false });
  return BaseController2;
})(Chaplin.Controller.Another);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — super class this usage (input)',
    source: `class Test extends Foo {
  constructor() {
    super();

    this;

    this.prop = 1;
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Test = (__nox_super_0_92 => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Test), [], new.target || Test);
    var _result = function () {
      this;
      this.prop = 1;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_92 !== null && typeof __nox_super_0_92 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test.prototype = Object.create(__nox_super_0_92 && __nox_super_0_92.prototype, {
    constructor: {
      value: Test,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_92);
  else Test.__proto__ = __nox_super_0_92;
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})(Foo);`,
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
      },
    ],
  },
  {
    title: 'assumption superIsCallableConstructor — super class (input)',
    source: `class Test extends Foo { }
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Test = (__nox_super_0_26 => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Test), arguments, new.target || Test);
    return _this;
  };
  if (__nox_super_0_26 !== null && typeof __nox_super_0_26 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test.prototype = Object.create(__nox_super_0_26 && __nox_super_0_26.prototype, {
    constructor: {
      value: Test,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_26);
  else Test.__proto__ = __nox_super_0_26;
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})(Foo);`,
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
      },
    ],
  },
  {
    title: 'extend builtins — builtin objects throw when wrapped (exec)',
    source: `// JSON is wrapped because it starts with an uppercase letter, but it
// should not be possible to extend it anyway.

expect(() => class BetterJSON extends JSON {}).toThrow();
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
// JSON is wrapped because it starts with an uppercase letter, but it
// should not be possible to extend it anyway.
expect(() =>
  (__nox_super_131_163 => {
    'use strict';
    const BetterJSON = function BetterJSON() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(
        Object.getPrototypeOf(BetterJSON),
        arguments,
        new.target || BetterJSON,
      );
      return _this;
    };
    if (__nox_super_131_163 !== null && typeof __nox_super_131_163 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    BetterJSON.prototype = Object.create(__nox_super_131_163 && __nox_super_131_163.prototype, {
      constructor: {
        value: BetterJSON,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(BetterJSON, __nox_super_131_163);
    else BetterJSON.__proto__ = __nox_super_131_163;
    Object.defineProperty(BetterJSON, 'prototype', { writable: false });
    return BetterJSON;
  })(JSON),
).toThrow();`,
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
      },
    ],
  },
  {
    title: 'extend builtins — imported_babel plugin transform builtin classes (exec)',
    source: `// Imported from
// https://github.com/WebReflection/babel-plugin-transform-builtin-classes/blob/85efe1374e1c59a8323c7eddd4326f6c93d9f64f/test/test.js

class List extends Array {
  constructor(value) {
    super().push(value);
  }
  push(value) {
    super.push(value);
    return this;
  }
}

expect(new List(1)).toBeInstanceOf(List);
expect(new List(2)).toBeInstanceOf(Array);

var l = new List(3);
expect(l).toHaveLength(1);
expect(l[0]).toBe(3);
expect(l.push(4)).toBe(l);
expect(l).toHaveLength(2);
expect(l.join()).toBe('3,4');

class SecondLevel extends List {
  method() {
    return this;
  }
}

expect(new SecondLevel(1)).toBeInstanceOf(SecondLevel);
expect(new SecondLevel(2)).toBeInstanceOf(List);
expect(new SecondLevel(3)).toBeInstanceOf(Array);

var s = new SecondLevel(4);
expect(s).toHaveLength(1);
expect(s[0]).toBe(4);
expect(s.push(5)).toBe(s);
expect(s).toHaveLength(2);
expect(s.join()).toBe('4,5');
expect(s.method()).toBe(s);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
// Imported from
// https://github.com/WebReflection/babel-plugin-transform-builtin-classes/blob/85efe1374e1c59a8323c7eddd4326f6c93d9f64f/test/test.js
let List = (__nox_super_152_292 => {
  'use strict';
  const List = function List(_argument) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(List), arguments, _newtarget || List);
      return _this;
    }
    var _result = function (value) {
      _super().push(value);
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_152_292 !== null && typeof __nox_super_152_292 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  List.prototype = Object.create(__nox_super_152_292 && __nox_super_152_292.prototype, {
    constructor: {
      value: List,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_152_292);
  else List.__proto__ = __nox_super_152_292;
  Object.defineProperty(List.prototype, 'push', {
    value: Object.defineProperty(
      function (value) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(List.prototype), 'push', this).call(this, value);
        return this;
      },
      'name',
      {
        value: 'push',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(List, 'prototype', { writable: false });
  return List;
})(Array);
expect(new List(1)).toBeInstanceOf(List);
expect(new List(2)).toBeInstanceOf(Array);
var l = new List(3);
expect(l).toHaveLength(1);
expect(l[0]).toBe(3);
expect(l.push(4)).toBe(l);
expect(l).toHaveLength(2);
expect(l.join()).toBe('3,4');
let SecondLevel = (__nox_super_535_603 => {
  'use strict';
  const SecondLevel = function SecondLevel() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(SecondLevel),
      arguments,
      new.target || SecondLevel,
    );
    return _this;
  };
  if (__nox_super_535_603 !== null && typeof __nox_super_535_603 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  SecondLevel.prototype = Object.create(__nox_super_535_603 && __nox_super_535_603.prototype, {
    constructor: {
      value: SecondLevel,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(SecondLevel, __nox_super_535_603);
  else SecondLevel.__proto__ = __nox_super_535_603;
  Object.defineProperty(SecondLevel.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return this;
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
  Object.defineProperty(SecondLevel, 'prototype', { writable: false });
  return SecondLevel;
})(List);
expect(new SecondLevel(1)).toBeInstanceOf(SecondLevel);
expect(new SecondLevel(2)).toBeInstanceOf(List);
expect(new SecondLevel(3)).toBeInstanceOf(Array);
var s = new SecondLevel(4);
expect(s).toHaveLength(1);
expect(s[0]).toBe(4);
expect(s.push(5)).toBe(s);
expect(s).toHaveLength(2);
expect(s.join()).toBe('4,5');
expect(s.method()).toBe(s);`,
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
      },
    ],
  },
  {
    title: 'extend builtins — overwritten null (exec)',
    source: `var env = {
  Array: null,
};

// We need to use "with" to avoid leaking the modified Array to other tests.
with (env) {
  class List extends Array {}
  expect(List.prototype.__proto__).toBeUndefined();
}
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var env = { Array: null };
// We need to use "with" to avoid leaking the modified Array to other tests.
with (env) {
  let List = (__nox_super_123_150 => {
    'use strict';
    const List = function List() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(Object.getPrototypeOf(List), arguments, new.target || List);
      return _this;
    };
    if (__nox_super_123_150 !== null && typeof __nox_super_123_150 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    List.prototype = Object.create(__nox_super_123_150 && __nox_super_123_150.prototype, {
      constructor: {
        value: List,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_123_150);
    else List.__proto__ = __nox_super_123_150;
    Object.defineProperty(List, 'prototype', { writable: false });
    return List;
  })(Array);
  expect(List.prototype.__proto__).toBeUndefined();
}`,
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
      },
    ],
  },
  {
    title: 'extend builtins — shadowed (input)',
    source: `class Array {}

class List extends Array {}`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Array = (() => {
  'use strict';
  const Array = function Array() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Array, 'prototype', { writable: false });
  return Array;
})();
let List = (__nox_super_16_43 => {
  'use strict';
  const List = function List() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(List), arguments, new.target || List);
    return _this;
  };
  if (__nox_super_16_43 !== null && typeof __nox_super_16_43 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  List.prototype = Object.create(__nox_super_16_43 && __nox_super_16_43.prototype, {
    constructor: {
      value: List,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_16_43);
  else List.__proto__ = __nox_super_16_43;
  Object.defineProperty(List, 'prototype', { writable: false });
  return List;
})(Array);`,
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
      },
    ],
  },
  {
    title: 'extend builtins — super called (exec)',
    source: `var called = false;

var env = {
  Array: function Array() {
    called = true;
  }
};

// We need to use "with" to avoid leaking the modified Array to other tests.
with (env) {
  class List extends Array {};
  new List();

  expect(called).toBe(true);
}
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var called = false;
var env = {
  Array: function Array() {
    called = true;
  },
};
// We need to use "with" to avoid leaking the modified Array to other tests.
with (env) {
  let List = (__nox_super_180_207 => {
    'use strict';
    const List = function List() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(Object.getPrototypeOf(List), arguments, new.target || List);
      return _this;
    };
    if (__nox_super_180_207 !== null && typeof __nox_super_180_207 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    List.prototype = Object.create(__nox_super_180_207 && __nox_super_180_207.prototype, {
      constructor: {
        value: List,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(List, __nox_super_180_207);
    else List.__proto__ = __nox_super_180_207;
    Object.defineProperty(List, 'prototype', { writable: false });
    return List;
  })(Array);
  new List();
  expect(called).toBe(true);
}`,
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
      },
    ],
  },
  {
    title: 'extend builtins — wrap native super (exec)',
    source: `// basic sanity check to confirm the external wrapNativeSuper helper works

class Test1 extends Array {
  name() {
    return 'test1';
  }
}

class Test2 extends Array {
  name() {
    return 'test2';
  }
}

var t1 = new Test1();
var t2 = new Test2();

expect(Test1).not.toBe(Test2);
expect(t1).not.toBe(t2);
expect(t1.name()).toBe('test1');
expect(t2.name()).toBe('test2');
expect(t1).toBeInstanceOf(Test1);
expect(t2).toBeInstanceOf(Test2);
expect(t1).toBeInstanceOf(Array);
expect(t2).toBeInstanceOf(Array);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
// basic sanity check to confirm the external wrapNativeSuper helper works
let Test1 = (__nox_super_76_140 => {
  'use strict';
  const Test1 = function Test1() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Test1), arguments, new.target || Test1);
    return _this;
  };
  if (__nox_super_76_140 !== null && typeof __nox_super_76_140 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test1.prototype = Object.create(__nox_super_76_140 && __nox_super_76_140.prototype, {
    constructor: {
      value: Test1,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test1, __nox_super_76_140);
  else Test1.__proto__ = __nox_super_76_140;
  Object.defineProperty(Test1.prototype, 'name', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'test1';
      },
      'name',
      {
        value: 'name',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Test1, 'prototype', { writable: false });
  return Test1;
})(Array);
let Test2 = (__nox_super_142_206 => {
  'use strict';
  const Test2 = function Test2() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Test2), arguments, new.target || Test2);
    return _this;
  };
  if (__nox_super_142_206 !== null && typeof __nox_super_142_206 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test2.prototype = Object.create(__nox_super_142_206 && __nox_super_142_206.prototype, {
    constructor: {
      value: Test2,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test2, __nox_super_142_206);
  else Test2.__proto__ = __nox_super_142_206;
  Object.defineProperty(Test2.prototype, 'name', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'test2';
      },
      'name',
      {
        value: 'name',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Test2, 'prototype', { writable: false });
  return Test2;
})(Array);
var t1 = new Test1();
var t2 = new Test2();
expect(Test1).not.toBe(Test2);
expect(t1).not.toBe(t2);
expect(t1.name()).toBe('test1');
expect(t2.name()).toBe('test2');
expect(t1).toBeInstanceOf(Test1);
expect(t2).toBeInstanceOf(Test2);
expect(t1).toBeInstanceOf(Array);
expect(t2).toBeInstanceOf(Array);`,
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
      },
    ],
  },
  {
    title: 'get set loose — call semantics data defined on parent (exec)',
    source: `"use strict";
class Base {
  test(...args) {
    expect(this).toBe(obj);
    expect(args).toEqual([1, 2, 3]);
    return 1;
  }
}

class Obj extends Base {
  call() {
    super.test(1, 2, 3);
    super.test(1, ...[2, 3]);
    super.test(...[1, 2, 3]);
    return super.test(...arguments);
  }

  test() {
    throw new Error("called");
  }
}

const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    value: Object.defineProperty(
      function (...args) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this).toBe(obj);
        expect(args).toEqual([1, 2, 3]);
        return 1;
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
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_131_341 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_131_341 !== null && typeof __nox_super_131_341 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_131_341 && __nox_super_131_341.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_131_341);
  else Obj.__proto__ = __nox_super_131_341;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('called');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set loose — call semantics data defined on parent (input)',
    source: `"use strict";
class Base {
  test(...args) {
    expect(this).toBe(obj);
    expect(args).toEqual([1, 2, 3]);
    return 1;
  }
}

class Obj extends Base {
  call() {
    super.test(1, 2, 3);
    super.test(1, ...[2, 3]);
    super.test(...[1, 2, 3]);
    return super.test(...arguments);
  }

  test() {
    throw new Error("called");
  }
}

const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    value: Object.defineProperty(
      function (...args) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this).toBe(obj);
        expect(args).toEqual([1, 2, 3]);
        return 1;
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
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_131_341 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_131_341 !== null && typeof __nox_super_131_341 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_131_341 && __nox_super_131_341.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_131_341);
  else Obj.__proto__ = __nox_super_131_341;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('called');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set loose — call semantics getter defined on parent (exec)',
    source: `"use strict";
class Base {
  get test() {
    // This is incorrect according to the spec,
    // but close enough for loose.
    expect(this).toBe(Base.prototype);

    return function(...args) {
      expect(this).toBe(obj);
      expect(args).toEqual([1, 2, 3]);
      return 1;
    };
  }
}

class Obj extends Base {
  call() {
    super.test(1, 2, 3);
    super.test(1, ...[2, 3]);
    super.test(...[1, 2, 3]);
    return super.test(...arguments);
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  writable: true,
  configurable: true,
  value() {
    throw new Error("called");
  }
});

const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        // This is incorrect according to the spec,
        // but close enough for loose.
        expect(this).toBe(Base.prototype);
        return function (...args) {
          expect(this).toBe(obj);
          expect(args).toEqual([1, 2, 3]);
          return 1;
        };
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_295_458 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_295_458 !== null && typeof __nox_super_295_458 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_295_458 && __nox_super_295_458.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_458);
  else Obj.__proto__ = __nox_super_295_458;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  writable: true,
  configurable: true,
  value() {
    throw new Error('called');
  },
});
const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set loose — call semantics getter defined on parent (input)',
    source: `"use strict";
class Base {
  get test() {
    // This is incorrect according to the spec,
    // but close enough for loose.
    expect(this).toBe(Base.prototype);

    return function(...args) {
      expect(this).toBe(obj);
      expect(args).toEqual([1, 2, 3]);
      return 1;
    };
  }
}

class Obj extends Base {
  call() {
    super.test(1, 2, 3);
    super.test(1, ...[2, 3]);
    super.test(...[1, 2, 3]);
    return super.test(...arguments);
  }

  test() {
    throw new Error("called");
  }
}

const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        // This is incorrect according to the spec,
        // but close enough for loose.
        expect(this).toBe(Base.prototype);
        return function (...args) {
          expect(this).toBe(obj);
          expect(args).toEqual([1, 2, 3]);
          return 1;
        };
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_295_505 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_295_505 !== null && typeof __nox_super_295_505 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_295_505 && __nox_super_295_505.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_505);
  else Obj.__proto__ = __nox_super_295_505;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('called');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set loose — call semantics not defined on parent (exec)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  call() {
    return super.test();
  }

  test() {
    throw new Error("gobbledygook");
  }
}

const obj = new Obj();
expect(() => {
  obj.call();

  // Assert that this throws, but that it's not
  // Obj.p.test's error that is thrown
}).toThrow(TypeError)
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_149 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_149 !== null && typeof __nox_super_30_149 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_149 && __nox_super_30_149.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_149);
  else Obj.__proto__ = __nox_super_30_149;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('gobbledygook');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(() => {
  obj.call();
  // Assert that this throws, but that it's not
  // Obj.p.test's error that is thrown
}).toThrow(TypeError);`,
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
      },
    ],
  },
  {
    title: 'get set loose — call semantics not defined on parent (input)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  call() {
    return super.test();
  }

  test() {
    throw new Error("gobbledygook");
  }
}

const obj = new Obj();
expect(() => {
  obj.call();

  // Assert that this throws, but that it's not
  // Obj.p.test's error that is thrown
}).toThrow(TypeError)
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_149 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_149 !== null && typeof __nox_super_30_149 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_149 && __nox_super_30_149.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_149);
  else Obj.__proto__ = __nox_super_30_149;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('gobbledygook');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(() => {
  obj.call();
  // Assert that this throws, but that it's not
  // Obj.p.test's error that is thrown
}).toThrow(TypeError);`,
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
      },
    ],
  },
  {
    title: 'get set loose — call semantics setter defined on parent (exec)',
    source: `"use strict";
class Base {
  set test(v) {
    throw new Error("gobbledygook");
  }
}

class Obj extends Base {
  call() {
    return super.test();
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  writable: true,
  configurable: true,
  value() {
    throw new Error("gobbledygook");
  }
});

const obj = new Obj();
expect(() => {
  obj.call();

  // Assert that this throws, but that it's not
  // a gobbledygook error that is thrown
}).toThrow(TypeError)
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('gobbledygook');
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_87_153 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_87_153 !== null && typeof __nox_super_87_153 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_87_153 && __nox_super_87_153.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_87_153);
  else Obj.__proto__ = __nox_super_87_153;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  writable: true,
  configurable: true,
  value() {
    throw new Error('gobbledygook');
  },
});
const obj = new Obj();
expect(() => {
  obj.call();
  // Assert that this throws, but that it's not
  // a gobbledygook error that is thrown
}).toThrow(TypeError);`,
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
      },
    ],
  },
  {
    title: 'get set loose — call semantics setter defined on parent (input)',
    source: `"use strict";
class Base {
  set test(v) {
    throw new Error("gobbledygook");
  }
}

class Obj extends Base {
  call() {
    return super.test();
  }

  test() {
    throw new Error("gobbledygook");
  }
}

const obj = new Obj();
expect(() => {
  obj.call();

  // Assert that this throws, but that it's not
  // a gobbledygook error that is thrown
}).toThrow(TypeError)
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('gobbledygook');
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_87_206 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_87_206 !== null && typeof __nox_super_87_206 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_87_206 && __nox_super_87_206.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_87_206);
  else Obj.__proto__ = __nox_super_87_206;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('gobbledygook');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(() => {
  obj.call();
  // Assert that this throws, but that it's not
  // a gobbledygook error that is thrown
}).toThrow(TypeError);`,
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
      },
    ],
  },
  {
    title: 'get set loose — get semantics data defined on parent (exec)',
    source: `"use strict";
class Base {
}
Object.defineProperty(Base.prototype, 'test', {
  value: 1,
  writable: true,
  configurable: true,
});

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
Object.defineProperty(Base.prototype, 'test', {
  value: 1,
  writable: true,
  configurable: true,
});
let Obj = (__nox_super_134_197 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_134_197 !== null && typeof __nox_super_134_197 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_134_197 && __nox_super_134_197.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_134_197);
  else Obj.__proto__ = __nox_super_134_197;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set loose — get semantics data defined on parent (input)',
    source: `"use strict";
class Base {
}
Base.prototype.test = 1;

class Obj extends Base {
  get() {
    return super.test;
  }
}
Obj.prototype.test = 2;

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
Base.prototype.test = 1;
let Obj = (__nox_super_55_118 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_55_118 !== null && typeof __nox_super_55_118 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_55_118 && __nox_super_55_118.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_55_118);
  else Obj.__proto__ = __nox_super_55_118;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Obj.prototype.test = 2;
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set loose — get semantics getter defined on parent (exec)',
    source: `"use strict";
class Base {
  get test() {
    // This is incorrect according to the spec,
    // but close enough for loose.
    expect(this).toBe(Base.prototype);
    return 1;
  }
}

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        // This is incorrect according to the spec,
        // but close enough for loose.
        expect(this).toBe(Base.prototype);
        return 1;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_185_248 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_185_248 !== null && typeof __nox_super_185_248 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_185_248 && __nox_super_185_248.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_185_248);
  else Obj.__proto__ = __nox_super_185_248;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set loose — get semantics getter defined on parent (input)',
    source: `"use strict";
class Base {
  get test() {
    // This is incorrect according to the spec,
    // but close enough for loose.
    expect(this).toBe(Base.prototype);
    return 1;
  }
}

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        // This is incorrect according to the spec,
        // but close enough for loose.
        expect(this).toBe(Base.prototype);
        return 1;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_185_248 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_185_248 !== null && typeof __nox_super_185_248 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_185_248 && __nox_super_185_248.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_185_248);
  else Obj.__proto__ = __nox_super_185_248;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set loose — get semantics not defined on parent (exec)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBeUndefined();
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_93 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_93 !== null && typeof __nox_super_30_93 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_93 && __nox_super_30_93.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_93);
  else Obj.__proto__ = __nox_super_30_93;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBeUndefined();`,
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
      },
    ],
  },
  {
    title: 'get set loose — get semantics not defined on parent (input)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBeUndefined();
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_93 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_93 !== null && typeof __nox_super_30_93 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_93 && __nox_super_30_93.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_93);
  else Obj.__proto__ = __nox_super_30_93;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBeUndefined();`,
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
      },
    ],
  },
  {
    title: 'get set loose — get semantics setter defined on parent (exec)',
    source: `"use strict";
class Base {
  set test(v) {
    throw new Error("called");
  }
}

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBeUndefined();
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('called');
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_81_144 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_81_144 !== null && typeof __nox_super_81_144 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_81_144 && __nox_super_81_144.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_81_144);
  else Obj.__proto__ = __nox_super_81_144;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBeUndefined();`,
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
      },
    ],
  },
  {
    title: 'get set loose — get semantics setter defined on parent (input)',
    source: `"use strict";
class Base {
  set test(v) {
    throw new Error("called");
  }
}

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBeUndefined();
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('called');
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_81_144 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_81_144 !== null && typeof __nox_super_81_144 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_81_144 && __nox_super_81_144.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_81_144);
  else Obj.__proto__ = __nox_super_81_144;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBeUndefined();`,
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
      },
    ],
  },
  {
    title: 'get set loose — memoized assign (exec)',
    source: `"use strict";
class Base {}
Object.defineProperty(Base.prototype, 0, {
  value: 0,
  writable: true,
  configurable: true,
});
Object.defineProperty(Base.prototype, 1, {
  value: 1,
  writable: true,
  configurable: true,
});

let i = 0;
const proper = {
  get prop() {
    return i++;
  },
};

class Obj extends Base {
  assign() {
    super[proper.prop] += 1;
  }

  assign2() {
    super[i] += 1;
  }
}

const obj = new Obj();

obj.assign();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(1);

obj.assign2();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(2);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
Object.defineProperty(Base.prototype, 0, {
  value: 0,
  writable: true,
  configurable: true,
});
Object.defineProperty(Base.prototype, 1, {
  value: 1,
  writable: true,
  configurable: true,
});
let i = 0;
const proper = {
  get prop() {
    return i++;
  },
};
let Obj = (__nox_super_295_405 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_295_405 !== null && typeof __nox_super_295_405 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_295_405 && __nox_super_295_405.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_405);
  else Obj.__proto__ = __nox_super_295_405;
  Object.defineProperty(Obj.prototype, 'assign', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _superReference(Object.getPrototypeOf(Obj.prototype), proper.prop, this).value += 1;
      },
      'name',
      {
        value: 'assign',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'assign2', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _superReference(Object.getPrototypeOf(Obj.prototype), i, this).value += 1;
      },
      'name',
      {
        value: 'assign2',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
obj.assign();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(1);
obj.assign2();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'get set loose — memoized assign (input)',
    source: `"use strict";
class Base {}
Object.defineProperty(Base.prototype, 0, {
  value: 0,
  writable: true,
  configurable: true,
});
Object.defineProperty(Base.prototype, 1, {
  value: 1,
  writable: true,
  configurable: true,
});

let i = 0;
const proper = {
  get prop() {
    return i++;
  },
};

class Obj extends Base {
  assign() {
    super[proper.prop] += 1;
  }

  assign2() {
    super[i] += 1;
  }
}

const obj = new Obj();

obj.assign();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(1);

obj.assign2();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(2);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
Object.defineProperty(Base.prototype, 0, {
  value: 0,
  writable: true,
  configurable: true,
});
Object.defineProperty(Base.prototype, 1, {
  value: 1,
  writable: true,
  configurable: true,
});
let i = 0;
const proper = {
  get prop() {
    return i++;
  },
};
let Obj = (__nox_super_295_405 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_295_405 !== null && typeof __nox_super_295_405 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_295_405 && __nox_super_295_405.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_405);
  else Obj.__proto__ = __nox_super_295_405;
  Object.defineProperty(Obj.prototype, 'assign', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _superReference(Object.getPrototypeOf(Obj.prototype), proper.prop, this).value += 1;
      },
      'name',
      {
        value: 'assign',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'assign2', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _superReference(Object.getPrototypeOf(Obj.prototype), i, this).value += 1;
      },
      'name',
      {
        value: 'assign2',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
obj.assign();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(1);
obj.assign2();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'get set loose — memoized update (exec)',
    source: `"use strict";
class Base {}
Object.defineProperty(Base.prototype, 0, {
  value: 0,
  writable: true,
  configurable: true,
});
Object.defineProperty(Base.prototype, 1, {
  value: 1,
  writable: true,
  configurable: true,
});

let i = 0;
const proper = {
  get prop() {
    return i++;
  },
};

class Obj extends Base {
  update() {
    super[proper.prop]++;
  }

  update2() {
    super[i]++;
  }
}

const obj = new Obj();

obj.update();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(1);

obj.update2();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(2);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
Object.defineProperty(Base.prototype, 0, {
  value: 0,
  writable: true,
  configurable: true,
});
Object.defineProperty(Base.prototype, 1, {
  value: 1,
  writable: true,
  configurable: true,
});
let i = 0;
const proper = {
  get prop() {
    return i++;
  },
};
let Obj = (__nox_super_295_399 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_295_399 !== null && typeof __nox_super_295_399 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_295_399 && __nox_super_295_399.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_399);
  else Obj.__proto__ = __nox_super_295_399;
  Object.defineProperty(Obj.prototype, 'update', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _superReference(Object.getPrototypeOf(Obj.prototype), proper.prop, this).value++;
      },
      'name',
      {
        value: 'update',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'update2', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _superReference(Object.getPrototypeOf(Obj.prototype), i, this).value++;
      },
      'name',
      {
        value: 'update2',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
obj.update();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(1);
obj.update2();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'get set loose — memoized update (input)',
    source: `"use strict";
class Base {}
Object.defineProperty(Base.prototype, 0, {
  value: 0,
  writable: true,
  configurable: true,
});
Object.defineProperty(Base.prototype, 1, {
  value: 1,
  writable: true,
  configurable: true,
});

let i = 0;
const proper = {
  get prop() {
    return i++;
  },
};

class Obj extends Base {
  update() {
    super[proper.prop]++;
  }

  update2() {
    super[i]++;
  }
}

const obj = new Obj();

obj.update();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(1);

obj.update2();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(2);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
Object.defineProperty(Base.prototype, 0, {
  value: 0,
  writable: true,
  configurable: true,
});
Object.defineProperty(Base.prototype, 1, {
  value: 1,
  writable: true,
  configurable: true,
});
let i = 0;
const proper = {
  get prop() {
    return i++;
  },
};
let Obj = (__nox_super_295_399 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_295_399 !== null && typeof __nox_super_295_399 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_295_399 && __nox_super_295_399.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_295_399);
  else Obj.__proto__ = __nox_super_295_399;
  Object.defineProperty(Obj.prototype, 'update', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _superReference(Object.getPrototypeOf(Obj.prototype), proper.prop, this).value++;
      },
      'name',
      {
        value: 'update',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'update2', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _superReference(Object.getPrototypeOf(Obj.prototype), i, this).value++;
      },
      'name',
      {
        value: 'update2',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
obj.update();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(1);
obj.update2();
expect(i).toBe(1);
expect(obj[0]).toBe(1);
expect(obj[1]).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'get set loose — preserve comments (input)',
    source: `class C {
  /* before get a */
  get a() { return 42 }
  /* after get a */

  /* before set a */
  set a(v) {}
  /* after set a */
}
`,
    filename: 'input.js',
    output: `let C = (() => {
  'use strict';
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(C.prototype, 'a', {
    get: Object.defineProperty(
      function () {
        /* before get a */
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 42;
      },
      'name',
      {
        value: 'get a',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(C.prototype, 'a', {
    set: Object.defineProperty(
      function (v) {
        /* after get a */
        /* before set a */
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'set a',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(C, 'prototype', { writable: false });
  return C;
  /* after set a */
})();`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics data defined on parent (exec)',
    source: `"use strict";
class Base  {
}
Object.defineProperty(Base.prototype, 'test', {
  value: 1,
  writable: true,
  configurable: true,
});

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
Object.defineProperty(Base.prototype, 'test', {
  value: 1,
  writable: true,
  configurable: true,
});
let Obj = (__nox_super_135_202 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_135_202 !== null && typeof __nox_super_135_202 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_135_202 && __nox_super_135_202.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_135_202);
  else Obj.__proto__ = __nox_super_135_202;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics data defined on parent (input)',
    source: `"use strict";
class Base  {
}
Object.defineProperty(Base.prototype, 'test', {
  value: 1,
  writable: true,
  configurable: true,
});

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
Object.defineProperty(Base.prototype, 'test', {
  value: 1,
  writable: true,
  configurable: true,
});
let Obj = (__nox_super_135_202 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_135_202 !== null && typeof __nox_super_135_202 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_135_202 && __nox_super_135_202.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_135_202);
  else Obj.__proto__ = __nox_super_135_202;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics getter defined on parent (exec)',
    source: `"use strict";
let called = false;
class Base {
  get test() {
    called = true;
    return 1;
  }
};

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();

// This is incorrect according to the spec,
// but close enough for loose.
// expect(() => {
  expect(obj.set()).toBe(3);
// }).toThrow(TypeError);

expect(called).toBe(false);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let called = false;
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        called = true;
        return 1;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_103_170 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_103_170 !== null && typeof __nox_super_103_170 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_103_170 && __nox_super_103_170.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_103_170);
  else Obj.__proto__ = __nox_super_103_170;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
// This is incorrect according to the spec,
// but close enough for loose.
// expect(() => {
expect(obj.set()).toBe(3);
// }).toThrow(TypeError);
expect(called).toBe(false);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics getter defined on parent (input)',
    source: `"use strict";
let called = false;
class Base {
  get test() {
    called = true;
    return 1;
  }
};

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();

// This is incorrect according to the spec,
// but close enough for loose.
// expect(() => {
  expect(obj.set()).toBe(3);
// }).toThrow(TypeError);

expect(called).toBe(false);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let called = false;
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        called = true;
        return 1;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_103_170 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_103_170 !== null && typeof __nox_super_103_170 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_103_170 && __nox_super_103_170.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_103_170);
  else Obj.__proto__ = __nox_super_103_170;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
// This is incorrect according to the spec,
// but close enough for loose.
// expect(() => {
expect(obj.set()).toBe(3);
// }).toThrow(TypeError);
expect(called).toBe(false);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent data on obj (exec)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_97 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_97 !== null && typeof __nox_super_30_97 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_97 && __nox_super_30_97.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_97);
  else Obj.__proto__ = __nox_super_30_97;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent data on obj (input)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_97 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_97 !== null && typeof __nox_super_30_97 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_97 && __nox_super_30_97.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_97);
  else Obj.__proto__ = __nox_super_30_97;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent getter on obj (exec)',
    source: `"use strict";
class Base {
}

let called = false;
class Obj extends Base {
  get test() {
    called = true;
  }

  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
// This is incorrect according to the spec,
// but close enough for loose.
// expect(obj.set()).toBe(3);
expect(() => {
  obj.set();
}).toThrow(TypeError);

expect(called).toBe(false);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(undefined);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let called = false;
let Obj = (__nox_super_50_156 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_50_156 !== null && typeof __nox_super_50_156 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_50_156 && __nox_super_50_156.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_50_156);
  else Obj.__proto__ = __nox_super_50_156;
  Object.defineProperty(Obj.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        called = true;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
// This is incorrect according to the spec,
// but close enough for loose.
// expect(obj.set()).toBe(3);
expect(() => {
  obj.set();
}).toThrow(TypeError);
expect(called).toBe(false);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(undefined);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent getter on obj (input)',
    source: `"use strict";
class Base {
}

let called = false;
class Obj extends Base {
  get test() {
    called = true;
  }

  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
// This is incorrect according to the spec,
// but close enough for loose.
// expect(obj.set()).toBe(3);
expect(() => {
  obj.set();
}).toThrow(TypeError);

expect(called).toBe(false);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(undefined);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let called = false;
let Obj = (__nox_super_50_156 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_50_156 !== null && typeof __nox_super_50_156 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_50_156 && __nox_super_50_156.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_50_156);
  else Obj.__proto__ = __nox_super_50_156;
  Object.defineProperty(Obj.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        called = true;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
// This is incorrect according to the spec,
// but close enough for loose.
// expect(obj.set()).toBe(3);
expect(() => {
  obj.set();
}).toThrow(TypeError);
expect(called).toBe(false);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(undefined);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent not on obj (exec)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(3);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_97 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_97 !== null && typeof __nox_super_30_97 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_97 && __nox_super_30_97.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_97);
  else Obj.__proto__ = __nox_super_30_97;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent not on obj (input)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(3);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_97 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_97 !== null && typeof __nox_super_30_97 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_97 && __nox_super_30_97.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_97);
  else Obj.__proto__ = __nox_super_30_97;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent setter on obj (exec)',
    source: `"use strict";
class Base {
}

let value = 2;
class Obj extends Base {
  set test(v) {
    value = v;
  }

  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();

// This is incorrect according to the spec,
// but close enough for loose.
expect(value).toBe(3);

expect(obj.test).toBe(undefined);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let value = 2;
let Obj = (__nox_super_45_148 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_45_148 !== null && typeof __nox_super_45_148 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_45_148 && __nox_super_45_148.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_45_148);
  else Obj.__proto__ = __nox_super_45_148;
  Object.defineProperty(Obj.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        value = v;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
// This is incorrect according to the spec,
// but close enough for loose.
expect(value).toBe(3);
expect(obj.test).toBe(undefined);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics not defined on parent setter on obj (input)',
    source: `"use strict";
class Base {
}

let value = 2;
class Obj extends Base {
  set test(v) {
    value = v;
  }

  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();

// This is incorrect according to the spec,
// but close enough for loose.
expect(value).toBe(3);

expect(obj.test).toBe(undefined);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let value = 2;
let Obj = (__nox_super_45_148 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_45_148 !== null && typeof __nox_super_45_148 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_45_148 && __nox_super_45_148.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_45_148);
  else Obj.__proto__ = __nox_super_45_148;
  Object.defineProperty(Obj.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        value = v;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
// This is incorrect according to the spec,
// but close enough for loose.
expect(value).toBe(3);
expect(obj.test).toBe(undefined);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics setter defined on parent (exec)',
    source: `"use strict";
let value = 1;
class Base {
  set test(v) {
    value = v;
  }
}

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.set()).toBe(3);
// todo
expect(value).toBe(1);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
// todo
expect(obj.test).toBe(3);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let value = 1;
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        value = v;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_80_147 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_80_147 !== null && typeof __nox_super_80_147 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_80_147 && __nox_super_80_147.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_80_147);
  else Obj.__proto__ = __nox_super_80_147;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.set()).toBe(3);
// todo
expect(value).toBe(1);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
// todo
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set loose — set semantics setter defined on parent (input)',
    source: `"use strict";
let value = 1;
class Base {
  set test(v) {
    value = v;
  }
}

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.set()).toBe(3);

// This is incorrect according to the spec,
// but close enough for loose.
// expect(value).toBe(3);
expect(value).toBe(1);

expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);

// This is incorrect according to the spec,
// but close enough for loose.
// expect(obj.test).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let value = 1;
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        value = v;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_80_147 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_80_147 !== null && typeof __nox_super_80_147 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_80_147 && __nox_super_80_147.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_80_147);
  else Obj.__proto__ = __nox_super_80_147;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.set()).toBe(3);
// This is incorrect according to the spec,
// but close enough for loose.
// expect(value).toBe(3);
expect(value).toBe(1);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
// This is incorrect according to the spec,
// but close enough for loose.
// expect(obj.test).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set — call semantics getter defined on parent (exec)',
    source: `"use strict";
class Base {
  get test() {
    expect(this).toBe(obj);
    return function(...args) {
      expect(this).toBe(obj);
      expect(args).toEqual([1, 2, 3]);
      return 1;
    };
  }
}

class Obj extends Base {
  call() {
    super.test(1, 2, 3);
    super.test(1, ...[2, 3]);
    super.test(...[1, 2, 3]);
    return super.test(...arguments);
  }

  test() {
    throw new Error("called");
  }
}

const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this).toBe(obj);
        return function (...args) {
          expect(this).toBe(obj);
          expect(args).toEqual([1, 2, 3]);
          return 1;
        };
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_200_410 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_200_410 !== null && typeof __nox_super_200_410 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_200_410 && __nox_super_200_410.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_200_410);
  else Obj.__proto__ = __nox_super_200_410;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('called');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set — call semantics getter defined on parent (input)',
    source: `"use strict";
class Base {
  get test() {
    expect(this).toBe(obj);
    return function(...args) {
      expect(this).toBe(obj);
      expect(args).toEqual([1, 2, 3]);
      return 1;
    };
  }
}

class Obj extends Base {
  call() {
    super.test(1, 2, 3);
    super.test(1, ...[2, 3]);
    super.test(...[1, 2, 3]);
    return super.test(...arguments);
  }

  test() {
    throw new Error("called");
  }
}

const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this).toBe(obj);
        return function (...args) {
          expect(this).toBe(obj);
          expect(args).toEqual([1, 2, 3]);
          return 1;
        };
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_200_410 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_200_410 !== null && typeof __nox_super_200_410 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_200_410 && __nox_super_200_410.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_200_410);
  else Obj.__proto__ = __nox_super_200_410;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, 2, 3);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, 1, ...[2, 3]);
        _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...[1, 2, 3]);
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this, ...arguments);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('called');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.call(1, 2, 3)).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set — call semantics setter defined on parent (exec)',
    source: `"use strict";
class Base {
  set test(v) {
    throw new Error("gobbledygook");
  }
}

class Obj extends Base {
  call() {
    return super.test();
  }

  test() {
    throw new Error("gobbledygook");
  }
}

const obj = new Obj();
expect(() => {
  obj.call();

  // Assert that this throws, but that it's not
  // a gobbledygook error that is thrown
}).toThrow(TypeError)
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('gobbledygook');
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_87_206 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_87_206 !== null && typeof __nox_super_87_206 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_87_206 && __nox_super_87_206.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_87_206);
  else Obj.__proto__ = __nox_super_87_206;
  Object.defineProperty(Obj.prototype, 'call', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this).call(this);
      },
      'name',
      {
        value: 'call',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        throw new Error('gobbledygook');
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
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(() => {
  obj.call();
  // Assert that this throws, but that it's not
  // a gobbledygook error that is thrown
}).toThrow(TypeError);`,
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
      },
    ],
  },
  {
    title: 'get set — change computed key (exec)',
    source: `let x = 1;

class A {
  get [x]() {}
  [(x = 3, 2)]() {}
  set [x](_) {}
}

expect(Object.getOwnPropertyDescriptors(A.prototype)).toMatchObject({
  1: {
    get: expect.any(Function),
    set: undefined,
  },
  2: {
    value: expect.any(Function),
  },
  3: {
    get: undefined,
    set: expect.any(Function),
  }
});
`,
    filename: 'exec.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let x = 1;
let A = ((_key, _key16, _key17) => {
  'use strict';
  _key = _classKey(_key);
  _key16 = _classKey(_key16);
  _key17 = _classKey(_key17);
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, _key, {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          'get ' +
          (typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key)),
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A.prototype, _key16, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          typeof _key16 === 'symbol' ? { [_key16]: function () {} }[_key16].name : String(_key16),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A.prototype, _key17, {
    set: Object.defineProperty(
      function (_) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          'set ' +
          (typeof _key17 === 'symbol' ? { [_key17]: function () {} }[_key17].name : String(_key17)),
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})(x, ((x = 3), 2), x);
expect(Object.getOwnPropertyDescriptors(A.prototype)).toMatchObject({
  1: {
    get: expect.any(Function),
    set: undefined,
  },
  2: { value: expect.any(Function) },
  3: {
    get: undefined,
    set: expect.any(Function),
  },
});`,
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
      },
    ],
  },
  {
    title: 'get set — change computed key (input)',
    source: `class A {
  get [x]() {}
  [(x = 2, 3)]() {}
  set [x](_) {}
}
`,
    filename: 'input.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let A = ((_key, _key15, _key16) => {
  'use strict';
  _key = _classKey(_key);
  _key15 = _classKey(_key15);
  _key16 = _classKey(_key16);
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, _key, {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          'get ' +
          (typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key)),
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A.prototype, _key15, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          typeof _key15 === 'symbol' ? { [_key15]: function () {} }[_key15].name : String(_key15),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A.prototype, _key16, {
    set: Object.defineProperty(
      function (_) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          'set ' +
          (typeof _key16 === 'symbol' ? { [_key16]: function () {} }[_key16].name : String(_key16)),
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})(x, ((x = 2), 3), x);`,
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
      },
    ],
  },
  {
    title: 'get set — get semantics getter defined on parent (exec)',
    source: `"use strict";
class Base {
  get test() {
    expect(this).toBe(obj);
    return 1;
  }
}

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this).toBe(obj);
        return 1;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_91_154 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_91_154 !== null && typeof __nox_super_91_154 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_91_154 && __nox_super_91_154.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_91_154);
  else Obj.__proto__ = __nox_super_91_154;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set — get semantics getter defined on parent (input)',
    source: `"use strict";
class Base {
  get test() {
    expect(this).toBe(obj);
    return 1;
  }
}

class Obj extends Base {
  get() {
    return super.test;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this).toBe(obj);
        return 1;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_91_154 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_91_154 !== null && typeof __nox_super_91_154 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_91_154 && __nox_super_91_154.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_91_154);
  else Obj.__proto__ = __nox_super_91_154;
  Object.defineProperty(Obj.prototype, 'get', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Obj.prototype), 'test', this);
      },
      'name',
      {
        value: 'get',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.test).toBe(2);
expect(obj.get()).toBe(1);`,
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
      },
    ],
  },
  {
    title: 'get set — method conflict (exec)',
    source: `class A {
  get x() {}
  x() {}
  set x(_) {}
}

expect(Object.getOwnPropertyDescriptors(A.prototype)).toMatchObject({
  x: {
    get: undefined,
    set: expect.any(Function),
  }
});
`,
    filename: 'exec.js',
    output: `let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, 'x', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'get x',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A.prototype, 'x', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'x',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A.prototype, 'x', {
    set: Object.defineProperty(
      function (_) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'set x',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
expect(Object.getOwnPropertyDescriptors(A.prototype)).toMatchObject({
  x: {
    get: undefined,
    set: expect.any(Function),
  },
});`,
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
      },
    ],
  },
  {
    title: 'get set — method conflict (input)',
    source: `class A {
  get x() {}
  x() {}
  set x(_) {}
}
`,
    filename: 'input.js',
    output: `let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, 'x', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'get x',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A.prototype, 'x', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'x',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A.prototype, 'x', {
    set: Object.defineProperty(
      function (_) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'set x',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'get set — numeric keys (input)',
    source: `class A {
  get 1() {}
  set [1](_) {}

  get 2() {}
  set "2"(_) {}

  get 3n() {}
  set 3(_) {}

  get [4n]() {}
  set "4"(_) {}

  // Different keys
  get 5n() {}
  set "5n"(_) {}
}
`,
    filename: 'input.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let A = ((_key, _key15) => {
  'use strict';
  _key = _classKey(_key);
  _key15 = _classKey(_key15);
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, 1, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    },
    configurable: true,
  });
  Object.defineProperty(A.prototype, _key, {
    set: Object.defineProperty(
      function (_) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          'set ' +
          (typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key)),
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A.prototype, 2, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    },
    configurable: true,
  });
  Object.defineProperty(A.prototype, '2', {
    set: Object.defineProperty(
      function (_) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'set 2',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A.prototype, 3n, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    },
    configurable: true,
  });
  Object.defineProperty(A.prototype, 3, {
    set: function (_) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    },
    configurable: true,
  });
  Object.defineProperty(A.prototype, _key15, {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          'get ' +
          (typeof _key15 === 'symbol' ? { [_key15]: function () {} }[_key15].name : String(_key15)),
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A.prototype, '4', {
    set: Object.defineProperty(
      function (_) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'set 4',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A.prototype, 5n, {
    get: function () {
      // Different keys
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    },
    configurable: true,
  });
  Object.defineProperty(A.prototype, '5n', {
    set: Object.defineProperty(
      function (_) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'set 5n',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})(1, 4n);`,
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
      },
    ],
  },
  {
    title: 'get set — set semantics getter defined on parent (exec)',
    source: `"use strict";
let called = false;
class Base {
  get test() {
    called = true;
    return 1;
  }
};

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(() => {
  obj.set();
}).toThrow(TypeError);
expect(called).toBe(false);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(2);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let called = false;
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        called = true;
        return 1;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_103_170 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_103_170 !== null && typeof __nox_super_103_170 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_103_170 && __nox_super_103_170.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_103_170);
  else Obj.__proto__ = __nox_super_103_170;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(() => {
  obj.set();
}).toThrow(TypeError);
expect(called).toBe(false);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'get set — set semantics getter defined on parent (input)',
    source: `"use strict";
class Base {
  get test() {
    return 1;
  }
};

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(() => {
  // this requires helpers to be in file (not external), so they
  // are in "strict" mode code.
  obj.set();
}).toThrow(TypeError);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(2);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 1;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_64_131 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_64_131 !== null && typeof __nox_super_64_131 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_64_131 && __nox_super_64_131.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_64_131);
  else Obj.__proto__ = __nox_super_64_131;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(() => {
  // this requires helpers to be in file (not external), so they
  // are in "strict" mode code.
  obj.set();
}).toThrow(TypeError);
expect(Base.prototype.test).toBe(1);
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'get set — set semantics not defined on parent getter on obj (exec)',
    source: `"use strict";
class Base {
}

let called = false;
class Obj extends Base {
  get test() {
    called = true;
  }

  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(called).toBe(false);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(3);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let called = false;
let Obj = (__nox_super_50_156 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_50_156 !== null && typeof __nox_super_50_156 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_50_156 && __nox_super_50_156.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_50_156);
  else Obj.__proto__ = __nox_super_50_156;
  Object.defineProperty(Obj.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        called = true;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(called).toBe(false);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set — set semantics not defined on parent getter on obj (input)',
    source: `"use strict";
class Base {
}

class Obj extends Base {
  get test() { }

  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(3);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_30_115 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_30_115 !== null && typeof __nox_super_30_115 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_30_115 && __nox_super_30_115.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_30_115);
  else Obj.__proto__ = __nox_super_30_115;
  Object.defineProperty(Obj.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set — set semantics not defined on parent setter on obj (exec)',
    source: `"use strict";
class Base {
}

let value = 2;
class Obj extends Base {
  set test(v) {
    value = v;
  }

  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(value).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let value = 2;
let Obj = (__nox_super_45_148 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_45_148 !== null && typeof __nox_super_45_148 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_45_148 && __nox_super_45_148.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_45_148);
  else Obj.__proto__ = __nox_super_45_148;
  Object.defineProperty(Obj.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        value = v;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(value).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set — set semantics not defined on parent setter on obj (input)',
    source: `"use strict";
class Base {
}

let value = 2;
class Obj extends Base {
  set test(v) {
    expect(this).toBe(obj);
    value = v;
  }

  set() {
    return super.test = 3;
  }
}

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(value).toBe(2);
expect(obj.test).toBe(3);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let value = 2;
let Obj = (__nox_super_45_176 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_45_176 !== null && typeof __nox_super_45_176 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_45_176 && __nox_super_45_176.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_45_176);
  else Obj.__proto__ = __nox_super_45_176;
  Object.defineProperty(Obj.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this).toBe(obj);
        value = v;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBeUndefined();
expect(value).toBe(2);
expect(obj.test).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'get set — set semantics setter defined on parent (exec)',
    source: `"use strict";
let value = 1;
class Base {
  set test(v) {
    value = v;
  }
}

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(value).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(2);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let value = 1;
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        value = v;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_80_147 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_80_147 !== null && typeof __nox_super_80_147 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_80_147 && __nox_super_80_147.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_80_147);
  else Obj.__proto__ = __nox_super_80_147;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(value).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'get set — set semantics setter defined on parent (input)',
    source: `"use strict";
let value = 1;
class Base {
  set test(v) {
    value = v;
  }
}

class Obj extends Base {
  set() {
    return super.test = 3;
  }
}
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});

const obj = new Obj();
expect(obj.set()).toBe(3);
expect(value).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(2);
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = { set: require('@babel/runtime/helpers/set') },
  _superReference = {
    set: function (e, r, t, s) {
      return _superReference2.set(e, r, s, t, !0);
    },
  };
let value = 1;
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'test', {
    set: Object.defineProperty(
      function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        value = v;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Obj = (__nox_super_80_147 => {
  'use strict';
  const Obj = function Obj() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Obj), arguments, new.target || Obj);
    return _this;
  };
  if (__nox_super_80_147 !== null && typeof __nox_super_80_147 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Obj.prototype = Object.create(__nox_super_80_147 && __nox_super_80_147.prototype, {
    constructor: {
      value: Obj,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Obj, __nox_super_80_147);
  else Obj.__proto__ = __nox_super_80_147;
  Object.defineProperty(Obj.prototype, 'set', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _superReference.set(Object.getPrototypeOf(Obj.prototype), 'test', this, 3);
      },
      'name',
      {
        value: 'set',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Obj, 'prototype', { writable: false });
  return Obj;
})(Base);
Object.defineProperty(Obj.prototype, 'test', {
  value: 2,
  writable: true,
  configurable: true,
});
const obj = new Obj();
expect(obj.set()).toBe(3);
expect(value).toBe(3);
expect(Base.prototype.test).toBeUndefined();
expect(Obj.prototype.test).toBe(2);
expect(obj.test).toBe(2);`,
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
      },
    ],
  },
  {
    title: 'loose — blockstatement with use strict directive (input)',
    source: `function t() {
    "use strict";
    class Foo {
      method() {}
    }
  }`,
    filename: 'input.js',
    output: `function t() {
  'use strict';
  let Foo = (() => {
    'use strict';
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo.prototype, 'method', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
}`,
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
      },
    ],
  },
  {
    title: 'loose — constructor order (input)',
    source: `class x {
  f() {
    1
    2
    3
  }

  constructor() {
    4
    5
    6
  }
}
`,
    filename: 'input.js',
    output: `let x = (() => {
  'use strict';
  const x = function x() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    4;
    5;
    6;
  };
  Object.defineProperty(x.prototype, 'f', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        1;
        2;
        3;
      },
      'name',
      {
        value: 'f',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(x, 'prototype', { writable: false });
  return x;
})();`,
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
      },
    ],
  },
  {
    title: 'loose — default super (exec)',
    source: `class Test {
  constructor() {
    return super.constructor;
  }

  static test() {
    return super.constructor;
  }
}

// Instances
expect(Object.getPrototypeOf(Test.prototype)).toBe(Object.prototype);
expect(new Test()).toBe(Object);

// Static
expect(Object.getPrototypeOf(Test)).toBe(Function.prototype);
expect(Test.test()).toBe(Function);
`,
    filename: 'exec.js',
    output: `var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    return super.constructor;
  };
  Object.defineProperty(Test, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Test), 'constructor', this);
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
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();
// Instances
expect(Object.getPrototypeOf(Test.prototype)).toBe(Object.prototype);
expect(new Test()).toBe(Object);
// Static
expect(Object.getPrototypeOf(Test)).toBe(Function.prototype);
expect(Test.test()).toBe(Function);`,
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
      },
    ],
  },
  {
    title: 'loose — derived constructor must call super (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {

  }
}

expect(() => new Foo()).toThrow(ReferenceError, "this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_62 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {}.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_14_62 !== null && typeof __nox_super_14_62 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_62 && __nox_super_14_62.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_62);
  else Foo.__proto__ = __nox_super_14_62;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow(ReferenceError, "this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'loose — derived constructor must call super (input)',
    source: `class Foo extends Bar {
  constructor() {

  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (__nox_super_0_48 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {}.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_48 !== null && typeof __nox_super_0_48 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_48 && __nox_super_0_48.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_48);
  else Foo.__proto__ = __nox_super_0_48;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'loose — derived constructor no super return falsey (input)',
    source: `class Child extends Base {
    constructor(){
      return false;
    }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Child = (__nox_super_0_73 => {
  'use strict';
  const Child = function Child() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Child), arguments, _newtarget || Child);
      return _this;
    }
    var _result = function () {
      return false;
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_73 !== null && typeof __nox_super_0_73 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Child.prototype = Object.create(__nox_super_0_73 && __nox_super_0_73.prototype, {
    constructor: {
      value: Child,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Child, __nox_super_0_73);
  else Child.__proto__ = __nox_super_0_73;
  Object.defineProperty(Child, 'prototype', { writable: false });
  return Child;
})(Base);`,
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
      },
    ],
  },
  {
    title: 'loose — derived constructor no super return object (input)',
    source: `class Child extends Base {
    constructor(){
      return {};
    }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Child = (__nox_super_0_70 => {
  'use strict';
  const Child = function Child() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Child), arguments, _newtarget || Child);
      return _this;
    }
    var _result = function () {
      return {};
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_70 !== null && typeof __nox_super_0_70 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Child.prototype = Object.create(__nox_super_0_70 && __nox_super_0_70.prototype, {
    constructor: {
      value: Child,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Child, __nox_super_0_70);
  else Child.__proto__ = __nox_super_0_70;
  Object.defineProperty(Child, 'prototype', { writable: false });
  return Child;
})(Base);`,
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
      },
    ],
  },
  {
    title: 'loose — preserve comments (input)',
    source: `class C {
  /* before a */
  a() {}
  /* after a */
}
`,
    filename: 'input.js',
    output: `let C = (() => {
  'use strict';
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(C.prototype, 'a', {
    value: Object.defineProperty(
      function () {
        /* before a */
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'a',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(C, 'prototype', { writable: false });
  return C;
  /* after a */
})();`,
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
      },
    ],
  },
  {
    title: 'loose — returning from derived constructor (exec)',
    source: `"use strict";
class Foo {
  constructor() {
    return { x: 1 };
  }
}

expect(new Foo().x).toBe(1);

class Bar extends Foo {
  constructor() {
    super();
    return;
  }
}

expect(new Bar().x).toBe(1);

class Bar2 extends Foo {
  constructor() {
    super();
    expect(this.x).toBe(1);
    return { x: 2 };
  }
}

expect(new Bar2().x).toBe(2);


let singleton;
class Sub extends Foo {
  constructor() {
    if (singleton) {
      return singleton;
    }
    singleton = super();
  }
}

let instance = new Sub;
expect(instance).toBe(singleton);

instance = new Sub;
expect(instance).toBe(singleton);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    return { x: 1 };
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
expect(new Foo().x).toBe(1);
let Bar = (__nox_super_102_174 => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Bar), [], new.target || Bar);
    var _result = function () {
      return;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_102_174 !== null && typeof __nox_super_102_174 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Bar.prototype = Object.create(__nox_super_102_174 && __nox_super_102_174.prototype, {
    constructor: {
      value: Bar,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar, __nox_super_102_174);
  else Bar.__proto__ = __nox_super_102_174;
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})(Foo);
expect(new Bar().x).toBe(1);
let Bar2 = (__nox_super_206_316 => {
  'use strict';
  const Bar2 = function Bar2() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Bar2), [], new.target || Bar2);
    var _result = function () {
      expect(this.x).toBe(1);
      return { x: 2 };
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_206_316 !== null && typeof __nox_super_206_316 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Bar2.prototype = Object.create(__nox_super_206_316 && __nox_super_206_316.prototype, {
    constructor: {
      value: Bar2,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar2, __nox_super_206_316);
  else Bar2.__proto__ = __nox_super_206_316;
  Object.defineProperty(Bar2, 'prototype', { writable: false });
  return Bar2;
})(Foo);
expect(new Bar2().x).toBe(2);
let singleton;
let Sub = (__nox_super_365_488 => {
  'use strict';
  const Sub = function Sub() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Sub), arguments, _newtarget || Sub);
      return _this;
    }
    var _result = function () {
      if (singleton) {
        return singleton;
      }
      singleton = _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_365_488 !== null && typeof __nox_super_365_488 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Sub.prototype = Object.create(__nox_super_365_488 && __nox_super_365_488.prototype, {
    constructor: {
      value: Sub,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_365_488);
  else Sub.__proto__ = __nox_super_365_488;
  Object.defineProperty(Sub, 'prototype', { writable: false });
  return Sub;
})(Foo);
let instance = new Sub();
expect(instance).toBe(singleton);
instance = new Sub();
expect(instance).toBe(singleton);`,
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
      },
    ],
  },
  {
    title: 'loose — super destructuring array pattern 1 (input)',
    source: `class Foo {
  foo(props) {
    ;([x, ...super.client] = props);
  }
}`,
    filename: 'input.js',
    output: `var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'foo', {
    value: Object.defineProperty(
      function (props) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        [x, ..._superReference(Object.getPrototypeOf(Foo.prototype), 'client', this).value] = props;
      },
      'name',
      {
        value: 'foo',
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
      },
    ],
  },
  {
    title: 'loose — super destructuring array pattern (input)',
    source: `class Foo {
  foo(props) {
    ;([super.client] = props);
  }
}
`,
    filename: 'input.js',
    output: `var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'foo', {
    value: Object.defineProperty(
      function (props) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        [_superReference(Object.getPrototypeOf(Foo.prototype), 'client', this).value] = props;
      },
      'name',
      {
        value: 'foo',
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
      },
    ],
  },
  {
    title: 'loose — super destructuring object pattern 1 (input)',
    source: `class Foo {
  foo(props) {
    ;({ x, ...super.client } = props)
  }
}`,
    filename: 'input.js',
    output: `var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'foo', {
    value: Object.defineProperty(
      function (props) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        ({ x, ..._superReference(Object.getPrototypeOf(Foo.prototype), 'client', this).value } =
          props);
      },
      'name',
      {
        value: 'foo',
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
      },
    ],
  },
  {
    title: 'loose — super destructuring object pattern (input)',
    source: `class Foo {
  foo(props) {
    ;({ client: super.client } = props)
  }
}`,
    filename: 'input.js',
    output: `var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'foo', {
    value: Object.defineProperty(
      function (props) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        ({ client: _superReference(Object.getPrototypeOf(Foo.prototype), 'client', this).value } =
          props);
      },
      'name',
      {
        value: 'foo',
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
      },
    ],
  },
  {
    title: 'misc — function name ts annotation (input)',
    source: `class Database {
  transaction(
    // If the type annotation here contains the *name of the method*
    // then it changes how the method is compiled. Rename \`transaction\`
    // below and see how the output changes.
    callback: (transaction: Transaction) => unknown,
  ) {
    return this.table.transaction(
      (x) => callback(new DaoTransaction(x)),
    );
  }
}
`,
    filename: 'input.ts',
    output: `let Database = (() => {
  'use strict';
  const Database = function Database() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Database.prototype, 'transaction', {
    value: Object.defineProperty(
      function (callback) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return this.table.transaction(x => callback(new DaoTransaction(x)));
      },
      'name',
      {
        value: 'transaction',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Database, 'prototype', { writable: false });
  return Database;
})();`,
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
      },
    ],
  },
  {
    title: 'misc — missing class properties transform private (input)',
    source: `class Test {
  #key = '';

  method() {
      return this.#key;
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
let Test = (() => {
  'use strict';
  var _key = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Test_key');
  function _initialize() {
    Object.defineProperty(this, _key, {
      writable: true,
      value: '',
    });
  }
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Test.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(this, _key)[_key];
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
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'misc — missing class properties transform public (input)',
    source: `class Test {
  key = '';

  method() {
      return this.key;
  }
}
`,
    filename: 'input.js',
    output: `let Test = (() => {
  'use strict';
  function _initialize() {
    Object.defineProperty(this, 'key', {
      value: '',
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Test.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return this.key;
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
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'misc — this before super 2 (input)',
    source: `class Foo extends Bar {
  constructor() {
    if (dynamic()) super();
    this;
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Foo = (__nox_super_0_85 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      if (dynamic()) _super();
      _construct.assert(_this);
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_85 !== null && typeof __nox_super_0_85 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_85 && __nox_super_0_85.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_85);
  else Foo.__proto__ = __nox_super_0_85;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'misc — this before super 3 (input)',
    source: `class Foo extends Bar {
  constructor() {
    super(this);
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (__nox_super_0_64 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Foo), [this], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_64 !== null && typeof __nox_super_0_64 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_64 && __nox_super_0_64.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_64);
  else Foo.__proto__ = __nox_super_0_64;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'misc — this before super (input)',
    source: `class Foo extends Bar {
  constructor() {
    this;
    super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Foo = (__nox_super_0_70 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _construct.assert(_this);
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_70 !== null && typeof __nox_super_0_70 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_70 && __nox_super_0_70.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_70);
  else Foo.__proto__ = __nox_super_0_70;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'regression — 14652 (input)',
    source: `class C extends P {
  constructor() {
    super(super(super()))
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let C = (__nox_super_0_69 => {
  'use strict';
  const C = function C() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(C), arguments, _newtarget || C);
      return _this;
    }
    var _result = function () {
      _super(_super(_super()));
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_69 !== null && typeof __nox_super_0_69 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  C.prototype = Object.create(__nox_super_0_69 && __nox_super_0_69.prototype, {
    constructor: {
      value: C,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(C, __nox_super_0_69);
  else C.__proto__ = __nox_super_0_69;
  Object.defineProperty(C, 'prototype', { writable: false });
  return C;
})(P);`,
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
      },
    ],
  },
  {
    title: 'regression — 2663 (input)',
    source: `import net from 'net';
import { EventEmitter } from 'events';
import BinarySerializer from './helpers/binary-serializer';
// import ...

export default class Connection extends EventEmitter {
    constructor(endpoint, joinKey, joinData, roomId) {
        super();

        this.isConnected = false;
        this.roomId = roomId;

        // ...
    }

    send(message) {
        this.sock.write(BinarySerializer.serializeMessage(message));
    }

    disconnect() {
        this.sock.close();
    }
}
`,
    filename: 'input.mjs',
    output: `import _babelHelper from '@babel/runtime/helpers/construct';
import _babelHelper2 from '@babel/runtime/helpers/assertThisInitialized';
var _construct2 = {
  construct: _babelHelper,
  assertThisInitialized: _babelHelper2,
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
import net from 'net';
import { EventEmitter } from 'events';
import BinarySerializer from './helpers/binary-serializer';
// import ...
let Connection = (__nox_super_152_501 => {
  'use strict';
  const Connection = function Connection(_argument, _argument22, _argument23, _argument24) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Connection), arguments, _newtarget || Connection);
      return _this;
    }
    var _result = function (endpoint, joinKey, joinData, roomId) {
      _super();
      _construct.assert(_this).isConnected = false;
      _construct.assert(_this).roomId = roomId;
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
    // ...
  };
  if (__nox_super_152_501 !== null && typeof __nox_super_152_501 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Connection.prototype = Object.create(__nox_super_152_501 && __nox_super_152_501.prototype, {
    constructor: {
      value: Connection,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Connection, __nox_super_152_501);
  else Connection.__proto__ = __nox_super_152_501;
  Object.defineProperty(Connection.prototype, 'send', {
    value: Object.defineProperty(
      function (message) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.sock.write(BinarySerializer.serializeMessage(message));
      },
      'name',
      {
        value: 'send',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Connection.prototype, 'disconnect', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.sock.close();
      },
      'name',
      {
        value: 'disconnect',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Connection, 'prototype', { writable: false });
  return Connection;
})(EventEmitter);
export default Connection;`,
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
      },
    ],
  },
  {
    title: 'regression — 2694 (input)',
    source: `import BaseFoo from './BaseFoo';

export default class SubFoo extends BaseFoo {
  static talk() {
    super.talk();
    console.log('SubFoo.talk');
  }
}
`,
    filename: 'input.mjs',
    output: `import _babelHelper from '@babel/runtime/helpers/construct';
import _babelHelper2 from '@babel/runtime/helpers/get';
var _construct2 = { construct: _babelHelper };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: _babelHelper2 };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
import BaseFoo from './BaseFoo';
let SubFoo = (__nox_super_49_153 => {
  'use strict';
  const SubFoo = function SubFoo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(SubFoo), arguments, new.target || SubFoo);
    return _this;
  };
  if (__nox_super_49_153 !== null && typeof __nox_super_49_153 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  SubFoo.prototype = Object.create(__nox_super_49_153 && __nox_super_49_153.prototype, {
    constructor: {
      value: SubFoo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(SubFoo, __nox_super_49_153);
  else SubFoo.__proto__ = __nox_super_49_153;
  Object.defineProperty(SubFoo, 'talk', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(SubFoo), 'talk', this).call(this);
        console.log('SubFoo.talk');
      },
      'name',
      {
        value: 'talk',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(SubFoo, 'prototype', { writable: false });
  return SubFoo;
})(BaseFoo);
export default SubFoo;`,
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
      },
    ],
  },
  {
    title: 'regression — 2775 (input)',
    source: `import React, {Component} from 'react';

export default class RandomComponent extends Component {
  constructor(){
    super();
  }

  render() {
    return (
      <div className='sui-RandomComponent'>
        <h2>Hi there!</h2>
      </div>
    );
  }
}
`,
    filename: 'input.jsx',
    output: `import _babelHelper from '@babel/runtime/helpers/construct';
var _construct2 = { construct: _babelHelper };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
import React, { Component } from 'react';
let RandomComponent = (__nox_super_56_255 => {
  'use strict';
  const RandomComponent = function RandomComponent() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(RandomComponent),
      [],
      new.target || RandomComponent,
    );
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_56_255 !== null && typeof __nox_super_56_255 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  RandomComponent.prototype = Object.create(__nox_super_56_255 && __nox_super_56_255.prototype, {
    constructor: {
      value: RandomComponent,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(RandomComponent, __nox_super_56_255);
  else RandomComponent.__proto__ = __nox_super_56_255;
  Object.defineProperty(RandomComponent.prototype, 'render', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return (
          <div className="sui-RandomComponent">
            <h2>Hi there!</h2>
          </div>
        );
      },
      'name',
      {
        value: 'render',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(RandomComponent, 'prototype', { writable: false });
  return RandomComponent;
})(Component);
export default RandomComponent;`,
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
      },
    ],
  },
  {
    title: 'regression — 2941 (input)',
    source: `export default class {}
`,
    filename: 'input.mjs',
    output: `let _Class = (() => {
  'use strict';
  const _Class = function _Class() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class, 'prototype', { writable: false });
  return _Class;
})();
export default _Class;`,
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
      },
    ],
  },
  {
    title: 'regression — 3028 (input)',
    source: `class b {
}

class a1 extends b {
  constructor() {
    super();
    this.x = () => this;
  }
}

export default class a2 extends b {
  constructor() {
    super();
    this.x = () => this;
  }
}
`,
    filename: 'input.mjs',
    output: `import _babelHelper from '@babel/runtime/helpers/construct';
var _construct2 = { construct: _babelHelper };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let b = (() => {
  'use strict';
  const b = function b() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(b, 'prototype', { writable: false });
  return b;
})();
let a1 = (__nox_super_13_95 => {
  'use strict';
  const a1 = function a1() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(a1), [], new.target || a1);
    var _result = function () {
      this.x = () => this;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_13_95 !== null && typeof __nox_super_13_95 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  a1.prototype = Object.create(__nox_super_13_95 && __nox_super_13_95.prototype, {
    constructor: {
      value: a1,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(a1, __nox_super_13_95);
  else a1.__proto__ = __nox_super_13_95;
  Object.defineProperty(a1, 'prototype', { writable: false });
  return a1;
})(b);
let a2 = (__nox_super_112_194 => {
  'use strict';
  const a2 = function a2() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(a2), [], new.target || a2);
    var _result = function () {
      this.x = () => this;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_112_194 !== null && typeof __nox_super_112_194 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  a2.prototype = Object.create(__nox_super_112_194 && __nox_super_112_194.prototype, {
    constructor: {
      value: a2,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(a2, __nox_super_112_194);
  else a2.__proto__ = __nox_super_112_194;
  Object.defineProperty(a2, 'prototype', { writable: false });
  return a2;
})(b);
export default a2;`,
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
      },
    ],
  },
  {
    title: 'regression — 5769 (exec)',
    source: `class Point {
  getX() {
    expect(this.x).toBe(3); // C
  }
}

class ColorPoint extends Point {
  constructor() {
    super();
    this.x = 2;
    super.x = 3;
    expect(this.x).toBe(3);   // A
    expect(super.x).toBeUndefined();  // B
  }

  m() {
    this.getX()
  }
}

const cp = new ColorPoint();
cp.m();
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, r, t) {
  return _superReference2.get(e, r, t);
}
var _superReference = {
  set: function (e, r, t, u) {
    return _superReference2.set(e, r, u, t, !0);
  },
};
let Point = (() => {
  'use strict';
  const Point = function Point() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Point.prototype, 'getX', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this.x).toBe(3);
      },
      'name',
      {
        value: 'getX',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Point, 'prototype', { writable: false });
  return Point;
})();
let ColorPoint = (__nox_super_65_274 => {
  'use strict';
  const ColorPoint = function ColorPoint() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(ColorPoint), [], new.target || ColorPoint);
    var _result = function () {
      this.x = 2;
      _superReference.set(Object.getPrototypeOf(ColorPoint.prototype), 'x', this, 3);
      expect(this.x).toBe(3);
      expect(_get(Object.getPrototypeOf(ColorPoint.prototype), 'x', this)).toBeUndefined();
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_65_274 !== null && typeof __nox_super_65_274 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  ColorPoint.prototype = Object.create(__nox_super_65_274 && __nox_super_65_274.prototype, {
    constructor: {
      value: ColorPoint,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(ColorPoint, __nox_super_65_274);
  else ColorPoint.__proto__ = __nox_super_65_274;
  Object.defineProperty(ColorPoint.prototype, 'm', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.getX();
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
  Object.defineProperty(ColorPoint, 'prototype', { writable: false });
  return ColorPoint;
})(Point);
const cp = new ColorPoint();
cp.m();`,
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
      },
    ],
  },
  {
    title: 'regression — 5769 (input)',
    source: `class Point {
  getX() {
    expect(this.x).toBe(3); // C
  }
}

class ColorPoint extends Point {
  constructor() {
    super();
    this.x = 2;
    super.x = 3;
    expect(this.x).toBe(3);   // A
    expect(super.x).toBeUndefined();  // B
  }

  m() {
    this.getX();
  }
}

const cp = new ColorPoint();
cp.m();
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, r, t) {
  return _superReference2.get(e, r, t);
}
var _superReference = {
  set: function (e, r, t, u) {
    return _superReference2.set(e, r, u, t, !0);
  },
};
let Point = (() => {
  'use strict';
  const Point = function Point() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Point.prototype, 'getX', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        expect(this.x).toBe(3);
      },
      'name',
      {
        value: 'getX',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Point, 'prototype', { writable: false });
  return Point;
})();
let ColorPoint = (__nox_super_65_275 => {
  'use strict';
  const ColorPoint = function ColorPoint() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(ColorPoint), [], new.target || ColorPoint);
    var _result = function () {
      this.x = 2;
      _superReference.set(Object.getPrototypeOf(ColorPoint.prototype), 'x', this, 3);
      expect(this.x).toBe(3);
      expect(_get(Object.getPrototypeOf(ColorPoint.prototype), 'x', this)).toBeUndefined();
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_65_275 !== null && typeof __nox_super_65_275 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  ColorPoint.prototype = Object.create(__nox_super_65_275 && __nox_super_65_275.prototype, {
    constructor: {
      value: ColorPoint,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(ColorPoint, __nox_super_65_275);
  else ColorPoint.__proto__ = __nox_super_65_275;
  Object.defineProperty(ColorPoint.prototype, 'm', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.getX();
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
  Object.defineProperty(ColorPoint, 'prototype', { writable: false });
  return ColorPoint;
})(Point);
const cp = new ColorPoint();
cp.m();`,
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
      },
    ],
  },
  {
    title: 'regression — 5817 (exec)',
    source: `// https://github.com/babel/babel/issues/5817

class Parent {}

class Table extends Parent {
  constructor() {
    super();
    this.returnParam = (param) => {
      return param;
    }
  }
}

const table = new Table();

expect(table.returnParam(false)).toBe(false);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
// https://github.com/babel/babel/issues/5817
let Parent = (() => {
  'use strict';
  const Parent = function Parent() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Parent, 'prototype', { writable: false });
  return Parent;
})();
let Table = (__nox_super_64_191 => {
  'use strict';
  const Table = function Table() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Table), [], new.target || Table);
    var _result = function () {
      this.returnParam = param => {
        return param;
      };
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_64_191 !== null && typeof __nox_super_64_191 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Table.prototype = Object.create(__nox_super_64_191 && __nox_super_64_191.prototype, {
    constructor: {
      value: Table,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Table, __nox_super_64_191);
  else Table.__proto__ = __nox_super_64_191;
  Object.defineProperty(Table, 'prototype', { writable: false });
  return Table;
})(Parent);
const table = new Table();
expect(table.returnParam(false)).toBe(false);`,
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
      },
    ],
  },
  {
    title: 'regression — 5817 (input)',
    source: `class A extends B {
  constructor() {
    super();

    this.arrow1 = (x) => { return x; };
    this.arrow2 = (x) => x;
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let A = (__nox_super_0_125 => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(A), [], new.target || A);
    var _result = function () {
      this.arrow1 = x => {
        return x;
      };
      this.arrow2 = x => x;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_125 !== null && typeof __nox_super_0_125 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  A.prototype = Object.create(__nox_super_0_125 && __nox_super_0_125.prototype, {
    constructor: {
      value: A,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(A, __nox_super_0_125);
  else A.__proto__ = __nox_super_0_125;
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})(B);`,
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
      },
    ],
  },
  {
    title: 'regression — 8499 (exec)',
    source: `// Pretend that \`Reflect.construct\` isn't supported.
global.Reflect = undefined;

global.HTMLElement = function() {
  // Here, \`this.HTMLElement\` is this function, not the original HTMLElement
  // constructor. \`this.constructor\` should be this function too, but isn't.
  constructor = this.constructor;
};

var constructor;

class CustomElement extends HTMLElement {}
new CustomElement();

expect(constructor).toBe(CustomElement);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
// Pretend that \`Reflect.construct\` isn't supported.
global.Reflect = undefined;
global.HTMLElement = function () {
  // Here, \`this.HTMLElement\` is this function, not the original HTMLElement
  // constructor. \`this.constructor\` should be this function too, but isn't.
  constructor = this.constructor;
};
var constructor;
let CustomElement = (__nox_super_326_368 => {
  'use strict';
  const CustomElement = function CustomElement() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(CustomElement),
      arguments,
      new.target || CustomElement,
    );
    return _this;
  };
  if (__nox_super_326_368 !== null && typeof __nox_super_326_368 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  CustomElement.prototype = Object.create(__nox_super_326_368 && __nox_super_326_368.prototype, {
    constructor: {
      value: CustomElement,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(CustomElement, __nox_super_326_368);
  else CustomElement.__proto__ = __nox_super_326_368;
  Object.defineProperty(CustomElement, 'prototype', { writable: false });
  return CustomElement;
})(HTMLElement);
new CustomElement();
expect(constructor).toBe(CustomElement);`,
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
      },
    ],
  },
  {
    title: 'regression — 8499 (input)',
    source: `const oldReflect = this.Reflect;
const oldHTMLElement = this.HTMLElement;

try {
  // Pretend that \`Reflect.construct\` isn't supported.
  this.Reflect = undefined;

  this.HTMLElement = function() {
    // Here, \`this.HTMLElement\` is this function, not the original HTMLElement
    // constructor. \`this.constructor\` should be this function too, but isn't.
    constructor = this.constructor;
  };

  var constructor;

  class CustomElement extends HTMLElement {};
  new CustomElement();

  expect(constructor).toBe(CustomElement);
} finally {
  // Restore original env
  this.Reflect = oldReflect;
  this.HTMLElement = oldHTMLElement;
}


`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
const oldReflect = this.Reflect;
const oldHTMLElement = this.HTMLElement;
try {
  // Pretend that \`Reflect.construct\` isn't supported.
  this.Reflect = undefined;
  this.HTMLElement = function () {
    // Here, \`this.HTMLElement\` is this function, not the original HTMLElement
    // constructor. \`this.constructor\` should be this function too, but isn't.
    constructor = this.constructor;
  };
  var constructor;
  let CustomElement = (__nox_super_421_463 => {
    'use strict';
    const CustomElement = function CustomElement() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(
        Object.getPrototypeOf(CustomElement),
        arguments,
        new.target || CustomElement,
      );
      return _this;
    };
    if (__nox_super_421_463 !== null && typeof __nox_super_421_463 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    CustomElement.prototype = Object.create(__nox_super_421_463 && __nox_super_421_463.prototype, {
      constructor: {
        value: CustomElement,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(CustomElement, __nox_super_421_463);
    else CustomElement.__proto__ = __nox_super_421_463;
    Object.defineProperty(CustomElement, 'prototype', { writable: false });
    return CustomElement;
  })(HTMLElement);
  new CustomElement();
  expect(constructor).toBe(CustomElement);
} finally {
  // Restore original env
  this.Reflect = oldReflect;
  this.HTMLElement = oldHTMLElement;
}`,
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
      },
    ],
  },
  {
    title: 'regression — T2494 (input)',
    source: `var x = {
  Foo: class extends Foo {}
};
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var x = {
  Foo: (__nox_super_17_37 => {
    'use strict';
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(Object.getPrototypeOf(_Class), arguments, new.target || _Class);
      return _this;
    };
    Object.defineProperty(_Class, 'name', {
      value: 'Foo',
      configurable: true,
    });
    if (__nox_super_17_37 !== null && typeof __nox_super_17_37 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    _Class.prototype = Object.create(__nox_super_17_37 && __nox_super_17_37.prototype, {
      constructor: {
        value: _Class,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_17_37);
    else _Class.__proto__ = __nox_super_17_37;
    Object.defineProperty(_Class, 'prototype', { writable: false });
    return _Class;
  })(Foo),
};`,
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
      },
    ],
  },
  {
    title: 'regression — T2997 (input)',
    source: `class A {}

class B extends A {
  constructor() {
    return super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
let B = (__nox_super_12_75 => {
  'use strict';
  const B = function B() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(B), [], new.target || B);
    var _result = function () {
      return this;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_12_75 !== null && typeof __nox_super_12_75 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  B.prototype = Object.create(__nox_super_12_75 && __nox_super_12_75.prototype, {
    constructor: {
      value: B,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_12_75);
  else B.__proto__ = __nox_super_12_75;
  Object.defineProperty(B, 'prototype', { writable: false });
  return B;
})(A);`,
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
      },
    ],
  },
  {
    title: 'regression — T6712 (input)',
    source: `class A {
  foo() {
    const foo = 2;
  }
}
`,
    filename: 'input.js',
    output: `let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, 'foo', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        const foo = 2;
      },
      'name',
      {
        value: 'foo',
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
      },
    ],
  },
  {
    title: 'regression — T6750 (input)',
    source: `export default function() {
  return class Select {
    query(query) {
    }
  }
}
`,
    filename: 'input.mjs',
    output: `export default function () {
  return (() => {
    'use strict';
    const Select = function Select() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Select.prototype, 'query', {
      value: Object.defineProperty(
        function (query) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        },
        'name',
        {
          value: 'query',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Select, 'prototype', { writable: false });
    return Select;
  })();
}`,
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
      },
    ],
  },
  {
    title: 'regression — T6755 (input)',
    source: `class Example {
  async test1(){
    await Promise.resolve(2);
  }

  *test2(){
    yield 3;
  }
}
`,
    filename: 'input.js',
    output: `let Example = (() => {
  'use strict';
  const Example = function Example() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Example.prototype, 'test1', {
    value: Object.defineProperty(
      async function () {
        await Promise.resolve(2);
      },
      'name',
      {
        value: 'test1',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Example.prototype, 'test2', {
    value: Object.defineProperty(
      function* () {
        yield 3;
      },
      'name',
      {
        value: 'test2',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Example, 'prototype', { writable: false });
  return Example;
})();`,
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
      },
    ],
  },
  {
    title: 'regression — T7010 (input)',
    source: `class Foo {
  constructor(val){
    this._val = val;
  }
  foo2(){
    return foo2(this._val);
  }
}
`,
    filename: 'input.js',
    output: `let Foo = (() => {
  'use strict';
  const Foo = function Foo(val) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    this._val = val;
  };
  Object.defineProperty(Foo.prototype, 'foo2', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return foo2(this._val);
      },
      'name',
      {
        value: 'foo2',
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
      },
    ],
  },
  {
    title: 'regression — regression 1155 (input)',
    source: `class Foo extends Bar {
  constructor (options) {
    let parentOptions = {};
    parentOptions.init = function () {
      this;
    };
    super(parentOptions);
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (__nox_super_0_167 => {
  'use strict';
  const Foo = function Foo(_argument) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function (options) {
      let parentOptions = {};
      parentOptions.init = function () {
        this;
      };
      _super(parentOptions);
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_167 !== null && typeof __nox_super_0_167 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_167 && __nox_super_0_167.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_167);
  else Foo.__proto__ = __nox_super_0_167;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — accessing super class (input)',
    source: `class Test extends Foo {
  constructor() {
    woops.super.test();
    super();
    super.test();

    super(...arguments);
    super("test", ...arguments);

    super.test(...arguments);
    super.test("test", ...arguments);
  }

  test() {
    super.test();
    super.test(...arguments);
    super.test("test", ...arguments);
  }

  static foo() {
    super.foo();
    super.foo(...arguments);
    super.foo("test", ...arguments);
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Test = (__nox_super_0_438 => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Test), arguments, _newtarget || Test);
      return _this;
    }
    var _result = function () {
      woops.super.test();
      _super();
      _get(Object.getPrototypeOf(Test.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
      );
      _super(...arguments);
      _super('test', ...arguments);
      _get(Object.getPrototypeOf(Test.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
        ...arguments,
      );
      _get(Object.getPrototypeOf(Test.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
        'test',
        ...arguments,
      );
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_438 !== null && typeof __nox_super_0_438 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test.prototype = Object.create(__nox_super_0_438 && __nox_super_0_438.prototype, {
    constructor: {
      value: Test,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test, __nox_super_0_438);
  else Test.__proto__ = __nox_super_0_438;
  Object.defineProperty(Test.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(Test.prototype), 'test', this).call(this);
        _get(Object.getPrototypeOf(Test.prototype), 'test', this).call(this, ...arguments);
        _get(Object.getPrototypeOf(Test.prototype), 'test', this).call(this, 'test', ...arguments);
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
  Object.defineProperty(Test, 'foo', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _get(Object.getPrototypeOf(Test), 'foo', this).call(this);
        _get(Object.getPrototypeOf(Test), 'foo', this).call(this, ...arguments);
        _get(Object.getPrototypeOf(Test), 'foo', this).call(this, 'test', ...arguments);
      },
      'name',
      {
        value: 'foo',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})(Foo);`,
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
      },
    ],
  },
  {
    title: 'spec — computed key class tdz (exec)',
    source: `expect(() => {
  class A {
    [A.name]() {}
  }
}).toThrow(ReferenceError);
`,
    filename: 'exec.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
expect(() => {
  let A = (_key => {
    'use strict';
    _key = _classKey(_key);
    const A = function A() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(A.prototype, _key, {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        },
        'name',
        {
          value: typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(A, 'prototype', { writable: false });
    return A;
  })(A.name);
}).toThrow(ReferenceError);`,
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
      },
    ],
  },
  {
    title: 'spec — computed keys call order (exec)',
    source: `var log = [];

class A {
  [log.push(1)]() {}
  static [log.push(2)]() {}
  [log.push(3)]() {}
  static [log.push(4)]() {}
}

expect(log).toEqual([1, 2, 3, 4]);

`,
    filename: 'exec.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
var log = [];
let A = ((_key, _key15, _key16, _key17) => {
  'use strict';
  _key = _classKey(_key);
  _key15 = _classKey(_key15);
  _key16 = _classKey(_key16);
  _key17 = _classKey(_key17);
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, _key, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, _key15, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          typeof _key15 === 'symbol' ? { [_key15]: function () {} }[_key15].name : String(_key15),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A.prototype, _key16, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          typeof _key16 === 'symbol' ? { [_key16]: function () {} }[_key16].name : String(_key16),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, _key17, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          typeof _key17 === 'symbol' ? { [_key17]: function () {} }[_key17].name : String(_key17),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})(log.push(1), log.push(2), log.push(3), log.push(4));
expect(log).toEqual([1, 2, 3, 4]);`,
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
      },
    ],
  },
  {
    title: 'spec — computed keys yield await (input)',
    source: `async function* fn() {
  class A {
    [yield 1]() {}
  }

  class B extends A {
    [await 1]() {}
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
async function* fn() {
  let A = (_key => {
    'use strict';
    _key = _classKey(_key);
    const A = function A() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(A.prototype, _key, {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        },
        'name',
        {
          value: typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(A, 'prototype', { writable: false });
    return A;
  })(yield 1);
  let B = ((__nox_super_61_103, _key18) => {
    'use strict';
    _key18 = _classKey(_key18);
    const B = function B() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(Object.getPrototypeOf(B), arguments, new.target || B);
      return _this;
    };
    if (__nox_super_61_103 !== null && typeof __nox_super_61_103 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    B.prototype = Object.create(__nox_super_61_103 && __nox_super_61_103.prototype, {
      constructor: {
        value: B,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_61_103);
    else B.__proto__ = __nox_super_61_103;
    Object.defineProperty(B.prototype, _key18, {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        },
        'name',
        {
          value:
            typeof _key18 === 'symbol' ? { [_key18]: function () {} }[_key18].name : String(_key18),
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(B, 'prototype', { writable: false });
    return B;
  })(A, await 1);
}`,
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
      },
    ],
  },
  {
    title: 'spec — computed methods (exec)',
    source: `const sym = Symbol();

class Foo {
  [sym] () {
    return 1;
  }
}

class Bar extends Foo {
  [sym] () {
    return super[sym]() + 2;
  }
}

let i = new Bar();

expect(i[sym]()).toBe(3);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
const sym = Symbol();
let Foo = (_key => {
  'use strict';
  _key = _classKey(_key);
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, _key, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 1;
      },
      'name',
      {
        value: typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(sym);
let Bar = ((__nox_super_69_140, _key19) => {
  'use strict';
  _key19 = _classKey(_key19);
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Bar), arguments, new.target || Bar);
    return _this;
  };
  if (__nox_super_69_140 !== null && typeof __nox_super_69_140 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Bar.prototype = Object.create(__nox_super_69_140 && __nox_super_69_140.prototype, {
    constructor: {
      value: Bar,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar, __nox_super_69_140);
  else Bar.__proto__ = __nox_super_69_140;
  Object.defineProperty(Bar.prototype, _key19, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Bar.prototype), sym, this).call(this) + 2;
      },
      'name',
      {
        value:
          typeof _key19 === 'symbol' ? { [_key19]: function () {} }[_key19].name : String(_key19),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})(Foo, sym);
let i = new Bar();
expect(i[sym]()).toBe(3);`,
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
      },
    ],
  },
  {
    title: 'spec — computed methods (input)',
    source: `class Foo {
  foo() {}
  "foo"() { "second" }
  [bar]() {}
  [bar + "foo"]() {}
}
`,
    filename: 'input.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let Foo = ((_key, _key14) => {
  'use strict';
  _key = _classKey(_key);
  _key14 = _classKey(_key14);
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'foo', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'foo',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, 'foo', {
    value: Object.defineProperty(
      function () {
        'second';
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'foo',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, _key, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, _key14, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          typeof _key14 === 'symbol' ? { [_key14]: function () {} }[_key14].name : String(_key14),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(bar, bar + 'foo');`,
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
      },
    ],
  },
  {
    title: 'spec — computed toPrimitive (exec)',
    source: `const foo = { [Symbol.toPrimitive]: () => "foo" };

expect((new class { [foo](){ return 0; } }).foo()).toBe(0);
expect((new class { get [foo](){ return 0; } }).foo).toBe(0);
expect((new class { set [foo](v){ return v; } }).foo = 0).toBe(0);

const arrayLike = { [Symbol.toPrimitive] : () => [] };

expect(() => new class { [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => new class { get [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => new class { set [arrayLike](v){ return v; } }).toThrow("@@toPrimitive must return a primitive value.");
`,
    filename: 'exec.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
const foo = { [Symbol.toPrimitive]: () => 'foo' };
expect(
  new ((_key => {
    'use strict';
    _key = _classKey(_key);
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class.prototype, _key, {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return 0;
        },
        'name',
        {
          value: typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class, 'prototype', { writable: false });
    return _Class;
  })(foo))().foo(),
).toBe(0);
expect(
  new ((_key20 => {
    'use strict';
    _key20 = _classKey(_key20);
    const _Class19 = function _Class19() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class19.prototype, _key20, {
      get: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return 0;
        },
        'name',
        {
          value:
            'get ' +
            (typeof _key20 === 'symbol'
              ? { [_key20]: function () {} }[_key20].name
              : String(_key20)),
          configurable: true,
        },
      ),
      configurable: true,
    });
    Object.defineProperty(_Class19, 'prototype', { writable: false });
    return _Class19;
  })(foo))().foo,
).toBe(0);
expect(
  (new ((_key24 => {
    'use strict';
    _key24 = _classKey(_key24);
    const _Class23 = function _Class23() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class23.prototype, _key24, {
      set: Object.defineProperty(
        function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return v;
        },
        'name',
        {
          value:
            'set ' +
            (typeof _key24 === 'symbol'
              ? { [_key24]: function () {} }[_key24].name
              : String(_key24)),
          configurable: true,
        },
      ),
      configurable: true,
    });
    Object.defineProperty(_Class23, 'prototype', { writable: false });
    return _Class23;
  })(foo))().foo = 0),
).toBe(0);
const arrayLike = { [Symbol.toPrimitive]: () => [] };
expect(
  () =>
    new ((_key28 => {
      'use strict';
      _key28 = _classKey(_key28);
      const _Class27 = function _Class27() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(_Class27.prototype, _key28, {
        value: Object.defineProperty(
          function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 0;
          },
          'name',
          {
            value:
              typeof _key28 === 'symbol'
                ? { [_key28]: function () {} }[_key28].name
                : String(_key28),
            configurable: true,
          },
        ),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(_Class27, 'prototype', { writable: false });
      return _Class27;
    })(arrayLike))(),
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    new ((_key32 => {
      'use strict';
      _key32 = _classKey(_key32);
      const _Class31 = function _Class31() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(_Class31.prototype, _key32, {
        get: Object.defineProperty(
          function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 0;
          },
          'name',
          {
            value:
              'get ' +
              (typeof _key32 === 'symbol'
                ? { [_key32]: function () {} }[_key32].name
                : String(_key32)),
            configurable: true,
          },
        ),
        configurable: true,
      });
      Object.defineProperty(_Class31, 'prototype', { writable: false });
      return _Class31;
    })(arrayLike))(),
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    new ((_key36 => {
      'use strict';
      _key36 = _classKey(_key36);
      const _Class35 = function _Class35() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(_Class35.prototype, _key36, {
        set: Object.defineProperty(
          function (v) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return v;
          },
          'name',
          {
            value:
              'set ' +
              (typeof _key36 === 'symbol'
                ? { [_key36]: function () {} }[_key36].name
                : String(_key36)),
            configurable: true,
          },
        ),
        configurable: true,
      });
      Object.defineProperty(_Class35, 'prototype', { writable: false });
      return _Class35;
    })(arrayLike))(),
).toThrow('@@toPrimitive must return a primitive value.');`,
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
      },
    ],
  },
  {
    title: 'spec — computed toPrimitive (input)',
    source: `const foo = { [Symbol.toPrimitive]: () => "foo" };

expect((new class { [foo](){ return 0; } }).foo()).toBe(0);
expect((new class { get [foo](){ return 0; } }).foo).toBe(0);
expect((new class { set [foo](v){ return v; } }).foo = 0).toBe(0);

const arrayLike = { [Symbol.toPrimitive] : () => [] };

expect(() => new class { [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => new class { get [arrayLike](){ return 0; } }).toThrow("@@toPrimitive must return a primitive value.");
expect(() => new class { set [arrayLike](v){ return v; } }).toThrow("@@toPrimitive must return a primitive value.");
`,
    filename: 'input.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
const foo = { [Symbol.toPrimitive]: () => 'foo' };
expect(
  new ((_key => {
    'use strict';
    _key = _classKey(_key);
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class.prototype, _key, {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return 0;
        },
        'name',
        {
          value: typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class, 'prototype', { writable: false });
    return _Class;
  })(foo))().foo(),
).toBe(0);
expect(
  new ((_key20 => {
    'use strict';
    _key20 = _classKey(_key20);
    const _Class19 = function _Class19() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class19.prototype, _key20, {
      get: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return 0;
        },
        'name',
        {
          value:
            'get ' +
            (typeof _key20 === 'symbol'
              ? { [_key20]: function () {} }[_key20].name
              : String(_key20)),
          configurable: true,
        },
      ),
      configurable: true,
    });
    Object.defineProperty(_Class19, 'prototype', { writable: false });
    return _Class19;
  })(foo))().foo,
).toBe(0);
expect(
  (new ((_key24 => {
    'use strict';
    _key24 = _classKey(_key24);
    const _Class23 = function _Class23() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class23.prototype, _key24, {
      set: Object.defineProperty(
        function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return v;
        },
        'name',
        {
          value:
            'set ' +
            (typeof _key24 === 'symbol'
              ? { [_key24]: function () {} }[_key24].name
              : String(_key24)),
          configurable: true,
        },
      ),
      configurable: true,
    });
    Object.defineProperty(_Class23, 'prototype', { writable: false });
    return _Class23;
  })(foo))().foo = 0),
).toBe(0);
const arrayLike = { [Symbol.toPrimitive]: () => [] };
expect(
  () =>
    new ((_key28 => {
      'use strict';
      _key28 = _classKey(_key28);
      const _Class27 = function _Class27() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(_Class27.prototype, _key28, {
        value: Object.defineProperty(
          function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 0;
          },
          'name',
          {
            value:
              typeof _key28 === 'symbol'
                ? { [_key28]: function () {} }[_key28].name
                : String(_key28),
            configurable: true,
          },
        ),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(_Class27, 'prototype', { writable: false });
      return _Class27;
    })(arrayLike))(),
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    new ((_key32 => {
      'use strict';
      _key32 = _classKey(_key32);
      const _Class31 = function _Class31() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(_Class31.prototype, _key32, {
        get: Object.defineProperty(
          function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 0;
          },
          'name',
          {
            value:
              'get ' +
              (typeof _key32 === 'symbol'
                ? { [_key32]: function () {} }[_key32].name
                : String(_key32)),
            configurable: true,
          },
        ),
        configurable: true,
      });
      Object.defineProperty(_Class31, 'prototype', { writable: false });
      return _Class31;
    })(arrayLike))(),
).toThrow('@@toPrimitive must return a primitive value.');
expect(
  () =>
    new ((_key36 => {
      'use strict';
      _key36 = _classKey(_key36);
      const _Class35 = function _Class35() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(_Class35.prototype, _key36, {
        set: Object.defineProperty(
          function (v) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return v;
          },
          'name',
          {
            value:
              'set ' +
              (typeof _key36 === 'symbol'
                ? { [_key36]: function () {} }[_key36].name
                : String(_key36)),
            configurable: true,
          },
        ),
        configurable: true,
      });
      Object.defineProperty(_Class35, 'prototype', { writable: false });
      return _Class35;
    })(arrayLike))(),
).toThrow('@@toPrimitive must return a primitive value.');`,
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
      },
    ],
  },
  {
    title: 'spec — constructor binding collision (input)',
    source: `class Example {
  constructor() {
    var Example;
  }
}

var t = new Example();
`,
    filename: 'input.js',
    output: `let Example = (() => {
  'use strict';
  const Example = function Example() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var Example;
  };
  Object.defineProperty(Example, 'prototype', { writable: false });
  return Example;
})();
var t = new Example();`,
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
      },
    ],
  },
  {
    title: 'spec — constructor only (input)',
    source: `class Foo {
    constructor() {

    }
}`,
    filename: 'input.js',
    output: `let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — constructor (input)',
    source: `class Test {
  constructor() {
    this.state = "test";
  }
}

class Foo extends Bar {
  constructor() {
    super();
    this.state = "test";
  }
}

class ConstructorScoping {
  constructor(){
    let bar;
    {
      let bar;
    }
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    this.state = 'test';
  };
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();
let Foo = (__nox_super_63_148 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      this.state = 'test';
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_63_148 !== null && typeof __nox_super_63_148 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_63_148 && __nox_super_63_148.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_63_148);
  else Foo.__proto__ = __nox_super_63_148;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
let ConstructorScoping = (() => {
  'use strict';
  const ConstructorScoping = function ConstructorScoping() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    let bar;
    {
      let bar;
    }
  };
  Object.defineProperty(ConstructorScoping, 'prototype', { writable: false });
  return ConstructorScoping;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — delay arrow function for bare super derived (input)',
    source: `class Foo extends Bar {
  constructor() {
    super(() => {
      this.test;
    });
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (__nox_super_0_90 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(Foo),
      [
        () => {
          this.test;
        },
      ],
      new.target || Foo,
    );
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_90 !== null && typeof __nox_super_0_90 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_90 && __nox_super_0_90.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_90);
  else Foo.__proto__ = __nox_super_0_90;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — delete super property to property key (exec)',
    source: `// [Symbol.toPrimitive] must be called if exist
var counter = 0;
expect(() => {
  (new class {
    f() {
      delete super[{
        [Symbol.toPrimitive]: function() { ++counter; return 0; },
      }];
    }
  }).f();
}).toThrow(ReferenceError);
expect(counter).toBe(1);

// [Symbol.toPrimitive] must return a primitive value
expect(() => {
  (new class {
    f() {
      delete super[{
        [Symbol.toPrimitive]: function() { return {}; },
      }];
    }
  }).f();
}).toThrow(TypeError);
`,
    filename: 'exec.js',
    output: `var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
// [Symbol.toPrimitive] must be called if exist
var counter = 0;
expect(() => {
  new ((() => {
    'use strict';
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class.prototype, 'f', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          delete _get(
            Object.getPrototypeOf(_Class.prototype),
            {
              [Symbol.toPrimitive]: function () {
                ++counter;
                return 0;
              },
            },
            this,
          );
        },
        'name',
        {
          value: 'f',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class, 'prototype', { writable: false });
    return _Class;
  })())().f();
}).toThrow(ReferenceError);
expect(counter).toBe(1);
// [Symbol.toPrimitive] must return a primitive value
expect(() => {
  new ((() => {
    'use strict';
    const _Class16 = function _Class16() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class16.prototype, 'f', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          delete _get(
            Object.getPrototypeOf(_Class16.prototype),
            {
              [Symbol.toPrimitive]: function () {
                return {};
              },
            },
            this,
          );
        },
        'name',
        {
          value: 'f',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class16, 'prototype', { writable: false });
    return _Class16;
  })())().f();
}).toThrow(TypeError);`,
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
      },
    ],
  },
  {
    title: 'spec — delete super property to property key (input)',
    source: `// [Symbol.toPrimitive] must be called if exist
var counter = 0;
(new class {
  f() {
    delete super[{
      [Symbol.toPrimitive]: function() { ++counter; return 0; },
    }];
  }
}).f();

// [Symbol.toPrimitive] must return a primitive value
(new class {
  f() {
    delete super[{
      [Symbol.toPrimitive]: function() { return {}; },
    }];
  }
}).f();
`,
    filename: 'input.js',
    output: `var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
// [Symbol.toPrimitive] must be called if exist
var counter = 0;
new ((() => {
  'use strict';
  const _Class = function _Class() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class.prototype, 'f', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        delete _get(
          Object.getPrototypeOf(_Class.prototype),
          {
            [Symbol.toPrimitive]: function () {
              ++counter;
              return 0;
            },
          },
          this,
        );
      },
      'name',
      {
        value: 'f',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(_Class, 'prototype', { writable: false });
  return _Class;
})())().f();
// [Symbol.toPrimitive] must return a primitive value
new ((() => {
  'use strict';
  const _Class16 = function _Class16() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class16.prototype, 'f', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        delete _get(
          Object.getPrototypeOf(_Class16.prototype),
          {
            [Symbol.toPrimitive]: function () {
              return {};
            },
          },
          this,
        );
      },
      'name',
      {
        value: 'f',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(_Class16, 'prototype', { writable: false });
  return _Class16;
})())().f();`,
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
      },
    ],
  },
  {
    title: 'spec — delete super property (exec)',
    source: `expect(() => {
  (new class {
    f() { delete super.x; }
  }).f();
}).toThrow(ReferenceError);

expect(() => {
  (new class {
    f() { delete super[0]; }
  }).f();
}).toThrow(ReferenceError);

// [expr] should be evaluated
var counter = 0;
expect(() => {
  (new class {
    f() { delete super[++counter]; }
  }).f();
}).toThrow(ReferenceError);
expect(counter).toBe(1);

// TypeError before ReferenceError
expect(() => {
  (new class {
    f() { delete super[0()]; }
  }).f();
}).toThrow(TypeError);
`,
    filename: 'exec.js',
    output: `var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
expect(() => {
  new ((() => {
    'use strict';
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class.prototype, 'f', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          delete _get(Object.getPrototypeOf(_Class.prototype), 'x', this);
        },
        'name',
        {
          value: 'f',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class, 'prototype', { writable: false });
    return _Class;
  })())().f();
}).toThrow(ReferenceError);
expect(() => {
  new ((() => {
    'use strict';
    const _Class16 = function _Class16() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class16.prototype, 'f', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          delete _get(Object.getPrototypeOf(_Class16.prototype), 0, this);
        },
        'name',
        {
          value: 'f',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class16, 'prototype', { writable: false });
    return _Class16;
  })())().f();
}).toThrow(ReferenceError);
// [expr] should be evaluated
var counter = 0;
expect(() => {
  new ((() => {
    'use strict';
    const _Class19 = function _Class19() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class19.prototype, 'f', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          delete _get(Object.getPrototypeOf(_Class19.prototype), ++counter, this);
        },
        'name',
        {
          value: 'f',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class19, 'prototype', { writable: false });
    return _Class19;
  })())().f();
}).toThrow(ReferenceError);
expect(counter).toBe(1);
// TypeError before ReferenceError
expect(() => {
  new ((() => {
    'use strict';
    const _Class22 = function _Class22() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class22.prototype, 'f', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          delete _get(Object.getPrototypeOf(_Class22.prototype), 0(), this);
        },
        'name',
        {
          value: 'f',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class22, 'prototype', { writable: false });
    return _Class22;
  })())().f();
}).toThrow(TypeError);`,
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
      },
    ],
  },
  {
    title: 'spec — delete super property (input)',
    source: `(new class {
  f() { delete super.x; }
}).f();

(new class {
  f() { delete super[0]; }
}).f();

// [expr] should be evaluated
var counter = 0;
(new class {
  f() { delete super[++counter]; }
}).f();

// TypeError before ReferenceError
(new class {
  f() { delete super[0()]; }
}).f();
`,
    filename: 'input.js',
    output: `var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
new ((() => {
  'use strict';
  const _Class = function _Class() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class.prototype, 'f', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        delete _get(Object.getPrototypeOf(_Class.prototype), 'x', this);
      },
      'name',
      {
        value: 'f',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(_Class, 'prototype', { writable: false });
  return _Class;
})())().f();
new ((() => {
  'use strict';
  const _Class16 = function _Class16() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class16.prototype, 'f', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        delete _get(Object.getPrototypeOf(_Class16.prototype), 0, this);
      },
      'name',
      {
        value: 'f',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(_Class16, 'prototype', { writable: false });
  return _Class16;
})())().f();
// [expr] should be evaluated
var counter = 0;
new ((() => {
  'use strict';
  const _Class19 = function _Class19() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class19.prototype, 'f', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        delete _get(Object.getPrototypeOf(_Class19.prototype), ++counter, this);
      },
      'name',
      {
        value: 'f',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(_Class19, 'prototype', { writable: false });
  return _Class19;
})())().f();
// TypeError before ReferenceError
new ((() => {
  'use strict';
  const _Class22 = function _Class22() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class22.prototype, 'f', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        delete _get(Object.getPrototypeOf(_Class22.prototype), 0(), this);
      },
      'name',
      {
        value: 'f',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(_Class22, 'prototype', { writable: false });
  return _Class22;
})())().f();`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 2 (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    if (eval("false")) super();
  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_93 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      if (eval('false')) _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_14_93 !== null && typeof __nox_super_14_93 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_93 && __nox_super_14_93.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_93);
  else Foo.__proto__ = __nox_super_14_93;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 2 (input)',
    source: `class Foo extends Bar {
  constructor() {
    if (eval("false")) super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (__nox_super_0_79 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      if (eval('false')) _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_79 !== null && typeof __nox_super_0_79 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_79 && __nox_super_0_79.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_79);
  else Foo.__proto__ = __nox_super_0_79;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 3 (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    const fn = () => super();
    fn();
  }
}

new Foo();
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_101 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      const fn = () => _super();
      fn();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_14_101 !== null && typeof __nox_super_14_101 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_101 && __nox_super_14_101.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_101);
  else Foo.__proto__ = __nox_super_14_101;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
new Foo();`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 3 (input)',
    source: `class Foo extends Bar {
  constructor() {
    const fn = () => super();
    fn();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (__nox_super_0_87 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      const fn = () => _super();
      fn();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_87 !== null && typeof __nox_super_0_87 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_87 && __nox_super_0_87.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_87);
  else Foo.__proto__ = __nox_super_0_87;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 4 (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    const fn = () => super();
  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_91 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      const fn = () => _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_14_91 !== null && typeof __nox_super_14_91 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_91 && __nox_super_14_91.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_91);
  else Foo.__proto__ = __nox_super_14_91;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super 4 (input)',
    source: `class Foo extends Bar {
  constructor() {
    const fn = () => super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (__nox_super_0_77 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      const fn = () => _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_77 !== null && typeof __nox_super_0_77 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_77 && __nox_super_0_77.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_77);
  else Foo.__proto__ = __nox_super_0_77;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor must call super (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {

  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_62 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {}.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_14_62 !== null && typeof __nox_super_14_62 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_62 && __nox_super_14_62.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_62);
  else Foo.__proto__ = __nox_super_14_62;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor no primitive return (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    super();
    return 3;
  }
}

class Foo2 extends Bar {
  constructor() {
    super();
    return null;
  }
}

expect(() => new Foo()).toThrow("Derived constructors may only return object or undefined");
expect(() => new Foo2()).toThrow("Derived constructors may only return object or undefined");
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_88 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      return 3;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_14_88 !== null && typeof __nox_super_14_88 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_88 && __nox_super_14_88.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_88);
  else Foo.__proto__ = __nox_super_14_88;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
let Foo2 = (__nox_super_90_168 => {
  'use strict';
  const Foo2 = function Foo2() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Foo2), [], new.target || Foo2);
    var _result = function () {
      return null;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_90_168 !== null && typeof __nox_super_90_168 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo2.prototype = Object.create(__nox_super_90_168 && __nox_super_90_168.prototype, {
    constructor: {
      value: Foo2,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo2, __nox_super_90_168);
  else Foo2.__proto__ = __nox_super_90_168;
  Object.defineProperty(Foo2, 'prototype', { writable: false });
  return Foo2;
})(Bar);
expect(() => new Foo()).toThrow('Derived constructors may only return object or undefined');
expect(() => new Foo2()).toThrow('Derived constructors may only return object or undefined');`,
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
      },
    ],
  },
  {
    title: 'spec — derived constructor no primitive return (input)',
    source: `class Foo extends Bar {
  constructor() {
    super();
    return 3;
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (__nox_super_0_74 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      return 3;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_74 !== null && typeof __nox_super_0_74 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_74 && __nox_super_0_74.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_74);
  else Foo.__proto__ = __nox_super_0_74;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — export default (input)',
    source: `export default class Foo {}
`,
    filename: 'input.mjs',
    output: `let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
export default Foo;`,
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
      },
    ],
  },
  {
    title: 'spec — export super class (input)',
    source: `export default class extends A {}
`,
    filename: 'input.mjs',
    output: `import _babelHelper from '@babel/runtime/helpers/construct';
var _construct2 = { construct: _babelHelper };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let _Class = (__nox_super_15_33 => {
  'use strict';
  const _Class = function _Class() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(_Class), arguments, new.target || _Class);
    return _this;
  };
  if (__nox_super_15_33 !== null && typeof __nox_super_15_33 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  _Class.prototype = Object.create(__nox_super_15_33 && __nox_super_15_33.prototype, {
    constructor: {
      value: _Class,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_15_33);
  else _Class.__proto__ = __nox_super_15_33;
  Object.defineProperty(_Class, 'prototype', { writable: false });
  return _Class;
})(A);
export default _Class;`,
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
      },
    ],
  },
  {
    title: 'spec — extend untranspiled class (exec)',
    source: `"use strict";

var log = [];
var SuperClass = require("module-which-exports-native-class");

class SubClass extends SuperClass {
  constructor() {
    log.push(4);
    super();
  }
  method() {
    log.push(5);
    super.method();
  }
  static method() {
    log.push(6);
    super.method();
  }
}

new SubClass().method();
SubClass.method();

expect(log).toEqual([4, 1, 5, 2, 6, 3]);

// Magic function to avoid transpiling class
function require() {
  return eval(\`(
    class SuperClass {
      constructor() { log.push(1); }
      method() { log.push(2); }
      static method() { log.push(3); }
    }
  )\`);
}
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
var log = [];
var SuperClass = require('module-which-exports-native-class');
let SubClass = (__nox_super_93_297 => {
  'use strict';
  const SubClass = function SubClass() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    log.push(4);
    var _this = _construct(Object.getPrototypeOf(SubClass), [], new.target || SubClass);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_93_297 !== null && typeof __nox_super_93_297 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  SubClass.prototype = Object.create(__nox_super_93_297 && __nox_super_93_297.prototype, {
    constructor: {
      value: SubClass,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(SubClass, __nox_super_93_297);
  else SubClass.__proto__ = __nox_super_93_297;
  Object.defineProperty(SubClass.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        log.push(5);
        _get(Object.getPrototypeOf(SubClass.prototype), 'method', this).call(this);
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
  Object.defineProperty(SubClass, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        log.push(6);
        _get(Object.getPrototypeOf(SubClass), 'method', this).call(this);
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
  Object.defineProperty(SubClass, 'prototype', { writable: false });
  return SubClass;
})(SuperClass);
new SubClass().method();
SubClass.method();
expect(log).toEqual([4, 1, 5, 2, 6, 3]);
// Magic function to avoid transpiling class
function require() {
  return eval(\`(
    class SuperClass {
      constructor() { log.push(1); }
      method() { log.push(2); }
      static method() { log.push(3); }
    }
  )\`);
}`,
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
      },
    ],
  },
  {
    title: 'spec — inferred expression name (input)',
    source: `var o = { foo: class foo {} };
`,
    filename: 'input.js',
    output: `var o = {
  foo: (() => {
    'use strict';
    const foo = function foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(foo, 'prototype', { writable: false });
    return foo;
  })(),
};`,
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
      },
    ],
  },
  {
    title: 'spec — instance getter and setter (input)',
    source: `class Test {
  get test() {
    return 5 + 5;
  }
  set test(val) {
    this._test = val;
  }
}
`,
    filename: 'input.js',
    output: `let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 5 + 5;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Test.prototype, 'test', {
    set: Object.defineProperty(
      function (val) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this._test = val;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — instance getter (input)',
    source: `class Test {
  get test() {
  return 5 + 5;
  }
}
`,
    filename: 'input.js',
    output: `let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test.prototype, 'test', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 5 + 5;
      },
      'name',
      {
        value: 'get test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — instance method (input)',
    source: `class Test {
  test() {
  return 5 + 5;
  }
}
`,
    filename: 'input.js',
    output: `let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 5 + 5;
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
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — instance setter (input)',
    source: `class Test {
  set test(val) {
  this._test = val;
  }
}
`,
    filename: 'input.js',
    output: `let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test.prototype, 'test', {
    set: Object.defineProperty(
      function (val) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this._test = val;
      },
      'name',
      {
        value: 'set test',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — name collisions with class ref in computed key (input)',
    source: `class Foo extends Bar {
  constructor() {
    super();
    class X {
      [(() => {
        let Foo;
        super.method();
      })()]() {}
    }
  }
}`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let Foo = (__nox_super_0_154 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      let X = (_key => {
        'use strict';
        _key = _classKey(_key);
        const X = function X() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(X.prototype, _key, {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            },
            'name',
            {
              value:
                typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(X, 'prototype', { writable: false });
        return X;
      })(
        (() => {
          let Foo;
          _get(Object.getPrototypeOf(Foo.prototype), 'method', this).call(this);
        })(),
      );
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_154 !== null && typeof __nox_super_0_154 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_154 && __nox_super_0_154.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_154);
  else Foo.__proto__ = __nox_super_0_154;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — name collisions with class ref in constructor (input)',
    source: `class Base {
  method() {}
}

class Foo extends Base {
  constructor() {
    super();

    if (true) {
      let Foo;
      super.method();
    }
  }

  method() { }
}`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
let Foo = (__nox_super_30_167 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      if (true) {
        let Foo;
        _get(Object.getPrototypeOf(Foo.prototype), 'method', this).call(this);
      }
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_30_167 !== null && typeof __nox_super_30_167 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_30_167 && __nox_super_30_167.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_30_167);
  else Foo.__proto__ = __nox_super_30_167;
  Object.defineProperty(Foo.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Base);`,
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
      },
    ],
  },
  {
    title: 'spec — name collisions with class ref in method (input)',
    source: `class Foo {
  method(Foo) {
    return super.method(Foo);
  }
}

class Bar {
  method() {
    return () => {
      let Bar;
      return super.method(Bar);
    };
  }
}

class Baz {
  method() {
    class Baz {
      f() {
        let Baz = 1;
        return Baz;
      }
    }

    return super.method(Baz)
  }
}`,
    filename: 'input.js',
    output: `var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'method', {
    value: Object.defineProperty(
      function (Foo) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _get(Object.getPrototypeOf(Foo.prototype), 'method', this).call(this, Foo);
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
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return () => {
          let Bar;
          return _get(Object.getPrototypeOf(Bar.prototype), 'method', this).call(this, Bar);
        };
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
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Baz = (() => {
  'use strict';
  const Baz = function Baz() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Baz.prototype, 'method', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        let Baz = (() => {
          'use strict';
          const Baz = function Baz() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
          };
          Object.defineProperty(Baz.prototype, 'f', {
            value: Object.defineProperty(
              function () {
                if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                let Baz = 1;
                return Baz;
              },
              'name',
              {
                value: 'f',
                configurable: true,
              },
            ),
            writable: true,
            configurable: true,
          });
          Object.defineProperty(Baz, 'prototype', { writable: false });
          return Baz;
        })();
        return _get(Object.getPrototypeOf(Baz.prototype), 'method', this).call(this, Baz);
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
  Object.defineProperty(Baz, 'prototype', { writable: false });
  return Baz;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — name method collision (input)',
    source: `import { a } from "./a";

class Foo {
  _a() {
    a();
  }
}
`,
    filename: 'input.mjs',
    output: `import { a } from './a';
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, '_a', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        a();
      },
      'name',
      {
        value: '_a',
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
      },
    ],
  },
  {
    title: 'spec — nested class super call in key (exec)',
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
      [super()]() {
        return 'hello';
      }
    }

    return new Inner();
  }
}

expect(new Outer().hello()).toBe('hello');
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let Hello = (() => {
  'use strict';
  const Hello = function Hello() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    return {
      toString() {
        return 'hello';
      },
    };
  };
  Object.defineProperty(Hello, 'prototype', { writable: false });
  return Hello;
})();
let Outer = (__nox_super_125_277 => {
  'use strict';
  const Outer = function Outer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Outer), arguments, _newtarget || Outer);
      return _this;
    }
    var _result = function () {
      let Inner = (_key => {
        'use strict';
        _key = _classKey(_key);
        const Inner = function Inner() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Inner.prototype, _key, {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'hello';
            },
            'name',
            {
              value:
                typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Inner, 'prototype', { writable: false });
        return Inner;
      })(_super());
      return new Inner();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_125_277 !== null && typeof __nox_super_125_277 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Outer.prototype = Object.create(__nox_super_125_277 && __nox_super_125_277.prototype, {
    constructor: {
      value: Outer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_125_277);
  else Outer.__proto__ = __nox_super_125_277;
  Object.defineProperty(Outer, 'prototype', { writable: false });
  return Outer;
})(Hello);
expect(new Outer().hello()).toBe('hello');`,
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
      },
    ],
  },
  {
    title: 'spec — nested class super call in key (input)',
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
      [super()]() {
        return 'hello';
      }
    }

    return new Inner();
  }
}

expect(new Outer().hello()).toBe('hello');
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let Hello = (() => {
  'use strict';
  const Hello = function Hello() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    return {
      toString() {
        return 'hello';
      },
    };
  };
  Object.defineProperty(Hello, 'prototype', { writable: false });
  return Hello;
})();
let Outer = (__nox_super_125_277 => {
  'use strict';
  const Outer = function Outer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Outer), arguments, _newtarget || Outer);
      return _this;
    }
    var _result = function () {
      let Inner = (_key => {
        'use strict';
        _key = _classKey(_key);
        const Inner = function Inner() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Inner.prototype, _key, {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'hello';
            },
            'name',
            {
              value:
                typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Inner, 'prototype', { writable: false });
        return Inner;
      })(_super());
      return new Inner();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_125_277 !== null && typeof __nox_super_125_277 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Outer.prototype = Object.create(__nox_super_125_277 && __nox_super_125_277.prototype, {
    constructor: {
      value: Outer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_125_277);
  else Outer.__proto__ = __nox_super_125_277;
  Object.defineProperty(Outer, 'prototype', { writable: false });
  return Outer;
})(Hello);
expect(new Outer().hello()).toBe('hello');`,
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
      },
    ],
  },
  {
    title: 'spec — nested class super property in key (exec)',
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
      [super.toString()]() {
        return 'hello';
      }
    }

    return new Inner();
  }
}

expect(new Outer().hello()).toBe('hello');
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let Hello = (() => {
  'use strict';
  const Hello = function Hello() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Hello.prototype, 'toString', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'hello';
      },
      'name',
      {
        value: 'toString',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Hello, 'prototype', { writable: false });
  return Hello;
})();
let Outer = (__nox_super_70_244 => {
  'use strict';
  const Outer = function Outer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Outer), [], new.target || Outer);
    var _result = function () {
      let Inner = (_key => {
        'use strict';
        _key = _classKey(_key);
        const Inner = function Inner() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Inner.prototype, _key, {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'hello';
            },
            'name',
            {
              value:
                typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Inner, 'prototype', { writable: false });
        return Inner;
      })(_get(Object.getPrototypeOf(Outer.prototype), 'toString', this).call(this));
      return new Inner();
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_70_244 !== null && typeof __nox_super_70_244 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Outer.prototype = Object.create(__nox_super_70_244 && __nox_super_70_244.prototype, {
    constructor: {
      value: Outer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_70_244);
  else Outer.__proto__ = __nox_super_70_244;
  Object.defineProperty(Outer, 'prototype', { writable: false });
  return Outer;
})(Hello);
expect(new Outer().hello()).toBe('hello');`,
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
      },
    ],
  },
  {
    title: 'spec — nested class super property in key (input)',
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
      [super.toString()]() {
        return 'hello';
      }
    }

    return new Inner();
  }
}

expect(new Outer().hello()).toBe('hello');
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
let Hello = (() => {
  'use strict';
  const Hello = function Hello() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Hello.prototype, 'toString', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'hello';
      },
      'name',
      {
        value: 'toString',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Hello, 'prototype', { writable: false });
  return Hello;
})();
let Outer = (__nox_super_70_244 => {
  'use strict';
  const Outer = function Outer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Outer), [], new.target || Outer);
    var _result = function () {
      let Inner = (_key => {
        'use strict';
        _key = _classKey(_key);
        const Inner = function Inner() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
        };
        Object.defineProperty(Inner.prototype, _key, {
          value: Object.defineProperty(
            function () {
              if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
              return 'hello';
            },
            'name',
            {
              value:
                typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
              configurable: true,
            },
          ),
          writable: true,
          configurable: true,
        });
        Object.defineProperty(Inner, 'prototype', { writable: false });
        return Inner;
      })(_get(Object.getPrototypeOf(Outer.prototype), 'toString', this).call(this));
      return new Inner();
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_70_244 !== null && typeof __nox_super_70_244 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Outer.prototype = Object.create(__nox_super_70_244 && __nox_super_70_244.prototype, {
    constructor: {
      value: Outer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_70_244);
  else Outer.__proto__ = __nox_super_70_244;
  Object.defineProperty(Outer, 'prototype', { writable: false });
  return Outer;
})(Hello);
expect(new Outer().hello()).toBe('hello');`,
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
      },
    ],
  },
  {
    title: 'spec — nested object super call in key (exec)',
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
    const Inner = {
      [super()]() {
        return 'hello';
      },
    };

    return Inner;
  }
}

expect(new Outer().hello()).toBe('hello');
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Hello = (() => {
  'use strict';
  const Hello = function Hello() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    return {
      toString() {
        return 'hello';
      },
    };
  };
  Object.defineProperty(Hello, 'prototype', { writable: false });
  return Hello;
})();
let Outer = (__nox_super_125_275 => {
  'use strict';
  const Outer = function Outer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Outer), arguments, _newtarget || Outer);
      return _this;
    }
    var _result = function () {
      const Inner = {
        [_super()]() {
          return 'hello';
        },
      };
      return Inner;
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_125_275 !== null && typeof __nox_super_125_275 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Outer.prototype = Object.create(__nox_super_125_275 && __nox_super_125_275.prototype, {
    constructor: {
      value: Outer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_125_275);
  else Outer.__proto__ = __nox_super_125_275;
  Object.defineProperty(Outer, 'prototype', { writable: false });
  return Outer;
})(Hello);
expect(new Outer().hello()).toBe('hello');`,
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
      },
    ],
  },
  {
    title: 'spec — nested object super call in key (input)',
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
    const Inner = {
      [super()]() {
        return 'hello';
      },
    };

    return Inner;
  }
}

expect(new Outer().hello()).toBe('hello');
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Hello = (() => {
  'use strict';
  const Hello = function Hello() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    return {
      toString() {
        return 'hello';
      },
    };
  };
  Object.defineProperty(Hello, 'prototype', { writable: false });
  return Hello;
})();
let Outer = (__nox_super_125_275 => {
  'use strict';
  const Outer = function Outer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Outer), arguments, _newtarget || Outer);
      return _this;
    }
    var _result = function () {
      const Inner = {
        [_super()]() {
          return 'hello';
        },
      };
      return Inner;
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_125_275 !== null && typeof __nox_super_125_275 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Outer.prototype = Object.create(__nox_super_125_275 && __nox_super_125_275.prototype, {
    constructor: {
      value: Outer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_125_275);
  else Outer.__proto__ = __nox_super_125_275;
  Object.defineProperty(Outer, 'prototype', { writable: false });
  return Outer;
})(Hello);
expect(new Outer().hello()).toBe('hello');`,
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
      },
    ],
  },
  {
    title: 'spec — nested object super property in key (exec)',
    source: `"use strict";
class Hello {
  toString() {
    return 'hello';
  }
}

class Outer extends Hello {
  constructor() {
    super();
    const Inner = {
      [super.toString()]() {
        return 'hello';
      },
    };

    return Inner;
  }
}

expect(new Outer().hello()).toBe('hello');
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Hello = (() => {
  'use strict';
  const Hello = function Hello() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Hello.prototype, 'toString', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'hello';
      },
      'name',
      {
        value: 'toString',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Hello, 'prototype', { writable: false });
  return Hello;
})();
let Outer = (__nox_super_70_242 => {
  'use strict';
  const Outer = function Outer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Outer), [], new.target || Outer);
    var _result = function () {
      const Inner = {
        [_get(Object.getPrototypeOf(Outer.prototype), 'toString', this).call(this)]() {
          return 'hello';
        },
      };
      return Inner;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_70_242 !== null && typeof __nox_super_70_242 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Outer.prototype = Object.create(__nox_super_70_242 && __nox_super_70_242.prototype, {
    constructor: {
      value: Outer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_70_242);
  else Outer.__proto__ = __nox_super_70_242;
  Object.defineProperty(Outer, 'prototype', { writable: false });
  return Outer;
})(Hello);
expect(new Outer().hello()).toBe('hello');`,
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
      },
    ],
  },
  {
    title: 'spec — nested object super property in key (input)',
    source: `"use strict";
class Hello {
  toString() {
    return 'hello';
  }
}

class Outer extends Hello {
  constructor() {
    super();
    const Inner = {
      [super.toString()]() {
        return 'hello';
      },
    };

    return Inner;
  }
}

expect(new Outer().hello()).toBe('hello');
`,
    filename: 'input.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Hello = (() => {
  'use strict';
  const Hello = function Hello() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Hello.prototype, 'toString', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return 'hello';
      },
      'name',
      {
        value: 'toString',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Hello, 'prototype', { writable: false });
  return Hello;
})();
let Outer = (__nox_super_70_242 => {
  'use strict';
  const Outer = function Outer() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Outer), [], new.target || Outer);
    var _result = function () {
      const Inner = {
        [_get(Object.getPrototypeOf(Outer.prototype), 'toString', this).call(this)]() {
          return 'hello';
        },
      };
      return Inner;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_70_242 !== null && typeof __nox_super_70_242 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Outer.prototype = Object.create(__nox_super_70_242 && __nox_super_70_242.prototype, {
    constructor: {
      value: Outer,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Outer, __nox_super_70_242);
  else Outer.__proto__ = __nox_super_70_242;
  Object.defineProperty(Outer, 'prototype', { writable: false });
  return Outer;
})(Hello);
expect(new Outer().hello()).toBe('hello');`,
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
      },
    ],
  },
  {
    title: 'spec — plain class (input)',
    source: `class Test { }
`,
    filename: 'input.js',
    output: `let Test = (() => {
  'use strict';
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test, 'prototype', { writable: false });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — preserves directives (input)',
    source: `class MyCtrl {
  constructor(a) {
    "any directive prologue";
    foo;
  }
}

class MyCtrl2 {
  constructor(a) {
    "a";
    "b";
    foo;
  }
}

class MyCtrl3 {
  constructor(a) {
    "a";
    foo;
    "b";
  }
}
`,
    filename: 'input.js',
    output: `let MyCtrl = (() => {
  'use strict';
  const MyCtrl = function MyCtrl(a) {
    'any directive prologue';
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    foo;
  };
  Object.defineProperty(MyCtrl, 'prototype', { writable: false });
  return MyCtrl;
})();
let MyCtrl2 = (() => {
  'use strict';
  const MyCtrl2 = function MyCtrl2(a) {
    'a';
    'b';
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    foo;
  };
  Object.defineProperty(MyCtrl2, 'prototype', { writable: false });
  return MyCtrl2;
})();
let MyCtrl3 = (() => {
  'use strict';
  const MyCtrl3 = function MyCtrl3(a) {
    'a';
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    foo;
    ('b');
  };
  Object.defineProperty(MyCtrl3, 'prototype', { writable: false });
  return MyCtrl3;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — relaxed method coercion (input)',
    source: `// #1649

class Foo {
  [Symbol()]() {}
  [Symbol()]() {}
}
`,
    filename: 'input.js',
    output: `var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
// #1649
let Foo = ((_key, _key14) => {
  'use strict';
  _key = _classKey(_key);
  _key14 = _classKey(_key14);
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, _key, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: typeof _key === 'symbol' ? { [_key]: function () {} }[_key].name : String(_key),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo.prototype, _key14, {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value:
          typeof _key14 === 'symbol' ? { [_key14]: function () {} }[_key14].name : String(_key14),
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Symbol(), Symbol());`,
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
      },
    ],
  },
  {
    title: 'spec — returning from derived constructor (exec)',
    source: `"use strict";
class Foo {
  constructor() {
    return { x: 1 };
  }
}

expect(new Foo().x).toBe(1);

class Bar extends Foo {
  constructor() {
    super();
    return;
  }
}

expect(new Bar().x).toBe(1);

class Bar2 extends Foo {
  constructor() {
    super();
    expect(this.x).toBe(1);
    return { x: 2 };
  }
}

expect(new Bar2().x).toBe(2);


let singleton;
class Sub extends Foo {
  constructor() {
    if (singleton) {
      return singleton;
    }
    singleton = super();
  }
}

let instance = new Sub;
expect(instance).toBe(singleton);

instance = new Sub;
expect(instance).toBe(singleton);

class Undefined extends Foo {
  constructor() {
    if (false) {
      super();
    }
    return;
    super();
  }
}

expect(() => {
  new Undefined();
}).toThrow("this");
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Foo = (() => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    return { x: 1 };
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
expect(new Foo().x).toBe(1);
let Bar = (__nox_super_102_174 => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Bar), [], new.target || Bar);
    var _result = function () {
      return;
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_102_174 !== null && typeof __nox_super_102_174 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Bar.prototype = Object.create(__nox_super_102_174 && __nox_super_102_174.prototype, {
    constructor: {
      value: Bar,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar, __nox_super_102_174);
  else Bar.__proto__ = __nox_super_102_174;
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})(Foo);
expect(new Bar().x).toBe(1);
let Bar2 = (__nox_super_206_316 => {
  'use strict';
  const Bar2 = function Bar2() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Bar2), [], new.target || Bar2);
    var _result = function () {
      expect(this.x).toBe(1);
      return { x: 2 };
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_206_316 !== null && typeof __nox_super_206_316 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Bar2.prototype = Object.create(__nox_super_206_316 && __nox_super_206_316.prototype, {
    constructor: {
      value: Bar2,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Bar2, __nox_super_206_316);
  else Bar2.__proto__ = __nox_super_206_316;
  Object.defineProperty(Bar2, 'prototype', { writable: false });
  return Bar2;
})(Foo);
expect(new Bar2().x).toBe(2);
let singleton;
let Sub = (__nox_super_365_488 => {
  'use strict';
  const Sub = function Sub() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Sub), arguments, _newtarget || Sub);
      return _this;
    }
    var _result = function () {
      if (singleton) {
        return singleton;
      }
      singleton = _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_365_488 !== null && typeof __nox_super_365_488 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Sub.prototype = Object.create(__nox_super_365_488 && __nox_super_365_488.prototype, {
    constructor: {
      value: Sub,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Sub, __nox_super_365_488);
  else Sub.__proto__ = __nox_super_365_488;
  Object.defineProperty(Sub, 'prototype', { writable: false });
  return Sub;
})(Foo);
let instance = new Sub();
expect(instance).toBe(singleton);
instance = new Sub();
expect(instance).toBe(singleton);
let Undefined = (__nox_super_604_720 => {
  'use strict';
  const Undefined = function Undefined() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Undefined), arguments, _newtarget || Undefined);
      return _this;
    }
    var _result = function () {
      if (false) {
        _super();
      }
      return;
      _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_604_720 !== null && typeof __nox_super_604_720 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Undefined.prototype = Object.create(__nox_super_604_720 && __nox_super_604_720.prototype, {
    constructor: {
      value: Undefined,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Undefined, __nox_super_604_720);
  else Undefined.__proto__ = __nox_super_604_720;
  Object.defineProperty(Undefined, 'prototype', { writable: false });
  return Undefined;
})(Foo);
expect(() => {
  new Undefined();
}).toThrow('this');`,
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
      },
    ],
  },
  {
    title: 'spec — statement (input)',
    source: `var BaseView = class BaseView {
  constructor() {
    this.autoRender = true;
  }
}

var BaseView = class {
  constructor() {
    this.autoRender = true;
  }
}

var BaseView = class {
  foo() {
    this.autoRender = true;
  }
}
`,
    filename: 'input.js',
    output: `var BaseView = (() => {
  'use strict';
  const BaseView = function BaseView() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    this.autoRender = true;
  };
  Object.defineProperty(BaseView, 'prototype', { writable: false });
  return BaseView;
})();
var BaseView = (() => {
  'use strict';
  const _Class = function _Class() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    this.autoRender = true;
  };
  Object.defineProperty(_Class, 'name', {
    value: 'BaseView',
    configurable: true,
  });
  Object.defineProperty(_Class, 'prototype', { writable: false });
  return _Class;
})();
var BaseView = (() => {
  'use strict';
  const _Class18 = function _Class18() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(_Class18, 'name', {
    value: 'BaseView',
    configurable: true,
  });
  Object.defineProperty(_Class18.prototype, 'foo', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        this.autoRender = true;
      },
      'name',
      {
        value: 'foo',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(_Class18, 'prototype', { writable: false });
  return _Class18;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — static (input)',
    source: `class A {
  static a() {

  }

  static get b(){

  }

  static set b(b){

  }
}
`,
    filename: 'input.js',
    output: `let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A, 'a', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'a',
        configurable: true,
      },
    ),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(A, 'b', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'get b',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'b', {
    set: Object.defineProperty(
      function (b) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
      'name',
      {
        value: 'set b',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — super class anonymous (input)',
    source: `class TestEmpty extends (class {}) {
}

class TestConstructorOnly extends (class { constructor() {} }) {
}

class TestMethodOnly extends (class { method() {} }) {
}

class TestConstructorAndMethod extends (class {
  constructor() {}
  method() {}
}) {
}

class TestMultipleMethods extends (class {
  m1() {}
  m2() {}
}) {}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let TestEmpty = (__nox_super_0_38 => {
  'use strict';
  const TestEmpty = function TestEmpty() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(TestEmpty), arguments, new.target || TestEmpty);
    return _this;
  };
  if (__nox_super_0_38 !== null && typeof __nox_super_0_38 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  TestEmpty.prototype = Object.create(__nox_super_0_38 && __nox_super_0_38.prototype, {
    constructor: {
      value: TestEmpty,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(TestEmpty, __nox_super_0_38);
  else TestEmpty.__proto__ = __nox_super_0_38;
  Object.defineProperty(TestEmpty, 'prototype', { writable: false });
  return TestEmpty;
})(
  (() => {
    'use strict';
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class, 'prototype', { writable: false });
    return _Class;
  })(),
);
let TestConstructorOnly = (__nox_super_40_106 => {
  'use strict';
  const TestConstructorOnly = function TestConstructorOnly() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(TestConstructorOnly),
      arguments,
      new.target || TestConstructorOnly,
    );
    return _this;
  };
  if (__nox_super_40_106 !== null && typeof __nox_super_40_106 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  TestConstructorOnly.prototype = Object.create(
    __nox_super_40_106 && __nox_super_40_106.prototype,
    {
      constructor: {
        value: TestConstructorOnly,
        writable: true,
        configurable: true,
      },
    },
  );
  if (Object.setPrototypeOf) Object.setPrototypeOf(TestConstructorOnly, __nox_super_40_106);
  else TestConstructorOnly.__proto__ = __nox_super_40_106;
  Object.defineProperty(TestConstructorOnly, 'prototype', { writable: false });
  return TestConstructorOnly;
})(
  (() => {
    'use strict';
    const _Class24 = function _Class24() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class24, 'prototype', { writable: false });
    return _Class24;
  })(),
);
let TestMethodOnly = (__nox_super_108_164 => {
  'use strict';
  const TestMethodOnly = function TestMethodOnly() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(TestMethodOnly),
      arguments,
      new.target || TestMethodOnly,
    );
    return _this;
  };
  if (__nox_super_108_164 !== null && typeof __nox_super_108_164 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  TestMethodOnly.prototype = Object.create(__nox_super_108_164 && __nox_super_108_164.prototype, {
    constructor: {
      value: TestMethodOnly,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(TestMethodOnly, __nox_super_108_164);
  else TestMethodOnly.__proto__ = __nox_super_108_164;
  Object.defineProperty(TestMethodOnly, 'prototype', { writable: false });
  return TestMethodOnly;
})(
  (() => {
    'use strict';
    const _Class29 = function _Class29() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class29.prototype, 'method', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
    Object.defineProperty(_Class29, 'prototype', { writable: false });
    return _Class29;
  })(),
);
let TestConstructorAndMethod = (__nox_super_166_253 => {
  'use strict';
  const TestConstructorAndMethod = function TestConstructorAndMethod() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(TestConstructorAndMethod),
      arguments,
      new.target || TestConstructorAndMethod,
    );
    return _this;
  };
  if (__nox_super_166_253 !== null && typeof __nox_super_166_253 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  TestConstructorAndMethod.prototype = Object.create(
    __nox_super_166_253 && __nox_super_166_253.prototype,
    {
      constructor: {
        value: TestConstructorAndMethod,
        writable: true,
        configurable: true,
      },
    },
  );
  if (Object.setPrototypeOf) Object.setPrototypeOf(TestConstructorAndMethod, __nox_super_166_253);
  else TestConstructorAndMethod.__proto__ = __nox_super_166_253;
  Object.defineProperty(TestConstructorAndMethod, 'prototype', { writable: false });
  return TestConstructorAndMethod;
})(
  (() => {
    'use strict';
    const _Class34 = function _Class34() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class34.prototype, 'method', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
    Object.defineProperty(_Class34, 'prototype', { writable: false });
    return _Class34;
  })(),
);
let TestMultipleMethods = (__nox_super_255_323 => {
  'use strict';
  const TestMultipleMethods = function TestMultipleMethods() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(TestMultipleMethods),
      arguments,
      new.target || TestMultipleMethods,
    );
    return _this;
  };
  if (__nox_super_255_323 !== null && typeof __nox_super_255_323 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  TestMultipleMethods.prototype = Object.create(
    __nox_super_255_323 && __nox_super_255_323.prototype,
    {
      constructor: {
        value: TestMultipleMethods,
        writable: true,
        configurable: true,
      },
    },
  );
  if (Object.setPrototypeOf) Object.setPrototypeOf(TestMultipleMethods, __nox_super_255_323);
  else TestMultipleMethods.__proto__ = __nox_super_255_323;
  Object.defineProperty(TestMultipleMethods, 'prototype', { writable: false });
  return TestMultipleMethods;
})(
  (() => {
    'use strict';
    const _Class39 = function _Class39() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class39.prototype, 'm1', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        },
        'name',
        {
          value: 'm1',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class39.prototype, 'm2', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        },
        'name',
        {
          value: 'm2',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(_Class39, 'prototype', { writable: false });
    return _Class39;
  })(),
);`,
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
      },
    ],
  },
  {
    title: 'spec — super correct new target without reflect (exec)',
    source: `"use strict";

const oldReflect = global.Reflect;
try {
  global.Reflect = undefined;

  let NewTarget;

  class A {
    constructor() { NewTarget = new.target; }
  }
  class B extends A {}

  new A();
  expect(NewTarget).toBe(A);

  new B();
  expect(NewTarget).toBe(B);
} finally {
  global.Reflect = oldReflect;
}

`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
const oldReflect = global.Reflect;
try {
  global.Reflect = undefined;
  let NewTarget;
  let A = (() => {
    'use strict';
    const A = function A() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      NewTarget = new.target;
    };
    Object.defineProperty(A, 'prototype', { writable: false });
    return A;
  })();
  let B = (__nox_super_169_189 => {
    'use strict';
    const B = function B() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(Object.getPrototypeOf(B), arguments, new.target || B);
      return _this;
    };
    if (__nox_super_169_189 !== null && typeof __nox_super_169_189 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    B.prototype = Object.create(__nox_super_169_189 && __nox_super_169_189.prototype, {
      constructor: {
        value: B,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_169_189);
    else B.__proto__ = __nox_super_169_189;
    Object.defineProperty(B, 'prototype', { writable: false });
    return B;
  })(A);
  new A();
  expect(NewTarget).toBe(A);
  new B();
  expect(NewTarget).toBe(B);
} finally {
  global.Reflect = oldReflect;
}`,
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
      },
    ],
  },
  {
    title: 'spec — super correct new target (exec)',
    source: `"use strict";

let NewTarget;

class A {
  constructor() { NewTarget = new.target; }
}
class B extends A {}

new A();
expect(NewTarget).toBe(A);

new B();
expect(NewTarget).toBe(B);
`,
    filename: 'exec.js',
    output: `'use strict';
var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let NewTarget;
let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    NewTarget = new.target;
  };
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
let B = (__nox_super_87_107 => {
  'use strict';
  const B = function B() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(B), arguments, new.target || B);
    return _this;
  };
  if (__nox_super_87_107 !== null && typeof __nox_super_87_107 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  B.prototype = Object.create(__nox_super_87_107 && __nox_super_87_107.prototype, {
    constructor: {
      value: B,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_87_107);
  else B.__proto__ = __nox_super_87_107;
  Object.defineProperty(B, 'prototype', { writable: false });
  return B;
})(A);
new A();
expect(NewTarget).toBe(A);
new B();
expect(NewTarget).toBe(B);`,
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
      },
    ],
  },
  {
    title: 'spec — super destructuring array pattern 1 (input)',
    source: `class Foo {
  constructor(props) {
    ;([x, ...super.client] = props);
  }
}`,
    filename: 'input.js',
    output: `var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Foo = (() => {
  'use strict';
  const Foo = function Foo(props) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    [x, ...super.client] = props;
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — super destructuring array pattern (input)',
    source: `class Foo {
  constructor(props) {
    ;([super.client] = props);
  }
}
`,
    filename: 'input.js',
    output: `var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Foo = (() => {
  'use strict';
  const Foo = function Foo(props) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    [super.client] = props;
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — super destructuring object pattern 1 (input)',
    source: `class Foo {
  constructor(props) {
    ;({ x, ...super.client } = props)
  }
}`,
    filename: 'input.js',
    output: `var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Foo = (() => {
  'use strict';
  const Foo = function Foo(props) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    ({ x, ...super.client } = props);
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — super destructuring object pattern (input)',
    source: `class Foo {
  constructor(props) {
    ;({ client: super.client } = props)
  }
}`,
    filename: 'input.js',
    output: `var _superReference2 = {
  get: require('@babel/runtime/helpers/get'),
  set: require('@babel/runtime/helpers/set'),
};
function _get(e, t, r) {
  return _superReference2.get(e, t, r);
}
function _superReference(e, t, r) {
  return {
    get value() {
      return _superReference2.get(e, t, r);
    },
    set value(u) {
      _superReference2.set(e, t, u, r, !0);
    },
  };
}
_superReference.set = function (e, t, r, u) {
  return _superReference2.set(e, t, u, r, !0);
};
let Foo = (() => {
  'use strict';
  const Foo = function Foo(props) {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    ({ client: super.client } = props);
  };
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'spec — super guaranteed (input)',
    source: `class Base {};

new class extends Base {
  constructor() {
    super() || null;
  }
}

new class extends Base {
  constructor() {
    super()?.();
  }
}

new class extends Base {
  constructor() {
    super()?.[null];
  }
}

new class extends Base {
  constructor() {
    1 + super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
new ((__nox_super_20_85 => {
  'use strict';
  const _Class = function _Class() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(_Class), arguments, _newtarget || _Class);
      return _this;
    }
    var _result = function () {
      _super() || null;
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_20_85 !== null && typeof __nox_super_20_85 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  _Class.prototype = Object.create(__nox_super_20_85 && __nox_super_20_85.prototype, {
    constructor: {
      value: _Class,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_20_85);
  else _Class.__proto__ = __nox_super_20_85;
  Object.defineProperty(_Class, 'prototype', { writable: false });
  return _Class;
})(Base))();
new ((__nox_super_91_152 => {
  'use strict';
  const _Class18 = function _Class18() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(_Class18), arguments, _newtarget || _Class18);
      return _this;
    }
    var _result = function () {
      _super()?.();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_91_152 !== null && typeof __nox_super_91_152 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  _Class18.prototype = Object.create(__nox_super_91_152 && __nox_super_91_152.prototype, {
    constructor: {
      value: _Class18,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class18, __nox_super_91_152);
  else _Class18.__proto__ = __nox_super_91_152;
  Object.defineProperty(_Class18, 'prototype', { writable: false });
  return _Class18;
})(Base))();
new ((__nox_super_158_223 => {
  'use strict';
  const _Class21 = function _Class21() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(_Class21), arguments, _newtarget || _Class21);
      return _this;
    }
    var _result = function () {
      _super()?.[null];
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_158_223 !== null && typeof __nox_super_158_223 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  _Class21.prototype = Object.create(__nox_super_158_223 && __nox_super_158_223.prototype, {
    constructor: {
      value: _Class21,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class21, __nox_super_158_223);
  else _Class21.__proto__ = __nox_super_158_223;
  Object.defineProperty(_Class21, 'prototype', { writable: false });
  return _Class21;
})(Base))();
new ((__nox_super_229_290 => {
  'use strict';
  const _Class24 = function _Class24() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(_Class24), arguments, _newtarget || _Class24);
      return _this;
    }
    var _result = function () {
      1 + _super();
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_229_290 !== null && typeof __nox_super_229_290 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  _Class24.prototype = Object.create(__nox_super_229_290 && __nox_super_229_290.prototype, {
    constructor: {
      value: _Class24,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(_Class24, __nox_super_229_290);
  else _Class24.__proto__ = __nox_super_229_290;
  Object.defineProperty(_Class24, 'prototype', { writable: false });
  return _Class24;
})(Base))();`,
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
      },
    ],
  },
  {
    title: 'spec — super illegal non constructor call (input)',
    source: `class Test {
  foo() {
    super();
  }
}
`,
    filename: 'input.js',
    output: '[syntax-error] invalid-input',
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
      },
    ],
  },
  {
    title: 'spec — super missing (exec)',
    source: `class Base {};

expect(() => new class extends Base {
  constructor() {
    x: { break x; super(); }
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    try {} catch { super(); }
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    try { throw 0; super(); } catch {}
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    true || super();
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    ({}) ?? super();
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    false && super();
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    null?.(super());
  }
}).toThrow();


expect(() => new class extends Base {
  constructor() {
    null?.[super()];
  }
}).toThrow();
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
expect(
  () =>
    new ((__nox_super_33_106 => {
      'use strict';
      const _Class = function _Class() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class), arguments, _newtarget || _Class);
          return _this;
        }
        var _result = function () {
          x: {
            break x;
            _super();
          }
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_33_106 !== null && typeof __nox_super_33_106 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class.prototype = Object.create(__nox_super_33_106 && __nox_super_33_106.prototype, {
        constructor: {
          value: _Class,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_33_106);
      else _Class.__proto__ = __nox_super_33_106;
      Object.defineProperty(_Class, 'prototype', { writable: false });
      return _Class;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_137_211 => {
      'use strict';
      const _Class18 = function _Class18() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class18), arguments, _newtarget || _Class18);
          return _this;
        }
        var _result = function () {
          try {
          } catch {
            _super();
          }
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_137_211 !== null && typeof __nox_super_137_211 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class18.prototype = Object.create(__nox_super_137_211 && __nox_super_137_211.prototype, {
        constructor: {
          value: _Class18,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class18, __nox_super_137_211);
      else _Class18.__proto__ = __nox_super_137_211;
      Object.defineProperty(_Class18, 'prototype', { writable: false });
      return _Class18;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_242_325 => {
      'use strict';
      const _Class21 = function _Class21() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class21), arguments, _newtarget || _Class21);
          return _this;
        }
        var _result = function () {
          try {
            throw 0;
            _super();
          } catch {}
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_242_325 !== null && typeof __nox_super_242_325 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class21.prototype = Object.create(__nox_super_242_325 && __nox_super_242_325.prototype, {
        constructor: {
          value: _Class21,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class21, __nox_super_242_325);
      else _Class21.__proto__ = __nox_super_242_325;
      Object.defineProperty(_Class21, 'prototype', { writable: false });
      return _Class21;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_356_421 => {
      'use strict';
      const _Class24 = function _Class24() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class24), arguments, _newtarget || _Class24);
          return _this;
        }
        var _result = function () {
          true || _super();
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_356_421 !== null && typeof __nox_super_356_421 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class24.prototype = Object.create(__nox_super_356_421 && __nox_super_356_421.prototype, {
        constructor: {
          value: _Class24,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class24, __nox_super_356_421);
      else _Class24.__proto__ = __nox_super_356_421;
      Object.defineProperty(_Class24, 'prototype', { writable: false });
      return _Class24;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_452_517 => {
      'use strict';
      const _Class27 = function _Class27() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class27), arguments, _newtarget || _Class27);
          return _this;
        }
        var _result = function () {
          ({}) ?? _super();
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_452_517 !== null && typeof __nox_super_452_517 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class27.prototype = Object.create(__nox_super_452_517 && __nox_super_452_517.prototype, {
        constructor: {
          value: _Class27,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class27, __nox_super_452_517);
      else _Class27.__proto__ = __nox_super_452_517;
      Object.defineProperty(_Class27, 'prototype', { writable: false });
      return _Class27;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_548_614 => {
      'use strict';
      const _Class30 = function _Class30() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class30), arguments, _newtarget || _Class30);
          return _this;
        }
        var _result = function () {
          false && _super();
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_548_614 !== null && typeof __nox_super_548_614 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class30.prototype = Object.create(__nox_super_548_614 && __nox_super_548_614.prototype, {
        constructor: {
          value: _Class30,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class30, __nox_super_548_614);
      else _Class30.__proto__ = __nox_super_548_614;
      Object.defineProperty(_Class30, 'prototype', { writable: false });
      return _Class30;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_645_710 => {
      'use strict';
      const _Class33 = function _Class33() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class33), arguments, _newtarget || _Class33);
          return _this;
        }
        var _result = function () {
          null?.(_super());
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_645_710 !== null && typeof __nox_super_645_710 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class33.prototype = Object.create(__nox_super_645_710 && __nox_super_645_710.prototype, {
        constructor: {
          value: _Class33,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class33, __nox_super_645_710);
      else _Class33.__proto__ = __nox_super_645_710;
      Object.defineProperty(_Class33, 'prototype', { writable: false });
      return _Class33;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_742_807 => {
      'use strict';
      const _Class36 = function _Class36() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class36), arguments, _newtarget || _Class36);
          return _this;
        }
        var _result = function () {
          null?.[_super()];
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_742_807 !== null && typeof __nox_super_742_807 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class36.prototype = Object.create(__nox_super_742_807 && __nox_super_742_807.prototype, {
        constructor: {
          value: _Class36,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class36, __nox_super_742_807);
      else _Class36.__proto__ = __nox_super_742_807;
      Object.defineProperty(_Class36, 'prototype', { writable: false });
      return _Class36;
    })(Base))(),
).toThrow();`,
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
      },
    ],
  },
  {
    title: 'spec — super missing (input)',
    source: `class Base {};

expect(() => new class extends Base {
  constructor() {
    x: { break x; super(); }
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    try {} catch { super(); }
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    try { throw 0; super(); } catch {}
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    true || super();
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    ({}) ?? super();
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    false && super();
  }
}).toThrow();

expect(() => new class extends Base {
  constructor() {
    null?.(super());
  }
}).toThrow();


expect(() => new class extends Base {
  constructor() {
    null?.[super()];
  }
}).toThrow();
`,
    filename: 'input.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Base = (() => {
  'use strict';
  const Base = function Base() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Base, 'prototype', { writable: false });
  return Base;
})();
expect(
  () =>
    new ((__nox_super_33_106 => {
      'use strict';
      const _Class = function _Class() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class), arguments, _newtarget || _Class);
          return _this;
        }
        var _result = function () {
          x: {
            break x;
            _super();
          }
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_33_106 !== null && typeof __nox_super_33_106 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class.prototype = Object.create(__nox_super_33_106 && __nox_super_33_106.prototype, {
        constructor: {
          value: _Class,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class, __nox_super_33_106);
      else _Class.__proto__ = __nox_super_33_106;
      Object.defineProperty(_Class, 'prototype', { writable: false });
      return _Class;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_137_211 => {
      'use strict';
      const _Class18 = function _Class18() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class18), arguments, _newtarget || _Class18);
          return _this;
        }
        var _result = function () {
          try {
          } catch {
            _super();
          }
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_137_211 !== null && typeof __nox_super_137_211 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class18.prototype = Object.create(__nox_super_137_211 && __nox_super_137_211.prototype, {
        constructor: {
          value: _Class18,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class18, __nox_super_137_211);
      else _Class18.__proto__ = __nox_super_137_211;
      Object.defineProperty(_Class18, 'prototype', { writable: false });
      return _Class18;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_242_325 => {
      'use strict';
      const _Class21 = function _Class21() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class21), arguments, _newtarget || _Class21);
          return _this;
        }
        var _result = function () {
          try {
            throw 0;
            _super();
          } catch {}
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_242_325 !== null && typeof __nox_super_242_325 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class21.prototype = Object.create(__nox_super_242_325 && __nox_super_242_325.prototype, {
        constructor: {
          value: _Class21,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class21, __nox_super_242_325);
      else _Class21.__proto__ = __nox_super_242_325;
      Object.defineProperty(_Class21, 'prototype', { writable: false });
      return _Class21;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_356_421 => {
      'use strict';
      const _Class24 = function _Class24() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class24), arguments, _newtarget || _Class24);
          return _this;
        }
        var _result = function () {
          true || _super();
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_356_421 !== null && typeof __nox_super_356_421 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class24.prototype = Object.create(__nox_super_356_421 && __nox_super_356_421.prototype, {
        constructor: {
          value: _Class24,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class24, __nox_super_356_421);
      else _Class24.__proto__ = __nox_super_356_421;
      Object.defineProperty(_Class24, 'prototype', { writable: false });
      return _Class24;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_452_517 => {
      'use strict';
      const _Class27 = function _Class27() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class27), arguments, _newtarget || _Class27);
          return _this;
        }
        var _result = function () {
          ({}) ?? _super();
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_452_517 !== null && typeof __nox_super_452_517 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class27.prototype = Object.create(__nox_super_452_517 && __nox_super_452_517.prototype, {
        constructor: {
          value: _Class27,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class27, __nox_super_452_517);
      else _Class27.__proto__ = __nox_super_452_517;
      Object.defineProperty(_Class27, 'prototype', { writable: false });
      return _Class27;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_548_614 => {
      'use strict';
      const _Class30 = function _Class30() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class30), arguments, _newtarget || _Class30);
          return _this;
        }
        var _result = function () {
          false && _super();
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_548_614 !== null && typeof __nox_super_548_614 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class30.prototype = Object.create(__nox_super_548_614 && __nox_super_548_614.prototype, {
        constructor: {
          value: _Class30,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class30, __nox_super_548_614);
      else _Class30.__proto__ = __nox_super_548_614;
      Object.defineProperty(_Class30, 'prototype', { writable: false });
      return _Class30;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_645_710 => {
      'use strict';
      const _Class33 = function _Class33() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class33), arguments, _newtarget || _Class33);
          return _this;
        }
        var _result = function () {
          null?.(_super());
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_645_710 !== null && typeof __nox_super_645_710 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class33.prototype = Object.create(__nox_super_645_710 && __nox_super_645_710.prototype, {
        constructor: {
          value: _Class33,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class33, __nox_super_645_710);
      else _Class33.__proto__ = __nox_super_645_710;
      Object.defineProperty(_Class33, 'prototype', { writable: false });
      return _Class33;
    })(Base))(),
).toThrow();
expect(
  () =>
    new ((__nox_super_742_807 => {
      'use strict';
      const _Class36 = function _Class36() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        var _this,
          _newtarget = new.target;
        function _super() {
          _this = _construct(Object.getPrototypeOf(_Class36), arguments, _newtarget || _Class36);
          return _this;
        }
        var _result = function () {
          null?.[_super()];
        }.apply(void 0, arguments);
        if (_result !== void 0) {
          if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
            return _result;
          throw new TypeError('Derived constructors may only return object or undefined');
        }
        if (_this === void 0)
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return _this;
      };
      if (__nox_super_742_807 !== null && typeof __nox_super_742_807 !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      _Class36.prototype = Object.create(__nox_super_742_807 && __nox_super_742_807.prototype, {
        constructor: {
          value: _Class36,
          writable: true,
          configurable: true,
        },
      });
      if (Object.setPrototypeOf) Object.setPrototypeOf(_Class36, __nox_super_742_807);
      else _Class36.__proto__ = __nox_super_742_807;
      Object.defineProperty(_Class36, 'prototype', { writable: false });
      return _Class36;
    })(Base))(),
).toThrow();`,
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
      },
    ],
  },
  {
    title: 'spec — super proto modifications (exec)',
    source: `var A_called = false;
var X_called = false;

class A { constructor() { A_called = true } }
class X { constructor() { X_called = true } }
class B extends A {}

B.prototype.__proto__ = X.prototype;
B.__proto__ = X;

expect(new B() instanceof B).toBe(true);
expect(new B() instanceof A).toBe(false);
expect(new B() instanceof X).toBe(true);
expect(A_called).toBe(false);
expect(X_called).toBe(true);
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
var A_called = false;
var X_called = false;
let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    A_called = true;
  };
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
let X = (() => {
  'use strict';
  const X = function X() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    X_called = true;
  };
  Object.defineProperty(X, 'prototype', { writable: false });
  return X;
})();
let B = (__nox_super_137_157 => {
  'use strict';
  const B = function B() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(B), arguments, new.target || B);
    return _this;
  };
  if (__nox_super_137_157 !== null && typeof __nox_super_137_157 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  B.prototype = Object.create(__nox_super_137_157 && __nox_super_137_157.prototype, {
    constructor: {
      value: B,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_137_157);
  else B.__proto__ = __nox_super_137_157;
  Object.defineProperty(B, 'prototype', { writable: false });
  return B;
})(A);
B.prototype.__proto__ = X.prototype;
B.__proto__ = X;
expect(new B() instanceof B).toBe(true);
expect(new B() instanceof A).toBe(false);
expect(new B() instanceof X).toBe(true);
expect(A_called).toBe(false);
expect(X_called).toBe(true);`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before bare super inline (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    super.foo(super());
  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_85 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      _get(Object.getPrototypeOf(Foo.prototype), 'foo', _construct.assert(_this)).call(
        _construct.assert(_this),
        _super(),
      );
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_14_85 !== null && typeof __nox_super_14_85 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_85 && __nox_super_14_85.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_85);
  else Foo.__proto__ = __nox_super_14_85;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before bare super inline (input)',
    source: `class Foo extends Bar {
  constructor() {
    super.foo(super());
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Foo = (__nox_super_0_71 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      _get(Object.getPrototypeOf(Foo.prototype), 'foo', _construct.assert(_this)).call(
        _construct.assert(_this),
        _super(),
      );
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_71 !== null && typeof __nox_super_0_71 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_71 && __nox_super_0_71.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_71);
  else Foo.__proto__ = __nox_super_0_71;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before bare super (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    super.foo();
    super();
  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_91 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _get(Object.getPrototypeOf(Foo.prototype), 'foo', _construct.assert(_this)).call(
      _construct.assert(_this),
    );
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_14_91 !== null && typeof __nox_super_14_91 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_91 && __nox_super_14_91.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_91);
  else Foo.__proto__ = __nox_super_14_91;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before bare super (input)',
    source: `class Foo extends Bar {
  constructor() {
    super.foo();
    super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Foo = (__nox_super_0_77 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _get(Object.getPrototypeOf(Foo.prototype), 'foo', _construct.assert(_this)).call(
      _construct.assert(_this),
    );
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_77 !== null && typeof __nox_super_0_77 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_77 && __nox_super_0_77.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_77);
  else Foo.__proto__ = __nox_super_0_77;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda 2 (exec)',
    source: `class Bar {
  test() {}
}

class Foo extends Bar {
  constructor() {
    const t = () => super.test()
    t();
    super();
  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_27_129 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const t = () =>
      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
      );
    t();
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_27_129 !== null && typeof __nox_super_27_129 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_27_129 && __nox_super_27_129.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_27_129);
  else Foo.__proto__ = __nox_super_27_129;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda 2 (input)',
    source: `class Foo extends Bar {
  constructor() {
    var t = () => super.test()
    super.foo();
    super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Foo = (__nox_super_0_108 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var t = () =>
      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
      );
    _get(Object.getPrototypeOf(Foo.prototype), 'foo', _construct.assert(_this)).call(
      _construct.assert(_this),
    );
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_108 !== null && typeof __nox_super_0_108 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_108 && __nox_super_0_108.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_108);
  else Foo.__proto__ = __nox_super_0_108;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda 3 (exec)',
    source: `class Bar {
  test() {}
}

class Foo extends Bar {
  constructor() {
    const t = () => super.test()
    super();
    t();
  }
}

new Foo();
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_27_129 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const t = () =>
      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
      );
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      t();
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_27_129 !== null && typeof __nox_super_27_129 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_27_129 && __nox_super_27_129.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_27_129);
  else Foo.__proto__ = __nox_super_27_129;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
new Foo();`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda 3 (input)',
    source: `class Foo extends Bar {
  constructor() {
    const t = () => super.test()
    super();
    t();
  }
}`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Foo = (__nox_super_0_102 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const t = () =>
      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
      );
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      t();
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_102 !== null && typeof __nox_super_0_102 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_102 && __nox_super_0_102.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_102);
  else Foo.__proto__ = __nox_super_0_102;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda (exec)',
    source: `class Bar {
  test() {}
}

class Foo extends Bar {
  constructor() {
    const t = () => super.test()
    super();
  }
}

new Foo();`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
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
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_27_120 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const t = () =>
      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
      );
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_27_120 !== null && typeof __nox_super_27_120 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_27_120 && __nox_super_27_120.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_27_120);
  else Foo.__proto__ = __nox_super_27_120;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
new Foo();`,
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
      },
    ],
  },
  {
    title: 'spec — super reference before in lambda (input)',
    source: `class Foo extends Bar {
  constructor() {
    const t = () => super.test()
    super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Foo = (__nox_super_0_93 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const t = () =>
      _get(Object.getPrototypeOf(Foo.prototype), 'test', _construct.assert(_this)).call(
        _construct.assert(_this),
      );
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_93 !== null && typeof __nox_super_0_93 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_93 && __nox_super_0_93.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_93);
  else Foo.__proto__ = __nox_super_0_93;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — super reference in prop exression (exec)',
    source: `let called = false;

class A {
  get prop() {
    called = true;
  }
}

class B extends A {
  constructor() {
    super[super().prop]
  }
}

expect(() => {
  new B();
}).toThrow(ReferenceError);
expect(called).toBe(false);
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let called = false;
let A = (() => {
  'use strict';
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, 'prop', {
    get: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        called = true;
      },
      'name',
      {
        value: 'get prop',
        configurable: true,
      },
    ),
    configurable: true,
  });
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();
let B = (__nox_super_72_139 => {
  'use strict';
  const B = function B() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(B), arguments, _newtarget || B);
      return _this;
    }
    var _result = function () {
      _get(Object.getPrototypeOf(B.prototype), _super().prop, _construct.assert(_this));
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_72_139 !== null && typeof __nox_super_72_139 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  B.prototype = Object.create(__nox_super_72_139 && __nox_super_72_139.prototype, {
    constructor: {
      value: B,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(B, __nox_super_72_139);
  else B.__proto__ = __nox_super_72_139;
  Object.defineProperty(B, 'prototype', { writable: false });
  return B;
})(A);
expect(() => {
  new B();
}).toThrow(ReferenceError);
expect(called).toBe(false);`,
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
      },
    ],
  },
  {
    title: 'spec — super reference in prop exression (input)',
    source: `class Foo extends Bar {
  constructor() {
    super[super().method]();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
var _get2 = { get: require('@babel/runtime/helpers/get') };
function _get(e, t, r) {
  return _get2.get(e, t, r);
}
let Foo = (__nox_super_0_76 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      _get(Object.getPrototypeOf(Foo.prototype), _super().method, _construct.assert(_this)).call(
        _construct.assert(_this),
      );
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_76 !== null && typeof __nox_super_0_76 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_76 && __nox_super_0_76.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_76);
  else Foo.__proto__ = __nox_super_0_76;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — super spread args (exec)',
    source: `// test262/test/language/expressions/super/call-spread-err-sngl-err-itr-get-get.js

var iter = {};
Object.defineProperty(iter, Symbol.iterator, {
  get: function() {
    throw new Error("err");
  }
});

class Test262ParentClass {
  constructor() {}
}

class Test262ChildClass extends Test262ParentClass {
  constructor() {
    super(...iter);
  }
}

expect(()=>{
  new Test262ChildClass();
}).toThrow("err");
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
// test262/test/language/expressions/super/call-spread-err-sngl-err-itr-get-get.js
var iter = {};
Object.defineProperty(iter, Symbol.iterator, {
  get: function () {
    throw new Error('err');
  },
});
let Test262ParentClass = (() => {
  'use strict';
  const Test262ParentClass = function Test262ParentClass() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test262ParentClass, 'prototype', { writable: false });
  return Test262ParentClass;
})();
let Test262ChildClass = (__nox_super_252_348 => {
  'use strict';
  const Test262ChildClass = function Test262ChildClass() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(
      Object.getPrototypeOf(Test262ChildClass),
      [...iter],
      new.target || Test262ChildClass,
    );
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_252_348 !== null && typeof __nox_super_252_348 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Test262ChildClass.prototype = Object.create(
    __nox_super_252_348 && __nox_super_252_348.prototype,
    {
      constructor: {
        value: Test262ChildClass,
        writable: true,
        configurable: true,
      },
    },
  );
  if (Object.setPrototypeOf) Object.setPrototypeOf(Test262ChildClass, __nox_super_252_348);
  else Test262ChildClass.__proto__ = __nox_super_252_348;
  Object.defineProperty(Test262ChildClass, 'prototype', { writable: false });
  return Test262ChildClass;
})(Test262ParentClass);
expect(() => {
  new Test262ChildClass();
}).toThrow('err');`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 2 (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    super(this);
  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = { construct: require('@babel/runtime/helpers/construct') };
function _construct(t, r, c) {
  return _construct2.construct(t, r, c);
}
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_78 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this = _construct(Object.getPrototypeOf(Foo), [this], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_14_78 !== null && typeof __nox_super_14_78 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_78 && __nox_super_14_78.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_78);
  else Foo.__proto__ = __nox_super_14_78;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 3 (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    const fn = () => this;
    fn();
    super();
  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_111 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const fn = () => _construct.assert(_this);
    fn();
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_14_111 !== null && typeof __nox_super_14_111 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_111 && __nox_super_14_111.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_111);
  else Foo.__proto__ = __nox_super_14_111;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 3 (input)',
    source: `class Foo extends Bar {
  constructor() {
    const fn = () => this;
    fn();
    super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Foo = (__nox_super_0_97 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const fn = () => _construct.assert(_this);
    fn();
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_97 !== null && typeof __nox_super_0_97 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_97 && __nox_super_0_97.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_97);
  else Foo.__proto__ = __nox_super_0_97;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 4 (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    const fn = () => this;
    super();
    fn();
  }
}

new Foo();
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_111 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const fn = () => _construct.assert(_this);
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      fn();
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_14_111 !== null && typeof __nox_super_14_111 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_111 && __nox_super_14_111.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_111);
  else Foo.__proto__ = __nox_super_14_111;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
new Foo();`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 4 (input)',
    source: `class Foo extends Bar {
  constructor() {
    const fn = () => this;
    super();
    fn();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Foo = (__nox_super_0_97 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    const fn = () => _construct.assert(_this);
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {
      fn();
    }.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_97 !== null && typeof __nox_super_0_97 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_97 && __nox_super_0_97.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_97);
  else Foo.__proto__ = __nox_super_0_97;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 5 (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    Foo[this];
  }
}

expect(() => new Foo()).toThrow("this hasn't been initialised");
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_76 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      Foo[_construct.assert(_this)];
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_14_76 !== null && typeof __nox_super_14_76 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_76 && __nox_super_14_76.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_76);
  else Foo.__proto__ = __nox_super_14_76;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow("this hasn't been initialised");`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes 5 (input)',
    source: `class Foo extends Bar {
  constructor() {
    Foo[this];
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Foo = (__nox_super_0_62 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    var _this,
      _newtarget = new.target;
    function _super() {
      _this = _construct(Object.getPrototypeOf(Foo), arguments, _newtarget || Foo);
      return _this;
    }
    var _result = function () {
      Foo[_construct.assert(_this)];
    }.apply(void 0, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    if (_this === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return _this;
  };
  if (__nox_super_0_62 !== null && typeof __nox_super_0_62 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_62 && __nox_super_0_62.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_62);
  else Foo.__proto__ = __nox_super_0_62;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes (exec)',
    source: `class Bar {}

class Foo extends Bar {
  constructor() {
    this.foo = "bar";
    super();
  }
}

expect(() => new Foo()).toThrow();
`,
    filename: 'exec.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Bar = (() => {
  'use strict';
  const Bar = function Bar() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Bar, 'prototype', { writable: false });
  return Bar;
})();
let Foo = (__nox_super_14_96 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _construct.assert(_this).foo = 'bar';
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_14_96 !== null && typeof __nox_super_14_96 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_14_96 && __nox_super_14_96.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_14_96);
  else Foo.__proto__ = __nox_super_14_96;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);
expect(() => new Foo()).toThrow();`,
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
      },
    ],
  },
  {
    title: 'spec — this not allowed before super in derived classes (input)',
    source: `class Foo extends Bar {
  constructor() {
    this.foo = "bar";
    super();
  }
}
`,
    filename: 'input.js',
    output: `var _construct2 = {
  construct: require('@babel/runtime/helpers/construct'),
  assertThisInitialized: require('@babel/runtime/helpers/assertThisInitialized'),
};
function _construct(t, e, r) {
  return _construct2.construct(t, e, r);
}
_construct.assert = _construct2.assertThisInitialized;
let Foo = (__nox_super_0_82 => {
  'use strict';
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _construct.assert(_this).foo = 'bar';
    var _this = _construct(Object.getPrototypeOf(Foo), [], new.target || Foo);
    var _result = function () {}.apply(_this, arguments);
    if (_result !== void 0) {
      if ((typeof _result === 'object' && _result !== null) || typeof _result === 'function')
        return _result;
      throw new TypeError('Derived constructors may only return object or undefined');
    }
    return _this;
  };
  if (__nox_super_0_82 !== null && typeof __nox_super_0_82 !== 'function')
    throw new TypeError('Super expression must either be null or a function');
  Foo.prototype = Object.create(__nox_super_0_82 && __nox_super_0_82.prototype, {
    constructor: {
      value: Foo,
      writable: true,
      configurable: true,
    },
  });
  if (Object.setPrototypeOf) Object.setPrototypeOf(Foo, __nox_super_0_82);
  else Foo.__proto__ = __nox_super_0_82;
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})(Bar);`,
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
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
