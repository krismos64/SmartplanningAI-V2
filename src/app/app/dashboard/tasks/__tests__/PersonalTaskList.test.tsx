/**
 * Tests unitaires pour PersonalTaskList
 *
 * @ticket SP-419
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn().mockReturnValue([]),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: vi.fn(),
  restrictToParentElement: vi.fn(),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => null,
    },
  },
}))

import { PersonalTaskList } from '../_components/PersonalTaskList'

// ============================================================================
// Fixtures
// ============================================================================

const mockTasks = [
  {
    id: 'task-1',
    title: 'Première tâche',
    description: null,
    dueDate: null,
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
]

const mockHandlers = {
  onReorder: vi.fn(),
  onToggle: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onCreateTask: vi.fn(),
}

// ============================================================================
// Tests
// ============================================================================

describe('PersonalTaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les tâches', () => {
    render(<PersonalTaskList tasks={mockTasks} {...mockHandlers} />)

    expect(screen.getByText('Première tâche')).toBeInTheDocument()
    expect(screen.getByText('Deuxième tâche')).toBeInTheDocument()
  })

  it('affiche le DndContext', () => {
    render(<PersonalTaskList tasks={mockTasks} {...mockHandlers} />)

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('affiche le SortableContext', () => {
    render(<PersonalTaskList tasks={mockTasks} {...mockHandlers} />)

    expect(screen.getByTestId('sortable-context')).toBeInTheDocument()
  })

  it('empty state si liste vide', () => {
    render(<PersonalTaskList tasks={[]} {...mockHandlers} />)

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('affiche le conteneur de liste', () => {
    render(<PersonalTaskList tasks={mockTasks} {...mockHandlers} />)

    expect(screen.getByTestId('task-list')).toBeInTheDocument()
  })
})
