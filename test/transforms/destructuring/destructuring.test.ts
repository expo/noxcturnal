import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers destructuring', async () => {
  const source = `const { value } = record; const [first] = values; export { value, first };`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { destructuring: true },
    }),
  ).toMatchInlineSnapshot(`
    "import _babelHelper from '@babel/runtime/helpers/slicedToArray';
    import _babelHelper2 from '@babel/runtime/helpers/toConsumableArray';
    import _babelHelper3 from '@babel/runtime/helpers/objectDestructuringEmpty';
    var _toArray2 = {
      slicedToArray: _babelHelper,
      toConsumableArray: _babelHelper2,
    };
    function _toArray(r, e, a) {
      return a ? _toArray2.toConsumableArray(r) : _toArray2.slicedToArray(r, e);
    }
    var _objectDestructuringEmpty2 = { objectDestructuringEmpty: _babelHelper3 };
    function _objectDestructuringEmpty(t) {
      return (_objectDestructuringEmpty2.objectDestructuringEmpty(t), t);
    }
    const _obj = _objectDestructuringEmpty(record),
      value = _obj.value;
    const _arr = _toArray(values, 1, false),
      first = _arr[0];
    export { value, first };"
  `);
});

test('accepts defaults nested in a for-of binding pattern', async () => {
  const source = `export function entries({ params = {} } = {}) {
  const result = [];
  for (const [key, value = ''] of Object.entries(params)) result.push([key, value]);
  return result;
}`;
  const output = await transformSource(source, 'input.js', {
    helpers: runtimeHelpers,
    transforms: { blockScoping: true, destructuring: true, parameters: true },
  });
  expect(output).toMatch(/value = (_value\d+) === void 0 \? '' : \1/);
  expect(output).not.toContain('= void 0 of');
});

test('keeps destructuring temporaries local to reentrant concise arrows', async () => {
  const source = `let a, b;
    const f = obj => ({a, b} = obj);
    const inner = {a: 2, b: 20};
    const outer = {get a() {f(inner); return 1}, b: 10};
    f(outer);`;
  const output = await transformSource(source, 'input.js', {
    helpers: { mode: 'inline' },
    transforms: { destructuring: true },
  });
  expect(new Function(`${source}; return [a, b];`)()).toEqual([1, 10]);
  expect(new Function(`${output}; return [a, b];`)()).toEqual([1, 10]);
});

test('keeps destructuring temporaries visible to concise-arrow parameter defaults', async () => {
  const source = `'use strict'; let a; const f = (x = ({a} = {a: 1})) => x; f();`;
  const output = await transformSource(source, 'input.js', {
    helpers: { mode: 'inline' },
    transforms: { destructuring: true },
  });
  expect(new Function(`${output}; return a;`)()).toBe(1);
});
