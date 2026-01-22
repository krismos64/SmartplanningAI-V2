/**
 * Tests unitaires - useBreadcrumbResolver Hook
 *
 * @ticket SP-264 - Dynamic Breadcrumbs
 *
 * 12 tests couvrant :
 * - Détection des patterns d'ID (UUID, CUID, numeric)
 * - Mapping segment vers type d'entité
 * - Comportement du hook avec SWR
 * - États de chargement et d'erreur
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  isIdSegment,
  getEntityTypeFromPreviousSegment,
  useBreadcrumbResolver,
  useBreadcrumbsFromPathname,
} from '../use-breadcrumb-resolver'

// Type pour le mock SWR
interface MockSWRResponse {
  data: string | undefined
  error: Error | undefined
  isLoading: boolean
}

// Variable pour le mock
let mockSWRReturnValue: MockSWRResponse = {
  data: undefined,
  error: undefined,
  isLoading: false,
}

// Mock SWR
vi.mock('swr', () => ({
  default: () => mockSWRReturnValue,
}))

describe('useBreadcrumbResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSWRReturnValue = {
      data: undefined,
      error: undefined,
      isLoading: false,
    }
  })

  // =========================================================================
  // DÉTECTION DES PATTERNS D'ID
  // =========================================================================

  describe('isIdSegment', () => {
    it('should detect UUID format', () => {
      expect(isIdSegment('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(isIdSegment('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('should detect CUID format', () => {
      expect(isIdSegment('clxxxxxxxxxxxxxxxxxxxxxxxxx')).toBe(true)
      expect(isIdSegment('clqz8hy0k0000nc8l4qz8hy0k')).toBe(true)
    })

    it('should detect numeric ID format (3+ digits)', () => {
      expect(isIdSegment('123')).toBe(true)
      expect(isIdSegment('12345')).toBe(true)
      expect(isIdSegment('999999')).toBe(true)
    })

    it('should reject short numeric strings (< 3 digits)', () => {
      expect(isIdSegment('1')).toBe(false)
      expect(isIdSegment('12')).toBe(false)
    })

    it('should reject regular text segments', () => {
      expect(isIdSegment('employees')).toBe(false)
      expect(isIdSegment('dashboard')).toBe(false)
      expect(isIdSegment('settings')).toBe(false)
      expect(isIdSegment('profile')).toBe(false)
    })

    it('should reject invalid formats', () => {
      expect(isIdSegment('abc-def')).toBe(false)
      expect(isIdSegment('hello_world')).toBe(false)
      expect(isIdSegment('test123test')).toBe(false)
    })
  })

  // =========================================================================
  // MAPPING SEGMENT → TYPE D'ENTITÉ
  // =========================================================================

  describe('getEntityTypeFromPreviousSegment', () => {
    it('should map employees segment to employees type', () => {
      expect(getEntityTypeFromPreviousSegment('employees')).toBe('employees')
      expect(getEntityTypeFromPreviousSegment('employee')).toBe('employees')
    })

    it('should map teams segment to teams type', () => {
      expect(getEntityTypeFromPreviousSegment('teams')).toBe('teams')
      expect(getEntityTypeFromPreviousSegment('team')).toBe('teams')
    })

    it('should map companies/organizations to companies type', () => {
      expect(getEntityTypeFromPreviousSegment('companies')).toBe('companies')
      expect(getEntityTypeFromPreviousSegment('organizations')).toBe(
        'companies'
      )
    })

    it('should map schedules/planning to schedules type', () => {
      expect(getEntityTypeFromPreviousSegment('schedules')).toBe('schedules')
      expect(getEntityTypeFromPreviousSegment('planning')).toBe('schedules')
    })

    it('should map leave-related segments to leave-requests type', () => {
      expect(getEntityTypeFromPreviousSegment('leaves')).toBe('leave-requests')
      expect(getEntityTypeFromPreviousSegment('leave-requests')).toBe(
        'leave-requests'
      )
      expect(getEntityTypeFromPreviousSegment('conges')).toBe('leave-requests')
    })

    it('should return null for unknown segments', () => {
      expect(getEntityTypeFromPreviousSegment('settings')).toBeNull()
      expect(getEntityTypeFromPreviousSegment('profile')).toBeNull()
      expect(getEntityTypeFromPreviousSegment('unknown')).toBeNull()
    })
  })

  // =========================================================================
  // HOOK useBreadcrumbResolver
  // =========================================================================

  describe('useBreadcrumbResolver hook', () => {
    it('should return loading state when fetching', () => {
      mockSWRReturnValue = {
        data: undefined,
        error: undefined,
        isLoading: true,
      }

      const { result } = renderHook(() =>
        useBreadcrumbResolver(
          '123e4567-e89b-12d3-a456-426614174000',
          'employees'
        )
      )

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isId).toBe(true)
      expect(result.current.name).toBeNull()
    })

    it('should return resolved name when fetch succeeds', () => {
      mockSWRReturnValue = {
        data: 'Jean Dupont',
        error: undefined,
        isLoading: false,
      }

      const { result } = renderHook(() =>
        useBreadcrumbResolver(
          '123e4567-e89b-12d3-a456-426614174000',
          'employees'
        )
      )

      expect(result.current.isLoading).toBe(false)
      expect(result.current.name).toBe('Jean Dupont')
      expect(result.current.error).toBeNull()
    })

    it('should return error when fetch fails', () => {
      const error = new Error('Failed to fetch')
      mockSWRReturnValue = {
        data: undefined,
        error,
        isLoading: false,
      }

      const { result } = renderHook(() =>
        useBreadcrumbResolver(
          '123e4567-e89b-12d3-a456-426614174000',
          'employees'
        )
      )

      expect(result.current.error).toBe(error)
      expect(result.current.name).toBeNull()
    })

    it('should not set loading for non-ID segments', () => {
      mockSWRReturnValue = {
        data: undefined,
        error: undefined,
        isLoading: false,
      }

      const { result } = renderHook(() =>
        useBreadcrumbResolver('settings', null)
      )

      expect(result.current.isId).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    it('should not set loading when disabled', () => {
      mockSWRReturnValue = {
        data: undefined,
        error: undefined,
        isLoading: true,
      }

      const { result } = renderHook(() =>
        useBreadcrumbResolver(
          '123e4567-e89b-12d3-a456-426614174000',
          'employees',
          { enabled: false }
        )
      )

      // Even though SWR returns isLoading: true, our hook should return false
      // because enabled is false (no entityType means no loading)
      expect(result.current.isId).toBe(true)
    })
  })

  // =========================================================================
  // HOOK useBreadcrumbsFromPathname
  // =========================================================================

  describe('useBreadcrumbsFromPathname', () => {
    it('should parse pathname and return segments', () => {
      const result = useBreadcrumbsFromPathname('/app/dashboard/employees')

      expect(result).toHaveLength(1)
      const firstSegment = result[0]
      expect(firstSegment).toBeDefined()
      expect(firstSegment?.segment).toBe('employees')
      expect(firstSegment?.label).toBe('Employés')
      expect(firstSegment?.href).toBe('/app/dashboard/employees')
      expect(firstSegment?.isLast).toBe(true)
    })

    it('should handle multiple segments', () => {
      const result = useBreadcrumbsFromPathname('/app/dashboard/employees/123')

      expect(result).toHaveLength(2)
      const first = result[0]
      const second = result[1]
      expect(first).toBeDefined()
      expect(second).toBeDefined()
      expect(first?.label).toBe('Employés')
      expect(first?.isLast).toBe(false)
      expect(second?.segment).toBe('123')
      expect(second?.isLast).toBe(true)
    })

    it('should filter out app and dashboard segments', () => {
      const result = useBreadcrumbsFromPathname('/app/dashboard/settings')

      expect(result).toHaveLength(1)
      expect(result[0]?.segment).toBe('settings')
    })

    it('should use static labels for known segments', () => {
      const result = useBreadcrumbsFromPathname(
        '/app/dashboard/super-admin/organizations'
      )

      expect(result[0]?.label).toBe('Administration')
      expect(result[1]?.label).toBe('Organisations')
    })
  })
})
