/**
 * @ticket SP-616
 */

import { describe, it, expect } from 'vitest'
import { compareGridEmployees, type GridOrderable } from '../grid-order'

const e = (
  firstName: string,
  lastName: string,
  teamName: string | null = null
): GridOrderable => ({ firstName, lastName, teamName })

const ordre = (list: GridOrderable[]) =>
  [...list]
    .sort(compareGridEmployees)
    .map((x) => `${x.firstName} ${x.lastName}`)

describe('compareGridEmployees', () => {
  it('range par équipe, puis nom, puis prénom', () => {
    expect(
      ordre([
        e('Laura', 'Failepain', 'Vendeuse Turckheim'),
        e('Marie Noëlle', 'Parmentier', 'Vendeuse kaysersberg'),
        e('Charlotte', 'Parmentier', 'Vendeuse Turckheim'),
      ])
    ).toEqual([
      'Marie Noëlle Parmentier', // kaysersberg avant Turckheim, sans tenir compte de la casse
      'Laura Failepain',
      'Charlotte Parmentier',
    ])
  })

  it('met les employés sans équipe à la fin', () => {
    expect(
      ordre([
        e('Didem', 'Bouchera'),
        e('Carl', 'Carl', 'Vendeuse Turckheim'),
        e('Nathalie', 'Carl'),
      ])
    ).toEqual(['Carl Carl', 'Didem Bouchera', 'Nathalie Carl'])
  })

  it('compare sans équipe après avec équipe, dans les deux sens', () => {
    // Un tri peut tomber juste par hasard avec un comparateur incohérent :
    // on vérifie le signe dans les deux sens.
    const sans = e('Aaron', 'Aaron')
    const avec = e('Zoé', 'Zola', 'Vente')
    expect(compareGridEmployees(sans, avec)).toBeGreaterThan(0)
    expect(compareGridEmployees(avec, sans)).toBeLessThan(0)
  })

  it('départage par prénom à nom égal, et ignore les accents pour le rang', () => {
    expect(
      ordre([e('Éric', 'Durand'), e('Anne', 'Durand'), e('Zoé', 'Dupont')])
    ).toEqual(['Zoé Dupont', 'Anne Durand', 'Éric Durand'])
  })

  it('ne colle plus nom et prénom : « Dupon Tim » ne passe pas après « Dupont Alice »', () => {
    // L'ancien tri comparait « DupontAlice » à « DuponTim »
    expect(ordre([e('Alice', 'Dupont'), e('Tim', 'Dupon')])).toEqual([
      'Tim Dupon',
      'Alice Dupont',
    ])
  })
})
