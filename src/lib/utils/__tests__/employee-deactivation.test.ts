/**
 * @ticket SP-611
 */

import { describe, it, expect } from 'vitest'
import { getDeactivationBlock } from '../employee-deactivation'

describe('getDeactivationBlock', () => {
  it('bloque sa propre fiche', () => {
    expect(
      getDeactivationBlock({ userId: 'u1', user: { role: 'MANAGER' } }, 'u1')
    ).toBe('Vous ne pouvez pas désactiver votre propre fiche')
  })

  it("bloque la fiche d'un dirigeant", () => {
    expect(
      getDeactivationBlock({ userId: 'u2', user: { role: 'DIRECTOR' } }, 'u1')
    ).toBe("La fiche d'un dirigeant ne peut pas être désactivée")
  })

  it('laisse passer un collaborateur', () => {
    expect(
      getDeactivationBlock({ userId: 'u3', user: { role: 'EMPLOYEE' } }, 'u1')
    ).toBeNull()
  })

  it('laisse passer une fiche sans compte', () => {
    expect(getDeactivationBlock({ userId: null, user: null }, 'u1')).toBeNull()
  })
})
