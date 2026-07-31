import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['js/**/__tests__/**/*.test.ts', 'test/**/*.test.ts'],
    benchmark: { include: ['js/**/__benchmarks__/**/*.bench.ts'] },
    typecheck: {
      include: ['js/**/*.test-d.ts'],
      tsconfig: './tsconfig.json',
    },
  },
});
