import { runCorpus, type CorpusCase, type CorpusConfig } from '../corpus';

export const corpusConfig = {
  filename: 'input.jsx',
  options: {
    jsx: 'automatic',
  },
  assertionKind: 'transform snapshot',
  sourceIndentation: 6,
} as const satisfies CorpusConfig;

export const cases = [
  [
    'React 19 element shape > JSX element does not have _source property',
    "() => {\n  const el = <Dummy />;\n  // React 19 removed _source — it is not defined on elements\n  expect('_source' in el).toBe(false);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  // React 19 removed _source — it is not defined on elements\n  expect('_source' in el).toBe(false);\n};",
  ],
  [
    'React 19 element shape > JSX element does not have _self property',
    "() => {\n  const el = <Dummy />;\n  // React 19 removed _self — it is not defined on elements\n  expect('_self' in el).toBe(false);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  // React 19 removed _self — it is not defined on elements\n  expect('_self' in el).toBe(false);\n};",
  ],
  [
    'React 19 element shape > JSX element has _debugStack',
    "() => {\n  const el = <Dummy />;\n  // React 19 captures the creation-site stack via Error()\n  expect('_debugStack' in el).toBe(true);\n  expect(el._debugStack != null).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  // React 19 captures the creation-site stack via Error()\n  expect('_debugStack' in el).toBe(true);\n  expect(el._debugStack != null).toBe(true);\n};",
  ],
  [
    'React 19 element shape > _debugStack is an Error object',
    '() => {\n  const el = <Dummy />;\n  expect(el._debugStack instanceof Error).toBe(true);\n}',
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  expect(el._debugStack instanceof Error).toBe(true);\n};",
  ],
  [
    'React 19 element shape > _debugStack has message "react-stack-top-frame"',
    "() => {\n  const el = <Dummy />;\n  expect(el._debugStack.message).toBe('react-stack-top-frame');\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  expect(el._debugStack.message).toBe('react-stack-top-frame');\n};",
  ],
  [
    'React 19 element shape > _debugStack has a stack trace string',
    "() => {\n  const el = <Dummy />;\n  const stack = el._debugStack.stack;\n  expect(typeof stack).toBe('string');\n  expect(stack.length > 0).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  const stack = el._debugStack.stack;\n  expect(typeof stack).toBe('string');\n  expect(stack.length > 0).toBe(true);\n};",
  ],
  [
    'React 19 element shape > JSX element has _debugTask',
    "() => {\n  const el = <Dummy />;\n  // _debugTask is set for async debugging (null if console.createTask unavailable)\n  expect('_debugTask' in el).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  // _debugTask is set for async debugging (null if console.createTask unavailable)\n  expect('_debugTask' in el).toBe(true);\n};",
  ],
  [
    'React 19 element shape > createElement also produces _debugStack',
    '() => {\n  const el = React.createElement(Dummy, null);\n  // createElement in React 19 also captures Error("react-stack-top-frame")\n  expect(el._debugStack instanceof Error).toBe(true);\n}',
    '() => {\n  const el = React.createElement(Dummy, null);\n  // createElement in React 19 also captures Error("react-stack-top-frame")\n  expect(el._debugStack instanceof Error).toBe(true);\n};',
  ],
  [
    'React 19 element shape > createElement element does not have _source',
    "() => {\n  const el = React.createElement(Dummy, null);\n  expect('_source' in el).toBe(false);\n}",
    "() => {\n  const el = React.createElement(Dummy, null);\n  expect('_source' in el).toBe(false);\n};",
  ],
  [
    'React 19 element shape > createElement element does not have _self',
    "() => {\n  const el = React.createElement(Dummy, null);\n  expect('_self' in el).toBe(false);\n}",
    "() => {\n  const el = React.createElement(Dummy, null);\n  expect('_self' in el).toBe(false);\n};",
  ],
  [
    '_debugStack source location > _debugStack.stack has source location frames',
    "() => {\n  const el = <Dummy />;\n  const stack = el._debugStack.stack || '';\n  // Raw Hermes stacks reference the bundle, not original source files.\n  // Source filenames are available after symbolication (DevTools, error overlay).\n  expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  const stack = el._debugStack.stack || '';\n  // Raw Hermes stacks reference the bundle, not original source files.\n  // Source filenames are available after symbolication (DevTools, error overlay).\n  expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n};",
  ],
  [
    '_debugStack source location > elements on different lines have different _debugStack',
    '() => {\n  const el1 = <Dummy />;\n\n  const el2 = <Dummy />;\n  // Created on different lines, so the captured stacks differ\n  expect(el1._debugStack.stack).not.toBe(el2._debugStack.stack);\n}',
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el1 = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  const el2 = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  // Created on different lines, so the captured stacks differ\n  expect(el1._debugStack.stack).not.toBe(el2._debugStack.stack);\n};",
  ],
  [
    '_debugStack source location > _debugStack captures the calling function name',
    "() => {\n  function createWidget() {\n    return <Dummy />;\n  }\n  const el = createWidget();\n  const stack = el._debugStack.stack || '';\n  expect(stack.indexOf('createWidget') >= 0).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  function createWidget() {\n    return /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  }\n  const el = createWidget();\n  const stack = el._debugStack.stack || '';\n  expect(stack.indexOf('createWidget') >= 0).toBe(true);\n};",
  ],
  [
    '_debugStack source location > _debugStack captures class method name',
    "() => {\n  class WidgetFactory {\n    build() {\n      return <Dummy />;\n    }\n  }\n  const el = new WidgetFactory().build();\n  const stack = el._debugStack.stack || '';\n  expect(stack.indexOf('build') >= 0).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  class WidgetFactory {\n    build() {\n      return /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n    }\n  }\n  const el = new WidgetFactory().build();\n  const stack = el._debugStack.stack || '';\n  expect(stack.indexOf('build') >= 0).toBe(true);\n};",
  ],
  [
    '_debugStack source location > _debugStack captures arrow function name',
    "() => {\n  const makeElement = () => <Dummy />;\n  const el = makeElement();\n  const stack = el._debugStack.stack || '';\n  expect(stack.indexOf('makeElement') >= 0).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const makeElement = () => /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  const el = makeElement();\n  const stack = el._debugStack.stack || '';\n  expect(stack.indexOf('makeElement') >= 0).toBe(true);\n};",
  ],
  [
    '_debugStack source location > children have independent _debugStack',
    '() => {\n  function Parent({ children }) {\n    return null;\n  }\n  function Child() {\n    return null;\n  }\n  const parent = (\n    <Parent>\n      <Child />\n    </Parent>\n  );\n  const child = parent.props.children;\n  expect(parent._debugStack.stack).not.toBe(child._debugStack.stack);\n}',
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  function Parent({ children }) {\n    return null;\n  }\n  function Child() {\n    return null;\n  }\n  const parent = /* @__PURE__ */ _reactJsxRuntime.jsx(Parent, {\n    children: /* @__PURE__ */ _reactJsxRuntime.jsx(Child, {}),\n  });\n  const child = parent.props.children;\n  expect(parent._debugStack.stack).not.toBe(child._debugStack.stack);\n};",
  ],
  [
    '_debugStack source location > createElement _debugStack has source location',
    "() => {\n  const el = React.createElement(Dummy, null);\n  const stack = el._debugStack.stack || '';\n  expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n}",
    "() => {\n  const el = React.createElement(Dummy, null);\n  const stack = el._debugStack.stack || '';\n  expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n};",
  ],
  [
    '_debugStack vs __source equivalence > _debugStack provides full call chain (more than __source)',
    "() => {\n  function outerFactory() {\n    function innerFactory() {\n      return <Dummy />;\n    }\n    return innerFactory();\n  }\n  const el = outerFactory();\n  const stack = el._debugStack.stack || '';\n  // __source only had the immediate creation site.\n  // _debugStack has the full call chain — both functions visible.\n  expect(stack.indexOf('innerFactory') >= 0).toBe(true);\n  expect(stack.indexOf('outerFactory') >= 0).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  function outerFactory() {\n    function innerFactory() {\n      return /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n    }\n    return innerFactory();\n  }\n  const el = outerFactory();\n  const stack = el._debugStack.stack || '';\n  // __source only had the immediate creation site.\n  // _debugStack has the full call chain — both functions visible.\n  expect(stack.indexOf('innerFactory') >= 0).toBe(true);\n  expect(stack.indexOf('outerFactory') >= 0).toBe(true);\n};",
  ],
  [
    '_debugStack vs __source equivalence > manual Error().stack matches _debugStack format',
    "() => {\n  const el = <Dummy />;\n  const err = new Error('manual');\n  // Both use the same Hermes stack trace mechanism\n  expect(/:\\d+:\\d+/.test(el._debugStack.stack || '')).toBe(true);\n  expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  const err = new Error('manual');\n  // Both use the same Hermes stack trace mechanism\n  expect(/:\\d+:\\d+/.test(el._debugStack.stack || '')).toBe(true);\n  expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);\n};",
  ],
  [
    '__source and __self prop stripping > __source does not leak into JSX element props',
    '() => {\n  const el = <Dummy />;\n  expect(el.props.__source).toBe(undefined);\n}',
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  expect(el.props.__source).toBe(undefined);\n};",
  ],
  [
    '__source and __self prop stripping > __self does not leak into JSX element props',
    '() => {\n  const el = <Dummy />;\n  expect(el.props.__self).toBe(undefined);\n}',
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Dummy, {});\n  expect(el.props.__self).toBe(undefined);\n};",
  ],
  [
    '__source and __self prop stripping > createElement strips __source from props',
    "() => {\n  const el = React.createElement(Dummy, {\n    __source: { fileName: 'fake.js', lineNumber: 1, columnNumber: 0 },\n    label: 'hello',\n  });\n  // React 19 strips __source from props (line 961-962 of react.development.js)\n  expect(el.props.__source).toBe(undefined);\n  expect(el.props.label).toBe('hello');\n}",
    "() => {\n  const el = React.createElement(Dummy, {\n    __source: {\n      fileName: 'fake.js',\n      lineNumber: 1,\n      columnNumber: 0,\n    },\n    label: 'hello',\n  });\n  // React 19 strips __source from props (line 961-962 of react.development.js)\n  expect(el.props.__source).toBe(undefined);\n  expect(el.props.label).toBe('hello');\n};",
  ],
  [
    '__source and __self prop stripping > createElement strips __self from props',
    "() => {\n  const el = React.createElement(Dummy, {\n    __self: {},\n    label: 'hello',\n  });\n  // React 19 strips __self from props (line 961 of react.development.js)\n  expect(el.props.__self).toBe(undefined);\n  expect(el.props.label).toBe('hello');\n}",
    "() => {\n  const el = React.createElement(Dummy, {\n    __self: {},\n    label: 'hello',\n  });\n  // React 19 strips __self from props (line 961 of react.development.js)\n  expect(el.props.__self).toBe(undefined);\n  expect(el.props.label).toBe('hello');\n};",
  ],
  [
    '__source and __self prop stripping > regular props are preserved alongside stripped __source/__self',
    "() => {\n  const el = React.createElement(Dummy, {\n    __source: { fileName: 'x.js', lineNumber: 1, columnNumber: 0 },\n    __self: {},\n    foo: 1,\n    bar: 'two',\n    baz: true,\n  });\n  expect(el.props.foo).toBe(1);\n  expect(el.props.bar).toBe('two');\n  expect(el.props.baz).toBe(true);\n  expect(el.props.__source).toBe(undefined);\n  expect(el.props.__self).toBe(undefined);\n}",
    "() => {\n  const el = React.createElement(Dummy, {\n    __source: {\n      fileName: 'x.js',\n      lineNumber: 1,\n      columnNumber: 0,\n    },\n    __self: {},\n    foo: 1,\n    bar: 'two',\n    baz: true,\n  });\n  expect(el.props.foo).toBe(1);\n  expect(el.props.bar).toBe('two');\n  expect(el.props.baz).toBe(true);\n  expect(el.props.__source).toBe(undefined);\n  expect(el.props.__self).toBe(undefined);\n};",
  ],
  [
    'Hermes native source info > Error().stack has source location',
    "() => {\n  const err = new Error('test');\n  const stack = err.stack || '';\n  // Raw Hermes stacks have line:col; original filenames after symbolication\n  expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n}",
    "() => {\n  const err = new Error('test');\n  const stack = err.stack || '';\n  // Raw Hermes stacks have line:col; original filenames after symbolication\n  expect(/:\\d+:\\d+/.test(stack)).toBe(true);\n};",
  ],
  [
    'Hermes native source info > Error().stack has line:col numbers',
    "() => {\n  const err = new Error('test');\n  expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);\n}",
    "() => {\n  const err = new Error('test');\n  expect(/:\\d+:\\d+/.test(err.stack || '')).toBe(true);\n};",
  ],
  [
    'Hermes native source info > Error().stack preserves function name',
    "() => {\n  function renderProfile() {\n    return new Error('trace');\n  }\n  const err = renderProfile();\n  expect((err.stack || '').indexOf('renderProfile') >= 0).toBe(true);\n}",
    "() => {\n  function renderProfile() {\n    return new Error('trace');\n  }\n  const err = renderProfile();\n  expect((err.stack || '').indexOf('renderProfile') >= 0).toBe(true);\n};",
  ],
  [
    'Hermes native source info > Error().stack preserves class method name',
    "() => {\n  class Renderer {\n    render() {\n      return new Error('trace');\n    }\n  }\n  const err = new Renderer().render();\n  expect((err.stack || '').indexOf('render') >= 0).toBe(true);\n}",
    "() => {\n  class Renderer {\n    render() {\n      return new Error('trace');\n    }\n  }\n  const err = new Renderer().render();\n  expect((err.stack || '').indexOf('render') >= 0).toBe(true);\n};",
  ],
  [
    'Hermes native source info > Error().stack preserves arrow function name',
    "() => {\n  const buildView = () => new Error('trace');\n  const err = buildView();\n  expect((err.stack || '').indexOf('buildView') >= 0).toBe(true);\n}",
    "() => {\n  const buildView = () => new Error('trace');\n  const err = buildView();\n  expect((err.stack || '').indexOf('buildView') >= 0).toBe(true);\n};",
  ],
  [
    'Hermes native source info > nested call chain is preserved in Error().stack',
    "() => {\n  function database() {\n    return new Error('query failed');\n  }\n  function repository() {\n    return database();\n  }\n  function service() {\n    return repository();\n  }\n  const err = service();\n  const stack = err.stack || '';\n  expect(stack.indexOf('database') >= 0).toBe(true);\n  expect(stack.indexOf('repository') >= 0).toBe(true);\n  expect(stack.indexOf('service') >= 0).toBe(true);\n}",
    "() => {\n  function database() {\n    return new Error('query failed');\n  }\n  function repository() {\n    return database();\n  }\n  function service() {\n    return repository();\n  }\n  const err = service();\n  const stack = err.stack || '';\n  expect(stack.indexOf('database') >= 0).toBe(true);\n  expect(stack.indexOf('repository') >= 0).toBe(true);\n  expect(stack.indexOf('service') >= 0).toBe(true);\n};",
  ],
  [
    'component identification without __source > named function component has type.name',
    "() => {\n  function ProfileCard() {\n    return null;\n  }\n  const el = <ProfileCard />;\n  expect(el.type.name).toBe('ProfileCard');\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  function ProfileCard() {\n    return null;\n  }\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(ProfileCard, {});\n  expect(el.type.name).toBe('ProfileCard');\n};",
  ],
  [
    'component identification without __source > displayName is available on type',
    "() => {\n  function Comp() {\n    return null;\n  }\n  Comp.displayName = 'FancyButton';\n  const el = <Comp />;\n  expect(el.type.displayName).toBe('FancyButton');\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  function Comp() {\n    return null;\n  }\n  Comp.displayName = 'FancyButton';\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(Comp, {});\n  expect(el.type.displayName).toBe('FancyButton');\n};",
  ],
  [
    'component identification without __source > type.name works with createElement',
    "() => {\n  function UserAvatar() {\n    return null;\n  }\n  const el = React.createElement(UserAvatar, null);\n  expect(el.type.name).toBe('UserAvatar');\n}",
    "() => {\n  function UserAvatar() {\n    return null;\n  }\n  const el = React.createElement(UserAvatar, null);\n  expect(el.type.name).toBe('UserAvatar');\n};",
  ],
  [
    'component identification without __source > forwardRef render function name is accessible',
    "() => {\n  const FancyInput = React.forwardRef(function FancyInput() {\n    return null;\n  });\n  expect(FancyInput.render.name).toBe('FancyInput');\n}",
    "() => {\n  const FancyInput = React.forwardRef(function FancyInput() {\n    return null;\n  });\n  expect(FancyInput.render.name).toBe('FancyInput');\n};",
  ],
  [
    'component identification without __source > memo preserves inner component name',
    "() => {\n  function ExpensiveList() {\n    return null;\n  }\n  const Memoized = React.memo(ExpensiveList);\n  expect(Memoized.type.name).toBe('ExpensiveList');\n}",
    "() => {\n  function ExpensiveList() {\n    return null;\n  }\n  const Memoized = React.memo(ExpensiveList);\n  expect(Memoized.type.name).toBe('ExpensiveList');\n};",
  ],
  [
    'component identification without __source > anonymous component has empty name',
    "() => {\n  const el = React.createElement(function () {\n    return null;\n  }, null);\n  expect(el.type.name).toBe('');\n}",
    "() => {\n  const el = React.createElement(function () {\n    return null;\n  }, null);\n  expect(el.type.name).toBe('');\n};",
  ],
  [
    'component identification without __source > arrow component assigned to variable has name',
    "() => {\n  const MyArrow = () => null;\n  const el = <MyArrow />;\n  expect(el.type.name).toBe('MyArrow');\n}",
    "var _reactJsxRuntime = require('react/jsx-runtime');\n() => {\n  const MyArrow = () => null;\n  const el = /* @__PURE__ */ _reactJsxRuntime.jsx(MyArrow, {});\n  expect(el.type.name).toBe('MyArrow');\n};",
  ],
] as const satisfies readonly CorpusCase[];

runCorpus(cases, corpusConfig);
