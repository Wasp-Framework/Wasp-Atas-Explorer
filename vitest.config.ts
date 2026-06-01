import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '.',
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'node',
  },
});
