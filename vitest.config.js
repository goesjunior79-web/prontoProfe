import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/**', '.next/**', 'out/**', 'build/**'],
    globals: true,
  },
});
