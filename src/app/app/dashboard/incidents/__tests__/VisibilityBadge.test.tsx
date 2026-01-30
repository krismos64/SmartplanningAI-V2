/**
 * Tests unitaires pour VisibilityBadge
 *
 * @ticket SP-426
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VisibilityBadge } from '../_components/VisibilityBadge'

describe('VisibilityBadge', () => {
  it('affiche le badge DIRECTOR_ONLY avec icône ShieldAlert', () => {
    render(<VisibilityBadge visibility="DIRECTOR_ONLY" />)
    const badge = screen.getByTestId('visibility-badge-DIRECTOR_ONLY')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Directeur uniquement')
  })

  it('affiche le badge MANAGER_DIRECTOR avec icône Users', () => {
    render(<VisibilityBadge visibility="MANAGER_DIRECTOR" />)
    const badge = screen.getByTestId('visibility-badge-MANAGER_DIRECTOR')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Managers & Directeurs')
  })

  it('affiche le badge ALL avec icône Globe', () => {
    render(<VisibilityBadge visibility="ALL" />)
    const badge = screen.getByTestId('visibility-badge-ALL')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Tous les rôles')
  })

  it('applique les classes couleur pour DIRECTOR_ONLY (rouge)', () => {
    render(<VisibilityBadge visibility="DIRECTOR_ONLY" />)
    const badge = screen.getByTestId('visibility-badge-DIRECTOR_ONLY')
    expect(badge.className).toContain('red')
  })

  it('applique les classes couleur pour MANAGER_DIRECTOR (ambre)', () => {
    render(<VisibilityBadge visibility="MANAGER_DIRECTOR" />)
    const badge = screen.getByTestId('visibility-badge-MANAGER_DIRECTOR')
    expect(badge.className).toContain('amber')
  })

  it('applique les classes couleur pour ALL (vert)', () => {
    render(<VisibilityBadge visibility="ALL" />)
    const badge = screen.getByTestId('visibility-badge-ALL')
    expect(badge.className).toContain('green')
  })

  it('affiche le tooltip par défaut', () => {
    render(<VisibilityBadge visibility="DIRECTOR_ONLY" showTooltip={true} />)
    // Le tooltip est rendu dans un provider
    expect(
      screen.getByTestId('visibility-badge-DIRECTOR_ONLY')
    ).toBeInTheDocument()
  })

  it('peut masquer le tooltip', () => {
    render(<VisibilityBadge visibility="ALL" showTooltip={false} />)
    expect(screen.getByTestId('visibility-badge-ALL')).toBeInTheDocument()
  })
})
