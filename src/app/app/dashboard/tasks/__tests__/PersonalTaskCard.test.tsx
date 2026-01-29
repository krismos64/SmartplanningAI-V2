/**
 * Tests unitaires pour PersonalTaskCard
 *
 * @ticket SP-419
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock @dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => null,
    },
  },
}))

import { PersonalTaskCard } from '../_components/PersonalTaskCard'

// ============================================================================
// Fixtures
// ============================================================================

const baseTask = {
  id: 'task-1',
  title: 'Ma tâche test',
  description: 'Description de la tâche pour les tests unitaires',
  dueDate: null,
  completed: false,
  order: 0,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockHandlers = {
  onToggle: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

// ============================================================================
// Tests
// ============================================================================

describe('PersonalTaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre de la tâche', () => {
    render(<PersonalTaskCard task={baseTask} {...mockHandlers} />)

    expect(screen.getByText('Ma tâche test')).toBeInTheDocument()
  })

  it('affiche la description tronquée', () => {
    const longDescription = 'A'.repeat(150)
    const task = { ...baseTask, description: longDescription }

    render(<PersonalTaskCard task={task} {...mockHandlers} />)

    const displayedText = screen.getByTestId(`task-description-${task.id}`)
    expect(displayedText.textContent).toContain('...')
    expect(displayedText.textContent?.length).toBeLessThan(150)
  })

  it('affiche le badge date correctement - passée', () => {
    const pastDate = new Date('2020-01-01')
    const task = { ...baseTask, dueDate: pastDate }

    render(<PersonalTaskCard task={task} {...mockHandlers} />)

    expect(screen.getByText('En retard')).toBeInTheDocument()
  })

  it("affiche le badge date correctement - aujourd'hui", () => {
    const today = new Date()
    const task = { ...baseTask, dueDate: today }

    render(<PersonalTaskCard task={task} {...mockHandlers} />)

    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument()
  })

  it('affiche le badge date correctement - futur', () => {
    const futureDate = new Date('2030-06-15')
    const task = { ...baseTask, dueDate: futureDate }

    render(<PersonalTaskCard task={task} {...mockHandlers} />)

    expect(screen.getByText('15 juin')).toBeInTheDocument()
  })

  it('checkbox toggle le completed', () => {
    render(<PersonalTaskCard task={baseTask} {...mockHandlers} />)

    const checkbox = screen.getByTestId('checkbox-task-1')
    fireEvent.click(checkbox)

    expect(mockHandlers.onToggle).toHaveBeenCalledWith('task-1')
  })

  it('style barré quand completed', () => {
    const completedTask = { ...baseTask, completed: true }

    render(<PersonalTaskCard task={completedTask} {...mockHandlers} />)

    const title = screen.getByTestId('task-title-task-1')
    expect(title).toHaveClass('line-through')
  })

  it('bouton éditer appelle onEdit', () => {
    render(<PersonalTaskCard task={baseTask} {...mockHandlers} />)

    const editButton = screen.getByTestId('edit-button-task-1')
    fireEvent.click(editButton)

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(baseTask)
  })

  it('bouton supprimer appelle onDelete', () => {
    render(<PersonalTaskCard task={baseTask} {...mockHandlers} />)

    const deleteButton = screen.getByTestId('delete-button-task-1')
    fireEvent.click(deleteButton)

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('task-1')
  })

  it("n'affiche pas le badge date si completed", () => {
    const task = {
      ...baseTask,
      completed: true,
      dueDate: new Date('2020-01-01'),
    }

    render(<PersonalTaskCard task={task} {...mockHandlers} />)

    expect(screen.queryByTestId('date-badge-task-1')).not.toBeInTheDocument()
  })
})
