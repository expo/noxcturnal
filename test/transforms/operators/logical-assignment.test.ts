import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('lowers logical assignment', async () => {
  expect(
    await transformSource(`value ||= fallback;`, 'input.js', {
      transforms: { logicalAssignmentOperators: true },
    }),
  ).toMatchInlineSnapshot(`"value || (value = fallback);"`);
});

test('lowers all logical assignments to private fields', async () => {
  const output = await transformSource(
    `
      class Values {
        #or = 0;
        #and = 1;
        #nullish = null;
        update() {
          this.#or ||= 2;
          this.#and &&= 3;
          this.#nullish ??= 4;
        }
      }
    `,
    'input.js',
    { transforms: { logicalAssignmentOperators: true } },
  );

  expect(output).not.toMatch(/(?:\|\|=|&&=|\?\?=)/);
  expect(output).toContain('this.#or || (this.#or = 2)');
  expect(output).toContain('this.#and && (this.#and = 3)');
  expect(output).toContain('this.#nullish ?? (this.#nullish = 4)');
});

test('memoizes an effectful private-field receiver with a collision-free binding', async () => {
  const output = await transformSource(
    `
      const _this$self = 'user binding';
      class Value {
        #value = 0;
        self() { return this; }
        update() { return this.self().#value ||= 2; }
      }
    `,
    'input.js',
    { transforms: { logicalAssignmentOperators: true } },
  );

  expect(output).not.toMatch(/\|\|=/);
  expect(output).toContain('var _this$self2;');
  expect(output).toContain('(_this$self2 = this.self()).#value || (_this$self2.#value = 2)');
});
