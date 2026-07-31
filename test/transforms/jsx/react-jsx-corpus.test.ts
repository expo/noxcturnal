// Generated from apps/test-suite/tests/JSReactJSX.js in the Expo repository.
// Run this generator, then Vitest with --update, when the upstream cases change.
import { expect, test } from 'vitest';
import { transformOutcome } from '../transform';

test('001 JS React JSX > React 19 element shape > JSX element does not have _source property', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        // React 19 removed _source — it is not defined on elements\n        expect('_source' in el).toBe(false);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      // React 19 removed _source — it is not defined on elements
      expect('_source' in el).toBe(false);
    };"
  `);
});

test('002 JS React JSX > React 19 element shape > JSX element does not have _self property', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        // React 19 removed _self — it is not defined on elements\n        expect('_self' in el).toBe(false);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      // React 19 removed _self — it is not defined on elements
      expect('_self' in el).toBe(false);
    };"
  `);
});

test('003 JS React JSX > React 19 element shape > JSX element has _debugStack', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        // React 19 captures the creation-site stack via Error()\n        expect('_debugStack' in el).toBe(true);\n        expect(el._debugStack != null).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      // React 19 captures the creation-site stack via Error()
      expect('_debugStack' in el).toBe(true);
      expect(el._debugStack != null).toBe(true);
    };"
  `);
});

test('004 JS React JSX > React 19 element shape > _debugStack is an Error object', async () => {
  const source =
    '() => {\n        const el = <Dummy />;\n        expect(el._debugStack instanceof Error).toBe(true);\n      }';
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      expect(el._debugStack instanceof Error).toBe(true);
    };"
  `);
});

test('005 JS React JSX > React 19 element shape > _debugStack has message "react-stack-top-frame"', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        expect(el._debugStack.message).toBe('react-stack-top-frame');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      expect(el._debugStack.message).toBe('react-stack-top-frame');
    };"
  `);
});

test('006 JS React JSX > React 19 element shape > _debugStack has a stack trace string', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        const stack = el._debugStack.stack;\n        expect(typeof stack).toBe('string');\n        expect(stack.length > 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      const stack = el._debugStack.stack;
      expect(typeof stack).toBe('string');
      expect(stack.length > 0).toBe(true);
    };"
  `);
});

test('007 JS React JSX > React 19 element shape > JSX element has _debugTask', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        // _debugTask is set for async debugging (null if console.createTask unavailable)\n        expect('_debugTask' in el).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      // _debugTask is set for async debugging (null if console.createTask unavailable)
      expect('_debugTask' in el).toBe(true);
    };"
  `);
});

test('008 JS React JSX > React 19 element shape > createElement also produces _debugStack', async () => {
  const source =
    '() => {\n        const el = React.createElement(Dummy, null);\n        // createElement in React 19 also captures Error("react-stack-top-frame")\n        expect(el._debugStack instanceof Error).toBe(true);\n      }';
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const el = React.createElement(Dummy, null);
      // createElement in React 19 also captures Error("react-stack-top-frame")
      expect(el._debugStack instanceof Error).toBe(true);
    };"
  `);
});

test('009 JS React JSX > React 19 element shape > createElement element does not have _source', async () => {
  const source =
    "() => {\n        const el = React.createElement(Dummy, null);\n        expect('_source' in el).toBe(false);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const el = React.createElement(Dummy, null);
      expect('_source' in el).toBe(false);
    };"
  `);
});

test('010 JS React JSX > React 19 element shape > createElement element does not have _self', async () => {
  const source =
    "() => {\n        const el = React.createElement(Dummy, null);\n        expect('_self' in el).toBe(false);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const el = React.createElement(Dummy, null);
      expect('_self' in el).toBe(false);
    };"
  `);
});

test('011 JS React JSX > _debugStack source location > _debugStack.stack has source location frames', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        const stack = el._debugStack.stack || '';\n        // Raw Hermes stacks reference the bundle, not original source files.\n        // Source filenames are available after symbolication (DevTools, error overlay).\n        expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      const stack = el._debugStack.stack || '';
      // Raw Hermes stacks reference the bundle, not original source files.
      // Source filenames are available after symbolication (DevTools, error overlay).
      expect(/:\\d+:\\d+/.test(stack)).toBe(true);
    };"
  `);
});

test('012 JS React JSX > _debugStack source location > _debugStack.stack contains line:col numbers', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        const stack = el._debugStack.stack || '';\n        expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      const stack = el._debugStack.stack || '';
      expect(/:\\d+:\\d+/.test(stack)).toBe(true);
    };"
  `);
});

test('013 JS React JSX > _debugStack source location > elements on different lines have different _debugStack', async () => {
  const source =
    '() => {\n        const el1 = <Dummy />;\n\n        const el2 = <Dummy />;\n        // Created on different lines, so the captured stacks differ\n        expect(el1._debugStack.stack).not.toBe(el2._debugStack.stack);\n      }';
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el1 = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      const el2 = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      // Created on different lines, so the captured stacks differ
      expect(el1._debugStack.stack).not.toBe(el2._debugStack.stack);
    };"
  `);
});

test('014 JS React JSX > _debugStack source location > _debugStack captures the calling function name', async () => {
  const source =
    "() => {\n        function createWidget() {\n          return <Dummy />;\n        }\n        const el = createWidget();\n        const stack = el._debugStack.stack || '';\n        expect(stack.indexOf('createWidget') >= 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      function createWidget() {
        return /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      }
      const el = createWidget();
      const stack = el._debugStack.stack || '';
      expect(stack.indexOf('createWidget') >= 0).toBe(true);
    };"
  `);
});

test('015 JS React JSX > _debugStack source location > _debugStack captures class method name', async () => {
  const source =
    "() => {\n        class WidgetFactory {\n          build() {\n            return <Dummy />;\n          }\n        }\n        const el = new WidgetFactory().build();\n        const stack = el._debugStack.stack || '';\n        expect(stack.indexOf('build') >= 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      class WidgetFactory {
        build() {
          return /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
        }
      }
      const el = new WidgetFactory().build();
      const stack = el._debugStack.stack || '';
      expect(stack.indexOf('build') >= 0).toBe(true);
    };"
  `);
});

test('016 JS React JSX > _debugStack source location > _debugStack captures arrow function name', async () => {
  const source =
    "() => {\n        const makeElement = () => <Dummy />;\n        const el = makeElement();\n        const stack = el._debugStack.stack || '';\n        expect(stack.indexOf('makeElement') >= 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const makeElement = () => /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      const el = makeElement();
      const stack = el._debugStack.stack || '';
      expect(stack.indexOf('makeElement') >= 0).toBe(true);
    };"
  `);
});

test('017 JS React JSX > _debugStack source location > children have independent _debugStack', async () => {
  const source =
    '() => {\n        function Parent({ children }) {\n          return null;\n        }\n        function Child() {\n          return null;\n        }\n        const parent = (\n          <Parent>\n            <Child />\n          </Parent>\n        );\n        const child = parent.props.children;\n        expect(parent._debugStack.stack).not.toBe(child._debugStack.stack);\n      }';
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
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
    };"
  `);
});

test('018 JS React JSX > _debugStack source location > createElement _debugStack has source location', async () => {
  const source =
    "() => {\n        const el = React.createElement(Dummy, null);\n        const stack = el._debugStack.stack || '';\n        expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const el = React.createElement(Dummy, null);
      const stack = el._debugStack.stack || '';
      expect(/:\\d+:\\d+/.test(stack)).toBe(true);
    };"
  `);
});

test('019 JS React JSX > _debugStack vs __source equivalence > _debugStack.stack has source location (replaces __source.fileName/lineNumber/columnNumber)', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        const stack = el._debugStack.stack || '';\n        // __source provided { fileName, lineNumber, columnNumber } statically.\n        // _debugStack captures the same via Error().stack — file/line/col are\n        // available after symbolication (which DevTools and error overlay perform).\n        expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      const stack = el._debugStack.stack || '';
      // __source provided { fileName, lineNumber, columnNumber } statically.
      // _debugStack captures the same via Error().stack — file/line/col are
      // available after symbolication (which DevTools and error overlay perform).
      expect(/:\\d+:\\d+/.test(stack)).toBe(true);
    };"
  `);
});

test('020 JS React JSX > _debugStack vs __source equivalence > _debugStack provides full call chain (more than __source)', async () => {
  const source =
    "() => {\n        function outerFactory() {\n          function innerFactory() {\n            return <Dummy />;\n          }\n          return innerFactory();\n        }\n        const el = outerFactory();\n        const stack = el._debugStack.stack || '';\n        // __source only had the immediate creation site.\n        // _debugStack has the full call chain — both functions visible.\n        expect(stack.indexOf('innerFactory') >= 0).toBe(true);\n        expect(stack.indexOf('outerFactory') >= 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
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
    };"
  `);
});

test('021 JS React JSX > _debugStack vs __source equivalence > manual Error().stack matches _debugStack format', async () => {
  const source =
    "() => {\n        const el = <Dummy />;\n        const err = new Error('manual');\n        // Both use the same Hermes stack trace mechanism\n        expect(/:\\d+:\\d+/.test(el._debugStack.stack || '')).toBe(true);\n        expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      const err = new Error('manual');
      // Both use the same Hermes stack trace mechanism
      expect(/:\\d+:\\d+/.test(el._debugStack.stack || '')).toBe(true);
      expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);
    };"
  `);
});

test('022 JS React JSX > __source and __self prop stripping > __source does not leak into JSX element props', async () => {
  const source =
    '() => {\n        const el = <Dummy />;\n        expect(el.props.__source).toBe(undefined);\n      }';
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      expect(el.props.__source).toBe(undefined);
    };"
  `);
});

test('023 JS React JSX > __source and __self prop stripping > __self does not leak into JSX element props', async () => {
  const source =
    '() => {\n        const el = <Dummy />;\n        expect(el.props.__self).toBe(undefined);\n      }';
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});
      expect(el.props.__self).toBe(undefined);
    };"
  `);
});

test('024 JS React JSX > __source and __self prop stripping > createElement strips __source from props', async () => {
  const source =
    "() => {\n        const el = React.createElement(Dummy, {\n          __source: { fileName: 'fake.js', lineNumber: 1, columnNumber: 0 },\n          label: 'hello',\n        });\n        // React 19 strips __source from props (line 961-962 of react.development.js)\n        expect(el.props.__source).toBe(undefined);\n        expect(el.props.label).toBe('hello');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('025 JS React JSX > __source and __self prop stripping > createElement strips __self from props', async () => {
  const source =
    "() => {\n        const el = React.createElement(Dummy, {\n          __self: {},\n          label: 'hello',\n        });\n        // React 19 strips __self from props (line 961 of react.development.js)\n        expect(el.props.__self).toBe(undefined);\n        expect(el.props.label).toBe('hello');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const el = React.createElement(Dummy, {
        __self: {},
        label: 'hello',
      });
      // React 19 strips __self from props (line 961 of react.development.js)
      expect(el.props.__self).toBe(undefined);
      expect(el.props.label).toBe('hello');
    };"
  `);
});

test('026 JS React JSX > __source and __self prop stripping > regular props are preserved alongside stripped __source/__self', async () => {
  const source =
    "() => {\n        const el = React.createElement(Dummy, {\n          __source: { fileName: 'x.js', lineNumber: 1, columnNumber: 0 },\n          __self: {},\n          foo: 1,\n          bar: 'two',\n          baz: true,\n        });\n        expect(el.props.foo).toBe(1);\n        expect(el.props.bar).toBe('two');\n        expect(el.props.baz).toBe(true);\n        expect(el.props.__source).toBe(undefined);\n        expect(el.props.__self).toBe(undefined);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('027 JS React JSX > Hermes native source info > Error().stack has source location', async () => {
  const source =
    "() => {\n        const err = new Error('test');\n        const stack = err.stack || '';\n        // Raw Hermes stacks have line:col; original filenames after symbolication\n        expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const err = new Error('test');
      const stack = err.stack || '';
      // Raw Hermes stacks have line:col; original filenames after symbolication
      expect(/:\\d+:\\d+/.test(stack)).toBe(true);
    };"
  `);
});

test('028 JS React JSX > Hermes native source info > Error().stack has line:col numbers', async () => {
  const source =
    "() => {\n        const err = new Error('test');\n        expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const err = new Error('test');
      expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);
    };"
  `);
});

test('029 JS React JSX > Hermes native source info > Error().stack preserves function name', async () => {
  const source =
    "() => {\n        function renderProfile() {\n          return new Error('trace');\n        }\n        const err = renderProfile();\n        expect((err.stack || '').indexOf('renderProfile') >= 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      function renderProfile() {
        return new Error('trace');
      }
      const err = renderProfile();
      expect((err.stack || '').indexOf('renderProfile') >= 0).toBe(true);
    };"
  `);
});

test('030 JS React JSX > Hermes native source info > Error().stack preserves class method name', async () => {
  const source =
    "() => {\n        class Renderer {\n          render() {\n            return new Error('trace');\n          }\n        }\n        const err = new Renderer().render();\n        expect((err.stack || '').indexOf('render') >= 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      class Renderer {
        render() {
          return new Error('trace');
        }
      }
      const err = new Renderer().render();
      expect((err.stack || '').indexOf('render') >= 0).toBe(true);
    };"
  `);
});

test('031 JS React JSX > Hermes native source info > Error().stack preserves arrow function name', async () => {
  const source =
    "() => {\n        const buildView = () => new Error('trace');\n        const err = buildView();\n        expect((err.stack || '').indexOf('buildView') >= 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const buildView = () => new Error('trace');
      const err = buildView();
      expect((err.stack || '').indexOf('buildView') >= 0).toBe(true);
    };"
  `);
});

test('032 JS React JSX > Hermes native source info > nested call chain is preserved in Error().stack', async () => {
  const source =
    "() => {\n        function database() {\n          return new Error('query failed');\n        }\n        function repository() {\n          return database();\n        }\n        function service() {\n          return repository();\n        }\n        const err = service();\n        const stack = err.stack || '';\n        expect(stack.indexOf('database') >= 0).toBe(true);\n        expect(stack.indexOf('repository') >= 0).toBe(true);\n        expect(stack.indexOf('service') >= 0).toBe(true);\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
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
    };"
  `);
});

test('033 JS React JSX > component identification without __source > named function component has type.name', async () => {
  const source =
    "() => {\n        function ProfileCard() {\n          return null;\n        }\n        const el = <ProfileCard />;\n        expect(el.type.name).toBe('ProfileCard');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      function ProfileCard() {
        return null;
      }
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(ProfileCard, {});
      expect(el.type.name).toBe('ProfileCard');
    };"
  `);
});

test('034 JS React JSX > component identification without __source > displayName is available on type', async () => {
  const source =
    "() => {\n        function Comp() {\n          return null;\n        }\n        Comp.displayName = 'FancyButton';\n        const el = <Comp />;\n        expect(el.type.displayName).toBe('FancyButton');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      function Comp() {
        return null;
      }
      Comp.displayName = 'FancyButton';
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Comp, {});
      expect(el.type.displayName).toBe('FancyButton');
    };"
  `);
});

test('035 JS React JSX > component identification without __source > type.name works with createElement', async () => {
  const source =
    "() => {\n        function UserAvatar() {\n          return null;\n        }\n        const el = React.createElement(UserAvatar, null);\n        expect(el.type.name).toBe('UserAvatar');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      function UserAvatar() {
        return null;
      }
      const el = React.createElement(UserAvatar, null);
      expect(el.type.name).toBe('UserAvatar');
    };"
  `);
});

test('036 JS React JSX > component identification without __source > forwardRef render function name is accessible', async () => {
  const source =
    "() => {\n        const FancyInput = React.forwardRef(function FancyInput() {\n          return null;\n        });\n        expect(FancyInput.render.name).toBe('FancyInput');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const FancyInput = React.forwardRef(function FancyInput() {
        return null;
      });
      expect(FancyInput.render.name).toBe('FancyInput');
    };"
  `);
});

test('037 JS React JSX > component identification without __source > memo preserves inner component name', async () => {
  const source =
    "() => {\n        function ExpensiveList() {\n          return null;\n        }\n        const Memoized = React.memo(ExpensiveList);\n        expect(Memoized.type.name).toBe('ExpensiveList');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      function ExpensiveList() {
        return null;
      }
      const Memoized = React.memo(ExpensiveList);
      expect(Memoized.type.name).toBe('ExpensiveList');
    };"
  `);
});

test('038 JS React JSX > component identification without __source > anonymous component has empty name', async () => {
  const source =
    "() => {\n        const el = React.createElement(function () {\n          return null;\n        }, null);\n        expect(el.type.name).toBe('');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "() => {
      const el = React.createElement(function () {
        return null;
      }, null);
      expect(el.type.name).toBe('');
    };"
  `);
});

test('039 JS React JSX > component identification without __source > arrow component assigned to variable has name', async () => {
  const source =
    "() => {\n        const MyArrow = () => null;\n        const el = <MyArrow />;\n        expect(el.type.name).toBe('MyArrow');\n      }";
  expect(await transformOutcome(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "var _reactJsxRuntime = require('react/jsx-runtime');
    () => {
      const MyArrow = () => null;
      const el = /* @__PURE__ */ _reactJsxRuntime.jsx(MyArrow, {});
      expect(el.type.name).toBe('MyArrow');
    };"
  `);
});
