/**
 * Tests d'intégration sur une vraie base PostgreSQL (SP-619)
 *
 * La suite unitaire mocke Prisma : elle ne peut pas reproduire une course
 * entre deux transactions, ni prouver qu'un verrou tient. Ces tests parlent à
 * la base pointée par DATABASE_URL, qui doit être locale (garde-fou dans le
 * setup), créent leur propre entreprise et la suppriment en sortant.
 *
 * Lancement : `npm run test:integration`. En CI, dans le job E2E, qui dispose
 * déjà d'une base migrée.
 */

import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/__tests__': path.resolve(__dirname, './__tests__'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./__tests__/integration/setup.ts'],
    include: ['__tests__/integration/**/*.test.ts'],
    // Un seul fichier à la fois : chaque fichier mesure ses propres courses
    fileParallelism: false,
  },
})
