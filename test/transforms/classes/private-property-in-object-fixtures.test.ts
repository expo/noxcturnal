import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'assumption privateFieldsAsProperties — accessor (input)',
    source: `class Foo {
  get #foo() {}

  test(other) {
    return #foo in other;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  function _initialize() {
    Object.defineProperty(this, _foo, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — compiled classes (input)',
    source: `class Foo {
  static #foo = "foo";
  #bar = "bar";

  static test() {
    return #foo in Foo;
  }

  test() {
    return #bar in this;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
  function _initialize() {
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 'bar',
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(Foo), _foo);
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
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar);
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
  Object.defineProperty(Foo, _foo, {
    writable: true,
    value: 'foo',
  });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — field (input)',
    source: `class Foo {
  #foo = 1;

  test(other) {
    return #foo in other;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  function _initialize() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — method (exec)',
    source: `class Foo {
  #foo() { }
  #foo2() { }

  test(other) {
    return #foo in other;
  }
  test2(other) {
    return #foo2 in other;
  }
}

const cl = new Foo();

expect(cl.test({})).toBe(false);
expect(cl.test(cl)).toBe(true);
expect(cl.test2({})).toBe(false);
expect(cl.test2(cl)).toBe(true);
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
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  var _foo2 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo2');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  var _privateMethod18 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _foo, { value: _privateMethod });
    Object.defineProperty(this, _foo2, { value: _privateMethod18 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  Object.defineProperty(Foo.prototype, 'test2', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo2);
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
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();
const cl = new Foo();
expect(cl.test({})).toBe(false);
expect(cl.test(cl)).toBe(true);
expect(cl.test2({})).toBe(false);
expect(cl.test2(cl)).toBe(true);`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — method (input)',
    source: `class Foo {
  #foo() { }
  #foo2() { }

  test(other) {
    return #foo in other;
  }
  test2(other) {
    return #foo2 in other;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  var _foo2 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo2');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  var _privateMethod17 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _foo, { value: _privateMethod });
    Object.defineProperty(this, _foo2, { value: _privateMethod17 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  Object.defineProperty(Foo.prototype, 'test2', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo2);
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
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — nested class other redeclared (input)',
    source: `class Foo {
  #foo = 1;
  #bar = 1;

  test() {
    class Nested {
      #bar = 2;

      test() {
        #foo in this;
        #bar in this;
      }
    }

    #foo in this;
    #bar in this;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
  function _initialize() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 1,
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        let Nested = (() => {
          'use strict';
          var _bar20 =
            _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Nested_bar');
          function _initialize22() {
            Object.defineProperty(this, _bar20, {
              writable: true,
              value: 2,
            });
          }
          const Nested = function Nested() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
            _initialize22.call(this);
          };
          Object.defineProperty(Nested.prototype, 'test', {
            value: Object.defineProperty(
              function () {
                if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);
                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar20);
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
          Object.defineProperty(Nested, 'prototype', { writable: false });
          return Nested;
        })();
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _bar);
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
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — nested class redeclared (input)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested {
      #foo = 2;

      test() {
        #foo in this;
      }
    }

    #foo in this;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  function _initialize() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        let Nested = (() => {
          'use strict';
          var _foo18 =
            _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Nested_foo');
          function _initialize20() {
            Object.defineProperty(this, _foo18, {
              writable: true,
              value: 2,
            });
          }
          const Nested = function Nested() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
            _initialize20.call(this);
          };
          Object.defineProperty(Nested.prototype, 'test', {
            value: Object.defineProperty(
              function () {
                if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo18);
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
          Object.defineProperty(Nested, 'prototype', { writable: false });
          return Nested;
        })();
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);
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
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — nested class (input)',
    source: `class Foo {
  #foo = 1;

  test() {
    class Nested {
      test() {
        #foo in this;
      }
    }

    #foo in this;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  function _initialize() {
    Object.defineProperty(this, _foo, {
      writable: true,
      value: 1,
    });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        let Nested = (() => {
          'use strict';
          const Nested = function Nested() {
            if (!new.target) throw new TypeError('Cannot call a class as a function');
          };
          Object.defineProperty(Nested.prototype, 'test', {
            value: Object.defineProperty(
              function () {
                if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
                Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);
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
          Object.defineProperty(Nested, 'prototype', { writable: false });
          return Nested;
        })();
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _foo);
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
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — rhs not object (exec)',
    source: `expect(() => class { static #p = #p in 0 }).toThrow(\`right-hand side of 'in' should be an object, got number\`);
expect(() => class { static #p = #p in "" }).toThrow(\`right-hand side of 'in' should be an object, got string\`);
expect(() => class { static #p = #p in true }).toThrow(\`right-hand side of 'in' should be an object, got boolean\`);
expect(() => class { static #p = #p in void 0 }).toThrow(\`right-hand side of 'in' should be an object, got undefined\`);
expect(() => class { static #p = #p in null }).toThrow(\`right-hand side of 'in' should be an object, got null\`);
expect(() => class { static #p = #p in Symbol.iterator }).toThrow(\`right-hand side of 'in' should be an object, got symbol\`);
expect(() => class { static #p = #p in 0n }).toThrow(\`right-hand side of 'in' should be an object, got bigint\`);

expect(() => class { static #p() {}; static q = #p in 0 }).toThrow(\`right-hand side of 'in' should be an object, got number\`);
expect(() => class { static #p() {}; static q = #p in "" }).toThrow(\`right-hand side of 'in' should be an object, got string\`);
expect(() => class { static #p() {}; static q = #p in true }).toThrow(\`right-hand side of 'in' should be an object, got boolean\`);
expect(() => class { static #p() {}; static q = #p in void 0 }).toThrow(\`right-hand side of 'in' should be an object, got undefined\`);
expect(() => class { static #p() {}; static q = #p in null }).toThrow(\`right-hand side of 'in' should be an object, got null\`);
expect(() => class { static #p() {}; static q = #p in Symbol.iterator }).toThrow(\`right-hand side of 'in' should be an object, got symbol\`);
expect(() => class { static #p() {}; static q = #p in 0n }).toThrow(\`right-hand side of 'in' should be an object, got bigint\`);

expect(() => new class { #p = #p in 0 }).toThrow(\`right-hand side of 'in' should be an object, got number\`);
expect(() => new class { #p = #p in "" }).toThrow(\`right-hand side of 'in' should be an object, got string\`);
expect(() => new class { #p = #p in true }).toThrow(\`right-hand side of 'in' should be an object, got boolean\`);
expect(() => new class { #p = #p in void 0 }).toThrow(\`right-hand side of 'in' should be an object, got undefined\`);
expect(() => new class { #p = #p in null }).toThrow(\`right-hand side of 'in' should be an object, got null\`);
expect(() => new class { #p = #p in Symbol.iterator }).toThrow(\`right-hand side of 'in' should be an object, got symbol\`);
expect(() => new class { #p = #p in 0n }).toThrow(\`right-hand side of 'in' should be an object, got bigint\`);

expect(() => new class { #p() {}; q = #p in 0 }).toThrow(\`right-hand side of 'in' should be an object, got number\`);
expect(() => new class { #p() {}; q = #p in "" }).toThrow(\`right-hand side of 'in' should be an object, got string\`);
expect(() => new class { #p() {}; q = #p in true }).toThrow(\`right-hand side of 'in' should be an object, got boolean\`);
expect(() => new class { #p() {}; q = #p in void 0 }).toThrow(\`right-hand side of 'in' should be an object, got undefined\`);
expect(() => new class { #p() {}; q = #p in null }).toThrow(\`right-hand side of 'in' should be an object, got null\`);
expect(() => new class { #p() {}; q = #p in Symbol.iterator }).toThrow(\`right-hand side of 'in' should be an object, got symbol\`);
expect(() => new class { #p() {}; q = #p in 0n }).toThrow(\`right-hand side of 'in' should be an object, got bigint\`);
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
expect(() =>
  (() => {
    'use strict';
    var _p = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_p');
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class, 'prototype', { writable: false });
    Object.defineProperty(_Class, _p, {
      writable: true,
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p),
    });
    return _Class;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got number\`);
expect(() =>
  (() => {
    'use strict';
    var _p18 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class17_p');
    const _Class17 = function _Class17() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class17, 'prototype', { writable: false });
    Object.defineProperty(_Class17, _p18, {
      writable: true,
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p18),
    });
    return _Class17;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got string\`);
expect(() =>
  (() => {
    'use strict';
    var _p23 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class22_p');
    const _Class22 = function _Class22() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class22, 'prototype', { writable: false });
    Object.defineProperty(_Class22, _p23, {
      writable: true,
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p23),
    });
    return _Class22;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got boolean\`);
expect(() =>
  (() => {
    'use strict';
    var _p28 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class27_p');
    const _Class27 = function _Class27() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class27, 'prototype', { writable: false });
    Object.defineProperty(_Class27, _p28, {
      writable: true,
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p28),
    });
    return _Class27;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got undefined\`);
expect(() =>
  (() => {
    'use strict';
    var _p33 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class32_p');
    const _Class32 = function _Class32() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class32, 'prototype', { writable: false });
    Object.defineProperty(_Class32, _p33, {
      writable: true,
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p33),
    });
    return _Class32;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got null\`);
expect(() =>
  (() => {
    'use strict';
    var _p38 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class37_p');
    const _Class37 = function _Class37() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class37, 'prototype', { writable: false });
    Object.defineProperty(_Class37, _p38, {
      writable: true,
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p38),
    });
    return _Class37;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got symbol\`);
expect(() =>
  (() => {
    'use strict';
    var _p43 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class42_p');
    const _Class42 = function _Class42() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class42, 'prototype', { writable: false });
    Object.defineProperty(_Class42, _p43, {
      writable: true,
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p43),
    });
    return _Class42;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got bigint\`);
expect(() =>
  (() => {
    'use strict';
    var _p48 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class47_p');
    var _privateMethod49 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const _Class47 = function _Class47() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class47, 'prototype', { writable: false });
    Object.defineProperty(_Class47, _p48, { value: _privateMethod49 });
    Object.defineProperty(_Class47, 'q', {
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p48),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return _Class47;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got number\`);
expect(() =>
  (() => {
    'use strict';
    var _p53 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class52_p');
    var _privateMethod54 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const _Class52 = function _Class52() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class52, 'prototype', { writable: false });
    Object.defineProperty(_Class52, _p53, { value: _privateMethod54 });
    Object.defineProperty(_Class52, 'q', {
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p53),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return _Class52;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got string\`);
expect(() =>
  (() => {
    'use strict';
    var _p58 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class57_p');
    var _privateMethod59 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const _Class57 = function _Class57() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class57, 'prototype', { writable: false });
    Object.defineProperty(_Class57, _p58, { value: _privateMethod59 });
    Object.defineProperty(_Class57, 'q', {
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p58),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return _Class57;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got boolean\`);
expect(() =>
  (() => {
    'use strict';
    var _p63 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class62_p');
    var _privateMethod64 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const _Class62 = function _Class62() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class62, 'prototype', { writable: false });
    Object.defineProperty(_Class62, _p63, { value: _privateMethod64 });
    Object.defineProperty(_Class62, 'q', {
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p63),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return _Class62;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got undefined\`);
expect(() =>
  (() => {
    'use strict';
    var _p68 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class67_p');
    var _privateMethod69 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const _Class67 = function _Class67() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class67, 'prototype', { writable: false });
    Object.defineProperty(_Class67, _p68, { value: _privateMethod69 });
    Object.defineProperty(_Class67, 'q', {
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p68),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return _Class67;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got null\`);
expect(() =>
  (() => {
    'use strict';
    var _p73 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class72_p');
    var _privateMethod74 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const _Class72 = function _Class72() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class72, 'prototype', { writable: false });
    Object.defineProperty(_Class72, _p73, { value: _privateMethod74 });
    Object.defineProperty(_Class72, 'q', {
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p73),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return _Class72;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got symbol\`);
expect(() =>
  (() => {
    'use strict';
    var _p78 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class77_p');
    var _privateMethod79 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const _Class77 = function _Class77() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class77, 'prototype', { writable: false });
    Object.defineProperty(_Class77, _p78, { value: _privateMethod79 });
    Object.defineProperty(_Class77, 'q', {
      value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p78),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return _Class77;
  })(),
).toThrow(\`right-hand side of 'in' should be an object, got bigint\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p83 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class82_p');
      function _initialize85() {
        Object.defineProperty(this, _p83, {
          writable: true,
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p83),
        });
      }
      const _Class82 = function _Class82() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize85.call(this);
      };
      Object.defineProperty(_Class82, 'prototype', { writable: false });
      return _Class82;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got number\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p88 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class87_p');
      function _initialize90() {
        Object.defineProperty(this, _p88, {
          writable: true,
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p88),
        });
      }
      const _Class87 = function _Class87() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize90.call(this);
      };
      Object.defineProperty(_Class87, 'prototype', { writable: false });
      return _Class87;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got string\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p93 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class92_p');
      function _initialize95() {
        Object.defineProperty(this, _p93, {
          writable: true,
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p93),
        });
      }
      const _Class92 = function _Class92() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize95.call(this);
      };
      Object.defineProperty(_Class92, 'prototype', { writable: false });
      return _Class92;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got boolean\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p98 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class97_p');
      function _initialize100() {
        Object.defineProperty(this, _p98, {
          writable: true,
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p98),
        });
      }
      const _Class97 = function _Class97() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize100.call(this);
      };
      Object.defineProperty(_Class97, 'prototype', { writable: false });
      return _Class97;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got undefined\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p103 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class102_p');
      function _initialize105() {
        Object.defineProperty(this, _p103, {
          writable: true,
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p103),
        });
      }
      const _Class102 = function _Class102() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize105.call(this);
      };
      Object.defineProperty(_Class102, 'prototype', { writable: false });
      return _Class102;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got null\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p108 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class107_p');
      function _initialize110() {
        Object.defineProperty(this, _p108, {
          writable: true,
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p108),
        });
      }
      const _Class107 = function _Class107() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize110.call(this);
      };
      Object.defineProperty(_Class107, 'prototype', { writable: false });
      return _Class107;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got symbol\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p113 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class112_p');
      function _initialize115() {
        Object.defineProperty(this, _p113, {
          writable: true,
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p113),
        });
      }
      const _Class112 = function _Class112() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize115.call(this);
      };
      Object.defineProperty(_Class112, 'prototype', { writable: false });
      return _Class112;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got bigint\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p118 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class117_p');
      var _privateMethod119 = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize120() {
        Object.defineProperty(this, _p118, { value: _privateMethod119 });
        Object.defineProperty(this, 'q', {
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0), _p118),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      const _Class117 = function _Class117() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize120.call(this);
      };
      Object.defineProperty(_Class117, 'prototype', { writable: false });
      return _Class117;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got number\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p123 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class122_p');
      var _privateMethod124 = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize125() {
        Object.defineProperty(this, _p123, { value: _privateMethod124 });
        Object.defineProperty(this, 'q', {
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(''), _p123),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      const _Class122 = function _Class122() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize125.call(this);
      };
      Object.defineProperty(_Class122, 'prototype', { writable: false });
      return _Class122;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got string\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p128 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class127_p');
      var _privateMethod129 = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize130() {
        Object.defineProperty(this, _p128, { value: _privateMethod129 });
        Object.defineProperty(this, 'q', {
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(true), _p128),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      const _Class127 = function _Class127() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize130.call(this);
      };
      Object.defineProperty(_Class127, 'prototype', { writable: false });
      return _Class127;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got boolean\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p133 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class132_p');
      var _privateMethod134 = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize135() {
        Object.defineProperty(this, _p133, { value: _privateMethod134 });
        Object.defineProperty(this, 'q', {
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(void 0), _p133),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      const _Class132 = function _Class132() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize135.call(this);
      };
      Object.defineProperty(_Class132, 'prototype', { writable: false });
      return _Class132;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got undefined\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p138 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class137_p');
      var _privateMethod139 = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize140() {
        Object.defineProperty(this, _p138, { value: _privateMethod139 });
        Object.defineProperty(this, 'q', {
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(null), _p138),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      const _Class137 = function _Class137() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize140.call(this);
      };
      Object.defineProperty(_Class137, 'prototype', { writable: false });
      return _Class137;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got null\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p143 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class142_p');
      var _privateMethod144 = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize145() {
        Object.defineProperty(this, _p143, { value: _privateMethod144 });
        Object.defineProperty(this, 'q', {
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(Symbol.iterator), _p143),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      const _Class142 = function _Class142() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize145.call(this);
      };
      Object.defineProperty(_Class142, 'prototype', { writable: false });
      return _Class142;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got symbol\`);
expect(
  () =>
    new ((() => {
      'use strict';
      var _p148 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class147_p');
      var _privateMethod149 = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize150() {
        Object.defineProperty(this, _p148, { value: _privateMethod149 });
        Object.defineProperty(this, 'q', {
          value: Object.prototype.hasOwnProperty.call(_checkInRHS(0n), _p148),
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      const _Class147 = function _Class147() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize150.call(this);
      };
      Object.defineProperty(_Class147, 'prototype', { writable: false });
      return _Class147;
    })())(),
).toThrow(\`right-hand side of 'in' should be an object, got bigint\`);`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — static accessor (input)',
    source: `class Foo {
  static get #foo() {}

  test(other) {
    return #foo in other;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  Object.defineProperty(Foo, _foo, {
    get: function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    },
  });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — static field (input)',
    source: `class Foo {
  static #foo = 1;

  test(other) {
    return #foo in other;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  Object.defineProperty(Foo, _foo, {
    writable: true,
    value: 1,
  });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsProperties — static method (input)',
    source: `class Foo {
  static #foo() {}

  test(other) {
    return #foo in other;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  Object.defineProperty(Foo, _foo, { value: _privateMethod });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'assumption privateFieldsAsSymbols — method (input)',
    source: `class Foo {
  #foo() { }
  #foo2() { }

  test(other) {
    return #foo in other;
  }
  test2(other) {
    return #foo in other;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  var _foo2 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo2');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  var _privateMethod17 = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _foo, { value: _privateMethod });
    Object.defineProperty(this, _foo2, { value: _privateMethod17 });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  Object.defineProperty(Foo.prototype, 'test2', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  Object.defineProperty(Foo, 'prototype', { writable: false });
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'private loose — method (input)',
    source: `class Foo {
  #foo() {}

  test(other) {
    return #foo in other;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Foo = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_foo');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _foo, { value: _privateMethod });
  }
  const Foo = function Foo() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(Foo.prototype, 'test', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
  return Foo;
})();`,
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
      },
    ],
  },
  {
    title: 'private loose — static shadow (exec)',
    source: `class Test {

  static #x = 1

  method(other) {
    const Test = 2;
    const func = () => {
      const Test = 3;
      return #x in other && Test;
    }
    return func() + Test;
  }
}

const t = new Test();
const t2 = new Test();
expect(t.method(Test)).toBe(5)
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
let Test = (() => {
  'use strict';
  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Test_x');
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test.prototype, 'method', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        const Test = 2;
        const func = () => {
          const Test = 3;
          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _x) && Test;
        };
        return func() + Test;
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
  Object.defineProperty(Test, _x, {
    writable: true,
    value: 1,
  });
  return Test;
})();
const t = new Test();
const t2 = new Test();
expect(t.method(Test)).toBe(5);`,
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
      },
    ],
  },
  {
    title: 'private loose — static shadow (input)',
    source: `class Test {

  static #x = 1

  method(other) {
    const Test = 2;
    const func = () => {
      const Test = 3;
      return #x in other && Test;
    }
    return func() + Test;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let Test = (() => {
  'use strict';
  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Test_x');
  const Test = function Test() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(Test.prototype, 'method', {
    value: Object.defineProperty(
      function (other) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        const Test = 2;
        const func = () => {
          const Test = 3;
          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _x) && Test;
        };
        return func() + Test;
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
  Object.defineProperty(Test, _x, {
    writable: true,
    value: 1,
  });
  return Test;
})();`,
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
      },
    ],
  },
  {
    title: 'to native fields — class expression in default param (input)',
    source: `(x = class {
  #foo;
  test(other) { return #foo in other }
}) => {}
`,
    filename: 'input.js',
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
(
  x = (() => {
    'use strict';
    var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_foo');
    function _initialize() {
      Object.defineProperty(this, _foo, {
        writable: true,
        value: void 0,
      });
    }
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(_Class, 'name', {
      value: 'x',
      configurable: true,
    });
    Object.defineProperty(_Class.prototype, 'test', {
      value: Object.defineProperty(
        function (other) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return Object.prototype.hasOwnProperty.call(_checkInRHS(other), _foo);
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
    Object.defineProperty(_Class, 'prototype', { writable: false });
    return _Class;
  })(),
) => {};`,
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
      },
    ],
  },
  {
    title: 'to native fields — class expression instance (input)',
    source: `function fn() {
  return new class {
    #priv;

    method(obj) {
      return #priv in obj;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
function fn() {
  return new ((() => {
    'use strict';
    var _priv = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_priv');
    function _initialize() {
      Object.defineProperty(this, _priv, {
        writable: true,
        value: void 0,
      });
    }
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(_Class.prototype, 'method', {
      value: Object.defineProperty(
        function (obj) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _priv);
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
    Object.defineProperty(_Class, 'prototype', { writable: false });
    return _Class;
  })())();
}`,
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
      },
    ],
  },
  {
    title: 'to native fields — class expression static (input)',
    source: `function fn() {
  return new class {
    static #priv;

    method(obj) {
      return #priv in obj;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
function fn() {
  return new ((() => {
    'use strict';
    var _priv = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_priv');
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(_Class.prototype, 'method', {
      value: Object.defineProperty(
        function (obj) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _priv);
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
    Object.defineProperty(_Class, 'prototype', { writable: false });
    Object.defineProperty(_Class, _priv, {
      writable: true,
      value: void 0,
    });
    return _Class;
  })())();
}`,
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
      },
    ],
  },
  {
    title: 'to native fields — half constructed instance (exec)',
    source: `let hasW, hasX, hasY, hasZ;
let halfConstructed;

class F {
  m() {
    hasW = #w in this;
    hasX = #x in this;
    hasY = #y in this;
    hasZ = #z in this;
  }
  get #w() {}
  #x = 0;
  #y = (() => {
    halfConstructed = this;
    throw "error";
  })();
  #z() {}
}

try {
  new F();
} catch {}
halfConstructed.m();

expect(hasW).toBe(true);
expect(hasX).toBe(true);
expect(hasY).toBe(false);
expect(hasZ).toBe(true);
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
let hasW, hasX, hasY, hasZ;
let halfConstructed;
let F = (() => {
  'use strict';
  var _z = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_z');
  var _y = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_y');
  var _w = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_w');
  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_x');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _z, { value: _privateMethod });
    Object.defineProperty(this, _w, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
    Object.defineProperty(this, _x, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(this, _y, {
      writable: true,
      value: (() => {
        halfConstructed = this;
        throw 'error';
      })(),
    });
  }
  const F = function F() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(F.prototype, 'm', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        hasW = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);
        hasX = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);
        hasY = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);
        hasZ = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);
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
  Object.defineProperty(F, 'prototype', { writable: false });
  return F;
})();
try {
  new F();
} catch {}
halfConstructed.m();
expect(hasW).toBe(true);
expect(hasX).toBe(true);
expect(hasY).toBe(false);
expect(hasZ).toBe(true);`,
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
      },
    ],
  },
  {
    title: 'to native fields — half constructed instance (input)',
    source: `class F {
  m() {
    #w in this;
    #x in this;
    #y in this;
    #z in this;
  }
  get #w() {}
  #x = 0;
  #y = (() => {
    throw 'error';
  })();
  #z() {}
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let F = (() => {
  'use strict';
  var _z = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_z');
  var _y = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_y');
  var _w = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_w');
  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_x');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _z, { value: _privateMethod });
    Object.defineProperty(this, _w, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
    Object.defineProperty(this, _x, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(this, _y, {
      writable: true,
      value: (() => {
        throw 'error';
      })(),
    });
  }
  const F = function F() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(F.prototype, 'm', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);
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
  Object.defineProperty(F, 'prototype', { writable: false });
  return F;
})();`,
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
      },
    ],
  },
  {
    title: 'to native fields — half constructed static (exec)',
    source: `let hasW, hasX, hasY, hasZ;
let halfConstructed;

try {
  class F {
    static m() {
      hasW = #w in this;
      hasX = #x in this;
      hasY = #y in this;
      hasZ = #z in this;
    }
    static get #w() {}
    static #x = 0;
    static #y = (() => {
      halfConstructed = this;
      throw "error";
    })();
    static #z() {}
  }
} catch {}

halfConstructed.m();

expect(hasW).toBe(true);
expect(hasX).toBe(true);
expect(hasY).toBe(false);
expect(hasZ).toBe(true);
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
let hasW, hasX, hasY, hasZ;
let halfConstructed;
try {
  let F = (() => {
    'use strict';
    var _z = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_z');
    var _y = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_y');
    var _w = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_w');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_x');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    const F = function F() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(F, 'm', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          hasW = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _w);
          hasX = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);
          hasY = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);
          hasZ = Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);
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
    Object.defineProperty(F, 'prototype', { writable: false });
    Object.defineProperty(F, _z, { value: _privateMethod });
    Object.defineProperty(F, _w, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      },
    });
    Object.defineProperty(F, _x, {
      writable: true,
      value: 0,
    });
    Object.defineProperty(F, _y, {
      writable: true,
      value: (() => {
        halfConstructed = F;
        throw 'error';
      })(),
    });
    return F;
  })();
} catch {}
halfConstructed.m();
expect(hasW).toBe(true);
expect(hasX).toBe(true);
expect(hasY).toBe(false);
expect(hasZ).toBe(true);`,
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
      },
    ],
  },
  {
    title: 'to native fields — half constructed static (input)',
    source: `class F {
  static m() {
    #x in this;
    #y in this;
    #z in this;
  }
  static #x = 0;
  static #y = (() => {
    throw 'error';
  })();
  static #z() {}
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let F = (() => {
  'use strict';
  var _z = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_z');
  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_x');
  var _y = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_F_y');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  const F = function F() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(F, 'm', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _y);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _z);
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
  Object.defineProperty(F, 'prototype', { writable: false });
  Object.defineProperty(F, _z, { value: _privateMethod });
  Object.defineProperty(F, _x, {
    writable: true,
    value: 0,
  });
  Object.defineProperty(F, _y, {
    writable: true,
    value: (() => {
      throw 'error';
    })(),
  });
  return F;
})();`,
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
      },
    ],
  },
  {
    title: 'to native fields — multiple checks (input)',
    source: `class A {
  #x;
  #m() {}

  test() {
    #x in this;
    #m in this;
    #x in this;
    #m in this;
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let A = (() => {
  'use strict';
  var _m = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_m');
  var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_x');
  var _privateMethod = function () {
    if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
  };
  function _initialize() {
    Object.defineProperty(this, _m, { value: _privateMethod });
    Object.defineProperty(this, _x, {
      writable: true,
      value: void 0,
    });
  }
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
    _initialize.call(this);
  };
  Object.defineProperty(A.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _m);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _x);
        Object.prototype.hasOwnProperty.call(_checkInRHS(this), _m);
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
  Object.defineProperty(A, 'prototype', { writable: false });
  return A;
})();`,
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
      },
    ],
  },
  {
    title: 'to native fields — static shadowed binding (input)',
    source: `class A {
  static #foo;

  test() {
    let A = function fn(A) {
      return #foo in A;
    };
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
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
let A = (() => {
  'use strict';
  var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_foo');
  const A = function A() {
    if (!new.target) throw new TypeError('Cannot call a class as a function');
  };
  Object.defineProperty(A.prototype, 'test', {
    value: Object.defineProperty(
      function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        let A = function fn(A) {
          return Object.prototype.hasOwnProperty.call(_checkInRHS(A), _foo);
        };
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
  Object.defineProperty(A, 'prototype', { writable: false });
  Object.defineProperty(A, _foo, {
    writable: true,
    value: void 0,
  });
  return A;
})();`,
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
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
