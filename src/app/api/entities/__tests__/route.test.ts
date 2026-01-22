/**
 * Tests unitaires - API Route Entity Name Resolution
 *
 * @ticket SP-264 - Dynamic Breadcrumbs
 *
 * 8 tests couvrant :
 * - Validation du type d'entité
 * - Validation du format de l'ID
 * - Résolution des différents types d'entités
 * - Gestion des erreurs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Utiliser vi.hoisted pour les mocks qui seront utilisés dans vi.mock
const {
  mockEmployeeFindUnique,
  mockTeamFindUnique,
  mockCompanyFindUnique,
  mockScheduleFindUnique,
  mockLeaveRequestFindUnique,
} = vi.hoisted(() => ({
  mockEmployeeFindUnique: vi.fn(),
  mockTeamFindUnique: vi.fn(),
  mockCompanyFindUnique: vi.fn(),
  mockScheduleFindUnique: vi.fn(),
  mockLeaveRequestFindUnique: vi.fn(),
}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findUnique: mockEmployeeFindUnique,
    },
    team: {
      findUnique: mockTeamFindUnique,
    },
    company: {
      findUnique: mockCompanyFindUnique,
    },
    schedule: {
      findUnique: mockScheduleFindUnique,
    },
    leaveRequest: {
      findUnique: mockLeaveRequestFindUnique,
    },
  },
}))

// Import après le mock
import { GET } from '../[type]/[id]/route'

/**
 * Type pour la réponse de l'API
 */
interface ApiResponse {
  success: boolean
  data?: {
    id: string
    type: string
    name: string
  }
  error?: string
  validTypes?: string[]
}

/**
 * Helper pour créer un NextRequest
 */
function createRequest(type: string, id: string): NextRequest {
  return new NextRequest(`http://localhost:3000/api/entities/${type}/${id}`)
}

/**
 * Helper pour créer le contexte de route
 */
function createContext(type: string, id: string) {
  return {
    params: Promise.resolve({ type, id }),
  }
}

describe('API Route - Entity Name Resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // VALIDATION DU TYPE D'ENTITÉ
  // =========================================================================

  describe('Entity Type Validation', () => {
    it('should return 400 for invalid entity type', async () => {
      const request = createRequest('invalid-type', '123')
      const context = createContext('invalid-type', '123')

      const response = await GET(request, context)
      const data = (await response.json()) as ApiResponse

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain("Type d'entité invalide")
      expect(data.validTypes).toContain('employees')
    })

    it('should accept valid entity types', async () => {
      mockEmployeeFindUnique.mockResolvedValue({
        firstName: 'Jean',
        lastName: 'Dupont',
      })

      const request = createRequest(
        'employees',
        '123e4567-e89b-12d3-a456-426614174000'
      )
      const context = createContext(
        'employees',
        '123e4567-e89b-12d3-a456-426614174000'
      )

      const response = await GET(request, context)

      expect(response.status).toBe(200)
    })
  })

  // =========================================================================
  // VALIDATION DU FORMAT DE L'ID
  // =========================================================================

  describe('ID Format Validation', () => {
    it('should reject invalid ID format', async () => {
      const request = createRequest('employees', 'invalid!id@123')
      const context = createContext('employees', 'invalid!id@123')

      const response = await GET(request, context)
      const data = (await response.json()) as ApiResponse

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain("Format d'ID invalide")
    })

    it('should accept UUID format', async () => {
      mockEmployeeFindUnique.mockResolvedValue({
        firstName: 'Jean',
        lastName: 'Dupont',
      })

      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      const request = createRequest('employees', uuid)
      const context = createContext('employees', uuid)

      const response = await GET(request, context)

      expect(response.status).toBe(200)
    })

    it('should accept CUID format', async () => {
      mockEmployeeFindUnique.mockResolvedValue({
        firstName: 'Marie',
        lastName: 'Martin',
      })

      const cuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx'
      const request = createRequest('employees', cuid)
      const context = createContext('employees', cuid)

      const response = await GET(request, context)

      expect(response.status).toBe(200)
    })

    it('should accept numeric ID format', async () => {
      mockEmployeeFindUnique.mockResolvedValue({
        firstName: 'Pierre',
        lastName: 'Durand',
      })

      const request = createRequest('employees', '12345')
      const context = createContext('employees', '12345')

      const response = await GET(request, context)

      expect(response.status).toBe(200)
    })
  })

  // =========================================================================
  // RÉSOLUTION DES ENTITÉS
  // =========================================================================

  describe('Entity Resolution', () => {
    it('should resolve employee name', async () => {
      mockEmployeeFindUnique.mockResolvedValue({
        firstName: 'Jean',
        lastName: 'Dupont',
      })

      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      const request = createRequest('employees', uuid)
      const context = createContext('employees', uuid)

      const response = await GET(request, context)
      const data = (await response.json()) as ApiResponse

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data?.name).toBe('Jean Dupont')
      expect(data.data?.type).toBe('employees')
    })

    it('should resolve team name', async () => {
      mockTeamFindUnique.mockResolvedValue({
        name: 'Équipe Marketing',
      })

      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      const request = createRequest('teams', uuid)
      const context = createContext('teams', uuid)

      const response = await GET(request, context)
      const data = (await response.json()) as ApiResponse

      expect(response.status).toBe(200)
      expect(data.data?.name).toBe('Équipe Marketing')
    })

    it('should return 404 for non-existent entity', async () => {
      mockEmployeeFindUnique.mockResolvedValue(null)

      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      const request = createRequest('employees', uuid)
      const context = createContext('employees', uuid)

      const response = await GET(request, context)
      const data = (await response.json()) as ApiResponse

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Entité non trouvée')
    })
  })
})
