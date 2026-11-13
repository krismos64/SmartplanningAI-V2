/**
 * Verrou de planification par employé (SP-619)
 *
 * La concurrence elle-même est prouvée sur une vraie base par
 * `__tests__/integration/schedule-concurrency.test.ts`. Ici, les deux
 * propriétés qui la rendent possible, vérifiables sans base : l'ordre de prise
 * des verrous et le niveau d'isolation.
 *
 * @ticket SP-619
 */

import { describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import {
  lockEmployeesForScheduling,
  SCHEDULE_TRANSACTION_OPTIONS,
} from '../schedule-lock'

function fakeTx() {
  const keys: string[] = []
  const tx = {
    $executeRaw: vi.fn((_sql: TemplateStringsArray, key: string) => {
      keys.push(key)
      return Promise.resolve(1)
    }),
  }
  return { tx: tx as unknown as Prisma.TransactionClient, keys }
}

describe('SP-619, lockEmployeesForScheduling', () => {
  it('verrouille dans un ordre fixe, quel que soit l’ordre reçu', async () => {
    const first = fakeTx()
    const second = fakeTx()

    await lockEmployeesForScheduling(first.tx, ['clempB', 'clempA', 'clempC'])
    await lockEmployeesForScheduling(second.tx, ['clempC', 'clempA', 'clempB'])

    // Deux créations groupées prennent les mêmes verrous dans le même ordre :
    // aucune ne peut tenir celui que l'autre attend
    expect(first.keys).toEqual([
      'schedule:clempA',
      'schedule:clempB',
      'schedule:clempC',
    ])
    expect(second.keys).toEqual(first.keys)
  })

  it('ne prend qu’une fois le verrou d’un employé répété', async () => {
    const { tx, keys } = fakeTx()

    await lockEmployeesForScheduling(tx, ['clempA', 'clempA'])

    expect(keys).toEqual(['schedule:clempA'])
  })

  it('pose un verrou de transaction, relâché au commit', async () => {
    const { tx } = fakeTx()

    await lockEmployeesForScheduling(tx, ['clempA'])

    const sql = vi.mocked(tx.$executeRaw).mock.calls[0]?.[0] as
      | TemplateStringsArray
      | undefined
    expect(sql?.join('?')).toContain('pg_advisory_xact_lock')
  })
})

describe('SP-619, SCHEDULE_TRANSACTION_OPTIONS', () => {
  it('lit en ReadCommitted, sans quoi le verrou ne protège de rien', () => {
    // Le client global impose Serializable : l'instantané pris pendant
    // l'attente du verrou masquait le créneau écrit par l'appel précédent
    expect(SCHEDULE_TRANSACTION_OPTIONS.isolationLevel).toBe(
      Prisma.TransactionIsolationLevel.ReadCommitted
    )
  })
})
