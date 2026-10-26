/**
 * @ticket SP-613
 */

import { describe, it, expect } from 'vitest'
import { resolveTeamPrefill } from '../team-prefill'

const TEAMS = [{ id: 'cl000000000000000000team1' }]

describe('resolveTeamPrefill', () => {
  it('retient une équipe autorisée et construit le retour vers ses membres', () => {
    expect(resolveTeamPrefill('cl000000000000000000team1', TEAMS)).toEqual({
      teamId: 'cl000000000000000000team1',
      returnTo: '/app/director/teams/cl000000000000000000team1/members',
    })
  })

  it('ignore une équipe hors de la liste autorisée (autre entreprise, autre manager)', () => {
    expect(resolveTeamPrefill('cl000000000000000000team2', TEAMS)).toBeNull()
  })

  it('ignore un paramètre absent ou répété', () => {
    expect(resolveTeamPrefill(undefined, TEAMS)).toBeNull()
    expect(
      resolveTeamPrefill(['cl000000000000000000team1', 'x'], TEAMS)
    ).toBeNull()
  })

  it("n'accepte pas une URL déguisée en identifiant", () => {
    expect(resolveTeamPrefill('https://evil.example', TEAMS)).toBeNull()
  })
})
