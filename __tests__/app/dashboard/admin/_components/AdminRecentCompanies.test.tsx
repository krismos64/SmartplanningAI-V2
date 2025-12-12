/**
 * Tests unitaires pour AdminRecentCompanies
 *
 * Teste le composant Server Component avec :
 * - Mock de Prisma
 * - Rendu de la liste
 * - Formatage des dates
 *
 * Note: Ce composant est un Server Component async,
 * les tests utilisent le render async pattern.
 *
 * @ticket SP-148
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock de Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    company: {
      findMany: vi.fn(),
    },
  },
}))

// Import apres le mock
import { prisma } from '@/lib/prisma'

// On doit wrapper le Server Component pour les tests
// car c'est un async component
const renderAdminRecentCompanies = async (mockData: unknown[]) => {
  const prismaMock = prisma.company.findMany as ReturnType<typeof vi.fn>
  prismaMock.mockResolvedValue(mockData)

  // Import dynamique apres setup du mock
  const { AdminRecentCompanies } = await import(
    '@/app/(dashboard)/dashboard/admin/_components/AdminRecentCompanies'
  )

  // Render le Server Component
  const component = await AdminRecentCompanies({})
  return render(component)
}

const mockCompanies = [
  {
    id: '1',
    name: 'TechCorp',
    createdAt: new Date('2025-12-10'),
    subscription: { plan: 'BUSINESS', status: 'ACTIVE' },
    _count: { users: 25 },
  },
  {
    id: '2',
    name: 'StartupXYZ',
    createdAt: new Date('2025-12-09'),
    subscription: { plan: 'STARTER', status: 'ACTIVE' },
    _count: { users: 5 },
  },
  {
    id: '3',
    name: 'Enterprise Inc',
    createdAt: new Date('2025-12-05'),
    subscription: { plan: 'ENTERPRISE', status: 'ACTIVE' },
    _count: { users: 150 },
  },
  {
    id: '4',
    name: 'FreeTier Co',
    createdAt: new Date('2025-11-15'),
    subscription: null,
    _count: { users: 2 },
  },
  {
    id: '5',
    name: 'OldCompany',
    createdAt: new Date('2025-10-01'),
    subscription: { plan: 'BUSINESS', status: 'ACTIVE' },
    _count: { users: 45 },
  },
]

describe('AdminRecentCompanies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Rendu de base
  // ==========================================================================

  describe('rendu de base', () => {
    it('devrait rendre le titre', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      expect(screen.getByText('Dernieres inscriptions')).toBeInTheDocument()
    })

    it('devrait rendre le sous-titre', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      expect(screen.getByText('5 dernieres entreprises')).toBeInTheDocument()
    })

    it('devrait rendre le bouton Voir tout', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      expect(
        screen.getByRole('link', { name: /voir tout/i })
      ).toBeInTheDocument()
    })

    it('devrait avoir le lien vers /admin/companies', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      const link = screen.getByRole('link', { name: /voir tout/i })
      expect(link).toHaveAttribute('href', '/admin/companies')
    })
  })

  // ==========================================================================
  // Liste des entreprises
  // ==========================================================================

  describe('liste des entreprises', () => {
    it('devrait afficher les noms des entreprises', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      expect(screen.getByText('TechCorp')).toBeInTheDocument()
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Inc')).toBeInTheDocument()
    })

    it('devrait afficher le nombre d utilisateurs', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      // Utiliser getAllByText car plusieurs elements peuvent matcher
      expect(screen.getAllByText(/25 utilisateur/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/5 utilisateur/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/150 utilisateur/).length).toBeGreaterThan(0)
    })

    it('devrait afficher utilisateur au singulier pour 1', async () => {
      const singleUser = [
        {
          id: '1',
          name: 'Solo Co',
          createdAt: new Date(),
          subscription: { plan: 'FREE', status: 'ACTIVE' },
          _count: { users: 1 },
        },
      ]

      await renderAdminRecentCompanies(singleUser)

      expect(screen.getByText(/1 utilisateur(?!s)/)).toBeInTheDocument()
    })

    it('devrait afficher le plan d abonnement', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      // Utiliser getAllByText car plusieurs entreprises peuvent avoir BUSINESS
      expect(screen.getAllByText(/BUSINESS/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/STARTER/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/ENTERPRISE/).length).toBeGreaterThan(0)
    })

    it('devrait afficher FREE si pas d abonnement', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      // FreeTier Co n'a pas de subscription
      expect(screen.getByText(/FREE/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Avatars et initiales
  // ==========================================================================

  describe('avatars et initiales', () => {
    it('devrait afficher les initiales des entreprises', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      // TechCorp = T (un seul mot), StartupXYZ = S, Enterprise Inc = EI
      expect(screen.getByText('T')).toBeInTheDocument() // TechCorp
      expect(screen.getByText('S')).toBeInTheDocument() // StartupXYZ
      expect(screen.getByText('EI')).toBeInTheDocument() // Enterprise Inc
    })

    it('devrait avoir des couleurs differentes pour les avatars', async () => {
      const { container } = await renderAdminRecentCompanies(mockCompanies)

      // Verification des classes de couleur
      const blueAvatar = container.querySelector('.bg-blue-500')
      const emeraldAvatar = container.querySelector('.bg-emerald-500')
      const violetAvatar = container.querySelector('.bg-violet-500')

      expect(blueAvatar).toBeInTheDocument()
      expect(emeraldAvatar).toBeInTheDocument()
      expect(violetAvatar).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Formatage des dates
  // ==========================================================================

  describe('formatage des dates', () => {
    it('devrait afficher Aujourd hui pour date du jour', async () => {
      const todayCompany = [
        {
          id: '1',
          name: 'Today Co',
          createdAt: new Date(),
          subscription: { plan: 'FREE', status: 'ACTIVE' },
          _count: { users: 1 },
        },
      ]

      await renderAdminRecentCompanies(todayCompany)

      expect(screen.getByText("Aujourd'hui")).toBeInTheDocument()
    })

    it('devrait afficher Hier pour date d hier', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const yesterdayCompany = [
        {
          id: '1',
          name: 'Yesterday Co',
          createdAt: yesterday,
          subscription: { plan: 'FREE', status: 'ACTIVE' },
          _count: { users: 1 },
        },
      ]

      await renderAdminRecentCompanies(yesterdayCompany)

      expect(screen.getByText('Hier')).toBeInTheDocument()
    })

    it('devrait afficher Il y a X jours', async () => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      const oldCompany = [
        {
          id: '1',
          name: 'Old Co',
          createdAt: fiveDaysAgo,
          subscription: { plan: 'FREE', status: 'ACTIVE' },
          _count: { users: 1 },
        },
      ]

      await renderAdminRecentCompanies(oldCompany)

      expect(screen.getByText('Il y a 5 jours')).toBeInTheDocument()
    })

    it('devrait afficher Il y a X sem pour plus de 7 jours', async () => {
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const oldCompany = [
        {
          id: '1',
          name: 'Older Co',
          createdAt: twoWeeksAgo,
          subscription: { plan: 'FREE', status: 'ACTIVE' },
          _count: { users: 1 },
        },
      ]

      await renderAdminRecentCompanies(oldCompany)

      expect(screen.getByText('Il y a 2 sem.')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Donnees vides
  // ==========================================================================

  describe('donnees vides', () => {
    it('devrait afficher un message quand aucune entreprise', async () => {
      await renderAdminRecentCompanies([])

      expect(screen.getByText('Aucune entreprise inscrite')).toBeInTheDocument()
    })

    it('devrait toujours afficher le bouton Voir tout', async () => {
      await renderAdminRecentCompanies([])

      expect(
        screen.getByRole('link', { name: /voir tout/i })
      ).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Appel Prisma
  // ==========================================================================

  describe('appel Prisma', () => {
    it('devrait appeler findMany avec les bons parametres', async () => {
      await renderAdminRecentCompanies(mockCompanies)

      expect(prisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      )
    })
  })
})
