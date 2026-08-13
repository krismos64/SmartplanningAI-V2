/**
 * Tests des primitives de l'identite publique
 *
 * Couvre ce qui casserait le SEO ou l'accessibilite si une future refonte
 * modifiait ces composants :
 * - le niveau de titre reste configurable, un h1 n'est jamais impose
 * - les numeros decoratifs sont masques aux technologies d'assistance
 * - la seconde ligne des titres reste dans le texte accessible
 *
 * @ticket SP-565
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DisplayTitle } from '../DisplayTitle'
import { SectionLabel } from '../SectionLabel'
import { BentoCard } from '../BentoCard'

describe('DisplayTitle', () => {
  it('rend un h2 par defaut, le h1 restant un choix explicite', () => {
    render(<DisplayTitle>Moins d&apos;outils</DisplayTitle>)

    expect(
      screen.getByRole('heading', { level: 2, name: /moins d'outils/i })
    ).toBeInTheDocument()
  })

  it.each(['h1', 'h2', 'h3'] as const)('rend le niveau %s demande', (level) => {
    const expectedLevel = Number(level.slice(1))

    render(<DisplayTitle as={level}>Titre de section</DisplayTitle>)

    expect(
      screen.getByRole('heading', { level: expectedLevel })
    ).toBeInTheDocument()
  })

  it('ne fige pas un h1 : deux titres peuvent coexister sans doublon de niveau', () => {
    render(
      <>
        <DisplayTitle as="h1">Titre de page</DisplayTitle>
        <DisplayTitle as="h2">Titre de section</DisplayTitle>
      </>
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
  })

  it('inclut la seconde ligne dans le nom accessible du titre', () => {
    render(<DisplayTitle accent="Plus de clarte.">Moins d&apos;outils.</DisplayTitle>)

    // Le nom accessible doit porter les deux registres : un moteur ou un
    // lecteur d'ecran lit le titre complet, pas seulement sa premiere ligne
    expect(
      screen.getByRole('heading', { name: /moins d'outils\.\s*plus de clarte\./i })
    ).toBeInTheDocument()
  })

  it('accepte un id, pour un aria-labelledby porte par la section', () => {
    render(
      <DisplayTitle as="h2" id="securite">
        Les donnees restent dans leur perimetre
      </DisplayTitle>
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute(
      'id',
      'securite'
    )
  })
})

describe('SectionLabel', () => {
  it('formate le rang sur deux chiffres', () => {
    const { container } = render(<SectionLabel index={7}>Securite</SectionLabel>)

    expect(container.textContent).toContain('07')
  })

  it('masque le numero decoratif aux technologies d assistance', () => {
    const { container } = render(<SectionLabel index={1}>Le produit</SectionLabel>)

    const badge = container.querySelector('[aria-hidden="true"]')
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('01')
  })

  it('conserve l intitule lisible', () => {
    render(<SectionLabel index={2}>Le produit</SectionLabel>)

    expect(screen.getByText('Le produit')).toBeInTheDocument()
  })
})

describe('BentoCard', () => {
  it('rend son contenu', () => {
    render(
      <BentoCard>
        <p>Conges sans echanges disperses</p>
      </BentoCard>
    )

    expect(screen.getByText('Conges sans echanges disperses')).toBeInTheDocument()
  })

  it('masque le rang et le filet decoratifs', () => {
    const { container } = render(
      <BentoCard index={3}>
        <p>Contenu</p>
      </BentoCard>
    )

    const decorations = container.querySelectorAll('[aria-hidden="true"]')
    // Le filet et le numero sont tous deux decoratifs
    expect(decorations).toHaveLength(2)
  })

  it('n impose pas de niveau de titre a son contenu', () => {
    render(
      <BentoCard>
        <h3>Taches personnelles</h3>
      </BentoCard>
    )

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })
})
