import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'cross platform — auto import dev (input)',
    source: `var x = (
  <>
    <div>
      <div key="1" />
      <div key="2" meow="wolf" />
      <div key="3" />
      <div {...props} key="4" />
    </div>
  </>
);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
function _extends() {
  return (
    (_extends = Object.assign
      ? Object.assign.bind()
      : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }),
    _extends.apply(null, arguments)
  );
}
var x = /* @__PURE__ */ React.createElement(
  React.Fragment,
  null,
  /* @__PURE__ */ React.createElement(
    'div',
    {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 3,
        columnNumber: 5,
      },
    },
    /* @__PURE__ */ React.createElement('div', {
      key: '1',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 4,
        columnNumber: 7,
      },
    }),
    /* @__PURE__ */ React.createElement('div', {
      key: '2',
      meow: 'wolf',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 5,
        columnNumber: 7,
      },
    }),
    /* @__PURE__ */ React.createElement('div', {
      key: '3',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 6,
        columnNumber: 7,
      },
    }),
    /* @__PURE__ */ React.createElement(
      'div',
      _extends({}, props, {
        key: '4',
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 7,
          columnNumber: 7,
        },
      }),
    ),
  ),
);`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _react = require('react');
var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
var x = _reactJsxDevRuntime.jsxDEV(
  _reactJsxDevRuntime.Fragment,
  {
    children: _reactJsxDevRuntime.jsxDEV(
      'div',
      {
        children: [
          _reactJsxDevRuntime.jsxDEV(
            'div',
            {},
            '1',
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 4,
              columnNumber: 7,
            },
            this,
          ),
          _reactJsxDevRuntime.jsxDEV(
            'div',
            { meow: 'wolf' },
            '2',
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 5,
              columnNumber: 7,
            },
            this,
          ),
          _reactJsxDevRuntime.jsxDEV(
            'div',
            {},
            '3',
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 6,
              columnNumber: 7,
            },
            this,
          ),
          _react.createElement('div', {
            ...props,
            key: '4',
            __self: this,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 7,
              columnNumber: 7,
            },
          }),
        ],
      },
      void 0,
      true,
      {
        fileName: _jsxFileName,
        lineNumber: 3,
        columnNumber: 5,
      },
      this,
    ),
  },
  void 0,
  false,
);`,
      },
    ],
  },
  {
    title: 'cross platform — classic runtime (input)',
    source: `var x = (
    <>
    <div>
        <div key="1" />
        <div key="2" meow="wolf" />
        <div key="3" />
        <div {...props} key="4" />
    </div>
    </>
  );`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
function _extends() {
  return (
    (_extends = Object.assign
      ? Object.assign.bind()
      : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }),
    _extends.apply(null, arguments)
  );
}
var x = /* @__PURE__ */ React.createElement(
  React.Fragment,
  null,
  /* @__PURE__ */ React.createElement(
    'div',
    {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 3,
        columnNumber: 5,
      },
    },
    /* @__PURE__ */ React.createElement('div', {
      key: '1',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 4,
        columnNumber: 9,
      },
    }),
    /* @__PURE__ */ React.createElement('div', {
      key: '2',
      meow: 'wolf',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 5,
        columnNumber: 9,
      },
    }),
    /* @__PURE__ */ React.createElement('div', {
      key: '3',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 6,
        columnNumber: 9,
      },
    }),
    /* @__PURE__ */ React.createElement(
      'div',
      _extends({}, props, {
        key: '4',
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 7,
          columnNumber: 9,
        },
      }),
    ),
  ),
);`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _react = require('react');
var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
var x = _reactJsxDevRuntime.jsxDEV(
  _reactJsxDevRuntime.Fragment,
  {
    children: _reactJsxDevRuntime.jsxDEV(
      'div',
      {
        children: [
          _reactJsxDevRuntime.jsxDEV(
            'div',
            {},
            '1',
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 4,
              columnNumber: 9,
            },
            this,
          ),
          _reactJsxDevRuntime.jsxDEV(
            'div',
            { meow: 'wolf' },
            '2',
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 5,
              columnNumber: 9,
            },
            this,
          ),
          _reactJsxDevRuntime.jsxDEV(
            'div',
            {},
            '3',
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 6,
              columnNumber: 9,
            },
            this,
          ),
          _react.createElement('div', {
            ...props,
            key: '4',
            __self: this,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 7,
              columnNumber: 9,
            },
          }),
        ],
      },
      void 0,
      true,
      {
        fileName: _jsxFileName,
        lineNumber: 3,
        columnNumber: 5,
      },
      this,
    ),
  },
  void 0,
  false,
);`,
      },
    ],
  },
  {
    title: 'cross platform — fragments (input)',
    source: 'var x = <><div /></>;',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
var x = /* @__PURE__ */ React.createElement(
  React.Fragment,
  null,
  /* @__PURE__ */ React.createElement('div', {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 1,
      columnNumber: 11,
    },
  }),
);`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
var x = _reactJsxDevRuntime.jsxDEV(
  _reactJsxDevRuntime.Fragment,
  {
    children: _reactJsxDevRuntime.jsxDEV(
      'div',
      {},
      void 0,
      false,
      {
        fileName: _jsxFileName,
        lineNumber: 1,
        columnNumber: 11,
      },
      this,
    ),
  },
  void 0,
  false,
);`,
      },
    ],
  },
  {
    title: 'cross platform — generated jsx (input)',
    source: `// empty
`,
    filename: 'input.jsx',
    output: '// empty',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
      },
    ],
  },
  {
    title: 'cross platform — handle fragments with key (input)',
    source: `var x = <React.Fragment key="foo"></React.Fragment>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
var x = /* @__PURE__ */ React.createElement(React.Fragment, {
  key: 'foo',
  __self: this,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 1,
    columnNumber: 9,
  },
});`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
var x = _reactJsxDevRuntime.jsxDEV(
  React.Fragment,
  {},
  'foo',
  false,
  {
    fileName: _jsxFileName,
    lineNumber: 1,
    columnNumber: 9,
  },
  this,
);`,
      },
    ],
  },
  {
    title: 'cross platform — handle nonstatic children (input)',
    source: `var x = <div>{[<span key={"0"} />, <span key={"1"} />]}</div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
var x = /* @__PURE__ */ React.createElement(
  'div',
  {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 1,
      columnNumber: 9,
    },
  },
  [
    /* @__PURE__ */ React.createElement('span', {
      key: '0',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 1,
        columnNumber: 16,
      },
    }),
    /* @__PURE__ */ React.createElement('span', {
      key: '1',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 1,
        columnNumber: 36,
      },
    }),
  ],
);`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
var x = _reactJsxDevRuntime.jsxDEV(
  'div',
  {
    children: [
      _reactJsxDevRuntime.jsxDEV(
        'span',
        {},
        '0',
        false,
        {
          fileName: _jsxFileName,
          lineNumber: 1,
          columnNumber: 16,
        },
        this,
      ),
      _reactJsxDevRuntime.jsxDEV(
        'span',
        {},
        '1',
        false,
        {
          fileName: _jsxFileName,
          lineNumber: 1,
          columnNumber: 36,
        },
        this,
      ),
    ],
  },
  void 0,
  false,
  {
    fileName: _jsxFileName,
    lineNumber: 1,
    columnNumber: 9,
  },
  this,
);`,
      },
    ],
  },
  {
    title: 'cross platform — handle static children (input)',
    source: `var x = (
  <div>
    <span />
    {[<span key={"0"} />, <span key={"1"} />]}
  </div>
);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
var x = /* @__PURE__ */ React.createElement(
  'div',
  {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 2,
      columnNumber: 3,
    },
  },
  /* @__PURE__ */ React.createElement('span', {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 3,
      columnNumber: 5,
    },
  }),
  [
    /* @__PURE__ */ React.createElement('span', {
      key: '0',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 4,
        columnNumber: 7,
      },
    }),
    /* @__PURE__ */ React.createElement('span', {
      key: '1',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 4,
        columnNumber: 27,
      },
    }),
  ],
);`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
var x = _reactJsxDevRuntime.jsxDEV(
  'div',
  {
    children: [
      _reactJsxDevRuntime.jsxDEV(
        'span',
        {},
        void 0,
        false,
        {
          fileName: _jsxFileName,
          lineNumber: 3,
          columnNumber: 5,
        },
        this,
      ),
      [
        _reactJsxDevRuntime.jsxDEV(
          'span',
          {},
          '0',
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 4,
            columnNumber: 7,
          },
          this,
        ),
        _reactJsxDevRuntime.jsxDEV(
          'span',
          {},
          '1',
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 4,
            columnNumber: 27,
          },
          this,
        ),
      ],
    ],
  },
  void 0,
  true,
  {
    fileName: _jsxFileName,
    lineNumber: 2,
    columnNumber: 3,
  },
  this,
);`,
      },
    ],
  },
  {
    title: 'cross platform — no source self (input)',
    source: `var x = (
  <>
    <div>
      <span />
      <div key="1" />
      <div key="2" meow="wolf" />
      {[<span key={"0"} />, <span key={"1"} />]}
    </div>
  </>
);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
var x = /* @__PURE__ */ React.createElement(
  React.Fragment,
  null,
  /* @__PURE__ */ React.createElement(
    'div',
    {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 3,
        columnNumber: 5,
      },
    },
    /* @__PURE__ */ React.createElement('span', {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 4,
        columnNumber: 7,
      },
    }),
    /* @__PURE__ */ React.createElement('div', {
      key: '1',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 5,
        columnNumber: 7,
      },
    }),
    /* @__PURE__ */ React.createElement('div', {
      key: '2',
      meow: 'wolf',
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 6,
        columnNumber: 7,
      },
    }),
    [
      /* @__PURE__ */ React.createElement('span', {
        key: '0',
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 7,
          columnNumber: 9,
        },
      }),
      /* @__PURE__ */ React.createElement('span', {
        key: '1',
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 7,
          columnNumber: 29,
        },
      }),
    ],
  ),
);`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
var x = _reactJsxDevRuntime.jsxDEV(
  _reactJsxDevRuntime.Fragment,
  {
    children: _reactJsxDevRuntime.jsxDEV(
      'div',
      {
        children: [
          _reactJsxDevRuntime.jsxDEV(
            'span',
            {},
            void 0,
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 4,
              columnNumber: 7,
            },
            this,
          ),
          _reactJsxDevRuntime.jsxDEV(
            'div',
            {},
            '1',
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 5,
              columnNumber: 7,
            },
            this,
          ),
          _reactJsxDevRuntime.jsxDEV(
            'div',
            { meow: 'wolf' },
            '2',
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 6,
              columnNumber: 7,
            },
            this,
          ),
          [
            _reactJsxDevRuntime.jsxDEV(
              'span',
              {},
              '0',
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 7,
                columnNumber: 9,
              },
              this,
            ),
            _reactJsxDevRuntime.jsxDEV(
              'span',
              {},
              '1',
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 7,
                columnNumber: 29,
              },
              this,
            ),
          ],
        ],
      },
      void 0,
      true,
      {
        fileName: _jsxFileName,
        lineNumber: 3,
        columnNumber: 5,
      },
      this,
    ),
  },
  void 0,
  false,
);`,
      },
    ],
  },
  {
    title: 'cross platform — self inside arrow (input)',
    source: `<div />;
() => <div />;

function fn() {
  <div />;
  () => <div />;
}
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
/* @__PURE__ */ React.createElement('div', {
  __self: this,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 1,
    columnNumber: 1,
  },
});
() =>
  /* @__PURE__ */ React.createElement('div', {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 2,
      columnNumber: 7,
    },
  });
function fn() {
  /* @__PURE__ */ React.createElement('div', {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 5,
      columnNumber: 3,
    },
  });
  () =>
    /* @__PURE__ */ React.createElement('div', {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 6,
        columnNumber: 9,
      },
    });
}`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
_reactJsxDevRuntime.jsxDEV(
  'div',
  {},
  void 0,
  false,
  {
    fileName: _jsxFileName,
    lineNumber: 1,
    columnNumber: 1,
  },
  this,
);
() =>
  _reactJsxDevRuntime.jsxDEV(
    'div',
    {},
    void 0,
    false,
    {
      fileName: _jsxFileName,
      lineNumber: 2,
      columnNumber: 7,
    },
    this,
  );
function fn() {
  _reactJsxDevRuntime.jsxDEV(
    'div',
    {},
    void 0,
    false,
    {
      fileName: _jsxFileName,
      lineNumber: 5,
      columnNumber: 3,
    },
    this,
  );
  () =>
    _reactJsxDevRuntime.jsxDEV(
      'div',
      {},
      void 0,
      false,
      {
        fileName: _jsxFileName,
        lineNumber: 6,
        columnNumber: 9,
      },
      this,
    );
}`,
      },
    ],
  },
  {
    title: 'cross platform — within derived classes constructor (input)',
    source: `class A { }

class B extends A {
  constructor() {
    <sometag1 />;
    super(<sometag2 />);
    <sometag3 />;
  }
}

class C {
  constructor() {
    <sometag4 />;
    class D extends A {
      constructor() {
        super();
      }
    }
    const E = class extends A {
      constructor() {
        super();
      }
    };
  }
}

class E extends A {
  constructor() {
    this.x = () => <sometag5 />;
    this.y = function () {
      return <sometag6 />;
    };
    function z() {
      return <sometag7 />;
    }
    { <sometag8 /> }
    super();
  }
}

class F {
  constructor() {
    <sometag9 />
  }
}

class G extends A {
  constructor() {
    return <sometag10 />;
  }
}
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: `var _jsxFileName = 'input.jsx';
class A {}
class B extends A {
  constructor() {
    /* @__PURE__ */ React.createElement('sometag1', {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 5,
        columnNumber: 5,
      },
    });
    super(
      /* @__PURE__ */ React.createElement('sometag2', {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 6,
          columnNumber: 11,
        },
      }),
    );
    /* @__PURE__ */ React.createElement('sometag3', {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 7,
        columnNumber: 5,
      },
    });
  }
}
class C {
  constructor() {
    /* @__PURE__ */ React.createElement('sometag4', {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 13,
        columnNumber: 5,
      },
    });
    class D extends A {
      constructor() {
        super();
      }
    }
    const E = class extends A {
      constructor() {
        super();
      }
    };
  }
}
class E extends A {
  constructor() {
    this.x = () =>
      /* @__PURE__ */ React.createElement('sometag5', {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 29,
          columnNumber: 20,
        },
      });
    this.y = function () {
      return /* @__PURE__ */ React.createElement('sometag6', {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 31,
          columnNumber: 14,
        },
      });
    };
    function z() {
      return /* @__PURE__ */ React.createElement('sometag7', {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 34,
          columnNumber: 14,
        },
      });
    }
    {
      /* @__PURE__ */ React.createElement('sometag8', {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 36,
          columnNumber: 7,
        },
      });
    }
    super();
  }
}
class F {
  constructor() {
    /* @__PURE__ */ React.createElement('sometag9', {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 43,
        columnNumber: 5,
      },
    });
  }
}
class G extends A {
  constructor() {
    return /* @__PURE__ */ React.createElement('sometag10', {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 49,
        columnNumber: 12,
      },
    });
  }
}`,
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: `var _reactJsxDevRuntime = require('react/jsx-dev-runtime');
var _jsxFileName = 'input.jsx';
class A {}
class B extends A {
  constructor() {
    _reactJsxDevRuntime.jsxDEV('sometag1', {}, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 5,
      columnNumber: 5,
    });
    super(
      _reactJsxDevRuntime.jsxDEV('sometag2', {}, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 6,
        columnNumber: 11,
      }),
    );
    _reactJsxDevRuntime.jsxDEV('sometag3', {}, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 7,
      columnNumber: 5,
    });
  }
}
class C {
  constructor() {
    _reactJsxDevRuntime.jsxDEV(
      'sometag4',
      {},
      void 0,
      false,
      {
        fileName: _jsxFileName,
        lineNumber: 13,
        columnNumber: 5,
      },
      this,
    );
    class D extends A {
      constructor() {
        super();
      }
    }
    const E = class extends A {
      constructor() {
        super();
      }
    };
  }
}
class E extends A {
  constructor() {
    this.x = () =>
      _reactJsxDevRuntime.jsxDEV('sometag5', {}, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 29,
        columnNumber: 20,
      });
    this.y = function () {
      return _reactJsxDevRuntime.jsxDEV(
        'sometag6',
        {},
        void 0,
        false,
        {
          fileName: _jsxFileName,
          lineNumber: 31,
          columnNumber: 14,
        },
        this,
      );
    };
    function z() {
      return _reactJsxDevRuntime.jsxDEV(
        'sometag7',
        {},
        void 0,
        false,
        {
          fileName: _jsxFileName,
          lineNumber: 34,
          columnNumber: 14,
        },
        this,
      );
    }
    {
      _reactJsxDevRuntime.jsxDEV('sometag8', {}, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 36,
        columnNumber: 7,
      });
    }
    super();
  }
}
class F {
  constructor() {
    _reactJsxDevRuntime.jsxDEV(
      'sometag9',
      {},
      void 0,
      false,
      {
        fileName: _jsxFileName,
        lineNumber: 43,
        columnNumber: 5,
      },
      this,
    );
  }
}
class G extends A {
  constructor() {
    return _reactJsxDevRuntime.jsxDEV('sometag10', {}, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 49,
      columnNumber: 12,
    });
  }
}`,
      },
    ],
  },
  {
    title: 'cross platform — within ts module block (input)',
    source: `export namespace Namespaced {
\texport const Component = () => (
\t\t<div>Hello, world!</div>
\t);
}
`,
    filename: 'input.jsx',
    output: '[syntax-error] invalid-input',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
