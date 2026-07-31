import { expect, test } from 'vitest';
import { transformSource } from '../transform';

const jsx = `export const view = <><Widget value="ok" />text</>;`;

test('preserves JSX', async () => {
  expect(await transformSource(jsx, 'input.jsx', { jsx: 'preserve' })).toMatchInlineSnapshot(`
    "export const view = (
      <>
        <Widget value="ok" />
        text
      </>
    );"
  `);
});

test('uses the classic runtime', async () => {
  expect(await transformSource(jsx, 'input.jsx', { jsx: 'classic' })).toMatchInlineSnapshot(`
    "export const view = /* @__PURE__ */ React.createElement(
      React.Fragment,
      null,
      /* @__PURE__ */ React.createElement(Widget, { value: 'ok' }),
      'text',
    );"
  `);
});

test('uses the classic development runtime', async () => {
  expect(await transformSource(jsx, 'input.jsx', { jsx: 'classic-development' }))
    .toMatchInlineSnapshot(`
    "var _jsxFileName = 'input.jsx';
    export const view = /* @__PURE__ */ React.createElement(
      React.Fragment,
      null,
      /* @__PURE__ */ React.createElement(Widget, {
        value: 'ok',
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 1,
          columnNumber: 23,
        },
      }),
      'text',
    );"
  `);
});

test('uses the automatic runtime', async () => {
  expect(await transformSource(jsx, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from 'react/jsx-runtime';
    export const view = /* @__PURE__ */ _jsxs(_Fragment, {
      children: [/* @__PURE__ */ _jsx(Widget, { value: 'ok' }), 'text'],
    });"
  `);
});

test('uses the automatic development runtime', async () => {
  expect(await transformSource(jsx, 'input.jsx', { jsx: 'automatic-development' }))
    .toMatchInlineSnapshot(`
    "var _jsxFileName = 'input.jsx';
    import { jsxDEV as _jsxDEV, Fragment as _Fragment } from 'react/jsx-dev-runtime';
    export const view = _jsxDEV(
      _Fragment,
      {
        children: [
          _jsxDEV(
            Widget,
            { value: 'ok' },
            void 0,
            false,
            {
              fileName: _jsxFileName,
              lineNumber: 1,
              columnNumber: 23,
            },
            this,
          ),
          'text',
        ],
      },
      void 0,
      true,
      {
        fileName: _jsxFileName,
        lineNumber: 1,
        columnNumber: 21,
      },
      this,
    );"
  `);
});

test('conditionally uses the automatic runtime when JSX is present', async () => {
  expect(await transformSource(jsx, 'input.jsx', { jsx: 'automatic-if-present' }))
    .toMatchInlineSnapshot(`
    "import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from 'react/jsx-runtime';
    export const view = /* @__PURE__ */ _jsxs(_Fragment, {
      children: [/* @__PURE__ */ _jsx(Widget, { value: 'ok' }), 'text'],
    });"
  `);
});

test('conditionally preserves source bytes when JSX is absent', async () => {
  const source = `export const value = 1;`;
  expect(
    await transformSource(source, 'input.js', { jsx: 'automatic-if-present' }),
  ).toMatchInlineSnapshot(`"export const value = 1;"`);
});

test('uses a custom automatic runtime import source', async () => {
  expect(
    await transformSource(jsx, 'input.jsx', {
      jsx: 'automatic',
      jsxImportSource: 'custom-jsx',
    }),
  ).toMatchInlineSnapshot(`
    "import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from 'custom-jsx/jsx-runtime';
    export const view = /* @__PURE__ */ _jsxs(_Fragment, {
      children: [/* @__PURE__ */ _jsx(Widget, { value: 'ok' }), 'text'],
    });"
  `);
});

test('uses custom classic factory and fragment pragmas', async () => {
  expect(
    await transformSource(jsx, 'input.jsx', {
      jsx: 'classic',
      jsxPragma: 'h',
      jsxPragmaFrag: 'Fragment',
    }),
  ).toMatchInlineSnapshot(`
    "export const view = /* @__PURE__ */ h(
      Fragment,
      null,
      /* @__PURE__ */ h(Widget, { value: 'ok' }),
      'text',
    );"
  `);
});
