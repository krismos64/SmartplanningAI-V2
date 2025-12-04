/**
 * Mock Prisma Client pour tests unitaires
 *
 * Ce fichier configure un mock type-safe du PrismaClient en utilisant
 * vitest-mock-extended. Il permet de tester les services et repositories
 * sans avoir besoin d'une vraie base de données.
 *
 * Pattern utilisé : Singleton Mock avec vi.mock hoisting
 *
 * @see https://www.prisma.io/docs/guides/testing/unit-testing
 * @see https://github.com/eratio08/vitest-mock-extended
 * @ticket SP-132
 */

import { beforeEach, vi } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import { type PrismaClient } from '@prisma/client'

/**
 * Mock hoisted du module @/lib/prisma
 *
 * vi.mock est hoisted en haut du fichier par Vitest,
 * donc on doit créer le mock directement dans la factory.
 *
 * Ce mock remplace TOUS les imports de @/lib/prisma dans les tests.
 */
vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
  prisma: mockDeep<PrismaClient>(),
}))

/**
 * Import du module mocké
 *
 * Après vi.mock, cet import retourne notre mockDeep
 * au lieu du vrai PrismaClient.
 */
import { prisma } from '@/lib/prisma'

/**
 * Export typé du Prisma Mock
 *
 * DeepMockProxy<PrismaClient> fournit :
 * - Tous les modèles Prisma (user, company, team, etc.)
 * - Toutes les méthodes (findMany, create, update, delete, etc.)
 * - Type-safety complète (erreur TS si mauvais type retourné)
 * - Méthodes de mock (.mockResolvedValue, .mockRejectedValue, etc.)
 *
 * @example
 * ```typescript
 * import { prismaMock } from '@/__tests__/mocks/prisma'
 *
 * prismaMock.user.findMany.mockResolvedValue([{ id: '1', ... }])
 * ```
 */
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

/**
 * Reset automatique du mock avant chaque test
 *
 * Cela garantit que chaque test démarre avec un mock "propre"
 * sans les mockResolvedValue/mockImplementation des tests précédents.
 *
 * Note: Ce beforeEach s'exécute en plus de celui dans setup.ts
 */
beforeEach(() => {
  mockReset(prismaMock)
})
