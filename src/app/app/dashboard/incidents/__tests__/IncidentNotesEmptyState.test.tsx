/**
 * Tests unitaires pour IncidentNotesEmptyState
 *
 * @ticket SP-426
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IncidentNotesEmptyState } from '../_components/IncidentNotesEmptyState'

describe('IncidentNotesEmptyState', () => {
  it("affiche le message d'état vide", () => {
    render(<IncidentNotesEmptyState onCreateNote={vi.fn()} canCreate={true} />)
    expect(screen.getByText("Aucune note d'incident")).toBeInTheDocument()
  })

  it('affiche le bouton créer si canCreate=true', () => {
    render(<IncidentNotesEmptyState onCreateNote={vi.fn()} canCreate={true} />)
    expect(
      screen.getByTestId('empty-state-create-button')
    ).toBeInTheDocument()
    expect(screen.getByText('Nouvelle note')).toBeInTheDocument()
  })

  it('masque le bouton créer si canCreate=false', () => {
    render(<IncidentNotesEmptyState onCreateNote={vi.fn()} canCreate={false} />)
    expect(
      screen.queryByTestId('empty-state-create-button')
    ).not.toBeInTheDocument()
  })

  it('affiche le message approprié pour canCreate=true', () => {
    render(<IncidentNotesEmptyState onCreateNote={vi.fn()} canCreate={true} />)
    expect(
      screen.getByText(/Créez votre première note/)
    ).toBeInTheDocument()
  })

  it('affiche le message approprié pour canCreate=false', () => {
    render(<IncidentNotesEmptyState onCreateNote={vi.fn()} canCreate={false} />)
    expect(
      screen.getByText(/Aucune note visible pour le moment/)
    ).toBeInTheDocument()
  })

  it('appelle onCreateNote au clic sur le bouton', () => {
    const onCreateNote = vi.fn()
    render(
      <IncidentNotesEmptyState onCreateNote={onCreateNote} canCreate={true} />
    )
    fireEvent.click(screen.getByTestId('empty-state-create-button'))
    expect(onCreateNote).toHaveBeenCalled()
  })

  it('a le data-testid empty-state', () => {
    render(<IncidentNotesEmptyState onCreateNote={vi.fn()} canCreate={true} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })
})
