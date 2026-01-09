/**
 * Tests unitaires pour src/config/navigation.ts
 *
 * Teste la configuration de navigation RBAC :
 * - navigationConfig: structure de navigation par rôle
 * - getNavigationForRole: récupération de la navigation selon le rôle
 * - getFlatNavigationItems: liste plate des items de navigation
 * - isRouteInNavigation: vérification si une route est dans la navigation
 *
 * @ticket SP-154
 */

import { describe, it, expect } from 'vitest'
import {
  navigationConfig,
  getNavigationForRole,
  getFlatNavigationItems,
  isRouteInNavigation,
  type NavItem,
  type NavSection,
} from '@/config/navigation'
import type { UserRole } from '@prisma/client'

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

describe('navigationConfig', () => {
  it('devrait avoir une configuration pour les 4 rôles', () => {
    expect(navigationConfig).toHaveProperty('SYSTEM_ADMIN')
    expect(navigationConfig).toHaveProperty('DIRECTOR')
    expect(navigationConfig).toHaveProperty('MANAGER')
    expect(navigationConfig).toHaveProperty('EMPLOYEE')
    expect(Object.keys(navigationConfig)).toHaveLength(4)
  })

  describe('SYSTEM_ADMIN navigation', () => {
    it('devrait avoir accès à la gestion des entreprises', () => {
      const sections = navigationConfig.SYSTEM_ADMIN
      const allItems = sections.flatMap((s) => s.items)
      const companiesLink = allItems.find((item) =>
        item.href.includes('companies')
      )
      expect(companiesLink).toBeDefined()
      expect(companiesLink?.href).toBe('/app/admin/companies')
    })

    it('devrait avoir une section Supervision', () => {
      const sections = navigationConfig.SYSTEM_ADMIN
      const monitoringSection = sections.find((s) => s.title === 'Supervision')
      expect(monitoringSection).toBeDefined()
    })
  })

  describe('DIRECTOR navigation', () => {
    it('devrait avoir accès à la gestion des équipes', () => {
      const sections = navigationConfig.DIRECTOR
      const allItems = sections.flatMap((s) => s.items)
      const teamsLink = allItems.find((item) => item.href.includes('teams'))
      expect(teamsLink).toBeDefined()
      expect(teamsLink?.href).toBe('/app/director/teams')
    })

    it('devrait avoir accès à la gestion des employés', () => {
      const sections = navigationConfig.DIRECTOR
      const allItems = sections.flatMap((s) => s.items)
      const employeesLink = allItems.find((item) =>
        item.href.includes('employees')
      )
      expect(employeesLink).toBeDefined()
      expect(employeesLink?.href).toBe('/app/dashboard/employees')
    })

    it('devrait avoir une section Gestion', () => {
      const sections = navigationConfig.DIRECTOR
      const gestionSection = sections.find((s) => s.title === 'Gestion')
      expect(gestionSection).toBeDefined()
    })
  })

  describe('MANAGER navigation', () => {
    it('devrait avoir accès aux collaborateurs (employees)', () => {
      const sections = navigationConfig.MANAGER
      const allItems = sections.flatMap((s) => s.items)
      const employeesLink = allItems.find((item) => item.href.includes('employees'))
      expect(employeesLink).toBeDefined()
    })
  })

  describe('EMPLOYEE navigation', () => {
    it('devrait avoir accès au tableau de bord', () => {
      const sections = navigationConfig.EMPLOYEE
      const allItems = sections.flatMap((s) => s.items)
      const dashboardLink = allItems.find(
        (item) => item.id === 'dashboard'
      )
      expect(dashboardLink).toBeDefined()
      expect(dashboardLink?.href).toBe('/app/dashboard')
    })

    it('ne devrait PAS avoir accès aux entreprises', () => {
      const sections = navigationConfig.EMPLOYEE
      const allItems = sections.flatMap((s) => s.items)
      const companiesLink = allItems.find((item) =>
        item.href.includes('companies')
      )
      expect(companiesLink).toBeUndefined()
    })
  })
})

// ============================================================================
// getNavigationForRole
// ============================================================================

describe('getNavigationForRole', () => {
  it('devrait retourner la navigation SYSTEM_ADMIN', () => {
    const nav = getNavigationForRole('SYSTEM_ADMIN')
    expect(nav).toEqual(navigationConfig.SYSTEM_ADMIN)
  })

  it('devrait retourner la navigation DIRECTOR', () => {
    const nav = getNavigationForRole('DIRECTOR')
    expect(nav).toEqual(navigationConfig.DIRECTOR)
  })

  it('devrait retourner la navigation MANAGER', () => {
    const nav = getNavigationForRole('MANAGER')
    expect(nav).toEqual(navigationConfig.MANAGER)
  })

  it('devrait retourner la navigation EMPLOYEE', () => {
    const nav = getNavigationForRole('EMPLOYEE')
    expect(nav).toEqual(navigationConfig.EMPLOYEE)
  })

  it('devrait retourner la navigation EMPLOYEE par défaut pour un rôle invalide', () => {
    // @ts-expect-error - Test de rôle invalide
    const nav = getNavigationForRole('INVALID_ROLE')
    // La fonction retourne EMPLOYEE par défaut (fallback)
    expect(nav).toEqual(navigationConfig.EMPLOYEE)
  })
})

// ============================================================================
// getFlatNavigationItems
// ============================================================================

describe('getFlatNavigationItems', () => {
  it('devrait retourner tous les items en liste plate pour SYSTEM_ADMIN', () => {
    const items = getFlatNavigationItems('SYSTEM_ADMIN')
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    // Vérifier que chaque item a les propriétés requises
    items.forEach((item) => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('label')
      expect(item).toHaveProperty('href')
      expect(item).toHaveProperty('icon')
    })
  })

  it('devrait retourner tous les items en liste plate pour DIRECTOR', () => {
    const items = getFlatNavigationItems('DIRECTOR')
    expect(items.length).toBeGreaterThan(0)
  })

  it('devrait inclure les liens CRUD des entreprises pour SYSTEM_ADMIN', () => {
    const items = getFlatNavigationItems('SYSTEM_ADMIN')
    const companiesItem = items.find((item) =>
      item.href.includes('/companies')
    )
    expect(companiesItem).toBeDefined()
  })

  it('devrait inclure les liens CRUD des équipes pour DIRECTOR', () => {
    const items = getFlatNavigationItems('DIRECTOR')
    const teamsItem = items.find((item) => item.href.includes('/teams'))
    expect(teamsItem).toBeDefined()
  })
})

// ============================================================================
// isRouteInNavigation
// ============================================================================

describe('isRouteInNavigation', () => {
  describe('SYSTEM_ADMIN routes', () => {
    it('devrait trouver /app/admin/companies dans la navigation', () => {
      expect(isRouteInNavigation('/app/admin/companies', 'SYSTEM_ADMIN')).toBe(
        true
      )
    })

    it('devrait trouver /app/admin/dashboard dans la navigation', () => {
      expect(isRouteInNavigation('/app/admin/dashboard', 'SYSTEM_ADMIN')).toBe(
        true
      )
    })
  })

  describe('DIRECTOR routes', () => {
    it('devrait trouver /app/director/teams dans la navigation', () => {
      expect(isRouteInNavigation('/app/director/teams', 'DIRECTOR')).toBe(true)
    })

    it('devrait trouver /app/dashboard/employees dans la navigation', () => {
      expect(isRouteInNavigation('/app/dashboard/employees', 'DIRECTOR')).toBe(
        true
      )
    })
  })

  describe('routes non présentes', () => {
    it('ne devrait PAS trouver /app/admin/companies pour EMPLOYEE', () => {
      expect(isRouteInNavigation('/app/admin/companies', 'EMPLOYEE')).toBe(
        false
      )
    })

    it('ne devrait PAS trouver une route inexistante', () => {
      expect(
        isRouteInNavigation('/app/unknown/route', 'SYSTEM_ADMIN')
      ).toBe(false)
    })
  })
})

// ============================================================================
// STRUCTURE VALIDATION
// ============================================================================

describe('Structure validation', () => {
  it('chaque section devrait avoir un id unique', () => {
    Object.values(navigationConfig).forEach((sections) => {
      const ids = sections.map((s) => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  it('chaque item devrait avoir un id unique dans sa section', () => {
    Object.values(navigationConfig).forEach((sections) => {
      sections.forEach((section) => {
        const ids = section.items.map((item) => item.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
      })
    })
  })

  it('chaque item devrait avoir un href valide commençant par /', () => {
    Object.values(navigationConfig).forEach((sections) => {
      sections.forEach((section) => {
        section.items.forEach((item) => {
          expect(item.href.startsWith('/')).toBe(true)
        })
      })
    })
  })
})
