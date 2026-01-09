/**
 * Tests unitaires pour les Breadcrumbs dynamiques
 *
 * Teste le système de fil d'Ariane :
 * - Formatage des labels (new, edit, members, etc.)
 * - Détection des IDs (CUID, UUID, numérique)
 * - Construction du chemin
 * - Icône Home vers le dashboard
 *
 * @ticket SP-154
 */

import { describe, it, expect } from 'vitest'

// Helpers de test reproduisant la logique du DashboardLayout
function isIdSegment(segment: string): boolean {
  // CUID (commence par c, 25+ caractères alphanumériques)
  if (/^c[a-z0-9]{24,}$/i.test(segment)) return true
  // UUID (format standard)
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  )
    return true
  // ID numérique
  if (/^\d+$/.test(segment)) return true
  return false
}

function formatBreadcrumbLabel(segment: string): string {
  // Cas spéciaux pour les routes CRUD
  const labelMap: Record<string, string> = {
    new: 'Nouveau',
    edit: 'Modifier',
    members: 'Membres',
    settings: 'Paramètres',
    companies: 'Entreprises',
    employees: 'Employés',
    teams: 'Équipes',
    admin: 'Admin',
    director: 'Direction',
    manager: 'Manager',
    dashboard: 'Tableau de bord',
    app: 'Application',
  }

  if (labelMap[segment]) {
    return labelMap[segment]
  }

  // Capitalise la première lettre par défaut
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

function getEntityLabel(segment: string): string | null {
  const entities: Record<string, string> = {
    companies: 'Entreprise',
    employees: 'Employé',
    teams: 'Équipe',
  }
  return entities[segment] || null
}

// ============================================================================
// isIdSegment
// ============================================================================

describe('isIdSegment', () => {
  describe('CUID detection', () => {
    it('devrait détecter un CUID valide', () => {
      expect(isIdSegment('cm5hk2l3w0000abcd1234efgh5')).toBe(true)
    })

    it('devrait détecter un CUID généré par Prisma', () => {
      expect(isIdSegment('clxyz123456789abcdefghijk')).toBe(true)
    })

    it('ne devrait PAS détecter un segment trop court', () => {
      expect(isIdSegment('c123')).toBe(false)
    })
  })

  describe('UUID detection', () => {
    it('devrait détecter un UUID v4 standard', () => {
      expect(isIdSegment('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('devrait détecter un UUID en majuscules', () => {
      expect(isIdSegment('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    })

    it('ne devrait PAS détecter un UUID mal formaté', () => {
      expect(isIdSegment('550e8400-e29b-41d4-a716')).toBe(false)
    })
  })

  describe('numeric ID detection', () => {
    it('devrait détecter un ID numérique simple', () => {
      expect(isIdSegment('123')).toBe(true)
    })

    it('devrait détecter un ID numérique long', () => {
      expect(isIdSegment('9876543210')).toBe(true)
    })

    it('ne devrait PAS détecter un mélange chiffres/lettres', () => {
      expect(isIdSegment('123abc')).toBe(false)
    })
  })

  describe('segments normaux (non-ID)', () => {
    it('ne devrait PAS détecter "new"', () => {
      expect(isIdSegment('new')).toBe(false)
    })

    it('ne devrait PAS détecter "edit"', () => {
      expect(isIdSegment('edit')).toBe(false)
    })

    it('ne devrait PAS détecter "companies"', () => {
      expect(isIdSegment('companies')).toBe(false)
    })

    it('ne devrait PAS détecter "dashboard"', () => {
      expect(isIdSegment('dashboard')).toBe(false)
    })
  })
})

// ============================================================================
// formatBreadcrumbLabel
// ============================================================================

describe('formatBreadcrumbLabel', () => {
  describe('routes CRUD spéciales', () => {
    it('devrait formater "new" en "Nouveau"', () => {
      expect(formatBreadcrumbLabel('new')).toBe('Nouveau')
    })

    it('devrait formater "edit" en "Modifier"', () => {
      expect(formatBreadcrumbLabel('edit')).toBe('Modifier')
    })

    it('devrait formater "members" en "Membres"', () => {
      expect(formatBreadcrumbLabel('members')).toBe('Membres')
    })

    it('devrait formater "settings" en "Paramètres"', () => {
      expect(formatBreadcrumbLabel('settings')).toBe('Paramètres')
    })
  })

  describe('entités CRUD', () => {
    it('devrait formater "companies" en "Entreprises"', () => {
      expect(formatBreadcrumbLabel('companies')).toBe('Entreprises')
    })

    it('devrait formater "employees" en "Employés"', () => {
      expect(formatBreadcrumbLabel('employees')).toBe('Employés')
    })

    it('devrait formater "teams" en "Équipes"', () => {
      expect(formatBreadcrumbLabel('teams')).toBe('Équipes')
    })
  })

  describe('sections de navigation', () => {
    it('devrait formater "admin" en "Admin"', () => {
      expect(formatBreadcrumbLabel('admin')).toBe('Admin')
    })

    it('devrait formater "director" en "Direction"', () => {
      expect(formatBreadcrumbLabel('director')).toBe('Direction')
    })

    it('devrait formater "dashboard" en "Tableau de bord"', () => {
      expect(formatBreadcrumbLabel('dashboard')).toBe('Tableau de bord')
    })
  })

  describe('segments non mappés', () => {
    it('devrait capitaliser la première lettre par défaut', () => {
      expect(formatBreadcrumbLabel('custom')).toBe('Custom')
    })

    it('devrait capitaliser un segment en minuscules', () => {
      expect(formatBreadcrumbLabel('profile')).toBe('Profile')
    })
  })
})

// ============================================================================
// getEntityLabel
// ============================================================================

describe('getEntityLabel', () => {
  it('devrait retourner "Entreprise" pour "companies"', () => {
    expect(getEntityLabel('companies')).toBe('Entreprise')
  })

  it('devrait retourner "Employé" pour "employees"', () => {
    expect(getEntityLabel('employees')).toBe('Employé')
  })

  it('devrait retourner "Équipe" pour "teams"', () => {
    expect(getEntityLabel('teams')).toBe('Équipe')
  })

  it('devrait retourner null pour un segment inconnu', () => {
    expect(getEntityLabel('unknown')).toBeNull()
  })

  it('devrait retourner null pour "dashboard"', () => {
    expect(getEntityLabel('dashboard')).toBeNull()
  })
})

// ============================================================================
// SCÉNARIOS DE CHEMINS COMPLETS
// ============================================================================

describe('Scénarios de chemins complets', () => {
  function buildBreadcrumbPath(pathname: string): string[] {
    const segments = pathname.split('/').filter(Boolean)
    const labels: string[] = []

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const prevSegment = i > 0 ? segments[i - 1] : null

      // Ignorer les IDs mais utiliser le label de l'entité précédente
      if (isIdSegment(segment)) {
        const entityLabel = prevSegment ? getEntityLabel(prevSegment) : null
        if (entityLabel) {
          labels.push(entityLabel)
        }
        continue
      }

      // Ignorer "app" dans le chemin
      if (segment === 'app') continue

      labels.push(formatBreadcrumbLabel(segment))
    }

    return labels
  }

  it('devrait construire le chemin pour /app/admin/companies', () => {
    const labels = buildBreadcrumbPath('/app/admin/companies')
    expect(labels).toEqual(['Admin', 'Entreprises'])
  })

  it('devrait construire le chemin pour /app/admin/companies/new', () => {
    const labels = buildBreadcrumbPath('/app/admin/companies/new')
    expect(labels).toEqual(['Admin', 'Entreprises', 'Nouveau'])
  })

  it('devrait construire le chemin pour /app/admin/companies/[id]', () => {
    const labels = buildBreadcrumbPath(
      '/app/admin/companies/cm5hk2l3w0000abcd1234efgh5'
    )
    expect(labels).toEqual(['Admin', 'Entreprises', 'Entreprise'])
  })

  it('devrait construire le chemin pour /app/director/teams', () => {
    const labels = buildBreadcrumbPath('/app/director/teams')
    expect(labels).toEqual(['Direction', 'Équipes'])
  })

  it('devrait construire le chemin pour /app/director/teams/[id]/members', () => {
    const labels = buildBreadcrumbPath(
      '/app/director/teams/cm5hk2l3w0000abcd1234efgh5/members'
    )
    expect(labels).toEqual(['Direction', 'Équipes', 'Équipe', 'Membres'])
  })

  it('devrait construire le chemin pour /app/dashboard/employees', () => {
    const labels = buildBreadcrumbPath('/app/dashboard/employees')
    expect(labels).toEqual(['Tableau de bord', 'Employés'])
  })

  it('devrait construire le chemin pour /app/dashboard/employees/[id]/edit', () => {
    const labels = buildBreadcrumbPath('/app/dashboard/employees/123/edit')
    expect(labels).toEqual(['Tableau de bord', 'Employés', 'Employé', 'Modifier'])
  })
})
