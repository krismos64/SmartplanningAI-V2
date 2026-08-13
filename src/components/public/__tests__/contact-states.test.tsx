/**
 * Tests des etats du formulaire de contact
 *
 * Ces deux etats avaient ete ecrits pour un fond sombre, du temps ou la
 * section contact posait sur un aplat bleu nuit : `text-white`,
 * `bg-white/5`, vert emeraude pour le succes et rouge pour l'erreur.
 *
 * Depuis la refonte ils s'affichent sur la carte creme de `/contact`, ou le
 * blanc est illisible. Le defaut ne se voit qu'apres un envoi reussi ou une
 * panne reseau, deux etats qu'aucun parcours de verification ne traverse :
 * ni axe-core, ni les specs E2E, ni un coup d'oeil a la page.
 *
 * @ticket SP-574
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ContactSuccessState } from '../ContactSuccessState'
import { ContactErrorState } from '../ContactErrorState'

/**
 * Classes qui trahissent un habillage pense pour un fond sombre, ou une
 * couleur hors palette publique.
 */
const DARK_GROUND = /text-white|bg-white\/|border-white\/|emerald-\d|red-\d/

describe('ContactSuccessState', () => {
  it('nomme la personne et annonce l envoi', () => {
    render(<ContactSuccessState name="Chloé" onReset={() => {}} />)

    expect(screen.getByText(/Merci Chloé/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('ne porte aucune classe prevue pour un fond sombre', () => {
    const { container } = render(
      <ContactSuccessState name="Chloé" onReset={() => {}} />
    )

    expect(container.innerHTML).not.toMatch(DARK_GROUND)
  })
})

describe('ContactErrorState', () => {
  it('affiche le message d erreur recu', () => {
    render(
      <ContactErrorState message="Service indisponible" onRetry={() => {}} />
    )

    expect(screen.getByText('Service indisponible')).toBeInTheDocument()
  })

  it('ne porte aucune classe prevue pour un fond sombre', () => {
    const { container } = render(
      <ContactErrorState message="Service indisponible" onRetry={() => {}} />
    )

    expect(container.innerHTML).not.toMatch(DARK_GROUND)
  })
})
