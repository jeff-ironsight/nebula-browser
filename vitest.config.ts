import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tsconfigPaths({ projects: ['tsconfig.app.json'] })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/config/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        'src/components/ui/**',
        '**/tests/**',
        '**/*.d.ts',
        '**/*.test.ts',
        'src/types/**',
        '**/env.ts',
        '**/main.ts',
        'src/App.vue',
      ],
    },
  },
})
