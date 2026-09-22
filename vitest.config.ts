import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: {
      exclude: [
        '**/*.config.*',
        '**/*.d.ts',
        'lib/shims-vue.d.ts',
        'lib/style.css.d.ts',
        'tests/**',
      ],
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: 'happy-dom',
  },
});
