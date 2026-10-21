import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'assumption ignoreFunctionLength true — basic (input)',
    source: `foo(async (x) => {});
foo(async ([x]) => {});
foo(async ({ x }) => {});

foo(async function (x) {});
foo(async function ([x]) {});
foo(async function ({ x }) {});

foo(async ([]) => {});
foo(async ({}) => {});

foo(async function ([]) {});
foo(async function ({}) {});

export default async ([...x]) => {};

`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
foo(
  (function () {
    var _ref = babelHelpers.asyncToGenerator(function* (x) {});
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })(),
);
foo(
  (function () {
    var _ref2 = babelHelpers.asyncToGenerator(function* ([x]) {});
    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  })(),
);
foo(
  (function () {
    var _ref3 = babelHelpers.asyncToGenerator(function* ({ x }) {});
    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  })(),
);
foo(
  /* @__PURE__ */ (function () {
    var _ref4 = babelHelpers.asyncToGenerator(function* (x) {});
    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  })(),
);
foo(
  /* @__PURE__ */ (function () {
    var _ref5 = babelHelpers.asyncToGenerator(function* ([x]) {});
    return function (_x5) {
      return _ref5.apply(this, arguments);
    };
  })(),
);
foo(
  /* @__PURE__ */ (function () {
    var _ref6 = babelHelpers.asyncToGenerator(function* ({ x }) {});
    return function (_x6) {
      return _ref6.apply(this, arguments);
    };
  })(),
);
foo(
  (function () {
    var _ref7 = babelHelpers.asyncToGenerator(function* ([]) {});
    return function (_x7) {
      return _ref7.apply(this, arguments);
    };
  })(),
);
foo(
  (function () {
    var _ref8 = babelHelpers.asyncToGenerator(function* ({}) {});
    return function (_x8) {
      return _ref8.apply(this, arguments);
    };
  })(),
);
foo(
  /* @__PURE__ */ (function () {
    var _ref9 = babelHelpers.asyncToGenerator(function* ([]) {});
    return function (_x9) {
      return _ref9.apply(this, arguments);
    };
  })(),
);
foo(
  /* @__PURE__ */ (function () {
    var _ref10 = babelHelpers.asyncToGenerator(function* ({}) {});
    return function (_x10) {
      return _ref10.apply(this, arguments);
    };
  })(),
);
export default (function () {
  var _ref11 = babelHelpers.asyncToGenerator(function* ([...x]) {});
  return function (_x11) {
    return _ref11.apply(this, arguments);
  };
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption ignoreFunctionLength true — export default function (input)',
    source: 'export default async function (x) {}',
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
export default function (_x) {
  return _ref.apply(this, arguments);
}
function _ref() {
  _ref = babelHelpers.asyncToGenerator(function* (x) {});
  return _ref.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption noNewArrows false — basic (exec)',
    source: '',
    filename: 'exec.js',
    output: '',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption noNewArrows false — basic (input)',
    source: `async () => 2;
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
babelHelpers.asyncToGenerator(function* () {
  return 2;
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'assumption noNewArrows false — bluebird (input)',
    source: '',
    filename: 'input.js',
    output: '',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — async arrow in method (input)',
    source: `let TestClass = {
  name: "John Doe",

  testMethodFailure() {
    return new Promise(async (resolve) => {
      console.log(this);
      setTimeout(resolve, 1000);
    });
  }
};
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
let TestClass = {
  name: 'John Doe',
  testMethodFailure() {
    var _this = this;
    return new Promise(
      (function () {
        var _ref = babelHelpers.asyncToGenerator(function* (resolve) {
          console.log(_this);
          setTimeout(resolve, 1e3);
        });
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })(),
    );
  },
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — async complex params destructuring (exec)',
    source: `(function () {
let r1 = false;
const p1 = (new class {
  async foo(a, { b }) { }
})
  .foo()
  .catch(e => {
    r1 = true;
  });

const r2 = [];
const p2 = (new class {
  async foo(a, { b }) {
    r2.push(a, b);
  }
})
  .foo(1, { b: 2 });

const r3 = [];
const p3 = (new class {
  async foo(a, b = (() => { throw new Error("required") })()) {
    r3.push(a, b);
  }
})
  .foo(1, 2);

const r4 = [];
const p4 = (new class {
  async foo(a, ...b) {
    r4.push(a, b);
  }
})
  .foo(1, 2);

const r5 = [];
const p5 = (new class {
  async foo(a, { b }) {
    noop(this, arguments);
    r5.push(a, b);
  }
})
  .foo(1, { b: 2 });

const r6 = [];
const p6 = (new class extends class { get c() { return "c"; } } {
  async foo(a, { b }) {
    r6.push(a, b, super.c);
  }
})
  .foo(1, { b: 2 });


return Promise.all([p1, p2, p3, p4, p5, p6]).then(() => {
  expect(r1).toBe(true);
  expect(r2).toEqual([1, 2]);
  expect(r3).toEqual([1, 2]);
  expect(r4).toEqual([1, [2]]);
  expect(r5).toEqual([1, 2]);
  expect(r6).toEqual([1, 2, "c"]);
});

function noop() { }

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
(function () {
  let r1 = false;
  const p1 = new (class {
    foo(_x, _x2) {
      return babelHelpers.asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);
    }
  })()
    .foo()
    .catch(e => {
      r1 = true;
    });
  const r2 = [];
  const p2 = new (class {
    foo(_x3, _x4) {
      return babelHelpers
        .asyncToGenerator(function* (a, { b }) {
          r2.push(a, b);
        })
        .apply(this, arguments);
    }
  })().foo(1, { b: 2 });
  const r3 = [];
  const p3 = new (class {
    foo(_x5) {
      return babelHelpers
        .asyncToGenerator(function* (
          a,
          b = (() => {
            throw new Error('required');
          })(),
        ) {
          r3.push(a, b);
        })
        .apply(this, arguments);
    }
  })().foo(1, 2);
  const r4 = [];
  const p4 = new (class {
    foo(_x6) {
      return babelHelpers
        .asyncToGenerator(function* (a, ...b) {
          r4.push(a, b);
        })
        .apply(this, arguments);
    }
  })().foo(1, 2);
  const r5 = [];
  const p5 = new (class {
    foo(_x7, _x8) {
      var _arguments = arguments,
        _this = this;
      return babelHelpers
        .asyncToGenerator(function* (a, { b }) {
          noop(_this, _arguments);
          r5.push(a, b);
        })
        .apply(this, arguments);
    }
  })().foo(1, { b: 2 });
  const r6 = [];
  const p6 = new (class extends class {
    get c() {
      return 'c';
    }
  } {
    foo(_x9, _x10) {
      var _superprop_getC = () => super.c;
      return babelHelpers
        .asyncToGenerator(function* (a, { b }) {
          r6.push(a, b, _superprop_getC());
        })
        .apply(this, arguments);
    }
  })().foo(1, { b: 2 });
  return Promise.all([p1, p2, p3, p4, p5, p6]).then(() => {
    expect(r1).toBe(true);
    expect(r2).toEqual([1, 2]);
    expect(r3).toEqual([1, 2]);
    expect(r4).toEqual([1, [2]]);
    expect(r5).toEqual([1, 2]);
    expect(r6).toEqual([1, 2, 'c']);
  });
  function noop() {}
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — async complex params destructuring (input)',
    source: `(new class {
  async foo(a, { b }) { }
})
  .foo()
  .catch(e => {
    console.log("caught");
  });

(new class {
  async foo(a, { b }) {
    console.log(a, b);
  }
})
  .foo(1, { b: 2 });

(new class {
  async foo(a, b = (() => { throw new Error("required") })()) {
    console.log(a, b);
  }
})
  .foo(1, { b: 2 });

(new class {
  async foo(a, ...b) {
    console.log(a, b);
  }
})
  .foo(1, 2);

(new class {
  async foo(a, { b }) {
    console.log(this, arguments);
  }
})
  .foo(1, { b: 2 });


(new class extends class { get c() { return "c"; } } {
  async foo(a, { b }) {
    console.log(super.c);
  }
})
  .foo(1, { b: 2 });
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
new (class {
  foo(_x, _x2) {
    return babelHelpers.asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);
  }
})()
  .foo()
  .catch(e => {
    console.log('caught');
  });
new (class {
  foo(_x3, _x4) {
    return babelHelpers
      .asyncToGenerator(function* (a, { b }) {
        console.log(a, b);
      })
      .apply(this, arguments);
  }
})().foo(1, { b: 2 });
new (class {
  foo(_x5) {
    return babelHelpers
      .asyncToGenerator(function* (
        a,
        b = (() => {
          throw new Error('required');
        })(),
      ) {
        console.log(a, b);
      })
      .apply(this, arguments);
  }
})().foo(1, { b: 2 });
new (class {
  foo(_x6) {
    return babelHelpers
      .asyncToGenerator(function* (a, ...b) {
        console.log(a, b);
      })
      .apply(this, arguments);
  }
})().foo(1, 2);
new (class {
  foo(_x7, _x8) {
    var _arguments = arguments,
      _this = this;
    return babelHelpers
      .asyncToGenerator(function* (a, { b }) {
        console.log(_this, _arguments);
      })
      .apply(this, arguments);
  }
})().foo(1, { b: 2 });
new (class extends class {
  get c() {
    return 'c';
  }
} {
  foo(_x9, _x10) {
    var _superprop_getC = () => super.c;
    return babelHelpers
      .asyncToGenerator(function* (a, { b }) {
        console.log(_superprop_getC());
      })
      .apply(this, arguments);
  }
})().foo(1, { b: 2 });`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — async complex params (input)',
    source: `(new class {
  async foo(a, { b }) { }
})
  .foo()
  .catch(e => {
    console.log("caught");
  });

(new class {
  async foo(a, { b }) {
    console.log(a, b);
  }
})
  .foo(1, { b: 2 });

(new class {
  async foo(a, b = (() => { throw new Error("required") })()) {
    console.log(a, b);
  }
})
  .foo(1, 2);

(new class {
  async foo(a, ...b) {
    console.log(a, b);
  }
})
  .foo(1, 2);

(new class {
  async foo(a, { b }) {
    console.log(this, arguments);
  }
})
  .foo(1, { b: 2 });


(new class extends class { get c() { return "c"; } } {
  async foo(a, { b }) {
    console.log(super.c);
  }
})
  .foo(1, { b: 2 });
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
new (class {
  foo(_x, _x2) {
    return babelHelpers.asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);
  }
})()
  .foo()
  .catch(e => {
    console.log('caught');
  });
new (class {
  foo(_x3, _x4) {
    return babelHelpers
      .asyncToGenerator(function* (a, { b }) {
        console.log(a, b);
      })
      .apply(this, arguments);
  }
})().foo(1, { b: 2 });
new (class {
  foo(_x5) {
    return babelHelpers
      .asyncToGenerator(function* (
        a,
        b = (() => {
          throw new Error('required');
        })(),
      ) {
        console.log(a, b);
      })
      .apply(this, arguments);
  }
})().foo(1, 2);
new (class {
  foo(_x6) {
    return babelHelpers
      .asyncToGenerator(function* (a, ...b) {
        console.log(a, b);
      })
      .apply(this, arguments);
  }
})().foo(1, 2);
new (class {
  foo(_x7, _x8) {
    var _arguments = arguments,
      _this = this;
    return babelHelpers
      .asyncToGenerator(function* (a, { b }) {
        console.log(_this, _arguments);
      })
      .apply(this, arguments);
  }
})().foo(1, { b: 2 });
new (class extends class {
  get c() {
    return 'c';
  }
} {
  foo(_x9, _x10) {
    var _superprop_getC = () => super.c;
    return babelHelpers
      .asyncToGenerator(function* (a, { b }) {
        console.log(_superprop_getC());
      })
      .apply(this, arguments);
  }
})().foo(1, { b: 2 });`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — async default arguments (input)',
    source: `function mandatory(paramName) {
  throw new Error(\`Missing parameter: \${paramName}\`);
}

async function foo({ a, b = mandatory("b") }) {
  return Promise.resolve(b);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function mandatory(paramName) {
  throw new Error(\`Missing parameter: \${paramName}\`);
}
function foo(_x) {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* ({ a, b = mandatory('b') }) {
    return Promise.resolve(b);
  });
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — async iife apply call no pure (input)',
    source: `(async function() {
})();

(async function() {
}).bind(this)();

(async function() {
}).call();

(async function() {
}).apply();

(async function() {
}).test();
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
babelHelpers.asyncToGenerator(function* () {})();
babelHelpers.asyncToGenerator(function* () {}).bind(this)();
babelHelpers.asyncToGenerator(function* () {}).call();
babelHelpers.asyncToGenerator(function* () {}).apply();
babelHelpers.asyncToGenerator(function* () {}).test();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — async iife with regenerator spec (input)',
    source: `(async function() { await 'ok' })();
(async () => { await 'ok' })();
(async function notIIFE() { await 'ok' });
(async () => { await 'not iife' });
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
babelHelpers.asyncToGenerator(function* () {
  yield 'ok';
})();
babelHelpers.asyncToGenerator(function* () {
  yield 'ok';
})();
/* @__PURE__ */ (function () {
  var _notIIFE = babelHelpers.asyncToGenerator(function* () {
    yield 'ok';
  });
  function notIIFE() {
    return _notIIFE.apply(this, arguments);
  }
  return notIIFE;
})();
babelHelpers.asyncToGenerator(function* () {
  yield 'not iife';
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — async (input)',
    source: `class Foo {
  async foo() {
    var wat = await bar();
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
class Foo {
  foo() {
    return babelHelpers.asyncToGenerator(function* () {
      var wat = yield bar();
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — class method arity ignore length (input)',
    source: `class Foo {
  async one(a, b = 1) {}
  async two(a, b, ...c) {}
  async three(a, b = 1, c, d = 3) {}
  async four(a, b = 1, c, ...d) {}
  async five(a, { b }) {}
  async six(a, { b } = {}) {}
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
class Foo {
  one(_x) {
    return babelHelpers.asyncToGenerator(function* (a, b = 1) {}).apply(this, arguments);
  }
  two(_x2, _x3) {
    return babelHelpers.asyncToGenerator(function* (a, b, ...c) {}).apply(this, arguments);
  }
  three(_x4) {
    return babelHelpers.asyncToGenerator(function* (a, b = 1, c, d = 3) {}).apply(this, arguments);
  }
  four(_x5) {
    return babelHelpers.asyncToGenerator(function* (a, b = 1, c, ...d) {}).apply(this, arguments);
  }
  five(_x6, _x7) {
    return babelHelpers.asyncToGenerator(function* (a, { b }) {}).apply(this, arguments);
  }
  six(_x8) {
    return babelHelpers.asyncToGenerator(function* (a, { b } = {}) {}).apply(this, arguments);
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — deeply nested asyncs (input)',
    source: `async function s(x, ...args) {
  let t = async (y, a) => {
    let r = async (z, b, ...innerArgs) =>  {
      await z;
      console.log(this, innerArgs, arguments);
      return this.x;
    }
    await r();

    console.log(this, args, arguments);
    return this.g(r);
  }

  await t();
  return this.h(t);
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function s(_x5) {
  return _s.apply(this, arguments);
}
function _s() {
  _s = babelHelpers.asyncToGenerator(function* (x, ...args) {
    var _arguments = arguments,
      _this = this;
    let t = (function () {
      var _ref2 = babelHelpers.asyncToGenerator(function* (y, a) {
        let r = (function () {
          var _ref = babelHelpers.asyncToGenerator(function* (z, b, ...innerArgs) {
            yield z;
            console.log(_this, innerArgs, _arguments);
            return _this.x;
          });
          return function r(_x, _x2) {
            return _ref.apply(this, arguments);
          };
        })();
        yield r();
        console.log(_this, args, _arguments);
        return _this.g(r);
      });
      return function t(_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    })();
    yield t();
    return this.h(t);
  });
  return _s.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — double await (exec)',
    source: `(function () {
const log = [];

const p1 = (async function () {
  log.push(1);
  await await null;
  log.push(2);
})();

const p2 = (async function () {
  log.push(3);
  await null;
  log.push(4);
})();

log.push(5);
const p3 = Promise.resolve().then(() => log.push(6)).then(() => log.push(7));

return Promise.all([p1, p2, p3]).then(() => {
  expect(log).toEqual([1, 3, 5, 4, 6, 2, 7]);
});

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
(function () {
  const log = [];
  const p1 = babelHelpers.asyncToGenerator(function* () {
    log.push(1);
    yield yield null;
    log.push(2);
  })();
  const p2 = babelHelpers.asyncToGenerator(function* () {
    log.push(3);
    yield null;
    log.push(4);
  })();
  log.push(5);
  const p3 = Promise.resolve()
    .then(() => log.push(6))
    .then(() => log.push(7));
  return Promise.all([p1, p2, p3]).then(() => {
    expect(log).toEqual([1, 3, 5, 4, 6, 2, 7]);
  });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — double await (input)',
    source: `async function fn() {
  await await 1;
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function fn() {
  return _fn.apply(this, arguments);
}
function _fn() {
  _fn = babelHelpers.asyncToGenerator(function* () {
    yield yield 1;
  });
  return _fn.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — expression (input)',
    source: `var foo = async function () {
  var wat = await bar();
};

var foo2 = async function () {
  var wat = await bar();
},
bar = async function () {
  var wat = await foo();
};
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
var foo = babelHelpers.asyncToGenerator(function* () {
  var wat = yield bar();
});
var foo2 = babelHelpers.asyncToGenerator(function* () {
    var wat = yield bar();
  }),
  bar = babelHelpers.asyncToGenerator(function* () {
    var wat = yield foo();
  });`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — function arity (input)',
    source: `async function one(a, b = 1) {}
async function two(a, b, ...c) {}
async function three(a, b = 1, c, d = 3) {}
async function four(a, b = 1, c, ...d) {}
async function five(a, {b}){}
async function six(a, {b} = {}){}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function one(_x) {
  return _one.apply(this, arguments);
}
function _one() {
  _one = babelHelpers.asyncToGenerator(function* (a, b = 1) {});
  return _one.apply(this, arguments);
}
function two(_x2, _x3) {
  return _two.apply(this, arguments);
}
function _two() {
  _two = babelHelpers.asyncToGenerator(function* (a, b, ...c) {});
  return _two.apply(this, arguments);
}
function three(_x4) {
  return _three.apply(this, arguments);
}
function _three() {
  _three = babelHelpers.asyncToGenerator(function* (a, b = 1, c, d = 3) {});
  return _three.apply(this, arguments);
}
function four(_x5) {
  return _four.apply(this, arguments);
}
function _four() {
  _four = babelHelpers.asyncToGenerator(function* (a, b = 1, c, ...d) {});
  return _four.apply(this, arguments);
}
function five(_x6, _x7) {
  return _five.apply(this, arguments);
}
function _five() {
  _five = babelHelpers.asyncToGenerator(function* (a, { b }) {});
  return _five.apply(this, arguments);
}
function six(_x8) {
  return _six.apply(this, arguments);
}
function _six() {
  _six = babelHelpers.asyncToGenerator(function* (a, { b } = {}) {});
  return _six.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — named expression (input)',
    source: `var foo = async function bar() {
  console.log(bar);
};
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
var foo = /* @__PURE__ */ (function () {
  var _bar = babelHelpers.asyncToGenerator(function* () {
    console.log(bar);
  });
  function bar() {
    return _bar.apply(this, arguments);
  }
  return bar;
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — no parameters and no id (input)',
    source: `foo(async function () {
\x20\x20
});

bar(async function (x = 1) {
\x20\x20
});

baz(async function (...y) {
\x20\x20
});
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
foo(babelHelpers.asyncToGenerator(function* () {}));
bar(babelHelpers.asyncToGenerator(function* (x = 1) {}));
baz(babelHelpers.asyncToGenerator(function* (...y) {}));`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — object method with arrows (input)',
    source: `class Class {
  async method() {
    this;
    () => this;
    () => {
      this;
      () => this;
      function x() {
        this;
        () => {this}
        async () => {this}
      }
    }
    function x() {
      this;
      () => {this}
      async () => {this}
    }
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
class Class {
  method() {
    var _this = this;
    return babelHelpers.asyncToGenerator(function* () {
      _this;
      () => _this;
      () => {
        _this;
        () => _this;
        function x() {
          var _this2 = this;
          this;
          () => {
            this;
          };
          babelHelpers.asyncToGenerator(function* () {
            _this2;
          });
        }
      };
      function x() {
        var _this3 = this;
        this;
        () => {
          this;
        };
        babelHelpers.asyncToGenerator(function* () {
          _this3;
        });
      }
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — object method with super (input)',
    source: `class Foo extends class {} {
  async method() {
    super.method();

    var arrow = () => super.method();
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
class Foo extends class {} {
  method() {
    var _superprop_getMethod = () => super.method,
      _this = this;
    return babelHelpers.asyncToGenerator(function* () {
      _superprop_getMethod().call(_this);
      var arrow = () => _superprop_getMethod().call(_this);
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — object method (input)',
    source: `let obj = {
  a: 123,
  async foo(bar) {
    return await baz(bar);
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
let obj = {
  a: 123,
  foo(bar) {
    return babelHelpers.asyncToGenerator(function* () {
      return yield baz(bar);
    })();
  },
};`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — parameters (input)',
    source: `async function foo(bar) {

}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function foo(_x) {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* (bar) {});
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — shadowed promise import (input)',
    source: `import Promise from 'somewhere';

async function foo() {
  await Promise.resolve();
}
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
import _Promise from 'somewhere';
function foo() {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* () {
    yield _Promise.resolve();
  });
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — shadowed promise nested (input)',
    source: `let Promise;

async function foo() {
  let Promise;

  await bar();

  async function bar() {
    return Promise.resolve();
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
let _Promise;
function foo() {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* () {
    let Promise;
    yield bar();
    function bar() {
      return _bar.apply(this, arguments);
    }
    function _bar() {
      _bar = babelHelpers.asyncToGenerator(function* () {
        return Promise.resolve();
      });
      return _bar.apply(this, arguments);
    }
  });
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — shadowed promise (input)',
    source: `let Promise;
async function foo() {
  await new Promise(resolve => { resolve() });
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
let _Promise;
function foo() {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* () {
    yield new _Promise(resolve => {
      resolve();
    });
  });
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'async to generator — statement (input)',
    source: `async function foo() {
  var wat = await bar();
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function foo() {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* () {
    var wat = yield bar();
  });
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'bluebird coroutines — arrow function (input)',
    source: `(async () => { await foo(); })()
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
babelHelpers.asyncToGenerator(function* () {
  yield foo();
})();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'bluebird coroutines — expression (input)',
    source: `var foo = async function () {
  var wat = await bar();
};
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
var foo = babelHelpers.asyncToGenerator(function* () {
  var wat = yield bar();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'export async — default arrow export (input)',
    source: `export default async () => { return await foo(); }
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
export default babelHelpers.asyncToGenerator(function* () {
  return yield foo();
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'export async — default export (input)',
    source: `export default async function myFunc() {}
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
export default function myFunc() {
  return _myFunc.apply(this, arguments);
}
function _myFunc() {
  _myFunc = babelHelpers.asyncToGenerator(function* () {});
  return _myFunc.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'export async — import and export (input)',
    source: `import bar from 'bar';

export async function foo () { }
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
import bar from 'bar';
export function foo() {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* () {});
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'export async — lone export (input)',
    source: `export async function foo () { }
`,
    filename: 'input.mjs',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
export function foo() {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* () {});
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 15978 (exec)',
    source: `(function () {
return (async function () {
  let items = [1, 2, 3, 4];
  let output = [];
  for (const item of items) {
    await f(async (x) => {
      output.push(item);
    });
  }
  expect(output).toStrictEqual([1, 2, 3, 4]);
})();

async function f(lambda) {
  await lambda();
}

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
(function () {
  return babelHelpers.asyncToGenerator(function* () {
    let items = [1, 2, 3, 4];
    let output = [];
    for (const item of items) {
      yield f(
        (function () {
          var _ref = babelHelpers.asyncToGenerator(function* (x) {
            output.push(item);
          });
          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })(),
      );
    }
    expect(output).toStrictEqual([1, 2, 3, 4]);
  })();
  function f(_x2) {
    return _f.apply(this, arguments);
  }
  function _f() {
    _f = babelHelpers.asyncToGenerator(function* (lambda) {
      yield lambda();
    });
    return _f.apply(this, arguments);
  }
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 15978 (input)',
    source: `(async function () {
  let items = [1, 2, 3, 4];
  for (const item of items) {
    await f(async (x) => {
      console.log(item);
    });
  }
})();

async function f(lambda) {
  await lambda();
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
babelHelpers.asyncToGenerator(function* () {
  let items = [1, 2, 3, 4];
  for (const item of items) {
    yield f(
      (function () {
        var _ref = babelHelpers.asyncToGenerator(function* (x) {
          console.log(item);
        });
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })(),
    );
  }
})();
function f(_x2) {
  return _f.apply(this, arguments);
}
function _f() {
  _f = babelHelpers.asyncToGenerator(function* (lambda) {
    yield lambda();
  });
  return _f.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 4599 (input)',
    source: `async () => await promise

async () => { await promise }
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
babelHelpers.asyncToGenerator(function* () {
  return yield promise;
});
babelHelpers.asyncToGenerator(function* () {
  yield promise;
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 4943 (exec)',
    source: `(function () {
"use strict";

function mandatory(paramName) {
  throw new Error(\`Missing parameter: \${paramName}\`);
}

async function foo({ a, b = mandatory("b") } = {}) {
  return Promise.resolve(b);
}

return foo().then(() => {
  throw new Error('should not occur');
}, () => true);

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
(function () {
  'use strict';
  function mandatory(paramName) {
    throw new Error(\`Missing parameter: \${paramName}\`);
  }
  function foo() {
    return _foo.apply(this, arguments);
  }
  function _foo() {
    _foo = babelHelpers.asyncToGenerator(function* ({ a, b = mandatory('b') } = {}) {
      return Promise.resolve(b);
    });
    return _foo.apply(this, arguments);
  }
  return foo().then(
    () => {
      throw new Error('should not occur');
    },
    () => true,
  );
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 4943 (input)',
    source: `"use strict";

function mandatory(paramName) {
  throw new Error(\`Missing parameter: \${paramName}\`);
}

async function foo({ a, b = mandatory("b") }) {
  return Promise.resolve(b);
}
`,
    filename: 'input.js',
    output: `'use strict';
var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function mandatory(paramName) {
  throw new Error(\`Missing parameter: \${paramName}\`);
}
function foo(_x) {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* ({ a, b = mandatory('b') }) {
    return Promise.resolve(b);
  });
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 7178 (input)',
    source: `const title = "Neem contact op";

async function action() {
  return <Contact title={title} />;
}
`,
    filename: 'input.jsx',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
const title = 'Neem contact op';
function action() {
  return _action.apply(this, arguments);
}
function _action() {
  _action = babelHelpers.asyncToGenerator(function* () {
    return <Contact title={title} />;
  });
  return _action.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
          jsx: 'preserve',
        },
      },
    ],
  },
  {
    title: 'regression — 8783 (exec)',
    source: `(function () {
let log = [];

let resolve;
const main = new Promise(r => { resolve = r });

(async function poll(count) {
  log.push(await Promise.resolve(count))
  if (count < 3) setTimeout(poll, 10, count + 1);
  else resolve();
})(0)

return main.then(() => {
  expect(log).toEqual([0, 1, 2, 3]);
});

});
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
(function () {
  let log = [];
  let resolve;
  const main = new Promise(r => {
    resolve = r;
  });
  /* @__PURE__ */ (function () {
    var _poll = babelHelpers.asyncToGenerator(function* (count) {
      log.push(yield Promise.resolve(count));
      if (count < 3) setTimeout(poll, 10, count + 1);
      else resolve();
    });
    function poll(_x) {
      return _poll.apply(this, arguments);
    }
    return poll;
  })()(0);
  return main.then(() => {
    expect(log).toEqual([0, 1, 2, 3]);
  });
});`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — 8783 (input)',
    source: `(async function poll() {
  console.log(await Promise.resolve('Hello'))
  setTimeout(poll, 1000);
})();`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
/* @__PURE__ */ (function () {
  var _poll = babelHelpers.asyncToGenerator(function* () {
    console.log(yield Promise.resolve('Hello'));
    setTimeout(poll, 1e3);
  });
  function poll() {
    return _poll.apply(this, arguments);
  }
  return poll;
})()();`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — T6882 (exec)',
    source: `foo();

async function foo() {}
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
foo();
function foo() {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* () {});
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — T7108 (input)',
    source: `class Test{
  static async method1() {
    console.log(this);

    setTimeout(async () => {
      console.log(this);
    });
  }

  static async method2() {
    console.log(this);

    setTimeout(async (arg) => {
      console.log(this);
    });
  }

  async method1() {
    console.log(this);

    setTimeout(async () => {
      console.log(this);
    });
  }

  async method2() {
    console.log(this);

    setTimeout(async (arg) => {
      console.log(this);
    });
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
class Test {
  static method1() {
    var _this = this;
    return babelHelpers.asyncToGenerator(function* () {
      console.log(_this);
      setTimeout(
        babelHelpers.asyncToGenerator(function* () {
          console.log(_this);
        }),
      );
    })();
  }
  static method2() {
    var _this2 = this;
    return babelHelpers.asyncToGenerator(function* () {
      console.log(_this2);
      setTimeout(
        (function () {
          var _ref = babelHelpers.asyncToGenerator(function* (arg) {
            console.log(_this2);
          });
          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })(),
      );
    })();
  }
  method1() {
    var _this3 = this;
    return babelHelpers.asyncToGenerator(function* () {
      console.log(_this3);
      setTimeout(
        babelHelpers.asyncToGenerator(function* () {
          console.log(_this3);
        }),
      );
    })();
  }
  method2() {
    var _this4 = this;
    return babelHelpers.asyncToGenerator(function* () {
      console.log(_this4);
      setTimeout(
        (function () {
          var _ref2 = babelHelpers.asyncToGenerator(function* (arg) {
            console.log(_this4);
          });
          return function (_x2) {
            return _ref2.apply(this, arguments);
          };
        })(),
      );
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — T7194 (input)',
    source: `function f() {
  g(async function() {
    c(() => this);
  });
}

(async function () {
  console.log('async wrapper:', this === 'foo')

  ;(() => {
    console.log('nested arrow:', this === 'foo')
  })()
}).call('foo')
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function f() {
  g(
    babelHelpers.asyncToGenerator(function* () {
      c(() => this);
    }),
  );
}
babelHelpers
  .asyncToGenerator(function* () {
    console.log('async wrapper:', this === 'foo');
    (() => {
      console.log('nested arrow:', this === 'foo');
    })();
  })
  .call('foo');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — fn name (exec)',
    source: `var concat = async (...args) => {
  var x = args[0];
  var y = args[1];
};
expect(concat.name).toBe("concat");
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
var concat = (function () {
  var _ref = babelHelpers.asyncToGenerator(function* (...args) {
    var x = args[0];
    var y = args[1];
  });
  return function concat() {
    return _ref.apply(this, arguments);
  };
})();
expect(concat.name).toBe('concat');`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — gh 6923 (input)',
    source: `async function foo() {
\t(async function (number) {
\t\tconst tmp = number
\t})
}`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function foo() {
  return _foo.apply(this, arguments);
}
function _foo() {
  _foo = babelHelpers.asyncToGenerator(function* () {
    /* @__PURE__ */ (function () {
      var _ref = babelHelpers.asyncToGenerator(function* (number) {
        const tmp = number;
      });
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })();
  });
  return _foo.apply(this, arguments);
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — in uncompiled class fields (input)',
    source: `// Angular needs to always compile async functions, even if
// the targets support class fields.
// https://github.com/babel/babel/issues/14749

class A {
  a = async () => this;
  b = async (x, y, z) => this;
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
// Angular needs to always compile async functions, even if
// the targets support class fields.
// https://github.com/babel/babel/issues/14749
class A {
  a = (() => {
    var _this = this;
    return babelHelpers.asyncToGenerator(function* () {
      return _this;
    });
  })();
  b = (() => {
    var _this2 = this;
    return (function () {
      var _ref = babelHelpers.asyncToGenerator(function* (x, y, z) {
        return _this2;
      });
      return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      };
    })();
  })();
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — regression 2765 (input)',
    source: `function f() {
  let g = async () => {
    this;
  };
}

class Class {
  async m() {
    var c = async (b) => {
      this
    }
  }
}
`,
    filename: 'input.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
function f() {
  var _this = this;
  let g = (function () {
    var _ref = babelHelpers.asyncToGenerator(function* () {
      _this;
    });
    return function g() {
      return _ref.apply(this, arguments);
    };
  })();
}
class Class {
  m() {
    var _this2 = this;
    return babelHelpers.asyncToGenerator(function* () {
      var c = (function () {
        var _ref2 = babelHelpers.asyncToGenerator(function* (b) {
          _this2;
        });
        return function c(_x) {
          return _ref2.apply(this, arguments);
        };
      })();
    })();
  }
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
  {
    title: 'regression — test262 fn length (exec)',
    source: `var a = async (b) => {}
expect(a.length).toBe(1);
`,
    filename: 'exec.js',
    output: `var babelHelpers = (() => {
  var y = {
      asyncToGenerator: function (r, u) {
        function x(i, f, p, o, a, s, e) {
          try {
            var n = i[s](e),
              t = n.value;
          } catch (d) {
            return void p(d);
          }
          n.done ? f(t) : Promise.resolve(t).then(o, a);
        }
        function h(i) {
          return function () {
            var f = this,
              p = arguments;
            return new Promise(function (o, a) {
              var s = i.apply(f, p);
              function e(t) {
                x(s, o, a, e, n, 'next', t);
              }
              function n(t) {
                x(s, o, a, e, n, 'throw', t);
              }
              e(void 0);
            });
          };
        }
        ((r.exports = h), (r.exports.__esModule = !0), (r.exports.default = r.exports));
      },
    },
    c = {};
  function v(r) {
    if (c[r]) return c[r].exports;
    var u = (c[r] = { exports: {} });
    return (y[r](u, v), u.exports);
  }
  return { asyncToGenerator: v('asyncToGenerator') };
})();
var a = (function () {
  var _ref = babelHelpers.asyncToGenerator(function* (b) {});
  return function a(_x) {
    return _ref.apply(this, arguments);
  };
})();
expect(a.length).toBe(1);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            asyncFunctions: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
