import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://taskflow:taskflow@localhost:5432/taskflow_test',
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'test',
    },
  },
});
