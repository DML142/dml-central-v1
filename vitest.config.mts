import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    globals: true,
    // Node 25 ships its own `localStorage` global, which shadows jsdom's and is a stub unless
    // `--localstorage-file` is given. Turning it off hands the tests jsdom's real `Storage`.
    pool: 'forks',
    execArgv: ['--no-experimental-webstorage'],
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/stores/**'],
      thresholds: { statements: 80 },
    },
  },
});
