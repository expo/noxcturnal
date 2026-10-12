import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers block-scoped declarations', async () => {
  const source = `export function read(flag) { if (flag) { let value = 1; return value; } }`;
  expect(await transformSource(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "export function read(flag) {
      if (flag) {
        var value = 1;
        return value;
      }
    }"
  `);
});

test.each([
  { name: 'block scoping alone', transforms: { blockScoping: true } },
  { name: 'with for-of lowering', transforms: { blockScoping: true, forOf: true } },
])('terminates for an iterable arrow with a local declaration: $name', async ({ transforms }) => {
  const output = await transformSource(
    'for (const t of (u => { const r = u; return r; })(o)) void 0;',
    'input.js',
    { transforms },
  );
  expect(output).toContain('var r = u');
  expect(output).not.toContain('_loop');
  expect(output).not.toMatch(/\bconst\b/);
  if (transforms.forOf) expect(output).toContain('[Symbol.iterator]()');
});

test('uses the Babel runtime readOnlyError helper when runtime helpers are selected', async () => {
  const output = await transformSource(`const value = 1; value = sideEffect();`, 'input.js', {
    helpers: runtimeHelpers,
    transforms: { blockScoping: true },
  });
  expect(output).toContain("require('@babel/runtime/helpers/readOnlyError')");
  expect(output).toContain("sideEffect(), _readOnlyError('value')");
});

test('initializer-only captures do not extract the loop body', async () => {
  const output = await transformSource(
    'outer: for (let read = () => i, i = 0; i < 3; i++) { use(read()); continue outer; }',
    'input.js',
    { transforms: { blockScoping: true } },
  );
  expect(output).not.toContain('_loop');
  expect(output).not.toContain('_first');
  expect(output).not.toMatch(/\b(?:let|const)\b/);
  expect(output).toContain('continue outer');
});

test('keeps initialized iteration-local vars inside the captured helper', async () => {
  const output = await transformSource(
    `function run() {
      const reads = []; let sum = 0;
      for (let i = 0; i < 3; i++) {
        reads.push(() => i);
        var local = i;
        var escaped = i;
        sum += local;
      }
      return [sum, escaped, reads];
    }`,
    'input.js',
    { transforms: { blockScoping: true } },
  );
  expect(output).toContain('_loop');
  expect(output).toContain('var local = i;');
  expect(output).toContain('var escaped;');
  expect(output).toContain('escaped = i;');
});

test.each([
  {
    name: 'for-of function expression',
    source: 'for (let item of (function () { let items = input; return items; })()) use(item);',
  },
  {
    name: 'for-of arrow with destructured default parameters',
    source:
      'for (let item of (({ items = [] } = {}) => { let values = items; return values; })(input)) use(item);',
  },
  {
    name: 'for-of generator expression',
    source: 'for (let item of (function* () { let value = input; yield value; })()) use(item);',
  },
  {
    name: 'for-in object method',
    source: 'for (let key in ({ read() { let value = input; return value; } }).read()) use(key);',
  },
  {
    name: 'for initializer',
    source: 'for (let i = (() => { let start = 0; return start; })(); i < 2; i++) use(i);',
  },
  {
    name: 'for test',
    capturesHeader: true,
    source: 'for (let i = 0; (() => { let limit = 2; return i < limit; })(); i++) use(i);',
  },
  {
    name: 'for update',
    capturesHeader: true,
    source: 'for (let i = 0; i < 2; (() => { let step = 1; i += step; })()) use(i);',
  },
  {
    name: 'while test',
    source: 'while ((() => { let value = next(); return value; })()) work();',
  },
  {
    name: 'do-while test',
    source: 'do { work(); } while ((() => { let value = next(); return value; })());',
  },
])('lowers loop headers: $name', async ({ source, capturesHeader }) => {
  const output = await transformSource(source, 'input.js', { transforms: { blockScoping: true } });
  expect(output).not.toMatch(/\b(?:let|const)\b/);
  expect(output).toMatch(/\bvar\b/);
  if (capturesHeader) expect(output).toContain('_loop');
  else expect(output).not.toContain('_loop');
});
