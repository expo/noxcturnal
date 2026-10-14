import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var _jsxFileName = 'input.jsx';\nfunction _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\nvar x = /* @__PURE__ */ React.createElement(\n  React.Fragment,\n  null,\n  /* @__PURE__ */ React.createElement(\n    'div',\n    {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 3,\n        columnNumber: 5,\n      },\n    },\n    /* @__PURE__ */ React.createElement('div', {\n      key: '1',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 4,\n        columnNumber: 7,\n      },\n    }),\n    /* @__PURE__ */ React.createElement('div', {\n      key: '2',\n      meow: 'wolf',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 5,\n        columnNumber: 7,\n      },\n    }),\n    /* @__PURE__ */ React.createElement('div', {\n      key: '3',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 6,\n        columnNumber: 7,\n      },\n    }),\n    /* @__PURE__ */ React.createElement(\n      'div',\n      _extends({}, props, {\n        key: '4',\n        __self: this,\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 7,\n          columnNumber: 7,\n        },\n      }),\n    ),\n  ),\n);",
  "var _react = require('react');\nvar _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\nvar x = _reactJsxDevRuntime.jsxDEV(\n  _reactJsxDevRuntime.Fragment,\n  {\n    children: _reactJsxDevRuntime.jsxDEV(\n      'div',\n      {\n        children: [\n          _reactJsxDevRuntime.jsxDEV(\n            'div',\n            {},\n            '1',\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 4,\n              columnNumber: 7,\n            },\n            this,\n          ),\n          _reactJsxDevRuntime.jsxDEV(\n            'div',\n            { meow: 'wolf' },\n            '2',\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 5,\n              columnNumber: 7,\n            },\n            this,\n          ),\n          _reactJsxDevRuntime.jsxDEV(\n            'div',\n            {},\n            '3',\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 6,\n              columnNumber: 7,\n            },\n            this,\n          ),\n          _react.createElement('div', {\n            ...props,\n            key: '4',\n            __self: this,\n            __source: {\n              fileName: _jsxFileName,\n              lineNumber: 7,\n              columnNumber: 7,\n            },\n          }),\n        ],\n      },\n      void 0,\n      true,\n      {\n        fileName: _jsxFileName,\n        lineNumber: 3,\n        columnNumber: 5,\n      },\n      this,\n    ),\n  },\n  void 0,\n  false,\n);",
  "var _jsxFileName = 'input.jsx';\nfunction _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\nvar x = /* @__PURE__ */ React.createElement(\n  React.Fragment,\n  null,\n  /* @__PURE__ */ React.createElement(\n    'div',\n    {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 3,\n        columnNumber: 5,\n      },\n    },\n    /* @__PURE__ */ React.createElement('div', {\n      key: '1',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 4,\n        columnNumber: 9,\n      },\n    }),\n    /* @__PURE__ */ React.createElement('div', {\n      key: '2',\n      meow: 'wolf',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 5,\n        columnNumber: 9,\n      },\n    }),\n    /* @__PURE__ */ React.createElement('div', {\n      key: '3',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 6,\n        columnNumber: 9,\n      },\n    }),\n    /* @__PURE__ */ React.createElement(\n      'div',\n      _extends({}, props, {\n        key: '4',\n        __self: this,\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 7,\n          columnNumber: 9,\n        },\n      }),\n    ),\n  ),\n);",
  "var _react = require('react');\nvar _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\nvar x = _reactJsxDevRuntime.jsxDEV(\n  _reactJsxDevRuntime.Fragment,\n  {\n    children: _reactJsxDevRuntime.jsxDEV(\n      'div',\n      {\n        children: [\n          _reactJsxDevRuntime.jsxDEV(\n            'div',\n            {},\n            '1',\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 4,\n              columnNumber: 9,\n            },\n            this,\n          ),\n          _reactJsxDevRuntime.jsxDEV(\n            'div',\n            { meow: 'wolf' },\n            '2',\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 5,\n              columnNumber: 9,\n            },\n            this,\n          ),\n          _reactJsxDevRuntime.jsxDEV(\n            'div',\n            {},\n            '3',\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 6,\n              columnNumber: 9,\n            },\n            this,\n          ),\n          _react.createElement('div', {\n            ...props,\n            key: '4',\n            __self: this,\n            __source: {\n              fileName: _jsxFileName,\n              lineNumber: 7,\n              columnNumber: 9,\n            },\n          }),\n        ],\n      },\n      void 0,\n      true,\n      {\n        fileName: _jsxFileName,\n        lineNumber: 3,\n        columnNumber: 5,\n      },\n      this,\n    ),\n  },\n  void 0,\n  false,\n);",
  "var _jsxFileName = 'input.jsx';\nvar x = /* @__PURE__ */ React.createElement(\n  React.Fragment,\n  null,\n  /* @__PURE__ */ React.createElement('div', {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 1,\n      columnNumber: 11,\n    },\n  }),\n);",
  "var _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\nvar x = _reactJsxDevRuntime.jsxDEV(\n  _reactJsxDevRuntime.Fragment,\n  {\n    children: _reactJsxDevRuntime.jsxDEV(\n      'div',\n      {},\n      void 0,\n      false,\n      {\n        fileName: _jsxFileName,\n        lineNumber: 1,\n        columnNumber: 11,\n      },\n      this,\n    ),\n  },\n  void 0,\n  false,\n);",
  '// empty',
  "var _jsxFileName = 'input.jsx';\nvar x = /* @__PURE__ */ React.createElement(React.Fragment, {\n  key: 'foo',\n  __self: this,\n  __source: {\n    fileName: _jsxFileName,\n    lineNumber: 1,\n    columnNumber: 9,\n  },\n});",
  "var _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\nvar x = _reactJsxDevRuntime.jsxDEV(\n  React.Fragment,\n  {},\n  'foo',\n  false,\n  {\n    fileName: _jsxFileName,\n    lineNumber: 1,\n    columnNumber: 9,\n  },\n  this,\n);",
  "var _jsxFileName = 'input.jsx';\nvar x = /* @__PURE__ */ React.createElement(\n  'div',\n  {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 1,\n      columnNumber: 9,\n    },\n  },\n  [\n    /* @__PURE__ */ React.createElement('span', {\n      key: '0',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 1,\n        columnNumber: 16,\n      },\n    }),\n    /* @__PURE__ */ React.createElement('span', {\n      key: '1',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 1,\n        columnNumber: 36,\n      },\n    }),\n  ],\n);",
  "var _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\nvar x = _reactJsxDevRuntime.jsxDEV(\n  'div',\n  {\n    children: [\n      _reactJsxDevRuntime.jsxDEV(\n        'span',\n        {},\n        '0',\n        false,\n        {\n          fileName: _jsxFileName,\n          lineNumber: 1,\n          columnNumber: 16,\n        },\n        this,\n      ),\n      _reactJsxDevRuntime.jsxDEV(\n        'span',\n        {},\n        '1',\n        false,\n        {\n          fileName: _jsxFileName,\n          lineNumber: 1,\n          columnNumber: 36,\n        },\n        this,\n      ),\n    ],\n  },\n  void 0,\n  false,\n  {\n    fileName: _jsxFileName,\n    lineNumber: 1,\n    columnNumber: 9,\n  },\n  this,\n);",
  "var _jsxFileName = 'input.jsx';\nvar x = /* @__PURE__ */ React.createElement(\n  'div',\n  {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 2,\n      columnNumber: 3,\n    },\n  },\n  /* @__PURE__ */ React.createElement('span', {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 3,\n      columnNumber: 5,\n    },\n  }),\n  [\n    /* @__PURE__ */ React.createElement('span', {\n      key: '0',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 4,\n        columnNumber: 7,\n      },\n    }),\n    /* @__PURE__ */ React.createElement('span', {\n      key: '1',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 4,\n        columnNumber: 27,\n      },\n    }),\n  ],\n);",
  "var _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\nvar x = _reactJsxDevRuntime.jsxDEV(\n  'div',\n  {\n    children: [\n      _reactJsxDevRuntime.jsxDEV(\n        'span',\n        {},\n        void 0,\n        false,\n        {\n          fileName: _jsxFileName,\n          lineNumber: 3,\n          columnNumber: 5,\n        },\n        this,\n      ),\n      [\n        _reactJsxDevRuntime.jsxDEV(\n          'span',\n          {},\n          '0',\n          false,\n          {\n            fileName: _jsxFileName,\n            lineNumber: 4,\n            columnNumber: 7,\n          },\n          this,\n        ),\n        _reactJsxDevRuntime.jsxDEV(\n          'span',\n          {},\n          '1',\n          false,\n          {\n            fileName: _jsxFileName,\n            lineNumber: 4,\n            columnNumber: 27,\n          },\n          this,\n        ),\n      ],\n    ],\n  },\n  void 0,\n  true,\n  {\n    fileName: _jsxFileName,\n    lineNumber: 2,\n    columnNumber: 3,\n  },\n  this,\n);",
  "var _jsxFileName = 'input.jsx';\nvar x = /* @__PURE__ */ React.createElement(\n  React.Fragment,\n  null,\n  /* @__PURE__ */ React.createElement(\n    'div',\n    {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 3,\n        columnNumber: 5,\n      },\n    },\n    /* @__PURE__ */ React.createElement('span', {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 4,\n        columnNumber: 7,\n      },\n    }),\n    /* @__PURE__ */ React.createElement('div', {\n      key: '1',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 5,\n        columnNumber: 7,\n      },\n    }),\n    /* @__PURE__ */ React.createElement('div', {\n      key: '2',\n      meow: 'wolf',\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 6,\n        columnNumber: 7,\n      },\n    }),\n    [\n      /* @__PURE__ */ React.createElement('span', {\n        key: '0',\n        __self: this,\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 7,\n          columnNumber: 9,\n        },\n      }),\n      /* @__PURE__ */ React.createElement('span', {\n        key: '1',\n        __self: this,\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 7,\n          columnNumber: 29,\n        },\n      }),\n    ],\n  ),\n);",
  "var _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\nvar x = _reactJsxDevRuntime.jsxDEV(\n  _reactJsxDevRuntime.Fragment,\n  {\n    children: _reactJsxDevRuntime.jsxDEV(\n      'div',\n      {\n        children: [\n          _reactJsxDevRuntime.jsxDEV(\n            'span',\n            {},\n            void 0,\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 4,\n              columnNumber: 7,\n            },\n            this,\n          ),\n          _reactJsxDevRuntime.jsxDEV(\n            'div',\n            {},\n            '1',\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 5,\n              columnNumber: 7,\n            },\n            this,\n          ),\n          _reactJsxDevRuntime.jsxDEV(\n            'div',\n            { meow: 'wolf' },\n            '2',\n            false,\n            {\n              fileName: _jsxFileName,\n              lineNumber: 6,\n              columnNumber: 7,\n            },\n            this,\n          ),\n          [\n            _reactJsxDevRuntime.jsxDEV(\n              'span',\n              {},\n              '0',\n              false,\n              {\n                fileName: _jsxFileName,\n                lineNumber: 7,\n                columnNumber: 9,\n              },\n              this,\n            ),\n            _reactJsxDevRuntime.jsxDEV(\n              'span',\n              {},\n              '1',\n              false,\n              {\n                fileName: _jsxFileName,\n                lineNumber: 7,\n                columnNumber: 29,\n              },\n              this,\n            ),\n          ],\n        ],\n      },\n      void 0,\n      true,\n      {\n        fileName: _jsxFileName,\n        lineNumber: 3,\n        columnNumber: 5,\n      },\n      this,\n    ),\n  },\n  void 0,\n  false,\n);",
  "var _jsxFileName = 'input.jsx';\n/* @__PURE__ */ React.createElement('div', {\n  __self: this,\n  __source: {\n    fileName: _jsxFileName,\n    lineNumber: 1,\n    columnNumber: 1,\n  },\n});\n() =>\n  /* @__PURE__ */ React.createElement('div', {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 2,\n      columnNumber: 7,\n    },\n  });\nfunction fn() {\n  /* @__PURE__ */ React.createElement('div', {\n    __self: this,\n    __source: {\n      fileName: _jsxFileName,\n      lineNumber: 5,\n      columnNumber: 3,\n    },\n  });\n  () =>\n    /* @__PURE__ */ React.createElement('div', {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 6,\n        columnNumber: 9,\n      },\n    });\n}",
  "var _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\n_reactJsxDevRuntime.jsxDEV(\n  'div',\n  {},\n  void 0,\n  false,\n  {\n    fileName: _jsxFileName,\n    lineNumber: 1,\n    columnNumber: 1,\n  },\n  this,\n);\n() =>\n  _reactJsxDevRuntime.jsxDEV(\n    'div',\n    {},\n    void 0,\n    false,\n    {\n      fileName: _jsxFileName,\n      lineNumber: 2,\n      columnNumber: 7,\n    },\n    this,\n  );\nfunction fn() {\n  _reactJsxDevRuntime.jsxDEV(\n    'div',\n    {},\n    void 0,\n    false,\n    {\n      fileName: _jsxFileName,\n      lineNumber: 5,\n      columnNumber: 3,\n    },\n    this,\n  );\n  () =>\n    _reactJsxDevRuntime.jsxDEV(\n      'div',\n      {},\n      void 0,\n      false,\n      {\n        fileName: _jsxFileName,\n        lineNumber: 6,\n        columnNumber: 9,\n      },\n      this,\n    );\n}",
  "var _jsxFileName = 'input.jsx';\nclass A {}\nclass B extends A {\n  constructor() {\n    /* @__PURE__ */ React.createElement('sometag1', {\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 5,\n        columnNumber: 5,\n      },\n    });\n    super(\n      /* @__PURE__ */ React.createElement('sometag2', {\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 6,\n          columnNumber: 11,\n        },\n      }),\n    );\n    /* @__PURE__ */ React.createElement('sometag3', {\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 7,\n        columnNumber: 5,\n      },\n    });\n  }\n}\nclass C {\n  constructor() {\n    /* @__PURE__ */ React.createElement('sometag4', {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 13,\n        columnNumber: 5,\n      },\n    });\n    class D extends A {\n      constructor() {\n        super();\n      }\n    }\n    const E = class extends A {\n      constructor() {\n        super();\n      }\n    };\n  }\n}\nclass E extends A {\n  constructor() {\n    this.x = () =>\n      /* @__PURE__ */ React.createElement('sometag5', {\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 29,\n          columnNumber: 20,\n        },\n      });\n    this.y = function () {\n      return /* @__PURE__ */ React.createElement('sometag6', {\n        __self: this,\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 31,\n          columnNumber: 14,\n        },\n      });\n    };\n    function z() {\n      return /* @__PURE__ */ React.createElement('sometag7', {\n        __self: this,\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 34,\n          columnNumber: 14,\n        },\n      });\n    }\n    {\n      /* @__PURE__ */ React.createElement('sometag8', {\n        __source: {\n          fileName: _jsxFileName,\n          lineNumber: 36,\n          columnNumber: 7,\n        },\n      });\n    }\n    super();\n  }\n}\nclass F {\n  constructor() {\n    /* @__PURE__ */ React.createElement('sometag9', {\n      __self: this,\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 43,\n        columnNumber: 5,\n      },\n    });\n  }\n}\nclass G extends A {\n  constructor() {\n    return /* @__PURE__ */ React.createElement('sometag10', {\n      __source: {\n        fileName: _jsxFileName,\n        lineNumber: 49,\n        columnNumber: 12,\n      },\n    });\n  }\n}",
  "var _reactJsxDevRuntime = require('react/jsx-dev-runtime');\nvar _jsxFileName = 'input.jsx';\nclass A {}\nclass B extends A {\n  constructor() {\n    _reactJsxDevRuntime.jsxDEV('sometag1', {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 5,\n      columnNumber: 5,\n    });\n    super(\n      _reactJsxDevRuntime.jsxDEV('sometag2', {}, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 6,\n        columnNumber: 11,\n      }),\n    );\n    _reactJsxDevRuntime.jsxDEV('sometag3', {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 7,\n      columnNumber: 5,\n    });\n  }\n}\nclass C {\n  constructor() {\n    _reactJsxDevRuntime.jsxDEV(\n      'sometag4',\n      {},\n      void 0,\n      false,\n      {\n        fileName: _jsxFileName,\n        lineNumber: 13,\n        columnNumber: 5,\n      },\n      this,\n    );\n    class D extends A {\n      constructor() {\n        super();\n      }\n    }\n    const E = class extends A {\n      constructor() {\n        super();\n      }\n    };\n  }\n}\nclass E extends A {\n  constructor() {\n    this.x = () =>\n      _reactJsxDevRuntime.jsxDEV('sometag5', {}, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 29,\n        columnNumber: 20,\n      });\n    this.y = function () {\n      return _reactJsxDevRuntime.jsxDEV(\n        'sometag6',\n        {},\n        void 0,\n        false,\n        {\n          fileName: _jsxFileName,\n          lineNumber: 31,\n          columnNumber: 14,\n        },\n        this,\n      );\n    };\n    function z() {\n      return _reactJsxDevRuntime.jsxDEV(\n        'sometag7',\n        {},\n        void 0,\n        false,\n        {\n          fileName: _jsxFileName,\n          lineNumber: 34,\n          columnNumber: 14,\n        },\n        this,\n      );\n    }\n    {\n      _reactJsxDevRuntime.jsxDEV('sometag8', {}, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 36,\n        columnNumber: 7,\n      });\n    }\n    super();\n  }\n}\nclass F {\n  constructor() {\n    _reactJsxDevRuntime.jsxDEV(\n      'sometag9',\n      {},\n      void 0,\n      false,\n      {\n        fileName: _jsxFileName,\n        lineNumber: 43,\n        columnNumber: 5,\n      },\n      this,\n    );\n  }\n}\nclass G extends A {\n  constructor() {\n    return _reactJsxDevRuntime.jsxDEV('sometag10', {}, void 0, false, {\n      fileName: _jsxFileName,\n      lineNumber: 49,\n      columnNumber: 12,\n    });\n  }\n}",
  '[bailout] preflight:parse-error',
] as const;

export const fixtureCases = [
  {
    title: 'cross platform — auto import dev (input)',
    source:
      'var x = (\n  <>\n    <div>\n      <div key="1" />\n      <div key="2" meow="wolf" />\n      <div key="3" />\n      <div {...props} key="4" />\n    </div>\n  </>\n);\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[0],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'cross platform — classic runtime (input)',
    source:
      'var x = (\n    <>\n    <div>\n        <div key="1" />\n        <div key="2" meow="wolf" />\n        <div key="3" />\n        <div {...props} key="4" />\n    </div>\n    </>\n  );',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[2],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[3],
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
        output: expectedOutputs[4],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'cross platform — generated jsx (input)',
    source: '// empty\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[6],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'cross platform — handle fragments with key (input)',
    source: 'var x = <React.Fragment key="foo"></React.Fragment>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[7],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'cross platform — handle nonstatic children (input)',
    source: 'var x = <div>{[<span key={"0"} />, <span key={"1"} />]}</div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[9],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'cross platform — handle static children (input)',
    source:
      'var x = (\n  <div>\n    <span />\n    {[<span key={"0"} />, <span key={"1"} />]}\n  </div>\n);\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[11],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'cross platform — no source self (input)',
    source:
      'var x = (\n  <>\n    <div>\n      <span />\n      <div key="1" />\n      <div key="2" meow="wolf" />\n      {[<span key={"0"} />, <span key={"1"} />]}\n    </div>\n  </>\n);\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[13],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'cross platform — self inside arrow (input)',
    source: '<div />;\n() => <div />;\n\nfunction fn() {\n  <div />;\n  () => <div />;\n}\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[15],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'cross platform — within derived classes constructor (input)',
    source:
      'class A { }\n\nclass B extends A {\n  constructor() {\n    <sometag1 />;\n    super(<sometag2 />);\n    <sometag3 />;\n  }\n}\n\nclass C {\n  constructor() {\n    <sometag4 />;\n    class D extends A {\n      constructor() {\n        super();\n      }\n    }\n    const E = class extends A {\n      constructor() {\n        super();\n      }\n    };\n  }\n}\n\nclass E extends A {\n  constructor() {\n    this.x = () => <sometag5 />;\n    this.y = function () {\n      return <sometag6 />;\n    };\n    function z() {\n      return <sometag7 />;\n    }\n    { <sometag8 /> }\n    super();\n  }\n}\n\nclass F {\n  constructor() {\n    <sometag9 />\n  }\n}\n\nclass G extends A {\n  constructor() {\n    return <sometag10 />;\n  }\n}\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[17],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'cross platform — within ts module block (input)',
    source:
      'export namespace Namespaced {\n\texport const Component = () => (\n\t\t<div>Hello, world!</div>\n\t);\n}\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic-development',
        options: {
          jsx: 'classic-development',
        },
        output: expectedOutputs[19],
      },
      {
        title: 'automatic-development',
        options: {
          jsx: 'automatic-development',
        },
        output: expectedOutputs[19],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
