import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.js',
  options: {
    helpers: {
      mode: 'runtime',
      moduleName: '@babel/runtime',
      version: '7.29.7',
    },
    transforms: {
      privateMethods: true,
    },
  },
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'private instance methods > private method can be called from constructor',
    source: `() => {
        class Foo {
          #bar() {
            return 42;
          }
          constructor() {
            this.result = this.#bar();
          }
        }
        const foo = new Foo();
        expect(foo.result).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 42;
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
      this.result = _classPrivateFieldLooseBase(this, _bar)[_bar]();
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  expect(foo.result).toBe(42);
};`,
  },
  {
    title: 'private instance methods > private method preserves this context',
    source: `() => {
        class Foo {
          #name = 'foo';
          #bar() {
            return this.#name;
          }
          test() {
            return this.#bar();
          }
        }
        const foo = new Foo();
        expect(foo.test()).toBe('foo');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _name = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_name');
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod17 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _name)[_name];
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod17 });
      Object.defineProperty(this, _name, {
        writable: true,
        value: 'foo',
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
          return _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
  })();
  const foo = new Foo();
  expect(foo.test()).toBe('foo');
};`,
  },
  {
    title: 'private instance methods > private method called with different this via call/apply',
    source: `() => {
        class Foo {
          x = 1;
          #bar() {
            return this.x;
          }
          getBar() {
            return this.#bar;
          }
        }
        const foo = new Foo();
        const bar = foo.getBar();
        // Private method extracted — calling with original receiver
        expect(bar.call(foo)).toBe(1);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return this.x;
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
      this.x = 1;
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'getBar', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _bar)[_bar];
        },
        'name',
        {
          value: 'getBar',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  const bar = foo.getBar();
  // Private method extracted — calling with original receiver
  expect(bar.call(foo)).toBe(1);
};`,
  },
  {
    title: 'private instance methods > exfiltrated private method has stable identity',
    source: `() => {
        class Foo {
          #bar() {
            return 'bar';
          }
          getBar() {
            return this.#bar;
          }
        }
        const foo = new Foo();
        expect(foo.getBar()).toBe(foo.getBar());
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'bar';
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'getBar', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _bar)[_bar];
        },
        'name',
        {
          value: 'getBar',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  expect(foo.getBar()).toBe(foo.getBar());
};`,
  },
  {
    title: 'private instance methods > private method available during field initialization',
    source: `() => {
        class Foo {
          #bar() {
            return 'bar';
          }
          foo = this.#bar();
        }
        const foo = new Foo();
        expect(foo.foo).toBe('bar');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'bar';
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
      this.foo = _classPrivateFieldLooseBase(this, _bar)[_bar]();
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  expect(foo.foo).toBe('bar');
};`,
  },
  {
    title: 'private instance methods > multiple private methods in same class',
    source: `() => {
        class Foo {
          #bar() {
            return 'bar';
          }
          #baz() {
            return 'baz';
          }
          test() {
            return this.#bar() + this.#baz();
          }
        }
        const foo = new Foo();
        expect(foo.test()).toBe('barbaz');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _baz = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_baz');
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod17 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'bar';
    };
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'baz';
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod17 });
      Object.defineProperty(this, _baz, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return (
            _classPrivateFieldLooseBase(this, _bar)[_bar]() +
            _classPrivateFieldLooseBase(this, _baz)[_baz]()
          );
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
  })();
  const foo = new Foo();
  expect(foo.test()).toBe('barbaz');
};`,
  },
  {
    title: 'private instance methods > private method is read-only (assignment throws)',
    source: `() => {
          expect(() => {
            class Foo {
              #bar() {}
              constructor() {
                this.#bar = 1;
              }
            }
            new Foo();
          }).toThrow();
        }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  expect(() => {
    let Foo = (() => {
      'use strict';
      var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
      var _privateMethod = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize() {
        Object.defineProperty(this, _bar, { value: _privateMethod });
      }
      const Foo = function Foo() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize.call(this);
        _classPrivateFieldLooseBase(this, _bar)[_bar] = 1;
      };
      Object.defineProperty(Foo, 'prototype', { writable: false });
      return Foo;
    })();
    new Foo();
  }).toThrow();
};`,
  },
  {
    title: 'private instance methods > private method compound assignment throws',
    source: `() => {
          expect(() => {
            class Foo {
              #bar() {}
              constructor() {
                this.#bar += 1;
              }
            }
            new Foo();
          }).toThrow();
        }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  expect(() => {
    let Foo = (() => {
      'use strict';
      var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
      var _privateMethod = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize() {
        Object.defineProperty(this, _bar, { value: _privateMethod });
      }
      const Foo = function Foo() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize.call(this);
        _classPrivateFieldLooseBase(this, _bar)[_bar] += 1;
      };
      Object.defineProperty(Foo, 'prototype', { writable: false });
      return Foo;
    })();
    new Foo();
  }).toThrow();
};`,
  },
  {
    title: 'private instance methods > private method increment throws',
    source: `() => {
          expect(() => {
            class Foo {
              #bar() {}
              constructor() {
                this.#bar++;
              }
            }
            new Foo();
          }).toThrow();
        }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  expect(() => {
    let Foo = (() => {
      'use strict';
      var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
      var _privateMethod = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      function _initialize() {
        Object.defineProperty(this, _bar, { value: _privateMethod });
      }
      const Foo = function Foo() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize.call(this);
        _classPrivateFieldLooseBase(this, _bar)[_bar]++;
      };
      Object.defineProperty(Foo, 'prototype', { writable: false });
      return Foo;
    })();
    new Foo();
  }).toThrow();
};`,
  },
  {
    title: 'private instance methods > class name binding preserved inside private method',
    source: `() => {
        class Foo {
          #bar() {
            return Foo;
          }
          test() {
            return this.#bar();
          }
        }
        const foo = new Foo();
        expect(foo.test()).toBe(Foo);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return Foo;
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
  })();
  const foo = new Foo();
  expect(foo.test()).toBe(Foo);
};`,
  },
  {
    title: 'private instance methods > super method access from private method',
    source: `() => {
        class Base {
          greet() {
            return 'hello';
          }
        }
        class Derived extends Base {
          #bar() {
            return super.greet();
          }
          test() {
            return this.#bar();
          }
        }
        const d = new Derived();
        expect(d.test()).toBe('hello');
      }`,
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
() => {
  class Base {
    greet() {
      return 'hello';
    }
  }
  let Derived = (__nox_super_107_273 => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Derived_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _get(Object.getPrototypeOf(Derived.prototype), 'greet', this).call(this);
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
    }
    const Derived = function Derived() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(Object.getPrototypeOf(Derived), arguments, new.target || Derived);
      (function () {
        _initialize.call(this);
      }).call(_this);
      return _this;
    };
    if (__nox_super_107_273 !== null && typeof __nox_super_107_273 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    Derived.prototype = Object.create(__nox_super_107_273 && __nox_super_107_273.prototype, {
      constructor: {
        value: Derived,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(Derived, __nox_super_107_273);
    else Derived.__proto__ = __nox_super_107_273;
    Object.defineProperty(Derived.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
    Object.defineProperty(Derived, 'prototype', { writable: false });
    return Derived;
  })(Base);
  const d = new Derived();
  expect(d.test()).toBe('hello');
};`,
  },
  {
    title: 'private instance methods > private method as tagged template',
    source: `() => {
        class Foo {
          #tag(strings, ...values) {
            return { strings: Array.from(strings), values };
          }
          test() {
            return this.#tag\`hello \${'world'}\`;
          }
        }
        const foo = new Foo();
        const result = foo.test();
        expect(result.strings).toEqual(['hello ', '']);
        expect(result.values).toEqual(['world']);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _tag = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_tag');
    var _privateMethod = function (strings, ...values) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return {
        strings: Array.from(strings),
        values,
      };
    };
    function _initialize() {
      Object.defineProperty(this, _tag, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _tag)[_tag]\`hello \${'world'}\`;
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
  })();
  const foo = new Foo();
  const result = foo.test();
  expect(result.strings).toEqual(['hello ', '']);
  expect(result.values).toEqual(['world']);
};`,
  },
  {
    title: 'private instance methods > private method with parameters',
    source: `() => {
        class Calc {
          #add(a, b) {
            return a + b;
          }
          sum(a, b) {
            return this.#add(a, b);
          }
        }
        const calc = new Calc();
        expect(calc.sum(3, 4)).toBe(7);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Calc = (() => {
    'use strict';
    var _add = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Calc_add');
    var _privateMethod = function (a, b) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return a + b;
    };
    function _initialize() {
      Object.defineProperty(this, _add, { value: _privateMethod });
    }
    const Calc = function Calc() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Calc.prototype, 'sum', {
      value: Object.defineProperty(
        function (a, b) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _add)[_add](a, b);
        },
        'name',
        {
          value: 'sum',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Calc, 'prototype', { writable: false });
    return Calc;
  })();
  const calc = new Calc();
  expect(calc.sum(3, 4)).toBe(7);
};`,
  },
  {
    title: 'private instance methods > private method with default parameters',
    source: `() => {
        class Foo {
          #greet(name = 'world') {
            return \`hello \${name}\`;
          }
          test(n) {
            return this.#greet(n);
          }
        }
        const foo = new Foo();
        expect(foo.test()).toBe('hello world');
        expect(foo.test('bar')).toBe('hello bar');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _greet = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_greet');
    var _privateMethod = function (name = 'world') {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return \`hello \${name}\`;
    };
    function _initialize() {
      Object.defineProperty(this, _greet, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function (n) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _greet)[_greet](n);
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
  })();
  const foo = new Foo();
  expect(foo.test()).toBe('hello world');
  expect(foo.test('bar')).toBe('hello bar');
};`,
  },
  {
    title: 'private instance methods > private method with rest parameters',
    source: `() => {
        class Foo {
          #sum(...args) {
            return args.reduce((a, b) => a + b, 0);
          }
          test(...args) {
            return this.#sum(...args);
          }
        }
        const foo = new Foo();
        expect(foo.test(1, 2, 3)).toBe(6);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _sum = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_sum');
    var _privateMethod = function (...args) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return args.reduce((a, b) => a + b, 0);
    };
    function _initialize() {
      Object.defineProperty(this, _sum, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function (...args) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _sum)[_sum](...args);
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
  })();
  const foo = new Foo();
  expect(foo.test(1, 2, 3)).toBe(6);
};`,
  },
  {
    title: 'private instance methods > private method with destructured parameters',
    source: `() => {
        class Foo {
          #extract({ x, y }) {
            return x + y;
          }
          test(obj) {
            return this.#extract(obj);
          }
        }
        const foo = new Foo();
        expect(foo.test({ x: 10, y: 20 })).toBe(30);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _extract = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_extract');
    var _privateMethod = function ({ x, y }) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return x + y;
    };
    function _initialize() {
      Object.defineProperty(this, _extract, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function (obj) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _extract)[_extract](obj);
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
  })();
  const foo = new Foo();
  expect(
    foo.test({
      x: 10,
      y: 20,
    }),
  ).toBe(30);
};`,
  },
  {
    title: 'private instance methods > private method not accessible from outside',
    source: `() => {
        class Foo {
          #secret() {
            return 42;
          }
        }
        const foo = new Foo();
        expect(foo['#secret']).toBeUndefined();
        expect(typeof foo['#secret']).toBe('undefined');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _secret = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_secret');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 42;
    };
    function _initialize() {
      Object.defineProperty(this, _secret, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  expect(foo['#secret']).toBeUndefined();
  expect(typeof foo['#secret']).toBe('undefined');
};`,
  },
  {
    title: 'private instance methods > private method not accessible from subclass',
    source: `() => {
        class Base {
          #secret() {
            return 42;
          }
          callSecret() {
            return this.#secret();
          }
        }
        class Child extends Base {}
        const child = new Child();
        // Can only call through inherited public method
        expect(child.callSecret()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Base = (() => {
    'use strict';
    var _secret = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Base_secret');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 42;
    };
    function _initialize() {
      Object.defineProperty(this, _secret, { value: _privateMethod });
    }
    const Base = function Base() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Base.prototype, 'callSecret', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _secret)[_secret]();
        },
        'name',
        {
          value: 'callSecret',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Base, 'prototype', { writable: false });
    return Base;
  })();
  class Child extends Base {}
  const child = new Child();
  // Can only call through inherited public method
  expect(child.callSecret()).toBe(42);
};`,
  },
  {
    title: 'private instance methods > private method calling another private method',
    source: `() => {
        class Foo {
          #a() {
            return 1;
          }
          #b() {
            return this.#a() + 2;
          }
          test() {
            return this.#b();
          }
        }
        const foo = new Foo();
        expect(foo.test()).toBe(3);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _a = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_a');
    var _b = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_b');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 1;
    };
    var _privateMethod17 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _a)[_a]() + 2;
    };
    function _initialize() {
      Object.defineProperty(this, _a, { value: _privateMethod });
      Object.defineProperty(this, _b, { value: _privateMethod17 });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _b)[_b]();
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
  })();
  const foo = new Foo();
  expect(foo.test()).toBe(3);
};`,
  },
  {
    title: 'private instance methods > private method returning this for chaining',
    source: `() => {
        class Builder {
          value = 0;
          #add(n) {
            this.value += n;
            return this;
          }
          #mul(n) {
            this.value *= n;
            return this;
          }
          build(a, b) {
            return this.#add(a).#mul(b).value;
          }
        }
        const b = new Builder();
        expect(b.build(3, 4)).toBe(12);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Builder = (() => {
    'use strict';
    var _add = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Builder_add');
    var _mul = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Builder_mul');
    var _privateMethod = function (n) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      this.value += n;
      return this;
    };
    var _privateMethod19 = function (n) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      this.value *= n;
      return this;
    };
    function _initialize() {
      Object.defineProperty(this, _add, { value: _privateMethod });
      Object.defineProperty(this, _mul, { value: _privateMethod19 });
      this.value = 0;
    }
    const Builder = function Builder() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Builder.prototype, 'build', {
      value: Object.defineProperty(
        function (a, b) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(
            _classPrivateFieldLooseBase(this, _add)[_add](a),
            _mul,
          )[_mul](b).value;
        },
        'name',
        {
          value: 'build',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Builder, 'prototype', { writable: false });
    return Builder;
  })();
  const b = new Builder();
  expect(b.build(3, 4)).toBe(12);
};`,
  },
  {
    title: 'async private methods > async private method returns promise',
    source: `async () => {
        class Foo {
          async #bar() {
            return 42;
          }
          async test() {
            return await this.#bar();
          }
        }
        const foo = new Foo();
        const result = await foo.test();
        expect(result).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
async () => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = async function () {
      return 42;
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        async function () {
          return await _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
  })();
  const foo = new Foo();
  const result = await foo.test();
  expect(result).toBe(42);
};`,
  },
  {
    title: 'async private methods > async private method with await',
    source: `async () => {
        class Foo {
          async #fetch(val) {
            const result = await Promise.resolve(val * 2);
            return result;
          }
          async test() {
            return await this.#fetch(21);
          }
        }
        const foo = new Foo();
        expect(await foo.test()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
async () => {
  let Foo = (() => {
    'use strict';
    var _fetch = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_fetch');
    var _privateMethod = async function (val) {
      const result = await Promise.resolve(val * 2);
      return result;
    };
    function _initialize() {
      Object.defineProperty(this, _fetch, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        async function () {
          return await _classPrivateFieldLooseBase(this, _fetch)[_fetch](21);
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
  })();
  const foo = new Foo();
  expect(await foo.test()).toBe(42);
};`,
  },
  {
    title: 'async private methods > async private method error propagation',
    source: `async () => {
        class Foo {
          async #fail() {
            throw new Error('private error');
          }
          async test() {
            try {
              await this.#fail();
              return 'no error';
            } catch (e) {
              return e.message;
            }
          }
        }
        const foo = new Foo();
        expect(await foo.test()).toBe('private error');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
async () => {
  let Foo = (() => {
    'use strict';
    var _fail = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_fail');
    var _privateMethod = async function () {
      throw new Error('private error');
    };
    function _initialize() {
      Object.defineProperty(this, _fail, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        async function () {
          try {
            await _classPrivateFieldLooseBase(this, _fail)[_fail]();
            return 'no error';
          } catch (e) {
            return e.message;
          }
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
  })();
  const foo = new Foo();
  expect(await foo.test()).toBe('private error');
};`,
  },
  {
    title: 'generator private methods > private generator method yields values',
    source: `() => {
        class Foo {
          *#gen() {
            yield 1;
            yield 2;
            yield 3;
          }
          test() {
            return [...this.#gen()];
          }
        }
        const foo = new Foo();
        expect(foo.test()).toEqual([1, 2, 3]);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _gen = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_gen');
    var _privateMethod = function* () {
      yield 1;
      yield 2;
      yield 3;
    };
    function _initialize() {
      Object.defineProperty(this, _gen, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return [..._classPrivateFieldLooseBase(this, _gen)[_gen]()];
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
  })();
  const foo = new Foo();
  expect(foo.test()).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'generator private methods > private async generator method',
    source: `async () => {
        class Foo {
          async *#gen() {
            yield await Promise.resolve(1);
            yield await Promise.resolve(2);
            yield await Promise.resolve(3);
          }
          async test() {
            const results = [];
            for await (const val of this.#gen()) {
              results.push(val);
            }
            return results;
          }
        }
        const foo = new Foo();
        expect(await foo.test()).toEqual([1, 2, 3]);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
async () => {
  let Foo = (() => {
    'use strict';
    var _gen = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_gen');
    var _privateMethod = async function* () {
      yield await Promise.resolve(1);
      yield await Promise.resolve(2);
      yield await Promise.resolve(3);
    };
    function _initialize() {
      Object.defineProperty(this, _gen, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        async function () {
          const results = [];
          for await (const val of _classPrivateFieldLooseBase(this, _gen)[_gen]()) {
            results.push(val);
          }
          return results;
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
  })();
  const foo = new Foo();
  expect(await foo.test()).toEqual([1, 2, 3]);
};`,
  },
  {
    title: 'generator private methods > private generator with return',
    source: `() => {
        class Foo {
          *#gen() {
            yield 'a';
            return 'done';
          }
          test() {
            const gen = this.#gen();
            const first = gen.next();
            const second = gen.next();
            return { first, second };
          }
        }
        const foo = new Foo();
        const result = foo.test();
        expect(result.first.value).toBe('a');
        expect(result.first.done).toBe(false);
        expect(result.second.value).toBe('done');
        expect(result.second.done).toBe(true);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _gen = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_gen');
    var _privateMethod = function* () {
      yield 'a';
      return 'done';
    };
    function _initialize() {
      Object.defineProperty(this, _gen, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          const gen = _classPrivateFieldLooseBase(this, _gen)[_gen]();
          const first = gen.next();
          const second = gen.next();
          return {
            first,
            second,
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
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  const result = foo.test();
  expect(result.first.value).toBe('a');
  expect(result.first.done).toBe(false);
  expect(result.second.value).toBe('done');
  expect(result.second.done).toBe(true);
};`,
  },
  {
    title: 'private accessors > private getter',
    source: `() => {
        class Foo {
          #x = 42;
          get #value() {
            return this.#x;
          }
          test() {
            return this.#value;
          }
        }
        const foo = new Foo();
        expect(foo.test()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_value');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    function _initialize() {
      Object.defineProperty(this, _value, {
        get: function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _x)[_x];
        },
      });
      Object.defineProperty(this, _x, {
        writable: true,
        value: 42,
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
          return _classPrivateFieldLooseBase(this, _value)[_value];
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
  })();
  const foo = new Foo();
  expect(foo.test()).toBe(42);
};`,
  },
  {
    title: 'private accessors > private setter',
    source: `() => {
        class Foo {
          #x = 0;
          set #value(v) {
            this.#x = v;
          }
          getValue() {
            return this.#x;
          }
          test(v) {
            this.#value = v;
          }
        }
        const foo = new Foo();
        foo.test(42);
        expect(foo.getValue()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_value');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    function _initialize() {
      Object.defineProperty(this, _value, {
        set: function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _x)[_x] = v;
        },
      });
      Object.defineProperty(this, _x, {
        writable: true,
        value: 0,
      });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'getValue', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _x)[_x];
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
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _value)[_value] = v;
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
  })();
  const foo = new Foo();
  foo.test(42);
  expect(foo.getValue()).toBe(42);
};`,
  },
  {
    title: 'private accessors > private getter and setter pair',
    source: `() => {
        class Foo {
          #x = 0;
          get #value() {
            return this.#x;
          }
          set #value(v) {
            this.#x = v * 2;
          }
          test() {
            this.#value = 21;
            return this.#value;
          }
        }
        const foo = new Foo();
        expect(foo.test()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_value');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    function _initialize() {
      Object.defineProperty(this, _value, {
        get: function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _x)[_x];
        },
        set: function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _x)[_x] = v * 2;
        },
      });
      Object.defineProperty(this, _x, {
        writable: true,
        value: 0,
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
          _classPrivateFieldLooseBase(this, _value)[_value] = 21;
          return _classPrivateFieldLooseBase(this, _value)[_value];
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
  })();
  const foo = new Foo();
  expect(foo.test()).toBe(42);
};`,
  },
  {
    title: 'private accessors > getter-only private accessor throws on set',
    source: `() => {
          expect(() => {
            class Foo {
              get #bar() {
                return 1;
              }
              constructor() {
                this.#bar = 2;
              }
            }
            new Foo();
          }).toThrow();
        }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  expect(() => {
    let Foo = (() => {
      'use strict';
      var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
      function _initialize() {
        Object.defineProperty(this, _bar, {
          get: function () {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
            return 1;
          },
        });
      }
      const Foo = function Foo() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize.call(this);
        _classPrivateFieldLooseBase(this, _bar)[_bar] = 2;
      };
      Object.defineProperty(Foo, 'prototype', { writable: false });
      return Foo;
    })();
    new Foo();
  }).toThrow();
};`,
  },
  {
    title: 'private accessors > setter-only private accessor throws on get',
    source: `() => {
          expect(() => {
            class Foo {
              set #bar(v) {}
              constructor() {
                const x = this.#bar;
              }
            }
            new Foo();
          }).toThrow();
        }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  expect(() => {
    let Foo = (() => {
      'use strict';
      var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
      function _initialize() {
        Object.defineProperty(this, _bar, {
          set: function (v) {
            if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          },
        });
      }
      const Foo = function Foo() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
        _initialize.call(this);
        const x = _classPrivateFieldLooseBase(this, _bar)[_bar];
      };
      Object.defineProperty(Foo, 'prototype', { writable: false });
      return Foo;
    })();
    new Foo();
  }).toThrow();
};`,
  },
  {
    title: 'private accessors > private accessor available during field initialization',
    source: `() => {
        class Foo {
          get #value() {
            return 42;
          }
          field = this.#value;
        }
        const foo = new Foo();
        expect(foo.field).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_value');
    function _initialize() {
      Object.defineProperty(this, _value, {
        get: function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return 42;
        },
      });
      this.field = _classPrivateFieldLooseBase(this, _value)[_value];
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  expect(foo.field).toBe(42);
};`,
  },
  {
    title: 'private accessors > private getter with computed value',
    source: `() => {
        class Rect {
          #w;
          #h;
          constructor(w, h) {
            this.#w = w;
            this.#h = h;
          }
          get #area() {
            return this.#w * this.#h;
          }
          getArea() {
            return this.#area;
          }
        }
        const r = new Rect(3, 4);
        expect(r.getArea()).toBe(12);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Rect = (() => {
    'use strict';
    var _h = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Rect_h');
    var _w = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Rect_w');
    var _area = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Rect_area');
    function _initialize() {
      Object.defineProperty(this, _area, {
        get: function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return (
            _classPrivateFieldLooseBase(this, _w)[_w] * _classPrivateFieldLooseBase(this, _h)[_h]
          );
        },
      });
      Object.defineProperty(this, _w, {
        writable: true,
        value: void 0,
      });
      Object.defineProperty(this, _h, {
        writable: true,
        value: void 0,
      });
    }
    const Rect = function Rect(w, h) {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
      _classPrivateFieldLooseBase(this, _w)[_w] = w;
      _classPrivateFieldLooseBase(this, _h)[_h] = h;
    };
    Object.defineProperty(Rect.prototype, 'getArea', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _area)[_area];
        },
        'name',
        {
          value: 'getArea',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Rect, 'prototype', { writable: false });
    return Rect;
  })();
  const r = new Rect(3, 4);
  expect(r.getArea()).toBe(12);
};`,
  },
  {
    title: 'private accessors > private accessor increment/decrement via getter+setter',
    source: `() => {
        class Counter {
          #x = 0;
          get #count() {
            return this.#x;
          }
          set #count(v) {
            this.#x = v;
          }
          inc() {
            this.#count++;
            return this.#count;
          }
          dec() {
            this.#count--;
            return this.#count;
          }
        }
        const c = new Counter();
        expect(c.inc()).toBe(1);
        expect(c.inc()).toBe(2);
        expect(c.dec()).toBe(1);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Counter = (() => {
    'use strict';
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Counter_x');
    var _count = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Counter_count');
    function _initialize() {
      Object.defineProperty(this, _count, {
        get: function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _x)[_x];
        },
        set: function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _x)[_x] = v;
        },
      });
      Object.defineProperty(this, _x, {
        writable: true,
        value: 0,
      });
    }
    const Counter = function Counter() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Counter.prototype, 'inc', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _count)[_count]++;
          return _classPrivateFieldLooseBase(this, _count)[_count];
        },
        'name',
        {
          value: 'inc',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Counter.prototype, 'dec', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _count)[_count]--;
          return _classPrivateFieldLooseBase(this, _count)[_count];
        },
        'name',
        {
          value: 'dec',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Counter, 'prototype', { writable: false });
    return Counter;
  })();
  const c = new Counter();
  expect(c.inc()).toBe(1);
  expect(c.inc()).toBe(2);
  expect(c.dec()).toBe(1);
};`,
  },
  {
    title: 'private static methods > basic static private method',
    source: `() => {
        class Foo {
          static #bar() {
            return 'bar';
          }
          static test() {
            return Foo.#bar();
          }
        }
        expect(Foo.test()).toBe('bar');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'bar';
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(Foo, _bar)[_bar]();
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
    Object.defineProperty(Foo, _bar, { value: _privateMethod });
    return Foo;
  })();
  expect(Foo.test()).toBe('bar');
};`,
  },
  {
    title: 'private static methods > static private method with class passed as argument',
    source: `() => {
        class Foo {
          static #bar() {
            return 'bar';
          }
          static extract(klass) {
            return klass.#bar();
          }
        }
        expect(Foo.extract(Foo)).toBe('bar');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'bar';
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'extract', {
      value: Object.defineProperty(
        function (klass) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(klass, _bar)[_bar]();
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
    Object.defineProperty(Foo, _bar, { value: _privateMethod });
    return Foo;
  })();
  expect(Foo.extract(Foo)).toBe('bar');
};`,
  },
  {
    title: 'private static methods > exfiltrated static private method has stable identity',
    source: `() => {
        class Foo {
          static #bar() {
            return 'bar';
          }
          static getBar() {
            return Foo.#bar;
          }
        }
        expect(Foo.getBar()).toBe(Foo.getBar());
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'bar';
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'getBar', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(Foo, _bar)[_bar];
        },
        'name',
        {
          value: 'getBar',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Foo, 'prototype', { writable: false });
    Object.defineProperty(Foo, _bar, { value: _privateMethod });
    return Foo;
  })();
  expect(Foo.getBar()).toBe(Foo.getBar());
};`,
  },
  {
    title: 'private static methods > multiple static private methods',
    source: `() => {
        class Foo {
          static #bar() {
            return 'bar';
          }
          static #baz() {
            return 'baz';
          }
          static test() {
            return Foo.#bar() + Foo.#baz();
          }
        }
        expect(Foo.test()).toBe('barbaz');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _baz = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_baz');
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod16 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'bar';
    };
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'baz';
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return (
            _classPrivateFieldLooseBase(Foo, _bar)[_bar]() +
            _classPrivateFieldLooseBase(Foo, _baz)[_baz]()
          );
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
    Object.defineProperty(Foo, _bar, { value: _privateMethod16 });
    Object.defineProperty(Foo, _baz, { value: _privateMethod });
    return Foo;
  })();
  expect(Foo.test()).toBe('barbaz');
};`,
  },
  {
    title: 'private static methods > static private method is read-only',
    source: `() => {
          expect(() => {
            class Foo {
              static #bar() {}
              static {
                Foo.#bar = 1;
              }
            }
          }).toThrow();
        }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  expect(() => {
    let Foo = (() => {
      'use strict';
      var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
      var _privateMethod = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      const Foo = function Foo() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(Foo, 'prototype', { writable: false });
      Object.defineProperty(Foo, _bar, { value: _privateMethod });
      (function () {
        _classPrivateFieldLooseBase(Foo, _bar)[_bar] = 1;
      }).call(Foo);
      return Foo;
    })();
  }).toThrow();
};`,
  },
  {
    title: 'private static methods > static private method compound assignment throws',
    source: `() => {
          expect(() => {
            class Foo {
              static #bar() {}
              static {
                Foo.#bar += 1;
              }
            }
          }).toThrow();
        }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  expect(() => {
    let Foo = (() => {
      'use strict';
      var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
      var _privateMethod = function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      };
      const Foo = function Foo() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(Foo, 'prototype', { writable: false });
      Object.defineProperty(Foo, _bar, { value: _privateMethod });
      (function () {
        _classPrivateFieldLooseBase(Foo, _bar)[_bar] += 1;
      }).call(Foo);
      return Foo;
    })();
  }).toThrow();
};`,
  },
  {
    title: 'private static methods > super access from static private method',
    source: `() => {
        class Base {
          static greet() {
            return 'hello';
          }
        }
        class Derived extends Base {
          static #bar() {
            return super.greet();
          }
          static test() {
            return Derived.#bar();
          }
        }
        expect(Derived.test()).toBe('hello');
      }`,
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
() => {
  class Base {
    static greet() {
      return 'hello';
    }
  }
  let Derived = (__nox_super_114_297 => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Derived_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _get(Object.getPrototypeOf(Derived), 'greet', this).call(this);
    };
    const Derived = function Derived() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(Object.getPrototypeOf(Derived), arguments, new.target || Derived);
      return _this;
    };
    if (__nox_super_114_297 !== null && typeof __nox_super_114_297 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    Derived.prototype = Object.create(__nox_super_114_297 && __nox_super_114_297.prototype, {
      constructor: {
        value: Derived,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(Derived, __nox_super_114_297);
    else Derived.__proto__ = __nox_super_114_297;
    Object.defineProperty(Derived, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(Derived, _bar)[_bar]();
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
    Object.defineProperty(Derived, 'prototype', { writable: false });
    Object.defineProperty(Derived, _bar, { value: _privateMethod });
    return Derived;
  })(Base);
  expect(Derived.test()).toBe('hello');
};`,
  },
  {
    title: 'private static methods > this in static private method refers to class',
    source: `() => {
        class Foo {
          static val = 42;
          static #bar() {
            return this.val;
          }
          static test() {
            return this.#bar();
          }
        }
        expect(Foo.test()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return this.val;
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
    Object.defineProperty(Foo, _bar, { value: _privateMethod });
    Foo.val = 42;
    return Foo;
  })();
  expect(Foo.test()).toBe(42);
};`,
  },
  {
    title: 'private static methods > static private method as tagged template',
    source: `() => {
        class Foo {
          static #tag(strings, ...values) {
            return { strings: Array.from(strings), values };
          }
          static test() {
            return Foo.#tag\`hi \${'there'}\`;
          }
        }
        const result = Foo.test();
        expect(result.strings).toEqual(['hi ', '']);
        expect(result.values).toEqual(['there']);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _tag = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_tag');
    var _privateMethod = function (strings, ...values) {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return {
        strings: Array.from(strings),
        values,
      };
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(Foo, _tag)[_tag]\`hi \${'there'}\`;
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
    Object.defineProperty(Foo, _tag, { value: _privateMethod });
    return Foo;
  })();
  const result = Foo.test();
  expect(result.strings).toEqual(['hi ', '']);
  expect(result.values).toEqual(['there']);
};`,
  },
  {
    title: 'private static methods > static private generator method',
    source: `() => {
        class Foo {
          static *#gen() {
            yield 10;
            yield 20;
          }
          static test() {
            return [...Foo.#gen()];
          }
        }
        expect(Foo.test()).toEqual([10, 20]);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _gen = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_gen');
    var _privateMethod = function* () {
      yield 10;
      yield 20;
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return [..._classPrivateFieldLooseBase(Foo, _gen)[_gen]()];
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
    Object.defineProperty(Foo, _gen, { value: _privateMethod });
    return Foo;
  })();
  expect(Foo.test()).toEqual([10, 20]);
};`,
  },
  {
    title: 'private static methods > static private async method',
    source: `async () => {
        class Foo {
          static async #compute(x) {
            return await Promise.resolve(x * 2);
          }
          static async test() {
            return await Foo.#compute(21);
          }
        }
        expect(await Foo.test()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
async () => {
  let Foo = (() => {
    'use strict';
    var _compute = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_compute');
    var _privateMethod = async function (x) {
      return await Promise.resolve(x * 2);
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        async function () {
          return await _classPrivateFieldLooseBase(Foo, _compute)[_compute](21);
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
    Object.defineProperty(Foo, _compute, { value: _privateMethod });
    return Foo;
  })();
  expect(await Foo.test()).toBe(42);
};`,
  },
  {
    title: 'private static accessors > static private getter',
    source: `() => {
        class Foo {
          static #x = 42;
          static get #value() {
            return Foo.#x;
          }
          static test() {
            return Foo.#value;
          }
        }
        expect(Foo.test()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_value');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(Foo, _value)[_value];
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
    Object.defineProperty(Foo, _value, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Foo, _x)[_x];
      },
    });
    Object.defineProperty(Foo, _x, {
      writable: true,
      value: 42,
    });
    return Foo;
  })();
  expect(Foo.test()).toBe(42);
};`,
  },
  {
    title: 'private static accessors > static private setter',
    source: `() => {
        class Foo {
          static #x = 0;
          static set #value(v) {
            Foo.#x = v;
          }
          static get() {
            return Foo.#x;
          }
          static test(v) {
            Foo.#value = v;
          }
        }
        Foo.test(42);
        expect(Foo.get()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_value');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'get', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(Foo, _x)[_x];
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
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(Foo, _value)[_value] = v;
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
    Object.defineProperty(Foo, _value, {
      set: function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Foo, _x)[_x] = v;
      },
    });
    Object.defineProperty(Foo, _x, {
      writable: true,
      value: 0,
    });
    return Foo;
  })();
  Foo.test(42);
  expect(Foo.get()).toBe(42);
};`,
  },
  {
    title: 'private static accessors > static private getter and setter pair',
    source: `() => {
        class Foo {
          static #x = 0;
          static get #value() {
            return Foo.#x;
          }
          static set #value(v) {
            Foo.#x = v * 2;
          }
          static test() {
            Foo.#value = 21;
            return Foo.#value;
          }
        }
        expect(Foo.test()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_value');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(Foo, _value)[_value] = 21;
          return _classPrivateFieldLooseBase(Foo, _value)[_value];
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
    Object.defineProperty(Foo, _value, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Foo, _x)[_x];
      },
      set: function (v) {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        _classPrivateFieldLooseBase(Foo, _x)[_x] = v * 2;
      },
    });
    Object.defineProperty(Foo, _x, {
      writable: true,
      value: 0,
    });
    return Foo;
  })();
  expect(Foo.test()).toBe(42);
};`,
  },
  {
    title: 'private static accessors > static getter-only throws on set',
    source: `() => {
          expect(() => {
            class Foo {
              static get #bar() {
                return 1;
              }
              static {
                Foo.#bar = 2;
              }
            }
          }).toThrow();
        }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  expect(() => {
    let Foo = (() => {
      'use strict';
      var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
      const Foo = function Foo() {
        if (!new.target) throw new TypeError('Cannot call a class as a function');
      };
      Object.defineProperty(Foo, 'prototype', { writable: false });
      Object.defineProperty(Foo, _bar, {
        get: function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return 1;
        },
      });
      (function () {
        _classPrivateFieldLooseBase(Foo, _bar)[_bar] = 2;
      }).call(Foo);
      return Foo;
    })();
  }).toThrow();
};`,
  },
  {
    title: 'inheritance and isolation > private methods are per-class (not inherited)',
    source: `() => {
        class Base {
          #greet() {
            return 'base';
          }
          test() {
            return this.#greet();
          }
        }
        class Child extends Base {
          // Child does NOT have access to Base's #greet
        }
        const child = new Child();
        // inherited public method still works because it calls #greet on Base
        expect(child.test()).toBe('base');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Base = (() => {
    'use strict';
    var _greet = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Base_greet');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'base';
    };
    function _initialize() {
      Object.defineProperty(this, _greet, { value: _privateMethod });
    }
    const Base = function Base() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Base.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _greet)[_greet]();
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
  class Child extends Base {}
  const child = new Child();
  // inherited public method still works because it calls #greet on Base
  expect(child.test()).toBe('base');
};`,
  },
  {
    title: 'inheritance and isolation > subclass can define same-named private method',
    source: `() => {
        class Base {
          #method() {
            return 'base';
          }
          baseTest() {
            return this.#method();
          }
        }
        class Child extends Base {
          #method() {
            return 'child';
          }
          childTest() {
            return this.#method();
          }
        }
        const c = new Child();
        expect(c.baseTest()).toBe('base');
        expect(c.childTest()).toBe('child');
      }`,
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
() => {
  let Base = (() => {
    'use strict';
    var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Base_method');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'base';
    };
    function _initialize() {
      Object.defineProperty(this, _method, { value: _privateMethod });
    }
    const Base = function Base() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Base.prototype, 'baseTest', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _method)[_method]();
        },
        'name',
        {
          value: 'baseTest',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Base, 'prototype', { writable: false });
    return Base;
  })();
  let Child = (__nox_super_178_347 => {
    'use strict';
    var _method19 =
      _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Child_method');
    var _privateMethod20 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'child';
    };
    function _initialize21() {
      Object.defineProperty(this, _method19, { value: _privateMethod20 });
    }
    const Child = function Child() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      var _this = _construct(Object.getPrototypeOf(Child), arguments, new.target || Child);
      (function () {
        _initialize21.call(this);
      }).call(_this);
      return _this;
    };
    if (__nox_super_178_347 !== null && typeof __nox_super_178_347 !== 'function')
      throw new TypeError('Super expression must either be null or a function');
    Child.prototype = Object.create(__nox_super_178_347 && __nox_super_178_347.prototype, {
      constructor: {
        value: Child,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) Object.setPrototypeOf(Child, __nox_super_178_347);
    else Child.__proto__ = __nox_super_178_347;
    Object.defineProperty(Child.prototype, 'childTest', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _method19)[_method19]();
        },
        'name',
        {
          value: 'childTest',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Child, 'prototype', { writable: false });
    return Child;
  })(Base);
  const c = new Child();
  expect(c.baseTest()).toBe('base');
  expect(c.childTest()).toBe('child');
};`,
  },
  {
    title: 'inheritance and isolation > private method access on wrong class instance throws',
    source: `() => {
        class A {
          #foo() {
            return 'a';
          }
          test(obj) {
            return obj.#foo();
          }
        }
        class B {}
        const a = new A();
        const b = new B();
        expect(() => a.test(b)).toThrow();
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let A = (() => {
    'use strict';
    var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_foo');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'a';
    };
    function _initialize() {
      Object.defineProperty(this, _foo, { value: _privateMethod });
    }
    const A = function A() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(A.prototype, 'test', {
      value: Object.defineProperty(
        function (obj) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(obj, _foo)[_foo]();
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
  })();
  class B {}
  const a = new A();
  const b = new B();
  expect(() => a.test(b)).toThrow();
};`,
  },
  {
    title:
      'inheritance and isolation > different classes with same private method name are independent',
    source: `() => {
        class A {
          #x() {
            return 'A';
          }
          test() {
            return this.#x();
          }
        }
        class B {
          #x() {
            return 'B';
          }
          test() {
            return this.#x();
          }
        }
        expect(new A().test()).toBe('A');
        expect(new B().test()).toBe('B');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let A = (() => {
    'use strict';
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_A_x');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'A';
    };
    function _initialize() {
      Object.defineProperty(this, _x, { value: _privateMethod });
    }
    const A = function A() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(A.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _x)[_x]();
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
  })();
  let B = (() => {
    'use strict';
    var _x18 = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_B_x');
    var _privateMethod19 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'B';
    };
    function _initialize20() {
      Object.defineProperty(this, _x18, { value: _privateMethod19 });
    }
    const B = function B() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize20.call(this);
    };
    Object.defineProperty(B.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _x18)[_x18]();
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
    Object.defineProperty(B, 'prototype', { writable: false });
    return B;
  })();
  expect(new A().test()).toBe('A');
  expect(new B().test()).toBe('B');
};`,
  },
  {
    title: 'private fields interaction > private method accessing private field',
    source: `() => {
        class Foo {
          #x = 10;
          #double() {
            return this.#x * 2;
          }
          test() {
            return this.#double();
          }
        }
        expect(new Foo().test()).toBe(20);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _double = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_double');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _x)[_x] * 2;
    };
    function _initialize() {
      Object.defineProperty(this, _double, { value: _privateMethod });
      Object.defineProperty(this, _x, {
        writable: true,
        value: 10,
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
          return _classPrivateFieldLooseBase(this, _double)[_double]();
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
  })();
  expect(new Foo().test()).toBe(20);
};`,
  },
  {
    title: 'private fields interaction > private method mutating private field',
    source: `() => {
        class Counter {
          #count = 0;
          #increment() {
            this.#count++;
          }
          inc() {
            this.#increment();
            return this.#count;
          }
        }
        const c = new Counter();
        expect(c.inc()).toBe(1);
        expect(c.inc()).toBe(2);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Counter = (() => {
    'use strict';
    var _increment = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
      '__private_Counter_increment',
    );
    var _count = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Counter_count');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      _classPrivateFieldLooseBase(this, _count)[_count]++;
    };
    function _initialize() {
      Object.defineProperty(this, _increment, { value: _privateMethod });
      Object.defineProperty(this, _count, {
        writable: true,
        value: 0,
      });
    }
    const Counter = function Counter() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Counter.prototype, 'inc', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _increment)[_increment]();
          return _classPrivateFieldLooseBase(this, _count)[_count];
        },
        'name',
        {
          value: 'inc',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Counter, 'prototype', { writable: false });
    return Counter;
  })();
  const c = new Counter();
  expect(c.inc()).toBe(1);
  expect(c.inc()).toBe(2);
};`,
  },
  {
    title: 'private fields interaction > private setter validating before setting private field',
    source: `() => {
        class Temp {
          #celsius = 0;
          set #temperature(v) {
            if (v < -273.15) throw new Error('below absolute zero');
            this.#celsius = v;
          }
          get #temperature() {
            return this.#celsius;
          }
          setTemp(v) {
            this.#temperature = v;
          }
          getTemp() {
            return this.#temperature;
          }
        }
        const t = new Temp();
        t.setTemp(100);
        expect(t.getTemp()).toBe(100);
        expect(() => t.setTemp(-300)).toThrow();
        // Value unchanged after rejected set
        expect(t.getTemp()).toBe(100);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Temp = (() => {
    'use strict';
    var _temperature = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey(
      '__private_Temp_temperature',
    );
    var _celsius = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Temp_celsius');
    function _initialize() {
      Object.defineProperty(this, _temperature, {
        get: function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _celsius)[_celsius];
        },
        set: function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          if (v < -273.15) throw new Error('below absolute zero');
          _classPrivateFieldLooseBase(this, _celsius)[_celsius] = v;
        },
      });
      Object.defineProperty(this, _celsius, {
        writable: true,
        value: 0,
      });
    }
    const Temp = function Temp() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Temp.prototype, 'setTemp', {
      value: Object.defineProperty(
        function (v) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          _classPrivateFieldLooseBase(this, _temperature)[_temperature] = v;
        },
        'name',
        {
          value: 'setTemp',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Temp.prototype, 'getTemp', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _temperature)[_temperature];
        },
        'name',
        {
          value: 'getTemp',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Temp, 'prototype', { writable: false });
    return Temp;
  })();
  const t = new Temp();
  t.setTemp(100);
  expect(t.getTemp()).toBe(100);
  expect(() => t.setTemp(-300)).toThrow();
  // Value unchanged after rejected set
  expect(t.getTemp()).toBe(100);
};`,
  },
  {
    title: 'edge cases > private method in expression class',
    source: `() => {
        const Foo = class {
          #bar() {
            return 'bar';
          }
          test() {
            return this.#bar();
          }
        };
        expect(new Foo().test()).toBe('bar');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  const Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private__Class_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'bar';
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
    }
    const _Class = function _Class() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(_Class, 'name', {
      value: 'Foo',
      configurable: true,
    });
    Object.defineProperty(_Class.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
  })();
  expect(new Foo().test()).toBe('bar');
};`,
  },
  {
    title: 'edge cases > private method in nested class',
    source: `() => {
        class Outer {
          test() {
            class Inner {
              #foo() {
                return 'inner';
              }
              test() {
                return this.#foo();
              }
            }
            return new Inner().test();
          }
        }
        expect(new Outer().test()).toBe('inner');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  class Outer {
    test() {
      let Inner = (() => {
        'use strict';
        var _foo = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Inner_foo');
        var _privateMethod = function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return 'inner';
        };
        function _initialize() {
          Object.defineProperty(this, _foo, { value: _privateMethod });
        }
        const Inner = function Inner() {
          if (!new.target) throw new TypeError('Cannot call a class as a function');
          _initialize.call(this);
        };
        Object.defineProperty(Inner.prototype, 'test', {
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
        Object.defineProperty(Inner, 'prototype', { writable: false });
        return Inner;
      })();
      return new Inner().test();
    }
  }
  expect(new Outer().test()).toBe('inner');
};`,
  },
  {
    title: 'edge cases > private method with symbol property on instance',
    source: `() => {
        const sym = Symbol('test');
        class Foo {
          [sym] = 'symbol-val';
          #bar() {
            return this[sym];
          }
          test() {
            return this.#bar();
          }
        }
        expect(new Foo().test()).toBe('symbol-val');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
() => {
  const sym = Symbol('test');
  let Foo = (_key => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return this[sym];
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
      this[_key] = 'symbol-val';
    }
    _key = _key(_bar);
    _key = _classKey(_key);
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
  })(_bar => sym);
  expect(new Foo().test()).toBe('symbol-val');
};`,
  },
  {
    title: 'edge cases > private method with computed public method',
    source: `() => {
        const key = 'myMethod';
        class Foo {
          #priv() {
            return 'private';
          }
          [key]() {
            return this.#priv();
          }
        }
        expect(new Foo().myMethod()).toBe('private');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _classKey2 = { toPropertyKey: require('@babel/runtime/helpers/toPropertyKey') },
  _classKey = _classKey2.toPropertyKey;
() => {
  const key = 'myMethod';
  let Foo = (_key => {
    'use strict';
    var _priv = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_priv');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'private';
    };
    function _initialize() {
      Object.defineProperty(this, _priv, { value: _privateMethod });
    }
    _key = _key(_priv);
    _key = _classKey(_key);
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, _key, {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _priv)[_priv]();
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
  })(_priv => key);
  expect(new Foo().myMethod()).toBe('private');
};`,
  },
  {
    title:
      'edge cases > multiple instances have independent private state but shared method identity',
    source: `() => {
        class Foo {
          #val;
          constructor(val) {
            this.#val = val;
          }
          #getVal() {
            return this.#val;
          }
          test() {
            return this.#getVal();
          }
          getMethod() {
            return this.#getVal;
          }
        }
        const a = new Foo(1);
        const b = new Foo(2);
        expect(a.test()).toBe(1);
        expect(b.test()).toBe(2);
        // Private methods share identity across instances
        expect(a.getMethod()).toBe(b.getMethod());
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _getVal = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_getVal');
    var _val = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_val');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _val)[_val];
    };
    function _initialize() {
      Object.defineProperty(this, _getVal, { value: _privateMethod });
      Object.defineProperty(this, _val, {
        writable: true,
        value: void 0,
      });
    }
    const Foo = function Foo(val) {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
      _classPrivateFieldLooseBase(this, _val)[_val] = val;
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _getVal)[_getVal]();
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
    Object.defineProperty(Foo.prototype, 'getMethod', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _getVal)[_getVal];
        },
        'name',
        {
          value: 'getMethod',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const a = new Foo(1);
  const b = new Foo(2);
  expect(a.test()).toBe(1);
  expect(b.test()).toBe(2);
  // Private methods share identity across instances
  expect(a.getMethod()).toBe(b.getMethod());
};`,
  },
  {
    title: 'edge cases > private method in class with constructor returning different object',
    source: `() => {
        class Foo {
          #x = 10;
          #bar() {
            return this.#x;
          }
          test() {
            return this.#bar();
          }
        }
        // Normal instance works
        expect(new Foo().test()).toBe(10);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod16 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _x)[_x];
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod16 });
      Object.defineProperty(this, _x, {
        writable: true,
        value: 10,
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
          return _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
  })();
  // Normal instance works
  expect(new Foo().test()).toBe(10);
};`,
  },
  {
    title: 'edge cases > private static method not accessible on instances',
    source: `() => {
        class Foo {
          static #bar() {
            return 42;
          }
          static test() {
            return Foo.#bar();
          }
          instanceTest() {
            // Can't access static private from instance
            return Foo.test();
          }
        }
        expect(new Foo().instanceTest()).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 42;
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(Foo, _bar)[_bar]();
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
    Object.defineProperty(Foo.prototype, 'instanceTest', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          // Can't access static private from instance
          return Foo.test();
        },
        'name',
        {
          value: 'instanceTest',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Foo, 'prototype', { writable: false });
    Object.defineProperty(Foo, _bar, { value: _privateMethod });
    return Foo;
  })();
  expect(new Foo().instanceTest()).toBe(42);
};`,
  },
  {
    title: 'edge cases > toString does not reveal private method names',
    source: `() => {
        class Foo {
          #secret() {
            return 42;
          }
          test() {
            return this.#secret();
          }
        }
        const foo = new Foo();
        const keys = Object.getOwnPropertyNames(foo);
        const hasPrivate = keys.some((k) => k.includes('secret'));
        expect(hasPrivate).toBe(false);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _secret = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_secret');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 42;
    };
    function _initialize() {
      Object.defineProperty(this, _secret, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _secret)[_secret]();
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
  })();
  const foo = new Foo();
  const keys = Object.getOwnPropertyNames(foo);
  const hasPrivate = keys.some(k => k.includes('secret'));
  expect(hasPrivate).toBe(false);
};`,
  },
  {
    title: 'edge cases > for-in does not enumerate private methods',
    source: `() => {
        class Foo {
          #secret() {}
          pub = 1;
        }
        const foo = new Foo();
        const keys = [];
        for (const k in foo) {
          keys.push(k);
        }
        // In loose mode, the transformed key is non-enumerable.
        // With native private methods, the key wouldn't exist at all.
        // Either way, no key named '#secret' is enumerable.
        expect(keys.indexOf('#secret')).toBe(-1);
        expect(keys.indexOf('pub') >= 0).toBe(true);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _secret = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_secret');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    function _initialize() {
      Object.defineProperty(this, _secret, { value: _privateMethod });
      this.pub = 1;
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  const keys = [];
  for (const k in foo) {
    keys.push(k);
  }
  // In loose mode, the transformed key is non-enumerable.
  // With native private methods, the key wouldn't exist at all.
  // Either way, no key named '#secret' is enumerable.
  expect(keys.indexOf('#secret')).toBe(-1);
  expect(keys.indexOf('pub') >= 0).toBe(true);
};`,
  },
  {
    title: 'edge cases > JSON.stringify only includes public properties',
    source: `() => {
        class Foo {
          #method() {
            return 42;
          }
          x = 1;
        }
        const foo = new Foo();
        const parsed = JSON.parse(JSON.stringify(foo));
        expect(parsed.x).toBe(1);
        // Private method storage (loose or native) should not appear
        var keyCount = Object.keys(parsed).length;
        expect(keyCount).toBe(1);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_method');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 42;
    };
    function _initialize() {
      Object.defineProperty(this, _method, { value: _privateMethod });
      this.x = 1;
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  const parsed = JSON.parse(JSON.stringify(foo));
  expect(parsed.x).toBe(1);
  // Private method storage (loose or native) should not appear
  var keyCount = Object.keys(parsed).length;
  expect(keyCount).toBe(1);
};`,
  },
  {
    title: 'edge cases > Object.keys does not include private methods',
    source: `() => {
        class Foo {
          #method() {}
          x = 1;
        }
        const keys = Object.keys(new Foo());
        expect(keys.indexOf('x') >= 0).toBe(true);
        expect(keys.length).toBe(1);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _method = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_method');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    function _initialize() {
      Object.defineProperty(this, _method, { value: _privateMethod });
      this.x = 1;
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const keys = Object.keys(new Foo());
  expect(keys.indexOf('x') >= 0).toBe(true);
  expect(keys.length).toBe(1);
};`,
  },
  {
    title: 'edge cases > typeof private method is function',
    source: `() => {
        class Foo {
          #bar() {}
          test() {
            return typeof this.#bar;
          }
        }
        expect(new Foo().test()).toBe('function');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return typeof _classPrivateFieldLooseBase(this, _bar)[_bar];
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
  })();
  expect(new Foo().test()).toBe('function');
};`,
  },
  {
    title: 'edge cases > constructor returning different object loses private brand',
    source: `() => {
        class Foo {
          #x = 10;
          #bar() {
            return this.#x;
          }
          constructor(override) {
            if (override) return override;
          }
          test() {
            return this.#bar();
          }
        }
        // Normal construction installs brand
        expect(new Foo().test()).toBe(10);
        // Overridden constructor returns a plain object without the brand
        const plain = {};
        const result = new Foo(plain);
        expect(result).toBe(plain);
        expect(result.test).toBeUndefined();
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod19 = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _x)[_x];
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod19 });
      Object.defineProperty(this, _x, {
        writable: true,
        value: 10,
      });
    }
    const Foo = function Foo(override) {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
      if (override) return override;
    };
    Object.defineProperty(Foo.prototype, 'test', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _bar)[_bar]();
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
  })();
  // Normal construction installs brand
  expect(new Foo().test()).toBe(10);
  // Overridden constructor returns a plain object without the brand
  const plain = {};
  const result = new Foo(plain);
  expect(result).toBe(plain);
  expect(result.test).toBeUndefined();
};`,
  },
  {
    title: 'edge cases > private method as detached callback loses this',
    source: `() => {
        class Foo {
          #val = 42;
          #getVal() {
            return this.#val;
          }
          getCallback() {
            // Wrapping in arrow preserves this
            return () => this.#getVal();
          }
          getDetached() {
            return this.#getVal;
          }
        }
        const foo = new Foo();
        // Arrow-wrapped callback works
        expect(foo.getCallback()()).toBe(42);
        // Detached loses this context — calling without a receiver
        const detached = foo.getDetached();
        expect(() => detached()).toThrow();
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let Foo = (() => {
    'use strict';
    var _getVal = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_getVal');
    var _val = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_val');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return _classPrivateFieldLooseBase(this, _val)[_val];
    };
    function _initialize() {
      Object.defineProperty(this, _getVal, { value: _privateMethod });
      Object.defineProperty(this, _val, {
        writable: true,
        value: 42,
      });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo.prototype, 'getCallback', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          // Wrapping in arrow preserves this
          return () => _classPrivateFieldLooseBase(this, _getVal)[_getVal]();
        },
        'name',
        {
          value: 'getCallback',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Foo.prototype, 'getDetached', {
      value: Object.defineProperty(
        function () {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return _classPrivateFieldLooseBase(this, _getVal)[_getVal];
        },
        'name',
        {
          value: 'getDetached',
          configurable: true,
        },
      ),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  const foo = new Foo();
  // Arrow-wrapped callback works
  expect(foo.getCallback()()).toBe(42);
  // Detached loses this context — calling without a receiver
  const detached = foo.getDetached();
  expect(() => detached()).toThrow();
};`,
  },
  {
    title: 'edge cases > private method with closure over constructor parameter',
    source: `() => {
        class Foo {
          #fn;
          constructor(multiplier) {
            this.#fn = (x) => x * multiplier;
          }
          test(x) {
            return this.#fn(x);
          }
        }
        expect(new Foo(3).test(7)).toBe(21);
      }`,
    output: `() => {
  class Foo {
    #fn;
    constructor(multiplier) {
      this.#fn = x => x * multiplier;
    }
    test(x) {
      return this.#fn(x);
    }
  }
  expect(new Foo(3).test(7)).toBe(21);
};`,
  },
  {
    title: 'static blocks > static block can access private static method',
    source: `() => {
        let captured;
        class Foo {
          static #bar() {
            return 'from static block';
          }
          static {
            captured = Foo.#bar();
          }
        }
        expect(captured).toBe('from static block');
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let captured;
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
      return 'from static block';
    };
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    Object.defineProperty(Foo, _bar, { value: _privateMethod });
    (function () {
      captured = _classPrivateFieldLooseBase(Foo, _bar)[_bar]();
    }).call(Foo);
    return Foo;
  })();
  expect(captured).toBe('from static block');
};`,
  },
  {
    title: 'static blocks > static block can access private static accessor',
    source: `() => {
        let captured;
        class Foo {
          static #x = 42;
          static get #value() {
            return Foo.#x;
          }
          static {
            captured = Foo.#value;
          }
        }
        expect(captured).toBe(42);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
() => {
  let captured;
  let Foo = (() => {
    'use strict';
    var _value = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_value');
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
    };
    Object.defineProperty(Foo, 'prototype', { writable: false });
    Object.defineProperty(Foo, _value, {
      get: function () {
        if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
        return _classPrivateFieldLooseBase(Foo, _x)[_x];
      },
    });
    Object.defineProperty(Foo, _x, {
      writable: true,
      value: 42,
    });
    (function () {
      captured = _classPrivateFieldLooseBase(Foo, _value)[_value];
    }).call(Foo);
    return Foo;
  })();
  expect(captured).toBe(42);
};`,
  },
  {
    title:
      'private-in checks (ergonomic brand checks) > #field in obj for instance with private method',
    source: `() => {
        class Foo {
          #bar() {}
          static check(obj) {
            return #bar in obj;
          }
        }
        expect(Foo.check(new Foo())).toBe(true);
        expect(Foo.check({})).toBe(false);
        // \`in\` operator throws TypeError for non-object right-hand side
        expect(() => Foo.check(42)).toThrow();
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
() => {
  let Foo = (() => {
    'use strict';
    var _bar = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_bar');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    function _initialize() {
      Object.defineProperty(this, _bar, { value: _privateMethod });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo, 'check', {
      value: Object.defineProperty(
        function (obj) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _bar);
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
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  expect(Foo.check(new Foo())).toBe(true);
  expect(Foo.check({})).toBe(false);
  // \`in\` operator throws TypeError for non-object right-hand side
  expect(() => Foo.check(42)).toThrow();
};`,
  },
  {
    title:
      'private-in checks (ergonomic brand checks) > #field in obj for instance with private field',
    source: `() => {
        class Foo {
          #x = 1;
          static check(obj) {
            return #x in obj;
          }
        }
        expect(Foo.check(new Foo())).toBe(true);
        expect(Foo.check({})).toBe(false);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
() => {
  let Foo = (() => {
    'use strict';
    var _x = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Foo_x');
    function _initialize() {
      Object.defineProperty(this, _x, {
        writable: true,
        value: 1,
      });
    }
    const Foo = function Foo() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Foo, 'check', {
      value: Object.defineProperty(
        function (obj) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _x);
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
    Object.defineProperty(Foo, 'prototype', { writable: false });
    return Foo;
  })();
  expect(Foo.check(new Foo())).toBe(true);
  expect(Foo.check({})).toBe(false);
};`,
  },
  {
    title: 'private-in checks (ergonomic brand checks) > #field in obj with inheritance',
    source: `() => {
        class Base {
          #secret() {}
          static check(obj) {
            return #secret in obj;
          }
        }
        class Child extends Base {}
        expect(Base.check(new Base())).toBe(true);
        expect(Base.check(new Child())).toBe(true);
        expect(Base.check({})).toBe(false);
      }`,
    output: `var _classPrivateFieldLooseBase2 = {
  classPrivateFieldLooseBase: require('@babel/runtime/helpers/classPrivateFieldLooseBase'),
  classPrivateFieldLooseKey: require('@babel/runtime/helpers/classPrivateFieldLooseKey'),
};
function _classPrivateFieldLooseBase(e, s, a) {
  return a && e == null ? e : _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(e, s);
}
var _checkInRHS2 = { checkInRHS: require('@babel/runtime/helpers/checkInRHS') },
  _checkInRHS = _checkInRHS2.checkInRHS;
() => {
  let Base = (() => {
    'use strict';
    var _secret = _classPrivateFieldLooseBase2.classPrivateFieldLooseKey('__private_Base_secret');
    var _privateMethod = function () {
      if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
    };
    function _initialize() {
      Object.defineProperty(this, _secret, { value: _privateMethod });
    }
    const Base = function Base() {
      if (!new.target) throw new TypeError('Cannot call a class as a function');
      _initialize.call(this);
    };
    Object.defineProperty(Base, 'check', {
      value: Object.defineProperty(
        function (obj) {
          if (new.target) throw new TypeError("Class methods cannot be invoked with 'new'");
          return Object.prototype.hasOwnProperty.call(_checkInRHS(obj), _secret);
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
    Object.defineProperty(Base, 'prototype', { writable: false });
    return Base;
  })();
  class Child extends Base {}
  expect(Base.check(new Base())).toBe(true);
  expect(Base.check(new Child())).toBe(true);
  expect(Base.check({})).toBe(false);
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
