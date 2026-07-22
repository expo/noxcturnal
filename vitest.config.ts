import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    benchmark: { include: ['benchmark/**/*.bench.ts'] },
  },
});
