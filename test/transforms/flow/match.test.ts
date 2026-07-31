import { expect } from 'vitest';
import { flowTest, transformSource } from '../transform';

flowTest('lowers Flow match expressions', async () => {
  const source = `/** @flow */
const label = match (value) { 0 => 'none', const count => String(count) };`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "/** @flow */
    const label = ($$gen$m0 => {
      if ($$gen$m0 === 0) {
        return 'none';
      }
      {
        const count = $$gen$m0;
        return String(count);
      }
    })(value);"
  `);
});

flowTest('lowers match statements with wildcard cases', async () => {
  expect(
    await transformSource(
      `// @flow\nmatch (value) { 1 => { one(); }, _ => { other(); } }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    $$gen$m0: {
      if (value === 1) {
        one();
        break $$gen$m0;
      }
      {
        other();
        break $$gen$m0;
      }
    }"
  `);
});

flowTest('adds a fallthrough error to non-exhaustive match statements', async () => {
  expect(await transformSource(`// @flow\nmatch (value) { 1 => { one(); } }`, 'input.js', {}))
    .toMatchInlineSnapshot(`
    "// @flow
    $$gen$m0: {
      if (value === 1) {
        one();
        break $$gen$m0;
      }
      throw Error(
        "Match: No case succesfully matched. Make exhaustive or add a wildcard case using '_'. Argument: " +
          value,
      );
    }"
  `);
});

flowTest('lowers guarded statement and expression cases', async () => {
  const source = `// @flow
match (value) { 1 if (enabled) => { one(); }, _ => {} }
export const result = match (value) { 1 if (enabled) => 'one', _ => 'other' };`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    $$gen$m0: {
      if (value === 1) {
        if (enabled) {
          one();
          break $$gen$m0;
        }
      }
      {
        break $$gen$m0;
      }
    }
    export const result = value === 1 && enabled ? 'one' : 'other';"
  `);
});

flowTest('evaluates complex match arguments once', async () => {
  const source = `// @flow
match (read()) { 1 => { one(); }, _ => {} }
export const result = match (read()) { const value => value };`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    $$gen$m0: {
      const $$gen$m1 = read();
      if ($$gen$m1 === 1) {
        one();
        break $$gen$m0;
      }
      {
        break $$gen$m0;
      }
    }
    export const result = ($$gen$m2 => {
      {
        const value = $$gen$m2;
        return value;
      }
    })(read());"
  `);
});

flowTest('lowers object patterns with bindings and rest', async () => {
  const source = `// @flow
export const result = match (value) {
  { kind: 'item', const id, ...const rest } => [id, rest],
  _ => null,
};`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    export const result = ($$gen$m0 => {
      if (
        ((typeof $$gen$m0 === 'object' && $$gen$m0 !== null) || typeof $$gen$m0 === 'function') &&
        $$gen$m0.kind === 'item' &&
        'id' in $$gen$m0
      ) {
        const id = $$gen$m0.id;
        const { kind: $$gen$m1, id: $$gen$m2, ...rest } = $$gen$m0;
        return [id, rest];
      }
      return null;
    })(value);"
  `);
});

flowTest('lowers array patterns with exact length and rest', async () => {
  const source = `// @flow
export const exact = match (value) { [1] => true, _ => false };
export const remaining = match (value) { [1, ...const rest] => rest, _ => [] };`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    export const exact = Array.isArray(value) && value.length === 1 && value[0] === 1 ? true : false;
    export const remaining = ($$gen$m0 => {
      if (Array.isArray($$gen$m0) && $$gen$m0.length >= 1 && $$gen$m0[0] === 1) {
        const rest = $$gen$m0.slice(1);
        return rest;
      }
      return [];
    })(value);"
  `);
});

flowTest('lowers instance and alias patterns', async () => {
  const source = `// @flow
export const boxed = match (value) { Box { const item } => item, _ => null };
export const whole = match (value) { [1] as array => array, _ => null };`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    export const boxed = ($$gen$m0 => {
      if ($$gen$m0 instanceof Box && 'item' in $$gen$m0) {
        const item = $$gen$m0.item;
        return item;
      }
      return null;
    })(value);
    export const whole = ($$gen$m1 => {
      if (Array.isArray($$gen$m1) && $$gen$m1.length === 1 && $$gen$m1[0] === 1) {
        const array = $$gen$m1;
        return array;
      }
      return null;
    })(value);"
  `);
});

flowTest('lowers alternation, NaN, and member-reference patterns', async () => {
  const source = `// @flow
export const result = match (value) {
  1 | 2 => 'low',
  NaN => 'nan',
  constants.value => 'reference',
  _ => 'other',
};`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    export const result =
      value === 1 || value === 2
        ? 'low'
        : Number.isNaN(value)
          ? 'nan'
          : value === constants.value
            ? 'reference'
            : 'other';"
  `);
});

flowTest('uses canonical property names for string and numeric keys', async () => {
  const source = `// @flow
export const result = match (value) {
  { 'space key': 1, 0x10: const item } => item,
  _ => null,
};`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    export const result = ($$gen$m0 => {
      if (
        ((typeof $$gen$m0 === 'object' && $$gen$m0 !== null) || typeof $$gen$m0 === 'function') &&
        $$gen$m0['space key'] === 1 &&
        '16' in $$gen$m0
      ) {
        const item = $$gen$m0[0x10];
        return item;
      }
      return null;
    })(value);"
  `);
});

flowTest('erases Flow syntax retained inside cases and guards', async () => {
  const source = `// @flow
match (value) { 1 => { const item: number = 1; }, _ => {} }
export const result = match (value) { const item if (item as number) => (item: number), _ => 0 };`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    $$gen$m0: {
      if (value === 1) {
        const item = 1;
        break $$gen$m0;
      }
      {
        break $$gen$m0;
      }
    }
    export const result = ($$gen$m1 => {
      {
        const item = $$gen$m1;
        if (item) return item;
      }
      return 0;
    })(value);"
  `);
});

flowTest('drops unreachable cases below a wildcard', async () => {
  expect(
    await transformSource(
      `// @flow\nmatch (value) { _ => { live(); }, 1 => { dead(); } }`,
      'input.js',
      {},
    ),
  ).toMatchInlineSnapshot(`
    "// @flow
    $$gen$m0: {
      {
        live();
        break $$gen$m0;
      }
    }"
  `);
});

flowTest('avoids collisions with generated match bindings', async () => {
  const source = `// @flow
const $$gen$m0 = 1;
match (value) { _ => { use($$gen$m0); } }`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    const $$gen$m0 = 1;
    $$gen$m1: {
      {
        use($$gen$m0);
        break $$gen$m1;
      }
    }"
  `);
});

flowTest('preserves await through binding and non-binding match cases', async () => {
  const source = `// @flow
export async function binding() {
  return match (value) { const item => await read(item) };
}
export async function direct() {
  return match (value) { 1 => await read(1), _ => null };
}`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    export async function binding() {
      return await (async $$gen$m0 => {
        {
          const item = $$gen$m0;
          return await read(item);
        }
      })(value);
    }
    export async function direct() {
      return value === 1 ? await read(1) : null;
    }"
  `);
});

flowTest('preserves yield when match cases do not bind', async () => {
  const source = `// @flow
export function* values() {
  return match (value) { 1 => yield 1, _ => 0 };
}`;
  expect(await transformSource(source, 'input.js', {})).toMatchInlineSnapshot(`
    "// @flow
    export function* values() {
      return value === 1 ? yield 1 : 0;
    }"
  `);
});
