/**
 * Tests unitaires pour PersonalTaskForm
 *
 * @ticket SP-419
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock use-media-query
vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: vi.fn().mockReturnValue(true), // Desktop by default
}))

import { PersonalTaskForm } from '../_components/PersonalTaskForm'

// ============================================================================
// Fixtures
// ============================================================================

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  task: null,
  onSubmit: vi.fn(),
  isSubmitting: false,
}

const existingTask = {
  id: 'task-1',
  title: 'Tâche existante',
  description: 'Description existante',
  dueDate: new Date('2026-03-15'),
  completed: false,
  order: 0,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ============================================================================
// Tests
// ============================================================================

describe('PersonalTaskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les champs du formulaire', () => {
    render(<PersonalTaskForm {...defaultProps} />)

    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument()
    expect(screen.getByTestId('task-duedate-input')).toBeInTheDocument()
  })

  it('validation : titre requis', async () => {
    render(<PersonalTaskForm {...defaultProps} />)

    const submitButton = screen.getByTestId('task-submit-button')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/titre.*requis/i)).toBeInTheDocument()
    })
  })

  it('validation : titre max 200 caractères', async () => {
    const user = userEvent.setup()
    render(<PersonalTaskForm {...defaultProps} />)

    const titleInput = screen.getByTestId('task-title-input')
    await user.type(titleInput, 'a'.repeat(201))

    const submitButton = screen.getByTestId('task-submit-button')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/200 caractères/i)).toBeInTheDocument()
    })
  })

  it('soumission création avec données valides', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<PersonalTaskForm {...defaultProps} onSubmit={onSubmit} />)

    const titleInput = screen.getByTestId('task-title-input')
    await user.type(titleInput, 'Nouvelle tâche')

    const submitButton = screen.getByTestId('task-submit-button')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nouvelle tâche',
        })
      )
    })
  })

  it('soumission édition avec task existante', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <PersonalTaskForm
        {...defaultProps}
        task={existingTask}
        onSubmit={onSubmit}
      />
    )

    // Le titre devrait être pré-rempli
    const titleInput = screen.getByTestId('task-title-input')
    expect(titleInput).toHaveValue('Tâche existante')

    // Modifier le titre
    await user.clear(titleInput)
    await user.type(titleInput, 'Titre modifié')

    const submitButton = screen.getByTestId('task-submit-button')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Titre modifié',
        })
      )
    })
  })

  it('état loading pendant soumission', () => {
    render(<PersonalTaskForm {...defaultProps} isSubmitting={true} />)

    const submitButton = screen.getByTestId('task-submit-button')
    expect(submitButton).toBeDisabled()
  })

  it('fermeture au clic sur Annuler', () => {
    const onOpenChange = vi.fn()
    render(<PersonalTaskForm {...defaultProps} onOpenChange={onOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    fireEvent.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
