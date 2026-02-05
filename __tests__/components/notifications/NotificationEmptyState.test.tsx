/**
 * Tests pour le composant NotificationEmptyState
 *
 * @ticket SP-323
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { NotificationEmptyState } from '@/components/notifications/NotificationEmptyState'

describe('NotificationEmptyState', () => {
  it('devrait afficher le titre par défaut', () => {
    render(<NotificationEmptyState />)

    expect(screen.getByText('Aucune notification')).toBeInTheDocument()
  })

  it('devrait afficher la description par défaut', () => {
    render(<NotificationEmptyState />)

    expect(screen.getByText('Vous êtes à jour !')).toBeInTheDocument()
  })

  it('devrait afficher un titre personnalisé', () => {
    render(<NotificationEmptyState title="Pas de messages" />)

    expect(screen.getByText('Pas de messages')).toBeInTheDocument()
  })

  it('devrait afficher une description personnalisée', () => {
    render(<NotificationEmptyState description="Revenez plus tard" />)

    expect(screen.getByText('Revenez plus tard')).toBeInTheDocument()
  })

  it('devrait avoir le data-testid correct', () => {
    render(<NotificationEmptyState />)

    expect(screen.getByTestId('notification-empty-state')).toBeInTheDocument()
  })

  it("devrait afficher l'icône Bell", () => {
    const { container } = render(<NotificationEmptyState />)

    // L'icône Bell devrait être présente
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })
})
