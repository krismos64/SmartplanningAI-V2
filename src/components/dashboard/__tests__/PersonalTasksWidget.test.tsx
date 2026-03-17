/**
 * Tests unitaires pour PersonalTasksWidget
 *
 * @ticket SP-420
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock togglePersonalTask
vi.mock('@/lib/actions/personal-tasks', () => ({
  togglePersonalTask: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import {
  PersonalTasksWidget,
  PersonalTasksWidgetSkeleton,
} from '../PersonalTasksWidget'
import { togglePersonalTask } from '@/lib/actions/personal-tasks'
import { toast } from 'sonner'

// ============================================================================
// Fixtures
// ============================================================================

const mockTasks = [
  {
    id: 'task-1',
    title: 'Première tâche',
    description: 'Description',
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
    completed: false,
    order: 1,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-3',
    title: 'Troisième tâche avec date passée',
    description: null,
    dueDate: new Date('2020-01-01'),
    completed: false,
    order: 2,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockTaskToday = {
  id: 'task-today',
  title: 'Tâche du jour',
  description: null,
  dueDate: new Date(),
  completed: false,
  order: 0,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ============================================================================
// Tests
// ============================================================================

describe('PersonalTasksWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre du widget', () => {
    render(<PersonalTasksWidget initialTasks={mockTasks} />)

    expect(screen.getByText('Notes perso')).toBeInTheDocument()
  })

  it('affiche le badge de confidentialité', () => {
    render(<PersonalTasksWidget initialTasks={mockTasks} />)

    expect(screen.getByText('Vos notes sont privées')).toBeInTheDocument()
  })

  it('affiche la liste des tâches', () => {
    render(<PersonalTasksWidget initialTasks={mockTasks} />)

    expect(screen.getByText('Première tâche')).toBeInTheDocument()
    expect(screen.getByText('Deuxième tâche')).toBeInTheDocument()
    expect(
      screen.getByText('Troisième tâche avec date passée')
    ).toBeInTheDocument()
  })

  it("affiche le empty state quand il n'y a pas de tâches", () => {
    render(<PersonalTasksWidget initialTasks={[]} />)

    expect(screen.getByTestId('widget-empty-state')).toBeInTheDocument()
    expect(screen.getByText('Aucune tâche en cours')).toBeInTheDocument()
  })

  it('affiche le bouton Ajouter', () => {
    render(<PersonalTasksWidget initialTasks={mockTasks} />)

    const addButton = screen.getByTestId('widget-add-task-link')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveAttribute('href', '/app/dashboard/tasks')
  })

  it('affiche le badge En retard pour une date passée', () => {
    const taskWithPastDate = mockTasks[2]!
    render(<PersonalTasksWidget initialTasks={[taskWithPastDate]} />)

    expect(screen.getByText('En retard')).toBeInTheDocument()
  })

  it("affiche le badge Aujourd'hui pour une date du jour", () => {
    render(<PersonalTasksWidget initialTasks={[mockTaskToday]} />)

    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument()
  })

  it('affiche le compteur de tâches restantes', () => {
    render(
      <PersonalTasksWidget
        initialTasks={mockTasks.slice(0, 2)}
        totalPendingCount={5}
      />
    )

    expect(screen.getByText('+3 autres tâches')).toBeInTheDocument()
  })

  it("n'affiche pas le compteur si pas de tâches supplémentaires", () => {
    render(
      <PersonalTasksWidget initialTasks={mockTasks} totalPendingCount={3} />
    )

    expect(screen.queryByText(/\+\d+ autre/)).not.toBeInTheDocument()
  })

  it('toggle la tâche au clic sur checkbox', async () => {
    const firstTask = mockTasks[0]!
    vi.mocked(togglePersonalTask).mockResolvedValue({
      success: true,
      data: { ...firstTask, completed: true },
    })

    render(<PersonalTasksWidget initialTasks={mockTasks} />)

    const checkbox = screen.getByTestId('widget-checkbox-task-1')
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(togglePersonalTask).toHaveBeenCalledWith('task-1')
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Tâche terminée !')
    })
  })

  it('affiche une erreur si le toggle échoue', async () => {
    vi.mocked(togglePersonalTask).mockResolvedValue({
      success: false,
      error: 'Erreur serveur',
    })

    render(<PersonalTasksWidget initialTasks={mockTasks} />)

    const checkbox = screen.getByTestId('widget-checkbox-task-1')
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erreur serveur')
    })
  })

  it('affiche le lien Gérer mes tâches', () => {
    render(
      <PersonalTasksWidget initialTasks={mockTasks} totalPendingCount={3} />
    )

    expect(screen.getByTestId('widget-manage-link')).toBeInTheDocument()
  })
})

describe('PersonalTasksWidgetSkeleton', () => {
  it('affiche les éléments de skeleton', () => {
    render(<PersonalTasksWidgetSkeleton />)

    // Le skeleton devrait avoir des éléments visuels
    const skeletons = document.querySelectorAll('[class*="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
