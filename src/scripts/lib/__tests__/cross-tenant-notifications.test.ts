/**
 * Tests de la sélection des notifications de congé cross-tenant
 *
 * Ces assertions protègent une suppression définitive en production : un faux
 * positif détruirait des notifications légitimes, un faux négatif laisserait
 * en base des données d'une autre entreprise.
 */

import { describe, it, expect } from 'vitest'

import {
  selectCrossTenantNotifications,
  type LeaveNotificationRow,
} from '../cross-tenant-notifications'

const COMPANY_A = 'clcompanyaaaaaaaaaa1'
const COMPANY_B = 'clcompanybbbbbbbbbb1'
const LEAVE_ID = 'clleave00000000001'

const notification = (
  overrides: Partial<LeaveNotificationRow> = {}
): LeaveNotificationRow => ({
  id: 'clnotif000000000001',
  companyId: COMPANY_A,
  relatedId: LEAVE_ID,
  ...overrides,
})

describe('selectCrossTenantNotifications', () => {
  it('retient une notification rattachée à une demande d’une autre entreprise', () => {
    const rows = [notification({ companyId: COMPANY_B })]
    const leaves = new Map([[LEAVE_ID, COMPANY_A]])

    expect(selectCrossTenantNotifications(rows, leaves)).toHaveLength(1)
  })

  it('épargne une notification légitime (même entreprise)', () => {
    const rows = [notification({ companyId: COMPANY_A })]
    const leaves = new Map([[LEAVE_ID, COMPANY_A]])

    expect(selectCrossTenantNotifications(rows, leaves)).toEqual([])
  })

  it('épargne une notification dont la demande a été supprimée', () => {
    // relatedId orphelin : rien ne prouve la fuite, on n'y touche pas
    const rows = [notification({ companyId: COMPANY_B })]
    const leaves = new Map<string, string>()

    expect(selectCrossTenantNotifications(rows, leaves)).toEqual([])
  })

  it('retient une notification au companyId NULL sur une demande rattachée', () => {
    // Piège SQL : `NULL <> 'x'` vaut NULL (donc faux). En SQL il faut
    // `IS DISTINCT FROM`, en TypeScript `null !== 'x'` est bien vrai.
    const rows = [notification({ companyId: null })]
    const leaves = new Map([[LEAVE_ID, COMPANY_A]])

    expect(selectCrossTenantNotifications(rows, leaves)).toHaveLength(1)
  })

  it('épargne une notification sans relatedId', () => {
    const rows = [notification({ relatedId: null })]
    const leaves = new Map([[LEAVE_ID, COMPANY_A]])

    expect(selectCrossTenantNotifications(rows, leaves)).toEqual([])
  })

  it('ne retient que les fuites dans un lot mixte', () => {
    const OTHER_LEAVE = 'clleave00000000002'
    const rows = [
      notification({ id: 'legitime', companyId: COMPANY_A }),
      notification({ id: 'fuite', companyId: COMPANY_B }),
      notification({
        id: 'orpheline',
        companyId: COMPANY_B,
        relatedId: 'clleave00000000099',
      }),
      notification({
        id: 'fuite-autre-demande',
        companyId: COMPANY_A,
        relatedId: OTHER_LEAVE,
      }),
    ]
    const leaves = new Map([
      [LEAVE_ID, COMPANY_A],
      [OTHER_LEAVE, COMPANY_B],
    ])

    const result = selectCrossTenantNotifications(rows, leaves)

    expect(result.map((n) => n.id)).toEqual(['fuite', 'fuite-autre-demande'])
  })

  it('est idempotent : un second passage ne retient plus rien', () => {
    const rows = [notification({ companyId: COMPANY_B })]
    const leaves = new Map([[LEAVE_ID, COMPANY_A]])

    const leaked = selectCrossTenantNotifications(rows, leaves)
    const remaining = rows.filter((r) => !leaked.includes(r))

    expect(selectCrossTenantNotifications(remaining, leaves)).toEqual([])
  })
})
