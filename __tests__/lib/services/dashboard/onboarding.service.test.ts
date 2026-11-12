/**
 * Tests unitaires pour onboarding.service.ts
 *
 * La checklist de démarrage cochait « Ajouter votre premier employé » dès
 * l'inscription : le dirigeant a sa propre fiche, et le compteur valait 1.
 * Le comptage exclut désormais sa fiche, sans perdre les employés sans compte.
 *
 * @ticket SP-625
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Prisma } from '@prisma/client'

const { employeeCount } = vi.hoisted(() => ({
  employeeCount: vi.fn<(args: Prisma.EmployeeCountArgs) => Promise<number>>(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { employee: { count: employeeCount } },
}))

import { countEmployeesBesidesUser } from '@/lib/services/dashboard/onboarding.service'

const COMPANY_ID = 'cl000000000000000company1'
const DIRECTOR_ID = 'cl00000000000000director1'

function lastWhere(): Prisma.EmployeeWhereInput {
  const args = employeeCount.mock.calls.at(-1)?.[0]
  if (!args?.where) throw new Error('employee.count appelé sans where')
  return args.where
}

describe('countEmployeesBesidesUser', () => {
  beforeEach(() => {
    employeeCount.mockReset()
  })

  it("renvoie le nombre de fiches autres que celle de l'utilisateur", async () => {
    employeeCount.mockResolvedValue(3)

    await expect(
      countEmployeesBesidesUser(COMPANY_ID, DIRECTOR_ID)
    ).resolves.toBe(3)
  })

  it("borne le comptage à l'entreprise et aux fiches actives", async () => {
    employeeCount.mockResolvedValue(0)

    await countEmployeesBesidesUser(COMPANY_ID, DIRECTOR_ID)

    const where = lastWhere()
    expect(where.companyId).toBe(COMPANY_ID)
    expect(where.isActive).toBe(true)
  })

  /**
   * Un `NOT: { userId }` exclurait en SQL les employés sans compte
   * (`NOT (NULL = $1)` vaut NULL), c'est-à-dire ceux que le dirigeant ajoute.
   * L'étape resterait alors ouverte pour toujours.
   */
  it('compte les employés sans compte utilisateur (userId NULL)', async () => {
    employeeCount.mockResolvedValue(0)

    await countEmployeesBesidesUser(COMPANY_ID, DIRECTOR_ID)

    const where = lastWhere()
    expect(where.NOT).toBeUndefined()
    expect(where.OR).toEqual([
      { userId: null },
      { userId: { not: DIRECTOR_ID } },
    ])
  })
})
