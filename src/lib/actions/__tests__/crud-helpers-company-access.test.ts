/**
 * Tests unitaires pour canAccessCompanyEntity (signature nullable SP-517)
 *
 * @ticket SP-520
 */

import { describe, it, expect } from 'vitest'
import { canAccessCompanyEntity } from '../crud-helpers'

describe('canAccessCompanyEntity — SP-520', () => {
  it('retourne true pour SYSTEM_ADMIN (userCompanyId null)', () => {
    expect(canAccessCompanyEntity(null, 'cl000000000000000000comp1')).toBe(true)
  })

  it('retourne true pour SYSTEM_ADMIN même avec entityCompanyId null', () => {
    expect(canAccessCompanyEntity(null, null)).toBe(true)
  })

  it('retourne false pour un non-admin sur une conv admin (entityCompanyId null)', () => {
    expect(canAccessCompanyEntity('cl000000000000000000comp1', null)).toBe(false)
  })

  it('retourne true quand userCompanyId correspond à entityCompanyId', () => {
    expect(
      canAccessCompanyEntity(
        'cl000000000000000000comp1',
        'cl000000000000000000comp1'
      )
    ).toBe(true)
  })

  it('retourne false quand les companyIds diffèrent', () => {
    expect(
      canAccessCompanyEntity(
        'cl000000000000000000comp1',
        'cl000000000000000000comp2'
      )
    ).toBe(false)
  })
})
