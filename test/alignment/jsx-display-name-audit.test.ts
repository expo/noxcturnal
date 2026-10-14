import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const requireExpo = createRequire(require.resolve('babel-preset-expo/package.json'));
const displayName = requireExpo('@babel/plugin-transform-react-display-name');
expect(requireExpo('@babel/plugin-transform-react-display-name/package.json').version).toBe(
  '7.29.7',
);
const preamble =
  'const React = { createClass: props => props }; const createReactClass = React.createClass;';
const cases = [
  {
    name: 'named default export file',
    filename: '/audit/Widget.jsx',
    body: 'export default React.createClass({});',
    expected: 'Widget',
    fails: false,
  },
  {
    name: 'index default export uses parent directory',
    filename: '/audit/widgets/index.jsx',
    body: 'export default React.createClass({});',
    expected: 'widgets',
    fails: true,
  },
  {
    name: 'identifier declaration',
    filename: '/audit/Widget.jsx',
    body: 'const View = createReactClass({}); export default View;',
    expected: 'View',
    fails: false,
  },
  {
    name: 'member assignment',
    filename: '/audit/Widget.jsx',
    body: 'const registry = {}; registry.View = React.createClass({}); export default registry.View;',
    expected: 'View',
    fails: false,
  },
  {
    name: 'object property',
    filename: '/audit/Widget.jsx',
    body: 'const registry = { View: React.createClass({}) }; export default registry.View;',
    expected: 'View',
    fails: false,
  },
  {
    name: 'explicit name preserved',
    filename: '/audit/Widget.jsx',
    body: 'const View = React.createClass({ displayName: "Explicit" }); export default View;',
    expected: 'Explicit',
    fails: false,
  },
];
describe.each(cases)('JSX display-name branch: $name', ({ filename, body, expected, fails }) => {
  let actual: unknown;
  beforeAll(async () => {
    const source = `${preamble} ${body}`;
    const reference = transformSync(source, {
      filename,
      sourceType: 'module',
      configFile: false,
      babelrc: false,
      plugins: [displayName],
    })!.code!;
    expect(((await importCode(reference)).default as { displayName?: string }).displayName).toBe(
      expected,
    );
    const code = compile(source, { jsx: 'classic' }, filename);
    expect(code).toContain('displayName');
    expect(code).not.toContain('@babel/runtime');
    actual = ((await importCode(code)).default as { displayName?: string }).displayName;
  });
  (fails ? test.fails : test)('selects the Babel-baseline display name', () => {
    expect(actual).toBe(expected);
  });
});

// Oxc deliberately extends static-property naming beyond Babel. These checks
// distinguish that extension from no-op branches and the index-file regression.
test.each([
  {
    name: 'static computed assignment',
    body: 'const target={}; target["View"] = React.createClass({}); export default target.View;',
    babelName: undefined,
    noxName: 'View',
  },
  {
    name: 'quoted object property',
    body: 'const target={"my-view": React.createClass({})}; export default target["my-view"];',
    babelName: undefined,
    noxName: 'my-view',
  },
  {
    name: 'dynamic computed assignment',
    body: 'const key="View", target={}; target[key] = React.createClass({}); export default target.View;',
    babelName: 'key',
    noxName: undefined,
  },
  {
    name: 'nonliteral argument',
    body: 'const props={}; const View = React.createClass(props); export default View;',
    babelName: undefined,
    noxName: undefined,
  },
  {
    name: 'multiple arguments',
    body: 'const View = React.createClass({}, 1); export default View;',
    babelName: undefined,
    noxName: undefined,
  },
  {
    name: 'unrelated callee',
    body: 'const Other={createClass: props=>props}; const View=Other.createClass({}); export default View;',
    babelName: undefined,
    noxName: undefined,
  },
  {
    name: 'statement boundary',
    body: 'function make(){return React.createClass({});} export default make();',
    babelName: undefined,
    noxName: undefined,
  },
  {
    name: 'computed explicit display name',
    body: 'const View=React.createClass({["displayName"]:"Explicit"}); export default View;',
    babelName: 'Explicit',
    noxName: 'Explicit',
  },
])('display-name extension or boundary: $name', async ({ body, babelName, noxName }) => {
  const source = `${preamble} ${body}`;
  const reference = transformSync(source, {
    filename: '/audit/Widget.jsx',
    sourceType: 'module',
    configFile: false,
    babelrc: false,
    plugins: [displayName],
  })!.code!;
  expect(((await importCode(reference)).default as { displayName?: string }).displayName).toBe(
    babelName,
  );
  const code = compile(source, { jsx: 'classic' }, '/audit/Widget.jsx');
  expect(code).not.toContain('@babel/runtime');
  expect(((await importCode(code)).default as { displayName?: string }).displayName).toBe(noxName);
});
