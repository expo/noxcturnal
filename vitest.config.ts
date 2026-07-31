import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['js/**/__tests__/**/*.test.ts', 'test/**/*.test.ts'],
    benchmark: { include: ['js/**/__benchmarks__/**/*.bench.ts'] },
    coverage: {
      provider: 'v8',
      include: ['js/**/*.ts'],
      exclude: ['js/**/__tests__/**', 'js/**/__benchmarks__/**', 'js/generated/**'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
    typecheck: {
      include: ['js/**/*.test-d.ts'],
      tsconfig: './tsconfig.json',
    },
  },
});
