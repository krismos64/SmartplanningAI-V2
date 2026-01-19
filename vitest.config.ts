import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/__tests__': path.resolve(__dirname, './__tests__'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 15000,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        // Shadcn/ui base components (tested by Radix)
        'src/components/ui/**',
        // App router pages (E2E tests)
        'src/app/**',
        // Type definitions
        'src/types/**',
        // Providers (tested via integration)
        'src/components/providers/**',
        // Library utilities (integration tested)
        'src/lib/**',
        // Hooks (integration tested)
        'src/hooks/**',
        // Layout components (E2E tested)
        'src/components/layout/**',
        'src/components/shared/**',
        // Toast provider (integration tested)
        'src/components/toast/**',
        // Validation schemas (unit tested via form tests)
        'src/lib/validations/**',
      ],
      // TODO: Remonter progressivement après ajout des tests
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 20,
        statements: 20,
      },
    },
  },
})
