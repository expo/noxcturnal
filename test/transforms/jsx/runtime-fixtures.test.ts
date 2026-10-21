import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'autoImport — after polyfills 2 (input)',
    source: `// https://github.com/babel/babel/issues/12522

ReactDOM.render(
    <p>Hello, World!</p>,
    document.getElementById('root')
);

// Imports are hoisted, so this is still ok
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `// https://github.com/babel/babel/issues/12522
ReactDOM.render(
  /* @__PURE__ */ React.createElement('p', null, 'Hello, World!'),
  document.getElementById('root'),
);
// Imports are hoisted, so this is still ok
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `import { jsx as _jsx } from 'react/jsx-runtime';
// https://github.com/babel/babel/issues/12522
ReactDOM.render(
  /* @__PURE__ */ _jsx('p', { children: 'Hello, World!' }),
  document.getElementById('root'),
);
// Imports are hoisted, so this is still ok
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';`,
      },
    ],
  },
  {
    title: 'autoImport — after polyfills compiled to cjs (input)',
    source: `// https://github.com/babel/babel/issues/12522

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';

ReactDOM.render(
    <p>Hello, World!</p>,
    document.getElementById('root')
);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `// https://github.com/babel/babel/issues/12522
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';
ReactDOM.render(
  /* @__PURE__ */ React.createElement('p', null, 'Hello, World!'),
  document.getElementById('root'),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `// https://github.com/babel/babel/issues/12522
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';
import { jsx as _jsx } from 'react/jsx-runtime';
ReactDOM.render(
  /* @__PURE__ */ _jsx('p', { children: 'Hello, World!' }),
  document.getElementById('root'),
);`,
      },
    ],
  },
  {
    title: 'autoImport — after polyfills script not supported (input)',
    source: `// https://github.com/babel/babel/issues/12522

require('react-app-polyfill/ie11');
require('react-app-polyfill/stable');
const ReactDOM = require('react-dom');

ReactDOM.render(
    <p>Hello, World!</p>,
    document.getElementById('root')
);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `// https://github.com/babel/babel/issues/12522
require('react-app-polyfill/ie11');
require('react-app-polyfill/stable');
const ReactDOM = require('react-dom');
ReactDOM.render(
  /* @__PURE__ */ React.createElement('p', null, 'Hello, World!'),
  document.getElementById('root'),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
// https://github.com/babel/babel/issues/12522
require('react-app-polyfill/ie11');
require('react-app-polyfill/stable');
const ReactDOM = require('react-dom');
ReactDOM.render(
  /* @__PURE__ */ _reactJsxRuntime.jsx('p', { children: 'Hello, World!' }),
  document.getElementById('root'),
);`,
      },
    ],
  },
  {
    title: 'autoImport — auto import react source type module (input)',
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
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
    null,
    /* @__PURE__ */ React.createElement('div', { key: '1' }),
    /* @__PURE__ */ React.createElement('div', {
      key: '2',
      meow: 'wolf',
    }),
    /* @__PURE__ */ React.createElement('div', { key: '3' }),
    /* @__PURE__ */ React.createElement('div', _extends({}, props, { key: '4' })),
  ),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _react = require('react');
var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {
  children: /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {
    children: [
      /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '1'),
      /* @__PURE__ */ _reactJsxRuntime.jsx('div', { meow: 'wolf' }, '2'),
      /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '3'),
      /* @__PURE__ */ _react.createElement('div', {
        ...props,
        key: '4',
      }),
    ],
  }),
});`,
      },
    ],
  },
  {
    title: 'autoImport — complicated scope module (input)',
    source: `const Bar = () => {
    const Foo = () => {
    const Component = ({thing, ..._react}) => {
        if (!thing) {
        var _react2 = "something useless";
        var b = _react3();
        var c = _react5();
        var jsx = 1;
        var _jsx = 2;
        return <div />;
        };
        return <span />;
    };
    }
}`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `const Bar = () => {
  const Foo = () => {
    const Component = ({ thing, ..._react }) => {
      if (!thing) {
        var _react2 = 'something useless';
        var b = _react3();
        var c = _react5();
        var jsx = 1;
        var _jsx = 2;
        return /* @__PURE__ */ React.createElement('div', null);
      }
      return /* @__PURE__ */ React.createElement('span', null);
    };
  };
};`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
const Bar = () => {
  const Foo = () => {
    const Component = ({ thing, ..._react }) => {
      if (!thing) {
        var _react2 = 'something useless';
        var b = _react3();
        var c = _react5();
        var jsx = 1;
        var _jsx = 2;
        return /* @__PURE__ */ _reactJsxRuntime.jsx('div', {});
      }
      return /* @__PURE__ */ _reactJsxRuntime.jsx('span', {});
    };
  };
};`,
      },
    ],
  },
  {
    title: 'autoImport — import source pragma (input)',
    source: `/** @jsxImportSource baz */
var x = (<div><span /></div>);`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: '[error] preflight:transform-error',
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('baz/jsx-runtime');
/** @jsxImportSource baz */
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  children: /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}),
});`,
      },
    ],
  },
  {
    title: 'autoImport — no jsx (input)',
    source: 'var foo = "<div></div>";',
    filename: 'input.jsx',
    output: "var foo = '<div></div>';",
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
      },
    ],
  },
  {
    title: 'autoImport — react defined (input)',
    source: `import * as react from "react";
var y = react.createElement("div", {foo: 1});
var x = (
    <div>
        <div key="1" />
        <div key="2" meow="wolf" />
        <div key="3" />
        <div {...props} key="4" />
    </div>
);`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
import * as react from 'react';
var y = react.createElement('div', { foo: 1 });
var x = /* @__PURE__ */ React.createElement(
  'div',
  null,
  /* @__PURE__ */ React.createElement('div', { key: '1' }),
  /* @__PURE__ */ React.createElement('div', {
    key: '2',
    meow: 'wolf',
  }),
  /* @__PURE__ */ React.createElement('div', { key: '3' }),
  /* @__PURE__ */ React.createElement('div', _extends({}, props, { key: '4' })),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `import * as react from 'react';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { createElement as _createElement } from 'react';
var y = react.createElement('div', { foo: 1 });
var x = /* @__PURE__ */ _jsxs('div', {
  children: [
    /* @__PURE__ */ _jsx('div', {}, '1'),
    /* @__PURE__ */ _jsx('div', { meow: 'wolf' }, '2'),
    /* @__PURE__ */ _jsx('div', {}, '3'),
    /* @__PURE__ */ _createElement('div', {
      ...props,
      key: '4',
    }),
  ],
});`,
      },
    ],
  },
  {
    title: 'pure — false default pragma automatic runtime (input)',
    source: `<div />;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "/* @__PURE__ */ React.createElement('div', null);",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('div', {});`,
      },
    ],
  },
  {
    title: 'react automatic — .should properly handle comments adjacent to children (input)',
    source: `var x = (
  <div>
    {/* A comment at the beginning */}
    {/* A second comment at the beginning */}
    <span>
      {/* A nested comment */}
    </span>
    {/* A sandwiched comment */}
    <br />
    {/* A comment at the end */}
    {/* A second comment at the end */}
  </div>
);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement(
  'div',
  null,
  /* @__PURE__ */ React.createElement('span', null),
  /* @__PURE__ */ React.createElement('br', null),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {
  children: [
    /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}),
    /* @__PURE__ */ _reactJsxRuntime.jsx('br', {}),
  ],
});`,
      },
    ],
  },
  {
    title: 'react automatic — adds appropriate newlines when using spread attribute (input)',
    source: `<Component
  {...props}
  sound="moo" />
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
/* @__PURE__ */ React.createElement(Component, _extends({}, props, { sound: 'moo' }));`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx(Component, {
  ...props,
  sound: 'moo',
});`,
      },
    ],
  },
  {
    title: 'react automatic — arrow functions (input)',
    source: `var foo = function () {
  return () => <this />;
};

var bar = function () {
  return () => <this.foo />;
};
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var foo = function () {
  return () => /* @__PURE__ */ React.createElement(this, null);
};
var bar = function () {
  return () => /* @__PURE__ */ React.createElement(this.foo, null);
};`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var foo = function () {
  return () => /* @__PURE__ */ _reactJsxRuntime.jsx(this, {});
};
var bar = function () {
  return () => /* @__PURE__ */ _reactJsxRuntime.jsx(this.foo, {});
};`,
      },
    ],
  },
  {
    title: 'react automatic — assignment (input)',
    source: `var div = <Component {...props} foo="bar" />
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
var div = /* @__PURE__ */ React.createElement(Component, _extends({}, props, { foo: 'bar' }));`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var div = /* @__PURE__ */ _reactJsxRuntime.jsx(Component, {
  ...props,
  foo: 'bar',
});`,
      },
    ],
  },
  {
    title: 'react automatic — comments (input)',
    source: `{ <div {.../*i18n*/{ id: 'hello' }} /> }
{ <div><Trans {.../*i18n*/{ a: 1 }} /></div> }
{ <div {...{ id: 'hello' }/* comments */} /> }
{ <div><Trans {...{ a: 1 }/* comments */} /></div> }

{ <div><Trans /*test1 */a="1"/**test2 */b="2"/**test3 */ /></div> }
{ <div><Trans {.../*test1*/{ a: 1}} /**test2 */ b = "2" /*test3 */ /></div> }
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `{
  /* @__PURE__ */ React.createElement(
    'div',
    /*i18n*/
    { id: 'hello' },
  );
}
{
  /* @__PURE__ */ React.createElement(
    'div',
    null,
    /* @__PURE__ */ React.createElement(
      Trans,
      /*i18n*/
      { a: 1 },
    ),
  );
}
{
  /* @__PURE__ */ React.createElement('div', { id: 'hello' });
}
{
  /* @__PURE__ */ React.createElement(
    'div',
    null,
    /* @__PURE__ */ React.createElement(Trans, { a: 1 }),
  );
}
{
  /* @__PURE__ */ React.createElement(
    'div',
    null,
    /* @__PURE__ */ React.createElement(Trans, {
      /*test1 */ a: '1',
      /**test2 */ b: '2',
    }),
  );
}
{
  /* @__PURE__ */ React.createElement(
    'div',
    null,
    /* @__PURE__ */ React.createElement(Trans, {
      a: 1,
      /**test2 */ b: '2',
    }),
  );
}`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
{
  /* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: 'hello' });
}
{
  /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Trans, { a: 1 }),
  });
}
{
  /* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: 'hello' });
}
{
  /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Trans, { a: 1 }),
  });
}
{
  /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Trans, {
      /*test1 */ a: '1',
      /**test2 */ b: '2',
    }),
  });
}
{
  /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Trans, {
      a: 1,
      /**test2 */ b: '2',
    }),
  });
}`,
      },
    ],
  },
  {
    title: 'react automatic — concatenates adjacent string literals (input)',
    source: `var x =
  <div>
    foo
    {"bar"}
    baz
    <div>
      buz
      bang
    </div>
    qux
    {null}
    quack
  </div>
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement(
  'div',
  null,
  'foo',
  'bar',
  'baz',
  /* @__PURE__ */ React.createElement('div', null, 'buz bang'),
  'qux',
  null,
  'quack',
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {
  children: [
    'foo',
    'bar',
    'baz',
    /* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'buz bang' }),
    'qux',
    null,
    'quack',
  ],
});`,
      },
    ],
  },
  {
    title: 'react automatic — does not add source self automatic (input)',
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
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
    null,
    /* @__PURE__ */ React.createElement('div', { key: '1' }),
    /* @__PURE__ */ React.createElement('div', {
      key: '2',
      meow: 'wolf',
    }),
    /* @__PURE__ */ React.createElement('div', { key: '3' }),
    /* @__PURE__ */ React.createElement('div', _extends({}, props, { key: '4' })),
  ),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _react = require('react');
var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {
  children: /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {
    children: [
      /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '1'),
      /* @__PURE__ */ _reactJsxRuntime.jsx('div', { meow: 'wolf' }, '2'),
      /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '3'),
      /* @__PURE__ */ _react.createElement('div', {
        ...props,
        key: '4',
      }),
    ],
  }),
});`,
      },
    ],
  },
  {
    title: 'react automatic — dont coerce expression containers (input)',
    source: `<Text>
  To get started, edit index.ios.js!!!{"\\n"}
  Press Cmd+R to reload
</Text>
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement(
  Text,
  null,
  'To get started, edit index.ios.js!!!',
  '\\n',
  'Press Cmd+R to reload',
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsxs(Text, {
  children: ['To get started, edit index.ios.js!!!', '\\n', 'Press Cmd+R to reload'],
});`,
      },
    ],
  },
  {
    title: 'react automatic — duplicate props (input)',
    source: `<p prop prop>text</p>;

<p {...{prop, prop}}>text</p>;

<p prop {...{prop}}>text</p>;

<p {...{prop}} prop>text</p>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement(
  'p',
  {
    prop: true,
    prop: true,
  },
  'text',
);
/* @__PURE__ */ React.createElement(
  'p',
  {
    prop,
    prop,
  },
  'text',
);
/* @__PURE__ */ React.createElement(
  'p',
  {
    prop: true,
    prop,
  },
  'text',
);
/* @__PURE__ */ React.createElement(
  'p',
  {
    prop,
    prop: true,
  },
  'text',
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('p', {
  prop: true,
  prop: true,
  children: 'text',
});
/* @__PURE__ */ _reactJsxRuntime.jsx('p', {
  prop,
  prop,
  children: 'text',
});
/* @__PURE__ */ _reactJsxRuntime.jsx('p', {
  prop: true,
  prop,
  children: 'text',
});
/* @__PURE__ */ _reactJsxRuntime.jsx('p', {
  prop,
  prop: true,
  children: 'text',
});`,
      },
    ],
  },
  {
    title: 'react automatic — flattens spread (input)',
    source: `<p {...props}>text</p>;

<div {...props}>{contents}</div>;

<img alt="" {...{src, title, __proto__}} />;

<blockquote {...{cite}}>{items}</blockquote>;

<pre {...{["__proto__"]: null }}></pre>;

<code {...{[__proto__]: null }}></code>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement('p', props, 'text');
/* @__PURE__ */ React.createElement('div', props, contents);
/* @__PURE__ */ React.createElement('img', {
  alt: '',
  src,
  title,
  __proto__,
});
/* @__PURE__ */ React.createElement('blockquote', { cite }, items);
/* @__PURE__ */ React.createElement('pre', { ['__proto__']: null });
/* @__PURE__ */ React.createElement('code', { [__proto__]: null });`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('p', {
  ...props,
  children: 'text',
});
/* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  ...props,
  children: contents,
});
/* @__PURE__ */ _reactJsxRuntime.jsx('img', {
  alt: '',
  src,
  title,
  __proto__,
});
/* @__PURE__ */ _reactJsxRuntime.jsx('blockquote', {
  cite,
  children: items,
});
/* @__PURE__ */ _reactJsxRuntime.jsx('pre', { ['__proto__']: null });
/* @__PURE__ */ _reactJsxRuntime.jsx('code', { [__proto__]: null });`,
      },
    ],
  },
  {
    title: 'react automatic — handle fragments with key (input)',
    source: `import * as React from "react";

var x = <React.Fragment key="foo"></React.Fragment>;`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `import * as React from 'react';
var x = /* @__PURE__ */ React.createElement(React.Fragment, { key: 'foo' });`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `import * as React from 'react';
import { jsx as _jsx } from 'react/jsx-runtime';
var x = /* @__PURE__ */ _jsx(React.Fragment, {}, 'foo');`,
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
        output: 'var x = /* @__PURE__ */ React.createElement(React.Fragment, null);',
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {});`,
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
        output: `var x = /* @__PURE__ */ React.createElement(
  React.Fragment,
  null,
  /* @__PURE__ */ React.createElement('div', null),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {
  children: /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}),
});`,
      },
    ],
  },
  {
    title: 'react automatic — handle nonstatic children (input)',
    source: `var x = (
        <div>
            {[<span key={'0'} />, <span key={'1'} />]}
        </div>
);`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement('div', null, [
  /* @__PURE__ */ React.createElement('span', { key: '0' }),
  /* @__PURE__ */ React.createElement('span', { key: '1' }),
]);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  children: [
    /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}, '0'),
    /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}, '1'),
  ],
});`,
      },
    ],
  },
  {
    title: 'react automatic — handle spread with proto (input)',
    source: `<p {...{__proto__: null}}>text</p>;

<div {...{"__proto__": null}}>{contents}</div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement('p', { __proto__: null }, 'text');
/* @__PURE__ */ React.createElement('div', { __proto__: null }, contents);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('p', {
  ...{ __proto__: null },
  children: 'text',
});
/* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  ...{ __proto__: null },
  children: contents,
});`,
      },
    ],
  },
  {
    title: 'react automatic — handle static children (input)',
    source: `var x = (
    <div>
        <span />
        {[<span key={'0'} />, <span key={'1'} />]}
    </div>
);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement(
  'div',
  null,
  /* @__PURE__ */ React.createElement('span', null),
  [
    /* @__PURE__ */ React.createElement('span', { key: '0' }),
    /* @__PURE__ */ React.createElement('span', { key: '1' }),
  ],
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {
  children: [
    /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}),
    [
      /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}, '0'),
      /* @__PURE__ */ _reactJsxRuntime.jsx('span', {}, '1'),
    ],
  ],
});`,
      },
    ],
  },
  {
    title: 'react automatic — jsx with retainlines option (input)',
    source: `var div = <div>test</div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "var div = /* @__PURE__ */ React.createElement('div', null, 'test');",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var div = /* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'test' });`,
      },
    ],
  },
  {
    title: 'react automatic — key undefined works (input)',
    source: `const props = {foo: true};
var x = (<div {...props} key={undefined}></div>)
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
const props = { foo: true };
var x = /* @__PURE__ */ React.createElement('div', _extends({}, props, { key: undefined }));`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _react = require('react');
const props = { foo: true };
var x = /* @__PURE__ */ _react.createElement('div', {
  ...props,
  key: undefined,
});`,
      },
    ],
  },
  {
    title: 'react automatic — optimisation.react.constant elements (input)',
    source: `class App extends React.Component {
  render() {
    const navbarHeader = <div className="navbar-header">
      <a className="navbar-brand" href="/">
        <img src="/img/logo/logo-96x36.png" />
      </a>
    </div>;

    return <div>
      <nav className="navbar navbar-default">
        <div className="container">
          {navbarHeader}
        </div>
      </nav>
    </div>;
  }
}
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `class App extends React.Component {
  render() {
    const navbarHeader = /* @__PURE__ */ React.createElement(
      'div',
      { className: 'navbar-header' },
      /* @__PURE__ */ React.createElement(
        'a',
        {
          className: 'navbar-brand',
          href: '/',
        },
        /* @__PURE__ */ React.createElement('img', { src: '/img/logo/logo-96x36.png' }),
      ),
    );
    return /* @__PURE__ */ React.createElement(
      'div',
      null,
      /* @__PURE__ */ React.createElement(
        'nav',
        { className: 'navbar navbar-default' },
        /* @__PURE__ */ React.createElement('div', { className: 'container' }, navbarHeader),
      ),
    );
  }
}`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
class App extends React.Component {
  render() {
    const navbarHeader = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
      className: 'navbar-header',
      children: /* @__PURE__ */ _reactJsxRuntime.jsx('a', {
        className: 'navbar-brand',
        href: '/',
        children: /* @__PURE__ */ _reactJsxRuntime.jsx('img', { src: '/img/logo/logo-96x36.png' }),
      }),
    });
    return /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
      children: /* @__PURE__ */ _reactJsxRuntime.jsx('nav', {
        className: 'navbar navbar-default',
        children: /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
          className: 'container',
          children: navbarHeader,
        }),
      }),
    });
  }
}`,
      },
    ],
  },
  {
    title: 'react automatic — pragma works with no space at the end (input)',
    source: `/* @jsxImportSource foo*/
<div>Hi</div>;`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: '[error] preflight:transform-error',
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('foo/jsx-runtime');
/* @jsxImportSource foo*/
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'Hi' });`,
      },
    ],
  },
  {
    title: 'react automatic — should add quotes es3 (input)',
    source: `var es3 = <F aaa new const var default foo-bar/>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var es3 = /* @__PURE__ */ React.createElement(F, {
  aaa: true,
  new: true,
  const: true,
  var: true,
  default: true,
  'foo-bar': true,
});`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var es3 = /* @__PURE__ */ _reactJsxRuntime.jsx(F, {
  aaa: true,
  new: true,
  const: true,
  var: true,
  default: true,
  'foo-bar': true,
});`,
      },
    ],
  },
  {
    title: 'react automatic — should allow constructor as prop (input)',
    source: `<Component constructor="foo" />;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "/* @__PURE__ */ React.createElement(Component, { constructor: 'foo' });",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx(Component, { constructor: 'foo' });`,
      },
    ],
  },
  {
    title: 'react automatic — should allow deeper js namespacing (input)',
    source: `<Namespace.DeepNamespace.Component />;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: '/* @__PURE__ */ React.createElement(Namespace.DeepNamespace.Component, null);',
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx(Namespace.DeepNamespace.Component, {});`,
      },
    ],
  },
  {
    title: 'react automatic — should allow elements as attributes (input)',
    source: `<div attr=<div /> />
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement('div', {
  attr: /* @__PURE__ */ React.createElement('div', null),
});`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  attr: /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}),
});`,
      },
    ],
  },
  {
    title: 'react automatic — should allow js namespacing (input)',
    source: `<Namespace.Component />;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: '/* @__PURE__ */ React.createElement(Namespace.Component, null);',
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx(Namespace.Component, {});`,
      },
    ],
  },
  {
    title: 'react automatic — should allow nested fragments (input)',
    source: `<div>
  <  >
    <>
      <span>Hello</span>
      <span>world</span>
    </>
    <>
      <span>Goodbye</span>
      <span>world</span>
    </>
  </>
</div>
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement(
  'div',
  null,
  /* @__PURE__ */ React.createElement(
    React.Fragment,
    null,
    /* @__PURE__ */ React.createElement(
      React.Fragment,
      null,
      /* @__PURE__ */ React.createElement('span', null, 'Hello'),
      /* @__PURE__ */ React.createElement('span', null, 'world'),
    ),
    /* @__PURE__ */ React.createElement(
      React.Fragment,
      null,
      /* @__PURE__ */ React.createElement('span', null, 'Goodbye'),
      /* @__PURE__ */ React.createElement('span', null, 'world'),
    ),
  ),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  children: /* @__PURE__ */ _reactJsxRuntime.jsxs(_reactJsxRuntime.Fragment, {
    children: [
      /* @__PURE__ */ _reactJsxRuntime.jsxs(_reactJsxRuntime.Fragment, {
        children: [
          /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'Hello' }),
          /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'world' }),
        ],
      }),
      /* @__PURE__ */ _reactJsxRuntime.jsxs(_reactJsxRuntime.Fragment, {
        children: [
          /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'Goodbye' }),
          /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'world' }),
        ],
      }),
    ],
  }),
});`,
      },
    ],
  },
  {
    title: 'react automatic — should avoid wrapping in extra parens if not needed (input)',
    source: `var x = <div>
  <Component />
</div>;

var x = <div>
  {props.children}
</div>;

var x = <Composite>
  {props.children}
</Composite>;

var x = <Composite>
  <Composite2 />
</Composite>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement(
  'div',
  null,
  /* @__PURE__ */ React.createElement(Component, null),
);
var x = /* @__PURE__ */ React.createElement('div', null, props.children);
var x = /* @__PURE__ */ React.createElement(Composite, null, props.children);
var x = /* @__PURE__ */ React.createElement(
  Composite,
  null,
  /* @__PURE__ */ React.createElement(Composite2, null),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  children: /* @__PURE__ */ _reactJsxRuntime.jsx(Component, {}),
});
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: props.children });
var x = /* @__PURE__ */ _reactJsxRuntime.jsx(Composite, { children: props.children });
var x = /* @__PURE__ */ _reactJsxRuntime.jsx(Composite, {
  children: /* @__PURE__ */ _reactJsxRuntime.jsx(Composite2, {}),
});`,
      },
    ],
  },
  {
    title: 'react automatic — should convert simple tags (input)',
    source: `var x = <div></div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "var x = /* @__PURE__ */ React.createElement('div', null);",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {});`,
      },
    ],
  },
  {
    title: 'react automatic — should convert simple text (input)',
    source: `var x = <div>text</div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "var x = /* @__PURE__ */ React.createElement('div', null, 'text');",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'text' });`,
      },
    ],
  },
  {
    title: 'react automatic — should disallow spread children (input)',
    source: `<div>{...children}</div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "/* @__PURE__ */ React.createElement('div', null, ...children);",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: [...children] });`,
      },
    ],
  },
  {
    title: 'react automatic — should disallow valueless key (input)',
    source: `
var x = [<div key></div>];
`,
    filename: 'input.jsx',
    output: '[error] preflight:transform-error',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
      },
    ],
  },
  {
    title: 'react automatic — should disallow xml namespacing (input)',
    source: `<Namespace:Component />;
`,
    filename: 'input.jsx',
    output: '[error] preflight:transform-error',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
      },
    ],
  },
  {
    title: 'react automatic — should escape xhtml jsxattribute (input)',
    source: `<div id="wôw" />;
<div id="\\w" />;
<div id="w &lt; w" />;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement('div', { id: 'wôw' });
/* @__PURE__ */ React.createElement('div', { id: '\\\\w' });
/* @__PURE__ */ React.createElement('div', { id: 'w < w' });`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: 'wôw' });
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: '\\\\w' });
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { id: 'w < w' });`,
      },
    ],
  },
  {
    title: 'react automatic — should escape xhtml jsxtext (input)',
    source: `<div>wow</div>;
<div>wôw</div>;

<div>w & w</div>;
<div>w &amp; w</div>;

<div>w &nbsp; w</div>;
<div>this should not parse as unicode: \\u00a0</div>;
<div>this should parse as nbsp:   </div>;
<div>this should parse as unicode: {'\\u00a0 '}</div>;

<div>w &lt; w</div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement('div', null, 'wow');
/* @__PURE__ */ React.createElement('div', null, 'wôw');
/* @__PURE__ */ React.createElement('div', null, 'w & w');
/* @__PURE__ */ React.createElement('div', null, 'w & w');
/* @__PURE__ */ React.createElement('div', null, 'w \\xA0 w');
/* @__PURE__ */ React.createElement('div', null, 'this should not parse as unicode: \\\\u00a0');
/* @__PURE__ */ React.createElement('div', null, 'this should parse as nbsp: \\xA0 ');
/* @__PURE__ */ React.createElement('div', null, 'this should parse as unicode: ', '\\xA0\\xA0');
/* @__PURE__ */ React.createElement('div', null, 'w < w');`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'wow' });
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'wôw' });
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'w & w' });
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'w & w' });
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'w \\xA0 w' });
/* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  children: 'this should not parse as unicode: \\\\u00a0',
});
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'this should parse as nbsp: \\xA0 ' });
/* @__PURE__ */ _reactJsxRuntime.jsxs('div', {
  children: ['this should parse as unicode: ', '\\xA0\\xA0'],
});
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: 'w < w' });`,
      },
    ],
  },
  {
    title: 'react automatic — should handle attributed elements (input)',
    source: `var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

React.render(<HelloMessage name={
  <span>
    Sebastian
  </span>
} />, mountNode);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var HelloMessage = React.createClass({
  displayName: 'HelloMessage',
  render: function () {
    return /* @__PURE__ */ React.createElement('div', null, 'Hello ', this.props.name);
  },
});
React.render(
  /* @__PURE__ */ React.createElement(HelloMessage, {
    name: /* @__PURE__ */ React.createElement('span', null, 'Sebastian'),
  }),
  mountNode,
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var HelloMessage = React.createClass({
  displayName: 'HelloMessage',
  render: function () {
    return /* @__PURE__ */ _reactJsxRuntime.jsxs('div', { children: ['Hello ', this.props.name] });
  },
});
React.render(
  /* @__PURE__ */ _reactJsxRuntime.jsx(HelloMessage, {
    name: /* @__PURE__ */ _reactJsxRuntime.jsx('span', { children: 'Sebastian' }),
  }),
  mountNode,
);`,
      },
    ],
  },
  {
    title: 'react automatic — should handle has own property correctly (input)',
    source: `<hasOwnProperty>testing</hasOwnProperty>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "/* @__PURE__ */ React.createElement('hasOwnProperty', null, 'testing');",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('hasOwnProperty', { children: 'testing' });`,
      },
    ],
  },
  {
    title: 'react automatic — should have correct comma in nested children (input)',
    source: `var x = <div>
  <div><br /></div>
  <Component>{foo}<br />{bar}</Component>
  <br />
</div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement(
  'div',
  null,
  /* @__PURE__ */ React.createElement('div', null, /* @__PURE__ */ React.createElement('br', null)),
  /* @__PURE__ */ React.createElement(
    Component,
    null,
    foo,
    /* @__PURE__ */ React.createElement('br', null),
    bar,
  ),
  /* @__PURE__ */ React.createElement('br', null),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {
  children: [
    /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
      children: /* @__PURE__ */ _reactJsxRuntime.jsx('br', {}),
    }),
    /* @__PURE__ */ _reactJsxRuntime.jsxs(Component, {
      children: [foo, /* @__PURE__ */ _reactJsxRuntime.jsx('br', {}), bar],
    }),
    /* @__PURE__ */ _reactJsxRuntime.jsx('br', {}),
  ],
});`,
      },
    ],
  },
  {
    title: 'react automatic — should insert commas after expressions before whitespace (input)',
    source: `var x =
  <div
    attr1={
      "foo" + "bar"
    }
    attr2={
      "foo" + "bar" +

      "baz" + "bug"
    }
    attr3={
      "foo" + "bar" +
      "baz" + "bug"
    }
    attr4="baz">
  </div>
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement('div', {
  attr1: 'foo' + 'bar',
  attr2: 'foo' + 'bar' + 'baz' + 'bug',
  attr3: 'foo' + 'bar' + 'baz' + 'bug',
  attr4: 'baz',
});`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  attr1: 'foo' + 'bar',
  attr2: 'foo' + 'bar' + 'baz' + 'bug',
  attr3: 'foo' + 'bar' + 'baz' + 'bug',
  attr4: 'baz',
});`,
      },
    ],
  },
  {
    title: 'react automatic — should not add quotes to identifier names (input)',
    source: `var e = <F aaa new const var default foo-bar/>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var e = /* @__PURE__ */ React.createElement(F, {
  aaa: true,
  new: true,
  const: true,
  var: true,
  default: true,
  'foo-bar': true,
});`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var e = /* @__PURE__ */ _reactJsxRuntime.jsx(F, {
  aaa: true,
  new: true,
  const: true,
  var: true,
  default: true,
  'foo-bar': true,
});`,
      },
    ],
  },
  {
    title: 'react automatic — should not mangle expressioncontainer attribute values (input)',
    source: `<button data-value={"a value\\n  with\\nnewlines\\n   and spaces"}>Button</button>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement(
  'button',
  { 'data-value': 'a value\\n  with\\nnewlines\\n   and spaces' },
  'Button',
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('button', {
  'data-value': 'a value\\n  with\\nnewlines\\n   and spaces',
  children: 'Button',
});`,
      },
    ],
  },
  {
    title: 'react automatic — should not strip nbsp even coupled with other whitespace (input)',
    source: `<div>&nbsp; </div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "/* @__PURE__ */ React.createElement('div', null, '\\xA0 ');",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: '\\xA0 ' });`,
      },
    ],
  },
  {
    title: 'react automatic — should not strip tags with a single child of nbsp (input)',
    source: `<div>&nbsp;</div>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "/* @__PURE__ */ React.createElement('div', null, '\\xA0');",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('div', { children: '\\xA0' });`,
      },
    ],
  },
  {
    title: 'react automatic — should properly handle comments between props (input)',
    source: `var x = (
  <div
    /* a multi-line
       comment */
    attr1="foo">
    <span // a double-slash comment
      attr2="bar"
    />
  </div>
);
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement(
  'div',
  {
    /* a multi-line
comment */
    attr1: 'foo',
  },
  /* @__PURE__ */ React.createElement('span', { attr2: 'bar' }),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', {
  /* a multi-line
\tcomment */
  attr1: 'foo',
  children: /* @__PURE__ */ _reactJsxRuntime.jsx('span', { attr2: 'bar' }),
});`,
      },
    ],
  },
  {
    title: 'react automatic — should properly handle keys (input)',
    source: `var x = (
    <div>
        <div key="1" />
        <div key="2" meow="wolf" />
        <div key="3" />
    </div>
);`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var x = /* @__PURE__ */ React.createElement(
  'div',
  null,
  /* @__PURE__ */ React.createElement('div', { key: '1' }),
  /* @__PURE__ */ React.createElement('div', {
    key: '2',
    meow: 'wolf',
  }),
  /* @__PURE__ */ React.createElement('div', { key: '3' }),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsxs('div', {
  children: [
    /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '1'),
    /* @__PURE__ */ _reactJsxRuntime.jsx('div', { meow: 'wolf' }, '2'),
    /* @__PURE__ */ _reactJsxRuntime.jsx('div', {}, '3'),
  ],
});`,
      },
    ],
  },
  {
    title: 'react automatic — should properly handle null prop spread (input)',
    source: `var foo = null;
var x = <div {...foo} />;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `var foo = null;
var x = /* @__PURE__ */ React.createElement('div', foo);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var foo = null;
var x = /* @__PURE__ */ _reactJsxRuntime.jsx('div', { ...foo });`,
      },
    ],
  },
  {
    title: 'react automatic — should quote jsx attributes (input)',
    source: `<button data-value='a value'>Button</button>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output:
          "/* @__PURE__ */ React.createElement('button', { 'data-value': 'a value' }, 'Button');",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('button', {
  'data-value': 'a value',
  children: 'Button',
});`,
      },
    ],
  },
  {
    title: 'react automatic — should support xml namespaces if flag (input)',
    source: `<f:image n:attr />;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
          jsxThrowIfNamespace: false,
        },
        output: "/* @__PURE__ */ React.createElement('f:image', { 'n:attr': true });",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
          jsxThrowIfNamespace: false,
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('f:image', { 'n:attr': true });`,
      },
    ],
  },
  {
    title: 'react automatic — should throw error namespaces if not flag (input)',
    source: `<f:image />;
`,
    filename: 'input.jsx',
    output: '[error] preflight:transform-error',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
      },
    ],
  },
  {
    title: 'react automatic — should throw when filter is specified (input)',
    source: `<></>
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: '/* @__PURE__ */ React.createElement(React.Fragment, null);',
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx(_reactJsxRuntime.Fragment, {});`,
      },
    ],
  },
  {
    title: 'react automatic — should transform known hyphenated tags (input)',
    source: `<font-face />;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "/* @__PURE__ */ React.createElement('font-face', null);",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('font-face', {});`,
      },
    ],
  },
  {
    title: 'react automatic — should use createElement when key comes after spread (input)',
    source: `var x = (
    <div {...props} key="1" foo="bar" />
);`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
  'div',
  _extends({}, props, {
    key: '1',
    foo: 'bar',
  }),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _react = require('react');
var x = /* @__PURE__ */ _react.createElement('div', {
  ...props,
  key: '1',
  foo: 'bar',
});`,
      },
    ],
  },
  {
    title: 'react automatic — should use jsx when key comes before spread (input)',
    source: `var x = (
    <div key="1" {...props} foo="bar" />
);`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
var x = /* @__PURE__ */ React.createElement('div', _extends({ key: '1' }, props, { foo: 'bar' }));`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var x = /* @__PURE__ */ _reactJsxRuntime.jsx(
  'div',
  {
    ...props,
    foo: 'bar',
  },
  '1',
);`,
      },
    ],
  },
  {
    title: 'react automatic — this tag name (input)',
    source: `var div = <this.foo>test</this.foo>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: "var div = /* @__PURE__ */ React.createElement(this.foo, null, 'test');",
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
var div = /* @__PURE__ */ _reactJsxRuntime.jsx(this.foo, { children: 'test' });`,
      },
    ],
  },
  {
    title: 'react automatic — weird symbols (input)',
    source: `class MobileHomeActivityTaskPriorityIcon extends React.PureComponent {
  render() {
    return <Text>&nbsp;{this.props.value}&nbsp;</Text>;
  }
}
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `class MobileHomeActivityTaskPriorityIcon extends React.PureComponent {
  render() {
    return /* @__PURE__ */ React.createElement(Text, null, '\\xA0', this.props.value, '\\xA0');
  }
}`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
class MobileHomeActivityTaskPriorityIcon extends React.PureComponent {
  render() {
    return /* @__PURE__ */ _reactJsxRuntime.jsxs(Text, {
      children: ['\\xA0', this.props.value, '\\xA0'],
    });
  }
}`,
      },
    ],
  },
  {
    title: 'react automatic — wraps props in react spread for last spread attributes (input)',
    source: `<Component y={2} z { ... x } />
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
/* @__PURE__ */ React.createElement(
  Component,
  _extends(
    {
      y: 2,
      z: true,
    },
    x,
  ),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx(Component, {
  y: 2,
  z: true,
  ...x,
});`,
      },
    ],
  },
  {
    title: 'react automatic — wraps props in react spread for middle spread attributes (input)',
    source: `<Component y={2} { ... x } z />
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
/* @__PURE__ */ React.createElement(Component, _extends({ y: 2 }, x, { z: true }));`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx(Component, {
  y: 2,
  ...x,
  z: true,
});`,
      },
    ],
  },
  {
    title: 'react — honor custom jsx comment if jsx pragma option set (input)',
    source: `/** @jsx dom */

<Foo></Foo>;

var profile = <div>
  <img src="avatar.png" className="profile" />
  <h3>{[user.firstName, user.lastName].join(" ")}</h3>
</div>;`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/** @jsx dom */
/* @__PURE__ */ dom(Foo, null);
var profile = /* @__PURE__ */ dom(
  'div',
  null,
  /* @__PURE__ */ dom('img', {
    src: 'avatar.png',
    className: 'profile',
  }),
  /* @__PURE__ */ dom('h3', null, [user.firstName, user.lastName].join(' ')),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: '[error] preflight:transform-error',
      },
    ],
  },
  {
    title: 'react — proto in jsx attribute (input)',
    source: `<p __proto__={null} class="bar">text</p>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @__PURE__ */ React.createElement(
  'p',
  {
    __proto__: null,
    class: 'bar',
  },
  'text',
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx('p', {
  __proto__: null,
  class: 'bar',
  children: 'text',
});`,
      },
    ],
  },
  {
    title: 'react — should allow jsx docs comment with pragma (input)',
    source: `/**
 * @jsx jsx
 */

<foo />`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/**
 * @jsx jsx
 */
/* @__PURE__ */ jsx('foo', null);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: '[error] preflight:transform-error',
      },
    ],
  },
  {
    title: 'react — should allow no pragmafrag if frag unused (input)',
    source: `/** @jsx dom */

<div>no fragment is used</div>
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/** @jsx dom */
/* @__PURE__ */ dom('div', null, 'no fragment is used');`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: '[error] preflight:transform-error',
      },
    ],
  },
  {
    title: 'react — should not allow jsx pragma to be anywhere in comment (input)',
    source: `// Make sure not to use a jsx pragma here (like "@jsx Something"), we need this to be React.createElement!
<blah/>
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `// Make sure not to use a jsx pragma here (like "@jsx Something"), we need this to be React.createElement!
/* @__PURE__ */ React.createElement('blah', null);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
// Make sure not to use a jsx pragma here (like "@jsx Something"), we need this to be React.createElement!
/* @__PURE__ */ _reactJsxRuntime.jsx('blah', {});`,
      },
    ],
  },
  {
    title: 'react — wraps props in react spread for first spread attributes (input)',
    source: `<Component { ... x } y
={2 } z />
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `function _extends() {
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
/* @__PURE__ */ React.createElement(
  Component,
  _extends({}, x, {
    y: 2,
    z: true,
  }),
);`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `var _reactJsxRuntime = require('react/jsx-runtime');
/* @__PURE__ */ _reactJsxRuntime.jsx(Component, {
  ...x,
  y: 2,
  z: true,
});`,
      },
    ],
  },
  {
    title: 'regression — issue 12478 automatic (input)',
    source: `const foo = 2;
`,
    filename: 'input.jsx',
    output: 'const foo = 2;',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
      },
    ],
  },
  {
    title: 'regression — pragma frag set default classic runtime (input)',
    source: `/* @jsxFrag React.Fragment */
/* @jsx h */
<>Test</>;
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `/* @jsxFrag React.Fragment */
/* @jsx h */
/* @__PURE__ */ h(React.Fragment, null, 'Test');`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: '[error] preflight:transform-error',
      },
    ],
  },
  {
    title: 'sourcemaps — JSXText (input)',
    source: `import React from 'react';

export default function App() {
  return (
    <div className="App">
      <h1>Welcome to my application!</h1>
      This is my app!
      <strong>MINE.</strong>
    </div>
  )
}
`,
    filename: 'input.jsx',
    modes: [
      {
        title: 'classic',
        options: {
          jsx: 'classic',
        },
        output: `import React from 'react';
export default function App() {
  return /* @__PURE__ */ React.createElement(
    'div',
    { className: 'App' },
    /* @__PURE__ */ React.createElement('h1', null, 'Welcome to my application!'),
    'This is my app!',
    /* @__PURE__ */ React.createElement('strong', null, 'MINE.'),
  );
}`,
      },
      {
        title: 'automatic',
        options: {
          jsx: 'automatic',
        },
        output: `import React from 'react';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
export default function App() {
  return /* @__PURE__ */ _jsxs('div', {
    className: 'App',
    children: [
      /* @__PURE__ */ _jsx('h1', { children: 'Welcome to my application!' }),
      'This is my app!',
      /* @__PURE__ */ _jsx('strong', { children: 'MINE.' }),
    ],
  });
}`,
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
