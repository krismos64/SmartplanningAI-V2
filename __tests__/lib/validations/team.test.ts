/**
 * Tests unitaires pour les schémas de validation Team
 *
 * @description Tests des schémas Zod pour validation des données Team
 *
 * @ticket SP-153
 */

import { describe, it, expect } from 'vitest'
import {
  createTeamSchema,
  updateTeamSchema,
  teamFiltersSchema,
  teamMemberSchema,
  teamMembersSchema,
  assignManagerSchema,
  DEFAULT_TEAM_COLOR,
  TEAM_COLOR_PALETTE,
  getTeamInitials,
  formatMembersCount,
  getFullName,
} from '@/lib/validations/team'

// ============================================================================
// Tests createTeamSchema
// ============================================================================

describe('createTeamSchema', () => {
  const VALID_COMPANY_ID = 'cltest00000000000company1'
  const VALID_MANAGER_ID = 'cltest00000000000manager1'

  it('should validate valid team data with minimal fields', () => {
    const validData = {
      name: 'Equipe Dev',
      companyId: VALID_COMPANY_ID,
    }

    const result = createTeamSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Equipe Dev')
      expect(result.data.companyId).toBe(VALID_COMPANY_ID)
      expect(result.data.color).toBe(DEFAULT_TEAM_COLOR) // Default value
    }
  })

  it('should validate valid team data with all fields', () => {
    const validData = {
      name: 'Equipe Marketing',
      description: 'Equipe responsable du marketing',
      color: '#10B981',
      companyId: VALID_COMPANY_ID,
      managerId: VALID_MANAGER_ID,
    }

    const result = createTeamSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.color).toBe('#10B981')
      expect(result.data.managerId).toBe(VALID_MANAGER_ID)
    }
  })

  it('should require name with minimum 2 characters', () => {
    const invalidData = {
      name: 'A',
      companyId: VALID_COMPANY_ID,
    }

    const result = createTeamSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('2 caractères')
    }
  })

  it('should require name with maximum 100 characters', () => {
    const invalidData = {
      name: 'A'.repeat(101),
      companyId: VALID_COMPANY_ID,
    }

    const result = createTeamSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should trim whitespace from name', () => {
    const data = {
      name: '  Equipe Test  ',
      companyId: VALID_COMPANY_ID,
    }

    const result = createTeamSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Equipe Test')
    }
  })

  it('should validate hex color format', () => {
    const invalidColors = ['red', '#GGG', '3B82F6', '#3B82F']

    for (const color of invalidColors) {
      const result = createTeamSchema.safeParse({
        name: 'Test',
        companyId: VALID_COMPANY_ID,
        color,
      })
      expect(result.success).toBe(false)
    }
  })

  it('should accept valid hex colors', () => {
    const validColors = ['#3B82F6', '#10B981', '#ffffff', '#000000']

    for (const color of validColors) {
      const result = createTeamSchema.safeParse({
        name: 'Test',
        companyId: VALID_COMPANY_ID,
        color,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should require valid CUID for companyId', () => {
    const invalidData = {
      name: 'Test',
      companyId: 'invalid-id',
    }

    const result = createTeamSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept empty string for managerId', () => {
    const data = {
      name: 'Test',
      companyId: VALID_COMPANY_ID,
      managerId: '',
    }

    const result = createTeamSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept null for managerId', () => {
    const data = {
      name: 'Test',
      companyId: VALID_COMPANY_ID,
      managerId: null,
    }

    const result = createTeamSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject description over 500 characters', () => {
    const data = {
      name: 'Test',
      companyId: VALID_COMPANY_ID,
      description: 'A'.repeat(501),
    }

    const result = createTeamSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('500')
    }
  })
})

// ============================================================================
// Tests updateTeamSchema
// ============================================================================

describe('updateTeamSchema', () => {
  const VALID_ID = 'cltest000000000000team001'
  const VALID_MANAGER_ID = 'cltest00000000000manager1'

  it('should require id field', () => {
    const invalidData = {
      name: 'Updated Name',
    }

    const result = updateTeamSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should validate with only id', () => {
    const data = {
      id: VALID_ID,
    }

    const result = updateTeamSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should allow partial updates', () => {
    const data = {
      id: VALID_ID,
      name: 'New Name',
      // No other fields required
    }

    const result = updateTeamSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('New Name')
      expect(result.data.color).toBeUndefined()
    }
  })

  it('should validate managerId when provided', () => {
    const data = {
      id: VALID_ID,
      managerId: VALID_MANAGER_ID,
    }

    const result = updateTeamSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should allow removing manager with null', () => {
    const data = {
      id: VALID_ID,
      managerId: null,
    }

    const result = updateTeamSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Tests teamMemberSchema
// ============================================================================

describe('teamMemberSchema', () => {
  const VALID_TEAM_ID = 'cltest000000000000team001'
  const VALID_EMP_ID = 'cltest0000000000000emp001'

  it('should validate valid member data', () => {
    const data = {
      teamId: VALID_TEAM_ID,
      employeeId: VALID_EMP_ID,
    }

    const result = teamMemberSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require teamId', () => {
    const data = {
      employeeId: VALID_EMP_ID,
    }

    const result = teamMemberSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should require employeeId', () => {
    const data = {
      teamId: VALID_TEAM_ID,
    }

    const result = teamMemberSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should require valid CUID format', () => {
    const data = {
      teamId: 'invalid',
      employeeId: 'invalid',
    }

    const result = teamMemberSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Tests teamMembersSchema
// ============================================================================

describe('teamMembersSchema', () => {
  const VALID_TEAM_ID = 'cltest000000000000team001'
  const VALID_EMP_ID = 'cltest0000000000000emp001'
  const VALID_EMP_ID_2 = 'cltest0000000000000emp002'

  it('should validate multiple employee IDs', () => {
    const data = {
      teamId: VALID_TEAM_ID,
      employeeIds: [VALID_EMP_ID, VALID_EMP_ID_2],
    }

    const result = teamMembersSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require at least one employee', () => {
    const data = {
      teamId: VALID_TEAM_ID,
      employeeIds: [],
    }

    const result = teamMembersSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Tests assignManagerSchema
// ============================================================================

describe('assignManagerSchema', () => {
  const VALID_TEAM_ID = 'cltest000000000000team001'
  const VALID_MANAGER_ID = 'cltest00000000000manager1'

  it('should validate with manager ID', () => {
    const data = {
      teamId: VALID_TEAM_ID,
      managerId: VALID_MANAGER_ID,
    }

    const result = assignManagerSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should validate with null manager (remove)', () => {
    const data = {
      teamId: VALID_TEAM_ID,
      managerId: null,
    }

    const result = assignManagerSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should validate with empty string manager', () => {
    const data = {
      teamId: VALID_TEAM_ID,
      managerId: '',
    }

    const result = assignManagerSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Tests teamFiltersSchema
// ============================================================================

describe('teamFiltersSchema', () => {
  const VALID_COMPANY_ID = 'cltest00000000000company1'
  const VALID_MANAGER_ID = 'cltest00000000000manager1'

  it('should accept empty object', () => {
    const result = teamFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate search filter', () => {
    const result = teamFiltersSchema.safeParse({ search: 'test' })
    expect(result.success).toBe(true)
  })

  it('should validate companyId filter', () => {
    const result = teamFiltersSchema.safeParse({ companyId: VALID_COMPANY_ID })
    expect(result.success).toBe(true)
  })

  it('should validate managerId filter', () => {
    const result = teamFiltersSchema.safeParse({ managerId: VALID_MANAGER_ID })
    expect(result.success).toBe(true)
  })

  it('should validate hasNoManager filter', () => {
    const result = teamFiltersSchema.safeParse({ hasNoManager: true })
    expect(result.success).toBe(true)
  })

  it('should validate includeEmpty filter', () => {
    const result = teamFiltersSchema.safeParse({ includeEmpty: false })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Tests Constants
// ============================================================================

describe('Constants', () => {
  it('DEFAULT_TEAM_COLOR should be valid hex', () => {
    expect(DEFAULT_TEAM_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('TEAM_COLOR_PALETTE should have valid colors', () => {
    expect(TEAM_COLOR_PALETTE.length).toBeGreaterThan(0)

    for (const color of TEAM_COLOR_PALETTE) {
      expect(color.value).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(color.label).toBeTruthy()
    }
  })
})

// ============================================================================
// Tests Helper Functions
// ============================================================================

describe('Helper functions', () => {
  describe('getTeamInitials', () => {
    it('should return first letter of single word', () => {
      expect(getTeamInitials('Development')).toBe('D')
    })

    it('should return first letters of each word', () => {
      expect(getTeamInitials('Equipe Dev')).toBe('ED')
    })

    it('should limit to 2 characters', () => {
      expect(getTeamInitials('A B C D')).toBe('AB')
    })

    it('should handle single character name', () => {
      expect(getTeamInitials('A')).toBe('A')
    })

    it('should return uppercase', () => {
      expect(getTeamInitials('equipe dev')).toBe('ED')
    })
  })

  describe('formatMembersCount', () => {
    it('should return "Aucun membre" for 0', () => {
      expect(formatMembersCount(0)).toBe('Aucun membre')
    })

    it('should return "1 membre" for 1', () => {
      expect(formatMembersCount(1)).toBe('1 membre')
    })

    it('should return plural for >1', () => {
      expect(formatMembersCount(5)).toBe('5 membres')
    })
  })

  describe('getFullName', () => {
    it('should combine first and last name', () => {
      expect(
        getFullName({ firstName: 'Jean', lastName: 'Dupont' })
      ).toBe('Jean Dupont')
    })

    it('should handle empty strings', () => {
      expect(
        getFullName({ firstName: '', lastName: 'Dupont' })
      ).toBe(' Dupont')
    })
  })
})
