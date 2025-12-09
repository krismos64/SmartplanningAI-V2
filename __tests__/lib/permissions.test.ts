/**
 * Tests unitaires pour src/lib/permissions.ts
 *
 * Teste les fonctions de gestion RBAC (Role-Based Access Control) :
 * - hasRequiredRole: vérification hiérarchique des rôles
 * - getRequiredRoleForRoute: détermination du rôle requis pour une route
 * - canAccessRoute: vérification complète d'accès
 * - getDefaultDashboardForRole: redirection par défaut selon le rôle
 *
 * @ticket SP-110
 */

import { describe, it, expect } from 'vitest'
import {
  ROLE_HIERARCHY,
  PROTECTED_ROUTES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  hasRequiredRole,
  getRequiredRoleForRoute,
  canAccessRoute,
  getDefaultDashboardForRole,
} from '@/lib/permissions'
import type { UserRole } from '@prisma/client'

// ============================================================================
// CONSTANTES
// ============================================================================

describe('ROLE_HIERARCHY', () => {
  it('devrait définir 4 niveaux de rôles', () => {
    expect(Object.keys(ROLE_HIERARCHY)).toHaveLength(4)
  })

  it('devrait avoir SYSTEM_ADMIN comme rôle le plus élevé (niveau 4)', () => {
    expect(ROLE_HIERARCHY.SYSTEM_ADMIN).toBe(4)
  })

  it('devrait avoir DIRECTOR au niveau 3', () => {
    expect(ROLE_HIERARCHY.DIRECTOR).toBe(3)
  })

  it('devrait avoir MANAGER au niveau 2', () => {
    expect(ROLE_HIERARCHY.MANAGER).toBe(2)
  })

  it('devrait avoir EMPLOYEE comme rôle le plus bas (niveau 1)', () => {
    expect(ROLE_HIERARCHY.EMPLOYEE).toBe(1)
  })

  it('devrait respecter la hiérarchie SYSTEM_ADMIN > DIRECTOR > MANAGER > EMPLOYEE', () => {
    expect(ROLE_HIERARCHY.SYSTEM_ADMIN).toBeGreaterThan(ROLE_HIERARCHY.DIRECTOR)
    expect(ROLE_HIERARCHY.DIRECTOR).toBeGreaterThan(ROLE_HIERARCHY.MANAGER)
    expect(ROLE_HIERARCHY.MANAGER).toBeGreaterThan(ROLE_HIERARCHY.EMPLOYEE)
  })
})

describe('PROTECTED_ROUTES', () => {
  it('devrait protéger /app/admin avec SYSTEM_ADMIN', () => {
    expect(PROTECTED_ROUTES['/app/admin']).toBe('SYSTEM_ADMIN')
  })

  it('devrait protéger /app/director avec DIRECTOR', () => {
    expect(PROTECTED_ROUTES['/app/director']).toBe('DIRECTOR')
  })

  it('devrait protéger /app/manager avec MANAGER', () => {
    expect(PROTECTED_ROUTES['/app/manager']).toBe('MANAGER')
  })

  it('devrait protéger /app avec EMPLOYEE (tous les authentifiés)', () => {
    expect(PROTECTED_ROUTES['/app']).toBe('EMPLOYEE')
  })
})

describe('ROLE_LABELS', () => {
  it('devrait avoir un label français pour chaque rôle', () => {
    expect(ROLE_LABELS.SYSTEM_ADMIN).toBe('Super Administrateur')
    expect(ROLE_LABELS.DIRECTOR).toBe('Directeur')
    expect(ROLE_LABELS.MANAGER).toBe('Manager')
    expect(ROLE_LABELS.EMPLOYEE).toBe('Employé')
  })
})

describe('ROLE_DESCRIPTIONS', () => {
  it('devrait avoir une description pour chaque rôle', () => {
    expect(ROLE_DESCRIPTIONS.SYSTEM_ADMIN).toContain('plateforme SaaS')
    expect(ROLE_DESCRIPTIONS.DIRECTOR).toContain('entreprise')
    expect(ROLE_DESCRIPTIONS.MANAGER).toContain('équipe')
    expect(ROLE_DESCRIPTIONS.EMPLOYEE).toContain('congés')
  })
})

// ============================================================================
// hasRequiredRole
// ============================================================================

describe('hasRequiredRole', () => {
  describe('accès autorisé (niveau suffisant)', () => {
    it('SYSTEM_ADMIN peut accéder à toutes les ressources', () => {
      expect(hasRequiredRole('SYSTEM_ADMIN', 'SYSTEM_ADMIN')).toBe(true)
      expect(hasRequiredRole('SYSTEM_ADMIN', 'DIRECTOR')).toBe(true)
      expect(hasRequiredRole('SYSTEM_ADMIN', 'MANAGER')).toBe(true)
      expect(hasRequiredRole('SYSTEM_ADMIN', 'EMPLOYEE')).toBe(true)
    })

    it('DIRECTOR peut accéder aux ressources DIRECTOR et inférieures', () => {
      expect(hasRequiredRole('DIRECTOR', 'DIRECTOR')).toBe(true)
      expect(hasRequiredRole('DIRECTOR', 'MANAGER')).toBe(true)
      expect(hasRequiredRole('DIRECTOR', 'EMPLOYEE')).toBe(true)
    })

    it('MANAGER peut accéder aux ressources MANAGER et inférieures', () => {
      expect(hasRequiredRole('MANAGER', 'MANAGER')).toBe(true)
      expect(hasRequiredRole('MANAGER', 'EMPLOYEE')).toBe(true)
    })

    it('EMPLOYEE peut accéder uniquement aux ressources EMPLOYEE', () => {
      expect(hasRequiredRole('EMPLOYEE', 'EMPLOYEE')).toBe(true)
    })
  })

  describe('accès refusé (niveau insuffisant)', () => {
    it('DIRECTOR ne peut pas accéder aux ressources SYSTEM_ADMIN', () => {
      expect(hasRequiredRole('DIRECTOR', 'SYSTEM_ADMIN')).toBe(false)
    })

    it('MANAGER ne peut pas accéder aux ressources DIRECTOR+', () => {
      expect(hasRequiredRole('MANAGER', 'SYSTEM_ADMIN')).toBe(false)
      expect(hasRequiredRole('MANAGER', 'DIRECTOR')).toBe(false)
    })

    it('EMPLOYEE ne peut pas accéder aux ressources MANAGER+', () => {
      expect(hasRequiredRole('EMPLOYEE', 'SYSTEM_ADMIN')).toBe(false)
      expect(hasRequiredRole('EMPLOYEE', 'DIRECTOR')).toBe(false)
      expect(hasRequiredRole('EMPLOYEE', 'MANAGER')).toBe(false)
    })
  })

  describe('cas limites', () => {
    it('devrait retourner false si userRole est undefined', () => {
      expect(hasRequiredRole(undefined, 'EMPLOYEE')).toBe(false)
      expect(hasRequiredRole(undefined, 'SYSTEM_ADMIN')).toBe(false)
    })

    it('devrait retourner false pour un rôle inexistant', () => {
      // @ts-expect-error - Test de rôle invalide
      expect(hasRequiredRole('INVALID_ROLE', 'EMPLOYEE')).toBe(false)
      // @ts-expect-error - Test de rôle invalide
      expect(hasRequiredRole('EMPLOYEE', 'INVALID_ROLE')).toBe(false)
    })
  })
})

// ============================================================================
// getRequiredRoleForRoute
// ============================================================================

describe('getRequiredRoleForRoute', () => {
  describe('routes admin', () => {
    it('devrait retourner SYSTEM_ADMIN pour /app/admin', () => {
      expect(getRequiredRoleForRoute('/app/admin')).toBe('SYSTEM_ADMIN')
    })

    it('devrait retourner SYSTEM_ADMIN pour /app/admin/users', () => {
      expect(getRequiredRoleForRoute('/app/admin/users')).toBe('SYSTEM_ADMIN')
    })

    it('devrait retourner SYSTEM_ADMIN pour /app/admin/companies/123', () => {
      expect(getRequiredRoleForRoute('/app/admin/companies/123')).toBe('SYSTEM_ADMIN')
    })
  })

  describe('routes director', () => {
    it('devrait retourner DIRECTOR pour /app/director', () => {
      expect(getRequiredRoleForRoute('/app/director')).toBe('DIRECTOR')
    })

    it('devrait retourner DIRECTOR pour /app/director/dashboard', () => {
      expect(getRequiredRoleForRoute('/app/director/dashboard')).toBe('DIRECTOR')
    })

    it('devrait retourner DIRECTOR pour /app/director/teams/settings', () => {
      expect(getRequiredRoleForRoute('/app/director/teams/settings')).toBe('DIRECTOR')
    })
  })

  describe('routes manager', () => {
    it('devrait retourner MANAGER pour /app/manager', () => {
      expect(getRequiredRoleForRoute('/app/manager')).toBe('MANAGER')
    })

    it('devrait retourner MANAGER pour /app/manager/dashboard', () => {
      expect(getRequiredRoleForRoute('/app/manager/dashboard')).toBe('MANAGER')
    })

    it('devrait retourner MANAGER pour /app/manager/team/leave-requests', () => {
      expect(getRequiredRoleForRoute('/app/manager/team/leave-requests')).toBe('MANAGER')
    })
  })

  describe('routes employee (tous les authentifiés)', () => {
    it('devrait retourner EMPLOYEE pour /app', () => {
      expect(getRequiredRoleForRoute('/app')).toBe('EMPLOYEE')
    })

    it('devrait retourner EMPLOYEE pour /app/dashboard', () => {
      expect(getRequiredRoleForRoute('/app/dashboard')).toBe('EMPLOYEE')
    })

    it('devrait retourner EMPLOYEE pour /app/profile', () => {
      expect(getRequiredRoleForRoute('/app/profile')).toBe('EMPLOYEE')
    })

    it('devrait retourner EMPLOYEE pour /app/leave-requests', () => {
      expect(getRequiredRoleForRoute('/app/leave-requests')).toBe('EMPLOYEE')
    })
  })

  describe('routes non protégées', () => {
    it('devrait retourner null pour /', () => {
      expect(getRequiredRoleForRoute('/')).toBeNull()
    })

    it('devrait retourner null pour /login', () => {
      expect(getRequiredRoleForRoute('/login')).toBeNull()
    })

    it('devrait retourner null pour /register', () => {
      expect(getRequiredRoleForRoute('/register')).toBeNull()
    })

    it('devrait retourner null pour /api/auth/signin', () => {
      expect(getRequiredRoleForRoute('/api/auth/signin')).toBeNull()
    })
  })

  describe('priorité des routes (spécificité)', () => {
    it('devrait matcher /app/admin avant /app pour /app/admin/test', () => {
      expect(getRequiredRoleForRoute('/app/admin/test')).toBe('SYSTEM_ADMIN')
    })

    it('devrait matcher /app/director avant /app pour /app/director/test', () => {
      expect(getRequiredRoleForRoute('/app/director/test')).toBe('DIRECTOR')
    })

    it('devrait matcher /app/manager avant /app pour /app/manager/test', () => {
      expect(getRequiredRoleForRoute('/app/manager/test')).toBe('MANAGER')
    })
  })
})

// ============================================================================
// canAccessRoute
// ============================================================================

describe('canAccessRoute', () => {
  describe('SYSTEM_ADMIN', () => {
    const role: UserRole = 'SYSTEM_ADMIN'

    it('peut accéder à toutes les routes /app/*', () => {
      expect(canAccessRoute('/app/admin/users', role)).toBe(true)
      expect(canAccessRoute('/app/director/dashboard', role)).toBe(true)
      expect(canAccessRoute('/app/manager/team', role)).toBe(true)
      expect(canAccessRoute('/app/dashboard', role)).toBe(true)
    })

    it('peut accéder aux routes publiques', () => {
      expect(canAccessRoute('/login', role)).toBe(true)
      expect(canAccessRoute('/', role)).toBe(true)
    })
  })

  describe('DIRECTOR', () => {
    const role: UserRole = 'DIRECTOR'

    it('peut accéder aux routes director et inférieures', () => {
      expect(canAccessRoute('/app/director/dashboard', role)).toBe(true)
      expect(canAccessRoute('/app/manager/team', role)).toBe(true)
      expect(canAccessRoute('/app/dashboard', role)).toBe(true)
    })

    it('ne peut PAS accéder aux routes admin', () => {
      expect(canAccessRoute('/app/admin/users', role)).toBe(false)
      expect(canAccessRoute('/app/admin/companies', role)).toBe(false)
    })
  })

  describe('MANAGER', () => {
    const role: UserRole = 'MANAGER'

    it('peut accéder aux routes manager et inférieures', () => {
      expect(canAccessRoute('/app/manager/team', role)).toBe(true)
      expect(canAccessRoute('/app/dashboard', role)).toBe(true)
      expect(canAccessRoute('/app/profile', role)).toBe(true)
    })

    it('ne peut PAS accéder aux routes director et admin', () => {
      expect(canAccessRoute('/app/admin/users', role)).toBe(false)
      expect(canAccessRoute('/app/director/dashboard', role)).toBe(false)
    })
  })

  describe('EMPLOYEE', () => {
    const role: UserRole = 'EMPLOYEE'

    it('peut accéder uniquement aux routes /app/* générales', () => {
      expect(canAccessRoute('/app/dashboard', role)).toBe(true)
      expect(canAccessRoute('/app/profile', role)).toBe(true)
      expect(canAccessRoute('/app/leave-requests', role)).toBe(true)
    })

    it('ne peut PAS accéder aux routes manager, director, admin', () => {
      expect(canAccessRoute('/app/admin/users', role)).toBe(false)
      expect(canAccessRoute('/app/director/dashboard', role)).toBe(false)
      expect(canAccessRoute('/app/manager/team', role)).toBe(false)
    })
  })

  describe('utilisateur non authentifié (undefined)', () => {
    it('ne peut PAS accéder aux routes protégées', () => {
      expect(canAccessRoute('/app/dashboard', undefined)).toBe(false)
      expect(canAccessRoute('/app/admin/users', undefined)).toBe(false)
    })

    it('peut accéder aux routes publiques (pas de restriction de rôle)', () => {
      expect(canAccessRoute('/login', undefined)).toBe(true)
      expect(canAccessRoute('/', undefined)).toBe(true)
    })
  })
})

// ============================================================================
// getDefaultDashboardForRole
// ============================================================================

describe('getDefaultDashboardForRole', () => {
  it('devrait retourner /app/admin/dashboard pour SYSTEM_ADMIN', () => {
    expect(getDefaultDashboardForRole('SYSTEM_ADMIN')).toBe('/app/admin/dashboard')
  })

  it('devrait retourner /app/director/dashboard pour DIRECTOR', () => {
    expect(getDefaultDashboardForRole('DIRECTOR')).toBe('/app/director/dashboard')
  })

  it('devrait retourner /app/manager/dashboard pour MANAGER', () => {
    expect(getDefaultDashboardForRole('MANAGER')).toBe('/app/manager/dashboard')
  })

  it('devrait retourner /app/dashboard pour EMPLOYEE', () => {
    expect(getDefaultDashboardForRole('EMPLOYEE')).toBe('/app/dashboard')
  })

  it('devrait retourner /app/dashboard par défaut si rôle undefined', () => {
    expect(getDefaultDashboardForRole(undefined)).toBe('/app/dashboard')
  })

  it('devrait retourner /app/dashboard pour un rôle invalide', () => {
    // @ts-expect-error - Test de rôle invalide
    expect(getDefaultDashboardForRole('INVALID_ROLE')).toBe('/app/dashboard')
  })
})

// ============================================================================
// SCÉNARIOS D'INTÉGRATION
// ============================================================================

describe('Scénarios RBAC intégrés', () => {
  describe('workflow de connexion et redirection', () => {
    it('un DIRECTOR connecté sur /login devrait être redirigé vers /app/director/dashboard', () => {
      const userRole: UserRole = 'DIRECTOR'
      const redirectUrl = getDefaultDashboardForRole(userRole)
      expect(redirectUrl).toBe('/app/director/dashboard')
      expect(canAccessRoute(redirectUrl, userRole)).toBe(true)
    })

    it('un EMPLOYEE connecté sur /login devrait être redirigé vers /app/dashboard', () => {
      const userRole: UserRole = 'EMPLOYEE'
      const redirectUrl = getDefaultDashboardForRole(userRole)
      expect(redirectUrl).toBe('/app/dashboard')
      expect(canAccessRoute(redirectUrl, userRole)).toBe(true)
    })
  })

  describe('workflow d\'accès refusé', () => {
    it('un EMPLOYEE essayant d\'accéder à /app/admin devrait être redirigé', () => {
      const userRole: UserRole = 'EMPLOYEE'
      const attemptedRoute = '/app/admin/users'

      // L'accès est refusé
      expect(canAccessRoute(attemptedRoute, userRole)).toBe(false)

      // Le dashboard par défaut est accessible
      const fallbackRoute = getDefaultDashboardForRole(userRole)
      expect(canAccessRoute(fallbackRoute, userRole)).toBe(true)
    })

    it('un MANAGER essayant d\'accéder à /app/director devrait être redirigé', () => {
      const userRole: UserRole = 'MANAGER'
      const attemptedRoute = '/app/director/settings'

      expect(canAccessRoute(attemptedRoute, userRole)).toBe(false)

      const fallbackRoute = getDefaultDashboardForRole(userRole)
      expect(canAccessRoute(fallbackRoute, userRole)).toBe(true)
    })
  })

  describe('escalade de privilèges (sécurité)', () => {
    it('ne devrait jamais permettre à un rôle inférieur d\'accéder aux routes supérieures', () => {
      const roles: UserRole[] = ['EMPLOYEE', 'MANAGER', 'DIRECTOR', 'SYSTEM_ADMIN']
      const adminRoute = '/app/admin/users'

      // Seul SYSTEM_ADMIN peut accéder
      expect(canAccessRoute(adminRoute, 'SYSTEM_ADMIN')).toBe(true)
      expect(canAccessRoute(adminRoute, 'DIRECTOR')).toBe(false)
      expect(canAccessRoute(adminRoute, 'MANAGER')).toBe(false)
      expect(canAccessRoute(adminRoute, 'EMPLOYEE')).toBe(false)
    })
  })
})
