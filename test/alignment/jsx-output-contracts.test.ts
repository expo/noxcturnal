import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import development from '@babel/plugin-transform-react-jsx-development';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';
import { createRequire } from 'node:module';

describe('jsx automatic normalization', () => {
  // An actual imported ESM fixture records factory arguments without claiming
  // React rendering coverage. Both runtime entry points export the same recorder.
  const runtime =
    'export const jsx = (_type, props) => [props.value, props.children]; export const jsxs = jsx; export const jsxDEV = jsx;';
  const importSource = `data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}#`;
  const cases = [
    {
      name: 'multiline attribute and nonbreaking child spaces',
      fails: true,
      input: '<div value="first\n  second">first\n\u00a0second\u00a0\nthird</div>',
      expected: ['first second', 'first \u00a0second\u00a0 third'],
    },
    {
      name: 'entity-decoding control',
      fails: false,
      input: '<div value="ok">&amp;&#x1F600;</div>',
      expected: ['ok', '&😀'],
    },
  ];
  describe.each([false, true])('automatic JSX ESM execution, development=%s', dev => {
    describe.each(cases)('$name', ({ input, expected }) => {
      let actual: unknown;
      beforeAll(async () => {
        const source = `export const result = ${input};`;
        const babel = transformSync(source, {
          filename: '/audit/input.jsx',
          configFile: false,
          babelrc: false,
          plugins: [[dev ? development : jsx, { runtime: 'automatic', importSource }]],
        })!.code!;
        expect((await importCode(babel)).result).toEqual(expected);
        const code = compile(
          source,
          {
            jsx: dev ? 'automatic-development' : 'automatic',
            jsxImportSource: importSource,
          },
          '/audit/input.jsx',
        );
        expect(code).not.toContain('<div');
        expect(code).toContain(importSource + (dev ? '/jsx-dev-runtime' : '/jsx-runtime'));
        expect(code).not.toContain('@babel/runtime');
        actual = (await importCode(code)).result;
      });
      test('passes Babel-baseline attribute and child values to the runtime', () => {
        expect(actual).toEqual(expected);
      });
    });
  });
});

describe('jsx development abi', () => {
  const runtime = `
  export const Fragment = 'fragment';
  export function jsxDEV(type, props, key, staticChildren, source, self) {
    return { type, props, key, staticChildren, source, self: self?.marker };
  }
  export function createElement(type, props, ...children) {
    const { __source: source, __self: self, ...rest } = props;
    return { classic: true, type, props: rest, children, source, self: self?.marker };
  }
`;
  const importSource = `data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}#`;

  test.each([
    ['empty element', '<div/>'],
    ['one child', '<div key="key">text</div>'],
    ['multiple children', '<div><span/>text</div>'],
    ['empty fragment', '<></>'],
    ['one-child fragment', '<>text</>'],
    ['multiple-child fragment', '<><span/>text</>'],
    ['key after spread fallback', '<div {...{ id: 1 }} key="key">text</div>'],
  ])('development JSX runtime ABI: %s', async (_name, expression) => {
    const source = `function render() { return ${expression}; } export const result = render.call({ marker: 'receiver' });`;
    const babel = transformSync(source, {
      filename: '/audit/input.jsx',
      configFile: false,
      babelrc: false,
      plugins: [[development, { runtime: 'automatic', importSource }]],
    })!.code!;
    const expected = (await importCode(babel)).result;
    const code = compile(
      source,
      {
        jsx: 'automatic-development',
        jsxImportSource: importSource,
      },
      '/audit/input.jsx',
    );
    expect(code).not.toContain('</');
    expect(code).not.toContain('<div');
    expect(code).toContain(importSource);
    expect(code).not.toContain('@babel/runtime');
    const actual = (await importCode(code)).result;
    // Babel omits optional fragment debug arguments. This comparison exercises
    // rendering arguments; fragment metadata differences are audited separately.
    if (expression.startsWith('<>')) {
      const {
        source: _source,
        self: _self,
        ...actualRendering
      } = actual as Record<string, unknown>;
      const {
        source: _expectedSource,
        self: _expectedSelf,
        ...expectedRendering
      } = expected as Record<string, unknown>;
      expect(actualRendering).toEqual(expectedRendering);
    } else {
      expect(actual).toEqual(expected);
    }
  });

  describe('automatic development fragment before super in a nested class key', () => {
    let actual: unknown;
    beforeAll(async () => {
      const source = `
      class Base {}
      class Value extends Base {
        constructor() {
          class Inner { [<></>]() {} }
          super();
        }
      }
      export const result = new Value() instanceof Value;
    `;
      expect((await importCode(source.replace('<></>', '"key"'))).result).toBe(true);
      const babel = transformSync(source, {
        filename: '/audit/input.jsx',
        configFile: false,
        babelrc: false,
        plugins: [[development, { runtime: 'automatic', importSource }]],
      })!.code!;
      expect((await importCode(babel)).result).toBe(true);
      expect(
        (
          await importCode(
            compile(
              source,
              {
                jsx: 'classic-development',
                jsxPragma: 'factory',
                jsxPragmaFrag: 'React.Fragment',
              },
              '/audit/input.jsx',
            ).replace(
              /^/,
              'const React = { Fragment: "fragment" }; function factory() { return "key"; }',
            ),
          )
        ).result,
      ).toBe(true);
      const code = compile(
        source,
        {
          jsx: 'automatic-development',
          jsxImportSource: importSource,
        },
        '/audit/input.jsx',
      );
      expect(code).not.toContain('<>');
      expect(code).toContain('jsxDEV');
      expect(code).not.toContain('@babel/runtime');
      try {
        actual = (await importCode(code)).result;
      } catch (error) {
        expect(error).toBeInstanceOf(ReferenceError);
        actual = { error: 'ReferenceError' };
      }
    });
    test('does not introduce an enclosing receiver read for a fragment', () => {
      expect(actual).toBe(true);
    });
  });
});

describe('jsx display name', () => {
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
  describe.each(cases)('JSX display-name branch: $name', ({ filename, body, expected }) => {
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
    test('selects the Babel-baseline display name', () => {
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
    expect(((await importCode(code)).default as { displayName?: string }).displayName).toBe(
      noxName,
    );
  });
});

describe('jsx key children', () => {
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    const runtime = {
      Fragment: 'fragment',
      createElement: (_type: unknown, props: unknown, ...children: unknown[]) => ({
        props,
        children,
      }),
      jsx: (_type: unknown, props: unknown, key: unknown) => ({ props, key }),
      jsxs: (_type: unknown, props: unknown, key: unknown) => ({ props, key }),
    };
    new Function('React', 'require', 'globalThis', code)(runtime, () => runtime, context);
    return context.result;
  }

  describe.each(['classic', 'automatic'] as const)('JSX keys and spread children: %s', mode => {
    function babel(source: string): string {
      return transformSync(source, {
        filename: 'input.jsx',
        sourceType: 'script',
        configFile: false,
        babelrc: false,
        plugins: [[jsx, { runtime: mode }]],
      })!.code!;
    }
    test.each(['<div key/>', '<div {...{}} key/>'])('rejects valueless key in %s', expression => {
      const source = `globalThis.result = ${expression};`;
      expect(() => babel(source)).toThrow(/explicit key value/);
      expect(() => compile(source, { jsx: mode }, 'input.jsx')).toThrow(/transform-error/);
    });
    test('accepts an explicit boolean key', () => {
      const source = 'globalThis.result = <div key={true}/>;';
      const expected =
        mode === 'classic' ? { props: { key: true }, children: [] } : { props: {}, key: true };
      expect(observe(babel(source))).toEqual(expected);
      const code = compile(source, { jsx: mode }, 'input.jsx');
      expect(code).not.toContain('<div');
      expect(observe(code)).toEqual(expected);
    });
    test('retains the Babel baseline for duplicate-key effects', () => {
      const source = `
      const events = [];
      const view = <div key={events.push('first')} key={events.push('second')}/>;
      globalThis.result = [events, view];
    `;
      const expected =
        mode === 'classic'
          ? [['first', 'second'], { props: { key: 2 }, children: [] }]
          : [['second'], { props: {}, key: 1 }];
      expect(observe(babel(source))).toEqual(expected);
      const code = compile(source, { jsx: mode }, 'input.jsx');
      expect(code).not.toContain('<div');
      expect(observe(code)).toEqual(expected);
    });
    test.each([false, true])('spread-child extension, mixed=%s', mixed => {
      const setup = `
      const events = [];
      const values = { *[Symbol.iterator]() { events.push('start'); yield 1; events.push('end'); yield 2; } };
    `;
      const expression = mixed ? '<>{...values}{events.push("after")}</>' : '<>{...values}</>';
      const result = `globalThis.result = [events, ${mode === 'classic' ? 'view.children' : 'view.props.children'}];`;
      const source = `${setup} const view = ${expression}; ${result}`;
      expect(() => babel(source)).toThrow(/Spread children are not supported/);
      // Oxc intentionally accepts this extension. Ordinary iterable spreading is
      // the semantic control; Babel rejection is not a runtime oracle.
      const explicit = `${setup} const children = [...values${mixed ? ', events.push("after")' : ''}]; globalThis.result = [events, children];`;
      const expected = mixed
        ? [
            ['start', 'end', 'after'],
            [1, 2, 3],
          ]
        : [
            ['start', 'end'],
            [1, 2],
          ];
      expect(observe(explicit)).toEqual(expected);
      const code = compile(source, { jsx: mode }, 'input.jsx');
      expect(code).not.toContain('<>');
      expect(observe(code)).toEqual(expected);
    });
  });
});

describe('jsx sole spread', () => {
  const require = createRequire(import.meta.url);
  const cases = [
    {
      name: 'external object identity and getter',
      source:
        'const events=[];const source={get value(){events.push("get");return 3}};const props=<div {...source}/>;globalThis.result=[props===source,events.slice(),props.value,events];',
    },
    {
      name: 'literal getter flattening',
      source:
        'const events=[];const props=<div {...{get value(){events.push("get");return 3}}}/>;globalThis.result=[events.slice(),typeof Object.getOwnPropertyDescriptor(props,"value").get,props.value,events];',
    },
    {
      name: 'literal prototype setter',
      source:
        'const prototype={inherited:3};const props=<div {...{__proto__:prototype,value:4}}/>;globalThis.result=[props.value,props.inherited,Object.hasOwn(props,"__proto__"),Object.getPrototypeOf(props)===prototype];',
    },
    {
      name: 'bound prototype object control',
      source:
        'const prototype={inherited:3};const source={__proto__:prototype,value:4};const props=<div {...source}/>;globalThis.result=[props.value,props.inherited,Object.hasOwn(props,"__proto__"),Object.getPrototypeOf(props)===prototype];',
    },
  ] as const;
  function run(code: string) {
    const context: { result?: unknown } = {};
    new Function('React', 'require', 'globalThis', code)(
      { createElement: (_tag: unknown, props: unknown) => props },
      require,
      context,
    );
    return context.result;
  }

  for (const [index, entry] of cases.entries()) {
    for (const development of [false, true]) {
      describe(`${entry.name}; development=${development}`, () => {
        const usesHelper = index === 2 || (development && (index === 0 || index === 3));
        const modes = usesHelper ? (['inline', 'runtime'] as const) : (['inline'] as const);
        for (const mode of modes) {
          let actual: unknown;
          let expected: unknown;
          beforeAll(() => {
            const babel = transformSync(entry.source, {
              configFile: false,
              babelrc: false,
              sourceType: 'script',
              filename: 'input.jsx',
              plugins: [
                [
                  require(
                    development
                      ? '@babel/plugin-transform-react-jsx-development'
                      : '@babel/plugin-transform-react-jsx',
                  ),
                  { runtime: 'classic', useBuiltIns: false, useSpread: false },
                ],
                ...(mode === 'runtime'
                  ? [
                      [
                        require('@babel/plugin-transform-runtime'),
                        { version: '7.29.7', useESModules: false },
                      ],
                    ]
                  : []),
              ],
            })!.code!;
            expected =
              index === 0
                ? [!development, development ? ['get'] : [], 3, ['get']]
                : index === 1
                  ? [[], 'function', 3, ['get']]
                  : index === 2 || !development
                    ? [4, 3, false, true]
                    : [4, undefined, false, false];
            expect(babel).not.toContain('<div');
            expect(run(babel)).toEqual(expected);
            const nox = compile(
              entry.source,
              {
                jsx: development ? 'classic-development' : 'classic',
                helpers: { mode, version: '7.29.7' },
              },
              'input.jsx',
            );
            expect(nox).not.toContain('<div');
            if (usesHelper && index !== 2 && mode === 'runtime')
              expect(nox).toContain('@babel/runtime/helpers/extends');
            else expect(nox).not.toContain('@babel/runtime');
            actual = run(nox);
          });
          test(mode, () => expect(actual).toEqual(expected));
        }
      });
    }
  }
});
