/**
 * Tests unitaires pour HealthStatusBadge
 *
 * Couvre les 3 statuts × couleur + texte, latence optionnelle, aria-label.
 *
 * @ticket SP-464
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthStatusBadge } from '../HealthStatusBadge'

describe('HealthStatusBadge', () => {
  // Statut healthy --------------------------------------------------------

  it('affiche "Opérationnel" pour le statut healthy', () => {
    render(<HealthStatusBadge status="healthy" />)
    expect(screen.getByText('Opérationnel')).toBeInTheDocument()
  })

  it('a un background vert pour healthy', () => {
    render(<HealthStatusBadge status="healthy" />)
    const badge = screen.getByTestId('health-status-badge')
    expect(badge.className).toContain('emerald')
  })

  // Statut degraded -------------------------------------------------------

  it('affiche "Dégradé" pour le statut degraded', () => {
    render(<HealthStatusBadge status="degraded" />)
    expect(screen.getByText('Dégradé')).toBeInTheDocument()
  })

  it('a un background ambre pour degraded', () => {
    render(<HealthStatusBadge status="degraded" />)
    const badge = screen.getByTestId('health-status-badge')
    expect(badge.className).toContain('amber')
  })

  // Statut unhealthy ------------------------------------------------------

  it('affiche "Hors service" pour le statut unhealthy', () => {
    render(<HealthStatusBadge status="unhealthy" />)
    expect(screen.getByText('Hors service')).toBeInTheDocument()
  })

  it('a un background rose pour unhealthy', () => {
    render(<HealthStatusBadge status="unhealthy" />)
    const badge = screen.getByTestId('health-status-badge')
    expect(badge.className).toContain('rose')
  })

  // Latence ---------------------------------------------------------------

  it('affiche la latence quand fournie', () => {
    render(<HealthStatusBadge status="healthy" latency={42} />)
    expect(screen.getByText('(42ms)')).toBeInTheDocument()
  })

  it("n'affiche pas la latence quand non fournie", () => {
    render(<HealthStatusBadge status="healthy" />)
    expect(screen.queryByText(/ms\)/)).not.toBeInTheDocument()
  })

  // Accessibilité ---------------------------------------------------------

  it('a un role=status et un aria-label', () => {
    render(<HealthStatusBadge status="healthy" />)
    const badge = screen.getByTestId('health-status-badge')
    expect(badge).toHaveAttribute('role', 'status')
    expect(badge).toHaveAttribute('aria-label', 'Statut système : Opérationnel')
  })
})
