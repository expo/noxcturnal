import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "// https://github.com/babel/babel/issues/12522\nReactDOM.render(\n  /* @__PURE__ */ React.createElement('p', null, 'Hello, World!'),\n  document.getElementById('root'),\n);\n// Imports are hoisted, so this is still ok\nimport 'react-app-polyfill/ie11';\nimport 'react-app-polyfill/stable';\nimport ReactDOM from 'react-dom';",
  "import { jsx as _jsx } from 'react/jsx-runtime';\n// https://github.com/babel/babel/issues/12522\nReactDOM.render(\n  /* @__PURE__ */ _jsx('p', { children: 'Hello, World!' }),\n  document.getElementById('root'),\n);\n// Imports are hoisted, so this is still ok\nimport 'react-app-polyfill/ie11';\nimport 'react-app-polyfill/stable';\nimport ReactDOM from 'react-dom';",
  "// https://github.com/babel/babel/issues/12522\nimport 'react-app-polyfill/ie11';\nimport 'react-app-polyfill/stable';\nimport ReactDOM from 'react-dom';\nReactDOM.render(\n  /* @__PURE__ */ React.createElement('p', null, 'Hello, World!'),\n  document.getElementById('root'),\n);",
  "// https://github.com/babel/babel/issues/12522\nimport 'react-app-polyfill/ie11';\nimport 'react-app-polyfill/stable';\nimport ReactDOM from 'react-dom';\nimport { jsx as _jsx } from 'react/jsx-runtime';\nReactDOM.render(\n  /* @__PURE__ */ _jsx('p', { children: 'Hello, World!' }),\n  document.getElementById('root'),\n);",
  "// https://github.com/babel/babel/issues/12522\nrequire('react-app-polyfill/ie11');\nrequire('react-app-polyfill/stable');\nconst ReactDOM = require('react-dom');\nReactDOM.render(\n  /* @__PURE__ */ React.createElement('p', null, 'Hello, World!'),\n  document.getElementById('root'),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n// https://github.com/babel/babel/issues/12522\nrequire('react-app-polyfill/ie11');\nrequire('react-app-polyfill/stable');\nconst ReactDOM = require('react-dom');\nReactDOM.render(\n  /* @__PURE__ */ _reactJsxRuntime.jsx('p', { children: 'Hello, World!' }),\n  document.getElementById('root'),\n);",
  "function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\nvar x = /* @__PURE__ */ React.createElement(\n  React.Fragment,\n  null,\n  /* @__PURE__ */ React.createElement(\n    'div',\n    null,\n    /* @__PURE__ */ React.createElement('div', { key: '1' }),\n    /* @__PURE__ */ React.createElement('div', {\n      key: '2',\n      meow: 'wolf',\n    }),\n    /* @__PURE__ */ React.createElement('div', { key: '3' }),\n    /* @__PURE__ */ React.createElement('div', _extends({}, props, { key: '4' })),\n  ),\n);",
  "var _react = require('react');\nvar _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {\n  children: /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {\n    children: [\n      /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '1'),\n      /* @__PURE__ */ _reactJsxRuntime.jsx('div', { meow: 'wolf' }, '2'),\n      /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '3'),\n      /* @__PURE__ */ _react.createElement('div', {\n        ...props,\n        key: '4',\n      }),\n    ],\n  }),\n});",
  "const Bar = () => {\n  const Foo = () => {\n    const Component = ({ thing, ..._react }) => {\n      if (!thing) {\n        var _react2 = 'something useless';\n        var b = _react3();\n        var c = _react5();\n        var jsx = 1;\n        var _jsx = 2;\n        return /* @__PURE__ */ React.createElement('div', null);\n      }\n      return /* @__PURE__ */ React.createElement('span', null);\n    };\n  };\n};",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nconst Bar = () => {\n  const Foo = () => {\n    const Component = ({ thing, ..._react }) => {\n      if (!thing) {\n        var _react2 = 'something useless';\n        var b = _react3();\n        var c = _react5();\n        var jsx = 1;\n        var _jsx = 2;\n        return /* @__PURE__ */ _reactJsxRuntime.jsx('div', {});\n      }\n      return /* @__PURE__ */ _reactJsxRuntime.jsx('span', {});\n    };\n  };\n};",
  "/** @jsxImportSource baz */\nvar x = /* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  /* @__PURE__ */ React.createElement('span', null),\n);",
  "var _reactJsxRuntime = require('baz/jsx-runtime');\n/** @jsxImportSource baz */\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  children: /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}),\n});",
  "var foo = '<div></div>';",
  "function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\nimport * as react from 'react';\nvar y = react.createElement('div', { foo: 1 });\nvar x = /* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  /* @__PURE__ */ React.createElement('div', { key: '1' }),\n  /* @__PURE__ */ React.createElement('div', {\n    key: '2',\n    meow: 'wolf',\n  }),\n  /* @__PURE__ */ React.createElement('div', { key: '3' }),\n  /* @__PURE__ */ React.createElement('div', _extends({}, props, { key: '4' })),\n);",
  "import * as react from 'react';\nimport { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';\nimport { createElement as _createElement } from 'react';\nvar y = react.createElement('div', { foo: 1 });\nvar x = /* @__PURE__ */ _jsxs('div', {\n  children: [\n    /* @__PURE__ */ _jsx('div', {}, '1'),\n    /* @__PURE__ */ _jsx('div', { meow: 'wolf' }, '2'),\n    /* @__PURE__ */ _jsx('div', {}, '3'),\n    /* @__PURE__ */ _createElement('div', {\n      ...props,\n      key: '4',\n    }),\n  ],\n});",
  "/* @__PURE__ */ React.createElement('div', null);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', {});",
  "var x = /* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  /* @__PURE__ */ React.createElement('span', null),\n  /* @__PURE__ */ React.createElement('br', null),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {\n  children: [\n    /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}),\n    /* @__PURE__ */ _reactJsxRuntime.jsx('br', {}),\n  ],\n});",
  "function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\n/* @__PURE__ */ React.createElement(Component, _extends({}, props, { sound: 'moo' }));",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx(Component, {\n  ...props,\n  sound: 'moo',\n});",
  'var foo = function () {\n  return () => /* @__PURE__ */ React.createElement(this, null);\n};\nvar bar = function () {\n  return () => /* @__PURE__ */ React.createElement(this.foo, null);\n};',
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar foo = function () {\n  return () => /* @__PURE__ */ _reactJsxRuntime.jsx(this, {});\n};\nvar bar = function () {\n  return () => /* @__PURE__ */ _reactJsxRuntime.jsx(this.foo, {});\n};",
  "function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\nvar div = /* @__PURE__ */ React.createElement(Component, _extends({}, props, { foo: 'bar' }));",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar div = /* @__PURE__ */ _reactJsxRuntime.jsx(Component, {\n  ...props,\n  foo: 'bar',\n});",
  "{\n  /* @__PURE__ */ React.createElement(\n    'div',\n    /*i18n*/\n    { id: 'hello' },\n  );\n}\n{\n  /* @__PURE__ */ React.createElement(\n    'div',\n    null,\n    /* @__PURE__ */ React.createElement(\n      Trans,\n      /*i18n*/\n      { a: 1 },\n    ),\n  );\n}\n{\n  /* @__PURE__ */ React.createElement('div', { id: 'hello' });\n}\n{\n  /* @__PURE__ */ React.createElement(\n    'div',\n    null,\n    /* @__PURE__ */ React.createElement(Trans, { a: 1 }),\n  );\n}\n{\n  /* @__PURE__ */ React.createElement(\n    'div',\n    null,\n    /* @__PURE__ */ React.createElement(Trans, {\n      /*test1 */ a: '1',\n      /**test2 */ b: '2',\n    }),\n  );\n}\n{\n  /* @__PURE__ */ React.createElement(\n    'div',\n    null,\n    /* @__PURE__ */ React.createElement(Trans, {\n      a: 1,\n      /**test2 */ b: '2',\n    }),\n  );\n}",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n{\n  /* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: 'hello' });\n}\n{\n  /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Trans, { a: 1 }),\n  });\n}\n{\n  /* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: 'hello' });\n}\n{\n  /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Trans, { a: 1 }),\n  });\n}\n{\n  /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Trans, {\n      /*test1 */ a: '1',\n      /**test2 */ b: '2',\n    }),\n  });\n}\n{\n  /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Trans, {\n      a: 1,\n      /**test2 */ b: '2',\n    }),\n  });\n}",
  "var x = /* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  'foo',\n  'bar',\n  'baz',\n  /* @__PURE__ */ React.createElement('div', null, 'buz bang'),\n  'qux',\n  null,\n  'quack',\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {\n  children: [\n    'foo',\n    'bar',\n    'baz',\n    /* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'buz bang' }),\n    'qux',\n    null,\n    'quack',\n  ],\n});",
  "/* @__PURE__ */ React.createElement(\n  Text,\n  null,\n  'To get started, edit index.ios.js!!!',\n  '\\n',\n  'Press Cmd+R to reload',\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsxs(Text, {\n  children: ['To get started, edit index.ios.js!!!', '\\n', 'Press Cmd+R to reload'],\n});",
  "/* @__PURE__ */ React.createElement(\n  'p',\n  {\n    prop: true,\n    prop: true,\n  },\n  'text',\n);\n/* @__PURE__ */ React.createElement(\n  'p',\n  {\n    prop,\n    prop,\n  },\n  'text',\n);\n/* @__PURE__ */ React.createElement(\n  'p',\n  {\n    prop: true,\n    prop,\n  },\n  'text',\n);\n/* @__PURE__ */ React.createElement(\n  'p',\n  {\n    prop,\n    prop: true,\n  },\n  'text',\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('p', {\n  prop: true,\n  prop: true,\n  children: 'text',\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('p', {\n  prop,\n  prop,\n  children: 'text',\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('p', {\n  prop: true,\n  prop,\n  children: 'text',\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('p', {\n  prop,\n  prop: true,\n  children: 'text',\n});",
  "/* @__PURE__ */ React.createElement('p', props, 'text');\n/* @__PURE__ */ React.createElement('div', props, contents);\n/* @__PURE__ */ React.createElement('img', {\n  alt: '',\n  src,\n  title,\n  __proto__,\n});\n/* @__PURE__ */ React.createElement('blockquote', { cite }, items);\n/* @__PURE__ */ React.createElement('pre', { ['__proto__']: null });\n/* @__PURE__ */ React.createElement('code', { [__proto__]: null });",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('p', {\n  ...props,\n  children: 'text',\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  ...props,\n  children: contents,\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('img', {\n  alt: '',\n  src,\n  title,\n  __proto__,\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('blockquote', {\n  cite,\n  children: items,\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('pre', { ['__proto__']: null });\n/* @__PURE__ */ _reactJsxRuntime.jsx('code', { [__proto__]: null });",
  "import * as React from 'react';\nvar x = /* @__PURE__ */ React.createElement(React.Fragment, { key: 'foo' });",
  "import * as React from 'react';\nimport { jsx as _jsx } from 'react/jsx-runtime';\nvar x = /* @__PURE__ */ _jsx(React.Fragment, {}, 'foo');",
  'var x = /* @__PURE__ */ React.createElement(React.Fragment, null);',
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {});",
  "var x = /* @__PURE__ */ React.createElement(\n  React.Fragment,\n  null,\n  /* @__PURE__ */ React.createElement('div', null),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {\n  children: /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}),\n});",
  "var x = /* @__PURE__ */ React.createElement('div', null, [\n  /* @__PURE__ */ React.createElement('span', { key: '0' }),\n  /* @__PURE__ */ React.createElement('span', { key: '1' }),\n]);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  children: [\n    /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}, '0'),\n    /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}, '1'),\n  ],\n});",
  "function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\n/* @__PURE__ */ React.createElement('p', _extends({}, { __proto__: null }), 'text');\n/* @__PURE__ */ React.createElement('div', _extends({}, { __proto__: null }), contents);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('p', {\n  ...{ __proto__: null },\n  children: 'text',\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  ...{ __proto__: null },\n  children: contents,\n});",
  "var x = /* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  /* @__PURE__ */ React.createElement('span', null),\n  [\n    /* @__PURE__ */ React.createElement('span', { key: '0' }),\n    /* @__PURE__ */ React.createElement('span', { key: '1' }),\n  ],\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {\n  children: [\n    /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}),\n    [\n      /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}, '0'),\n      /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}, '1'),\n    ],\n  ],\n});",
  "var div = /* @__PURE__ */ React.createElement('div', null, 'test');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar div = /* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'test' });",
  "function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\nconst props = { foo: true };\nvar x = /* @__PURE__ */ React.createElement('div', _extends({}, props, { key: undefined }));",
  "var _react = require('react');\nconst props = { foo: true };\nvar x = /* @__PURE__ */ _react.createElement('div', {\n  ...props,\n  key: undefined,\n});",
  "class App extends React.Component {\n  render() {\n    const navbarHeader = /* @__PURE__ */ React.createElement(\n      'div',\n      { className: 'navbar-header' },\n      /* @__PURE__ */ React.createElement(\n        'a',\n        {\n          className: 'navbar-brand',\n          href: '/',\n        },\n        /* @__PURE__ */ React.createElement('img', { src: '/img/logo/logo-96x36.png' }),\n      ),\n    );\n    return /* @__PURE__ */ React.createElement(\n      'div',\n      null,\n      /* @__PURE__ */ React.createElement(\n        'nav',\n        { className: 'navbar navbar-default' },\n        /* @__PURE__ */ React.createElement('div', { className: 'container' }, navbarHeader),\n      ),\n    );\n  }\n}",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nclass App extends React.Component {\n  render() {\n    const navbarHeader = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n      className: 'navbar-header',\n      children: /* @__PURE__ */ _reactJsxRuntime.jsx('a', {\n        className: 'navbar-brand',\n        href: '/',\n        children: /* @__PURE__ */ _reactJsxRuntime.jsx('img', { src: '/img/logo/logo-96x36.png' }),\n      }),\n    });\n    return /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n      children: /* @__PURE__ */ _reactJsxRuntime.jsx('nav', {\n        className: 'navbar navbar-default',\n        children: /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n          className: 'container',\n          children: navbarHeader,\n        }),\n      }),\n    });\n  }\n}",
  "/* @jsxImportSource foo*/\n/* @__PURE__ */ React.createElement('div', null, 'Hi');",
  "var _reactJsxRuntime = require('foo/jsx-runtime');\n/* @jsxImportSource foo*/\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'Hi' });",
  "var es3 = /* @__PURE__ */ React.createElement(F, {\n  aaa: true,\n  new: true,\n  const: true,\n  var: true,\n  default: true,\n  'foo-bar': true,\n});",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar es3 = /* @__PURE__ */ _reactJsxRuntime.jsx(F, {\n  aaa: true,\n  new: true,\n  const: true,\n  var: true,\n  default: true,\n  'foo-bar': true,\n});",
  "/* @__PURE__ */ React.createElement(Component, { constructor: 'foo' });",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx(Component, { constructor: 'foo' });",
  '/* @__PURE__ */ React.createElement(Namespace.DeepNamespace.Component, null);',
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx(Namespace.DeepNamespace.Component, {});",
  "/* @__PURE__ */ React.createElement('div', {\n  attr: /* @__PURE__ */ React.createElement('div', null),\n});",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  attr: /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}),\n});",
  '/* @__PURE__ */ React.createElement(Namespace.Component, null);',
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx(Namespace.Component, {});",
  "/* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  /* @__PURE__ */ React.createElement(\n    React.Fragment,\n    null,\n    /* @__PURE__ */ React.createElement(\n      React.Fragment,\n      null,\n      /* @__PURE__ */ React.createElement('span', null, 'Hello'),\n      /* @__PURE__ */ React.createElement('span', null, 'world'),\n    ),\n    /* @__PURE__ */ React.createElement(\n      React.Fragment,\n      null,\n      /* @__PURE__ */ React.createElement('span', null, 'Goodbye'),\n      /* @__PURE__ */ React.createElement('span', null, 'world'),\n    ),\n  ),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  children: /* @__PURE__ */ _reactJsxRuntime.jsxs(_reactJsxRuntime.Fragment, {\n    children: [\n      /* @__PURE__ */ _reactJsxRuntime.jsxs(_reactJsxRuntime.Fragment, {\n        children: [\n          /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'Hello' }),\n          /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'world' }),\n        ],\n      }),\n      /* @__PURE__ */ _reactJsxRuntime.jsxs(_reactJsxRuntime.Fragment, {\n        children: [\n          /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'Goodbye' }),\n          /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'world' }),\n        ],\n      }),\n    ],\n  }),\n});",
  "var x = /* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  /* @__PURE__ */ React.createElement(Component, null),\n);\nvar x = /* @__PURE__ */ React.createElement('div', null, props.children);\nvar x = /* @__PURE__ */ React.createElement(Composite, null, props.children);\nvar x = /* @__PURE__ */ React.createElement(\n  Composite,\n  null,\n  /* @__PURE__ */ React.createElement(Composite2, null),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  children: /* @__PURE__ */ _reactJsxRuntime.jsx(Component, {}),\n});\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: props.children });\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx(Composite, { children: props.children });\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx(Composite, {\n  children: /* @__PURE__ */ _reactJsxRuntime.jsx(Composite2, {}),\n});",
  "var x = /* @__PURE__ */ React.createElement('div', null);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {});",
  "var x = /* @__PURE__ */ React.createElement('div', null, 'text');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'text' });",
  "/* @__PURE__ */ React.createElement('div', null, ...children);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: [...children] });",
  '[error] preflight:transform-error',
  "/* @__PURE__ */ React.createElement('div', { id: 'wôw' });\n/* @__PURE__ */ React.createElement('div', { id: '\\\\w' });\n/* @__PURE__ */ React.createElement('div', { id: 'w < w' });",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: 'wôw' });\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: '\\\\w' });\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: 'w < w' });",
  "/* @__PURE__ */ React.createElement('div', null, 'wow');\n/* @__PURE__ */ React.createElement('div', null, 'wôw');\n/* @__PURE__ */ React.createElement('div', null, 'w & w');\n/* @__PURE__ */ React.createElement('div', null, 'w & w');\n/* @__PURE__ */ React.createElement('div', null, 'w \\xA0 w');\n/* @__PURE__ */ React.createElement('div', null, 'this should not parse as unicode: \\\\u00a0');\n/* @__PURE__ */ React.createElement('div', null, 'this should parse as nbsp: \\xA0 ');\n/* @__PURE__ */ React.createElement('div', null, 'this should parse as unicode: ', '\\xA0\\xA0');\n/* @__PURE__ */ React.createElement('div', null, 'w < w');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'wow' });\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'wôw' });\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'w & w' });\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'w & w' });\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'w \\xA0 w' });\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  children: 'this should not parse as unicode: \\\\u00a0',\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'this should parse as nbsp: \\xA0 ' });\n/* @__PURE__ */ _reactJsxRuntime.jsxs('div', {\n  children: ['this should parse as unicode: ', '\\xA0\\xA0'],\n});\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'w < w' });",
  "var HelloMessage = React.createClass({\n  displayName: 'HelloMessage',\n  render: function () {\n    return /* @__PURE__ */ React.createElement('div', null, 'Hello ', this.props.name);\n  },\n});\nReact.render(\n  /* @__PURE__ */ React.createElement(HelloMessage, {\n    name: /* @__PURE__ */ React.createElement('span', null, 'Sebastian'),\n  }),\n  mountNode,\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar HelloMessage = React.createClass({\n  displayName: 'HelloMessage',\n  render: function () {\n    return /* @__PURE__ */ _reactJsxRuntime.jsxs('div', { children: ['Hello ', this.props.name] });\n  },\n});\nReact.render(\n  /* @__PURE__ */ _reactJsxRuntime.jsx(HelloMessage, {\n    name: /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'Sebastian' }),\n  }),\n  mountNode,\n);",
  "/* @__PURE__ */ React.createElement('hasOwnProperty', null, 'testing');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('hasOwnProperty', { children: 'testing' });",
  "var x = /* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  /* @__PURE__ */ React.createElement('div', null, /* @__PURE__ */ React.createElement('br', null)),\n  /* @__PURE__ */ React.createElement(\n    Component,\n    null,\n    foo,\n    /* @__PURE__ */ React.createElement('br', null),\n    bar,\n  ),\n  /* @__PURE__ */ React.createElement('br', null),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {\n  children: [\n    /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n      children: /* @__PURE__ */ _reactJsxRuntime.jsx('br', {}),\n    }),\n    /* @__PURE__ */ _reactJsxRuntime.jsxs(Component, {\n      children: [foo, /* @__PURE__ */ _reactJsxRuntime.jsx('br', {}), bar],\n    }),\n    /* @__PURE__ */ _reactJsxRuntime.jsx('br', {}),\n  ],\n});",
  "var x = /* @__PURE__ */ React.createElement('div', {\n  attr1: 'foo' + 'bar',\n  attr2: 'foo' + 'bar' + 'baz' + 'bug',\n  attr3: 'foo' + 'bar' + 'baz' + 'bug',\n  attr4: 'baz',\n});",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  attr1: 'foo' + 'bar',\n  attr2: 'foo' + 'bar' + 'baz' + 'bug',\n  attr3: 'foo' + 'bar' + 'baz' + 'bug',\n  attr4: 'baz',\n});",
  "var e = /* @__PURE__ */ React.createElement(F, {\n  aaa: true,\n  new: true,\n  const: true,\n  var: true,\n  default: true,\n  'foo-bar': true,\n});",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar e = /* @__PURE__ */ _reactJsxRuntime.jsx(F, {\n  aaa: true,\n  new: true,\n  const: true,\n  var: true,\n  default: true,\n  'foo-bar': true,\n});",
  "/* @__PURE__ */ React.createElement(\n  'button',\n  { 'data-value': 'a value\\n  with\\nnewlines\\n   and spaces' },\n  'Button',\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('button', {\n  'data-value': 'a value\\n  with\\nnewlines\\n   and spaces',\n  children: 'Button',\n});",
  "/* @__PURE__ */ React.createElement('div', null, '\\xA0 ');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: '\\xA0 ' });",
  "/* @__PURE__ */ React.createElement('div', null, '\\xA0');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: '\\xA0' });",
  "var x = /* @__PURE__ */ React.createElement(\n  'div',\n  {\n    /* a multi-line\ncomment */\n    attr1: 'foo',\n  },\n  /* @__PURE__ */ React.createElement('span', { attr2: 'bar' }),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {\n  /* a multi-line\n\tcomment */\n  attr1: 'foo',\n  children: /* @__PURE__ */ _reactJsxRuntime.jsx('span', { attr2: 'bar' }),\n});",
  "var x = /* @__PURE__ */ React.createElement(\n  'div',\n  null,\n  /* @__PURE__ */ React.createElement('div', { key: '1' }),\n  /* @__PURE__ */ React.createElement('div', {\n    key: '2',\n    meow: 'wolf',\n  }),\n  /* @__PURE__ */ React.createElement('div', { key: '3' }),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {\n  children: [\n    /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '1'),\n    /* @__PURE__ */ _reactJsxRuntime.jsx('div', { meow: 'wolf' }, '2'),\n    /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '3'),\n  ],\n});",
  "var foo = null;\nvar x = /* @__PURE__ */ React.createElement('div', foo);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar foo = null;\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', { ...foo });",
  "/* @__PURE__ */ React.createElement('button', { 'data-value': 'a value' }, 'Button');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('button', {\n  'data-value': 'a value',\n  children: 'Button',\n});",
  "/* @__PURE__ */ React.createElement('f:image', { 'n:attr': true });",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('f:image', { 'n:attr': true });",
  '/* @__PURE__ */ React.createElement(React.Fragment, null);',
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {});",
  "/* @__PURE__ */ React.createElement('font-face', null);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('font-face', {});",
  "function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\nvar x = /* @__PURE__ */ React.createElement(\n  'div',\n  _extends({}, props, {\n    key: '1',\n    foo: 'bar',\n  }),\n);",
  "var _react = require('react');\nvar x = /* @__PURE__ */ _react.createElement('div', {\n  ...props,\n  key: '1',\n  foo: 'bar',\n});",
  "function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\nvar x = /* @__PURE__ */ React.createElement('div', _extends({ key: '1' }, props, { foo: 'bar' }));",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar x = /* @__PURE__ */ _reactJsxRuntime.jsx(\n  'div',\n  {\n    ...props,\n    foo: 'bar',\n  },\n  '1',\n);",
  "var div = /* @__PURE__ */ React.createElement(this.foo, null, 'test');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nvar div = /* @__PURE__ */ _reactJsxRuntime.jsx(this.foo, { children: 'test' });",
  "class MobileHomeActivityTaskPriorityIcon extends React.PureComponent {\n  render() {\n    return /* @__PURE__ */ React.createElement(Text, null, '\\xA0', this.props.value, '\\xA0');\n  }\n}",
  "var _reactJsxRuntime = require('react/jsx-runtime');\nclass MobileHomeActivityTaskPriorityIcon extends React.PureComponent {\n  render() {\n    return /* @__PURE__ */ _reactJsxRuntime.jsxs(Text, {\n      children: ['\\xA0', this.props.value, '\\xA0'],\n    });\n  }\n}",
  'function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\n/* @__PURE__ */ React.createElement(\n  Component,\n  _extends(\n    {\n      y: 2,\n      z: true,\n    },\n    x,\n  ),\n);',
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx(Component, {\n  y: 2,\n  z: true,\n  ...x,\n});",
  'function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\n/* @__PURE__ */ React.createElement(Component, _extends({ y: 2 }, x, { z: true }));',
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx(Component, {\n  y: 2,\n  ...x,\n  z: true,\n});",
  "/** @jsx dom */\n/* @__PURE__ */ dom(Foo, null);\nvar profile = /* @__PURE__ */ dom(\n  'div',\n  null,\n  /* @__PURE__ */ dom('img', {\n    src: 'avatar.png',\n    className: 'profile',\n  }),\n  /* @__PURE__ */ dom('h3', null, [user.firstName, user.lastName].join(' ')),\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/** @jsx dom */\n/* @__PURE__ */ _reactJsxRuntime.jsx(Foo, {});\nvar profile = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {\n  children: [\n    /* @__PURE__ */ _reactJsxRuntime.jsx('img', {\n      src: 'avatar.png',\n      className: 'profile',\n    }),\n    /* @__PURE__ */ _reactJsxRuntime.jsx('h3', {\n      children: [user.firstName, user.lastName].join(' '),\n    }),\n  ],\n});",
  "/* @__PURE__ */ React.createElement(\n  'p',\n  {\n    __proto__: null,\n    class: 'bar',\n  },\n  'text',\n);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx('p', {\n  __proto__: null,\n  class: 'bar',\n  children: 'text',\n});",
  "/**\n * @jsx jsx\n */\n/* @__PURE__ */ jsx('foo', null);",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/**\n * @jsx jsx\n */\n/* @__PURE__ */ _reactJsxRuntime.jsx('foo', {});",
  "/** @jsx dom */\n/* @__PURE__ */ dom('div', null, 'no fragment is used');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/** @jsx dom */\n/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'no fragment is used' });",
  '// Make sure not to use a jsx pragma here (like "@jsx Something"), we need this to be React.createElement!\n/* @__PURE__ */ React.createElement(\'blah\', null);',
  "var _reactJsxRuntime = require('react/jsx-runtime');\n// Make sure not to use a jsx pragma here (like \"@jsx Something\"), we need this to be React.createElement!\n/* @__PURE__ */ _reactJsxRuntime.jsx('blah', {});",
  'function _extends() {\n  return (\n    (_extends = Object.assign\n      ? Object.assign.bind()\n      : function (n) {\n          for (var e = 1; e < arguments.length; e++) {\n            var t = arguments[e];\n            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);\n          }\n          return n;\n        }),\n    _extends.apply(null, arguments)\n  );\n}\n/* @__PURE__ */ React.createElement(\n  Component,\n  _extends({}, x, {\n    y: 2,\n    z: true,\n  }),\n);',
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @__PURE__ */ _reactJsxRuntime.jsx(Component, {\n  ...x,\n  y: 2,\n  z: true,\n});",
  'const foo = 2;',
  "/* @jsxFrag React.Fragment */\n/* @jsx h */\n/* @__PURE__ */ h(React.Fragment, null, 'Test');",
  "var _reactJsxRuntime = require('react/jsx-runtime');\n/* @jsxFrag React.Fragment */\n/* @jsx h */\n/* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, { children: 'Test' });",
  "import React from 'react';\nexport default function App() {\n  return /* @__PURE__ */ React.createElement(\n    'div',\n    { className: 'App' },\n    /* @__PURE__ */ React.createElement('h1', null, 'Welcome to my application!'),\n    'This is my app!',\n    /* @__PURE__ */ React.createElement('strong', null, 'MINE.'),\n  );\n}",
  "import React from 'react';\nimport { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';\nexport default function App() {\n  return /* @__PURE__ */ _jsxs('div', {\n    className: 'App',\n    children: [\n      /* @__PURE__ */ _jsx('h1', { children: 'Welcome to my application!' }),\n      'This is my app!',\n      /* @__PURE__ */ _jsx('strong', { children: 'MINE.' }),\n    ],\n  });\n}",
] as const;

export const fixtureCases = [
  {
    title: 'autoImport — after polyfills 2 (input)',
    source:
      "// https://github.com/babel/babel/issues/12522\n\nReactDOM.render(\n    <p>Hello, World!</p>,\n    document.getElementById('root')\n);\n\n// Imports are hoisted, so this is still ok\nimport 'react-app-polyfill/ie11';\nimport 'react-app-polyfill/stable';\nimport ReactDOM from 'react-dom';\n",
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[0],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'autoImport — after polyfills compiled to cjs (input)',
    source:
      "// https://github.com/babel/babel/issues/12522\n\nimport 'react-app-polyfill/ie11';\nimport 'react-app-polyfill/stable';\nimport ReactDOM from 'react-dom';\n\nReactDOM.render(\n    <p>Hello, World!</p>,\n    document.getElementById('root')\n);\n",
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[2],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'autoImport — after polyfills script not supported (input)',
    source:
      "// https://github.com/babel/babel/issues/12522\n\nrequire('react-app-polyfill/ie11');\nrequire('react-app-polyfill/stable');\nconst ReactDOM = require('react-dom');\n\nReactDOM.render(\n    <p>Hello, World!</p>,\n    document.getElementById('root')\n);\n",
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[4],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'autoImport — auto import react source type module (input)',
    source:
      'var x = (\n    <>\n    <div>\n        <div key="1" />\n        <div key="2" meow="wolf" />\n        <div key="3" />\n        <div {...props} key="4" />\n    </div>\n    </>\n);',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[6],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'autoImport — complicated scope module (input)',
    source:
      'const Bar = () => {\n    const Foo = () => {\n    const Component = ({thing, ..._react}) => {\n        if (!thing) {\n        var _react2 = "something useless";\n        var b = _react3();\n        var c = _react5();\n        var jsx = 1;\n        var _jsx = 2;\n        return <div />;\n        };\n        return <span />;\n    };\n    }\n}',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[8],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'autoImport — import source pragma (input)',
    source: '/** @jsxImportSource baz */\nvar x = (<div><span /></div>);',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[10],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title: 'autoImport — no jsx (input)',
    source: 'var foo = "<div></div>";',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[12],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title: 'autoImport — react defined (input)',
    source:
      'import * as react from "react";\nvar y = react.createElement("div", {foo: 1});\nvar x = (\n    <div>\n        <div key="1" />\n        <div key="2" meow="wolf" />\n        <div key="3" />\n        <div {...props} key="4" />\n    </div>\n);',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[13],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'pure — false default pragma automatic runtime (input)',
    source: '<div />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[15],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'react automatic — .should properly handle comments adjacent to children (input)',
    source:
      'var x = (\n  <div>\n    {/* A comment at the beginning */}\n    {/* A second comment at the beginning */}\n    <span>\n      {/* A nested comment */}\n    </span>\n    {/* A sandwiched comment */}\n    <br />\n    {/* A comment at the end */}\n    {/* A second comment at the end */}\n  </div>\n);\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[17],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'react automatic — adds appropriate newlines when using spread attribute (input)',
    source: '<Component\n  {...props}\n  sound="moo" />\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[19],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'react automatic — arrow functions (input)',
    source:
      'var foo = function () {\n  return () => <this />;\n};\n\nvar bar = function () {\n  return () => <this.foo />;\n};\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[21],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'react automatic — assignment (input)',
    source: 'var div = <Component {...props} foo="bar" />\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[23],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'react automatic — comments (input)',
    source:
      '{ <div {.../*i18n*/{ id: \'hello\' }} /> }\n{ <div><Trans {.../*i18n*/{ a: 1 }} /></div> }\n{ <div {...{ id: \'hello\' }/* comments */} /> }\n{ <div><Trans {...{ a: 1 }/* comments */} /></div> }\n\n{ <div><Trans /*test1 */a="1"/**test2 */b="2"/**test3 */ /></div> }\n{ <div><Trans {.../*test1*/{ a: 1}} /**test2 */ b = "2" /*test3 */ /></div> }\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[25],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'react automatic — concatenates adjacent string literals (input)',
    source:
      'var x =\n  <div>\n    foo\n    {"bar"}\n    baz\n    <div>\n      buz\n      bang\n    </div>\n    qux\n    {null}\n    quack\n  </div>\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[27],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'react automatic — does not add source self automatic (input)',
    source:
      'var x = (\n  <>\n  <div>\n      <div key="1" />\n      <div key="2" meow="wolf" />\n      <div key="3" />\n      <div {...props} key="4" />\n  </div>\n  </>\n);\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[6],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'react automatic — dont coerce expression containers (input)',
    source:
      '<Text>\n  To get started, edit index.ios.js!!!{"\\n"}\n  Press Cmd+R to reload\n</Text>\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[29],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'react automatic — duplicate props (input)',
    source:
      '<p prop prop>text</p>;\n\n<p {...{prop, prop}}>text</p>;\n\n<p prop {...{prop}}>text</p>;\n\n<p {...{prop}} prop>text</p>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[31],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'react automatic — flattens spread (input)',
    source:
      '<p {...props}>text</p>;\n\n<div {...props}>{contents}</div>;\n\n<img alt="" {...{src, title, __proto__}} />;\n\n<blockquote {...{cite}}>{items}</blockquote>;\n\n<pre {...{["__proto__"]: null }}></pre>;\n\n<code {...{[__proto__]: null }}></code>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[33],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'react automatic — handle fragments with key (input)',
    source:
      'import * as React from "react";\n\nvar x = <React.Fragment key="foo"></React.Fragment>;',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[35],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'react automatic — handle fragments with no children (input)',
    source: 'var x = <></>;',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[37],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'react automatic — handle fragments (input)',
    source: 'var x = <><div /></>',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[39],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'react automatic — handle nonstatic children (input)',
    source:
      "var x = (\n        <div>\n            {[<span key={'0'} />, <span key={'1'} />]}\n        </div>\n);",
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[41],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'react automatic — handle spread with proto (input)',
    source:
      '<p {...{__proto__: null}}>text</p>;\n\n<div {...{"__proto__": null}}>{contents}</div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[43],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[44],
      },
    ],
  },
  {
    title: 'react automatic — handle static children (input)',
    source:
      "var x = (\n    <div>\n        <span />\n        {[<span key={'0'} />, <span key={'1'} />]}\n    </div>\n);\n",
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[45],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[46],
      },
    ],
  },
  {
    title: 'react automatic — jsx with retainlines option (input)',
    source: 'var div = <div>test</div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[47],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[48],
      },
    ],
  },
  {
    title: 'react automatic — key undefined works (input)',
    source: 'const props = {foo: true};\nvar x = (<div {...props} key={undefined}></div>)\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[49],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[50],
      },
    ],
  },
  {
    title: 'react automatic — optimisation.react.constant elements (input)',
    source:
      'class App extends React.Component {\n  render() {\n    const navbarHeader = <div className="navbar-header">\n      <a className="navbar-brand" href="/">\n        <img src="/img/logo/logo-96x36.png" />\n      </a>\n    </div>;\n\n    return <div>\n      <nav className="navbar navbar-default">\n        <div className="container">\n          {navbarHeader}\n        </div>\n      </nav>\n    </div>;\n  }\n}\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[51],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[52],
      },
    ],
  },
  {
    title: 'react automatic — pragma works with no space at the end (input)',
    source: '/* @jsxImportSource foo*/\n<div>Hi</div>;',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[53],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[54],
      },
    ],
  },
  {
    title: 'react automatic — should add quotes es3 (input)',
    source: 'var es3 = <F aaa new const var default foo-bar/>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[55],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[56],
      },
    ],
  },
  {
    title: 'react automatic — should allow constructor as prop (input)',
    source: '<Component constructor="foo" />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[57],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[58],
      },
    ],
  },
  {
    title: 'react automatic — should allow deeper js namespacing (input)',
    source: '<Namespace.DeepNamespace.Component />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[59],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[60],
      },
    ],
  },
  {
    title: 'react automatic — should allow elements as attributes (input)',
    source: '<div attr=<div /> />\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[61],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[62],
      },
    ],
  },
  {
    title: 'react automatic — should allow js namespacing (input)',
    source: '<Namespace.Component />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[63],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[64],
      },
    ],
  },
  {
    title: 'react automatic — should allow nested fragments (input)',
    source:
      '<div>\n  <  >\n    <>\n      <span>Hello</span>\n      <span>world</span>\n    </>\n    <>\n      <span>Goodbye</span>\n      <span>world</span>\n    </>\n  </>\n</div>\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[65],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[66],
      },
    ],
  },
  {
    title: 'react automatic — should avoid wrapping in extra parens if not needed (input)',
    source:
      'var x = <div>\n  <Component />\n</div>;\n\nvar x = <div>\n  {props.children}\n</div>;\n\nvar x = <Composite>\n  {props.children}\n</Composite>;\n\nvar x = <Composite>\n  <Composite2 />\n</Composite>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[67],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[68],
      },
    ],
  },
  {
    title: 'react automatic — should convert simple tags (input)',
    source: 'var x = <div></div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[69],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[70],
      },
    ],
  },
  {
    title: 'react automatic — should convert simple text (input)',
    source: 'var x = <div>text</div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[71],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[72],
      },
    ],
  },
  {
    title: 'react automatic — should disallow spread children (input)',
    source: '<div>{...children}</div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[73],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[74],
      },
    ],
  },
  {
    title: 'react automatic — should disallow valueless key (input)',
    source: '\nvar x = [<div key></div>];\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[75],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[75],
      },
    ],
  },
  {
    title: 'react automatic — should disallow xml namespacing (input)',
    source: '<Namespace:Component />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[75],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[75],
      },
    ],
  },
  {
    title: 'react automatic — should escape xhtml jsxattribute (input)',
    source: '<div id="wôw" />;\n<div id="\\w" />;\n<div id="w &lt; w" />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[76],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[77],
      },
    ],
  },
  {
    title: 'react automatic — should escape xhtml jsxtext (input)',
    source:
      "<div>wow</div>;\n<div>wôw</div>;\n\n<div>w & w</div>;\n<div>w &amp; w</div>;\n\n<div>w &nbsp; w</div>;\n<div>this should not parse as unicode: \\u00a0</div>;\n<div>this should parse as nbsp:   </div>;\n<div>this should parse as unicode: {'\\u00a0 '}</div>;\n\n<div>w &lt; w</div>;\n",
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[78],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[79],
      },
    ],
  },
  {
    title: 'react automatic — should handle attributed elements (input)',
    source:
      'var HelloMessage = React.createClass({\n  render: function() {\n    return <div>Hello {this.props.name}</div>;\n  }\n});\n\nReact.render(<HelloMessage name={\n  <span>\n    Sebastian\n  </span>\n} />, mountNode);\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[80],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[81],
      },
    ],
  },
  {
    title: 'react automatic — should handle has own property correctly (input)',
    source: '<hasOwnProperty>testing</hasOwnProperty>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[82],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[83],
      },
    ],
  },
  {
    title: 'react automatic — should have correct comma in nested children (input)',
    source:
      'var x = <div>\n  <div><br /></div>\n  <Component>{foo}<br />{bar}</Component>\n  <br />\n</div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[84],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[85],
      },
    ],
  },
  {
    title: 'react automatic — should insert commas after expressions before whitespace (input)',
    source:
      'var x =\n  <div\n    attr1={\n      "foo" + "bar"\n    }\n    attr2={\n      "foo" + "bar" +\n\n      "baz" + "bug"\n    }\n    attr3={\n      "foo" + "bar" +\n      "baz" + "bug"\n    }\n    attr4="baz">\n  </div>\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[86],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[87],
      },
    ],
  },
  {
    title: 'react automatic — should not add quotes to identifier names (input)',
    source: 'var e = <F aaa new const var default foo-bar/>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[88],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[89],
      },
    ],
  },
  {
    title: 'react automatic — should not mangle expressioncontainer attribute values (input)',
    source: '<button data-value={"a value\\n  with\\nnewlines\\n   and spaces"}>Button</button>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[90],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[91],
      },
    ],
  },
  {
    title: 'react automatic — should not strip nbsp even coupled with other whitespace (input)',
    source: '<div>&nbsp; </div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[92],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[93],
      },
    ],
  },
  {
    title: 'react automatic — should not strip tags with a single child of nbsp (input)',
    source: '<div>&nbsp;</div>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[94],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[95],
      },
    ],
  },
  {
    title: 'react automatic — should properly handle comments between props (input)',
    source:
      'var x = (\n  <div\n    /* a multi-line\n       comment */\n    attr1="foo">\n    <span // a double-slash comment\n      attr2="bar"\n    />\n  </div>\n);\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[96],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[97],
      },
    ],
  },
  {
    title: 'react automatic — should properly handle keys (input)',
    source:
      'var x = (\n    <div>\n        <div key="1" />\n        <div key="2" meow="wolf" />\n        <div key="3" />\n    </div>\n);',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[98],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[99],
      },
    ],
  },
  {
    title: 'react automatic — should properly handle null prop spread (input)',
    source: 'var foo = null;\nvar x = <div {...foo} />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[100],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[101],
      },
    ],
  },
  {
    title: 'react automatic — should quote jsx attributes (input)',
    source: "<button data-value='a value'>Button</button>;\n",
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[102],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[103],
      },
    ],
  },
  {
    title: 'react automatic — should support xml namespaces if flag (input)',
    source: '<f:image n:attr />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
          jsxThrowIfNamespace: false,
        },
        output: expectedOutputs[104],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
          jsxThrowIfNamespace: false,
        },
        output: expectedOutputs[105],
      },
    ],
  },
  {
    title: 'react automatic — should throw error namespaces if not flag (input)',
    source: '<f:image />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[75],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[75],
      },
    ],
  },
  {
    title: 'react automatic — should throw when filter is specified (input)',
    source: '<></>\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[106],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[107],
      },
    ],
  },
  {
    title: 'react automatic — should transform known hyphenated tags (input)',
    source: '<font-face />;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[108],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[109],
      },
    ],
  },
  {
    title: 'react automatic — should use createElement when key comes after spread (input)',
    source: 'var x = (\n    <div {...props} key="1" foo="bar" />\n);',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[110],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[111],
      },
    ],
  },
  {
    title: 'react automatic — should use jsx when key comes before spread (input)',
    source: 'var x = (\n    <div key="1" {...props} foo="bar" />\n);',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[112],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[113],
      },
    ],
  },
  {
    title: 'react automatic — this tag name (input)',
    source: 'var div = <this.foo>test</this.foo>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[114],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[115],
      },
    ],
  },
  {
    title: 'react automatic — weird symbols (input)',
    source:
      'class MobileHomeActivityTaskPriorityIcon extends React.PureComponent {\n  render() {\n    return <Text>&nbsp;{this.props.value}&nbsp;</Text>;\n  }\n}\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[116],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[117],
      },
    ],
  },
  {
    title: 'react automatic — wraps props in react spread for last spread attributes (input)',
    source: '<Component y={2} z { ... x } />\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[118],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[119],
      },
    ],
  },
  {
    title: 'react automatic — wraps props in react spread for middle spread attributes (input)',
    source: '<Component y={2} { ... x } z />\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[120],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[121],
      },
    ],
  },
  {
    title: 'react — honor custom jsx comment if jsx pragma option set (input)',
    source:
      '/** @jsx dom */\n\n<Foo></Foo>;\n\nvar profile = <div>\n  <img src="avatar.png" className="profile" />\n  <h3>{[user.firstName, user.lastName].join(" ")}</h3>\n</div>;',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[122],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[123],
      },
    ],
  },
  {
    title: 'react — proto in jsx attribute (input)',
    source: '<p __proto__={null} class="bar">text</p>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[124],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[125],
      },
    ],
  },
  {
    title: 'react — should allow jsx docs comment with pragma (input)',
    source: '/**\n * @jsx jsx\n */\n\n<foo />',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[126],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[127],
      },
    ],
  },
  {
    title: 'react — should allow no pragmafrag if frag unused (input)',
    source: '/** @jsx dom */\n\n<div>no fragment is used</div>\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[128],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[129],
      },
    ],
  },
  {
    title: 'react — should not allow jsx pragma to be anywhere in comment (input)',
    source:
      '// Make sure not to use a jsx pragma here (like "@jsx Something"), we need this to be React.createElement!\n<blah/>\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[130],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[131],
      },
    ],
  },
  {
    title: 'react — wraps props in react spread for first spread attributes (input)',
    source: '<Component { ... x } y\n={2 } z />\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[132],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[133],
      },
    ],
  },
  {
    title: 'regression — issue 12478 automatic (input)',
    source: 'const foo = 2;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[134],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[134],
      },
    ],
  },
  {
    title: 'regression — pragma frag set default classic runtime (input)',
    source: '/* @jsxFrag React.Fragment */\n/* @jsx h */\n<>Test</>;\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[135],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[136],
      },
    ],
  },
  {
    title: 'sourcemaps — JSXText (input)',
    source:
      'import React from \'react\';\n\nexport default function App() {\n  return (\n    <div className="App">\n      <h1>Welcome to my application!</h1>\n      This is my app!\n      <strong>MINE.</strong>\n    </div>\n  )\n}\n',
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: expectedOutputs[137],
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: expectedOutputs[138],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
