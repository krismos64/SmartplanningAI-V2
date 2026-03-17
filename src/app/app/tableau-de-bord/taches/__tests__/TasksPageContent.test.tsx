/**
 * Tests unitaires pour TasksPageContent
 *
 * @ticket SP-419
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock des actions
vi.mock('@/lib/actions/personal-tasks', () => ({
  createPersonalTask: vi.fn(),
  updatePersonalTask: vi.fn(),
  deletePersonalTask: vi.fn(),
  togglePersonalTask: vi.fn(),
  reorderPersonalTasks: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock use-media-query
vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: vi.fn().mockReturnValue(true), // Desktop by default
}))

import { TasksPageContent } from '../_components/TasksPageContent'
import { togglePersonalTask } from '@/lib/actions/personal-tasks'

// ============================================================================
// Fixtures
// ============================================================================

const mockTasks = [
  {
    id: 'task-1',
    title: 'Première tâche',
    description: 'Description de la première tâche',
    dueDate: new Date('2026-02-15'),
    completed: false,
    order: 0,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    title: 'Deuxième tâche',
    description: null,
    dueDate: null,
    completed: true,
    order: 1,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// ============================================================================
// Tests
// ============================================================================

describe('TasksPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le header et le badge privacy', () => {
    render(<TasksPageContent initialTasks={mockTasks} />)

    expect(
      screen.getByRole('heading', { name: /notes perso/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/vos notes sont privées/i)).toBeInTheDocument()
  })

  it('affiche la liste des tâches', () => {
    render(<TasksPageContent initialTasks={mockTasks} />)

    expect(screen.getByText('Première tâche')).toBeInTheDocument()
    expect(screen.getByText('Deuxième tâche')).toBeInTheDocument()
  })

  it("affiche l'empty state si aucune tâche", () => {
    render(<TasksPageContent initialTasks={[]} />)

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText(/aucune tâche/i)).toBeInTheDocument()
  })

  it('ouvre le modal au clic sur "Nouvelle tâche"', async () => {
    render(<TasksPageContent initialTasks={mockTasks} />)

    const createButton = screen.getByTestId('create-task-button')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByTestId('task-form')).toBeInTheDocument()
    })
  })

  it('gère le toggle completed', async () => {
    const firstTask = mockTasks[0]!
    vi.mocked(togglePersonalTask).mockResolvedValue({
      success: true,
      data: { ...firstTask, completed: true },
    })

    render(<TasksPageContent initialTasks={mockTasks} />)

    const checkbox = screen.getByTestId('checkbox-task-1')
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(togglePersonalTask).toHaveBeenCalledWith('task-1')
    })
  })
})
