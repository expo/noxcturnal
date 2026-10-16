import { expect } from 'vitest';
import { flowTest, transformSource } from '../transform';

flowTest('lowers Flow record declarations and expressions without a parser adapter', async () => {
  const code = await transformSource(
    `// @flow
    record Point<T> implements Readable<T> {
      x: T,
      y: number = 2,
      sum(): number { return this.x + this.y; }
      static origin: Point = Point { x: (0: number) },
    }
    const value = Point<number> { x: (1: number), ...rest };`,
    'input.js',
    {},
  );
  expect(code).toContain('class Point');
  expect(code).toContain('constructor({ x, y = 2 })');
  expect(code).toContain('this.x = x;');
  expect(code).toContain('static origin = new Point({ x: 0 });');
  expect(code).toContain('const value = new Point({ x: 1, ...rest });');
  expect(code).not.toMatch(/\brecord\b|implements|<number>|: number/);
});
