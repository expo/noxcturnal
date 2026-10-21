import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.jsx',
  options: {
    jsx: 'automatic',
  },
} as const satisfies CorpusConfig;

export const cases = [
  {
    title: 'React 19 element shape > JSX element does not have _source property',
    source: `() => {
        const el = <Dummy />;
        // React 19 removed _source — it is not defined on elements
        expect('_source' in el).toBe(false);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  // React 19 removed _source — it is not defined on elements
  expect('_source' in el).toBe(false);
};`,
  },
  {
    title: 'React 19 element shape > JSX element does not have _self property',
    source: `() => {
        const el = <Dummy />;
        // React 19 removed _self — it is not defined on elements
        expect('_self' in el).toBe(false);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  // React 19 removed _self — it is not defined on elements
  expect('_self' in el).toBe(false);
};`,
  },
  {
    title: 'React 19 element shape > JSX element has _debugStack',
    source: `() => {
        const el = <Dummy />;
        // React 19 captures the creation-site stack via Error()
        expect('_debugStack' in el).toBe(true);
        expect(el._debugStack != null).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  // React 19 captures the creation-site stack via Error()
  expect('_debugStack' in el).toBe(true);
  expect(el._debugStack != null).toBe(true);
};`,
  },
  {
    title: 'React 19 element shape > _debugStack is an Error object',
    source: `() => {
        const el = <Dummy />;
        expect(el._debugStack instanceof Error).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  expect(el._debugStack instanceof Error).toBe(true);
};`,
  },
  {
    title: 'React 19 element shape > _debugStack has message "react-stack-top-frame"',
    source: `() => {
        const el = <Dummy />;
        expect(el._debugStack.message).toBe('react-stack-top-frame');
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  expect(el._debugStack.message).toBe('react-stack-top-frame');
};`,
  },
  {
    title: 'React 19 element shape > _debugStack has a stack trace string',
    source: `() => {
        const el = <Dummy />;
        const stack = el._debugStack.stack;
        expect(typeof stack).toBe('string');
        expect(stack.length > 0).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  const stack = el._debugStack.stack;
  expect(typeof stack).toBe('string');
  expect(stack.length > 0).toBe(true);
};`,
  },
  {
    title: 'React 19 element shape > JSX element has _debugTask',
    source: `() => {
        const el = <Dummy />;
        // _debugTask is set for async debugging (null if console.createTask unavailable)
        expect('_debugTask' in el).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  // _debugTask is set for async debugging (null if console.createTask unavailable)
  expect('_debugTask' in el).toBe(true);
};`,
  },
  {
    title: 'React 19 element shape > createElement also produces _debugStack',
    source: `() => {
        const el = React.createElement(Dummy, null);
        // createElement in React 19 also captures Error("react-stack-top-frame")
        expect(el._debugStack instanceof Error).toBe(true);
      }`,
    output: `() => {
  const el = React.createElement(Dummy, null);
  // createElement in React 19 also captures Error("react-stack-top-frame")
  expect(el._debugStack instanceof Error).toBe(true);
};`,
  },
  {
    title: 'React 19 element shape > createElement element does not have _source',
    source: `() => {
        const el = React.createElement(Dummy, null);
        expect('_source' in el).toBe(false);
      }`,
    output: `() => {
  const el = React.createElement(Dummy, null);
  expect('_source' in el).toBe(false);
};`,
  },
  {
    title: 'React 19 element shape > createElement element does not have _self',
    source: `() => {
        const el = React.createElement(Dummy, null);
        expect('_self' in el).toBe(false);
      }`,
    output: `() => {
  const el = React.createElement(Dummy, null);
  expect('_self' in el).toBe(false);
};`,
  },
  {
    title: '_debugStack source location > _debugStack.stack has source location frames',
    source: `() => {
        const el = <Dummy />;
        const stack = el._debugStack.stack || '';
        // Raw Hermes stacks reference the bundle, not original source files.
        // Source filenames are available after symbolication (DevTools, error overlay).
        expect(/:\\d+:\\d+/.test(stack)).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  const stack = el._debugStack.stack || '';
  // Raw Hermes stacks reference the bundle, not original source files.
  // Source filenames are available after symbolication (DevTools, error overlay).
  expect(/:\\d+:\\d+/.test(stack)).toBe(true);
};`,
  },
  {
    title: '_debugStack source location > elements on different lines have different _debugStack',
    source: `() => {
        const el1 = <Dummy />;
     \x20
        const el2 = <Dummy />;
        // Created on different lines, so the captured stacks differ
        expect(el1._debugStack.stack).not.toBe(el2._debugStack.stack);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el1 = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  const el2 = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  // Created on different lines, so the captured stacks differ
  expect(el1._debugStack.stack).not.toBe(el2._debugStack.stack);
};`,
  },
  {
    title: '_debugStack source location > _debugStack captures the calling function name',
    source: `() => {
        function createWidget() {
          return <Dummy />;
        }
        const el = createWidget();
        const stack = el._debugStack.stack || '';
        expect(stack.indexOf('createWidget') >= 0).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  function createWidget() {
    return /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  }
  const el = createWidget();
  const stack = el._debugStack.stack || '';
  expect(stack.indexOf('createWidget') >= 0).toBe(true);
};`,
  },
  {
    title: '_debugStack source location > _debugStack captures class method name',
    source: `() => {
        class WidgetFactory {
          build() {
            return <Dummy />;
          }
        }
        const el = new WidgetFactory().build();
        const stack = el._debugStack.stack || '';
        expect(stack.indexOf('build') >= 0).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  class WidgetFactory {
    build() {
      return /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
    }
  }
  const el = new WidgetFactory().build();
  const stack = el._debugStack.stack || '';
  expect(stack.indexOf('build') >= 0).toBe(true);
};`,
  },
  {
    title: '_debugStack source location > _debugStack captures arrow function name',
    source: `() => {
        const makeElement = () => <Dummy />;
        const el = makeElement();
        const stack = el._debugStack.stack || '';
        expect(stack.indexOf('makeElement') >= 0).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const makeElement = () => /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  const el = makeElement();
  const stack = el._debugStack.stack || '';
  expect(stack.indexOf('makeElement') >= 0).toBe(true);
};`,
  },
  {
    title: '_debugStack source location > children have independent _debugStack',
    source: `() => {
        function Parent({ children }) {
          return null;
        }
        function Child() {
          return null;
        }
        const parent = (
          <Parent>
            <Child />
          </Parent>
        );
        const child = parent.props.children;
        expect(parent._debugStack.stack).not.toBe(child._debugStack.stack);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  function Parent({ children }) {
    return null;
  }
  function Child() {
    return null;
  }
  const parent = /* @__PURE__ */ _reactJsxRuntime.jsx(Parent, {
    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Child, {}),
  });
  const child = parent.props.children;
  expect(parent._debugStack.stack).not.toBe(child._debugStack.stack);
};`,
  },
  {
    title: '_debugStack source location > createElement _debugStack has source location',
    source: `() => {
        const el = React.createElement(Dummy, null);
        const stack = el._debugStack.stack || '';
        expect(/:\\d+:\\d+/.test(stack)).toBe(true);
      }`,
    output: `() => {
  const el = React.createElement(Dummy, null);
  const stack = el._debugStack.stack || '';
  expect(/:\\d+:\\d+/.test(stack)).toBe(true);
};`,
  },
  {
    title:
      '_debugStack vs __source equivalence > _debugStack provides full call chain (more than __source)',
    source: `() => {
        function outerFactory() {
          function innerFactory() {
            return <Dummy />;
          }
          return innerFactory();
        }
        const el = outerFactory();
        const stack = el._debugStack.stack || '';
        // __source only had the immediate creation site.
        // _debugStack has the full call chain — both functions visible.
        expect(stack.indexOf('innerFactory') >= 0).toBe(true);
        expect(stack.indexOf('outerFactory') >= 0).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  function outerFactory() {
    function innerFactory() {
      return /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
    }
    return innerFactory();
  }
  const el = outerFactory();
  const stack = el._debugStack.stack || '';
  // __source only had the immediate creation site.
  // _debugStack has the full call chain — both functions visible.
  expect(stack.indexOf('innerFactory') >= 0).toBe(true);
  expect(stack.indexOf('outerFactory') >= 0).toBe(true);
};`,
  },
  {
    title: '_debugStack vs __source equivalence > manual Error().stack matches _debugStack format',
    source: `() => {
        const el = <Dummy />;
        const err = new Error('manual');
        // Both use the same Hermes stack trace mechanism
        expect(/:\\d+:\\d+/.test(el._debugStack.stack || '')).toBe(true);
        expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  const err = new Error('manual');
  // Both use the same Hermes stack trace mechanism
  expect(/:\\d+:\\d+/.test(el._debugStack.stack || '')).toBe(true);
  expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);
};`,
  },
  {
    title: '__source and __self prop stripping > __source does not leak into JSX element props',
    source: `() => {
        const el = <Dummy />;
        expect(el.props.__source).toBe(undefined);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  expect(el.props.__source).toBe(undefined);
};`,
  },
  {
    title: '__source and __self prop stripping > __self does not leak into JSX element props',
    source: `() => {
        const el = <Dummy />;
        expect(el.props.__self).toBe(undefined);
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
  expect(el.props.__self).toBe(undefined);
};`,
  },
  {
    title: '__source and __self prop stripping > createElement strips __source from props',
    source: `() => {
        const el = React.createElement(Dummy, {
          __source: { fileName: 'fake.js', lineNumber: 1, columnNumber: 0 },
          label: 'hello',
        });
        // React 19 strips __source from props (line 961-962 of react.development.js)
        expect(el.props.__source).toBe(undefined);
        expect(el.props.label).toBe('hello');
      }`,
    output: `() => {
  const el = React.createElement(Dummy, {
    __source: {
      fileName: 'fake.js',
      lineNumber: 1,
      columnNumber: 0,
    },
    label: 'hello',
  });
  // React 19 strips __source from props (line 961-962 of react.development.js)
  expect(el.props.__source).toBe(undefined);
  expect(el.props.label).toBe('hello');
};`,
  },
  {
    title: '__source and __self prop stripping > createElement strips __self from props',
    source: `() => {
        const el = React.createElement(Dummy, {
          __self: {},
          label: 'hello',
        });
        // React 19 strips __self from props (line 961 of react.development.js)
        expect(el.props.__self).toBe(undefined);
        expect(el.props.label).toBe('hello');
      }`,
    output: `() => {
  const el = React.createElement(Dummy, {
    __self: {},
    label: 'hello',
  });
  // React 19 strips __self from props (line 961 of react.development.js)
  expect(el.props.__self).toBe(undefined);
  expect(el.props.label).toBe('hello');
};`,
  },
  {
    title:
      '__source and __self prop stripping > regular props are preserved alongside stripped __source/__self',
    source: `() => {
        const el = React.createElement(Dummy, {
          __source: { fileName: 'x.js', lineNumber: 1, columnNumber: 0 },
          __self: {},
          foo: 1,
          bar: 'two',
          baz: true,
        });
        expect(el.props.foo).toBe(1);
        expect(el.props.bar).toBe('two');
        expect(el.props.baz).toBe(true);
        expect(el.props.__source).toBe(undefined);
        expect(el.props.__self).toBe(undefined);
      }`,
    output: `() => {
  const el = React.createElement(Dummy, {
    __source: {
      fileName: 'x.js',
      lineNumber: 1,
      columnNumber: 0,
    },
    __self: {},
    foo: 1,
    bar: 'two',
    baz: true,
  });
  expect(el.props.foo).toBe(1);
  expect(el.props.bar).toBe('two');
  expect(el.props.baz).toBe(true);
  expect(el.props.__source).toBe(undefined);
  expect(el.props.__self).toBe(undefined);
};`,
  },
  {
    title: 'Hermes native source info > Error().stack has source location',
    source: `() => {
        const err = new Error('test');
        const stack = err.stack || '';
        // Raw Hermes stacks have line:col; original filenames after symbolication
        expect(/:\\d+:\\d+/.test(stack)).toBe(true);
      }`,
    output: `() => {
  const err = new Error('test');
  const stack = err.stack || '';
  // Raw Hermes stacks have line:col; original filenames after symbolication
  expect(/:\\d+:\\d+/.test(stack)).toBe(true);
};`,
  },
  {
    title: 'Hermes native source info > Error().stack has line:col numbers',
    source: `() => {
        const err = new Error('test');
        expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);
      }`,
    output: `() => {
  const err = new Error('test');
  expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);
};`,
  },
  {
    title: 'Hermes native source info > Error().stack preserves function name',
    source: `() => {
        function renderProfile() {
          return new Error('trace');
        }
        const err = renderProfile();
        expect((err.stack || '').indexOf('renderProfile') >= 0).toBe(true);
      }`,
    output: `() => {
  function renderProfile() {
    return new Error('trace');
  }
  const err = renderProfile();
  expect((err.stack || '').indexOf('renderProfile') >= 0).toBe(true);
};`,
  },
  {
    title: 'Hermes native source info > Error().stack preserves class method name',
    source: `() => {
        class Renderer {
          render() {
            return new Error('trace');
          }
        }
        const err = new Renderer().render();
        expect((err.stack || '').indexOf('render') >= 0).toBe(true);
      }`,
    output: `() => {
  class Renderer {
    render() {
      return new Error('trace');
    }
  }
  const err = new Renderer().render();
  expect((err.stack || '').indexOf('render') >= 0).toBe(true);
};`,
  },
  {
    title: 'Hermes native source info > Error().stack preserves arrow function name',
    source: `() => {
        const buildView = () => new Error('trace');
        const err = buildView();
        expect((err.stack || '').indexOf('buildView') >= 0).toBe(true);
      }`,
    output: `() => {
  const buildView = () => new Error('trace');
  const err = buildView();
  expect((err.stack || '').indexOf('buildView') >= 0).toBe(true);
};`,
  },
  {
    title: 'Hermes native source info > nested call chain is preserved in Error().stack',
    source: `() => {
        function database() {
          return new Error('query failed');
        }
        function repository() {
          return database();
        }
        function service() {
          return repository();
        }
        const err = service();
        const stack = err.stack || '';
        expect(stack.indexOf('database') >= 0).toBe(true);
        expect(stack.indexOf('repository') >= 0).toBe(true);
        expect(stack.indexOf('service') >= 0).toBe(true);
      }`,
    output: `() => {
  function database() {
    return new Error('query failed');
  }
  function repository() {
    return database();
  }
  function service() {
    return repository();
  }
  const err = service();
  const stack = err.stack || '';
  expect(stack.indexOf('database') >= 0).toBe(true);
  expect(stack.indexOf('repository') >= 0).toBe(true);
  expect(stack.indexOf('service') >= 0).toBe(true);
};`,
  },
  {
    title: 'component identification without __source > named function component has type.name',
    source: `() => {
        function ProfileCard() {
          return null;
        }
        const el = <ProfileCard />;
        expect(el.type.name).toBe('ProfileCard');
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  function ProfileCard() {
    return null;
  }
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(ProfileCard, {});
  expect(el.type.name).toBe('ProfileCard');
};`,
  },
  {
    title: 'component identification without __source > displayName is available on type',
    source: `() => {
        function Comp() {
          return null;
        }
        Comp.displayName = 'FancyButton';
        const el = <Comp />;
        expect(el.type.displayName).toBe('FancyButton');
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  function Comp() {
    return null;
  }
  Comp.displayName = 'FancyButton';
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Comp, {});
  expect(el.type.displayName).toBe('FancyButton');
};`,
  },
  {
    title: 'component identification without __source > type.name works with createElement',
    source: `() => {
        function UserAvatar() {
          return null;
        }
        const el = React.createElement(UserAvatar, null);
        expect(el.type.name).toBe('UserAvatar');
      }`,
    output: `() => {
  function UserAvatar() {
    return null;
  }
  const el = React.createElement(UserAvatar, null);
  expect(el.type.name).toBe('UserAvatar');
};`,
  },
  {
    title:
      'component identification without __source > forwardRef render function name is accessible',
    source: `() => {
        const FancyInput = React.forwardRef(function FancyInput() {
          return null;
        });
        expect(FancyInput.render.name).toBe('FancyInput');
      }`,
    output: `() => {
  const FancyInput = React.forwardRef(function FancyInput() {
    return null;
  });
  expect(FancyInput.render.name).toBe('FancyInput');
};`,
  },
  {
    title: 'component identification without __source > memo preserves inner component name',
    source: `() => {
        function ExpensiveList() {
          return null;
        }
        const Memoized = React.memo(ExpensiveList);
        expect(Memoized.type.name).toBe('ExpensiveList');
      }`,
    output: `() => {
  function ExpensiveList() {
    return null;
  }
  const Memoized = React.memo(ExpensiveList);
  expect(Memoized.type.name).toBe('ExpensiveList');
};`,
  },
  {
    title: 'component identification without __source > anonymous component has empty name',
    source: `() => {
        const el = React.createElement(function () {
          return null;
        }, null);
        expect(el.type.name).toBe('');
      }`,
    output: `() => {
  const el = React.createElement(function () {
    return null;
  }, null);
  expect(el.type.name).toBe('');
};`,
  },
  {
    title:
      'component identification without __source > arrow component assigned to variable has name',
    source: `() => {
        const MyArrow = () => null;
        const el = <MyArrow />;
        expect(el.type.name).toBe('MyArrow');
      }`,
    output: `var _reactJsxRuntime = require('react/jsx-runtime');
() => {
  const MyArrow = () => null;
  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(MyArrow, {});
  expect(el.type.name).toBe('MyArrow');
};`,
  },
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
