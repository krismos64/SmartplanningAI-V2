/**
 * Tests unitaires pour les schémas de validation Company
 *
 * @description Tests des schémas Zod pour validation des données Company
 *
 * @ticket SP-151
 */

import { describe, it, expect } from 'vitest'
import {
  createCompanySchema,
  updateCompanySchema,
  companyFiltersSchema,
  subscriptionPlanEnum,
  subscriptionStatusEnum,
  subscriptionPlanLabels,
  subscriptionStatusLabels,
} from '@/lib/validations/company'

describe('subscriptionPlanEnum', () => {
  it('should accept valid plan values', () => {
    expect(subscriptionPlanEnum.parse('FREE')).toBe('FREE')
    expect(subscriptionPlanEnum.parse('STARTER')).toBe('STARTER')
    expect(subscriptionPlanEnum.parse('BUSINESS')).toBe('BUSINESS')
    expect(subscriptionPlanEnum.parse('ENTERPRISE')).toBe('ENTERPRISE')
  })

  it('should reject invalid plan values', () => {
    expect(() => subscriptionPlanEnum.parse('INVALID')).toThrow()
    expect(() => subscriptionPlanEnum.parse('')).toThrow()
  })
})

describe('subscriptionStatusEnum', () => {
  it('should accept valid status values', () => {
    expect(subscriptionStatusEnum.parse('TRIAL')).toBe('TRIAL')
    expect(subscriptionStatusEnum.parse('ACTIVE')).toBe('ACTIVE')
    expect(subscriptionStatusEnum.parse('PAST_DUE')).toBe('PAST_DUE')
    expect(subscriptionStatusEnum.parse('CANCELED')).toBe('CANCELED')
    expect(subscriptionStatusEnum.parse('EXPIRED')).toBe('EXPIRED')
  })

  it('should reject invalid status values', () => {
    expect(() => subscriptionStatusEnum.parse('INVALID')).toThrow()
    expect(() => subscriptionStatusEnum.parse('CANCELLED')).toThrow() // UK spelling
  })
})

describe('createCompanySchema', () => {
  it('should validate valid company data', () => {
    const validData = {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+33123456789',
      address: '123 Rue Test, Paris',
      timezone: 'Europe/Paris',
      subscriptionPlan: 'BUSINESS',
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    }

    const result = createCompanySchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should require name with minimum 2 characters', () => {
    const invalidData = { name: 'A' }
    const result = createCompanySchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })

  it('should require name with maximum 100 characters', () => {
    const invalidData = { name: 'A'.repeat(101) }
    const result = createCompanySchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })

  it('should allow empty email', () => {
    const validData = { name: 'Test Company', email: '' }
    const result = createCompanySchema.safeParse(validData)

    expect(result.success).toBe(true)
  })

  it('should reject invalid email format', () => {
    const invalidData = { name: 'Test Company', email: 'invalid-email' }
    const result = createCompanySchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })

  it('should accept valid email format', () => {
    const validData = { name: 'Test Company', email: 'valid@email.com' }
    const result = createCompanySchema.safeParse(validData)

    expect(result.success).toBe(true)
  })

  it('should allow optional fields to be omitted', () => {
    const minimalData = { name: 'Test Company' }
    const result = createCompanySchema.safeParse(minimalData)

    expect(result.success).toBe(true)
  })

  it('should validate subscription plan enum', () => {
    const invalidData = { name: 'Test', subscriptionPlan: 'INVALID_PLAN' }
    const result = createCompanySchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })

  it('should validate subscription status enum', () => {
    const invalidData = { name: 'Test', subscriptionStatus: 'INVALID_STATUS' }
    const result = createCompanySchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })
})

describe('updateCompanySchema', () => {
  it('should require id field', () => {
    const invalidData = { name: 'Updated Name' }
    const result = updateCompanySchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })

  it('should validate with id and name', () => {
    // ID must be a valid CUID format
    const validData = { id: 'clp1234567890abcdefghij', name: 'Updated Name' }
    const result = updateCompanySchema.safeParse(validData)

    expect(result.success).toBe(true)
  })

  it('should allow partial updates', () => {
    const validData = { id: 'clp1234567890abcdefghij', email: 'new@email.com' }
    const result = updateCompanySchema.safeParse(validData)

    expect(result.success).toBe(true)
  })

  it('should validate email format on update', () => {
    const invalidData = { id: 'clp1234567890abcdefghij', email: 'invalid-email' }
    const result = updateCompanySchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })

  it('should reject invalid CUID format for id', () => {
    const invalidData = { id: 'invalid-id-format', name: 'Test' }
    const result = updateCompanySchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })
})

describe('companyFiltersSchema', () => {
  it('should validate empty filters', () => {
    const result = companyFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate search string', () => {
    const result = companyFiltersSchema.safeParse({ search: 'acme' })
    expect(result.success).toBe(true)
  })

  it('should validate subscription plan filter', () => {
    const result = companyFiltersSchema.safeParse({ subscriptionPlan: 'BUSINESS' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid subscription plan filter', () => {
    const result = companyFiltersSchema.safeParse({ subscriptionPlan: 'INVALID' })
    expect(result.success).toBe(false)
  })

  it('should validate subscription status filter', () => {
    const result = companyFiltersSchema.safeParse({ subscriptionStatus: 'ACTIVE' })
    expect(result.success).toBe(true)
  })

  it('should validate isActive boolean filter', () => {
    const result = companyFiltersSchema.safeParse({ isActive: true })
    expect(result.success).toBe(true)
  })

  it('should validate multiple filters together', () => {
    const result = companyFiltersSchema.safeParse({
      search: 'acme',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    })
    expect(result.success).toBe(true)
  })
})

describe('subscriptionPlanLabels', () => {
  it('should have labels for all plans', () => {
    expect(subscriptionPlanLabels.FREE).toBe('Gratuit')
    expect(subscriptionPlanLabels.STARTER).toBe('Starter')
    expect(subscriptionPlanLabels.BUSINESS).toBe('Business')
    expect(subscriptionPlanLabels.ENTERPRISE).toBe('Entreprise')
  })
})

describe('subscriptionStatusLabels', () => {
  it('should have labels for all statuses', () => {
    expect(subscriptionStatusLabels.TRIAL).toBe("Période d'essai")
    expect(subscriptionStatusLabels.ACTIVE).toBe('Actif')
    expect(subscriptionStatusLabels.PAST_DUE).toBe('Paiement en retard')
    expect(subscriptionStatusLabels.CANCELED).toBe('Annulé')
    expect(subscriptionStatusLabels.EXPIRED).toBe('Expiré')
  })
})
