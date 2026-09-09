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
    include: [
      '__tests__/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      // SP-592 : `src/lib/**`, `src/hooks/**` et `src/lib/validations/**` ont
      // ete retires de cette liste. Ils portent l'authentification, le RBAC,
      // l'isolation companyId, la facturation et la validation Zod, et la
      // mesure les ignorait.
      //
      // La mesure a d'ailleurs dementi l'hypothese de depart : la couverture
      // globale MONTE en les incluant, de 43,4 % a 45,2 %. Ces dossiers sont
      // mieux couverts que la moyenne du projet (src/lib/actions 67,7 %,
      // src/lib/services 76,2 %, src/lib/stripe 95,9 %, permissions.ts et
      // impersonation.ts a 100 %). Ce qui tirait le chiffre vers le bas, ce
      // sont les composants de page, pas le code critique.
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        // Composants Shadcn/ui, testes en amont par Radix
        'src/components/ui/**',
        // Definitions de types, sans logique executable
        'src/types/**',
        // Pages et layouts de l'App Router : couverts par les E2E, et un
        // composant de page rendu sans logique est precisement le test
        // cosmetique supprime en mars 2026. `src/app/api/**` reste mesure,
        // les routes API portant de la logique.
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
        'src/app/**/not-found.tsx',
        'src/app/**/template.tsx',
        'src/app/**/opengraph-image.tsx',
        'src/app/**/components/**',
        // Providers, testes par integration
        'src/components/providers/**',
        // Composants de mise en page, couverts par les E2E
        'src/components/layout/**',
        'src/components/shared/**',
        'src/components/toast/**',
      ],
      // Seuils fondes sur la mesure du 9 septembre 2026 avec ce perimetre, et
      // non sur un chiffre rond : lines 52,35 %, branches 75,65 %,
      // functions 75,83 %.
      //
      // Ils sont poses deux a trois points sous la mesure : assez de marge pour
      // ne pas rougir sur une variation de quelques lignes, assez de serrage
      // pour rougir si une zone entiere perd sa couverture. L'ancien seuil de
      // 20 % laissait passer une chute de moitie sans rien signaler.
      //
      // Les relever demande de mesurer d'abord (`npx vitest run --coverage`),
      // jamais de viser un chiffre rond.
      thresholds: {
        lines: 50,
        functions: 73,
        branches: 73,
        statements: 50,
      },
    },
  },
})
